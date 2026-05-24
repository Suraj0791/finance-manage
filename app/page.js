import React from "react";
import HeroSection from "@/components/hero";
import {
  featuresData,
  howItWorksData,
  testimonialsData,
  statsData,
} from "@/data/landing";
import { Badge } from "@/components/ui/badge";
import ApiPingButton from "@/components/api-ping-button";
import { RecruiterSandboxGuide } from "@/components/recruiter-sandbox-guide";
import fs from "fs";
import path from "path";

export default function LandingPage() {
  // Ensure the sample receipt image is copied to the public folder during render
  try {
    const srcPath = "C:\\Users\\suraj sharma\\.gemini\\antigravity-ide\\brain\\fdd96bd3-55ab-48c7-85ac-cbc3decdd8da\\sample_receipt_1779610405716.png";
    const destPath = path.join(process.cwd(), "public", "sample-receipt.png");
    if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
  } catch (err) {
    console.warn("Could not copy sample receipt to public folder:", err);
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Recruiter Interactive Onboarding & Test-Drive Roadmap */}
      <RecruiterSandboxGuide />

      {/* Stats Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {statsData.map((stat, index) => (
              <div key={index} className="p-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16 space-y-3">
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">Platform Features</Badge>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              Simple, Powerful Financial Tracking
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-base">
              Everything you need to scan receipts, split shared bills, and automate your subscriptions in one dashboard.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1: Accounts */}
            <div className="p-8 border border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="text-3xl">🏦</div>
                <h3 className="text-xl font-bold text-slate-950">Smart Account Tracking</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Keep tabs on multiple savings, checking, or credit card accounts in one unified dashboard.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">What you can do:</span> Create custom accounts, specify starting balances, toggle default accounts, and view live calculations.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-650">Why use it:</span> Since you don't need to link real bank accounts, your data remains 100% private and secure.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: AI Scanner */}
            <div className="p-8 border border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="text-3xl">🤖</div>
                <h3 className="text-xl font-bold text-slate-950">AI Receipt Scanner</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Snap a photo of any store or restaurant receipt to extract purchase details using Gemini AI.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">What you can do:</span> Drag-and-drop receipt files (PNG, JPG, SVG) and let the AI automatically identify items, merchant names, dates, and totals.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-650">Why use it:</span> Completely saves you from typing names, dates, and numbers manually.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Subscriptions */}
            <div className="p-8 border border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="text-3xl">🔄</div>
                <h3 className="text-xl font-bold text-slate-950">Recurring Subscriptions</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Track recurring bills, utilities, or services like Netflix, Spotify, or Rent automatically.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">What you can do:</span> Schedule recurring intervals (daily, weekly, monthly, yearly) and let our background cron engine process payments on the due date.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-650">Why use it:</span> Keeps your future balances accurate and prevents you from forgetting subscription costs.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Group & Friends Splits */}
            <div className="p-8 border border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="text-3xl">👥</div>
                <h3 className="text-xl font-bold text-slate-950">Group & Friends Bill Splits</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Share travel bills, dinner tabs, rent, or groceries with friends, roommates, or travel groups.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">What you can do:</span> Create groups, add friends or guest members, log shared bills, and calculate exactly who owes whom.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-650">Why use it:</span> Uses a greedy graph-settlement algorithm to simplify debts, reducing settlement down to the absolute minimum transfers.
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Charts & Budgets */}
            <div className="p-8 border border-slate-200/60 bg-white rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="text-3xl">📊</div>
                <h3 className="text-xl font-bold text-slate-950">Analytics & Budgets</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Compare monthly spending against custom budget limits and categorize expenses.
                </p>
                <div className="space-y-2 border-t border-slate-100 pt-4 text-xs">
                  <div>
                    <span className="font-semibold text-slate-900">What you can do:</span> Track interactive pie and area charts, get automated warning alerts when budget utilization exceeds 80%.
                  </div>
                  <div>
                    <span className="font-semibold text-blue-650">Why use it:</span> Provides clean, animative visual summaries of your savings trends and spending habits.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Optional: show DB Ping only when explicitly enabled (e.g., during troubleshooting) */}
        {process.env.NEXT_PUBLIC_SHOW_DB_PING === "true" && (
          <div className="max-w-md mx-auto mt-12">
            <ApiPingButton />
          </div>
        )}
      </section>
    </div>
  );
}
