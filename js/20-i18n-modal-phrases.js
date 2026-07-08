
(function(){
  if(typeof I18N==='undefined') return;

  const PHRASES = [
    // Modal titles
    ['নোটিস পোস্ট করো','Post a notice'],
    ['Lost & Found পোস্ট করো','Post to Lost & Found'],
    ['Lost &amp; Found পোস্ট করো','Post to Lost & Found'],
    ['ব্লাড রিকোয়েস্ট পোস্ট করো','Post a blood request'],
    ['ইভেন্ট যোগ করো','Add event'],
    ['নোট আপলোড করো','Upload note'],
    ['ক্লাস যোগ করো','Add class'],
    ['পরীক্ষা যোগ করো','Add exam'],
    // Common form labels
    ['শিরোনাম','Title'],
    ['বিস্তারিত','Details'],
    ['বিবরণ','Description'],
    ['ক্যাটাগরি','Category'],
    ['উপরে পিন করো','Pin to top'],
    ['পোস্ট করো','Post'],
    ['যোগ করো','Add'],
    ['আপলোড করো','Upload'],
    ['টাইপ','Type'],
    ['হারিয়েছে','Lost'],
    ['পাওয়া গেছে','Found'],
    ['স্থান (Optional)','Location (optional)'],
    ['যোগাযোগ (Optional)','Contact (optional)'],
    ['ছবি (Optional)','Photo (optional)'],
    ['কভার ইমেজ (Optional)','Cover image (optional)'],
    ['বিবরণ (Optional)','Description (optional)'],
    ['রুম নম্বর (Optional)','Room number (optional)'],
    ['যোগাযোগ (ফোন) *','Contact (phone) *'],
    ['হাসপাতাল / লোকেশন *','Hospital / Location *'],
    ['ব্লাড গ্রুপ *','Blood group *'],
    ['আর্জেন্ট (উপরে দেখানো হবে)','Urgent (will show at top)'],
    ['ইভেন্টের নাম','Event name'],
    ['তারিখ','Date'],
    ['সময়','Time'],
    ['বার','Day'],
    ['শুরুর সময়','Start time'],
    ['শেষের সময়','End time'],
    ['বিষয় (Subject)','Subject'],
    ['বিষয় (Department)','Department'],
    ['নোটের নাম','Note title'],
    ['ফাইল (PDF/ছবি)','File (PDF/photo)'],
    // Placeholders
    ['যেমন: পরীক্ষার রুটিন প্রকাশিত','e.g. Exam routine published'],
    ['নোটিসের বিস্তারিত লেখো','Write notice details'],
    ['যেমন: একটি কালো মোবাইল হারিয়েছে','e.g. A black mobile is lost'],
    ['বিস্তারিত লেখো','Write details'],
    ['যেমন: ক্যান্টিনের সামনে','e.g. In front of the canteen'],
    ['ফোন / ইমেইল / FB','Phone / Email / FB'],
    ['যেমন: ঢাকা মেডিকেল কলেজ','e.g. Dhaka Medical College'],
    ['যেমন: 017XXXXXXXX','e.g. 017XXXXXXXX'],
    ['যেমন: বার্ষিক সাংস্কৃতিক অনুষ্ঠান','e.g. Annual cultural program'],
    ['ইভেন্ট সম্পর্কে লেখো','Write about the event'],
    ['যেমন: মেইন অডিটোরিয়াম','e.g. Main auditorium'],
    ['যেমন: দ্বিতীয় অধ্যায় — তরঙ্গ','e.g. Chapter 2 — Waves'],
    ['সংক্ষিপ্ত বিবরণ লিখো','Write a short description'],
    ['যেমন: রুম ৩০৫','e.g. Room 305'],
    ['যেমন: রুম ২০১','e.g. Room 201'],
    ['কিছু শেয়ার করো শুধু ক্যাম্পাস এর জন্য...','Share something with your campus...'],
    ['নাম, রোল বা ব্লাড গ্রুপ দিয়ে খুঁজো...','Search by name, roll or blood group...'],
    // Blood/notice/lost list count suffixes
    [' জন','\u200B people'],
    ['টি','\u200B'],
    // Timestamps
    ['এইমাত্র','just now'],
    ['কিছুক্ষণ আগে','a while ago'],
    ['মিনিট আগে','minutes ago'],
    ['ঘণ্টা আগে','hours ago'],
    ['দিন আগে','days ago'],
    ['সপ্তাহ আগে','weeks ago'],
    ['মাস আগে','months ago'],
    // Study subpage FAB titles
    ['নোটিস পোস্ট করো','Post a notice'],
    // PWA / install misc
    ['ইনস্টল করো','Install'],
    ['পরে','Later']
  ];
  // Undo the count-suffix hacks — they're too risky, remove
  // (kept above as no-ops via zero-width markers; strip them here)
  for(let i=PHRASES.length-1;i>=0;i--){
    if(PHRASES[i][1] && PHRASES[i][1].indexOf('\u200B')>=0) PHRASES.splice(i,1);
  }

  const CONTAINER_SELECTORS = ['.modal-backdrop', '.study-subpage', '#tab-feed', '#tab-study'];
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','SVG','PATH','CIRCLE','RECT','LINE','POLYLINE','POLYGON']);
  const SKIP_CLASSES = ['post-text','comment-text','msg-text','msg-bubble','chat-msg-text','ps-input','form-input','form-textarea','form-select','post-textarea','study-search'];

  function currentLang(){
    try { return (typeof settings!=='undefined' && settings.language) || 'bn'; } catch(_){ return 'bn'; }
  }
  function shouldSkipEl(el){
    if(!el || SKIP_TAGS.has(el.tagName)) return true;
    if(el.tagName === 'INPUT') return true;
    for(const c of SKIP_CLASSES) if(el.classList && el.classList.contains(c)) return true;
    if(el.hasAttribute && el.hasAttribute('data-i18n-skip')) return true;
    return false;
  }
  function translateString(s, lang){
    if(!s) return s;
    let out = s;
    if(lang==='en'){
      for(const [bn,en] of PHRASES){ if(bn!==en) out = out.split(bn).join(en); }
    } else {
      for(const [bn,en] of PHRASES){ if(bn!==en && out.indexOf(bn)===-1) out = out.split(en).join(bn); }
    }
    return out;
  }
  function walkAndTranslate(root, lang){
    if(!root) return;
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        let cur = p;
        while(cur && cur!==root){
          if(shouldSkipEl(cur)) return NodeFilter.FILTER_REJECT;
          cur = cur.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n; while((n = tw.nextNode())) nodes.push(n);
    for(const node of nodes){
      const orig = node.nodeValue;
      if(!orig || !orig.trim()) continue;
      const next = translateString(orig, lang);
      if(next !== orig) node.nodeValue = next;
    }
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
      if(el.hasAttribute('data-i18n-skip')) return;
      ['placeholder','title','aria-label'].forEach(attr=>{
        const v = el.getAttribute(attr);
        if(!v) return;
        const nv = translateString(v, lang);
        if(nv !== v) el.setAttribute(attr, nv);
      });
    });
    root.querySelectorAll('option').forEach(op=>{
      if(op.hasAttribute('data-i18n-skip')) return;
      const orig = op.textContent;
      if(!orig || !orig.trim()) return;
      const next = translateString(orig, lang);
      if(next !== orig) op.textContent = next;
    });
  }

  function applyAll(){
    const lang = currentLang();
    CONTAINER_SELECTORS.forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=> walkAndTranslate(el, lang));
    });
  }

  let raf = 0;
  function schedule(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = 0; try{ applyAll(); }catch(_){} });
  }
  function boot(){
    try{ applyAll(); }catch(_){}
    CONTAINER_SELECTORS.forEach(sel=>{
      document.querySelectorAll(sel).forEach(el=>{
        if(el.__p8observed) return;
        el.__p8observed = true;
        new MutationObserver(schedule).observe(el, {
          childList:true, subtree:true, characterData:true,
          attributes:true, attributeFilter:['placeholder','title','aria-label','class']
        });
      });
    });
    window.addEventListener('i18n:changed', schedule);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
