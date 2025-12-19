import { Metadata } from "next";
import { PageTemplate } from "@/components/templates";
import { SchemaScript } from "@/lib/schema/schema-script";
import { goteborgMalmoDeliveryServiceSchema } from "@/lib/schema";

export const metadata: Metadata = {
    title: "Grocery Delivery Göteborg & Malmö | Ideal Indiska Livs",
    description: "Authentic Indian and Pakistani groceries delivered to Göteborg, Malmö, and all over Skåne and West Sweden via DHL.",
};

export default function GoteborgMalmoDeliveryPage() {
    const content = `
    <p class="lead">Serving South Sweden with authentic Indian and Pakistani groceries</p>

    <h2>Göteborg & Malmö Delivery Coverage</h2>
    
    <h3>Göteborg Areas</h3>
    <ul>
      <li><strong>Central Göteborg:</strong> Centrum, Inom Vallgraven, Linné, Majorna-Linné, Örgryte-Härlanda</li>
      <li><strong>Greater Göteborg:</strong> Mölndal, Partille, Lerum, Kungsbacka, Kungälv</li>
    </ul>

    <h3>Malmö & Skåne Areas</h3>
    <ul>
      <li><strong>Malmö Districts:</strong> Centrum, Västra Hamnen, Rosengård, Södra Innerstaden, Limhamn-Bunkeflo, Husie</li>
      <li><strong>Surrounding Areas:</strong> Lund, Helsingborg, Trelleborg, Ystad, Landskrona</li>
    </ul>

    <h2>Delivery Details</h2>
    <ul>
      <li><strong>Göteborg Days:</strong> Tuesday, Thursday, Saturday</li>
      <li><strong>Malmö Days:</strong> Wednesday and Saturday</li>
      <li><strong>Order Deadline:</strong> 24 hours before delivery (6 PM day before for Göteborg)</li>
      <li><strong>Delivery Time:</strong> Typically 2-6 PM (Malmö also offers 9-12 slot)</li>
      <li><strong>Minimum Order:</strong> No minimum order required</li>
    </ul>

    <h3>Why Families in Göteborg & Malmö Choose Us</h3>
    <ul>
      <li>✓ Scheduled delivery - plan your weekly shopping</li>
      <li>✓ Fresh quality guaranteed</li>
      <li>✓ Competitive pricing for the local market</li>
      <li>✓ Large orders welcome - perfect for families</li>
    </ul>

    <h3>Popular Products</h3>
    <ul>
      <li>Fresh Indian & Pakistani vegetables and herbs</li>
      <li>Halal meat and chicken selection</li>
      <li>Premium rice varieties (Basmati, Sella)</li>
      <li>South Indian specialties (dosa mix, sambhar powder)</li>
      <li>Indian and Pakistani snacks and sweets</li>
    </ul>

    <h2>Place Your Order</h2>
    <ul>
      <li><strong>Advance Booking:</strong> Required 24-48 hours</li>
      <li><strong>Delivery Fee:</strong> Delivered by DHL, prices calculated at checkout</li>
      <li><strong>Contact:</strong> WhatsApp <a href="https://wa.me/46728494801">+46 728 494 801</a></li>
    </ul>

    <p><strong>Note:</strong> All delivery times are approximate. Exact available slots will be shown at checkout.</p>
    `;

    return (
        <>
            <PageTemplate
                title="Indian & Pakistani Grocery Delivery in Göteborg & Malmö"
                content={content}
                breadcrumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Delivery Information', href: '/delivery-information' },
                    { label: 'Göteborg & Malmö' }
                ]}
                layout="two-column"
                showHero={true}
            />

            {/* SEO Structured Data */}
            <SchemaScript
                id="goteborg-malmo-delivery-schema"
                schema={goteborgMalmoDeliveryServiceSchema()}
            />
        </>
    );
}
