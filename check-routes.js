const fs = require('fs');

const wpPages = [
  'move',
  'prepared-meals',
  'europe-delivery',
  'faq',
  'grocery-delivery-in-goteborg-and-malmo',
  'blog',
  'delivery-information',
  'special-offers',
  'shop-by-brand-top-indian-pakistani-grocery-brands-ideal-indiska-stockholm',
  'shop',
  'home',
  'about',
  'privacy-policy',
  'refund-return',
  'contact',
  'my-account',
  'checkout',
  'cart',
  'terms-conditions'
];

const nextJsRoutes = {
  'prepared-meals': 'app/(shop)/prepared-meals/page.tsx',
  'europe-delivery': 'app/europe-delivery/page.tsx',
  'faq': 'app/faq/page.tsx',
  'delivery-goteborg-malmo': 'app/delivery-goteborg-malmo/page.tsx',
  'blog': 'app/blog/page.tsx',
  'delivery-information': 'app/delivery-information/page.tsx',
  'deals': 'app/(shop)/deals/page.tsx',
  'brands': 'app/brands/page.tsx',
  'shop': 'app/(shop)/shop/page.tsx',
  'about': 'app/about/page.tsx',
  'privacy-policy': 'app/privacy-policy/page.tsx',
  'refund-return': 'app/refund-return/page.tsx',
  'contact': 'app/contact/page.tsx',
  'my-account': 'app/(shop)/my-account/page.tsx',
  'checkout': 'app/(shop)/checkout/page.tsx',
  'cart': 'app/(shop)/cart/page.tsx',
  'terms-conditions': 'app/terms-conditions/page.tsx'
};

console.log('\n=== WORDPRESS PAGES vs NEXT.JS ROUTES ===\n');

let usingCatchAll = [];
let hasNextRoute = [];

wpPages.forEach(slug => {
  const nextRoute = nextJsRoutes[slug] || nextJsRoutes[slug.replace(/-/g, '-')];
  
  if (nextRoute && fs.existsSync(nextRoute)) {
    console.log(`✅ /${slug}`);
    console.log(`   Has Next.js route: ${nextRoute}\n`);
    hasNextRoute.push(slug);
  } else {
    console.log(`⚠️  /${slug}`);
    console.log(`   Relies on [slug] catch-all\n`);
    usingCatchAll.push(slug);
  }
});

console.log('\n=== SUMMARY ===\n');
console.log(`Total WordPress pages: ${wpPages.length}`);
console.log(`Pages with Next.js routes: ${hasNextRoute.length}`);
console.log(`Pages using [slug] catch-all: ${usingCatchAll.length}\n`);

if (usingCatchAll.length > 0) {
  console.log('Pages that would break if [slug] is removed:');
  usingCatchAll.forEach(slug => console.log(`  - /${slug}`));
  console.log('');
}
