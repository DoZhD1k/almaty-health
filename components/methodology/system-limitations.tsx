import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Clock, Database, Users, TrendingDown } from "lucide-react"

const limitations = [
  {
    category: "Периодичность обновления данных",
    icon: <Clock className="h-5 w-5" />,
    items: [
      "Основные показатели обновляются 2 раза в сутки (08:00 и 20:00)",
      "Данные о вызовах СМП поступают с задержкой до 30 минут",
      "Информация о выписках может запаздывать на 2-4 часа",
      "Выходные и праздничные дни могут влиять на своевременность обновлений",
    ],
    impact: "Средний",
    mitigation: "Использование буферных значений и интерполяции для критических периодов",
  },
  {
    category: "Возможные расхождения в учете",
    icon: <Database className="h-5 w-5" />,
    items: [
      "Различия в методиках подсчета коек между МО",
      "Временные койки могут учитываться не во всех организациях",
      "Пациенты дневного стационара могут искажать статистику",
      "Переводы между отделениями могут дублироваться в отчетах",
    ],
    impact: "Высокий",
    mitigation: "Регулярная сверка данных с медицинскими организациями и стандартизация методик учета",
  },
  {
    category: "Ограничения прогнозирования",
    icon: <TrendingDown className="h-5 w-5" />,
    items: [
      "Прогнозы точны только на 3-7 дней вперед",
      "Не учитываются форс-мажорные обстоятельства",
      "Сезонные колебания могут быть неточными для новых заболеваний",
      "Влияние внешних факторов (эпидемии, ЧС) не моделируется",
    ],
    impact: "Средний",
    mitigation: "Использование доверительных интервалов и регулярная корректировка моделей",
  },
  {
    category: "Человеческий фактор",
    icon: <Users className="h-5 w-5" />,
    items: [
      "Ошибки при вводе данных медицинским персоналом",
      "Субъективная оценка тяжести состояния пациентов",
      "Различия в интерпретации критериев госпитализации",
      "Влияние загруженности персонала на качество данных",
    ],
    impact: "Средний",
    mitigation: "Автоматизация ввода данных и внедрение систем контроля качества",
  },
]

const getImpactColor = (impact: string) => {
  switch (impact) {
    case "Высокий":
      return "text-red-600 bg-red-50 dark:bg-red-950/20"
    case "Средний":
      return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20"
    case "Низкий":
      return "text-green-600 bg-green-50 dark:bg-green-950/20"
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-950/20"
  }
}

export function SystemLimitations() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Ограничения системы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Система мониторинга имеет ряд технических и методологических ограничений, которые необходимо учитывать при
            интерпретации данных и принятии решений.
          </p>

          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Важное предупреждение</AlertTitle>
            <AlertDescription>
              Данная система предназначена для информационной поддержки и не может заменить профессиональную медицинскую
              оценку ситуации. Все критические решения должны приниматься с учетом клинической картины и мнения
              медицинских специалистов.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {limitations.map((limitation, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-muted rounded-lg">{limitation.icon}</div>
              <div className="flex-1">
                <CardTitle className="text-lg">{limitation.category}</CardTitle>
                <div
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold mt-2 ${getImpactColor(limitation.impact)}`}
                >
                  Влияние: {limitation.impact}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Описание ограничений:</h4>
              <ul className="space-y-1">
                {limitation.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-sm flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3">
              <h4 className="font-semibold text-sm mb-1">Меры по снижению влияния:</h4>
              <p className="text-sm text-muted-foreground">{limitation.mitigation}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Рекомендации по использованию</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Для операторов системы:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Всегда проверяйте актуальность данных перед принятием решений</li>
              <li>• При критических ситуациях дублируйте информацию телефонными звонками</li>
              <li>• Учитывайте время последнего обновления данных</li>
              <li>• Сопоставляйте показатели с историческими данными</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Для руководителей МО:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Обеспечьте своевременную и точную передачу данных</li>
              <li>• Назначьте ответственных за ввод информации в систему</li>
              <li>• Регулярно сверяйте данные системы с внутренними отчетами</li>
              <li>• Информируйте о нестандартных ситуациях, влияющих на статистику</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Для аналитиков:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Используйте доверительные интервалы при анализе трендов</li>
              <li>• Учитывайте сезонные и календарные факторы</li>
              <li>• Проводите регулярную валидацию прогнозных моделей</li>
              <li>• Документируйте все предположения и ограничения в отчетах</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
