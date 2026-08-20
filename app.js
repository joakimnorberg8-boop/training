const startButton = document.querySelector('#start-button');
const shuffleButton = document.querySelector('#shuffle-button');
const toast = document.querySelector('#toast');
let toastTimer;

function showToast(message) {
  if (!toast) { window.GAYMToast?.(message); return; }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}

if (startButton) {
  startButton.addEventListener('click', () => {
    window.location.href = 'workout.html';
  });
}
if (shuffleButton) {
  shuffleButton.addEventListener('click', () => showToast('Your vibe: twink, bear or jock? Pick your fighter. ✦'));
}

document.querySelectorAll('.nav-link').forEach((link) => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});