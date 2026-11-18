/* Спільні дані для сайту (index.html) та адмін-панелі (admin.html) */
const CATS={food:'Продукти харчування',house:'Господарські товари',daily:'Товари повсякденного попиту'};
const COL={food:'#a8d8d5',house:'#d9e0d0',daily:'#c9d3d9'};
const CITIES=['Дніпро','Київ','Харків','Одеса','Львів','Запоріжжя','Кривий Ріг','Кам’янське','Полтава','Вінниця','Черкаси','Житомир','Суми','Чернігів','Рівне','Івано-Франківськ','Тернопіль','Луцьк','Ужгород','Чернівці','Хмельницький','Кропивницький','Миколаїв'];
const cityOpts=()=>CITIES.map(c=>`<option>${c}</option>`).join('');
const STAT={new:'Нове',work:'В обробці',sent:'Відправлено',done:'Виконано',cancel:'Скасовано'};
const PKEY='td_products_v3',OKEY='td_orders_v1',CKEY='td_cart_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>Number(n).toFixed(2)+' грн';
const fdate=d=>new Date(d).toLocaleString('uk-UA',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'});

// 15 товарів: по 5 у кожній категорії (фото лежать у папці img)
const seed=[
['Олія соняшникова нерафінована холодного віджиму','🌻','food','Агро Світ','FD-001','л','Нерафінована олія холодного віджиму, пляшка 1 л.',89,1],
['Крупа гречана швидкорозварювана','🌾','food','Сквирянка','FD-002','уп','Дуже чиста крупа, не потребує перебирання, пакування 800 г.',62,1],
['Цукор білий кристалічний','🍚','food','Тернопільський цукор','FD-003','кг','Цукор-пісок ТС1 для випічки та щоденного вжитку.',38.9,1],
['Молоко пастеризоване 3,2%','🥛','food','Своя Лінія','FD-004','шт','Коров’яче питне пастеризоване молоко, пляшка 2 кг.',74.5,1],
['Спагеті №19','🍝','food','Pasta Reggia','FD-005','уп','Макаронні вироби з борошна з твердих сортів пшениці, 500 г.',46,0],
['Засіб для миття посуду Ultra Sensitive','🧴','house','Domol','HG-001','шт','Гіпоалергенний засіб без запаху та барвників, 500 мл.',79,1],
['Пральний порошок Dash Power','🧺','house','Dash','HG-002','уп','Концентрований порошок із технологією проти залишків, 86 прань.',589,1],
['Відро пластикове 10 л','🪣','house','Алеана','HG-003','шт','Міцне відро з пластиковою дужкою для щоденного прибирання.',85,1],
['Швабра плоска з відром 6 л','🧹','house','Clean Master','HG-004','шт','Комплект: швабра з віджимом, відро 6 л і змінні насадки з мікрофібри.',560,0],
['Губки кухонні Fibra Forte, 5 шт','🧽','house','Domi','HG-005','уп','Губки з жорстким шаром для видалення стійких забруднень.',34,1],
['Зубна паста Pro White Filler','🪥','daily','Biorepair','DL-001','шт','Відбілювальна паста, що відновлює поверхню емалі.',385,1],
['Крем-мило Диво','🧼','daily','Диво','DL-002','уп','Туалетне крем-мило, набір із трьох брусків.',42,1],
['Батарейки AA Duracell, 4 шт','🔋','daily','Duracell','DL-003','уп','Лужні батарейки довготривалої дії.',145,1],
['Зошити шкільні Kite, 48 арк.','📓','daily','Kite','DL-004','шт','Зошит у клітинку з яскравою тематичною обкладинкою.',22,1],
['Серветки паперові білі','🧻','daily','Pro Service','DL-005','уп','Білі паперові серветки, пачка 100 шт.',24.5,0]
].map((a,i)=>({id:i+1,name:a[0],e:a[1],cat:a[2],maker:a[3],sku:a[4],unit:a[5],desc:a[6],price:a[7],stock:!!a[8],img:'img/p'+String(i+1).padStart(2,'0')+'.jpg'}));

function rd(k,def){try{const s=localStorage.getItem(k);if(s)return JSON.parse(s)}catch(e){}return def}
function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
const loadP=()=>rd(PKEY,seed.map(x=>({...x})));
const saveP=P=>wr(PKEY,P);
const saveO=O=>wr(OKEY,O);
const mk=(pid,qty)=>{const p=seed.find(x=>x.id===pid);return{pid,name:p.name,sku:p.sku,unit:p.unit,price:p.price,qty}};
function loadO(){
  return rd(OKEY,[
    {id:1001,date:'2026-11-16T10:20',name:'ФОП Коваленко І.',phone:'+380501112233',city:'Дніпро',address:'вул. Робоча, 12',comment:'Доставити до 12:00',status:'work',items:[mk(1,10),mk(2,20),mk(3,15)]},
    {id:1002,date:'2026-11-17T14:05',name:'Магазин «Затишок»',phone:'+380679998877',city:'Кам’янське',address:'пр. Свободи, 40',comment:'',status:'new',items:[mk(7,6),mk(10,30),mk(13,12)]},
    {id:1003,date:'2026-11-12T09:40',name:'Олена Мельник',phone:'+380931234567',city:'Дніпро',address:'вул. Паторжинського, 7',comment:'Подзвонити перед доставкою',status:'done',items:[mk(4,4),mk(12,6)]}
  ]);
}
const orderSum=o=>o.items.reduce((s,i)=>s+i.price*i.qty,0);

// Фото: файл із папки img, фото, завантажене користувачем, або SVG-заглушка
function photo(p){
  if(p.img)return p.img;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${COL[p.cat]||'#ddd'}"/><text x="200" y="185" font-size="120" text-anchor="middle">${p.e||'📦'}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
function toast(t){const el=$('toast');el.textContent=t;el.classList.add('on');setTimeout(()=>el.classList.remove('on'),2400)}
