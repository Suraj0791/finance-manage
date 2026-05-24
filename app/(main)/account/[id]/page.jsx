import { Suspense } from "react";
import { getAccountDetails, getAccountTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

export default async function AccountPage({ params: rawParams }) {
  // Await and resolve params
  const params = await rawParams;

  // Fetch only the account details first (very fast, <15ms)
  const account = await getAccountDetails(params.id);

  if (!account) {
    notFound();
  }

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Transactions Section is loaded asynchronously and streamed in */}
      <Suspense
        fallback={<BarLoader className="mt-8" width={"100%"} color="#9333ea" />}
      >
        <TransactionsWrapper accountId={params.id} />
      </Suspense>
    </div>
  );
}

// Subcomponent to query transactions dynamically and stream them
async function TransactionsWrapper({ accountId }) {
  const transactions = await getAccountTransactions(accountId);
  return (
    <div className="space-y-8">
      <AccountChart transactions={transactions} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}