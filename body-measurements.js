(() => {
  const $ = id => document.getElementById(id);
  const STORAGE = 'gaym-body-measurements';

  function readRows() {
    try { return JSON.parse(localStorage.getItem(STORAGE) || '[]'); }
    catch { return []; }
  }
  function saveRows(rows) { localStorage.setItem(STORAGE, JSON.stringify(rows)); }


  function init() {
    const tab = $('measure-tab');
    const drawer = $('measure-drawer');
    const form = $('measure-form');
    if (!drawer || !form) return;

    const feedback = $('measure-feedback');
    const recent = $('measure-recent-list');

    function openDrawer(e) {
      e?.preventDefault();
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden','false');
      tab?.setAttribute('aria-expanded','true');
      document.body.classList.add('measure-open');
      renderRecent();
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
      tab?.setAttribute('aria-expanded','false');
      document.body.classList.remove('measure-open');
    }

    document.querySelectorAll('[data-open-measures]').forEach(x => x.onclick = openDrawer);

    // Overwrite old handlers safely if scripts were cached/reloaded.
    if (tab) tab.onclick = openDrawer;
    drawer.querySelectorAll('[data-close-measures]').forEach(x => x.onclick = closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer(); });

    function n(name) {
      const raw = String(form.elements[name]?.value ?? '').trim().replace(',','.');
      if (!raw) return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value : null;
    }

    function renderRecent() {
      if (!recent) return;
      const rows=[...readRows()].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
      recent.innerHTML = rows.length ? rows.map(r => `
        <article class="measure-recent-item">
          <span>${new Date(r.date).toLocaleDateString('sv-SE',{day:'numeric',month:'short',year:'numeric'})}</span>
          <strong>${r.weight != null ? Number(r.weight).toFixed(1)+' kg' : 'Measurements logged'}</strong>
          <small>${r.waist != null ? 'Waist '+Number(r.waist).toFixed(1)+' cm' : 'View in Diary'}</small>
        </article>`).join('') : '<p class="measure-empty">No body measurements logged yet.</p>';
    }

    form.onsubmit = e => {
      e.preventDefault();
      const row = {
        id:'measure-'+Date.now(),
        date:new Date().toISOString(),
        weight:n('weight'), waist:n('waist'), chest:n('chest'), hips:n('hips'),
        bicepsLeft:n('bicepsLeft'), bicepsRight:n('bicepsRight'),
        thighLeft:n('thighLeft'), thighRight:n('thighRight'),
        calfLeft:n('calfLeft'), calfRight:n('calfRight'), neck:n('neck'),
        note:String(form.elements.note?.value || '').trim()
      };
      const hasAny=['weight','waist','chest','hips','bicepsLeft','bicepsRight','thighLeft','thighRight','calfLeft','calfRight','neck'].some(k=>row[k]!==null);
      if (!hasAny) {
        if (feedback) feedback.textContent='Enter at least one measurement first.';
        return;
      }
      const rows=readRows(); rows.push(row); saveRows(rows);
      window.GAYMData?.changed('gaym-body-measurements');
      if (feedback) feedback.textContent='✓ Sparat i Dagboken.';
      form.reset(); renderRecent();
      window.GAYMToast?.('Body measurements saved.');
      setTimeout(()=>{ if(feedback) feedback.textContent=''; },1800);
    };
    renderRecent();
    if (new URLSearchParams(location.search).get('measure') === '1') {
      openDrawer();
      try { history.replaceState({}, '', location.pathname + location.hash); } catch {}
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();