# Технический UI-кит и дизайн-токены {#ui-kit}

Документ является единым контрактом вёрстки для фронтенд-разработчиков и ИИ-агентов (Слой 3 контекста). При генерации
интерфейсов запрещено использовать произвольные цвета, отступы и нестандартные HTML-элементы вместо компонентов из
данного реестра.

## 1. Дизайн-токены (CSS Variables) {#tokens}

```css
:root {
  /* Цвета бренда и акцентов */
  --color-primary: #1565c0;
  --color-primary-hover: #0d47a1;
  --color-primary-soft: #e3f2fd;

  /* Поверхности и границы */
  --color-bg-canvas: #f8fafc;
  --color-bg-surface: #ffffff;
  --color-border: #cbd5e1;
  --color-border-focus: #1565c0;

  /* Текст */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-inverse: #ffffff;

  /* Семантика */
  --color-success: #15803d;
  --color-success-bg: #dcfce7;
  --color-warning: #b45309;
  --color-warning-bg: #fef3c7;
  --color-danger: #b91c1c;
  --color-danger-bg: #fee2e2;
  --color-neutral: #334155;
  --color-neutral-bg: #f1f5f9;

  /* Типографика */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', Consolas, monospace;

  /* Скругления и отступы (базовый шаг 4px) */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
}
```

## 2. Сетка и компоновка страниц (Layout) {#layout}

- **Базовый каркас (`AppShell`):** Фиксированная левая навигационная панель (`240px`) + верхняя шапка (`56px`) +
  прокручиваемая рабочая область (`padding: 24px`, фон `--color-bg-canvas`).
- **Шапка страницы (`PageHeader`):** Содержит хлебные крошки, заголовок `H1` слева и панель кнопок действий справа (не
  более одной кнопки `variant="primary"`).
- **Карточка контента (`Card`):** Белый контейнер (`--color-bg-surface`), рамка `1px solid var(--color-border)`,
  скругление `--radius-lg`, внутренний отступ `--space-6`.
- **Адаптивность:** Минимальная поддерживаемая ширина экрана — `1280px` (Desktop-first). Таблицы при нехватке ширины
  используют горизонтальный скролл внутри контейнера.

## 3. Реестр базовых компонентов {#components}

Импорт всех компонентов выполняется из единого пакета `@ui-kit/core`.

### 3.1. Кнопки (`Button`)

| Проп | Тип / Значения | По умолчанию | Описание |
| --- | --- | --- | --- |
| `variant` | `'primary' \| 'secondary' \| 'danger' \| 'ghost'` | `'secondary'` | Визуальный стиль кнопки |
| `size` | `'sm' \| 'md'` | `'md'` | Высота `32px` (`sm`) или `36px` (`md`) |
| `loading` | `boolean` | `false` | Блокирует клик и отображает спиннер |
| `disabled` | `boolean` | `false` | Неактивное состояние |
| `iconLeft` | `IconName` | — | Иконка слева от текста |

### 3.2. Поля ввода и формы (`Input`, `Checkbox`, `FormField`)

- **`FormField`:** Обёртка для любого контрола формы. Принимает пропсы `label` (строка), `required` (добавляет `*`),
  `error` (строка ошибки, подсвечивает бордер рамкой `--color-danger` и выводит текст под полем) и `hint`.
- **`Input`:** Однострочное текстовое поле.
  - Пропсы: `value`, `onChange`, `placeholder`, `disabled`, `readOnly`, `maxLength`, `mono` (включает `--font-mono` для
    кодов), `uppercase` (автоматический перевод ввода в верхний регистр).
- **`SearchInput`:** Поле поиска с иконкой лупы, встроенным дебаунсом (`300ms`) и кнопкой очистки (`onClear`).
- **`Checkbox`:** Флажок для фильтров и массового выбора (`checked`, `onChange`, `label`, `disabled`).

### 3.3. Таблицы и списки (`DataTable`, `Pagination`)

- **`DataTable`:** Таблица для реестров и справочников.
  - Пропсы: `columns` (массив конфигураций колонок), `data` (массив записей), `loading` (отображает скелетон-строки),
    `sortBy`, `sortOrder`, `onSortChange`, `onRowClick`, `emptyState` (слот для заглушки `EmptyState`).
  - Правило оформления кодов: Колонки с кодами (`alpha2`, `alpha3`, `numeric`, `id`) всегда рендерятся шрифтом
    `--font-mono`.
- **`Pagination`:** Подвал таблицы (глобальный компонент для `SF-G-PAG`).
  - Пропсы: `page`, `pageSize` (по умолчанию `20`), `total`, `onPageChange`.

### 3.4. Статусы и уведомления (`Badge`, `Toast`, `Alert`)

- **`Badge`:** Компактная плашка статуса.
  - Проп `tone`: `'success'` (активен), `'neutral'` (неактивен / архив), `'warning'` (изменён / предупреждение),
    `'danger'` (ошибка / удалён), `'info'` (создан).
- **`Toast`:** Всплывающее системное уведомление в правом верхнем углу (реализует `SF-G-TOAST`, автоскрытие через
  `5000ms`). Вызывается через хук `useToast()`: `toast.success(msg)`, `toast.error(msg)`, `toast.warning(msg)`.
- **`Alert`:** Статичная плашка внутри страницы или модального окна (`tone`: `'info' | 'warning' | 'danger'`, `title`,
  `description`, `action`).

### 3.5. Модальные окна и состояния (`Modal`, `ConfirmDialog`, `EmptyState`)

- **`Modal`:** Базовое модальное окно (`open`, `onClose`, `title`, `size`: `'sm' | 'md' | 'lg'`, `footer`). Закрывается
  по `Esc` и кнопке крестика.
- **`ConfirmDialog`:** Специализированное модальное окно для подтверждения критических действий (удаление, отмена).
  Пропсы: `open`, `title`, `description`, `confirmText`, `confirmVariant` (`'primary' | 'danger'`), `loading`,
  `onConfirm`, `onCancel`.
- **`EmptyState`:** Заглушка для пустых списков и результатов поиска (`icon`, `title`, `description`, `action`).

## 4. Правила вёрстки для ИИ-агентов {#ai-rules}

1. **Запрет кастомного CSS:** Не создавайте отдельные `.css`/`.scss` файлы с хардкодом цветов и отступов. Используйте
   только компоненты `@ui-kit/core` и токены из раздела 1.
2. **Обработка всех состояний экрана:** Любой экран или виджет, загружающий данные по API, обязан обрабатывать 4
   состояния:
   - `loading` → скелетон (`DataTable loading={true}`).
   - `error` → компонент `Alert tone="danger"` с кнопкой «Повторить».
   - `empty` → компонент `EmptyState` с текстом из спецификации (`MSG:*`).
   - `success` → отображение данных.
3. **Защита от двойной отправки:** Кнопка подтверждения в любой форме (`Сохранить`, `Удалить`, `Применить изменения`)
   обязана привязывать проп `loading={isSubmitting}` на время выполнения HTTP-запроса.
4. **Конфликт оптимистичной блокировки (`SF-G-LOCK`):** При получении от API кода ошибки `409 Conflict` (устаревшая
   версия записи) интерфейс отображает `Modal` с предупреждением и кнопкой «Обновить данные», перезагружающей актуальную
   карточку.

