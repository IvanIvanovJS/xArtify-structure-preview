# UI Components

Този директорий съдържа reusable UI компоненти за подобряване на потребителското изживяване.

## Компоненти

### SkeletonLoader
Skeleton loader компонент за показване на placeholder съдържание докато се зареждат данните.

**Props:**
- `className?: string` - Допълнителни CSS класове
- `width?: string | number` - Ширина на skeleton-а
- `height?: string | number` - Височина на skeleton-а
- `variant?: "text" | "rectangular" | "circular"` - Тип на skeleton-а
- `lines?: number` - Брой редове за text variant
- `animation?: "pulse" | "wave" | "none"` - Тип анимация

**Пример:**
```tsx
<SkeletonLoader
    className="mb-4"
    height="2rem"
    width="60%"
    variant="text"
    lines={2}
    animation="pulse"
/>
```

### ImageSkeleton
Специализиран skeleton loader за изображения с blur ефект.

**Props:**
- `className?: string` - Допълнителни CSS класове
- `width?: string | number` - Ширина
- `height?: string | number` - Височина
- `aspectRatio?: "square" | "video" | "portrait" | "landscape" | "auto"` - Съотношение на страните

**Пример:**
```tsx
<ImageSkeleton
    className="w-full h-64"
    aspectRatio="video"
/>
```

### OptimizedImage
Оптимизиран Image компонент с blurry placeholder и error handling.

**Props:**
- `src: string` - URL на изображението
- `alt: string` - Alt текст
- `className?: string` - Допълнителни CSS класове
- `fill?: boolean` - Дали да запълни контейнера
- `width?: number` - Ширина (ако не е fill)
- `height?: number` - Височина (ако не е fill)
- `priority?: boolean` - Дали е приоритетно за зареждане
- `quality?: number` - Качество на изображението (1-100)
- `placeholder?: "blur" | "empty"` - Тип placeholder
- `blurDataURL?: string` - Custom blur placeholder
- `onLoad?: () => void` - Callback при зареждане
- `onError?: () => void` - Callback при грешка

**Пример:**
```tsx
<OptimizedImage
    src="/image.jpg"
    alt="Описание"
    fill
    priority={true}
    quality={85}
    placeholder="blur"
/>
```

## Хукове

### useHomeContent
SWR hook за кеширане и управление на home page контента.

**Връща:**
- `data` - Данните от API
- `error` - Грешка ако има
- `isLoading` - Дали се зарежда
- `isAdmin` - Дали потребителят е admin
- `updateContent` - Функция за обновяване на контента
- `mutate` - SWR mutate функция

**Пример:**
```tsx
const { data, isLoading, isAdmin, updateContent } = useHomeContent();

if (isLoading) {
    return <SkeletonLoader />;
}

return <div>{data?.title}</div>;
```

## SWR Конфигурация

SWR е конфигуриран глобално в `app/providers.tsx` с:
- 5-минутно кеширане
- Автоматично revalidate при връзка с интернет
- 3 опита при грешка
- Global error handling

## CSS Анимации

Добавени са custom CSS анимации за:
- `shimmer` - За skeleton loaders
- `pulse` - За image loading states
- Smooth transitions за content changes

## Layout Preservation

Всички компоненти запазват layout-а чрез:
- Fixed aspect ratios за изображения
- Min-height за текстови елементи
- Smooth transitions между състоянията
