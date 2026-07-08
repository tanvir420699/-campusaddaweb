
(function(){
  if(!window.I18N) return;

  // ---------- 1. Namespace additions ----------
  I18N.bn.banners = Object.assign({}, I18N.bn.banners||{}, {
    pwaTitle:"Campus Adda ইনস্টল করো",
    pwaSub:"হোম স্ক্রিনে যোগ করলে দ্রুত অ্যাক্সেস পাবে",
    pwaInstall:"ইনস্টল",
    pushTitle:"Push নোটিফিকেশন চালু করো",
    pushSub:"লাইক, কমেন্ট ও mention এর তাৎক্ষণিক আপডেট পাবে",
    pushEnable:"চালু করো",
    pushLater:"পরে",
    birthdayTitleDefault:"আজ কারো জন্মদিন!",
    birthdaySubDefault:"উইশ করতে ভুলো না 🎉",
    // Dynamic push toast titles produced by showPushToast()
    toastLike:"নতুন লাইক ❤️",
    toastMention:"নতুন Mention @",
    toastComment:'নতুন কমেন্ট <svg style="vertical-align:-2px;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    toastGeneric:"নোটিফিকেশন",
  });
  I18N.en.banners = Object.assign({}, I18N.en.banners||{}, {
    pwaTitle:"Install Campus Adda",
    pwaSub:"Add it to your home screen for quick access",
    pwaInstall:"Install",
    pushTitle:"Enable push notifications",
    pushSub:"Get instant updates for likes, comments and mentions",
    pushEnable:"Enable",
    pushLater:"Later",
    birthdayTitleDefault:"Someone has a birthday today!",
    birthdaySubDefault:"Don't forget to wish them 🎉",
    toastLike:"New like ❤️",
    toastMention:"New mention @",
    toastComment:'New comment <svg style="vertical-align:-2px;" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    toastGeneric:"Notification",
  });

  I18N.bn.notifPanel = Object.assign({}, I18N.bn.notifPanel||{}, {
    title:"নোটিফিকেশন",
    markAll:"সব পড়া হয়েছে",
  });
  I18N.en.notifPanel = Object.assign({}, I18N.en.notifPanel||{}, {
    title:"Notifications",
    markAll:"Mark all read",
  });

  // Helper — safe translate lookup that falls back to original text
  const tr = (key, fallback) => {
    try {
      const parts = key.split('.');
      let node = I18N[ (window.currentLang || (typeof settings!=='undefined' && settings.language) || 'bn') ];
      for(const p of parts){ node = node && node[p]; }
      return (typeof node === 'string') ? node : fallback;
    } catch(_) { return fallback; }
  };

  // ---------- 2. Banner static translators ----------
  function applyPwaBanner(){
    const b = document.getElementById('pwaBanner'); if(!b) return;
    const title = b.querySelector('.banner-title'); if(title) title.textContent = tr('banners.pwaTitle', title.textContent);
    const sub   = b.querySelector('.banner-sub');   if(sub)   sub.textContent   = tr('banners.pwaSub',   sub.textContent);
    const btns  = b.querySelectorAll('.banner-btn');
    if(btns[0]) btns[0].textContent = tr('banners.pwaInstall', btns[0].textContent);
    // btns[1] is an SVG close icon — leave untouched
  }
  function applyPushBanner(){
    const b = document.getElementById('pushBanner'); if(!b) return;
    const title = b.querySelector('.banner-title'); if(title) title.textContent = tr('banners.pushTitle', title.textContent);
    const sub   = b.querySelector('.banner-sub');   if(sub)   sub.textContent   = tr('banners.pushSub',   sub.textContent);
    const btns  = b.querySelectorAll('.banner-btn');
    if(btns[0]) btns[0].textContent = tr('banners.pushEnable', btns[0].textContent);
    if(btns[1]) btns[1].textContent = tr('banners.pushLater',  btns[1].textContent);
  }
  function applyBirthdayBanner(){
    const t = document.getElementById('birthdayBannerTitle');
    const s = document.getElementById('birthdayBannerSub');
    // Only rewrite when the current content matches a known default
    // (avoids clobbering a dynamic personalised "সোনালী এর জন্মদিন" style message).
    if(t){
      const bnDef='আজ কারো জন্মদিন!', enDef='Someone has a birthday today!';
      if(t.textContent===bnDef || t.textContent===enDef) t.textContent = tr('banners.birthdayTitleDefault', t.textContent);
    }
    if(s){
      const bnDef='উইশ করতে ভুলো না 🎉', enDef="Don't forget to wish them 🎉";
      if(s.textContent===bnDef || s.textContent===enDef) s.textContent = tr('banners.birthdaySubDefault', s.textContent);
    }
  }
  function applyPushToast(){
    const el = document.getElementById('pushToastTitle'); if(!el) return;
    // Map any known bn string to its en counterpart (and vice-versa) using both dictionaries
    const map = {
      [I18N.bn.banners.toastLike]: 'toastLike',
      [I18N.en.banners.toastLike]: 'toastLike',
      [I18N.bn.banners.toastMention]: 'toastMention',
      [I18N.en.banners.toastMention]: 'toastMention',
      [I18N.bn.banners.toastComment]: 'toastComment',
      [I18N.en.banners.toastComment]: 'toastComment',
      [I18N.bn.banners.toastGeneric]: 'toastGeneric',
      [I18N.en.banners.toastGeneric]: 'toastGeneric',
    };
    const currentHtml = el.innerHTML.trim();
    const currentText = el.textContent.trim();
    const key = map[currentHtml] || map[currentText];
    if(key) el.innerHTML = tr('banners.'+key, currentHtml);
  }

  // ---------- 3. Notification dropdown panel translator ----------
  function applyNotifPanel(){
    const panel = document.querySelector('.notif-panel .notif-panel-header'); if(!panel) return;
    const span = panel.querySelector('span'); if(span) span.textContent = tr('notifPanel.title', span.textContent);
    const btn  = panel.querySelector('button'); if(btn)  btn.textContent  = tr('notifPanel.markAll', btn.textContent);
  }

  // ---------- 4. Master ----------
  function applyPhase3(){
    try { applyPwaBanner(); } catch(_){}
    try { applyPushBanner(); } catch(_){}
    try { applyBirthdayBanner(); } catch(_){}
    try { applyPushToast(); } catch(_){}
    try { applyNotifPanel(); } catch(_){}
  }

  // ---------- 5. Observers — react when banners/toasts become visible ----------
  function watchVisibility(id, fn){
    const el = document.getElementById(id); if(!el) return;
    new MutationObserver(() => { try { fn(); } catch(_){} })
      .observe(el, { attributes:true, attributeFilter:['class','style'], childList:true, subtree:true });
  }

  function boot(){
    applyPhase3();

    watchVisibility('pwaBanner',      applyPwaBanner);
    watchVisibility('pushBanner',     applyPushBanner);
    watchVisibility('birthdayBanner', applyBirthdayBanner);
    watchVisibility('pushToast',      applyPushToast);

    // Notif panel is inserted lazily on open — observe body for its arrival
    const bodyObs = new MutationObserver(() => {
      if(document.querySelector('.notif-panel .notif-panel-header')) applyNotifPanel();
    });
    bodyObs.observe(document.body, { childList:true, subtree:true });

    // Re-run whenever language changes
    window.addEventListener('i18n:changed', applyPhase3);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
