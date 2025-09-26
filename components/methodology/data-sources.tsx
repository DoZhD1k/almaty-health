import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Database, FileText, Clock, Users } from "lucide-react"

const dataSources = [
  {
    name: "Официальная статистическая отчетность",
    type: "primary",
    description: "Ежедневные отчеты медицинских организаций о загруженности коек",
    frequency: "Ежедневно в 08:00 и 20:00",
    reliability: "Высокая",
    coverage: "100% государственных МО",
    fields: [
      "Количество коек по профилям",
      "Количество занятых коек",
      "Количество госпитализаций",
      "Количество выписанных пациентов",
      "Летальные исходы",
    ],
  },
  {
    name: "База данных 2GIS",
    type: "reference",
    description: "Географические координаты и контактная информация медицинских организаций",
    frequency: "Обновление по запросу",
    reliability: "Средняя",
    coverage: "95% всех МО",
    fields: ["Адреса медицинских организаций", "Географические координаты", "Контактная информация", "Режим работы"],
  },
  {
    name: "Реестр медицинских организаций",
    type: "reference",
    description: "Официальный реестр лицензированных медицинских организаций",
    frequency: "Ежемесячно",
    reliability: "Высокая",
    coverage: "100% лицензированных МО",
    fields: [
      "Тип медицинской организации",
      "Профиль деятельности",
      "Лицензированная коечная мощность",
      "Форма собственности",
    ],
  },
  {
    name: "Система вызовов скорой помощи",
    type: "operational",
    description: "Данные о вызовах и госпитализациях через СМП",
    frequency: "В режиме реального времени",
    reliability: "Высокая",
    coverage: "100% вызовов СМП",
    fields: [
      "Количество вызовов по районам",
      "Время доставки пациентов",
      "Профиль госпитализации",
      "Отказы в госпитализации",
    ],
  },
]

const getTypeColor = (type: string) => {
  switch (type) {
    case "primary":
      return "bg-green-500 text-white"
    case "reference":
      return "bg-blue-500 text-white"
    case "operational":
      return "bg-purple-500 text-white"
    default:
      return "bg-gray-500 text-white"
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "primary":
      return "Основной"
    case "reference":
      return "Справочный"
    case "operational":
      return "Оперативный"
    default:
      return "Неизвестно"
  }
}

const getReliabilityColor = (reliability: string) => {
  switch (reliability) {
    case "Высокая":
      return "text-green-600"
    case "Средняя":
      return "text-yellow-600"
    case "Низкая":
      return "text-red-600"
    default:
      return "text-gray-600"
  }
}

export function DataSources() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Источники данных системы мониторинга
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Система использует данные из четырех основных источников для обеспечения полноты и достоверности информации.
          </p>
        </CardContent>
      </Card>

      {dataSources.map((source, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{source.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{source.description}</p>
              </div>
              <Badge className={getTypeColor(source.type)}>{getTypeLabel(source.type)}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Частота обновления</div>
                  <div className="text-xs text-muted-foreground">{source.frequency}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Надежность</div>
                  <div className={`text-xs font-semibold ${getReliabilityColor(source.reliability)}`}>
                    {source.reliability}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Покрытие</div>
                  <div className="text-xs text-muted-foreground">{source.coverage}</div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold mb-2">Поля данных:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {source.fields.map((field, fieldIndex) => (
                  <li key={fieldIndex} className="text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {field}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
