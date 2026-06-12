import { mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CHANNEL = 'techleaderschool';
const CHANNEL_URL = `https://t.me/s/${CHANNEL}`;
const CONTENT_DIR = path.join(ROOT, 'src/content/materials');
const ASSETS_DIR = path.join(ROOT, 'assets');
const SERIES = [
  {
    slug: 'series-s-chego-nachat-it-obrazovanie',
    title: 'С чего начать школьное ИТ-образование',
    description: 'Стартовые посты канала: зачем школьнику ИТ, какие навыки важны и как смотреть на траекторию.',
    sourceUrl: 'https://t.me/techleaderschool/3?series=start',
    publishedAt: '2023-12-08',
    order: 16,
    postIds: [3, 22, 23, 24, 27, 29, 32, 37, 38, 39, 40, 41, 43],
  },
  {
    slug: 'series-vremya-na-skuku-i-shakhmaty',
    title: 'Время на скуку и шахматы без кружков',
    description: 'Два поста о домашней среде, самостоятельности и занятиях, которые не всегда требуют кружка.',
    sourceUrl: 'https://t.me/techleaderschool/66?series=boredom-chess',
    publishedAt: '2023-12-27',
    order: 17,
    postIds: [66, 81],
  },
  {
    slug: 'series-nastolnye-igry-dnd-i-slozhnye-zadachi',
    title: 'Настольные игры, DnD и сложные задачи',
    description: 'Посты о групповых играх, DnD, математике, творчестве и совместном решении сложных задач.',
    sourceUrl: 'https://t.me/techleaderschool/89?series=games-dnd',
    publishedAt: '2024-01-09',
    order: 18,
    postIds: [89, 94, 96, 103, 105, 122, 123, 126, 151],
  },
  {
    slug: 'series-kompyuternye-igry-i-deti',
    title: 'Компьютерные игры и дети',
    description: 'Посты о рисках компьютерных игр и о том, как родителям разбираться в игровом опыте детей.',
    sourceUrl: 'https://t.me/techleaderschool/133?series=computer-games',
    publishedAt: '2024-02-12',
    order: 19,
    postIds: [133, 135, 149],
  },
  {
    slug: 'series-kurs-i-obrazovatelnaya-effektivnost',
    title: 'Курс и образовательная эффективность',
    description: 'Посты о результатах учеников, выборе курсов, эффективности программы и устройстве курса Computer Science.',
    sourceUrl: 'https://t.me/techleaderschool/137?series=course-effectiveness',
    publishedAt: '2024-02-16',
    order: 20,
    postIds: [137, 155, 156, 159, 161, 162, 254],
  },
  {
    slug: 'series-olimpiady-shkoly-i-vuzy',
    title: 'Олимпиады, школы и вузы',
    description: 'Посты о роли алгоритмов, олимпиадах, сильных школах, вузах и поступлении.',
    sourceUrl: 'https://t.me/techleaderschool/172?series=olympiads-schools-universities',
    publishedAt: '2024-04-26',
    order: 21,
    postIds: [172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183],
  },
  {
    slug: 'series-intervyu-o-matematike-i-programmirovanii',
    title: 'Интервью о математике и программировании',
    description: 'Анонс и основные мысли интервью с Равилем Алишевым о математике, программировании и олимпиадной подготовке.',
    sourceUrl: 'https://t.me/techleaderschool/185?series=interview-ravil',
    publishedAt: '2024-06-07',
    order: 22,
    postIds: [185, 186, 187, 188],
  },
  {
    slug: 'series-kak-vybirat-kruzhki',
    title: 'Как выбирать кружки по программированию',
    description: 'Серия постов о критериях выбора кружков и курсов по программированию.',
    sourceUrl: 'https://t.me/techleaderschool/202?series=kruzhki',
    publishedAt: '2024-07-25',
    order: 24,
    postIds: [202, 203, 204, 205, 206, 207, 209],
  },
  {
    slug: 'series-kak-i-gde-uchit-matematiku-i-programmirovanie',
    title: 'Как и где изучать математику и программирование',
    description: 'Серия постов о самостоятельном обучении, бесплатных ресурсах и занятиях с преподавателем.',
    sourceUrl: 'https://t.me/techleaderschool/190?series=math-programming',
    publishedAt: '2024-06-28',
    order: 25,
    postIds: [190, 191, 192, 193, 194, 196, 197, 198, 200, 201],
  },
  {
    slug: 'series-tekhnologicheskoe-predprinimatelstvo',
    title: 'Технологическое предпринимательство для школьников',
    description: 'Серия постов о технологических предпринимателях, навыках инженера и школьной траектории.',
    sourceUrl: 'https://t.me/techleaderschool/212?series=tech-entrepreneurship',
    publishedAt: '2024-08-06',
    order: 26,
    postIds: [212, 213, 214, 216, 218, 220, 221, 223, 225, 227, 230, 232, 235, 236, 239],
  },
  {
    slug: 'series-karta-navykov-i-celey',
    title: 'Карта навыков и целей школьного ИТ-образования',
    description: 'Серия постов с картой навыков, пояснениями и связями целей школьного ИТ-образования.',
    sourceUrl: 'https://t.me/techleaderschool/241?series=skills-map',
    publishedAt: '2024-09-13',
    order: 27,
    postIds: [241, 242, 244, 246, 247, 248],
  },
  {
    slug: 'series-ai-i-rynok-programmirovaniya',
    title: 'ИИ, рынок и смысл учить программирование',
    description: 'Серия постов о рынке ИТ, ИИ и роли фундаментального ИТ-образования.',
    sourceUrl: 'https://t.me/techleaderschool/295?series=ai-market',
    publishedAt: '2025-09-17',
    order: 28,
    postIds: [295, 296, 297, 298, 299, 300],
  },
  {
    slug: 'series-reyting-shkol-po-informatike-2025',
    title: 'Рейтинг школ по информатике 2025',
    description: 'Серия постов о сильных школах, регионах и результатах ВсОШ по информатике.',
    sourceUrl: 'https://t.me/techleaderschool/266?series=school-rating',
    publishedAt: '2025-05-13',
    order: 29,
    postIds: [266, 267, 268],
  },
  {
    slug: 'series-posle-osnov-programmirovaniya',
    title: 'После основ программирования',
    description: 'Посты о том, куда двигаться после базового программирования и как смотреть на отборы в сильные кружки.',
    sourceUrl: 'https://t.me/techleaderschool/250?series=after-basics',
    publishedAt: '2024-09-13',
    order: 30,
    postIds: [250, 251, 252],
  },
  {
    slug: 'series-shkola-i-upravlenie-obrazovaniem',
    title: 'Школа и управление образованием',
    description: 'Посты о хорошей школе, классно-урочной системе, командной работе и устройстве эффективного образования.',
    sourceUrl: 'https://t.me/techleaderschool/255?series=school-education',
    publishedAt: '2025-04-01',
    order: 31,
    postIds: [255, 256, 257, 259, 260, 261, 262, 263, 264, 271],
  },
  {
    slug: 'series-esli-ryadom-net-silnoy-sredy',
    title: 'Если рядом нет сильной среды',
    description: 'Посты о том, что делать без сильных кружков и школ рядом, и как относиться к занятиям, которые ребенку не близки.',
    sourceUrl: 'https://t.me/techleaderschool/269?series=no-strong-environment',
    publishedAt: '2025-05-15',
    order: 32,
    postIds: [269, 270],
  },
];

const TITLE_OVERRIDES = new Map([
  [3, 'О канале и курсе'],
  [22, 'Технологические лидеры начинали в школе'],
  [23, 'Марк Цукерберг'],
  [24, 'Илон Маск'],
  [27, 'Программирование в школе и будущая карьера'],
  [29, 'Чему, когда и для чего учить школьников для ИТ'],
  [32, 'Карта навыков и целей в виде картинки'],
  [37, 'Пояснения к карте целей и навыков'],
  [40, 'Международные экзамены по информатике'],
  [41, 'Навыки и приоритеты для родителей'],
  [96, 'Настольные игры у детей'],
  [103, 'Настольные игры и конструктивизм'],
  [137, 'Результат ученика в олимпиадной информатике'],
  [141, 'Анонс статьи на Habr'],
  [145, 'Статья на Habr'],
  [146, 'Закрепленная статья на Habr'],
  [149, 'В какие игры играют дети'],
  [155, 'Математика, программирование и карьера'],
  [158, 'Таблица критериев курса'],
  [159, 'Эффективность образовательной программы'],
  [160, 'Схема образовательной программы'],
  [161, 'Почему у курсов низкая эффективность'],
  [163, 'Схема курса Computer Science'],
  [166, 'Заменит ли ИИ программистов?'],
  [167, 'Почему NVIDIA нанимает программистов'],
  [170, 'Как ИИ меняет работу программистов'],
  [172, 'Как изучение алгоритмов помогает поступить в вуз'],
  [173, 'Как побеждать на олимпиадах'],
  [174, 'Как выбрать сильную школу'],
  [176, 'Рейтинг школ: иллюстрация'],
  [177, 'Сильные школы и вузы'],
  [178, 'Сильнейшие ИТ-вузы в России'],
  [179, 'ВсОШ — не единственный конкурс'],
  [180, 'Рейтинг школ — 2'],
  [185, 'Интервью с Равилем Алишевым'],
  [189, 'Закрепленный пост о курсе Computer Science'],
  [191, 'Как и где изучать математику и программирование'],
  [198, 'Математика: ресурсы'],
  [202, 'Критерии выбора курсов'],
  [203, 'Как выбирать качественные кружки'],
  [211, 'Закрепленный пост об интенсиве'],
  [212, 'Зачем изучать программирование в школе'],
  [213, 'Зачем ставить большие цели в школе'],
  [214, 'Кто такие технологические предприниматели'],
  [215, 'Технологические предприниматели: иллюстрация'],
  [217, 'Роль технологических предпринимателей: иллюстрация'],
  [219, 'Компьютерные технологии в экономике: иллюстрация'],
  [221, 'Навыки технологического предпринимателя'],
  [222, 'Навыки технологического предпринимателя: иллюстрация'],
  [224, 'Навыки инженера: иллюстрация'],
  [226, 'Бизнес-навыки: иллюстрация'],
  [228, 'Бизнес-навыки программиста: иллюстрация'],
  [230, 'Как развивать навыки технологического предпринимательства'],
  [231, 'Развитие навыков: иллюстрация'],
  [233, 'Computer Science и технологические продукты: иллюстрация'],
  [234, 'Технологический продукт: иллюстрация'],
  [237, 'Разработка для клиентов: иллюстрация'],
  [241, 'Карта навыков и целей школьного ИТ-образования'],
  [242, 'Карта навыков и целей: изображения'],
  [246, 'Пояснения к навыкам на карте'],
  [247, 'Чем карта отличается от классического физмат-образования'],
  [250, 'Куда идти после основ программирования'],
  [252, 'Золото российских школьников на IOI'],
  [255, 'Хорошая школа'],
  [259, 'Управление образованием: иллюстрация'],
  [260, 'Решения на уровне ученика'],
  [269, 'Что делать, если рядом нет сильных кружков и школ'],
  [292, 'Отбор в Яндекс Кружок'],
  [293, 'Идеи для новых публикаций'],
  [294, 'Карта моих публикаций'],
  [295, 'Актуально ли учить программирование в 2025'],
  [300, 'Прогноз рынка труда в ИТ'],
  [303, 'Подготовка к ЕГЭ и олимпиады'],
]);

const userAgent =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeNumericEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_match, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function decodeHtml(value) {
  return decodeNumericEntities(value)
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

function textFromHtml(html) {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim(),
  );
}

function yamlString(value) {
  return JSON.stringify(value.replace(/\u2028|\u2029/g, ' '));
}

function extractFrontmatterValue(markdown, key) {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));

  if (!match) {
    return null;
  }

  const raw = match[1].trim();

  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw.slice(1, -1);
    }
  }

  return raw;
}

async function readExistingTelegramMaterials() {
  const result = new Map();
  const filenames = await readdir(CONTENT_DIR);

  for (const filename of filenames) {
    if (!filename.endsWith('.md')) {
      continue;
    }

    const filePath = path.join(CONTENT_DIR, filename);
    const markdown = await readFile(filePath, 'utf8');
    const sourceMatch = markdown.match(
      /sourceUrl:\s*["']https:\/\/t\.me\/techleaderschool\/(\d+)["']/,
    );

    if (!sourceMatch) {
      continue;
    }

    result.set(Number(sourceMatch[1]), {
      slug: filename.replace(/\.md$/, ''),
      title: extractFrontmatterValue(markdown, 'title'),
      order: Number(extractFrontmatterValue(markdown, 'order')) || null,
    });
  }

  return result;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return response.text();
}

async function fetchBytes(url) {
  const response = await fetch(url, {
    headers: {
      'user-agent': userAgent,
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function normalizeUrl(url) {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  return url;
}

function parseMessageText(block) {
  const match = block.match(
    /<div class="tgme_widget_message_text js-message_text"[^>]*>([\s\S]*?)<\/div>/,
  );

  return match
    ? {
        index: match.index,
        type: 'text',
        html: match[1].replace(/^<div class="tgme_widget_message_text js-message_text"[^>]*>/, ''),
      }
    : null;
}

function parseMessagePhotos(block) {
  const photos = [];
  const photoRegex =
    /<a class="tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)[^"]*"[^>]*>[\s\S]*?<\/a>/g;

  for (const match of block.matchAll(photoRegex)) {
    photos.push({
      index: match.index,
      type: 'photo',
      url: normalizeUrl(match[1]),
    });
  }

  return photos;
}

function deriveTitle(post, existing) {
  if (TITLE_OVERRIDES.has(post.id)) {
    return TITLE_OVERRIDES.get(post.id);
  }

  if (existing?.title) {
    return decodeHtml(existing.title);
  }

  const text = textFromHtml(post.textHtml ?? '');
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line !== `@${CHANNEL}`)
    .filter((line) => !/^#\S+$/.test(line));
  const candidate = lines[0] || `Пост канала ${post.id}`;

  return candidate.length > 110 ? `${candidate.slice(0, 107).trim()}...` : candidate;
}

function parsePage(html) {
  const posts = [];
  const beforeMatch = html.match(/class="tme_messages_more[^"]*"[^>]*data-before="(\d+)"/);
  const chunks = html.split('<div class="tgme_widget_message_wrap');

  for (const chunk of chunks) {
    const idMatch = chunk.match(/data-post="techleaderschool\/(\d+)"/);

    if (!idMatch) {
      continue;
    }

    const id = Number(idMatch[1]);
    const datetime = chunk.match(/<time datetime="([^"]+)"/)?.[1] ?? '';
    const textElement = parseMessageText(chunk);
    const photoElements = parseMessagePhotos(chunk);
    const elements = [textElement, ...photoElements].filter(Boolean).sort((left, right) => {
      return left.index - right.index;
    });

    if (elements.length === 0) {
      continue;
    }

    if (textElement && textFromHtml(textElement.html) === 'Channel created') {
      continue;
    }

    posts.push({
      id,
      datetime,
      textHtml: textElement?.html ?? '',
      elements,
    });
  }

  return {
    before: beforeMatch ? Number(beforeMatch[1]) : null,
    posts,
  };
}

async function fetchAllPosts() {
  const postsById = new Map();
  const seenBefore = new Set();
  let before = null;

  while (true) {
    const url = before ? `${CHANNEL_URL}?before=${before}` : CHANNEL_URL;
    const html = await fetchText(url);
    const page = parsePage(html);

    for (const post of page.posts) {
      postsById.set(post.id, post);
    }

    if (!page.before || seenBefore.has(page.before)) {
      break;
    }

    seenBefore.add(page.before);
    before = page.before;
    await sleep(250);
  }

  return [...postsById.values()].sort((left, right) => left.id - right.id);
}

function mediaExtension(url) {
  const match = url.match(/\.(jpe?g|png|webp|gif)(?:[?#].*)?$/i);

  return match ? match[1].toLowerCase().replace('jpeg', 'jpg') : 'jpg';
}

async function fileExists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function downloadPostMedia(post) {
  const urls = [...new Set(post.elements.filter((item) => item.type === 'photo').map((item) => item.url))];
  const mediaMap = new Map();

  for (let index = 0; index < urls.length; index += 1) {
    const url = urls[index];
    const extension = mediaExtension(url);
    const filename = `tg-techleaderschool-${post.id}-${String(index + 1).padStart(2, '0')}.${extension}`;
    const filePath = path.join(ASSETS_DIR, filename);

    if (!(await fileExists(filePath))) {
      const bytes = await fetchBytes(url);
      await writeFile(filePath, bytes);
      await sleep(100);
    }

    mediaMap.set(url, `/assets/${filename}`);
  }

  return mediaMap;
}

function sanitizeTelegramHtml(html, slugByPostId) {
  let result = html
    .replace(/\s+onclick="[^"]*"/g, '')
    .replace(/<a\b[^>]*href="https:\/\/t\.me\/techleaderschool\/(\d+)(?:\?[^"]*)?"[^>]*>/g, (_match, id) => {
      const slug = slugByPostId.get(Number(id));
      return slug ? `<a href="/materials/${slug}/">` : '<a href="/navigator/">';
    })
    .replace(/<a\b[^>]*href="\?q=[^"]*"[^>]*>([\s\S]*?)<\/a>/g, '$1')
    .replace(/<a\b[^>]*href="https:\/\/t\.me\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g, '$1')
    .replace(/<a\b[^>]*href="https:\/\/telegram\.me\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g, '$1');

  result = result.replace(/<a href="(\/materials\/[^"]+\/|\/navigator\/)"\s+[^>]*>/g, '<a href="$1">');

  return decodeNumericEntities(result);
}

function renderBody(post, mediaMap, slugByPostId) {
  const parts = post.elements.map((item) => {
    if (item.type === 'text') {
      return sanitizeTelegramHtml(item.html, slugByPostId);
    }

    const src = mediaMap.get(item.url);
    return src
      ? `<figure><img src="${src}" alt="" loading="lazy" decoding="async" /></figure>`
      : '';
  });

  return `<div class="telegram-original">${parts.join('')}</div>`;
}

function renderMarkdown(post, body, existing) {
  const title = deriveTitle(post, existing);
  const date = post.datetime ? post.datetime.slice(0, 10) : '2026-01-01';
  const order = existing?.order ?? 1000 + post.id;

  return `---
title: ${yamlString(title)}
description: ${yamlString(title)}
category: "Telegram"
sourceLabel: "Пост канала"
sourceUrl: "https://t.me/techleaderschool/${post.id}"
publishedAt: "${date}"
readingTime: ""
order: ${order}
---

${body}
`;
}

function unwrapTelegramBody(body) {
  const trimmed = body.trim();
  const prefix = '<div class="telegram-original">';

  return trimmed.startsWith(prefix) && trimmed.endsWith('</div>')
    ? trimmed.slice(prefix.length, -'</div>'.length)
    : trimmed;
}

function renderSeriesMarkdown(series, bodyByPostId) {
  const parts = series.postIds
    .map((postId) => bodyByPostId.get(postId))
    .filter(Boolean)
    .map(unwrapTelegramBody);

  return `---
title: ${yamlString(series.title)}
description: ${yamlString(series.description)}
category: "Серия"
sourceLabel: "Посты канала"
sourceUrl: "${series.sourceUrl}"
publishedAt: "${series.publishedAt}"
readingTime: ""
order: ${series.order}
---

<div class="telegram-original telegram-series">${parts.join('<hr/>')}</div>
`;
}

async function main() {
  await mkdir(CONTENT_DIR, { recursive: true });
  await mkdir(ASSETS_DIR, { recursive: true });

  const existingByPostId = await readExistingTelegramMaterials();
  const posts = await fetchAllPosts();
  const slugByPostId = new Map();

  for (const post of posts) {
    slugByPostId.set(post.id, existingByPostId.get(post.id)?.slug ?? `telegram-${post.id}`);
  }

  let written = 0;
  let images = 0;
  const bodyByPostId = new Map();

  for (const post of posts) {
    const existing = existingByPostId.get(post.id);
    const slug = slugByPostId.get(post.id);
    const mediaMap = await downloadPostMedia(post);
    const body = renderBody(post, mediaMap, slugByPostId);
    const markdown = renderMarkdown(post, body, existing);

    await writeFile(path.join(CONTENT_DIR, `${slug}.md`), markdown);
    bodyByPostId.set(post.id, body);
    written += 1;
    images += mediaMap.size;
  }

  for (const series of SERIES) {
    await writeFile(
      path.join(CONTENT_DIR, `${series.slug}.md`),
      renderSeriesMarkdown(series, bodyByPostId),
    );
    written += 1;
  }

  console.log(`Imported ${written} Telegram materials from @${CHANNEL}.`);
  console.log(`Linked ${images} local media files.`);
  console.log(`Range: ${posts[0]?.id ?? '-'}...${posts.at(-1)?.id ?? '-'}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
