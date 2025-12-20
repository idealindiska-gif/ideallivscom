# SEO Migration Guide: ideallivs.com → www.ideallivs.com

## ✅ What We've Fixed (Already Done)

### 1. **301 Redirects Implemented**
- Created `middleware.ts` that automatically redirects ALL traffic from `ideallivs.com` → `www.ideallivs.com`
- Uses **301 Permanent Redirect** (critical for SEO - tells Google this is permanent)
- Preserves all URL paths, query parameters, and fragments

### 2. **Updated All Canonical URLs**
- `site.config.ts` - Updated to `https://www.ideallivs.com`
- `config/brand-profile.ts` - Updated website URL
- All metadata will now use www version

### 3. **Updated Schema.org Structured Data**
- All organization schemas now default to www domain
- Article, FAQ, Brand, Collection schemas updated
- Ensures Google sees consistent domain in structured data

### 4. **Updated Robots.txt**
- Sitemap URL now points to `https://www.ideallivs.com/sitemap.xml`

### 5. **Build Successful**
- ✅ No errors
- ✅ Middleware is active (34.5 kB)
- ✅ Ready to deploy

---

## 🚨 CRITICAL: What YOU Need to Do (Google Search Console)

### **Step 1: Add www Version to Search Console**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Enter: `https://www.ideallivs.com`
4. Verify ownership using one of these methods:
   - **DNS verification** (recommended - lasts forever)
   - HTML file upload
   - HTML meta tag (already verified if using same account)

### **Step 2: Submit New Sitemap**

1. In the NEW property (`www.ideallivs.com`), go to **Sitemaps**
2. Submit: `https://www.ideallivs.com/sitemap.xml`
3. Google will start crawling the www version

### **Step 3: Request URL Inspection (Optional but Recommended)**

1. In Search Console, use **URL Inspection** tool
2. Test key pages:
   - `https://www.ideallivs.com/`
   - `https://www.ideallivs.com/shop`
   - `https://www.ideallivs.com/blog`
3. Click "Request Indexing" for each page
4. This speeds up the migration process

### **Step 4: Monitor Both Properties for 3-6 Months**

Keep **BOTH** Search Console properties active:
- Old: `https://ideallivs.com` (will show declining traffic)
- New: `https://www.ideallivs.com` (will show increasing traffic)

This lets you monitor the migration and catch any issues.

---

## 📊 Expected SEO Impact & Timeline

### **Immediate (1-7 days)**
- ✅ 301 redirects preserve ~90-99% of link equity
- ✅ No duplicate content penalty (redirects handle it)
- ⚠️ Slight ranking fluctuations are NORMAL

### **Short Term (1-4 weeks)**
- Google recrawls and reindexes all pages
- Rankings may temporarily drop 5-15% (this is normal!)
- Search Console shows both old and new URLs

### **Long Term (1-3 months)**
- Rankings stabilize and often improve
- All old URLs are replaced with www versions in search results
- Full link equity transfers to new domain

### **What to Watch For:**
- ❌ If rankings drop >30% after 2 weeks → Check redirects are working
- ❌ If duplicate content appears → Verify canonical tags
- ✅ If old URLs still rank → This is normal, takes time to update

---

## 🔍 How to Verify Redirects Are Working

### Test 1: Manual Check
```bash
# Should redirect to www.ideallivs.com
curl -I https://ideallivs.com
# Look for: "Location: https://www.ideallivs.com"
# Status: 301
```

### Test 2: Online Tools
1. Use [Redirect Checker](https://httpstatus.io/)
2. Enter: `https://ideallivs.com`
3. Should show: **301 → https://www.ideallivs.com**

### Test 3: Google Chrome
1. Open DevTools (F12)
2. Go to Network tab
3. Visit `ideallivs.com`
4. First request should show "301" status

---

## 📈 Additional SEO Best Practices

### 1. **Update External Links (When Possible)**
Update your www URL on:
- ✅ Social media profiles (Facebook, Instagram, etc.)
- ✅ Google My Business listing
- ✅ Business directories
- ✅ Email signatures
- ✅ Marketing materials

**Note:** Old links will still work (301 redirects), but direct links are slightly better for SEO.

### 2. **Update Backlinks (Reach Out to High-Authority Sites)**
If you have backlinks from important sites, consider asking them to update:
- Industry directories
- News articles
- Partner websites
- Review sites

### 3. **Monitor Google Analytics**
- Traffic might dip 5-10% temporarily
- Use annotation to mark the migration date
- Filter by hostname to see www vs non-www traffic

---

## ⚠️ Common Migration Issues & Solutions

### Issue 1: "Rankings Dropped After Migration"
**Solution:** This is normal for 1-2 weeks. If it persists:
1. Check Search Console for crawl errors
2. Verify all redirects are 301 (not 302)
3. Ensure canonical tags point to www version

### Issue 2: "Both Versions Appearing in Search Results"
**Solution:** Takes time for Google to update. Speed it up:
1. Request indexing for www pages
2. Submit updated sitemap
3. Wait 2-4 weeks for Google to recrawl

### Issue 3: "Old Sitemap Still Showing in Search Console"
**Solution:**
1. Submit new sitemap to www property
2. Remove/mark old sitemap as outdated in non-www property
3. Google will eventually update

---

## 📋 Migration Checklist

**Before Deploying:**
- [x] 301 redirects configured (middleware.ts)
- [x] Site config updated to www
- [x] Canonical URLs updated
- [x] Schema.org data updated
- [x] Robots.txt updated
- [x] Build tested successfully

**After Deploying:**
- [ ] Add www.ideallivs.com to Google Search Console
- [ ] Verify ownership
- [ ] Submit sitemap to new property
- [ ] Test redirects are working
- [ ] Monitor rankings for 2-4 weeks
- [ ] Update social media links
- [ ] Update Google My Business

**Within 1 Month:**
- [ ] Check Search Console for errors
- [ ] Monitor traffic in both properties
- [ ] Request indexing for key pages

**Within 3 Months:**
- [ ] Verify all rankings transferred
- [ ] Old property shows declining data
- [ ] New property is primary

---

## 🎯 Summary

**The Good News:**
✅ All technical SEO issues are fixed
✅ 301 redirects will preserve your rankings
✅ Google will transfer link equity
✅ No duplicate content penalty

**What to Expect:**
⚠️ Temporary ranking fluctuations (1-4 weeks) are NORMAL
⚠️ Full migration takes 1-3 months
⚠️ Monitor both Search Console properties

**Your Action Items:**
1. Deploy these changes
2. Add www version to Search Console
3. Submit new sitemap
4. Monitor for 2-4 weeks
5. Update external links when possible

**Questions?**
If you see unusual drops in traffic or rankings after 2 weeks, check:
1. Are redirects working? (Use redirect checker)
2. Any crawl errors in Search Console?
3. Are canonical tags correct?

The migration is now technically perfect. The rest is just waiting for Google to recrawl and update their index! 🚀
