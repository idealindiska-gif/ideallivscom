import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { brandProfile } from '@/config/brand-profile';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail, Clock, Youtube, ExternalLink, Linkedin } from 'lucide-react';
import { getOnSaleProducts } from '@/lib/woocommerce/products-direct';

export async function Footer() {
  const saleProducts = await getOnSaleProducts(3);

  return (
    <footer className="w-full bg-background border-t border-border/10 pt-16 pb-8">
      <div className="w-full px-5 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16">
          {/* Left Column: Brand Info */}
          <div className="md:col-span-12 lg:col-span-3 space-y-6">
            <Link href="/" className="inline-block">
              {/* Brand Logo */}
              <div className="relative h-16 w-28">
                <Image
                  src="https://crm.ideallivs.com/wp-content/uploads/2025/04/final-new-logo-black.png"
                  alt={brandProfile.name}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>

            <div className="space-y-3 text-xs text-muted-foreground leading-none">
              <div>
                <p>{brandProfile.address.street}</p>
                <p>{brandProfile.address.area}</p>
                <p>{brandProfile.address.postalCode} {brandProfile.address.city}</p>
              </div>

              <div>
                <p>{brandProfile.contact.email}</p>
                <p>{brandProfile.contact.phoneFormatted}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Delivery Information (Replaced Newsletter) */}
          <div className="md:col-span-4 lg:col-span-2">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 text-foreground">Delivery</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/delivery-information" className="hover:text-primary transition-colors">
                  <p className="font-medium text-foreground mb-1">Delivery Information</p>
                  <p className="text-xs">Fast & reliable delivery</p>
                </Link>
              </li>
              <li>
                <p className="font-medium text-foreground mb-1">Delivery Areas</p>
                <p className="text-xs">Stockholm & surrounding areas</p>
              </li>
              <li>
                <p className="font-medium text-foreground mb-1">Free Delivery</p>
                <p className="text-xs">On orders over 500 SEK</p>
              </li>
            </ul>
          </div>

          {/* Column 3: Products on Sale */}
          <div className="md:col-span-4 lg:col-span-3">
            <h4 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 text-foreground">On Sale</h4>
            <div className="space-y-3">
              {saleProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/product/${product.slug}`}
                  className="flex gap-3 group items-start"
                >
                  <div className="relative w-10 h-10 rounded-sm overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                    {product.images && product.images[0] ? (
                      <Image
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        sizes="40px"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">
                        No Img
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                    <h5 className="text-xs font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 truncate">
                      {product.name}
                    </h5>
                    <div
                      className="text-[10px] text-muted-foreground"
                      dangerouslySetInnerHTML={{ __html: product.price_html || '' }}
                    />
                  </div>
                </Link>
              ))}
              {saleProducts.length === 0 && (
                <p className="text-xs text-muted-foreground">No sale items currently.</p>
              )}
            </div>
          </div>

          {/* Column 4: Links */}
          <div className="md:col-span-4 lg:col-span-4 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                </li>
              </ul>
            </div>

            {/* Follow Us */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 text-foreground">Follow Us</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {brandProfile.social.instagram && (
                  <li>
                    <Link href={brandProfile.social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <Instagram className="h-3 w-3" />
                      Instagram
                    </Link>
                  </li>
                )}
                {brandProfile.social.facebook && (
                  <li>
                    <Link href={brandProfile.social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <Facebook className="h-3 w-3" />
                      Facebook
                    </Link>
                  </li>
                )}
                {brandProfile.social.tiktok && (
                  <li>
                    <Link href={brandProfile.social.tiktok} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      TikTok
                    </Link>
                  </li>
                )}
                {brandProfile.social.youtube && (
                  <li>
                    <Link href={brandProfile.social.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <Youtube className="h-3 w-3" />
                      YouTube
                    </Link>
                  </li>
                )}
                {brandProfile.social.twitter && (
                  <li>
                    <Link href={brandProfile.social.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <Twitter className="h-3 w-3" />
                      X (Twitter)
                    </Link>
                  </li>
                )}
                {brandProfile.social.linkedin && (
                  <li>
                    <Link href={brandProfile.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
                      <Linkedin className="h-3 w-3" />
                      LinkedIn
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Legal & Policies */}
            <div>
              <h4 className="font-heading text-sm font-bold uppercase tracking-wider mb-4 text-foreground">Legal & Info</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="/terms-conditions" className="hover:text-primary transition-colors">Terms & Conditions</Link>
                </li>
                <li>
                  <Link href="/refund-return" className="hover:text-primary transition-colors">Refund & Return</Link>
                </li>
                <li>
                  <Link href="/europe-delivery" className="hover:text-primary transition-colors">Europe Delivery</Link>
                </li>
                <li>
                  <Link href="/delivery-information" className="hover:text-primary transition-colors">Stockholm Delivery</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/10 pt-6 mt-10 flex flex-col sm:flex-row items-center sm:justify-between gap-2 text-[10px] text-muted-foreground/60 uppercase tracking-widest font-medium">
          <p>© {new Date().getFullYear()} Ideal Indiska Livs Stockholm. All Rights Reserved.</p>
          <p className="flex items-center gap-1">
            Crafted with ☕ & a cup of chai by <a href="https://fourlines.agency" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Fourlines Agency</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
