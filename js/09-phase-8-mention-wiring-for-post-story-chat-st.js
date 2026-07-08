
(function(){
  'use strict';

  // Inputs that should support @mention
  // key must be unique per input; dropdown id = 'mdd-'+key
  var MENTION_TARGETS = [
    { id:'newPostText',   key:'newpost'   },
    { id:'groupPostInput',key:'grouppost' },
    { id:'newStoryText',  key:'newstory'  },
    { id:'msgInput',      key:'chatmsg'   },
    { id:'groupMsgInput', key:'grpmsg'    }
  ];

  function wireOne(t){
    var input = document.getElementById(t.id);
    if(!input || input.dataset.mentionWired==='1') return false;
    var ddId = 'mdd-'+t.key;
    // Wrap input so dropdown is a sibling & wrap is positioning context
    var parent = input.parentElement;
    if(!parent) return false;
    var wrap = document.createElement('div');
    wrap.className = 'mention-input-wrap';
    wrap.style.cssText = 'position:relative;flex:1;min-width:0;display:block;';
    parent.insertBefore(wrap, input);
    wrap.appendChild(input);
    var dd = document.createElement('div');
    dd.className = 'mention-dropdown hidden';
    dd.id = ddId;
    wrap.appendChild(dd);

    var safeKey = String(t.key).replace(/'/g,"\\'");
    function trigger(){
      try { if(typeof handleMentionInput==='function') handleMentionInput(input, safeKey); } catch(e){}
    }
    input.addEventListener('input', trigger);
    input.addEventListener('keyup', function(e){
      // Also trigger on arrow/space so dropdown updates/closes as cursor moves
      if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].indexOf(e.key)>=0) trigger();
    });
    input.addEventListener('blur', function(){
      // slight delay so click on suggestion registers
      setTimeout(function(){ try{ if(typeof closeMentionDropdown==='function') closeMentionDropdown(ddId); }catch(e){} }, 180);
    });
    input.dataset.mentionWired='1';
    return true;
  }

  function wireAll(){
    MENTION_TARGETS.forEach(wireOne);
  }

  // Initial wire on DOM ready
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded', wireAll);
  } else { wireAll(); }

  // Re-check periodically because some inputs (group post/chat) may be
  // (re)rendered later when their view is opened.
  setInterval(wireAll, 1500);

  // ---------- Story Music autoplay fix ----------
  // Browsers block auto-play of <audio autoplay> without a user gesture, and
  // the previous implementation never called play() explicitly and never
  // stopped audio when the viewer closed / changed stories.
  function _stopStoryAudio(){
    var au = document.getElementById('p7ViewerAudio');
    if(au){ try{ au.pause(); }catch(e){} try{ au.remove(); }catch(e){} }
  }
  // Observe DOM for new p7ViewerAudio nodes and force play()
  var mo = new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var m=muts[i];
      for(var j=0;j<m.addedNodes.length;j++){
        var n=m.addedNodes[j];
        if(!n || n.nodeType!==1) continue;
        var au = (n.id==='p7ViewerAudio') ? n : (n.querySelector && n.querySelector('#p7ViewerAudio'));
        if(au){
          try{ au.muted=false; au.volume=1.0; }catch(e){}
          var p = au.play();
          if(p && typeof p.catch==='function'){
            p.catch(function(){
              // Autoplay blocked <svg style="vertical-align:-2px;" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg> resume on first user tap inside viewer
              var sv = document.getElementById('storyViewer');
              if(!sv) return;
              var resume = function(){
                try{ au.play(); }catch(e){}
                sv.removeEventListener('click', resume, true);
                sv.removeEventListener('touchstart', resume, true);
              };
              sv.addEventListener('click', resume, true);
              sv.addEventListener('touchstart', resume, true);
            });
          }
        }
      }
    }
  });
  mo.observe(document.body, {childList:true, subtree:true});

  // Wrap closeStoryViewer to stop audio
  var _origClose = window.closeStoryViewer;
  window.closeStoryViewer = function(){
    _stopStoryAudio();
    if(typeof _origClose==='function') return _origClose.apply(this, arguments);
  };
})();
