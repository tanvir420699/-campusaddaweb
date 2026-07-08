
(function(){
  if(typeof I18N==='undefined') return;

  const PHRASES = [
    // Confirm dialog / common
    ['কমেন্ট মুছবে?','Delete comment?'],
    ['এই কমেন্ট মুছে ফেলা হলে আর ফিরিয়ে আনা যাবে না।','This comment cannot be recovered once deleted.'],
    ['হ্যাঁ, মুছে দাও','Yes, delete'],
    ['বাতিল করো','Cancel'],
    ['নিশ্চিত করো','Confirm'],
    ['ঠিক আছে','OK'],
    // Change password modal (rendered inside infoModal)
    ['বর্তমান পাসওয়ার্ড','Current password'],
    ['নতুন পাসওয়ার্ড নিশ্চিত করো','Confirm new password'],
    ['নতুন পাসওয়ার্ড মিলছে না','New passwords do not match'],
    ['বর্তমান পাসওয়ার্ড ভুল','Current password is wrong'],
    ['পাসওয়ার্ড পাল্টানো যায়নি','Password could not be changed'],
    ['পাসওয়ার্ড আপডেট করো','Update password'],
    ['নতুন পাসওয়ার্ড','New password'],
    ['আবার পাসওয়ার্ড','Re-enter password'],
    ['শক্তিশালী পাসওয়ার্ড দাও','Enter a strong password'],
    ['অন্তত ৮ অক্ষর, বড়-ছোট হাতের, সংখ্যা ও চিহ্ন দাও','At least 8 characters with upper/lower case, numbers and symbols'],
    ['দুর্বল','Weak'],
    ['মোটামুটি','Medium'],
    ['শক্তিশালী','Strong'],
    // PWA install guide (iOS)
    ['Safari ব্রাউজারে নিচের ধাপগুলো অনুসরণ করো:','Follow these steps in Safari:'],
    ['Safari এ নিচের শেয়ার বাটনে','Tap the share button below in Safari'],
    ['ক্লিক করো','click'],
    ['হোম স্ক্রিনে যোগ করো','Add to Home Screen'],
    ['সিলেক্ট করো','select'],
    ['বাটনে ট্যাপ করো','tap the button'],
    ['আইকন হোম স্ক্রিনে আসবে!','icon will appear on your home screen!'],
    // Notifications
    ['তোমার পোস্টে লাইক দিয়েছে','liked your post'],
    ['তোমার পোস্টে কমেন্ট করেছে','commented on your post'],
    ['নতুন লাইক','New like'],
    ['নতুন কমেন্ট','New comment'],
    ['নতুন','New'],
    ['নোটিফিকেশন','Notification'],
    ['কেউ','Someone'],
    // Birthday banner
    ['এর জন্মদিন!','\'s birthday!'],
    ['আজ','Today'],
    ['তাদের উইশ করতে ভুলো না','Do not forget to wish them'],
    ['ও আরো','and'],
    // Time-ago
    ['এইমাত্র','just now'],
    ['কিছুক্ষণ আগে','a while ago'],
    ['মিনিট আগে','minutes ago'],
    ['ঘণ্টা আগে','hours ago'],
    ['দিন আগে','days ago'],
    ['সপ্তাহ আগে','weeks ago'],
    ['মাস আগে','months ago'],
    ['ঘণ্টা','hours'],
    ['মিনিট','minutes'],
    ['সেকেন্ড','seconds'],
    // Misc common verbs
    ['সবাই','Everyone'],
    ['বাতিল','Cancel'],
    ['সংরক্ষণ','Save'],
    ['মুছে ফেলো','Delete'],
    ['শেয়ার','Share'],
    ['রিপোর্ট','Report']
  ];

  const CONTAINER_SELECTORS = ['#confirmDialog', '.modal-backdrop', '#pwaBanner', '#pushBanner', '#birthdayBanner'];
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
        if(el.__p9observed) return;
        el.__p9observed = true;
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
