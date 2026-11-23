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
  "js/dashboard.js",
  "js/admin-dashboard.js",
  "js/menu-data.js",
  "js/public-menu.js",
  "js/promotion-data.js",
  "js/public-promotions.js",
  "images/hardees-logo.svg",
  "images/gallery-hardees-exterior.png",
  "images/gallery-coffee-bar.png",
  "images/gallery-dining-area.png",
  "images/gallery-hardees-storefront.png",
  "images/gallery-breakfast-combo.png",
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(", ")}`);
}

const index = readFileSync(resolve(root, "index.html"), "utf8");
const publicCss = readFileSync(resolve(root, "css/style.css"), "utf8");
const dashboard = readFileSync(resolve(root, "employee-dashboard.html"), "utf8");
const adminDashboard = readFileSync(resolve(root, "admin-dashboard.html"), "utf8");
const dashboardCss = readFileSync(resolve(root, "css/employee-dashboard.css"), "utf8");
const dashboardJs = readFileSync(resolve(root, "js/dashboard.js"), "utf8");
const adminDashboardCss = readFileSync(resolve(root, "css/admin-dashboard.css"), "utf8");
const adminDashboardJs = readFileSync(resolve(root, "js/admin-dashboard.js"), "utf8");
const menuDataJs = readFileSync(resolve(root, "js/menu-data.js"), "utf8");
const publicMenuJs = readFileSync(resolve(root, "js/public-menu.js"), "utf8");
const promotionDataJs = readFileSync(resolve(root, "js/promotion-data.js"), "utf8");
const publicPromotionsJs = readFileSync(resolve(root, "js/public-promotions.js"), "utf8");
const adminMenuImages = [...menuDataJs.matchAll(/image: "images\/([^"]+)"/g)].map(([, image]) => image);
const adminMenuImageHashes = adminMenuImages
  .filter((image) => existsSync(resolve(root, "images", image)))
  .map((image) => createHash("sha256").update(readFileSync(resolve(root, "images", image))).digest("hex"));

const checks = [
  [index.includes('window.location.href') && index.includes('"employee-dashboard.html"'), "successful login redirects to employee-dashboard.html"],
  [index.includes('<span class="hero-brand-name">HARDEE\'S</span>') && publicCss.includes(".hero-brand-name") && publicCss.includes("font-size: clamp(18px, 2vw, 26px);"), "welcome line highlights and enlarges the Hardee's brand"],
  [index.includes('id="mobileNavToggle"') && index.includes('aria-controls="primaryNavigation"') && index.includes('role="radiogroup"') && index.includes('siteHeader.classList.toggle("navigation-open"') && publicCss.includes(".header.navigation-open .navigation") && publicCss.includes("display: inline-flex;"), "public site has an accessible hamburger menu across screen sizes"],
  [index.includes('<dialog id="employee-login"') && !index.includes('<section id="employee-login"') && index.includes('class="login-modal-close"') && index.includes("Staff/Admin Portal") && !index.includes("Staff/Admin Demo Portal") && index.includes("loginModal.showModal()") && index.includes("loginModal.close()") && index.includes('event.key === "Escape"') && index.includes("event.target === loginModal"), "homepage login is moved into an accessible modal with close, backdrop, and Escape support"],
  [index.includes('id="loginForm"') && index.includes('id="portalRole"') && index.includes('id="employeeId"') && index.includes('id="password"') && index.includes('class="login-modal-trigger"'), "existing login form and staff/admin menu access are preserved"],
  [!index.includes('class="employee-nav') && !publicCss.includes(".navigation .employee-nav"), "Staff/Admin Login uses the same unhighlighted menu styling as other links"],
  [publicCss.includes('background-attachment: scroll') && publicCss.includes('background-size: 100% auto') && publicCss.includes('background-repeat: repeat-y'), "welcome page food background scrolls with page content and scales to viewport width"],
  [!index.includes('class="demo-login"') && !index.includes("<strong>Demo Login</strong>"), "demo credential box is hidden from the sign-in page"],
  [index.includes('id="portalRole"') && index.includes('"admin-dashboard.html"') && index.includes('employeeId === "DEMO1001"') && index.includes('password === "Demo@123"'), "staff and admin use shared demo credentials"],
  [adminDashboard.includes("Incoming orders") && adminDashboard.includes("Food Menu Management") && adminDashboard.includes('id="ordersTableBody"') && adminDashboard.includes('id="orderDialog"'), "admin order queue and food menu management are present"],
  [adminDashboard.includes('id="menuDialog"') && adminDashboard.includes('id="addMenuItemButton"') && adminDashboard.includes('id="menuItemImage"') && adminDashboard.includes('id="menuItemPreparation"'), "menu editor supports image uploads and prep times"],
  [["menuItemCategory", "menuItemPrice", "menuItemFoodType", "menuItemBestseller", "menuItemChefSpecial", "menuItemSizes", "menuItemToppings", "menuItemExtras", "menuItemAvailable"].every((id) => adminDashboard.includes(`id="${id}"`)), "menu editor supports categories, pricing, food type, specials, options, and stock"],
  [adminDashboard.includes('id="staff"') && adminDashboard.includes('id="staffForm"') && ["staffName", "staffPhone", "staffEmail", "staffRole", "staffAttendance", "staffShift", "staffWorkDays", "staffHourlyRate", "staffPerformance", "staffStatus"].every((id) => adminDashboard.includes(`id="${id}"`)), "admin staff management includes employee profiles, schedules, attendance, pay, and status"],
  [adminDashboard.includes('id="notifications"') && adminDashboard.includes('id="notificationList"') && ["New order", "New reservation", "Order cancellation", "Low stock", "New review", "Payment received", "Refund request", "Staff alert"].every((label) => adminDashboardJs.includes(`"${label}"`)), "admin notification center covers requested restaurant events"],
  [adminDashboard.includes('id="offers"') && adminDashboard.includes('id="offerForm"') && ["offerCode", "offerDiscountType", "offerCampaign", "offerMinimumOrder", "offerMaximumDiscount", "offerStartDate", "offerEndDate"].every((id) => adminDashboard.includes(`id="${id}"`)), "admin offer editor supports coupon codes, discount types, campaigns, order limits, and dates"],
  [adminDashboard.includes('id="reviews"') && adminDashboard.includes('id="reviewList"') && adminDashboard.includes('id="reviewRatingFilter"') && adminDashboard.includes('id="reviewStatusFilter"'), "admin reviews support sentiment filters and complaint tracking"],
  [adminDashboardCss.includes("@media") && adminDashboardCss.includes("orders-table") && adminDashboardCss.includes("menu-grid"), "admin order portal is responsive"],
  [adminDashboardJs.includes("orderSearch") && adminDashboardJs.includes("orderStatusFilter") && adminDashboardJs.includes("advanceOrderButton") && adminDashboardJs.includes("adminSession"), "admin order search, filters and status actions are functional"],
  [adminDashboardJs.includes("data-toggle-menu") && adminDashboardJs.includes("data-edit-menu") && adminDashboardJs.includes("data-delete-menu") && adminDashboardJs.includes("HardeesMenu.save"), "menu availability, edit and delete actions are functional"],
  [adminDashboardJs.includes("hardeesAdminStaff") && adminDashboardJs.includes("persistStaffMembers") && adminDashboardJs.includes("data-edit-staff"), "employee add, edit, filter, and browser persistence are implemented"],
  [adminDashboardJs.includes("hardeesAdminNotifications") && adminDashboardJs.includes("data-mark-notification-read") && adminDashboardJs.includes("markAllNotificationsRead"), "notification read state and unread counts persist in the browser"],
  [promotionDataJs.includes("HardeesPromotions") && promotionDataJs.includes("hardeesPromotions") && promotionDataJs.includes("validateOffers") && promotionDataJs.includes("const defaultOffers = [];"), "offers start empty and are validated and persisted in the browser"],
  [adminDashboardJs.includes("data-toggle-offer") && adminDashboardJs.includes("data-edit-offer") && adminDashboardJs.includes("data-delete-offer") && adminDashboardJs.includes("HardeesPromotions.save"), "admin can create, edit, enable, disable, and delete coupons"],
  [adminDashboardJs.includes("data-save-review-reply") && adminDashboardJs.includes("data-toggle-review-resolution") && adminDashboardJs.includes("hardeesAdminReviews"), "review replies and complaint status persist in the browser"],
  [index.includes('id="offers" class="offers-section" hidden') && !index.includes("GET A FREE TASTE") && index.includes("Offers created by Hardee's.") && !index.includes("Offers created by the restaurant") && index.includes('<a href="#offers" hidden>Offers</a>') && publicPromotionsJs.includes("HardeesPromotions.load") && publicPromotionsJs.includes("offer.enabled") && publicPromotionsJs.includes("offersSection.hidden = !hasOffers") && publicPromotionsJs.includes("link.hidden = !hasOffers"), "public offers show only active admin promotions within their valid dates"],
  [menuDataJs.includes("Starters") && menuDataJs.includes("Main Course") && menuDataJs.includes("Desserts") && menuDataJs.includes("Drinks") && menuDataJs.includes("hardeesMenuItems"), "shared menu data includes requested categories and browser persistence"],
  [index.includes('id="publicMenuGrid"') && publicMenuJs.includes("HardeesMenu.load") && publicMenuJs.includes("Out of Stock") && publicMenuJs.includes('loading="lazy" decoding="async"'), "public menu reflects saved menu items with efficient image loading"],
  [index.includes('class="restaurant-gallery-section"') && index.includes('id="restaurantGalleryTitle"') && index.includes("A LOOK INSIDE HARDEE'S") && (index.match(/class="restaurant-gallery-card"/g) || []).length === 5 && index.indexOf('class="restaurant-gallery-section"') < index.indexOf('id="careers"') && ["gallery-hardees-exterior.png", "gallery-coffee-bar.png", "gallery-dining-area.png", "gallery-hardees-storefront.png", "gallery-breakfast-combo.png"].every((image) => index.includes(image)), "five supplied photos appear in a gallery immediately before Careers"],
  [publicCss.includes("grid-template-columns: repeat(5, minmax(0, 1fr));") && publicCss.includes("grid-template-columns: repeat(3, minmax(0, 1fr));") && publicCss.includes("grid-template-columns: repeat(2, minmax(0, 1fr));") && publicCss.includes("aspect-ratio: 3 / 2;") && publicCss.includes("object-fit: cover;"), "gallery and food photos use consistent, responsive, undistorted image sizing"],
  [index.includes('class="restaurant-map"') && index.includes("output=embed") && index.includes('title="Map to Hardee') && publicCss.includes(".restaurant-map iframe"), "location section embeds a responsive Google Map"],
  [index.includes('<div class="restaurant-address-card">') && index.includes('<span class="restaurant-name">Hardee\'s</span>') && publicCss.includes(".restaurant-address-card h2") && !publicCss.includes("font-size: clamp(36px, 6vw, 48px);"), "location address is grouped in a compact card with the original Hardee's name size"],
  [index.includes("TIMINGS") && !index.includes("RESTAURANT HOURS") && index.includes("5:30 AM – 10:00 PM") && !index.includes("✓ Wi-Fi") && !index.includes('<section id="contact"') && !index.includes('href="#contact"') && /\.hours-summary-section \.hours-card\s*\{[^}]*background-color:\s*#111111;[^}]*color:\s*#ffffff;/.test(publicCss) && publicCss.includes("background: #292929;"), "public page labels timings clearly, omits duplicate contact content, and uses readable black hours"],
  [adminMenuImages.length === 6 && new Set(adminMenuImages).size === 6 && adminMenuImageHashes.length === 6 && new Set(adminMenuImageHashes).size === 6, "default menu items use six distinct local images"],
  [dashboard.includes("Welcome back, Jordan!") , "dashboard welcome message is present"],
  [dashboard.includes("DEMO1001") && dashboard.includes("Jordan Miller") && dashboard.includes("Crew Member") && dashboard.includes("Rockingham, NC"), "employee profile details are present"],
  [dashboard.includes("Check In / Check Out") && dashboard.includes("My Schedule") && dashboard.includes("My Hours") && dashboard.includes("Performance") && dashboard.includes("Pay Statements") && dashboard.includes("Profile") && dashboard.includes("Logout"), "sidebar navigation is complete"],
  [dashboard.includes("Checked Out") && dashboard.includes("CHECK IN"), "initial status and check-in control are present"],
  [dashboard.includes("Today's worked hours") && dashboard.includes("This week's total hours") && dashboard.includes("Performance score") && dashboard.includes("Attendance percentage") && dashboard.includes("Recent activity") && dashboard.includes("Upcoming shift"), "dashboard metrics are complete"],
  [dashboard.includes("DEMO EMPLOYEE SYSTEM") && dashboard.toLowerCase().includes("simulated demonstration"), "demo employee system label is present"],
  [dashboardCss.includes("@media") && dashboardCss.includes("grid-template-columns"), "responsive dashboard CSS is present"],
  [dashboardJs.includes("checkInButton") && dashboardJs.includes("sessionStorage") && dashboardJs.includes("window.location.href"), "dashboard interactions and session handling are present"],
];

const failed = checks.filter(([passed]) => !passed);
if (failed.length) {
  throw new Error(`Validation failed: ${failed.map(([, message]) => message).join("; ")}`);
}

console.log(`Validated ${checks.length} dashboard requirements and ${requiredFiles.length} required files.`);
