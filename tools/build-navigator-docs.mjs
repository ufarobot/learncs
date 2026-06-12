import { copyFile, cp, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { hiddenMaterialSlugs, materialDuplicateTargets as duplicateTargets } from '../src/lib/material-duplicates.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BOOK_ROOT = process.env.BOOK_ROOT ?? '/Users/airatishimbaev/Developer/git-cs-book';
const NAVIGATOR_ROOT = path.join(ROOT, 'navigator-docs');
const DOCS_DIR = path.join(NAVIGATOR_ROOT, 'docs');
const DIST_NAVIGATOR_DIR = path.join(ROOT, 'dist/navigator');
const PUBLIC_NAVIGATOR_DIR = path.join(ROOT, 'public/navigator');
const MATERIALS_DIR = path.join(ROOT, 'src/content/materials');
const GENERATED_MATERIALS_DIR = path.join(DOCS_DIR, 'materials');
const GENERATED_TOPICS_DIR = path.join(DOCS_DIR, 'topics');
const MKDOCS_BIN =
  process.env.MKDOCS_BIN ?? '/Library/Frameworks/Python.framework/Versions/3.12/bin/mkdocs';

const titleOverrides = new Map([
  ['telegram-294', 'Карта моих публикаций'],
]);

const displayTitleOverrides = new Map([
  ['kak-vyrastit-itshnika', 'Как вырастить ИТшника'],
  ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
]);

const localUrlRewrites = new Map([
  ['https://habr.com/ru/articles/767252/', '/navigator/materials/kak-vyrastit-itshnika/'],
  ['https://habr.com/ru/articles/834370/', '/navigator/materials/zachem-izuchat-programmirovanie-v-shkole/'],
]);

const mainMaterials = [
  ['telegram-294', 'Карта моих публикаций'],
  ['series-s-chego-nachat-it-obrazovanie', 'С чего начать школьное ИТ-образование'],
  ['kak-vyrastit-itshnika', 'Как вырастить ИТшника'],
  ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
  ['karta-vozmozhnostey', 'Карта возможностей'],
  ['series-karta-navykov-i-celey', 'Карта навыков и целей'],
  ['series-kak-i-gde-uchit-matematiku-i-programmirovanie', 'Как и где изучать математику и программирование'],
  ['series-kak-vybirat-kruzhki', 'Как выбирать кружки'],
  ['ege-i-olimpiady', 'ЕГЭ и олимпиады'],
  ['series-ai-i-rynok-programmirovaniya', 'ИИ, рынок и смысл учить программирование'],
];

const topicGroups = [
  {
    slug: 'start',
    title: 'С чего начать',
    items: [
      ['series-s-chego-nachat-it-obrazovanie', 'С чего начать школьное ИТ-образование'],
      ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
      ['kak-vyrastit-itshnika', 'Как вырастить ИТшника'],
    ],
  },
  {
    slug: 'path',
    title: 'Карты и траектория',
    items: [
      ['telegram-294', 'Карта моих публикаций'],
      ['series-karta-navykov-i-celey', 'Карта навыков и целей'],
      ['karta-vozmozhnostey', 'Карта возможностей'],
      ['series-kak-i-gde-uchit-matematiku-i-programmirovanie', 'Как и где изучать математику и программирование'],
      ['series-posle-osnov-programmirovaniya', 'После основ программирования'],
    ],
  },
  {
    slug: 'kruzhki',
    title: 'Кружки и курсы',
    items: [
      ['series-kak-vybirat-kruzhki', 'Как выбирать кружки по программированию'],
      ['series-kurs-i-obrazovatelnaya-effektivnost', 'Курс и образовательная эффективность'],
      ['series-esli-ryadom-net-silnoy-sredy', 'Если рядом нет сильной среды'],
      ['telegram-292', 'Отбор в Яндекс Кружок'],
    ],
  },
  {
    slug: 'olympiads',
    title: 'Олимпиады, ЕГЭ и поступление',
    items: [
      ['ege-i-olimpiady', 'ЕГЭ и олимпиады'],
      ['series-olimpiady-shkoly-i-vuzy', 'Олимпиады, школы и вузы'],
      ['series-reyting-shkol-po-informatike-2025', 'Рейтинг школ по информатике 2025'],
      ['series-posle-osnov-programmirovaniya', 'После основ программирования'],
      ['telegram-195', 'Для чего участвовать в олимпиадах'],
    ],
  },
  {
    slug: 'ai-market',
    title: 'ИИ и рынок',
    items: [
      ['series-ai-i-rynok-programmirovaniya', 'ИИ, рынок и смысл учить программирование'],
    ],
  },
  {
    slug: 'games',
    title: 'Игры и навыки',
    items: [
      ['series-vremya-na-skuku-i-shakhmaty', 'Время на скуку и шахматы без кружков'],
      ['series-nastolnye-igry-dnd-i-slozhnye-zadachi', 'Настольные игры, DnD и сложные задачи'],
      ['series-kompyuternye-igry-i-deti', 'Компьютерные игры и дети'],
    ],
  },
  {
    slug: 'entrepreneurship',
    title: 'Технологическое предпринимательство',
    items: [
      ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
    ],
  },
  {
    slug: 'school',
    title: 'Школа и образование',
    items: [
      ['series-shkola-i-upravlenie-obrazovaniem', 'Школа и управление образованием'],
      ['series-esli-ryadom-net-silnoy-sredy', 'Если рядом нет сильной среды'],
      ['telegram-265', 'Каналы об образовании'],
    ],
  },
];

const archivePostGroups = [
  {
    title: 'Старт и позиция',
    postIds: [3, 22, 23, 24, 27, 29, 32, 37, 38, 39, 40, 41, 43, 293, 294],
  },
  {
    title: 'Игры, математика и навыки',
    postIds: [66, 81, 89, 94, 96, 103, 105, 122, 123, 126, 133, 135, 149, 151],
  },
  {
    title: 'Курс, анонсы и методика',
    postIds: [137, 139, 141, 145, 146, 155, 156, 158, 159, 160, 161, 162, 163, 165, 185, 186, 187, 188, 189, 210, 211, 254, 282, 304],
  },
  {
    title: 'Олимпиады, школы и вузы',
    postIds: [172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 190, 195, 250, 251, 252, 266, 267, 268, 269, 270],
  },
  {
    title: 'Математика, ресурсы и кружки',
    postIds: [191, 192, 193, 194, 196, 197, 198, 200, 201, 202, 203, 204, 205, 206, 207, 209, 292],
  },
  {
    title: 'Технологическое предпринимательство',
    postIds: [212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 230, 231, 232, 233, 234, 235, 236, 237, 239],
  },
  {
    title: 'Карты навыков и траектории',
    postIds: [241, 242, 244, 246, 247, 248, 301, 303],
  },
  {
    title: 'Школа и образование',
    postIds: [255, 256, 257, 259, 260, 261, 262, 263, 264, 265, 271],
  },
  {
    title: 'ИИ и рынок',
    postIds: [166, 167, 170, 295, 296, 297, 298, 299, 300],
  },
  {
    title: 'Служебное',
    postIds: [199],
  },
];

const seriesPostIds = new Map([
  ['series-s-chego-nachat-it-obrazovanie', [3, 22, 23, 24, 27, 29, 32, 37, 38, 39, 40, 41, 43]],
  ['series-vremya-na-skuku-i-shakhmaty', [66, 81]],
  ['series-nastolnye-igry-dnd-i-slozhnye-zadachi', [89, 94, 96, 103, 105, 122, 123, 126]],
  ['series-kompyuternye-igry-i-deti', [133, 135, 149]],
  ['series-kurs-i-obrazovatelnaya-effektivnost', [137, 139, 141, 145, 146, 155, 156, 158, 159, 160, 161, 162, 163, 165]],
  ['series-intervyu-o-matematike-i-programmirovanii', [185, 186, 187, 188]],
  ['series-kak-i-gde-uchit-matematiku-i-programmirovanie', [190, 191, 192, 193, 194, 196, 197, 198, 200, 201]],
  ['series-kak-vybirat-kruzhki', [202, 203, 204, 205, 206, 207, 209]],
  ['series-olimpiady-shkoly-i-vuzy', [172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 190, 195]],
  ['series-reyting-shkol-po-informatike-2025', [266, 267, 268]],
  ['series-posle-osnov-programmirovaniya', [250, 251, 252]],
  ['series-karta-navykov-i-celey', [241, 242, 244, 246, 247, 248, 301, 303]],
  ['series-shkola-i-upravlenie-obrazovaniem', [255, 256, 257, 259, 260, 261, 262, 263, 264, 271]],
  ['series-ai-i-rynok-programmirovaniya', [295, 296, 297, 298, 299, 300]],
  ['series-esli-ryadom-net-silnoy-sredy', [269, 270]],
  ['series-tekhnologicheskoe-predprinimatelstvo', [212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 230, 231, 232, 233, 234, 235, 236, 237, 239]],
]);

const archiveIdeaGroups = [
  {
    title: 'Старт и траектория',
    items: [
      ['telegram-294', 'Карта моих публикаций'],
      ['series-s-chego-nachat-it-obrazovanie', 'С чего начать школьное ИТ-образование'],
      ['kak-vyrastit-itshnika', 'Как вырастить ИТшника'],
      ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
      ['series-karta-navykov-i-celey', 'Карта навыков и целей'],
      ['karta-vozmozhnostey', 'Карта возможностей'],
      ['series-posle-osnov-programmirovaniya', 'После основ программирования'],
    ],
  },
  {
    title: 'Кружки и ресурсы',
    items: [
      ['series-kak-i-gde-uchit-matematiku-i-programmirovanie', 'Как и где изучать математику и программирование'],
      ['series-kak-vybirat-kruzhki', 'Как выбирать кружки'],
      ['series-esli-ryadom-net-silnoy-sredy', 'Если рядом нет сильной среды'],
      ['telegram-292', 'Отбор в Яндекс Кружок'],
      ['telegram-265', 'Каналы об образовании'],
    ],
  },
  {
    title: 'Олимпиады и школы',
    items: [
      ['ege-i-olimpiady', 'ЕГЭ и олимпиады'],
      ['series-olimpiady-shkoly-i-vuzy', 'Олимпиады, школы и вузы'],
      ['series-reyting-shkol-po-informatike-2025', 'Рейтинг школ по информатике 2025'],
      ['series-shkola-i-upravlenie-obrazovaniem', 'Школа и управление образованием'],
    ],
  },
  {
    title: 'Игры и навыки',
    items: [
      ['series-vremya-na-skuku-i-shakhmaty', 'Время на скуку и шахматы без кружков'],
      ['series-nastolnye-igry-dnd-i-slozhnye-zadachi', 'Настольные игры, DnD и сложные задачи'],
      ['series-kompyuternye-igry-i-deti', 'Компьютерные игры и дети'],
    ],
  },
  {
    title: 'Курс, методика и рынок',
    items: [
      ['series-kurs-i-obrazovatelnaya-effektivnost', 'Курс и образовательная эффективность'],
      ['series-intervyu-o-matematike-i-programmirovanii', 'Интервью о математике и программировании'],
      ['series-ai-i-rynok-programmirovaniya', 'ИИ, рынок и смысл учить программирование'],
    ],
  },
];

const archivedSeriesPostIds = new Set([...seriesPostIds.values()].flat());
const archiveIdeaSlugs = new Set(
  archiveIdeaGroups.flatMap((group) => group.items.map(([slug]) => duplicateTargets.get(slug) ?? slug)),
);

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyIfExists(from, to) {
  if (!(await exists(from))) {
    return;
  }

  await mkdir(path.dirname(to), { recursive: true });
  await copyFile(from, to);
}

function yamlString(value) {
  return JSON.stringify(value);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) {
    return { data: {}, body: markdown };
  }

  const end = markdown.indexOf('\n---\n', 4);

  if (end === -1) {
    return { data: {}, body: markdown };
  }

  const frontmatter = markdown.slice(4, end);
  const body = markdown.slice(end + 5).trimStart();
  const data = {};

  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    const trimmed = rawValue.trim();

    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      try {
        data[key] = JSON.parse(trimmed);
      } catch {
        data[key] = trimmed.slice(1, -1);
      }
      continue;
    }

    data[key] = trimmed;
  }

  return { data, body };
}

function telegramPostId(entry) {
  const match = entry.sourceUrl?.match(/^https:\/\/t\.me\/techleaderschool\/(\d+)$/);

  return match ? Number(match[1]) : null;
}

function htmlText(value) {
  return value
    .replace(/<figure[\s\S]*?<\/figure>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function seriesPartTitle(part, index) {
  const boldMatch = part.match(/<b>([\s\S]*?)<\/b>/i);
  const candidate = boldMatch ? htmlText(boldMatch[1]) : htmlText(part);
  const title = candidate
    .replace(/^#+\s*/, '')
    .replace(/^[-–—•]\s*/, '')
    .slice(0, 90)
    .trim();

  return title || `Часть ${index + 1}`;
}

async function readMaterials() {
  const filenames = (await readdir(MATERIALS_DIR)).filter((filename) => filename.endsWith('.md'));
  const entries = [];

  for (const filename of filenames) {
    const slug = filename.replace(/\.md$/, '');
    const markdown = await readFile(path.join(MATERIALS_DIR, filename), 'utf8');
    const { data, body } = extractFrontmatter(markdown);

    entries.push({
      slug,
      title: titleOverrides.get(slug) ?? data.title ?? slug,
      description: data.description ?? data.title ?? slug,
      sourceUrl: data.sourceUrl ?? '',
      order: Number(data.order) || 1000,
      body,
    });
  }

  return entries.sort((left, right) => left.order - right.order || left.slug.localeCompare(right.slug));
}

function rewriteLinks(body) {
  let rewritten = body
    .replace(/href="\/materials\/([^"]+)\/"/g, 'href="/navigator/materials/$1/"')
    .replace(/href="\.\.\/materials\/([^"]+)\/"/g, 'href="/navigator/materials/$1/"')
    .replace(/\]\(\/materials\/([^)]+)\/\)/g, '](/navigator/materials/$1/)')
    .replace(/\]\(\.\.\/materials\/([^)]+)\/\)/g, '](/navigator/materials/$1/)');

  for (const [externalUrl, localUrl] of localUrlRewrites) {
    const escapedUrl = escapeRegExp(externalUrl);
    rewritten = rewritten
      .replace(
        new RegExp(
          `href="${escapedUrl}"(?:\\s+target="_blank")?(?:\\s+rel="noopener(?: noreferrer nofollow)?")?`,
          'g',
        ),
        `href="${localUrl}"`,
      )
      .replace(new RegExp(`\\]\\(${escapedUrl}\\)`, 'g'), `](${localUrl})`);
  }

  for (const [duplicateSlug, targetSlug] of duplicateTargets) {
    rewritten = rewritten
      .replace(
        new RegExp(`href="/navigator/materials/${escapeRegExp(duplicateSlug)}/"`, 'g'),
        `href="/navigator/materials/${targetSlug}/"`,
      )
      .replace(
        new RegExp(`\\]\\(/navigator/materials/${escapeRegExp(duplicateSlug)}/\\)`, 'g'),
        `](/navigator/materials/${targetSlug}/)`,
      );
  }

  return rewritten;
}

function renderSeriesContents(entry, body, entryByPostId) {
  if (!body.includes('telegram-series')) {
    return body;
  }

  const match = body.match(/^<div class="telegram-original telegram-series">([\s\S]*)<\/div>$/);

  if (!match) {
    return body;
  }

  const parts = match[1].split(/<hr\s*\/?>/i);

  if (parts.length < 3) {
    return body;
  }

  const postIds = seriesPostIds.get(entry.slug) ?? [];
  const linkedParts = parts.map((part, index) => {
    const anchor = `<a id="part-${index + 1}" class="series-part-anchor"></a>`;
    return `${anchor}${part.trim()}`;
  });
  const links = parts
    .map((part, index) => {
      const postTitle = entryByPostId.get(postIds[index])?.title;
      const title = postTitle ?? seriesPartTitle(part, index);
      return `<li><a href="#part-${index + 1}">${title}</a></li>`;
    })
    .join('\n');
  const contents = `<div class="series-contents"><strong>Содержание</strong><ol>${links}</ol></div>`;

  return `${contents}\n\n<div class="telegram-original telegram-series">${linkedParts.join('<hr/>')}</div>`;
}

function renderMaterial(entry, entryByPostId) {
  const targetSlug = duplicateTargets.get(entry.slug);

  if (targetSlug) {
    return `# ${displayTitleOverrides.get(entry.slug) ?? entry.title}\n\n<meta name="robots" content="noindex">\n<meta http-equiv="refresh" content="0; url=../${targetSlug}/">\n\n[Открыть статью](${targetSlug}.md)\n`;
  }

  const body = renderSeriesContents(entry, rewriteLinks(entry.body.trim()), entryByPostId);
  const title = displayTitleOverrides.get(entry.slug) ?? entry.title;

  return `# ${title}\n\n${body}\n`;
}

function materialPath(slug) {
  return `materials/${slug}.md`;
}

function navItem(slug, label, entryBySlug) {
  const targetSlug = duplicateTargets.get(slug) ?? slug;
  const entry = entryBySlug.get(targetSlug);

  if (!entry || hiddenMaterialSlugs.has(entry.slug)) {
    return null;
  }

  return { title: label ?? entry.title, path: materialPath(entry.slug) };
}

function navItems(items, entryBySlug) {
  return items.map(([slug, label]) => navItem(slug, label, entryBySlug)).filter(Boolean);
}

function topicPath(slug) {
  return `topics/${slug}.md`;
}

function archivePath() {
  return 'archive.md';
}

function renderNavItems(items, indent = 2) {
  const pad = ' '.repeat(indent);
  const lines = [];

  for (const item of items) {
    if (item.path) {
      lines.push(`${pad}- ${yamlString(item.title)}: ${item.path}`);
      continue;
    }

    lines.push(`${pad}- ${yamlString(item.title)}:`);
    lines.push(renderNavItems(item.items, indent + 4));
  }

  return lines.join('\n');
}

function renderLinkList(items) {
  const links = items.map((item) => `<li><a href="/navigator/${item.path.replace(/\.md$/, '/')}">${item.title}</a></li>`).join('\n');
  return `<ul class="navigator-link-list">\n${links}\n</ul>`;
}

function renderTopicLinks(topicItems) {
  const links = topicItems
    .map((group) => `<li><a href="/navigator/${topicPath(group.slug).replace(/\.md$/, '/')}">${group.title}</a></li>`)
    .join('\n');
  return `<ul class="navigator-link-list navigator-topic-list">\n${links}\n<li><a href="/navigator/archive/">Архив канала</a></li>\n</ul>`;
}

function renderIndex(mainItems, topicItems) {
  return `# Навигатор

## Главное { .navigator-home-direction }

${renderLinkList(mainItems)}

## Темы { .navigator-home-direction }

${renderTopicLinks(topicItems)}
`;
}

function renderTopicPage(group) {
  return `# ${group.title}

${renderLinkList(group.items)}
`;
}

function renderArchiveIdeaGroups(ideaGroups) {
  return ideaGroups
    .map((group) => `## ${group.title}\n\n${renderLinkList(group.items)}`)
    .join('\n\n');
}

function renderArchive(ideaGroups, archiveItems) {
  const ideas = renderArchiveIdeaGroups(ideaGroups);
  const groups = archiveItems
    .map((group) => `### ${group.title}\n\n${renderLinkList(group.items)}`)
    .join('\n\n');

  return `# Архив канала\n\n${ideas}\n\n## Отдельные заметки\n\n${groups}\n`;
}

function renderMkdocsConfig(navTree) {
  return `site_name: "Навигатор"\nsite_url: "https://learncs.ru/navigator/"\nrepo_name: "learncs.ru"\nrepo_url: "https://learncs.ru/"\nedit_uri: ""\ndocs_dir: docs\nsite_dir: ../dist/navigator\nuse_directory_urls: true\n\ntheme:\n  name: material\n  language: ru\n  features:\n    - navigation.sections\n    - navigation.footer\n    - navigation.indexes\n    - content.code.copy\n    - content.tabs.link\n  icon:\n    repo: material/link-variant\n\nmarkdown_extensions:\n  - attr_list\n  - admonition\n  - pymdownx.details\n  - tables\n  - pymdownx.arithmatex:\n      generic: true\n  - pymdownx.highlight:\n      anchor_linenums: true\n      line_spans: __span\n      pygments_lang_class: true\n  - pymdownx.inlinehilite\n  - pymdownx.snippets\n  - pymdownx.superfences\n  - pymdownx.tabbed:\n      alternate_style: true\n\nplugins:\n  - search\n\nextra:\n  generator: false\n\nextra_css:\n  - stylesheets/extra.css\n  - stylesheets/navigator.css\n\nextra_javascript:\n  - javascripts/math-nowrap.js\n\nvalidation:\n  nav:\n    omitted_files: ignore\n\nnav:\n${renderNavItems(navTree, 2)}\n`;
}

function duplicateLocation(slug) {
  return `materials/${slug}/`;
}

function isDuplicateSearchLocation(location) {
  return [...duplicateTargets.keys()].some((slug) => {
    const prefix = duplicateLocation(slug);
    return location === prefix || location.startsWith(`${prefix}#`);
  });
}

async function removeDuplicateSearchEntries(siteDir) {
  const searchIndexPath = path.join(siteDir, 'search/search_index.json');

  if (!(await exists(searchIndexPath))) {
    return;
  }

  const searchIndex = JSON.parse(await readFile(searchIndexPath, 'utf8'));
  searchIndex.docs = searchIndex.docs.filter((doc) => !isDuplicateSearchLocation(doc.location ?? ''));

  await writeFile(searchIndexPath, `${JSON.stringify(searchIndex)}\n`);
}

async function removeDuplicateSitemapEntries(siteDir) {
  const sitemapPath = path.join(siteDir, 'sitemap.xml');

  if (!(await exists(sitemapPath))) {
    return;
  }

  let sitemap = await readFile(sitemapPath, 'utf8');

  for (const slug of duplicateTargets.keys()) {
    const url = `https://learncs.ru/navigator/${duplicateLocation(slug)}`;
    sitemap = sitemap.replace(
      new RegExp(`\\s*<url>\\s*<loc>${escapeRegExp(url)}</loc>[\\s\\S]*?</url>`, 'g'),
      '',
    );
  }

  await writeFile(sitemapPath, sitemap);
  await writeFile(`${sitemapPath}.gz`, gzipSync(sitemap));
}

async function postprocessNavigatorBuild(siteDir) {
  await removeDuplicateSearchEntries(siteDir);
  await removeDuplicateSitemapEntries(siteDir);
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? ROOT,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with ${code}`));
    });
  });
}

async function main() {
  await rm(GENERATED_MATERIALS_DIR, { recursive: true, force: true });
  await rm(GENERATED_TOPICS_DIR, { recursive: true, force: true });
  await mkdir(GENERATED_MATERIALS_DIR, { recursive: true });
  await mkdir(GENERATED_TOPICS_DIR, { recursive: true });

  await copyIfExists(
    path.join(BOOK_ROOT, 'docs/stylesheets/extra.css'),
    path.join(DOCS_DIR, 'stylesheets/extra.css'),
  );
  await copyIfExists(
    path.join(BOOK_ROOT, 'docs/javascripts/math-nowrap.js'),
    path.join(DOCS_DIR, 'javascripts/math-nowrap.js'),
  );

  const materials = await readMaterials();
  const entryBySlug = new Map(materials.map((entry) => [entry.slug, entry]));
  const entryByPostId = new Map(
    materials
      .map((entry) => [telegramPostId(entry), entry])
      .filter(([postId]) => postId !== null),
  );

  for (const entry of materials) {
    if (hiddenMaterialSlugs.has(entry.slug)) {
      continue;
    }

    await writeFile(path.join(GENERATED_MATERIALS_DIR, `${entry.slug}.md`), renderMaterial(entry, entryByPostId));
  }

  const mainItems = navItems(mainMaterials, entryBySlug);
  const archiveIdeaItems = archiveIdeaGroups
    .map((group) => ({
      title: group.title,
      items: navItems(group.items, entryBySlug),
    }))
    .filter((group) => group.items.length > 0);
  const topicItems = topicGroups
    .map((group) => ({
      slug: group.slug,
      title: group.title,
      items: navItems(group.items, entryBySlug),
    }))
    .filter((group) => group.items.length > 0);
  const archiveItems = archivePostGroups
    .map((group) => ({
      title: group.title,
      items: group.postIds
        .map((postId) => {
          const entry = entryByPostId.get(postId);
          if (
            entry &&
            (duplicateTargets.has(entry.slug) ||
              hiddenMaterialSlugs.has(entry.slug) ||
              archiveIdeaSlugs.has(entry.slug) ||
              archivedSeriesPostIds.has(postId))
          ) {
            return null;
          }
          return entry ? { title: entry.title, path: materialPath(entry.slug) } : null;
        })
        .filter(Boolean),
    }))
    .filter((group) => group.items.length > 0);
  const navTree = [
    { title: 'Оглавление', path: 'index.md' },
    ...topicItems.map((group) => ({ title: group.title, path: topicPath(group.slug) })),
    {
      title: 'Статьи',
      items: navItems(
        [
          ['kak-vyrastit-itshnika', 'Как вырастить ИТшника'],
          ['zachem-izuchat-programmirovanie-v-shkole', 'Зачем изучать программирование в школе'],
        ],
        entryBySlug,
      ),
    },
    { title: 'Архив канала', path: archivePath() },
  ];

  for (const group of topicItems) {
    await writeFile(path.join(GENERATED_TOPICS_DIR, `${group.slug}.md`), renderTopicPage(group));
  }

  await writeFile(path.join(DOCS_DIR, 'index.md'), renderIndex(mainItems, topicItems));
  await writeFile(path.join(DOCS_DIR, archivePath()), renderArchive(archiveIdeaItems, archiveItems));
  await writeFile(path.join(NAVIGATOR_ROOT, 'mkdocs.yml'), renderMkdocsConfig(navTree));

  await run(MKDOCS_BIN, ['build', '--clean', '-f', path.join(NAVIGATOR_ROOT, 'mkdocs.yml')]);
  await postprocessNavigatorBuild(DIST_NAVIGATOR_DIR);
  await rm(PUBLIC_NAVIGATOR_DIR, { recursive: true, force: true });
  await mkdir(path.dirname(PUBLIC_NAVIGATOR_DIR), { recursive: true });
  await cp(DIST_NAVIGATOR_DIR, PUBLIC_NAVIGATOR_DIR, { recursive: true });

  console.log(`Built MkDocs navigator with ${materials.length} materials.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
