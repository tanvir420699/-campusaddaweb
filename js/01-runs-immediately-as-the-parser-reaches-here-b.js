
    // Runs immediately as the parser reaches here — before the big app script
    // even loads — so a returning visitor (someone who has opened the app
    // before on this device) never sees the animated splash flash again on
    // refresh. Only a first-ever visit shows the full splash while things load.
    (function(){
      try{
        if(localStorage.getItem('dc_app_launched') === '1'){
          var s = document.getElementById('splashScreen');
          if(s) s.style.display = 'none';
        }
      }catch(e){}
    })();
  