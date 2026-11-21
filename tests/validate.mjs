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
];

const missing = requiredFiles.filter((file) => !existsSync(resolve(root, file)));
if (missing.length) {
  throw new Error(`Missing required files: ${missing.join(", ")}`);
}

const index = readFileSync(resolve(root, "index.html"), "utf8");
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
  [index.includes('DEMO1001') && index.includes('Demo@123'), "existing demo credentials are present"],
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
  [promotionDataJs.includes("HardeesPromotions") && promotionDataJs.includes("hardeesPromotions") && promotionDataJs.includes("validateOffers") && promotionDataJs.includes("FESTIVE15"), "coupon data is validated and persisted in the browser"],
  [adminDashboardJs.includes("data-toggle-offer") && adminDashboardJs.includes("data-edit-offer") && adminDashboardJs.includes("data-delete-offer") && adminDashboardJs.includes("HardeesPromotions.save"), "admin can create, edit, enable, disable, and delete coupons"],
  [adminDashboardJs.includes("data-save-review-reply") && adminDashboardJs.includes("data-toggle-review-resolution") && adminDashboardJs.includes("hardeesAdminReviews"), "review replies and complaint status persist in the browser"],
  [index.includes('id="publicOffersGrid"') && publicPromotionsJs.includes("HardeesPromotions.load") && publicPromotionsJs.includes("offer.enabled"), "public offers show enabled promotions within their valid dates"],
  [menuDataJs.includes("Starters") && menuDataJs.includes("Main Course") && menuDataJs.includes("Desserts") && menuDataJs.includes("Drinks") && menuDataJs.includes("hardeesMenuItems"), "shared menu data includes requested categories and browser persistence"],
  [index.includes('id="publicMenuGrid"') && publicMenuJs.includes("HardeesMenu.load") && publicMenuJs.includes("Out of Stock"), "public menu reflects saved menu items and availability"],
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
