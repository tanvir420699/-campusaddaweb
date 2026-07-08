
(function(){
  let _highlights = []; // my highlights cache
  let _hlViewerIdx = 0, _hlViewerData = null;

  async function loadHighlightsFor(userUuid){
    if(!SUPABASE_CONFIGURED || !userUuid) return [];
    try{
      const { data } = await sb.from('story_highlights').select('*').eq('user_id', userUuid).order('created_at',{ascending:false});
      return data || [];
    }catch(e){ console.warn('[highlights] load fail', e); return []; }
  }
  async function loadMyHighlights(){
    if(!ME || !ME.uuid) return;
    _highlights = await loadHighlightsFor(ME.uuid);
    renderMyHighlightsRow();
  }
  function _getUserUuid(userId){
    if(userId===0) return ME.uuid;
    const u = (typeof getUser==='function') ? getUser(userId) : null;
    return u && u.uuid;
  }
  function renderHighlightsInner(list, userId){
    const items = list.map(h=>{
      const t = (h.title||'Highlight').replace(/'/g,"\\'");
      return `<div class="hl-item" onclick="openHighlightViewer('${h.id}')">
        <div class="hl-ring"><div class="hl-cover" style="${h.cover_url?`background-image:url('${h.cover_url}');`:''}">${h.cover_url?'':'<svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/></svg>'}</div></div>
        <div class="hl-title">${escapeHtml(h.title||'Highlight')}</div>
      </div>`;
    }).join('');
    const addBtn = userId===0 ? `
      <div class="hl-item" onclick="openHighlightHelp()">
        <div class="hl-ring add-hl"><div class="hl-cover" style="background:var(--bg2);border-color:transparent;">+</div></div>
        <div class="hl-title">নতুন</div>
      </div>` : '';
    if(!items && !addBtn) return '';
    return addBtn + items;
  }
  function renderMyHighlightsRow(){
    const el = document.getElementById('myHighlightsRow');
    if(!el) return;
    const inner = renderHighlightsInner(_highlights, 0);
    el.innerHTML = inner ? `<div class="highlights-row">${inner}</div>` : '';
  }
  window.renderHighlightsRowHtml = function(userId){
    const uuid = _getUserUuid(userId);
    if(!uuid) return '';
    const containerId = 'hlRow-'+userId+'-'+Date.now();
    setTimeout(async ()=>{
      const list = (userId===0) ? _highlights : await loadHighlightsFor(uuid);
      const el = document.getElementById(containerId); if(!el) return;
      const inner = renderHighlightsInner(list, userId);
      el.innerHTML = inner ? `<div class="highlights-row">${inner}</div>` : '';
    },0);
    return `<div id="${containerId}"></div>`;
  };

  // ---- Modal helpers ----
  function showHighlightModal(html){
    let m = document.getElementById('highlightModal');
    if(!m){
      m = document.createElement('div');
      m.id = 'highlightModal';
      m.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:800;display:flex;align-items:center;justify-content:center;padding:16px;';
      m.onclick = e=>{ if(e.target===m) closeHighlightModal(); };
      m.innerHTML = `<div id="highlightModalBox" style="background:var(--bg2);border:1px solid var(--border2);border-radius:16px;width:100%;max-width:400px;max-height:80vh;overflow-y:auto;"></div>`;
      document.body.appendChild(m);
    }
    document.getElementById('highlightModalBox').innerHTML = html;
    m.style.display = 'flex';
  }
  window.closeHighlightModal = function(){
    const m = document.getElementById('highlightModal'); if(m) m.style.display='none';
  };
  window.openHighlightHelp = function(){
    showHighlightModal(`
      <div style="padding:16px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;">নতুন Highlight তৈরি করো</div>
        <div style="font-size:12.5px;color:var(--muted2);line-height:1.7;margin-bottom:14px;">তোমার নিজের story-তে যাও (উপরের বাবল-এ tap করো) <svg style=\"vertical-align:-2px;\" width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M5 12h14M12 5l7 7-7 7\"/></svg> নিচের <b style="color:var(--accent);"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2\"/></svg> Highlight</b> বাটনে ক্লিক করে save করো।</div>
        <button onclick="closeHighlightModal()" style="width:100%;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">বুঝেছি</button>
      </div>`);
  };

  // ---- Save current-viewing story to highlight ----
  window.openSaveToHighlightModal = async function(){
    if(!ME || !ME.uuid){ alert('প্রথমে sign in করো'); return; }
    await loadMyHighlights();
    const list = _highlights;
    const html = `
      <div style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px;">Highlight-এ Save করো</div>
        <div class="hl-modal-item" onclick="startCreateHighlightFromStory()">
          <div class="hl-modal-cover" style="background:var(--bg4);display:flex;align-items:center;justify-content:center;font-size:22px;color:#fff;">+</div>
          <div style="font-size:13px;font-weight:600;color:var(--text);">নতুন Highlight তৈরি করো</div>
        </div>
        ${list.map(h=>`
          <div class="hl-modal-item" onclick="addStoryToHighlight('${h.id}')">
            <div class="hl-modal-cover" style="${h.cover_url?`background-image:url('${h.cover_url}');`:''}"></div>
            <div style="flex:1;font-size:13px;font-weight:600;color:var(--text);">${escapeHtml(h.title||'Highlight')}</div>
            <div style="font-size:10px;color:var(--muted);">${(h.items||[]).length} <svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg></div>
          </div>`).join('')}
        <button onclick="closeHighlightModal()" style="width:100%;margin-top:8px;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">বন্ধ করো</button>
      </div>`;
    showHighlightModal(html);
  };

  function _currentStory(){
    if(typeof currentStoryIndex === 'undefined') return null;
    return stories[currentStoryIndex] || null;
  }
  function _storyToHlItem(s){
    return {
      story_id: s.dbId || null,
      image_url: s.img || null,
      caption: s.text || '',
      bg: s.bg || null,
      style: { textColor:s.textColor, font:s.font, align:s.align, posX:s.posX, posY:s.posY, imgFit:s.imgFit, imgScale:s.imgScale, imgOffXFrac:s.imgOffXFrac, imgOffYFrac:s.imgOffYFrac },
      ts: Date.now()
    };
  }
  window.startCreateHighlightFromStory = function(){
    const s = _currentStory(); if(!s) return;
    showHighlightModal(`
      <div style="padding:14px;">
        <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:12px;">নতুন Highlight</div>
        <input id="hlTitleInput" placeholder="Highlight-এর নাম (যেমন: ভ্রমণ)" style="width:100%;padding:11px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;outline:none;box-sizing:border-box;" />
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button onclick="closeHighlightModal()" style="flex:1;background:var(--bg3);border:none;border-radius:10px;padding:11px;color:var(--muted);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">বাতিল</button>
          <button onclick="createHighlightAndSave()" style="flex:1;background:linear-gradient(135deg,#6C63FF,#4CC9F0);border:none;border-radius:10px;padding:11px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;">তৈরি করো</button>
        </div>
      </div>`);
    setTimeout(()=>{ const i=document.getElementById('hlTitleInput'); if(i) i.focus(); },60);
  };
  window.createHighlightAndSave = async function(){
    const t = (document.getElementById('hlTitleInput')?.value||'').trim();
    if(!t){ alert('নাম লেখো'); return; }
    const s = _currentStory(); if(!s){ closeHighlightModal(); return; }
    const item = _storyToHlItem(s);
    const payload = { user_id: ME.uuid, title: t, cover_url: item.image_url||null, items:[item] };
    const { error } = await sb.from('story_highlights').insert(payload);
    if(error){ alert('Save ব্যর্থ: '+error.message); return; }
    closeHighlightModal();
    await loadMyHighlights();
    if(typeof toast==='function') toast('Highlight তৈরি হয়েছে');
  };
  window.addStoryToHighlight = async function(hlId){
    const s = _currentStory(); if(!s) return;
    const h = _highlights.find(x=>x.id===hlId); if(!h) return;
    const item = _storyToHlItem(s);
    const newItems = [...(h.items||[]), item];
    const patch = { items:newItems, updated_at: new Date().toISOString() };
    if(!h.cover_url && item.image_url) patch.cover_url = item.image_url;
    const { error } = await sb.from('story_highlights').update(patch).eq('id', hlId);
    if(error){ alert('Save ব্যর্থ: '+error.message); return; }
    closeHighlightModal();
    await loadMyHighlights();
    if(typeof toast==='function') toast('Highlight-এ যুক্ত হয়েছে');
  };

  // ---- Highlight viewer ----
  window.openHighlightViewer = async function(hlId){
    try{
      const { data, error } = await sb.from('story_highlights').select('*').eq('id', hlId).single();
      if(error || !data){ alert('Load ব্যর্থ'); return; }
      if(!data.items || !data.items.length){ alert('এই Highlight খালি'); return; }
      // FB-style: highlight items are BOOKMARKS to real stories. If the
      // original story is still live (<24h, in `stories` array), open it
      // via the main story viewer so the experience is identical
      // (reactions, viewers, reply, seen-state). Otherwise fall back to
      // the snapshot viewer for expired stories.
      const first = data.items[0];
      if(first && first.story_id && Array.isArray(stories)){
        const idx = stories.findIndex(x => x.dbId === first.story_id);
        if(idx >= 0 && typeof viewStory === 'function'){
          viewStory(idx);
          return;
        }
      }
      _hlViewerData = data; _hlViewerIdx = 0;
      _showHlViewer();
    }catch(e){ alert('Load ব্যর্থ: '+e.message); }
  };
  function _showHlViewer(){
    let m = document.getElementById('hlViewer');
    if(!m){
      m = document.createElement('div');
      m.id = 'hlViewer';
      m.className = 'story-viewer';
      m.style.zIndex = '900';
      m.innerHTML = `
        <div class="story-progress-bar" id="hlProgressBar"></div>
        <div style="display:flex;align-items:center;justify-content:space-between;padding:2px 16px 8px;">
          <div id="hlViewerTitle" style="color:#fff;font-size:13px;font-weight:700;flex:1;"></div>
          <button onclick="closeHlViewer()" style="background:rgba(255,255,255,0.2);border:none;border-radius:50%;width:32px;height:32px;color:#fff;font-size:14px;cursor:pointer;font-family:inherit;"><svg style=\"vertical-align:-2px;\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg></button>
        </div>
        <div class="story-viewer-content" id="hlViewerBody"></div>
        <div id="hlOwnerActions" style="display:flex;gap:8px;padding:10px 16px calc(14px + env(safe-area-inset-bottom));"></div>`;
      document.body.appendChild(m);
    }
    m.classList.remove('hidden');
    m.style.display = 'flex';
    _paintHlItem();
  }
  function _paintHlItem(){
    const d = _hlViewerData; if(!d) return;
    const items = d.items||[];
    const it = items[_hlViewerIdx]; if(!it) return closeHlViewer();
    document.getElementById('hlViewerTitle').textContent = d.title||'Highlight';
    const pb = document.getElementById('hlProgressBar');
    pb.innerHTML = items.map((_,i)=>`<div class="story-prog-seg"><div class="story-prog-fill" style="width:${i<=_hlViewerIdx?100:0}%;"></div></div>`).join('');
    const body = document.getElementById('hlViewerBody');
    const st = it.style||{};
    const bg = it.bg || 'linear-gradient(135deg,#6C63FF,#4CC9F0)';
    const imgHtml = it.image_url ? `<img alt="" src="${it.image_url}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:${st.imgFit||'cover'};">` : '';
    const captionHtml = it.caption ? `<div style="position:absolute;left:0;right:0;top:${st.posY||50}%;transform:translateY(-50%);text-align:${st.align||'center'};color:${st.textColor||'#fff'};font-size:18px;font-weight:600;padding:0 20px;line-height:1.5;word-break:break-word;text-shadow:0 2px 8px rgba(0,0,0,0.5);pointer-events:none;">${escapeHtml(it.caption)}</div>` : '';
    body.style.background = it.image_url ? '#000' : bg;
    body.innerHTML = `${imgHtml}${captionHtml}
      <div class="story-tap-zone story-tap-left" onclick="hlPrev()"></div>
      <div class="story-tap-zone story-tap-right" onclick="hlNext()"></div>`;
    const isOwner = ME && d.user_id === ME.uuid;
    document.getElementById('hlOwnerActions').innerHTML = isOwner ? `
      <button onclick="removeCurrentHlItem()" style="flex:1;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.25);border-radius:20px;padding:9px;color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/></svg> এই ছবি সরাও</button>
      <button onclick="deleteCurrentHighlight()" style="flex:1;background:rgba(247,37,133,0.15);border:1px solid #F7258588;border-radius:20px;padding:9px;color:#F72585;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;"><svg style=\"vertical-align:-2px;\" width=\"15\" height=\"15\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"3 6 5 6 21 6\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/></svg> Highlight ডিলিট</button>` : '';
  }
  window.hlNext = function(){
    const d = _hlViewerData; if(!d) return;
    _hlViewerIdx++;
    if(_hlViewerIdx >= (d.items||[]).length){ closeHlViewer(); return; }
    _paintHlItem();
  };
  window.hlPrev = function(){ if(_hlViewerIdx>0){ _hlViewerIdx--; _paintHlItem(); } };
  window.closeHlViewer = function(){
    const m = document.getElementById('hlViewer');
    if(m){ m.classList.add('hidden'); m.style.display='none'; }
    _hlViewerData = null; _hlViewerIdx = 0;
  };
  window.removeCurrentHlItem = async function(){
    const d = _hlViewerData; if(!d) return;
    if(!confirm('এই ছবি Highlight থেকে সরাবে?')) return;
    const items = (d.items||[]).slice(); items.splice(_hlViewerIdx,1);
    if(!items.length){ return window.deleteCurrentHighlight(); }
    const patch = { items, updated_at: new Date().toISOString() };
    if(!items.some(x=>x.image_url===d.cover_url)) patch.cover_url = items[0].image_url||null;
    const { error } = await sb.from('story_highlights').update(patch).eq('id', d.id);
    if(error){ alert('ব্যর্থ: '+error.message); return; }
    _hlViewerData = { ...d, ...patch };
    if(_hlViewerIdx >= items.length) _hlViewerIdx = items.length-1;
    _paintHlItem();
    loadMyHighlights();
  };
  window.deleteCurrentHighlight = async function(){
    const d = _hlViewerData; if(!d) return;
    if(!confirm('পুরো Highlight ডিলিট করবে?')) return;
    const { error } = await sb.from('story_highlights').delete().eq('id', d.id);
    if(error){ alert('ব্যর্থ: '+error.message); return; }
    closeHlViewer();
    loadMyHighlights();
  };

  // Auto-load when session ready
  const _iv = setInterval(()=>{
    if(typeof ME!=='undefined' && ME && ME.uuid && typeof sb!=='undefined'){
      clearInterval(_iv);
      loadMyHighlights();
    }
  }, 700);
  // Expose for other renderers
  window.loadMyHighlights = loadMyHighlights;
  window.renderMyHighlightsRow = renderMyHighlightsRow;

  // ===== SQL migration (run once in Supabase SQL editor):
  // create table if not exists public.story_highlights (
  //   id uuid primary key default gen_random_uuid(),
  //   user_id uuid references auth.users(id) on delete cascade not null,
  //   title text not null,
  //   cover_url text,
  //   items jsonb not null default '[]'::jsonb,
  //   created_at timestamptz not null default now(),
  //   updated_at timestamptz not null default now()
  // );
  // grant select on public.story_highlights to anon, authenticated;
  // grant insert, update, delete on public.story_highlights to authenticated;
  // alter table public.story_highlights enable row level security;
  // create policy "hl_public_read" on public.story_highlights for select using (true);
  // create policy "hl_own_insert" on public.story_highlights for insert to authenticated with check (auth.uid() = user_id);
  // create policy "hl_own_update" on public.story_highlights for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
  // create policy "hl_own_delete" on public.story_highlights for delete to authenticated using (auth.uid() = user_id);
})();
