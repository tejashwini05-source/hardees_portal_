(function () {
    const storageKey = "hardeesPromotions";
    const discountTypes = ["percentage", "flat", "free-delivery", "bogo"];
    const campaignTypes = ["Standard", "Festive", "First order"];

    const defaultOffers = [];

    function isDate(value) {
        return typeof value === "string" &&
            /^\d{4}-\d{2}-\d{2}$/.test(value) &&
            Number.isFinite(Date.parse(`${value}T00:00:00`));
    }

    function isValidOffer(offer) {
        if (!offer || typeof offer.id !== "string" || !offer.id ||
            typeof offer.code !== "string" || !/^[A-Z0-9_-]{3,24}$/.test(offer.code) ||
            typeof offer.name !== "string" || !offer.name.trim() ||
            !discountTypes.includes(offer.discountType) ||
            !campaignTypes.includes(offer.campaign) ||
            !Number.isFinite(offer.discountValue) || offer.discountValue < 0 ||
            !Number.isFinite(offer.minimumOrder) || offer.minimumOrder < 0 ||
            !Number.isFinite(offer.maximumDiscount) || offer.maximumDiscount < 0 ||
            !isDate(offer.startDate) || !isDate(offer.endDate) ||
            offer.startDate > offer.endDate || typeof offer.enabled !== "boolean") {
            return false;
        }

        if (offer.discountType === "percentage") {
            return offer.discountValue > 0 && offer.discountValue <= 100;
        }
        if (offer.discountType === "flat") {
            return offer.discountValue > 0;
        }
        return offer.discountValue === 0 && offer.maximumDiscount === 0;
    }

    function validateOffers(offers) {
        if (!Array.isArray(offers) || offers.some((offer) => !isValidOffer(offer))) {
            throw new Error("Saved promotion data is invalid. Review or clear the promotion data.");
        }
        const codes = offers.map((offer) => offer.code.toUpperCase());
        if (new Set(codes).size !== codes.length) {
            throw new Error("Promotion codes must be unique.");
        }
    }

    function load() {
        const savedOffers = localStorage.getItem(storageKey);
        const offers = savedOffers === null ? defaultOffers : JSON.parse(savedOffers);
        validateOffers(offers);
        return offers;
    }

    function save(offers) {
        validateOffers(offers);
        localStorage.setItem(storageKey, JSON.stringify(offers));
    }

    window.HardeesPromotions = {
        storageKey,
        discountTypes,
        campaignTypes,
        load,
        save,
    };
})();
