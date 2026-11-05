/* QuickServe | menu browsing: categories, search, availability */
const Menu = {
  render() {
    const cats = [{ name: 'All', icon: '🍽️' }, ...S.cats];
    $('#chips').innerHTML = cats.map(c => `<button class="chip ${c.name === S.cat ? 'on' : ''}" data-act="cat" data-v="${c.name}">${c.icon} ${c.name}</button>`).join('');
    const list = S.menu.filter(m => (S.cat === 'All' || m.category === S.cat) && m.name.toLowerCase().includes(S.q));
    $('#items').innerHTML = list.map(m => {
      const q = (S.cart.find(l => l.id == m.id) || {}).qty;
      return `<article class="card item ${m.available ? '' : 'off'}"><div class="emo">${m.emoji}</div><h4>${m.name}</h4><small>${m.category}</small>
        <div class="row"><b>${inr(m.price)}</b>${m.available
          ? `<button class="btn sm" data-act="add" data-id="${m.id}">${q ? 'Add (' + q + ')' : 'Add'}</button>`
          : '<span class="badge">Sold out</span>'}</div></article>`;
    }).join('') || '<p class="empty">No items match your search.</p>';
  },
};
