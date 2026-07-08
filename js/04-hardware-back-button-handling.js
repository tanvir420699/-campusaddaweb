
/* ===== HARDWARE BACK BUTTON HANDLING =====
   Centralised back-stack so Android/system back closes modals/overlays and
   steps through tab history instead of closing the whole app. Only when the
   stack is empty AND we're on the root tab should the browser default (exit)
   happen. This is additive: it wraps switchTab() and observes overlay
   elements toggling the `.hidden` class. No existing logic is removed. */
(function(){
  if (window.__BackStackInstalled) return;
  window.__BackStackInstalled = true;

  var OVERLAY_SELECTOR = '.modal-backdrop, .overlay-backdrop, .search-overlay, .story-viewer, .confirm-dialog, .notif-page, .study-subpage, .user-profile-modal, .comment-modal-backdrop, .chat-view, .group-chat-view, .gmv-backdrop, .simple-photo-viewer, .pa-sheet-backdrop';

  var stack = [];          // [{ kind, el?, close(fromPop) }]
  var pendingBackPops = 0; // history.back() calls we've triggered ourselves
  var suppressObserver = 0;// depth counter while we programmatically toggle

  function pushEntry(entry){
    stack.push(entry);
    try { history.pushState({ __backStack: true, ts: Date.now() }, ''); } catch(e){}
  }

  function popTopFromHistory(){
    var top = stack.pop();
    if (!top) return;
    suppressObserver++;
    try { top.close(true); } catch(e){ try{console.warn(e);}catch(_){} }
    suppressObserver--;
  }

  // Manual close (X / tap-outside / esc): remove the matching entry and its
  // history state so a subsequent hardware back doesn't get stuck.
  function consumeEntryForElement(el){
    for (var i = stack.length - 1; i >= 0; i--){
      if (stack[i].el === el){
        if (i === stack.length - 1){
          stack.pop();
          pendingBackPops++;
          try { history.back(); } catch(e){ pendingBackPops--; }
        } else {
          // Not the top — remove from stack but leave history entry; a later
          // back will find no matching entry and be a no-op.
          stack.splice(i, 1);
        }
        return true;
      }
    }
    return false;
  }

  window.addEventListener('popstate', function(){
    if (pendingBackPops > 0){ pendingBackPops--; return; }
    if (stack.length){
      popTopFromHistory();
      // Re-add a state so we don't fall off the app history immediately
      // (needed because popstate consumed one entry).
    }
    // If stack empty, allow browser to exit (default).
  }, true);

  // ----- Tab history -----
  // Messenger-style: tab switches do NOT push history entries. Hardware back
  // only closes open overlays/chats/modals; when nothing is open, back exits
  // the app (browser default) instead of walking through prior tabs.


  // ----- Overlay / modal history via MutationObserver -----
  function matchesOverlay(el){
    return el && el.nodeType === 1 && typeof el.matches === 'function' && el.matches(OVERLAY_SELECTOR);
  }

  var mo = new MutationObserver(function(mutations){
    if (suppressObserver > 0) return;
    for (var i = 0; i < mutations.length; i++){
      var m = mutations[i];
      if (m.type !== 'attributes' || m.attributeName !== 'class') continue;
      var el = m.target;
      if (!matchesOverlay(el)) continue;
      var isHidden = el.classList.contains('hidden');
      var was = el.__wasHidden;
      el.__wasHidden = isHidden;
      if (was === undefined) continue; // first observation, seed only
      if (was && !isHidden){
        // Opened
        (function(target){
          pushEntry({
            kind: 'overlay',
            el: target,
            close: function(){
              suppressObserver++;
              try {
                // .chat-view / .group-chat-view have a sibling list view (msgList /
                // groupsListView) that must be shown again, plus in-memory state
                // (selectedChat / selectedGroupChat) that must be cleared — just
                // hiding the chat element left BOTH panels hidden (black screen)
                // and left selectedChat pointing at the old chat, so re-opening
                // the Messages tab jumped straight back into that same chat.
                if (target.id === 'chatView' && typeof backToMsgList === 'function') {
                  backToMsgList();
                } else if (target.id === 'groupChatView' && typeof backToGroupsList === 'function') {
                  backToGroupsList();
                } else if (target.id === 'addGroupMemberModal') {
                  target.classList.add('hidden');
                  if (typeof window.reopenInfoAfterAddMember === 'function') window.reopenInfoAfterAddMember(target);
                } else {
                  target.classList.add('hidden');
                }
                target.__wasHidden = true;
              }
              finally { suppressObserver--; }
            }
          });
        })(el);
      } else if (!was && isHidden){
        // Closed manually — consume matching stack entry + history
        consumeEntryForElement(el);
      }
    }
  });

  function seedAndObserve(){
    var nodes = document.querySelectorAll(OVERLAY_SELECTOR);
    for (var i = 0; i < nodes.length; i++){
      nodes[i].__wasHidden = nodes[i].classList.contains('hidden');
    }
    mo.observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.body) seedAndObserve();
  else document.addEventListener('DOMContentLoaded', seedAndObserve);
})();
