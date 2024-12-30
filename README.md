# AI Finance App

This AI Finance app provides users with a smart way to manage their finances. It features an interactive dashboard, transaction analysis, receipt scanning, budgeting tools, AI insights, and more. The app integrates several advanced technologies to offer a seamless experience for personal financial management.

#LIVE LINK :
https://ai-finance-manage.vercel.app/

## Features

- **Dashboard**: Visualize transactions and financial data using bar graphs and pie charts.
- **Receipt Scanning**: Scan receipts using the AI Gemini API to automatically generate new transactions.
- **Recurring Transactions**: Option to set up recurring transactions.
- **Cron Jobs**: For transaction ingestion and data updates.
- **Monthly Budgeting**: Set and track monthly budgets with email notifications.
- **AI Insights**: Get AI-generated insights into your spending and budgeting patterns.
- **Email Notifications**: Send budget-related emails using the Resend service and React Email.
- **Rate Limiting**: Implemented using ArcJet for better API rate management.
- **Authentication**: User authentication and middleware with Clerk for secure access.
- **Multiple Accounts**: Support for managing multiple accounts and transactions.
- **Transaction Analysis**: Comprehensive analysis of user transactions, categorized for easy tracking.
- **Input Validation**: Zod and HookResolver are used for rigorous input validation to ensure data integrity.
  
## Technologies Used

- **Next.js**: React framework for building the user interface and handling server-side rendering.
- **AI Gemini API**: For receipt scanning and AI-powered transaction creation.
- **Clerk**: Authentication and middleware management.
- **Prisma**: ORM for interacting with the database.
- **Supabase**: PostgreSQL database and authentication service.
- **ShadCN**: UI components for building clean, modern interfaces.
- **Zod**: Input validation schema for ensuring data correctness.
- **HookResolver**: Used in combination with Zod for resolving validation and form handling.
- **ArcJet**: Rate limiting to prevent excessive API calls.

## Installation

To set up this project locally, follow the steps below:

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ai-finance-app.git
    cd ai-finance-app
    ```

2. Install dependencies:

    ```bash
    npm install --legacy-peer-deps 
    //as new version of next is having some issues in npm i
    ```

3. Set up environment variables:

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

## Deployment

To deploy this app on Vercel, follow these steps:

1. Create a Vercel account and link your GitHub repository.
2. Set the environment variables in Vercel as per the `.env.local` configuration.
3. Deploy the application and access it using the provided Vercel URL.

## Database Schema

The app uses Prisma for database management. Below is the Prisma schema for the database:



## Badges

Add badges from somewhere like: [shields.io](https://shields.io/)

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![GPLv3 License](https://img.shields.io/badge/License-GPL%20v3-yellow.svg)](https://opensource.org/licenses/)
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg)](http://www.gnu.org/licenses/agpl-3.0)

