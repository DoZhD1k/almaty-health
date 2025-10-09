"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Activity,
  TrendingUp,
  Menu,
  X,
  BarChart3,
  BookOpen,
} from "lucide-react";

const navigation = [
  {
    name: "Карта стационаров",
    href: "/",
    icon: Activity,
  },
  {
    name: "Аналитика",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/") {
      return pathname === href;
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="top-0 z-50 flex flex-col gap-2">
      <nav className="relative mx-auto flex w-screen items-center justify-between bg-white px-4 py-3 shadow-lg sm:px-6">
        <div className="flex gap-3 justify-end">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4169E1] text-white shadow-lg transition-transform duration-300 group-hover:scale-105 group-hover:bg-[#5B7FED]">
              <Activity className="h-5 w-5" />
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-lg font-semibold text-[#4169E1]">
                Мониторинг госпитализаций и коечной мощности
              </span>
            </div>
            <span className="text-base font-semibold text-[#4169E1] sm:hidden">
              MedMonitor
            </span>
          </Link>
        </div>
        <div className="flex justify-between px-3">
          <div className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                    active
                      ? "bg-[#4169E1] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon
                    className={cn(
                      "relative z-10 h-4 w-4 transition-transform duration-300",
                      active ? "scale-105" : "group-hover:scale-110"
                    )}
                  />
                  <span className="relative z-10 whitespace-nowrap">
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Кнопка методологии */}
            <Dialog open={methodologyOpen} onOpenChange={setMethodologyOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="group relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-300 hover:bg-gray-100"
                >
                  <BookOpen className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                  <span className="relative z-10 whitespace-nowrap">
                    Методология
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5" />
                    Методология расчётов
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6 text-sm leading-relaxed">
                  <div>
                    <p className="text-gray-700">
                      Данный раздел поясняет принципы расчётов и визуализации
                      показателей, представленных на карте стационаров и в
                      аналитических вкладках.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Расчёт загруженности стационаров
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="font-mono text-center text-gray-800">
                        Загруженность = (Койко-дни / (Развернутые койки ×
                        Количество дней периода)) × 100%
                      </p>
                    </div>
                    <p className="text-gray-700 mb-2">
                      Количество дней периода = 8 месяцев × 30 дней = 240 дней.
                    </p>
                    <p className="text-gray-700 mb-3">
                      Для каждого стационара рассчитывается свой коэффициент.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Уровни загруженности:
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span>
                            <strong>Низкая:</strong> &lt; 50%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          <span>
                            <strong>Нормальная:</strong> 50–80%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                          <span>
                            <strong>Высокая:</strong> 80–95%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-600"></div>
                          <span>
                            <strong>Критическая:</strong> &gt; 95%
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Аналитика по видам стационаров
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Во вкладке «Аналитика» предусмотрено сравнение:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Государственных и частных стационаров</li>
                      <li>
                        Показателей по пациентам из других регионов
                        (иногородним)
                      </li>
                      <li>Динамики смертности</li>
                    </ul>

                    <div className="bg-gray-50 p-4 rounded-lg mt-3">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Расчёт смертности:
                      </h4>
                      <p className="font-mono text-center text-gray-800">
                        Смертность = (Умерло / Выписано всего) × 100%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Скорая помощь и ВТМП
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>СМП</strong> – экстренные госпитализации по
                        линии скорой медицинской помощи
                      </li>
                      <li>
                        <strong>ВТМП</strong> – высокотехнологичная медицинская
                        помощь
                      </li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                      Система анализирует корреляцию между долей таких случаев и
                      общими показателями загруженности/исходов лечения.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Мобильная доступность по дорогам
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Для оценки транспортной доступности медицинских
                      организаций использовалась модель расчёта времени доезда
                      без учёта дорожных заторов (пробок).
                    </p>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Окраска карты соответствует временным интервалам:
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>
                            <strong>Зелёный</strong> – до 10 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span>
                            <strong>Жёлтый</strong> – до 15 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span>
                            <strong>Оранжевый</strong> – до 30 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>
                            <strong>Красный</strong> – до 60 минут
                          </span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-gray-700 mt-3">
                      Таким образом, каждый район города и его улично-дорожная
                      сеть окрашены в зависимости от времени, необходимого для
                      доезда до ближайшего стационара.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Простой коек
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Показатель отражает долю дней, когда развернутые койки не
                      использовались:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-mono text-center text-gray-800">
                        Простой коек = ((Развернутые койки × Дни периода) -
                        Койко-дни) / (Развернутые койки × Дни периода) × 100%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Аналитика по районам
                    </h3>
                    <p className="text-gray-700 mb-2">
                      В разрезе каждого района города проводится:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Сравнение уровня доступности стационаров</li>
                      <li>Анализ нагрузки на койки</li>
                      <li>
                        Выявление «красных зон» с критической загруженностью
                      </li>
                      <li>
                        Баланс между государственными и частными организациями
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Визуализация
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Цветовая кодировка (зелёный/жёлтый/оранжевый/красный)
                      применяется как для доступности, так и для уровней
                      загруженности.
                    </p>
                    <p className="text-gray-700">
                      Подсказки на карте отображают ключевую информацию: профиль
                      МО, количество коек, текущая загрузка, тип стационара.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="inline-flex h-10 w-10 shrink-0 rounded-full bg-gray-100 text-gray-700 shadow-sm hover:bg-gray-200 md:hidden"
              aria-expanded={mobileMenuOpen}
              aria-label="Открыть меню навигации"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="mx-4 mt-2 rounded-3xl border border-gray-200 bg-white p-4 shadow-lg md:hidden">
          <div className="space-y-2">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium transition-all duration-200",
                    active
                      ? "bg-[#4169E1] text-white shadow-lg"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      active ? "bg-white/20" : "bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Кнопка методологии в мобильном меню */}
            <Dialog open={methodologyOpen} onOpenChange={setMethodologyOpen}>
              <DialogTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                    <BookOpen className="h-5 w-5" />
                  </span>
                  <span>Методология</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <BookOpen className="h-5 w-5" />
                    Методология расчётов
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-6 text-sm leading-relaxed">
                  <div>
                    <p className="text-gray-700">
                      Данный раздел поясняет принципы расчётов и визуализации
                      показателей, представленных на карте стационаров и в
                      аналитических вкладках.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Расчёт загруженности стационаров
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg mb-3">
                      <p className="font-mono text-center text-gray-800">
                        Загруженность = (Койко-дни / (Развернутые койки ×
                        Количество дней периода)) × 100%
                      </p>
                    </div>
                    <p className="text-gray-700 mb-2">
                      Количество дней периода = 8 месяцев × 30 дней = 240 дней.
                    </p>
                    <p className="text-gray-700 mb-3">
                      Для каждого стационара рассчитывается свой коэффициент.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Уровни загруженности:
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                          <span>
                            <strong>Низкая:</strong> &lt; 50%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-600"></div>
                          <span>
                            <strong>Нормальная:</strong> 50–80%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-600"></div>
                          <span>
                            <strong>Высокая:</strong> 80–95%
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-600"></div>
                          <span>
                            <strong>Критическая:</strong> &gt; 95%
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Аналитика по видам стационаров
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Во вкладке «Аналитика» предусмотрено сравнение:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Государственных и частных стационаров</li>
                      <li>
                        Показателей по пациентам из других регионов
                        (иногородним)
                      </li>
                      <li>Динамики смертности</li>
                    </ul>

                    <div className="bg-gray-50 p-4 rounded-lg mt-3">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Расчёт смертности:
                      </h4>
                      <p className="font-mono text-center text-gray-800">
                        Смертность = (Умерло / Выписано всего) × 100%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Скорая помощь и ВТМП
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>
                        <strong>СМП</strong> – экстренные госпитализации по
                        линии скорой медицинской помощи
                      </li>
                      <li>
                        <strong>ВТМП</strong> – высокотехнологичная медицинская
                        помощь
                      </li>
                    </ul>
                    <p className="text-gray-700 mt-2">
                      Система анализирует корреляцию между долей таких случаев и
                      общими показателями загруженности/исходов лечения.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Мобильная доступность по дорогам
                    </h3>
                    <p className="text-gray-700 mb-3">
                      Для оценки транспортной доступности медицинских
                      организаций использовалась модель расчёта времени доезда
                      без учёта дорожных заторов (пробок).
                    </p>

                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Окраска карты соответствует временным интервалам:
                      </h4>
                      <ul className="space-y-1 text-gray-700">
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span>
                            <strong>Зелёный</strong> – до 10 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <span>
                            <strong>Жёлтый</strong> – до 15 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span>
                            <strong>Оранжевый</strong> – до 30 минут
                          </span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <span>
                            <strong>Красный</strong> – до 60 минут
                          </span>
                        </li>
                      </ul>
                    </div>

                    <p className="text-gray-700 mt-3">
                      Таким образом, каждый район города и его улично-дорожная
                      сеть окрашены в зависимости от времени, необходимого для
                      доезда до ближайшего стационара.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Простой коек
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Показатель отражает долю дней, когда развернутые койки не
                      использовались:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-mono text-center text-gray-800">
                        Простой коек = ((Развернутые койки × Дни периода) -
                        Койко-дни) / (Развернутые койки × Дни периода) × 100%
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Аналитика по районам
                    </h3>
                    <p className="text-gray-700 mb-2">
                      В разрезе каждого района города проводится:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                      <li>Сравнение уровня доступности стационаров</li>
                      <li>Анализ нагрузки на койки</li>
                      <li>
                        Выявление «красных зон» с критической загруженностью
                      </li>
                      <li>
                        Баланс между государственными и частными организациями
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Визуализация
                    </h3>
                    <p className="text-gray-700 mb-2">
                      Цветовая кодировка (зелёный/жёлтый/оранжевый/красный)
                      применяется как для доступности, так и для уровней
                      загруженности.
                    </p>
                    <p className="text-gray-700">
                      Подсказки на карте отображают ключевую информацию: профиль
                      МО, количество коек, текущая загрузка, тип стационара.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </header>
  );
}
