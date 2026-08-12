import fs from 'node:fs';

import {
  applySchoolCatalog,
  buildOverallRegionRating,
  buildOverallSchoolRating,
} from '../src/lib/rating-school-catalog.js';

const readJson = (path) => JSON.parse(fs.readFileSync(new URL(path, import.meta.url), 'utf8'));
const history = readJson('../src/data/rating-history.json');
const extraProfiles = readJson('../src/data/rating-extra-profiles.json');
const catalog = readJson('../src/data/rating-school-catalog.json');

const fail = (message) => {
  throw new Error(message);
};
const check = (condition, message) => {
  if (!condition) fail(message);
};
const sum = (items, field) => items.reduce((total, item) => total + item[field], 0);
const closeTo = (actual, expected, message, tolerance = 1e-8) => {
  if (Math.abs(actual - expected) > tolerance) {
    fail(`${message}: ${actual} != ${expected}`);
  }
};

const sourceProfiles = [
  { id: 'programming', name: history.profile, years: history.years },
  ...extraProfiles.profiles,
];
const expectations = new Map([
  ['programming:2026', { participants: 488, rated: 488, disqualified: 0, score: 23051.416837782344 }],
  ['programming:2025', { participants: 493, rated: 493, disqualified: 0, score: 23406.66666666665 }],
  ['programming:2024', { participants: 377, rated: 303, disqualified: 0, score: 14348 }],
  ['ai:2026', { participants: 248, rated: 245, disqualified: 3, score: 10957.622950819672 }],
  ['security:2026', { participants: 244, rated: 243, disqualified: 1, score: 12203.347107438016 }],
  ['robotics:2026', { participants: 246, rated: 246, disqualified: 0, score: 12709.34693877551 }],
  ['math:2026', { participants: 499, rated: 499, disqualified: 0, score: 24924.236947791163 }],
]);

const cardIds = new Set();
const sourceIdToCard = new Map();
const cardNames = new Set();
for (const card of catalog.schools) {
  check(!cardIds.has(card.id), `Duplicate school card ID: ${card.id}`);
  cardIds.add(card.id);
  check(Array.isArray(card.aliases), `Aliases are missing: ${card.id}`);
  check(Array.isArray(card.sourceIds) && card.sourceIds.length > 0, `Source IDs are missing: ${card.id}`);
  check(card.name.length <= 70, `Display name is too long: ${card.name}`);
  check(!/["']/.test(card.name), `Display name contains straight quotes: ${card.name}`);
  check((card.name.match(/«/g) ?? []).length === (card.name.match(/»/g) ?? []).length,
    `Display name has unbalanced quotes: ${card.name}`);
  check(!/\s{2,}|№\d|Гим назия/.test(card.name), `Display name is not normalized: ${card.name}`);
  check(!card.city || card.name.toLocaleLowerCase('ru-RU').includes(card.city.toLocaleLowerCase('ru-RU')),
    `Display name does not include its locality: ${card.name}`);

  const nameKey = `${card.region}\n${card.name.toLocaleLowerCase('ru-RU')}`;
  check(!cardNames.has(nameKey), `Duplicate display name in one region: ${card.name}`);
  cardNames.add(nameKey);

  for (const sourceId of card.sourceIds) {
    check(!sourceIdToCard.has(sourceId), `Source ID is assigned twice: ${sourceId}`);
    sourceIdToCard.set(sourceId, card.id);
  }
}

for (const profile of sourceProfiles) {
  for (const year of profile.years) {
    const key = `${profile.id}:${year.year}`;
    const expected = expectations.get(key);
    check(expected, `Unexpected profile and year: ${key}`);
    check(year.participantCount === expected.participants, `Participant count mismatch: ${key}`);
    check(year.ratedParticipantCount === expected.rated, `Rated participant count mismatch: ${key}`);
    check(year.disqualifiedCount === expected.disqualified, `Disqualified count mismatch: ${key}`);
    closeTo(year.scoreTotal, expected.score, `Score total mismatch: ${key}`);
    check(year.schools.length === year.schoolCount, `Raw school count mismatch: ${key}`);
    check(year.regions.length === year.regionCount, `Region count mismatch: ${key}`);
    check(sum(year.schools, 'participants') === year.schoolResultCount,
      `School participant total mismatch: ${key}`);

    const expectedRegionParticipants = year.scoringMethod === 'result-category'
      ? year.schoolResultCount
      : year.participantCount;
    check(sum(year.regions, 'participants') === expectedRegionParticipants,
      `Region participant total mismatch: ${key}`);
    closeTo(sum(year.regions, 'score'), year.scoreTotal, `Region score total mismatch: ${key}`);
    if (year.schoolResultCount === expectedRegionParticipants) {
      closeTo(sum(year.schools, 'score'), year.scoreTotal, `School score total mismatch: ${key}`);
    } else {
      check(sum(year.schools, 'score') <= year.scoreTotal, `School score exceeds protocol total: ${key}`);
    }

    const sourceSchoolIds = new Set();
    for (const school of year.schools) {
      check(!sourceSchoolIds.has(school.id), `Duplicate source school row: ${key} / ${school.id}`);
      sourceSchoolIds.add(school.id);
      check(sourceIdToCard.has(school.id), `School is missing from catalog: ${key} / ${school.id}`);
      check(school.participants >= school.winners + school.prizewinners,
        `School result counts exceed participants: ${key} / ${school.name}`);
    }
    for (const region of year.regions) {
      check(region.participants >= region.winners + region.prizewinners,
        `Region result counts exceed participants: ${key} / ${region.name}`);
      check(!['Северная Осетия', 'ФТ Сириус'].includes(region.name),
        `Region name is not normalized: ${key} / ${region.name}`);
    }
  }
}

const canonicalProfiles = sourceProfiles.map((profile) => ({
  ...profile,
  years: applySchoolCatalog(profile.years, catalog),
}));
const checkCompetitionRanks = (entries, context) => {
  entries.forEach((entry, index) => {
    const expectedRank = index > 0 && Math.abs(entry.score - entries[index - 1].score) <= 1e-9
      ? entries[index - 1].rank
      : index + 1;
    check(entry.rank === expectedRank, `Competition rank mismatch: ${context} / ${entry.name}`);
  });
};

for (const profile of canonicalProfiles) {
  const yearsByNumber = new Map(profile.years.map((year) => [year.year, year]));
  for (const year of profile.years) {
    const rawYear = sourceProfiles.find((item) => item.id === profile.id)
      .years.find((item) => item.year === year.year);
    closeTo(sum(year.schools, 'score'), sum(rawYear.schools, 'score'),
      `Canonical school score changed: ${profile.id}:${year.year}`);
    check(sum(year.schools, 'participants') === sum(rawYear.schools, 'participants'),
      `Canonical school participant total changed: ${profile.id}:${year.year}`);
    checkCompetitionRanks(year.schools, `${profile.id}:${year.year}:schools`);
    checkCompetitionRanks(year.regions, `${profile.id}:${year.year}:regions`);

    const previousYear = yearsByNumber.get(year.year - 1);
    const comparable = Boolean(previousYear && previousYear.scoringMethod === year.scoringMethod);
    const previousSchools = new Map(previousYear?.schools.map((school) => [school.id, school]) ?? []);
    for (const school of year.schools) {
      const shouldCompare = Boolean(comparable && previousSchools.has(school.id));
      check((school.previousScore !== null) === shouldCompare,
        `Unexpected year comparison: ${profile.id}:${year.year} / ${school.name}`);
    }
  }
}

const currentYear = 2026;
const overall = buildOverallSchoolRating(canonicalProfiles, currentYear);
closeTo(sum(overall.schools, 'score'), 10000, 'Overall rating must total 10,000', 1e-7);
const candidateSchools = overall.schools.filter((school) => overall.profileOptions.some((profile) => (
  profile.scoreTotal > 0
  && Math.round(((school.profiles[profile.id]?.score ?? 0) / profile.scoreTotal) * 10000) > 10
)));
check(candidateSchools.every((school) => overall.profileOptions.some((profile) => (
  Math.round(((school.profiles[profile.id]?.score ?? 0) / profile.scoreTotal) * 10000) > 10
))), 'Overall candidate filtering is inconsistent');
check(buildOverallSchoolRating(canonicalProfiles, currentYear, { minimumScore: 10 })
  .schools.every((school) => school.score > 10), 'Overall minimum score is not enforced');

const overallRegions = buildOverallRegionRating(canonicalProfiles, currentYear);
closeTo(sum(overallRegions.regions, 'score'), 10000,
  'Overall region rating must total 10,000', 1e-7);
check(overallRegions.regionCount === new Set(
  canonicalProfiles.flatMap((profile) => (
    profile.years.find((year) => year.year === currentYear).regions.map((region) => region.name)
  ))
).size, 'Overall region count mismatch');
check(buildOverallRegionRating(canonicalProfiles, currentYear, { minimumScore: 10 })
  .regions.every((region) => region.score > 10), 'Overall region minimum score is not enforced');

const informaticsParticipants = sourceProfiles
  .filter((profile) => ['programming', 'ai', 'security', 'robotics'].includes(profile.id))
  .reduce((total, profile) => (
    total + profile.years.find((year) => year.year === currentYear).participantCount
  ), 0);
check(informaticsParticipants === 1226, 'Informatics profile participant total must be 1,226');
check(extraProfiles.profiles.find((profile) => profile.id === 'math').source
  === 'https://static.centraluniversity.ru/documents/bachelor/vseros-math-2026/protokol-zasedaniya-zhyuri.pdf',
'Math must use the official 2026 final protocol');

const knownCards = new Map(catalog.schools.map((card) => [card.id, card]));
check(knownCards.get('school-dff6d43ba6ae')?.sourceIds.includes('school-45208575f61c'),
  'North Ossetia physics and mathematics lyceum is not merged');
check(knownCards.get('school-5d27cf4933af')?.sourceIds.includes('school-736fde06171c'),
  'Alferov academic lyceum is not merged');
check(knownCards.get('school-29a87a46ce14')?.city === 'Нальчик',
  'Sunny City locality is not normalized');
check(knownCards.get('school-db24a4ef0696')?.city === 'Дубна',
  'Kadyshevsky lyceum locality is not normalized');

console.log(
  `Rating data OK: ${sourceProfiles.length} profiles, ${expectations.size} year datasets, `
  + `${catalog.schools.length} school cards, ${candidateSchools.length} overall candidates.`
);
