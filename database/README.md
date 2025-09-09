# Database Setup

This folder contains the SQL files needed to set up the Colossus climbing app database.

## Files

### `setup.sql` 
**The main database setup file.** Contains:
- Complete table schema (users, sessions, climbs, etc.)
- All necessary triggers for auto-updating user totals
- Row Level Security policies
- Proper constraints and indexes
- Use this for new Supabase projects

### `migrations/001_anonymous_auth.sql`
**Optional migration for anonymous authentication.**
- Adds support for anonymous users
- Run this if you want to enable anonymous auth in the future
- Not required for basic functionality

## Usage

For a **new Supabase project:**
1. Copy and paste the contents of `setup.sql` into your Supabase SQL editor
2. Run it to create all tables, triggers, and policies

For **existing projects:**
- Your database is already set up and working
- These files are kept for reference and future deployments
