/**
 * Optimize WooCommerce Category SEO
 * Generates and updates SEO-optimized descriptions and meta data for all categories
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

// SEO-optimized category descriptions
const categoryDescriptions = {
    // Parent Categories
    'batters': {
        description: 'Buy authentic ready-to-use batters for dosa, idli, and uttapam at Ideal Indiska Livs Stockholm. Fresh, convenient South Indian batters made with traditional recipes for perfect fermentation and taste.',
        metaTitle: 'Dosa & Idli Batters | Fresh Indian Batters Stockholm',
        metaDescription: 'Shop ready-to-use dosa, idli & uttapam batters in Stockholm. Fresh, authentic South Indian batters at Ideal Indiska Livs.',
    },
    'canned-jarred-goods': {
        description: 'Shop premium canned and jarred goods at Ideal Indiska Livs Stockholm. Explore authentic mango pulp, canned fruits, vegetables, and ready-to-use ingredients for Indian cooking.',
        metaTitle: 'Canned & Jarred Goods | Indian Grocery Stockholm',
        metaDescription: 'Buy canned fruits, mango pulp & jarred Indian foods in Stockholm. Quality canned goods at Ideal Indiska Livs.',
    },
    'cooking-ingredients': {
        description: 'Discover essential cooking ingredients at Ideal Indiska Livs Stockholm. Premium food colors, essences, and specialty ingredients for authentic Indian, Pakistani, and South Asian cuisine.',
        metaTitle: 'Cooking Ingredients | Indian Cooking Essentials Stockholm',
        metaDescription: 'Shop Indian cooking ingredients, food colors & essences in Stockholm. Quality cooking essentials at Ideal Indiska Livs.',
    },
    'curry-masala': {
        description: 'Shop authentic curry masala blends at Ideal Indiska Livs Stockholm. Premium spice mixes for chicken curry, lamb curry, and traditional Indian curries. Ready-to-use curry powders from trusted brands.',
        metaTitle: 'Curry Masala Spice Blends | Indian Curry Mix Stockholm',
        metaDescription: 'Buy authentic curry masala & spice blends in Stockholm. Premium curry powders for Indian cooking at Ideal Indiska Livs.',
    },
    'dry-fruits': {
        description: 'Premium dry fruits and nuts at Ideal Indiska Livs Stockholm. Shop almonds, cashews, pistachios, raisins, and exotic dried fruits for cooking, snacking, and festive occasions.',
        metaTitle: 'Dry Fruits & Nuts | Premium Almonds, Cashews Stockholm',
        metaDescription: 'Buy premium dry fruits, nuts, almonds & cashews in Stockholm. Quality dried fruits at Ideal Indiska Livs.',
    },
    'festival-special': {
        description: 'Celebrate Indian festivals with special groceries at Ideal Indiska Livs Stockholm. Find everything for Diwali, Holi, Eid, and other festive occasions. Traditional sweets, snacks, and festival essentials.',
        metaTitle: 'Festival Special | Diwali, Holi & Eid Groceries Stockholm',
        metaDescription: 'Shop Indian festival groceries in Stockholm. Diwali sweets, festive snacks & special items at Ideal Indiska Livs.',
    },
    'flour': {
        description: 'Buy premium Indian flours at Ideal Indiska Livs Stockholm. Whole wheat atta, chapati flour, gram flour (besan), millet flour, and specialty flours for authentic Indian cooking and baking.',
        metaTitle: 'Indian Flour | Atta, Besan & Chapati Flour Stockholm',
        metaDescription: 'Shop Indian flours, atta, besan & chapati flour in Stockholm. Premium quality flours at Ideal Indiska Livs.',
    },
    'fragrance': {
        description: 'Explore authentic Indian fragrances at Ideal Indiska Livs Stockholm. Shop attars, perfumes, essential oils, and traditional Indian scents for personal use and home ambiance.',
        metaTitle: 'Indian Fragrance & Perfumes | Attar Stockholm',
        metaDescription: 'Buy Indian fragrances, attars & perfumes in Stockholm. Authentic scents at Ideal Indiska Livs.',
    },
    'fresh-produce': {
        description: 'Fresh Indian vegetables and fruits at Ideal Indiska Livs Stockholm. Daily fresh produce including curry leaves, drumsticks, bitter gourd, paneer, and seasonal fruits for authentic cooking.',
        metaTitle: 'Fresh Indian Vegetables & Fruits | Fresh Produce Stockholm',
        metaDescription: 'Buy fresh Indian vegetables, fruits & paneer in Stockholm. Daily fresh produce at Ideal Indiska Livs.',
    },
    'frozen-foods': {
        description: 'Premium frozen Indian foods at Ideal Indiska Livs Stockholm. Frozen parathas, samosas, paneer, BBQ items, and ready-to-cook South Asian specialties for convenient authentic meals.',
        metaTitle: 'Frozen Indian Food | Parathas, Samosas & Paneer Stockholm',
        metaDescription: 'Shop frozen Indian snacks, parathas & paneer in Stockholm. Quality frozen foods at Ideal Indiska Livs.',
    },
    'hair-oils': {
        description: 'Authentic Indian hair oils at Ideal Indiska Livs Stockholm. Shop coconut oil, almond oil, amla oil, and herbal hair care products from trusted brands like Dabur, Parachute, and Vatika.',
        metaTitle: 'Indian Hair Oils | Coconut, Almond & Amla Oil Stockholm',
        metaDescription: 'Buy Indian hair oils, coconut & almond oil in Stockholm. Natural hair care at Ideal Indiska Livs.',
    },
    'henna': {
        description: 'Natural henna and herbal products at Ideal Indiska Livs Stockholm. Premium henna powder for hair coloring, herbs, roots, and Ayurvedic products from brands like Neha and Dabur.',
        metaTitle: 'Henna & Herbal Products | Natural Hair Color Stockholm',
        metaDescription: 'Shop natural henna, herbal hair color & Ayurvedic products in Stockholm at Ideal Indiska Livs.',
    },
    'home-essentials': {
        description: 'Indian home essentials at Ideal Indiska Livs Stockholm. Shop agarbatti (incense sticks), pooja items, kitchen accessories, soaps, and daily household products for Indian homes.',
        metaTitle: 'Indian Home Essentials | Agarbatti, Pooja Items Stockholm',
        metaDescription: 'Buy Indian home essentials, incense sticks & pooja items in Stockholm at Ideal Indiska Livs.',
    },
    'instant-mix': {
        description: 'Quick and easy instant mixes at Ideal Indiska Livs Stockholm. Ready-to-cook Indian breakfast and snack mixes for dosa, idli, vada, and other South Asian favorites.',
        metaTitle: 'Instant Mix | Ready-to-Cook Indian Mixes Stockholm',
        metaDescription: 'Shop instant Indian food mixes for dosa, idli & snacks in Stockholm at Ideal Indiska Livs.',
    },
    'lentils-beans-dals': {
        description: 'Premium lentils, beans, and dals at Ideal Indiska Livs Stockholm. Shop toor dal, moong dal, masoor dal, urad dal, chickpeas, and specialty pulses for authentic Indian cooking.',
        metaTitle: 'Lentils & Dals | Toor, Moong, Masoor Dal Stockholm',
        metaDescription: 'Buy Indian lentils, dals & pulses in Stockholm. Premium toor, moong & masoor dal at Ideal Indiska Livs.',
    },
    'meat-alternatives': {
        description: 'Plant-based meat alternatives at Ideal Indiska Livs Stockholm. Vegetarian and vegan protein options for healthy Indian cooking, including soya products and mock meats.',
        metaTitle: 'Meat Alternatives | Vegan & Vegetarian Protein Stockholm',
        metaDescription: 'Shop vegan meat alternatives & plant-based proteins in Stockholm at Ideal Indiska Livs.',
    },
    'noodles-pasta': {
        description: 'Asian noodles and pasta at Ideal Indiska Livs Stockholm. Shop instant noodles, vermicelli, rice noodles, and Indian-style pasta for quick meals and traditional recipes.',
        metaTitle: 'Noodles & Pasta | Instant Noodles, Vermicelli Stockholm',
        metaDescription: 'Buy Asian noodles, vermicelli & instant noodles in Stockholm at Ideal Indiska Livs.',
    },
    'oils-ghee': {
        description: 'Premium cooking oils and pure ghee at Ideal Indiska Livs Stockholm. Shop mustard oil, coconut oil, vegetable ghee, and authentic Indian cooking fats for traditional flavors.',
        metaTitle: 'Cooking Oils & Ghee | Indian Cooking Fats Stockholm',
        metaDescription: 'Buy cooking oils, pure ghee & Indian fats in Stockholm. Quality oils at Ideal Indiska Livs.',
    },
    'organic-groceries': {
        description: 'Organic Indian groceries at Ideal Indiska Livs Stockholm. Shop certified organic spices, grains, lentils, and natural food products for healthy, chemical-free cooking.',
        metaTitle: 'Organic Indian Groceries | Natural Food Products Stockholm',
        metaDescription: 'Buy organic Indian groceries, spices & natural foods in Stockholm at Ideal Indiska Livs.',
    },
    'others': {
        description: 'Specialty Indian groceries at Ideal Indiska Livs Stockholm. Unique and hard-to-find ingredients, regional specialties, and ethnic products from across South Asia.',
        metaTitle: 'Specialty Indian Groceries | Unique Products Stockholm',
        metaDescription: 'Shop specialty Indian groceries & unique products in Stockholm at Ideal Indiska Livs.',
    },
    'personal-care': {
        description: 'Indian personal care products at Ideal Indiska Livs Stockholm. Shop beard color, hair care, toothpaste, and natural beauty products from trusted Indian brands.',
        metaTitle: 'Indian Personal Care | Hair Care, Beard Color Stockholm',
        metaDescription: 'Buy Indian personal care, hair care & beauty products in Stockholm at Ideal Indiska Livs.',
    },
    'pickles-chutneys-pastes': {
        description: 'Authentic Indian pickles, chutneys, and cooking pastes at Ideal Indiska Livs Stockholm. Mango pickle, ginger paste, curry pastes, sauces, and traditional condiments for flavorful cooking.',
        metaTitle: 'Indian Pickles & Chutneys | Cooking Pastes Stockholm',
        metaDescription: 'Buy Indian pickles, chutneys & cooking pastes in Stockholm. Authentic flavors at Ideal Indiska Livs.',
    },
    'powdered': {
        description: 'Indian powdered ingredients at Ideal Indiska Livs Stockholm. Coconut powder, custard powder, milk powder, and specialty powdered products for traditional cooking and desserts.',
        metaTitle: 'Powdered Ingredients | Coconut, Milk Powder Stockholm',
        metaDescription: 'Shop Indian powdered ingredients & cooking powders in Stockholm at Ideal Indiska Livs.',
    },
    'ready-to-eat': {
        description: 'Ready-to-eat Indian meals at Ideal Indiska Livs Stockholm. Convenient canned curries, cooked lentils, instant meals, and heat-and-eat Indian dishes for busy lifestyles.',
        metaTitle: 'Ready to Eat Indian Food | Instant Meals Stockholm',
        metaDescription: 'Buy ready-to-eat Indian meals & instant food in Stockholm at Ideal Indiska Livs.',
    },
    'rice-grains': {
        description: 'Premium basmati rice and grains at Ideal Indiska Livs Stockholm. Shop authentic Indian basmati, sona masoori, idli rice, Asian rice, and specialty grains for perfect meals.',
        metaTitle: 'Basmati Rice & Grains | Indian Rice Stockholm',
        metaDescription: 'Buy premium basmati rice, sona masoori & Indian grains in Stockholm at Ideal Indiska Livs.',
    },
    'seeds': {
        description: 'Quality seeds for cooking and health at Ideal Indiska Livs Stockholm. Shop cumin seeds, mustard seeds, fenugreek seeds, and specialty seeds for Indian cooking and wellness.',
        metaTitle: 'Cooking Seeds | Cumin, Mustard Seeds Stockholm',
        metaDescription: 'Buy cooking seeds, cumin & mustard seeds in Stockholm at Ideal Indiska Livs.',
    },
    'skin-care': {
        description: 'Natural Indian skin care and baby care products at Ideal Indiska Livs Stockholm. Ayurvedic creams, lotions, baby products, and herbal skin care from trusted brands.',
        metaTitle: 'Indian Skin Care & Baby Care Products Stockholm',
        metaDescription: 'Shop natural Indian skin care, baby care & Ayurvedic products in Stockholm at Ideal Indiska Livs.',
    },
    'snacks': {
        description: 'Indian snacks and namkeen at Ideal Indiska Livs Stockholm. Shop samosas, pakoras, biscuits, chips, rusk, and traditional savory snacks from top Indian brands.',
        metaTitle: 'Indian Snacks & Namkeen | Biscuits, Chips Stockholm',
        metaDescription: 'Buy Indian snacks, namkeen & biscuits in Stockholm. Authentic savory snacks at Ideal Indiska Livs.',
    },
    'spices-masalas': {
        description: 'Authentic Indian spices and masalas at Ideal Indiska Livs Stockholm. Premium ground spices, whole spices, spice blends, garam masala, and specialty seasonings for traditional cooking.',
        metaTitle: 'Indian Spices & Masalas | Garam Masala Stockholm',
        metaDescription: 'Buy authentic Indian spices, masalas & seasonings in Stockholm. Premium spices at Ideal Indiska Livs.',
    },
    'sweets': {
        description: 'Traditional Indian sweets and dessert mixes at Ideal Indiska Livs Stockholm. Shop gulab jamun, rasgulla, halwa mixes, and authentic mithai for celebrations and everyday indulgence.',
        metaTitle: 'Indian Sweets | Gulab Jamun, Dessert Mixes Stockholm',
        metaDescription: 'Buy Indian sweets, gulab jamun & dessert mixes in Stockholm at Ideal Indiska Livs.',
    },
    'tea-coffee-beverages': {
        description: 'Premium Indian tea, coffee, and beverages at Ideal Indiska Livs Stockholm. Shop masala chai, black tea, health drinks, juices, and traditional beverages for every occasion.',
        metaTitle: 'Indian Tea & Coffee | Masala Chai, Beverages Stockholm',
        metaDescription: 'Buy Indian tea, coffee & beverages in Stockholm. Premium chai & health drinks at Ideal Indiska Livs.',
    },
    'vegan-food': {
        description: 'Vegan Indian food products at Ideal Indiska Livs Stockholm. Plant-based groceries, dairy-free ingredients, and vegan-friendly Indian foods for healthy, ethical cooking.',
        metaTitle: 'Vegan Indian Food | Plant-Based Groceries Stockholm',
        metaDescription: 'Shop vegan Indian food & plant-based groceries in Stockholm at Ideal Indiska Livs.',
    },

    // Child Categories
    'nuts': {
        description: 'Premium nuts at Ideal Indiska Livs Stockholm. Shop almonds, cashews, pistachios, walnuts, and exotic nuts for cooking, baking, and healthy snacking.',
        metaTitle: 'Nuts | Almonds, Cashews & Pistachios Stockholm',
        metaDescription: 'Buy premium nuts, almonds & cashews in Stockholm at Ideal Indiska Livs.',
    },
    'diwali': {
        description: 'Diwali special products at Ideal Indiska Livs Stockholm. Shop traditional sweets, festive snacks, pooja items, and gifts for the Festival of Lights celebration.',
        metaTitle: 'Diwali Special | Festival Sweets & Gifts Stockholm',
        metaDescription: 'Buy Diwali sweets, festive snacks & celebration items in Stockholm at Ideal Indiska Livs.',
    },
    'chakki-fresh': {
        description: 'Chakki fresh atta at Ideal Indiska Livs Stockholm. Stone-ground whole wheat flour made fresh for softer rotis and authentic taste. Premium chakki atta from trusted brands.',
        metaTitle: 'Chakki Fresh Atta | Stone Ground Wheat Flour Stockholm',
        metaDescription: 'Buy chakki fresh atta & stone-ground flour in Stockholm at Ideal Indiska Livs.',
    },
    'chicken': {
        description: 'Fresh halal chicken at Ideal Indiska Livs Stockholm. Quality chicken cuts for Indian cooking, curries, tandoori, and biryani preparations.',
        metaTitle: 'Fresh Halal Chicken | Quality Chicken Stockholm',
        metaDescription: 'Buy fresh halal chicken for Indian cooking in Stockholm at Ideal Indiska Livs.',
    },
    'fruits': {
        description: 'Fresh exotic fruits at Ideal Indiska Livs Stockholm. Seasonal Indian fruits including mangoes, guavas, and tropical fruits for cooking and fresh eating.',
        metaTitle: 'Fresh Exotic Fruits | Indian Fruits Stockholm',
        metaDescription: 'Buy fresh exotic & Indian fruits in Stockholm at Ideal Indiska Livs.',
    },
    'paneer-fresh-produce': {
        description: 'Fresh paneer (Indian cottage cheese) at Ideal Indiska Livs Stockholm. Daily fresh paneer for paneer tikka, curries, and traditional Indian dishes.',
        metaTitle: 'Fresh Paneer | Indian Cottage Cheese Stockholm',
        metaDescription: 'Buy fresh paneer (cottage cheese) in Stockholm at Ideal Indiska Livs.',
    },
    'frozen-bbq': {
        description: 'Frozen BBQ and tandoori items at Ideal Indiska Livs Stockholm. Ready-to-cook kebabs, tikkas, and marinated meats for easy grilling and authentic flavors.',
        metaTitle: 'Frozen BBQ | Kebabs & Tandoori Items Stockholm',
        metaDescription: 'Buy frozen BBQ, kebabs & tandoori items in Stockholm at Ideal Indiska Livs.',
    },
    'frozen-parathas': {
        description: 'Frozen parathas at Ideal Indiska Livs Stockholm. Ready-to-cook plain, aloo, and stuffed parathas for quick authentic Indian meals. Premium quality frozen flatbreads.',
        metaTitle: 'Frozen Parathas | Ready-to-Cook Parathas Stockholm',
        metaDescription: 'Buy frozen parathas, aloo paratha & stuffed parathas in Stockholm at Ideal Indiska Livs.',
    },
    'paneer': {
        description: 'Frozen paneer at Ideal Indiska Livs Stockholm. Quality frozen Indian cottage cheese for long storage, perfect for curries, tikka, and traditional recipes.',
        metaTitle: 'Frozen Paneer | Indian Cottage Cheese Stockholm',
        metaDescription: 'Buy frozen paneer for Indian cooking in Stockholm at Ideal Indiska Livs.',
    },
    'electric': {
        description: 'Electric kitchen appliances at Ideal Indiska Livs Stockholm. Shop electric items and kitchen gadgets for Indian cooking and food preparation.',
        metaTitle: 'Electric Kitchen Appliances Stockholm',
        metaDescription: 'Buy electric kitchen appliances & gadgets in Stockholm at Ideal Indiska Livs.',
    },
    'pooja-items': {
        description: 'Hindu pooja items and prayer essentials at Ideal Indiska Livs Stockholm. Shop incense, diyas, kumkum, camphor, and religious items for worship.',
        metaTitle: 'Pooja Items | Hindu Prayer Essentials Stockholm',
        metaDescription: 'Buy pooja items, incense & prayer essentials in Stockholm at Ideal Indiska Livs.',
    },
    'soaps': {
        description: 'Indian soaps and bathing products at Ideal Indiska Livs Stockholm. Natural herbal soaps from brands like Mysore Sandal, Medimix, and Chandrika.',
        metaTitle: 'Indian Soaps | Herbal & Natural Soaps Stockholm',
        metaDescription: 'Buy Indian herbal soaps & natural bathing products in Stockholm at Ideal Indiska Livs.',
    },
    'chana-dal': {
        description: 'Premium chana dal (split chickpeas) at Ideal Indiska Livs Stockholm. High-quality Bengal gram dal for traditional Indian curries, snacks, and sweets.',
        metaTitle: 'Chana Dal | Split Chickpeas Stockholm',
        metaDescription: 'Buy premium chana dal (split chickpeas) in Stockholm at Ideal Indiska Livs.',
    },
    'masoor-dal': {
        description: 'Fresh masoor dal (red lentils) at Ideal Indiska Livs Stockholm. Quick-cooking red lentils perfect for dal tadka, soups, and healthy Indian meals.',
        metaTitle: 'Masoor Dal | Red Lentils Stockholm',
        metaDescription: 'Buy masoor dal (red lentils) in Stockholm at Ideal Indiska Livs.',
    },
    'mong-dal': {
        description: 'Quality moong dal (split mung beans) at Ideal Indiska Livs Stockholm. Nutritious yellow dal for khichdi, dal fry, and traditional Indian cooking.',
        metaTitle: 'Moong Dal | Split Mung Beans Stockholm',
        metaDescription: 'Buy moong dal (split mung beans) in Stockholm at Ideal Indiska Livs.',
    },
    'toor-dal': {
        description: 'Premium toor dal (pigeon peas) at Ideal Indiska Livs Stockholm. Essential dal for sambar, dal tadka, and South Indian cuisine. Also called arhar dal.',
        metaTitle: 'Toor Dal | Pigeon Peas Stockholm',
        metaDescription: 'Buy toor dal (pigeon peas) for sambar in Stockholm at Ideal Indiska Livs.',
    },
    'urid-dal': {
        description: 'Quality urad dal (black lentils) at Ideal Indiska Livs Stockholm. Essential for dal makhani, idli batter, vada, and South Indian preparations.',
        metaTitle: 'Urad Dal | Black Lentils Stockholm',
        metaDescription: 'Buy urad dal (black lentils) in Stockholm at Ideal Indiska Livs.',
    },
    'instant-noodles': {
        description: 'Asian instant noodles at Ideal Indiska Livs Stockholm. Quick-cook Maggi, Top Ramen, and Asian-style instant noodles for convenient meals.',
        metaTitle: 'Instant Noodles | Maggi & Asian Noodles Stockholm',
        metaDescription: 'Buy instant noodles, Maggi & Asian noodles in Stockholm at Ideal Indiska Livs.',
    },
    'vermicelli': {
        description: 'Indian vermicelli (seviyan) at Ideal Indiska Livs Stockholm. Roasted and plain vermicelli for sweet kheer, savory upma, and traditional recipes.',
        metaTitle: 'Vermicelli | Seviyan for Kheer Stockholm',
        metaDescription: 'Buy Indian vermicelli (seviyan) in Stockholm at Ideal Indiska Livs.',
    },
    'ghee': {
        description: 'Pure cow ghee and buffalo ghee at Ideal Indiska Livs Stockholm. Authentic clarified butter from trusted brands for traditional Indian cooking and sweets.',
        metaTitle: 'Pure Ghee | Clarified Butter Stockholm',
        metaDescription: 'Buy pure cow ghee & buffalo ghee in Stockholm at Ideal Indiska Livs.',
    },
    'tooth-paste': {
        description: 'Indian toothpaste and oral care products at Ideal Indiska Livs Stockholm. Natural and herbal toothpaste from Dabur, Vicco, and other trusted brands.',
        metaTitle: 'Indian Toothpaste | Herbal Oral Care Stockholm',
        metaDescription: 'Buy Indian toothpaste & herbal oral care products in Stockholm at Ideal Indiska Livs.',
    },
    'cooking-pastes': {
        description: 'Ready-to-use cooking pastes at Ideal Indiska Livs Stockholm. Ginger-garlic paste, curry pastes, and flavor bases for quick authentic Indian cooking.',
        metaTitle: 'Cooking Pastes | Ginger Garlic Paste Stockholm',
        metaDescription: 'Buy Indian cooking pastes, ginger garlic paste in Stockholm at Ideal Indiska Livs.',
    },
    'ginger-pastes': {
        description: 'Fresh ginger paste at Ideal Indiska Livs Stockholm. Ready-to-use ginger paste for curries, marinades, and Indian cooking.',
        metaTitle: 'Ginger Paste | Fresh Ginger Paste Stockholm',
        metaDescription: 'Buy fresh ginger paste for Indian cooking in Stockholm at Ideal Indiska Livs.',
    },
    'jam': {
        description: 'Indian jams and fruit spreads at Ideal Indiska Livs Stockholm. Mixed fruit jam, mango jam, and traditional preserves for breakfast and snacks.',
        metaTitle: 'Indian Jam | Fruit Spreads Stockholm',
        metaDescription: 'Buy Indian jams & fruit spreads in Stockholm at Ideal Indiska Livs.',
    },
    'vinegar': {
        description: 'Cooking vinegar at Ideal Indiska Livs Stockholm. White vinegar, malt vinegar, and specialty vinegars for pickling and cooking.',
        metaTitle: 'Cooking Vinegar | White & Malt Vinegar Stockholm',
        metaDescription: 'Buy cooking vinegar for pickling in Stockholm at Ideal Indiska Livs.',
    },
    'flakes': {
        description: 'Indian flakes (poha/chivda) at Ideal Indiska Livs Stockholm. Rice flakes, corn flakes, and beaten rice for breakfast and snacks.',
        metaTitle: 'Poha | Rice Flakes Stockholm',
        metaDescription: 'Buy poha (rice flakes) & beaten rice in Stockholm at Ideal Indiska Livs.',
    },
    'idly-rice': {
        description: 'Idli rice at Ideal Indiska Livs Stockholm. Specialty parboiled rice for making perfect South Indian idlis and dosas.',
        metaTitle: 'Idli Rice | South Indian Idli Making Rice Stockholm',
        metaDescription: 'Buy idli rice for dosa & idli batter in Stockholm at Ideal Indiska Livs.',
    },
    'other-grains': {
        description: 'Specialty grains and millets at Ideal Indiska Livs Stockholm. Quinoa, bulgur wheat, millets, and ancient grains for healthy cooking.',
        metaTitle: 'Specialty Grains | Millets & Ancient Grains Stockholm',
        metaDescription: 'Buy specialty grains, millets & healthy grains in Stockholm at Ideal Indiska Livs.',
    },
    'indian-snacks': {
        description: 'Traditional Indian snacks and namkeen at Ideal Indiska Livs Stockholm. Bhujia, mixture, chakli, and authentic savory snacks from Haldiram, Bikaji, and more.',
        metaTitle: 'Indian Snacks | Namkeen, Bhujia & Mixture Stockholm',
        metaDescription: 'Buy Indian snacks, namkeen & bhujia in Stockholm at Ideal Indiska Livs.',
    },
    'slanty': {
        description: 'Slanty snacks at Ideal Indiska Livs Stockholm. Crispy and savory Indian snack products for tea-time and parties.',
        metaTitle: 'Slanty Snacks Stockholm',
        metaDescription: 'Buy Slanty crispy snacks in Stockholm at Ideal Indiska Livs.',
    },
    'chaat-ingredients': {
        description: 'Chaat ingredients at Ideal Indiska Livs Stockholm. Sev, papdi, puffed rice, and all essentials for making authentic Indian street food at home.',
        metaTitle: 'Chaat Ingredients | Indian Street Food Stockholm',
        metaDescription: 'Buy chaat ingredients & street food essentials in Stockholm at Ideal Indiska Livs.',
    },
    'recipe-mixes': {
        description: 'Ready-to-cook recipe mixes at Ideal Indiska Livs Stockholm. Instant biryani mix, curry mixes, and specialty recipe preparations for quick meals.',
        metaTitle: 'Recipe Mixes | Instant Cooking Mixes Stockholm',
        metaDescription: 'Buy Indian recipe mixes & instant cooking preparations in Stockholm at Ideal Indiska Livs.',
    },
    'instant-drink-mixes': {
        description: 'Instant drink mixes at Ideal Indiska Livs Stockholm. Mango drink, rose sherbet, and instant beverage powders for refreshing drinks.',
        metaTitle: 'Instant Drink Mixes | Mango Drink Mix Stockholm',
        metaDescription: 'Buy instant drink mixes & beverage powders in Stockholm at Ideal Indiska Livs.',
    },
    'soft-drinks': {
        description: 'Indian soft drinks and carbonated beverages at Ideal Indiska Livs Stockholm. Thums Up, Limca, Maaza, and imported soft drinks.',
        metaTitle: 'Indian Soft Drinks | Thums Up, Limca Stockholm',
        metaDescription: 'Buy Indian soft drinks, Thums Up & Limca in Stockholm at Ideal Indiska Livs.',
    },
};

async function optimizeCategories() {
    console.log('\n🔧 Optimizing WooCommerce Category SEO\n');
    console.log('═'.repeat(100));

    try {
        // Read categories data
        const categoriesPath = path.join(__dirname, '..', 'categories-data.json');
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

        let updated = 0;
        let failed = 0;
        let skipped = 0;

        console.log('\n📝 Processing categories...\n');

        for (const parent of categoriesData) {
            // Process parent category
            const parentSlug = parent.slug;
            const seoData = categoryDescriptions[parentSlug];

            if (seoData) {
                try {
                    console.log(`\n▶ Updating: ${parent.name} (ID: ${parent.id})`);
                    console.log(`   Slug: ${parentSlug}`);

                    const updateData = {
                        description: seoData.description,
                        // Yoast SEO meta fields
                        yoast_head_json: {
                            title: seoData.metaTitle,
                            description: seoData.metaDescription,
                        }
                    };

                    await wcApi(`products/categories/${parent.id}`, 'PUT', updateData);

                    console.log(`   ✅ Updated successfully!`);
                    console.log(`   📝 Meta Title: ${seoData.metaTitle}`);
                    console.log(`   📝 Meta Desc: ${seoData.metaDescription}`);
                    updated++;

                    // Small delay
                    await new Promise(resolve => setTimeout(resolve, 300));

                } catch (error) {
                    console.log(`   ❌ Failed: ${error.message}`);
                    failed++;
                }
            } else {
                console.log(`\n⚠️  Skipping: ${parent.name} (No SEO data defined)`);
                skipped++;
            }

            // Process child categories
            for (const child of parent.children) {
                const childSlug = child.slug;
                const childSeoData = categoryDescriptions[childSlug];

                if (childSeoData) {
                    try {
                        console.log(`\n   └─ Updating child: ${child.name} (ID: ${child.id})`);
                        console.log(`      Slug: ${childSlug}`);

                        const updateData = {
                            description: childSeoData.description,
                            yoast_head_json: {
                                title: childSeoData.metaTitle,
                                description: childSeoData.metaDescription,
                            }
                        };

                        await wcApi(`products/categories/${child.id}`, 'PUT', updateData);

                        console.log(`      ✅ Updated successfully!`);
                        console.log(`      📝 Meta Title: ${childSeoData.metaTitle}`);
                        console.log(`      📝 Meta Desc: ${childSeoData.metaDescription}`);
                        updated++;

                        await new Promise(resolve => setTimeout(resolve, 300));

                    } catch (error) {
                        console.log(`      ❌ Failed: ${error.message}`);
                        failed++;
                    }
                } else if (!child.hasDescription) {
                    console.log(`\n   ⚠️  Skipping child: ${child.name} (No SEO data defined)`);
                    skipped++;
                }
            }
        }

        console.log('\n' + '═'.repeat(100));
        console.log('\n📊 SUMMARY:');
        console.log(`   ✅ Successfully updated: ${updated} categories`);
        console.log(`   ⚠️  Skipped: ${skipped} categories`);
        if (failed > 0) {
            console.log(`   ❌ Failed: ${failed} categories`);
        }
        console.log('');
        console.log('═'.repeat(100));
        console.log('✅ Done!\n');

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

optimizeCategories().catch(console.error);
