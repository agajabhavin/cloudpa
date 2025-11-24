# 🔧 Fix: Change Source Directory to Root

## ❌ Current Error

```
copy failed: no source files specified
```

**Problem:** DigitalOcean is using `apps/api` as build context, but Dockerfile needs root files.

---

## ✅ Solution: Use Root-Level Dockerfiles

**I've created root-level Dockerfiles that work with root as build context:**

- ✅ `Dockerfile.web` - For web service
- ✅ `Dockerfile.api` - For API service and worker

**These are now in GitHub!**

---

## 📋 Step-by-Step: Fix in DigitalOcean

### For API Service:

1. **Go to:** App Dashboard → Components → Click **"api"** (or "cloudpa-api")
2. **Click "Edit"** button
3. **Find "Source" section** → Click **"Edit"**
4. **Change these settings:**
   - **Source Directory:** Change from `apps/api` to `/` (root) ← **KEY CHANGE!**
   - **Build strategy:** Dockerfile (should already be set)
   - **Dockerfile path:** Change from `apps/api/Dockerfile` to `Dockerfile.api` ← **NEW!**
5. **Click "Save"**

### For Web Service:

1. **Go to:** App Dashboard → Components → Click **"web"** (or "cloudpa-web")
2. **Click "Edit"** button
3. **Find "Source" section** → Click **"Edit"**
4. **Change these settings:**
   - **Source Directory:** Change from `apps/web` to `/` (root) ← **KEY CHANGE!**
   - **Build strategy:** Dockerfile
   - **Dockerfile path:** Change from `apps/web/Dockerfile` to `Dockerfile.web` ← **NEW!**
5. **Click "Save"**

### For Worker:

1. **Go to:** App Dashboard → Components → Click **"inbound-worker"**
2. **Click "Edit"** button
3. **Find "Source" section** → Click **"Edit"**
4. **Change these settings:**
   - **Source Directory:** Change from `apps/api` to `/` (root) ← **KEY CHANGE!**
   - **Build strategy:** Dockerfile
   - **Dockerfile path:** Change to `Dockerfile.api` ← **SAME AS API!**
5. **Find "Run Command"** section:
   - **Run command:** `cd apps/api && pnpm worker:inbound:prod`
6. **Click "Save"**

---

## ✅ What This Does

**Before (❌ Broken):**
- Source Directory: `apps/api`
- Build Context: `/.app_platform_workspace/apps/api`
- Dockerfile tries: `COPY ../../package.json` → **FAILS** (can't access outside context)

**After (✅ Fixed):**
- Source Directory: `/` (root)
- Build Context: `/.app_platform_workspace/` (root)
- Dockerfile can access: `package.json`, `pnpm-workspace.yaml`, `apps/api/`, `packages/shared/` → **WORKS!**

---

## 🎯 Summary of Changes

| Service | Source Directory | Dockerfile Path |
|---------|-----------------|-----------------|
| **API** | `/` (root) | `Dockerfile.api` |
| **Web** | `/` (root) | `Dockerfile.web` |
| **Worker** | `/` (root) | `Dockerfile.api` |

---

## 🚀 After Configuration

1. **Save all changes** for all three services
2. **DigitalOcean will auto-deploy** (or click "Actions" → "Force Rebuild")
3. **Build should succeed!** ✅

---

## 📝 Note

**The root-level Dockerfiles are:**
- ✅ Already committed to GitHub
- ✅ Ready to use
- ✅ Properly configured for monorepo structure

**Just update the Source Directory and Dockerfile path in DigitalOcean!** 🎉

