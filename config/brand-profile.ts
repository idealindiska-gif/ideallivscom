/**
 * Brand Profile Configuration
 * Central source of truth for all brand-related information
 * 
 * This file contains all business details for Ideal Indiska LIVS
 * Update this file to automatically update brand information throughout the entire template
 */

export const brandProfile = {
    // Basic Information
    name: "Ideal Indiska LIVS",
    tagline: "Everything You Need. Just Around the Corner.",
    description: "Your trusted source for authentic Indian and Pakistani groceries in Stockholm. Fresh produce, aromatic spices, premium grains, and all your South Asian cooking essentials.",

    // Contact Information
    contact: {
        phone: "+46 728 494 801",
        phoneFormatted: "+46 728 494 801",
        whatsapp: "+46728494801",
        email: "hello@ideallivs.com",
        supportEmail: "hello@ideallivs.com",
    },

    // Physical Store Address
    address: {
        street: "Bandhagsplan 4",
        area: "Bandhagen Centrum",
        postalCode: "12432",
        city: "Stockholm",
        country: "Sweden",
        formatted: "Bandhagsplan 4, 12432 Bandhagen Centrum, Stockholm, Sweden",
    },

    // Business Hours
    hours: {
        monday: { open: "10:00", close: "20:00", display: "10 AM - 8 PM" },
        tuesday: { open: "10:00", close: "20:00", display: "10 AM - 8 PM" },
        wednesday: { open: "10:00", close: "20:00", display: "10 AM - 8 PM" },
        thursday: { open: "10:00", close: "20:00", display: "10 AM - 8 PM" },
        friday: { open: "10:00", close: "20:00", display: "10 AM - 8 PM" },
        saturday: { open: "11:00", close: "19:00", display: "11 AM - 7 PM" },
        sunday: { open: "11:00", close: "19:00", display: "11 AM - 7 PM" },
    },

    // Website & Online Presence
    website: {
        url: "https://www.ideallivs.com",
        domain: "www.ideallivs.com",
    },

    // Social Media
    social: {
        facebook: "https://www.facebook.com/Ideal.indiska.livs",
        instagram: "https://www.instagram.com/ideal_indiska_livs/",
        youtube: "https://www.youtube.com/channel/UCMDZD4WhYMFny9CRhp1WyxA",
        tiktok: "",
        twitter: "https://x.com/idealindiska",
        linkedin: "https://www.linkedin.com/in/ideal-indiska-596215378/",
    },

    // Delivery Information
    delivery: {
        stockholm: {
            freeThreshold: 500, // SEK
            minimumOrder: 300, // SEK
            standardFee: 30, // SEK for orders 300-499
            sameDayAreas: [
                "Bandhagen",
                "Högdalen",
                "Hagsätra",
                "Rågsved",
                "Stureby",
                "Farsta",
                "Älvsjö",
            ],
            sameDayCutoffTime: "16:00",
            sameDayWindow: "19:00 - 22:00",
            coverageAreas: [
                "Gamla Stan",
                "Södermalm",
                "Östermalm",
                "Norrmalm",
                "Vasastan",
                "Kungsholmen",
                "Solna",
                "Sundbyberg",
                "Danderyd",
                "Lidingö",
                "Nacka",
                "Huddinge",
                "Botkyrka",
                "Kista",
                "Järfälla",
            ],
        },
        sweden: {
            carrier: "DHL",
            noMinimum: true,
        },
        europe: {
            available: true,
            carrier: "DHL",
            noMinimum: true,
        },
        goteborg: {
            deliveryDays: ["Tuesday", "Thursday", "Saturday"],
            deliveryWindow: "14:00 - 18:00",
            orderDeadline: "Day before by 18:00",
            minimumOrder: 0,
        },
        malmo: {
            deliveryDays: ["Wednesday", "Saturday"],
            timeSlots: ["09:00-12:00", "14:00-18:00"],
            orderDeadline: "24 hours before",
            minimumOrder: 0,
        },
    },

    // Product Categories
    productCategories: [
        "Aromatic Spices & Masalas",
        "Premium Basmati Rice",
        "Fresh Vegetables & Herbs",
        "Frozen Foods & Ready Meals",
        "Snacks & Sweets",
        "Flours & Grains",
        "Lentils & Pulses (Dals)",
        "Halal Meat & Chicken",
    ],

    // Services & Features
    features: [
        "Free delivery in Stockholm on orders over 500 SEK",
        "Same-day evening delivery in Bandhagen area",
        "Fresh produce sourced directly",
        "Halal certified products",
        "European-wide shipping via DHL",
        "No minimum order for Sweden & Europe shipping",
        "Local pickup available",
    ],

    // SEO & Marketing
    seo: {
        keywords: [
            "Indian grocery Stockholm",
            "Pakistani grocery Stockholm",
            "Halal meat Stockholm",
            "Basmati rice Stockholm",
            "Indian spices Stockholm",
            "South Asian groceries Sweden",
            "Bandhagen grocery store",
            "Online Indian grocery delivery",
        ],
        localAreas: [
            "Stockholm",
            "Bandhagen",
            "Södermalm",
            "Östermalm",
            "Göteborg",
            "Malmö",
        ],
    },

    // Business Information
    business: {
        founded: "", // Add if known
        type: "Grocery Store",
        specialization: "Indian & Pakistani Groceries",
        certifications: ["Halal Certified"],
        paymentMethods: ["Card", "Swish", "Online Payment"],
    },
};

export default brandProfile;
