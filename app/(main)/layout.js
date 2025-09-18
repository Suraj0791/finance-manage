import React from "react";
import { LoadingProvider } from "@/components/providers/loading-provider";
import { PerformanceMonitor } from "@/components/performance-monitor";
import { NavigationProgress } from "@/components/navigation-progress";
import { ErrorBoundary } from "@/components/error-boundary";

const MainLayout = ({ children }) => {
  return (
    <ErrorBoundary>
      <LoadingProvider>
        <PerformanceMonitor />
        <NavigationProgress />
        <div className="container mx-auto my-32">{children}</div>
      </LoadingProvider>
    </ErrorBoundary>
  );
};

export default MainLayout;
