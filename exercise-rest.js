(() => {
  const container = document.getElementById('glute-exercises');
  if (!container) return;

  let interval = null;
  let activeButton = null;
  const storageKey = 'gaym-rest-timer-until';

  function cancel() {
    clearInterval(interval);
    localStorage.removeItem(storageKey);
    if (activeButton) {
      activeButton.classList.remove('running');
      activeButton.textContent = 'REST 90 SEC ⏱';
    }
    activeButton = null;
  }

  function start(button, savedDeadline = 0) {
    clearInterval(interval);
    if (activeButton && activeButton !== button) {
      activeButton.classList.remove('running');
      activeButton.textContent = 'REST 90 SEC ⏱';
    }
    activeButton = button;
    const deadline = savedDeadline > Date.now() ? savedDeadline : Date.now() + 90000;
    localStorage.setItem(storageKey, String(deadline));
    button.classList.add('running');
    const update = () => {
      const seconds = Math.ceil((deadline - Date.now()) / 1000);
      button.textContent = `CANCEL REST · ${Math.max(0, seconds)} SEK ✕`;
      if (seconds <= 0) {
        clearInterval(interval);
        localStorage.removeItem(storageKey);
        button.classList.remove('running');
        button.textContent = 'Rest complete ✦';
      }
    };
    update();
    interval = setInterval(update, 250);
  }

  function injectButtons() {
    container.querySelectorAll('.day-exercise-card').forEach(card => {
      if (card.querySelector('[data-rest-exercise]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'rest-exercise-button';
      button.dataset.restExercise = '';
      button.textContent = 'REST 90 SEC ⏱';
      button.addEventListener('click', () => {
        if (button.classList.contains('running')) cancel();
        else start(button);
      });
      card.querySelector('.set-table')?.before(button);
    });
  }

  injectButtons();
  const savedDeadline = Number(localStorage.getItem(storageKey));
  if (savedDeadline > Date.now()) {
    const firstButton = container.querySelector('[data-rest-exercise]');
    if (firstButton) start(firstButton, savedDeadline);
  }
  new MutationObserver(injectButtons).observe(container, {childList:true});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && activeButton) {
      const deadline = Number(localStorage.getItem(storageKey));
      if (deadline && deadline > Date.now()) {
        activeButton.classList.add('running');
        activeButton.textContent = `Rest ${Math.ceil((deadline - Date.now()) / 1000)} sec`;
      }
    }
  });
})();
