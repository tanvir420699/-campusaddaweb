
(function(){
  const FILTERS = [
    {id:'none', label:'Normal'}, {id:'p7-filter-sepia', label:'Sepia'},
    {id:'p7-filter-mono', label:'Mono'}, {id:'p7-filter-vivid', label:'Vivid'},
    {id:'p7-filter-warm', label:'Warm'}, {id:'p7-filter-cool', label:'Cool'},
    {id:'p7-filter-dream', label:'Dream'}
  ];
  const STICKER_SET = ['❤️','😂','🔥','💯','😎','🎉','✨','<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 20h20L20 8l-4 4-4-7-4 7-4-4z\"/></svg>','🌈','☕','📚','🎵','<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/></svg>','🥳','😍','🤯'];

  // -------- Modal helper --------
  function p7Modal(html){
    let m = document.getElementById('p7Modal');
    if(!m){
      m = document.createElement('div');
      m.id = 'p7Modal';
      m.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:1200;display:flex;align-items:center;justify-content:center;padding:16px;';
      m.onclick = e=>{ if(e.target===m) closeP7(); };
      m.innerHTML = `<div id="p7ModalBox" style="background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:420px;max-height:85vh;overflow-y:auto;"></div>`;
      document.body.appendChild(m);
    }
    document.getElementById('p7ModalBox').innerHTML = html;
    m.style.display='flex';
  }
  window.closeP7 = function(){ const m=document.getElementById('p7Modal'); if(m) m.style.display='none'; };

  // -------- Inject composer tools --------
  function injectComposerTools(){
    const canvas = document.getElementById('storyCanvas');
    if(!canvas || document.getElementById('p7ComposerRow')) return;
    const row = document.createElement('div');
    row.id = 'p7ComposerRow';
    row.className = 'p7-tools-row';
    row.innerHTML = `
      <button type="button" onclick="p7OpenLink()"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg> Link</button>
      <button type="button" onclick="p7OpenMusic()">🎵 Music</button>
      <button type="button" onclick="p7OpenSticker()">😀 Sticker</button>
      <button type="button" onclick="p7OpenPoll()">📊 Poll</button>
      <button type="button" onclick="p7OpenFilter()"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"13.5\" cy=\"6.5\" r=\".5\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z\"/></svg> Filter</button>
      <button type="button" onclick="p7OpenSchedule()">⏰ Schedule</button>
      <button type="button" onclick="p7OpenAnon()" title="Anonymous view"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg></button>
    `;
    // insert AFTER the canvas
    canvas.parentNode.insertBefore(row, canvas.nextSibling);
  }
  // Watch for creator open — modal DOM refreshes via openInfoModal, so poll.
  setInterval(injectComposerTools, 600);

  // -------- Link --------
  window.p7OpenLink = function(){
    const cur = (_storyDraft && _storyDraft.link_url) || '';
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:10px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg> Story Link</div>
        <input id="p7LinkInput" placeholder="https://..." value="${cur}" style="width:100%;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button onclick="p7SetLink('')" style="flex:1;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">সরাও</button>
          <button onclick="p7SetLink(document.getElementById('p7LinkInput').value)" style="flex:1;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Save</button>
        </div>
      </div>`);
  };
  window.p7SetLink = function(v){ if(_storyDraft) _storyDraft.link_url = (v||'').trim() || null; closeP7(); if(typeof showToast==='function') showToast('<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg> Link saved'); };

  // -------- Music --------
  window.p7OpenMusic = function(){
    const cur = (_storyDraft && _storyDraft.music_url) || '';
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;">🎵 Story Music</div>
        <div style="font-size:11.5px;color:var(--muted2);margin-bottom:10px;">MP3 / audio URL দাও — story দেখার সময় background এ চলবে।</div>
        <input id="p7MusicInput" placeholder="https://.../song.mp3" value="${cur}" style="width:100%;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button onclick="p7SetMusic('')" style="flex:1;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">সরাও</button>
          <button onclick="p7SetMusic(document.getElementById('p7MusicInput').value)" style="flex:1;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Save</button>
        </div>
      </div>`);
  };
  window.p7SetMusic = function(v){ if(_storyDraft) _storyDraft.music_url = (v||'').trim() || null; closeP7(); if(typeof showToast==='function') showToast('🎵 Music saved'); };

  // -------- Sticker --------
  window.p7OpenSticker = function(){
    const items = STICKER_SET.map(e=>`<button onclick="p7AddSticker('${e}')" style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:10px;font-size:26px;cursor:pointer;">${e}</button>`).join('');
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:10px;">😀 Sticker যোগ করো</div>
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;">${items}</div>
        <button onclick="p7ClearStickers()" style="width:100%;margin-top:10px;background:var(--bg3);border:none;border-radius:10px;padding:10px;color:var(--red);font-size:12.5px;font-weight:600;cursor:pointer;font-family:inherit;">সব sticker সরাও</button>
      </div>`);
  };
  window.p7AddSticker = function(emoji){
    if(!_storyDraft) return;
    if(!Array.isArray(_storyDraft.stickers)) _storyDraft.stickers = [];
    // random position in inner 60% area
    _storyDraft.stickers.push({ e:emoji, x: 20+Math.random()*60, y: 30+Math.random()*40 });
    closeP7();
    _renderComposerStickers();
    if(typeof showToast==='function') showToast('Sticker যুক্ত হয়েছে');
  };
  window.p7ClearStickers = function(){ if(_storyDraft) _storyDraft.stickers=[]; closeP7(); _renderComposerStickers(); };
  function _renderComposerStickers(){
    const canvas = document.getElementById('storyCanvas'); if(!canvas || !_storyDraft) return;
    let layer = canvas.querySelector('#p7StickerLayer');
    if(!layer){ layer = document.createElement('div'); layer.id='p7StickerLayer'; layer.style.cssText='position:absolute;inset:0;pointer-events:none;'; canvas.appendChild(layer); }
    layer.innerHTML = (_storyDraft.stickers||[]).map(s=>`<span class="p7-sticker" style="left:${s.x}%;top:${s.y}%;transform:translate(-50%,-50%);">${s.e}</span>`).join('');
  }

  // -------- Poll --------
  window.p7OpenPoll = function(){
    const p = (_storyDraft && _storyDraft.poll) || {q:'',a:'হ্যাঁ',b:'না'};
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:10px;">📊 Poll</div>
        <input id="p7PollQ" placeholder="প্রশ্ন..." value="${(p.q||'').replace(/"/g,'&quot;')}" style="width:100%;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;margin-bottom:8px;">
        <div style="display:flex;gap:8px;">
          <input id="p7PollA" placeholder="Option A" value="${(p.a||'').replace(/"/g,'&quot;')}" style="flex:1;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">
          <input id="p7PollB" placeholder="Option B" value="${(p.b||'').replace(/"/g,'&quot;')}" style="flex:1;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button onclick="p7ClearPoll()" style="flex:1;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">সরাও</button>
          <button onclick="p7SavePoll()" style="flex:1;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Save</button>
        </div>
      </div>`);
  };
  window.p7SavePoll = function(){
    const q = document.getElementById('p7PollQ').value.trim();
    const a = document.getElementById('p7PollA').value.trim() || 'হ্যাঁ';
    const b = document.getElementById('p7PollB').value.trim() || 'না';
    if(!q){ alert('প্রশ্ন লেখো'); return; }
    if(_storyDraft) _storyDraft.poll = { q, a, b };
    closeP7();
    if(typeof showToast==='function') showToast('📊 Poll saved');
  };
  window.p7ClearPoll = function(){ if(_storyDraft) _storyDraft.poll = null; closeP7(); };

  // -------- Filter --------
  window.p7OpenFilter = function(){
    const cur = (_storyDraft && _storyDraft.filter) || 'none';
    const items = FILTERS.map(f=>`<button class="${cur===f.id?'on':''}" onclick="p7SetFilter('${f.id}')">${f.label}</button>`).join('');
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:10px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"13.5\" cy=\"6.5\" r=\".5\"/><circle cx=\"17.5\" cy=\"10.5\" r=\".5\"/><circle cx=\"8.5\" cy=\"7.5\" r=\".5\"/><circle cx=\"6.5\" cy=\"12.5\" r=\".5\"/><path d=\"M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.5-.7 1.5-1.5 0-.4-.2-.8-.4-1.1-.2-.3-.4-.6-.4-1 0-.8.7-1.4 1.5-1.4H16c3.3 0 6-2.7 6-6 0-4.9-4.5-9-10-9z\"/></svg> Filter</div>
        <div class="p7-tools-row">${items}</div>
      </div>`);
  };
  window.p7SetFilter = function(id){
    if(_storyDraft) _storyDraft.filter = id;
    // live preview on composer
    const img = document.getElementById('storyCanvasImg');
    if(img){ FILTERS.forEach(f=>{ if(f.id!=='none') img.classList.remove(f.id); }); if(id!=='none') img.classList.add(id); }
    closeP7();
  };

  // -------- Schedule --------
  window.p7OpenSchedule = function(){
    const cur = (_storyDraft && _storyDraft.scheduled_at) || '';
    // build datetime-local string
    const def = cur ? new Date(cur).toISOString().slice(0,16) : '';
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;">⏰ Schedule Story</div>
        <div style="font-size:11.5px;color:var(--muted2);margin-bottom:10px;">তুমি device-এ থাকা অবস্থায় auto post হবে (client-side scheduler)।</div>
        <input id="p7SchedInput" type="datetime-local" value="${def}" style="width:100%;padding:11px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;">
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button onclick="p7ClearSched()" style="flex:1;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">এখনি পোস্ট</button>
          <button onclick="p7SaveSched()" style="flex:1;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Schedule</button>
        </div>
      </div>`);
  };
  window.p7SaveSched = function(){
    const v = document.getElementById('p7SchedInput').value;
    if(!v){ alert('সময় দাও'); return; }
    const ts = new Date(v).getTime();
    if(ts <= Date.now()+5000){ alert('ভবিষ্যতের সময় দাও'); return; }
    if(_storyDraft) _storyDraft.scheduled_at = new Date(ts).toISOString();
    closeP7();
    if(typeof showToast==='function') showToast('⏰ Scheduled: '+new Date(ts).toLocaleString('bn-BD'));
  };
  window.p7ClearSched = function(){ if(_storyDraft) _storyDraft.scheduled_at = null; closeP7(); };

  // Client-side scheduler queue in localStorage
  const QKEY = 'p7_scheduled_stories';
  function _q(){ try{ return JSON.parse(localStorage.getItem(QKEY)||'[]'); }catch(e){ return []; } }
  function _saveQ(q){ try{ localStorage.setItem(QKEY, JSON.stringify(q)); }catch(e){} }
  window.p7ScheduleStory = function(item){ const q=_q(); q.push({...item, id: 'p7_'+Date.now()}); _saveQ(q); };
  async function _runScheduler(){
    const q = _q(); if(!q.length) return;
    const now = Date.now();
    const ready = q.filter(it => new Date(it.scheduled_at).getTime() <= now);
    const keep  = q.filter(it => new Date(it.scheduled_at).getTime() > now);
    if(!ready.length) return;
    _saveQ(keep);
    for(const it of ready){
      try{
        if(typeof sbInsertStory==='function'){
          const row = await sbInsertStory(it.txt||'', it.draft && it.draft.img, it.style, it.visibility);
          if(row && typeof loadStoriesFromSupabase==='function'){ await loadStoriesFromSupabase(); if(typeof renderStories==='function') renderStories(); }
          if(typeof showToast==='function') showToast('⏰ Scheduled story posted');
          if(typeof notifyStoryMentions==='function') notifyStoryMentions(it.txt||'', row && row.id);
        }
      }catch(e){ console.warn('[p7 sched]', e); }
    }
  }
  setInterval(_runScheduler, 30000);
  setTimeout(_runScheduler, 8000);

  // -------- Anonymous view --------
  window.p7OpenAnon = function(){
    const on = localStorage.getItem('p7_anon_view')==='1';
    p7Modal(`
      <div style="padding:14px;">
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Anonymous Viewer</div>
        <div style="font-size:12px;color:var(--muted2);margin-bottom:12px;">চালু থাকলে অন্যের story দেখলে তোমার নাম viewers list-এ যোগ হবে না।</div>
        <button onclick="p7ToggleAnon()" style="width:100%;background:${on?'linear-gradient(135deg,#F72585,#7209B7)':'linear-gradient(135deg,#06D6A0,#118AB2)'};border:none;border-radius:10px;padding:12px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">${on?'বন্ধ করো':'চালু করো'}</button>
      </div>`);
  };
  window.p7ToggleAnon = function(){
    const on = localStorage.getItem('p7_anon_view')==='1';
    if(on) localStorage.removeItem('p7_anon_view'); else localStorage.setItem('p7_anon_view','1');
    closeP7();
    if(typeof showToast==='function') showToast(on?'<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Anonymous OFF':'<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/></svg> Anonymous ON');
  };

  // -------- Viewer overlays (link, poll, sticker, filter, music) --------
  const _origViewStory = window.viewStory;
  window.viewStory = function(index){
    const r = _origViewStory.apply(this, arguments);
    try{ _paintViewerExtras(stories[index]); }catch(e){ console.warn('[p7 paint]', e); }
    return r;
  };
  function _paintViewerExtras(s){
    const sv = document.getElementById('storyViewer'); if(!sv || !s) return;
    // clear previous
    sv.querySelectorAll('.p7-overlay-link, .p7-poll-box, #p7ViewerStickers, #p7ViewerAudio').forEach(n=>n.remove());
    const viewerImg = document.getElementById('storyViewerImg');
    if(viewerImg){
      FILTERS.forEach(f=>{ if(f.id!=='none') viewerImg.classList.remove(f.id); });
      if(s.filter && s.filter!=='none') viewerImg.classList.add(s.filter);
    }
    // Stickers
    if(Array.isArray(s.stickers) && s.stickers.length){
      const layer = document.createElement('div');
      layer.id = 'p7ViewerStickers';
      layer.style.cssText='position:absolute;inset:0;pointer-events:none;z-index:11;';
      layer.innerHTML = s.stickers.map(st=>`<span class="p7-sticker" style="left:${st.x}%;top:${st.y}%;transform:translate(-50%,-50%);">${st.e}</span>`).join('');
      sv.appendChild(layer);
    }
    // Link
    if(s.link_url){
      const a = document.createElement('a');
      a.className='p7-overlay-link';
      a.href = s.link_url; a.target='_blank'; a.rel='noopener noreferrer';
      a.innerHTML = '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71\"/><path d=\"M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71\"/></svg> Visit link';
      sv.appendChild(a);
    }
    // Poll
    if(s.poll && s.poll.q){
      _renderPollWidget(sv, s);
    }
    // Music
    if(s.music_url){
      const au = document.createElement('audio');
      au.id='p7ViewerAudio'; au.src = s.music_url; au.autoplay = true; au.loop = true; au.style.display='none';
      sv.appendChild(au);
    }
  }
  async function _renderPollWidget(sv, s){
    const wrap = document.createElement('div');
    wrap.className = 'p7-poll-box';
    wrap.innerHTML = `<div class="q">${escapeHtml(s.poll.q)}</div><div id="p7PollBody">লোড হচ্ছে...</div>`;
    sv.appendChild(wrap);
    if(!s.dbId){ wrap.querySelector('#p7PollBody').innerHTML = _pollHtml(s, {a:0,b:0}, null); return; }
    try{
      const [{data:votes}, {data:mine}] = await Promise.all([
        sb.from('story_poll_votes').select('choice').eq('story_id', s.dbId),
        ME && ME.uuid ? sb.from('story_poll_votes').select('choice').eq('story_id', s.dbId).eq('voter_id', ME.uuid).maybeSingle() : Promise.resolve({data:null})
      ]);
      const counts = {a:0,b:0}; (votes||[]).forEach(v=>{ if(v.choice==='a')counts.a++; else if(v.choice==='b')counts.b++; });
      wrap.querySelector('#p7PollBody').innerHTML = _pollHtml(s, counts, mine ? mine.choice : null);
      wrap.dataset.storyId = s.dbId;
    }catch(e){ wrap.querySelector('#p7PollBody').innerHTML = _pollHtml(s, {a:0,b:0}, null); }
  }
  function _pollHtml(s, counts, mine){
    const total = (counts.a||0)+(counts.b||0);
    const pct = k => total ? Math.round((counts[k]||0)*100/total) : 0;
    return `
      <div class="p7-poll-opt ${mine==='a'?'chosen':''}" onclick="p7Vote('${s.dbId}','a')">
        <span style="min-width:110px;">${escapeHtml(s.poll.a||'A')}</span>
        <div class="p7-poll-bar"><i style="width:${pct('a')}%"></i></div>
        <span style="font-size:11px;font-weight:700;color:#333;">${pct('a')}%</span>
      </div>
      <div class="p7-poll-opt ${mine==='b'?'chosen':''}" onclick="p7Vote('${s.dbId}','b')">
        <span style="min-width:110px;">${escapeHtml(s.poll.b||'B')}</span>
        <div class="p7-poll-bar"><i style="width:${pct('b')}%"></i></div>
        <span style="font-size:11px;font-weight:700;color:#333;">${pct('b')}%</span>
      </div>
      <div style="text-align:center;font-size:10.5px;color:#666;margin-top:6px;">${total} vote${total===1?'':'s'}</div>`;
  }
  window.p7Vote = async function(storyId, choice){
    if(!ME || !ME.uuid){ alert('Sign in করো'); return; }
    if(!storyId) return;
    try{
      const { error } = await sb.from('story_poll_votes').upsert({ story_id: storyId, voter_id: ME.uuid, choice }, { onConflict:'story_id,voter_id' });
      if(error) throw error;
      const s = stories.find(x=>x.dbId===storyId); if(s) _renderPollWidget(document.getElementById('storyViewer'), s);
    }catch(e){ alert('Vote ব্যর্থ: '+e.message); }
  };

  // ===== Phase 7 SQL migration (run once in Supabase SQL editor):
  //
  // create table if not exists public.story_poll_votes (
  //   story_id uuid references public.stories(id) on delete cascade not null,
  //   voter_id uuid references auth.users(id) on delete cascade not null,
  //   choice text not null check (choice in ('a','b')),
  //   created_at timestamptz not null default now(),
  //   primary key (story_id, voter_id)
  // );
  // grant select, insert, update, delete on public.story_poll_votes to authenticated;
  // grant select on public.story_poll_votes to anon;
  // grant all on public.story_poll_votes to service_role;
  // alter table public.story_poll_votes enable row level security;
  // create policy "pv_read"    on public.story_poll_votes for select using (true);
  // create policy "pv_write"   on public.story_poll_votes for insert to authenticated with check (voter_id = auth.uid());
  // create policy "pv_update"  on public.story_poll_votes for update to authenticated using (voter_id = auth.uid()) with check (voter_id = auth.uid());
  // create policy "pv_delete"  on public.story_poll_votes for delete to authenticated using (voter_id = auth.uid());
})();
