# 🚀 Quick Start Guide

## Running Without PostgreSQL (Easiest Way)

The application can run **without PostgreSQL** using SQLite as a fallback database. This is perfect for development and testing.

### Step 1: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 2: Run the Backend

```bash
python app.py
```

The app will:
- ✅ Use SQLite database automatically (no setup required)
- ✅ Work perfectly for domain analysis
- ✅ Save analysis history to `suspicious_domains.db` file
- ✅ Run without any database server

### Step 3: Start the Frontend

In a new terminal:

```bash
cd frontend
npm install
npm start
```

### Step 4: Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Running With PostgreSQL (Production)

If you want to use PostgreSQL for production:

### Step 1: Install PostgreSQL

**Windows:**
- Download from: https://www.postgresql.org/download/windows/
- Install and start the PostgreSQL service

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install postgresql

# macOS
brew install postgresql
brew services start postgresql
```

### Step 2: Create Database

```bash
# Create database
createdb suspicious_domains

# Or using psql
psql -U postgres
CREATE DATABASE suspicious_domains;
\q
```

### Step 3: Set Environment Variable

**Windows (PowerShell):**
```powershell
$env:DATABASE_URL="postgresql://username:password@localhost:5432/suspicious_domains"
```

**Linux/Mac:**
```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/suspicious_domains"
```

### Step 4: Run the Application

```bash
cd backend
python app.py
```

## Troubleshooting

### Database Connection Error

If you see a database connection error:
1. **Option 1**: Remove the `DATABASE_URL` environment variable - the app will use SQLite
2. **Option 2**: Make sure PostgreSQL is running:
   ```bash
   # Windows
   net start postgresql-x64-13
   
   # Linux
   sudo systemctl start postgresql
   
   # macOS
   brew services start postgresql
   ```

### Module Not Found Errors

If you see "ModuleNotFoundError":
```bash
pip install -r requirements.txt
```

### Port Already in Use

If port 5000 is already in use:
```bash
# Change the port in app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

## Features Available Without Database

Even without a database, the application provides:
- ✅ Domain analysis (DNS, SSL, IP, CDN detection)
- ✅ Suspicious score calculation
- ✅ Subdomain enumeration
- ✅ Geolocation mapping
- ✅ Network path analysis
- ✅ PDF report export

The only limitation is:
- ❌ Analysis history won't persist (returns empty list)
- ❌ Report retrieval won't work (must analyze first)

## Next Steps

1. Test the application with a domain: `example.com`
2. Check the API at: http://localhost:5000
3. View the frontend at: http://localhost:3000
4. Analyze your first suspicious domain!

---

**Happy Analyzing! 🔍**

