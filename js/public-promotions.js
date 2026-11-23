(function () {
    const offersGrid = document.getElementById("publicOffersGrid");
    const offersMessage = document.getElementById("publicOffersMessage");
    const offersSection = document.getElementById("offers");
    const offersLinks = document.querySelectorAll('a[href="#offers"]');
    const currency = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    });

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        })[character]);
    }

    function localDateValue(date) {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 10);
    }

    function discountLabel(offer) {
        if (offer.discountType === "percentage") return `${offer.discountValue}% OFF`;
        if (offer.discountType === "flat") return `${currency.format(offer.discountValue)} OFF`;
        if (offer.discountType === "free-delivery") return "FREE DELIVERY";
        return "BUY 1 GET 1";
    }

    function renderOffers() {
        try {
            const today = localDateValue(new Date());
            const offers = window.HardeesPromotions.load().filter((offer) =>
                offer.enabled && offer.startDate <= today && offer.endDate >= today
            );
            const hasOffers = offers.length > 0;
            offersSection.hidden = !hasOffers;
            offersLinks.forEach((link) => {
                link.hidden = !hasOffers;
            });
            offersGrid.innerHTML = offers.map((offer) => {
                const minimum = offer.minimumOrder > 0
                    ? `Minimum order ${currency.format(offer.minimumOrder)}`
                    : "No minimum order";
                const maximum = offer.discountType === "percentage" && offer.maximumDiscount > 0
                    ? ` · Save up to ${currency.format(offer.maximumDiscount)}`
                    : "";
                const validUntil = new Date(`${offer.endDate}T00:00:00`).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                });
                return `
                    <article class="public-offer-card">
                        <div class="public-offer-heading">
                            <span class="public-offer-campaign">${escapeHtml(offer.campaign)}</span>
                            <span class="public-offer-discount">${escapeHtml(discountLabel(offer))}</span>
                        </div>
                        <h3>${escapeHtml(offer.name)}</h3>
                        <p class="public-offer-code">Use code <strong>${escapeHtml(offer.code)}</strong></p>
                        <p class="public-offer-terms">${escapeHtml(minimum + maximum)}</p>
                        <p class="public-offer-expiry">Valid through ${escapeHtml(validUntil)}</p>
                    </article>`;
            }).join("");
            offersMessage.textContent = "";
        } catch (error) {
            console.error("Could not load public promotions.", error);
            offersSection.hidden = false;
            offersLinks.forEach((link) => {
                link.hidden = false;
            });
            offersGrid.replaceChildren();
            offersMessage.textContent = "Current offers are temporarily unavailable.";
        }
    }

    renderOffers();
    window.addEventListener("storage", (event) => {
        if (event.key === window.HardeesPromotions.storageKey || event.key === null) {
            renderOffers();
        }
    });
})();
