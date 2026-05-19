# learncs.ru

Первая статическая версия сайта для GitHub Pages.

## Структура

- `index.html` — главная страница.
- `apply/index.html` — страница заявки.
- `camps/index.html` — раздел летних интенсивов.
- `camps/kazan/index.html` — страница лагеря в IT-лицее КФУ.
- `camps/fethiye/index.html` — страница IT-интенсива в Fethiye.
- `design-system/index.html` — живой каталог дизайн-блоков и рецептов страниц.
- `assets/styles.css` — общий стиль.
- `assets/main.js` — мобильное меню.
- `assets/logo.svg`, `assets/logo-light.svg`, `assets/favicon.svg` — логотип в стиле LMS и favicon.
- `assets/logo-icon-black-on-white.svg`, `assets/logo-icon-white-on-black.svg` — квадратные SVG-иконки логотипа.
- `assets/logo-icon-black-on-white.png`, `assets/logo-icon-white-on-black.png` — PNG-экспорты 1024×1024.
- `assets/logo-mark-black.svg`, `assets/logo-mark-white.svg` — прозрачные монохромные SVG-знаки.
- `assets/*.svg` — локальные визуальные заглушки.
- `assets/og-image.png` — изображение для Open Graph.
- `assets/teacher-airat.jpg`, `assets/platform-screen.jpg`, `assets/math-materials.jpg` — временные изображения из `resources`.
- `assets/camp-it-lyceum.jpg`, `assets/teacher-danil-nafikov.jpg`, `assets/teacher-ilshat-safiullin.jpg`, `assets/docs/*` — материалы из архива лагеря.

Сборка отсутствует: сайт можно публиковать как обычную статическую папку.

## Дизайн-система

Перед новым лендингом или крупным визуальным изменением смотри:

```text
http://127.0.0.1:8123/design-system/
```

Главный контракт описан в `DESIGN_GUIDE.md`: токены, разрешенные блоки, рецепты страниц и порядок изменений.

Проверка дизайн-ограничений:

```bash
python3 tools/check-design.py
```

## Публикация

Текущая GitHub Pages-публикация рассчитана на адрес `https://ufarobot.github.io/learncs/`.

`learncs.ru` пока остается на старом сайте; поэтому `CNAME` и `sitemap.xml` не публикуются в репозиторий.

## Локальный просмотр

```bash
./preview.sh
```

Скрипт всегда поднимает сайт по адресу `http://127.0.0.1:8123/`.
