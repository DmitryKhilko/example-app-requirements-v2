// Фильтрация оглавления правого меню для вкладки файла index.md по активной вкладке
function syncTocWithTabs() {
  // Находим все ссылки в правом меню (проверяем оба возможных селектора)
  const tocLinks = document.querySelectorAll(
    ".md-sidebar--secondary a[href^='#'], [data-md-component='toc'] a[href^='#']"
  );
  if (!tocLinks.length) return;

  tocLinks.forEach((link) => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;

    const targetId = decodeURIComponent(href.slice(1));
    const targetHeading = document.getElementById(targetId);
    const navItem = link.closest("li") || link;

    if (!targetHeading) return;

    // Проверяем, находится ли заголовок внутри скрытой вкладки
    // getClientRects().length === 0 означает, что элемент или его родитель скрыт (display: none)
    const isHidden = targetHeading.getClientRects().length === 0;

    if (isHidden) {
      navItem.style.display = "none";
    } else {
      navItem.style.display = "";
    }
  });
}

// Запуск при первой загрузке DOM
document.addEventListener("DOMContentLoaded", () => {
  syncTocWithTabs();
  // Повторный запуск с небольшой задержкой на случай асинхронной инициализации вкладок темой
  setTimeout(syncTocWithTabs, 100);
});

// Поддержка быстрой навигации (navigation.instant)
if (typeof document$ !== "undefined") {
  document$.subscribe(() => {
    syncTocWithTabs();
    setTimeout(syncTocWithTabs, 100);
  });
}

// Отслеживание любых переключений вкладок (клик, изменение radio-кнопки или смена URL-якоря)
document.addEventListener("change", () => setTimeout(syncTocWithTabs, 10));
document.addEventListener("click", (e) => {
  if (e.target.closest("label, [role='tab'], .tabbed-labels")) {
    setTimeout(syncTocWithTabs, 10);
  }
});
window.addEventListener("hashchange", () => setTimeout(syncTocWithTabs, 10));
