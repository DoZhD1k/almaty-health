import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator, TrendingUp, Users, Bed } from "lucide-react"

const formulas = [
  {
    name: "Загруженность коек (%)",
    formula: "(Количество занятых коек / Общее количество коек) × 100",
    example: "(189 / 180) × 100 = 105%",
    description: "Основной показатель загруженности медицинской организации",
    interpretation: "Значения >100% указывают на перегрузку (использование дополнительных коек)",
    icon: <Bed className="h-5 w-5" />,
  },
  {
    name: "Средняя длительность пребывания (дни)",
    formula: "Койко-дни / Количество выписанных пациентов",
    example: "2,450 / 380 = 6.4 дня",
    description: "Показатель эффективности использования коечного фонда",
    interpretation: "Более высокие значения могут указывать на неэффективность или тяжесть случаев",
    icon: <Calculator className="h-5 w-5" />,
  },
  {
    name: "Оборот койки (раз в год)",
    formula: "Количество выписанных пациентов / Среднее количество коек",
    example: "4,560 / 180 = 25.3 раза",
    description: "Интенсивность использования коечного фонда",
    interpretation: "Высокие значения указывают на интенсивное использование коек",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    name: "Коэффициент летальности (%)",
    formula: "(Количество летальных исходов / Количество выписанных) × 100",
    example: "(15 / 380) × 100 = 3.9%",
    description: "Показатель качества медицинской помощи",
    interpretation: "Требует анализа с учетом профиля и тяжести пациентов",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Доля сельских жителей (%)",
    formula: "(Пациенты из сельской местности / Общее количество пациентов) × 100",
    example: "(35 / 100) × 100 = 35%",
    description: "Показатель доступности медицинской помощи для сельского населения",
    interpretation: "Высокие значения могут указывать на недостаток медицинских услуг в сельской местности",
    icon: <Users className="h-5 w-5" />,
  },
  {
    name: "Индекс загруженности по времени",
    formula: "Σ(Загруженность_i × Время_i) / Общее время",
    example: "(85% × 12ч + 95% × 8ч + 75% × 4ч) / 24ч = 86.7%",
    description: "Взвешенная по времени загруженность с учетом пиковых часов",
    interpretation: "Более точный показатель реальной нагрузки на медицинскую организацию",
    icon: <Calculator className="h-5 w-5" />,
  },
]

export function CalculationFormulas() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Формулы расчета показателей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Все показатели системы рассчитываются по стандартизированным формулам, обеспечивающим сопоставимость данных
            между медицинскими организациями.
          </p>
        </CardContent>
      </Card>

      {formulas.map((formula, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">{formula.icon}</div>
              <div className="flex-1">
                <CardTitle className="text-lg">{formula.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{formula.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Формула:</h4>
              <code className="text-sm font-mono bg-background px-2 py-1 rounded">{formula.formula}</code>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">Пример расчета:</h4>
              <code className="text-sm font-mono">{formula.example}</code>
            </div>

            <div>
              <h4 className="font-semibold text-sm mb-2">Интерпретация:</h4>
              <p className="text-sm text-muted-foreground">{formula.interpretation}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Дополнительные расчеты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Прогнозирование загруженности</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Система использует модель временных рядов ARIMA для краткосрочного прогнозирования:
            </p>
            <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded block">
              Прогноз(t+1) = α × Загруженность(t) + β × Тренд(t) + γ × Сезонность(t) + ε
            </code>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Расчет рекомендаций по маршрутизации</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Оптимальная медицинская организация выбирается по комплексному индексу:
            </p>
            <code className="text-xs font-mono bg-muted/50 px-2 py-1 rounded block">
              Индекс = w1×(100-Загруженность) + w2×(1/Расстояние) + w3×Соответствие_профиля
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
