"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Play, Lightbulb, Plus, UserCheck } from "lucide-react";
import { seedTransactions } from "@/actions/seed";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CreateAccountDrawer } from "@/components/create-account-drawer";

export function SandboxControls({ hasAccounts }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    const id = toast.loading("Setting up your private demo sandbox...");

    try {
      const result = await seedTransactions();

      if (result.success) {
        toast.success("Demo environment loaded successfully!", { id });
        router.refresh();
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error(result.error || "Failed to seed sandbox data.", { id });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during seeding.", { id });
    } finally {
      setLoading(false);
    }
  };

  const simulateCron = async () => {
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "Suraj@4011";
    toast.info("Triggering automated subscription check...");
    try {
      const response = await fetch(`/api/cron?action=recurring&secret=${secret}`);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Subscriptions processed successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        toast.error(data.error || "Cron authorization failed.");
      }
    } catch (err) {
      toast.error("Failed to connect to automation server.");
    }
  };

  // State A: User has NO accounts (First-time onboarding)
  if (!hasAccounts) {
    return (
      <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-white backdrop-blur-md shadow-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        <CardHeader className="pb-4 pt-6 px-6 sm:px-8">
          <div className="flex items-center gap-3 text-indigo-900">
            <div className="p-2 bg-indigo-500/10 rounded-xl">
              <Sparkles className="h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">
                Welcome to your Dashboard! 🚀
              </CardTitle>
              <CardDescription className="text-indigo-800/80 text-sm mt-0.5">
                Let's set up your workspace. Choose how you want to explore the application:
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-8 pb-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Option 1: Demo Mode */}
            <div className="p-5 rounded-2xl border border-indigo-100/80 bg-indigo-50/20 hover:bg-indigo-50/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-xs font-semibold text-indigo-700">
                  <UserCheck className="h-3 w-3" />
                  Recommended for Testing
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                  Option A: Guided Demo Mode
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instantly populate your account with **90 days of realistic sample transactions**, a pre-configured monthly budget threshold, and a pre-seeded **Splitwise friends group** to test charts, budgets, and bill splitting immediately.
                </p>
              </div>
              <Button
                onClick={handleSeed}
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 shadow-sm flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform duration-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Preparing Sandbox...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Load Demo Data & Tour
                  </>
                )}
              </Button>
            </div>

            {/* Option 2: Start Clean */}
            <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/20 hover:bg-slate-50/40 transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-500/10 text-xs font-semibold text-slate-700">
                  <Plus className="h-3 w-3" />
                  Start Fresh
                </div>
                <h4 className="font-bold text-slate-900 group-hover:text-slate-950 transition-colors">
                  Option B: Fresh Setup
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Start with a blank canvas. Manually configure your accounts and add real-time transactions. Best if you want to use the application to manage your actual personal finances.
                </p>
              </div>
              <CreateAccountDrawer>
                <Button
                  variant="outline"
                  className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold py-5 flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-transform duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Create Account Manually
                </Button>
              </CreateAccountDrawer>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // State B: User HAS accounts (Low-profile, non-intrusive toolbar helper)
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 shadow-sm">
      <div className="flex items-center gap-2.5 text-slate-600 text-xs sm:text-sm">
        <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
          <Lightbulb className="h-4 w-4 animate-pulse flex-shrink-0" />
        </div>
        <span>
          <strong>Testing Sandbox:</strong> You can simulate subscription renewals or re-seed the environment anytime.
        </span>
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={simulateCron}
          variant="outline"
          size="sm"
          className="border-slate-350 text-slate-700 hover:bg-slate-100 text-xs flex-1 sm:flex-none py-1.5 h-8 flex items-center gap-1"
          title="Simulate automated daily subscription cron run"
        >
          <Play className="h-3 w-3" />
          Simulate Cron
        </Button>
        <Button
          onClick={handleSeed}
          disabled={loading}
          variant="ghost"
          size="sm"
          className="text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50/50 flex-1 sm:flex-none py-1.5 h-8 font-medium"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Reset/Re-seed Demo Data"
          )}
        </Button>
      </div>
    </div>
  );
}
