# FoodOrderingSite Backend

Node.js + Express + MongoDB Atlas backend using JavaScript ES modules and an MVC structure.

## 1. Install

```bash
npm install
```

Copy `.env.example` to `.env`, then update the values.

## 2. MongoDB Atlas

1. Create a cluster in MongoDB Atlas.
2. Create a database user with a strong password.
3. In **Network Access**, allow your current IP address. Avoid leaving `0.0.0.0/0` enabled permanently.
4. Copy the Node.js connection string and place it in `MONGO_URI`.
5. Replace the username, password, and cluster placeholder. URL-encode special characters in the database password if needed.
6. Keep `.env` private; do not commit it.

## 3. Configure environment

- `CLIENT_URL`: frontend origin, e.g. `http://localhost:5173`. For multiple origins, separate URLs with commas.
- `JWT_SECRET`: a long, random secret of at least 32 characters.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: initial admin credentials. Change the example password before creating the admin.

Rename `.env.example` to `.env` (or copy it to `.env`) and fill in real values.

## 4. Create first admin

```bash
node scripts/createAdmin.js
```

The script creates the admin only if that email does not already exist.

## 5. Start server

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## API endpoints

Public:
- `GET /api/categories`
- `GET /api/menu`
- `GET /api/menu?category=<categoryId>`
- `GET /api/menu?search=pizza`
- `GET /api/menu?featured=true`
- `GET /api/menu/:id`
- `POST /api/orders` (place table or takeaway order)
- `POST /api/auth/login`

Admin only (send `Authorization: Bearer <token>`):
- `GET /api/auth/me`
- `GET /api/categories?all=true`
- `POST /api/categories`
- `PATCH /api/categories/:id`
- `DELETE /api/categories/:id` (soft-deactivate)
- `GET /api/menu?all=true`
- `POST /api/menu`
- `PATCH /api/menu/:id`
- `DELETE /api/menu/:id` (marks unavailable)
- `GET /api/orders?page=1&limit=20`
- `GET /api/orders?status=pending&orderType=table`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id`

## Example: create category (admin)

```json
{
  "name": "Burgers",
  "description": "Freshly prepared burgers",
  "image": "https://example.com/burgers.jpg"
}
```

## Example: create menu item (admin)

```json
{
  "name": "Classic Burger",
  "description": "Burger with fresh vegetables",
  "price": 199,
  "category": "PASTE_CATEGORY_OBJECT_ID",
  "image": "https://example.com/burger.jpg",
  "foodType": "non-veg",
  "isAvailable": true,
  "isFeatured": false
}
```

## Example: place a table order

```json
{
  "orderType": "table",
  "tableNumber": 12,
  "items": [
    { "menuItem": "PASTE_MENU_ITEM_OBJECT_ID", "quantity": 2 }
  ],
  "notes": "No onions"
}
```

For takeaway, set `"orderType": "takeaway"` and omit `tableNumber`. `items` only needs menu item IDs and quantities. The backend looks up current prices from MongoDB; never trust prices supplied by the browser.

## Important production notes

- Admin login is a starter email/password flow; add password reset, audit logging, and account lockout before production.
- Customer order lookup is intentionally not public. A safe customer order-tracking flow should use a separate unguessable tracking token or authenticated customer account.
- This starter records payment status only; it does not process payments. Integrate a payment provider before accepting online payments.
- Image fields accept URLs. Add validated file uploads/storage separately if required.
- Add restaurant-specific table validation (registered table IDs/QR tokens) before production. A numeric table number alone is not proof that the customer is physically at that table.
- Validate and test all APIs before deploying.
