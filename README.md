# QuickServe: Café Ordering & Management System

A web app for small cafés: take orders, send them to the kitchen, track tables and print bills.
Built with HTML5, CSS3, JavaScript, AJAX (fetch) and JSON. No login (out of scope for v1).

## Run it

**Option A: just open `index.html`.** If the mock API is not running, the app shows a banner and uses demo data stored in your browser, so everything still works.

**Option B: with the mock REST API (JSON Server).**
```
npx json-server@0.17.4 --watch data/db.json --port 3000
```
Then open `index.html` (or serve the folder with VS Code Live Server). Orders and status changes are saved to `data/db.json`.

## Modules
Dashboard, Menu, Order (cart + table 1 to 15), Kitchen, Tables, Billing & Receipt.

Flow: Menu, add items, select table, place order, Kitchen (Pending, Preparing, Ready, Delivered), Billing, Complete order.

## Folder structure
```
index.html   css/style.css   data/db.json   assets/
js/ api.js (fetch + offline fallback)  app.js (state, navigation, dashboard)
    menu.js  cart.js  orders.js (orders + billing)  kitchen.js  tables.js
```

## Test checklist
1. Place an order with several items: all appear in Active Orders.
2. Change quantities in the cart: the total updates.
3. Place an empty order: a message blocks it.
4. Order for two tables: each shows on the right table.
5. Kitchen buttons move status Pending, Preparing, Ready, Delivered.
6. Stop JSON Server: a banner with Retry appears.

Currency is ₹, tax and service charge are 0 for the demo.
