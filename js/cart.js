/* QuickServe | cart, table selection and order placement */
const Cart = {
  busy: false,
  total: () => S.cart.reduce((a, l) => a + l.price * l.qty, 0),

  add(id) {
    const m = S.menu.find(x => x.id == id);
    if (!m || !m.available) return toast('That item is sold out', 'err');
    const l = S.cart.find(x => x.id == m.id);
    l ? l.qty++ : S.cart.push({ id: m.id, name: m.name, price: m.price, qty: 1 });
    Menu.render(); Cart.render();
  },
  change(id, d) {
    const l = S.cart.find(x => x.id == id);
    if (!l) return;
    l.qty += d;
    if (l.qty < 1) S.cart = S.cart.filter(x => x !== l);
    Menu.render(); Cart.render();
  },
  remove(id) { S.cart = id ? S.cart.filter(x => x.id != id) : []; Menu.render(); Cart.render(); },

  render() {
    const busy = new Set(active().map(o => o.table));
    const n = S.cart.reduce((a, l) => a + l.qty, 0), total = Cart.total();
    $('#cart').innerHTML = `<h3>Current order <span class="pill">${n}</span></h3>
      ${S.cart.map(l => `<div class="line"><div><b>${l.name}</b><small>${inr(l.price)} each</small></div>
        <div class="qty"><button data-act="dec" data-id="${l.id}" aria-label="Decrease">−</button><span>${l.qty}</span><button data-act="inc" data-id="${l.id}" aria-label="Increase">+</button></div>
        <b>${inr(l.price * l.qty)}</b><button class="x" data-act="del" data-id="${l.id}" aria-label="Remove">✕</button></div>`).join('')
        || '<p class="empty">Your cart is empty.<br>Tap Add on any item to start.</p>'}
      <h4>Table</h4>
      <div class="picker">${S.tables.map(t => `<button class="${S.table == t.id ? 'sel' : ''}" ${busy.has(t.id) ? 'disabled' : ''} data-act="table" data-id="${t.id}">${t.id}</button>`).join('')}</div>
      <div class="total"><span>Total</span><b>${inr(total)}</b></div>
      <button class="btn big" data-act="place">Place order</button>
      ${n ? '<p class="empty" style="padding:8px 0 0"><button class="link" data-act="clear">Clear cart</button></p>' : ''}`;
    const f = $('#fab');
    f.hidden = !n;
    f.textContent = `🛒 ${n} item${n > 1 ? 's' : ''}, ${inr(total)}`;
  },

  async place() {
    if (Cart.busy) return;
    if (!S.cart.length) return toast('Your cart is empty. Add items before placing the order.', 'err');
    if (!S.table) return toast('Choose a table for this order.', 'err');
    Cart.busy = true;
    const order = { table: S.table, status: 'Pending', items: S.cart.map(l => ({ ...l })), total: Cart.total(), createdAt: new Date().toISOString() };
    try {
      await Api.post('/orders', order);
      toast(`Order sent to the kitchen for Table ${order.table}`);
      S.cart = []; S.table = null;
      await refresh();
    } catch { toast('Could not place the order. Check the connection and try again.', 'err'); }
    Cart.busy = false;
  },
};
