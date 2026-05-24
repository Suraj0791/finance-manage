"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Download, 
  Key, 
  Database, 
  ScanLine, 
  Users, 
  Calendar,
  HelpCircle
} from "lucide-react";
import Link from "next/link";

export function RecruiterSandboxGuide() {
  const [checkedSteps, setCheckedSteps] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("recruiter_roadmap_progress");
    if (saved) {
      try {
        setCheckedSteps(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleStep = (stepKey) => {
    const updated = {
      ...checkedSteps,
      [stepKey]: !checkedSteps[stepKey],
    };
    setCheckedSteps(updated);
    localStorage.setItem("recruiter_roadmap_progress", JSON.stringify(updated));
  };

  const steps = [
    {
      key: "step1",
      title: "Step 1: Authenticate",
      subtitle: "Secure Single-Click Access",
      desc: "Log in securely in one click via Google or GitHub OAuth. No forms, password resets, or manual profile creation required.",
      icon: <Key className="h-6 w-6 text-indigo-400" />,
      actionText: "Go to Login",
      actionHref: "/login",
    },
    {
      key: "step2",
      title: "Step 2: Load Demo Data",
      subtitle: "Choose Guided Demo Mode",
      desc: "On the dashboard onboarding screen, choose 'Guided Demo Mode' to instantly populate your dashboard with 90 days of transaction charts, friends splits, and budgets.",
      icon: <Database className="h-6 w-6 text-emerald-400" />,
      actionText: "Open Dashboard",
      actionHref: "/dashboard",
    },
    {
      key: "step3",
      title: "Step 3: Test Gemini OCR",
      subtitle: "AI Receipt Extraction",
      desc: "Download our sample receipt and upload it in the 'Add Transaction' panel. Watch the Gemini 2.5 Flash AI extract items, merchant, and totals into input fields.",
      icon: <ScanLine className="h-6 w-6 text-orange-400" />,
      downloads: [
        { label: "Download PNG", href: "/sample-receipt.png" },
        { label: "Download SVG Vector", href: "/sample-receipt.svg" },
      ]
    },
    {
      key: "step4",
      title: "Step 4: Test Greedy Splitwise",
      subtitle: "Debt Simplification Algorithm",
      desc: "Navigate to 'Groups', select the pre-seeded 'Friends (Demo)' group, and record a payment. Our greedy reduction algorithm calculates exactly who owes whom in minimum transfers.",
      icon: <Users className="h-6 w-6 text-violet-400" />,
      actionText: "Explore Groups",
      actionHref: "/groups",
    },
    {
      key: "step5",
      title: "Step 5: Test Serverless Crons",
      subtitle: "Automated Subscriptions",
      desc: "Click 'Simulate Cron' in the dashboard testing toolbar to trigger recurring transaction checks and process subscription renewals automatically.",
      icon: <Calendar className="h-6 w-6 text-pink-400" />,
      actionText: "Trigger Simulator",
      actionHref: "/dashboard",
    }
  ];

  return (
    <section className="py-20 bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Decorative gradient glowing lights */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Banner Announcement */}
        <div className="max-w-4xl mx-auto mb-16 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center gap-6">
          <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-400">
            <Sparkles className="h-10 w-10 animate-pulse" />
          </div>
          <div className="flex-1 space-y-2 text-center md:text-left">
            <h3 className="font-bold text-lg text-indigo-200">Reviewing my application?</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              👋 Choose <span className="font-semibold text-emerald-400">[Guided Demo Mode]</span> on the dashboard to instantly populate your profile with 90 days of transactions, a default checking account, and active budget settings. This lets you test the interactive charts and analytics immediately without manual entry!
            </p>
          </div>
          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-6 py-5 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-2 flex-shrink-0">
              Try Sandbox
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Section Heading */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
            Interactive Sandbox Walkthrough
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Interactive Test-Drive Roadmap
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-base">
            Check off steps as you explore the application to see our database-backed serverless architecture and AI engine in action.
          </p>
        </div>

        {/* Step Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto">
          {steps.map((step, idx) => {
            const isCompleted = checkedSteps[step.key];
            return (
              <Card 
                key={step.key} 
                className={`bg-slate-900/60 border-slate-800 backdrop-blur-sm relative transition-all duration-300 group hover:-translate-y-1 hover:border-slate-700 flex flex-col justify-between ${
                  isCompleted ? "border-emerald-500/30 bg-emerald-950/10" : ""
                }`}
              >
                {/* Step Index Checkbox */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button 
                    onClick={() => toggleStep(step.key)}
                    className="flex items-center justify-center p-0.5 rounded-full transition-colors focus:outline-none"
                    title={isCompleted ? "Mark incomplete" : "Mark complete"}
                  >
                    <CheckCircle2 className={`h-6 w-6 transition-colors ${
                      isCompleted ? "text-emerald-500 fill-emerald-500/20" : "text-slate-700 hover:text-slate-500"
                    }`} />
                  </button>
                </div>

                <CardHeader className="pb-3 pt-6 px-6">
                  <div className="mb-4 bg-slate-800/80 w-12 h-12 rounded-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    {step.title}
                  </CardTitle>
                  <CardDescription className="text-xs text-indigo-400/90 font-medium tracking-wide">
                    {step.subtitle}
                  </CardDescription>
                </CardHeader>

                <CardContent className="px-6 pb-6 pt-0 space-y-4 flex-grow flex flex-col justify-between">
                  <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                    {step.desc}
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2">
                    {step.actionHref && (
                      <Link href={step.actionHref} className="w-full">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white text-xs flex items-center justify-center gap-1.5"
                        >
                          {step.actionText}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}

                    {step.downloads && (
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {step.downloads.map((dl, dIdx) => (
                          <a 
                            key={dIdx} 
                            href={dl.href} 
                            download 
                            className="w-full"
                          >
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white text-xs flex items-center justify-center gap-1"
                            >
                              <Download className="h-3 w-3" />
                              {dl.label}
                            </Button>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
