const buildSchoolIndex = (catalog) => {
  const index = new Map();

  for (const school of catalog.schools) {
    for (const sourceId of school.sourceIds) {
      if (index.has(sourceId)) {
        throw new Error(`School source ID is assigned twice: ${sourceId}`);
      }
      index.set(sourceId, school);
    }
  }

  return index;
};

const assignCompetitionRanks = (schools) => {
  let previousScore = null;
  let rank = 0;

  return schools.map((school, index) => {
    if (previousScore === null || Math.abs(school.score - previousScore) > 1e-9) {
      previousScore = school.score;
      rank = index + 1;
    }

    return { ...school, rank };
  });
};

const canonicalizeYear = (yearRating, schoolIndex) => {
  const schoolsById = new Map();

  for (const sourceSchool of yearRating.schools) {
    const card = schoolIndex.get(sourceSchool.id);
    if (!card) {
      throw new Error(`School is missing from the catalog: ${sourceSchool.id}`);
    }

    const school = schoolsById.get(card.id) ?? {
      id: card.id,
      rank: sourceSchool.rank,
      name: card.name,
      city: card.city,
      region: card.region,
      officialName: card.officialName,
      aliases: card.aliases,
      score: 0,
      previousScore: null,
      changePercent: null,
      winners: 0,
      prizewinners: 0,
      participants: 0,
    };

    school.rank = Math.min(school.rank, sourceSchool.rank);
    school.score += sourceSchool.score;
    school.winners += sourceSchool.winners;
    school.prizewinners += sourceSchool.prizewinners;
    school.participants += sourceSchool.participants;
    schoolsById.set(card.id, school);
  }

  const schools = assignCompetitionRanks([...schoolsById.values()]
    .sort((left, right) => (
      right.score - left.score
      || left.rank - right.rank
      || left.name.localeCompare(right.name, 'ru')
    )));
  const regions = assignCompetitionRanks([...yearRating.regions]
    .sort((left, right) => (
      right.score - left.score || left.name.localeCompare(right.name, 'ru')
    )));

  return {
    ...yearRating,
    schoolCount: schools.length,
    regionCount: regions.length,
    schools,
    regions,
  };
};

const addEntriesComparison = (entries, previousEntries, normalization) => {
  const previousById = new Map(previousEntries.map((entry) => [entry.id, entry]));

  return entries.map((entry) => {
    const previousEntry = previousById.get(entry.id);
    if (!previousEntry) {
      return { ...entry, previousScore: null, changePercent: null };
    }

    const previousScore = previousEntry.score * normalization;
    return {
      ...entry,
      previousScore,
      changePercent: previousScore === 0
        ? null
        : (entry.score - previousScore) / previousScore,
    };
  });
};

const addYearComparison = (yearRating, previousYearRating) => {
  if (
    !previousYearRating
    || yearRating.scoringMethod !== previousYearRating.scoringMethod
  ) {
    return {
      ...yearRating,
      schools: yearRating.schools.map((school) => ({
        ...school,
        previousScore: null,
        changePercent: null,
      })),
      regions: yearRating.regions.map((region) => ({
        ...region,
        previousScore: null,
        changePercent: null,
      })),
    };
  }

  const totalScore = (entries) => entries.reduce((total, entry) => total + entry.score, 0);
  const schoolNormalization = totalScore(yearRating.schools)
    / totalScore(previousYearRating.schools);
  const regionNormalization = totalScore(yearRating.regions)
    / totalScore(previousYearRating.regions);

  return {
    ...yearRating,
    schools: addEntriesComparison(
      yearRating.schools,
      previousYearRating.schools,
      schoolNormalization
    ),
    regions: addEntriesComparison(
      yearRating.regions,
      previousYearRating.regions,
      regionNormalization
    ),
  };
};

export const applySchoolCatalog = (years, catalog) => {
  const schoolIndex = buildSchoolIndex(catalog);
  const canonicalYears = years.map((yearRating) => canonicalizeYear(yearRating, schoolIndex));
  const yearsByNumber = new Map(canonicalYears.map((yearRating) => [yearRating.year, yearRating]));

  return canonicalYears.map((yearRating) => (
    addYearComparison(yearRating, yearsByNumber.get(yearRating.year - 1))
  ));
};

export const buildCompositeSchoolRating = (
  profiles,
  year,
  { minimumScore = 0, weightBy = 'school-score' } = {}
) => {
  if (!['school-score', 'participants'].includes(weightBy)) {
    throw new Error(`Unsupported composite rating weight: ${weightBy}`);
  }

  const profileRatings = profiles.map((profile) => {
    const yearRating = profile.years.find((item) => item.year === year);
    if (!yearRating) {
      throw new Error(`Profile ${profile.id} has no rating for ${year}`);
    }

    const schoolScoreTotal = yearRating.schools.reduce(
      (total, school) => total + school.score,
      0
    );

    return {
      id: profile.id,
      name: profile.name,
      yearRating,
      schoolScoreTotal,
      weight: weightBy === 'participants'
        ? yearRating.participantCount
        : schoolScoreTotal,
    };
  });
  const scoreTotal = profileRatings.reduce(
    (total, profile) => total + profile.schoolScoreTotal,
    0
  );
  const weightTotal = profileRatings.reduce(
    (total, profile) => total + profile.weight,
    0
  );
  const schoolsById = new Map();

  for (const profile of profileRatings) {
    for (const profileSchool of profile.yearRating.schools) {
      const school = schoolsById.get(profileSchool.id) ?? {
        id: profileSchool.id,
        name: profileSchool.name,
        city: profileSchool.city,
        region: profileSchool.region,
        officialName: profileSchool.officialName,
        aliases: profileSchool.aliases,
        profiles: {},
      };

      school.profiles[profile.id] = {
        score: profileSchool.score,
        winners: profileSchool.winners,
        prizewinners: profileSchool.prizewinners,
        participants: profileSchool.participants,
      };
      schoolsById.set(school.id, school);
    }
  }

  const schools = assignCompetitionRanks([...schoolsById.values()].map((school) => {
    const values = profileRatings.map((profile) => school.profiles[profile.id] ?? {
      score: 0,
      winners: 0,
      prizewinners: 0,
      participants: 0,
    });

    return {
      ...school,
      score: weightTotal === 0
        ? 0
        : profileRatings.reduce((total, profile, index) => (
          total + (
            profile.schoolScoreTotal === 0
              ? 0
              : (values[index].score / profile.schoolScoreTotal) * profile.weight
          )
        ), 0) / weightTotal * 10000,
      previousScore: null,
      changePercent: null,
      winners: values.reduce((total, value) => total + value.winners, 0),
      prizewinners: values.reduce((total, value) => total + value.prizewinners, 0),
      participants: values.reduce((total, value) => total + value.participants, 0),
    };
  }).filter((school) => school.score > minimumScore).sort((left, right) => (
    right.score - left.score || left.name.localeCompare(right.name, 'ru')
  )));

  return {
    year,
    scoreTotal,
    weightTotal,
    weightBy,
    profileOptions: profileRatings.map(({ id, name, schoolScoreTotal, weight }) => ({
      id,
      name,
      scoreTotal: schoolScoreTotal,
      weight,
    })),
    schoolCount: schools.length,
    regionCount: new Set(schools.map((school) => school.region)).size,
    schools,
  };
};

export const buildOverallRegionRating = (profiles, year, { minimumScore = null } = {}) => {
  const profileRatings = profiles.map((profile) => {
    const yearRating = profile.years.find((item) => item.year === year);
    if (!yearRating) {
      throw new Error(`Profile ${profile.id} has no rating for ${year}`);
    }

    return {
      id: profile.id,
      name: profile.name,
      yearRating,
      regionScoreTotal: yearRating.regions.reduce((total, region) => total + region.score, 0),
    };
  });
  const scoreTotal = profileRatings.reduce(
    (total, profile) => total + profile.regionScoreTotal,
    0
  );
  const regionsByName = new Map();

  for (const profile of profileRatings) {
    for (const profileRegion of profile.yearRating.regions) {
      const region = regionsByName.get(profileRegion.name) ?? {
        id: profileRegion.id,
        name: profileRegion.name,
        profiles: {},
      };

      region.profiles[profile.id] = {
        score: profileRegion.score,
        winners: profileRegion.winners,
        prizewinners: profileRegion.prizewinners,
        participants: profileRegion.participants,
      };
      regionsByName.set(region.name, region);
    }
  }

  const regions = assignCompetitionRanks([...regionsByName.values()].map((region) => {
    const values = profileRatings.map((profile) => region.profiles[profile.id] ?? {
      score: 0,
      winners: 0,
      prizewinners: 0,
      participants: 0,
    });

    return {
      ...region,
      score: scoreTotal === 0
        ? 0
        : (values.reduce((total, value) => total + value.score, 0) / scoreTotal) * 10000,
      previousScore: null,
      changePercent: null,
      winners: values.reduce((total, value) => total + value.winners, 0),
      prizewinners: values.reduce((total, value) => total + value.prizewinners, 0),
      participants: values.reduce((total, value) => total + value.participants, 0),
    };
  }).filter((region) => minimumScore === null || region.score > minimumScore).sort((left, right) => (
    right.score - left.score || left.name.localeCompare(right.name, 'ru')
  )));

  return {
    year,
    scoreTotal,
    profileOptions: profileRatings.map(({ id, name, regionScoreTotal }) => ({
      id,
      name,
      scoreTotal: regionScoreTotal,
    })),
    regionCount: regions.length,
    regions,
  };
};

export const buildOverallSchoolRating = (profiles, year, options = {}) => (
  buildCompositeSchoolRating(profiles, year, {
    ...options,
    weightBy: 'school-score',
  })
);
