CAMPUS ADDA — SPLIT PROJECT STRUCTURE
======================================

Ei zip ta tomar original "campus-adda-FINAL.html" (26,800+ line, ekta file)
ke CSS o JS file gulo alada kore, kintu EXACT SAME order e link kore rakha
hoyeche — mane app er behavior/design/logic kono change hoy nai, sudhu
file gulo gucha-no hoyeche.

VERIFY kora hoyeche: index.html + css/*.css + js/*.js shob ekshathe jorle
tomar original file er sathe byte-to-byte IDENTICAL hoy — mane EKTA
character o missing/change hoy nai.

FOLDER STRUCTURE
----------------
index.html          -> Main HTML file, shob CSS/JS ekhon <link>/<script src>
                        diye load hoy, thik age jei order e ready chilo shei
                        order e-e.

css/
  01-global-theme-and-layout.css                 -> Root color variables, layout, header,
                                                      stories, post cards, comments, ...
                                                      (mul theme, shobcheye boro CSS)
  02-phase-4-story-highlights.css                -> Story Highlights feature styles
  03-phase-6-close-friends-*.css                 -> Close Friends / Archive / Reactions+ / Mentions
  04-phase-7-music-stickers-polls-*.css          -> Story Music/Stickers/Polls/Link/Anon/Schedule/Filters
  05-auth-smooth-loading-transitions-*.css       -> Login/Register/Forgot animation
  06-auth-inline-validation-*.css                -> Auth form field validation styling
  07-auth-skeleton-remember-me-*.css             -> Auth skeleton loader / remember-me / redirect overlay

js/
  01-runs-immediately-*.js                       -> Splash-screen pre-check (runs first)
  02-app-core-main-logic.js                      -> ** MAIN APP ** — shob core feature (feed,
                                                      posts, comments, chat, friends, profile,
                                                      notifications, groups, study hub, etc.)
                                                      Eta shobcheye boro file (~1.2MB) — original
                                                      developer-ra eta ekta continuous script
                                                      hishebei likhechilo, tai eta arO bhaga
                                                      kora risky (functions ekta-arekta ke
                                                      refer kore, order matter kore).
  03-voice-video-calling-webrtc-*.js             -> Voice/Video call (WebRTC)
  04-hardware-back-button-handling.js            -> Android back-button handling
  05-universal-photo-actions-*.js                -> Photo 3-dot menu actions (Phase 1)
  06-*.js  (highlights)                          -> Story Highlights logic (Phase 4)
  07-close-friends.js                            -> Close Friends/Archive/Reactions logic (Phase 6)
  08-const-filters.js                            -> Story Music/Stickers/Polls/Filters logic (Phase 7)
  09-phase-8-mention-wiring-*.js                 -> @mention wiring + story music autoplay fix
  10-auth-transitions-logic.js                   -> Auth screen swap/animation logic
  11-auth-inline-validation-logic.js             -> Auth form live-validation logic
  12-auth-skeleton-logic.js                      -> Auth skeleton loader logic
  13 - 21  (i18n-*.js)                           -> Bangla <-> English translation system
                                                      (dictionary + phrase overrides), 9 files
                                                      because the original was built in stages.

WHAT'S NOT INCLUDED (already external, unchanged)
--------------------------------------------------
index.html still references these EXACTLY as before — they were never part
of the single HTML file, so there's nothing to extract:
  - https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/... (Supabase SDK, CDN)
  - /stories-module.js?v=3
  - /manifest.json, /icons/icon-192.png, /sw.js
These must still be hosted on your server exactly like before.

HOW TO USE
----------
Just upload/host the whole folder (index.html + css/ + js/) together, keeping
the folder structure exactly as-is (don't move files out of css/ or js/).
Open index.html — it will behave 100% identically to the original single file.

NOTE ON FURTHER REACT CONVERSION
---------------------------------
This split is a first organizational step, NOT a React conversion. The huge
02-app-core-main-logic.js is still one big script (same as before, just in
its own file). Turning this into real React components is a separate, much
bigger job — happy to help with that next if you want.
