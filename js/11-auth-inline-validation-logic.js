
(function(){
  const $ = (id) => document.getElementById(id);

  function isValidGmailLocal(v){ return /^[^\s@]+@gmail\.com$/i.test((v||'').trim()); }
  function isNonEmpty(v){ return !!(v && String(v).trim()); }
  function isMinLen(v, n){ return isNonEmpty(v) && String(v).trim().length >= n; }
  function isStrongPass(v){
    if(!v || v.length < 8) return false;
    let s = 0;
    if(/[A-Z]/.test(v) && /[a-z]/.test(v)) s++;
    if(/[0-9]/.test(v)) s++;
    if(/[^A-Za-z0-9]/.test(v)) s++;
    return s >= 2; // matches app's "medium+" threshold
  }
  function hasIdCard(){
    const img = $('idCardImg');
    const file = $('regIdFile');
    return !!(img && img.src && img.src !== window.location.href && !img.src.endsWith('#'))
        || !!(file && file.files && file.files.length);
  }

  // Show/hide inline error using existing .show class
  function setErr(errId, show, msg){
    const el = $(errId);
    if(!el) return;
    if(show){
      if(msg) el.textContent = msg;
      el.classList.add('show');
      el.style.display = '';
    } else {
      el.classList.remove('show');
    }
  }

  function markField(inputId, ok, touched){
    const inp = $(inputId);
    if(!inp) return;
    inp.classList.remove('valid','invalid');
    if(!touched) return;
    inp.classList.add(ok ? 'valid' : 'invalid');
    const wrap = inp.closest('.auth-input-wrap');
    if(wrap){
      // don't add checkmark on select (native arrow overlaps)
      if(ok && inp.tagName === 'INPUT') wrap.classList.add('has-check');
      else wrap.classList.remove('has-check');
    }
  }

  /*
   * Form config: each entry defines fields with a validator + optional
   * error id + error message; and the submit button selector.
   * validate() returns true when the submit button should be enabled.
   */
  const forms = [
    {
      key: 'login',
      btn: () => document.querySelector('#loginSection .auth-btn:not(.auth-btn-outline)'),
      fields: [
        { id:'loginRoll',  err:'loginRollErr',  msg:'Roll Number দাও',   test: v => isNonEmpty(v) },
        { id:'loginGmail', err:'loginGmailErr', msg:'সঠিক Gmail দাও',   test: v => isValidGmailLocal(v) },
        { id:'loginPass',  err:'loginPassErr',  msg:'পাসওয়ার্ড দাও',    test: v => isNonEmpty(v) },
      ],
      container: () => $('loginSection'),
    },
    {
      key: 'reg1',
      btn: () => document.querySelector('#regStep1 .auth-btn:not(.auth-btn-outline)'),
      fields: [
        { id:'regName',  err:'regNameErr',  msg:'নাম দাও (অন্তত ৩ অক্ষর)', test: v => isMinLen(v,3) },
        { id:'regGmail', err:'regGmailErr', msg:'সঠিক Gmail দাও (@gmail.com)', test: v => isValidGmailLocal(v) },
        { id:'regDept',  err:'regDeptErr',  msg:'ডিপার্টমেন্ট বেছে নাও', test: v => isNonEmpty(v) },
        { id:'regYear',  err:'regYearErr',  msg:'বর্ষ বেছে নাও', test: v => isNonEmpty(v),
          optional: () => { // teacher role hides year field
            const f = $('regYearField');
            return f && (f.classList.contains('hidden') || f.style.display === 'none');
          }
        },
        { id:'regRoll',  err:'regRollErr',  msg:'Roll Number দাও', test: v => isNonEmpty(v),
          optional: () => {
            const f = $('regRollField');
            return f && (f.classList.contains('hidden') || f.style.display === 'none');
          }
        },
        { id:'regBlood', err:'regBloodErr', msg:'ব্লাড গ্রুপ বেছে নাও', test: v => isNonEmpty(v) },
      ],
      container: () => $('regStep1'),
    },
    {
      key: 'reg2',
      btn: () => document.querySelector('#regStep2 .auth-btn:not(.auth-btn-outline):not([onclick*="showRegStep(1)"])'),
      fields: [
        { id:'regPass',  err:'regPassErr',  msg:'শক্তিশালী পাসওয়ার্ড দাও', test: v => isStrongPass(v) },
        { id:'regPass2', err:'regPass2Err', msg:'পাসওয়ার্ড মিলছে না', test: v => v && v === $('regPass').value },
        { id:'regIdFile', err:'regIdErr', msg:'ID Card এর ছবি দাও', test: () => hasIdCard(), listenOn:'change' },
      ],
      container: () => $('regStep2'),
    },
    {
      key: 'fp1',
      btn: () => document.querySelector('#forgotStep1 .auth-btn:not(.auth-btn-outline)'),
      fields: [
        { id:'fpGmail', err:'fpGmailErr', msg:'সঠিক Gmail দাও',   test: v => isValidGmailLocal(v) },
        { id:'fpRoll',  err:'fpRollErr',  msg:'Roll Number দাও',   test: v => isNonEmpty(v) },
      ],
      container: () => $('forgotStep1'),
    },
    {
      key: 'fp3',
      btn: () => document.querySelector('#forgotStep3 .auth-btn:not(.auth-btn-outline)'),
      fields: [
        { id:'fpNewPass',  err:'fpPassErr',  msg:'শক্তিশালী পাসওয়ার্ড দাও', test: v => isStrongPass(v) },
        { id:'fpNewPass2', err:'fpPass2Err', msg:'পাসওয়ার্ড মিলছে না', test: v => v && v === $('fpNewPass').value },
      ],
      container: () => $('forgotStep3'),
    },
  ];

  const touched = {}; // key -> Set of field ids

  function validateForm(form, opts){
    opts = opts || {};
    const t = touched[form.key] || (touched[form.key] = new Set());
    let allOk = true;
    let anyTouched = false;
    for(const f of form.fields){
      const inp = $(f.id);
      if(!inp) { continue; }
      if(f.optional && f.optional()){
        setErr(f.err, false);
        markField(f.id, true, false);
        continue;
      }
      const val = (inp.type === 'file') ? inp.files : inp.value;
      const ok = !!f.test(val);
      if(!ok) allOk = false;
      const isTouched = t.has(f.id) || opts.forceShow;
      if(isTouched) anyTouched = true;
      // Only show error after the field is touched (or on submit-force)
      setErr(f.err, isTouched && !ok, f.msg);
      markField(f.id, ok, isTouched);
    }
    const btn = form.btn();
    if(btn){
      if(allOk) btn.classList.remove('is-disabled');
      else      btn.classList.add('is-disabled');
      btn.setAttribute('aria-disabled', allOk ? 'false' : 'true');
    }
    return allOk;
  }

  function markTouched(form, fieldId){
    (touched[form.key] || (touched[form.key] = new Set())).add(fieldId);
  }

  function attachForm(form){
    for(const f of form.fields){
      const inp = $(f.id);
      if(!inp || inp._authValBound) continue;
      inp._authValBound = true;
      const evt = f.listenOn || (inp.tagName === 'SELECT' ? 'change' : 'input');
      inp.addEventListener(evt, () => { markTouched(form, f.id); validateForm(form); });
      inp.addEventListener('blur',  () => { markTouched(form, f.id); validateForm(form); });
    }
    // Cross-field: regPass changes affect regPass2 validity
    if(form.key === 'reg2'){
      const p = $('regPass'); if(p) p.addEventListener('input', () => validateForm(form));
    }
    if(form.key === 'fp3'){
      const p = $('fpNewPass'); if(p) p.addEventListener('input', () => validateForm(form));
    }
    validateForm(form); // initial pass — disables button, no visible errors yet
  }

  function attachAll(){ forms.forEach(attachForm); }

  // Intercept submit clicks — if invalid, mark all fields touched and block
  function guardSubmit(form){
    const btn = form.btn();
    if(!btn || btn._authGuardBound) return;
    btn._authGuardBound = true;
    btn.addEventListener('click', function(ev){
      const okAll = validateForm(form, { forceShow:true });
      if(!okAll){
        ev.stopImmediatePropagation();
        ev.preventDefault();
        // clear the loading state applied by the smooth-loading layer
        try { window._authClearLoading && window._authClearLoading(); } catch(_){}
        // shake the first invalid field into view
        for(const f of form.fields){
          if(f.optional && f.optional()) continue;
          const inp = $(f.id);
          if(inp && inp.classList.contains('invalid')){
            try { inp.focus({ preventScroll:false }); } catch(_) { inp.focus(); }
            break;
          }
        }
      } else {
        forms.forEach(x => touched[x.key] && touched[x.key].clear());
      }
    }, true); // capture — runs before the onclick handler
  }

  function guardAll(){ forms.forEach(guardSubmit); }

  function boot(){
    attachAll();
    guardAll();
    // Re-run when register step changes visibility (file input, year toggle, etc.)
    const targets = ['regStep1','regStep2','forgotStep1','forgotStep3','loginSection','regYearField','regRollField'];
    targets.forEach(id => {
      const el = $(id);
      if(!el) return;
      new MutationObserver(() => forms.forEach(f => validateForm(f)))
        .observe(el, { attributes:true, attributeFilter:['class','style'] });
    });
    // File preview writes to #idCardImg — watch it
    const idImg = $('idCardImg');
    if(idImg){
      new MutationObserver(() => {
        const reg2 = forms.find(f => f.key === 'reg2');
        if(reg2){ markTouched(reg2, 'regIdFile'); validateForm(reg2); }
      }).observe(idImg, { attributes:true, attributeFilter:['src'] });
    }
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
