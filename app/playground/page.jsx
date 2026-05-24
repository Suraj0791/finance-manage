"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sparkles, 
  Camera, 
  Loader2, 
  Download, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  ArrowRight,
  Handshake,
  Lightbulb,
  FileText
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

// Helper to calculate settlements for local playground
function calculateSettlementsLocal(balances) {
  const settlements = [];
  const debtors = balances
    .filter((b) => b.netBalance < -0.01)
    .map((b) => ({ ...b, balance: Math.abs(b.netBalance) }))
    .sort((a, b) => b.balance - a.balance);
  const creditors = balances
    .filter((b) => b.netBalance > 0.01)
    .map((b) => ({ ...b, balance: b.netBalance }))
    .sort((a, b) => b.balance - a.balance);

  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(debtor.balance, creditor.balance);

    if (amount > 0.01) {
      settlements.push({
        from: debtor.name,
        to: creditor.name,
        amount: Number(amount.toFixed(2)),
      });
    }

    debtor.balance -= amount;
    creditor.balance -= amount;

    if (debtor.balance < 0.01) i++;
    if (creditor.balance < 0.01) j++;
  }
  return settlements;
}

const mockChartData = {
  typical: [
    { month: "Jan", Income: 5000, Expenses: 3200 },
    { month: "Feb", Income: 5000, Expenses: 2800 },
    { month: "Mar", Income: 5500, Expenses: 3100 },
    { month: "Apr", Income: 5000, Expenses: 3500 },
    { month: "May", Income: 6000, Expenses: 3900 },
  ],
  vacation: [
    { month: "Jan", Income: 5000, Expenses: 3200 },
    { month: "Feb", Income: 5000, Expenses: 4800 }, // High expenses
    { month: "Mar", Income: 5500, Expenses: 3100 },
    { month: "Apr", Income: 5000, Expenses: 3500 },
    { month: "May", Income: 6000, Expenses: 5900 }, // High expenses
  ],
  saving: [
    { month: "Jan", Income: 5000, Expenses: 2100 }, // Super low expenses
    { month: "Feb", Income: 5000, Expenses: 1900 },
    { month: "Mar", Income: 5500, Expenses: 2200 },
    { month: "Apr", Income: 5000, Expenses: 2300 },
    { month: "May", Income: 6000, Expenses: 2400 },
  ]
};

const PIE_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#a855f7"];

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState("ocr");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- OCR Scanner State ---
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleOcrScan = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setOcrFile(file);
    setOcrLoading(true);
    const toastId = toast.loading("Analyzing receipt with Gemini 2.5 Flash...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/sandbox/scan", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setOcrResult(data);
        toast.success("Receipt scanned successfully!", { id: toastId });
      } else {
        toast.error(data.error || "Failed to scan receipt", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to connect to AI server", { id: toastId });
    } finally {
      setOcrLoading(false);
    }
  };

  // --- Bill Split Solver State ---
  const [members, setMembers] = useState(["Alice", "Bob", "Charlie"]);
  const [newMemberName, setNewMemberName] = useState("");
  const [expenses, setExpenses] = useState([
    { id: 1, title: "Apartment Rent", amount: 1200, paidBy: "Alice" },
    { id: 2, title: "Groceries", amount: 150, paidBy: "Bob" },
    { id: 3, title: "Uber Ride", amount: 60, paidBy: "Charlie" },
  ]);
  const [newExpenseTitle, setNewExpenseTitle] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("Alice");

  const addMember = () => {
    if (!newMemberName.trim()) return;
    if (members.includes(newMemberName.trim())) {
      toast.error("Member already exists");
      return;
    }
    setMembers([...members, newMemberName.trim()]);
    setNewMemberName("");
  };

  const removeMember = (name) => {
    if (members.length <= 2) {
      toast.error("Group must have at least 2 members");
      return;
    }
    setMembers(members.filter((m) => m !== name));
    setExpenses(expenses.filter((e) => e.paidBy !== name));
  };

  const addExpense = () => {
    const amt = parseFloat(newExpenseAmount);
    if (!newExpenseTitle.trim() || isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid title and amount");
      return;
    }
    setExpenses([
      ...expenses,
      {
        id: Date.now(),
        title: newExpenseTitle.trim(),
        amount: amt,
        paidBy: newExpensePaidBy,
      }
    ]);
    setNewExpenseTitle("");
    setNewExpenseAmount("");
  };

  const removeExpense = (id) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  // Calculate local Splitwise balances
  const getLocalBalancesAndSettlements = () => {
    // 1. Initialize balances
    const balanceMap = {};
    members.forEach((m) => {
      balanceMap[m] = { name: m, paid: 0, share: 0, netBalance: 0 };
    });

    // 2. Aggregate payments and shares
    let totalExpenseAmount = 0;
    expenses.forEach((exp) => {
      totalExpenseAmount += exp.amount;
      if (balanceMap[exp.paidBy]) {
        balanceMap[exp.paidBy].paid += exp.amount;
      }
    });

    const equalShare = totalExpenseAmount / members.length;
    members.forEach((m) => {
      balanceMap[m].share = equalShare;
      balanceMap[m].netBalance = balanceMap[m].paid - equalShare;
    });

    const balances = Object.values(balanceMap);
    const settlements = calculateSettlementsLocal(balances);

    return { balances, settlements, totalExpenseAmount };
  };

  const { balances, settlements, totalExpenseAmount } = getLocalBalancesAndSettlements();

  // --- Charts State ---
  const [chartScenario, setChartScenario] = useState("typical");

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-28 pb-16 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="container mx-auto max-w-6xl relative z-10 space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            No Login Required
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-blue-200 via-indigo-200 to-purple-200 bg-clip-text text-transparent">
            Interactive AI & Algo Playground
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            👋 Welcome! You can use this sandbox to test our core algorithms and Gemini AI OCR scanner instantly, completely without authenticating or setting up an account.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center border-b border-slate-800 pb-px max-w-md mx-auto">
          <button
            onClick={() => setActiveTab("ocr")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "ocr"
                ? "border-indigo-500 text-indigo-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Camera className="h-4 w-4" />
              Gemini OCR
            </span>
          </button>
          <button
            onClick={() => setActiveTab("split")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "split"
                ? "border-indigo-500 text-indigo-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <Users className="h-4 w-4" />
              Bill Simplification
            </span>
          </button>
          <button
            onClick={() => setActiveTab("charts")}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "charts"
                ? "border-indigo-500 text-indigo-400 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="flex items-center justify-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              Interactive Charts
            </span>
          </button>
        </div>

        {/* --- OCR TAB CONTENT --- */}
        {activeTab === "ocr" && (
          <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
            {/* Left Upload Panel */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 flex flex-col justify-between p-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold flex items-center gap-2 text-slate-200">
                    <Camera className="h-5 w-5 text-indigo-400" />
                    AI Receipt OCR Scanner
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Upload any paper purchase receipt image to test the Gemini 2.5 Flash extraction capability. It reads the image, identifies items, merchants, categories, and totals.
                  </p>
                </div>

                {/* Download Sample receipts */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="font-semibold text-slate-300">Don't have a receipt handy?</div>
                  <p className="text-slate-400">Download our pre-rendered receipt to test with:</p>
                  <div className="flex gap-2">
                    <a href="/sample-receipt.png" download className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-slate-350 border-slate-800 text-[10px] hover:bg-slate-900 py-1.5 h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Download PNG
                      </Button>
                    </a>
                    <a href="/sample-receipt.svg" download className="flex-1">
                      <Button variant="outline" size="sm" className="w-full text-slate-350 border-slate-800 text-[10px] hover:bg-slate-900 py-1.5 h-7">
                        <Download className="h-3 w-3 mr-1" />
                        Download SVG
                      </Button>
                    </a>
                  </div>
                </div>

                {/* Upload Action */}
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 text-center bg-slate-950/40 hover:border-slate-700 transition-colors relative cursor-pointer group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleOcrScan}
                    disabled={ocrLoading}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover:scale-110 transition-transform">
                      {ocrLoading ? (
                        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-indigo-400">Click to upload</span>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG or SVG up to 5MB</p>
                    </div>
                  </div>
                </div>
              </div>

              {ocrFile && (
                <div className="mt-4 p-3 bg-slate-900 rounded border border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-300 truncate max-w-[200px]">{ocrFile.name}</span>
                  <span className="text-slate-500">{(ocrFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}
            </Card>

            {/* Right Result Panel */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-6 flex flex-col justify-center">
              {ocrLoading ? (
                <div className="text-center space-y-3 py-12">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-sm text-slate-400">Gemini AI is reading and extracting text details...</p>
                </div>
              ) : ocrResult ? (
                <div className="space-y-6">
                  <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                    <h4 className="font-bold text-slate-200">AI Extraction Output</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Gemini Verified
                    </span>
                  </div>

                  {/* Receipt Details Card mockup */}
                  <div className="bg-white text-slate-900 rounded-xl p-6 font-mono text-sm max-w-sm mx-auto shadow-xl">
                    <div className="text-center border-b border-dashed border-slate-300 pb-3 mb-4">
                      <div className="font-bold text-base tracking-wide uppercase">
                        {ocrResult.merchantName || "Unknown Merchant"}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Date: {ocrResult.date ? new Date(ocrResult.date).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span>Description:</span>
                        <span className="font-semibold text-right max-w-[200px] truncate">{ocrResult.description || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span>Suggested Category:</span>
                        <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full text-[10px]">
                          {ocrResult.category || "other"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-300 pt-3 flex justify-between font-bold text-base">
                      <span>TOTAL:</span>
                      <span>{formatCurrency(ocrResult.amount || 0)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 space-y-3">
                  <div className="w-12 h-12 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-center mx-auto text-slate-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-slate-300">No active scan</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    Upload a receipt image on the left. The Gemini AI engine will parse it and show the structured JSON output here.
                  </p>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* --- BILL SPLIT SOLVER TAB CONTENT --- */}
        {activeTab === "split" && (
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {/* Column 1: Members */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-400" />
                    1. Group Members
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add or remove roommates in the current calculation.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Enter name..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-xs h-9"
                  />
                  <Button onClick={addMember} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-9 px-3">
                    Add
                  </Button>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                  {members.map((m) => (
                    <div key={m} className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                      <span className="font-medium">{m}</span>
                      <button onClick={() => removeMember(m)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Column 2: Log Expenses */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Plus className="h-4 w-4 text-emerald-400" />
                    2. Log Group Bills
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Add expenses paid by individual group members.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <Input
                    placeholder="e.g. Rent, Electricity"
                    value={newExpenseTitle}
                    onChange={(e) => setNewExpenseTitle(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 h-8"
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Amount ($)"
                      type="number"
                      value={newExpenseAmount}
                      onChange={(e) => setNewExpenseAmount(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-slate-100 h-8 flex-1"
                    />
                    <select
                      value={newExpensePaidBy}
                      onChange={(e) => setNewExpensePaidBy(e.target.value)}
                      className="bg-slate-950 border-slate-800 border rounded px-2 text-slate-300 h-8 text-[11px]"
                    >
                      {members.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <Button onClick={addExpense} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-[11px]">
                    Record Bill
                  </Button>
                </div>

                <div className="space-y-2 max-h-[160px] overflow-auto pr-1">
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center p-2 rounded-lg bg-slate-950 border border-slate-850 text-xs">
                      <div className="truncate max-w-[120px]">
                        <div className="font-medium truncate">{exp.title}</div>
                        <div className="text-[10px] text-slate-500">Paid by {exp.paidBy}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-400">${exp.amount.toFixed(2)}</span>
                        <button onClick={() => removeExpense(exp.id)} className="text-slate-600 hover:text-red-400">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Column 3: Simplification Output */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-slate-200 flex items-center gap-2">
                    <Handshake className="h-4 w-4 text-orange-400" />
                    3. Greedy Debt Simplifier
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Minimal transaction paths to clear roommate balances.
                  </p>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-auto pr-1">
                  {settlements.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-500">
                      Everyone is settled! No transactions needed.
                    </div>
                  ) : (
                    settlements.map((settlement, index) => (
                      <div key={index} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-400">{settlement.from}</span>
                          <span className="text-[10px] text-slate-500 font-semibold uppercase">pays</span>
                          <span className="font-bold text-emerald-400">{settlement.to}</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-slate-900 pt-1.5 mt-1 font-semibold">
                          <span className="text-[10px] text-slate-400">Simplified Debt</span>
                          <span className="text-slate-200">${settlement.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-slate-800 pt-3 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total Group Spending:</span>
                  <span className="font-bold text-slate-200">${totalExpenseAmount.toFixed(2)}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* --- CHARTS TAB CONTENT --- */}
        {activeTab === "charts" && mounted && (
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Left Controls */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-5 space-y-4 md:col-span-1">
              <div>
                <h4 className="font-bold text-slate-200">Interactive Analytics</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a spending scenario below to simulate how the area and categorization charts dynamically render changes.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={() => setChartScenario("typical")}
                  variant={chartScenario === "typical" ? "default" : "outline"}
                  className="w-full justify-start text-xs border-slate-800 text-slate-350"
                >
                  🟢 Scenario 1: Typical Saving & Spending
                </Button>
                <Button
                  onClick={() => setChartScenario("vacation")}
                  variant={chartScenario === "vacation" ? "default" : "outline"}
                  className="w-full justify-start text-xs border-slate-800 text-slate-350"
                >
                  🔴 Scenario 2: High Vacation Spending
                </Button>
                <Button
                  onClick={() => setChartScenario("saving")}
                  variant={chartScenario === "saving" ? "default" : "outline"}
                  className="w-full justify-start text-xs border-slate-800 text-slate-350"
                >
                  🔵 Scenario 3: Aggressive Saving Month
                </Button>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1.5">
                <div className="font-semibold text-slate-300">Live Features Demo:</div>
                <ul className="list-disc pl-4 text-[11px] text-slate-400 space-y-1">
                  <li>Automatic balance snapshots</li>
                  <li>Monthly budget progress</li>
                  <li>Responsive desktop/mobile grids</li>
                </ul>
              </div>
            </Card>

            {/* Right Charts */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-100 p-5 md:col-span-2 space-y-6">
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData[chartScenario]}>
                    <defs>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#1e293b" }} />
                    <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-between text-xs bg-slate-950 p-3 rounded-lg border border-slate-850">
                <span className="text-slate-400">Selected Scenario:</span>
                <span className="font-bold text-slate-200 capitalize">{chartScenario} Model</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
