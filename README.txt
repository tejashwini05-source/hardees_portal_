HARDEE'S PORTAL

The existing public pages and dashboards now use Vercel Node.js API functions
and MongoDB for authentication and persistent portal data. The public design
and existing dashboard workflows are retained.

LOCAL DEVELOPMENT

1. Install dependencies:
   npm install

2. Set these values in the root .env or .env.local file:
   MONGODB_URI       MongoDB connection string for the application database
   MONGODB_DB_NAME   Optional database name; defaults to hardees_portal
   JWT_SECRET        Random secret with at least 32 bytes
   APP_TIMEZONE      Restaurant time zone; defaults to America/New_York

   If both files exist, .env.local overrides .env. Both files are ignored by
   Git. Keep .env.example as the placeholder-only template.

   For Atlas, MONGODB_URI must be the full driver connection string, beginning
   with `mongodb+srv://` or `mongodb://`. URL-encode special characters in the
   database username and password. Do not share or commit the actual URI.

   Generate a JWT secret with:
   node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"

3. Use a MongoDB user limited to the application's database. Configure Atlas
   network access so the local machine and Vercel deployment can connect.

4. Bootstrap the first administrator and seed the existing default menu:
   Set ADMIN_ID and ADMIN_PASSWORD in .env or .env.local. The password must be
   at least 12 characters. Then run:
   npm run provision:admin

   This command creates an administrator only if that ID does not already
   exist. It does not create demo users or overwrite an existing password.
   ADMIN_ID and ADMIN_PASSWORD are bootstrap-only values; do not put them in
   Vercel's production environment after provisioning.

   To validate the Atlas URI and run a read-only ping without printing secrets
   or changing database records, run:
   npm run check:mongodb

5. Run the website with its API functions:
   npm run dev

   The command starts Vercel's local function runtime without requiring a
   linked Vercel project or login, and loads the environment from .env and
   .env.local. Open the URL printed by the command (normally
   http://localhost:3000). `npm run dev:vercel` is an equivalent explicit
   command. The API functions are required for menu data and dashboard
   workflows; a Vite-only server cannot serve the `/api` routes.

   On Windows, if the Vercel CLI reports EPERM while creating symlinks in its
   local cache, enable Windows Developer Mode or use a terminal account with
   permission to create symlinks, then retry.

TEST AND BUILD

   npm test
   npm run build

The tests cover authentication primitives, request validation, security
headers, and API responses when MongoDB is not configured. The local MongoDB
connection check must succeed before the menu or sign-in can use Atlas.
Production Vercel deployment has not been tested.

VERCEL DEPLOYMENT

1. Import the project into Vercel. The checked-in vercel.json configures the
   Vite build command and `dist` output directory. The `api/` directory
   contains Node.js serverless functions.
2. Set MONGODB_URI and JWT_SECRET in Vercel for Production, Preview, and
   Development environments as appropriate. Set MONGODB_DB_NAME only if using
   a database name other than `hardees_portal`; set APP_TIMEZONE to the
   restaurant's IANA time zone if it differs from the default.
3. Use Node.js 22.12 or newer. The package manifest declares this requirement.
4. Provision the initial administrator and seed the default menu from a
   trusted machine with database access before staff sign-in is enabled.

AUTHENTICATION AND SECURITY

- Staff and admin accounts are stored in MongoDB. There are no built-in
  credentials; the first admin is created by the provisioning command.
- Passwords are hashed with bcrypt. Passwords are never returned by API
  responses.
- Authentication uses a signed, HttpOnly, SameSite=Lax cookie. Production
  cookies use Secure; sessions last 8 hours, or 30 days when Remember Me is
  selected. Logout and password/status changes invalidate existing sessions.
- Login attempts are limited per account and source address. Rate-limit keys
  are HMAC-hashed before storage.
- Write requests are same-origin checked. API responses set no-store and
  standard security headers.
- Browser localStorage and sessionStorage are not used for authentication or
  persistent application records.

MONGODB COLLECTIONS

- users: staff and admin profiles, password hashes, roles, and session versions
- menuitems: public menu catalog and admin-edited menu items
- promotions: coupon details and active dates
- attendances: check-in/check-out records by staff member and restaurant day
- orders: order snapshots and status workflow
- notifications: persisted admin notifications and read state
- reviews: review records, admin replies, and complaint status
- loginratelimits: short-lived, hashed login rate-limit buckets

API ROUTES

Authentication:
- POST /api/auth/login
- GET /api/auth/me
- POST /api/auth/logout

Public data:
- GET /api/menu
- GET /api/promotions (enabled offers that are currently valid)

Administrator routes require an active admin session:
- GET, POST /api/admin/menu; PATCH, DELETE /api/admin/menu/:id
- GET, POST /api/admin/promotions; PATCH, DELETE /api/admin/promotions/:id
- GET, POST /api/staff; PATCH /api/staff/:staffId
- GET, POST /api/orders; PATCH /api/orders/:id
- GET, POST /api/notifications; PATCH /api/notifications/:id
- POST /api/notifications/read-all
- GET, POST /api/reviews; PATCH /api/reviews/:id

Staff attendance:
- GET /api/attendance (current staff member's records)
- POST /api/attendance with action `check-in` or `check-out`
- Admins may request attendance for a staff ID.

DATA AND INTEGRATIONS

The default six-item menu is seeded from data/default-menu.js by the admin
provisioning command. Promotions, staff, orders, notifications, and reviews
start empty. Existing per-browser demo records are not automatically imported;
the requested migration behavior is to seed defaults and start other
collections clean.

The current site does not include a public checkout/order-entry flow, payment
processor, POS/ordering-provider connection, reservation service, payroll
provider, or review-platform connection. Admin order, notification, and review
APIs are available for authorized portal workflows and future integrations;
they do not simulate payment, publish reviews, or receive third-party events
without those integrations.
