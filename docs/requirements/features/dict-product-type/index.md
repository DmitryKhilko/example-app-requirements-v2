---
id: "F-PRODUCT-TYPE"
status: "analysis"
icon: lucide/file-pen-line
order: 10
doc_version: "0.02.02"
datetime_doc_version: "09.11.2026 14:02"
owner: "Khilko Dmitry"
task_id: "123"
release_id: 
release_date: 
---

> Статус: анализ  
> Ответственный: Khilko Dmitry  
> Версия: 0.02.02 (09.11.2026 14:02)  
> Задача: [123][]  
> Релиз:  
> Дата релиза:   

# ОСНОВНАЯ ФУНКЦИОНАЛЬНОСТЬ {#f}

## Журнал изменений {#change-history .collapsed}

- Записей пока нет.

## F-PRODUCT-TYPE {#f-product-type}

- **Название**: Справочник видов изделий
- **Приоритет**: must
- **Использует**: [BG-001][]
- **Используется в**: [SF-PRODUCT-TYPE-LIST][], [SF-PRODUCT-TYPE-READ][], [SF-PRODUCT-TYPE-CREATE][], 
[SF-PRODUCT-TYPE-UPDATE][], [SF-PRODUCT-TYPE-ACTIVATION][], [SF-PRODUCT-TYPE-DELETE][]    
- **Описание**: Справочник видов изделий является единым, достоверным и управляемым источником данных для документов 
всех подсистем, что исключает расхождение и дублирование информации. Справочник обеспечивает единый перечень ювелирных 
изделий для сквозного учёта на всех этапах жизненного цикла работ: от формирования заявления до оформления выдачи. Для 
поддержания его актуальности пользователь может управлять записями вручную: просматривать, искать, создавать, 
редактировать, изменять статус и удалять.
- **Границы**:
    - **Входит**: Просмотр, поиск, создание, изменение, деактивация и удаление записей, права доступа и аудит изменений.
    - **Не входит**: Загрузка из файла, загрузка из внешних классификаторов, импорт из НСИ АСФР.

### Диаграмма последовательности {#sequence-diagram .collapsed}

Ниже представлена UML-диаграмма последовательности (Sequence Diagram), описывающая жизненный цикл сущности через 
взаимодействие пользователя, системы и базы данных.

```plantuml
@startuml
actor Пользователь as User
participant "Система" as Sys
database "База данных" as DB

== Создание ==
User -> Sys : Запрос на создание
activate Sys
Sys -> DB : Сохранить (статус: Активна)
activate DB
DB --> Sys : Успешно
deactivate DB
Sys --> User : Сущность создана (Активна)
deactivate Sys

== Деактивация и активация ==
User -> Sys : Запрос на деактивацию
activate Sys
Sys -> DB : Обновить статус на "Неактивна"
activate DB
DB --> Sys : Успешно
deactivate DB
Sys --> User : Статус изменен (Неактивна)
deactivate Sys

User -> Sys : Запрос на активацию
activate Sys
Sys -> DB : Обновить статус на "Активна"
activate DB
DB --> Sys : Успешно
deactivate DB
Sys --> User : Статус изменен (Активна)
deactivate Sys

== Удаление ==
User -> Sys : Запрос на удаление
activate Sys
Sys -> DB : Проверить наличие ссылок
activate DB
DB --> Sys : Результат проверки
deactivate DB

alt Ссылок нет (из состояния Активна или Неактивна)
    Sys -> DB : Обновить статус на "Удалена"
    activate DB
    DB --> Sys : Успешно
    deactivate DB
    Sys --> User : Сущность удалена (Удалена)
else Есть активные ссылки
    Sys --> User : Ошибка: удаление невозможно
end
deactivate Sys

@enduml
```

### Диаграмма состояний {#f-product-type-state-diagram .collapsed}

Схема показывает, в каком статусе находится запись справочника и какая детальная функциональность переводит её из 
статуса в статус. Просмотр и поиск (`SF-PRODUCT-TYPE-LIST`, `SF-PRODUCT-TYPE-READ`) и редактирование 
(`SF-PRODUCT-TYPE-UPDATE`) статус записи не меняют.

```plantuml
@startuml
skinparam backgroundColor #FFFFFF
skinparam shadowing false
skinparam roundCorner 12
skinparam ArrowColor #14233f
skinparam StateBorderColor #14233f
skinparam StateBackgroundColor #eaf2ff
hide empty description

state "Активна" as Active
state "Неактивна" as Inactive
state "Удалена" as Deleted

[*] --> Active : SF-PRODUCT-TYPE-CREATE\nсоздание записи

Active --> Inactive : SF-PRODUCT-TYPE-ACTIVATION\nдеактивация
Inactive --> Active : SF-PRODUCT-TYPE-ACTIVATION\nактивация

Active --> Deleted : SF-PRODUCT-TYPE-DELETE\n[активных ссылок нет]
Inactive --> Deleted : SF-PRODUCT-TYPE-DELETE\n[активных ссылок нет]

Active --> Active : SF-PRODUCT-TYPE-DELETE\n[есть активные ссылки] / Ошибка
Inactive --> Inactive : SF-PRODUCT-TYPE-DELETE\n[есть активные ссылки] / Ошибка

Deleted --> [*]

note right of Active
Доступна для выбора в заявлениях
и других документах
end note

note right of Inactive
Скрыта от выбора
end note

note right of Deleted
Мягкое удаление: запись сохранена в БД,
операции над типом продукта недоступны
end note
@enduml
```

Допущение, которое требует подтверждения: удаление доступно из обоих статусов, а условия удаления задаются в 
`SF-PRODUCT-TYPE-DELETE`.


[BG-001]: <../../../business-context/business-requirements.md#bg-001>
[SF-PRODUCT-TYPE-LIST]: <../sf-list/index.md#sf-country-list>
[SF-PRODUCT-TYPE-READ]: <../sf-list/index.md#sf-country-list>
[SF-PRODUCT-TYPE-CREATE]: <../sf-create/index.md#sf-country-create>
[SF-PRODUCT-TYPE-UPDATE]: <../sf-create/index.md#sf-country-create>
[SF-PRODUCT-TYPE-ACTIVATION]: <../sf-create/index.md#sf-country-create>
[SF-PRODUCT-TYPE-DELETE]: <../sf-create/index.md#sf-country-create>
[glossary]: <../../../business-context/glossary.md>
[123]: <../../../business-context/glossary.md>
