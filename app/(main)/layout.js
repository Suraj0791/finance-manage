import React from "react";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { PerformanceMonitor } from "@/components/performance-monitor";

const MainLayout = ({ children }) => {
  return (
    <LoadingProvider>
      <PerformanceMonitor />
      <div className="container mx-auto my-32">{children}</div>
    </LoadingProvider>
  );
};

export default MainLayout;
