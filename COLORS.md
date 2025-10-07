# Цветовая палитра проекта

Проект использует три основные цветовые палитры, определённые в `app/globals.css`.

## 🎨 Blue Palette (Set 1)

Основная синяя палитра для UI компонентов:

```css
/* Использование в Tailwind */
bg-[rgb(var(--blue-light))]        /* #ebf1ff - Light фон */
bg-[rgb(var(--blue-light-hover))]  /* #e1eaff - Light hover */
bg-[rgb(var(--blue-light-active))] /* #c1d3ff - Light active */
bg-[rgb(var(--blue-normal))]       /* #3772ff - Normal */
bg-[rgb(var(--blue-normal-hover))] /* #3267e6 - Normal hover */
bg-[rgb(var(--blue-normal-active))]/* #2c5bcc - Normal active */
bg-[rgb(var(--blue-dark))]         /* #2956bf - Dark */
bg-[rgb(var(--blue-dark-hover))]   /* #214499 - Dark hover */
bg-[rgb(var(--blue-dark-active))]  /* #193373 - Dark active */
bg-[rgb(var(--blue-darker))]       /* #132859 - Darker */
```

### Где используется:

- Карточки метрик (`key-metrics.tsx`)
- Фильтры (`analytics-filters.tsx`)
- Сводка (`quick-summary.tsx`)
- Графики (`combined-chart.tsx`)

## 🎨 Blue Palette (Set 2 – darker themed)

Тёмная синяя палитра для sidebar и тёмных элементов:

```css
bg-[rgb(var(--blue2-light))]        /* #eaebee */
bg-[rgb(var(--blue2-normal))]       /* #283353 */
bg-[rgb(var(--blue2-dark))]         /* #1e263e */
bg-[rgb(var(--blue2-darker))]       /* #0e121d */
```

### Где используется:

- Sidebar компоненты
- Тёмные UI элементы

## 🎨 Grey Palette

Серая палитра для нейтральных элементов:

```css
bg-[rgb(var(--grey-light))]         /* #e8e8e8 */
bg-[rgb(var(--grey-light-hover))]   /* #dddddd */
bg-[rgb(var(--grey-light-active))]  /* #b8b8b8 */
text-[rgb(var(--grey-normal))]      /* #1b1b1b */
text-[rgb(var(--grey-dark))]        /* #141414 */
text-[rgb(var(--grey-darker))]      /* #090909 */
```

### Где используется:

- Текст
- Границы
- Фоны нейтральных элементов

## Цвета графиков

### Recharts (combined-chart.tsx)

```javascript
// Линейные графики
adults: "#3772ff"; // Blue normal
children: "#2956bf"; // Blue dark
rural: "#214499"; // Blue dark-hover

// Area графики
normative: "#b8b8b8"; // Grey light-active
actual: "#3772ff"; // Blue normal
```

### ECharts (comparison-tab.tsx)

```javascript
// Pie chart
colors: ["#3772ff", "#2956bf", "#214499", "#193373"];

// Horizontal bar
color: "#3772ff"; // Blue normal
```

## Примеры использования

### Background цвета

```jsx
// Светлый фон
className = "bg-[rgb(var(--blue-light))]";

// Нормальный фон
className = "bg-[rgb(var(--blue-normal))]";

// Тёмный фон
className = "bg-[rgb(var(--blue-dark))]";
```

### Text цвета

```jsx
// Основной текст
className = "text-[rgb(var(--grey-normal))]";

// Синий текст
className = "text-[rgb(var(--blue-normal))]";

// Тёмный синий текст
className = "text-[rgb(var(--blue-dark))]";
```

### Border цвета

```jsx
// Светлая граница
className = "border border-[rgb(var(--blue-light-active))]";

// Синяя левая граница
className = "border-l-4 border-l-[rgb(var(--blue-normal))]";
```

### Gradients

```jsx
// Градиент из светлых синих
className =
  "bg-gradient-to-r from-[rgb(var(--blue-light))] to-[rgb(var(--blue-light-hover))]";
```

## Состояния загруженности (Load Status)

Для индикации уровня загруженности коек используются специальные цвета:

```css
--color-load-low         /* Низкая < 50% */
--color-load-optimal     /* Оптимальная 50-80% */
--color-load-high        /* Высокая 80-95% */
--color-load-critical    /* Критическая > 95% */
```

Эти цвета используются в компонентах отображения статистики загруженности медицинских учреждений.
