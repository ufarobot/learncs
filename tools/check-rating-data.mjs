import fs from 'node:fs';

import {
  applySchoolCatalog,
  buildCompositeSchoolRating,
  buildOverallRegionRating,
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
  ['programming:2026', { participants: 488, rated: 488, disqualified: 0, schoolResults: 487, schools: 136, regions: 52, winners: 40, prizewinners: 204, score: 23051.416837782344 }],
  ['programming:2025', { participants: 493, rated: 493, disqualified: 0, schoolResults: 493, schools: 175, regions: 70, winners: 40, prizewinners: 185, score: 23406.66666666665 }],
  ['programming:2024', { participants: 377, rated: 303, disqualified: 0, schoolResults: 303, schools: 108, regions: 50, winners: 30, prizewinners: 142, score: 14348 }],
  ['ai:2026', { participants: 248, rated: 245, disqualified: 3, schoolResults: 248, schools: 117, regions: 36, winners: 20, prizewinners: 74, score: 10957.622950819672 }],
  ['security:2026', { participants: 244, rated: 243, disqualified: 1, schoolResults: 244, schools: 158, regions: 44, winners: 19, prizewinners: 93, score: 12203.347107438016 }],
  ['robotics:2026', { participants: 246, rated: 246, disqualified: 0, schoolResults: 246, schools: 122, regions: 31, winners: 20, prizewinners: 93, score: 12709.34693877551 }],
  ['math:2026', { participants: 499, rated: 499, disqualified: 0, schoolResults: 499, schools: 161, regions: 82, winners: 29, prizewinners: 195, score: 24924.236947791163 }],
  ['physics:2026', { participants: 501, rated: 501, disqualified: 0, schoolResults: 501, schools: 139, regions: 68, winners: 40, prizewinners: 188, score: 25756.16 }],
  ['chemistry:2026', { participants: 490, rated: 490, disqualified: 0, schoolResults: 490, schools: 228, regions: 74, winners: 39, prizewinners: 174, score: 24395.173824130867 }],
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
    check(year.schoolResultCount === expected.schoolResults, `School result count mismatch: ${key}`);
    check(year.schoolCount === expected.schools, `Expected school count mismatch: ${key}`);
    check(year.regionCount === expected.regions, `Expected region count mismatch: ${key}`);
    closeTo(year.scoreTotal, expected.score, `Score total mismatch: ${key}`);
    check(year.schools.length === year.schoolCount, `Raw school count mismatch: ${key}`);
    check(year.regions.length === year.regionCount, `Region count mismatch: ${key}`);
    for (const field of [
      'participantCount',
      'ratedParticipantCount',
      'disqualifiedCount',
      'schoolResultCount',
      'schoolCount',
      'regionCount',
    ]) {
      check(Number.isInteger(year[field]) && year[field] >= 0,
        `Invalid non-negative count: ${key} / ${field}`);
    }
    if (year.scoringMethod === 'percentile-by-midrank') {
      check(year.ratedParticipantCount + year.disqualifiedCount === year.participantCount,
        `Rated and disqualified totals mismatch: ${key}`);
    }
    check(Number.isFinite(year.scoreTotal) && year.scoreTotal >= 0,
      `Invalid score total: ${key}`);
    check(sum(year.schools, 'participants') === year.schoolResultCount,
      `School participant total mismatch: ${key}`);

    const expectedRegionParticipants = year.scoringMethod === 'result-category'
      ? year.schoolResultCount
      : year.participantCount;
    check(sum(year.regions, 'participants') === expectedRegionParticipants,
      `Region participant total mismatch: ${key}`);
    check(sum(year.regions, 'winners') === expected.winners, `Winner count mismatch: ${key}`);
    check(sum(year.regions, 'prizewinners') === expected.prizewinners,
      `Prizewinner count mismatch: ${key}`);
    closeTo(sum(year.regions, 'score'), year.scoreTotal, `Region score total mismatch: ${key}`);
    if (year.schoolResultCount === expectedRegionParticipants) {
      closeTo(sum(year.schools, 'score'), year.scoreTotal, `School score total mismatch: ${key}`);
    } else {
      check(sum(year.schools, 'score') <= year.scoreTotal, `School score exceeds protocol total: ${key}`);
    }

    const sourceSchoolIds = new Set();
    const regionNames = new Set(year.regions.map((region) => region.name));
    for (const school of year.schools) {
      check(!sourceSchoolIds.has(school.id), `Duplicate source school row: ${key} / ${school.id}`);
      sourceSchoolIds.add(school.id);
      check(typeof school.id === 'string' && school.id.length > 0,
        `School ID is missing: ${key} / ${school.name}`);
      check(sourceIdToCard.has(school.id), `School is missing from catalog: ${key} / ${school.id}`);
      check(regionNames.has(school.region), `School region is missing from region totals: ${key} / ${school.name}`);
      check(Number.isFinite(school.score) && school.score >= 0,
        `Invalid school score: ${key} / ${school.name}`);
      check(['winners', 'prizewinners', 'participants'].every((field) => (
        Number.isInteger(school[field]) && school[field] >= 0
      )), `Invalid school result count: ${key} / ${school.name}`);
      check(school.participants >= school.winners + school.prizewinners,
        `School result counts exceed participants: ${key} / ${school.name}`);
    }
    const regionIds = new Set();
    const uniqueRegionNames = new Set();
    for (const region of year.regions) {
      check(typeof region.id === 'string' && region.id.length > 0,
        `Region ID is missing: ${key} / ${region.name}`);
      check(!regionIds.has(region.id), `Duplicate region ID: ${key} / ${region.id}`);
      check(!uniqueRegionNames.has(region.name), `Duplicate region name: ${key} / ${region.name}`);
      regionIds.add(region.id);
      uniqueRegionNames.add(region.name);
      check(Number.isFinite(region.score) && region.score >= 0,
        `Invalid region score: ${key} / ${region.name}`);
      check(['winners', 'prizewinners', 'participants'].every((field) => (
        Number.isInteger(region[field]) && region[field] >= 0
      )), `Invalid region result count: ${key} / ${region.name}`);
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
const canonicalProfilesById = new Map(canonicalProfiles.map((profile) => [profile.id, profile]));
const informaticsProfileIds = ['programming', 'ai', 'security', 'robotics'];
const informaticsProfiles = informaticsProfileIds.map((profileId) => canonicalProfilesById.get(profileId));
check(informaticsProfiles.every(Boolean), 'Informatics composite profiles are incomplete');
const informaticsRating = buildCompositeSchoolRating(informaticsProfiles, currentYear, {
  weightBy: 'school-score',
});
check(informaticsRating.profileOptions.map((profile) => profile.id).join(',')
  === informaticsProfileIds.join(','), 'Informatics composite profile order changed');
closeTo(sum(informaticsRating.schools, 'score'), 10000,
  'Informatics rating must total 10,000', 1e-7);
const informaticsCandidateSchools = informaticsRating.schools.filter((school) => (
  informaticsRating.profileOptions.some((profile) => (
  profile.scoreTotal > 0
  && Math.round(((school.profiles[profile.id]?.score ?? 0) / profile.scoreTotal) * 10000) > 10
  ))
));
check(informaticsCandidateSchools.every((school) => informaticsRating.profileOptions.some((profile) => (
  Math.round(((school.profiles[profile.id]?.score ?? 0) / profile.scoreTotal) * 10000) > 10
))), 'Informatics candidate filtering is inconsistent');
check(buildCompositeSchoolRating(informaticsProfiles, currentYear, {
  minimumScore: 10,
  weightBy: 'school-score',
}).schools.every((school) => school.score > 10), 'Informatics minimum score is not enforced');

const overallRegions = buildOverallRegionRating(informaticsProfiles, currentYear);
closeTo(sum(overallRegions.regions, 'score'), 10000,
  'Overall region rating must total 10,000', 1e-7);
check(overallRegions.regionCount === new Set(
  informaticsProfiles.flatMap((profile) => (
    profile.years.find((year) => year.year === currentYear).regions.map((region) => region.name)
  ))
).size, 'Overall region count mismatch');
check(buildOverallRegionRating(informaticsProfiles, currentYear, { minimumScore: 10 })
  .regions.every((region) => region.score > 10), 'Overall region minimum score is not enforced');

const informaticsParticipants = sourceProfiles
  .filter((profile) => ['programming', 'ai', 'security', 'robotics'].includes(profile.id))
  .reduce((total, profile) => (
    total + profile.years.find((year) => year.year === currentYear).participantCount
  ), 0);
check(informaticsParticipants === 1226, 'Informatics profile participant total must be 1,226');

const subjectProfileIds = ['programming', 'math', 'physics', 'chemistry'];
const subjectProfiles = subjectProfileIds.map((profileId) => canonicalProfilesById.get(profileId));
check(subjectProfiles.every(Boolean), 'Four-subject composite profiles are incomplete');
const subjectRating = buildCompositeSchoolRating(subjectProfiles, currentYear, {
  weightBy: 'participants',
});
const expectedSubjectWeights = new Map([
  ['programming', 488],
  ['math', 499],
  ['physics', 501],
  ['chemistry', 490],
]);
check(subjectRating.weightBy === 'participants', 'Four-subject composite weight mode changed');
check(subjectRating.weightTotal === 1978, 'Four-subject participant weight total must be 1,978');
check(subjectRating.profileOptions.map((profile) => profile.id).join(',')
  === subjectProfileIds.join(','), 'Four-subject composite profile order changed');
for (const profile of subjectRating.profileOptions) {
  check(profile.weight === expectedSubjectWeights.get(profile.id),
    `Four-subject weight mismatch: ${profile.id}`);
}
closeTo(sum(subjectRating.schools, 'score'), 10000,
  'Four-subject rating must total 10,000', 1e-7);
const subjectVisibleSchools = subjectRating.schools.filter((school) => Math.round(school.score) > 10);

const statusNeutralProfiles = structuredClone(subjectProfiles);
for (const profile of statusNeutralProfiles) {
  for (const year of profile.years) {
    for (const school of year.schools) {
      school.winners = 0;
      school.prizewinners = 0;
    }
  }
}
const statusNeutralRating = buildCompositeSchoolRating(statusNeutralProfiles, currentYear, {
  weightBy: 'participants',
});
const statusNeutralScores = new Map(statusNeutralRating.schools.map((school) => [school.id, school.score]));
for (const school of subjectRating.schools) {
  closeTo(statusNeutralScores.get(school.id), school.score,
    `Diploma status changed composite score: ${school.name}`);
}

check(extraProfiles.profiles.find((profile) => profile.id === 'math').source
  === 'https://static.centraluniversity.ru/documents/bachelor/vseros-math-2026/protokol-zasedaniya-zhyuri.pdf',
'Math must use the official 2026 final protocol');
check(extraProfiles.profiles.find((profile) => profile.id === 'physics').source
  === 'https://disk.yandex.ru/d/II0YOj5-UrUjgQ',
'Physics must use the official organizer protocol link');
check(extraProfiles.profiles.find((profile) => profile.id === 'chemistry').source
  === 'https://my.sirius.online/content/protokol_himiya_vsosh_2026.pdf',
'Chemistry must use the official 2026 final protocol');

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
  + `${catalog.schools.length} school cards, `
  + `${informaticsCandidateSchools.length} informatics candidates, `
  + `${subjectVisibleSchools.length} four-subject candidates.`
);
