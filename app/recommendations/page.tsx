import { Header } from "@/components/header"
import { RecommendationsEngine } from "@/components/recommendations-engine"

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Рекомендации и прогноз</h1>
          <p className="text-muted-foreground">
            Автоматические рекомендации по маршрутизации пациентов и прогнозирование загруженности
          </p>
        </div>
        <RecommendationsEngine />
      </main>
    </div>
  )
}
