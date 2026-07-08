
// ================= VOICE / VIDEO CALLING (WebRTC + Supabase Realtime) =================
const CALL_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }
];
let _callState = 'idle'; // idle | calling | ringing | connected
let _callId = null;
let _callIsVideo = false;
let _callIsInitiator = false;
let _callPeerUuid = null;
let _callPeerLocalId = null;
let _callPc = null;
let _callLocalStream = null;
let _callSignalChannel = null;   // per-call channel: 'call:'+callId
let _callInboxChannel = null;    // personal inbox channel: 'call:'+ME.uuid, joined at login
let _callPendingOffer = null;    // {callId, from, fromLocalId, isVideo, offer}
let _callMuted = false;
let _callCamOff = false;
let _callTimerInterval = null;
let _callTimerStart = null;
let _callNoAnswerTimeout = null;
let _callRingAudioCtx = null;
let _callRingInterval = null;

function _callGetUser(localId){ try { return getUser(localId); } catch(e){ return null; } }

// ---- personal inbox channel: listens for incoming call invites ----
function sbSubscribeCallSignaling(){
  if(!SUPABASE_CONFIGURED || !ME.uuid) return;
  try { if(_callInboxChannel) sb.removeChannel(_callInboxChannel); } catch(e){}
  _callInboxChannel = sb.channel('call:'+ME.uuid, { config:{ broadcast:{ self:false } } })
    .on('broadcast', { event:'ring' }, async (msg)=>{
      const p = msg.payload || {};
      if(!p.callId || !p.from) return;
      if(_callState !== 'idle'){
        // Busy — tell caller immediately, don't ring here
        _callSendBusy(p.callId);
        return;
      }
      try { await _ensureProfilesByIds([p.from]); } catch(e){}
      const localId = uuidToLocalId(p.from);
      _callPendingOffer = { callId:p.callId, from:p.from, fromLocalId:localId, isVideo:!!p.isVideo, offer:p.offer };
      _showIncomingCallUI(localId, !!p.isVideo);
    })
    .subscribe();
}

function _callSendBusy(callId){
  try {
    const ch = sb.channel('call:'+callId, { config:{ broadcast:{ self:false } } });
    ch.subscribe((status)=>{
      if(status==='SUBSCRIBED'){
        ch.send({ type:'broadcast', event:'busy', payload:{ from:ME.uuid } });
        setTimeout(()=>{ try{ sb.removeChannel(ch); }catch(e){} }, 800);
      }
    });
  } catch(e){}
}

// ---- Outgoing call ----
async function callUser(){ startOutgoingCall(false); }
async function videoCallUser(){ startOutgoingCall(true); }

async function startOutgoingCall(isVideo){
  if(!SUPABASE_CONFIGURED || !ME.uuid){ showToast(t('toasts.k162')); return; }
  if(_callState !== 'idle'){ showToast(t('toasts.k163')); return; }
  if(isFriendGroupChat(selectedChat) || selectedChat===0){ showToast(t('toasts.k164')); return; }
  const user = _callGetUser(selectedChat);
  if(!user || !user.uuid){ showToast(t('toasts.k165')); return; }
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    showToast(t('toasts.k166')); return;
  }

  _callId = (crypto.randomUUID ? crypto.randomUUID() : ('c'+Date.now()+Math.random().toString(36).slice(2)));
  _callIsVideo = isVideo;
  _callIsInitiator = true;
  _callPeerUuid = user.uuid;
  _callPeerLocalId = selectedChat;
  _callState = 'calling';

  try {
    _callLocalStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:isVideo });
  } catch(e){
    showToast(t('toasts.k167'));
    _resetCallState();
    return;
  }

  _showCallUI(_callPeerLocalId, isVideo, 'outgoing');
  _setupPeerConnection();
  _callLocalStream.getTracks().forEach(t=>_callPc.addTrack(t, _callLocalStream));
  if(isVideo){
    const lv = document.getElementById('callLocalVideo');
    lv.srcObject = _callLocalStream; lv.classList.remove('hidden');
  }

  _callSignalChannel = sb.channel('call:'+_callId, { config:{ broadcast:{ self:false } } })
    .on('broadcast', { event:'answer' }, async (msg)=>{
      const p = msg.payload||{};
      if(!p.sdp) return;
      try {
        await _callPc.setRemoteDescription(new RTCSessionDescription(p.sdp));
        _callState = 'connected';
        _startCallTimer();
        document.getElementById('callStatusText').textContent = _callIsVideo ? 'ভিডিও কল' : 'কলে আছো';
        document.getElementById('callAvatarBig').classList.remove('pulsing');
        _stopRingback();
        clearTimeout(_callNoAnswerTimeout);
      } catch(e){}
    })
    .on('broadcast', { event:'ice' }, async (msg)=>{
      const p = msg.payload||{};
      if(p.candidate && _callPc){ try { await _callPc.addIceCandidate(new RTCIceCandidate(p.candidate)); } catch(e){} }
    })
    .on('broadcast', { event:'end' }, (msg)=>{ _handleRemoteEnd((msg.payload||{}).reason || 'ended'); })
    .on('broadcast', { event:'busy' }, ()=>{ _handleRemoteEnd('busy'); })
    .subscribe();

  // Create the offer, then send the ring to the CALLEE's personal inbox channel (they're already subscribed there)
  try {
    const offer = _callPc.localDescription || await _callPc.createOffer();
    if(!_callPc.localDescription) await _callPc.setLocalDescription(offer);
    const ringCh = sb.channel('call:'+_callPeerUuid, { config:{ broadcast:{ self:false } } });
    ringCh.subscribe((status)=>{
      if(status==='SUBSCRIBED'){
        ringCh.send({ type:'broadcast', event:'ring', payload:{
          callId:_callId, from:ME.uuid, isVideo:isVideo, offer:_callPc.localDescription
        }});
        setTimeout(()=>{ try{ sb.removeChannel(ringCh); }catch(e){} }, 1500);
      }
    });
  } catch(e){}

  _startRingback();
  _callNoAnswerTimeout = setTimeout(()=>{
    if(_callState==='calling'){ _handleRemoteEnd('noanswer'); }
  }, 30000);
}

// ---- Incoming call UI ----
function _showIncomingCallUI(localId, isVideo){
  _callState = 'ringing';
  _callIsVideo = isVideo;
  _callPeerLocalId = localId;
  const user = _callGetUser(localId);
  _showCallUI(localId, isVideo, 'incoming');
  document.getElementById('callStatusText').textContent = isVideo ? 'ইনকামিং ভিডিও কল...' : 'ইনকামিং কল...';
  _startRingback();
  if(navigator.vibrate) navigator.vibrate([400,200,400,200,400]);
}

async function acceptIncomingCall(){
  const pending = _callPendingOffer;
  if(!pending){ return; }
  _stopRingback();
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia){
    showToast(t('toasts.k166')); declineIncomingCall(); return;
  }
  try {
    _callLocalStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:pending.isVideo });
  } catch(e){
    showToast(t('toasts.k167'));
    declineIncomingCall();
    return;
  }
  _callId = pending.callId;
  _callPeerUuid = pending.from;
  _callPeerLocalId = pending.fromLocalId;
  _callIsInitiator = false;

  _setupPeerConnection();
  _callLocalStream.getTracks().forEach(t=>_callPc.addTrack(t, _callLocalStream));
  if(pending.isVideo){
    const lv = document.getElementById('callLocalVideo');
    lv.srcObject = _callLocalStream; lv.classList.remove('hidden');
  }

  document.getElementById('callIncomingActions').classList.add('hidden');
  document.getElementById('callActiveControls').classList.remove('hidden');
  document.getElementById('callStatusText').textContent = 'কানেক্ট হচ্ছে...';

  _callSignalChannel = sb.channel('call:'+_callId, { config:{ broadcast:{ self:false } } })
    .on('broadcast', { event:'ice' }, async (msg)=>{
      const p = msg.payload||{};
      if(p.candidate && _callPc){ try { await _callPc.addIceCandidate(new RTCIceCandidate(p.candidate)); } catch(e){} }
    })
    .on('broadcast', { event:'end' }, (msg)=>{ _handleRemoteEnd((msg.payload||{}).reason || 'ended'); })
    .subscribe(async (status)=>{
      if(status==='SUBSCRIBED'){
        try {
          await _callPc.setRemoteDescription(new RTCSessionDescription(pending.offer));
          const answer = await _callPc.createAnswer();
          await _callPc.setLocalDescription(answer);
          _callSignalChannel.send({ type:'broadcast', event:'answer', payload:{ sdp:_callPc.localDescription } });
          _callState = 'connected';
          _startCallTimer();
          document.getElementById('callStatusText').textContent = _callIsVideo ? 'ভিডিও কল' : 'কলে আছো';
          document.getElementById('callAvatarBig').classList.remove('pulsing');
        } catch(e){ _handleRemoteEnd('error'); }
      }
    });

  _callPendingOffer = null;
}

function declineIncomingCall(){
  const pending = _callPendingOffer;
  _stopRingback();
  if(navigator.vibrate) navigator.vibrate(0);
  if(pending){
    try {
      const ch = sb.channel('call:'+pending.callId, { config:{ broadcast:{ self:false } } });
      ch.subscribe((status)=>{
        if(status==='SUBSCRIBED'){
          ch.send({ type:'broadcast', event:'end', payload:{ reason:'declined', from:ME.uuid } });
          setTimeout(()=>{ try{ sb.removeChannel(ch); }catch(e){} }, 800);
        }
      });
    } catch(e){}
    if(pending.from) sbInsertNotification(pending.from, 'call_missed', ME.uuid, null, `${ME.name||'তুমি'} কল রিসিভ করোনি`);
  }
  _callPendingOffer = null;
  _resetCallState();
}

// ---- Shared peer connection setup ----
function _setupPeerConnection(){
  _callPc = new RTCPeerConnection({ iceServers: CALL_ICE_SERVERS });
  _callPc.onicecandidate = (e)=>{
    if(e.candidate && _callSignalChannel){
      try { _callSignalChannel.send({ type:'broadcast', event:'ice', payload:{ candidate:e.candidate } }); } catch(err){}
    }
  };
  _callPc.ontrack = (e)=>{
    if(_callIsVideo){
      const rv = document.getElementById('callRemoteVideo');
      rv.srcObject = e.streams[0]; rv.classList.remove('hidden');
    } else {
      const ra = document.getElementById('callRemoteAudio');
      ra.srcObject = e.streams[0];
    }
  };
  _callPc.onconnectionstatechange = ()=>{
    if(_callPc && (_callPc.connectionState==='failed' || _callPc.connectionState==='disconnected')){
      if(_callState==='connected') _handleRemoteEnd('dropped');
    }
  };
}

// ---- UI helpers ----
function _showCallUI(localId, isVideo, mode){
  const user = _callGetUser(localId);
  const screen = document.getElementById('callScreen');
  screen.classList.remove('hidden');
  const dc = (typeof getDeptColor==='function' && user) ? getDeptColor(user.dept) : '#6C63FF';
  const av = document.getElementById('callAvatarBig');
  av.innerHTML = user ? user.avatar : '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/></svg>';
  av.style.background = `linear-gradient(135deg,${dc},${dc}88)`;
  av.classList.add('pulsing');
  document.getElementById('callPeerName').textContent = user ? (getDMNickname(user.id)||user.name) : 'ইউজার';
  document.getElementById('callTimer').classList.add('hidden');
  document.getElementById('callTimer').textContent = '00:00';
  document.getElementById('callRemoteVideo').classList.add('hidden');
  document.getElementById('callLocalVideo').classList.add('hidden');
  document.getElementById('callMuteBtn').innerHTML = '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"/><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"/></svg>';
  document.getElementById('callCamBtn').innerHTML = '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg>';
  document.getElementById('callCamBtn').classList.toggle('hidden', !isVideo);
  _callMuted = false; _callCamOff = false;

  if(mode==='incoming'){
    document.getElementById('callIncomingActions').classList.remove('hidden');
    document.getElementById('callActiveControls').classList.add('hidden');
  } else {
    document.getElementById('callIncomingActions').classList.add('hidden');
    document.getElementById('callActiveControls').classList.remove('hidden');
    document.getElementById('callStatusText').textContent = isVideo ? 'ভিডিও কল করা হচ্ছে...' : 'রিং হচ্ছে...';
  }
}

function _startCallTimer(){
  _callTimerStart = Date.now();
  document.getElementById('callTimer').classList.remove('hidden');
  clearInterval(_callTimerInterval);
  _callTimerInterval = setInterval(()=>{
    const s = Math.floor((Date.now()-_callTimerStart)/1000);
    const mm = String(Math.floor(s/60)).padStart(2,'0');
    const ss = String(s%60).padStart(2,'0');
    document.getElementById('callTimer').textContent = mm+':'+ss;
  }, 1000);
}

function toggleCallMute(){
  if(!_callLocalStream) return;
  _callMuted = !_callMuted;
  _callLocalStream.getAudioTracks().forEach(t=>t.enabled = !_callMuted);
  const btn = document.getElementById('callMuteBtn');
  btn.innerHTML = _callMuted ? '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"/><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"/></svg>' : '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z\"/><path d=\"M19 10v2a7 7 0 0 1-14 0v-2\"/><line x1=\"12\" y1=\"19\" x2=\"12\" y2=\"23\"/><line x1=\"8\" y1=\"23\" x2=\"16\" y2=\"23\"/></svg>';
  btn.classList.toggle('active-toggle', _callMuted);
}

function toggleCallCamera(){
  if(!_callLocalStream || !_callIsVideo) return;
  _callCamOff = !_callCamOff;
  _callLocalStream.getVideoTracks().forEach(t=>t.enabled = !_callCamOff);
  const btn = document.getElementById('callCamBtn');
  btn.innerHTML = _callCamOff ? '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg>' : '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z\"/><circle cx=\"12\" cy=\"13\" r=\"4\"/></svg>';
  btn.classList.toggle('active-toggle', _callCamOff);
}

// ---- Ending / cleanup ----
function endCall(reason){
  if(_callSignalChannel){
    try { _callSignalChannel.send({ type:'broadcast', event:'end', payload:{ reason:reason||'ended', from:ME.uuid } }); } catch(e){}
  }
  _resetCallState();
}

function _handleRemoteEnd(reason){
  if(_callState==='idle') return;
  const wasConnected = _callState==='connected';
  let msg = 'কল শেষ হয়েছে';
  if(reason==='declined') msg = 'কল রিসিভ করেনি';
  else if(reason==='busy') msg = 'ব্যস্ত আছে <svg style="vertical-align:-2px;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="1" x2="1" y2="23"/></svg>';
  else if(reason==='noanswer') msg = 'কেউ রিসিভ করলো না';
  else if(reason==='dropped') msg = 'কানেকশন কেটে গেছে';
  showToast(msg);
  if(!wasConnected && _callIsInitiator && _callPeerUuid && (reason==='noanswer' || reason==='dropped')){
    sbInsertNotification(_callPeerUuid, 'call_missed', ME.uuid, null, `${ME.name||'কেউ'} তোমাকে কল করেছিল`);
  }
  _resetCallState();
}

function _resetCallState(){
  clearTimeout(_callNoAnswerTimeout);
  clearInterval(_callTimerInterval);
  _stopRingback();
  if(_callPc){ try{ _callPc.close(); }catch(e){} _callPc=null; }
  if(_callLocalStream){ _callLocalStream.getTracks().forEach(t=>t.stop()); _callLocalStream=null; }
  if(_callSignalChannel){ try{ sb.removeChannel(_callSignalChannel); }catch(e){} _callSignalChannel=null; }
  const ra = document.getElementById('callRemoteAudio'); if(ra) ra.srcObject = null;
  const rv = document.getElementById('callRemoteVideo'); if(rv) rv.srcObject = null;
  const lv = document.getElementById('callLocalVideo'); if(lv) lv.srcObject = null;
  document.getElementById('callScreen').classList.add('hidden');
  _callState = 'idle'; _callId = null; _callIsVideo = false; _callIsInitiator = false;
  _callPeerUuid = null; _callPeerLocalId = null; _callPendingOffer = null;
}

// ---- Simple ringtone via WebAudio (no external asset needed) ----
function _startRingback(){
  _stopRingback();
  try {
    _callRingAudioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const beep = ()=>{
      if(!_callRingAudioCtx) return;
      const osc = _callRingAudioCtx.createOscillator();
      const gain = _callRingAudioCtx.createGain();
      osc.frequency.value = 440; osc.type='sine';
      gain.gain.setValueAtTime(0.0001, _callRingAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.15, _callRingAudioCtx.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, _callRingAudioCtx.currentTime+0.4);
      osc.connect(gain); gain.connect(_callRingAudioCtx.destination);
      osc.start(); osc.stop(_callRingAudioCtx.currentTime+0.45);
    };
    beep();
    _callRingInterval = setInterval(beep, 2000);
  } catch(e){}
}
function _stopRingback(){
  if(_callRingInterval){ clearInterval(_callRingInterval); _callRingInterval=null; }
  if(_callRingAudioCtx){ try{ _callRingAudioCtx.close(); }catch(e){} _callRingAudioCtx=null; }
}

