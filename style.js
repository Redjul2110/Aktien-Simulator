// style.js — small interactive enhancements for the trading UI
// - keeps hover effects lively (add/remove class to .stock on mouseenter/leave)
// - highlights price changes briefly
// - adds keyboard focus behavior for qty inputs

(function(){
  const TOUCH_DEBUG = false; // set true temporarily to see touch log overlay
  let _lastTouchToggle = 0;

  function ensureTouchLog(){
    if(!TOUCH_DEBUG) return null;
    let d = document.getElementById('touch-log-overlay');
    if(!d){ d = document.createElement('div'); d.id = 'touch-log-overlay'; d.style.position='fixed'; d.style.left='8px'; d.style.top='8px'; d.style.zIndex='2000'; d.style.background='rgba(0,0,0,0.6)'; d.style.color='#fff'; d.style.padding='8px'; d.style.fontSize='12px'; d.style.borderRadius='6px'; document.body.appendChild(d); }
    return d;
  }
  function touchLog(msg){
    const d = ensureTouchLog(); if(!d) return; d.textContent = msg;
    setTimeout(()=>{ if(d) d.textContent=''; }, 1600);
  }
  function initHover(){
    // only attach mouse hover effects on devices with a fine pointer
    if(window.matchMedia && window.matchMedia('(pointer: fine)').matches){
      document.querySelectorAll('.stock').forEach(s => {
        s.addEventListener('mouseenter', () => s.classList.add('hovered'));
        s.addEventListener('mouseleave', () => s.classList.remove('hovered'));
      });
    }
  }

  function pulsePrice(el, up=true){
    if(!el) return;
    const cls = up ? 'pulse-up' : 'pulse-down';
    el.classList.add(cls);
    setTimeout(()=> el.classList.remove(cls), 450);
  }

  function watchPriceChanges(){
    // periodically compare visible price-large elements to detect change
    const prev = {};
    setInterval(()=>{
      document.querySelectorAll('[id^=price-large-]').forEach(el => {
        const id = el.id;
        const val = el.textContent;
        if(prev[id] && prev[id] !== val){
          // detect direction
          const a = parseFloat(prev[id].replace(/[^0-9.-]+/g,''));
          const b = parseFloat(val.replace(/[^0-9.-]+/g,''));
          pulsePrice(el, b >= a);
        }
        prev[id] = val;
      });
    }, 300);
  }

  function enhanceQtyInputs(){
    document.addEventListener('focusin', e => {
      if(e.target && e.target.matches('.qty-input')){
        e.target.style.outline = '2px solid rgba(14,240,138,0.12)';
      }
    });
    document.addEventListener('focusout', e => {
      if(e.target && e.target.matches('.qty-input')){
        e.target.style.outline = 'none';
      }
    });
  }

  function initTouchToggles(){
    // For touch devices, allow tapping a stock to toggle its content
    if(window.matchMedia && window.matchMedia('(pointer: coarse)').matches){
      // track last handled touch to ignore the synthetic click that often follows
      let lastHandledTouch = 0;

      // touch handlers: record and toggle on touchend
      document.addEventListener('touchstart', e => {
        const t = e.changedTouches && e.changedTouches[0];
        if(!t) return;
        t._startTarget = t.target || document.elementFromPoint(t.clientX, t.clientY);
      }, {passive:true});

      document.addEventListener('touchend', e => {
        const t = e.changedTouches && e.changedTouches[0];
        if(!t) return;
        const target = t._startTarget || (t.target || document.elementFromPoint(t.clientX, t.clientY));
        if(!target || !(target instanceof Element)) return;
        // ignore interactions with controls
        if (target.closest('button, input, a, select, textarea')) return;
        const stockEl = target.closest('.stock');
        if(!stockEl) return;
        if (target.closest('.stock-content')) return;
        const content = stockEl.querySelector('.stock-content');
        if (content){
          // debounce: ignore if we toggled in the last 300ms
          const now = Date.now();
          if(now - lastHandledTouch < 300) return;
          lastHandledTouch = now;
          lastHandledTouch = now;
          const isOpen = content.style.display === 'block';
          content.style.display = isOpen ? 'none' : 'block';
          const arrow = stockEl.querySelector('.arrow'); if(arrow) arrow.textContent = isOpen ? '▼' : '▲';
          // remember to ignore the following synthetic click
          _lastTouchToggle = Date.now();
          // expose for other scripts to avoid synthetic click double-handling
          try{ window._lastTouchToggle = _lastTouchToggle; }catch(e){}
        }
      }, {passive:true});

      // click fallback (handles mouse and any non-touch taps)
      document.addEventListener('click', e => {
        // normalize target: some browsers deliver text nodes as event.target
        const target = (e.target && e.target.nodeType === 3) ? e.target.parentElement : e.target;
        if (!target || !(target instanceof Element)) return;
        // ignore synthetic click fired right after a handled touch
        if (Date.now() - _lastTouchToggle < 350) return;
        // ignore clicks on interactive controls so buttons/inputs still work
        if (target.closest('button, input, a, select, textarea')) return;
        // Find the closest stock container
        const stockEl = target.closest('.stock');
        if (!stockEl) return;
        // If the tap was inside the expanded content area, ignore (user interacting with controls)
        if (target.closest('.stock-content')) return;
        const content = stockEl.querySelector('.stock-content');
        if(content){
          const isOpen = content.style.display === 'block';
          content.style.display = isOpen ? 'none' : 'block';
          const arrow = stockEl.querySelector('.arrow');
          if(arrow) arrow.textContent = isOpen ? '▼' : '▲';
        }
      }, {passive:true});
    }
  }

  // small CSS for pulses injected from JS so we keep file count small
  function injectPulseStyles(){
    const css = `
      .pulse-up{animation:pulseUp .45s ease}
      .pulse-down{animation:pulseDown .45s ease}
      @keyframes pulseUp{0%{transform:translateY(0)}30%{transform:translateY(-4px);filter:brightness(1.2)}100%{transform:translateY(0)}}
      @keyframes pulseDown{0%{transform:translateY(0)}30%{transform:translateY(4px);filter:brightness(.85)}100%{transform:translateY(0)}}
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    initHover();
    watchPriceChanges();
    enhanceQtyInputs();
    initTouchToggles();
    injectPulseStyles();
  });
})();
