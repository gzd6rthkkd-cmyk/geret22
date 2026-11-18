/* Адмін-панель: перегляд, оформлення та обробка замовлень */
const PASS='admin123'; // навчальний пароль (захист лише демонстраційний)
let O=[],P=[];
const sget=()=>{try{return sessionStorage.getItem('td_admin')}catch(e){return null}};
const sset=()=>{try{sessionStorage.setItem('td_admin','1')}catch(e){}};
const statOpts=v=>Object.entries(STAT).map(([k,t])=>`<option value="${k}" ${k===v?'selected':''}>${t}</option>`).join('');

function enter(){$('login').hidden=true;$('app').hidden=false;O=loadO();P=loadP();saveO(O);$('fs').innerHTML='<option value="">Усі статуси</option>'+statOpts('');render()}
$('lf').onsubmit=e=>{e.preventDefault();if($('pw').value===PASS){sset();enter()}else{$('lerr').textContent='Невірний пароль';$('pw').select()}};
$('logout').onclick=()=>{try{sessionStorage.removeItem('td_admin')}catch(e){}location.reload()};

function render(){
  const q=$('q').value.trim().toLowerCase(),st=$('fs').value;
  const L=O.filter(o=>(!st||o.status===st)&&(!q||('№'+o.id).includes(q)||String(o.id).includes(q)||o.name.toLowerCase().includes(q)||(o.city||'').toLowerCase().includes(q)||o.phone.includes(q)))
    .sort((a,b)=>b.id-a.id);
  const act=O.filter(o=>o.status!=='cancel');
  $('st').innerHTML=`<div class="astat"><b>${O.length}</b>усього замовлень</div>
    <div class="astat"><b>${O.filter(o=>o.status==='new').length}</b>нових</div>
    <div class="astat"><b>${O.filter(o=>o.status==='work'||o.status==='sent').length}</b>у роботі</div>
    <div class="astat"><b>${Math.round(act.reduce((s,o)=>s+orderSum(o),0)).toLocaleString('uk-UA')}</b>грн (без скасованих)</div>`;
  $('list').innerHTML=L.length?L.map(o=>`<article class="orow s-${o.status}">
    <div><b>№${o.id}</b><br><span class="mut sm">${fdate(o.date)}</span></div>
    <div>${esc(o.name)}<br><span class="mut sm">${esc(o.city||'')} · ${esc(o.phone)}</span></div>
    <div>${o.items.length} поз. · <b>${money(orderSum(o))}</b></div>
    <div><select data-s="${o.id}" aria-label="Статус замовлення №${o.id}">${statOpts(o.status)}</select></div>
    <div class="acts"><button class="btn sm" data-v="${o.id}">Деталі</button><button class="btn del sm" data-x="${o.id}">Видалити</button></div></article>`).join('')
    :'<div class="empty">Замовлень за цими умовами немає.</div>';
}
['q','fs'].forEach(id=>$(id).addEventListener('input',render));
$('list').addEventListener('change',e=>{
  const id=e.target.dataset.s;if(!id)return;
  O.find(o=>o.id==id).status=e.target.value;saveO(O);render();toast('Статус оновлено');
});
$('list').addEventListener('click',e=>{
  const v=e.target.dataset.v,x=e.target.dataset.x;
  if(v)details(O.find(o=>o.id==v));
  if(x&&confirm('Видалити замовлення №'+x+'?')){O=O.filter(o=>o.id!=x);saveO(O);render();toast('Замовлення видалено')}
});

/* Деталі замовлення */
let cur=null;
function details(o){
  cur=o;
  $('dtt').textContent='Замовлення №'+o.id;
  $('dbody').innerHTML=`<p class="mut">${fdate(o.date)}</p>
   <p><b>${esc(o.name)}</b><br>${esc(o.phone)}<br>${esc(o.city||'')}${o.city?', ':''}${esc(o.address)}</p>${o.comment?`<p class="mut">Коментар: ${esc(o.comment)}</p>`:''}
   <div class="itab">${o.items.map(i=>`<div class="crow"><span>${esc(i.name)}<br><small class="mut">Арт. ${esc(i.sku)} · ${money(i.price)} / ${esc(i.unit)}</small></span><span>× ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join('')}</div>
   <div class="total">Разом: ${money(orderSum(o))}</div>
   <label>Статус<select id="dstat">${statOpts(o.status)}</select></label>`;
  $('dd').showModal();
}
$('dclose').onclick=()=>$('dd').close();
$('dsave').onclick=()=>{cur.status=$('dstat').value;saveO(O);render();$('dd').close();toast('Статус оновлено')};

/* Оформлення нового замовлення вручну */
const inStock=()=>P.filter(p=>p.stock);
function addRow(){
  const d=document.createElement('div');d.className='nrow';
  d.innerHTML=`<select class="np">${inStock().map(p=>`<option value="${p.id}">${esc(p.name)} — ${money(p.price)}</option>`).join('')}</select>
   <input class="nq" type="number" min="1" value="1" aria-label="Кількість"><button type="button" class="btn del sm" data-r>✕</button>`;
  $('nrows').appendChild(d);calc();
}
function calc(){
  let s=0;document.querySelectorAll('.nrow').forEach(r=>{const p=P.find(x=>x.id==r.querySelector('.np').value);s+=(p?p.price:0)*(+r.querySelector('.nq').value||0)});
  $('ntotal').textContent='Разом: '+money(s);
}
$('newBtn').onclick=()=>{P=loadP();$('n-city').innerHTML=cityOpts();$('nf').reset();$('nrows').innerHTML='';addRow();$('nd').showModal()};
$('addrow').onclick=addRow;
$('nrows').addEventListener('input',calc);
$('nrows').addEventListener('click',e=>{if(e.target.dataset.r!==undefined&&$('nrows').children.length>1){e.target.closest('.nrow').remove();calc()}});
$('ncancel').onclick=()=>$('nd').close();
$('nf').onsubmit=e=>{
  e.preventDefault();
  const map={};
  document.querySelectorAll('.nrow').forEach(r=>{const id=+r.querySelector('.np').value,q=+r.querySelector('.nq').value;if(q>0)map[id]=(map[id]||0)+q});
  const items=Object.entries(map).map(([id,q])=>{const p=P.find(x=>x.id==id);return{pid:p.id,name:p.name,sku:p.sku,unit:p.unit,price:p.price,qty:q}});
  if(!items.length){toast('Додайте хоча б одну позицію');return}
  O=loadO();const id=Math.max(1000,...O.map(o=>o.id))+1;
  O.push({id,date:new Date().toISOString(),name:$('n-name').value.trim(),phone:$('n-phone').value.trim(),city:$('n-city').value,address:$('n-addr').value.trim(),comment:$('n-com').value.trim(),status:'new',items});
  saveO(O);render();$('nd').close();toast('Замовлення №'+id+' створено');
};

if(sget())enter();
