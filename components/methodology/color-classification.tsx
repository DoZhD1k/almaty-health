import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Palette, AlertTriangle } from "lucide-react"

const colorClassification = [
  {
    color: "bg-gray-500",
    name: "Серый (Grey)",
    range: "< 60%",
    status: "Низкая загруженность",
    description: "Медицинская организация работает с низкой нагрузкой, есть значительный резерв коек",
    actions: "Возможно перенаправление пациентов из перегруженных МО",
    risk: "Низкий",
  },
  {
    color: "bg-green-500",
    name: "Зеленый (Green)",
    range: "60-80%",
    status: "Оптимальная загруженность",
    description: "Нормальный режим работы, эффективное использование коечного фонда",
    actions: "Продолжение работы в штатном режиме",
    risk: "Отсутствует",
  },
  {
    color: "bg-yellow-500",
    name: "Желтый (Yellow)",
    range: "80-90%",
    status: "Высокая загруженность",
    description: "Повышенная нагрузка, требуется внимание к планированию выписок",
    actions: "Мониторинг ситуации, подготовка к возможному перенаправлению пациентов",
    risk: "Низкий",
  },
  {
    color: "bg-orange-500",
    name: "Оранжевый (Orange)",
    range: "90-100%",
    status: "Критическая загруженность",
    description: "Высокий риск перегрузки, все койки практически заняты",
    actions: "Активное планирование выписок, подготовка дополнительных мест",
    risk: "Средний",
  },
  {
    color: "bg-red-500",
    name: "Красный (Red)",
    range: "100-110%",
    status: "Перегрузка",
    description: "Превышение штатной коечной мощности, использование дополнительных коек",
    actions: "Немедленное перенаправление новых пациентов, ускорение выписок",
    risk: "Высокий",
  },
  {
    color: "bg-red-800",
    name: "Бордовый (Bordo)",
    range: "> 110%",
    status: "Критическая перегрузка",
    description: "Критическое превышение мощности, угроза качеству медицинской помощи",
    actions: "Экстренные меры: массовое перенаправление, привлечение дополнительного персонала",
    risk: "Критический",
  },
]

const getRiskColor = (risk: string) => {
  switch (risk) {
    case "Критический":
      return "text-red-800 font-bold"
    case "Высокий":
      return "text-red-600 font-semibold"
    case "Средний":
      return "text-orange-600"
    case "Низкий":
      return "text-yellow-600"
    case "Отсутствует":
      return "text-green-600"
    default:
      return "text-gray-600"
  }
}

export function ColorClassification() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Цветовая классификация загруженности
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Система использует шестиуровневую цветовую схему для визуального отображения уровня загруженности
            медицинских организаций.
          </p>

          <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Важно</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Цветовая классификация основана на международных стандартах управления коечным фондом и адаптирована
                  для условий системы здравоохранения Казахстана.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {colorClassification.map((item, index) => (
          <Card key={index} className="border-l-4" style={{ borderLeftColor: item.color.replace("bg-", "") }}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${item.color}`} />
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">{item.range}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{item.status}</div>
                  <div className={`text-sm ${getRiskColor(item.risk)}`}>Риск: {item.risk}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm mb-1">Описание:</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-1">Рекомендуемые действия:</h4>
                <p className="text-sm text-muted-foreground">{item.actions}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Дополнительные индикаторы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Мигающие индикаторы</h4>
            <p className="text-sm text-muted-foreground">
              При критических ситуациях (загруженность &gt; 110%) маркеры на карте мигают для привлечения внимания
              оператора.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Размер маркеров</h4>
            <p className="text-sm text-muted-foreground">
              Размер маркеров на карте пропорционален коечной мощности медицинской организации:
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>Малые (&lt; 100 коек) - стандартный размер</li>
              <li>Средние (100-300 коек) - увеличенный размер</li>
              <li>Крупные (&gt; 300 коек) - максимальный размер</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
