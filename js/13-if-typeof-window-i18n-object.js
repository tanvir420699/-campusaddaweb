
(function(){
  if(typeof window.I18N !== 'object'){
    // Safety: never run if the main I18N object hasn't been created yet.
    // The scanner will still register itself for later boot.
    console && console.warn && console.warn('[i18n] I18N not ready; foundation is inert.');
    return;
  }

  // ---------- 1. Namespace stubs (empty; filled phase by phase) ----------
  const NS = ['auth','modals','settings','profile','posts','stories',
              'comments','groups','friends','messages','study',
              'notifications','search','errors','toasts','dialogs',
              'header','banners','pending'];
  NS.forEach(ns => {
    if(!I18N.bn[ns]) I18N.bn[ns] = {};
    if(!I18N.en[ns]) I18N.en[ns] = {};
  });

  // ---------- 2. DOM attribute scanner ----------
  // Attributes it understands:
  //   data-i18n              -> textContent
  //   data-i18n-html         -> innerHTML (only when the value comes from I18N,
  //                              which is author-controlled — safe)
  //   data-i18n-placeholder  -> element.placeholder
  //   data-i18n-title        -> element.title
  //   data-i18n-aria         -> element.setAttribute('aria-label', ...)
  //   data-i18n-value        -> element.value  (for buttons/inputs with value)
  //
  // Each attribute takes a dotted key: e.g. "auth.loginBtn" or "common.save".
  // If the key is missing in both languages, the DOM is untouched — original
  // hardcoded text stays visible. This makes the migration strictly additive.

  function lookupStrict(key){
    if(typeof t !== 'function') return undefined;
    const lang = (settings && settings.language) || 'bn';
    const pack = I18N[lang] || I18N.bn;
    const fb   = I18N.bn;
    const walk = (obj) => {
      if(!obj) return undefined;
      if(key.indexOf('.') === -1) return obj[key];
      return key.split('.').reduce((o,k)=> (o && o[k]!=null) ? o[k] : undefined, obj);
    };
    const v = walk(pack); if(v != null) return v;
    const v2 = walk(fb);   if(v2 != null) return v2;
    return undefined; // strict — no key fallback for the scanner
  }

  // Cache each element's original text so we can restore if a translation
  // is later removed (defensive; also lets us detect user-edited nodes).
  function captureOriginal(el, attr){
    if(el.dataset['_i18nOrig_' + attr] != null) return;
    let v;
    if(attr === 'text')        v = el.textContent;
    else if(attr === 'html')   v = el.innerHTML;
    else if(attr === 'placeholder') v = el.placeholder || '';
    else if(attr === 'title')  v = el.title || '';
    else if(attr === 'aria')   v = el.getAttribute('aria-label') || '';
    else if(attr === 'value')  v = el.value || '';
    el.dataset['_i18nOrig_' + attr] = v == null ? '' : String(v);
  }

  function applyI18nAttrs(root){
    root = root || document;
    if(!root.querySelectorAll) return;

    const jobs = [
      { sel: '[data-i18n]',              key: 'i18n',            kind: 'text' },
      { sel: '[data-i18n-html]',         key: 'i18nHtml',        kind: 'html' },
      { sel: '[data-i18n-placeholder]',  key: 'i18nPlaceholder', kind: 'placeholder' },
      { sel: '[data-i18n-title]',        key: 'i18nTitle',       kind: 'title' },
      { sel: '[data-i18n-aria]',         key: 'i18nAria',        kind: 'aria' },
      { sel: '[data-i18n-value]',        key: 'i18nValue',       kind: 'value' },
    ];

    for(const j of jobs){
      const nodes = root.querySelectorAll(j.sel);
      for(let i=0; i<nodes.length; i++){
        const el = nodes[i];
        const key = el.dataset[j.key];
        if(!key) continue;
        const val = lookupStrict(key);
        if(val == null){
          // No translation defined yet — leave DOM untouched.
          continue;
        }
        captureOriginal(el, j.kind);
        switch(j.kind){
          case 'text':        el.textContent = val; break;
          case 'html':        el.innerHTML  = val;  break;
          case 'placeholder': el.placeholder = val; break;
          case 'title':       el.title = val;       break;
          case 'aria':        el.setAttribute('aria-label', val); break;
          case 'value':       el.value = val;       break;
        }
      }
    }
  }

  window.applyI18nAttrs = applyI18nAttrs;

  // ---------- 3. Unified applyLanguage() helper ----------
  // Existing setLanguage() already handles settings save + rerenderAll +
  // toast. We just append attribute-scan + a public wrapper.
  const _origSetLanguage = window.setLanguage;
  window.applyLanguage = function(lang){
    if(lang !== 'bn' && lang !== 'en') lang = 'bn';
    if(typeof _origSetLanguage === 'function'){
      try { _origSetLanguage(lang); } catch(e){ console && console.warn && console.warn('[i18n] setLanguage threw', e); }
    } else if(typeof settings === 'object'){
      settings.language = lang;
      try { saveAppData && saveAppData(); } catch(_){}
      try { rerenderAll && rerenderAll(); } catch(_){}
    }
    try { applyI18nAttrs(document); } catch(_){}
    try { document.documentElement.lang = (lang === 'en' ? 'en' : 'bn'); } catch(_){}
    // Fire a custom event for any late-attached listeners
    try { window.dispatchEvent(new CustomEvent('i18n:changed', { detail:{ lang } })); } catch(_){}
  };

  // Wrap setLanguage so both existing call sites (the settings tiles) and
  // future callers get the attribute scan for free.
  if(typeof _origSetLanguage === 'function'){
    window.setLanguage = function(lang){
      const r = _origSetLanguage.apply(this, arguments);
      try { applyI18nAttrs(document); } catch(_){}
      try { document.documentElement.lang = (lang === 'en' ? 'en' : 'bn'); } catch(_){}
      try { window.dispatchEvent(new CustomEvent('i18n:changed', { detail:{ lang } })); } catch(_){}
      return r;
    };
  }

  // Also piggy-back on rerenderAll() so any code path that only calls
  // rerenderAll (e.g. after profile load) still translates static markup.
  const _origRerender = window.rerenderAll;
  if(typeof _origRerender === 'function'){
    window.rerenderAll = function(){
      const r = _origRerender.apply(this, arguments);
      try { applyI18nAttrs(document); } catch(_){}
      return r;
    };
  }

  // ---------- 4. Boot ----------
  function bootScan(){
    try { applyI18nAttrs(document); } catch(_){}
    try {
      const lang = (settings && settings.language) || 'bn';
      document.documentElement.lang = (lang === 'en' ? 'en' : 'bn');
    } catch(_){}
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bootScan);
  else bootScan();

  // Re-scan when new nodes are added (modals, dynamic renders). Debounced.
  let scanTimer = null;
  const obs = new MutationObserver(muts => {
    let hasAdded = false;
    for(const m of muts){
      if(m.type === 'childList' && m.addedNodes && m.addedNodes.length){
        for(const n of m.addedNodes){
          if(n.nodeType === 1 && (
              n.hasAttribute && (
                n.hasAttribute('data-i18n') ||
                n.hasAttribute('data-i18n-html') ||
                n.hasAttribute('data-i18n-placeholder') ||
                n.hasAttribute('data-i18n-title') ||
                n.hasAttribute('data-i18n-aria') ||
                n.hasAttribute('data-i18n-value')
              ) ||
              (n.querySelector && n.querySelector('[data-i18n],[data-i18n-html],[data-i18n-placeholder],[data-i18n-title],[data-i18n-aria],[data-i18n-value]'))
          )){
            hasAdded = true; break;
          }
        }
      }
      if(hasAdded) break;
    }
    if(!hasAdded) return;
    if(scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(() => { try { applyI18nAttrs(document); } catch(_){} }, 60);
  });
  // Start observing after first paint so initial scan wins
  window.addEventListener('load', () => {
    try { obs.observe(document.body, { childList:true, subtree:true }); } catch(_){}
  }, { once:true });
})();
