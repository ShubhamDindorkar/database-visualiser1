# Performance Optimization Quick Start Guide

## Overview

Your DB Visualiser app now features enterprise-grade caching and performance optimizations. This guide helps you understand and use the new performance tools.

---

## 📦 What's Been Optimized

### 1. **Caching Architecture** (3-layer strategy)
   - **Webpack**: Intelligent bundle splitting (vendor, firebase, reactflow, common chunks)
   - **Vercel CDN**: Global edge network with region-specific caching
   - **Middleware**: Edge-level cache headers before app execution

### 2. **Responsive Design**
   - Mobile-first approach for screens ≤ 640px
   - Tablet optimization for 640px - 1024px
   - Touch-friendly buttons/inputs (44×44px minimum)

### 3. **Performance Monitoring**
   - Real-time Web Vitals tracking (LCP, FID, INP, CLS, FCP, TTFB)
   - Cache performance analysis
   - Automatic reporting in development mode

---

## 🚀 Using the New Utilities

### Cache Headers in API Routes

**For user-specific/dynamic data** (use `setNoCacheHeaders`):

```typescript
import { setNoCacheHeaders } from '@/lib/cache-headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Your logic here
  const data = { /* ... */ };
  
  const response = NextResponse.json(data);
  return setNoCacheHeaders(response);
}
```

**For cacheable API responses** (use `setCacheHeaders`):

```typescript
import { setCacheHeaders } from '@/lib/cache-headers';

export async function GET(request: Request) {
  const data = { /* ... */ };
  
  const response = NextResponse.json(data);
  // Cache for 60s in browser, 120s in CDN, allow stale for 5min
  return setCacheHeaders(response, 60, 120, 300);
}
```

**For static assets** (use `setImmutableCacheHeaders`):

```typescript
import { setImmutableCacheHeaders } from '@/lib/cache-headers';

export async function GET(request: Request) {
  const asset = { /* ... */ };
  
  const response = NextResponse.json(asset);
  return setImmutableCacheHeaders(response); // 1-year cache, immutable
}
```

### Page Revalidation Configuration

**For mostly-static pages with periodic updates** (use ISR):

```typescript
// src/app/pricing/page.tsx
export const revalidate = 86400; // Revalidate every 24 hours

export default function PricingPage() {
  // This page is generated once, cached, then revalidated daily
}
```

**For always-fresh user-specific content**:

```typescript
// src/app/dashboard/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  // This page is always generated fresh, never cached
}
```

### Lazy Loading Components

**Dynamic imports for heavy components**:

```typescript
// Instead of:
// import { CreateTableModal } from '@/components/database/CreateTableModal';

// Use:
import { CreateTableModal } from '@/lib/dynamic-imports';

// The component will load only when used
export function MyPage() {
  return <CreateTableModal />;
}
```

Available dynamic imports in [`src/lib/dynamic-imports.ts`](src/lib/dynamic-imports.ts):
- CreateDatabaseModal
- CreateTableModal
- EditTableModal
- InsertDataModal
- UpdateDataModal
- DeleteDataModal
- SelectDataModal
- DropModal
- CreateChoiceModal
- ForeignKeyModal
- ExportModal
- QueryResultsPanel
- SQLChatbot

### Cache Configuration Reference

View the page and API caching strategy in [`src/lib/cache-config.ts`](src/lib/cache-config.ts):

```typescript
import { PAGE_CACHE_CONFIG, API_CACHE_CONFIG } from '@/lib/cache-config';

// Check how a specific page is cached
console.log(PAGE_CACHE_CONFIG.dashboard);
// Output: { revalidate: 0, dynamic: 'force-dynamic', description: '...' }

// Check API caching strategy
console.log(API_CACHE_CONFIG.dynamicRoutes);
```

### Web Vitals Monitoring

**Automatic tracking enabled** in [`src/components/WebVitalsMonitor.tsx`](src/components/WebVitalsMonitor.tsx).

**Manually log cache performance**:

```typescript
import { logCacheReport } from '@/lib/performance-monitoring';

// Log cache effectiveness to console
logCacheReport();
```

**Custom Web Vitals integration**:

```typescript
import { initializeWebVitalsTracking } from '@/lib/performance-monitoring';

useEffect(() => {
  initializeWebVitalsTracking();
  // Metrics logged automatically
}, []);
```

---

## 📊 Monitoring Performance

### In Development

```bash
npm run dev
# Open browser console (F12)
# You'll see:
# 📊 Cache Performance Report
# Cached Resources: 45
# Network Requests: 12
# Cache Hit Rate: 78.9%
# ...
```

### In Production (Vercel)

1. **Vercel Analytics Dashboard**:
   - Go to Vercel → Select Project → Analytics
   - Monitor: Cache Hit Ratio (target > 70%)
   - Monitor: Response Times
   - Monitor: Web Core Vitals

2. **Browser DevTools**:
   ```
   F12 → Network tab
   - Check "Cache-Control" header for each resource
   - Look for "from cache" in Size column
   ```

3. **Manual Testing**:
   ```bash
   # Check if resource is cached (should be 304 or from cache)
   curl -I https://yourdomain.com/api/database/list
   
   # Check cache headers
   curl -i https://yourdomain.com/_next/static/chunk.js | grep Cache-Control
   # Should show: max-age=31536000, immutable
   ```

---

## 🎯 Performance Targets

| Metric | Target | Your Goal |
|--------|--------|-----------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ < 2.0s |
| **FID** (First Input Delay) | < 100ms | ✅ < 50ms |
| **INP** (Interaction to Next Paint) | < 200ms | ✅ < 150ms |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ < 0.05 |
| **Cache Hit Ratio** | > 70% | ✅ > 80% |

---

## 🔍 Troubleshooting

### Cache Not Working?

1. **Check middleware is applied**:
   ```bash
   curl -i https://yourdomain.com/api/database/list
   # Should show Cache-Control headers
   ```

2. **Check page revalidation**:
   - Edit a landing page → wait 24h for ISR
   - Or manually trigger revalidation via Vercel webhook

3. **Browser forcing refresh?**:
   ```
   Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   Then normal refresh should use cache
   ```

### Slow API Responses?

1. **Check if API is marked no-cache**:
   ```typescript
   import { setNoCacheHeaders } from '@/lib/cache-headers';
   
   // Ensure all returns use setNoCacheHeaders
   return setNoCacheHeaders(response);
   ```

2. **Consider cacheable endpoints**:
   ```typescript
   // If data doesn't change per-user:
   return setCacheHeaders(response, 600, 1200, 900); // 10m cache
   ```

### Images Loading slowly?

They're configured for 1-year caching with WebP/AVIF formats. Ensure:
```typescript
// In next.config.ts
images: {
  formats: ['image/avif', 'image/webp'], // ✅ Configured
}
```

---

## 📚 Additional Resources

- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Vercel Cache Configuration](https://vercel.com/docs/infrastructure/routing/caching)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Performance Budgets](https://web.dev/performance-budgets-101/)

---

## 🚀 Next Steps

1. **Deploy to Vercel** and monitor cache hit ratio
2. **Integrate dynamic imports** in dashboard if bundle size needs reduction
3. **Add service worker** for offline support (future enhancement)
4. **Monitor Web Vitals** weekly for trends

---

## 📝 File Reference

| File | Purpose |
|------|---------|
| `next.config.ts` | Webpack bundle splitting, SWC minification |
| `vercel.json` | CDN cache headers for all routes |
| `src/middleware.ts` | Edge-level cache control |
| `src/lib/cache-headers.ts` | Helper functions for cache control |
| `src/lib/cache-config.ts` | Documentation of caching strategy |
| `src/lib/performance-monitoring.ts` | Web Vitals tracking and analysis |
| `src/lib/dynamic-imports.ts` | Lazy-loaded components |
| `src/components/WebVitalsMonitor.tsx` | Client-side monitoring setup |
| `CACHING-STRATEGY.md` | Comprehensive caching documentation |

---

**Last Updated**: After caching implementation  
**Status**: ✅ Production Ready
