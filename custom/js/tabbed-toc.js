// Правое меню («Содержание») на страницах с вкладками (=== "Назначение" / === "Цели"):
//  1) показывает заголовки только активной вкладки;
//  2) подсвечивает текущий раздел по прокрутке, считая только заголовки активной вкладки.
//     Штатная подсветка темы учитывает и скрытые вкладки (у них нулевые координаты), поэтому работает только на первой.
// Файл лежит в custom/js/ и подключается шаблоном custom/main.html (в docs/ только документы аналитиков).
(function () {
  "use strict";

  // Защита от повторного выполнения при переходах без перезагрузки страницы
  if (window.__tabbedTocInit) return;
  window.__tabbedTocInit = true;

  // При navigation.instant тема превращает якоря оглавления в абсолютные ссылки (https://.../page/#id),
  // поэтому ищем по вхождению «#», а сам якорь берём из link.hash.
  var TOC_LINKS =
    "[data-md-component='toc'] a[href*='#'], .md-sidebar--secondary a[href*='#']";

  // Находит вкладку, которой принадлежит заголовок, и сообщает, активна ли она.
  // Берём состояние из DOM (какая radio-кнопка отмечена), а не из геометрии, поэтому
  // результат не зависит от CSS, анимаций и момента отрисовки.
  function isInInactiveTab(el) {
    var node = el;
    while (node) {
      var block = node.closest(".tabbed-block");
      if (!block) return false;

      var set = block.closest(".tabbed-set");
      if (set) {
        var blocks = Array.prototype.slice.call(
          set.querySelectorAll(":scope > .tabbed-content > .tabbed-block")
        );
        var inputs = Array.prototype.slice.call(
          set.querySelectorAll(":scope > input[type='radio']")
        );
        var index = blocks.indexOf(block);
        if (index !== -1 && inputs[index] && !inputs[index].checked) return true;
      }
      // Вложенные вкладки: поднимаемся выше и проверяем внешний набор
      node = set ? set.parentElement : null;
    }
    return false;
  }

  function syncTocWithTabs() {
    var links = document.querySelectorAll(TOC_LINKS);
    var shown = [];
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hash = link.hash;
      if (!hash || hash.length < 2) continue;

      var heading = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!heading) continue;

      var item = link.closest("li") || link;
      if (isInInactiveTab(heading)) {
        item.style.setProperty("display", "none", "important");
        setState(link, false, false);
      } else {
        item.style.removeProperty("display");
        shown.push({ link: link, heading: heading });
      }
    }
    updateActive(shown);
  }

  var ACTIVE = "md-nav__link--active";
  var PASSED = "md-nav__link--passed";

  function setState(link, passed, active) {
    // Меняем класс только при расхождении, чтобы не зацикливать наблюдатель за DOM
    if (link.classList.contains(PASSED) !== passed) link.classList.toggle(PASSED, passed);
    if (link.classList.contains(ACTIVE) !== active) link.classList.toggle(ACTIVE, active);
  }

  // Нижняя граница закреплённых шапки и вкладок: заголовок «пройден», когда поднялся выше неё
  function stickyOffset() {
    var bottom = 0;
    var bars = document.querySelectorAll(".md-header, .md-tabs");
    for (var i = 0; i < bars.length; i++) {
      var r = bars[i].getBoundingClientRect();
      if (r.bottom > bottom && r.top <= 1) bottom = r.bottom;
    }
    return bottom + 16;
  }

  // Подсветка: активен последний заголовок видимой вкладки, поднявшийся выше границы; выше него — «пройдены»
  function updateActive(shown) {
    var offset = stickyOffset();
    var atBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight - 2;
    var current = -1;
    for (var i = 0; i < shown.length; i++) {
      if (shown[i].heading.getBoundingClientRect().top <= offset) current = i;
    }
    if (atBottom && shown.length) current = shown.length - 1;
    for (var j = 0; j < shown.length; j++) {
      setState(shown[j].link, j <= current, j === current);
    }
  }

  var timer = null;
  function schedule() {
    // Несколько вызовов подряд (клик + change + перерисовка меню) схлопываются в один
    if (timer) cancelAnimationFrame(timer);
    timer = requestAnimationFrame(function () {
      timer = null;
      syncTocWithTabs();
    });
  }

  // Переключение вкладки: radio-кнопки вкладок (change) и клики по заголовкам вкладок
  document.addEventListener("change", function (e) {
    if (e.target && e.target.closest && e.target.closest(".tabbed-set")) schedule();
  });
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".tabbed-labels, .tabbed-set label")) schedule();
  });
  window.addEventListener("hashchange", schedule);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener("pageshow", schedule);

  // Тема может заново построить оглавление (переход по страницам без перезагрузки, прокрутка к якорю),
  // из-за чего скрытые пункты появляются снова. Следим за изменением состава DOM и пересчитываем.
  // Класс-атрибуты тоже отслеживаем: тема может сама переставить подсветку, тогда возвращаем нашу.
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class"],
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  // Совместимость с navigation.instant, если тема предоставляет document$
  if (typeof document$ !== "undefined" && document$.subscribe) {
    document$.subscribe(schedule);
  }
})();
