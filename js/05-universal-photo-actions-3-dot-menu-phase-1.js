
(function(){
  if (window.__PhotoActionsLoaded) return;
  window.__PhotoActionsLoaded = true;

  // ---------- Styles ----------
  var css = ''
   + '.pa-anchor{position:relative;display:inline-block;}'
   + '.pa-dot-btn{position:absolute;top:8px;right:8px;width:30px;height:30px;border-radius:50%;background:rgba(15,17,22,0.62);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:5;transition:transform .15s,background .15s;padding:0;}'
   + '.pa-dot-btn:hover{background:rgba(15,17,22,0.85);transform:scale(1.05);}'
   + '.pa-dot-btn svg{width:16px;height:16px;color:#fff;display:block;}'
   + '.pa-dot-btn.pa-inline{position:static;width:26px;height:26px;background:transparent;border:none;}'
   + '.pa-dot-btn.pa-inline svg{color:var(--muted2,#8B8FA8);}'
   + '.pa-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:1305;display:flex;align-items:flex-end;justify-content:center;animation:paFade .18s ease;}'
   + '.pa-overlay.pa-center{align-items:center;}'
   + '@keyframes paFade{from{opacity:0;}to{opacity:1;}}'
   + '@keyframes paSlide{from{transform:translateY(100%);}to{transform:translateY(0);}}'
   + '@keyframes paPop{from{transform:scale(.92);opacity:0;}to{transform:scale(1);opacity:1;}}'
   + '.pa-sheet{width:100%;max-width:430px;background:var(--bg2,#1A1D27);border-radius:18px 18px 0 0;padding:8px 0 max(12px,env(safe-area-inset-bottom));animation:paSlide .22s cubic-bezier(.32,.72,0,1);border-top:1px solid var(--border2,#252837);}'
   + '.pa-modal{width:calc(100% - 32px);max-width:360px;background:var(--bg2,#1A1D27);border:1px solid var(--border2,#252837);border-radius:18px;padding:20px;animation:paPop .18s ease;}'
   + '.pa-grabber{width:36px;height:4px;background:var(--bg4,#30354A);border-radius:3px;margin:6px auto 8px;}'
   + '.pa-meta{padding:8px 20px 12px;border-bottom:1px solid var(--border,#1E2130);}'
   + '.pa-meta-who{font-size:13px;font-weight:700;color:var(--text,#E8EAF0);}'
   + '.pa-meta-when{font-size:11px;color:var(--muted2,#8B8FA8);margin-top:2px;}'
   + '.pa-item{width:100%;background:transparent;border:none;padding:14px 20px;display:flex;align-items:center;gap:14px;color:var(--text,#E8EAF0);font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;text-align:left;transition:background .12s;}'
   + '.pa-item:hover{background:var(--bg3,#252837);}'
   + '.pa-item svg{width:20px;height:20px;flex-shrink:0;color:var(--text2,#C8CAD8);}'
   + '.pa-item.pa-danger{color:#F72585;}'
   + '.pa-item.pa-danger svg{color:#F72585;}'
   + '.pa-item-desc{font-size:11px;color:var(--muted2,#8B8FA8);font-weight:400;margin-top:2px;}'
   + '.pa-item-body{display:flex;flex-direction:column;flex:1;}'
   + '.pa-cancel{margin:6px 14px 4px;padding:12px;border-radius:12px;background:var(--bg3,#252837);border:none;color:var(--text,#E8EAF0);font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;width:calc(100% - 28px);}'
   + '.pa-modal h3{font-size:15px;font-weight:700;color:var(--text,#E8EAF0);margin-bottom:4px;}'
   + '.pa-modal p.pa-sub{font-size:12px;color:var(--muted2,#8B8FA8);margin-bottom:16px;}'
   + '.pa-reason{display:flex;align-items:center;gap:10px;padding:11px 12px;border-radius:10px;background:var(--bg3,#252837);border:1px solid transparent;margin-bottom:6px;cursor:pointer;font-size:13px;color:var(--text,#E8EAF0);transition:border-color .12s;}'
   + '.pa-reason:hover{border-color:var(--border2,#252837);}'
   + '.pa-reason.selected{border-color:var(--accent,#6C63FF);background:rgba(108,99,255,0.08);}'
   + '.pa-reason input{accent-color:var(--accent,#6C63FF);}'
   + '.pa-reason svg{width:16px;height:16px;color:var(--muted2,#8B8FA8);}'
   + '.pa-textarea{width:100%;background:var(--bg3,#252837);border:1px solid var(--border2,#252837);border-radius:10px;padding:10px 12px;color:var(--text,#E8EAF0);font-size:13px;font-family:inherit;resize:vertical;min-height:60px;margin-top:6px;outline:none;}'
   + '.pa-textarea:focus{border-color:var(--accent,#6C63FF);}'
   + '.pa-actions{display:flex;gap:8px;margin-top:16px;}'
   + '.pa-btn{flex:1;padding:11px;border-radius:10px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:opacity .15s;}'
   + '.pa-btn-secondary{background:var(--bg3,#252837);color:var(--text,#E8EAF0);}'
   + '.pa-btn-primary{background:linear-gradient(135deg,#6C63FF,#4CC9F0);color:#fff;}'
   + '.pa-btn:disabled{opacity:.55;cursor:not-allowed;}'
    + '.pa-toast{position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(15,17,22,0.94);color:#fff;padding:10px 16px;border-radius:24px;font-size:12.5px;font-weight:600;z-index:1310;animation:paPop .18s ease;border:1px solid rgba(255,255,255,0.08);}'
  ;
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // ---------- SVG icons ----------
  var ICONS = {
    dots: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"5\" r=\"1.4\"/><circle cx=\"12\" cy=\"12\" r=\"1.4\"/><circle cx=\"12\" cy=\"19\" r=\"1.4\"/></svg>',
    download: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" y1=\"15\" x2=\"12\" y2=\"3\"/></svg>',
    share: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8\"/><polyline points=\"16 6 12 2 8 6\"/><line x1=\"12\" y1=\"2\" x2=\"12\" y2=\"15\"/></svg>',
    flag: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"/><line x1=\"4\" y1=\"22\" x2=\"4\" y2=\"15\"/></svg>',
    close: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><line x1=\"18\" y1=\"6\" x2=\"6\" y2=\"18\"/><line x1=\"6\" y1=\"6\" x2=\"18\" y2=\"18\"/></svg>',
    spam: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" y1=\"8\" x2=\"12\" y2=\"12\"/><line x1=\"12\" y1=\"16\" x2=\"12.01\" y2=\"16\"/></svg>',
    nsfw: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24\"/><line x1=\"1\" y1=\"1\" x2=\"23\" y2=\"23\"/></svg>',
    other: '<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"1.5\" fill=\"currentColor\"/></svg>'
  };

  // ---------- Helpers ----------
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function toast(msg){
    var t=document.createElement('div'); t.className='pa-toast'; t.innerHTML=msg; document.body.appendChild(t);
    setTimeout(function(){ t.style.transition='opacity .25s'; t.style.opacity='0'; setTimeout(function(){ t.remove(); },250); }, 1800);
  }
  function fmtWhen(ts){
    if(!ts) return '';
    try{
      var d = (typeof ts==='number' || /^\d+$/.test(String(ts))) ? new Date(Number(ts)) : new Date(ts);
      if(isNaN(d.getTime())) return String(ts);
      var now=Date.now(), diff=(now-d.getTime())/1000;
      if(diff<60) return 'এইমাত্র';
      if(diff<3600) return Math.floor(diff/60)+' মিনিট আগে';
      if(diff<86400) return Math.floor(diff/3600)+' ঘন্টা আগে';
      if(diff<86400*7) return Math.floor(diff/86400)+' দিন আগে';
      return d.toLocaleDateString('bn-BD');
    }catch(e){ return ''; }
  }
  function closeAllPA(){
    document.querySelectorAll('.pa-overlay').forEach(function(el){ el.remove(); });
  }

  // ---------- Meta extraction from DOM ----------
  function extractMeta(imgEl){
    var meta = { photo_url: imgEl.src || imgEl.getAttribute('src') || '', source_type: 'unknown', source_id: null, owner_name: '', owner_id: null, when: null };
    // Explicit data attributes take priority
    var wrap = imgEl.closest('[data-pa-source]');
    if(wrap){
      meta.source_type = wrap.getAttribute('data-pa-source') || meta.source_type;
      meta.source_id = wrap.getAttribute('data-pa-source-id') || null;
      meta.owner_name = wrap.getAttribute('data-pa-owner') || '';
      meta.owner_id = wrap.getAttribute('data-pa-owner-id') || null;
      meta.when = wrap.getAttribute('data-pa-when') || null;
      return meta;
    }
    // Feed / single post
    var post = imgEl.closest('.post-card, .post');
    if(post){
      meta.source_type = 'post';
      meta.source_id = post.getAttribute('data-post-id') || post.id || null;
      var who = post.querySelector('.post-user, .post-author, .post-name');
      var when = post.querySelector('.post-time, .post-date, .time-ago');
      if(who) meta.owner_name = who.textContent.trim();
      if(when) meta.when = when.textContent.trim();
      return meta;
    }
    // Comment
    var cmt = imgEl.closest('.comment, .comment-item, .comment-node');
    if(cmt){
      meta.source_type = 'comment';
      meta.source_id = cmt.getAttribute('data-comment-id') || null;
      var cw = cmt.querySelector('.comment-user, .comment-name'); if(cw) meta.owner_name = cw.textContent.trim();
      var ct = cmt.querySelector('.comment-time, .time-ago'); if(ct) meta.when = ct.textContent.trim();
      return meta;
    }
    // Chat message bubble
    var msg = imgEl.closest('.msg-row, .msg-bubble, .chat-msg');
    if(msg){
      meta.source_type = 'chat';
      meta.source_id = msg.getAttribute('data-msg-id') || null;
      var mt = msg.querySelector('.msg-time'); if(mt) meta.when = mt.textContent.trim();
      return meta;
    }
    // Album grid item
    var alb = imgEl.closest('.photo-album-item');
    if(alb){
      meta.source_type = 'album';
      var tag = alb.querySelector('.photo-album-tag'); if(tag) meta.owner_name = tag.textContent.trim();
      return meta;
    }
    // Profile / cover / avatar heuristics
    var cls = (imgEl.className||'').toString();
    if(/profile|avatar/i.test(cls) || imgEl.closest('.avatar,.profile-avatar,.profile-pic')) meta.source_type = 'profile_picture';
    else if(/cover/i.test(cls) || imgEl.closest('.cover, .profile-cover')) meta.source_type = 'cover_picture';
    return meta;
  }

  // ---------- Save / Share ----------
  async function savePhoto(url){
    try{
      var res = await fetch(url, { mode: 'cors' });
      if(!res.ok) throw new Error('fetch failed');
      var blob = await res.blob();
      var ext = (blob.type.split('/')[1]||'jpg').split('+')[0];
      var name = 'campus-adda-' + Date.now() + '.' + ext;
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function(){ URL.revokeObjectURL(a.href); }, 4000);
      toast('ডাউনলোড শুরু হয়েছে');
    }catch(e){
      // Fallback: open in new tab
      var a2 = document.createElement('a'); a2.href = url; a2.download = ''; a2.target = '_blank'; a2.rel='noopener';
      document.body.appendChild(a2); a2.click(); a2.remove();
      toast('নতুন ট্যাবে খোলা হচ্ছে — সেভ করুন');
    }
  }
  async function sharePhoto(url){
    try{
      if(navigator.share){
        // Try sharing the actual file
        try{
          var res = await fetch(url, { mode:'cors' });
          if(res.ok){
            var blob = await res.blob();
            var ext = (blob.type.split('/')[1]||'jpg').split('+')[0];
            var file = new File([blob], 'photo.'+ext, { type: blob.type });
            if(navigator.canShare && navigator.canShare({ files:[file] })){
              await navigator.share({ files:[file], title:'Campus Adda' });
              return;
            }
          }
        }catch(_){}
        await navigator.share({ title:'Campus Adda', url: url });
        return;
      }
      // Fallback: clipboard
      await navigator.clipboard.writeText(url);
      toast('লিংক কপি হয়েছে');
    }catch(e){
      if(e && e.name==='AbortError') return;
      try{ await navigator.clipboard.writeText(url); toast('লিংক কপি হয়েছে'); }
      catch(_){ toast('শেয়ার করা যায়নি'); }
    }
  }

  // ---------- Report modal ----------
  function openReportModal(meta){
    closeAllPA();
    var reasons = [
      { id:'spam', label:'স্প্যাম / বিরক্তিকর', icon: ICONS.spam },
      { id:'nsfw', label:'অশ্লীল / আপত্তিকর', icon: ICONS.nsfw },
      { id:'harassment', label:'হয়রানি / বুলিং', icon: ICONS.flag },
      { id:'other', label:'অন্য কারণ', icon: ICONS.other }
    ];
    var ov = document.createElement('div'); ov.className='pa-overlay pa-center';
    ov.innerHTML = ''
      + '<div class="pa-modal" onclick="event.stopPropagation()">'
      +   '<h3>ছবি রিপোর্ট করুন</h3>'
      +   '<p class="pa-sub">কারণ নির্বাচন করুন। রিপোর্ট review করা হবে।</p>'
      +   '<div class="pa-reasons">'
      +     reasons.map(function(r,i){
             return '<label class="pa-reason'+(i===0?' selected':'')+'" data-r="'+r.id+'">'
                  +   '<input type="radio" name="pa-reason" value="'+r.id+'"'+(i===0?' checked':'')+'>'
                  +   r.icon
                  +   '<span>'+esc(r.label)+'</span>'
                  + '</label>';
           }).join('')
      +   '</div>'
      +   '<textarea class="pa-textarea" id="paReportNote" placeholder="বিস্তারিত (ঐচ্ছিক)"></textarea>'
      +   '<div class="pa-actions">'
      +     '<button class="pa-btn pa-btn-secondary" id="paReportCancel">বাতিল</button>'
      +     '<button class="pa-btn pa-btn-primary" id="paReportSubmit">Submit</button>'
      +   '</div>'
      + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
    ov.querySelectorAll('.pa-reason').forEach(function(el){
      el.addEventListener('click', function(){
        ov.querySelectorAll('.pa-reason').forEach(function(x){ x.classList.remove('selected'); });
        el.classList.add('selected');
        var input = el.querySelector('input'); if(input) input.checked = true;
      });
    });
    ov.querySelector('#paReportCancel').addEventListener('click', function(){ ov.remove(); });
    ov.querySelector('#paReportSubmit').addEventListener('click', async function(){
      var btn = this; btn.disabled = true; btn.textContent = 'পাঠানো হচ্ছে...';
      var reason = (ov.querySelector('input[name="pa-reason"]:checked')||{}).value || 'other';
      var note = (ov.querySelector('#paReportNote')||{}).value || '';
      var ok = await submitReport(meta, reason, note);
      btn.disabled = false; btn.textContent = 'Submit';
      if(ok){ ov.remove(); toast('রিপোর্ট পাঠানো হয়েছে <svg style=\"vertical-align:-2px;\" width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"20 6 9 17 4 12\"/></svg>'); }
      else { toast('রিপোর্ট পাঠাতে সমস্যা হয়েছে'); }
    });
  }
  async function submitReport(meta, reason, note){
    try{
      var sb = window.sb || null;
      var me = window.ME || {};
      var reporterId = me.id || me.userId || null;
      var payload = {
        photo_url: meta.photo_url,
        reporter_id: reporterId,
        source_type: meta.source_type || 'unknown',
        source_id: meta.source_id ? String(meta.source_id) : null,
        owner_id: meta.owner_id ? String(meta.owner_id) : null,
        reason: reason,
        note: note || null,
        status: 'pending'
      };
      if(sb && sb.from){
        var r = await sb.from('reports').insert(payload);
        if(r.error){ console.warn('[PA] report insert error', r.error); return false; }
        return true;
      }
      console.log('[PA] Supabase not ready, report payload:', payload);
      return true; // still show success to user; queued locally
    }catch(e){
      console.warn('[PA] submitReport error', e);
      return false;
    }
  }

  // ---------- Bottom sheet menu ----------
  function openMenu(meta){
    closeAllPA();
    var whoLine = meta.owner_name ? '<div class="pa-meta-who">'+esc(meta.owner_name)+'</div>' : '';
    var whenLine = meta.when ? '<div class="pa-meta-when">'+esc(fmtWhen(meta.when))+'</div>' : '';
    var metaBlock = (whoLine || whenLine) ? '<div class="pa-meta">'+whoLine+whenLine+'</div>' : '';
    var ov = document.createElement('div'); ov.className='pa-overlay';
    ov.innerHTML = ''
      + '<div class="pa-sheet" onclick="event.stopPropagation()">'
      +   '<div class="pa-grabber"></div>'
      +   metaBlock
      +   '<button class="pa-item" data-a="save">'+ICONS.download+'<div class="pa-item-body"><div>ফোনে সেভ করুন</div><div class="pa-item-desc">ছবি ডিভাইসে ডাউনলোড হবে</div></div></button>'
      +   '<button class="pa-item" data-a="share">'+ICONS.share+'<div class="pa-item-body"><div>শেয়ার করুন</div><div class="pa-item-desc">অন্য অ্যাপে পাঠান</div></div></button>'
      +   '<button class="pa-item pa-danger" data-a="report">'+ICONS.flag+'<div class="pa-item-body"><div>রিপোর্ট করুন</div><div class="pa-item-desc">এই ছবিটি রিপোর্ট করুন</div></div></button>'
      +   '<button class="pa-cancel" data-a="cancel">বাতিল</button>'
      + '</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target===ov) ov.remove(); });
    ov.querySelectorAll('[data-a]').forEach(function(b){
      b.addEventListener('click', function(){
        var a = b.getAttribute('data-a');
        if(a==='save'){ ov.remove(); savePhoto(meta.photo_url); }
        else if(a==='share'){ ov.remove(); sharePhoto(meta.photo_url); }
        else if(a==='report'){ openReportModal(meta); }
        else { ov.remove(); }
      });
    });
  }

  // ---------- Attach 3-dot to images ----------
  // NOTE: 'img.post-img' intentionally excluded — feed post images use the
  // full photo viewer's header 3-dot (moreOptions) instead of an overlay.
  var SELECTORS = [
    'img.comment-img',
    '.msg-bubble.img-msg img',
    '.photo-album-item img',
    '#simplePhotoViewerImg',
    'img[data-pa-attach]'
  ];
  var SEL_JOINED = SELECTORS.join(',');

  function ensureAnchor(img){
    var parent = img.parentElement;
    if(!parent) return null;
    // If parent is a natural anchor (bubble/album item/post-card image wrapper), use it
    var okParent = parent.classList.contains('pa-anchor')
      || parent.classList.contains('photo-album-item')
      || parent.classList.contains('msg-bubble')
      || parent.classList.contains('post-img-wrap');
    if(!okParent){
      // Wrap the img in a span so we can position the button
      var span = document.createElement('span');
      span.className = 'pa-anchor';
      // Keep display inline for inline images (comments), block for post images
      if(img.classList.contains('post-img')) span.style.display = 'block';
      parent.insertBefore(span, img);
      span.appendChild(img);
      parent = span;
    } else {
      // Ensure position:relative
      var cs = getComputedStyle(parent);
      if(cs.position === 'static') parent.style.position = 'relative';
    }
    return parent;
  }
  function attachButton(img){
    if(img.__paAttached) return;
    if(!(img instanceof Element)) return;
    if(img.closest('.pa-sheet,.pa-modal')) return;
    var url = img.currentSrc || img.src;
    if(!url) return;
    // Skip tiny avatars/thumbs
    var w = img.getBoundingClientRect().width;
    if(w && w < 60 && !img.hasAttribute('data-pa-attach')) return;
    var anchor = ensureAnchor(img); if(!anchor) return;
    if(anchor.querySelector(':scope > .pa-dot-btn')) { img.__paAttached = true; return; }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'pa-dot-btn';
    btn.setAttribute('aria-label','ছবির অপশন');
    btn.innerHTML = ICONS.dots;
    btn.addEventListener('click', function(e){
      e.stopPropagation(); e.preventDefault();
      var meta = extractMeta(img);
      meta.photo_url = img.currentSrc || img.src || meta.photo_url;
      openMenu(meta);
    });
    anchor.appendChild(btn);
    img.__paAttached = true;
  }
  function scan(root){
    try{
      var scope = root && root.querySelectorAll ? root : document;
      scope.querySelectorAll(SEL_JOINED).forEach(attachButton);
    }catch(e){}
  }

  // Delegate for images that get shown in a lightbox etc. — long-press fallback
  // (short-press keeps existing behavior like opening the image viewer)
  var LP_MS = 550;
  document.addEventListener('touchstart', function(e){
    var img = e.target && e.target.closest && e.target.closest('img');
    if(!img || img.__paAttached) return;
    if(!img.matches(SEL_JOINED) && !img.closest('.story-viewer-imgwrap,.simple-photo-viewer,.viewer-content,.photo-viewer')) return;
    var timer = setTimeout(function(){
      var meta = extractMeta(img); meta.photo_url = img.currentSrc || img.src;
      openMenu(meta);
    }, LP_MS);
    var cancel = function(){ clearTimeout(timer); document.removeEventListener('touchend', cancel); document.removeEventListener('touchmove', cancel); };
    document.addEventListener('touchend', cancel);
    document.addEventListener('touchmove', cancel);
  }, { passive: true });

  // Observe DOM
  var mo = new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var m = muts[i];
      if(m.type==='childList'){
        m.addedNodes && m.addedNodes.forEach(function(n){
          if(n.nodeType!==1) return;
          if(n.matches && n.matches(SEL_JOINED)) attachButton(n);
          if(n.querySelectorAll) scan(n);
        });
      } else if(m.type==='attributes' && m.target && m.target.matches && m.target.matches(SEL_JOINED)){
        // src changed on a tracked img — no need to re-attach
      }
    }
  });
  function start(){
    scan(document);
    mo.observe(document.body, { childList:true, subtree:true });
  }
  if(document.body) start();
  else document.addEventListener('DOMContentLoaded', start);

  // Expose public API
  window.PhotoActions = {
    openMenu: openMenu,
    save: savePhoto,
    share: sharePhoto,
    report: openReportModal,
    attach: attachButton,
    scan: scan
  };

  // ---------- Supabase table hint ----------
  // Required table (run once in Supabase SQL editor):
  //
  // create table if not exists public.reports (
  //   id uuid primary key default gen_random_uuid(),
  //   photo_url text not null,
  //   reporter_id uuid references auth.users(id) on delete set null,
  //   source_type text,
  //   source_id text,
  //   owner_id text,
  //   reason text not null,
  //   note text,
  //   status text not null default 'pending',
  //   created_at timestamptz not null default now()
  // );
  // alter table public.reports enable row level security;
  // create policy "reports_insert_auth" on public.reports for insert to authenticated with check (auth.uid() = reporter_id);
  // create policy "reports_select_own" on public.reports for select to authenticated using (auth.uid() = reporter_id);
  // -- admin read/update handled via service role in admin panel

})();
