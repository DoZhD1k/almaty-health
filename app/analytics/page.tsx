import { Header } from "@/components/header";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="h-screen bg-background">
      <main className="mx-4 py-6">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
