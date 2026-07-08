
(function(){
  if(!window.I18N) return;
  const getLang = () => (window.currentLang || (typeof settings!=='undefined' && settings.language) || 'bn');

  // ---------- Phrase dictionary ---------- (bn ↔ en, applied per text-node)
  const PHRASES = [
    // Suffixes commonly concatenated with numbers
    ["জন সদস্য", "members"],
    ["জন এক্টিভ", "active"],
    ["জন অনলাইন", "online"],
    ["জন ব্লক করা", "blocked"],
    ["জন শিক্ষার্থী পাওয়া গেছে", "students found"],

    // Empty states — Messages
    ["এখনো কোনো মেসেজ নেই", "No messages yet"],
    ["কোনো message request নেই", "No message requests"],
    ["মেসেজিং বন্ধ আছে", "Messaging is off"],
    ["ছবি পাঠানোর জন্য প্রস্তুত", "Ready to send image"],

    // Empty states — Friends / Groups
    ["তোমাদের mutual friend আছে", "You have mutual friends"],
    ["গ্রুপ বানাতে আগে কিছু বন্ধু যোগ করো", "Add some friends first to create a group"],
    ["যোগ করার জন্য নতুন কেউ নেই", "No new people to add"],
    ["এই গ্রুপে এখনো কোনো পোস্ট নেই", "No posts in this group yet"],
    ["কোনো বন্ধু নেই forward করার জন্য", "No friends to forward to"],
    ["কোনো group নেই", "No groups"],
    ["কোনো Group এ join করা নেই", "You haven't joined any group"],
    ["কোনো ছবি নেই", "No photos"],
    ["কোনো reaction নেই", "No reactions"],
    ["এই ক্যাটাগরিতে কিছু নেই", "Nothing in this category"],
    ["কমপক্ষে ২ জন বন্ধু বেছে নাও", "Pick at least 2 friends"],
    ["কমপক্ষে 2 জন বন্ধু বেছে নাও", "Pick at least 2 friends"],
    ["তোমার জন্য সাজেশন", "Suggestions for you"],

    // Study Hub — empty states / labels
    ["এখনো কোনো নোট নেই।", "No notes yet."],
    ["এই সাবজেক্টে কোনো প্রশ্ন নেই।", "No questions in this subject yet."],
    ["-এ কোনো ক্লাস যোগ করা নেই।", "— no classes added."],
    ["কোনো পরীক্ষার তথ্য যোগ করা নেই।", "No exam info added."],
    ["কোনো রিকোয়েস্ট নেই।", "No requests."],
    ["উল্লেখ নেই", "Not specified"],

    // Blocks / auth
    ["কাউকে ব্লক করা নেই", "No one is blocked"],
    ["লগইন প্রয়োজন", "Login required"],
    ["তোমার এই অনুমতি নেই", "You don't have permission"],
    ["এখানে কোনো notification নেই", "No notifications here"],
    ["কোনো পোস্ট সেভ করা নেই", "No saved posts"],
    ["এক্টিভ আছে", "Active now"],
    ["প্রোফাইল ছবি নেই", "No profile picture"],

    // Chat header/status bits
    ["জন সদস্য", "members"],
    ["জন", "people"],  // last-resort suffix; only fires inside chrome text nodes
  ];

  // Parameterized: "ও আরো N জন" ↔ "and N more"
  const RE_MORE_BN = /ও আরো (\d+|[০-৯]+) জন/g;
  const RE_MORE_EN = /and (\d+) more/g;

  function translateString(s, lang){
    if(!s) return s;
    let out = s;
    if(lang === 'en'){
      for(const [bn,en] of PHRASES){ if(bn!==en) out = out.split(bn).join(en); }
      out = out.replace(RE_MORE_BN, (_,n)=>`and ${n} more`);
    } else {
      for(const [bn,en] of PHRASES){ if(bn!==en && out.indexOf(bn)===-1) out = out.split(en).join(bn); }
      out = out.replace(RE_MORE_EN, (_,n)=>`ও আরো ${n} জন`);
    }
    return out;
  }

  const SKIP_TAGS = new Set(['SCRIPT','STYLE','TEXTAREA','INPUT','SVG','PATH','CIRCLE','LINE','POLYLINE','POLYGON']);
  function walkAndTranslate(root, lang){
    if(!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n){
        const p = n.parentNode;
        if(!p) return NodeFilter.FILTER_REJECT;
        if(SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        // Never rewrite user-generated content
        if(p.closest && p.closest('.post-text,.comment-text,.comment-modal-post-text,.msg-text,.msg-bubble,.chat-msg-text,textarea,input,.study-note-body,.notice-body,.event-body'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let cur; while(cur = walker.nextNode()) nodes.push(cur);
    for(const node of nodes){
      const before = node.nodeValue;
      const after  = translateString(before, lang);
      if(after !== before) node.nodeValue = after;
    }
    root.querySelectorAll && root.querySelectorAll('input[placeholder],[title]').forEach(el=>{
      const ph = el.getAttribute('placeholder');
      if(ph){ const n = translateString(ph, lang); if(n!==ph) el.setAttribute('placeholder', n); }
      const tt = el.getAttribute('title');
      if(tt){ const n = translateString(tt, lang); if(n!==tt) el.setAttribute('title', n); }
    });
  }

  const CONTAINERS = [
    'tab-friends',
    'tab-messages','msgList','chatView','groupChatView',
    'tab-groups','groupPage',
    'tab-study',
    // Common study subpages
    'studyNotesPage','studyRoutinePage','studyExamPage','studyBloodPage',
    'studyBloodReqPage','studyQuizPage','studyVideoPage','studyNoticePage',
    'studyLostFoundPage','studyEventsPage',
  ];

  function applyAll(){
    const lang = getLang();
    CONTAINERS.forEach(id=>{
      const el = document.getElementById(id);
      if(el) walkAndTranslate(el, lang);
    });
    // Also translate any open .study-subpage that isn't in our known list
    document.querySelectorAll('.study-subpage').forEach(el=>walkAndTranslate(el, lang));
  }

  let scheduled = false;
  function schedule(){
    if(scheduled) return;
    scheduled = true;
    requestAnimationFrame(()=>{ scheduled = false; try { applyAll(); } catch(_){} });
  }

  function boot(){
    applyAll();
    CONTAINERS.forEach(id=>{
      const el = document.getElementById(id);
      if(!el) return;
      new MutationObserver(schedule).observe(el, {
        childList:true, subtree:true, characterData:true,
        attributes:true, attributeFilter:['placeholder','title','class']
      });
    });
    document.querySelectorAll('.study-subpage').forEach(el=>{
      new MutationObserver(schedule).observe(el, {
        childList:true, subtree:true, characterData:true,
        attributes:true, attributeFilter:['placeholder','title','class']
      });
    });
    window.addEventListener('i18n:changed', schedule);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
