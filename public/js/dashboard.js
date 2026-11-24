const checkInButton = document.getElementById("checkInButton");
const workStatus = document.getElementById("workStatus");
const workedHours = document.getElementById("workedHours");
const toast = document.getElementById("toast");
const sidebar = document.getElementById("sidebar");
const mobileMenuButton = document.getElementById("mobileMenuButton");
const currentDate = document.getElementById("currentDate");
const currentWeekday = document.getElementById("currentWeekday");
const currentTime = document.getElementById("currentTime");

let checkedIn = false;
let hoursToday = 0;
let checkInStartedAt = null;

async function apiRequest(path, options = {}) {
    const request = {
        method: options.method || "GET",
        credentials: "same-origin",
        headers: {},
    };
    if (options.body !== undefined) {
        request.headers["Content-Type"] = "application/json";
        request.body = JSON.stringify(options.body);
    }

    const response = await fetch(path, request);
    if (!(response.headers.get("content-type") || "").includes("application/json")) {
        throw new Error(
            "The API server is unavailable. Start the website with npm run dev:vercel."
        );
    }
    let result;
    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }
    if (!response.ok) {
        const error = new Error(result.error?.message || "The request could not be completed.");
        error.status = response.status;
        throw error;
    }
    return result;
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function updateWorkedHours() {
    if (checkedIn && checkInStartedAt) {
        const elapsedHours = (Date.now() - checkInStartedAt.getTime()) / 3_600_000;
        hoursToday = Math.max(0, elapsedHours);
    }
    workedHours.textContent = hoursToday.toFixed(1);
}

function syncCheckInControls() {
    const statusText = checkedIn ? "Checked In" : "Checked Out";
    workStatus.classList.toggle("checked-in", checkedIn);
    workStatus.innerHTML = `<span></span> ${statusText}`;
    checkInButton.classList.toggle("checked", checkedIn);
    checkInButton.innerHTML = checkedIn
        ? "<span>✓</span> CHECK OUT"
        : "<span>✓</span> CHECK IN";
    document.getElementById("workStatusHint").textContent = checkedIn
        ? "Your shift is currently in progress."
        : "Clock in to begin your shift.";
    updateWorkedHours();
}

function updateDateTime() {
    const now = new Date();
    currentWeekday.textContent = now.toLocaleDateString("en-US", {
        weekday: "long",
    }).toUpperCase();
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

function employeeInitials(name) {
    return name
        .trim()
        .split(/\s+/)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function renderEmployee(user) {
    const firstName = user.name.split(/\s+/)[0];
    const initials = employeeInitials(user.name) || "S";
    const position = user.position || "Staff";
    const shift = user.shift || "Shift not set";
    const shiftHours = user.shiftHours || "Schedule not set";
    const workDays = user.workDays || "Work days not set";

    document.getElementById("sidebarEmployeeName").textContent = user.name;
    document.getElementById("sidebarEmployeeId").textContent = user.staffId;
    document.getElementById("sidebarEmployeeAvatar").textContent = initials;
    document.getElementById("profileChipName").textContent = user.name;
    document.getElementById("profileChipRole").textContent = position;
    document.getElementById("profileChipAvatar").textContent = initials;
    document.getElementById("welcomeHeading").textContent = `Welcome back, ${firstName}!`;
    document.getElementById("shiftName").textContent = `${shift} shift`;
    document.getElementById("shiftHours").textContent = shiftHours;
    document.getElementById("weekHours").textContent = "0.0";
    document.getElementById("performanceScore").textContent =
        String(Number.isFinite(user.performanceScore) ? user.performanceScore : 0);
    const attendanceRate = Number.isFinite(user.attendanceRate) ? user.attendanceRate : 0;
    document.getElementById("attendanceRate").textContent = `${attendanceRate}%`;
    document.getElementById("upcomingShiftName").textContent = `${shift} shift`;
    document.getElementById("upcomingShiftHours").textContent = shiftHours;
    document.getElementById("upcomingWorkDays").textContent = workDays;
    document.getElementById("scheduleShift").textContent = shift;
    document.getElementById("employeeProfileAvatar").textContent = initials;
    document.getElementById("employeeProfileName").textContent = user.name;
    document.getElementById("employeeProfileId").textContent = user.staffId;
    document.getElementById("employeeProfileRole").textContent = position;
    document.getElementById("employeeDetailsId").textContent = user.staffId;
    document.getElementById("employeeDetailsRole").textContent = position;
}

function formatAttendanceDate(dateKey) {
    const [year, month, day] = dateKey.split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
    });
}

function attendanceHours(record) {
    const start = new Date(record.checkInAt).getTime();
    const end = record.checkOutAt ? new Date(record.checkOutAt).getTime() : Date.now();
    return Math.max(0, (end - start) / 3_600_000);
}

function renderAttendanceActivity(records) {
    const activityList = document.getElementById("attendanceActivity");
    if (!records.length) {
        activityList.innerHTML = "<p>No attendance activity yet.</p>";
        return;
    }

    activityList.innerHTML = records.slice(0, 3).map((record) => {
        const isComplete = Boolean(record.checkOutAt);
        const hours = attendanceHours(record).toFixed(1);
        const start = new Date(record.checkInAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
        const end = isComplete
            ? new Date(record.checkOutAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
            })
            : "In progress";
        return `
            <div class="activity-item">
                <div class="activity-icon ${isComplete ? "success" : "muted"}">${isComplete ? "✓" : "◷"}</div>
                <div><strong>${isComplete ? "Shift completed" : "Shift in progress"}</strong><p>${formatAttendanceDate(record.date)} · ${start} – ${end}</p></div>
                <span>${hours} hrs</span>
            </div>`;
    }).join("");
}

function applyAttendance(result) {
    checkedIn = Boolean(result.checkedIn);
    checkInStartedAt = result.checkedIn && result.today
        ? new Date(result.today.checkInAt)
        : null;
    if (!checkedIn && Number.isFinite(result.todayHours)) {
        hoursToday = result.todayHours;
    }
    if (Number.isFinite(result.weekHours)) {
        document.getElementById("weekHours").textContent = result.weekHours.toFixed(1);
    }
    if (Array.isArray(result.records)) {
        renderAttendanceActivity(result.records);
    }
    syncCheckInControls();
}

async function loadAttendance() {
    const attendance = await apiRequest("/api/attendance");
    applyAttendance(attendance);
}

async function toggleCheckIn() {
    if (checkInButton.disabled) return;
    checkInButton.disabled = true;
    const action = checkedIn ? "check-out" : "check-in";
    try {
        const result = await apiRequest("/api/attendance", {
            method: "POST",
            body: { action },
        });
        applyAttendance(result);
        showToast(action === "check-in"
            ? "Check-in recorded. Your shift has started."
            : "Check-out recorded. Thank you for today.");
        try {
            await loadAttendance();
        } catch (error) {
            console.error("Attendance was saved, but the latest totals could not be loaded.", error);
        }
    } catch (error) {
        console.error("Could not record attendance.", error);
        showToast(error.message || "Could not record attendance.");
    } finally {
        checkInButton.disabled = false;
    }
}

function highlightDashboardSection(section) {
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
    const validSections = [
        "dashboard",
        "checkin",
        "schedule",
        "hours",
        "daily-hours",
        "performance",
        "pay",
        "profile",
    ];
    highlightDashboardSection(validSections.includes(section) ? section : "dashboard");
}

async function signOut() {
    try {
        await apiRequest("/api/auth/logout", { method: "POST" });
    } catch (error) {
        console.error("Could not revoke the staff session.", error);
    }
    window.location.href = "index.html#employee-login";
}

async function initializeEmployeeDashboard() {
    let session;
    try {
        session = await apiRequest("/api/auth/me");
    } catch (error) {
        if (error.status === 401) {
            window.location.replace("index.html#employee-login");
            return;
        }
        console.error("Could not verify the staff session.", error);
        showToast(error.message || "The staff portal is unavailable.");
        checkInButton.disabled = true;
        return;
    }

    if (session.user.role !== "staff") {
        window.location.replace(
            session.user.role === "admin"
                ? "admin-dashboard.html"
                : "index.html#employee-login"
        );
        return;
    }

    renderEmployee(session.user);
    updateDateTime();
    handleLocationHash();
    mobileMenuButton.addEventListener("click", () => sidebar.classList.toggle("open"));
    document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
        item.addEventListener("click", () => sidebar.classList.remove("open"));
    });
    window.addEventListener("hashchange", handleLocationHash);
    document.getElementById("logoutButton").addEventListener("click", signOut);
    checkInButton.addEventListener("click", toggleCheckIn);
    checkInButton.disabled = true;

    try {
        await loadAttendance();
        checkInButton.disabled = false;
    } catch (error) {
        console.error("Could not load attendance.", error);
        showToast(error.message || "Attendance information is unavailable.");
    }

    window.setInterval(() => {
        updateDateTime();
        updateWorkedHours();
    }, 1000);
}

initializeEmployeeDashboard().catch((error) => {
    console.error("Could not initialize the employee dashboard.", error);
    showToast("The employee dashboard could not be loaded.");
});
