/* QuickServe | app core: shared state, helpers, navigation, dashboard, events */
const $ = s => document.querySelector(s);
const inr = n => '₹' + Number(n).toLocaleString('en-IN');
const STATUS = ['Pending', 'Preparing', 'Ready', 'Delivered'];
const NEXT = { Pending: 'Start preparing', Preparing: 'Mark ready', Ready: 'Mark delivered' };
const S = { view: 'dashboard', menu: [], orders: [], tables: [], cats: [], cart: [], table: null, cat: 'All', q: '' };
const active = () => S.orders.filter(o => o.status !== 'Completed');
const oid = o => '#' + String(o.id).slice(-4).toUpperCase().padStart(3, '0');
const at = o => new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const PAGES = {
  dashboard: ['Dashboard', 'Your café at a glance'],
  menu: ['Menu & Ordering', 'Add items, pick a table, place the order'],
  orders: ['Active Orders', 'Everything still in progress'],
  kitchen: ['Kitchen Display', 'Update preparation status'],
  tables: ['Tables', 'See which tables are free'],
  billing: ['Billing & Receipts', 'Bill delivered orders and review history'],
};
const VIEWS = { dashboard: dash, menu: () => { Menu.render(); Cart.render(); }, orders: Orders.render, kitchen: Kitchen.render, tables: Tables.render, billing: Orders.billing };

function dash() {
  const c = s => S.orders.filter(o => o.status === s).length;
  const occ = new Set(active().map(o => o.table)).size, n = S.tables.length || 15;
  const rev = S.orders.filter(o => o.status === 'Completed').reduce((a, o) => a + o.total, 0);
  const recent = S.orders.slice(-5).reverse().map(o => `<div class="row"><span><b>Table ${o.table}</b> <small>Order ${oid(o)}</small></span><span class="badge ${o.status}">${o.status}</span><b>${inr(o.total)}</b></div>`).join('') || '<p class="empty">No orders yet.</p>';
  $('#v-dashboard').innerHTML = `<div class="stats">${[['🧾', 'Total orders', S.orders.length, ''], ['⏳', 'Pending', c('Pending'), 'warn'], ['🔔', 'Ready', c('Ready'), 'ok'], ['✅', 'Completed', c('Completed'), 'info']]
    .map(([i, l, v, k]) => `<div class="card stat ${k}"><span>${i}</span><b>${v}</b><small>${l}</small></div>`).join('')}</div>
    <div class="two"><div class="card"><h3>Tables</h3><div class="meter"><i style="width:${occ / n * 100}%"></i></div>
      <p>${n - occ} available, ${occ} occupied</p><h3 style="margin-top:18px">Sales so far</h3><p class="num">${inr(rev)}</p>
      <button class="btn" data-view="menu">New order</button></div>
    <div class="card"><h3>Recent orders</h3>${recent}</div></div>`;
}

function draw() {
  VIEWS[S.view]();
  $('#nOrders').textContent = active().length || '';
}

function go(v) {
  S.view = v;
  document.querySelectorAll('.view').forEach(e => e.hidden = e.id !== 'v-' + v);
  document.querySelectorAll('.side [data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === v));
  [$('#title').textContent, $('#sub').textContent] = PAGES[v];
  draw();
}

async function refresh() {
  [S.menu, S.orders, S.tables, S.cats] = await Promise.all(['menu', 'orders', 'tables', 'categories'].map(c => Api.get('/' + c)));
  draw();
}

function toast(msg, type = 'ok') {
  const t = $('#toast');
  t.textContent = msg; t.className = 'show ' + type;
  clearTimeout(toast.id);
  toast.id = setTimeout(() => t.className = '', 2800);
}

Api.onOffline = () => {
  const b = $('#banner');
  b.hidden = false;
  b.innerHTML = 'Can’t reach the JSON Server at localhost:3000, so you’re seeing demo data saved in this browser. <button class="link" data-act="retry">Retry connection</button>';
};
Api.onOnline = () => $('#banner').hidden = true;

const ACT = {
  add: id => Cart.add(id), inc: id => Cart.change(id, 1), dec: id => Cart.change(id, -1), del: id => Cart.remove(id), clear: () => Cart.remove(),
  table: id => { S.table = S.table == id ? null : +id; Cart.render(); },
  place: () => Cart.place(),
  cat: (_, v) => { S.cat = v; Menu.render(); },
  status: id => Kitchen.advance(id),
  bill: id => Orders.receipt(id), complete: id => Orders.complete(id),
  print: () => window.print(), close: () => $('#receipt').close(),
  retry: () => { Api.retry(); refresh(); },
  tbl: id => { if (active().some(o => o.table == id)) return go('orders'); S.table = +id; go('menu'); },
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-view]');
  if (!t) return;
  if (t.dataset.view) return go(t.dataset.view);
  ACT[t.dataset.act]?.(t.dataset.id, t.dataset.v);
});
$('#search').addEventListener('input', e => { S.q = e.target.value.trim().toLowerCase(); Menu.render(); });

const tick = () => $('#clock').textContent = new Date().toLocaleString([], { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
tick(); setInterval(tick, 30000);
setInterval(() => S.view !== 'menu' && refresh(), 5000); // keeps kitchen and orders in sync

go('dashboard');
refresh();
