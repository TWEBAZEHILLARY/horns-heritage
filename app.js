/* ════════════════════════════════════════════════════════════════
   HORNS & HERITAGE — Application logic
   Router · Auth · Cart · Filters · Persistence
   ════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ---------- Data ---------- */
const UGX = n => 'UGX ' + n.toLocaleString();

const PRODUCTS = [
  {id:'p1',name:'Ankole Premium Beef Steak',runy:'Enyama y\'Ente',cat:'meat',price:42000,unit:'per kg',rating:4.9,desc:'Hand-cut prime steaks from grass-fed Ankole longhorns. Marbled, tender, slow-aged 21 days.',badge:'b-hot',badgeText:'Hot',ph:'BEEF · STEAK · 4×3',popularity:98,date:5},
  {id:'p2',name:'Ankole Tenderloin',runy:'Enyama Ennungi',cat:'meat',price:58000,unit:'per kg',rating:5.0,desc:'The most prized cut — buttery, lean, knife-tender. Reserved selection from each beast.',badge:'b-prem',badgeText:'Premium',ph:'TENDERLOIN · 4×3',popularity:88,date:12},
  {id:'p3',name:'Fresh Cow Milk',runy:'Amate g\'Ente',cat:'dairy',price:3500,unit:'per litre',rating:4.8,desc:'Whole raw milk delivered same-day from grazing cows. Sweet, creamy, traditionally rich.',badge:'b-new',badgeText:'Fresh',ph:'MILK · BOTTLE · 4×3',popularity:75,date:1},
  {id:'p4',name:'Eshabwe — Ghee Sauce',runy:'Eshabwe',cat:'dairy',price:12000,unit:'500ml jar',rating:4.9,desc:'Traditional Ankole ghee sauce, hand-churned. The royal accompaniment to millet bread.',ph:'GHEE · JAR · 4×3',popularity:92,date:8},
  {id:'p5',name:'Yogurt — Cultured Plain',runy:'Mukamo',cat:'dairy',price:6500,unit:'500ml',rating:4.7,desc:'Slow-cultured yogurt from cow milk. Thick, tangy, probiotic-rich.',ph:'YOGURT · POT · 4×3',popularity:64,date:20},
  {id:'p6',name:'Aged Cheese Wheel',runy:'Foromaji',cat:'dairy',price:38000,unit:'400g wheel',rating:4.8,desc:'Hand-pressed, cellar-aged 90 days. Nutty, firm, paired with millet crackers.',badge:'b-prem',badgeText:'Premium',ph:'CHEESE · WHEEL · 4×3',popularity:71,date:40},
  {id:'p7',name:'Goat Meat — Fresh Cuts',runy:'Enyama y\'Embuzi',cat:'goat',price:32000,unit:'per kg',rating:4.8,desc:'Pasture-raised Ankole goat, fresh-butchered. Tender, lean, deeply flavoured.',ph:'GOAT · MEAT · 4×3',popularity:82,date:3},
  {id:'p8',name:'Goat Liver — Premium',runy:'Ebibumba',cat:'goat',price:18000,unit:'500g',rating:4.7,desc:'Rich, iron-dense liver from young goats. Pan-seared, traditional Ankole favourite.',ph:'GOAT · LIVER · 4×3',popularity:55,date:9},
  {id:'p9',name:'Goat Milk',runy:'Amate g\'Embuzi',cat:'goat',price:5500,unit:'per litre',rating:4.6,desc:'Sweet, easy-to-digest goat milk. Daily fresh, traditional craft.',ph:'GOAT · MILK · 4×3',popularity:58,date:2},
  {id:'p10',name:'Beef Ribs — BBQ Cut',runy:'Embavu',cat:'meat',price:36000,unit:'per kg',rating:4.9,desc:'Heritage rib racks, perfect for fire-pit roasting. Slow-cooked tradition.',badge:'b-hot',badgeText:'Hot',ph:'RIBS · BBQ · 4×3',popularity:90,date:6},
  {id:'p11',name:'Mulokonyi — Beef Bones',runy:'Amagufa',cat:'meat',price:14000,unit:'per kg',rating:4.7,desc:'Marrow-rich bones for nourishing broth. The foundation of Ankole nyama choma.',ph:'BONES · MARROW · 4×3',popularity:48,date:14},
  {id:'p12',name:'Heritage Gift Box',runy:'Ekibya',cat:'gift',price:185000,unit:'per box',rating:5.0,desc:'Hand-curated: aged cheese, eshabwe, beef cuts, herbal teas. The full Ankole table.',badge:'b-prem',badgeText:'Premium',ph:'GIFT · BOX · 4×3',popularity:96,date:7},
  {id:'p13',name:'Beef Liver',runy:'Ekibumba',cat:'meat',price:16000,unit:'500g',rating:4.7,desc:'Fresh, nutrient-rich cow liver. A traditional restorative.',ph:'LIVER · FRESH · 4×3',popularity:42,date:10},
  {id:'p14',name:'Goat Ribs',runy:'Embavu z\'Embuzi',cat:'goat',price:28000,unit:'per kg',rating:4.8,desc:'Tender goat ribs, ideal for charcoal grilling. Falls off the bone.',ph:'GOAT · RIBS · 4×3',popularity:62,date:11},
  {id:'p15',name:'Butter — Hand-Churned',runy:'Siyaagi',cat:'dairy',price:9000,unit:'250g',rating:4.8,desc:'Cream-rich Ankole butter, churned by hand. Pale gold, lightly salted.',ph:'BUTTER · WRAP · 4×3',popularity:68,date:15},
  {id:'p16',name:'Founders\' Box',runy:'Ekibya ky\'Abazaire',cat:'gift',price:340000,unit:'limited',rating:5.0,desc:'Limited-edition box from the original 2009 herd. Aged cheese, signed certificate, leather wrap.',badge:'b-prem',badgeText:'Limited',ph:'FOUNDERS · BOX · 4×3',popularity:99,date:18}
];

const BREEDS = {
  cows:[
    {id:'cow-lh',name:'Ankole Longhorn',meta:'Bull · 6–18 months · 350-650kg',price:4200000,ph:'ANKOLE · LONGHORN',certs:['Vaccinated','Brucellosis-free','Health Certified']},
    {id:'cow-cr',name:'Ankole Cross',meta:'Heifer · Hybrid vigour · Dairy/Beef',price:2800000,ph:'ANKOLE · CROSS',certs:['Vaccinated','Health Certified']},
    {id:'cow-dr',name:'Friesian Dairy Cross',meta:'Cow · High-yield milk',price:3400000,ph:'FRIESIAN · CROSS',certs:['Vaccinated','TB-free','Health Certified']},
    {id:'cow-ya',name:'Yearling Bull',meta:'Bull · 12 months · Breeder quality',price:2200000,ph:'YEARLING · BULL',certs:['Vaccinated','Health Certified']}
  ],
  goats:[
    {id:'gt-bo',name:'Boer Goat',meta:'Buck · Meat breed · Fast growth',price:850000,ph:'BOER · GOAT',certs:['Vaccinated','PPR-free','Health Certified']},
    {id:'gt-mu',name:'Mubende Indigenous',meta:'Doe · Heritage · Hardy',price:520000,ph:'MUBENDE · GOAT',certs:['Vaccinated','Health Certified']},
    {id:'gt-sa',name:'Saanen Dairy',meta:'Doe · High milk · 2–3L/day',price:980000,ph:'SAANEN · DAIRY',certs:['Vaccinated','Health Certified']},
    {id:'gt-ki',name:'Kid (Young Goat)',meta:'3–6 months · Breeder or meat',price:280000,ph:'YOUNG · GOAT',certs:['Vaccinated','Health Certified']}
  ]
};

const CUTS = [
  {type:'COW · ENYAMA Y\'ENTE',sub:'Hand-butchered Ankole beef',items:[
    {ico:'🥩',name:'Tenderloin (Fillet)',runy:'Enyama Ennungi',desc:'The most prized cut. Lean, buttery-tender. Sear high and fast — 3 min per side.',tips:['HIGH HEAT','REST 5 MIN'],pid:'p2',price:58000,unit:'per kg'},
    {ico:'🍖',name:'Sirloin Steak',runy:'Enyama y\'Omukira',desc:'Marbled, flavourful. Grill or pan-fry over charcoal embers.',tips:['CHARCOAL','SALT EARLY'],pid:'p1',price:42000,unit:'per kg'},
    {ico:'🦴',name:'Ribs — BBQ Cut',runy:'Embavu',desc:'Rack of beef ribs. Slow-roast over fire, baste with eshabwe glaze.',tips:['SLOW','LOW HEAT'],pid:'p10',price:36000,unit:'per kg'},
    {ico:'🩸',name:'Liver',runy:'Ekibumba',desc:'Fresh cow liver. Quick-sear with onions, salt, and a pinch of cumin.',tips:['HIGH HEAT','UNDER-COOK'],pid:'p13',price:16000,unit:'500g'},
    {ico:'🦴',name:'Mulokonyi (Marrow Bones)',runy:'Amagufa',desc:'Knuckle and shin bones. The foundation of Ankole bone-broth tradition.',tips:['SIMMER 4HR','ADD HERBS'],pid:'p11',price:14000,unit:'per kg'}
  ]},
  {type:'GOAT · ENYAMA Y\'EMBUZI',sub:'Pasture-raised Ankole goat',items:[
    {ico:'🍖',name:'Goat Shoulder',runy:'Akasundi',desc:'Tender, well-marbled. Slow-braise with millet and herbs, or grill in cubes.',tips:['BRAISE','OR GRILL'],pid:'p7',price:32000,unit:'per kg'},
    {ico:'🦴',name:'Goat Ribs',runy:'Embavu z\'Embuzi',desc:'Fall-off-the-bone tender. Charcoal-grill with simple salt rub.',tips:['CHARCOAL','SALT RUB'],pid:'p14',price:28000,unit:'per kg'},
    {ico:'🩸',name:'Goat Liver & Offal',runy:'Ebibumba',desc:'Iron-rich, traditional. Pan-sear with onion and tomato, or skewer over fire.',tips:['QUICK SEAR','SKEWER'],pid:'p8',price:18000,unit:'500g'},
    {ico:'🥩',name:'Goat Leg (Bone-in)',runy:'Okugulu',desc:'Showpiece cut. Slow-roast 4 hours with garlic, rosemary, eshabwe basting.',tips:['ROAST 4HR','BASTE'],pid:'p7',price:34000,unit:'per kg'}
  ]}
];

const TIPS = [
  {ico:'❄️',name:'Storage',body:'Keep fresh cuts at 0–4°C, use within 3 days, or freeze immediately at –18°C for up to 6 months.'},
  {ico:'⏱️',name:'Resting',body:'Always rest grilled meat for 5–10 minutes before slicing — the juices redistribute.'},
  {ico:'🔥',name:'Charcoal first',body:'For Ankole nyama choma, build a hot bed of charcoal and let the flames die down before grilling.'},
  {ico:'🌿',name:'Herbs that sing',body:'Rosemary, garlic, and crushed coriander seed complement grass-fed beef best.'},
  {ico:'🥛',name:'Eshabwe pairing',body:'Pair any roast meat with traditional eshabwe ghee sauce and millet bread for the full Ankole table.'}
];

const GALLERY = [
  {cls:'gal-1',cap:'The Long Horns at Dawn'},
  {cls:'gal-2',cap:'Grazing Plains'},
  {cls:'gal-3',cap:'Cattle Boma'},
  {cls:'gal-4',cap:'Milking Tradition'},
  {cls:'gal-5',cap:'Calf'},
  {cls:'gal-6',cap:'Sunset Herd'},
  {cls:'gal-7',cap:'Ranch Lodge'},
  {cls:'gal-8',cap:'Drum & Dance'}
];

const BONFIRE = [
  {ico:'🔥',name:'Bonfire Storytelling',runy:'Ebyengoma',desc:'Gather around an open fire as elders share oral histories, Ankole legends, and the rhythm of cattle culture passed through generations.',time:'Evenings · 19:00',duration:'2 hours',price:'UGX 85,000 / person'},
  {ico:'🌾',name:'Bushera Tasting',runy:'Bushera',desc:'A traditional fermented millet drink. Naturally probiotic, served warm or chilled, paired with stories of harvest seasons.',time:'Anytime',duration:'45 min',price:'Included'},
  {ico:'🍯',name:'Enturire',runy:'Enturire',desc:'Sweet ceremonial brew of fermented millet, served at weddings and gatherings. A taste of celebration.',time:'On request',duration:'1 hour',price:'UGX 45,000 / person'},
  {ico:'🌿',name:'Omulamba — Herbal Brew',runy:'Omulamba',desc:'A medicinal infusion of native roots and bark, used ceremonially. Cleansing, warming, deeply rooted in tradition.',time:'Mornings · 07:00',duration:'30 min',price:'UGX 35,000 / person'}
];

const MEMBERSHIP = [
  {tier:'Bronze',runy:'Ekitiinwa',price:120000,per:'per year',featured:false,perks:[
    {ok:true,t:'10% discount on all shop products'},
    {ok:true,t:'Quarterly newsletter from the ranch'},
    {ok:true,t:'One complimentary ranch visit per year'},
    {ok:false,t:'Priority delivery'},
    {ok:false,t:'Exclusive heritage box'},
    {ok:false,t:'Private tours & tastings'}
  ]},
  {tier:'Silver',runy:'Effeeza',price:280000,per:'per year',featured:false,perks:[
    {ok:true,t:'15% discount on all shop products'},
    {ok:true,t:'Priority delivery within Kampala'},
    {ok:true,t:'Two ranch visits per year'},
    {ok:true,t:'Monthly newsletter & recipes'},
    {ok:false,t:'Exclusive heritage box'},
    {ok:false,t:'Private tours & tastings'}
  ]},
  {tier:'Gold',runy:'Zaabu',price:520000,per:'per year',featured:true,perks:[
    {ok:true,t:'25% discount on all shop products'},
    {ok:true,t:'Free priority delivery nationwide'},
    {ok:true,t:'Quarterly heritage gift box delivered'},
    {ok:true,t:'Unlimited ranch visits & bonfire nights'},
    {ok:true,t:'Reserved tasting events'},
    {ok:false,t:'Private herd consultation'}
  ]},
  {tier:'Premium',runy:'Omukama',price:1200000,per:'per year',featured:false,perks:[
    {ok:true,t:'35% discount + first-pick on premium cuts'},
    {ok:true,t:'White-glove delivery worldwide'},
    {ok:true,t:'Monthly bespoke heritage box'},
    {ok:true,t:'Private estate tours with chef dinners'},
    {ok:true,t:'Naming rights on a calf'},
    {ok:true,t:'Personal cattle consultation & breeding advice'}
  ]}
];

const COMPARE = [
  ['Discount on shop','10%','15%','25%','35%'],
  ['Ranch visits per year','1','2','Unlimited','Unlimited + private'],
  ['Delivery','Standard','Priority (Kampala)','Free nationwide','White-glove worldwide'],
  ['Heritage gift box','—','—','Quarterly','Monthly bespoke'],
  ['Tastings & bonfire','—','—','✓','✓ + chef dinner'],
  ['Cattle consultation','—','—','—','✓ private']
];

const TEAM = [
  {name:'Mzee basheija julius',role:'Founder & Head Rancher'},
  {name:'mr twebaze hillary',role:'Operational Manager· 32 yrs'},
  {name:'James Mugisha',role:'Tours & Experience'},
  {name:'Sarah Nakimuli',role:'Dairy & Heritage Foods'}
];

/* ---------- Storage ---------- */
const LS_USER = 'hh_user', LS_USERS='hh_users', LS_CART='hh_cart_', LS_WISH='hh_wish_';
const getUser = () => { try { return JSON.parse(localStorage.getItem(LS_USER)||'null'); } catch(e){return null;} };
const setUser = u => { if(u) localStorage.setItem(LS_USER,JSON.stringify(u)); else localStorage.removeItem(LS_USER); };
const getUsers = () => { try { return JSON.parse(localStorage.getItem(LS_USERS)||'[]'); } catch(e){return [];} };
const saveUsers = a => localStorage.setItem(LS_USERS,JSON.stringify(a));
const cartKey = () => { const u=getUser(); return LS_CART+(u?u.email||u.phone||'guest':'guest'); };
const wishKey = () => { const u=getUser(); return LS_WISH+(u?u.email||u.phone||'guest':'guest'); };
const getCart = () => { try { return JSON.parse(localStorage.getItem(cartKey())||'[]'); } catch(e){return [];} };
const saveCart = c => { localStorage.setItem(cartKey(),JSON.stringify(c)); renderCart(); updateCartCount(); };
const getWish = () => { try { return JSON.parse(localStorage.getItem(wishKey())||'[]'); } catch(e){return [];} };
const saveWish = w => localStorage.setItem(wishKey(),JSON.stringify(w));

/* ---------- DOM helpers ---------- */
const $ = (s,r=document) => r.querySelector(s);
const $$ = (s,r=document) => [...r.querySelectorAll(s)];
const ph = (txt,cls='') => `<div class="ph-img ${cls}">${txt}</div>`;
const esc = s => String(s||'').replace(/[<>&"']/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;","'":"&#39;"}[c]));

/* ---------- Toast ---------- */
function toast(msg,type='ok'){
  const host = $('#toast-host');
  const t = document.createElement('div');
  t.className = 'toast '+(type==='err'?'danger':type==='info'?'info':'');
  t.textContent = msg;
  host.appendChild(t);
  setTimeout(()=>{t.style.transition='opacity .3s';t.style.opacity='0';setTimeout(()=>t.remove(),300);},2800);
}

/* ---------- Router ---------- */
const PAGES = ['home','shop','cattle','butchery','tours','livecams','membership','about'];
function navigate(page){
  if(!PAGES.includes(page)) page='home';
  $$('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+page));
  $$('.nl,.mob-link').forEach(l=>l.classList.toggle('active',l.dataset.page===page));
  window.scrollTo({top:0,behavior:'smooth'});
  history.replaceState(null,'','#'+page);
  closeMobMenu();
  // re-trigger reveals
  setTimeout(()=>$$('#page-'+page+' .reveal').forEach(el=>{el.classList.remove('vis');revealObserver.observe(el);}),50);
}
window.navigate = navigate;

/* ---------- Render: Shop ---------- */
let shopState = {cat:'all',min:0,max:400000,sort:'pop',q:''};
function renderShop(){
  const list = PRODUCTS.filter(p=>{
    if(shopState.cat!=='all' && p.cat!==shopState.cat) return false;
    if(p.price<shopState.min||p.price>shopState.max) return false;
    if(shopState.q && !(p.name+' '+p.desc+' '+(p.runy||'')).toLowerCase().includes(shopState.q.toLowerCase())) return false;
    return true;
  });
  if(shopState.sort==='lh') list.sort((a,b)=>a.price-b.price);
  else if(shopState.sort==='hl') list.sort((a,b)=>b.price-a.price);
  else if(shopState.sort==='new') list.sort((a,b)=>a.date-b.date);
  else list.sort((a,b)=>b.popularity-a.popularity);
  $('#shop-count').textContent = list.length+' '+(list.length===1?'product':'products');
  const wish = getWish();
  $('#shop-grid').innerHTML = list.length ? list.map(p=>`
    <article class="product reveal" data-id="${p.id}">
      ${p.badge?`<div class="p-badge ${p.badge}">${p.badgeText}</div>`:''}
      <button class="p-wish ${wish.includes(p.id)?'on':''}" data-wish="${p.id}" aria-label="Add to wishlist">♥</button>
      <div class="p-img">${ph(p.ph)}</div>
      <div class="p-body">
        <div class="p-cat">${p.cat==='meat'?'Beef':p.cat==='goat'?'Goat':p.cat==='dairy'?'Dairy':'Gift Box'}</div>
        <div class="p-name">${esc(p.name)}</div>
        ${p.runy?`<div class="p-runy">${esc(p.runy)}</div>`:''}
        <div class="p-stars">★★★★★ <span>${p.rating}</span></div>
        <div class="p-desc">${esc(p.desc)}</div>
        <div class="p-foot">
          <div><div class="p-price">${UGX(p.price)}</div><div class="p-unit">${p.unit}</div></div>
          <button class="p-add" data-add="${p.id}">+ Add</button>
        </div>
      </div>
    </article>`).join('') : '<div style="grid-column:1/-1;padding:3rem;text-align:center;color:rgba(255,255,255,.4);font-family:var(--bf)">No products match your filters.</div>';
  observeReveals();
}

/* ---------- Render: Cattle ---------- */
function renderCattle(){
  const make = (type,arr) => arr.map(b=>`
    <div class="breed">
      <div class="breed-img">${ph(b.ph,'')}</div>
      <div>
        <div class="breed-name">${esc(b.name)}</div>
        <div class="breed-meta">${esc(b.meta)}</div>
        <span class="breed-price">${UGX(b.price)}</span>
      </div>
      <div class="qty">
        <button data-qm="${b.id}" aria-label="Decrease">−</button>
        <input type="number" id="qty-${b.id}" value="0" min="0" max="50" aria-label="Quantity">
        <button data-qp="${b.id}" aria-label="Increase">+</button>
      </div>
      <div class="cert-row" style="grid-column:1/-1;margin:.4rem 0 0;padding-left:calc(100px + 1.1rem)">${b.certs.map(c=>`<span class="cert">✓ ${c}</span>`).join('')}</div>
    </div>`).join('');
  $('#cows-list').innerHTML = make('cow',BREEDS.cows);
  $('#goats-list').innerHTML = make('goat',BREEDS.goats);
}

/* ---------- Render: Butchery ---------- */
function renderButchery(){
  $('#cuts-section').innerHTML = CUTS.map(cat=>`
    <div class="cut-cat"><h3>${cat.type}</h3><div class="sub">${cat.sub}</div></div>
    ${cat.items.map(c=>`
      <article class="cut reveal">
        <div class="cut-ico">${c.ico}</div>
        <div>
          <div class="cut-name">${esc(c.name)}</div>
          <div class="cut-runy">${esc(c.runy)}</div>
          <div class="cut-desc">${esc(c.desc)}</div>
          <div class="cut-tips">${c.tips.map(t=>`<span class="cut-tip">${t}</span>`).join('')}</div>
        </div>
        <div class="cut-buy">
          <div class="cut-price">${UGX(c.price)}</div>
          <div class="cut-unit">${c.unit}</div>
          <button class="cut-cta" data-buy-cut="${c.pid}">Buy Now</button>
        </div>
      </article>`).join('')}`).join('');
  $('#tips-list').innerHTML = TIPS.map(t=>`
    <div class="tip">
      <div class="tip-ico">${t.ico}</div>
      <div><div class="tip-name">${t.name}</div><div class="tip-body">${t.body}</div></div>
    </div>`).join('');
  $('#qs-list').innerHTML = CUTS.flatMap(c=>c.items).map(c=>`
    <a class="qs-link" data-buy-cut="${c.pid}">${c.name}<span>${UGX(c.price).split(' ')[1]}</span></a>`).join('');
  observeReveals();
}

/* ---------- Render: Tours ---------- */
function renderTours(){
  $('#gallery').innerHTML = GALLERY.map((g,i)=>`
    <div class="gal ${g.cls} reveal" data-lb="${i}">${ph(g.cap.toUpperCase())}<div class="gal-cap">${esc(g.cap)}</div></div>`).join('');
  $('#bonfire-grid').innerHTML = BONFIRE.map(b=>`
    <article class="bonfire-card reveal">
      <div class="bonfire-ico">${b.ico}</div>
      <h3>${esc(b.name)}</h3>
      <div class="runy">${esc(b.runy)}</div>
      <p>${esc(b.desc)}</p>
      <div class="bonfire-meta">
        <span><strong>WHEN</strong> ${b.time}</span>
        <span><strong>DURATION</strong> ${b.duration}</span>
        <span><strong>PRICE</strong> ${b.price}</span>
      </div>
      <button class="btn btn-ghost" data-book="${esc(b.name)}">Book Experience</button>
    </article>`).join('');
  observeReveals();
}

/* ---------- Render: Membership ---------- */
function renderMembership(){
  $('#member-grid').innerHTML = MEMBERSHIP.map(m=>`
    <article class="mc ${m.featured?'featured':''} reveal">
      <div class="mc-tier">Tier</div>
      <div class="mc-name">${m.tier}</div>
      <div class="mc-runy">${m.runy}</div>
      <div class="mc-price">${UGX(m.price)}</div>
      <div class="mc-per">${m.per}</div>
      <ul class="mc-perks">${m.perks.map(p=>`<li class="${p.ok?'':'no'}">${p.t}</li>`).join('')}</ul>
      <button class="mc-btn ${m.featured?'':'outline'}" data-join="${m.tier}">Join ${m.tier}</button>
    </article>`).join('');
  $('#compare-body').innerHTML = COMPARE.map(r=>`
    <tr><td>${r[0]}</td>${r.slice(1).map(c=>`<td>${c==='✓'?'<span class="yes">✓</span>':c==='—'?'<span class="no">—</span>':esc(c)}</td>`).join('')}</tr>`).join('');
  observeReveals();
}

/* ---------- Render: About ---------- */
function renderTeam(){
  $('#team-grid').innerHTML = TEAM.map((t,i)=>`
    <div class="team-card reveal">
      <div class="team-photo">${ph('STAFF · '+(i+1))}</div>
      <div class="team-name">${esc(t.name)}</div>
      <div class="team-role">${esc(t.role)}</div>
    </div>`).join('');
  observeReveals();
}

/* ---------- Cart ---------- */
function addToCart(pid){
  if(!getUser()){ openAuth('Sign in to add items to your cart'); pendingAdd=pid; return; }
  const c = getCart();
  const ex = c.find(i=>i.id===pid);
  if(ex) ex.q++; else c.push({id:pid,q:1});
  saveCart(c);
  toast('Added to cart');
}
function changeCartQty(pid,d){
  const c=getCart();
  const i=c.find(x=>x.id===pid); if(!i) return;
  i.q+=d;
  const out = i.q<=0 ? c.filter(x=>x.id!==pid) : c;
  saveCart(out);
}
function removeFromCart(pid){
  saveCart(getCart().filter(i=>i.id!==pid));
  toast('Removed from cart','info');
}
function renderCart(){
  const c = getCart();
  const host = $('#cart-items');
  if(!c.length){
    host.innerHTML = `<div class="cart-empty"><div class="cart-empty-ico">🛒</div><div style="font-family:var(--bf);font-style:italic">Your basket awaits the harvest</div></div>`;
    $('#cart-subtotal').textContent = UGX(0);
    return;
  }
  let sub=0;
  host.innerHTML = c.map(i=>{
    const p = PRODUCTS.find(x=>x.id===i.id); if(!p) return '';
    sub += p.price*i.q;
    return `<div class="cart-item">
      <div class="cart-item-img">${ph(p.ph.split(' ')[0])}</div>
      <div>
        <div class="cart-item-name">${esc(p.name)}</div>
        <div class="cart-item-price">${UGX(p.price)} · ${p.unit}</div>
        <div class="cart-item-qty">
          <button data-cq="${i.id}" data-d="-1">−</button>
          <span>${i.q}</span>
          <button data-cq="${i.id}" data-d="1">+</button>
        </div>
      </div>
      <button class="cart-del" data-cd="${i.id}" aria-label="Remove">✕</button>
    </div>`;
  }).join('');
  $('#cart-subtotal').textContent = UGX(sub);
}
function updateCartCount(){
  const c = getCart();
  const n = c.reduce((s,i)=>s+i.q,0);
  $('#cart-count').textContent = n;
  $('#cart-count').dataset.empty = n===0?'1':'0';
}

/* ---------- Cart drawer ---------- */
function openCart(){ $('#cart-drawer').classList.add('open'); $('#backdrop').classList.add('open'); renderCart(); }
function closeCart(){ $('#cart-drawer').classList.remove('open'); $('#backdrop').classList.remove('open'); }

/* ---------- Auth modal ---------- */
let pendingAdd = null;
function openAuth(sub){ $('#auth-modal').classList.add('open'); if(sub) $('#auth-sub').textContent = sub; }
function closeAuth(){ $('#auth-modal').classList.remove('open'); pendingAdd=null; }
function switchTab(t){
  $$('.tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===t));
  $('#login-form').style.display = t==='login'?'block':'none';
  $('#signup-form').style.display = t==='signup'?'block':'none';
  $('#auth-title').textContent = t==='login'?'Welcome Back':'Join the Heritage';
  $('#auth-sub').textContent = t==='login'?'Sign in to continue your purchase':'Create your account to access the marketplace';
}
function validatePhone(p){ return /^[\d+\s-]{7,}$/.test(p); }
function validateEmail(e){ return !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

function handleLogin(e){
  e.preventDefault();
  const f = e.target;
  const phone = f.phone.value.trim(), pw = f.password.value;
  if(!phone || !pw){ toast('Phone & password required','err'); return; }
  const users = getUsers();
  const u = users.find(x=>x.phone===phone && x.password===pw);
  if(!u){ toast('Invalid credentials','err'); return; }
  setUser(u);
  toast('Welcome back, '+u.firstName);
  closeAuth();
  refreshAcct();
  if(pendingAdd){ addToCart(pendingAdd); pendingAdd=null; }
  renderCart(); updateCartCount();
}

function handleSignup(e){
  e.preventDefault();
  const f = e.target;
  const errs = [];
  const data = {
    firstName:f.firstName.value.trim(),
    lastName:f.lastName.value.trim(),
    phone:f.phone.value.trim(),
    gender:f.gender.value,
    email:f.email.value.trim(),
    location:f.location.value.trim(),
    password:f.password.value,
    photo:f.photoData.value||null
  };
  $$('#signup-form .field').forEach(x=>x.classList.remove('err'));
  if(!data.firstName) errs.push(['signup-firstName','First name required']);
  if(!data.lastName) errs.push(['signup-lastName','Last name or company required']);
  if(!validatePhone(data.phone)) errs.push(['signup-phone','Valid phone required']);
  if(!data.gender) errs.push(['signup-gender','Please select']);
  if(!validateEmail(data.email)) errs.push(['signup-email','Invalid email']);
  if(!data.location) errs.push(['signup-location','Location helps us deliver']);
  if(data.password.length<6) errs.push(['signup-password','Min 6 characters']);
  if(errs.length){
    errs.forEach(([id,msg])=>{
      const fi = $('#'+id).closest('.field');
      fi.classList.add('err');
      const em = fi.querySelector('.err-msg'); if(em) em.textContent = msg;
    });
    toast('Please fix the highlighted fields','err');
    return;
  }
  const users = getUsers();
  if(users.find(u=>u.phone===data.phone)){ toast('Account exists for this phone','err'); return; }
  users.push(data);
  saveUsers(users);
  setUser(data);
  toast('Welcome to the heritage, '+data.firstName);
  closeAuth();
  refreshAcct();
  if(pendingAdd){ addToCart(pendingAdd); pendingAdd=null; }
}

function refreshAcct(){
  const u = getUser();
  if(u){
    $('#acct-ico').innerHTML = u.photo ? `<img src="${u.photo}" alt="">` : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>';
    $('#acct-ico').style.background = u.photo?'transparent':'';
    $('#acct-name').textContent = u.firstName+' '+u.lastName;
    $('#acct-email').textContent = u.email || u.phone;
    $('#acct-av').innerHTML = u.photo ? `<img src="${u.photo}" alt="">` : (u.firstName[0]||'?').toUpperCase();
    $('#acct-signin-btn').style.display = 'none';
    $('#acct-out-btn').style.display = 'flex';
  } else {
    $('#acct-ico').innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>';
    $('#acct-name').textContent = 'Guest';
    $('#acct-email').textContent = 'Not signed in';
    $('#acct-av').innerHTML = '?';
    $('#acct-signin-btn').style.display = 'flex';
    $('#acct-out-btn').style.display = 'none';
  }
}

/* ---------- Mobile menu ---------- */
function openMobMenu(){ $('#mob-drawer').classList.add('open'); $('#backdrop').classList.add('open'); }
function closeMobMenu(){ $('#mob-drawer').classList.remove('open'); if(!$('#cart-drawer').classList.contains('open')) $('#backdrop').classList.remove('open'); }

/* ---------- Lightbox ---------- */
let lbIdx=0;
function openLB(i){ lbIdx=i; $('#lb-img').innerHTML = ph(GALLERY[i].cap.toUpperCase()); $('#lightbox').classList.add('open'); }
function closeLB(){ $('#lightbox').classList.remove('open'); }
function navLB(d){ lbIdx=(lbIdx+d+GALLERY.length)%GALLERY.length; $('#lb-img').innerHTML = ph(GALLERY[lbIdx].cap.toUpperCase()); }

/* ---------- Reveal observer ---------- */
const revealObserver = new IntersectionObserver(es=>{
  es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('vis'); revealObserver.unobserve(e.target); }});
},{rootMargin:'0px 0px -10% 0px',threshold:.1});
function observeReveals(){ $$('.reveal:not(.vis)').forEach(el=>revealObserver.observe(el)); }

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded',()=>{
  // Initial renders
  renderShop(); renderCattle(); renderButchery(); renderTours(); renderMembership(); renderTeam();
  updateCartCount(); refreshAcct(); renderCart();
  observeReveals();

  // Routing
  const initial = (location.hash||'#home').slice(1);
  navigate(initial);

  // Nav clicks
  $$('.nl,.mob-link,[data-nav]').forEach(el=>el.addEventListener('click',e=>{ const p=el.dataset.page||el.dataset.nav; if(p){e.preventDefault();navigate(p);} }));

  // Hamburger
  $('#hamburger').addEventListener('click',openMobMenu);
  $('#mob-close').addEventListener('click',closeMobMenu);
  $('#backdrop').addEventListener('click',()=>{closeMobMenu();closeCart();});

  // Cart
  $('#cart-btn').addEventListener('click',openCart);
  $('#cart-close').addEventListener('click',closeCart);

  // Account
  $('#acct-btn').addEventListener('click',e=>{e.stopPropagation();$('#acct-dd').classList.toggle('open');});
  document.addEventListener('click',e=>{ if(!e.target.closest('#acct-wrap')) $('#acct-dd').classList.remove('open'); });
  $('#acct-signin-btn').addEventListener('click',()=>{$('#acct-dd').classList.remove('open');openAuth('Sign in to access your account');});
  $('#acct-out-btn').addEventListener('click',()=>{setUser(null);refreshAcct();updateCartCount();renderCart();toast('Signed out','info');$('#acct-dd').classList.remove('open');});

  // Auth
  $('#auth-x').addEventListener('click',closeAuth);
  $('#auth-modal').addEventListener('click',e=>{ if(e.target.id==='auth-modal') closeAuth(); });
  $$('.tab').forEach(b=>b.addEventListener('click',()=>switchTab(b.dataset.tab)));
  $('#login-form').addEventListener('submit',handleLogin);
  $('#signup-form').addEventListener('submit',handleSignup);
  $$('#switch-to-signup').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();switchTab('signup');}));
  $$('#switch-to-login').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();switchTab('login');}));

  // Photo upload
  $('#photo-file').addEventListener('change',e=>{
    const f=e.target.files[0]; if(!f) return;
    const r=new FileReader(); r.onload=ev=>{ $('#photo-preview').innerHTML=`<img src="${ev.target.result}" alt="">`; $('#photoData').value=ev.target.result; }; r.readAsDataURL(f);
  });

  // Shop filters
  $$('input[name="cat"]').forEach(r=>r.addEventListener('change',()=>{shopState.cat=r.value;renderShop();}));
  $('#price-range').addEventListener('input',e=>{shopState.max=+e.target.value;$('#price-max').textContent=UGX(shopState.max);renderShop();});
  $('#shop-sort').addEventListener('change',e=>{shopState.sort=e.target.value;renderShop();});
  $('#shop-search').addEventListener('input',e=>{shopState.q=e.target.value;renderShop();});
  $('#nav-search').addEventListener('input',e=>{shopState.q=e.target.value;navigate('shop');renderShop();});

  // Delegated clicks
  document.addEventListener('click',e=>{
    const add = e.target.closest('[data-add]'); if(add){addToCart(add.dataset.add);return;}
    const wish = e.target.closest('[data-wish]'); if(wish){
      if(!getUser()){ openAuth('Sign in to save favourites'); return; }
      const w=getWish(); const id=wish.dataset.wish;
      const i=w.indexOf(id); if(i>=0){w.splice(i,1);wish.classList.remove('on');toast('Removed from wishlist','info');} else {w.push(id);wish.classList.add('on');toast('Saved to wishlist');}
      saveWish(w); return;
    }
    const cq=e.target.closest('[data-cq]'); if(cq){changeCartQty(cq.dataset.cq,+cq.dataset.d);return;}
    const cd=e.target.closest('[data-cd]'); if(cd){removeFromCart(cd.dataset.cd);return;}
    const lb=e.target.closest('[data-lb]'); if(lb){openLB(+lb.dataset.lb);return;}
    const bk=e.target.closest('[data-book]'); if(bk){navigate('tours');setTimeout(()=>$('#book-form').scrollIntoView({behavior:'smooth',block:'center'}),100);return;}
    const jn=e.target.closest('[data-join]'); if(jn){ if(!getUser()){openAuth('Sign in to join '+jn.dataset.join);return;} toast(jn.dataset.join+' membership selected — checkout coming'); return; }
    const bc=e.target.closest('[data-buy-cut]'); if(bc){navigate('shop');setTimeout(()=>{shopState.q=PRODUCTS.find(p=>p.id===bc.dataset.buyCut)?.name.split(' ')[0]||'';$('#shop-search').value=shopState.q;renderShop();},150);return;}
    const qm=e.target.closest('[data-qm]'); if(qm){const i=$('#qty-'+qm.dataset.qm);i.value=Math.max(0,+i.value-1);return;}
    const qp=e.target.closest('[data-qp]'); if(qp){const i=$('#qty-'+qp.dataset.qp);i.value=Math.min(50,+i.value+1);return;}
  });

  // Cattle order button
  $('#cattle-order').addEventListener('click',()=>{
    const lines=[];
    [...BREEDS.cows,...BREEDS.goats].forEach(b=>{ const v=+$('#qty-'+b.id).value; if(v>0) lines.push(`${v}× ${b.name}`); });
    if(!lines.length){toast('Select quantities first','info');return;}
    if(!getUser()){openAuth('Sign in to submit cattle order');return;}
    const msg = `Hello Horns & Heritage, I'd like to order:\n${lines.join('\n')}`;
    window.open('https://wa.me/256764250125?text='+encodeURIComponent(msg),'_blank');
  });
  $('#sell-wa').addEventListener('click',()=>{
    const msg = "Hello Horns & Heritage, I'd like to sell my cattle. Please advise on the process.";
    window.open('https://wa.me/256764250125?text='+encodeURIComponent(msg),'_blank');
  });

  // Lightbox
  $('#lb-close').addEventListener('click',closeLB);
  $('#lb-prev').addEventListener('click',()=>navLB(-1));
  $('#lb-next').addEventListener('click',()=>navLB(1));
  $('#lightbox').addEventListener('click',e=>{ if(e.target.id==='lightbox') closeLB(); });

  // Booking & contact forms
  $('#book-form').addEventListener('submit',e=>{e.preventDefault();toast('Booking inquiry sent — we\'ll reply within 24h');e.target.reset();});
  $('#contact-form').addEventListener('submit',e=>{e.preventDefault();toast('Message sent — asante sana');e.target.reset();});

  // Checkout
  $('#checkout-btn').addEventListener('click',()=>{
    if(!getCart().length){toast('Your cart is empty','info');return;}
    if(!getUser()){openAuth('Sign in to checkout');return;}
    toast('Order placed — confirmation sent','ok');
    saveCart([]);
    setTimeout(closeCart,800);
  });

  // Scroll behaviours
  window.addEventListener('scroll',()=>{
    $('#nav').classList.toggle('scrolled',window.scrollY>30);
    $('#btt').classList.toggle('show',window.scrollY>400);
  },{passive:true});

  // BTT
  $('#btt').addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  $('#logo').addEventListener('click',()=>{navigate('home');});

  // Keyboard
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){closeAuth();closeCart();closeMobMenu();closeLB();}
    if($('#lightbox').classList.contains('open')){ if(e.key==='ArrowLeft')navLB(-1); if(e.key==='ArrowRight')navLB(1); }
  });

  // Hash routing
  window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));

  // Price range init
  $('#price-max').textContent = UGX(shopState.max);
});

})();
