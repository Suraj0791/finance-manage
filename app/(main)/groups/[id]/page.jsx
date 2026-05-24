import { getGroupDetails, calculateGroupBalances } from "@/actions/groups";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { getGroupExpenses } from "@/actions/expenses";
import { auth } from "@/auth";
import { GroupHeader } from "../_components/group-header";
import { ExpenseOverview } from "../_components/expense-overview";
import { SettlementSuggestions } from "../_components/settlement-suggestions";
import { MemberStatus } from "../_components/member-status";
import { GroupExpenses } from "../_components/group-expenses";
import { AddExpenseDialog } from "../_components/add-expense-dialog";
import { ExportBalancesButton } from "../_components/export-balances-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Receipt,
  DollarSign,
  TrendingUp,
  Calculator,
} from "lucide-react";
import { notFound } from "next/navigation";

export default async function GroupPage({ params }) {
  const { id } = await params;
  const session = await auth();

  try {
    const [groupDetails, balances, expenses] = await Promise.all([
      getGroupDetails(id),
      calculateGroupBalances(id),
      getGroupExpenses(id),
    ]);

    if (!groupDetails) {
      notFound();
    }

    // Get current user info
    const { db } = await import("@/lib/prisma");
    const currentUser = await db.user.findUnique({
      where: { email: session?.user?.email },
      select: { id: true },
    });

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return (
      <div className="space-y-8">
        <OnboardingGuide
          storageKey="group_details"
          title="Testing the Splitwise Calculator!"
          description="This dashboard displays shared group bills and balances. Alice and Bob have been pre-seeded for you with demo expenses to show how the debt minimization calculations dynamically update when new receipts are logged."
          steps={[
            "View the 'Expense Overview' card to see who owes what.",
            "Click 'Add Expense' to add a bill (e.g. food or travel) and split it among members.",
            "Under 'Suggested Settlements', click 'Record Payment' to settle outstanding balances dynamically."
          ]}
        />
        {/* Group Header */}
        <GroupHeader group={groupDetails} currentUserId={currentUser?.id} />

        {/* KittySplit-style Expense Overview */}
        <ExpenseOverview
          groupDetails={groupDetails}
          balances={balances.balances || []}
          totalExpenses={totalExpenses}
          currentUserId={currentUser?.id}
        />

        {/* Settlement Suggestions - Most Important */}
        <SettlementSuggestions
          balances={balances.balances || []}
          groupId={id}
          currentUserId={currentUser?.id}
        />

        {/* Member Status */}
        <MemberStatus
          groupDetails={groupDetails}
          currentUserId={currentUser?.id}
        />

        {/* Quick Actions */}
        <div className="flex justify-center gap-4">
          <AddExpenseDialog
            groupId={id}
            members={groupDetails.members}
            anonymousMembers={groupDetails.anonymousMembers || []}
          />
          <ExportBalancesButton
            groupName={groupDetails.name}
            balances={balances.balances || []}
            settlements={balances.settlements || []}
          />
        </div>

        {/* Group Expenses - Collapsible or Secondary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              All Expenses ({expenses.length})
            </h2>
          </div>
          <GroupExpenses expenses={expenses} />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading group:", error);
    notFound();
  }
}
