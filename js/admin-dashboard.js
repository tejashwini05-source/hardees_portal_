const adminSidebar = document.getElementById("adminSidebar");
const adminMenuToggle = document.getElementById("adminMenuToggle");
const adminDate = document.getElementById("adminDate");
const ordersTableBody = document.getElementById("ordersTableBody");
const orderSearch = document.getElementById("orderSearch");
const orderStatusFilter = document.getElementById("orderStatusFilter");
const emptyOrders = document.getElementById("emptyOrders");
const orderDialog = document.getElementById("orderDialog");
const orderDialogTitle = document.getElementById("orderDialogTitle");
const orderDialogContent = document.getElementById("orderDialogContent");
const advanceOrderButton = document.getElementById("advanceOrderButton");
const cancelOrderButton = document.getElementById("cancelOrderButton");
const menuGrid = document.getElementById("menuGrid");
const menuSearch = document.getElementById("menuSearch");
const menuCategoryFilter = document.getElementById("menuCategoryFilter");
const menuAvailabilityFilter = document.getElementById("menuAvailabilityFilter");
const menuDialog = document.getElementById("menuDialog");
const menuItemForm = document.getElementById("menuItemForm");
const menuFormError = document.getElementById("menuFormError");
const menuItemImage = document.getElementById("menuItemImage");
const menuImagePreview = document.getElementById("menuImagePreview");
const menuFeedback = document.getElementById("menuFeedback");
const staffTableBody = document.getElementById("staffTableBody");
const staffSearch = document.getElementById("staffSearch");
const staffStatusFilter = document.getElementById("staffStatusFilter");
const staffFeedback = document.getElementById("staffFeedback");
const staffDialog = document.getElementById("staffDialog");
const staffForm = document.getElementById("staffForm");
const staffFormError = document.getElementById("staffFormError");
const notificationList = document.getElementById("notificationList");
const notificationFilter = document.getElementById("notificationFilter");
const notificationFeedback = document.getElementById("notificationFeedback");
const adminOffersGrid = document.getElementById("adminOffersGrid");
const offerSearch = document.getElementById("offerSearch");
const offerStatusFilter = document.getElementById("offerStatusFilter");
const offerFeedback = document.getElementById("offerFeedback");
const offerDialog = document.getElementById("offerDialog");
const offerForm = document.getElementById("offerForm");
const offerFormError = document.getElementById("offerFormError");
const reviewList = document.getElementById("reviewList");
const reviewSearch = document.getElementById("reviewSearch");
const reviewRatingFilter = document.getElementById("reviewRatingFilter");
const reviewStatusFilter = document.getElementById("reviewStatusFilter");
const reviewFeedback = document.getElementById("reviewFeedback");
const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

const orders = [
    { id: "HD-48128", guest: "Ava Campbell", channel: "Pickup", placed: "12:31 PM", status: "received", items: [{ name: "Famous Star Combo", quantity: 1, price: 9.99 }, { name: "Medium Fries", quantity: 1, price: 2.49 }] },
    { id: "HD-48127", guest: "Marcus Reed", channel: "Drive-thru", placed: "12:24 PM", status: "preparing", items: [{ name: "Bacon Beast Burger Combo", quantity: 1, price: 12.49 }, { name: "S'mores Iced Coffee", quantity: 1, price: 3.29 }] },
    { id: "HD-48126", guest: "Jasmine Cole", channel: "Pickup", placed: "12:18 PM", status: "ready", items: [{ name: "Cinnamon 'N' Raisin Biscuit 2-pack", quantity: 1, price: 3.49 }, { name: "Coffee", quantity: 1, price: 1.89 }] },
    { id: "HD-48125", guest: "Olivia Grant", channel: "Delivery", placed: "12:12 PM", status: "preparing", items: [{ name: "Hand-Breaded Chicken Biscuit Combo", quantity: 1, price: 10.79 }, { name: "Hash Rounds", quantity: 1, price: 2.29 }] },
    { id: "HD-48124", guest: "Ethan Brooks", channel: "Dine-in", placed: "11:58 AM", status: "completed", items: [{ name: "Famous Star Combo", quantity: 1, price: 9.99 }] },
    { id: "HD-48123", guest: "Noah Davis", channel: "Drive-thru", placed: "11:46 AM", status: "completed", items: [{ name: "Super Bacon Biscuit", quantity: 2, price: 5.49 }] },
    { id: "HD-48122", guest: "Maya Hill", channel: "Pickup", placed: "11:39 AM", status: "cancelled", items: [{ name: "Bacon Beast Burger Combo", quantity: 1, price: 12.49 }] },
    { id: "HD-48121", guest: "Liam Scott", channel: "Dine-in", placed: "11:31 AM", status: "received", items: [{ name: "S'mores Iced Coffee", quantity: 2, price: 3.29 }, { name: "Cinnamon 'N' Raisin Biscuit 2-pack", quantity: 1, price: 3.49 }] },
];

let menuItems = window.HardeesMenu.load();

const statusLabels = {
    received: "Received",
    preparing: "Preparing",
    ready: "Ready for pickup",
    completed: "Completed",
    cancelled: "Cancelled",
};

const nextOrderStep = {
    received: { status: "preparing", label: "Accept & start preparing" },
    preparing: { status: "ready", label: "Mark ready for pickup" },
    ready: { status: "completed", label: "Complete order" },
};

const employeeRoles = ["Chef", "Waiter", "Cashier", "Manager", "Delivery"];
const attendanceStatuses = ["Present", "Absent", "On leave", "Off today"];
const employeeStatuses = ["Active", "Inactive"];
const notificationTypes = ["order", "reservation", "cancellation", "low-stock", "review", "payment", "refund", "staff"];
const notificationLabels = {
    order: "New order",
    reservation: "New reservation",
    cancellation: "Order cancellation",
    "low-stock": "Low stock",
    review: "New review",
    payment: "Payment received",
    refund: "Refund request",
    staff: "Staff alert",
};
const notificationIcons = {
    order: "▤",
    reservation: "▣",
    cancellation: "×",
    "low-stock": "!",
    review: "★",
    payment: "$",
    refund: "↺",
    staff: "♙",
};
const defaultStaffMembers = [
    { id: "EMP-1001", name: "Jordan Miller", phone: "(910) 555-0101", email: "jordan.miller@example.com", role: "Cashier", attendance: "Present", shift: "Opening", workDays: "Monday–Friday", shiftHours: "5:30 AM–2:00 PM", hourlyRate: 14.5, performance: 94, status: "Active" },
    { id: "EMP-1002", name: "Taylor Brooks", phone: "(910) 555-0102", email: "taylor.brooks@example.com", role: "Chef", attendance: "Present", shift: "Morning", workDays: "Monday–Friday", shiftHours: "6:00 AM–2:30 PM", hourlyRate: 18.25, performance: 97, status: "Active" },
    { id: "EMP-1003", name: "Morgan Lee", phone: "(910) 555-0103", email: "morgan.lee@example.com", role: "Manager", attendance: "Present", shift: "Mid", workDays: "Monday–Friday", shiftHours: "8:00 AM–4:30 PM", hourlyRate: 22, performance: 91, status: "Active" },
    { id: "EMP-1004", name: "Casey Parker", phone: "(910) 555-0104", email: "casey.parker@example.com", role: "Waiter", attendance: "Absent", shift: "Evening", workDays: "Friday–Tuesday", shiftHours: "2:00 PM–10:00 PM", hourlyRate: 15.5, performance: 82, status: "Active" },
    { id: "EMP-1005", name: "Avery Diaz", phone: "(910) 555-0105", email: "avery.diaz@example.com", role: "Delivery", attendance: "On leave", shift: "Evening", workDays: "Wednesday–Sunday", shiftHours: "1:00 PM–9:00 PM", hourlyRate: 15.25, performance: 88, status: "Inactive" },
];
const defaultNotifications = [
    { id: "notification-order", type: "order", title: "New pickup order received", detail: "HD-48128 · Ava Campbell · $12.48", time: "2 min ago", read: false },
    { id: "notification-reservation", type: "reservation", title: "New reservation request", detail: "Party of 4 · Today at 6:30 PM", time: "8 min ago", read: false },
    { id: "notification-cancellation", type: "cancellation", title: "Order HD-48122 was cancelled", detail: "Pickup order · Maya Hill", time: "14 min ago", read: false },
    { id: "notification-low-stock", type: "low-stock", title: "Hash Rounds are running low", detail: "Approximately 3 portions remain.", time: "22 min ago", read: false },
    { id: "notification-review", type: "review", title: "New 5-star review", detail: "“Fast service and a great burger.”", time: "35 min ago", read: false },
    { id: "notification-payment", type: "payment", title: "Payment received", detail: "HD-48127 · $15.78 · Drive-thru", time: "42 min ago", read: false },
    { id: "notification-refund", type: "refund", title: "Refund request needs review", detail: "HD-48124 · Guest requested a $9.99 refund.", time: "1 hour ago", read: false },
    { id: "notification-staff", type: "staff", title: "Attendance alert", detail: "Casey Parker is marked absent for the evening shift.", time: "Today · 2:05 PM", read: false },
];
const defaultReviews = [
    { id: "review-1001", guest: "Sam Rivera", orderId: "HD-48128", date: "Nov 21, 2026", rating: 5, title: "Fresh and delicious", comment: "The Famous Star was fresh, and pickup was quick.", complaint: false, reply: "", resolved: false },
    { id: "review-1002", guest: "Priya Shah", orderId: "HD-48127", date: "Nov 21, 2026", rating: 4, title: "Great burger", comment: "The burger was great. I would have liked a few more napkins.", complaint: false, reply: "Thanks for the feedback, Priya. We will make sure napkins are included.", resolved: true },
    { id: "review-1003", guest: "Chris Martin", orderId: "HD-48126", date: "Nov 20, 2026", rating: 3, title: "Good, with room to improve", comment: "The food was good, but my order took a little longer than expected.", complaint: false, reply: "", resolved: false },
    { id: "review-1004", guest: "Dana Wilson", orderId: "HD-48125", date: "Nov 20, 2026", rating: 2, title: "Fries were cold", comment: "The fries were cold when the delivery arrived.", complaint: true, reply: "", resolved: false },
    { id: "review-1005", guest: "Jamie Brooks", orderId: "HD-48124", date: "Nov 19, 2026", rating: 1, title: "Long wait", comment: "I waited over 30 minutes and did not receive an update.", complaint: true, reply: "We are sorry about the wait, Jamie. We have reviewed the pickup process with our team.", resolved: true },
    { id: "review-1006", guest: "Alex Carter", orderId: "HD-48123", date: "Nov 19, 2026", rating: 5, title: "Friendly service", comment: "The team was friendly and my order was exactly right.", complaint: false, reply: "", resolved: false },
];

let activeOrderId = null;
let editingMenuItemId = null;
let editingStaffMemberId = null;
let editingOfferId = null;
let pendingMenuImage = "";
let imageProcessingRequest = 0;
let staffMembers = [];
let notifications = [];
let promotions = [];
let reviews = [];
let staffDataReady = true;
let notificationDataReady = true;
let promotionDataReady = true;
let reviewDataReady = true;

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

function loadStaffMembers() {
    const savedMembers = localStorage.getItem("hardeesAdminStaff");
    const members = savedMembers === null ? defaultStaffMembers : JSON.parse(savedMembers);
    if (!Array.isArray(members) || members.some((member) =>
        !member || typeof member.id !== "string" || !member.id ||
        typeof member.name !== "string" || !member.name.trim() ||
        typeof member.phone !== "string" || !member.phone.trim() ||
        typeof member.email !== "string" || !member.email.trim() ||
        !employeeRoles.includes(member.role) ||
        !attendanceStatuses.includes(member.attendance) ||
        !["Opening", "Morning", "Mid", "Evening"].includes(member.shift) ||
        typeof member.workDays !== "string" || !member.workDays.trim() ||
        typeof member.shiftHours !== "string" || !member.shiftHours.trim() ||
        !Number.isFinite(member.hourlyRate) || member.hourlyRate <= 0 ||
        !Number.isInteger(member.performance) || member.performance < 0 || member.performance > 100 ||
        !employeeStatuses.includes(member.status)
    )) {
        throw new Error("Saved staff records are invalid. Clear the staff data and try again.");
    }
    return members;
}

function loadNotifications() {
    const savedNotifications = localStorage.getItem("hardeesAdminNotifications");
    const savedItems = savedNotifications === null ? defaultNotifications : JSON.parse(savedNotifications);
    if (!Array.isArray(savedItems) || savedItems.some((item) =>
        !item || typeof item.id !== "string" || !item.id ||
        !notificationTypes.includes(item.type) ||
        typeof item.title !== "string" || !item.title.trim() ||
        typeof item.detail !== "string" ||
        typeof item.time !== "string" ||
        typeof item.read !== "boolean"
    )) {
        throw new Error("Saved notifications are invalid. Clear the notification data and try again.");
    }
    return savedItems;
}

function loadReviews() {
    const savedReviews = localStorage.getItem("hardeesAdminReviews");
    const items = savedReviews === null ? defaultReviews : JSON.parse(savedReviews);
    if (!Array.isArray(items) || items.some((review) =>
        !review || typeof review.id !== "string" || !review.id ||
        typeof review.guest !== "string" || !review.guest.trim() ||
        typeof review.orderId !== "string" || !review.orderId.trim() ||
        typeof review.date !== "string" ||
        !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5 ||
        typeof review.title !== "string" || !review.title.trim() ||
        typeof review.comment !== "string" || !review.comment.trim() ||
        typeof review.complaint !== "boolean" ||
        typeof review.reply !== "string" ||
        typeof review.resolved !== "boolean"
    )) {
        throw new Error("Saved review data is invalid. Review or clear the feedback data.");
    }
    return items;
}

function localDateValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function formatPromotionDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getPromotionStatus(offer) {
    if (!offer.enabled) return "disabled";
    const today = localDateValue(new Date());
    if (offer.endDate < today) return "expired";
    if (offer.startDate > today) return "upcoming";
    return "active";
}

function showStaffFeedback(message, isError) {
    staffFeedback.textContent = message;
    staffFeedback.classList.toggle("error", Boolean(isError));
}

function showNotificationFeedback(message, isError) {
    notificationFeedback.textContent = message;
    notificationFeedback.classList.toggle("error", Boolean(isError));
}

function showOfferFeedback(message, isError) {
    offerFeedback.textContent = message;
    offerFeedback.classList.toggle("error", Boolean(isError));
}

function showReviewFeedback(message, isError) {
    reviewFeedback.textContent = message;
    reviewFeedback.classList.toggle("error", Boolean(isError));
}

function persistStaffMembers(nextMembers) {
    try {
        localStorage.setItem("hardeesAdminStaff", JSON.stringify(nextMembers));
    } catch (error) {
        console.error("Could not save staff records.", error);
        showStaffFeedback("Could not save staff changes. The browser may be out of storage space.", true);
        return false;
    }

    staffMembers = nextMembers;
    renderStaff();
    return true;
}

function persistNotifications(nextNotifications) {
    try {
        localStorage.setItem("hardeesAdminNotifications", JSON.stringify(nextNotifications));
    } catch (error) {
        console.error("Could not save notification changes.", error);
        showNotificationFeedback("Could not save notification changes in this browser.", true);
        return false;
    }

    notifications = nextNotifications;
    renderNotifications();
    return true;
}

function persistPromotions(nextOffers) {
    try {
        window.HardeesPromotions.save(nextOffers);
    } catch (error) {
        console.error("Could not save promotions.", error);
        showOfferFeedback(error.message || "Could not save offers in this browser.", true);
        return false;
    }

    promotions = nextOffers;
    renderPromotions();
    return true;
}

function persistReviews(nextReviews) {
    try {
        localStorage.setItem("hardeesAdminReviews", JSON.stringify(nextReviews));
    } catch (error) {
        console.error("Could not save review updates.", error);
        showReviewFeedback("Could not save review updates in this browser.", true);
        return false;
    }

    reviews = nextReviews;
    renderReviews();
    return true;
}

function renderStaff() {
    const query = staffSearch.value.trim().toLowerCase();
    const selectedStatus = staffStatusFilter.value;
    const visibleMembers = staffMembers.filter((member) => {
        const matchesQuery = !query ||
            `${member.id} ${member.name} ${member.phone} ${member.email} ${member.role}`
                .toLowerCase()
                .includes(query);
        return matchesQuery && (selectedStatus === "all" || member.status === selectedStatus);
    });
    const activeCount = staffMembers.filter((member) => member.status === "Active").length;

    document.getElementById("staffCount").textContent =
        selectedStatus === "all" && !query
            ? `${staffMembers.length} employees · ${activeCount} active`
            : `${visibleMembers.length} matching ${visibleMembers.length === 1 ? "employee" : "employees"}`;
    document.getElementById("emptyStaff").hidden = visibleMembers.length > 0;
    staffTableBody.innerHTML = visibleMembers.map((member) => {
        const attendanceClass = {
            Present: "present",
            Absent: "absent",
            "On leave": "on-leave",
            "Off today": "off-today",
        }[member.attendance];
        const statusClass = member.status.toLowerCase();
        return `
            <tr>
                <td class="staff-employee"><strong>${escapeHtml(member.name)}</strong><small>${escapeHtml(member.id)} · ${escapeHtml(member.phone)}</small><small>${escapeHtml(member.email)}</small></td>
                <td>${escapeHtml(member.role)}</td>
                <td><span class="staff-pill ${attendanceClass}">${escapeHtml(member.attendance)}</span></td>
                <td class="staff-schedule"><strong>${escapeHtml(member.shift)} shift · ${escapeHtml(member.shiftHours)}</strong><small>${escapeHtml(member.workDays)}</small></td>
                <td>${currency.format(member.hourlyRate)}<small>/ hour</small></td>
                <td>${member.performance}%</td>
                <td><span class="staff-pill ${statusClass}">${escapeHtml(member.status)}</span></td>
                <td><button class="edit-staff-button" type="button" data-edit-staff="${escapeHtml(member.id)}">Edit</button></td>
            </tr>`;
    }).join("");
}

function renderNotifications() {
    const showUnreadOnly = notificationFilter.value === "unread";
    const visibleNotifications = notifications.filter((item) => !showUnreadOnly || !item.read);
    const unreadCount = notifications.filter((item) => !item.read).length;
    const countBadge = document.getElementById("unreadNotificationCount");
    const markAllButton = document.getElementById("markAllNotificationsRead");

    countBadge.textContent = String(unreadCount);
    countBadge.hidden = unreadCount === 0;
    countBadge.setAttribute("aria-label", `${unreadCount} unread notifications`);
    markAllButton.disabled = unreadCount === 0;
    document.getElementById("notificationCount").textContent =
        `${notifications.length} ${notifications.length === 1 ? "notification" : "notifications"} · ${unreadCount} unread`;
    document.getElementById("emptyNotifications").hidden = visibleNotifications.length > 0;
    notificationList.innerHTML = visibleNotifications.map((item) => `
        <article class="notification-item${item.read ? "" : " unread"}">
            <span class="notification-icon ${item.type}" aria-hidden="true">${notificationIcons[item.type]}</span>
            <div class="notification-copy">
                <div class="notification-meta"><span class="notification-type">${notificationLabels[item.type]}</span>${item.read ? '<span class="notification-read-label">Read</span>' : ""}</div>
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.detail)}</p>
            </div>
            <span class="notification-time">${escapeHtml(item.time)}</span>
            ${item.read ? "" : `<button class="mark-read-button" type="button" data-mark-notification-read="${escapeHtml(item.id)}">Mark as read</button>`}
        </article>`).join("");
}

function getPromotionDiscountLabel(offer) {
    if (offer.discountType === "percentage") return `${offer.discountValue}% OFF`;
    if (offer.discountType === "flat") return `${currency.format(offer.discountValue)} OFF`;
    if (offer.discountType === "free-delivery") return "FREE DELIVERY";
    return "BUY 1 GET 1";
}

function renderPromotions() {
    const query = offerSearch.value.trim().toLowerCase();
    const selectedStatus = offerStatusFilter.value;
    const visibleOffers = promotions.filter((offer) => {
        const matchesQuery = !query ||
            `${offer.code} ${offer.name} ${offer.campaign}`.toLowerCase().includes(query);
        const matchesStatus = selectedStatus === "all" || getPromotionStatus(offer) === selectedStatus;
        return matchesQuery && matchesStatus;
    });

    document.getElementById("offerCount").textContent =
        `${visibleOffers.length} of ${promotions.length} ${promotions.length === 1 ? "offer" : "offers"}`;
    document.getElementById("emptyOffers").hidden = visibleOffers.length > 0;
    adminOffersGrid.innerHTML = visibleOffers.map((offer) => {
        const status = getPromotionStatus(offer);
        const maximum = offer.discountType === "percentage" && offer.maximumDiscount > 0
            ? currency.format(offer.maximumDiscount)
            : "No limit";
        const minimum = offer.minimumOrder > 0 ? currency.format(offer.minimumOrder) : "None";
        return `
            <article class="admin-offer-card">
                <div class="admin-offer-top">
                    <span class="offer-status ${status}">${status === "upcoming" ? "Scheduled" : status[0].toUpperCase() + status.slice(1)}</span>
                    <span class="admin-offer-campaign">${escapeHtml(offer.campaign)}</span>
                </div>
                <h3 class="admin-offer-title">${escapeHtml(offer.name)}</h3>
                <div class="admin-offer-code-row">
                    <span class="admin-offer-code">${escapeHtml(offer.code)}</span>
                    <strong class="admin-offer-discount">${escapeHtml(getPromotionDiscountLabel(offer))}</strong>
                </div>
                <div class="admin-offer-meta">
                    <div><span>Minimum order</span><strong>${minimum}</strong></div>
                    <div><span>Maximum discount</span><strong>${maximum}</strong></div>
                    <div><span>Starts</span><strong>${formatPromotionDate(offer.startDate)}</strong></div>
                    <div><span>Expires</span><strong>${formatPromotionDate(offer.endDate)}</strong></div>
                </div>
                <div class="offer-actions">
                    <button class="offer-toggle-button" type="button" data-toggle-offer="${escapeHtml(offer.id)}" aria-pressed="${offer.enabled}">${offer.enabled ? "Disable" : "Enable"}</button>
                    <button class="edit-offer-button" type="button" data-edit-offer="${escapeHtml(offer.id)}">Edit</button>
                    <button class="delete-offer-button" type="button" data-delete-offer="${escapeHtml(offer.id)}">Delete</button>
                </div>
            </article>`;
    }).join("");
}

function isComplaintReview(review) {
    return review.complaint || review.rating <= 2;
}

function getReviewSentiment(review) {
    if (review.rating >= 4) return "positive";
    return review.rating === 3 ? "neutral" : "negative";
}

function renderReviews() {
    const query = reviewSearch.value.trim().toLowerCase();
    const selectedRating = reviewRatingFilter.value;
    const selectedStatus = reviewStatusFilter.value;
    const positiveCount = reviews.filter((review) => review.rating >= 4).length;
    const openComplaintCount = reviews.filter((review) =>
        isComplaintReview(review) && !review.resolved
    ).length;
    const average = reviews.length
        ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
        : 0;
    document.getElementById("averageReviewRating").textContent = average.toFixed(1);
    document.getElementById("positiveReviewRate").textContent =
        `${reviews.length ? Math.round((positiveCount / reviews.length) * 100) : 0}%`;
    document.getElementById("openComplaintCount").textContent = String(openComplaintCount);

    const visibleReviews = reviews.filter((review) => {
        const matchesQuery = !query ||
            `${review.guest} ${review.orderId} ${review.title} ${review.comment}`
                .toLowerCase()
                .includes(query);
        const sentiment = getReviewSentiment(review);
        const matchesRating = selectedRating === "all" || sentiment === selectedRating;
        const complaint = isComplaintReview(review);
        const matchesStatus =
            selectedStatus === "all" ||
            (selectedStatus === "complaints" && complaint) ||
            (selectedStatus === "needs-response" && !review.reply.trim() && !review.resolved) ||
            (selectedStatus === "resolved" && review.resolved);
        return matchesQuery && matchesRating && matchesStatus;
    });

    document.getElementById("reviewCount").textContent =
        `${visibleReviews.length} ${visibleReviews.length === 1 ? "review" : "reviews"}`;
    document.getElementById("emptyReviews").hidden = visibleReviews.length > 0;
    reviewList.innerHTML = visibleReviews.map((review) => {
        const sentiment = getReviewSentiment(review);
        const complaint = isComplaintReview(review);
        const statusLabel = complaint
            ? review.resolved ? "Resolved" : "Open complaint"
            : review.reply.trim() ? "Replied" : "Needs reply";
        const statusClass = review.resolved ? "resolved" : complaint ? "open" : "";
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
        return `
            <article class="review-card${complaint ? " complaint" : ""}">
                <div class="review-card-header">
                    <div class="review-guest"><strong>${escapeHtml(review.guest)}</strong><small>${escapeHtml(review.orderId)} · ${escapeHtml(review.date)}</small></div>
                    <div class="review-rating">
                        <span class="review-stars" aria-label="${review.rating} out of 5 stars">${stars}</span>
                        <strong class="review-score">${review.rating}.0</strong>
                        <span class="review-sentiment ${sentiment}">${sentiment}</span>
                        <span class="review-resolution ${statusClass}">${statusLabel}</span>
                    </div>
                </div>
                <h3 class="review-title">${escapeHtml(review.title)}</h3>
                <p class="review-comment">${escapeHtml(review.comment)}</p>
                <label class="review-reply-field" for="review-reply-${escapeHtml(review.id)}">Reply to customer
                    <textarea id="review-reply-${escapeHtml(review.id)}" data-review-reply="${escapeHtml(review.id)}" maxlength="280" placeholder="Write a helpful response...">${escapeHtml(review.reply)}</textarea>
                </label>
                <div class="review-card-actions">
                    <button class="save-review-reply" type="button" data-save-review-reply="${escapeHtml(review.id)}">Save reply</button>
                    ${complaint ? `<button class="toggle-review-resolution" type="button" data-toggle-review-resolution="${escapeHtml(review.id)}">${review.resolved ? "Reopen complaint" : "Mark resolved"}</button>` : ""}
                </div>
            </article>`;
    }).join("");
}

function orderTotal(order) {
    return order.items.reduce((total, item) => total + item.quantity * item.price, 0);
}

function renderMetrics() {
    const nonCancelledOrders = orders.filter((order) => order.status !== "cancelled");
    const sales = nonCancelledOrders.reduce((total, order) => total + orderTotal(order), 0);
    const activeCount = orders.filter((order) =>
        ["received", "preparing", "ready"].includes(order.status)
    ).length;

    document.getElementById("metricOrders").textContent = String(orders.length);
    document.getElementById("metricActive").textContent = String(activeCount);
    document.getElementById("metricSales").textContent = currency.format(sales);
    document.getElementById("metricAverage").textContent = currency.format(
        nonCancelledOrders.length ? sales / nonCancelledOrders.length : 0
    );
}

function getVisibleOrders() {
    const query = orderSearch.value.trim().toLowerCase();
    const selectedStatus = orderStatusFilter.value;

    return orders.filter((order) => {
        const matchesQuery = !query ||
            `${order.id} ${order.guest} ${order.channel} ${order.items.map((item) => item.name).join(" ")}`
                .toLowerCase()
                .includes(query);
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
        return matchesQuery && matchesStatus;
    });
}

function renderOrders() {
    const visibleOrders = getVisibleOrders();
    ordersTableBody.innerHTML = visibleOrders.map((order) => {
        const itemCount = order.items.reduce((count, item) => count + item.quantity, 0);
        return `
            <tr>
                <td><strong>${escapeHtml(order.id)}</strong><small>Hardee's #481</small></td>
                <td><strong>${escapeHtml(order.guest)}</strong><small>${escapeHtml(order.channel)}</small></td>
                <td>${itemCount} ${itemCount === 1 ? "item" : "items"}</td>
                <td><strong>${currency.format(orderTotal(order))}</strong></td>
                <td>${escapeHtml(order.placed)}</td>
                <td><span class="order-status status-${order.status}">${statusLabels[order.status]}</span></td>
                <td><button class="view-order-button" type="button" data-view-order="${escapeHtml(order.id)}">View</button></td>
            </tr>`;
    }).join("");
    emptyOrders.hidden = visibleOrders.length > 0;
    renderMetrics();
}

function renderMenu() {
    const query = menuSearch.value.trim().toLowerCase();
    const category = menuCategoryFilter.value;
    const availability = menuAvailabilityFilter.value;
    const visibleItems = menuItems.filter((item) => {
        const matchesQuery = !query ||
            `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(query);
        const matchesCategory = category === "all" || item.category === category;
        const matchesAvailability = availability === "all" ||
            (availability === "available" ? item.available : !item.available);
        return matchesQuery && matchesCategory && matchesAvailability;
    });

    document.getElementById("menuCount").textContent =
        visibleItems.length === menuItems.length
            ? `${menuItems.length} ${menuItems.length === 1 ? "item" : "items"}`
            : `${visibleItems.length} of ${menuItems.length} items`;
    document.getElementById("emptyMenu").hidden = visibleItems.length > 0;
    menuGrid.innerHTML = visibleItems.map((item) => {
        const specials = [
            item.bestseller ? '<span class="menu-special-badge">Bestseller</span>' : "",
            item.chefSpecial ? '<span class="menu-special-badge chef">Chef’s Special</span>' : "",
        ].filter(Boolean).join("");
        const choices = [
            item.sizes.length ? `<span><b>Sizes:</b> ${item.sizes.map(escapeHtml).join(", ")}</span>` : "",
            item.toppings.length ? `<span><b>Toppings:</b> ${item.toppings.map(escapeHtml).join(", ")}</span>` : "",
            item.extras.length ? `<span><b>Extras:</b> ${item.extras.map(escapeHtml).join(", ")}</span>` : "",
        ].filter(Boolean).join("");

        return `
            <article class="menu-item-card">
                <div class="menu-item-photo">
                    <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">
                    <span class="menu-category">${escapeHtml(item.category)}</span>
                    <span class="food-type-badge ${item.foodType === "veg" ? "veg" : "non-veg"}">${item.foodType === "veg" ? "Veg" : "Non-Veg"}</span>
                </div>
                <div class="menu-item-info">
                    <div class="menu-item-details">
                        <div class="menu-item-title"><h3>${escapeHtml(item.name)}</h3><strong>${currency.format(item.price)}</strong></div>
                        <p>${escapeHtml(item.description)}</p>
                        <div class="menu-item-flags">${specials}<span class="prep-time">${Number(item.preparationMinutes)} min prep</span></div>
                        ${choices ? `<div class="menu-item-choices">${choices}</div>` : ""}
                    </div>
                    <div class="menu-item-actions">
                        <button class="availability-toggle ${item.available ? "available" : "out-of-stock"}"
                                type="button" data-toggle-menu="${escapeHtml(item.id)}" aria-pressed="${item.available}">
                            <span></span>${item.available ? "Available" : "Out of Stock"}
                        </button>
                        <button class="edit-menu-button" type="button" data-edit-menu="${escapeHtml(item.id)}">Edit</button>
                        <button class="delete-menu-button" type="button" data-delete-menu="${escapeHtml(item.id)}">Delete</button>
                    </div>
                </div>
            </article>`;
    }).join("");
}

function populateMenuCategories() {
    const options = window.HardeesMenu.categories
        .map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
        .join("");
    menuCategoryFilter.insertAdjacentHTML("beforeend", options);
    document.getElementById("menuItemCategory").innerHTML = options;
}

function showMenuFeedback(message, isError) {
    menuFeedback.textContent = message;
    menuFeedback.classList.toggle("error", Boolean(isError));
}

function persistMenuItems(nextItems) {
    try {
        window.HardeesMenu.save(nextItems);
    } catch (error) {
        console.error("Could not save menu changes.", error);
        showMenuFeedback("Could not save changes. The browser may be out of storage space.", true);
        return false;
    }

    menuItems = nextItems;
    renderMenu();
    return true;
}

function parseMenuChoices(value) {
    return value.split(",").map((choice) => choice.trim()).filter(Boolean);
}

function openStaffEditor(member) {
    const fields = staffForm.elements;
    editingStaffMemberId = member ? member.id : null;
    staffForm.reset();
    fields.namedItem("name").value = member ? member.name : "";
    fields.namedItem("phone").value = member ? member.phone : "";
    fields.namedItem("email").value = member ? member.email : "";
    fields.namedItem("role").value = member ? member.role : "Chef";
    fields.namedItem("attendance").value = member ? member.attendance : "Present";
    fields.namedItem("shift").value = member ? member.shift : "Opening";
    fields.namedItem("workDays").value = member ? member.workDays : "";
    fields.namedItem("shiftHours").value = member ? member.shiftHours : "";
    fields.namedItem("hourlyRate").value = member ? member.hourlyRate : "";
    fields.namedItem("performance").value = member ? member.performance : "";
    fields.namedItem("status").value = member ? member.status : "Active";
    document.getElementById("staffDialogTitle").textContent = member ? "Edit employee" : "Add employee";
    document.querySelector(".staff-save-button").textContent = member ? "Save changes" : "Add employee";
    staffFormError.textContent = "";
    showStaffFeedback("", false);
    staffDialog.showModal();
}

function saveStaffForm(event) {
    event.preventDefault();
    staffFormError.textContent = "";
    if (!staffForm.reportValidity()) return;

    const fields = staffForm.elements;
    const existingMember = staffMembers.find((member) => member.id === editingStaffMemberId);
    const name = fields.namedItem("name").value.trim();
    const phone = fields.namedItem("phone").value.trim();
    const email = fields.namedItem("email").value.trim();
    const workDays = fields.namedItem("workDays").value.trim();
    const shiftHours = fields.namedItem("shiftHours").value.trim();
    if (!name || !phone || !email || !workDays || !shiftHours) {
        staffFormError.textContent = "Complete all employee profile and schedule fields.";
        return;
    }

    const member = {
        id: existingMember ? existingMember.id : `EMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        name,
        phone,
        email,
        role: fields.namedItem("role").value,
        attendance: fields.namedItem("attendance").value,
        shift: fields.namedItem("shift").value,
        workDays,
        shiftHours,
        hourlyRate: Number(fields.namedItem("hourlyRate").value),
        performance: Number(fields.namedItem("performance").value),
        status: fields.namedItem("status").value,
    };
    const nextMembers = existingMember
        ? staffMembers.map((candidate) => candidate.id === member.id ? member : candidate)
        : [...staffMembers, member];

    if (persistStaffMembers(nextMembers)) {
        staffDialog.close();
        showStaffFeedback(`${member.name} was ${existingMember ? "updated" : "added"}.`, false);
    } else {
        staffFormError.textContent = staffFeedback.textContent;
    }
}

function updateOfferFormControls() {
    const discountType = document.getElementById("offerDiscountType").value;
    const hasDiscountValue = ["percentage", "flat"].includes(discountType);
    const valueInput = document.getElementById("offerDiscountValue");
    const maximumInput = document.getElementById("offerMaximumDiscount");
    document.getElementById("offerDiscountValueField").hidden = !hasDiscountValue;
    document.getElementById("offerMaximumDiscountField").hidden = discountType !== "percentage";
    valueInput.disabled = !hasDiscountValue;
    valueInput.required = hasDiscountValue;
    valueInput.min = discountType === "percentage" ? "1" : "0.01";
    valueInput.max = discountType === "percentage" ? "100" : "9999";
    valueInput.step = discountType === "percentage" ? "1" : "0.01";
    maximumInput.disabled = discountType !== "percentage";
    document.getElementById("offerDiscountValueUnit").textContent =
        discountType === "percentage" ? "(%)" : "(USD)";
}

function openOfferEditor(offer) {
    const fields = offerForm.elements;
    editingOfferId = offer ? offer.id : null;
    offerForm.reset();
    fields.namedItem("code").value = offer ? offer.code : "";
    fields.namedItem("name").value = offer ? offer.name : "";
    fields.namedItem("discountType").value = offer ? offer.discountType : "percentage";
    fields.namedItem("campaign").value = offer ? offer.campaign : "Standard";
    fields.namedItem("discountValue").value = offer && ["percentage", "flat"].includes(offer.discountType)
        ? offer.discountValue
        : "";
    fields.namedItem("minimumOrder").value = offer ? offer.minimumOrder : 0;
    fields.namedItem("maximumDiscount").value =
        offer && offer.discountType === "percentage" && offer.maximumDiscount > 0
            ? offer.maximumDiscount
            : "";
    fields.namedItem("startDate").value = offer ? offer.startDate : localDateValue(new Date());
    const defaultEndDate = new Date();
    defaultEndDate.setDate(defaultEndDate.getDate() + 30);
    fields.namedItem("endDate").value = offer ? offer.endDate : localDateValue(defaultEndDate);
    document.getElementById("offerEnabled").checked = offer ? offer.enabled : true;
    document.getElementById("offerDialogTitle").textContent = offer ? "Edit offer" : "Create offer";
    document.querySelector(".offer-save-button").textContent = offer ? "Save changes" : "Save offer";
    offerFormError.textContent = "";
    showOfferFeedback("", false);
    updateOfferFormControls();
    offerDialog.showModal();
}

function saveOfferForm(event) {
    event.preventDefault();
    offerFormError.textContent = "";
    const codeInput = document.getElementById("offerCode");
    codeInput.value = codeInput.value.trim().toUpperCase();
    if (!offerForm.reportValidity()) return;

    const fields = offerForm.elements;
    const existingOffer = promotions.find((offer) => offer.id === editingOfferId);
    const code = fields.namedItem("code").value.trim().toUpperCase();
    if (promotions.some((offer) => offer.id !== editingOfferId && offer.code.toUpperCase() === code)) {
        offerFormError.textContent = "That coupon code is already in use.";
        codeInput.focus();
        return;
    }

    const startDate = fields.namedItem("startDate").value;
    const endDate = fields.namedItem("endDate").value;
    if (startDate > endDate) {
        offerFormError.textContent = "Expiry date must be on or after the start date.";
        fields.namedItem("endDate").focus();
        return;
    }

    const discountType = fields.namedItem("discountType").value;
    const offer = {
        id: existingOffer ? existingOffer.id : `coupon-${crypto.randomUUID()}`,
        code,
        name: fields.namedItem("name").value.trim(),
        discountType,
        discountValue: ["percentage", "flat"].includes(discountType)
            ? Number(fields.namedItem("discountValue").value)
            : 0,
        minimumOrder: Number(fields.namedItem("minimumOrder").value),
        maximumDiscount: discountType === "percentage"
            ? Number(fields.namedItem("maximumDiscount").value || 0)
            : 0,
        campaign: fields.namedItem("campaign").value,
        startDate,
        endDate,
        enabled: document.getElementById("offerEnabled").checked,
    };
    const nextOffers = existingOffer
        ? promotions.map((candidate) => candidate.id === offer.id ? offer : candidate)
        : [...promotions, offer];

    if (persistPromotions(nextOffers)) {
        offerDialog.close();
        showOfferFeedback(`${offer.code} ${existingOffer ? "updated" : "created"} and saved.`, false);
    } else {
        offerFormError.textContent = offerFeedback.textContent;
    }
}

function saveReviewReply(reviewId) {
    const review = reviews.find((item) => item.id === reviewId);
    const textarea = Array.from(reviewList.querySelectorAll("[data-review-reply]"))
        .find((item) => item.dataset.reviewReply === reviewId);
    if (!review || !textarea) return;

    const reply = textarea.value.trim();
    if (!reply) {
        showReviewFeedback("Enter a reply before saving.", true);
        textarea.focus();
        return;
    }
    if (persistReviews(reviews.map((item) =>
        item.id === reviewId ? { ...item, reply } : item
    ))) {
        showReviewFeedback("Reply saved in this browser. Publishing it requires a review-platform integration.", false);
    }
}

function toggleReviewResolution(reviewId) {
    const review = reviews.find((item) => item.id === reviewId);
    if (!review || !isComplaintReview(review)) return;
    const resolved = !review.resolved;
    if (persistReviews(reviews.map((item) =>
        item.id === reviewId ? { ...item, resolved } : item
    ))) {
        showReviewFeedback(`Complaint ${resolved ? "marked resolved" : "reopened"}.`, false);
    }
}

function setMenuEditorImage(image) {
    pendingMenuImage = image;
    menuImagePreview.src = image;
    menuImagePreview.hidden = !image;
}

function openMenuEditor(item) {
    const fields = menuItemForm.elements;
    imageProcessingRequest += 1;
    document.querySelector(".menu-save-button").disabled = false;
    editingMenuItemId = item ? item.id : null;
    menuItemForm.reset();
    fields.namedItem("name").value = item ? item.name : "";
    fields.namedItem("description").value = item ? item.description : "";
    fields.namedItem("category").value = item ? item.category : window.HardeesMenu.categories[0];
    fields.namedItem("price").value = item ? item.price : "";
    fields.namedItem("foodType").value = item ? item.foodType : "non-veg";
    fields.namedItem("preparationMinutes").value = item ? item.preparationMinutes : "";
    fields.namedItem("sizes").value = item ? item.sizes.join(", ") : "";
    fields.namedItem("toppings").value = item ? item.toppings.join(", ") : "";
    fields.namedItem("extras").value = item ? item.extras.join(", ") : "";
    document.getElementById("menuItemAvailable").checked = item ? item.available : true;
    document.getElementById("menuItemBestseller").checked = item ? item.bestseller : false;
    document.getElementById("menuItemChefSpecial").checked = item ? item.chefSpecial : false;
    document.getElementById("menuDialogTitle").textContent = item ? "Edit food item" : "Add food item";
    document.querySelector(".menu-save-button").textContent = item ? "Save changes" : "Add food item";
    menuFormError.textContent = "";
    showMenuFeedback("", false);
    setMenuEditorImage(item ? item.image : "");
    menuDialog.showModal();
}

async function prepareMenuImage(file) {
    if (!file.type.startsWith("image/")) {
        throw new Error("Choose an image file.");
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 5 MB.");
    }

    const bitmap = await createImageBitmap(file);
    const maxDimension = 1000;
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
        bitmap.close();
        throw new Error("This browser could not process the selected image.");
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return canvas.toDataURL("image/jpeg", 0.82);
}

function renderOrderDetails(order) {
    activeOrderId = order.id;
    orderDialogTitle.textContent = order.id;
    orderDialogContent.innerHTML = `
        <div class="order-detail-meta">
            <div><span>Guest</span><strong>${escapeHtml(order.guest)}</strong></div>
            <div><span>Order type</span><strong>${escapeHtml(order.channel)}</strong></div>
            <div><span>Placed</span><strong>${escapeHtml(order.placed)}</strong></div>
            <div><span>Status</span><strong class="order-status status-${order.status}">${statusLabels[order.status]}</strong></div>
        </div>
        <h3 class="order-items-title">Order items</h3>
        <ul class="order-detail-items">
            ${order.items.map((item) => `
                <li><span><b>${item.quantity}×</b> ${escapeHtml(item.name)}</span><strong>${currency.format(item.quantity * item.price)}</strong></li>
            `).join("")}
        </ul>
        <div class="order-detail-total"><span>Order total</span><strong>${currency.format(orderTotal(order))}</strong></div>`;

    const nextStep = nextOrderStep[order.status];
    advanceOrderButton.hidden = !nextStep;
    advanceOrderButton.textContent = nextStep ? nextStep.label : "";
    cancelOrderButton.hidden = ["completed", "cancelled"].includes(order.status);
}

function updateOrderStatus(order, status) {
    order.status = status;
    renderOrders();
    renderOrderDetails(order);
}

function updateActiveSection() {
    const requestedSection = window.location.hash.slice(1) || "overview";
    const sections = ["overview", "orders", "menu", "offers", "reviews", "staff", "notifications"];
    const section = sections.includes(requestedSection)
        ? requestedSection
        : "overview";
    const targetSelector = {
        overview: ".admin-welcome",
        orders: "#orders",
        menu: "#menu",
        offers: "#offers",
        reviews: "#reviews",
        staff: "#staff",
        notifications: "#notifications",
    }[section];

    document.querySelectorAll(".admin-nav-item").forEach((item) => {
        const isActive = item.dataset.section === section;
        item.classList.toggle("active", isActive);
        if (isActive) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
    });

    const target = document.querySelector(targetSelector);
    if (target) {
        target.classList.remove("admin-highlight");
        void target.offsetWidth;
        target.classList.add("admin-highlight");
    }
    adminSidebar.classList.remove("open");
}

if (sessionStorage.getItem("adminSession") !== "DEMO1001") {
    window.location.replace("index.html#employee-login");
} else {
    adminDate.textContent = new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    try {
        staffMembers = loadStaffMembers();
    } catch (error) {
        console.error("Could not load staff records.", error);
        staffDataReady = false;
        showStaffFeedback(error.message || "Could not load staff records.", true);
        document.getElementById("addStaffButton").disabled = true;
    }
    try {
        notifications = loadNotifications();
    } catch (error) {
        console.error("Could not load notifications.", error);
        notificationDataReady = false;
        showNotificationFeedback(error.message || "Could not load notifications.", true);
        document.getElementById("markAllNotificationsRead").disabled = true;
    }
    try {
        promotions = window.HardeesPromotions.load();
    } catch (error) {
        console.error("Could not load promotions.", error);
        promotionDataReady = false;
        showOfferFeedback(error.message || "Could not load offers.", true);
        document.getElementById("addOfferButton").disabled = true;
    }
    try {
        reviews = loadReviews();
    } catch (error) {
        console.error("Could not load reviews.", error);
        reviewDataReady = false;
        showReviewFeedback(error.message || "Could not load reviews.", true);
    }

    adminMenuToggle.addEventListener("click", () => adminSidebar.classList.toggle("open"));
    document.getElementById("adminLogout").addEventListener("click", () => {
        sessionStorage.removeItem("adminSession");
        window.location.href = "index.html#employee-login";
    });

    document.getElementById("addStaffButton").addEventListener("click", () => {
        if (staffDataReady) openStaffEditor(null);
    });
    staffSearch.addEventListener("input", renderStaff);
    staffStatusFilter.addEventListener("change", renderStaff);
    staffTableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-edit-staff]");
        if (!button) return;
        const member = staffMembers.find((candidate) => candidate.id === button.dataset.editStaff);
        if (member) openStaffEditor(member);
    });
    staffForm.addEventListener("submit", saveStaffForm);
    document.getElementById("closeStaffDialog").addEventListener("click", () => staffDialog.close());
    document.getElementById("cancelStaffEdit").addEventListener("click", () => staffDialog.close());

    document.getElementById("addOfferButton").addEventListener("click", () => {
        if (promotionDataReady) openOfferEditor(null);
    });
    offerSearch.addEventListener("input", renderPromotions);
    offerStatusFilter.addEventListener("change", renderPromotions);
    document.getElementById("offerDiscountType").addEventListener("change", updateOfferFormControls);
    document.getElementById("offerCode").addEventListener("input", (event) => {
        event.target.value = event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    });
    offerForm.addEventListener("submit", saveOfferForm);
    document.getElementById("closeOfferDialog").addEventListener("click", () => offerDialog.close());
    document.getElementById("cancelOfferEdit").addEventListener("click", () => offerDialog.close());
    adminOffersGrid.addEventListener("click", (event) => {
        const toggleButton = event.target.closest("[data-toggle-offer]");
        const editButton = event.target.closest("[data-edit-offer]");
        const deleteButton = event.target.closest("[data-delete-offer]");
        if (toggleButton) {
            const offer = promotions.find((candidate) => candidate.id === toggleButton.dataset.toggleOffer);
            if (offer && persistPromotions(promotions.map((candidate) =>
                candidate.id === offer.id ? { ...candidate, enabled: !candidate.enabled } : candidate
            ))) {
                showOfferFeedback(`${offer.code} ${offer.enabled ? "disabled" : "enabled"}.`, false);
            }
            return;
        }
        if (editButton) {
            const offer = promotions.find((candidate) => candidate.id === editButton.dataset.editOffer);
            if (offer && promotionDataReady) openOfferEditor(offer);
            return;
        }
        if (deleteButton) {
            const offer = promotions.find((candidate) => candidate.id === deleteButton.dataset.deleteOffer);
            if (!offer || !window.confirm(`Delete the ${offer.code} offer?`)) return;
            if (persistPromotions(promotions.filter((candidate) => candidate.id !== offer.id))) {
                showOfferFeedback(`${offer.code} was deleted.`, false);
            }
        }
    });

    reviewSearch.addEventListener("input", renderReviews);
    reviewRatingFilter.addEventListener("change", renderReviews);
    reviewStatusFilter.addEventListener("change", renderReviews);
    reviewList.addEventListener("click", (event) => {
        if (!reviewDataReady) return;
        const saveButton = event.target.closest("[data-save-review-reply]");
        const resolutionButton = event.target.closest("[data-toggle-review-resolution]");
        if (saveButton) {
            saveReviewReply(saveButton.dataset.saveReviewReply);
            return;
        }
        if (resolutionButton) {
            toggleReviewResolution(resolutionButton.dataset.toggleReviewResolution);
        }
    });

    notificationFilter.addEventListener("change", renderNotifications);
    document.getElementById("markAllNotificationsRead").addEventListener("click", () => {
        if (notificationDataReady) {
            persistNotifications(notifications.map((item) => ({ ...item, read: true })));
        }
    });
    notificationList.addEventListener("click", (event) => {
        const button = event.target.closest("[data-mark-notification-read]");
        if (!button || !notificationDataReady) return;
        const notificationId = button.dataset.markNotificationRead;
        persistNotifications(notifications.map((item) =>
            item.id === notificationId ? { ...item, read: true } : item
        ));
    });

    orderSearch.addEventListener("input", renderOrders);
    orderStatusFilter.addEventListener("change", renderOrders);
    document.getElementById("refreshOrders").addEventListener("click", () => {
        document.getElementById("ordersUpdated").textContent =
            `Refreshed ${new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
        renderOrders();
    });

    ordersTableBody.addEventListener("click", (event) => {
        const button = event.target.closest("[data-view-order]");
        if (!button) return;
        const order = orders.find((candidate) => candidate.id === button.dataset.viewOrder);
        if (!order) return;
        renderOrderDetails(order);
        orderDialog.showModal();
    });

    document.getElementById("closeOrderDialog").addEventListener("click", () => orderDialog.close());
    advanceOrderButton.addEventListener("click", () => {
        const order = orders.find((candidate) => candidate.id === activeOrderId);
        if (!order || !nextOrderStep[order.status]) return;
        updateOrderStatus(order, nextOrderStep[order.status].status);
    });
    cancelOrderButton.addEventListener("click", () => {
        const order = orders.find((candidate) => candidate.id === activeOrderId);
        if (order && !["completed", "cancelled"].includes(order.status)) {
            updateOrderStatus(order, "cancelled");
        }
    });

    document.getElementById("addMenuItemButton").addEventListener("click", () => openMenuEditor(null));
    menuSearch.addEventListener("input", renderMenu);
    menuCategoryFilter.addEventListener("change", renderMenu);
    menuAvailabilityFilter.addEventListener("change", renderMenu);

    menuGrid.addEventListener("click", (event) => {
        const toggleButton = event.target.closest("[data-toggle-menu]");
        const editButton = event.target.closest("[data-edit-menu]");
        const deleteButton = event.target.closest("[data-delete-menu]");
        if (toggleButton) {
            const item = menuItems.find((candidate) => candidate.id === toggleButton.dataset.toggleMenu);
            if (item && persistMenuItems(menuItems.map((candidate) =>
                candidate.id === item.id ? { ...candidate, available: !candidate.available } : candidate
            ))) {
                showMenuFeedback(`${item.name} availability updated.`, false);
            }
            return;
        }
        if (editButton) {
            const item = menuItems.find((candidate) => candidate.id === editButton.dataset.editMenu);
            if (item) openMenuEditor(item);
            return;
        }
        if (deleteButton) {
            const item = menuItems.find((candidate) => candidate.id === deleteButton.dataset.deleteMenu);
            if (!item || !window.confirm(`Remove "${item.name}" from the menu?`)) return;
            if (persistMenuItems(menuItems.filter((candidate) => candidate.id !== item.id))) {
                showMenuFeedback(`${item.name} was removed from the menu.`, false);
            }
        }
    });

    menuItemImage.addEventListener("change", async () => {
        const file = menuItemImage.files[0];
        if (!file) return;

        const requestId = ++imageProcessingRequest;
        const saveButton = document.querySelector(".menu-save-button");
        const existingItem = menuItems.find((item) => item.id === editingMenuItemId);
        saveButton.disabled = true;
        setMenuEditorImage(existingItem ? existingItem.image : "");
        menuFormError.textContent = "";
        try {
            const image = await prepareMenuImage(file);
            if (menuItemImage.files[0] !== file) return;
            setMenuEditorImage(image);
        } catch (error) {
            if (requestId !== imageProcessingRequest) return;
            console.error("Could not process the selected menu image.", error);
            menuFormError.textContent = error.message || "Could not process this image.";
        } finally {
            if (requestId === imageProcessingRequest) saveButton.disabled = false;
        }
    });

    menuItemForm.addEventListener("submit", (event) => {
        event.preventDefault();
        menuFormError.textContent = "";
        if (!menuItemForm.reportValidity()) return;

        const existingItem = menuItems.find((item) => item.id === editingMenuItemId);
        if (!existingItem && !pendingMenuImage) {
            menuFormError.textContent = "Upload a food image before adding this item.";
            menuItemImage.focus();
            return;
        }

        const fields = menuItemForm.elements;
        const name = fields.namedItem("name").value.trim();
        const description = fields.namedItem("description").value.trim();
        if (!name || !description) {
            menuFormError.textContent = "Enter a food name and description.";
            return;
        }
        const item = {
            id: existingItem ? existingItem.id : `menu-${crypto.randomUUID()}`,
            name,
            description,
            category: fields.namedItem("category").value,
            price: Number(fields.namedItem("price").value),
            image: pendingMenuImage || existingItem.image,
            available: document.getElementById("menuItemAvailable").checked,
            foodType: fields.namedItem("foodType").value,
            bestseller: document.getElementById("menuItemBestseller").checked,
            chefSpecial: document.getElementById("menuItemChefSpecial").checked,
            sizes: parseMenuChoices(fields.namedItem("sizes").value),
            toppings: parseMenuChoices(fields.namedItem("toppings").value),
            extras: parseMenuChoices(fields.namedItem("extras").value),
            preparationMinutes: Number(fields.namedItem("preparationMinutes").value),
            ...(existingItem && existingItem.detailsUrl ? { detailsUrl: existingItem.detailsUrl } : {}),
        };
        const nextItems = existingItem
            ? menuItems.map((candidate) => candidate.id === item.id ? item : candidate)
            : [...menuItems, item];

        if (persistMenuItems(nextItems)) {
            menuDialog.close();
            showMenuFeedback(`${item.name} ${existingItem ? "updated" : "added"} and published to the public menu.`, false);
        } else {
            menuFormError.textContent = menuFeedback.textContent;
        }
    });

    document.getElementById("closeMenuDialog").addEventListener("click", () => menuDialog.close());
    document.getElementById("cancelMenuEdit").addEventListener("click", () => menuDialog.close());

    window.addEventListener("hashchange", updateActiveSection);
    populateMenuCategories();
    renderMenu();
    renderOrders();
    renderPromotions();
    renderReviews();
    renderStaff();
    renderNotifications();
    updateActiveSection();
}
