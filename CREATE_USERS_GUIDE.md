# Cloud PA
Create Cloud PA Database Users
mai

This guide creates:
- **cloudpaadmin**: Superuser with postgres/root level access
- **cloudpadb**: Database name (not a user)

## Quick Setup (Automated)

### Option 1: Run PowerShell Script
```powershell
.\create-users.ps1
```

### Option 2: Run SQL File
```powershell
# Connect to PostgreSQL
psql -U postgres

# Then run:
\i create-users.sql
```

## Manual Setup (Step-by-Step)

### Step 1: Connect to PostgreSQL

```powershell
# Try with password
$env:PGPASSWORD="Umlup01cli#@Ynkyo01xku#@6969"
psql -U postgres

# OR try without password
psql -U postgres
```

### Step 2: Create Users (in psql prompt)

Copy and paste these commands:

```sql
-- Create admin user with SUPERUSER privileges (postgres/root level)
CREATE USER cloudpaadmin WITH 
    SUPERUSER
    CREATEDB
    CREATEROLE
    LOGIN
    PASSWORD 'Umlup01cli#@Ynkyo01xku#@6969';

-- Create the database (named cloudpadb)
CREATE DATABASE cloudpadb OWNER cloudpaadmin;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE cloudpadb TO cloudpaadmin;

-- Connect to cloudpadb database
\c cloudpadb

-- Grant schema privileges
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO cloudpaadmin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO cloudpaadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO cloudpaadmin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO cloudpaadmin;

-- Verify
\du
\l cloudpa
```

### Step 3: Verify Users

```sql
-- List all users
\du

-- You should see:
-- cloudpaadmin | Superuser, Create role, Create DB
```

## Update Environment File

After creating users, update `apps/api/.env`:

### Option 1: Using cloudpaadmin (recommended)
```env
DATABASE_URL="postgresql://cloudpaadmin:Umlup01cli%23%40Ynkyo01xku%23%406969@localhost:5432/cloudpadb"
```

### Option 2: Using postgres
```env
DATABASE_URL="postgresql://postgres:Umlup01cli%23%40Ynkyo01xku%23%406969@localhost:5432/cloudpadb"
```

### Option 3: If trust auth works (no password)
```env
DATABASE_URL="postgresql://cloudpaadmin@localhost:5432/cloudpadb"
```

## User Permissions Summary

### cloudpaadmin (Superuser)
- ✅ SUPERUSER - Full postgres/root level access
- ✅ CREATEDB - Can create databases
- ✅ CREATEROLE - Can create roles/users
- ✅ LOGIN - Can connect
- Use for: Admin tasks, migrations, maintenance

### cloudpadb (Database)
- ✅ Database name: cloudpadb
- ✅ Owner: cloudpaadmin
- ✅ All privileges granted to cloudpaadmin

## After Creating Users

1. **Update environment file** (see above)
2. **Run migration:**
   ```powershell
   cd apps/api
   pnpm prisma migrate dev --name init
   ```
3. **Start servers:**
   ```powershell
   pnpm dev
   ```

## Troubleshooting

### "Permission denied"
- Make sure you're connected as postgres superuser
- Verify: `SELECT current_user;` should return "postgres"

### "User already exists"
```sql
-- Drop and recreate (CAREFUL - deletes user!)
DROP USER IF EXISTS cloudpaadmin;
DROP USER IF EXISTS cloudpadb;
-- Then run create commands again
```

### "Database already exists"
```sql
-- Drop and recreate
DROP DATABASE IF EXISTS cloudpadb;
-- Then create again
```

## Quick Commands Reference

```powershell
# Connect as postgres
psql -U postgres

# List users
\du

# List databases
\l

# Connect to cloudpadb database
\c cloudpadb

# Exit psql
\q
```

