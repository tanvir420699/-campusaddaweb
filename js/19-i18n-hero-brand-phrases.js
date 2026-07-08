
(function(){
  if(typeof I18N==='undefined') return;

  const PHRASES = [
    // Hero / brand
    ['তোমার ক্যাম্পাসের আড্ডা','Your campus hangout'],
    // Login section
    ['Roll Number দাও','Enter Roll Number'],
    ['সঠিক Gmail দাও','Enter a valid Gmail'],
    ['পাসওয়ার্ড দাও','Enter password'],
    ['পাসওয়ার্ড ভুলে গেছি?','Forgot password?'],
    // Long phrases containing 'লগ ইন করো' must come BEFORE the short pair
    [', Gmail এবং পাসওয়ার্ড দিয়ে লগ ইন করো।',', Gmail and Password to log in.'],
    ['লগ ইন করো','Log in'],
    ['লগ ইন এ ফিরে যাও','Back to log in'],
    ['লগ ইন স্ক্রিনে ফিরে যাও','Back to log in'],
    ['অথবা','OR'],
    ['নতুন অ্যাকাউন্ট তৈরি করো','Create a new account'],
    ['আগে থেকেই অ্যাকাউন্ট আছে?','Already have an account?'],
    ['পাসওয়ার্ড','Password'],
    // Register step labels
    ['ধাপ ১ of ৩ — ব্যক্তিগত তথ্য','Step 1 of 3 — Personal info'],
    ['ধাপ ২ of ৩ — পাসওয়ার্ড ও ID','Step 2 of 3 — Password & ID'],
    ['ধাপ ৩ of ৩ — Gmail যাচাই','Step 3 of 3 — Verify Gmail'],
    // Order: longer/more specific phrases FIRST so short pairs don't
    // fragment them (e.g. পুরো নাম would otherwise break তোমার পুরো নাম লেখো).
    ['তোমার পুরো নাম লেখো','Write your full name'],
    ['পুরো নাম','Full name'],
    // Login info & remember me (were missing)
    ['আমাকে মনে রেখো','Remember me'],
    ['নাম দাও (অন্তত ৩ অক্ষর)','Enter name (at least 3 characters)'],
    ['তুমি কে?','Who are you?'],
    // Role options — already bilingual in source, don't re-map (would cascade)

    ['ডিপার্টমেন্ট বেছে নাও','Choose department'],
    ['ডিপার্টমেন্ট','Department'],
    ['বাংলা','Bangla'],
    ['ইংরেজি','English'],
    ['গণিত','Mathematics'],
    ['পদার্থবিজ্ঞান','Physics'],
    ['রসায়ন','Chemistry'],
    ['জীববিজ্ঞান','Biology'],
    ['ইতিহাস','History'],
    ['হিসাববিজ্ঞান','Accounting'],
    ['অর্থনীতি','Economics'],
    ['তথ্যপ্রযুক্তি','ICT'],
    ['বর্ষ বেছে নাও','Choose year'],
    ['১ম বর্ষ','1st year'],
    ['২য় বর্ষ','2nd year'],
    ['৩য় বর্ষ','3rd year'],
    ['৪র্থ বর্ষ','4th year'],
    ['বর্ষ','Year'],
    ['ব্লাড গ্রুপ বেছে নাও (ইমার্জেন্সিতে কাজে লাগবে)','Choose blood group (useful in emergencies)'],
    ['ব্লাড গ্রুপ বেছে নাও','Choose blood group'],
    ['ব্লাড গ্রুপ','Blood group'],
    ['ফোন নাম্বার','Phone number'],
    ['(ঐচ্ছিক)','(optional)'],
    ['পরবর্তী ধাপ','Next step'],
    ['পরবর্তী','Next'],
    ['আগের ধাপ','Previous step'],
    ['আগের','Previous'],
    // Step 2
    ['শক্তিশালী পাসওয়ার্ড দাও','Enter a strong password'],
    ['অন্তত ৮ অক্ষর, বড় হাতের, ছোট হাতের, সংখ্যা ও চিহ্ন দাও','At least 8 characters with upper/lower case, numbers and symbols'],
    ['অন্তত ৮ অক্ষর, বড়-ছোট হাতের, সংখ্যা ও চিহ্ন দাও','At least 8 characters with upper/lower case, numbers and symbols'],
    ['পাসওয়ার্ড নিশ্চিত করো','Confirm password'],
    ['আবার পাসওয়ার্ড দাও','Re-enter password'],
    ['আবার পাসওয়ার্ড','Re-enter password'],
    ['পাসওয়ার্ড মিলছে না','Passwords do not match'],
    ['ID Card / Admission Slip ছবি','ID Card / Admission Slip photo'],
    ['ID Card বা Admission Slip এর ছবি আপলোড করো','Upload a photo of your ID Card or Admission Slip'],
    ['ক্লিক করে বেছে নাও','Click to choose'],
    ['ID Card এর ছবি দাও','Please upload ID card photo'],
    // Step 3 (OTP)
    ['Gmail যাচাই করো','Verify Gmail'],
    ['এই Gmail এ ৬ সংখ্যার কোড পাঠানো হয়েছে','A 6-digit code has been sent to this Gmail'],
    ['এই Gmail এ কোড পাঠানো হয়েছে','A code has been sent to this Gmail'],
    ['ভুল কোড! আবার চেষ্টা করো','Wrong code! Try again'],
    ['ভুল কোড!','Wrong code!'],
    ['কোড আবার পাঠাও','Resend code'],
    ['কোড পাঠাও','Send code'],
    ['যাচাই করো','Verify'],
    ['OTP যাচাই করো','Verify OTP'],
    // Forgot password
    ['পাসওয়ার্ড ফিরিয়ে আনো','Reset password'],
    ['তোমার Gmail ও Roll দিয়ে রিসেট করো','Reset using your Gmail and Roll'],
    ['নতুন পাসওয়ার্ড','New password'],
    ['শক্তিশালী পাসওয়ার্ড দাও','Enter a strong password'],
    ['পাসওয়ার্ড পরিবর্তন করো','Change password'],
    ['পাসওয়ার্ড পরিবর্তন হয়েছে!','Password changed!'],
    ['এখন নতুন পাসওয়ার্ড দিয়ে লগ ইন করো।','Now log in with the new password.'],
    // Pending approval
    ['অ্যাকাউন্ট তৈরি হয়েছে!','Account created!'],
    ['তোমার অ্যাকাউন্টটি এখন Admin Approval এর অপেক্ষায় আছে। Admin অনুমোদন করার পর তুমি লগইন করতে পারবে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করো।','Your account is now waiting for Admin approval. Once Admin approves, you can log in. Please try again after a while.'],
    // Auth redirect overlay
    ['এক মুহূর্ত…','One moment…'],
    ['তোমার অ্যাকাউন্টে নিয়ে যাচ্ছি','Taking you to your account'],
    // Placeholder examples
    ['যেমন: 2024123','e.g. 2024123'],
    // Splash tagline etc. (safe fallbacks)
    ['লোড হচ্ছে…','Loading…'],
    ['অপেক্ষা করো…','Please wait…']
  ];

  const CONTAINER_IDS = ['splashScreen','authScreen','forgotScreen','pendingApprovalScreen','authRedirectOverlay'];
  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','SVG','PATH','CIRCLE','RECT','LINE','POLYLINE','POLYGON']);
  const SKIP_CLASSES = ['auth-input','otp-digit','form-input','form-textarea','form-select'];

  function currentLang(){
    try { return (typeof settings!=='undefined' && settings.language) || 'bn'; } catch(_){ return 'bn'; }
  }
  function shouldSkipEl(el){
    if(!el || SKIP_TAGS.has(el.tagName)) return true;
    // Never touch <input> value/text, but placeholder is handled separately
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
    CONTAINER_IDS.forEach(id=>{
      const el = document.getElementById(id);
      if(el) walkAndTranslate(el, lang);
    });
  }

  let raf = 0;
  function schedule(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf = 0; try{ applyAll(); }catch(_){} });
  }
  function boot(){
    try{ applyAll(); }catch(_){}
    CONTAINER_IDS.forEach(id=>{
      const el = document.getElementById(id);
      if(!el || el.__p7observed) return;
      el.__p7observed = true;
      new MutationObserver(schedule).observe(el, {
        childList:true, subtree:true, characterData:true,
        attributes:true, attributeFilter:['placeholder','title','aria-label','class']
      });
    });
    window.addEventListener('i18n:changed', schedule);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
