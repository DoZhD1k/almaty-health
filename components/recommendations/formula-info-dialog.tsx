"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface FormulaInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FormulaInfoDialog({
  open,
  onOpenChange,
}: FormulaInfoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[90vh] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            📐 Формула Гаверсинусов (Haversine Formula)
          </DialogTitle>
          <DialogDescription>
            Точный математический метод расчета расстояний между географическими
            точками
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Почему эта формула */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Почему именно эта формула?
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Учитывает кривизну Земли</strong> — в отличие от
                    простой теоремы Пифагора, которая работает только на
                    плоскости
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Высокая точность</strong> — погрешность менее 0.5%
                    для расстояний до 1000 км
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>Оптимальна для городских расстояний</strong> —
                    идеально подходит для расчетов в пределах Алматы
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Математическая формула */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-lg">Математическая формула</h3>

              <div className="bg-muted p-4 rounded-lg font-mono text-sm space-y-2">
                <div className="text-center space-y-1">
                  <div>a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)</div>
                  <div>c = 2 × atan2(√a, √(1-a))</div>
                  <div className="text-lg font-bold text-primary">
                    d = R × c
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <h4 className="font-semibold text-base">Где:</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      φ
                    </Badge>
                    <span className="text-muted-foreground">
                      широта (latitude) в радианах
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      λ
                    </Badge>
                    <span className="text-muted-foreground">
                      долгота (longitude) в радианах
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      R
                    </Badge>
                    <span className="text-muted-foreground">
                      радиус Земли (6371 км)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      Δφ
                    </Badge>
                    <span className="text-muted-foreground">
                      разница широт (φ₂ - φ₁)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      Δλ
                    </Badge>
                    <span className="text-muted-foreground">
                      разница долгот (λ₂ - λ₁)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="font-mono">
                      d
                    </Badge>
                    <span className="text-muted-foreground">
                      итоговое расстояние в км
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Как работает расчет */}
          <Card>
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-lg">Как работает расчёт?</h3>
              <ol className="space-y-3 text-sm list-decimal list-inside">
                <li className="pl-2">
                  <strong>Преобразование координат:</strong>
                  <p className="mt-1 ml-6 text-muted-foreground">
                    Широта и долгота переводятся из градусов в радианы для
                    математических вычислений
                  </p>
                </li>
                <li className="pl-2">
                  <strong>Вычисление разницы координат:</strong>
                  <p className="mt-1 ml-6 text-muted-foreground">
                    Рассчитывается разница широт (Δφ) и долгот (Δλ) между двумя
                    точками
                  </p>
                </li>
                <li className="pl-2">
                  <strong>Применение тригонометрии:</strong>
                  <p className="mt-1 ml-6 text-muted-foreground">
                    Используются функции sin и cos для учёта кривизны
                    поверхности Земли
                  </p>
                </li>
                <li className="pl-2">
                  <strong>Расчёт центрального угла:</strong>
                  <p className="mt-1 ml-6 text-muted-foreground">
                    Вычисляется угол между двумя точками относительно центра
                    Земли (c)
                  </p>
                </li>
                <li className="pl-2">
                  <strong>Финальное расстояние:</strong>
                  <p className="mt-1 ml-6 text-muted-foreground">
                    Центральный угол умножается на радиус Земли (6371 км),
                    получаем расстояние в километрах
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          {/* Пример расчета */}
          <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                🔢 Пример расчёта для Алматы
              </h3>

              <div className="space-y-3 text-sm">
                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <div className="font-semibold mb-2">Дано:</div>
                  <div className="space-y-1 text-muted-foreground">
                    <div>МО #1: 43.2566°N, 76.9286°E</div>
                    <div>МО #2: 43.2200°N, 76.8512°E</div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 p-3 rounded border">
                  <div className="font-semibold mb-2">Расчёт:</div>
                  <div className="space-y-1 font-mono text-xs text-muted-foreground">
                    <div>
                      Δφ = 43.2200° - 43.2566° = -0.0366° → -0.000639 рад
                    </div>
                    <div>
                      Δλ = 76.8512° - 76.9286° = -0.0774° → -0.001351 рад
                    </div>
                    <div>
                      a = sin²(-0.000319) + cos(0.7542) × cos(0.7541) ×
                      sin²(-0.000675)
                    </div>
                    <div>a ≈ 0.0000129</div>
                    <div>c = 2 × atan2(√0.0000129, √0.9999871) ≈ 0.001129</div>
                  </div>
                </div>

                <div className="bg-primary/10 p-3 rounded border border-primary">
                  <div className="font-bold text-primary text-lg">
                    Результат: d = 6371 × 0.001129 ≈ 7.2 км
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Дополнительные расчёты */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-lg">
                Дополнительные параметры
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="font-semibold mb-1">
                    ⏱️ Расчёт времени в пути:
                  </div>
                  <div className="bg-muted p-3 rounded font-mono text-sm">
                    время = (расстояние / 40 км/ч) × 60 минут
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    Используется средняя скорость 40 км/ч для городских условий
                    с учётом светофоров и пробок
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ограничения */}
          <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Важные ограничения
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>
                    Расстояние рассчитывается{" "}
                    <strong>&quot;по прямой&quot;</strong>, без учёта реальных
                    дорог и маршрутов
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>
                    Время в пути <strong>приблизительное</strong> и может
                    отличаться от реального из-за трафика
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>
                    Для точных маршрутов рекомендуется использовать
                    навигационные приложения (2ГИС, Яндекс.Карты)
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
