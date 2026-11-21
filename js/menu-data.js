(function () {
    const storageKey = "hardeesMenuItems";
    const categories = ["Starters", "Main Course", "Desserts", "Drinks"];
    const defaultItems = [
        {
            id: "famous-star",
            name: "Famous Star Combo",
            description: "Charbroiled beef, cheese, fresh lettuce, tomato, and classic sauce.",
            category: "Main Course",
            price: 9.99,
            image: "images/menu-burger.jpg",
            available: true,
            foodType: "non-veg",
            bestseller: true,
            chefSpecial: false,
            sizes: ["Single", "Double"],
            toppings: ["Lettuce", "Tomato", "Pickles"],
            extras: ["Extra cheese", "Bacon"],
            preparationMinutes: 8,
        },
        {
            id: "bacon-beast",
            name: "Bacon Beast Burger Combo",
            description: "A hearty charbroiled burger served with crispy fries.",
            category: "Main Course",
            price: 12.49,
            image: "images/menu-bacon-burger.jpg",
            available: true,
            foodType: "non-veg",
            bestseller: false,
            chefSpecial: true,
            sizes: ["Single", "Double"],
            toppings: ["Lettuce", "Tomato", "Pickles"],
            extras: ["Extra bacon", "Extra cheese"],
            preparationMinutes: 10,
        },
        {
            id: "cinnamon-biscuit",
            name: "Cinnamon 'N' Raisin Biscuit 2-pack",
            description: "Warm, fluffy biscuits with delicious cinnamon and raisins.",
            category: "Desserts",
            price: 3.49,
            image: "images/menu-raisin-biscuit.jpg",
            available: true,
            foodType: "veg",
            bestseller: false,
            chefSpecial: false,
            sizes: ["2-pack"],
            toppings: ["Icing"],
            extras: [],
            preparationMinutes: 3,
            detailsUrl: "https://www.hardees.com/menu/featured/cinnamon-n-raisin-biscuit-2-pack",
        },
        {
            id: "chicken-biscuit",
            name: "Hand-Breaded Chicken Biscuit Combo",
            description: "Crispy hand-breaded chicken served on a warm biscuit.",
            category: "Main Course",
            price: 10.79,
            image: "images/menu-chicken-biscuit.jpg",
            available: false,
            foodType: "non-veg",
            bestseller: false,
            chefSpecial: false,
            sizes: ["Regular"],
            toppings: ["Honey"],
            extras: ["Hash Rounds"],
            preparationMinutes: 9,
        },
        {
            id: "smores-coffee",
            name: "S'mores Iced Coffee",
            description: "A refreshing iced coffee with a delicious sweet flavor.",
            category: "Drinks",
            price: 3.29,
            image: "images/menu-smores-coffee.jpg",
            available: true,
            foodType: "veg",
            bestseller: false,
            chefSpecial: true,
            sizes: ["Small", "Medium", "Large"],
            toppings: ["Whipped cream", "Chocolate drizzle"],
            extras: ["Extra espresso shot"],
            preparationMinutes: 4,
            detailsUrl: "https://www.hardees.com/menu/featured/smores-iced-coffee",
        },
        {
            id: "coffee",
            name: "Freshly Brewed Coffee",
            description: "Freshly brewed coffee, served hot.",
            category: "Drinks",
            price: 1.89,
            image: "images/menu-brewed-coffee.jpg",
            available: true,
            foodType: "veg",
            bestseller: false,
            chefSpecial: false,
            sizes: ["Small", "Medium", "Large"],
            toppings: [],
            extras: ["Cream", "Sugar"],
            preparationMinutes: 2,
        },
    ];

    function load() {
        const savedItems = localStorage.getItem(storageKey);
        const items = savedItems === null ? defaultItems : JSON.parse(savedItems);
        if (!Array.isArray(items) || items.some((item) =>
            !item || typeof item.id !== "string" || !item.id ||
            typeof item.name !== "string" || !item.name.trim() ||
            typeof item.description !== "string" || typeof item.image !== "string" || !item.image ||
            !categories.includes(item.category) || !Number.isFinite(item.price) || item.price <= 0 ||
            typeof item.available !== "boolean" || !["veg", "non-veg"].includes(item.foodType) ||
            typeof item.bestseller !== "boolean" || typeof item.chefSpecial !== "boolean" ||
            !Number.isInteger(item.preparationMinutes) || item.preparationMinutes < 1 ||
            !Array.isArray(item.sizes) || !item.sizes.every((choice) => typeof choice === "string") ||
            !Array.isArray(item.toppings) || !item.toppings.every((choice) => typeof choice === "string") ||
            !Array.isArray(item.extras) || !item.extras.every((choice) => typeof choice === "string")
        )) {
            throw new Error("Saved menu data is invalid. Clear the menu data and try again.");
        }
        return items;
    }

    function save(items) {
        if (!Array.isArray(items)) {
            throw new TypeError("Menu items must be provided as a list.");
        }
        localStorage.setItem(storageKey, JSON.stringify(items));
    }

    window.HardeesMenu = { storageKey, categories, load, save };
})();
