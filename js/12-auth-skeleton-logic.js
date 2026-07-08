
(function(){
  const $ = id => document.getElementById(id);

  // ============================================================
  // 1) SKELETON LOADERS — reserve layout, prevent jump on boot
  // ============================================================
  const SKEL_TARGETS = [
    { host:'loginSection',  fields:3, hasBtn:true },
    { host:'regStep1',      fields:6, hasBtn:true },
    { host:'forgotStep1',   fields:2, hasBtn:true },
  ];

  function buildSkeleton(cfg){
    const host = $(cfg.host);
    if(!host || host.querySelector('.auth-skel-overlay')) return;
    // Ensure host is positioned so absolute overlay is contained
    const cs = getComputedStyle(host);
    if(cs.position === 'static') host.style.position = 'relative';

    const ov = document.createElement('div');
    ov.className = 'auth-skel-overlay';
    let html = '';
    for(let i=0; i<cfg.fields; i++){
      html += '<div><div class="skel skel-label"></div><div class="skel skel-input"></div></div>';
    }
    if(cfg.hasBtn) html += '<div class="skel skel-btn"></div>';
    ov.innerHTML = html;
    host.appendChild(ov);
  }

  function hideSkeleton(hostId){
    const host = $(hostId);
    if(!host) return;
    const ov = host.querySelector('.auth-skel-overlay');
    if(!ov) return;
    ov.classList.add('hide');
    setTimeout(() => ov.remove(), 420);
  }

  function bootSkeletons(){
    SKEL_TARGETS.forEach(buildSkeleton);
    // Hide once fonts + first paint settle; keeps ≥350ms to feel intentional
    const done = () => setTimeout(() => SKEL_TARGETS.forEach(t => hideSkeleton(t.host)), 380);
    if(document.readyState === 'complete') done();
    else window.addEventListener('load', done, { once:true });
    // Safety
    setTimeout(() => SKEL_TARGETS.forEach(t => hideSkeleton(t.host)), 2500);
  }

  // ============================================================
  // 2) REMEMBER ME — injected into login section, persists prefs
  // ============================================================
  const REMEMBER_KEY = 'dc_remember_login';

  function injectRememberMe(){
    const login = $('loginSection');
    if(!login || $('rememberMe')) return;
    // Insert row just before the "forgot password" right-aligned row
    const fpRow = login.querySelector('button.auth-link-btn[onclick*="showForgotPass"]')?.parentElement;
    const row = document.createElement('div');
    row.className = 'auth-remember-row';
    row.innerHTML = `
      <label class="auth-remember" for="rememberMe">
        <input type="checkbox" id="rememberMe" />
        <span class="rm-box" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
        <span>আমাকে মনে রেখো</span>
      </label>
    `;
    if(fpRow){
      // Move the forgot-password link into the same row for a cleaner layout
      const link = fpRow.querySelector('button');
      if(link){
        row.appendChild(link);
        fpRow.remove();
      }
      login.querySelector('.auth-field:has(#loginPass)')?.after(row);
    } else {
      login.querySelector('.auth-field:has(#loginPass)')?.after(row);
    }

    const cb = $('rememberMe');
    // Restore prior preference + prefilled identifiers
    try {
      const raw = localStorage.getItem(REMEMBER_KEY);
      if(raw){
        const saved = JSON.parse(raw);
        cb.checked = !!saved.remember;
        if(saved.remember){
          if(saved.roll  && $('loginRoll'))  $('loginRoll').value  = saved.roll;
          if(saved.gmail && $('loginGmail')) $('loginGmail').value = saved.gmail;
          // fire input events so validators mark them valid
          ['loginRoll','loginGmail'].forEach(id => {
            const el = $(id); if(el) el.dispatchEvent(new Event('input', { bubbles:true }));
          });
        }
      }
    } catch(_){}

    // Persist toggle changes immediately
    cb.addEventListener('change', persistRemember);
  }

  function persistRemember(){
    const cb = $('rememberMe');
    if(!cb) return;
    try {
      if(cb.checked){
        localStorage.setItem(REMEMBER_KEY, JSON.stringify({
          remember: true,
          roll:  $('loginRoll')?.value.trim()  || '',
          gmail: $('loginGmail')?.value.trim() || '',
        }));
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch(_){}
  }

  // Configure Supabase session persistence based on the checkbox.
  // With Supabase JS, the localStorage-backed session is what "keeps you signed in".
  // When unchecked, we downgrade to sessionStorage so the session dies with the tab.
  function applySessionStorageMode(){
    const cb = $('rememberMe');
    const keep = !!(cb && cb.checked);
    try {
      const sb = window.sb || window.supabase;
      if(sb && sb.auth && typeof sb.auth.setSession === 'function'){
        // supabase-js v2: we can't swap storage after init, but we can mirror
        // the session between local/session storage to honour the choice.
        const keys = [];
        for(let i=0; i<localStorage.length; i++){
          const k = localStorage.key(i);
          if(k && /^sb-.*-auth-token$/.test(k)) keys.push(k);
        }
        keys.forEach(k => {
          const v = localStorage.getItem(k);
          if(!v) return;
          if(keep){
            // ensure both stores have it; sessionStorage copy is harmless
            try { sessionStorage.setItem(k, v); } catch(_){}
          } else {
            // move from local -> session so it clears on tab close
            try { sessionStorage.setItem(k, v); } catch(_){}
            try { localStorage.removeItem(k); } catch(_){}
          }
        });
      }
    } catch(_){}
    // Also remember the user's choice for future page loads
    try {
      localStorage.setItem('dc_remember_flag', keep ? '1' : '0');
    } catch(_){}
  }

  // Wire persistence to happen right when login button is clicked
  function wireLoginPersistence(){
    const btn = document.querySelector('#loginSection .auth-btn:not(.auth-btn-outline)');
    if(!btn || btn._rememberBound) return;
    btn._rememberBound = true;
    btn.addEventListener('click', () => {
      persistRemember();
      // Apply after auth library has had a moment to write its token
      setTimeout(applySessionStorageMode, 800);
      setTimeout(applySessionStorageMode, 2200);
    });
  }

  // ============================================================
  // 3) REDIRECT / ROUTE-CHANGE OVERLAY
  // ============================================================
  const overlay = $('authRedirectOverlay');
  const overlayTitle = $('authRedirectTitle');
  const overlaySub   = $('authRedirectSub');
  let overlayTimer = null;

  function showRedirectOverlay(title, sub, maxMs){
    if(!overlay) return;
    if(title) overlayTitle.textContent = title;
    if(sub)   overlaySub.textContent   = sub;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    clearTimeout(overlayTimer);
    overlayTimer = setTimeout(hideRedirectOverlay, maxMs || 3500);
  }
  function hideRedirectOverlay(){
    if(!overlay) return;
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    clearTimeout(overlayTimer);
  }
  window._showAuthRedirect = showRedirectOverlay;
  window._hideAuthRedirect = hideRedirectOverlay;

  // Show overlay whenever the auth screen becomes hidden (successful login),
  // and hide it a moment later when the main app has mounted.
  function watchAuthTransition(){
    const auth = $('authScreen');
    if(!auth) return;
    let wasVisible = !auth.classList.contains('hidden');
    new MutationObserver(() => {
      const nowHidden = auth.classList.contains('hidden');
      if(wasVisible && nowHidden){
        showRedirectOverlay('স্বাগতম!', 'তোমার ফিড লোড হচ্ছে…', 2200);
        // Hide once the main app is definitely present
        setTimeout(hideRedirectOverlay, 900);
      }
      wasVisible = !nowHidden;
    }).observe(auth, { attributes:true, attributeFilter:['class'] });

    // Also show on forgot-password screen swap
    ['forgotScreen','pendingApprovalScreen'].forEach(id => {
      const el = $(id);
      if(!el) return;
      let vis = !el.classList.contains('hidden');
      new MutationObserver(() => {
        const nowVis = !el.classList.contains('hidden');
        if(!vis && nowVis && id === 'forgotScreen'){
          showRedirectOverlay('চলো এগোই…', 'পাসওয়ার্ড রিসেট পেজে যাচ্ছি', 700);
          setTimeout(hideRedirectOverlay, 550);
        }
        vis = nowVis;
      }).observe(el, { attributes:true, attributeFilter:['class'] });
    });
  }

  // Boot
  function boot(){
    bootSkeletons();
    injectRememberMe();
    wireLoginPersistence();
    watchAuthTransition();
    // If the user had "remember me" off on last session, downgrade any existing token now
    try {
      if(localStorage.getItem('dc_remember_flag') === '0') applySessionStorageMode();
    } catch(_){}
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
