"use client";

import { Phone, Mail, MapPin, Clock, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { brandConfig } from "@/config/brand.config";
import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/store-hours";

// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

export function TopInfoBar() {
  const { contact } = brandConfig;
  const [storeStatus, setStoreStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    // Update store status on mount and every minute
    const updateStatus = () => setStoreStatus(getStoreStatus());
    updateStatus();

    const interval = setInterval(updateStatus, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Format phone number for links
  const phoneClean = contact.phone.replace(/\s+/g, '');
  const whatsappLink = `https://wa.me/${phoneClean.replace('+', '')}`;

  return (
    <div className="hidden lg:block w-full bg-green-700 text-white py-2 px-6">
      <div className="flex items-center justify-between text-xs md:text-sm font-medium">
        {/* Left side - Contact info */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* Call Button */}
            <a
              href={`tel:${phoneClean}`}
              className="flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded-md transition-colors"
              title="Call us"
            >
              <Phone className="h-4 w-4" />
              <span>+46 728 494 801</span>
            </a>

            {/* WhatsApp Button */}
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white px-2 py-1 rounded-md transition-colors shadow-sm"
              title="Chat on WhatsApp"
            >
              <WhatsAppIcon className="h-4 w-4" />
              <span className="hidden xl:inline">WhatsApp</span>
            </a>
          </div>

          <div className="flex items-center gap-2 text-white/90">
            <Mail className="h-4 w-4" />
            <a href={`mailto:${contact.email}`} className="hover:underline hover:text-white">
              {contact.email}
            </a>
          </div>
        </div>

        {/* Right side - Store hours, online orders & location */}
        <div className="flex items-center gap-6">
          {/* Physical Store Status */}
          {storeStatus && (
            <div className="flex items-center gap-2 text-white/90">
              <Clock className="h-4 w-4" />
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                  storeStatus.isOpen
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : 'bg-red-500/20 text-red-100 border border-red-400/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${storeStatus.isOpen ? 'bg-green-300' : 'bg-red-300'}`} />
                  {storeStatus.statusText}
                </span>
                <span className="hidden xl:inline text-white/80">•</span>
                <span className="hidden xl:inline">{storeStatus.todayHours}</span>
              </div>
            </div>
          )}

          {/* Online Orders 24/7 */}
          <div className="flex items-center gap-2 bg-white/10 px-2 py-1 rounded-md border border-white/20">
            <ShoppingCart className="h-4 w-4 text-green-300" />
            <span className="text-white font-semibold text-xs">Orders 24/7</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <a
              href={contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline hover:text-white"
            >
              Bandhagen, Stockholm
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
