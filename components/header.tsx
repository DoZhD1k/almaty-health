import { Activity, BarChart3, Settings, FileText, Route } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              MedMonitor
            </span>
          </div>

          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="/">
                <Activity className="h-4 w-4" />
                Карта
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="/analytics">
                <BarChart3 className="h-4 w-4" />
                Аналитика
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="/recommendations">
                <Route className="h-4 w-4" />
                Рекомендации
              </a>
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <a href="/methodology">
                <FileText className="h-4 w-4" />
                Методология
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
