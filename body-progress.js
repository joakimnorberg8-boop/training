let rows=[];
function loadRows(){try{const value=JSON.parse(localStorage.getItem('gaym-body-measurements')||'[]');rows=(Array.isArray(value)?value:[]).filter(x=>x&&x.date).sort((a,b)=>new Date(a.date)-new Date(b.date));}catch{rows=[];}}
loadRows();
const $=id=>document.getElementById(id);
let show=false;

const fullDate=d=>new Date(d).toLocaleDateString('sv-SE',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const shortDate=d=>new Date(d).toLocaleDateString('sv-SE',{day:'numeric',month:'short'});

function render(){
  const key=$('body-metric').value;
  const label=$('body-metric').selectedOptions[0].textContent;
  const unit=key==='weight'?'kg':'cm';
  const pts=rows.filter(x=>x[key]!=null).map(x=>({date:x.date,value:+x[key],row:x}));
  const box=$('body-summary');

  if(!pts.length){
    box.innerHTML='<div class="empty-history"><strong>No data yet.</strong><p>Log body measurements and your progress will appear here.</p></div>';
    $('body-chart').innerHTML='';
    return;
  }

  const first=pts[0],last=pts.at(-1),diff=last.value-first.value;
  box.innerHTML=`
    <div><span>SENAST</span><strong>${last.value.toFixed(1)} ${unit}</strong></div>
    <div><span>FIRST</span><strong>${first.value.toFixed(1)} ${unit}</strong></div>
    <div><span>CHANGE</span><strong>${diff>0?'+':''}${diff.toFixed(1)} ${unit}</strong></div>`;

  if(show) draw(pts,label,unit);
}

function draw(pts,label,unit){
  const W=760,H=285,PX=45,PY=38;
  const min=Math.min(...pts.map(x=>x.value)),max=Math.max(...pts.map(x=>x.value)),range=Math.max(1,max-min);
  const low=min-range*.18,high=max+range*.18;
  const x=i=>pts.length===1?W/2:PX+i*(W-2*PX)/(pts.length-1);
  const y=v=>H-PY-((v-low)/(high-low))*(H-2*PY);

  const points=pts.map((p,i)=>{
    const note=p.row.note||'';
    return `<g class="interactive-chart-point" tabindex="0" role="button"
      data-index="${i}"
      data-date="${fullDate(p.date)}"
      data-value="${p.value.toFixed(1)} ${unit}"
      data-note="${note.replace(/"/g,'&quot;')}">
      <circle class="chart-hit-area" cx="${x(i)}" cy="${y(p.value)}" r="18"></circle>
      <circle class="chart-dot" cx="${x(i)}" cy="${y(p.value)}" r="6"></circle>
      <text class="chart-date-label" x="${x(i)}" y="${H-10}" text-anchor="middle">${shortDate(p.date)}</text>
    </g>`;
  }).join('');

  $('body-chart').innerHTML=`
    <div class="interactive-chart-head">
      <h2>${label}</h2>
      <span>Hover or tap a point</span>
    </div>
    <div class="chart-canvas-wrap">
      <svg viewBox="0 0 ${W} ${H}" aria-label="${label} over time">
        <line class="chart-axis" x1="${PX}" y1="${H-PY}" x2="${W-PX}" y2="${H-PY}"></line>
        <polyline class="chart-line" points="${pts.map((p,i)=>`${x(i)},${y(p.value)}`).join(' ')}"></polyline>
        ${points}
      </svg>
      <div class="chart-tooltip" id="body-chart-tooltip" aria-live="polite"></div>
    </div>`;

  bindPointTooltips('body-chart');
}

function bindPointTooltips(containerId){
  const container=$(containerId);
  const tooltip=container.querySelector('.chart-tooltip');
  const points=[...container.querySelectorAll('.interactive-chart-point')];

  function show(point){
    points.forEach(p=>p.classList.toggle('active',p===point));
    const note=point.dataset.note;
    tooltip.innerHTML=`<strong>${point.dataset.value}</strong><span>${point.dataset.date}</span>${note?`<small>${note}</small>`:''}`;
    tooltip.classList.add('show');
  }
  points.forEach(p=>{
    p.addEventListener('mouseenter',()=>show(p));
    p.addEventListener('focus',()=>show(p));
    p.addEventListener('click',()=>show(p));
    p.addEventListener('touchstart',()=>show(p),{passive:true});
  });
}

$('body-metric').onchange=render;
$('toggle-body-chart').onclick=()=>{
  show=!show;
  $('body-chart').classList.toggle('hidden',!show);
  $('toggle-body-chart').textContent=show?'HIDE CHART':'VIEW PROGRESS';
  render();
};
render();

window.addEventListener('gaym:data-changed',()=>{loadRows();render();});window.addEventListener('focus',()=>{loadRows();render();});document.addEventListener('visibilitychange',()=>{if(!document.hidden){loadRows();render();}});
