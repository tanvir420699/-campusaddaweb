
(function(){
  if(typeof window.I18N !== 'object') return;
  const S = {
    bn: {
      // Hero
      'hero.title':'Campus Adda','hero.sub':'তোমার ক্যাম্পাসের আড্ডা',
      // Login
      'login.rollLabel':'রোল / স্টুডেন্ট ID','login.rollPh':'যেমন: 2024123',
      'login.gmailLabel':'Gmail','login.gmailPh':'example@gmail.com',
      'login.passLabel':'পাসওয়ার্ড','login.passPh':'পাসওয়ার্ড দাও',
      'login.forgot':'পাসওয়ার্ড ভুলে গেছি?','login.remember':'আমাকে মনে রেখো',
      'login.btn':'লগ ইন করো','login.or':'অথবা','login.registerBtn':'নতুন অ্যাকাউন্ট তৈরি করো',
      'login.infoHtml':'<strong>Roll Number</strong>, Gmail এবং Password দিয়ে লগ ইন করো।',
      // Register — switcher + steps
      'reg.haveAccount':'আগে থেকেই অ্যাকাউন্ট আছে? ','reg.loginNow':'লগ ইন করো',
      'reg.step1Label':'ধাপ ১ of ৩ — ব্যক্তিগত তথ্য',
      'reg.step2Label':'ধাপ ২ of ৩ — পাসওয়ার্ড ও ID কার্ড',
      'reg.step3Label':'ধাপ ৩ of ৩ — Gmail যাচাই',
      'reg.nameLabel':'পুরো নাম','reg.namePh':'তোমার পুরো নাম লেখো',
      'reg.gmailLabel':'Gmail','reg.gmailPh':'example@gmail.com',
      'reg.roleLabel':'তুমি কে?','reg.roleStudent':'শিক্ষার্থী (Student)',
      'reg.roleCR':'CR (ক্লাস রিপ্রেজেন্টেটিভ)','reg.roleTeacher':'শিক্ষক (Teacher)',
      'reg.deptLabel':'ডিপার্টমেন্ট','reg.deptPh':'ডিপার্টমেন্ট বেছে নাও',
      'reg.dept.bangla':'বাংলা','reg.dept.english':'ইংরেজি','reg.dept.math':'গণিত',
      'reg.dept.physics':'পদার্থবিজ্ঞান','reg.dept.chemistry':'রসায়ন','reg.dept.biology':'জীববিজ্ঞান',
      'reg.dept.history':'ইতিহাস','reg.dept.accounting':'হিসাববিজ্ঞান','reg.dept.economics':'অর্থনীতি','reg.dept.ict':'তথ্যপ্রযুক্তি',
      'reg.yearLabel':'বর্ষ','reg.yearPh':'বর্ষ বেছে নাও',
      'reg.year1':'১ম বর্ষ','reg.year2':'২য় বর্ষ','reg.year3':'৩য় বর্ষ','reg.year4':'৪র্থ বর্ষ',
      'reg.rollLabel':'রোল / স্টুডেন্ট ID','reg.rollPh':'যেমন: 2024123',
      'reg.bloodLabel':'ব্লাড গ্রুপ','reg.bloodPh':'ব্লাড গ্রুপ বেছে নাও',
      'reg.phoneLabel':'ফোন নাম্বার','reg.phoneOptional':'(ঐচ্ছিক)','reg.phonePh':'01XXXXXXXXX',
      'reg.step1NextBtn':'পরবর্তী ধাপ',
      'reg.passLabel':'পাসওয়ার্ড','reg.passPh':'শক্তিশালী পাসওয়ার্ড দাও',
      'reg.passHint':'অন্তত ৮ অক্ষর, বড় হাতের, ছোট হাতের, সংখ্যা ও চিহ্ন দাও',
      'reg.pass2Label':'পাসওয়ার্ড নিশ্চিত করো','reg.pass2Ph':'আবার পাসওয়ার্ড দাও',
      'reg.idLabel':'ID Card / Admission Slip ছবি',
      'reg.idText1':'ID Card বা Admission Slip এর ছবি আপলোড করো','reg.idClick':'ক্লিক করে বেছে নাও',
      'reg.step2PrevBtn':'আগের','reg.step2NextBtn':'পরবর্তী',
      'reg.otpTitle':'Gmail যাচাই করো','reg.otpSub':'এই Gmail এ ৬ সংখ্যার কোড পাঠানো হয়েছে',
      'reg.otpResend':'কোড আবার পাঠাও','reg.otpVerifyBtn':'যাচাই করো','reg.otpPrevBtn':'আগের ধাপ',
      // Password strength
      'pass.weak':'দুর্বল','pass.medium':'মোটামুটি 😐','pass.strong':'শক্তিশালী',
      // Forgot
      'fp.title':'পাসওয়ার্ড ফিরিয়ে আনো','fp.sub':'তোমার Gmail ও Roll দিয়ে রিসেট করো',
      'fp.infoHtml':'তোমার <strong>Gmail</strong> ও <strong>Roll Number</strong> দাও। সেই Gmail এ পাসওয়ার্ড রিসেট কোড পাঠানো হবে।',
      'fp.gmailLabel':'Gmail','fp.gmailPh':'example@gmail.com',
      'fp.rollLabel':'রোল / স্টুডেন্ট ID','fp.rollPh':'যেমন: 2024123',
      'fp.sendBtn':'কোড পাঠাও','fp.backLogin':' লগ ইন এ ফিরে যাও',
      'fp.otpTitle':'OTP যাচাই করো','fp.otpSub':'এই Gmail এ কোড পাঠানো হয়েছে',
      'fp.otpResend':'কোড আবার পাঠাও','fp.otpVerifyBtn':'যাচাই করো',
      'fp.newPassTitle':'নতুন পাসওয়ার্ড','fp.newPassSub':'শক্তিশালী পাসওয়ার্ড দাও',
      'fp.newPassLabel':'নতুন পাসওয়ার্ড','fp.newPassPh':'নতুন পাসওয়ার্ড',
      'fp.newPassHint':'অন্তত ৮ অক্ষর, বড়-ছোট হাতের, সংখ্যা ও চিহ্ন দাও',
      'fp.newPass2Label':'পাসওয়ার্ড নিশ্চিত করো','fp.newPass2Ph':'আবার পাসওয়ার্ড',
      'fp.saveBtn':'পাসওয়ার্ড পরিবর্তন করো',
      'fp.successTitle':'পাসওয়ার্ড পরিবর্তন হয়েছে!','fp.successSub':'এখন নতুন পাসওয়ার্ড দিয়ে লগ ইন করো।','fp.successBtn':'লগ ইন করো',
      // Pending
      'pending.title':'অ্যাকাউন্ট তৈরি হয়েছে!',
      'pending.sub':'তোমার অ্যাকাউন্টটি এখন Admin Approval এর অপেক্ষায় আছে। Admin অনুমোদন করার পর তুমি লগইন করতে পারবে। অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করো।',
      'pending.btn':'লগ ইন স্ক্রিনে ফিরে যাও',
      // Redirect overlay defaults
      'redirect.welcomeTitle':'স্বাগতম!','redirect.welcomeSub':'তোমার ফিড লোড হচ্ছে…',
      'redirect.moveTitle':'চলো এগোই…','redirect.moveSub':'পাসওয়ার্ড রিসেট পেজে যাচ্ছি',
    },
    en: {
      'hero.title':'Campus Adda','hero.sub':'Your campus hangout',
      'login.rollLabel':'Roll / Student ID','login.rollPh':'e.g. 2024123',
      'login.gmailLabel':'Gmail','login.gmailPh':'example@gmail.com',
      'login.passLabel':'Password','login.passPh':'Enter your password',
      'login.forgot':'Forgot password?','login.remember':'Remember me',
      'login.btn':'Log in','login.or':'or','login.registerBtn':'Create new account',
      'login.infoHtml':'Log in with your <strong>Roll Number</strong>, Gmail and Password.',
      'reg.haveAccount':'Already have an account? ','reg.loginNow':'Log in',
      'reg.step1Label':'Step 1 of 3 — Personal Info',
      'reg.step2Label':'Step 2 of 3 — Password & ID Card',
      'reg.step3Label':'Step 3 of 3 — Verify Gmail',
      'reg.nameLabel':'Full Name','reg.namePh':'Enter your full name',
      'reg.gmailLabel':'Gmail','reg.gmailPh':'example@gmail.com',
      'reg.roleLabel':'Who are you?','reg.roleStudent':'Student',
      'reg.roleCR':'CR (Class Representative)','reg.roleTeacher':'Teacher',
      'reg.deptLabel':'Department','reg.deptPh':'Choose department',
      'reg.dept.bangla':'Bangla','reg.dept.english':'English','reg.dept.math':'Mathematics',
      'reg.dept.physics':'Physics','reg.dept.chemistry':'Chemistry','reg.dept.biology':'Biology',
      'reg.dept.history':'History','reg.dept.accounting':'Accounting','reg.dept.economics':'Economics','reg.dept.ict':'ICT',
      'reg.yearLabel':'Year','reg.yearPh':'Choose year',
      'reg.year1':'1st Year','reg.year2':'2nd Year','reg.year3':'3rd Year','reg.year4':'4th Year',
      'reg.rollLabel':'Roll / Student ID','reg.rollPh':'e.g. 2024123',
      'reg.bloodLabel':'Blood Group','reg.bloodPh':'Choose blood group',
      'reg.phoneLabel':'Phone Number','reg.phoneOptional':'(Optional)','reg.phonePh':'01XXXXXXXXX',
      'reg.step1NextBtn':'Next Step',
      'reg.passLabel':'Password','reg.passPh':'Enter a strong password',
      'reg.passHint':'At least 8 chars with upper, lower, number & symbol',
      'reg.pass2Label':'Confirm Password','reg.pass2Ph':'Re-enter your password',
      'reg.idLabel':'ID Card / Admission Slip Photo',
      'reg.idText1':'Upload a photo of your ID Card or Admission Slip','reg.idClick':'Click to choose',
      'reg.step2PrevBtn':'Previous','reg.step2NextBtn':'Next',
      'reg.otpTitle':'Verify Gmail','reg.otpSub':'A 6-digit code has been sent to this Gmail',
      'reg.otpResend':'Resend code','reg.otpVerifyBtn':'Verify','reg.otpPrevBtn':'Previous step',
      'pass.weak':'Weak','pass.medium':'Medium 😐','pass.strong':'Strong',
      'fp.title':'Recover Password','fp.sub':'Reset with your Gmail and Roll',
      'fp.infoHtml':'Enter your <strong>Gmail</strong> and <strong>Roll Number</strong>. A password reset code will be sent to that Gmail.',
      'fp.gmailLabel':'Gmail','fp.gmailPh':'example@gmail.com',
      'fp.rollLabel':'Roll / Student ID','fp.rollPh':'e.g. 2024123',
      'fp.sendBtn':'Send code','fp.backLogin':' Back to Login',
      'fp.otpTitle':'Verify OTP','fp.otpSub':'A code has been sent to this Gmail',
      'fp.otpResend':'Resend code','fp.otpVerifyBtn':'Verify',
      'fp.newPassTitle':'New Password','fp.newPassSub':'Enter a strong password',
      'fp.newPassLabel':'New Password','fp.newPassPh':'New password',
      'fp.newPassHint':'At least 8 chars with upper, lower, number & symbol',
      'fp.newPass2Label':'Confirm Password','fp.newPass2Ph':'Re-enter password',
      'fp.saveBtn':'Change password',
      'fp.successTitle':'Password changed!','fp.successSub':'Now log in with your new password.','fp.successBtn':'Log in',
      'pending.title':'Account Created!',
      'pending.sub':'Your account is now waiting for Admin Approval. Once approved you can log in. Please try again after a while.',
      'pending.btn':'Back to Login',
      'redirect.welcomeTitle':'Welcome!','redirect.welcomeSub':'Loading your feed…',
      'redirect.moveTitle':'One moment…','redirect.moveSub':'Taking you to password reset',
    }
  };

  // Bangla↔English pairs for dynamic strings written by original code
  // (validation errors, redirect overlay titles, pass-strength, step label).
  const PAIRS = [
    // Errors
    ['Roll Number দাও','Enter Roll Number'],
    ['সঠিক Gmail দাও','Enter a valid Gmail'],
    ['পাসওয়ার্ড দাও','Enter your password'],
    ['সঠিক Gmail দাও (@gmail.com)','Enter a valid Gmail (@gmail.com)'],
    ['নাম দাও (অন্তত ৩ অক্ষর)','Enter your name (min 3 chars)'],
    ['ডিপার্টমেন্ট বেছে নাও','Choose a department'],
    ['বর্ষ বেছে নাও','Choose a year'],
    ['ব্লাড গ্রুপ বেছে নাও','Choose blood group'],
    ['ব্লাড গ্রুপ বেছে নাও (ইমার্জেন্সিতে কাজে লাগবে)','Choose blood group (useful in emergencies)'],
    ['শক্তিশালী পাসওয়ার্ড দাও','Choose a stronger password'],
    ['পাসওয়ার্ড মিলছে না','Passwords do not match'],
    ['ID Card এর ছবি দাও','Upload your ID Card photo'],
    ['ভুল কোড! আবার চেষ্টা করো','Wrong code! Try again'],
    ['ভুল কোড!','Wrong code!'],
    ['Email বা পাসওয়ার্ড ভুল','Wrong email or password'],
    ['প্রোফাইল খুঁজে পাওয়া যায়নি','Profile not found'],
    ['তোমার অ্যাকাউন্ট Admin দ্বারা স্থগিত করা হয়েছে।','Your account has been suspended by Admin.'],
    ['তোমার অ্যাকাউন্ট এখনো Admin Approval এর অপেক্ষায় আছে।','Your account is still waiting for Admin Approval.'],
    // Redirect overlay
    ['এক মুহূর্ত…','One moment…'],
    ['তোমার অ্যাকাউন্টে নিয়ে যাচ্ছি','Taking you to your account'],
    ['স্বাগতম!','Welcome!'],
    ['তোমার ফিড লোড হচ্ছে…','Loading your feed…'],
    ['চলো এগোই…','One moment…'],
    ['পাসওয়ার্ড রিসেট পেজে যাচ্ছি','Taking you to password reset'],
    // Register step labels
    ['ধাপ ১ of ৩ — ব্যক্তিগত তথ্য','Step 1 of 3 — Personal Info'],
    ['ধাপ ২ of ৩ — পাসওয়ার্ড ও ID কার্ড','Step 2 of 3 — Password & ID Card'],
    ['ধাপ ৩ of ৩ — Gmail যাচাই','Step 3 of 3 — Verify Gmail'],
  ];

  function currentLang(){ try{ return (settings && settings.language) || 'bn'; }catch(_){ return 'bn'; } }
  function tr(k){
    const l = currentLang();
    const p = S[l] || S.bn;
    return (p[k] != null) ? p[k] : (S.bn[k] != null ? S.bn[k] : k);
  }
  function translateStr(s){
    if(!s) return s;
    const l = currentLang();
    const trimmed = s.trim();
    for(const [bn,en] of PAIRS){
      if(trimmed === bn) return l==='en' ? en : bn;
      if(trimmed === en) return l==='en' ? en : bn;
    }
    return s;
  }

  const $ = id => document.getElementById(id);
  const q = sel => document.querySelector(sel);

  function setLabelOf(inputId, key){
    const inp = $(inputId); if(!inp) return;
    const label = inp.closest('.auth-field')?.querySelector('.auth-label');
    if(!label) return;
    for(const n of label.childNodes){
      if(n.nodeType === 3){ n.nodeValue = tr(key); return; }
    }
  }
  function setPh(inputId, key){ const el = $(inputId); if(el) el.placeholder = tr(key); }
  function setErr(errId, key){ const el = $(errId); if(el) el.textContent = tr(key); }
  function setBtnText(btnEl, key){
    if(!btnEl) return;
    const wrap = btnEl.querySelector('.auth-btn-text') || btnEl;
    for(const n of wrap.childNodes){
      if(n.nodeType === 3 && n.nodeValue.trim()){
        const hasTrailingEl = n.nextSibling && n.nextSibling.nodeType === 1;
        n.nodeValue = tr(key) + (hasTrailingEl ? ' ' : '');
        return;
      }
    }
    wrap.insertBefore(document.createTextNode(tr(key) + ' '), wrap.firstChild);
  }

  function applyAuth(){
    // Hero (auth screen)
    const heroTitle = q('#authScreen .auth-hero-title'); if(heroTitle) heroTitle.textContent = tr('hero.title');
    const heroSub   = q('#authScreen .auth-hero-sub');   if(heroSub)   heroSub.textContent   = tr('hero.sub');

    // Login
    const loginInfo = q('#loginSection .auth-info-box'); if(loginInfo) loginInfo.innerHTML = tr('login.infoHtml');
    setLabelOf('loginRoll','login.rollLabel'); setPh('loginRoll','login.rollPh'); setErr('loginRollErr','err.roll');
    setLabelOf('loginGmail','login.gmailLabel'); setPh('loginGmail','login.gmailPh'); setErr('loginGmailErr','err.gmail');
    setLabelOf('loginPass','login.passLabel');   setPh('loginPass','login.passPh');   setErr('loginPassErr','err.pass');
    const fLink = q('#loginSection button.auth-link-btn[onclick*="showForgotPass"]'); if(fLink) fLink.textContent = tr('login.forgot');
    // Remember me label (span next to the checkbox+box)
    const rm = $('rememberMe');
    if(rm){
      const label = rm.closest('label');
      if(label){
        const spans = label.querySelectorAll('span');
        const last = spans[spans.length-1];
        if(last && !last.classList.contains('rm-box')) last.textContent = tr('login.remember');
      }
    }
    setBtnText(q('#loginSection .auth-btn:not(.auth-btn-outline)'), 'login.btn');
    const orDiv = q('#loginSection .auth-divider'); if(orDiv) orDiv.textContent = tr('login.or');
    const regNav = q('#loginSection .auth-btn.auth-btn-outline'); if(regNav) regNav.textContent = tr('login.registerBtn');

    // Register — top switcher
    const regTop = q('#registerSection > div:first-child');
    if(regTop){
      const s = regTop.querySelector('span'); if(s) s.textContent = tr('reg.haveAccount');
      const b = regTop.querySelector('button'); if(b) b.textContent = tr('reg.loginNow');
    }

    // Register step 1
    setLabelOf('regName','reg.nameLabel'); setPh('regName','reg.namePh'); setErr('regNameErr','err.name');
    setLabelOf('regGmail','reg.gmailLabel'); setPh('regGmail','reg.gmailPh'); setErr('regGmailErr','err.gmailFull');
    setLabelOf('regRole','reg.roleLabel');
    const roleSel = $('regRole');
    if(roleSel && roleSel.options.length >= 3){
      roleSel.options[0].textContent = tr('reg.roleStudent');
      roleSel.options[1].textContent = tr('reg.roleCR');
      roleSel.options[2].textContent = tr('reg.roleTeacher');
    }
    setLabelOf('regDept','reg.deptLabel');
    const deptSel = $('regDept');
    if(deptSel){
      for(let i=0;i<deptSel.options.length;i++){
        const val = deptSel.options[i].value;
        if(!val) deptSel.options[i].textContent = tr('reg.deptPh');
        else if(S.bn['reg.dept.'+val] != null) deptSel.options[i].textContent = tr('reg.dept.'+val);
      }
    }
    setErr('regDeptErr','err.dept');
    setLabelOf('regYear','reg.yearLabel');
    const yearSel = $('regYear');
    if(yearSel){
      for(let i=0;i<yearSel.options.length;i++){
        if(!yearSel.options[i].value) yearSel.options[i].textContent = tr('reg.yearPh');
        else if(i>=1 && i<=4) yearSel.options[i].textContent = tr('reg.year'+i);
      }
    }
    setErr('regYearErr','err.year');
    setLabelOf('regRoll','reg.rollLabel'); setPh('regRoll','reg.rollPh'); setErr('regRollErr','err.roll');
    setLabelOf('regBlood','reg.bloodLabel');
    const bloodSel = $('regBlood');
    if(bloodSel && bloodSel.options[0] && !bloodSel.options[0].value) bloodSel.options[0].textContent = tr('reg.bloodPh');
    setErr('regBloodErr','err.blood');
    // Phone label has an inner span "(ঐচ্ছিক)"
    const phoneField = $('regPhone')?.closest('.auth-field');
    if(phoneField){
      const lbl = phoneField.querySelector('.auth-label');
      if(lbl){
        for(const n of lbl.childNodes){ if(n.nodeType === 3){ n.nodeValue = tr('reg.phoneLabel') + ' '; break; } }
        const opt = lbl.querySelector('span'); if(opt) opt.textContent = tr('reg.phoneOptional');
      }
      setPh('regPhone','reg.phonePh');
    }
    setBtnText(q('#regStep1 .auth-btn:not(.auth-btn-outline)'), 'reg.step1NextBtn');

    // Register step 2
    setLabelOf('regPass','reg.passLabel'); setPh('regPass','reg.passPh');
    const passHint = $('passHint'); if(passHint) passHint.textContent = tr('reg.passHint');
    setErr('regPassErr','err.passWeak');
    setLabelOf('regPass2','reg.pass2Label'); setPh('regPass2','reg.pass2Ph');
    setErr('regPass2Err','err.passMismatch');
    const idField = $('regIdFile')?.closest('.auth-field');
    if(idField){
      const lbl = idField.querySelector('.auth-label');
      if(lbl){ for(const n of lbl.childNodes){ if(n.nodeType === 3){ n.nodeValue = tr('reg.idLabel'); break; } } }
      const upTxt = idField.querySelector('.auth-file-upload-text');
      if(upTxt) upTxt.innerHTML = tr('reg.idText1') + '<br><span style="color:var(--accent);font-weight:600;">' + tr('reg.idClick') + '</span>';
    }
    setErr('regIdErr','err.idCard');
    setBtnText(q('#regStep2 .auth-btn[onclick*="showRegStep(1)"]'), 'reg.step2PrevBtn');
    setBtnText(q('#regStep2 .auth-btn[onclick*="regStep2Next"]'), 'reg.step2NextBtn');

    // Register step 3 (OTP)
    const step3Hero = q('#regStep3 > div:first-child');
    if(step3Hero){
      const titleEl = step3Hero.children[1]; if(titleEl) titleEl.textContent = tr('reg.otpTitle');
      const subEl   = step3Hero.children[2];
      if(subEl){
        const spanEmail = subEl.querySelector('#otpEmailDisplay');
        const email = spanEmail ? spanEmail.textContent : '';
        subEl.innerHTML = '<span id="otpEmailDisplay" style="color:#6C63FF; font-weight:700;">'+email+'</span><br>'+tr('reg.otpSub');
      }
    }
    setErr('regOtpErr','err.otpWrong');
    const otpResendBtn = $('otpResendBtn'); if(otpResendBtn) otpResendBtn.textContent = tr('reg.otpResend');
    setBtnText(q('#regStep3 .auth-btn[onclick*="verifyOtp"]'), 'reg.otpVerifyBtn');
    setBtnText(q('#regStep3 .auth-btn[onclick*="showRegStep(2)"]'), 'reg.otpPrevBtn');

    // Forgot screen hero
    const fpT = q('#forgotScreen .auth-hero-title'); if(fpT) fpT.textContent = tr('fp.title');
    const fpS = q('#forgotScreen .auth-hero-sub');   if(fpS) fpS.textContent = tr('fp.sub');
    // Step 1
    const fpInfo = q('#forgotStep1 .auth-info-box'); if(fpInfo) fpInfo.innerHTML = tr('fp.infoHtml');
    setLabelOf('fpGmail','fp.gmailLabel'); setPh('fpGmail','fp.gmailPh'); setErr('fpGmailErr','err.gmail');
    setLabelOf('fpRoll','fp.rollLabel');   setPh('fpRoll','fp.rollPh');   setErr('fpRollErr','err.roll');
    setBtnText(q('#forgotStep1 .auth-btn:not(.auth-link-btn)'), 'fp.sendBtn');
    const fpBack = q('#forgotStep1 button.auth-link-btn[onclick*="backToLogin"]');
    if(fpBack){
      for(const n of fpBack.childNodes){
        if(n.nodeType === 3 && n.nodeValue.trim()){ n.nodeValue = tr('fp.backLogin'); break; }
      }
    }
    // Step 2
    const fpStep2Hero = q('#forgotStep2 > div:first-child');
    if(fpStep2Hero){
      const t2 = fpStep2Hero.children[1]; if(t2) t2.textContent = tr('fp.otpTitle');
      const s2 = fpStep2Hero.children[2];
      if(s2){
        const sp = s2.querySelector('#fpEmailDisplay');
        const email = sp ? sp.textContent : '';
        s2.innerHTML = '<span id="fpEmailDisplay" style="color:#6C63FF; font-weight:700;">'+email+'</span><br>'+tr('fp.otpSub');
      }
    }
    setErr('fpOtpErr','err.otpWrongShort');
    const fpResendBtn = $('fpResendBtn'); if(fpResendBtn) fpResendBtn.textContent = tr('fp.otpResend');
    setBtnText(q('#forgotStep2 .auth-btn'), 'fp.otpVerifyBtn');
    // Step 3
    const fpStep3Hero = q('#forgotStep3 > div:first-child');
    if(fpStep3Hero){
      const t3 = fpStep3Hero.children[1]; if(t3) t3.textContent = tr('fp.newPassTitle');
      const s3 = fpStep3Hero.children[2]; if(s3) s3.textContent = tr('fp.newPassSub');
    }
    setLabelOf('fpNewPass','fp.newPassLabel'); setPh('fpNewPass','fp.newPassPh');
    const passHint2 = $('passHint2'); if(passHint2) passHint2.textContent = tr('fp.newPassHint');
    setErr('fpPassErr','err.passWeak');
    setLabelOf('fpNewPass2','fp.newPass2Label'); setPh('fpNewPass2','fp.newPass2Ph');
    setErr('fpPass2Err','err.passMismatch');
    setBtnText(q('#forgotStep3 .auth-btn'), 'fp.saveBtn');
    // Success
    const successBox = q('#forgotSuccess .auth-success');
    if(successBox){
      const kids = Array.from(successBox.children);
      if(kids[1]) kids[1].textContent = tr('fp.successTitle');
      if(kids[2]) kids[2].textContent = tr('fp.successSub');
      if(kids[3]) setBtnText(kids[3], 'fp.successBtn');
    }
    // Pending
    const pendBox = q('#pendingApprovalScreen .auth-success');
    if(pendBox){
      const kids = Array.from(pendBox.children);
      if(kids[1]) kids[1].textContent = tr('pending.title');
      if(kids[2]) kids[2].textContent = tr('pending.sub');
      if(kids[3]) setBtnText(kids[3], 'pending.btn');
    }
  }

  // Live-translate dynamic strings (error msgs, redirect overlay, step label, pass hint)
  // via a MutationObserver that swaps textContent whenever it matches a known pair.
  const busy = new WeakSet();
  function retranslateNode(el){
    if(!el || busy.has(el)) return;
    const cur = el.textContent;
    if(!cur) return;
    const trS = translateStr(cur.trim());
    if(trS !== cur.trim() && trS !== cur){
      busy.add(el);
      el.textContent = trS;
      Promise.resolve().then(() => busy.delete(el));
    }
  }
  function watch(el){
    if(!el || el._authTrWatched) return;
    el._authTrWatched = true;
    new MutationObserver(() => retranslateNode(el))
      .observe(el, { childList:true, characterData:true, subtree:true });
  }

  function wireLiveWatchers(){
    document.querySelectorAll('.auth-error-msg').forEach(watch);
    ['regStepLabel','passHint','passHint2','authRedirectTitle','authRedirectSub'].forEach(id => watch($(id)));
  }

  // Also wrap known dynamic setters so pass-hint / step label become translated
  const _cps = window.checkPassStrength;
  if(typeof _cps === 'function'){
    window.checkPassStrength = function(){
      const r = _cps.apply(this, arguments);
      const h = $('passHint');
      if(h){
        const l = currentLang();
        const s = S[l] || S.bn;
        const txt = (h.textContent||'').trim();
        if(txt.indexOf('দুর্বল')>=0 || /weak/i.test(txt)) h.textContent = s['pass.weak'];
        else if(txt.indexOf('মোটামুটি')>=0 || /medium/i.test(txt)) h.textContent = s['pass.medium'];
        else if(txt.indexOf('শক্তিশালী')>=0 || /strong/i.test(txt)) h.textContent = s['pass.strong'];
      }
      return r;
    };
  }
  const _cps2 = window.checkPassStrength2;
  if(typeof _cps2 === 'function'){
    window.checkPassStrength2 = function(){
      const r = _cps2.apply(this, arguments);
      const h = $('passHint2');
      if(h){
        const l = currentLang();
        const s = S[l] || S.bn;
        const txt = (h.textContent||'').trim();
        if(txt.indexOf('দুর্বল')>=0 || /weak/i.test(txt)) h.textContent = s['pass.weak'];
        else if(txt.indexOf('মোটামুটি')>=0 || /medium/i.test(txt)) h.textContent = s['pass.medium'];
        else if(txt.indexOf('শক্তিশালী')>=0 || /strong/i.test(txt)) h.textContent = s['pass.strong'];
      }
      return r;
    };
  }
  const _srs = window.showRegStep;
  if(typeof _srs === 'function'){
    window.showRegStep = function(step){
      const r = _srs.apply(this, arguments);
      const lbl = $('regStepLabel');
      if(lbl){
        const s = S[currentLang()] || S.bn;
        const k = step===1?'reg.step1Label':step===2?'reg.step2Label':'reg.step3Label';
        if(s[k]) lbl.textContent = s[k];
      }
      return r;
    };
  }

  function boot(){
    try { applyAuth(); } catch(e){ console && console.warn && console.warn('[i18n auth] applyAuth failed', e); }
    wireLiveWatchers();
    // Re-apply on language change
    window.addEventListener('i18n:changed', () => { try { applyAuth(); } catch(_){} });
    // Also re-apply after any auth screen visibility change (in case markup was late-added)
    ['authScreen','forgotScreen','pendingApprovalScreen'].forEach(id => {
      const el = $(id); if(!el) return;
      new MutationObserver(() => { try { applyAuth(); wireLiveWatchers(); } catch(_){} })
        .observe(el, { attributes:true, attributeFilter:['class'] });
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
