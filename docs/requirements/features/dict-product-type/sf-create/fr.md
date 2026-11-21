# ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ {#fr}

## Журнал изменений {#change-history .collapsed}

- Записей пока нет.

## FR-PRODUCT-TYPE-CREATE-001 {#fr-product-type-create-001}

- **Название**: Создание записи вида изделий
- **Использует**: [SF-PRODUCT-TYPE-CREATE][], [DR-PRODUCT-TYPE-CREATE-001][]
- **Используется в**: [AR-PRODUCT-TYPE-CREATE-001][]
- **Описание**: Система создаёт запись справочника видов изделий, если пользователь с правом создания передал корректные
данные.
- **Условие**: Пользователь аутентифицирован и имеет право создания (роль `ais`), данные запроса соответствуют
DR-PRODUCT-TYPE-CREATE-001 (проверки описаны в FR-PRODUCT-TYPE-CREATE-002).
- **Результат**:
    - Система создаёт запись с новым идентификатором `pk`.
    - Система сохраняет значения полей запроса, при этом `name_nominative` сохраняется без пробелов по краям.
    - Система устанавливает `is_active` в `true`.
    - Система записывает дату и время создания (UTC) в `created_at`, а в `updated_at` записывает то же значение (см.
      `H01`).
    - Система записывает создание в журнал аудита.
    - Система возвращает созданную запись и код ответа `201`.

### Эталоны запроса и ответа {#fr-product-type-create-001-examples}

Запрос `POST /api/v1/product-types`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.json"
```

Ответ `201 Created`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.201.json"
```

### Критерии приёмки (AC) {#fr-product-type-create-001-ac}

```gherkin
# language: ru
@FR-PRODUCT-TYPE-CREATE-001 @AR-PRODUCT-TYPE-CREATE-001
Функционал: Создание записи вида изделий

  Сценарий: Успешное создание записи
    Дано аутентифицированный пользователь с ролью "ais"
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json"
    Тогда код ответа равен 201
    И тело ответа соответствует схеме "AR-PRODUCT-TYPE-CREATE-001.response.201.schema.json"
    И в теле ответа "is_active" равно true
    И в теле ответа "updated_at" равно "created_at"

  Сценарий: Пробелы по краям наименования обрезаются
    Дано аутентифицированный пользователь с ролью "ais"
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json",
      где "name_nominative" равно "  Кольцо  "
    Тогда код ответа равен 201
    И в теле ответа "name_nominative" равно "Кольцо"
```

### Допущения {#fr-product-type-create-001-assumptions}

- **FR-PRODUCT-TYPE-CREATE-001.H01**
    - **Статус**: принято
    - **Подтверждает**: владелец справочника
    - **Допущение**: При создании записи `updated_at` равно `created_at`, а не пустое, потому что поле обязательно.

## FR-PRODUCT-TYPE-CREATE-002 {#fr-product-type-create-002}
- **Название**: Отказ в создании записи вида изделий
- **Использует**: [SF-PRODUCT-TYPE-CREATE][], [DR-PRODUCT-TYPE-CREATE-001][]
- **Используется в**: [AR-PRODUCT-TYPE-CREATE-001][]
- **Описание**: Система отклоняет создание записи, если пользователь не аутентифицирован или не имеет права создания,
данные некорректны, такая запись уже существует либо произошла внутренняя ошибка. При любом отказе запись не создаётся и
в журнал аудита ничего не записывается.
- **Порядок проверок**:
    1. Аутентификация: при отказе код ответа `401`.
    2. Право создания: при отказе код ответа `403`.
    3. Состав и формат данных: при отказе код ответа `400`, в ответе перечислены все найденные ошибки, а не
       только первая.
    4. Уникальность (см. `DR-PRODUCT-TYPE-CREATE-001.H02`): при отказе код ответа `409`.

### Проверки данных {#fr-product-type-create-002-checks}

Значение `null` приравнивается к отсутствию поля.

| Поле | Проверка | Код ошибки в `details` |
| :--- | :--- | :--- |
| `name_nominative` | Поле передано | `REQUIRED` |
| `name_nominative` | Значение является строкой | `INVALID_TYPE` |
| `name_nominative` | После обрезки пробелов по краям строка не пустая | `BLANK` |
| `name_nominative` | После обрезки пробелов по краям длина не больше 150 символов | `TOO_LONG` |
| `product_group` | Поле передано | `REQUIRED` |
| `product_group` | Значение является одним из `JEWELRY`, `WEIGHT_PRODUCTS`, `WATCH_CASES` | `INVALID_VALUE` |
| `default_streak_count` | Поле передано | `REQUIRED` |
| `default_streak_count` | Значение является числом | `INVALID_TYPE` |
| `default_streak_count` | Значение больше 0 и не больше 999.99 | `OUT_OF_RANGE` |
| `default_streak_count` | Не более 2 знаков после запятой | `INVALID_SCALE` |
| `wholesale_gold_streak_count` | Поле передано | `REQUIRED` |
| `wholesale_gold_streak_count` | Значение является числом | `INVALID_TYPE` |
| `wholesale_gold_streak_count` | Значение больше 0 и не больше 999.99 | `OUT_OF_RANGE` |
| `wholesale_gold_streak_count` | Не более 2 знаков после запятой | `INVALID_SCALE` |
| `stamp_impressions_count` | Поле передано | `REQUIRED` |
| `stamp_impressions_count` | Значение является целым числом | `INVALID_TYPE` |
| `stamp_impressions_count` | Значение больше 0 | `OUT_OF_RANGE` |
| Поле вне состава запроса (например, `pk`, `is_active`, `created_at`, `updated_at`) | Поле не передаётся | `UNKNOWN_FIELD` |

### Коды ответов при отказе {#fr-product-type-create-002-responses}

| Код ответа | Код ошибки `code` | Когда |
| :--- | :--- | :--- |
| `400` | `VALIDATION_ERROR` | Одна или несколько проверок данных не пройдены |
| `401` | `UNAUTHORIZED` | Пользователь не аутентифицирован |
| `403` | `FORBIDDEN` | У пользователя нет права создания |
| `409` | `DUPLICATE_PRODUCT_TYPE` | Запись с таким наименованием в этой группе уже существует |
| `500` | `INTERNAL_ERROR` | Внутренняя ошибка: запись не создаётся |

### Эталоны отказов {#fr-product-type-create-002-examples}

#### 400. Ошибки в данных запроса

Запрос нарушает сразу несколько проверок: пустое наименование, недопустимая группа, нечисловое значение, значение вне
диапазона, отсутствующее обязательное поле и лишнее поле.

Запрос:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.invalid.json"
```

Ответ `400 Bad Request`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.400.json"
```

#### 401. Пользователь не аутентифицирован

Корректный запрос из файла `AR-PRODUCT-TYPE-CREATE-001.request.json` отправлен без действительных данных аутентификации.

Запрос:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.json"
```

Ответ `401 Unauthorized`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.401.json"
```

#### 403. Нет права создания

Корректный запрос из файла `AR-PRODUCT-TYPE-CREATE-001.request.json` отправлен пользователем с ролью, которой создание
запрещено (например, `pko`).

Запрос:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.json"
```

Ответ `403 Forbidden`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.403.json"
```

#### 409. Запись уже существует

Корректный запрос из файла `AR-PRODUCT-TYPE-CREATE-001.request.json` отправлен, когда в группе `JEWELRY` уже есть вид
изделий «Кольцо».

Запрос:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.json"
```

Ответ `409 Conflict`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.409.json"
```

#### 500. Внутренняя ошибка

Корректный запрос из файла `AR-PRODUCT-TYPE-CREATE-001.request.json` вызывает сбой при обработке. Запись не создаётся.

Ответ `500 Internal Server Error`:

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.500.json"
```

### Критерии приёмки (AC) {#fr-product-type-create-002-ac}

```gherkin
# language: ru
@FR-PRODUCT-TYPE-CREATE-002 @AR-PRODUCT-TYPE-CREATE-001
Функционал: Отказ в создании записи вида изделий

  Сценарий: Ошибки в данных запроса
    Дано аутентифицированный пользователь с ролью "ais"
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.invalid.json"
    Тогда код ответа равен 400
    И тело ответа равно содержимому файла "AR-PRODUCT-TYPE-CREATE-001.response.400.json"
    И запись не создана

  Сценарий: Пользователь не аутентифицирован
    Дано пользователь без аутентификации
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json"
    Тогда код ответа равен 401
    И тело ответа равно содержимому файла "AR-PRODUCT-TYPE-CREATE-001.response.401.json"

  Сценарий: Нет права создания
    Дано аутентифицированный пользователь с ролью "pko"
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json"
    Тогда код ответа равен 403
    И тело ответа равно содержимому файла "AR-PRODUCT-TYPE-CREATE-001.response.403.json"
    И запись не создана

  Сценарий: Запись уже существует
    Дано в группе "JEWELRY" есть вид изделий "Кольцо"
    И аутентифицированный пользователь с ролью "ais"
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json"
    Тогда код ответа равен 409
    И тело ответа равно содержимому файла "AR-PRODUCT-TYPE-CREATE-001.response.409.json"
    И количество записей не изменилось

  @manual
  Сценарий: Внутренняя ошибка при создании
    Дано аутентифицированный пользователь с ролью "ais"
    И хранилище данных недоступно
    Когда он отправляет запрос с телом из файла "AR-PRODUCT-TYPE-CREATE-001.request.json"
    Тогда код ответа равен 500
    И тело ответа равно содержимому файла "AR-PRODUCT-TYPE-CREATE-001.response.500.json"
    И запись не создана
```

## AR-PRODUCT-TYPE-CREATE-001 {#ar-product-type-create-001}
- **Название**: Создание вида изделий (API)
- **Использует**: [FR-PRODUCT-TYPE-CREATE-001][], [FR-PRODUCT-TYPE-CREATE-002][], [DR-PRODUCT-TYPE-CREATE-001][]
- **Метод и путь**: `POST /api/v1/product-types`
- **Права доступа**: роль `ais` (см. [SF-PRODUCT-TYPE-CREATE][])
- **Заголовок запроса**: `Content-Type: application/json`
- **Форматы**: Тело запроса и ответа: JSON в кодировке UTF-8. Количества передаются JSON-числами. Идентификатор `pk` —
UUID. Дата и время — ISO 8601 в UTC, например `2026-11-20T09:30:15Z`.

### Ответы {#ar-product-type-create-001-responses}

| Код ответа | Когда | Тело | Эталон |
| :--- | :--- | :--- | :--- |
| `201` | Запись создана | Созданная запись | [response.201.json](api/AR-PRODUCT-TYPE-CREATE-001.response.201.json) |
| `400` | Ошибки в данных запроса | Ошибка с перечнем по полям | [response.400.json](api/AR-PRODUCT-TYPE-CREATE-001.response.400.json) |
| `401` | Пользователь не аутентифицирован | Ошибка | [response.401.json](api/AR-PRODUCT-TYPE-CREATE-001.response.401.json) |
| `403` | Нет права создания | Ошибка | [response.403.json](api/AR-PRODUCT-TYPE-CREATE-001.response.403.json) |
| `409` | Запись уже существует | Ошибка с указанием поля | [response.409.json](api/AR-PRODUCT-TYPE-CREATE-001.response.409.json) |
| `500` | Внутренняя ошибка | Ошибка | [response.500.json](api/AR-PRODUCT-TYPE-CREATE-001.response.500.json) |

Тела ответов с ошибками (`400`–`500`) соответствуют общей схеме
[error.response.schema.json](../../../global/api/error.response.schema.json).

### Файлы эталонов и схем {#ar-product-type-create-001-files}

Файлы лежат в каталоге [api/](api/) рядом со страницей. Автотесты берут запросы, ответы и схемы из этих же файлов,
поэтому страница и тесты не расходятся.

| Файл | Назначение |
| :--- | :--- |
| `AR-PRODUCT-TYPE-CREATE-001.request.schema.json` | Схема тела запроса |
| `AR-PRODUCT-TYPE-CREATE-001.request.json` | Корректный запрос |
| `AR-PRODUCT-TYPE-CREATE-001.request.invalid.json` | Запрос с ошибками (ответ `400`) |
| `AR-PRODUCT-TYPE-CREATE-001.response.201.schema.json` | Схема тела ответа `201` |
| `AR-PRODUCT-TYPE-CREATE-001.response.201.json` | Эталон ответа `201` |
| `AR-PRODUCT-TYPE-CREATE-001.response.400.json` | Эталон ответа `400` |
| `AR-PRODUCT-TYPE-CREATE-001.response.401.json` | Эталон ответа `401` |
| `AR-PRODUCT-TYPE-CREATE-001.response.403.json` | Эталон ответа `403` |
| `AR-PRODUCT-TYPE-CREATE-001.response.409.json` | Эталон ответа `409` |
| `AR-PRODUCT-TYPE-CREATE-001.response.500.json` | Эталон ответа `500` |

#### Схема запроса (JSON Schema) {#ar-product-type-create-001-request-schema .collapsed}

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.request.schema.json"
```

#### Схема ответа 201 (JSON Schema) {#ar-product-type-create-001-response-201-schema .collapsed}

```json
--8<-- "requirements/features/dict-product-type/sf-create/api/AR-PRODUCT-TYPE-CREATE-001.response.201.schema.json"
```


[SF-PRODUCT-TYPE-CREATE]: <index.md#sf-product-type-create>
[DR-PRODUCT-TYPE-CREATE-001]: <dr.md#dr-product-type-create-001>
[FR-PRODUCT-TYPE-CREATE-001]: <#fr-product-type-create-001>
[FR-PRODUCT-TYPE-CREATE-002]: <#fr-product-type-create-002>
[AR-PRODUCT-TYPE-CREATE-001]: <#ar-product-type-create-001>
