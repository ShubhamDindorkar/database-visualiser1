# Railway Deployment Guide - Complete Setup Instructions

## Overview
You have generated all the necessary code files for:
1. ✅ Cloud MySQL connection with connection pooling
2. ✅ Firebase authentication with backend token verification  
3. ✅ Authenticated API client for frontend
4. ✅ Database initialization script

This guide walks you through the final Railway setup steps.

---

## Step-by-Step Railway Setup

### Step 1: Commit Your Code Changes
```bash
cd "/Users/veer/Documents/Coding projects and files/dbms_project/database-visualiser/db-viz"
git add .
git commit -m "Setup Railway deployment with cloud MySQL and Firebase auth"
git push origin main
```

### Step 2: Railway Project Configuration

**Your Railway MySQL Credentials (Already Provided):**
```
MYSQLHOST: mysql.railway.internal
MYSQLPORT: 3306
MYSQLUSER: root
MYSQLPASSWORD: EoWgKLKjhqSsZOHkogSdDMWFRwSarUXX
MYSQLDATABASE: railway
```

### Step 3: Add Environment Variables to Railway

**In Railway Dashboard:**
1. Go to [railway.app](https://railway.app)
2. Click your "db-viz" project
3. Click the "Next.js" service (not MySQL)
4. Go to "Variables" tab
5. Add ALL these variables:

#### Firebase Public Configuration (from your credentials):
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBchWXd3CdQSsYueSmMTmiWnZVGPndQIh0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=database-visualiser.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=database-visualiser
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=database-visualiser.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=429260141783
NEXT_PUBLIC_FIREBASE_APP_ID=1:429260141783:web:15e2f103a44e7e67606c92
```

#### Firebase Admin Configuration (KEEP THESE SECRET):
```
FIREBASE_PROJECT_ID=database-visualiser
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@database-visualiser.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCzpMBtL9SEo4Z+\nGNMxWduDbGC7bst+1eIlXVkUvObYaa3vVXmGjKsG2oNMgUMCl5OgiYOEgd/vLhu9\nqVKJMen06TWxUcJUz0phbPOESkAsu9mVI5XzfBpmIOEFWXBnP+/WbUEE8oWr2YxW\ng7vbK9NvlOyqL1s1HLyjBHGRAfvOm4aZtDG6G1pJGHlPLawjg5KPTImzba/ryGeK\nWahK9BSGjgZ7JlNpK/5BjZvUX6ZULBerR8s3ac60BbBc0x/ZfeESegD+lGUUPp54\ndoY3fH9nPhLN3OuI1dfndLH2eLiEEoWJvPJyeI9m/AnfaZ+lZxjb8eMclU2F03Sm\naT8n9DxhAgMBAAECgf8tJsOWrebkT5WGLAco6ETcC2lksrxC7M8iRQwWwkPjMOye\nswUQZFq4JkPJ/tMw25gnSWjc7Sezngsq6FvuT7VV8Selob8OQeuYASJTpbXriGtv\nqLoPsKmR8cGc7pXp3ZASfPNSowIl50/2jrWwqJtD+FJjk/OArfBbqMpCgBUiIFkc\niZVEQRDrOOyRYrNzIv+trWeM07hORplzB/cUofS0uELdLA5lTczzoiPbjFmUleOp\nQKMZVMrYPn3vcrJrq4Nv+s8Fc/+ehVM0E32df4Ref/NK1YSTQGiddvzbx53i+hxt\nfbqWKg7tXbQ86kY7NT+fXle8tTGKRJGB5lC5NYECgYEA3oLIVvWy6Ra0wqJyLbQ8\nJzua0AWp6vc+TJEJUi0ddKG4/VcJWq6lfYQEJe63H78A4tBkM6j8RR9KELJaNwCl\neSOs54l++BeJbIJtR/IrKJWCEkgU8poW0pdMVzSAznxU23xXJlSTm7OobUEeZoCL\nhwiLSh/GSKCgK82z40N74OECgYEAzq5Q6JoJXznx8+9C8NqaDnC1f5S5HxCn0zV3\n9y38RsStYVUd6Sp7xnfsz1PwD7ThuOi/V/30nyLyuyzjD2pYmzpMTosLJtMan5mt\ndbUjDvxwAdjSjMBqyaqtemtdGD3TTqyiOLj9HhtSGEnFZJM16kdPXIPBviieJs2l\nR4JmS4ECgYASjgNYxQpTR5JxPIya5RGzD9RcDmzZ7B4k0l9dm+d951J+xbhA+JlS\nOyUBaMOagRn4z/nbGPdYaECL3eOJ/KLP1DrB4ARXedb61nF4c2hH7Re4oIwmotTO\nYNF74CPxlAqbduXpi1n3vOaJncmEMKnx67N5zeaB/er9XBzpEaKN4QKBgGV7O+jp\n8V4bgozG1zSR8YDToJqTOM5jDDRtlYj9wFgzK/qVo4kgPgQ2UEWArmfX5dk4FvOq\nk1kr/MkhAiBIlFcrqdoK9Z/Lmc/x0jTwitVJ5+lQQBmyRPzeXC2219AWU1HW/BQj\n6MzGl2mrl0uJ6Lgu6W3Al/m50eW1pcjV40qBAoGBANX+kUnaBNuEJ9/FthUwf+4h\nc4TrwqaSDoCQv1MxEnAPOxvLZbCe8ErJXYZ/5Ke+JXhzsUsMu62bjzg86CbCsoTE\nlEWqG9oi7n2HBRKpq82vzW0WJOIcjxB6I0EV9U4kzmFiIktRKvE3cut1SVI6mSQN\nVcLzVUZYE38OM9OPG4l7\n-----END PRIVATE KEY-----\n
```

#### Custom Initialization Token (Create Your Own):
```
INIT_TOKEN=your-super-secret-random-token-12345-change-this
```

**IMPORTANT:** 
- ✅ The FIREBASE_PRIVATE_KEY must have `\n` (literal backslash-n) NOT actual newlines
- ✅ Railway will use the automatically detected MySQL variables (MYSQLHOST, etc.)
- ✅ Keep INIT_TOKEN and FIREBASE_PRIVATE_KEY secret - don't share them

### Step 4: Trigger Railway Deployment

After adding environment variables:
1. In Railway dashboard, click your Next.js service
2. Scroll down to "Deployments"
3. Click "Trigger deploy" button
4. Wait for green "Build successful" status

### Step 5: Initialize the Database

Once deployment is successful:

**Open a terminal and run:**
```bash
# Replace YOUR_RAILWAY_URL with your actual Railway URL
# You can find it in Railway dashboard → Next.js service → Deployments → View URL

RAILWAY_URL="https://your-railway-app.up.railway.app"
INIT_TOKEN="your-super-secret-random-token-12345-change-this"

curl -X POST "$RAILWAY_URL/api/init-db" \
  -H "x-init-token: $INIT_TOKEN" \
  -H "Content-Type: application/json"
```

You should see:
```json
{
  "success": true,
  "message": "Database initialized successfully",
  "tables": [
    "db_viz_system.user_metadata",
    "db_viz_system.user_databases",
    "db_viz_system.query_history"
  ]
}
```

### Step 6: Test Your Deployment

1. Open your Railway app URL in browser
2. Click "Login with Google" / "Login with GitHub"
3. After login, try creating a new database
4. Create another user account and verify they see ONLY their databases

---

## Verification Checklist

After deployment, verify everything works:

- [ ] Application loads without errors
- [ ] Firebase login works (Google/GitHub)
- [ ] Can create new database
- [ ] Second user can't see first user's databases  
- [ ] Database names show correctly (without user_ prefix)
- [ ] Terminal mode queries work
- [ ] Can export/import data

---

## Important Notes About Multi-Tenancy

Your application is now properly isolated by user:

1. **Database Naming:** Each user's databases are prefixed with `user_{first8chars}_`
   - User A creates "test" → becomes `user_abc12345_test`
   - User B creates "test" → becomes `user_xyz98765_test`
   - Each user only sees their own databases

2. **Authentication:** Every API request is verified using Firebase ID tokens
   - No token = 401 Unauthorized
   - Invalid token = 401 Unauthorized
   - Only the requesting user's data is accessible

3. **System Database:** `db_viz_system` tracks user activity
   - user_metadata: User creation/login tracking
   - user_databases: Which databases each user owns
   - query_history: Audit log of queries executed

---

## Troubleshooting

### Issue: "Database connection refused"
**Solution:** Wait 1-2 minutes after deployment for Railway to initialize all services

### Issue: "Module not found: firebase-admin"
**Solution:** Run `npm install firebase-admin` locally and commit package-lock.json

### Issue: "All users see same databases"
**Solution:** Verify FIREBASE_PROJECT_ID and FIREBASE_PRIVATE_KEY are set correctly

### Issue: "Cannot read property 'uid' of null"
**Solution:** Ensure client is sending Firebase ID token in Authorization header

### Issue: Database initialization fails
**Solution:** Check that INIT_TOKEN header matches the one in environment variables

### Check Logs
In Railway dashboard → Next.js service → Logs to see real-time errors

---

## Next Steps (Optional)

1. **Add your custom domain:**
   - Railway project → Settings → Domain
   - Point your domain DNS to Railway's IP

2. **Enable auto-backups:**
   - Railway MySQL service → Settings
   - Configure backup retention

3. **Monitor database usage:**
   - Railway MySQL service → Logs
   - Check slow queries

4. **Add rate limiting:**
   - Prevent abuse of API endpoints

---

## File Changes Summary

Updated/Created:
- ✅ `src/lib/mysql.ts` - Added connection pooling, Railway support
- ✅ `src/lib/auth-helper.ts` - Firebase token verification (NEW)
- ✅ `src/lib/api-client.ts` - Authenticated API calls (NEW)
- ✅ `src/app/api/init-db/route.ts` - Database initialization (NEW)
- ✅ `package.json` - Added firebase-admin dependency

---

**Need help? Check the Railway docs:** https://docs.railway.app/
