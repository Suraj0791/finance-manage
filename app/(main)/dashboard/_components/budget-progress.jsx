"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? (currentExpenses / initialBudget.amount) * 100
    : 0;

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-sm font-medium">
            Monthly Budget (Default Account)
          </CardTitle>
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="w-32"
                  placeholder="Enter amount"
                  autoFocus
                  disabled={isLoading}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleUpdateBudget}
                  disabled={isLoading}
                >
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 mt-1">
                  <CardDescription>
                    {initialBudget
                      ? `$${currentExpenses.toFixed(
                          2
                        )} of $${initialBudget.amount.toFixed(2)} spent`
                      : "No budget set"}
                  </CardDescription>
                  {initialBudget && percentUsed >= 75 && (
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full w-max border flex items-center gap-1 ${
                      percentUsed >= 100
                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                        : percentUsed >= 90
                        ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                        : "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                    }`}>
                      {percentUsed >= 100 
                        ? "🚨 Over Budget Limit!" 
                        : percentUsed >= 90 
                        ? "⚠️ Near Budget Limit" 
                        : "⚠️ High Usage Warning"}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 ml-auto"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {initialBudget && (
          <div className="space-y-2">
            <Progress
              value={Math.min(percentUsed, 100)}
              indicatorClassName={
                percentUsed >= 100
                  ? "bg-red-600"
                  : percentUsed >= 90
                  ? "bg-orange-500"
                  : percentUsed >= 75
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }
            />
            <p className={`text-xs font-semibold text-right ${
              percentUsed >= 100
                ? "text-red-500"
                : percentUsed >= 90
                ? "text-orange-500"
                : percentUsed >= 75
                ? "text-yellow-600"
                : "text-muted-foreground"
            }`}>
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>

    </Card>
  );
}