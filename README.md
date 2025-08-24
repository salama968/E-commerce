# E-commerce API (Node.js + Express + Mongoose)

## Quick start

- Requirements: Node.js 18+ and a MongoDB Atlas connection string
- Configure env in `config.env`:
  - DATABASE=mongodb+srv://<user>:<pass>@.../...
  - DATABASE_PASSWORD=...
  - JWT_SECRET=...
  - EMAIL=your_gmail@gmail.com (optional)
  - EMAIL_PASSWORD=app_password (optional Gmail App Password)
  - PORT=3000 (optional)
- Install and run:
  - npm install
  - npm run dev

## Project structure

- `server.js` — loads env, connects DB, starts server
- `src/app.js` — Express app and route registration
- `src/controllers/` — route handlers
  - `userController.js`, `productController.js`, `cartController.js`, `orderController.js`
- `src/models/` — Mongoose models
  - `userModel.js`, `productModel.js`, `orderModel.js`
- `src/routes/` — routers for domains
  - `userRoute.js`, `productRoute.js`, `cartRoute.js`, `orderRoute.js`
- `src/utils/` — helpers
  - `auth.js` (JWT auth), `validateRole.js` (admin check), `sendEmail.js`

## Conventions

- JSON only. Use `Content-Type: application/json`.
- Auth with `Authorization: Bearer <JWT>` for protected endpoints.
- Admin-only endpoints use `validateRole('admin')`.

## Endpoints

### Auth & Users

- POST `/api/v1/auth/register` — Register user; returns JWT. Sends verification email.
- POST `/api/v1/auth/login` — Login; returns JWT. If unverified, resends verification email.
- GET `/api/v1/users/me` — Get current user (auth).
- DELETE `/api/v1/users/delete` — Delete current user (auth).
- GET `/api/v1/verify/:email` — Verify account using tokenized email link.

### Products

- GET `/api/v1/products` — List products.
- GET `/api/v1/products/:id` — Get product by id.
- POST `/api/v1/products` — Create product (auth + admin).
- PUT `/api/v1/products/:id` — Update product (auth + admin).
- DELETE `/api/v1/products/:id` — Delete product (auth + admin).

### Cart (auth)

- GET `/api/v1/cart` — Get current cart; returns items, subtotal, itemsCount.
- POST `/api/v1/cart` — Add item: `{ productID, quantity }`.
- PUT `/api/v1/cart` — Update quantity: `{ productID, quantity }` (0 removes item).
- DELETE `/api/v1/cart/remove` — Remove item: `{ productID }`.
- DELETE `/api/v1/cart` — Empty cart.

### Orders (auth)

- POST `/api/v1/orders` — Create order from cart. Body: `{ shippingAddress, paymentMethod }`.
- GET `/api/v1/orders` — List orders (user sees own; admin sees all).
- GET `/api/v1/orders/:id` — Get order by id (owner or admin).

## Notes

- Email sending uses Gmail (EMAIL/EMAIL_PASSWORD) or falls back to Ethereal in dev and prints a preview URL in console.
- DB connection errors and unhandled rejections are logged; server exits on fatal DB errors.
- Timestamps are enabled on models; IDs are MongoDB ObjectIds.

## Scripts

- `npm run dev` — Start with nodemon.
- `npm start` — Start server.
