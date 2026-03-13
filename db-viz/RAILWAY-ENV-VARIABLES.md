# Railway Environment Variables - Copy/Paste Reference

Below are the EXACT environment variables to add to your Railway "Next.js" service.

## ⚠️ IMPORTANT INSTRUCTIONS

1. Go to [railway.app](https://railway.app)
2. Click your "db-viz" project
3. Click the "Next.js" service (NOT the MySQL service)
4. Click the "Variables" tab
5. For each variable below: Click "Add Variable" and paste the name and value
6. After adding all variables, click "Save" and trigger a redeploy

---

## Copy-Paste Environment Variables

**These are your VALUES - replace them exactly as shown:**

### Firebase Public Config (Safe to expose)
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyBchWXd3CdQSsYueSmMTmiWnZVGPndQIh0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = database-visualiser.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = database-visualiser
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = database-visualiser.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 429260141783
NEXT_PUBLIC_FIREBASE_APP_ID = 1:429260141783:web:15e2f103a44e7e67606c92
```

### Firebase Admin Config (KEEP THESE SECRET! Never commit to GitHub)
```
FIREBASE_PROJECT_ID = database-visualiser
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@database-visualiser.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCzpMBtL9SEo4Z+\nGNMxWduDbGC7bst+1eIlXVkUvObYaa3vVXmGjKsG2oNMgUMCl5OgiYOEgd/vLhu9\nqVKJMen06TWxUcJUz0phbPOESkAsu9mVI5XzfBpmIOEFWXBnP+/WbUEE8oWr2YxW\ng7vbK9NvlOyqL1s1HLyjBHGRAfvOm4aZtDG6G1pJGHlPLawjg5KPTImzba/ryGeK\nWahK9BSGjgZ7JlNpK/5BjZvUX6ZULBerR8s3ac60BbBc0x/ZfeESegD+lGUUPp54\ndoY3fH9nPhLN3OuI1dfndLH2eLiEEoWJvPJyeI9m/AnfaZ+lZxjb8eMclU2F03Sm\naT8n9DxhAgMBAAECgf8tJsOWrebkT5WGLAco6ETcC2lksrxC7M8iRQwWwkPjMOye\nswUQZFq4JkPJ/tMw25gnSWjc7Sezngsq6FvuT7VV8Selob8OQeuYASJTpbXriGtv\nqLoPsKmR8cGc7pXp3ZASfPNSowIl50/2jrWwqJtD+FJjk/OArfBbqMpCgBUiIFkc\niZVEQRDrOOyRYrNzIv+trWeM07hORplzB/cUofS0uELdLA5lTczzoiPbjFmUleOp\nQKMZVMrYPn3vcrJrq4Nv+s8Fc/+ehVM0E32df4Ref/NK1YSTQGiddvzbx53i+hxt\nfbqWKg7tXbQ86kY7NT+fXle8tTGKRJGB5lC5NYECgYEA3oLIVvWy6Ra0wqJyLbQ8\nJzua0AWp6vc+TJEJUi0ddKG4/VcJWq6lfYQEJe63H78A4tBkM6j8RR9KELJaNwCl\neSOs54l++BeJbIJtR/IrKJWCEkgU8poW0pdMVzSAznxU23xXJlSTm7OobUEeZoCL\nhwiLSh/GSKCgK82z40N74OECgYEAzq5Q6JoJXznx8+9C8NqaDnC1f5S5HxCn0zV3\n9y38RsStYVUd6Sp7xnfsz1PwD7ThuOi/V/30nyLyuyzjD2pYmzpMTosLJtMan5mt\ndbUjDvxwAdjSjMBqyaqtemtdGD3TTqyiOLj9HhtSGEnFZJM16kdPXIPBviieJs2l\nR4JmS4ECgYASjgNYxQpTR5JxPIya5RGzD9RcDmzZ7B4k0l9dm+d951J+xbhA+JlS\nOyUBaMOagRn4z/nbGPdYaECL3eOJ/KLP1DrB4ARXedb61nF4c2hH7Re4oIwmotTO\nYNF74CPxlAqbduXpi1n3vOaJncmEMKnx67N5zeaB/er9XBzpEaKN4QKBgGV7O+jp\n8V4bgozG1zSR8YDToJqTOM5jDDRtlYj9wFgzK/qVo4kgPgQ2UEWArmfX5dk4FvOq\nk1kr/MkhAiBIlFcrqdoK9Z/Lmc/x0jTwitVJ5+lQQBmyRPzeXC2219AWU1HW/BQj\n6MzGl2mrl0uJ6Lgu6W3Al/m50eW1pcjV40qBAoGBANX+kUnaBNuEJ9/FthUwf+4h\nc4TrwqaSDoCQv1MxEnAPOxvLZbCe8ErJXYZ/5Ke+JXhzsUsMu62bjzg86CbCsoTE\nlEWqG9oi7n2HBRKpq82vzW0WJOIcjxB6I0EV9U4kzmFiIktRKvE3cut1SVI6mSQN\nVcLzVUZYE38OM9OPG4l7\n-----END PRIVATE KEY-----\n
```

### Custom Security Token (Create your own random string)
```
INIT_TOKEN = your-super-secret-init-token-change-this-12345
```

---

## Step-by-Step To Add to Railway

**Method 1: One by One (Recommended for first time)**

1. Open Railway dashboard → db-viz project → Next.js service → Variables
2. Click "Add Variable"
3. In the "Name" field, type: `NEXT_PUBLIC_FIREBASE_API_KEY`
4. In the "Value" field, paste: `AIzaSyBchWXd3CdQSsYueSmMTmiWnZVGPndQIh0`
5. Click checkmark ✓
6. Repeat for each variable above

**Method 2: Bulk Copy (Advanced)**

If Railway supports raw text input:
1. Click "Edit variables" option (if available)
2. Paste the raw format:
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBchWXd3CdQSsYueSmMTmiWnZVGPndQIh0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=database-visualiser.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=database-visualiser
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=database-visualiser.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=429260141783
NEXT_PUBLIC_FIREBASE_APP_ID=1:429260141783:web:15e2f103a44e7e67606c92
FIREBASE_PROJECT_ID=database-visualiser
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@database-visualiser.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEuwIBADANBgkqhkiG9w0BAQEFAASCBKUwggShAgEAAoIBAQCzpMBtL9SEo4Z+\nGNMxWduDbGC7bst+1eIlXVkUvObYaa3vVXmGjKsG2oNMgUMCl5OgiYOEgd/vLhu9\nqVKJMen06TWxUcJUz0phbPOESkAsu9mVI5XzfBpmIOEFWXBnP+/WbUEE8oWr2YxW\ng7vbK9NvlOyqL1s1HLyjBHGRAfvOm4aZtDG6G1pJGHlPLawjg5KPTImzba/ryGeK\nWahK9BSGjgZ7JlNpK/5BjZvUX6ZULBerR8s3ac60BbBc0x/ZfeESegD+lGUUPp54\ndoY3fH9nPhLN3OuI1dfndLH2eLiEEoWJvPJyeI9m/AnfaZ+lZxjb8eMclU2F03Sm\naT8n9DxhAgMBAAECgf8tJsOWrebkT5WGLAco6ETcC2lksrxC7M8iRQwWwkPjMOye\nswUQZFq4JkPJ/tMw25gnSWjc7Sezngsq6FvuT7VV8Selob8OQeuYASJTpbXriGtv\nqLoPsKmR8cGc7pXp3ZASfPNSowIl50/2jrWwqJtD+FJjk/OArfBbqMpCgBUiIFkc\niZVEQRDrOOyRYrNzIv+trWeM07hORplzB/cUofS0uELdLA5lTczzoiPbjFmUleOp\nQKMZVMrYPn3vcrJrq4Nv+s8Fc/+ehVM0E32df4Ref/NK1YSTQGiddvzbx53i+hxt\nfbqWKg7tXbQ86kY7NT+fXle8tTGKRJGB5lC5NYECgYEA3oLIVvWy6Ra0wqJyLbQ8\nJzua0AWp6vc+TJEJUi0ddKG4/VcJWq6lfYQEJe63H78A4tBkM6j8RR9KELJaNwCl\neSOs54l++BeJbIJtR/IrKJWCEkgU8poW0pdMVzSAznxU23xXJlSTm7OobUEeZoCL\nhwiLSh/GSKCgK82z40N74OECgYEAzq5Q6JoJXznx8+9C8NqaDnC1f5S5HxCn0zV3\n9y38RsStYVUd6Sp7xnfsz1PwD7ThuOi/V/30nyLyuyzjD2pYmzpMTosLJtMan5mt\ndbUjDvxwAdjSjMBqyaqtemtdGD3TTqyiOLj9HhtSGEnFZJM16kdPXIPBviieJs2l\nR4JmS4ECgYASjgNYxQpTR5JxPIya5RGzD9RcDmzZ7B4k0l9dm+d951J+xbhA+JlS\nOyUBaMOagRn4z/nbGPdYaECL3eOJ/KLP1DrB4ARXedb61nF4c2hH7Re4oIwmotTO\nYNF74CPxlAqbduXpi1n3vOaJncmEMKnx67N5zeaB/er9XBzpEaKN4QKBgGV7O+jp\n8V4bgozG1zSR8YDToJqTOM5jDDRtlYj9wFgzK/qVo4kgPgQ2UEWArmfX5dk4FvOq\nk1kr/MkhAiBIlFcrqdoK9Z/Lmc/x0jTwitVJ5+lQQBmyRPzeXC2219AWU1HW/BQj\n6MzGl2mrl0uJ6Lgu6W3Al/m50eW1pcjV40qBAoGBANX+kUnaBNuEJ9/FthUwf+4h\nc4TrwqaSDoCQv1MxEnAPOxvLZbCe8ErJXYZ/5Ke+JXhzsUsMu62bjzg86CbCsoTE\nlEWqG9oi7n2HBRKpq82vzW0WJOIcjxB6I0EV9U4kzmFiIktRKvE3cut1SVI6mSQN\nVcLzVUZYE38OM9OPG4l7\n-----END PRIVATE KEY-----\n
INIT_TOKEN=your-super-secret-init-token-change-this-12345
```

---

## After Adding Variables

1. Click "Save" or "Update Variables"
2. Railway will show a notification to redeploy
3. Click "Trigger Deploy" to redeploy with new variables
4. Wait for build to complete (green status)
5. Your app is now live!

---

## Quick Test After Deployment

```bash
# Get your Railway URL from the deployment
RAILWAY_URL="https://your-railway-app.up.railway.app"

# Test that the app loads
curl "$RAILWAY_URL"

# Test database initialization
curl -X POST "$RAILWAY_URL/api/init-db" \
  -H "x-init-token: your-super-secret-init-token-change-this-12345" \
  -H "Content-Type: application/json"
```

---

## Security Notes

⚠️ **NEVER:**
- Share your FIREBASE_PRIVATE_KEY
- Commit `.env.local` to GitHub
- Use the same INIT_TOKEN for multiple projects
- Store unencrypted credentials in files

✅ **DO:**
- Use Railway's Variables tab for secrets (stored securely)
- Keep FIREBASE_PRIVATE_KEY in environment variables only
- Change INIT_TOKEN to a random string unique to your project
- Rotate INIT_TOKEN periodically

---

**All set! Your Railway deployment is ready to go!**
