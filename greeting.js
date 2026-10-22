/* Multilingual greeting; animation never changes the saved greeting. */
(() => {
  const element = document.querySelector('[data-typewriter]');
  if (!element) return;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let primary = element.textContent || 'Hello!';
  let words, index = 0, length = 0, deleting = false, timer;
  const characters = text => typeof Intl.Segmenter === 'function'
    ? [...new Intl.Segmenter(undefined, {granularity:'grapheme'}).segment(text)].map(item => item.segment)
    : Array.from(text);
  const paused = () => preference.matches || document.hidden || document.activeElement === element;
  const clear = () => { clearTimeout(timer); timer = undefined; };
  function paint(text) { element.textContent = text; }
  function step() {
    if (paused()) { clear(); return; }
    const word = characters(words[index]);
    length += deleting ? -1 : 1;
    paint(word.slice(0, Math.max(0,length)).join(''));
    let delay = deleting ? 60 : 110;
    if (!deleting && length >= word.length) { deleting = true; delay = 1900; }
    else if (deleting && length <= 0) { deleting = false; index = (index + 1) % words.length; delay = 320; }
    timer = setTimeout(step, delay);
  }
  function refresh(node, value) {
    if (node !== element) return;
    clear(); primary = value || 'Hello!'; words = [primary, '¡Hola!', 'Բարև!', 'こんにちは!'];
    index = 0; length = characters(primary).length; deleting = true;
    if (document.activeElement !== element) paint(primary);
    element.classList.toggle('typing-enabled', !preference.matches);
    if (!paused()) timer = setTimeout(step, 1900);
  }
  element.addEventListener('focus', () => { clear(); paint(primary); element.classList.remove('typing-enabled'); });
  element.addEventListener('blur', () => refresh(element, primary));
  preference.addEventListener('change', () => refresh(element, primary));
  document.addEventListener('visibilitychange', () => { if(document.hidden) clear(); else refresh(element, primary); });
  window.PortfolioGreeting = { refresh };
  refresh(element, primary);
})();
