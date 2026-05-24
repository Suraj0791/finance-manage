# AI Finance Management App

A comprehensive financial management application built with Next.js, Neon Serverless PostgreSQL, Auth.js (NextAuth) authentication, and Prisma ORM. The application includes personal finance tracking, budgeting tools, transaction analysis, and database health monitoring for Neon Serverless autosuspend.

## Live Application

https://ai-finance-manage.vercel.app/

## Recent Updates (September 2025)

- Enhanced database connection handling for Supabase free tier
- Added robust error boundaries and recovery mechanisms
- Implemented database health monitoring system
- Improved client-side error handling

## � Features

### 💳 Personal Finance Management

- **Interactive Dashboard**: Visualize transactions and financial data using bar graphs and pie charts
- **AI Receipt Scanning**: Scan receipts using the AI Gemini API to automatically generate new transactions
- **Multiple Account Support**: Manage multiple bank accounts and credit cards in one place
- **Transaction Analysis**: Comprehensive categorized transaction tracking and analysis
- **Smart Budgeting**: Set monthly budgets with email notifications when limits are approached
- **AI Financial Insights**: Get AI-generated insights into spending patterns and budgeting recommendations
- **Recurring Transactions**: Set up automatic recurring transactions with background processing
- **Transaction Categories**: Organize expenses and income with smart categorization

### 👥 Splitwise Clone Features

- **Group Management**: Create and manage expense-sharing groups with friends and family
- **Email Invitations**: Secure invitation system to add new members via email
- **Flexible Expense Splitting**:
  - Equal splits among all members
  - Exact amount splits with custom values
  - Percentage-based distributions
  - Share-based splitting
- **Real-time Balance Calculations**: Automatic calculation of who owes what to whom
- **Settlement Tracking**: Record and track payments between group members
- **Group Categories**: Organize expenses by type (dining, travel, utilities, entertainment, etc.)
- **Member Role Management**: Admin and member permissions with different access levels
- **Group Analytics**: Visual insights into group spending patterns and member contributions

### 🔐 Authentication & Security

- **Clerk Integration**: Secure authentication with multiple sign-in providers
- **Protected Routes**: Middleware-based route protection for secure access
- **User Profile Management**: Complete user profile and account management
- **Email Verification**: Secure account verification and password reset

### 🤖 AI & Automation

- **Receipt OCR**: AI-powered receipt text extraction and transaction creation
- **Smart Categorization**: Automatic expense categorization using AI
- **Background Jobs**: Cron jobs for transaction processing using Inngest
- **Email Automation**: Automated budget alerts and group notifications using Resend
- **Database Health Monitoring**: Automatic Supabase free tier database wake-up functionality

### 🎨 User Experience

- **Responsive Design**: Mobile-first design optimized for all devices
- **Modern UI**: Clean interface built with ShadCN and Tailwind CSS
- **Real-time Updates**: Live data synchronization across all components
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Database Status Monitoring**: Real-time connection status with automatic recovery
- **Email Notifications**: Send budget-related emails using the Resend service and React Email.
- **Rate Limiting**: Implemented using ArcJet for better API rate management.
- **Authentication**: User authentication and middleware with Clerk for secure access.
- **Input Validation**: Zod and HookResolver are used for rigorous input validation to ensure data integrity.
- **Database Resilience**: Automatic handling of Supabase free tier database pausing with wake-up functionality

## 🛠️ Technologies Used

### Frontend

- **Next.js 15**: React framework with App Router and Server Components
- **React 19**: Latest React with concurrent features and modern hooks
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **ShadCN/UI**: High-quality, accessible React components
- **Radix UI**: Unstyled, accessible UI primitives
- **Lucide React**: Beautiful, customizable icon library
- **React Hook Form**: Performant forms with easy validation
- **Sonner**: Elegant toast notifications

### Backend & Database

- **Prisma**: Type-safe database ORM with automatic migrations
- **Neon Serverless**: Serverless PostgreSQL database host
- **Enhanced Connection Handling**: Custom retry logic for Neon Serverless autosuspend
- **Database Health Monitoring**: Automatic wake-up and status tracking

### Authentication & Security

- **Clerk**: Complete authentication solution with social providers
- **Middleware Protection**: Route-level security and user management
- **Zod Validation**: Runtime type checking and form validation
- **Input Sanitization**: Comprehensive data validation and security

### AI & External Services

- **Google Gemini AI**: Advanced receipt scanning and text extraction
- **Resend**: Reliable email delivery service
- **React Email**: Beautiful, responsive email templates
- **Inngest**: Background job processing and cron scheduling

### Development & Deployment

- **TypeScript Support**: Enhanced with JSDoc for better development experience
- **ESLint**: Code quality and consistency enforcement
- **GitHub Actions**: Automated database health checks and deployments
- **Vercel**: Optimized deployment platform with edge functions

## 📋 Installation & Setup

### Prerequisites

- Node.js 18+ installed on your machine
- A Neon account and project
- A Google/GitHub developer account for authentication
- Google AI API key for receipt scanning
- Resend account for email notifications

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/finance-manage.git
cd finance-manage
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="your_neon_connection_string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Google AI for Receipt Scanning
GEMINI_API_KEY="your_google_ai_api_key"

# Email Service
RESEND_API_KEY="your_resend_api_key"

# Inngest (for background jobs)
INNGEST_EVENT_KEY="your_inngest_event_key"
INNGEST_SIGNING_KEY="your_inngest_signing_key"

# Application URL (for production)
APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# (Optional) Seed the database
npm run seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Build for Production

```bash
npm run build
npm start
```

## 🔧 Configuration

### Neon Setup

1. Create a new Neon project
2. Copy the connection string from Settings > Connection Details
3. The app includes automatic database retry logic for serverless autosuspend (cold starts)

### Clerk Setup

1. Create a Clerk application
2. Configure sign-in/sign-up pages
3. Add social providers if desired
4. Copy the API keys to your environment variables

### Google AI Setup

1. Get an API key from Google AI Studio
2. Enable the Gemini API for your project
3. Add the API key to your environment variables

### Email Setup

1. Create a Resend account
2. Verify your sending domain
3. Copy the API key to your environment variables

4. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ai-finance-app.git
   cd ai-finance-app
   ```

5. Install dependencies:

   ```bash
   npm install --legacy-peer-deps
   //as new version of next is having some issues in npm i
   ```

6. Set up environment variables:

   Create a `.env.local` file in the root directory and add the following environment variables:

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=sign-up
DATABASE_URL=""
DIRECT_URL=""  
ARCJET_KEY=
RESEND_API_KEY=

GEMINI_API_KEY=

4. Run the application locally:

   ```bash
   npm run dev
   ```

5. Open the app in your browser at [http://localhost:3000](http://localhost:3000).

## 🗄️ Database Management & Neon Serverless Autosuspend

### Handling Database Cold Starts

This application includes robust handling for Neon Serverless autosuspend and cold starts:

- **Automatic Detection**: The app detects when the database is waking up from autosuspend
- **Wake-Up Retry**: Built-in database retry logic with progress logging during cold starts
- **Connection Retry Logic**: Automatic retry with exponential backoff for failed connection attempts
- **Health Monitoring**: Real-time database status monitoring on the dashboard

### Why Autosuspend Happens

- Neon Serverless free tier automatically suspends the database compute instance after 5 minutes of inactivity to conserve resources
- When a new request arrives, Neon automatically wakes up (cold start), which takes about 0.5 to 3 seconds
- The application automatically retries queries during this brief wake-up window to prevent UI errors

### Connection String Optimizations

```env
# Standard Neon connection string (ensure pooled connection or direct url is set accordingly)
DATABASE_URL="postgresql://user:pass@host/neondb?sslmode=require"
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Set all environment variables in Vercel dashboard
3. **Deploy**: Vercel will automatically build and deploy your application
4. **Update APP_URL**: Set your production URL in environment variables
5. **GitHub Actions**: The included workflow will keep your database active

### Manual Deployment Steps

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Post-Deployment Setup

1. Update `APP_URL` environment variable with your deployed URL
2. Add the deployed URL to GitHub Secrets as `APP_URL` for database ping workflow
3. Verify all environment variables are correctly set
4. Test the database wake-up functionality

## 🛠️ Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem**: `Prisma P1001: Can't reach database server`
**Solution**:

- This typically happens when Supabase free tier database is paused
- Use the built-in database wake-up feature in the app
- Wait 1-2 minutes for the database to fully wake up
- The app includes automatic retry logic

#### Receipt Scanning Not Working

**Problem**: Receipt scanning fails or returns empty results
**Solution**:

- Verify your `GEMINI_API_KEY` is correct
- Ensure the image is clear and well-lit
- Check that the receipt text is clearly visible
- Try uploading a different image format (JPG, PNG)

#### Email Notifications Not Sending

**Problem**: Budget alerts or group invitations not sending
**Solution**:

- Verify your `RESEND_API_KEY` is valid
- Check that your domain is verified in Resend
- Ensure email templates are properly configured
- Check Resend dashboard for delivery status

#### Authentication Issues

**Problem**: Sign-in/sign-up not working
**Solution**:

- Verify Clerk API keys are correct
- Check that redirect URLs match your environment
- Ensure Clerk webhook endpoints are properly configured
- Clear browser cache and cookies

### Database Management

#### Preventing Database Pausing

- The included GitHub Actions workflow pings the database every 6 days
- Manual health checks are available at `/api/health`
- Database status is monitored in real-time on the dashboard

#### Backup and Recovery

```bash
# Create a database backup (PostgreSQL)
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

### Performance Optimization

#### Database Performance

- Connection pooling is enabled by default
- Retry logic handles temporary connection issues
- Database queries are optimized with proper indexing

#### Client-Side Performance

- Server components reduce client-side JavaScript
- Images are optimized with Next.js Image component
- Components are lazy-loaded where appropriate

## 📚 API Documentation

### Health Check Endpoints

- `GET /api/health` - Check database connection status
- `POST /api/ping` - Wake up paused database

### Webhook Endpoints

- `POST /api/webhooks/clerk` - Clerk user management webhooks
- `POST /api/inngest` - Background job processing

### Internal APIs

- Transaction management endpoints
- Group and expense management APIs
- Budget tracking and alerts
- Settlement calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure all existing tests pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Clerk](https://clerk.dev/) for seamless authentication
- [Supabase](https://supabase.com/) for the excellent database platform
- [ShadCN/UI](https://ui.shadcn.com/) for beautiful UI components
- [Splitwise](https://splitwise.com/) for inspiration on expense sharing features

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with detailed information
4. Include error messages and steps to reproduce

---

**Built with ❤️ using Next.js, React, and modern web technologies**

## 📊 Database Schema

The app uses Prisma for database management with comprehensive schemas for both personal finance and group expense features:

### Core Models

- **User**: Clerk-based user management with group relationships
- **Account**: Multiple financial accounts per user
- **Transaction**: Personal transactions with AI receipt scanning
- **Budget**: Monthly budgeting with alerts

### Splitwise Clone Models

- **Group**: Expense-sharing groups with member management
- **GroupMember**: User membership in groups with roles
- **GroupExpense**: Shared expenses with multiple split types
- **ExpenseShare**: Individual shares of group expenses
- **Settlement**: Payment tracking between users
- **GroupInvitation**: Email-based group invitations

## 🔧 API Endpoints

### Personal Finance

- `GET /api/health` - Database health check
- `POST /api/ping` - Database wake-up ping
- `/dashboard` - Main dashboard with account overview
- `/transaction/create` - Add new transactions
- `/account/[id]` - Account details and transactions

### Splitwise Clone

- `/groups` - Group management dashboard
- `/groups/[id]` - Individual group details
- `/groups/[id]/expenses` - Group expense management
- `/groups/[id]/balances` - Group balance calculations
- `/groups/[id]/settle` - Settlement between members

## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)
