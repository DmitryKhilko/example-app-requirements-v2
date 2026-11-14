// Правое меню («Содержание») показывает заголовки только активной вкладки (=== "Назначение" / === "Цели").
// Файл лежит в theme-custom/javascripts/ и подключается шаблоном theme-custom/main.html (в docs/ только документы аналитиков).
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
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var hash = link.hash;
      if (!hash || hash.length < 2) continue;

      var heading = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!heading) continue;

      var item = link.closest("li") || link;
      if (isInInactiveTab(heading)) {
        item.style.setProperty("display", "none", "important");
      } else {
        item.style.removeProperty("display");
      }
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
  window.addEventListener("pageshow", schedule);

  // Тема может заново построить оглавление (переход по страницам без перезагрузки, прокрутка к якорю),
  // из-за чего скрытые пункты появляются снова. Следим за изменением состава DOM и пересчитываем.
  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true,
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
