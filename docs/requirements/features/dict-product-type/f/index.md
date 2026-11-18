---
owner: "Khilko Dmitry"
doc_version: "0.02.02 (09.11.2026 14:02)"
task_id: "123"
release_id:
release_date: 
---

# F-DICT-PRODUCT-TYPE. Справочник изделий {#f-dict-product-type}
- **Статус**: Анализ
- **Приоритет**: must
- **Относится**: [BG-001][BG-001]
- **Использует**: [SF-DICT-PRODUCT-TYPE-LIST][], [SF-DICT-PRODUCT-TYPE-READ][], [SF-DICT-PRODUCT-TYPE-CREATE][], 
[SF-DICT-PRODUCT-TYPE-UPDATE][], [SF-DICT-PRODUCT-TYPE-ACTIVATION][], [SF-DICT-PRODUCT-TYPE-DELETE][]    
- **Описание**: Справочник изделий является единым, достоверным и управляемым источником данных для документов всех 
подсистем, что исключает расхождение и дублирование информации. Справочник обеспечивает единый перечень ювелирных 
изделий для сквозного учёта на всех этапах жизненного цикла работ: от формирования заявления до оформления выдачи. Для 
поддержания его актуальности пользователь может управлять записями вручную: просматривать, искать, создавать, 
редактировать, изменять статус и удалять.


## Границы {#f-dict-product-type}

- **Входит**: Просмотр, поиск, создание, изменение, деактивация и удаление записей, права доступа и аудит изменений.
- **Не входит**: Загрузка из файла, загрузка из внешних классификаторов, импорт из НСИ АСФР.

## Требования {#f-dict-product-type}

=== "UC"

    --8<-- "requirements/features/country/f/uc.md"

=== "DR"

    --8<-- "requirements/features/country/f/dr.md"

=== "FR"

    --8<-- "requirements/features/country/f/fr.md"

=== "AR"

    --8<-- "requirements/features/country/f/ar.md"

=== "NFR"

    --8<-- "requirements/features/country/f/nfr.md"

=== "UI"

    --8<-- "requirements/features/country/f/ui.md"


[BG-001]: <../../../business-context/business-requirements.md#bg-001>
[SF-DICT-PRODUCT-TYPE-LIST]: <../sf-list/index.md#sf-country-list>
[SF-DICT-PRODUCT-TYPE-READ]: <../sf-list/index.md#sf-country-list>
[SF-DICT-PRODUCT-TYPE-CREATE]: <../sf-create/index.md#sf-country-create>
[SF-DICT-PRODUCT-TYPE-UPDATE]: <../sf-create/index.md#sf-country-create>
[SF-DICT-PRODUCT-TYPE-ACTIVATION]: <../sf-create/index.md#sf-country-create>
[SF-DICT-PRODUCT-TYPE-DELETE]: <../sf-create/index.md#sf-country-create>
[glossary]: <../../../business-context/glossary.md>
[123]: <../../../business-context/glossary.md>
