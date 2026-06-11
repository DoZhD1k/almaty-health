import { RecommendationsEngine } from "@/components/recommendations-engine";

export default function RecommendationsPage() {
  return (
    <div className="min-h-screen bg-background">
<<<<<<< HEAD
      <main className="px-2 py-3 sm:mx-4 sm:px-4 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Рекомендации
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
=======
      <main className="mx-4 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Рекомендации
          </h1>
          <p className="text-muted-foreground">
>>>>>>> gitlab/main
            Рекомендации по маршрутизации пациентов
          </p>
        </div>
        <RecommendationsEngine />
      </main>
    </div>
  );
}
