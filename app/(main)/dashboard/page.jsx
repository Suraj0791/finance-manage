import { Suspense } from "react";
import React from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { DatabaseStatus } from "@/components/database-status";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { DashboardFallback } from "./_components/dashboard-fallback";
import { DashboardSkeleton } from "@/components/ui/loading";
import { SandboxControls } from "@/components/sandbox-controls";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

// Separate components for better loading states
async function AccountsSection() {
  const accounts = await getUserAccounts().catch((err) => {
    console.error("Error fetching accounts:", err);
    return [];
  });

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <CreateAccountDrawer>
        <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
            <Plus className="h-10 w-10 mb-2" />
            <p className="text-sm font-medium">Add New Account</p>
          </CardContent>
        </Card>
      </CreateAccountDrawer>
      {accounts.length > 0 &&
        accounts?.map((account) => (
          <AccountCard key={account.id} account={account} />
        ))}
    </div>
  );
}

async function BudgetSection() {
  const accounts = await getUserAccounts().catch(() => []);
  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    try {
      budgetData = await getCurrentBudget(defaultAccount.id);
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  }

  return (
    <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
    />
  );
}

async function OverviewSection() {
  const [accounts = [], transactions = []] = await Promise.all([
    getUserAccounts().catch(() => []),
    getDashboardData().catch(() => []),
  ]);

  return (
    <DashboardOverview accounts={accounts} transactions={transactions || []} />
  );
}

export default async function DashboardPage() {
  // First verify the user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const accounts = await getUserAccounts().catch(() => []);
  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-8">
      {/* Recruiter Developer Sandbox Console */}
      <SandboxControls hasAccounts={hasAccounts} />

      {/* Onboarding Guide Badge explaining dashboard features */}
      <OnboardingGuide
        storageKey="dashboard_overview"
        title="Welcome to your Financial Dashboard!"
        description="This dashboard provides a real-time consolidation of your checking accounts, automated subscription renewals, monthly budget limits, and category-wise expense breakdowns. Choose 'Guided Demo Mode' to immediately see the interactive charts and analytics, or start fresh manually."
        steps={[
          "Configure checking accounts and budgets using the panels below.",
          "Manually record expenses or use the AI scanner to read paper receipts.",
          "Track category breakdown charts and automated subscription bills."
        ]}
      />

      {/* Database Status */}
      <Suspense fallback={<div>Checking database connection...</div>}>
        <DatabaseStatus />
      </Suspense>

      {/* Budget Progress */}
      <Suspense
        fallback={<div className="h-24 bg-gray-100 rounded animate-pulse" />}
      >
        <BudgetSection />
      </Suspense>

      {/* Dashboard Overview */}
      <Suspense
        fallback={<div className="h-40 bg-gray-100 rounded animate-pulse" />}
      >
        <OverviewSection />
      </Suspense>

      {/* Accounts Grid */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        }
      >
        <AccountsSection />
      </Suspense>
    </div>
  );
}
