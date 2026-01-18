/**
 * Optimize WooCommerce Brand SEO
 * Generates and updates SEO-optimized descriptions and meta data for all brands
 */

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://crm.ideallivs.com';
const CONSUMER_KEY = process.env.WORDPRESS_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.WORDPRESS_CONSUMER_SECRET;

async function wcApi(endpoint, method = 'GET', data = null) {
    const url = new URL(`${WORDPRESS_URL}/wp-json/wc/v3/${endpoint}`);
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const options = {
        method,
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), options);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// Comprehensive SEO-optimized brand descriptions
const brandDescriptions = {
    // Major Indian Brands
    'aashirvaad': {
        description: 'Aashirvaad premium atta and spices at Ideal Indiska Livs Stockholm. ITC\'s trusted brand for whole wheat atta, chakki fresh flour, and authentic Indian spices. Shop Aashirvaad for softer rotis and traditional taste.',
        metaTitle: 'Aashirvaad Atta & Spices | ITC Products Stockholm',
        metaDescription: 'Buy Aashirvaad atta, chakki fresh flour & spices in Stockholm. Premium ITC products at Ideal Indiska Livs.',
    },
    'haldiram': {
        description: 'Haldiram\'s authentic Indian snacks, sweets, and frozen foods at Ideal Indiska Livs Stockholm. India\'s #1 snack brand offering namkeen, bhujia, samosas, gulab jamun, and traditional mithai. Premium quality since 1937.',
        metaTitle: 'Haldiram Snacks & Sweets | Indian Snacks Stockholm',
        metaDescription: 'Buy Haldiram snacks, sweets & namkeen in Stockholm. Authentic Indian snacks at Ideal Indiska Livs.',
    },
    'mtr': {
        description: 'MTR Foods authentic South Indian products at Ideal Indiska Livs Stockholm. Ready-to-eat meals, instant mixes, spices, and traditional Karnataka specialties. Trusted brand for dosa mix, idli batter, and South Indian flavors since 1924.',
        metaTitle: 'MTR Foods | South Indian Products Stockholm',
        metaDescription: 'Buy MTR ready-to-eat meals, instant mixes & South Indian products in Stockholm at Ideal Indiska Livs.',
    },
    'mdh': {
        description: 'MDH Masalas premium spices at Ideal Indiska Livs Stockholm. India\'s most trusted spice brand offering garam masala, chaat masala, curry powders, and authentic spice blends. Mahashian Di Hatti quality since 1919.',
        metaTitle: 'MDH Spices & Masalas | Garam Masala Stockholm',
        metaDescription: 'Buy MDH spices, garam masala & curry powders in Stockholm. Premium Indian masalas at Ideal Indiska Livs.',
    },
    'trs': {
        description: 'TRS Foods quality Indian and Asian groceries at Ideal Indiska Livs Stockholm. Wide range of rice, lentils, flours, spices, and specialty ingredients. Europe\'s leading ethnic food brand for authentic cooking.',
        metaTitle: 'TRS Foods | Indian & Asian Groceries Stockholm',
        metaDescription: 'Shop TRS rice, lentils, spices & Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'heera': {
        description: 'Heera Foods quality rice, lentils, and Indian groceries at Ideal Indiska Livs Stockholm. Established 1970, offering premium basmati rice, dals, flours, and specialty ingredients for authentic Asian cooking.',
        metaTitle: 'Heera Foods | Rice, Lentils & Indian Groceries Stockholm',
        metaDescription: 'Buy Heera Foods rice, lentils & Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'national': {
        description: 'National Foods masalas, pickles, and sauces at Ideal Indiska Livs Stockholm. Pakistan\'s leading food brand offering recipe mixes, spice blends, ketchups, and authentic Pakistani flavors for traditional cooking.',
        metaTitle: 'National Foods | Pakistani Masalas & Spices Stockholm',
        metaDescription: 'Buy National Foods masalas, pickles & Pakistani products in Stockholm at Ideal Indiska Livs.',
    },
    'shan': {
        description: 'Shan Foods authentic Pakistani recipe mixes at Ideal Indiska Livs Stockholm. Premium spice blends for biryani, nihari, korma, and traditional Pakistani dishes. Easy-to-use masala mixes for perfect results every time.',
        metaTitle: 'Shan Foods | Pakistani Recipe Mixes Stockholm',
        metaDescription: 'Shop Shan Foods biryani masala, recipe mixes & spices in Stockholm at Ideal Indiska Livs.',
    },
    'pataks': {
        description: 'Patak\'s UK\'s top Indian food brand at Ideal Indiska Livs Stockholm. Authentic curry pastes, cooking sauces, chutneys, and pickles. Easy-to-use curry bases for restaurant-quality Indian meals at home.',
        metaTitle: 'Patak\'s Curry Pastes & Sauces | Indian Cooking Stockholm',
        metaDescription: 'Buy Patak\'s curry pastes, cooking sauces & chutneys in Stockholm at Ideal Indiska Livs.',
    },
    'ig': {
        description: 'India Gate premium basmati rice at Ideal Indiska Livs Stockholm. India\'s most popular rice brand offering aged basmati, Dubar, Tibar, and specialty rice varieties. Perfect for biryani, pulao, and everyday meals.',
        metaTitle: 'India Gate Basmati Rice | Premium Rice Stockholm',
        metaDescription: 'Buy India Gate basmati rice, Dubar & Tibar rice in Stockholm at Ideal Indiska Livs.',
    },
    'annam': {
        description: 'Annam quality rice, lentils, and South Indian groceries at Ideal Indiska Livs Stockholm. Premium idli rice, dosa rice, and traditional South Indian ingredients for authentic cooking.',
        metaTitle: 'Annam Rice & Lentils | South Indian Groceries Stockholm',
        metaDescription: 'Shop Annam rice, lentils & South Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'pillsbury': {
        description: 'Pillsbury premium chakki atta and flours at Ideal Indiska Livs Stockholm. Trusted brand for whole wheat atta, multigrain flour, and specialty flours for soft, nutritious rotis and Indian breads.',
        metaTitle: 'Pillsbury Atta & Flour | Chakki Atta Stockholm',
        metaDescription: 'Buy Pillsbury chakki atta & whole wheat flour in Stockholm at Ideal Indiska Livs.',
    },
    'elephant': {
        description: 'Elephant Atta premium chapati flour at Ideal Indiska Livs Stockholm. Fine quality whole wheat flour for perfectly soft rotis, chapatis, and parathas. Traditional stone-ground atta for authentic taste.',
        metaTitle: 'Elephant Atta | Chapati Flour Stockholm',
        metaDescription: 'Buy Elephant Atta chapati flour & wheat flour in Stockholm at Ideal Indiska Livs.',
    },
    'fortune': {
        description: 'Fortune cooking oils and fats at Ideal Indiska Livs Stockholm. Quality sunflower oil, rice bran oil, and refined oils for healthy Indian cooking. Premium oils from Adani Wilmar.',
        metaTitle: 'Fortune Cooking Oils | Indian Cooking Oil Stockholm',
        metaDescription: 'Shop Fortune cooking oils, sunflower oil & rice bran oil in Stockholm at Ideal Indiska Livs.',
    },
    'dabur': {
        description: 'Dabur Ayurvedic and natural products at Ideal Indiska Livs Stockholm. Hair oils, health supplements, honey, herbal products, and personal care items. India\'s trusted wellness brand since 1884.',
        metaTitle: 'Dabur Products | Ayurvedic & Herbal Products Stockholm',
        metaDescription: 'Buy Dabur hair oils, honey & Ayurvedic products in Stockholm at Ideal Indiska Livs.',
    },
    'maggi': {
        description: 'Maggi noodles, sauces, and masalas at Ideal Indiska Livs Stockholm. Quick 2-minute noodles, Magic Cubes, ketchup, and cooking sauces. Nestle\'s beloved instant food brand for convenient meals.',
        metaTitle: 'Maggi Noodles & Sauces | Instant Noodles Stockholm',
        metaDescription: 'Buy Maggi instant noodles, masala & sauces in Stockholm at Ideal Indiska Livs.',
    },
    'parle': {
        description: 'Parle biscuits and snacks at Ideal Indiska Livs Stockholm. Iconic Parle-G glucose biscuits, Monaco, Hide & Seek cookies, and traditional Indian snacks. India\'s most trusted biscuit brand since 1929.',
        metaTitle: 'Parle Biscuits | Parle-G Glucose Biscuits Stockholm',
        metaDescription: 'Buy Parle-G biscuits, cookies & snacks in Stockholm at Ideal Indiska Livs.',
    },
    'lijjat': {
        description: 'Lijjat Papad authentic hand-made papads at Ideal Indiska Livs Stockholm. Crispy urad dal, moong dal, and masala papads. Shri Mahila Griha Udyog women\'s cooperative traditional papads since 1959.',
        metaTitle: 'Lijjat Papad | Authentic Indian Papad Stockholm',
        metaDescription: 'Buy Lijjat Papad, urad dal & masala papad in Stockholm at Ideal Indiska Livs.',
    },
    'priya': {
        description: 'Priya Foods authentic Andhra pickles and pastes at Ideal Indiska Livs Stockholm. Traditional South Indian mango pickle, ginger paste, curry pastes, and spicy condiments. Authentic Andhra flavors since 1980.',
        metaTitle: 'Priya Pickles & Pastes | Andhra Pickle Stockholm',
        metaDescription: 'Buy Priya mango pickle, ginger paste & Andhra products in Stockholm at Ideal Indiska Livs.',
    },
    'bikano': {
        description: 'Bikano authentic Indian snacks and sweets at Ideal Indiska Livs Stockholm. Premium namkeen, bhujia, papad, sweets, and frozen foods. Rajasthan\'s famous snack brand for traditional flavors since 1950.',
        metaTitle: 'Bikano Snacks & Sweets | Indian Namkeen Stockholm',
        metaDescription: 'Buy Bikano bhujia, namkeen & Indian sweets in Stockholm at Ideal Indiska Livs.',
    },
    'kurkure': {
        description: 'Kurkure crunchy Indian snacks at Ideal Indiska Livs Stockholm. Popular masala munch, chaat flavors, and spicy snacks. PepsiCo\'s favorite crispy snacks for Indian taste buds.',
        metaTitle: 'Kurkure Snacks | Masala Munch Stockholm',
        metaDescription: 'Buy Kurkure masala munch & Indian snacks in Stockholm at Ideal Indiska Livs.',
    },
    'chings': {
        description: 'Ching\'s Secret Indo-Chinese products at Ideal Indiska Livs Stockholm. Hakka noodles, Manchurian masala, schezwan sauce, and Chinese cooking essentials. Capital Foods brand for fusion flavors.',
        metaTitle: 'Ching\'s Secret | Indo-Chinese Products Stockholm',
        metaDescription: 'Shop Ching\'s hakka noodles, schezwan sauce & Indo-Chinese products in Stockholm at Ideal Indiska Livs.',
    },
    'tata': {
        description: 'Tata branded food products at Ideal Indiska Livs Stockholm. Tata Tea, Tata Salt, and quality food products from India\'s most trusted conglomerate. Premium tea and essential groceries.',
        metaTitle: 'Tata Products | Tata Tea & Salt Stockholm',
        metaDescription: 'Buy Tata Tea, Tata Salt & Tata products in Stockholm at Ideal Indiska Livs.',
    },
    'taj': {
        description: 'Taj Mahal tea at Ideal Indiska Livs Stockholm. Premium Assam black tea from Brooke Bond. Rich, aromatic tea blends for perfect chai and traditional Indian tea time.',
        metaTitle: 'Taj Mahal Tea | Premium Assam Tea Stockholm',
        metaDescription: 'Buy Taj Mahal tea & premium Assam tea in Stockholm at Ideal Indiska Livs.',
    },
    'tapal': {
        description: 'Tapal premium Pakistani tea at Ideal Indiska Livs Stockholm. Danedar, Tezdum, and specialty tea blends. Pakistan\'s leading tea brand for strong, flavorful chai since 1947.',
        metaTitle: 'Tapal Tea | Pakistani Tea Stockholm',
        metaDescription: 'Buy Tapal Danedar tea & Pakistani tea in Stockholm at Ideal Indiska Livs.',
    },
    'tilda': {
        description: 'Tilda premium basmati rice at Ideal Indiska Livs Stockholm. Award-winning Pure Basmati, Legendary Rice, and specialty rice varieties. UK\'s favorite basmati rice brand for perfect grains.',
        metaTitle: 'Tilda Basmati Rice | Premium Rice Stockholm',
        metaDescription: 'Buy Tilda Pure Basmati & premium rice in Stockholm at Ideal Indiska Livs.',
    },
    'laziza': {
        description: 'Laziza authentic Pakistani spices and dessert mixes at Ideal Indiska Livs Stockholm. Instant kheer mix, custard powder, jelly, and traditional Pakistani recipe mixes for quick, delicious desserts.',
        metaTitle: 'Laziza Spices & Dessert Mixes Stockholm',
        metaDescription: 'Shop Laziza kheer mix, custard & Pakistani products in Stockholm at Ideal Indiska Livs.',
    },
    'ahmed': {
        description: 'Ahmed Foods authentic Pakistani products at Ideal Indiska Livs Stockholm. Quality pickles, spices, cooking pastes, and traditional Pakistani food items. Trusted brand for authentic flavors.',
        metaTitle: 'Ahmed Foods | Pakistani Groceries Stockholm',
        metaDescription: 'Buy Ahmed pickles, spices & Pakistani products in Stockholm at Ideal Indiska Livs.',
    },
    'shezan': {
        description: 'Shezan authentic Pakistani juices, pickles, and preserves at Ideal Indiska Livs Stockholm. Premium mango juice, mixed pickle, jams, and traditional Pakistani food products since 1964.',
        metaTitle: 'Shezan Products | Pakistani Juices & Pickles Stockholm',
        metaDescription: 'Shop Shezan mango juice, pickles & Pakistani products in Stockholm at Ideal Indiska Livs.',
    },
    'natco': {
        description: 'Natco quality spices, lentils, and flours at Ideal Indiska Livs Stockholm. UK\'s leading ethnic food supplier offering authentic Indian ingredients, nuts, and specialty groceries since 1961.',
        metaTitle: 'Natco Spices & Lentils | Indian Groceries Stockholm',
        metaDescription: 'Buy Natco spices, dals & Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'alibaba': {
        description: 'Alibaba brand groceries at Ideal Indiska Livs Stockholm. Popular sweets, gur (jaggery), and traditional Indian food products. Quality ingredients for authentic cooking and sweets.',
        metaTitle: 'Alibaba Brand | Indian Groceries Stockholm',
        metaDescription: 'Shop Alibaba gur, sweets & Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'malik': {
        description: 'Malik Foods authentic Indian products at Ideal Indiska Livs Stockholm. Pure and quality spices, flours, sago, and specialty ingredients. Trusted brand for traditional Indian cooking essentials.',
        metaTitle: 'Malik Foods | Indian Spices & Groceries Stockholm',
        metaDescription: 'Buy Malik Foods spices, flours & Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'deepak': {
        description: 'Deepak brand spices, flours, and food products at Ideal Indiska Livs Stockholm. Quality ingredients for authentic Indian cooking including specialty flours and ground spices.',
        metaTitle: 'Deepak Spices & Flours Stockholm',
        metaDescription: 'Shop Deepak brand spices, flours & Indian products in Stockholm at Ideal Indiska Livs.',
    },
    'metro': {
        description: 'Metro brand quality groceries at Ideal Indiska Livs Stockholm. Wide range of spices, flours, rice, and Indian food products. Reliable brand for everyday cooking essentials.',
        metaTitle: 'Metro Brand | Indian Groceries Stockholm',
        metaDescription: 'Buy Metro brand spices, rice & groceries in Stockholm at Ideal Indiska Livs.',
    },
    'flute': {
        description: 'Flute brand Indian products at Ideal Indiska Livs Stockholm. Specialty items and unique food products. Quality selection for traditional and modern Indian cooking.',
        metaTitle: 'Flute Brand Products Stockholm',
        metaDescription: 'Shop Flute brand Indian products in Stockholm at Ideal Indiska Livs.',
    },
    'crown': {
        description: 'Crown brand frozen kebabs, snacks, and ready-to-eat products at Ideal Indiska Livs Stockholm. Quality frozen Indian and Pakistani foods for convenient authentic meals.',
        metaTitle: 'Crown Frozen Foods | Kebabs & Snacks Stockholm',
        metaDescription: 'Buy Crown frozen kebabs, snacks & ready-to-eat foods in Stockholm at Ideal Indiska Livs.',
    },
    'bombaywala': {
        description: 'Bombaywala authentic Mumbai-style snacks and treats at Ideal Indiska Livs Stockholm. Traditional Bombay flavors, street food items, and specialty products for authentic taste.',
        metaTitle: 'Bombaywala Snacks | Mumbai Foods Stockholm',
        metaDescription: 'Shop Bombaywala Mumbai snacks & treats in Stockholm at Ideal Indiska Livs.',
    },
    'desi': {
        description: 'Desi authentic Indian products at Ideal Indiska Livs Stockholm. Traditional desi ghee, spices, and grocery items. Pure and natural ingredients for home-style Indian cooking.',
        metaTitle: 'Desi Products | Authentic Indian Groceries Stockholm',
        metaDescription: 'Buy Desi ghee, spices & Indian products in Stockholm at Ideal Indiska Livs.',
    },
    'bombay': {
        description: 'Bombay brand Indian food products at Ideal Indiska Livs Stockholm. Quality groceries, snacks, and specialty items inspired by Mumbai\'s culinary heritage.',
        metaTitle: 'Bombay Brand | Indian Food Products Stockholm',
        metaDescription: 'Shop Bombay brand Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'delta': {
        description: 'Delta brand quality food products at Ideal Indiska Livs Stockholm. Wide range of Indian and international grocery items for diverse cooking needs.',
        metaTitle: 'Delta Brand Products Stockholm',
        metaDescription: 'Buy Delta brand groceries in Stockholm at Ideal Indiska Livs.',
    },
    'amoy': {
        description: 'Amoy authentic Asian sauces and cooking essentials at Ideal Indiska Livs Stockholm. Soy sauce, oyster sauce, and Chinese cooking products for Asian cuisine.',
        metaTitle: 'Amoy Sauces | Asian Cooking Stockholm',
        metaDescription: 'Shop Amoy soy sauce & Asian cooking products in Stockholm at Ideal Indiska Livs.',
    },
    'lazzat': {
        description: 'Lazzat spice mixes and food products at Ideal Indiska Livs Stockholm. Quality masalas and cooking essentials for authentic Pakistani and Indian flavors.',
        metaTitle: 'Lazzat Spice Mixes Stockholm',
        metaDescription: 'Buy Lazzat spices & masalas in Stockholm at Ideal Indiska Livs.',
    },
    'khanum': {
        description: 'Khanum pure butter ghee and quality food products at Ideal Indiska Livs Stockholm. Premium ghee and traditional ingredients for authentic cooking.',
        metaTitle: 'Khanum Ghee | Pure Butter Ghee Stockholm',
        metaDescription: 'Buy Khanum pure ghee & butter ghee in Stockholm at Ideal Indiska Livs.',
    },
    'a1': {
        description: 'A1 authentic South Indian spices and curry powders at Ideal Indiska Livs Stockholm. Sambar powder, rasam powder, and traditional Tamil Nadu spice blends for authentic South Indian cooking.',
        metaTitle: 'A1 Spices | South Indian Masalas Stockholm',
        metaDescription: 'Shop A1 sambar powder, curry masala & South Indian spices in Stockholm at Ideal Indiska Livs.',
    },
    'anmol': {
        description: 'Anmol Sweets & Restaurant authentic sweets and bakery products at Ideal Indiska Livs Stockholm. Fresh traditional Indian and Pakistani sweets, snacks, and bakery items from Stockholm\'s favorite sweet shop.',
        metaTitle: 'Anmol Sweets | Indian Sweets Stockholm',
        metaDescription: 'Buy Anmol traditional sweets & bakery products in Stockholm at Ideal Indiska Livs.',
    },
    'cadbury': {
        description: 'Cadbury chocolates at Ideal Indiska Livs Stockholm. Dairy Milk, Bournville, and classic Cadbury treats. World-famous chocolate brand for sweet indulgence.',
        metaTitle: 'Cadbury Chocolates | Dairy Milk Stockholm',
        metaDescription: 'Buy Cadbury Dairy Milk & chocolates in Stockholm at Ideal Indiska Livs.',
    },
    'hadeel': {
        description: 'Hadeel Sweden authentic Middle Eastern and Pakistani products at Ideal Indiska Livs Stockholm. Quality rice, spices, and specialty ingredients. Local Stockholm brand for ethnic groceries.',
        metaTitle: 'Hadeel Sweden | Middle Eastern Groceries Stockholm',
        metaDescription: 'Shop Hadeel rice, spices & Middle Eastern products in Stockholm at Ideal Indiska Livs.',
    },
    'deshi': {
        description: 'Deshi authentic Bangladeshi products at Ideal Indiska Livs Stockholm. Traditional Bangladeshi spices, rice, and specialty groceries for authentic cooking.',
        metaTitle: 'Deshi Brand | Bangladeshi Products Stockholm',
        metaDescription: 'Buy Deshi Bangladeshi groceries & spices in Stockholm at Ideal Indiska Livs.',
    },
    'fanta': {
        description: 'Fanta soft drinks and beverages at Ideal Indiska Livs Stockholm. Orange, exotic flavors, and refreshing carbonated drinks. Coca-Cola\'s fruity beverage brand.',
        metaTitle: 'Fanta Soft Drinks | Beverages Stockholm',
        metaDescription: 'Buy Fanta orange & soft drinks in Stockholm at Ideal Indiska Livs.',
    },
    'vatika': {
        description: 'Vatika natural hair care and personal care products at Ideal Indiska Livs Stockholm. Herbal shampoos, hair oils, and Ayurvedic beauty products from Dabur. Natural care for healthy hair and skin.',
        metaTitle: 'Vatika Hair Care | Herbal Products Stockholm',
        metaDescription: 'Buy Vatika hair oil, shampoo & herbal products in Stockholm at Ideal Indiska Livs.',
    },
    'jabsons': {
        description: 'Jabsons premium roasted nuts and snacks at Ideal Indiska Livs Stockholm. Quality peanuts, cashews, and flavored nuts. India\'s favorite nut brand for healthy snacking since 1982.',
        metaTitle: 'Jabsons Nuts | Roasted Peanuts Stockholm',
        metaDescription: 'Buy Jabsons roasted nuts, peanuts & cashews in Stockholm at Ideal Indiska Livs.',
    },
    'regal': {
        description: 'Regal brand quality food products at Ideal Indiska Livs Stockholm. Indian groceries and specialty items for authentic cooking.',
        metaTitle: 'Regal Brand Products Stockholm',
        metaDescription: 'Shop Regal brand Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
    'red': {
        description: 'Red Label premium tea at Ideal Indiska Livs Stockholm. Brooke Bond Red Label tea for strong, flavorful chai. India\'s favorite tea brand for daily brewing.',
        metaTitle: 'Red Label Tea | Premium Indian Tea Stockholm',
        metaDescription: 'Buy Red Label tea & Indian tea in Stockholm at Ideal Indiska Livs.',
    },
    'tang': {
        description: 'Tang instant drink mixes at Ideal Indiska Livs Stockholm. Orange, mango, and fruit-flavored beverage powders. Refreshing vitamin-enriched drink mixes for the family.',
        metaTitle: 'Tang Drink Mix | Instant Beverages Stockholm',
        metaDescription: 'Buy Tang orange drink mix & beverages in Stockholm at Ideal Indiska Livs.',
    },
    'zingo': {
        description: 'Zingo soft drinks at Ideal Indiska Livs Stockholm. Popular Swedish carbonated beverages in various flavors. Refreshing local drinks for all occasions.',
        metaTitle: 'Zingo Soft Drinks Stockholm',
        metaDescription: 'Buy Zingo soft drinks & beverages in Stockholm at Ideal Indiska Livs.',
    },
    'sun': {
        description: 'Sun brand cooking oils and food products at Ideal Indiska Livs Stockholm. Quality oils and ingredients for everyday Indian cooking.',
        metaTitle: 'Sun Cooking Oils Stockholm',
        metaDescription: 'Shop Sun brand oils & products in Stockholm at Ideal Indiska Livs.',
    },
    'idhayam': {
        description: 'Idhayam authentic South Indian sesame oil at Ideal Indiska Livs Stockholm. Pure gingelly oil for traditional Tamil cooking, tempering, and health benefits. Premium cold-pressed oils.',
        metaTitle: 'Idhayam Sesame Oil | Gingelly Oil Stockholm',
        metaDescription: 'Buy Idhayam sesame oil & South Indian oils in Stockholm at Ideal Indiska Livs.',
    },
    'garimaa': {
        description: 'Garimaa premium basmati rice at Ideal Indiska Livs Stockholm. Quality Indian rice for biryani, pulao, and everyday meals. Authentic basmati flavor and aroma.',
        metaTitle: 'Garimaa Basmati Rice Stockholm',
        metaDescription: 'Buy Garimaa basmati rice in Stockholm at Ideal Indiska Livs.',
    },
    'qarshi': {
        description: 'Qarshi herbal products and health drinks at Ideal Indiska Livs Stockholm. Traditional Pakistani herbal syrups, Jam-e-Shireen, and natural wellness products.',
        metaTitle: 'Qarshi Herbal Products Stockholm',
        metaDescription: 'Shop Qarshi herbal drinks & products in Stockholm at Ideal Indiska Livs.',
    },
    'patanjli': {
        description: 'Patanjali Ayurvedic products at Ideal Indiska Livs Stockholm. Natural health supplements, personal care, ghee, honey, and organic groceries. Baba Ramdev\'s trusted Ayurvedic brand.',
        metaTitle: 'Patanjali Ayurvedic Products Stockholm',
        metaDescription: 'Buy Patanjali Ayurvedic products, ghee & honey in Stockholm at Ideal Indiska Livs.',
    },
    'swetha-teugu': {
        description: 'Swetha-Telugu Foods authentic South Indian products at Ideal Indiska Livs Stockholm. Traditional Telugu rice, pickles, spices, and specialty ingredients from Andhra Pradesh and Telangana.',
        metaTitle: 'Swetha-Telugu Foods | South Indian Products Stockholm',
        metaDescription: 'Buy Swetha-Telugu rice, pickles & South Indian products in Stockholm at Ideal Indiska Livs.',
    },
    'ideal-indiska': {
        description: 'Ideal Indiska own-brand quality products at our Stockholm store. Carefully selected Indian and Pakistani groceries offering authentic flavors at great value. Your local Indian grocery store brand.',
        metaTitle: 'Ideal Indiska Brand | Our Store Products Stockholm',
        metaDescription: 'Shop Ideal Indiska own-brand groceries in Stockholm at Ideal Indiska Livs.',
    },
    'fresh': {
        description: 'Fresh produce and perishable items at Ideal Indiska Livs Stockholm. Daily fresh vegetables, fruits, paneer, and ingredients for authentic cooking.',
        metaTitle: 'Fresh Produce Stockholm',
        metaDescription: 'Buy fresh vegetables, fruits & paneer in Stockholm at Ideal Indiska Livs.',
    },
    'fresh-frsk': {
        description: 'Fresh produce items at Ideal Indiska Livs Stockholm. Daily fresh selection of vegetables, herbs, and perishable ingredients.',
        metaTitle: 'Fresh Produce Stockholm',
        metaDescription: 'Shop fresh produce in Stockholm at Ideal Indiska Livs.',
    },
    'electric': {
        description: 'Electric kitchen appliances and gadgets at Ideal Indiska Livs Stockholm. Essential electric items for Indian cooking and food preparation.',
        metaTitle: 'Electric Kitchen Appliances Stockholm',
        metaDescription: 'Buy electric kitchen appliances in Stockholm at Ideal Indiska Livs.',
    },
    'indian': {
        description: 'Authentic Indian groceries and products at Ideal Indiska Livs Stockholm. Wide range of traditional ingredients, spices, and specialty items for Indian cooking.',
        metaTitle: 'Indian Groceries Stockholm',
        metaDescription: 'Shop authentic Indian groceries in Stockholm at Ideal Indiska Livs.',
    },
};

async function optimizeBrands() {
    console.log('\n🔧 Optimizing WooCommerce Brand SEO\n');
    console.log('═'.repeat(100));

    try {
        let updated = 0;
        let failed = 0;
        let skipped = 0;

        // Fetch all brands
        let allBrands = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const brands = await wcApi(`products/brands?per_page=100&page=${page}`);
            if (brands.length === 0) {
                hasMore = false;
            } else {
                allBrands = allBrands.concat(brands);
                page++;
            }
        }

        console.log(`\n✅ Found ${allBrands.length} brands\n`);
        console.log('📝 Processing brands...\n');

        for (const brand of allBrands) {
            const seoData = brandDescriptions[brand.slug];

            if (seoData) {
                try {
                    console.log(`\n🏷️  Updating: ${brand.name} (ID: ${brand.id})`);
                    console.log(`   Slug: ${brand.slug}`);

                    const updateData = {
                        description: seoData.description,
                        yoast_head_json: {
                            title: seoData.metaTitle,
                            description: seoData.metaDescription,
                        }
                    };

                    await wcApi(`products/brands/${brand.id}`, 'PUT', updateData);

                    console.log(`   ✅ Updated successfully!`);
                    console.log(`   📝 Meta Title: ${seoData.metaTitle}`);
                    console.log(`   📝 Meta Desc: ${seoData.metaDescription}`);
                    updated++;

                    await new Promise(resolve => setTimeout(resolve, 300));

                } catch (error) {
                    console.log(`   ❌ Failed: ${error.message}`);
                    failed++;
                }
            } else if (!brand.description || brand.description.length < 50) {
                console.log(`\n⚠️  Skipping: ${brand.name} (No SEO data defined)`);
                skipped++;
            }
        }

        console.log('\n' + '═'.repeat(100));
        console.log('\n📊 SUMMARY:');
        console.log(`   ✅ Successfully updated: ${updated} brands`);
        console.log(`   ⚠️  Skipped: ${skipped} brands`);
        if (failed > 0) {
            console.log(`   ❌ Failed: ${failed} brands`);
        }
        console.log('');
        console.log('═'.repeat(100));
        console.log('✅ Done!\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

optimizeBrands().catch(console.error);
