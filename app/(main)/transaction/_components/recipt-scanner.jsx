"use client";

import { useRef, useEffect, useState } from "react";
import { Camera, Loader2, Download, FileText, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);
  const toastIdRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    toastIdRef.current = toast.loading("Gemini AI is reading receipt image...");
    try {
      await scanReceiptFn(file);
    } catch (err) {
      if (toastIdRef.current) {
        toast.error("Failed to scan receipt", { id: toastIdRef.current });
        toastIdRef.current = null;
      }
    }
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current);
        toastIdRef.current = null;
      }
      onScanComplete(scannedData);
    }
  }, [scanReceiptLoading, scannedData]);

  // Drag & drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleReceiptScan(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />

      {/* Drag & Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !scanReceiptLoading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all relative overflow-hidden group ${
          dragActive
            ? "border-blue-500 bg-blue-50/10 shadow-md scale-[1.01]"
            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/40"
        } ${scanReceiptLoading ? "pointer-events-none opacity-85" : ""}`}
      >
        {scanReceiptLoading ? (
          <div className="py-6 space-y-3">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-slate-800 animate-pulse">Processing Receipt...</h4>
              <p className="text-xs text-slate-500">Gemini AI is reading and extracting transaction details.</p>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-700">
                <span className="text-blue-600 hover:underline">Click to upload</span> or drag and drop your receipt
              </p>
              <p className="text-xs text-slate-500">PNG, JPG, or SVG up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {/* Pre-rendered assets warning / testing callout */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="font-bold text-slate-700 flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-blue-500" />
            No receipt handy for testing?
          </div>
          <p className="text-slate-500">Download our pre-rendered receipt to test-drive the AI scanner instantly:</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <a href="/sample-receipt.png" download className="flex-1 md:flex-initial">
            <Button type="button" variant="outline" size="sm" className="w-full text-slate-600 text-[11px] h-8 py-0">
              <Download className="h-3 w-3 mr-1" />
              Download PNG
            </Button>
          </a>
          <a href="/sample-receipt.svg" download className="flex-1 md:flex-initial">
            <Button type="button" variant="outline" size="sm" className="w-full text-slate-600 text-[11px] h-8 py-0">
              <Download className="h-3 w-3 mr-1" />
              Download SVG
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}