/* ================= CAMPUS ADDA — STORIES MODULE ================= */
(function(){
'use strict';

// ---------- config ----------
const SB_URL='https://jtzegemmokgagxceqluv.supabase.co';
const SB_KEY='sb_publishable_7phb2uH_5amauPA_msCbAw_tRIqDYcx';
const BUCKET='stories';
const DEFAULT_DURATION=5;
const REACTIONS=['👍','❤️','😂','😮','😢','😡','🔥','🎉'];
const TEXT_BGS=[
  {kind:'gradient',value:'linear-gradient(135deg,#F72585,#7209B7,#3A0CA3)'},
  {kind:'gradient',value:'linear-gradient(135deg,#4361EE,#4CC9F0)'},
  {kind:'gradient',value:'linear-gradient(135deg,#06D6A0,#118AB2)'},
  {kind:'gradient',value:'linear-gradient(135deg,#F4A261,#E76F51)'},
  {kind:'gradient',value:'linear-gradient(135deg,#111,#333)'},
  {kind:'gradient',value:'linear-gradient(135deg,#8338EC,#FF006E)'},
  {kind:'gradient',value:'linear-gradient(180deg,#0d0f14,#252837)'},
  {kind:'color',value:'#6C63FF'},
  {kind:'color',value:'#F72585'},
  {kind:'color',value:'#06D6A0'},
  {kind:'color',value:'#F4A261'},
  {kind:'color',value:'#1A1D27'},
];
const FONTS=[
  {key:'sans',label:'Aa',css:"'Noto Sans Bengali','Segoe UI',sans-serif"},
  {key:'serif',label:'Aa',css:"Georgia,serif"},
  {key:'mono',label:'Aa',css:"ui-monospace,Menlo,monospace"},
  {key:'bold',label:'Aa',css:"'Noto Sans Bengali',sans-serif",weight:800},
  {key:'italic',label:'Aa',css:"Georgia,serif",style:'italic'},
];
const TEXT_COLORS=['#ffffff','#000000','#F72585','#4CC9F0','#06D6A0','#F4A261','#FFD166','#6C63FF'];

// ---------- shared supabase client (reuse app's if present) ----------
let sb = window.sb || null;
function ensureSb(){
  if(sb) return sb;
  if(window.supabase && window.supabase.createClient){
    sb = window.supabase.createClient(SB_URL,SB_KEY);
    window.sb = window.sb || sb;
  }
  return sb;
}

// ---------- utilities ----------
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
function el(tag,attrs={},...children){
  const n=document.createElement(tag);
  for(const k in attrs){
    if(k==='class') n.className=attrs[k];
    else if(k==='style' && typeof attrs[k]==='object') Object.assign(n.style,attrs[k]);
    else if(k.startsWith('on') && typeof attrs[k]==='function') n.addEventListener(k.slice(2),attrs[k]);
    else if(k==='html') n.innerHTML=attrs[k];
    else if(attrs[k]!=null) n.setAttribute(k,attrs[k]);
  }
  for(const c of children){
    if(c==null||c===false) continue;
    n.appendChild(typeof c==='string'?document.createTextNode(c):c);
  }
  return n;
}
function toast(msg){
  let mount=$('#smToastMount');
  if(!mount){ mount=el('div',{id:'smToastMount',class:'sm-toast-mount'}); document.body.appendChild(mount); }
  const t=el('div',{class:'sm-toast'},msg);
  mount.appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; }, 2000);
  setTimeout(()=>t.remove(), 2400);
}
function timeAgo(iso){
  const d=new Date(iso), s=(Date.now()-d.getTime())/1000;
  if(s<60) return Math.max(1,Math.floor(s))+'s';
  if(s<3600) return Math.floor(s/60)+'m';
  if(s<86400) return Math.floor(s/3600)+'h';
  return Math.floor(s/86400)+'d';
}
function myUuid(){
  try{
    if(window.ME && window.ME.uuid) return window.ME.uuid;
  }catch(e){}
  // fallback: campus-adda.html declares `const ME` at top level, which is visible
  // to this script as a plain (non-window) global even if window.ME wasn't set.
  try{
    if(typeof ME!=='undefined' && ME && ME.uuid) return ME.uuid;
  }catch(e){}
  try{
    if(sb && sb.auth){ const s=sb.auth.currentSession; if(s&&s.user) return s.user.id; }
  }catch(e){}
  return null;
}
async function getMyUser(){
  ensureSb();
  if(!sb) return null;
  try{ const {data}=await sb.auth.getUser(); return data && data.user; }catch(e){ return null; }
}
function myProfile(){
  return {
    uuid: myUuid(),
    name: (window.ME && (window.ME.name || window.ME.full_name)) || 'You',
    avatar: (window.ME && (window.ME.avatar_url || window.ME.avatar)) || ''
  };
}

// ---------- profile cache (best effort against a `profiles` table) ----------
const _profCache = new Map();
async function fetchProfiles(uuids){
  ensureSb(); if(!sb) return {};
  const need = uuids.filter(u=>u && !_profCache.has(u));
  if(need.length){
    try{
      const {data} = await sb.from('profiles').select('id,uuid,name,full_name,avatar_url,username').in('uuid',need);
      (data||[]).forEach(p=>_profCache.set(p.uuid,p));
    }catch(e){}
    try{
      const missing = need.filter(u=>!_profCache.has(u));
      if(missing.length){
        const {data} = await sb.from('profiles').select('id,uuid,name,full_name,avatar_url,username').in('id',missing);
        (data||[]).forEach(p=>_profCache.set(p.id,p));
      }
    }catch(e){}
  }
  const out={};
  uuids.forEach(u=>{ if(u){ out[u]=_profCache.get(u)||{uuid:u,name:'User'}; } });
  return out;
}
function profName(p){ return p && (p.name||p.full_name||p.username) || 'User'; }
function profInitial(p){ const n=profName(p); return (n[0]||'?').toUpperCase(); }
function profAvatarBg(p){ return p && p.avatar_url ? `url('${p.avatar_url}')` : ''; }

// ---------- data layer ----------
async function loadFeed(){
  ensureSb(); if(!sb) return [];
  const me = myUuid();
  // muted/interests filters (viewer side)
  let muted=[], notInterested=[];
  if(me){
    try{
      const {data:mm} = await sb.from('story_muted').select('muted_user_id').eq('user_id',me);
      muted = (mm||[]).map(x=>x.muted_user_id);
    }catch(e){}
    try{
      const {data:ii} = await sb.from('story_interests').select('target_user_id,state').eq('user_id',me).eq('state','not_interested');
      notInterested = (ii||[]).map(x=>x.target_user_id);
    }catch(e){}
  }
  const {data,error} = await sb.from('stories')
    .select('*')
    .eq('archived',false)
    .gt('expires_at', new Date().toISOString())
    .order('created_at',{ascending:true});
  if(error){ console.warn('[stories] load',error); return []; }
  const filtered=(data||[]).filter(s=>{
    if(muted.includes(s.user_id) || notInterested.includes(s.user_id)) return false;
    return true;
  });
  // group by user
  const map=new Map();
  filtered.forEach(s=>{
    if(!map.has(s.user_id)) map.set(s.user_id,[]);
    map.get(s.user_id).push(s);
  });
  const groups=Array.from(map.entries()).map(([uuid,items])=>({uuid,items}));
  // fetch profiles + seen state
  const profs = await fetchProfiles(groups.map(g=>g.uuid));
  let seen=new Set();
  if(me){
    try{
      const ids=filtered.map(s=>s.id);
      if(ids.length){
        const {data:sv}=await sb.from('story_views').select('story_id').eq('viewer_id',me).in('story_id',ids);
        (sv||[]).forEach(r=>seen.add(r.story_id));
      }
    }catch(e){}
  }
  groups.forEach(g=>{
    g.profile = profs[g.uuid] || {uuid:g.uuid,name:'User'};
    g.allSeen = g.items.every(s=>seen.has(s.id));
    g.isMine  = (g.uuid===me);
  });
  // mine first, then unseen, then seen
  groups.sort((a,b)=>{
    if(a.isMine!==b.isMine) return a.isMine?-1:1;
    if(a.allSeen!==b.allSeen) return a.allSeen?1:-1;
    return 0;
  });
  return groups;
}

async function insertStory(payload, mentions=[], includeUsers=[], excludeUsers=[]){
  ensureSb(); if(!sb) return null;
  const me = myUuid(); if(!me){ toast('লগইন প্রয়োজন'); return null; }
  const row = Object.assign({user_id:me}, payload);
  const {data,error} = await sb.from('stories').insert(row).select().single();
  if(error){ console.error(error); toast('Story পোস্ট হয়নি: '+error.message); return null; }
  const id=data.id;
  try{
    if(mentions.length){
      await sb.from('story_mentions').insert(mentions.map(m=>({story_id:id, user_id:m.uuid, x:m.x||0.5, y:m.y||0.5})));
      // Previously mentioning someone in a story never told them — no DM,
      // no notification. Fire a real 'story_mention' notification to each
      // mentioned person so it shows up in their inbox/notifications.
      if(typeof sbInsertNotification==='function'){
        const meName = profName(myProfile());
        mentions.forEach(m=>{
          if(m.uuid && m.uuid!==me) sbInsertNotification(m.uuid, 'story_mention', me, id, `${meName} তোমাকে একটি story-তে mention করেছে`);
        });
      }
    }
    if(payload.privacy==='custom' && includeUsers.length)
      await sb.from('story_privacy_include').insert(includeUsers.map(u=>({story_id:id,user_id:u})));
    if(excludeUsers.length)
      await sb.from('story_privacy_exclude').insert(excludeUsers.map(u=>({story_id:id,user_id:u})));
  }catch(e){ console.warn(e); }
  return data;
}

async function uploadMedia(file){
  ensureSb(); if(!sb) return null;
  const me = myUuid(); if(!me) return null;
  const ext=(file.name.split('.').pop()||'bin').toLowerCase();
  const path=`${me}/${Date.now()}_${Math.random().toString(36).slice(2,8)}.${ext}`;
  const {error} = await sb.storage.from(BUCKET).upload(path,file,{cacheControl:'31536000',upsert:false,contentType:file.type});
  if(error){ toast('Upload failed: '+error.message); return null; }
  const {data} = sb.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function recordView(storyId, ownerUuid){
  ensureSb(); if(!sb) return;
  const me=myUuid(); if(!me || me===ownerUuid) return;
  try{ await sb.from('story_views').upsert({story_id:storyId, viewer_id:me},{onConflict:'story_id,viewer_id'}); }catch(e){}
}
async function loadViewers(storyId){
  ensureSb(); if(!sb) return [];
  const {data:vs} = await sb.from('story_views').select('viewer_id,viewed_at').eq('story_id',storyId).order('viewed_at',{ascending:false});
  const list=vs||[];
  const profs=await fetchProfiles(list.map(v=>v.viewer_id));
  const {data:rx} = await sb.from('story_reactions').select('user_id,emoji').eq('story_id',storyId);
  const rxMap={}; (rx||[]).forEach(r=>rxMap[r.user_id]=r.emoji);
  return list.map(v=>({uuid:v.viewer_id, at:v.viewed_at, profile:profs[v.viewer_id]||{uuid:v.viewer_id,name:'User'}, emoji:rxMap[v.viewer_id]}));
}
async function sendReaction(storyId, emoji){
  ensureSb(); const me=myUuid(); if(!sb||!me) return;
  try{ await sb.from('story_reactions').upsert({story_id:storyId,user_id:me,emoji},{onConflict:'story_id,user_id'}); }catch(e){}
}
async function sendReply(storyId, text){
  ensureSb(); const me=myUuid(); if(!sb||!me||!text.trim()) return;
  try{ await sb.from('story_replies').insert({story_id:storyId,user_id:me,text:text.trim()}); }catch(e){}
}
async function deleteStory(id){
  ensureSb(); if(!sb) return;
  try{ await sb.from('stories').delete().eq('id',id); }catch(e){}
}
async function archiveStory(id){
  ensureSb(); if(!sb) return;
  try{ await sb.from('stories').update({archived:true}).eq('id',id); }catch(e){}
}
async function updatePrivacy(id, privacy, includeUsers=[], excludeUsers=[]){
  ensureSb(); if(!sb) return;
  try{
    await sb.from('stories').update({privacy}).eq('id',id);
    await sb.from('story_privacy_include').delete().eq('story_id',id);
    await sb.from('story_privacy_exclude').delete().eq('story_id',id);
    if(privacy==='custom' && includeUsers.length) await sb.from('story_privacy_include').insert(includeUsers.map(u=>({story_id:id,user_id:u})));
    if(excludeUsers.length) await sb.from('story_privacy_exclude').insert(excludeUsers.map(u=>({story_id:id,user_id:u})));
  }catch(e){}
}
async function muteUser(uuid){
  ensureSb(); const me=myUuid(); if(!sb||!me) return;
  try{ await sb.from('story_muted').upsert({user_id:me,muted_user_id:uuid},{onConflict:'user_id,muted_user_id'}); }catch(e){}
}
async function setInterest(uuid,state){
  ensureSb(); const me=myUuid(); if(!sb||!me) return;
  try{ await sb.from('story_interests').upsert({user_id:me,target_user_id:uuid,state},{onConflict:'user_id,target_user_id'}); }catch(e){}
}
async function reportStory(storyId, reason){
  ensureSb(); const me=myUuid(); if(!sb||!me) return;
  try{ await sb.from('story_reports').insert({story_id:storyId,reporter_id:me,reason}); }catch(e){}
}
async function hideFromViewer(ownerUuid,hiderUuid){
  ensureSb(); if(!sb) return;
  try{ await sb.from('story_hidden').upsert({user_id:ownerUuid,hide_user_id:hiderUuid},{onConflict:'user_id,hide_user_id'}); }catch(e){}
}

// ---------- friends source (fallback to profiles list) ----------
async function loadFriends(){
  ensureSb(); if(!sb) return [];
  const me = myUuid(); if(!me) return [];
  // try `follows` table (mutual = friends)
  try{
    const {data:f1}=await sb.from('follows').select('following_uuid').eq('follower_uuid',me);
    const {data:f2}=await sb.from('follows').select('follower_uuid').eq('following_uuid',me);
    const a=new Set((f1||[]).map(x=>x.following_uuid));
    const b=new Set((f2||[]).map(x=>x.follower_uuid));
    const mutual=[...a].filter(x=>b.has(x));
    if(mutual.length){
      const profs=await fetchProfiles(mutual);
      return mutual.map(u=>profs[u]).filter(Boolean);
    }
  }catch(e){}
  // fallback: recent profiles
  try{
    const {data}=await sb.from('profiles').select('id,uuid,name,full_name,avatar_url,username').limit(50);
    return (data||[]).filter(p=> (p.uuid||p.id)!==me).map(p=>Object.assign({uuid:p.uuid||p.id},p));
  }catch(e){}
  return [];
}

// ================= UI =================

// -- Root mount --
let mountRoot = null;
function ensureMount(){
  if(mountRoot) return mountRoot;
  mountRoot = el('div',{id:'smRoot'});
  document.body.appendChild(mountRoot);
  return mountRoot;
}
function closeAllOverlays(){
  if(!mountRoot) return;
  $$('.sm-page,.sm-viewer,.sm-sheet',mountRoot).forEach(n=>n.remove());
}

// -- Stories bar --
async function renderBar(){
  const bar = document.getElementById('storiesBar');
  if(!bar) return;
  bar.className='sm-bar';
  bar.innerHTML='';
  const me = myProfile();
  // add-story tile
  const addTile = el('div',{class:'sm-item',onclick:openCreateChooser},
    el('div',{class:'sm-add'}, '+', el('span',{class:'sm-add-plus'},'+')),
    el('div',{class:'sm-label'},'তোমার Story')
  );
  bar.appendChild(addTile);
  const groups = await loadFeed();
  groups.forEach((g,i)=>{
    const ring = el('div',{class:'sm-ring'+(g.allSeen?' seen':'')},
      el('div',{class:'sm-avatar',style:{backgroundImage:profAvatarBg(g.profile)}},
        g.profile.avatar_url?'':profInitial(g.profile))
    );
    const item = el('div',{class:'sm-item',onclick:()=>openViewer(groups,i,0)},
      ring,
      el('div',{class:'sm-label'}, g.isMine?'তুমি':profName(g.profile))
    );
    bar.appendChild(item);
  });
}

// -- Create chooser --
function openCreateChooser(){
  closeAllOverlays();
  const page = el('div',{class:'sm-page'});
  page.appendChild(el('div',{class:'sm-topbar'},
    el('button',{class:'sm-back',onclick:closeAllOverlays},'✕'),
    el('div',{class:'sm-title'},'Story তৈরি করো')
  ));
  const body = el('div',{class:'sm-body'});
  const grid = el('div',{class:'sm-choose-grid'});
  grid.appendChild(el('div',{class:'sm-choose-tile sm-tile-text',onclick:()=>openTextEditor()},
    el('div',{class:'sm-choose-icon'},'✎'),
    el('div',{class:'sm-choose-cap'},'টেক্সট Story')
  ));
  grid.appendChild(el('div',{class:'sm-choose-tile sm-tile-photo',onclick:openPhotoPicker},
    el('div',{class:'sm-choose-icon'},'📷'),
    el('div',{class:'sm-choose-cap'},'ছবি/ভিডিও')
  ));
  body.appendChild(grid);
  body.appendChild(el('div',{style:{height:'18px'}}));
  body.appendChild(el('div',{class:'sm-list-row',onclick:()=>openArchivePage()},
    el('div',{class:'sm-list-icon'},'🗄️'),
    el('div',{class:'sm-list-main'},
      el('div',{class:'sm-list-title'},'তোমার Story Archive'),
      el('div',{class:'sm-list-sub'},'পুরনো Story গুলো এখানে জমা থাকে')),
    el('div',{class:'sm-list-caret'},'›')));
  body.appendChild(el('div',{class:'sm-list-row',onclick:()=>openHighlightsManager()},
    el('div',{class:'sm-list-icon'},'⭐'),
    el('div',{class:'sm-list-main'},
      el('div',{class:'sm-list-title'},'Highlights'),
      el('div',{class:'sm-list-sub'},'তোমার প্রোফাইলে Story রাখো')),
    el('div',{class:'sm-list-caret'},'›')));
  page.appendChild(body);
  ensureMount().appendChild(page);
}

// -- Text editor --
function openTextEditor(existing){
  closeAllOverlays();
  const draft={
    type:'text',
    bg: existing?existing.bg:TEXT_BGS[0],
    text_content: existing?existing.text_content:'',
    text_font: existing?existing.text_font:'sans',
    text_color: existing?existing.text_color:'#ffffff',
    text_align:'center', text_x:0.5, text_y:0.5,
    privacy: localStorage.getItem('sm_default_privacy') || 'public',
    include:[], exclude:[]
  };
  const page = el('div',{class:'sm-page',style:{background:'#000'}});
  page.appendChild(el('div',{class:'sm-topbar',style:{background:'rgba(0,0,0,.7)',borderBottom:'none'}},
    el('button',{class:'sm-back',onclick:closeAllOverlays},'✕'),
    el('div',{class:'sm-title'},'টেক্সট Story'),
    el('button',{class:'sm-topbtn',onclick:()=>openPrivacyPage(draft,()=>publishDraft(draft))},'পরবর্তী')
  ));
  const canvasWrap = el('div',{class:'sm-canvas-wrap'});
  const canvasBg = el('div',{class:'sm-canvas-bg'});
  applyBg(canvasBg, draft.bg);
  const textNode = el('div',{class:'sm-canvas-text',contenteditable:'true','data-placeholder':'কিছু লিখো...'});
  applyTextStyle(textNode, draft);
  textNode.textContent = draft.text_content;
  textNode.style.left = (draft.text_x*100)+'%';
  textNode.style.top  = (draft.text_y*100)+'%';
  makeDraggable(textNode, canvasWrap, (x,y)=>{ draft.text_x=x; draft.text_y=y; });
  textNode.addEventListener('input',()=>{ draft.text_content=textNode.textContent; });
  canvasWrap.appendChild(canvasBg);
  canvasWrap.appendChild(textNode);
  page.appendChild(canvasWrap);
  // tools
  const tools = el('div',{class:'sm-tools'});
  const bgRow = el('div',{class:'sm-tool-row'});
  TEXT_BGS.forEach((bg,i)=>{
    const sw = el('div',{class:'sm-swatch'+(i===0?' on':''),style:{background: bg.kind==='color'?bg.value:bg.value}, onclick:()=>{
      $$('.sm-swatch',bgRow).forEach(x=>x.classList.remove('on')); sw.classList.add('on');
      draft.bg=bg; applyBg(canvasBg,bg);
    }});
    bgRow.appendChild(sw);
  });
  tools.appendChild(bgRow);
  const fontRow = el('div',{class:'sm-tool-row'});
  FONTS.forEach(f=>{
    const c=el('div',{class:'sm-chip'+(f.key===draft.text_font?' on':''),style:{fontFamily:f.css,fontWeight:f.weight||500,fontStyle:f.style||'normal'},onclick:()=>{
      $$('.sm-chip',fontRow).forEach(x=>x.classList.remove('on')); c.classList.add('on');
      draft.text_font=f.key; applyTextStyle(textNode,draft);
    }},'Aa');
    fontRow.appendChild(c);
  });
  tools.appendChild(fontRow);
  const colorRow = el('div',{class:'sm-tool-row'});
  TEXT_COLORS.forEach(col=>{
    const sw=el('div',{class:'sm-swatch'+(col===draft.text_color?' on':''),style:{background:col},onclick:()=>{
      $$('.sm-swatch',colorRow).forEach(x=>x.classList.remove('on')); sw.classList.add('on');
      draft.text_color=col; applyTextStyle(textNode,draft);
    }});
    colorRow.appendChild(sw);
  });
  tools.appendChild(colorRow);
  const alignRow = el('div',{class:'sm-tool-row'});
  ['left','center','right'].forEach(a=>{
    const c=el('div',{class:'sm-chip'+(a===draft.text_align?' on':''),onclick:()=>{
      $$('.sm-chip',alignRow).forEach(x=>x.classList.remove('on')); c.classList.add('on');
      draft.text_align=a; textNode.style.textAlign=a;
    }}, a==='left'?'বামে':(a==='center'?'মাঝে':'ডানে'));
    alignRow.appendChild(c);
  });
  tools.appendChild(alignRow);
  page.appendChild(tools);
  ensureMount().appendChild(page);
  setTimeout(()=>textNode.focus(),50);
}
function applyBg(node,bg){
  node.style.background = bg.kind==='color' ? bg.value : bg.value;
  node.style.backgroundSize = 'cover';
}
function applyTextStyle(node,draft){
  const f=FONTS.find(x=>x.key===draft.text_font)||FONTS[0];
  node.style.fontFamily=f.css;
  node.style.fontWeight=f.weight||500;
  node.style.fontStyle=f.style||'normal';
  node.style.color=draft.text_color;
  node.style.textAlign=draft.text_align;
}
function makeDraggable(node,parent,onMove){
  // FB-style behaviour: a plain tap/click still places the text caret (contenteditable
  // keeps working normally). Only once the finger/mouse actually moves past a small
  // threshold do we treat it as a drag and reposition the text box. The old version
  // bailed out of dragging entirely whenever the node was focused — since the text
  // box auto-focuses when you open the editor, that made it basically impossible to
  // ever move by touch.
  const THRESH=6;
  let tracking=false, dragging=false, sx=0, sy=0, ox=0, oy=0;
  const start=(e)=>{
    tracking=true; dragging=false;
    const p=e.touches?e.touches[0]:e;
    sx=p.clientX; sy=p.clientY;
    const r=parent.getBoundingClientRect();
    ox=parseFloat(node.style.left)/100*r.width;
    oy=parseFloat(node.style.top)/100*r.height;
  };
  const move=(e)=>{
    if(!tracking) return;
    const p=e.touches?e.touches[0]:e;
    const dx=p.clientX-sx, dy=p.clientY-sy;
    if(!dragging){
      if(Math.hypot(dx,dy)<THRESH) return;
      dragging=true;
      // moving now — blur so the on-screen keyboard/caret doesn't fight the drag
      if(document.activeElement===node) node.blur();
      node.style.cursor='grabbing';
    }
    e.preventDefault();
    const r=parent.getBoundingClientRect();
    const nx=Math.max(0,Math.min(r.width, ox+dx));
    const ny=Math.max(0,Math.min(r.height,oy+dy));
    node.style.left=(nx/r.width*100)+'%';
    node.style.top =(ny/r.height*100)+'%';
    onMove(nx/r.width, ny/r.height);
  };
  const end=(e)=>{
    if(dragging && e && e.cancelable) e.preventDefault(); // stop the trailing click from refocusing/placing caret oddly
    tracking=false; dragging=false; node.style.cursor='grab';
  };
  node.addEventListener('mousedown',start);
  window.addEventListener('mousemove',move);
  window.addEventListener('mouseup',end);
  node.addEventListener('touchstart',start,{passive:true});
  window.addEventListener('touchmove',move,{passive:false});
  window.addEventListener('touchend',end);
}

// ---------- pinch-to-zoom / pan for photo & video story backgrounds ----------
function makeZoomable(mediaEl, wrap, onChange){
  let scale=1, tx=0, ty=0;
  let startDist=0, startScale=1;
  let panning=false, sx=0, sy=0, ox=0, oy=0;
  let lastTap=0;
  wrap.style.touchAction='none';
  mediaEl.style.transformOrigin='center center';
  function apply(){
    mediaEl.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`;
    onChange && onChange(scale,tx,ty);
  }
  function dist(a,b){ return Math.hypot(b.clientX-a.clientX, b.clientY-a.clientY); }
  wrap.addEventListener('touchstart',(e)=>{
    if(e.touches.length===2){
      startDist=dist(e.touches[0],e.touches[1]);
      startScale=scale;
      panning=false;
    } else if(e.touches.length===1){
      panning=true;
      sx=e.touches[0].clientX; sy=e.touches[0].clientY;
      ox=tx; oy=ty;
    }
  },{passive:true});
  wrap.addEventListener('touchmove',(e)=>{
    if(e.touches.length===2){
      e.preventDefault();
      const d=dist(e.touches[0],e.touches[1]);
      scale=Math.min(4,Math.max(1,startScale*(d/(startDist||d))));
      apply();
    } else if(e.touches.length===1 && panning && scale>1){
      e.preventDefault();
      tx=ox+(e.touches[0].clientX-sx);
      ty=oy+(e.touches[0].clientY-sy);
      apply();
    }
  },{passive:false});
  wrap.addEventListener('touchend',(e)=>{
    if(e.touches.length===0){
      panning=false;
      const now=Date.now();
      if(now-lastTap<300){ scale=1; tx=0; ty=0; apply(); } // double-tap to reset zoom
      lastTap=now;
    }
  });
  // desktop convenience: mouse wheel to zoom
  wrap.addEventListener('wheel',(e)=>{
    e.preventDefault();
    scale=Math.min(4,Math.max(1, scale - e.deltaY*0.0015));
    apply();
  },{passive:false});
  return { get:()=>({scale,tx,ty}) };
}

// -- Photo/video editor --
function openPhotoPicker(){
  const input=el('input',{type:'file',accept:'image/*,video/*',style:{display:'none'},onchange:async(e)=>{
    const f=e.target.files[0]; if(!f) return;
    openPhotoEditor(f);
  }});
  document.body.appendChild(input); input.click(); setTimeout(()=>input.remove(),0);
}
function openPhotoEditor(file){
  closeAllOverlays();
  const isVideo = file.type.startsWith('video/');
  const url = URL.createObjectURL(file);
  const draft={
    type: isVideo?'video':'image',
    _file:file, _url:url,
    text_content:'', text_font:'sans', text_color:'#ffffff', text_align:'center',
    text_x:0.5, text_y:0.5,
    privacy: localStorage.getItem('sm_default_privacy') || 'public',
    include:[], exclude:[], mentions:[]
  };
  const page = el('div',{class:'sm-page',style:{background:'#000'}});
  page.appendChild(el('div',{class:'sm-topbar',style:{background:'rgba(0,0,0,.7)',borderBottom:'none'}},
    el('button',{class:'sm-back',onclick:closeAllOverlays},'✕'),
    el('div',{class:'sm-title'}, isVideo?'ভিডিও Story':'ছবি Story'),
    el('button',{class:'sm-topbtn',onclick:()=>openPrivacyPage(draft,()=>publishDraft(draft))},'পরবর্তী')
  ));
  const canvasWrap = el('div',{class:'sm-canvas-wrap'});
  const canvasBg = el('div',{class:'sm-canvas-bg'});
  const mediaEl = isVideo? el('video',{src:url,autoplay:'',loop:'',muted:'',playsinline:''}) : el('img',{src:url});
  canvasBg.appendChild(mediaEl);
  // pinch/drag/double-tap to zoom & pan the photo, like FB — the resulting crop is
  // baked into the uploaded image at publish time (see publishDraft).
  draft._zoom={scale:1,tx:0,ty:0};
  draft._mediaEl=mediaEl; draft._canvasWrap=canvasWrap;
  makeZoomable(mediaEl, canvasBg, (scale,tx,ty)=>{ draft._zoom={scale,tx,ty}; });
  const textNode=el('div',{class:'sm-canvas-text',contenteditable:'true'});
  applyTextStyle(textNode,draft);
  textNode.style.left='50%'; textNode.style.top='50%';
  textNode.addEventListener('input',()=>draft.text_content=textNode.textContent);
  makeDraggable(textNode,canvasWrap,(x,y)=>{draft.text_x=x;draft.text_y=y;});
  canvasWrap.appendChild(canvasBg);
  canvasWrap.appendChild(textNode);
  // FABs
  const fabs=el('div',{class:'sm-fabs'});
  fabs.appendChild(el('button',{class:'sm-fab',title:'টেক্সট',onclick:()=>textNode.focus()},'T'));
  fabs.appendChild(el('button',{class:'sm-fab',title:'Mention',onclick:()=>openMentionPicker(m=>{
    const chip=el('span',{style:{color:'#4CC9F0',fontWeight:'700'}}, '@'+profName(m));
    textNode.appendChild(document.createTextNode(' '));
    textNode.appendChild(chip);
    draft.mentions.push({uuid:m.uuid,x:0.5,y:0.9});
  })},'@'));
  fabs.appendChild(el('button',{class:'sm-fab',title:'Sticker',onclick:()=>{
    const emojis=['😀','😍','🔥','💯','🎉','❤️','👍','⭐'];
    const e=emojis[Math.floor(Math.random()*emojis.length)];
    textNode.textContent = (textNode.textContent||'') + ' ' + e;
    draft.text_content=textNode.textContent;
  }},'😀'));
  canvasWrap.appendChild(fabs);
  page.appendChild(canvasWrap);
  // tools: text color + font
  const tools=el('div',{class:'sm-tools'});
  const fontRow=el('div',{class:'sm-tool-row'});
  FONTS.forEach(f=>{
    const c=el('div',{class:'sm-chip'+(f.key===draft.text_font?' on':''),style:{fontFamily:f.css},onclick:()=>{
      $$('.sm-chip',fontRow).forEach(x=>x.classList.remove('on')); c.classList.add('on');
      draft.text_font=f.key; applyTextStyle(textNode,draft);
    }},'Aa');
    fontRow.appendChild(c);
  });
  tools.appendChild(fontRow);
  const colorRow=el('div',{class:'sm-tool-row'});
  TEXT_COLORS.forEach(col=>{
    const sw=el('div',{class:'sm-swatch'+(col===draft.text_color?' on':''),style:{background:col},onclick:()=>{
      $$('.sm-swatch',colorRow).forEach(x=>x.classList.remove('on')); sw.classList.add('on');
      draft.text_color=col; applyTextStyle(textNode,draft);
    }});
    colorRow.appendChild(sw);
  });
  tools.appendChild(colorRow);
  page.appendChild(tools);
  ensureMount().appendChild(page);
}

// -- Privacy page --
function openPrivacyPage(draft,onDone){
  const page=el('div',{class:'sm-page'});
  page.appendChild(el('div',{class:'sm-topbar'},
    el('button',{class:'sm-back',onclick:()=>page.remove()},'‹'),
    el('div',{class:'sm-title'},'Story privacy'),
    el('button',{class:'sm-topbtn',onclick:()=>{
      localStorage.setItem('sm_default_privacy',draft.privacy);
      page.remove();
      onDone && onDone();
    }},'পোস্ট')
  ));
  const body=el('div',{class:'sm-body'});
  body.appendChild(el('div',{style:{fontSize:'12px',color:'var(--sm-muted)',marginBottom:'6px'}},'তোমার Story কে দেখতে পারবে সেটা বেছে নাও।'));
  const opts=[
    {v:'public',t:'Public',s:'যেকেউ দেখতে পারবে',i:'🌐'},
    {v:'friends',t:'Friends',s:'শুধু বন্ধুরা',i:'👥'},
    {v:'exclude',t:'Friends, except...',s:'বন্ধুদের মধ্যে কিছু জনকে বাদ দাও',i:'🚫'},
    {v:'custom',t:'Specific friends',s:'শুধু কিছু বন্ধুরা দেখবে',i:'🎯'}
  ];
  const rows=[];
  opts.forEach(o=>{
    const radio=el('div',{class:'sm-priv-radio'+((o.v==='exclude'?draft.exclude.length>0 && draft.privacy==='friends':draft.privacy===o.v)?' on':'')});
    const row=el('div',{class:'sm-priv-row',onclick:async()=>{
      rows.forEach(r=>r.querySelector('.sm-priv-radio').classList.remove('on'));
      radio.classList.add('on');
      if(o.v==='exclude'){
        draft.privacy='friends';
        openFriendsPicker({title:'কাদের কাছ থেকে লুকাবে?',initial:draft.exclude,onDone:(list)=>{ draft.exclude=list; toast(list.length+' জনকে লুকানো হবে'); }});
      } else if(o.v==='custom'){
        draft.privacy='custom';
        openFriendsPicker({title:'কারা দেখতে পাবে?',initial:draft.include,onDone:(list)=>{ draft.include=list; toast(list.length+' জন দেখতে পাবে'); }});
      } else {
        draft.privacy=o.v;
      }
    }},
      el('div',{class:'sm-priv-icon'},o.i),
      el('div',{style:{flex:1}},
        el('div',{style:{fontSize:'14px',fontWeight:600,color:'var(--sm-text)'}},o.t),
        el('div',{style:{fontSize:'11px',color:'var(--sm-muted)',marginTop:'2px'}},o.s)
      ),
      radio
    );
    rows.push(row); body.appendChild(row);
  });
  page.appendChild(body);
  ensureMount().appendChild(page);
}

// -- Friends picker --
async function openFriendsPicker({title,initial=[],onDone,multi=true}){
  const page=el('div',{class:'sm-page'});
  const selected=new Set(initial);
  page.appendChild(el('div',{class:'sm-topbar'},
    el('button',{class:'sm-back',onclick:()=>page.remove()},'‹'),
    el('div',{class:'sm-title'},title||'বন্ধু বেছে নাও'),
    el('button',{class:'sm-topbtn',onclick:()=>{ onDone && onDone([...selected]); page.remove(); }},'হয়ে গেছে')
  ));
  const body=el('div',{class:'sm-body'});
  const search=el('input',{class:'sm-search',placeholder:'বন্ধু খোঁজো...'});
  body.appendChild(search);
  const list=el('div'); body.appendChild(list);
  page.appendChild(body);
  ensureMount().appendChild(page);
  const friends=await loadFriends();
  const render=(q='')=>{
    list.innerHTML='';
    const ql=q.trim().toLowerCase();
    friends.filter(f=>!ql || profName(f).toLowerCase().includes(ql)).forEach(f=>{
      const check=el('div',{class:'sm-check'+(selected.has(f.uuid)?' on':'')}, selected.has(f.uuid)?'✓':'');
      const row=el('div',{class:'sm-frow',onclick:()=>{
        if(!multi){ selected.clear(); selected.add(f.uuid); onDone && onDone([...selected]); page.remove(); return; }
        if(selected.has(f.uuid)){ selected.delete(f.uuid); check.classList.remove('on'); check.textContent=''; }
        else { selected.add(f.uuid); check.classList.add('on'); check.textContent='✓'; }
      }},
        el('div',{class:'sm-vava',style:{backgroundImage:profAvatarBg(f)}},f.avatar_url?'':profInitial(f)),
        el('div',{class:'sm-frow-name'},profName(f)),
        check
      );
      list.appendChild(row);
    });
    if(!friends.length) list.appendChild(el('div',{style:{padding:'20px',textAlign:'center',color:'var(--sm-muted)',fontSize:'13px'}},'কোনো বন্ধু পাওয়া যায়নি'));
  };
  render();
  search.addEventListener('input',e=>render(e.target.value));
}

// -- Mention picker --
async function openMentionPicker(cb){
  await openFriendsPicker({title:'কাকে mention করবে?',multi:false,onDone:async(list)=>{
    if(!list.length) return;
    const profs=await fetchProfiles(list);
    cb(profs[list[0]]);
  }});
}

// -- Publish --
// bakes the on-screen pinch-zoom/pan crop into an actual image file, so the story
// looks the same to everyone as it did to you while creating it.
function bakeImageCrop(mediaEl, rect, zoom){
  return new Promise((resolve)=>{
    try{
      const cw=rect.width, ch=rect.height;
      if(!cw || !ch || !mediaEl.naturalWidth){ resolve(null); return; }
      const OUT_W=1080, OUT_H=Math.round(OUT_W*ch/cw), k=OUT_W/cw;
      const canvas=document.createElement('canvas');
      canvas.width=OUT_W; canvas.height=OUT_H;
      const ctx=canvas.getContext('2d');
      const natW=mediaEl.naturalWidth, natH=mediaEl.naturalHeight;
      const coverScale=Math.max(cw/natW, ch/natH)*(zoom.scale||1);
      const dispW=natW*coverScale, dispH=natH*coverScale;
      const ix0=(cw-dispW)/2+(zoom.tx||0), iy0=(ch-dispH)/2+(zoom.ty||0);
      ctx.drawImage(mediaEl, ix0*k, iy0*k, dispW*k, dispH*k);
      canvas.toBlob(blob=>resolve(blob), 'image/jpeg', 0.85);
    }catch(e){ resolve(null); }
  });
}
// Fallback compression for story images that weren't zoomed/panned (so
// bakeImageCrop never ran), and also re-tightens whatever bakeImageCrop
// produced. Adaptive: tries to hit a target size without dropping quality
// below a floor (keeps faces/detail clear) — only shrinks resolution
// further if the floor quality still isn't small enough.
function compressImageFile(file, opts={}){
  const maxDim=opts.maxDim||1080, baseQuality=opts.quality||0.85;
  const targetBytes=opts.targetBytes||190000, minQuality=opts.minQuality||0.62, minDim=opts.minDim||900;
  return new Promise((resolve)=>{
    try{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>{
        const natW=img.naturalWidth, natH=img.naturalHeight;
        if(!natW || !natH){ URL.revokeObjectURL(url); resolve(file); return; }
        (async()=>{
          let dim=Math.min(maxDim, Math.max(natW,natH));
          let bestBlob=null;
          try{
            while(true){
              const scale=Math.min(1, dim/Math.max(natW,natH));
              const w=Math.max(1,Math.round(natW*scale)), h=Math.max(1,Math.round(natH*scale));
              const canvas=document.createElement('canvas');
              canvas.width=w; canvas.height=h;
              canvas.getContext('2d').drawImage(img,0,0,w,h);
              const toBlobP=q=>new Promise(res=>canvas.toBlob(b=>res(b),'image/jpeg',q));
              let q=baseQuality, blob=await toBlobP(q);
              while(blob && blob.size>targetBytes && q>minQuality){ q-=0.08; blob=await toBlobP(q); }
              if(blob) bestBlob=blob;
              if((blob && blob.size<=targetBytes) || dim<=minDim) break;
              dim=Math.max(minDim, Math.round(dim*0.85));
            }
          }catch(e){}
          URL.revokeObjectURL(url);
          if(!bestBlob || bestBlob.size>=file.size){ resolve(file); return; }
          resolve(new File([bestBlob], (file.name||'story').replace(/\.\w+$/,'')+'.jpg', {type:'image/jpeg'}));
        })();
      };
      img.onerror=()=>{ URL.revokeObjectURL(url); resolve(file); };
      img.src=url;
    }catch(e){ resolve(file); }
  });
}
async function publishDraft(draft){
  const me=myUuid(); if(!me){ toast('লগইন প্রয়োজন'); return; }
  toast('আপলোড হচ্ছে...');
  let media_url=null, dur=DEFAULT_DURATION, bg=draft.bg||null;
  if(draft.type==='image' && draft._zoom && draft._mediaEl && draft._canvasWrap &&
     (draft._zoom.scale!==1 || draft._zoom.tx || draft._zoom.ty)){
    const rect=draft._canvasWrap.getBoundingClientRect();
    const blob=await bakeImageCrop(draft._mediaEl, rect, draft._zoom);
    if(blob) draft._file=new File([blob], (draft._file.name||'story').replace(/\.\w+$/,'')+'.jpg', {type:'image/jpeg'});
  }
  if(draft.type==='image' && draft._file){
    draft._file = await compressImageFile(draft._file); // no-op if the crop step already shrank it
  }
  if(draft.type==='image' || draft.type==='video'){
    media_url = await uploadMedia(draft._file);
    if(!media_url){ return; }
    if(draft.type==='video') dur = 20;
  }
  const payload={
    type:draft.type,
    bg: bg,
    text_content: draft.text_content||null,
    text_font: draft.text_font||null,
    text_color: draft.text_color||null,
    text_align: draft.text_align||'center',
    text_x: draft.text_x||0.5,
    text_y: draft.text_y||0.5,
    media_url,
    duration_sec: dur,
    privacy: draft.privacy||'public',
    allow_replies: true,
  };
  const row = await insertStory(payload, draft.mentions||[], draft.include||[], draft.exclude||[]);
  if(row){
    toast('Story পোস্ট হয়েছে ✓');
    closeAllOverlays();
    renderBar();
  }
}

// ================= VIEWER =================
let VS=null; // viewer state
function openViewer(groups, gi, si){
  closeAllOverlays();
  VS={groups, gi, si, timer:null, start:0, paused:false, elapsed:0};
  const v=el('div',{class:'sm-viewer'});
  v.id='smViewer';
  v.appendChild(el('div',{class:'sm-vprog',id:'smProg'}));
  v.appendChild(el('div',{class:'sm-vhead',id:'smHead'}));
  const body=el('div',{class:'sm-vbody',id:'smBody'});
  body.appendChild(el('div',{class:'sm-tapz sm-tapl',onclick:tapPrev}));
  body.appendChild(el('div',{class:'sm-tapz sm-tapr',onclick:tapNext}));
  body.appendChild(el('div',{class:'sm-flylayer',id:'smFly'}));
  // hold-to-pause
  body.addEventListener('mousedown',()=>{ VS.paused=true; pauseTimer(); });
  body.addEventListener('mouseup',()=>{ VS.paused=false; resumeTimer(); });
  body.addEventListener('touchstart',()=>{ VS.paused=true; pauseTimer(); },{passive:true});
  body.addEventListener('touchend',()=>{ VS.paused=false; resumeTimer(); });
  v.appendChild(body);
  v.appendChild(el('div',{id:'smFoot'}));
  ensureMount().appendChild(v);
  playCurrent();
}
function tapPrev(){ if(!VS) return;
  if(VS.si>0){ VS.si--; playCurrent(); }
  else if(VS.gi>0){ VS.gi--; VS.si=0; playCurrent(); }
}
function tapNext(){ if(!VS) return;
  const g=VS.groups[VS.gi];
  if(VS.si < g.items.length-1){ VS.si++; playCurrent(); }
  else if(VS.gi < VS.groups.length-1){ VS.gi++; VS.si=0; playCurrent(); }
  else closeViewer();
}
function closeViewer(){ if(!VS) return; pauseTimer(); VS=null; closeAllOverlays(); renderBar(); }
function pauseTimer(){ if(VS && VS.timer){ clearInterval(VS.timer); VS.timer=null; } }
function resumeTimer(){ if(!VS||VS.paused) return; startTimer(true); }
function startTimer(resume=false){
  const g=VS.groups[VS.gi], s=g.items[VS.si];
  const dur=(s.duration_sec||DEFAULT_DURATION)*1000;
  const startElapsed=resume?VS.elapsed:0;
  VS.start = Date.now()-startElapsed;
  const fill = document.querySelector('#smProg .sm-vseg.active .sm-vfill');
  VS.timer=setInterval(()=>{
    if(VS.paused) return;
    VS.elapsed = Date.now()-VS.start;
    const pct=Math.min(100, VS.elapsed/dur*100);
    if(fill) fill.style.width=pct+'%';
    if(pct>=100){ clearInterval(VS.timer); VS.timer=null; tapNext(); }
  },50);
}
async function playCurrent(){
  if(!VS) return;
  pauseTimer(); VS.elapsed=0;
  const g=VS.groups[VS.gi], s=g.items[VS.si];
  // progress segments
  const prog=$('#smProg');
  prog.innerHTML='';
  g.items.forEach((_,i)=>{
    const seg=el('div',{class:'sm-vseg'+(i===VS.si?' active':'')}, el('span',{class:'sm-vfill',style:{width: i<VS.si?'100%':'0'}}));
    prog.appendChild(seg);
  });
  // head
  const head=$('#smHead');
  head.innerHTML='';
  head.appendChild(el('div',{class:'sm-vava',style:{backgroundImage:profAvatarBg(g.profile)}}, g.profile.avatar_url?'':profInitial(g.profile)));
  head.appendChild(el('div',{style:{flex:1,minWidth:0}},
    el('div',{class:'sm-vname'},g.isMine?'তুমি':profName(g.profile)),
    el('div',{class:'sm-vtime'}, timeAgo(s.created_at)+' • '+(s.privacy==='public'?'🌐':s.privacy==='friends'?'👥':'🎯'))
  ));
  head.appendChild(el('button',{class:'sm-vmore',onclick:()=>openStoryMoreMenu(g,s)},'⋯'));
  head.appendChild(el('button',{class:'sm-vclose',onclick:closeViewer},'✕'));
  // body
  const body=$('#smBody');
  $$('.sm-vbg,.sm-vtext',body).forEach(n=>n.remove());
  const bg=el('div',{class:'sm-vbg'});
  if(s.type==='image' && s.media_url) bg.appendChild(el('img',{src:s.media_url}));
  else if(s.type==='video' && s.media_url) bg.appendChild(el('video',{src:s.media_url,autoplay:'',playsinline:'',muted:''}));
  else if(s.bg){
    try{ const b = typeof s.bg==='string'?JSON.parse(s.bg):s.bg; bg.style.background = b.value; }
    catch(e){ bg.style.background='#111'; }
  } else bg.style.background='#111';
  body.insertBefore(bg,body.firstChild);
  if(s.text_content){
    const t=el('div',{class:'sm-vtext'}, s.text_content);
    t.style.left = ((s.text_x||0.5)*100)+'%';
    t.style.top  = ((s.text_y||0.5)*100)+'%';
    t.style.color = s.text_color||'#fff';
    t.style.textAlign = s.text_align||'center';
    const f=FONTS.find(x=>x.key===s.text_font)||FONTS[0];
    t.style.fontFamily=f.css; t.style.fontWeight=f.weight||500; t.style.fontStyle=f.style||'normal';
    body.appendChild(t);
  }
  // @mentions dropped on the story (from openMentionPicker at creation time) —
  // previously saved to story_mentions but never actually shown/tappable in
  // the viewer. Render each as a tappable pill; tapping goes straight to
  // that person's profile, WhatsApp/Instagram-style.
  $$('.sm-vmention',body).forEach(n=>n.remove());
  fetchStoryMentions(s.id).then(mentions=>{
    if(!VS) return;
    const curG=VS.groups[VS.gi], curS=curG && curG.items[VS.si];
    if(!curS || curS.id!==s.id) return; // viewer moved on before this resolved
    mentions.forEach(m=>{
      const tag=el('div',{class:'sm-vmention',onclick:(e)=>{
        e.stopPropagation();
        const localId=(typeof uuidToLocalId==='function')?uuidToLocalId(m.uuid):null;
        closeViewer();
        if(localId!=null && typeof openUserProfile==='function') openUserProfile(localId);
      }}, '@'+profName(m.profile));
      tag.style.left=((m.x||0.5)*100)+'%';
      tag.style.top=((m.y||0.5)*100)+'%';
      body.appendChild(tag);
    });
  });
  // footer: own vs other
  const foot=$('#smFoot'); foot.innerHTML=''; foot.className='';
  if(g.isMine){
    foot.className='sm-ownfoot';
    foot.onclick=()=>openViewersSheet(s);
    const cnt = await countViewers(s.id);
    foot.appendChild(el('span',{},'👁️ Seen by '+cnt));
  } else {
    const f=el('div',{class:'sm-vfoot'});
    const quick=el('div',{class:'sm-quick'});
    REACTIONS.forEach(e=>{
      quick.appendChild(el('button',{onclick:()=>{ sendReaction(s.id,e); flyReaction(e); toast('React: '+e); }}, e));
    });
    f.appendChild(quick);
    const inp=el('input',{placeholder:'Reply to '+profName(g.profile)+'...',onkeydown:(ev)=>{
      if(ev.key==='Enter' && inp.value.trim()){
        sendReply(s.id, inp.value);
        toast('Reply পাঠানো হয়েছে');
        inp.value='';
      }
    }});
    const send=el('button',{onclick:()=>{ if(inp.value.trim()){ sendReply(s.id,inp.value); toast('Reply পাঠানো হয়েছে'); inp.value=''; } }},'➤');
    f.appendChild(el('div',{class:'sm-replyrow'}, inp, send));
    foot.appendChild(f);
  }
  // record view
  recordView(s.id, g.uuid);
  startTimer(false);
}
async function countViewers(storyId){
  ensureSb(); if(!sb) return 0;
  try{ const {count}=await sb.from('story_views').select('*',{count:'exact',head:true}).eq('story_id',storyId); return count||0; }
  catch(e){ return 0; }
}
async function fetchStoryMentions(storyId){
  ensureSb(); if(!sb) return [];
  try{
    const { data, error } = await sb.from('story_mentions').select('user_id,x,y').eq('story_id', storyId);
    if(error || !data || !data.length) return [];
    const profs = await fetchProfiles(data.map(d=>d.user_id));
    return data.map(d=>({ uuid:d.user_id, x:d.x, y:d.y, profile: profs[d.user_id]||{uuid:d.user_id,name:'User'} }));
  }catch(e){ console.warn('[story mentions]', e); return []; }
}
function flyReaction(emoji){
  const layer=$('#smFly'); if(!layer) return;
  const n=el('div',{class:'sm-fly'},emoji);
  n.style.left=(20+Math.random()*60)+'%';
  layer.appendChild(n);
  setTimeout(()=>n.remove(),1300);
}

// ================= SHEETS / MENUS =================
function openSheet(title, items){
  const sheet=el('div',{class:'sm-sheet',onclick:(e)=>{ if(e.target===sheet) sheet.remove(); }});
  const inner=el('div',{class:'sm-sheet-inner'},
    el('div',{class:'sm-sheet-grab'}),
    title?el('div',{class:'sm-sheet-title'},title):null,
    el('div',{class:'sm-sheet-scroll'}, ...items.map(it=>el('div',{class:'sm-menu-item'+(it.danger?' danger':''),onclick:()=>{ sheet.remove(); it.onClick && it.onClick(); }},
      el('span',{class:'sm-mi-ic'},it.icon||''),
      el('span',{},it.label)
    )))
  );
  sheet.appendChild(inner);
  ensureMount().appendChild(sheet);
  return sheet;
}

function openStoryMoreMenu(group, story){
  pauseTimer(); VS && (VS.paused=true);
  const isMine = group.isMine;
  const onClose = ()=>{ if(VS){ VS.paused=false; resumeTimer(); } };
  const items = isMine ? [
    {icon:'@',label:'Mention', onClick:()=>openMentionPicker(m=>toast('Mention: '+profName(m)))},
    {icon:'🔒',label:'Edit story privacy', onClick:()=>editPrivacyForStory(story)},
    {icon:'✉️',label:'Send in Messenger', onClick:()=>openSendInMessenger(story)},
    {icon:'💾',label:'Save photo/video', onClick:()=>saveMedia(story)},
    {icon:'⭐',label:'Add to Highlights', onClick:()=>openAddToHighlights(story)},
    {icon:'🗄️',label:'Archive', onClick:async()=>{ await archiveStory(story.id); toast('Archived'); closeViewer(); }},
    {icon:'🗑️',label:'Delete', danger:true, onClick:async()=>{ if(confirm('Delete this story?')){ await deleteStory(story.id); toast('মুছে ফেলা হয়েছে'); closeViewer(); }}},
    {icon:'🔗',label:'Copy link', onClick:()=>copyStoryLink(story.id)},
  ] : [
    {icon:'⭐',label:'Interested', onClick:async()=>{ await setInterest(group.uuid,'interested'); toast('Marked interested'); }},
    {icon:'🚫',label:'Not interested', onClick:async()=>{ await setInterest(group.uuid,'not_interested'); toast('Not interested — hidden'); closeViewer(); }},
    {icon:'🔕',label:'Mute '+profName(group.profile)+"'s stories", onClick:async()=>{ await muteUser(group.uuid); toast('Muted'); closeViewer(); }},
    {icon:'🚩',label:'Report story', danger:true, onClick:()=>openReportSheet(story.id)},
    {icon:'🔗',label:'Copy link', onClick:()=>copyStoryLink(story.id)},
    {icon:'➕',label:'Create story', onClick:()=>{ closeViewer(); openCreateChooser(); }},
  ];
  const sheet=openSheet(null,items);
  const orig=sheet.onclick;
  sheet.addEventListener('click',(e)=>{ if(e.target===sheet) onClose(); });
}

function editPrivacyForStory(story){
  const draft={privacy:story.privacy||'public',include:[],exclude:[]};
  openPrivacyPage(draft, async()=>{
    await updatePrivacy(story.id, draft.privacy, draft.include, draft.exclude);
    toast('Privacy আপডেট হয়েছে');
  });
}
function saveMedia(story){
  if(!story.media_url){ toast('Text story — কিছু save করার নেই'); return; }
  const a=el('a',{href:story.media_url,download:'story-'+story.id});
  document.body.appendChild(a); a.click(); a.remove();
  toast('Saved');
}
function copyStoryLink(id){
  const url=location.origin+location.pathname+'#story='+id;
  navigator.clipboard && navigator.clipboard.writeText(url);
  toast('Link কপি হয়েছে');
}
function openReportSheet(storyId){
  const reasons=['Spam','Nudity','Hate speech','Violence','False information','Harassment','Something else'];
  openSheet('Report story', reasons.map(r=>({icon:'🚩',label:r,onClick:async()=>{ await reportStory(storyId,r); toast('Report জমা দেওয়া হয়েছে'); }})));
}

// -- Viewers sheet (owner) --
async function openViewersSheet(story){
  pauseTimer(); if(VS) VS.paused=true;
  const viewers = await loadViewers(story.id);
  const sheet=el('div',{class:'sm-sheet',onclick:(e)=>{ if(e.target===sheet){ sheet.remove(); if(VS){VS.paused=false; resumeTimer();} } }});
  const inner=el('div',{class:'sm-sheet-inner',style:{maxHeight:'75%'}});
  inner.appendChild(el('div',{class:'sm-sheet-grab'}));
  inner.appendChild(el('div',{class:'sm-sheet-title'}, '👁️ Seen by ('+viewers.length+')'));
  const scroll=el('div',{class:'sm-sheet-scroll'});
  if(!viewers.length) scroll.appendChild(el('div',{style:{padding:'24px',textAlign:'center',opacity:.6,fontSize:'13px'}},'এখনো কেউ দেখেনি'));
  viewers.forEach(v=>{
    const row=el('div',{class:'sm-vrow'},
      el('div',{class:'sm-vava',style:{backgroundImage:profAvatarBg(v.profile)}}, v.profile.avatar_url?'':profInitial(v.profile)),
      el('div',{class:'sm-vrow-main'},
        el('div',{class:'sm-vrow-name'},profName(v.profile)),
        el('div',{class:'sm-vrow-sub'}, timeAgo(v.at))
      ),
      v.emoji?el('span',{class:'sm-vrow-react'},v.emoji):null,
      el('button',{class:'sm-vrow-more',onclick:(e)=>{ e.stopPropagation(); openViewerRowMenu(v); }},'⋯')
    );
    scroll.appendChild(row);
  });
  inner.appendChild(scroll);
  sheet.appendChild(inner);
  ensureMount().appendChild(sheet);
}
function openViewerRowMenu(v){
  const me=myUuid();
  openSheet(profName(v.profile), [
    {icon:'💬',label:'Message', onClick:()=>toast('Messenger: '+profName(v.profile))},
    {icon:'👤',label:'View profile', onClick:()=>toast('Profile: '+profName(v.profile))},
    {icon:'🚫',label:'Hide my story from '+profName(v.profile), onClick:async()=>{ await hideFromViewer(me, v.uuid); toast('Hidden'); }},
    {icon:'🚩',label:'Report', danger:true, onClick:()=>openReportSheet(null)},
  ]);
}

// -- Send in Messenger --
async function openSendInMessenger(story){
  openFriendsPicker({title:'Send in Messenger',onDone:async(list)=>{
    if(!list.length) return;
    // best-effort: try to insert into a messages table if it exists
    ensureSb(); const me=myUuid();
    let sent=0;
    for(const to of list){
      try{
        await sb.from('messages').insert({user_id:me, receiver_uuid:to, type:'story_share', story_id:story.id, text:'📸 Story share করলো'});
        sent++;
      }catch(e){ /* silent */ }
    }
    if(sent) toast('Sent to '+sent);
    else toast('Sent (Messenger integration আসছে)');
  }});
}

// -- Highlights --
async function openAddToHighlights(story){
  ensureSb(); const me=myUuid(); if(!sb||!me) return;
  const {data} = await sb.from('story_highlights').select('*').eq('user_id',me).order('created_at',{ascending:false});
  const items=[
    {icon:'➕',label:'New highlight', onClick:()=>{
      const title=prompt('Highlight-এর নাম?','My Highlight');
      if(!title) return;
      (async()=>{
        const {data:hl}=await sb.from('story_highlights').insert({user_id:me,title,cover_url:story.media_url||null}).select().single();
        if(hl){
          await sb.from('stories').update({highlight_id:hl.id}).eq('id',story.id);
          toast('Highlight তৈরি হয়েছে');
        }
      })();
    }},
    ...(data||[]).map(h=>({icon:'⭐',label:h.title, onClick:async()=>{
      await sb.from('stories').update({highlight_id:h.id}).eq('id',story.id);
      toast('Added to '+h.title);
    }}))
  ];
  openSheet('Add to Highlights',items);
}
function openHighlightsManager(){
  toast('Highlights section — profile page-এ দেখা যাবে');
}

// -- Archive page (own expired stories) --
async function openArchivePage(){
  closeAllOverlays();
  const page=el('div',{class:'sm-page'});
  page.appendChild(el('div',{class:'sm-topbar'},
    el('button',{class:'sm-back',onclick:closeAllOverlays},'‹'),
    el('div',{class:'sm-title'},'Story Archive')
  ));
  const body=el('div',{class:'sm-body'});
  ensureSb(); const me=myUuid();
  if(sb && me){
    const {data} = await sb.from('stories').select('*').eq('user_id',me).order('created_at',{ascending:false}).limit(200);
    const grid=el('div',{style:{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'6px'}});
    (data||[]).forEach(s=>{
      const tile=el('div',{style:{aspectRatio:'9/16',borderRadius:'10px',background:s.media_url?`url('${s.media_url}') center/cover`:(s.bg&&s.bg.value)||'#222',cursor:'pointer',display:'flex',alignItems:'flex-end',padding:'6px',color:'#fff',fontSize:'10px',fontWeight:600,textShadow:'0 1px 4px rgba(0,0,0,.6)'},onclick:()=>{
        openViewer([{uuid:me,items:[s],profile:myProfile(),isMine:true,allSeen:false}],0,0);
      }}, timeAgo(s.created_at));
      grid.appendChild(tile);
    });
    body.appendChild(grid);
    if(!data||!data.length) body.appendChild(el('div',{style:{textAlign:'center',padding:'40px',color:'var(--sm-muted)'}},'কোনো পুরনো Story নেই'));
  }
  page.appendChild(body);
  ensureMount().appendChild(page);
}

// ---------- deep-link ----------
async function handleDeepLink(){
  const h=location.hash;
  const m=/#story=([a-f0-9-]+)/i.exec(h);
  if(!m) return;
  ensureSb(); if(!sb) return;
  const {data} = await sb.from('stories').select('*').eq('id',m[1]).maybeSingle();
  if(data){
    const profs=await fetchProfiles([data.user_id]);
    openViewer([{uuid:data.user_id,items:[data],profile:profs[data.user_id]||{uuid:data.user_id,name:'User'},isMine:data.user_id===myUuid(),allSeen:false}],0,0);
  }
}

// ---------- boot ----------
function boot(){
  ensureSb();
  // remove any legacy DOM
  const oldViewer=document.getElementById('storyViewer');
  if(oldViewer) oldViewer.remove();
  // neutralise legacy global functions so old calls become no-ops
  const legacyFns=['renderStories','openAddStory','viewStory','addStory','closeStoryViewer','runStoryProgress','pauseStoryTimer','resumeStoryTimer','storyTapNext','storyTapPrev','sendStoryReply','reactToStory','openStoryViewers','closeStoryViewers','loadStoriesFromSupabase','pruneExpiredStories','_regroupStoriesByUser','_loadMySeenStoryViews','sbInsertStory','sbAddStoryView','sbFetchStoryViewers','storyReplyKeydown','flyStoryReaction','muteCurrentStoryUser','viewStoryFromChatList','selectStoryVisibility','selectStoryBg','selectStoryFont','selectStoryTextColor','selectStoryAlign','selectStoryImgFit','_applyStoryCanvasImg','removeStoryImg','updateStoryPreview','handleStoryImg'];
  legacyFns.forEach(fn=>{
    try{ window[fn] = fn==='renderStories' ? renderBar : function(){}; }catch(e){}
  });
  renderBar();
  setTimeout(handleDeepLink, 400);
  // refresh bar periodically
  setInterval(()=>{ if(!document.hidden) renderBar(); }, 60000);
  // expose
  window.CampusAddaStories = {
    renderBar, openCreateChooser, openViewer, openArchivePage, openHighlightsManager
  };
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
else boot();
})();
