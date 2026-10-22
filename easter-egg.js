/* A small keyboard surprise. No requests are sent by the site. */
(() => {
  const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let entered = [], lastKeyAt = 0, panel;
  document.addEventListener('keydown', event => {
    if (event.repeat || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;
    if (event.target.closest?.('input,textarea,select,[contenteditable="true"],[role="textbox"]')) { entered = []; return; }
    const now = Date.now();
    if (now - lastKeyAt > 10000) entered = [];
    lastKeyAt = now;
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    entered.push(key);
    while (entered.length && !entered.every((value,index) => value === sequence[index])) entered.shift();
    if (entered.length !== sequence.length) return;
    entered = [];
    if (document.querySelector('dialog[open]')) return;
    if (!panel) {
      panel = document.createElement('dialog');
      panel.className = 'easter-egg';
      panel.setAttribute('aria-labelledby','easter-egg-title');
      panel.innerHTML = '<div class="egg-symbol" aria-hidden="true">🥚</div><h2 id="easter-egg-title">EASTER EGG!!</h2><p>Congrats, you found me! You know your cheat codes :)</p><p>Let me know you found the secret!</p><a class="egg-email">Let me know ✉</a><p class="egg-email-note">Opens your email app with a message you can edit before sending.</p><button type="button" class="egg-close">Back to exploring</button>';
      const email = document.querySelector('footer a[href^="mailto:"]')?.getAttribute('href')?.slice(7).split('?')[0] || 'ab2864@cornell.edu';
      panel.querySelector('.egg-email').href = 'mailto:' + email + '?subject=' + encodeURIComponent('I found your portfolio Easter egg!') + '&body=' + encodeURIComponent('Hi Antranig,\n\nI found the Konami-code Easter egg on your portfolio! :)\n\n');
      panel.querySelector('button').addEventListener('click', () => panel.close());
      panel.addEventListener('click', event => { if (event.target === panel) { const bounds = panel.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) panel.close(); } });
      document.body.append(panel);
    }
    const opener = document.activeElement;
    panel.addEventListener('close', () => opener?.focus(), {once:true});
    panel.showModal();
  });
})();
