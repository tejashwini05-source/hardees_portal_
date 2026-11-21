(function () {
    const storageKey = "hardeesPromotions";
    const discountTypes = ["percentage", "flat", "free-delivery", "bogo"];
    const campaignTypes = ["Standard", "Festive", "First order"];

    function toDateInputValue(date) {
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        return localDate.toISOString().slice(0, 10);
    }

    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return toDateInputValue(result);
    }

    const today = toDateInputValue(new Date());
    const defaultOffers = [
        {
            id: "coupon-welcome20",
            code: "WELCOME20",
            name: "Welcome offer",
            discountType: "percentage",
            discountValue: 20,
            minimumOrder: 25,
            maximumDiscount: 10,
            campaign: "First order",
            startDate: today,
            endDate: addDays(new Date(), 30),
            enabled: true,
        },
        {
            id: "coupon-festive15",
            code: "FESTIVE15",
            name: "Festive favorites",
            discountType: "percentage",
            discountValue: 15,
            minimumOrder: 20,
            maximumDiscount: 8,
            campaign: "Festive",
            startDate: today,
            endDate: addDays(new Date(), 45),
            enabled: true,
        },
        {
            id: "coupon-freeship",
            code: "FREESHIP",
            name: "Free delivery",
            discountType: "free-delivery",
            discountValue: 0,
            minimumOrder: 15,
            maximumDiscount: 0,
            campaign: "Standard",
            startDate: today,
            endDate: addDays(new Date(), 30),
            enabled: true,
        },
        {
            id: "coupon-bogo",
            code: "BUY1GET1",
            name: "Burger BOGO",
            discountType: "bogo",
            discountValue: 0,
            minimumOrder: 0,
            maximumDiscount: 0,
            campaign: "Standard",
            startDate: today,
            endDate: addDays(new Date(), 14),
            enabled: true,
        },
    ];

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
