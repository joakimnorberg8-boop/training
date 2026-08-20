const cardioPresets = [{"fun": "Norwegian Wood, Daddy", "name": "4 × 4 intervals", "description": "4 min hard · 3 min active rest · 4 rounds", "rounds": 4, "work": "04:00", "rest": "03:00"}, {"fun": "Thirty Seconds to Serve", "name": "30/30 intervals", "description": "30 sec hard · 30 sec easy · 10 rounds", "rounds": 10, "work": "00:30", "rest": "00:30"}, {"fun": "One Minute Stand", "name": "60/60 intervals", "description": "60 sec hard · 60 sec easy · 8 rounds", "rounds": 8, "work": "01:00", "rest": "01:00"}, {"fun": "HIIT Me Baby", "name": "40/20 intervals", "description": "40 sec work · 20 sec rest · 10 rounds", "rounds": 10, "work": "00:40", "rest": "00:20"}, {"fun": "Tabata-ta-ta", "name": "Tabata 20/10", "description": "20 sec max · 10 sec rest · 8 rounds", "rounds": 8, "work": "00:20", "rest": "00:10"}, {"fun": "Sprint Me Like You Mean It", "name": "Sprint intervals", "description": "30 sec sprint · 90 sec easy · 8 rounds", "rounds": 8, "work": "00:30", "rest": "01:30"}, {"fun": "Hill Me Softly", "name": "Hill intervals", "description": "60 sec uphill · 90 sec recovery · 8 rounds", "rounds": 8, "work": "01:00", "rest": "01:30"}, {"fun": "Tempo? I Barely Know Her", "name": "Threshold intervals", "description": "8 min controlled hard · 2 min easy · 3 rounds", "rounds": 3, "work": "08:00", "rest": "02:00"}];
const $ = id => document.getElementById(id);
let custom = JSON.parse(localStorage.getItem('gaym-custom-cardio') || '[]');
let added = JSON.parse(localStorage.getItem('gaym-added-cardio') || '[]');

function totalSeconds(t) {
  const p=t.split(':').map(Number); return p.length===2?p[0]*60+p[1]:0;
}
function formatDuration(pass) {
  const sec = pass.rounds*(totalSeconds(pass.work)+totalSeconds(pass.rest));
  return `${Math.floor(sec/60)} min`;
}
function optionLabel(pass) {
  return `${pass.name} · ${pass.rounds} × ${pass.work}`;
}
function selectedCard(pass, extra=false, index=0) {
  return `<article class="cardio-selected-card">
    <div class="cardio-card-top"><span>${extra?'CUSTOM':'INTERVAL'}</span>${extra?`<button type="button" data-remove-cardio="${index}">REMOVE</button>`:''}</div>
    <div class="cardio-selected-copy">
      <p class="exercise-kicker">${pass.rounds} ROUNDS · APPROX. ${formatDuration(pass)}</p>
      <h2>${pass.fun}</h2>
      <p class="real-name">${pass.name}</p>
      <p class="cardio-description">${pass.description}</p>
    </div>
    <div class="time-prescription"><span><b>${pass.work}</b><small>WORK</small></span><span><b>${pass.rest}</b><small>REST</small></span><span><b>${pass.rounds}</b><small>ROUNDS</small></span></div>
    <a class="start-cardio-button" href="cardio-session.html?id=${encodeURIComponent(pass.name)}&custom=${extra?'1':'0'}">START WORKOUT</a>
  </article>`;
}
function getAvailable(){
  return [...cardioPresets.map(p=>({pass:p,extra:false,index:-1})), ...added.map((p,index)=>({pass:p,extra:true,index}))];
}
function render(preferredIndex = null) {
  const available=getAvailable();
  const select=$('cardio-select');
  const current=preferredIndex !== null ? String(preferredIndex) : (select?.value || '0');
  if(select){
    select.innerHTML=available.map((x,i)=>`<option value="${i}">${optionLabel(x.pass)}</option>`).join('');
    select.value=available[Number(current)] ? current : '0';
    select.onchange=renderSelected;
  }
  renderSelected();
  $('custom-cardio-list').innerHTML='';
}
function renderSelected(){
  const available=getAvailable();
  const chosen=available[Number($('cardio-select')?.value)||0] || available[0];
  if(!chosen) return;
  $('cardio-selected-preview').innerHTML=selectedCard(chosen.pass,chosen.extra,chosen.index);
  document.querySelector('[data-remove-cardio]')?.addEventListener('click',()=>{
    added.splice(chosen.index,1); save(); render();
  });
}
function save(){localStorage.setItem('gaym-added-cardio',JSON.stringify(added));localStorage.setItem('gaym-custom-cardio',JSON.stringify(custom));}
function openModal(){$('cardio-modal').classList.add('open');renderLibrary();}
function closeModal(){$('cardio-modal').classList.remove('open');}
function renderLibrary(){
  const all=[...cardioPresets,...custom];
  $('cardio-library-list').innerHTML=all.map((p,i)=>`<button class="library-exercise" data-add-cardio="${i}"><div><strong>${p.fun}</strong><span>${p.name}</span></div><small>${p.rounds} × ${p.work}</small><b>＋</b></button>`).join('');
  document.querySelectorAll('[data-add-cardio]').forEach(b=>b.onclick=()=>{
    const chosen=all[Number(b.dataset.addCardio)];
    if(!chosen) return;
    added.push({...chosen});
    save();
    closeModal();
    const newIndex=cardioPresets.length+added.length-1;
    render(newIndex);
    const preview=$('cardio-selected-preview');
    preview?.classList.add('cardio-just-added');
    setTimeout(()=>preview?.classList.remove('cardio-just-added'),700);
  });
}
$('add-cardio').onclick=openModal;
document.querySelectorAll('[data-close-cardio]').forEach(e=>e.onclick=closeModal);
document.querySelectorAll('[data-cardio-tab]').forEach(t=>t.onclick=()=>{
 document.querySelectorAll('[data-cardio-tab]').forEach(x=>x.classList.remove('active'));document.querySelectorAll('#cardio-modal .modal-view').forEach(x=>x.classList.remove('active'));
 t.classList.add('active');$(`cardio-${t.dataset.cardioTab}-view`).classList.add('active');
});
$('create-cardio').onclick=()=>{
 const name=$('new-cardio-name').value.trim(); if(!name) return $('new-cardio-name').focus();
 const p={name,fun:$('new-cardio-fun').value.trim()||name,rounds:Math.max(1,Number($('new-cardio-rounds').value)||1),work:$('new-cardio-work').value.trim()||'00:30',rest:$('new-cardio-rest').value.trim()||'00:30',description:$('new-cardio-description').value.trim()||'Eget intervallpass'};
 custom.push(p);added.push({...p});save();closeModal();render(cardioPresets.length+added.length-1);
};
render();
const ch=JSON.parse(localStorage.getItem('gaym-cardio-history')||'[]');const summary=document.getElementById('cardio-summary');if(summary&&ch[0])summary.querySelector('strong').textContent=`${ch[0].name} · ${ch[0].completedRounds}/${ch[0].rounds} rounds`;
