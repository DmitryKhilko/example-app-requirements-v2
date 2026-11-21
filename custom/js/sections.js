/* ==========================================================================
   sections.js — сворачивание и разворачивание разделов страницы

   РАСПОЛОЖЕНИЕ
     custom/js/sections.js

   КАК ФАЙЛ ПОПАДАЕТ НА САЙТ
     Файл встраивается в каждую страницу шаблоном custom/main.html (блок scripts),
     так же, как custom/css/extra.css встраивается в блок styles.
     Стили кнопок лежат в custom/css/extra.css (раздел 11).

   ВАЖНО: ОГРАНИЧЕНИЯ ШАБЛОНИЗАТОРА
     Файл подключается как шаблон Jinja, поэтому в нём (в том числе в комментариях и
     строках) нельзя писать три сочетания символов: две открывающие фигурные скобки
     подряд, фигурную скобку с процентом и фигурную скобку с решёткой.
     Нельзя также писать закрывающий тег скрипта (слэш script в угловых скобках).
     Иначе сборка сайта упадёт или скрипт не заработает.

   ЧТО ДЕЛАЕТ СКРИПТ
     1. Рядом с каждым заголовком h2–h6 в тексте страницы показывает кнопку со стрелкой:
        нажатие сворачивает раздел (скрывает всё до следующего заголовка того же или
        более высокого уровня) и разворачивает обратно.
        Заголовок первого уровня (h1) и заголовки внутри блоков ??? note не получают кнопок.
     2. Над заголовком первого уровня показывает полосу с двумя кнопками:
        «Свернуть всё»   — сворачивает все разделы и закрывает все блоки ??? note;
        «Развернуть всё» — разворачивает все разделы и открывает все блоки ??? note.
        Полоса «прилипает» под шапкой сайта, поэтому кнопки доступны при любой прокрутке.
     3. Если читатель переходит по ссылке на место внутри свёрнутого раздела или закрытого
        блока (из правого меню «Содержание», из поиска, по адресу с якорем), скрипт
        сам раскрывает нужные разделы и блоки.

   ЧТО СКРИПТ НЕ ДЕЛАЕТ
     • Не запоминает состояние. После открытия или обновления страницы все разделы
       развёрнуты, а блоки ??? note открыты или закрыты так, как написано в документе.
     • Не меняет документы и идентификаторы заголовков, поэтому все ссылки
       вида #fr-product-type-create-001 продолжают работать.

   КАК УСТРОЕНА СВЁРТКА
     Скрипт оборачивает содержимое каждого раздела в контейнер div с классом section-body
     и при сворачивании ставит ему атрибут hidden="until-found".
     Значение until-found прячет содержимое, но оставляет его доступным для поиска по
     странице в браузере (Ctrl+F): при совпадении браузер сам раскроет раздел.
     Это работает в Chrome и Edge; в браузерах без поддержки раздел просто скрывается,
     и поиск по свёрнутому тексту не находит.

   КАК ИЗМЕНИТЬ
     Названия кнопок и подсказок собраны в объекте TEXT ниже.
     Классы и селекторы — в объекте CLS и константе ARTICLE_SELECTOR.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     НАСТРОЙКИ
     ------------------------------------------------------------------------ */

  /* Селектор области с текстом документа. Тема кладёт текст страницы
     в элемент article с классом md-content__inner. */
  var ARTICLE_SELECTOR = "article.md-content__inner";

  /* Названия классов, которые скрипт добавляет в разметку.
     Те же названия используются в custom/css/extra.css (раздел 11). */
  var CLS = {
    toolbar: "section-toolbar",       /* полоса с кнопками «Свернуть всё» и «Развернуть всё» */
    heading: "section-heading",       /* заголовок, у которого есть кнопка сворачивания */
    toggle: "section-toggle",         /* кнопка со стрелкой в заголовке */
    body: "section-body",             /* контейнер с содержимым раздела */
    collapsed: "is-collapsed"         /* заголовок свёрнутого раздела */
  };

  /* Тексты кнопок и подсказок */
  var TEXT = {
    collapseAll: "Свернуть всё",
    expandAll: "Развернуть всё",
    collapseAllHint: "Свернуть все разделы и закрыть все блоки на странице",
    expandAllHint: "Развернуть все разделы и открыть все блоки на странице",
    toolbarLabel: "Управление разделами страницы",
    collapseSection: "Свернуть раздел",
    expandSection: "Развернуть раздел"
  };

  /* Служебные блоки в конце статьи (сноски, дата изменения файла). Они не относятся
     ни к одному разделу, поэтому скрипт не включает их в содержимое последнего раздела. */
  var SERVICE_BLOCKS = ".md-source-file, .footnote";

  /* Дополнительный зазор в пикселях между полосой кнопок и заголовком, к которому
     происходит переход по ссылке */
  var SCROLL_GAP = 8;


  /* ------------------------------------------------------------------------
     ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
     ------------------------------------------------------------------------ */

  /* Возвращает текущую область с текстом страницы или null, если её нет.
     При мгновенной навигации тема подменяет содержимое страницы, поэтому
     каждый раз ищем актуальный элемент заново. */
  function getArticle() {
    return document.querySelector(ARTICLE_SELECTOR);
  }

  /* Проверяет, что элемент — заголовок любого уровня (h1–h6) */
  function isHeading(node) {
    return !!node && node.nodeType === 1 && /^H[1-6]$/.test(node.tagName);
  }

  /* Уровень заголовка: для h2 вернёт 2, для h3 — 3 и так далее */
  function levelOf(heading) {
    return parseInt(heading.tagName.charAt(1), 10);
  }

  /* Все заголовки, у которых есть кнопка сворачивания (в порядке следования на странице) */
  function getSectionHeadings(article) {
    return Array.prototype.slice.call(article.querySelectorAll("." + CLS.heading));
  }

  /* Все блоки ??? note (в HTML это элементы details) в тексте страницы */
  function getDetails(article) {
    return Array.prototype.slice.call(article.querySelectorAll("details"));
  }


  /* ------------------------------------------------------------------------
     СВОРАЧИВАНИЕ И РАЗВОРАЧИВАНИЕ ОДНОГО РАЗДЕЛА
     ------------------------------------------------------------------------ */

  /* Сворачивает (collapsed = true) или разворачивает (collapsed = false) раздел,
     которому принадлежит заголовок heading. Обновляет всё, что зависит от состояния:
     скрытие содержимого, стрелку, подсказку и атрибут для программ чтения с экрана. */
  function setSection(heading, collapsed) {
    var body = heading.sectionBody;
    var button = heading.sectionToggle;
    if (!body || !button) {
      return;   /* у заголовка нет содержимого, сворачивать нечего */
    }

    if (collapsed) {
      /* until-found: содержимое скрыто, но находится поиском по странице */
      body.setAttribute("hidden", "until-found");
    } else {
      body.removeAttribute("hidden");
    }

    heading.classList.toggle(CLS.collapsed, collapsed);
    button.setAttribute("aria-expanded", collapsed ? "false" : "true");
    button.setAttribute(
      "aria-label",
      (collapsed ? TEXT.expandSection : TEXT.collapseSection) + ": " + heading.sectionTitle
    );
  }

  /* Раскрывает всё, что скрывает элемент element: свёрнутые разделы и закрытые блоки
     ??? note, внутри которых он лежит. Возвращает true, если что-то пришлось раскрыть. */
  function revealAncestors(element, article) {
    var changed = false;
    var node = element;

    while (node && node !== article) {
      if (node.classList && node.classList.contains(CLS.body) && node.hasAttribute("hidden")) {
        setSection(node.sectionHeading, false);
        changed = true;
      } else if (node.tagName === "DETAILS" && !node.open) {
        node.open = true;
        changed = true;
      }
      node = node.parentElement;
    }
    return changed;
  }


  /* ------------------------------------------------------------------------
     «СВЕРНУТЬ ВСЁ» И «РАЗВЕРНУТЬ ВСЁ»
     ------------------------------------------------------------------------ */

  /* Сворачивает все разделы и закрывает все блоки ??? note */
  function collapseAll(article) {
    getDetails(article).forEach(function (details) {
      details.open = false;
    });
    getSectionHeadings(article).forEach(function (heading) {
      setSection(heading, true);
    });

    /* После сворачивания страница становится короче, и браузер мог оставить читателя
       в середине пустого места. Поэтому возвращаем его к заголовку страницы. */
    var title = article.querySelector("h1");
    if (title) {
      title.scrollIntoView({ block: "start" });
    }
  }

  /* Разворачивает все разделы и открывает все блоки ??? note */
  function expandAll(article) {
    getSectionHeadings(article).forEach(function (heading) {
      setSection(heading, false);
    });
    getDetails(article).forEach(function (details) {
      details.open = true;
    });
  }


  /* ------------------------------------------------------------------------
     ПОСТРОЕНИЕ РАЗДЕЛОВ
     ------------------------------------------------------------------------ */

  /* Превращает заголовок в сворачиваемый: оборачивает содержимое раздела в контейнер
     и добавляет в заголовок кнопку. Если под заголовком ничего нет, ничего не делает.
     index нужен только для уникального идентификатора контейнера. */
  function buildSection(heading, index) {
    var level = levelOf(heading);
    var nodes = [];
    var node = heading.nextElementSibling;

    /* Раздел продолжается до следующего заголовка того же или более высокого уровня
       (для h2 это следующий h2 или h1; вложенные h3 остаются внутри) либо до служебных
       блоков в конце статьи. Контейнеры более поздних разделов уже созданы (разделы
       строятся с конца), поэтому они попадают в содержимое как обычные блоки. */
    while (node && !(isHeading(node) && levelOf(node) <= level) && !node.matches(SERVICE_BLOCKS)) {
      nodes.push(node);
      node = node.nextElementSibling;
    }
    if (nodes.length === 0) {
      return;
    }

    /* Контейнер с содержимым раздела: ставим сразу после заголовка и переносим в него блоки */
    var body = document.createElement("div");
    body.className = CLS.body;
    body.id = CLS.body + "-" + index;
    heading.parentNode.insertBefore(body, heading.nextSibling);
    nodes.forEach(function (child) {
      body.appendChild(child);
    });

    /* Кнопка в заголовке. Название раздела берём до вставки кнопки, чтобы оно
       не содержало лишнего. */
    var title = heading.textContent.replace(/\s+/g, " ").trim();
    var button = document.createElement("button");
    button.type = "button";
    button.className = CLS.toggle;
    button.setAttribute("aria-expanded", "true");
    button.setAttribute("aria-controls", body.id);
    button.setAttribute("aria-label", TEXT.collapseSection + ": " + title);
    button.addEventListener("click", function () {
      setSection(heading, !heading.classList.contains(CLS.collapsed));
    });
    heading.insertBefore(button, heading.firstChild);
    heading.classList.add(CLS.heading);

    /* Связи нужны остальным функциям: из заголовка к содержимому и обратно */
    heading.sectionBody = body;
    heading.sectionToggle = button;
    heading.sectionTitle = title;
    body.sectionHeading = heading;

    /* Поиск по странице (Ctrl+F) нашёл текст в скрытом разделе. Браузер раскрывает
       контейнер сам, а скрипт приводит в порядок стрелку заголовка и
       раскрывает внешние свёрнутые разделы. */
    body.addEventListener("beforematch", function () {
      revealAncestors(body, getArticle());
      setSection(heading, false);
    });
  }

  /* Находит подходящие заголовки статьи и делает их сворачиваемыми.
     Берутся заголовки h2–h6, которые лежат прямо в статье: заголовки внутри блоков
     ??? note и других вложенных элементов пропускаются. Заголовок h1 не берётся. */
  function buildSections(article) {
    var headings = Array.prototype.slice.call(article.querySelectorAll("h2, h3, h4, h5, h6"))
      .filter(function (heading) {
        return heading.parentElement === article;
      });

    /* Идём с конца страницы к началу: так при построении раздела верхнего уровня
       вложенные разделы уже готовы и просто переносятся внутрь вместе со своим содержимым. */
    for (var i = headings.length - 1; i >= 0; i--) {
      buildSection(headings[i], i);
    }
  }


  /* ------------------------------------------------------------------------
     ПОЛОСА С КНОПКАМИ «СВЕРНУТЬ ВСЁ» И «РАЗВЕРНУТЬ ВСЁ»
     ------------------------------------------------------------------------ */

  /* Создаёт кнопку полосы: подпись, подсказка и действие при нажатии */
  function makeToolbarButton(label, hint, action) {
    var button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.title = hint;
    button.addEventListener("click", action);
    return button;
  }

  /* Создаёт полосу и ставит её непосредственно перед заголовком первого уровня.
     Если заголовка первого уровня нет, ставит в начало статьи. */
  function buildToolbar(article) {
    var bar = document.createElement("div");
    bar.className = CLS.toolbar;
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", TEXT.toolbarLabel);

    bar.appendChild(makeToolbarButton(TEXT.collapseAll, TEXT.collapseAllHint, function () {
      collapseAll(article);
    }));
    bar.appendChild(makeToolbarButton(TEXT.expandAll, TEXT.expandAllHint, function () {
      expandAll(article);
    }));

    var title = article.querySelector("h1");
    if (title && title.parentElement === article) {
      article.insertBefore(bar, title);
    } else {
      article.insertBefore(bar, article.firstChild);
    }
  }


  /* ------------------------------------------------------------------------
     ПОЛОЖЕНИЕ ПОЛОСЫ ПОД ШАПКОЙ САЙТА
     ------------------------------------------------------------------------ */

  /* Узнаёт, где заканчиваются шапка сайта и вкладки (они остаются на экране при
     прокрутке), и сообщает это стилям через переменные:
       --section-toolbar-top    — на каком расстоянии от верха экрана «прилипает» полоса;
       --section-scroll-offset  — отступ над заголовками при переходе по ссылке,
                                  чтобы полоса и шапка не закрывали заголовок. */
  function updateOffsets() {
    var top = 0;
    ["header.md-header", ".md-tabs"].forEach(function (selector) {
      var element = document.querySelector(selector);
      if (element) {
        var rect = element.getBoundingClientRect();
        if (rect.height > 0) {
          top = Math.max(top, rect.bottom);
        }
      }
    });
    top = Math.ceil(top);

    var bar = document.querySelector("." + CLS.toolbar);
    var barHeight = bar ? bar.offsetHeight : 0;
    var root = document.documentElement;
    root.style.setProperty("--section-toolbar-top", top + "px");
    root.style.setProperty("--section-scroll-offset", (top + barHeight + SCROLL_GAP) + "px");
  }


  /* ------------------------------------------------------------------------
     ПЕРЕХОД ПО ССЫЛКАМ И ПЕЧАТЬ
     ------------------------------------------------------------------------ */

  /* Раскрывает разделы и блоки, скрывающие место, на которое указывает адрес
     страницы (часть после решётки). Вызывается при открытии страницы и при смене адреса. */
  function revealHash() {
    var article = getArticle();
    var id = decodeURIComponent(location.hash.replace(/^#/, ""));
    if (!article || !id) {
      return;
    }
    var target = document.getElementById(id);
    if (target && article.contains(target) && revealAncestors(target, article)) {
      /* Содержимое раскрылось уже после того, как браузер прокрутил страницу, поэтому
         прокручиваем ещё раз */
      target.scrollIntoView();
    }
  }

  /* Раскрывает всё перед печатью и запоминает прежнее состояние, чтобы вернуть его
     после печати. Скрытое содержимое на бумагу не попадает, поэтому перед печатью
     всё должно быть раскрыто. */
  var printSnapshot = null;

  function beforePrint() {
    var article = getArticle();
    if (!article) {
      return;
    }
    printSnapshot = {
      collapsed: getSectionHeadings(article).filter(function (heading) {
        return heading.classList.contains(CLS.collapsed);
      }),
      details: getDetails(article).map(function (details) {
        return { element: details, open: details.open };
      })
    };
    expandAll(article);
  }

  function afterPrint() {
    if (!printSnapshot) {
      return;
    }
    printSnapshot.details.forEach(function (item) {
      item.element.open = item.open;
    });
    printSnapshot.collapsed.forEach(function (heading) {
      setSection(heading, true);
    });
    printSnapshot = null;
  }

  /* Обработчики, общие для всех страниц сайта. Их достаточно подключить один раз:
     при мгновенной навигации страница не перезагружается, и обработчики продолжают работать. */
  var globalHandlersBound = false;

  function bindGlobalHandlers() {
    if (globalHandlersBound) {
      return;
    }
    globalHandlersBound = true;

    /* Щелчок по ссылке на место внутри этой же страницы (например, в правом меню
       «Содержание» или в тексте требования): сначала раскрываем скрывающие его разделы
       и блоки, затем браузер выполняет переход. Фаза перехвата (true) нужна, чтобы
       сработать раньше обработчиков темы. */
    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest('a[href*="#"]') : null;
      var article = getArticle();
      if (!link || !article || link.host !== location.host || link.pathname !== location.pathname) {
        return;
      }
      var id = decodeURIComponent(link.hash.replace(/^#/, ""));
      var target = id ? document.getElementById(id) : null;
      if (target && article.contains(target)) {
        revealAncestors(target, article);
      }
    }, true);

    window.addEventListener("hashchange", revealHash);
    window.addEventListener("resize", updateOffsets);
    window.addEventListener("load", updateOffsets);
    window.addEventListener("beforeprint", beforePrint);
    window.addEventListener("afterprint", afterPrint);

    /* Шрифты могут загрузиться позже и сдвинуть шапку на несколько пикселей */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateOffsets);
    }
  }


  /* ------------------------------------------------------------------------
     ЗАПУСК
     ------------------------------------------------------------------------ */

  /* Подготавливает текущую страницу. Вызывается при первой загрузке и при каждом переходе
     на другую страницу (мгновенная навигация подменяет содержимое без перезагрузки). */
  function init() {
    var article = getArticle();
    if (!article || article.getAttribute("data-sections-ready")) {
      return;   /* статьи нет (например, служебная страница) или страница уже подготовлена */
    }
    article.setAttribute("data-sections-ready", "true");

    buildSections(article);

    /* Полоса нужна, только если на странице есть что сворачивать */
    if (getSectionHeadings(article).length > 0 || getDetails(article).length > 0) {
      buildToolbar(article);
    }

    bindGlobalHandlers();
    updateOffsets();
    revealHash();
  }

  /* document$ — поток событий темы: срабатывает после загрузки каждой страницы, в том числе
     при мгновенной навигации. Если его нет, запускаем скрипт один раз после загрузки страницы. */
  if (typeof document$ !== "undefined" && document$ && typeof document$.subscribe === "function") {
    document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
