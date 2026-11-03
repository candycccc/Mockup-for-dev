/* Quote & Sales demonstration workspace.
   Keeps Quote lifecycle state explicit so the CRM Pipeline can consume it later. */
(function () {
  'use strict';

  const QUOTE_STATUSES = ['In Progress', 'In Review', 'Passed Review', 'Sent', 'Accepted', 'Complete', 'Cancelled'];
  const QUOTE_TABS = ['All', 'In Progress', 'In Review', 'Passed Review', 'Sent', 'Accepted', 'Complete', 'Expired', 'Cancelled'];
  const OWNING_COMPANIES = window.WeQuoteOwningCompanies || [
    { id: 'main-company', name: 'AUDIOVISIONS — Main Company', shortName: 'Main Company' },
    { id: 'los-angeles', name: 'AUDIOVISIONS — Los Angeles', shortName: 'Los Angeles' },
    { id: 'northern-california', name: 'AUDIOVISIONS — Northern California', shortName: 'Northern California' },
    { id: 'orange-county', name: 'AUDIOVISIONS — Orange County', shortName: 'Orange County' },
    { id: 'palm-desert', name: 'AUDIOVISIONS — Palm Desert', shortName: 'Palm Desert' }
  ];
  const quoteRows = [
    { id: 'Q-24589', customer: 'Les Landau', project: 'Theater Upgrades', owner: 'Jeff Mitchel', initials: 'JM', created: '21 Aug 2026', modified: '22 Aug 2026', location: 'London', status: 'In Progress', total: '£31,346.00', expiry: '', expiresAt: '', crmDeal: 'Theater Upgrades', proposal: 'Original Theater Proposal' },
    { id: 'Q-11990', customer: 'Cherin Joseph', project: '2231 Quail Bluff Ct', owner: 'Dave Lombard', initials: 'DL', created: '19 Aug 2026', modified: '22 Aug 2026', location: 'Henderson', status: 'In Review', total: '£35,162.00', expiry: '', expiresAt: '', crmDeal: '2231 Quail Bluff Ct', proposal: 'Main AV Scope' },
    { id: 'Q-11992', customer: 'Scott Small', project: 'Window Treatments', owner: 'Sean Prater', initials: 'SP', created: '18 Aug 2026', modified: '21 Aug 2026', location: 'Surrey', status: 'Passed Review', total: '£52,630.00', expiry: '', expiresAt: '', crmDeal: 'Window Treatments', proposal: 'Motorised Blind Package' },
    { id: 'Q-11885', customer: '1 Burning Tree', project: 'Lutron Sunnata', owner: 'Dave Lombard', initials: 'DL', created: '15 Aug 2026', modified: '20 Aug 2026', location: 'Luton', status: 'Sent', total: '£59,800.00', expiry: 'Expires 20 Sep 2026', expiresAt: '2026-09-20', crmDeal: '1 Burning Tree Lutron Sunnata', proposal: 'Alternative Lighting Package' },
    { id: 'Q-11016', customer: 'Jerry Grundhofer', project: 'IP Camera Upgrades', owner: 'Jeff Mitchel', initials: 'JM', created: '12 Aug 2026', modified: '19 Aug 2026', location: 'Bristol', status: 'Sent', total: '£28,656.00', expiry: 'Expires 18 Sep 2026', expiresAt: '2026-09-18', crmDeal: 'IP Camera Upgrades', proposal: 'Camera and Recording Upgrade' },
    { id: 'Q-10987', customer: 'DPP9 Owner LLC', project: 'Harland WeHo Theater', owner: 'Jeff Mitchel', initials: 'JM', created: '10 Aug 2026', modified: '18 Aug 2026', location: 'West Hollywood', status: 'Accepted', total: '£50,688.00', expiry: 'Accepted 20 Aug 2026', expiresAt: '', crmDeal: 'Harland WeHo Theater', proposal: 'Theater Proposal' },
    { id: 'Q-12003', customer: 'Gabriel Rivera', project: 'Office AV Refresh', owner: 'Patrick Burke', initials: 'PB', created: '06 Aug 2026', modified: '17 Aug 2026', location: 'Warrington', status: 'Complete', total: '£12,400.00', expiry: 'Completed 21 Aug 2026', expiresAt: '', crmDeal: 'Office AV Refresh', proposal: 'Office AV Proposal' },
    { id: 'Q-11996', customer: 'Ethan Van Der Ryn', project: '20436 Rocha Chica Drive v2', owner: 'Alex Osei', initials: 'AO', created: '29 Jul 2026', modified: '14 Aug 2026', location: 'Los Angeles', status: 'Expired', total: '£40,383.00', expiry: 'Expired 25 Jul 2026', expiresAt: '2026-07-25', crmDeal: '20436 Rocha Chica Drive v2', proposal: 'Rocha Chica Proposal' },
    { id: 'Q-11997', customer: 'Farrel Stevins', project: 'New Pool TV', owner: 'Patrick Burke', initials: 'PB', created: '16 Jul 2026', modified: '04 Aug 2026', location: 'Las Vegas', status: 'In Progress', total: '£10,555.00', expiry: '', expiresAt: '', crmDeal: 'New Pool TV', proposal: 'Outdoor Display Proposal' },
    { id: 'Q-2401', customer: 'Orchard House', project: 'Lighting Option A', owner: 'Lee Roche', initials: 'LR', created: '09 Jul 2026', modified: '01 Aug 2026', location: 'Surrey', status: 'Cancelled', total: '£12,400.00', expiry: 'Cancelled 01 Aug 2026', expiresAt: '', crmDeal: 'Orchard House Lighting Options', proposal: 'Lighting Option A' },
    { id: 'Q-2400', customer: 'Orchard House', project: 'Lighting Option B', owner: 'Lee Roche', initials: 'LR', created: '09 Jul 2026', modified: '01 Aug 2026', location: 'Surrey', status: 'Cancelled', total: '£15,850.00', expiry: 'Cancelled 01 Aug 2026', expiresAt: '', crmDeal: 'Orchard House Lighting Options', proposal: 'Lighting Option B' },
    { id: 'Q-2399', customer: 'Orchard House', project: 'Lighting Option C', owner: 'Lee Roche', initials: 'LR', created: '09 Jul 2026', modified: '01 Aug 2026', location: 'Surrey', status: 'Cancelled', total: '£18,200.00', expiry: 'Cancelled 01 Aug 2026', expiresAt: '', crmDeal: 'Orchard House Lighting Options', proposal: 'Lighting Option C' }
  ];

  quoteRows.forEach((row, index) => { row.owningCompanyId = row.owningCompanyId || OWNING_COMPANIES[index % OWNING_COMPANIES.length].id; });
  let activeFilter = 'All';
  let activeCompany = 'all';
  let searchTerm = '';
  let currentQuoteId = 'Q-2410';
  let currentScreen = 'list';

  function root() { return document.getElementById('quoteWorkspace'); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }
  function quoteById(id) { return quoteRows.find(row => row.id === id) || quoteRows[0]; }
  function owningCompany(id) { return OWNING_COMPANIES.find(company => company.id === id) || OWNING_COMPANIES[0]; }
  function companyOptions() { return '<option value="all">All Companies</option>' + OWNING_COMPANIES.map(company => '<option value="' + esc(company.id) + '"' + (activeCompany === company.id ? ' selected' : '') + '>' + esc(company.name) + '</option>').join(''); }
  function countFor(status) {
    const companyRows = activeCompany === 'all' ? quoteRows : quoteRows.filter(row => row.owningCompanyId === activeCompany);
    return status === 'All' ? companyRows.length : companyRows.filter(row => row.status === status).length;
  }
  function statusOptions(selected) {
    return QUOTE_STATUSES.map(status => '<option value="' + esc(status) + '"' + (status === selected ? ' selected' : '') + '>' + esc(status) + '</option>').join('');
  }
  function linkedStage(quote) {
    const related = quoteRows.filter(row => row.crmDeal === quote.crmDeal);
    const statuses = related.map(row => row.status);
    if (statuses.some(status => status === 'Accepted' || status === 'Complete')) return 'Deal Stage = Won';
    if (statuses.length && statuses.every(status => status === 'Cancelled')) return 'Deal Status = Archived · Last Stage retained';
    const viable = ['In Progress', 'In Review', 'Passed Review', 'Sent'];
    if (statuses.length && !statuses.some(status => viable.includes(status))) return 'Deal Stage = Lost';
    return 'Deal Stage = ' + quote.status;
  }
  function setCrumb(detail) {
    const pageTitle = document.getElementById('pageTitle');
    if (!pageTitle) return;
    pageTitle.innerHTML = '<span class="crumb-link" onclick="openQuoteWorkspace()">Quote &amp; Sales</span><span class="crumb-sep">/</span>' + detail;
  }

  function openWorkspace() {
    if (typeof window.showView === 'function') window.showView('quotes');
    activeFilter = 'All';
    searchTerm = '';
    currentScreen = 'list';
    setCrumb('Quotes');
    renderList();
  }

  function visibleRows() {
    const term = searchTerm.trim().toLowerCase();
    return quoteRows.filter(row => {
      const matchesStatus = activeFilter === 'All' || row.status === activeFilter;
      const haystack = [row.id, row.customer, row.project, row.owner, row.location, row.status].join(' ').toLowerCase();
      const matchesCompany = activeCompany === 'all' || row.owningCompanyId === activeCompany;
      return matchesStatus && matchesCompany && (!term || haystack.includes(term));
    });
  }

  function renderList() {
    const mount = root();
    if (!mount) return;
    currentScreen = 'list';
    setCrumb('Quotes');
    const rows = visibleRows();
    mount.innerHTML = '<div class="qw-page">' +
      '<div class="qw-page-head"><div><h1>Quotes</h1><p>Related Quote lifecycle events derive the linked CRM Deal stage and final outcome.</p></div>' +
        '<div class="qw-head-actions"><button class="qw-btn dark"><i class="fai">&#xf1c0;</i> Import quotes</button><button class="qw-btn primary"><i class="fai">&#xf067;</i> New Quote</button></div></div>' +
      '<div class="qw-shell">' +
        '<div class="qw-toolbar"><h2>Quote list</h2><div class="qw-filters">' +
          '<label class="qw-company-filter"><i class="fai">&#xf1ad;</i><select aria-label="Filter Quotes by Owning Company" onchange="setQuoteCompanyFilter(this.value)">' + companyOptions() + '</select></label>' +
          '<select class="qw-filter-select" aria-label="Assigned to"><option>Assigned to: Anyone</option><option>Assigned to: Me</option></select>' +
          '<label class="qw-search"><i class="fai">&#xf002;</i><input value="' + esc(searchTerm) + '" oninput="filterQuoteDemo(this.value)" placeholder="Search quotes"></label>' +
        '</div></div>' +
        '<div class="qw-tabs" role="tablist">' + QUOTE_TABS.map(tab => '<button class="qw-tab' + (tab === activeFilter ? ' active' : '') + '" type="button" role="tab" aria-selected="' + (tab === activeFilter) + '" onclick="setQuoteDemoFilter(\'' + tab + '\')">' + tab + '<strong>' + countFor(tab) + '</strong></button>').join('') + '</div>' +
        '<div class="qw-table-wrap">' + (rows.length ? '<table class="qw-table"><thead><tr><th class="num">#</th><th class="customer">Customer / Quote</th><th class="company">Owning Company</th><th class="owner">Assigned to</th><th class="date">Created</th><th class="date">Last modified</th><th class="location">Location</th><th class="status-col">Status / Date</th><th class="total">Net total</th></tr></thead><tbody>' + rows.map(rowHtml).join('') + '</tbody></table>' : '<div class="qw-empty"><i class="fai">&#xf002;</i><br><br>No Quotes match this view.</div>') + '</div>' +
        '<div class="qw-pagination"><span>' + rows.length + ' matching quotes · ' + (activeCompany === 'all' ? 'All Companies' : esc(owningCompany(activeCompany).name)) + '</span><div class="qw-pagination-pages"><span class="qw-page-dot active">1</span><span class="qw-page-dot">2</span><span class="qw-page-dot">›</span></div></div>' +
      '</div></div>';
  }

  function rowHtml(row) {
    return '<tr tabindex="0" role="link" aria-label="Open ' + esc(row.id) + '" onclick="openQuoteDemoDetail(\'' + esc(row.id) + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \'){event.preventDefault();openQuoteDemoDetail(\'' + esc(row.id) + '\')}">' +
      '<td class="num">' + esc(row.id.replace('Q-', '')) + '</td>' +
      '<td class="customer"><div class="qw-customer"><strong>' + esc(row.customer) + ' / <span class="qw-link" style="display:inline">' + esc(row.project) + '</span></strong><span>' + esc(row.id) + ' · ' + esc(row.proposal) + '</span></div></td>' +
      '<td class="company"><span class="qw-company-badge"><i class="fai">&#xf1ad;</i>' + esc(owningCompany(row.owningCompanyId).shortName) + '</span></td>' +
      '<td class="owner"><span class="qw-owner-avatar">' + esc(row.initials) + '</span>' + esc(row.owner) + '</td>' +
      '<td class="date">' + esc(row.created) + '</td><td class="date">' + esc(row.modified) + '</td><td class="location">' + esc(row.location) + '</td>' +
      '<td class="status-col"><span class="qw-status ' + slug(row.status) + '">' + esc(row.status) + '</span>' + (row.expiry ? '<span class="qw-status-date">' + esc(row.expiry) + '</span>' : '') + '</td>' +
      '<td class="total">' + esc(row.total) + '</td></tr>';
  }

  function openDetail(id) {
    currentQuoteId = id;
    currentScreen = 'detail';
    renderDetail();
  }

  function renderDetail() {
    const mount = root();
    if (!mount) return;
    const quote = quoteById(currentQuoteId);
    setCrumb('<span class="crumb-link" onclick="openQuoteWorkspace()">Quotes</span><span class="crumb-sep">/</span>' + esc(quote.id));
    mount.innerHTML = '<div class="qw-page">' + recordTopHtml(quote, 'detail') + lifecycleHtml(quote) +
      '<div class="qw-detail-layout"><section class="qw-detail-main">' +
        '<div class="qw-section-head"><div><h2>Quote Summary</h2><span class="qw-sub">Created ' + esc(quote.created) + ' · Last modified ' + esc(quote.modified) + '</span></div><button class="qw-btn" onclick="openQuoteProposal()"><i class="fai">&#xf06e;</i> View Proposal</button></div>' +
        '<div class="qw-metrics"><div class="qw-metric"><span>Product margin</span><strong>35%</strong><em>£8,575.00</em></div><div class="qw-metric"><span>Labour margin</span><strong>32%</strong><em>42 hours</em></div><div class="qw-metric"><span>Total margin</span><strong>34%</strong><em>Within target</em></div><div class="qw-metric"><span>Grand total</span><strong>' + esc(quote.total) + '</strong><em>Excl. tax</em></div></div>' +
        '<div class="qw-product-head"><span>Product / service</span><span>Cost price</span><span>Sell price</span><span>Qty</span></div>' +
        productHtml('Lutron lighting control package', 'Equipment and commissioning', '£8,940.00', '£13,850.00', '1') +
        productHtml('AV distribution and rack build', 'Design, supply and installation', '£4,280.00', '£7,650.00', '1') +
        productHtml('Programming and handover', 'Engineering labour', '£1,820.00', '£3,000.00', '42h') +
      '</section><aside class="qw-detail-side">' +
        '<div class="qw-section-head"><h2>Quote Details</h2><span class="qw-sub">' + esc(quote.id) + '</span></div><div class="qw-card-fields">' +
          fieldHtml('Name', quote.proposal) + fieldHtml('Customer', quote.customer) + fieldHtml('Owning Company / Quote issuer', owningCompany(quote.owningCompanyId).name) + fieldHtml('Customer location', quote.location) + fieldHtml('Assignee', quote.owner) + fieldHtml('Linked CRM Deal', quote.crmDeal) +
        '</div><div class="qw-detail-actions"><button class="qw-btn">Edit Quote</button><button class="qw-btn primary" onclick="openQuoteProposal()">Proposal →</button></div>' +
      '</aside></div></div>';
  }

  function recordTopHtml(quote, screen) {
    return '<div class="qw-record-top"><div class="qw-record-title"><button class="qw-back" onclick="' + (screen === 'proposal' ? 'openQuoteDemoDetail(\'' + esc(quote.id) + '\')' : 'openQuoteWorkspace()') + '" aria-label="Back"><i class="fai">&#xf060;</i></button><div><h1>' + esc(quote.id) + ' · ' + esc(quote.project) + '</h1><p>' + esc(quote.customer) + ' · Linked Deal ' + esc(quote.crmDeal) + '</p></div></div>' +
      '<div class="qw-status-control"><label for="quoteDemoStatus">Quote Status</label><select id="quoteDemoStatus" class="qw-status-select" onchange="setQuoteDemoStatus(this.value)">' + statusOptions(quote.status === 'Expired' ? 'Sent' : quote.status) + '</select></div></div>';
  }

  function lifecycleHtml(quote) {
    return '<div class="qw-lifecycle"><i class="fai">&#xf0e7;</i><span><strong>Protected lifecycle:</strong> any accepted Quote makes the Deal Won; no viable Quote can make it Lost; all related Quotes Cancelled makes the Deal Archived without creating a new Stage.</span><span class="stage-result">' + esc(linkedStage(quote)) + '</span></div>';
  }

  function productHtml(name, sub, cost, sell, qty) {
    return '<div class="qw-product-row"><div><strong>' + name + '</strong><small>' + sub + '</small></div><span>' + cost + '</span><span>' + sell + '</span><span>' + qty + '</span></div>';
  }
  function fieldHtml(label, value) { return '<div class="qw-field"><label>' + esc(label) + '</label><div class="qw-field-value">' + esc(value) + '</div></div>'; }

  function openProposal() {
    currentScreen = 'proposal';
    renderProposal();
  }

  function renderProposal() {
    const mount = root();
    if (!mount) return;
    const quote = quoteById(currentQuoteId);
    setCrumb('<span class="crumb-link" onclick="openQuoteWorkspace()">Quotes</span><span class="crumb-sep">/</span><span class="crumb-link" onclick="openQuoteDemoDetail(\'' + esc(quote.id) + '\')">' + esc(quote.id) + '</span><span class="crumb-sep">/</span>Proposal');
    mount.innerHTML = '<div class="qw-page">' + recordTopHtml(quote, 'proposal') + lifecycleHtml(quote) +
      '<div class="qw-proposal-layout"><nav class="qw-proposal-nav"><button onclick="openQuoteDemoDetail(\'' + esc(quote.id) + '\')"><i class="fai">&#xf15c;</i> Quote Summary</button><button><i class="fai">&#xf1ec;</i> Quote Editor</button><button><i class="fai">&#xf201;</i> Pricing</button><button class="active"><i class="fai">&#xf06e;</i> View Proposal</button><button><i class="fai">&#xf1ea;</i> View Changes</button></nav>' +
      '<main class="qw-proposal-main"><div class="qw-proposal-command"><div class="qw-proposal-command-left"><button class="qw-btn primary large"><i class="fai">&#xf067;</i> Create Proposal</button><strong>' + esc(quote.proposal) + '</strong><span class="qw-company-badge"><i class="fai">&#xf1ad;</i>Issued by ' + esc(owningCompany(quote.owningCompanyId).shortName) + '</span></div><div class="qw-proposal-command-right"><button class="qw-btn primary large"><i class="fai">&#xf1d8;</i> Send Proposal</button><button class="qw-btn">Web Preview</button></div></div>' +
      '<article class="qw-proposal-doc"><div class="qw-proposal-cover"><span class="mark"><i class="fai">&#xf1ea;</i></span><h2>' + esc(quote.project) + '</h2><p>Prepared for ' + esc(quote.customer) + ' · ' + esc(quote.id) + '</p></div><div class="qw-proposal-body"><h3>Proposal summary</h3>' +
        '<div class="qw-proposal-line"><span>Lutron lighting control package</span><strong>£13,850.00</strong></div><div class="qw-proposal-line"><span>AV distribution and rack build</span><strong>£7,650.00</strong></div><div class="qw-proposal-line"><span>Programming and handover</span><strong>£3,000.00</strong></div><div class="qw-proposal-total"><span>Net total</span><span>' + esc(quote.total) + '</span></div>' +
        '<div class="qw-derived-note"><strong>Expired is not selectable.</strong> It is derived automatically when a Sent Quote passes its expiry date. Cancelled remains a stored Quote status but is contextual in the CRM Pipeline.</div>' +
      '</div></article></main></div></div>';
  }

  function setFilter(status) { activeFilter = status; renderList(); }
  function setCompanyFilter(companyId) { activeCompany = companyId === 'all' || OWNING_COMPANIES.some(company => company.id === companyId) ? companyId : 'all'; renderList(); }
  function filter(value) { searchTerm = value; renderList(); const input = document.querySelector('.qw-search input'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } }
  function setStatus(status) {
    if (!QUOTE_STATUSES.includes(status)) return;
    const quote = quoteById(currentQuoteId);
    quote.status = status;
    quote.modified = '22 Aug 2026';
    quote.expiry = status === 'Sent' ? 'Expires 05 Sep 2026' : status === 'Accepted' ? 'Accepted 22 Aug 2026' : status === 'Complete' ? 'Completed 22 Aug 2026' : '';
    quote.expiresAt = status === 'Sent' ? '2026-09-05' : '';
    if (window.WeQuoteCRMQuoteLifecycle) window.WeQuoteCRMQuoteLifecycle.syncQuoteRows(quoteRows);
    if (currentScreen === 'proposal') renderProposal(); else renderDetail();
  }

  window.openQuoteWorkspace = openWorkspace;
  window.openQuoteDemoDetail = openDetail;
  window.openQuoteProposal = openProposal;
  window.setQuoteDemoFilter = setFilter;
  window.setQuoteCompanyFilter = setCompanyFilter;
  window.filterQuoteDemo = filter;
  window.setQuoteDemoStatus = setStatus;

  const quoteWorkspaceNav = document.querySelector('[data-quote-workspace-nav]');
  if (quoteWorkspaceNav) quoteWorkspaceNav.classList.add('quote-workspace-ready');
  // The compatibility layer can rebuild sidebar nodes after startup, so delegate
  // this navigation event from document instead of binding to a disposable node.
  document.addEventListener('click', event => {
    if (event.target.closest('[data-quote-workspace-nav]')) openWorkspace();
  });
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#quotes') openWorkspace();
  });
  if (window.location.hash === '#quotes') openWorkspace();
  if (window.WeQuoteCRMQuoteLifecycle) window.WeQuoteCRMQuoteLifecycle.syncQuoteRows(quoteRows);
})();
