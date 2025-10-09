import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Target, Users, Zap, Shield, TrendingUp } from "lucide-react";

const methodologyPrinciples = [
  {
    title: "Системный подход",
    description:
      "Комплексное рассмотрение всех компонентов системы здравоохранения в их взаимосвязи",
    icon: <Target className="h-5 w-5" />,
    details: [
      "Учет взаимосвязей между медицинскими организациями",
      "Анализ потоков пациентов между учреждениями",
      "Интеграция данных различных информационных систем",
      "Комплексная оценка ресурсного обеспечения",
    ],
  },
  {
    title: "Непрерывный мониторинг",
    description:
      "Постоянное отслеживание ключевых показателей в режиме реального времени",
    icon: <Zap className="h-5 w-5" />,
    details: [
      "Автоматизированный сбор данных 24/7",
      "Система раннего предупреждения о критических ситуациях",
      "Регулярное обновление аналитических моделей",
      "Оперативное реагирование на изменения",
    ],
  },
  {
    title: "Доказательность",
    description:
      "Использование научно обоснованных методов анализа и интерпретации данных",
    icon: <Shield className="h-5 w-5" />,
    details: [
      "Статистическая валидация всех показателей",
      "Применение международных стандартов качества",
      "Контроль достоверности исходных данных",
      "Документирование всех методологических решений",
    ],
  },
  {
    title: "Адаптивность",
    description:
      "Способность системы адаптироваться к изменяющимся условиям и требованиям",
    icon: <TrendingUp className="h-5 w-5" />,
    details: [
      "Гибкая настройка пороговых значений",
      "Возможность добавления новых показателей",
      "Адаптация к сезонным изменениям",
      "Учет специфики различных медицинских профилей",
    ],
  },
];

const analysisLevels = [
  {
    level: "Оперативный",
    timeframe: "Режим реального времени",
    focus: "Текущая ситуация",
    metrics: "Загруженность коек, поток пациентов, критические ситуации",
    users: "Операторы системы, дежурные службы",
  },
  {
    level: "Тактический",
    timeframe: "Дни - недели",
    focus: "Краткосрочные тренды",
    metrics:
      "Динамика показателей, прогнозы на 3-7 дней, эффективность мероприятий",
    users: "Руководители МО, департамент здравоохранения",
  },
  {
    level: "Стратегический",
    timeframe: "Месяцы - годы",
    focus: "Долгосрочные тренды",
    metrics: "Сезонные паттерны, планирование мощностей, оценка качества",
    users: "Руководство системы здравоохранения, планирующие органы",
  },
];

export function MethodologyBase() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Методологические основы системы мониторинга
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">
            Система мониторинга медицинских организаций г. Алматы построена на
            основе современных принципов управления здравоохранением и
            использует интегрированный подход к анализу данных. Методология
            включает стандартизированные процедуры сбора, обработки и
            интерпретации информации о состоянии медицинских организаций.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Основные принципы методологии</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {methodologyPrinciples.map((principle, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  {principle.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{principle.title}</h4>
                  <p className="text-muted-foreground">
                    {principle.description}
                  </p>
                </div>
              </div>

              <div className="ml-11">
                <h5 className="font-medium mb-2">Ключевые аспекты:</h5>
                <ul className="space-y-1">
                  {principle.details.map((detail, detailIndex) => (
                    <li
                      key={detailIndex}
                      className="text-sm flex items-start gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Уровни анализа данных</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Система обеспечивает многоуровневый анализ данных для поддержки
            принятия решений на различных управленческих уровнях.
          </p>

          <div className="space-y-4">
            {analysisLevels.map((level, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {level.level} уровень
                    </CardTitle>
                    <Badge variant="outline">{level.timeframe}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-semibold text-sm mb-1">
                        Фокус анализа:
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {level.focus}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-sm mb-1">
                        Целевые пользователи:
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {level.users}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-sm mb-1">
                      Ключевые метрики:
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      {level.metrics}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Концептуальная модель системы</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Входные данные (Input)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm">
                <strong>Структурные данные:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Коечная мощность по профилям</li>
                  <li>• Кадровое обеспечение</li>
                  <li>• Техническое оснащение</li>
                </ul>
              </div>
              <div className="text-sm">
                <strong>Процессные данные:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Госпитализации и выписки</li>
                  <li>• Длительность пребывания</li>
                  <li>• Исходы лечения</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 rounded-lg p-4">
            <h4 className="font-semibold mb-3">
              Обработка данных (Processing)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="text-sm">
                <strong>Валидация:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Проверка полноты</li>
                  <li>• Контроль качества</li>
                  <li>• Выявление аномалий</li>
                </ul>
              </div>
              <div className="text-sm">
                <strong>Расчеты:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Базовые показатели</li>
                  <li>• Производные метрики</li>
                  <li>• Интегральные индексы</li>
                </ul>
              </div>
              <div className="text-sm">
                <strong>Анализ:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Трендовый анализ</li>
                  <li>• Сравнительный анализ</li>
                  <li>• Прогнозирование</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Выходные данные (Output)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="text-sm">
                <strong>Визуализация:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Интерактивные карты</li>
                  <li>• Графики и диаграммы</li>
                  <li>• Панели мониторинга</li>
                </ul>
              </div>
              <div className="text-sm">
                <strong>Рекомендации:</strong>
                <ul className="text-muted-foreground mt-1 space-y-1">
                  <li>• Маршрутизация пациентов</li>
                  <li>• Предупреждения о рисках</li>
                  <li>• Оптимизация ресурсов</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
