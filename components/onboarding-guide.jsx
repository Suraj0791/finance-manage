"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Lightbulb } from "lucide-react";

export function OnboardingGuide({ storageKey, title, description, steps = [] }) {
  const [isOpen, setIsOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Check if user previously closed this guide
    const isClosed = localStorage.getItem(`guide_closed_${storageKey}`);
    if (isClosed === "true") {
      setIsOpen(false);
    }
    setMounted(true);
  }, [storageKey]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(`guide_closed_${storageKey}`, "true");
  };

  const handleOpen = () => {
    setIsOpen(true);
    localStorage.setItem(`guide_closed_${storageKey}`, "false");
  };

  if (!mounted) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={handleOpen}
          className="rounded-full shadow-lg h-12 w-12 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center p-0 transition-transform hover:scale-105"
          title={`Show ${title} Guide`}
        >
          <Lightbulb className="h-6 w-6 animate-pulse" />
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-blue-100 bg-blue-50/50 backdrop-blur-md shadow-sm relative overflow-hidden transition-all duration-300 mb-6">
      {/* Decorative left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>

      <CardContent className="p-5 flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2 text-blue-800">
            <HelpCircle className="h-5 w-5 flex-shrink-0" />
            <h4 className="font-bold text-base">{title}</h4>
          </div>

          <p className="text-sm text-blue-700 leading-relaxed max-w-4xl">
            {description}
          </p>

          {steps.length > 0 && (
            <div className="pt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {steps.map((step, idx) => (
                <div key={idx} className="flex gap-2 items-start text-xs text-blue-800 bg-blue-100/60 p-2.5 rounded border border-blue-200/40">
                  <span className="font-bold bg-blue-200 text-blue-900 rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-normal">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-8 w-8 p-0 text-blue-700 hover:bg-blue-100/80 rounded-full"
          title="Dismiss Guide"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
