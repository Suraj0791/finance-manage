import { getUserAccounts } from "@/actions/dashboard";
import { OnboardingGuide } from "@/components/onboarding-guide";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";

export default async function AddTransactionPage({ searchParams: rawSearchParams  }) {

  const searchParams = await rawSearchParams;

  const accounts = await getUserAccounts();

  const editId = searchParams?.edit;

  let initialData = null;
  if (editId) {
    initialData = await getTransaction(editId);
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <div className="flex justify-center md:justify-normal mb-8">
        <h1 className="text-5xl gradient-title ">Add Transaction</h1>
      </div>
      <OnboardingGuide
        storageKey="create_transaction"
        title="Testing the AI Receipt Scanner!"
        description="This page allows you to manually log transactions or scan a physical receipt. The AI scanner uses Google Gemini to read text from your receipt image and automatically fill out the amount, description, date, merchant, and category fields."
        steps={[
          "Select a bank/savings account first.",
          "Upload a receipt image (e.g. check the landing page download link) to let the AI automatically pre-fill the form fields.",
          "Submit the transaction. It will instantly update your dashboard balances and charts."
        ]}
      />
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
}