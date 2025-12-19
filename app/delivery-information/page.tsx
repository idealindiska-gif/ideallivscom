import { Metadata } from "next";
import { PageTemplate } from "@/components/templates";
import { SchemaScript } from "@/lib/schema/schema-script";
import { stockholmDeliveryServiceSchema, deliveryFAQSchema } from "@/lib/schema";

export const metadata: Metadata = {
    title: "Grocery Delivery Stockholm & Sweden | Ideal Indiska Livs",
    description: "Get authentic Indian and Pakistani groceries delivered in Stockholm & all over Sweden. Free delivery in Stockholm over 500 SEK. Fast shipping via DHL.",
};

export default function DeliveryInformationPage() {
    const content = `
    <p class="lead">Welcome to Ideal Indiska Livs! We make it easier than ever to get your favourite authentic Indian and Pakistani groceries. We are proud to offer FREE delivery across all of Stockholm on qualifying orders, as well as fast and flexible shipping options to every corner of Sweden through our trusted partner, DHL.</p>

    <p>Whether you are in Bandhagen, Södermalm, Kungsholmen, Norrmalm, Vasastan, Östermalm, Gamla Stan, or the surrounding suburbs, getting the taste of home is just a few clicks away.</p>

    <h2>Delivery Options for Stockholm</h2>
    <p>We offer two convenient delivery methods for all our customers within the Stockholm area.</p>

    <h3>1. Ideal Indiska Local Delivery (Our Own Service)</h3>
    <p>Enjoy our personalized local delivery service with great flexibility and value.</p>
    <ul>
        <li><strong>FREE Delivery:</strong> On all orders of 500 kr or more across all of Stockholm.</li>
        <li><strong>Standard Delivery:</strong> For orders between 300 kr and 499 kr, a flat delivery fee of just 30 kr applies.</li>
        <li><strong>Minimum Order:</strong> The minimum order for our local delivery service is 300 kr.</li>
    </ul>

    <h4>Delivery to All of Stockholm Areas:</h4>
    <p>Our local delivery covers the entire Stockholm region, including central areas like Södermalm, Kungsholmen, Norrmalm, Vasastan, and Östermalm, as well as surrounding communities including Solna, Sundbyberg, Kista, Nacka, Huddinge, and Järfälla. If you have a Stockholm address, we'll deliver to you!</p>

    <h4>Special Same-Day Evening Delivery for Our Neighbours:</h4>
    <p>For our local community in and around Bandhagen, we offer a special Same-day evening delivery service.</p>
    <ul>
        <li><strong>Areas:</strong> Bandhagen, Högdalen, Hagsätra, Rågsved, Stureby, Farsta, Älvsjö.</li>
        <li><strong>Schedule:</strong> Place your order before 4 PM (16:00) to receive your delivery the Same day evening between 7 PM - 10 PM (19:00 - 22:00).</li>
    </ul>

    <h4>Choose Your Time:</h4>
    <p>For all other areas in Stockholm using our local delivery, you can select your preferred delivery date and time slot during the checkout process for maximum convenience.</p>

    <h3>2. DHL Shipping within Stockholm</h3>
    <p>If you prefer the flexibility of DHL or have a larger/heavier order, you can also choose DHL for delivery within Stockholm.</p>
    <ul>
        <li><strong>Rates:</strong> Shipping costs are calculated dynamically at checkout based on the weight and size of your order.</li>
        <li><strong>Options:</strong> You can choose from various DHL services, including home delivery or delivery to a nearby service point.</li>
    </ul>

    <h3>Local Pickup - Always Free!</h3>
    <p>You are always welcome to place your order online and collect it from our store in Bandhagen at no extra cost.</p>
    <ul>
        <li><strong>Cost:</strong> Free</li>
        <li><strong>Location:</strong> Ideal Indiska Livs, Bandhagsplan 4, 12432 Bandhagen Centrum</li>
        <li><strong>How it Works:</strong> Select "Local Pickup" at checkout. You will receive an email or SMS notification when your order is packed and ready for you to collect during our store opening hours.</li>
    </ul>

    <h2>Our Delivery Commitment</h2>
    <p>We understand the importance of receiving your groceries in perfect condition. We take great care in packing every order, ensuring that fresh produce, frozen items, and fragile goods are handled appropriately to maintain their quality from our store to your door.</p>

    <hr />

    <h3>Free Delivery All Over Stockholm (Orders > 500 SEK):</h3>
    <ul>
        <li><strong>Central Stockholm:</strong> Gamla Stan, Södermalm, Östermalm, Norrmalm, Vasastan, Kungsholmen.</li>
        <li><strong>Greater Stockholm:</strong> Solna, Sundbyberg, Danderyd, Lidingö, Nacka, Huddinge, Botkyrka, and all other areas.</li>
    </ul>

    <h2>Shipping to the Rest of Sweden via DHL</h2>
    <p>We are thrilled to serve customers across all of Sweden!</p>
    <ul>
        <li><strong>No Minimum Order:</strong> There is no minimum order amount required for shipping to the rest of Sweden.</li>
        <li><strong>Reliable Partner:</strong> We use DHL to ensure your groceries arrive safely and promptly.</li>
        <li><strong>Flexible Options:</strong> Home Delivery or Service Point Pickup available at checkout.</li>
        <li><strong>Calculated Rates:</strong> Fees are based on weight and location, calculated automatically.</li>
    </ul>

    <h2>Why Choose Ideal Livs for Stockholm Delivery?</h2>
    <ul>
        <li>✓ Largest selection of Indian and Pakistani groceries in Stockholm</li>
        <li>✓ Same-day delivery to most Stockholm areas</li>
        <li>✓ Fresh products sourced directly from trusted suppliers</li>
        <li>✓ Competitive prices with regular discounts</li>
        <li>✓ Halal certified meat and products</li>
    </ul>

    <h2>How Our Stockholm Grocery Delivery Works</h2>
    <ol>
        <li><strong>Shop Online:</strong> Browse ideallivs.com and add items to your cart.</li>
        <li><strong>Checkout:</strong> Enter your address to see the calculated delivery fee.</li>
        <li><strong>Choose Delivery Time:</strong> Select a convenient slot from available options.</li>
        <li><strong>Relax:</strong> We pack with care and deliver directly to your door!</li>
    </ol>

    <h2>Delivery Schedule & Times</h2>
    <ul>
        <li><strong>Delivery Days:</strong> Monday to Sunday.</li>
        <li><strong>Order Cut-off:</strong> Place order before 4 PM for same-day delivery.</li>
        <li><strong>Delivery Slots:</strong> Typically 19:00 - 22:00. Shown at checkout.</li>
    </ul>

    <h2>Shipping Across Europe via DHL</h2>
    <p><strong>NEW!</strong> We now serve customers in all countries across Europe. Bring the taste of authentic Indian and Pakistani groceries to your European home! No minimum order value. Rates calculated at checkout.</p>
    `;

    return (
        <>
            <PageTemplate
                title="Grocery Delivery Information for Stockholm & Sweden"
                content={content}
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Delivery Information' }
                ]}
                layout="two-column"
                showHero={true}
            />

            {/* SEO Structured Data */}
            <SchemaScript
                id="delivery-service-schema"
                schema={stockholmDeliveryServiceSchema()}
            />
            <SchemaScript
                id="delivery-faq-schema"
                schema={deliveryFAQSchema()}
            />
        </>
    );
}
