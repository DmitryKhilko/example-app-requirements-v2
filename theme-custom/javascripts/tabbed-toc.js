document$.subscribe(function () {
  function syncTocWithTabs() {
    // Находим все блоки вкладок контента
    const tabSets = document.querySelectorAll(".tabbed-set");
    if (!tabSets.length) return;

    // Собираем ID всех заголовков внутри скрытых (неактивных) вкладок
    const hiddenHeadingIds = new Set();
    const visibleHeadingIds = new Set();

    tabSets.forEach((tabSet) => {
      const inputs = tabSet.querySelectorAll(":scope > input[type='radio']");
      const blocks = tabSet.querySelectorAll(":scope > .tabbed-content > .tabbed-block");

      inputs.forEach((input, index) => {
        const block = blocks[index];
        if (!block) return;

        const headings = block.querySelectorAll("h2[id], h3[id], h4[id], h5[id], h6[id]");
        headings.forEach((h) => {
          if (input.checked) {
            visibleHeadingIds.add(h.id);
          } else {
            hiddenHeadingIds.add(h.id);
          }
        });
      });
    });

    // Скрываем или показываем соответствующие ссылки в правом меню (Содержание)
    const tocLinks = document.querySelectorAll(".md-sidebar--secondary .md-nav__link");
    tocLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const targetId = decodeURIComponent(href.slice(1));
      const navItem = link.closest(".md-nav__item");
      if (!navItem) return;

      if (hiddenHeadingIds.has(targetId) && !visibleHeadingIds.has(targetId)) {
        navItem.style.display = "none";
      } else {
        navItem.style.display = "";
      }
    });
  }

  // Запускаем при загрузке страницы и при каждом клике на вкладку
  syncTocWithTabs();
  document.addEventListener("change", function (e) {
    if (e.target && e.target.matches(".tabbed-set > input[type='radio']")) {
      syncTocWithTabs();
    }
  });
});
