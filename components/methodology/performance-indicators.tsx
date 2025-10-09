import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  TrendingUp,
  Users,
  Bed,
  Clock,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import { BlockMath, InlineMath } from "@/components/ui/math-formula";

const indicatorCategories = [
  {
    category: "Структурные показатели",
    description: "Характеризуют ресурсную базу медицинских организаций",
    icon: <Bed className="h-5 w-5" />,
    color: "bg-blue-500",
    indicators: [
      {
        name: "Коечная мощность",
        formula: "K = \\sum_{i=1}^{n} K_i",
        description:
          "Общее количество лицензированных коек в медицинской организации",
        unit: "койки",
        benchmark: "По нормативам МЗ РК",
        frequency: "Статическая",
      },
      {
        name: "Структура коечного фонда",
        formula: "S_i = \\frac{K_i}{K} \\times 100\\%",
        description: "Процентное распределение коек по медицинским профилям",
        unit: "%",
        benchmark: "Региональные нормативы",
        frequency: "Ежемесячно",
      },
      {
        name: "Обеспеченность медицинскими кадрами",
        formula: "P = \\frac{D}{K} \\times 1000",
        description: "Количество врачей на 1000 коек",
        unit: "врачей на 1000 коек",
        benchmark: "≥ 50 врачей на 1000 коек",
        frequency: "Ежемесячно",
      },
    ],
  },
  {
    category: "Процессные показатели",
    description: "Отражают интенсивность и качество лечебного процесса",
    icon: <Activity className="h-5 w-5" />,
    color: "bg-green-500",
    indicators: [
      {
        name: "Оборот койки",
        formula: "O = \\frac{N_{выписка}}{\\bar{K}}",
        description: "Количество пациентов, пролеченных на одной койке за год",
        unit: "раз в год",
        benchmark: "20-35 для многопрофильных стационаров",
        frequency: "Ежемесячно",
      },
      {
        name: "Средняя длительность пребывания",
        formula: "\\bar{d} = \\frac{\\sum_{i=1}^{n} d_i}{n}",
        description: "Среднее количество дней пребывания пациента в стационаре",
        unit: "дни",
        benchmark: "6-12 дней в зависимости от профиля",
        frequency: "Ежедневно",
      },
      {
        name: "Функция койки",
        formula: "F = O \\times \\bar{d}",
        description: "Количество койко-дней, отработанных одной койкой за год",
        unit: "койко-дни",
        benchmark: "300-340 койко-дней",
        frequency: "Ежемесячно",
      },
    ],
  },
  {
    category: "Показатели загруженности",
    description: "Характеризуют степень использования коечного фонда",
    icon: <TrendingUp className="h-5 w-5" />,
    color: "bg-orange-500",
    indicators: [
      {
        name: "Загруженность коек",
        formula: "Z = \\frac{K_{занято}}{K_{всего}} \\times 100\\%",
        description: "Процент занятых коек от общей коечной мощности",
        unit: "%",
        benchmark: "80-95% оптимальный диапазон",
        frequency: "В реальном времени",
      },
      {
        name: "Динамический коэффициент загруженности",
        formula: "Z_d(t) = \\frac{1}{T} \\int_{0}^{T} Z(t) dt",
        description: "Средневзвешенная загруженность с учетом времени",
        unit: "%",
        benchmark: "85-90% для круглосуточных отделений",
        frequency: "Ежечасно",
      },
      {
        name: "Пиковая загруженность",
        formula: "Z_{max} = \\max_{t \\in [0,T]} Z(t)",
        description: "Максимальная загруженность в течение периода наблюдения",
        unit: "%",
        benchmark: "≤ 110% во избежание перегрузки",
        frequency: "Ежедневно",
      },
    ],
  },
  {
    category: "Показатели качества",
    description: "Характеризуют результативность медицинской помощи",
    icon: <Target className="h-5 w-5" />,
    color: "bg-purple-500",
    indicators: [
      {
        name: "Летальность",
        formula: "L = \\frac{N_{летальные}}{N_{выписка}} \\times 100\\%",
        description: "Доля летальных исходов среди выписанных пациентов",
        unit: "%",
        benchmark: "Зависит от профиля отделения",
        frequency: "Ежемесячно",
      },
      {
        name: "Повторные госпитализации",
        formula: "R = \\frac{N_{повторные}}{N_{всего}} \\times 100\\%",
        description: "Доля повторных госпитализаций в течение 30 дней",
        unit: "%",
        benchmark: "< 10% для плановых вмешательств",
        frequency: "Ежемесячно",
      },
      {
        name: "Соответствие показаний",
        formula: "C = \\frac{N_{обоснованные}}{N_{всего}} \\times 100\\%",
        description: "Доля госпитализаций с обоснованными показаниями",
        unit: "%",
        benchmark: "> 95%",
        frequency: "По результатам экспертизы",
      },
    ],
  },
];

const compositeIndices = [
  {
    name: "Интегральный индекс эффективности",
    formula:
      "I_{эфф} = \\alpha \\cdot Z_{норм} + \\beta \\cdot O_{норм} + \\gamma \\cdot Q_{норм}",
    description: "Комплексная оценка эффективности использования ресурсов МО",
    components: [
      "Нормализованная загруженность коек (α = 0.4)",
      "Нормализованный оборот койки (β = 0.3)",
      "Нормализованные показатели качества (γ = 0.3)",
    ],
    interpretation:
      "0.8-1.0 - высокая эффективность, 0.6-0.8 - средняя, < 0.6 - низкая",
  },
  {
    name: "Индекс доступности медицинской помощи",
    formula:
      "I_{дост} = w_1 \\cdot \\frac{K_{свободно}}{K_{всего}} + w_2 \\cdot \\frac{1}{T_{ожидания}} + w_3 \\cdot \\frac{1}{D_{расстояние}}",
    description: "Оценка доступности медицинской помощи для населения",
    components: [
      "Доля свободных коек (w₁ = 0.5)",
      "Обратное время ожидания (w₂ = 0.3)",
      "Обратное расстояние до МО (w₃ = 0.2)",
    ],
    interpretation: "Чем выше значение, тем доступнее медицинская помощь",
  },
  {
    name: "Индекс риска перегрузки",
    formula:
      "I_{риск} = \\frac{Z_{текущая} + \\lambda \\cdot \\frac{dZ}{dt}}{Z_{критическая}}",
    description: "Прогнозная оценка вероятности критической перегрузки",
    components: [
      "Текущая загруженность",
      "Скорость изменения загруженности (λ - коэффициент временного лага)",
      "Критический порог загруженности (обычно 105%)",
    ],
    interpretation:
      "< 0.8 - низкий риск, 0.8-1.0 - средний риск, > 1.0 - высокий риск",
  },
];

const getBadgeColor = (category: string) => {
  switch (category) {
    case "Структурные показатели":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "Процессные показатели":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Показатели загруженности":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    case "Показатели качества":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

export function PerformanceIndicators() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Система показателей мониторинга
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Система мониторинга использует комплексный набор показателей,
            классифицированных по четырем основным категориям. Каждый показатель
            имеет четкое математическое определение, единицы измерения и
            эталонные значения для сравнительного анализа.
          </p>
        </CardContent>
      </Card>

      {indicatorCategories.map((category, categoryIndex) => (
        <Card key={categoryIndex}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className={`p-2 ${category.color} text-white rounded-lg`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl">{category.category}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  {category.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {category.indicators.map((indicator, indicatorIndex) => (
              <div
                key={indicatorIndex}
                className="border rounded-lg p-4 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-lg">{indicator.name}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {indicator.description}
                    </p>
                  </div>
                  <Badge className={getBadgeColor(category.category)}>
                    {indicator.unit}
                  </Badge>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h5 className="font-semibold mb-2">
                    Математическая формула:
                  </h5>
                  <div className="bg-background rounded px-3 py-2 border text-center">
                    <BlockMath>{indicator.formula}</BlockMath>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">
                      Эталонное значение:
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {indicator.benchmark}
                    </p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">
                      Частота обновления:
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {indicator.frequency}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Композитные индексы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Для комплексной оценки состояния медицинских организаций
            используются композитные индексы, объединяющие несколько базовых
            показателей в единую метрику.
          </p>

          <div className="space-y-6">
            {compositeIndices.map((index, indexIndex) => (
              <div key={indexIndex} className="border rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-lg">{index.name}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {index.description}
                  </p>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h5 className="font-semibold mb-2">Формула расчета:</h5>
                  <div className="bg-background rounded px-3 py-2 border text-center">
                    <BlockMath>{index.formula}</BlockMath>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-semibold text-sm mb-2">Компоненты:</h5>
                    <ul className="space-y-1">
                      {index.components.map((component, componentIndex) => (
                        <li
                          key={componentIndex}
                          className="text-sm flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          {component}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-3">
                    <h5 className="font-semibold text-sm mb-1">
                      Интерпретация:
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {index.interpretation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Система весовых коэффициентов</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            При расчете композитных индексов используется система весовых
            коэффициентов, основанная на экспертных оценках и международном
            опыте.
          </p>

          <div className="bg-muted/20 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Принципы назначения весов:</h4>
            <ul className="space-y-2">
              <li className="text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <strong>Клиническая значимость:</strong> Показатели, напрямую
                связанные с качеством медицинской помощи, имеют больший вес
              </li>
              <li className="text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <strong>Оперативная важность:</strong> Показатели для принятия
                срочных решений получают повышенный коэффициент
              </li>
              <li className="text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <strong>Достоверность данных:</strong> Показатели с более
                надежными источниками данных имеют больший вес
              </li>
              <li className="text-sm flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <strong>Нормализация:</strong> Сумма всех весовых коэффициентов
                в индексе равна 1.0
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
