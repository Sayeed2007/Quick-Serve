/* QuickServe | API layer (AJAX with fetch).
   Talks to JSON Server at localhost:3000. If the server is down, it shows a banner
   with a Retry button and falls back to demo data kept in the browser, so the app still works. */
const SEED = {"categories":[{"id":1,"name":"Coffee","icon":"☕"},{"id":2,"name":"Tea","icon":"🍵"},{"id":3,"name":"Snacks","icon":"🥪"},{"id":4,"name":"Meals","icon":"🍕"},{"id":5,"name":"Desserts","icon":"🍰"}],"menu":[{"id":1,"name":"Espresso","category":"Coffee","price":120,"available":true,"emoji":"☕"},{"id":2,"name":"Cappuccino","category":"Coffee","price":160,"available":true,"emoji":"☕"},{"id":3,"name":"Café Latte","category":"Coffee","price":180,"available":true,"emoji":"🥛"},{"id":4,"name":"Cold Coffee","category":"Coffee","price":190,"available":true,"emoji":"🧋"},{"id":5,"name":"Masala Chai","category":"Tea","price":80,"available":true,"emoji":"🫖"},{"id":6,"name":"Green Tea","category":"Tea","price":100,"available":true,"emoji":"🍵"},{"id":7,"name":"Iced Lemon Tea","category":"Tea","price":120,"available":true,"emoji":"🍹"},{"id":8,"name":"Veg Sandwich","category":"Snacks","price":140,"available":true,"emoji":"🥪"},{"id":9,"name":"French Fries","category":"Snacks","price":120,"available":true,"emoji":"🍟"},{"id":10,"name":"Veg Burger","category":"Snacks","price":170,"available":true,"emoji":"🍔"},{"id":11,"name":"Paneer Wrap","category":"Snacks","price":190,"available":true,"emoji":"🌯"},{"id":12,"name":"Margherita Pizza","category":"Meals","price":280,"available":true,"emoji":"🍕"},{"id":13,"name":"Pasta Alfredo","category":"Meals","price":260,"available":true,"emoji":"🍝"},{"id":14,"name":"Brownie","category":"Desserts","price":130,"available":true,"emoji":"🍫"},{"id":15,"name":"Cheesecake","category":"Desserts","price":190,"available":false,"emoji":"🍰"},{"id":16,"name":"Choco Lava Cake","category":"Desserts","price":160,"available":true,"emoji":"🧁"}],"tables":[{"id":1,"seats":2},{"id":2,"seats":2},{"id":3,"seats":2},{"id":4,"seats":4},{"id":5,"seats":4},{"id":6,"seats":4},{"id":7,"seats":4},{"id":8,"seats":4},{"id":9,"seats":4},{"id":10,"seats":6},{"id":11,"seats":6},{"id":12,"seats":6},{"id":13,"seats":6},{"id":14,"seats":8},{"id":15,"seats":8}],"orders":[{"id":1,"table":3,"status":"Pending","total":460,"createdAt":"2026-11-05T09:10:00","items":[{"id":2,"name":"Cappuccino","price":160,"qty":2},{"id":8,"name":"Veg Sandwich","price":140,"qty":1}]},{"id":2,"table":7,"status":"Preparing","total":520,"createdAt":"2026-11-05T09:22:00","items":[{"id":12,"name":"Margherita Pizza","price":280,"qty":1},{"id":7,"name":"Iced Lemon Tea","price":120,"qty":2}]},{"id":3,"table":2,"status":"Completed","total":280,"createdAt":"2026-11-05T08:40:00","items":[{"id":5,"name":"Masala Chai","price":80,"qty":2},{"id":9,"name":"French Fries","price":120,"qty":1}]}]};

const Api = (() => {
  const BASE = 'http://localhost:3000';
  let offline = ! 
     ['localhost','127.0.0.1].includes(location.hostname), mem = null;

  const read = () => {
    try { mem = JSON.parse(localStorage.getItem('qs_db')) || mem; } catch {}
    return mem || (mem = structuredClone(SEED));
  };
  const write = db => { mem = db; try { localStorage.setItem('qs_db', JSON.stringify(db)); } catch {} };

  // Tiny REST emulation: GET /col, GET /col/id, POST /col, PATCH /col/id
  const local = (method, path, body) => {
    const db = read(), [, col, id] = path.split('/'), list = db[col];
    let res = list;
    if (method === 'GET' && id) res = list.find(x => x.id == id);
    if (method === 'POST') { res = { ...body, id: Math.max(0, ...list.map(x => x.id)) + 1 }; list.push(res); }
    if (method === 'PATCH') res = Object.assign(list.find(x => x.id == id), body);
    write(db);
    return structuredClone(res);
  };

  async function request(method, path, body) {
    if (!offline) {
      try {
        const r = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json' }, body: body && JSON.stringify(body) });
        if (!r.ok) throw new Error(r.status);
        Api.onOnline?.();
        return await r.json();
      } catch { offline = true; Api.onOffline?.(); }
    }
    await new Promise(r => setTimeout(r, 120)); // simulated latency
    return local(method, path, body);
  }

  return {
    get: p => request('GET', p),
    post: (p, b) => request('POST', p, b),
    patch: (p, b) => request('PATCH', p, b),
    retry() { offline = false; },
    onOffline: null, onOnline: null,
  };
})();
