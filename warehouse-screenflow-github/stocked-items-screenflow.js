const viewer = document.querySelector('#viewer');
const closeButton = document.querySelector('#viewer-close');
let returnFocus;
document.querySelectorAll('button.screen').forEach(button => {
  button.addEventListener('click', () => {
    returnFocus = button;
    document.querySelector('#viewer-title').textContent = button.dataset.title;
    const enlarged = document.createElement('div');
    enlarged.className = 'screen';
    enlarged.style.cssText = button.style.cssText;
    const img = button.querySelector('img').cloneNode();
    img.loading = 'eager';
    enlarged.append(img);
    document.querySelector('#viewer-screen').replaceChildren(enlarged);
    document.querySelector('#viewer-original').href = button.dataset.file;
    viewer.showModal();
    closeButton.focus();
  });
});
closeButton.addEventListener('click', () => viewer.close());
viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
viewer.addEventListener('close', () => returnFocus?.focus({preventScroll:true}));
const links = [...document.querySelectorAll('aside a')];
const observer = new IntersectionObserver(entries => {
  const current = entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
  if (!current) return;
  links.forEach(a=>a.classList.toggle('active', a.hash === '#'+current.target.id));
}, {rootMargin:'-95px 0px -60% 0px',threshold:0});
document.querySelectorAll('main section').forEach(s=>observer.observe(s));

const suggestionsPanel = document.querySelector('#suggestions-panel');
const suggestionsOpen = document.querySelector('#suggestions-open');
const suggestionsClose = document.querySelector('#suggestions-close');
suggestionsOpen.addEventListener('click', () => {
  suggestionsPanel.showModal();
  suggestionsClose.focus();
});
suggestionsClose.addEventListener('click', () => suggestionsPanel.close());
suggestionsPanel.addEventListener('click', event => {
  if (event.target === suggestionsPanel &&
      (event.clientX < suggestionsPanel.getBoundingClientRect().left ||
       event.clientX > suggestionsPanel.getBoundingClientRect().right ||
       event.clientY < suggestionsPanel.getBoundingClientRect().top ||
       event.clientY > suggestionsPanel.getBoundingClientRect().bottom)) {
    suggestionsPanel.close();
  }
});
suggestionsPanel.addEventListener('close', () => suggestionsOpen.focus({preventScroll:true}));
document.querySelectorAll('[data-suggestion]').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.suggestion);
    target.tabIndex = -1;
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:'smooth',block:'start'});
  });
});

// Documentation-only interactions: these describe the next step without calling the app.
document.querySelectorAll('[data-preview-action]').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelector('#detail-preview-title').textContent = button.dataset.previewAction;
    document.querySelector('#detail-preview-route').textContent = button.dataset.previewRoute;
    document.querySelector('.detail-preview-result').scrollIntoView({behavior:'smooth',block:'nearest'});
  });
});
const stockPreviewTabs = [...document.querySelectorAll('[data-stock-tab]')];
function selectStockPreviewTab(button) {
  stockPreviewTabs.forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    document.getElementById(tab.dataset.stockTab).hidden = !selected;
  });
}
stockPreviewTabs.forEach((button, index) => {
  button.addEventListener('click', () => selectStockPreviewTab(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = (index + 1) % stockPreviewTabs.length;
    if (event.key === 'ArrowLeft') next = (index + stockPreviewTabs.length - 1) % stockPreviewTabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = stockPreviewTabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    selectStockPreviewTab(stockPreviewTabs[next]);
    stockPreviewTabs[next].focus();
  });
});

// Keep the two review options on the same direction when comparing them.
const menuPreviews = new Map();
function selectComparisonDirection(group, key) {
  group.querySelectorAll('.operations-phone').forEach(phone => menuPreviews.get(phone)?.(key));
  group.querySelectorAll('[data-compare-direction]').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.compareDirection === key));
  });
}
document.querySelectorAll('.operations-phone').forEach(phone => {
  const directListing = phone.dataset.workMode === 'listing';
  const tabs = [...phone.querySelectorAll('[data-work-tab]')];
  const panels = [...phone.querySelectorAll('[data-work-panel]')];
  const resetPanels = new Map();
  function selectTab(button) {
    tabs.forEach(tab => {
      const selected = tab === button;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    panels.forEach(panel => {
      panel.hidden = panel.dataset.workPanel !== button.dataset.workTab;
      if (!panel.hidden) resetPanels.get(panel)?.();
    });
  }
  menuPreviews.set(phone, key => selectTab(tabs.find(tab => tab.dataset.workTab === key)));
  function requestTab(button) {
    const comparison = phone.closest('.menu-options-comparison');
    if (comparison) selectComparisonDirection(comparison, button.dataset.workTab);
    else selectTab(button);
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => requestTab(button));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') next = 1 - index;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      requestTab(tabs[next]);
      tabs[next].focus();
    });
  });
  panels.forEach(panel => {
    const search = panel.querySelector('input');
    const menu = panel.querySelector('.work-stage-menu');
    const results = panel.querySelector('.work-results');
    const heading = panel.querySelector('.work-results-heading h5');
    const stageButtons = [...panel.querySelectorAll('[data-work-stage]')];
    const orders = [...panel.querySelectorAll('.work-order')];
    const feedback = panel.querySelector('.work-next-preview');
    const filter = panel.querySelector('select');
    let selectedStage = directListing ? 'all' : null;
    let selectedLabel = directListing ? 'All orders' : '';
    let returnStage = stageButtons[0];
    function renderOrders() {
      const query = search.value.trim().toLowerCase();
      const showResults = directListing || selectedStage !== null || query.length > 0;
      menu.hidden = showResults;
      results.hidden = !showResults;
      heading.textContent = selectedStage === null ? 'Search results' : selectedLabel;
      orders.forEach(order => {
        order.hidden = (selectedStage !== null && selectedStage !== 'all' && order.dataset.workStatus !== selectedStage)
          || !order.dataset.workSearch.toLowerCase().includes(query);
      });
      const count = orders.filter(order => !order.hidden).length;
      panel.querySelector('.work-list-count').textContent = `${count} ${count === 1 ? 'order' : 'orders'}`;
      panel.querySelector('.work-empty').hidden = count !== 0;
      feedback.hidden = true;
    }
    function resetMenu() {
      search.value = '';
      if (filter) filter.value = 'all';
      selectedStage = directListing ? 'all' : null;
      selectedLabel = directListing ? 'All orders' : '';
      renderOrders();
    }
    resetPanels.set(panel, resetMenu);
    search.addEventListener('input', renderOrders);
    filter?.addEventListener('change', () => {
      selectedStage = filter.value;
      selectedLabel = filter.value === 'all' ? 'All orders' : filter.value;
      renderOrders();
    });
    stageButtons.forEach(button => button.addEventListener('click', () => {
      selectedStage = button.dataset.workStage;
      selectedLabel = button.dataset.stageLabel;
      returnStage = button;
      renderOrders();
      heading.focus({preventScroll:true});
    }));
    panel.querySelector('.work-back')?.addEventListener('click', () => {
      resetMenu();
      returnStage.focus({preventScroll:true});
    });
    orders.forEach(order => order.addEventListener('click', () => {
      feedback.querySelector('b').textContent = `${order.dataset.workRef} · Next step`;
      feedback.querySelector('p').textContent = order.dataset.workNext;
      feedback.hidden = false;
    }));
  });
});
document.querySelectorAll('[data-compare-direction]').forEach(button => {
  button.addEventListener('click', () => {
    selectComparisonDirection(button.closest('.menu-options-comparison'), button.dataset.compareDirection);
  });
});
