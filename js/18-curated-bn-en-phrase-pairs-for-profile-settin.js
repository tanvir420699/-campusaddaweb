
(function(){
  if(typeof I18N==='undefined') return;

  // Curated bn <-> en phrase pairs for Profile / Settings / Modals.
  // Order matters: longer specific phrases FIRST so they replace before
  // shorter substrings inside them.
  const PHRASES = [
    // Profile edit modal
    ['প্রোফাইল এডিট করো','Edit profile'],
    ['প্রোফাইল ছবি','Profile photo'],
    ['ছবি আপলোড করো বা নিচের avatar বেছে নাও','Upload a photo or pick an avatar below'],
    ['অ্যাভাটার বেছে নাও','Pick an avatar'],
    ['রেজিস্ট্রেশনের নাম পরিবর্তন করা যায় না সরাসরি। পরিবর্তন করতে হলে Admin Approval লাগবে।','Registration name cannot be changed directly. Admin approval is required.'],
    ['রেজিস্ট্রেশনের বিভাগ পরিবর্তন করা যায় না সরাসরি। পরিবর্তন করতে হলে Admin Approval লাগবে।','Registration department cannot be changed directly. Admin approval is required.'],
    ['রেজিস্ট্রেশনের বর্ষ পরিবর্তন করা যায় না সরাসরি। পরিবর্তন করতে হলে Admin Approval লাগবে।','Registration year cannot be changed directly. Admin approval is required.'],
    ['নাম পরিবর্তনের আবেদন করো','Request name change'],
    ['বিভাগ পরিবর্তনের আবেদন করো','Request department change'],
    ['বর্ষ পরিবর্তনের আবেদন করো','Request year change'],
    ['জন্মতারিখ (ঐচ্ছিক)','Date of birth (optional)'],
    ['জন্মদিনে তুমি notification পাবে আর বন্ধুরাও জানতে পারবে','You will get a notification on your birthday and friends will know too'],
    ['ফোন (ঐচ্ছিক)','Phone (optional)'],
    ['Facebook লিংক (ঐচ্ছিক)','Facebook link (optional)'],
    ['Instagram (ঐচ্ছিক)','Instagram (optional)'],
    ['নিজের সম্পর্কে কিছু লেখো...','Write a bit about yourself...'],
    ['নিজের সম্পর্কে দুই লাইন…','Two lines about yourself…'],
    ['নির্বাচন করো','Select'],
    ['১ম বর্ষ, ২য় বর্ষ …','1st year, 2nd year …'],
    ['১ম বর্ষ','1st year'],
    ['২য় বর্ষ','2nd year'],
    ['৩য় বর্ষ','3rd year'],
    ['৪র্থ বর্ষ','4th year'],
    ['যেমন: Savar, Dhaka','e.g. Savar, Dhaka'],
    ['যেমন: October 13, 1999','e.g. October 13, 1999'],
    ['যেমন: Dhaka University','e.g. Dhaka University'],
    ['যেমন: 2023-24','e.g. 2023-24'],
    // Profile subpage / edit sections
    ['ঠিকানা / Location','Location'],
    ['জন্মদিন / Birthday','Birthday'],
    ['সম্পর্ক / Relationship','Relationship'],
    ['বায়ো / Bio','Bio'],
    ['বিভাগ / Department','Department'],
    ['বর্ষ / Year','Year'],
    ['পদবি / Designation','Designation'],
    ['প্রতিষ্ঠান / Institute','Institute'],
    ['সেশন / Session','Session'],
    ['ফোন / Phone','Phone'],
    ['ইমেইল / Email','Email'],
    ['ব্লাড গ্রুপ','Blood group'],
    ['বায়ো','Bio'],
    ['বিভাগ','Department'],
    ['বর্ষ','Year'],
    ['নাম','Name'],
    ['ফোন','Phone'],
    ['ইমেইল','Email'],
    ['Student account — পরিবর্তনের জন্য Admin approval লাগবে।','Student account — Admin approval required for changes.'],
    ['সেভ করো','Save'],
    ['সংরক্ষিত হয়েছে','Saved'],
    ['Settings লোড ব্যর্থ','Failed to load Settings'],
    // Settings hardcoded strings
    ['শিক্ষক সেটিংস','Teacher settings'],
    ['পদবি (Designation)','Designation'],
    ['তোমার পদবি বেছে নাও — এটা প্রোফাইলে দেখাবে','Pick your designation — this shows on your profile'],
    ['পদবি বেছে নাও','Pick a designation'],
    ['কোনো সমস্যা হলে কলেজ আইসিটি সেলের সাথে যোগাযোগ করো বা admin@campusadda@gmail.com তে ইমেইল করো।','If you have any issue, contact the college ICT cell or email admin@campusadda@gmail.com.'],
    ['এই প্ল্যাটফর্ম শুধুমাত্র ক্যাম্পাস আড্ডার সদস্যদের জন্য। সবাইকে সম্মানজনক আচরণ বজায় রাখতে হবে।','This platform is only for Campus Adda members. Everyone must maintain respectful behavior.'],
    // Common modal / sheet
    ['অপশন','Options'],
    ['ফোনে সেভ করো','Save to phone'],
    ['কোনো ফ্রেন্ড দেখানোর নেই','No friends to show'],
    ['বাতিল','Cancel'],
    ['নিশ্চিত','Confirm'],
    ['সংরক্ষণ করো','Save'],
    ['প্রয়োগ করো','Apply'],
    ['বন্ধ করো','Close'],
    ['মুছে ফেলো','Delete'],
    ['রিপোর্ট করো','Report'],
    ['শেয়ার করো','Share'],
    ['কপি করো','Copy']
  ];

  const CONTAINER_IDS = ['profileSubpage','editProfileModal','profileActionSheet'];
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SELECT','OPTION','SVG','PATH','CIRCLE','RECT','LINE','POLYLINE','POLYGON']);
  const SKIP_CLASSES = ['post-text','comment-text','msg-text','msg-bubble','chat-msg-text','ps-input','form-input','form-textarea','form-select'];

  function currentLang(){
    try { return (typeof settings!=='undefined' && settings.language) || 'bn'; } catch(_){ return 'bn'; }
  }
  function shouldSkipEl(el){
    if(!el || SKIP_TAGS.has(el.tagName)) return true;
    for(const c of SKIP_CLASSES) if(el.classList && el.classList.contains(c)) return true;
    // Never touch element with data-i18n-skip
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
    // Text nodes via TreeWalker
    const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentElement;
        if(!p) return NodeFilter.FILTER_REJECT;
        // Skip if any ancestor is skippable
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
    // Attributes on interactive elements
    root.querySelectorAll('[placeholder],[title],[aria-label]').forEach(el=>{
      if(shouldSkipEl(el)) return;
      ['placeholder','title','aria-label'].forEach(attr=>{
        const v = el.getAttribute(attr);
        if(!v) return;
        const nv = translateString(v, lang);
        if(nv !== v) el.setAttribute(attr, nv);
      });
    });
    // <option> text (they are inside <select> which is in SKIP_TAGS,
    // but option text is safe to translate — walk explicitly).
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
    CONTAINER_IDS.forEach(id=>{
      const el = document.getElementById(id);
      if(el) walkAndTranslate(el, lang);
    });
    document.querySelectorAll('.modal-backdrop, .pa-sheet-backdrop').forEach(el=>{
      walkAndTranslate(el, lang);
    });
  }

  let raf = 0;
  function schedule(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = 0; try{ applyAll(); }catch(_){} });
  }

  function boot(){
    try{ applyAll(); }catch(_){}
    // Observe each container for content mutations + class toggles (open/close)
    const observe = (el)=>{
      if(!el || el.__p6observed) return;
      el.__p6observed = true;
      new MutationObserver(schedule).observe(el, {
        childList:true, subtree:true, characterData:true,
        attributes:true, attributeFilter:['placeholder','title','aria-label','class']
      });
    };
    CONTAINER_IDS.forEach(id=> observe(document.getElementById(id)));
    document.querySelectorAll('.modal-backdrop, .pa-sheet-backdrop').forEach(observe);
    // Body-level observer to catch dynamically-inserted modals
    new MutationObserver((muts)=>{
      let need = false;
      for(const m of muts){
        m.addedNodes && m.addedNodes.forEach(nd=>{
          if(nd.nodeType===1 && (nd.classList && (nd.classList.contains('modal-backdrop')||nd.classList.contains('pa-sheet-backdrop')))){
            observe(nd); need = true;
          }
        });
      }
      if(need) schedule();
    }).observe(document.body, {childList:true, subtree:false});
    window.addEventListener('i18n:changed', schedule);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
