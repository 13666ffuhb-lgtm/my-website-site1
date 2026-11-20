/* =========================================================
   HEADLINE AUTO-FIT
   ========================================================= */

/*
 * Автоматически уменьшаем размер заголовка,
 * если украинский или английский текст
 * не помещается в одну строку.
 */

const fittedHeadlineSelectors = [
  ".hero h1",
  ".section-intro h2",
  ".about-content h2",
  ".trainers-title",
  ".join-content h2",
];

function fitHeadline(heading) {
  const lines = heading.querySelectorAll(":scope > span");

  if (!lines.length) return;

  const containerWidth =
    heading.parentElement.clientWidth;

  /*
   * Сбрасываем предыдущий размер,
   * чтобы при повторном переключении языка
   * размер не уменьшался каждый раз.
   */
  heading.style.fontSize = "";

  let fontSize =
    parseFloat(getComputedStyle(heading).fontSize);

  /*
   * Нижний предел размера шрифта. Опущен ниже (0.28, было 0.4),
   * потому что на маленьких телефонах довгі українські слова
   * інакше впираються в стелю ще до того, як влізуть в рядок.
   */
  const minFontSize = fontSize * 0.28;

  const widestLine = () =>
    Math.max(
      ...Array.from(lines).map(
        (line) => line.scrollWidth
      )
    );

  let guard = 0;

  /*
   * Постепенно уменьшаем шрифт,
   * пока текст не поместится.
   */
  while (
    widestLine() > containerWidth &&
    fontSize > minFontSize &&
    guard < 90
  ) {
    fontSize -= 1;

    heading.style.fontSize =
      fontSize + "px";

    guard++;
  }
}

function fitAllHeadlines() {
  fittedHeadlineSelectors.forEach(
    (selector) => {
      document
        .querySelectorAll(selector)
        .forEach(fitHeadline);
    }
  );
}


/*
 * Пересчитываем заголовки
 * при изменении размера окна.
 */
window.addEventListener(
  "resize",
  fitAllHeadlines
);


/*
 * Повторно рассчитываем размер
 * после загрузки шрифтов.
 */
if (
  document.fonts &&
  document.fonts.ready
) {
  document.fonts.ready.then(
    fitAllHeadlines
  );
}


/* =========================================================
   МОБІЛЬНЕ МЕНЮ (ГАМБУРГЕР)
   ========================================================= */

/*
 * Кнопка-гамбургер відкриває/закриває
 * випадаюче мобільне меню.
 */

const menuToggle =
  document.querySelector(".menu-toggle");

const mobileMenu =
  document.getElementById("mobile-menu");

function setMobileMenuOpen(isOpen) {
  if (!menuToggle || !mobileMenu) return;

  menuToggle.classList.toggle("is-open", isOpen);
  mobileMenu.classList.toggle("is-open", isOpen);

  menuToggle.setAttribute(
    "aria-expanded",
    String(isOpen)
  );

  /*
   * Блокуємо прокрутку фону, поки меню відкрите.
   */
  document.body.classList.toggle(
    "menu-open",
    isOpen
  );
}

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener(
    "click",
    () => {
      const willOpen =
        !mobileMenu.classList.contains("is-open");

      setMobileMenuOpen(willOpen);
    }
  );

  /*
   * Закриваємо меню після переходу за посиланням.
   */
  mobileMenu
    .querySelectorAll("a")
    .forEach((link) => {
      link.addEventListener(
        "click",
        () => setMobileMenuOpen(false)
      );
    });

  /*
   * Закриваємо меню, якщо екран став достатньо
   * широким (наприклад, повернули телефон
   * горизонтально або відкрили на планшеті).
   */
  window.addEventListener("resize", () => {
    if (
      window.innerWidth > 800 &&
      mobileMenu.classList.contains("is-open")
    ) {
      setMobileMenuOpen(false);
    }
  });
}


/* =========================================================
   LANGUAGE SWITCHER
   ========================================================= */

const languageButtons =
  document.querySelectorAll(
    ".language-button"
  );

const translatableElements =
  document.querySelectorAll(
    "[data-uk][data-en]"
  );


/*
 * Меняем только текст элемента,
 * не удаляя дочерние элементы,
 * например иконку стрелки →.
 */
function setTranslatedText(
  element,
  text
) {
  /*
   * Если внутри элемента нет других
   * HTML-элементов — просто меняем текст.
   */
  if (
    element.children.length === 0
  ) {
    element.textContent = text;
    return;
  }

  /*
   * Ищем первый текстовый узел.
   */
  let textNode =
    element.firstChild;

  while (
    textNode &&
    textNode.nodeType !==
      Node.TEXT_NODE
  ) {
    textNode =
      textNode.nextSibling;
  }

  /*
   * Меняем найденный текст.
   */
  if (textNode) {
    textNode.textContent = text;
  } else {
    /*
     * Если текстового узла нет —
     * создаём его.
     */
    element.insertBefore(
      document.createTextNode(text),
      element.firstChild
    );
  }
}


/*
 * Переключение языка.
 *
 * data-uk = украинский
 * data-en = английский
 */
function changeLanguage(
  language
) {
  translatableElements.forEach(
    (element) => {
      setTranslatedText(
        element,
        element.dataset[language]
      );
    }
  );


  /*
   * Определяем активную кнопку языка.
   */
  languageButtons.forEach(
    (button) => {
      const isActive =
        button.dataset.lang ===
        language;

      button.classList.toggle(
        "active",
        isActive
      );

      button.setAttribute(
        "aria-pressed",
        String(isActive)
      );
    }
  );


  /*
   * Меняем язык документа.
   */
  document.documentElement.lang =
    language;


  /*
   * Сохраняем выбранный язык.
   */
  localStorage.setItem(
    "fitstrong-language",
    language
  );


  /*
   * После смены языка снова
   * подгоняем заголовки.
   */
  fitAllHeadlines();
}


/*
 * Обработка кнопок UA / EN.
 */
languageButtons.forEach(
  (button) => {
    button.addEventListener(
      "click",
      () => {
        changeLanguage(
          button.dataset.lang
        );
      }
    );
  }
);


/*
 * Загружаем сохранённый язык.
 *
 * Если пользователь ещё ничего
 * не выбирал — используется UA.
 */
const savedLanguage =
  localStorage.getItem(
    "fitstrong-language"
  ) || "uk";


changeLanguage(
  savedLanguage
);


/* =========================================================
   КАРУСЕЛЬ
   ========================================================= */

/*
 * Карусель полностью удалена
 * из JavaScript. Поведение карусели тренерів
 * реалізовано окремим inline-скриптом в index.html.
 */