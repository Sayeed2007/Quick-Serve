/* QuickServe | active orders, billing and printable receipts */
const Orders = {
  render() {
    const list = active().slice().reverse();
    $('#v-orders').innerHTML = list.length ? `<div class="grid wide">${list.map(o => `
      <article class="card order">
        <div class="row"><h3>Table ${o.table}</h3><span class="badge ${o.status}">${o.status}</span></div>
        <small>Order ${oid(o)}, ${at(o)}</small>
        <div class="steps">${STATUS.map((s, i) => `<i class="${i <= STATUS.indexOf(o.status) ? 'done' : ''}" title="${s}"></i>`).join('')}</div>
        <ul>${o.items.map(i => `<li><span>${i.qty}× ${i.name}</span><span>${inr(i.price * i.qty)}</span></li>`).join('')}</ul>
        <div class="row"><b>${inr(o.total)}</b>${o.status === 'Delivered'
          ? `<button class="btn sm" data-act="bill" data-id="${o.id}">Open bill</button>` : '<small>In progress</small>'}</div>
      </article>`).join('')}</div>`
      : '<div class="empty">🍃<p>No active orders right now.</p><br><button class="btn" data-view="menu">Take an order</button></div>';
  },

  billing() {
    const due = S.orders.filter(o => o.status === 'Delivered');
    const done = S.orders.filter(o => o.status === 'Completed').reverse();
    const row = (o, label, cls) => `<div class="card row"><div><b>Table ${o.table}</b> <small>Order ${oid(o)}, ${at(o)}</small></div><b>${inr(o.total)}</b><button class="btn sm ${cls}" data-act="bill" data-id="${o.id}">${label}</button></div>`;
    $('#v-billing').innerHTML = `<h3 class="sec">Ready to bill (${due.length})</h3>${due.map(o => row(o, 'Open bill', '')).join('') || '<p class="empty">Delivered orders will show up here.</p>'}
      <h3 class="sec">Completed orders (${done.length})</h3>${done.map(o => row(o, 'View receipt', 'ghost')).join('') || '<p class="empty">No completed orders yet.</p>'}`;
  },

  receipt(id) {
    const o = S.orders.find(x => x.id == id);
    if (!o) return;
    $('#receipt').innerHTML = `<div class="rcpt"><h2>☕ QuickServe</h2>
      <p class="c">Receipt ${oid(o)}, Table ${o.table}<br>${new Date(o.createdAt).toLocaleString()}</p>
      <table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr>${o.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${inr(i.price)}</td><td>${inr(i.price * i.qty)}</td></tr>`).join('')}</table>
      <div class="row"><span>Subtotal</span><span>${inr(o.total)}</span></div>
      <div class="row"><span>Tax and service charge</span><span>${inr(0)}</span></div>
      <div class="row grand"><span>Total</span><span>${inr(o.total)}</span></div>
      <p class="c">Thank you for visiting!</p>
      <div class="row noprint"><button class="btn ghost sm" data-act="close">Close</button><button class="btn ghost sm" data-act="print">🖨️ Print</button>
      ${o.status === 'Delivered' ? `<button class="btn sm" data-act="complete" data-id="${o.id}">Complete order</button>` : ''}</div></div>`;
    $('#receipt').showModal();
  },

  async complete(id) {
    try {
      await Api.patch('/orders/' + id, { status: 'Completed' });
      $('#receipt').close();
      toast('Order completed. The table is free again.');
      refresh();
    } catch { toast('Could not complete the order. Try again.', 'err'); }
  },
};
