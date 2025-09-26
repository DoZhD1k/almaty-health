import { Header } from "@/components/header";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6">
        <AnalyticsDashboard />
      </main>
    </div>
  );
}
