(() => {
  const render = () => {
  const profile = {
    weight: 70,
    height: 183,
    age: 27,
    activity: 1.55,
    goal: 'muscle',
    ...JSON.parse(localStorage.getItem('gaym-profile') || '{}')
  };
  const goal = localStorage.getItem('gaym-food-goal') || profile.goal;
  const weight = Math.max(45, Math.min(160, Number(profile.weight) || 70));
  const height = Math.max(145, Math.min(215, Number(profile.height) || 183));
  const age = Math.max(16, Math.min(90, Number(profile.age) || 27));
  const activity = Number(profile.activity) || 1.55;
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  const maintenance = bmr * activity;
  const calories = goal === 'loss'
    ? maintenance - 500
    : goal === 'muscle'
      ? maintenance + Math.max(200, maintenance * 0.08)
      : maintenance;
  const protein = Math.round(weight * (goal === 'loss' ? 1.8 : goal === 'muscle' ? 2 : 1.6));
  const today = new Date().toLocaleDateString('sv-SE');
  const sameDay = date => new Date(date).toLocaleDateString('sv-SE') === today;
  const food = JSON.parse(localStorage.getItem('gaym-food-history') || '[]');
  const todayFood = food.filter(entry => sameDay(entry.date));
  const consumedCalories = todayFood.reduce((sum, entry) => sum + (Number(entry.calories) || 0), 0);
  const consumedProtein = todayFood.reduce((sum, entry) => sum + (Number(entry.protein) || 0), 0);
  const calorieTarget = Math.max(1, Math.round(calories / 10) * 10);
  const percentage = Math.min(100, Math.round((consumedCalories / calorieTarget) * 100));
  const label = goal === 'loss' ? 'Weight loss' : goal === 'muscle' ? 'Muscle gain' : 'Maintain weight';

  const caloriesEl = document.getElementById('fuel-calories');
  const detailEl = document.getElementById('fuel-detail');
  const percentEl = document.getElementById('fuel-percent');
  const barEl = document.getElementById('fuel-progress');
  const profileEl = document.getElementById('fuel-profile');
    if (!caloriesEl || !detailEl || !percentEl || !barEl || !profileEl) return;

    const format = value => Math.round(value).toLocaleString('sv-SE');
    caloriesEl.textContent = `${format(consumedCalories)} / ${format(calorieTarget)} kcal`;
    detailEl.textContent = `${format(consumedProtein)} / ${protein} g protein · ${label} · ${weight} kg`;
    percentEl.textContent = `${percentage}%`;
    profileEl.textContent = `${label.toUpperCase()} · ${weight} KG`;
    barEl.style.width = `${percentage}%`;
    barEl.setAttribute('aria-valuenow', String(percentage));
  };

  render();
  window.addEventListener('storage', event => {
    if (['gaym-profile', 'gaym-food-goal', 'gaym-food-history'].includes(event.key)) render();
  });
  window.addEventListener('pageshow', render);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
})();
