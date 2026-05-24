"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Play } from "lucide-react";
import { seedTransactions } from "@/actions/seed";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SandboxControls() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSeed = async () => {
    setLoading(true);
    const id = toast.loading("Seeding your private sandbox database...");

    try {
      const result = await seedTransactions();

      if (result.success) {
        toast.success(result.message, { id });
        router.refresh();
        // Force refresh page after brief delay to reload all server component data
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(result.error || "Failed to seed sandbox data.", { id });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred during database seeding.", { id });
    } finally {
      setLoading(false);
    }
  };

  const simulateCron = async () => {
    const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "Suraj@4011";
    toast.info("Triggering background cron simulations...");
    try {
      const response = await fetch(`/api/cron?action=recurring&secret=${secret}`);
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || "Cron executed successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || "Cron authorization failed.");
      }
    } catch (err) {
      toast.error("Failed to connect to Cron API endpoint.");
    }
  };

  return (
    <Card className="border-indigo-150 bg-gradient-to-br from-indigo-50/50 via-purple-50/20 to-white backdrop-blur-md shadow-md border-dashed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-indigo-900 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
          Recruiter Demo Sandbox Console
        </CardTitle>
        <CardDescription className="text-indigo-700/80 text-sm">
          Avoid typing manual transactions. Seed mock data instantly to test the interactive analytics and split bills!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-indigo-950 leading-relaxed">
          Clicking the seed button will automatically provision a checking account, a monthly budget threshold of $4,000, 90 days of transactions (to populate charts), and a Splitwise Group with pre-allocated billing debits.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button
            onClick={handleSeed}
            disabled={loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-5 shadow-md flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Seeding Sandbox...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Activate Recruiter Demo Mode
              </>
            )}
          </Button>

          <Button
            onClick={simulateCron}
            variant="outline"
            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-medium py-5 flex items-center justify-center gap-2"
            title="Simulate Daily Cron Task Trigger"
          >
            <Play className="h-4 w-4" />
            Simulate Cron Jobs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
