(() => {
  const normalize = (value) => value
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();

  const scoreFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
  const exactScoreFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  const sortCollator = new Intl.Collator('ru-RU', {
    ignorePunctuation: true,
    numeric: true,
    sensitivity: 'base'
  });

  const pluralize = (count, forms) => {
    const mod100 = count % 100;
    const mod10 = count % 10;

    if (mod100 >= 11 && mod100 <= 14) {
      return forms[2];
    }

    if (mod10 === 1) {
      return forms[0];
    }

    if (mod10 >= 2 && mod10 <= 4) {
      return forms[1];
    }

    return forms[2];
  };

  document.querySelectorAll('[data-ranking-app]').forEach((app) => {
    const tabs = [...app.querySelectorAll('[data-ranking-tab]')];
    const profileSelect = app.querySelector('select[data-ranking-profile]');
    const yearButtons = [...app.querySelectorAll('[data-ranking-year-button]')];
    const yearControl = app.querySelector('.ranking-years');
    const viewControl = app.querySelector('.ranking-view-control');
    const panels = [...app.querySelectorAll('[data-ranking-panel]')];
    const search = app.querySelector('[data-ranking-search]');
    const region = app.querySelector('[data-ranking-region]');
    const regionField = app.querySelector('[data-ranking-region-field]');
    const reset = app.querySelector('[data-ranking-reset]');
    const count = app.querySelector('[data-ranking-count]');
    const methodNote = app.querySelector('[data-ranking-method-note-target]');
    const historyNote = app.querySelector('[data-ranking-history-note]');
    const methodLink = document.querySelector('a[href="#rating-method"]');
    const siteHeader = document.querySelector('.site-header');
    const stickyHeader = app.querySelector('.ranking-sticky-header');
    const overallOptions = app.querySelector('[data-ranking-overall-options]');
    const overallCheckboxes = [...app.querySelectorAll('[data-ranking-overall-profile]')];
    const profileIds = [...profileSelect.options].map((option) => option.value);
    const overallProfile = 'overall';
    const programmingProfile = 'programming';
    const defaultProfile = overallProfile;
    const states = new Map();
    const allSchoolRegions = [...new Set(
      panels
        .filter((panel) => panel.dataset.rankingPanel === 'schools')
        .flatMap((panel) => [...panel.querySelectorAll('[data-ranking-row]')])
        .map((row) => row.dataset.region)
        .filter(Boolean)
    )].sort((left, right) => left.localeCompare(right, 'ru'));

    region.replaceChildren(
      new Option('Все регионы', ''),
      ...allSchoolRegions.map((name) => new Option(name, name))
    );

    const updateStickyOffset = () => {
      const offset = (siteHeader?.offsetHeight ?? 72) + (stickyHeader?.offsetHeight ?? 0);
      app.style.setProperty('--ranking-table-header-top', `${offset}px`);
    };

    if (stickyHeader && 'ResizeObserver' in window) {
      new ResizeObserver(updateStickyOffset).observe(stickyHeader);
    }
    window.addEventListener('resize', updateStickyOffset);

    const yearsForProfile = (profileId) => [...new Set(
      panels
        .filter((panel) => panel.dataset.rankingProfile === profileId)
        .map((panel) => panel.dataset.rankingYear)
    )].sort((left, right) => Number(right) - Number(left));

    const defaultYearForProfile = (profileId) => yearsForProfile(profileId)[0];

    const parseHash = () => {
      const hash = window.location.hash.slice(1);

      if (!hash || hash === overallProfile) {
        return {
          profile: overallProfile,
          year: defaultYearForProfile(overallProfile),
          view: 'schools'
        };
      }

      if (hash === 'regions') {
        return {
          profile: programmingProfile,
          year: defaultYearForProfile(programmingProfile),
          view: 'regions'
        };
      }

      const legacyMatch = hash.match(/^(\d{4})(?:-(schools|regions))?$/);
      if (legacyMatch && yearsForProfile(programmingProfile).includes(legacyMatch[1])) {
        return {
          profile: programmingProfile,
          year: legacyMatch[1],
          view: legacyMatch[2] || 'schools'
        };
      }

      for (const profileId of profileIds.filter((id) => id !== overallProfile)) {
        const profileYears = yearsForProfile(profileId);
        if (hash === profileId || hash === `${profileId}-regions`) {
          return {
            profile: profileId,
            year: profileYears[0],
            view: hash.endsWith('-regions') ? 'regions' : 'schools'
          };
        }

        const profileMatch = hash.match(new RegExp(`^${profileId}-(\\d{4})(?:-(schools|regions))?$`));
        if (profileMatch && profileYears.includes(profileMatch[1])) {
          return {
            profile: profileId,
            year: profileMatch[1],
            view: profileMatch[2] || 'schools'
          };
        }
      }

      return {
        profile: defaultProfile,
        year: defaultYearForProfile(defaultProfile),
        view: 'schools'
      };
    };

    const initial = parseHash();
    let activeProfile = initial.profile;
    let activeYear = initial.year;
    let activeView = initial.view;
    let selectedRegion = '';

    const stateKey = () => `${activeProfile}:${activeYear}:${activeView}`;
    const activeState = () => {
      if (!states.has(stateKey())) {
        states.set(stateKey(), { query: '' });
      }
      return states.get(stateKey());
    };
    const activePanel = () => panels.find((panel) => (
      panel.dataset.rankingProfile === activeProfile
      && panel.dataset.rankingYear === activeYear
      && panel.dataset.rankingPanel === activeView
    ));
    const selectedOverallProfiles = () => overallCheckboxes
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => checkbox.value);

    const tableSortStates = new WeakMap();

    const sortTypeForColumn = (table, columnIndex) => {
      const cell = table.tBodies[0]?.rows[0]?.cells[columnIndex];
      return cell?.classList.contains('ranking-entity')
        || cell?.classList.contains('ranking-region')
        ? 'text'
        : 'number';
    };

    const numericSortValue = (cell) => {
      if (!cell) {
        return null;
      }

      const source = cell.classList.contains('ranking-change')
        ? cell.textContent
        : cell.title || cell.textContent;
      const match = source.replace(/\s+/g, '').match(/[+-]?\d+(?:[.,]\d+)?/);

      return match ? Number(match[0].replace(',', '.')) : null;
    };

    const rowRank = (row) => numericSortValue(row.cells[0]) ?? Number.MAX_SAFE_INTEGER;

    const sortTable = (table, columnIndex, direction) => {
      const body = table.tBodies[0];
      if (!body) {
        return;
      }

      const type = sortTypeForColumn(table, columnIndex);
      const rows = [...body.querySelectorAll(':scope > [data-ranking-row]')];
      const multiplier = direction === 'ascending' ? 1 : -1;

      rows.sort((left, right) => {
        const leftCell = left.cells[columnIndex];
        const rightCell = right.cells[columnIndex];
        const leftValue = type === 'text'
          ? normalize(leftCell?.textContent || '')
          : numericSortValue(leftCell);
        const rightValue = type === 'text'
          ? normalize(rightCell?.textContent || '')
          : numericSortValue(rightCell);

        if (leftValue === null && rightValue !== null) {
          return 1;
        }
        if (leftValue !== null && rightValue === null) {
          return -1;
        }

        const comparison = type === 'text'
          ? sortCollator.compare(leftValue, rightValue)
          : (leftValue ?? 0) - (rightValue ?? 0);

        return comparison * multiplier || rowRank(left) - rowRank(right);
      });

      rows.forEach((row) => body.append(row));
      table.querySelectorAll('thead th').forEach((header, index) => {
        if (index === columnIndex) {
          header.setAttribute('aria-sort', direction);
        } else {
          header.removeAttribute('aria-sort');
        }
      });
      tableSortStates.set(table, { columnIndex, direction });
    };

    const applyTableSort = (table) => {
      const state = tableSortStates.get(table);
      if (state) {
        sortTable(table, state.columnIndex, state.direction);
      }
    };

    const initializeTableSorting = () => {
      const shortLabels = {
        'Общий балл': 'Балл',
        'Изменение': 'Изм.',
        'Победители': 'Побед.',
        'Призеры': 'Приз.',
        'Участники': 'Уч.'
      };

      app.querySelectorAll('.ranking-table').forEach((table) => {
        const headers = [...table.querySelectorAll('thead th')];

        headers.forEach((header, columnIndex) => {
          const label = header.textContent.trim();
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'ranking-sort-button';
          button.textContent = label;
          button.dataset.rankingShortLabel = shortLabels[label] ?? label;
          button.title = `Сортировать по столбцу «${label}»`;
          button.addEventListener('click', () => {
            const current = tableSortStates.get(table);
            const type = sortTypeForColumn(table, columnIndex);
            const direction = current?.columnIndex === columnIndex
              ? (current.direction === 'ascending' ? 'descending' : 'ascending')
              : (type === 'text' ? 'ascending' : 'descending');
            sortTable(table, columnIndex, direction);
          });

          header.replaceChildren(button);
        });

        tableSortStates.set(table, { columnIndex: 0, direction: 'ascending' });
        headers[0]?.setAttribute('aria-sort', 'ascending');
      });
    };

    const updateResults = () => {
      const panel = activePanel();
      if (!panel) {
        return;
      }

      const query = normalize(search.value);
      const activeRegion = activeView === 'schools' ? selectedRegion : '';
      const rows = [...panel.querySelectorAll('[data-ranking-row]')];
      let visibleCount = 0;

      rows.forEach((row) => {
        const matchesSelection = !row.hasAttribute('data-ranking-overall-row')
          || row.dataset.rankingIncluded === 'true';
        const matchesQuery = normalize(row.dataset.query || '').includes(query);
        const matchesRegion = !activeRegion || row.dataset.region === activeRegion;
        const visible = matchesSelection && matchesQuery && matchesRegion;
        row.hidden = !visible;
        visibleCount += visible ? 1 : 0;
      });

      const forms = activeView === 'schools'
        ? ['школа', 'школы', 'школ']
        : ['регион', 'региона', 'регионов'];
      count.textContent = `${visibleCount} ${pluralize(visibleCount, forms)}`;
      panel.querySelector('[data-ranking-empty]').hidden = visibleCount !== 0;
      states.set(stateKey(), { query: search.value });
    };

    const updateOverallRating = () => {
      const selectedProfiles = selectedOverallProfiles();
      const selectedScoreTotal = overallCheckboxes.reduce((total, checkbox) => (
        checkbox.checked
          ? total + Number(checkbox.dataset.rankingOverallTotal)
          : total
      ), 0);
      const panel = panels.find((item) => item.dataset.rankingProfile === overallProfile);
      const body = panel.querySelector('[data-ranking-overall-body]');
      const rows = [...body.querySelectorAll('[data-ranking-overall-row]')];

      overallCheckboxes.forEach((checkbox) => {
        checkbox.disabled = checkbox.checked && selectedProfiles.length === 1;
      });
      panel.querySelectorAll('[data-ranking-overall-column]').forEach((column) => {
        column.hidden = !selectedProfiles.includes(column.dataset.rankingOverallColumn);
      });

      rows.forEach((row) => {
        const metrics = JSON.parse(row.dataset.rankingOverall);
        const values = selectedProfiles.map((profileId) => metrics[profileId] ?? { score: 0 });
        const score = selectedScoreTotal === 0
          ? 0
          : (values.reduce((total, value) => total + value.score, 0) / selectedScoreTotal) * 10000;
        const roundedScore = Math.round(score);

        row.dataset.rankingOverallScore = String(score);
        row.dataset.rankingIncluded = roundedScore > 10 ? 'true' : 'false';
        const scoreCell = row.querySelector('[data-ranking-overall-score]');
        scoreCell.textContent = scoreFormatter.format(roundedScore);
        scoreCell.title = `${exactScoreFormatter.format(score)} балла`;
        const contributions = overallCheckboxes.map((checkbox) => {
          const value = checkbox.checked && selectedScoreTotal !== 0
            ? ((metrics[checkbox.value]?.score ?? 0) / selectedScoreTotal) * 10000
            : 0;
          return {
            id: checkbox.value,
            value,
            displayValue: Math.floor(value)
          };
        });
        let remainder = roundedScore - contributions.reduce(
          (total, contribution) => total + contribution.displayValue,
          0
        );
        contributions
          .filter((contribution) => selectedProfiles.includes(contribution.id))
          .sort((left, right) => (
            (right.value - Math.floor(right.value)) - (left.value - Math.floor(left.value))
          ))
          .forEach((contribution) => {
            if (remainder > 0) {
              contribution.displayValue += 1;
              remainder -= 1;
            }
          });
        overallCheckboxes.forEach((checkbox) => {
          const contributionCell = row.querySelector(
            `[data-ranking-overall-contribution="${checkbox.value}"]`
          );
          const contribution = contributions.find((item) => item.id === checkbox.value);
          contributionCell.textContent = scoreFormatter.format(contribution.displayValue);
          contributionCell.title = `${exactScoreFormatter.format(contribution.value)} балла`;
        });
      });

      rows.sort((left, right) => (
        Number(right.dataset.rankingOverallScore) - Number(left.dataset.rankingOverallScore)
        || left.dataset.query.localeCompare(right.dataset.query, 'ru')
      ));

      let includedCount = 0;
      let rank = 0;
      let previousScore = null;
      rows.forEach((row) => {
        body.append(row);
        if (row.dataset.rankingIncluded === 'true') {
          includedCount += 1;
          const score = Number(row.dataset.rankingOverallScore);
          if (previousScore === null || Math.abs(score - previousScore) > 1e-9) {
            previousScore = score;
            rank = includedCount;
          }
          row.querySelector('[data-ranking-overall-rank]').textContent = rank;
        }
      });
      panel.dataset.rankingSchoolCount = String(includedCount);

      const table = body.closest('.ranking-table');
      const sortState = tableSortStates.get(table);
      if (table.rows[0]?.cells[sortState?.columnIndex]?.hidden) {
        tableSortStates.set(table, { columnIndex: 0, direction: 'ascending' });
      }
      applyTableSort(table);

      if (activeProfile === overallProfile) {
        updateResults();
      }
    };

    const updateUrl = () => {
      const profileDefaultYear = defaultYearForProfile(activeProfile);
      let hash = '';

      if (activeProfile === programmingProfile) {
        if (activeYear === profileDefaultYear) {
          hash = activeView === 'regions' ? '#regions' : '#programming';
        } else {
          hash = `#${activeYear}${activeView === 'regions' ? '-regions' : ''}`;
        }
      } else if (activeProfile !== overallProfile) {
        hash = `#${activeProfile}`;
        if (activeYear !== profileDefaultYear) {
          hash += `-${activeYear}`;
        }
        if (activeView === 'regions') {
          hash += '-regions';
        }
      }

      window.history.replaceState(
        null,
        '',
        `${window.location.pathname}${window.location.search}${hash}`
      );
    };

    const syncMethod = (panel) => {
      methodNote.textContent = panel.dataset.rankingMethodNote;
      historyNote.hidden = activeProfile !== programmingProfile;
    };

    const switchSelection = (profileId, year, view, updateHash = true) => {
      if (!profileIds.includes(profileId) || !['schools', 'regions'].includes(view)) {
        return;
      }

      const availableYears = yearsForProfile(profileId);
      activeProfile = profileId;
      activeYear = availableYears.includes(String(year)) ? String(year) : availableYears[0];
      activeView = activeProfile === overallProfile ? 'schools' : view;
      profileSelect.value = activeProfile;
      yearControl.style.setProperty('--year-count', availableYears.length);
      viewControl.hidden = activeProfile === overallProfile;
      overallOptions.hidden = activeProfile !== overallProfile;

      yearButtons.forEach((button) => {
        const available = availableYears.includes(button.dataset.rankingYearButton);
        button.hidden = !available;
        button.setAttribute(
          'aria-pressed',
          available && button.dataset.rankingYearButton === activeYear ? 'true' : 'false'
        );
      });

      tabs.forEach((tab) => {
        const selected = tab.dataset.rankingTab === activeView;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute(
          'aria-controls',
          `ranking-panel-${activeProfile}-${activeYear}-${tab.dataset.rankingTab}`
        );
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = !(
          panel.dataset.rankingProfile === activeProfile
          && panel.dataset.rankingYear === activeYear
          && panel.dataset.rankingPanel === activeView
        );
      });

      const state = activeState();
      search.value = state.query;
      search.placeholder = activeView === 'schools' ? 'Название школы' : 'Название региона';
      regionField.hidden = activeView !== 'schools';
      if (activeView === 'schools') {
        region.value = selectedRegion;
      }

      const panel = activePanel();
      if (panel) {
        syncMethod(panel);
      }
      updateResults();

      if (updateHash) {
        updateUrl();
      }
    };

    profileSelect.addEventListener('change', () => {
      switchSelection(
        profileSelect.value,
        defaultYearForProfile(profileSelect.value),
        activeView
      );
    });

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => (
        switchSelection(activeProfile, activeYear, tab.dataset.rankingTab)
      ));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
        nextTab.focus();
        switchSelection(activeProfile, activeYear, nextTab.dataset.rankingTab);
      });
    });

    yearButtons.forEach((button) => {
      button.addEventListener('click', () => (
        switchSelection(activeProfile, button.dataset.rankingYearButton, activeView)
      ));
      button.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        event.preventDefault();
        const availableButtons = yearButtons.filter((yearButton) => !yearButton.hidden);
        const index = availableButtons.indexOf(button);
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextButton = availableButtons[
          (index + direction + availableButtons.length) % availableButtons.length
        ];
        nextButton.focus();
        switchSelection(activeProfile, nextButton.dataset.rankingYearButton, activeView);
      });
    });

    overallCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', updateOverallRating);
    });
    methodLink?.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelector('#rating-method')?.scrollIntoView({ behavior: 'smooth' });
    });
    search.addEventListener('input', updateResults);
    region.addEventListener('change', () => {
      selectedRegion = region.value;
      updateResults();
    });
    reset.addEventListener('click', () => {
      states.set(stateKey(), { query: '' });
      search.value = '';
      selectedRegion = '';
      region.value = '';
      overallCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });
      updateOverallRating();
      sortTable(activePanel().querySelector('.ranking-table'), 0, 'ascending');
      updateResults();
      search.focus();
    });

    window.addEventListener('hashchange', () => {
      const selection = parseHash();
      switchSelection(selection.profile, selection.year, selection.view, false);
    });

    initializeTableSorting();
    updateOverallRating();
    switchSelection(activeProfile, activeYear, activeView, false);
    updateStickyOffset();
  });
})();
