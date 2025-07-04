import { getGroupDetails, calculateGroupBalances } from "@/actions/groups";
import { getGroupExpenses } from "@/actions/expenses";
import { GroupHeader } from "../_components/group-header";
import { GroupBalances } from "../_components/group-balances";
import { GroupExpenses } from "../_components/group-expenses";
import { AddExpenseDialog } from "../_components/add-expense-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Receipt, DollarSign, TrendingUp } from "lucide-react";
import { notFound } from "next/navigation";

export default async function GroupPage({ params }) {
  const { id } = await params;

  try {
    const [groupDetails, balances, expenses] = await Promise.all([
      getGroupDetails(id),
      calculateGroupBalances(id),
      getGroupExpenses(id),
    ]);

    if (!groupDetails) {
      notFound();
    }

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return (
      <div className="space-y-6">
        {/* Group Header */}
        <GroupHeader group={groupDetails} />

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Expenses
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalExpenses.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {groupDetails.members.length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg per Person
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {groupDetails.members.length > 0
                  ? (totalExpenses / groupDetails.members.length).toFixed(2)
                  : "0.00"}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Group Balances */}
        <GroupBalances balances={balances} />

        {/* Group Expenses */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Expenses</h2>
            <AddExpenseDialog groupId={id} members={groupDetails.members} />
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
