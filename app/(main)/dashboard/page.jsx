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
import { currentUser } from "@clerk/nextjs/server";
import ProtectedRoute from "./protected-route";

export default async function DashboardPage() {
  // First verify the user is authenticated
  const user = await currentUser();
  if (!user) {
    return <ProtectedRoute />;
  }

  try {
    const [accounts = [], transactions = []] = await Promise.all([
      getUserAccounts().catch((err) => {
        console.error("Error fetching accounts:", err);
        return [];
      }),
      getDashboardData().catch((err) => {
        console.error("Error fetching transactions:", err);
        return [];
      }),
    ]);

    const defaultAccount = accounts?.find((account) => account.isDefault);

    // Get budget for default account
    let budgetData = null;
    if (defaultAccount) {
      try {
        budgetData = await getCurrentBudget(defaultAccount.id);
      } catch (error) {
        console.error("Error fetching budget:", error);
      }
    }

    return (
      <div className="space-y-8">
        {/* Database Status */}
        <DatabaseStatus />

        {/* Budget Progress */}
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses || 0}
        />

        {/* Dashboard Overview */}
        <DashboardOverview
          accounts={accounts}
          transactions={transactions || []}
        />

        {/* Accounts Grid */}
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
      </div>
    );
  } catch (error) {
    console.error("Error rendering dashboard:", error);
    return <DashboardFallback />;
  }
}
