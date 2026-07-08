
(function(){
  if(typeof sb==='undefined') return;

  // ---------- Close Friends ----------
  let _myCF = new Set();   // uuids I marked as close friend
  let _cfOfMe = new Set(); // uuids who marked ME as close friend (so I can see their close_friends stories)

  async function loadCF(){
    if(!ME || !ME.uuid) return;
    try{
      const [{data:a}, {data:b}] = await Promise.all([
        sb.from('close_friends').select('friend_id').eq('user_id', ME.uuid),
        sb.from('close_friends').select('user_id').eq('friend_id', ME.uuid),
      ]);
      _myCF = new Set((a||[]).map(r=>r.friend_id));
      _cfOfMe = new Set((b||[]).map(r=>r.user_id));
    }catch(e){ console.warn('[cf] load', e); }
  }
  window._closeFriendsOfAuthor = function(authorUuid){
    // Am I in this author's close friends list?
    return _cfOfMe.has(authorUuid);
  };
  window.isMyCloseFriend = function(uuid){ return _myCF.has(uuid); };

  async function toggleCF(uuid, el){
    if(!ME.uuid || !uuid || uuid===ME.uuid) return;
    if(_myCF.has(uuid)){
      const { error } = await sb.from('close_friends').delete().eq('user_id', ME.uuid).eq('friend_id', uuid);
      if(error){ alert('ব্যর্থ: '+error.message); return; }
      _myCF.delete(uuid);
      if(el) el.classList.remove('on');
    } else {
      const { error } = await sb.from('close_friends').insert({ user_id: ME.uuid, friend_id: uuid });
      if(error){ alert('ব্যর্থ: '+error.message); return; }
      _myCF.add(uuid);
      if(el) el.classList.add('on');
    }
  }
  window.toggleCloseFriend = toggleCF;

  window.openCloseFriendsModal = async function(){
    if(!ME || !ME.uuid){ alert('Sign in করো'); return; }
    await loadCF();
    // Show my friends list (from local `friends` array) with a toggle chip.
    const friendList = Array.isArray(friends) ? friends : [];
    const items = friendList.map(id=>{
      const u = getUser(id); if(!u) return '';
      const uuid = typeof localIdToUuid==='function' ? localIdToUuid(id) : null;
      if(!uuid) return '';
      const on = _myCF.has(uuid) ? 'on' : '';
      const av = u.profileImg ? `<img alt="" src="${u.profileImg}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">` : `<div style="width:36px;height:36px;border-radius:50%;background:var(--bg4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">${(u.name||'?')[0]}</div>`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 4px;">
        ${av}
        <div style="flex:1;font-size:13px;font-weight:600;color:var(--text);">${escapeHtml(u.name||'')}</div>
        <button class="cf-chip ${on}" onclick="_cfToggleClick(this,'${uuid}')">${on?'<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg> Added':'+ Add'}</button>
      </div>`;
    }).join('') || `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12.5px;">এখনো কোনো ফ্রেন্ড নেই</div>`;
    _showP6Modal(`
      <div style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg> Close Friends</div>
        <div style="font-size:11.5px;color:var(--muted2);margin-bottom:10px;">এই লিস্টের মানুষ শুধু তোমার "Close Friends" story দেখতে পাবে।</div>
        <div style="max-height:55vh;overflow-y:auto;">${items}</div>
        <button onclick="_closeP6Modal()" style="width:100%;margin-top:10px;background:linear-gradient(135deg,#06D6A0,#118AB2);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">Done</button>
      </div>`);
  };
  window._cfToggleClick = async function(el, uuid){
    await toggleCF(uuid, el);
    el.innerHTML = _myCF.has(uuid) ? '<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg> Added' : '+ Add';
  };

  // Green ring on story bubbles authored by users who marked me as close friend
  // (i.e., stories they may share to close friends). Runs after renderStories.
  function paintCFRings(){
    document.querySelectorAll('.story-item').forEach(node=>{
      // We can't easily know the author uuid from the DOM; instead, mark
      // via the `stories` array + index attribute if present.
      const idxAttr = node.getAttribute('onclick') || '';
      const m = idxAttr.match(/viewStory\((\d+)\)/);
      if(!m) return;
      const s = stories[parseInt(m[1],10)];
      if(!s) return;
      const authorUuid = typeof localIdToUuid==='function' ? localIdToUuid(s.userId===0 ? 0 : s.userId) : null;
      // For OWN stories we ring green only if visibility === 'close_friends'
      const ring = s.userId===0
        ? (s.visibility==='close_friends')
        : (authorUuid && _cfOfMe.has(authorUuid) && s.visibility==='close_friends');
      const bubble = node.querySelector('.story-avatar, .story-bubble-inner, .story-thumb');
      if(ring){ node.classList.add('story-bubble-close'); }
      else node.classList.remove('story-bubble-close');
    });
  }
  const _origRenderStories = window.renderStories;
  if(typeof _origRenderStories === 'function'){
    window.renderStories = function(){
      const r = _origRenderStories.apply(this, arguments);
      setTimeout(paintCFRings, 0);
      return r;
    };
  }

  // ---------- Story Archive ----------
  let _archive = [];
  async function loadArchive(){
    if(!ME || !ME.uuid) return;
    try{
      const { data } = await sb.from('stories').select('*').eq('user_id', ME.uuid).order('created_at',{ascending:false}).limit(200);
      _archive = data || [];
    }catch(e){ console.warn('[archive]', e); }
  }
  window.openStoryArchiveModal = async function(){
    if(!ME || !ME.uuid){ alert('Sign in করো'); return; }
    await loadArchive();
    const items = _archive.map(s=>{
      const cover = s.image_url ? `background-image:url('${s.image_url}');` : `background:linear-gradient(135deg,#6C63FF,#4CC9F0);`;
      const when = new Date(s.created_at).toLocaleDateString('bn-BD');
      const expired = new Date(s.expires_at).getTime() < Date.now();
      const cap = escapeHtml((s.caption||'').substring(0,50));
      return `<div class="arch-item">
        <div class="arch-cover" style="${cover}"></div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:12.5px;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${cap || (expired?'Expired story':'Active story')}</div>
          <div style="font-size:10.5px;color:var(--muted);margin-top:2px;">${when} · ${expired?'<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"/></svg> Archived':'<svg style=\"vertical-align:-2px;\" width=\"10\" height=\"10\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"8\" fill=\"currentColor\" stroke=\"none\"/></svg> Live'}</div>
        </div>
        <button onclick="_archiveToHl('${s.id}')" style="background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:12px;padding:6px 10px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/></svg> Highlight</button>
      </div>`;
    }).join('') || `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12.5px;">এখনো কোনো story নেই</div>`;
    _showP6Modal(`
      <div style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"/></svg> Story Archive</div>
        <div style="font-size:11.5px;color:var(--muted2);margin-bottom:10px;">তোমার আগের সব story এখানে save থাকে — 24 ঘণ্টা পরেও।</div>
        <div style="max-height:60vh;overflow-y:auto;">${items}</div>
        <button onclick="_closeP6Modal()" style="width:100%;margin-top:8px;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">বন্ধ করো</button>
      </div>`);
  };
  window._archiveToHl = async function(storyId){
    const s = _archive.find(x=>x.id===storyId); if(!s) return;
    const item = { story_id: s.id, image_url: s.image_url||null, caption: s.caption||'', bg:null, style:(s.style||{}), ts:Date.now() };
    const title = prompt('Highlight-এর নাম:', 'Highlight'); if(!title) return;
    const { error } = await sb.from('story_highlights').insert({ user_id: ME.uuid, title, cover_url:item.image_url, items:[item] });
    if(error){ alert('ব্যর্থ: '+error.message); return; }
    _closeP6Modal();
    if(typeof loadMyHighlights==='function') loadMyHighlights();
    if(typeof toast==='function') toast('Highlight তৈরি হয়েছে');
  };

  // ---------- Modal helpers ----------
  function _showP6Modal(html){
    let m = document.getElementById('p6Modal');
    if(!m){
      m = document.createElement('div');
      m.id = 'p6Modal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.72);z-index:1100;display:flex;align-items:center;justify-content:center;padding:16px;';
      m.onclick = e=>{ if(e.target===m) _closeP6Modal(); };
      m.innerHTML = `<div id="p6ModalBox" style="background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:420px;max-height:85vh;overflow-y:auto;"></div>`;
      document.body.appendChild(m);
    }
    document.getElementById('p6ModalBox').innerHTML = html;
    m.style.display = 'flex';
  }
  window._closeP6Modal = function(){ const m=document.getElementById('p6Modal'); if(m) m.style.display='none'; };

  // ---------- Story Mentions ----------
  // Parse @username tokens from a story caption, resolve to profile uuids,
  // and drop a 'story_mention' notification to each mentioned user.
  window.notifyStoryMentions = async function(caption, storyDbId){
    if(!caption || !ME || !ME.uuid) return;
    const names = Array.from(new Set((caption.match(/@([a-zA-Z0-9_.]{2,32})/g)||[]).map(s=>s.slice(1).toLowerCase())));
    if(!names.length) return;
    try{
      const { data } = await sb.from('profiles').select('id,username').in('username', names);
      const meName = (ME.name || ME.username || 'কেউ');
      for(const p of (data||[])){
        if(p.id === ME.uuid) continue;
        if(typeof sbInsertNotification === 'function'){
          await sbInsertNotification(p.id, 'story_mention', ME.uuid, storyDbId || null, `${meName} তোমাকে একটি story-তে mention করেছে`);
        }
      }
    }catch(e){ console.warn('[mentions]', e); }
  };

  // ---------- Muted Stories management ----------
  window.openMutedStoriesModal = function(){
    const ids = Array.from(_mutedStoryUsers);
    const items = ids.map(uid=>{
      const u = getUser(uid); if(!u) return '';
      const av = u.profileImg ? `<img alt="" src="${u.profileImg}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;">` : `<div style="width:36px;height:36px;border-radius:50%;background:var(--bg4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;">${(u.name||'?')[0]}</div>`;
      return `<div style="display:flex;align-items:center;gap:10px;padding:8px 4px;">
        ${av}
        <div style="flex:1;font-size:13px;font-weight:600;color:var(--text);">${escapeHtml(u.name||'')}</div>
        <button onclick="_unmuteClick(this,${uid})" style="background:var(--bg3);border:none;border-radius:8px;padding:6px 10px;color:var(--text);font-size:11.5px;font-weight:700;cursor:pointer;font-family:inherit;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><path d=\"M15.54 8.46a5 5 0 0 1 0 7.07\"/><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14\"/></svg> Unmute</button>
      </div>`;
    }).join('') || `<div style="padding:20px;text-align:center;color:var(--muted);font-size:12.5px;">এখনো কারো story mute করা নেই</div>`;
    _showP6Modal(`
      <div style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:4px;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"/><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"/></svg> Muted Stories</div>
        <div style="font-size:11.5px;color:var(--muted2);margin-bottom:10px;">এদের story তোমার stories bar-এ দেখাবে না — বাকি সবকিছু (feed, chat) আগের মতোই থাকবে।</div>
        <div style="max-height:55vh;overflow-y:auto;">${items}</div>
        <button onclick="_closeP6Modal()" style="width:100%;margin-top:10px;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">বন্ধ করো</button>
      </div>`);
  };
  window._unmuteClick = function(el, uid){
    toggleStoryMute(uid);
    const row = el.closest('div[style*="align-items:center"]');
    if(row) row.remove();
  };

  // ---------- Inject "Story Tools" pill row under highlights on own profile ----------
  function injectTools(){
    const anchor = document.getElementById('myHighlightsRow');
    if(!anchor || document.getElementById('p6ToolsRow')) return;
    const row = document.createElement('div');
    row.id = 'p6ToolsRow';
    row.className = 'phase6-tools';
    row.innerHTML = `
      <button class="cf-chip" onclick="openCloseFriendsModal()"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z\"/></svg> Close Friends</button>
      <button class="cf-chip" onclick="openStoryArchiveModal()"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z\"/></svg> Story Archive</button>
      <button class="cf-chip" onclick="openMutedStoriesModal()"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"/><line x1=\"23\" y1=\"9\" x2=\"17\" y2=\"15\"/><line x1=\"17\" y1=\"9\" x2=\"23\" y2=\"15\"/></svg> Muted Stories</button>`;
    anchor.parentNode.insertBefore(row, anchor.nextSibling);
  }

  // Boot
  const _iv = setInterval(()=>{
    if(typeof ME!=='undefined' && ME && ME.uuid){
      clearInterval(_iv);
      loadCF();
      injectTools();
      // also re-inject if profile tab re-renders
      setInterval(injectTools, 2500);
    }
  }, 700);

  // ===== Phase 6 SQL migration (run once in Supabase SQL editor):
  //
  // -- Close Friends table
  // create table if not exists public.close_friends (
  //   user_id   uuid references auth.users(id) on delete cascade not null,
  //   friend_id uuid references auth.users(id) on delete cascade not null,
  //   created_at timestamptz not null default now(),
  //   primary key (user_id, friend_id)
  // );
  // grant select, insert, delete on public.close_friends to authenticated;
  // grant all on public.close_friends to service_role;
  // alter table public.close_friends enable row level security;
  // create policy "cf_read_own"   on public.close_friends for select to authenticated
  //   using (user_id = auth.uid() or friend_id = auth.uid());
  // create policy "cf_write_own"  on public.close_friends for insert to authenticated
  //   with check (user_id = auth.uid());
  // create policy "cf_delete_own" on public.close_friends for delete to authenticated
  //   using (user_id = auth.uid());
  //
  // -- Extend story visibility enum with 'close_friends'
  // alter table public.stories drop constraint if exists stories_visibility_check;
  // alter table public.stories add constraint stories_visibility_check
  //   check (visibility in ('public','friends','close_friends','private'));
})();
