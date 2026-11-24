import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
    "index.html",
    "employee-dashboard.html",
    "admin-dashboard.html",
    "css/style.css",
    "css/employee-dashboard.css",
    "css/admin-dashboard.css",
    "public/js/dashboard.js",
    "public/js/admin-dashboard.js",
    "public/js/public-menu.js",
    "public/js/public-promotions.js",
    "data/default-menu.js",
    "api/auth/login.js",
    "api/auth/me.js",
    "api/auth/logout.js",
    "api/menu.js",
    "api/promotions.js",
    "api/staff.js",
    "api/attendance.js",
    "api/orders.js",
    "api/notifications.js",
    "api/reviews.js",
    "api/admin/menu.js",
    "api/admin/promotions.js",
    "models/User.js",
    "models/MenuItem.js",
    "models/Promotion.js",
    "models/Attendance.js",
    "models/Order.js",
    "models/Notification.js",
    "models/Review.js",
    "models/LoginRateLimit.js",
    "lib/db.js",
    "lib/session.js",
    "lib/login-rate-limit.js",
    "scripts/check-mongodb.js",
    "scripts/provision-admin.js",
    ".env.example",
    "vercel.json",
    "vite.config.js",
    "images/gallery-hardees-exterior.png",
    "images/gallery-coffee-bar.png",
    "images/gallery-dining-area.png",
    "images/gallery-hardees-storefront.png",
    "images/gallery-breakfast-combo.png",
    "public/images/menu-burger.jpg",
    "public/images/menu-bacon-burger.jpg",
    "public/images/menu-raisin-biscuit.jpg",
    "public/images/menu-chicken-biscuit.jpg",
    "public/images/menu-smores-coffee.jpg",
    "public/images/menu-brewed-coffee.jpg",
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
    throw new Error(`Missing required files: ${missing.join(", ")}`);
}

const read = (file) => readFileSync(resolve(root, file), "utf8");
const packageJson = JSON.parse(read("package.json"));
const index = read("index.html");
const publicCss = read("css/style.css");
const employeeHtml = read("employee-dashboard.html");
const employeeJs = read("public/js/dashboard.js");
const adminHtml = read("admin-dashboard.html");
const adminJs = read("public/js/admin-dashboard.js");
const publicMenuJs = read("public/js/public-menu.js");
const publicPromotionsJs = read("public/js/public-promotions.js");
const defaultMenu = read("data/default-menu.js");
const mongoDiagnostic = read("scripts/check-mongodb.js");
const session = read("lib/session.js");
const login = read("api/auth/login.js");
const rateLimit = read("lib/login-rate-limit.js");
const projectScripts = [
    index,
    employeeHtml,
    adminHtml,
    employeeJs,
    adminJs,
    publicMenuJs,
    publicPromotionsJs,
].join("\n");
const menuImages = [...defaultMenu.matchAll(/image: "(\/images\/[^"]+)"/g)]
    .map(([, image]) => image.replace("/images/", ""));
const menuImageHashes = menuImages
    .filter((image) => existsSync(resolve(root, "public", "images", image)))
    .map((image) =>
        createHash("sha256")
            .update(readFileSync(resolve(root, "public", "images", image)))
            .digest("hex")
    );

const checks = [
    [
        index.includes('<dialog id="employee-login"') &&
            index.includes('id="portalRole"') &&
            index.includes('class="login-modal-close"') &&
            index.includes('fetch("/api/auth/login"') &&
            index.includes('event.key === "Escape"') &&
            !index.includes("DEMO1001") &&
            !index.includes("Demo@123"),
        "homepage login modal authenticates through the backend without demo credentials",
    ],
    [
        index.includes("loginModal.showModal()") &&
            index.includes("event.target === loginModal") &&
            index.includes("Staff/Admin Portal"),
        "login popup retains role selection, backdrop closing, and existing portal content",
    ],
    [
        !projectScripts.includes("localStorage") &&
            !projectScripts.includes("sessionStorage"),
        "website data and authentication no longer use browser storage",
    ],
    [
        !/(MONGODB_URI|MONGODB_DB_NAME|JWT_SECRET|ADMIN_PASSWORD)/.test(projectScripts),
        "server credentials and secrets are not exposed in frontend files",
    ],
    [
        publicMenuJs.includes('fetch("/api/menu")') &&
            publicMenuJs.includes("Out of Stock") &&
            publicMenuJs.includes('loading="lazy" decoding="async"') &&
            publicMenuJs.includes("npm run dev.") &&
            publicMenuJs.includes(".filter((item) => item.available)") &&
            publicMenuJs.includes(".slice(0, 4)"),
        "public menu loads database records and preserves availability and image behavior",
    ],
    [
        publicPromotionsJs.includes('fetch("/api/promotions")') &&
            publicPromotionsJs.includes("offersSection.hidden = !hasOffers") &&
            publicPromotionsJs.includes("npm run dev:vercel"),
        "public offers load only from the backend and hide when none are active",
    ],
    [
        adminJs.includes("/api/admin/menu") &&
            adminJs.includes("/api/admin/promotions") &&
            adminJs.includes("/api/staff") &&
            adminJs.includes("/api/orders") &&
            adminJs.includes("/api/notifications") &&
            adminJs.includes("/api/reviews"),
        "admin workflows use persistent APIs for menu, offers, staff, orders, alerts, and reviews",
    ],
    [
        adminHtml.includes('name="password"') &&
            adminHtml.includes("minlength=\"12\"") &&
            adminJs.includes("/api/auth/me") &&
            adminJs.includes("/api/auth/logout"),
        "staff account creation requires a password and admin routes verify sessions",
    ],
    [
        employeeJs.includes("/api/auth/me") &&
            employeeJs.includes("/api/attendance") &&
            employeeJs.includes("/api/auth/logout") &&
            employeeHtml.includes('id="attendanceActivity"') &&
            !employeeHtml.includes("DEMO1001"),
        "staff dashboard uses authenticated profile and persistent attendance",
    ],
    [
        session.includes("HttpOnly") &&
            session.includes("SameSite=Lax") &&
            session.includes("Secure") &&
            session.includes("setExpirationTime") &&
            login.includes("verifyPassword") &&
            login.includes("setSessionCookie") &&
            rateLimit.includes("ACCOUNT_LIMIT") &&
            rateLimit.includes("ADDRESS_LIMIT"),
        "authentication uses hashed passwords, HTTP-only sessions, and persistent login throttling",
    ],
    [
        index.includes('<span class="hero-brand-name">HARDEE\'S</span>') &&
            publicCss.includes(".hero-brand-name") &&
            publicCss.includes("background-attachment: scroll") &&
            publicCss.includes("background-size: 100% auto"),
        "welcome-page branding and full-page scrolling background remain intact",
    ],
    [
        index.includes('class="restaurant-gallery-section"') &&
            index.indexOf('class="restaurant-gallery-section"') < index.indexOf('id="careers"') &&
            (index.match(/class="restaurant-gallery-card"/g) || []).length === 5 &&
            ["gallery-hardees-exterior.png", "gallery-coffee-bar.png", "gallery-dining-area.png", "gallery-hardees-storefront.png", "gallery-breakfast-combo.png"].every((image) => index.includes(image)),
        "the five-photo gallery remains immediately above Careers",
    ],
    [
        publicCss.includes("grid-template-columns: repeat(5, minmax(0, 1fr));") &&
            publicCss.includes("grid-template-columns: repeat(2, minmax(0, 1fr));") &&
            publicCss.includes("aspect-ratio: 3 / 2;") &&
            publicCss.includes("object-fit: cover;"),
        "gallery remains responsive and images retain undistorted aspect ratios",
    ],
    [
        menuImages.length === 6 &&
            new Set(menuImages).size === 6 &&
            menuImageHashes.length === 6 &&
            new Set(menuImageHashes).size === 6,
        "the six default menu entries use distinct, locally served images",
    ],
    [
        read(".gitignore").includes(".env.*") &&
            read(".gitignore").includes(".env") &&
            read(".gitignore").includes("!.env.example") &&
            read("vercel.json").includes('"outputDirectory": "dist"') &&
            read(".env.example").includes("MONGODB_URI="),
        "Vercel output and secret-safe environment configuration are present",
    ],
    [
        packageJson.scripts["dev:vercel"].includes("--env-file-if-exists=.env") &&
            packageJson.scripts["dev:vercel"].includes("--run dev:vercel:cli") &&
            packageJson.scripts["dev:vercel:cli"].includes("vercel dev --local") &&
            packageJson.scripts["provision:admin"].includes("--env-file-if-exists=.env") &&
            packageJson.scripts["provision:admin"].includes("--env-file-if-exists=.env.local") &&
            packageJson.scripts["check:mongodb"].includes("scripts/check-mongodb.js"),
        "local Vercel functions, provisioning, and diagnostics load both env files",
    ],
    [
        mongoDiagnostic.includes("cluster01.vi8ncgs.mongodb.net") &&
            mongoDiagnostic.includes("hardees481_db_user") &&
            mongoDiagnostic.includes("ping: 1") &&
            mongoDiagnostic.includes("values hidden") &&
            !mongoDiagnostic.includes("console.log(uri)") &&
            !mongoDiagnostic.includes("User.create("),
        "MongoDB diagnostics validate expected Atlas details and perform only a read-only ping",
    ],
    [
        read("scripts/provision-admin.js").includes("staffId.length < 3") &&
            read("scripts/provision-admin.js").includes("staffId.length > 40") &&
            read("scripts/provision-admin.js").includes("password.length < 12") &&
            read("scripts/provision-admin.js").includes("password.length > 128") &&
            read("scripts/provision-admin.js").includes("hashPassword(password)") &&
            read("scripts/provision-admin.js").indexOf("await seedDefaultMenu();") <
                read("scripts/provision-admin.js").indexOf("await User.exists({ staffId })") &&
            !read("scripts/provision-admin.js").includes("DEMO1001"),
        "provisioning validates credentials, hashes passwords, seeds defaults, and avoids duplicate accounts",
    ],
];

const failed = checks.filter(([passed]) => !passed);
if (failed.length) {
    throw new Error(`Validation failed: ${failed.map(([, message]) => message).join("; ")}`);
}

console.log(`Validated ${checks.length} requirements and ${requiredFiles.length} required files.`);
