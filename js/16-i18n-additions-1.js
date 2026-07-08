
(function(){
  if(!window.I18N) return;

  const getLang = () => (window.currentLang || (typeof settings!=='undefined' && settings.language) || 'bn');

  // ---------- 1. Namespaces (informational — swaps below use direct maps) ----------
  I18N.bn.posts = Object.assign({}, I18N.bn.posts||{}, {
    emptyFeed:"এখনো কোনো পোস্ট নেই",
  });
  I18N.en.posts = Object.assign({}, I18N.en.posts||{}, {
    emptyFeed:"No posts yet",
  });
  I18N.bn.comments = Object.assign({}, I18N.bn.comments||{}, {
    modalTitle:"মন্তব্যসমূহ",
    empty:"এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করো!",
    sortLabel:"সাজাও:",
    editSave:"সেভ", editCancel:"বাতিল",
    editedTag:"(edited)",
    hideReplies:"▴ রিপ্লাই লুকান",
    moreReplies:(n)=>`▾ আরো ${n}টি রিপ্লাই দেখুন`,
  });
  I18N.en.comments = Object.assign({}, I18N.en.comments||{}, {
    modalTitle:"Comments",
    empty:"No comments yet. Be the first!",
    sortLabel:"Sort:",
    editSave:"Save", editCancel:"Cancel",
    editedTag:"(edited)",
    hideReplies:"▴ Hide replies",
    moreReplies:(n)=>`▾ Show ${n} more replies`,
  });
  I18N.bn.story = Object.assign({}, I18N.bn.story||{}, {
    replyPlaceholder:"Reply পাঠাও...",
    viewersTitle:"Story দেখেছে",
    ownViewers:"জন দেখেছে",
    closeBtn:"বন্ধ করো",
    deleteTitle:"Story delete করো",
  });
  I18N.en.story = Object.assign({}, I18N.en.story||{}, {
    replyPlaceholder:"Send a reply...",
    viewersTitle:"Viewers",
    ownViewers:"viewers",
    closeBtn:"Close",
    deleteTitle:"Delete story",
  });

  // ---------- 2. Bidirectional phrase dictionary (exact substring swaps) ----------
  // Each entry: [bnPhrase, enPhrase]. Applied in-text-node so unique bn/en
  // strings never collide with user-generated content.
  const PHRASES = [
    // Feed empty state
    ["এখনো কোনো পোস্ট নেই", "No posts yet"],
    // Comment modal
    ["মন্তব্যসমূহ", "Comments"],
    ["এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্য করো!", "No comments yet. Be the first!"],
    ["সাজাও:", "Sort:"],
    ["সেভ", "Save"],
    ["বাতিল", "Cancel"],
    ["▴ রিপ্লাই লুকান", "▴ Hide replies"],
    // Story
    ["Reply পাঠাও...", "Send a reply..."],
    ["Story দেখেছে", "Viewers"],
    ["জন দেখেছে", "viewers"],
    ["বন্ধ করো", "Close"],
    ["Story delete করো", "Delete story"],
  ];

  // Parameterized: "▾ আরো Nটি রিপ্লাই দেখুন"  ↔  "▾ Show N more replies"
  const RE_MORE_BN = /▾ আরো (\d+|[০-৯]+)টি রিপ্লাই দেখুন/g;
  const RE_MORE_EN = /▾ Show (\d+)\ more replies/g;

  function translateString(s, lang){
    if(!s) return s;
    let out = s;
    if(lang === 'en'){
      // bn -> en
      for(const [bn, en] of PHRASES){
        if(bn === en) continue;
        out = out.split(bn).join(en);
      }
      out = out.replace(RE_MORE_BN, (_,n)=>`▾ Show ${n} more replies`);
    } else {
      // en -> bn
      for(const [bn, en] of PHRASES){
        if(bn === en) continue;
        if(out.indexOf(bn) !== -1) continue; // cascade guard
        out = out.split(en).join(bn);
      }

      out = out.replace(RE_MORE_EN, (_,n)=>`▾ আরো ${n}টি রিপ্লাই দেখুন`);
    }
    return out;
  }

  // ---------- 3. Text-node walker over a subtree ----------
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SVG','PATH','CIRCLE','LINE','POLYLINE','POLYGON']);
  function walkAndTranslate(root, lang){
    if(!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        const p = n.parentNode;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        // Skip user-content nodes so we never rewrite a post/comment body
        if(p.closest && p.closest('.post-text,.comment-text,.comment-modal-post-text,.msg-text,textarea,input'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let cur; while(cur = walker.nextNode()) nodes.push(cur);
    for(const node of nodes){
      const before = node.nodeValue;
      const after  = translateString(before, lang);
      if(after !== before) node.nodeValue = after;
    }
    // Also translate placeholder/title/value attributes on inputs & buttons
    root.querySelectorAll && root.querySelectorAll('input[placeholder],[title],button').forEach(el=>{
      const ph = el.getAttribute('placeholder');
      if(ph){ const n = translateString(ph, lang); if(n!==ph) el.setAttribute('placeholder', n); }
      const tt = el.getAttribute('title');
      if(tt){ const n = translateString(tt, lang); if(n!==tt) el.setAttribute('title', n); }
    });
  }

  // ---------- 4. Container list ----------
  const CONTAINERS = [
    'postsContainer',
    'commentModalSheet',   // covers header title + scroll + footer
    'storyViewer',
    'storyViewersSheet',
  ];

  function applyAll(){
    const lang = getLang();
    CONTAINERS.forEach(id=>{
      const el = document.getElementById(id);
      if(el) walkAndTranslate(el, lang);
    });
  }

  // ---------- 5. Observers ----------
  let scheduled = false;
  function schedule(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(()=>{ scheduled = false; try { applyAll(); } catch(_){} });
  }

  function boot(){
    applyAll();
    CONTAINERS.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      new MutationObserver(schedule).observe(el, {
        childList:true, subtree:true, characterData:true,
        attributes:true, attributeFilter:['placeholder','title','class']
      });
    });
    window.addEventListener('i18n:changed', schedule);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
