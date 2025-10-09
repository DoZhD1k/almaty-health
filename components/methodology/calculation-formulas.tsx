import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Users, Bed } from "lucide-react";
import { BlockMath, InlineMath } from "@/components/ui/math-formula";

const formulas = [
  {
    name: "Тест формулы",
    formula: "E = mc^2",
    textFormula: "E равно m умножить на c в квадрате",
    example: "E = 1 \\times 3^2 = 9",
    description: "Тестовая формула для проверки рендеринга",
    interpretation: "Простая тестовая формула",
    icon: <Calculator className="h-5 w-5" />,
    variables: [
      { symbol: "E", description: "Энергия" },
      { symbol: "m", description: "Масса" },
      { symbol: "c", description: "Скорость света" },
    ],
  },
  {
    name: "Загруженность коек (%)",
    formula: "Z = \\frac{K_{\\text{занято}}}{K_{\\text{всего}}} \\times 100\\%",
    textFormula: "(Количество занятых коек / Общее количество коек) × 100",
    example: "Z = \\frac{189}{180} \\times 100\\% = 105\\%",
    description: "Основной показатель загруженности медицинской организации",
    interpretation:
      "Значения >100% указывают на перегрузку (использование дополнительных коек)",
    icon: <Bed className="h-5 w-5" />,
    variables: [
      {
        symbol: "K_{\\text{занято}}",
        description: "Количество занятых коек на момент измерения",
      },
      {
        symbol: "K_{\\text{всего}}",
        description: "Общая коечная мощность медицинской организации",
      },
    ],
  },
  {
    name: "Средняя длительность пребывания (дни)",
    formula:
      "\\bar{d} = \\frac{\\sum_{i=1}^{n} d_i}{n} = \\frac{\\text{Койко-дни}}{N_{\\text{выписка}}}",
    textFormula: "Койко-дни / Количество выписанных пациентов",
    example: "\\bar{d} = \\frac{2450}{380} = 6.4 \\text{ дня}",
    description: "Показатель эффективности использования коечного фонда",
    interpretation:
      "Более высокие значения могут указывать на неэффективность или тяжесть случаев",
    icon: <Calculator className="h-5 w-5" />,
    variables: [
      { symbol: "d_i", description: "Длительность пребывания i-го пациента" },
      { symbol: "n", description: "Общее количество выписанных пациентов" },
      {
        symbol: "N_{\\text{выписка}}",
        description: "Количество выписанных пациентов за период",
      },
    ],
  },
  {
    name: "Оборот койки (раз в год)",
    formula:
      "O = \\frac{N_{\\text{выписка}}}{\\bar{K}} = \\frac{365}{\\bar{d} + \\bar{t}_{\\text{простой}}}",
    textFormula: "Количество выписанных пациентов / Среднее количество коек",
    example: "O = \\frac{4560}{180} = 25.3 \\text{ раза}",
    description: "Интенсивность использования коечного фонда",
    interpretation:
      "Высокие значения указывают на интенсивное использование коек",
    icon: <TrendingUp className="h-5 w-5" />,
    variables: [
      { symbol: "\\bar{K}", description: "Среднее количество коек за период" },
      {
        symbol: "\\bar{t}_{\\text{простой}}",
        description: "Среднее время простоя койки между пациентами",
      },
    ],
  },
  {
    name: "Коэффициент летальности (%)",
    formula:
      "L = \\frac{N_{\\text{летальные}}}{N_{\\text{всего}}} \\times 100\\%",
    textFormula: "(Количество летальных исходов / Количество выписанных) × 100",
    example: "L = \\frac{15}{380} \\times 100\\% = 3.9\\%",
    description: "Показатель качества медицинской помощи",
    interpretation: "Требует анализа с учетом профиля и тяжести пациентов",
    icon: <Users className="h-5 w-5" />,
    variables: [
      {
        symbol: "N_{\\text{летальные}}",
        description: "Количество летальных исходов за период",
      },
      {
        symbol: "N_{\\text{всего}}",
        description: "Общее количество пролеченных пациентов",
      },
    ],
  },
  {
    name: "Доля сельских жителей (%)",
    formula:
      "S = \\frac{N_{\\text{сельские}}}{N_{\\text{всего}}} \\times 100\\%",
    textFormula:
      "(Пациенты из сельской местности / Общее количество пациентов) × 100",
    example: "S = \\frac{35}{100} \\times 100\\% = 35\\%",
    description:
      "Показатель доступности медицинской помощи для сельского населения",
    interpretation:
      "Высокие значения могут указывать на недостаток медицинских услуг в сельской местности",
    icon: <Users className="h-5 w-5" />,
    variables: [
      {
        symbol: "N_{\\text{сельские}}",
        description: "Количество пациентов из сельской местности",
      },
      {
        symbol: "N_{\\text{всего}}",
        description: "Общее количество пациентов",
      },
    ],
  },
  {
    name: "Индекс загруженности по времени",
    formula:
      "I_t = \\frac{\\sum_{i=1}^{m} Z_i \\cdot t_i}{\\sum_{i=1}^{m} t_i} = \\frac{1}{T} \\int_0^T Z(t) dt",
    textFormula: "Σ(Загруженность_i × Время_i) / Общее время",
    example:
      "I_t = \\frac{85\\% \\times 12\\text{ч} + 95\\% \\times 8\\text{ч} + 75\\% \\times 4\\text{ч}}{24\\text{ч}} = 86.7\\%",
    description: "Взвешенная по времени загруженность с учетом пиковых часов",
    interpretation:
      "Более точный показатель реальной нагрузки на медицинскую организацию",
    icon: <Calculator className="h-5 w-5" />,
    variables: [
      { symbol: "Z_i", description: "Загруженность в i-м временном интервале" },
      {
        symbol: "t_i",
        description: "Продолжительность i-го временного интервала",
      },
      { symbol: "T", description: "Общий период наблюдения" },
    ],
  },
];

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
            Все показатели системы рассчитываются по стандартизированным
            формулам, обеспечивающим сопоставимость данных между медицинскими
            организациями.
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
                <p className="text-sm text-muted-foreground mt-1">
                  {formula.description}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">
                Математическая формула:
              </h4>
              <div className="text-center py-4 bg-background rounded border">
                <BlockMath>{formula.formula}</BlockMath>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Текстовое представление: {formula.textFormula}
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-3">Пример расчета:</h4>
              <div className="text-center py-2 bg-background rounded border">
                <BlockMath>{formula.example}</BlockMath>
              </div>
            </div>

            {formula.variables && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">
                  Обозначения переменных:
                </h4>
                <div className="space-y-2">
                  {formula.variables.map((variable, varIndex) => (
                    <div key={varIndex} className="flex items-start gap-3">
                      <span className="font-mono text-sm bg-background px-2 py-1 rounded border flex-shrink-0">
                        <InlineMath>{variable.symbol}</InlineMath>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {variable.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm mb-2">Интерпретация:</h4>
              <p className="text-sm text-muted-foreground">
                {formula.interpretation}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Дополнительные расчеты</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              Прогнозирование загруженности
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Система использует модель временных рядов ARIMA для краткосрочного
              прогнозирования:
            </p>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-center py-3 bg-background rounded border">
                <BlockMath>
                  {
                    "\\hat{Z}(t+h) = \\alpha \\cdot Z(t) + \\beta \\cdot \\Delta Z(t) + \\gamma \\cdot S(t) + \\varepsilon_t"
                  }
                </BlockMath>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                где прогноз загруженности на h периодов вперед
              </div>
            </div>
            <div className="mt-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2">Параметры модели:</h5>
              <ul className="text-sm space-y-1">
                <li>• α - коэффициент авторегрессии (0.6-0.8)</li>
                <li>• β - коэффициент тренда (0.2-0.4)</li>
                <li>• γ - коэффициент сезонности (0.1-0.3)</li>
                <li>• ε - случайная ошибка модели</li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              Расчет рекомендаций по маршрутизации
            </h4>
            <p className="text-sm text-muted-foreground mb-3">
              Оптимальная медицинская организация выбирается по комплексному
              индексу:
            </p>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="text-center py-3 bg-background rounded border">
                <BlockMath>
                  {
                    "I_{opt} = w_1 \\cdot \\frac{100 - Z}{100} + w_2 \\cdot \\frac{1}{1 + D} + w_3 \\cdot P + w_4 \\cdot Q"
                  }
                </BlockMath>
              </div>
            </div>
            <div className="mt-3 bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
              <h5 className="font-semibold text-sm mb-2">
                Компоненты индекса:
              </h5>
              <ul className="text-sm space-y-1">
                <li>
                  • <InlineMath>{"Z"}</InlineMath> - текущая загруженность
                  (0-120%)
                </li>
                <li>
                  • <InlineMath>{"D"}</InlineMath> - расстояние до МО (км)
                </li>
                <li>
                  • <InlineMath>{"P"}</InlineMath> - соответствие медицинского
                  профиля (0-1)
                </li>
                <li>
                  • <InlineMath>{"Q"}</InlineMath> - показатель качества МО
                  (0-1)
                </li>
                <li>
                  • <InlineMath>{"w_1, w_2, w_3, w_4"}</InlineMath> - весовые
                  коэффициенты
                </li>
              </ul>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              Статистические показатели качества
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-muted/30 rounded-lg p-3">
                <h5 className="font-semibold text-sm mb-2">
                  Коэффициент вариации:
                </h5>
                <div className="text-center py-2 bg-background rounded border">
                  <BlockMath>
                    {"CV = \\frac{\\sigma}{\\bar{x}} \\times 100\\%"}
                  </BlockMath>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Мера относительной изменчивости показателя
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-3">
                <h5 className="font-semibold text-sm mb-2">
                  Доверительный интервал:
                </h5>
                <div className="text-center py-2 bg-background rounded border">
                  <BlockMath>
                    {
                      "CI = \\bar{x} \\pm t_{\\alpha/2} \\cdot \\frac{s}{\\sqrt{n}}"
                    }
                  </BlockMath>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  95% доверительный интервал для среднего
                </p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              Показатели эффективности системы
            </h4>
            <div className="bg-muted/30 rounded-lg p-4">
              <h5 className="font-semibold text-sm mb-3">
                Интегральный показатель эффективности:
              </h5>
              <div className="text-center py-3 bg-background rounded border">
                <BlockMath>
                  {
                    "E = \\sqrt[3]{\\frac{Z_{цель}}{Z_{факт}} \\cdot \\frac{T_{цель}}{T_{факт}} \\cdot \\frac{Q_{факт}}{Q_{мин}}}"
                  }
                </BlockMath>
              </div>
              <div className="mt-3 text-xs text-muted-foreground">
                где E &gt; 1 означает превышение плановых показателей
                эффективности
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
