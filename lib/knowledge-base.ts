import knowledgeBase from '@/data/knowledge-base.json';
import { brandConfig } from '@/config/brand.config';

interface KnowledgeBaseResponse {
    answer: string;
    confidence: 'high' | 'medium' | 'low';
    category?: string;
}

/**
 * Search the knowledge base for relevant information
 */
export function searchKnowledgeBase(query: string): KnowledgeBaseResponse {
    const lowerQuery = query.toLowerCase();

    // Check for keyword matches
    const matchedKeywords = findMatchingKeywords(lowerQuery);

    // Check for specific intents based on keywords
    if (matchedKeywords.includes('spicy') || matchedKeywords.includes('heat')) {
        return getSpiceInfo(lowerQuery);
    }

    if (matchedKeywords.includes('sweet') || matchedKeywords.includes('dessert')) {
        return getSweetsInfo();
    }

    if (matchedKeywords.includes('vegetarian') || matchedKeywords.includes('veg')) {
        return getDietaryInfo('vegetarian');
    }

    if (matchedKeywords.includes('vegan')) {
        return getDietaryInfo('vegan');
    }

    if (matchedKeywords.includes('halal')) {
        return getDietaryInfo('halal');
    }

    if (matchedKeywords.includes('gluten')) {
        return getDietaryInfo('gluten_free');
    }

    if (matchedKeywords.includes('buffet')) {
        return getBuffetInfo();
    }

    if (matchedKeywords.includes('catering') || matchedKeywords.includes('event') || matchedKeywords.includes('party')) {
        return getCateringInfo();
    }

    if (matchedKeywords.includes('reservation') || matchedKeywords.includes('book') || matchedKeywords.includes('table')) {
        return getReservationInfo();
    }

    if (matchedKeywords.includes('location') || matchedKeywords.includes('where') || matchedKeywords.includes('address')) {
        return getLocationInfo();
    }

    if (matchedKeywords.includes('hours') || matchedKeywords.includes('open') || matchedKeywords.includes('timing')) {
        return getHoursInfo();
    }

    if (matchedKeywords.includes('menu') || matchedKeywords.includes('dishes')) {
        return getMenuInfo();
    }

    if (matchedKeywords.includes('delivery')) {
        return getDeliveryInfo();
    }

    if (matchedKeywords.includes('price') || matchedKeywords.includes('cost')) {
        return getPriceInfo();
    }

    // Try to find FAQ match
    const faqMatch = findFAQMatch(lowerQuery);
    if (faqMatch) {
        return {
            answer: faqMatch.answer,
            confidence: 'high',
            category: faqMatch.category
        };
    }

    // Check for specific dish mentions
    const dishMatch = findDishMatch(lowerQuery);
    if (dishMatch) {
        return dishMatch;
    }

    // Default response
    return getDefaultResponse();
}

function findMatchingKeywords(query: string): string[] {
    const matched: string[] = [];
    Object.entries(knowledgeBase.keywords).forEach(([category, keywords]) => {
        if (keywords.some(keyword => query.includes(keyword.toLowerCase()))) {
            matched.push(category);
        }
    });
    return matched;
}

function findFAQMatch(query: string): any {
    return knowledgeBase.faqs.find(faq =>
        query.includes(faq.question.toLowerCase()) ||
        faq.question.toLowerCase().includes(query) ||
        calculateSimilarity(query, faq.question.toLowerCase()) > 0.6
    );
}

function findDishMatch(query: string): KnowledgeBaseResponse | null {
    const dish = knowledgeBase.popular_dishes.find(d =>
        query.includes(d.name.toLowerCase())
    );

    if (dish) {
        const dietaryInfo = dish.dietary.length > 0 ? ` (${dish.dietary.join(', ')})` : '';
        return {
            answer: `**${dish.name}** - ${dish.description}. Spice level: ${dish.spice_level}${dietaryInfo}. Would you like to see our full menu?`,
            confidence: 'high',
            category: 'dish'
        };
    }

    return null;
}

function getSpiceInfo(query: string): KnowledgeBaseResponse {
    if (query.includes('not spicy') || query.includes('mild')) {
        return {
            answer: "Looking for mild options? Try our **Butter Chicken**, **Korma**, or **Palak Paneer** - they're flavorful but not spicy. We can always adjust the spice level to your preference!",
            confidence: 'high',
            category: 'spice'
        };
    }
    return {
        answer: "For a spicy kick, I recommend our **Chicken Tikka**, **Vindaloo**, or **Chili Chicken**! We can adjust the spice level from mild to extra hot - just let us know your preference when ordering.",
        confidence: 'high',
        category: 'spice'
    };
}

function getSweetsInfo(): KnowledgeBaseResponse {
    const sweets = knowledgeBase.popular_dishes
        .filter(d => d.category === 'sweets')
        .map(d => `**${d.name}**`)
        .join(', ');

    return {
        answer: `Our traditional Indian sweets are legendary! Popular choices: ${sweets}. All made fresh daily. Visit our [Sweets Menu](/menu/sweets) to see the full selection!`,
        confidence: 'high',
        category: 'sweets'
    };
}

function getDietaryInfo(type: string): KnowledgeBaseResponse {
    const info = knowledgeBase.dietary_options[type as keyof typeof knowledgeBase.dietary_options];
    if (info && info.available) {
        const examples = 'examples' in info ? (info.examples as string[]).join(', ') : '';
        let answer = info.description;
        if (examples) {
            answer += ` Try: ${examples}.`;
        }
        if ('note' in info) {
            answer += ` ${info.note}`;
        }
        return {
            answer,
            confidence: 'high',
            category: 'dietary'
        };
    }
    return getDefaultResponse();
}

function getBuffetInfo(): KnowledgeBaseResponse {
    return {
        answer: `We offer special buffet options! Visit our store during business hours to enjoy our buffet. [Learn more](/lunch-buffet-in-stockholm) | [Weekend Brunch](/weekend-brunch-buffet)`,
        confidence: 'high',
        category: 'buffet'
    };
}

function getCateringInfo(): KnowledgeBaseResponse {
    return {
        answer: `We offer full-service catering for weddings, parties, and corporate events with customizable menus and a price calculator.\n\nVisit our [Catering Page](/special-order) to explore packages and get a quote!`,
        confidence: 'high',
        category: 'catering'
    };
}

function getReservationInfo(): KnowledgeBaseResponse {
    return {
        answer: `You can book a table easily online! For group bookings or special events, please contact us directly.\n\n[Book Now](/bookings) or email us at ${brandConfig.contact.reservationEmail}.`,
        confidence: 'high',
        category: 'reservations'
    };
}

function getLocationInfo(): KnowledgeBaseResponse {
    return {
        answer: `We're located at **${brandConfig.contact.address}**.\n\nFind us on [Google Maps](${brandConfig.contact.googleMapsUrl}) for directions!`,
        confidence: 'high',
        category: 'location'
    };
}

function getHoursInfo(): KnowledgeBaseResponse {
    return {
        answer: `**Opening Hours:**\n\n${brandConfig.hours.weekday}\n${brandConfig.hours.saturday}\n${brandConfig.hours.sunday}`,
        confidence: 'high',
        category: 'hours'
    };
}

function getMenuInfo(): KnowledgeBaseResponse {
    const categories = ["Starters", "Main Course (Lamb, Beef, Chicken)", "Vegetarian", "Tandoor", "Biryani", "Sweets"];

    return {
        answer: `Explore our menu with: ${categories.join(', ')}.\n\nView full menu: [Restaurant Food](/menu/restaurant) | [Sweets](/menu/sweets) | [Bakery](/menu/bakery)`,
        confidence: 'high',
        category: 'menu'
    };
}

function getDeliveryInfo(): KnowledgeBaseResponse {
    return {
        answer: `**Delivery:** ${brandConfig.features.hasDelivery ? "Yes, we offer delivery!" : "Currently we do not offer delivery."}\n\nCheck our website for online ordering options or call us at ${brandConfig.contact.phone} for delivery details!`,
        confidence: 'high',
        category: 'delivery'
    };
}

function getPriceInfo(): KnowledgeBaseResponse {
    return {
        answer: `Our prices are competitive and offer great value for ${brandConfig.cuisineDescription}! For specific pricing, please check our [Menu](/menu/restaurant) or use our [Catering Calculator](/special-order) for event pricing. Feel free to call us for any pricing questions!`,
        confidence: 'medium',
        category: 'pricing'
    };
}

function getDefaultResponse(): KnowledgeBaseResponse {
    return {
        answer: `I'd be happy to help! At **${brandConfig.businessName}**, we offer ${brandConfig.cuisineDescription}, traditional sweets, catering services, and more.\n\nYou can:\n- Browse our [Menu](/menu/restaurant)\n- Book a [Reservation](/bookings)\n- Explore [Catering Options](/special-order)\n- Try our lunch or weekend buffets\n\nWhat would you like to know more about?`,
        confidence: 'low'
    };
}

// Simple similarity calculation
function calculateSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
}

export function getGreeting(): string {
    return `Hello! I'm your **Ideal Indiska Assistant**. I can help you with:\n\n✨ Menu recommendations\n🍽️ Reservations\n🎉 Catering & events\n📍 Location & hours\n💬 Any questions about our food\n\nWhat can I help you with today?`;
}
