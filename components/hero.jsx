"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Sparkles, Lightbulb } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-36 pb-12 px-4">
      <div className="container mx-auto text-center max-w-5xl">
        <h1 className="text-5xl md:text-8xl lg:text-[100px] pb-6 gradient-title">
          Manage Your Finances <br /> with Intelligence
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          A modern, database-backed platform to track your checking accounts, automate subscription cycles, split group bills, and extract receipt data using Gemini AI.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-16 max-w-lg mx-auto">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md py-6 h-12 rounded-xl">
              Get Started
            </Button>
          </Link>
          <Link href="/playground" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full px-8 border-indigo-250 hover:bg-indigo-50/50 text-indigo-600 font-semibold py-6 h-12 rounded-xl flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Try Sandbox (No Login)
            </Button>
          </Link>
        </div>

        {/* Informational Core Capabilities Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 text-left mb-16">
          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:shadow-sm transition-shadow">
            <h4 className="font-bold text-slate-900 text-sm mb-1">🏦 Add Accounts</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create multiple checking or savings accounts manually to manage your balances.
            </p>
          </div>
          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:shadow-sm transition-shadow">
            <h4 className="font-bold text-slate-900 text-sm mb-1">💸 Log Transactions</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add income and expenses, assign categories, and track where your money goes.
            </p>
          </div>
          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:shadow-sm transition-shadow">
            <h4 className="font-bold text-slate-900 text-sm mb-1">🔄 Recurring Cycles</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Schedule recurring subscription bills to charge and update balances automatically.
            </p>
          </div>
          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:shadow-sm transition-shadow">
            <h4 className="font-bold text-slate-900 text-sm mb-1">🤖 AI Scanner</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a receipt image and let Gemini extract the merchant, amounts, and dates.
            </p>
          </div>
          <div className="p-5 border border-slate-100 rounded-xl bg-slate-50/50 hover:shadow-sm transition-shadow">
            <h4 className="font-bold text-slate-900 text-sm mb-1">👥 Split Bills</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Create roommate groups. Settle balances using minimum-transaction algorithms.
            </p>
          </div>
        </div>

        {/* Clear No-Hallucination Advice Box */}
        <div className="max-w-3xl mx-auto p-6 rounded-xl border border-blue-100 bg-blue-50/40 text-left space-y-3">
          <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
            <Lightbulb className="h-4 w-4 text-blue-600 animate-pulse" />
            Advice for Testers & Reviewers
          </div>
          <p className="text-xs text-blue-900 leading-relaxed">
            To see interactive charts, budget limits, and bill-splitting algorithms in action, manual data entry would require weeks of input. 
            We <strong>highly recommend</strong> logging in and clicking <strong>"Explore with Demo Data"</strong>. This instantly populates your private dashboard with 90 days of transactions, budgets, and roommate groups so you can test all features in 10 seconds without any tedious data entry.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
