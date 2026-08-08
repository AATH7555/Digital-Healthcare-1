#!/bin/bash

# Digital Healthcare Database Maintenance Script

echo "🗄️ Digital Healthcare - Database Management"
echo "================================================"

case "$1" in
  init)
    echo "Initializing database with sample data..."
    node scripts/initializeDatabase.js
    ;;
  
  backup)
    echo "Creating database backup..."
    mkdir -p backups
    mongoexport --db digital-healthcare --collection patients --out backups/patients_$(date +%Y%m%d_%H%M%S).json
    mongoexport --db digital-healthcare --collection doctors --out backups/doctors_$(date +%Y%m%d_%H%M%S).json
    mongoexport --db digital-healthcare --collection tablets --out backups/tablets_$(date +%Y%m%d_%H%M%S).json
    mongoexport --db digital-healthcare --collection vaccinations --out backups/vaccinations_$(date +%Y%m%d_%H%M%S).json
    mongoexport --db digital-healthcare --collection appointments --out backups/appointments_$(date +%Y%m%d_%H%M%S).json
    mongoexport --db digital-healthcare --collection healthalerts --out backups/alerts_$(date +%Y%m%d_%H%M%S).json
    echo "✅ Backup completed"
    ;;
  
  status)
    echo "Checking database status..."
    mongo --eval "db.adminCommand('ping')"
    ;;
  
  clear)
    echo "⚠️ Clearing all data from database..."
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
      node scripts/clearDatabase.js
      echo "✅ Database cleared"
    else
      echo "Cancelled"
    fi
    ;;
  
  *)
    echo "Usage: ./database.sh [command]"
    echo ""
    echo "Commands:"
    echo "  init    - Initialize database with sample data"
    echo "  backup  - Create database backup"
    echo "  status  - Check database status"
    echo "  clear   - Clear all database data"
    echo ""
    ;;
esac
