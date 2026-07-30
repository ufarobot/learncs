(() => {
  const normalize = (value) => value
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/\s+/g, ' ')
    .trim();

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
    const panels = [...app.querySelectorAll('[data-ranking-panel]')];
    const search = app.querySelector('[data-ranking-search]');
    const region = app.querySelector('[data-ranking-region]');
    const regionField = app.querySelector('[data-ranking-region-field]');
    const reset = app.querySelector('[data-ranking-reset]');
    const count = app.querySelector('[data-ranking-count]');
    const states = {
      schools: { query: '', region: '' },
      regions: { query: '', region: '' }
    };
    let activeView = window.location.hash === '#regions' ? 'regions' : 'schools';

    const activePanel = () => panels.find((panel) => panel.dataset.rankingPanel === activeView);

    const updateResults = () => {
      const panel = activePanel();
      if (!panel) {
        return;
      }

      const query = normalize(search.value);
      const selectedRegion = activeView === 'schools' ? region.value : '';
      const rows = [...panel.querySelectorAll('[data-ranking-row]')];
      let visibleCount = 0;

      rows.forEach((row) => {
        const matchesQuery = normalize(row.dataset.query || '').includes(query);
        const matchesRegion = !selectedRegion || row.dataset.region === selectedRegion;
        const visible = matchesQuery && matchesRegion;
        row.hidden = !visible;
        visibleCount += visible ? 1 : 0;
      });

      const forms = activeView === 'schools'
        ? ['школа', 'школы', 'школ']
        : ['регион', 'региона', 'регионов'];
      count.textContent = `${visibleCount} ${pluralize(visibleCount, forms)}`;
      panel.querySelector('[data-ranking-empty]').hidden = visibleCount !== 0;
      states[activeView] = { query: search.value, region: selectedRegion };
    };

    const switchView = (view, updateHash = true) => {
      activeView = view;

      tabs.forEach((tab) => {
        const selected = tab.dataset.rankingTab === view;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.tabIndex = selected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.rankingPanel !== view;
      });

      search.value = states[view].query;
      search.placeholder = view === 'schools' ? 'Название школы' : 'Название региона';
      region.value = states.schools.region;
      regionField.hidden = view !== 'schools';
      updateResults();

      if (updateHash) {
        const nextUrl = view === 'regions'
          ? `${window.location.pathname}${window.location.search}#regions`
          : `${window.location.pathname}${window.location.search}`;
        window.history.replaceState(null, '', nextUrl);
      }
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => switchView(tab.dataset.rankingTab));
      tab.addEventListener('keydown', (event) => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
          return;
        }

        event.preventDefault();
        const direction = event.key === 'ArrowRight' ? 1 : -1;
        const nextTab = tabs[(index + direction + tabs.length) % tabs.length];
        nextTab.focus();
        switchView(nextTab.dataset.rankingTab);
      });
    });

    search.addEventListener('input', updateResults);
    region.addEventListener('change', updateResults);
    reset.addEventListener('click', () => {
      states[activeView] = { query: '', region: '' };
      search.value = '';
      if (activeView === 'schools') {
        region.value = '';
      }
      updateResults();
      search.focus();
    });

    window.addEventListener('hashchange', () => {
      switchView(window.location.hash === '#regions' ? 'regions' : 'schools', false);
    });

    switchView(activeView, false);
  });
})();
