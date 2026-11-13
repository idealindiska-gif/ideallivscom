import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { brandProfile } from '@/config/brand-profile';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock, Youtube, ExternalLink, Linkedin } from 'lucide-react';
import { getOnSaleProducts } from '@/lib/woocommerce/products-direct';

export async function Footer() {
  const saleProducts = await getOnSaleProducts(3);

  return (
    <footer className="w-full bg-primary border-t border-white/10 pt-8 pb-4 sm:pt-10 sm:pb-6 text-white">
      <div className="w-full px-5 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-6 mb-6">
          {/* Left Column: Brand Info */}
          <div className="sm:col-span-2 lg:col-span-3 flex flex-col items-start -mt-2">
            <Link href="/" className="inline-block mb-4">
              {/* Brand Logo */}
              <div className="relative h-12 w-24">
                <Image
                  src="https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-white.png"
                  alt={brandProfile.name}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
            </Link>

            <div className="space-y-4 text-sm text-white/80 leading-relaxed font-sans max-w-xs">
              <div className="space-y-0.5">
                <p className="font-semibold text-white italic opacity-90 mb-1">Stockholm's Best Indian & Pakistani Grocery</p>
                <p className="text-white/80">{brandProfile.address.street}, {brandProfile.address.area}</p>
                <p className="text-white/80">{brandProfile.address.postalCode} {brandProfile.address.city}, Sweden</p>
              </div>

              <div className="space-y-0.5">
                <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-white/80">
                  <Mail className="h-3 w-3" /> {brandProfile.contact.email}
                </p>
                <p className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer text-white/80">
                  <Phone className="h-3 w-3" /> {brandProfile.contact.phoneFormatted}
                </p>
              </div>
            </div>
          </div>

          {/* Column 2: Delivery Information */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] mb-4 text-white">Delivery</h4>
            <ul className="space-y-3 text-sm text-white/70 font-sans">
              <li>
                <Link href="/delivery-information" className="group hover:text-white transition-colors">
                  <p className="font-semibold text-white mb-0.5 group-hover:text-white transition-colors">Delivery Info</p>
                  <p className="text-xs opacity-80">Fast & reliable delivery across Sweden</p>
                </Link>
              </li>
              <li>
                <div className="space-y-0.5">
                  <p className="font-semibold text-white">Neighborhoods</p>
                  <p className="text-[11px] leading-relaxed opacity-80">
                    Bandhagen, Högdalen, Enskede, Älvsjö, Farsta, Stockholms innerstad & more.
                  </p>
                </div>
              </li>
              <li>
                <p className="font-semibold text-white mb-0.5">Same-Day</p>
                <p className="text-xs opacity-80">Available for local Stockholm orders</p>
              </li>
            </ul>
          </div>

          {/* Column 3: Products on Sale */}
          <div className="lg:col-span-3">
            <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] mb-4 text-white">Featured Offers</h4>
            <div className="space-y-3">
              {saleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="flex gap-3 group items-center"
                >
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/20 shadow-sm">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="48px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-white/50">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h5 className="text-[13px] font-medium text-white group-hover:text-white/80 transition-colors line-clamp-1 truncate">
                      {product.name}
                    </h5>
                    <div
                      className="text-[11px] font-bold text-white/90 mt-0.5"
                      dangerouslySetInnerHTML={{ __html: product.price_html || '' }}
                    />
                  </div>
                </Link>
              ))}
              {saleProducts.length === 0 && (
                <p className="text-xs text-white/60 italic">No sale items currently.</p>
              )}
            </div>
          </div>

          {/* Column 4: Links */}
          <div className="sm:col-span-2 lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] mb-4 text-white">Shop</h4>
              <ul className="space-y-2.5 text-sm text-white/70 font-sans">
                <li><Link href="/shop" className="hover:text-white transition-colors">All Products</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Our Blog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] mb-4 text-white">Connect</h4>
              <ul className="space-y-2.5 text-sm text-white/70 font-sans">
                {brandProfile.social.instagram && (
                  <li>
                    <Link href={brandProfile.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2.5">
                      <Instagram className="h-3.5 w-3.5" /> Instagram
                    </Link>
                  </li>
                )}
                {brandProfile.social.facebook && (
                  <li>
                    <Link href={brandProfile.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2.5">
                      <Facebook className="h-3.5 w-3.5" /> Facebook
                    </Link>
                  </li>
                )}
                {brandProfile.social.youtube && (
                  <li>
                    <Link href={brandProfile.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2.5">
                      <Youtube className="h-3.5 w-3.5" /> YouTube
                    </Link>
                  </li>
                )}
                {brandProfile.social.twitter && (
                  <li>
                    <Link href={brandProfile.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-2.5">
                      <Twitter className="h-3.5 w-3.5" /> X
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-heading text-[13px] font-bold uppercase tracking-[0.15em] mb-4 text-white">Support</h4>
              <ul className="space-y-2.5 text-sm text-white/70 font-sans">
                <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link href="/terms-conditions" className="hover:text-white transition-colors">Terms</Link></li>
                <li><Link href="/refund-return" className="hover:text-white transition-colors">Refunds</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-4 flex flex-col md:flex-row items-start md:items-center md:justify-between gap-2 md:gap-4" style={{ fontSize: '10px' }}>
          {/* Copyright */}
          <p className="text-white/60 tracking-wide font-sans">
            © {new Date().getFullYear()} Ideal Indiska Livs. All Rights Reserved.
          </p>

          {/* Payment Icons */}
          <img
            src="https://crm.ideallivs.com/wp-content/uploads/2026/01/payment-methods.png"
            alt="Payment Methods"
            className="h-5 w-auto object-contain"
          />

          {/* Credits */}
          <p className="flex items-center gap-1.5 text-white/60 tracking-wide font-sans">
            <span>by</span>
            <a href="https://fourlinesagency.com" target="_blank" rel="nofollow noopener noreferrer" className="font-semibold text-white/80 hover:text-white transition-colors flex items-center gap-1 uppercase">
              Fourlines <ExternalLink className="h-2 w-2" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
