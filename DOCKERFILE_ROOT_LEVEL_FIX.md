# 🔧 Fix: Use Root-Level Dockerfiles

## ❌ Problem

DigitalOcean uses `apps/web` or `apps/api` as build context, but Dockerfiles need root files (`pnpm-workspace.yaml`, `package.json`).

**Error:** `copy failed: no source files specified`

---

## ✅ Solution: Root-Level Dockerfiles

**Created root-level Dockerfiles that work with root as build context:**

- `Dockerfile.web` - For web service
- `Dockerfile.api` - For API service and worker

---

## 📋 DigitalOcean Configuration

### For Web Service:

1. **Go to:** Component Settings → "web" → Source → Edit
2. **Update:**
   - **Source Directory:** `/` (root) ← **CHANGE FROM `apps/web`**
   - **Build strategy:** Dockerfile
   - **Dockerfile path:** `Dockerfile.web` ← **NEW**
3. **Save**

### For API Service:

1. **Go to:** Component Settings → "api" → Source → Edit
2. **Update:**
   - **Source Directory:** `/` (root) ← **CHANGE FROM `apps/api`**
   - **Build strategy:** Dockerfile
   - **Dockerfile path:** `Dockerfile.api` ← **NEW**
3. **Save**

### For Worker:

1. **Go to:** Component Settings → "inbound-worker" → Source → Edit
2. **Update:**
   - **Source Directory:** `/` (root) ← **CHANGE FROM `apps/api`**
   - **Build strategy:** Dockerfile
   - **Dockerfile path:** `Dockerfile.api` ← **SAME AS API**
3. **Run command:** `cd apps/api && pnpm worker:inbound:prod`
4. **Save**

---

## ✅ What This Does

**Root-level Dockerfiles:**
- ✅ Build context = root (can access all files)
- ✅ Can copy `pnpm-workspace.yaml` from root
- ✅ Can copy `package.json` from root
- ✅ Can access `apps/web`, `apps/api`, `packages/shared`
- ✅ Works perfectly for monorepos!

---

## 📋 Summary

**Before:**
- Source Directory: `apps/web` or `apps/api`
- Dockerfile path: `apps/web/Dockerfile` or `apps/api/Dockerfile`
- ❌ Build context = subdirectory (can't access root)

**After:**
- Source Directory: `/` (root)
- Dockerfile path: `Dockerfile.web` or `Dockerfile.api`
- ✅ Build context = root (can access everything)

---

## 🚀 Next Steps

1. **Update DigitalOcean settings** (see above)
2. **Save all changes**
3. **Trigger new deployment**
4. **Build should succeed!**

---

**The root-level Dockerfiles are now in GitHub and ready to use!** ✅

