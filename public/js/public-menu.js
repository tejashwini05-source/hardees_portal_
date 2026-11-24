const publicMenuGrid = document.getElementById("publicMenuGrid");
const publicMenuEmpty = document.getElementById("publicMenuEmpty");
const publicCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
});
const apiUnavailableMessage =
    "The API server is unavailable. Start the website with npm run dev.";

function escapeMenuHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    })[character]);
}

async function renderPublicMenu() {
    const response = await fetch("/api/menu");
    if (!(response.headers.get("content-type") || "").includes("application/json")) {
        throw new Error(apiUnavailableMessage);
    }
    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error?.message || "Menu could not be loaded.");
    }
    if (!Array.isArray(result.items)) {
        throw new Error("The menu response is invalid.");
    }

    const menuItems = result.items
        .filter((item) => item.available)
        .sort((a, b) =>
            Number(Boolean(b.bestseller || b.chefSpecial)) -
            Number(Boolean(a.bestseller || a.chefSpecial))
        )
        .slice(0, 4);
    publicMenuGrid.innerHTML = menuItems.map((item) => {
        const sizes = Array.isArray(item.sizes) ? item.sizes : [];
        const toppings = Array.isArray(item.toppings) ? item.toppings : [];
        const extras = Array.isArray(item.extras) ? item.extras : [];
        const specialBadges = [
            item.bestseller ? '<span class="menu-special-badge">Bestseller</span>' : "",
            item.chefSpecial ? '<span class="menu-special-badge chef">Chef’s Special</span>' : "",
        ].filter(Boolean).join("");
        const customization = [
            sizes.length ? `<p><strong>Sizes:</strong> ${sizes.map(escapeMenuHtml).join(", ")}</p>` : "",
            toppings.length ? `<p><strong>Toppings:</strong> ${toppings.map(escapeMenuHtml).join(", ")}</p>` : "",
            extras.length ? `<p><strong>Extras:</strong> ${extras.map(escapeMenuHtml).join(", ")}</p>` : "",
        ].filter(Boolean).join("");

        return `
            <article class="menu-card${item.available ? "" : " out-of-stock"}">
                <div class="food-image">
                    <img src="${escapeMenuHtml(item.image)}" alt="${escapeMenuHtml(item.name)}" loading="lazy" decoding="async">
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

renderPublicMenu().catch((error) => {
    console.error("Could not load the public menu.", error);
    publicMenuGrid.replaceChildren();
    publicMenuEmpty.hidden = false;
    publicMenuEmpty.textContent = error.message || "The menu could not be loaded.";
});
