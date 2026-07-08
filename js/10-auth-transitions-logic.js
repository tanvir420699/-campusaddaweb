
(function(){
  function playAnim(el, cls){
    if(!el) return;
    el.classList.remove('auth-anim-in','auth-anim-in-back','auth-anim-swap');
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(()=>{ el.classList.remove(cls); }, 650);
  }

  function wrap(name, wrapper){
    const orig = window[name];
    if(typeof orig !== 'function') return;
    window[name] = function(){
      return wrapper(orig, this, arguments);
    };
  }

  wrap('showAuthTab', function(orig, ctx, args){
    const r = orig.apply(ctx, args);
    const tab = args[0];
    const el = document.getElementById(tab === 'register' ? 'registerSection' : 'loginSection');
    playAnim(el, tab === 'register' ? 'auth-anim-in' : 'auth-anim-in-back');
    return r;
  });

  wrap('showRegStep', function(orig, ctx, args){
    const r = orig.apply(ctx, args);
    const step = args[0];
    playAnim(document.getElementById('regStep' + step), 'auth-anim-in');
    return r;
  });

  wrap('showForgotPass', function(orig, ctx, args){
    const r = orig.apply(ctx, args);
    playAnim(document.getElementById('forgotScreen'), 'auth-anim-swap');
    playAnim(document.getElementById('forgotStep1'), 'auth-anim-in');
    return r;
  });

  wrap('backToLogin', function(orig, ctx, args){
    const r = orig.apply(ctx, args);
    playAnim(document.getElementById('authScreen'), 'auth-anim-swap');
    playAnim(document.getElementById('loginSection'), 'auth-anim-in-back');
    return r;
  });

  wrap('backToLoginFromPending', function(orig, ctx, args){
    const r = orig.apply(ctx, args);
    playAnim(document.getElementById('authScreen'), 'auth-anim-swap');
    playAnim(document.getElementById('loginSection'), 'auth-anim-in-back');
    return r;
  });

  ['fpSendOtp','fpVerifyOtp'].forEach(fn => {
    wrap(fn, function(orig, ctx, args){
      const r = orig.apply(ctx, args);
      setTimeout(()=>{
        ['forgotStep2','forgotStep3','forgotSuccess'].forEach(id => {
          const el = document.getElementById(id);
          if(el && !el.classList.contains('hidden')) playAnim(el, 'auth-anim-in');
        });
      }, 0);
      return r;
    });
  });

  const progressBar = document.getElementById('authProgressBar');
  let activeLoaders = 0;
  function progOn(){ activeLoaders++; progressBar.classList.add('active'); }
  function progOff(){ activeLoaders = Math.max(0, activeLoaders - 1); if(activeLoaders === 0) progressBar.classList.remove('active'); }

  function stopLoading(btn){
    if(!btn || !btn.classList.contains('loading')) return;
    btn.classList.remove('loading');
    btn.disabled = false;
    const body = btn.closest('.auth-body');
    if(body) body.classList.remove('is-loading');
    progOff();
    if(btn._authLoadTimer){ clearTimeout(btn._authLoadTimer); btn._authLoadTimer = null; }
  }

  function startLoading(btn){
    if(!btn || btn.classList.contains('loading')) return;
    if(btn.classList.contains('auth-btn-outline')) return;
    btn.classList.add('loading');
    btn.disabled = true;
    const body = btn.closest('.auth-body');
    if(body) body.classList.add('is-loading');
    progOn();
    btn._authLoadTimer = setTimeout(()=> stopLoading(btn), 6000);

    const section = btn.closest('.auth-section, .auth-body, .auth-screen');
    if(section){
      const obs = new MutationObserver(()=>{
        if(section.classList.contains('hidden')){
          stopLoading(btn);
          obs.disconnect();
        }
      });
      obs.observe(section, { attributes:true, attributeFilter:['class'] });
    }
  }

  function watchForErrors(btn){
    const section = btn.closest('.auth-section, .auth-body');
    if(!section) return;
    let done = false;
    const obs = new MutationObserver(()=>{
      const errs = section.querySelectorAll('.auth-error-msg');
      for(const e of errs){
        const cs = getComputedStyle(e);
        if(cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.1){
          if(done) return; done = true;
          obs.disconnect(); stopLoading(btn); return;
        }
      }
    });
    obs.observe(section, { attributes:true, subtree:true, attributeFilter:['class','style'] });
    setTimeout(()=>{ if(!done){ done = true; obs.disconnect(); stopLoading(btn); } }, 1400);
  }

  document.addEventListener('click', function(ev){
    const btn = ev.target.closest && ev.target.closest('.auth-btn');
    if(!btn) return;
    if(btn.classList.contains('auth-btn-outline')) return;
    if(btn.disabled || btn.classList.contains('loading')) return;
    if(!btn.closest('#authScreen, #forgotScreen, #pendingApprovalScreen')) return;
    startLoading(btn);
    watchForErrors(btn);
  }, true);

  window._authClearLoading = function(){
    document.querySelectorAll('.auth-btn.loading').forEach(stopLoading);
  };
})();
