# BoroBazar Grocery Store — Backend

REST API for **BoroBazar**, an online grocery store. It powers the customer store (browse products, cart, checkout, order tracking, reviews) and the admin dashboard (products, categories, orders, flash sales and store stats).

- **Live API:** https://grocery-store-server-orpin.vercel.app/api
- **Frontend:** BoroBazar (Next.js), which talks to this API through `BACKEND_URL`

## Features

- **Auth:** sign up, log in, Google login, access and refresh tokens (JWT), change, forgot and reset password by email. Two roles: `user` and `admin`.
- **Products:** create, edit and soft delete, with search, filter, sort and pagination. Includes variations (e.g. weight), stock and ratings.
- **Categories:** categories with sub categories and images.
- **Flash sales:** put products on a timed discount with an optional unit limit. Every past sale is kept as history.
- **Orders (bookings):** prices and totals are worked out on the server, and stock is reserved when an order is placed and given back when it is cancelled. Status goes `pending → confirmed → shipped → delivered`, or `cancelled`. Customers get an email when an order is placed and on each status change.
- **Reviews:** only a customer whose order with the product was delivered can review it, once, with 1–5 stars. The product keeps its average rating.
- **Dashboard stats:** one admin endpoint that returns revenue, order counts, customers, products per category, low stock products and the latest orders.

## Tech stack

| Part          | Tool                                                     |
| ------------- | -------------------------------------------------------- |
| Runtime       | Node.js 24                                               |
| Language      | TypeScript                                               |
| Web framework | Express 4                                                |
| Database      | MongoDB with Mongoose 8                                  |
| Validation    | Zod                                                      |
| Auth          | JSON Web Tokens (`jsonwebtoken`), `bcrypt` for passwords |
| Email         | Nodemailer (SMTP, e.g. a Gmail app password)             |
| Dev tools     | ts-node-dev, ESLint, Prettier                            |
| Hosting       | Vercel (`@vercel/node`)                                  |

## Folder structure

```
src/
├── server.ts                 # starts the app: connects to MongoDB, then listens (not on Vercel)
├── app.ts                    # Express app: CORS, JSON body, /api routes, error handlers
└── app/
    ├── config/
    │   ├── index.ts          # reads every value from .env
    │   └── db.ts             # one shared MongoDB connection
    ├── routes/index.ts       # mounts every module under /api
    ├── builder/
    │   └── QueryBuilder.ts   # search, filter, sort, paginate and pick fields from the query string
    ├── middleware/
    │   ├── auth.ts           # checks the JWT and the user's role
    │   ├── validateRequest.ts# validates the request with a Zod schema
    │   ├── gobleErrorhandler.ts
    │   └── Notfound.ts
    ├── error/                # AppError and handlers for Zod, cast and duplicate key errors
    ├── utils/                # catchAsync, sendResponse, jwt, sendEmail, emailTemplates
    └── modules/              # one folder per feature
        ├── user/             # auth and accounts
        ├── Products/
        ├── Category/
        ├── FlashSale/        # flash sale history
        ├── Booking/          # orders, stock, order emails
        ├── review/
        └── Stats/            # admin dashboard numbers
```

Each module follows the same pattern:

| File              | What it holds                                            |
| ----------------- | -------------------------------------------------------- |
| `*.interface.ts`  | TypeScript types                                         |
| `*.model.ts`      | Mongoose schema and model                                |
| `*.validation.ts` | Zod schemas for request bodies                           |
| `*.service.ts`    | Database work and business rules                         |
| `*.controller.ts` | Reads the request, calls the service, sends the response |
| `*.routes.ts`     | URLs, auth and validation for the module                 |
| `*.constant.ts`   | Fixed values (statuses, searchable fields, limits)       |

## API

All routes start with `/api`. Protected routes need the header `Authorization: Bearer <accessToken>`.

Every response has the same shape:

```json
{
  "success": true,
  "message": "...",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 },
  "data": {}
}
```

`meta` is only sent by paginated lists. Lists accept `searchTerm`, `sort` (e.g. `-createdAt`), `page`, `limit` and `fields` in the query string, and any other key is used as a filter.

| Module      | Base path          | Main routes                                                                                                                                                                                              |
| ----------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth        | `/api/auth`        | `POST /signup`, `POST /login`, `POST /googleUser`, `POST /refresh-token`, `GET /me`, `POST /change`, `POST /change-password`, `POST /forget-password`, `POST /reset-password`, `POST /makeadmin` (admin) |
| Products    | `/api/product`     | `GET /`, `GET /:id`, `GET /flash-sale`; admin: `POST /`, `PUT /:id`, `DELETE /:id`, `POST /flash-sale`, `DELETE /:id/flash-sale`                                                                         |
| Categories  | `/api/categories`  | `GET /`, `GET /:slug`; admin: `POST /`, `PATCH /:id`, `DELETE /:id`                                                                                                                                      |
| Flash sales | `/api/flash-sales` | admin: `GET /history`, `GET /products/:id/summary`                                                                                                                                                       |
| Orders      | `/api/bookings`    | user: `POST /`, `GET /user`, `GET /totalbuy`, `PATCH /:id/cancel`; admin: `GET /`, `GET /total-sale`, `PATCH /:id/status`, `PUT /:id` (mark delivered); both: `GET /:id`                                 |
| Reviews     | `/api/reviews`     | `GET /:productId`; user: `GET /:productId/eligibility`, `POST /`                                                                                                                                         |
| Stats       | `/api/stats`       | admin: `GET /admin`                                                                                                                                                                                      |

## Run it locally

### 1. Install the requirements

- [Node.js 24](https://nodejs.org/)
- A MongoDB database: a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster, or MongoDB on your machine

### 2. Get the code and install packages

```bash
git clone https://github.com/emonahmed123/grocery-shop-server.git
cd grocery-shop-server
npm install
```

### 3. Create the `.env` file

```bash
cp .env.example .env
```

Open `.env` and fill in the values. You need at least these to start:

| Variable                                          | What to put                    |
| ------------------------------------------------- | ------------------------------ |
| `DATABASE_URL`                                    | Your MongoDB connection string |
| `PORT`                                            | Port to listen on, e.g. `5000` |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`         | Two long random strings        |
| `JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN` | e.g. `1d` and `30d`            |
| `BCRYPT_SALT_ROUNDS`                              | e.g. `12`                      |

The `SMTP_*`, `EMAIL_FROM`, `RESET_PASS_UI_LINK` and `CLIENT_URL` values are only needed for emails (password reset and order updates). Without them the API still runs; order emails fail quietly (the error is only logged). `STORE_ID`, `SIGNATURE_KEY` and `PAYMENT_URL` are kept for online payment and are not used yet.

### 4. Start the server

```bash
npm run start:dev
```

The server restarts on every change. Open http://localhost:5000 and you should see `Hello World!`. The API is at http://localhost:5000/api.

To make yourself an admin, sign up through `POST /api/auth/signup`, then set `role` to `admin` on your user in the database. After that you can create more admins with `POST /api/auth/makeadmin`.

### Scripts

| Command                             | What it does                                   |
| ----------------------------------- | ---------------------------------------------- |
| `npm run start:dev`                 | Run in development with auto restart           |
| `npm run build`                     | Compile TypeScript to `dist/`                  |
| `npm run start:prod`                | Run the compiled build (`npm run build` first) |
| `npm run lint` / `npm run lint:fix` | Check / fix code with ESLint                   |
| `npm run prettier:fix`              | Format the code with Prettier                  |

## Deploy

The project deploys to Vercel with `vercel.json`. `src/server.ts` exports the Express app, and on Vercel it does not call `listen`. Add the same variables from `.env` in the Vercel project settings.
