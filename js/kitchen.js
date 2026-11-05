/* QuickServe | kitchen display: incoming orders and status updates */
const Kitchen = {
  render() {
    const icon = { Pending: '⏳', Preparing: '🔥', Ready: '🔔' };
    $('#v-kitchen').innerHTML = `<div class="board">${STATUS.slice(0, 3).map(s => {
      const list = S.orders.filter(o => o.status === s);
      return `<div class="col"><h3>${icon[s]} ${s} <span class="pill">${list.length}</span></h3>${list.map(o => `
        <div class="card tk ${s}"><div class="row"><b>Table ${o.table}</b><small>Order ${oid(o)}, ${at(o)}</small></div>
        <ul>${o.items.map(i => `<li><span>${i.name}</span><b>× ${i.qty}</b></li>`).join('')}</ul>
        <button class="btn" data-act="status" data-id="${o.id}">${NEXT[s]}</button></div>`).join('') || '<p class="empty">Nothing here.</p>'}</div>`;
    }).join('')}</div>`;
  },

  async advance(id) {
    const o = S.orders.find(x => x.id == id), next = o && STATUS[STATUS.indexOf(o.status) + 1];
    if (!next) return;
    try {
      await Api.patch('/orders/' + id, { status: next });
      toast(`Table ${o.table} is now ${next}`);
      refresh();
    } catch { toast('Status was not updated. Try again.', 'err'); }
  },
};
