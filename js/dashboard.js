const checkInButton = document.getElementById("checkInButton");
const workStatus = document.getElementById("workStatus");
const workedHours = document.getElementById("workedHours");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const currentDate = document.getElementById("currentDate");
const currentTime = document.getElementById("currentTime");

let checkedIn = false;
let hoursToday = 0;
let checkInStartedAt = null;

function updateWorkedHours() {
    if (checkedIn && checkInStartedAt) {
        const elapsedHours = (Date.now() - checkInStartedAt) / 3600000;
        hoursToday = Math.max(0, elapsedHours);
    }
    const formatted = hoursToday.toFixed(1);
    workedHours.textContent = formatted;
}

function syncCheckInControls() {
    const statusText = checkedIn ? "Checked In" : "Checked Out";
    workStatus.classList.toggle("checked-in", checkedIn);
    workStatus.innerHTML = `<span></span> ${statusText}`;
    checkInButton.classList.toggle("checked", checkedIn);
    checkInButton.innerHTML = checkedIn ? "<span>✓</span> CHECK OUT" : "<span>✓</span> CHECK IN";
    updateWorkedHours();
}

function updateDateTime() {
    const now = new Date();
    currentDate.textContent = now.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
    currentTime.textContent = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function toggleCheckIn() {
    checkedIn = !checkedIn;
    if (checkedIn) {
        checkInStartedAt = Date.now();
        sessionStorage.setItem("employeeCheckInStartedAt", String(checkInStartedAt));
        showToast("Check-in recorded. Your shift has started.");
    } else {
        checkInStartedAt = null;
        sessionStorage.removeItem("employeeCheckInStartedAt");
        hoursToday = 0;
        showToast("Check-out recorded. Thank you for today.");
    }
    syncCheckInControls();
}

checkInButton.addEventListener("click", toggleCheckIn);

mobileMenuButton.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", () => sidebar.classList.remove("open"));
});

const sectionHighlights = {
    dashboard: ".welcome-row",
    checkin: ".hero-card",
    schedule: ".upcoming-panel",
    hours: ".yellow-card",
    "daily-hours": ".red-card",
    performance: ".overview-grid .neutral-card",
    pay: ".activity-panel",
    profile: ".profile-strip",
};

function highlightDashboardSection(section) {
    document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
        const isActive = item.dataset.section === section;
        item.classList.toggle("active", isActive);
        if (isActive) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
    });

    const target = document.querySelector(sectionHighlights[section]);
    if (!target) return;
    target.classList.remove("dashboard-highlight");
    void target.offsetWidth;
    target.classList.add("dashboard-highlight");

    const bounds = target.getBoundingClientRect();
    if (bounds.top < 82 || bounds.bottom > window.innerHeight) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
}

function handleLocationHash() {
    const section = window.location.hash.slice(1);
    const validSection = Object.prototype.hasOwnProperty.call(sectionHighlights, section)
        ? section
        : "dashboard";
    highlightDashboardSection(validSection);
}

window.addEventListener("hashchange", handleLocationHash);

document.getElementById("logoutButton").addEventListener("click", () => {
    sessionStorage.removeItem("employeeSession");
    window.location.href = "index.html#employee-login";
});

if (sessionStorage.getItem("employeeSession") !== "DEMO1001") {
    sessionStorage.setItem("employeeSession", "DEMO1001");
}

const savedCheckInStart = Number(sessionStorage.getItem("employeeCheckInStartedAt"));
if (savedCheckInStart) {
    checkedIn = true;
    checkInStartedAt = savedCheckInStart;
}

updateDateTime();
handleLocationHash();
syncCheckInControls();
window.setInterval(() => {
    updateDateTime();
    updateWorkedHours();
}, 1000);
