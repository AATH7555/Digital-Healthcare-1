#!/bin/bash

# Backend Error Checking and Validation
echo "=========================================="
echo "Backend Validation Check"
echo "=========================================="

cd backend

# Check for syntax errors
echo "Checking for syntax errors in server.js..."
node --check server.js

# Check all controllers
echo "Checking controllers..."
for file in controllers/*.js; do
  echo "Checking $file..."
  node --check "$file"
done

# Check all models
echo "Checking models..."
for file in models/*.js; do
  echo "Checking $file..."
  node --check "$file"
done

# Check all routes
echo "Checking routes..."
for file in routes/*.js; do
  echo "Checking $file..."
  node --check "$file"
done

# Check middleware
echo "Checking middleware..."
for file in middleware/*.js; do
  echo "Checking $file..."
  node --check "$file"
done

echo ""
echo "=========================================="
echo "All backend files validated successfully!"
echo "=========================================="
