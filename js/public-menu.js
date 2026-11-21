const publicMenuGrid = document.getElementById("publicMenuGrid");
const publicMenuEmpty = document.getElementById("publicMenuEmpty");
const publicCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});

function escapeMenuHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

function renderPublicMenu() {
    const menuItems = window.HardeesMenu.load();
    publicMenuGrid.innerHTML = menuItems.map((item) => {
        const specialBadges = [
            item.bestseller ? '<span class="menu-special-badge">Bestseller</span>' : "",
            item.chefSpecial ? '<span class="menu-special-badge chef">Chef’s Special</span>' : "",
        ].filter(Boolean).join("");
        const customization = [
            item.sizes.length ? `<p><strong>Sizes:</strong> ${item.sizes.map(escapeMenuHtml).join(", ")}</p>` : "",
            item.toppings.length ? `<p><strong>Toppings:</strong> ${item.toppings.map(escapeMenuHtml).join(", ")}</p>` : "",
            item.extras.length ? `<p><strong>Extras:</strong> ${item.extras.map(escapeMenuHtml).join(", ")}</p>` : "",
        ].filter(Boolean).join("");

        return `
            <article class="menu-card${item.available ? "" : " out-of-stock"}">
                <div class="food-image">
                    <img src="${escapeMenuHtml(item.image)}" alt="${escapeMenuHtml(item.name)}">
                    <span class="menu-stock-badge">${item.available ? "Available" : "Out of Stock"}</span>
                </div>
                <div class="menu-content">
                    <div class="public-menu-badges">
                        <span class="menu-category">${escapeMenuHtml(item.category)}</span>
                        <span class="food-type-badge ${item.foodType === "veg" ? "veg" : "non-veg"}">${item.foodType === "veg" ? "Veg" : "Non-Veg"}</span>
                        ${specialBadges}
                    </div>
                    <h3>${escapeMenuHtml(item.name)}</h3>
                    <p>${escapeMenuHtml(item.description)}</p>
                    ${customization ? `<div class="menu-customizations">${customization}</div>` : ""}
                    <div class="public-menu-footer">
                        <strong>${publicCurrency.format(item.price)}</strong>
                        <span>Ready in ${Number(item.preparationMinutes)} min</span>
                    </div>
                    ${item.available && item.detailsUrl ? `<a href="${escapeMenuHtml(item.detailsUrl)}" target="_blank" rel="noopener noreferrer">VIEW DETAILS →</a>` : ""}
                </div>
            </article>`;
    }).join("");
    publicMenuEmpty.hidden = menuItems.length > 0;
}

renderPublicMenu();
window.addEventListener("storage", (event) => {
    if (event.key === window.HardeesMenu.storageKey || event.key === null) {
        renderPublicMenu();
    }
});
