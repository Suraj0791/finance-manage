"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageSquare, 
  Loader2, 
  Trash2,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function AIChatAssistant({ session }) {
  const isLoggedIn = !!session?.user;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const messagesEndRef = useRef(null);

  const defaultGreeting = isLoggedIn
    ? `Hello **${session.user.name || "User"}**! I am **Welth AI**, your personal financial advisor. 
    Ask me about your account balances, monthly budgets, recent transactions, or Splitwise group settlements!`
    : "Hello! I am **Welth AI**. Please **log in** to securely query your transactions, budgets, account balances, and split bills. In the meantime, feel free to ask me general financial planning questions!";

  // Initialize messages once on open or mount
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: defaultGreeting,
      },
    ]);
  }, [isLoggedIn]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const suggestions = isLoggedIn
    ? [
        "What are my account balances?",
        "Am I on track to meet my budget this month?",
        "Show my recent transactions",
        "Give me 3 tips to save money",
      ]
    : [
        "Give me 3 tips to save money",
        "What is a good budgeting method?",
        "How does debt minimization work?",
      ];

  const handleSend = async (text) => {
    const query = text.trim();
    if (!query) return;

    setErrorMsg(null);
    const newMessages = [...messages, { role: "user", content: query }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to communicate with advisor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear chat history?")) {
      setMessages([
        {
          role: "assistant",
          content: defaultGreeting,
        },
      ]);
      setErrorMsg(null);
    }
  };

  // Helper markdown parser
  const parseMarkdown = (text) => {
    if (!text) return "";
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const content = line.trim().substring(2);
        return (
          <li key={idx} className="ml-4 list-disc pl-1 text-slate-300 my-1 font-sans text-sm">
            {renderTextWithBold(content)}
          </li>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="my-1.5 text-slate-300 leading-relaxed font-sans text-sm">
          {renderTextWithBold(line)}
        </p>
      );
    });
  };

  const renderTextWithBold = (text) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-bold text-indigo-300">
            {part.substring(2, part.length - 2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* 1. Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer border border-indigo-400/30 group"
        title="Consult AI Financial Advisor"
      >
        <Bot className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12 animate-pulse" />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
        </span>
      </button>

      {/* 2. Slide-out Chat Panel Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsOpen(false)} 
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300 cursor-pointer"
          />

          {/* Drawer container */}
          <div className="relative w-full sm:w-[450px] h-full bg-slate-950 border-l border-slate-900 shadow-2xl flex flex-col z-10 transition-transform duration-300 transform translate-x-0 text-slate-100">
            {/* Header */}
            <div className="p-4 border-b border-slate-900 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white border border-indigo-400/20">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-indigo-400 flex items-center gap-1.5">
                    Welth AI Advisor
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Online & Secure</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 1 && (
                  <button
                    onClick={handleClearChat}
                    className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                    title="Clear Chat"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/90 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {messages.map((msg, idx) => {
                const isAI = msg.role === "assistant";
                return (
                  <div 
                    key={idx} 
                    className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "ml-auto flex-row-reverse"}`}
                  >
                    {isAI && (
                      <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div 
                      className={`rounded-2xl p-3 shadow-md ${
                        isAI 
                          ? "bg-slate-900 border border-slate-800/80 rounded-tl-none text-slate-200" 
                          : "bg-indigo-600 text-white rounded-tr-none"
                      }`}
                    >
                      {isAI ? (
                        <div className="space-y-1">{parseMarkdown(msg.content)}</div>
                      ) : (
                        <p className="text-sm font-sans whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex gap-3 max-w-[85%] self-start">
                  <div className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shrink-0">
                    <Bot className="h-4 w-4 animate-bounce" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800/80 rounded-2xl rounded-tl-none p-3 flex items-center gap-1.5 shadow-md">
                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Error box */}
              {errorMsg && (
                <div className="flex gap-2 p-3 bg-rose-950/50 border border-rose-900/60 rounded-xl text-rose-300 text-xs items-start">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <div>
                    <p className="font-semibold">Query Failed</p>
                    <p className="opacity-90">{errorMsg}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions list */}
            {!isLoading && (
              <div className="px-4 py-2 border-t border-slate-900 bg-slate-950 flex flex-wrap gap-2">
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-xs bg-slate-900 border border-slate-800 hover:border-indigo-500 text-indigo-300 hover:bg-slate-800 px-2.5 py-1.5 rounded-full transition-all cursor-pointer text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Form Input Footer */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-4 border-t border-slate-900 bg-slate-950 flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about budgets, accounts, settlements..."
                disabled={isLoading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-900 disabled:text-slate-600 text-white rounded-lg p-2.5 flex items-center justify-center transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
