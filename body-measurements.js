(() => {
  if (window.__GAYM_MEASUREMENTS_INIT__) return;
  window.__GAYM_MEASUREMENTS_INIT__ = true;

  const STORAGE='gaym-body-measurements';
  const $=id=>document.getElementById(id);
  const fields=[
    ['weight','Body weight','kg',30,300],['waist','Waist','cm',40,250],['chest','Chest','cm',40,250],['hips','Hips','cm',40,250],
    ['bicepsLeft','Left biceps','cm',10,100],['bicepsRight','Right biceps','cm',10,100],['thighLeft','Left thigh','cm',20,150],['thighRight','Right thigh','cm',20,150],
    ['calfLeft','Left calf','cm',10,100],['calfRight','Right calf','cm',10,100],['neck','Neck','cm',20,100]
  ];

  function readRows(){
    try { const value=JSON.parse(localStorage.getItem(STORAGE)||'[]'); return Array.isArray(value)?value:[]; }
    catch { return []; }
  }
  function writeRows(rows){ localStorage.setItem(STORAGE,JSON.stringify(Array.isArray(rows)?rows:[])); }
  function parseNumber(raw){
    const text=String(raw??'').trim().replace(',','.');
    if(!text)return null;
    const value=Number(text);
    return Number.isFinite(value)?value:NaN;
  }
  function dayKey(date){
    const d=new Date(date); if(Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function init(){
    const drawer=$('measure-drawer');
    const form=$('measure-form');
    if(!drawer||!form)return;
    const tab=$('measure-tab');
    const feedback=$('measure-feedback');
    const recent=$('measure-recent-list');
    let previouslyFocused=null;

    function setFeedback(message,type='ok'){
      if(!feedback)return;
      feedback.textContent=message||'';
      feedback.dataset.state=type;
    }
    function openDrawer(event){
      event?.preventDefault?.();
      previouslyFocused=document.activeElement;
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden','false');
      tab?.setAttribute('aria-expanded','true');
      document.body.classList.add('measure-open');
      setFeedback('');
      renderRecent();
      requestAnimationFrame(()=>form.elements.weight?.focus?.({preventScroll:true}));
    }
    function closeDrawer(){
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
      tab?.setAttribute('aria-expanded','false');
      document.body.classList.remove('measure-open');
      setFeedback('');
      if(previouslyFocused&&document.contains(previouslyFocused)) previouslyFocused.focus?.({preventScroll:true});
    }

    function renderRecent(){
      if(!recent)return;
      const rows=readRows().slice().sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
      recent.innerHTML=rows.length?rows.map(row=>{
        const date=new Date(row.date);
        const valid=!Number.isNaN(date.getTime());
        const dateText=valid?date.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'Unknown date';
        return `<article class="measure-recent-item">
          <span>${dateText}</span>
          <strong>${row.weight!=null&&Number.isFinite(Number(row.weight))?Number(row.weight).toFixed(1)+' kg':'Measurements logged'}</strong>
          <small>${row.waist!=null&&Number.isFinite(Number(row.waist))?'Waist '+Number(row.waist).toFixed(1)+' cm':'View in Diary'}</small>
        </article>`;
      }).join(''):'<p class="measure-empty">No body measurements logged yet.</p>';
    }

    function collect(){
      const row={id:'measure-'+Date.now(),date:new Date().toISOString(),note:String(form.elements.note?.value||'').trim()};
      let hasAny=false;
      for(const [name,label,,min,max] of fields){
        const value=parseNumber(form.elements[name]?.value);
        if(Number.isNaN(value)) return {error:`${label} must be a number.`};
        if(value!==null&&(value<min||value>max)) return {error:`${label} must be between ${min} and ${max}.`};
        row[name]=value;
        if(value!==null)hasAny=true;
      }
      if(!hasAny)return {error:'Enter at least one measurement first.'};
      return {row};
    }

    function save(event){
      event.preventDefault();
      const result=collect();
      if(result.error){setFeedback(result.error,'error');return;}
      const rows=readRows();
      const today=dayKey(result.row.date);
      const existingIndex=rows.findIndex(r=>dayKey(r.date)===today);
      // One clean daily body log: saving again on the same day updates that day instead of creating duplicates.
      if(existingIndex>=0){
        const previous=rows[existingIndex];
        const merged={...previous,id:previous.id||result.row.id,date:previous.date||result.row.date};
        for(const [name] of fields){ if(result.row[name]!==null) merged[name]=result.row[name]; }
        if(result.row.note) merged.note=result.row.note;
        rows[existingIndex]=merged;
      }else rows.push(result.row);
      writeRows(rows);
      form.reset();
      renderRecent();
      setFeedback(existingIndex>=0?'✓ Today’s measurements updated.':'✓ Measurements saved to your Diary.','ok');
      window.GAYMData?.changed?.(STORAGE);
      window.dispatchEvent(new CustomEvent('gaym:measurements-saved',{detail:{row:existingIndex>=0?rows[existingIndex]:result.row}}));
      window.GAYMToast?.(existingIndex>=0?'Measurements updated.':'Measurements saved.');
      setTimeout(()=>setFeedback(''),2200);
    }

    document.addEventListener('click',event=>{
      const open=event.target.closest?.('[data-open-measures]');
      if(open){openDrawer(event);return;}
      const close=event.target.closest?.('[data-close-measures]');
      if(close&&drawer.classList.contains('open')){event.preventDefault();closeDrawer();}
    });
    tab?.addEventListener('click',openDrawer);
    form.addEventListener('submit',save);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer.classList.contains('open'))closeDrawer();});

    renderRecent();
    if(new URLSearchParams(location.search).get('measure')==='1'){
      openDrawer();
      try{history.replaceState({},'',location.pathname+location.hash)}catch{}
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
