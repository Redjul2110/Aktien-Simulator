// style.js — small interactive enhancements for the trading UI
// - keeps hover effects lively (add/remove class to .stock on mouseenter/leave)
// - highlights price changes briefly
// - adds keyboard focus behavior for qty inputs

(function(){
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
      document.addEventListener('click', e => {
        const header = e.target.closest('.stock-header');
        if(header){
          const stock = header.parentElement;
          const content = stock.querySelector('.stock-content');
          if(content){
            const isOpen = content.style.display === 'block';
            content.style.display = isOpen ? 'none' : 'block';
            const arrow = stock.querySelector('.arrow');
            if(arrow) arrow.textContent = isOpen ? '▼' : '▲';
          }
          e.preventDefault();
        }
      }, {passive:false});
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
