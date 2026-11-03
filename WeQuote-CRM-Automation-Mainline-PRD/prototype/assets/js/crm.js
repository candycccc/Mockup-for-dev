  function closeAcc(acc) {
    const subs = acc.querySelector('.acc-subs');
    acc.classList.remove('open');
    subs.style.height = subs.scrollHeight + 'px'; // pin from auto
    subs.getBoundingClientRect();                 // force reflow
    subs.style.height = '0px';
  }

  function toggleAcc(el) {
    const acc = el.parentElement;
    if (acc.classList.contains('open')) {
      closeAcc(acc);
      return;
    }
    // single-open: close any other expanded section
    document.querySelectorAll('.acc.open').forEach(closeAcc);
    const subs = acc.querySelector('.acc-subs');
    acc.classList.add('open');
    subs.style.height = subs.scrollHeight + 'px';
    subs.addEventListener('transitionend', function done(e) {
      if (e.propertyName !== 'height') return;
      subs.style.height = 'auto'; // stay fluid after opening
      subs.removeEventListener('transitionend', done);
    });
  }

  // ---------- Global quick-create menu ----------
  function onCreatePrimary(e) {
    e.stopPropagation();
    if (currentView === 'leads') { openCreateLead(e); return; }
    if (currentView === 'crm') { openDealForm('new', null); return; }
    toggleCreateMenu(e);
  }
  function toggleCreateMenu(e) {
    e.stopPropagation();
    document.getElementById('createMenu').classList.toggle('open');
  }
  document.addEventListener('click', function(e) {
    const m = document.getElementById('createMenu');
    if (m.classList.contains('open') && !e.target.closest('.create-wrap')) m.classList.remove('open');
  });
  document.getElementById('createMenu').addEventListener('click', e => {
    if (e.target.closest('.cm-item')) document.getElementById('createMenu').classList.remove('open');
  });

  // ---------- Account menu ----------
  function toggleAccountMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('accountMenu');
    if (menu.classList.toggle('open')) {
      const r = document.querySelector('.account-btn').getBoundingClientRect();
      menu.style.bottom = (window.innerHeight - r.top + 6) + 'px'; // open upwards above the button
    }
  }
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('accountMenu');
    if (menu.classList.contains('open') && !menu.contains(e.target)) menu.classList.remove('open');
  });

  const navAcc = document.querySelector('.nav-acc');

  // snapshot of each module's factory-default sub-item order (captured before any customising)
  const defaultSubOrder = new Map();
  navAcc.querySelectorAll('.acc').forEach(acc => {
    defaultSubOrder.set(acc, [...acc.querySelectorAll('.acc-subs .sub-row')]);
  });

  // first visible section sits right under the top divider — no own border
  function fixSectionBorders() {
    const accs = [...navAcc.querySelectorAll('.acc')];
    accs.forEach(a => { a.style.borderTop = ''; a.style.paddingTop = ''; });
    const firstVis = accs.find(a => !a.classList.contains('cs-hidden'));
    if (firstVis) { firstVis.style.borderTop = 'none'; firstVis.style.paddingTop = '0'; }
  }

  // ---------- Customise sidebar modal ----------
  const csOverlay = document.getElementById('csOverlay');
  const csQuick = document.getElementById('csQuick');
  const csModules = document.getElementById('csModules');

  function csRow(iconHTML, label, visible, opts, ref) {
    const row = document.createElement('div');
    row.className = 'cs-row';
    row.draggable = !!opts.drag;
    row._ref = ref;
    row.innerHTML =
      '<span class="grip fai' + (opts.drag ? '' : ' blank') + '">&#xf58e;</span>' +
      '<input type="checkbox"' + (visible ? ' checked' : '') + (opts.lock ? ' disabled' : '') + '>' +
      '<span class="cs-icon">' + iconHTML + '</span>' +
      '<span class="cs-label">' + label + '</span>' +
      (opts.expand ? '<span class="cs-exp fai" title="Show items">&#xf078;</span>' : '') +
      '<span class="more fai">&#xf141;</span>';
    return row;
  }

  // sub-item row inside an expanded module: grip + label only
  function csSubRow(label, ref) {
    const row = document.createElement('div');
    row.className = 'cs-row cs-sub';
    row.draggable = true;
    row._ref = ref;
    row.innerHTML =
      '<span class="grip fai">&#xf58e;</span>' +
      '<span class="cs-label">' + label + '</span>';
    return row;
  }

  function openCustomise(e) {
    e.stopPropagation();
    document.getElementById('accountMenu').classList.remove('open');
    csQuick.innerHTML = '';
    csModules.innerHTML = '';
    document.querySelectorAll('.quicknav .qn-item').forEach(el => {
      const label = [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
      const icon = el.querySelector('.ic16').outerHTML;
      const visible = !el.classList.contains('cs-hidden');
      csQuick.appendChild(csRow(icon, label, visible, { drag: false, lock: label === 'Dashboard' }, el));
    });
    navAcc.querySelectorAll('.acc').forEach(el => {
      const label = el.querySelector('.acc-head .label').textContent.trim();
      const icon = el.querySelector('.acc-head .ic16').outerHTML;
      const visible = !el.classList.contains('cs-hidden');

      const mod = document.createElement('div');
      mod.className = 'cs-mod';
      mod.draggable = true;
      const row = csRow(icon, label, visible, { drag: true, expand: true }, el);
      mod._row = row;
      mod.appendChild(row);

      const subList = document.createElement('div');
      subList.className = 'cs-subs-list';
      el.querySelectorAll('.acc-subs .sub-row').forEach(sr => {
        subList.appendChild(csSubRow(sr.querySelector('.txt').textContent.trim(), sr));
      });
      mod.appendChild(subList);
      wireCsList(subList, '.cs-sub');

      row.querySelector('.cs-exp').addEventListener('click', ev => {
        ev.stopPropagation();
        subList.classList.toggle('open');
        row.querySelector('.cs-exp').classList.toggle('rot');
      });

      csModules.appendChild(mod);
    });
    document.getElementById('csRole').value = 'custom';
    csOverlay.classList.add('open');
  }

  // Role presets — module order tuned per role, fine-tunable by dragging
  const ROLE_PRESETS = {
    sales:       ['CRM', 'Quote & Sales', 'Contacts', 'Catalogues', 'Projects', 'Procurement', 'Inventory', 'Workhub'],
    pm:          ['Projects', 'Workhub', 'Procurement', 'Inventory', 'Quote & Sales', 'Contacts', 'Catalogues', 'CRM'],
    engineer:    ['Workhub', 'Projects', 'Inventory', 'Catalogues', 'Procurement', 'Quote & Sales', 'Contacts', 'CRM'],
    procurement: ['Procurement', 'Inventory', 'Catalogues', 'Projects', 'Quote & Sales', 'Workhub', 'Contacts', 'CRM'],
    warehouse:   ['Inventory', 'Procurement', 'Workhub', 'Projects', 'Catalogues', 'Quote & Sales', 'Contacts', 'CRM']
  };

  function applyRolePreset(role) {
    const order = ROLE_PRESETS[role];
    if (!order) return; // "custom" keeps the current arrangement
    const mods = [...csModules.querySelectorAll('.cs-mod')];
    order.forEach(label => {
      const mod = mods.find(m => m._row.querySelector('.cs-label').textContent === label);
      if (mod) csModules.appendChild(mod);
    });
    // presets also reset every module's sub-items to their default order
    mods.forEach(mod => {
      const defaults = defaultSubOrder.get(mod._row._ref) || [];
      const subList = mod.querySelector('.cs-subs-list');
      const rows = [...subList.querySelectorAll('.cs-sub')];
      defaults.forEach(sr => {
        const row = rows.find(r => r._ref === sr);
        if (row) subList.appendChild(row);
      });
    });
  }

  function closeCustomise() {
    csOverlay.classList.remove('open');
  }

  function saveCustomise() {
    const quicknav = document.querySelector('.quicknav');
    csQuick.querySelectorAll('.cs-row').forEach(row => {
      quicknav.appendChild(row._ref);
      row._ref.classList.toggle('cs-hidden', !row.querySelector('input').checked);
    });
    const bottomDivider = navAcc.querySelector('.discover').previousElementSibling;
    csModules.querySelectorAll('.cs-mod').forEach(mod => {
      const row = mod._row;
      const acc = row._ref;
      navAcc.insertBefore(acc, bottomDivider);
      const hide = !row.querySelector('input').checked;
      acc.classList.toggle('cs-hidden', hide);
      if (hide && acc.classList.contains('open')) {
        acc.classList.remove('open');
        acc.querySelector('.acc-subs').style.height = '0px';
      }
      // apply sub-item order inside the module
      const subsContainer = acc.querySelector('.acc-subs');
      mod.querySelectorAll('.cs-subs-list .cs-sub').forEach(sub => {
        subsContainer.appendChild(sub._ref);
      });
    });
    fixSectionBorders();
    closeCustomise();
  }

  // Generic list reorder. rowSel scopes each level: sub-lists ('.cs-sub') sit inside
  // module wrappers ('.cs-mod'), so handlers stop propagation to the outer list.
  function wireCsList(list, rowSel) {
    let dragRow = null;
    list.addEventListener('dragstart', e => {
      const row = e.target.closest(rowSel);
      if (!row || row.parentElement !== list) return;
      e.stopPropagation();
      dragRow = row;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
      requestAnimationFrame(() => { if (dragRow === row) row.classList.add('dragging'); });
    });
    list.addEventListener('dragend', e => {
      if (!dragRow) return;
      e.stopPropagation();
      dragRow.classList.remove('dragging');
      dragRow = null;
    });
    list.addEventListener('dragover', e => {
      if (!dragRow) return;
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'move';
      const target = e.target.closest(rowSel);
      if (!target || target === dragRow || target.parentElement !== list) return;
      const r = target.getBoundingClientRect();
      const after = e.clientY > r.top + r.height / 2;
      list.insertBefore(dragRow, after ? target.nextSibling : target);
      document.getElementById('csRole').value = 'custom'; // any reordering = custom
    });
    list.addEventListener('drop', e => { if (dragRow) { e.preventDefault(); e.stopPropagation(); } });
  }
  wireCsList(csModules, '.cs-mod'); // Quick access is show/hide only — no reorder

  csOverlay.addEventListener('click', e => { if (e.target === csOverlay) closeCustomise(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && csOverlay.classList.contains('open')) closeCustomise();
  });

  // ---------- View switching (Dashboard / CRM Pipeline / CRM Leads) ----------
  const VIEW_TITLES = { dashboard: 'Dashboard', crm: 'Pipeline', leads: 'Leads', automation: 'Automations', quotes: 'Quotes', customer: 'Customer', reqs: 'CRM Requirements' };
  const VIEW_CRUMBS = {
    leads: ['CRM', 'Lead'],
    crm: ['CRM', 'Deal'],
    automation: ['<span class="crumb-link" onclick="showView(\'crm\')">CRM</span>', '<span class="crumb-link" onclick="window.openSalesPipelineAutomations()">Automations</span>'],
    quotes: ['Quote & Sales', 'Quotes'],
    deal: ['CRM', '<span class="crumb-link" onclick="showView(\'crm\')">Deals</span>']
  };
  const CREATE_BTN_LABEL = { leads: 'Create Lead', crm: 'Create Deal' };
  let currentView = 'dashboard';
  function showView(v) {
    if (v !== 'automation') {
      const appShell = document.querySelector('.app');
      if (appShell) appShell.classList.remove('aut-focus-mode', 'aut-sidebar-expanded', 'aut-builder-focus-mode');
    }
    document.getElementById('viewDashboard').style.display = v === 'dashboard' ? '' : 'none';
    document.getElementById('viewCrm').style.display = v === 'crm' ? '' : 'none';
    document.getElementById('viewAutomation').style.display = v === 'automation' ? '' : 'none';
    document.getElementById('viewQuotes').style.display = v === 'quotes' ? '' : 'none';
    document.getElementById('viewLeads').style.display = v === 'leads' ? '' : 'none';
    document.getElementById('viewCustomer').style.display = v === 'customer' ? '' : 'none';
    document.getElementById('viewReqs').style.display = v === 'reqs' ? '' : 'none';
    document.getElementById('viewDeal').style.display = v === 'deal' ? '' : 'none';
    const titleEl = document.getElementById('pageTitle');
    const crumb = VIEW_CRUMBS[v];
    titleEl.innerHTML = crumb ? crumb.join('<span class="crumb-sep">/</span>') : VIEW_TITLES[v];
    document.getElementById('createBtnLabel').textContent = CREATE_BTN_LABEL[v] || 'Create';
    // The deal page swaps Global Search / Create for Watching + the Won action (Figma node 2578-91244)
    const onDeal = v === 'deal';
    const onAutomation = v === 'automation';
    const onQuotes = v === 'quotes';
    const automationTopbarContext = document.getElementById('autTopbarContext');
    const automationTopbarActions = document.getElementById('autTopbarActions');
    if (automationTopbarContext) {
      automationTopbarContext.hidden = !onAutomation || !automationTopbarContext.textContent.trim();
    }
    if (automationTopbarActions && !onAutomation) automationTopbarActions.hidden = true;
    document.querySelector('.main').classList.toggle('deal-detail-active', onDeal);
    document.getElementById('ddWatching').style.display = onDeal ? '' : 'none';
    document.getElementById('ddWonBtn').style.display = onDeal ? '' : 'none';
    document.getElementById('ddKebabWrap').style.display = onDeal ? '' : 'none';
    document.getElementById('topSearchPill').style.display = onDeal ? 'none' : '';
    document.getElementById('topCreateWrap').style.display = onDeal || onAutomation || onQuotes ? 'none' : '';
    currentView = v;
    // The pipeline starts inside a hidden view, so its first minimap measurement is 0px.
    // Re-measure after the CRM view has been painted to make the red viewport represent
    // the actual visible column range instead of falling back to the 16px minimum.
    if (v === 'crm') {
      requestAnimationFrame(() => requestAnimationFrame(updatePipelineMinimap));
    }
    closeDdKebab();
    closeLeadKebab();
  }
  window.showView = showView;
  // ---------- CRM Deals pipeline (Figma DS – WeQuote Platform, node 2063-72600) ----------
  const CRM_STAGE_DEFS = [
    { name: 'Qualified',       icon: '\uf14a', color: '#576A92', probability: 10,  protected: true, lifecycleRule: 'No related Quote yet' },
    { name: 'In Progress',     icon: '\uf571', color: '#2450FF', probability: 30,  protected: true, lifecycleRule: 'Quote · In Progress' },
    { name: 'In Review',       icon: '\uf06e', color: '#7C3AED', probability: 45,  protected: true, conditional: true, lifecycleRule: 'Quote · In Review' },
    { name: 'Passed Review',   icon: '\uf058', color: '#8B5CF6', probability: 60,  protected: true, conditional: true, lifecycleRule: 'Quote · Passed Review' },
    { name: 'Sent',            icon: '\uf0e0', color: '#B97A00', probability: 75,  protected: true, lifecycleRule: 'Any viable Quote · Sent' },
    { name: 'Won',             icon: '\uf2b5', color: '#1E8539', probability: 100, protected: true, outcome: 'won', lifecycleRule: 'Any Quote · Accepted / Complete' },
    { name: 'Lost',            icon: '\uf057', color: '#C7193C', probability: 0,   protected: true, outcome: 'lost', lifecycleRule: 'No viable Quote remains' }
  ];
  const CRM_SALES_LIFECYCLE_VERSION = 3;
  const CRM_SALES_STAGE_ALIASES = {
    'qualified': 'Qualified',
    'quoting': 'In Progress',
    'draft': 'In Progress',
    'in progress': 'In Progress',
    'under internal review': 'In Review',
    'review': 'In Review',
    'in review': 'In Review',
    'passed internal review': 'Passed Review',
    'reviewed': 'Passed Review',
    'passed review': 'Passed Review',
    'sent to customer': 'Sent',
    'sent': 'Sent',
    'accepted': 'Won',
    'won': 'Won',
    'lost': 'Lost'
  };
  const CRM_SALES_STAGE_TEMPLATE = CRM_STAGE_DEFS.map(stage => ({ ...stage }));
  const CRM_QUOTE_SEGMENT_STARTS = ['Qualified', 'In Progress', 'In Review', 'Passed Review', 'Sent'];
  const CRM_QUOTE_SEGMENT_ENDS = {
    Qualified: 'In Progress',
    'In Progress': 'In Review',
    'In Review': 'Passed Review',
    'Passed Review': 'Sent',
    Sent: 'Won / Lost'
  };
  const CRM_QUOTE_SEGMENT_EVENTS = {
    Qualified: 'When the first related Quote is created, the Deal moves to In Progress.',
    'In Progress': 'When a Quote enters Review, the Deal moves to In Review.',
    'In Review': 'When Review passes, the Deal moves to Passed Review.',
    'Passed Review': 'When a viable Quote is issued, the Deal moves to Sent.',
    Sent: 'When any Quote is accepted, the Deal moves to Won; when no viable Quote remains, it moves to Lost.'
  };
  const CRM_STANDALONE_STAGE_TEMPLATE = [
    { name: 'New', icon: '\uf14a', color: '#576A92', probability: 10, protected: false },
    { name: 'In Progress', icon: '\uf304', color: '#2450FF', probability: 45, protected: false },
    { name: 'Complete', icon: '\uf058', color: '#1E8539', probability: 90, protected: false },
    { name: 'Won', icon: '\uf2b5', color: '#1E8539', probability: 100, protected: true, outcome: 'won', lifecycleRule: 'Deal outcome · Won' },
    { name: 'Lost', icon: '\uf057', color: '#C7193C', probability: 0, protected: true, outcome: 'lost', lifecycleRule: 'Deal outcome · Lost' }
  ];
  const CRM_STAGES = CRM_STAGE_DEFS.map(s => s.name);
  const CRM_STAGE_ICON_OPTIONS = [
    { name: 'No icon', glyph: '' },
    { name: 'Checked', glyph: '\uf14a' },
    { name: 'Quote', glyph: '\uf571' },
    { name: 'Email', glyph: '\uf0e0' },
    { name: 'Edit', glyph: '\uf304' },
    { name: 'Handshake', glyph: '\uf2b5' },
    { name: 'Trophy', glyph: '\uf091' },
    { name: 'Flag', glyph: '\uf11e' },
    { name: 'Circle check', glyph: '\uf058' },
    { name: 'Circle x', glyph: '\uf057' },
    { name: 'Clock', glyph: '\uf017' },
    { name: 'Archive', glyph: '\uf187' }
  ];
  const CRM_STAGE_COLOUR_OPTIONS = ['#576A92', '#7C3AED', '#B97A00', '#1E8539', '#F12B53'];
  const CRM_STAGE_PROBABILITY_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const stageIndexByOutcome = outcome => CRM_STAGE_DEFS.findIndex(def => def.outcome === outcome);
  const STALE_DAYS = 30; // org-configurable staleness threshold (PRD A5)
  const FOLLOWUP_DAYS = 14;
  const CRM_OWNER_NAMES = {
    JM: 'Jeff Mitchel', DL: 'Dave Lombard', SP: 'Sean Prater', GR: 'Gabriel Rivera',
    PB: 'Patrick Burke', AO: 'Alex Osei', LR: 'Lee Roche'
  };
  const CRM_CURRENT_USER = 'Lee Roche';
  const CRM_OWNING_COMPANIES = [
    { id: 'main-company', name: 'AUDIOVISIONS — Main Company', shortName: 'Main Company', code: 'MAIN' },
    { id: 'los-angeles', name: 'AUDIOVISIONS — Los Angeles', shortName: 'Los Angeles', code: 'LA' },
    { id: 'northern-california', name: 'AUDIOVISIONS — Northern California', shortName: 'Northern California', code: 'NC' },
    { id: 'orange-county', name: 'AUDIOVISIONS — Orange County', shortName: 'Orange County', code: 'OC' },
    { id: 'palm-desert', name: 'AUDIOVISIONS — Palm Desert', shortName: 'Palm Desert', code: 'PD' }
  ];
  window.WeQuoteOwningCompanies = CRM_OWNING_COMPANIES.map(company => ({ ...company }));
  let crmOwningCompanyFilter = 'all';
  function owningCompany(id) {
    return CRM_OWNING_COMPANIES.find(company => company.id === id) || CRM_OWNING_COMPANIES[0];
  }
  function owningCompanyName(record, shortName) {
    const company = owningCompany(record && record.owningCompanyId);
    return shortName ? company.shortName : company.name;
  }
  function owningCompanyMatches(record) {
    return crmOwningCompanyFilter === 'all' || (record && record.owningCompanyId === crmOwningCompanyFilter);
  }
  function seedOwningCompany(record, index) {
    if (!record.owningCompanyId || !CRM_OWNING_COMPANIES.some(company => company.id === record.owningCompanyId)) {
      record.owningCompanyId = CRM_OWNING_COMPANIES[index % CRM_OWNING_COMPANIES.length].id;
    }
    return record;
  }
  function owningCompanyOptions(selected, includePrompt) {
    return (includePrompt ? '<option value="">Choose Owning Company</option>' : '') + CRM_OWNING_COMPANIES.map(company =>
      '<option value="' + company.id + '"' + (company.id === selected ? ' selected' : '') + '>' + company.name + '</option>'
    ).join('');
  }
  function defaultOwningCompanyId() {
    return crmOwningCompanyFilter === 'all' ? CRM_OWNING_COMPANIES[0].id : crmOwningCompanyFilter;
  }
  function syncOwningCompanyControls() {
    ['crmCompanyScopeFilter', 'leadCompanyScopeFilter'].forEach(id => {
      const select = document.getElementById(id);
      if (!select) return;
      select.innerHTML = '<option value="all">All Companies</option>' + owningCompanyOptions(crmOwningCompanyFilter, false);
      select.value = crmOwningCompanyFilter;
    });
  }
  function setOwningCompanyFilter(value) {
    crmOwningCompanyFilter = value === 'all' || CRM_OWNING_COMPANIES.some(company => company.id === value) ? value : 'all';
    syncOwningCompanyControls();
    if (typeof rebuildPipelineColumns === 'function') rebuildPipelineColumns();
    else recalcPipeline();
    if (typeof renderLeads === 'function') renderLeads();
    if (crmSubview === 'table') renderCrmTable();
    if (crmSubview === 'forecast') renderCrmForecast();
    if (crmSubview === 'crmforecast') renderCrmForecastV2();
    if (crmSubview === 'archive') renderArchiveView();
  }
  // Populated later in the Quote lifecycle section. Declaring it here lets the CRM board
  // recalculate Deal expiry safely before or after linked Quotes have loaded.
  let DEAL_QUOTES = {};
  let dealQuoteLifecycleReady = false;
  // Billing belongs to a Won Deal but is not a pipeline stage. Each Invoice keeps its own
  // document/payment amounts so a Deal can be partially invoiced and partially paid at once.
  let DEAL_BILLING = {
    'Harland WeHo Theater': [
      { no: 'INV-2055', type: 'standard', status: 'sent', total: 50688, paid: 50688, issued: '2026-08-07', due: '2026-08-14' }
    ],
    'Meeting Room AV Fit-out': [
      { no: 'INV-2064', type: 'standard', status: 'sent', total: 18987, paid: 0, issued: '2026-08-15', due: '2026-08-17' }
    ],
    'Private Cinema Room': [
      { no: 'INV-2061', type: 'deposit', status: 'sent', total: 80000, paid: 30000, issued: '2026-08-11', due: '2026-09-05' },
      { no: 'INV-2068', type: 'standard', status: 'sent', total: 40000, paid: 0, issued: '2026-08-18', due: '2026-09-20' },
      { no: 'INV-2072', type: 'standard', status: 'draft', total: 20000, paid: 0, issued: '', due: '2026-10-04' }
    ],
    'Office AV Refresh': [
      { no: 'INV-2071', type: 'standard', status: 'draft', total: 3000, paid: 0, issued: '', due: '2026-09-30' }
    ]
  };
  let nextInvoiceNo = 2073;
  let ddBillingInvoicesOpen = false;
  let ddBillingDraftOpen = false;
  // t: deal name, c: customer, v: deal_value, s: stage, o/oc: owner, d: days since last activity (PRD §4.2)
  const CRM_DEALS = [
    { t: 'Theater Upgrades',            c: 'Les Landau',        v: 31346,  margin: 10526, s: 0, o: 'JM', oc: '#7C3AED', d: 2, hasUpdates: true,
      labels: ['Hot', 'Warm', 'Cold'], interests: ['Television', 'Lighting'] },
    { t: '2231 Quail Bluff Ct',         c: 'Cherin Joseph',     v: 35162,  margin: 7032,  s: 0, o: 'DL', oc: '#0EA5E9', d: 8,
      meetings: [{ id: 202608111430, seedKey: 'client-meeting-demo', title: 'Client meeting', date: '2026-08-11', time: '14:30', duration: 60,
        agenda: 'Confirm the brief, room requirements and next steps.', provider: 'google', providerLabel: 'Google Meet',
        link: 'https://meet.google.com/wq-quail', attendees: ['Cherin Joseph', 'Dave Lombard'], summary: '', status: 'scheduled', createdAt: '2026-08-08T09:30:00Z', createdBy: 'Lee Roche' }] },
    { t: 'Window Treatments',           c: 'Scott Small',       v: 52630,  margin: 6269,  s: 0, o: 'SP', oc: '#1E8539', d: 34 },
    { t: 'Garden Light/Tree Mount',     c: 'Carley Knobloch',   v: 926,    margin: 185,   s: 1, o: 'GR', oc: '#F59E0B', d: 1  },
    { t: 'IP Camera Upgrades',          c: 'Jerry Grundhofer',  v: 28656,  margin: 5731,  s: 4, o: 'JM', oc: '#7C3AED', d: 12 },
    { t: 'New Pool TV',                 c: 'Farrel Stevins',    v: 10555,  margin: 2111,  s: 1, o: 'PB', oc: '#EF4444', d: 5,
      meetings: [{ id: 202608141000, seedKey: 'site-visit-demo', title: 'Site visit', date: '2026-08-14', time: '10:00', duration: 90,
        agenda: 'Survey mounting position, cable route and power availability.', provider: 'in-person', providerLabel: 'In person',
        address: '742 Palm Crest Drive, Las Vegas, NV 89138', link: '', attendees: ['Farrel Stevins', 'Patrick Burke'], summary: '', status: 'scheduled', createdAt: '2026-08-09T11:00:00Z' }] },
    { t: '1 Burning Tree Lutron Sunnata', c: '1 Burning Tree', contact: 'Marcus Reed', v: 62307, margin: 8080,  s: 4, o: 'DL', oc: '#0EA5E9', d: 3 },
    { t: '20436 Rocha Chica Drive v2',  c: 'Ethan Van Der Ryn', v: 40383,  margin: 12460, s: 6, o: 'AO', oc: '#06B6D4', d: 44 },
    { t: 'Harland WeHo Theater',        c: 'DPP9 Owner LLC', contact: 'Priya Shah', v: 50688, margin: 10140, s: 5, o: 'JM', oc: '#7C3AED', d: 6 },
    { t: 'New Motorized Drapery Track', c: 'Les Landau',        v: 6326,   margin: 1260,  s: 5, o: 'SP', oc: '#1E8539', d: 15, invoiceActionDue: '2026-08-22' },
    { t: 'Meeting Room AV Fit-out',     c: 'Jim Korzelius',     v: 18987,  margin: 3800,  s: 5, o: 'GR', oc: '#F59E0B', d: 4  },
    { t: 'Private Cinema Room',         c: 'Steve Coon',        v: 206925, margin: 41380, s: 5, o: 'JM', oc: '#7C3AED', d: 9  },
    { t: 'Office AV Refresh',           c: 'Gabriel Rivera',    v: 12400,  margin: 2480,  s: 5, o: 'PB', oc: '#EF4444', d: 21 },
    { t: 'Backyard Cinema Deck',        c: 'Marisol Trent',     v: 15800,  margin: 3160,  s: 6, o: 'SP', oc: '#1E8539', d: 41, lostReason: 'Went with a competitor' },
    { t: 'Riverside Penthouse Enquiry', c: 'Avery Morgan',      v: 22800,  margin: 4560,  s: 0, o: 'LR', oc: '#576A92', d: 1 },
    { t: 'Orchard House Lighting Options', c: 'Orchard House',  v: 18200,  margin: 3640,  s: 4, o: 'LR', oc: '#576A92', d: 22 },
    { t: 'Cinema Standard — Initial Scope', c: 'Northstar Developments', v: 151500, margin: 27300, s: 1, o: 'LR', oc: '#576A92', d: 10,
      archived: true, archivedAt: '2026-07-30T09:20:00Z', archivedBy: 'Lee (You)', archivedFromStageIndex: 1, archivedFromStage: 'In Progress', archivedOutcome: 'open' },
    { t: 'Private Cinema Room — Previous Offer', c: 'Steve Coon', v: 180000, margin: 32400, s: 5, o: 'JM', oc: '#7C3AED', d: 18,
      archived: true, archivedAt: '2026-07-18T14:05:00Z', archivedBy: 'Jeff Mitchel', archivedFromStageIndex: 5, archivedFromStage: 'Won', archivedOutcome: 'won' },
    { t: 'Backyard Cinema Deck — Withdrawn', c: 'Marisol Trent', v: 12000, margin: 2240, s: 6, o: 'SP', oc: '#1E8539', d: 45,
      archived: true, archivedAt: '2026-06-24T11:40:00Z', archivedBy: 'Sean Prater', archivedFromStageIndex: 6, archivedFromStage: 'Lost', archivedOutcome: 'lost' }
  ];
  const clonePipelineStage = stage => ({ ...stage });
  const clonePipelineDeal = deal => ({ ...deal });
  function pipelineUsesQuoteLifecycle(pipeline) {
    if (!pipeline) return false;
    if (pipeline.type === 'standalone' || pipeline.quoteConnected === false) return false;
    return pipeline.type === 'quote-connected' || pipeline.quoteConnected === true || pipeline.id === 'sales-pipeline' ||
      (pipeline.stages || []).some(stage => stage && stage.protected && stage.lifecycleRule && stage.name === 'Sent');
  }

  function lifecycleSegmentEndName(segmentStart) {
    return CRM_QUOTE_SEGMENT_ENDS[segmentStart] || 'next protected milestone';
  }

  function lifecycleSegmentLabel(segmentStart) {
    return segmentStart + ' → ' + lifecycleSegmentEndName(segmentStart);
  }

  function inferLifecycleSegment(stages, stageIndex) {
    let segment = 'Qualified';
    for (let index = 0; index < stageIndex; index += 1) {
      const stage = stages[index] || {};
      const canonical = CRM_SALES_STAGE_ALIASES[String(stage.name || '').trim().toLowerCase()] || stage.name;
      if (CRM_QUOTE_SEGMENT_STARTS.includes(canonical)) segment = canonical;
      if (stage.outcome) break;
    }
    return CRM_QUOTE_SEGMENT_STARTS.includes(segment) ? segment : 'Qualified';
  }

  function customStageIdentity(stage, index) {
    if (stage.customStageId) return stage.customStageId;
    const stem = String(stage.name || 'stage').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'stage';
    return 'custom-' + stem + '-' + index;
  }

  function normaliseSalesPipelineLifecycle(pipeline) {
    if (!pipeline) return pipeline;
    if (!pipelineUsesQuoteLifecycle(pipeline)) {
      pipeline.type = 'standalone';
      pipeline.quoteConnected = false;
      (pipeline.stages || []).forEach((stage, index) => {
        if (!stage || stage.protected || stage.outcome || stage.customStageId) return;
        stage.customStageId = customStageIdentity(stage, index);
      });
      return pipeline;
    }
    pipeline.type = 'quote-connected';
    pipeline.quoteConnected = true;
    const previousStages = Array.isArray(pipeline.stages) ? pipeline.stages : [];
    const customStages = previousStages.reduce((result, stage, index) => {
      if (!stage || stage.protected || stage.outcome) return result;
      const lifecycleSegment = CRM_QUOTE_SEGMENT_STARTS.includes(stage.lifecycleSegment)
        ? stage.lifecycleSegment
        : inferLifecycleSegment(previousStages, index);
      result.push({
        ...stage,
        protected: false,
        customStageId: customStageIdentity(stage, index),
        lifecycleSegment
      });
      return result;
    }, []);
    const targetStages = [];
    CRM_SALES_STAGE_TEMPLATE.forEach(anchor => {
      targetStages.push(clonePipelineStage(anchor));
      customStages.filter(stage => stage.lifecycleSegment === anchor.name).forEach(stage => targetStages.push(stage));
    });
    const targetIndex = name => targetStages.findIndex(stage => stage.name === name);
    const mappedName = value => CRM_SALES_STAGE_ALIASES[String(value || '').trim().toLowerCase()] || 'Qualified';

    (pipeline.deals || []).forEach(deal => {
      const oldStage = previousStages[deal.s] || {};
      const oldName = deal.archived
        ? (deal.archivedFromStage || ((previousStages[deal.archivedFromStageIndex] || {}).name) || oldStage.name)
        : oldStage.name;
      const customIndex = oldStage && !oldStage.protected
        ? targetStages.findIndex(stage => !stage.protected && (
          (oldStage.customStageId && stage.customStageId === oldStage.customStageId) ||
          (!oldStage.customStageId && stage.name === oldStage.name)
        ))
        : -1;
      const canonicalName = mappedName(oldName);
      const canonicalIndex = customIndex >= 0 ? customIndex : Math.max(0, targetIndex(canonicalName));
      deal.s = canonicalIndex;
      if (deal.archived) {
        deal.archivedFromStageIndex = canonicalIndex;
        deal.archivedFromStage = (targetStages[canonicalIndex] || {}).name || canonicalName;
        deal.archivedOutcome = (targetStages[canonicalIndex] || {}).outcome || deal.archivedOutcome || 'open';
      }
    });
    ['Riverside Penthouse Enquiry', 'Orchard House Lighting Options'].forEach(title => {
      if ((pipeline.deals || []).some(deal => deal.t === title)) return;
      const seed = CRM_DEALS.find(deal => deal.t === title);
      if (seed) pipeline.deals.push(clonePipelineDeal(seed));
    });
    pipeline.stages = targetStages;
    pipeline.lifecycleVersion = CRM_SALES_LIFECYCLE_VERSION;
    return pipeline;
  }
  const CRM_PIPELINES = [
    {
      id: 'sales-pipeline',
      name: 'Sales Pipeline',
      stages: CRM_STAGE_DEFS.map(clonePipelineStage),
      deals: CRM_DEALS.map(clonePipelineDeal),
      lifecycleVersion: CRM_SALES_LIFECYCLE_VERSION,
      type: 'quote-connected',
      quoteConnected: true
    },
    {
      id: 'quote-pipeline',
      name: 'Quote Pipeline',
      stages: CRM_STAGE_DEFS.map(clonePipelineStage),
      deals: [],
      lifecycleVersion: CRM_SALES_LIFECYCLE_VERSION,
      type: 'quote-connected',
      quoteConnected: true
    }
  ];
  const CRM_CUSTOM_STAGE_DEMO_ID = 'custom-site-ready-demo';

  function ensureSalesPipelineCustomStageDemo() {
    const pipeline = CRM_PIPELINES.find(item => item.id === 'sales-pipeline');
    if (!pipeline || !Array.isArray(pipeline.stages)) return false;
    let demoStage = pipeline.stages.find(stage => stage && (
      stage.customStageId === CRM_CUSTOM_STAGE_DEMO_ID ||
      (!stage.protected && String(stage.name || '').toLowerCase() === 'site ready')
    ));
    let changed = false;

    if (!demoStage) {
      const previousStages = pipeline.stages.slice();
      const previousNames = (pipeline.deals || []).map(deal => (previousStages[deal.s] || {}).name || 'Qualified');
      demoStage = {
        name: 'Site Ready',
        icon: '\uf46c',
        color: '#1E8539',
        probability: 20,
        protected: false,
        customStageId: CRM_CUSTOM_STAGE_DEMO_ID,
        lifecycleSegment: 'Qualified',
        automationDemoKey: 'demo-site-ready-documents'
      };
      const insertAt = Math.max(1, pipeline.stages.findIndex(stage => stage && stage.name === 'In Progress'));
      pipeline.stages.splice(insertAt, 0, demoStage);
      (pipeline.deals || []).forEach((deal, index) => {
        const previousName = previousNames[index];
        const nextIndex = pipeline.stages.findIndex(stage => stage && stage.name === previousName);
        deal.s = nextIndex >= 0 ? nextIndex : 0;
      });
      changed = true;
    } else {
      if (demoStage.customStageId !== CRM_CUSTOM_STAGE_DEMO_ID) {
        demoStage.customStageId = CRM_CUSTOM_STAGE_DEMO_ID;
        changed = true;
      }
      if (demoStage.lifecycleSegment !== 'Qualified') {
        demoStage.lifecycleSegment = 'Qualified';
        changed = true;
      }
      demoStage.automationDemoKey = 'demo-site-ready-documents';
    }

    normaliseSalesPipelineLifecycle(pipeline);
    const demoIndex = pipeline.stages.findIndex(stage => stage && stage.customStageId === CRM_CUSTOM_STAGE_DEMO_ID);
    const demoDeal = (pipeline.deals || []).find(deal => deal.t === 'Riverside Penthouse Enquiry');
    if (demoDeal && demoIndex >= 0 && demoDeal.s !== demoIndex) {
      demoDeal.s = demoIndex;
      changed = true;
    }
    return changed;
  }
  const CRM_STORAGE_KEY = 'wequote-crm-state-v3';
  let activePipelineId = 'sales-pipeline';
  let editingPipelineId = null;
  let pendingPipelineDeleteId = null;
  let pipelineCreateContext = 'board';
  let pipelineCreateSourceId = null;
  let pipelineCreateType = 'quote-connected';
  const fmt = n => '£' + n.toLocaleString('en-US');

  const pipelineEl = document.getElementById('pipeline');
  const pipelineMinimap = document.getElementById('pipelineMinimap');
  const pipelineMinimapTrack = document.getElementById('pipelineMinimapTrack');
  const pipelineMinimapStrips = document.getElementById('pipelineMinimapStrips');
  const pipelineMinimapViewport = document.getElementById('pipelineMinimapViewport');
  let activeStageEditor = null;
  let activeStageMenu = null;
  let pendingStageDelete = null;
  let pipelineSortMode = 'default';
  const pipelineFilters = { myWork: false, owner: 'all', attention: new Set(), activity: new Set() };
  let dealStatusTooltip = null;

  function getActivePipeline() {
    return CRM_PIPELINES.find(pipeline => pipeline.id === activePipelineId) || CRM_PIPELINES[0];
  }

  function stageAutomationContext(def) {
    const pipeline = getActivePipeline();
    const quoteConnected = pipelineUsesQuoteLifecycle(pipeline);
    const stageIndex = CRM_STAGE_DEFS.indexOf(def);
    const protectedStageStem = String(def.name || 'stage').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'stage';
    const segmentStages = quoteConnected && def.lifecycleSegment
      ? CRM_STAGE_DEFS.filter(stage => !stage.protected && stage.lifecycleSegment === def.lifecycleSegment)
      : [];
    return {
      stageName: def.name,
      stageId: def.customStageId || ((def.protected || def.outcome)
        ? ('protected-' + pipeline.id + '-' + protectedStageStem)
        : ('stage-' + pipeline.id + '-' + stageIndex)),
      stageIndex,
      stageProtected: !!def.protected,
      stageOutcome: def.outcome || '',
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      pipelineType: quoteConnected ? 'quote-connected' : 'standalone',
      quoteConnected,
      lifecycleSegment: quoteConnected && !def.protected ? (def.lifecycleSegment || '') : '',
      lifecycleSegmentLabel: quoteConnected && !def.protected ? lifecycleSegmentLabel(def.lifecycleSegment || 'Qualified') : '',
      customStageIdsInSegment: segmentStages.map(stage => stage.customStageId),
      customStageNamesInSegment: segmentStages.map(stage => stage.name)
    };
  }

  function syncPipelineLifecycleUi() {
    const pipeline = getActivePipeline();
    const quoteConnected = pipelineUsesQuoteLifecycle(pipeline);
    const lifecycleLinkbar = document.getElementById('crmQuoteLifecycleLinkbar');
    if (lifecycleLinkbar) lifecycleLinkbar.hidden = crmSubview !== 'pipeline' || !quoteConnected;
    const manageButton = document.getElementById('pipelineManageButton');
    if (manageButton) {
      manageButton.setAttribute('aria-label', quoteConnected ? 'Manage Custom Stages and protected lifecycle' : 'Manage pipeline stages');
      manageButton.dataset.tooltip = quoteConnected ? 'Manage Custom Stages' : 'Manage pipeline stages';
    }
  }

  function saveActivePipelineState() {
    const pipeline = getActivePipeline();
    if (!pipeline) return;
    pipeline.stages = CRM_STAGE_DEFS.map(clonePipelineStage);
    pipeline.deals = CRM_DEALS.map(clonePipelineDeal);
    try {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify({ activePipelineId, pipelines: CRM_PIPELINES }));
    } catch (_) {}
  }

  function loadPipelineState(pipeline) {
    normaliseSalesPipelineLifecycle(pipeline);
    CRM_STAGE_DEFS.splice(0, CRM_STAGE_DEFS.length, ...pipeline.stages.map(clonePipelineStage));
    CRM_STAGES.splice(0, CRM_STAGES.length, ...CRM_STAGE_DEFS.map(stage => stage.name));
    CRM_DEALS.splice(0, CRM_DEALS.length, ...pipeline.deals.map(clonePipelineDeal));
    syncPipelineFilterOwnerOptions();
    crmTableSelected.clear();
    archiveSelected.clear();
    if (crmSubview === 'table') renderCrmTable();
    if (crmSubview === 'forecast') renderCrmForecast();
    if (crmSubview === 'crmforecast') renderCrmForecastV2();
    if (crmSubview === 'archive') renderArchiveView();
    syncPipelineLifecycleUi();
    if (typeof window.syncCrmAutomationStatus === 'function') window.syncCrmAutomationStatus();
  }

  let crmSubview = 'pipeline';
  let crmTableSort = { key: 'title', direction: 'asc' };
  const CRM_TABLE_COLUMN_WIDTH_KEY = 'wequote-crm-table-column-widths-v1';
  const CRM_TABLE_COLUMN_MIN_WIDTHS = { title: 160, value: 96, margin: 92, id: 78, stage: 120, company: 130, owner: 130, customer: 130, activity: 116 };
  const crmTableSelected = new Set();
  const archiveSelected = new Set();

  function restoreStoredCrmState() {
    try {
      const stored = JSON.parse(localStorage.getItem(CRM_STORAGE_KEY) || 'null');
      if (!stored || !Array.isArray(stored.pipelines) || !stored.pipelines.length) return;
      const validPipelines = stored.pipelines.filter(pipeline =>
        pipeline && pipeline.id && pipeline.name && Array.isArray(pipeline.stages) && Array.isArray(pipeline.deals)
      ).map(normaliseSalesPipelineLifecycle);
      if (!validPipelines.length) return;
      CRM_PIPELINES.splice(0, CRM_PIPELINES.length, ...validPipelines);
      activePipelineId = CRM_PIPELINES.some(pipeline => pipeline.id === stored.activePipelineId)
        ? stored.activePipelineId
        : CRM_PIPELINES[0].id;
      loadPipelineState(getActivePipeline());
    } catch (_) {}
  }

  restoreStoredCrmState();
  const customStageDemoAdded = ensureSalesPipelineCustomStageDemo();
  if (customStageDemoAdded) {
    if (activePipelineId === 'sales-pipeline') loadPipelineState(getActivePipeline());
    try {
      localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify({ activePipelineId, pipelines: CRM_PIPELINES }));
    } catch (_) {}
  }
  CRM_DEALS.forEach(seedOwningCompany);
  CRM_PIPELINES.forEach(pipeline => (pipeline.deals || []).forEach(seedOwningCompany));
  syncOwningCompanyControls();
  syncPipelineLifecycleUi();
  ['crmCompanyScopeFilter', 'leadCompanyScopeFilter'].forEach(id => {
    const select = document.getElementById(id);
    if (select) select.addEventListener('change', event => setOwningCompanyFilter(event.target.value));
  });

  // Seed genuine Meeting records into previously saved prototype data. Pipeline card statuses
  // are derived from these records; they are never stored as display-only labels.
  const CRM_MEETING_DEMOS = {
    '2231 Quail Bluff Ct': { id: 202608111430, seedKey: 'client-meeting-demo', title: 'Client meeting', date: '2026-08-11', time: '14:30', duration: 60,
      agenda: 'Confirm the brief, room requirements and next steps.', provider: 'google', providerLabel: 'Google Meet',
      link: 'https://meet.google.com/wq-quail', attendees: ['Cherin Joseph', 'Dave Lombard'], summary: '', status: 'scheduled', createdAt: '2026-08-08T09:30:00Z', createdBy: 'Lee Roche' },
    'New Pool TV': { id: 202608141000, seedKey: 'site-visit-demo', title: 'Site visit', date: '2026-08-14', time: '10:00', duration: 90,
      agenda: 'Survey mounting position, cable route and power availability.', provider: 'in-person', providerLabel: 'In person',
      address: '742 Palm Crest Drive, Las Vegas, NV 89138', link: '', attendees: ['Farrel Stevins', 'Patrick Burke'], summary: '', status: 'scheduled', createdAt: '2026-08-09T11:00:00Z' }
  };
  CRM_DEALS.forEach(deal => {
    delete deal.cardStatus;
    const demoMeeting = CRM_MEETING_DEMOS[deal.t];
    if (!demoMeeting) return;
    deal.meetings = Array.isArray(deal.meetings) ? deal.meetings : [];
    const alreadySeeded = deal.meetings.some(meeting => meeting.seedKey === demoMeeting.seedKey ||
      (meeting.title === demoMeeting.title && meeting.date === demoMeeting.date && meeting.time === demoMeeting.time));
    if (!alreadySeeded) deal.meetings.push({ ...demoMeeting, attendees: demoMeeting.attendees.slice() });
  });
  const CRM_MEETING_ADDRESS_DEFAULTS = {
    'Theater Upgrades': '18 Mayfair Crescent, London W1K 4JB',
    '2231 Quail Bluff Ct': '2231 Quail Bluff Ct, Henderson, NV 89044',
    'New Pool TV': '742 Palm Crest Drive, Las Vegas, NV 89138',
    '1 Burning Tree Lutron Sunnata': '1 Burning Tree, Luton, LU1 3AB'
  };
  CRM_DEALS.forEach(deal => {
    (deal.meetings || []).forEach(meeting => {
      if (meeting.provider === 'in-person' && (!meeting.address || meeting.address === deal.t)) {
        meeting.address = CRM_MEETING_ADDRESS_DEFAULTS[deal.t] || 'Address not added';
      }
    });
  });

  // Multi-activity demo: one Deal can have Meetings and Note follow-ups active together.
  const multiActivityDeal = CRM_DEALS.find(deal => deal.t === '2231 Quail Bluff Ct');
  if (multiActivityDeal) {
    // Remove the old Task-only demo. Tasks had no creation flow in Deal Detail, so the
    // overdue state appeared without a clear source for the user.
    multiActivityDeal.focusTasks = (multiActivityDeal.focusTasks || [])
      .filter(task => task.seedKey !== 'quail-room-measurements');
    multiActivityDeal.notes = Array.isArray(multiActivityDeal.notes) ? multiActivityDeal.notes : [];
    if (!multiActivityDeal.notes.some(note => note.seedKey === 'quail-projector-followup')) {
      multiActivityDeal.notes.push({
        id: 202608101545, seedKey: 'quail-projector-followup', title: 'Confirm projector model',
        body: 'Confirm the final projector model with the client before the revised proposal is issued.',
        mentions: ['Lee Roche'], author: 'Dave Lombard', createdAt: '2026-08-10T15:45:00Z',
        followUpAt: '2026-08-12T16:00:00.000Z', followUpStatus: 'open'
      });
    } else {
      const demoNote = multiActivityDeal.notes.find(note => note.seedKey === 'quail-projector-followup');
      if (!demoNote.followUpAt) demoNote.followUpAt = '2026-08-12T16:00:00.000Z';
      if (!demoNote.followUpStatus) demoNote.followUpStatus = 'open';
    }
  }

  // Qualified-stage contact SLA demo. These records represent real, completable actions
  // created when a Deal becomes Qualified rather than a passive inactivity warning.
  const contactDemoNow = new Date();
  const contactDemoToday = localIsoDate(contactDemoNow);
  const contactDemoOverdueDate = new Date(
    contactDemoNow.getFullYear(), contactDemoNow.getMonth(), contactDemoNow.getDate() - 2, 12, 0, 0
  );
  const CRM_QUALIFIED_CONTACT_DEMOS = {
    'Theater Upgrades': {
      id: 'qualified-contact-theater', seedKey: 'qualified-contact-due-demo',
      title: 'Contact customer', dueAt: contactDemoToday + 'T17:00:00', status: 'open'
    },
    'Window Treatments': {
      id: 'qualified-contact-window', seedKey: 'qualified-contact-overdue-demo',
      title: 'Contact customer', dueAt: contactDemoOverdueDate.toISOString(), status: 'open'
    }
  };
  CRM_DEALS.forEach(deal => {
    const demo = CRM_QUALIFIED_CONTACT_DEMOS[deal.t];
    if (!demo || (deal.qualifiedContact && deal.qualifiedContact.seedKey === demo.seedKey)) return;
    deal.qualifiedContact = { ...demo, assignedTo: crmTableOwnerName(deal), createdAt: new Date().toISOString() };
  });

  // One-time demo refresh: restore the Quail Deal's two overdue activities after the
  // completion/reopen interactions were introduced, without resetting them on every load.
  const CRM_OVERDUE_DEMO_REFRESH_KEY = 'wequote-crm-overdue-demo-v1';
  try {
    if (multiActivityDeal && !localStorage.getItem(CRM_OVERDUE_DEMO_REFRESH_KEY)) {
      const demoMeeting = (multiActivityDeal.meetings || []).find(meeting => meeting.seedKey === 'client-meeting-demo');
      const demoNote = (multiActivityDeal.notes || []).find(note => note.seedKey === 'quail-projector-followup');
      if (demoMeeting) {
        demoMeeting.status = 'scheduled';
        delete demoMeeting.completedAt;
      }
      if (demoNote) {
        demoNote.followUpStatus = 'open';
        delete demoNote.followUpCompletedAt;
        delete demoNote.followUpReopenedAt;
      }
      saveActivePipelineState();
      localStorage.setItem(CRM_OVERDUE_DEMO_REFRESH_KEY, '1');
    }
  } catch (_) {}

  function archiveEscape(value) {
    const characters = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(value == null ? '' : value).replace(/[&<>"']/g, character => characters[character]);
  }

  function crmTableDealId(deal) {
    const index = CRM_DEALS.indexOf(deal);
    return 'WQ-' + String(2401 + Math.max(0, index)).padStart(4, '0');
  }

  function crmTableOwnerName(deal) {
    return deal.ownerName || CRM_OWNER_NAMES[deal.o] || deal.o || 'Unassigned';
  }

  function crmTableActivity(deal) {
    const stage = CRM_STAGE_DEFS[deal.s] || {};
    if (!stage.outcome && deal.d > STALE_DAYS) {
      return { label: 'Overdue · ' + deal.d + ' days', className: 'overdue', icon: '&#xf06a;' };
    }
    if (!stage.outcome && deal.d > FOLLOWUP_DAYS) {
      return { label: 'Follow-up · ' + deal.d + ' days', className: 'followup', icon: '&#xf071;' };
    }
    if (deal.d === 0) return { label: 'Today', className: '', icon: '&#xf017;' };
    if (deal.d === 1) return { label: 'Yesterday', className: '', icon: '&#xf017;' };
    return { label: deal.d + ' days ago', className: '', icon: '&#xf017;' };
  }

  function syncCrmTableStageFilter() {
    const select = document.getElementById('crmTableStageFilter');
    if (!select) return;
    const current = select.value || 'all';
    select.innerHTML = '<option value="all">All stages</option>' + CRM_STAGE_DEFS.map((stage, index) =>
      '<option value="' + index + '">' + archiveEscape(stage.name) + '</option>'
    ).join('');
    select.value = [...select.options].some(option => option.value === current) ? current : 'all';
  }

  function crmTableFilteredRows() {
    const search = document.getElementById('crmTableSearch');
    const stageFilter = document.getElementById('crmTableStageFilter');
    const query = (search ? search.value : '').trim().toLowerCase();
    const stageValue = stageFilter ? stageFilter.value : 'all';
    const rows = CRM_DEALS.map((deal, dealIndex) => ({ deal, dealIndex }))
      .filter(({ deal }) => !deal.archived)
      .filter(({ deal }) => owningCompanyMatches(deal))
      .filter(({ deal }) => stageValue === 'all' || deal.s === Number(stageValue))
      .filter(({ deal }) => {
        if (!query) return true;
        const stage = CRM_STAGE_DEFS[deal.s] || {};
        return [deal.t, deal.c, deal.contact, crmTableOwnerName(deal), owningCompanyName(deal), stage.name, crmTableDealId(deal)]
          .some(value => String(value || '').toLowerCase().includes(query));
      });

    const direction = crmTableSort.direction === 'desc' ? -1 : 1;
    const text = value => String(value || '').toLowerCase();
    const compareText = (a, b) => text(a).localeCompare(text(b), 'en', { sensitivity: 'base' });
    const comparators = {
      title: (a, b) => compareText(a.deal.t, b.deal.t),
      value: (a, b) => (+a.deal.v || 0) - (+b.deal.v || 0),
      margin: (a, b) => (+a.deal.margin || 0) - (+b.deal.margin || 0),
      id: (a, b) => a.dealIndex - b.dealIndex,
      stage: (a, b) => a.deal.s - b.deal.s || compareText(a.deal.t, b.deal.t),
      company: (a, b) => compareText(owningCompanyName(a.deal), owningCompanyName(b.deal)),
      owner: (a, b) => compareText(crmTableOwnerName(a.deal), crmTableOwnerName(b.deal)),
      customer: (a, b) => compareText(a.deal.c, b.deal.c),
      activity: (a, b) => (+a.deal.d || 0) - (+b.deal.d || 0)
    };
    rows.sort((a, b) => direction * (comparators[crmTableSort.key] || comparators.title)(a, b));
    return rows;
  }

  function updateCrmTableSelection(rows) {
    [...crmTableSelected].forEach(deal => {
      if (!CRM_DEALS.includes(deal) || deal.archived) crmTableSelected.delete(deal);
    });
    const visibleDeals = rows.map(({ deal }) => deal);
    const visibleSelected = visibleDeals.filter(deal => crmTableSelected.has(deal));
    const selectAll = document.getElementById('crmTableSelectAll');
    if (selectAll) {
      selectAll.checked = visibleDeals.length > 0 && visibleSelected.length === visibleDeals.length;
      selectAll.indeterminate = visibleSelected.length > 0 && visibleSelected.length < visibleDeals.length;
    }
    const selection = document.getElementById('crmTableSelection');
    const selectionCount = document.getElementById('crmTableSelectionCount');
    if (selection) selection.classList.toggle('show', crmTableSelected.size > 0);
    if (selectionCount) selectionCount.textContent = crmTableSelected.size + ' selected';
  }

  function renderCrmTable() {
    const body = document.getElementById('crmTableBody');
    const empty = document.getElementById('crmTableEmpty');
    const resultCount = document.getElementById('crmTableResultCount');
    if (!body || !empty || !resultCount) return;
    syncCrmTableStageFilter();
    const rows = crmTableFilteredRows();
    const total = CRM_DEALS.filter(deal => !deal.archived && owningCompanyMatches(deal)).length;
    resultCount.textContent = rows.length === total
      ? total + (total === 1 ? ' deal' : ' deals')
      : rows.length + ' of ' + total + ' deals';

    body.innerHTML = rows.map(({ deal, dealIndex }) => {
      const stage = CRM_STAGE_DEFS[deal.s] || { name: 'Unknown', color: '#8294BA' };
      const stageOptions = CRM_STAGE_DEFS.map((option, stageIndex) =>
        '<option value="' + stageIndex + '"' + (stageIndex === deal.s ? ' selected' : '') + '>' + archiveEscape(option.name) + '</option>'
      ).join('');
      const owner = crmTableOwnerName(deal);
      const activity = crmTableActivity(deal);
      const selected = crmTableSelected.has(deal);
      return '<tr data-deal-index="' + dealIndex + '" class="' + (selected ? 'selected' : '') + '">' +
        '<td class="crm-table-check-cell"><input class="crm-table-check" type="checkbox" data-table-select="' + dealIndex + '" aria-label="Select ' + archiveEscape(deal.t) + '"' + (selected ? ' checked' : '') + '></td>' +
        '<td><div class="crm-table-title-wrap"><div class="crm-table-title"><span>' + archiveEscape(deal.t) + '</span>' +
          (deal.hasUpdates ? '<i class="fai crm-table-update" title="New updates">&#xf06a;</i>' : '') +
          '</div><span class="crm-table-subtitle">' + archiveEscape(deal.contact || deal.c || 'No contact') + '</span></div></td>' +
        '<td class="crm-table-money">' + fmt(deal.v || 0) + '</td>' +
        '<td class="crm-table-money margin">' + (deal.margin == null ? '—' : fmt(deal.margin)) + '</td>' +
        '<td class="crm-table-id">' + crmTableDealId(deal) + '</td>' +
        '<td><div class="crm-table-stage-control"><span class="crm-table-stage-square" style="background:' + archiveEscape(stage.color || '#8294BA') + '"></span>' +
          '<select class="crm-table-stage-select" data-table-stage="' + dealIndex + '" aria-label="Change Stage for ' + archiveEscape(deal.t) + '">' + stageOptions + '</select></div></td>' +
        '<td><span class="owning-company-badge"><i class="fai">&#xf1ad;</i>' + archiveEscape(owningCompanyName(deal, true)) + '</span></td>' +
        '<td><span class="crm-table-owner"><span class="crm-table-owner-avatar" style="background:' + archiveEscape(deal.oc || '#E8EDF5') + '22;box-shadow:inset 0 0 0 1px ' + archiveEscape(deal.oc || '#CAD5ED') + '55">' + archiveEscape(deal.o || '—') + '</span><span class="crm-table-owner-name">' + archiveEscape(owner) + '</span></span></td>' +
        '<td><span class="crm-table-subtitle" style="margin-top:0;color:#44577F">' + archiveEscape(deal.c || '—') + '</span></td>' +
        '<td><span class="crm-table-activity ' + activity.className + '"><i class="fai">' + activity.icon + '</i>' + activity.label + '</span></td>' +
        '<td class="crm-table-row-actions"><button type="button" class="crm-table-more" data-table-action="menu" aria-label="Actions for ' + archiveEscape(deal.t) + '"><i class="fai">&#xf141;</i></button></td>' +
      '</tr>';
    }).join('');
    body.hidden = rows.length === 0;
    empty.hidden = rows.length !== 0;
    updateCrmTableSelection(rows);

    document.querySelectorAll('[data-table-sort]').forEach(button => {
      const active = button.dataset.tableSort === crmTableSort.key;
      button.classList.toggle('active', active);
      const icon = button.querySelector('.fai');
      if (icon) icon.innerHTML = active ? (crmTableSort.direction === 'asc' ? '&#xf0d8;' : '&#xf0d7;') : '&#xf0dc;';
    });
  }

  function findPipelineCardForDeal(deal) {
    return [...pipelineEl.querySelectorAll('.deal-card')].find(card => card._deal === deal) || null;
  }

  function changeCrmTableDealStage(select) {
    const deal = CRM_DEALS[Number(select.dataset.tableStage)];
    const target = Number(select.value);
    if (!deal || !Number.isInteger(target) || !CRM_STAGE_DEFS[target]) return;
    const previous = deal.s;
    if (target === previous) return;
    const card = findPipelineCardForDeal(deal);
    if (!card) {
      select.value = String(previous);
      return;
    }
    if (target === stageIndexByOutcome('won')) {
      select.value = String(previous);
      requestWonMove(card);
      return;
    }
    if (!commitDealMove(card, target)) {
      select.value = String(previous);
      return;
    }
    const actualStage = CRM_STAGE_DEFS[deal.s] || CRM_STAGE_DEFS[target];
    qtShowSnackbar(deal.t + ' moved to ' + actualStage.name + '.', 'success');
  }

  function openCrmTableDeal(deal) {
    if (!deal) return;
    openDealPage(deal, findPipelineCardForDeal(deal));
  }

  function setCrmTableSort(key) {
    if (crmTableSort.key === key) crmTableSort.direction = crmTableSort.direction === 'asc' ? 'desc' : 'asc';
    else crmTableSort = { key, direction: ['value', 'margin', 'activity'].includes(key) ? 'desc' : 'asc' };
    renderCrmTable();
  }

  function crmTableColumnElement(key) {
    return document.querySelector('#crmDealsTableColumns col[data-table-column="' + key + '"]');
  }

  function crmTableColumnWidth(key) {
    const column = crmTableColumnElement(key);
    if (!column) return 0;
    const inlineWidth = parseFloat(column.style.width);
    return Number.isFinite(inlineWidth) ? inlineWidth : column.getBoundingClientRect().width;
  }

  function syncCrmTableWidth() {
    const table = document.getElementById('crmDealsTable');
    if (!table) return;
    const width = Array.from(document.querySelectorAll('#crmDealsTableColumns col'))
      .reduce((total, column) => total + (parseFloat(column.style.width) || 0), 0);
    if (width) table.style.width = width + 'px';
  }

  function saveCrmTableColumnWidths() {
    try {
      const widths = {};
      document.querySelectorAll('#crmDealsTableColumns col[data-table-column]').forEach(column => {
        widths[column.dataset.tableColumn] = parseFloat(column.style.width) || 0;
      });
      localStorage.setItem(CRM_TABLE_COLUMN_WIDTH_KEY, JSON.stringify(widths));
    } catch (_) {}
  }

  function resizeCrmTableColumn(key, requestedWidth) {
    const column = crmTableColumnElement(key);
    if (!column) return;
    const minimum = CRM_TABLE_COLUMN_MIN_WIDTHS[key] || 72;
    column.style.width = Math.max(minimum, Math.round(requestedWidth)) + 'px';
    syncCrmTableWidth();
  }

  function initCrmTableColumnResizing() {
    try {
      const stored = JSON.parse(localStorage.getItem(CRM_TABLE_COLUMN_WIDTH_KEY) || 'null');
      if (stored && typeof stored === 'object') {
        Object.keys(CRM_TABLE_COLUMN_MIN_WIDTHS).forEach(key => {
          if (Number.isFinite(Number(stored[key]))) resizeCrmTableColumn(key, Number(stored[key]));
        });
      }
    } catch (_) {}
    syncCrmTableWidth();

    document.querySelectorAll('[data-table-resize]').forEach(handle => {
      handle.addEventListener('pointerdown', event => {
        if (event.button !== 0) return;
        event.preventDefault();
        event.stopPropagation();
        const key = handle.dataset.tableResize;
        const startX = event.clientX;
        const startWidth = crmTableColumnWidth(key);
        handle.setPointerCapture(event.pointerId);
        handle.classList.add('resizing');
        document.body.classList.add('crm-table-column-resizing');

        const onMove = moveEvent => resizeCrmTableColumn(key, startWidth + moveEvent.clientX - startX);
        const onEnd = endEvent => {
          handle.classList.remove('resizing');
          document.body.classList.remove('crm-table-column-resizing');
          if (handle.hasPointerCapture(endEvent.pointerId)) handle.releasePointerCapture(endEvent.pointerId);
          handle.removeEventListener('pointermove', onMove);
          handle.removeEventListener('pointerup', onEnd);
          handle.removeEventListener('pointercancel', onEnd);
          saveCrmTableColumnWidths();
        };
        handle.addEventListener('pointermove', onMove);
        handle.addEventListener('pointerup', onEnd);
        handle.addEventListener('pointercancel', onEnd);
      });
      handle.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const delta = event.key === 'ArrowRight' ? 8 : -8;
        resizeCrmTableColumn(handle.dataset.tableResize, crmTableColumnWidth(handle.dataset.tableResize) + delta);
        saveCrmTableColumnWidths();
      });
    });
  }

  function crmForecastOwnerKey(deal) {
    return deal.ownerName ? 'name:' + deal.ownerName : 'code:' + (deal.o || 'unassigned');
  }

  function syncCrmForecastOwnerFilter() {
    const select = document.getElementById('crmForecastOwnerFilter');
    if (!select) return;
    const current = select.value || 'all';
    const owners = new Map();
    CRM_DEALS.filter(deal => !deal.archived && owningCompanyMatches(deal)).forEach(deal => {
      owners.set(crmForecastOwnerKey(deal), crmTableOwnerName(deal));
    });
    select.innerHTML = '<option value="all">All owners</option>' + [...owners.entries()]
      .sort((a, b) => a[1].localeCompare(b[1], 'en', { sensitivity: 'base' }))
      .map(([key, name]) => '<option value="' + archiveEscape(key) + '">' + archiveEscape(name) + '</option>')
      .join('');
    select.value = [...select.options].some(option => option.value === current) ? current : 'all';
  }

  function crmForecastDeals() {
    const select = document.getElementById('crmForecastOwnerFilter');
    const ownerKey = select ? select.value : 'all';
    return CRM_DEALS.filter(deal => !deal.archived && owningCompanyMatches(deal))
      .filter(deal => ownerKey === 'all' || crmForecastOwnerKey(deal) === ownerKey);
  }

  function crmForecastMetrics(deals) {
    const open = deals.filter(deal => !(CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].outcome));
    const won = deals.filter(deal => CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].outcome === 'won');
    const lost = deals.filter(deal => CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].outcome === 'lost');
    const openValue = open.reduce((sum, deal) => sum + (+deal.v || 0), 0);
    const wonValue = won.reduce((sum, deal) => sum + (+deal.v || 0), 0);
    const weightedOpen = open.reduce((sum, deal) => {
      const probability = +(CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].probability) || 0;
      return sum + (+deal.v || 0) * probability / 100;
    }, 0);
    const potential = openValue + wonValue;
    const weighted = wonValue + weightedOpen;
    const riskDeals = open.filter(deal => deal.d > STALE_DAYS);
    const riskValue = riskDeals.reduce((sum, deal) => sum + (+deal.v || 0), 0);
    return { open, won, lost, openValue, wonValue, weightedOpen, weighted, potential, riskDeals, riskValue };
  }

  function crmForecastMoney(value) {
    return fmt(Math.round(value || 0));
  }

  function renderCrmForecast() {
    const stageRows = document.getElementById('crmForecastStageRows');
    const ownerBody = document.getElementById('crmForecastOwnerBody');
    if (!stageRows || !ownerBody) return;
    syncCrmForecastOwnerFilter();
    const deals = crmForecastDeals();
    const metrics = crmForecastMetrics(deals);
    const ownerSelect = document.getElementById('crmForecastOwnerFilter');
    const ownerLabel = ownerSelect && ownerSelect.selectedOptions[0] ? ownerSelect.selectedOptions[0].textContent : 'All owners';

    document.getElementById('crmForecastOpenValue').textContent = crmForecastMoney(metrics.openValue);
    document.getElementById('crmForecastOpenNote').innerHTML = '<b>' + metrics.open.length + '</b> open ' + (metrics.open.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmForecastWeightedValue').textContent = crmForecastMoney(metrics.weighted);
    document.getElementById('crmForecastWeightedNote').innerHTML = '<b>' + (metrics.potential ? Math.round(metrics.weighted / metrics.potential * 100) : 0) + '%</b> of available value';
    document.getElementById('crmForecastWonValue').textContent = crmForecastMoney(metrics.wonValue);
    document.getElementById('crmForecastWonNote').innerHTML = '<b>' + metrics.won.length + '</b> Won ' + (metrics.won.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmForecastRiskValue').textContent = crmForecastMoney(metrics.riskValue);
    document.getElementById('crmForecastRiskNote').innerHTML = '<b>' + metrics.riskDeals.length + '</b> overdue ' + (metrics.riskDeals.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmForecastStageMeta').textContent = deals.length + ' Deals · ' + crmForecastMoney(metrics.potential) + ' available';
    document.getElementById('crmForecastOwnerMeta').textContent = ownerLabel;

    const stageData = CRM_STAGE_DEFS.map((stage, stageIndex) => {
      const stageDeals = deals.filter(deal => deal.s === stageIndex);
      const value = stageDeals.reduce((sum, deal) => sum + (+deal.v || 0), 0);
      const probability = +stage.probability || 0;
      return { stage, stageIndex, stageDeals, value, probability, weighted: value * probability / 100 };
    });
    const maxStageValue = Math.max(1, ...stageData.map(item => item.value));
    stageRows.innerHTML = stageData.map(item =>
      '<div class="crm-forecast-stage-row">' +
        '<div class="crm-forecast-stage-name"><span class="crm-forecast-stage-icon fai" style="color:' + archiveEscape(item.stage.color || '#8294BA') + '">' + (item.stage.icon || '&#xf111;') + '</span><span>' + archiveEscape(item.stage.name) + '</span></div>' +
        '<span class="crm-forecast-stage-count">' + item.stageDeals.length + '</span>' +
        '<div class="crm-forecast-bar-track" title="' + crmForecastMoney(item.value) + '"><div class="crm-forecast-bar-fill" style="width:' + (item.value / maxStageValue * 100).toFixed(1) + '%;background:' + archiveEscape(item.stage.color || '#8294BA') + '"></div></div>' +
        '<span class="crm-forecast-probability">' + item.probability + '% · ' + crmForecastMoney(item.value) + '</span>' +
        '<span class="crm-forecast-stage-weighted">' + crmForecastMoney(item.weighted) + '</span>' +
      '</div>'
    ).join('');

    const committedPercent = metrics.potential ? metrics.wonValue / metrics.potential * 100 : 0;
    const weightedOpenPercent = metrics.potential ? metrics.weightedOpen / metrics.potential * 100 : 0;
    const weightedEnd = Math.min(100, committedPercent + weightedOpenPercent);
    const donut = document.getElementById('crmForecastDonut');
    donut.style.background = 'conic-gradient(#1E8539 0 ' + committedPercent.toFixed(1) + '%, #F12B53 ' + committedPercent.toFixed(1) + '% ' + weightedEnd.toFixed(1) + '%, #E6EBF3 ' + weightedEnd.toFixed(1) + '% 100%)';
    document.getElementById('crmForecastDonutValue').textContent = crmForecastMoney(metrics.weighted);
    document.getElementById('crmForecastCoverage').textContent = (metrics.potential ? Math.round(metrics.weighted / metrics.potential * 100) : 0) + '% coverage';
    document.getElementById('crmForecastLegend').innerHTML =
      '<div class="crm-forecast-legend-row"><i class="crm-forecast-legend-dot" style="background:#1E8539"></i><span>Won value</span><strong>' + crmForecastMoney(metrics.wonValue) + '</strong></div>' +
      '<div class="crm-forecast-legend-row"><i class="crm-forecast-legend-dot" style="background:#F12B53"></i><span>Weighted open</span><strong>' + crmForecastMoney(metrics.weightedOpen) + '</strong></div>' +
      '<div class="crm-forecast-legend-row"><i class="crm-forecast-legend-dot" style="background:#E6EBF3"></i><span>Unweighted upside</span><strong>' + crmForecastMoney(Math.max(0, metrics.potential - metrics.weighted)) + '</strong></div>';

    const ownerGroups = new Map();
    deals.forEach(deal => {
      const key = crmForecastOwnerKey(deal);
      if (!ownerGroups.has(key)) ownerGroups.set(key, { name: crmTableOwnerName(deal), initials: deal.o || '—', color: deal.oc || '#8294BA', deals: [] });
      ownerGroups.get(key).deals.push(deal);
    });
    const owners = [...ownerGroups.values()].map(owner => ({ ...owner, metrics: crmForecastMetrics(owner.deals) }))
      .sort((a, b) => b.metrics.weighted - a.metrics.weighted);
    ownerBody.innerHTML = owners.map(owner =>
      '<tr><td><span class="crm-forecast-owner-cell"><span class="crm-table-owner-avatar" style="background:' + archiveEscape(owner.color) + '22;box-shadow:inset 0 0 0 1px ' + archiveEscape(owner.color) + '55">' + archiveEscape(owner.initials) + '</span><span>' + archiveEscape(owner.name) + '</span></span></td>' +
      '<td>' + owner.metrics.open.length + '</td>' +
      '<td class="money">' + crmForecastMoney(owner.metrics.openValue) + '</td>' +
      '<td class="money weighted">' + crmForecastMoney(owner.metrics.weightedOpen) + '</td>' +
      '<td class="money">' + crmForecastMoney(owner.metrics.wonValue) + '</td>' +
      '<td class="money weighted">' + crmForecastMoney(owner.metrics.weighted) + '</td></tr>'
    ).join('');
    document.getElementById('crmForecastOwnerEmpty').hidden = owners.length !== 0;
    document.querySelector('.crm-forecast-owner-table').hidden = owners.length === 0;
  }

  // ---------- CRM Forecast comparison concept (Chart.js) ----------
  // Kept separate from renderCrmForecast() so the original Forecast remains available for comparison.
  const CRM_V2_TARGET = 500000;
  const CRM_V2_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const CRM_V2_CLOSE_DATES = {
    'Theater Upgrades': '2026-08-15',
    '2231 Quail Bluff Ct': '2026-09-05',
    'Window Treatments': '',
    'Garden Light/Tree Mount': '2026-08-28',
    'IP Camera Upgrades': '2026-10-20',
    'New Pool TV': '2026-09-22',
    '1 Burning Tree Lutron Sunnata': '2026-10-06',
    '20436 Rocha Chica Drive v2': '2026-07-25',
    'Harland WeHo Theater': '2026-07-12',
    'New Motorized Drapery Track': '2026-07-19',
    'Meeting Room AV Fit-out': '2026-06-24',
    'Private Cinema Room': '2026-05-18',
    'Office AV Refresh': '2026-04-22',
    'Backyard Cinema Deck': '2026-06-14'
  };
  let crmV2ChartInstance = null;
  let crmV2Metric = 'value';
  let crmV2Drill = { kpi: null, health: null, month: null, stage: null };

  function crmV2CloseDate(deal) {
    const value = ddDealExpectedCloseRaw(deal);
    if (!value) return null;
    const date = new Date(value + (value.length === 10 ? 'T12:00:00' : ''));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function crmV2Category(deal) {
    const stage = CRM_STAGE_DEFS[deal.s] || {};
    if (stage.outcome === 'won') return 'committed';
    if (String(stage.name || '').toLowerCase() === 'sent') return 'expected';
    return stage.outcome ? 'excluded' : 'best';
  }

  function crmV2Probability(deal) {
    const stage = CRM_STAGE_DEFS[deal.s] || {};
    return +stage.probability || 0;
  }

  function crmV2BaseDeals() {
    const pipelineSelect = document.getElementById('crmV2Pipeline');
    const pipelineId = pipelineSelect ? pipelineSelect.value : activePipelineId;
    if (!pipelineId || pipelineId === activePipelineId) return CRM_DEALS.filter(deal => !deal.archived && owningCompanyMatches(deal));
    const pipeline = CRM_PIPELINES.find(item => item.id === pipelineId);
    return pipeline ? pipeline.deals.filter(deal => !deal.archived && owningCompanyMatches(deal)) : [];
  }

  function crmV2FilteredDeals() {
    const owner = document.getElementById('crmV2Owner').value || 'all';
    const stage = document.getElementById('crmV2Stage').value || 'all';
    const category = document.getElementById('crmV2Category').value || 'all';
    return crmV2BaseDeals()
      .filter(deal => owner === 'all' || crmForecastOwnerKey(deal) === owner)
      .filter(deal => stage === 'all' || String(deal.s) === stage)
      .filter(deal => category === 'all' || crmV2Category(deal) === category);
  }

  function crmV2Metrics(deals) {
    const open = deals.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome);
    const won = deals.filter(deal => (CRM_STAGE_DEFS[deal.s] || {}).outcome === 'won');
    const contributing = deals.filter(deal => {
      const outcome = (CRM_STAGE_DEFS[deal.s] || {}).outcome;
      return !outcome || outcome === 'won';
    });
    const openValue = open.reduce((sum, deal) => sum + (+deal.v || 0), 0);
    const wonValue = won.reduce((sum, deal) => sum + (+deal.v || 0), 0);
    const weighted = contributing.reduce((sum, deal) => sum + (+deal.v || 0) * crmV2Probability(deal) / 100, 0);
    const weightedMargin = contributing.reduce((sum, deal) => sum + (+deal.margin || 0) * crmV2Probability(deal) / 100, 0);
    const available = openValue + wonValue;
    return { open, won, contributing, openValue, wonValue, weighted, weightedMargin, available, difference: weighted - CRM_V2_TARGET };
  }

  function crmV2Quotes(deal) {
    return (DEAL_QUOTES && DEAL_QUOTES[deal.t]) || [];
  }

  function crmV2QuoteExpiringSoon(deal) {
    const now = new Date('2026-08-10T00:00:00');
    return crmV2Quotes(deal).some(quote => {
      if (!quote.expiresAt || qStatusLocked(quote.status) || qStatusLost(quote.status)) return false;
      const days = (new Date(quote.expiresAt + 'T23:59:59') - now) / 86400000;
      return days >= 0 && days <= 30;
    });
  }

  function syncCrmV2Filters() {
    const pipeline = document.getElementById('crmV2Pipeline');
    const owner = document.getElementById('crmV2Owner');
    const stage = document.getElementById('crmV2Stage');
    const pipelineCurrent = pipeline.value || activePipelineId;
    const ownerCurrent = owner.value || 'all';
    const stageCurrent = stage.value || 'all';
    pipeline.innerHTML = CRM_PIPELINES.map(item => '<option value="' + archiveEscape(item.id) + '">' + archiveEscape(item.name) + '</option>').join('');
    pipeline.value = [...pipeline.options].some(option => option.value === pipelineCurrent) ? pipelineCurrent : activePipelineId;
    const owners = new Map();
    crmV2BaseDeals().forEach(deal => owners.set(crmForecastOwnerKey(deal), crmTableOwnerName(deal)));
    owner.innerHTML = '<option value="all">All owners</option>' + [...owners.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([key, name]) => '<option value="' + archiveEscape(key) + '">' + archiveEscape(name) + '</option>').join('');
    owner.value = [...owner.options].some(option => option.value === ownerCurrent) ? ownerCurrent : 'all';
    stage.innerHTML = '<option value="all">All stages</option>' + CRM_STAGE_DEFS.map((item, index) => '<option value="' + index + '">' + archiveEscape(item.name) + '</option>').join('');
    stage.value = [...stage.options].some(option => option.value === stageCurrent) ? stageCurrent : 'all';
  }

  function crmV2SignedMoney(value) {
    const rounded = Math.round(value || 0);
    return (rounded < 0 ? '-' : '') + fmt(Math.abs(rounded));
  }

  function renderCrmV2Kpis(deals) {
    const metrics = crmV2Metrics(deals);
    document.getElementById('crmV2Open').textContent = crmForecastMoney(metrics.openValue);
    document.getElementById('crmV2OpenNote').textContent = metrics.open.length + ' open ' + (metrics.open.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmV2Weighted').textContent = crmForecastMoney(metrics.weighted);
    document.getElementById('crmV2WeightedNote').textContent = (metrics.available ? Math.round(metrics.weighted / metrics.available * 100) : 0) + '% of available value';
    document.getElementById('crmV2Margin').textContent = crmForecastMoney(metrics.weightedMargin);
    document.getElementById('crmV2MarginNote').textContent = metrics.weighted ? (metrics.weightedMargin / metrics.weighted * 100).toFixed(1) + '% expected margin' : 'Weighted margin';
    document.getElementById('crmV2Won').textContent = crmForecastMoney(metrics.wonValue);
    document.getElementById('crmV2WonNote').textContent = metrics.won.length + ' Won ' + (metrics.won.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmV2Gap').textContent = crmV2SignedMoney(metrics.difference);
    const gapEl = document.getElementById('crmV2Gap');
    gapEl.classList.toggle('negative', metrics.difference < 0);
    gapEl.classList.toggle('positive', metrics.difference >= 0);
    document.querySelectorAll('[data-v2-kpi]').forEach(button => button.classList.toggle('active', button.dataset.v2Kpi === crmV2Drill.kpi));
    return metrics;
  }

  function renderCrmV2Health(deals) {
    const open = deals.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome);
    const noQuote = open.filter(deal => crmV2Quotes(deal).length === 0);
    const unscheduled = open.filter(deal => !crmV2CloseDate(deal));
    const overdue = open.filter(deal => deal.d > STALE_DAYS);
    const expiring = open.filter(crmV2QuoteExpiringSoon);
    document.getElementById('crmV2NoQuote').textContent = noQuote.length;
    document.getElementById('crmV2Unscheduled').textContent = unscheduled.length;
    document.getElementById('crmV2Overdue').textContent = overdue.length;
    document.getElementById('crmV2Expiring').textContent = expiring.length;
    document.querySelectorAll('[data-v2-health]').forEach(button => button.classList.toggle('active', button.dataset.v2Health === crmV2Drill.health));
    return { noQuote, unscheduled, overdue, expiring };
  }

  function crmV2ChartStageIndexes() {
    const indexes = [];
    ['Qualified', 'In Progress', 'In Review', 'Passed Review', 'Sent'].forEach(name => {
      const index = CRM_STAGE_DEFS.findIndex(stage => stage.name === name);
      if (index >= 0) indexes.push(index);
    });
    const wonIndex = stageIndexByOutcome('won');
    if (wonIndex >= 0) indexes.push(wonIndex);
    return indexes;
  }

  function renderCrmV2Chart(deals) {
    const canvas = document.getElementById('crmV2Chart');
    const fallback = document.getElementById('crmV2ChartFallback');
    if (!canvas) return;
    if (crmV2ChartInstance) {
      crmV2ChartInstance.destroy();
      crmV2ChartInstance = null;
    }
    if (typeof window.Chart !== 'function') {
      canvas.hidden = true;
      fallback.hidden = false;
      return;
    }
    canvas.hidden = false;
    fallback.hidden = true;
    const palette = { Qualified: '#576A92', 'In Progress': '#2450FF', 'In Review': '#7C3AED', 'Passed Review': '#8B5CF6', Sent: '#B97A00', Won: '#1E8539' };
    const datasets = crmV2ChartStageIndexes().map(stageIndex => {
      const stage = CRM_STAGE_DEFS[stageIndex];
      const rawValues = CRM_V2_MONTHS.map((month, monthIndex) => deals.filter(deal => deal.s === stageIndex && crmV2CloseDate(deal) && crmV2CloseDate(deal).getMonth() === monthIndex).reduce((sum, deal) => sum + (crmV2Metric === 'margin' ? (+deal.margin || 0) : (+deal.v || 0)), 0));
      const probability = +stage.probability || 0;
      return {
        type: 'bar', label: stage.name, stageIndex, probability, rawValues,
        data: rawValues.map(value => Math.round(value * probability / 100)),
        backgroundColor: palette[stage.name] || stage.color || '#8294BA',
        borderWidth: 0, borderRadius: 3, borderSkipped: false, stack: 'forecast', barPercentage: .72, categoryPercentage: .78
      };
    });
    datasets.push({
      type: 'line', label: 'Monthly target', data: CRM_V2_MONTHS.map(() => Math.round(CRM_V2_TARGET / 12)),
      borderColor: '#D52145', borderWidth: 1.25, borderDash: [5, 4], pointRadius: 0, pointHoverRadius: 0, tension: 0, order: -1
    });
    window.Chart.defaults.font.family = 'Geist, sans-serif';
    crmV2ChartInstance = new window.Chart(canvas, {
      type: 'bar', data: { labels: CRM_V2_MONTHS, datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: { duration: 280 }, interaction: { mode: 'nearest', intersect: true },
        onClick: (event, elements, chart) => {
          if (!elements.length) return;
          const element = elements[0];
          const dataset = chart.data.datasets[element.datasetIndex];
          if (dataset.type === 'line') return;
          crmV2Drill = { kpi: null, health: null, month: element.index, stage: dataset.stageIndex };
          renderCrmV2Table(crmV2FilteredDeals());
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#273650', titleFont: { size: 11, weight: '700' }, bodyFont: { size: 10 }, padding: 10, cornerRadius: 4,
            callbacks: {
              label: context => {
                const dataset = context.dataset;
                if (dataset.type === 'line') return 'Target: ' + crmForecastMoney(context.parsed.y);
                return dataset.label + ' weighted: ' + crmForecastMoney(context.parsed.y);
              },
              afterLabel: context => context.dataset.type === 'line' ? '' : 'Raw ' + (crmV2Metric === 'margin' ? 'margin' : 'Deal value') + ': ' + crmForecastMoney(context.dataset.rawValues[context.dataIndex]) + ' · ' + context.dataset.probability + '%'
            }
          }
        },
        scales: {
          x: { stacked: true, grid: { display: false }, border: { display: false }, ticks: { color: '#7185AD', font: { size: 9, weight: '600' } } },
          y: { stacked: true, beginAtZero: true, border: { display: false }, grid: { color: '#EDF1F7' }, ticks: { color: '#8294BA', font: { size: 8, weight: '600' }, callback: value => value >= 1000 ? '£' + Math.round(value / 1000) + 'k' : '£' + value } }
        }
      }
    });
    document.getElementById('crmV2ChartMeta').textContent = 'January–December 2026 · ' + (crmV2Metric === 'margin' ? 'weighted margin' : 'weighted Deal value');
  }

  function renderCrmV2Probabilities(metrics) {
    const rows = document.getElementById('crmV2ProbabilityRows');
    const sublabels = { Qualified: 'No related Quote yet', 'In Progress': 'Related Quote is editable', 'In Review': 'Quote submitted for internal review', 'Passed Review': 'Approved internally and ready to send', Sent: 'Viable Quote sent to customer', Won: 'At least one Quote accepted or complete', Lost: 'No viable related Quote remains' };
    rows.innerHTML = CRM_STAGE_DEFS.map(stage => '<div class="crm-v2-prob-row"><i class="fai" style="color:' + archiveEscape(stage.color || '#8294BA') + '">' + (stage.icon || '&#xf111;') + '</i><span>' + archiveEscape(stage.name) + '<small>' + archiveEscape(sublabels[stage.name] || 'Pipeline stage') + '</small></span><strong>' + (+stage.probability || 0) + '%</strong></div>').join('');
    const coverage = metrics.available ? Math.min(100, metrics.weighted / metrics.available * 100) : 0;
    document.getElementById('crmV2Coverage').textContent = Math.round(coverage) + '%';
    document.getElementById('crmV2CoverageBar').style.width = coverage.toFixed(1) + '%';
  }

  function crmV2TableDeals(deals) {
    let rows = deals.slice();
    if (crmV2Drill.kpi === 'open') rows = rows.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome);
    if (crmV2Drill.kpi === 'won') rows = rows.filter(deal => (CRM_STAGE_DEFS[deal.s] || {}).outcome === 'won');
    if (crmV2Drill.health === 'noquote') rows = rows.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome && crmV2Quotes(deal).length === 0);
    if (crmV2Drill.health === 'unscheduled') rows = rows.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome && !crmV2CloseDate(deal));
    if (crmV2Drill.health === 'overdue') rows = rows.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome && deal.d > STALE_DAYS);
    if (crmV2Drill.health === 'expiring') rows = rows.filter(deal => !(CRM_STAGE_DEFS[deal.s] || {}).outcome && crmV2QuoteExpiringSoon(deal));
    if (crmV2Drill.month != null) rows = rows.filter(deal => crmV2CloseDate(deal) && crmV2CloseDate(deal).getMonth() === crmV2Drill.month);
    if (crmV2Drill.stage != null) rows = rows.filter(deal => deal.s === crmV2Drill.stage);
    return rows.sort((a, b) => {
      const aDate = crmV2CloseDate(a), bDate = crmV2CloseDate(b);
      if (!aDate && !bDate) return String(a.t).localeCompare(String(b.t));
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate - bDate;
    });
  }

  function renderCrmV2Table(deals) {
    const body = document.getElementById('crmV2TableBody');
    const empty = document.getElementById('crmV2Empty');
    const table = document.querySelector('.crm-v2-table');
    const rows = crmV2TableDeals(deals);
    body.innerHTML = rows.map(deal => {
      const stage = CRM_STAGE_DEFS[deal.s] || { name: 'Unknown', color: '#8294BA' };
      const probability = crmV2Probability(deal);
      const date = crmV2CloseDate(deal);
      const category = crmV2Category(deal);
      const categoryLabel = { best: 'Best case', expected: 'Expected', committed: 'Committed', excluded: 'Excluded' }[category] || category;
      const weighted = (+deal.v || 0) * probability / 100;
      const dealIndex = CRM_DEALS.indexOf(deal);
      return '<tr>' +
        '<td><button type="button" class="crm-v2-deal-link" data-v2-deal="' + dealIndex + '">' + archiveEscape(deal.t) + '</button></td>' +
        '<td>' + archiveEscape(deal.c || 'No customer') + '</td>' +
        '<td class="crm-v2-date">' + (date ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '<span class="crm-v2-unscheduled"><i class="fai">&#xf071;</i> Unscheduled</span><button type="button" class="crm-v2-add-date" data-v2-add-date="' + dealIndex + '">Add close date</button>') + '</td>' +
        '<td><span class="crm-v2-stage"><i style="background:' + archiveEscape(stage.color || '#8294BA') + '"></i>' + archiveEscape(stage.name) + '</span></td>' +
        '<td>' + archiveEscape(crmTableOwnerName(deal)) + '</td>' +
        '<td>' + probability + '%</td>' +
        '<td class="crm-v2-money">' + crmForecastMoney(deal.v || 0) + '</td>' +
        '<td class="crm-v2-money weighted">' + crmForecastMoney(weighted) + '</td>' +
        '<td class="crm-v2-money margin">' + crmForecastMoney((+deal.margin || 0) * probability / 100) + '</td>' +
        '<td><span class="crm-v2-category ' + category + '">' + archiveEscape(categoryLabel) + '</span></td>' +
      '</tr>';
    }).join('');
    document.getElementById('crmV2TableMeta').textContent = rows.length + ' ' + (rows.length === 1 ? 'Deal' : 'Deals') + ' · ' + crmForecastMoney(rows.reduce((sum, deal) => sum + (+deal.v || 0) * crmV2Probability(deal) / 100, 0)) + ' weighted';
    const labels = [];
    if (crmV2Drill.kpi) labels.push({ open: 'Open Deals', weighted: 'Weighted forecast', margin: 'Expected margin', won: 'Won Deals', gap: 'Gap contributors' }[crmV2Drill.kpi]);
    if (crmV2Drill.health) labels.push({ noquote: 'Deals without Quotes', unscheduled: 'Unscheduled Deals', overdue: 'Overdue follow-ups', expiring: 'Quotes expiring soon' }[crmV2Drill.health]);
    if (crmV2Drill.month != null) labels.push(CRM_V2_MONTHS[crmV2Drill.month]);
    if (crmV2Drill.stage != null) labels.push((CRM_STAGE_DEFS[crmV2Drill.stage] || {}).name);
    const active = document.getElementById('crmV2ActiveFilter');
    active.textContent = labels.length ? labels.join(' · ') + ' ×' : '';
    active.hidden = labels.length === 0;
    table.hidden = rows.length === 0;
    empty.hidden = rows.length !== 0;
  }

  function renderCrmForecastV2() {
    syncCrmV2Filters();
    const deals = crmV2FilteredDeals();
    const metrics = renderCrmV2Kpis(deals);
    renderCrmV2Health(deals);
    renderCrmV2Chart(deals);
    renderCrmV2Probabilities(metrics);
    renderCrmV2Table(deals);
  }

  // Round 2: owner-led Commit / Best case model using one canonical FY 2026 dataset.
  // These renderer assignments intentionally supersede the comparison concept above while
  // leaving the legacy stage-weighted Forecast available in its own tab.
  const CRM_COMMIT_DATA = {
    'Theater Upgrades': { value: 30018, margin: 6004, stage: 'Qualified', color: '#576A92', category: 'commit', close: '2026-08-15', quoteCount: 2, orLabel: 'OR ×2', forecastQuote: 'Quote #24589 · Original proposal' },
    'Window Treatments': { value: 38382, margin: 7676, stage: 'Qualified', color: '#576A92', category: 'omitted', close: '', quoteCount: 0, overdue: true },
    'Garden Light/Tree Mount': { value: 31200, margin: 6240, stage: 'In Progress', color: '#2450FF', category: 'best', close: '2026-08-28', quoteCount: 2, orLabel: 'OR ×2', forecastQuote: 'Quote #24587 · Primary lighting scope' },
    'IP Camera Upgrades': { value: 40000, margin: 8000, stage: 'Sent', color: '#B97A00', category: 'commit', close: '2026-10-20', quoteCount: 1 },
    'New Pool TV': { value: 27000, margin: 5400, stage: 'In Progress', color: '#2450FF', category: 'commit', close: '2026-09-22', quoteCount: 1 },
    '1 Burning Tree Lutron Sunnata': { value: 30000, margin: 6000, stage: 'Sent', color: '#B97A00', category: 'commit', close: '2026-10-06', quoteCount: 2, expiring: true, orLabel: 'OR ×2', forecastQuote: 'Quote #11884 · Lutron Sunnata package' },
    '20436 Rocha Chica Drive v2': { value: 24982, margin: 4996, stage: 'Sent', color: '#B97A00', category: 'commit', close: '2026-08-25', quoteCount: 0 },
    'Harland WeHo Theater': { value: 50688, margin: 10140, stage: 'Won', color: '#1E8539', category: 'won', close: '2026-07-12', quoteCount: 2, won: true },
    'New Motorized Drapery Track': { value: 6326, margin: 1260, stage: 'Won', color: '#1E8539', category: 'won', close: '2026-07-19', quoteCount: 1, won: true },
    'Meeting Room AV Fit-out': { value: 18987, margin: 3800, stage: 'Won', color: '#1E8539', category: 'won', close: '2026-06-24', quoteCount: 1, won: true },
    'Private Cinema Room': { value: 206925, margin: 41380, stage: 'Won', color: '#1E8539', category: 'won', close: '2026-05-18', quoteCount: 1, won: true, coNote: 'Includes accepted CO differences, including −£1,200 omission.' },
    'Office AV Refresh': { value: 12400, margin: 2480, stage: 'Won', color: '#1E8539', category: 'won', close: '2026-04-22', quoteCount: 1, won: true }
  };
  const CRM_COMMIT_CATEGORY = {
    commit: { label: 'Commit', color: '#7C3AED', icon: '&#xf058;' },
    best: { label: 'Best case', color: '#B97A00', icon: '&#xf201;' },
    omitted: { label: 'Omitted', color: '#8294BA', icon: '&#xf070;' },
    won: { label: 'Won', color: '#1E8539', icon: '&#xf521;' }
  };

  function crmCommitRows() {
    return Object.entries(CRM_COMMIT_DATA).map(([title, meta]) => {
      const deal = CRM_DEALS.find(item => item.t === title);
      return deal ? { deal, ...meta, close: ddDealExpectedCloseRaw(deal) } : null;
    }).filter(Boolean);
  }

  crmV2CloseDate = function(item) {
    const value = item && item.deal ? ddDealExpectedCloseRaw(item.deal) : String((item && item.close) || '').trim();
    if (!value) return null;
    const date = new Date(value + (value.length === 10 ? 'T12:00:00' : ''));
    return Number.isNaN(date.getTime()) ? null : date;
  };

  crmV2Category = function(item) { return item.category; };

  syncCrmV2Filters = function() {
    const pipeline = document.getElementById('crmV2Pipeline');
    const owner = document.getElementById('crmV2Owner');
    const stage = document.getElementById('crmV2Stage');
    const pipelineCurrent = pipeline.value || 'sales-pipeline';
    const ownerCurrent = owner.value || 'all';
    const stageCurrent = stage.value || 'all';
    pipeline.innerHTML = '<option value="sales-pipeline">Sales Pipeline</option><option value="quote-pipeline">Quote Pipeline</option>';
    pipeline.value = pipelineCurrent === 'quote-pipeline' ? 'quote-pipeline' : 'sales-pipeline';
    const owners = new Map();
    crmCommitRows().forEach(item => owners.set(crmForecastOwnerKey(item.deal), crmTableOwnerName(item.deal)));
    owner.innerHTML = '<option value="all">All owners</option>' + [...owners.entries()].sort((a,b) => a[1].localeCompare(b[1])).map(([key,name]) => '<option value="' + archiveEscape(key) + '">' + archiveEscape(name) + '</option>').join('');
    owner.value = [...owner.options].some(option => option.value === ownerCurrent) ? ownerCurrent : 'all';
    stage.innerHTML = '<option value="all">All stages</option><option value="Qualified">Qualified</option><option value="In Progress">In Progress</option><option value="In Review">In Review</option><option value="Passed Review">Passed Review</option><option value="Sent">Sent</option><option value="Won">Won</option><option value="Lost">Lost</option>';
    stage.value = [...stage.options].some(option => option.value === stageCurrent) ? stageCurrent : 'all';
  };

  crmV2FilteredDeals = function() {
    if (document.getElementById('crmV2Pipeline').value === 'quote-pipeline') return [];
    const owner = document.getElementById('crmV2Owner').value || 'all';
    const stage = document.getElementById('crmV2Stage').value || 'all';
    const category = document.getElementById('crmV2Category').value || 'all';
    return crmCommitRows()
      .filter(item => owner === 'all' || crmForecastOwnerKey(item.deal) === owner)
      .filter(item => stage === 'all' || item.stage === stage)
      .filter(item => category === 'all' || item.category === category);
  };

  crmV2Metrics = function(rows) {
    const commit = rows.filter(item => item.category === 'commit');
    const best = rows.filter(item => item.category === 'best');
    const omitted = rows.filter(item => item.category === 'omitted');
    const won = rows.filter(item => item.category === 'won');
    const sum = list => list.reduce((total,item) => total + item.value, 0);
    const margin = list => list.reduce((total,item) => total + item.margin, 0);
    const commitValue = sum(commit);
    const bestOnlyValue = sum(best);
    const wonValue = sum(won);
    const openValue = sum(commit) + sum(best) + sum(omitted);
    return { commit, best, omitted, won, commitValue, bestOnlyValue, bestValue: commitValue + bestOnlyValue, wonValue, openValue, commitMargin: margin(commit), bestMargin: margin(commit) + margin(best), wonMargin: margin(won), gap: CRM_V2_TARGET - wonValue - commitValue };
  };

  renderCrmV2Kpis = function(rows) {
    const metrics = crmV2Metrics(rows);
    document.getElementById('crmV2Committed').textContent = crmForecastMoney(metrics.commitValue);
    document.getElementById('crmV2CommittedNote').textContent = metrics.commit.length + ' Commit ' + (metrics.commit.length === 1 ? 'Deal' : 'Deals');
    document.getElementById('crmV2Best').textContent = crmForecastMoney(metrics.bestValue);
    document.getElementById('crmV2BestNote').textContent = crmForecastMoney(metrics.commitValue) + ' Commit + ' + crmForecastMoney(metrics.bestOnlyValue) + ' Best case';
    document.getElementById('crmV2Won').textContent = crmForecastMoney(metrics.wonValue);
    document.getElementById('crmV2WonNote').textContent = metrics.won.length + ' Won Deals · accepted net + CO differences';
    document.getElementById('crmV2Gap').textContent = crmForecastMoney(metrics.gap);
    const gap = document.getElementById('crmV2Gap');
    gap.classList.toggle('negative', metrics.gap > 0);
    gap.classList.toggle('positive', metrics.gap <= 0);
    document.querySelectorAll('[data-v2-kpi]').forEach(button => button.classList.toggle('active', button.dataset.v2Kpi === crmV2Drill.kpi));
    return metrics;
  };

  renderCrmV2Health = function(rows) {
    const open = rows.filter(item => !item.won);
    const noQuote = open.filter(item => item.quoteCount === 0);
    const unscheduled = open.filter(item => !item.close);
    const overdue = open.filter(item => item.overdue);
    const expiring = open.filter(item => item.expiring);
    document.getElementById('crmV2NoQuote').textContent = noQuote.length;
    document.getElementById('crmV2Unscheduled').textContent = unscheduled.length;
    document.getElementById('crmV2Overdue').textContent = overdue.length;
    document.getElementById('crmV2Expiring').textContent = expiring.length;
    document.querySelectorAll('[data-v2-health]').forEach(button => button.classList.toggle('active', button.dataset.v2Health === crmV2Drill.health));
    return { noQuote, unscheduled, overdue, expiring };
  };

  renderCrmV2Chart = function(rows) {
    const chart = document.getElementById('crmV2Chart');
    const categories = ['won','commit','best'];
    const values = CRM_V2_MONTHS.map((label,month) => {
      const monthRows = rows.filter(item => crmV2CloseDate(item) && crmV2CloseDate(item).getMonth() === month);
      const result = { label, month, total: 0, segments: [] };
      categories.forEach(category => {
        const categoryRows = monthRows.filter(item => item.category === category);
        const value = categoryRows.reduce((sum,item) => sum + (crmV2Metric === 'margin' ? item.margin : item.value), 0);
        result.total += value;
        result.segments.push({ category, value, rows: categoryRows });
      });
      return result;
    });
    const max = Math.max(CRM_V2_TARGET / 12, ...values.map(item => item.total), 1);
    chart.innerHTML = '<div class="crm-v2-native-axis"><span>' + crmForecastMoney(max) + '</span><span>' + crmForecastMoney(max / 2) + '</span><span>£0</span></div><div class="crm-v2-native-target" style="bottom:' + Math.min(86,(CRM_V2_TARGET / 12 / max * 100)).toFixed(1) + '%"><span>Monthly target ' + crmForecastMoney(CRM_V2_TARGET / 12) + '</span></div>' + values.map(month => {
      const height = month.total ? Math.max(3,month.total / max * 100) : 0;
      return '<div class="crm-v2-native-month' + (crmV2Drill.month === month.month ? ' active' : '') + '" data-v2-month="' + month.month + '"><div class="crm-v2-native-stack" style="height:' + height.toFixed(1) + '%">' + month.segments.map(segment => segment.value ? '<button type="button" class="' + segment.category + (crmV2Drill.stage === segment.category ? ' active' : '') + '" style="flex:' + segment.value + '" data-v2-chart-category="' + segment.category + '" title="' + archiveEscape(CRM_COMMIT_CATEGORY[segment.category].label) + ': ' + crmForecastMoney(segment.value) + '"></button>' : '').join('') + '</div><span>' + month.label + '</span></div>';
    }).join('');
    chart.onclick = event => {
      const segment = event.target.closest('[data-v2-chart-category]');
      const month = event.target.closest('[data-v2-month]');
      if (!month) return;
      crmV2Drill = { kpi: null, health: null, month: Number(month.dataset.v2Month), stage: segment ? segment.dataset.v2ChartCategory : null };
      renderCrmV2Chart(crmV2FilteredDeals());
      renderCrmV2Table(crmV2FilteredDeals());
    };
    document.getElementById('crmV2ChartMeta').textContent = 'January–December 2026 · ' + (crmV2Metric === 'margin' ? 'margin value' : 'Deal value') + ' · no probability weighting';
  };

  renderCrmV2Probabilities = function(metrics) {
    const rows = document.getElementById('crmV2ProbabilityRows');
    const items = [
      { key:'won', count:metrics.won.length, value:metrics.wonValue, note:'Accepted net totals + CO differences' },
      { key:'commit', count:metrics.commit.length, value:metrics.commitValue, note:'Owner committed to close' },
      { key:'best', count:metrics.best.length, value:metrics.bestOnlyValue, note:'Possible upside' },
      { key:'omitted', count:metrics.omitted.length, value:metrics.omitted.reduce((sum,item)=>sum+item.value,0), note:'Contributes £0 to forecast' }
    ];
    rows.innerHTML = items.map(item => { const def = CRM_COMMIT_CATEGORY[item.key]; return '<div class="crm-v2-prob-row"><i class="fai" style="color:' + def.color + '">' + def.icon + '</i><span>' + def.label + '<small>' + item.note + '</small></span><strong>' + item.count + ' · ' + crmForecastMoney(item.value) + '</strong></div>'; }).join('');
    const categorised = metrics.openValue ? (metrics.commitValue + metrics.bestOnlyValue + metrics.omitted.reduce((sum,item)=>sum+item.value,0)) / metrics.openValue * 100 : 0;
    document.getElementById('crmV2Coverage').textContent = Math.round(categorised) + '%';
    document.getElementById('crmV2CoverageBar').style.width = Math.min(100,categorised).toFixed(1) + '%';
  };

  crmV2TableDeals = function(rows) {
    let result = rows.slice();
    if (crmV2Drill.kpi === 'commit') result = result.filter(item => item.category === 'commit');
    if (crmV2Drill.kpi === 'best') result = result.filter(item => item.category === 'commit' || item.category === 'best');
    if (crmV2Drill.kpi === 'won') result = result.filter(item => item.category === 'won');
    if (crmV2Drill.health === 'noquote') result = result.filter(item => !item.won && item.quoteCount === 0);
    if (crmV2Drill.health === 'unscheduled') result = result.filter(item => !item.won && !item.close);
    if (crmV2Drill.health === 'overdue') result = result.filter(item => !item.won && item.overdue);
    if (crmV2Drill.health === 'expiring') result = result.filter(item => !item.won && item.expiring);
    if (crmV2Drill.month != null) result = result.filter(item => crmV2CloseDate(item) && crmV2CloseDate(item).getMonth() === crmV2Drill.month);
    if (crmV2Drill.stage) result = result.filter(item => item.category === crmV2Drill.stage);
    return result.sort((a,b) => {
      const ad = crmV2CloseDate(a), bd = crmV2CloseDate(b);
      if (!ad && !bd) return a.deal.t.localeCompare(b.deal.t);
      if (!ad) return 1; if (!bd) return -1; return ad - bd;
    });
  };

  renderCrmV2Table = function(rows) {
    const body = document.getElementById('crmV2TableBody');
    const empty = document.getElementById('crmV2Empty');
    const table = document.querySelector('.crm-v2-table');
    const result = crmV2TableDeals(rows);
    const restricted = document.getElementById('crmV2Role').value === 'sales';
    const wonOnly = result.length > 0 && result.every(item => item.category === 'won');
    table.classList.toggle('won-only', wonOnly);
    table.classList.toggle('restricted', restricted);
    body.innerHTML = result.map(item => {
      const date = crmV2CloseDate(item);
      const category = CRM_COMMIT_CATEGORY[item.category];
      const dealIndex = CRM_DEALS.indexOf(item.deal);
      const forecastValue = item.category === 'omitted' ? 0 : item.value;
      const quoteCell = item.orLabel ? '<span class="crm-v2-or" title="Deal contains ' + item.quoteCount + ' alternative Quotes — forecasting on: ' + archiveEscape(item.forecastQuote) + '">' + item.orLabel + '</span><small>' + archiveEscape(item.forecastQuote) + '</small>' : (item.quoteCount ? item.quoteCount + ' linked' : '<span class="crm-v2-noquote">No Quote</span>');
      return '<tr><td><button type="button" class="crm-v2-deal-link" data-v2-deal="' + dealIndex + '">' + archiveEscape(item.deal.t) + '</button>' + (item.coNote ? '<small class="crm-v2-co-note">' + archiveEscape(item.coNote) + '</small>' : '') + '</td><td>' + archiveEscape(item.deal.c || 'No customer') + '</td><td class="crm-v2-date">' + (date ? date.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '<span class="crm-v2-unscheduled"><i class="fai">&#xf071;</i> Unscheduled</span><button type="button" class="crm-v2-add-date" data-v2-add-date="' + dealIndex + '">Add close date</button>') + '</td><td><span class="crm-v2-stage"><i style="background:' + item.color + '"></i>' + item.stage + '</span></td><td>' + archiveEscape(crmTableOwnerName(item.deal)) + '</td><td><span class="crm-v2-category ' + item.category + '">' + category.label + '</span></td><td class="crm-v2-money">' + crmForecastMoney(item.value) + '</td><td class="crm-v2-money weighted crm-v2-forecast-column">' + crmForecastMoney(forecastValue) + '</td><td class="crm-v2-money margin crm-v2-margin-column">' + crmForecastMoney(item.margin) + '</td><td class="crm-v2-quote-cell">' + quoteCell + '</td></tr>';
    }).join('');
    document.getElementById('crmV2TableMeta').textContent = result.length + ' ' + (result.length === 1 ? 'Deal' : 'Deals') + ' · ' + crmForecastMoney(result.reduce((sum,item)=>sum + (item.category === 'omitted' ? 0 : item.value),0)) + ' forecast value';
    const labels = [];
    if (crmV2Drill.kpi) labels.push({commit:'Commit Deals',best:'Commit + Best case',won:'Won this year',gap:'Gap contributors'}[crmV2Drill.kpi]);
    if (crmV2Drill.health) labels.push({noquote:'Deals without Quotes',unscheduled:'Unscheduled Deals',overdue:'Overdue follow-ups',expiring:'Quotes expiring soon'}[crmV2Drill.health]);
    if (crmV2Drill.month != null) labels.push(CRM_V2_MONTHS[crmV2Drill.month]);
    if (crmV2Drill.stage) labels.push(CRM_COMMIT_CATEGORY[crmV2Drill.stage].label);
    const active = document.getElementById('crmV2ActiveFilter'); active.textContent = labels.length ? labels.join(' · ') + ' ×' : ''; active.hidden = labels.length === 0;
    table.hidden = result.length === 0; empty.hidden = result.length !== 0;
  };

  renderCrmForecastV2 = function() {
    syncCrmV2Filters();
    const summary = document.getElementById('crmSummary');
    if (summary) {
      summary.innerHTML = '<span class="crm-summary-count"><b>12</b> Deals</span>' +
        '<span>Total Value: <b>£516,908</b></span>' +
        '<span class="crm-summary-margin">Estimated Margin: <b>£103,382</b></span>';
    }
    const rows = crmV2FilteredDeals();
    const restricted = document.getElementById('crmV2Role').value === 'sales';
    const view = document.getElementById('crmForecastV2View');
    view.classList.toggle('restricted', restricted);
    document.getElementById('viewCrm').classList.toggle('crm-v2-restricted', restricted);
    if (restricted && crmV2Metric === 'margin') crmV2Metric = 'value';
    document.querySelectorAll('[data-v2-metric]').forEach(button => button.classList.toggle('active', button.dataset.v2Metric === crmV2Metric));
    const metrics = renderCrmV2Kpis(rows);
    renderCrmV2Health(rows);
    renderCrmV2Chart(rows);
    renderCrmV2Probabilities(metrics);
    renderCrmV2Table(rows);
  };

  const forecastDashboardLayout = document.querySelector('.db2-dashboard');
  const forecastDashboardHost = document.getElementById('crmForecastV2View');
  if (forecastDashboardLayout && forecastDashboardHost) {
    forecastDashboardHost.classList.add('dashboard-layout');
    forecastDashboardHost.appendChild(forecastDashboardLayout);
    forecastDashboardLayout.hidden = false;
  }

  const db2AccessView = document.getElementById('db2AccessView');
  if (db2AccessView) {
    db2AccessView.addEventListener('change', () => {
      const dashboard = document.querySelector('.db2-dashboard');
      if (dashboard) dashboard.classList.toggle('restricted', db2AccessView.value === 'sales');
    });
  }

  const DB2_PAYMENT_VIEWS = {
    all: {
      label: 'all invoices · showing 5 of 42',
      rows: [
        ['INV-2068', 'Rosedale House / Study AV', '25 Aug 2026', '£7,800', 'Draft'],
        ['INV-2064', 'Ellison House / Multi-room Audio', '22 Aug 2026', '£6,780', 'Unpaid'],
        ['INV-2060', 'Carter Family / Cinema Upgrade', '18 Aug 2026', '£8,250', 'Unpaid'],
        ['INV-2058', 'Northstar Developments / Show Flat', '10 Aug 2026', '£21,600', 'Paid'],
        ['INV-2057', 'Riverside Café / Outdoor Audio', '8 Aug 2026', '£5,600', 'Void']
      ]
    },
    draft: {
      label: 'draft · 5 invoices',
      rows: [
        ['INV-2068', 'Rosedale House / Study AV', '25 Aug 2026', '£7,800', 'Draft'],
        ['INV-2070', 'Atkins Residence / Cinema Control', '29 Aug 2026', '£6,400', 'Draft'],
        ['INV-2072', 'Brighton Hotel / Lobby Displays', '2 Sep 2026', '£7,200', 'Draft'],
        ['INV-2075', 'Oakfield School / Hall Audio', '5 Sep 2026', '£5,200', 'Draft'],
        ['INV-2077', 'Morgan Family / Wi-Fi Upgrade', '8 Sep 2026', '£5,800', 'Draft']
      ]
    },
    unpaid: {
      label: 'unpaid · showing 5 of 11',
      rows: [
        ['INV-2048', 'Mayfair Residence / Private Cinema Room', '28 Jul 2026', '£16,800', 'Overdue'],
        ['INV-2053', 'Harbour & Co. / Meeting Room AV', '2 Aug 2026', '£12,400', 'Overdue'],
        ['INV-2056', 'Kingsbridge School / Lutron Lighting', '5 Aug 2026', '£9,400', 'Overdue'],
        ['INV-2060', 'Carter Family / Cinema Upgrade', '18 Aug 2026', '£8,250', 'Unpaid'],
        ['INV-2064', 'Ellison House / Multi-room Audio', '22 Aug 2026', '£6,780', 'Unpaid']
      ]
    },
    paid: {
      label: 'paid · showing 5 of 24',
      rows: [
        ['INV-2058', 'Northstar Developments / Show Flat', '10 Aug 2026', '£21,600', 'Paid'],
        ['INV-2051', 'DPP9 Owner LLC / Theater Upgrade', '30 Jul 2026', '£50,688', 'Paid'],
        ['INV-2046', 'Jim Korzelius / Meeting Room AV', '22 Jul 2026', '£18,987', 'Paid'],
        ['INV-2041', 'Steve Coon / Private Cinema Room', '15 Jul 2026', '£42,000', 'Paid'],
        ['INV-2037', 'Gabriel Rivera / Office AV Refresh', '8 Jul 2026', '£12,400', 'Paid']
      ]
    },
    void: {
      label: 'void · 2 invoices',
      rows: [
        ['INV-2057', 'Riverside Café / Outdoor Audio', '8 Aug 2026', '£5,600', 'Void'],
        ['INV-2019', 'Westbrook Office / Boardroom AV', '12 Jun 2026', '£5,600', 'Void']
      ]
    },
    overdue: {
      label: 'overdue · 3 invoices',
      rows: [
        ['INV-2048', 'Mayfair Residence / Private Cinema Room', '28 Jul 2026', '£16,800', 'Overdue'],
        ['INV-2053', 'Harbour & Co. / Meeting Room AV', '2 Aug 2026', '£12,400', 'Overdue'],
        ['INV-2056', 'Kingsbridge School / Lutron Lighting', '5 Aug 2026', '£9,400', 'Overdue']
      ]
    }
  };

  function renderDb2Payment(key) {
    const view = DB2_PAYMENT_VIEWS[key] || DB2_PAYMENT_VIEWS.overdue;
    const body = document.getElementById('db2PaymentBody');
    const subtitle = document.getElementById('db2PaymentSubtitle');
    if (!body || !subtitle) return;
    subtitle.textContent = 'Project invoices · FY 2026 · ' + view.label;
    body.innerHTML = view.rows.map(row => {
      const statusClass = row[4].toLowerCase();
      return '<tr class="' + statusClass + '"><td>' + archiveEscape(row[0]) + '</td><td>' + archiveEscape(row[1]) + '<small class="db2-invoice-status ' + statusClass + '">' + archiveEscape(row[4]) + '</small></td><td>' + archiveEscape(row[2]) + '</td><td>' + archiveEscape(row[3]) + '</td></tr>';
    }).join('');
    document.querySelectorAll('[data-payment-filter]').forEach(button => {
      const active = button.dataset.paymentFilter === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    const nextDue = document.querySelector('.db2-payment-next');
    if (nextDue) nextDue.hidden = !['all','unpaid'].includes(key);
  }

  document.querySelectorAll('[data-payment-filter]').forEach(button => button.addEventListener('click', () => renderDb2Payment(button.dataset.paymentFilter)));
  renderDb2Payment('overdue');

  const DB2_OPS_DATA = {
    sales: {
      headings: ['Salesperson', 'Quotes', 'Accepted Total'],
      footer: 'View all salespeople',
      rows: [
        ['JM', 'Jeff Mitchel', 'Sales Director', '18', '£186,750'],
        ['LD', 'Les Landau', 'Account Manager', '12', '£122,400'],
        ['ST', 'Sophie Turner', 'Account Manager', '9', '£78,900'],
        ['TR', 'Tom Richards', 'Account Manager', '7', '£54,300']
      ]
    },
    systems: {
      headings: ['System', 'Quotes', 'Accepted Total'],
      footer: 'View all systems',
      rows: [
        ['HC', 'Home Cinema', 'Private cinema & media rooms', '18', '£186,750'],
        ['LI', 'Lighting', 'Lutron & architectural lighting', '12', '£122,400'],
        ['NW', 'Networking', 'Wi-Fi, switching & infrastructure', '9', '£78,900'],
        ['CS', 'CCTV & Security', 'Cameras, access & monitoring', '7', '£54,300']
      ]
    },
    working: {
      headings: ['Team member', 'Working on', 'Status'],
      footer: 'Open live team',
      rows: [
        ['TR', 'Tom Richards', 'AV Engineer', 'Mayfair Residence', 'Rack installation · since 08:15', 'On site', 'onsite'],
        ['RJ', 'Ryan Johnson', 'Service Technician', 'Harbour & Co.', 'DSP commissioning · since 08:42', 'On site', 'onsite'],
        ['JE', 'Julie Esparza', 'Project Manager', 'Kingsbridge School', 'Site coordination · since 09:05', 'Remote', 'remote'],
        ['CJ', 'Chris Johnson', 'Programmer', 'Workshop', 'Lutron programming · since 09:20', 'Workshop', 'workshop']
      ]
    }
  };

  function renderDb2Ops(key) {
    const data = DB2_OPS_DATA[key] || DB2_OPS_DATA.sales;
    const head = document.getElementById('db2OpsHead');
    const body = document.getElementById('db2OpsBody');
    const footer = document.getElementById('db2OpsFooter');
    if (!head || !body || !footer) return;
    head.innerHTML = data.headings.map(label => '<th>' + archiveEscape(label) + '</th>').join('');
    body.innerHTML = data.rows.map(row => {
      if (key === 'working') {
        return '<tr><td><b>' + archiveEscape(row[0]) + '</b><span>' + archiveEscape(row[1]) + '<small>' + archiveEscape(row[2]) + '</small></span></td><td><span>' + archiveEscape(row[3]) + '<small>' + archiveEscape(row[4]) + '</small></span></td><td><span class="db2-work-status ' + row[6] + '">' + archiveEscape(row[5]) + '</span></td></tr>';
      }
      return '<tr><td><b class="' + (key === 'systems' ? 'system' : '') + '">' + archiveEscape(row[0]) + '</b><span>' + archiveEscape(row[1]) + '<small>' + archiveEscape(row[2]) + '</small></span></td><td>' + archiveEscape(row[3]) + '</td><td class="db2-accepted-value">' + archiveEscape(row[4]) + '</td></tr>';
    }).join('');
    footer.innerHTML = archiveEscape(data.footer) + ' <i class="fai">&#xf061;</i>';
    document.querySelectorAll('[data-db2-ops]').forEach(button => {
      const active = button.dataset.db2Ops === key;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-db2-ops]').forEach(button => button.addEventListener('click', () => renderDb2Ops(button.dataset.db2Ops)));
  renderDb2Ops('sales');

  const db2CompareButton = document.getElementById('db2CompareButton');
  const db2ComparisonBanner = document.getElementById('db2ComparisonBanner');
  const db2Dashboard = document.querySelector('.db2-dashboard');
  const db2ComparisonValues = [
    ['.db2-funnel-step:nth-of-type(1) strong', 'vs 132 · +12.1%'],
    ['.db2-funnel-step:nth-of-type(2) strong', 'vs 74 · +10.8%'],
    ['.db2-funnel-step:nth-of-type(3) strong', 'vs 54 · +13.0%'],
    ['.db2-funnel-step:nth-of-type(4) strong', 'vs 4 · +25.0%'],
    ['.db2-pipeline-kpis > div:nth-child(1) strong', 'FY 2025: £198,400 · +11.7%'],
    ['.db2-pipeline-kpis > div:nth-child(2) strong', 'FY 2025: £136,000 · +11.8%'],
    ['.db2-pipeline-kpis > div:nth-child(3) strong', 'FY 2025: £264,800 · +11.5%'],
    ['.db2-pipeline-kpis > div:nth-child(4) strong', 'FY 2025 target: £450,000'],
    ['.db2-pipeline-kpis > div:nth-child(5) strong', 'FY 2025: −£185,200']
  ];
  if (db2Dashboard) {
    db2ComparisonValues.forEach(([selector, label]) => {
      const target = db2Dashboard.querySelector(selector);
      if (!target) return;
      const delta = document.createElement('em');
      delta.className = 'db2-compare-delta';
      delta.textContent = label;
      target.insertAdjacentElement('afterend', delta);
    });
  }
  if (db2CompareButton && db2Dashboard && db2ComparisonBanner) {
    db2CompareButton.addEventListener('click', () => {
      const active = !db2Dashboard.classList.contains('comparison-on');
      db2Dashboard.classList.toggle('comparison-on', active);
      db2ComparisonBanner.hidden = !active;
      db2CompareButton.setAttribute('aria-pressed', active ? 'true' : 'false');
      db2CompareButton.textContent = active ? '× Remove comparison' : '+ Add comparison';
    });
  }

  function archiveDateLabel(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '—';
    const day = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const time = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    return day + '<small>' + time + '</small>';
  }

  function archiveOutcome(deal) {
    const value = deal.archivedOutcome || ((CRM_STAGE_DEFS[deal.archivedFromStageIndex] || {}).outcome) || 'open';
    return ['won', 'lost'].includes(value) ? value : 'open';
  }

  function closeArchiveRowMenus(exceptButton) {
    document.querySelectorAll('.crm-archive-more[aria-expanded="true"]').forEach(button => {
      if (button === exceptButton) return;
      button.setAttribute('aria-expanded', 'false');
      const menu = button.parentElement && button.parentElement.querySelector('.crm-archive-row-menu');
      if (menu) menu.classList.remove('open');
    });
  }

  function syncArchiveBulkToolbar() {
    const toolbar = document.getElementById('crmArchiveBulkToolbar');
    const countEl = document.getElementById('crmArchiveBulkCount');
    if (!toolbar || !countEl) return;
    const count = crmSubview === 'archive' ? archiveSelected.size : 0;
    countEl.textContent = count;
    toolbar.classList.toggle('open', count > 0);
    toolbar.setAttribute('aria-hidden', count > 0 ? 'false' : 'true');
  }

  function clearArchiveSelection() {
    archiveSelected.clear();
    renderArchiveView();
  }

  function bulkArchiveAction(action) {
    const deals = [...archiveSelected].filter(deal => CRM_DEALS.includes(deal) && deal.archived);
    if (!deals.length) return;
    const count = deals.length;
    if (action === 'delete') {
      if (!window.confirm('Delete ' + count + ' selected archived ' + (count === 1 ? 'Deal' : 'Deals') + ' permanently? This cannot be undone.')) return;
      deals.forEach(deal => {
        const index = CRM_DEALS.indexOf(deal);
        if (index >= 0) CRM_DEALS.splice(index, 1);
        delete DEAL_QUOTES[deal.t];
      });
      archiveSelected.clear();
      saveActivePipelineState();
      renderArchiveView();
      qtShowSnackbar(count + (count === 1 ? ' archived Deal deleted.' : ' archived Deals deleted.'), 'success');
      return;
    }
    if (action === 'restore') {
      deals.forEach(deal => {
        deal.archived = false;
        delete deal.archiveCause;
        deal.s = Number.isInteger(deal.archivedFromStageIndex) && CRM_STAGE_DEFS[deal.archivedFromStageIndex]
          ? deal.archivedFromStageIndex
          : 0;
      });
      archiveSelected.clear();
      rebuildPipelineColumns();
      saveActivePipelineState();
      renderArchiveView();
      qtShowSnackbar(count + (count === 1 ? ' Deal reopened in its previous stage.' : ' Deals reopened in their previous stages.'), 'success');
    }
  }

  function updateArchiveSelection(rows) {
    [...archiveSelected].forEach(deal => {
      if (!CRM_DEALS.includes(deal) || !deal.archived) archiveSelected.delete(deal);
    });
    const visibleDeals = rows.map(({ deal }) => deal);
    const visibleSelected = visibleDeals.filter(deal => archiveSelected.has(deal));
    const selectAll = document.getElementById('crmArchiveSelectAll');
    if (selectAll) {
      selectAll.checked = visibleDeals.length > 0 && visibleSelected.length === visibleDeals.length;
      selectAll.indeterminate = visibleSelected.length > 0 && visibleSelected.length < visibleDeals.length;
      selectAll.disabled = visibleDeals.length === 0;
      selectAll.setAttribute('aria-label', selectAll.checked
        ? 'Deselect all archived Deals'
        : 'Select all archived Deals');
    }
    syncArchiveBulkToolbar();
  }

  function renderArchiveView() {
    const body = document.getElementById('crmArchiveBody');
    const empty = document.getElementById('crmArchiveEmpty');
    const count = document.getElementById('crmArchiveCount');
    const search = document.getElementById('crmArchiveSearch');
    const sort = document.getElementById('crmArchiveSort');
    if (!body || !empty || !count) return;

    const query = (search ? search.value : '').trim().toLowerCase();
    const sortMode = sort ? sort.value : 'recent';
    const rows = CRM_DEALS.map((deal, dealIndex) => ({ deal, dealIndex }))
      .filter(item => item.deal.archived)
      .filter(item => owningCompanyMatches(item.deal))
      .filter(item => {
        if (!query) return true;
        const deal = item.deal;
        const owner = CRM_OWNER_NAMES[deal.o] || deal.o || '';
        return [deal.t, deal.c, owner, deal.archivedFromStage, deal.archivedBy]
          .some(value => String(value || '').toLowerCase().includes(query));
      });

    const timestamp = item => new Date(item.deal.archivedAt || 0).getTime() || 0;
    const comparators = {
      oldest: (a, b) => timestamp(a) - timestamp(b),
      value: (a, b) => (b.deal.v || 0) - (a.deal.v || 0),
      margin: (a, b) => (b.deal.margin || 0) - (a.deal.margin || 0),
      title: (a, b) => String(a.deal.t || '').localeCompare(String(b.deal.t || '')),
      recent: (a, b) => timestamp(b) - timestamp(a)
    };
    rows.sort(comparators[sortMode] || comparators.recent);

    const archivedTotal = CRM_DEALS.filter(deal => deal.archived).length;
    count.textContent = query ? rows.length + ' of ' + archivedTotal + ' deals' : archivedTotal + (archivedTotal === 1 ? ' deal' : ' deals');
    body.innerHTML = rows.map(({ deal, dealIndex }) => {
      const outcome = archiveOutcome(deal);
      const outcomeLabel = { open: 'Open', won: 'Won', lost: 'Lost' }[outcome] || 'Open';
      const previousStage = deal.archivedFromStage || ((CRM_STAGE_DEFS[deal.archivedFromStageIndex] || {}).name) || '—';
      const owner = CRM_OWNER_NAMES[deal.o] || deal.o || '—';
      const selected = archiveSelected.has(deal);
      return '<tr data-deal-index="' + dealIndex + '" role="link" tabindex="0" aria-label="Open archived Deal ' + archiveEscape(deal.t) + '"' + (selected ? ' class="selected"' : '') + '>' +
        '<td class="crm-archive-check-cell"><label class="crm-archive-check-wrap"><input class="crm-archive-check" type="checkbox" data-archive-select="' + dealIndex + '" aria-label="Select ' + archiveEscape(deal.t) + '"' + (selected ? ' checked' : '') + '><span aria-hidden="true"></span></label></td>' +
        '<td class="crm-archive-time">' + archiveDateLabel(deal.archivedAt) + '</td>' +
        '<td><button type="button" class="crm-archive-title-button" data-archive-action="view">' + archiveEscape(deal.t) + '</button><small>' + archiveEscape(deal.c || 'No customer') + '</small></td>' +
        '<td><span class="crm-archive-status ' + outcome + '" title="Archived outcome · restore the Deal to change its Stage"><i class="crm-archive-status-square"></i><span>' + outcomeLabel + '</span></span></td>' +
        '<td>' + archiveEscape(previousStage) + '</td>' +
        '<td class="crm-archive-money">' + fmt(deal.v || 0) + '</td>' +
        '<td class="crm-archive-money margin">' + fmt(deal.margin || 0) + '</td>' +
        '<td>' + archiveEscape(owner) + '</td>' +
        '<td>' + archiveEscape(deal.archivedBy || '—') + '</td>' +
        '<td><div class="crm-archive-row-actions"><button type="button" class="crm-archive-more" aria-label="Archived Deal actions" aria-haspopup="menu" aria-expanded="false"><i class="fai">&#xf141;</i></button>' +
          '<div class="crm-archive-row-menu" role="menu"><button type="button" role="menuitem" data-archive-action="view"><i class="fai">&#xf06e;</i>View Deal</button><button type="button" role="menuitem" data-archive-action="restore"><i class="fai">&#xf2ea;</i>Restore Deal</button><hr><button type="button" role="menuitem" class="danger" data-archive-action="delete"><i class="fai">&#xf2ed;</i>Delete permanently</button></div></div></td>' +
      '</tr>';
    }).join('');
    empty.hidden = rows.length !== 0;
    updateArchiveSelection(rows);
  }

  function setCrmSubview(view) {
    if (view === 'unavailable') {
      qtShowSnackbar('This view is not available in the prototype yet.');
      return;
    }
    crmSubview = ['pipeline', 'table', 'forecast', 'crmforecast', 'archive'].includes(view) ? view : 'pipeline';
    if (crmSubview !== 'archive') archiveSelected.clear();
    syncArchiveBulkToolbar();
    const root = document.getElementById('viewCrm');
    const table = document.getElementById('crmTableView');
    const forecast = document.getElementById('crmForecastView');
    const crmForecastV2 = document.getElementById('crmForecastV2View');
    const archive = document.getElementById('crmArchiveView');
    const lifecycleLinkbar = document.getElementById('crmQuoteLifecycleLinkbar');
    if (root) root.classList.toggle('archive-active', crmSubview === 'archive');
    if (root) root.classList.toggle('table-active', crmSubview === 'table');
    if (root) root.classList.toggle('forecast-active', crmSubview === 'forecast');
    if (root) root.classList.toggle('crmforecast-active', crmSubview === 'crmforecast');
    if (table) table.hidden = crmSubview !== 'table';
    if (forecast) forecast.hidden = crmSubview !== 'forecast';
    if (crmForecastV2) crmForecastV2.hidden = crmSubview !== 'crmforecast';
    if (archive) archive.hidden = crmSubview !== 'archive';
    if (lifecycleLinkbar) lifecycleLinkbar.hidden = crmSubview !== 'pipeline' || !pipelineUsesQuoteLifecycle(getActivePipeline());
    document.querySelectorAll('[data-crm-view]').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.crmView === crmSubview);
      tab.setAttribute('aria-current', tab.dataset.crmView === crmSubview ? 'page' : 'false');
    });
    closeArchiveRowMenus();
    closeDealContextMenu();
    if (crmSubview !== 'crmforecast' && crmSubview !== 'archive') recalcPipeline();
    if (crmSubview === 'table') renderCrmTable();
    else if (crmSubview === 'forecast') renderCrmForecast();
    else if (crmSubview === 'crmforecast') renderCrmForecastV2();
    else if (crmSubview === 'archive') renderArchiveView();
    else setTimeout(updatePipelineMinimap, 0);
    syncPipelineLifecycleUi();
  }

  document.querySelectorAll('[data-crm-view]').forEach(tab => {
    const activate = () => setCrmSubview(tab.dataset.crmView);
    tab.addEventListener('click', activate);
    tab.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });

  document.getElementById('crmArchiveSearch').addEventListener('input', renderArchiveView);
  document.getElementById('crmArchiveSort').addEventListener('change', renderArchiveView);
  document.getElementById('crmForecastOwnerFilter').addEventListener('change', renderCrmForecast);
  ['crmV2Year', 'crmV2Pipeline', 'crmV2Owner', 'crmV2Stage', 'crmV2Category', 'crmV2Role'].forEach(id => {
    document.getElementById(id).addEventListener('change', () => {
      crmV2Drill = { kpi: null, health: null, month: null, stage: null };
      renderCrmForecastV2();
    });
  });
  document.querySelectorAll('[data-v2-metric]').forEach(button => {
    button.addEventListener('click', () => {
      crmV2Metric = button.dataset.v2Metric;
      document.querySelectorAll('[data-v2-metric]').forEach(item => item.classList.toggle('active', item === button));
      renderCrmV2Chart(crmV2FilteredDeals());
    });
  });
  document.querySelectorAll('[data-v2-kpi]').forEach(button => {
    button.addEventListener('click', () => {
      crmV2Drill = { kpi: crmV2Drill.kpi === button.dataset.v2Kpi ? null : button.dataset.v2Kpi, health: null, month: null, stage: null };
      renderCrmV2Kpis(crmV2FilteredDeals());
      renderCrmV2Health(crmV2FilteredDeals());
      renderCrmV2Table(crmV2FilteredDeals());
    });
  });
  document.querySelectorAll('[data-v2-health]').forEach(button => {
    button.addEventListener('click', () => {
      crmV2Drill = { kpi: null, health: crmV2Drill.health === button.dataset.v2Health ? null : button.dataset.v2Health, month: null, stage: null };
      renderCrmV2Kpis(crmV2FilteredDeals());
      renderCrmV2Health(crmV2FilteredDeals());
      renderCrmV2Table(crmV2FilteredDeals());
    });
  });
  document.getElementById('crmV2Reset').addEventListener('click', () => {
    document.getElementById('crmV2Pipeline').value = activePipelineId;
    document.getElementById('crmV2Owner').value = 'all';
    document.getElementById('crmV2Stage').value = 'all';
    document.getElementById('crmV2Category').value = 'all';
    document.getElementById('crmV2Role').value = 'owner';
    crmV2Metric = 'value';
    crmV2Drill = { kpi: null, health: null, month: null, stage: null };
    document.querySelectorAll('[data-v2-metric]').forEach(button => button.classList.toggle('active', button.dataset.v2Metric === 'value'));
    renderCrmForecastV2();
  });
  document.getElementById('crmV2ActiveFilter').addEventListener('click', () => {
    crmV2Drill = { kpi: null, health: null, month: null, stage: null };
    renderCrmV2Kpis(crmV2FilteredDeals());
    renderCrmV2Health(crmV2FilteredDeals());
    renderCrmV2Table(crmV2FilteredDeals());
  });
  document.getElementById('crmV2TableBody').addEventListener('click', event => {
    const dealButton = event.target.closest('[data-v2-deal]');
    if (dealButton) {
      const deal = CRM_DEALS[Number(dealButton.dataset.v2Deal)];
      if (deal) openCrmTableDeal(deal);
      return;
    }
    const dateButton = event.target.closest('[data-v2-add-date]');
    if (dateButton) qtShowSnackbar('Open the Deal to add an expected close date.');
  });
  document.getElementById('crmV2CreateDeal').addEventListener('click', () => openDealForm('new', null));
  document.getElementById('crmTableSearch').addEventListener('input', renderCrmTable);
  document.getElementById('crmTableStageFilter').addEventListener('change', renderCrmTable);
  document.getElementById('crmTableClearSelection').addEventListener('click', () => {
    crmTableSelected.clear();
    renderCrmTable();
  });
  document.getElementById('crmTableSelectAll').addEventListener('change', event => {
    crmTableFilteredRows().forEach(({ deal }) => {
      if (event.target.checked) crmTableSelected.add(deal);
      else crmTableSelected.delete(deal);
    });
    renderCrmTable();
  });
  document.querySelectorAll('[data-table-sort]').forEach(button => {
    button.addEventListener('click', () => setCrmTableSort(button.dataset.tableSort));
  });
  initCrmTableColumnResizing();
  document.getElementById('crmTableBody').addEventListener('change', event => {
    const stageSelect = event.target.closest('[data-table-stage]');
    if (stageSelect) {
      changeCrmTableDealStage(stageSelect);
      return;
    }
    const checkbox = event.target.closest('[data-table-select]');
    if (!checkbox) return;
    const deal = CRM_DEALS[Number(checkbox.dataset.tableSelect)];
    if (!deal) return;
    if (checkbox.checked) crmTableSelected.add(deal);
    else crmTableSelected.delete(deal);
    renderCrmTable();
  });
  document.getElementById('crmTableBody').addEventListener('click', event => {
    if (event.target.closest('[data-table-select], .crm-table-stage-control')) return;
    const row = event.target.closest('tr[data-deal-index]');
    const deal = row ? CRM_DEALS[Number(row.dataset.dealIndex)] : null;
    if (!deal) return;
    const menuButton = event.target.closest('[data-table-action="menu"]');
    if (menuButton) {
      event.stopPropagation();
      const card = findPipelineCardForDeal(deal);
      if (card) openDealContextMenu(event, card);
      return;
    }
    openCrmTableDeal(deal);
  });
  document.getElementById('crmTableBody').addEventListener('contextmenu', event => {
    if (event.target.closest('.crm-table-stage-control')) return;
    const row = event.target.closest('tr[data-deal-index]');
    const deal = row ? CRM_DEALS[Number(row.dataset.dealIndex)] : null;
    const card = deal ? findPipelineCardForDeal(deal) : null;
    if (!card) return;
    event.preventDefault();
    openDealContextMenu(event, card);
  });
  document.querySelector('.crm-archive-table').addEventListener('change', event => {
    const checkbox = event.target.closest('.crm-archive-check');
    if (!checkbox) return;
    if (checkbox.id === 'crmArchiveSelectAll') {
      document.querySelectorAll('#crmArchiveBody [data-archive-select]').forEach(rowCheckbox => {
        const deal = CRM_DEALS[Number(rowCheckbox.dataset.archiveSelect)];
        if (!deal) return;
        if (checkbox.checked) archiveSelected.add(deal);
        else archiveSelected.delete(deal);
      });
    } else {
      const deal = CRM_DEALS[Number(checkbox.dataset.archiveSelect)];
      if (!deal) return;
      if (checkbox.checked) archiveSelected.add(deal);
      else archiveSelected.delete(deal);
    }
    renderArchiveView();
  });
  document.getElementById('crmArchiveBody').addEventListener('click', event => {
    if (event.target.closest('.crm-archive-check-wrap')) return;
    const more = event.target.closest('.crm-archive-more');
    if (more) {
      const menu = more.parentElement.querySelector('.crm-archive-row-menu');
      const willOpen = !menu.classList.contains('open');
      closeArchiveRowMenus(more);
      menu.classList.toggle('open', willOpen);
      more.setAttribute('aria-expanded', String(willOpen));
      return;
    }
    const actionButton = event.target.closest('[data-archive-action]');
    const row = event.target.closest('tr[data-deal-index]');
    const deal = row ? CRM_DEALS[Number(row.dataset.dealIndex)] : null;
    if (!deal) return;
    if (!actionButton) {
      closeArchiveRowMenus();
      openDealPage(deal, null);
      return;
    }
    closeArchiveRowMenus();
    const action = actionButton.dataset.archiveAction;
    if (action === 'view') {
      openDealPage(deal, null);
      return;
    }
    runDealAction(action, null, deal);
  });

  document.getElementById('crmArchiveBody').addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.target !== event.target.closest('tr[data-deal-index]')) return;
    const row = event.target;
    const deal = CRM_DEALS[Number(row.dataset.dealIndex)];
    if (!deal) return;
    event.preventDefault();
    closeArchiveRowMenus();
    openDealPage(deal, null);
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.crm-archive-row-actions')) closeArchiveRowMenus();
  });

  function closePipelineSelector() {
    document.getElementById('pipelineSelectorMenu').classList.remove('open');
    document.getElementById('pipelineSelectorButton').setAttribute('aria-expanded', 'false');
  }

  function renderPipelineSelectorOptions(query = '') {
    const list = document.getElementById('pipelineSelectorOptions');
    const normalized = query.trim().toLowerCase();
    const matches = CRM_PIPELINES.filter(pipeline => pipeline.name.toLowerCase().includes(normalized));
    list.innerHTML = '';
    if (!matches.length) {
      list.innerHTML = '<div class="pipeline-selector-empty">No pipelines found</div>';
      return;
    }
    matches.forEach(pipeline => {
      const selected = pipeline.id === activePipelineId;
      const option = document.createElement('div');
      option.className = 'pipeline-selector-option' + (selected ? ' selected' : '');
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
      option.innerHTML = '<button type="button" class="pipeline-option-main" data-pipeline-id="' + pipeline.id + '">' +
        '<span class="pipeline-option-copy"><span class="pipeline-option-name">' + stageTextHtml(pipeline.name) + '</span>' +
        '<small class="pipeline-option-type ' + (pipelineUsesQuoteLifecycle(pipeline) ? 'connected' : 'standalone') + '">' +
          (pipelineUsesQuoteLifecycle(pipeline) ? 'Connected to Quotations' : 'Standalone') + '</small></span>' +
        '<i class="fai pipeline-option-check" aria-hidden="true">&#xf00c;</i></button>' +
        '<button type="button" class="pipeline-option-edit" data-pipeline-id="' + pipeline.id +
        '" aria-label="Edit ' + stageTextHtml(pipeline.name) + '" title="Edit pipeline"><i class="fai" aria-hidden="true">&#xf303;</i></button>';
      list.appendChild(option);
    });
  }

  function openPipelineSelector() {
    const menu = document.getElementById('pipelineSelectorMenu');
    const button = document.getElementById('pipelineSelectorButton');
    const search = document.getElementById('pipelineSelectorSearch');
    closePipelineFilterMenu();
    closePipelineSortMenu();
    search.value = '';
    renderPipelineSelectorOptions();
    menu.classList.add('open');
    button.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(() => search.focus());
  }

  function switchPipeline(pipelineId) {
    if (pipelineId === activePipelineId) { closePipelineSelector(); return; }
    if (pipelineManagementSnapshot) {
      qtShowSnackbar('Save or cancel the current stage changes before switching pipeline.');
      closePipelineSelector();
      return;
    }
    const nextPipeline = CRM_PIPELINES.find(pipeline => pipeline.id === pipelineId);
    if (!nextPipeline) return;
    closeStageMenu();
    closeStageEditor(false);
    saveActivePipelineState();
    activePipelineId = nextPipeline.id;
    loadPipelineState(nextPipeline);
    document.getElementById('pipelineSelectorLabel').textContent = nextPipeline.name;
    closePipelineSelector();
    rebuildPipelineColumns();
    pipelineEl.scrollLeft = 0;
    qtShowSnackbar('Switched to ' + nextPipeline.name + '.', 'success');
  }

  function renderPipelineTemplatePreview() {
    const quoteConnected = pipelineCreateType === 'quote-connected';
    const stages = quoteConnected ? CRM_SALES_STAGE_TEMPLATE : CRM_STANDALONE_STAGE_TEMPLATE;
    document.getElementById('pipelineTemplateSource').textContent = quoteConnected ? 'WeQuote protected lifecycle' : 'Standalone starter';
    document.getElementById('pipelineTemplateStages').innerHTML = stages.map(stage =>
      '<span class="pipeline-template-stage">' +
        (stage.icon ? '<i class="fai" style="color:' + stage.color + '">' + stage.icon + '</i>' : '') +
        '<span>' + stageTextHtml(stage.name) + '</span><small>' + (stage.protected ? '<i class="fai">&#xf023;</i> ' : '') + stageProbabilityLabel(stage.probability) + '</small>' +
      '</span>'
    ).join('');
    document.getElementById('pipelineCreateNoteText').textContent = quoteConnected
      ? 'Protected Quote milestones are included. Add Custom Stages between them; Deals will not be copied.'
      : 'No Quote → Deal Stage syncing. Operational Stages are editable; Deal outcomes remain protected.';
    document.querySelectorAll('#pipelineCreateTypes .pipeline-create-type').forEach(label => {
      label.classList.toggle('selected', label.querySelector('input').value === pipelineCreateType);
    });
  }

  function openPipelineCreateDialog(options = {}) {
    if (pipelineManagementSnapshot) {
      qtShowSnackbar('Save or cancel the current stage changes before creating a pipeline.');
      closePipelineSelector();
      return;
    }
    closePipelineSelector();
    saveActivePipelineState();
    pipelineCreateContext = options && options.source === 'deal' ? 'deal' : 'board';
    pipelineCreateSourceId = options && options.sourcePipelineId
      ? options.sourcePipelineId
      : activePipelineId;
    pipelineCreateType = 'quote-connected';
    const connectedRadio = document.getElementById('pipelineTypeQuoteConnected');
    if (connectedRadio) connectedRadio.checked = true;
    const input = document.getElementById('pipelineCreateName');
    input.value = '';
    input.setCustomValidity('');
    renderPipelineTemplatePreview();
    const overlay = document.getElementById('pipelineCreateOverlay');
    overlay.classList.toggle('from-deal-form', pipelineCreateContext === 'deal');
    overlay.classList.add('open');
    requestAnimationFrame(() => input.focus());
  }

  function closePipelineCreateDialog() {
    const overlay = document.getElementById('pipelineCreateOverlay');
    overlay.classList.remove('open', 'from-deal-form');
    document.getElementById('pipelineCreateName').setCustomValidity('');
    pipelineCreateContext = 'board';
    pipelineCreateSourceId = null;
  }

  function syncPipelineReferenceOptions() {
    const select = document.getElementById('df-pipeline');
    if (!select) return;
    const previousValue = select.value;
    select.innerHTML = CRM_PIPELINES.map(pipeline =>
      '<option value="' + pipeline.id + '">' + stageTextHtml(pipeline.name) + '</option>'
    ).join('');
    select.value = CRM_PIPELINES.some(pipeline => pipeline.id === previousValue) ? previousValue : activePipelineId;
    if (document.getElementById('df-pipeline-value') && select.selectedIndex >= 0) syncDfPipelineDropdown();
  }

  function openPipelineEditDialog(pipelineId) {
    if (pipelineManagementSnapshot) {
      qtShowSnackbar('Save or cancel the current stage changes before editing a pipeline.');
      closePipelineSelector();
      return;
    }
    const pipeline = CRM_PIPELINES.find(item => item.id === pipelineId);
    if (!pipeline) return;
    closePipelineSelector();
    saveActivePipelineState();
    editingPipelineId = pipeline.id;
    pendingPipelineDeleteId = null;
    const input = document.getElementById('pipelineEditName');
    input.value = pipeline.name;
    input.setCustomValidity('');
    const activeDeals = pipeline.deals.filter(deal => !deal.archived).length;
    const archivedDeals = pipeline.deals.filter(deal => deal.archived).length;
    document.getElementById('pipelineEditSummary').innerHTML = '<span>' + activeDeals + ' active ' +
      (activeDeals === 1 ? 'Deal' : 'Deals') + '</span><span class="dot"></span><span>' + archivedDeals + ' archived</span>';
    const quoteConnected = pipelineUsesQuoteLifecycle(pipeline);
    document.getElementById('pipelineEditConnection').innerHTML = quoteConnected
      ? '<i class="fai">&#xf023;</i><span><strong>Connected to Quotations</strong><small>Protected milestones stay fixed; Custom Stages and operational Automations remain editable.</small></span>'
      : '<i class="fai">&#xf0ae;</i><span><strong>Standalone Pipeline</strong><small>Quote status changes do not move Deals automatically.</small></span>';
    document.getElementById('pipelineEditConnection').classList.toggle('standalone', !quoteConnected);
    document.getElementById('pipelineEditRestore').hidden = !quoteConnected;
    const deleteButton = document.getElementById('pipelineDeleteTrigger');
    const availability = document.getElementById('pipelineDeleteAvailability');
    const isLastPipeline = CRM_PIPELINES.length === 1;
    const hasDeals = pipeline.deals.length > 0;
    deleteButton.disabled = isLastPipeline || hasDeals;
    if (isLastPipeline) availability.textContent = 'Keep at least one pipeline in CRM.';
    else if (hasDeals) availability.textContent = 'Move or remove every active and archived Deal before deleting.';
    else availability.textContent = 'This empty pipeline can be permanently deleted.';
    document.getElementById('pipelineEditOverlay').classList.add('open');
    requestAnimationFrame(() => input.focus());
  }

  function restorePipelineRecommendedStructure() {
    const pipeline = CRM_PIPELINES.find(item => item.id === editingPipelineId);
    if (!pipeline || !pipelineUsesQuoteLifecycle(pipeline)) return;
    const pipelineId = pipeline.id;
    closePipelineEditDialog();
    if (pipelineId !== activePipelineId) switchPipeline(pipelineId);
    if (!pipelineManagementSnapshot) enterPipelineManagement();
    const previousDefs = [...CRM_STAGE_DEFS];
    const recommended = CRM_SALES_STAGE_TEMPLATE.map(clonePipelineStage);
    CRM_DEALS.forEach(deal => {
      const previous = previousDefs[deal.s] || {};
      const segmentName = previous.protected
        ? (CRM_SALES_STAGE_ALIASES[String(previous.name || '').toLowerCase()] || previous.name)
        : (previous.lifecycleSegment || inferLifecycleSegment(previousDefs, deal.s));
      const nextIndex = recommended.findIndex(stage => stage.name === segmentName);
      deal.s = nextIndex >= 0 ? nextIndex : 0;
      if (deal.archived) {
        deal.archivedFromStageIndex = deal.s;
        deal.archivedFromStage = (recommended[deal.s] || {}).name || 'Qualified';
        deal.archivedOutcome = (recommended[deal.s] || {}).outcome || 'open';
      }
    });
    CRM_STAGE_DEFS.splice(0, CRM_STAGE_DEFS.length, ...recommended);
    CRM_STAGES.splice(0, CRM_STAGES.length, ...recommended.map(stage => stage.name));
    rebuildPipelineColumns();
    qtShowSnackbar('WeQuote recommended structure loaded into this Draft. Review Before / After before saving.', 'success');
  }
  window.restorePipelineRecommendedStructure = restorePipelineRecommendedStructure;

  function closePipelineEditDialog() {
    document.getElementById('pipelineEditOverlay').classList.remove('open');
    document.getElementById('pipelineEditName').setCustomValidity('');
    editingPipelineId = null;
  }

  function confirmPipelineEdit() {
    const pipeline = CRM_PIPELINES.find(item => item.id === editingPipelineId);
    if (!pipeline) { closePipelineEditDialog(); return; }
    const input = document.getElementById('pipelineEditName');
    const name = input.value.trim();
    if (!name) {
      input.setCustomValidity('Enter a pipeline name.');
      input.reportValidity();
      input.focus();
      return;
    }
    if (CRM_PIPELINES.some(item => item.id !== pipeline.id && item.name.toLowerCase() === name.toLowerCase())) {
      input.setCustomValidity('A pipeline with this name already exists.');
      input.reportValidity();
      input.focus();
      return;
    }
    input.setCustomValidity('');
    const previousName = pipeline.name;
    pipeline.name = name;
    if (pipeline.id === activePipelineId) document.getElementById('pipelineSelectorLabel').textContent = name;
    syncPipelineReferenceOptions();
    closePipelineEditDialog();
    renderPipelineSelectorOptions();
    qtShowSnackbar(previousName === name ? 'No pipeline changes to save.' : 'Pipeline renamed to ' + name + '.', 'success');
  }

  function requestPipelineDelete() {
    const pipeline = CRM_PIPELINES.find(item => item.id === editingPipelineId);
    if (!pipeline || CRM_PIPELINES.length === 1 || pipeline.deals.length) return;
    pendingPipelineDeleteId = pipeline.id;
    document.getElementById('pipelineDeleteTitle').textContent = 'Delete ' + pipeline.name + '?';
    document.getElementById('pipelineDeleteCopy').textContent = pipeline.name + ' is empty and will be removed from your Pipeline list.';
    document.getElementById('pipelineDeleteOverlay').classList.add('open');
  }

  function closePipelineDeleteDialog() {
    document.getElementById('pipelineDeleteOverlay').classList.remove('open');
    pendingPipelineDeleteId = null;
  }

  function confirmPipelineDelete() {
    const index = CRM_PIPELINES.findIndex(item => item.id === pendingPipelineDeleteId);
    const pipeline = index >= 0 ? CRM_PIPELINES[index] : null;
    if (!pipeline || CRM_PIPELINES.length === 1 || pipeline.deals.length) {
      closePipelineDeleteDialog();
      return;
    }
    const deletedName = pipeline.name;
    const deletingActivePipeline = pipeline.id === activePipelineId;
    CRM_PIPELINES.splice(index, 1);
    document.getElementById('pipelineDeleteOverlay').classList.remove('open');
    document.getElementById('pipelineEditOverlay').classList.remove('open');
    pendingPipelineDeleteId = null;
    editingPipelineId = null;
    if (deletingActivePipeline) {
      const fallback = CRM_PIPELINES[Math.min(index, CRM_PIPELINES.length - 1)];
      activePipelineId = fallback.id;
      loadPipelineState(fallback);
      document.getElementById('pipelineSelectorLabel').textContent = fallback.name;
      rebuildPipelineColumns();
      pipelineEl.scrollLeft = 0;
    }
    syncPipelineReferenceOptions();
    renderPipelineSelectorOptions();
    qtShowSnackbar(deletedName + ' deleted.', 'success');
  }

  function createPipelineId(name) {
    const stem = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pipeline';
    let id = stem;
    let suffix = 2;
    while (CRM_PIPELINES.some(pipeline => pipeline.id === id)) id = stem + '-' + suffix++;
    return id;
  }

  function confirmPipelineCreate() {
    const input = document.getElementById('pipelineCreateName');
    const name = input.value.trim();
    if (!name) {
      input.setCustomValidity('Enter a pipeline name.');
      input.reportValidity();
      input.focus();
      return;
    }
    if (CRM_PIPELINES.some(pipeline => pipeline.name.toLowerCase() === name.toLowerCase())) {
      input.setCustomValidity('A pipeline with this name already exists.');
      input.reportValidity();
      input.focus();
      return;
    }
    input.setCustomValidity('');
    const creationContext = pipelineCreateContext;
    const quoteConnected = pipelineCreateType === 'quote-connected';
    const pipelineId = createPipelineId(name);
    const stages = (quoteConnected ? CRM_SALES_STAGE_TEMPLATE : CRM_STANDALONE_STAGE_TEMPLATE).map((stage, index) => {
      const copy = clonePipelineStage(stage);
      if (!quoteConnected && !copy.protected && !copy.outcome) copy.customStageId = 'custom-' + pipelineId + '-' + index;
      return copy;
    });
    const pipeline = {
      id: pipelineId,
      name,
      stages,
      deals: [],
      type: quoteConnected ? 'quote-connected' : 'standalone',
      quoteConnected,
      lifecycleVersion: quoteConnected ? CRM_SALES_LIFECYCLE_VERSION : undefined
    };
    CRM_PIPELINES.push(pipeline);
    if (creationContext === 'deal') {
      syncPipelineReferenceOptions();
      const dealPipeline = document.getElementById('df-pipeline');
      dealPipeline.value = pipeline.id;
      syncDfPipelineDropdown();
      saveActivePipelineState();
      closePipelineCreateDialog();
      renderPipelineSelectorOptions();
      qtShowSnackbar(name + ' created and selected for this Deal.', 'success');
      return;
    }
    activePipelineId = pipeline.id;
    loadPipelineState(pipeline);
    document.getElementById('pipelineSelectorLabel').textContent = pipeline.name;
    syncPipelineReferenceOptions();
    closePipelineCreateDialog();
    renderPipelineSelectorOptions();
    rebuildPipelineColumns();
    pipelineEl.scrollLeft = 0;
    syncPipelineLifecycleUi();
    qtShowSnackbar(name + (quoteConnected ? ' created with the protected Quotation lifecycle.' : ' created as a Standalone Pipeline.'), 'success');
  }

  document.getElementById('pipelineSelectorButton').addEventListener('click', event => {
    event.stopPropagation();
    const isOpen = document.getElementById('pipelineSelectorMenu').classList.contains('open');
    if (isOpen) closePipelineSelector(); else openPipelineSelector();
  });
  document.getElementById('pipelineSelectorMenu').addEventListener('click', event => event.stopPropagation());
  document.getElementById('pipelineSelectorSearch').addEventListener('input', event => renderPipelineSelectorOptions(event.target.value));
  document.getElementById('pipelineSelectorOptions').addEventListener('click', event => {
    const editButton = event.target.closest('.pipeline-option-edit');
    if (editButton) { openPipelineEditDialog(editButton.dataset.pipelineId); return; }
    const option = event.target.closest('.pipeline-option-main');
    if (option) switchPipeline(option.dataset.pipelineId);
  });
  document.getElementById('pipelineCreateTrigger').addEventListener('click', openPipelineCreateDialog);
  document.getElementById('pipelineCreateTypes').addEventListener('change', event => {
    const input = event.target.closest('input[name="pipelineCreateType"]');
    if (!input) return;
    pipelineCreateType = input.value === 'standalone' ? 'standalone' : 'quote-connected';
    renderPipelineTemplatePreview();
  });
  document.getElementById('pipelineCreateName').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); confirmPipelineCreate(); }
    if (event.key === 'Escape') { event.preventDefault(); closePipelineCreateDialog(); }
  });
  document.getElementById('pipelineEditName').addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); confirmPipelineEdit(); }
    if (event.key === 'Escape') { event.preventDefault(); closePipelineEditDialog(); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('#pipelineSelector')) closePipelineSelector();
  });
  renderPipelineSelectorOptions();
  syncPipelineReferenceOptions();

  function updateStagePreview(stage, draft) {
    const icon = stage.querySelector('.stage-icon');
    const title = stage.querySelector('.stage-name');
    icon.textContent = draft.icon;
    icon.style.color = draft.color;
    icon.classList.toggle('is-empty', !draft.icon);
    title.textContent = draft.name || 'Untitled stage';
    const probability = stage.querySelector('.stage-manage-probability-value');
    if (probability) probability.textContent = (draft.probability == null ? 50 : draft.probability) + '%';
  }

  function wireStageTitleEditor(stage, def) {
    const wrap = stage.querySelector('.stage-title-wrap');
    wrap.addEventListener('click', e => {
      e.stopPropagation();
      if (def.protected) {
        qtShowSnackbar(def.name + ' has a protected stage structure. Its Automations can still be changed.');
        return;
      }
      if (pipelineManagementSnapshot) {
        const input = stage.querySelector('.stage-title-input');
        input.focus();
        input.select();
        return;
      }
      openStageEditor(stage, def);
    });
  }

  function updateStageEditorControls(stage, draft) {
    const structureLocked = Boolean(stage._def && stage._def.protected);
    stage.querySelectorAll('.stage-icon-option').forEach(btn => {
      const selected = btn.dataset.icon === draft.icon;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      btn.disabled = structureLocked;
    });
    stage.querySelectorAll('.stage-colour-option').forEach(btn => {
      const selected = btn.dataset.colour.toLowerCase() === draft.color.toLowerCase();
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      btn.disabled = structureLocked;
    });
    const customColour = stage.querySelector('.stage-colour-custom');
    customColour.value = draft.color;
    customColour.disabled = structureLocked;
    const probabilitySelect = stage.querySelector('.stage-probability-select');
    const lockedProbability = stage._def && stage._def.outcome;
    if (lockedProbability === 'won') draft.probability = 100;
    if (lockedProbability === 'lost') draft.probability = 0;
    probabilitySelect.value = String(draft.probability);
    probabilitySelect.disabled = structureLocked || Boolean(lockedProbability);
    stage.querySelector('.stage-probability-help').textContent = structureLocked
      ? 'Stage structure and probability are protected.'
      : lockedProbability
        ? (lockedProbability === 'won' ? 'Won is fixed at 100%.' : 'Lost is fixed at 0%.')
        : 'Won is 100%; Lost is 0%.';
  }

  function closeStageEditor(save) {
    if (!activeStageEditor) return true;
    const { stage, def, original, draft } = activeStageEditor;
    const input = stage.querySelector('.stage-title-input');

    if (save) {
      const title = input.value.trim();
      if (!title) {
        input.setCustomValidity('Enter a stage title.');
        input.reportValidity();
        input.focus();
        return false;
      }
      input.setCustomValidity('');
      draft.name = title;
      def.name = draft.name;
      def.icon = draft.icon;
      def.color = draft.color;
      def.probability = draft.probability;
      stage.dataset.probability = String(draft.probability);
      CRM_STAGES[+stage.dataset.stage] = draft.name;
      syncDealStageOptions(document.getElementById('df-stage').selectedIndex);
      updateStagePreview(stage, draft);
      stage.querySelector('.stage-menu-trigger').setAttribute('aria-label', 'More actions for ' + draft.name);
      stage.querySelector('.stage-title-edit').setAttribute('aria-label', 'Rename ' + draft.name);
    } else {
      updateStagePreview(stage, original);
    }

    stage.classList.remove('editing-stage');
    stage.querySelector('.stage-head').classList.remove('editing');
    activeStageEditor = null;
    return true;
  }

  function openStageEditor(stage, def) {
    if (def.protected) {
      qtShowSnackbar(def.name + ' has a protected stage structure. Its Automations can still be changed.');
      return;
    }
    if (activeStageEditor && activeStageEditor.stage === stage) return;
    closeStageMenu();
    closeStageEditor(false);

    const original = { name: def.name, icon: def.icon, color: def.color, probability: def.probability == null ? 50 : def.probability };
    const draft = { ...original };
    activeStageEditor = { stage, def, original, draft };
    stage.classList.add('editing-stage');
    stage.querySelector('.stage-head').classList.add('editing');

    const input = stage.querySelector('.stage-title-input');
    input.value = draft.name;
    input.setCustomValidity('');
    updateStageEditorControls(stage, draft);
    requestAnimationFrame(() => { input.focus(); input.select(); });
  }

  function wireStageEditor(stage, def) {
    const editor = stage.querySelector('.stage-editor');
    const input = stage.querySelector('.stage-title-input');
    const iconGrid = stage.querySelector('.stage-icon-grid');
    const colourRow = stage.querySelector('.stage-colour-row');
    const probabilitySelect = stage.querySelector('.stage-probability-select');

    CRM_STAGE_ICON_OPTIONS.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-icon-option' + (option.glyph ? '' : ' none');
      btn.dataset.icon = option.glyph;
      btn.title = option.name;
      btn.setAttribute('aria-label', option.name);
      btn.setAttribute('aria-pressed', 'false');
      if (option.glyph) {
        const icon = document.createElement('i');
        icon.className = 'fai';
        icon.textContent = option.glyph;
        btn.appendChild(icon);
      } else {
        btn.textContent = '—';
      }
      iconGrid.appendChild(btn);
    });

    CRM_STAGE_COLOUR_OPTIONS.forEach(colour => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-colour-option';
      btn.dataset.colour = colour;
      btn.style.setProperty('--swatch', colour);
      btn.title = colour;
      btn.setAttribute('aria-label', 'Use colour ' + colour);
      btn.setAttribute('aria-pressed', 'false');
      colourRow.insertBefore(btn, colourRow.querySelector('.stage-colour-custom'));
    });

    CRM_STAGE_PROBABILITY_OPTIONS.forEach(probability => {
      const option = document.createElement('option');
      option.value = String(probability);
      option.textContent = stageProbabilityLabel(probability);
      probabilitySelect.appendChild(option);
    });

    editor.addEventListener('click', e => e.stopPropagation());
    input.addEventListener('input', () => {
      if (def.protected) return;
      if (pipelineManagementSnapshot) {
        input.setCustomValidity('');
        def.name = input.value;
        CRM_STAGES[+stage.dataset.stage] = input.value;
        updateStagePreview(stage, def);
        return;
      }
      if (!activeStageEditor || activeStageEditor.stage !== stage) return;
      activeStageEditor.draft.name = input.value;
      updateStagePreview(stage, activeStageEditor.draft);
    });
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); closeStageEditor(true); }
      if (e.key === 'Escape') { e.preventDefault(); closeStageEditor(false); }
    });
    iconGrid.addEventListener('click', e => {
      const btn = e.target.closest('.stage-icon-option');
      if (def.protected) return;
      if (btn && pipelineManagementSnapshot) {
        def.icon = btn.dataset.icon;
        updateStagePreview(stage, def);
        updateStageEditorControls(stage, def);
        return;
      }
      if (!btn || !activeStageEditor || activeStageEditor.stage !== stage) return;
      activeStageEditor.draft.icon = btn.dataset.icon;
      updateStagePreview(stage, activeStageEditor.draft);
      updateStageEditorControls(stage, activeStageEditor.draft);
    });
    colourRow.addEventListener('click', e => {
      const btn = e.target.closest('.stage-colour-option');
      if (def.protected) return;
      if (btn && pipelineManagementSnapshot) {
        def.color = btn.dataset.colour;
        updateStagePreview(stage, def);
        updateStageEditorControls(stage, def);
        return;
      }
      if (!btn || !activeStageEditor || activeStageEditor.stage !== stage) return;
      activeStageEditor.draft.color = btn.dataset.colour;
      updateStagePreview(stage, activeStageEditor.draft);
      updateStageEditorControls(stage, activeStageEditor.draft);
    });
    stage.querySelector('.stage-colour-custom').addEventListener('input', e => {
      if (def.protected) return;
      if (pipelineManagementSnapshot) {
        def.color = e.target.value.toUpperCase();
        updateStagePreview(stage, def);
        updateStageEditorControls(stage, def);
        return;
      }
      if (!activeStageEditor || activeStageEditor.stage !== stage) return;
      activeStageEditor.draft.color = e.target.value.toUpperCase();
      updateStagePreview(stage, activeStageEditor.draft);
      updateStageEditorControls(stage, activeStageEditor.draft);
    });
    probabilitySelect.addEventListener('change', e => {
      if (def.protected) return;
      if (pipelineManagementSnapshot) {
        def.probability = Number(e.target.value);
        stage.dataset.probability = String(def.probability);
        updateStagePreview(stage, def);
        updateStageEditorControls(stage, def);
        return;
      }
      if (!activeStageEditor || activeStageEditor.stage !== stage) return;
      activeStageEditor.draft.probability = Number(e.target.value);
      updateStageEditorControls(stage, activeStageEditor.draft);
    });
    stage.querySelector('[data-stage-action="cancel"]').addEventListener('click', () => closeStageEditor(false));
    stage.querySelector('[data-stage-action="save"]').addEventListener('click', () => closeStageEditor(true));
    const deleteButton = stage.querySelector('[data-stage-action="delete"]');
    if (deleteButton) deleteButton.addEventListener('click', () => requestStageDelete(stage, def));
    const automationButton = stage.querySelector('[data-stage-action="automations"]');
    if (automationButton) automationButton.addEventListener('click', () => {
      if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.openStageManager === 'function') {
        window.WeQuoteAutomation.openStageManager(stageAutomationContext(def));
      } else if (typeof window.openSalesPipelineAutomations === 'function') {
        window.openSalesPipelineAutomations();
      }
    });
  }

  function closeStageMenu() {
    if (!activeStageMenu) return;
    const head = activeStageMenu.querySelector('.stage-head');
    const trigger = activeStageMenu.querySelector('.stage-menu-trigger');
    head.classList.remove('menu-open');
    trigger.setAttribute('aria-expanded', 'false');
    activeStageMenu = null;
  }

  function syncStageWatchState(stage, def) {
    const watching = !!def.watching;
    stage.classList.toggle('is-watching', watching);
    const action = stage.querySelector('[data-stage-menu-action="watch"]');
    if (action) {
      action.classList.toggle('selected', watching);
      action.querySelector('span').textContent = watching ? 'Stop watching' : 'Watch stage';
    }
  }

  function wireStageMenu(stage, def) {
    const head = stage.querySelector('.stage-head');
    const trigger = stage.querySelector('.stage-menu-trigger');
    const menu = stage.querySelector('.stage-menu');

    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const opening = activeStageMenu !== stage;
      closeStageMenu();
      closeStageEditor(false);
      if (!opening) return;
      activeStageMenu = stage;
      head.classList.add('menu-open');
      trigger.setAttribute('aria-expanded', 'true');
    });

    menu.addEventListener('click', e => {
      e.stopPropagation();
      const item = e.target.closest('[data-stage-menu-action]');
      if (!item) return;
      const action = item.dataset.stageMenuAction;
      closeStageMenu();
      if (action === 'watch') {
        def.watching = !def.watching;
        syncStageWatchState(stage, def);
        qtShowSnackbar(def.watching ? 'You are now watching ' + def.name + '.' : 'Stopped watching ' + def.name + '.', 'success');
      } else if (action === 'edit') {
        openStageEditor(stage, def);
      } else if (action === 'automations') {
        if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.openStageManager === 'function') {
          window.WeQuoteAutomation.openStageManager(stageAutomationContext(def));
        } else if (typeof window.openSalesPipelineAutomations === 'function') {
          window.openSalesPipelineAutomations();
        }
      } else if (action === 'delete') {
        requestStageDelete(stage, def);
      }
    });
  }

  function createStageColumn(def, i) {
    const stage = document.createElement('div');
    const safeName = stageTextHtml(def.name);
    stage.className = 'stage' + (def.protected ? ' protected-stage' : ' custom-stage') + (def.lifecycleSegment ? ' lifecycle-custom-stage' : '');
    stage._def = def;
    stage.dataset.stage = i;
    stage.dataset.probability = String(def.probability == null ? 50 : def.probability);
    stage.innerHTML =
      '<div class="stage-head">' +
        '<div class="stage-name-row">' +
          '<i class="fai stage-icon' + (def.icon ? '' : ' is-empty') + '" style="color:' + def.color + '">' + def.icon + '</i>' +
          '<div class="stage-title-wrap">' +
            '<div class="stage-name">' + safeName + '</div>' +
            '<button type="button" class="stage-title-edit' + (def.protected ? ' is-protected' : '') + '" aria-label="' + (def.protected ? 'Protected Quote lifecycle stage' : 'Rename ' + safeName) + '"><i class="fai">' + (def.protected ? '&#xf023;' : '&#xf303;') + '</i></button>' +
          '</div>' +
        '</div>' +
        (def.lifecycleRule ? '<div class="stage-lifecycle-rule"><span>Moves when</span><strong>' + stageTextHtml(def.lifecycleRule) + '</strong></div>' : '') +
        ((!def.protected && def.lifecycleSegment) ? '<div class="stage-lifecycle-rule custom-segment"><span>Lifecycle segment</span><strong>' + stageTextHtml(lifecycleSegmentLabel(def.lifecycleSegment)) + '</strong><small>' + stageTextHtml(CRM_QUOTE_SEGMENT_EVENTS[def.lifecycleSegment] || '') + '</small></div>' : '') +
        '<div class="stage-automation-access"><i class="fai">&#xf0e7;</i><span>Automations editable</span></div>' +
        '<div class="stage-manage-probability"><span class="stage-manage-probability-label">Probability</span><span class="stage-manage-probability-value">' + (def.probability == null ? 50 : def.probability) + '%</span></div>' +
        '<div class="stage-head-tools">' +
          '<span class="stage-drag-handle" title="Drag to reorder" aria-label="Drag to reorder"><i class="fai">&#xf58d;</i></span>' +
          '<span class="stage-watch-indicator" title="Watching this stage" aria-label="Watching this stage"><i class="fai">&#xf0f3;</i></span>' +
          '<button type="button" class="stage-menu-trigger" aria-label="More actions for ' + safeName + '" aria-haspopup="menu" aria-expanded="false"><i class="fai">&#xf141;</i></button>' +
        '</div>' +
        '<div class="stage-menu" role="menu">' +
          '<button type="button" class="stage-menu-item" data-stage-menu-action="watch" role="menuitem"><i class="fai">&#xf0f3;</i><span>Watch stage</span></button>' +
          '<button type="button" class="stage-menu-item" data-stage-menu-action="automations" role="menuitem"><i class="fai">&#xf0e7;</i><span>Manage Automations</span></button>' +
          (def.protected ? '' : '<button type="button" class="stage-menu-item" data-stage-menu-action="edit" role="menuitem"><i class="fai">&#xf303;</i><span>Edit stage</span></button>') +
          ((def.outcome || def.protected) ? '' : '<div class="stage-menu-divider"></div><button type="button" class="stage-menu-item delete" data-stage-menu-action="delete" role="menuitem"><i class="fai">&#xf2ed;</i><span>Delete stage</span></button>') +
        '</div>' +
        '<div class="stage-editor" role="dialog" aria-label="Edit stage">' +
          (def.protected ? '<div class="stage-protected-editor"><i class="fai">&#xf023;</i><span><strong>Stage structure protected</strong><small>Name, order and lifecycle mapping are controlled by WeQuote. Operational Automations can still be changed.</small></span><button type="button" data-stage-action="automations">Manage Automations</button></div>' : '') +
          '<div class="stage-name-field wqd-field"><label class="wqd-field-label">Stage name</label><input class="stage-title-input" type="text" maxlength="32" autocomplete="off" placeholder="Stage name"></div>' +
          '<div class="stage-editor-section stage-icon-section"><span class="stage-editor-label">Icon</span><div class="stage-icon-grid"></div></div>' +
          '<div class="stage-editor-section stage-colour-section"><span class="stage-editor-label">Icon colour</span><div class="stage-colour-row"><input class="stage-colour-custom" type="color" aria-label="Custom icon colour"></div></div>' +
          '<div class="stage-editor-section stage-probability-section"><div class="stage-probability-wrap wqd-select-wrap floating-select has-value"><label class="floating-select-label">Probability</label><select class="stage-probability-select wqd-select"></select><i class="fai stage-probability-chevron chev" aria-hidden="true">&#xf078;</i></div><span class="stage-probability-help">Closed outcomes use 0% or 100%.</span></div>' +
          ((def.outcome || def.protected) ? '' : '<button type="button" class="stage-editor-delete" data-stage-action="delete"><i class="fai">&#xf2ed;</i><span>Delete stage</span></button>') +
          '<div class="stage-editor-actions"><button type="button" class="stage-editor-btn" data-stage-action="cancel">Cancel</button><button type="button" class="stage-editor-btn save" data-stage-action="save">Save</button></div>' +
        '</div>' +
        '<div class="stage-meta">' +
          '<div class="stage-summary-values">' +
            '<div class="stage-summary-row"><span class="stage-summary-label">Deal</span><span class="stage-summary-value stage-summary-deal"></span></div>' +
            '<div class="stage-summary-row margin"><span class="stage-summary-label">Margin</span><span class="stage-summary-value stage-summary-margin"></span></div>' +
          '</div>' +
          '<span class="stage-summary-count"></span>' +
        '</div>' +
      '</div>' +
      '<div class="stage-body"></div>' +
      '<button class="stage-create-deal" onclick="openDealForm(\'new\', null)"><i class="fai">&#x2b;</i> Create Deal</button>';
    const body = stage.querySelector('.stage-body');
    CRM_DEALS.filter(d => !d.archived && d.s === i && owningCompanyMatches(d)).forEach(d => body.appendChild(makeDealCard(d)));
    stage.classList.toggle('is-empty', body.childElementCount === 0);
    wireStageTitleEditor(stage, def);
    wireStageEditor(stage, def);
    wireStageMenu(stage, def);
    syncStageWatchState(stage, def);
    return stage;
  }

  CRM_STAGE_DEFS.forEach((def, i) => pipelineEl.appendChild(createStageColumn(def, i)));

  const addStageButton = document.createElement('button');
  addStageButton.type = 'button';
  addStageButton.className = 'stage-add-another';
  addStageButton.innerHTML = '<i class="fai">&#x2b;</i><span>Add another stage</span>';
  addStageButton.addEventListener('click', addPipelineStage);
  pipelineEl.appendChild(addStageButton);

  CRM_STAGE_DEFS.forEach(() => {
    const strip = document.createElement('span');
    strip.className = 'pipeline-minimap-strip';
    pipelineMinimapStrips.appendChild(strip);
  });
  const addStageStrip = document.createElement('span');
  addStageStrip.className = 'pipeline-minimap-strip add-control';
  pipelineMinimapStrips.appendChild(addStageStrip);

  let stageCreateDraft = { name: '', icon: '', color: '#576A92', probability: 50, lifecycleSegment: 'Qualified' };

  function stageProbabilityLabel(probability) {
    return probability + '%';
  }

  function stageTextHtml(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function updateStageCreateControls() {
    document.querySelectorAll('#stageCreateIconGrid .stage-icon-option').forEach(btn => {
      const selected = btn.dataset.icon === stageCreateDraft.icon;
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    document.querySelectorAll('#stageCreateColourRow .stage-colour-option').forEach(btn => {
      const selected = btn.dataset.colour.toLowerCase() === stageCreateDraft.color.toLowerCase();
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
    });
    document.getElementById('stageCreateCustomColour').value = stageCreateDraft.color;
    document.getElementById('stageCreateProbability').value = String(stageCreateDraft.probability);
    const quoteConnected = pipelineUsesQuoteLifecycle(getActivePipeline());
    const segmentField = document.getElementById('stageCreateSegmentField');
    const segmentSelect = document.getElementById('stageCreateSegment');
    segmentField.hidden = !quoteConnected;
    if (quoteConnected) {
      segmentSelect.innerHTML = CRM_QUOTE_SEGMENT_STARTS.map(segment =>
        '<option value="' + stageTextHtml(segment) + '"' + (segment === stageCreateDraft.lifecycleSegment ? ' selected' : '') + '>Between ' + stageTextHtml(segment) + ' and ' + stageTextHtml(lifecycleSegmentEndName(segment)) + '</option>'
      ).join('');
      document.getElementById('stageCreateSystemRuleText').textContent = CRM_QUOTE_SEGMENT_EVENTS[stageCreateDraft.lifecycleSegment];
    }
    const automationEyebrow = document.getElementById('stageCreateAutomationEyebrow');
    const automationTitle = document.getElementById('stageCreateAutomationTitle');
    const automationText = document.getElementById('stageCreateAutomationText');
    if (automationEyebrow && automationTitle && automationText) {
      automationEyebrow.textContent = quoteConnected ? 'SEGMENT AUTOMATION LIBRARY' : 'SHARED AUTOMATION LIBRARY';
      automationTitle.textContent = quoteConnected
        ? lifecycleSegmentLabel(stageCreateDraft.lifecycleSegment)
        : 'Same library for every Fully Custom Stage';
      automationText.textContent = quoteConnected
        ? 'This Stage shares the segment-compatible Starts when, Rules and Actions. Its Automation settings remain independent.'
        : 'The Stage name does not change its options. Configure its own Starts when, Rules and Actions after creating it.';
    }
  }

  function initialiseStageCreateDialog() {
    const iconGrid = document.getElementById('stageCreateIconGrid');
    const colourRow = document.getElementById('stageCreateColourRow');
    const probabilitySelect = document.getElementById('stageCreateProbability');

    CRM_STAGE_ICON_OPTIONS.forEach(option => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-icon-option' + (option.glyph ? '' : ' none');
      btn.dataset.icon = option.glyph;
      btn.title = option.name;
      btn.setAttribute('aria-label', option.name);
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = option.glyph ? '<i class="fai">' + option.glyph + '</i>' : '—';
      iconGrid.appendChild(btn);
    });
    CRM_STAGE_COLOUR_OPTIONS.forEach(colour => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stage-colour-option';
      btn.dataset.colour = colour;
      btn.style.setProperty('--swatch', colour);
      btn.title = colour;
      btn.setAttribute('aria-label', 'Use colour ' + colour);
      btn.setAttribute('aria-pressed', 'false');
      colourRow.insertBefore(btn, document.getElementById('stageCreateCustomColour'));
    });
    CRM_STAGE_PROBABILITY_OPTIONS.forEach(probability => {
      const option = document.createElement('option');
      option.value = String(probability);
      option.textContent = stageProbabilityLabel(probability);
      probabilitySelect.appendChild(option);
    });

    iconGrid.addEventListener('click', e => {
      const btn = e.target.closest('.stage-icon-option');
      if (!btn) return;
      stageCreateDraft.icon = btn.dataset.icon;
      updateStageCreateControls();
    });
    colourRow.addEventListener('click', e => {
      const btn = e.target.closest('.stage-colour-option');
      if (!btn) return;
      stageCreateDraft.color = btn.dataset.colour;
      updateStageCreateControls();
    });
    document.getElementById('stageCreateCustomColour').addEventListener('input', e => {
      stageCreateDraft.color = e.target.value.toUpperCase();
      updateStageCreateControls();
    });
    probabilitySelect.addEventListener('change', e => {
      stageCreateDraft.probability = Number(e.target.value);
      updateStageCreateControls();
    });
    document.getElementById('stageCreateSegment').addEventListener('change', e => {
      stageCreateDraft.lifecycleSegment = CRM_QUOTE_SEGMENT_STARTS.includes(e.target.value) ? e.target.value : 'Qualified';
      updateStageCreateControls();
    });
    document.getElementById('stageCreateName').addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); confirmStageCreate(); }
      if (e.key === 'Escape') { e.preventDefault(); closeStageCreateDialog(); }
    });
  }

  function addPipelineStage() {
    closeStageMenu();
    closeStageEditor(false);
    if (!pipelineManagementSnapshot) enterPipelineManagement();
    stageCreateDraft = { name: '', icon: '', color: '#576A92', probability: 50, lifecycleSegment: 'Qualified' };
    const input = document.getElementById('stageCreateName');
    input.value = '';
    input.setCustomValidity('');
    updateStageCreateControls();
    document.getElementById('stageCreateOverlay').classList.add('open');
  }

  function closeStageCreateDialog() {
    document.getElementById('stageCreateOverlay').classList.remove('open');
    document.getElementById('stageCreateName').setCustomValidity('');
  }

  function confirmStageCreate() {
    const input = document.getElementById('stageCreateName');
    const name = input.value.trim();
    if (!name) {
      input.setCustomValidity('Enter a stage name.');
      input.reportValidity();
      input.focus();
      return;
    }
    if (CRM_STAGE_DEFS.some(stage => String(stage.name || '').trim().toLowerCase() === name.toLowerCase())) {
      input.setCustomValidity('A stage with this name already exists.');
      input.reportValidity();
      input.focus();
      return;
    }
    input.setCustomValidity('');
    const def = {
      name,
      icon: stageCreateDraft.icon,
      color: stageCreateDraft.color,
      probability: stageCreateDraft.probability,
      protected: false,
      watching: false,
      customStageId: 'custom-' + Date.now().toString(36),
      lifecycleSegment: pipelineUsesQuoteLifecycle(getActivePipeline()) ? stageCreateDraft.lifecycleSegment : undefined
    };
    closeStageCreateDialog();
    commitPipelineStage(def);
  }

  function syncDealStageOptions(selectedIndex) {
    const select = document.getElementById('df-stage');
    if (!select) return;
    const nextIndex = Math.max(0, Math.min(selectedIndex == null ? select.selectedIndex : selectedIndex, CRM_STAGE_DEFS.length - 1));
    select.innerHTML = '';
    CRM_STAGE_DEFS.forEach(def => {
      const option = document.createElement('option');
      option.textContent = def.name;
      select.appendChild(option);
    });
    select.selectedIndex = nextIndex;
    dfProgressBar(nextIndex);
  }

  function commitPipelineStage(def) {
    let index = CRM_STAGE_DEFS.findIndex(stage => stage.outcome);
    if (pipelineUsesQuoteLifecycle(getActivePipeline())) {
      const endName = lifecycleSegmentEndName(def.lifecycleSegment);
      index = endName === 'Won / Lost'
        ? CRM_STAGE_DEFS.findIndex(stage => stage.outcome)
        : CRM_STAGE_DEFS.findIndex(stage => stage.protected && stage.name === endName);
    }
    if (index < 0) index = CRM_STAGE_DEFS.length;
    CRM_DEALS.forEach(deal => {
      if (deal.s >= index) deal.s += 1;
      if (deal.archivedFromStageIndex >= index) deal.archivedFromStageIndex += 1;
    });
    CRM_STAGE_DEFS.splice(index, 0, def);
    CRM_STAGES.splice(index, 0, def.name);
    rebuildPipelineColumns();
    const stage = [...pipelineEl.querySelectorAll('.stage')].find(column => column._def === def);

    requestAnimationFrame(() => {
      updatePipelineMinimap();
      if (stage) pipelineEl.scrollTo({ left: Math.max(0, stage.offsetLeft - 24), behavior: 'smooth' });
    });
    qtShowSnackbar(def.name + ' added to this Draft' + (def.lifecycleSegment ? ' · ' + lifecycleSegmentLabel(def.lifecycleSegment) : '') + '.', 'success');
  }

  initialiseStageCreateDialog();

  let pipelineManagementSnapshot = null;
  let managedDraggedStage = null;
  let managedDragArmedStage = null;
  let managedDropTarget = null;
  let managedDropAfter = false;

  function setStageManagementDraggable(enabled) {
    pipelineEl.querySelectorAll('.stage').forEach(stage => {
      stage.draggable = false;
      stage.setAttribute('aria-grabbed', 'false');
    });
    if (!enabled) managedDragArmedStage = null;
  }

  function clearManagedDropState() {
    pipelineEl.querySelectorAll('.stage').forEach(stage => {
      stage.classList.remove('dragging-stage', 'drop-before', 'drop-after');
      stage.setAttribute('aria-grabbed', 'false');
    });
    managedDraggedStage = null;
    managedDropTarget = null;
    managedDropAfter = false;
  }

  function rebuildPipelineColumns() {
    [...pipelineEl.children].filter(el => el.classList.contains('stage')).forEach(stage => stage.remove());
    CRM_STAGE_DEFS.forEach((def, index) => pipelineEl.insertBefore(createStageColumn(def, index), addStageButton));

    pipelineMinimapStrips.innerHTML = '';
    CRM_STAGE_DEFS.forEach(() => {
      const strip = document.createElement('span');
      strip.className = 'pipeline-minimap-strip';
      pipelineMinimapStrips.appendChild(strip);
    });
    pipelineMinimapStrips.appendChild(addStageStrip);
    syncDealStageOptions(0);
    recalcPipeline();
    requestAnimationFrame(updatePipelineMinimap);
  }

  function enterPipelineManagement() {
    if (pipelineManagementSnapshot) return;
    closeStageMenu();
    closeStageEditor(false);
    pipelineManagementSnapshot = {
      defs: CRM_STAGE_DEFS.map(def => ({ ...def })),
      deals: CRM_DEALS.map(deal => ({
        deal,
        s: deal.s,
        archived: deal.archived,
        archivedFromStage: deal.archivedFromStage
      })),
      scrollLeft: pipelineEl.scrollLeft
    };
    document.getElementById('viewCrm').classList.add('pipeline-manage-mode');
    const button = document.getElementById('pipelineManageButton');
    button.setAttribute('aria-pressed', 'true');
    button.title = 'Editing pipeline stages';
    document.getElementById('pipelineManageActions').classList.add('open');
    document.getElementById('pipelineManageActions').setAttribute('aria-hidden', 'false');
    pipelineMinimap.classList.add('suppressed');
    setStageManagementDraggable(true);
    pipelineEl.querySelectorAll('.stage').forEach(stage => {
      const def = stage._def;
      const input = stage.querySelector('.stage-title-input');
      input.value = def.name;
      input.disabled = Boolean(def.protected);
      input.setCustomValidity('');
      updateStageEditorControls(stage, def);
    });
  }

  function exitPipelineManagement() {
    closeStageMenu();
    closeStageEditor(false);
    clearManagedDropState();
    document.getElementById('viewCrm').classList.remove('pipeline-manage-mode');
    const button = document.getElementById('pipelineManageButton');
    button.setAttribute('aria-pressed', 'false');
    button.title = 'Manage pipeline stages';
    document.getElementById('pipelineManageActions').classList.remove('open');
    document.getElementById('pipelineManageActions').setAttribute('aria-hidden', 'true');
    pipelineMinimap.classList.remove('suppressed');
    setStageManagementDraggable(false);
    requestAnimationFrame(updatePipelineMinimap);
  }

  function savePipelineManagement() {
    if (!pipelineManagementSnapshot) return;
    if (activeStageEditor && !closeStageEditor(true)) return;
    const stages = [...pipelineEl.querySelectorAll('.stage')];
    const invalidStage = stages.find(stage => !stage._def.protected && !stage.querySelector('.stage-title-input').value.trim());
    if (invalidStage) {
      const input = invalidStage.querySelector('.stage-title-input');
      input.setCustomValidity('Enter a stage name.');
      input.reportValidity();
      input.focus();
      return;
    }
    stages.forEach((stage, index) => {
      if (!CRM_STAGE_DEFS[index].protected) {
        CRM_STAGE_DEFS[index].name = stage.querySelector('.stage-title-input').value.trim();
      }
      CRM_STAGES[index] = CRM_STAGE_DEFS[index].name;
      stage.querySelector('.stage-menu-trigger').setAttribute('aria-label', 'More actions for ' + CRM_STAGE_DEFS[index].name);
      stage.querySelector('.stage-title-edit').setAttribute('aria-label', 'Rename ' + CRM_STAGE_DEFS[index].name);
    });
    pipelineManagementSnapshot = null;
    exitPipelineManagement();
    syncDealStageOptions(0);
    recalcPipeline();
    saveActivePipelineState();
    qtShowSnackbar('Pipeline stage changes saved.', 'success');
  }

  function requestPipelineSave() {
    if (!pipelineManagementSnapshot) return;
    const invalidStage = [...pipelineEl.querySelectorAll('.stage')]
      .find(stage => !stage._def.protected && !stage.querySelector('.stage-title-input').value.trim());
    if (invalidStage) {
      const input = invalidStage.querySelector('.stage-title-input');
      input.setCustomValidity('Enter a stage name.');
      input.reportValidity();
      input.focus();
      return;
    }
    const pipelineName = getActivePipeline().name;
    document.getElementById('pipelineSaveTitle').textContent = 'Save changes to ' + pipelineName + '?';
    document.getElementById('pipelineSaveCopy').textContent = 'These changes will update the existing pipeline stages for every Deal using this ' + pipelineName + '.';
    const beforeDefs = pipelineManagementSnapshot.defs || [];
    const afterDefs = CRM_STAGE_DEFS;
    const stageStrip = (defs, state) => '<div class="pipeline-save-side ' + state + '"><small>' + (state === 'before' ? 'CURRENT · PUBLISHED' : 'AFTER · DRAFT') + '</small><div>' + defs.map(def =>
      '<span class="' + (def.protected ? 'protected' : 'custom') + '">' + (def.protected ? '<i class="fai">&#xf023;</i>' : '<i class="fai">&#xf303;</i>') + stageTextHtml(def.name) + '</span>'
    ).join('<b>›</b>') + '</div></div>';
    const changedDeals = (pipelineManagementSnapshot.deals || []).filter(state => state.s !== state.deal.s || Boolean(state.archived) !== Boolean(state.deal.archived)).length;
    const quoteConnected = pipelineUsesQuoteLifecycle(getActivePipeline());
    document.getElementById('pipelineSaveComparison').innerHTML = stageStrip(beforeDefs, 'before') + stageStrip(afterDefs, 'after') +
      '<p><strong>' + changedDeals + ' existing Deal' + (changedDeals === 1 ? '' : 's') + ' affected</strong><span>' + (quoteConnected
        ? 'Protected lifecycle rules remain active. Custom Stages stay inside their selected lifecycle segment.'
        : 'Fully Custom Stages keep the same shared Automation block library. Each Stage keeps its own Automation settings and explicit move targets.') + '</span></p>';
    document.getElementById('pipelineSaveOverlay').classList.add('open');
  }

  function closePipelineSaveDialog() {
    document.getElementById('pipelineSaveOverlay').classList.remove('open');
  }

  function confirmPipelineSave() {
    closePipelineSaveDialog();
    savePipelineManagement();
  }

  function cancelPipelineManagement() {
    if (!pipelineManagementSnapshot) return;
    closeStageEditor(false);
    const snapshot = pipelineManagementSnapshot;
    pipelineManagementSnapshot = null;
    CRM_STAGE_DEFS.splice(0, CRM_STAGE_DEFS.length, ...snapshot.defs.map(def => ({ ...def })));
    CRM_STAGES.splice(0, CRM_STAGES.length, ...CRM_STAGE_DEFS.map(def => def.name));
    snapshot.deals.forEach(state => {
      state.deal.s = state.s;
      if (state.archived === undefined) delete state.deal.archived;
      else state.deal.archived = state.archived;
      if (state.archivedFromStage === undefined) delete state.deal.archivedFromStage;
      else state.deal.archivedFromStage = state.archivedFromStage;
    });
    exitPipelineManagement();
    rebuildPipelineColumns();
    pipelineEl.scrollLeft = snapshot.scrollLeft;
    qtShowSnackbar('Pipeline changes cancelled.');
  }

  function applyManagedStageOrder() {
    const stages = [...pipelineEl.children].filter(el => el.classList.contains('stage'));
    const previousDefs = [...CRM_STAGE_DEFS];
    const orderedDefs = stages.map(stage => stage._def);
    if (orderedDefs.length !== previousDefs.length) return;
    CRM_DEALS.forEach(deal => {
      if (deal.archived || deal.s < 0) return;
      const stageDef = previousDefs[deal.s];
      const nextIndex = orderedDefs.indexOf(stageDef);
      if (nextIndex >= 0) deal.s = nextIndex;
    });
    CRM_STAGE_DEFS.splice(0, CRM_STAGE_DEFS.length, ...orderedDefs);
    CRM_STAGES.splice(0, CRM_STAGES.length, ...orderedDefs.map(def => def.name));
    stages.forEach((stage, index) => { stage.dataset.stage = index; });
    syncDealStageOptions(0);
    recalcPipeline();
    requestAnimationFrame(updatePipelineMinimap);
  }

  document.getElementById('pipelineManageButton').addEventListener('click', () => {
    if (!pipelineManagementSnapshot) enterPipelineManagement();
  });

  pipelineEl.addEventListener('pointerdown', e => {
    if (!pipelineManagementSnapshot) return;
    pipelineEl.querySelectorAll('.stage').forEach(stage => { stage.draggable = false; });
    const handle = e.target.closest('.stage-drag-handle');
    managedDragArmedStage = handle ? handle.closest('.stage') : null;
    if (managedDragArmedStage && managedDragArmedStage._def && managedDragArmedStage._def.protected) {
      managedDragArmedStage = null;
      qtShowSnackbar('Protected lifecycle milestones cannot be reordered. Move Custom Stages inside their lifecycle segment.');
    }
    if (managedDragArmedStage) managedDragArmedStage.draggable = true;
  });

  pipelineEl.addEventListener('dragstart', e => {
    if (!pipelineManagementSnapshot) return;
    const stage = e.target.closest('.stage');
    if (!stage || stage !== managedDragArmedStage) { e.preventDefault(); return; }
    managedDraggedStage = stage;
    stage.classList.add('dragging-stage');
    stage.setAttribute('aria-grabbed', 'true');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', stage._def.name);
  });
  pipelineEl.addEventListener('dragover', e => {
    if (!pipelineManagementSnapshot || !managedDraggedStage) return;
    e.preventDefault();
    const pipelineRect = pipelineEl.getBoundingClientRect();
    const edgeZone = Math.min(96, pipelineRect.width * 0.12);
    if (e.clientX < pipelineRect.left + edgeZone) {
      const pressure = 1 - Math.max(0, e.clientX - pipelineRect.left) / edgeZone;
      pipelineEl.scrollLeft -= 16 + (28 * pressure);
    } else if (e.clientX > pipelineRect.right - edgeZone) {
      const pressure = 1 - Math.max(0, pipelineRect.right - e.clientX) / edgeZone;
      pipelineEl.scrollLeft += 16 + (28 * pressure);
    }

    const draggedDefinition = managedDraggedStage._def || {};
    const candidates = [...pipelineEl.querySelectorAll('.stage')]
      .filter(stage => stage !== managedDraggedStage)
      .filter(stage => {
        const candidateDefinition = stage._def || {};
        if (pipelineUsesQuoteLifecycle(getActivePipeline())) {
          return !candidateDefinition.protected && candidateDefinition.lifecycleSegment === draggedDefinition.lifecycleSegment;
        }
        return !candidateDefinition.outcome;
      });
    if (!candidates.length) return;
    let target = e.target.closest('.stage');
    if (!target || target === managedDraggedStage) {
      target = candidates.reduce((closest, stage) => {
        const rect = stage.getBoundingClientRect();
        const distance = Math.abs(e.clientX - (rect.left + rect.width / 2));
        return !closest || distance < closest.distance ? { stage, distance } : closest;
      }, null).stage;
    }
    pipelineEl.querySelectorAll('.stage').forEach(stage => stage.classList.remove('drop-before', 'drop-after'));
    const rect = target.getBoundingClientRect();
    managedDropTarget = target;
    managedDropAfter = e.clientX > rect.left + rect.width / 2;
    target.classList.add(managedDropAfter ? 'drop-after' : 'drop-before');
  });
  pipelineEl.addEventListener('drop', e => {
    if (!pipelineManagementSnapshot || !managedDraggedStage) return;
    e.preventDefault();
    if (managedDropTarget && managedDropTarget !== managedDraggedStage) {
      pipelineEl.insertBefore(managedDraggedStage, managedDropAfter ? managedDropTarget.nextSibling : managedDropTarget);
      applyManagedStageOrder();
      qtShowSnackbar('Stage reordered in this Draft. Explicit Move Deal targets stay unchanged; review any skipped Stages before publishing.', 'success');
    }
    clearManagedDropState();
  });
  pipelineEl.addEventListener('dragend', () => {
    if (!pipelineManagementSnapshot) return;
    pipelineEl.querySelectorAll('.stage').forEach(stage => { stage.draggable = false; });
    managedDragArmedStage = null;
    clearManagedDropState();
  });

  function requestStageDelete(stage, def) {
    if (def.outcome || def.protected) {
      qtShowSnackbar(def.name + ' is a required pipeline stage and cannot be deleted.');
      return;
    }
    closeStageEditor(false);
    closeStageMenu();
    const index = +stage.dataset.stage;
    const deals = CRM_DEALS.filter(d => !d.archived && d.s === index);
    pendingStageDelete = { stage, def, deals };
    const count = deals.length;
    document.getElementById('stageDeleteTitle').textContent = 'Delete “' + def.name + '” stage?';
    const warning = document.getElementById('stageDeleteWarning').closest('.stage-delete-warning');
    if (count) {
      document.getElementById('stageDeleteCopy').textContent = 'This stage contains ' + count + ' deal' + (count === 1 ? '' : 's') + '.';
      document.getElementById('stageDeleteWarning').textContent = 'All ' + count + ' deal' + (count === 1 ? '' : 's') + ' will move to Archive. Their Quote statuses and history will not change.';
      document.getElementById('stageDeleteConfirm').textContent = 'Delete stage & archive ' + count + ' deal' + (count === 1 ? '' : 's');
      warning.hidden = false;
    } else {
      document.getElementById('stageDeleteCopy').textContent = 'This stage is empty. It will be removed from the pipeline.';
      document.getElementById('stageDeleteConfirm').textContent = 'Delete stage';
      warning.hidden = true;
    }
    document.getElementById('stageDeleteOverlay').classList.add('open');
  }

  function closeStageDeleteDialog() {
    document.getElementById('stageDeleteOverlay').classList.remove('open');
    pendingStageDelete = null;
  }

  function confirmStageDelete() {
    if (!pendingStageDelete) return;
    const { stage, def, deals } = pendingStageDelete;
    const count = deals.length;
    deletePipelineStage(stage, def, deals);
    document.getElementById('stageDeleteOverlay').classList.remove('open');
    pendingStageDelete = null;
    if (pipelineManagementSnapshot) {
      qtShowSnackbar('Stage removed from this draft. Save changes to apply it.', 'success');
    } else if (count) {
      qtShowSnackbar('Stage deleted. ' + count + ' deal' + (count === 1 ? '' : 's') + ' moved to Archive.', 'success');
    } else {
      qtShowSnackbar('Empty stage deleted.', 'success');
    }
  }

  function deletePipelineStage(stage, def, dealsToArchive) {
    const index = CRM_STAGE_DEFS.indexOf(def);
    if (index < 0 || def.outcome) return;

    dealsToArchive.forEach(d => {
      d.archived = true;
      d.archivedFromStage = def.name;
      d.s = -1;
    });
    CRM_DEALS.forEach(d => {
      if (!d.archived && d.s > index) d.s -= 1;
    });

    CRM_STAGE_DEFS.splice(index, 1);
    CRM_STAGES.splice(index, 1);
    syncDealStageOptions(Math.min(index, CRM_STAGE_DEFS.length - 1));
    stage.remove();
    const strips = pipelineMinimapStrips.querySelectorAll('.pipeline-minimap-strip:not(.add-control)');
    if (strips[index]) strips[index].remove();
    pipelineEl.querySelectorAll('.stage').forEach((column, stageIndex) => {
      column.dataset.stage = stageIndex;
    });
    recalcPipeline();
    requestAnimationFrame(updatePipelineMinimap);
  }

  function updatePipelineMinimap() {
    const trackWidth = pipelineMinimapTrack.clientWidth;
    const maxScroll = Math.max(0, pipelineEl.scrollWidth - pipelineEl.clientWidth);
    const visibleRatio = pipelineEl.scrollWidth ? Math.min(1, pipelineEl.clientWidth / pipelineEl.scrollWidth) : 1;
    const viewportWidth = Math.max(16, trackWidth * visibleRatio);
    const travel = Math.max(0, trackWidth - viewportWidth);
    const progress = maxScroll ? pipelineEl.scrollLeft / maxScroll : 0;
    pipelineMinimapViewport.style.width = viewportWidth + 'px';
    pipelineMinimapViewport.style.transform = 'translateX(' + (travel * progress) + 'px)';
    const hasOverflow = maxScroll > 1;
    pipelineMinimap.classList.toggle('no-scroll', !hasOverflow);
    pipelineMinimap.setAttribute('aria-hidden', hasOverflow ? 'false' : 'true');
  }

  function scrollPipelineFromMinimap(clientX, centreViewport) {
    const rect = pipelineMinimapTrack.getBoundingClientRect();
    const viewportWidth = pipelineMinimapViewport.getBoundingClientRect().width;
    const maxScroll = Math.max(0, pipelineEl.scrollWidth - pipelineEl.clientWidth);
    const travel = Math.max(1, rect.width - viewportWidth);
    const rawLeft = clientX - rect.left - (centreViewport ? viewportWidth / 2 : 0);
    const left = Math.max(0, Math.min(travel, rawLeft));
    pipelineEl.scrollLeft = maxScroll * (left / travel);
  }

  let minimapPointerId = null;
  let minimapDragOffset = 0;
  pipelineMinimapTrack.addEventListener('pointerdown', e => {
    if (pipelineMinimap.classList.contains('no-scroll')) return;
    const viewportRect = pipelineMinimapViewport.getBoundingClientRect();
    minimapPointerId = e.pointerId;
    if (e.target === pipelineMinimapViewport) {
      minimapDragOffset = e.clientX - viewportRect.left;
    } else {
      minimapDragOffset = viewportRect.width / 2;
      scrollPipelineFromMinimap(e.clientX, true);
    }
    pipelineMinimapTrack.setPointerCapture(e.pointerId);
    pipelineMinimapViewport.classList.add('dragging');
    e.preventDefault();
  });
  pipelineMinimapTrack.addEventListener('pointermove', e => {
    if (minimapPointerId !== e.pointerId) return;
    const rect = pipelineMinimapTrack.getBoundingClientRect();
    scrollPipelineFromMinimap(e.clientX - minimapDragOffset + pipelineMinimapViewport.getBoundingClientRect().width / 2, true);
  });
  function finishMinimapDrag(e) {
    if (minimapPointerId !== e.pointerId) return;
    minimapPointerId = null;
    pipelineMinimapViewport.classList.remove('dragging');
  }
  pipelineMinimapTrack.addEventListener('pointerup', finishMinimapDrag);
  pipelineMinimapTrack.addEventListener('pointercancel', finishMinimapDrag);
  pipelineEl.addEventListener('scroll', updatePipelineMinimap, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(updatePipelineMinimap).observe(pipelineEl);
  window.addEventListener('resize', updatePipelineMinimap);
  requestAnimationFrame(updatePipelineMinimap);

  document.addEventListener('click', e => {
    if (activeStageMenu && !activeStageMenu.contains(e.target)) closeStageMenu();
    if (activeStageEditor && !activeStageEditor.stage.contains(e.target)) closeStageEditor(false);
    if (!e.target.closest('#pipelineFilter')) closePipelineFilterMenu();
    if (!e.target.closest('#pipelineSort')) closePipelineSortMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && activeStageMenu) { closeStageMenu(); return; }
    if (e.key === 'Escape' && activeStageEditor) { closeStageEditor(false); return; }
    if (e.key === 'Escape') { closePipelineFilterMenu(); closePipelineSortMenu(); }
  });

  function localIsoDate(date) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
  }

  function dealCardMeetingStatus(d) {
    const meetings = (d.meetings || []).filter(meeting =>
      meeting && meeting.date && meeting.time && meeting.status !== 'completed' && meeting.status !== 'cancelled'
    );
    if (!meetings.length) return null;

    const now = new Date();
    const sorted = meetings.map(meeting => ({ meeting, start: new Date(meeting.date + 'T' + meeting.time + ':00') }))
      .filter(item => !Number.isNaN(item.start.getTime()))
      .sort((a, b) => a.start - b.start);
    if (!sorted.length) return null;

    const overdue = sorted.filter(item => item.start < now).pop();
    const selected = overdue || sorted.find(item => item.start >= now);
    if (!selected) return null;

    const todayKey = localIsoDate(now);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const tomorrowKey = localIsoDate(tomorrow);
    const dateLabel = selected.meeting.date === todayKey
      ? 'Today'
      : selected.meeting.date === tomorrowKey
        ? 'Tomorrow'
        : selected.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const isOverdue = selected.start < now;
    return {
      type: isOverdue ? 'meeting-overdue' : 'meeting',
      label: selected.meeting.title + (isOverdue ? ' overdue' : '') + ' · ' + dateLabel + ', ' + selected.meeting.time,
      icon: '&#xf073;', meetingId: selected.meeting.id, isToday: selected.meeting.date === todayKey
    };
  }

  function dealCardNoteFollowUpStatus(d) {
    const item = (d.notes || [])
      .filter(note => note && !note.deletedAt && note.followUpAt && note.followUpStatus !== 'completed')
      .map(note => ({ note, due: new Date(note.followUpAt) }))
      .filter(entry => !Number.isNaN(entry.due.getTime()))
      .sort((a, b) => a.due - b.due)[0];
    if (!item) return null;
    const overdue = item.due < new Date();
    const dueLabel = item.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return {
      type: overdue ? 'note-overdue' : 'note-followup',
      label: (overdue ? 'Note overdue' : 'Note follow-up') + ' · ' + dueLabel,
      icon: '&#xf249;', focusNoteId: item.note.id
    };
  }

  function dealCardFileRequestStatus(d) {
    const request = (d.fileRequests || []).filter(item => item && item.status !== 'received' && item.status !== 'cancelled')
      .map(item => ({ request: item, due: new Date(item.dueAt) }))
      .filter(item => !Number.isNaN(item.due.getTime()))
      .sort((a, b) => a.due - b.due)[0];
    if (!request) return null;
    const overdue = request.due < new Date();
    return {
      type: overdue ? 'file-request-overdue' : 'file-request-due',
      label: (overdue ? 'Required file overdue' : 'Required file due') + ' · ' + request.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      icon: '&#xf56f;', dataOpenFocus: true
    };
  }

  function dealCardNoteStatus(d) {
    const note = (d.notes || []).slice().reverse().find(item => !item.deletedAt && item.mentions && item.mentions.length);
    if (!note) return null;
    return {
      type: 'mention', label: 'Follow-up assigned · @' + note.mentions[0],
      icon: '&#x40;', focusNoteId: note.id
    };
  }

  function dealCardQualifiedContactStatus(d) {
    const contact = d.qualifiedContact;
    if (!contact || contact.status === 'completed' || !contact.dueAt) return null;
    const due = new Date(contact.dueAt);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const overdue = due < now;
    let timing;
    if (overdue) {
      const hours = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 3600000));
      timing = hours < 24 ? hours + (hours === 1 ? ' hour' : ' hours') :
        Math.floor(hours / 24) + (Math.floor(hours / 24) === 1 ? ' day' : ' days');
    } else {
      const dueKey = localIsoDate(due);
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const dayLabel = dueKey === localIsoDate(now)
        ? 'Today'
        : dueKey === localIsoDate(tomorrow)
          ? 'Tomorrow'
          : due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      timing = dayLabel + ', ' + due.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    return {
      type: overdue ? 'contact-overdue' : 'contact-due',
      label: (overdue ? 'Contact overdue' : 'Contact due') + ' · ' + timing,
      icon: '&#xf095;', dataOpenFocus: true
    };
  }

  function dealCardNextActionStatus(d) {
    const action = d.nextAction;
    if (!action || action.status === 'completed' || action.status === 'cancelled' || !action.dueAt) return null;
    const due = new Date(action.dueAt);
    if (Number.isNaN(due.getTime())) return null;
    const now = new Date();
    const overdue = due < now;
    const dueKey = localIsoDate(due);
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    let timing;
    if (overdue) {
      const hours = Math.max(1, Math.floor((now.getTime() - due.getTime()) / 3600000));
      timing = hours < 24
        ? hours + (hours === 1 ? ' hour' : ' hours')
        : Math.floor(hours / 24) + (Math.floor(hours / 24) === 1 ? ' day' : ' days');
    } else {
      const dayLabel = dueKey === localIsoDate(now)
        ? 'Today'
        : dueKey === localIsoDate(tomorrow)
          ? 'Tomorrow'
          : due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      timing = dayLabel + ', ' + due.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    }
    const config = {
      proposal: { noun: 'Proposal', icon: '&#xf571;', css: 'proposal' },
      'customer-followup': { noun: 'Customer follow-up', icon: '&#xf095;', css: 'customer-followup' },
      meeting: { noun: 'Meeting', icon: '&#xf073;', css: 'next-step' },
      'site-visit': { noun: 'Site visit', icon: '&#xf3c5;', css: 'next-step' },
      'site-readiness': { noun: 'Site readiness', icon: '&#xf0ae;', css: 'next-step' }
    }[action.type] || { noun: 'Next step', icon: '&#xf017;', css: 'next-step' };
    return {
      type: config.css + (overdue ? '-overdue' : '-due'),
      label: config.noun + (overdue ? ' overdue' : ' due') + ' · ' + timing,
      icon: config.icon, dataOpenFocus: true
    };
  }

  function dealCardAutomationTaskStatus(d) {
    const nextActionId = d.nextAction && String(d.nextAction.id || '');
    const item = (d.automationTasks || [])
      .filter(task => task && task.status !== 'completed' && task.status !== 'cancelled' && task.dueAt)
      .filter(task => !nextActionId || String(task.id || '') !== nextActionId)
      .map(task => ({ task, due: new Date(task.dueAt) }))
      .filter(entry => !Number.isNaN(entry.due.getTime()))
      .sort((a, b) => a.due - b.due)[0];
    if (!item) return null;

    const status = dealCardNextActionStatus({ nextAction: item.task });
    if (!status) return null;
    const timingIndex = status.label.indexOf(' · ');
    const timing = timingIndex >= 0 ? status.label.slice(timingIndex) : '';
    status.label = (item.task.title || 'Automation task') +
      (item.due < new Date() ? ' overdue' : ' due') + timing;
    status.automationTaskId = item.task.id;
    status.dataOpenFocus = true;
    return status;
  }

  function dealCardWarningStatus(d, meetingStatus) {
    if (d.quoteExpired) {
      const expiry = d.quoteExpiryAt ? new Date(d.quoteExpiryAt) : null;
      const expiryQuote = dealLatestQuoteForExpiry(d);
      const suffix = expiry && !Number.isNaN(expiry.getTime())
        ? ' · ' + expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : '';
      return {
        type: 'quote-expired', label: 'Quote expired' + suffix, icon: '&#xf017;',
        quoteNo: expiryQuote ? expiryQuote.no : '', quoteHistoryKind: 'overdue'
      };
    }

    // A scheduled Meeting is already the Deal's next follow-up. Only surface the inactivity
    // warning when no active Meeting exists; Quote warnings remain independent of Meetings.
    if (!meetingStatus && !d.qualifiedContact && d.d > STALE_DAYS) {
      return { type: 'overdue', label: 'Follow-up overdue · ' + d.d + ' days', icon: '&#xf06a;' };
    }

    if (d.quoteExpiryAt) {
      const expiry = new Date(d.quoteExpiryAt);
      const expiryQuote = dealLatestQuoteForExpiry(d);
      const daysUntilExpiry = (expiry.getTime() - Date.now()) / 86400000;
      if (!Number.isNaN(expiry.getTime()) && daysUntilExpiry >= 0 && daysUntilExpiry <= 14) {
        return {
          type: 'quote-expiring', label: 'Quote expires · ' + expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
          icon: '&#xf017;', quoteNo: expiryQuote ? expiryQuote.no : '', quoteHistoryKind: 'expiring'
        };
      }
    }

    if (!meetingStatus && !d.qualifiedContact && d.d > FOLLOWUP_DAYS) {
      return { type: 'followup', label: 'Follow-up needed · ' + d.d + ' days', icon: '&#xf071;' };
    }
    return null;
  }

  function dealCardOverdueItems(d) {
    const now = new Date();
    const activeMeetings = (d.meetings || []).filter(meeting =>
      meeting && meeting.date && meeting.time && meeting.status !== 'completed' && meeting.status !== 'cancelled'
    );
    const meetingItems = activeMeetings.map(meeting => ({
      meeting,
      start: new Date(meeting.date + 'T' + meeting.time + ':00')
    })).filter(item => !Number.isNaN(item.start.getTime()) && item.start < now)
      .map(item => ({
        kind: 'meeting', type: 'meeting-overdue', label: 'Meeting overdue', icon: '&#xf073;',
        meetingId: item.meeting.id, tooltipCategory: 'Meeting',
        tooltipTitle: item.meeting.title || 'Meeting',
        tooltipMeta: item.start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + ', ' + item.meeting.time
      }));

    const noteItems = (d.notes || []).filter(note =>
      note && !note.deletedAt && note.followUpAt && note.followUpStatus !== 'completed'
    ).map(note => ({ note, due: new Date(note.followUpAt) }))
      .filter(item => !Number.isNaN(item.due.getTime()) && item.due < now)
      .map(item => ({
        kind: 'note', type: 'note-overdue', label: 'Note overdue', icon: '&#xf249;',
        focusNoteId: item.note.id, tooltipCategory: 'Note',
        tooltipTitle: item.note.title || 'Note',
        tooltipMeta: 'Due ' + item.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      }));

    const fileRequestItems = (d.fileRequests || []).filter(request =>
      request && request.status !== 'received' && request.status !== 'cancelled' && request.dueAt
    ).map(request => ({ request, due: new Date(request.dueAt) }))
      .filter(item => !Number.isNaN(item.due.getTime()) && item.due < now)
      .map(item => ({
        kind: 'file-request', type: 'file-request-overdue', label: 'Required file overdue', icon: '&#xf56f;',
        dataOpenFocus: true, tooltipCategory: 'Required file',
        tooltipTitle: item.request.title || 'Requested file',
        tooltipMeta: 'Due ' + item.due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      }));

    const expiredQuotes = (DEAL_QUOTES[d.t] || []).filter(quote =>
      quote && quote.status === 'sent' && !quote.alternativeLost &&
      quoteExpiryTimestamp(quote) > 0 && quoteExpiryTimestamp(quote) < now.getTime()
    );
    const quoteItems = expiredQuotes.length
      ? expiredQuotes.map(quote => ({
          kind: 'quote', type: 'quote-expired', label: 'Quote expired', icon: '&#xf017;',
          quoteNo: quote.no, quoteHistoryKind: 'overdue', tooltipCategory: 'Quote',
          tooltipTitle: 'Quote #' + quote.no,
          tooltipMeta: 'Expired ' + new Date(quoteExpiryTimestamp(quote)).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        }))
      : d.quoteExpired
        ? [{
            kind: 'quote', type: 'quote-expired', label: 'Quote expired', icon: '&#xf017;', dataOpenFocus: true,
            tooltipCategory: 'Quote', tooltipTitle: 'Latest Quote', tooltipMeta: 'Expired'
          }]
        : [];

    return [...meetingItems, ...noteItems, ...fileRequestItems, ...quoteItems];
  }

  function dealCardOverdueSummary(items) {
    if (!items.length) return null;
    if (items.length === 1) return items[0];

    const kinds = new Set(items.map(item => item.kind));
    const kind = kinds.size === 1 ? items[0].kind : 'mixed';
    const suffix = {
      meeting: 'meetings overdue',
      note: 'notes overdue',
      quote: 'quotes expired',
      'file-request': 'required files overdue',
      mixed: 'items overdue'
    }[kind];
    return {
      type: 'overdue-summary',
      label: items.length + ' ' + suffix,
      count: items.length,
      labelRest: suffix,
      icon: '&#xf017;',
      tooltipItems: items
    };
  }

  function dealCardBillingActionStatus(d) {
    const total = Math.max(0, Number(d.v) || 0);
    if (!total) return null;

    const invoices = DEAL_BILLING[d.t] || [];
    const issuedInvoices = invoices.filter(ddInvoiceIsIssued);
    const issued = issuedInvoices.reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
    const paid = invoices.reduce((sum, invoice) => sum + (Number(invoice.paid) || 0), 0);
    if (issued >= total && paid >= total) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const unpaidIssued = issuedInvoices
      .filter(invoice => (Number(invoice.total) || 0) > (Number(invoice.paid) || 0))
      .map(invoice => ({ ...invoice, dueDate: invoice.due ? new Date(invoice.due + 'T00:00:00') : null }))
      .sort((a, b) => (a.dueDate ? a.dueDate.getTime() : Infinity) - (b.dueDate ? b.dueDate.getTime() : Infinity));
    const overdueInvoice = unpaidIssued.find(invoice => invoice.dueDate && invoice.dueDate < today);
    if (overdueInvoice) {
      const days = Math.max(1, Math.floor((today - overdueInvoice.dueDate) / 86400000));
      return {
        type: 'payment-overdue',
        label: 'Payment overdue · ' + days + (days === 1 ? ' day' : ' days'),
        icon: '&#xf017;'
      };
    }

    const nextPayment = unpaidIssued.find(invoice => invoice.dueDate);
    if (nextPayment) {
      return {
        type: 'payment-due',
        label: 'Payment due · ' + nextPayment.dueDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        icon: '&#xf017;'
      };
    }

    if (invoices.some(invoice => invoice.status === 'draft')) {
      return { type: 'invoice-action', label: 'Action required · Send invoice', icon: '&#xf571;' };
    }

    if (issued < total) {
      const due = d.invoiceActionDue ? new Date(d.invoiceActionDue + 'T00:00:00') : null;
      return {
        type: 'invoice-action',
        label: 'Action required · Create invoice' +
          (due ? ' · ' + due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : ''),
        icon: '&#xf571;'
      };
    }

    return null;
  }

  function dealCardStatus(d) {
    const stage = CRM_STAGE_DEFS[d.s] || {};
    if (d.s < 0) return null;
    if (stage.outcome === 'won') return dealCardBillingActionStatus(d);
    if (stage.outcome) return null;

    const overdue = dealCardOverdueSummary(dealCardOverdueItems(d));
    if (overdue) return overdue;

    const fileRequest = dealCardFileRequestStatus(d);
    if (fileRequest) return fileRequest;

    const nextAction = dealCardNextActionStatus(d);
    if (nextAction) return nextAction;

    const qualifiedContact = dealCardQualifiedContactStatus(d);
    if (qualifiedContact) return qualifiedContact;

    const meetingStatus = dealCardMeetingStatus(d);
    const warningStatus = dealCardWarningStatus(d, meetingStatus);
    const noteFollowUpStatus = dealCardNoteFollowUpStatus(d);
    return warningStatus || noteFollowUpStatus || meetingStatus;
  }

  function dealCardStatuses(d) {
    const candidates = [
      dealCardStatus(d),
      dealCardAutomationTaskStatus(d),
      dealCardNextActionStatus(d),
      dealCardMeetingStatus(d),
      dealCardNoteFollowUpStatus(d)
    ].filter(Boolean);
    const seen = new Set();
    return candidates.filter(status => {
      const key = status.automationTaskId
        ? 'task:' + status.automationTaskId
        : status.meetingId
          ? 'meeting:' + status.meetingId
          : status.focusNoteId
            ? 'note:' + status.focusNoteId
            : status.type + ':' + status.label;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 4);
  }

  function hideDealStatusTooltip() {
    if (!dealStatusTooltip) return;
    dealStatusTooltip.hidden = true;
    dealStatusTooltip.style.display = 'none';
    dealStatusTooltip.setAttribute('aria-hidden', 'true');
  }

  function ensureDealStatusTooltip() {
    if (!dealStatusTooltip) {
      dealStatusTooltip = document.createElement('div');
      dealStatusTooltip.id = 'dealStatusTooltip';
      dealStatusTooltip.className = 'deal-status-tooltip';
      dealStatusTooltip.setAttribute('role', 'tooltip');
      dealStatusTooltip.setAttribute('aria-hidden', 'true');
      dealStatusTooltip.hidden = true;
      dealStatusTooltip.style.display = 'none';
      document.body.appendChild(dealStatusTooltip);
    }
    return dealStatusTooltip;
  }

  function showDealStatusTooltip(anchor, items) {
    if (!anchor || !items || !items.length) return;
    ensureDealStatusTooltip();
    const shownItems = items.slice(0, 3);
    dealStatusTooltip.innerHTML =
      '<div class="deal-status-tooltip-title">Overdue items</div>' +
      shownItems.map(item =>
        '<div class="deal-status-tooltip-item">' +
          '<div class="deal-status-tooltip-copy"><span>' + archiveEscape(item.tooltipCategory || 'Item') + '</span>' +
          '<strong>' + archiveEscape(item.tooltipTitle || item.label || '') + '</strong></div>' +
          '<small>' + archiveEscape(item.tooltipMeta || '') + '</small>' +
        '</div>'
      ).join('') +
      (items.length > shownItems.length
        ? '<div class="deal-status-tooltip-more">+' + (items.length - shownItems.length) + ' more</div>'
        : '');
    dealStatusTooltip.hidden = false;
    dealStatusTooltip.style.display = 'block';
    dealStatusTooltip.setAttribute('aria-hidden', 'false');
    const rect = anchor.getBoundingClientRect();
    const tooltipRect = dealStatusTooltip.getBoundingClientRect();
    const gutter = 8;
    let left = Math.min(rect.left, window.innerWidth - tooltipRect.width - gutter);
    left = Math.max(gutter, left);
    let top = rect.bottom + gutter;
    if (top + tooltipRect.height > window.innerHeight - gutter) top = rect.top - tooltipRect.height - gutter;
    dealStatusTooltip.style.left = left + 'px';
    dealStatusTooltip.style.top = Math.max(gutter, top) + 'px';
  }

  function dealStatusTooltipText(items) {
    if (!items || !items.length) return '';
    return ['Overdue items', ...items.slice(0, 3).map(item =>
      (item.tooltipCategory || 'Item') + ' · ' + (item.tooltipTitle || item.label || '') +
      (item.tooltipMeta ? ' · ' + item.tooltipMeta : '')
    )].join('\n');
  }

  function dealBillingMini(d) {
    const stage = CRM_STAGE_DEFS[d.s];
    if (!stage || stage.outcome !== 'won') return '';

    const total = Math.max(0, Number(d.v) || 0);
    if (!total) return '';
    const invoices = DEAL_BILLING[d.t] || [];
    const issued = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);
    const paidRaw = invoices.reduce((sum, invoice) => sum + (Number(invoice.paid) || 0), 0);
    const draftsRaw = invoices.filter(invoice => invoice.status === 'draft').reduce((sum, invoice) => sum + (Number(invoice.total) || 0), 0);

    const paid = Math.min(total, paidRaw);
    const unpaid = Math.min(Math.max(0, total - paid), Math.max(0, issued - paidRaw));
    const draft = Math.min(Math.max(0, total - paid - unpaid), draftsRaw);
    const notInvoiced = Math.max(0, total - paid - unpaid - draft);
    const remainingToInvoice = Math.max(0, total - Math.min(total, issued));

    const parts = [
      { label: 'Paid', cls: 'paid', amount: paid },
      { label: 'Invoiced · unpaid', cls: 'unpaid', amount: unpaid },
      { label: 'Draft', cls: 'draft', amount: draft },
      { label: 'Not invoiced', cls: 'not-invoiced', amount: notInvoiced }
    ].filter(part => part.amount > 0);
    const tooltip = parts.map(part => {
      const percent = Math.round((part.amount / total) * 100);
      return part.label + ' ' + fmt(part.amount) + ' · ' + percent + '%';
    }).join('; ');
    const tooltipRows = parts.map(part => {
      const percent = ((part.amount / total) * 100).toFixed(1);
      return '<span class="deal-billing-tooltip-row ' + part.cls + '">' +
        '<span class="deal-billing-tooltip-dot" aria-hidden="true"></span>' +
        '<span class="deal-billing-tooltip-label">' + archiveEscape(part.label) + '</span>' +
        '<strong>' + fmt(part.amount) + '</strong>' +
        '<span class="deal-billing-tooltip-percent">(' + percent + '%)</span>' +
      '</span>';
    }).join('');
    const segments = parts.map(part =>
      '<span class="deal-billing-mini-segment ' + part.cls + '" style="width:' + ((part.amount / total) * 100).toFixed(3) + '%"></span>'
    ).join('');
    let action = 'Paid in full';
    let actionClass = 'paid';
    if (remainingToInvoice > 0) {
      action = fmt(remainingToInvoice) + ' to invoice';
      actionClass = 'to-invoice';
    } else if (unpaid > 0) {
      action = fmt(unpaid) + ' payment outstanding';
      actionClass = 'outstanding';
    }

    return '<div class="deal-billing-mini ' + actionClass + '" tabindex="0" aria-label="Billing breakdown: ' + archiveEscape(tooltip) + '">' +
      '<span class="deal-billing-mini-track" aria-hidden="true">' + segments + '</span>' +
      '<span class="deal-billing-mini-copy">' + archiveEscape(action) + '</span>' +
      '<span class="deal-billing-tooltip" aria-hidden="true">' +
        '<span class="deal-billing-tooltip-head"><strong>Billing</strong><span>' + fmt(total) + '</span></span>' +
        '<span class="deal-billing-tooltip-list">' + tooltipRows + '</span>' +
      '</span>' +
    '</div>';
  }

  function dealQuoteViewSummary(deal, now = Date.now()) {
    const sentQuotes = (DEAL_QUOTES[deal.t] || []).filter(quote => {
      if (!quote || quote.alternativeLost || quote.status !== 'sent') return false;
      const expiry = quoteExpiryTimestamp(quote);
      return !expiry || expiry >= now;
    });
    if (!sentQuotes.length) return '';
    const viewedQuotes = sentQuotes.filter(quote => quote.viewedAt);
    const total = sentQuotes.length;
    const viewed = viewedQuotes.length;
    const label = total === 1
      ? (viewed ? 'Quote viewed' : 'Quote not viewed')
      : viewed + '/' + total + ' sent Quotes viewed';
    const rows = sentQuotes.map(quote => {
      const viewedLabel = quote.viewedAt
        ? 'Viewed · ' + new Date(quote.viewedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
        : 'Not viewed';
      return '<span class="deal-quote-view-row ' + (quote.viewedAt ? 'viewed' : 'unviewed') + '"><i class="fai">' + (quote.viewedAt ? '&#xf06e;' : '&#xf070;') + '</i><b>Q-' + archiveEscape(quote.no) + '</b><em>' + archiveEscape(viewedLabel) + '</em></span>';
    }).join('');
    return '<button type="button" class="deal-quote-view-summary ' + (viewed === total ? 'all-viewed' : (viewed ? 'part-viewed' : 'none-viewed')) + '" aria-label="' + archiveEscape(label) + '. Open related Quotes.">' +
      '<span class="deal-quote-view-label"><i class="fai">&#xf06e;</i><strong>' + archiveEscape(label) + '</strong></span>' +
      '<span class="deal-quote-view-tooltip" aria-hidden="true"><span class="deal-quote-view-tooltip-head"><strong>Customer engagement</strong><small>Sent, active Quotes only</small></span>' + rows + '</span>' +
    '</button>';
  }

  function makeDealCard(d) {
    const card = document.createElement('div');
    const statuses = dealCardStatuses(d);
    card.className = 'deal-card' + (statuses.length ? ' alert-state' : '') + (d.d > STALE_DAYS ? ' stale' : '');
    card.draggable = true;
    card.dataset.v = d.v;
    const statusHtml = statuses.map(status =>
      '<button type="button" class="deal-status2 ' + status.type + '"' +
        (status.meetingId ? ' data-meeting-id="' + status.meetingId + '"' : '') +
        (status.focusNoteId ? ' data-focus-note="' + status.focusNoteId + '"' : '') +
        (status.quoteNo ? ' data-quote-no="' + archiveEscape(status.quoteNo) + '"' : '') +
        (status.quoteHistoryKind ? ' data-quote-history-kind="' + status.quoteHistoryKind + '"' : '') +
        (status.dataOpenFocus ? ' data-open-focus="true"' : '') +
        (status.tooltipItems ? ' title="' + archiveEscape(dealStatusTooltipText(status.tooltipItems)) + '"' : '') +
        ' aria-label="' + (status.tooltipItems ? 'Show details for ' : 'Open ') + archiveEscape(status.label) + '">' +
        '<i class="fai">' + (status.icon || '&#xf017;') + '</i> ' +
        (status.count
          ? '<strong class="deal-status-count">' + status.count + '</strong><span>' + archiveEscape(status.labelRest) + '</span>'
          : '<span>' + archiveEscape(status.label) + '</span>') + '</button>'
    ).join('');
    const titleContent = statuses.length
      ? '<div class="deal-title-status"><div class="deal-title">' + d.t + '</div>' +
          '<div class="deal-status-stack">' + statusHtml + '</div></div>'
      : '<div class="deal-title">' + d.t + '</div>';
    const titleHtml = '<div class="deal-card-titleline">' + titleContent + '</div>';
    const party = d.org || d.c;
    const contactHtml = d.contact && d.contact !== party ? '<div class="deal-contact">' + d.contact + '</div>' : '';
    const margin = d.margin != null ? fmt(d.margin) : '—';
    const ownerName = d.ownerName || CRM_OWNER_NAMES[d.o] || d.o;
    const billingMiniHtml = dealBillingMini(d);
    const quoteViewHtml = dealQuoteViewSummary(d);
    card.innerHTML =
      titleHtml +
      '<div class="deal-company-line"><span class="owning-company-badge"><i class="fai">&#xf1ad;</i>' + archiveEscape(owningCompanyName(d, true)) + '</span><span>Owning Company</span></div>' +
      quoteViewHtml +
      '<div class="deal-party"><div class="deal-org">' + party + '</div>' + contactHtml + '</div>' +
      '<div class="deal-foot">' +
        '<div class="deal-metrics">' +
          '<div class="deal-metric-row"><span class="deal-metric-label">Deal Value</span><span class="deal-metric-value deal-value">' + fmt(d.v) + '</span></div>' +
          '<div class="deal-metric-row margin"><span class="deal-metric-label">Margin value</span><span class="deal-metric-value deal-margin-value">' + margin + '</span></div>' +
        '</div>' +
        '<span class="right">' +
          '<span class="deal-av" tabindex="0" role="img" aria-label="Owner: ' + ownerName + '" data-tooltip="Owner: ' + ownerName + '">' + d.o + '</span>' +
        '</span>' +
      '</div>' +
      billingMiniHtml;
    card._deal = d;
    card.addEventListener('click', () => openDealPage(d, card));
    const quoteViewButton = card.querySelector('.deal-quote-view-summary');
    if (quoteViewButton) quoteViewButton.addEventListener('click', event => {
      event.stopPropagation();
      openDealPage(d, card);
      requestAnimationFrame(() => {
        if (typeof openQuoteListOverlay === 'function') openQuoteListOverlay();
      });
    });
    card.querySelectorAll('.deal-status2').forEach(statusButton => {
      if (status.tooltipItems && status.tooltipItems.length) {
        ensureDealStatusTooltip();
        const fallbackTitle = statusButton.getAttribute('title') || '';
        const revealTooltip = () => {
          statusButton.removeAttribute('title');
          showDealStatusTooltip(statusButton, status.tooltipItems);
        };
        const concealTooltip = () => {
          hideDealStatusTooltip();
          if (fallbackTitle) statusButton.setAttribute('title', fallbackTitle);
        };
        statusButton.setAttribute('aria-describedby', 'dealStatusTooltip');
        statusButton.addEventListener('pointerenter', revealTooltip);
        statusButton.addEventListener('pointerleave', concealTooltip);
        statusButton.addEventListener('mouseenter', revealTooltip);
        statusButton.addEventListener('mouseleave', concealTooltip);
        statusButton.addEventListener('focus', revealTooltip);
        statusButton.addEventListener('blur', concealTooltip);
      }
      statusButton.addEventListener('click', event => {
        event.stopPropagation();
        if (status.tooltipItems && status.tooltipItems.length) {
          hideDealStatusTooltip();
          openDealPage(d, card);
          requestAnimationFrame(() => requestAnimationFrame(focusDealOverdueItems));
          return;
        }
        hideDealStatusTooltip();
        openDealPage(d, card);
        if (statusButton.dataset.openFocus) {
          requestAnimationFrame(() => document.getElementById('dd-focus').scrollIntoView({ block: 'center', behavior: 'smooth' }));
          return;
        }
        const focusNoteId = statusButton.dataset.focusNote;
        if (focusNoteId) {
          viewNoteHistory(focusNoteId);
          return;
        }
        const quoteNo = statusButton.dataset.quoteNo;
        if (quoteNo) {
          setDealTab('note');
          setDealHistoryFilter('all');
          requestAnimationFrame(() => {
            const historyKind = statusButton.dataset.quoteHistoryKind || 'overdue';
            const quoteActivity = document.querySelector('[data-quote-activity="' + historyKind + '-' + quoteNo + '"]');
            if (quoteActivity) {
              quoteActivity.scrollIntoView({ block: 'center', behavior: 'smooth' });
              quoteActivity.focus({ preventScroll: true });
            }
          });
          return;
        }
        const meetingId = Number(statusButton.dataset.meetingId);
        if (!meetingId) return;
        setDealTab('meeting');
        requestAnimationFrame(() => {
          const focusMeeting = document.querySelector('[data-focus-meeting="' + meetingId + '"]');
          if (focusMeeting) {
            focusMeeting.scrollIntoView({ block: 'center', behavior: 'smooth' });
            focusMeeting.focus({ preventScroll: true });
          }
        });
      });
    });
    return card;
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('.deal-status2.overdue-summary')) hideDealStatusTooltip();
  });

  function refreshPipelineDealCard(deal) {
    const current = findPipelineCardForDeal(deal);
    if (!current) return null;
    const fresh = makeDealCard(deal);
    current.replaceWith(fresh);
    if (ddCard === current) ddCard = fresh;
    recalcPipeline();
    return fresh;
  }

  let dealContextCard = null;

  function dealActionMenuMarkup(deal, handlerName) {
    if (!deal) return '';
    const stage = CRM_STAGE_DEFS[deal.s] || {};
    const outcome = stage.outcome || '';
    const action = name => handlerName + "('" + name + "')";
    const buttons = [];

    if (deal.archived) {
      buttons.push('<button type="button" role="menuitem" onclick="' + action('restore') + '"><i class="fai">&#xf2ea;</i> Restore Deal</button>');
    } else {
      if (outcome) {
        buttons.push('<button type="button" role="menuitem" onclick="' + action('reopen') + '"><i class="fai">&#xf2ea;</i> Reopen Deal</button>');
      } else {
        if (deal.quoteExpired) buttons.push('<button type="button" role="menuitem" onclick="' + action('revise-expired') + '"><i class="fai">&#xf1ea;</i> Revise &amp; Resend Quote</button>');
        buttons.push('<button type="button" role="menuitem" onclick="' + action('won') + '"><i class="fai">&#xf521;</i> Mark as Won</button>');
        buttons.push('<button type="button" role="menuitem" onclick="' + action('lost') + '"><i class="fai">&#xf057;</i> Mark as Lost</button>');
      }
      buttons.push('<div class="deal-context-menu-divider" role="separator"></div>');
      buttons.push('<button type="button" role="menuitem" onclick="' + action('archive') + '"><i class="fai">&#xf187;</i> Archive Deal</button>');
    }

    buttons.push('<div class="deal-context-menu-divider" role="separator"></div>');
    buttons.push('<button type="button" class="danger" role="menuitem" onclick="' + action('delete') + '"><i class="fai">&#xf2ed;</i> Delete Deal</button>');
    return buttons.join('');
  }

  function closeDealContextMenu() {
    const menu = document.getElementById('dealContextMenu');
    if (menu) menu.classList.remove('open');
    dealContextCard = null;
  }

  function openDealContextMenu(event, card) {
    const menu = document.getElementById('dealContextMenu');
    if (!menu || !card || !card._deal) return;
    closeDdKebab();
    dealContextCard = card;
    menu.innerHTML = dealActionMenuMarkup(card._deal, 'dealContextAction');
    menu.style.left = '0px';
    menu.style.top = '0px';
    menu.classList.add('open');
    const rect = menu.getBoundingClientRect();
    const gap = 8;
    const left = Math.max(gap, Math.min(event.clientX, window.innerWidth - rect.width - gap));
    const top = Math.max(gap, Math.min(event.clientY, window.innerHeight - rect.height - gap));
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    const first = menu.querySelector('button');
    if (first) first.focus({ preventScroll: true });
  }

  pipelineEl.addEventListener('contextmenu', event => {
    const card = event.target.closest('.deal-card');
    if (!card || !pipelineEl.contains(card)) return;
    event.preventDefault();
    event.stopPropagation();
    openDealContextMenu(event, card);
  });

  function closePipelineFilterMenu() {
    const menu = document.getElementById('pipelineFilterMenu');
    const button = document.getElementById('pipelineFilterButton');
    if (menu) menu.classList.remove('open');
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function pipelineFilterActiveCount() {
    return (pipelineFilters.myWork ? 1 : 0) + (pipelineFilters.owner !== 'all' ? 1 : 0) +
      pipelineFilters.attention.size + pipelineFilters.activity.size;
  }

  function pipelineDealOwnerName(deal) {
    return deal.ownerName || CRM_OWNER_NAMES[deal.o] || deal.o || 'Unassigned';
  }

  function syncPipelineFilterOwnerOptions() {
    const select = document.getElementById('pipelineOwnerFilter');
    if (!select) return;
    const names = [...new Set(CRM_DEALS.filter(deal => !deal.archived).map(pipelineDealOwnerName))]
      .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    select.innerHTML = '<option value="all">All owners</option><option value="me">Me · ' + archiveEscape(CRM_CURRENT_USER) + '</option>' +
      names.filter(name => name !== CRM_CURRENT_USER).map(name => '<option value="' + archiveEscape(name) + '">' + archiveEscape(name) + '</option>').join('') +
      '<option value="Unassigned">Unassigned</option>';
    if (![...select.options].some(option => option.value === pipelineFilters.owner)) pipelineFilters.owner = 'all';
    select.value = pipelineFilters.owner;
  }

  function pipelineActiveMeetings(deal) {
    return (deal.meetings || []).filter(meeting => meeting && meeting.date && meeting.time && meeting.status !== 'completed' && meeting.status !== 'cancelled');
  }

  function pipelineActiveNoteFollowUps(deal) {
    return (deal.notes || []).filter(note => note && !note.deletedAt && note.followUpAt && note.followUpStatus !== 'completed');
  }

  function pipelineActiveFileRequests(deal) {
    return (deal.fileRequests || []).filter(request =>
      request && request.status !== 'received' && request.status !== 'cancelled' && request.dueAt
    );
  }

  function pipelineDealActivityTypes(deal) {
    const types = new Set();
    if (pipelineActiveMeetings(deal).length) types.add('meeting');
    if (pipelineActiveNoteFollowUps(deal).length) types.add('note');
    if (pipelineActiveFileRequests(deal).length) types.add('file');
    if (dealLatestQuoteExpiry(deal) || deal.quoteExpired) types.add('quote');
    return types;
  }

  function pipelineDealDeadlines(deal) {
    const deadlines = [];
    pipelineActiveMeetings(deal).forEach(meeting => {
      const timestamp = Date.parse(meeting.date + 'T' + meeting.time + ':00');
      if (!Number.isNaN(timestamp)) deadlines.push(timestamp);
    });
    pipelineActiveNoteFollowUps(deal).forEach(note => {
      const timestamp = Date.parse(note.followUpAt);
      if (!Number.isNaN(timestamp)) deadlines.push(timestamp);
    });
    pipelineActiveFileRequests(deal).forEach(request => {
      const timestamp = Date.parse(request.dueAt);
      if (!Number.isNaN(timestamp)) deadlines.push(timestamp);
    });
    const quoteExpiry = dealLatestQuoteExpiry(deal);
    if (quoteExpiry) deadlines.push(quoteExpiry);
    return deadlines;
  }

  function pipelineDealIsMyWork(deal) {
    const assignedNote = pipelineActiveNoteFollowUps(deal).some(note =>
      note.assignedTo === CRM_CURRENT_USER || (!note.assignedTo && (note.mentions || []).includes(CRM_CURRENT_USER))
    );
    const assignedMeeting = pipelineActiveMeetings(deal).some(meeting =>
      meeting.assignedTo === CRM_CURRENT_USER || meeting.owner === CRM_CURRENT_USER || meeting.createdBy === CRM_CURRENT_USER ||
      (meeting.attendees || []).includes(CRM_CURRENT_USER)
    );
    const ownerIsMe = pipelineDealOwnerName(deal) === CRM_CURRENT_USER;
    const assignedQuote = ownerIsMe && Boolean(dealLatestQuoteExpiry(deal) || deal.quoteExpired);
    const assignedStaleFollowUp = ownerIsMe && deal.d > FOLLOWUP_DAYS && !pipelineActiveMeetings(deal).length;
    const assignedFileRequest = pipelineActiveFileRequests(deal).some(request =>
      request.assignedTo === CRM_CURRENT_USER || (!request.assignedTo && ownerIsMe)
    );
    return assignedNote || assignedMeeting || assignedQuote || assignedStaleFollowUp || assignedFileRequest;
  }

  function pipelineDealMatchesAttention(deal, key) {
    const deadlines = pipelineDealDeadlines(deal);
    const now = new Date();
    const today = localIsoDate(now);
    if (key === 'none') return deadlines.length === 0;
    if (key === 'overdue') {
      const status = dealCardStatus(deal);
      return Boolean(status && ['meeting-overdue', 'note-overdue', 'file-request-overdue', 'quote-expired', 'overdue', 'overdue-summary'].includes(status.type));
    }
    if (key === 'today') return deadlines.some(timestamp => localIsoDate(new Date(timestamp)) === today);
    if (key === 'week') {
      const start = now.getTime();
      const end = start + 7 * 86400000;
      return deadlines.some(timestamp => timestamp >= start && timestamp <= end);
    }
    return true;
  }

  function dealMatchesPipelineFilters(deal) {
    if (!owningCompanyMatches(deal)) return false;
    if (pipelineFilters.myWork && !pipelineDealIsMyWork(deal)) return false;
    if (pipelineFilters.owner !== 'all') {
      const expectedOwner = pipelineFilters.owner === 'me' ? CRM_CURRENT_USER : pipelineFilters.owner;
      if (pipelineDealOwnerName(deal) !== expectedOwner) return false;
    }
    if (pipelineFilters.attention.size && ![...pipelineFilters.attention].some(key => pipelineDealMatchesAttention(deal, key))) return false;
    if (pipelineFilters.activity.size) {
      const types = pipelineDealActivityTypes(deal);
      if (![...pipelineFilters.activity].some(type => types.has(type))) return false;
    }
    return true;
  }

  function updatePipelineFilterUi(matchingCount) {
    const count = pipelineFilterActiveCount();
    const button = document.getElementById('pipelineFilterButton');
    const badge = document.getElementById('pipelineFilterBadge');
    const myWork = document.getElementById('pipelineMyWork');
    if (button) button.classList.toggle('has-active', count > 0);
    if (badge) { badge.hidden = count === 0; badge.textContent = String(count); }
    if (myWork) myWork.setAttribute('aria-pressed', pipelineFilters.myWork ? 'true' : 'false');
    const result = document.getElementById('pipelineFilterResult');
    if (result && matchingCount != null) result.textContent = matchingCount + ' matching ' + (matchingCount === 1 ? 'deal' : 'deals');
  }

  function syncPipelineFilterCardVisibility() {
    let matchingCount = 0;
    pipelineEl.querySelectorAll('.deal-card').forEach(card => {
      const matches = dealMatchesPipelineFilters(card._deal);
      card.hidden = !matches;
      if (matches) matchingCount += 1;
    });
    updatePipelineFilterUi(matchingCount);
    return matchingCount;
  }

  function clearPipelineFilters() {
    pipelineFilters.myWork = false;
    pipelineFilters.owner = 'all';
    pipelineFilters.attention.clear();
    pipelineFilters.activity.clear();
    const owner = document.getElementById('pipelineOwnerFilter');
    if (owner) owner.value = 'all';
    document.querySelectorAll('#pipelineFilterMenu input[type="checkbox"]').forEach(input => { input.checked = false; });
    recalcPipeline();
  }

  document.getElementById('pipelineFilterButton').addEventListener('click', event => {
    event.stopPropagation();
    const menu = document.getElementById('pipelineFilterMenu');
    const open = !menu.classList.contains('open');
    closePipelineSelector();
    closePipelineSortMenu();
    menu.classList.toggle('open', open);
    event.currentTarget.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) document.getElementById('pipelineMyWork').focus();
  });

  document.getElementById('pipelineMyWork').addEventListener('click', () => {
    pipelineFilters.myWork = !pipelineFilters.myWork;
    recalcPipeline();
  });
  document.getElementById('pipelineOwnerFilter').addEventListener('change', event => {
    pipelineFilters.owner = event.target.value;
    recalcPipeline();
  });
  document.querySelectorAll('#pipelineAttentionFilters input').forEach(input => input.addEventListener('change', () => {
    if (input.checked) pipelineFilters.attention.add(input.value); else pipelineFilters.attention.delete(input.value);
    recalcPipeline();
  }));
  document.querySelectorAll('#pipelineActivityFilters input').forEach(input => input.addEventListener('change', () => {
    if (input.checked) pipelineFilters.activity.add(input.value); else pipelineFilters.activity.delete(input.value);
    recalcPipeline();
  }));
  document.getElementById('pipelineFilterClear').addEventListener('click', clearPipelineFilters);
  document.getElementById('pipelineFilterDone').addEventListener('click', closePipelineFilterMenu);
  syncPipelineFilterOwnerOptions();

  function closePipelineSortMenu() {
    document.getElementById('pipelineSortMenu').classList.remove('open');
    document.getElementById('pipelineSortButton').setAttribute('aria-expanded', 'false');
  }

  function applyPipelineSort() {
    const comparators = {
      default: (a, b) => CRM_DEALS.indexOf(a._deal) - CRM_DEALS.indexOf(b._deal),
      'margin-desc': (a, b) => (+b._deal.margin || 0) - (+a._deal.margin || 0),
      'value-desc': (a, b) => (+b._deal.v || 0) - (+a._deal.v || 0),
      alpha: (a, b) => String(a._deal.t || '').localeCompare(String(b._deal.t || ''), 'en', { sensitivity: 'base' })
    };
    const comparator = comparators[pipelineSortMode] || comparators.default;
    pipelineEl.querySelectorAll('.stage-body').forEach(body => {
      [...body.querySelectorAll('.deal-card')].sort(comparator).forEach(card => body.appendChild(card));
    });
    document.querySelectorAll('#pipelineSortMenu .pipeline-sort-option').forEach(option => {
      const selected = option.dataset.sort === pipelineSortMode;
      option.classList.toggle('selected', selected);
      option.setAttribute('aria-checked', selected ? 'true' : 'false');
    });
  }

  document.getElementById('pipelineSortButton').addEventListener('click', e => {
    e.stopPropagation();
    const menu = document.getElementById('pipelineSortMenu');
    const open = !menu.classList.contains('open');
    closePipelineSelector();
    closePipelineFilterMenu();
    menu.classList.toggle('open', open);
    e.currentTarget.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) menu.querySelector('.pipeline-sort-option.selected').focus();
  });

  document.getElementById('pipelineSortMenu').addEventListener('click', e => {
    const option = e.target.closest('.pipeline-sort-option');
    if (!option) return;
    pipelineSortMode = option.dataset.sort;
    applyPipelineSort();
    closePipelineSortMenu();
    const labels = { default: 'Default order', 'margin-desc': 'Highest margin value', 'value-desc': 'Highest deal value', alpha: 'Alphabetical order' };
    qtShowSnackbar('Deals sorted by ' + labels[pipelineSortMode] + '.');
  });

  function quoteExpiryTimestamp(quote) {
    if (!quote || !quote.expiresAt) return 0;
    const timestamp = Date.parse(quote.expiresAt + 'T23:59:59');
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  function dealLatestQuoteExpiry(deal) {
    const quote = dealLatestQuoteForExpiry(deal);
    return quote ? quoteExpiryTimestamp(quote) : 0;
  }

  function dealLatestQuoteForExpiry(deal) {
    const quotes = (DEAL_QUOTES[deal.t] || [])
      .filter(quote => quote.status === 'sent' && !quote.alternativeLost)
      .filter(quote => quoteExpiryTimestamp(quote))
      .sort((a, b) => quoteExpiryTimestamp(b) - quoteExpiryTimestamp(a));
    return quotes[0] || null;
  }

  function dealHasAcceptedQuoteForExpiry(deal) {
    return (DEAL_QUOTES[deal.t] || []).some(quote =>
      !quote.alternativeLost && (quote.status === 'accepted' || quote.status === 'complete' ||
        (quote.revisions || []).some(revision => revision.status === 'accepted'))
    );
  }

  function applyDealExpiryOutcomes(now = Date.now()) {
    let changed = false;

    CRM_DEALS.forEach(deal => {
      if (deal.archived) return;
      const stage = CRM_STAGE_DEFS[deal.s] || {};
      if (stage.outcome === 'won') return;

      const latestExpiry = dealLatestQuoteExpiry(deal);
      if (latestExpiry) deal.quoteExpiryAt = new Date(latestExpiry).toISOString();
      else delete deal.quoteExpiryAt;

      const quoteExpired = latestExpiry > 0 && latestExpiry < now && !dealHasAcceptedQuoteForExpiry(deal);
      if (Boolean(deal.quoteExpired) !== quoteExpired) changed = true;
      deal.quoteExpired = quoteExpired;
      delete deal.expiredAt;
      delete deal.previousOpenStage;
    });

    return changed;
  }

  function recalcPipeline() {
    // The board must not depend on an expiry-state change to create its Stage columns.
    // Stored CRM state can already contain the latest expiry flags on reload.
    if (!pipelineEl.querySelector('.stage') && CRM_STAGE_DEFS.length) {
      rebuildPipelineColumns();
      return;
    }
    const expiryChanged = applyDealExpiryOutcomes();
    const lifecycleChanged = syncDealStagesFromQuoteLifecycle();
    if (expiryChanged || lifecycleChanged) {
      saveActivePipelineState();
      rebuildPipelineColumns();
      return;
    }
    const matchingCount = syncPipelineFilterCardVisibility();
    let total = 0, totalMargin = 0, count = 0;
    pipelineEl.querySelectorAll('.stage').forEach(stage => {
      const cards = stage.querySelectorAll('.deal-card:not([hidden])');
      // Treat a filtered Stage with no visible cards as empty as well. The summary
      // already reports the visible card count, so its empty-state action should
      // follow that same source of truth.
      stage.classList.toggle('is-empty', cards.length === 0);
      let sum = 0, stageMargin = 0;
      cards.forEach(c => {
        sum += +c.dataset.v;
        stageMargin += +(c._deal.margin || 0);
      });
      stage.querySelector('.stage-summary-deal').textContent = fmt(sum) + '.00';
      stage.querySelector('.stage-summary-margin').textContent = fmt(stageMargin) + '.00';
      stage.querySelector('.stage-summary-count').textContent = cards.length + (cards.length === 1 ? ' deal' : ' deals');
      totalMargin += stageMargin;
      total += sum; count += cards.length;
    });
    const allCount = pipelineEl.querySelectorAll('.deal-card').length;
    document.getElementById('crmSummary').innerHTML =
      '<span class="crm-summary-count"><b>' + count + '</b>' + (pipelineFilterActiveCount() ? ' of <b>' + allCount + '</b>' : '') + ' Deals</span>' +
      '<span>Total Value: <b>' + fmt(total) + '</b></span>' +
      '<span class="crm-summary-margin">Total Margin: <b>' + fmt(totalMargin) + '</b></span>';
    updatePipelineFilterUi(matchingCount);
    applyPipelineSort();
    if (crmSubview === 'table') renderCrmTable();
    if (crmSubview === 'forecast') renderCrmForecast();
    if (crmSubview === 'crmforecast') renderCrmForecastV2();
  }
  recalcPipeline();

  let dragDeal = null;
  let dragOrigin = null;
  let pendingWonMove = null;
  let pendingDealMove = null;
  let pendingLostMove = null;
  let pendingRequiredTasksAction = null;
  const pipelineDragActions = document.getElementById('pipelineDragActions');

  const LOST_REASON_LABELS = {
    price: 'Price or budget',
    competitor: 'Chose another supplier',
    cancelled: 'Project cancelled',
    postponed: 'Project postponed',
    'no-response': 'No response from customer',
    requirements: 'Requirements changed',
    other: 'Other'
  };

  function requiredTaskDueLabel(value) {
    const due = value ? new Date(value) : null;
    if (!due || Number.isNaN(due.getTime())) return '';
    return due.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  function requiredTaskIcon(type) {
    if (type === 'file-request') return '&#xf15c;';
    if (type === 'meeting') return '&#xf073;';
    if (type === 'note') return '&#xf249;';
    return '&#xf0ae;';
  }

  function requiredTaskTypeLabel(type) {
    if (type === 'file-request') return 'File request';
    if (type === 'meeting') return 'Meeting';
    if (type === 'note') return 'Follow-up Note';
    if (type === 'site-readiness') return 'Required task';
    return 'Task';
  }

  function currentRequiredTaskItems() {
    if (!pendingRequiredTasksAction || typeof pendingRequiredTasksAction.getRequirements !== 'function') return [];
    try {
      return pendingRequiredTasksAction.getRequirements() || [];
    } catch (error) {
      console.warn('Unable to refresh required tasks', error);
      return pendingRequiredTasksAction.requirements || [];
    }
  }

  function renderRequiredTasksDialog() {
    if (!pendingRequiredTasksAction) return;
    const items = currentRequiredTaskItems();
    pendingRequiredTasksAction.requirements = items;
    const list = document.getElementById('requiredTasksList');
    const complete = document.getElementById('requiredTasksComplete');
    const continueButton = document.getElementById('requiredTasksContinue');
    const count = document.getElementById('requiredTasksCount');
    const destination = document.getElementById('requiredTasksDestination');

    count.textContent = items.length + ' required task' + (items.length === 1 ? '' : 's') + ' remaining';
    destination.textContent = pendingRequiredTasksAction.destination || '';
    continueButton.textContent = pendingRequiredTasksAction.actionLabel || 'Continue';
    continueButton.disabled = items.length > 0;
    complete.hidden = items.length > 0;
    list.hidden = items.length === 0;
    list.innerHTML = items.map(function (item, index) {
      const due = requiredTaskDueLabel(item.dueAt);
      const meta = [requiredTaskTypeLabel(item.linkedType), item.owner ? 'Assigned to ' + item.owner : '', due ? 'Due ' + due : '']
        .filter(Boolean).join(' · ');
      let action = '';
      if (item.canUpload) {
        action = '<label class="cs-btn primary required-task-upload"><i class="fai">&#xf093;</i> Upload file' +
          '<input type="file" multiple onchange="uploadRequiredTaskFile(' + index + ', this)"></label>';
      } else if (item.canComplete) {
        action = '<button type="button" class="cs-btn primary" onclick="completeRequiredTask(' + index + ')">' +
          '<i class="fai">&#xf00c;</i> Mark complete</button>';
      } else {
        action = '<button type="button" class="cs-btn ghost" onclick="reviewRequiredTasksInDeal()">Review task</button>';
      }
      return '<div class="required-task-item">' +
        '<span class="required-task-type"><i class="fai">' + requiredTaskIcon(item.linkedType) + '</i></span>' +
        '<div class="required-task-main"><span class="required-task-source">' + archiveEscape(item.sourceLabel || 'Required checkpoint') + '</span>' +
        '<span class="required-task-title">' + archiveEscape(item.title || 'Required task') + '</span>' +
        '<div class="required-task-meta">' + archiveEscape(meta) + '</div></div>' +
        '<div class="required-task-actions">' + action + '</div></div>';
    }).join('');
  }

  function openRequiredTasksDialog(deal, requirementsProvider, options = {}) {
    if (!deal || typeof requirementsProvider !== 'function') return false;
    const requirements = requirementsProvider() || [];
    if (!requirements.length) return false;
    pendingRequiredTasksAction = {
      deal: deal,
      getRequirements: requirementsProvider,
      requirements: requirements,
      onContinue: options.onContinue,
      actionLabel: options.actionLabel || 'Continue',
      destination: options.destination || '',
      focusId: options.focusId || ''
    };
    document.getElementById('requiredTasksKicker').textContent = options.kicker || 'REQUIRED BEFORE CONTINUING';
    document.getElementById('requiredTasksTitle').textContent = options.title || 'Have you completed the required tasks?';
    document.getElementById('requiredTasksCopy').textContent = options.copy ||
      'Complete every item below before this Deal can continue. You can finish the work here or review it in the Deal.';
    renderRequiredTasksDialog();
    document.getElementById('requiredTasksOverlay').classList.add('open');
    return true;
  }

  function closeRequiredTasksDialog() {
    document.getElementById('requiredTasksOverlay').classList.remove('open');
    pendingRequiredTasksAction = null;
  }

  function completeRequiredTask(index) {
    if (!pendingRequiredTasksAction || !window.WeQuoteAutomation || typeof window.WeQuoteAutomation.completeRequiredItem !== 'function') return;
    const item = pendingRequiredTasksAction.requirements[index];
    if (!item) return;
    window.WeQuoteAutomation.completeRequiredItem(item.linkedType, item.linkedId, pendingRequiredTasksAction.deal);
    saveActivePipelineState();
    renderRequiredTasksDialog();
  }

  function uploadRequiredTaskFile(index, input) {
    if (!pendingRequiredTasksAction || !window.WeQuoteAutomation || typeof window.WeQuoteAutomation.uploadRequestedFiles !== 'function') return;
    const item = pendingRequiredTasksAction.requirements[index];
    if (!item) return;
    window.WeQuoteAutomation.uploadRequestedFiles(item.linkedId, input, pendingRequiredTasksAction.deal);
    saveActivePipelineState();
    renderRequiredTasksDialog();
  }

  function reviewRequiredTasksInDeal() {
    if (!pendingRequiredTasksAction) return;
    const deal = pendingRequiredTasksAction.deal;
    document.getElementById('requiredTasksOverlay').classList.remove('open');
    pendingRequiredTasksAction = null;
    openDealPage(deal, findPipelineCardForDeal(deal));
    requestAnimationFrame(function () {
      const focus = document.getElementById('dd-focus');
      if (focus) focus.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  function continueRequiredTasksAction() {
    if (!pendingRequiredTasksAction || currentRequiredTaskItems().length) return;
    const onContinue = pendingRequiredTasksAction.onContinue;
    document.getElementById('requiredTasksOverlay').classList.remove('open');
    pendingRequiredTasksAction = null;
    if (typeof onContinue === 'function') setTimeout(onContinue, 0);
  }

  function setPipelineDragActions(open) {
    pipelineEl.classList.toggle('drag-actions-open', open);
    pipelineDragActions.classList.toggle('open', open);
    pipelineDragActions.setAttribute('aria-hidden', open ? 'false' : 'true');
    pipelineMinimap.classList.toggle('suppressed', open);
    if (!open) pipelineDragActions.querySelectorAll('.is-over').forEach(el => el.classList.remove('is-over'));
  }

  function clearPipelineDealDropFeedback() {
    pipelineEl.querySelectorAll('.stage.dynamic-deal-drop-target').forEach(stage => {
      stage.classList.remove('dynamic-deal-drop-target');
    });
    pipelineEl.querySelectorAll('.dynamic-deal-insertion-marker').forEach(marker => marker.remove());
    pipelineEl.querySelectorAll('.deal-card.dynamic-deal-dragging').forEach(card => {
      card.classList.remove('dynamic-deal-dragging');
    });
  }

  function finishPipelineDrag() {
    if (dragDeal) dragDeal.classList.remove('dragging');
    clearPipelineDealDropFeedback();
    setPipelineDragActions(false);
    dragDeal = null;
    dragOrigin = null;
  }

  function restoreDraggedDeal(card) {
    if (!card || !dragOrigin) return;
    const { body, next } = dragOrigin;
    if (next && next.parentNode === body) body.insertBefore(card, next);
    else body.appendChild(card);
  }

  function syncPipelineDealOrderFromDom() {
    const orderedDeals = [...pipelineEl.querySelectorAll('.stage-body .deal-card')]
      .map(card => card._deal)
      .filter(Boolean);
    if (orderedDeals.length !== CRM_DEALS.length) return;
    CRM_DEALS.splice(0, CRM_DEALS.length, ...orderedDeals);
  }

  function syncLostReasonForm() {
    const select = document.getElementById('lostReasonSelect');
    const note = document.getElementById('lostReasonNote');
    const error = document.getElementById('lostReasonError');
    const requiresDetails = select.value === 'other';
    document.getElementById('lostReasonNoteRequirement').textContent = requiresDetails ? '(required)' : '(optional)';
    select.classList.remove('invalid');
    note.classList.remove('invalid');
    error.hidden = true;
  }

  function openLostReasonDialog(card) {
    if (!card || !card._deal) return false;
    if (document.getElementById('dealMoveOverlay').classList.contains('open')) closeDealMoveDialog();
    const deal = card._deal;
    const select = document.getElementById('lostReasonSelect');
    const note = document.getElementById('lostReasonNote');
    pendingLostMove = { card, deal };
    document.getElementById('lostReasonTitle').textContent = 'Mark ' + deal.t + ' as Lost?';
    document.getElementById('lostReasonCopy').textContent = 'Choose why this Deal was lost. This helps Sales understand the outcome and improve future follow-up.';
    select.value = LOST_REASON_LABELS[deal.lostReasonCode] ? deal.lostReasonCode : '';
    note.value = deal.lostReasonNote || '';
    syncLostReasonForm();
    document.getElementById('lostReasonOverlay').classList.add('open');
    requestAnimationFrame(() => select.focus());
    return true;
  }

  function closeLostReasonDialog() {
    document.getElementById('lostReasonOverlay').classList.remove('open');
    pendingLostMove = null;
    syncLostReasonForm();
  }

  function confirmLostReasonDialog() {
    if (!pendingLostMove) return;
    const select = document.getElementById('lostReasonSelect');
    const note = document.getElementById('lostReasonNote');
    const error = document.getElementById('lostReasonError');
    const reasonCode = select.value;
    const details = note.value.trim();
    if (!LOST_REASON_LABELS[reasonCode]) {
      select.classList.add('invalid');
      error.textContent = 'Choose a reason before marking this Deal as Lost.';
      error.hidden = false;
      select.focus();
      return;
    }
    if (reasonCode === 'other' && !details) {
      note.classList.add('invalid');
      error.textContent = 'Add some details when the reason is Other.';
      error.hidden = false;
      note.focus();
      return;
    }

    const { card, deal } = pendingLostMove;
    const reasonLabel = LOST_REASON_LABELS[reasonCode];
    deal.lostReasonCode = reasonCode;
    deal.lostReasonNote = details;
    deal.lostReason = reasonLabel + (details ? ': ' + details : '');
    deal.lostAt = new Date().toISOString();
    document.getElementById('lostReasonOverlay').classList.remove('open');
    pendingLostMove = null;
    if (!commitDealMove(card, stageIndexByOutcome('lost'), { skipLostReason: true })) return;
    saveActivePipelineState();
    if (ddDeal === deal) openDealPage(deal, ddCard);
    qtShowSnackbar('Deal marked as Lost · ' + reasonLabel + '.', 'success');
  }

  function commitDealMove(card, stageIdx, options = {}) {
    if (!card || stageIdx < 0 || stageIdx >= CRM_STAGE_DEFS.length) return false;
    const d = card._deal;
    const sourceStageIndex = d.s;
    const targetBody = pipelineEl.querySelectorAll('.stage-body')[stageIdx];
    const droppedInTargetBody = card.parentNode === targetBody;
    const lostIndex = stageIndexByOutcome('lost');
    const targetDefinition = CRM_STAGE_DEFS[stageIdx] || {};
    if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.getDealMoveRequirements === 'function') {
      const getMoveRequirements = function () {
        return window.WeQuoteAutomation.getDealMoveRequirements(d, targetDefinition, options);
      };
      const moveRequirements = getMoveRequirements();
      if (moveRequirements.length) {
        const sourceDefinition = CRM_STAGE_DEFS[sourceStageIndex] || {};
        const isQuoteBoundary = pipelineUsesQuoteLifecycle(getActivePipeline()) && targetDefinition.protected && !targetDefinition.outcome;
        const actionLabel = isQuoteBoundary && targetDefinition.name === 'In Progress'
          ? 'Create first Quote'
          : isQuoteBoundary ? 'Review Quote' : 'Continue to ' + targetDefinition.name;
        openRequiredTasksDialog(d, getMoveRequirements, {
          kicker: isQuoteBoundary ? 'QUOTE LIFECYCLE CHECKPOINT' : 'CUSTOM STAGE REQUIREMENT',
          title: 'Have you completed the required tasks?',
          copy: 'This Deal has required work in ' + (sourceDefinition.name || 'its current Stage') + '. Complete every item below before continuing to ' + targetDefinition.name + '.',
          destination: (sourceDefinition.name || 'Current Stage') + ' → ' + targetDefinition.name,
          actionLabel: actionLabel,
          onContinue: function () {
            const currentCard = findPipelineCardForDeal(d) || card;
            if (isQuoteBoundary) {
              if (document.getElementById('dealMoveOverlay').classList.contains('open')) closeDealMoveDialog();
              openDealPage(d, currentCard);
              if (targetDefinition.name === 'In Progress') ddCreateQuote();
              else {
                openQuoteListOverlay();
                qtShowSnackbar('Update the related Quote to continue to ' + targetDefinition.name + '.', 'success');
              }
              return;
            }
            if (commitDealMove(currentCard, stageIdx, options)) {
              if (document.getElementById('dealMoveOverlay').classList.contains('open')) closeDealMoveDialog();
              saveActivePipelineState();
              qtShowSnackbar(d.t + ' moved to ' + targetDefinition.name + '.', 'success');
            }
          }
        });
        if (ddDeal === d && typeof ddRenderFocus === 'function') ddRenderFocus();
        return false;
      }
    }
    if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.getDealMoveBlock === 'function') {
      const automationBlock = window.WeQuoteAutomation.getDealMoveBlock(d, targetDefinition, options);
      if (automationBlock) {
        qtShowSnackbar(automationBlock, 'blocked');
        if (ddDeal === d && typeof ddRenderFocus === 'function') ddRenderFocus();
        return false;
      }
    }
    if (pipelineUsesQuoteLifecycle(getActivePipeline()) && dealQuoteLifecycleReady && !options.systemDerived && !targetDefinition.outcome) {
      const lifecycle = derivedDealLifecycle(d);
      const derivedIndex = CRM_STAGE_DEFS.findIndex(stage => stage.name === lifecycle.stageName);
      const targetMatchesSegment = !targetDefinition.protected && targetDefinition.lifecycleSegment === lifecycle.stageName;
      const targetIsCurrentMilestone = targetDefinition.protected && derivedIndex === stageIdx;
      if (!targetMatchesSegment && !targetIsCurrentMilestone) {
        qtShowSnackbar(targetDefinition.protected
          ? 'This protected milestone is driven by linked Quote status. Update the Quote to move this Deal to ' + targetDefinition.name + '.'
          : targetDefinition.name + ' belongs to ' + lifecycleSegmentLabel(targetDefinition.lifecycleSegment || 'Qualified') + '. This Deal is currently in the ' + lifecycle.stageName + ' lifecycle segment.');
        return false;
      }
    }
    if (stageIdx === lostIndex && d.s !== lostIndex && !options.skipLostReason) {
      openLostReasonDialog(card);
      return false;
    }
    const sourceStage = CRM_STAGE_DEFS[d.s] || {};
    const targetStage = CRM_STAGE_DEFS[stageIdx] || {};
    const wasWon = sourceStage.outcome === 'won';
    if (targetStage.outcome && !sourceStage.outcome) d.previousOpenStage = d.s;
    d.s = stageIdx;
    if (!wasWon && targetStage.outcome === 'won') {
      d.wonAt = ddWonTimestamp();
    }
    const fresh = makeDealCard(d);
    const isOpenDealCard = card === ddCard;
    card.replaceWith(fresh);
    // Dragover has already placed the card at its intended insertion point.
    // Keep that position; programmatic stage moves still append to the target.
    if (!droppedInTargetBody) targetBody.appendChild(fresh);
    if (isOpenDealCard) ddCard = fresh;
    syncPipelineDealOrderFromDom();
    recalcPipeline();
    if (sourceStageIndex !== stageIdx && window.WeQuoteAutomation) {
      window.WeQuoteAutomation.emit('deal.stage.changed', {
        deal: d,
        pipeline: getActivePipeline(),
        fromStage: sourceStage,
        toStage: targetStage,
        fromStageIndex: sourceStageIndex,
        toStageIndex: stageIdx
      });
    }
    return true;
  }

  function dealHasAcceptedQuote(d) {
    const quotes = DEAL_QUOTES[d.t] || [];
    return quotes.some(q => qIsWon(q));
  }

  function requestWonMove(card) {
    const d = card._deal;
    const quotes = DEAL_QUOTES[d.t] || [];
    if (dealHasAcceptedQuote(d)) {
      const moved = commitDealMove(card, stageIndexByOutcome('won'));
      if (moved && window.WeQuoteAutomation) {
        window.WeQuoteAutomation.emit('quote.accepted', { deal: d, quote: quotes.find(q => qIsWon(q)) });
      }
      return moved;
    }
    if (!quotes.length) {
      qtShowSnackbar('This deal has no linked Quotes. Create or link a Quote before marking it Won.');
      return false;
    }
    openWonQuotePicker(card, d, quotes);
    return false;
  }

  function openDealMoveDialog(card) {
    if (!card || !card._deal) return;
    pendingDealMove = { card, deal: card._deal };
    document.getElementById('dealMoveTitle').textContent = 'Move ' + card._deal.t;
    const select = document.getElementById('dealMoveStage');
    select.innerHTML = CRM_STAGE_DEFS.map((stage, index) =>
      '<option value="' + index + '">' + stage.name + '</option>'
    ).join('');
    select.value = String(card._deal.s);
    document.getElementById('dealMoveOverlay').classList.add('open');
    requestAnimationFrame(() => select.focus());
  }

  function closeDealMoveDialog() {
    document.getElementById('dealMoveOverlay').classList.remove('open');
    pendingDealMove = null;
  }

  function confirmDealMoveDialog() {
    if (!pendingDealMove) return;
    const { card, deal } = pendingDealMove;
    const target = Number(document.getElementById('dealMoveStage').value);
    if (!Number.isInteger(target) || !CRM_STAGE_DEFS[target]) return;
    if (target === deal.s) {
      closeDealMoveDialog();
      qtShowSnackbar(deal.t + ' is already in ' + CRM_STAGE_DEFS[target].name + '.');
      return;
    }
    if (target === stageIndexByOutcome('won')) {
      closeDealMoveDialog();
      requestWonMove(card);
      return;
    }
    if (commitDealMove(card, target)) {
      const stageName = CRM_STAGE_DEFS[target].name;
      closeDealMoveDialog();
      qtShowSnackbar(deal.t + ' moved to ' + stageName + '.', 'success');
    }
  }

  function wonQuoteRowHtml(q, qi, groupSelected, selectable = true) {
    const selected = pendingWonMove.selected.has(qi);
    const blocked = !!q.alternativeGroupId && groupSelected != null && groupSelected !== qi;
    const status = QUOTE_STATUS_LABEL[q.status] || q.status;
    const dot = QUOTE_STATUS_DOT[q.status] || 'draft';
    return '<div class="won-quote-row' + (selectable && selected ? ' selected' : '') + (blocked ? ' blocked' : '') + (!selectable ? ' fixed' : '') + '"' +
      (selectable ? ' onclick="toggleWonQuote(' + qi + ')"' : '') +
      (blocked ? ' aria-disabled="true"' : '') + '>' +
        (selectable ? '<button type="button" class="won-quote-check" tabindex="-1" aria-label="' + (selected ? 'Deselect' : 'Select') + ' Quote ' + q.no + '"' + (blocked ? ' disabled' : '') + '>' +
          (selected ? '<i class="fai">&#xf00c;</i>' : '') +
        '</button>' : '') +
        '<div class="won-quote-copy"><span class="won-quote-no">Quote #' + q.no + '</span><span class="won-quote-desc">' + (q.desc || 'Untitled') + '</span></div>' +
        '<span class="won-quote-status"><span class="sq ' + dot + '"></span>' + status + '</span>' +
        '<span class="won-quote-value">' + fmt(qCurrentRev(q).value) + '</span>' +
      '</div>';
  }

  function renderWonQuotePicker() {
    if (!pendingWonMove) return;
    const quotes = pendingWonMove.quotes;
    const buckets = qAlternativeBuckets(quotes);
    const isSingleQuote = quotes.length === 1;
    let html = '';

    if (isSingleQuote) {
      html = '<section class="won-quote-section">' + wonQuoteRowHtml(quotes[0], 0, null, false) + '</section>';
    } else buckets.groups.forEach((members, groupId) => {
      const groupSelected = members.find(({ qi }) => pendingWonMove.selected.has(qi));
      const groupNumber = String(groupId).replace(/^ALT-/i, '');
      html += '<section class="won-quote-section"><div class="won-quote-section-head">' +
        '<span class="won-quote-section-title alt"><i class="fai">&#xf247;</i> Alternative group ' + groupNumber + '</span>' +
        '<span class="won-quote-section-note">Choose one proposal</span></div>' +
        members.map(({ q, qi }) => wonQuoteRowHtml(q, qi, groupSelected ? groupSelected.qi : null)).join('') +
      '</section>';
    });

    if (!isSingleQuote && buckets.independent.length) {
      html += '<section class="won-quote-section"><div class="won-quote-section-head">' +
        '<span class="won-quote-section-title"><i class="fai">&#xf0c8;</i> Independent quotes</span>' +
        '<span class="won-quote-section-note">Select any that were accepted</span></div>' +
        buckets.independent.map(({ q, qi }) => wonQuoteRowHtml(q, qi, null)).join('') +
      '</section>';
    }

    document.getElementById('wonQuoteList').innerHTML = html || '<div class="won-quote-empty">There are no Quotes available to accept.</div>';
    const count = pendingWonMove.selected.size;
    document.getElementById('wonQuoteCount').textContent = isSingleQuote ? '1 Quote will be accepted' : count + ' selected';
    const confirm = document.getElementById('wonQuoteConfirm');
    confirm.textContent = isSingleQuote ? 'Accept Quote & mark Won' : 'Accept selected & mark Won';
    confirm.disabled = count === 0;
  }

  function openWonQuotePicker(card, d, quotes) {
    const isSingleQuote = quotes.length === 1;
    pendingWonMove = { card, d, quotes, selected: new Set(isSingleQuote ? [0] : []) };
    document.getElementById('wonQuoteTitle').textContent = isSingleQuote
      ? 'Accept Quote #' + quotes[0].no + ' and mark ' + d.t + ' as Won?'
      : 'Which quotes were accepted for ' + d.t + '?';
    document.getElementById('wonQuoteSub').textContent = isSingleQuote
      ? 'This Quote will become the signed-off baseline for this Deal.'
      : 'Choose one Quote from each alternatives group, then select any independent Quotes that also form part of this win.';
    renderWonQuotePicker();
    document.getElementById('wonQuoteOverlay').classList.add('open');
  }

  function toggleWonQuote(qi) {
    if (!pendingWonMove) return;
    const q = pendingWonMove.quotes[qi];
    if (!q) return;
    if (pendingWonMove.selected.has(qi)) {
      pendingWonMove.selected.delete(qi);
    } else {
      if (q.alternativeGroupId) {
        const siblingSelected = pendingWonMove.quotes.some((member, index) =>
          member.alternativeGroupId === q.alternativeGroupId && pendingWonMove.selected.has(index)
        );
        if (siblingSelected) return;
      }
      pendingWonMove.selected.add(qi);
    }
    renderWonQuotePicker();
  }

  function closeWonQuotePicker() {
    document.getElementById('wonQuoteOverlay').classList.remove('open');
    pendingWonMove = null;
  }

  function confirmWonQuotePicker() {
    if (!pendingWonMove || !pendingWonMove.selected.size) return;
    const { card, quotes, selected } = pendingWonMove;
    const acceptedQuote = quotes[[...selected][0]];
    const isOpenDealPage = currentView === 'deal' && card === ddCard;
    [...selected].forEach(qi => {
      const q = quotes[qi], rev = qCurrentRev(q);
      q.status = 'accepted';
      rev.status = 'accepted';
      rev.acceptSeq = ++qtAcceptSeq;
      q.acceptedRev = qLatestAcceptedRev(q).n;
      q.alternativeLost = false;
      qtApplyAlternativeWinner(quotes, qi);
    });
    document.getElementById('wonQuoteOverlay').classList.remove('open');
    pendingWonMove = null;
    commitDealMove(card, stageIndexByOutcome('won'));
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('quote.accepted', { deal: card._deal, quote: acceptedQuote });
    if (isOpenDealPage) openDealPage(card._deal, ddCard);
    qtShowSnackbar(selected.size + ' Quote' + (selected.size === 1 ? '' : 's') + ' accepted. Deal moved to Won.', 'success');
  }

  function runPipelineDragAction(action, card) {
    if (!card) return;
    restoreDraggedDeal(card);
    if (action === 'archive') {
      card._deal.archived = true;
      card.remove();
      recalcPipeline();
      qtShowSnackbar('Deal archived.', 'success');
      return;
    }
    if (action === 'lost') {
      if (!commitDealMove(card, stageIndexByOutcome('lost'))) restoreDraggedDeal(card);
      return;
    }
    if (action === 'won') {
      requestWonMove(card);
      return;
    }
    if (action === 'move') {
      openDealMoveDialog(card);
    }
  }

  pipelineEl.addEventListener('dragstart', e => {
    const card = e.target.closest('.deal-card');
    if (!card) return;
    dragDeal = card;
    dragOrigin = { body: card.parentNode, next: card.nextSibling };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card._deal.t);
    setPipelineDragActions(true);
    requestAnimationFrame(() => { if (dragDeal === card) card.classList.add('dragging'); });
  });
  pipelineEl.addEventListener('dragend', finishPipelineDrag);
  pipelineEl.addEventListener('dragover', e => {
    if (!dragDeal) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetStage = e.target.closest('.stage');
    pipelineEl.querySelectorAll('.stage.dynamic-deal-drop-target').forEach(stage => {
      if (stage !== targetStage) stage.classList.remove('dynamic-deal-drop-target');
    });
    if (targetStage) targetStage.classList.add('dynamic-deal-drop-target');
    const body = e.target.closest('.stage-body');
    if (!body) return;
    const card = e.target.closest('.deal-card');
    if (card && card !== dragDeal) {
      const r = card.getBoundingClientRect();
      body.insertBefore(dragDeal, e.clientY > r.top + r.height / 2 ? card.nextSibling : card);
    } else if (!card) {
      const remainingCards = [...body.querySelectorAll('.deal-card')].filter(item => item !== dragDeal);
      const before = remainingCards.find(item => {
        const r = item.getBoundingClientRect();
        return e.clientY < r.top + r.height / 2;
      });
      body.insertBefore(dragDeal, before || null);
    }
  });

  function pipelineDropStageIndex(event, card) {
    // The card is moved between stage bodies during dragover. Dropping on a
    // header, whitespace or a column edge does not move it first, so the card's
    // current parent can still be its source stage. Always trust the actual
    // drop target before falling back to the card's DOM position.
    const dropStage = event.target && event.target.closest ? event.target.closest('.stage') : null;
    const fallbackStage = card && card.closest ? card.closest('.stage') : null;
    const stage = dropStage && pipelineEl.contains(dropStage) ? dropStage : fallbackStage;
    const stageIdx = stage ? Number(stage.dataset.stage) : -1;
    return Number.isInteger(stageIdx) && CRM_STAGE_DEFS[stageIdx] ? stageIdx : -1;
  }

  pipelineEl.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragDeal) return;
    const card = dragDeal;
    const stageIdx = pipelineDropStageIndex(e, card);
    if (stageIdx < 0) {
      restoreDraggedDeal(card);
      finishPipelineDrag();
      return;
    }
    if (stageIdx === stageIndexByOutcome('won') && !dealHasAcceptedQuote(card._deal)) {
      restoreDraggedDeal(card);
      requestWonMove(card);
      finishPipelineDrag();
      return;
    }
    if (!commitDealMove(card, stageIdx)) restoreDraggedDeal(card);
    // commitDealMove replaces the dragged DOM node, so its native dragend may
    // never reach the pipeline. Close the transient drop targets explicitly.
    finishPipelineDrag();
  });

  pipelineDragActions.querySelectorAll('.pipeline-drag-action').forEach(button => {
    button.addEventListener('dragenter', e => { if (dragDeal) { e.preventDefault(); button.classList.add('is-over'); } });
    button.addEventListener('dragleave', () => button.classList.remove('is-over'));
    button.addEventListener('dragover', e => {
      if (!dragDeal) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    });
    button.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      button.classList.remove('is-over');
      const card = dragDeal;
      runPipelineDragAction(button.dataset.dragAction, card);
      finishPipelineDrag();
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.getElementById('requiredTasksOverlay').classList.contains('open')) {
      closeRequiredTasksDialog();
      return;
    }
    if (e.key === 'Escape' && document.getElementById('dealMoveOverlay').classList.contains('open')) {
      closeDealMoveDialog();
      return;
    }
    if (e.key === 'Escape' && dragDeal) finishPipelineDrag();
  });
  window.addEventListener('blur', () => { if (dragDeal) finishPipelineDrag(); });

  // ---------- Deal details page (Figma DS – WeQuote Platform, node 2578-91244) ----------
  // Progression stages are derived from their outcome flag so reordering or adding stages
  // never makes the Deal detail page mistake a column position for Won/Lost.
  const OWNER_NAMES = CRM_OWNER_NAMES;
  const CURRENT_USER = CRM_CURRENT_USER;
  // Source enum per PRD §8; contact person for organisation customers (persons contact = the customer).
  const DEAL_SOURCES = {
    'Theater Upgrades': 'Referral', '2231 Quail Bluff Ct': 'Website', 'Window Treatments': 'Word of mouth',
    'Garden Light/Tree Mount': 'Social', 'IP Camera Upgrades': 'Contractor', 'New Pool TV': 'Phone-in',
    '1 Burning Tree Lutron Sunnata': 'Designer', '20436 Rocha Chica Drive v2': 'Referral',
    'Harland WeHo Theater': 'Contractor', 'New Motorized Drapery Track': 'Word of mouth',
    'Meeting Room AV Fit-out': 'Exhibition', 'Private Cinema Room': 'Designer',
    'Office AV Refresh': 'Website', 'Backyard Cinema Deck': 'Social'
  };
  const ORG_CUSTOMERS = { '1 Burning Tree': 'Marcus Reed', 'DPP9 Owner LLC': 'Priya Shah' };

  let ddDeal = null, ddCard = null;
  let ddMeetingProvider = '';
  let ddMeetingEditProvider = 'google';
  let ddMeetingEditingId = null;
  let ddMeetingSummaryEditingId = null;
  let ddMeetingIntegrationRequest = null;
  let ddMeetingPendingRemoveId = null;
  let ddMeetingActionMenuId = null;
  let ddNoteMentionRange = null;
  let ddNoteMentionReplaceLength = 0;
  let ddNoteReplyingId = null;
  let ddNoteReactionPickerId = null;
  let ddNoteActionMenuId = null;
  let ddNoteEditingId = null;
  let ddNotePickerMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let ddNotePickerDate = '';
  let ddNotePickerTime = '09:00';
  let ddMeetingDraftAttendees = [];
  let leadMeetingProvider = '';
  let leadMeetingDraftAttendees = [];
  let ddHistoryFilter = 'all';
  let ddEmailProvider = 'gmail';
  let ddWatcherAdding = false;
  let ddWatcherQuery = '';
  let ddContactTab = 'primary';
  let ddContactEditing = '';

  const DD_MEETING_PROVIDERS = {
    google: { label: 'Google Meet', short: 'G', className: 'google', host: 'meet.google.com', description: 'Generate a Google Meet link' },
    teams: { label: 'Microsoft Teams', short: 'T', className: 'teams', host: 'teams.microsoft.com', description: 'Generate a Teams meeting link' },
    zoom: { label: 'Zoom', short: 'Z', className: 'zoom', host: 'zoom.us', description: 'Generate a Zoom meeting link' }
  };
  const DD_MEETING_CONNECTIONS = { google: true, teams: false, zoom: false };
  const DD_MEETING_ACCOUNT = 'lee.roche@wequote.demo';
  const DD_EMAIL_PROVIDERS = {
    gmail: { label: 'Gmail', short: 'G', className: 'gmail', account: 'lee.roche@gmail.com', description: 'Google Workspace or Gmail' },
    outlook: { label: 'Microsoft Outlook', short: 'O', className: 'outlook', account: 'lee.roche@wequote.co.uk', description: 'Microsoft 365 or Outlook' },
    other: { label: 'Other email', short: '@', className: 'other-email', account: 'sales@wequote.demo', description: 'Secure IMAP / SMTP' }
  };
  const DD_EMAIL_CONNECTIONS = { gmail: true, outlook: false, other: false };

  const ddInitials = n => n.split(/\s+/).map(w => w[0]).join('').toLowerCase();
  const ddEmail = n => ddInitials(n) + '@demo.com';
  // Stable pseudo-number per contact so the page doesn't reshuffle between visits
  function ddPhone(n) {
    let h = 0;
    for (let i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 10000000;
    return '+44 (0) 7' + String(h).padStart(9, '0').slice(0, 9);
  }

  function ddContactValues(tab) {
    if (!ddDeal) return { contact: '', email: '', phone: '' };
    if (tab === 'secondary') {
      return {
        contact: ddDeal.secondaryContact || '',
        email: ddDeal.secondaryEmail || '',
        phone: ddDeal.secondaryPhone || ''
      };
    }
    const contact = ddDeal.contact || ORG_CUSTOMERS[ddDeal.c] || ddDeal.c || '';
    return {
      contact,
      email: ddDeal.email || (contact ? ddEmail(contact) : ''),
      phone: ddDeal.phone || (contact ? ddPhone(contact) : '')
    };
  }

  function ddRenderContactDetails() {
    if (!ddDeal) return;
    const values = ddContactValues(ddContactTab);
    ['contact', 'email', 'phone'].forEach(field => {
      const slot = document.getElementById('dd-' + field);
      if (slot) slot.textContent = values[field] || '—';
    });
  }

  function ddContactEditorParts(field) {
    return {
      row: document.querySelector('.dd-contact-row[data-contact-field="' + field + '"]'),
      slot: document.getElementById('dd-' + field),
      editor: document.getElementById('dd-' + field + '-editor'),
      input: document.getElementById('dd-' + field + '-input')
    };
  }

  function ddStartContactEdit(field, event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !['contact', 'email', 'phone'].includes(field)) return;
    if (ddContactEditing && ddContactEditing !== field) ddCancelContactEdit();
    const parts = ddContactEditorParts(field);
    if (!parts.row || !parts.slot || !parts.editor || !parts.input) return;
    const values = ddContactValues(ddContactTab);
    ddContactEditing = field;
    parts.input.value = values[field] || '';
    parts.input.removeAttribute('aria-invalid');
    parts.slot.hidden = true;
    parts.editor.hidden = false;
    parts.row.classList.add('is-editing');
    parts.input.focus();
    parts.input.select();
  }

  function ddHandleContactRowKeydown(event, field) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    ddStartContactEdit(field, event);
  }

  function ddHandleContactInputKeydown(event, field) {
    if (event.key === 'Enter') {
      event.preventDefault();
      ddSaveContactInline(event, field);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      ddCancelContactEdit(event);
    }
  }

  function ddHandleContactBlur(event, field) {
    const parts = ddContactEditorParts(field);
    if (event.relatedTarget && parts.editor && parts.editor.contains(event.relatedTarget)) return;
    window.setTimeout(() => {
      if (ddContactEditing === field && document.activeElement !== parts.input) ddSaveContactInline(null, field);
    }, 0);
  }

  function ddSaveContactInline(event, field) {
    if (event) event.stopPropagation();
    if (!ddDeal || ddContactEditing !== field) return;
    const parts = ddContactEditorParts(field);
    const value = parts.input.value.trim();
    if (field === 'contact' && ddContactTab === 'primary' && !value) {
      parts.input.setAttribute('aria-invalid', 'true');
      parts.input.focus();
      return;
    }
    const secondaryKey = { contact: 'secondaryContact', email: 'secondaryEmail', phone: 'secondaryPhone' }[field];
    if (ddContactTab === 'secondary') {
      ddDeal[secondaryKey] = value;
    } else if (field === 'contact') {
      ddDeal.contact = value;
      if (!ddDeal.org && !ORG_CUSTOMERS[ddDeal.c]) ddDeal.c = value;
    } else {
      ddDeal[field] = value;
    }
    ddContactEditing = '';
    parts.row.classList.remove('is-editing');
    parts.editor.hidden = true;
    parts.slot.hidden = false;
    saveActivePipelineState();
    refreshPipelineDealCard(ddDeal);
    ddRenderContactDetails();
  }

  function ddCancelContactEdit(event) {
    if (event) event.stopPropagation();
    if (!ddContactEditing) return;
    const field = ddContactEditing;
    const parts = ddContactEditorParts(field);
    ddContactEditing = '';
    if (parts.row) parts.row.classList.remove('is-editing');
    if (parts.editor) parts.editor.hidden = true;
    if (parts.slot) parts.slot.hidden = false;
    if (parts.input) parts.input.removeAttribute('aria-invalid');
    ddRenderContactDetails();
  }

  function ddDealExpectedCloseRaw(deal) {
    if (!deal) return '';
    if (Object.prototype.hasOwnProperty.call(deal, 'closeDate')) return String(deal.closeDate || '').trim();
    return String(CRM_V2_CLOSE_DATES[deal.t] || '').trim();
  }

  function ddExpectedCloseIso(value) {
    value = String(value || '').trim();
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? '' : localIsoDate(parsed);
  }

  function ddExpectedCloseLabel(value) {
    const iso = ddExpectedCloseIso(value);
    if (!iso) return 'Not set';
    const date = new Date(iso + 'T12:00:00');
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function ddRenderExpectedCloseDate() {
    if (!ddDeal) return;
    const value = ddDealExpectedCloseRaw(ddDeal);
    const display = document.getElementById('dd-expected-close-date');
    const editor = document.getElementById('dd-expected-close-editor');
    const row = document.getElementById('dd-expected-close-row');
    if (display) {
      display.textContent = ddExpectedCloseLabel(value);
      display.classList.toggle('is-empty', !ddExpectedCloseIso(value));
      display.hidden = false;
    }
    if (editor) editor.hidden = true;
    if (row) row.classList.remove('is-editing');
  }

  function ddStartExpectedCloseDateEdit(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (!ddDeal) return;
    const input = document.getElementById('dd-expected-close-input');
    const display = document.getElementById('dd-expected-close-date');
    const editor = document.getElementById('dd-expected-close-editor');
    const row = document.getElementById('dd-expected-close-row');
    if (!input || !display || !editor || !row) return;
    input.value = ddExpectedCloseIso(ddDealExpectedCloseRaw(ddDeal));
    display.hidden = true;
    editor.hidden = false;
    row.classList.add('is-editing');
    input.focus();
  }

  function ddHandleExpectedCloseDateKeydown(event) {
    const editor = document.getElementById('dd-expected-close-editor');
    if (editor && !editor.hidden && editor.contains(event.target)) {
      if (event.key === 'Enter') ddSaveExpectedCloseDate(event);
      if (event.key === 'Escape') ddCancelExpectedCloseDateEdit(event);
      return;
    }
    if (event.key !== 'Enter' && event.key !== ' ') return;
    ddStartExpectedCloseDateEdit(event);
  }

  function ddApplyExpectedCloseDate(deal, value, options) {
    if (!deal) return false;
    const settings = options || {};
    const before = ddExpectedCloseIso(ddDealExpectedCloseRaw(deal));
    const after = ddExpectedCloseIso(value);
    if (before === after && Object.prototype.hasOwnProperty.call(deal, 'closeDate')) return false;
    deal.closeDate = after;
    deal.actionHistory = Array.isArray(deal.actionHistory) ? deal.actionHistory : [];
    deal.actionHistory.push({
      id: 'expected-close-' + Date.now(),
      kind: 'expected-close',
      title: after
        ? 'Expected Close Date · ' + ddExpectedCloseLabel(after)
        : 'Expected Close Date cleared',
      previousValue: before,
      value: after,
      source: settings.source === 'automation' ? 'automation' : 'manual',
      automationWorkflow: settings.automationWorkflow || '',
      author: settings.source === 'automation' ? 'Automation' : (settings.author || CRM_CURRENT_USER),
      createdAt: new Date().toISOString()
    });
    saveActivePipelineState();
    if (deal === ddDeal) {
      ddRenderExpectedCloseDate();
      ddRenderHistory();
    }
    refreshPipelineDealCard(deal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.data.changed', {
      deal, field: 'expected-close', previousValue: before, value: after
    });
    if (crmSubview === 'forecast') renderCrmForecast();
    if (crmSubview === 'crmforecast') renderCrmForecastV2();
    return true;
  }

  function ddSaveExpectedCloseDate(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const input = document.getElementById('dd-expected-close-input');
    if (!ddDeal || !input) return;
    ddApplyExpectedCloseDate(ddDeal, input.value, { source: 'manual', author: CRM_CURRENT_USER });
    ddRenderExpectedCloseDate();
  }

  function ddCancelExpectedCloseDateEdit(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    ddRenderExpectedCloseDate();
  }

  function ddRenderMetadata() {
    if (!ddDeal) return;
    const labels = ddDeal.labels || [];
    const interests = ddDeal.interests || [];
    document.getElementById('dd-labels').innerHTML = labels.length
      ? labels.map(label => {
          const def = labelDef(label);
          return '<span class="dd-meta-chip" style="background:' + def.bg + ';color:' + def.fg + '">' +
            escapeLeadNoteText(def.name) + '</span>';
        }).join('')
      : '<span class="l-dim">—</span>';
    document.getElementById('dd-interests').innerHTML = interests.length
      ? interests.map(interest => '<span class="dd-meta-chip">' + escapeLeadNoteText(interest) + '</span>').join('')
      : '<span class="l-dim">—</span>';
    ddRenderExpectedCloseDate();
  }

  function openDealPage(d, card) {
    ddDeal = d; ddCard = card || null;
    ddBillingInvoicesOpen = false;
    ddBillingDraftOpen = false;
    ddEnsureQuoteActivity(d, DEAL_QUOTES[d.t] || []);
    ddHistoryFilter = 'all';
    document.getElementById('ddHistoryFilter').value = 'all';
    const org = d.org || (ORG_CUSTOMERS[d.c] ? d.c : '');
    const contact = d.contact || ORG_CUSTOMERS[d.c] || d.c;
    const ownerName = d.ownerName || OWNER_NAMES[d.o] || d.o;

    document.getElementById('dd-title').textContent = d.t;
    document.getElementById('dd-owner').textContent = ownerName + (ownerName === CURRENT_USER ? ' (You)' : '');
    document.getElementById('dd-source').textContent = d.source || DEAL_SOURCES[d.t] || '—';

    ddRenderMetadata();

    // Value: real figure when we have one, otherwise the Figma's "Add value" affordance
    document.getElementById('dd-valueslot').innerHTML = d.v > 0
      ? '<span class="val link" onclick="ddEditValue()">' + fmt(d.v) + '</span>'
      : '<button class="dd-linkbtn" onclick="ddEditValue()">Add value</button>';

    ddContactTab = 'primary';
    ddContactEditing = '';
    setContactTab('primary', null, 'viewDeal');

    document.getElementById('dd-orgslot').innerHTML = org
      ? '<span class="val">' + org + '</span>'
      : '<button class="dd-linkbtn"><i class="fai">&#x2b;</i> Link an organization</button>';
    document.getElementById('dd-companyslot').innerHTML = '<span class="owning-company-badge"><i class="fai">&#xf1ad;</i>' + archiveEscape(owningCompanyName(d)) + '</span>';

    document.getElementById('dd-projectslot').innerHTML = d.project
      ? '<div class="dd-row"><i class="fai">&#xf024;</i><span class="val">' + d.project + '</span></div>'
      : '<div class="dd-row"><i class="fai dim">&#xf024;</i><button type="button" class="dd-linkbtn">Add project</button></div>' +
        '<div class="dd-row"><i class="fai dim">&#xf0c1;</i><button type="button" class="dd-linkbtn">Link project</button></div>';

    ddRenderStagebar();
    ddRenderBilling();
    ddRenderQuotes();
    ddRenderFocus();
    ddRenderHistory();
    resetDealComposer();

    ddSyncWatcherControl();
    ddSyncWonButton();

    showView('deal');
  }

  function ddTodayIso() {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
  }

  function ddMeetingContact() {
    return ddDeal ? (ddDeal.contact || ORG_CUSTOMERS[ddDeal.c] || ddDeal.c) : '';
  }

  function applyMeetingProvider(provider, scope) {
    if (scope === 'edit') ddMeetingEditProvider = provider;
    else if (scope === 'lead') leadMeetingProvider = provider;
    else ddMeetingProvider = provider;
    const button = document.getElementById(scope === 'lead' ? 'leadMeetingMethodButton' : scope === 'edit' ? 'ddEditMeetingMethodButton' : 'ddMeetingMethodButton');
    const manualWrap = document.getElementById(scope === 'lead' ? 'leadMeetingManualLinkWrap' : scope === 'edit' ? 'ddEditMeetingManualLinkWrap' : 'ddMeetingManualLinkWrap');
    const addressWrap = document.getElementById(scope === 'lead' ? 'leadMeetingAddressWrap' : scope === 'edit' ? 'ddEditMeetingAddressWrap' : 'ddMeetingAddressWrap');
    if (button) button.innerHTML = meetingMethodCurrentHtml(provider);
    if (manualWrap) manualWrap.hidden = provider !== 'manual';
    if (addressWrap) addressWrap.hidden = provider !== 'in-person';
  }

  function meetingMethodCurrentHtml(selected) {
    if (!selected) {
      return '<span class="dd-method-logo empty"><i class="fai">&#xf03d;</i></span>' +
        '<span class="dd-method-current-copy"><strong>Select meeting method</strong><small>Choose in person or paste a link</small></span>' +
        '<i class="fai dd-method-chevron">&#xf078;</i>';
    }
    if (selected === 'manual') {
      return '<span class="dd-method-logo manual"><i class="fai">&#xf0c1;</i></span>' +
        '<span class="dd-method-current-copy"><strong>Paste a meeting link</strong><small>Use an existing meeting URL</small></span>' +
        '<i class="fai dd-method-chevron">&#xf078;</i>';
    }
    if (selected === 'in-person') {
      return '<span class="dd-method-logo in-person"><i class="fai">&#xf3c5;</i></span>' +
        '<span class="dd-method-current-copy"><strong>In person</strong><small>No video meeting link</small></span>' +
        '<i class="fai dd-method-chevron">&#xf078;</i>';
    }
    return meetingMethodCurrentHtml('');
  }

  function meetingMethodMenuHtml(selected, scope) {
    const inPerson = '<button type="button" class="dd-method-option' + (selected === 'in-person' ? ' selected' : '') + '" role="option" aria-selected="' + (selected === 'in-person') + '" onclick="changeMeetingMethod(\'in-person\', \'' + scope + '\')">' +
      '<span class="dd-method-logo in-person"><i class="fai">&#xf3c5;</i></span><span class="dd-method-option-copy"><strong>In person</strong><small>Customer meeting, site visit or on-site review</small></span>' +
      (selected === 'in-person' ? '<i class="fai dd-method-check">&#xf00c;</i>' : '') + '</button>';
    const manual = '<button type="button" class="dd-method-option' + (selected === 'manual' ? ' selected' : '') + '" role="option" aria-selected="' + (selected === 'manual') + '" onclick="changeMeetingMethod(\'manual\', \'' + scope + '\')">' +
      '<span class="dd-method-logo manual"><i class="fai">&#xf0c1;</i></span><span class="dd-method-option-copy"><strong>Paste a meeting link</strong><small>Google Meet, Teams, Zoom or any URL</small></span>' +
      (selected === 'manual' ? '<i class="fai dd-method-check">&#xf00c;</i>' : '') + '</button>';
    return '<div class="dd-method-section-label">Meeting format</div>' + inPerson + manual;
  }

  function closeMeetingMethodMenus() {
    ['create', 'edit', 'lead'].forEach(scope => {
      const menu = document.getElementById(scope === 'lead' ? 'leadMeetingMethodMenu' : scope === 'edit' ? 'ddEditMeetingMethodMenu' : 'ddMeetingMethodMenu');
      const button = document.getElementById(scope === 'lead' ? 'leadMeetingMethodButton' : scope === 'edit' ? 'ddEditMeetingMethodButton' : 'ddMeetingMethodButton');
      if (menu) menu.hidden = true;
      if (button) button.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleMeetingMethodMenu(scope) {
    const menu = document.getElementById(scope === 'lead' ? 'leadMeetingMethodMenu' : scope === 'edit' ? 'ddEditMeetingMethodMenu' : 'ddMeetingMethodMenu');
    const button = document.getElementById(scope === 'lead' ? 'leadMeetingMethodButton' : scope === 'edit' ? 'ddEditMeetingMethodButton' : 'ddMeetingMethodButton');
    if (!menu || !button) return;
    const willOpen = menu.hidden;
    closeMeetingMethodMenus();
    menu.hidden = !willOpen;
    button.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
  }

  function changeMeetingMethod(provider, scope) {
    closeMeetingMethodMenus();
    if (provider === 'in-person') {
      applyMeetingProvider('in-person', scope);
      requestAnimationFrame(() => {
        const input = document.getElementById(scope === 'lead' ? 'leadMeetingAddress' : scope === 'edit' ? 'ddEditMeetingAddress' : 'ddMeetingAddress');
        if (input) input.focus();
      });
      return;
    }
    if (provider === 'manual') {
      applyMeetingProvider('manual', scope);
      requestAnimationFrame(() => {
        const input = document.getElementById(scope === 'lead' ? 'leadMeetingManualLink' : scope === 'edit' ? 'ddEditMeetingManualLink' : 'ddMeetingManualLink');
        if (input) input.focus();
      });
      return;
    }
    return;
  }

  function renderMeetingProviderStates() {
    const createMenu = document.getElementById('ddMeetingMethodMenu');
    const editMenu = document.getElementById('ddEditMeetingMethodMenu');
    const leadMenu = document.getElementById('leadMeetingMethodMenu');
    if (createMenu) createMenu.innerHTML = meetingMethodMenuHtml(ddMeetingProvider, 'create');
    if (editMenu) editMenu.innerHTML = meetingMethodMenuHtml(ddMeetingEditProvider, 'edit');
    if (leadMenu) leadMenu.innerHTML = meetingMethodMenuHtml(leadMeetingProvider, 'lead');
    const createButton = document.getElementById('ddMeetingSave');
    if (createButton) createButton.disabled = false;
    applyMeetingProvider(ddMeetingProvider, 'create');
    applyMeetingProvider(ddMeetingEditProvider, 'edit');
    applyMeetingProvider(leadMeetingProvider, 'lead');
  }

  document.addEventListener('click', closeMeetingMethodMenus);

  function meetingIntegrationRowsHtml() {
    return Object.entries(DD_MEETING_PROVIDERS).map(([key, provider]) => {
      const connected = DD_MEETING_CONNECTIONS[key];
      const requested = ddMeetingIntegrationRequest && ddMeetingIntegrationRequest.provider === key;
      return '<div class="meeting-integration-row' + (requested ? ' requested' : '') + '">' +
        '<span class="provider-logo ' + provider.className + '">' + provider.short + '</span>' +
        '<div class="meeting-integration-info"><strong>' + provider.label + '</strong>' +
          '<span>' + (connected ? 'Connected as ' + DD_MEETING_ACCOUNT : 'Not connected') + '</span></div>' +
        '<span class="meeting-integration-status ' + (connected ? 'connected' : '') + '"><i class="fai">' + (connected ? '&#xf058;' : '&#xf111;') + '</i>' + (connected ? 'Connected' : 'Available') + '</span>' +
        '<button type="button" class="meeting-integration-action' + (connected ? ' disconnect' : '') + '" data-meeting-provider="' + key + '">' + (connected ? 'Disconnect' : 'Connect') + '</button>' +
      '</div>';
    }).join('');
  }

  function openMeetingIntegrations(provider, scope) {
    ddMeetingIntegrationRequest = provider ? { provider, scope: scope || 'create' } : null;
    document.getElementById('meetingIntegrationList').innerHTML = meetingIntegrationRowsHtml();
    document.getElementById('meetingIntegrationOverlay').classList.add('open');
  }

  function closeMeetingIntegrations() {
    document.getElementById('meetingIntegrationOverlay').classList.remove('open');
    ddMeetingIntegrationRequest = null;
  }

  function toggleMeetingIntegration(provider) {
    if (!DD_MEETING_PROVIDERS[provider]) return;
    const connecting = !DD_MEETING_CONNECTIONS[provider];
    DD_MEETING_CONNECTIONS[provider] = connecting;
    renderMeetingProviderStates();

    if (connecting && ddMeetingIntegrationRequest && ddMeetingIntegrationRequest.provider === provider) {
      const scope = ddMeetingIntegrationRequest.scope;
      applyMeetingProvider(provider, scope);
      closeMeetingIntegrations();
      qtShowSnackbar(DD_MEETING_PROVIDERS[provider].label + ' connected.', 'success');
      return;
    }

    if (!connecting) {
      const firstConnected = Object.keys(DD_MEETING_CONNECTIONS).find(key => DD_MEETING_CONNECTIONS[key]);
      if (ddMeetingProvider === provider) applyMeetingProvider(firstConnected || 'manual', 'create');
      if (ddMeetingEditProvider === provider) applyMeetingProvider(firstConnected || 'manual', 'edit');
      if (leadMeetingProvider === provider) applyMeetingProvider(firstConnected || 'manual', 'lead');
    }
    document.getElementById('meetingIntegrationList').innerHTML = meetingIntegrationRowsHtml();
    qtShowSnackbar(DD_MEETING_PROVIDERS[provider].label + (connecting ? ' connected.' : ' disconnected.'), connecting ? 'success' : undefined);
  }

  document.addEventListener('click', event => {
    const action = event.target.closest('.meeting-integration-action[data-meeting-provider]');
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    toggleMeetingIntegration(action.dataset.meetingProvider);
  });

  function meetingTimeOptionsHtml(selected) {
    const options = ['<option value="" disabled' + (selected ? '' : ' selected') + '>Select time</option>'];
    const available = [];
    for (let minutes = 7 * 60; minutes <= 20 * 60; minutes += 15) {
      const hour = String(Math.floor(minutes / 60)).padStart(2, '0');
      const minute = String(minutes % 60).padStart(2, '0');
      available.push(hour + ':' + minute);
    }
    if (selected && !available.includes(selected)) available.push(selected);
    available.sort().forEach(value => options.push(
      '<option value="' + value + '"' + (value === selected ? ' selected' : '') + '>' + value + '</option>'
    ));
    return options.join('');
  }

  function resetMeetingComposer() {
    if (!ddDeal) return;
    document.getElementById('ddMeetingTitle').value = '';
    const date = document.getElementById('ddMeetingDate');
    date.min = ddTodayIso();
    date.value = '';
    const time = document.getElementById('ddMeetingTime');
    time.innerHTML = meetingTimeOptionsHtml('');
    time.value = '';
    document.getElementById('ddMeetingDuration').value = '';
    document.getElementById('ddMeetingAgenda').value = '';
    document.getElementById('ddMeetingManualLink').value = '';
    document.getElementById('ddMeetingAddress').value = '';
    document.getElementById('ddMeetingValidation').textContent = '';
    ddMeetingDraftAttendees = [];
    document.getElementById('ddMeetingAttendees').innerHTML =
      '<button type="button" class="dd-meeting-add-attendees" onclick="addDefaultMeetingAttendees()"><i class="fai">&#x2b;</i> Add attendees</button>';
    applyMeetingProvider('', 'create');
    renderMeetingProviderStates();
  }

  function addDefaultMeetingAttendees() {
    const contact = ddMeetingContact();
    const owner = ddDeal.ownerName || OWNER_NAMES[ddDeal.o] || ddDeal.o;
    ddMeetingDraftAttendees = [contact, owner].filter(Boolean);
    document.getElementById('ddMeetingAttendees').innerHTML = ddMeetingDraftAttendees.map(name =>
      '<span class="dd-meeting-attendee-chip"><i class="fai">&#xf007;</i>' + archiveEscape(name) + '</span>'
    ).join('');
  }

  function ddMeetingLink(provider, id) {
    const slug = 'wq-' + String(id).slice(-7);
    if (provider === 'teams') return 'https://teams.microsoft.com/l/meetup-join/' + slug;
    if (provider === 'zoom') return 'https://zoom.us/j/' + String(id).slice(-10);
    return 'https://meet.google.com/' + slug;
  }

  function ddValidMeetingLink(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch (_) {
      return false;
    }
  }

  function ddManualMeetingLabel(value) {
    try {
      return new URL(value).hostname.replace(/^www\./, '');
    } catch (_) {
      return 'Meeting link';
    }
  }

  function editDealMeeting(id) {
    const meeting = ddMeetingById(id);
    if (!meeting) return;
    ddMeetingEditingId = meeting.id;
    const date = document.getElementById('ddEditMeetingDate');
    document.getElementById('ddEditMeetingTitle').value = meeting.title;
    date.min = ddTodayIso();
    date.value = meeting.date;
    const time = document.getElementById('ddEditMeetingTime');
    time.innerHTML = meetingTimeOptionsHtml(meeting.time);
    time.value = meeting.time;
    document.getElementById('ddEditMeetingDuration').value = String(meeting.duration);
    document.getElementById('ddEditMeetingAgenda').value = meeting.agenda || '';
    document.getElementById('ddEditMeetingManualLink').value = meeting.provider === 'in-person' ? '' : (meeting.link || '');
    document.getElementById('ddEditMeetingAddress').value = meeting.address || '';
    document.getElementById('ddEditMeetingValidation').textContent = '';
    document.getElementById('ddEditMeetingAttendees').innerHTML = (meeting.attendees || []).map(name =>
      '<span class="dd-meeting-attendee-chip"><i class="fai">&#xf007;</i>' + archiveEscape(name) + '</span>'
    ).join('');
    applyMeetingProvider(meeting.provider === 'in-person' ? 'in-person' : 'manual', 'edit');
    renderMeetingProviderStates();
    document.getElementById('meetingEditOverlay').classList.add('open');
    requestAnimationFrame(() => document.getElementById('ddEditMeetingTitle').focus());
  }

  function closeMeetingEditDialog() {
    document.getElementById('meetingEditOverlay').classList.remove('open');
    document.getElementById('ddEditMeetingValidation').textContent = '';
    ddMeetingEditingId = null;
  }

  function saveDealMeetingEdit() {
    const meeting = ddMeetingById(ddMeetingEditingId);
    if (!meeting) return;
    const title = document.getElementById('ddEditMeetingTitle').value.trim();
    const date = document.getElementById('ddEditMeetingDate').value;
    const time = document.getElementById('ddEditMeetingTime').value;
    const duration = Number(document.getElementById('ddEditMeetingDuration').value);
    const agenda = document.getElementById('ddEditMeetingAgenda').value.trim();
    const manualLink = document.getElementById('ddEditMeetingManualLink').value.trim();
    const address = document.getElementById('ddEditMeetingAddress').value.trim();
    const validation = document.getElementById('ddEditMeetingValidation');
    if (!title || !date || !time || !duration) {
      validation.textContent = 'Add a title, date, start time and duration.';
      return;
    }
    if (ddMeetingEditProvider === 'manual' && !ddValidMeetingLink(manualLink)) {
      validation.textContent = 'Paste a valid meeting link beginning with https:// or http://.';
      return;
    }
    if (ddMeetingEditProvider === 'in-person' && !address) {
      validation.textContent = 'Add the meeting address for an in-person meeting.';
      return;
    }
    const providerLabel = ddMeetingEditProvider === 'in-person'
      ? 'In person'
      : ddManualMeetingLabel(manualLink);
    Object.assign(meeting, {
      title, date, time, duration, agenda,
      provider: ddMeetingEditProvider,
      providerLabel,
      address: ddMeetingEditProvider === 'in-person' ? address : '',
      link: ddMeetingEditProvider === 'in-person'
        ? ''
        : manualLink,
      updatedAt: new Date().toISOString()
    });
    saveActivePipelineState();
    closeMeetingEditDialog();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.meeting.changed', {
      deal: ddDeal, meeting, change: 'updated', field: 'meeting'
    });
    qtShowSnackbar('Meeting updated.', 'success');
  }

  function emailIntegrationRowsHtml() {
    return Object.entries(DD_EMAIL_PROVIDERS).map(([key, provider]) => {
      const connected = DD_EMAIL_CONNECTIONS[key];
      return '<div class="meeting-integration-row">' +
        '<span class="provider-logo ' + provider.className + '">' + provider.short + '</span>' +
        '<div class="meeting-integration-info"><strong>' + provider.label + '</strong><span>' +
          (connected ? 'Connected as ' + provider.account : provider.description) + '</span></div>' +
        '<span class="meeting-integration-status ' + (connected ? 'connected' : '') + '"><i class="fai">' +
          (connected ? '&#xf058;' : '&#xf111;') + '</i>' + (connected ? 'Connected' : 'Available') + '</span>' +
        '<button type="button" class="meeting-integration-action' + (connected ? ' disconnect' : '') +
          '" onclick="toggleEmailIntegration(\'' + key + '\')">' + (connected ? 'Disconnect' : 'Connect') + '</button></div>';
    }).join('');
  }

  function openEmailIntegrations() {
    document.getElementById('emailIntegrationList').innerHTML = emailIntegrationRowsHtml();
    document.getElementById('emailIntegrationOverlay').classList.add('open');
  }

  function closeEmailIntegrations() {
    document.getElementById('emailIntegrationOverlay').classList.remove('open');
  }

  function toggleEmailIntegration(provider) {
    if (!DD_EMAIL_PROVIDERS[provider]) return;
    const connecting = !DD_EMAIL_CONNECTIONS[provider];
    DD_EMAIL_CONNECTIONS[provider] = connecting;
    if (connecting) ddEmailProvider = provider;
    if (!connecting && ddEmailProvider === provider) {
      ddEmailProvider = Object.keys(DD_EMAIL_CONNECTIONS).find(key => DD_EMAIL_CONNECTIONS[key]) || '';
    }
    renderEmailAccountOptions();
    document.getElementById('emailIntegrationList').innerHTML = emailIntegrationRowsHtml();
    qtShowSnackbar(DD_EMAIL_PROVIDERS[provider].label + (connecting ? ' connected.' : ' disconnected.'), connecting ? 'success' : undefined);
  }

  function renderEmailAccountOptions() {
    const select = document.getElementById('ddEmailFrom');
    if (!select) return;
    const connected = Object.keys(DD_EMAIL_CONNECTIONS).filter(key => DD_EMAIL_CONNECTIONS[key]);
    if (!connected.includes(ddEmailProvider)) ddEmailProvider = connected[0] || '';
    select.innerHTML = connected.length
      ? connected.map(key => '<option value="' + key + '"' + (key === ddEmailProvider ? ' selected' : '') + '>' +
          archiveEscape(DD_EMAIL_PROVIDERS[key].account) + ' · ' + archiveEscape(DD_EMAIL_PROVIDERS[key].label) + '</option>').join('')
      : '<option value="">Connect an email account</option>';
    select.value = ddEmailProvider;
    select.onchange = () => { ddEmailProvider = select.value; };
  }

  function resetEmailComposer() {
    if (!ddDeal) return;
    renderEmailAccountOptions();
    const contact = ddDeal.contact || ORG_CUSTOMERS[ddDeal.c] || ddDeal.c;
    document.getElementById('ddEmailTo').value = ddDeal.email || ddEmail(contact);
    document.getElementById('ddEmailSubject').value = '';
    document.getElementById('ddEmailBody').value = '';
    document.getElementById('ddEmailValidation').textContent = '';
    const result = document.getElementById('ddEmailAiResult');
    result.hidden = true;
    result.innerHTML = '';
  }

  function draftDealEmailWithAI() {
    if (!ddDeal) return;
    const contact = ddDeal.contact || ORG_CUSTOMERS[ddDeal.c] || ddDeal.c;
    const firstName = String(contact).split(/\s+/)[0];
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const commentedQuote = quotes.find(q => q.comments && q.comments.length);
    const quoteRef = commentedQuote ? 'Quote #' + commentedQuote.no : (quotes[0] ? 'Quote #' + quotes[0].no : ddDeal.t);
    document.getElementById('ddEmailSubject').value = 'Follow-up: ' + quoteRef + ' — ' + ddDeal.t;
    document.getElementById('ddEmailBody').value =
      'Hi ' + firstName + ',\n\nThank you for reviewing ' + quoteRef + '. ' +
      (commentedQuote
        ? 'I’m following up on your comment and will confirm the requested details.'
        : 'I wanted to check whether you have any questions or would like us to revise anything.') +
      '\n\nPlease let me know a convenient time to discuss the next steps.\n\nBest regards,\nLee Roche';
    const result = document.getElementById('ddEmailAiResult');
    result.hidden = false;
    result.innerHTML = '<i class="fai">&#xf544;</i><span>Draft created from this Deal, linked Quotes and recent customer activity.</span>';
    document.getElementById('ddEmailValidation').textContent = '';
  }

  function checkDealEmailGrammar() {
    const body = document.getElementById('ddEmailBody');
    const validation = document.getElementById('ddEmailValidation');
    if (!body.value.trim()) {
      validation.textContent = 'Write or generate an email before checking grammar.';
      return;
    }
    body.value = body.value.split('\n').map(line => {
      let value = line.trim().replace(/\s+([,.;!?])/g, '$1').replace(/\bi\b/g, 'I');
      if (value) value = value.charAt(0).toUpperCase() + value.slice(1);
      return value;
    }).join('\n');
    const result = document.getElementById('ddEmailAiResult');
    result.hidden = false;
    result.innerHTML = '<i class="fai">&#xf058;</i><span><strong>Grammar checked</strong> · Spelling, punctuation and professional tone look good.</span>';
    validation.textContent = '';
  }

  function saveDealEmail(status) {
    if (!ddDeal) return;
    const provider = DD_EMAIL_PROVIDERS[ddEmailProvider];
    const to = document.getElementById('ddEmailTo').value.trim();
    const subject = document.getElementById('ddEmailSubject').value.trim();
    const body = document.getElementById('ddEmailBody').value.trim();
    const validation = document.getElementById('ddEmailValidation');
    if (!provider || !DD_EMAIL_CONNECTIONS[ddEmailProvider]) {
      validation.textContent = 'Connect an email account first.';
      return;
    }
    if (status === 'sent' && (!to || !subject || !body)) {
      validation.textContent = 'Add a recipient, subject and message before sending.';
      return;
    }
    if (status === 'draft' && !subject && !body) {
      validation.textContent = 'Add a subject or message before saving a draft.';
      return;
    }
    ddDeal.emails = ddDeal.emails || [];
    ddDeal.emails.push({
      id: Date.now(), provider: ddEmailProvider, providerLabel: provider.label,
      from: provider.account, to, subject: subject || '(No subject)', body,
      status, createdAt: new Date().toISOString(), author: CURRENT_USER
    });
    saveActivePipelineState();
    ddRenderHistory();
    resetEmailComposer();
    qtShowSnackbar(status === 'sent' ? 'Email sent and linked to this Deal.' : 'Email draft saved to this Deal.', 'success');
  }

  function resetDealComposer() {
    document.querySelectorAll('.dd-tab').forEach(tab => {
      const active = tab.dataset.dealTab === 'notes';
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.dd-composer-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.dealPanel === 'notes');
    });
    document.getElementById('ddNoteTitle').value = '';
    document.getElementById('ddNoteBody').innerHTML = '';
    document.getElementById('ddNoteValidation').textContent = '';
    resetDealNoteFollowUp();
    closeDealNoteMentionMenu();
    document.getElementById('ddFileValidation').textContent = '';
    resetMeetingComposer();
  }

  function createDealMeeting() {
    if (!ddDeal) return;
    const title = document.getElementById('ddMeetingTitle').value.trim();
    const date = document.getElementById('ddMeetingDate').value;
    const time = document.getElementById('ddMeetingTime').value;
    const duration = Number(document.getElementById('ddMeetingDuration').value);
    const agenda = document.getElementById('ddMeetingAgenda').value.trim();
    const manualLink = document.getElementById('ddMeetingManualLink').value.trim();
    const address = document.getElementById('ddMeetingAddress').value.trim();
    const validation = document.getElementById('ddMeetingValidation');
    if (!title || !date || !time || !duration) {
      validation.textContent = 'Add a title, date, start time and duration.';
      return;
    }
    if (!ddMeetingProvider) {
      validation.textContent = 'Select a meeting method.';
      return;
    }
    if (ddMeetingProvider === 'manual' && !ddValidMeetingLink(manualLink)) {
      validation.textContent = 'Paste a valid meeting link beginning with https:// or http://.';
      return;
    }
    if (ddMeetingProvider === 'in-person' && !address) {
      validation.textContent = 'Add the meeting address for an in-person meeting.';
      return;
    }
    validation.textContent = '';
    const id = Date.now();
    const provider = ddMeetingProvider === 'in-person'
      ? { label: 'In person' }
      : { label: ddManualMeetingLabel(manualLink) };
    ddDeal.meetings = ddDeal.meetings || [];
    const meeting = {
      id, title, date, time, duration, agenda,
      provider: ddMeetingProvider,
      providerLabel: provider.label,
      address: ddMeetingProvider === 'in-person' ? address : '',
      link: ddMeetingProvider === 'in-person' ? '' : manualLink,
      attendees: ddMeetingDraftAttendees.slice(),
      summary: '', status: 'scheduled', createdAt: new Date().toISOString(), createdBy: CURRENT_USER
    };
    ddDeal.meetings.push(meeting);
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.meeting.changed', {
      deal: ddDeal, meeting, change: 'scheduled', field: 'meeting'
    });
    resetMeetingComposer();
    qtShowSnackbar(
      ddMeetingProvider === 'in-person'
        ? 'In-person meeting created and linked to this Deal.'
        : 'Meeting link saved and linked to this Deal.',
      'success'
    );
  }

  function ddNotePeople() {
    const owner = ddDeal && (ddDeal.ownerName || OWNER_NAMES[ddDeal.o] || ddDeal.o);
    return [...new Set([owner, CURRENT_USER, ...Object.values(OWNER_NAMES)].filter(Boolean))];
  }

  function formatDealNote(command) {
    const editor = document.getElementById('ddNoteBody');
    const selection = window.getSelection();
    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) editor.focus();
    document.execCommand(command, false, null);
    handleDealNoteInput();
  }

  function toggleDealNoteFollowUp() {
    const wrap = document.getElementById('ddNoteFollowUp');
    const toggle = document.getElementById('ddNoteFollowUpToggle');
    if (!wrap || !toggle) return;
    const willOpen = wrap.hidden;
    wrap.hidden = !willOpen;
    toggle.classList.toggle('active', willOpen);
    toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    if (willOpen) requestAnimationFrame(openDealNoteDateTimePicker);
    else closeDealNoteDateTimePicker();
  }

  function dealNoteDefaultFollowUpTime() {
    const next = new Date(Date.now() + 30 * 60000);
    next.setMinutes(Math.ceil(next.getMinutes() / 30) * 30, 0, 0);
    return String(next.getHours()).padStart(2, '0') + ':' + String(next.getMinutes()).padStart(2, '0');
  }

  function renderDealNoteTimeOptions() {
    const select = document.getElementById('ddNoteFollowUpTime');
    if (!select) return;
    select.innerHTML = Array.from({ length: 48 }, (_, index) => {
      const hour = Math.floor(index / 2);
      const minute = index % 2 ? '30' : '00';
      const value = String(hour).padStart(2, '0') + ':' + minute;
      return '<option value="' + value + '">' + value + '</option>';
    }).join('');
    select.value = ddNotePickerTime;
  }

  function renderDealNoteCalendar() {
    const monthLabel = document.getElementById('ddNoteCalendarMonth');
    const grid = document.getElementById('ddNoteCalendarGrid');
    if (!monthLabel || !grid) return;
    const year = ddNotePickerMonth.getFullYear();
    const month = ddNotePickerMonth.getMonth();
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(year, month + 1, 0).getDate();
    const todayKey = localIsoDate(new Date());
    monthLabel.textContent = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    let html = '';
    for (let index = 0; index < 42; index += 1) {
      const day = index - offset + 1;
      if (day < 1 || day > days) {
        html += '<span class="empty" aria-hidden="true"></span>';
        continue;
      }
      const key = [year, String(month + 1).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
      const selected = key === ddNotePickerDate;
      const today = key === todayKey;
      const disabled = key < todayKey;
      html += '<button type="button"' + (disabled ? ' disabled' : '') +
        ' class="' + (selected ? 'selected ' : '') + (today ? 'today' : '') + '"' +
        ' aria-pressed="' + selected + '" aria-label="' + new Date(key + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + '"' +
        ' onclick="selectDealNoteFollowUpDate(\'' + key + '\')">' + day + '</button>';
    }
    grid.innerHTML = html;
    syncDealNotePickerDraft();
  }

  function updateDealNoteDateTimeLabel() {
    const input = document.getElementById('ddNoteFollowUpAt');
    const label = document.getElementById('ddNoteDateTimeLabel');
    if (!input || !label) return;
    if (!input.value) {
      label.textContent = 'Select date and time';
      return;
    }
    const date = new Date(input.value);
    label.textContent = Number.isNaN(date.getTime()) ? 'Select date and time' : date.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function openDealNoteDateTimePicker() {
    const picker = document.getElementById('ddNoteDateTimePicker');
    const trigger = document.getElementById('ddNoteDateTimeTrigger');
    const input = document.getElementById('ddNoteFollowUpAt');
    if (!picker || !trigger || !input) return;
    if (input.value) {
      const parts = input.value.split('T');
      ddNotePickerDate = parts[0] || '';
      ddNotePickerTime = (parts[1] || '09:00').slice(0, 5);
    } else {
      ddNotePickerDate = '';
      ddNotePickerTime = dealNoteDefaultFollowUpTime();
    }
    const anchor = ddNotePickerDate ? new Date(ddNotePickerDate + 'T12:00:00') : new Date();
    ddNotePickerMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    renderDealNoteTimeOptions();
    renderDealNoteCalendar();
    picker.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    trigger.focus();
  }

  function closeDealNoteDateTimePicker() {
    const picker = document.getElementById('ddNoteDateTimePicker');
    const trigger = document.getElementById('ddNoteDateTimeTrigger');
    if (picker) picker.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  function toggleDealNoteDateTimePicker() {
    const picker = document.getElementById('ddNoteDateTimePicker');
    if (!picker) return;
    if (picker.hidden) openDealNoteDateTimePicker();
    else closeDealNoteDateTimePicker();
  }

  function changeDealNoteCalendarMonth(amount) {
    ddNotePickerMonth = new Date(ddNotePickerMonth.getFullYear(), ddNotePickerMonth.getMonth() + amount, 1);
    renderDealNoteCalendar();
  }

  function selectDealNoteFollowUpDate(dateKey) {
    ddNotePickerDate = dateKey;
    renderDealNoteCalendar();
  }

  function syncDealNotePickerDraft() {
    const time = document.getElementById('ddNoteFollowUpTime');
    const done = document.getElementById('ddNoteDateTimeDone');
    if (time && time.value) ddNotePickerTime = time.value;
    if (done) done.disabled = !ddNotePickerDate || !ddNotePickerTime;
  }

  function applyDealNoteDateTime() {
    if (!ddNotePickerDate || !ddNotePickerTime) return;
    document.getElementById('ddNoteFollowUpAt').value = ddNotePickerDate + 'T' + ddNotePickerTime;
    updateDealNoteDateTimeLabel();
    closeDealNoteDateTimePicker();
    document.getElementById('ddNoteDateTimeTrigger').focus();
  }

  function clearDealNoteFollowUp() {
    resetDealNoteFollowUp();
  }

  function resetDealNoteFollowUp() {
    const wrap = document.getElementById('ddNoteFollowUp');
    const toggle = document.getElementById('ddNoteFollowUpToggle');
    const input = document.getElementById('ddNoteFollowUpAt');
    if (wrap) wrap.hidden = true;
    if (input) input.value = '';
    closeDealNoteDateTimePicker();
    updateDealNoteDateTimeLabel();
    if (toggle) {
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    }
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('#ddNoteDateTime') && !event.target.closest('#ddNoteFollowUpToggle')) closeDealNoteDateTimePicker();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDealNoteDateTimePicker();
  });

  function closeDealNoteMentionMenu() {
    const menu = document.getElementById('ddNoteMentionMenu');
    if (menu) {
      menu.hidden = true;
      menu.innerHTML = '';
    }
    ddNoteMentionRange = null;
    ddNoteMentionReplaceLength = 0;
  }

  function renderDealNoteMentionMenu(query) {
    const menu = document.getElementById('ddNoteMentionMenu');
    const normalized = (query || '').trim().toLowerCase();
    const people = ddNotePeople().filter(name => name.toLowerCase().includes(normalized)).slice(0, 7);
    if (!people.length) {
      closeDealNoteMentionMenu();
      return;
    }
    menu.innerHTML = people.map(name =>
      '<button type="button" data-mention-name="' + archiveEscape(name) + '" ' +
        'onmousedown="event.preventDefault()" onclick="insertDealNoteMention(this.dataset.mentionName)">' +
        '<span class="dd-note-person-avatar">' + archiveEscape(name.split(/\s+/).map(part => part[0]).join('').slice(0, 2)) + '</span>' +
        '<span><strong>' + archiveEscape(name) + '</strong><small>Notify and add to Focus</small></span>' +
      '</button>'
    ).join('');
    menu.hidden = false;
  }

  function openDealNoteMentionMenu() {
    const editor = document.getElementById('ddNoteBody');
    editor.focus();
    const selection = window.getSelection();
    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    ddNoteMentionRange = selection.getRangeAt(0).cloneRange();
    ddNoteMentionReplaceLength = 0;
    renderDealNoteMentionMenu('');
  }

  function dealNoteCaretFollowsMention(caret) {
    let previous = null;
    if (caret.endContainer.nodeType === Node.TEXT_NODE) {
      const textBeforeCaret = caret.endContainer.textContent.slice(0, caret.endOffset);
      if (textBeforeCaret.trim()) return false;
      previous = caret.endContainer.previousSibling;
    } else if (caret.endOffset > 0) {
      previous = caret.endContainer.childNodes[caret.endOffset - 1];
    }
    while (previous && previous.nodeType === Node.TEXT_NODE && !previous.textContent.trim()) {
      previous = previous.previousSibling;
    }
    return !!(previous && previous.nodeType === Node.ELEMENT_NODE && previous.classList.contains('dd-note-mention'));
  }

  function handleDealNoteInput() {
    const editor = document.getElementById('ddNoteBody');
    document.getElementById('ddNoteValidation').textContent = '';
    const selection = window.getSelection();
    if (!selection.rangeCount || !editor.contains(selection.anchorNode)) {
      closeDealNoteMentionMenu();
      return;
    }
    const caret = selection.getRangeAt(0);
    const beforeCaret = caret.cloneRange();
    beforeCaret.selectNodeContents(editor);
    beforeCaret.setEnd(caret.endContainer, caret.endOffset);
    const beforeCaretFragment = beforeCaret.cloneContents();
    beforeCaretFragment.querySelectorAll('.dd-note-mention').forEach(mention => {
      mention.replaceWith(document.createTextNode('\u0000'));
    });
    const normalizedBeforeCaret = beforeCaretFragment.textContent
      .replace(/\u00a0/g, ' ')
      .replace(/＠/g, '@');
    const lastCompletedMention = normalizedBeforeCaret.lastIndexOf('\u0000');
    const activeText = lastCompletedMention >= 0
      ? normalizedBeforeCaret.slice(lastCompletedMention + 1)
      : normalizedBeforeCaret;
    const match = activeText.match(/(?:^|\s)@([^@\n]{0,30})$/);
    if (match) {
      ddNoteMentionRange = caret.cloneRange();
      ddNoteMentionReplaceLength = match[1].length + 1;
      renderDealNoteMentionMenu(match[1]);
      return;
    }
    if (dealNoteCaretFollowsMention(caret)) {
      closeDealNoteMentionMenu();
      return;
    }
    closeDealNoteMentionMenu();
  }

  function handleDealNoteKeydown(event) {
    const menu = document.getElementById('ddNoteMentionMenu');
    if (menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDealNoteMentionMenu();
    } else if (event.key === 'Enter') {
      const first = menu.querySelector('button');
      if (first) {
        event.preventDefault();
        insertDealNoteMention(first.dataset.mentionName);
      }
    }
  }

  function insertDealNoteMention(name) {
    const editor = document.getElementById('ddNoteBody');
    let range = ddNoteMentionRange && ddNoteMentionRange.cloneRange();
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    if (ddNoteMentionReplaceLength && typeof selection.modify === 'function') {
      for (let index = 0; index < ddNoteMentionReplaceLength; index++) {
        selection.modify('extend', 'backward', 'character');
      }
      range = selection.getRangeAt(0);
    } else if (ddNoteMentionReplaceLength && range.startContainer.nodeType === Node.TEXT_NODE) {
      range.setStart(range.startContainer, Math.max(0, range.startOffset - ddNoteMentionReplaceLength));
    }
    range.deleteContents();
    const mention = document.createElement('span');
    mention.className = 'dd-note-mention';
    mention.dataset.mention = name;
    mention.contentEditable = 'false';
    mention.textContent = '@' + name;
    const spacer = document.createTextNode('\u00a0');
    range.insertNode(mention);
    mention.after(spacer);
    range.setStartAfter(spacer);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    closeDealNoteMentionMenu();
    editor.focus();
  }

  function sanitizeDealNoteHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';
    const allowed = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'BR', 'DIV', 'P', 'SPAN']);
    [...template.content.querySelectorAll('*')].forEach(element => {
      if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
        element.remove();
        return;
      }
      if (!allowed.has(element.tagName)) {
        element.replaceWith(...element.childNodes);
        return;
      }
      const isMention = element.tagName === 'SPAN' && element.classList.contains('dd-note-mention');
      [...element.attributes].forEach(attribute => element.removeAttribute(attribute.name));
      if (isMention) {
        const name = element.textContent.replace(/^@/, '').trim();
        element.className = 'dd-note-mention';
        element.dataset.mention = name;
        element.contentEditable = 'false';
        element.textContent = '@' + name;
      }
    });
    return template.innerHTML.trim();
  }

  function dealNoteMentionsFromHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = sanitizeDealNoteHtml(html);
    return [...new Set([...template.content.querySelectorAll('.dd-note-mention')]
      .map(element => element.dataset.mention).filter(Boolean))];
  }

  function saveDealNote() {
    if (!ddDeal) return;
    const title = document.getElementById('ddNoteTitle').value.trim();
    const editor = document.getElementById('ddNoteBody');
    const bodyHtml = sanitizeDealNoteHtml(editor.innerHTML);
    const body = editor.innerText.replace(/\n{3,}/g, '\n\n').trim();
    const validation = document.getElementById('ddNoteValidation');
    const followUpValue = document.getElementById('ddNoteFollowUpAt').value;
    const followUpDate = followUpValue ? new Date(followUpValue) : null;
    if (!body) {
      validation.textContent = 'Write a note before saving.';
      return;
    }
    if (body.length > 1500) {
      validation.textContent = 'Keep the note under 1,500 characters.';
      return;
    }
    if (followUpValue && Number.isNaN(followUpDate.getTime())) {
      validation.textContent = 'Choose a valid follow-up date and time.';
      return;
    }
    const mentions = dealNoteMentionsFromHtml(bodyHtml);
    ddDeal.notes = ddDeal.notes || [];
    ddDeal.notes.push({
      id: Date.now(), title: title || 'Note', body, bodyHtml, mentions,
      author: CURRENT_USER, createdAt: new Date().toISOString(),
      followUpAt: followUpDate ? followUpDate.toISOString() : '',
      followUpStatus: followUpDate ? 'open' : ''
    });
    saveActivePipelineState();
    document.getElementById('ddNoteTitle').value = '';
    editor.innerHTML = '';
    validation.textContent = '';
    resetDealNoteFollowUp();
    closeDealNoteMentionMenu();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar(
      followUpDate
        ? 'Note saved with a follow-up date.'
        : mentions.length
        ? 'Note saved and ' + mentions.length + ' ' + (mentions.length === 1 ? 'person was' : 'people were') + ' added to Focus.'
        : 'Note saved to History.',
      'success'
    );
  }

  function ddNoteById(id) {
    return ((ddDeal && ddDeal.notes) || []).find(note => note.id === Number(id));
  }

  function openDealNoteReply(id) {
    if (!ddNoteById(id)) return;
    ddNoteReplyingId = Number(id);
    ddRenderHistory();
    requestAnimationFrame(() => {
      const input = document.getElementById('ddNoteReply-' + id);
      if (input) input.focus();
    });
  }

  function closeDealNoteReply() {
    ddNoteReplyingId = null;
    ddRenderHistory();
  }

  function saveDealNoteReply(id) {
    const note = ddNoteById(id);
    const input = document.getElementById('ddNoteReply-' + id);
    const validation = document.getElementById('ddNoteReplyValidation-' + id);
    if (!note || !input) return;
    const body = input.value.trim();
    if (!body) {
      if (validation) validation.textContent = 'Write a reply first.';
      input.focus();
      return;
    }
    note.replies = note.replies || [];
    note.replies.push({
      id: Date.now(), body, author: CURRENT_USER, createdAt: new Date().toISOString()
    });
    ddNoteReplyingId = null;
    saveActivePipelineState();
    ddRenderHistory();
    qtShowSnackbar('Reply added to Note.', 'success');
  }

  function toggleDealNoteActionMenu(id, event) {
    if (event) event.stopPropagation();
    if (!ddNoteById(id)) return;
    ddNoteReactionPickerId = null;
    ddNoteActionMenuId = ddNoteActionMenuId === Number(id) ? null : Number(id);
    ddRenderHistory();
  }

  function openDealNoteEdit(id, event) {
    if (event) event.stopPropagation();
    const note = ddNoteById(id);
    if (!note || note.deletedAt) return;
    ddNoteActionMenuId = null;
    ddNoteReactionPickerId = null;
    ddNoteReplyingId = null;
    ddNoteEditingId = Number(id);
    ddRenderHistory();
    requestAnimationFrame(() => {
      const editor = document.getElementById('ddNoteEditBody-' + id);
      if (editor) editor.focus();
    });
  }

  function cancelDealNoteEdit() {
    ddNoteEditingId = null;
    ddRenderHistory();
  }

  function saveDealNoteEdit(id) {
    const note = ddNoteById(id);
    const titleInput = document.getElementById('ddNoteEditTitle-' + id);
    const editor = document.getElementById('ddNoteEditBody-' + id);
    const validation = document.getElementById('ddNoteEditValidation-' + id);
    if (!note || !titleInput || !editor) return;
    const bodyHtml = sanitizeDealNoteHtml(editor.innerHTML);
    const body = editor.innerText.replace(/\n{3,}/g, '\n\n').trim();
    if (!body) {
      validation.textContent = 'Write a note before saving.';
      editor.focus();
      return;
    }
    if (body.length > 1500) {
      validation.textContent = 'Keep the note under 1,500 characters.';
      editor.focus();
      return;
    }
    const formattedMentions = dealNoteMentionsFromHtml(bodyHtml);
    const textMentions = ddNotePeople().filter(name => body.includes('@' + name));
    note.title = titleInput.value.trim() || 'Note';
    note.body = body;
    note.bodyHtml = bodyHtml;
    note.mentions = [...new Set([...formattedMentions, ...textMentions])];
    note.editedAt = new Date().toISOString();
    note.editedBy = CURRENT_USER;
    ddNoteEditingId = null;
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    qtShowSnackbar('Note updated by ' + CURRENT_USER + '.', 'success');
  }

  function deleteDealNote(id, event) {
    if (event) event.stopPropagation();
    const note = ddNoteById(id);
    if (!note || note.deletedAt) return;
    const deal = ddDeal;
    const deletedAt = new Date().toISOString();
    note.deletedAt = deletedAt;
    note.deletedBy = CURRENT_USER;
    ddNoteActionMenuId = null;
    ddNoteReactionPickerId = null;
    ddNoteReplyingId = null;
    ddNoteEditingId = null;
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    qtShowSnackbar('Note deleted by ' + CURRENT_USER + '.', 'success', () => {
      if (note.deletedAt !== deletedAt) return;
      delete note.deletedAt;
      delete note.deletedBy;
      saveActivePipelineState();
      if (ddDeal === deal) {
        ddRenderFocus();
        ddRenderHistory();
      }
      qtShowSnackbar('Note restored.', 'success');
    }, 'Undo');
  }

  const DD_NOTE_REACTIONS = ['👍', '❤️', '🎉', '😂', '😮', '🙏'];

  function toggleDealNoteReactionPicker(id, event) {
    if (event) event.stopPropagation();
    if (!ddNoteById(id)) return;
    ddNoteReactionPickerId = ddNoteReactionPickerId === Number(id) ? null : Number(id);
    ddRenderHistory();
  }

  function toggleDealNoteReaction(id, emoji, event) {
    if (event) event.stopPropagation();
    const note = ddNoteById(id);
    if (!note || !DD_NOTE_REACTIONS.includes(emoji)) return;
    note.reactions = note.reactions || {};
    const people = Array.isArray(note.reactions[emoji]) ? note.reactions[emoji] : [];
    const currentIndex = people.indexOf(CURRENT_USER);
    if (currentIndex >= 0) people.splice(currentIndex, 1);
    else people.push(CURRENT_USER);
    if (people.length) note.reactions[emoji] = people;
    else delete note.reactions[emoji];
    ddNoteReactionPickerId = null;
    saveActivePipelineState();
    ddRenderHistory();
  }

  document.addEventListener('click', event => {
    let shouldRender = false;
    if (ddNoteReactionPickerId != null && !event.target.closest('.dd-note-reaction-wrap')) {
      ddNoteReactionPickerId = null;
      shouldRender = true;
    }
    if (ddNoteActionMenuId != null && !event.target.closest('.dd-note-action-wrap')) {
      ddNoteActionMenuId = null;
      shouldRender = true;
    }
    if (ddMeetingActionMenuId != null && !event.target.closest('.dd-meeting-action-wrap')) {
      ddMeetingActionMenuId = null;
      shouldRender = true;
    }
    if (shouldRender) ddRenderHistory();
  });

  const DD_MAX_FILE_SIZE = 25 * 1024 * 1024;

  function formatDealFileSize(bytes) {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return Math.max(1, Math.round(bytes / 1024)) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(bytes >= 10 * 1024 * 1024 ? 0 : 1) + ' MB';
  }

  function setDealFileDrag(active, event) {
    if (event) event.preventDefault();
    const dropzone = document.getElementById('ddFileDropzone');
    if (dropzone) dropzone.classList.toggle('dragging', !!active);
  }

  function handleDealFileDrop(event) {
    event.preventDefault();
    setDealFileDrag(false);
    handleDealFiles(event.dataTransfer && event.dataTransfer.files);
  }

  function handleDealFileSelect(input) {
    handleDealFiles(input.files);
    input.value = '';
  }

  function handleDealFiles(fileList) {
    if (!ddDeal || !fileList || !fileList.length) return;
    const files = [...fileList];
    const oversized = files.filter(file => file.size > DD_MAX_FILE_SIZE);
    const accepted = files.filter(file => file.size <= DD_MAX_FILE_SIZE);
    const validation = document.getElementById('ddFileValidation');
    if (oversized.length) {
      validation.textContent = oversized.map(file => file.name).join(', ') +
        (oversized.length === 1 ? ' is' : ' are') + ' larger than 25MB.';
    } else {
      validation.textContent = '';
    }
    if (!accepted.length) return;
    ddDeal.files = ddDeal.files || [];
    const records = accepted.map(file => ({
      id: Date.now() + Math.random(), name: file.name, size: file.size, type: file.type || '',
      uploadedAt: new Date().toISOString(), uploadedBy: CURRENT_USER
    }));
    ddDeal.files.push(...records);
    const linkedToRequest = window.WeQuoteAutomation && typeof window.WeQuoteAutomation.resolveFileRequestFromRecords === 'function'
      ? window.WeQuoteAutomation.resolveFileRequestFromRecords(ddDeal, records)
      : false;
    if (window.WeQuoteAutomation) {
      records.forEach(record => window.WeQuoteAutomation.emit('deal.file.added', {
        deal: ddDeal, file: record, field: 'file'
      }));
    }
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar(
      accepted.length === 1
        ? archiveEscape(accepted[0].name) + ' uploaded and added to History.' + (linkedToRequest ? ' Required request completed.' : '')
        : accepted.length + ' files uploaded and added to History.' + (linkedToRequest ? ' Required request completed.' : ''),
      'success'
    );
  }

  function ddWonTimestamp() {
    return 'Today, ' + new Date().toLocaleTimeString('en-GB', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(/\s/g, '').toLowerCase();
  }

  function ddWatcherNames() {
    if (!ddDeal) return [];
    if (!Array.isArray(ddDeal.watchers)) ddDeal.watchers = [CURRENT_USER];
    return ddDeal.watchers;
  }

  function ddWatcherInitials(name) {
    return String(name || '').split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  }

  function ddWatcherCandidates() {
    const owner = ddDeal && (ddDeal.ownerName || OWNER_NAMES[ddDeal.o]);
    return [...new Set([CURRENT_USER, owner, ...Object.values(OWNER_NAMES)].filter(Boolean))];
  }

  function ddSyncWatcherControl() {
    const trigger = document.getElementById('ddWatchingTrigger');
    const count = document.getElementById('ddWatchingCount');
    if (!trigger || !count || !ddDeal) return;
    const watchers = ddWatcherNames();
    const watching = watchers.includes(CURRENT_USER);
    count.textContent = watchers.length;
    trigger.classList.toggle('watching', watching);
    trigger.setAttribute('aria-label', watchers.length + ' ' + (watchers.length === 1 ? 'watcher' : 'watchers'));
    trigger.title = watching ? 'Watching this Deal' : 'Watch this Deal';
  }

  function ddRenderWatcherMenu() {
    const menu = document.getElementById('ddWatchingMenu');
    if (!menu || !ddDeal) return;
    const watchers = ddWatcherNames();
    const watching = watchers.includes(CURRENT_USER);
    const candidates = ddWatcherCandidates().filter(name => !watchers.includes(name));
    menu.innerHTML =
      '<button type="button" class="dd-watcher-toggle" role="menuitem" onclick="toggleCurrentDealWatching(event)">' +
        '<i class="fai">&#xf06e;</i><span>' + (watching ? 'Stop watching' : 'Start watching') + '</span><kbd>W</kbd>' +
      '</button>' +
      '<div class="dd-watcher-section-label">Watching this Deal</div>' +
      '<div class="dd-watcher-list">' + (watchers.length
        ? watchers.map(name => '<div class="dd-watcher-person"><span class="dd-watcher-avatar">' + ddWatcherInitials(name) + '</span><span class="dd-watcher-name">' + archiveEscape(name) + '</span>' +
          '<button type="button" class="dd-watcher-remove" data-watcher="' + archiveEscape(name) + '" onclick="removeDealWatcher(this.dataset.watcher,event)" aria-label="Remove ' + archiveEscape(name) + ' from watchers" title="Remove watcher"><i class="fai">&#xf00d;</i></button></div>').join('')
        : '<div class="dd-watcher-empty">No watchers yet</div>') +
      '</div>' +
      '<button type="button" class="dd-watcher-add" role="menuitem" aria-expanded="' + ddWatcherAdding + '" onclick="toggleDdWatcherPicker(event)">' +
        '<i class="fai">&#x2b;</i><span>Add watchers</span>' +
      '</button>' +
      (ddWatcherAdding
        ? '<div class="dd-watcher-picker">' + (candidates.length
          ? '<label class="dd-watcher-search"><i class="fai">&#xf002;</i><input id="ddWatcherSearch" type="search" autocomplete="off" placeholder="Search people" value="' + archiveEscape(ddWatcherQuery) + '" oninput="filterDdWatcherPicker(this.value)"></label>' +
            '<div class="dd-watcher-candidates">' + candidates.map(name => '<button type="button" data-watcher="' + archiveEscape(name) + '" data-watcher-search="' + archiveEscape(name.toLowerCase()) + '" onclick="addDealWatcher(this.dataset.watcher,event)"><span class="dd-watcher-avatar">' + ddWatcherInitials(name) + '</span><span>' + archiveEscape(name) + '</span></button>').join('') + '</div>' +
            '<div class="dd-watcher-no-results" id="ddWatcherNoResults" hidden>No people found.</div>'
          : '<div class="dd-watcher-empty">Everyone available is already watching.</div>') + '</div>'
        : '');
    if (ddWatcherAdding && ddWatcherQuery) requestAnimationFrame(() => filterDdWatcherPicker(ddWatcherQuery));
  }

  function toggleDdWatchers(event) {
    event.stopPropagation();
    const menu = document.getElementById('ddWatchingMenu');
    const trigger = document.getElementById('ddWatchingTrigger');
    const willOpen = !menu.classList.contains('open');
    closeDdKebab();
    ddWatcherAdding = false;
    ddWatcherQuery = '';
    if (willOpen) ddRenderWatcherMenu();
    menu.classList.toggle('open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  }

  function closeDdWatchers() {
    const menu = document.getElementById('ddWatchingMenu');
    const trigger = document.getElementById('ddWatchingTrigger');
    if (menu) menu.classList.remove('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    ddWatcherAdding = false;
    ddWatcherQuery = '';
  }

  function toggleCurrentDealWatching(event) {
    if (event) event.stopPropagation();
    if (!ddDeal) return;
    const watchers = ddWatcherNames();
    const index = watchers.indexOf(CURRENT_USER);
    if (index >= 0) watchers.splice(index, 1);
    else watchers.push(CURRENT_USER);
    recordDealActionEvent(ddDeal, {
      kind: 'deal-data', actionType: 'watcher',
      title: (index >= 0 ? 'Removed Deal watcher · ' : 'Added Deal watcher · ') + CURRENT_USER,
      author: CURRENT_USER
    });
    saveActivePipelineState();
    ddSyncWatcherControl();
    ddRenderWatcherMenu();
    ddRenderHistory();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.data.changed', {
      deal: ddDeal, pipeline: getActivePipeline(), field: 'watcher',
      change: index >= 0 ? 'removed' : 'added', value: CURRENT_USER
    });
    qtShowSnackbar(index >= 0 ? 'Stopped watching this Deal.' : 'You are now watching this Deal.', 'success');
  }

  function toggleDdWatcherPicker(event) {
    event.stopPropagation();
    ddWatcherAdding = !ddWatcherAdding;
    ddWatcherQuery = '';
    ddRenderWatcherMenu();
    if (ddWatcherAdding) requestAnimationFrame(() => document.getElementById('ddWatcherSearch')?.focus());
  }

  function filterDdWatcherPicker(value) {
    ddWatcherQuery = String(value || '').trim().toLowerCase();
    const buttons = [...document.querySelectorAll('#ddWatchingMenu .dd-watcher-candidates button')];
    let visible = 0;
    buttons.forEach(button => {
      const matches = !ddWatcherQuery || (button.dataset.watcherSearch || '').includes(ddWatcherQuery);
      button.hidden = !matches;
      if (matches) visible++;
    });
    const empty = document.getElementById('ddWatcherNoResults');
    if (empty) empty.hidden = visible > 0;
  }

  function addDealWatcher(name, event) {
    event.stopPropagation();
    if (!ddDeal || !name) return;
    const watchers = ddWatcherNames();
    if (watchers.includes(name)) return;
    watchers.push(name);
    recordDealActionEvent(ddDeal, {
      kind: 'deal-data', actionType: 'watcher', title: 'Added Deal watcher · ' + name, author: CURRENT_USER
    });
    saveActivePipelineState();
    ddSyncWatcherControl();
    ddRenderWatcherMenu();
    ddRenderHistory();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.data.changed', {
      deal: ddDeal, pipeline: getActivePipeline(), field: 'watcher', change: 'added', value: name
    });
  }

  function removeDealWatcher(name, event) {
    event.stopPropagation();
    if (!ddDeal || !name) return;
    const watchers = ddWatcherNames();
    const index = watchers.indexOf(name);
    if (index < 0) return;
    watchers.splice(index, 1);
    recordDealActionEvent(ddDeal, {
      kind: 'deal-data', actionType: 'watcher', title: 'Removed Deal watcher · ' + name, author: CURRENT_USER
    });
    saveActivePipelineState();
    ddSyncWatcherControl();
    ddRenderWatcherMenu();
    ddRenderHistory();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.data.changed', {
      deal: ddDeal, pipeline: getActivePipeline(), field: 'watcher', change: 'removed', value: name
    });
    qtShowSnackbar(name === CURRENT_USER ? 'Stopped watching this Deal.' : name + ' removed from watchers.', 'success');
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('#ddWatching')) closeDdWatchers();
  });

  document.addEventListener('keydown', event => {
    if (event.key.toLowerCase() !== 'w' || currentView !== 'deal' || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.target.matches('input, textarea, select, [contenteditable="true"]')) return;
    event.preventDefault();
    toggleCurrentDealWatching();
  });

  function ddSyncWonButton() {
    const button = document.getElementById('ddWonBtn');
    if (!button || !ddDeal) return;
    const outcome = CRM_STAGE_DEFS[ddDeal.s] && CRM_STAGE_DEFS[ddDeal.s].outcome;
    const isWon = outcome === 'won';
    const isLost = outcome === 'lost';

    button.disabled = Boolean(outcome);
    if (isWon) {
      const markedAt = ddDeal.wonAt || 'Today, 10:32am';
      button.innerHTML = '<span aria-hidden="true">&#10003;</span> Won';
      button.title = 'Marked as Won on ' + markedAt;
      button.setAttribute('aria-label', 'Deal marked as Won on ' + markedAt);
    } else if (isLost) {
      button.innerHTML = '<i class="fai">&#xf00d;</i> Lost';
      button.title = 'This Deal is marked as Lost';
      button.setAttribute('aria-label', 'Deal marked as Lost');
    } else {
      button.innerHTML = '<i class="fai">&#xf521;</i> Mark as Won';
      button.title = 'Mark this Deal as Won';
      button.setAttribute('aria-label', 'Mark this Deal as Won');
    }
  }

  function ddRenderStagebar() {
    const d = ddDeal;
    const progressionStages = CRM_STAGE_DEFS
      .map((def, index) => ({ def, index }))
      .filter(item => !item.def.outcome);
    const currentPosition = progressionStages.findIndex(item => item.index === d.s);
    const outcome = CRM_STAGE_DEFS[d.s] && CRM_STAGE_DEFS[d.s].outcome;
    const isOutcome = Boolean(outcome);
    document.getElementById('dd-stagebar').innerHTML =
      '<div class="dd-stage-track">' + progressionStages.map((item, position) => {
        const def = item.def;
        const cls = !isOutcome && position === currentPosition
          ? 'active'
          : (isOutcome || (currentPosition >= 0 && position < currentPosition) ? 'done' : '');
        return '<div class="dd-stage ' + cls + '" onclick="ddSetStage(' + item.index + ')" title="Move deal to ' + def.name + '">' +
          '<span class="nm">' + def.name + '</span>' +
          (cls === 'active' ? '<span class="days">' + d.d + ' day' + (d.d === 1 ? '' : 's') + '</span>' : '') +
        '</div>';
      }).join('') + '</div>';
  }

  // Clicking a chevron is a manual stage move — same effect as dragging the card on the board
  function ddSetStage(i) {
    if (!ddDeal || ddDeal.s === i) return;
    if (!commitDealMove(ddCard, i)) return;
    saveActivePipelineState();
    ddRenderStagebar();
    ddSyncWonButton();
  }

  function ddMoveCard(stageIdx) {
    if (!ddCard) return;
    const fresh = makeDealCard(ddDeal);
    ddCard.replaceWith(fresh);
    pipelineEl.querySelectorAll('.stage-body')[stageIdx].appendChild(fresh);
    ddCard = fresh;
    recalcPipeline();
  }

  function ddEditValue() {
    const next = prompt('Deal value', ddDeal.v > 0 ? ddDeal.v : '');
    if (next === null) return;
    const num = parseInt(String(next).replace(/[^0-9]/g, ''), 10);
    if (!num) return;
    ddDeal.v = num;
    if (ddCard) {
      ddCard.dataset.v = num;
      ddCard.querySelector('.deal-value').textContent = fmt(num);
      ddCard.querySelector('.deal-margin-value').textContent = ddDeal.margin != null ? fmt(ddDeal.margin) : '—';
      recalcPipeline();
    }
    openDealPage(ddDeal, ddCard);
  }

  // Quote panel — empty state (Figma) or the Quote/Revision/Variation/Change-Order model,
  // ported from wequote-complete-flow-v4.html + wequote-crm-quote-lifecycle-spec.md.
  // Quote relationships are explicit. An independent Quote adds to the Deal (AND); Quotes carrying
  // the same alternativeGroupId are choices (OR), so only one/highest active option contributes.
  // Revisions, Variations and Change Orders always stay inside their parent Quote.
  // Full quote status list, matching WeQuote's real status dropdown exactly (always shown in full —
  // this is a free-choice status field, not a filtered subset). Only 'accepted'/'complete' unlock the
  // Revision/Variation/Change-Order lifecycle (qIsWon); 'declined'/'cancelled'/'rejected' are terminal
  // "lost" states.
  const QUOTE_STATUS_LABEL = {
    draft: 'In Progress', cancelled: 'Cancelled', rejected: 'Rejected',
    review: 'In Review', reviewed: 'Passed Review',
    sent: 'Sent', accepted: 'Accepted', complete: 'Complete'
  };
  const QUOTE_STATUS_DOT = {
    draft: 'draft', cancelled: 'declined', rejected: 'declined',
    review: 'pending', reviewed: 'pending', sent: 'pending', accepted: 'accepted', complete: 'complete'
  };
  const QUOTE_STATUS_ALL = ['draft', 'cancelled', 'rejected', 'review', 'reviewed', 'sent', 'accepted', 'complete'];
  let nextVariationNo = 12343;
  // Variations and Change Orders use this exact same status list — no separate vocabulary. 'draft' is
  // the untitled/not-yet-filled-in placeholder state; 'accepted'/'complete' is the signed-off/locked
  // state; 'cancelled'/'rejected' are freely-revivable "didn't happen" states, same as a quote.
  const qStatusLocked = s => s === 'accepted' || s === 'complete';
  const qStatusLost = s => s === 'cancelled' || s === 'rejected';

  const qCurrentRev = q => q.revisions[q.revisions.length - 1];
  // More than one revision may be accepted, and NOT always in revision-number order — a dealer can
  // accept R2, then later go back and accept R1 too. "Latest" means most recently ACCEPTED IN TIME,
  // not highest n, so every accept action stamps an acceptSeq (see qtConfirmAcceptRevision) and this
  // picks the highest one. Ties (seed data with exactly one accepted revision) don't matter.
  const qLatestAcceptedRev = q => {
    const accepted = q.revisions.filter(r => r.status === 'accepted');
    if (!accepted.length) return null;
    return accepted.reduce((a, b) => (b.acceptSeq || 0) >= (a.acceptSeq || 0) ? b : a);
  };
  // "Won" must track whether ANY revision is actually accepted, not q.status — because creating a
  // later revision resets q.status back to 'draft' (that new revision hasn't been sent yet), and that
  // must never erase the fact that an earlier revision is still genuinely accepted and has real value.
  const qIsWon = q => !q.alternativeLost && (q.revisions.some(r => r.status === 'accepted') || q.status === 'complete');
  function quoteLifecycleStageName(quote, now = Date.now()) {
    if (!quote || quote.alternativeLost) return '';
    if (qIsWon(quote)) return 'Won';
    if (quote.status === 'cancelled') return 'Cancelled';
    if (quote.status === 'rejected' || quote.status === 'declined') return 'Lost';
    if (quote.status === 'sent' && quoteExpiryTimestamp(quote) > 0 && quoteExpiryTimestamp(quote) < now) return 'Lost';
    if (quote.status === 'sent') return 'Sent';
    if (quote.status === 'reviewed') return 'Passed Review';
    if (quote.status === 'review') return 'In Review';
    if (quote.status === 'draft') return 'In Progress';
    return 'Lost';
  }

  function derivedDealLifecycle(deal, now = Date.now()) {
    const quotes = (DEAL_QUOTES[deal.t] || []).filter(quote => !quote.alternativeLost);
    if (!quotes.length) return { stageName: 'Qualified', reason: 'No related Quote has been created' };
    if (quotes.some(qIsWon)) return { stageName: 'Won', reason: 'At least one related Quote is Accepted or Complete' };
    if (quotes.every(quote => quote.status === 'cancelled')) {
      return { archive: true, reason: 'All related Quotes are Cancelled' };
    }

    const priority = { 'In Progress': 1, 'In Review': 2, 'Passed Review': 3, Sent: 4 };
    const liveStages = quotes.map(quote => quoteLifecycleStageName(quote, now)).filter(name => priority[name]);
    if (liveStages.length) {
      const stageName = liveStages.reduce((best, name) => priority[name] > priority[best] ? name : best, liveStages[0]);
      return { stageName, reason: 'Furthest viable related Quote is ' + stageName };
    }
    return { stageName: 'Lost', reason: 'No viable related Quote remains' };
  }

  function syncDealStagesFromQuoteLifecycle(now = Date.now()) {
    if (!dealQuoteLifecycleReady || !pipelineUsesQuoteLifecycle(getActivePipeline())) return false;
    let changed = false;
    const systemArchiveCause = 'all-related-quotes-cancelled';

    CRM_DEALS.forEach(deal => {
      if (deal.archived && deal.archiveCause !== systemArchiveCause) return;
      const lifecycle = derivedDealLifecycle(deal, now);

      if (lifecycle.archive) {
        if (!deal.archived) {
          deal.archivedFromStageIndex = deal.s;
          deal.archivedFromStage = (CRM_STAGE_DEFS[deal.s] || {}).name || '';
          deal.archivedOutcome = (CRM_STAGE_DEFS[deal.s] || {}).outcome || 'open';
          deal.archivedAt = new Date(now).toISOString();
          deal.archivedBy = 'System · all Quotes cancelled';
          deal.archiveCause = systemArchiveCause;
          deal.archived = true;
          changed = true;
        }
        deal.stageDerivedReason = lifecycle.reason;
        return;
      }

      if (deal.archived && deal.archiveCause === systemArchiveCause) {
        deal.archived = false;
        delete deal.archiveCause;
        delete deal.archivedAt;
        delete deal.archivedBy;
        changed = true;
      }

      const currentStage = CRM_STAGE_DEFS[deal.s] || {};
      const currentCustomStageStillMatches = !currentStage.protected && currentStage.lifecycleSegment === lifecycle.stageName;
      const targetIndex = CRM_STAGE_DEFS.findIndex(stage => stage.protected && stage.name === lifecycle.stageName);
      if (!currentCustomStageStillMatches && targetIndex >= 0 && deal.s !== targetIndex) {
        deal.s = targetIndex;
        changed = true;
      }
      deal.stageDerivedFromQuote = true;
      deal.stageDerivedReason = lifecycle.reason;
    });
    return changed;
  }
  const qBaselineVal = q => { const r = qLatestAcceptedRev(q); return r ? r.value : (qIsWon(q) ? qCurrentRev(q).value : 0); };
  // Change orders / variations hang off the latest accepted revision. Once any exist, every earlier
  // revision is frozen — you can't go back and re-decide a revision that already has signed-off work.
  const qHasDownstreamWork = q => q.cos.length > 0 || q.variations.length > 0;
  const coVarTotal = (q, co) => co.varIds.reduce((s, vi) => s + q.variations[vi].value, 0);
  const coAdjTotal = co => (co.adjustments || []).reduce((s, a) => s + a.value, 0);
  const coTotal = (q, co) => coVarTotal(q, co) + coAdjTotal(co);
  const qOpenCo = q => q.cos.find(c => c.status === 'draft');
  const qBlockingCo = q => q.cos.find(c => !qStatusLocked(c.status) && !qStatusLost(c.status));
  function qUnbundled(q) {
    const bundled = new Set();
    q.cos.forEach(co => co.varIds.forEach(vi => bundled.add(vi)));
    const out = [];
    q.variations.forEach((v, vi) => { if (v.status === 'accepted' && !bundled.has(vi)) out.push(vi); });
    return out;
  }
  const qIsLive = q => !q.alternativeLost && q.status !== 'declined' && !qStatusLost(q.status);
  const qAcceptTime = q => Math.max(0, ...q.revisions.map(r => r.status === 'accepted' ? (r.acceptSeq || 1) : 0));
  function qOwnPipelineRange(q) {
    if (!qIsWon(q)) {
      const v = qIsLive(q) ? qCurrentRev(q).value : 0;
      return { low: v, high: v };
    }
    let low = qBaselineVal(q), high = low;
    q.cos.forEach(co => {
      const total = coTotal(q, co);
      if (qStatusLocked(co.status)) { low += total; high += total; }
      else if (!qStatusLost(co.status)) {
        if (total > 0) high += total;
        else if (total < 0) low += total;
      }
    });
    return { low, high };
  }
  function qAlternativeBuckets(quotes) {
    const independent = [], groups = new Map();
    quotes.forEach((q, qi) => {
      if (!q.alternativeGroupId) independent.push({ q, qi });
      else {
        if (!groups.has(q.alternativeGroupId)) groups.set(q.alternativeGroupId, []);
        groups.get(q.alternativeGroupId).push({ q, qi });
      }
    });
    return { independent, groups };
  }
  function qAlternativeWinner(members) {
    const won = members.filter(({ q }) => qIsWon(q));
    if (!won.length) return null;
    return won.reduce((a, b) => qAcceptTime(b.q) >= qAcceptTime(a.q) ? b : a);
  }
  // Contract Value is signed money only. Independent Quotes add together; an Alternative group can
  // contribute one accepted winner only.
  function dealContractValue(quotes) {
    const buckets = qAlternativeBuckets(quotes);
    const counted = buckets.independent.filter(({ q }) => qIsWon(q));
    buckets.groups.forEach(members => {
      const winner = qAlternativeWinner(members);
      if (winner) counted.push(winner);
    });
    return counted.reduce((total, { q }) => {
      let own = qBaselineVal(q);
      q.cos.forEach(co => { if (qStatusLocked(co.status)) own += coTotal(q, co); });
      return total + own;
    }, 0);
  }
  // Pipeline estimate follows the same visible relationship: independent Quotes are AND, while each
  // Alternative group is OR and contributes its accepted winner or highest live option.
  function dealValueRange(quotes) {
    const buckets = qAlternativeBuckets(quotes);
    let low = 0, high = 0;
    buckets.independent.forEach(({ q }) => {
      const range = qOwnPipelineRange(q);
      low += range.low; high += range.high;
    });
    buckets.groups.forEach(members => {
      const winner = qAlternativeWinner(members);
      if (winner) {
        const range = qOwnPipelineRange(winner.q);
        low += range.low; high += range.high;
        return;
      }
      const live = members.filter(({ q }) => qIsLive(q));
      if (!live.length) return;
      const ranges = live.map(({ q }) => qOwnPipelineRange(q));
      low += Math.min(...ranges.map(range => range.low));
      high += Math.max(...ranges.map(range => range.high));
    });
    return { low, high };
  }

  // Deal-level margin ratio applied to a single quote's own current/baseline value, for the
  // per-quote "Margin value" column
  function quoteMarginStr(v) {
    if (!(v > 0)) return '&mdash;';
    return fmt(Math.round(v * 0.20));
  }

  function dealQuoteSummaryHtml(d, quotes) {
    const range = dealValueRange(quotes);
    const high = range.high;
    // Pipeline estimate is a monetary total. A computed zero is a real value, not missing data.
    const dealValStr = high <= 0 ? '£0.00' : (range.low === high ? fmt(high) : fmt(range.low) + '&ndash;' + fmt(high));
    const won = quotes.some(qIsWon);
    const signedVal = won ? dealContractValue(quotes) : 0;
    const m = DEAL_MARGINS[d.t] || { dealProduct: 0, dealLabour: 0, signedProduct: 0, signedLabour: 0 };
    const dealTotal = m.dealProduct + m.dealLabour;
    const dealPct = high > 0 ? (dealTotal / high * 100) : 0;
    const dealProductPct = high > 0 ? (m.dealProduct / high * 100) : 0;
    const dealLabourPct = high > 0 ? (m.dealLabour / high * 100) : 0;
    const signedTotal = m.signedProduct + m.signedLabour;
    const signedPct = signedVal > 0 ? (signedTotal / signedVal * 100) : 0;
    const signedProductPct = signedVal > 0 ? (m.signedProduct / signedVal * 100) : 0;
    const signedLabourPct = signedVal > 0 ? (m.signedLabour / signedVal * 100) : 0;
    const pct1 = n => n.toFixed(1) + '%';

    return {
      dealValStr, won, signedVal,
      html:
        '<div class="dd-qc-cols">' +
          '<div class="dd-qc-col">' +
            '<div class="dd-qc-headline"><span class="dd-qc-lbl">Total deal value (Pipeline estimate)</span><span class="val">' + dealValStr + '</span></div>' +
            '<div class="dd-qc-margintotal">' +
              '<span class="dd-qc-lbl">Total deal margin</span>' +
              '<span class="row amber">' + fmt(dealTotal) + ' <span>' + pct1(dealPct) + '</span></span>' +
            '</div>' +
            '<div class="dd-qc-subgrid">' +
              '<div class="sub"><span class="dd-qc-lbl">Product margin</span><span class="val">' + fmt(m.dealProduct) + ' &middot; ' + pct1(dealProductPct) + '</span></div>' +
              '<div class="sub"><span class="dd-qc-lbl">Labour margin</span><span class="val">' + fmt(m.dealLabour) + ' &middot; ' + pct1(dealLabourPct) + '</span></div>' +
            '</div>' +
          '</div>' +
          '<div class="dd-qc-col">' +
            '<div class="dd-qc-headline"><span class="dd-qc-lbl">Total Signed contract value</span><span class="val signed">' + (won ? fmt(signedVal) : '&mdash;') + '</span></div>' +
            (won
              ? '<div class="dd-qc-margintotal">' +
                  '<span class="dd-qc-lbl">Total signed contract margin</span>' +
                  '<span class="row signed">' + fmt(signedTotal) + ' <span>' + pct1(signedPct) + '</span></span>' +
                '</div>' +
                '<div class="dd-qc-subgrid">' +
                  '<div class="sub"><span class="dd-qc-lbl">Product margin</span><span class="val">' + fmt(m.signedProduct) + ' &middot; ' + pct1(signedProductPct) + '</span></div>' +
                  '<div class="sub"><span class="dd-qc-lbl">Labour margin</span><span class="val">' + fmt(m.signedLabour) + ' &middot; ' + pct1(signedLabourPct) + '</span></div>' +
                '</div>'
              : '<div class="dd-qc-margintotal"><span class="dd-qc-lbl">Total signed contract margin</span><span class="row empty">Not yet signed</span></div>') +
          '</div>' +
        '</div>'
    };
  }

  function linkedQuoteSummaryHtml(quotes) {
    return '<div class="dd-qc-linked"><div class="dd-qc-linked-head"><span>Linked quotes</span>' +
      '<span>' + quotes.length + ' linked</span></div>' + quotes.map((q, qi) => {
        const current = qCurrentRev(q);
        const comments = q.comments || [];
        const latestComment = comments[comments.length - 1];
        const status = QUOTE_STATUS_LABEL[q.status] || 'Draft';
        return '<button type="button" class="dd-qc-linked-row" onclick="openQuoteListOverlay()">' +
          '<span class="dd-qc-linked-id"><strong>Quote #' + archiveEscape(q.no) + '</strong>' +
            '<small>R' + archiveEscape(current.n) + ' · ' + archiveEscape(q.desc || 'Untitled') + '</small></span>' +
          '<span class="dd-qc-linked-status"><i class="sq ' + (QUOTE_STATUS_DOT[q.status] || 'draft') + '"></i>' +
            archiveEscape(status) + '</span>' +
          (latestComment
            ? '<span class="dd-qc-comment"><i class="fai">&#xf075;</i><span><strong>' + comments.length +
              ' comment' + (comments.length === 1 ? '' : 's') + ' on R' + archiveEscape(latestComment.revision || current.n) +
              '</strong><small>' + archiveEscape(latestComment.author || 'Customer') + ': ' +
              archiveEscape(latestComment.body) + '</small></span></span>'
            : '<span class="dd-qc-no-comment">No comments</span>') +
          '<i class="fai dd-qc-linked-open">&#xf054;</i></button>';
      }).join('') + '</div>';
  }

  function dealQuoteCardHtml(q, qi, options) {
    options = options || {};
    const cur = qCurrentRev(q);
    const value = qIsWon(q) ? qBaselineVal(q) : cur.value;
    const valStr = value > 0 ? fmt(value) : '&mdash;';
    const marginStr = quoteMarginStr(value);
    const selected = qtAltSelected.has(qi);
    const visibleRevisionCount = (qtOnlyVersion
      ? q.revisions.filter(r => r.status !== 'declined')
      : q.revisions
    ).length;
    const railState = visibleRevisionCount > 1 ? ' has-revision-history' : ' single-revision';
    const winner = qIsWon(q);
    const canSetWinner = !winner && qtQuoteHasAcceptedOutcome(q) && !!q.alternativeGroupId;
    const highestBadge = options.highest ? '<span class="qt-highest-margin">Highest Margin</span>' : '';
    const winnerBadge = '<span class="qt-winner-badge" title="This Quote contains the accepted Revision"><i class="fai">&#xf521;</i> Winner</span>';
    return '<div class="dd-qlist' + (qStatusLost(q.status) ? ' declined' : '') +
      (options.resolved && !winner ? ' qt-not-winner' : '') +
      (selected ? ' qt-selected' : '') + '" data-quote-index="' + qi + '">' +
      '<div class="dd-qlrow">' +
        (options.selectable
          ? '<button type="button" class="qt-alt-check' + (selected ? ' checked' : '') + '" ' +
              'aria-label="Select Quote #' + q.no + '" aria-pressed="' + selected + '" ' +
              'onclick="qtToggleQuoteSelection(' + qi + ')">' + (selected ? '<i class="fai">&#xf00c;</i>' : '') + '</button>'
          : '') +
        '<div class="name' + (winner ? ' is-winner' : '') + '">' +
          (winner
            ? '<div class="quote-outcome-line">' + winnerBadge + highestBadge + '</div>' +
              '<div class="quote-identity"><div class="qno-line"><div class="qno">Quote #' + q.no + '</div></div>' +
                '<div class="desc">' + (q.desc || 'Untitled') + '</div></div>'
            : '<div class="qno-line"><div class="qno">Quote #' + q.no + '</div>' + highestBadge + '</div>') +
          (winner ? '' : '<div class="desc">' + (q.desc || 'Untitled') + '</div>') +
        '</div>' +
        (canSetWinner
          ? '<button type="button" class="qt-set-winner" onclick="qtOpenSetWinnerModal(' + qi + ')"><i class="fai">&#xf521;</i> Set as winner</button>'
          : '') +
        '<div class="stats">' +
          '<div class="stat"><span class="lbl">Quote value</span><span class="val">' + valStr + '</span></div>' +
          '<div class="stat"><span class="lbl">Margin value</span><span class="val signed">' + marginStr + '</span></div>' +
        '</div>' +
        '<button class="unlink" title="Unlink quote from this deal" aria-label="Unlink Quote #' + q.no + ' from this deal" onclick="ddUnlinkQuote(' + qi + ')"><i class="fai">&#xf127;</i></button>' +
      '</div>' +
      '<div class="qt-rail' + railState + '" data-quote-index="' + qi + '">' + quoteTimelineHtml(q, qi) + '</div>' +
    '</div>';
  }

  function qtAlternativeGroupName(id) {
    return 'Alternative group ' + String(id || '').replace(/^ALT-/i, '');
  }

  function dealQuoteSelectionHtml(quotes) {
    return '<div class="qt-alt-list">' + quotes.map((q, qi) => {
      const selected = qtAltSelected.has(qi);
      const value = qIsWon(q) ? qBaselineVal(q) : qCurrentRev(q).value;
      const state = q.status;
      const label = QUOTE_STATUS_LABEL[state] || (state === 'declined' ? 'Rejected' : 'Draft');
      const dot = QUOTE_STATUS_DOT[state] || (state === 'declined' ? 'declined' : 'draft');
      return '<div class="qt-alt-select-row' + (selected ? ' selected' : '') + '">' +
        '<button type="button" class="qt-alt-check' + (selected ? ' checked' : '') + '" aria-label="Select Quote #' + q.no + '" aria-pressed="' + selected + '" onclick="qtToggleQuoteSelection(' + qi + ')">' +
          (selected ? '<i class="fai">&#xf00c;</i>' : '') +
        '</button>' +
        '<div class="qt-alt-name">' +
          '<span class="qno">Quote #' + q.no + '</span>' +
          '<span class="desc">' + (q.desc || 'Untitled') + '</span>' +
          (q.alternativeGroupId ? '<span class="qt-alt-membership"><i class="fai">&#xf247;</i> ' + qtAlternativeGroupName(q.alternativeGroupId) +
            (q.alternativeLost ? ' · not counted' : '') + '</span>' : '') +
        '</div>' +
        '<div class="qt-alt-status"><span class="sq ' + dot + '"></span><span>' + label + '</span></div>' +
        '<div class="qt-alt-stat"><span class="lbl">Value</span><span class="val">' + (value > 0 ? fmt(value) : '&mdash;') + '</span></div>' +
        '<div class="qt-alt-stat margin"><span class="lbl">Margin value</span><span class="val signed">' + quoteMarginStr(value) + '</span></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function dealQuoteListHtml(quotes) {
    const renderedGroups = new Set();
    return quotes.map((q, qi) => {
      if (!q.alternativeGroupId) return dealQuoteCardHtml(q, qi);
      if (renderedGroups.has(q.alternativeGroupId)) return '';
      renderedGroups.add(q.alternativeGroupId);
      const members = quotes.map((member, memberIndex) => ({ member, memberIndex }))
        .filter(({ member }) => member.alternativeGroupId === q.alternativeGroupId);
      const liveMembers = members.filter(({ member }) => qIsLive(member));
      // qAlternativeWinner consumes the shared { q, qi } shape. The group renderer keeps
      // the more descriptive { member, memberIndex } names for its own template, so adapt
      // the entries here instead of passing undefined quotes into qIsWon().
      const accepted = qAlternativeWinner(members.map(({ member, memberIndex }) => ({
        q: member,
        qi: memberIndex
      })));
      const valueOf = entry => qIsWon(entry.member) ? qBaselineVal(entry.member) : qCurrentRev(entry.member).value;
      const marginOf = entry => Math.round(valueOf(entry) * .2);
      const candidates = accepted
        ? [{ member: accepted.q, memberIndex: accepted.qi }]
        : liveMembers;
      const highestValue = candidates.length
        ? candidates.reduce((best, entry) => valueOf(entry) > valueOf(best) ? entry : best)
        : null;
      const highestMargin = candidates.length
        ? candidates.reduce((best, entry) => marginOf(entry) > marginOf(best) ? entry : best)
        : null;
      const sortedMembers = members.slice().sort((a, b) => {
        if (qtQuoteSort === 'margin-asc') return marginOf(a) - marginOf(b);
        if (qtQuoteSort === 'value-desc') return valueOf(b) - valueOf(a);
        if (qtQuoteSort === 'value-asc') return valueOf(a) - valueOf(b);
        if (qtQuoteSort === 'status-asc') {
          const aStatus = QUOTE_STATUS_LABEL[a.member.status] || a.member.status || '';
          const bStatus = QUOTE_STATUS_LABEL[b.member.status] || b.member.status || '';
          return aStatus.localeCompare(bStatus);
        }
        return marginOf(b) - marginOf(a);
      });
      return '<section class="qt-alt-group">' +
        '<div class="qt-alt-group-head">' +
          '<div class="qt-alt-group-controls">' +
            '<div class="qt-alt-group-title">' + members.length + ' Quotes in group</div>' +
            '<div class="qt-alt-group-sort"><label for="qtQuoteSort">Sort by</label>' +
              '<select id="qtQuoteSort" onchange="qtSetQuoteSort(this.value)">' +
                '<option value="margin-desc"' + (qtQuoteSort === 'margin-desc' ? ' selected' : '') + '>Margin: High to Low</option>' +
                '<option value="margin-asc"' + (qtQuoteSort === 'margin-asc' ? ' selected' : '') + '>Margin: Low to High</option>' +
                '<option value="value-desc"' + (qtQuoteSort === 'value-desc' ? ' selected' : '') + '>Quote value: High to Low</option>' +
                '<option value="value-asc"' + (qtQuoteSort === 'value-asc' ? ' selected' : '') + '>Quote value: Low to High</option>' +
                '<option value="status-asc"' + (qtQuoteSort === 'status-asc' ? ' selected' : '') + '>Status: A to Z</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="qt-alt-group-highest">' +
            '<span class="label">' + (accepted ? 'Winner' : 'The highest quote value') + '</span>' +
            (highestValue
              ? '<span class="detail"><span>Quote #' + highestValue.member.no + '</span><strong>' + fmt(valueOf(highestValue)) + '</strong></span>'
              : '<span class="detail"><span>No active Quote</span><strong>&mdash;</strong></span>') +
          '</div>' +
        '</div>' +
        '<div class="qt-alt-group-cards">' +
          sortedMembers.map(({ member, memberIndex }) => dealQuoteCardHtml(member, memberIndex, {
            selectable: members.length > 1,
            resolved: !!accepted,
            highest: !!highestMargin && memberIndex === highestMargin.memberIndex
          })).join('') +
        '</div>' +
      '</section>';
    }).join('');
  }

  // "View N Quote(s)" pop-out (Figma DS – WeQuote Platform, node 2772-109938) — a modal, not an inline expand.
  // Each quote's own Revision/Variation/Change-Order timeline (node 2726-63146) renders inline below it, per quote.
  function openQuoteListOverlay() {
    const d = ddDeal, quotes = DEAL_QUOTES[d.t];
    if (!quotes) return;
    qtEnsureAutomaticQuoteAlternatives(quotes);
    // Opening the workspace is a fresh interaction. Never carry a half-finished selection
    // from a previous close/error into the newly opened modal.
    qtAltSelected.clear();
    qtVariationSelected.clear();
    renderQuoteListOverlay();
    document.getElementById('quoteListOverlay').classList.add('open');
  }
  function openQuoteFromHistory(quoteNo) {
    const quotes = ddDeal ? (DEAL_QUOTES[ddDeal.t] || []) : [];
    const quoteIndex = quotes.findIndex(quote => String(quote.no) === String(quoteNo));
    if (quoteIndex < 0) return;
    openQuoteListOverlay();
    requestAnimationFrame(() => {
      const target = document.querySelector('#qlo-rows .dd-qlist[data-quote-index="' + quoteIndex + '"]');
      if (!target) return;
      target.classList.add('history-target');
      target.setAttribute('tabindex', '-1');
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.focus({ preventScroll: true });
      setTimeout(() => target.classList.remove('history-target'), 1800);
    });
  }
  function closeQuoteListOverlay() {
    document.getElementById('quoteListOverlay').classList.remove('open');
    qtAltSelected.clear();
    qtVariationSelected.clear();
  }
  function renderQuoteListOverlay() {
    const d = ddDeal, quotes = DEAL_QUOTES[d.t];
    if (!quotes) { closeQuoteListOverlay(); return; }
    qtEnsureAutomaticQuoteAlternatives(quotes);
    const summary = dealQuoteSummaryHtml(d, quotes);
    const modal = document.querySelector('#quoteListOverlay .qlo-modal');
    modal.classList.remove('managing-alternatives');
    modal.classList.toggle('has-alt-selection', qtAltSelected.size > 0 || qtVariationSelected.size > 0);
    document.getElementById('qlo-topbar').innerHTML =
      '<div class="qlo-headleft">' +
        '<span class="dd-qc-count">Total ' + quotes.length + ' Quote' + (quotes.length === 1 ? '' : 's') + ' linked</span>' +
        '<button type="button" class="qt-toggle' + (qtOnlyVersion ? ' on' : '') + '" onclick="qtToggleOnlyVersion()" ' +
          'aria-pressed="' + qtOnlyVersion + '" title="Hide declined revisions and rejected or cancelled Variations and Change Orders. Accepted records stay visible.">' +
          '<span>Hide inactive history</span><span class="sw"></span>' +
        '</button>' +
      '</div>' +
      '<div class="qlo-headright">' +
        '<div class="dd-qc-minisummary">' +
          '<span class="pair"><span class="lbl">Total deal value (Estimate)</span><span class="val">' + summary.dealValStr + '</span></span>' +
          '<span class="pair"><span class="lbl">Total signed contract value</span><span class="val signed">' + (summary.won ? fmt(summary.signedVal) : '&mdash;') + '</span></span>' +
        '</div>' +
        '<div class="dd-qc-topbtns">' +
          '<button class="create" onclick="ddCreateQuote()"><i class="fai">&#x2b;</i> Create</button>' +
          '<button class="link"><i class="fai">&#xf0c1;</i> Link Quote</button>' +
        '</div>' +
      '</div>';
    document.getElementById('qlo-summary').innerHTML = summary.html;
    document.getElementById('qlo-rows').innerHTML = dealQuoteListHtml(quotes);
    qtRenderAlternativeToolbar(quotes);
    // Cards can wrap at different modal widths, so draw after layout rather than guessing row heights.
    requestAnimationFrame(qtRenderAllConnectors);
  }

  const signedMoneyStr = n => (n < 0 ? '-' : '+') + fmt(Math.abs(n));

  // Figma node 2726:63148: one continuous history spine. Top-level revisions sit on the main
  // lane; nested Change Orders and Variations sit on the offset lane. A smooth S bend moves between
  // lanes and automatically returns to the main lane when a later revision follows.
  function qtConnectorPath(points) {
    if (!points.length) return '';
    let d = 'M ' + points[0].x + ' ' + points[0].y;
    for (let i = 1; i < points.length; i++) {
      const a = points[i - 1], b = points[i];
      if (Math.abs(a.x - b.x) < 0.5) {
        d += ' L ' + b.x + ' ' + b.y;
        continue;
      }
      // Route lane changes around cards, never underneath them. Moving right waits until the
      // previous (Revision) card has ended; moving left finishes before the next Revision begins.
      const movingRight = b.x > a.x;
      let startY = movingRight ? Math.max(a.y, a.nodeBottom) : a.y;
      let endY = movingRight ? b.y : Math.min(b.y, b.nodeTop);
      if (endY - startY < 8) {
        const midY = a.y + Math.max(0, b.y - a.y) / 2;
        startY = Math.max(a.y, midY - 4);
        endY = Math.min(b.y, midY + 4);
      }
      const curveGap = Math.max(1, endY - startY);
      d += ' L ' + a.x + ' ' + startY +
        ' C ' + a.x + ' ' + (startY + curveGap * .45) + ', ' +
          b.x + ' ' + (endY - curveGap * .45) + ', ' + b.x + ' ' + endY +
        ' L ' + b.x + ' ' + b.y;
    }
    return d;
  }
  let qtPendingJourney = null;
  function qtRenderConnector(rail) {
    rail.querySelectorAll(':scope > .qt-connectors').forEach(svg => svg.remove());
    if (!rail.classList.contains('has-revision-history')) {
      if (qtPendingJourney && Number(rail.dataset.quoteIndex) === qtPendingJourney.qi) qtPendingJourney = null;
      return;
    }
    const railRect = rail.getBoundingClientRect();
    const dots = [...rail.querySelectorAll(':scope > .qt-node > .qt-dot:not(.qt-dot-hidden)')];
    if (dots.length < 2 || !railRect.width || !railRect.height) return;
    const points = dots.map(dot => {
      const r = dot.getBoundingClientRect();
      const nodeRect = dot.parentElement.getBoundingClientRect();
      return {
        x: +(r.left + r.width / 2 - railRect.left).toFixed(2),
        y: +(r.top + r.height / 2 - railRect.top).toFixed(2),
        nodeTop: +(nodeRect.top - railRect.top).toFixed(2),
        nodeBottom: +(nodeRect.bottom - railRect.top).toFixed(2),
        key: dot.parentElement.dataset.qtKey || ''
      };
    });
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'qt-connectors');
    svg.setAttribute('viewBox', '0 0 ' + railRect.width + ' ' + railRect.height);
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'qt-spine');
    path.setAttribute('d', qtConnectorPath(points));
    path.setAttribute('pathLength', '1');
    svg.appendChild(path);
    // Animate only when an action has just created this exact station. The pending flag is consumed
    // immediately, so opening the modal again, resizing it or changing status never replays it.
    const creationMessageOpen = document.getElementById('quoteCreatedOverlay').classList.contains('open');
    if (!creationMessageOpen && qtPendingJourney && Number(rail.dataset.quoteIndex) === qtPendingJourney.qi) {
      const targetIndex = points.findIndex(point => point.key === qtPendingJourney.key);
      if (targetIndex > 0) {
        const journey = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        journey.setAttribute('class', 'qt-journey');
        journey.setAttribute('d', qtConnectorPath(points.slice(targetIndex - 1, targetIndex + 1)));
        journey.setAttribute('pathLength', '1');
        svg.appendChild(journey);
        dots[targetIndex].parentElement.classList.add('qt-arriving');
      }
      qtPendingJourney = null;
    }
    rail.prepend(svg);
  }
  function qtRenderAllConnectors() {
    document.querySelectorAll('#qlo-rows .qt-rail').forEach(qtRenderConnector);
  }
  let qtConnectorResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(qtConnectorResizeTimer);
    qtConnectorResizeTimer = setTimeout(qtRenderAllConnectors, 80);
  });

  // A settled status carries a "<Status> on <when>" sub-line under the dropdown (Figma node
  // 2726-52029). There are no real timestamps in this mockup, so the demo time matches Figma's.
  const qtStatusStamp = s => (qStatusLocked(s) || qStatusLost(s)) ? QUOTE_STATUS_LABEL[s] + ' on Today, 10:32am' : '';
  // options: [{value, label, dotClass, current, disabled}] — the current:true entry drives the shown square colour.
  function qtStatusSelectHtml(options, onchange, subLabel) {
    const shown = options.find(o => o.current) || options[0];
    return '<div class="qt-statusbox">' +
      '<div class="l1"><span class="sq ' + shown.dotClass + '"></span>' +
        '<select class="qt-sel" onchange="' + onchange + '">' +
          options.map(o => '<option value="' + o.value + '"' + (o.current ? ' selected' : '') + (o.disabled ? ' disabled' : '') + '>' + o.label + '</option>').join('') +
        '</select>' +
      '</div>' +
      (subLabel ? '<div class="l2">' + subLabel + '</div>' : '') +
    '</div>';
  }
  function qtValueMarginHtml(value, signedValue) {
    if (value === 0) return '<div class="qt-stats">' +
      '<div class="qt-stat"><span class="lbl">Value</span><span class="val">&mdash;</span></div>' +
      '<div class="qt-stat"><span class="lbl">Margin value</span><span class="val">&mdash;</span></div>' +
    '</div>';
    const margin = Math.round(value * 0.2);
    return '<div class="qt-stats">' +
      '<div class="qt-stat"><span class="lbl">Value</span><span class="val">' + (signedValue ? signedMoneyStr(value) : fmt(value)) + '</span></div>' +
      '<div class="qt-stat"><span class="lbl">Margin value</span><span class="val ' + (margin < 0 ? 'neg' : 'pos') + '">' + signedMoneyStr(margin) + '</span></div>' +
    '</div>';
  }

  // Quote Detail Timeline (Figma DS – WeQuote Platform, node 2726-63146), rendered inline per quote inside
  // #quoteListOverlay — not a separate drill-down modal. Every qt* action takes an explicit quote index (qi)
  // since several quotes' timelines can be on screen at once.
  // Ported from wequote-complete-flow-v4.html / wequote-crm-quote-lifecycle-spec.md §5/§8/§9/§10.
  let qtOnlyVersion = false;
  let qtQuoteSort = 'margin-desc';
  const qtAltSelected = new Set();
  const qtVariationSelected = new Set();
  const qtExpandedResolvedVariationGroups = new Set();

  function qtToggleQuoteSelection(qi) {
    qtVariationSelected.clear();
    if (qtAltSelected.has(qi)) qtAltSelected.delete(qi);
    else qtAltSelected.add(qi);
    renderQuoteListOverlay();
  }
  function qtClearAlternativeSelection() {
    qtAltSelected.clear();
    qtVariationSelected.clear();
    renderQuoteListOverlay();
  }
  function qtSetQuoteSort(value) {
    qtQuoteSort = value;
    renderQuoteListOverlay();
  }
  function qtNextAlternativeGroupId(quotes) {
    const used = new Set(quotes.map(q => q.alternativeGroupId).filter(Boolean));
    let n = 1;
    while (used.has('ALT-' + n)) n++;
    return 'ALT-' + n;
  }
  function qtNormaliseAlternativeGroups(quotes) {
    const counts = new Map();
    quotes.forEach(q => {
      if (q.alternativeGroupId) counts.set(q.alternativeGroupId, (counts.get(q.alternativeGroupId) || 0) + 1);
    });
    quotes.forEach(q => {
      if (q.alternativeGroupId && counts.get(q.alternativeGroupId) < 2) {
        q.alternativeGroupId = null;
        q.alternativeLost = false;
      }
    });
  }
  function qtApplyAlternativeWinner(quotes, winnerIndex) {
    const winner = quotes[winnerIndex];
    if (!winner || !winner.alternativeGroupId) return;
    winner.alternativeLost = false;
    quotes.forEach((q, qi) => {
      if (qi === winnerIndex || q.alternativeGroupId !== winner.alternativeGroupId) return;
      // A Quote group is an either/or choice. Once one Quote is accepted, every sibling Quote
      // is rejected. If the customer later accepts another option, this function runs again and
      // the latest accepted Quote becomes the Winner while the previous Winner is rejected.
      q.alternativeLost = true;
      q.status = 'rejected';
      q.acceptedRev = null;
      q.revisions.forEach(revision => {
        if (revision.status === 'accepted') revision.status = 'declined';
      });
    });
  }

  const qtQuoteHasAcceptedOutcome = q =>
    q.revisions.some(revision => revision.status === 'accepted') || q.status === 'complete';

  // A Deal owns one commercial choice set. Its first Quote stands alone; adding a second Quote
  // automatically turns every top-level Quote on that Deal into an either/or option. This keeps
  // the relationship deterministic and removes the need for users to create or dismantle groups.
  function qtEnsureAutomaticQuoteAlternatives(quotes) {
    if (!quotes || !quotes.length) return;
    if (quotes.length === 1) {
      quotes[0].alternativeGroupId = null;
      quotes[0].alternativeLost = false;
      return;
    }

    quotes.forEach(q => {
      q.alternativeGroupId = 'ALT-1';
      q.alternativeLost = false;
    });

    const winner = qAlternativeWinner(quotes.map((q, qi) => ({ q, qi })));
    if (winner) qtApplyAlternativeWinner(quotes, winner.qi);
  }

  function qtAcceptedAlternativeQuote(quotes, qi) {
    const q = quotes[qi];
    if (!q || !q.alternativeGroupId) return null;
    const members = quotes.map((member, memberIndex) => ({ q: member, qi: memberIndex }))
      .filter(({ q: member }) => member.alternativeGroupId === q.alternativeGroupId);
    const winner = qAlternativeWinner(members);
    return winner && winner.qi !== qi ? winner : null;
  }

  function qtAcceptedAlternativeVariation(q, vi) {
    const variation = q.variations[vi];
    if (!variation || !variation.alternativeGroupId) return null;
    return q.variations.map((member, memberIndex) => ({ v: member, vi: memberIndex })).find(({ v: member, vi: memberIndex }) =>
      memberIndex !== vi && member.alternativeGroupId === variation.alternativeGroupId && qStatusLocked(member.status)
    ) || null;
  }

  function qtVariationAlternativeAcceptBlockMessage(entry) {
    return 'Variation #' + qtVariationNumber(entry.v) + ' is already accepted in this alternatives group. Only one Variation can be accepted.';
  }

  function qtVariationSelectionKey(qi, vi) {
    return qi + ':' + vi;
  }
  function qtVariationSelectionEntries(quotes) {
    return [...qtVariationSelected].map(key => {
      const parts = key.split(':');
      const qi = Number(parts[0]);
      const vi = Number(parts[1]);
      const q = quotes[qi];
      const v = q && q.variations && q.variations[vi];
      return q && v ? { key, q, v, qi, vi } : null;
    }).filter(Boolean);
  }
  function qtToggleVariationSelection(qi, vi) {
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const key = qtVariationSelectionKey(qi, vi);
    qtAltSelected.clear();
    if (qtVariationSelected.has(key)) {
      qtVariationSelected.delete(key);
    } else {
      const selected = qtVariationSelectionEntries(quotes);
      if (selected.length && selected[0].qi !== qi) {
        qtShowSnackbar('Variations can only be grouped within the same Quote.', 'blocked');
        return;
      }
      qtVariationSelected.add(key);
    }
    renderQuoteListOverlay();
  }
  function qtClearVariationSelection() {
    qtVariationSelected.clear();
    renderQuoteListOverlay();
  }
  function qtNextVariationAlternativeGroupId(q) {
    const used = new Set((q.variations || []).map(v => v.alternativeGroupId).filter(Boolean));
    let n = 1;
    while (used.has('VAR-ALT-' + n)) n++;
    return 'VAR-ALT-' + n;
  }
  function qtNormaliseVariationAlternativeGroups(q) {
    const counts = new Map();
    (q.variations || []).forEach(v => {
      if (v.alternativeGroupId) counts.set(v.alternativeGroupId, (counts.get(v.alternativeGroupId) || 0) + 1);
    });
    (q.variations || []).forEach(v => {
      if (v.alternativeGroupId && counts.get(v.alternativeGroupId) < 2) delete v.alternativeGroupId;
    });
  }
  const qtVariationCanBeRegrouped = v =>
    !['accepted', 'complete', 'rejected', 'cancelled'].includes(v.status);
  function qtVariationAlternativeSelectionState(quotes) {
    const selected = qtVariationSelectionEntries(quotes);
    const decided = selected.filter(({ v }) => !qtVariationCanBeRegrouped(v));
    const grouped = selected.filter(({ v }) => !!v.alternativeGroupId);
    const groupIds = [...new Set(grouped.map(({ v }) => v.alternativeGroupId))];
    const parentIndexes = [...new Set(selected.map(({ qi }) => qi))];
    let groupOk = true;
    let groupReason = '';
    if (selected.length < 2) {
      groupOk = false;
      groupReason = 'Select at least two Variations from the same Quote.';
    } else if (parentIndexes.length > 1) {
      groupOk = false;
      groupReason = 'Variations can only be grouped within the same Quote.';
    } else if (decided.length) {
      groupOk = false;
      groupReason = 'Accepted, Complete, Rejected or Cancelled Variations cannot be regrouped.';
    } else if (groupIds.length > 1) {
      groupOk = false;
      groupReason = 'Remove Variations from their current groups before combining groups.';
    } else if (groupIds.length === 1 && grouped.length === selected.length) {
      groupOk = false;
      groupReason = 'These Variations are already in the same alternatives group.';
    }
    const independentOk = grouped.length > 0 && decided.length === 0;
    const independentReason = decided.length
      ? 'Accepted, Complete, Rejected or Cancelled Variations cannot be regrouped.'
      : 'Select a Variation already in an alternatives group.';
    return { selected, decided, grouped, groupIds, parentIndexes, groupOk, groupReason, independentOk, independentReason };
  }

  const qtQuoteCanBeRegrouped = q =>
    !qIsWon(q) && ['draft', 'review', 'reviewed', 'sent'].includes(q.status) && !q.alternativeLost;

  function qtAlternativeSelectionState(quotes) {
    const selectedIndexes = [...qtAltSelected].filter(qi => quotes[qi]);
    const selected = selectedIndexes.map(qi => ({ q: quotes[qi], qi }));
    const decided = selected.filter(({ q }) => !qtQuoteCanBeRegrouped(q));
    const grouped = selected.filter(({ q }) => !!q.alternativeGroupId);
    const groupIds = [...new Set(grouped.map(({ q }) => q.alternativeGroupId))];
    let groupOk = true, groupReason = '';
    if (selected.length < 2) {
      groupOk = false;
      groupReason = 'Select at least two quotes to group them as alternatives.';
    } else if (decided.length) {
      const names = decided.map(({ q }) => 'Quote #' + q.no).join(', ');
      groupOk = false;
      groupReason = names + (decided.length > 1 ? ' are' : ' is') +
        ' already decided. Grouping only applies before the customer accepts or rejects a quote.';
    } else if (groupIds.length > 1) {
      groupOk = false;
      groupReason = 'The selection contains two different alternative groups. Flow v4 does not merge existing groups.';
    } else if (groupIds.length === 1 && grouped.length === selected.length) {
      groupOk = false;
      groupReason = 'These quotes are already alternatives to each other.';
    }
    let independentOk = true, independentReason = '';
    if (!grouped.length) {
      independentOk = false;
      independentReason = 'None of the selected quotes are in an alternatives group.';
    } else if (decided.length) {
      independentOk = false;
      independentReason = 'Accepted, rejected, cancelled or completed quotes cannot be moved out of a group.';
    }
    return { selectedIndexes, selected, decided, grouped, groupIds, groupOk, groupReason, independentOk, independentReason };
  }
  const qtAlternativeRangeText = range => range.low === range.high
    ? fmt(range.high)
    : fmt(range.low) + '&ndash;' + fmt(range.high);
  function qtAlternativeDeltaHtml(before, after) {
    const same = before.low === after.low && before.high === after.high;
    return '<span class="qt-alt-value-change"><span>' + qtAlternativeRangeText(before) + '</span>' +
      (same ? '<span style="color:#8294BA;font-weight:500;">unchanged</span>'
        : '<i class="fai" style="color:#8294BA;">&#xf061;</i><span>' + qtAlternativeRangeText(after) + '</span>') +
    '</span>';
  }
  let qtAlternativePendingAction = null;
  let qtAlternativeSelectionFromDrag = false;
  function qtCloseAlternativeConfirm() {
    document.getElementById('alternativeConfirmOverlay').classList.remove('open');
    qtAlternativePendingAction = null;
    if (qtAlternativeSelectionFromDrag) qtAltSelected.clear();
    qtAlternativeSelectionFromDrag = false;
  }
  function qtRunAlternativePending() {
    const action = qtAlternativePendingAction;
    qtAlternativePendingAction = null;
    document.getElementById('alternativeConfirmOverlay').classList.remove('open');
    qtAlternativeSelectionFromDrag = false;
    if (action) action();
  }
  function qtShowAlternativeConfirm(title, body, confirmLabel, action) {
    document.getElementById('acm-title').textContent = title;
    document.getElementById('acm-body').innerHTML = body +
      '<div class="cs-actions"><button class="cs-btn ghost" onclick="qtCloseAlternativeConfirm()">Cancel</button>' +
      '<button class="cs-btn primary" onclick="qtRunAlternativePending()">' + confirmLabel + '</button></div>';
    qtAlternativePendingAction = action;
    document.getElementById('alternativeConfirmOverlay').classList.add('open');
  }

  function qtGroupSelectedVariationAlternatives() {
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const state = qtVariationAlternativeSelectionState(quotes);
    if (!state.groupOk) { qtShowSnackbar(state.groupReason, 'blocked'); return; }
    const q = state.selected[0].q;
    const numbers = state.selected.map(({ v }) => 'Variation #' + qtVariationNumber(v)).join(', ');
    qtShowAlternativeConfirm(
      'Group Variations as alternatives?',
      '<p class="cs-sec-desc">' + numbers + ' will become competing options for the same scope.</p>' +
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf247;</i><div>The customer chooses <b>one Variation</b>, not several.</div></div>' +
        '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf05e;</i><div><b>Variation statuses will not change.</b> This only records their alternative relationship.</div></div>' +
      '</div>',
      'Group as alternatives',
      () => {
        const groupId = state.groupIds[0] || qtNextVariationAlternativeGroupId(q);
        state.selected.forEach(({ v }) => { v.alternativeGroupId = groupId; });
        qtNormaliseVariationAlternativeGroups(q);
        qtVariationSelected.clear();
        qtShowSnackbar('Variations grouped as alternatives. No status was changed.', 'success');
        renderQuoteListOverlay();
      }
    );
  }

  function qtGroupVariationAlternativesFromDrag(sourceQi, sourceVi, targetQi, targetVi) {
    qtAltSelected.clear();
    qtVariationSelected.clear();
    qtVariationSelected.add(qtVariationSelectionKey(sourceQi, sourceVi));
    qtVariationSelected.add(qtVariationSelectionKey(targetQi, targetVi));
    qtGroupSelectedVariationAlternatives();
    // Drag-to-group is a direct relationship action, not checkbox multi-select.
    // The pending confirmation already holds the selected Variation references.
    qtVariationSelected.clear();
    renderQuoteListOverlay();
  }

  function qtMakeSelectedVariationsIndependent() {
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const state = qtVariationAlternativeSelectionState(quotes);
    if (!state.independentOk) { qtShowSnackbar(state.independentReason, 'blocked'); return; }
    const parents = new Set(state.grouped.map(({ q }) => q));
    state.grouped.forEach(({ v }) => { delete v.alternativeGroupId; });
    parents.forEach(q => qtNormaliseVariationAlternativeGroups(q));
    qtVariationSelected.clear();
    qtShowSnackbar('Selected Variations are independent. No status was changed.', 'success');
    renderQuoteListOverlay();
  }

  function qtMakeVariationIndependentFromDrag(qi, vi) {
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const q = quotes[qi];
    const variation = q && (q.variations || [])[vi];
    if (!q || !variation || !variation.alternativeGroupId) return;
    if (!qtVariationCanBeRegrouped(variation)) {
      qtShowSnackbar('Accepted, Complete, Rejected or Cancelled Variations cannot be moved out of an alternatives group.', 'blocked');
      return;
    }

    const groupId = variation.alternativeGroupId;
    const memberCount = (q.variations || []).filter(v => v.alternativeGroupId === groupId).length;
    delete variation.alternativeGroupId;
    qtNormaliseVariationAlternativeGroups(q);
    qtVariationSelected.clear();
    qtShowSnackbar(
      memberCount === 2
        ? 'Alternative group removed. Both Variations are now independent. No status was changed.'
        : 'Variation #' + qtVariationNumber(variation) + ' is now independent. No status was changed.',
      'success'
    );
    renderQuoteListOverlay();
  }

  function qtGroupSelectedAlternatives() {
    const quotes = DEAL_QUOTES[ddDeal.t];
    const state = qtAlternativeSelectionState(quotes);
    if (!state.groupOk) { qtShowSnackbar(state.groupReason); return; }
    const existingGroupId = state.groupIds[0] || null;
    const moverIndexes = state.selected.filter(({ q }) => !q.alternativeGroupId).map(({ qi }) => qi);
    const targetId = existingGroupId || qtNextAlternativeGroupId(quotes);
    const existingMembers = existingGroupId
      ? quotes.map((q, qi) => ({ q, qi })).filter(({ q }) => q.alternativeGroupId === existingGroupId)
      : [];
    const allMembers = [...existingMembers, ...moverIndexes.map(qi => ({ q: quotes[qi], qi }))]
      .filter((entry, index, array) => array.findIndex(other => other.qi === entry.qi) === index);
    const before = dealValueRange(quotes);
    const preview = JSON.parse(JSON.stringify(quotes));
    moverIndexes.forEach(qi => { preview[qi].alternativeGroupId = targetId; });
    const after = dealValueRange(preview);
    const names = allMembers.map(({ q }) => 'Quote #' + q.no).join(', ');
    const body =
      '<p class="cs-sec-desc">' + names + ' cover the same scope. The customer will choose one.</p>' +
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf247;</i><div>Only <b>one Quote</b> can be accepted from this group.</div></div>' +
        '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf05e;</i><div>When one is accepted, the other' + (allMembers.length > 2 ? 's stop' : ' stops') + ' contributing to Deal Value. <b>Their document statuses will not change.</b></div></div>' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf1ec;</i><div>The Deal estimate shows the lowest&ndash;highest option instead of adding these Quotes together.</div></div>' +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf154;</i><div>Deal value ' + qtAlternativeDeltaHtml(before, after) + '</div></div>' +
      '</div>';
    qtShowAlternativeConfirm('Make these Quotes alternatives?', body, 'Make ' + allMembers.length + ' Quotes alternatives', () => {
      moverIndexes.forEach(qi => { quotes[qi].alternativeGroupId = targetId; });
      qtAltSelected.clear();
      qtShowSnackbar(allMembers.length + ' quotes grouped as alternatives.', 'success');
      ddRenderQuotes();
      renderQuoteListOverlay();
      recalcPipeline();
    });
  }

  function qtMakeSelectedIndependent() {
    const quotes = DEAL_QUOTES[ddDeal.t];
    const state = qtAlternativeSelectionState(quotes);
    if (!state.independentOk) { qtShowSnackbar(state.independentReason); return; }
    const moverIndexes = state.grouped.map(({ qi }) => qi);
    const movingGroupIds = [...new Set(state.grouped.map(({ q }) => q.alternativeGroupId))];
    const dissolving = movingGroupIds.filter(groupId =>
      quotes.filter((q, qi) => q.alternativeGroupId === groupId && !moverIndexes.includes(qi)).length < 2
    );
    const before = dealValueRange(quotes);
    const preview = JSON.parse(JSON.stringify(quotes));
    moverIndexes.forEach(qi => { preview[qi].alternativeGroupId = null; });
    qtNormaliseAlternativeGroups(preview);
    const after = dealValueRange(preview);
    const names = state.grouped.map(({ q }) => 'Quote #' + q.no).join(', ');
    const body =
      '<p class="cs-sec-desc">' + names + ' will stop competing and become acceptable on ' +
        (moverIndexes.length > 1 ? 'their' : 'its') + ' own.</p>' +
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf35d;</i><div>Independent Quotes can be accepted alongside the others, rather than instead of them.</div></div>' +
        (dissolving.length
          ? '<div class="qt-alt-confirm-item"><i class="fai">&#xf248;</i><div>' +
            dissolving.map(qtAlternativeGroupName).join(', ') + ' will dissolve — one Quote cannot be an alternative to nothing.</div></div>'
          : '') +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf154;</i><div>Deal value ' + qtAlternativeDeltaHtml(before, after) + '</div></div>' +
      '</div>';
    qtShowAlternativeConfirm('Remove from alternatives group?', body, 'Remove from group', () => {
      moverIndexes.forEach(qi => {
        quotes[qi].alternativeGroupId = null;
        quotes[qi].alternativeLost = false;
      });
      qtNormaliseAlternativeGroups(quotes);
      qtAltSelected.clear();
      qtShowSnackbar(moverIndexes.length + ' quote' + (moverIndexes.length > 1 ? 's' : '') + ' made independent.', 'success');
      ddRenderQuotes();
      renderQuoteListOverlay();
      recalcPipeline();
    });
  }

  function qtDuplicateSelectedQuote() {
    const quotes = DEAL_QUOTES[ddDeal.t];
    const state = qtAlternativeSelectionState(quotes);
    if (!state.selected.length) return;
    const copies = state.selected.map(({ q: source }) => {
      const current = qCurrentRev(source);
      return {
        no: String(nextQuoteNo++),
        status: 'draft',
        desc: source.desc || 'Untitled',
        alternativeGroupId: null,
        alternativeLost: false,
        revisions: [{ n: 1, value: current.value, status: 'live' }],
        acceptedRev: null,
        variations: [],
        cos: [],
        linkedAt: new Date().toISOString(),
        comments: []
      };
    });
    quotes.push(...copies);
    ddEnsureQuoteActivity(ddDeal, quotes);
    qtAltSelected.clear();
    qtShowSnackbar(copies.length + ' Quote' + (copies.length > 1 ? 's' : '') +
      ' duplicated as independent Draft' + (copies.length > 1 ? 's' : '') + '.', 'success');
    ddRenderQuotes();
    ddRenderHistory();
    renderQuoteListOverlay();
    recalcPipeline();
  }

  function qtUnlinkSelectedQuotes() {
    const quotes = DEAL_QUOTES[ddDeal.t];
    const selectedIndexes = [...qtAltSelected].filter(qi => quotes[qi]);
    const selected = selectedIndexes.map(qi => ({ q: quotes[qi], qi }));
    if (!selected.length) return;
    const protectedQuotes = selected.filter(({ q }) => qtQuoteHasAcceptedOutcome(q) || q.cos.some(co => qStatusLocked(co.status)));
    if (protectedQuotes.length) {
      qtShowSnackbar('Accepted Quotes or Quotes with a signed Change Order cannot be unlinked from this Deal.');
      return;
    }
    const indexes = selectedIndexes.slice().sort((a, b) => b - a);
    const before = dealValueRange(quotes);
    const preview = JSON.parse(JSON.stringify(quotes));
    indexes.forEach(qi => preview.splice(qi, 1));
    qtEnsureAutomaticQuoteAlternatives(preview);
    const after = dealValueRange(preview);
    const names = selected.map(({ q }) => 'Quote #' + q.no).join(', ');
    const body =
      '<p class="cs-sec-desc">' + names + ' will be removed from this Deal.</p>' +
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf127;</i><div>The Quote documents will not be deleted. They will only be unlinked from this Deal.</div></div>' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf248;</i><div>If only one Quote remains, it will automatically become a standalone Quote.</div></div>' +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf154;</i><div>Deal value ' + qtAlternativeDeltaHtml(before, after) + '</div></div>' +
      '</div>';
    qtShowAlternativeConfirm('Unlink selected Quotes?', body, 'Unlink ' + indexes.length + ' Quote' + (indexes.length > 1 ? 's' : ''), () => {
      indexes.forEach(qi => quotes.splice(qi, 1));
      qtEnsureAutomaticQuoteAlternatives(quotes);
      qtAltSelected.clear();
      if (!quotes.length) delete DEAL_QUOTES[ddDeal.t];
      qtShowSnackbar(indexes.length + ' Quote' + (indexes.length > 1 ? 's' : '') + ' unlinked from this Deal.', 'success');
      ddRenderQuotes();
      renderQuoteListOverlay();
      recalcPipeline();
    });
  }

  function qtRenderVariationAlternativeToolbar(quotes, el) {
    const state = qtVariationAlternativeSelectionState(quotes);
    const count = state.selected.length;
    let reason = '';
    if (!state.groupOk && count >= 2) reason = state.groupReason;
    else if (!state.groupOk && !state.independentOk && count === 1) reason = state.groupReason;
    el.className = 'qt-alt-toolbar' + (count ? ' show' : '');
    el.innerHTML = !count ? '' :
      '<div class="actions">' +
        '<span class="count">' + count + ' Variation' + (count === 1 ? '' : 's') + ' selected</span>' +
        '<button class="primary" onclick="qtGroupSelectedVariationAlternatives()"' + (state.groupOk ? '' : ' disabled') + '><i class="fai">&#xf247;</i> Group as alternatives</button>' +
        '<button class="secondary" onclick="qtMakeSelectedVariationsIndependent()"' + (state.independentOk ? '' : ' disabled') + '><i class="fai">&#xf35d;</i> Make independent</button>' +
        '<button class="clear" onclick="qtClearVariationSelection()">Clear</button>' +
      '</div>' +
      '<div class="group-count">' + (state.grouped.length
        ? state.grouped.length + ' selected currently grouped'
        : 'No selected Variation is currently in a group') + '</div>' +
      '<div class="helper' + (reason ? ' blocked' : '') + '">' +
        (reason || 'Group creates an either/or choice. Independent Variations remain separate.') +
      '</div>' +
      '<div class="helper">Variation statuses stay unchanged.</div>';
  }

  function qtRenderAlternativeToolbar(quotes) {
    const el = document.getElementById('qtAltToolbar');
    if (!el) return;
    if (qtVariationSelected.size) {
      qtRenderVariationAlternativeToolbar(quotes, el);
      return;
    }
    const selected = [...qtAltSelected].filter(qi => quotes[qi]).map(qi => ({ q: quotes[qi], qi }));
    const count = selected.length;
    const protectedQuotes = selected.filter(({ q }) => qtQuoteHasAcceptedOutcome(q) || q.cos.some(co => qStatusLocked(co.status)));
    const blocked = protectedQuotes.length > 0;
    el.className = 'qt-alt-toolbar' + (count ? ' show' : '');
    el.innerHTML = !count ? '' :
      '<div class="actions">' +
        '<span class="count">' + count + ' Quote' + (count === 1 ? '' : 's') + ' selected</span>' +
        '<button class="secondary" onclick="qtUnlinkSelectedQuotes()"' + (blocked ? ' disabled' : '') + '><i class="fai">&#xf127;</i> Unlink from Deal</button>' +
        '<button class="clear" onclick="qtClearAlternativeSelection()">Clear</button>' +
      '</div>' +
      '<div class="helper' + (blocked ? ' blocked' : '') + '">' +
        (blocked
          ? 'Accepted Quotes or Quotes with a signed Change Order cannot be unlinked.'
          : 'The Quote documents will remain in Quote & Sales; only their Deal link will be removed.') +
      '</div>';
  }

  function qtToggleOnlyVersion() { qtOnlyVersion = !qtOnlyVersion; renderQuoteListOverlay(); }

  // Monotonic counter stamped onto a revision the moment it's accepted — this is what
  // qLatestAcceptedRev actually orders by, so "latest" always means "most recently accepted",
  // regardless of which revision number that happens to be.
  // DEAL_QUOTES is declared later in this script, so start from a safe seed here.
  // Existing accepted revisions use sequence 1; each new acceptance increments from this value.
  let qtAcceptSeq = 1;

  // Every status dropdown always lists every real status — nothing is ever hidden based on state.
  // A pick that isn't valid right now still applies to the <select> visually for an instant, then
  // gets blocked here (snackbar + re-render snaps it back to the true value) rather than never
  // having been offered in the first place.
  let qtSnackbarTimer = null;
  let qtSnackbarAction = null;
  function qtShowSnackbar(msg, kind, onAction, actionLabel) {
    const el = document.getElementById('qtSnackbar');
    qtSnackbarAction = typeof onAction === 'function' ? onAction : null;
    el.innerHTML = '<i class="fai">' + (kind === 'success' ? '&#xf00c;' : '&#xf05e;') + '</i><span>' + archiveEscape(msg) + '</span>' +
      (qtSnackbarAction ? '<button type="button" id="qtSnackbarAction">' + archiveEscape(actionLabel || 'Undo') + '</button>' : '');
    el.classList.remove('show', 'success', 'blocked', 'has-action');
    void el.offsetWidth;
    if (kind) el.classList.add(kind);
    if (qtSnackbarAction) {
      el.classList.add('has-action');
      document.getElementById('qtSnackbarAction').addEventListener('click', () => {
        const action = qtSnackbarAction;
        qtSnackbarAction = null;
        clearTimeout(qtSnackbarTimer);
        el.classList.remove('show', 'has-action');
        if (action) action();
      });
    }
    el.classList.add('show');
    clearTimeout(qtSnackbarTimer);
    qtSnackbarTimer = setTimeout(() => {
      qtSnackbarAction = null;
      el.classList.remove('show', 'has-action');
    }, qtSnackbarAction ? 6000 : 3200);
  }

  function qtSyncEditedQuoteMargins(quotes, beforeHigh, beforeSigned) {
    const existing = DEAL_MARGINS[ddDeal.t] || {};
    const ratio = (amount, base, fallback) => base > 0 && Number.isFinite(amount) ? amount / base : fallback;
    const dealProductRate = ratio(existing.dealProduct, beforeHigh, 0.13);
    const dealLabourRate = ratio(existing.dealLabour, beforeHigh, 0.07);
    const signedProductRate = ratio(existing.signedProduct, beforeSigned, 0.117);
    const signedLabourRate = ratio(existing.signedLabour, beforeSigned, 0.063);
    const afterHigh = dealValueRange(quotes).high;
    const afterSigned = dealContractValue(quotes);
    DEAL_MARGINS[ddDeal.t] = {
      dealProduct: Math.round(afterHigh * dealProductRate),
      dealLabour: Math.round(afterHigh * dealLabourRate),
      signedProduct: Math.round(afterSigned * signedProductRate),
      signedLabour: Math.round(afterSigned * signedLabourRate)
    };
  }
  // EVERY row — revision, change order, variation — ends with this exact same icon-only
  // Edit/View/More trio in the exact same place (Figma DS – WeQuote Platform, node 2726-47679).
  // No row-specific text buttons like "Enter value" or "Add adjustment line": the pen is the edit
  // affordance everywhere, it just edits whatever that row is (description + value). "Create Revision"
  // likewise stays a standalone link below the stack, so nothing ever shuffles these three icons.
  function qtGenericActsHtml(editOnclick, viewOnclick, moreOnclick) {
    return '<button class="ghost icon" title="Edit" aria-label="Edit" onclick="' + (editOnclick || 'openQuoteEditorNewTab()') + '"><i class="fai">&#xf304;</i></button>' +
           '<button class="ghost icon" title="View proposal" aria-label="View proposal" onclick="' + (viewOnclick || 'qtViewProposal()') + '"><i class="fai">&#xf06e;</i></button>' +
           '<button class="ghost icon" title="More actions" aria-label="More actions" onclick="' + (moreOnclick || "qtShowSnackbar('No additional actions are available for this item.')") + '"><i class="fai">&#xf141;</i></button>';
  }
  // Per-row facts every revision rule keys off. Accepting one revision does NOT rule out accepting
  // an earlier one — but once the latest accepted revision has change orders/variations hanging off
  // it, the earlier revisions are frozen, since that signed-off work is what the deal now rests on.
  function qtRevCtx(q, rev) {
    const isCurrent = rev.n === qCurrentRev(q).n;
    const latestAcc = qLatestAcceptedRev(q);
    const isLatestAcc = !!latestAcc && latestAcc.n === rev.n;
    return {
      isCurrent, latestAcc, isLatestAcc,
      lockedByWork: !!latestAcc && !isLatestAcc && qHasDownstreamWork(q),
      superseded: !isCurrent && rev.status !== 'accepted'
    };
  }
  // Whether picking `value` on this revision row actually applies, or gets snackbar-blocked.
  // The dropdown itself never hides a status because of this — see qtRevBody below.
  function qtRevIsAllowed(q, rev, value) {
    const c = qtRevCtx(q, rev);
    if (c.lockedByWork) return false;
    if (rev.status === 'accepted') return value === 'accepted' || value === 'complete';
    if (c.superseded) return value === 'accepted' || value === 'sent'; // an earlier offer is still acceptable
    return true; // current revision — freely switchable, including reviving out of Cancelled/Rejected
  }
  function qtRevBlockMsg(q, rev) {
    const c = qtRevCtx(q, rev);
    if (c.lockedByWork) return 'Revision ' + c.latestAcc.n + ' is accepted and already has change orders or variations &mdash; earlier revisions are locked.';
    if (rev.status === 'accepted') return 'This revision is accepted &mdash; further change goes through its variations and change orders.';
    if (c.superseded) return 'This is an earlier revision &mdash; you can accept this offer directly, but not re-status it.';
    return '';
  }
  function qtRevBody(q, rev, qi) {
    const c = qtRevCtx(q, rev);
    // Once a later revision is accepted, this one remains in the audit trail but recedes visually.
    // The accepted revision itself stays active; only its earlier siblings grey out.
    const supersededByAcceptedRevision = q.revisions.some(r => r.n > rev.n && r.status === 'accepted');

    // Always the full status list — nothing is ever hidden. "current" reflects what's actually
    // true for this row: an accepted row shows Accepted/Complete; a superseded revision stays
    // frozen at its own last real state ("Sent to Customer") rather than tracking q.status, which
    // may now belong to a different revision entirely.
    let currentVal;
    if (rev.status === 'accepted') currentVal = (c.isLatestAcc && q.status === 'complete') ? 'complete' : 'accepted';
    else if (c.superseded) currentVal = 'sent';
    else currentVal = q.status;

    const statusHtml = qtStatusSelectHtml(
      QUOTE_STATUS_ALL.map(v => ({ value: v, label: QUOTE_STATUS_LABEL[v], dotClass: QUOTE_STATUS_DOT[v], current: v === currentVal })),
      'qtRevStatusChange(this,' + qi + ',' + rev.n + ')',
      qtStatusStamp(currentVal)
    );
    // The rail dot fills on the revision the deal currently rests on: the latest accepted one, or
    // the current live revision while nothing is accepted yet.
    const filled = c.isLatestAcc || (!c.latestAcc && rev.status === 'live' && c.isCurrent);
    return {
      filled,
      bodyHtml: '<div class="qt-body' +
        (rev.status === 'declined' ? ' dimmed' : '') +
        (supersededByAcceptedRevision ? ' old-revision' : '') + '">' +
        '<div class="qt-meta"><span class="qt-badge rev">Revision ' + rev.n + '</span></div>' +
        statusHtml +
        qtValueMarginHtml(rev.value, false) +
        '<div class="qt-acts">' + qtGenericActsHtml(
          'openQuoteEditorNewTab(' + qi + ',' + rev.n + ')',
          'qtViewProposal(' + qi + ',' + rev.n + ')',
          'qtToggleRevisionMenu(event,' + qi + ',' + rev.n + ')'
        ) + '</div>' +
      '</div>'
    };
  }
  // showDot=false marks the single-revision layout. CSS removes both the dot and its gutter; once a
  // second revision exists, both rows enter the shared rail and receive the timeline indentation.
  function qtRevRow(q, rev, qi, showDot) {
    const { filled, bodyHtml } = qtRevBody(q, rev, qi);
    const dotCls = showDot === false ? 'qt-dot qt-dot-hidden' : 'qt-dot' + (filled ? ' filled' : '');
    return '<div class="qt-node" data-qt-key="rev-' + rev.n + '"><span class="' + dotCls + '"></span>' + bodyHtml + '</div>';
  }
  function qtCreateRevLinkHtml(q, qi) {
    return q.status === 'sent'
      ? '<button class="qt-createrev" onclick="qtCreateRevision(' + qi + ')"><i class="fai">&#x2b;</i> Create Revision</button>'
      : '';
  }

  // A variation still without a name/value (status 'draft') can only move to 'sent' (via the
  // fill-value flow) — every other transition is blocked until it actually has content.
  function qtVarIsAllowed(v, value) {
    if (v.status === 'draft') return value === 'draft' || value === 'sent';
    return true;
  }
  function qtVarBlockMsg() { return 'Add a name and value to this variation first.'; }
  function qtVariationNumber(v) {
    // Existing demo records predate the separate number field. Allocate it once, then keep it stable
    // when the description is edited.
    if (!v.no) v.no = String(nextVariationNo++);
    return v.no;
  }
  function qtVarRow(q, v, vi, qi, options) {
    options = options || {};
    const bundledCo = q.cos.find(co => co.varIds.includes(vi));
    if (bundledCo && !options.keepBundled) return ''; // normally represented by its CO; resolved groups opt in to keep the source row visible
    const selectionKey = qtVariationSelectionKey(qi, vi);
    const selected = qtVariationSelected.has(selectionKey);
    // Variations use the exact same status list as the quote itself — no separate vocabulary.
    const statusHtml = qtStatusSelectHtml(
      QUOTE_STATUS_ALL.map(v2 => ({ value: v2, label: QUOTE_STATUS_LABEL[v2], dotClass: QUOTE_STATUS_DOT[v2], current: v2 === v.status })),
      'qtVarStatusChange(this,' + qi + ',' + vi + ')',
      qtStatusStamp(v.status)
    );
    // The pen edits this variation's description + value (no "Enter value" text button). An accepted
    // variation additionally shows its change-order action to the LEFT of the trio, so the three icons
    // still land in exactly the same place as every other row.
    let acts = '';
    if (bundledCo) {
      acts = '<button class="ghost qt-added-to-co" type="button" disabled>Added to ' + bundledCo.name + '</button>';
    } else if (v.status === 'accepted') {
      const oc = qOpenCo(q);
      if (oc) acts = '<button class="ghost" onclick="qtAddToCo(' + qi + ',' + vi + ')">Add to ' + oc.name + ' (Draft)</button>';
      else acts = '<button class="primary" onclick="qtTryRaiseCo(' + qi + ',' + vi + ')">Raise Change Order</button>';
    }
    acts += qtGenericActsHtml('qtFillVariation(' + qi + ',' + vi + ')');
    return '<div class="qt-node qt-nested' + (bundledCo ? ' qt-var-bundled' : '') + '" data-qt-key="var-' + vi + '">' +
      '<span class="qt-dot"></span>' +
      '<div class="qt-body' + (qStatusLost(v.status) ? ' dimmed' : '') +
        (selected ? ' var-selected' : '') + '">' +
        (bundledCo ? '' : '<button class="qt-alt-check qt-var-check' + (selected ? ' checked' : '') +
          '" type="button" aria-label="Select Variation #' + qtVariationNumber(v) +
          '" onclick="qtToggleVariationSelection(' + qi + ',' + vi + ');event.stopPropagation()">' +
          '<i class="fai">&#xf00c;</i></button>') +
        '<div class="qt-meta">' +
          '<span class="qt-var-badge-line"><span class="qt-badge var">Variation #' + qtVariationNumber(v) + '</span>' +
            (options.highest ? '<span class="qt-highest-margin">Highest Margin</span>' : '') +
          '</span>' +
          '<span class="qt-subtitle">' + (v.name || 'Untitled') + '</span>' +
        '</div>' +
        statusHtml +
        qtValueMarginHtml(v.value, false) +
        '<div class="qt-acts">' + acts + '</div>' +
      '</div>' +
    '</div>';
  }

  const qtResolvedVariationGroupKey = (qi, groupId) => qi + ':' + groupId;

  function qtVariationGroupResolution(q, members) {
    for (const member of members) {
      if (!qStatusLocked(member.v.status)) continue;
      const ci = q.cos.findIndex(co => co.varIds.includes(member.vi));
      if (ci >= 0) return { winner: member, co: q.cos[ci], ci };
    }
    return null;
  }

  function qtToggleResolvedVariationGroup(qi, groupId) {
    const key = qtResolvedVariationGroupKey(qi, groupId);
    if (qtExpandedResolvedVariationGroups.has(key)) qtExpandedResolvedVariationGroups.delete(key);
    else qtExpandedResolvedVariationGroups.add(key);
    renderQuoteListOverlay();
  }

  function qtResolvedVariationAuditRow(v) {
    const status = QUOTE_STATUS_LABEL[v.status] || v.status;
    const dot = QUOTE_STATUS_DOT[v.status] || 'draft';
    return '<div class="qt-var-resolved-row">' +
      '<div class="qt-var-resolved-meta">' +
        '<span class="qt-badge var">Variation #' + qtVariationNumber(v) + '</span>' +
        '<span class="qt-subtitle">' + (v.name || 'Untitled') + '</span>' +
      '</div>' +
      '<div class="qt-var-resolved-status"><span class="sq ' + dot + '"></span><span>' + status + '</span></div>' +
      qtValueMarginHtml(v.value, false) +
      '<button class="qt-var-resolved-view" type="button" title="View Variation"><i class="fai">&#xf06e;</i></button>' +
    '</div>';
  }

  function qtReopenVariationAlternatives(qi, groupId) {
    const q = DEAL_QUOTES[ddDeal.t][qi];
    const members = q.variations.map((v, vi) => ({ v, vi }))
      .filter(({ v }) => v.alternativeGroupId === groupId);
    const resolution = qtVariationGroupResolution(q, members);
    if (!resolution) return;
    if (resolution.co.status !== 'draft') {
      qtShowSnackbar(resolution.co.name + ' is no longer Draft. These alternatives are locked as history.', 'blocked');
      return;
    }
    qtShowAlternativeConfirm(
      'Change the selected Variation?',
      '<p class="cs-sec-desc">Variation #' + qtVariationNumber(resolution.winner.v) + ' will be removed from ' + resolution.co.name + ' and returned to Sent to Customer.</p>' +
      '<p class="cs-sec-desc">The alternatives group will reopen so a different option can be accepted.</p>',
      'Reopen choices',
      () => {
        resolution.co.varIds = resolution.co.varIds.filter(vi => vi !== resolution.winner.vi);
        resolution.winner.v.status = 'sent';
        qtExpandedResolvedVariationGroups.delete(qtResolvedVariationGroupKey(qi, groupId));
        qtVariationSelected.clear();
        qtShowSnackbar('Variation alternatives reopened. No other Variation status was changed.', 'success');
        ddRenderQuotes();
        renderQuoteListOverlay();
        recalcPipeline();
      }
    );
  }

  function qtResolvedVariationGroupHtml(q, members, qi, resolution) {
    if (qtOnlyVersion) return '';
    const groupId = members[0].v.alternativeGroupId;
    const key = qtResolvedVariationGroupKey(qi, groupId);
    const expanded = qtExpandedResolvedVariationGroups.has(key);
    const others = members.filter(({ vi }) => vi !== resolution.winner.vi);
    const highest = members.reduce((best, entry) =>
      Number(entry.v.value || 0) > Number(best.v.value || 0) ? entry : best
    );
    const otherLabel = others.length + ' other alternative' + (others.length === 1 ? '' : 's');
    const canChange = resolution.co.status === 'draft';
    return '<section class="qt-var-alt-group qt-var-alt-group-resolved" data-variation-group-id="' + groupId + '">' +
      '<div class="qt-var-resolution-head">' +
        '<div class="qt-var-resolution-copy">' +
          '<span class="qt-var-resolution-kicker"><i class="fai">&#xf00c;</i> Alternative group resolved</span>' +
          '<strong>1 Variation selected for ' + resolution.co.name + '</strong>' +
          '<span>' + otherLabel + ' retained as audit history</span>' +
        '</div>' +
        '<div class="qt-var-resolution-actions">' +
          (others.length ? '<button type="button" onclick="qtToggleResolvedVariationGroup(' + qi + ',\'' + groupId + '\')">' +
            (expanded ? 'Hide' : 'Show') + ' ' + otherLabel + ' <i class="fai">' + (expanded ? '&#xf077;' : '&#xf078;') + '</i></button>' : '') +
          (canChange ? '<button type="button" class="change" onclick="qtReopenVariationAlternatives(' + qi + ',\'' + groupId + '\')">Change selection</button>' :
            '<span class="qt-var-resolution-locked"><i class="fai">&#xf023;</i> Locked in ' + resolution.co.name + '</span>') +
        '</div>' +
      '</div>' +
      qtVarRow(q, resolution.winner.v, resolution.winner.vi, qi, {
        highest: resolution.winner.vi === highest.vi,
        keepBundled: true
      }) +
      (expanded ? '<div class="qt-var-resolved-list">' + others.map(({ v }) => qtResolvedVariationAuditRow(v)).join('') + '</div>' : '') +
    '</section>';
  }

  function qtVariationGroupHtml(q, members, qi) {
    const resolution = qtVariationGroupResolution(q, members);
    if (resolution) return qtResolvedVariationGroupHtml(q, members, qi, resolution);
    const highest = members.reduce((best, entry) =>
      Number(entry.v.value || 0) > Number(best.v.value || 0) ? entry : best
    );
    const accepted = members.find(({ v }) => qStatusLocked(v.status));
    const featured = accepted || highest;
    const count = members.length;
    return '<section class="qt-var-alt-group" data-variation-group-id="' + members[0].v.alternativeGroupId + '">' +
      '<div class="qt-var-alt-group-head">' +
        '<div class="qt-var-alt-group-title">' + count + ' Variation' + (count === 1 ? '' : 's') + ' in group</div>' +
        '<div class="qt-var-alt-group-highest">' +
          '<span class="label">' + (accepted ? 'Accepted variation' : 'The highest variation value') + '</span>' +
          '<span class="detail"><span>Variation #' + qtVariationNumber(featured.v) + '</span><strong>' + fmt(Number(featured.v.value || 0)) + '</strong></span>' +
        '</div>' +
      '</div>' +
      '<div class="qt-var-alt-group-cards">' +
        members.map(({ v, vi }) => qtVarRow(q, v, vi, qi, { highest: vi === highest.vi })).join('') +
      '</div>' +
    '</section>';
  }

  function qtVariationListHtml(q, vars, qi) {
    const renderedGroups = new Set();
    return vars.map(({ v, vi }) => {
      if (!v.alternativeGroupId) return qtVarRow(q, v, vi, qi);
      if (renderedGroups.has(v.alternativeGroupId)) return '';
      renderedGroups.add(v.alternativeGroupId);
      const members = vars.filter(({ v: member }) => member.alternativeGroupId === v.alternativeGroupId);
      return qtVariationGroupHtml(q, members, qi);
    }).join('');
  }

  // Locked (accepted/complete) is terminal; a draft CO can't jump straight to locked (must be sent
  // first); moving to sent/accepted/complete is blocked while the CO is genuinely empty.
  function qtCoIsAllowed(q, co, value) {
    if (qStatusLocked(co.status)) return value === co.status;
    const empty = coTotal(q, co) === 0 && !co.varIds.length && !(co.adjustments || []).length;
    if ((value === 'sent' || qStatusLocked(value)) && empty) return false;
    if (qStatusLocked(value) && co.status === 'draft') return false;
    return true;
  }
  function qtCoBlockMsg(co, value) {
    if (qStatusLocked(co.status)) return 'This change order is signed and locked &mdash; it is already counted in Contract Value.';
    if (qStatusLocked(value) && co.status === 'draft') return 'Send for signature before this can be signed.';
    if (value === 'sent' || qStatusLocked(value)) return 'Add at least one variation or adjustment line first.';
    return '';
  }
  function qtCoRow(q, co, ci, qi) {
    const total = coTotal(q, co);
    const items = [
      ...(co.adjustments || []).map(a => a.name + ' (' + signedMoneyStr(a.value) + ')'),
      ...co.varIds.map(vi => 'Variation #' + qtVariationNumber(q.variations[vi]) + ' &middot; ' + (q.variations[vi].name || 'Untitled'))
    ].join(' &middot; ') || 'Empty &mdash; nothing to sign yet';
    const description = co.desc && co.desc !== 'Untitled' ? co.desc : items;
    // Change orders use the exact same status list as the quote itself — no separate vocabulary.
    const statusHtml = qtStatusSelectHtml(
      QUOTE_STATUS_ALL.map(v => ({ value: v, label: QUOTE_STATUS_LABEL[v], dotClass: QUOTE_STATUS_DOT[v], current: v === co.status })),
      'qtCoStatusChange(this,' + qi + ',' + ci + ')',
      qtStatusStamp(co.status)
    );
    // Accepted/Complete (Figma DS node 2726-52029) shows the same generic pen/eye/ellipsis trio as
    // everything else — no "Locked" note. The lock is real (see qtCoIsAllowed), it just isn't spelled
    // out here. In Phase 1 the pen edits this CO's adjustment lines directly; Variations are not
    // exposed as a separate workflow.
    const acts = qtGenericActsHtml(co.status === 'draft' ? 'qtAddAdjustment(' + qi + ',' + ci + ')' : undefined);
    // A locked (accepted/complete) CO only greys out once a NEWER change order exists on this quote —
    // being signed off doesn't dim it; being superseded by a later CO does.
    const isLatestCo = ci === q.cos.length - 1;
    const dimmed = qStatusLocked(co.status) && !isLatestCo;
    return '<div class="qt-node qt-nested" data-qt-key="co-' + ci + '">' +
      '<span class="qt-dot' + (co.status === 'draft' ? ' filled' : '') + '"></span>' +
      '<div class="qt-body' + (co.status === 'draft' ? ' selected' : dimmed ? ' dimmed' : '') + '">' +
        '<div class="qt-meta"><span class="qt-badge co">' + co.name + '</span><span class="qt-subtitle">' + description + '</span></div>' +
        statusHtml +
        qtValueMarginHtml(total, true) +
        '<div class="qt-acts">' + acts + '</div>' +
      '</div>' +
    '</div>';
  }

  // The Phase 1 change-order block belongs to ONE revision: the latest accepted (signed-off) one.
  // It renders directly beneath that revision's row, so it's visually clear which revision the work
  // hangs off — and earlier revisions never get their own Create Change Order button.
  function qtRevWorkHtml(q, qi) {
    let cos = q.cos.map((co, ci) => ({ co, ci }));
    if (qtOnlyVersion) cos = cos.filter(({ co }) => !qStatusLost(co.status));
    const coHtml = cos.map(({ co, ci }) => qtCoRow(q, co, ci, qi)).join('');
    const bc = qBlockingCo(q), oc = qOpenCo(q);
    const blockTitle = bc ? (oc ? oc.name + ' is still Draft &mdash; add to it above instead' : bc.name + ' isn&#39;t signed yet &mdash; only one change order in flight per quote') : '';
    const quickAdd = '<div class="qt-quickadd' + (q.cos.length ? '' : ' no-change-orders') + '">' +
      '<button onclick="qtCreateCo(' + qi + ')"' + (bc ? ' disabled title="' + blockTitle + '"' : '') + '><i class="fai">&#x2b;</i> Change Order</button>' +
    '</div>';
    return coHtml + quickAdd;
  }

  function quoteTimelineHtml(q, qi) {
    let revs = q.revisions;
    if (qtOnlyVersion) revs = revs.filter(r => r.status !== 'declined');
    // A lone revision has no rail or gutter. Revision 2 activates the indented history view and its
    // animated spine. "Create Revision" still trails the whole stack as a standalone link.
    const showDot = revs.length > 1;
    const latestAcc = qLatestAcceptedRev(q);
    return revs.map(r => {
      let out = qtRevRow(q, r, qi, showDot);
      // Attach the work block to the latest accepted revision only.
      if (qIsWon(q) && latestAcc && r.n === latestAcc.n) out += qtRevWorkHtml(q, qi);
      return out;
    }).join('') + qtCreateRevLinkHtml(q, qi);
  }

  // ---------- Revision actions ----------
  function qtOpenAcceptRevModal(qi, revN) {
    const quotes = DEAL_QUOTES[ddDeal.t], q = quotes[qi], rev = q.revisions.find(r => r.n === revN);
    const acceptedAlternative = qtAcceptedAlternativeQuote(quotes, qi);
    const dealAlreadyWon = quotes.some(quote => qIsWon(quote));
    const willMarkDealWon = !dealAlreadyWon;
    const prevAcc = qLatestAcceptedRev(q);
    const before = dealValueRange(quotes);
    const clone = JSON.parse(JSON.stringify(quotes));
    // Accepting one revision only marks THAT revision accepted. Other revisions in the same Quote
    // remain audit snapshots; only sibling Quotes in the same explicit Alternative group lose.
    // q.status is the CURRENT revision's own real-system journey label (Draft/Sent/etc) — accepting
    // an older, already-superseded revision must never overwrite it, or the current revision (which
    // was never itself accepted) would wrongly start showing "Accepted" too.
    if (revN === qCurrentRev(q).n) clone[qi].status = 'accepted';
    clone[qi].acceptedRev = revN;
    // Simulate the acceptSeq bump the real commit will do, so this preview's dealValueRange(clone)
    // correctly treats the revision being accepted right now as the new latest.
    clone[qi].revisions.forEach(r => { if (r.n === revN) { r.status = 'accepted'; r.acceptSeq = qtAcceptSeq + 1; } });
    qtApplyAlternativeWinner(clone, qi);
    const after = dealValueRange(clone);
    const fmtRange = r => r.low === r.high ? fmt(r.high) : fmt(r.low) + '&ndash;' + fmt(r.high);
    // Accepting is always a fresh action, so the revision being accepted right now always becomes
    // the new "latest accepted" — regardless of its revision number relative to any prior accept.

    let rows = '';
    if (acceptedAlternative) {
      const signedChangeOrders = acceptedAlternative.q.cos.filter(co => qStatusLocked(co.status));
      rows += '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf521;</i><div><b>Winner will change</b> from Quote #' + acceptedAlternative.q.no + ' to Quote #' + q.no + '.</div></div>' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf05e;</i><div>Quote #' + acceptedAlternative.q.no + ' will be Rejected and will stop contributing to the signed totals.</div></div>' +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf1ec;</i><div>Signed contract value and margin will be recalculated using the new Winner only.</div></div>' +
        (signedChangeOrders.length
          ? '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf071;</i><div>The current Winner has ' + signedChangeOrders.length + ' signed Change Order' + (signedChangeOrders.length === 1 ? '' : 's') + '. Review the downstream contract impact before continuing.</div></div>'
          : '') +
      '</div>';
    }
    if (prevAcc && prevAcc.n !== revN) rows += '<p class="cs-sec-desc" style="color:#B97A00;"><i class="fai">&#xf05e;</i> Revision ' + prevAcc.n + ' was previously accepted and stays accepted &mdash; Revision ' + revN + ' now takes over as the signed-off baseline' + (qHasDownstreamWork(q) ? ', and its change orders/variations move to follow it' : '') + '.</p>';
    if (willMarkDealWon) rows += '<p class="cs-sec-desc"><i class="fai">&#xf521;</i> Quote #' + q.no + ' will become the Winner and this Deal will be marked as Won.</p>';
    rows += '<p class="cs-sec-desc"><i class="fai">&#xf023;</i> ' + fmt(rev.value) + ' becomes the signed-off baseline. Change orders and variations are raised against this revision.</p>';
    rows += '<p class="cs-sec-desc"><b>Deal value:</b> ' + fmtRange(before) + ' &rarr; ' + fmtRange(after) + '</p>';

    document.getElementById('acceptRevTitle').textContent = acceptedAlternative
      ? 'Accept Revision ' + revN + ' and change the Winner?'
      : willMarkDealWon
        ? 'Accept Revision ' + revN + ' and mark Deal as Won?'
        : 'Accept Revision ' + revN + ' as the new baseline?';
    document.getElementById('arm-body').innerHTML = rows +
      '<div class="cs-actions"><button class="cs-btn ghost" onclick="closeAcceptRevModal()">Cancel</button>' +
      '<button class="cs-btn primary" onclick="qtConfirmAcceptRevision(' + qi + ',' + revN + ')">' +
        (acceptedAlternative ? 'Accept & Change Winner' : willMarkDealWon ? 'Accept & Mark Won' : 'Accept Revision ' + revN) + '</button></div>';
    document.getElementById('acceptRevOverlay').classList.add('open');
  }
  function qtOpenSetWinnerModal(qi) {
    const quotes = DEAL_QUOTES[ddDeal.t], q = quotes[qi];
    const acceptedRev = q && qLatestAcceptedRev(q);
    const currentWinner = q && qtAcceptedAlternativeQuote(quotes, qi);
    if (!q || !acceptedRev || !currentWinner) {
      qtShowSnackbar('This Quote must be Accepted before it can become the Winner.', 'blocked');
      renderQuoteListOverlay();
      return;
    }

    const currentSigned = dealContractValue(quotes);
    const clone = JSON.parse(JSON.stringify(quotes));
    const cloneRev = qLatestAcceptedRev(clone[qi]);
    cloneRev.acceptSeq = qtAcceptSeq + 1;
    clone[qi].acceptedRev = cloneRev.n;
    qtApplyAlternativeWinner(clone, qi);
    const nextSigned = dealContractValue(clone);
    const signedChangeOrders = currentWinner.q.cos.filter(co => qStatusLocked(co.status));

    document.getElementById('acceptRevTitle').textContent = 'Change the winning Quote?';
    document.getElementById('arm-body').innerHTML =
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf521;</i><div><b>Winner will change</b> from Quote #' + currentWinner.q.no + ' to Quote #' + q.no + '.</div></div>' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf05e;</i><div>Quote #' + currentWinner.q.no + ' will be Rejected and will stop contributing to the signed totals.</div></div>' +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf1ec;</i><div><b>Signed contract value:</b> ' + fmt(currentSigned) + ' &rarr; ' + fmt(nextSigned) + '</div></div>' +
        (signedChangeOrders.length
          ? '<div class="qt-alt-confirm-item warn"><i class="fai">&#xf071;</i><div>The current Winner has ' + signedChangeOrders.length + ' signed Change Order' + (signedChangeOrders.length === 1 ? '' : 's') + '. Review the downstream contract impact before continuing.</div></div>'
          : '') +
      '</div>' +
      '<div class="cs-actions"><button class="cs-btn ghost" onclick="closeAcceptRevModal()">Cancel</button>' +
      '<button class="cs-btn primary" onclick="qtConfirmSetWinner(' + qi + ')">Change Winner</button></div>';
    document.getElementById('acceptRevOverlay').classList.add('open');
  }
  function qtConfirmSetWinner(qi) {
    const quotes = DEAL_QUOTES[ddDeal.t], q = quotes[qi];
    const previousWinner = qtAcceptedAlternativeQuote(quotes, qi);
    const acceptedRev = q && qLatestAcceptedRev(q);
    if (!q || !acceptedRev || !previousWinner) {
      closeAcceptRevModal();
      qtShowSnackbar('The Winner could not be changed. Refresh and try again.', 'blocked');
      return;
    }

    acceptedRev.acceptSeq = ++qtAcceptSeq;
    q.acceptedRev = acceptedRev.n;
    qtApplyAlternativeWinner(quotes, qi);
    closeAcceptRevModal();
    ddRenderQuotes();
    renderQuoteListOverlay();
    recalcPipeline();
    qtShowSnackbar('Winner changed to Quote #' + q.no + '. Quote #' + previousWinner.q.no + ' was Rejected.', 'success');
  }
  function closeAcceptRevModal() {
    document.getElementById('acceptRevOverlay').classList.remove('open');
    renderQuoteListOverlay(); // nothing changed if this was a cancel — resets any select the user had already flipped to "Accepted"
  }

  // Archived is a Deal status, never a Pipeline stage. If every related Quote has been
  // explicitly Cancelled, the Deal leaves the active Pipeline while retaining its last
  // stage for audit and restore. Accepted/Complete always wins over the archive rule.
  function qtSyncAllCancelledArchive(deal, quotes) {
    if (!deal || !Array.isArray(quotes)) return null;
    const systemCause = 'all-related-quotes-cancelled';
    const hasAcceptedQuote = quotes.some(quote => qIsWon(quote));
    const allCancelled = quotes.length > 0 && !hasAcceptedQuote &&
      quotes.every(quote => quote.status === 'cancelled');

    if (allCancelled && !deal.archived) {
      deal.archivedFromStageIndex = deal.s;
      deal.archivedFromStage = CRM_STAGE_DEFS[deal.s] ? CRM_STAGE_DEFS[deal.s].name : '';
      deal.archivedOutcome = (CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].outcome) || 'open';
      deal.archivedAt = new Date().toISOString();
      deal.archivedBy = 'System · all Quotes cancelled';
      deal.archiveCause = systemCause;
      deal.archived = true;

      const boardCard = findPipelineCardForDeal(deal);
      if (boardCard && boardCard.isConnected) boardCard.remove();
      recalcPipeline();
      saveActivePipelineState();
      renderArchiveView();
      closeDealAfterRemoval(deal);
      return 'archived';
    }

    // A system-archived Deal becomes active again when a related Quote is revived.
    // Manually archived Deals remain archived until the user explicitly restores them.
    if (!allCancelled && deal.archived && deal.archiveCause === systemCause) {
      deal.archived = false;
      deal.s = Number.isInteger(deal.archivedFromStageIndex) && CRM_STAGE_DEFS[deal.archivedFromStageIndex]
        ? deal.archivedFromStageIndex
        : deal.s;
      delete deal.archiveCause;
      rebuildPipelineColumns();
      ddCard = findPipelineCardForDeal(deal);
      saveActivePipelineState();
      renderArchiveView();
      return 'restored';
    }

    return null;
  }

  // Status dropdown onchange handlers. The dropdown always lists the full real status set and is
  // freely switchable; 'accepted' is the one transition with real side effects (moves the signed-off
  // baseline, possibly away from another already-accepted revision), so it alone still routes through
  // the confirm modal.
  function qtAutomationEventsBlocked(deal, eventNames, options = {}) {
    const names = Array.isArray(eventNames) ? eventNames : [eventNames];
    const getRequirements = function () {
      if (!window.WeQuoteAutomation || typeof window.WeQuoteAutomation.getEventRequirements !== 'function') return [];
      const seen = new Set();
      return names.flatMap(function (eventName) {
        return window.WeQuoteAutomation.getEventRequirements(deal, eventName) || [];
      }).filter(function (item) {
        const key = item.linkedType + ':' + item.linkedId;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    };
    const requirements = getRequirements();
    if (requirements.length) {
      const labels = {
        'first-related-quote': 'Create first Quote',
        'quote-submitted-review': 'Submit for Review',
        'quote-review-passed': 'Pass Review',
        'quote-sent': 'Send Quote',
        'quote-accepted': 'Accept Quote',
        'deal-won': 'Mark Deal Won',
        'deal-lost': 'Mark Deal Lost'
      };
      const destination = names.map(function (name) { return labels[name] || 'Continue'; }).join(' + ');
      openRequiredTasksDialog(deal, getRequirements, {
        kicker: 'QUOTE LIFECYCLE CHECKPOINT',
        title: 'Have you completed the required tasks?',
        copy: 'This Quote lifecycle action is protected. Complete every required item below, then continue the original action.',
        destination: destination,
        actionLabel: options.actionLabel || destination,
        onContinue: options.onContinue
      });
      if (ddDeal === deal && typeof ddRenderFocus === 'function') ddRenderFocus();
      return true;
    }
    const message = window.WeQuoteAutomation && typeof window.WeQuoteAutomation.getEventBlock === 'function'
      ? names.map(function (eventName) { return window.WeQuoteAutomation.getEventBlock(deal, eventName); }).find(Boolean)
      : null;
    if (!message) return false;
    qtShowSnackbar(message, 'blocked');
    if (ddDeal === deal && typeof ddRenderFocus === 'function') ddRenderFocus();
    return true;
  }

  function qtAutomationEventBlocked(deal, eventName, options) {
    return qtAutomationEventsBlocked(deal, [eventName], options);
  }

  function qtRevStatusChange(sel, qi, revN) {
    const value = sel.value;
    const quotes = DEAL_QUOTES[ddDeal.t], q = quotes[qi], rev = q.revisions.find(r => r.n === revN);
    const previousStatus = q.status;
    const blockedEvent = value === 'review' ? 'quote-submitted-review'
      : value === 'sent' ? 'quote-sent'
        : value === 'reviewed' ? 'quote-review-passed'
          : value === 'accepted' ? 'quote-accepted' : '';
    if (blockedEvent && qtAutomationEventBlocked(ddDeal, blockedEvent, {
      actionLabel: value === 'review' ? 'Submit for Review' : value === 'reviewed' ? 'Pass Review' : value === 'sent' ? 'Send Quote' : 'Accept Quote',
      onContinue: function () { qtRevStatusChange({ value: value }, qi, revN); }
    })) {
      renderQuoteListOverlay();
      return;
    }
    if (value === 'complete' && qtAcceptedAlternativeQuote(quotes, qi)) {
      qtShowSnackbar('Set this Quote to Accepted first to confirm the Winner change.', 'blocked');
      renderQuoteListOverlay();
      return;
    }
    if (!qtRevIsAllowed(q, rev, value)) {
      qtShowSnackbar(qtRevBlockMsg(q, rev));
      renderQuoteListOverlay();
      return;
    }
    const c = qtRevCtx(q, rev);
    if (value === 'accepted') { qtOpenAcceptRevModal(qi, revN); return; }
    if (value === 'complete') { q.status = 'complete'; qtApplyAlternativeWinner(quotes, qi); }
    else if (value === 'sent' && c.superseded) { /* re-picking its own frozen state — no-op */ }
    else { q.status = value; rev.status = (value === 'cancelled' || value === 'rejected') ? 'declined' : 'live'; }
    if (value === 'sent' && previousStatus !== 'sent' && window.WeQuoteAutomation) {
      window.WeQuoteAutomation.emit('quote.sent', { deal: ddDeal, quote: q });
    }
    if (window.WeQuoteAutomation && value !== previousStatus) {
      if (value === 'review') window.WeQuoteAutomation.emit('quote.review.submitted', { deal: ddDeal, quote: q, field: 'status' });
      else if (value === 'reviewed') window.WeQuoteAutomation.emit('quote.review.passed', { deal: ddDeal, quote: q, field: 'status' });
      else if (value !== 'sent' && value !== 'accepted') window.WeQuoteAutomation.emit('quote.updated', { deal: ddDeal, quote: q, field: 'status' });
    }
    const archiveChange = qtSyncAllCancelledArchive(ddDeal, quotes);
    if (archiveChange === 'archived') {
      qtShowSnackbar('All related Quotes are Cancelled. Deal archived; its last Stage is retained.', 'success');
      return;
    }
    if (value === 'complete') qtMoveCurrentDealToWon();
    ddRenderQuotes();
    renderQuoteListOverlay();
    recalcPipeline();
    if (archiveChange === 'restored') {
      qtShowSnackbar('A related Quote is active again. Deal restored to its previous Stage.', 'success');
    }
  }
  function qtVarStatusChange(sel, qi, vi) {
    const value = sel.value;
    const q = DEAL_QUOTES[ddDeal.t][qi], v = q.variations[vi];
    if (qStatusLocked(value)) {
      const acceptedAlternative = qtAcceptedAlternativeVariation(q, vi);
      if (acceptedAlternative) {
        qtShowSnackbar(qtVariationAlternativeAcceptBlockMessage(acceptedAlternative), 'blocked');
        renderQuoteListOverlay();
        return;
      }
    }
    if (!qtVarIsAllowed(v, value)) {
      if (v.status === 'draft' && value !== 'draft') { qtFillVariation(qi, vi); return; } // needs a name+value first — route to that flow
      qtShowSnackbar(qtVarBlockMsg());
      renderQuoteListOverlay();
      return;
    }
    if (value === 'accepted') qtAcceptVariation(qi, vi);
    else { v.status = value; renderQuoteListOverlay(); }
  }
  function qtCoStatusChange(sel, qi, ci) {
    const value = sel.value;
    const q = DEAL_QUOTES[ddDeal.t][qi], co = q.cos[ci];
    if (!qtCoIsAllowed(q, co, value)) {
      qtShowSnackbar(qtCoBlockMsg(co, value));
      renderQuoteListOverlay();
      return;
    }
    if (qStatusLocked(value)) qtSignCo(qi, ci, value);
    else if (value === 'sent') qtSendCo(qi, ci);
    else if (value === 'draft' && co.status !== 'draft') qtRecallCo(qi, ci);
    else { co.status = value; renderQuoteListOverlay(); }
  }
  function qtConfirmAcceptRevision(qi, revN) {
    if (qtAutomationEventsBlocked(ddDeal, ['quote-accepted', 'deal-won'], {
      actionLabel: 'Accept Quote & mark Won',
      onContinue: function () { qtConfirmAcceptRevision(qi, revN); }
    })) {
      closeAcceptRevModal();
      renderQuoteListOverlay();
      return;
    }
    const quotes = DEAL_QUOTES[ddDeal.t], q = quotes[qi];
    const acceptedAlternative = qtAcceptedAlternativeQuote(quotes, qi);
    const dealWasAlreadyWon = quotes.some(quote => qIsWon(quote));
    // Only the chosen Revision becomes accepted. Earlier Revision snapshots stay in the audit trail;
    // sibling Quotes are rejected only when they share this Quote's explicit Alternative group.
    // q.status is specifically the CURRENT revision's own real-system journey label, so accepting an
    // older, already-superseded revision must never touch it — otherwise the current revision (which
    // was never itself accepted) would incorrectly start displaying "Accepted" too.
    if (revN === qCurrentRev(q).n) q.status = 'accepted';
    q.revisions.forEach(r => { if (r.n === revN) { r.status = 'accepted'; r.acceptSeq = ++qtAcceptSeq; } });
    q.acceptedRev = qLatestAcceptedRev(q).n; // the signed-off baseline is always the LATEST accepted (by time)
    qtApplyAlternativeWinner(quotes, qi);
    qtSyncAllCancelledArchive(ddDeal, quotes);
    const movedToWon = qtMoveCurrentDealToWon();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('quote.accepted', { deal: ddDeal, quote: q });
    closeAcceptRevModal();
    ddRenderQuotes();
    renderQuoteListOverlay();
    recalcPipeline();
    qtShowSnackbar(
      acceptedAlternative
        ? 'Winner changed to Quote #' + q.no + '. Quote #' + acceptedAlternative.q.no + ' was Rejected and signed totals were updated.'
        : dealWasAlreadyWon
          ? 'Revision ' + revN + ' accepted as the new signed-off baseline for Quote #' + q.no + '.'
          : 'Quote #' + q.no + ' accepted and set as Winner. Deal marked as Won.' + (movedToWon ? ' Deal moved to the Won stage.' : ''),
      'success'
    );
  }

  function qtMoveCurrentDealToWon() {
    if (!ddDeal) return false;
    const wonIndex = stageIndexByOutcome('won');
    if (wonIndex < 0) return false;
  const changed = ddDeal.s !== wonIndex;

    // Quote acceptance is also the Deal outcome action. Keep the underlying Deal,
    // its Kanban card and all stage totals in sync instead of only updating the
  // Quote overlay / detail-page stage bar.
  if (changed) {
    const boardCard = ddCard && ddCard.isConnected
      ? ddCard
      : Array.from(pipelineEl.querySelectorAll('.deal-card')).find(card => card._deal === ddDeal);
    if (boardCard) {
      ddCard = boardCard;
      commitDealMove(boardCard, wonIndex);
    } else {
      ddDeal.s = wonIndex;
      recalcPipeline();
    }
    }
    ddRenderStagebar();
    ddRenderBilling();
    if (changed && !ddDeal.wonAt) ddDeal.wonAt = ddWonTimestamp();
    ddSyncWonButton();
    return changed;
  }
  function qtCreateRevision(qi) {
    const q = DEAL_QUOTES[ddDeal.t][qi], cur = qCurrentRev(q);
    const next = prompt('New revision value (£)', cur.value);
    if (next === null) return;
    const num = parseInt(String(next).replace(/[^0-9]/g, ''), 10);
    qtPendingJourney = { qi, key: 'rev-' + (cur.n + 1) };
    q.revisions.push({ n: cur.n + 1, value: isNaN(num) ? cur.value : num, status: 'live' });
    q.status = 'draft'; // the new revision hasn't been sent yet — it needs its own Draft → Sent pass
    ddRenderQuotes();
    renderQuoteListOverlay();
  }

  // ---------- Variation actions ----------
  function showQuoteCreatedModal(title, desc) {
    document.querySelector('#quoteCreatedOverlay .qcm-title').innerHTML = title;
    document.querySelector('#quoteCreatedOverlay .qcm-desc').textContent = desc;
    document.getElementById('quoteCreatedOverlay').classList.add('open');
  }
  function qtCreateVariation(qi) {
    const q = DEAL_QUOTES[ddDeal.t][qi], vi = q.variations.length;
    qtPendingJourney = { qi, key: 'var-' + vi };
    q.variations.push({ no: String(nextVariationNo++), name: 'Untitled', value: 0, status: 'draft' });
    renderQuoteListOverlay();
    showQuoteCreatedModal('&lsquo;Untitled&rsquo; Variation created on this deal', 'A placeholder variation has been created. Add pricing and details in the Quote Editor, which opens in a new tab.');
  }
  function qtFillVariation(qi, vi) {
    const v = DEAL_QUOTES[ddDeal.t][qi].variations[vi];
    const name = prompt('Variation description', v.name || 'Untitled');
    if (name === null) return;
    const valStr = prompt('Variation value (£)', v.value || '');
    if (valStr === null) return;
    const num = parseInt(String(valStr).replace(/[^0-9]/g, ''), 10);
    v.name = name.trim() || 'Untitled'; v.value = isNaN(num) ? 0 : num; v.status = 'sent';
    renderQuoteListOverlay();
  }
  function qtAcceptVariation(qi, vi) {
    const q = DEAL_QUOTES[ddDeal.t][qi];
    const acceptedAlternative = qtAcceptedAlternativeVariation(q, vi);
    if (acceptedAlternative) {
      qtShowSnackbar(qtVariationAlternativeAcceptBlockMessage(acceptedAlternative), 'blocked');
      renderQuoteListOverlay();
      return false;
    }
    q.variations[vi].status = 'accepted';
    renderQuoteListOverlay();
    return true;
  }
  function qtDeclineVariation(qi, vi) { DEAL_QUOTES[ddDeal.t][qi].variations[vi].status = 'rejected'; renderQuoteListOverlay(); }

  // ---------- Change Order actions ----------
  function qtCreateCo(qi) {
    const q = DEAL_QUOTES[ddDeal.t][qi];
    if (qBlockingCo(q)) return;
    qtPendingJourney = { qi, key: 'co-' + q.cos.length };
    q.cos.push({ name: 'CO 1.' + (q.cos.length + 1), desc: 'Untitled', status: 'draft', varIds: [], adjustments: [] });
    renderQuoteListOverlay();
  }
  function qtAddAdjustment(qi, ci) {
    const co = DEAL_QUOTES[ddDeal.t][qi].cos[ci];
    const name = prompt('What changes? (e.g. "Omit spare HDMI run")');
    if (!name || !name.trim()) return;
    const valStr = prompt('Adjustment value (£) — use a minus sign for a deduction', '0');
    if (valStr === null) return;
    const num = parseInt(String(valStr).replace(/[^0-9-]/g, ''), 10);
    co.adjustments = co.adjustments || [];
    co.adjustments.push({ name: name.trim(), value: isNaN(num) ? 0 : num });
    if (!co.desc || co.desc === 'Untitled') co.desc = name.trim();
    renderQuoteListOverlay();
  }
  function qtSendCo(qi, ci) { DEAL_QUOTES[ddDeal.t][qi].cos[ci].status = 'sent'; renderQuoteListOverlay(); }
  function qtRecallCo(qi, ci) { DEAL_QUOTES[ddDeal.t][qi].cos[ci].status = 'draft'; renderQuoteListOverlay(); }
  function qtSignCo(qi, ci, value) {
    DEAL_QUOTES[ddDeal.t][qi].cos[ci].status = value || 'accepted';
    ddRenderQuotes();
    renderQuoteListOverlay();
    recalcPipeline();
  }

  // Change Order picker — multi-select over unbundled accepted variations, for Raise/Add-to-CO
  let qtPickerMode = 'new', qtPickerQi = null, qtPickerCoIdx = null, qtPickerSel = new Set();
  function qtOpenCoPicker(mode, qi, coIdx, preVi) {
    qtPickerMode = mode; qtPickerQi = qi; qtPickerCoIdx = coIdx != null ? coIdx : null;
    qtPickerSel = new Set(preVi != null ? [preVi] : []);
    renderCoPicker();
    document.getElementById('coPickerOverlay').classList.add('open');
  }
  function closeCoPicker() { document.getElementById('coPickerOverlay').classList.remove('open'); }
  function qtAddToCo(qi, vi) { const q = DEAL_QUOTES[ddDeal.t][qi]; qtOpenCoPicker('add', qi, q.cos.indexOf(qOpenCo(q)), vi); }
  function qtRaiseCo(qi, vi) { qtOpenCoPicker('new', qi, null, vi); }
  function qtTryRaiseCo(qi, vi) {
    const q = DEAL_QUOTES[ddDeal.t][qi], blocking = qBlockingCo(q);
    if (blocking) {
      qtShowSnackbar(blocking.name + ' is still with the customer. Wait for a response before raising another Change Order.');
      return;
    }
    qtRaiseCo(qi, vi);
  }
  function qtToggleCoPickVar(vi) {
    if (qtPickerSel.has(vi)) qtPickerSel.delete(vi); else qtPickerSel.add(vi);
    renderCoPicker();
  }
  function renderCoPicker() {
    const q = DEAL_QUOTES[ddDeal.t][qtPickerQi], pool = qUnbundled(q);
    const rows = pool.map(vi => {
      const v = q.variations[vi], sel = qtPickerSel.has(vi);
      return '<div class="qtp-row' + (sel ? ' selected' : '') + '" onclick="qtToggleCoPickVar(' + vi + ')">' +
        '<span class="chk">' + (sel ? '<i class="fai">&#xf00c;</i>' : '') + '</span>' +
        '<span class="info">' + (v.name || 'Variation') + '</span>' +
        '<span class="oval">+' + fmt(v.value) + '</span>' +
      '</div>';
    }).join('') || '<p class="cs-sec-desc">No accepted, unbundled variations.</p>';
    const total = [...qtPickerSel].reduce((s, vi) => s + q.variations[vi].value, 0);
    document.getElementById('qtp-rows').innerHTML = rows;
    document.getElementById('qtp-count').textContent = qtPickerSel.size + ' selected';
    document.getElementById('qtp-sum').textContent = fmt(total);
    document.getElementById('qtp-confirm').disabled = qtPickerSel.size === 0;
    if (qtPickerMode === 'add') {
      const co = q.cos[qtPickerCoIdx];
      document.getElementById('qtp-title').textContent = 'Add variations to ' + co.name;
      document.getElementById('qtp-sub').textContent = co.name + ' is still Draft, so more accepted variations can go in.';
    } else {
      document.getElementById('qtp-title').textContent = 'Raise Change Order';
      document.getElementById('qtp-sub').textContent = 'Pick which accepted variations this change order covers. Anything unchecked stays in the pool for a later CO.';
    }
  }
  function confirmCoPicker() {
    const q = DEAL_QUOTES[ddDeal.t][qtPickerQi];
    if (qtPickerMode === 'add') {
      q.cos[qtPickerCoIdx].varIds.push(...qtPickerSel);
    } else {
      q.cos.push({ name: 'CO 1.' + (q.cos.length + 1), desc: 'Untitled', status: 'draft', varIds: [...qtPickerSel], adjustments: [] });
    }
    qtVariationSelected.clear();
    closeCoPicker();
    ddRenderQuotes();
    renderQuoteListOverlay();
  }

  [['deleteRevisionOverlay', qtCloseDeleteRevision], ['acceptRevOverlay', closeAcceptRevModal], ['coPickerOverlay', closeCoPicker], ['alternativeConfirmOverlay', qtCloseAlternativeConfirm], ['wonQuoteOverlay', closeWonQuotePicker], ['lostReasonOverlay', closeLostReasonDialog], ['meetingEditOverlay', closeMeetingEditDialog], ['meetingRemoveOverlay', closeMeetingRemoveDialog], ['pipelineCreateOverlay', closePipelineCreateDialog], ['pipelineEditOverlay', closePipelineEditDialog], ['pipelineDeleteOverlay', closePipelineDeleteDialog], ['pipelineSaveOverlay', closePipelineSaveDialog], ['stageDeleteOverlay', closeStageDeleteDialog], ['stageCreateOverlay', closeStageCreateDialog], ['bulkLeadConvertOverlay', closeBulkLeadConvertDialog]].forEach(([id, close]) => {
    const overlay = document.getElementById(id);
    if (overlay) overlay.addEventListener('click', e => { if (e.target.id === id) close(); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('pipelineSelectorMenu').classList.contains('open')) { closePipelineSelector(); return; }
    if (document.getElementById('pipelineCreateOverlay').classList.contains('open')) { closePipelineCreateDialog(); return; }
    if (document.getElementById('pipelineDeleteOverlay').classList.contains('open')) { closePipelineDeleteDialog(); return; }
    if (document.getElementById('pipelineEditOverlay').classList.contains('open')) { closePipelineEditDialog(); return; }
    if (document.getElementById('pipelineSaveOverlay').classList.contains('open')) { closePipelineSaveDialog(); return; }
    if (document.getElementById('stageCreateOverlay').classList.contains('open')) { closeStageCreateDialog(); return; }
    if (document.getElementById('stageDeleteOverlay').classList.contains('open')) { closeStageDeleteDialog(); return; }
    if (document.getElementById('bulkLeadConvertOverlay').classList.contains('open')) { closeBulkLeadConvertDialog(); return; }
    if (document.getElementById('meetingRemoveOverlay').classList.contains('open')) { closeMeetingRemoveDialog(); return; }
    if (document.getElementById('meetingEditOverlay').classList.contains('open')) { closeMeetingEditDialog(); return; }
    if (document.getElementById('lostReasonOverlay').classList.contains('open')) { closeLostReasonDialog(); return; }
    if (document.getElementById('wonQuoteOverlay').classList.contains('open')) { closeWonQuotePicker(); return; }
    if (document.getElementById('coPickerOverlay').classList.contains('open')) { closeCoPicker(); return; }
    if (document.getElementById('alternativeConfirmOverlay').classList.contains('open')) { qtCloseAlternativeConfirm(); return; }
    if (document.getElementById('deleteRevisionOverlay').classList.contains('open')) { qtCloseDeleteRevision(); return; }
    if (document.getElementById('acceptRevOverlay').classList.contains('open')) closeAcceptRevModal();
  });

  function ddUnlinkQuote(i) {
    const d = ddDeal, quotes = DEAL_QUOTES[d.t];
    const q = quotes[i];
    const unlinkBlocked = qtQuoteHasAcceptedOutcome(q) || q.cos.some(co => qStatusLocked(co.status));
    if (unlinkBlocked) {
      qtShowSnackbar('This Quote has been accepted or has a signed Change Order and cannot be unlinked. Reverse that status first.');
      return;
    }
    const before = dealValueRange(quotes);
    const preview = JSON.parse(JSON.stringify(quotes));
    preview.splice(i, 1);
    qtEnsureAutomaticQuoteAlternatives(preview);
    const after = dealValueRange(preview);
    qtShowAlternativeConfirm(
      'Unlink Quote #' + q.no + '?',
      '<p class="cs-sec-desc">Quote #' + q.no + ' will be removed from this Deal.</p>' +
      '<div class="qt-alt-confirm-list">' +
        '<div class="qt-alt-confirm-item"><i class="fai">&#xf127;</i><div>The Quote document will remain in Quote &amp; Sales. Only its Deal link will be removed.</div></div>' +
        (quotes.length === 2
          ? '<div class="qt-alt-confirm-item"><i class="fai">&#xf248;</i><div>The remaining Quote will automatically become a standalone Quote.</div></div>'
          : '') +
        '<div class="qt-alt-confirm-item money"><i class="fai">&#xf154;</i><div>Deal value ' + qtAlternativeDeltaHtml(before, after) + '</div></div>' +
      '</div>',
      'Unlink Quote',
      () => {
        quotes.splice(i, 1);
        qtAltSelected.clear();
        qtEnsureAutomaticQuoteAlternatives(quotes);
        if (!quotes.length) delete DEAL_QUOTES[d.t];
        qtShowSnackbar('Quote #' + q.no + ' unlinked from this Deal.', 'success');
        ddRenderQuotes();
        renderQuoteListOverlay();
        recalcPipeline();
      }
    );
  }

  function ddInvoiceIsIssued(invoice) {
    return invoice.status !== 'draft' && invoice.status !== 'void';
  }

  function ddBillingDateLabel(value) {
    if (!value) return 'No due date';
    return new Date(value + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  }

  function ddBillingInvoicePresentation(invoice) {
    if (invoice.status === 'draft') return { label: 'Draft', cls: 'invoice-draft' };
    if (invoice.status === 'void') return { label: 'Void', cls: 'invoice-void' };
    const balance = Math.max(0, invoice.total - invoice.paid);
    if (balance === 0) return { label: 'Paid', cls: 'payment-paid' };
    if (invoice.due && invoice.due < ddTodayIso()) return { label: 'Overdue', cls: 'invoice-ready' };
    if (invoice.paid > 0) return { label: 'Partially paid', cls: 'payment-partial' };
    return { label: 'Unpaid', cls: 'payment-unpaid' };
  }

  function ddBillingDraftDueDate() {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    return date.toISOString().slice(0, 10);
  }

  function ddBillingInvoiceRows(invoices) {
    if (!invoices.length) return '';
    return '<div class="dd-billing-list">' + invoices.map(invoice => {
      const status = ddBillingInvoicePresentation(invoice);
      const issued = ddInvoiceIsIssued(invoice);
      const balance = issued ? Math.max(0, invoice.total - invoice.paid) : 0;
      return '<div class="dd-billing-invoice-row">' +
        '<div class="invoice-name"><strong>' + archiveEscape(invoice.no) + '</strong><small>' +
          (invoice.status === 'draft' ? 'Not sent to customer' : 'Due ' + ddBillingDateLabel(invoice.due)) + '</small></div>' +
        '<span class="dd-billing-chip dd-billing-invoice-status ' + status.cls + '">' + status.label + '</span>' +
        '<span class="num"><small>Invoice</small>' + fmt(invoice.total) + '</span>' +
        '<span class="num invoice-balance"><small>' + (issued ? 'Balance' : 'Draft') + '</small>' +
          (issued ? fmt(balance) : fmt(invoice.total)) + '</span>' +
      '</div>';
    }).join('') + '</div>';
  }

  function openInvoiceListOverlay() {
    if (!ddDeal) return;
    renderInvoiceListOverlay();
    document.getElementById('invoiceListOverlay')?.classList.add('open');
  }

  function closeInvoiceListOverlay() {
    document.getElementById('invoiceListOverlay')?.classList.remove('open');
  }

  function invoiceWorkspaceAction(action, invoiceNo) {
    const messages = {
      view: 'Opening ' + invoiceNo + ' preview.',
      edit: 'Opening ' + invoiceNo + ' in the Invoice Editor.',
      payment: 'Record payment for ' + invoiceNo + '.',
      more: 'More invoice actions for ' + invoiceNo + '.'
    };
    qtShowSnackbar(messages[action] || invoiceNo, 'success');
  }

  function renderInvoiceListOverlay() {
    if (!ddDeal) return;
    const invoices = DEAL_BILLING[ddDeal.t] || [];
    const contract = dealContractValue(DEAL_QUOTES[ddDeal.t] || []);
    const issued = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + Math.min(invoice.paid, invoice.total), 0);
    const outstanding = Math.max(0, issued - paid);
    const remaining = Math.max(0, contract - issued);

    document.getElementById('ilo-topbar').innerHTML =
      '<div class="ilo-titleblock"><strong id="iloTitle">Total ' + invoices.length + ' Invoice' + (invoices.length === 1 ? '' : 's') + '</strong><span>Billing documents for ' + archiveEscape(ddDeal.t) + '</span></div>' +
      '<div class="ilo-summary">' +
        '<span><small>Accepted value</small><b>' + fmt(contract) + '</b></span>' +
        '<span><small>Invoiced</small><b>' + fmt(issued) + '</b></span>' +
        '<span><small>Paid</small><b class="paid">' + fmt(paid) + '</b></span>' +
        '<span><small>Outstanding</small><b>' + fmt(outstanding) + '</b></span>' +
        '<span><small>Remaining to invoice</small><b>' + fmt(remaining) + '</b></span>' +
        '<button class="dd-billing-btn primary" type="button" onclick="closeInvoiceListOverlay();ddToggleInvoiceDraftForm()"><i class="fai">&#x2b;</i> Create invoice</button>' +
      '</div>';

    const rows = invoices.map(invoice => {
      const state = ddBillingInvoicePresentation(invoice);
      const issuedInvoice = ddInvoiceIsIssued(invoice);
      const paidAmount = issuedInvoice ? Math.min(invoice.paid, invoice.total) : 0;
      const paidPct = invoice.total ? paidAmount / invoice.total * 100 : 0;
      const type = invoice.type || 'standard';
      const dateCopy = invoice.status === 'draft' ? 'Not issued' : ddBillingDateLabel(invoice.issued || invoice.due);
      const action = invoice.status === 'draft' ? 'edit' : 'view';
      const actionIcon = invoice.status === 'draft' ? '&#xf303;' : '&#xf06e;';
      return '<div class="ilo-row">' +
        '<div class="ilo-name"><strong>Invoice for ' + archiveEscape(ddDeal.t) + '</strong><span>' + archiveEscape(invoice.no) + ' · ' + archiveEscape(ddDeal.c || '') + '</span></div>' +
        '<span class="ilo-type ' + type + '">' + type + '</span>' +
        '<span class="ilo-date">' + dateCopy + '<small>Due ' + ddBillingDateLabel(invoice.due) + '</small></span>' +
        '<span class="dd-billing-chip ilo-status ' + state.cls + '">' + state.label + '</span>' +
        '<div class="ilo-total"><strong>' + fmt(invoice.total) + '</strong><div class="ilo-paytrack ' + (invoice.status === 'draft' ? 'draft' : '') + '"><i style="width:' + (invoice.status === 'draft' ? '100' : paidPct.toFixed(1)) + '%"></i></div><small>' + (paidAmount ? fmt(paidAmount) + ' paid · ' + Math.round(paidPct) + '%' : (invoice.status === 'draft' ? 'Draft total' : 'Unpaid')) + '</small></div>' +
        '<div class="ilo-actions"><button type="button" onclick="invoiceWorkspaceAction(\'' + action + '\',\'' + archiveEscape(invoice.no) + '\')" title="' + (action === 'edit' ? 'Edit invoice' : 'View invoice') + '"><i class="fai">' + actionIcon + '</i></button>' +
          (invoice.status !== 'draft' && paidAmount < invoice.total ? '<button type="button" onclick="invoiceWorkspaceAction(\'payment\',\'' + archiveEscape(invoice.no) + '\')" title="Record payment"><i class="fai">&#xf53c;</i></button>' : '') +
          '<button type="button" onclick="invoiceWorkspaceAction(\'more\',\'' + archiveEscape(invoice.no) + '\')" title="More actions"><i class="fai">&#xf141;</i></button></div>' +
      '</div>';
    }).join('');

    document.getElementById('ilo-content').innerHTML =
      '<div class="ilo-table-head"><span>Name</span><span>Type</span><span>Issued on</span><span>Status</span><span>Net total</span><span></span></div>' +
      '<div class="ilo-rows">' + (rows || '<div class="ilo-empty">No invoices created yet.</div>') + '</div>';
  }

  function ddBillingDraftForm(available) {
    if (!ddBillingDraftOpen) return '';
    return '<div class="dd-billing-draft-form">' +
      '<label class="dd-billing-field"><span>Invoice amount</span><input id="ddBillingDraftAmount" type="number" min="1" max="' + available + '" value="' + available + '"></label>' +
      '<label class="dd-billing-field"><span>Due date</span><input id="ddBillingDraftDue" type="date" value="' + ddBillingDraftDueDate() + '"></label>' +
      '<div class="dd-billing-form-actions">' +
        '<button type="button" class="dd-billing-btn" onclick="ddToggleInvoiceDraftForm()">Cancel</button>' +
        '<button type="button" class="dd-billing-btn primary" onclick="ddCreateInvoiceDraft()">Create draft</button>' +
      '</div>' +
    '</div>';
  }

  function ddRenderBilling() {
    const el = document.getElementById('dd-billing-card');
    if (!el || !ddDeal) return;
    const stage = CRM_STAGE_DEFS[ddDeal.s];
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const contract = dealContractValue(quotes);
    if (!stage || stage.outcome !== 'won' || contract <= 0) {
      el.hidden = true;
      el.innerHTML = '';
      return;
    }

    const invoices = DEAL_BILLING[ddDeal.t] || [];
    const issued = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + invoice.total, 0);
    const paid = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + Math.min(invoice.paid, invoice.total), 0);
    const drafts = invoices.filter(invoice => invoice.status === 'draft').reduce((sum, invoice) => sum + invoice.total, 0);
    const outstanding = Math.max(0, issued - paid);
    const remaining = Math.max(0, contract - issued);
    const available = Math.max(0, remaining - drafts);
    const billingParts = [
      { label: 'Paid', cls: 'paid', amount: paid },
      { label: 'Invoiced · unpaid', cls: 'unpaid', amount: outstanding },
      { label: 'Draft', cls: 'draft', amount: drafts },
      { label: 'Not invoiced', cls: 'not-invoiced', amount: available }
    ].filter(part => part.amount > 0);
    const billingBarTotal = Math.max(contract, billingParts.reduce((sum, part) => sum + part.amount, 0));
    const billingLegend = billingParts.map(part =>
      '<span class="dd-billing-state ' + part.cls + '">' + part.label + '</span>'
    ).join('');
    const billingSegments = billingParts.map(part => {
      const pct = billingBarTotal ? part.amount / billingBarTotal * 100 : 0;
      const detail = part.label + ': ' + fmt(part.amount) + ' (' + Math.round(pct) + '%)';
      return '<span class="dd-billing-segment ' + part.cls + '" style="width:' + pct.toFixed(2) + '%" title="' + detail + '" aria-label="' + detail + '"></span>';
    }).join('');

    el.hidden = false;
    el.innerHTML =
      '<div class="dd-billing-head">' +
        '<div class="dd-billing-title"><i class="fai">&#xf571;</i><div><h3>Billing</h3><p>Invoice and payment progress for this Won Deal</p></div></div>' +
        '<div class="dd-billing-actions">' +
          (invoices.length ? '<button type="button" class="dd-qc-viewbtn" onclick="openInvoiceListOverlay()">View ' + invoices.length + ' Invoice(s)</button>' : '') +
          '<button type="button" class="dd-billing-btn" onclick="ddToggleInvoiceDraftForm()"' + (available <= 0 ? ' disabled' : '') + '><i class="fai">&#x2b;</i> Create invoice</button>' +
        '</div>' +
      '</div>' +
      '<div class="dd-billing-metrics">' +
        '<div class="dd-billing-metric"><span>Accepted value</span><strong>' + fmt(contract) + '</strong></div>' +
        '<div class="dd-billing-metric"><span>Invoiced</span><strong>' + fmt(issued) + '</strong></div>' +
        '<div class="dd-billing-metric paid"><span>Paid</span><strong>' + fmt(paid) + '</strong></div>' +
        '<div class="dd-billing-metric"><span>Outstanding</span><strong>' + fmt(outstanding) + '</strong></div>' +
        '<div class="dd-billing-metric remaining"><span>Remaining to invoice</span><strong>' + fmt(remaining) + '</strong></div>' +
      '</div>' +
      '<div class="dd-billing-breakdown" aria-label="Billing value breakdown">' +
        '<div class="dd-billing-legend">' + billingLegend + '</div>' +
        '<div class="dd-billing-segmented-track" role="img" aria-label="Accepted value split by billing status">' + billingSegments + '</div>' +
      '</div>' +
      '<div class="dd-billing-foot">' +
        '<span class="dd-billing-draft-note">' + (drafts > 0 ? '<strong>' + fmt(drafts) + '</strong> currently in draft · not included in invoiced total' : 'No draft invoices') + '</span>' +
      '</div>' +
      ddBillingDraftForm(available);
  }

  function ddToggleBillingInvoices() {
    openInvoiceListOverlay();
  }

  function ddToggleInvoiceDraftForm() {
    ddBillingDraftOpen = !ddBillingDraftOpen;
    ddRenderBilling();
    if (ddBillingDraftOpen) requestAnimationFrame(() => document.getElementById('ddBillingDraftAmount')?.focus());
  }

  function ddCreateInvoiceDraft() {
    if (!ddDeal) return;
    const amount = Number(document.getElementById('ddBillingDraftAmount')?.value || 0);
    const due = document.getElementById('ddBillingDraftDue')?.value || '';
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const contract = dealContractValue(quotes);
    const invoices = DEAL_BILLING[ddDeal.t] || [];
    const issued = invoices.filter(ddInvoiceIsIssued).reduce((sum, invoice) => sum + invoice.total, 0);
    const drafts = invoices.filter(invoice => invoice.status === 'draft').reduce((sum, invoice) => sum + invoice.total, 0);
    const available = Math.max(0, contract - issued - drafts);
    if (!(amount > 0) || amount > available) {
      qtShowSnackbar('Enter an invoice amount up to ' + fmt(available) + '.', 'blocked');
      return;
    }
    const invoice = { no: 'INV-' + nextInvoiceNo++, status: 'draft', total: Math.round(amount), paid: 0, due };
    if (!DEAL_BILLING[ddDeal.t]) DEAL_BILLING[ddDeal.t] = [];
    DEAL_BILLING[ddDeal.t].push(invoice);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('invoice.created', { deal: ddDeal, invoice });
    ddBillingDraftOpen = false;
    ddRenderBilling();
    openInvoiceListOverlay();
    qtShowSnackbar(invoice.no + ' created as a draft. Review it before sending to the customer.', 'success');
  }

  function ddRenderQuotes() {
    const d = ddDeal, quotes = DEAL_QUOTES[d.t], el = document.getElementById('dd-quotecard');
    if (!quotes) {
      el.innerHTML =
        '<div class="dd-qc-empty">' +
          '<div class="dd-qc-copy">' +
            '<div class="dd-qc-title">No quote linked yet</div>' +
            '<div class="dd-qc-desc">Create your first quote for this deal, or link an existing quote.</div>' +
          '</div>' +
          '<div class="dd-qc-actions">' +
            '<button class="dd-qc-create" onclick="ddCreateQuote()">' +
              '<span class="seg"><i class="fai">&#x2b;</i> Create</span>' +
              '<span class="sep"></span><span class="caret"><i class="fai">&#xf078;</i></span>' +
            '</button>' +
            '<button class="dd-qc-link"><i class="fai">&#xf0c1;</i> Link Quote</button>' +
          '</div>' +
        '</div>';
      return;
    }
    qtEnsureAutomaticQuoteAlternatives(quotes);
    const summary = dealQuoteSummaryHtml(d, quotes);
    el.innerHTML =
      '<div class="dd-qc-toprow">' +
        '<span class="dd-qc-title">Quote</span>' +
        '<button class="dd-qc-viewbtn" onclick="openQuoteListOverlay()">View ' + quotes.length + ' Quote(s)</button>' +
      '</div>' +
      summary.html;
    // Linked Quote rows are intentionally hidden for now to keep the Deal summary compact.
    // The renderer and data remain available if we decide to restore this section later.
    // el.innerHTML += linkedQuoteSummaryHtml(quotes);
  }

  // Creates a genuinely blank/In Progress Quote. The first related Quote is the protected
  // transition event that moves a Qualified Deal into In Progress; sending happens later.
  // Pops the quote-list view open first (with the new draft row visible in it), then the
  // "Untitled Quote created" confirmation on top of that — per the agreed ordering.
  function ddCreateQuote() {
    const d = ddDeal;
    const getFirstQuoteRequirements = window.WeQuoteAutomation && typeof window.WeQuoteAutomation.getFirstQuoteRequirements === 'function'
      ? function () { return window.WeQuoteAutomation.getFirstQuoteRequirements(d); }
      : null;
    if (getFirstQuoteRequirements && !(DEAL_QUOTES[d.t] || []).length && getFirstQuoteRequirements().length) {
      openRequiredTasksDialog(d, getFirstQuoteRequirements, {
        kicker: 'QUOTE LIFECYCLE CHECKPOINT',
        title: 'Have you completed the required tasks?',
        copy: 'The first related Quote moves this Deal into In Progress. Complete every required Custom Stage item first.',
        destination: (CRM_STAGE_DEFS[d.s] || {}).name + ' → In Progress',
        actionLabel: 'Create first Quote',
        onContinue: ddCreateQuote
      });
      ddRenderFocus();
      return;
    }
    const firstQuoteBlock = window.WeQuoteAutomation && typeof window.WeQuoteAutomation.getFirstQuoteBlock === 'function'
      ? window.WeQuoteAutomation.getFirstQuoteBlock(d)
      : null;
    if (firstQuoteBlock && !(DEAL_QUOTES[d.t] || []).length) {
      qtShowSnackbar(firstQuoteBlock, 'blocked');
      ddRenderFocus();
      return;
    }
    const existing = DEAL_QUOTES[d.t];
    const q = { no: String(nextQuoteNo++), status: 'draft', desc: 'Untitled', alternativeGroupId: null,
      revisions: [{ n: 1, value: 0, status: 'live' }], acceptedRev: null, variations: [], cos: [],
      linkedAt: new Date().toISOString(), comments: [], owningCompanyId: d.owningCompanyId || defaultOwningCompanyId() };
    DEAL_QUOTES[d.t] = (existing || []).concat([q]);
    ddEnsureQuoteActivity(d, DEAL_QUOTES[d.t]);
    qtEnsureAutomaticQuoteAlternatives(DEAL_QUOTES[d.t]);
    recalcPipeline();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('quote.created', {
      deal: d, quote: q, pipeline: getActivePipeline(), field: 'quote'
    });
    ddCard = findPipelineCardForDeal(d);
    openDealPage(d, ddCard);
    openQuoteListOverlay();
    document.getElementById('quoteCreatedOverlay').classList.add('open');
  }
  function closeQuoteCreatedModal() {
    document.getElementById('quoteCreatedOverlay').classList.remove('open');
    // Variation creation has a confirmation in front of the timeline. Start its one-off journey only
    // after that message closes, so the user actually sees the new station arrive.
    requestAnimationFrame(qtRenderAllConnectors);
  }
  function qtResolveRevision(qi, revN) {
    const quotes = ddDeal ? (DEAL_QUOTES[ddDeal.t] || []) : [];
    const quoteIndex = Number.isInteger(Number(qi)) ? Number(qi) : Math.max(0, quotes.length - 1);
    const quote = quotes[quoteIndex];
    if (!quote) return null;
    const revision = revN == null
      ? qCurrentRev(quote)
      : quote.revisions.find(item => Number(item.n) === Number(revN));
    return revision ? { quoteIndex, quote, revision } : null;
  }

  function qtOpenWorkspace(mode, qi, revN) {
    const target = qtResolveRevision(qi, revN);
    if (!target || !ddDeal) {
      qtShowSnackbar('This Quote is no longer available.', 'blocked');
      return;
    }
    const params = new URLSearchParams({
      mode,
      deal: ddDeal.t,
      contact: ddDeal.contact || ORG_CUSTOMERS[ddDeal.c] || ddDeal.c,
      quote: String(target.quote.no),
      revision: String(target.revision.n),
      name: target.quote.desc || 'Untitled',
      value: String(target.revision.value || 0),
      status: QUOTE_STATUS_LABEL[target.quote.status] || target.quote.status || 'Draft'
    });
    window.open('./quote-workspace.html?' + params.toString(), '_blank', 'noopener');
    closeQuoteCreatedModal();
  }

  function openQuoteEditorNewTab(qi, revN) { qtOpenWorkspace('editor', qi, revN); }
  function qtViewProposal(qi, revN) { qtOpenWorkspace('proposal', qi, revN); }

  let qtRevisionActionMenu = null;
  let qtDeleteRevisionTarget = null;
  function qtCloseRevisionMenu() {
    if (qtRevisionActionMenu) qtRevisionActionMenu.remove();
    qtRevisionActionMenu = null;
  }
  function qtToggleRevisionMenu(event, qi, revN) {
    event.preventDefault();
    event.stopPropagation();
    const trigger = event.currentTarget;
    const sameTarget = qtRevisionActionMenu && qtRevisionActionMenu.dataset.key === qi + ':' + revN;
    qtCloseRevisionMenu();
    if (sameTarget) return;
    const menu = document.createElement('div');
    menu.className = 'qt-revision-action-menu';
    menu.dataset.key = qi + ':' + revN;
    menu.setAttribute('role', 'menu');
    menu.innerHTML =
      '<button type="button" role="menuitem"><i class="fai">&#xf304;</i><span>Edit</span></button>' +
      '<button type="button" role="menuitem"><i class="fai">&#xf06e;</i><span>View proposal</span></button>' +
      '<button type="button" role="menuitem" class="danger"><i class="fai">&#xf2ed;</i><span>Delete</span></button>';
    const buttons = menu.querySelectorAll('button');
    buttons[0].onclick = () => { qtCloseRevisionMenu(); openQuoteEditorNewTab(qi, revN); };
    buttons[1].onclick = () => { qtCloseRevisionMenu(); qtViewProposal(qi, revN); };
    buttons[2].onclick = () => { qtCloseRevisionMenu(); qtRequestDeleteRevision(qi, revN); };
    document.body.appendChild(menu);
    const rect = trigger.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(window.innerWidth - menu.offsetWidth - 8, rect.right - menu.offsetWidth)) + 'px';
    menu.style.top = Math.min(window.innerHeight - menu.offsetHeight - 8, rect.bottom + 5) + 'px';
    qtRevisionActionMenu = menu;
    requestAnimationFrame(() => buttons[0].focus());
  }

  function qtRequestDeleteRevision(qi, revN) {
    const target = qtResolveRevision(qi, revN);
    if (!target) return;
    qtDeleteRevisionTarget = { qi: target.quoteIndex, revN: target.revision.n };
    const deletingQuote = target.quote.revisions.length === 1;
    document.getElementById('deleteRevisionTitle').textContent = deletingQuote ? 'Delete Quote #' + target.quote.no + '?' : 'Delete Revision ' + target.revision.n + '?';
    document.getElementById('deleteRevisionCopy').textContent = deletingQuote
      ? 'This is the only revision, so the whole Quote will be permanently removed from the Deal.'
      : 'This revision will be permanently removed from Quote #' + target.quote.no + '.';
    document.getElementById('deleteRevisionOverlay').classList.add('open');
  }
  function qtCloseDeleteRevision() {
    document.getElementById('deleteRevisionOverlay').classList.remove('open');
    qtDeleteRevisionTarget = null;
  }
  function qtConfirmDeleteRevision() {
    if (!qtDeleteRevisionTarget || !ddDeal) return;
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const q = quotes[qtDeleteRevisionTarget.qi];
    const rev = q && q.revisions.find(item => Number(item.n) === Number(qtDeleteRevisionTarget.revN));
    if (!q || !rev) { qtCloseDeleteRevision(); return; }
    const beforeRange = dealValueRange(quotes);
    const beforeSigned = dealContractValue(quotes);
    const deletingQuote = q.revisions.length === 1;
    if (deletingQuote) quotes.splice(qtDeleteRevisionTarget.qi, 1);
    else {
      q.revisions = q.revisions.filter(item => item !== rev);
      q.status = qCurrentRev(q).status === 'live' ? 'draft' : qCurrentRev(q).status;
      if (q.acceptedRev === rev.n) q.acceptedRev = null;
    }
    qtSyncEditedQuoteMargins(quotes, beforeRange.high, beforeSigned);
    ddDeal.v = dealValueRange(quotes).high;
    ddDeal.margin = (DEAL_MARGINS[ddDeal.t]?.dealProduct || 0) + (DEAL_MARGINS[ddDeal.t]?.dealLabour || 0);
    saveActivePipelineState();
    qtCloseDeleteRevision();
    ddRenderQuotes();
    renderQuoteListOverlay();
    refreshPipelineDealCard(ddDeal);
    recalcPipeline();
    qtShowSnackbar(deletingQuote ? 'Quote deleted.' : 'Revision deleted.', 'success');
  }

  document.addEventListener('click', event => {
    if (qtRevisionActionMenu && !event.target.closest('.qt-revision-action-menu')) qtCloseRevisionMenu();
  });
  document.getElementById('quoteCreatedOverlay').addEventListener('click', e => {
    if (e.target.id === 'quoteCreatedOverlay') closeQuoteCreatedModal();
  });
  document.getElementById('quoteListOverlay').addEventListener('click', e => {
    if (e.target.id === 'quoteListOverlay') closeQuoteListOverlay();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (document.getElementById('quoteCreatedOverlay').classList.contains('open')) { closeQuoteCreatedModal(); return; }
    if (document.getElementById('quoteListOverlay').classList.contains('open')) closeQuoteListOverlay();
  });

  function toggleDdKebab(event) {
    event.stopPropagation();
    const menu = document.getElementById('ddDealMenu');
    const button = document.getElementById('ddKebab');
    const willOpen = !menu.classList.contains('open');
    closeDealContextMenu();
    if (willOpen) menu.innerHTML = dealActionMenuMarkup(ddDeal, 'ddKebabAction');
    menu.classList.toggle('open', willOpen);
    button.setAttribute('aria-expanded', String(willOpen));
  }

  function closeDdKebab() {
    const menu = document.getElementById('ddDealMenu');
    const button = document.getElementById('ddKebab');
    if (menu) menu.classList.remove('open');
    if (button) button.setAttribute('aria-expanded', 'false');
  }

  function ddKebabAction(action) {
    closeDdKebab();
    if (!ddDeal) return;
    runDealAction(action, ddCard, ddDeal);
  }

  function dealContextAction(action) {
    const card = dealContextCard;
    const deal = card && card._deal;
    closeDealContextMenu();
    if (!card || !deal) return;
    runDealAction(action, card, deal);
  }

  function closeDealAfterRemoval(deal) {
    if (ddDeal !== deal) return;
    ddDeal = null;
    ddCard = null;
    showView('crm');
  }

  function runDealAction(action, card, deal) {
    if (!deal) return;

    if (action === 'revise-expired') {
      openDealPage(deal, card);
      qtShowSnackbar('Create a new Quote revision, set its expiry date, then resend it.');
      return;
    }

    if (action === 'won') {
      if (!card) return;
      requestWonMove(card);
      return;
    }

    if (action === 'lost') {
      const lostIndex = stageIndexByOutcome('lost');
      if (deal.s === lostIndex) {
        qtShowSnackbar('This Deal is already marked as Lost.');
        return;
      }
      if (card && commitDealMove(card, lostIndex)) {
        if (ddDeal === deal) openDealPage(deal, ddCard);
        qtShowSnackbar('Deal marked as Lost.', 'success');
      }
      return;
    }

    if (action === 'reopen') {
      const target = Number.isInteger(deal.previousOpenStage) &&
        CRM_STAGE_DEFS[deal.previousOpenStage] && !CRM_STAGE_DEFS[deal.previousOpenStage].outcome
        ? deal.previousOpenStage : 0;
      if (card && commitDealMove(card, target)) {
        delete deal.wonAt;
        if (ddDeal === deal) openDealPage(deal, ddCard);
        qtShowSnackbar('Deal reopened in ' + CRM_STAGE_DEFS[target].name + '.', 'success');
      }
      return;
    }

    if (action === 'archive') {
      if (!confirm('Archive "' + deal.t + '"? You can restore it from Archive.')) return;
      deal.archivedFromStageIndex = deal.s;
      deal.archivedFromStage = CRM_STAGE_DEFS[deal.s] ? CRM_STAGE_DEFS[deal.s].name : '';
      deal.archivedOutcome = (CRM_STAGE_DEFS[deal.s] && CRM_STAGE_DEFS[deal.s].outcome) || 'open';
      deal.archivedAt = new Date().toISOString();
      deal.archivedBy = 'Lee (You)';
      deal.archived = true;
      if (card && card.isConnected) card.remove();
      recalcPipeline();
      saveActivePipelineState();
      renderArchiveView();
      closeDealAfterRemoval(deal);
      qtShowSnackbar('Deal archived. It can be restored from Archive.', 'success');
      return;
    }

    if (action === 'restore') {
      deal.archived = false;
      delete deal.archiveCause;
      const target = Number.isInteger(deal.archivedFromStageIndex) && CRM_STAGE_DEFS[deal.archivedFromStageIndex]
        ? deal.archivedFromStageIndex : 0;
      deal.s = target;
      const fresh = makeDealCard(deal);
      const targetBody = pipelineEl.querySelectorAll('.stage-body')[target];
      if (targetBody) targetBody.appendChild(fresh);
      if (ddDeal === deal) ddCard = fresh;
      recalcPipeline();
      saveActivePipelineState();
      renderArchiveView();
      qtShowSnackbar('Deal restored to ' + CRM_STAGE_DEFS[target].name + '.', 'success');
      return;
    }

    if (action === 'delete') {
      if (!confirm('Delete "' + deal.t + '"? This action cannot be undone.')) return;
      const dealIndex = CRM_DEALS.indexOf(deal);
      if (dealIndex >= 0) CRM_DEALS.splice(dealIndex, 1);
      if (card && card.isConnected) card.remove();
      delete DEAL_QUOTES[deal.t];
      recalcPipeline();
      saveActivePipelineState();
      renderArchiveView();
      closeDealAfterRemoval(deal);
      qtShowSnackbar('Deal deleted.', 'success');
    }
  }

  document.addEventListener('click', event => {
    if (!event.target.closest('#ddKebabWrap')) closeDdKebab();
    if (!event.target.closest('#dealContextMenu')) closeDealContextMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      closeDdKebab();
      closeDealContextMenu();
    }
  });

  function ddMarkWon() {
    if (!ddDeal || (CRM_STAGE_DEFS[ddDeal.s] && CRM_STAGE_DEFS[ddDeal.s].outcome)) return;
    const wonIndex = stageIndexByOutcome('won');
    if (wonIndex < 0) return;

    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    if (!quotes.length) {
      qtShowSnackbar('This Deal has no linked Quotes. Create or link a Quote before marking it Won.');
      return;
    }

    if (dealHasAcceptedQuote(ddDeal)) {
      ddDeal.wonAt = ddWonTimestamp();
      ddDeal.s = wonIndex;
      ddMoveCard(wonIndex);
      openDealPage(ddDeal, ddCard);
      qtShowSnackbar('Deal moved to Won.', 'success');
      return;
    }

    openWonQuotePicker(ddCard, ddDeal, quotes);
  }

  function ddMeetingWhen(meeting) {
    const date = new Date(meeting.date + 'T12:00:00');
    const dateLabel = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return dateLabel + ' at ' + meeting.time + ' · ' + meeting.duration + ' min';
  }

  function ddHistoryTimestamp(value) {
    return new Date(value).toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', '');
  }

  function ddMeetingById(id) {
    return ((ddDeal && ddDeal.meetings) || []).find(meeting => meeting.id === Number(id));
  }

  function copyDealMeetingLink(id) {
    const meeting = ddMeetingById(id);
    if (!meeting) return;
    if (!meeting.link) {
      qtShowSnackbar('This is an in-person meeting and has no video link.');
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(meeting.link).catch(() => {});
    }
    qtShowSnackbar(meeting.providerLabel + ' link copied.', 'success');
  }

  function openMeetingSummary(id) {
    if (!ddMeetingById(id)) return;
    ddMeetingSummaryEditingId = Number(id);
    ddRenderHistory();
    requestAnimationFrame(() => {
      const editor = document.getElementById('ddMeetingSummary-' + id);
      if (editor) editor.focus();
    });
  }

  function cancelMeetingSummary() {
    ddMeetingSummaryEditingId = null;
    ddRenderHistory();
  }

  function meetingSummaryMentionsFromText(text) {
    return ddNotePeople().filter(name => (text || '').includes('@' + name));
  }

  function meetingSummaryMentionChipsHtml(text) {
    const mentions = meetingSummaryMentionsFromText(text);
    return mentions.map(name => '<span class="dd-meeting-mention-chip">@' + archiveEscape(name) + '</span>').join('');
  }

  function renderMeetingSummaryMentionMenu(id, query) {
    const menu = document.getElementById('ddMeetingSummaryMentionMenu-' + id);
    if (!menu) return;
    const normalized = (query || '').trim().toLowerCase();
    const people = ddNotePeople().filter(name => name.toLowerCase().includes(normalized)).slice(0, 7);
    menu.innerHTML = people.map(name =>
      '<button type="button" onmousedown="event.preventDefault()" onclick="insertMeetingSummaryMention(' + id + ',\'' + archiveEscape(name) + '\')">' +
        '<span class="dd-note-person-avatar">' + archiveEscape(name.split(/\s+/).map(part => part[0]).join('').slice(0, 2)) + '</span>' +
        '<span><strong>' + archiveEscape(name) + '</strong><small>Notify and add to Focus</small></span></button>'
    ).join('');
    menu.hidden = !people.length;
  }

  function toggleMeetingSummaryMentionMenu(id, event) {
    if (event) event.stopPropagation();
    const input = document.getElementById('ddMeetingSummary-' + id);
    const menu = document.getElementById('ddMeetingSummaryMentionMenu-' + id);
    if (!input || !menu) return;
    const willOpen = menu.hidden;
    menu.hidden = !willOpen;
    if (willOpen) renderMeetingSummaryMentionMenu(id, '');
    input.focus();
  }

  function handleMeetingSummaryInput(id) {
    const input = document.getElementById('ddMeetingSummary-' + id);
    const chips = document.getElementById('ddMeetingSummaryMentions-' + id);
    const menu = document.getElementById('ddMeetingSummaryMentionMenu-' + id);
    if (!input || !menu) return;
    if (chips) {
      chips.innerHTML = meetingSummaryMentionChipsHtml(input.value);
      chips.hidden = !chips.innerHTML;
    }
    const beforeCaret = input.value.slice(0, input.selectionStart);
    const match = beforeCaret.match(/(?:^|\s)@([^@\n]{0,30})$/);
    if (match) renderMeetingSummaryMentionMenu(id, match[1]);
    else menu.hidden = true;
  }

  function handleMeetingSummaryKeydown(id, event) {
    const menu = document.getElementById('ddMeetingSummaryMentionMenu-' + id);
    if (!menu || menu.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      menu.hidden = true;
    } else if (event.key === 'Enter') {
      const first = menu.querySelector('button');
      if (first) {
        event.preventDefault();
        first.click();
      }
    }
  }

  function insertMeetingSummaryMention(id, name) {
    const input = document.getElementById('ddMeetingSummary-' + id);
    const menu = document.getElementById('ddMeetingSummaryMentionMenu-' + id);
    if (!input) return;
    const caret = input.selectionStart;
    const beforeCaret = input.value.slice(0, caret);
    const activeMention = beforeCaret.match(/(?:^|\s)@([^@\n]{0,30})$/);
    let replaceStart = activeMention ? caret - activeMention[1].length - 1 : caret;
    const needsSpace = replaceStart > 0 && !/\s/.test(input.value.charAt(replaceStart - 1));
    const insertText = (needsSpace ? ' ' : '') + '@' + name + ' ';
    input.value = input.value.slice(0, replaceStart) + insertText + input.value.slice(input.selectionEnd);
    const nextCaret = replaceStart + insertText.length;
    input.setSelectionRange(nextCaret, nextCaret);
    if (menu) menu.hidden = true;
    handleMeetingSummaryInput(id);
    input.focus();
  }

  function meetingSummaryTextHtml(text, mentions) {
    let html = archiveEscape(text || '');
    (mentions || []).slice().sort((a, b) => b.length - a.length).forEach(name => {
      html = html.split('@' + archiveEscape(name)).join('<span class="dd-meeting-mention-chip">@' + archiveEscape(name) + '</span>');
    });
    return html.replace(/\n/g, '<br>');
  }

  function saveMeetingSummary(id) {
    const meeting = ddMeetingById(id);
    const input = document.getElementById('ddMeetingSummary-' + id);
    if (!meeting || !input) return;
    const summary = input.value.trim();
    if (!summary) {
      input.focus();
      return;
    }
    meeting.summary = summary;
    meeting.summaryMentions = meetingSummaryMentionsFromText(summary);
    meeting.summaryUpdatedAt = new Date().toISOString();
    ddMeetingSummaryEditingId = null;
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    qtShowSnackbar(
      meeting.summaryMentions.length
        ? 'Meeting summary saved and ' + meeting.summaryMentions.length + ' ' + (meeting.summaryMentions.length === 1 ? 'person was' : 'people were') + ' added to Focus.'
        : 'Meeting summary saved.',
      'success'
    );
  }

  function completeDealMeeting(id) {
    const meeting = ddMeetingById(id);
    if (!meeting || meeting.status === 'completed') return;
    meeting.status = 'completed';
    meeting.completedAt = new Date().toISOString();
    if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.resolveRequiredActivity === 'function') {
      window.WeQuoteAutomation.resolveRequiredActivity('meeting', meeting.id, ddDeal);
    }
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.meeting.changed', {
      deal: ddDeal, meeting, change: 'completed', field: 'meeting'
    });
    qtShowSnackbar(meeting.title + ' marked complete.', 'success');
  }

  function reopenDealMeeting(id) {
    const meeting = ddMeetingById(id);
    if (!meeting || meeting.status !== 'completed') return;
    meeting.status = 'scheduled';
    delete meeting.completedAt;
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar(meeting.title + ' reopened.', 'success');
  }

  function viewMeetingHistory(id) {
    if (!ddMeetingById(id)) return;
    setDealHistoryFilter('all');
    requestAnimationFrame(() => {
      const target = document.querySelector('[data-meeting-history="' + id + '"]');
      if (!target) return;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.focus({ preventScroll: true });
    });
  }

  function requestMeetingRemoval(id) {
    const meeting = ddMeetingById(id);
    if (!meeting) return;
    ddMeetingActionMenuId = null;
    ddMeetingPendingRemoveId = meeting.id;
    document.getElementById('meetingRemoveTitle').textContent = 'Remove ' + meeting.title + '?';
    document.getElementById('meetingRemoveCopy').textContent =
      'This will remove the meeting from this Deal, Focus and History.';
    document.querySelector('#meetingRemoveOverlay .meeting-remove-impact span').textContent =
      meeting.provider === 'in-person'
        ? 'The meeting will be removed from WeQuote. No external calendar event will be cancelled in this prototype.'
        : meeting.provider === 'manual'
        ? 'The pasted meeting link will be removed from WeQuote. The external meeting itself will not be cancelled.'
        : meeting.providerLabel + ' and the calendar invitation will also be cancelled for ' +
          (meeting.attendees || []).length + ' attendee' + ((meeting.attendees || []).length === 1 ? '.' : 's.');
    document.getElementById('meetingRemoveOverlay').classList.add('open');
  }

  function toggleMeetingActionMenu(id, event) {
    if (event) event.stopPropagation();
    if (!ddMeetingById(id)) return;
    ddMeetingActionMenuId = ddMeetingActionMenuId === Number(id) ? null : Number(id);
    ddRenderHistory();
  }

  function editMeetingFromActionMenu(id, event) {
    if (event) event.stopPropagation();
    ddMeetingActionMenuId = null;
    editDealMeeting(id);
  }

  function removeMeetingFromActionMenu(id, event) {
    if (event) event.stopPropagation();
    ddMeetingActionMenuId = null;
    requestMeetingRemoval(id);
  }

  function closeMeetingRemoveDialog() {
    document.getElementById('meetingRemoveOverlay').classList.remove('open');
    ddMeetingPendingRemoveId = null;
  }

  function confirmMeetingRemoval() {
    if (!ddDeal || ddMeetingPendingRemoveId == null) return;
    const meetings = ddDeal.meetings || [];
    const index = meetings.findIndex(meeting => meeting.id === ddMeetingPendingRemoveId);
    if (index < 0) return;
    const [removed] = meetings.splice(index, 1);
    saveActivePipelineState();
    closeMeetingRemoveDialog();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar(removed.title + ' removed.', 'success');
  }

  // Focus can surface both the next meeting and people mentioned for follow-up in Notes.
  function ddRenderFocus() {
    const d = ddDeal, el = document.getElementById('dd-focus');
    const nowKey = ddTodayIso() + 'T' + new Date().toTimeString().slice(0, 5);
    const activeMeetings = (d.meetings || [])
      .filter(meeting => meeting.status !== 'completed' && meeting.status !== 'cancelled')
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    const overdueMeeting = activeMeetings.filter(meeting => meeting.date + 'T' + meeting.time < nowKey).pop();
    const upcomingMeetings = activeMeetings.filter(meeting => meeting.date + 'T' + meeting.time >= nowKey).slice(0, 2);
    const focusMeetings = [overdueMeeting, ...upcomingMeetings].filter((meeting, index, list) =>
      meeting && list.findIndex(item => item && item.id === meeting.id) === index
    );
    const activeNoteFollowUps = (d.notes || []).filter(note =>
      note && !note.deletedAt && note.followUpAt && note.followUpStatus !== 'completed'
    ).map(note => ({ note, due: new Date(note.followUpAt) }))
      .filter(item => !Number.isNaN(item.due.getTime()))
      .sort((a, b) => a.due - b.due);
    const mentionedNote = (d.notes || []).slice().reverse().find(note =>
      !note.deletedAt && note.mentions && note.mentions.length && !note.followUpAt
    );
    const followUpMeeting = (d.meetings || []).slice().reverse().find(meeting => meeting.summaryMentions && meeting.summaryMentions.length);
    const focusItems = [];
    if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.renderDealFocus === 'function') {
      const automationFocus = window.WeQuoteAutomation.renderDealFocus(d);
      if (automationFocus) focusItems.push(automationFocus);
    }
    const nextAction = d.nextAction && d.nextAction.status !== 'completed' ? d.nextAction : null;
    if (nextAction && nextAction.dueAt) {
      const due = new Date(nextAction.dueAt);
      const overdue = !Number.isNaN(due.getTime()) && due < new Date();
      const dueLabel = Number.isNaN(due.getTime()) ? '' : due.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const assignedTo = nextAction.assignedTo || crmTableOwnerName(d);
      const actionLabel = {
        proposal: 'Proposal', meeting: 'Meeting', 'site-visit': 'Site visit',
        'customer-followup': 'Customer follow-up'
      }[nextAction.type] || 'Next step';
      const icon = {
        proposal: '&#xf571;', meeting: '&#xf073;', 'site-visit': '&#xf3c5;',
        'customer-followup': '&#xf095;'
      }[nextAction.type] || '&#xf017;';
      const draftProposal = nextAction.type === 'proposal'
        ? (DEAL_QUOTES[d.t] || []).slice().reverse().find(quote => quote.status === 'draft')
        : null;
      let primaryAction;
      if (nextAction.type === 'proposal') {
        primaryAction = draftProposal
          ? '<button type="button" class="wq-btn wq-btn-primary" onclick="sendDealProposalFromNextStep(event)"><i class="fai">&#xf1d8;</i> Send proposal</button>'
          : '<button type="button" class="wq-btn wq-btn-primary" onclick="createDealProposalFromNextStep(event)"><i class="fai">&#x2b;</i> Create proposal</button>';
      } else {
        primaryAction = '<button type="button" class="wq-btn wq-btn-neutral" onclick="completeDealNextAction(event)"><i class="fai">&#xf00c;</i> Mark complete</button>';
      }
      focusItems.push('<div class="dd-focus-item deal-next-action' + (overdue ? ' overdue' : '') + '" data-next-action-focus="true"' +
        (overdue ? ' data-overdue-focus="true"' : '') + ' tabindex="-1"><i class="fai">' + icon + '</i>' +
        '<div><b>' + actionLabel + (overdue ? ' overdue' : ' due') + '</b> &mdash; ' + archiveEscape(nextAction.title || actionLabel) +
        '<div class="dd-focus-meeting-meta">Due ' + archiveEscape(dueLabel) + ' · @' + archiveEscape(assignedTo) + '</div>' +
        (nextAction.context ? '<div class="dd-focus-meeting-meta">' + archiveEscape(nextAction.context) + '</div>' : '') + '</div>' +
        '<div class="dd-next-action-buttons">' + primaryAction +
        '<button type="button" class="wq-btn wq-btn-tertiary dd-next-reschedule" onclick="rescheduleDealNextAction(event)"><i class="fai">&#xf073;</i> Reschedule</button></div></div>');
    }
    const qualifiedContact = d.qualifiedContact && d.qualifiedContact.status !== 'completed'
      ? d.qualifiedContact
      : null;
    if (qualifiedContact && qualifiedContact.dueAt) {
      const due = new Date(qualifiedContact.dueAt);
      const overdue = !Number.isNaN(due.getTime()) && due < new Date();
      const dueLabel = Number.isNaN(due.getTime()) ? '' : due.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const assignedTo = crmTableOwnerName(d);
      focusItems.push('<div class="dd-focus-item qualified-contact' + (overdue ? ' overdue' : '') + '"' +
        (overdue ? ' data-overdue-focus="true"' : '') + ' tabindex="-1"><i class="fai">&#xf095;</i>' +
        '<div><b>' + (overdue ? 'Contact overdue' : 'Contact due') + '</b> &mdash; ' +
        archiveEscape(qualifiedContact.title || 'Contact customer') +
        '<div class="dd-focus-meeting-meta">Due ' + archiveEscape(dueLabel) + ' · @' + archiveEscape(assignedTo) + '</div></div>' +
        '<button type="button" class="wq-btn wq-btn-neutral dd-focus-complete" onclick="completeDealQualifiedContact(event)"><i class="fai">&#xf00c;</i> Mark complete</button></div>');
    }
    const focusExpiryQuote = dealLatestQuoteForExpiry(d);
    const focusExpiryAt = quoteExpiryTimestamp(focusExpiryQuote);
    const focusExpiryDays = focusExpiryAt ? (focusExpiryAt - Date.now()) / 86400000 : Infinity;
    if (focusExpiryQuote && (d.quoteExpired || (focusExpiryDays >= 0 && focusExpiryDays <= 14))) {
      const focusExpiryLabel = new Date(focusExpiryAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const focusExpiryKind = d.quoteExpired ? 'quote-overdue' : 'quote-expiring';
      focusItems.push('<button type="button" class="dd-focus-item ' + focusExpiryKind + '"' + (d.quoteExpired ? ' data-overdue-focus="true"' : '') + ' onclick="openQuoteFromHistory(\'' + archiveEscape(focusExpiryQuote.no) + '\')"><i class="fai">&#xf017;</i>' +
        '<div><b>' + (d.quoteExpired ? 'Quote overdue' : 'Quote expires soon') + '</b> &mdash; Quote #' + archiveEscape(focusExpiryQuote.no) +
        '<div class="dd-focus-meeting-meta">' + (d.quoteExpired ? 'Expired ' : 'Due ') + focusExpiryLabel + '</div></div>' +
        '<i class="fai dd-focus-open">&#xf061;</i></button>');
    }
    focusMeetings.forEach(meeting => {
      const isOverdue = meeting.date + 'T' + meeting.time < nowKey;
      focusItems.push('<div class="dd-focus-item meeting' + (isOverdue ? ' overdue' : '') + '"' + (isOverdue ? ' data-overdue-focus="true"' : '') + ' tabindex="-1">' +
        '<button type="button" class="dd-focus-item-main" data-focus-meeting="' + meeting.id + '" aria-label="View ' + archiveEscape(meeting.title) + ' in History" onclick="viewMeetingHistory(' + meeting.id + ')"><i class="fai">&#xf073;</i> ' +
          '<span><b>' + (isOverdue ? 'Meeting overdue' : 'Upcoming meeting') + '</b> &mdash; ' + archiveEscape(meeting.title) +
          '<span class="dd-focus-meeting-meta">' + archiveEscape(ddMeetingWhen(meeting)) + ' · ' + archiveEscape(meeting.providerLabel) +
          (meeting.provider === 'in-person' && meeting.address ? '<br><span class="dd-focus-meeting-address"><i class="fai">&#xf3c5;</i> ' + archiveEscape(meeting.address) + '</span>' : '') + '</span></span></button>' +
        (isOverdue
          ? '<button type="button" class="wq-btn wq-btn-neutral dd-focus-complete" onclick="completeDealMeeting(' + meeting.id + ')"><i class="fai">&#xf00c;</i> Mark complete</button>'
          : '<button type="button" class="dd-focus-open" aria-label="View ' + archiveEscape(meeting.title) + ' in History" onclick="viewMeetingHistory(' + meeting.id + ')"><i class="fai">&#xf061;</i></button>') +
        '</div>');
    });
    activeNoteFollowUps.forEach(item => {
      const overdue = item.due < new Date();
      const dueLabel = item.due.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const people = item.note.mentions && item.note.mentions.length
        ? ' · ' + item.note.mentions.map(name => '@' + archiveEscape(name)).join(' · ')
        : '';
      focusItems.push('<div class="dd-focus-item note-followup' + (overdue ? ' overdue' : '') + '" data-focus-note="' + item.note.id + '"' + (overdue ? ' data-overdue-focus="true"' : '') + ' tabindex="-1">' +
        '<button type="button" class="dd-focus-item-main" aria-label="View ' + archiveEscape(item.note.title || 'Note') + ' in History" onclick="viewNoteHistory(' + item.note.id + ')"><i class="fai">&#xf249;</i>' +
          '<span><b>' + (overdue ? 'Note overdue' : 'Note follow-up') + '</b> &mdash; ' + archiveEscape(item.note.title || 'Note') +
          '<span class="dd-focus-meeting-meta">Due ' + archiveEscape(dueLabel) + people + '</span></span></button>' +
        '<button type="button" class="wq-btn wq-btn-neutral dd-focus-complete" onclick="completeDealNoteFollowUp(' + item.note.id + ',event)"><i class="fai">&#xf00c;</i> Mark complete</button></div>');
    });
    if (mentionedNote) {
      focusItems.push('<button type="button" class="dd-focus-item mention" data-focus-note="' + mentionedNote.id + '" onclick="viewNoteHistory(' + mentionedNote.id + ')"><span class="dd-focus-mention-icon">@</span>' +
        '<div><b>Mentioned in Note</b> &mdash; ' + archiveEscape(mentionedNote.title || 'Note') +
        '<div class="dd-focus-meeting-meta">' + mentionedNote.mentions.map(name => '@' + archiveEscape(name)).join(' · ') + '</div></div>' +
        '<i class="fai dd-focus-open">&#xf061;</i></button>');
    }
    if (followUpMeeting) {
      focusItems.push('<div class="dd-focus-item mention"><span class="dd-focus-mention-icon">@</span>' +
        '<div><b>Meeting follow-up</b> &mdash; ' + archiveEscape(followUpMeeting.title || 'Meeting') +
        '<div class="dd-focus-meeting-meta">' + followUpMeeting.summaryMentions.map(name => '@' + archiveEscape(name)).join(' · ') + '</div></div></div>');
    }
    if (!focusItems.length && !d.qualifiedContact && d.d > STALE_DAYS) {
      focusItems.push('<div class="dd-focus-item overdue"><i class="fai">&#xf111;</i> ' +
        '<b>Overdue</b> &mdash; no activity logged for ' + d.d + ' days. Follow up with ' + archiveEscape(d.contact || ORG_CUSTOMERS[d.c] || d.c) + '.</div>');
    } else if (!d.qualifiedContact && d.d > FOLLOWUP_DAYS) {
      if (!focusItems.length) focusItems.push('<div class="dd-focus-item followup"><i class="fai">&#xf111;</i> ' +
        '<b>Follow-up needed</b> &mdash; last activity ' + d.d + ' days ago.</div>');
    }
    el.innerHTML = focusItems.length ? focusItems.join('') : '<div class="dd-focus-empty">No focus items yet</div>';
  }

  function completeDealQualifiedContact(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.qualifiedContact || ddDeal.qualifiedContact.status === 'completed') return;
    ddDeal.qualifiedContact.status = 'completed';
    ddDeal.qualifiedContact.completedAt = new Date().toISOString();
    saveActivePipelineState();
    ddRenderFocus();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar('Customer contact marked complete.', 'success');
  }

  function recordDealActionEvent(deal, event) {
    deal.actionHistory = Array.isArray(deal.actionHistory) ? deal.actionHistory : [];
    deal.actionHistory.push({
      id: 'deal-action-event-' + Date.now() + '-' + deal.actionHistory.length,
      createdAt: new Date().toISOString(), author: CRM_CURRENT_USER, ...event
    });
  }

  function createDealProposalFromNextStep(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.nextAction || ddDeal.nextAction.type !== 'proposal') return;
    const existingDraft = (DEAL_QUOTES[ddDeal.t] || []).find(quote => quote.status === 'draft');
    if (existingDraft) {
      openQuoteFromHistory(existingDraft.no);
      return;
    }
    ddCreateQuote();
    ddDeal.nextAction.draftCreatedAt = new Date().toISOString();
    recordDealActionEvent(ddDeal, {
      kind: 'draft-created', actionType: 'proposal', title: 'Proposal draft created'
    });
    saveActivePipelineState();
    ddRenderFocus();
  }

  function sendDealProposalFromNextStep(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.nextAction || ddDeal.nextAction.type !== 'proposal') return;
    const quotes = DEAL_QUOTES[ddDeal.t] || [];
    const draft = quotes.slice().reverse().find(quote => quote.status === 'draft');
    if (!draft) {
      createDealProposalFromNextStep(event);
      return;
    }
    if (qtAutomationEventBlocked(ddDeal, 'quote-sent', {
      actionLabel: 'Send Quote',
      onContinue: function () { sendDealProposalFromNextStep(null); }
    })) return;
    const sentAt = new Date();
    const expiresAt = new Date(sentAt.getFullYear(), sentAt.getMonth(), sentAt.getDate() + 14);
    draft.status = 'sent';
    draft.sentAt = sentAt.toISOString();
    draft.expiresAt = localIsoDate(expiresAt);
    if (!draft.desc || draft.desc === 'Untitled') draft.desc = 'Customer proposal';

    const completedAction = { ...ddDeal.nextAction, status: 'completed', completedAt: sentAt.toISOString() };
    recordDealActionEvent(ddDeal, {
      kind: 'completed', actionType: 'proposal', title: 'Proposal sent', quoteNo: draft.no,
      dueAt: completedAction.dueAt
    });
    const automationResult = window.WeQuoteAutomation
      ? window.WeQuoteAutomation.emit('quote.sent', { deal: ddDeal, quote: draft })
      : null;
    let followUpDue;
    if (automationResult && automationResult.handled) {
      const automatedDueAt = automationResult.actions[0]?.dueAt || ddDeal.nextAction?.dueAt;
      followUpDue = automatedDueAt ? new Date(automatedDueAt) : new Date(sentAt.getFullYear(), sentAt.getMonth(), sentAt.getDate() + 3, 10, 0, 0);
    } else {
      followUpDue = new Date(sentAt.getFullYear(), sentAt.getMonth(), sentAt.getDate() + 3, 10, 0, 0);
      ddDeal.nextAction = {
        id: 'deal-next-' + Date.now(), type: 'customer-followup', title: 'Check proposal feedback',
        dueAt: followUpDue.toISOString(), context: 'Proposal #' + draft.no + ' sent to customer',
        assignedTo: crmTableOwnerName(ddDeal), status: 'open', createdAt: sentAt.toISOString(), source: 'proposal-sent'
      };
      recordDealActionEvent(ddDeal, {
        kind: 'created', actionType: 'customer-followup', title: 'Customer follow-up created',
        dueAt: ddDeal.nextAction.dueAt
      });
    }
    ddEnsureQuoteActivity(ddDeal, quotes);

    const sentStage = CRM_STAGE_DEFS.findIndex(stage => stage.name.toLowerCase() === 'sent');
    if (sentStage >= 0 && ddDeal.s !== sentStage) {
      if (ddCard) commitDealMove(ddCard, sentStage);
      else {
        ddDeal.s = sentStage;
        rebuildPipelineColumns();
      }
    }
    saveActivePipelineState();
    openDealPage(ddDeal, ddCard);
    qtShowSnackbar('Proposal sent. Customer follow-up scheduled for ' +
      followUpDue.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + '.', 'success');
  }

  function completeDealNextAction(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.nextAction || ddDeal.nextAction.status === 'completed') return;
    const action = ddDeal.nextAction;
    action.status = 'completed';
    action.completedAt = new Date().toISOString();
    recordDealActionEvent(ddDeal, {
      kind: 'completed', actionType: action.type, title: action.title + ' completed', dueAt: action.dueAt
    });
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.next-action.changed', {
      deal: ddDeal, nextAction: action, change: 'completed', field: 'next-action'
    });
    qtShowSnackbar(action.title + ' marked complete.', 'success');
  }

  function rescheduleDealNextAction(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.nextAction) return;
    const buttons = event && event.currentTarget && event.currentTarget.closest('.dd-next-action-buttons');
    if (!buttons) return;
    const current = new Date(ddDeal.nextAction.dueAt);
    const date = Number.isNaN(current.getTime()) ? ddTodayIso() : localIsoDate(current);
    const time = Number.isNaN(current.getTime()) ? '17:00' : current.toTimeString().slice(0, 5);
    buttons.classList.add('editing');
    buttons.innerHTML = '<label class="dd-next-reschedule-field"><span>Date</span><input id="ddNextActionDate" type="date" value="' + date + '"></label>' +
      '<label class="dd-next-reschedule-field"><span>Time</span><input id="ddNextActionTime" type="time" value="' + time + '"></label>' +
      '<button type="button" class="wq-btn wq-btn-tertiary" onclick="cancelDealNextActionReschedule(event)">Cancel</button>' +
      '<button type="button" class="wq-btn wq-btn-primary" onclick="saveDealNextActionReschedule(event)">Save</button>';
    document.getElementById('ddNextActionDate').focus();
  }

  function cancelDealNextActionReschedule(event) {
    if (event) event.stopPropagation();
    ddRenderFocus();
  }

  function saveDealNextActionReschedule(event) {
    if (event) event.stopPropagation();
    if (!ddDeal || !ddDeal.nextAction) return;
    const date = document.getElementById('ddNextActionDate').value;
    const time = document.getElementById('ddNextActionTime').value;
    if (!date || !time) {
      qtShowSnackbar('Choose a date and time.', 'blocked');
      return;
    }
    const previousDueAt = ddDeal.nextAction.dueAt;
    ddDeal.nextAction.dueAt = date + 'T' + time + ':00';
    recordDealActionEvent(ddDeal, {
      kind: 'rescheduled', actionType: ddDeal.nextAction.type,
      title: ddDeal.nextAction.title + ' rescheduled', dueAt: ddDeal.nextAction.dueAt, previousDueAt
    });
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.next-action.changed', {
      deal: ddDeal, nextAction: ddDeal.nextAction, change: 'rescheduled', field: 'next-action'
    });
    qtShowSnackbar('Next step rescheduled.', 'success');
  }

  function focusDealOverdueItems() {
    const focus = document.getElementById('dd-focus');
    if (!focus) return;
    const items = Array.from(focus.querySelectorAll('[data-overdue-focus="true"]'));
    focus.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (!items.length) return;
    items.forEach(item => item.classList.add('is-targeted'));
    items[0].focus({ preventScroll: true });
    window.setTimeout(() => items.forEach(item => item.classList.remove('is-targeted')), 2200);
  }

  function completeDealNoteFollowUp(id, event) {
    if (event) event.stopPropagation();
    const note = ((ddDeal && ddDeal.notes) || []).find(item => String(item.id) === String(id));
    if (!note || note.followUpStatus === 'completed') return;
    note.followUpStatus = 'completed';
    note.followUpCompletedAt = new Date().toISOString();
    delete note.followUpReopenedAt;
    if (window.WeQuoteAutomation && typeof window.WeQuoteAutomation.resolveRequiredActivity === 'function') {
      window.WeQuoteAutomation.resolveRequiredActivity('note', note.id, ddDeal);
    }
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.note-follow-up.due', {
      deal: ddDeal, note, change: 'completed', field: 'note-follow-up'
    });
    qtShowSnackbar((note.title || 'Note') + ' follow-up marked complete.', 'success');
  }

  function reopenDealNoteFollowUp(id, event) {
    if (event) event.stopPropagation();
    const note = ((ddDeal && ddDeal.notes) || []).find(item => String(item.id) === String(id));
    if (!note || note.followUpStatus !== 'completed') return;
    note.followUpStatus = 'open';
    delete note.followUpCompletedAt;
    note.followUpReopenedAt = new Date().toISOString();
    saveActivePipelineState();
    ddRenderFocus();
    ddRenderHistory();
    refreshPipelineDealCard(ddDeal);
    qtShowSnackbar((note.title || 'Note') + ' follow-up reopened.', 'success');
  }

  function viewNoteHistory(id) {
    setDealHistoryFilter('all');
    requestAnimationFrame(() => {
      const target = document.querySelector('[data-note-history="' + id + '"]');
      if (!target) return;
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      target.classList.add('is-targeted');
      target.focus({ preventScroll: true });
      window.setTimeout(() => target.classList.remove('is-targeted'), 2200);
    });
  }

  function ddRenderHistory() {
    const d = ddDeal, quotes = DEAL_QUOTES[d.t];
    const items = [];
    (d.meetings || []).slice().reverse().forEach(meeting => items.push({
      type: 'meeting', meeting,
      sortAt: Date.parse(meeting.createdAt || meeting.updatedAt || (meeting.date + 'T' + (meeting.time || '00:00'))) || 0
    }));
    (d.notes || []).slice().reverse().forEach(note => items.push({
      type: 'note', note, title: note.title, body: note.body, bodyHtml: note.bodyHtml, mentions: note.mentions || [],
      ts: ddHistoryTimestamp(note.createdAt), author: note.author || CURRENT_USER,
      sortAt: Date.parse(note.createdAt) || 0
    }));
    (d.files || []).slice().reverse().forEach(file => items.push({
      type: 'file', title: file.name,
      ts: ddHistoryTimestamp(file.uploadedAt) + ' · ' + (file.uploadedBy || CURRENT_USER) + ' · ' + formatDealFileSize(file.size),
      sortAt: Date.parse(file.uploadedAt) || 0
    }));
    (d.emails || []).slice().reverse().forEach(email => items.push({
      type: 'email', email,
      sortAt: Date.parse(email.createdAt) || 0
    }));
    (d.actionHistory || []).slice().reverse().forEach(action => items.push({
      type: 'action', action,
      sortAt: Date.parse(action.createdAt) || 0
    }));
    // Quote reminders are derived from the same Quote expiry data as the Pipeline alert.
    // Entering the 14-day window creates an "Expires soon" activity; after the due date the
    // same Quote becomes Overdue. The Pipeline status links directly to this activity.
    const trackedExpiryQuote = dealLatestQuoteForExpiry(d);
    const trackedExpiryAt = quoteExpiryTimestamp(trackedExpiryQuote);
    const daysUntilTrackedExpiry = trackedExpiryAt ? (trackedExpiryAt - Date.now()) / 86400000 : Infinity;
    const expiryKind = d.quoteExpired ? 'overdue'
      : daysUntilTrackedExpiry >= 0 && daysUntilTrackedExpiry <= 14 ? 'expiring' : '';
    if (trackedExpiryQuote && trackedExpiryAt && expiryKind) {
      const expiryLabel = new Date(trackedExpiryAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const activityAt = expiryKind === 'overdue' ? trackedExpiryAt : trackedExpiryAt - (14 * 86400000);
      items.push({
        type: 'quote', kind: expiryKind, quoteNo: trackedExpiryQuote.no,
        revision: qCurrentRev(trackedExpiryQuote).n,
        title: expiryKind === 'overdue'
          ? 'Overdue · Expired ' + expiryLabel
          : 'Expires soon · Due ' + expiryLabel,
        author: '', ts: ddHistoryTimestamp(new Date(activityAt).toISOString()), sortAt: activityAt
      });
    }
    // Quote links and comments are copied into Deal-owned audit events, so they remain here
    // even when the Quote is later unlinked.
    (d.quoteActivity || []).forEach(activity => items.push({
      type: 'quote', kind: activity.kind, quoteNo: activity.quoteNo, revision: activity.revision,
      title: activity.title, body: activity.body, author: activity.author,
      ts: ddHistoryTimestamp(activity.createdAt), sortAt: Date.parse(activity.createdAt) || 0
    }));
    items.push({ type: 'file', title: '3d-master-plan-rendering.pdf', ts: '21 Jan 2024, 10:41', sortAt: Date.parse('2024-01-21T10:41:00') });
    items.push({
      type: 'note', title: 'Demo Notes for Sales Team Follow-Up',
      body: 'Client wants to review the layout with their architect before signing off. Confirm speaker positions and the projector model on the revised drawing.',
      ts: '21 Jan 2024, 10:41', author: CURRENT_USER, sortAt: Date.parse('2024-01-21T10:41:00')
    });
    items.push({
      type: 'note', title: 'Site survey walkthrough',
      body: 'Walked the ground floor with ' + (d.contact || ORG_CUSTOMERS[d.c] || d.c) + '. Cable routes agreed; rack location moved to the plant room.',
      ts: '18 Jan 2024, 15:20', author: CURRENT_USER, sortAt: Date.parse('2024-01-18T15:20:00')
    });

    const ICONS = { quote: '&#xf571;', file: '&#xf0c5;', note: '&#xf304;', meeting: '&#xf073;', email: '&#xf0e0;', action: '&#xf017;' };
    const visibleItems = items
      .filter(item => ddHistoryFilter === 'all' || item.type === ddHistoryFilter)
      .sort((a, b) => b.sortAt - a.sortAt);
    document.getElementById('dd-hist').innerHTML = visibleItems.length ? visibleItems.map(it =>
      '<div class="dd-hist-item">' +
        '<div class="dd-hist-rail"><span class="dd-hist-ico fai">' + ICONS[it.type] + '</span></div>' +
        '<div class="dd-hist-body">' +
          (it.type === 'meeting'
            ? ddMeetingHistoryHtml(it.meeting)
            : it.type === 'note'
            ? ddNoteHistoryHtml(it)
            : it.type === 'quote'
            ? ddQuoteHistoryHtml(it)
            : it.type === 'email'
            ? ddEmailHistoryHtml(it.email)
            : it.type === 'action'
            ? ddActionHistoryHtml(it.action)
            : '<div class="dd-hist-file">' +
              '<div class="copy"><div class="nm">' + archiveEscape(it.title) + '</div><div class="ts">' + archiveEscape(it.ts) + '</div></div>' +
              (it.type === 'file'
                ? '<div class="acts"><button class="dd-hist-iconbtn fai">&#xf019;</button>' +
                  '<button class="dd-hist-iconbtn fai">&#xf141;</button></div>'
                : '') +
              '</div>') +
        '</div>' +
      '</div>'
    ).join('') : '<div class="dd-hist-empty">No matching history activity</div>';
  }

  function setDealHistoryFilter(value) {
    ddHistoryFilter = ['all', 'note', 'meeting', 'file', 'quote', 'email'].includes(value) ? value : 'all';
    ddRenderHistory();
  }

  function ddActionHistoryHtml(action) {
    const labels = {
      created: 'Next step created', 'draft-created': 'Proposal draft created',
      completed: 'Completed', rescheduled: 'Rescheduled',
      'expected-close': 'Deal field updated',
      'file-request-created': 'Required file requested',
      'file-request-reminder': 'File reminder sent',
      'file-request-received': 'Required file received',
      'file-added': 'File added by Automation',
      'deal-data': 'Deal data updated',
      'quote-data': 'Quote data updated',
      'owner-changed': 'Deal Owner updated',
      notification: 'Internal notification',
      'automation-wait': 'Automation waiting'
    };
    const due = action.dueAt ? new Date(action.dueAt) : null;
    const dueLabel = due && !Number.isNaN(due.getTime())
      ? due.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '';
    const actionAuthor = action.source === 'automation' || /by Automation/i.test(String(action.title || ''))
      ? 'Automation'
      : (action.author || CRM_CURRENT_USER);
    return '<div class="dd-hist-action ' + archiveEscape(action.kind || 'created') + '">' +
      '<div class="dd-hist-action-head"><span>' + archiveEscape(labels[action.kind] || 'Deal action') + '</span>' +
      (action.quoteNo ? '<b>Quote #' + archiveEscape(action.quoteNo) + '</b>' : '') + '</div>' +
      '<div class="nm">' + archiveEscape(action.title || 'Next step updated') + '</div>' +
      (dueLabel ? '<div class="bd">Due ' + archiveEscape(dueLabel) + '</div>' : '') +
      '<div class="dd-hist-action-foot"><span class="ts">' + archiveEscape(ddHistoryTimestamp(action.createdAt)) + '</span>' +
      ddHistoryAuthorIdentity(actionAuthor) + '</div></div>';
  }

  function ddEmailHistoryHtml(email) {
    const sent = email.status === 'sent';
    return '<div class="dd-hist-email ' + email.status + '">' +
      '<div class="dd-hist-email-head"><div><span class="dd-email-status ' + email.status + '">' +
        (sent ? '<i class="fai">&#xf1d8;</i> Sent' : '<i class="fai">&#xf0c7;</i> Draft') +
        '</span><strong>' + archiveEscape(email.subject) + '</strong></div>' +
        '<span class="dd-email-provider-badge">' + archiveEscape(email.providerLabel) + '</span></div>' +
      '<div class="dd-hist-email-address"><span>From: ' + archiveEscape(email.from) + '</span><span>To: ' +
        archiveEscape(email.to || 'Recipient not added') + '</span></div>' +
      (email.body ? '<div class="dd-hist-email-preview">' + archiveEscape(email.body).replace(/\n+/g, ' ') + '</div>' : '') +
      '<div class="dd-hist-email-meta">' + archiveEscape(ddHistoryTimestamp(email.createdAt)) + ' · ' +
        archiveEscape(email.author || CURRENT_USER) + '</div></div>';
  }

  function ddHistoryAuthorIdentity(author) {
    author = author && author !== 'System' ? author : '';
    if (!author) return '';
    if (author === 'Automation') {
      return '<span class="dd-hist-author automation"><span class="dd-hist-author-avatar automation" role="img" aria-label="Automation"><i class="fai">&#xf0e7;</i></span>' +
        '<span class="dd-hist-author-name">Automation</span></span>';
    }
    const authorInitials = author ? author.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() : '';
    return '<span class="dd-hist-author"><span class="dd-hist-author-avatar" role="img" aria-label="' + archiveEscape(author) + '">' + archiveEscape(authorInitials) + '</span>' +
      '<span class="dd-hist-author-name">' + archiveEscape(author) + '</span></span>';
  }

  function ddQuoteHistoryHtml(item) {
    const isComment = item.kind === 'comment';
    const isOverdue = item.kind === 'overdue';
    const isExpiring = item.kind === 'expiring';
    const activityKind = isOverdue ? 'overdue' : isExpiring ? 'expiring' : '';
    const authorIdentity = ddHistoryAuthorIdentity(item.author);
    return '<div class="dd-hist-quote ' + (activityKind || (isComment ? 'comment' : 'linked')) + '"' +
      (activityKind ? ' data-quote-activity="' + activityKind + '-' + archiveEscape(item.quoteNo) + '" tabindex="-1"' : '') + '>' +
      '<div class="dd-hist-quote-head"><span class="dd-hist-quote-ref">Quote #' + archiveEscape(item.quoteNo) +
      (item.revision ? ' · R' + archiveEscape(item.revision) : '') + '</span>' +
      '<button type="button" class="wq-btn wq-btn-tertiary dd-hist-quote-action" onclick="openQuoteFromHistory(\'' + archiveEscape(item.quoteNo) + '\')"><i class="fai">&#xf06e;</i><span>View Quote</span></button></div>' +
      '<div class="nm">' + (activityKind ? '<i class="fai dd-hist-quote-status-icon" aria-hidden="true">&#xf017;</i>' : '') + archiveEscape(item.title) + '</div>' +
      (item.body ? '<div class="bd">' + archiveEscape(item.body) + '</div>' : '') +
      '<div class="dd-hist-quote-foot"><div class="ts">' + archiveEscape(item.ts) + '</div>' + authorIdentity + '</div></div>';
  }

  function ddEnsureQuoteActivity(deal, quotes) {
    if (!deal) return;
    deal.quoteActivity = deal.quoteActivity || [];
    quotes.forEach(q => {
      const revision = qCurrentRev(q).n;
      const linkedId = 'quote-linked-' + q.no;
      if (!deal.quoteActivity.some(activity => activity.id === linkedId)) {
        deal.quoteActivity.push({
          id: linkedId, kind: 'linked', quoteNo: q.no, revision,
          title: (q.desc || 'Untitled') + ' added to this Deal',
          createdAt: q.linkedAt || '2024-01-23T09:12:00', author: q.linkedBy || CURRENT_USER
        });
      }
      (q.comments || []).forEach((comment, index) => {
        const commentId = 'quote-comment-' + q.no + '-' + (comment.id || index);
        if (deal.quoteActivity.some(activity => activity.id === commentId)) return;
        deal.quoteActivity.push({
          id: commentId, kind: 'comment', quoteNo: q.no,
          revision: comment.revision || revision, title: 'New comment on Quote #' + q.no,
          body: comment.body, createdAt: comment.createdAt || new Date().toISOString(),
          author: comment.author || 'Customer'
        });
      });
    });
  }

  function ddNoteHistoryHtml(item) {
    const note = item.note;
    const isFileRequestNote = !!(note && note.activityType === 'file-request');
    if (note && note.deletedAt) {
      return '<div class="dd-hist-note deleted"><div class="dd-note-deleted-icon"><i class="fai">&#xf1f8;</i></div>' +
        '<div class="dd-note-deleted-copy"><div class="nm">Note deleted</div>' +
        '<div class="bd">Deleted by <strong>' + archiveEscape(note.deletedBy || CURRENT_USER) + '</strong></div>' +
        '<div class="ts">' + archiveEscape(ddHistoryTimestamp(note.deletedAt)) + '</div></div></div>';
    }
    if (note && !isFileRequestNote && ddNoteEditingId === note.id) {
      const editBodyHtml = note.bodyHtml ? sanitizeDealNoteHtml(note.bodyHtml) : archiveEscape(note.body).replace(/\n/g, '<br>');
      return '<div class="dd-hist-note editing"><div class="dd-note-edit-label">EDIT NOTE</div>' +
        '<input class="dd-note-edit-title" id="ddNoteEditTitle-' + note.id + '" maxlength="120" value="' + archiveEscape(note.title || 'Note') + '" aria-label="Note title">' +
        '<div class="dd-note-edit-body" id="ddNoteEditBody-' + note.id + '" contenteditable="true" role="textbox" aria-multiline="true">' + editBodyHtml + '</div>' +
        '<div class="dd-note-edit-actions"><span id="ddNoteEditValidation-' + note.id + '" role="alert"></span>' +
        '<button type="button" onclick="cancelDealNoteEdit()">Cancel</button>' +
        '<button type="button" class="primary" onclick="saveDealNoteEdit(' + note.id + ')">Save changes</button></div></div>';
    }
    const replies = note ? (note.replies || []) : [];
    const reactionEntries = note ? Object.entries(note.reactions || {}).filter(([, people]) => Array.isArray(people) && people.length) : [];
    const reactionsHtml = reactionEntries.length
      ? '<div class="dd-note-reactions">' + reactionEntries.map(([emoji, people]) =>
          '<button type="button" class="dd-note-reaction-chip' + (people.includes(CURRENT_USER) ? ' mine' : '') + '" ' +
            'title="' + archiveEscape(people.join(', ')) + '" onclick="toggleDealNoteReaction(' + note.id + ',\'' + emoji + '\',event)">' +
            '<span>' + emoji + '</span><b>' + people.length + '</b></button>'
        ).join('') + '</div>'
      : '';
    const repliesHtml = replies.length
      ? '<div class="dd-note-thread">' + replies.map(reply => {
          const author = reply.author || CURRENT_USER;
          const initials = author.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
          return '<div class="dd-note-reply"><span class="dd-note-reply-avatar">' + archiveEscape(initials) + '</span>' +
            '<div class="dd-note-reply-copy"><div class="dd-note-reply-head"><strong>' + archiveEscape(author) + '</strong>' +
            '<span>' + archiveEscape(ddHistoryTimestamp(reply.createdAt)) + '</span></div>' +
            '<div class="dd-note-reply-body">' + archiveEscape(reply.body).replace(/\n/g, '<br>') + '</div></div></div>';
        }).join('') + '</div>'
      : '';
    const replying = note && ddNoteReplyingId === note.id;
    const replyComposer = replying
      ? '<div class="dd-note-reply-composer"><textarea id="ddNoteReply-' + note.id + '" maxlength="800" placeholder="Write a reply…"></textarea>' +
        '<div class="dd-note-reply-actions"><span id="ddNoteReplyValidation-' + note.id + '" role="alert"></span>' +
        '<button type="button" onclick="closeDealNoteReply()">Cancel</button>' +
        '<button type="button" class="primary" onclick="saveDealNoteReply(' + note.id + ')">Reply</button></div></div>'
      : '';
    const reactionPicker = note && ddNoteReactionPickerId === note.id
      ? '<div class="dd-note-reaction-picker" role="menu" aria-label="Choose a reaction">' + DD_NOTE_REACTIONS.map(emoji =>
          '<button type="button" role="menuitem" aria-label="React with ' + emoji + '" onclick="toggleDealNoteReaction(' + note.id + ',\'' + emoji + '\',event)">' + emoji + '</button>'
        ).join('') + '</div>'
      : '';
    const noteActionMenu = note && !isFileRequestNote && ddNoteActionMenuId === note.id
      ? '<div class="dd-note-action-menu"><button type="button" onclick="openDealNoteEdit(' + note.id + ',event)"><i class="fai">&#xf304;</i> Edit note</button>' +
        '<button type="button" class="danger" onclick="deleteDealNote(' + note.id + ',event)"><i class="fai">&#xf1f8;</i> Delete note</button></div>'
      : '';
    const editedMeta = note && note.editedAt
      ? '<div class="dd-note-edited-meta">Edited ' + archiveEscape(ddHistoryTimestamp(note.editedAt)) + ' by ' + archiveEscape(note.editedBy || CURRENT_USER) + '</div>'
      : '';
    const noteBodyHtml = item.bodyHtml ? sanitizeDealNoteHtml(item.bodyHtml) : archiveEscape(item.body).replace(/\n/g, '<br>');
    const attachmentsHtml = note && Array.isArray(note.attachments) && note.attachments.length
      ? '<div class="dd-note-attachments">' + note.attachments.map(attachment =>
          '<div class="dd-note-attachment"><i class="fai">&#xf15b;</i><span><b>' + archiveEscape(attachment.name || 'Attached file') +
          '</b><small>' + formatDealFileSize(Number(attachment.size) || 0) + '</small></span></div>'
        ).join('') + '</div>'
      : '';
    const fileRequestMeta = isFileRequestNote && window.WeQuoteAutomation && typeof window.WeQuoteAutomation.fileRequestHistoryMarkup === 'function'
      ? window.WeQuoteAutomation.fileRequestHistoryMarkup(note.fileRequestId)
      : '';
    const hasInlineMentions = Boolean(item.bodyHtml && /class=["'][^"']*dd-note-mention/.test(item.bodyHtml));
    const followUpMeta = note && note.followUpAt
      ? (note.followUpStatus === 'completed'
        ? '<div class="dd-hist-note-followup-row"><span class="dd-hist-note-followup completed"><i class="fai">&#xf058;</i> Follow-up completed</span>' +
          '<button type="button" class="dd-hist-note-followup-action" onclick="reopenDealNoteFollowUp(' + note.id + ',event)"><i class="fai">&#xf2ea;</i> Reopen follow-up</button></div>'
        : '<div class="dd-hist-note-followup-row"><span class="dd-hist-note-followup"><i class="fai">&#xf017;</i> Follow up ' +
          archiveEscape(new Date(note.followUpAt).toLocaleString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          })) + '</span><button type="button" class="wq-btn wq-btn-primary" onclick="completeDealNoteFollowUp(' + note.id + ',event)"><i class="fai">&#xf058;</i> Mark complete</button></div>')
      : '';
    const noteAuthorIdentity = ddHistoryAuthorIdentity(item.author);
    return '<div class="dd-hist-note"' + (note ? ' data-note-history="' + note.id + '" tabindex="-1"' : '') + '><div class="dd-note-head-row"><div class="nm">' + archiveEscape(item.title) + '</div>' +
      (note && !isFileRequestNote ? '<div class="dd-note-action-wrap"><button type="button" class="dd-note-action-trigger fai" aria-label="Note actions" aria-expanded="' + (ddNoteActionMenuId === note.id) + '" onclick="toggleDealNoteActionMenu(' + note.id + ',event)">&#xf141;</button>' + noteActionMenu + '</div>' : '') + '</div>' +
      '<div class="bd">' + noteBodyHtml + '</div>' +
      fileRequestMeta + attachmentsHtml +
      (!hasInlineMentions && (item.mentions || []).length ? '<div class="dd-hist-note-mentions">' + [...new Set(item.mentions)].map(name =>
        '<span class="dd-note-mention">@' + archiveEscape(name) + '</span>').join('') + '</div>' : '') +
      followUpMeta +
      '<div class="dd-note-meta-row"><div class="ts">' + archiveEscape(item.ts) + '</div><div class="dd-note-meta-right">' +
      (note ? '<div class="dd-note-meta-actions"><div class="dd-note-reaction-wrap">' +
        '<button type="button" class="dd-note-reaction-trigger" aria-label="Add emoji reaction" aria-expanded="' + (ddNoteReactionPickerId === note.id) + '" onclick="toggleDealNoteReactionPicker(' + note.id + ',event)"><span>☺</span> React</button>' + reactionPicker + '</div>' +
        '<button type="button" class="dd-note-reply-trigger" onclick="openDealNoteReply(' + note.id + ')"><i class="fai">&#xf3e5;</i> Reply' +
        (replies.length ? ' · ' + replies.length : '') + '</button></div>' : '') + noteAuthorIdentity + '</div></div>' + editedMeta + reactionsHtml + repliesHtml + replyComposer + '</div>';
  }

  function ddMeetingHistoryHtml(meeting) {
    const provider = meeting.provider === 'in-person'
      ? { label: 'In person', short: '<i class="fai">&#xf3c5;</i>', className: 'in-person' }
      : meeting.provider === 'manual'
        ? { label: meeting.providerLabel || 'Meeting link', short: '\u2197', className: 'manual' }
        : DD_MEETING_PROVIDERS[meeting.provider] || DD_MEETING_PROVIDERS.google;
    const editing = ddMeetingSummaryEditingId === meeting.id;
    const isCompleted = meeting.status === 'completed';
    const createdByIdentity = ddHistoryAuthorIdentity(meeting.createdBy || CURRENT_USER);
    const meetingActionMenu = ddMeetingActionMenuId === meeting.id
      ? '<div class="dd-note-action-menu"><button type="button" onclick="editMeetingFromActionMenu(' + meeting.id + ',event)"><i class="fai">&#xf304;</i> Edit meeting</button>' +
        '<button type="button" class="danger" onclick="removeMeetingFromActionMenu(' + meeting.id + ',event)"><i class="fai">&#xf2ed;</i> Remove</button></div>'
      : '';
    const summaryHtml = editing
      ? '<div class="dd-meeting-summary-editor"><div class="dd-meeting-summary-shell">' +
          '<div class="dd-meeting-summary-toolbar"><span>Meeting summary</span><button type="button" onclick="toggleMeetingSummaryMentionMenu(' + meeting.id + ',event)"><b>@</b> Mention</button></div>' +
          '<textarea id="ddMeetingSummary-' + meeting.id + '" maxlength="1200" placeholder="Capture decisions, outcome and next steps. Use @ to tag a team member." oninput="handleMeetingSummaryInput(' + meeting.id + ')" onkeydown="handleMeetingSummaryKeydown(' + meeting.id + ',event)">' + archiveEscape(meeting.summary || '') + '</textarea>' +
          '<div class="dd-meeting-summary-mentions" id="ddMeetingSummaryMentions-' + meeting.id + '"' + (meetingSummaryMentionChipsHtml(meeting.summary || '') ? '' : ' hidden') + '>' + meetingSummaryMentionChipsHtml(meeting.summary || '') + '</div>' +
          '<div class="dd-note-mentions dd-meeting-summary-mention-menu" id="ddMeetingSummaryMentionMenu-' + meeting.id + '" hidden></div></div>' +
          '<div class="actions"><button type="button" class="wq-btn wq-btn-tertiary" onclick="cancelMeetingSummary()">Cancel</button>' +
          '<button type="button" class="wq-btn wq-btn-primary" onclick="saveMeetingSummary(' + meeting.id + ')">Save summary</button></div></div>'
      : meeting.summary
        ? '<div class="dd-meeting-summary"><strong>Meeting summary</strong>' + meetingSummaryTextHtml(meeting.summary, meeting.summaryMentions || []) + '</div>'
        : '';
    const providerBadge = '<span class="dd-meeting-provider-badge"><span class="provider-logo ' + provider.className + '">' + provider.short + '</span>' + archiveEscape(provider.label) + '</span>';
    const methodHtml = meeting.provider === 'in-person'
      ? '<div class="dd-hist-meeting-location"><span class="dd-hist-meeting-location-icon"><i class="fai">&#xf3c5;</i></span>' +
        '<span class="dd-hist-meeting-location-copy"><strong>In person</strong><small>' + archiveEscape(meeting.address || 'Address not added') + '</small></span></div>'
      : '<div class="dd-meeting-title-method">' + providerBadge + '</div>';
    const meetingActionsHtml = !editing ? '<div class="dd-hist-meeting-actions">' +
      (!isCompleted ? '<button type="button" class="wq-btn wq-btn-primary" onclick="completeDealMeeting(' + meeting.id + ')"><i class="fai">&#xf058;</i><span>Mark complete</span></button>' :
      '<button type="button" class="wq-btn wq-btn-primary" onclick="reopenDealMeeting(' + meeting.id + ')"><i class="fai">&#xf2ea;</i><span>Reopen meeting</span></button>') +
      (meeting.link ? '<button type="button" class="wq-btn wq-btn-secondary" onclick="copyDealMeetingLink(' + meeting.id + ')"><i class="fai">&#xf0c1;</i><span>Copy meeting link</span></button>' : '') +
      '<button type="button" class="wq-btn wq-btn-tertiary" onclick="openMeetingSummary(' + meeting.id + ')">' + (meeting.summary ? 'Edit summary' : 'Add summary') + '</button></div>' : '';
    return '<div class="dd-hist-meeting" data-meeting-history="' + meeting.id + '" tabindex="-1">' +
      '<div class="dd-hist-meeting-head"><div><div class="nm">' + archiveEscape(meeting.title) + '</div>' +
        methodHtml +
        '<div class="dd-hist-meeting-meta">' + archiveEscape(ddMeetingWhen(meeting)) +
        ((meeting.attendees || []).length ? '<br>' + archiveEscape(meeting.attendees.join(', ')) : '') + '</div>' +
        '</div>' +
        '<div class="dd-meeting-head-right"><div class="dd-meeting-badge-stack">' + (isCompleted ? '<span class="dd-meeting-complete-badge"><i class="fai">&#xf058;</i> Completed</span>' : '') +
        '</div>' +
        '<div class="dd-note-action-wrap dd-meeting-action-wrap"><button type="button" class="dd-note-action-trigger fai" aria-label="Meeting actions" aria-expanded="' + (ddMeetingActionMenuId === meeting.id) + '" onclick="toggleMeetingActionMenu(' + meeting.id + ',event)">&#xf141;</button>' + meetingActionMenu + '</div></div></div>' +
      (meeting.agenda ? '<div class="dd-hist-meeting-agenda"><b>Agenda:</b> ' + archiveEscape(meeting.agenda) + '</div>' : '') +
      summaryHtml +
      '<div class="dd-meeting-footer">' + meetingActionsHtml + '<div class="dd-meeting-creator-footer">' + createdByIdentity + '</div></div>' +
      '</div>';
  }

  function setDealTab(tabName, el) {
    const tab = el || document.querySelector('.dd-tab[data-deal-tab="' + tabName + '"]');
    if (!tab) return;
    tab.parentNode.querySelectorAll('.dd-tab').forEach(item => {
      const active = item === tab;
      item.classList.toggle('active', active);
      item.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.dd-composer-panel').forEach(panel => {
      panel.classList.toggle('active', panel.dataset.dealPanel === tabName);
    });
  }

  // ---------- Deal record modal (PRD §4.3 simplified) + A2/A3/A4 automation demo ----------
  // Quotes per deal, keyed by deal name. One Quote stands alone; adding a second Quote automatically
  // turns every top-level Quote on the Deal into one alternatives group (OR).
  // Deals not listed here have no quotes yet → value comes from the manual estimate (§2.5.1).
  // Won Deals are seeded with an Accepted/Complete Quote so the protected Deal outcome and the
  // underlying Quote lifecycle never disagree. Open Deals cover every status used by the board.
  DEAL_QUOTES = {
    'Theater Upgrades': [
      { no: '24589', status: 'draft', desc: 'Original proposal', alternativeGroupId: null,
        revisions: [{ n: 1, value: 0, status: 'live' }], acceptedRev: null, variations: [], cos: [],
        linkedAt: '2026-08-07T13:35:00Z', linkedBy: 'Lee Roche',
        comments: [{ id: 'customer-1', revision: 1, author: 'Les Landau',
          body: 'Please confirm the projector model and revised drawing before sending.', createdAt: '2026-08-07T13:54:00Z' }] },
      { no: '24590', status: 'draft', desc: 'Lighting option', alternativeGroupId: null,
        revisions: [{ n: 1, value: 0, status: 'live' }], acceptedRev: null, variations: [], cos: [],
        linkedAt: '2026-08-07T13:42:00Z', linkedBy: 'Lee Roche', comments: [] }
    ],
    '2231 Quail Bluff Ct': [
      { no: '11990', status: 'review', desc: 'Main AV scope', alternativeGroupId: null,
        revisions: [{ n: 1, value: 35162, status: 'live' }], acceptedRev: null, variations: [], cos: [], expiresAt: '' }
    ],
    'Window Treatments': [
      { no: '11992', status: 'reviewed', desc: 'Motorised blind package', alternativeGroupId: null,
        revisions: [{ n: 1, value: 52630, status: 'live' }], acceptedRev: null, variations: [], cos: [], expiresAt: '' }
    ],
    // Both keep their original Draft lifecycle status. Automatic grouping changes only their
    // commercial relationship and never the underlying Quote or Revision status.
    'Garden Light/Tree Mount': [
      { no: '24587', status: 'draft', desc: 'Untitled', alternativeGroupId: null,
        revisions: [{ n: 1, value: 926, status: 'live' }], acceptedRev: null, variations: [], cos: [] },
      { no: '24588', status: 'draft', desc: 'Untitled', alternativeGroupId: null,
        revisions: [{ n: 1, value: 875, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    '1 Burning Tree Lutron Sunnata': [
      { no: '11884', status: 'sent', expiresAt: '2026-09-15', viewedAt: '2026-08-23T09:15:00Z', desc: 'Lighting and control package', revisions: [{ n: 1, value: 62307, status: 'live' }], acceptedRev: null, variations: [], cos: [] },
      { no: '11885', status: 'sent', expiresAt: '2026-09-20', desc: 'Alternative package', revisions: [{ n: 1, value: 59800, status: 'live' }], acceptedRev: null, variations: [], cos: [] },
      { no: '11886', status: 'sent', expiresAt: '2026-10-01', viewedAt: '2026-08-22T16:40:00Z', desc: 'Premium control option', revisions: [{ n: 1, value: 68100, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    'IP Camera Upgrades': [
      { no: '11016', status: 'sent', expiresAt: '2026-09-18', desc: 'Camera and recording upgrade',
        revisions: [{ n: 1, value: 28656, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    'New Pool TV': [
      { no: '11997', status: 'draft', desc: 'Outdoor display proposal',
        revisions: [{ n: 1, value: 10555, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    '20436 Rocha Chica Drive v2': [
      { no: '11996', status: 'sent', expiresAt: '2026-07-25', desc: '', revisions: [{ n: 1, value: 40383, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    'Harland WeHo Theater': [
      { no: '10987', status: 'accepted', expiresAt: '2026-07-25', desc: '', revisions: [{ n: 1, value: 50688, status: 'accepted', acceptSeq: 1 }], acceptedRev: 1, variations: [], cos: [] },
      { no: '10986', status: 'sent', expiresAt: '2026-08-25', desc: '', revisions: [{ n: 1, value: 48200, status: 'live' }], acceptedRev: null, variations: [], cos: [] }
    ],
    'New Motorized Drapery Track': [
      { no: '11994', status: 'accepted', expiresAt: '2026-07-25', desc: '', revisions: [{ n: 1, value: 6326, status: 'accepted', acceptSeq: 2 }], acceptedRev: 1, variations: [], cos: [] }
    ],
    'Meeting Room AV Fit-out': [
      { no: '12001', status: 'accepted', expiresAt: '2026-08-30', desc: '', revisions: [{ n: 1, value: 18987, status: 'accepted', acceptSeq: 3 }], acceptedRev: 1, variations: [], cos: [] }
    ],
    'Private Cinema Room': [
      { no: '12002', status: 'accepted', desc: '', revisions: [{ n: 1, value: 206925, status: 'accepted' }], acceptedRev: 1,
        variations: [
          { name: 'Additional patio speaker zone', value: 4200, status: 'sent' },
          { name: 'Home cinema acoustic panels', value: 3100, status: 'accepted' },
          { name: 'Extra keypad in games room', value: 850, status: 'rejected' },
          { name: 'Upgraded amplifier spec', value: 2600, status: 'accepted' },
          { name: '', value: 0, status: 'draft' }
        ],
        cos: [
          { name: 'CO 1.1', status: 'accepted', varIds: [3], adjustments: [{ name: 'Omit spare HDMI run to garden office', value: -1200 }] },
          { name: 'CO 1.2', status: 'sent', varIds: [], adjustments: [{ name: 'Additional cable containment', value: 640 }] }
        ] }
    ],
    'Office AV Refresh': [
      { no: '12003', status: 'accepted', desc: '', revisions: [{ n: 1, value: 12400, status: 'accepted' }], acceptedRev: 1, variations: [], cos: [] }
    ],
    'Backyard Cinema Deck': [
      { no: '12004', status: 'rejected', desc: 'Cinema deck proposal',
        revisions: [{ n: 1, value: 15800, status: 'rejected' }], acceptedRev: null, variations: [], cos: [] }
    ],
    'Orchard House Lighting Options': [
      { no: '2401', status: 'cancelled', desc: 'Lighting Option A', revisions: [{ n: 1, value: 12400, status: 'cancelled' }], acceptedRev: null, variations: [], cos: [] },
      { no: '2400', status: 'cancelled', desc: 'Lighting Option B', revisions: [{ n: 1, value: 15850, status: 'cancelled' }], acceptedRev: null, variations: [], cos: [] },
      { no: '2399', status: 'cancelled', desc: 'Lighting Option C', revisions: [{ n: 1, value: 18200, status: 'cancelled' }], acceptedRev: null, variations: [], cos: [] }
    ]
  };

  // Normalise seeded prototype data through the same rule used when users create or unlink Quotes.
  Object.entries(DEAL_QUOTES).forEach(([dealName, quotes]) => {
    const deal = CRM_DEALS.find(item => item.t === dealName);
    (quotes || []).forEach(quote => { quote.owningCompanyId = quote.owningCompanyId || (deal && deal.owningCompanyId) || defaultOwningCompanyId(); });
    qtEnsureAutomaticQuoteAlternatives(quotes);
  });
  dealQuoteLifecycleReady = true;
  window.WeQuoteCRMQuoteLifecycle = {
    syncQuoteRows(rows) {
      if (!Array.isArray(rows)) return;
      const statusMap = {
        'In Progress': 'draft',
        'In Review': 'review',
        'Passed Review': 'reviewed',
        Sent: 'sent',
        Accepted: 'accepted',
        Complete: 'complete',
        Cancelled: 'cancelled',
        Expired: 'sent'
      };

      rows.forEach(row => {
        const dealName = row.dealTitle || row.crmDeal;
        const deal = CRM_DEALS.find(item => item.t === dealName);
        const status = statusMap[row.status];
        if (!deal || !status) return;
        row.owningCompanyId = deal.owningCompanyId || row.owningCompanyId || defaultOwningCompanyId();
        const quoteNo = String(row.id || '').replace(/^Q-/i, '');
        const quotes = DEAL_QUOTES[deal.t] || (DEAL_QUOTES[deal.t] = []);
        let quote = quotes.find(item => String(item.no) === quoteNo);
        if (!quote) {
          quote = {
            no: quoteNo,
            status,
            desc: row.proposal || row.project || 'Linked Quote',
            revisions: [{ n: 1, value: Number(String(row.total || '').replace(/[^0-9.-]/g, '')) || 0, status: 'live' }],
            acceptedRev: null,
            variations: [],
            cos: []
          };
          quotes.push(quote);
        }

        quote.status = status;
        quote.expiresAt = row.status === 'Expired' ? (row.expiresAt || '2026-08-20') : (row.expiresAt || '');
        const currentRevision = qCurrentRev(quote);
        if (currentRevision) {
          currentRevision.status = row.status === 'Accepted' ? 'accepted' : (row.status === 'Cancelled' ? 'cancelled' : row.status === 'Complete' ? 'accepted' : row.status === 'Expired' ? 'live' : 'live');
          if (row.status === 'Accepted' || row.status === 'Complete') {
            currentRevision.acceptSeq = currentRevision.acceptSeq || ++qtAcceptSeq;
            quote.acceptedRev = currentRevision.n;
          } else {
            delete currentRevision.acceptSeq;
            quote.acceptedRev = null;
          }
        }
      });

      Object.values(DEAL_QUOTES).forEach(qtEnsureAutomaticQuoteAlternatives);
      recalcPipeline();
      saveActivePipelineState();
      if (ddDeal) {
        ddCard = findPipelineCardForDeal(ddDeal);
        ddRenderStagebar(ddDeal);
        ddRenderQuotes();
      }
    },
    getDealStage(dealName) {
      const deal = CRM_DEALS.find(item => item.t === dealName);
      return deal ? ((CRM_STAGE_DEFS[deal.s] || {}).name || '') : '';
    }
  };
  // Rebuild after Quotes load so lifecycle moves and Quote-view engagement are both reflected on
  // every Deal card, even when a stored Deal was already sitting in the correct protected Stage.
  // A Deal expires only after the latest expiry date across its sent Quotes has passed; Draft
  // Quotes are ignored and any accepted Quote keeps the Deal Won.
  rebuildPipelineColumns();

  // Product/labour margin per deal (Figma DS – WeQuote Platform, node 2772-98263).
  // dealProduct/dealLabour are against the deal's pipeline range upper bound; signedProduct/signedLabour
  // are against the deal's current value, shown once the deal reaches Won. Totals and % are always
  // computed at render time in dealQuoteSummaryHtml() — never hardcoded — so they can't drift out of reconciliation.
  const DEAL_MARGINS = {
    '1 Burning Tree Lutron Sunnata': { dealProduct: 8100,  dealLabour: 4360,  signedProduct: 7290,  signedLabour: 3930 },
    '20436 Rocha Chica Drive v2':    { dealProduct: 5250,  dealLabour: 2830,  signedProduct: 4730,  signedLabour: 2540 },
    'Harland WeHo Theater':          { dealProduct: 6590,  dealLabour: 3550,  signedProduct: 5930,  signedLabour: 3190 },
    'New Motorized Drapery Track':   { dealProduct: 820,   dealLabour: 440,   signedProduct: 740,   signedLabour: 400  },
    'Meeting Room AV Fit-out':       { dealProduct: 2470,  dealLabour: 1330,  signedProduct: 2220,  signedLabour: 1200 },
    'Private Cinema Room':           { dealProduct: 26900, dealLabour: 14480, signedProduct: 24210, signedLabour: 13040 },
    'Office AV Refresh':             { dealProduct: 1610,  dealLabour: 870,   signedProduct: 1450,  signedLabour: 780  }
  };

  // ---------- Label definitions (shared: create-lead modal, leads table, drawer) ----------
  let LABEL_DEFS = [
    { name: 'Hot', bg: '#DF0000', fg: '#FFFFFF' },
    { name: 'Warm', bg: '#FFB638', fg: '#000000' },
    { name: 'Cold', bg: '#2450FF', fg: '#FFFFFF' },
    { name: 'VIP', bg: '#7C3AED', fg: '#FFFFFF' },
    { name: 'High value', bg: '#1E8539', fg: '#FFFFFF' },
    { name: 'Needs site visit', bg: '#F59E0B', fg: '#000000' },
    { name: 'Renewal', bg: '#06B6D4', fg: '#FFFFFF' }
  ];
  const CRM_FILE_TEMPLATES = [
    { id: 'site-survey-checklist', name: 'Site survey checklist.pdf', category: 'Site & discovery' },
    { id: 'risk-assessment', name: 'Risk assessment template.docx', category: 'Site & compliance' },
    { id: 'commercial-nda', name: 'Commercial NDA template.docx', category: 'Commercial' },
    { id: 'project-handover', name: 'Project handover checklist.pdf', category: 'Won & handover' }
  ];
  window.WeQuoteCRMMetadata = {
    getDealLabels: () => LABEL_DEFS.map(label => ({ ...label })),
    getFileTemplates: () => CRM_FILE_TEMPLATES.map(file => ({ ...file })),
    getDealInterests: () => INTEREST_DEFS.map(interest => ({ ...interest })),
    setDealExpectedCloseDate: (dealOrTitle, value, options) => {
      const deal = typeof dealOrTitle === 'string'
        ? CRM_DEALS.find(item => item.t === dealOrTitle)
        : dealOrTitle;
      return ddApplyExpectedCloseDate(deal, value, Object.assign({ source: 'automation' }, options || {}));
    }
  };
  function labelDef(name) {
    return LABEL_DEFS.find(d => d.name.toLowerCase() === String(name).toLowerCase()) || { name: name, bg: '#EFEFEF', fg: '#000000' };
  }
  function tableLabelChips(l) {
    if (!l.labels || !l.labels.length) return '<span class="l-dim">—</span>';
    return '<span style="display:inline-flex;gap:4px;flex-wrap:wrap;">' +
      l.labels.map(x => { const d = labelDef(x); return '<span class="lead-label-chip" style="background:' + d.bg + ';color:' + d.fg + ';">' + d.name + '</span>'; }).join('') +
      '</span>';
  }
  function readonlyLabelChips(labels) {
    if (!labels || !labels.length) return '<span class="l-dim" style="font-size:11px;">—</span>';
    return labels.map(x => { const d = labelDef(x); return '<span class="lead-label-chip" style="background:' + d.bg + ';color:' + d.fg + ';">' + d.name + '</span>'; }).join(' ');
  }

  // ---------- CRM Leads (inbox pattern; PRD §2.1 + design refs 4 Jul) ----------
  const CRM_LEADS = [
    { title: 'ABR Residential Lead', contact: 'Tony Baker', job: 'IT Manager', org: 'ABR Developments', site: 'abrdev.co.uk',
      labels: ['Hot', 'Warm'], interests: ['Television', 'CCTV', 'Lighting'],
      phone: '+44 (0)1234 567890', email: 'tony@abrdev.co.uk',
      next: { txt: 'Schedule a call to Chris – NLW', when: 'Today at 09:58', over: false },
      est: 20000, source: 'Referral', created: '21 Jun 2026, 10:21', owner: 'Jeff Mitchel', status: 'open' },
    { title: 'Wong Residence — Full Home AV', contact: 'Marcus Wong', org: 'Wong Residence', site: '',
      labels: ['Hot'], interests: ['Home Cinema', 'Lighting'],
      phone: '+44 7911 111222', email: 'marcus@wongresidence.hk',
      next: { txt: 'Call back re: budget', when: '2 Jul', over: true },
      est: 25000, source: 'Referral', created: '1 Jul 2026, 14:02', owner: 'Jeff Mitchel', status: 'open' },
    { title: 'Ellis Property — Show Flats', contact: 'Sandra Ellis', job: 'Development Director', org: 'Ellis Property Group', site: 'ellisproperty.co.uk',
      labels: ['Warm'], interests: ['Television', 'Networking'],
      phone: '+44 7700 900123', email: 'sandra@ellisproperty.co.uk',
      next: { txt: 'Send brochure', when: '8 Jul', over: false, future: true },
      est: 60000, source: 'Website', created: '30 Jun 2026, 09:15', owner: 'Dave Lombard', status: 'open' },
    { title: 'Marino Apartment CCTV', contact: 'Tony Marino', org: '', site: '',
      labels: ['Cold'], interests: ['CCTV'],
      phone: '+44 7700 900456', email: '',
      next: null,
      est: null, source: 'Phone-in', created: '28 Jun 2026, 16:40', owner: 'Sean Prater', status: 'open' },
    { title: 'Lau & Partners Boardroom', contact: 'Rebecca Lau', org: 'Lau & Partners', site: 'laupartners.hk',
      labels: ['Warm'], interests: ['Networking', 'Television'],
      phone: '+44 7700 900789', email: 'rebecca@laupartners.hk',
      next: { txt: 'Site visit', when: '30 Jun', over: true },
      est: 34000, source: 'Exhibition', created: '26 Jun 2026, 11:30', owner: 'Jeff Mitchel', status: 'open' },
    { title: 'Grand Hyatt F&B Screens', contact: 'Priya Nair', org: 'Grand Hyatt', site: 'hyatt.com',
      labels: ['Hot'], interests: ['Television', 'Lighting'],
      phone: '+44 20 7946 0000', email: 'priya.nair@hyatt.com',
      next: { txt: 'Proposal walkthrough', when: 'Today at 15:00', over: false },
      est: 120000, source: 'Referral', created: '20 Jun 2026, 13:05', owner: 'Gabriel Rivera', status: 'open' },
    { title: 'Osborne Loft Refit', contact: 'Kevin Osborne', org: '', site: '',
      labels: ['Warm'], interests: ['Home Cinema'],
      phone: '', email: 'kev.osborne@gmail.com',
      next: null,
      est: 18000, source: 'Website', created: '19 Jun 2026, 10:00', owner: 'Patrick Burke', status: 'converted' },
    { title: 'Sim Marine — Yacht AV', contact: 'Della Sim', org: 'Sim Marine', site: 'simmarine.com',
      labels: ['Cold'], interests: ['Television', 'Networking'],
      phone: '+44 7700 900321', email: 'della@simmarine.com',
      next: { txt: 'Qualify budget', when: '12 Jun', over: true },
      est: null, source: 'Exhibition', created: '12 Jun 2026, 15:45', owner: 'Dave Lombard', status: 'open' },
    { title: 'Trotter Garden Office', contact: 'Wayne Trotter', org: '', site: '',
      labels: [], interests: [],
      phone: '', email: 'wtrotter@outlook.com',
      next: null,
      est: null, source: 'Other', created: '5 Jun 2026, 09:20', owner: 'Sean Prater', status: 'discarded' },
  ];
  const LEAD_STATUS_LABEL = { open: 'Open', converted: 'Converted', discarded: 'Discarded', archived: 'Archived' };
  const CRM_LEADS_STORAGE_KEY = 'wequote-crm-leads-v2';
  const LEAD_ACTIVITY_SEEDS = {
    'ABR Residential Lead': { type: 'qualification', title: 'Qualification call', dueAt: '2026-08-13T14:30:00.000Z' },
    'Wong Residence — Full Home AV': { type: 'call', title: 'Call back re: budget', dueAt: '2026-08-12T10:00:00.000Z' },
    'Ellis Property — Show Flats': { type: 'other', title: 'Send brochure', dueAt: '2026-08-16T10:00:00.000Z' },
    'Lau & Partners Boardroom': { type: 'site-visit', title: 'Site visit', dueAt: '2026-08-11T11:00:00.000Z' },
    'Grand Hyatt F&B Screens': { type: 'qualification', title: 'Proposal walkthrough', dueAt: '2026-08-14T15:00:00.000Z' },
    'Sim Marine — Yacht AV': { type: 'qualification', title: 'Qualify budget', dueAt: '2026-08-10T09:30:00.000Z' }
  };

  function restoreLeadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(CRM_LEADS_STORAGE_KEY) || 'null');
      if (!Array.isArray(stored)) return;
      stored.forEach(saved => {
        const target = saved && CRM_LEADS.find(lead => lead.title === saved.title);
        if (target) Object.assign(target, saved);
      });
    } catch (_) {}
  }

  function saveLeadState() {
    try { localStorage.setItem(CRM_LEADS_STORAGE_KEY, JSON.stringify(CRM_LEADS)); } catch (_) {}
  }

  function leadMentionsFromHtml(html) {
    const template = document.createElement('template');
    template.innerHTML = html || '';
    return [...new Set(Array.from(template.content.querySelectorAll('.note-mention')).map(node =>
      (node.textContent || '').replace(/^@/, '').trim()).filter(Boolean))];
  }

  function ensureLeadDetailData(lead, index) {
    lead.leadId = lead.leadId || 'lead-' + (index + 1);
    lead.project = typeof lead.project === 'string' ? lead.project : '';
    lead.notes = Array.isArray(lead.notes) ? lead.notes : [];
    lead.files = (Array.isArray(lead.files) ? lead.files : []).map((file, fileIndex) => ({
      id: file.id || (lead.leadId + '-file-' + (fileIndex + 1)),
      name: file.name || 'File', type: file.type || '', size: Number(file.size) || 0,
      isImage: Boolean(file.isImage), dataUrl: file.dataUrl || '',
      owner: lead.owner, author: file.author || lead.owner,
      createdAt: file.createdAt || new Date().toISOString()
    }));
    lead.activities = Array.isArray(lead.activities) ? lead.activities : [];
    lead.notes = lead.notes.map((note, noteIndex) => ({
      id: note.id || (lead.leadId + '-note-' + (noteIndex + 1)),
      seedKey: note.seedKey || '',
      title: note.title || 'Note',
      bodyHtml: note.bodyHtml || note.html || '',
      mentions: Array.isArray(note.mentions) ? note.mentions : leadMentionsFromHtml(note.bodyHtml || note.html || ''),
      author: note.author || String(note.created || '').split(' · ').pop() || lead.owner,
      createdAt: note.createdAt || new Date().toISOString(),
      followUpAt: note.followUpAt || '',
      followUpStatus: note.followUpStatus || (note.followUpAt ? 'open' : ''),
      followUpCompletedAt: note.followUpCompletedAt || '',
      mentionReadAt: note.mentionReadAt || '',
      reactions: note.reactions || {},
      replies: Array.isArray(note.replies) ? note.replies : [],
      attachments: Array.isArray(note.attachments) ? note.attachments : []
    }));
    const seed = LEAD_ACTIVITY_SEEDS[lead.title];
    if (seed && !lead.activities.some(activity => activity.seedKey === 'lead-activity-demo')) {
      lead.activities.push({
        id: lead.leadId + '-activity-demo', seedKey: 'lead-activity-demo', type: seed.type,
        title: seed.title, dueAt: seed.dueAt, status: 'scheduled', owner: lead.owner,
        createdAt: lead.createdAt || '2026-08-10T09:00:00.000Z'
      });
    }
    if (index === 0 && !lead.detailDemoSeeded) {
      lead.notes.push({
        id: lead.leadId + '-note-demo-followup', seedKey: 'lead-note-followup-demo', title: 'Confirm site requirements',
        bodyHtml: 'Confirm display count and access requirements with <span class="note-mention">@Lee Roche</span>.',
        mentions: ['Lee Roche'], author: 'Jeff Mitchel', createdAt: '2026-08-12T16:20:00.000Z',
        followUpAt: '2026-08-13T16:30:00.000Z', followUpStatus: 'open', followUpCompletedAt: '',
        mentionReadAt: '', reactions: {}, replies: [], attachments: []
      });
      lead.notes.push({
        id: lead.leadId + '-note-demo-mention', seedKey: 'lead-note-mention-demo', title: 'Budget qualification',
        bodyHtml: 'Please review the budget range, <span class="note-mention">@Lee Roche</span>.',
        mentions: ['Lee Roche'], author: 'Jeff Mitchel', createdAt: '2026-08-13T09:10:00.000Z',
        followUpAt: '', followUpStatus: '', followUpCompletedAt: '', mentionReadAt: '', reactions: {}, replies: [], attachments: []
      });
      lead.detailDemoSeeded = true;
    }
  }

  function leadDateTimeLabel(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'Date not set' : date.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function refreshLeadNextFromActivities(lead) {
    const next = (lead.activities || []).filter(activity => activity.status !== 'completed' && activity.status !== 'cancelled')
      .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))[0];
    if (!next) { lead.next = null; return; }
    const due = new Date(next.dueAt);
    lead.next = {
      txt: next.title,
      when: leadDateTimeLabel(next.dueAt),
      over: !Number.isNaN(due.getTime()) && due < new Date(),
      future: !Number.isNaN(due.getTime()) && due >= new Date()
    };
  }

  restoreLeadState();
  CRM_LEADS.forEach(seedOwningCompany);
  CRM_LEADS.forEach(ensureLeadDetailData);
  CRM_LEADS.forEach(refreshLeadNextFromActivities);
  saveLeadState();
  let leadTab = 'inbox';
  let leadSearchQuery = '';
  const selectedLeadIndices = new Set();

  function setLeadTab(tab, el) {
    leadTab = tab;
    selectedLeadIndices.clear();
    document.querySelectorAll('.it-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderLeads();
  }

  function filterLeads(v) { leadSearchQuery = v; renderLeads(); }

  function visibleLeadRows() {
    const q = (leadSearchQuery || '').toLowerCase();
    return CRM_LEADS.map((l, i) => ({ l, i }))
      .filter(({ l }) => leadTab === 'inbox' ? l.status === 'open' : l.status !== 'open')
      .filter(({ l }) => owningCompanyMatches(l))
      .filter(({ l }) => !q || l.title.toLowerCase().includes(q) || l.owner.toLowerCase().includes(q));
  }

  function toggleLeadSelection(index, checked) {
    if (checked) selectedLeadIndices.add(index);
    else selectedLeadIndices.delete(index);
    syncLeadSelectAll();
  }

  function toggleVisibleLeadsSelection(checked) {
    visibleLeadRows().forEach(({ i }) => checked ? selectedLeadIndices.add(i) : selectedLeadIndices.delete(i));
    renderLeads();
  }

  function syncLeadSelectAll() {
    const checkbox = document.getElementById('lead-select-all');
    if (!checkbox) return;
    const indices = visibleLeadRows().map(({ i }) => i);
    const selectedCount = indices.filter(i => selectedLeadIndices.has(i)).length;
    checkbox.checked = Boolean(indices.length) && selectedCount === indices.length;
    checkbox.indeterminate = selectedCount > 0 && selectedCount < indices.length;
    syncLeadBulkToolbar();
  }

  function selectedVisibleLeadIndices() {
    return visibleLeadRows().map(({ i }) => i).filter(i => selectedLeadIndices.has(i));
  }

  function syncLeadBulkToolbar() {
    const toolbar = document.getElementById('leadBulkToolbar');
    const countEl = document.getElementById('leadBulkCount');
    if (!toolbar || !countEl) return;
    const count = selectedVisibleLeadIndices().length;
    countEl.textContent = count;
    toolbar.classList.toggle('open', count > 0);
    toolbar.setAttribute('aria-hidden', count > 0 ? 'false' : 'true');
  }

  function clearLeadSelection() {
    selectedLeadIndices.clear();
    renderLeads();
  }

  let pendingBulkLeadIndices = [];

  function openBulkLeadConvertDialog(indices) {
    pendingBulkLeadIndices = [...indices];
    const pipelineSelect = document.getElementById('bulkLeadConvertPipeline');
    pipelineSelect.innerHTML = CRM_PIPELINES.map(pipeline =>
      '<option value="' + pipeline.id + '">' + stageTextHtml(pipeline.name) + '</option>'
    ).join('');
    pipelineSelect.value = activePipelineId;
    syncFloatingSelect(pipelineSelect);
    onBulkLeadConvertPipelineChange();
    const count = pendingBulkLeadIndices.length;
    document.getElementById('bulkLeadConvertTitle').textContent = 'Convert ' + count + ' selected ' + (count === 1 ? 'Lead' : 'Leads') + ' to ' + (count === 1 ? 'a Deal' : 'Deals');
    document.getElementById('bulkLeadConvertCopy').textContent = 'Choose one Pipeline and Stage for ' + (count === 1 ? 'this Lead.' : 'all selected Leads. Each Lead will become a separate Deal.');
    document.getElementById('bulkLeadConvertConfirm').textContent = count === 1 ? 'Convert to Deal' : 'Convert ' + count + ' Leads';
    document.getElementById('bulkLeadConvertOverlay').classList.add('open');
    requestAnimationFrame(() => pipelineSelect.focus());
  }

  function closeBulkLeadConvertDialog() {
    document.getElementById('bulkLeadConvertOverlay').classList.remove('open');
    pendingBulkLeadIndices = [];
  }

  function onBulkLeadConvertPipelineChange() {
    const pipelineId = document.getElementById('bulkLeadConvertPipeline').value;
    const pipeline = CRM_PIPELINES.find(item => item.id === pipelineId);
    const stageSelect = document.getElementById('bulkLeadConvertStage');
    stageSelect.innerHTML = (pipeline ? pipeline.stages : []).map((stage, index) =>
      '<option value="' + index + '">' + stageTextHtml(stage.name) + ' · ' + stageProbabilityLabel(stage.probability) + '</option>'
    ).join('');
    stageSelect.selectedIndex = 0;
    syncFloatingSelect(document.getElementById('bulkLeadConvertPipeline'));
    syncFloatingSelect(stageSelect);
    updateBulkLeadConvertSummary();
  }

  function updateBulkLeadConvertSummary() {
    const pipelineSelect = document.getElementById('bulkLeadConvertPipeline');
    const stageSelect = document.getElementById('bulkLeadConvertStage');
    const count = pendingBulkLeadIndices.length;
    const pipelineName = pipelineSelect.selectedOptions[0] ? pipelineSelect.selectedOptions[0].textContent : '—';
    const stageName = stageSelect.selectedOptions[0] ? stageSelect.selectedOptions[0].textContent.split(' · ')[0] : '—';
    document.querySelector('#bulkLeadConvertSummary span').innerHTML = '<b>' + count + ' ' + (count === 1 ? 'Deal' : 'Deals') + '</b> will be created in <b>' + stageTextHtml(pipelineName) + ' / ' + stageTextHtml(stageName) + '</b>. The original Leads will become read-only Converted records.';
  }

  function confirmBulkLeadConvert() {
    if (!pendingBulkLeadIndices.length) return;
    const pipelineId = document.getElementById('bulkLeadConvertPipeline').value;
    const stageIdx = Number(document.getElementById('bulkLeadConvertStage').value);
    const pipeline = CRM_PIPELINES.find(item => item.id === pipelineId);
    if (!pipeline || !pipeline.stages[stageIdx]) return;
    const count = pendingBulkLeadIndices.length;
    const destinationDeals = pipelineId === activePipelineId ? CRM_DEALS : pipeline.deals;
    pendingBulkLeadIndices.forEach(index => {
      const lead = CRM_LEADS[index];
      destinationDeals.push(makeDealFromLead(lead, stageIdx));
      lead.status = 'converted';
    });
    if (pipelineId === activePipelineId) {
      saveActivePipelineState();
      rebuildPipelineColumns();
    }
    selectedLeadIndices.clear();
    const destination = pipeline.name + ' / ' + pipeline.stages[stageIdx].name;
    closeBulkLeadConvertDialog();
    renderLeads();
    qtShowSnackbar(count + (count === 1 ? ' Lead converted to a Deal in ' : ' Leads converted to Deals in ') + destination + '.', 'success');
  }

  function makeDealFromLead(lead, stageIdx = 0) {
    const ownerInitials = (lead.owner || 'Unassigned').split(/\s+/).map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase();
    return {
      t: lead.title,
      c: lead.org || lead.contact || lead.title,
      contact: lead.contact || '',
      org: lead.org || '',
      v: lead.est || 0,
      margin: null,
      s: stageIdx,
      o: ownerInitials || '—',
      oc: '#576A92',
      d: 0,
      owningCompanyId: lead.owningCompanyId || defaultOwningCompanyId()
    };
  }

  function bulkLeadAction(action) {
    const indices = selectedVisibleLeadIndices();
    if (!indices.length) return;
    if (action === 'delete') {
      const noun = indices.length === 1 ? 'lead' : 'leads';
      if (!window.confirm('Delete ' + indices.length + ' selected ' + noun + '? This cannot be undone.')) return;
      [...indices].sort((a, b) => b - a).forEach(i => CRM_LEADS.splice(i, 1));
      selectedLeadIndices.clear();
      renderLeads();
      qtShowSnackbar(indices.length + ' ' + noun + ' deleted.', 'success');
      return;
    }
    if (action === 'archive') {
      indices.forEach(i => { CRM_LEADS[i].status = 'archived'; });
      selectedLeadIndices.clear();
      renderLeads();
      qtShowSnackbar(indices.length + (indices.length === 1 ? ' lead archived.' : ' leads archived.'), 'success');
      return;
    }
    if (action === 'convert') openBulkLeadConvertDialog(indices);
  }

  function leadNextCell(l) {
    if (l.status !== 'open') return '<span class="lead-status ' + l.status + '">' + LEAD_STATUS_LABEL[l.status] + '</span>';
    if (!l.next) return '<span class="l-dim">—</span>';
    const cls = l.next.over ? 'over' : (l.next.future ? 'future' : 'today');
    return '<span class="lead-next ' + cls + '"><i class="fai">&#xf095;</i> ' + l.next.when + '</span>';
  }

  function renderLeads() {
    saveLeadState();
    const rows = visibleLeadRows();
    document.getElementById('leads-body').innerHTML = rows.map(({ l, i }) => `
      <tr onclick="openLeadPanel(${i})">
        <td onclick="event.stopPropagation()"><input type="checkbox" class="lead-row-check" aria-label="Select ${l.title}" data-lead-index="${i}" ${selectedLeadIndices.has(i) ? 'checked' : ''} onchange="toggleLeadSelection(${i}, this.checked)"></td>
        <td class="l-name">${l.title}</td>
        <td class="l-dim">${l.est ? fmt(l.est) : '—'}</td>
        <td><span class="owning-company-badge"><i class="fai">&#xf1ad;</i>${owningCompanyName(l, true)}</span></td>
        <td>${leadNextCell(l)}</td>
        <td>${tableLabelChips(l)}</td>
        <td class="l-dim">${l.source}</td>
        <td class="l-dim">${l.created}</td>
        <td><span class="lead-owner"><span class="av">${l.owner.charAt(0)}</span>${l.owner}</span></td>
        <td onclick="event.stopPropagation()"><button class="lead-kebab-btn" type="button" title="More actions" data-tooltip="More actions" aria-label="More actions for ${l.title}" aria-haspopup="menu" aria-expanded="false" onclick="toggleLeadKebab(event, ${i})"><i class="fai">&#xf141;</i></button></td>
      </tr>
    `).join('');
    syncLeadSelectAll();
  }
  renderLeads();

  // ---------- Per-row "..." menu (kebab) ----------
  let leadKebabIdx = null;
  function toggleLeadKebab(e, i) {
    e.stopPropagation();
    const menu = document.getElementById('leadRowMenu');
    if (leadKebabIdx === i && menu.classList.contains('open')) { closeLeadKebab(); return; }
    leadKebabIdx = i;
    const r = e.currentTarget.getBoundingClientRect();
    const menuHeight = 114;
    menu.style.top = ((window.innerHeight - r.bottom < menuHeight + 8) ? r.top - menuHeight - 4 : r.bottom + 4) + 'px';
    menu.style.left = Math.max(8, r.right - 184) + 'px';
    const l = CRM_LEADS[i];
    const items = menu.querySelectorAll('.item');
    items[0].style.display = l.status === 'open' ? '' : 'none'; // Convert to Deal
    items[1].style.display = l.status === 'open' ? '' : 'none'; // Archive
    menu.classList.add('open');
    menu.setAttribute('aria-hidden', 'false');
    e.currentTarget.setAttribute('aria-expanded', 'true');
  }
  function closeLeadKebab() {
    const trigger = document.querySelector('.lead-kebab-btn[aria-expanded="true"]');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    leadKebabIdx = null;
    const menu = document.getElementById('leadRowMenu');
    if (menu) {
      menu.classList.remove('open');
      menu.setAttribute('aria-hidden', 'true');
    }
  }
  function kebabAction(action) {
    const i = leadKebabIdx;
    closeLeadKebab();
    if (i === null) return;
    if (action === 'convert') openConvert(i);
    else if (action === 'archive') {
      CRM_LEADS[i].status = 'archived';
      renderLeads();
      qtShowSnackbar('Lead archived.', 'success');
    } else if (action === 'delete') {
      if (!window.confirm('Delete “' + CRM_LEADS[i].title + '”? This cannot be undone.')) return;
      CRM_LEADS.splice(i, 1);
      selectedLeadIndices.clear();
      renderLeads();
      qtShowSnackbar('Lead deleted.', 'success');
    }
  }
  document.addEventListener('click', e => {
    const menu = document.getElementById('leadRowMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('.lead-row-menu') && !e.target.closest('.lead-kebab-btn')) closeLeadKebab();
  });

  // ---------- Create Lead modal (Figma DS – WeQuote Platform, node 2480-76334) ----------
  const createLeadOverlay = document.getElementById('createLeadOverlay');
  let clSelectedLabels = [];
  let clSelectedCustomerId = '';
  let clSelectedCustomerData = null;
  let clCustomerActiveIndex = -1;

  const CL_CUSTOMER_SEEDS = [
    { id: 'customer-wong', name: 'Wong Residence', address: '22 Stanley Road, Hong Kong', contact: 'Marcus Wong', email: 'marcus@wongresidence.hk', phone: '+44 7911 111222', since: 'Customer since 2024' },
    { id: 'customer-abr', name: 'ABR Developments', address: '14 Willow Park, London', contact: 'Tony Baker', job: 'IT Manager', email: 'tony@abrdev.co.uk', phone: '+44 (0)1234 567890', since: 'Existing customer' },
    { id: 'customer-ellis', name: 'Ellis Property Group', address: '8 Hyde Square, London', contact: 'Sandra Ellis', job: 'Development Director', email: 'sandra@ellisproperty.co.uk', phone: '+44 7700 900123', since: 'Existing customer' },
    { id: 'customer-lau', name: 'Lau & Partners', address: '18 Queen\'s Road Central, Hong Kong', contact: 'Rebecca Lau', email: 'rebecca@laupartners.hk', phone: '+44 7700 900789', since: 'Existing customer' }
  ];

  function createLeadCustomerKey(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  function createLeadCustomerDirectory() {
    const customers = new Map();
    CL_CUSTOMER_SEEDS.forEach(customer => customers.set(createLeadCustomerKey(customer.name), { ...customer }));
    CRM_LEADS.forEach((lead, index) => {
      const name = (lead.org || lead.contact || '').trim();
      if (!name) return;
      const key = createLeadCustomerKey(name);
      const existing = customers.get(key) || {};
      customers.set(key, {
        id: lead.customerId || existing.id || ('customer-lead-' + index),
        name: name,
        address: existing.address || lead.site || '',
        contact: existing.contact || lead.contact || '',
        job: existing.job || lead.job || '',
        email: existing.email || lead.email || '',
        phone: existing.phone || lead.phone || '',
        since: existing.since || (lead.status === 'converted' ? 'Existing customer' : 'Prospect customer')
      });
    });
    CRM_DEALS.forEach((deal, index) => {
      const name = String(deal.c || '').trim();
      if (!name) return;
      const key = createLeadCustomerKey(name);
      if (!customers.has(key)) customers.set(key, {
        id: 'customer-deal-' + index,
        name: name,
        address: '',
        contact: deal.contact || '',
        job: '', email: '', phone: '', since: 'Existing customer'
      });
    });
    return Array.from(customers.values()).sort((a, b) => a.name.localeCompare(b.name));
  }

  function closeCreateLeadCustomerLookup() {
    const menu = document.getElementById('cl-customer-menu');
    const input = document.getElementById('cl-org');
    if (menu) menu.hidden = true;
    if (input) input.setAttribute('aria-expanded', 'false');
    clCustomerActiveIndex = -1;
  }

  function showCreateLeadNewCustomerBadge(show) {
    const badge = document.getElementById('cl-new-customer-badge');
    if (!badge) return;
    badge.hidden = !show;
    badge.textContent = 'NEW';
  }

  function setCreateLeadCustomerState(customer) {
    const existingState = document.getElementById('cl-existing-customer');
    const error = document.getElementById('cl-customer-error');
    existingState.hidden = !customer;
    showCreateLeadNewCustomerBadge(false);
    error.hidden = true;
    error.textContent = '';
    if (customer) {
      document.getElementById('cl-existing-customer-copy').textContent =
        [customer.address, customer.contact].filter(Boolean).join(' · ') || customer.since || 'Customer record linked';
    }
  }

  function clearCreateLeadCustomerAutofill() {
    if (!clSelectedCustomerData) return;
    const fields = {
      'cl-site': 'address', 'cl-contact': 'contact', 'cl-job': 'job',
      'cl-email': 'email', 'cl-phone': 'phone'
    };
    Object.keys(fields).forEach(id => {
      const input = document.getElementById(id);
      const previous = String(clSelectedCustomerData[fields[id]] || '');
      if (input && input.value === previous) input.value = '';
    });
    clSelectedCustomerData = null;
  }

  function renderCreateLeadCustomerLookup(query) {
    const menu = document.getElementById('cl-customer-menu');
    const input = document.getElementById('cl-org');
    if (!menu || !input) return;
    const q = String(query || '').trim();
    const normalized = q.toLowerCase();
    const results = createLeadCustomerDirectory().filter(customer => {
      if (!normalized) return true;
      return [customer.name, customer.address, customer.contact, customer.email]
        .some(value => String(value || '').toLowerCase().includes(normalized));
    }).slice(0, 6);
    clCustomerActiveIndex = -1;
    const exactMatch = results.some(customer => createLeadCustomerKey(customer.name) === createLeadCustomerKey(q));
    const addNewHtml = q && !exactMatch
      ? '<button type="button" class="cl-customer-option cl-customer-add-option" role="option" aria-selected="false" onclick="selectCreateLeadNewCustomer()">' +
          '<span class="cl-customer-add-icon"><i class="fai">&#x2b;</i></span>' +
          '<span>Add <b>“' + archiveEscape(q) + '”</b> as new customer</span>' +
        '</button>'
      : '';
    if (results.length) {
      menu.innerHTML = '<div class="cl-customer-menu-title">Existing customers</div>' + results.map((customer, index) => {
        const initials = customer.name.split(/\s+/).map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase();
        const meta = [customer.address, customer.contact].filter(Boolean).join(' · ');
        return '<button type="button" class="cl-customer-option" id="cl-customer-option-' + index + '" role="option" aria-selected="false" data-customer-id="' + archiveEscape(customer.id) + '" onclick="selectCreateLeadCustomer(\'' + archiveEscape(customer.id) + '\')">' +
          '<span class="cl-customer-avatar">' + archiveEscape(initials) + '</span>' +
          '<span class="cl-customer-option-copy"><span><b>' + archiveEscape(customer.name) + '</b><em>' + archiveEscape(customer.since || 'Existing customer') + '</em></span>' +
          '<small>' + archiveEscape(meta || customer.email || 'Customer record') + '</small></span>' +
          '<i class="fai">&#xf054;</i></button>';
      }).join('') + addNewHtml;
      showCreateLeadNewCustomerBadge(Boolean(addNewHtml));
    } else if (q) {
      menu.innerHTML = addNewHtml;
      showCreateLeadNewCustomerBadge(true);
    } else {
      menu.innerHTML = '';
      showCreateLeadNewCustomerBadge(false);
    }
    menu.hidden = !(results.length || q);
    input.setAttribute('aria-expanded', menu.hidden ? 'false' : 'true');
  }

  function openCreateLeadCustomerLookup() {
    if (clSelectedCustomerId) return;
    renderCreateLeadCustomerLookup(document.getElementById('cl-org').value);
  }

  function filterCreateLeadCustomers(value) {
    if (clSelectedCustomerId) {
      clearCreateLeadCustomerAutofill();
      clSelectedCustomerId = '';
      setCreateLeadCustomerState(null);
    }
    document.getElementById('cl-create-customer').value = '0';
    renderCreateLeadCustomerLookup(value);
  }

  function selectCreateLeadNewCustomer() {
    const input = document.getElementById('cl-org');
    const name = input.value.trim();
    if (!name) return;
    clearCreateLeadCustomerAutofill();
    clSelectedCustomerId = '';
    clSelectedCustomerData = null;
    setCreateLeadCustomerState(null);
    document.getElementById('cl-create-customer').value = '1';
    showCreateLeadNewCustomerBadge(true);
    closeCreateLeadCustomerLookup();
  }

  function selectCreateLeadCustomer(customerId) {
    const customer = createLeadCustomerDirectory().find(item => item.id === customerId);
    if (!customer) return;
    clSelectedCustomerId = customer.id;
    clSelectedCustomerData = { ...customer };
    document.getElementById('cl-org').value = customer.name;
    document.getElementById('cl-site').value = customer.address || '';
    document.getElementById('cl-contact').value = customer.contact || '';
    document.getElementById('cl-job').value = customer.job || '';
    document.getElementById('cl-email').value = customer.email || '';
    document.getElementById('cl-phone').value = customer.phone || '';
    setCreateLeadCustomerState(customer);
    document.getElementById('cl-create-customer').value = '0';
    showCreateLeadNewCustomerBadge(false);
    closeCreateLeadCustomerLookup();
  }

  function clearCreateLeadCustomerMatch() {
    clearCreateLeadCustomerAutofill();
    clSelectedCustomerId = '';
    setCreateLeadCustomerState(null);
    const input = document.getElementById('cl-org');
    input.focus();
    renderCreateLeadCustomerLookup(input.value);
  }

  function handleCreateLeadCustomerKeydown(event) {
    const menu = document.getElementById('cl-customer-menu');
    const options = menu ? Array.from(menu.querySelectorAll('.cl-customer-option')) : [];
    if (event.key === 'Escape') { closeCreateLeadCustomerLookup(); return; }
    if (!options.length || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Enter') {
      const active = options[Math.max(0, clCustomerActiveIndex)];
      if (active) active.click();
      return;
    }
    clCustomerActiveIndex += event.key === 'ArrowDown' ? 1 : -1;
    clCustomerActiveIndex = (clCustomerActiveIndex + options.length) % options.length;
    options.forEach((option, index) => {
      const active = index === clCustomerActiveIndex;
      option.classList.toggle('active', active);
      option.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    options[clCustomerActiveIndex].scrollIntoView({ block: 'nearest' });
  }

  function openCreateLead(e) {
    if (e) e.stopPropagation();
    ['cl-org', 'cl-site', 'cl-value', 'cl-contact', 'cl-job', 'cl-email', 'cl-phone', 'cl-notes'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    document.querySelectorAll('.cl-email-extra').forEach(el => el.closest('.wqd-field').remove());
    document.getElementById('cl-owner').value = '';
    document.getElementById('cl-company').innerHTML = owningCompanyOptions(defaultOwningCompanyId(), true);
    document.getElementById('cl-company').value = defaultOwningCompanyId();
    document.getElementById('cl-source').value = '';
    document.getElementById('cl-currency').selectedIndex = 0;
    document.getElementById('cl-phonecode').selectedIndex = 0;
    clSelectedLabels = [];
    clSelectedCustomerId = '';
    clSelectedCustomerData = null;
    showCreateLeadNewCustomerBadge(false);
    setCreateLeadCustomerState(null);
    document.getElementById('cl-create-customer').value = '0';
    closeCreateLeadCustomerLookup();
    renderClLabelChips();
    setContactTab('primary');
    closeLabelPicker();
    createLeadOverlay.classList.add('open');
  }
  function closeCreateLead() { createLeadOverlay.classList.remove('open'); closeLabelPicker(); closeCreateLeadCustomerLookup(); }

  function setContactTab(tab, el, overlayId) {
    const tabs = document.querySelectorAll('#' + (overlayId || 'createLeadOverlay') + ' .it-tab');
    tabs.forEach(t => t.classList.remove('active'));
    (el || tabs[tab === 'primary' ? 0 : 1]).classList.add('active');
    if (overlayId === 'viewDeal') {
      if (ddContactEditing) ddCancelContactEdit();
      ddContactTab = tab;
      ddRenderContactDetails();
    }
  }

  function addEmailField(listId) {
    const wrap = document.getElementById(listId || 'cl-email-list');
    const row = document.createElement('div');
    row.className = 'wqd-field';
    row.innerHTML = '<label class="wqd-field-label">Email address</label><input class="cl-email-extra" placeholder="e.g. alex@abcintegrations.co.uk">';
    wrap.appendChild(row);
  }

  function addPhoneField(listId) {
    const wrap = document.getElementById(listId);
    const row = document.createElement('div');
    row.className = 'leadm-row df-phone-extra';
    row.style.gap = '0';
    row.innerHTML =
      '<div class="wqd-select-wrap phonecode">' +
        '<select class="wqd-select"><option>UK +44</option><option>US +1</option><option>HK +852</option></select>' +
        '<i class="fai chev">&#xf078;</i>' +
      '</div>' +
      '<div class="wqd-field fuse-r"><label class="wqd-field-label">Phone number</label>' +
        '<input class="df-phone-extra-input" placeholder="7911 123456"></div>';
    wrap.appendChild(row);
  }

  function saveCreateLead() {
    const contact = document.getElementById('cl-contact').value.trim() || 'New Contact';
    const org = document.getElementById('cl-org').value.trim();
    const owningCompanyId = document.getElementById('cl-company').value;
    if (!owningCompanyId) {
      document.getElementById('cl-company').focus();
      qtShowSnackbar('Choose the Owning Company for this Lead.', 'blocked');
      return;
    }
    const customerError = document.getElementById('cl-customer-error');
    const exactCustomer = org && createLeadCustomerDirectory().find(customer => createLeadCustomerKey(customer.name) === createLeadCustomerKey(org));
    if (!clSelectedCustomerId && exactCustomer) {
      customerError.textContent = 'This customer already exists. Select it from the suggestions to avoid creating a duplicate.';
      customerError.hidden = false;
      document.getElementById('cl-org').focus();
      renderCreateLeadCustomerLookup(org);
      return;
    }
    const createCustomerNow = Boolean(org && !clSelectedCustomerId && document.getElementById('cl-create-customer').value === '1');
    const valueRaw = document.getElementById('cl-value').value;
    const est = valueRaw ? (parseFloat(valueRaw.replace(/[^0-9.]/g, '')) || null) : null;
    const lead = {
      title: (org || contact) + ' Lead',   // list keys on Lead Title; derived until spec adds a title field
      contact: contact,
      job: document.getElementById('cl-job').value.trim(),
      org: org, site: document.getElementById('cl-site').value.trim(),
      labels: [...clSelectedLabels],
      interests: [],
      phone: document.getElementById('cl-phone').value.trim(),
      email: document.getElementById('cl-email').value.trim(),
      customerId: clSelectedCustomerId || (createCustomerNow ? ('customer-' + Date.now()) : ''),
      customerStatus: clSelectedCustomerId ? 'existing' : (createCustomerNow ? 'new' : 'unlinked'),
      createCustomer: createCustomerNow,
      owningCompanyId: owningCompanyId,
      next: null, est: est,
      source: document.getElementById('cl-source').value || 'Other',
      created: 'Just now', owner: document.getElementById('cl-owner').value || 'Lee Roche', status: 'open'
    };
    CRM_LEADS.unshift(lead);
    ensureLeadDetailData(lead, Date.now());
    refreshLeadNextFromActivities(lead);
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('lead.created', { lead });
    renderLeads();
    closeCreateLead();
    showView('leads');
    qtShowSnackbar(clSelectedCustomerId
      ? 'Lead created and linked to the existing customer.'
      : (createCustomerNow ? 'Lead and new customer record created.' : 'Lead created without a customer. You can link one later.'), 'success');
  }
  createLeadOverlay.addEventListener('click', e => { if (e.target === createLeadOverlay) closeCreateLead(); });
  document.addEventListener('click', e => {
    if (!e.target.closest('#cl-customer-combobox')) closeCreateLeadCustomerLookup();
  });

  // ---------- Label / Interest search + create popover (shared: Create Lead's "Add label",
  // the deal form's "Add label" and "Interested in"). labelPickerKind selects which state/defs/chips apply. ----------
  let labelPickerKind = 'lead-label';
  const PICKER_FIELD_ID = {
    'lead-label': 'cl-labelfield',
    'label': 'df-labelfield',
    'interest': 'df-interestfield',
    'deal-label': 'dd-label-row',
    'deal-interest': 'dd-interest-row',
    'drawer-label': 'ldp-label-row',
    'drawer-interest': 'ldp-interest-row'
  };
  function pickerState() {
    if (labelPickerKind === 'lead-label') return { get: () => clSelectedLabels, set: v => clSelectedLabels = v, defs: LABEL_DEFS, addable: true };
    if (labelPickerKind === 'label') return { get: () => dfSelectedLabels, set: v => dfSelectedLabels = v, defs: LABEL_DEFS, addable: true };
    if (labelPickerKind === 'interest') return { get: () => dfSelectedInterests, set: v => dfSelectedInterests = v, defs: INTEREST_DEFS, addable: false };
    if (labelPickerKind === 'deal-label') return {
      get: () => (ddDeal ? (ddDeal.labels || []) : []),
      set: v => updateDealPickerValues('labels', v),
      defs: LABEL_DEFS,
      addable: true
    };
    if (labelPickerKind === 'deal-interest') return {
      get: () => (ddDeal ? (ddDeal.interests || []) : []),
      set: v => updateDealPickerValues('interests', v),
      defs: INTEREST_DEFS,
      addable: false
    };
    if (labelPickerKind === 'drawer-label') return {
      get: () => (ldpIdx === null ? [] : (CRM_LEADS[ldpIdx].labels || [])),
      set: v => { if (ldpIdx !== null) CRM_LEADS[ldpIdx].labels = v; },
      defs: LABEL_DEFS,
      addable: true
    };
    return {
      get: () => (ldpIdx === null ? [] : (CRM_LEADS[ldpIdx].interests || [])),
      set: v => { if (ldpIdx !== null) CRM_LEADS[ldpIdx].interests = v; },
      defs: INTEREST_DEFS,
      addable: false
    };
  }

  function updateDealPickerValues(field, values) {
    if (!ddDeal || !['labels', 'interests'].includes(field)) return;
    const previous = Array.isArray(ddDeal[field]) ? ddDeal[field].slice() : [];
    const next = Array.isArray(values) ? [...new Set(values)] : [];
    if (previous.length === next.length && previous.every((value, index) => value === next[index])) return;
    ddDeal[field] = next;
    recordDealActionEvent(ddDeal, {
      kind: 'deal-data', actionType: field === 'labels' ? 'label' : 'interest',
      title: (field === 'labels' ? 'Deal Labels' : 'Deal Interests') + ' updated · ' +
        (previous.length ? previous.join(', ') : 'None') + ' → ' + (next.length ? next.join(', ') : 'None'),
      author: CURRENT_USER
    });
    saveActivePipelineState();
    if (window.WeQuoteAutomation) window.WeQuoteAutomation.emit('deal.data.changed', {
      deal: ddDeal, pipeline: getActivePipeline(), field: field === 'labels' ? 'label' : 'interest',
      previous: previous, value: next
    });
    refreshPipelineDealCard(ddDeal);
    ddRenderHistory();
  }
  function renderActiveChips() {
    if (labelPickerKind === 'lead-label') renderClLabelChips();
    else if (labelPickerKind === 'label' || labelPickerKind === 'interest') dfRenderChips(labelPickerKind);
    else if (labelPickerKind === 'deal-label' || labelPickerKind === 'deal-interest') ddRenderMetadata();
    else if (ldpIdx !== null) {
      const lead = CRM_LEADS[ldpIdx];
      renderLdpMetadata(lead);
      renderLeadAiSummary(lead);
      renderLeads();
    }
  }
  function renderClLabelChips() {
    const box = document.getElementById('cl-label-chips');
    box.innerHTML = clSelectedLabels.map(name => {
      const d = labelDef(name);
      return '<span class="wqd-label-chip" style="background:' + d.bg + ';color:' + d.fg + ';">' + d.name +
        ' <span class="x" onclick="removeCreateLabel(event,\'' + d.name.replace(/'/g, "\\'") + '\')">&times;</span></span>';
    }).join('');
  }
  function removeCreateLabel(e, name) {
    e.stopPropagation();
    clSelectedLabels = clSelectedLabels.filter(n => n !== name);
    renderClLabelChips();
    if (labelPickerKind === 'lead-label') renderLabelPickerList();
  }
  function toggleLabelPicker(e, kind) {
    e.stopPropagation();
    kind = kind || 'lead-label';
    closeOrganisationPicker();
    closeLeadOwnerPicker();
    const menu = document.getElementById('labelPickerMenu');
    if (menu.classList.contains('open') && labelPickerKind === kind) { closeLabelPicker(); return; }
    labelPickerKind = kind;
    const field = document.getElementById(PICKER_FIELD_ID[kind]);
    const r = field.getBoundingClientRect();
    const isCompactPicker = kind.indexOf('drawer-') === 0 || kind.indexOf('deal-') === 0;
    const menuWidth = isCompactPicker ? 300 : r.width;
    menu.style.top = (r.bottom + 4) + 'px';
    menu.style.left = Math.max(8, Math.min(r.left, window.innerWidth - menuWidth - 8)) + 'px';
    menu.style.width = menuWidth + 'px';
    document.getElementById('lp-search-input').value = '';
    document.getElementById('lp-search-input').placeholder = kind.indexOf('interest') !== -1 ? 'Search interest' : 'Search label';
    document.querySelector('#labelPickerMenu .lp-add').style.display = pickerState().addable ? '' : 'none';
    renderLabelPickerList('');
    menu.classList.add('open');
    setTimeout(() => document.getElementById('lp-search-input').focus(), 0);
  }
  function closeLabelPicker() {
    const menu = document.getElementById('labelPickerMenu');
    if (menu) menu.classList.remove('open');
  }
  function filterLabelPicker(v) { renderLabelPickerList(v); }
  function renderLabelPickerList(query) {
    if (query === undefined) query = document.getElementById('lp-search-input').value;
    query = (query || '').toLowerCase();
    const st = pickerState();
    const list = document.getElementById('lp-list');
    const filtered = st.defs.filter(d => d.name.toLowerCase().includes(query));
    list.innerHTML = filtered.map((d, idx) => {
      const selected = st.get().includes(d.name);
      const safeName = d.name.replace(/'/g, "\'");
      return (idx > 0 ? '<div class="lp-divider"></div>' : '') +
        '<div class="lp-row' + (selected ? ' selected' : '') + '" onclick="toggleLabelSelect(\'' + safeName + '\')">' +
          '<span class="lead-label-chip" style="background:' + d.bg + ';color:' + d.fg + ';">' + d.name + '</span>' +
          '<span class="lp-actions">' +
            (st.addable ? '<i class="fai edit" onclick="event.stopPropagation();renameLabel(\'' + safeName + '\')">&#xf304;</i>' : '') +
            '<i class="fai check">&#xf00c;</i>' +
          '</span>' +
        '</div>';
    }).join('');
  }
  function toggleLabelSelect(name) {
    const st = pickerState();
    const arr = st.get();
    st.set(arr.includes(name) ? arr.filter(n => n !== name) : [...arr, name]);
    renderActiveChips();
    renderLabelPickerList();
  }
  function renameLabel(oldName) {
    const d = labelDef(oldName);
    const next = prompt('Rename label', d.name);
    if (!next || !next.trim() || next.trim() === d.name) return;
    const newName = next.trim();
    LABEL_DEFS.forEach(x => { if (x.name === oldName) x.name = newName; });
    const st = pickerState();
    st.set(st.get().map(n => n === oldName ? newName : n));
    renderActiveChips();
    renderLabelPickerList();
  }
  function addNewLabel() {
    const st = pickerState();
    if (!st.addable) return; // Interests are a fixed catalogue in this demo
    const name = prompt('New label name');
    if (!name || !name.trim()) return;
    const palette = ['#7C3AED', '#1E8539', '#F59E0B', '#06B6D4', '#EC4899', '#1E8539'];
    const trimmed = name.trim();
    if (!LABEL_DEFS.find(d => d.name.toLowerCase() === trimmed.toLowerCase())) {
      LABEL_DEFS.push({ name: trimmed, bg: palette[LABEL_DEFS.length % palette.length], fg: '#FFFFFF' });
    }
    if (!st.get().includes(trimmed)) st.set([...st.get(), trimmed]);
    renderActiveChips();
    renderLabelPickerList();
  }
  document.addEventListener('click', e => {
    const menu = document.getElementById('labelPickerMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('#labelPickerMenu') && !e.target.closest('#' + PICKER_FIELD_ID[labelPickerKind])) closeLabelPicker();
  });

  // Organisation uses the same compact selector language, but is single-select.
  let organisationPickerOptions = [];
  function closeOrganisationPicker() {
    const menu = document.getElementById('organisationPickerMenu');
    if (menu) menu.classList.remove('open');
  }
  function getOrganisationOptions() {
    return [...new Set(CRM_LEADS.map(lead => lead.org).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }
  function renderOrganisationPicker(query) {
    query = (query || '').trim().toLowerCase();
    const current = ldpIdx === null ? '' : (CRM_LEADS[ldpIdx].org || '');
    organisationPickerOptions = getOrganisationOptions().filter(name => name.toLowerCase().includes(query));
    const list = document.getElementById('org-picker-list');
    list.innerHTML = organisationPickerOptions.length ? organisationPickerOptions.map((name, index) => {
      const selected = name === current;
      return '<div class="lp-row' + (selected ? ' selected' : '') + '" role="option" aria-selected="' + selected + '" onclick="selectOrganisationPicker(' + index + ')">' +
        '<span class="org-option-main"><i class="fai" aria-hidden="true">&#xf1ad;</i><span class="org-option-name">' + escapeLeadNoteText(name) + '</span></span>' +
        '<span class="lp-actions"><i class="fai check">&#xf00c;</i></span></div>';
    }).join('') : '<div class="lp-empty">No organisations found</div>';
  }
  function selectOrganisationPicker(index) {
    if (ldpIdx === null || !organisationPickerOptions[index]) return;
    const lead = CRM_LEADS[ldpIdx];
    lead.org = organisationPickerOptions[index];
    renderLdpOrg(lead);
    renderLeadAiSummary(lead);
    renderLeads();
    closeOrganisationPicker();
  }
  function onOrgRowClick(e) {
    if (e) e.stopPropagation();
    if (ldpIdx === null) return;
    closeLabelPicker();
    closeLeadOwnerPicker();
    const menu = document.getElementById('organisationPickerMenu');
    if (menu.classList.contains('open')) { closeOrganisationPicker(); return; }
    const row = document.getElementById('ldp-org-row');
    const rect = row.getBoundingClientRect();
    const width = 300;
    const estimatedHeight = 267;
    const top = rect.bottom + 4 + estimatedHeight <= window.innerHeight
      ? rect.bottom + 4
      : Math.max(8, rect.top - estimatedHeight - 4);
    menu.style.width = width + 'px';
    menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + 'px';
    menu.style.top = top + 'px';
    const search = document.getElementById('org-picker-search');
    search.value = '';
    renderOrganisationPicker('');
    menu.classList.add('open');
    setTimeout(() => search.focus(), 0);
  }
  document.addEventListener('click', e => {
    const menu = document.getElementById('organisationPickerMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('#organisationPickerMenu') && !e.target.closest('#ldp-org-row')) closeOrganisationPicker();
  });

  let leadOwnerPickerOptions = [];
  function closeLeadOwnerPicker() {
    const menu = document.getElementById('leadOwnerPickerMenu');
    if (menu) menu.classList.remove('open');
  }
  function getLeadOwnerOptions() {
    const current = ldpIdx === null ? '' : (CRM_LEADS[ldpIdx].owner || '');
    return [...new Set([current, CRM_CURRENT_USER, ...Object.values(CRM_OWNER_NAMES)].filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
  }
  function leadOwnerPickerInitials(name) {
    return name.split(/\s+/).filter(Boolean).map(part => part.charAt(0)).join('').slice(0, 2).toUpperCase();
  }
  function renderLeadOwnerPicker(query) {
    query = (query || '').trim().toLowerCase();
    const current = ldpIdx === null ? '' : (CRM_LEADS[ldpIdx].owner || '');
    leadOwnerPickerOptions = getLeadOwnerOptions().filter(name => name.toLowerCase().includes(query));
    const list = document.getElementById('lead-owner-picker-list');
    list.innerHTML = leadOwnerPickerOptions.length ? leadOwnerPickerOptions.map((name, index) => {
      const selected = name === current;
      return '<div class="lp-row' + (selected ? ' selected' : '') + '" role="option" aria-selected="' + selected + '" onclick="selectLeadOwnerPicker(' + index + ')">' +
        '<span class="owner-option-main"><span class="owner-option-avatar">' + escapeLeadNoteText(leadOwnerPickerInitials(name)) + '</span><span class="owner-option-name">' + escapeLeadNoteText(ownerDisplay(name)) + '</span></span>' +
        '<span class="lp-actions"><i class="fai check">&#xf00c;</i></span></div>';
    }).join('') : '<div class="lp-empty">No owners found</div>';
  }
  function selectLeadOwnerPicker(index) {
    if (ldpIdx === null || !leadOwnerPickerOptions[index]) return;
    const lead = CRM_LEADS[ldpIdx];
    const previous = lead.owner;
    lead.owner = leadOwnerPickerOptions[index];
    (lead.activities || []).filter(activity => activity.owner === previous && activity.status !== 'completed')
      .forEach(activity => { activity.owner = lead.owner; });
    renderLdpMetadata(lead);
    renderLeadFocus(lead);
    renderLdpHistory(lead);
    renderLeadAiSummary(lead);
    saveLeadState();
    renderLeads();
    closeLeadOwnerPicker();
    qtShowSnackbar('Lead owner changed to ' + ownerDisplay(lead.owner) + '.', 'success');
  }
  function onLeadOwnerRowClick(e) {
    if (e) e.stopPropagation();
    if (ldpIdx === null) return;
    closeLabelPicker();
    closeOrganisationPicker();
    const menu = document.getElementById('leadOwnerPickerMenu');
    if (menu.classList.contains('open')) { closeLeadOwnerPicker(); return; }
    const row = document.getElementById('ldp-owner-row');
    const rect = row.getBoundingClientRect();
    const width = 300;
    const estimatedHeight = 267;
    const top = rect.bottom + 4 + estimatedHeight <= window.innerHeight
      ? rect.bottom + 4
      : Math.max(8, rect.top - estimatedHeight - 4);
    menu.style.width = width + 'px';
    menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8)) + 'px';
    menu.style.top = top + 'px';
    const search = document.getElementById('lead-owner-picker-search');
    search.value = '';
    renderLeadOwnerPicker('');
    menu.classList.add('open');
    setTimeout(() => search.focus(), 0);
  }
  document.addEventListener('click', e => {
    const menu = document.getElementById('leadOwnerPickerMenu');
    if (menu && menu.classList.contains('open') && !e.target.closest('#leadOwnerPickerMenu') && !e.target.closest('#ldp-owner-row')) closeLeadOwnerPicker();
  });

  // ---------- Lead detail modal (Figma DS – WeQuote Platform, node 2480-76459) ----------
  const leadDrawer = document.getElementById('leadDrawer');
  let ldpIdx = null;
  let activeLeadDrawerTab = 'notes';
  let leadContactTab = 'primary';
  let leadContactEditing = '';
  const leadNoteEditor = document.getElementById('leadNoteEditor');
  const leadNoteTitle = document.getElementById('leadNoteTitle');
  const leadNoteComposer = document.getElementById('leadNoteComposer');
  const leadMentionMenu = document.getElementById('leadMentionMenu');
  const leadNoteSave = document.getElementById('leadNoteSave');
  let leadNotePendingAttachments = [];
  let leadNotePickerMonth = new Date();
  let leadNotePickerDate = '';
  let leadNotePickerTime = '09:00';

  function leadContactValues(tab) {
    const lead = Number.isInteger(ldpIdx) ? CRM_LEADS[ldpIdx] : null;
    if (!lead) return { contact: '', email: '', phone: '' };
    if (tab === 'secondary') {
      return {
        contact: lead.secondaryContact || '',
        email: lead.secondaryEmail || '',
        phone: lead.secondaryPhone || ''
      };
    }
    return { contact: lead.contact || '', email: lead.email || '', phone: lead.phone || '' };
  }

  function renderLeadContactDetails() {
    const values = leadContactValues(leadContactTab);
    ['contact', 'email', 'phone'].forEach(field => {
      const slot = document.getElementById('ldp-' + field);
      if (slot) slot.textContent = values[field] || '—';
    });
  }

  function leadContactEditorParts(field) {
    return {
      row: document.querySelector('.dd-contact-row[data-lead-contact-field="' + field + '"]'),
      slot: document.getElementById('ldp-' + field),
      editor: document.getElementById('ldp-' + field + '-editor'),
      input: document.getElementById('ldp-' + field + '-input')
    };
  }

  function setLeadContactTab(tab, element) {
    if (!['primary', 'secondary'].includes(tab)) return;
    if (leadContactEditing) leadCancelContactEdit();
    leadContactTab = tab;
    document.querySelectorAll('#leadDrawer .ldm-contact-tabs .it-tab').forEach(item => item.classList.remove('active'));
    if (element) element.classList.add('active');
    renderLeadContactDetails();
  }

  function leadStartContactEdit(field, event) {
    if (event) event.stopPropagation();
    if (!Number.isInteger(ldpIdx) || !['contact', 'email', 'phone'].includes(field)) return;
    if (leadContactEditing && leadContactEditing !== field) leadCancelContactEdit();
    const parts = leadContactEditorParts(field);
    if (!parts.row || !parts.slot || !parts.editor || !parts.input) return;
    leadContactEditing = field;
    parts.input.value = leadContactValues(leadContactTab)[field] || '';
    parts.input.removeAttribute('aria-invalid');
    parts.slot.hidden = true;
    parts.editor.hidden = false;
    parts.row.classList.add('is-editing');
    parts.input.focus();
    parts.input.select();
  }

  function leadHandleContactRowKeydown(event, field) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    leadStartContactEdit(field, event);
  }

  function leadHandleContactInputKeydown(event, field) {
    if (event.key === 'Enter') {
      event.preventDefault();
      leadSaveContactInline(event, field);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      leadCancelContactEdit(event);
    }
  }

  function leadHandleContactBlur(event, field) {
    const parts = leadContactEditorParts(field);
    if (event.relatedTarget && parts.editor && parts.editor.contains(event.relatedTarget)) return;
    window.setTimeout(() => {
      if (leadContactEditing === field && document.activeElement !== parts.input) leadSaveContactInline(null, field);
    }, 0);
  }

  function leadSaveContactInline(event, field) {
    if (event) event.stopPropagation();
    const lead = Number.isInteger(ldpIdx) ? CRM_LEADS[ldpIdx] : null;
    if (!lead || leadContactEditing !== field) return;
    const parts = leadContactEditorParts(field);
    const value = parts.input.value.trim();
    if (field === 'contact' && leadContactTab === 'primary' && !value) {
      parts.input.setAttribute('aria-invalid', 'true');
      parts.input.focus();
      return;
    }
    if (leadContactTab === 'secondary') {
      const secondaryKey = { contact: 'secondaryContact', email: 'secondaryEmail', phone: 'secondaryPhone' }[field];
      lead[secondaryKey] = value;
    } else {
      lead[field] = value;
    }
    leadContactEditing = '';
    parts.row.classList.remove('is-editing');
    parts.editor.hidden = true;
    parts.slot.hidden = false;
    saveLeadState();
    renderLeads();
    renderLeadContactDetails();
  }

  function leadCancelContactEdit(event) {
    if (event) event.stopPropagation();
    if (!leadContactEditing) return;
    const parts = leadContactEditorParts(leadContactEditing);
    leadContactEditing = '';
    if (parts.row) parts.row.classList.remove('is-editing');
    if (parts.editor) parts.editor.hidden = true;
    if (parts.slot) parts.slot.hidden = false;
    if (parts.input) parts.input.removeAttribute('aria-invalid');
    renderLeadContactDetails();
  }

  function escapeLeadNoteText(value) { const el = document.createElement('div'); el.textContent = value == null ? '' : String(value); return el.innerHTML; }
  function sanitizeLeadNoteHtml(html) {
    const template = document.createElement('template'); template.innerHTML = html;
    const allowed = new Set(['B','STRONG','I','EM','U','S','STRIKE','BR','P','DIV','UL','OL','LI','A','SPAN']);
    Array.from(template.content.querySelectorAll('*')).reverse().forEach(node => {
      if (!allowed.has(node.tagName)) { node.replaceWith(document.createTextNode(node.textContent || '')); return; }
      Array.from(node.attributes).forEach(attr => {
        const keepMention = node.tagName === 'SPAN' && attr.name === 'class' && attr.value === 'note-mention';
        const keepLink = node.tagName === 'A' && attr.name === 'href';
        if (!keepMention && !keepLink) node.removeAttribute(attr.name);
      });
      if (node.tagName === 'A') {
        const href = node.getAttribute('href') || '';
        if (!/^(https?:|mailto:)/i.test(href)) node.removeAttribute('href');
        else { node.target = '_blank'; node.rel = 'noopener noreferrer'; }
      }
    });
    return template.innerHTML;
  }
  function updateLeadNoteState() {
    const hasText = (leadNoteEditor.innerText || '').trim().length > 0;
    const hasAttachment = leadNotePendingAttachments.length > 0;
    const isPreparingAttachment = leadNotePendingAttachments.some(file => file.loading);
    leadNoteSave.disabled = (!hasText && !hasAttachment) || isPreparingAttachment;
    if (hasText || hasAttachment || leadNoteTitle.value.trim()) leadNoteComposer.classList.add('is-editing');
  }
  function focusLeadNote() { leadNoteComposer.classList.add('is-editing'); leadNoteComposer.scrollIntoView({behavior:'smooth',block:'nearest'}); leadNoteEditor.focus(); }
  function applyLeadNoteFormat(command) { leadNoteEditor.focus(); document.execCommand(command, false, null); updateLeadNoteState(); }
  function openLeadMentionMenu() { focusLeadNote(); leadMentionMenu.hidden = false; }
  function insertLeadMention(name) {
    leadNoteEditor.focus(); const selection = window.getSelection();
    const range = selection && selection.rangeCount ? selection.getRangeAt(0) : document.createRange();
    if (!leadNoteEditor.contains(range.commonAncestorContainer)) { range.selectNodeContents(leadNoteEditor); range.collapse(false); }
    const mention = document.createElement('span'); mention.className = 'note-mention'; mention.contentEditable = 'false'; mention.textContent = '@' + name;
    range.deleteContents(); range.insertNode(document.createTextNode('\u00a0')); range.insertNode(mention); range.setStartAfter(mention.nextSibling || mention); range.collapse(true);
    selection.removeAllRanges(); selection.addRange(range); leadMentionMenu.hidden = true; updateLeadNoteState();
  }
  function leadLocalIsoDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }
  function leadPopulateFollowUpTimes() {
    const select = document.getElementById('leadNoteFollowUpTime');
    if (select.options.length) return;
    for (let minutes = 0; minutes < 1440; minutes += 30) {
      const value = String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0');
      const option = document.createElement('option'); option.value = value; option.textContent = value; select.appendChild(option);
    }
  }
  function renderLeadNoteCalendar() {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = leadNotePickerMonth.getFullYear(); const month = leadNotePickerMonth.getMonth();
    document.getElementById('leadNoteCalendarMonth').textContent = new Date(year, month, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    const first = new Date(year, month, 1); const offset = (first.getDay() + 6) % 7; const days = new Date(year, month + 1, 0).getDate();
    let html = '';
    for (let i = 0; i < offset; i++) html += '<span class="empty"></span>';
    for (let day = 1; day <= days; day++) {
      const date = new Date(year, month, day); const iso = leadLocalIsoDate(date); const past = date < today;
      html += '<button type="button"' + (past ? ' disabled' : '') + ' class="' + (iso === leadNotePickerDate ? 'selected' : '') + (iso === leadLocalIsoDate(today) ? ' today' : '') + '" onclick="selectLeadNoteFollowUpDate(\'' + iso + '\')">' + day + '</button>';
    }
    document.getElementById('leadNoteCalendarGrid').innerHTML = html;
    document.getElementById('leadNoteDateTimeDone').disabled = !leadNotePickerDate;
  }
  function openLeadNoteDateTimePicker() {
    const picker = document.getElementById('leadNoteDateTimePicker'); const input = document.getElementById('leadNoteFollowUpAt');
    leadPopulateFollowUpTimes();
    const draft = input.value ? new Date(input.value) : new Date(Date.now() + 86400000);
    if (!input.value) { draft.setMinutes(draft.getMinutes() < 30 ? 30 : 0, 0, 0); if (draft.getMinutes() === 0) draft.setHours(draft.getHours() + 1); }
    leadNotePickerDate = leadLocalIsoDate(draft); leadNotePickerTime = String(draft.getHours()).padStart(2, '0') + ':' + String(draft.getMinutes()).padStart(2, '0');
    leadNotePickerMonth = new Date(draft.getFullYear(), draft.getMonth(), 1);
    document.getElementById('leadNoteFollowUpTime').value = leadNotePickerTime;
    picker.hidden = false; document.getElementById('leadNoteDateTimeTrigger').setAttribute('aria-expanded', 'true'); renderLeadNoteCalendar();
  }
  function closeLeadNoteDateTimePicker() { document.getElementById('leadNoteDateTimePicker').hidden = true; document.getElementById('leadNoteDateTimeTrigger').setAttribute('aria-expanded', 'false'); }
  function toggleLeadNoteDateTimePicker() { const picker = document.getElementById('leadNoteDateTimePicker'); picker.hidden ? openLeadNoteDateTimePicker() : closeLeadNoteDateTimePicker(); }
  function changeLeadNoteCalendarMonth(delta) { leadNotePickerMonth = new Date(leadNotePickerMonth.getFullYear(), leadNotePickerMonth.getMonth() + delta, 1); renderLeadNoteCalendar(); }
  function selectLeadNoteFollowUpDate(iso) { leadNotePickerDate = iso; renderLeadNoteCalendar(); }
  function syncLeadNotePickerDraft() { leadNotePickerTime = document.getElementById('leadNoteFollowUpTime').value || '09:00'; }
  function applyLeadNoteDateTime() {
    if (!leadNotePickerDate) return;
    syncLeadNotePickerDraft();
    const value = leadNotePickerDate + 'T' + leadNotePickerTime;
    document.getElementById('leadNoteFollowUpAt').value = value;
    document.getElementById('leadNoteDateTimeLabel').textContent = new Date(value).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    closeLeadNoteDateTimePicker(); leadNoteComposer.classList.add('is-editing');
  }
  function clearLeadNoteFollowUp() { document.getElementById('leadNoteFollowUpAt').value = ''; document.getElementById('leadNoteDateTimeLabel').textContent = 'Choose date and time'; closeLeadNoteDateTimePicker(); }
  function toggleLeadNoteReminder() {
    const wrap = document.getElementById('leadNoteReminder'); wrap.classList.toggle('open'); leadNoteComposer.classList.add('is-editing');
    if (wrap.classList.contains('open')) requestAnimationFrame(openLeadNoteDateTimePicker); else closeLeadNoteDateTimePicker();
  }
  function leadAttachmentSizeLabel(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return 'Attached file';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(bytes < 10485760 ? 1 : 0) + ' MB';
  }
  function renderLeadNoteAttachments() {
    const list = document.getElementById('leadNoteAttachmentList');
    list.hidden = !leadNotePendingAttachments.length;
    list.innerHTML = leadNotePendingAttachments.map((file, index) =>
      '<div class="ldm-note-attachment">' +
        (file.isImage && file.dataUrl
          ? '<img src="' + file.dataUrl + '" alt="">'
          : '<span class="file-icon"><i class="fai">&#xf15b;</i></span>') +
        '<span class="file-meta"><b>' + escapeLeadNoteText(file.name) + '</b><small>' + leadAttachmentSizeLabel(file.size) + '</small></span>' +
        '<button class="remove" type="button" onclick="removeLeadNoteAttachment(' + index + ')" aria-label="Remove attachment"><i class="fai">&#xf00d;</i></button>' +
      '</div>'
    ).join('');
  }
  function handleLeadNoteAttachment(input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;
    const remaining = Math.max(0, 3 - leadNotePendingAttachments.length);
    if (!remaining) { qtShowSnackbar('You can attach up to 3 files to a Note.', 'warning'); input.value = ''; return; }
    files.slice(0, remaining).forEach(file => {
      const attachment = { name: file.name, type: file.type || '', size: file.size || 0, isImage: /^image\//i.test(file.type || ''), dataUrl: '', loading: false };
      leadNotePendingAttachments.push(attachment);
      if (attachment.isImage && file.size <= 5 * 1024 * 1024) {
        attachment.loading = true;
        const reader = new FileReader();
        reader.onload = () => { attachment.dataUrl = typeof reader.result === 'string' ? reader.result : ''; attachment.loading = false; renderLeadNoteAttachments(); updateLeadNoteState(); };
        reader.onerror = () => { attachment.loading = false; renderLeadNoteAttachments(); updateLeadNoteState(); };
        reader.readAsDataURL(file);
      }
    });
    if (files.length > remaining) qtShowSnackbar('Only the first ' + remaining + ' files were attached.', 'warning');
    input.value = '';
    renderLeadNoteAttachments(); updateLeadNoteState();
  }
  function removeLeadNoteAttachment(index) {
    leadNotePendingAttachments.splice(index, 1);
    renderLeadNoteAttachments(); updateLeadNoteState();
  }
  function cancelLeadNote() {
    leadNoteTitle.value = ''; leadNoteEditor.innerHTML = ''; leadNoteComposer.classList.remove('is-editing'); leadMentionMenu.hidden = true;
    leadNotePendingAttachments = []; renderLeadNoteAttachments();
    document.getElementById('leadNoteReminder').classList.remove('open'); clearLeadNoteFollowUp(); document.getElementById('leadNoteAttachment').value = ''; updateLeadNoteState();
  }
  function saveLeadNote() {
    if (ldpIdx === null || leadNoteSave.disabled) return;
    const l = CRM_LEADS[ldpIdx]; const clean = sanitizeLeadNoteHtml(leadNoteEditor.innerHTML); const followUpValue = document.getElementById('leadNoteFollowUpAt').value;
    const followUp = followUpValue ? new Date(followUpValue) : null;
    l.notes.push({
      id: l.leadId + '-note-' + Date.now(), title: leadNoteTitle.value.trim() || 'Note', bodyHtml: clean,
      mentions: leadMentionsFromHtml(clean), author: CRM_CURRENT_USER, createdAt: new Date().toISOString(),
      followUpAt: followUp && !Number.isNaN(followUp.getTime()) ? followUp.toISOString() : '',
      followUpStatus: followUp && !Number.isNaN(followUp.getTime()) ? 'open' : '', followUpCompletedAt: '',
      mentionReadAt: '', reactions: {}, replies: [], attachments: leadNotePendingAttachments.map(file => ({
        name: file.name, type: file.type, size: file.size, isImage: file.isImage, dataUrl: file.dataUrl
      }))
    });
    saveLeadState(); renderLeadFocus(l); renderLdpHistory(l); renderLeadAiSummary(l); renderLeads(); cancelLeadNote(); qtShowSnackbar('Note saved to Lead History.', 'success');
  }
  leadNoteEditor.addEventListener('focus', () => leadNoteComposer.classList.add('is-editing'));
  leadNoteTitle.addEventListener('input', updateLeadNoteState);
  leadNoteEditor.addEventListener('input', () => { updateLeadNoteState(); const text = leadNoteEditor.innerText || ''; leadMentionMenu.hidden = !/(^|\s)@[\w ()-]*$/.test(text); });
  document.querySelectorAll('.ldm-format-btn').forEach(btn => btn.addEventListener('mousedown', e => e.preventDefault()));
  document.addEventListener('click', e => {
    if (!e.target.closest('#leadMentionMenu') && !e.target.closest('[aria-label="Mention a person"]') && !e.target.closest('#leadNoteEditor')) leadMentionMenu.hidden = true;
    if (!e.target.closest('#leadNoteDateTime') && !e.target.closest('[aria-label="Set follow-up date"]')) closeLeadNoteDateTimePicker();
  });

  function setLeadDrawerTab(name, button) {
    activeLeadDrawerTab = name;
    document.querySelectorAll('#ldp-tabs .ldm-tab').forEach(tab => tab.classList.toggle('active', tab === button));
    document.querySelectorAll('[data-lead-panel]').forEach(panel => { panel.hidden = panel.dataset.leadPanel !== name; panel.classList.toggle('active', panel.dataset.leadPanel === name); });
    if (name === 'meeting') resetLeadMeetingComposer();
  }

  function resetLeadMeetingComposer() {
    if (ldpIdx === null) return;
    document.getElementById('leadMeetingTitle').value = '';
    const date = document.getElementById('leadMeetingDate');
    date.min = ddTodayIso(); date.value = '';
    const time = document.getElementById('leadMeetingTime');
    time.innerHTML = meetingTimeOptionsHtml(''); time.value = '';
    document.getElementById('leadMeetingDuration').value = '';
    document.getElementById('leadMeetingAgenda').value = '';
    document.getElementById('leadMeetingManualLink').value = '';
    document.getElementById('leadMeetingAddress').value = '';
    document.getElementById('leadMeetingValidation').textContent = '';
    addDefaultLeadMeetingAttendees();
    const attendeeInput = document.getElementById('leadMeetingAttendeeInput');
    if (attendeeInput) attendeeInput.value = '';
    applyMeetingProvider('', 'lead');
    renderMeetingProviderStates();
  }

  function addDefaultLeadMeetingAttendees() {
    if (ldpIdx === null) return;
    const lead = CRM_LEADS[ldpIdx];
    leadMeetingDraftAttendees = [lead.contact, lead.owner].filter((name, index, list) =>
      name && list.findIndex(item => String(item).toLowerCase() === String(name).toLowerCase()) === index
    );
    renderLeadMeetingAttendees();
  }

  function renderLeadMeetingAttendees() {
    const chips = document.getElementById('leadMeetingAttendeeChips');
    if (!chips) return;
    chips.innerHTML = leadMeetingDraftAttendees.map((name, index) =>
      '<span class="dd-meeting-attendee-chip">' +
        '<i class="fai">&#xf007;</i><span>' + escapeLeadNoteText(name) + '</span>' +
        '<button type="button" class="lead-meeting-attendee-remove" aria-label="Remove ' + escapeLeadNoteText(name) + '" onclick="removeLeadMeetingAttendee(' + index + ', event)"><i class="fai">&#xf00d;</i></button>' +
      '</span>'
    ).join('');
  }

  function addLeadMeetingAttendee(value) {
    String(value || '').split(/[,;]+/).map(item => item.trim()).filter(Boolean).forEach(name => {
      if (!leadMeetingDraftAttendees.some(item => String(item).toLowerCase() === name.toLowerCase())) {
        leadMeetingDraftAttendees.push(name);
      }
    });
    renderLeadMeetingAttendees();
  }

  function commitLeadMeetingAttendeeInput() {
    const input = document.getElementById('leadMeetingAttendeeInput');
    if (!input || !input.value.trim()) return;
    addLeadMeetingAttendee(input.value);
    input.value = '';
  }

  function handleLeadMeetingAttendeeKeydown(event) {
    const input = event.currentTarget;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitLeadMeetingAttendeeInput();
      return;
    }
    if (event.key === 'Backspace' && !input.value && leadMeetingDraftAttendees.length) {
      leadMeetingDraftAttendees.pop();
      renderLeadMeetingAttendees();
    }
  }

  function removeLeadMeetingAttendee(index, event) {
    if (event) event.stopPropagation();
    leadMeetingDraftAttendees.splice(index, 1);
    renderLeadMeetingAttendees();
    focusLeadMeetingAttendeeInput();
  }

  function focusLeadMeetingAttendeeInput() {
    const input = document.getElementById('leadMeetingAttendeeInput');
    if (input) input.focus();
  }

  function createLeadMeeting() {
    if (ldpIdx === null) return;
    const lead = CRM_LEADS[ldpIdx];
    const title = document.getElementById('leadMeetingTitle').value.trim();
    const date = document.getElementById('leadMeetingDate').value;
    const time = document.getElementById('leadMeetingTime').value;
    const duration = Number(document.getElementById('leadMeetingDuration').value);
    const validation = document.getElementById('leadMeetingValidation');
    const manualLink = document.getElementById('leadMeetingManualLink').value.trim();
    const address = document.getElementById('leadMeetingAddress').value.trim();
    if (!title || !date || !time || !duration || !leadMeetingProvider) {
      validation.textContent = 'Add a title, date, time, duration and meeting method.'; return;
    }
    if (leadMeetingProvider === 'manual' && !ddValidMeetingLink(manualLink)) {
      validation.textContent = 'Enter a valid meeting link beginning with http:// or https://.'; return;
    }
    if (leadMeetingProvider === 'in-person' && !address) {
      validation.textContent = 'Add the meeting address.'; return;
    }
    const start = new Date(date + 'T' + time);
    if (Number.isNaN(start.getTime())) { validation.textContent = 'Choose a valid meeting date and time.'; return; }
    const id = lead.leadId + '-meeting-' + Date.now();
    const providerLabel = leadMeetingProvider === 'in-person' ? 'In person' : ddManualMeetingLabel(manualLink);
    const link = leadMeetingProvider === 'in-person' ? '' : manualLink;
    lead.activities.push({
      id, type: 'meeting', title, dueAt: start.toISOString(), date, time, duration,
      provider: leadMeetingProvider, providerLabel, link, address,
      attendees: leadMeetingDraftAttendees.slice(), agenda: document.getElementById('leadMeetingAgenda').value.trim(),
      status: 'scheduled', owner: lead.owner, createdAt: new Date().toISOString()
    });
    refreshLeadNextFromActivities(lead); saveLeadState(); renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads();
    resetLeadMeetingComposer(); qtShowSnackbar(title + ' scheduled for this Lead.', 'success');
  }

  function clearLeadActivityForm() {
    const date = new Date(); date.setDate(date.getDate() + 1);
    document.getElementById('leadActivityType').value = 'call'; document.getElementById('leadActivityTitle').value = '';
    document.getElementById('leadActivityDate').value = leadLocalIsoDate(date); document.getElementById('leadActivityTime').value = '09:00';
  }

  function leadActivityTypeLabel(type) { return ({ meeting: 'Meeting', call: 'Call', 'site-visit': 'Site visit', qualification: 'Qualification call', other: 'Activity' })[type] || 'Activity'; }
  function leadActivityIcon(type) { return ({ meeting: '&#xf073;', call: '&#xf095;', 'site-visit': '&#xf3c5;', qualification: '&#xf2b5;', other: '&#xf017;' })[type] || '&#xf017;'; }
  function saveLeadActivity() {
    if (ldpIdx === null) return;
    const lead = CRM_LEADS[ldpIdx]; const type = document.getElementById('leadActivityType').value;
    const title = document.getElementById('leadActivityTitle').value.trim() || leadActivityTypeLabel(type);
    const date = document.getElementById('leadActivityDate').value; const time = document.getElementById('leadActivityTime').value;
    if (!date || !time) { qtShowSnackbar('Choose an activity date and time.', 'error'); return; }
    lead.activities.push({ id: lead.leadId + '-activity-' + Date.now(), type, title, dueAt: new Date(date + 'T' + time).toISOString(), status: 'scheduled', owner: lead.owner, createdAt: new Date().toISOString() });
    refreshLeadNextFromActivities(lead); saveLeadState(); renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); clearLeadActivityForm();
    qtShowSnackbar(title + ' added to Lead Activity.', 'success');
  }

  const LEAD_FILE_MAX_BYTES = 25 * 1024 * 1024;
  const LEAD_FILE_PREVIEW_MAX_BYTES = 5 * 1024 * 1024;
  const LEAD_FILE_EXTENSIONS = /\.(pdf|docx?|xlsx?|csv|txt|png|jpe?g|gif|webp|bmp|svg)$/i;
  function setLeadFileValidation(message) {
    const validation = document.getElementById('leadFileValidation');
    if (validation) validation.textContent = message || '';
  }
  function setLeadFileDrag(active, event) {
    if (event) event.preventDefault();
    const dropzone = document.getElementById('leadFileDropzone');
    if (dropzone) dropzone.classList.toggle('dragging', Boolean(active));
  }
  function handleLeadFileDrop(event) {
    event.preventDefault();
    setLeadFileDrag(false);
    saveLeadFiles(event.dataTransfer && event.dataTransfer.files);
  }
  function handleLeadFileSelect(input) {
    saveLeadFiles(input && input.files);
    if (input) input.value = '';
  }
  function saveLeadFile(input) { handleLeadFileSelect(input); }
  function leadFileRecord(lead, file, index) {
    const record = {
      id: lead.leadId + '-file-' + Date.now() + '-' + index, name: file.name, type: file.type || '', size: file.size || 0,
      isImage: /^image\//i.test(file.type || '') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.name || ''),
      dataUrl: '', owner: lead.owner, author: CRM_CURRENT_USER, createdAt: new Date().toISOString()
    };
    if (!record.isImage || file.size > LEAD_FILE_PREVIEW_MAX_BYTES) return Promise.resolve(record);
    return new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => { record.dataUrl = typeof reader.result === 'string' ? reader.result : ''; resolve(record); };
      reader.onerror = () => resolve(record);
      reader.readAsDataURL(file);
    });
  }
  async function saveLeadFiles(fileList) {
    if (ldpIdx === null || !fileList || !fileList.length) return;
    const files = Array.from(fileList);
    const invalid = files.filter(file => file.size > LEAD_FILE_MAX_BYTES || !LEAD_FILE_EXTENSIONS.test(file.name || ''));
    const valid = files.filter(file => file.size <= LEAD_FILE_MAX_BYTES && LEAD_FILE_EXTENSIONS.test(file.name || ''));
    if (invalid.length) {
      const tooLarge = invalid.filter(file => file.size > LEAD_FILE_MAX_BYTES).length;
      setLeadFileValidation(tooLarge ? tooLarge + ' file' + (tooLarge === 1 ? ' is' : 's are') + ' larger than 25MB.' : 'Use PDF, Word, Excel, text or image files.');
    } else setLeadFileValidation('');
    if (!valid.length) return;
    const lead = CRM_LEADS[ldpIdx];
    const records = await Promise.all(valid.map((file, index) => leadFileRecord(lead, file, index)));
    lead.files.push(...records);
    saveLeadState(); renderLdpHistory(lead); updateLeadChannelPanels(lead);
    qtShowSnackbar(records.length + ' ' + (records.length === 1 ? 'file' : 'files') + ' added to Lead Files.', 'success');
  }

  function updateLeadChannelPanels(lead) {
    const files = lead.files || []; const count = files.length;
    document.getElementById('leadFilesPanelCount').textContent = count ? count + ' attached ' + (count === 1 ? 'file' : 'files') : 'No files attached yet';
    const list = document.getElementById('leadFilesPanelList');
    if (!list) return;
    list.innerHTML = files.map(file => {
      const preview = leadFilePreviewButtonHtml(file);
      return '<div class="lead-files-panel-item">' + preview + '<div class="meta"><b>' + escapeLeadNoteText(file.name) + '</b><span>' + leadTimestamp(file.createdAt) + ' · ' + escapeLeadNoteText(ownerDisplay(file.author || file.owner || lead.owner)) + '</span></div><div class="lead-file-actions"><button type="button"' + (file.dataUrl ? '' : ' disabled') + ' onclick="openLeadFilePreview(\'' + file.id + '\',event)"><i class="fai">&#xf06e;</i> Preview</button><button type="button" class="danger" onclick="deleteLeadFile(\'' + file.id + '\',event)"><i class="fai">&#xf1f8;</i> Delete</button></div></div>';
    }).join('');
  }

  function leadFilePreviewButtonHtml(file) {
    const preview = file.isImage && file.dataUrl ? '<img src="' + file.dataUrl + '" alt="">' : '<i class="fai">&#xf15b;</i>';
    return '<button type="button" class="lead-file-thumbnail"' + (file.dataUrl ? ' onclick="openLeadFilePreview(\'' + file.id + '\',event)"' : ' disabled') + ' aria-label="Preview ' + archiveEscape(file.name) + '">' + preview + '</button>';
  }

  function ensureLeadFilePreviewDialog() {
    let overlay = document.getElementById('leadFilePreviewOverlay');
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'leadFilePreviewOverlay'; overlay.className = 'lead-file-preview-overlay';
    overlay.innerHTML = '<div class="lead-file-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="leadFilePreviewTitle" onclick="event.stopPropagation()"><header><b id="leadFilePreviewTitle">File preview</b><button type="button" onclick="closeLeadFilePreview()" aria-label="Close preview"><i class="fai">&#xf00d;</i></button></header><div class="lead-file-preview-stage"><img id="leadFilePreviewImage" alt=""></div></div>';
    overlay.addEventListener('click', closeLeadFilePreview);
    document.body.appendChild(overlay);
    return overlay;
  }

  function openLeadFilePreview(id, event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    const file = (CRM_LEADS[ldpIdx].files || []).find(item => String(item.id) === String(id));
    if (!file || !file.dataUrl) {
      qtShowSnackbar('Preview is unavailable for this file. Upload it again to create a preview.', 'error'); return;
    }
    const overlay = ensureLeadFilePreviewDialog();
    document.getElementById('leadFilePreviewTitle').textContent = file.name;
    document.getElementById('leadFilePreviewImage').src = file.dataUrl;
    overlay.classList.add('open');
    document.body.classList.add('no-scroll');
  }

  function closeLeadFilePreview() {
    const overlay = document.getElementById('leadFilePreviewOverlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    const image = document.getElementById('leadFilePreviewImage');
    if (image) image.removeAttribute('src');
    document.body.classList.remove('no-scroll');
  }

  function deleteLeadFile(id, event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    const lead = CRM_LEADS[ldpIdx]; const file = (lead.files || []).find(item => String(item.id) === String(id));
    if (!file || !window.confirm('Delete “' + file.name + '”?')) return;
    lead.files = lead.files.filter(item => String(item.id) !== String(id));
    closeLeadFilePreview(); saveLeadState(); renderLdpHistory(lead); updateLeadChannelPanels(lead);
    qtShowSnackbar(file.name + ' deleted from Lead Files.', 'success');
  }

  function ownerDisplay(name) { return name && name.startsWith('Lee') ? 'Lee (You)' : name; }

  function leadOpportunitySize(value) {
    if (value == null) return 'Not qualified';
    if (value >= 100000) return 'Major';
    if (value >= 50000) return 'Large';
    if (value >= 20000) return 'Medium';
    return 'Small';
  }

  function renderLeadAiSummary(l) {
    if (!document.getElementById('ldp-ai-value')) return;
    const value = l.est == null ? 'Not set' : fmt(l.est);
    const size = leadOpportunitySize(l.est);
    const priority = l.labels && l.labels.length ? l.labels.join(' / ') : 'Unlabelled';
    const interests = l.interests && l.interests.length ? l.interests.join(', ') : 'requirements not yet captured';
    const subject = l.contact + (l.org ? ' from ' + l.org : '');
    const noteCount = (l.notes || []).length;
    const summary = l.est == null
      ? subject + ' is interested in ' + interests + '. The opportunity value is not set yet, so budget qualification should happen before forecasting.'
      : subject + ' is interested in ' + interests + '. This is a ' + size.toLowerCase() + ' opportunity with an estimated value of ' + value + ', currently marked ' + priority + '.';
    let next = 'Set a next activity to keep this Lead moving.';
    let overdue = false;
    if (l.next) {
      overdue = !!l.next.over;
      next = (overdue ? 'Overdue — ' : '') + l.next.txt + ' · ' + l.next.when + '.';
    } else if (l.labels && l.labels.includes('Hot')) {
      next = 'Schedule a follow-up call today to confirm scope, budget and timeline.';
    }

    document.getElementById('ldp-ai-value').textContent = value;
    document.getElementById('ldp-ai-size').textContent = size;
    document.getElementById('ldp-ai-priority').textContent = priority;
    document.getElementById('ldp-ai-summary').textContent = summary;
    const nextEl = document.getElementById('ldp-ai-next');
    nextEl.textContent = next;
    nextEl.classList.toggle('overdue', overdue);
    document.getElementById('ldp-ai-basis').textContent = 'Based on Lead details, next activity' + (noteCount ? ' and ' + noteCount + ' saved note' + (noteCount === 1 ? '' : 's') : ' and recent activity');
  }

  function refreshLeadAiSummary() {
    if (ldpIdx === null) return;
    const button = document.querySelector('.ldm-ai-refresh .fai');
    if (!button) return;
    button.style.transform = 'rotate(180deg)';
    button.style.transition = 'transform .25s ease';
    renderLeadAiSummary(CRM_LEADS[ldpIdx]);
    setTimeout(() => { button.style.transform = ''; }, 260);
    qtShowSnackbar('AI summary refreshed from the latest Lead activity.', 'success');
  }

  function renderLdpValue(l) {
    const el = document.getElementById('ldp-value');
    el.textContent = l.est != null ? fmt(l.est) : 'Add value';
    el.classList.toggle('link', l.est == null);
    el.hidden = false;
    const row = document.getElementById('ldp-value-row');
    const editor = document.getElementById('ldp-value-editor');
    const input = document.getElementById('ldp-value-input');
    if (row) row.classList.remove('is-editing');
    if (editor) editor.hidden = true;
    if (input) input.removeAttribute('aria-invalid');
  }

  function renderLdpMetadata(l) {
    document.getElementById('ldp-labels').innerHTML = readonlyLabelChips(l.labels);
    const interests = (l.interests || []);
    document.getElementById('ldp-interests').innerHTML = interests.length
      ? interests.map(item => '<span class="ldm-interest-chip">' + escapeLeadNoteText(item) + '</span>').join('')
      : '<span class="l-dim">—</span>';
    document.getElementById('ldp-owner').textContent = ownerDisplay(l.owner);
    const company = document.getElementById('ldp-company');
    if (company) company.innerHTML = '<i class="fai">&#xf1ad;</i>' + escapeLeadNoteText(owningCompanyName(l));
    const sourceSelect = document.getElementById('ldp-source');
    const source = l.source || 'Other';
    if (sourceSelect && ![...sourceSelect.options].some(option => option.value === source)) {
      sourceSelect.add(new Option(source, source));
    }
    if (sourceSelect) sourceSelect.value = source;
  }

  function renderLdpOrg(l) {
    const ico = document.getElementById('ldp-org-ico');
    const val = document.getElementById('ldp-org');
    if (l.org) {
      ico.className = 'fai';
      val.textContent = l.org;
    } else {
      ico.className = 'fai disabled';
      val.textContent = '+ Link an organization';
    }
  }

  const LEAD_PROJECT_OPTIONS = ['Residential AV Installation', 'Show Flat Programme', 'Cinema Upgrade Programme'];
  let leadProjectMode = '';
  function renderLdpProject(l) {
    const slot = document.getElementById('ldp-project-slot');
    if (!slot) return;
    if (l.project) {
      slot.innerHTML = '<div class="ldm-row"><i class="fai">&#xf024;</i><span class="val">' + escapeLeadNoteText(l.project) + '</span><button type="button" class="dd-contact-edit" onclick="startLeadProjectEdit(\'edit\',event)" aria-label="Edit project"><i class="fai">&#xf304;</i></button></div>';
      return;
    }
    slot.innerHTML = '<div class="ldm-row"><i class="fai disabled">&#xf024;</i><button type="button" class="dd-linkbtn" onclick="startLeadProjectEdit(\'add\',event)">Add project</button></div>' +
      '<div class="ldm-row"><i class="fai disabled">&#xf0c1;</i><button type="button" class="dd-linkbtn" onclick="startLeadProjectEdit(\'link\',event)">Link project</button></div>';
  }
  function startLeadProjectEdit(mode, event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    leadProjectMode = mode;
    const lead = CRM_LEADS[ldpIdx];
    const slot = document.getElementById('ldp-project-slot');
    const field = mode === 'link'
      ? '<select id="ldp-project-input" aria-label="Choose project">' + LEAD_PROJECT_OPTIONS.map(name => '<option>' + escapeLeadNoteText(name) + '</option>').join('') + '</select>'
      : '<input id="ldp-project-input" type="text" maxlength="90" aria-label="Project name" value="' + archiveEscape(lead.project || '') + '" placeholder="Project name">';
    slot.innerHTML = '<div class="ldm-project-editor">' + field + '<button type="button" class="save" onclick="saveLeadProject(event)" aria-label="Save project"><i class="fai">&#xf00c;</i></button><button type="button" onclick="cancelLeadProjectEdit(event)" aria-label="Cancel"><i class="fai">&#xf00d;</i></button></div>';
    setTimeout(() => { const input = document.getElementById('ldp-project-input'); if (input) input.focus(); }, 0);
  }
  function saveLeadProject(event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    const input = document.getElementById('ldp-project-input');
    const name = input ? input.value.trim() : '';
    if (!name) { qtShowSnackbar('Add or choose a project name.', 'error'); return; }
    const lead = CRM_LEADS[ldpIdx];
    const linked = leadProjectMode === 'link';
    lead.project = name;
    leadProjectMode = '';
    saveLeadState(); renderLdpProject(lead);
    qtShowSnackbar(linked ? 'Project linked to this Lead.' : 'Project saved to this Lead.', 'success');
  }
  function cancelLeadProjectEdit(event) {
    if (event) event.stopPropagation();
    leadProjectMode = '';
    if (ldpIdx !== null) renderLdpProject(CRM_LEADS[ldpIdx]);
  }

  function leadInitials(name) { return String(name || '?').split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(); }
  function leadOwnerHtml(name) { return '<span class="ldm-history-owner"><span>' + escapeLeadNoteText(leadInitials(name)) + '</span>' + escapeLeadNoteText(ownerDisplay(name || 'Unassigned')) + '</span>'; }
  function leadFindNote(id) { return ldpIdx === null ? null : (CRM_LEADS[ldpIdx].notes || []).find(note => String(note.id) === String(id)); }
  function leadFindActivity(id) { return ldpIdx === null ? null : (CRM_LEADS[ldpIdx].activities || []).find(activity => String(activity.id) === String(id)); }
  function leadNotePlainText(html) { const template = document.createElement('template'); template.innerHTML = html || ''; return template.content.textContent || ''; }
  function leadTimestamp(value) {
    const date = new Date(value); return Number.isNaN(date.getTime()) ? escapeLeadNoteText(value || '') : date.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function completeLeadActivity(id, event) {
    if (event) event.stopPropagation(); const lead = CRM_LEADS[ldpIdx]; const activity = leadFindActivity(id);
    if (!activity || activity.status === 'completed') return;
    activity.status = 'completed'; activity.completedAt = new Date().toISOString(); refreshLeadNextFromActivities(lead); saveLeadState();
    renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); qtShowSnackbar(activity.title + ' marked complete.', 'success');
  }
  function reopenLeadActivity(id, event) {
    if (event) event.stopPropagation(); const lead = CRM_LEADS[ldpIdx]; const activity = leadFindActivity(id);
    if (!activity || activity.status !== 'completed') return;
    activity.status = 'scheduled'; delete activity.completedAt; refreshLeadNextFromActivities(lead); saveLeadState();
    renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); qtShowSnackbar(activity.title + ' reopened.', 'success');
  }
  function copyLeadMeetingLink(id, event) {
    if (event) event.stopPropagation(); const meeting = leadFindActivity(id);
    if (!meeting || !meeting.link) return;
    navigator.clipboard.writeText(meeting.link).then(() => qtShowSnackbar('Meeting link copied.', 'success')).catch(() => qtShowSnackbar(meeting.link));
  }
  function completeLeadNoteFollowUp(id, event) {
    if (event) event.stopPropagation(); const lead = CRM_LEADS[ldpIdx]; const note = leadFindNote(id);
    if (!note || note.followUpStatus === 'completed') return;
    note.followUpStatus = 'completed'; note.followUpCompletedAt = new Date().toISOString(); saveLeadState();
    renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); qtShowSnackbar(note.title + ' follow-up marked complete.', 'success');
  }
  function reopenLeadNoteFollowUp(id, event) {
    if (event) event.stopPropagation(); const lead = CRM_LEADS[ldpIdx]; const note = leadFindNote(id);
    if (!note || note.followUpStatus !== 'completed') return;
    note.followUpStatus = 'open'; delete note.followUpCompletedAt; saveLeadState();
    renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); qtShowSnackbar(note.title + ' follow-up reopened.', 'success');
  }
  function toggleLeadNoteReaction(id, event) {
    if (event) event.stopPropagation(); const note = leadFindNote(id); if (!note) return;
    const people = Array.isArray(note.reactions['👍']) ? note.reactions['👍'] : [];
    note.reactions['👍'] = people.includes(CRM_CURRENT_USER) ? people.filter(name => name !== CRM_CURRENT_USER) : people.concat(CRM_CURRENT_USER);
    saveLeadState(); renderLdpHistory(CRM_LEADS[ldpIdx]);
  }
  function replyToLeadNote(id, event) {
    if (event) event.stopPropagation(); const note = leadFindNote(id); if (!note) return;
    const body = prompt('Reply to this Note'); if (!body || !body.trim()) return;
    note.replies.push({ id: Date.now(), body: body.trim(), author: CRM_CURRENT_USER, createdAt: new Date().toISOString() });
    saveLeadState(); renderLdpHistory(CRM_LEADS[ldpIdx]); qtShowSnackbar('Reply added.', 'success');
  }
  function editLeadHistoryNote(id, event) {
    if (event) event.stopPropagation(); const note = leadFindNote(id); if (!note) return;
    const title = prompt('Note title', note.title); if (title === null) return;
    const body = prompt('Note content', leadNotePlainText(note.bodyHtml)); if (body === null) return;
    note.title = title.trim() || 'Note'; note.bodyHtml = escapeLeadNoteText(body).replace(/\n/g, '<br>'); note.mentions = []; note.editedAt = new Date().toISOString();
    saveLeadState(); renderLeadFocus(CRM_LEADS[ldpIdx]); renderLdpHistory(CRM_LEADS[ldpIdx]); renderLeadAiSummary(CRM_LEADS[ldpIdx]);
  }
  function deleteLeadHistoryNote(id, event) {
    if (event) event.stopPropagation(); const lead = CRM_LEADS[ldpIdx]; const note = leadFindNote(id); if (!note) return;
    if (!window.confirm('Delete “' + note.title + '”?')) return;
    lead.notes = lead.notes.filter(item => String(item.id) !== String(id)); saveLeadState(); renderLeadFocus(lead); renderLdpHistory(lead); renderLeadAiSummary(lead); renderLeads(); qtShowSnackbar('Note deleted.', 'success');
  }

  function viewLeadHistoryItem(kind, id) {
    if (ldpIdx === null) return; const lead = CRM_LEADS[ldpIdx];
    if (kind === 'note') {
      const note = leadFindNote(id);
      if (note && !note.followUpAt && (note.mentions || []).some(name => /lee/i.test(name))) { note.mentionReadAt = new Date().toISOString(); saveLeadState(); renderLeadFocus(lead); }
    }
    document.getElementById('leadHistoryFilter').value = 'all'; renderLdpHistory(lead);
    requestAnimationFrame(() => {
      const target = document.querySelector('[data-lead-' + kind + '-history="' + id + '"]');
      if (!target) return; target.scrollIntoView({ block: 'center', behavior: 'smooth' }); target.classList.add('is-targeted'); target.focus({ preventScroll: true });
      window.setTimeout(() => target.classList.remove('is-targeted'), 2200);
    });
  }

  function renderLeadFocus(lead) {
    const root = document.getElementById('ldp-focus-body'); const items = []; const now = new Date();
    (lead.activities || []).filter(activity => activity.status !== 'completed' && activity.status !== 'cancelled')
      .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt)).forEach(activity => {
        const overdue = new Date(activity.dueAt) < now;
        const isMeeting = activity.type === 'meeting';
        const typeLabel = leadActivityTypeLabel(activity.type);
        const focusLabel = isMeeting
          ? (overdue ? 'Meeting overdue' : 'Upcoming meeting')
          : (overdue ? typeLabel + ' overdue' : 'Upcoming ' + typeLabel.toLowerCase());
        const focusMeta = leadDateTimeLabel(activity.dueAt) + (isMeeting && activity.duration ? ' · ' + activity.duration + ' min' : '') + (isMeeting && activity.providerLabel ? ' · ' + escapeLeadNoteText(activity.providerLabel) : '');
        items.push('<div class="dd-focus-item lead-activity' + (isMeeting ? ' meeting' : '') + (overdue ? ' overdue' : '') + '" tabindex="-1"><button type="button" class="dd-focus-item-main" onclick="viewLeadHistoryItem(\'activity\',\'' + activity.id + '\')"><i class="fai">' + leadActivityIcon(activity.type) + '</i><span><b>' + focusLabel + '</b> &mdash; ' + escapeLeadNoteText(activity.title) + '<span class="dd-focus-meeting-meta">' + focusMeta + '</span></span></button><button type="button" class="wq-btn wq-btn-neutral dd-focus-complete" onclick="completeLeadActivity(\'' + activity.id + '\',event)"><i class="fai">&#xf00c;</i> Mark complete</button></div>');
      });
    (lead.notes || []).filter(note => note.followUpAt && note.followUpStatus !== 'completed')
      .sort((a, b) => Date.parse(a.followUpAt) - Date.parse(b.followUpAt)).forEach(note => {
        const overdue = new Date(note.followUpAt) < now;
        items.push('<div class="dd-focus-item note-followup' + (overdue ? ' overdue' : '') + '" tabindex="-1"><button type="button" class="dd-focus-item-main" onclick="viewLeadHistoryItem(\'note\',\'' + note.id + '\')"><i class="fai">&#xf249;</i><span><b>' + (overdue ? 'Note overdue' : 'Note follow-up') + '</b> &mdash; ' + escapeLeadNoteText(note.title) + '<span class="dd-focus-meeting-meta">Due ' + leadDateTimeLabel(note.followUpAt) + (note.mentions.length ? ' · ' + note.mentions.map(name => '@' + escapeLeadNoteText(name)).join(' · ') : '') + '</span></span></button><button type="button" class="wq-btn wq-btn-neutral dd-focus-complete" onclick="completeLeadNoteFollowUp(\'' + note.id + '\',event)"><i class="fai">&#xf00c;</i> Mark complete</button></div>');
      });
    const mention = (lead.notes || []).slice().reverse().find(note => !note.followUpAt && !note.mentionReadAt && (note.mentions || []).some(name => /lee/i.test(name)));
    if (mention) items.push('<button type="button" class="dd-focus-item mention" onclick="viewLeadHistoryItem(\'note\',\'' + mention.id + '\')"><span class="dd-focus-mention-icon">@</span><div><b>Mentioned in Note</b> &mdash; ' + escapeLeadNoteText(mention.title) + '<div class="dd-focus-meeting-meta">' + mention.mentions.map(name => '@' + escapeLeadNoteText(name)).join(' · ') + '</div></div><i class="fai dd-focus-open">&#xf061;</i></button>');
    root.innerHTML = items.length ? items.join('') : '<div class="ldm-focus-empty" id="ldp-focus-empty">No focus items yet</div>';
  }

  function renderLdpHistory(l) {
    if (!l) return;
    const filter = document.getElementById('leadHistoryFilter').value || 'all'; const events = [];
    (l.notes || []).forEach(note => events.push({ type: 'note', at: Date.parse(note.createdAt) || 0, note }));
    (l.activities || []).forEach(activity => events.push({ type: 'activity', at: Date.parse(activity.createdAt) || 0, activity }));
    (l.files || []).forEach(file => events.push({ type: 'file', at: Date.parse(file.createdAt) || 0, file }));
    events.push({ type: 'created', at: Date.parse(l.created) || 1 });
    const visible = events.filter(item => filter === 'all' || item.type === filter || (filter === 'activity' && item.type === 'created')).sort((a, b) => b.at - a.at);
    document.getElementById('ldp-hist').innerHTML = visible.map(item => {
      const railIcon = item.type === 'note' ? '&#xf304;' : item.type === 'file' ? '&#xf0c5;' : item.type === 'created' ? '&#xf2b9;' : leadActivityIcon(item.activity.type);
      let historyBody = '';
      if (item.type === 'note') {
        const note = item.note; const completed = note.followUpStatus === 'completed'; const reactionCount = (note.reactions['👍'] || []).length;
        const followUp = note.followUpAt ? '<div class="ldm-history-followup-row"><span class="ldm-history-followup' + (completed ? ' completed' : (new Date(note.followUpAt) < new Date() ? ' overdue' : '')) + '"><i class="fai">' + (completed ? '&#xf058;' : '&#xf017;') + '</i> ' + (completed ? 'Follow-up completed' : 'Follow up ' + leadDateTimeLabel(note.followUpAt)) + '</span>' + (completed ? '<button type="button" class="ldm-history-link" onclick="reopenLeadNoteFollowUp(\'' + note.id + '\',event)"><i class="fai">&#xf2ea;</i> Reopen follow-up</button>' : '<button type="button" class="wq-btn wq-btn-primary" onclick="completeLeadNoteFollowUp(\'' + note.id + '\',event)"><i class="fai">&#xf058;</i> Mark complete</button>') + '</div>' : '';
        const attachments = note.attachments.length ? '<div class="ldm-history-attachments">' + note.attachments.map(file => {
          const content = (file.isImage && file.dataUrl ? '<img src="' + file.dataUrl + '" alt="">' : '<i class="fai">&#xf0c6;</i>') + '<span class="attachment-name">' + escapeLeadNoteText(file.name) + '</span>';
          return file.dataUrl ? '<a href="' + file.dataUrl + '" target="_blank" rel="noopener" title="Open attachment">' + content + '</a>' : '<span>' + content + '</span>';
        }).join('') + '</div>' : '';
        const replies = note.replies.length ? '<div class="ldm-history-replies">' + note.replies.map(reply => '<div><span>' + escapeLeadNoteText(leadInitials(reply.author)) + '</span><p><b>' + escapeLeadNoteText(ownerDisplay(reply.author)) + '</b>' + escapeLeadNoteText(reply.body) + '<small>' + leadTimestamp(reply.createdAt) + '</small></p></div>').join('') + '</div>' : '';
        historyBody = '<article class="ldm-history-card note" data-lead-note-history="' + note.id + '" tabindex="-1"><header><b>' + escapeLeadNoteText(note.title) + '</b><span><button type="button" onclick="editLeadHistoryNote(\'' + note.id + '\',event)" aria-label="Edit note"><i class="fai">&#xf304;</i></button><button type="button" onclick="deleteLeadHistoryNote(\'' + note.id + '\',event)" aria-label="Delete note"><i class="fai">&#xf1f8;</i></button></span></header><div class="body">' + note.bodyHtml + '</div>' + attachments + followUp + '<footer><time>' + leadTimestamp(note.createdAt) + (note.editedAt ? ' · Edited' : '') + '</time><div class="right"><button type="button" onclick="toggleLeadNoteReaction(\'' + note.id + '\',event)">☺ React' + (reactionCount ? ' · ' + reactionCount : '') + '</button><button type="button" onclick="replyToLeadNote(\'' + note.id + '\',event)"><i class="fai">&#xf3e5;</i> Reply' + (note.replies.length ? ' · ' + note.replies.length : '') + '</button>' + leadOwnerHtml(note.author) + '</div></footer>' + replies + '</article>';
      } else if (item.type === 'activity') {
        const activity = item.activity; const completed = activity.status === 'completed';
        const isMeeting = activity.type === 'meeting';
        const meetingMeta = isMeeting ? (activity.duration ? ' · ' + activity.duration + ' min' : '') + (activity.providerLabel ? ' · ' + escapeLeadNoteText(activity.providerLabel) : '') : '';
        const meetingAgenda = isMeeting && activity.agenda ? '<div class="ldm-history-meeting-agenda"><b>Agenda:</b> ' + escapeLeadNoteText(activity.agenda) + '</div>' : '';
        const linkAction = isMeeting && activity.link ? '<button type="button" class="wq-btn wq-btn-secondary" onclick="copyLeadMeetingLink(\'' + activity.id + '\',event)"><i class="fai">&#xf0c1;</i> Copy meeting link</button>' : '';
        const reopenLabel = isMeeting ? 'Reopen meeting' : 'Reopen activity';
        historyBody = '<article class="ldm-history-card activity' + (isMeeting ? ' meeting' : '') + '" data-lead-activity-history="' + activity.id + '" tabindex="-1"><header><b>' + escapeLeadNoteText(leadActivityTypeLabel(activity.type)) + '</b>' + (completed ? '<span class="ldm-history-completed"><i class="fai">&#xf058;</i> Completed</span>' : '') + '</header><div class="activity-title">' + escapeLeadNoteText(activity.title) + '</div><div class="activity-due">' + leadDateTimeLabel(activity.dueAt) + meetingMeta + '</div>' + meetingAgenda + '<footer><div class="ldm-history-activity-actions">' + (completed ? '<button type="button" class="wq-btn wq-btn-primary" onclick="reopenLeadActivity(\'' + activity.id + '\',event)"><i class="fai">&#xf2ea;</i> ' + reopenLabel + '</button>' : '<button type="button" class="wq-btn wq-btn-primary" onclick="completeLeadActivity(\'' + activity.id + '\',event)"><i class="fai">&#xf058;</i> Mark complete</button>') + linkAction + '</div><div class="right">' + leadOwnerHtml(activity.owner) + '</div></footer></article>';
      } else if (item.type === 'file') {
        const previewButton = leadFilePreviewButtonHtml(item.file);
        historyBody = '<article class="ldm-history-card file">' + previewButton + '<div><b>' + escapeLeadNoteText(item.file.name) + '</b><span>' + leadTimestamp(item.file.createdAt) + '</span></div><div class="lead-file-actions"><button type="button"' + (item.file.dataUrl ? '' : ' disabled') + ' onclick="openLeadFilePreview(\'' + item.file.id + '\',event)"><i class="fai">&#xf06e;</i> Preview</button><button type="button" class="danger" onclick="deleteLeadFile(\'' + item.file.id + '\',event)"><i class="fai">&#xf1f8;</i> Delete</button></div>' + leadOwnerHtml(item.file.author || item.file.owner || l.owner) + '</article>';
      } else {
        historyBody = '<article class="ldm-history-created"><div><b>Lead created</b><span>' + escapeLeadNoteText(l.created) + ' · ' + escapeLeadNoteText(ownerDisplay(l.owner)) + '</span></div></article>';
      }
      return '<div class="dd-hist-item ldm-history-item"><div class="dd-hist-rail"><span class="dd-hist-ico fai">' + railIcon + '</span></div><div class="dd-hist-body">' + historyBody + '</div></div>';
    }).join('') || '<div class="ldm-history-empty">No matching Lead activity.</div>';
  }

  function getVisibleLeadIndices() {
    const q = (leadSearchQuery || '').toLowerCase();
    return CRM_LEADS.map((l, i) => i)
      .filter(i => leadTab === 'inbox' ? CRM_LEADS[i].status === 'open' : CRM_LEADS[i].status !== 'open')
      .filter(i => owningCompanyMatches(CRM_LEADS[i]))
      .filter(i => !q || CRM_LEADS[i].title.toLowerCase().includes(q) || CRM_LEADS[i].owner.toLowerCase().includes(q));
  }

  function openLeadPanel(i) {
    cancelLeadNote();
    closeLabelPicker();
    closeOrganisationPicker();
    closeLeadOwnerPicker();
    ldpIdx = i;
    const l = CRM_LEADS[i];

    document.getElementById('ldp-title').textContent = l.title;
    renderLdpMetadata(l);
    renderLdpValue(l);
    renderLdpOrg(l);
    renderLdpProject(l);
    leadContactTab = 'primary';
    leadContactEditing = '';
    setLeadContactTab('primary', document.querySelector('#leadDrawer .ldm-contact-tabs .it-tab'));
    refreshLeadNextFromActivities(l);
    renderLeadFocus(l);
    document.getElementById('leadHistoryFilter').value = 'all';
    renderLdpHistory(l);
    renderLeadAiSummary(l);
    updateLeadChannelPanels(l);
    setLeadFileValidation('');
    setLeadDrawerTab('notes', document.querySelector('#ldp-tabs [data-lead-tab="notes"]'));

    const cvt = document.getElementById('ldp-convert');
    cvt.style.display = l.status === 'open' ? '' : 'none'; // converted/discarded leads are read-only (L1)
    cvt.onclick = () => { closeLeadPanel(); openConvert(i); };

    const visible = getVisibleLeadIndices();
    const pos = visible.indexOf(i);
    document.getElementById('ldp-prev').disabled = pos <= 0;
    document.getElementById('ldp-next').disabled = pos === -1 || pos >= visible.length - 1;

    leadDrawer.classList.add('open');
  }
  function closeLeadPanel() {
    cancelLeadNote();
    closeLeadFilePreview();
    closeLabelPicker();
    closeOrganisationPicker();
    closeLeadOwnerPicker();
    leadDrawer.classList.remove('open');
  }
  leadDrawer.addEventListener('click', e => { if (e.target === leadDrawer) closeLeadPanel(); });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    const filePreview = document.getElementById('leadFilePreviewOverlay');
    if (filePreview && filePreview.classList.contains('open')) { closeLeadFilePreview(); return; }
    const orgMenu = document.getElementById('organisationPickerMenu');
    const ownerMenu = document.getElementById('leadOwnerPickerMenu');
    const labelMenu = document.getElementById('labelPickerMenu');
    if (ownerMenu && ownerMenu.classList.contains('open')) { closeLeadOwnerPicker(); return; }
    if (orgMenu && orgMenu.classList.contains('open')) { closeOrganisationPicker(); return; }
    if (labelMenu && labelMenu.classList.contains('open')) { closeLabelPicker(); return; }
    if (leadDrawer.classList.contains('open')) closeLeadPanel();
  });

  function navLeadPanel(dir) {
    const visible = getVisibleLeadIndices();
    const pos = visible.indexOf(ldpIdx);
    if (pos === -1) return;
    const nextPos = pos + dir;
    if (nextPos < 0 || nextPos >= visible.length) return;
    openLeadPanel(visible[nextPos]);
  }

  function copyLeadLink() {
    const url = window.location.href.split('#')[0] + '#lead-' + ldpIdx;
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).catch(() => {});
  }

  function editLeadTitle() {
    const l = CRM_LEADS[ldpIdx];
    const next = prompt('Lead title', l.title);
    if (!next || !next.trim()) return;
    l.title = next.trim();
    document.getElementById('ldp-title').textContent = l.title;
    saveLeadState();
    renderLeads();
  }

  function editLeadValue(event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    const row = document.getElementById('ldp-value-row');
    const editor = document.getElementById('ldp-value-editor');
    const input = document.getElementById('ldp-value-input');
    const value = document.getElementById('ldp-value');
    if (!row || !editor || !input || row.classList.contains('is-editing')) return;
    row.classList.add('is-editing');
    value.hidden = true;
    editor.hidden = false;
    input.value = CRM_LEADS[ldpIdx].est != null ? CRM_LEADS[ldpIdx].est : '';
    input.removeAttribute('aria-invalid');
    requestAnimationFrame(() => { input.focus(); input.select(); });
  }

  function cancelLeadValueEdit(event) {
    if (event) event.stopPropagation();
    const row = document.getElementById('ldp-value-row');
    const editor = document.getElementById('ldp-value-editor');
    const value = document.getElementById('ldp-value');
    const input = document.getElementById('ldp-value-input');
    if (row) row.classList.remove('is-editing');
    if (editor) editor.hidden = true;
    if (value) value.hidden = false;
    if (input) input.removeAttribute('aria-invalid');
  }

  function saveLeadValueInline(event) {
    if (event) event.stopPropagation();
    if (ldpIdx === null) return;
    const input = document.getElementById('ldp-value-input');
    const raw = input.value.trim();
    const num = raw === '' ? null : Number(raw);
    if (num != null && (!Number.isFinite(num) || num < 0)) {
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    const l = CRM_LEADS[ldpIdx];
    l.est = num;
    renderLdpValue(l);
    document.getElementById('ldp-value').hidden = false;
    renderLeadAiSummary(l);
    saveLeadState();
    renderLeads();
    qtShowSnackbar(num == null ? 'Estimated value cleared.' : 'Estimated value updated.', 'success');
  }

  function handleLeadValueKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveLeadValueInline(event);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelLeadValueEdit(event);
    }
  }

  function saveLeadSourceInline(value) {
    if (ldpIdx === null) return;
    const l = CRM_LEADS[ldpIdx];
    l.source = value || 'Other';
    renderLdpMetadata(l);
    saveLeadState();
    renderLeads();
    qtShowSnackbar('Lead source updated to ' + l.source + '.', 'success');
  }

  function editLeadLabels() {
    const l = CRM_LEADS[ldpIdx];
    const next = prompt('Labels (comma separated)', (l.labels || []).join(', '));
    if (next === null) return;
    l.labels = next.split(',').map(item => item.trim()).filter(Boolean);
    renderLdpMetadata(l);
    renderLeads();
  }

  function kebabDiscardFromDrawer() {
    if (ldpIdx === null) return;
    CRM_LEADS[ldpIdx].status = 'discarded';
    CRM_LEADS[ldpIdx].discard_reason = 'other';
    renderLeads();
    closeLeadPanel();
  }

  // ---------- Contact card (person popover) ----------
  const contactCardOverlay = document.getElementById('contactCardOverlay');
  function openContactCard(leadIdx) {
    const l = CRM_LEADS[leadIdx];
    document.getElementById('cc-av').textContent = l.contact.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('cc-name').textContent = l.contact;
    document.getElementById('cc-job').textContent = l.job || 'Primary contact';
    document.querySelector('#cc-phone span').textContent = l.phone || '\u2014';
    document.querySelector('#cc-email .mail').textContent = l.email || '\u2014';
    const orgEl = document.getElementById('cc-orgname');
    orgEl.textContent = l.org;
    orgEl.onclick = () => { closeContactCard(); closeLeadPanel(); openCustomerPage(leadIdx); };
    contactCardOverlay.classList.add('open');
  }
  function closeContactCard() { contactCardOverlay.classList.remove('open'); }
  contactCardOverlay.addEventListener('click', e => { if (e.target === contactCardOverlay) closeContactCard(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && contactCardOverlay.classList.contains('open')) closeContactCard();
  });

  // ---------- Customer record page (simplified; PRD §4.4) ----------
  function customerDeals(name) {
    return [...pipelineEl.querySelectorAll('.deal-card')]
      .filter(c => c._deal.c === name)
      .map(c => ({ t: c._deal.t, v: +c.dataset.v, stage: c.closest('.stage').querySelector('.stage-name').textContent }));
  }

  let cuIdx = null;
  function openCustomerPage(leadIdx) {
    cuIdx = leadIdx;
    const l = CRM_LEADS[leadIdx];
    const name = l.org || l.contact;
    document.getElementById('cu-av').textContent = name[0].toUpperCase();
    document.getElementById('cu-name').textContent = name;
    document.getElementById('cu-type').textContent = l.org ? 'Organisation' : 'Individual';
    const deals = customerDeals(name);
    document.getElementById('cu-prospect').style.display = (l.status === 'open' && !deals.length) ? '' : 'none';
    document.getElementById('cu-addr').textContent = l.site ? l.site : '\u2014';
    const cuContact = document.getElementById('cu-contact');
    cuContact.textContent = l.contact;
    cuContact.classList.toggle('ldp-linkable', !!l.org);
    cuContact.onclick = l.org ? (() => openContactCard(leadIdx)) : null;
    document.querySelector('#cu-phone span').textContent = l.phone || '\u2014';
    document.querySelector('#cu-email .mail').textContent = l.email || '\u2014';

    // Deals panel (left column)
    document.getElementById('cu-dealcount').textContent = deals.length;
    document.getElementById('cu-deals').innerHTML = deals.length
      ? deals.map(d => {
          const idx = CRM_STAGES.indexOf(d.stage);
          const bar = CRM_STAGES.map((_, k) => '<i class="' + (k <= idx ? 'on' : '') + '"></i>').join('');
          return '<div class="cu-deal-mini"><div class="nm">' + d.t + '</div>' +
            '<div class="rowb"><span class="cu-progress">' + bar + '</span>' +
            '<span class="val">' + fmt(d.v) + '</span></div>' +
            '<span class="stage-lbl">' + d.stage + '</span></div>';
        }).join('')
      : '<div class="cu-empty">No open deals \u2014 convert the lead or use + Deal.</div>';

    // Focus — next activity across this customer's lead/deals
    document.getElementById('cu-focus').innerHTML = (l.next && l.status !== 'discarded')
      ? '<div class="ld-focus"><span class="ld-focus-ico"><i class="fai">&#xf095;</i></span>' +
        '<div><div class="ld-focus-title">' + l.next.txt + '</div>' +
        '<div class="ld-focus-when' + (l.next.over ? ' over' : '') + '"><span>' + l.next.when + '</span>' +
        '<span class="who">' + l.owner + ' \u00b7 ' + name + (deals.length ? ' \u00b7 ' + deals[0].t : '') + '</span></div></div></div>'
      : '<div class="cu-empty" style="margin-bottom:14px;">No upcoming activity \u2014 add one above so this customer never goes quiet.</div>';

    // History — newest first
    let hist = '';
    deals.forEach(d => {
      hist += '<div class="ld-hist-item"><span class="dot-ico"><i class="fai">&#xf0d6;</i></span>' +
        '<div class="ld-created"><b>Deal created</b> \u2014 ' + d.t + ' <span class="val" style="font-weight:700;">' + fmt(d.v) + '</span>' +
        '<div class="meta">Today \u00b7 ' + l.owner + '</div></div></div>';
    });
    if (l.interests.length) {
      hist += '<div class="ld-hist-item"><span class="dot-ico"><i class="fai">&#xf249;</i></span>' +
        '<div class="ld-note">Interested in ' + l.interests.join(', ') + '.' +
        (l.labels.length ? ' Marked ' + l.labels.join('/') + '.' : '') +
        '<div class="meta">' + l.created + ' \u00b7 ' + l.owner + '</div></div></div>';
    }
    hist += '<div class="ld-hist-item"><span class="dot-ico"><i class="fai">&#xf2b9;</i></span>' +
      '<div class="ld-created"><b>Lead created</b> \u2014 <span class="ldp-linkable" onclick="showView(\'leads\')">' + l.title + '</span>' +
      ' <span class="lead-status ' + l.status + '">' + LEAD_STATUS_LABEL[l.status] + '</span>' +
      '<div class="meta">' + l.created + ' \u00b7 ' + l.owner + '</div></div></div>';
    hist += '<div class="ld-hist-item"><span class="dot-ico plain"></span>' +
      '<div class="ld-created"><b>Customer created</b> (with lead)<div class="meta">' + l.created + '</div></div></div>';
    document.getElementById('cu-hist').innerHTML = hist;

    showView('customer');
  }

  // ---------- Create / Convert Deal modal (Figma DS – WeQuote Platform, node 2490-80033) ----------
  // Shared by: Lead "Convert to Deal", customer page "+ Deal". Kept as one modal per the Figma component.
  const dealFormOverlay = document.getElementById('dealFormOverlay');
  const OWNER_COLORS = { 'Jeff Mitchel': '#7C3AED', 'Dave Lombard': '#0EA5E9', 'Sean Prater': '#1E8539',
                         'Gabriel Rivera': '#F59E0B', 'Patrick Burke': '#EF4444', 'Lee Roche': '#5F5F5F' };
  const LEAD_MATCHES = { 'Marcus Wong': 'M. Wong &mdash; 22 Stanley Road (existing customer since 2024)' };
  const INTEREST_DEFS = [
    { name: 'Television', bg: '#EFF4FF', fg: '#576A92' },
    { name: 'CCTV', bg: '#EFF4FF', fg: '#576A92' },
    { name: 'Lighting', bg: '#EFF4FF', fg: '#576A92' },
    { name: 'Home Cinema', bg: '#EFF4FF', fg: '#576A92' },
    { name: 'Networking', bg: '#EFF4FF', fg: '#576A92' }
  ];
  let dfMode = 'new';      // 'new' | 'convert'
  let dfLeadIdx = null;    // set when converting a lead
  let dfCustIdx = null;    // set when creating from the customer page (reuses lead index as customer key)
  let dfSelectedLabels = [];
  let dfSelectedInterests = [];
  let nextQuoteNo = 24591; // follows the Deal-linked Quote demo records

  const DF_NEXT_ACTIONS = {
    proposal: { title: 'Prepare and send proposal', context: 'Proposal requested during qualification call' },
    meeting: { title: 'Schedule a meeting', context: 'Arrange the next customer meeting' },
    'site-visit': { title: 'Schedule a site visit', context: 'Arrange the next site visit' },
    'customer-followup': { title: 'Follow up customer', context: 'Confirm the next step with the customer' }
  };

  function dfDefaultNextDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return localIsoDate(tomorrow);
  }

  function onDfNextActionChange() {
    const select = document.getElementById('df-next-action');
    const context = document.getElementById('df-next-context');
    const def = DF_NEXT_ACTIONS[select.value] || DF_NEXT_ACTIONS.proposal;
    context.placeholder = def.context;
    const error = document.getElementById('df-next-step-error');
    error.hidden = true;
    error.textContent = '';
  }

  function syncDfNextStepVisibility() {
    const section = document.getElementById('df-next-step');
    const stage = CRM_STAGE_DEFS[document.getElementById('df-stage').selectedIndex] || {};
    const visible = dfMode === 'convert' && !stage.outcome;
    section.hidden = !visible;
    const stageChip = section.querySelector('.df-next-step-stage');
    if (stageChip) stageChip.innerHTML = '<i class="fai">&#xf14a;</i> ' + archiveEscape(stage.name || 'Qualified');
  }

  function dfProgressBar(stageIdx) {
    const bar = document.getElementById('dfp-bar');
    const safeIndex = Math.max(0, Math.min(stageIdx, CRM_STAGE_DEFS.length - 1));
    const segments = CRM_STAGE_DEFS.map((stage, index) => {
      const segment = document.createElement('button');
      segment.type = 'button';
      segment.className = 'seg' + (index <= safeIndex ? ' on' : '') + (index === safeIndex ? ' current' : '');
      segment.dataset.tooltip = stage.name + ' — ' + stage.probability + '% probability';
      segment.dataset.stageIndex = String(index);
      segment.setAttribute('aria-label', stage.name + ' — ' + stage.probability + '% probability');
      segment.setAttribute('aria-pressed', index === safeIndex ? 'true' : 'false');
      if (index === safeIndex) segment.setAttribute('aria-current', 'step');
      segment.addEventListener('click', () => selectDfStage(index));
      return segment;
    });
    bar.replaceChildren(...segments);
  }
  function selectDfStage(stageIdx) {
    const sel = document.getElementById('df-stage');
    const safeIndex = Math.max(0, Math.min(stageIdx, sel.options.length - 1));
    sel.selectedIndex = safeIndex;
    dfProgressBar(safeIndex);
    syncDfNextStepVisibility();
  }
  function onDfStageChange() {
    const sel = document.getElementById('df-stage');
    selectDfStage(sel.selectedIndex);
  }
  function syncFloatingSelect(select) {
    const field = select.closest('.floating-select');
    if (field) field.classList.toggle('has-value', Boolean(select.value));
  }

  function renderDfPipelineOptions(query = '') {
    const select = document.getElementById('df-pipeline');
    const options = [...select.options]
      .map((option, index) => ({ name: option.textContent, index }))
      .filter(option => option.name.toLowerCase().includes(query.trim().toLowerCase()));
    const list = document.getElementById('df-pipeline-options');
    if (!options.length) {
      list.innerHTML = '<div class="pipeline-select-empty">No pipeline found</div>';
      return;
    }
    list.innerHTML = options.map((option, listIndex) =>
      (listIndex ? '<div class="pipeline-select-divider"></div>' : '') +
      '<button type="button" class="pipeline-select-option' + (option.index === select.selectedIndex ? ' selected' : '') +
      '" role="option" aria-selected="' + (option.index === select.selectedIndex ? 'true' : 'false') +
      '" onclick="selectDfPipeline(event,' + option.index + ')"><span>' + option.name +
      '</span><i class="fai check" aria-hidden="true">&#xf00c;</i></button>'
    ).join('');
  }

  function syncDfPipelineDropdown() {
    const select = document.getElementById('df-pipeline');
    document.getElementById('df-pipeline-value').textContent = select.options[select.selectedIndex].textContent;
    renderDfPipelineOptions(document.getElementById('df-pipeline-search').value);
  }

  function openDfPipelineMenu() {
    const field = document.getElementById('df-pipeline-field');
    const menu = document.getElementById('df-pipeline-menu');
    const trigger = document.getElementById('df-pipeline-trigger');
    field.classList.add('menu-open');
    menu.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    document.getElementById('df-pipeline-search').value = '';
    renderDfPipelineOptions();
    requestAnimationFrame(() => document.getElementById('df-pipeline-search').focus());
  }

  function closeDfPipelineMenu() {
    document.getElementById('df-pipeline-field').classList.remove('menu-open');
    document.getElementById('df-pipeline-menu').hidden = true;
    document.getElementById('df-pipeline-trigger').setAttribute('aria-expanded', 'false');
  }

  function toggleDfPipelineMenu(event) {
    event.stopPropagation();
    const isOpen = !document.getElementById('df-pipeline-menu').hidden;
    if (isOpen) closeDfPipelineMenu();
    else openDfPipelineMenu();
  }

  function selectDfPipeline(event, index) {
    event.stopPropagation();
    document.getElementById('df-pipeline').selectedIndex = index;
    syncDfPipelineDropdown();
    closeDfPipelineMenu();
    document.getElementById('df-pipeline-trigger').focus();
  }

  function addDfPipeline(event) {
    event.stopPropagation();
    const selectedPipelineId = document.getElementById('df-pipeline').value;
    closeDfPipelineMenu();
    openPipelineCreateDialog({ source: 'deal', sourcePipelineId: selectedPipelineId });
  }

  function dfRenderChips(kind) {
    const isLabel = kind === 'label';
    const arr = isLabel ? dfSelectedLabels : dfSelectedInterests;
    const box = document.getElementById(isLabel ? 'df-label-chips' : 'df-interest-chips');
    const defsFor = n => isLabel ? labelDef(n) : (INTEREST_DEFS.find(d => d.name === n) || { name: n, bg: '#EFF4FF', fg: '#576A92' });
    box.innerHTML = arr.map(name => {
      const d = defsFor(name);
      return '<span class="wqd-label-chip" style="background:' + d.bg + ';color:' + d.fg + ';">' + d.name +
        ' <span class="x" onclick="dfRemoveChip(event,\'' + kind + '\',\'' + name.replace(/'/g, "\\'") + '\')">&times;</span></span>';
    }).join('');
  }
  function dfRemoveChip(e, kind, name) {
    e.stopPropagation();
    if (kind === 'label') dfSelectedLabels = dfSelectedLabels.filter(n => n !== name);
    else dfSelectedInterests = dfSelectedInterests.filter(n => n !== name);
    dfRenderChips(kind);
    if (labelPickerKind === kind) renderLabelPickerList();
  }

  // Open for a fresh deal (customer page "+ Deal", or blank "Create Deal")
  function openDealForm(mode, idx) {
    dfMode = mode;
    dfLeadIdx = mode === 'convert' ? idx : null;
    dfCustIdx = mode === 'new' ? (idx != null ? idx : null) : null;
    dfSelectedLabels = [];
    dfSelectedInterests = [];

    const l = idx != null ? CRM_LEADS[idx] : null;
    const name = l ? (l.org || l.contact) : '';

    document.getElementById('df-title').textContent = mode === 'convert' ? 'Convert Lead to Deal' : 'Create Deal';
    document.getElementById('df-savebtn').textContent = mode === 'convert' ? 'Confirm and Convert as Deal' : 'Create Deal';
    document.getElementById('df-note').innerHTML = (mode === 'convert' && l)
      ? 'The customer record already exists — it was created (or matched) when the lead was added. ' +
        (LEAD_MATCHES[l.contact] ? 'Attached to existing customer: ' + LEAD_MATCHES[l.contact] + '.' : 'Prospect customer created with this lead — upgrades to full customer on this deal.')
      : '';

    document.getElementById('df-org').value = l ? name : '';
    const inheritedCompanyId = l && l.owningCompanyId ? l.owningCompanyId : defaultOwningCompanyId();
    document.getElementById('df-company').innerHTML = owningCompanyOptions(inheritedCompanyId, true);
    document.getElementById('df-company').value = inheritedCompanyId;
    document.getElementById('df-site').value = l ? (l.site || '') : '';
    document.getElementById('df-pipeline').selectedIndex = 0;
    syncDfPipelineDropdown();
    document.getElementById('df-stage').selectedIndex = 0;
    dfProgressBar(0);
    document.getElementById('df-next-action').value = 'proposal';
    document.getElementById('df-next-date').value = dfDefaultNextDate();
    document.getElementById('df-next-time').value = '17:00';
    document.getElementById('df-next-context').value = mode === 'convert' ? DF_NEXT_ACTIONS.proposal.context : '';
    document.getElementById('df-next-step-error').hidden = true;
    document.getElementById('df-next-step-error').textContent = '';
    onDfNextActionChange();
    syncDfNextStepVisibility();
    document.getElementById('df-currency').selectedIndex = 0;
    document.getElementById('df-value').value = l && l.est ? l.est.toLocaleString('en-US') : '';
    document.getElementById('df-closedate').value = '';
    dfRenderChips('label');
    dfRenderChips('interest');
    document.getElementById('df-owner').value = l ? l.owner : '';
    syncFloatingSelect(document.getElementById('df-owner'));
    document.getElementById('df-source').value = l ? (l.source || '') : '';
    document.getElementById('df-notes').value = '';
    document.getElementById('df-contact').value = l ? l.contact : '';
    document.getElementById('df-job').value = l ? (l.job || '') : '';
    document.querySelectorAll('#df-email-list .wqd-field').forEach((el, i) => { if (i > 0) el.remove(); });
    document.getElementById('df-email').value = l ? (l.email || '') : '';
    document.querySelectorAll('#df-phone-list .df-phone-extra').forEach(el => el.remove());
    document.getElementById('df-phonecode').selectedIndex = 0;
    document.getElementById('df-phone').value = l ? (l.phone || '') : '';
    setContactTab('primary', null, 'dealFormOverlay');
    closeLabelPicker();

    dealFormOverlay.classList.add('open');
  }
  function closeDealForm() { dealFormOverlay.classList.remove('open'); closeLabelPicker(); closeDfPipelineMenu(); }

  document.addEventListener('click', e => {
    if (!e.target.closest('#df-pipeline-field')) closeDfPipelineMenu();
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || document.getElementById('df-pipeline-menu').hidden) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    closeDfPipelineMenu();
    document.getElementById('df-pipeline-trigger').focus();
  });

  function saveDealForm() {
    const org = document.getElementById('df-org').value.trim();
    const contact = document.getElementById('df-contact').value.trim() || 'New Contact';
    const name = org || contact;
    const owningCompanyId = document.getElementById('df-company').value;
    if (!owningCompanyId) {
      document.getElementById('df-company').focus();
      qtShowSnackbar('Choose the Owning Company for this Deal.', 'blocked');
      return;
    }
    const val = parseInt(String(document.getElementById('df-value').value).replace(/[^0-9]/g, ''), 10) || 0;
    const owner = document.getElementById('df-owner').value || 'Lee Roche';
    const stageIdx = document.getElementById('df-stage').selectedIndex;
    const initials = owner.split(' ').map(w => w[0]).join('').toUpperCase();
    const needsNextStep = dfMode === 'convert' && !(CRM_STAGE_DEFS[stageIdx] || {}).outcome;
    const nextActionType = document.getElementById('df-next-action').value;
    const nextActionDate = document.getElementById('df-next-date').value;
    const nextActionTime = document.getElementById('df-next-time').value;
    const nextActionError = document.getElementById('df-next-step-error');
    if (needsNextStep && (!DF_NEXT_ACTIONS[nextActionType] || !nextActionDate || !nextActionTime)) {
      nextActionError.textContent = 'Choose the next action, due date and time before converting this Lead.';
      nextActionError.hidden = false;
      document.getElementById(!nextActionDate ? 'df-next-date' : !nextActionTime ? 'df-next-time' : 'df-next-action').focus();
      return;
    }
    nextActionError.hidden = true;
    const convertedLead = dfMode === 'convert' && dfLeadIdx != null ? CRM_LEADS[dfLeadIdx] : null;

    const d = {
      t: name + (dfMode === 'convert' && dfLeadIdx != null ? '' : ' — New project'),
      c: name, v: val, s: stageIdx, o: initials, oc: OWNER_COLORS[owner] || '#7C3AED', d: 0,
      labels: [...dfSelectedLabels], interests: [...dfSelectedInterests],
      closeDate: document.getElementById('df-closedate').value.trim(),
      notes: document.getElementById('df-notes').value.trim(),
      // carried onto the deal details page (Figma node 2578-91244)
      ownerName: owner, org: org, contact: contact, owningCompanyId: owningCompanyId,
      email: document.getElementById('df-email').value.trim(),
      phone: document.getElementById('df-phone').value.trim(),
      source: document.getElementById('df-source').value.trim()
    };
    if (needsNextStep) {
      const nextActionDef = DF_NEXT_ACTIONS[nextActionType];
      d.nextAction = {
        id: 'deal-next-' + Date.now(), type: nextActionType, title: nextActionDef.title,
        dueAt: nextActionDate + 'T' + nextActionTime + ':00',
        context: document.getElementById('df-next-context').value.trim(),
        assignedTo: owner, status: 'open', createdAt: new Date().toISOString(), source: 'lead-conversion'
      };
      d.actionHistory = [{
        id: d.nextAction.id + '-created', kind: 'created', type: nextActionType,
        title: nextActionDef.title + ' created', createdAt: d.nextAction.createdAt, author: owner
      }];
    }
    if (convertedLead) {
      d.t = convertedLead.title; // deal name = lead title, per L3
      convertedLead.status = 'converted'; // L1: lead becomes converted + read-only
      renderLeads();
    }
    CRM_DEALS.push(d);
    if (window.WeQuoteAutomation) {
      window.WeQuoteAutomation.emit('deal.created', { deal: d, source: convertedLead ? 'lead-conversion' : 'manual' });
      if (convertedLead) window.WeQuoteAutomation.emit('lead.converted', { lead: convertedLead, deal: d });
      window.WeQuoteAutomation.emit('deal.stage.changed', {
        deal: d, pipeline: getActivePipeline(), fromStage: null,
        toStage: CRM_STAGE_DEFS[stageIdx] || {}, fromStageIndex: -1, toStageIndex: stageIdx,
        source: convertedLead ? 'lead-conversion' : 'manual-create'
      });
    }
    saveActivePipelineState();
    const card = makeDealCard(d);
    card.classList.add('flash');
    pipelineEl.querySelectorAll('.stage-body')[stageIdx].appendChild(card);
    recalcPipeline();
    closeDealForm();
    if (dfMode === 'new' && dfCustIdx != null) {
      openCustomerPage(dfCustIdx); // refresh the page — deal appears, prospect badge clears
    } else {
      showView('crm'); // jump to the board to see the new deal arrive
    }
    setTimeout(() => card.classList.remove('flash'), 2300);
  }
  dealFormOverlay.addEventListener('click', e => { if (e.target === dealFormOverlay) closeDealForm(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && dealFormOverlay.classList.contains('open')) closeDealForm();
  });

  // Backward-compat entry points (kebab menu, lead drawer, customer page "+ Deal" all call these)
  function openConvert(i) { openDealForm('convert', i); }
  function openNewDeal() { openDealForm('new', cuIdx); }

  // Latest Quotes rows — data & states from Figma frame 362:20073
  const quotes = [
    ["11995","Les Landau","Theater Upgrades","","sent","Exp: 7/25/26","$31,346.10"],
    ["11835","Carley Knobloch","Garden Light/Tree Mount","R1.1","progress","","$925.71"],
    ["11884","1 Burning Tree","1 Burning Tree Lutron Sunnata","R2","sent","Exp: 7/26/26","$62,306.78"],
    ["11997","Farrel Stevins","New Pool TV","","sent","Exp: 7/26/26","$10,554.99"],
    ["10987","DPP9 Owner LLC","Harland WeHo Theater","R2.3","accepted","6/25/26","$50,687.56"],
    ["11990","Cherin Joseph","2231 Quail Bluff Ct","","progress","","$35,162.13"],
    ["11996","Ethan Van Der Ryn","20436 Rocha Chica Drive v2","","sent","Exp: 7/25/26","$40,383.49"],
    ["11016","Jerry Grundhofer","IP Camera Upgrades","R4.5","sent","Exp: 7/25/26","$28,655.73"],
    ["11992","Scott Small","Window Treatments","","progress","","$52,629.64"],
    ["11994","Les Landau","New Motorized Drapery Track","","sent","Exp: 7/25/26","$6,326.27"]
  ];
  const statusLabel = { sent: "Sent", progress: "In Progress", accepted: "Accepted" };
  const subClass = { sent: "purple", accepted: "teal" };
  document.getElementById("quotes-body").innerHTML = quotes.map(([n,c,p,rev,st,sub,net])=>`
    <tr>
      <td class="num">${n}</td>
      <td></td>
      <td>
        <div class="cust-name">${c}</div>
        <div class="cust-proj">${p}${rev ? `<span class="rev-tag">${rev}</span>` : ""}</div>
      </td>
      <td class="seen"></td>
      <td class="status-cell">
        <span class="status-wrap">
          <span class="status-badge ${st}">${statusLabel[st]}</span>
          ${sub ? `<span class="status-sub ${subClass[st]}">${sub}</span>` : ""}
        </span>
      </td>
      <td class="net">${net}</td>
    </tr>
  `).join("");

  if (window.location.hash === '#crm') showView('crm');

  // Sales by Salesperson rows — data from Figma frame 362:20252 (31 rows, clipped by card)
  const sp = [
    ["Jeff Mitchel","Market Leader",85,"$8,955,810.78"],
    ["Dave Lombard","Market Leader",58,"$1,943,839.02"],
    ["Sean Prater","Market Leader",43,"$1,302,872.11"],
    ["Gabriel Rivera","Market Leader",61,"$1,223,777.34"],
    ["Patrick Burke","Technology Advisor",32,"$808,388.44"],
    ["Adam Olesen","Technology Advisor",35,"$437,318.27"],
    ["mike barber","Service Manager",200,"$385,381.30"],
    ["Fernando Garcia","Service Manager",220,"$225,523.48"],
    ["Chris Johnson","Technology Consultant",39,"$216,225.24"],
    ["Steve Coon","Senior Technology Advisor",17,"$206,924.75"],
    ["Julie Esparza","Technology Advisor",12,"$206,766.33"],
    ["Ryan Johnson","Service Tech",70,"$200,826.93"],
    ["Jack Joudi","Service Manager",267,"$195,050.83"],
    ["Trenton Doling","Technology Advisor",11,"$112,236.41"],
    ["Barry O'Brien","Technology Advisor",3,"$96,895.52"],
    ["Jim Korzelius","Engineer,  Project Manager",38,"$83,692.06"],
    ["Drew Walker","Programming Manager",8,"$61,394.98"],
    ["Raymond Alatorre","Project Manager",7,"$23,463.06"],
    ["Matt Callahan","Engineer",2,"$18,986.51"],
    ["Mark Carlo","Process Manager",10,"$16,021.80"],
    ["Ryan Forgy","Project Manager",6,"$11,576.21"],
    ["Carley Knobloch","Technology Advisor",3,"$6,355.66"],
    ["Jennifer Marcoly","Accounts Payable",1,"$5,497.14"],
    ["Ryan Oerth","Chief Operating Officer",4,"$2,714.98"],
    ["Scott Marcoly","Sr. Engineer,  Shading Designer",1,"$2,610.00"],
    ["Adam McKIbben","Production Manager",3,"$2,395.48"],
    ["Scott Smith","Operations Manager",3,"$1,381.48"],
    ["Chris Kimball","Purchasing Manager",1,"$342.00"],
    ["Tom Roberts","Lighting Engineer",1,"$173.73"],
    ["Richard Bills","Project Manager",1,"$0.00"],
    ["Carly Kennedy","Engineer,  Operations Manager",1,"-$340.00"]
  ];
  document.getElementById("sp-body").innerHTML = sp.map(([n,r,q,a])=>`
    <tr>
      <td>
        <div class="sp-name">${n}</div>
        <div class="sp-role">${r}</div>
      </td>
      <td class="cnt">${q}</td>
      <td class="r"><span class="money-pill${a.startsWith("-") ? " neg" : ""}">${a}</span></td>
    </tr>
  `).join("");
