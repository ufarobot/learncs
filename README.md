# learncs.ru

Astro-лендинг learncs.ru. Сейчас главный источник истины — главная страница.

## Структура

- `src/pages/index.astro` — главная страница.
- `src/content/pages/home.md` — контент главной в формате `blocks[]`.
- `src/components/BlockRenderer.astro` и `src/components/blocks/` — approved layout-шаблоны для лендингов.
- `apply/index.html` — страница заявки.
- `BRANDBOOK.md` — брендбук: позиционирование, цветовые роли, контраст, UX и маркетинговая логика.
- `DESIGN_GUIDE.md` — правила лейаута, ритма, режимов работы и page recipes.
- `COMPONENTS.md` — реестр компонентов и разрешенных вариантов, чтобы одинаковые блоки не расходились между лендингами.
- `assets/styles.css` — общий стиль.
- `assets/main.js` — мобильное меню.
- `assets/favicon.svg` — favicon.
- `assets/logo-icon-white-on-black.png` — текущая иконка в шапке и футере.
- `assets/og-image.png` — изображение для Open Graph.
- `assets/hero-student-organic.webp`, `assets/teacher-airat.jpg`, `assets/platform-screen.webp`, `assets/reviews-learncs.jpg` — изображения главной.

Черновые страницы лагерей, учеников и подробной программы не входят в текущий рабочий контур. Новый дизайн сначала доводится на главной, затем при необходимости переносится на остальные страницы отдельным решением.

## Дизайн

Главные контракты описаны в `BRANDBOOK.md`, `DESIGN_GUIDE.md` и `COMPONENTS.md`: бренд, цветовые роли, токены, компоненты, разрешенные блоки и порядок изменений.

Не добавляй новые page-specific визуальные семьи, дубли CSS или исключения без явного запроса. Если запрос ведет к усложнению проекта, сначала предупреди и предложи более простой вариант на базе главной.

Каждый новый или измененный блок нужно сразу проектировать для desktop и mobile. Ориентир — уже обкатанные решения верхних блоков главной: сетки схлопываются в одну колонку, текст занимает нормальную ширину, изображения имеют max-width, нет горизонтального overflow и заголовков по одному слову в строке.

Режимы работы:

- Эксперимент: небольшие правки текста, порядка блоков, композиции или цвета. Правим узко, без `check-design`, build, publish и браузерной перепроверки, если это явно не попросили.
- Продакшн-фиксация: когда звучит `фиксируем`, `вноси`, `делаем`, `в прод` или `deploy`. Тогда сверяем `BRANDBOOK.md`, `DESIGN_GUIDE.md`, `COMPONENTS.md` и запускаем `npm run check:prod`.

Точечная проверка дизайн-ограничений:

```bash
python3 tools/check-design.py
```

## Astro workflow

Astro — source-of-truth для главной. Данные главной лежат в `src/content/pages/home.md` как список `blocks[]`; каждый блок выбирает `template` из approved layout-шаблонов. В обычной контентной работе нужно менять Markdown/frontmatter, а не CSS.

Локальная разработка после установки зависимостей:

```bash
npm install
npm run dev
```

Astro dev-сервер настроен на тот же адрес: `http://127.0.0.1:8123/`. Если уже запущен `./preview.sh`, его нужно остановить перед `npm run dev`.

Canonical preview gate для Codex и ручной проверки после site-правок:

```bash
bash "/Users/airatishimbaev/Developer/Personal manager/tools/site-previews.sh" ensure --project learncs
```

Команда проверяет `http://127.0.0.1:8123/`, восстанавливает canonical LaunchAgent при конфликте порта или недоступном preview и печатает URL. Внешние браузеры для preview не открывай: видимую проверку делай только в правом Codex in-app Browser. Не запускай fallback preview-порты для learncs.

Repo-local debug fallback:

```bash
npm run preview:dev
```

Используй его только когда нужно отладить сам learncs preview helper.

Локальная сборка:

```bash
npm run build
```

Продакшн-проверка для агента:

```bash
npm run check:prod
```

Команда запускает дизайн-чек и сборку Astro. Она не проверяет уже запущенный dev-сервер на `8123`, потому что обычно он открыт вручную через `npm run dev`, а shell-проверка может не иметь доступа к этому процессу.
После browser-visible site-правок все равно запусти central preview gate:

```bash
bash "/Users/airatishimbaev/Developer/Personal manager/tools/site-previews.sh" ensure --project learncs
```

Если нужно отдельно проверить доступность preview из shell:

```bash
npm run check:preview
```

Если пользователь явно разрешил временный fallback preview для ручного просмотра агентом:

```bash
npm run preview:agent
```

Публикация без GitHub Actions:

```bash
npm run publish:local
```

Этот шаг копирует готовые файлы из `dist/` в статическую корневую публикацию. После него нужно пройти central preview gate, затем коммитить результат обычным способом.
Этот шаг копирует готовые файлы из `dist/` в статическую корневую публикацию. После него нужно пройти central preview gate, затем коммитить результат обычным способом.

Быстрый ручной деплой с проверкой, публикацией, коммитом и push:

```bash
./deploy.sh
```

Сообщение коммита собирается из локального `DEPLOY_LOG.md`. Добавить запись:

```bash
./deploy.sh log "описание изменения"
```

## Публикация

Текущая публикация рассчитана на адрес `https://learncs.ru/`.

`CNAME`, `robots.txt` и `sitemap.xml` входят в SEO-поверхность сайта. `sitemap.xml` генерируется Astro из `src/pages/sitemap.xml.js`, затем `npm run publish:local` копирует его из `dist/` в корень вместе с обновленной главной страницей.

## Локальный просмотр

```bash
bash "/Users/airatishimbaev/Developer/Personal manager/tools/site-previews.sh" ensure --project learncs
```

Canonical preview всегда использует `http://127.0.0.1:8123/`.
Локальный `./preview.sh` оставлен как совместимая обертка и делегирует в этот же central preview manager.
