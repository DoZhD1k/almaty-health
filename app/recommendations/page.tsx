import { RecommendationsEngine } from "@/components/recommendations-engine";

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-4 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Рекомендации
          </h1>
          <p className="text-muted-foreground">
            Рекомендации по маршрутизации пациентов
          </p>
        </div>
        <RecommendationsEngine />
      </main>
    </div>
  );
}
