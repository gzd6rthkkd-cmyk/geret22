/* Публічний сайт: каталог, CRUD товарів, пошук, фільтри, сортування, кошик */
let P=loadP(),img='',editId=null,cart=rd(CKEY,[]);
const save=()=>{if(!saveP(P))toast('Не вдалося зберегти зміни в пам’яті браузера')};

/* Маршрутизація між розділами */
function route(){
  const h=(location.hash||'#about').slice(1);
  const id=['about','catalog','news','contacts'].includes(h)?h:'about';
  document.querySelectorAll('.page').forEach(s=>s.classList.toggle('on',s.id==='p-'+id));
  document.querySelectorAll('.dock a.l').forEach(a=>a.classList.toggle('on',a.dataset.p===id));
  window.scrollTo(0,0);
}
addEventListener('hashchange',route);

/* Списки категорій і виробників */
function fillSelects(){
  const fc=$('fc'),cur=fc.value,opts=Object.entries(CATS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
  fc.innerHTML='<option value="">Усі категорії</option>'+opts;fc.value=cur;
  $('f-cat').innerHTML=opts;
  const fm=$('fm'),cm=fm.value;
  const makers=[...new Set(P.map(p=>p.maker))].sort((a,b)=>a.localeCompare(b,'uk'));
  fm.innerHTML='<option value="">Усі виробники</option>'+makers.map(m=>`<option>${esc(m)}</option>`).join('');
  fm.value=makers.includes(cm)?cm:'';
}

/* Пошук, фільтрація, сортування */
function render(){
  const q=$('q').value.trim().toLowerCase(),c=$('fc').value,m=$('fm').value,s=$('fs').value;
  const mn=parseFloat($('pmin').value),mx=parseFloat($('pmax').value),so=$('so').value;
  let L=P.filter(p=>
    (!q||p.name.toLowerCase().includes(q)||p.maker.toLowerCase().includes(q)||CATS[p.cat].toLowerCase().includes(q))&&
    (!c||p.cat===c)&&(!m||p.maker===m)&&(s===''||p.stock===(s==='1'))&&
    (isNaN(mn)||p.price>=mn)&&(isNaN(mx)||p.price<=mx));
  if(so)L.sort((a,b)=>so==='asc'?a.price-b.price:b.price-a.price);
  $('cnt').textContent=`Знайдено товарів: ${L.length} з ${P.length}`;
  $('cards').innerHTML=L.length?L.map(p=>`
    <article class="card"><div class="ph"><img src="${photo(p)}" alt="${esc(p.name)}" loading="lazy"></div>
      <div class="cb"><span class="tag">${CATS[p.cat]}</span><h3>${esc(p.name)}</h3>
      <p>${esc(p.desc)}</p>
      <span class="spec">Виробник: ${esc(p.maker)}<br>Артикул: ${esc(p.sku)}</span>
      <div class="price">${p.price.toFixed(2)} грн <small>за ${esc(p.unit)}</small></div>
      <span class="st ${p.stock?'y':'n'}">${p.stock?'В наявності':'Немає в наявності'}</span>
      <div class="act"><button class="btn p sm" data-c="${p.id}" ${p.stock?'':'disabled'}>До замовлення</button>
      <button class="btn sm" data-e="${p.id}">Редагувати</button><button class="btn del sm" data-d="${p.id}">Видалити</button></div></div></article>`).join('')
    :'<div class="empty" style="grid-column:1/-1">За цими умовами товарів немає. Змініть фільтри або скиньте їх.</div>';
}
['q','fc','fm','pmin','pmax','fs','so'].forEach(id=>$(id).addEventListener('input',render));
$('reset').onclick=()=>{['q','fc','fm','pmin','pmax','fs','so'].forEach(id=>$(id).value='');render()};

/* Додавання, редагування, видалення товарів */
function openForm(p){
  editId=p?p.id:null;img=p?p.img:'';
  $('dt').textContent=p?'Редагування товару':'Новий товар';
  $('f-name').value=p?p.name:'';$('f-desc').value=p?p.desc:'';$('f-cat').value=p?p.cat:'food';
  $('f-maker').value=p?p.maker:'';$('f-sku').value=p?p.sku:'';$('f-unit').value=p?p.unit:'шт';
  $('f-price').value=p?p.price:'';$('f-stock').value=p&&!p.stock?'0':'1';$('f-img').value='';
  $('pv').hidden=!img;if(img)$('pv').src=img;
  $('dlg').showModal();
}
$('add').onclick=()=>openForm(null);
$('cancel').onclick=()=>$('dlg').close();
$('f-img').onchange=e=>{
  const f=e.target.files[0];if(!f)return;
  if(f.size>1500000){toast('Файл завеликий (макс. 1,5 МБ)');e.target.value='';return}
  const r=new FileReader();r.onload=()=>{img=r.result;$('pv').src=img;$('pv').hidden=false};r.readAsDataURL(f);
};
$('pf').onsubmit=e=>{
  e.preventDefault();
  const d={name:$('f-name').value.trim(),desc:$('f-desc').value.trim(),cat:$('f-cat').value,maker:$('f-maker').value.trim(),
    sku:$('f-sku').value.trim(),unit:$('f-unit').value,price:parseFloat($('f-price').value),stock:$('f-stock').value==='1',img};
  if(!d.name||isNaN(d.price)||d.price<0){toast('Перевірте назву та ціну');return}
  if(editId){Object.assign(P.find(x=>x.id===editId),d);toast('Зміни збережено')}
  else{P.push({id:Math.max(0,...P.map(p=>p.id))+1,e:'📦',...d});toast('Товар додано')}
  save();fillSelects();render();$('dlg').close();
};
$('cards').addEventListener('click',e=>{
  const t=e.target,ed=t.dataset.e,dl=t.dataset.d,ad=t.dataset.c;
  if(ed)openForm(P.find(p=>p.id==ed));
  if(ad){const c=cart.find(x=>x.pid==ad);c?c.qty++:cart.push({pid:+ad,qty:1});cartSave();toast('Додано до замовлення')}
  if(dl){const p=P.find(x=>x.id==dl);
    if(confirm(`Видалити товар «${p.name}»?`)){P=P.filter(x=>x.id!=dl);save();fillSelects();render();toast('Товар видалено')}}
});

/* Кошик і оформлення замовлення (заявка потрапляє в адмін-панель) */
function cartRows(){return cart.map(c=>({p:P.find(x=>x.id===c.pid),qty:c.qty})).filter(r=>r.p)}
function cartSave(){
  wr(CKEY,cart);
  $('cartBtn').textContent='Кошик ('+cart.reduce((s,c)=>s+c.qty,0)+')';
}
function cartRender(){
  const rows=cartRows();
  $('clist').innerHTML=rows.length?rows.map(({p,qty})=>`<div class="crow"><span>${esc(p.name)}<br><small class="mut">${money(p.price)} / ${esc(p.unit)}</small></span>
    <span class="qty"><button type="button" class="btn sm" data-q="${p.id}:-1">−</button><b>${qty}</b><button type="button" class="btn sm" data-q="${p.id}:1">+</button></span>
    <b>${money(p.price*qty)}</b></div>`).join('')
    :'<div class="empty">Замовлення порожнє. Додайте товари з каталогу.</div>';
  $('ctotal').textContent='Разом: '+money(rows.reduce((s,r)=>s+r.p.price*r.qty,0));
}
$('cartBtn').onclick=()=>{cartRender();$('cd').showModal()};
$('ccancel').onclick=()=>$('cd').close();
$('clist').addEventListener('click',e=>{
  const q=e.target.dataset.q;if(!q)return;
  const [id,d]=q.split(':').map(Number),c=cart.find(x=>x.pid===id);
  c.qty+=d;if(c.qty<=0)cart=cart.filter(x=>x!==c);
  cartSave();cartRender();
});
$('cform').onsubmit=e=>{
  e.preventDefault();
  const rows=cartRows();
  if(!rows.length){toast('Додайте хоча б один товар');return}
  const O=loadO(),id=Math.max(1000,...O.map(o=>o.id))+1;
  O.push({id,date:new Date().toISOString(),name:$('c-name').value.trim(),phone:$('c-phone').value.trim(),
    city:$('c-city').value,address:$('c-addr').value.trim(),comment:$('c-com').value.trim(),status:'new',
    items:rows.map(({p,qty})=>({pid:p.id,name:p.name,sku:p.sku,unit:p.unit,price:p.price,qty}))});
  if(!saveO(O)){toast('Не вдалося зберегти замовлення');return}
  cart=[];cartSave();e.target.reset();$('cd').close();toast('Замовлення №'+id+' оформлено');
};
$('cf').onsubmit=e=>{e.preventDefault();e.target.reset();toast('Дякуємо! Повідомлення надіслано.')};

$('c-city').innerHTML=cityOpts();
fillSelects();render();route();cartSave();
