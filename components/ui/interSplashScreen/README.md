# Smart Inter Splash Screen System

Подобрена система за splash screen с автоматично преминаване към skeleton loading при бавни заявки.

## Проблемът

При тежки страници с много API заявки, splash screen-ът чака всички заявки да се изпълнят преди да покаже страницата. Това създава неприятен ефект където потребителят вижда същата страница дълго време.

## Решението

Новата система автоматично показва страницата с skeleton loaders ако заявките са бавни, 300ms преди края на splash screen-а.

## Компоненти

### 1. SmartInterSplashScreen
Основният компонент с подобрена логика:
- `maxDuration`: Максимално време преди показване на skeleton (по подразбиране 1200ms)
- `onShowSkeleton`: Callback когато се показва skeleton
- Автоматично показва "Зареждане..." текст при бавни заявки

### 2. SmartNavigationManager
Управлява навигацията и timing-а:
- Следи промените в pathname
- Показва skeleton ако навигацията е бавна
- 300ms забавяне преди скриване на splash screen

### 3. useSmartSplash Hook
Лесно използване в компоненти:
```tsx
const { showSmartSplash, hideSmartSplash } = useSmartSplash({
    maxSplashDuration: 1200,
    onShowSkeleton: () => {
        // Покажи skeleton loading
        setShowSkeletonLoading(true);
    }
});
```

## Използване

### В компонент:
```tsx
import { useSmartSplash } from '@/components/ui/interSplashScreen/useSmartSplash';

function MyComponent() {
    const [showSkeleton, setShowSkeleton] = useState(false);
    
    const { hideSmartSplash } = useSmartSplash({
        maxSplashDuration: 1200,
        onShowSkeleton: () => setShowSkeleton(true)
    });

    // Когато данните са готови
    useEffect(() => {
        if (dataReady) {
            hideSmartSplash();
        }
    }, [dataReady, hideSmartSplash]);

    if (showSkeleton) {
        return <SkeletonLoader />;
    }

    return <ActualContent />;
}
```

### В layout:
```tsx
import SmartInterSplashWrapper from '@/components/ui/interSplashScreen/SmartInterSplashWrapper';
import SmartNavigationManager from '@/components/ui/interSplashScreen/SmartNavigationManager';

export default function Layout({ children }) {
    return (
        <>
            <SmartNavigationManager 
                maxSplashDuration={1200}
                onShowSkeleton={() => {
                    // Глобална логика за skeleton
                }}
            />
            <SmartInterSplashWrapper 
                maxSplashDuration={1200}
                onShowSkeleton={() => {
                    // Глобална логика за skeleton
                }}
            />
            {children}
        </>
    );
}
```

## Timing

- **0-400ms**: Минимално време за splash screen
- **400-1200ms**: Нормално време за зареждане
- **1200ms+**: Автоматично показва skeleton loading
- **1200ms + 300ms**: Скрива splash screen и показва страницата с skeleton

## Предимства

1. **По-добър UX**: Потребителят вижда прогреса вместо да чака
2. **Автоматично**: Не изисква ръчно управление
3. **Гъвкаво**: Лесно настройване на timing
4. **Обратна съвместимост**: Работи с съществуващия InterSplashContext
5. **Accessibility**: Поддържа reduced motion настройки

## Миграция

За да мигрирате от старата система:

1. Заменете `InterSplashWrapper` с `SmartInterSplashWrapper`
2. Заменете `NavigationManager` с `SmartNavigationManager`
3. Добавете `onShowSkeleton` callback за skeleton loading
4. Използвайте `useSmartSplash` hook в компонентите

Старата система продължава да работи за обратна съвместимост.
