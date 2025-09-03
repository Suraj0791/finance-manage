# Project Structure and Flow

This document provides an overview of the finance management app's architecture and data flow.

## Core Components

### Authentication Layer (Clerk)

- **User Management**: Handles user registration, login, and profile management
- **Integration**: Integrated with the database through `checkUser.js` to sync user data

### Database Layer (Supabase PostgreSQL)

- **ORM**: Prisma is used for database operations
- **Models**: Users, Accounts, Transactions, Budgets
- **Connection Management**: Enhanced handling for Supabase free tier with retry logic

### Server Actions (Next.js)

- **Dashboard Actions**: Data retrieval for dashboard components
- **Transaction Actions**: Create, read, update, delete transaction operations
- **Budget Actions**: Budget management and tracking
- **Account Actions**: Account creation and management

### UI Components

- **Dashboard**: Shows financial overview with charts and summaries
- **Account Management**: Displays and manages user accounts
- **Transaction Management**: Lists, creates, and modifies transactions
- **Budget Tracking**: Shows budget progress and utilization

## Data Flow

1. **Authentication Flow**:

   - User logs in through Clerk
   - `checkUser.js` verifies and creates user record in database if needed
   - Authentication state maintained through Clerk session

2. **Dashboard Data Flow**:

   - User visits dashboard page
   - Server actions retrieve account and transaction data
   - Data displayed in dashboard components (charts, cards)

3. **Transaction Flow**:

   - User creates/edits transaction
   - Form data validated and submitted to server action
   - Transaction processed and saved to database
   - UI updated with new data

4. **Error Handling Flow**:
   - Database issues caught by custom error boundary
   - Connection errors handled with retry logic
   - User-friendly error messages displayed

## Database Health Management

The app includes special handling for Supabase free tier database:

1. **Connection Monitoring**:

   - Regular health checks through `/api/ping` endpoint
   - Database status displayed in UI when issues detected

2. **Auto-Recovery**:

   - Automatic retry logic in database operations
   - Exponential backoff for connection attempts

3. **User Experience**:
   - Graceful degradation when database is unavailable
   - Clear feedback on database status

## File Structure Highlights

- `/actions` - Server actions for data operations
- `/app` - Next.js app router structure
- `/app/(main)` - Authenticated routes
- `/app/(auth)` - Authentication routes
- `/components` - UI components
- `/lib` - Utility functions and database configuration
- `/prisma` - Database schema and migrations
