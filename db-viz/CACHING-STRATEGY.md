# Next.js Caching Configuration for DB Visualiser

## Overview
This file documents the caching strategies implemented for the DB Visualiser app on Vercel.

## 1. Next.js Configuration (`next.config.ts`)

### Image Optimization
- Format support: AVIF, WebP
- Cache TTL: 1 year (immutable)
- Optimizes images automatically

### Code Optimization
- SWC minification (faster than Terser)
- Webpack bundle splitting:
  - **Vendor chunk**: All node_modules (priority 10)
  - **Firebase chunk**: Firebase library (priority 15)
  - **ReactFlow chunk**: ReactFlow and React libraries (priority 14)
  - **Common chunk**: Shared across 2+ places (priority 5)
  - **Runtime chunk**: Webpack runtime (separate)

### Experimental Optimizations
- Package import optimization for:
  - @radix-ui/react-dialog
  - @radix-ui/react-popover
  - lucide-react
  - framer-motion

## 2. Vercel Configuration (`vercel.json`)

### Cache Headers by Route

#### Static Assets (1 year, immutable)
```
/_next/static/*
/static/*
/fonts/*
/*.png, *.svg, *.webp
```

#### API Routes (60s, Vercel cache 120s)
```
/api/*
Cache-Control: public, max-age=60, s-maxage=120
```

#### Landing Page (1 hour, Vercel cache 24 hours)
```
/
Cache-Control: public, max-age=3600, s-maxage=86400
```

## 3. Middleware (`src/middleware.ts`)

### Security & Caching Headers
- Adds Cache-Control headers intelligently
- Sets security headers (HSTS, X-Frame-Options, etc.)
- Routes matched:
  - Static assets: 1 year immutable
  - Images: 1 year immutable
  - Landing pages: 1 hour local, 24 hours CDN
  - API routes: 60s local, 120s CDN with stale-while-revalidate

## 4. Page Configuration

### Dynamic Pages
```typescript
// Dashboard - always fresh (no caching)
export const revalidate = 0;
export const dynamic = 'force-dynamic';
```

### Static Pages (ISR)
```typescript
// Landing page - revalidate every 24 hours
export const revalidate = 86400;
```

## 5. API Route Caching

### User-Specific Routes
All user-specific API routes use `setNoCacheHeaders()`:
- `/api/query/execute` - SQL queries
- `/api/database/list` - User databases
- `/api/table/describe` - Table structure
- `/api/database/create` - Create database
- `/api/database/drop` - Drop database
- `/api/table/create` - Create table
- `/api/chat/openrouter` - AI chat

Headers applied:
```
Cache-Control: private, no-cache, no-store, must-revalidate
Pragma: no-cache
Expires: 0
```

## 6. Performance Impact

### Bundle Size Optimization
- Vendor code: Cached separately (decreases main bundle)
- Firebase: Separate chunk (large library, rarely changes)
- ReactFlow: Separate chunk (large library, rarely changes)
- Tree-shaking: Enabled for all dependencies

### Network Optimization
- Static assets: Cached forever (38+ year TTL)
- API responses: Cached at CDN for 120s
- Stale-while-revalidate: Serves cached while updating

### Vercel Benefits
- Edge Network: Serves cached content from edge locations (lower latency)
- Automatic compression: Gzip/Brotli
- Automatic image optimization: WebP/AVIF conversion

## 7. Monitoring & Validation

### Check Cache Headers
```bash
# Check landing page cache
curl -I https://yourdomain.com/

# Check asset cache
curl -I https://yourdomain.com/_next/static/...

# Check API cache
curl -I https://yourdomain.com/api/database/list
```

### Expected Headers
- `Cache-Control`: Should include `public`, `max-age`, `s-maxage`
- `Age`: Shows how long cached (appears on subsequent requests)
- `X-Vercel-Cache`: Hit, Stale, Miss (Vercel CDN status)

## 8. Best Practices

1. **User-specific data**: Never cache (private databases)
2. **Static content**: Cache forever with immutable flag
3. **Public API responses**: Cache briefly (30-120s) with stale-while-revalidate
4. **Large libraries**: Bundle into separate chunks
5. **Security headers**: Always include HSTS, X-Frame-Options, etc.

## 9. Future Optimizations

1. **Dynamic imports**: Lazy load heavy components
   ```typescript
   const ModuleComponent = dynamic(() => import('./Module'), { 
     loading: () => <LoadingSpinner /> 
   });
   ```

2. **Image optimization**: Use Next.js Image component
   ```typescript
   import Image from 'next/image';
   <Image src={src} alt={alt} width={400} height={300} priority />
   ```

3. **Code splitting**: Implement route-based code splitting
4. **Service workers**: Add offline support for cached routes
5. **Preloading**: Preload critical resources in Link components

## 10. Cache Invalidation

On Vercel, caches are automatically invalidated when:
- You redeploy your app
- You commit changes to your repository (CI/CD)
- You manually trigger a revalidation via REST API

To manually revalidate:
```bash
curl -X POST \
  -H 'Authorization: Bearer YOUR_VERCEL_TOKEN' \
  https://api.vercel.com/v1/deployments/YOUR_DEPLOYMENT_ID/revalidate
```
