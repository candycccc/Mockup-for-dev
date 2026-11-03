(function () {
  const automationView = document.getElementById('viewAutomation');
  if (!automationView) return;

  // Navigation is owned by the Phase 1 core showView() implementation.

  const templateDefinitions = {
    'qualified-owner-first-action': {
      kind: 'stage-template',
      objectType: 'Deal',
      title: 'Qualified first Next Action',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Qualified',
      triggerEvent: 'Deal enters Qualified in Sales Pipeline',
      waitDays: 0,
      condition: 'No open Deal Next Action exists',
      actionType: 'Set Deal Next Action',
      actionName: 'Set Deal Next Action',
      nextActionType: 'customer-followup',
      nextActionTitle: 'Follow up newly Qualified Deal',
      nextActionDueDays: 1,
      nextActionDueUnit: 'working-days',
      actionOwner: 'Deal owner',
      actionDue: 'In 1 working day'
    },
    'qualified-inactivity': {
      kind: 'stage-template',
      objectType: 'Deal',
      title: 'Qualified inactivity reminder',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Qualified',
      triggerEvent: 'Deal enters Qualified in Sales Pipeline',
      waitDays: 7,
      condition: 'Deal is still Qualified AND has no recent sales activity',
      actionType: 'Create Note',
      actionName: 'Qualified inactivity follow-up',
      noteBody: 'Follow up this Qualified Deal because no recent sales activity was found.',
      mention: 'Deal owner',
      followUpDelay: '1-working-day',
      followUpTime: '17:00',
      actionOwner: 'Deal owner',
      actionDue: 'Today'
    },
    'pre-quote-readiness': {
      kind: 'stage-template',
      objectType: 'Deal',
      title: 'Site visit & pre-Quote readiness',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Qualified',
      triggerEvent: 'Deal enters Qualified in Sales Pipeline',
      waitDays: 0,
      condition: 'Required Site Visit or customer and site information is incomplete',
      actionType: 'Create Note',
      actionName: 'Site readiness follow-up',
      noteBody: 'Confirm the required Site Visit, customer details and site information before creating the first Quote.',
      mention: 'Deal owner',
      followUpDelay: '1-working-day',
      followUpTime: '17:00',
      actionCreator: 'Automation',
      actionOwner: 'Deal owner',
      actionDue: 'Before the first Quote can be created',
      completionMode: 'required',
      blockedEvent: 'first-related-quote',
      blocking: true,
      focus: true
    },
    'quote-build-check': {
      kind: 'stage-template',
      objectType: 'Quote',
      title: 'Quote build & SOW checks',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'In Progress',
      triggerEvent: 'First related Quote is created',
      waitDays: 0,
      condition: 'Required pricing data or SOW information is missing',
      actionType: 'Create Note',
      actionName: 'Quote information needs attention',
      noteBody: 'Complete the missing pricing, product or Scope of Works information on this Quote.',
      mention: 'Quote owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Quote owner',
      actionDue: 'Today'
    },
    'internal-quote-review': {
      kind: 'stage-template',
      objectType: 'Quote',
      title: 'Internal Quote review',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'In Review',
      triggerEvent: 'Quote is submitted for internal review',
      waitDays: 0,
      condition: 'No open technical review Note exists',
      actionType: 'Create Note',
      actionName: 'Technical review required',
      noteBody: 'Review this Quote against the technical and internal review policy, then record the decision in Quote Review.',
      mention: 'Jeff Mitchel',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Jeff Mitchel',
      actionDue: 'Today'
    },
    'ready-to-send-check': {
      kind: 'stage-template',
      objectType: 'Quote',
      title: 'Ready-to-send check',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Passed Review',
      triggerEvent: 'Quote becomes Passed Review',
      waitDays: 0,
      condition: 'Quote is still viable AND required customer-facing content is complete',
      actionType: 'Create Note',
      actionName: 'Quote ready-to-send check complete',
      noteBody: 'This Quote passed the viability and customer-facing content check. Review it before sending.',
      mention: 'Quote owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Quote owner',
      actionDue: 'Today'
    },
    'quote-expiry-reminder': {
      kind: 'stage-template',
      objectType: 'Quote',
      title: 'Quote expiry reminder',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Sent',
      triggerEvent: 'Quote expiry date is 3 days away',
      waitDays: 0,
      condition: 'Quote is still Sent and remains viable',
      actionType: 'Create Note',
      actionName: 'Quote expiry follow-up',
      noteBody: 'This viable Sent Quote is approaching its expiry date. Follow up with the customer.',
      mention: 'Deal owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Deal owner',
      actionDue: 'Today'
    },
    'lost-deal-follow-up': {
      kind: 'stage-template',
      objectType: 'Deal',
      title: 'Lost Deal reason follow-up',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Lost',
      triggerEvent: 'Deal becomes Lost after no viable related Quote remains',
      waitDays: 0,
      condition: 'Loss reason is empty',
      actionType: 'Create Note',
      actionName: 'Loss reason required',
      noteBody: 'Add the reason this Deal was lost so the outcome is recorded clearly.',
      mention: 'Deal owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Deal owner',
      actionDue: 'Today'
    },
    'custom-stage-next-action': {
      kind: 'stage-template',
      customStageTemplate: true,
      objectType: 'Deal',
      title: 'Custom Stage · Next Action',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerEvent: 'Deal enters this Custom Stage',
      waitDays: 0,
      condition: 'No open Deal Next Action exists',
      actionType: 'Set Deal Next Action',
      actionName: 'Set Deal Next Action',
      nextActionType: 'customer-followup',
      nextActionTitle: 'Complete the next Custom Stage step',
      nextActionDueDays: 1,
      nextActionDueUnit: 'working-days',
      actionOwner: 'Deal owner',
      actionDue: 'In 1 working day'
    },
    'custom-stage-required-files': {
      kind: 'stage-template',
      customStageTemplate: true,
      objectType: 'Deal',
      title: 'Custom Stage · Required files',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerEvent: 'Deal enters this Custom Stage',
      waitDays: 0,
      condition: 'Required file is missing',
      actionType: 'Request a file',
      actionName: 'Request a file',
      actionOwner: 'Deal owner',
      actionDue: 'In 3 days'
    },
    'custom-stage-inactivity': {
      kind: 'stage-template',
      customStageTemplate: true,
      objectType: 'Deal',
      title: 'Custom Stage · Inactivity follow-up',
      enabled: false,
      triggerPipelineId: 'sales-pipeline',
      triggerEvent: 'Deal enters this Custom Stage',
      waitDays: 5,
      condition: 'No new activity',
      actionType: 'Set Deal Next Action',
      actionName: 'Set Deal Next Action',
      nextActionType: 'customer-followup',
      nextActionTitle: 'Follow up inactive Deal',
      nextActionDueDays: 1,
      nextActionDueUnit: 'working-days',
      actionOwner: 'Deal owner',
      actionDue: 'In 1 working day'
    },
    'new-lead-response': {
      kind: 'lead-new',
      objectType: 'Lead',
      title: 'New Lead first contact',
      enabled: false,
      leadTriggerSource: 'any',
      assignmentOwner: 'Round-robin sales team',
      waitDays: 0,
      condition: 'No open first-contact activity exists',
      actionName: 'Create Lead activity',
      activityType: 'call',
      activityTitle: 'First contact',
      actionOwner: 'Lead owner',
      actionDue: 'Today',
      actionTime: '16:00'
    },
    'inactive-lead': {
      kind: 'lead-inactive',
      objectType: 'Lead',
      title: 'Inactive Lead reminder',
      enabled: false,
      waitDays: 2,
      condition: 'No existing inactive Lead reminder',
      actionName: 'Create Lead reminder activity',
      actionOwner: 'Lead owner',
      actionDue: '2 days from the eligibility scan at 10:00 am'
    },
    'client-proposal-approval': {
      kind: 'proposal-approval',
      objectType: 'Deal',
      title: 'Client Proposal & Approval',
      enabled: false,
      // Recommended owners are filled by the template. The Draft opens in the
      // normal builder immediately; users can change each responsibility on
      // the relevant step instead of completing a second setup wizard.
      setupComplete: true,
      triggerEvent: 'Deal enters the qualification stage',
      triggerPipelineId: 'sales-pipeline',
      stageMap: {
        qualify: 'Qualified',
        siteVisit: 'Site Visit',
        sow: 'Scope of Work',
        technicalReview: 'Technical Review',
        quoting: 'In Progress',
        sent: 'Sent'
      },
      responsibilities: {
        clientQualification: 'Deal owner',
        siteVisit: 'Deal owner',
        developSow: 'Deal owner',
        technicalReview: 'Engineering Team',
        developProposal: 'Deal owner',
        internalApproval: 'Commercial Director',
        submitProposal: 'Deal owner',
        clientApproval: 'Deal owner',
        requestInvoice: 'Finance Team'
      },
      technicalReviewDueDays: 2,
      internalApprovalDueDays: 2,
      actionName: 'Run client proposal workflow',
      actionOwner: 'Deal owner',
      actionDue: 'Per workflow step'
    },
    'quote-follow-up': {
      kind: 'quote-sent',
      objectType: 'Quote',
      title: 'Sent Quote follow-up',
      enabled: false,
      triggerStage: 'Sent',
      triggerEvent: 'Quote is sent to the customer',
      waitDays: 3,
      condition: 'No open Deal next action exists',
      actionType: 'Create Note',
      actionName: 'Sent Quote customer follow-up',
      noteBody: 'Follow up with the customer about this viable Sent Quote.',
      mention: 'Deal owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Deal owner',
      actionDue: '3 days after Quote send'
    },
    'won-deal-handoff': {
      kind: 'won-handoff',
      objectType: 'Deal',
      title: 'Won Deal handoff',
      enabled: false,
      triggerStage: 'Won',
      triggerEvent: 'Quote is accepted and Deal becomes Won',
      triggerPipelineId: 'sales-pipeline',
      triggerFromStage: 'Any stage',
      triggerToOutcome: 'won',
      triggerRunMode: 'first',
      waitDays: 0,
      condition: 'No open Deal next action exists',
      actionType: 'Create Note',
      actionName: 'Won Deal handoff',
      noteBody: 'Review the accepted work and complete the next internal handoff for this Won Deal.',
      mention: 'Deal owner',
      followUpDelay: 'today',
      followUpTime: '17:00',
      actionOwner: 'Deal owner',
      actionDue: 'Today'
    },
    'quote-invoice': {
      kind: 'quote-invoice',
      objectType: 'Billing',
      title: 'Accepted Quote → Draft Invoice',
      enabled: false,
      triggerStage: 'Won',
      triggerEvent: 'Quote is accepted',
      waitDays: 0,
      condition: 'Deposit amount is available to invoice',
      actionName: 'Create draft invoice',
      actionOwner: 'Finance team',
      actionDue: 'Review before sending',
      depositPercent: 30,
      billingStage: 'Deposit · 30%',
      invoiceMode: 'Draft only'
    }
  };

  const AUTOMATION_STAGE_DEFINITIONS = [
    {
      name: 'Qualified', label: 'STAGE 1', tone: 'qualified',
      description: 'Deal exists; no related Quote has started.',
      templateKeys: ['qualified-owner-first-action', 'qualified-inactivity', 'pre-quote-readiness'],
      triggerBlockIds: ['trigger-deal-qualified', 'trigger-deal-owner', 'trigger-meeting-change', 'trigger-file-added'],
      triggerChoices: [
        ['trigger-deal-qualified', 'Deal enters Qualified', 'Deal is created or enters Qualified.', '&#xf0ae;', 'Deal'],
        ['trigger-deal-owner', 'Deal Owner changes', 'The Qualified Deal is reassigned.', '&#xf007;', 'Deal'],
        ['trigger-meeting-change', 'Meeting / Site Visit changes', 'A Qualified-stage visit is scheduled or completed.', '&#xf133;', 'Deal'],
        ['trigger-file-added', 'File is added to Deal', 'A discovery, site or customer file is uploaded.', '&#xf15b;', 'Deal'],
        ['trigger-next-action-due', 'Deal Next Action becomes due', 'The current Next Action is due or overdue.', '&#xf017;', 'Deal'],
        ['trigger-expected-close', 'Expected Close Date is approaching', 'Starts before the Deal Expected Close Date.', '&#xf073;', 'Deal']
      ]
    },
    {
      name: 'In Progress', label: 'STAGE 2', tone: 'in-progress',
      description: 'The first related Quote exists and remains editable.',
      templateKeys: ['quote-build-check'],
      triggerBlockIds: ['trigger-quote-created', 'trigger-quote-updated', 'trigger-file-added', 'trigger-note-follow-up', 'trigger-next-action-due', 'trigger-meeting-change'],
      triggerChoices: [
        ['trigger-quote-created', 'First related Quote is created', 'The protected lifecycle has entered In Progress.', '&#xf15c;', 'Quote'],
        ['trigger-quote-updated', 'Quote is edited in In Progress', 'Pricing, products or SOW information changes.', '&#xf044;', 'Quote'],
        ['trigger-file-added', 'File is added to Deal', 'A plan, SOW or supporting file is uploaded.', '&#xf15b;', 'Deal'],
        ['trigger-note-follow-up', 'Note follow-up time is reached', 'A Quote-build follow-up is due or overdue.', '&#xf017;', 'Deal'],
        ['trigger-next-action-due', 'Deal Next Action becomes due', 'The related Deal needs its next sales action.', '&#xf017;', 'Deal'],
        ['trigger-meeting-change', 'Meeting / Site Visit changes', 'A related visit or meeting is scheduled or completed.', '&#xf133;', 'Deal']
      ]
    },
    {
      name: 'In Review', label: 'CONDITIONAL', tone: 'in-review',
      description: 'Only used when the organisation uses Quote Review.',
      templateKeys: ['internal-quote-review'],
      triggerBlockIds: ['trigger-review-submitted', 'trigger-file-added', 'trigger-note-follow-up'],
      triggerChoices: [
        ['trigger-review-submitted', 'Quote is submitted for internal review', 'The protected lifecycle has entered In Review.', '&#xf24e;', 'Quote'],
        ['trigger-review-note-changed', 'Quote Review Note changes', 'A technical review Note is added, updated, completed or becomes due.', '&#xf249;', 'Quote'],
        ['trigger-file-added', 'File is added to Deal', 'A technical or approval file is uploaded while review is open.', '&#xf15b;', 'Deal'],
        ['trigger-note-follow-up', 'Note follow-up time is reached', 'A review Note is due or overdue.', '&#xf017;', 'Deal']
      ]
    },
    {
      name: 'Passed Review', label: 'CONDITIONAL', tone: 'passed-review',
      description: 'Internal review passed; the Quote is ready for final checks.',
      templateKeys: ['ready-to-send-check'],
      triggerBlockIds: ['trigger-review-passed', 'trigger-file-added', 'trigger-next-action-due'],
      triggerChoices: [
        ['trigger-review-passed', 'Quote becomes Passed Review', 'Internal review has passed.', '&#xf058;', 'Quote'],
        ['trigger-file-added', 'File is added to Deal', 'A final customer-facing document is uploaded.', '&#xf15b;', 'Deal'],
        ['trigger-next-action-due', 'Deal Next Action becomes due', 'The related Deal needs its next commercial action.', '&#xf017;', 'Deal']
      ]
    },
    {
      name: 'Sent', label: 'STAGE 5', tone: 'sent',
      description: 'The customer has received a viable Quote.',
      templateKeys: ['quote-follow-up', 'quote-expiry-reminder'],
      triggerBlockIds: ['trigger-quote-sent', 'trigger-quote-viewed', 'trigger-quote-expiry', 'trigger-next-action-due', 'trigger-note-follow-up', 'trigger-file-added'],
      triggerChoices: [
        ['trigger-quote-sent', 'Quote is Sent', 'Starts on the first send of each revision.', '&#xf1d8;', 'Quote'],
        ['trigger-quote-viewed', 'Customer views a Sent Quote', 'Starts when the customer view flag turns on.', '&#xf06e;', 'Quote'],
        ['trigger-quote-expiry', 'Quote expiry is approaching', 'Derived from Sent plus the expiry date.', '&#xf073;', 'Quote'],
        ['trigger-next-action-due', 'Deal Next Action becomes due', 'The related Deal needs a customer follow-up.', '&#xf017;', 'Deal'],
        ['trigger-note-follow-up', 'Note follow-up time is reached', 'A Sent-stage follow-up is due or overdue.', '&#xf017;', 'Deal'],
        ['trigger-file-added', 'File is added to Deal', 'A customer or commercial file is uploaded.', '&#xf15b;', 'Deal']
      ]
    },
    {
      name: 'Won', label: 'DERIVED OUTCOME', tone: 'won',
      description: 'Any relevant Quote is Accepted; WeQuote derives Won.',
      templateKeys: ['won-deal-handoff', 'quote-invoice'],
      triggerBlockIds: ['trigger-quote-accepted', 'trigger-file-added', 'trigger-note-follow-up', 'trigger-next-action-due'],
      triggerChoices: [
        ['trigger-quote-accepted', 'Quote is accepted', 'Uses the protected trusted acceptance event.', '&#xf091;', 'Quote'],
        ['trigger-file-added', 'File is added to Deal', 'A PO, contract or handover file is uploaded.', '&#xf15b;', 'Deal'],
        ['trigger-note-follow-up', 'Note follow-up time is reached', 'A Won handoff Note becomes due.', '&#xf017;', 'Deal'],
        ['trigger-next-action-due', 'Deal Next Action becomes due', 'The next delivery or finance handoff is due.', '&#xf017;', 'Deal']
      ]
    },
    {
      name: 'Lost', label: 'DERIVED OUTCOME', tone: 'lost',
      description: 'No viable related Quote remains; WeQuote derives Lost.',
      templateKeys: ['lost-deal-follow-up'],
      triggerBlockIds: ['trigger-deal-lost', 'trigger-note-follow-up', 'trigger-file-added'],
      triggerChoices: [
        ['trigger-deal-lost', 'Deal becomes Lost', 'No viable related Quote remains.', '&#xf024;', 'Deal'],
        ['trigger-note-follow-up', 'Note follow-up time is reached', 'A Lost reason or re-engagement Note becomes due.', '&#xf017;', 'Deal'],
        ['trigger-file-added', 'File is added to Deal', 'A close-out or evidence file is uploaded.', '&#xf15b;', 'Deal']
      ]
    }
  ];

  const TEMPLATE_STAGE_BY_KEY = AUTOMATION_STAGE_DEFINITIONS.reduce(function (result, stage) {
    stage.templateKeys.forEach(function (key) { result[key] = stage.name; });
    return result;
  }, {});

  const AUTOMATION_OWNING_COMPANIES = (window.WeQuoteOwningCompanies || [
    { id: 'main-company', name: 'AUDIOVISIONS — Main Company', shortName: 'Main Company' },
    { id: 'los-angeles', name: 'AUDIOVISIONS — Los Angeles', shortName: 'Los Angeles' },
    { id: 'northern-california', name: 'AUDIOVISIONS — Northern California', shortName: 'Northern California' },
    { id: 'orange-county', name: 'AUDIOVISIONS — Orange County', shortName: 'Orange County' },
    { id: 'palm-desert', name: 'AUDIOVISIONS — Palm Desert', shortName: 'Palm Desert' }
  ]).map(function (company) { return Object.assign({}, company); });
  // Creator context is also read while persisted workflows are repaired during startup,
  // so it must exist before restoreAutomationPrototypeState() runs.
  let selectedTemplatePipelineId = null;
  let selectedAutomationStageContext = null;

  function automationCompanyById(id) {
    return AUTOMATION_OWNING_COMPANIES.find(function (company) { return company.id === id; }) || AUTOMATION_OWNING_COMPANIES[0];
  }

  function normalizeAutomationCompanyScope(config) {
    if (!config) return config;
    const allowedModes = ['all', 'selected', 'all-except'];
    config.companyScopeMode = allowedModes.includes(config.companyScopeMode) ? config.companyScopeMode : 'all';
    config.companyScopeIds = Array.isArray(config.companyScopeIds)
      ? config.companyScopeIds.filter(function (id, index, list) { return AUTOMATION_OWNING_COMPANIES.some(function (company) { return company.id === id; }) && list.indexOf(id) === index; })
      : [];
    if (config.companyScopeMode !== 'all' && !config.companyScopeIds.length) config.companyScopeMode = 'all';
    if (config.companyScopeMode === 'all') config.companyScopeIds = [];
    return config;
  }

  function automationCompanyScopeLabel(config, compact) {
    normalizeAutomationCompanyScope(config);
    const names = config.companyScopeIds.map(function (id) { return automationCompanyById(id).shortName || automationCompanyById(id).name; });
    if (config.companyScopeMode === 'all') return 'All Companies';
    if (config.companyScopeMode === 'all-except') return 'All except ' + names.join(', ');
    if (names.length === 1) return names[0] + (compact ? '' : ' only');
    return names.length + ' selected Companies';
  }

  function automationCompanyScopeAppliedCompanies(config) {
    normalizeAutomationCompanyScope(config);
    if (config.companyScopeMode === 'all') return AUTOMATION_OWNING_COMPANIES.slice();
    return AUTOMATION_OWNING_COMPANIES.filter(function (company) {
      const selected = config.companyScopeIds.indexOf(company.id) >= 0;
      return config.companyScopeMode === 'all-except' ? !selected : selected;
    });
  }

  function automationCompanyScopePillItemsMarkup(config) {
    normalizeAutomationCompanyScope(config);
    if (config.companyScopeMode === 'all') return '<span class="all"><i class="fai">&#xf1ad;</i> All Companies</span>';
    return automationCompanyScopeAppliedCompanies(config).map(function (company) {
      return '<span title="' + escapeAutomationHtml(company.name) + '"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(company.shortName || company.name) + '</span>';
    }).join('');
  }

  function automationCompanyScopePillsMarkup(config, modifier) {
    return '<div class="aut-scope-pills' + (modifier ? ' ' + escapeAutomationHtml(modifier) : '') + '">' + automationCompanyScopePillItemsMarkup(config) + '</div>';
  }

  function automationCompanyScopeTitle(config) {
    normalizeAutomationCompanyScope(config);
    if (config.companyScopeMode === 'all') return 'All Companies';
    return automationCompanyScopeAppliedCompanies(config).map(function (company) { return company.shortName || company.name; }).join(', ');
  }

  function automationCompanyScopeDetailMarkup(config, copy) {
    return '<div class="aut-detail-company-scope"><div><small>OWNING COMPANY SCOPE</small><strong><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong><span>' + escapeAutomationHtml(copy || 'Only records owned by these Companies can enter this Automation.') + '</span></div>' + automationCompanyScopePillsMarkup(config) + '</div>';
  }

  function automationCompanyScopeBeforeAfterMarkup(config) {
    return '<span class="aut-before-after-company"><i class="fai">&#xf1ad;</i> Applies to ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</span>' + automationCompanyScopePillsMarkup(config, 'compact');
  }

  function automationRecordMatchesCompanyScope(config, record) {
    normalizeAutomationCompanyScope(config);
    const recordCompanyId = record && record.owningCompanyId ? record.owningCompanyId : 'main-company';
    if (config.companyScopeMode === 'all') return true;
    if (config.companyScopeMode === 'all-except') return config.companyScopeIds.indexOf(recordCompanyId) < 0;
    return config.companyScopeIds.indexOf(recordCompanyId) >= 0;
  }

  function automationCompanyScopesOverlap(first, second) {
    return AUTOMATION_OWNING_COMPANIES.some(function (company) {
      return automationRecordMatchesCompanyScope(first, { owningCompanyId: company.id }) && automationRecordMatchesCompanyScope(second, { owningCompanyId: company.id });
    });
  }

  function automationOutcomeKey(config) {
    return [config.templateKey || '', workflowStageName(config), String(config.triggerEvent || (config.editableTrigger && config.editableTrigger.title) || '').toLowerCase()].join('|');
  }

  function automationCompanyScopeConflicts(config) {
    if (!config || config.protected) return [];
    const currentKey = Object.keys(workflows).find(function (key) { return workflows[key] === config; });
    const outcome = automationOutcomeKey(config);
    return userWorkflowKeys().filter(function (key) {
      const candidate = workflows[key];
      return key !== currentKey && candidate.enabled && automationOutcomeKey(candidate) === outcome && automationCompanyScopesOverlap(config, candidate);
    });
  }

  function automationPipelineUsesQuoteLifecycle(pipeline) {
    if (!pipeline) return false;
    if (typeof pipelineUsesQuoteLifecycle === 'function') return pipelineUsesQuoteLifecycle(pipeline);
    if (pipeline.type === 'standalone' || pipeline.quoteConnected === false) return false;
    return pipeline.type === 'quote-connected' || pipeline.quoteConnected === true || pipeline.id === 'sales-pipeline';
  }

  function automationPipelineById(pipelineId) {
    return automationPipelines().find(function (pipeline) { return pipeline.id === pipelineId; }) || null;
  }

  function automationStageLookup(stageName, pipelineId) {
    const pipeline = automationPipelineById(pipelineId) ||
      (typeof getActivePipeline === 'function' ? getActivePipeline() : null) || automationPipelines()[0];
    let stage = pipeline && automationPipelineStages(pipeline).find(function (item) { return item && item.name === stageName; });
    if (!stage && selectedAutomationStageContext && selectedAutomationStageContext.pipelineId === (pipeline && pipeline.id) &&
      typeof CRM_STAGE_DEFS !== 'undefined' && Array.isArray(CRM_STAGE_DEFS)) {
      stage = CRM_STAGE_DEFS.find(function (item) { return item && item.name === stageName; });
    }
    return { pipeline: pipeline, stage: stage || null };
  }

  function genericCustomStageTriggerChoices(stageName) {
    return [
      ['trigger-deal-custom-stage', 'Deal enters ' + stageName, 'The Deal moves into this Stage.', '&#xf0ae;', 'Deal'],
      ['trigger-deal-owner', 'Deal Owner changes', 'The Deal is reassigned while it is in ' + stageName + '.', '&#xf007;', 'Deal'],
      ['trigger-next-action-due', 'Deal Next Action changes', 'The current Next Action becomes due, overdue or complete.', '&#xf017;', 'Deal'],
      ['trigger-meeting-change', 'Meeting / Site Visit changes', 'A related meeting or Site Visit is scheduled, starts or completes.', '&#xf133;', 'Deal'],
      ['trigger-file-added', 'File is added to Deal', 'A Deal file is uploaded while the Deal is in this Stage.', '&#xf15b;', 'Deal'],
      ['trigger-file-request-completed', 'Requested file is received', 'A required file request is completed.', '&#xf56f;', 'Deal'],
      ['trigger-deal-data-changed', 'Deal data changes', 'Owner, Label, Interest, Value, Company or Expected Close changes.', '&#xf044;', 'Deal'],
      ['trigger-deal-inactivity', 'Deal has no activity for a set time', 'Starts after the chosen number of inactive days.', '&#xf017;', 'Deal'],
      ['trigger-expected-close', 'Expected Close Date is approaching', 'Starts before the Deal Expected Close Date.', '&#xf073;', 'Deal']
    ];
  }

  function quoteSegmentTriggerChoices(stageName, segment) {
    const entry = ['trigger-deal-custom-stage', 'Deal enters ' + stageName, 'The Deal moves into this Custom Stage.', '&#xf0ae;', 'Deal'];
    const common = genericCustomStageTriggerChoices(stageName).slice(1);
    const quoteChoices = {
      Qualified: [],
      'In Progress': [
        ['trigger-quote-created', 'First related Quote is created', 'The first editable Quote starts the protected In Progress lifecycle.', '&#xf15c;', 'Quote'],
        ['trigger-quote-updated', 'Quote build changes', 'Products, pricing or Scope of Work changes on a related Quote.', '&#xf044;', 'Quote']
      ],
      'In Review': [
        ['trigger-review-submitted', 'Quote is submitted for internal review', 'The protected review process starts.', '&#xf24e;', 'Quote'],
        ['trigger-review-note-changed', 'Quote Review Note changes', 'A technical review Note is added, updated, completed or becomes due.', '&#xf249;', 'Quote']
      ],
      'Passed Review': [
        ['trigger-review-passed', 'Quote becomes Passed Review', 'The protected internal review result is Passed Review.', '&#xf058;', 'Quote'],
        ['trigger-quote-updated', 'Approved Quote content changes', 'Customer-facing content or commercial data changes before sending.', '&#xf044;', 'Quote']
      ],
      Sent: [
        ['trigger-quote-sent', 'Quote is Sent', 'Starts on the first send of each revision.', '&#xf1d8;', 'Quote'],
        ['trigger-quote-viewed', 'Customer views a Sent Quote', 'A related Quote view flag turns on.', '&#xf06e;', 'Quote'],
        ['trigger-quote-expiry', 'Quote expiry is approaching', 'Starts before a viable Sent Quote expires.', '&#xf073;', 'Quote'],
        ['trigger-quote-accepted', 'Quote is accepted', 'Uses the trusted protected acceptance event.', '&#xf058;', 'Quote']
      ]
    };
    return [entry].concat(quoteChoices[segment] || [], common);
  }

  function automationStageDefinition(stageName, pipelineId) {
    const lookup = automationStageLookup(stageName, pipelineId);
    const pipeline = lookup.pipeline;
    const pipelineStage = lookup.stage;
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const protectedDefinition = AUTOMATION_STAGE_DEFINITIONS.find(function (stage) { return stage.name === stageName; });

    if (pipelineStage && quoteConnected && pipelineStage.protected && protectedDefinition) {
      return Object.assign({}, protectedDefinition, {
        stageId: automationStageStableId(pipelineStage, pipeline, automationPipelineStages(pipeline).indexOf(pipelineStage)),
        pipelineId: pipeline && pipeline.id,
        pipelineType: 'quote-connected',
        quoteConnected: true,
        triggerBlockIds: protectedDefinition.triggerChoices.map(function (choice) { return choice[0]; })
      });
    }
    if (!pipelineStage && protectedDefinition && !pipelineId) return protectedDefinition;
    if (!pipelineStage) return null;
    if (pipelineStage.outcome && protectedDefinition && !quoteConnected) {
      const outcomeChoices = genericCustomStageTriggerChoices(stageName);
      outcomeChoices[0] = ['trigger-deal-custom-stage', 'Deal enters ' + stageName, 'The Deal is explicitly marked ' + stageName + ' in this Fully Custom Pipeline.', '&#xf0ae;', 'Deal'];
      return {
        name: stageName,
        stageId: automationStageStableId(pipelineStage, pipeline, automationPipelineStages(pipeline).indexOf(pipelineStage)),
        pipelineId: pipeline ? pipeline.id : pipelineId,
        pipelineType: 'standalone',
        quoteConnected: false,
        protectedOutcome: true,
        label: 'PROTECTED DEAL OUTCOME',
        tone: pipelineStage.outcome === 'won' ? 'won' : 'lost',
        custom: false,
        description: 'Deal-level outcome in a Fully Custom Pipeline. It is not driven by the Quote lifecycle.',
        templateKeys: [],
        triggerBlockIds: outcomeChoices.map(function (choice) { return choice[0]; }),
        triggerChoices: outcomeChoices
      };
    }

    const segment = quoteConnected ? (pipelineStage.lifecycleSegment || 'Qualified') : '';
    const choices = quoteConnected
      ? quoteSegmentTriggerChoices(stageName, segment)
      : genericCustomStageTriggerChoices(stageName);
    return {
      name: stageName,
      stageId: pipelineStage.customStageId ||
        (selectedAutomationStageContext && selectedAutomationStageContext.stageName === stageName ? selectedAutomationStageContext.stageId : '') ||
        ('stage-' + (pipeline ? pipeline.id : 'pipeline') + '-' + automationPipelineStages(pipeline).indexOf(pipelineStage)),
      pipelineId: pipeline ? pipeline.id : pipelineId,
      pipelineType: quoteConnected ? 'quote-connected' : 'standalone',
      quoteConnected: quoteConnected,
      label: quoteConnected ? ('CUSTOM · ' + segment.toUpperCase() + ' SEGMENT') : 'FULLY CUSTOM · SHARED LIBRARY',
      tone: 'custom',
      custom: true,
      lifecycleSegment: segment,
      description: quoteConnected
        ? 'Customer-defined Stage inside the protected ' + segment + ' lifecycle segment.'
        : 'Customer-defined Stage. Its name does not change the shared Starts when, Rules or Actions library.',
      templateKeys: ['custom-stage-next-action', 'custom-stage-required-files', 'custom-stage-inactivity'],
      triggerBlockIds: choices.map(function (choice) { return choice[0]; }),
      triggerChoices: choices
    };
  }

  function defaultAutomationTriggerForStage(stageName, pipelineId) {
    const stage = automationStageDefinition(stageName, pipelineId) || AUTOMATION_STAGE_DEFINITIONS[0];
    const choice = stage.triggerChoices[0];
    return { id: choice[0], title: choice[1], detail: choice[2], icon: choice[3], objectType: choice[4] };
  }

  function automationStageForTemplateKey(templateKey, stageHint) {
    const selectedPipeline = automationPipelineById(selectedTemplatePipelineId);
    const selectedTemplate = templateDefinitions[templateKey];
    if (stageHint && selectedPipeline && !automationPipelineUsesQuoteLifecycle(selectedPipeline) && !(selectedTemplate && selectedTemplate.customStageTemplate)) return '';
    if (TEMPLATE_STAGE_BY_KEY[templateKey]) return TEMPLATE_STAGE_BY_KEY[templateKey];
    if (templateDefinitions[templateKey] && templateDefinitions[templateKey].customStageTemplate) {
      const hintedStage = automationStageDefinition(stageHint, selectedTemplatePipelineId);
      return hintedStage && hintedStage.custom ? hintedStage.name : '';
    }
    const conceptKey = String(templateKey || '').replace(/^concept-/, '');
    const conceptStages = {
      'first-action': 'Qualified', inactivity: 'Qualified', proposal: 'Qualified',
      'quote-build': 'In Progress', 'internal-review': 'In Review', 'ready-send': 'Passed Review',
      'high-value': 'Passed Review', 'sent-follow-up': 'Sent', 'expiry-reminder': 'Sent',
      'accepted-handoff': 'Won', 'commercial-complete': 'Lost'
    };
    return conceptStages[conceptKey] || '';
  }

  function repairWorkflowStageAlignment(config) {
    if (!config || config.protected || config.objectType === 'Lead') return;
    const sourceTemplate = templateDefinitions[config.templateKey];
    const canonicalStage = sourceTemplate && sourceTemplate.customStageTemplate
      ? config.triggerStage
      : (automationStageForTemplateKey(config.templateKey) || config.triggerStage);
    if (!automationStageDefinition(canonicalStage, config.triggerPipelineId)) return;
    config.triggerStage = canonicalStage;
    const stageDefinition = automationStageDefinition(canonicalStage, config.triggerPipelineId);
    const allowedTitles = stageDefinition.triggerChoices.map(function (choice) { return choice[1]; });
    if (sourceTemplate && sourceTemplate.triggerEvent && !sourceTemplate.customStageTemplate) config.triggerEvent = sourceTemplate.triggerEvent;
    const currentTriggerTitle = config.editableTrigger && canonicalScratchTriggerTitle(config.editableTrigger.title);
    const sourceTitle = sourceTemplate && !sourceTemplate.customStageTemplate && sourceTemplate.triggerEvent;
    const compatibleTitles = allowedTitles.concat(sourceTitle ? [sourceTitle] : []);
    if (sourceTemplate && config.editableTrigger && !compatibleTitles.includes(currentTriggerTitle)) {
      config.editableTrigger = {
        title: sourceTemplate.triggerEvent || defaultAutomationTriggerForStage(canonicalStage, config.triggerPipelineId).title,
        detail: automationPipelineName(config) + ' · ' + canonicalStage
      };
    } else if (!sourceTemplate && config.editableTrigger && allowedTitles.length && !allowedTitles.includes(currentTriggerTitle)) {
      const fallback = defaultAutomationTriggerForStage(canonicalStage, config.triggerPipelineId);
      config.editableTrigger = { title: fallback.title, detail: automationPipelineName(config) + ' · ' + canonicalStage };
      config.triggerEvent = fallback.title;
      config.objectType = fallback.objectType;
    }
    if (config.stageLocked == null && config.templateKey) config.stageLocked = true;
  }

  const workflows = {
    'lead-conversion': {
      kind: 'lead-conversion',
      objectType: 'Lead',
      title: 'Lead to Deal conversion',
      enabled: true,
      protected: true,
      triggerEvent: 'A Lead is converted to a Deal',
      targetStage: 'Qualified',
      waitDays: 0,
      condition: 'Deal was created successfully',
      actionName: 'Create first Deal next action',
      actionOwner: 'Deal owner',
      actionDue: 'Chosen during conversion'
    }
  };

  const AUTOMATION_STORAGE_KEY = 'wequote-crm-automation-state-v2';
  let automationRuntimeState = { roundRobinIndex: 0, runs: [] };

  function restoreAutomationPrototypeState() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUTOMATION_STORAGE_KEY) || 'null');
      if (!stored || !stored.workflows) return;
      Object.keys(stored.workflows).forEach(function (key) {
        if (workflows[key] && workflows[key].protected) return;
        workflows[key] = stored.workflows[key];
        repairStaleReadinessTemplate(workflows[key]);
        repairQualifiedNextActionTemplate(workflows[key]);
        repairUnsupportedReviewActions(workflows[key]);
        repairNoteBasedTemplateActions(workflows[key]);
        repairCreateQuoteActions(workflows[key]);
        repairWorkflowStageAlignment(workflows[key]);
      });
      automationRuntimeState.roundRobinIndex = Number(stored.roundRobinIndex) || 0;
      automationRuntimeState.runs = Array.isArray(stored.runs) ? stored.runs : [];
    } catch (_) {}
  }

  function ensureCustomStageDemoWorkflow() {
    const key = 'demo-site-ready-documents';
    if (workflows[key]) return;
    const siteReady = automationStageDefinition('Site Ready', 'sales-pipeline');
    if (!siteReady || !siteReady.custom) return;
    workflows[key] = {
      kind: 'scratch',
      editableDraft: true,
      title: 'Site Ready · Plans & first Quote',
      enabled: false,
      triggerKind: 'trigger-deal-custom-stage',
      objectType: 'Deal',
      triggerPipelineId: 'sales-pipeline',
      triggerStage: 'Site Ready',
      triggerEvent: 'Deal enters Site Ready',
      stageLocked: true,
      companyScopeMode: 'all',
      companyScopeIds: [],
      editableTrigger: { title: 'Deal enters Site Ready', detail: 'Sales Pipeline · Custom Stage' },
      automationGroupKey: 'standard',
      demoWorkflow: true,
      steps: [{
        type: 'condition',
        condition: 'Required site plans or drawings are missing',
        yesSteps: [{
          type: 'action', action: 'Request a file',
          fileRequestName: 'Site plans or drawings', fileRequestFrom: 'Primary Deal contact',
          fileRequestTypes: 'Drawing or CAD file', fileRequestDueDays: 3,
          owner: 'Deal owner', completionMode: 'required', blockedEvent: 'first-related-quote'
        }],
        noSteps: [{
          type: 'action', action: 'Set Deal Next Action', nextActionType: 'proposal',
          nextActionTitle: 'Create first Quote', nextActionDueDays: 1,
          nextActionDueUnit: 'working-days', nextActionPolicy: 'replace-if-overdue',
          owner: 'Deal owner', completionMode: 'optional', blockedEvent: ''
        }]
      }]
    };
  }

  function resetAutomationPrototypeState() {
    // This is a repeatable prototype: refresh always returns Automation to its
    // clean first-time state without clearing the underlying CRM demo records.
    try { localStorage.removeItem(AUTOMATION_STORAGE_KEY); } catch (_) {}
    automationRuntimeState = { roundRobinIndex: 0, runs: [] };

    if (typeof CRM_LEADS !== 'undefined') {
      CRM_LEADS.forEach(function (lead) {
        if (!Array.isArray(lead.activities)) return;
        lead.activities = lead.activities.filter(function (activity) {
          return activity.source !== 'automation' && !activity.automationWorkflow;
        });
      });
      if (typeof saveLeadState === 'function') saveLeadState();
    }

    if (typeof CRM_DEALS !== 'undefined') {
      CRM_DEALS.forEach(function (deal) {
        if (deal.nextAction && (deal.nextAction.source === 'automation' || deal.nextAction.automationWorkflow)) {
          delete deal.nextAction;
        }
        if (Array.isArray(deal.automationTasks)) {
          deal.automationTasks = deal.automationTasks.filter(function (task) {
            return task.source !== 'automation' && !task.automationWorkflow;
          });
        }
        if (Array.isArray(deal.actionHistory)) {
          deal.actionHistory = deal.actionHistory.filter(function (entry) {
            return String(entry.id || '').indexOf('proposal-automation-') !== 0;
          });
        }
        delete deal.proposalAutomationRun;
        delete deal.proposalAutomationRuns;
        delete deal.automationStageRuns;
        delete deal.preQuoteReadinessTask;
      });
      if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    }

    // Applying the proposal template changes the Pipeline during the demo. A
    // page refresh restores the five-stage starting point so the next person
    // can replay the same Before → Apply → After journey from zero.
    if (typeof CRM_PIPELINES !== 'undefined') {
      const demoStageNames = ['Site Visit', 'Scope of Work', 'Technical Review'];
      let activePipelineWasReset = false;
      CRM_PIPELINES.forEach(function (pipeline) {
        const beforeStages = Array.isArray(pipeline.stages) ? pipeline.stages.slice() : [];
        const hasDemoStages = beforeStages.some(function (stage) {
          return stage && stage.templateKey === 'client-proposal-approval';
        });
        if (!hasDemoStages) return;
        const dealStageNames = (pipeline.deals || []).map(function (deal) {
          return beforeStages[deal.s] ? beforeStages[deal.s].name : '';
        });
        pipeline.stages = beforeStages.filter(function (stage) {
          return !stage || stage.templateKey !== 'client-proposal-approval';
        });
        (pipeline.deals || []).forEach(function (deal, index) {
          const previousName = dealStageNames[index];
          const safeName = demoStageNames.includes(previousName) ? 'Qualified' : previousName;
          const nextIndex = pipeline.stages.findIndex(function (stage) { return stage.name === safeName; });
          deal.s = nextIndex >= 0 ? nextIndex : 0;
        });
        if (typeof getActivePipeline === 'function' && getActivePipeline() === pipeline) activePipelineWasReset = true;
      });
      if (activePipelineWasReset && typeof getActivePipeline === 'function' && typeof loadPipelineState === 'function') {
        loadPipelineState(getActivePipeline());
        if (typeof rebuildPipelineColumns === 'function') rebuildPipelineColumns();
      }
      if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    }

    if (typeof DEAL_BILLING !== 'undefined') {
      Object.keys(DEAL_BILLING).forEach(function (dealTitle) {
        DEAL_BILLING[dealTitle] = (DEAL_BILLING[dealTitle] || []).filter(function (invoice) {
          return invoice.source !== 'automation' && !invoice.automationWorkflow;
        });
      });
    }
  }

  function normalizeNewLeadWorkflow(config) {
    config = config || templateDefinitions['new-lead-response'];
    if (!config) return;
    const supportedTypes = ['call', 'qualification', 'meeting', 'site-visit', 'other'];
    if (config === templateDefinitions['new-lead-response'] || /^New Lead response(?:\s|$)/.test(config.title || '')) {
      config.title = String(config.title || '').replace(/^New Lead response/, 'New Lead first contact') || 'New Lead first contact';
    }
    config.condition = 'No open first-contact activity exists';
    // Phase 1 emits one supported Lead-created event. Source-specific form/import
    // events are not available yet, so do not offer settings the runtime cannot honour.
    config.leadTriggerSource = 'any';
    config.actionName = 'Create Lead activity';
    config.activityType = supportedTypes.includes(config.activityType) ? config.activityType : 'call';
    config.activityTitle = String(config.activityTitle || 'First contact').trim() || 'First contact';
    config.actionOwner = 'Lead owner';
    config.actionDue = 'Today';
    config.actionTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(config.actionTime || '') ? config.actionTime : '16:00';
  }

  function normalizeSupportedWorkflow(config) {
    if (!config || config.protected) return;
    normalizeAutomationCompanyScope(config);
    const isReadinessTemplate = config.templateKey === 'pre-quote-readiness' || String(config.title || '').toLowerCase().includes('pre-quote readiness');
    config.completionMode = config.completionMode === 'required' || (config.completionMode == null && isReadinessTemplate) ? 'required' : 'optional';
    if (config.completionMode === 'required') {
      config.blockedEvent = config.blockedEvent || (config.objectType === 'Lead' ? 'convert-to-deal' : 'first-related-quote');
    } else {
      config.blockedEvent = '';
    }
    if (isProposalApproval(config)) {
      const pipeline = automationPipelineForConfig(config);
      config.triggerPipelineId = pipeline ? pipeline.id : (config.triggerPipelineId || 'sales-pipeline');
      config.stageMap = proposalStageMapForPipeline(pipeline, config.stageMap);
      config.responsibilities = Object.assign({
        clientQualification: 'Deal owner', siteVisit: 'Deal owner', developSow: 'Deal owner',
        technicalReview: 'Engineering Team', developProposal: 'Deal owner',
        internalApproval: 'Commercial Director', submitProposal: 'Deal owner',
        clientApproval: 'Deal owner', requestInvoice: 'Finance Team'
      }, config.responsibilities || {});
      config.technicalReviewDueDays = Math.max(1, Number(config.technicalReviewDueDays) || 2);
      config.internalApprovalDueDays = Math.max(1, Number(config.internalApprovalDueDays) || 2);
      // Older prototype Drafts may not have this flag. Treat the supplied
      // defaults as a complete starting point and keep editing in the builder.
      config.setupComplete = config.setupComplete !== false || !!config.pipelineTemplateApplied;
      return;
    }
    if (isNewLeadWorkflow(config)) {
      normalizeNewLeadWorkflow(config);
      return;
    }
    if (isInactiveLeadWorkflow(config)) {
      config.waitDays = Math.max(0, Number(config.waitDays) || 2);
      config.condition = 'No existing inactive Lead reminder';
      config.actionName = 'Create Lead reminder activity';
      config.actionOwner = 'Lead owner';
      config.actionDue = config.waitDays + ' days from eligibility scan at 10:00 am';
      return;
    }
    if (isQuoteWorkflow(config)) {
      config.waitDays = Math.max(0, Number(config.waitDays) || 3);
      config.condition = 'No open Deal next action exists';
      config.actionType = 'Create Note';
      config.actionName = 'Sent Quote customer follow-up';
      config.noteBody = config.noteBody || 'Follow up with the customer about this viable Sent Quote.';
      config.mention = config.mention || 'Deal owner';
      config.followUpDelay = config.followUpDelay || 'today';
      config.followUpTime = config.followUpTime || '17:00';
      config.actionOwner = 'Deal owner';
      config.actionDue = config.waitDays + ' days after Quote send';
      return;
    }
    if (isWonHandoff(config)) {
      const pipeline = automationPipelineForConfig(config);
      const stages = automationPipelineStages(pipeline);
      const wonStage = stages.find(function (stage) { return stage.outcome === 'won'; }) || stages.find(function (stage) { return stage.name === 'Won'; }) || stages[stages.length - 1];
      config.triggerEvent = 'Quote is accepted and Deal becomes Won';
      config.triggerPipelineId = pipeline ? pipeline.id : (config.triggerPipelineId || 'sales-pipeline');
      config.triggerFromStage = config.triggerFromStage || 'Any stage';
      config.triggerToOutcome = 'won';
      config.triggerToStage = wonStage ? wonStage.name : 'Won';
      config.triggerRunMode = 'first';
      config.condition = 'No open Deal next action exists';
      config.actionType = 'Create Note';
      config.actionName = 'Won Deal handoff';
      config.noteBody = config.noteBody || 'Review the accepted work and complete the next internal handoff for this Won Deal.';
      config.mention = config.mention || 'Deal owner';
      config.followUpDelay = config.followUpDelay || 'today';
      config.followUpTime = config.followUpTime || '17:00';
      config.actionOwner = 'Deal owner';
      config.actionDue = 'Today';
      return;
    }
    if (isQuoteInvoice(config)) {
      config.objectType = 'Billing';
      config.condition = 'Deposit amount is available to invoice';
      config.actionName = 'Create draft invoice';
      config.depositPercent = Math.max(1, Math.min(100, Number(config.depositPercent) || 30));
      config.billingStage = 'Deposit · ' + config.depositPercent + '%';
      config.invoiceMode = 'Draft only';
      return;
    }
  }

  function persistAutomationState() {
    try {
      localStorage.setItem(AUTOMATION_STORAGE_KEY, JSON.stringify({
        workflows: workflows,
        roundRobinIndex: automationRuntimeState.roundRobinIndex,
        runs: automationRuntimeState.runs.slice(0, 40)
      }));
      setAutomationSaveStatus(true);
    } catch (_) {}
  }

  function setAutomationSaveStatus(saved) {
    if (!saveStatus) return;
    saveStatus.classList.toggle('dirty', !saved);
    saveStatus.innerHTML = saved
      ? '<i class="fai">&#xf058;</i> Draft saved · Just now'
      : '<i class="fai">&#xf111;</i> Unpublished changes';
    const undoButton = document.getElementById('autEditorUndo');
    const saveButton = document.getElementById('autSaveDraft');
    if (undoButton) undoButton.disabled = saved;
    if (saveButton) saveButton.disabled = saved;
    syncAutomationDraftUi();
  }

  // Keep user-created Drafts and their On / Off state when moving between the
  // Automation builder and the CRM Pipeline (and after a normal page refresh).
  // resetAutomationPrototypeState() remains available for a deliberate demo
  // reset, but must not run during normal application startup.
  restoreAutomationPrototypeState();
  ensureCustomStageDemoWorkflow();
  Object.keys(templateDefinitions).forEach(function (key) {
    normalizeSupportedWorkflow(templateDefinitions[key]);
    repairQualifiedNextActionTemplate(templateDefinitions[key]);
    repairUnsupportedReviewActions(templateDefinitions[key]);
    repairNoteBasedTemplateActions(templateDefinitions[key]);
    repairCreateQuoteActions(templateDefinitions[key]);
    repairWorkflowStageAlignment(templateDefinitions[key]);
  });
  Object.keys(workflows).forEach(function (key) {
    normalizeSupportedWorkflow(workflows[key]);
    repairQualifiedNextActionTemplate(workflows[key]);
    repairUnsupportedReviewActions(workflows[key]);
    repairNoteBasedTemplateActions(workflows[key]);
    repairCreateQuoteActions(workflows[key]);
    repairWorkflowStageAlignment(workflows[key]);
    if (workflows[key].testInProgress) {
      workflows[key].testInProgress = false;
      if (automationHasDraftChanges(workflows[key])) workflows[key].needsTesting = true;
    }
  });

  let activeWorkflowKey = Object.keys(workflows).find(function (key) { return !workflows[key].protected; }) || null;
  let activeNode = 'trigger';
  let draftCounter = Math.max(0, Object.keys(workflows).filter(function (key) { return !workflows[key].protected; }).length);

  const workflowTitle = document.getElementById('autWorkflowTitle');
  const workflowMeta = document.getElementById('autWorkflowMeta');
  const draftBanner = document.getElementById('autDraftBanner');
  const plainSummary = document.getElementById('autPlainSummary');
  const summaryLabel = automationView.querySelector('.aut-summary strong');
  const inspectorStep = document.getElementById('autInspectorStep');
  const inspectorTitle = document.getElementById('autInspectorTitle');
  const inspectorBody = document.getElementById('autInspectorBody');
  const inspectorFoot = document.getElementById('autInspectorFoot');
  const publishButton = document.getElementById('autPublishWorkflow');
  const selectedPlayButton = document.getElementById('autPlaySelectedWorkflow');
  const yourAutomations = document.getElementById('autYourAutomations');
  const yourEmpty = document.getElementById('autYourEmpty');
  const builderEmpty = document.getElementById('autBuilderEmpty');
  const canvasPanel = document.getElementById('autCanvasPanel');
  const automationInspector = document.getElementById('autInspector');
  const rightFlowSummary = document.getElementById('autFlowSummary');
  const flowSummaryPanel = document.getElementById('autFlowSummaryPanel');
  const automationMapBoard = document.getElementById('autMapBoard');
  const automationQuoteLifecycleMapMarkup = automationMapBoard ? automationMapBoard.innerHTML : '';
  const closeInspectorButton = document.getElementById('autCloseInspector');
  const automationShell = automationView.querySelector('.aut-shell');
  const pipelineHub = document.getElementById('autPipelineHub');
  const pipelineGroups = document.getElementById('autPipelineGroups');
  const pipelineDetail = document.getElementById('autPipelineDetail');
  const conceptPreview = document.getElementById('autConceptPreview');
  const blockLibrary = document.getElementById('autBlockLibrary');
  const blockLibraryResizer = document.getElementById('autLibraryResizer');
  const blockLibraryBody = document.getElementById('autBlockLibraryBody');
  const blockSearch = document.getElementById('autBlockSearch');
  const libraryHelp = document.getElementById('autLibraryHelp');
  const stepMenu = document.getElementById('autStepMenu');
  const backToListButton = document.getElementById('autBackToList');
  const editorBrandLogo = document.getElementById('autEditorBrandLogo');
  const editorPipelineLabel = document.getElementById('autEditorPipelineLabel');
  const editorStageLabel = document.getElementById('autEditorStageLabel');
  const editorCompanyScopeLabel = document.getElementById('autEditorCompanyScopeLabel');
  const editorCompanyScopePills = document.getElementById('autEditorCompanyScopePills');
  const saveStatus = document.getElementById('autSaveStatus');
  const testStatus = document.getElementById('autTestStatus');
  const topbarContext = document.getElementById('autTopbarContext');
  const topbarActions = document.getElementById('autTopbarActions');
  const pageContext = document.getElementById('autPageContext');
  const pageTitle = document.getElementById('autPageTitle');
  const pageSubtitle = document.getElementById('autPageSubtitle');
  const saveDraftButton = document.getElementById('autSaveDraft');
  const cancelDraftButton = document.getElementById('autCancelDraft');
  const exitEditorButton = document.getElementById('autExitEditor');
  const editorUndoButton = document.getElementById('autEditorUndo');
  const editorRedoButton = document.getElementById('autEditorRedo');
  const openHistoryButton = document.getElementById('autOpenHistory');
  const historyOverlay = document.getElementById('autHistoryOverlay');
  const historyCloseButton = document.getElementById('autHistoryClose');
  const historyList = document.getElementById('autHistoryList');
  const historyContext = document.getElementById('autHistoryContext');
  const publishOverlay = document.getElementById('autPublishOverlay');
  const publishSummary = document.getElementById('autPublishSummary');
  const publishCloseButton = document.getElementById('autPublishClose');
  const publishCancelButton = document.getElementById('autPublishCancel');
  const publishConfirmButton = document.getElementById('autPublishConfirm');
  const exitOverlay = document.getElementById('autExitOverlay');
  const exitCloseButton = document.getElementById('autExitClose');
  const exitContinueButton = document.getElementById('autExitContinue');
  const exitDiscardButton = document.getElementById('autExitDiscard');
  const exitSaveButton = document.getElementById('autExitSave');
  const toast = document.getElementById('autToast');
  const demoOverlay = document.getElementById('autDemoOverlay');
  const demoStepLabel = document.getElementById('autDemoStepLabel');
  const demoTitle = document.getElementById('autDemoTitle');
  const demoProgress = document.getElementById('autDemoProgress');
  const demoBody = document.getElementById('autDemoBody');
  const demoBack = document.getElementById('autDemoBack');
  const demoNext = document.getElementById('autDemoNext');
  const templateOverlay = document.getElementById('autTemplateOverlay');
  const creatorHome = document.getElementById('autCreatorHome');
  const creatorTemplates = document.getElementById('autCreatorTemplates');
  const creatorTemplatePreview = document.getElementById('autCreatorTemplatePreview');
  const creatorCompanyScope = document.getElementById('autCreatorCompanyScope');
  const creatorTriggers = document.getElementById('autCreatorTriggers');
  const creatorConfigure = document.getElementById('autCreatorConfigure');
  const creatorProposalSetup = document.getElementById('autCreatorProposalSetup');
  const creatorTitle = document.getElementById('autTemplateTitle');
  const creatorCopy = document.getElementById('autTemplateCopy');
  const triggerConfigureBody = document.getElementById('autTriggerConfigureBody');
  const templatePreviewBody = document.getElementById('autTemplatePreviewBody');
  const companyScopeBody = document.getElementById('autCompanyScopeBody');
  const proposalSetupBody = document.getElementById('autProposalSetupBody');
  const automationFlow = automationView.querySelector('.aut-flow');
  const builderCanvas = automationFlow.closest('.aut-canvas');
  const builderZoomControls = document.getElementById('autBuilderZoomControls');
  const builderZoomOut = document.getElementById('autBuilderZoomOut');
  const builderZoomValue = document.getElementById('autBuilderZoomValue');
  const builderZoomIn = document.getElementById('autBuilderZoomIn');
  const builderZoomFit = document.getElementById('autBuilderZoomFit');
  const templateFlowMarkup = automationFlow.innerHTML;
  const appShell = document.querySelector('.app');
  const sidebarFocusToggle = document.querySelector('.sidebar .collapse-btn');
  let scratchTriggerChoice = null;
  let selectedAutomationStage = null;
  let automationStageLocked = false;
  let creatorStartMode = 'templates';
  let selectedCompanyScopeMode = 'all';
  let selectedCompanyScopeIds = [];
  let scratchInsertIndex = 0;
  let scratchInsertBranch = 'main';
  let scratchConditionIndex = -1;
  const AUTOMATION_LIBRARY_WIDTH_KEY = 'wequote.crm.automation.libraryWidth';
  const AUTOMATION_LIBRARY_DEFAULT_WIDTH = 340;
  const AUTOMATION_LIBRARY_MIN_WIDTH = 300;
  const AUTOMATION_LIBRARY_MAX_WIDTH = 620;
  let libraryResizeState = null;
  let libraryResizeDrawFrame = 0;
  const AUTOMATION_BUILDER_ZOOM_KEY = 'wequote.crm.automation.builderZoom';
  const AUTOMATION_BUILDER_ZOOM_MIN = 10;
  const AUTOMATION_BUILDER_ZOOM_MAX = 500;
  let builderZoom = 100;
  let builderPanState = null;
  let builderZoomDrawFrame = 0;
  const savedDraftSnapshots = {};
  const pendingDraftChanges = {};
  const automationHistory = {};
  let editorRedoSnapshot = null;

  if (editorBrandLogo) {
    const sourceBrandMark = document.querySelector('.logo-row .mark-wrap .ic:first-child svg');
    if (sourceBrandMark) {
      const brandMark = sourceBrandMark.cloneNode(true);
      brandMark.querySelectorAll('[id]').forEach(function (node) { node.removeAttribute('id'); });
      brandMark.removeAttribute('style');
      brandMark.setAttribute('aria-hidden', 'true');
      editorBrandLogo.replaceChildren(brandMark);
    }
  }

  function cloneAutomationConfig(config) {
    return config ? JSON.parse(JSON.stringify(config)) : null;
  }

  function automationVersionSnapshot(config) {
    const snapshot = cloneAutomationConfig(config);
    if (!snapshot) return null;
    ['publishedSnapshot', 'testDraftSnapshot', 'editingVersion', 'testInProgress', 'needsTesting', 'lastTestedAt', 'lastSavedChanges'].forEach(function (key) {
      delete snapshot[key];
    });
    return snapshot;
  }

  function automationHasPublishedVersion(config) {
    return !!(config && (config.lastPublishedAt || config.enabled || config.publishedSnapshot));
  }

  function automationHasDraftChanges(config) {
    return !!(config && !config.protected && (config.editingVersion || !automationHasPublishedVersion(config)));
  }

  function automationHasUnsavedChanges() {
    return !!(activeWorkflowKey && ((pendingDraftChanges[activeWorkflowKey] || []).length || (saveStatus && saveStatus.classList.contains('dirty'))));
  }

  function automationTestState(config) {
    if (!config || config.protected) return { key: 'none', label: 'Test not required', icon: '&#xf023;' };
    if (config.testInProgress) return { key: 'testing', label: 'Test in progress', icon: '&#xf04b;' };
    if (config.needsTesting && config.lastTestedAt) return { key: 'outdated', label: 'Test outdated', icon: '&#xf071;' };
    if (!config.needsTesting && config.lastTestedAt) return { key: 'passed', label: 'Test passed · ' + config.lastTestedAt, icon: '&#xf058;' };
    return { key: 'not-tested', label: 'Not tested', icon: '&#xf12a;' };
  }

  function syncAutomationDraftUi() {
    const config = activeConfig();
    if (!config) return;
    const draftChanges = automationHasDraftChanges(config);
    const unsaved = automationHasUnsavedChanges();
    const test = automationTestState(config);
    if (testStatus) {
      testStatus.hidden = !!config.protected;
      testStatus.className = 'aut-test-status ' + test.key;
      testStatus.innerHTML = '<i class="fai">' + test.icon + '</i> ' + escapeAutomationHtml(test.label);
      testStatus.title = test.key === 'passed'
        ? 'This Draft has a current passing test.'
        : 'Testing is optional. You can publish unless WeQuote detects a conflict.';
    }
    if (saveStatus) saveStatus.classList.toggle('draft-saved', draftChanges && !unsaved);
    if (pageSubtitle && automationView.classList.contains('aut-builder-mode')) {
      pageSubtitle.textContent = unsaved
        ? 'Unpublished changes · Save this Draft before testing.'
        : (draftChanges
          ? 'Draft saved · The published Automation continues unchanged until you publish.'
          : 'Published version · No unpublished changes.');
    }
    if (!publishButton || config.protected) return;
    if (draftChanges) {
      publishButton.textContent = 'Publish changes';
      publishButton.disabled = workflowNeedsSetup(config) || (isProposalApproval(config) && !config.setupComplete);
    } else if (config.enabled) {
      publishButton.textContent = 'Published';
      publishButton.disabled = true;
    } else {
      publishButton.textContent = 'Turn on automation';
      publishButton.disabled = false;
    }
  }

  function captureDraftSnapshot(force) {
    const config = activeConfig();
    if (!config || config.protected || !activeWorkflowKey) return;
    if (force || !savedDraftSnapshots[activeWorkflowKey]) {
      savedDraftSnapshots[activeWorkflowKey] = cloneAutomationConfig(config);
    }
  }

  function recordPendingDraftChange(label) {
    if (!activeWorkflowKey || !activeConfig() || activeConfig().protected) return;
    if (!pendingDraftChanges[activeWorkflowKey]) pendingDraftChanges[activeWorkflowKey] = [];
    if (label && !pendingDraftChanges[activeWorkflowKey].includes(label)) pendingDraftChanges[activeWorkflowKey].push(label);
    activeConfig().needsTesting = true;
    activeConfig().testInProgress = false;
    editorRedoSnapshot = null;
    if (editorRedoButton) editorRedoButton.disabled = true;
    setAutomationSaveStatus(false);
  }

  function setAutomationTopbarContext(parts, linkFirst) {
    if (!topbarContext) return;
    const items = Array.isArray(parts) ? parts.filter(Boolean) : [];
    topbarContext.hidden = items.length === 0;
    topbarContext.innerHTML = items.map(function (item, index) {
      if (index === 0 && linkFirst) return '<button type="button" data-aut-topbar-back>' + escapeAutomationHtml(item) + '</button>';
      return '<span>' + escapeAutomationHtml(item) + '</span>';
    }).join('<i>/</i>');
  }

  function updateAutomationPageContext(mode) {
    if (!pageContext || !pageTitle || !pageSubtitle) return;
    if (mode === 'builder' && activeConfig()) {
      const builderPipelineName = automationPipelineName(activeConfig());
      if (topbarActions) topbarActions.hidden = true;
      setAutomationTopbarContext([builderPipelineName, workflowStageName(activeConfig()), activeConfig().title]);
      pageContext.textContent = builderPipelineName + ' / ' + activeConfig().title;
      pageTitle.textContent = builderPipelineName + ' · ' + activeConfig().title;
      pageSubtitle.textContent = automationHasUnsavedChanges()
        ? 'Unpublished changes · Save this Draft before testing.'
        : (automationHasDraftChanges(activeConfig())
          ? 'Draft saved · The published Automation continues unchanged until you publish.'
          : 'Published version · No unpublished changes.');
      return;
    }
    if (mode === 'detail') {
      const definition = automationGroupDefinitions[selectedAutomationGroupKey] || automationGroupDefinitions.standard;
      const detailPipelineName = selectedAutomationStageContext && selectedAutomationStageContext.pipelineName
        ? selectedAutomationStageContext.pipelineName
        : 'Sales Pipeline';
      const detailName = definition.pipelineId ? 'Automations' : definition.name;
      if (topbarActions) topbarActions.hidden = false;
      setAutomationTopbarContext([detailPipelineName, detailName], true);
      pageContext.textContent = 'CRM / Automations / ' + detailPipelineName;
      pageTitle.textContent = detailPipelineName + ' · ' + detailName;
      pageSubtitle.textContent = 'Review this Pipeline map, then create or edit the independent Automations inside each Stage.';
      return;
    }
    if (mode === 'groups') {
      const groupsPipeline = automationGroupPipeline();
      const groupsPipelineName = groupsPipeline && groupsPipeline.name ? groupsPipeline.name : 'Sales Pipeline';
      if (topbarActions) topbarActions.hidden = true;
      setAutomationTopbarContext([groupsPipelineName]);
      pageContext.textContent = 'CRM / Automations / ' + groupsPipelineName;
      pageTitle.textContent = groupsPipelineName + ' Automations';
      pageSubtitle.textContent = 'Review the Automations in this Pipeline before opening the Pipeline Map or editing a flow.';
      return;
    }
    if (topbarActions) topbarActions.hidden = true;
    setAutomationTopbarContext([]);
    pageContext.textContent = 'CRM / Automations';
    pageTitle.textContent = 'CRM Automations';
    pageSubtitle.textContent = 'Choose a Pipeline, then create and manage complete Automation setups for it.';
  }

  function ensureAutomationHistory(key) {
    if (!automationHistory[key]) {
      const config = workflows[key];
      automationHistory[key] = [{
        actor: 'Lee Roche',
        time: 'Today · 10:42',
        title: 'Created from template',
        changes: [
          'Created “' + (config ? config.title : 'Automation') + '” in Sales Pipeline',
          'Added the initial trigger and editable steps'
        ]
      }];
    }
    return automationHistory[key];
  }

  function renderAutomationHistory() {
    const config = activeConfig();
    if (!historyList || !historyContext || !config || !activeWorkflowKey) return;
    historyContext.textContent = automationPipelineName(config) + ' · ' + config.title;
    const entries = ensureAutomationHistory(activeWorkflowKey);
    historyList.innerHTML = entries.length ? entries.map(function (entry) {
      return '<article class="aut-history-entry"><header><strong>' + escapeAutomationHtml(entry.title) + '</strong><time>' + escapeAutomationHtml(entry.time) + '</time></header><span>' + escapeAutomationHtml(entry.actor) + '</span><ul>' + entry.changes.map(function (change) { return '<li>' + escapeAutomationHtml(change) + '</li>'; }).join('') + '</ul></article>';
    }).join('') : '<div class="aut-history-empty">No saved changes yet.</div>';
  }

  function openAutomationHistory() {
    if (!historyOverlay || !activeConfig()) return;
    renderAutomationHistory();
    historyOverlay.hidden = false;
  }

  function closeAutomationHistory() {
    if (historyOverlay) historyOverlay.hidden = true;
  }

  function saveAutomationDraft() {
    const config = activeConfig();
    if (!config || config.protected || !activeWorkflowKey) return;
    if (!(pendingDraftChanges[activeWorkflowKey] || []).length) saveSelectedStep();
    const changes = (pendingDraftChanges[activeWorkflowKey] || []).slice();
    if (!changes.length) {
      showAutomationToast('No changes to save. The current Draft is already up to date.');
      setAutomationSaveStatus(true);
      return false;
    }
    config.lastSavedChanges = changes.slice();
    ensureAutomationHistory(activeWorkflowKey).unshift({
      actor: 'Candy',
      time: 'Just now',
      title: 'Saved changes',
      changes: changes
    });
    pendingDraftChanges[activeWorkflowKey] = [];
    savedDraftSnapshots[activeWorkflowKey] = cloneAutomationConfig(activeConfig());
    persistAutomationState();
    setAutomationSaveStatus(true);
    updateAutomationPageContext('builder');
    showAutomationToast(config.needsTesting ? 'Draft saved. Test automation is optional; publish when ready unless WeQuote detects a conflict.' : 'Changes saved. Change history has been updated.');
    return true;
  }

  function cancelAutomationDraft() {
    if (!activeWorkflowKey || !activeConfig() || activeConfig().protected) return;
    const snapshot = savedDraftSnapshots[activeWorkflowKey];
    if (!snapshot) {
      captureDraftSnapshot(true);
      setAutomationSaveStatus(true);
      showAutomationToast('No unsaved changes to cancel.');
      return;
    }
    workflows[activeWorkflowKey] = cloneAutomationConfig(snapshot);
    pendingDraftChanges[activeWorkflowKey] = [];
    normalizeSupportedWorkflow(workflows[activeWorkflowKey]);
    persistAutomationState();
    updateCanvas();
    renderInspector(hasEditableStepModel(activeConfig()) ? 'scratch-trigger' : 'trigger');
    setAutomationSaveStatus(true);
    updateAutomationPageContext('builder');
    showAutomationToast('Unsaved changes cancelled.');
  }

  function undoEditorChanges() {
    if (!activeWorkflowKey || !(pendingDraftChanges[activeWorkflowKey] || []).length) {
      showAutomationToast('No unsaved changes to undo.');
      return;
    }
    editorRedoSnapshot = cloneAutomationConfig(activeConfig());
    cancelAutomationDraft();
    if (editorRedoButton) editorRedoButton.disabled = false;
  }

  function redoEditorChanges() {
    if (!activeWorkflowKey || !editorRedoSnapshot) {
      showAutomationToast('No changes to redo.');
      return;
    }
    workflows[activeWorkflowKey] = cloneAutomationConfig(editorRedoSnapshot);
    editorRedoSnapshot = null;
    pendingDraftChanges[activeWorkflowKey] = ['Restored the last unsaved editor changes'];
    activeConfig().needsTesting = true;
    updateCanvas();
    renderInspector(hasEditableStepModel(activeConfig()) ? 'scratch-trigger' : 'trigger');
    setAutomationSaveStatus(false);
    if (editorRedoButton) editorRedoButton.disabled = true;
    showAutomationToast('Changes restored. Save the Draft before publishing; testing remains optional.');
  }

  function exitAutomationEditor() {
    if (automationHasUnsavedChanges()) {
      exitOverlay.hidden = false;
      exitContinueButton.focus();
      return;
    }
    editorRedoSnapshot = null;
    if (editorRedoButton) editorRedoButton.disabled = true;
    showAutomationPipelineDetail(selectedAutomationGroupKey);
    showAutomationToast('Returned to the Pipeline Map. Saved drafts remain unpublished until you publish them.');
  }

  function closeExitAutomationDialog() {
    if (exitOverlay) exitOverlay.hidden = true;
  }

  function finishAutomationEditorExit(message) {
    closeExitAutomationDialog();
    editorRedoSnapshot = null;
    if (editorRedoButton) editorRedoButton.disabled = true;
    showAutomationPipelineDetail(selectedAutomationGroupKey);
    showAutomationToast(message || 'Returned to the Pipeline Map.');
  }

  function discardAutomationChangesAndExit() {
    cancelAutomationDraft();
    finishAutomationEditorExit('Unsaved changes discarded. Saved Drafts and the live Automation are unchanged.');
  }

  function saveAutomationDraftAndExit() {
    saveAutomationDraft();
    finishAutomationEditorExit('Draft saved. The live Automation continues unchanged until you publish.');
  }

  function closePublishAutomationDialog() {
    if (publishOverlay) publishOverlay.hidden = true;
  }

  function publishedVersionSummary(config) {
    const snapshot = config.publishedSnapshot;
    if (!snapshot) return config.enabled ? 'Current live Automation' : 'No live Automation yet';
    return snapshot.enabled === false ? 'Published version · Inactive' : 'Published version · Active';
  }

  function openPublishAutomationDialog() {
    const config = activeConfig();
    if (!config || !publishSummary) return;
    const test = automationTestState(config);
    const testPassed = test.key === 'passed';
    const testLabel = testPassed
      ? test.label
      : (test.key === 'outdated' ? 'Test outdated · Optional' : (test.key === 'testing' ? 'Test in progress · Optional' : 'Not tested · Optional'));
    const testIcon = testPassed ? '&#xf058;' : '&#xf071;';
    const changes = Array.isArray(config.lastSavedChanges) && config.lastSavedChanges.length
      ? config.lastSavedChanges
      : ['Saved Draft is ready to become the live version'];
    publishSummary.innerHTML =
      '<div class="aut-final-compare"><section><small>CURRENT · PUBLISHED</small><strong>' + escapeAutomationHtml(publishedVersionSummary(config)) + '</strong><span>' + (config.publishedSnapshot ? escapeAutomationHtml(config.publishedSnapshot.title || config.title) : 'Matching records do not use this Draft yet.') + '</span></section><i class="fai">&#xf061;</i><section class="after"><small>AFTER · DRAFT</small><strong>' + escapeAutomationHtml(config.title) + '</strong><span>' + escapeAutomationHtml(changes[0]) + (changes.length > 1 ? ' · +' + (changes.length - 1) + ' more' : '') + '</span></section></div>' +
      '<div class="aut-final-facts"><div class="aut-final-fact"><small>COMPANY SCOPE</small><strong><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong></div><div class="aut-final-fact ' + (testPassed ? 'test-pass' : 'test-optional') + '"><small>TEST STATUS</small><strong><i class="fai">' + testIcon + '</i> ' + escapeAutomationHtml(testLabel) + '</strong></div></div>' +
      '<div class="aut-confirm-note"><i class="fai">&#xf0e7;</i><span><strong>Publishing updates the live Automation.</strong><small>New matching CRM events will use this Draft. Existing live behaviour remains in place until you confirm.</small></span></div>';
    publishOverlay.hidden = false;
    publishConfirmButton.focus();
  }

  function confirmAutomationPublish() {
    const config = activeConfig();
    if (!config) return;
    const firstPublish = !automationHasPublishedVersion(config);
    const changes = Array.isArray(config.lastSavedChanges) && config.lastSavedChanges.length
      ? config.lastSavedChanges.slice()
      : ['Published the saved Draft'];
    if (firstPublish) config.enabled = true;
    config.editingVersion = false;
    config.testInProgress = false;
    config.lastPublishedAt = 'Just now';
    delete config.publishedSnapshot;
    delete config.testDraftSnapshot;
    config.lastSavedChanges = [];
    pendingDraftChanges[activeWorkflowKey] = [];
    ensureAutomationHistory(activeWorkflowKey).unshift({
      actor: 'Candy',
      time: 'Just now',
      title: firstPublish ? 'Published Automation' : 'Published Draft changes',
      changes: changes
    });
    savedDraftSnapshots[activeWorkflowKey] = cloneAutomationConfig(config);
    closePublishAutomationDialog();
    persistAutomationState();
    syncWorkflowWithPipelineMap(config);
    updateCanvas();
    renderInspector(hasEditableStepModel(config) ? 'scratch-trigger' : (isProposalApproval(config) ? 'proposal-technical-review' : 'trigger'));
    setAutomationSaveStatus(true);
    resetJourney();
    showAutomationToast('Changes published. The updated live Automation is now ' + (config.enabled ? 'Active' : 'Inactive') + '.');
  }

  function clampBuilderZoom(value) {
    return Math.max(AUTOMATION_BUILDER_ZOOM_MIN, Math.min(AUTOMATION_BUILDER_ZOOM_MAX, Number(value) || 100));
  }

  function updateBuilderZoomControls() {
    if (builderZoomValue) builderZoomValue.textContent = Math.round(builderZoom) + '%';
    if (builderZoomOut) builderZoomOut.disabled = builderZoom <= AUTOMATION_BUILDER_ZOOM_MIN;
    if (builderZoomIn) builderZoomIn.disabled = builderZoom >= AUTOMATION_BUILDER_ZOOM_MAX;
  }

  function redrawAutomationAfterBuilderZoom() {
    if (builderZoomDrawFrame) cancelAnimationFrame(builderZoomDrawFrame);
    builderZoomDrawFrame = requestAnimationFrame(function () {
      builderZoomDrawFrame = 0;
      if (hasEditableStepModel(activeConfig())) scheduleScratchConnectorDraw(activeConfig());
    });
  }

  function setBuilderZoom(nextZoom, focalX, focalY, persist) {
    if (!builderCanvas || !automationFlow) return;
    const oldZoom = builderZoom;
    const next = clampBuilderZoom(nextZoom);
    const rect = builderCanvas.getBoundingClientRect();
    const focusX = Number.isFinite(focalX) ? focalX : builderCanvas.clientWidth / 2;
    const focusY = Number.isFinite(focalY) ? focalY : builderCanvas.clientHeight / 2;
    const contentX = (builderCanvas.scrollLeft + focusX) / Math.max(.01, oldZoom / 100);
    const contentY = (builderCanvas.scrollTop + focusY) / Math.max(.01, oldZoom / 100);
    builderZoom = next;
    automationFlow.classList.add('is-builder-zooming');
    automationFlow.style.zoom = String(next / 100);
    updateBuilderZoomControls();
    requestAnimationFrame(function () {
      const ratio = next / 100;
      builderCanvas.scrollLeft = Math.max(0, contentX * ratio - focusX);
      builderCanvas.scrollTop = Math.max(0, contentY * ratio - focusY);
      redrawAutomationAfterBuilderZoom();
    });
    if (persist !== false) {
      try { localStorage.setItem(AUTOMATION_BUILDER_ZOOM_KEY, String(Math.round(next))); } catch (_) {}
    }
  }

  function fitBuilderWorkflow() {
    if (!builderCanvas || !automationFlow) return;
    const rect = automationFlow.getBoundingClientRect();
    const currentRatio = Math.max(.01, builderZoom / 100);
    const naturalWidth = Math.max(1, rect.width / currentRatio);
    const naturalHeight = Math.max(1, rect.height / currentRatio);
    const availableWidth = Math.max(160, builderCanvas.clientWidth - 72);
    const availableHeight = Math.max(220, builderCanvas.clientHeight - 90);
    const fitZoom = Math.min(100, availableWidth / naturalWidth * 100, availableHeight / naturalHeight * 100);
    setBuilderZoom(fitZoom, builderCanvas.clientWidth / 2, builderCanvas.clientHeight / 2, true);
    requestAnimationFrame(function () {
      builderCanvas.scrollLeft = Math.max(0, (builderCanvas.scrollWidth - builderCanvas.clientWidth) / 2);
      builderCanvas.scrollTop = 0;
    });
  }

  function builderPanTargetIsInteractive(target) {
    return !!(target && target.closest('button,input,select,textarea,a,[contenteditable="true"],.aut-editable-node-wrap,.aut-node,.aut-add,.aut-step-menu,.aut-draft-banner,.aut-builder-zoom-controls,.aut-library-drag-ghost,.aut-scratch-drag-ghost'));
  }

  function initializeAutomationBuilderViewport() {
    if (!builderCanvas || !automationFlow) return;
    let storedZoom = 100;
    try { storedZoom = Number(localStorage.getItem(AUTOMATION_BUILDER_ZOOM_KEY)) || storedZoom; } catch (_) {}
    setBuilderZoom(storedZoom, builderCanvas.clientWidth / 2, builderCanvas.clientHeight / 2, false);

    builderCanvas.addEventListener('wheel', function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = builderCanvas.getBoundingClientRect();
      const nextZoom = builderZoom * Math.exp(-event.deltaY * .00125);
      setBuilderZoom(nextZoom, event.clientX - rect.left, event.clientY - rect.top, true);
    }, { passive: false });

    builderCanvas.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || builderPanTargetIsInteractive(event.target)) return;
      event.preventDefault();
      builderPanState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startLeft: builderCanvas.scrollLeft,
        startTop: builderCanvas.scrollTop
      };
      builderCanvas.classList.add('is-builder-panning');
      builderCanvas.setPointerCapture(event.pointerId);
    });
    builderCanvas.addEventListener('pointermove', function (event) {
      if (!builderPanState || builderPanState.pointerId !== event.pointerId) return;
      builderCanvas.scrollLeft = builderPanState.startLeft - (event.clientX - builderPanState.startX);
      builderCanvas.scrollTop = builderPanState.startTop - (event.clientY - builderPanState.startY);
    });
    function finishBuilderPan(event) {
      if (!builderPanState || (event && builderPanState.pointerId !== event.pointerId)) return;
      if (event && builderCanvas.hasPointerCapture(event.pointerId)) builderCanvas.releasePointerCapture(event.pointerId);
      builderPanState = null;
      builderCanvas.classList.remove('is-builder-panning');
    }
    builderCanvas.addEventListener('pointerup', finishBuilderPan);
    builderCanvas.addEventListener('pointercancel', finishBuilderPan);

    if (builderZoomOut) builderZoomOut.addEventListener('click', function (event) {
      event.stopPropagation();
      setBuilderZoom(builderZoom / 1.2, builderCanvas.clientWidth / 2, builderCanvas.clientHeight / 2, true);
    });
    if (builderZoomIn) builderZoomIn.addEventListener('click', function (event) {
      event.stopPropagation();
      setBuilderZoom(builderZoom * 1.2, builderCanvas.clientWidth / 2, builderCanvas.clientHeight / 2, true);
    });
    if (builderZoomValue) builderZoomValue.addEventListener('click', function (event) {
      event.stopPropagation();
      setBuilderZoom(100, builderCanvas.clientWidth / 2, builderCanvas.clientHeight / 2, true);
    });
    if (builderZoomFit) builderZoomFit.addEventListener('click', function (event) {
      event.stopPropagation();
      fitBuilderWorkflow();
    });
  }

  function automationLibraryWidthBounds() {
    const shellWidth = automationShell ? automationShell.getBoundingClientRect().width : window.innerWidth;
    const inspectorWidth = automationInspector && !automationInspector.hidden
      ? (automationInspector.getBoundingClientRect().width || 310)
      : 310;
    const availableMaximum = shellWidth - inspectorWidth - 360;
    return {
      min: AUTOMATION_LIBRARY_MIN_WIDTH,
      max: Math.max(AUTOMATION_LIBRARY_MIN_WIDTH, Math.min(AUTOMATION_LIBRARY_MAX_WIDTH, availableMaximum))
    };
  }

  function currentAutomationLibraryWidth() {
    const inlineWidth = parseFloat(automationShell.style.getPropertyValue('--aut-library-width'));
    if (Number.isFinite(inlineWidth)) return inlineWidth;
    if (blockLibrary && blockLibrary.getBoundingClientRect().width) return blockLibrary.getBoundingClientRect().width;
    return AUTOMATION_LIBRARY_DEFAULT_WIDTH;
  }

  function redrawAutomationAfterLibraryResize() {
    if (libraryResizeDrawFrame) cancelAnimationFrame(libraryResizeDrawFrame);
    libraryResizeDrawFrame = requestAnimationFrame(function () {
      libraryResizeDrawFrame = 0;
      if (hasEditableStepModel(activeConfig())) scheduleScratchConnectorDraw(activeConfig());
    });
  }

  function setAutomationLibraryWidth(width, persist) {
    if (!automationShell) return;
    const bounds = automationLibraryWidthBounds();
    const nextWidth = Math.round(Math.max(bounds.min, Math.min(bounds.max, Number(width) || AUTOMATION_LIBRARY_DEFAULT_WIDTH)));
    automationShell.style.setProperty('--aut-library-width', nextWidth + 'px');
    if (blockLibraryResizer) {
      blockLibraryResizer.setAttribute('aria-valuemin', String(bounds.min));
      blockLibraryResizer.setAttribute('aria-valuemax', String(bounds.max));
      blockLibraryResizer.setAttribute('aria-valuenow', String(nextWidth));
      blockLibraryResizer.title = 'Workflow blocks: ' + nextWidth + 'px · Drag to resize · Double-click to reset';
    }
    if (persist) {
      try { localStorage.setItem(AUTOMATION_LIBRARY_WIDTH_KEY, String(nextWidth)); } catch (_) {}
    }
    redrawAutomationAfterLibraryResize();
  }

  function initializeAutomationLibraryResizer() {
    if (!automationShell || !blockLibraryResizer) return;
    let storedWidth = AUTOMATION_LIBRARY_DEFAULT_WIDTH;
    try { storedWidth = Number(localStorage.getItem(AUTOMATION_LIBRARY_WIDTH_KEY)) || storedWidth; } catch (_) {}
    setAutomationLibraryWidth(storedWidth, false);

    blockLibraryResizer.addEventListener('pointerdown', function (event) {
      if (event.button !== 0 || window.innerWidth <= 780) return;
      event.preventDefault();
      libraryResizeState = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startWidth: currentAutomationLibraryWidth()
      };
      automationShell.classList.add('is-library-resizing');
      blockLibraryResizer.setPointerCapture(event.pointerId);
    });
    blockLibraryResizer.addEventListener('pointermove', function (event) {
      if (!libraryResizeState || libraryResizeState.pointerId !== event.pointerId) return;
      setAutomationLibraryWidth(libraryResizeState.startWidth + event.clientX - libraryResizeState.startX, false);
    });
    function finishLibraryResize(event) {
      if (!libraryResizeState || (event && libraryResizeState.pointerId !== event.pointerId)) return;
      if (event && blockLibraryResizer.hasPointerCapture(event.pointerId)) blockLibraryResizer.releasePointerCapture(event.pointerId);
      libraryResizeState = null;
      automationShell.classList.remove('is-library-resizing');
      setAutomationLibraryWidth(currentAutomationLibraryWidth(), true);
    }
    blockLibraryResizer.addEventListener('pointerup', finishLibraryResize);
    blockLibraryResizer.addEventListener('pointercancel', finishLibraryResize);
    blockLibraryResizer.addEventListener('dblclick', function (event) {
      event.preventDefault();
      setAutomationLibraryWidth(AUTOMATION_LIBRARY_DEFAULT_WIDTH, true);
    });
    blockLibraryResizer.addEventListener('keydown', function (event) {
      const bounds = automationLibraryWidthBounds();
      const step = event.shiftKey ? 32 : 16;
      let nextWidth = currentAutomationLibraryWidth();
      if (event.key === 'ArrowLeft') nextWidth -= step;
      else if (event.key === 'ArrowRight') nextWidth += step;
      else if (event.key === 'Home') nextWidth = bounds.min;
      else if (event.key === 'End') nextWidth = bounds.max;
      else return;
      event.preventDefault();
      setAutomationLibraryWidth(nextWidth, true);
    });
  }

  function setAutomationFocusMode(enabled) {
    if (!appShell) return;
    appShell.classList.toggle('aut-focus-mode', Boolean(enabled));
    if (!enabled) appShell.classList.remove('aut-sidebar-expanded');
    if (sidebarFocusToggle) {
      sidebarFocusToggle.setAttribute('role', 'button');
      sidebarFocusToggle.setAttribute('tabindex', '0');
      sidebarFocusToggle.setAttribute('aria-label', enabled && !appShell.classList.contains('aut-sidebar-expanded') ? 'Expand navigation' : 'Collapse navigation');
      sidebarFocusToggle.setAttribute('title', enabled && !appShell.classList.contains('aut-sidebar-expanded') ? 'Expand navigation' : 'Collapse navigation');
    }
  }

  function setAutomationBuilderFocusMode(enabled) {
    if (!appShell) return;
    appShell.classList.toggle('aut-builder-focus-mode', Boolean(enabled));
    if (enabled) appShell.classList.remove('aut-sidebar-expanded');
  }

  function syncAutomationEditorHeader(config) {
    if (!config) return;
    const pipelineName = automationPipelineName(config);
    const stageName = workflowStageName(config);
    if (editorPipelineLabel) editorPipelineLabel.textContent = pipelineName;
    if (editorStageLabel) editorStageLabel.textContent = stageName;
    if (editorCompanyScopeLabel) editorCompanyScopeLabel.textContent = automationCompanyScopeLabel(config);
    if (editorCompanyScopePills) editorCompanyScopePills.innerHTML = automationCompanyScopePillsMarkup(config, 'compact');
  }

  function automationCanShowBlockLibrary() {
    const config = activeConfig();
    return !!(config && !config.protected && hasEditableStepModel(config));
  }

  function showAutomationBlockLibraryPane() {
    const showLibrary = automationCanShowBlockLibrary();
    if (blockLibrary) blockLibrary.hidden = !showLibrary;
    if (automationInspector) automationInspector.hidden = showLibrary;
    automationShell.classList.toggle('is-settings-open', !showLibrary);
    if (closeInspectorButton) closeInspectorButton.hidden = !showLibrary;
    closeStepMenu();
  }

  function showAutomationStepSettingsPane() {
    if (blockLibrary) blockLibrary.hidden = true;
    if (automationInspector) automationInspector.hidden = false;
    automationShell.classList.add('is-settings-open');
    if (closeInspectorButton) closeInspectorButton.hidden = !automationCanShowBlockLibrary();
  }

  function toggleAutomationFocusSidebar() {
    if (!appShell || !appShell.classList.contains('aut-focus-mode')) return;
    appShell.classList.toggle('aut-sidebar-expanded');
    setAutomationFocusMode(true);
  }

  if (sidebarFocusToggle) {
    sidebarFocusToggle.addEventListener('click', toggleAutomationFocusSidebar);
    sidebarFocusToggle.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      toggleAutomationFocusSidebar();
    });
  }
  let scratchInsertContainer = 'r';
  let scratchDraggedNode = null;
  let libraryDraggedBlock = null;
  let activeLibraryTab = 'action';
  let scratchPointerNode = null;
  let scratchPointerMoved = false;
  let scratchPointerStart = null;
  let libraryPointerBlock = null;
  let libraryPointerMoved = false;
  let libraryPointerStart = null;
  let libraryDragGhost = null;
  let scratchDragGhost = null;
  let suppressLibraryClick = false;
  let suppressScratchClick = false;
  let scratchStepUidCounter = 0;
  let scratchConnectionSource = null;
  let scratchConnectionSide = 'right';
  let scratchConnectionMoved = false;
  let scratchConnectionStart = null;
  let scratchConnectionLayer = null;
  let scratchConnectionGhost = null;
  let scratchConnectionMenuState = null;
  let dragAutoScrollFrame = null;
  let dragAutoScrollPoint = null;
  let selectedTemplateKey = null;
  let demoStepIndex = 0;
  let demoStepCount = 5;
  let bossDemoMode = false;
  const journeyPanel = document.getElementById('autJourney');
  const journeyOverlay = document.getElementById('autJourneyOverlay');
  const journeyClose = document.getElementById('autJourneyClose');
  const journeyAutomationSummary = document.getElementById('autJourneyAutomationSummary');
  const journeyStepLabel = document.getElementById('autJourneyStep');
  const journeyProgress = document.getElementById('autJourneyProgress');
  const journeyNarration = document.getElementById('autJourneyNarration');
  const journeyScroll = document.getElementById('autJourneyScroll');
  const journeyBoard = journeyScroll.querySelector('.aut-journey-board');
  const journeyToggle = document.getElementById('autJourneyToggle');
  const journeyStepForward = document.getElementById('autJourneyStepForward');
  const journeySpeed = document.getElementById('autJourneySpeed');
  const journeyClock = document.getElementById('autJourneyClock');
  const journeyElapsed = document.getElementById('autJourneyElapsed');
  const journeyEvents = document.getElementById('autJourneyEvents');
  const journeySkipWait = document.getElementById('autJourneySkipWait');
  const journeyViewTimeline = document.getElementById('autJourneyViewTimeline');
  const journeyViewImpact = document.getElementById('autJourneyViewImpact');
  const journeyTimelinePanel = document.getElementById('autJourneyTimelinePanel');
  const journeyImpactPanel = document.getElementById('autJourneyImpact');
  const journeyEyebrow = journeyPanel.querySelector('.aut-journey-eyebrow');
  const journeyTitle = journeyPanel.querySelector('.aut-journey-head h2');
  const journeyCopy = journeyPanel.querySelector('.aut-journey-head p');
  const impactTitle = document.getElementById('autImpactTitle');
  const impactBeforeTitle = document.getElementById('autImpactBeforeTitle');
  const impactBeforeCopy = document.getElementById('autImpactBeforeCopy');
  const impactBeforeStages = document.getElementById('autImpactBeforeStages');
  const impactPipelineContext = document.getElementById('autImpactPipelineContext');
  const impactPipelineStages = document.getElementById('autImpactPipelineStages');
  const impactAfter = document.getElementById('autImpactAfter');
  const impactAfterTitle = document.getElementById('autImpactAfterTitle');
  const impactAfterCopy = document.getElementById('autImpactAfterCopy');
  const impactAfterStages = document.getElementById('autImpactAfterStages');
  let currentJourneyModel = [];
  let journeyStepIndex = -1;
  let journeyTimer = null;
  let journeyRunning = false;
  const journeyStartTime = new Date(2026, 7, 20, 9, 0, 0);
  let journeyNow = new Date(journeyStartTime.getTime());
  let journeyEventLog = [];
  let journeyPendingWait = null;
  let selectedRunTimers = [];
  let selectedRunActive = false;

  function automationLiveConfig(config) {
    if (config && config.enabled && config.editingVersion && config.publishedSnapshot) return config.publishedSnapshot;
    return config;
  }

  function enabledAutomationConfigForKind(kind, record) {
    const active = workflows[activeWorkflowKey];
    if (active && active.kind === kind && active.enabled && (!record || automationRecordMatchesCompanyScope(automationLiveConfig(active), record))) return automationLiveConfig(active);
    const key = Object.keys(workflows).find(function (workflowKey) {
      return workflows[workflowKey].kind === kind && workflows[workflowKey].enabled && (!record || automationRecordMatchesCompanyScope(automationLiveConfig(workflows[workflowKey]), record));
    });
    return key ? automationLiveConfig(workflows[key]) : null;
  }

  function enabledAutomationConfigForTemplate(templateKey, record) {
    const key = Object.keys(workflows).find(function (workflowKey) {
      return workflows[workflowKey].templateKey === templateKey && workflows[workflowKey].enabled && (!record || automationRecordMatchesCompanyScope(automationLiveConfig(workflows[workflowKey]), record));
    });
    return key ? automationLiveConfig(workflows[key]) : null;
  }

  function automationEnabledForKind(kind) {
    return !!enabledAutomationConfigForKind(kind);
  }

  function automationRoundRobinTeam() {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : ['Lee Roche'];
    return team.length ? team : ['Lee Roche'];
  }

  function roundRobinPreviewOwner() {
    const team = automationRoundRobinTeam();
    return team[automationRuntimeState.roundRobinIndex % team.length] || 'Lee Roche';
  }

  function roundRobinSequenceLabel() {
    const team = automationRoundRobinTeam();
    return team.slice(0, 4).join(' → ') + (team.length > 4 ? ' → …' : '');
  }

  function automationOwnerName(selection, record) {
    if (selection === 'Lead owner' || selection === 'Deal owner') return record.owner || record.ownerName ||
      (typeof CRM_OWNER_NAMES !== 'undefined' ? CRM_OWNER_NAMES[record.o] : '') || 'Unassigned';
    if (selection === 'Round-robin sales team') {
      const team = automationRoundRobinTeam();
      const owner = team[automationRuntimeState.roundRobinIndex % team.length] || 'Lee Roche';
      automationRuntimeState.roundRobinIndex += 1;
      return owner;
    }
    if (selection === 'Project manager') return typeof CRM_CURRENT_USER !== 'undefined' ? CRM_CURRENT_USER : 'Lee Roche';
    return selection || 'Unassigned';
  }

  function automationDueAt(days, hour, minute) {
    const due = new Date();
    due.setDate(due.getDate() + Math.max(0, Number(days) || 0));
    due.setHours(hour == null ? 10 : hour, minute == null ? 0 : minute, 0, 0);
    return due.toISOString();
  }

  function automationRecordRun(key, eventName, message, recordTitle) {
    const resolvedKey = workflows[key] ? key : Object.keys(workflows).find(function (workflowKey) {
      return workflows[workflowKey].templateKey === key && workflows[workflowKey].enabled;
    });
    const config = workflows[resolvedKey];
    if (!config) return;
    config.lastRunAt = new Date().toISOString();
    config.runCount = (Number(config.runCount) || 0) + 1;
    automationRuntimeState.runs.unshift({
      id: 'automation-run-' + Date.now() + '-' + automationRuntimeState.runs.length,
      workflow: resolvedKey,
      event: eventName,
      message: message,
      record: recordTitle || '',
      createdAt: config.lastRunAt
    });
    persistAutomationState();
    updateWorkflowList();
    if (activeWorkflowKey === resolvedKey) workflowMeta.textContent = 'Active · Last ran just now';
  }

  function automationNotify(message) {
    if (typeof qtShowSnackbar === 'function') qtShowSnackbar(message, 'success');
    else showAutomationToast(message);
  }

  function automationRefreshLead(lead) {
    if (typeof refreshLeadNextFromActivities === 'function') refreshLeadNextFromActivities(lead);
    if (typeof saveLeadState === 'function') saveLeadState();
    if (typeof renderLeads === 'function') renderLeads();
  }

  function runNewLeadAutomation(lead) {
    const config = enabledAutomationConfigForKind('lead-new', lead);
    if (!config || !lead) return { handled: false, actions: [] };
    lead.activities = Array.isArray(lead.activities) ? lead.activities : [];
    const existing = lead.activities.some(function (activity) {
      const status = String(activity.status || '').toLowerCase();
      const open = status !== 'completed' && status !== 'cancelled' && status !== 'discarded';
      const firstContact = activity.automationWorkflow === 'new-lead-response' ||
        /first[\s-]?contact/i.test(String(activity.title || ''));
      return open && firstContact;
    });
    const owner = automationOwnerName(config.assignmentOwner, lead);
    lead.owner = owner;
    if (existing) {
      automationRefreshLead(lead);
      automationRecordRun('new-lead-response', 'lead.created', 'Lead owner assigned to ' + owner + '; activity skipped because an open first-contact activity already exists.', lead.title);
      return { handled: true, actions: [] };
    }
    const timeParts = String(config.actionTime || '16:00').split(':');
    const task = {
      id: (lead.leadId || 'lead') + '-automation-first-contact-' + Date.now(),
      type: config.activityType || 'call', title: config.activityTitle || 'First contact',
      dueAt: automationDueAt(0, Number(timeParts[0]) || 16, Number(timeParts[1]) || 0), status: 'scheduled',
      owner: owner, createdAt: new Date().toISOString(), source: 'automation',
      automationWorkflow: 'new-lead-response'
    };
    lead.activities.push(task);
    automationRefreshLead(lead);
    automationRecordRun('new-lead-response', 'lead.created', 'First-contact Lead activity created for ' + owner + '.', lead.title);
    automationNotify('First-contact activity created for ' + owner + ', due today at ' + automationTimeLabel(config.actionTime) + '.');
    return { handled: true, actions: [task] };
  }

  function runInactiveLeadScan() {
    const config = enabledAutomationConfigForKind('lead-inactive');
    if (!config || typeof CRM_LEADS === 'undefined') return { handled: false, actions: [] };
    const actions = [];
    CRM_LEADS.filter(function (lead) {
      if (!automationRecordMatchesCompanyScope(config, lead)) return false;
      if (lead.status !== 'open' || lead.next) return false;
      return !(Array.isArray(lead.activities) && lead.activities.some(function (activity) {
        const status = String(activity.status || '').toLowerCase();
        return status !== 'completed' && status !== 'cancelled' && status !== 'discarded';
      }));
    }).forEach(function (lead) {
      lead.activities = Array.isArray(lead.activities) ? lead.activities : [];
      if (lead.activities.some(function (activity) { return activity.automationWorkflow === 'inactive-lead' && activity.status !== 'cancelled'; })) return;
      const task = {
        id: (lead.leadId || 'lead') + '-automation-inactive-' + Date.now() + '-' + actions.length,
        type: 'call', title: config.actionName, dueAt: automationDueAt(config.waitDays, 10), status: 'scheduled',
        owner: automationOwnerName(config.actionOwner, lead), createdAt: new Date().toISOString(), source: 'automation',
        automationWorkflow: 'inactive-lead'
      };
      lead.activities.push(task);
      automationRefreshLead(lead);
      actions.push(task);
      automationRecordRun('inactive-lead', 'lead.inactive', config.actionName + ' scheduled.', lead.title);
    });
    if (actions.length) automationNotify('Automation: ' + actions.length + ' inactive Lead reminder' + (actions.length === 1 ? '' : 's') + ' scheduled.');
    return { handled: true, actions: actions };
  }

  function automationRefreshDeal(deal) {
    if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    if (typeof refreshPipelineDealCard === 'function') refreshPipelineDealCard(deal);
    if (typeof ddDeal !== 'undefined' && ddDeal === deal) {
      if (typeof ddRenderFocus === 'function') ddRenderFocus();
      if (typeof ddRenderHistory === 'function') ddRenderHistory();
      if (typeof ddRenderBilling === 'function') ddRenderBilling();
    }
  }

  // Generic user Automation runtime -------------------------------------------------
  //
  // The Builder, Simulator and Pipeline map all store editable Automations as a
  // sequence of trigger / Rule / Action steps.  Older prototype code rendered that
  // sequence but only executed a few hard-coded templates.  Keep the specialised
  // templates below, and run every other published editable workflow through this
  // shared interpreter so an "Active" card has a real CRM result.
  const genericAutomationRunGuard = new Set();

  function genericAutomationRecord(config, payload) {
    if (config && config.objectType === 'Lead') return payload && payload.lead;
    return payload && (payload.deal || payload.record);
  }

  function genericAutomationUsesRuntime(config) {
    if (!config || !config.enabled || !hasEditableStepModel(config) || !Array.isArray(config.steps)) return false;
    if (config.protected || isProposalApproval(config) || isNewLeadWorkflow(config) || isInactiveLeadWorkflow(config) ||
      isQuoteWorkflow(config) || isWonHandoff(config) || isQuoteInvoice(config) || config.templateKey === 'pre-quote-readiness') return false;
    return true;
  }

  function genericAutomationEventPipeline(payload) {
    if (payload && payload.pipeline) return payload.pipeline;
    if (typeof getActivePipeline === 'function') return getActivePipeline();
    return automationPipelines()[0];
  }

  function genericAutomationTriggerMatches(config, eventName, payload) {
    const triggerKind = String(config.triggerKind || '').toLowerCase();
    const triggerTitle = String(config.triggerEvent || (config.editableTrigger && config.editableTrigger.title) || '').toLowerCase();
    const stageName = workflowStageName(config);
    const toStage = payload && payload.toStage;
    const field = String(payload && payload.field || '').toLowerCase();
    const quoteEvent = eventName.indexOf('quote.') === 0;

    if (eventName === 'lead.created') return triggerKind === 'trigger-new-lead' || triggerTitle.includes('new lead');
    if (eventName === 'deal.stage.changed') {
      if (triggerKind === 'trigger-deal-lost' || triggerTitle.includes('deal becomes lost')) {
        return !!(toStage && (toStage.outcome === 'lost' || toStage.name === 'Lost'));
      }
      if (triggerKind === 'trigger-deal-custom-stage' || triggerKind === 'trigger-deal-qualified' ||
        triggerKind === 'trigger-deal-stage' || triggerKind === 'deal-stage' || triggerTitle.includes('deal enters')) {
        return !!(toStage && toStage.name === stageName);
      }
    }
    if (eventName === 'deal.owner.changed') return triggerKind === 'trigger-deal-owner' || triggerTitle.includes('owner change');
    if (eventName === 'deal.next-action.changed') return triggerKind === 'trigger-next-action-due' || triggerTitle.includes('next action');
    if (eventName === 'deal.expected-close.approaching') return triggerKind === 'trigger-expected-close' || triggerTitle.includes('expected close');
    if (eventName === 'deal.meeting.changed') return triggerKind === 'trigger-meeting-change' || triggerTitle.includes('meeting / site visit');
    if (eventName === 'deal.file.added') return triggerKind === 'trigger-file-added' || triggerTitle.includes('file is added');
    if (eventName === 'deal.file-request.completed') return triggerKind === 'trigger-file-request-completed' || triggerTitle.includes('requested file is received');
    if (eventName === 'deal.data.changed') {
      if (triggerKind === 'trigger-deal-data-changed') return true;
      if (triggerKind === 'trigger-deal-owner' && field === 'owner') return true;
      return triggerTitle.includes('deal data change');
    }
    if (eventName === 'deal.inactive') return triggerKind === 'trigger-deal-inactivity' || triggerTitle.includes('no activity');
    if (eventName === 'deal.note-follow-up.due') return triggerKind === 'trigger-note-follow-up' || triggerTitle.includes('note follow-up');
    if (eventName === 'quote.created') return triggerKind === 'trigger-quote-created' || triggerTitle.includes('first related quote') || triggerTitle.includes('quote is created');
    if (eventName === 'quote.updated') return triggerKind === 'trigger-quote-updated' || triggerKind === 'trigger-related-quote-changed' || triggerTitle.includes('quote build change') || triggerTitle.includes('quote is edited') || triggerTitle.includes('related quote change');
    if (eventName === 'quote.review.submitted') return triggerKind === 'trigger-review-submitted' || triggerTitle.includes('submitted for internal review') || triggerTitle.includes('enters in review');
    if (eventName === 'quote.review.passed') return triggerKind === 'trigger-review-passed' || triggerTitle.includes('passed review');
    if (eventName === 'quote.review-note.changed') return triggerKind === 'trigger-review-note-changed' || triggerTitle.includes('review note change');
    if (eventName === 'quote.sent') return triggerKind === 'trigger-quote-sent' || triggerKind === 'trigger-related-quote-changed' || triggerTitle.includes('quote is sent') || triggerTitle.includes('quote enters sent') || triggerTitle.includes('related quote change');
    if (eventName === 'quote.viewed') return triggerKind === 'trigger-quote-viewed' || triggerTitle.includes('customer views');
    if (eventName === 'quote.expiry.approaching') return triggerKind === 'trigger-quote-expiry' || triggerTitle.includes('expiry');
    if (eventName === 'quote.accepted') return triggerKind === 'trigger-quote-accepted' || triggerKind === 'trigger-related-quote-changed' || triggerTitle.includes('quote is accepted') || triggerTitle.includes('becomes accepted') || triggerTitle.includes('related quote change');
    return quoteEvent && triggerKind === 'trigger-related-quote-changed';
  }

  function genericAutomationStageMatches(config, record) {
    if (!record || config.objectType === 'Lead' || typeof CRM_STAGE_DEFS === 'undefined') return true;
    const definition = CRM_STAGE_DEFS[record.s] || {};
    return definition.name === workflowStageName(config);
  }

  function genericAutomationDueDate(days, time, workingDays) {
    const result = new Date();
    let remaining = Math.max(0, Number(days) || 0);
    while (remaining > 0) {
      result.setDate(result.getDate() + 1);
      if (!workingDays || (result.getDay() !== 0 && result.getDay() !== 6)) remaining -= 1;
    }
    const parts = String(time || '17:00').split(':');
    result.setHours(Number(parts[0]) || 0, Number(parts[1]) || 0, 0, 0);
    return result;
  }

  function genericAutomationDealQuotes(deal) {
    return deal && typeof DEAL_QUOTES !== 'undefined' ? (DEAL_QUOTES[deal.t] || []) : [];
  }

  function genericAutomationLatestQuote(context) {
    if (context.quote) return context.quote;
    const quotes = genericAutomationDealQuotes(context.deal);
    return quotes.length ? quotes[quotes.length - 1] : null;
  }

  function genericAutomationOpenNextAction(deal) {
    const action = deal && deal.nextAction;
    return !!(action && action.status !== 'completed' && action.status !== 'cancelled');
  }

  function genericAutomationOpenFileRequests(deal) {
    return (deal && Array.isArray(deal.fileRequests) ? deal.fileRequests : []).filter(function (request) {
      return request && request.status !== 'received' && request.status !== 'cancelled';
    });
  }

  function genericAutomationConditionResult(step, context) {
    const condition = String(step && step.condition || '').trim();
    const text = condition.toLowerCase();
    const deal = context.deal;
    const quote = genericAutomationLatestQuote(context);
    const quotes = genericAutomationDealQuotes(deal);
    const stage = deal && typeof CRM_STAGE_DEFS !== 'undefined' ? (CRM_STAGE_DEFS[deal.s] || {}) : {};
    const notes = deal && Array.isArray(deal.notes) ? deal.notes.filter(function (note) { return note && !note.deletedAt; }) : [];
    const meetings = deal && Array.isArray(deal.meetings) ? deal.meetings : [];
    const requestKey = context.workflowKey + ':' + (step.uid || 'rule');
    const relatedRequests = deal && Array.isArray(deal.fileRequests) ? deal.fileRequests.filter(function (request) {
      return request.workflowKey === context.workflowKey || request.requirementKey === requestKey;
    }) : [];

    if (!text || text === 'all criteria match (and)' || text === 'any criterion matches (or)') return true;
    if ((text.includes('required file') && text.includes('missing')) || (text.includes('site plans') && text.includes('missing')) || text.includes('plan or file is missing')) {
      return !relatedRequests.some(function (request) { return request.status === 'received'; });
    }
    if (text.includes('no open file request')) return genericAutomationOpenFileRequests(deal).length === 0;
    if (text.includes('no open deal next action') || text.includes('next action is missing')) return !genericAutomationOpenNextAction(deal);
    if (text.includes('deal next action is overdue')) {
      return genericAutomationOpenNextAction(deal) && Date.parse(deal.nextAction.dueAt || '') < Date.now();
    }
    if (text.includes('owner is empty') || text.includes('owner or next action is missing')) {
      const ownerMissing = !(deal && (deal.ownerName || deal.owner || deal.o));
      return text.includes('or next action') ? ownerMissing || !genericAutomationOpenNextAction(deal) : ownerMissing;
    }
    if (text.includes('record owner is set')) return !!(deal && (deal.ownerName || deal.owner || deal.o));
    if (text.startsWith('deal is still in ') || text.startsWith('stage is ')) return stage.name === workflowStageName(context.config);
    if (text.includes('no related quote')) return quotes.length === 0;
    if (text.includes('quote') && (text.includes('draft') || text.includes('editable') || text.includes('in progress'))) return !!quote && quote.status === 'draft';
    if (text.includes('awaiting review') || text.includes('still in review')) return !!quote && quote.status === 'review';
    if (text.includes('review passed')) return !!quote && quote.status === 'reviewed';
    if (text.includes('quote is still sent') || text.includes('still sent')) return !!quote && quote.status === 'sent' && (!quote.expiresAt || Date.parse(quote.expiresAt) >= Date.now());
    if (text.includes('customer has viewed')) return !!quote && !!quote.viewedAt;
    if (text.includes('customer has not viewed')) return !!quote && !quote.viewedAt;
    if (text.includes('no open technical review note')) return !notes.some(function (note) { return /technical review/i.test(note.title || '') && note.followUpStatus !== 'completed'; });
    if (text.includes('no open quote-build note')) return !notes.some(function (note) { return /quote|pricing|scope|sow/i.test((note.title || '') + ' ' + (note.body || '')) && note.followUpStatus !== 'completed'; });
    if (text.includes('no open handoff next action')) return !genericAutomationOpenNextAction(deal);
    if (text.includes('no new activity') || text.includes('no recent activity') || text.includes('no customer activity')) return Number(deal && deal.d) > 0;
    if ((text.includes('meeting') && text.includes('not been completed')) || (text.includes('site visit') && text.includes('not been completed'))) {
      return !meetings.some(function (meeting) { return meeting.status === 'completed'; });
    }
    if (text.includes('customer or site information is incomplete') || text.includes('site or customer information is incomplete')) return !(deal && deal.contact && (deal.org || deal.c));
    if (text.includes('expected close date is overdue')) return !!(deal && deal.closeDate) && Date.parse(deal.closeDate) < Date.now();
    if (text.includes('loss reason is empty') || text.includes('loss reason is missing')) return !(deal && deal.lostReason);
    if (text.includes('no viable related quote')) return !quotes.some(function (item) { return item && !item.alternativeLost && !['cancelled', 'rejected', 'declined'].includes(item.status); });
    if (text.includes('deposit amount is available')) return Number(deal && deal.v) > 0;
    if (text.includes('deal has selected label')) return !!(deal && deal.labels && deal.labels.length);
    if (text.includes('deal does not have selected label')) return !(deal && deal.labels && deal.labels.length);
    if (text.includes('deal has selected interest')) return !!(deal && deal.interests && deal.interests.length);
    if (text.includes('deal does not have selected interest')) return !(deal && deal.interests && deal.interests.length);
    if (text.includes('value') || text.includes('discount')) {
      const amount = Number((condition.match(/[£$]?([\d,]+)/) || [])[1]?.replace(/,/g, ''));
      return amount ? Number(deal && deal.v) >= amount : Number(deal && deal.v) > 0;
    }
    if (text.includes('pricing') || text.includes('scope of work') || text.includes('sow data') || text.includes('customer-facing content')) {
      return !quote || !Number((quote.revisions && quote.revisions[quote.revisions.length - 1] || {}).value) || !quote.desc || quote.desc === 'Untitled';
    }
    if (text.includes('required exit criteria') && text.includes('incomplete')) return true;
    // Unknown criteria end safely.  This is intentionally conservative: an
    // unrecognised Rule must never run live Actions merely because the Simulator
    // could draw the Yes branch.
    context.unsupportedRules.push(condition);
    return false;
  }

  function genericAutomationHistory(deal, event) {
    if (!deal) return;
    if (typeof recordDealActionEvent === 'function') {
      recordDealActionEvent(deal, Object.assign({ author: 'Automation', source: 'automation' }, event));
      return;
    }
    deal.actionHistory = Array.isArray(deal.actionHistory) ? deal.actionHistory : [];
    deal.actionHistory.push(Object.assign({
      id: 'automation-action-' + Date.now() + '-' + deal.actionHistory.length,
      createdAt: new Date().toISOString(), author: 'Automation', source: 'automation'
    }, event));
  }

  function genericAutomationRequirement(deal, context, step, linkedType, linkedId, title) {
    if (!deal || step.completionMode !== 'required') return null;
    deal.automationRequirements = Array.isArray(deal.automationRequirements) ? deal.automationRequirements : [];
    const stepUid = step.uid || String(step.action || 'action').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const existing = deal.automationRequirements.find(function (requirement) {
      return requirement.workflowKey === context.workflowKey && requirement.stepUid === stepUid && requirement.status === 'open';
    });
    if (existing) return existing;
    const requirement = {
      id: 'automation-requirement-' + Date.now() + '-' + deal.automationRequirements.length,
      workflowKey: context.workflowKey, workflowTitle: context.config.title, stepUid: stepUid,
      stageName: workflowStageName(context.config), linkedType: linkedType, linkedId: String(linkedId || ''),
      title: title || step.action, status: 'open', requiredToContinue: true,
      blockedEvent: step.blockedEvent || defaultCompletionEvent(context.config),
      createdAt: new Date().toISOString()
    };
    deal.automationRequirements.push(requirement);
    return requirement;
  }

  function genericAutomationNote(step, context) {
    const record = context.record;
    if (!record) return null;
    const requiresCompletion = step.completionMode === 'required';
    const followUpDelay = requiresCompletion && (!step.followUpDelay || step.followUpDelay === 'none') ? 'today' : step.followUpDelay;
    const due = followUpDelay && followUpDelay !== 'none'
      ? genericAutomationDueDate(followUpDelay === 'today' ? 0 : Number((followUpDelay.match(/\d+/) || [1])[0]), step.followUpTime || '17:00', followUpDelay.includes('working'))
      : null;
    const owner = automationOwnerName(step.mention || step.owner || (context.config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner'), record);
    const title = step.noteTitle || 'Automation follow-up';
    if (context.config.objectType === 'Lead') {
      record.notes = Array.isArray(record.notes) ? record.notes : [];
      const note = {
        id: (record.leadId || 'lead') + '-automation-note-' + Date.now(), title: title,
        bodyHtml: escapeAutomationHtml(step.noteBody || 'Follow up on this CRM record.'), mentions: owner ? [owner] : [],
        author: 'Automation', createdAt: new Date().toISOString(), followUpAt: due ? due.toISOString() : '',
        followUpStatus: due ? 'open' : '', followUpCompletedAt: '', reactions: {}, replies: [], attachments: [],
        source: 'automation', automationWorkflow: context.workflowKey, automationStepUid: step.uid || ''
      };
      record.notes.push(note);
      return note;
    }
    record.notes = Array.isArray(record.notes) ? record.notes : [];
    const existing = record.notes.find(function (note) {
      return note.automationWorkflow === context.workflowKey && note.automationStepUid === (step.uid || '') && !note.deletedAt && note.followUpStatus !== 'completed';
    });
    if (existing) return existing;
    const note = {
      id: Date.now() + Math.random(), title: title, body: step.noteBody || 'Follow up on this CRM record.',
      bodyHtml: escapeAutomationHtml(step.noteBody || 'Follow up on this CRM record.'), mentions: owner ? [owner] : [],
      author: 'Automation', createdAt: new Date().toISOString(), followUpAt: due ? due.toISOString() : '',
      followUpStatus: due ? 'open' : '', reactions: {}, replies: [], attachments: [],
      source: 'automation', automationWorkflow: context.workflowKey, automationStepUid: step.uid || ''
    };
    record.notes.push(note);
    genericAutomationRequirement(record, context, step, 'note', note.id, title);
    return note;
  }

  function genericAutomationMeeting(step, context) {
    const record = context.record;
    if (!record) return null;
    const days = step.meetingWhen === 'In 7 working days' ? 7 : step.meetingWhen === 'In 3 working days' ? 3 : 1;
    const start = genericAutomationDueDate(days, step.meetingTime || '10:00', true);
    const owner = automationOwnerName(step.owner || (context.config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner'), record);
    if (context.config.objectType === 'Lead') {
      record.activities = Array.isArray(record.activities) ? record.activities : [];
      const activity = {
        id: (record.leadId || 'lead') + '-automation-meeting-' + Date.now(), type: 'meeting',
        title: step.meetingTitle || 'Customer meeting', dueAt: start.toISOString(), status: 'scheduled',
        owner: owner, createdAt: new Date().toISOString(), source: 'automation', automationWorkflow: context.workflowKey
      };
      record.activities.push(activity);
      return activity;
    }
    record.meetings = Array.isArray(record.meetings) ? record.meetings : [];
    const meeting = {
      id: Date.now() + Math.random(), title: step.meetingTitle || 'Customer meeting',
      date: start.toISOString().slice(0, 10), time: String(step.meetingTime || '10:00'),
      duration: Number(step.meetingDuration) || 60, provider: 'in-person', providerLabel: 'In person',
      address: '', attendees: [automationOwnerName(step.meetingAttendee || 'Deal owner', record)].filter(Boolean),
      agenda: 'Created by ' + context.config.title, status: 'scheduled', assignedTo: owner, owner: owner,
      createdBy: 'Automation', createdAt: new Date().toISOString(), source: 'automation',
      automationWorkflow: context.workflowKey, automationStepUid: step.uid || ''
    };
    record.meetings.push(meeting);
    genericAutomationRequirement(record, context, step, 'meeting', meeting.id, meeting.title);
    return meeting;
  }

  function genericAutomationFileRequest(step, context) {
    const deal = context.deal;
    if (!deal) return null;
    deal.fileRequests = Array.isArray(deal.fileRequests) ? deal.fileRequests : [];
    const requirementKey = context.workflowKey + ':' + (step.uid || 'request-file');
    const existing = deal.fileRequests.find(function (request) {
      return request.requirementKey === requirementKey && request.status !== 'cancelled';
    });
    if (existing) return existing;
    const owner = automationOwnerName(step.owner || 'Deal owner', deal);
    const due = genericAutomationDueDate(step.fileRequestDueDays || 3, '17:00', false);
    const request = {
      id: 'file-request-' + Date.now() + '-' + deal.fileRequests.length,
      requirementKey: requirementKey, workflowKey: context.workflowKey, workflowTitle: context.config.title,
      stepUid: step.uid || '', stageName: workflowStageName(context.config),
      title: step.fileRequestName || 'Required document', requestedFrom: step.fileRequestFrom || 'Primary Deal contact',
      acceptedTypes: step.fileRequestTypes || 'PDF, Word, Excel or image', assignedTo: owner,
      dueAt: due.toISOString(), status: 'open', requiredToContinue: step.completionMode === 'required',
      blockedEvent: step.completionMode === 'required' ? (step.blockedEvent || defaultCompletionEvent(context.config)) : '',
      fileIds: [], reminderCount: 0, createdAt: new Date().toISOString(), createdBy: 'Automation'
    };
    deal.fileRequests.push(request);
    deal.notes = Array.isArray(deal.notes) ? deal.notes : [];
    const note = {
      id: Date.now() + Math.random(), activityType: 'file-request', fileRequestId: request.id,
      title: request.title, body: 'Please provide ' + request.title + '. Requested from ' + request.requestedFrom + '.',
      bodyHtml: 'Please provide ' + escapeAutomationHtml(request.title) + '. Requested from ' + escapeAutomationHtml(request.requestedFrom) + '.',
      mentions: [], author: 'Automation', createdAt: request.createdAt, followUpAt: '', followUpStatus: '',
      fileRequestDueAt: request.dueAt, fileRequestStatus: request.status, reactions: {}, replies: [], attachments: [],
      source: 'automation', automationWorkflow: context.workflowKey, automationStepUid: step.uid || ''
    };
    request.noteId = note.id;
    deal.notes.push(note);
    const requirement = genericAutomationRequirement(deal, context, step, 'file-request', request.id, request.title);
    if (requirement) request.requirementId = requirement.id;
    genericAutomationHistory(deal, {
      kind: 'file-request-created', actionType: 'file-request', title: request.title + ' requested by Automation', dueAt: request.dueAt
    });
    return request;
  }

  function genericAutomationCreateQuote(step, context) {
    const deal = context.deal;
    if (!deal || typeof DEAL_QUOTES === 'undefined') return null;
    const quotes = DEAL_QUOTES[deal.t] || [];
    if (step.quoteExistingPolicy !== 'create-another' && quotes.some(function (quote) { return quote.status === 'draft'; })) return null;
    const quoteNumber = typeof nextQuoteNo !== 'undefined' ? String(nextQuoteNo++) : String(Date.now()).slice(-6);
    const quote = {
      no: quoteNumber, status: 'draft', desc: String(step.quoteName || '{{Deal title}} · Quote').replace(/\{\{Deal title\}\}/g, deal.t || 'Deal'),
      alternativeGroupId: null, revisions: [{ n: 1, value: 0, status: 'live' }], acceptedRev: null,
      variations: [], cos: [], linkedAt: new Date().toISOString(), linkedBy: 'Automation', comments: [],
      owningCompanyId: deal.owningCompanyId || 'main-company', owner: automationOwnerName(step.quoteOwner || step.owner || 'Deal owner', deal),
      source: 'automation', automationWorkflow: context.workflowKey
    };
    DEAL_QUOTES[deal.t] = quotes.concat([quote]);
    if (typeof ddEnsureQuoteActivity === 'function') ddEnsureQuoteActivity(deal, DEAL_QUOTES[deal.t]);
    genericAutomationHistory(deal, { kind: 'quote-created', actionType: 'quote', title: 'Quote #' + quote.no + ' created by Automation' });
    return quote;
  }

  function genericAutomationExecuteAction(step, context) {
    const deal = context.deal;
    const record = context.record;
    const action = String(step.action || '');
    let result = null;
    if (action === 'Create Note') result = genericAutomationNote(step, context);
    else if (action === 'Schedule Meeting' || action === 'Schedule Meeting / Site Visit') result = genericAutomationMeeting(step, context);
    else if (action === 'Request a file') result = genericAutomationFileRequest(step, context);
    else if (action === 'Create Quote') result = genericAutomationCreateQuote(step, context);
    else if (action === 'Assign specific Deal Owner' && deal) {
      const previous = deal.ownerName || deal.owner || deal.o || 'Unassigned';
      deal.ownerName = automationOwnerName(step.owner, deal);
      result = deal.ownerName;
      genericAutomationHistory(deal, { kind: 'owner-changed', actionType: 'owner', title: 'Deal Owner changed · ' + previous + ' → ' + deal.ownerName });
    } else if ((action === 'Add Deal label' || action === 'Remove Deal label') && deal) {
      deal.labels = Array.isArray(deal.labels) ? deal.labels : [];
      const label = step.dealLabel || 'Hot';
      if (action.startsWith('Add') && !deal.labels.includes(label)) deal.labels.push(label);
      if (action.startsWith('Remove')) deal.labels = deal.labels.filter(function (item) { return item !== label; });
      result = label;
      genericAutomationHistory(deal, { kind: 'deal-data', actionType: 'label', title: action + ' · ' + label });
    } else if ((action === 'Add Interest' || action === 'Remove Interest') && deal) {
      deal.interests = Array.isArray(deal.interests) ? deal.interests : [];
      const interest = step.interest || 'Television';
      if (action.startsWith('Add') && !deal.interests.includes(interest)) deal.interests.push(interest);
      if (action.startsWith('Remove')) deal.interests = deal.interests.filter(function (item) { return item !== interest; });
      result = interest;
      genericAutomationHistory(deal, { kind: 'deal-data', actionType: 'interest', title: action + ' · ' + interest });
    } else if ((action === 'Add Deal watcher' || action === 'Remove Deal watcher') && deal) {
      deal.watchers = Array.isArray(deal.watchers) ? deal.watchers : [];
      const watcher = step.watcher || automationOwnerName('Deal owner', deal);
      if (action.startsWith('Add') && !deal.watchers.includes(watcher)) deal.watchers.push(watcher);
      if (action.startsWith('Remove')) deal.watchers = deal.watchers.filter(function (item) { return item !== watcher; });
      result = watcher;
      genericAutomationHistory(deal, { kind: 'deal-data', actionType: 'watcher', title: action + ' · ' + watcher });
    } else if (action === 'Set Deal Next Action' && deal) {
      const current = genericAutomationOpenNextAction(deal) ? deal.nextAction : null;
      const policy = step.nextActionPolicy || 'replace-if-overdue';
      const canReplace = !current || policy === 'replace' || (policy === 'replace-if-overdue' && Date.parse(current.dueAt || '') < Date.now());
      if (canReplace) {
        const due = genericAutomationDueDate(step.nextActionDueDays || 1, '17:00', step.nextActionDueUnit !== 'calendar-days');
        deal.nextAction = {
          id: 'deal-next-automation-' + Date.now(), type: step.nextActionType || 'customer-followup',
          title: step.nextActionTitle || 'Follow up this Deal', dueAt: due.toISOString(),
          assignedTo: automationOwnerName(step.owner || 'Deal owner', deal), status: 'open',
          createdAt: new Date().toISOString(), source: 'automation', automationWorkflow: context.workflowKey,
          automationStepUid: step.uid || ''
        };
        result = deal.nextAction;
        genericAutomationHistory(deal, { kind: 'created', actionType: deal.nextAction.type, title: deal.nextAction.title + ' created by Automation', dueAt: deal.nextAction.dueAt });
      }
    } else if (action === 'Clear Deal Next Action' && deal) {
      const current = deal.nextAction;
      if (current && (step.nextActionClearPolicy === 'always' || current.source === 'automation')) {
        current.status = 'cancelled'; current.cancelledAt = new Date().toISOString();
        result = current;
        genericAutomationHistory(deal, { kind: 'cancelled', actionType: current.type, title: current.title + ' cleared by Automation' });
      }
    } else if (action === 'Set Expected Close Date' && deal) {
      const date = step.expectedCloseMode === 'fixed' && step.expectedCloseDate
        ? step.expectedCloseDate
        : genericAutomationDueDate(step.expectedCloseDays || 30, '00:00', false).toISOString().slice(0, 10);
      if (typeof ddApplyExpectedCloseDate === 'function') ddApplyExpectedCloseDate(deal, date, { source: 'automation', automationWorkflow: context.workflowKey });
      else deal.closeDate = date;
      result = date;
    } else if (action === 'Send internal notification' && deal) {
      result = { recipient: automationOwnerName(step.owner || 'Deal owner', deal) };
      genericAutomationHistory(deal, { kind: 'notification', actionType: 'notification', title: 'Internal notification sent to ' + result.recipient });
    } else if (action === 'Add Quote Label') {
      const quote = genericAutomationLatestQuote(context);
      if (quote) {
        quote.labels = Array.isArray(quote.labels) ? quote.labels : [];
        const label = step.quoteLabel || 'Priority';
        if (!quote.labels.includes(label)) quote.labels.push(label);
        result = label;
        genericAutomationHistory(deal, { kind: 'quote-data', actionType: 'quote-label', title: 'Add Quote Label · ' + label });
      }
    } else if (action === 'Attach file to Deal' && deal) {
      deal.files = Array.isArray(deal.files) ? deal.files : [];
      const fileName = step.fileUploadedName || step.fileSelection || 'Automation document';
      const existingIndex = deal.files.findIndex(function (file) { return file.name === fileName; });
      if (existingIndex < 0 || step.fileDuplicatePolicy !== 'skip') {
        if (existingIndex >= 0 && step.fileDuplicatePolicy === 'replace') deal.files.splice(existingIndex, 1);
        result = {
          id: 'automation-file-' + Date.now(), name: fileName, size: Number(step.fileUploadedSize) || 0,
          type: step.fileUploadedType || '', uploadedAt: new Date().toISOString(), uploadedBy: 'Automation',
          source: 'automation', automationWorkflow: context.workflowKey
        };
        deal.files.push(result);
        genericAutomationHistory(deal, { kind: 'file-added', actionType: 'file', title: fileName + ' attached by Automation' });
      }
    } else if (action === 'Move Deal to another Stage' && deal) {
      const targetIndex = typeof CRM_STAGE_DEFS !== 'undefined' ? CRM_STAGE_DEFS.findIndex(function (stage, index) {
        return stage.name === step.moveTargetStage || automationStageStableId(stage, genericAutomationEventPipeline(context.payload), index) === step.moveTargetStageId;
      }) : -1;
      if (targetIndex >= 0) {
        const card = typeof findPipelineCardForDeal === 'function' ? findPipelineCardForDeal(deal) : null;
        if (card && typeof commitDealMove === 'function') result = commitDealMove(card, targetIndex);
        else if (deal.s !== targetIndex) {
          const fromStage = CRM_STAGE_DEFS[deal.s] || {};
          deal.s = targetIndex; result = true;
          if (typeof rebuildPipelineColumns === 'function') rebuildPipelineColumns();
          emitAutomationEvent('deal.stage.changed', { deal: deal, pipeline: genericAutomationEventPipeline(context.payload), fromStage: fromStage, toStage: CRM_STAGE_DEFS[targetIndex] });
        }
      }
    } else if (record) {
      // Legacy template Actions become a visible Next Action instead of silently
      // disappearing.  New Builder Actions all have explicit handlers above.
      if (deal && !genericAutomationOpenNextAction(deal)) {
        deal.nextAction = {
          id: 'deal-next-automation-' + Date.now(), type: 'other', title: action || 'Automation task',
          dueAt: genericAutomationDueDate(1, '17:00', true).toISOString(), assignedTo: automationOwnerName(step.owner || 'Deal owner', deal),
          status: 'open', createdAt: new Date().toISOString(), source: 'automation', automationWorkflow: context.workflowKey
        };
        result = deal.nextAction;
        genericAutomationHistory(deal, { kind: 'created', actionType: 'other', title: deal.nextAction.title + ' created by Automation', dueAt: deal.nextAction.dueAt });
      }
    }
    if (result) context.actions.push(result);
    return result;
  }

  function genericAutomationScheduleWait(remainingSteps, step, context) {
    const record = context.record;
    if (!record || !remainingSteps.length) return;
    record.automationPendingRuns = Array.isArray(record.automationPendingRuns) ? record.automationPendingRuns : [];
    const pending = {
      id: 'automation-pending-' + Date.now() + '-' + record.automationPendingRuns.length,
      workflowKey: context.workflowKey, resumeAt: genericAutomationDueDate(step.days || 1, '09:00', false).toISOString(),
      steps: JSON.parse(JSON.stringify(remainingSteps)), eventName: context.eventName,
      quoteNo: context.quote && context.quote.no ? context.quote.no : '', createdAt: new Date().toISOString()
    };
    record.automationPendingRuns.push(pending);
    if (context.deal) genericAutomationHistory(context.deal, { kind: 'automation-wait', actionType: 'wait', title: context.config.title + ' waits ' + (step.days || 1) + ' day(s)', dueAt: pending.resumeAt });
  }

  function genericAutomationExecuteSequence(steps, context) {
    const sequence = Array.isArray(steps) ? steps : [];
    for (let index = 0; index < sequence.length; index += 1) {
      const step = sequence[index];
      if (!step) continue;
      if (step.type === 'wait') {
        genericAutomationScheduleWait(sequence.slice(index + 1), step, context);
        return;
      }
      if (step.type === 'condition') {
        const matched = genericAutomationConditionResult(step, context);
        genericAutomationExecuteSequence(matched ? step.yesSteps : step.noSteps, context);
        return;
      }
      if (step.type === 'action') genericAutomationExecuteAction(step, context);
    }
  }

  function runGenericAutomations(eventName, payload) {
    const results = [];
    const actions = [];
    const pipeline = genericAutomationEventPipeline(payload || {});
    userWorkflowKeys().forEach(function (workflowKey) {
      const storedConfig = workflows[workflowKey];
      const config = automationLiveConfig(storedConfig);
      if (!genericAutomationUsesRuntime(config)) return;
      const record = genericAutomationRecord(config, payload || {});
      if (!record || !automationRecordMatchesCompanyScope(config, record)) return;
      if (config.triggerPipelineId && pipeline && pipeline.id !== config.triggerPipelineId) return;
      if (!genericAutomationTriggerMatches(config, eventName, payload || {})) return;
      if (!genericAutomationStageMatches(config, record) && !eventName.startsWith('quote.')) return;
      const recordId = record.leadId || record.t || record.id || 'record';
      const guardKey = workflowKey + '|' + recordId + '|' + eventName;
      if (genericAutomationRunGuard.has(guardKey)) return;
      genericAutomationRunGuard.add(guardKey);
      window.setTimeout(function () { genericAutomationRunGuard.delete(guardKey); }, 0);
      normalizeScratchTree(config);
      const context = {
        workflowKey: workflowKey, config: config, record: record,
        deal: payload && payload.deal || (config.objectType === 'Deal' || config.objectType === 'Quote' ? record : null),
        quote: payload && payload.quote || null, payload: payload || {}, eventName: eventName,
        actions: [], unsupportedRules: []
      };
      genericAutomationExecuteSequence(config.steps, context);
      if (config.objectType === 'Lead') automationRefreshLead(record);
      else automationRefreshDeal(context.deal);
      automationRecordRun(workflowKey, eventName,
        context.unsupportedRules.length
          ? 'Ended safely because this Rule is not connected: ' + context.unsupportedRules[0]
          : (context.actions.length ? context.actions.length + ' CRM action(s) completed.' : 'Matched and ended without creating duplicate work.'),
        record.t || record.title || '');
      actions.push.apply(actions, context.actions);
      results.push({ workflowKey: workflowKey, actions: context.actions });
    });
    return { handled: results.length > 0, actions: actions, workflows: results };
  }

  function resumeDueGenericAutomationRuns() {
    const records = [];
    if (typeof CRM_DEALS !== 'undefined') records.push.apply(records, CRM_DEALS);
    if (typeof CRM_LEADS !== 'undefined') records.push.apply(records, CRM_LEADS);
    records.forEach(function (record) {
      const pendingRuns = Array.isArray(record.automationPendingRuns) ? record.automationPendingRuns : [];
      pendingRuns.filter(function (pending) { return pending.status !== 'completed' && Date.parse(pending.resumeAt) <= Date.now(); }).forEach(function (pending) {
        const storedConfig = workflows[pending.workflowKey];
        const config = automationLiveConfig(storedConfig);
        if (!genericAutomationUsesRuntime(config)) return;
        const deal = typeof CRM_DEALS !== 'undefined' && CRM_DEALS.includes(record) ? record : null;
        const quote = deal && pending.quoteNo ? genericAutomationDealQuotes(deal).find(function (item) { return String(item.no) === String(pending.quoteNo); }) : null;
        const context = { workflowKey: pending.workflowKey, config: config, record: record, deal: deal, quote: quote, payload: { deal: deal, quote: quote }, eventName: pending.eventName, actions: [], unsupportedRules: [] };
        genericAutomationExecuteSequence(pending.steps, context);
        pending.status = 'completed'; pending.completedAt = new Date().toISOString();
        if (deal) automationRefreshDeal(deal); else automationRefreshLead(record);
      });
    });
  }

  function genericAutomationScheduledMarker(record, key) {
    if (!record || !key) return false;
    record.automationEventMarkers = record.automationEventMarkers || {};
    if (record.automationEventMarkers[key]) return false;
    record.automationEventMarkers[key] = new Date().toISOString();
    return true;
  }

  function scanGenericScheduledAutomationEvents() {
    resumeDueGenericAutomationRuns();
    if (typeof CRM_DEALS === 'undefined') return;
    const now = Date.now();
    CRM_DEALS.forEach(function (deal) {
      if (!deal) return;
      const pipeline = typeof getActivePipeline === 'function' ? getActivePipeline() : null;
      const nextAction = genericAutomationOpenNextAction(deal) ? deal.nextAction : null;
      if (nextAction && Date.parse(nextAction.dueAt || '') <= now) {
        const key = 'next-action-due|' + String(nextAction.id || '') + '|' + String(nextAction.dueAt || '');
        if (genericAutomationScheduledMarker(deal, key)) {
          emitAutomationEvent('deal.next-action.changed', { deal: deal, pipeline: pipeline, nextAction: nextAction, change: 'due', field: 'next-action' });
        }
      }
      (Array.isArray(deal.notes) ? deal.notes : []).forEach(function (note) {
        if (!note || note.deletedAt || note.followUpStatus === 'completed' || !note.followUpAt || Date.parse(note.followUpAt) > now) return;
        const key = 'note-follow-up-due|' + String(note.id || '') + '|' + String(note.followUpAt);
        if (genericAutomationScheduledMarker(deal, key)) {
          emitAutomationEvent('deal.note-follow-up.due', { deal: deal, pipeline: pipeline, note: note, change: 'due', field: 'note-follow-up' });
        }
      });
      if (deal.closeDate) {
        const closeAt = Date.parse(deal.closeDate + 'T17:00:00');
        if (Number.isFinite(closeAt) && closeAt >= now && closeAt - now <= 3 * 86400000) {
          const key = 'expected-close-approaching|' + deal.closeDate;
          if (genericAutomationScheduledMarker(deal, key)) {
            emitAutomationEvent('deal.expected-close.approaching', { deal: deal, pipeline: pipeline, field: 'expected-close', date: deal.closeDate });
          }
        }
      }
      if (Number(deal.d) >= 7) {
        const key = 'deal-inactive|' + String(Math.floor(Number(deal.d) / 7));
        if (genericAutomationScheduledMarker(deal, key)) {
          emitAutomationEvent('deal.inactive', { deal: deal, pipeline: pipeline, inactiveDays: Number(deal.d), field: 'activity' });
        }
      }
      genericAutomationDealQuotes(deal).forEach(function (quote) {
        const expiry = Date.parse(quote && quote.expiresAt || '');
        if (!quote || quote.status !== 'sent' || !Number.isFinite(expiry) || expiry < now || expiry - now > 3 * 86400000) return;
        const key = 'quote-expiry-approaching|' + String(quote.no || '') + '|' + String(quote.expiresAt || '');
        if (genericAutomationScheduledMarker(deal, key)) {
          emitAutomationEvent('quote.expiry.approaching', { deal: deal, quote: quote, pipeline: pipeline, field: 'quote-expiry' });
        }
      });
    });
    if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
  }

  function runPreQuoteReadinessAutomation(deal, payload) {
    const config = enabledAutomationConfigForTemplate('pre-quote-readiness', deal);
    if (!config || !deal) return { handled: false, actions: [] };
    const pipeline = payload && payload.pipeline;
    const toStage = payload && payload.toStage;
    if (pipeline && config.triggerPipelineId && pipeline.id !== config.triggerPipelineId) return { handled: false, actions: [] };
    if (toStage && toStage.name !== config.triggerStage) return { handled: false, actions: [] };
    if (!toStage && typeof CRM_STAGE_DEFS !== 'undefined') {
      const currentStage = CRM_STAGE_DEFS[deal.s];
      if (!currentStage || currentStage.name !== config.triggerStage) return { handled: false, actions: [] };
    }
    const existing = deal.preQuoteReadinessTask;
    if (existing && existing.status !== 'completed' && existing.status !== 'cancelled') {
      return { handled: true, actions: [] };
    }
    const isRequired = config.completionMode === 'required';
    const taskTitle = String(config.actionName || '').trim() || (isRequired ? 'Complete required site readiness' : 'Site readiness follow-up');
    const task = {
      id: 'pre-quote-readiness-' + Date.now(), type: 'site-readiness',
      title: taskTitle, dueAt: automationDueAt(0, 17),
      assignedTo: automationOwnerName(config.actionOwner, deal), status: 'open',
      createdAt: new Date().toISOString(), createdBy: 'Automation', source: 'automation',
      automationWorkflow: 'pre-quote-readiness',
      requiredToContinue: isRequired,
      blockingTransition: isRequired ? (config.blockedEvent || 'first-related-quote') : ''
    };
    deal.preQuoteReadinessTask = task;
    deal.automationTasks = Array.isArray(deal.automationTasks) ? deal.automationTasks : [];
    deal.automationTasks.push(task);
    if (typeof recordDealActionEvent === 'function') recordDealActionEvent(deal, {
      kind: 'created', actionType: 'site-readiness',
      title: taskTitle + ' created by Automation', dueAt: task.dueAt,
      author: 'Automation', source: 'automation'
    });
    automationRefreshDeal(deal);
    automationRecordRun('pre-quote-readiness', 'deal.stage.changed', (isRequired ? 'Blocking' : 'Optional') + ' site-readiness follow-up task created.', deal.t);
    automationNotify('Automation created ' + (isRequired ? 'a required' : 'an optional') + ' site-readiness task for ' + deal.t + '.');
    return { handled: true, actions: [task] };
  }

  function openPreQuoteReadinessTask(deal) {
    const task = deal && deal.preQuoteReadinessTask;
    return task && task.status !== 'completed' && task.status !== 'cancelled' ? task : null;
  }

  function preQuoteReadinessMoveBlock(deal, targetStage, options) {
    const task = openPreQuoteReadinessTask(deal);
    if (!task || task.requiredToContinue === false || (options && options.systemDerived) || !targetStage) return null;
    if (task.blockingTransition === 'deal-won' && targetStage.outcome === 'won') {
      return 'Complete the required Site readiness task in Focus before moving this Deal to Won.';
    }
    if ((task.blockingTransition && task.blockingTransition !== 'first-related-quote') || targetStage.outcome || targetStage.name === 'Qualified') return null;
    return 'Complete the Site readiness task in Focus first. Then create the first Quote to move this Deal to In Progress.';
  }

  function preQuoteReadinessEventBlock(deal, eventName) {
    const task = openPreQuoteReadinessTask(deal);
    const taskEvent = task && (task.blockingTransition || 'first-related-quote');
    if (!task || task.requiredToContinue === false || taskEvent !== eventName) return null;
    const labels = {
      'first-related-quote': 'creating the first related Quote',
      'quote-submitted-review': 'submitting the Quote for internal review',
      'quote-sent': 'sending the Quote to the customer',
      'quote-accepted': 'accepting the related Quote',
      'deal-won': 'moving this Deal to Won'
    };
    return 'Complete the required Site readiness task in Focus before ' + (labels[eventName] || 'continuing this event') + '.';
  }

  function completePreQuoteReadinessTask(event) {
    if (event) event.stopPropagation();
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const task = openPreQuoteReadinessTask(deal);
    if (!deal || !task) return;
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    if (typeof recordDealActionEvent === 'function') recordDealActionEvent(deal, {
      kind: 'completed', actionType: 'site-readiness', title: (task.requiredToContinue ? 'Required site-readiness task' : 'Site-readiness follow-up') + ' completed'
    });
    automationRefreshDeal(deal);
    automationNotify(task.requiredToContinue ? 'Site readiness completed. The blocked event can now continue.' : 'Site readiness follow-up completed.');
  }

  function reschedulePreQuoteReadinessTask(event) {
    if (event) event.stopPropagation();
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const task = openPreQuoteReadinessTask(deal);
    if (!deal || !task) return;
    const due = new Date(task.dueAt || Date.now());
    due.setDate(due.getDate() + 1);
    task.dueAt = due.toISOString();
    automationRefreshDeal(deal);
    automationNotify('Site readiness task rescheduled by one day.' + (task.requiredToContinue ? ' It remains required.' : ' It remains optional.'));
  }

  function skipPreQuoteReadinessTask(event) {
    if (event) event.stopPropagation();
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const task = openPreQuoteReadinessTask(deal);
    if (!deal || !task) return;
    if (task.requiredToContinue !== false) {
      automationNotify('This task is required and cannot be skipped.');
      return;
    }
    task.status = 'cancelled';
    task.cancelledAt = new Date().toISOString();
    if (typeof recordDealActionEvent === 'function') recordDealActionEvent(deal, {
      kind: 'cancelled', actionType: 'site-readiness', title: 'Optional site-readiness follow-up skipped'
    });
    automationRefreshDeal(deal);
    automationNotify('Optional site-readiness follow-up skipped.');
  }

  function runQuoteFollowUpAutomation(deal, quote) {
    const config = enabledAutomationConfigForKind('quote-sent', deal || quote);
    if (!config || !deal) return { handled: false, actions: [] };
    if (deal.nextAction && deal.nextAction.status !== 'completed' && deal.nextAction.status !== 'cancelled') {
      automationRecordRun('quote-follow-up', 'quote.sent', 'Skipped because an open Deal Next Action already exists.', deal.t);
      return { handled: true, actions: [] };
    }
    const task = {
      id: 'deal-next-automation-' + Date.now(), type: 'customer-followup', title: config.actionName,
      dueAt: automationDueAt(config.waitDays, 10), context: 'Quote #' + (quote && quote.no ? quote.no : '') + ' sent to customer',
      assignedTo: automationOwnerName(config.actionOwner, deal), status: 'open', createdAt: new Date().toISOString(),
      source: 'automation', automationWorkflow: 'quote-follow-up'
    };
    deal.nextAction = task;
    if (typeof recordDealActionEvent === 'function') recordDealActionEvent(deal, {
      kind: 'created', actionType: 'customer-followup', title: config.actionName + ' created by Automation', dueAt: task.dueAt,
      author: 'Automation', source: 'automation'
    });
    automationRefreshDeal(deal);
    automationRecordRun('quote-follow-up', 'quote.sent', config.actionName + ' scheduled.', deal.t);
    return { handled: true, actions: [task] };
  }

  function automationCreateDealTask(deal, key, config) {
    deal.automationTasks = Array.isArray(deal.automationTasks) ? deal.automationTasks : [];
    if (deal.automationTasks.some(function (task) { return task.automationWorkflow === key && task.status !== 'completed'; })) return null;
    if (deal.nextAction && deal.nextAction.status !== 'completed' && deal.nextAction.status !== 'cancelled') return null;
    const task = {
      id: 'deal-automation-task-' + Date.now() + '-' + deal.automationTasks.length,
      type: 'customer-followup', title: config.actionName, dueAt: automationDueAt(0, 16),
      assignedTo: automationOwnerName(config.actionOwner, deal), status: 'open', createdAt: new Date().toISOString(),
      source: 'automation', automationWorkflow: key
    };
    deal.automationTasks.push(task);
    deal.nextAction = task;
    if (typeof recordDealActionEvent === 'function') recordDealActionEvent(deal, {
      kind: 'created', actionType: 'customer-followup', title: config.actionName + ' created by Automation', dueAt: task.dueAt,
      author: 'Automation', source: 'automation'
    });
    return task;
  }

  function automationCreateDraftInvoice(deal, config) {
    if (typeof DEAL_BILLING === 'undefined' || typeof DEAL_QUOTES === 'undefined') return null;
    const invoices = DEAL_BILLING[deal.t] || [];
    if (invoices.some(function (invoice) { return invoice.automationWorkflow === 'quote-invoice'; })) return null;
    const contract = typeof dealContractValue === 'function' ? dealContractValue(DEAL_QUOTES[deal.t] || []) : Number(deal.v) || 0;
    const allocated = invoices.reduce(function (sum, invoice) { return sum + Number(invoice.total || 0); }, 0);
    const available = Math.max(0, contract - allocated);
    const percent = Math.max(1, Math.min(100, Number(config.depositPercent) || 30));
    const amount = Math.min(Math.round(contract * (percent / 100)), available);
    if (!(amount > 0)) return null;
    const invoiceNumber = typeof nextInvoiceNo !== 'undefined' ? 'INV-' + nextInvoiceNo++ : 'INV-AUTO-' + Date.now();
    const invoice = {
      no: invoiceNumber, type: 'deposit', status: 'draft', total: amount, paid: 0,
      issued: '', due: automationDueAt(14, 0).slice(0, 10), source: 'automation', automationWorkflow: 'quote-invoice'
    };
    if (!DEAL_BILLING[deal.t]) DEAL_BILLING[deal.t] = [];
    DEAL_BILLING[deal.t].push(invoice);
    automationRecordRun('quote-invoice', 'quote.accepted', invoice.no + ' created as Draft.', deal.t);
    return invoice;
  }

  function runAcceptedQuoteAutomations(deal, quote) {
    if (!deal) return { handled: false, actions: [] };
    const actions = [];
    const invoiceConfig = enabledAutomationConfigForKind('quote-invoice', deal);
    if (invoiceConfig) {
      const invoice = automationCreateDraftInvoice(deal, invoiceConfig);
      if (invoice) actions.push(invoice);
    }
    if (actions.length) {
      automationRefreshDeal(deal);
      automationNotify('Automation: ' + actions.length + ' Draft Invoice' + (actions.length === 1 ? '' : 's') + ' created for ' + deal.t + '.');
    }
    return { handled: actions.length > 0, actions: actions };
  }

  function runDealStageAutomation(deal, payload) {
    const config = enabledAutomationConfigForKind('won-handoff', deal);
    if (!config || !deal) return { handled: false, actions: [] };
    const pipeline = payload && payload.pipeline;
    const fromStage = payload && payload.fromStage;
    const toStage = payload && payload.toStage;
    if (config.triggerPipelineId && pipeline && pipeline.id !== config.triggerPipelineId) return { handled: false, actions: [] };
    if (!toStage || (toStage.outcome !== config.triggerToOutcome && toStage.name !== config.triggerToStage)) return { handled: false, actions: [] };
    if (config.triggerFromStage && config.triggerFromStage !== 'Any stage' && (!fromStage || fromStage.name !== config.triggerFromStage)) return { handled: false, actions: [] };
    deal.automationStageRuns = Array.isArray(deal.automationStageRuns) ? deal.automationStageRuns : [];
    const runKey = 'won-deal-handoff:' + (pipeline ? pipeline.id : config.triggerPipelineId) + ':' + toStage.name;
    if (config.triggerRunMode !== 'every' && deal.automationStageRuns.includes(runKey)) return { handled: true, actions: [] };
    const task = automationCreateDealTask(deal, 'won-deal-handoff', config);
    if (!deal.automationStageRuns.includes(runKey)) deal.automationStageRuns.push(runKey);
    if (!task) {
      automationRefreshDeal(deal);
      automationRecordRun('won-deal-handoff', 'deal.stage.changed', 'Skipped because an open Deal Next Action already exists.', deal.t);
      return { handled: true, actions: [] };
    }
    automationRefreshDeal(deal);
    automationRecordRun('won-deal-handoff', 'deal.stage.changed', config.actionName + ' created.', deal.t);
    automationNotify('Automation: ' + config.actionName + ' created for ' + deal.t + '.');
    return { handled: true, actions: [task] };
  }

  function proposalWorkflowKey(config) {
    return Object.keys(workflows).find(function (key) { return workflows[key] === config; }) || 'client-proposal-approval';
  }

  function proposalAssignee(config, key, deal) {
    const selected = config.responsibilities[key] || 'Deal owner';
    return (selected === 'Deal owner' || selected === 'Sales owner') ? automationOwnerName('Deal owner', deal) : selected;
  }

  function proposalRuntimeMeta(config, deal, step) {
    const items = {
      'client-qualification': { title: 'Client qualification', type: 'task', owner: proposalAssignee(config, 'clientQualification', deal), stage: config.stageMap.qualify },
      'site-visit-decision': { title: 'Site visit required?', type: 'decision', owner: proposalAssignee(config, 'clientQualification', deal), stage: config.stageMap.qualify },
      'site-visit': { title: 'Complete site visit', type: 'task', owner: proposalAssignee(config, 'siteVisit', deal), stage: config.stageMap.siteVisit },
      'develop-sow': { title: 'Develop SOW', type: 'task', owner: proposalAssignee(config, 'developSow', deal), stage: config.stageMap.sow },
      'technical-review': { title: 'Technical review', type: 'approval', owner: proposalAssignee(config, 'technicalReview', deal), stage: config.stageMap.technicalReview },
      'develop-proposal': { title: 'Develop Proposal', type: 'task', owner: proposalAssignee(config, 'developProposal', deal), stage: config.stageMap.quoting },
      'internal-approval': { title: 'Internal approval', type: 'approval', owner: proposalAssignee(config, 'internalApproval', deal), stage: config.stageMap.quoting },
      'submit-proposal': { title: 'Submit Proposal to Client', type: 'task', owner: proposalAssignee(config, 'submitProposal', deal), stage: config.stageMap.sent },
      'wait-client': { title: 'Wait for client response', type: 'wait', owner: proposalAssignee(config, 'submitProposal', deal), stage: config.stageMap.sent },
      'client-approval': { title: 'Record client decision', type: 'approval', owner: proposalAssignee(config, 'clientApproval', deal), stage: config.stageMap.sent },
      'request-invoice': { title: 'Request Deposit Invoice', type: 'task', owner: proposalAssignee(config, 'requestInvoice', deal), stage: config.stageMap.sent }
    };
    return items[step] || items['client-qualification'];
  }

  function proposalRecordRuntimeEvent(deal, kind, title) {
    deal.actionHistory = Array.isArray(deal.actionHistory) ? deal.actionHistory : [];
    deal.actionHistory.push({
      id: 'proposal-automation-' + Date.now() + '-' + deal.actionHistory.length,
      kind: kind || 'created', actionType: 'automation', title: title,
      createdAt: new Date().toISOString(), author: 'System'
    });
  }

  function startProposalAutomation(deal, payload) {
    const config = enabledAutomationConfigForKind('proposal-approval', deal);
    if (!config || !config.setupComplete || !deal) return { handled: false, actions: [] };
    const pipeline = payload && payload.pipeline ? payload.pipeline : automationPipelineForConfig(config);
    const toStage = payload && payload.toStage;
    if (pipeline && config.triggerPipelineId && pipeline.id !== config.triggerPipelineId) return { handled: false, actions: [] };
    if (toStage && toStage.name !== config.stageMap.qualify) return { handled: false, actions: [] };
    const workflowKey = proposalWorkflowKey(config);
    deal.proposalAutomationRuns = Array.isArray(deal.proposalAutomationRuns) ? deal.proposalAutomationRuns : [];
    if (deal.proposalAutomationRun && deal.proposalAutomationRun.status === 'in-progress') return { handled: true, actions: [] };
    if (deal.proposalAutomationRuns.includes(workflowKey)) return { handled: true, actions: [] };
    deal.proposalAutomationRuns.push(workflowKey);
    deal.proposalAutomationRun = {
      workflowKey: workflowKey, status: 'in-progress', step: 'client-qualification',
      completed: [], revision: 0, startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    };
    proposalRecordRuntimeEvent(deal, 'created', 'Client Proposal & Approval started');
    automationRecordRun(workflowKey, 'deal.stage.changed', 'Workflow started in ' + config.stageMap.qualify + '.', deal.t);
    automationRefreshDeal(deal);
    automationNotify('Automation started: Client qualification assigned for ' + deal.t + '.');
    return { handled: true, actions: [deal.proposalAutomationRun] };
  }

  function proposalMoveDealToStage(deal, config, stageName) {
    if (!deal || !stageName || typeof CRM_STAGE_DEFS === 'undefined') return false;
    const targetIndex = CRM_STAGE_DEFS.findIndex(function (stage) { return stage.name === stageName; });
    if (targetIndex < 0 || deal.s === targetIndex) return targetIndex >= 0;
    const before = CRM_STAGE_DEFS[deal.s] ? CRM_STAGE_DEFS[deal.s].name : 'Previous stage';
    let moved = false;
    if (typeof ddCard !== 'undefined' && ddCard && ddCard._deal === deal && typeof commitDealMove === 'function') {
      moved = commitDealMove(ddCard, targetIndex);
    } else {
      deal.s = targetIndex;
      moved = true;
      if (typeof rebuildPipelineColumns === 'function') rebuildPipelineColumns();
    }
    if (moved) proposalRecordRuntimeEvent(deal, 'completed', 'Deal moved from ' + before + ' to ' + stageName);
    return moved;
  }

  function refreshProposalRuntimeDeal(deal) {
    if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    if (typeof ddDeal !== 'undefined' && ddDeal === deal) {
      if (typeof ddRenderStagebar === 'function') ddRenderStagebar();
      if (typeof ddRenderFocus === 'function') ddRenderFocus();
      if (typeof ddRenderHistory === 'function') ddRenderHistory();
    }
    if (typeof refreshPipelineDealCard === 'function') refreshPipelineDealCard(deal);
  }

  function proposalRuntimeAction(action) {
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const run = deal && deal.proposalAutomationRun;
    const config = run && workflows[run.workflowKey];
    if (!deal || !run || run.status !== 'in-progress' || !isProposalApproval(config)) return;
    const current = run.step;
    const meta = proposalRuntimeMeta(config, deal, current);
    const completeCurrent = function (label) {
      run.completed = Array.isArray(run.completed) ? run.completed : [];
      run.completed.push({ step: current, result: label || 'completed', at: new Date().toISOString() });
      proposalRecordRuntimeEvent(deal, label === 'changes-requested' ? 'rescheduled' : 'completed', meta.title + ' · ' + (label || 'completed'));
    };
    if (current === 'client-qualification' && action === 'complete') {
      completeCurrent(); run.step = 'site-visit-decision';
    } else if (current === 'site-visit-decision' && action === 'site-required') {
      completeCurrent('site visit required'); proposalMoveDealToStage(deal, config, config.stageMap.siteVisit); run.step = 'site-visit';
    } else if (current === 'site-visit-decision' && action === 'site-not-required') {
      completeCurrent('site visit not required'); proposalMoveDealToStage(deal, config, config.stageMap.sow); run.step = 'develop-sow';
    } else if (current === 'site-visit' && action === 'complete') {
      completeCurrent(); proposalMoveDealToStage(deal, config, config.stageMap.sow); run.step = 'develop-sow';
    } else if (current === 'develop-sow' && action === 'complete') {
      completeCurrent(); proposalMoveDealToStage(deal, config, config.stageMap.technicalReview); run.step = 'technical-review';
    } else if (current === 'technical-review' && action === 'approve') {
      completeCurrent('approved'); proposalMoveDealToStage(deal, config, config.stageMap.quoting); run.step = 'develop-proposal';
    } else if (current === 'technical-review' && action === 'request-changes') {
      completeCurrent('changes-requested'); run.revision += 1; proposalMoveDealToStage(deal, config, config.stageMap.sow); run.step = 'develop-sow';
    } else if (current === 'develop-proposal' && action === 'complete') {
      completeCurrent(); run.step = 'internal-approval';
    } else if (current === 'internal-approval' && action === 'approve') {
      completeCurrent('approved'); proposalMoveDealToStage(deal, config, config.stageMap.sent); run.step = 'submit-proposal';
    } else if (current === 'internal-approval' && action === 'request-changes') {
      completeCurrent('changes-requested'); run.revision += 1; run.step = 'develop-proposal';
    } else if (current === 'submit-proposal' && action === 'complete') {
      completeCurrent(); run.step = 'wait-client';
    } else if (current === 'wait-client' && action === 'client-replied') {
      completeCurrent('client replied'); run.step = 'client-approval';
    } else if (current === 'client-approval' && action === 'approve') {
      completeCurrent('approved'); run.step = 'request-invoice';
    } else if (current === 'client-approval' && action === 'request-changes') {
      completeCurrent('changes-requested'); run.revision += 1; proposalMoveDealToStage(deal, config, config.stageMap.quoting); run.step = 'develop-proposal';
    } else if (current === 'request-invoice' && action === 'complete') {
      completeCurrent(); run.status = 'completed'; run.step = 'completed'; run.completedAt = new Date().toISOString();
      proposalRecordRuntimeEvent(deal, 'completed', 'Client Proposal & Approval completed');
    } else {
      return;
    }
    run.updatedAt = new Date().toISOString();
    refreshProposalRuntimeDeal(deal);
    const next = run.status === 'completed' ? 'Workflow completed.' : proposalRuntimeMeta(config, deal, run.step).title + ' is ready.';
    automationNotify(next);
  }

  function proposalRuntimeFocusMarkup(deal) {
    const run = deal && deal.proposalAutomationRun;
    const config = run && workflows[run.workflowKey];
    if (!run || !isProposalApproval(config)) return '';
    if (run.status === 'completed') {
      return '<div class="dd-focus-item aut-runtime-card complete"><i class="fai">&#xf058;</i><div><b>Client Proposal &amp; Approval complete</b><div class="dd-focus-meeting-meta">All workflow steps completed · ' + escapeAutomationHtml(config.stageMap.sent) + '</div></div></div>';
    }
    const meta = proposalRuntimeMeta(config, deal, run.step);
    const order = ['client-qualification', 'site-visit-decision', 'site-visit', 'develop-sow', 'technical-review', 'develop-proposal', 'internal-approval', 'submit-proposal', 'wait-client', 'client-approval', 'request-invoice'];
    const currentIndex = Math.max(0, order.indexOf(run.step));
    let buttons = '';
    if (meta.type === 'approval') buttons = '<button type="button" class="wq-btn wq-btn-primary" onclick="WeQuoteAutomation.proposalAction(\'approve\')">Approve</button><button type="button" class="wq-btn wq-btn-tertiary aut-runtime-request" onclick="WeQuoteAutomation.proposalAction(\'request-changes\')">Request changes</button>';
    else if (meta.type === 'decision') buttons = '<button type="button" class="wq-btn wq-btn-primary" onclick="WeQuoteAutomation.proposalAction(\'site-required\')">Site visit required</button><button type="button" class="wq-btn wq-btn-tertiary" onclick="WeQuoteAutomation.proposalAction(\'site-not-required\')">Not required</button>';
    else if (meta.type === 'wait') buttons = '<button type="button" class="wq-btn wq-btn-primary" onclick="WeQuoteAutomation.proposalAction(\'client-replied\')">Client replied</button>';
    else buttons = '<button type="button" class="wq-btn wq-btn-neutral" onclick="WeQuoteAutomation.proposalAction(\'complete\')"><i class="fai">&#xf00c;</i> Mark complete</button>';
    return '<div class="dd-focus-item aut-runtime-card"><i class="fai">&#xf0e7;</i><div class="aut-runtime-main"><span class="aut-runtime-kicker">CLIENT PROPOSAL &amp; APPROVAL · STEP ' + (currentIndex + 1) + ' OF 11</span><b>' + escapeAutomationHtml(meta.title) + '</b><div class="dd-focus-meeting-meta">' + escapeAutomationHtml(meta.owner) + ' · Stage ' + escapeAutomationHtml(meta.stage) + (run.revision ? ' · Revision ' + (run.revision + 1) : '') + '</div><div class="aut-runtime-progress"><span style="width:' + Math.round(((currentIndex + 1) / 11) * 100) + '%"></span></div></div><div class="aut-runtime-actions">' + buttons + '</div></div>';
  }

  function preQuoteReadinessFocusMarkup(deal) {
    const task = openPreQuoteReadinessTask(deal);
    if (!task) return '';
    const required = task.requiredToContinue !== false && task.blockingTransition !== '';
    const due = new Date(task.dueAt);
    const dueLabel = Number.isNaN(due.getTime()) ? '' : due.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return '<div class="dd-focus-item aut-runtime-card aut-readiness-card"><i class="fai">&#xf0e7;</i>' +
      '<div class="aut-runtime-main"><span class="aut-runtime-kicker">' + (required ? 'REQUIRED BEFORE FIRST QUOTE' : 'AUTOMATION FOLLOW-UP') + '</span>' +
      '<b>Site readiness follow-up due</b><div class="dd-focus-meeting-meta">Created by Automation · Assigned to @' +
      escapeAutomationHtml(task.assignedTo || 'Deal owner') + (dueLabel ? ' · Due ' + escapeAutomationHtml(dueLabel) : '') +
      '</div><div class="dd-focus-meeting-meta">' + (required ? 'Complete this task before creating the first related Quote.' : 'This task is optional and can be completed or skipped without blocking the Pipeline.') + '</div></div>' +
      '<div class="aut-runtime-actions"><button type="button" class="wq-btn wq-btn-neutral" onclick="WeQuoteAutomation.completePreQuoteReadiness(event)"><i class="fai">&#xf00c;</i> Mark complete</button>' +
      '<button type="button" class="wq-btn wq-btn-tertiary" onclick="WeQuoteAutomation.reschedulePreQuoteReadiness(event)"><i class="fai">&#xf073;</i> Reschedule</button>' +
      (required ? '' : '<button type="button" class="wq-btn wq-btn-tertiary" onclick="WeQuoteAutomation.skipPreQuoteReadiness(event)">Skip</button>') + '</div></div>';
  }

  function automationOpenRequirements(deal) {
    return (deal && Array.isArray(deal.automationRequirements) ? deal.automationRequirements : []).filter(function (requirement) {
      return requirement && requirement.status === 'open' && requirement.requiredToContinue !== false;
    });
  }

  function automationFileRequestById(deal, requestId) {
    return (deal && Array.isArray(deal.fileRequests) ? deal.fileRequests : []).find(function (request) {
      return String(request.id) === String(requestId);
    });
  }

  function automationFileRequestNote(deal, request) {
    return (deal && Array.isArray(deal.notes) ? deal.notes : []).find(function (note) {
      return note && String(note.fileRequestId) === String(request && request.id);
    });
  }

  function automationRequirementMessage(requirement) {
    const eventLabels = {
      'deal-leaves-stage': 'leaving this Stage',
      'first-related-quote': 'creating the first related Quote',
      'quote-submitted-review': 'submitting the Quote for internal review',
      'quote-review-passed': 'passing Quote Review',
      'quote-sent': 'sending the Quote to the customer',
      'quote-accepted': 'accepting the related Quote',
      'deal-lost': 'moving this Deal to Lost',
      'deal-won': 'moving this Deal to Won'
    };
    return 'Complete “' + requirement.title + '” in Needs your attention before ' +
      (eventLabels[requirement.blockedEvent] || 'continuing this lifecycle event') + '.';
  }

  function automationRequirementSourceLabel(deal, requirement) {
    const stageName = requirement && requirement.stageName;
    const currentStage = deal && typeof CRM_STAGE_DEFS !== 'undefined' ? CRM_STAGE_DEFS[deal.s] : null;
    const stage = stageName && typeof CRM_STAGE_DEFS !== 'undefined'
      ? CRM_STAGE_DEFS.find(function (item) { return item && item.name === stageName; })
      : currentStage;
    return stage && stage.protected ? 'Quote Lifecycle requirement' : 'Custom Stage requirement';
  }

  function automationRequirementViewItem(deal, requirement) {
    if (!requirement) return null;
    const linkedType = requirement.linkedType || requirement.type || 'task';
    const linkedId = String(requirement.linkedId || requirement.id || '');
    let linkedRecord = null;
    let owner = requirement.assignedTo || '';
    let dueAt = requirement.dueAt || '';

    if (linkedType === 'file-request') {
      linkedRecord = automationFileRequestById(deal, linkedId);
      owner = linkedRecord && linkedRecord.assignedTo || owner;
      dueAt = linkedRecord && linkedRecord.dueAt || dueAt;
    } else if (linkedType === 'note') {
      linkedRecord = (deal && Array.isArray(deal.notes) ? deal.notes : []).find(function (note) {
        return note && String(note.id) === linkedId;
      });
      owner = linkedRecord && Array.isArray(linkedRecord.mentions) && linkedRecord.mentions[0] || owner;
      dueAt = linkedRecord && linkedRecord.followUpAt || dueAt;
    } else if (linkedType === 'meeting') {
      linkedRecord = (deal && Array.isArray(deal.meetings) ? deal.meetings : []).find(function (meeting) {
        return meeting && String(meeting.id) === linkedId;
      });
      owner = linkedRecord && (linkedRecord.assignedTo || linkedRecord.owner) || owner;
      dueAt = linkedRecord && linkedRecord.date
        ? linkedRecord.date + 'T' + (linkedRecord.time || '17:00') + ':00'
        : dueAt;
    }

    return {
      id: String(requirement.id || linkedId),
      linkedType: linkedType,
      linkedId: linkedId,
      title: requirement.title || linkedRecord && linkedRecord.title || 'Required task',
      workflowTitle: requirement.workflowTitle || 'Automation',
      stageName: requirement.stageName || '',
      blockedEvent: requirement.blockedEvent || requirement.blockingTransition || '',
      owner: owner || 'Deal owner',
      dueAt: dueAt || '',
      sourceLabel: automationRequirementSourceLabel(deal, requirement),
      canComplete: linkedType === 'note' || linkedType === 'meeting' || linkedType === 'site-readiness',
      canUpload: linkedType === 'file-request'
    };
  }

  function preQuoteReadinessViewItem(deal) {
    const task = openPreQuoteReadinessTask(deal);
    if (!task || task.requiredToContinue === false) return null;
    return automationRequirementViewItem(deal, {
      id: task.id,
      linkedType: 'site-readiness',
      linkedId: task.id,
      title: task.title || 'Complete required site readiness',
      workflowTitle: 'Site readiness Automation',
      stageName: (typeof CRM_STAGE_DEFS !== 'undefined' && CRM_STAGE_DEFS[deal.s] || {}).name || '',
      blockedEvent: task.blockingTransition || 'first-related-quote',
      assignedTo: task.assignedTo,
      dueAt: task.dueAt
    });
  }

  function automationBoundaryEventForStage(targetStage) {
    if (!targetStage) return '';
    if (targetStage.outcome === 'lost') return 'deal-lost';
    if (targetStage.outcome === 'won') return 'deal-won';
    const events = {
      'In Progress': 'first-related-quote',
      'In Review': 'quote-submitted-review',
      'Passed Review': 'quote-review-passed',
      Sent: 'quote-sent'
    };
    return targetStage.protected ? (events[targetStage.name] || '') : '';
  }

  function uniqueAutomationRequirementItems(items) {
    const seen = new Set();
    return items.filter(function (item) {
      if (!item) return false;
      const key = item.linkedType + ':' + item.linkedId;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function genericAutomationEventRequirements(deal, eventName) {
    const items = automationOpenRequirements(deal).filter(function (item) {
      return item.blockedEvent === eventName;
    }).map(function (item) { return automationRequirementViewItem(deal, item); });
    if (preQuoteReadinessEventBlock(deal, eventName)) items.push(preQuoteReadinessViewItem(deal));
    return uniqueAutomationRequirementItems(items);
  }

  function genericAutomationMoveRequirements(deal, targetStage, options) {
    if (!deal || !targetStage || (options && options.systemDerived)) return [];
    const sourceStage = typeof CRM_STAGE_DEFS !== 'undefined' ? (CRM_STAGE_DEFS[deal.s] || {}) : {};
    const eventName = automationBoundaryEventForStage(targetStage);
    const items = automationOpenRequirements(deal).filter(function (item) {
      const blocksLeavingStage = item.blockedEvent === 'deal-leaves-stage' &&
        item.stageName === sourceStage.name && targetStage.name !== sourceStage.name;
      const blocksBoundary = eventName && item.blockedEvent === eventName;
      return blocksLeavingStage || blocksBoundary;
    }).map(function (item) { return automationRequirementViewItem(deal, item); });
    if (preQuoteReadinessMoveBlock(deal, targetStage, options)) items.push(preQuoteReadinessViewItem(deal));
    return uniqueAutomationRequirementItems(items);
  }

  function genericAutomationEventBlock(deal, eventName) {
    const requirement = automationOpenRequirements(deal).find(function (item) {
      return item.blockedEvent === eventName;
    });
    return requirement ? automationRequirementMessage(requirement) : null;
  }

  function genericAutomationMoveBlock(deal, targetStage, options) {
    if (!deal || !targetStage || (options && options.systemDerived)) return null;
    const sourceStage = typeof CRM_STAGE_DEFS !== 'undefined' ? (CRM_STAGE_DEFS[deal.s] || {}) : {};
    const leavingRequirement = automationOpenRequirements(deal).find(function (item) {
      return item.blockedEvent === 'deal-leaves-stage' && item.stageName === sourceStage.name && targetStage.name !== sourceStage.name;
    });
    if (leavingRequirement) return automationRequirementMessage(leavingRequirement);
    const eventName = targetStage.outcome === 'lost' ? 'deal-lost' : targetStage.outcome === 'won' ? 'deal-won' : '';
    return eventName ? genericAutomationEventBlock(deal, eventName) : null;
  }

  function resolveRequiredAutomationActivity(linkedType, linkedId, dealInput) {
    const deal = dealInput || (typeof ddDeal !== 'undefined' ? ddDeal : null);
    if (!deal) return false;
    const requirement = automationOpenRequirements(deal).find(function (item) {
      return item.linkedType === linkedType && String(item.linkedId) === String(linkedId);
    });
    if (!requirement) return false;
    requirement.status = 'completed';
    requirement.completedAt = new Date().toISOString();
    genericAutomationHistory(deal, {
      kind: 'completed', actionType: linkedType, title: 'Required item completed · ' + requirement.title
    });
    automationRefreshDeal(deal);
    return true;
  }

  function completeRequiredAutomationItem(linkedType, linkedId, dealInput) {
    const deal = dealInput || (typeof ddDeal !== 'undefined' ? ddDeal : null);
    if (!deal) return false;
    const now = new Date().toISOString();
    let record = null;

    if (linkedType === 'site-readiness') {
      record = deal.preQuoteReadinessTask && String(deal.preQuoteReadinessTask.id) === String(linkedId)
        ? deal.preQuoteReadinessTask
        : (deal.automationTasks || []).find(function (task) { return task && String(task.id) === String(linkedId); });
      if (!record || record.status === 'completed') return false;
      record.status = 'completed';
      record.completedAt = now;
      genericAutomationHistory(deal, {
        kind: 'completed', actionType: 'site-readiness', title: 'Required task completed · ' + (record.title || 'Site readiness')
      });
      automationRefreshDeal(deal);
      return true;
    }

    if (linkedType === 'note') {
      record = (deal.notes || []).find(function (note) { return note && String(note.id) === String(linkedId); });
      if (record) {
        record.followUpStatus = 'completed';
        record.followUpCompletedAt = now;
      }
    } else if (linkedType === 'meeting') {
      record = (deal.meetings || []).find(function (meeting) { return meeting && String(meeting.id) === String(linkedId); });
      if (record) {
        record.status = 'completed';
        record.completedAt = now;
      }
    }
    if (!record) return false;
    return resolveRequiredAutomationActivity(linkedType, linkedId, deal);
  }

  function resolveFileRequestFromRecords(deal, records, requestId) {
    if (!deal || !Array.isArray(records) || !records.length) return false;
    const openRequests = genericAutomationOpenFileRequests(deal);
    const request = requestId
      ? openRequests.find(function (item) { return String(item.id) === String(requestId); })
      : (openRequests.length === 1 ? openRequests[0] : null);
    if (!request) return false;
    request.fileIds = Array.isArray(request.fileIds) ? request.fileIds : [];
    records.forEach(function (record) {
      record.fileRequestId = request.id;
      if (!request.fileIds.includes(record.id)) request.fileIds.push(record.id);
    });
    request.status = 'received';
    request.receivedAt = new Date().toISOString();
    request.receivedBy = typeof CRM_CURRENT_USER !== 'undefined' ? CRM_CURRENT_USER : 'Current user';
    const note = automationFileRequestNote(deal, request);
    if (note) {
      note.fileRequestStatus = 'received';
      note.fileRequestReceivedAt = request.receivedAt;
      note.attachments = Array.isArray(note.attachments) ? note.attachments : [];
      records.forEach(function (record) {
        if (!note.attachments.some(function (attachment) { return String(attachment.id) === String(record.id); })) {
          note.attachments.push({ id: record.id, name: record.name, size: record.size, type: record.type || '' });
        }
      });
    }
    if (request.requirementId) {
      const requirement = (deal.automationRequirements || []).find(function (item) { return item.id === request.requirementId; });
      if (requirement) {
        requirement.status = 'completed';
        requirement.completedAt = request.receivedAt;
      }
    } else {
      resolveRequiredAutomationActivity('file-request', request.id, deal);
    }
    genericAutomationHistory(deal, {
      kind: 'file-request-received', actionType: 'file-request',
      title: request.title + ' received · ' + records.map(function (record) { return record.name; }).join(', ')
    });
    automationRefreshDeal(deal);
    emitAutomationEvent('deal.file-request.completed', { deal: deal, request: request, files: records, field: 'file-request' });
    return true;
  }

  function uploadRequestedFiles(requestId, input, dealInput) {
    const deal = dealInput || (typeof ddDeal !== 'undefined' ? ddDeal : null);
    const request = automationFileRequestById(deal, requestId);
    const files = Array.from(input && input.files || []);
    if (!deal || !request || !files.length) return;
    const maxSize = 25 * 1024 * 1024;
    const accepted = files.filter(function (file) { return file.size <= maxSize; });
    if (!accepted.length) {
      automationNotify('Files must be 25MB or smaller.');
      if (input) input.value = '';
      return;
    }
    deal.files = Array.isArray(deal.files) ? deal.files : [];
    const records = accepted.map(function (file, index) {
      return {
        id: 'requested-file-' + Date.now() + '-' + index, name: file.name, size: file.size,
        type: file.type || '', uploadedAt: new Date().toISOString(),
        uploadedBy: typeof CRM_CURRENT_USER !== 'undefined' ? CRM_CURRENT_USER : 'Current user',
        source: 'file-request', fileRequestId: request.id
      };
    });
    deal.files.push.apply(deal.files, records);
    resolveFileRequestFromRecords(deal, records, request.id);
    records.forEach(function (record) {
      emitAutomationEvent('deal.file.added', { deal: deal, file: record, field: 'file' });
    });
    if (input) input.value = '';
    automationNotify(request.title + ' uploaded. The required checkpoint is complete.');
  }

  function sendFileRequestReminder(requestId, event) {
    if (event) event.stopPropagation();
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const request = automationFileRequestById(deal, requestId);
    if (!deal || !request || request.status === 'received' || request.status === 'cancelled') return;
    request.reminderCount = (Number(request.reminderCount) || 0) + 1;
    request.lastReminderAt = new Date().toISOString();
    genericAutomationHistory(deal, {
      kind: 'file-request-reminder', actionType: 'file-request',
      title: 'Reminder sent · ' + request.title + ' · ' + request.requestedFrom
    });
    automationRefreshDeal(deal);
    automationNotify('Reminder sent for ' + request.title + '.');
  }

  function fileRequestControlsMarkup(request, compact) {
    if (!request) return '';
    if (request.status === 'received') {
      return '<span class="aut-file-request-complete"><i class="fai">&#xf058;</i> Received</span>';
    }
    const inputId = 'autFileRequestUpload-' + escapeAutomationHtml(request.id) + (compact ? '-history' : '-focus');
    return '<div class="aut-file-request-actions' + (compact ? ' compact' : '') + '">' +
      '<label class="wq-btn wq-btn-primary" for="' + inputId + '"><i class="fai">&#xf093;</i> Upload file</label>' +
      '<input id="' + inputId + '" type="file" hidden onchange="WeQuoteAutomation.uploadRequestedFiles(\'' + escapeAutomationHtml(request.id) + '\',this)">' +
      '<button type="button" class="wq-btn wq-btn-tertiary" onclick="WeQuoteAutomation.sendFileRequestReminder(\'' + escapeAutomationHtml(request.id) + '\',event)"><i class="fai">&#xf0f3;</i> Send reminder</button></div>';
  }

  function fileRequestHistoryMarkup(requestId) {
    const deal = typeof ddDeal !== 'undefined' ? ddDeal : null;
    const request = automationFileRequestById(deal, requestId);
    if (!request) return '';
    const due = new Date(request.dueAt);
    const dueLabel = Number.isNaN(due.getTime()) ? '' : due.toLocaleString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    return '<div class="aut-file-request-history ' + escapeAutomationHtml(request.status) + '"><span><b>' +
      (request.status === 'received' ? 'FILE RECEIVED' : 'FILE REQUEST · ' + (due < new Date() ? 'OVERDUE' : 'OPEN')) +
      '</b><small>' + escapeAutomationHtml(request.requestedFrom) + ' · ' + escapeAutomationHtml(request.assignedTo) +
      (dueLabel ? ' · Due ' + escapeAutomationHtml(dueLabel) : '') +
      (request.reminderCount ? ' · ' + request.reminderCount + ' reminder' + (request.reminderCount === 1 ? '' : 's') : '') +
      '</small></span>' + fileRequestControlsMarkup(request, true) + '</div>';
  }

  function fileRequestFocusMarkup(deal) {
    return genericAutomationOpenFileRequests(deal).map(function (request) {
      const due = new Date(request.dueAt);
      const overdue = !Number.isNaN(due.getTime()) && due < new Date();
      const dueLabel = Number.isNaN(due.getTime()) ? '' : due.toLocaleString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      return '<div class="dd-focus-item aut-runtime-card aut-file-request-card' + (overdue ? ' overdue' : '') + '" data-file-request-focus="' + escapeAutomationHtml(request.id) + '"' + (overdue ? ' data-overdue-focus="true"' : '') + ' tabindex="-1"><i class="fai">&#xf56f;</i>' +
        '<div class="aut-runtime-main"><span class="aut-runtime-kicker">' + (request.requiredToContinue ? 'REQUIRED FILE' : 'FILE REQUEST') + (overdue ? ' · OVERDUE' : '') + '</span>' +
        '<b>' + escapeAutomationHtml(request.title) + '</b><div class="dd-focus-meeting-meta">Requested from ' + escapeAutomationHtml(request.requestedFrom) +
        ' · Assigned to @' + escapeAutomationHtml(request.assignedTo) + (dueLabel ? ' · Due ' + escapeAutomationHtml(dueLabel) : '') + '</div>' +
        '<div class="dd-focus-meeting-meta">Accepted: ' + escapeAutomationHtml(request.acceptedTypes) +
        (request.requiredToContinue ? ' · Complete before ' + escapeAutomationHtml(request.blockedEvent.replace(/-/g, ' ')) : '') + '</div></div>' +
        fileRequestControlsMarkup(request, false) + '</div>';
    }).join('');
  }

  function automationDealFocusMarkup(deal) {
    return fileRequestFocusMarkup(deal) + preQuoteReadinessFocusMarkup(deal) + proposalRuntimeFocusMarkup(deal);
  }

  function emitAutomationEvent(eventName, payload) {
    const data = payload || {};
    resumeDueGenericAutomationRuns();
    const generic = runGenericAutomations(eventName, data);
    let special = { handled: false, actions: [] };
    if (eventName === 'lead.created') special = runNewLeadAutomation(data.lead);
    else if (eventName === 'lead.inactive.scan') special = runInactiveLeadScan();
    else if (eventName === 'quote.sent') special = runQuoteFollowUpAutomation(data.deal, data.quote);
    else if (eventName === 'quote.accepted') special = runAcceptedQuoteAutomations(data.deal, data.quote);
    if (eventName === 'deal.stage.changed') {
      const readiness = runPreQuoteReadinessAutomation(data.deal, data);
      const proposal = startProposalAutomation(data.deal, data);
      const won = runDealStageAutomation(data.deal, data);
      special = { handled: readiness.handled || proposal.handled || won.handled, actions: (readiness.actions || []).concat(proposal.actions || [], won.actions || []) };
    } else if (eventName === 'deal.created' && data.deal) {
      special = runPreQuoteReadinessAutomation(data.deal, { pipeline: typeof getActivePipeline === 'function' ? getActivePipeline() : null });
    } else if (eventName === 'lead.converted' && data.deal) {
      automationRecordRun('lead-conversion', 'lead.converted', 'Lead converted and linked to Deal.', data.deal.t);
      const readiness = runPreQuoteReadinessAutomation(data.deal, { pipeline: typeof getActivePipeline === 'function' ? getActivePipeline() : null });
      const proposalConfig = enabledAutomationConfigForKind('proposal-approval', data.deal);
      const proposal = startProposalAutomation(data.deal, { pipeline: automationPipelineForConfig(proposalConfig), toStage: { name: proposalConfig ? proposalConfig.stageMap.qualify : 'Qualified' } });
      special = { handled: true, actions: (readiness.actions || []).concat(proposal.actions || []) };
    } else if (eventName === 'invoice.created' && data.invoice) {
      special = { handled: true, actions: [data.invoice] };
    }
    return {
      handled: generic.handled || special.handled,
      actions: (generic.actions || []).concat(special.actions || []),
      workflows: generic.workflows || []
    };
  }

  window.WeQuoteAutomation = {
    emit: emitAutomationEvent,
    isEnabled: automationEnabledForKind,
    scanInactiveLeads: runInactiveLeadScan,
    scanScheduledEvents: scanGenericScheduledAutomationEvents,
    renderDealFocus: automationDealFocusMarkup,
    getDealMoveBlock: function (deal, targetStage, options) {
      return genericAutomationMoveBlock(deal, targetStage, options) || preQuoteReadinessMoveBlock(deal, targetStage, options);
    },
    getDealMoveRequirements: genericAutomationMoveRequirements,
    getEventBlock: function (deal, eventName) {
      return genericAutomationEventBlock(deal, eventName) || preQuoteReadinessEventBlock(deal, eventName);
    },
    getEventRequirements: genericAutomationEventRequirements,
    getFirstQuoteBlock: function (deal) {
      return genericAutomationEventBlock(deal, 'first-related-quote') || preQuoteReadinessEventBlock(deal, 'first-related-quote');
    },
    getFirstQuoteRequirements: function (deal) {
      return genericAutomationEventRequirements(deal, 'first-related-quote');
    },
    uploadRequestedFiles: uploadRequestedFiles,
    sendFileRequestReminder: sendFileRequestReminder,
    resolveFileRequestFromRecords: resolveFileRequestFromRecords,
    resolveRequiredActivity: resolveRequiredAutomationActivity,
    completeRequiredItem: completeRequiredAutomationItem,
    fileRequestHistoryMarkup: fileRequestHistoryMarkup,
    completePreQuoteReadiness: completePreQuoteReadinessTask,
    reschedulePreQuoteReadiness: reschedulePreQuoteReadinessTask,
    skipPreQuoteReadiness: skipPreQuoteReadinessTask,
    proposalAction: proposalRuntimeAction,
    workflows: workflows,
    recentRuns: function () { return automationRuntimeState.runs.slice(); },
    openStageManager: function (stageInput) {
      const context = typeof stageInput === 'string'
        ? { stageName: stageInput, pipelineId: 'sales-pipeline', pipelineName: 'Sales Pipeline', pipelineType: 'quote-connected', quoteConnected: true, stageProtected: AUTOMATION_STAGE_DEFINITIONS.some(function (stage) { return stage.name === stageInput; }) }
        : Object.assign({}, stageInput || {});
      const stageName = context.stageName;
      if (!stageName) return;
      selectedAutomationStageContext = context;
      selectedAutomationStage = stageName;
      selectedTemplatePipelineId = context.pipelineId || 'sales-pipeline';
      const contextPipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelineById('sales-pipeline');
      selectedAutomationGroupKey = selectedTemplatePipelineId === 'sales-pipeline'
        ? (activeAutomationGroupKey || selectedAutomationGroupKey || 'standard')
        : ensurePipelineAutomationGroup(contextPipeline);
      if (typeof window.showView === 'function') window.showView('automation');
      showAutomationPipelineDetail(selectedAutomationGroupKey);
      const conceptByStage = {
        Qualified: 'first-action',
        'In Progress': 'quote-build',
        'In Review': 'internal-review',
        'Passed Review': 'ready-send',
        Sent: 'sent-follow-up',
        Won: 'accepted-handoff',
        Lost: 'commercial-complete'
      };
      const concept = context.quoteConnected && context.stageProtected ? conceptByStage[stageName] : null;
      if (concept && conceptAutomationDefinitions[concept]) {
        renderConceptAutomation(concept);
        requestAnimationFrame(function () { conceptPreview.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
        showAutomationToast(stageName + ' structure is protected. Its operational Automations remain editable.');
      } else {
        const customWorkflowKey = userWorkflowKeys().find(function (key) {
          return (workflows[key].triggerStageId === context.stageId || workflowStageName(workflows[key]) === stageName) &&
            (!context.pipelineId || workflows[key].triggerPipelineId === context.pipelineId);
        });
        if (customWorkflowKey) {
          if (context.stageId && !workflows[customWorkflowKey].triggerStageId) {
            workflows[customWorkflowKey].triggerStageId = context.stageId;
            workflows[customWorkflowKey].triggerStage = stageName;
            persistAutomationState();
          }
          activeWorkflowKey = customWorkflowKey;
          activeNode = 'scratch-trigger';
          showActiveAutomation();
          updateCanvas();
          renderInspector(activeNode);
          showAutomationToast(stageName + ' uses its own Automation settings inside the ' + (context.quoteConnected ? 'shared lifecycle-segment library.' : 'shared Fully Custom Stage library.'));
        } else {
          openStageAutomationCreator(stageName, true, 'templates', context.pipelineId);
          showAutomationToast(stageName + ' is ready. Choose a compatible Start event, then add Rules and Actions.');
        }
      }
    }
  };

  function leadAssignmentDisplay(config) {
    if (!config) return 'Unassigned';
    return config.assignmentOwner === 'Round-robin sales team' ? 'Sales team · Round-robin' : config.assignmentOwner;
  }

  function proposalJourneyModel(config) {
    const map = config.stageMap || {
      qualify: 'Qualified', siteVisit: 'Site Visit', sow: 'Scope of Work',
      technicalReview: 'Technical Review', quoting: 'In Progress', sent: 'Sent'
    };
    const role = config.responsibilities || {};
    const pipeline = automationPipelineForConfig(config);
    const stages = automationPipelineStages(pipeline);
    const model = stages.map(function (stage) {
      if (stage.name === map.qualify) {
        return { type: 'Pipeline stage', stage: stage.name, title: 'Client qualification', detail: 'Confirm the opportunity · Decide whether a site visit is required', link: 'Workflow starts in this existing stage', icon: '&#xf0b1;', narration: 'The Deal owner qualifies the opportunity and decides whether the Deal enters Site Visit or skips directly to Scope of Work.' };
      }
      if (stage.name === map.siteVisit) {
        return { type: 'New Pipeline stage', stage: stage.name, title: 'Complete site visit', detail: 'Schedule visit · Capture site information', link: 'Template-created · Conditional stage', icon: '&#xf133;', narration: (role.siteVisit || 'Deal owner') + ' completes the site visit. Deals that do not require a visit skip this stage.' };
      }
      if (stage.name === map.sow) {
        return { type: 'New Pipeline stage', stage: stage.name, title: 'Develop SOW', detail: 'Prepare scope · Confirm requirements', link: 'Template-created stage', icon: '&#xf15c;', narration: (role.developSow || 'Deal owner') + ' develops the Statement of Work before Engineering review.' };
      }
      if (stage.name === map.technicalReview) {
        return { type: 'New Pipeline stage', stage: stage.name, title: 'Technical review', detail: 'Engineering approval · Request changes if required', link: 'Template-created stage', icon: '&#xf013;', narration: (role.technicalReview || 'Engineering Team') + ' approves the technical scope or sends it back to Scope of Work.' };
      }
      if (stage.name === map.quoting) {
        return { type: 'Pipeline stage', stage: stage.name, title: 'Develop Proposal', detail: 'Prepare commercial proposal · Internal approval required', link: 'Moves here after technical approval', icon: '&#xf15c;', cardClass: 'quote', narration: 'Technical approval moves the Deal here. ' + (role.developProposal || 'Deal owner') + ' develops the Proposal and ' + (role.internalApproval || 'Commercial approver') + ' reviews it.' };
      }
      if (stage.name === map.sent) {
        return { type: 'Pipeline stage', stage: stage.name, title: 'Client review', detail: 'Submit Proposal to Client · Wait and record client decision', link: 'Moves here after internal approval', icon: '&#xf1d8;', cardClass: 'quote', narration: 'Internal approval moves the Deal here. Sales submits the Proposal and records the client decision.' };
      }
      if (stage.outcome === 'won' || /^Won$/i.test(stage.name)) {
        return { type: 'Outcome', stage: stage.name, title: 'Approved commercial outcome', detail: 'Accepted Quote fixes the value · Project and Deposit Invoice can follow', link: 'Existing ' + stage.name + ' outcome stage', icon: '&#xf091;', cardClass: 'project', alwaysOn: true, narration: 'Only a real accepted Quote or commercial outcome moves the Deal to ' + stage.name + '. Project and Invoice remain downstream records.' };
      }
      if (stage.outcome === 'lost' || /^Lost$/i.test(stage.name)) {
        return { type: 'Outcome', stage: stage.name, title: 'Lost commercial outcome', detail: 'Deal is closed as Lost · Lost reason is recorded', link: 'Alternative outcome from the existing Pipeline', icon: '&#xf05e;', cardClass: 'lost', alwaysOn: true, pathAlternative: true, narration: stage.name + ' is the alternative outcome when the opportunity does not proceed.' };
      }
      return { type: 'Pipeline stage', stage: stage.name, title: stage.name, detail: 'No template work is mapped to this stage', link: 'Existing stage remains unchanged', icon: '&#xf0ae;', narration: 'This existing Pipeline stage remains available and is not created or removed by the template.' };
    });
    model.forEach(function (step) {
      step.record = {
        label: 'Deal · D-0348', status: step.stage, title: 'ABR Residential AV Upgrade',
        lines: ['ABR Developments', '£20,000 · Owner: Jeff Mitchel']
      };
      if (step.stage === map.qualify) {
        step.impact = { beforeTitle: 'Deal in ' + step.stage, beforeCopy: 'Qualification work not started', afterTitle: 'Client qualification', afterCopy: 'Site visit decision is recorded' };
      } else if (step.stage === map.siteVisit) {
        step.impact = { beforeTitle: 'Site visit required', beforeCopy: 'Deal is still in Qualified', afterTitle: 'Deal in ' + step.stage, afterCopy: 'Visit is scheduled and completed' };
      } else if (step.stage === map.sow) {
        step.impact = { beforeTitle: 'Requirements confirmed', beforeCopy: 'Scope is ready to develop', afterTitle: 'Deal in ' + step.stage, afterCopy: 'SOW task assigned to ' + (role.developSow || 'Deal owner') };
      } else if (step.stage === map.technicalReview) {
        step.impact = { beforeTitle: 'SOW complete', beforeCopy: 'Engineering review is ready', afterTitle: 'Deal in ' + step.stage, afterCopy: 'Approve or return to Scope of Work' };
      } else if (step.stage === map.quoting) {
        step.impact = { beforeTitle: 'Technical review approved', beforeCopy: 'Move Deal action is ready', afterTitle: 'Deal in ' + step.stage, afterCopy: 'Develop Proposal · Internal approval' };
      } else if (step.stage === map.sent) {
        step.impact = { beforeTitle: 'Internal approval complete', beforeCopy: 'Proposal ready for the client', afterTitle: 'Deal in ' + step.stage, afterCopy: 'Submit and await client response' };
      } else if (step.pathAlternative) {
        step.impact = { beforeTitle: 'Opportunity will not proceed', beforeCopy: 'Lost reason is required', afterTitle: 'Deal in ' + step.stage, afterCopy: 'Outcome and reason recorded' };
      } else {
        step.impact = { beforeTitle: 'Client approved', beforeCopy: 'Commercial outcome accepted', afterTitle: 'Deal in ' + step.stage, afterCopy: '£20,000 winning value fixed' };
      }
    });
    return model;
  }

  function journeyPlayableModel() {
    return currentJourneyModel.filter(function (step) { return !step.pathAlternative; });
  }

  function customJourneyModel(config) {
    const trigger = scratchTriggerText(config);
    if (config.triggerKind === 'trigger-deal-custom-stage' || (templateDefinitions[config.templateKey] && templateDefinitions[config.templateKey].customStageTemplate)) {
      trigger.detail = automationPipelineName(config) + ' · ' + workflowStageName(config);
    }
    normalizeScratchTree(config);
    const model = [{
      type: 'Trigger', stage: config.objectType, title: trigger.title, detail: trigger.detail,
      link: 'A matching future CRM event starts the flow', icon: '&#xf0a6;',
      narration: 'A matching ' + config.objectType + ' enters this automation. This preview does not change the record.'
    }];

    function firstBranchTitle(steps) {
      if (!Array.isArray(steps) || !steps.length) return 'End workflow';
      return scratchStepText(steps[0]).title;
    }

    function appendSequence(steps, branchLabel) {
      (Array.isArray(steps) ? steps : []).forEach(function (step) {
        const text = scratchStepText(step);
        const condition = step.type === 'condition';
        const prefix = branchLabel ? branchLabel + ' · ' : '';
        const item = {
          type: prefix + text.kicker, stage: condition ? 'Yes / No' : config.objectType,
          title: text.title, detail: text.detail, icon: text.icon,
          cardClass: step.type === 'wait' ? 'quote' : (step.type === 'action' ? 'project' : ''),
          branches: condition,
          link: condition ? 'YES and NO continue through their own editable paths' : (step.type === 'action' ? 'This is a CRM result' : 'The next step runs after the wait'),
          narration: condition
            ? 'The Rule is checked against current CRM data. Both YES and NO can continue to more Actions, Waits or Rules.'
            : (step.type === 'action' ? prefix + text.title + ' runs after the earlier checks pass. ' + text.detail + '.' : prefix + text.title + ' before this branch continues.')
        };
        if (step.type === 'action') item.impact = scratchStepImpact(step, config);
        if (condition) {
          item.branchMap = {
            yesTitle: firstBranchTitle(step.yesSteps),
            yesDetail: step.yesSteps.length ? 'Continue through the Yes branch' : 'No steps · End safely',
            noTitle: firstBranchTitle(step.noSteps),
            noDetail: step.noSteps.length ? 'Continue through the No branch' : 'No steps · End safely'
          };
        }
        model.push(item);
        if (condition) {
          appendSequence(step.yesSteps, 'YES');
          appendSequence(step.noSteps, 'NO');
        }
      });
    }

    appendSequence(config.steps, '');
    return model;
  }

  function standardJourneyModel(config) {
    const runSteps = selectedWorkflowRunSteps(config);
    const previewOwner = isNewLeadWorkflow(config) && config.assignmentOwner === 'Round-robin sales team'
      ? roundRobinPreviewOwner()
      : (config.assignmentOwner || 'Lead owner');
    return runSteps.map(function (step, index) {
      const modelStep = {
        type: index === 0 ? 'Trigger' : (index === 1 ? ((isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? 'Due date' : 'System step') : (index === 2 ? 'Rule' : 'Action')),
        stage: index === 2 ? 'Yes / No' : config.objectType,
        title: step.title, detail: step.detail, icon: step.icon,
        cardClass: index === 1 ? 'quote' : (index === 3 ? 'project' : ''),
        branches: index === 2,
        link: index === 2 ? 'YES continues · NO ends safely' : (index === 3 ? 'This is the CRM result' : 'Part of the selected automation'),
        narration: index === 2 ? 'YES continues to the action. NO ends safely without changing the CRM record.' : step.detail
      };
      if (index === 2) {
        modelStep.branchMap = {
          yesTitle: runSteps[3] ? runSteps[3].title : 'Continue to next step',
          yesDetail: 'Continue to step 4',
          noTitle: 'End workflow',
          noDetail: isNewLeadWorkflow(config) ? 'No duplicate Lead activity is created' : 'No CRM action is created'
        };
      }
      if (isNewLeadWorkflow(config) && index === 0) {
        modelStep.record = {
          label: 'Lead · L-1008', status: 'New', title: 'ABR Residential Lead',
          lines: ['Tony Baker · ABR Developments', '£20,000']
        };
        modelStep.triggerLogic = {
          whenTitle: step.title,
          whenDetail: step.detail,
          thenTitle: 'Start this automation once for this Lead'
        };
        modelStep.link = 'Trigger · ' + step.title;
      }
      if (isNewLeadWorkflow(config) && index === 1) {
        modelStep.impact = {
          beforeTitle: 'Lead owner · Unassigned',
          beforeCopy: 'The new Lead is waiting for ownership',
          afterTitle: 'Lead owner · ' + previewOwner,
          afterCopy: config.assignmentOwner === 'Round-robin sales team'
            ? 'Selected as the next salesperson by Round-robin'
            : 'Selected by this workflow',
          off: false
        };
        modelStep.assignmentLogic = {
          method: config.assignmentOwner,
          queue: config.assignmentOwner === 'Round-robin sales team' ? roundRobinSequenceLabel() : config.assignmentOwner,
          selected: previewOwner,
          note: config.assignmentOwner === 'Round-robin sales team'
            ? 'This preview uses the next person in the queue. Refresh restarts the prototype queue.'
            : 'This workflow always uses the selected owner.'
        };
        modelStep.link = previewOwner + ' becomes the Lead owner';
      }
      if (isNewLeadWorkflow(config) && index === 3) {
        modelStep.title = 'WeQuote Automation creates Lead activity';
        modelStep.detail = leadActivityTypeLabel(config.activityType) + ' · Assigned to ' + previewOwner + ' · Due today at ' + automationTimeLabel(config.actionTime);
        modelStep.link = 'Created by WeQuote Automation · Assigned to ' + previewOwner;
        modelStep.narration = 'WeQuote Automation creates the ' + leadActivityTypeLabel(config.activityType) + ' activity. ' + previewOwner + ' is the assignee responsible for completing it; they are not the creator.';
        modelStep.impact = {
          beforeTitle: 'No first-contact activity',
          beforeCopy: 'The condition found no existing open activity',
          afterTitle: leadActivityTypeLabel(config.activityType) + ' activity created by Automation',
          afterCopy: 'Assigned to ' + previewOwner + ' · Due today at ' + automationTimeLabel(config.actionTime),
          off: false
        };
      }
      return modelStep;
    });
  }

  function journeyContextConfig() {
    const active = activeConfig();
    if (active) {
      if (active.testInProgress && active.testDraftSnapshot) {
        const snapshot = cloneAutomationConfig(active.testDraftSnapshot);
        snapshot.editingVersion = active.editingVersion;
        snapshot.publishedSnapshot = cloneAutomationConfig(active.publishedSnapshot);
        snapshot.lastSavedChanges = cloneAutomationConfig(active.lastSavedChanges || []);
        snapshot.lastPublishedAt = active.lastPublishedAt;
        return snapshot;
      }
      return active;
    }
    const template = JSON.parse(JSON.stringify(templateDefinitions['client-proposal-approval']));
    const pipeline = typeof getActivePipeline === 'function' ? getActivePipeline() : automationPipelines()[0];
    template.triggerPipelineId = pipeline ? pipeline.id : 'sales-pipeline';
    template.stageMap = proposalStageMapForPipeline(pipeline);
    return template;
  }

  function updateSelectedPreviewButton(config) {
    const pipelinePreview = isProposalApproval(config);
    selectedPlayButton.innerHTML = '<i class="fai">&#xf06e;</i> ' + (pipelinePreview ? 'Pipeline Journey Preview' : 'Automation Preview');
    selectedPlayButton.title = pipelinePreview
      ? 'Preview this automation across the selected Pipeline stages'
      : 'Preview the currently selected automation in a popup';
  }

  function setJourneyView(view) {
    const showImpact = view === 'impact';

    journeyPanel.classList.toggle('impact-view', showImpact);
    journeyPanel.classList.toggle('timeline-view', !showImpact);
    journeyPanel.classList.remove('combined-view');

    if (journeyTimelinePanel) journeyTimelinePanel.hidden = showImpact;
    if (journeyImpactPanel) journeyImpactPanel.hidden = !showImpact;

    if (journeyViewTimeline) {
      journeyViewTimeline.classList.toggle('active', !showImpact);
      journeyViewTimeline.setAttribute('aria-selected', String(!showImpact));
      journeyViewTimeline.tabIndex = showImpact ? -1 : 0;
    }
    if (journeyViewImpact) {
      journeyViewImpact.classList.toggle('active', showImpact);
      journeyViewImpact.setAttribute('aria-selected', String(showImpact));
      journeyViewImpact.tabIndex = showImpact ? 0 : -1;
    }
  }

  function journeyImpactStage(config) {
    return workflowStageName(config) || config.triggerStage || (isLeadWorkflow(config) ? 'Lead' : 'Qualified');
  }

  function journeyImpactStageStrip(config, activeStage) {
    const pipeline = automationPipelineForConfig(config);
    let stages = automationPipelineStages(pipeline).filter(Boolean);
    if (isLeadWorkflow(config)) stages = [{ name: 'Lead', lead: true }].concat(stages);
    return stages.map(function (stage, index) {
      const classes = [];
      if (stage.name === activeStage) classes.push('current');
      if (!stage.protected && !stage.outcome && !stage.lead) classes.push('custom');
      if (stage.outcome) classes.push('outcome');
      return '<span class="' + classes.join(' ') + '">' + escapeAutomationHtml(stage.name) + '</span>' + (index < stages.length - 1 ? '<i>→</i>' : '');
    }).join('');
  }

  function journeyModelForVersion(config) {
    if (!config) return [];
    return isProposalApproval(config)
      ? proposalJourneyModel(config)
      : (hasEditableStepModel(config) ? customJourneyModel(config) : standardJourneyModel(config));
  }

  function journeyVersionFlowMarkup(config) {
    if (!config) {
      return '<span class="aut-impact-empty-flow"><b>NO LIVE AUTOMATION</b><strong>Matching work remains manual</strong></span>';
    }
    return journeyPlainSummaryMarkup(config, journeyModelForVersion(config));
  }

  function renderJourneyImpact(config, model) {
    const beforeState = impactBeforeTitle.closest('.aut-impact-state');
    const impactArrow = journeyImpactPanel.querySelector('.aut-impact-arrow');
    const impactLock = journeyImpactPanel.querySelector('.aut-impact-lock');
    let noChanges = journeyImpactPanel.querySelector('.aut-impact-no-changes');
    const previousChangeList = journeyImpactPanel.querySelector('.aut-impact-change-list');
    if (previousChangeList) previousChangeList.remove();
    const hasDraftChanges = automationHasDraftChanges(config);
    if (!hasDraftChanges) {
      if (beforeState) beforeState.hidden = true;
      if (impactArrow) impactArrow.hidden = true;
      if (impactAfter) impactAfter.hidden = true;
      if (impactLock) impactLock.hidden = true;
      if (impactPipelineContext) impactPipelineContext.hidden = true;
      if (!noChanges) {
        noChanges = document.createElement('div');
        noChanges.className = 'aut-impact-no-changes';
        noChanges.innerHTML = '<i class="fai">&#xf058;</i><strong>No unpublished changes</strong><span>The current published Automation and the Draft are the same. Use Timeline to safely preview how the published flow runs.</span><button class="aut-btn small" type="button" data-aut-open-timeline>Open Timeline</button>';
        journeyImpactPanel.appendChild(noChanges);
      }
      noChanges.hidden = false;
      impactTitle.textContent = config.title;
      return;
    }
    if (beforeState) beforeState.hidden = false;
    if (impactArrow) impactArrow.hidden = false;
    if (impactAfter) impactAfter.hidden = false;
    if (impactLock) impactLock.hidden = false;
    if (impactPipelineContext) impactPipelineContext.hidden = false;
    if (noChanges) noChanges.hidden = true;
    const beforeBadge = beforeState && beforeState.querySelector('header b');
    const beforeHeading = beforeState && beforeState.querySelector('header strong');
    const afterBadge = impactAfter && impactAfter.querySelector('header b');
    const afterHeading = impactAfter && impactAfter.querySelector('header strong');
    if (beforeBadge) beforeBadge.textContent = 'CURRENT';
    if (beforeHeading) beforeHeading.textContent = 'Published version';
    if (afterBadge) afterBadge.textContent = 'AFTER';
    if (afterHeading) afterHeading.textContent = 'Draft version';
    const activeStage = journeyImpactStage(config);
    impactTitle.textContent = config.title;
    if (impactPipelineStages) impactPipelineStages.innerHTML = journeyImpactStageStrip(config, activeStage);
    const publishedConfig = config.publishedSnapshot ? cloneAutomationConfig(config.publishedSnapshot) : null;
    impactBeforeStages.innerHTML = journeyVersionFlowMarkup(publishedConfig);
    impactAfterStages.innerHTML = journeyVersionFlowMarkup(config);
    impactBeforeTitle.textContent = publishedConfig ? 'Published Automation stays live' : 'No live Automation yet';
    impactBeforeCopy.textContent = publishedConfig
      ? 'New matching events continue using this version until you publish the Draft.'
      : 'Matching work at ' + activeStage + ' remains manual until this Draft is published.';
    impactAfterTitle.textContent = 'Saved Draft being tested';
    impactAfterCopy.textContent = model.length + ' saved workflow step' + (model.length === 1 ? '' : 's') + ' · ' + automationCompanyScopeLabel(config) + ' · no live CRM data is changed.';
    impactAfter.classList.remove('off');
    const changes = Array.isArray(config.lastSavedChanges) && config.lastSavedChanges.length
      ? config.lastSavedChanges
      : ['New Draft Automation is ready for review'];
    impactAfterCopy.insertAdjacentHTML('afterend', '<div class="aut-impact-change-list"><strong>Changes in this Draft</strong><ul>' + changes.map(function (change) {
      return '<li>' + escapeAutomationHtml(change) + '</li>';
    }).join('') + '</ul></div>');
  }

  function journeyPlainActionObject(config) {
    const objectsByTemplate = {
      'qualified-owner-first-action': 'Deal ownership and first action',
      'qualified-inactivity': 'Qualified follow-up Note',
      'pre-quote-readiness': config.completionMode === 'required' ? 'Required site-readiness Note' : 'Optional site-readiness Note',
      'quote-build-check': 'Missing-information Note',
      'internal-quote-review': 'Technical review Note',
      'ready-to-send-check': 'Ready-to-send Note',
      'quote-expiry-reminder': 'Quote expiry Note',
      'lost-deal-follow-up': 'Loss-reason follow-up Note',
      'inactive-lead': 'Inactive Lead reminder',
      'quote-follow-up': 'Sent Quote follow-up Note',
      'won-deal-handoff': 'Won Deal handoff Note',
      'quote-invoice': 'Draft Invoice review',
      'client-proposal-approval': 'Client Proposal workflow'
    };
    if (config.templateKey && objectsByTemplate[config.templateKey]) return objectsByTemplate[config.templateKey];
    const action = String(config.actionName || 'next action')
      .replace(/^Create\s+/i, '')
      .replace(/^Assign\s+/i, '')
      .replace(/^Notify\s+/i, '')
      .trim();
    return action || 'next action';
  }

  function journeyPlainSummaryMarkup(config, model) {
    const first = model[0] || {};
    const trigger = config.triggerEvent || first.title || first.detail || 'A matching CRM event occurs';
    if (isNewLeadWorkflow(config)) {
      const previewOwner = config.assignmentOwner === 'Round-robin sales team' ? roundRobinPreviewOwner() : (config.assignmentOwner || 'Lead owner');
      const assignmentSource = config.assignmentOwner === 'Round-robin sales team' ? 'Round-robin' : 'WeQuote Automation';
      const activity = leadActivityTypeLabel(config.activityType) + ' activity';
      return '<span class="aut-journey-plain-step"><b>WHEN</b><strong>' + escapeAutomationHtml(trigger) + '</strong></span>' +
        '<i>→</i><span class="aut-journey-plain-step"><b>' + escapeAutomationHtml(assignmentSource) + '</b><strong>assigns the Lead to ' + escapeAutomationHtml(previewOwner) + '</strong></span>' +
        '<i>→</i><span class="aut-journey-plain-step"><b>AUTOMATION</b><strong>assigns ' + escapeAutomationHtml(activity) + ' to ' + escapeAutomationHtml(previewOwner) + '</strong></span>';
    }
    if (hasEditableStepModel(config)) {
      const firstAction = model.find(function (step) { return /DO THIS/i.test(String(step.type || '')); });
      const firstRule = model.find(function (step) { return /CHECK/i.test(String(step.type || '')); });
      return '<span class="aut-journey-plain-step"><b>WHEN</b><strong>' + escapeAutomationHtml(trigger) + '</strong></span>' +
        (firstRule ? '<i>→</i><span class="aut-journey-plain-step"><b>RULE</b><strong>' + escapeAutomationHtml(String(firstRule.title || '').replace(/^Check:\s*/i, '')) + '</strong></span>' : '') +
        '<i>→</i><span class="aut-journey-plain-step"><b>AUTOMATION</b><strong>' + escapeAutomationHtml(firstAction ? firstAction.title : 'continues through the configured actions') + '</strong></span>';
    }
    const owner = config.actionOwner || (config.objectType ? config.objectType + ' owner' : 'record owner');
    return '<span class="aut-journey-plain-step"><b>WHEN</b><strong>' + escapeAutomationHtml(trigger) + '</strong></span>' +
      '<i>→</i><span class="aut-journey-plain-step"><b>AUTOMATION</b><strong>assigns ' + escapeAutomationHtml(journeyPlainActionObject(config)) + ' to ' + escapeAutomationHtml(owner) + '</strong></span>';
  }

  function journeyCardImpactMarkup(step) {
    if (!step.impact) return '';
    return '<div class="aut-card-impact">' +
      '<div class="aut-card-impact-state"><b>Before</b><strong>' + escapeAutomationHtml(step.impact.beforeTitle) + '</strong><span>' + escapeAutomationHtml(step.impact.beforeCopy) + '</span></div>' +
      '<div class="aut-card-impact-arrow">↓ AUTOMATION</div>' +
      '<div class="aut-card-impact-state after' + (step.impact.off ? ' off' : '') + '"><b>After</b><strong>' + escapeAutomationHtml(step.impact.afterTitle) + '</strong><span>' + escapeAutomationHtml(step.impact.afterCopy) + '</span></div>' +
    '</div>';
  }

  function journeyTriggerLogicMarkup(step) {
    if (!step.triggerLogic) return '';
    return '<div class="aut-journey-trigger-logic">' +
      '<small>TRIGGER RULE</small>' +
      '<strong><b>WHEN</b> ' + escapeAutomationHtml(step.triggerLogic.whenTitle) + '</strong>' +
      '<span>' + escapeAutomationHtml(step.triggerLogic.whenDetail) + '</span>' +
      '<i class="fai">&#xf063;</i>' +
      '<strong><b>THEN</b> ' + escapeAutomationHtml(step.triggerLogic.thenTitle) + '</strong>' +
    '</div>';
  }

  function journeyAssignmentLogicMarkup(step) {
    if (!step.assignmentLogic) return '';
    return '<div class="aut-journey-assignment-logic">' +
      '<small>OWNER ASSIGNMENT</small>' +
      '<strong>' + escapeAutomationHtml(step.assignmentLogic.method) + '</strong>' +
      '<span class="aut-journey-assignment-queue">Queue: ' + escapeAutomationHtml(step.assignmentLogic.queue) + '</span>' +
      '<span class="aut-journey-assignment-result"><b>This preview:</b> ' + escapeAutomationHtml(step.assignmentLogic.selected) + ' becomes Lead owner</span>' +
      '<i>' + escapeAutomationHtml(step.assignmentLogic.note) + '</i>' +
    '</div>';
  }

  function journeyBranchMapMarkup(step) {
    if (!step.branchMap) return '';
    return '<div class="aut-journey-branch-map" aria-label="Yes and No branch outcomes">' +
      '<div class="aut-journey-branch-path yes"><span>YES</span><strong>' + escapeAutomationHtml(step.branchMap.yesTitle) + '</strong><small>' + escapeAutomationHtml(step.branchMap.yesDetail) + '</small></div>' +
      '<div class="aut-journey-branch-path no"><span>NO</span><strong>' + escapeAutomationHtml(step.branchMap.noTitle) + '</strong><small>' + escapeAutomationHtml(step.branchMap.noDetail) + '</small></div>' +
    '</div>';
  }

  function renderJourneyAutomationState() {
    const config = journeyContextConfig();
    const proposal = isProposalApproval(config);
    currentJourneyModel = journeyModelForVersion(config);
    renderJourneyImpact(config, currentJourneyModel);

    const pipeline = proposal ? automationPipelineForConfig(config) : null;
    journeyPanel.setAttribute('aria-label', 'Test automation simulator');
    const journeyDialog = journeyPanel.closest('.aut-journey-dialog');
    if (journeyDialog) journeyDialog.setAttribute('aria-label', 'Test Automation Simulator');
    journeyEyebrow.textContent = 'Test simulator · Preview only';
    journeyTitle.textContent = proposal ? 'ABR Residential AV Upgrade' : config.title;
    journeyCopy.textContent = proposal
      ? 'This simulator moves the Deal through the existing and template-created stages in ' + (pipeline ? pipeline.name : 'this Pipeline') + '. No CRM data is changed.'
      : (isNewLeadWorkflow(config)
        ? 'This simulator shows Round-robin choosing the next Sales owner, then creating the first-contact activity for that same person. No CRM data is changed.'
        : 'This simulator follows every saved step without changing CRM data.');
    journeyAutomationSummary.classList.add('plain-language');
    journeyAutomationSummary.innerHTML = journeyPlainSummaryMarkup(config, currentJourneyModel);

    const journeyColumnWidth = proposal ? 190 : 230;
    journeyBoard.style.gridTemplateColumns = 'repeat(' + currentJourneyModel.length + ', minmax(' + journeyColumnWidth + 'px, 1fr))';
    journeyBoard.style.minWidth = Math.max(760, currentJourneyModel.length * (journeyColumnWidth + 8)) + 'px';
    journeyBoard.innerHTML = currentJourneyModel.map(function (step, index) {
      const stepOn = true;
      const record = step.record || null;
      const topLabel = record ? record.label : (proposal ? 'Deal · D-0348' : 'Selected workflow');
      const topStatus = record ? record.status : step.stage;
      const cardTitle = record ? record.title : step.title;
      const cardDetail = record ? record.lines.map(escapeAutomationHtml).join('<br>') : escapeAutomationHtml(step.detail);
      return '<section class="aut-journey-column' + (step.pathAlternative ? ' alternative' : '') + (step.branchMap ? ' has-branches' : '') + '" data-journey-column="' + index + '">' +
        '<div class="aut-journey-column-head"><span>' + (index + 1) + ' · ' + escapeAutomationHtml(step.type) + '</span><i class="fai">' + step.icon + '</i></div>' +
        '<article class="aut-journey-card ' + (step.cardClass || '') + (step.impact ? ' has-impact' : '') + (!stepOn ? ' automation-off' : '') + '" data-journey-card="' + index + '">' +
          '<div class="aut-journey-card-top"><span>' + escapeAutomationHtml(topLabel) + '</span><b>' + escapeAutomationHtml(topStatus) + '</b></div>' +
          '<h3>' + escapeAutomationHtml(cardTitle) + '</h3><p>' + cardDetail + '</p>' + journeyTriggerLogicMarkup(step) + journeyAssignmentLogicMarkup(step) + journeyCardImpactMarkup(step) +
          (step.branchMap ? journeyBranchMapMarkup(step) : (step.branches ? '<div class="aut-journey-branches"><span>YES · Continue</span><span>NO · End</span></div>' : '')) +
          '<span class="aut-journey-link">' + escapeAutomationHtml(step.link) + '</span>' +
          (step.alwaysOn ? '<span class="aut-journey-automation-badge on">Outcome rule · ON</span>' : '') +
        '</article></section>';
    }).join('');
  }

  function journeyNarrationFor(index) {
    const step = currentJourneyModel[index];
    return step ? '<strong>' + escapeAutomationHtml(step.title) + '</strong> · ' + escapeAutomationHtml(step.narration || step.detail) : '';
  }

  function clearJourneyTimer() {
    window.clearTimeout(journeyTimer);
    journeyTimer = null;
  }

  function journeySpeedDelay() {
    const speed = Number(journeySpeed.value) || 1;
    if (speed >= 20) return 260;
    if (speed >= 5) return 600;
    return 1550;
  }

  function formatJourneyClock(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return day + ' ' + month + ' ' + date.getFullYear() + ' · ' + hour + ':' + minute;
  }

  function journeyElapsedLabel() {
    const elapsedMinutes = Math.max(0, Math.round((journeyNow.getTime() - journeyStartTime.getTime()) / 60000));
    if (!elapsedMinutes) return 'Ready';
    const days = Math.floor(elapsedMinutes / 1440);
    const hours = Math.floor((elapsedMinutes % 1440) / 60);
    const minutes = elapsedMinutes % 60;
    const parts = [];
    if (days) parts.push(days + (days === 1 ? ' day' : ' days'));
    if (hours) parts.push(hours + (hours === 1 ? ' hr' : ' hrs'));
    if (minutes && !days) parts.push(minutes + ' min');
    return 'Simulated +' + parts.join(' ');
  }

  function journeyWaitDuration(step) {
    if (!step) return null;
    const text = ((step.title || '') + ' ' + (step.detail || '')).toLowerCase();
    if (!/\bwait\b|up to/.test(text)) return null;
    const match = text.match(/(?:wait\s+|up to\s+)(\d+)\s*(minute|hour|day)s?/i);
    if (!match) return null;
    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multiplier = unit === 'day' ? 86400000 : (unit === 'hour' ? 3600000 : 60000);
    return {
      milliseconds: amount * multiplier,
      label: amount + ' ' + unit + (amount === 1 ? '' : 's')
    };
  }

  function resetJourneySimulation() {
    journeyNow = new Date(journeyStartTime.getTime());
    journeyEventLog = [];
    journeyPendingWait = null;
  }

  function addJourneyEvent(step, kind, title, detail) {
    journeyEventLog.push({
      time: new Date(journeyNow.getTime()),
      kind: kind || 'step',
      title: title || step.title,
      detail: detail || step.detail || ''
    });
  }

  function completeJourneyWait() {
    if (!journeyPendingWait) return false;
    journeyNow = new Date(journeyNow.getTime() + journeyPendingWait.milliseconds);
    addJourneyEvent(null, 'complete', 'Wait complete', journeyPendingWait.label + ' passed in simulated time');
    journeyPendingWait = null;
    return true;
  }

  function renderJourneySimulation() {
    journeyClock.textContent = formatJourneyClock(journeyNow);
    journeyElapsed.textContent = journeyElapsedLabel();
    journeySkipWait.hidden = !journeyPendingWait;
    if (journeyPendingWait) journeySkipWait.textContent = 'Skip ' + journeyPendingWait.label;
    if (!journeyEventLog.length) {
      journeyEvents.innerHTML = '<span class="aut-journey-event empty"><b>Press Play or Step to begin</b><small>The simulated clock starts at 09:00</small></span>';
      return;
    }
    journeyEvents.innerHTML = journeyEventLog.map(function (event) {
      const time = String(event.time.getHours()).padStart(2, '0') + ':' + String(event.time.getMinutes()).padStart(2, '0');
      return '<span class="aut-journey-event ' + escapeAutomationHtml(event.kind) + '">' +
        '<time>' + time + '</time><i></i><b>' + escapeAutomationHtml(event.title) + '</b>' +
        '<small>' + escapeAutomationHtml(event.detail) + '</small></span>';
    }).join('');
    journeyEvents.scrollLeft = journeyEvents.scrollWidth;
  }

  function scheduleJourneyTimer() {
    clearJourneyTimer();
    if (!journeyRunning) return;
    journeyTimer = window.setTimeout(function () {
      advanceJourney();
      scheduleJourneyTimer();
    }, journeySpeedDelay());
  }

  function updateJourneyButtons() {
    const total = journeyPlayableModel().length || 1;
    const complete = journeyStepIndex >= total - 1 && !journeyPendingWait;
    const icon = journeyRunning ? '&#xf04c;' : '&#xf04b;';
    const label = journeyRunning ? 'Pause' : (complete ? 'Replay' : (journeyStepIndex >= 0 ? 'Resume' : 'Play'));
    journeyToggle.innerHTML = '<i class="fai">' + icon + '</i> ' + label;
    journeyStepForward.disabled = journeyRunning;
  }

  function renderJourney() {
    renderJourneyAutomationState();
    const proposal = isProposalApproval(journeyContextConfig());
    const playable = journeyPlayableModel();
    const total = playable.length;
    const currentStep = journeyStepIndex >= 0 ? playable[journeyStepIndex] : null;
    const currentModelIndex = currentStep ? currentJourneyModel.indexOf(currentStep) : -1;
    document.querySelectorAll('#autJourney [data-journey-column]').forEach(function (column) {
      const index = Number(column.dataset.journeyColumn);
      const playableIndex = playable.indexOf(currentJourneyModel[index]);
      column.classList.toggle('current', index === currentModelIndex);
      column.classList.toggle('complete', playableIndex >= 0 && playableIndex < journeyStepIndex);
    });
    document.querySelectorAll('#autJourney [data-journey-card]').forEach(function (card) {
      const index = Number(card.dataset.journeyCard);
      const playableIndex = playable.indexOf(currentJourneyModel[index]);
      card.classList.add('visible');
      card.classList.toggle('current', index === currentModelIndex);
    });
    journeyProgress.style.width = journeyStepIndex < 0 ? '0%' : ((journeyStepIndex + 1) / total * 100) + '%';
    if (journeyStepIndex < 0) {
      const journeyConfig = journeyContextConfig();
      const stageCount = isProposalApproval(journeyConfig) ? currentJourneyModel.length : total;
      journeyStepLabel.textContent = isProposalApproval(journeyConfig)
        ? 'Ready · ' + stageCount + ' Pipeline stages'
        : 'Ready · ' + total + ' workflow steps';
      journeyNarration.innerHTML = isProposalApproval(journeyContextConfig())
        ? 'Press Play to simulate the approved path through this Pipeline. The Lost stage remains visible as the alternative outcome.'
        : 'Press Play to simulate <strong>' + escapeAutomationHtml(journeyContextConfig().title) + '</strong>, including its Yes and No condition behaviour.';
    } else if (journeyStepIndex === total - 1 && !journeyRunning && !journeyPendingWait) {
      journeyStepLabel.textContent = 'Complete · ' + total + ' of ' + total + ' steps previewed';
      journeyNarration.innerHTML = journeyNarrationFor(currentModelIndex);
    } else {
      journeyStepLabel.textContent = 'Step ' + (journeyStepIndex + 1) + ' of ' + total + ' · ' + currentStep.title;
      journeyNarration.innerHTML = journeyNarrationFor(currentModelIndex);
    }
    if (journeyStepIndex >= 0) {
      const currentColumn = document.querySelector('#autJourney [data-journey-column="' + currentModelIndex + '"]');
      if (currentColumn) journeyScroll.scrollTo({ left: Math.max(0, currentColumn.offsetLeft - 12), behavior: 'smooth' });
    } else {
      journeyScroll.scrollLeft = 0;
    }
    renderJourneySimulation();
    updateJourneyButtons();
    if (journeyStepIndex === total - 1 && !journeyRunning && !journeyPendingWait) markAutomationTestPassed();
  }

  function pauseJourney() {
    journeyRunning = false;
    clearJourneyTimer();
    renderJourney();
  }

  function advanceJourney() {
    const playable = journeyPlayableModel();
    if (journeyPendingWait) {
      completeJourneyWait();
      if (journeyStepIndex >= playable.length - 1) journeyRunning = false;
      renderJourney();
      return;
    }
    if (journeyStepIndex >= playable.length - 1) {
      journeyRunning = false;
      clearJourneyTimer();
      renderJourney();
      return;
    }
    journeyStepIndex += 1;
    journeyNow = new Date(journeyNow.getTime() + 60000);
    const step = playable[journeyStepIndex];
    addJourneyEvent(step, step.type === 'TRIGGER' ? 'trigger' : 'step');
    const wait = journeyWaitDuration(step);
    if (wait) {
      journeyPendingWait = wait;
      addJourneyEvent(step, 'wait', 'Waiting begins', wait.label + ' before the next step');
    }
    if (journeyStepIndex >= playable.length - 1 && !journeyPendingWait) journeyRunning = false;
    renderJourney();
    if (!journeyRunning) {
      clearJourneyTimer();
    }
  }

  function playJourney() {
    stopSelectedRun(false);
    journeyOverlay.hidden = false;
    journeyPanel.hidden = false;
    if (journeyRunning) {
      pauseJourney();
      return;
    }
    renderJourneyAutomationState();
    if (journeyStepIndex >= journeyPlayableModel().length - 1 && !journeyPendingWait) {
      journeyStepIndex = -1;
      resetJourneySimulation();
    }
    journeyRunning = true;
    renderJourney();
    advanceJourney();
    scheduleJourneyTimer();
  }

  function stepJourney() {
    stopSelectedRun(false);
    journeyOverlay.hidden = false;
    journeyPanel.hidden = false;
    journeyRunning = false;
    clearJourneyTimer();
    renderJourneyAutomationState();
    if (journeyStepIndex >= journeyPlayableModel().length - 1 && !journeyPendingWait) {
      journeyStepIndex = -1;
      resetJourneySimulation();
    }
    advanceJourney();
  }

  function skipJourneyWait() {
    if (!completeJourneyWait()) return;
    if (journeyStepIndex >= journeyPlayableModel().length - 1) journeyRunning = false;
    renderJourney();
    if (journeyRunning) scheduleJourneyTimer();
  }

  function openPipelineJourneyPreview() {
    stopSelectedRun(false);
    journeyOverlay.hidden = false;
    journeyPanel.hidden = false;
    setJourneyView('timeline');
    resetJourney();
    journeyClose.focus();
  }

  function closePipelineJourneyPreview() {
    pauseJourney();
    journeyOverlay.hidden = true;
    const config = activeConfig();
    if (config && config.testInProgress) {
      config.testInProgress = false;
      if (automationHasDraftChanges(config)) config.needsTesting = true;
      persistAutomationState();
      syncAutomationDraftUi();
      showAutomationToast('Test not completed. You can resume the test or publish the saved Draft unless WeQuote detects a conflict.');
    }
    const testButton = document.getElementById('autTestWorkflow');
    if (testButton) testButton.focus();
  }

  function resetJourney() {
    clearJourneyTimer();
    journeyRunning = false;
    journeyStepIndex = -1;
    resetJourneySimulation();
    renderJourney();
  }

  function activeConfig() {
    return workflows[activeWorkflowKey];
  }

  const conceptAutomationDefinitions = {
    proposal: {
      title: 'Client Proposal & Approval', status: 'Needs setup', start: 'Qualified', end: 'Technical Review is passed',
      outcome: 'Move safely from site readiness into Quote build, SOW and Technical Review at the correct lifecycle stages.',
      steps: [
        ['trigger', 'TRIGGER', 'Deal enters Qualified', 'Sales Pipeline'],
        ['condition', 'RULE', 'Site Visit required?', 'Rule criteria can use AND / OR'],
        ['branches', 'BRANCH', 'YES · Complete Site Visit', 'NO · Continue'],
        ['action', 'ACTION', 'Create Quote', 'Empty · In Progress · Not sent'],
        ['action', 'ACTION', 'Develop SOW', 'Runs while Quote is In Progress'],
        ['action final', 'REVIEW', 'Technical Review', 'Runs when Quote is In Review']
      ],
      note: 'Qualified only checks site readiness. SOW belongs to In Progress; Technical Review belongs to In Review. The protected Quote event, not the Automation, changes the Deal Stage.'
    },
    'first-action': {
      title: 'Qualified first Next Action', status: 'Active', start: 'Qualified', end: 'One Next Action is ready',
      outcome: 'Give every newly Qualified opportunity one clear next task, assignee and due date.',
      steps: [
        ['trigger', 'TRIGGER', 'Deal enters Qualified', 'Sales Pipeline'],
        ['condition', 'RULE', 'No open Deal Next Action?', 'Checks the one visible Deal Focus task'],
        ['branches', 'BRANCH', 'YES · Set Next Action', 'NO · Keep existing and end'],
        ['action final', 'ACTION', 'Set Deal Next Action', 'Deal owner · due in 1 working day']
      ],
      note: 'Deal Owner can be changed with a separate Action. This template does not overwrite an existing salesperson task.'
    },
    inactivity: {
      title: 'Qualified inactivity reminder', status: 'Active', start: 'Qualified', end: 'Follow-up Note created or branch ends',
      outcome: 'Prevent Qualified opportunities from going quiet.',
      steps: [
        ['trigger', 'TRIGGER', 'Deal remains in Qualified', 'No activity for 7 working days'],
        ['wait', 'WAIT', '7 working days', 'Calendar-aware delay'],
        ['condition', 'RULE', 'Still inactive?', 'Stage = Qualified AND no recent activity'],
        ['branches', 'BRANCH', 'YES · Create follow-up Note', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention Deal owner', 'Follow up next working day']
      ],
      note: 'A Wait is flow control, not a while-loop. Re-enrolment rules decide whether the Automation can run again.'
    },
    'high-value': {
      title: 'High-value approval', status: 'Needs setup', start: 'Passed Review', end: 'Additional approval recorded',
      outcome: 'Add final commercial governance when a reviewed Quote carries higher risk.',
      steps: [
        ['trigger', 'TRIGGER', 'Quote reaches Passed Review', 'Sales Pipeline'],
        ['condition', 'RULE', 'Value > £25,000 OR discount > 15%?', 'Two criteria joined by OR'],
        ['branches', 'BRANCH', 'YES · Request approval', 'NO · Continue normally'],
        ['action final', 'ACTION', 'Create Note + mention one approver', 'Follow up today']
      ],
      note: 'This is a Passed Review Automation. It checks commercial risk without owning the protected Quote transition.'
    },
    'sent-follow-up': {
      title: 'Sent Quote follow-up', status: 'Active', start: 'Sent', end: 'Customer follow-up created or branch ends',
      outcome: 'Follow up viable Sent Quotes without creating duplicate work.',
      steps: [
        ['trigger', 'TRIGGER', 'Quote enters Sent', 'First send of each revision'],
        ['wait', 'WAIT', '3 working days', 'Pause before checking'],
        ['condition', 'RULE', 'Still Sent and not Expired?', 'Sent AND expiry date has not passed'],
        ['branches', 'BRANCH', 'YES · Create follow-up', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention Deal owner', 'Follow up today']
      ],
      note: 'Expired is calculated from Sent + expiry date. It is not stored as a separate Pipeline stage.'
    },
    'quote-build': {
      title: 'Quote build & SOW checks', status: 'Active', start: 'In Progress', end: 'Quote and SOW data are complete',
      outcome: 'Keep the editable Quote and Scope of Works complete enough for review or sending.',
      steps: [
        ['trigger', 'TRIGGER', 'Quote is edited in In Progress', 'Sales Pipeline'],
        ['condition', 'RULE', 'Required Quote or SOW data missing?', 'Scope, products, prices and commercial fields'],
        ['branches', 'BRANCH', 'YES · Create follow-up Note', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention Quote owner', 'Follow up today']
      ],
      note: 'In Progress is derived from the Quote lifecycle. This Automation checks data but does not manually change the stage.'
    },
    'internal-review': {
      title: 'Technical & Internal Review', status: 'Active', start: 'In Review', end: 'Technical review Note exists',
      outcome: 'Create a visible CRM Note and mention one reviewer when a Quote needs Technical Review.',
      steps: [
        ['trigger', 'TRIGGER', 'Quote enters In Review', 'Quote-review organisations only'],
        ['condition', 'RULE', 'Technical review Note missing?', 'No open technical review Note exists'],
        ['branches', 'BRANCH', 'YES · Create review Note', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention reviewer', 'Follow up today']
      ],
      note: 'The Note is the CRM work item. Mention identifies one responsible person; the protected Quote Review lifecycle still controls In Review and Passed Review.'
    },
    'ready-send': {
      title: 'Ready-to-send check', status: 'Active', start: 'Passed Review', end: 'Ready-to-send Note exists',
      outcome: 'Tell the Quote owner whether the reviewed Quote is valid and complete without owning the Send transition.',
      steps: [
        ['trigger', 'TRIGGER', 'Quote enters Passed Review', 'Sales Pipeline'],
        ['condition', 'RULE', 'Review passed AND Quote valid?', 'Both criteria must be true'],
        ['branches', 'BRANCH', 'YES · Ready Note', 'NO · Needs-attention Note'],
        ['action final', 'ACTION', 'Create Note + mention Quote owner', 'Quote remains in Passed Review until actually sent']
      ],
      note: 'The system moves the Quote to Sent only after it is actually issued to the customer.'
    },
    'expiry-reminder': {
      title: 'Expiry reminder', status: 'Active', start: 'Sent', end: 'Owner is reminded before expiry',
      outcome: 'Give the Deal owner time to follow up before a viable Sent Quote expires.',
      steps: [
        ['trigger', 'TRIGGER', 'Sent Quote approaches expiry', 'Date-based trigger'],
        ['condition', 'RULE', 'Expiry date is 3 days away?', 'Quote is still Sent and viable'],
        ['branches', 'BRANCH', 'YES · Create follow-up Note', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention Deal owner', 'Follow up today']
      ],
      note: 'Expired is calculated automatically from Sent plus the expiry date; it is not a stored Pipeline stage.'
    },
    'accepted-handoff': {
      title: 'Won Deal handoff', status: 'Active', start: 'Won', end: 'Finance handoff is ready',
      outcome: 'Create the right commercial handoff after any relevant Quote wins the Deal.',
      steps: [
        ['trigger', 'TRIGGER', 'Any relevant Quote becomes Accepted', 'Protected Deal outcome = Won'],
        ['condition', 'RULE', 'Deposit required?', 'Deal or organisation rule'],
        ['branches', 'BRANCH', 'YES · Finance Note', 'NO · Owner Note'],
        ['action final', 'ACTION', 'Create Note + mention one person', 'Finance or Deal owner handles the handoff']
      ],
      note: 'Accepted belongs to the winning Quote. The protected lifecycle derives Deal Stage = Won; this Automation only manages the handoff.'
    },
    'commercial-complete': {
      title: 'Lost Deal follow-up', status: 'Active', start: 'Lost', end: 'Loss reason is recorded',
      outcome: 'Capture why the Deal was lost after no viable related Quote remains.',
      steps: [
        ['trigger', 'TRIGGER', 'Deal becomes Lost', 'No viable related Quote remains'],
        ['condition', 'RULE', 'Loss reason missing?', 'Deal audit field'],
        ['branches', 'BRANCH', 'YES · Ask owner', 'NO · End safely'],
        ['action final', 'ACTION', 'Create Note + mention Deal owner', 'Follow up today']
      ],
      note: 'Lost is a protected Deal outcome. This Automation does not decide the outcome; it records the follow-up around it.'
    }
  };

  const automationGroupDefinitions = {
    standard: {
      name: 'Standard Sales Process', status: 'active', automations: 10, baseAutomations: 10, rules: 18, baseRules: 18, affectedStages: 7,
      description: 'Default journey for regular residential and commercial Deals.',
      policy: 'Normal Quote review with a seven-working-day follow-up rhythm.',
      fit: ['Everyday Deals', 'Normal review', 'Follow up after 7 days'],
      changes: [['High-value gate', 'Not included'], ['Quote approval', 'Normal review'], ['Follow-up timing', '7 working days']],
      salesImpact: [['43', 'Open Deals evaluated'], ['0', 'New senior approvals'], ['9', 'Follow-ups per week'], ['12', 'Existing runs unchanged']],
      states: { 'first-action': 'on', inactivity: 'on', 'high-value': 'draft', 'quote-build': 'on', 'internal-review': 'on', 'ready-send': 'on', 'sent-follow-up': 'on', 'expiry-reminder': 'on', 'accepted-handoff': 'on', 'commercial-complete': 'on' }
    },
    'high-value': {
      name: 'High-value Sales Process', status: 'inactive', automations: 10, baseAutomations: 10, rules: 23, baseRules: 23, affectedStages: 7,
      description: 'Adds value gates, margin checks and senior approval for larger Deals.',
      policy: 'Designed for higher-risk Deals that need faster follow-up and senior oversight.',
      fit: ['£25K+ Deals', '>15% discount approval', 'Follow up after 3 days'],
      changes: [['High-value gate', '£25K or 15% discount'], ['Quote approval', 'Senior reviewer added'], ['Follow-up timing', '3 working days']],
      salesImpact: [['43', 'Open Deals evaluated'], ['6', 'Would need senior approval'], ['12', 'Earlier follow-ups per week'], ['12', 'Existing runs unchanged']],
      states: { 'first-action': 'on', inactivity: 'on', 'high-value': 'on', 'quote-build': 'on', 'internal-review': 'on', 'ready-send': 'on', 'sent-follow-up': 'on', 'expiry-reminder': 'on', 'accepted-handoff': 'on', 'commercial-complete': 'on' }
    },
    simplified: {
      name: 'Simplified Sales Process', status: 'inactive', automations: 10, baseAutomations: 10, rules: 11, baseRules: 11, affectedStages: 7,
      description: 'A lighter journey for fast-turnaround Quotes.',
      policy: 'Skips internal review, but must resolve its setup blockers before activation.',
      fit: ['Fast Quotes', 'No internal review', 'Follow up after 5 days'],
      changes: [['High-value gate', 'Not included'], ['Quote approval', 'Skip internal review'], ['Follow-up timing', '5 working days']],
      salesImpact: [['43', 'Open Deals evaluated'], ['7', 'Would skip internal review'], ['9', 'Follow-ups per week'], ['2', 'Setup blockers']],
      states: { 'first-action': 'on', inactivity: 'off', 'high-value': 'off', 'quote-build': 'on', 'internal-review': 'off', 'ready-send': 'draft', 'sent-follow-up': 'on', 'expiry-reminder': 'on', 'accepted-handoff': 'on', 'commercial-complete': 'on' }
    }
  };
  const AUTOMATION_GROUP_STORAGE_KEY = 'wequote-crm-pipeline-automation-groups-v1';
  let blankAutomationGroupCounter = 0;
  let activeAutomationGroupKey = 'standard';
  let selectedAutomationGroupKey = 'standard';
  let pendingAutomationGroupChange = null;
  let activeGroupFilter = 'all';
  let selectedConceptAutomation = 'first-action';
  let activeAutomationGroupView = 'map';
  let automationGroupEditMode = false;
  let inspectedAutomationGroupKey = 'standard';
  let automationGroupInspectZoom = 60;
  let openDynamicAutomationPreview = null;

  function persistAutomationGroupState() {
    try {
      localStorage.setItem(AUTOMATION_GROUP_STORAGE_KEY, JSON.stringify({
        definitions: automationGroupDefinitions,
        activeKey: activeAutomationGroupKey,
        selectedKey: selectedAutomationGroupKey,
        blankCounter: blankAutomationGroupCounter
      }));
    } catch (_) {}
  }

  function restoreAutomationGroupState() {
    try {
      const stored = JSON.parse(localStorage.getItem(AUTOMATION_GROUP_STORAGE_KEY) || 'null');
      if (!stored || !stored.definitions) return;
      Object.keys(stored.definitions).forEach(function (key) {
        if (automationGroupDefinitions[key]) Object.assign(automationGroupDefinitions[key], stored.definitions[key]);
        else automationGroupDefinitions[key] = stored.definitions[key];
        automationGroupDefinitions[key].key = key;
      });
      blankAutomationGroupCounter = Math.max(Number(stored.blankCounter) || 0, blankAutomationGroupCounter);
      activeAutomationGroupKey = stored.activeKey && automationGroupDefinitions[stored.activeKey] ? stored.activeKey : null;
      selectedAutomationGroupKey = stored.selectedKey && automationGroupDefinitions[stored.selectedKey]
        ? stored.selectedKey
        : (activeAutomationGroupKey || 'standard');
    } catch (_) {}
  }

  function workflowAutomationGroupKey(config) {
    return config && config.automationGroupKey && automationGroupDefinitions[config.automationGroupKey]
      ? config.automationGroupKey
      : (selectedAutomationGroupKey || activeAutomationGroupKey || 'standard');
  }

  function workflowStageName(config) {
    if (!config) return 'Qualified';
    if (config.objectType === 'Lead') return 'Lead';
    if (config.triggerStageId && config.triggerPipelineId) {
      const pipeline = automationPipelineById(config.triggerPipelineId);
      const stages = automationPipelineStages(pipeline);
      const stageById = stages.find(function (stage, index) {
        return automationStageStableId(stage, pipeline, index) === config.triggerStageId;
      });
      if (stageById) {
        if (config.triggerStage !== stageById.name) {
          config.triggerStage = stageById.name;
          if (config.triggerKind === 'trigger-deal-custom-stage' || (templateDefinitions[config.templateKey] && templateDefinitions[config.templateKey].customStageTemplate)) {
            config.triggerEvent = 'Deal enters ' + stageById.name;
            if (config.editableTrigger) {
              config.editableTrigger.title = config.triggerEvent;
              config.editableTrigger.detail = ((pipeline && pipeline.name) || 'Pipeline') + ' · ' + stageById.name;
            }
          }
        }
        return stageById.name;
      }
    }
    if (templateDefinitions[config.templateKey] && templateDefinitions[config.templateKey].customStageTemplate && config.triggerStage) return config.triggerStage;
    const alignedStage = automationStageForTemplateKey(config.templateKey);
    if (alignedStage) return alignedStage;
    if (config.triggerStage) return config.triggerStage;
    return 'Qualified';
  }

  function workflowsForAutomationGroup(key) {
    return userWorkflowKeys().filter(function (workflowKey) {
      const config = workflows[workflowKey];
      return workflowAutomationGroupKey(config) === key;
    });
  }

  function salesAutomationGroupKeys() {
    return Object.keys(automationGroupDefinitions).filter(function (key) {
      const definition = automationGroupDefinitions[key];
      return !definition.pipelineId || definition.pipelineId === 'sales-pipeline';
    });
  }

  function pipelineAutomationGroupKey(pipeline) {
    return 'pipeline-' + String((pipeline && pipeline.id) || 'sales-pipeline').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  function ensurePipelineAutomationGroup(pipeline) {
    if (!pipeline || pipeline.id === 'sales-pipeline') return activeAutomationGroupKey || selectedAutomationGroupKey || 'standard';
    const key = pipelineAutomationGroupKey(pipeline);
    const pipelineWorkflowKeys = userWorkflowKeys().filter(function (workflowKey) {
      return workflows[workflowKey] && workflows[workflowKey].triggerPipelineId === pipeline.id;
    });
    pipelineWorkflowKeys.forEach(function (workflowKey) { workflows[workflowKey].automationGroupKey = key; });
    const counts = pipelineWorkflowKeys.reduce(function (result, workflowKey) {
      const config = workflows[workflowKey];
      result[config.enabled ? 'on' : (workflowNeedsSetup(config) ? 'draft' : 'off')] += 1;
      return result;
    }, { on: 0, off: 0, draft: 0 });
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const definition = automationGroupDefinitions[key] || {
      key: key,
      custom: true,
      states: {},
      changes: [],
      salesImpact: []
    };
    Object.assign(definition, {
      key: key,
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      quoteConnected: quoteConnected,
      custom: true,
      name: pipeline.name + ' Automation',
      status: counts.on ? 'active' : 'inactive',
      empty: pipelineWorkflowKeys.length === 0,
      automations: pipelineWorkflowKeys.length,
      rules: pipelineWorkflowKeys.reduce(function (total, workflowKey) {
        return total + 2 + (Number(workflows[workflowKey].waitDays) > 0 ? 1 : 0);
      }, 0),
      affectedStages: automationPipelineStages(pipeline).length,
      description: quoteConnected
        ? 'Automation setup for ' + pipeline.name + ' with protected Quote lifecycle stages.'
        : 'Automation setup for the Fully Custom ' + pipeline.name + '.',
      policy: quoteConnected
        ? 'Protected Quote lifecycle events continue to control protected Stage movement.'
        : 'Every Stage uses the shared CRM block library and keeps its own Automation settings.',
      fit: [pipeline.name, quoteConnected ? 'Quote lifecycle' : 'Fully Custom', pipelineWorkflowKeys.length + ' Automations'],
      states: definition.states || {},
      changes: definition.changes || [],
      salesImpact: definition.salesImpact || []
    });
    automationGroupDefinitions[key] = definition;
    persistAutomationState();
    persistAutomationGroupState();
    return key;
  }

  function setAutomationPipelineContext(pipeline) {
    if (!pipeline) return;
    selectedTemplatePipelineId = pipeline.id;
    selectedAutomationStage = null;
    automationStageLocked = false;
    selectedAutomationStageContext = {
      pipelineId: pipeline.id,
      pipelineName: pipeline.name,
      pipelineType: automationPipelineUsesQuoteLifecycle(pipeline) ? 'quote-connected' : 'standalone',
      quoteConnected: automationPipelineUsesQuoteLifecycle(pipeline)
    };
  }

  function openAutomationPipelineWorkspace(pipeline) {
    if (!pipeline) return;
    setAutomationPipelineContext(pipeline);
    if (typeof window.showView === 'function') window.showView('automation');
    selectedAutomationGroupKey = pipeline.id === 'sales-pipeline'
      ? (activeAutomationGroupKey || selectedAutomationGroupKey || 'standard')
      : ensurePipelineAutomationGroup(pipeline);
    showAutomationGroupList();
  }

  function openSelectedPipelineAutomationCreator() {
    const pipeline = automationPipelineById(selectedTemplatePipelineId) ||
      (selectedAutomationStageContext && automationPipelineById(selectedAutomationStageContext.pipelineId)) ||
      (typeof getActivePipeline === 'function' ? getActivePipeline() : null) || automationPipelines()[0];
    if (!pipeline) return;
    setAutomationPipelineContext(pipeline);
    if (pipeline.id !== 'sales-pipeline') selectedAutomationGroupKey = ensurePipelineAutomationGroup(pipeline);
    selectedCompanyScopeMode = 'all';
    selectedCompanyScopeIds = [];
    creatorStartMode = automationPipelineUsesQuoteLifecycle(pipeline) ? 'templates' : 'scratch';
    openTemplatePicker(automationPipelineUsesQuoteLifecycle(pipeline) ? 'home' : 'templates');
  }

  const automationGroupStageList = [
    {
      key: 'qualified', number: 'STAGE 1', title: 'Qualified',
      description: 'Deal exists, but no related Quote has started.',
      concepts: ['first-action', 'inactivity'],
      transition: ['MOVES WHEN · QUOTE LIFECYCLE', 'First related Quote is created', 'Quote Status and Deal Stage become In Progress']
    },
    {
      key: 'in-progress', number: 'STAGE 2', title: 'In Progress',
      description: 'A related Quote exists and remains editable.',
      concepts: ['quote-build'],
      transition: ['MOVES WHEN · QUOTE LIFECYCLE · REVIEW ORGS', 'Quote is submitted for internal review', 'Quote Status and Deal Stage become In Review']
    },
    {
      key: 'in-review', number: 'CONDITIONAL', title: 'In Review', conditional: true,
      description: 'Only used when the organisation uses Quote Review.',
      concepts: ['internal-review'],
      transition: ['MOVES WHEN · QUOTE LIFECYCLE · REVIEW ORGS', 'Internal review passes', 'Quote Status and Deal Stage become Passed Review']
    },
    {
      key: 'passed-review', number: 'CONDITIONAL', title: 'Passed Review', conditional: true,
      description: 'Approved internally and ready to send.',
      concepts: ['ready-send', 'high-value'],
      transition: ['MOVES WHEN · QUOTE LIFECYCLE', 'Quote is sent to the customer', 'Quote Status and Deal Stage become Sent']
    },
    {
      key: 'sent', number: 'STAGE 5', title: 'Sent',
      description: 'At least one relevant Quote remains viable.',
      concepts: ['sent-follow-up', 'expiry-reminder']
    }
  ];

  function automationGroupPipeline() {
    const pipelines = automationPipelines();
    const contextPipelineId = selectedAutomationStageContext && selectedAutomationStageContext.pipelineId;
    const workflowPipelineId = workflowsForAutomationGroup(selectedAutomationGroupKey).map(function (workflowKey) {
      return workflows[workflowKey] && workflows[workflowKey].triggerPipelineId;
    }).find(Boolean);
    const pipelineId = contextPipelineId || workflowPipelineId || 'sales-pipeline';
    return pipelines.find(function (item) { return item.id === pipelineId; }) ||
      pipelines.find(function (item) { return item.id === 'sales-pipeline'; }) || pipelines[0];
  }

  function automationGroupStages(pipelineOverride) {
    const pipeline = pipelineOverride || automationGroupPipeline();
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const pipelineStages = automationPipelineStages(pipeline).filter(function (stage) { return stage && !stage.outcome; });
    if (!pipelineStages.length) return automationGroupStageList;
    let currentAnchor = 'Qualified';
    return pipelineStages.map(function (pipelineStage, index) {
      const base = automationGroupStageList.find(function (stage) { return stage.title === pipelineStage.name; });
      if (base) currentAnchor = base.title;
      const item = base && quoteConnected ? Object.assign({}, base) : {
        key: String(pipelineStage.customStageId || pipelineStage.name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        number: quoteConnected ? ('CUSTOM · ' + String(pipelineStage.lifecycleSegment || currentAnchor).toUpperCase()) : ('STAGE ' + (index + 1) + ' · FULLY CUSTOM'),
        title: pipelineStage.name,
        custom: true,
        description: quoteConnected
          ? 'Customer-defined Stage inside the protected ' + (pipelineStage.lifecycleSegment || currentAnchor) + ' lifecycle segment.'
          : 'Customer-defined Stage using the shared CRM Automation block library.',
        concepts: []
      };
      item.transition = null;
      const nextStage = pipelineStages[index + 1];
      if (quoteConnected && nextStage && nextStage.protected) {
        const anchorBase = automationGroupStageList.find(function (stage) { return stage.title === (pipelineStage.lifecycleSegment || currentAnchor); });
        if (anchorBase && anchorBase.transition) item.transition = anchorBase.transition.slice();
      }
      return item;
    });
  }

  function automationStateLabel(state, groupStatus) {
    if (state === 'draft') return 'Needs setup';
    return state === 'on' && groupStatus === 'active' ? 'Active' : 'Inactive';
  }

  function workflowNeedsSetup(config) {
    if (!config || config.protected) return false;
    if (isProposalApproval(config)) return !config.setupComplete;
    return hasEditableStepModel(config) && ((!Array.isArray(config.steps) || config.steps.length === 0) || !!workflowMoveStageBlocker(config));
  }

  function automationTrainRowMarkup(conceptKey, definition) {
    const concept = conceptAutomationDefinitions[conceptKey];
    if (!concept) return '';
    const state = definition.states[conceptKey] || 'off';
    return '<button class="aut-train-automation" type="button" data-aut-list-concept="' + escapeAutomationHtml(conceptKey) + '">' +
      '<strong>' + escapeAutomationHtml(concept.title) + '</strong>' +
      '<span>' + escapeAutomationHtml(concept.start) + '</span>' +
      '<span>' + escapeAutomationHtml(concept.outcome) + '</span>' +
      '<span class="aut-train-company-scope" title="' + escapeAutomationHtml(automationCompanyScopeTitle(concept)) + '"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(concept)) + '</span>' +
      '<em class="' + escapeAutomationHtml(state) + '">' + automationStateLabel(state, definition.status) + '</em>' +
      '</button>';
  }

  function automationTrainWorkflowRowMarkup(workflowKey) {
    const config = workflows[workflowKey];
    if (!config) return '';
    const needsSetup = workflowNeedsSetup(config);
    return '<button class="aut-train-automation" type="button" data-aut-list-workflow-preview="' + escapeAutomationHtml(workflowKey) + '">' +
      '<strong>' + escapeAutomationHtml(config.title) + '</strong>' +
      '<span>' + escapeAutomationHtml(config.triggerEvent || config.triggerStage || 'Saved start event') + '</span>' +
      '<span>' + escapeAutomationHtml(config.actionName || 'Saved business outcome') + '</span>' +
      '<span class="aut-train-company-scope" title="' + escapeAutomationHtml(automationCompanyScopeTitle(config)) + '"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</span>' +
      '<em class="' + (config.enabled ? 'on' : (needsSetup ? 'draft' : 'off')) + '">' + (config.enabled ? 'Active' : (needsSetup ? 'Needs setup' : 'Inactive')) + '</em>' +
      '</button>';
  }

  function automationTrainOutcomeMarkup(conceptKey, definition, type, eventTitle, eventResult) {
    const concept = conceptAutomationDefinitions[conceptKey];
    const state = definition.states[conceptKey] || 'off';
    return '<button class="aut-train-outcome-card ' + type + '" type="button" data-aut-list-concept="' + escapeAutomationHtml(conceptKey) + '">' +
      '<small>DERIVED DEAL OUTCOME</small>' +
      '<strong>' + escapeAutomationHtml(eventTitle) + '</strong>' +
      '<span>' + escapeAutomationHtml(eventResult) + '</span>' +
      '<span><b>' + escapeAutomationHtml(concept.title) + '</b> · ' + automationStateLabel(state, definition.status) + '</span>' +
      '<span class="aut-train-company-scope" title="' + escapeAutomationHtml(automationCompanyScopeTitle(concept)) + '"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(concept)) + '</span>' +
      '</button>';
  }

  function automationTrainWorkflowOutcomeMarkup(workflowKey, type, eventTitle, eventResult) {
    const config = workflows[workflowKey];
    if (!config) return '';
    normalizeAutomationCompanyScope(config);
    const needsSetup = workflowNeedsSetup(config);
    const status = config.enabled ? 'Active' : (needsSetup ? 'Needs setup' : 'Inactive');
    return '<button class="aut-train-outcome-card ' + type + '" type="button" data-aut-list-workflow-preview="' + escapeAutomationHtml(workflowKey) + '">' +
      '<small>' + (config.companyScopeMode === 'all' ? 'USER AUTOMATION' : 'COMPANY-SPECIFIC AUTOMATION') + '</small>' +
      '<strong>' + escapeAutomationHtml(eventTitle) + '</strong>' +
      '<span>' + escapeAutomationHtml(eventResult) + '</span>' +
      '<span><b>' + escapeAutomationHtml(config.title) + '</b> · ' + status + '</span>' +
      '<span class="aut-train-company-scope" title="' + escapeAutomationHtml(automationCompanyScopeTitle(config)) + '"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</span>' +
      '</button>';
  }

  function renderAutomationGroupListView() {
    const host = document.getElementById('autGroupTrainline');
    if (!host) return;
    const definition = automationGroupDefinitions[selectedAutomationGroupKey] || automationGroupDefinitions.standard;
    const groupWorkflowKeys = workflowsForAutomationGroup(selectedAutomationGroupKey);
    const pipeline = automationGroupPipeline();
    if (!automationPipelineUsesQuoteLifecycle(pipeline)) {
      const stages = automationPipelineStages(pipeline);
      host.innerHTML = stages.map(function (stage, index) {
        const dynamicKeys = groupWorkflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === stage.name; });
        const rows = dynamicKeys.map(automationTrainWorkflowRowMarkup).join('');
        const transition = index ? '<div class="aut-train-transition"><article><small>MOVES WHEN · EXPLICIT STAGE ACTION</small><strong>' + escapeAutomationHtml(stages[index - 1].name + ' → ' + stage.name) + '</strong><span>Manual move or an Automation targeting this exact Stage</span></article></div>' : '';
        return transition + '<div class="aut-train-stage' + (stage.outcome ? ' conditional' : '') + '">' +
          '<span class="aut-train-marker">' + (index + 1) + '</span>' +
          '<section><header><div><small>' + escapeAutomationHtml(stage.outcome ? 'PROTECTED DEAL OUTCOME' : 'FULLY CUSTOM STAGE') + '</small><h4>' + escapeAutomationHtml(stage.name) + '</h4><p>' + escapeAutomationHtml(stage.outcome ? 'Auditable Deal outcome; Automations may react without redefining it.' : 'Shared CRM block library with independent Stage Automation settings.') + '</p></div><b>' + dynamicKeys.length + ' Automation' + (dynamicKeys.length === 1 ? '' : 's') + '</b></header>' +
          '<div class="aut-train-table-head"><span>Automation</span><span>Starts / runs at</span><span>Business outcome</span><span>Company scope</span><span>Status</span></div>' + rows + '</section></div>';
      }).join('');
      return;
    }
    const includeBaseAutomations = !definition.empty && !definition.custom;
    const wonWorkflowKeys = groupWorkflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === 'Won'; });
    const lostWorkflowKeys = groupWorkflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === 'Lost'; });
    host.innerHTML = automationGroupStages().map(function (stage, index) {
      const dynamicKeys = groupWorkflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === stage.title; });
      const baseRows = definition.empty || definition.custom ? '' : stage.concepts.map(function (conceptKey) { return automationTrainRowMarkup(conceptKey, definition); }).join('');
      const rows = baseRows + dynamicKeys.map(automationTrainWorkflowRowMarkup).join('');
      const count = (definition.empty || definition.custom ? 0 : stage.concepts.length) + dynamicKeys.length;
      const transition = stage.transition ?
        '<div class="aut-train-transition"><article><small>' + escapeAutomationHtml(stage.transition[0]) + '</small><strong>' + escapeAutomationHtml(stage.transition[1]) + '</strong><span>' + escapeAutomationHtml(stage.transition[2]) + '</span></article></div>' : '';
      return '<div class="aut-train-stage' + (stage.conditional ? ' conditional' : '') + '">' +
        '<span class="aut-train-marker">' + (index + 1) + '</span>' +
        '<section><header><div><small>' + escapeAutomationHtml(stage.number) + '</small><h4>' + escapeAutomationHtml(stage.title) + '</h4><p>' + escapeAutomationHtml(stage.description) + '</p></div><b>' + count + ' Automation' + (count === 1 ? '' : 's') + '</b></header>' +
        '<div class="aut-train-table-head"><span>Automation</span><span>Starts / runs at</span><span>Business outcome</span><span>Company scope</span><span>Status</span></div>' + rows + '</section></div>' + transition;
    }).join('') +
      '<div class="aut-train-outcomes">' +
      (includeBaseAutomations ? automationTrainOutcomeMarkup('accepted-handoff', definition, 'won', 'Any relevant Quote is Accepted', 'Quote Status = Accepted · Derived Deal outcome = Won') : '<article class="aut-train-outcome-card won"><small>DERIVED DEAL OUTCOME</small><strong>Any relevant Quote is Accepted</strong><span>Derived Deal outcome = Won · ' + wonWorkflowKeys.length + ' Automation' + (wonWorkflowKeys.length === 1 ? '' : 's') + '</span></article>') +
      wonWorkflowKeys.map(function (workflowKey) { return automationTrainWorkflowOutcomeMarkup(workflowKey, 'won', 'Any relevant Quote is Accepted', 'Quote Status = Accepted · Derived Deal outcome = Won'); }).join('') +
      (includeBaseAutomations ? automationTrainOutcomeMarkup('commercial-complete', definition, 'lost', 'No viable relevant Quote remains', 'No viable related Quote remains · Derived Deal outcome = Lost') : '<article class="aut-train-outcome-card lost"><small>DERIVED DEAL OUTCOME</small><strong>No viable relevant Quote remains</strong><span>Derived Deal outcome = Lost · ' + lostWorkflowKeys.length + ' Automation' + (lostWorkflowKeys.length === 1 ? '' : 's') + '</span></article>') +
      lostWorkflowKeys.map(function (workflowKey) { return automationTrainWorkflowOutcomeMarkup(workflowKey, 'lost', 'No viable relevant Quote remains', 'No viable related Quote remains · Derived Deal outcome = Lost'); }).join('') +
      '<div class="aut-train-archive"><b>ARCHIVED STATUS · NOT A STAGE</b> · All related Quotes are Cancelled. The Deal leaves the active Pipeline but keeps its last Stage and audit history.</div>' +
      '</div>';
  }

  function setAutomationGroupView(view) {
    activeAutomationGroupView = view === 'list' ? 'list' : 'map';
    document.querySelectorAll('[data-aut-group-view]').forEach(function (button) {
      const active = button.dataset.autGroupView === activeAutomationGroupView;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    document.querySelectorAll('[data-aut-group-view-panel]').forEach(function (panel) {
      panel.hidden = panel.dataset.autGroupViewPanel !== activeAutomationGroupView;
    });
    if (activeAutomationGroupView === 'list') renderAutomationGroupListView();
    else requestAnimationFrame(function () {
      const map = document.getElementById('autSemanticMap');
      if (map) map.dispatchEvent(new CustomEvent('aut-map-center'));
    });
  }

  function setAutomationGroupEditMode(editing) {
    automationGroupEditMode = false;
    pipelineDetail.dataset.mode = 'view';
    const banner = document.getElementById('autGroupEditBanner');
    if (banner) banner.hidden = true;
  }

  function automationGroupStateCounts(definition) {
    if (definition && definition.custom) {
      return workflowsForAutomationGroup(definition.key).reduce(function (counts, workflowKey) {
        const config = workflows[workflowKey];
        counts[config.enabled ? 'on' : (workflowNeedsSetup(config) ? 'draft' : 'off')] += 1;
        return counts;
      }, { on: 0, off: 0, draft: 0 });
    }
    const counts = Object.keys(definition.states).reduce(function (counts, key) {
      const state = definition.states[key] || 'off';
      counts[state] = (counts[state] || 0) + 1;
      return counts;
    }, { on: 0, off: 0, draft: 0 });
    if (definition && definition.key) {
      workflowsForAutomationGroup(definition.key).forEach(function (workflowKey) {
        counts[workflows[workflowKey].enabled ? 'on' : 'off'] += 1;
      });
    }
    return counts;
  }

  function automationGroupInspectAutomationMarkup(conceptKey, definition) {
    const concept = conceptAutomationDefinitions[conceptKey];
    if (!concept) return '';
    const state = definition.states[conceptKey] || 'off';
    return '<div class="aut-inspect-automation"><strong>' + escapeAutomationHtml(concept.title) + '</strong><em class="' + escapeAutomationHtml(state) + '">' + automationStateLabel(state, definition.status) + '</em><small>' + escapeAutomationHtml(concept.outcome) + '</small><b class="aut-inspect-company-scope"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(concept)) + '</b>' + automationCompanyScopePillsMarkup(concept, 'compact') + '</div>';
  }

  function automationGroupInspectWorkflowMarkup(workflowKey) {
    const config = workflows[workflowKey];
    if (!config) return '';
    const needsSetup = workflowNeedsSetup(config);
    const state = config.enabled ? 'on' : (needsSetup ? 'draft' : 'off');
    return '<div class="aut-inspect-automation user"><strong>' + escapeAutomationHtml(config.title) + '</strong><em class="' + state + '">' + (config.enabled ? 'Active' : (needsSetup ? 'Needs setup' : 'Inactive')) + '</em><small>' + escapeAutomationHtml(config.actionName || 'Saved business outcome') + '</small><b class="aut-inspect-company-scope"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</b>' + automationCompanyScopePillsMarkup(config, 'compact') + '</div>';
  }

  function automationGroupInspectMapMarkup(definition) {
    const workflowKeys = definition && definition.key ? workflowsForAutomationGroup(definition.key) : [];
    const stages = automationGroupStages().map(function (stage) {
      const stageStates = stage.concepts.map(function (key) { return definition.states[key] || 'off'; });
      const configured = stageStates.filter(function (state) { return state === 'on'; }).length;
      const dynamicKeys = workflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === stage.title; });
      const baseMarkup = definition.custom ? '' : stage.concepts.map(function (key) { return automationGroupInspectAutomationMarkup(key, definition); }).join('');
      const stageCard = '<article class="aut-inspect-stage' + (stage.conditional ? ' conditional' : '') + '"><header><small>' + escapeAutomationHtml(stage.number) + '</small><strong>' + escapeAutomationHtml(stage.title) + '</strong></header><p>' + escapeAutomationHtml(stage.description) + '</p><div class="aut-inspect-stage-counts"><span>' + ((definition.custom ? 0 : stage.concepts.length) + dynamicKeys.length) + ' Automations</span><span>' + (definition.custom ? dynamicKeys.filter(function (workflowKey) { return workflows[workflowKey].enabled; }).length : configured + dynamicKeys.filter(function (workflowKey) { return workflows[workflowKey].enabled; }).length) + ' Ready</span></div>' + baseMarkup + dynamicKeys.map(automationGroupInspectWorkflowMarkup).join('') + '</article>';
      const transition = stage.transition ? '<div class="aut-inspect-transition"><i class="fai">&#xf061;</i><small>' + escapeAutomationHtml(stage.transition[0]) + '</small><strong>' + escapeAutomationHtml(stage.transition[1]) + '</strong></div>' : '';
      return stageCard + transition;
    }).join('');
    const wonWorkflowMarkup = workflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === 'Won'; }).map(automationGroupInspectWorkflowMarkup).join('');
    const lostWorkflowMarkup = workflowKeys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === 'Lost'; }).map(automationGroupInspectWorkflowMarkup).join('');
    return '<div class="aut-inspect-pipeline">' + stages + '<section class="aut-inspect-outcomes"><article class="aut-inspect-outcome"><small>DERIVED DEAL OUTCOME</small><strong>Won</strong><span>Quote Status = Accepted.</span>' + (definition.custom ? '' : automationGroupInspectAutomationMarkup('accepted-handoff', definition)) + wonWorkflowMarkup + '</article><article class="aut-inspect-outcome lost"><small>DERIVED DEAL OUTCOME</small><strong>Lost</strong><span>No viable related Quote remains.</span>' + (definition.custom ? '' : automationGroupInspectAutomationMarkup('commercial-complete', definition)) + lostWorkflowMarkup + '</article><div class="aut-inspect-archive"><b>Archived status</b> · all related Quotes are Cancelled</div></section></div>';
  }

  function inactiveAutomationMapDefinition() {
    const states = {};
    Object.keys(conceptAutomationDefinitions).forEach(function (key) { states[key] = 'off'; });
    return {
      name: 'No Active Automation', status: 'inactive', automations: 0, rules: 0, affectedStages: 7,
      description: 'Protected Pipeline only. User Automations are paused.', states: states
    };
  }

  function automationSwitchMinimapMarkup() {
    let markup = '';
    automationGroupStages().forEach(function (stage) {
      markup += '<span class="' + (stage.conditional ? 'conditional' : '') + '">' + escapeAutomationHtml(stage.title) + '</span>';
      if (stage.transition) markup += '<span class="transition" aria-hidden="true">→</span>';
    });
    return markup + '<span class="outcome">Won</span><span class="outcome lost">Lost</span>';
  }

  function automationSwitchMapElements(kind) {
    const label = kind === 'before' ? 'Before' : 'After';
    return {
      panel: document.querySelector('[data-aut-switch-map="' + kind + '"]'),
      viewport: document.getElementById('autGroup' + label + 'MapViewport'),
      map: document.getElementById('autGroup' + label + 'Map'),
      name: document.getElementById('autGroup' + label + 'MapName'),
      state: document.getElementById('autGroup' + label + 'MapState'),
      minimap: document.getElementById('autGroup' + label + 'Minimap'),
      tiles: document.getElementById('autGroup' + label + 'MinimapTiles'),
      window: document.getElementById('autGroup' + label + 'MinimapWindow')
    };
  }

  function syncAutomationSwitchMinimap(kind) {
    const elements = automationSwitchMapElements(kind);
    if (!elements.viewport || !elements.minimap || !elements.window) return;
    const inset = 4;
    const trackWidth = Math.max(1, elements.minimap.clientWidth - inset * 2);
    const contentWidth = Math.max(elements.viewport.clientWidth, elements.viewport.scrollWidth);
    const ratio = Math.min(1, elements.viewport.clientWidth / contentWidth);
    const windowWidth = Math.max(62, trackWidth * ratio);
    const maxWindowLeft = Math.max(0, trackWidth - windowWidth);
    const maxScroll = Math.max(0, contentWidth - elements.viewport.clientWidth);
    const scrollRatio = maxScroll ? elements.viewport.scrollLeft / maxScroll : 0;
    elements.window.style.width = windowWidth + 'px';
    elements.window.style.left = (inset + maxWindowLeft * scrollRatio) + 'px';
  }

  function setAutomationSwitchMapFromMinimap(kind, clientX, dragOffset) {
    const elements = automationSwitchMapElements(kind);
    if (!elements.viewport || !elements.minimap || !elements.window) return;
    const inset = 4;
    const rect = elements.minimap.getBoundingClientRect();
    const windowWidth = elements.window.offsetWidth;
    const maxLeft = Math.max(0, elements.minimap.clientWidth - inset * 2 - windowWidth);
    const desired = clientX - rect.left - (dragOffset == null ? windowWidth / 2 : dragOffset) - inset;
    const left = Math.max(0, Math.min(maxLeft, desired));
    const maxScroll = Math.max(0, elements.viewport.scrollWidth - elements.viewport.clientWidth);
    elements.viewport.scrollLeft = maxLeft ? (left / maxLeft) * maxScroll : 0;
    syncAutomationSwitchMinimap(kind);
  }

  function bindAutomationSwitchMinimap(kind) {
    const elements = automationSwitchMapElements(kind);
    if (!elements.minimap || !elements.window || elements.minimap.dataset.bound === 'true') return;
    elements.minimap.dataset.bound = 'true';
    let dragging = false;
    let dragOffset = 0;
    elements.window.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      event.stopPropagation();
      dragging = true;
      dragOffset = event.clientX - elements.window.getBoundingClientRect().left;
      elements.window.setPointerCapture(event.pointerId);
    });
    elements.window.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      setAutomationSwitchMapFromMinimap(kind, event.clientX, dragOffset);
    });
    elements.window.addEventListener('pointerup', function (event) {
      dragging = false;
      if (elements.window.hasPointerCapture(event.pointerId)) elements.window.releasePointerCapture(event.pointerId);
    });
    elements.window.addEventListener('pointercancel', function () { dragging = false; });
    elements.window.addEventListener('keydown', function (event) {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = Math.max(50, elements.viewport.clientWidth * .2);
      elements.viewport.scrollLeft += event.key === 'ArrowRight' ? step : -step;
      syncAutomationSwitchMinimap(kind);
    });
    elements.minimap.addEventListener('pointerdown', function (event) {
      if (event.target === elements.window) return;
      setAutomationSwitchMapFromMinimap(kind, event.clientX, null);
    });
  }

  function renderAutomationSwitchMap(kind, definition) {
    const elements = automationSwitchMapElements(kind);
    if (!elements.map) return;
    const mapDefinition = definition || inactiveAutomationMapDefinition();
    elements.map.innerHTML = automationGroupInspectMapMarkup(mapDefinition);
    elements.tiles.innerHTML = automationSwitchMinimapMarkup();
    elements.name.textContent = mapDefinition.name;
    elements.panel.classList.toggle('is-empty', !definition);
    elements.state.textContent = definition ? (kind === 'before' ? 'Receiving events now' : 'Will receive new events') : (kind === 'before' ? 'No Active Automation' : 'New events become manual');
    elements.viewport.scrollLeft = 0;
    bindAutomationSwitchMinimap(kind);
  }

  function renderAutomationSwitchMaps(before, after) {
    renderAutomationSwitchMap('before', before);
    renderAutomationSwitchMap('after', after);
    requestAnimationFrame(function () {
      syncAutomationSwitchMinimap('before');
      syncAutomationSwitchMinimap('after');
    });
  }

  function closeAutomationGroupInspect() {
    document.getElementById('autGroupInspectOverlay').hidden = true;
  }

  function setAutomationGroupInspectZoom(nextZoom) {
    automationGroupInspectZoom = Math.max(35, Math.min(100, Math.round(nextZoom)));
    const pipeline = document.querySelector('#autGroupInspectMap > .aut-inspect-pipeline');
    if (pipeline) pipeline.style.zoom = String(automationGroupInspectZoom / 100);
    const output = document.getElementById('autGroupInspectZoomValue');
    if (output) output.textContent = automationGroupInspectZoom + '%';
    document.querySelectorAll('[data-aut-inspect-preset]').forEach(function (button) {
      button.classList.toggle('active', Number(button.dataset.autInspectPreset) === automationGroupInspectZoom);
    });
    const out = document.getElementById('autGroupInspectZoomOut');
    const inside = document.getElementById('autGroupInspectZoomIn');
    if (out) out.disabled = automationGroupInspectZoom <= 35;
    if (inside) inside.disabled = automationGroupInspectZoom >= 100;
  }

  function stepAutomationGroupInspectZoom(direction) {
    const stops = [35, 60, 100];
    const target = direction > 0 ? stops.find(function (stop) { return stop > automationGroupInspectZoom; }) : stops.slice().reverse().find(function (stop) { return stop < automationGroupInspectZoom; });
    setAutomationGroupInspectZoom(target === undefined ? automationGroupInspectZoom : target);
  }

  function openAutomationGroupInspect(key) {
    const definition = automationGroupDefinitions[key];
    if (!definition) return;
    inspectedAutomationGroupKey = key;
    const counts = automationGroupStateCounts(definition);
    const statusLabel = definition.status === 'active' ? 'Active' : 'Inactive';
    const needsSetup = counts.draft > 0;
    document.getElementById('autGroupInspectTitle').textContent = definition.name;
    const status = document.getElementById('autGroupInspectStatus');
    status.textContent = statusLabel;
    status.className = definition.status === 'active' ? 'active' : '';
    document.getElementById('autGroupInspectPurpose').textContent = definition.description;
    document.getElementById('autGroupInspectPolicy').textContent = definition.policy;
    document.getElementById('autGroupInspectMetrics').innerHTML = '<span><strong>' + definition.automations + '</strong>Automations</span><span><strong>' + counts.on + '</strong>Ready</span><span><strong>' + counts.off + '</strong>Inactive</span><span><strong>' + counts.draft + '</strong>Needs setup</span>';
    document.getElementById('autGroupInspectFit').innerHTML = definition.fit.map(function (item) { return '<span>' + escapeAutomationHtml(item) + '</span>'; }).join('');
    document.getElementById('autGroupInspectImpact').innerHTML = definition.salesImpact.map(function (impact) { return '<span><b>' + escapeAutomationHtml(impact[1]) + '</b><strong>' + escapeAutomationHtml(impact[0]) + '</strong></span>'; }).join('');
    document.getElementById('autGroupInspectMap').innerHTML = automationGroupInspectMapMarkup(definition);
    const edit = document.getElementById('autGroupInspectEdit');
    edit.innerHTML = '<i class="fai">&#xf303;</i> Edit';
    const activate = document.getElementById('autGroupInspectActivate');
    activate.disabled = definition.status !== 'active' && needsSetup;
    activate.innerHTML = definition.status === 'active' ? '<i class="fai">&#xf04c;</i> Turn off' : (needsSetup ? '<i class="fai">&#xf071;</i> Complete setup first' : '<i class="fai">&#xf04b;</i> Turn on');
    const toggle = document.getElementById('autGroupInspectToggle');
    toggle.setAttribute('aria-checked', String(definition.status === 'active'));
    toggle.setAttribute('aria-disabled', String(definition.status !== 'active' && needsSetup));
    toggle.setAttribute('aria-label', definition.status === 'active' ? 'Turn off this Automation' : (needsSetup ? 'Complete setup before activation' : 'Turn on this Automation'));
    document.getElementById('autGroupInspectSwitchCopy').textContent = definition.status === 'active' ? 'Active · receiving new events' : 'Inactive · no new events';
    document.getElementById('autGroupInspectOverlay').hidden = false;
    setAutomationGroupInspectZoom(60);
    document.getElementById('autGroupInspectClose').focus();
  }

  function previewInspectedAutomationStatusChange() {
    const definition = automationGroupDefinitions[inspectedAutomationGroupKey];
    if (!definition) return;
    if (definition.status !== 'active' && automationGroupStateCounts(definition).draft > 0) {
      showAutomationToast('Complete the remaining setup item before this Inactive Automation can be turned on.');
      return;
    }
    closeAutomationGroupInspect();
    openAutomationGroupPreview(definition.status === 'active' ? null : inspectedAutomationGroupKey, definition.status === 'active' ? 'deactivate' : 'activate');
  }

  function automationGroupStageMarkup() {
    return ['Qualified', 'In Progress', 'In Review', 'Passed Review', 'Sent', 'Won', 'Lost'].map(function (stage) { return '<span>' + escapeAutomationHtml(stage) + '</span>'; }).join('');
  }

  function automationGroupRuleMarkup(definition) {
    if (!definition) return '<li><span>User Automations</span><b>All paused</b></li><li><span>Manual progress</span><b>Still available</b></li><li><span>Protected lifecycle</span><b>Still running</b></li>';
    return definition.changes.map(function (change) { return '<li><span>' + escapeAutomationHtml(change[0]) + '</span><b>' + escapeAutomationHtml(change[1]) + '</b></li>'; }).join('');
  }

  function syncCrmAutomationStatus() {
    const statusButton = document.getElementById('crmAutomationStatus');
    if (!statusButton) return;
    const pipeline = typeof getActivePipeline === 'function' ? getActivePipeline() : automationPipelineById('sales-pipeline');
    const isSalesPipeline = !pipeline || pipeline.id === 'sales-pipeline';
    const pipelineWorkflowKeys = pipeline ? userWorkflowKeys().filter(function (key) {
      return workflows[key] && workflows[key].triggerPipelineId === pipeline.id;
    }) : [];
    const activeWorkflowCount = pipelineWorkflowKeys.filter(function (key) { return workflows[key].enabled; }).length;
    const activeDefinition = isSalesPipeline && activeAutomationGroupKey ? automationGroupDefinitions[activeAutomationGroupKey] : null;
    const isActive = isSalesPipeline ? Boolean(activeDefinition) : activeWorkflowCount > 0;
    const label = document.getElementById('crmAutomationStatusLabel');
    const name = document.getElementById('crmAutomationStatusName');
    const pipelineName = pipeline && pipeline.name ? pipeline.name : 'Sales Pipeline';
    statusButton.classList.toggle('is-on', isActive);
    statusButton.classList.toggle('is-off', !isActive);
    statusButton.setAttribute('aria-pressed', String(isActive));
    statusButton.dataset.pipelineId = pipeline ? pipeline.id : 'sales-pipeline';
    label.textContent = isActive ? 'Automation Active' : 'Automation Inactive';
    if (isSalesPipeline) {
      name.textContent = activeDefinition
        ? activeDefinition.name + ' · ' + (activeDefinition.automations || 0) + ' Automations'
        : 'No Active Automation';
    } else {
      name.textContent = activeWorkflowCount
        ? activeWorkflowCount + ' Active · ' + pipelineWorkflowKeys.length + ' Automations'
        : (pipelineWorkflowKeys.length ? pipelineWorkflowKeys.length + ' Inactive Automations' : 'No Active Automation');
    }
    statusButton.setAttribute('aria-label', (isActive ? 'Automation Active' : 'Automation Inactive') + '. Open ' + pipelineName + ' Automations');
  }
  window.syncCrmAutomationStatus = syncCrmAutomationStatus;

  function automationGroupKeysForPipeline(pipeline) {
    if (!pipeline || pipeline.id === 'sales-pipeline') return salesAutomationGroupKeys();
    const workflowKeys = userWorkflowKeys().filter(function (workflowKey) {
      return workflows[workflowKey] && workflows[workflowKey].triggerPipelineId === pipeline.id;
    });
    return workflowKeys.length ? [ensurePipelineAutomationGroup(pipeline)] : [];
  }

  function automationGroupListRowMarkup(key, pipeline) {
    const definition = automationGroupDefinitions[key];
    if (!definition) return '';
    const counts = automationGroupStateCounts(definition);
    const isSalesPipeline = !pipeline || pipeline.id === 'sales-pipeline';
    definition.status = isSalesPipeline
      ? (key === activeAutomationGroupKey ? 'active' : 'inactive')
      : (counts.on ? 'active' : 'inactive');
    definition.automations = counts.on + counts.off + counts.draft;
    const iconClass = key === 'high-value' ? ' high-value' : (definition.status === 'active' ? '' : ' draft');
    const fit = (definition.fit || [pipeline.name, definition.automations + ' Automations']).map(function (item) {
      return '<span>' + escapeAutomationHtml(item) + '</span>';
    }).join('');
    const actions = isSalesPipeline
      ? '<button class="aut-group-preview" type="button" data-aut-group-preview="' + escapeAutomationHtml(key) + '"><i class="fai">&#xf06e;</i> Preview</button><button class="aut-group-open" type="button" data-aut-group-open="' + escapeAutomationHtml(key) + '"><i class="fai">&#xf303;</i> Edit</button><button class="aut-group-toggle" type="button" role="switch" aria-checked="' + String(definition.status === 'active') + '" aria-label="' + (definition.status === 'active' ? 'Turn off ' : 'Turn on ') + escapeAutomationHtml(definition.name) + '" data-aut-group-toggle="' + escapeAutomationHtml(key) + '"><span></span></button>'
      : '<button class="aut-group-open" type="button" data-aut-group-open="' + escapeAutomationHtml(key) + '"><i class="fai">&#xf279;</i> Open Pipeline Map</button>';
    return '<article class="aut-group-row" data-aut-group-row="' + escapeAutomationHtml(key) + '" data-status="' + definition.status + '">' +
      '<div class="aut-group-main"><div class="aut-group-icon' + iconClass + '"><i class="fai">&#xf0ae;</i></div><div><div class="aut-group-title"><strong>' + escapeAutomationHtml(definition.name) + '</strong><span class="' + (definition.status === 'active' ? 'active' : '') + '">' + (definition.status === 'active' ? 'Active' : 'Inactive') + '</span></div><p>' + escapeAutomationHtml(definition.description || ('Automation setup for ' + pipeline.name + '.')) + '</p><div class="aut-group-fit">' + fit + '</div></div></div>' +
      '<div class="aut-group-counts"><div class="aut-group-metric total"><strong>' + definition.automations + '</strong><span>Automations</span></div><div class="aut-group-metric on"><strong>' + counts.on + '</strong><span>Active</span></div><div class="aut-group-metric off"><strong>' + counts.off + '</strong><span>Inactive</span></div><div class="aut-group-metric draft"><strong>' + counts.draft + '</strong><span>Needs setup</span></div></div>' +
      '<div class="aut-group-audit"><strong>Candy</strong><span>Today</span><small>Creator</small></div><div class="aut-group-audit"><strong>Candy</strong><span>Just now</span><small>Last edited by</small></div>' +
      '<div class="aut-group-actions">' + actions + '</div></article>';
  }

  function configureAutomationGroupHub(pipeline, groupKeys) {
    const pipelineName = pipeline && pipeline.name ? pipeline.name : 'Sales Pipeline';
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const isSalesPipeline = pipeline && pipeline.id === 'sales-pipeline';
    const title = document.getElementById('autPipelineGroupsTitle');
    const eyebrow = document.getElementById('autPipelineGroupsEyebrow');
    const copy = document.getElementById('autPipelineGroupsCopy');
    const create = document.getElementById('autCreateAutomationGroup');
    const rule = document.getElementById('autPipelineGroupsRule');
    const search = document.getElementById('autGroupSearch');
    const toolbarSummary = document.querySelector('.aut-group-toolbar > span');
    const decisionGuide = document.querySelector('.aut-group-decision-guide');
    const back = document.getElementById('autGroupBackToPipelines');
    const actionColumn = document.querySelector('#autPipelineGroups .aut-group-columns span:last-child');
    if (eyebrow) eyebrow.textContent = pipelineName + ' / Automations';
    if (title) title.textContent = 'Automations for ' + pipelineName;
    if (copy) copy.innerHTML = groupKeys.length
      ? 'Choose the Automation setup you want to review, then open its Pipeline Map before editing an individual flow.'
      : 'This Pipeline does not have any Automations yet. Create the first one without changing the Pipeline stages.';
    if (create) create.innerHTML = '<i class="fai">&#xf067;</i> ' + (groupKeys.length ? 'Create Automation' : 'Create first Automation');
    if (rule) {
      rule.innerHTML = '<span><i class="fai">&#xf023;</i><strong>Pipeline: ' + escapeAutomationHtml(pipelineName) + '</strong></span>' +
        '<span>' + (quoteConnected ? 'Protected Quote lifecycle stays unchanged' : 'Fully Custom Stage flow') + '</span>' +
        '<span><strong>' + (isSalesPipeline ? 'One setup Active at a time' : 'Each Stage keeps independent Automations') + '</strong></span>';
    }
    if (search) search.placeholder = 'Search ' + pipelineName + ' Automations';
    if (back) back.setAttribute('aria-label', 'Back from ' + pipelineName + ' to all Pipelines');
    if (actionColumn) actionColumn.textContent = isSalesPipeline ? 'Preview · Edit · Active' : 'Open Pipeline Map';
    if (toolbarSummary) toolbarSummary.innerHTML = '<b id="autGroupVisibleCount">' + groupKeys.length + '</b> Automation setup' + (groupKeys.length === 1 ? '' : 's') + ' in ' + escapeAutomationHtml(pipelineName);
    if (decisionGuide) decisionGuide.hidden = !isSalesPipeline;
    const tablist = document.querySelector('.aut-group-tabs');
    if (tablist) tablist.setAttribute('aria-label', 'Filter ' + pipelineName + ' Automations');
  }

  function renderAutomationGroupRows() {
    const pipeline = automationGroupPipeline();
    const groupKeys = automationGroupKeysForPipeline(pipeline);
    const groupList = document.getElementById('autGroupList');
    if (groupList) groupList.innerHTML = groupKeys.map(function (key) { return automationGroupListRowMarkup(key, pipeline); }).join('');
    configureAutomationGroupHub(pipeline, groupKeys);
    let visible = 0;
    const query = String(document.getElementById('autGroupSearch').value || '').trim().toLowerCase();
    document.querySelectorAll('[data-aut-group-row]').forEach(function (row) {
      const key = row.dataset.autGroupRow;
      const definition = automationGroupDefinitions[key];
      const counts = automationGroupStateCounts(definition);
      definition.status = pipeline && pipeline.id === 'sales-pipeline'
        ? (key === activeAutomationGroupKey ? 'active' : 'inactive')
        : (counts.on ? 'active' : 'inactive');
      row.dataset.status = definition.status;
      const status = row.querySelector('.aut-group-title span');
      status.textContent = definition.status === 'active' ? 'Active' : 'Inactive';
      status.className = definition.status === 'active' ? 'active' : '';
      const toggle = row.querySelector('[data-aut-group-toggle]');
      if (toggle) {
        toggle.setAttribute('aria-checked', String(definition.status === 'active'));
        toggle.setAttribute('aria-label', definition.status === 'active' ? 'Turn off ' + definition.name : 'Turn on ' + definition.name);
      }
      const metricValues = row.querySelectorAll('.aut-group-counts strong');
      if (metricValues[0]) metricValues[0].textContent = String(definition.automations || 0);
      if (metricValues[1]) metricValues[1].textContent = String(counts.on || 0);
      if (metricValues[2]) metricValues[2].textContent = String(counts.off || 0);
      if (metricValues[3]) metricValues[3].textContent = String(counts.draft || 0);
      const matchesStatus = activeGroupFilter === 'all' || definition.status === activeGroupFilter;
      const matchesQuery = !query || definition.name.toLowerCase().includes(query) || row.textContent.toLowerCase().includes(query);
      row.hidden = !(matchesStatus && matchesQuery);
      if (!row.hidden) visible += 1;
    });
    const visibleCount = document.getElementById('autGroupVisibleCount');
    if (visibleCount) visibleCount.textContent = String(visible);
    const empty = document.getElementById('autGroupEmpty');
    const genuinelyEmpty = groupKeys.length === 0;
    empty.hidden = visible !== 0;
    document.getElementById('autGroupEmptyTitle').textContent = genuinelyEmpty ? 'No Automations in ' + pipeline.name : 'No matching Automations';
    document.getElementById('autGroupEmptyCopy').textContent = genuinelyEmpty ? 'Create the first Automation, then choose its Stage, Starts when, Rules and Actions.' : 'Try another search or status filter.';
    document.getElementById('autGroupEmptyCreate').hidden = !genuinelyEmpty;
    document.querySelectorAll('[data-aut-group-filter]').forEach(function (button) { button.classList.toggle('active', button.dataset.autGroupFilter === activeGroupFilter); });
    const totalGroups = groupKeys.length;
    const activeGroups = groupKeys.filter(function (key) { return automationGroupDefinitions[key].status === 'active'; }).length;
    const inactiveGroups = totalGroups - activeGroups;
    document.querySelectorAll('[data-aut-group-filter]').forEach(function (button) {
      const count = button.querySelector('b');
      if (!count) return;
      count.textContent = String(button.dataset.autGroupFilter === 'all' ? totalGroups : (button.dataset.autGroupFilter === 'active' ? activeGroups : inactiveGroups));
    });
    const pipelineRow = document.querySelector('[data-aut-pipeline-open="sales-pipeline"]');
    if (pipelineRow && pipeline && pipeline.id === 'sales-pipeline') {
      pipelineRow.querySelector('.aut-pipeline-count strong').textContent = String(totalGroups);
      pipelineRow.querySelector('.aut-pipeline-count small').textContent = (activeAutomationGroupKey ? '1 active' : '0 active') + ' · ' + groupKeys.filter(function (key) { return automationGroupDefinitions[key].status === 'inactive'; }).length + ' inactive';
    }
    syncCrmAutomationStatus();
  }

  function appendBlankAutomationGroupRow(key, definition) {
    const host = document.getElementById('autGroupList');
    if (!host) return;
    const row = document.createElement('article');
    row.className = 'aut-group-row';
    row.dataset.autGroupRow = key;
    row.dataset.status = 'inactive';
    row.innerHTML = '<div class="aut-group-main"><div class="aut-group-icon draft"><i class="fai">&#xf15c;</i></div><div><div class="aut-group-title"><strong>' + escapeAutomationHtml(definition.name) + '</strong><span>Inactive</span></div><p>Empty Automation setup for the protected Sales Pipeline.</p><div class="aut-group-fit"><span>0 Automations</span><span>Protected stages</span><span>Ready to build</span></div></div></div>' +
      '<div class="aut-group-counts"><div class="aut-group-metric total"><strong>0</strong><span>Automations</span></div><div class="aut-group-metric on"><strong>0</strong><span>Ready</span></div><div class="aut-group-metric off"><strong>0</strong><span>Inactive</span></div><div class="aut-group-metric draft"><strong>0</strong><span>Needs setup</span></div></div>' +
      '<div class="aut-group-audit"><strong>Candy</strong><span>Today</span><small>Creator</small></div><div class="aut-group-audit"><strong>Candy</strong><span>Just now</span><small>Last edited by</small></div>' +
      '<div class="aut-group-actions"><button class="aut-group-preview" type="button" data-aut-group-preview="' + escapeAutomationHtml(key) + '"><i class="fai">&#xf06e;</i> Preview</button><button class="aut-group-open" type="button" data-aut-group-open="' + escapeAutomationHtml(key) + '"><i class="fai">&#xf303;</i> Edit</button><button class="aut-group-toggle" type="button" role="switch" aria-checked="false" aria-label="Turn on ' + escapeAutomationHtml(definition.name) + '" data-aut-group-toggle="' + escapeAutomationHtml(key) + '"><span></span></button></div>';
    host.appendChild(row);
  }

  function createBlankSalesPipelineAutomation() {
    blankAutomationGroupCounter += 1;
    const key = 'blank-sales-' + blankAutomationGroupCounter;
    const states = {};
    Object.keys(conceptAutomationDefinitions).forEach(function (conceptKey) { states[conceptKey] = 'off'; });
    const definition = automationGroupDefinitions[key] = {
      key: key, custom: true,
      name: 'Untitled Sales Pipeline Automation', status: 'inactive', empty: true,
      automations: 0, rules: 0, affectedStages: 7,
      description: 'Empty Automation setup for the protected Sales Pipeline.',
      policy: 'No user Automations have been added yet.',
      fit: ['0 Automations', 'Protected stages', 'Inactive'],
      changes: [['User Automations', 'None yet'], ['Protected lifecycle', 'Still running'], ['New events', 'Not received while Inactive']],
      salesImpact: [['43', 'Open Deals unchanged'], ['0', 'Automated approvals'], ['0', 'Automated follow-ups'], ['0', 'New runs']],
      states: states
    };
    appendBlankAutomationGroupRow(key, definition);
    persistAutomationGroupState();
    renderAutomationGroupRows();
    selectedAutomationGroupKey = key;
    showAutomationPipelineDetail(key);
    setAutomationGroupEditMode(true);
    showAutomationToast('Blank Sales Pipeline Automation created. Add Automations stage by stage; protected transitions remain available.');
  }

  function dynamicWorkflowRuleMarkup(config) {
    const trigger = config.triggerEvent || (config.objectType === 'Lead' ? 'Lead matches the saved start event' : 'Deal matches the saved start event');
    const wait = Number(config.waitDays) > 0
      ? '<b class="wait"><span>WAIT</span> ' + escapeAutomationHtml(String(config.waitDays)) + ' day' + (Number(config.waitDays) === 1 ? '' : 's') + '</b>'
      : '';
    const condition = config.condition || 'Saved conditions are met';
    const owner = config.actionOwner || config.assignmentOwner || 'Record owner';
    const due = config.actionDue ? ' · ' + config.actionDue : '';
    const required = automationConfigHasRequiredAction(config)
      ? ' · Required before ' + (config.blockedEvent === 'first-related-quote' ? 'first related Quote is created' : 'continuing')
      : '';
    return '<div class="aut-map-rules">' +
      '<b class="when"><span>WHEN</span> ' + escapeAutomationHtml(trigger) + '</b>' + wait +
      '<b class="condition"><span>IF</span> ' + escapeAutomationHtml(condition) + '</b>' +
      '<b class="yes"><span>YES</span> ' + escapeAutomationHtml(config.actionName || 'Run saved action') + ' · Assigned to ' + escapeAutomationHtml(owner) + escapeAutomationHtml(due + required) + '</b>' +
      '<b class="no"><span>NO</span> Nothing is created · end safely</b></div>';
  }

  function automationMapCompanyScopeMarkup(config) {
    normalizeAutomationCompanyScope(config);
    const appliedCompanies = automationCompanyScopeAppliedCompanies(config);
    const summary = config.companyScopeMode === 'all'
      ? 'For all Companies'
      : 'For ' + appliedCompanies.length + (config.companyScopeMode === 'selected' ? ' selected' : '') + ' Compan' + (appliedCompanies.length === 1 ? 'y' : 'ies');
    return '<div class="aut-map-company-scope" aria-label="Owning Company scope: ' + escapeAutomationHtml(automationCompanyScopeTitle(config)) + '">' +
      '<strong class="aut-map-company-scope-summary"><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(summary) + '</strong>' +
      '<div class="aut-map-company-scope-pills">' + automationCompanyScopePillItemsMarkup(config) + '</div></div>';
  }

  function dynamicWorkflowCardMarkup(workflowKey, config) {
    const needsSetup = workflowNeedsSetup(config);
    const state = config.enabled ? 'on' : (needsSetup ? 'draft' : 'off');
    const hasRequiredAction = automationConfigHasRequiredAction(config);
    return '<div class="aut-map-automation aut-map-dynamic-workflow" data-aut-dynamic-workflow="' + escapeAutomationHtml(workflowKey) + '">' +
      '<div><button type="button" data-aut-map-workflow="' + escapeAutomationHtml(workflowKey) + '">' + escapeAutomationHtml(config.title || 'Untitled Automation') + '</button>' +
      '<button type="button" data-aut-workflow-state="' + escapeAutomationHtml(workflowKey) + '" data-state="' + state + '">' + (config.enabled ? 'Active' : (needsSetup ? 'Needs setup' : 'Inactive')) + '</button></div>' +
      '<span>' + escapeAutomationHtml(hasRequiredAction ? 'Required completion checkpoint' : 'Independent Automation') + '</span>' +
      automationMapCompanyScopeMarkup(config) + dynamicWorkflowRuleMarkup(config) + '</div>';
  }

  function automationMapDirectStageByName(board, stageName) {
    return Array.from(board.children).find(function (node) {
      if (!node.classList || !node.classList.contains('aut-map-stage')) return false;
      const heading = node.querySelector('header strong');
      return heading && heading.textContent.trim() === stageName;
    }) || null;
  }

  function automationMapCustomStageMarkup(stage, pipeline, index, previousStage) {
    const stageId = automationStageStableId(stage, pipeline, index);
    const segment = stage.lifecycleSegment || (previousStage && (previousStage.lifecycleSegment || previousStage.name)) || 'Custom';
    const previousName = previousStage && previousStage.name ? previousStage.name : 'Previous Stage';
    return '<div class="aut-map-transition custom-path" data-aut-dynamic-stage-transition="' + escapeAutomationHtml(stageId) + '" aria-label="Custom Pipeline path from ' + escapeAutomationHtml(previousName) + ' to ' + escapeAutomationHtml(stage.name) + '">' +
      '<div class="aut-map-transition-card"><small>CUSTOM PIPELINE PATH</small><strong>' + escapeAutomationHtml(previousName) + ' → ' + escapeAutomationHtml(stage.name) + '</strong><span>Manual move or an explicit Stage Automation</span></div></div>' +
      '<article class="aut-map-stage custom" data-aut-dynamic-stage="' + escapeAutomationHtml(stageId) + '" data-aut-stage-id="' + escapeAutomationHtml(stageId) + '" data-aut-lifecycle-segment="' + escapeAutomationHtml(segment) + '">' +
      '<header><small>CUSTOM · ' + escapeAutomationHtml(String(segment).toUpperCase()) + ' SEGMENT</small><strong>' + escapeAutomationHtml(stage.name) + '</strong></header>' +
      '<span class="aut-map-count">0 Automations</span><span class="aut-map-status">None added</span>' +
      '<div class="aut-map-stage-result"><small>CUSTOM STAGE</small><strong>Shared ' + escapeAutomationHtml(segment) + ' block library</strong><span>This Stage keeps its own Starts when, Rules, Actions and Automation status.</span></div>' +
      '<div class="aut-map-automations"></div></article>';
  }

  function automationMapStandaloneStageMarkup(stage, pipeline, index, previousStage) {
    const stageId = automationStageStableId(stage, pipeline, index);
    const isOutcome = Boolean(stage.outcome);
    const tone = stage.outcome === 'won' ? ' won' : (stage.outcome === 'lost' ? ' lost' : ' custom');
    const transition = previousStage ? '<div class="aut-map-transition custom-path" data-aut-dynamic-stage-transition="' + escapeAutomationHtml(stageId) + '-path" aria-label="Explicit Pipeline path from ' + escapeAutomationHtml(previousStage.name) + ' to ' + escapeAutomationHtml(stage.name) + '">' +
      '<div class="aut-map-transition-card"><small>MOVES WHEN · EXPLICIT STAGE ACTION</small><strong>' + escapeAutomationHtml(previousStage.name) + ' → ' + escapeAutomationHtml(stage.name) + '</strong><span>Manual move or an Automation targeting this exact Stage</span></div></div>' : '';
    return transition + '<article class="aut-map-stage' + tone + '" data-aut-dynamic-stage="' + escapeAutomationHtml(stageId) + '" data-aut-stage-id="' + escapeAutomationHtml(stageId) + '">' +
      (index === 0 ? '<span class="aut-map-role">STARTS HERE</span>' : '') +
      '<header><small>' + (isOutcome ? 'PROTECTED DEAL OUTCOME' : 'STAGE ' + (index + 1) + ' · FULLY CUSTOM') + '</small><strong>' + escapeAutomationHtml(stage.name) + '</strong></header>' +
      '<span class="aut-map-count">0 Automations</span><span class="aut-map-status">None added</span>' +
      '<div class="aut-map-stage-result"><small>' + (isOutcome ? 'DEAL OUTCOME' : 'SHARED BLOCK LIBRARY') + '</small><strong>' + (isOutcome ? 'Outcome remains auditable' : 'Generic CRM Automation blocks') + '</strong><span>' + (isOutcome ? 'Automations can react to this outcome without redefining it.' : 'Stage name is a label; this Stage keeps its own Starts when, Rules and Actions.') + '</span></div>' +
      '<div class="aut-map-automations"></div></article>';
  }

  function automationRequiredActionDetails(config) {
    const details = [];
    automationWalkSteps(config && config.steps, function (step) {
      if (!step || step.type !== 'action' || step.completionMode !== 'required') return;
      let label = step.action || 'Required work';
      if (step.action === 'Request a file') label = (step.fileRequestName || 'Required file') + ' received';
      else if (step.action === 'Create Note') label = (step.noteTitle || 'Required Note') + ' completed';
      else if (step.action === 'Schedule Meeting' || step.action === 'Schedule Meeting / Site Visit') {
        label = (step.meetingTitle || 'Meeting / Site Visit') + ' completed';
      }
      details.push({ label: label, blockedEvent: step.blockedEvent || defaultCompletionEvent(config) });
    });
    return details;
  }

  function automationRequiredEventLabel(eventName) {
    const labels = {
      'deal-leaves-stage': 'Deal leaves this Custom Stage',
      'first-related-quote': 'First related Quote is created',
      'quote-submitted-review': 'Quote is submitted for internal review',
      'quote-review-passed': 'Quote Review is passed',
      'quote-sent': 'Quote is sent to the customer',
      'quote-accepted': 'Quote is accepted',
      'deal-won': 'Deal becomes Won',
      'deal-lost': 'Deal becomes Lost'
    };
    return labels[eventName] || 'the selected lifecycle event continues';
  }

  function automationMapCustomRequirementMarkup(stageId, stageName, details) {
    const first = details[0] || { label: 'Required Custom work is completed', blockedEvent: 'deal-leaves-stage' };
    const title = details.length === 1 ? first.label : details.length + ' Custom requirements are completed';
    const detail = details.length === 1
      ? 'Automation checkpoint · required before ' + automationRequiredEventLabel(first.blockedEvent)
      : details.map(function (item) { return item.label; }).join(' · ');
    return '<div class="aut-map-transition custom-required" data-aut-dynamic-stage-transition="' + escapeAutomationHtml(stageId) + '-required" aria-label="Custom requirement after ' + escapeAutomationHtml(stageName) + '">' +
      '<div class="aut-map-transition-card"><small>MOVES WHEN · CUSTOM REQUIRED</small><strong>' + escapeAutomationHtml(title) + '</strong><span>' + escapeAutomationHtml(detail) + '</span></div></div>';
  }

  function syncAutomationCustomRequirementTransitions(workflowKeys) {
    const board = document.getElementById('autMapBoard');
    if (!board) return;
    const requiredByStage = {};
    (workflowKeys || []).forEach(function (workflowKey) {
      const storedConfig = workflows[workflowKey];
      const liveConfig = automationLiveConfig(storedConfig);
      if (!storedConfig || !storedConfig.enabled || !liveConfig) return;
      const details = automationRequiredActionDetails(liveConfig);
      if (!details.length) return;
      const stageName = workflowStageName(liveConfig);
      if (!requiredByStage[stageName]) requiredByStage[stageName] = [];
      requiredByStage[stageName].push.apply(requiredByStage[stageName], details);
    });
    Object.keys(requiredByStage).forEach(function (stageName) {
      const stageCard = Array.from(board.querySelectorAll('.aut-map-stage.custom')).find(function (card) {
        const heading = card.querySelector('header strong');
        return heading && heading.textContent.trim() === stageName;
      });
      if (!stageCard) return;
      const stageId = stageCard.dataset.autStageId || stageName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      stageCard.insertAdjacentHTML('afterend', automationMapCustomRequirementMarkup(stageId, stageName, requiredByStage[stageName]));
    });
  }

  function syncAutomationPipelineStagesToMap() {
    const board = document.getElementById('autMapBoard');
    if (!board) return;
    const pipeline = automationGroupPipeline();
    if (!pipeline) return;
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    if (!quoteConnected) {
      const stages = automationPipelineStages(pipeline);
      board.innerHTML = stages.map(function (stage, index) {
        return automationMapStandaloneStageMarkup(stage, pipeline, index, stages[index - 1]);
      }).join('');
      board.dataset.autPipelineId = pipeline.id;
      board.dataset.autPipelineMode = 'standalone';
      return;
    }
    if (board.dataset.autPipelineMode === 'standalone') board.innerHTML = automationQuoteLifecycleMapMarkup;
    board.querySelectorAll('[data-aut-dynamic-stage], [data-aut-dynamic-stage-transition]').forEach(function (node) { node.remove(); });
    board.dataset.autPipelineId = pipeline.id || 'sales-pipeline';
    board.dataset.autPipelineMode = 'quote-connected';
    const stages = automationPipelineStages(pipeline).filter(function (stage) { return stage && !stage.outcome; });

    stages.forEach(function (stage, index) {
      if (!stage.protected) return;
      const stageCard = automationMapDirectStageByName(board, stage.name);
      if (stageCard) stageCard.dataset.autStageId = automationStageStableId(stage, pipeline, index);
    });

    stages.forEach(function (stage, index) {
      if (stage.protected) return;
      const nextProtected = stages.slice(index + 1).find(function (candidate) { return candidate && candidate.protected; });
      let boundary = board.querySelector('.aut-map-outcome-split');
      if (nextProtected) {
        const nextStageCard = automationMapDirectStageByName(board, nextProtected.name);
        if (nextStageCard) {
          const precedingNode = nextStageCard.previousElementSibling;
          boundary = precedingNode && precedingNode.classList.contains('aut-map-transition') ? precedingNode : nextStageCard;
        }
      }
      if (!boundary) return;
      boundary.insertAdjacentHTML('beforebegin', automationMapCustomStageMarkup(stage, pipeline, index, stages[index - 1]));
    });
  }

  function prepareAutomationMapStageCards(definition) {
    const map = document.getElementById('autSemanticMap');
    if (!map) return;
    map.querySelectorAll('.aut-map-stage').forEach(function (stageCard) {
      const heading = stageCard.querySelector('header strong');
      if (!heading) return;
      const stageName = heading.textContent.trim();
      let addButton = stageCard.querySelector('.aut-map-stage-add');
      if (!addButton) {
        addButton = document.createElement('button');
        addButton.className = 'aut-map-stage-add';
        addButton.type = 'button';
        addButton.dataset.autStageAdd = stageName;
        addButton.innerHTML = '<i class="fai">&#xf067;</i> Add automation';
        addButton.setAttribute('aria-label', 'Add Automation for ' + stageName);
        const status = stageCard.querySelector('.aut-map-status');
        if (status) status.insertAdjacentElement('afterend', addButton);
        else stageCard.appendChild(addButton);
      }
      const mapBoard = document.getElementById('autMapBoard');
      addButton.dataset.autPipelineId = (mapBoard && mapBoard.dataset.autPipelineId) || 'sales-pipeline';
      let emptyState = stageCard.querySelector('.aut-map-empty-stage');
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'aut-map-empty-stage';
        emptyState.innerHTML = '<span><i class="fai">&#xf0e7;</i><strong>No Automations yet</strong><small>Use + Add automation for ' + escapeAutomationHtml(stageName) + '.</small></span>';
        stageCard.appendChild(emptyState);
      }
      if (definition && definition.empty) {
        const count = stageCard.querySelector('.aut-map-count');
        const stageStatus = stageCard.querySelector('.aut-map-status');
        if (count) count.textContent = '0 Automations';
        if (stageStatus) stageStatus.textContent = 'None added';
      }
    });
  }

  function syncAutomationMapStageSummaries(definition) {
    const map = document.getElementById('autSemanticMap');
    if (!map) return;
    map.querySelectorAll('.aut-map-stage').forEach(function (stageCard) {
      let cards = Array.from(stageCard.querySelectorAll('.aut-map-automations > .aut-map-automation'));
      if (definition && definition.custom) cards = cards.filter(function (card) { return card.hasAttribute('data-aut-dynamic-workflow'); });
      if (definition && definition.empty) cards = [];
      const stateCounts = cards.reduce(function (counts, card) {
        const toggle = card.querySelector('[data-aut-map-toggle], [data-aut-workflow-state]');
        const state = toggle && toggle.dataset.state ? toggle.dataset.state : 'off';
        counts[state] = (counts[state] || 0) + 1;
        return counts;
      }, { on: 0, off: 0, draft: 0 });
      const count = stageCard.querySelector('.aut-map-count');
      const stageStatus = stageCard.querySelector('.aut-map-status');
      if (count) count.textContent = cards.length + ' Automation' + (cards.length === 1 ? '' : 's');
      if (stageStatus) {
        const parts = [];
        if (stateCounts.on) parts.push(stateCounts.on + ' Active');
        if (stateCounts.off) parts.push(stateCounts.off + ' Inactive');
        if (stateCounts.draft) parts.push(stateCounts.draft + ' Needs setup');
        stageStatus.textContent = parts.join(' · ') || (definition && definition.empty ? 'Add an Automation' : 'None added');
      }
      stageCard.classList.toggle('has-no-custom-automations', Boolean(definition && definition.custom && !cards.length));
    });
  }

  function syncDynamicWorkflowsToMap(definition) {
    const map = document.getElementById('autSemanticMap');
    if (!map || !definition) return;
    syncAutomationPipelineStagesToMap();
    map.querySelectorAll('[data-aut-dynamic-workflow], .aut-map-lead-summary').forEach(function (node) { node.remove(); });
    map.querySelectorAll('.aut-map-automation:not(.aut-map-dynamic-workflow)').forEach(function (card) {
      if (card.querySelector('.aut-map-company-scope')) return;
      const subtitle = Array.from(card.children).find(function (child) { return child.tagName === 'SPAN'; });
      if (subtitle) subtitle.insertAdjacentHTML('afterend', automationMapCompanyScopeMarkup({ companyScopeMode: 'all', companyScopeIds: [] }));
    });
    map.querySelectorAll('.aut-map-stage').forEach(function (stage) { stage.classList.remove('has-no-custom-automations'); });
    const keys = workflowsForAutomationGroup(selectedAutomationGroupKey);
    keys.forEach(function (workflowKey) {
      const config = workflows[workflowKey];
      if (!config.automationGroupKey) config.automationGroupKey = selectedAutomationGroupKey;
      const stageName = workflowStageName(config);
      let host = null;
      if (stageName === 'Lead') {
        const lead = map.querySelector('.aut-map-lead');
        if (lead) {
          host = lead.querySelector('.aut-map-automations');
          if (!host) {
            host = document.createElement('div');
            host.className = 'aut-map-automations aut-map-dynamic-host';
            lead.appendChild(host);
          }
        }
      } else {
        const stage = Array.from(map.querySelectorAll('.aut-map-stage')).find(function (card) {
          const title = card.querySelector('header strong');
          return (config.triggerStageId && card.dataset.autStageId === config.triggerStageId) ||
            (title && title.textContent.trim() === stageName);
        });
        if (stage) host = stage.querySelector('.aut-map-automations');
      }
      if (host) host.insertAdjacentHTML('beforeend', dynamicWorkflowCardMarkup(workflowKey, config));
    });
    syncAutomationCustomRequirementTransitions(keys);
    if (definition.custom) {
      definition.empty = keys.length === 0;
      definition.automations = keys.length;
      definition.rules = keys.reduce(function (total, workflowKey) {
        const config = workflows[workflowKey];
        return total + 2 + (Number(config.waitDays) > 0 ? 1 : 0);
      }, 0);
      map.querySelectorAll('.aut-map-stage').forEach(function (stage) {
        const dynamicCount = stage.querySelectorAll('[data-aut-dynamic-workflow]').length;
        stage.classList.toggle('has-no-custom-automations', dynamicCount === 0);
      });
    } else {
      definition.automations = (definition.baseAutomations || 10) + keys.length;
      definition.rules = (definition.baseRules || definition.rules || 0) + keys.reduce(function (total, workflowKey) {
        return total + 2 + (Number(workflows[workflowKey].waitDays) > 0 ? 1 : 0);
      }, 0);
    }
    prepareAutomationMapStageCards(definition);
    syncAutomationMapStageSummaries(definition);
    const lead = map.querySelector('.aut-map-lead');
    if (lead) {
      const leadKeys = keys.filter(function (workflowKey) { return workflowStageName(workflows[workflowKey]) === 'Lead'; });
      if (leadKeys.length) {
        lead.insertAdjacentHTML('beforeend', '<span class="aut-map-lead-summary">' + leadKeys.length + ' Automation' + (leadKeys.length === 1 ? '' : 's') + ' · ' + leadKeys.filter(function (key) { return workflows[key].enabled; }).length + ' Active</span>');
      }
    }
  }

  function syncWorkflowWithPipelineMap(config) {
    if (!config || config.protected) return;
    const groupKey = workflowAutomationGroupKey(config);
    config.automationGroupKey = groupKey;
    const definition = automationGroupDefinitions[groupKey];
    if (!definition) return;
    selectedAutomationGroupKey = groupKey;
    syncDynamicWorkflowsToMap(definition);
    persistAutomationState();
    persistAutomationGroupState();
    renderAutomationGroupRows();
    document.getElementById('autSemanticMap').dispatchEvent(new CustomEvent('aut-group-applied'));
  }

  function applyAutomationGroupToMap(key) {
    const definition = automationGroupDefinitions[key] || automationGroupDefinitions.standard;
    selectedAutomationGroupKey = key in automationGroupDefinitions ? key : 'standard';
    const pipeline = automationGroupPipeline();
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    if (definition.custom) {
      const counts = automationGroupStateCounts(definition);
      definition.status = counts.on ? 'active' : 'inactive';
      definition.empty = (counts.on + counts.off + counts.draft) === 0;
    }
    const title = document.getElementById('autPipelineDetailTitle');
    const status = document.getElementById('autGroupMapStatus');
    title.textContent = definition.pipelineId ? (pipeline.name + ' Automations') : definition.name;
    status.textContent = definition.status === 'active' ? 'Active' : 'Inactive';
    status.className = definition.status === 'active' ? 'active' : '';
    const detailCopy = pipelineDetail.querySelector('.aut-pipeline-detail-title p');
    if (detailCopy) {
      if (!quoteConnected) detailCopy.textContent = definition.empty
        ? 'Fully Custom Pipeline · choose any Stage and add its first Automation.'
        : 'Fully Custom Pipeline · every Stage has its own independent Automations and shared CRM block library.';
      else detailCopy.textContent = definition.empty
        ? 'Blank setup · protected Quote lifecycle stages remain available · 0 Automations added.'
        : 'Complete Pipeline setup · protected Quote lifecycle events continue to control protected Stage movement.';
    }
    const detailEyebrow = pipelineDetail.querySelector('.aut-pipeline-detail-title .aut-pipeline-eyebrow');
    if (detailEyebrow) detailEyebrow.textContent = pipeline.name + ' / Automation';
    const zeroState = document.getElementById('autPipelineZeroState');
    const zeroTitle = document.getElementById('autPipelineZeroTitle');
    const zeroCopy = document.getElementById('autPipelineZeroCopy');
    if (zeroState) zeroState.hidden = !definition.empty;
    if (zeroTitle) zeroTitle.textContent = 'Create the first Automation for ' + pipeline.name;
    if (zeroCopy) {
      zeroCopy.textContent = quoteConnected
        ? 'Choose a Pipeline Stage, then use its supported Starts when, Rules and Actions. Protected Quote lifecycle movement stays controlled by Quote events.'
        : 'Choose any Stage, then use the shared CRM Starts when, Rules and Actions. Every Stage keeps its own independent Automation.';
    }
    const backButton = document.getElementById('autPipelineBack');
    if (backButton) backButton.setAttribute('aria-label', 'Back from ' + pipeline.name + ' Automations');
    const lifecycleExceptions = pipelineDetail.querySelector('.aut-lifecycle-exceptions');
    if (lifecycleExceptions) lifecycleExceptions.hidden = !quoteConnected;
    pipelineDetail.classList.toggle('empty-automation-group', Boolean(definition.empty));
    pipelineDetail.classList.toggle('custom-automation-group', Boolean(definition.custom));
    document.querySelectorAll('#autSemanticMap .aut-map-stage').forEach(function (stageCard) {
      const stageName = stageCard.querySelector('header strong').textContent.trim();
      let addButton = stageCard.querySelector('.aut-map-stage-add');
      if (!addButton) {
        addButton = document.createElement('button');
        addButton.className = 'aut-map-stage-add';
        addButton.type = 'button';
        addButton.dataset.autStageAdd = stageName;
        addButton.innerHTML = '<i class="fai">&#xf067;</i> Add automation';
        addButton.setAttribute('aria-label', 'Add Automation for ' + stageName);
        const status = stageCard.querySelector('.aut-map-status');
        if (status) status.insertAdjacentElement('afterend', addButton);
        else stageCard.appendChild(addButton);
      }
      let emptyState = stageCard.querySelector('.aut-map-empty-stage');
      if (!emptyState) {
        emptyState = document.createElement('div');
        emptyState.className = 'aut-map-empty-stage';
        emptyState.innerHTML = '<span><i class="fai">&#xf0e7;</i><strong>No Automations yet</strong><small>Use + Add automation for ' + escapeAutomationHtml(stageName) + '.</small></span>';
        stageCard.appendChild(emptyState);
      }
      if (!definition.empty) return;
      const count = stageCard.querySelector('.aut-map-count');
      const stageStatus = stageCard.querySelector('.aut-map-status');
      if (count) count.textContent = '0 Automations';
      if (stageStatus) stageStatus.textContent = 'None added';
    });
    document.querySelectorAll('#autSemanticMap [data-aut-map-concept]').forEach(function (titleButton) {
      const conceptKey = titleButton.dataset.autMapConcept;
      const nextState = definition.states[conceptKey] || 'off';
      const toggle = titleButton.closest('.aut-map-automation').querySelector('[data-aut-map-toggle]');
      toggle.dataset.state = nextState;
      toggle.textContent = nextState === 'on' ? 'Active' : (nextState === 'draft' ? 'Needs setup' : 'Inactive');
      if (conceptAutomationDefinitions[conceptKey]) conceptAutomationDefinitions[conceptKey].status = nextState === 'on' ? 'Active' : (nextState === 'draft' ? 'Needs setup' : 'Inactive');
      document.querySelectorAll('[data-aut-concept="' + conceptKey + '"] em').forEach(function (em) {
        em.textContent = nextState === 'on' ? 'Active' : (nextState === 'draft' ? 'Needs setup' : 'Inactive');
        em.classList.toggle('on', nextState === 'on');
      });
    });
    const qualifiedCard = Array.from(document.querySelectorAll('#autSemanticMap .aut-map-stage')).find(function (card) {
      const heading = card.querySelector('header strong');
      return heading && heading.textContent.trim() === 'Qualified';
    });
    if (qualifiedCard) {
      const staleHighValue = qualifiedCard.querySelector('[data-aut-map-concept="high-value"]');
      if (staleHighValue) staleHighValue.closest('.aut-map-automation').remove();
    }
    syncDynamicWorkflowsToMap(definition);
    if (definition.custom) {
      const refreshedCounts = automationGroupStateCounts(definition);
      definition.status = refreshedCounts.on ? 'active' : 'inactive';
      status.textContent = definition.status === 'active' ? 'Active' : 'Inactive';
      status.className = definition.status === 'active' ? 'active' : '';
    }
    pipelineDetail.classList.toggle('empty-automation-group', Boolean(definition.empty));
    document.getElementById('autSemanticMap').dispatchEvent(new CustomEvent('aut-group-applied'));
    if (definition.empty) {
      document.querySelectorAll('#autSemanticMap .aut-map-stage').forEach(function (stageCard) {
        const count = stageCard.querySelector('.aut-map-count');
        const stageStatus = stageCard.querySelector('.aut-map-status');
        if (count) count.textContent = '0 Automations';
        if (stageStatus) stageStatus.textContent = 'Add an Automation';
      });
    }
    renderConceptAutomation(selectedConceptAutomation);
    renderAutomationGroupListView();
    persistAutomationGroupState();
    renderAutomationGroupRows();
  }

  function automationPipelineHubLifecycleMarkup(pipeline) {
    const stages = automationPipelineStages(pipeline);
    if (!stages.length) return '<span class="aut-pipeline-life muted" role="cell"><b>No Stages yet</b></span>';
    return '<span class="aut-pipeline-life' + (automationPipelineUsesQuoteLifecycle(pipeline) ? '' : ' muted') + '" role="cell">' + stages.map(function (stage, index) {
      const tone = stage.outcome ? ' outcome' : (!stage.protected ? ' custom' : '');
      return (index ? '<i>→</i>' : '') + '<b class="' + tone.trim() + '">' + escapeAutomationHtml(stage.name) + '</b>';
    }).join('') + '</span>';
  }

  function renderAutomationPipelineHub() {
    const table = document.getElementById('autPipelineTable');
    if (!table) return;
    table.querySelectorAll('.aut-pipeline-row').forEach(function (row) { row.remove(); });
    const activePipeline = typeof getActivePipeline === 'function' ? getActivePipeline() : null;
    const totalGroups = salesAutomationGroupKeys().length;
    automationPipelines().forEach(function (pipeline) {
      const isSalesPipeline = pipeline.id === 'sales-pipeline';
      const workflowKeys = userWorkflowKeys().filter(function (key) {
        return workflows[key] && workflows[key].triggerPipelineId === pipeline.id;
      });
      const total = isSalesPipeline ? totalGroups : workflowKeys.length;
      const active = isSalesPipeline
        ? (activeAutomationGroupKey ? 1 : 0)
        : workflowKeys.filter(function (key) { return workflows[key].enabled; }).length;
      const inactive = Math.max(0, total - active);
      const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
      const row = document.createElement('button');
      row.type = 'button';
      row.className = 'aut-pipeline-row' + (activePipeline && activePipeline.id === pipeline.id ? ' primary' : '');
      row.setAttribute('role', 'row');
      row.dataset.autPipelineOpen = pipeline.id;
      row.innerHTML = '<span class="aut-pipeline-name" role="cell"><i class="fai">' + (quoteConnected ? '&#xf0ae;' : '&#xf542;') + '</i><span><strong>' + escapeAutomationHtml(pipeline.name) + '</strong><small>' + (quoteConnected ? 'Related Quote lifecycle · protected Deal stages and outcomes' : 'Fully Custom Deal Pipeline · customer-defined Stage flow') + '</small></span></span>' +
        automationPipelineHubLifecycleMarkup(pipeline) +
        '<span class="aut-pipeline-count' + (total ? '' : ' zero') + '" role="cell"><strong>' + total + '</strong><small>' + (total ? (active + ' active · ' + inactive + ' inactive') : 'No Automations') + '</small></span>' +
        '<span class="aut-pipeline-open" aria-hidden="true">Open <i class="fai">&#xf054;</i></span>';
      table.appendChild(row);
    });
  }

  function showAutomationPipelineHub() {
    setAutomationBuilderFocusMode(false);
    setAutomationFocusMode(false);
    automationView.classList.remove('aut-builder-mode');
    automationView.classList.add('aut-pipeline-mode');
    pipelineHub.hidden = false;
    pipelineGroups.hidden = true;
    pipelineDetail.hidden = true;
    renderAutomationPipelineHub();
    updateAutomationPageContext('hub');
    closeStepMenu();
  }

  function showAutomationGroupList() {
    setAutomationBuilderFocusMode(false);
    setAutomationFocusMode(false);
    automationView.classList.remove('aut-builder-mode');
    automationView.classList.add('aut-pipeline-mode');
    pipelineHub.hidden = true;
    pipelineGroups.hidden = false;
    pipelineDetail.hidden = true;
    activeGroupFilter = 'all';
    const groupSearch = document.getElementById('autGroupSearch');
    if (groupSearch) groupSearch.value = '';
    updateAutomationPageContext('groups');
    renderAutomationGroupRows();
    closeStepMenu();
  }

  window.openCurrentPipelineAutomations = function () {
    const pipeline = typeof getActivePipeline === 'function' ? getActivePipeline() : automationPipelineById('sales-pipeline');
    openAutomationPipelineWorkspace(pipeline);
  };
  window.openSalesPipelineAutomations = window.openCurrentPipelineAutomations;

  function showAutomationPipelineDetail(groupKey) {
    setAutomationBuilderFocusMode(false);
    setAutomationFocusMode(true);
    automationView.classList.remove('aut-builder-mode');
    automationView.classList.add('aut-pipeline-mode');
    pipelineHub.hidden = true;
    pipelineGroups.hidden = true;
    pipelineDetail.hidden = false;
    setAutomationGroupEditMode(false);
    setAutomationGroupView('map');
    applyAutomationGroupToMap(groupKey || selectedAutomationGroupKey);
    updateAutomationPageContext('detail');
  }

  function closeAutomationGroupPreview() {
    document.getElementById('autGroupPreviewOverlay').hidden = true;
    pendingAutomationGroupChange = null;
  }

  function openAutomationGroupPreview(targetKey, mode) {
    const before = activeAutomationGroupKey ? automationGroupDefinitions[activeAutomationGroupKey] : null;
    const after = targetKey ? automationGroupDefinitions[targetKey] : null;
    if (targetKey && !after) return;
    const action = mode || (targetKey === activeAutomationGroupKey ? 'preview' : 'activate');
    pendingAutomationGroupChange = { targetKey: targetKey || null, action: action };
    const title = document.getElementById('autGroupPreviewTitle');
    const copy = document.getElementById('autGroupPreviewCopy');
    const confirm = document.getElementById('autGroupPreviewConfirm');
    title.textContent = action === 'deactivate' ? 'Turn off the Active Automation?' : (action === 'activate' ? 'Switch the Active Automation?' : 'Preview Automation');
    copy.textContent = action === 'deactivate' ? 'New Pipeline events will stop entering user Automations.' : (action === 'activate' ? 'Review exactly what changes before the new Automation receives events.' : 'Review the full Pipeline setup without changing what is Active.');
    document.getElementById('autGroupBeforeName').textContent = before ? before.name : 'No Active Automation';
    document.getElementById('autGroupAfterName').textContent = after ? after.name : 'No Active Automation';
    document.getElementById('autGroupBeforeStages').innerHTML = automationGroupStageMarkup();
    document.getElementById('autGroupAfterStages').innerHTML = automationGroupStageMarkup();
    document.getElementById('autGroupBeforeRules').innerHTML = automationGroupRuleMarkup(before);
    document.getElementById('autGroupAfterRules').innerHTML = automationGroupRuleMarkup(after);
    renderAutomationSwitchMaps(before, after);
    const automationDelta = after ? after.automations - (before ? before.automations : 0) : -(before ? before.automations : 0);
    const ruleDelta = after ? after.rules - (before ? before.rules : 0) : -(before ? before.rules : 0);
    document.getElementById('autGroupSummary').innerHTML =
      '<span><strong>' + (automationDelta > 0 ? '+' : '') + automationDelta + '</strong>Automation change</span>' +
      '<span><strong>' + (ruleDelta > 0 ? '+' : '') + ruleDelta + '</strong>Rule change</span>' +
      '<span><strong>' + (after ? after.affectedStages : 7) + '</strong>Stages covered</span>' +
      '<span><strong>0</strong>Core stages changed</span>';
    const salesImpact = after ? after.salesImpact : [['43', 'Open Deals remain manual'], ['0', 'Automated approvals'], ['0', 'Automated follow-ups'], [before ? '12' : '0', 'Existing runs unchanged']];
    document.getElementById('autGroupSalesImpact').innerHTML = salesImpact.map(function (impact) { return '<span><strong>' + escapeAutomationHtml(impact[0]) + '</strong>' + escapeAutomationHtml(impact[1]) + '</span>'; }).join('');
    confirm.textContent = action === 'deactivate' ? 'Turn off Active Automation' : (action === 'activate' ? 'Activate this Automation' : 'View Automation');
    document.getElementById('autGroupPreviewOverlay').hidden = false;
    requestAnimationFrame(function () {
      syncAutomationSwitchMinimap('before');
      syncAutomationSwitchMinimap('after');
    });
  }

  function applyAutomationGroupPreview() {
    if (!pendingAutomationGroupChange) return;
    const change = pendingAutomationGroupChange;
    if (change.action === 'deactivate') {
      if (activeAutomationGroupKey) automationGroupDefinitions[activeAutomationGroupKey].status = 'inactive';
      activeAutomationGroupKey = null;
      closeAutomationGroupPreview();
      persistAutomationGroupState();
      renderAutomationGroupRows();
      showAutomationToast('All user Automations are Inactive. The protected Pipeline lifecycle remains active.');
      return;
    }
    if (change.action === 'activate') {
      if (activeAutomationGroupKey) automationGroupDefinitions[activeAutomationGroupKey].status = 'inactive';
      activeAutomationGroupKey = change.targetKey;
      automationGroupDefinitions[change.targetKey].status = 'active';
      selectedAutomationGroupKey = change.targetKey;
      closeAutomationGroupPreview();
      persistAutomationGroupState();
      renderAutomationGroupRows();
      showAutomationPipelineDetail(change.targetKey);
      showAutomationToast(automationGroupDefinitions[change.targetKey].name + ' is Active. Existing runs keep their original setup; new events use this one.');
      return;
    }
    const targetKey = change.targetKey;
    closeAutomationGroupPreview();
    showAutomationPipelineDetail(targetKey);
  }

  function conceptStepMarkup(step) {
    if (step[0] === 'branches') {
      return '<div class="aut-mini-branches"><span><b>YES</b>' + escapeAutomationHtml(step[2].replace(/^YES · /, '')) + '</span><span><b>NO</b>' + escapeAutomationHtml(step[3].replace(/^NO · /, '')) + '</span></div>';
    }
    return '<div class="aut-mini-node ' + step[0] + '"><small>' + escapeAutomationHtml(step[1]) + '</small><strong>' + escapeAutomationHtml(step[2]) + '</strong><span>' + escapeAutomationHtml(step[3]) + '</span></div>';
  }

  function renderConceptAutomation(key) {
    const definition = conceptAutomationDefinitions[key] || conceptAutomationDefinitions['first-action'];
    selectedConceptAutomation = key in conceptAutomationDefinitions ? key : 'first-action';
    document.querySelectorAll('[data-aut-concept]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.autConcept === selectedConceptAutomation);
    });
    const flow = definition.steps.map(function (step, index) {
      return (index ? '<i class="fai">&#xf061;</i>' : '') + conceptStepMarkup(step);
    }).join('');
    conceptPreview.innerHTML =
      '<div class="aut-concept-preview-head"><div><span class="aut-pipeline-eyebrow">Selected Automation</span><h3>' + escapeAutomationHtml(definition.title) + '</h3><p><b>Business outcome:</b> ' + escapeAutomationHtml(definition.outcome) + '</p></div><span class="aut-concept-status' + (definition.status === 'Active' ? ' on' : '') + '">' + escapeAutomationHtml(definition.status) + '</span></div>' +
      '<div class="aut-concept-scope"><span><small>PIPELINE</small><b>Sales Pipeline</b></span><i class="fai">&#xf061;</i><span><small>STARTS AT</small><b>' + escapeAutomationHtml(definition.start) + '</b></span><i class="fai">&#xf061;</i><span><small>ENDS WHEN</small><b>' + escapeAutomationHtml(definition.end) + '</b></span></div>' +
      automationCompanyScopeDetailMarkup(definition, 'This Organisation-level Automation enrols matching records from every Owning Company.') +
      '<div class="aut-concept-flow">' + flow + '</div>' +
      '<div class="aut-concept-note"><i class="fai">&#xf0eb;</i><span><strong>Important:</strong> ' + escapeAutomationHtml(definition.note) + '</span></div>' +
      '<div class="aut-concept-actions"><button class="aut-btn primary" type="button" id="autConceptEditButton"><i class="fai">&#xf303;</i> Edit automation</button></div>';
  }

  function renderConceptSimulation() {
    const definition = conceptAutomationDefinitions[selectedConceptAutomation];
    const existing = conceptPreview.querySelector('.aut-concept-simulation');
    if (existing) { existing.remove(); return; }
    const simulation = document.createElement('section');
    simulation.className = 'aut-concept-simulation';
    simulation.innerHTML = '<div><small>BEFORE AUTOMATION</small><strong>Record is at ' + escapeAutomationHtml(definition.start) + '</strong><span>The required outcome has not happened yet.</span>' + automationCompanyScopeBeforeAfterMarkup(definition) + '</div><i class="fai">&#xf061;</i><div class="after"><small>AFTER AUTOMATION</small><strong>' + escapeAutomationHtml(definition.end) + '</strong><span>' + escapeAutomationHtml(definition.outcome) + '</span>' + automationCompanyScopeBeforeAfterMarkup(definition) + '</div><footer><b>Simulated timeline</b><span>09:00 Trigger matched</span><span>09:01 Rule checked</span><span>09:02 Matching branch continued</span><span>09:03 CRM action recorded</span></footer>';
    conceptPreview.querySelector('.aut-concept-actions').before(simulation);
  }

  function createConceptWorkflowDraft() {
    const definition = conceptAutomationDefinitions[selectedConceptAutomation];
    normalizeAutomationCompanyScope(definition);
    const action = function (name, owner, detail) { return { type: 'action', action: name, owner: owner, detail: detail }; };
    const note = function (title, mention, body, followUpDelay) {
      return {
        type: 'action', action: 'Create Note', noteTitle: title, noteBody: body,
        mention: mention, followUpDelay: followUpDelay || 'today', followUpTime: '17:00',
        owner: mention, detail: 'Mention ' + mention + ' · ' + ((followUpDelay || 'today') === 'today' ? 'Follow up today' : 'Follow up in 1 working day'),
        completionMode: 'optional'
      };
    };
    let objectType = 'Deal';
    let trigger = { title: 'Deal enters ' + definition.start, detail: 'Sales Pipeline · protected Quotation lifecycle' };
    let steps = [];
    if (selectedConceptAutomation === 'proposal') {
      steps = [
        action('Client qualification', 'Deal owner', 'Confirm pre-Quote requirements'),
        { type: 'condition', condition: 'Site Visit required?', yesSteps: [action('Complete Site Visit', 'Deal owner', 'Capture required site information'), action('Create Quote', 'Deal owner', 'Empty · In Progress · Not sent'), action('Develop SOW', 'Deal owner', 'Runs while Quote is In Progress'), action('Technical Review', 'Engineering Team', 'Runs when Quote is In Review')], noSteps: [action('Create Quote', 'Deal owner', 'Empty · In Progress · Not sent'), action('Develop SOW', 'Deal owner', 'Runs while Quote is In Progress'), action('Technical Review', 'Engineering Team', 'Runs when Quote is In Review')] }
      ];
    } else if (selectedConceptAutomation === 'first-action') {
      steps = [{ type: 'condition', condition: 'No open Deal Next Action exists', yesSteps: [{ type: 'action', action: 'Set Deal Next Action', owner: 'Deal owner', nextActionType: 'customer-followup', nextActionTitle: 'Follow up newly Qualified Deal', nextActionDueDays: 1, nextActionDueUnit: 'working-days', nextActionPolicy: 'replace-if-overdue' }], noSteps: [] }];
    } else if (selectedConceptAutomation === 'inactivity') {
      steps = [{ type: 'wait', days: 7 }, { type: 'condition', condition: 'Stage is Qualified AND no recent activity exists', yesSteps: [note('Qualified inactivity follow-up', 'Deal owner', 'Follow up this Qualified Deal because no recent sales activity was found.', '1-working-day')], noSteps: [] }];
    } else if (selectedConceptAutomation === 'high-value') {
      steps = [{ type: 'condition', condition: 'Quote value > £25,000 OR discount > 15%', yesSteps: [note('High-value approval required', 'Alex Osei', 'Review the Quote value and discount before it is sent.', 'today')], noSteps: [] }];
    } else if (selectedConceptAutomation === 'sent-follow-up') {
      objectType = 'Quote';
      trigger = { title: 'Quote enters Sent', detail: 'Sales Pipeline · first send of each revision' };
      steps = [{ type: 'wait', days: 3 }, { type: 'condition', condition: 'Quote is still Sent AND has not Expired', yesSteps: [note('Sent Quote customer follow-up', 'Deal owner', 'Follow up with the customer about this viable Sent Quote.', 'today')], noSteps: [] }];
    } else if (selectedConceptAutomation === 'quote-build') {
      objectType = 'Quote';
      trigger = { title: 'Quote is edited in In Progress', detail: 'Sales Pipeline · editable Quote' };
      steps = [{ type: 'condition', condition: 'Required pricing data is missing', yesSteps: [note('Quote information needs attention', 'Quote owner', 'Complete required products, prices and commercial fields on this Quote.', 'today')], noSteps: [] }];
    } else if (selectedConceptAutomation === 'internal-review') {
      objectType = 'Quote';
      trigger = { title: 'Quote enters In Review', detail: 'Quote-review organisations only' };
      steps = [{
        type: 'condition',
        condition: 'No open technical review Note exists',
        yesSteps: [{
          type: 'action', action: 'Create Note', noteTitle: 'Technical review required',
          noteBody: 'Review this Quote against the technical and internal review policy, then record the decision in Quote Review.',
          mention: 'Jeff Mitchel', followUpDelay: 'today', followUpTime: '17:00',
          owner: 'Jeff Mitchel', detail: 'Mention Jeff Mitchel · Follow up today', completionMode: 'optional'
        }],
        noSteps: []
      }];
    } else if (selectedConceptAutomation === 'ready-send') {
      objectType = 'Quote';
      trigger = { title: 'Quote enters Passed Review', detail: 'Sales Pipeline · reviewed Quote' };
      steps = [{ type: 'condition', condition: 'Review passed AND Quote remains valid', yesSteps: [note('Quote is ready to send', 'Quote owner', 'The reviewed Quote is viable and complete. Review it before sending.', 'today')], noSteps: [note('Ready-to-send check needs attention', 'Quote owner', 'Resolve the failed viability or customer-facing content check.', 'today')] }];
    } else if (selectedConceptAutomation === 'expiry-reminder') {
      objectType = 'Quote';
      trigger = { title: 'Sent Quote approaches expiry', detail: 'Date-based trigger' };
      steps = [{ type: 'condition', condition: 'Expiry date is 3 days away AND Quote remains viable', yesSteps: [note('Quote expiry follow-up', 'Deal owner', 'Follow up with the customer before this viable Sent Quote expires.', 'today')], noSteps: [] }];
    } else if (selectedConceptAutomation === 'accepted-handoff') {
      objectType = 'Quote';
      trigger = { title: 'Any relevant Quote becomes Accepted', detail: 'Protected Deal outcome = Won' };
      steps = [{ type: 'condition', condition: 'Deposit is required', yesSteps: [note('Accepted Quote finance handoff', 'Alex Osei', 'Prepare the required deposit workflow for this accepted Quote.', 'today')], noSteps: [note('Won Deal handoff', 'Deal owner', 'Continue the accepted-work handoff without a deposit request.', 'today')] }];
    } else {
      objectType = 'Deal';
      trigger = { title: 'Deal becomes Lost', detail: 'No viable related Quote remains' };
      steps = [{ type: 'condition', condition: 'Loss reason is missing', yesSteps: [note('Loss reason required', 'Deal owner', 'Record why this opportunity was lost.', 'today')], noSteps: [] }];
    }
    draftCounter += 1;
    const key = 'concept-' + selectedConceptAutomation + '-' + draftCounter;
    workflows[key] = {
      kind: 'scratch', objectType: objectType, title: definition.title, enabled: false,
      editableDraft: true, templateKey: 'concept-' + selectedConceptAutomation,
      triggerKind: objectType === 'Quote' ? 'quote-sent' : 'deal-stage',
      triggerPipelineId: 'sales-pipeline', triggerStage: definition.start, stageLocked: true,
      companyScopeMode: definition.companyScopeMode,
      companyScopeIds: definition.companyScopeIds.slice(),
      automationGroupKey: selectedAutomationGroupKey || activeAutomationGroupKey || 'standard',
      editableTrigger: trigger, steps: steps
    };
    repairUnsupportedReviewActions(workflows[key]);
    repairCreateQuoteActions(workflows[key]);
    repairWorkflowStageAlignment(workflows[key]);
    normalizeScratchTree(workflows[key]);
    activeWorkflowKey = key;
    activeNode = 'scratch-trigger';
    persistAutomationState();
    updateWorkflowList();
    showActiveAutomation();
    updateCanvas();
    renderInspector(activeNode);
    resetJourney();
    showAutomationToast(definition.title + ' copied as an Inactive editable Automation.');
  }

  function setupSemanticAutomationMap() {
    const map = document.getElementById('autSemanticMap');
    if (!map || map.dataset.ready === 'true') return;
    map.dataset.ready = 'true';
    const canvas = document.getElementById('autMapCanvas');
    const board = document.getElementById('autMapBoard');
    const zoomOutput = document.getElementById('autMapZoom');
    const modeCopy = document.getElementById('autMapMode');
    const moreButton = document.getElementById('autMapMore');
    const optionsMenu = document.getElementById('autMapOptionsMenu');
    const pauseAllButton = document.getElementById('autMapPauseAll');
    const pauseResumeButton = document.getElementById('autPipelinePauseResume');
    const overlay = document.getElementById('autMapImpactOverlay');
    const impactTitle = document.getElementById('autMapImpactTitle');
    const impactSubtitle = document.getElementById('autMapImpactSubtitle');
    const currentTitle = document.getElementById('autMapCurrentTitle');
    const currentCopy = document.getElementById('autMapCurrentCopy');
    const afterTitle = document.getElementById('autMapAfterTitle');
    const afterCopy = document.getElementById('autMapAfterCopy');
    const runsLabel = document.getElementById('autMapRunsLabel');
    const confirmButton = document.getElementById('autMapImpactConfirm');
    const detailOverlay = document.getElementById('autMapDetailOverlay');
    const detailTitle = document.getElementById('autMapDetailTitle');
    const detailStatus = document.getElementById('autMapDetailStatus');
    const detailOutcome = document.getElementById('autMapDetailOutcome');
    const detailBody = document.getElementById('autMapDetailBody');
    const zoomAnchors = { overview: 35, medium: 60, detail: 100 };
    const modeCopies = { overview: 'Overview · Stages, Automation counts and status', medium: 'Automations · names, status and transition events', detail: 'Rules · gates, transition events and system results' };
    let currentZoom = 100;
    let pendingImpact = null;
    let pipelinePaused = false;
    let pausedAutomationTitles = new Set();
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragScrollLeft = 0;
    let dragScrollTop = 0;

    function activeMapDefinition() {
      return automationGroupDefinitions[selectedAutomationGroupKey] || null;
    }

    function syncPipelinePauseControl() {
      const definition = activeMapDefinition();
      pipelinePaused = Boolean(definition && definition.pipelinePaused);
      pausedAutomationTitles = new Set(definition && Array.isArray(definition.pausedAutomationTitles) ? definition.pausedAutomationTitles : []);
      pauseAllButton.textContent = pipelinePaused ? 'Resume all user Automations' : 'Pause all user Automations';
      if (!pauseResumeButton) return;
      pauseResumeButton.classList.toggle('is-running', !pipelinePaused);
      pauseResumeButton.classList.toggle('is-paused', pipelinePaused);
      pauseResumeButton.setAttribute('aria-label', pipelinePaused ? 'Automations paused. Resume user Automations' : 'Automations running. Pause user Automations');
      pauseResumeButton.innerHTML = pipelinePaused
        ? '<i class="fai">&#xf04b;</i><span><strong>Paused</strong><small>Resume automations</small></span>'
        : '<i class="fai">&#xf04c;</i><span><strong>Running</strong><small>Pause automations</small></span>';
    }

    function centerMapOnPipeline() {
      board.style.paddingTop = '50px';
      requestAnimationFrame(function () {
        const scale = currentZoom === 0 ? .15 : currentZoom / 100;
        const visualHeight = board.getBoundingClientRect().height;
        const extraTop = Math.max(0, (canvas.clientHeight - visualHeight) / 2);
        board.style.paddingTop = (50 + (extraTop / Math.max(scale, .15))) + 'px';
        requestAnimationFrame(function () {
          canvas.scrollLeft = Math.max(0, (canvas.scrollWidth - canvas.clientWidth) / 2);
          canvas.scrollTop = 0;
        });
      });
    }

    function semanticLevel(percent) {
      if (percent < 55) return 'overview';
      if (percent < 80) return 'medium';
      return 'detail';
    }

    function displayMapCounts() {
      map.querySelectorAll('.aut-map-stage').forEach(function (stage) {
        if (pipelineDetail.classList.contains('empty-automation-group')) {
          const emptyCount = stage.querySelector('.aut-map-count');
          const emptyStatus = stage.querySelector('.aut-map-status');
          if (emptyCount) {
            emptyCount.dataset.fullText = '0 Automations';
            emptyCount.textContent = currentZoom < 25 ? '0' : '0 Automations';
          }
          if (emptyStatus) emptyStatus.textContent = 'None added';
          return;
        }
        const stateSelector = pipelineDetail.classList.contains('custom-automation-group')
          ? '[data-aut-workflow-state]'
          : '[data-aut-map-toggle], [data-aut-workflow-state]';
        const states = Array.from(stage.querySelectorAll(stateSelector)).map(function (toggle) { return toggle.dataset.state; });
        const on = states.filter(function (state) { return state === 'on'; }).length;
        const draft = states.filter(function (state) { return state === 'draft'; }).length;
        const off = states.filter(function (state) { return state === 'off'; }).length;
        const count = stage.querySelector('.aut-map-count');
        const fullText = states.length + ' Automation' + (states.length === 1 ? '' : 's');
        if (count) {
          count.dataset.fullText = fullText;
          count.textContent = currentZoom < 25 ? String(states.length) : fullText;
        }
        const parts = [];
        if (on) parts.push(on + ' Active');
        if (draft) parts.push(draft + ' Needs setup');
        if (off) parts.push(off + ' Inactive');
        const status = stage.querySelector('.aut-map-status');
        if (status) status.textContent = parts.length ? parts.join(' · ') : 'None added';
      });
    }

    function setMapZoom(percent, anchorX, anchorY, preservePoint) {
      const x = typeof anchorX === 'number' ? anchorX : canvas.clientWidth / 2;
      const y = typeof anchorY === 'number' ? anchorY : canvas.clientHeight / 2;
      const shouldPreserve = preservePoint !== false;
      const oldScale = currentZoom === 0 ? .15 : currentZoom / 100;
      const requestedZoom = Number(percent);
      const nextZoom = requestedZoom < 1 ? 0 : Math.max(0, Math.min(500, requestedZoom));
      // 0% is a usable Fit-to-overview state, not a literal zero scale.
      const nextScale = nextZoom === 0 ? .15 : nextZoom / 100;
      const worldX = (canvas.scrollLeft + x) / oldScale;
      const worldY = (canvas.scrollTop + y) / oldScale;
      const level = semanticLevel(nextZoom);
      currentZoom = nextZoom;
      map.dataset.level = level;
      map.dataset.density = currentZoom < 25 ? 'micro' : 'normal';
      map.style.setProperty('--aut-map-title-scale', String(.69 / nextScale));
      map.style.setProperty('--aut-map-count-scale', String(.9 / nextScale));
      map.style.setProperty('--aut-map-status-scale', String(.9 / nextScale));
      map.style.setProperty('--aut-map-title-top', (10 / nextScale) + 'px');
      map.style.setProperty('--aut-map-count-top', (34 / nextScale) + 'px');
      map.style.setProperty('--aut-map-status-top', (64 / nextScale) + 'px');
      board.style.gap = currentZoom < 25 ? Math.max(28, (78 / nextScale) - 270) + 'px' : '28px';
      board.style.zoom = (currentZoom === 0 ? 15 : currentZoom).toFixed(2) + '%';
      zoomOutput.textContent = Math.round(currentZoom) + '%';
      modeCopy.textContent = modeCopies[level];
      map.querySelectorAll('[data-aut-map-preset]').forEach(function (button) { button.setAttribute('aria-pressed', String(Number(button.dataset.autMapPreset) === zoomAnchors[level])); });
      map.querySelector('[data-aut-map-zoom="out"]').disabled = currentZoom <= 0;
      map.querySelector('[data-aut-map-zoom="in"]').disabled = currentZoom >= 500;
      map.querySelectorAll('.aut-map-automations').forEach(function (group) { group.inert = level === 'overview'; });
      displayMapCounts();
      if (shouldPreserve) requestAnimationFrame(function () {
        canvas.scrollLeft = worldX * nextScale - x;
        canvas.scrollTop = worldY * nextScale - y;
      });
    }

    function closeImpact() {
      overlay.hidden = true;
      pendingImpact = null;
    }

    function closeAutomationDetail() {
      detailOverlay.hidden = true;
    }

    function setAutomationDetailStatus(state) {
      if (!detailStatus) return;
      detailStatus.textContent = state === 'on' ? 'Active' : (state === 'draft' ? 'Needs setup' : 'Inactive');
      detailStatus.className = 'aut-map-detail-status' + (state === 'off' ? ' inactive' : (state === 'draft' ? ' setup' : ''));
    }

    function toggleMapDetailSimulation() {
      const definition = conceptAutomationDefinitions[selectedConceptAutomation];
      const existing = detailBody.querySelector('.aut-concept-simulation');
      if (existing) { existing.remove(); return; }
      const simulation = document.createElement('section');
      simulation.className = 'aut-concept-simulation';
      simulation.innerHTML = '<div><small>BEFORE AUTOMATION</small><strong>Record is at ' + escapeAutomationHtml(definition.start) + '</strong><span>The required outcome has not happened yet.</span>' + automationCompanyScopeBeforeAfterMarkup(definition) + '</div><i class="fai">&#xf061;</i><div class="after"><small>AFTER AUTOMATION</small><strong>' + escapeAutomationHtml(definition.end) + '</strong><span>' + escapeAutomationHtml(definition.outcome) + '</span>' + automationCompanyScopeBeforeAfterMarkup(definition) + '</div><footer><b>Simulated timeline</b><span>09:00 Trigger matched</span><span>09:01 Rule checked</span><span>09:02 Matching branch continued</span><span>09:03 CRM action recorded</span></footer>';
      detailBody.querySelector('.aut-concept-actions').before(simulation);
    }

    function openAutomationDetail(key) {
      const definition = conceptAutomationDefinitions[key] || conceptAutomationDefinitions['first-action'];
      selectedConceptAutomation = key in conceptAutomationDefinitions ? key : 'first-action';
      const mapTitleControl = map.querySelector('[data-aut-map-concept="' + selectedConceptAutomation + '"]');
      const stateControl = mapTitleControl && mapTitleControl.closest('.aut-map-automation').querySelector('[data-aut-map-toggle]');
      const state = stateControl ? stateControl.dataset.state : (definition.status === 'Active' ? 'on' : (definition.status === 'Needs setup' ? 'draft' : 'off'));
      renderConceptAutomation(selectedConceptAutomation);
      const flow = definition.steps.map(function (step, index) {
        return (index ? '<i class="fai">&#xf061;</i>' : '') + conceptStepMarkup(step);
      }).join('');
      detailTitle.textContent = definition.title;
      setAutomationDetailStatus(state);
      detailOutcome.innerHTML = '<b>What it does:</b> ' + escapeAutomationHtml(definition.outcome);
      detailBody.innerHTML =
        '<div class="aut-concept-scope"><span><small>PIPELINE</small><b>Sales Pipeline</b></span><i class="fai">&#xf061;</i><span><small>STARTS AT</small><b>' + escapeAutomationHtml(definition.start) + '</b></span><i class="fai">&#xf061;</i><span><small>ENDS WHEN</small><b>' + escapeAutomationHtml(definition.end) + '</b></span></div>' +
        automationCompanyScopeDetailMarkup(definition, 'This Automation applies to matching records from every Owning Company.') +
        '<div class="aut-concept-flow">' + flow + '</div>' +
        '<div class="aut-concept-note"><i class="fai">&#xf0eb;</i><span><strong>How to read this:</strong> ' + escapeAutomationHtml(definition.note) + '</span></div>' +
        '<div class="aut-concept-actions"><button class="aut-btn aut-detail-history" type="button" id="autMapDetailHistory"><i class="fai">&#xf1da;</i> Change history</button><button class="aut-btn" type="button" id="autMapDetailState"' + (state === 'draft' ? ' disabled' : '') + '><i class="fai">' + (state === 'on' ? '&#xf04c;' : '&#xf04b;') + '</i> ' + (state === 'on' ? 'Turn off' : (state === 'draft' ? 'Complete setup first' : 'Turn on')) + '</button><button class="aut-btn primary" type="button" id="autMapDetailDraft"><i class="fai">&#xf303;</i> Edit automation</button></div>';
      detailBody.querySelector('#autMapDetailHistory').addEventListener('click', function () {
        showAutomationToast('Change history records saved edits and every Active / Inactive status change.');
      });
      detailBody.querySelector('#autMapDetailState').addEventListener('click', function () {
        closeAutomationDetail();
        openAutomationImpact(definition.title, state);
      });
      detailBody.querySelector('#autMapDetailDraft').addEventListener('click', function () {
        closeAutomationDetail();
        createConceptWorkflowDraft();
      });
      detailOverlay.hidden = false;
    }

    openDynamicAutomationPreview = function (workflowKey) {
      const config = workflows[workflowKey];
      if (!config) return;
      const trigger = scratchTriggerText(config);
      const stage = workflowStageName(config);
      const state = config.enabled ? 'on' : (workflowNeedsSetup(config) ? 'draft' : 'off');
      detailTitle.textContent = config.title || 'Untitled Automation';
      setAutomationDetailStatus(state);
      detailOutcome.innerHTML = '<b>What it does:</b> ' + escapeAutomationHtml(config.actionName || 'Runs the saved business outcome for matching records.');
      detailBody.innerHTML =
        '<div class="aut-concept-scope"><span><small>PIPELINE</small><b>Sales Pipeline</b></span><i class="fai">&#xf061;</i><span><small>STARTS AT</small><b>' + escapeAutomationHtml(stage) + '</b></span><i class="fai">&#xf061;</i><span><small>START EVENT</small><b>' + escapeAutomationHtml(trigger.title) + '</b></span></div>' +
        automationCompanyScopeDetailMarkup(config) +
        '<div class="aut-dynamic-detail-rules">' + dynamicWorkflowRuleMarkup(config) + '</div>' +
        '<div class="aut-concept-note"><i class="fai">&#xf05a;</i><span><strong>How to read this:</strong> Stage controls where the Automation belongs. Company scope controls which records can enter it.</span></div>' +
        '<div class="aut-concept-actions"><button class="aut-btn aut-detail-history" type="button" id="autMapDynamicHistory"><i class="fai">&#xf1da;</i> Change history</button><button class="aut-btn" type="button" id="autMapDynamicState"' + (state === 'draft' ? ' disabled' : '') + '><i class="fai">' + (state === 'on' ? '&#xf04c;' : '&#xf04b;') + '</i> ' + (state === 'on' ? 'Turn off' : (state === 'draft' ? 'Complete setup first' : 'Turn on')) + '</button><button class="aut-btn primary" type="button" id="autMapDynamicEdit"><i class="fai">&#xf303;</i> Edit automation</button></div>';
      detailBody.querySelector('#autMapDynamicHistory').addEventListener('click', function () {
        showAutomationToast('Change history records saved edits and every Active / Inactive status change.');
      });
      detailBody.querySelector('#autMapDynamicState').addEventListener('click', function () {
        closeAutomationDetail();
        openDynamicAutomationImpact(workflowKey);
      });
      detailBody.querySelector('#autMapDynamicEdit').addEventListener('click', function () {
        closeAutomationDetail();
        const workflowButton = automationView.querySelector('[data-aut-workflow="' + workflowKey + '"]');
        if (workflowButton) workflowButton.click();
      });
      detailOverlay.hidden = false;
    };

    function setAutomationState(title, state) {
      map.querySelectorAll('[data-aut-map-title]').forEach(function (titleButton) {
        if (titleButton.dataset.autMapTitle !== title) return;
        const toggle = titleButton.closest('.aut-map-automation').querySelector('[data-aut-map-toggle]');
        toggle.dataset.state = state;
        toggle.textContent = state === 'on' ? 'Active' : (state === 'draft' ? 'Needs setup' : 'Inactive');
        const conceptKey = titleButton.dataset.autMapConcept;
        if (conceptAutomationDefinitions[conceptKey]) conceptAutomationDefinitions[conceptKey].status = state === 'on' ? 'Active' : (state === 'draft' ? 'Needs setup' : 'Inactive');
        if (automationGroupDefinitions[selectedAutomationGroupKey]) automationGroupDefinitions[selectedAutomationGroupKey].states[conceptKey] = state;
        document.querySelectorAll('[data-aut-concept="' + conceptKey + '"] em').forEach(function (em) {
          em.textContent = state === 'on' ? 'Active' : (state === 'draft' ? 'Needs setup' : 'Inactive');
          em.classList.toggle('on', state === 'on');
        });
      });
      displayMapCounts();
      persistAutomationGroupState();
      renderAutomationGroupRows();
      if (conceptAutomationDefinitions[selectedConceptAutomation] && conceptAutomationDefinitions[selectedConceptAutomation].title === title) renderConceptAutomation(selectedConceptAutomation);
    }

    function openAutomationImpact(title, state) {
      const turningOn = state !== 'on';
      pendingImpact = { type: 'automation', title: title, nextState: turningOn ? 'on' : 'off' };
      impactTitle.textContent = (turningOn ? 'Turn on ' : 'Turn off ') + title + '?';
      impactSubtitle.textContent = 'Review the behaviour change before confirming.';
      currentTitle.textContent = state === 'on' ? 'Automation is Active' : (state === 'draft' ? 'Automation needs setup' : 'Automation is Inactive');
      currentCopy.textContent = state === 'on' ? 'Matching records enrol and saved actions run automatically.' : 'No new matching records enrol.';
      afterTitle.textContent = turningOn ? 'Automation is Active' : 'Automation is Inactive';
      afterCopy.textContent = turningOn ? 'Future matching records will follow the saved conditions, waits and actions.' : 'New matching records will not enrol or run automated actions.';
      runsLabel.hidden = turningOn;
      confirmButton.textContent = turningOn ? 'Turn on' : 'Turn off';
      overlay.hidden = false;
    }

    function openDynamicAutomationImpact(workflowKey) {
      const config = workflows[workflowKey];
      if (!config) return;
      const state = config.enabled ? 'on' : (workflowNeedsSetup(config) ? 'draft' : 'off');
      if (state === 'draft') {
        showAutomationToast('Complete setup and run a safe test before this Automation can be turned on.');
        return;
      }
      const turningOn = state !== 'on';
      if (turningOn && !config.lastTestedAt) {
        showAutomationToast('Open Edit automation and run a safe Before / After test before the first activation.');
        return;
      }
      pendingImpact = { type: 'workflow', workflowKey: workflowKey, nextState: turningOn ? 'on' : 'off' };
      impactTitle.textContent = (turningOn ? 'Turn on ' : 'Turn off ') + (config.title || 'Automation') + '?';
      impactSubtitle.textContent = 'Compare the operational effect before confirming this status change.';
      currentTitle.textContent = state === 'on' ? 'Automation is Active' : 'Automation is Inactive';
      currentCopy.textContent = state === 'on' ? 'Matching records inside ' + automationCompanyScopeLabel(config) + ' enrol automatically.' : 'No new matching records enrol.';
      afterTitle.textContent = turningOn ? 'Automation is Active' : 'Automation is Inactive';
      afterCopy.textContent = turningOn ? 'The last tested and published version will receive future matching records.' : 'New matching records will skip this Automation; protected Quote lifecycle events continue.';
      runsLabel.hidden = turningOn;
      confirmButton.textContent = turningOn ? 'Turn on' : 'Turn off';
      overlay.hidden = false;
    }

    function openPipelineImpact() {
      pendingImpact = { type: 'pipeline', nextState: pipelinePaused ? 'on' : 'off' };
      impactTitle.textContent = pipelinePaused ? 'Resume all user Automations?' : 'Pause all user Automations?';
      impactSubtitle.textContent = 'This changes user Automations across the Sales Pipeline.';
      currentTitle.textContent = pipelinePaused ? 'User Automations are paused' : 'User Automations are running';
      currentCopy.textContent = pipelinePaused ? 'No new records enter paused Automations.' : 'Active Automations enrol matching records normally.';
      afterTitle.textContent = pipelinePaused ? 'User Automations resume' : 'All Active Automations are paused';
      afterCopy.textContent = pipelinePaused ? 'Future matching records can enrol again.' : 'Inactive Automations stay Inactive; protected Quote lifecycle logic remains active.';
      runsLabel.hidden = pipelinePaused;
      confirmButton.textContent = pipelinePaused ? 'Resume all' : 'Pause all';
      overlay.hidden = false;
    }

    function applyImpact() {
      if (!pendingImpact) return;
      if (pendingImpact.type === 'automation') {
        setAutomationState(pendingImpact.title, pendingImpact.nextState);
      } else if (pendingImpact.type === 'workflow') {
        const workflowKey = pendingImpact.workflowKey;
        const config = workflows[workflowKey];
        const turningOn = pendingImpact.nextState === 'on';
        if (!config) { closeImpact(); return; }
        if (turningOn && automationCompanyScopeConflicts(config).length) {
          closeImpact();
          showAutomationToast('Turn on blocked: this Company scope overlaps an Active Automation with the same outcome.');
          return;
        }
        if (!turningOn && !config.lastTestedAt) config.lastTestedAt = 'Previously published';
        config.enabled = turningOn;
        ensureAutomationHistory(workflowKey).unshift({
          actor: 'Candy',
          time: 'Just now',
          title: turningOn ? 'Turned on' : 'Turned off',
          changes: [(turningOn ? 'Activated' : 'Deactivated') + ' the last published Automation version']
        });
        persistAutomationState();
        syncWorkflowWithPipelineMap(config);
        showAutomationToast(config.title + (turningOn ? ' is now Active.' : ' is now Inactive. Protected Quote lifecycle events continue.'));
      } else if (pendingImpact.nextState === 'off') {
        pausedAutomationTitles = new Set();
        map.querySelectorAll('[data-aut-map-toggle]').forEach(function (toggle) {
          if (toggle.dataset.state !== 'on') return;
          toggle.dataset.beforePause = 'on';
          const title = toggle.closest('.aut-map-automation').querySelector('[data-aut-map-title]').dataset.autMapTitle;
          pausedAutomationTitles.add(title);
          setAutomationState(title, 'off');
        });
        pipelinePaused = true;
        const definition = activeMapDefinition();
        if (definition) {
          definition.pipelinePaused = true;
          definition.pausedAutomationTitles = Array.from(pausedAutomationTitles);
        }
      } else {
        const definition = activeMapDefinition();
        const titles = new Set(definition && Array.isArray(definition.pausedAutomationTitles) ? definition.pausedAutomationTitles : Array.from(pausedAutomationTitles));
        map.querySelectorAll('[data-aut-map-toggle][data-before-pause="on"]').forEach(function (toggle) {
          titles.add(toggle.closest('.aut-map-automation').querySelector('[data-aut-map-title]').dataset.autMapTitle);
          delete toggle.dataset.beforePause;
        });
        titles.forEach(function (title) { setAutomationState(title, 'on'); });
        pipelinePaused = false;
        pausedAutomationTitles = new Set();
        if (definition) {
          definition.pipelinePaused = false;
          definition.pausedAutomationTitles = [];
        }
      }
      persistAutomationGroupState();
      syncPipelinePauseControl();
      closeImpact();
    }

    map.querySelectorAll('[data-aut-map-preset]').forEach(function (button) { button.addEventListener('click', function () { setMapZoom(button.dataset.autMapPreset); }); });
    map.addEventListener('aut-group-applied', function () {
      displayMapCounts();
      syncPipelinePauseControl();
      centerMapOnPipeline();
    });
    map.addEventListener('aut-map-center', centerMapOnPipeline);
    map.querySelector('[data-aut-map-zoom="out"]').addEventListener('click', function () {
      setMapZoom(currentZoom <= 20 ? 0 : currentZoom - (currentZoom <= 100 ? 20 : (currentZoom <= 200 ? 35 : 60)));
    });
    map.querySelector('[data-aut-map-zoom="in"]').addEventListener('click', function () {
      setMapZoom(currentZoom === 0 ? 20 : currentZoom + (currentZoom < 100 ? 20 : (currentZoom < 200 ? 35 : 60)));
    });
    moreButton.addEventListener('click', function () { optionsMenu.hidden = !optionsMenu.hidden; });
    pauseAllButton.addEventListener('click', function () { optionsMenu.hidden = true; openPipelineImpact(); });
    if (pauseResumeButton) pauseResumeButton.addEventListener('click', openPipelineImpact);
    map.addEventListener('click', function (event) {
      const workflowState = event.target.closest('[data-aut-workflow-state]');
      if (workflowState) {
        openDynamicAutomationImpact(workflowState.dataset.autWorkflowState);
        return;
      }
      const workflowCard = event.target.closest('[data-aut-map-workflow]');
      if (workflowCard) {
        if (pipelineDetail.dataset.mode === 'edit') {
          const workflowButton = automationView.querySelector('[data-aut-workflow="' + workflowCard.dataset.autMapWorkflow + '"]');
          if (workflowButton) workflowButton.click();
        } else if (openDynamicAutomationPreview) openDynamicAutomationPreview(workflowCard.dataset.autMapWorkflow);
        return;
      }
      const stageAdd = event.target.closest('[data-aut-stage-add],[data-aut-empty-add]');
      if (stageAdd) {
        const stageName = stageAdd.dataset.autStageAdd || stageAdd.dataset.autEmptyAdd;
        openStageAutomationCreator(stageName, true, 'templates', stageAdd.dataset.autPipelineId || null);
        return;
      }
      const toggle = event.target.closest('[data-aut-map-toggle]');
      if (toggle) {
        const title = toggle.closest('.aut-map-automation').querySelector('[data-aut-map-title]').dataset.autMapTitle;
        openAutomationImpact(title, toggle.dataset.state);
        return;
      }
      const concept = event.target.closest('[data-aut-map-concept]');
      if (concept) {
        openAutomationDetail(concept.dataset.autMapConcept);
      }
    });
    canvas.addEventListener('wheel', function (event) {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const zoomBase = currentZoom === 0 ? 15 : currentZoom;
      setMapZoom(zoomBase * Math.exp(-event.deltaY * .0032), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    canvas.addEventListener('pointerdown', function (event) {
      if (event.target.closest('button')) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragScrollLeft = canvas.scrollLeft;
      dragScrollTop = canvas.scrollTop;
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      canvas.scrollLeft = dragScrollLeft - (event.clientX - dragStartX);
      canvas.scrollTop = dragScrollTop - (event.clientY - dragStartY);
    });
    canvas.addEventListener('pointerup', function () { dragging = false; });
    canvas.addEventListener('pointercancel', function () { dragging = false; });
    document.getElementById('autMapImpactClose').addEventListener('click', closeImpact);
    document.getElementById('autMapImpactCancel').addEventListener('click', closeImpact);
    confirmButton.addEventListener('click', applyImpact);
    overlay.addEventListener('click', function (event) { if (event.target === overlay) closeImpact(); });
    document.getElementById('autMapDetailClose').addEventListener('click', closeAutomationDetail);
    detailOverlay.addEventListener('click', function (event) { if (event.target === detailOverlay) closeAutomationDetail(); });
    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      optionsMenu.hidden = true;
      if (!overlay.hidden) closeImpact();
      if (!detailOverlay.hidden) closeAutomationDetail();
    });
    setMapZoom(60, canvas.clientWidth / 2, canvas.clientHeight / 2, false);
    syncPipelinePauseControl();
    centerMapOnPipeline();
  }

  function userWorkflowKeys() {
    return Object.keys(workflows).filter(function (key) { return !workflows[key].protected; });
  }

  function showAutomationZeroState() {
    activeWorkflowKey = null;
    automationView.classList.remove('aut-builder-mode');
    automationShell.classList.remove('is-builder');
    automationShell.classList.remove('has-block-library');
    closeStepMenu();
    builderEmpty.hidden = false;
    if (blockLibrary) blockLibrary.hidden = true;
    canvasPanel.hidden = true;
    automationInspector.hidden = true;
    if (flowSummaryPanel) flowSummaryPanel.hidden = true;
    summaryLabel.textContent = 'Start here:';
    plainSummary.textContent = 'Choose a recommended template. Nothing runs until you create a draft and turn it on.';
    updateWorkflowList();
    resetJourney();
    showAutomationPipelineHub();
  }

  function showActiveAutomation() {
    if (!activeConfig()) {
      showAutomationZeroState();
      return;
    }
    const enteringBuilder = !automationView.classList.contains('aut-builder-mode');
    automationView.classList.add('aut-builder-mode');
    setAutomationFocusMode(false);
    setAutomationBuilderFocusMode(true);
    automationView.classList.remove('aut-pipeline-mode');
    pipelineHub.hidden = true;
    pipelineDetail.hidden = true;
    automationShell.classList.add('is-builder');
    const showLibrary = !activeConfig().protected && hasEditableStepModel(activeConfig());
    automationShell.classList.toggle('has-block-library', showLibrary);
    builderEmpty.hidden = true;
    canvasPanel.hidden = false;
    if (flowSummaryPanel) flowSummaryPanel.hidden = false;
    if (flowSummaryPanel) flowSummaryPanel.scrollTop = 0;
    showAutomationBlockLibraryPane();
    summaryLabel.textContent = 'In plain English:';
    captureDraftSnapshot(false);
    updateAutomationPageContext('builder');
    syncAutomationEditorHeader(activeConfig());
    setAutomationSaveStatus(!automationHasUnsavedChanges());
    renderBlockLibrary();
    requestAnimationFrame(function () {
      setAutomationLibraryWidth(currentAutomationLibraryWidth(), false);
      if (enteringBuilder) showAutomationBlockLibraryPane();
    });
  }

  function isLeadConversion(config) {
    return config && config.kind === 'lead-conversion';
  }

  function isLeadWorkflow(config) {
    return config && config.objectType === 'Lead';
  }

  function isNewLeadWorkflow(config) {
    return config && config.kind === 'lead-new';
  }

  function newLeadTriggerText(config) {
    const source = config && config.leadTriggerSource ? config.leadTriggerSource : 'any';
    if (source === 'form') return { title: 'New Lead is submitted from a form', detail: 'Website or connected Lead form' };
    if (source === 'import') return { title: 'New Lead is imported', detail: 'Created through a Lead import' };
    if (source === 'manual') return { title: 'New Lead is added manually', detail: 'Created with + Create Lead' };
    return { title: 'New Lead is created', detail: 'Form, import or manual entry' };
  }

  function isInactiveLeadWorkflow(config) {
    return config && config.kind === 'lead-inactive';
  }

  function isQuoteWorkflow(config) {
    return config && config.kind === 'quote-sent';
  }

  function isWonHandoff(config) {
    return config && config.kind === 'won-handoff';
  }

  function isQuoteInvoice(config) {
    return config && config.kind === 'quote-invoice';
  }

  function isProposalApproval(config) {
    return config && config.kind === 'proposal-approval';
  }

  function isScratchWorkflow(config) {
    return config && config.kind === 'scratch';
  }

  function hasEditableStepModel(config) {
    return !!(config && (config.kind === 'scratch' || config.editableDraft === true));
  }

  const workflowBlockCatalog = [
    { id: 'trigger-new-lead', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'New Lead is created', detail: 'Form, import or manual entry', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf0a6;', objectType: 'Lead' },
    { id: 'trigger-deal-qualified', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal enters Qualified', detail: 'Deal is created or moves into Qualified', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf0a6;', objectType: 'Deal' },
    { id: 'trigger-deal-custom-stage', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal enters this Custom Stage', detail: 'A Deal moves into the selected customer-defined Stage', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf0a6;', objectType: 'Deal' },
    { id: 'trigger-deal-owner', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal Owner changes', detail: 'A specific Deal Owner is reassigned', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Deal Owner · New CRM', icon: '&#xf007;', objectType: 'Deal' },
    { id: 'trigger-next-action-due', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal Next Action becomes due', detail: 'The current Next Action is due or overdue', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf017;', objectType: 'Deal' },
    { id: 'trigger-expected-close', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Expected Close Date is approaching', detail: 'A configurable number of days before Expected Close', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf073;', objectType: 'Deal' },
    { id: 'trigger-deal-stage', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal enters a selected stage', detail: 'Watch one protected Pipeline stage', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf0a6;', objectType: 'Deal' },
    { id: 'trigger-deal-lost', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal becomes Lost', detail: 'No viable related Quote remains', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Derived outcome pattern', icon: '&#xf024;', objectType: 'Deal' },
    { id: 'trigger-quote-created', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'First related Quote is created', detail: 'Protected entry into In Progress', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Quote lifecycle pattern', icon: '&#xf15c;', objectType: 'Quote' },
    { id: 'trigger-quote-updated', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote is edited in In Progress', detail: 'Pricing, products or SOW data changes', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf044;', objectType: 'Quote' },
    { id: 'trigger-review-submitted', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote is submitted for internal review', detail: 'Protected entry into In Review', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Review event pattern', icon: '&#xf24e;', objectType: 'Quote' },
    { id: 'trigger-review-passed', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote becomes Passed Review', detail: 'Protected internal review result', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Review event pattern', icon: '&#xf058;', objectType: 'Quote' },
    { id: 'trigger-quote-accepted', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote is accepted', detail: 'Trusted online acceptance', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Accepted event proven', icon: '&#xf058;', objectType: 'Quote' },
    { id: 'trigger-quote-sent', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote is Sent', detail: 'First send of a Quote revision', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf1d8;', objectType: 'Quote' },
    { id: 'trigger-quote-viewed', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Customer views a Sent Quote', detail: 'A related Quote view flag turns on', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Quote viewed flag', icon: '&#xf06e;', objectType: 'Quote' },
    { id: 'trigger-related-quote-changed', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Related Quote changes', detail: 'A related Quote is created, edited, sent or accepted', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf15c;', objectType: 'Quote' },
    { id: 'trigger-quote-expiry', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote expiry is approaching', detail: 'Derived from Sent + expiry date', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Scheduler required', icon: '&#xf073;', objectType: 'Quote' },
    { id: 'trigger-note-follow-up', tab: 'trigger', group: 'CRM activity', type: 'trigger', label: 'Note follow-up time is reached', detail: 'Due or overdue follow-up item', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Task pattern proven', icon: '&#xf017;', objectType: 'Deal' },
    { id: 'trigger-meeting-change', tab: 'trigger', group: 'CRM activity', type: 'trigger', label: 'Meeting / Site Visit changes', detail: 'Scheduled, starts or completed', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf133;', objectType: 'Deal' },
    { id: 'trigger-file-added', tab: 'trigger', group: 'CRM activity', type: 'trigger', label: 'File is added to Deal', detail: 'A Deal-scoped file is uploaded', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf15b;', objectType: 'Deal' },
    { id: 'trigger-file-request-completed', tab: 'trigger', group: 'CRM activity', type: 'trigger', label: 'Requested file is received', detail: 'A required file request is completed', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf56f;', objectType: 'Deal' },
    { id: 'trigger-deal-data-changed', tab: 'trigger', group: 'Lead & Deal', type: 'trigger', label: 'Deal data changes', detail: 'Owner, Label, Interest, Value, Company or Expected Close changes', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf044;', objectType: 'Deal' },
    { id: 'trigger-deal-inactivity', tab: 'trigger', group: 'CRM activity', type: 'trigger', label: 'Deal has no activity for a set time', detail: 'A configurable number of inactive days', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf017;', objectType: 'Deal' },
    { id: 'trigger-review-note-changed', tab: 'trigger', group: 'Quote', type: 'trigger', label: 'Quote Review Note changes', detail: 'A technical review Note changes or becomes due', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf249;', objectType: 'Quote' },

    { id: 'action-create-note', tab: 'action', group: 'CRM activity', type: 'action', label: 'Create Note', detail: 'Create one CRM Note, mention one person and optionally set its follow-up', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf249;' },
    { id: 'action-schedule-meeting', tab: 'action', group: 'CRM activity', type: 'action', label: 'Schedule Meeting / Site Visit', detail: 'Attendees, date, time and duration', capability: 'new-crm', capabilityLabel: 'NEW CRM', icon: '&#xf133;' },
    { id: 'action-assign-deal-owner', tab: 'action', group: 'Ownership', type: 'action', label: 'Assign specific Deal Owner', detail: 'Set one named person as Deal Owner', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Single assignee proven on Quote', icon: '&#xf007;' },
    { id: 'action-assign-team', tab: 'action', group: 'Ownership · later', type: 'action', label: 'Assign Team', detail: 'Team ownership model is not proven', capability: 'future', capabilityLabel: 'FUTURE', icon: '&#xf0c0;', disabled: true },
    { id: 'action-round-robin', tab: 'action', group: 'Ownership · later', type: 'action', label: 'Round-robin assignment', detail: 'Eligibility, ordering and fallback are new', capability: 'future', capabilityLabel: 'FUTURE', icon: '&#xf2f1;', disabled: true },
    { id: 'action-create-quote', tab: 'action', group: 'Quote & CRM data', type: 'action', label: 'Create Quote', detail: 'Create an empty In Progress Quote linked to this Deal; nothing is sent', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf15c;' },
    { id: 'action-notify', tab: 'action', group: 'Quote & CRM data', type: 'action', label: 'Send internal notification', detail: 'Notify selected internal recipients', capability: 'connect', capabilityLabel: 'CONNECT', icon: '&#xf0f3;' },
    { id: 'action-add-quote-label', tab: 'action', group: 'Quote & CRM data', type: 'action', label: 'Add Quote Label', detail: 'Write an existing Quote label', capability: 'connect', capabilityLabel: 'CONNECT', proof: 'Pattern proven on Quote', icon: '&#xf02b;' },
    { id: 'action-add-deal-label', tab: 'action', group: 'Deal data', type: 'action', label: 'Add Deal label', detail: 'Add one existing CRM label without creating a duplicate', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Labels · New CRM', icon: '&#xf02b;' },
    { id: 'action-remove-deal-label', tab: 'action', group: 'Deal data', type: 'action', label: 'Remove Deal label', detail: 'Remove one existing CRM label when it is present', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Labels · New CRM', icon: '&#xf02b;' },
    { id: 'action-set-next-action', tab: 'action', group: 'Deal activity', type: 'action', label: 'Set Deal Next Action', detail: 'Set the one visible next task, owner and due date', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Focus · New CRM', icon: '&#xf0ae;' },
    { id: 'action-clear-next-action', tab: 'action', group: 'Deal activity', type: 'action', label: 'Clear Deal Next Action', detail: 'Clear the current Next Action when it is no longer required', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Focus · New CRM', icon: '&#xf00c;' },
    { id: 'action-add-watcher', tab: 'action', group: 'Deal people', type: 'action', label: 'Add Deal watcher', detail: 'Add one person as a follower without changing Deal Owner', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Watchers · New CRM', icon: '&#xf06e;' },
    { id: 'action-remove-watcher', tab: 'action', group: 'Deal people', type: 'action', label: 'Remove Deal watcher', detail: 'Stop one person following the Deal', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Watchers · New CRM', icon: '&#xf070;' },
    { id: 'action-add-interest', tab: 'action', group: 'Deal data', type: 'action', label: 'Add Interest', detail: 'Add one existing Interest without creating a duplicate', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Interests · New CRM', icon: '&#xf005;' },
    { id: 'action-remove-interest', tab: 'action', group: 'Deal data', type: 'action', label: 'Remove Interest', detail: 'Remove one Interest when it is present', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Interests · New CRM', icon: '&#xf056;' },
    { id: 'action-set-expected-close', tab: 'action', group: 'Deal data', type: 'action', label: 'Set Expected Close Date', detail: 'Set or move the approved Deal Expected Close field', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Expected Close · New CRM', icon: '&#xf073;' },
    { id: 'action-attach-deal-file', tab: 'action', group: 'CRM activity & files', type: 'action', label: 'Attach file to Deal', detail: 'Upload one Automation file, use a template or copy a related CRM file', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Files · New CRM', icon: '&#xf15b;' },
    { id: 'action-request-file', tab: 'action', group: 'CRM activity & files', type: 'action', label: 'Request a file', detail: 'Create a visible required-file activity with an owner and due date', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Deal Focus + Files · New CRM', icon: '&#xf56f;' },
    { id: 'action-move-deal-stage', tab: 'action', group: 'Pipeline', type: 'action', label: 'Move Deal to another Stage', detail: 'Choose one explicit target Stage; Pipeline reordering never silently changes it', capability: 'new-crm', capabilityLabel: 'NEW CRM', proof: 'Stage ID + Change history', icon: '&#xf061;' },

    { id: 'logic-condition', tab: 'logic', group: 'Flow control', type: 'condition', label: 'Rule', detail: 'Evaluate CRM data and follow the matching Yes or No path', capability: 'engine', capabilityLabel: 'ENGINE', icon: '&#xf126;' },
    { id: 'logic-and-or', tab: 'logic', group: 'Flow control', type: 'condition', label: 'AND / OR group', detail: 'Combine confirmed criteria', capability: 'engine', capabilityLabel: 'ENGINE', icon: '&#xf0e8;' },
    { id: 'logic-branches', tab: 'logic', group: 'Built automatically', type: 'generated', label: 'YES / NO branches', detail: 'Added automatically with a Rule', capability: 'engine', capabilityLabel: 'ENGINE', icon: '&#xf126;', disabled: true },
    { id: 'logic-else-if', tab: 'logic', group: 'Built automatically', type: 'generated', label: 'Else If', detail: 'Add another Rule inside a branch', capability: 'engine', capabilityLabel: 'ENGINE', icon: '&#xf126;', disabled: true },
    { id: 'logic-wait', tab: 'logic', group: 'Flow control', type: 'wait', label: 'Wait', detail: 'Calendar days, working days or date/time', capability: 'engine', capabilityLabel: 'ENGINE', proof: 'Scheduler required', icon: '&#xf017;' },
    { id: 'logic-end', tab: 'logic', group: 'Flow control', type: 'end', label: 'End branch', detail: 'Stop only this branch safely', capability: 'engine', capabilityLabel: 'ENGINE', icon: '&#xf28d;' },
    { id: 'logic-wait-event', tab: 'logic', group: 'Later', type: 'generated', label: 'Wait until event', detail: 'Needs subscription, timeout and retry', capability: 'future', capabilityLabel: 'FUTURE', icon: '&#xf2f2;', disabled: true },
    { id: 'logic-while', tab: 'logic', group: 'Later', type: 'generated', label: 'While loop', detail: 'Unbounded loops are outside Phase 1', capability: 'future', capabilityLabel: 'FUTURE', icon: '&#xf2f9;', disabled: true }
  ];

  function workflowBlock(blockId) {
    return workflowBlockCatalog.find(function (block) { return block.id === blockId; });
  }

  function automationActionBlockIdsForStage(config) {
    const definition = automationStageDefinition(workflowStageName(config), config && config.triggerPipelineId) || {};
    const generalDealActions = [
      'action-create-note', 'action-schedule-meeting', 'action-assign-deal-owner',
      'action-create-quote', 'action-notify', 'action-add-deal-label',
      'action-remove-deal-label', 'action-set-next-action', 'action-clear-next-action',
      'action-add-watcher', 'action-remove-watcher', 'action-add-interest',
      'action-remove-interest', 'action-set-expected-close', 'action-attach-deal-file',
      'action-request-file', 'action-move-deal-stage'
    ];
    if (definition.quoteConnected === false && definition.protectedOutcome) {
      return [
        'action-create-note', 'action-schedule-meeting', 'action-assign-deal-owner',
        'action-notify', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-add-interest', 'action-remove-interest',
        'action-set-expected-close', 'action-attach-deal-file', 'action-request-file'
      ];
    }
    if (definition.quoteConnected === false) return generalDealActions;

    const segment = definition.lifecycleSegment || definition.name || workflowStageName(config);
    const segmentActions = {
      Qualified: generalDealActions,
      'In Progress': [
        'action-create-note', 'action-assign-deal-owner', 'action-notify',
        'action-add-quote-label', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-add-interest', 'action-remove-interest',
        'action-set-expected-close', 'action-attach-deal-file', 'action-request-file',
        'action-move-deal-stage'
      ],
      'In Review': [
        'action-create-note', 'action-assign-deal-owner', 'action-notify',
        'action-add-quote-label', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-attach-deal-file', 'action-request-file',
        'action-move-deal-stage'
      ],
      'Passed Review': [
        'action-create-note', 'action-assign-deal-owner', 'action-notify',
        'action-add-quote-label', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-add-interest', 'action-remove-interest',
        'action-set-expected-close', 'action-attach-deal-file', 'action-request-file',
        'action-move-deal-stage'
      ],
      Sent: [
        'action-create-note', 'action-schedule-meeting', 'action-assign-deal-owner',
        'action-notify', 'action-add-quote-label', 'action-add-deal-label',
        'action-remove-deal-label', 'action-set-next-action', 'action-clear-next-action',
        'action-add-watcher', 'action-remove-watcher', 'action-add-interest',
        'action-remove-interest', 'action-set-expected-close', 'action-attach-deal-file',
        'action-request-file', 'action-move-deal-stage'
      ],
      Won: [
        'action-create-note', 'action-schedule-meeting', 'action-assign-deal-owner',
        'action-notify', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-add-interest', 'action-remove-interest',
        'action-set-expected-close', 'action-attach-deal-file', 'action-request-file'
      ],
      Lost: [
        'action-create-note', 'action-schedule-meeting', 'action-assign-deal-owner',
        'action-notify', 'action-add-deal-label', 'action-remove-deal-label',
        'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
        'action-remove-watcher', 'action-add-interest', 'action-remove-interest',
        'action-set-expected-close', 'action-attach-deal-file'
      ]
    };
    return segmentActions[segment] || generalDealActions;
  }

  function isWorkflowBlockCompatible(block, config) {
    if (!block || !config) return false;
    if (block.type === 'trigger') {
      if (config.objectType === 'Lead') return block.id === 'trigger-new-lead';
      const stage = automationStageDefinition(workflowStageName(config), config.triggerPipelineId);
      return !stage || stage.triggerBlockIds.includes(block.id);
    }
    if (block.type === 'action' && !block.disabled && automationActionBlockIdsForStage(config).indexOf(block.id) < 0) return false;
    if (block.id === 'action-move-deal-stage') {
      const stage = automationStageDefinition(workflowStageName(config), config.triggerPipelineId);
      return !!(stage && stage.custom && automationMoveStageTargets(config).length);
    }
    const objectType = String(config.objectType || '').toLowerCase();
    const relatedDealActions = [
      'action-assign-deal-owner', 'action-create-quote', 'action-add-deal-label',
      'action-remove-deal-label', 'action-attach-deal-file', 'action-request-file',
      'action-set-next-action', 'action-clear-next-action', 'action-add-watcher',
      'action-remove-watcher', 'action-add-interest', 'action-remove-interest', 'action-set-expected-close',
      'action-move-deal-stage'
    ];
    if (objectType === 'lead') {
      return !relatedDealActions.includes(block.id) && block.id !== 'action-add-quote-label';
    }
    // Quote and Billing events always enrol through their related Deal, so Deal-scoped
    // CRM actions remain available. This avoids hiding Files, Labels and Next Action
    // merely because the Stage starts from a Quote event.
    if (block.id === 'action-add-quote-label') {
      const stageDefinition = automationStageDefinition(workflowStageName(config), config.triggerPipelineId) || {};
      const segment = stageDefinition.lifecycleSegment || stageDefinition.name;
      return objectType === 'quote' || objectType === 'billing' ||
        (stageDefinition.quoteConnected && ['In Progress', 'In Review', 'Passed Review', 'Sent'].includes(segment));
    }
    if (relatedDealActions.includes(block.id)) return ['deal', 'quote', 'billing', 'invoice'].includes(objectType);
    return true;
  }

  function renderBlockLibrary() {
    if (!blockLibrary || !blockLibraryBody) return;
    const config = activeConfig();
    if (!config || config.protected || !hasEditableStepModel(config)) {
      blockLibrary.hidden = true;
      return;
    }
    blockLibrary.hidden = false;
    const query = (blockSearch ? blockSearch.value : '').trim().toLowerCase();
    const blocks = workflowBlockCatalog.filter(function (block) {
      return block.tab === activeLibraryTab && isWorkflowBlockCompatible(block, config) && (!query || (block.label + ' ' + block.detail + ' ' + block.group).toLowerCase().includes(query));
    });
    const groups = [];
    blocks.forEach(function (block) { if (!groups.includes(block.group)) groups.push(block.group); });
    blockLibrary.querySelectorAll('[data-aut-library-tab]').forEach(function (tab) {
      const active = tab.dataset.autLibraryTab === activeLibraryTab;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (libraryHelp) libraryHelp.textContent = activeLibraryTab === 'trigger'
      ? 'Only ' + workflowStageName(config) + '-compatible start events are shown. The Stage stays fixed.'
      : (activeLibraryTab === 'action'
        ? 'Choose a visible CRM result. Custom-to-Custom moves use an explicit Stage target; protected Quote milestones still use trusted lifecycle events.'
        : 'Rules create Yes / No branches. Required completion stays in Action settings.');
    blockLibraryBody.innerHTML = groups.map(function (group) {
      return '<section class="aut-library-group' + (group === 'CRM data' ? ' collapsed' : '') + '">' +
        '<button class="aut-library-group-head" type="button" data-aut-library-group><span>' + escapeAutomationHtml(group) + '</span><i class="fai">&#xf078;</i></button>' +
        '<div class="aut-library-group-items">' + blocks.filter(function (block) { return block.group === group; }).map(function (block) {
          const capabilityLabels = { 'new-crm': 'NEW CRM DATA', connect: 'NEEDS CONNECTION', engine: 'AUTOMATION ENGINE', future: 'FUTURE' };
          const capabilityLabel = capabilityLabels[block.capability] || block.capabilityLabel || 'NEEDS CONNECTION';
          return '<button class="aut-library-block' + (block.disabled ? ' is-unavailable' : '') + '" type="button" data-aut-block-id="' + block.id + '" data-aut-block-type="' + block.type + '" data-aut-library-tab-type="' + block.tab + '"' + (block.disabled ? ' disabled aria-disabled="true"' : '') + ' title="' + escapeAutomationHtml(block.disabled ? block.detail : 'Add ' + block.label) + '">' +
            '<span class="aut-library-block-icon"><i class="fai">' + block.icon + '</i></span><span class="aut-library-block-copy"><span class="aut-library-block-title"><strong>' + escapeAutomationHtml(block.label) + '</strong><em class="aut-capability ' + escapeAutomationHtml(block.capability || 'connect') + '">' + escapeAutomationHtml(capabilityLabel) + '</em></span><small>' + escapeAutomationHtml(block.detail) + '</small>' + (block.proof ? '<span class="aut-pattern-proof">EXISTING PATTERN · ' + escapeAutomationHtml(block.proof) + '</span>' : '') + '</span>' + (block.disabled ? '<i class="fai aut-library-block-lock">&#xf023;</i>' : '<i class="fai aut-library-block-grip">&#xf58e;</i>') + '</button>';
        }).join('') + '</div></section>';
    }).join('') || '<div class="aut-library-empty">No matching blocks. Try a shorter search.</div>';
  }

  function setScratchInsertionFromDrop(dropButton) {
    const config = activeConfig();
    scratchInsertIndex = Number(dropButton && dropButton.dataset.autInsert !== undefined ? dropButton.dataset.autInsert : (config && config.steps ? config.steps.length : 0));
    scratchInsertBranch = dropButton && dropButton.dataset.autBranch ? dropButton.dataset.autBranch : 'main';
    scratchConditionIndex = dropButton && dropButton.dataset.autCondition !== undefined ? Number(dropButton.dataset.autCondition) : -1;
    scratchInsertContainer = dropButton && dropButton.dataset.autContainer ? dropButton.dataset.autContainer : 'r';
  }

  function addWorkflowBlock(blockId, dropButton) {
    const config = activeConfig();
    const block = workflowBlock(blockId);
    if (!config || !block || !hasEditableStepModel(config)) return;
    if (block.disabled) {
      showAutomationToast(block.label + ' is classified as ' + block.capabilityLabel + ' and is not available in Phase 1.');
      return;
    }
    if (!isWorkflowBlockCompatible(block, config)) {
      showAutomationToast(block.label + ' needs compatible ' + (block.objectType || 'CRM') + ' data. Change the trigger first.');
      return;
    }
    if (block.type === 'trigger') {
      const stageDefinition = automationStageDefinition(workflowStageName(config), config.triggerPipelineId);
      const stageChoice = stageDefinition && stageDefinition.triggerChoices.find(function (choice) { return choice[0] === block.id; });
      const triggerTitle = stageChoice ? stageChoice[1] : block.label;
      const triggerDetail = stageChoice ? stageChoice[2] : block.detail;
      beginEditableDraftVersion(config);
      config.editableTrigger = { title: triggerTitle, detail: triggerDetail };
      config.triggerEvent = triggerTitle;
      if (stageChoice && stageChoice[4]) config.objectType = stageChoice[4];
      else if (block.objectType) config.objectType = block.objectType;
      config.eventSource = (stageChoice && stageChoice[4]) || block.objectType || config.objectType;
      activeNode = 'scratch-trigger';
      persistAutomationState();
      updateCanvas();
      renderInspector(activeNode);
      showAutomationToast('Start event changed to ' + triggerTitle + '. Review any incompatible steps before turning on.');
      return;
    }
    setScratchInsertionFromDrop(dropButton);
    if (block.type === 'end') {
      showAutomationToast('Every branch already ends safely after its final step.');
      return;
    }
    if (block.type === 'condition' || block.type === 'wait') {
      addScratchStep(block.type, scratchInsertBranch, scratchConditionIndex, block.label, scratchInsertContainer);
      return;
    }
    addScratchStep('action', scratchInsertBranch, scratchConditionIndex, block.label, scratchInsertContainer);
  }

  function editableNoteStep(config) {
    return {
      type: 'action',
      action: 'Create Note',
      noteTitle: config.actionName || 'CRM follow-up',
      noteBody: config.noteBody || 'Add the information needed to complete this CRM follow-up.',
      mention: config.mention || config.actionOwner || 'Record owner',
      followUpDelay: config.followUpDelay || 'today',
      followUpTime: config.followUpTime || '17:00',
      owner: config.mention || config.actionOwner || 'Record owner',
      detail: 'Mention ' + (config.mention || config.actionOwner || 'Record owner') + ' · ' + ((config.followUpDelay || 'today') === 'today' ? 'Follow up today' : 'Follow up in 1 working day'),
      completionMode: config.completionMode || 'optional',
      blockedEvent: config.completionMode === 'required' ? (config.blockedEvent || '') : ''
    };
  }

  function templateEditableStepModel(config) {
    if (!config || isLeadConversion(config)) return null;
    let trigger = { title: 'CRM event matched', detail: 'A matching future record starts this automation' };
    let steps = [];
    if (isProposalApproval(config)) {
      trigger = { title: 'Deal enters Qualified', detail: automationPipelineName(config) };
      steps = [
        { type: 'action', action: 'Client qualification', owner: 'Deal owner', detail: 'Due in 1 day' },
        { type: 'condition', condition: 'Site visit required?', noSteps: [{ type: 'action', action: 'Continue to Develop SOW', owner: 'Deal owner', detail: 'Site visit not required' }] },
        { type: 'action', action: 'Complete site visit', owner: 'Deal owner', detail: 'Capture site information' },
        { type: 'action', action: 'Develop SOW', owner: 'Deal owner', detail: 'Due in 2 working days' },
        { type: 'action', action: 'Technical review', owner: 'Engineering Team', detail: 'Approve or request changes · SLA 2 days' },
        { type: 'action', action: 'Create Quote', quoteName: '{{Deal title}} · Quote', quoteOwner: 'Deal owner', quoteExistingPolicy: 'skip-existing', owner: 'Deal owner', detail: 'Empty · In Progress · Not sent' },
        { type: 'action', action: 'Develop Proposal', owner: 'Deal owner', detail: 'Prepare commercial proposal' },
        { type: 'action', action: 'Internal approval', owner: 'Commercial Director', detail: 'Approve or request changes' },
        { type: 'action', action: 'Submit Proposal to Client', owner: 'Deal owner', detail: 'Move Deal to Sent' },
        { type: 'wait', days: 7 },
        { type: 'action', action: 'Client approval', owner: 'Deal owner', detail: 'Record accepted or changes requested' },
        { type: 'action', action: 'Request Deposit Invoice', owner: 'Finance Team', detail: 'After accepted commercial outcome' }
      ];
    } else if (isNewLeadWorkflow(config)) {
      const leadTrigger = newLeadTriggerText(config);
      trigger = leadTrigger;
      steps = [
        { type: 'action', action: 'Assign Lead owner', owner: config.assignmentOwner, detail: config.assignmentOwner },
        { type: 'condition', condition: config.condition, noSteps: [] },
        { type: 'action', action: 'Create Lead activity', owner: 'Lead owner', detail: leadActivityTypeLabel(config.activityType) + ' · Due today at ' + automationTimeLabel(config.actionTime) }
      ];
    } else if (isInactiveLeadWorkflow(config)) {
      trigger = { title: 'Open Lead has no next activity', detail: 'Active Leads in the inbox only' };
      steps = [
        { type: 'wait', days: config.waitDays },
        { type: 'condition', condition: config.condition, noSteps: [] },
        { type: 'action', action: config.actionName, owner: config.actionOwner, detail: 'Due ' + config.actionDue }
      ];
    } else if (config.templateKey === 'pre-quote-readiness') {
      trigger = { title: config.triggerEvent, detail: automationPipelineName(config) + ' · ' + config.triggerStage };
      steps = [
        {
          type: 'condition',
          condition: config.condition,
          noSteps: [],
          yesSteps: [{
            type: 'action',
            action: config.actionType || 'Create Note',
            noteTitle: config.actionName || 'Site readiness follow-up',
            noteBody: config.noteBody || 'Confirm the required Site Visit, customer details and site information before creating the first Quote.',
            mention: config.mention || config.actionOwner || 'Deal owner',
            followUpDelay: config.followUpDelay || '1-working-day',
            followUpTime: config.followUpTime || '17:00',
            owner: config.actionOwner || 'Deal owner',
            detail: 'Mention ' + (config.mention || config.actionOwner || 'Deal owner') + ' · Follow up in 1 working day',
            completionMode: config.completionMode || 'required',
            blockedEvent: config.blockedEvent || 'first-related-quote'
          }]
        }
      ];
    } else if (config.templateKey === 'qualified-owner-first-action') {
      trigger = { title: config.triggerEvent, detail: automationPipelineName(config) + ' · ' + config.triggerStage };
      steps = [{
        type: 'condition', condition: config.condition, noSteps: [],
        yesSteps: [
          { type: 'action', action: 'Set Deal Next Action', owner: config.actionOwner || 'Deal owner', nextActionType: config.nextActionType || 'customer-followup', nextActionTitle: config.nextActionTitle || 'Follow up newly Qualified Deal', nextActionDueDays: config.nextActionDueDays || 1, nextActionDueUnit: config.nextActionDueUnit || 'working-days', nextActionPolicy: 'replace-if-overdue' }
        ]
      }];
    } else if (config.customStageTemplate) {
      const stageName = config.triggerStage || 'Custom Stage';
      trigger = { title: 'Deal enters ' + stageName, detail: automationPipelineName(config) + ' · Custom Stage' };
      if (config.templateKey === 'custom-stage-required-files') {
        steps = [{
          type: 'condition', condition: 'Required file is missing', noSteps: [],
          yesSteps: [{ type: 'action', action: 'Request a file', fileRequestName: 'Site plans or drawings', fileRequestFrom: 'Primary Deal contact', fileRequestTypes: 'PDF, Word, Excel or image', fileRequestDueDays: 3, owner: 'Deal owner', completionMode: 'required', blockedEvent: defaultCompletionEvent(config) }]
        }];
      } else if (config.templateKey === 'custom-stage-inactivity') {
        steps = [
          { type: 'wait', days: 5 },
          { type: 'condition', condition: 'No new activity', noSteps: [], yesSteps: [{ type: 'action', action: 'Set Deal Next Action', nextActionTitle: 'Follow up inactive Deal', nextActionType: 'customer-followup', nextActionDueDays: 1, nextActionDueUnit: 'working-days', owner: 'Deal owner' }] }
        ];
      } else {
        steps = [{
          type: 'condition', condition: 'No open Deal Next Action exists', noSteps: [],
          yesSteps: [{ type: 'action', action: 'Set Deal Next Action', nextActionTitle: 'Complete the next ' + stageName + ' step', nextActionType: 'customer-followup', nextActionDueDays: 1, nextActionDueUnit: 'working-days', owner: 'Deal owner' }]
        }];
      }
    } else if (config.kind === 'stage-template') {
      trigger = { title: config.triggerEvent || defaultAutomationTriggerForStage(config.triggerStage, config.triggerPipelineId).title, detail: automationPipelineName(config) + ' · ' + config.triggerStage };
      if (config.waitDays) steps.push({ type: 'wait', days: config.waitDays });
      if (config.condition) steps.push({ type: 'condition', condition: config.condition, noSteps: [] });
      if (config.actionName) {
        if (config.actionType === 'Create Note') {
          steps.push(editableNoteStep(config));
        } else {
          steps.push({ type: 'action', action: config.actionName, owner: config.actionOwner || 'Record owner', detail: 'Due ' + (config.actionDue || 'Today') });
        }
      }
    } else if (isQuoteWorkflow(config)) {
      trigger = { title: 'Quote is sent', detail: 'First send of each Quote revision' };
      steps = [
        { type: 'wait', days: config.waitDays },
        { type: 'condition', condition: config.condition, noSteps: [] },
        config.actionType === 'Create Note' ? editableNoteStep(config) : { type: 'action', action: config.actionName, owner: config.actionOwner, detail: 'Due ' + config.actionDue }
      ];
    } else if (isWonHandoff(config)) {
      trigger = { title: 'Deal moves to ' + (config.triggerToStage || 'Won'), detail: automationPipelineName(config) };
      steps = [
        { type: 'condition', condition: config.condition, noSteps: [] },
        config.actionType === 'Create Note' ? editableNoteStep(config) : { type: 'action', action: config.actionName, owner: config.actionOwner, detail: 'Due ' + config.actionDue }
      ];
    } else if (isQuoteInvoice(config)) {
      trigger = { title: 'Quote is accepted', detail: 'Trusted acceptance event' };
      steps = [
        { type: 'condition', condition: config.condition, noSteps: [] },
        { type: 'action', action: config.actionName, owner: config.actionOwner, detail: config.depositPercent + '% · Draft only' }
      ];
    } else {
      trigger = { title: config.objectType + ' event matched', detail: config.triggerEvent || 'Custom CRM event' };
      if (config.waitDays) steps.push({ type: 'wait', days: config.waitDays });
      if (config.condition) steps.push({ type: 'condition', condition: config.condition, noSteps: [] });
      if (config.actionName) steps.push({ type: 'action', action: config.actionName, owner: config.actionOwner || 'Record owner' });
    }
    return { trigger: trigger, steps: steps };
  }

  function repairQualifiedNextActionTemplate(config) {
    if (!config || config.templateKey !== 'qualified-owner-first-action') return;
    config.title = String(config.title || '').replace('Qualified owner & first action', 'Qualified first Next Action');
    config.condition = 'No open Deal Next Action exists';
    config.actionType = 'Set Deal Next Action';
    config.actionName = 'Set Deal Next Action';
    config.nextActionType = config.nextActionType || 'customer-followup';
    config.nextActionTitle = config.nextActionTitle || 'Follow up newly Qualified Deal';
    config.nextActionDueDays = Math.max(1, Number(config.nextActionDueDays) || 1);
    config.nextActionDueUnit = config.nextActionDueUnit || 'working-days';
    if (Array.isArray(config.steps)) {
      const repaired = templateEditableStepModel(config);
      config.editableTrigger = repaired.trigger;
      config.steps = repaired.steps;
    }
  }

  function repairStaleReadinessTemplate(config) {
    if (!config || config.templateKey !== 'pre-quote-readiness' || !Array.isArray(config.steps)) return;
    let hasReadinessCondition = false;
    let hasUnrelatedLeadCondition = false;
    function inspect(sequence) {
      (Array.isArray(sequence) ? sequence : []).forEach(function (step) {
        if (!step) return;
        if (step.type === 'condition') {
          const label = String(step.condition || '').toLowerCase();
          if (label.includes('site visit') || label.includes('site information')) hasReadinessCondition = true;
          if (label.includes('no new activity') || label.includes('first-contact')) hasUnrelatedLeadCondition = true;
          inspect(step.yesSteps);
          inspect(step.noSteps);
        }
        if (step.type === 'action' && (step.action === 'Create human task' || String(step.taskTitle || '').toLowerCase().includes('site readiness'))) {
          step.action = 'Create Note';
          step.noteTitle = step.noteTitle || step.taskTitle || config.actionName || 'Site readiness follow-up';
          step.noteBody = step.noteBody || config.noteBody || 'Confirm the required Site Visit, customer details and site information before creating the first Quote.';
          step.mention = step.mention || step.owner || config.actionOwner || 'Deal owner';
          step.followUpDelay = step.followUpDelay || config.followUpDelay || '1-working-day';
          step.followUpTime = step.followUpTime || config.followUpTime || '17:00';
          step.detail = 'Mention ' + step.mention + ' · Follow up in 1 working day';
          delete step.taskTitle;
        }
      });
    }
    inspect(config.steps);
    config.actionType = 'Create Note';
    config.actionName = config.actionName || 'Site readiness follow-up';
    config.noteBody = config.noteBody || 'Confirm the required Site Visit, customer details and site information before creating the first Quote.';
    config.mention = config.mention || config.actionOwner || 'Deal owner';
    config.followUpDelay = config.followUpDelay || '1-working-day';
    config.followUpTime = config.followUpTime || '17:00';
    if (hasReadinessCondition && hasUnrelatedLeadCondition) {
      const repaired = templateEditableStepModel(config);
      config.editableTrigger = repaired.trigger;
      config.steps = repaired.steps;
    }
  }

  function repairUnsupportedReviewActions(config) {
    if (!config) return;
    const templateKey = String(config.templateKey || '');
    const isInternalReview = templateKey === 'internal-quote-review' || templateKey === 'concept-internal-review' || String(config.title || '').toLowerCase() === 'technical & internal review';
    if (!isInternalReview) return;

    config.actionType = 'Create Note';
    config.actionName = 'Technical review required';
    config.noteBody = 'Review this Quote against the technical and internal review policy, then record the decision in Quote Review.';
    config.mention = config.mention && !/team$/i.test(config.mention) ? config.mention : 'Jeff Mitchel';
    config.followUpDelay = config.followUpDelay || 'today';
    config.followUpTime = config.followUpTime || '17:00';
    config.actionOwner = config.mention;
    config.actionDue = 'Today';
    config.condition = 'No open technical review Note exists';

    function migrate(sequence) {
      (Array.isArray(sequence) ? sequence : []).forEach(function (step) {
        if (!step) return;
        if (step.type === 'condition') {
          if (/organisation uses quote review/i.test(String(step.condition || ''))) step.condition = config.condition;
          migrate(step.yesSteps);
          migrate(step.noSteps);
          return;
        }
        if (step.type !== 'action' || step.action === 'Assign specific Deal Owner') return;
        step.action = 'Create Note';
        step.noteTitle = 'Technical review required';
        step.noteBody = config.noteBody;
        step.mention = config.mention;
        step.followUpDelay = config.followUpDelay;
        step.followUpTime = config.followUpTime;
        step.owner = config.mention;
        step.detail = 'Mention ' + config.mention + ' · Follow up today';
        step.completionMode = 'optional';
        step.blockedEvent = '';
        delete step.taskTitle;
      });
    }
    migrate(config.steps);
  }

  function repairNoteBasedTemplateActions(config) {
    if (!config || !config.templateKey) return;
    const source = templateDefinitions[config.templateKey];
    if (!source || source.actionType !== 'Create Note') return;
    config.actionType = 'Create Note';
    config.actionName = source.actionName;
    config.noteBody = source.noteBody;
    config.mention = config.mention || source.mention || source.actionOwner || 'Record owner';
    config.followUpDelay = config.followUpDelay || source.followUpDelay || 'today';
    config.followUpTime = config.followUpTime || source.followUpTime || '17:00';
    config.actionOwner = config.mention;

    function migrate(sequence) {
      (Array.isArray(sequence) ? sequence : []).forEach(function (step) {
        if (!step) return;
        if (step.type === 'condition') {
          migrate(step.yesSteps);
          migrate(step.noSteps);
          return;
        }
        if (step.type !== 'action' || step.action === 'Assign specific Deal Owner') return;
        step.action = 'Create Note';
        step.noteTitle = source.actionName;
        step.noteBody = source.noteBody;
        step.mention = config.mention;
        step.followUpDelay = config.followUpDelay;
        step.followUpTime = config.followUpTime;
        step.owner = config.mention;
        step.detail = 'Mention ' + config.mention + ' · ' + (config.followUpDelay === 'today' ? 'Follow up today' : 'Follow up in 1 working day');
        step.completionMode = step.completionMode || 'optional';
        delete step.taskTitle;
      });
    }
    migrate(config.steps);
  }

  function repairCreateQuoteActions(config) {
    if (!config || !Array.isArray(config.steps)) return;
    function migrate(sequence) {
      (Array.isArray(sequence) ? sequence : []).forEach(function (step) {
        if (!step) return;
        if (step.type === 'condition') {
          migrate(step.yesSteps);
          migrate(step.noSteps);
          return;
        }
        if (step.type === 'action' && isCreateQuoteAction(step.action)) applyScratchActionDefaults(step, config);
      });
    }
    migrate(config.steps);
  }

  function objectBadgeClass(objectType) {
    return objectType === 'Lead' ? 'lead' : (objectType === 'Quote' ? 'quote' : ((objectType === 'Project' || objectType === 'Billing') ? 'project' : 'deal'));
  }

  function showAutomationToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showAutomationToast.timer);
    showAutomationToast.timer = window.setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  function stageOptions(selected) {
    const stages = typeof CRM_STAGE_DEFS !== 'undefined' && Array.isArray(CRM_STAGE_DEFS)
      ? CRM_STAGE_DEFS.map(function (stage) { return stage.name; })
      : ['Qualified', 'In Progress', 'In Review', 'Passed Review', 'Sent', 'Won', 'Lost'];
    return stages.map(function (stage) {
      return '<option' + (stage === selected ? ' selected' : '') + '>' + stage + '</option>';
    }).join('');
  }

  function automationPipelines() {
    if (typeof CRM_PIPELINES !== 'undefined' && Array.isArray(CRM_PIPELINES) && CRM_PIPELINES.length) return CRM_PIPELINES;
    const active = typeof getActivePipeline === 'function' ? getActivePipeline() : null;
    return active ? [active] : [{ id: 'sales-pipeline', name: 'Sales Pipeline', stages: (typeof CRM_STAGE_DEFS !== 'undefined' ? CRM_STAGE_DEFS : []) }];
  }

  function automationPipelineForConfig(config) {
    const pipelines = automationPipelines();
    return pipelines.find(function (pipeline) { return pipeline.id === (config && config.triggerPipelineId); }) ||
      (typeof getActivePipeline === 'function' ? getActivePipeline() : null) || pipelines[0];
  }

  function automationPipelineStages(pipeline) {
    if (pipeline && Array.isArray(pipeline.stages) && pipeline.stages.length) return pipeline.stages;
    return typeof CRM_STAGE_DEFS !== 'undefined' && Array.isArray(CRM_STAGE_DEFS) ? CRM_STAGE_DEFS : [];
  }

  function automationPipelineOptions(selectedId) {
    return automationPipelines().map(function (pipeline) {
      return '<option value="' + escapeAutomationHtml(pipeline.id) + '"' + (pipeline.id === selectedId ? ' selected' : '') + '>' + escapeAutomationHtml(pipeline.name) + '</option>';
    }).join('');
  }

  function automationStageOptionsForPipeline(pipeline, selected, includeAny) {
    const anyOption = includeAny ? '<option value="Any stage"' + (selected === 'Any stage' ? ' selected' : '') + '>Any stage</option>' : '';
    return anyOption + automationPipelineStages(pipeline).map(function (stage) {
      return '<option value="' + escapeAutomationHtml(stage.name) + '"' + (stage.name === selected ? ' selected' : '') + '>' + escapeAutomationHtml(stage.name) + '</option>';
    }).join('');
  }

  function automationPipelineStripMarkup(pipeline, selectedStage) {
    const selectedStages = Array.isArray(selectedStage) ? selectedStage : [selectedStage];
    return '<div class="aut-pipeline-strip" aria-label="Pipeline stage path">' + automationPipelineStages(pipeline).map(function (stage) {
      return '<span class="aut-pipeline-stage' + (selectedStages.includes(stage.name) ? ' selected' : '') + '" title="' + escapeAutomationHtml(stage.name) + '">' + escapeAutomationHtml(stage.name) + '</span>';
    }).join('') + '</div>';
  }

  function proposalStageMapForPipeline(pipeline, current) {
    const stages = automationPipelineStages(pipeline);
    const match = function (pattern, fallbackIndex) {
      const found = stages.find(function (stage) { return pattern.test(stage.name); });
      return found ? found.name : (stages[fallbackIndex] ? stages[fallbackIndex].name : '');
    };
    const defaults = {
      qualify: match(/^Qualif/i, 0),
      siteVisit: match(/^Site Visit$/i, -1) || 'Site Visit',
      sow: match(/^Scope of Work$/i, -1) || 'Scope of Work',
      technicalReview: match(/^Technical Review$/i, -1) || 'Technical Review',
      quoting: match(/^In Progress$/i, Math.min(1, stages.length - 1)),
      sent: match(/^Sent$/i, Math.min(4, stages.length - 1))
    };
    const source = current || {};
    Object.keys(defaults).forEach(function (key) {
      if (source[key] && (['siteVisit', 'sow', 'technicalReview'].includes(key) || stages.some(function (stage) { return stage.name === source[key]; }))) defaults[key] = source[key];
    });
    return defaults;
  }

  const PROPOSAL_TEMPLATE_STAGE_DEFS = [
    { name: 'Site Visit', icon: '\uf133', color: '#F12B53', probability: 15, templateKey: 'client-proposal-approval' },
    { name: 'Scope of Work', icon: '\uf15c', color: '#F12B53', probability: 20, templateKey: 'client-proposal-approval' },
    { name: 'Technical Review', icon: '\uf013', color: '#F12B53', probability: 25, templateKey: 'client-proposal-approval' }
  ];

  function proposalTemplateStageNames() {
    return PROPOSAL_TEMPLATE_STAGE_DEFS.map(function (stage) { return stage.name; });
  }

  function proposalPipelineWithTemplateStages(pipeline) {
    const templateNames = proposalTemplateStageNames();
    const currentStages = automationPipelineStages(pipeline);
    const existingTemplateStages = {};
    currentStages.forEach(function (stage) {
      if (templateNames.includes(stage.name)) existingTemplateStages[stage.name] = stage;
    });
    const baseStages = currentStages.filter(function (stage) { return !templateNames.includes(stage.name); });
    const qualifyIndex = Math.max(0, baseStages.findIndex(function (stage) { return /^Qualif/i.test(stage.name); }));
    return baseStages.slice(0, qualifyIndex + 1)
      .concat(PROPOSAL_TEMPLATE_STAGE_DEFS.map(function (stage) {
        return existingTemplateStages[stage.name] || Object.assign({}, stage);
      }))
      .concat(baseStages.slice(qualifyIndex + 1));
  }

  function applyProposalTemplateStages(pipeline) {
    if (!pipeline) return { added: 0, stages: [] };
    if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    const beforeStages = automationPipelineStages(pipeline).slice();
    const beforeNames = beforeStages.map(function (stage) { return stage.name; });
    const templateNames = proposalTemplateStageNames();
    const addedNames = templateNames.filter(function (name) { return !beforeNames.includes(name); });
    const added = addedNames.length;
    const dealStageNames = (pipeline.deals || []).map(function (deal) {
      return beforeStages[deal.s] ? beforeStages[deal.s].name : '';
    });
    const archivedStageNames = (pipeline.deals || []).map(function (deal) {
      if (deal.archivedFromStage) return deal.archivedFromStage;
      return Number.isInteger(deal.archivedFromStageIndex) && beforeStages[deal.archivedFromStageIndex]
        ? beforeStages[deal.archivedFromStageIndex].name : '';
    });
    pipeline.stages = proposalPipelineWithTemplateStages(pipeline);
    (pipeline.deals || []).forEach(function (deal, index) {
      const stageName = dealStageNames[index];
      const nextIndex = pipeline.stages.findIndex(function (stage) { return stage.name === stageName; });
      if (nextIndex >= 0) deal.s = nextIndex;
      const archivedName = archivedStageNames[index];
      if (archivedName) {
        const archivedIndex = pipeline.stages.findIndex(function (stage) { return stage.name === archivedName; });
        if (archivedIndex >= 0) deal.archivedFromStageIndex = archivedIndex;
      }
    });
    if (typeof activePipelineId !== 'undefined' && pipeline.id === activePipelineId && typeof loadPipelineState === 'function') {
      loadPipelineState(pipeline);
      if (typeof rebuildPipelineColumns === 'function') rebuildPipelineColumns();
    }
    if (typeof syncPipelineReferenceOptions === 'function') syncPipelineReferenceOptions();
    if (typeof saveActivePipelineState === 'function') saveActivePipelineState();
    return { added: added, addedNames: addedNames, stages: pipeline.stages };
  }

  function proposalStageIsTemplateCreated(pipeline, name) {
    const stage = automationPipelineStages(pipeline).find(function (item) { return item.name === name; });
    return !!(stage && stage.templateKey === 'client-proposal-approval');
  }

  function proposalPeopleOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const people = Array.from(new Set([
      'Deal owner', 'Sales owner', 'Engineering Team', 'Technical Manager',
      'Commercial Director', 'Finance Team'
    ].concat(team)));
    return people.map(function (person) {
      return '<option' + (person === selected ? ' selected' : '') + '>' + escapeAutomationHtml(person) + '</option>';
    }).join('');
  }

  function ownerOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const owners = Array.from(new Set([
      'Lead owner', 'Deal owner', 'Project manager', 'Round-robin sales team',
      'Engineering Team', 'Technical Manager', 'Commercial Director', 'Finance Team', 'WeQuote Automation'
    ].concat(team, ['Sales operations'])));
    return owners.map(function (owner) {
      return '<option' + (owner === selected ? ' selected' : '') + '>' + owner + '</option>';
    }).join('');
  }

  function specificDealOwnerOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const people = Array.from(new Set(team.concat(selected && selected !== 'Deal owner' ? [selected] : [])));
    if (!people.length) people.push('Lee Roche', 'Jeff Mitchell', 'Alex Osei');
    return people.map(function (person) {
      return '<option' + (person === selected ? ' selected' : '') + '>' + escapeAutomationHtml(person) + '</option>';
    }).join('');
  }

  function mentionOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const people = Array.from(new Set(['Deal owner', 'Lead owner', 'Quote owner'].concat(team, selected ? [selected] : [])));
    return people.map(function (person) {
      return '<option' + (person === selected ? ' selected' : '') + '>' + escapeAutomationHtml(person) + '</option>';
    }).join('');
  }

  function automationDealLabels() {
    const supplied = window.WeQuoteCRMMetadata && typeof window.WeQuoteCRMMetadata.getDealLabels === 'function'
      ? window.WeQuoteCRMMetadata.getDealLabels()
      : [];
    const fallback = ['Hot', 'Warm', 'Cold', 'VIP', 'High value', 'Needs site visit', 'Renewal'];
    return Array.from(new Set(supplied.map(function (label) { return label.name; }).concat(fallback, selectedDealLabelNames())));
  }

  function selectedDealLabelNames() {
    return Object.values(workflows || {}).reduce(function (names, config) {
      (config.steps || []).forEach(function collect(step) {
        if (step && step.dealLabel) names.push(step.dealLabel);
        (step && step.yesSteps || []).forEach(collect);
        (step && step.noSteps || []).forEach(collect);
      });
      return names;
    }, []).filter(Boolean);
  }

  function dealLabelOptions(selected) {
    const labels = automationDealLabels();
    if (selected && !labels.includes(selected)) labels.unshift(selected);
    return labels.map(function (label) {
      return '<option' + (label === selected ? ' selected' : '') + '>' + escapeAutomationHtml(label) + '</option>';
    }).join('');
  }

  function automationDealInterests() {
    const supplied = window.WeQuoteCRMMetadata && typeof window.WeQuoteCRMMetadata.getDealInterests === 'function'
      ? window.WeQuoteCRMMetadata.getDealInterests()
      : [];
    const fallback = ['Television', 'Lighting', 'CCTV', 'Home Cinema', 'Networking'];
    return Array.from(new Set(supplied.map(function (interest) { return interest.name; }).concat(fallback)));
  }

  function dealInterestOptions(selected) {
    const interests = automationDealInterests();
    if (selected && !interests.includes(selected)) interests.unshift(selected);
    return interests.map(function (interest) {
      return '<option' + (interest === selected ? ' selected' : '') + '>' + escapeAutomationHtml(interest) + '</option>';
    }).join('');
  }

  function automationFileTemplates() {
    const supplied = window.WeQuoteCRMMetadata && typeof window.WeQuoteCRMMetadata.getFileTemplates === 'function'
      ? window.WeQuoteCRMMetadata.getFileTemplates()
      : [];
    return supplied.length ? supplied : [
      { id: 'site-survey-checklist', name: 'Site survey checklist.pdf', category: 'Site & discovery' },
      { id: 'risk-assessment', name: 'Risk assessment template.docx', category: 'Site & compliance' },
      { id: 'commercial-nda', name: 'Commercial NDA template.docx', category: 'Commercial' },
      { id: 'project-handover', name: 'Project handover checklist.pdf', category: 'Won & handover' }
    ];
  }

  function fileTemplateOptions(selected) {
    return automationFileTemplates().map(function (file) {
      return '<option value="' + escapeAutomationHtml(file.id) + '"' + (file.id === selected ? ' selected' : '') + '>' + escapeAutomationHtml(file.name) + ' · ' + escapeAutomationHtml(file.category) + '</option>';
    }).join('');
  }

  function automationFileTemplateName(templateId) {
    const file = automationFileTemplates().find(function (item) { return item.id === templateId; });
    return file ? file.name : 'Selected file';
  }

  function quoteOwnerOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const owners = Array.from(new Set(['Deal owner'].concat(team, selected ? [selected] : [])));
    if (owners.length === 1) owners.push('Lee Roche', 'Jeff Mitchell', 'Alex Osei');
    return owners.map(function (owner) {
      return '<option' + (owner === selected ? ' selected' : '') + '>' + escapeAutomationHtml(owner) + '</option>';
    }).join('');
  }

  function isCreateQuoteAction(action) {
    return action === 'Create Quote' || action === 'Create Draft Quote' || action === 'Create related Quote' || action === 'Create first related Quote' || action === 'Create first Quote';
  }

  function fileAttachmentChoices(source) {
    if (source === 'upload') return [];
    if (source === 'related') return [
      { id: 'latest-lead-file', name: 'Latest file from converted Lead' },
      { id: 'customer-site-plan', name: 'Latest customer Site plan' },
      { id: 'latest-related-file', name: 'Latest related CRM file' }
    ];
    if (source === 'generated') return [
      { id: 'accepted-quote-pdf', name: 'Accepted Quote PDF' },
      { id: 'draft-invoice-pdf', name: 'Draft Invoice PDF' },
      { id: 'signature-certificate', name: 'Acceptance signature certificate' }
    ];
    return automationFileTemplates();
  }

  function fileAttachmentOptions(source, selected) {
    return fileAttachmentChoices(source).map(function (file) {
      return '<option value="' + escapeAutomationHtml(file.id) + '"' + (file.id === selected ? ' selected' : '') + '>' + escapeAutomationHtml(file.name) + (file.category ? ' · ' + escapeAutomationHtml(file.category) : '') + '</option>';
    }).join('');
  }

  function automationAttachedFileName(step) {
    if ((step.fileSource || 'template') === 'upload') return step.fileUploadedName || 'Upload a file';
    const file = fileAttachmentChoices(step.fileSource || 'template').find(function (item) { return item.id === step.fileSelection; });
    return file ? file.name : automationFileTemplateName(step.fileSelection || step.fileTemplateId);
  }

  function isDealLabelAction(action) {
    return action === 'Add Deal label' || action === 'Remove Deal label';
  }

  function isQuoteLabelAction(action) {
    return action === 'Add Quote Label';
  }

  function automationQuoteLabels() {
    const supplied = window.WeQuoteCRMMetadata && typeof window.WeQuoteCRMMetadata.getQuoteLabels === 'function'
      ? window.WeQuoteCRMMetadata.getQuoteLabels()
      : [];
    const fallback = ['Priority', 'High value', 'Needs approval', 'Renewal'];
    return Array.from(new Set(supplied.map(function (label) { return label.name; }).concat(fallback)));
  }

  function quoteLabelOptions(selected) {
    const labels = automationQuoteLabels();
    if (selected && !labels.includes(selected)) labels.unshift(selected);
    return labels.map(function (label) {
      return '<option' + (label === selected ? ' selected' : '') + '>' + escapeAutomationHtml(label) + '</option>';
    }).join('');
  }

  function isAutomaticFileAction(action) {
    return action === 'Attach file to Deal';
  }

  function isFileRequestAction(action) {
    return action === 'Request a file';
  }

  function isNextActionAction(action) {
    return action === 'Set Deal Next Action' || action === 'Clear Deal Next Action';
  }

  function isWatcherAction(action) {
    return action === 'Add Deal watcher' || action === 'Remove Deal watcher';
  }

  function isInterestAction(action) {
    return action === 'Add Interest' || action === 'Remove Interest';
  }

  function isExpectedCloseAction(action) {
    return action === 'Set Expected Close Date';
  }

  function isMoveDealStageAction(action) {
    return action === 'Move Deal to another Stage';
  }

  function automationStageStableId(stage, pipeline, index) {
    if (stage.customStageId) return stage.customStageId;
    if (stage.stageId) return stage.stageId;
    if (stage.protected || stage.outcome) {
      const stem = String(stage.name || 'stage').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'stage';
      return 'protected-' + (pipeline ? pipeline.id : 'pipeline') + '-' + stem;
    }
    return 'stage-' + (pipeline ? pipeline.id : 'pipeline') + '-' + index;
  }

  function automationMoveStageTargets(config) {
    if (!config) return [];
    const pipeline = automationPipelineForConfig(config);
    const stages = automationPipelineStages(pipeline);
    const currentName = workflowStageName(config);
    const current = stages.find(function (stage) { return stage && stage.name === currentName; });
    if (!current) return [];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    return stages.map(function (stage, index) {
      return { stage: stage, index: index, id: automationStageStableId(stage, pipeline, index) };
    }).filter(function (item) {
      if (!item.stage || item.stage === current || item.stage.protected || item.stage.outcome) return false;
      if (!quoteConnected) return true;
      return item.stage.lifecycleSegment === current.lifecycleSegment;
    });
  }

  function automationWalkSteps(steps, callback) {
    (Array.isArray(steps) ? steps : []).forEach(function (step) {
      callback(step);
      if (step && step.type === 'condition') {
        automationWalkSteps(step.yesSteps, callback);
        automationWalkSteps(step.noSteps, callback);
      }
    });
  }

  function automationConfigHasRequiredAction(config) {
    if (!config) return false;
    if (config.completionMode === 'required') return true;
    let required = false;
    automationWalkSteps(config.steps, function (step) {
      if (step && step.type === 'action' && step.completionMode === 'required') required = true;
    });
    return required;
  }

  function automationStageHasRequiredWork(pipelineId, stageName, exceptConfig) {
    return userWorkflowKeys().some(function (key) {
      const workflow = workflows[key];
      if (!workflow || workflow === exceptConfig || workflow.triggerPipelineId !== pipelineId || workflowStageName(workflow) !== stageName) return false;
      let required = false;
      automationWalkSteps(workflow.steps, function (step) {
        if (step && step.type === 'action' && step.completionMode === 'required') required = true;
      });
      return required;
    });
  }

  function automationMoveStageAssessment(step, config) {
    if (!step || !isMoveDealStageAction(step.action) || !config) return { skipped: [], blocked: [] };
    const pipeline = automationPipelineForConfig(config);
    const stages = automationPipelineStages(pipeline);
    const sourceIndex = stages.findIndex(function (stage) { return stage.name === workflowStageName(config); });
    let targetIndex = stages.findIndex(function (stage, index) {
      return automationStageStableId(stage, pipeline, index) === step.moveTargetStageId;
    });
    if (targetIndex < 0) targetIndex = stages.findIndex(function (stage) { return stage.name === step.moveTargetStage; });
    if (sourceIndex < 0 || targetIndex < 0) return { skipped: [], blocked: [], missing: true };
    const between = targetIndex > sourceIndex
      ? stages.slice(sourceIndex + 1, targetIndex).filter(function (stage) { return stage && !stage.protected && !stage.outcome; })
      : [];
    return {
      backwards: targetIndex < sourceIndex,
      skipped: between,
      blocked: between.filter(function (stage) { return automationStageHasRequiredWork(config.triggerPipelineId, stage.name, config); })
    };
  }

  function workflowMoveStageBlocker(config) {
    let blocker = null;
    automationWalkSteps(config && config.steps, function (step) {
      if (blocker || !isMoveDealStageAction(step && step.action)) return;
      const assessment = automationMoveStageAssessment(step, config);
      if (assessment.missing) blocker = 'Choose a valid target Stage for every Move Deal action.';
      else if (assessment.blocked.length) blocker = 'Move Deal to ' + (step.moveTargetStage || 'the selected Stage') + ' skips required work in ' + assessment.blocked.map(function (stage) { return stage.name; }).join(', ') + '.';
    });
    return blocker;
  }

  function moveStageTargetOptions(step, config) {
    const targets = automationMoveStageTargets(config);
    if (!step.moveTargetStageId && targets[0]) {
      step.moveTargetStageId = targets[0].id;
      step.moveTargetStage = targets[0].stage.name;
    }
    return targets.map(function (target) {
      return '<option value="' + escapeAutomationHtml(target.id) + '"' + (target.id === step.moveTargetStageId ? ' selected' : '') + '>' + escapeAutomationHtml(target.stage.name) + '</option>';
    }).join('');
  }

  function applyScratchActionDefaults(step, config) {
    if (!step || step.type !== 'action') return step;
    const dealOwner = config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner';
    step.owner = step.owner || dealOwner;
    if (isCreateQuoteAction(step.action)) {
      step.action = 'Create Quote';
      step.quoteName = step.quoteName || '{{Deal title}} · Quote';
      step.quoteOwner = step.quoteOwner || (step.owner === 'WeQuote Automation' ? 'Deal owner' : step.owner) || 'Deal owner';
      step.quoteExistingPolicy = step.quoteExistingPolicy || step.quoteDraftPolicy || 'skip-existing';
      step.owner = step.quoteOwner;
      step.completionMode = 'optional';
      step.blockedEvent = '';
      delete step.quoteTemplate;
      delete step.quoteDraftPolicy;
    }
    if (isDealLabelAction(step.action)) {
      step.dealLabel = step.dealLabel || automationDealLabels()[0] || 'Hot';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isQuoteLabelAction(step.action)) {
      step.quoteLabel = step.quoteLabel || automationQuoteLabels()[0] || 'Priority';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isAutomaticFileAction(step.action)) {
      step.fileSource = step.fileSource || 'template';
      step.fileSelection = step.fileSelection || step.fileTemplateId || (fileAttachmentChoices(step.fileSource)[0] || {}).id || (step.fileSource === 'upload' ? '' : 'site-survey-checklist');
      step.fileDuplicatePolicy = step.fileDuplicatePolicy || 'skip';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isFileRequestAction(step.action)) {
      step.fileRequestName = step.fileRequestName || 'Site plans or drawings';
      step.fileRequestFrom = step.fileRequestFrom || 'Primary Deal contact';
      step.fileRequestTypes = step.fileRequestTypes || 'PDF, Word, Excel or image';
      step.fileRequestDueDays = Math.max(1, Number(step.fileRequestDueDays) || 3);
      step.owner = step.owner || 'Deal owner';
      step.completionMode = step.completionMode || 'required';
      step.blockedEvent = step.blockedEvent || defaultCompletionEvent(config);
    }
    if (step.action === 'Set Deal Next Action') {
      step.nextActionType = step.nextActionType || 'customer-followup';
      step.nextActionTitle = step.nextActionTitle || 'Follow up this Deal';
      step.nextActionDueDays = Math.max(0, Number(step.nextActionDueDays) || 1);
      step.nextActionDueUnit = step.nextActionDueUnit || 'working-days';
      step.nextActionPolicy = step.nextActionPolicy || 'replace-if-overdue';
      step.owner = step.owner || 'Deal owner';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (step.action === 'Clear Deal Next Action') {
      step.nextActionClearPolicy = step.nextActionClearPolicy || 'only-if-automation';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isWatcherAction(step.action)) {
      step.watcher = step.watcher || specificDealOwnerOptions('').match(/>([^<]+)<\/option>/)?.[1] || 'Lee Roche';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isInterestAction(step.action)) {
      step.interest = step.interest || automationDealInterests()[0] || 'Television';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isExpectedCloseAction(step.action)) {
      step.expectedCloseMode = step.expectedCloseMode || 'relative';
      step.expectedCloseDays = Math.max(1, Number(step.expectedCloseDays) || 30);
      step.expectedCloseDate = step.expectedCloseDate || '';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    if (isMoveDealStageAction(step.action)) {
      const targets = automationMoveStageTargets(config);
      const selected = targets.find(function (target) { return target.id === step.moveTargetStageId || target.stage.name === step.moveTargetStage; }) || targets[0];
      step.moveTargetStageId = selected ? selected.id : '';
      step.moveTargetStage = selected ? selected.stage.name : '';
      step.completionMode = 'optional';
      step.blockedEvent = '';
    }
    return step;
  }

  function automationConditionChoices(config, grouped) {
    if (grouped) return ['All criteria match (AND)', 'Any criterion matches (OR)'];
    const stageName = workflowStageName(config);
    const definition = automationStageDefinition(stageName, config && config.triggerPipelineId) || {};
    const segment = definition.lifecycleSegment || stageName;
    const general = [
      'No new activity', 'No Deal Next Action exists', 'Deal Next Action is overdue',
      'Deal has selected label', 'Deal does not have selected label',
      'Deal has selected Interest', 'Deal does not have selected Interest',
      'Deal value is at least the selected amount', 'Required file is missing',
      'No open file request exists', 'Record owner is set', 'Expected Close Date is overdue'
    ];
    const stageSpecific = {
      Qualified: ['Deal Owner is empty', 'Customer or site information is incomplete', 'No related Quote exists'],
      'In Progress': ['Required Quote pricing or SOW data is missing', 'Related Quote remains editable', 'No open Quote-build Note exists'],
      'In Review': ['No open technical review Note exists', 'Technical review file is missing', 'Quote is still awaiting review'],
      'Passed Review': ['Required customer-facing content is incomplete', 'Quote is viable', 'Quote value or discount needs approval'],
      Sent: ['Quote is still Sent and not Expired', 'Customer has viewed a Sent Quote', 'Customer has not viewed any Sent Quote', 'No customer activity since Quote was Sent'],
      Won: ['No open handoff Next Action exists', 'Purchase order or contract file is missing', 'Deposit amount is available'],
      Lost: ['Loss reason is empty', 'No viable related Quote remains', 'Re-engagement date is due']
    };
    const compatibleStageRules = definition.quoteConnected === false
      ? []
      : (stageSpecific[stageName] || stageSpecific[segment] || []);
    let choices = compatibleStageRules.concat(general);
    if (definition.custom) {
      choices.unshift('Deal is still in ' + stageName, 'Required exit criteria for ' + stageName + ' are incomplete');
    }
    return Array.from(new Set(choices));
  }

  function followUpDelayOptions(selected) {
    const options = [
      ['none', 'No follow-up'],
      ['today', 'Today'],
      ['1-working-day', 'In 1 working day'],
      ['3-working-days', 'In 3 working days'],
      ['7-working-days', 'In 7 working days']
    ];
    return options.map(function (item) {
      return '<option value="' + item[0] + '"' + (item[0] === selected ? ' selected' : '') + '>' + item[1] + '</option>';
    }).join('');
  }

  function followUpDelayLabel(value) {
    return ({ none: 'No follow-up', today: 'Follow up today', '1-working-day': 'Follow up in 1 working day', '3-working-days': 'Follow up in 3 working days', '7-working-days': 'Follow up in 7 working days' })[value] || 'Follow-up scheduled';
  }

  function assignmentOptions(selected) {
    const team = typeof CRM_OWNER_NAMES !== 'undefined' ? Object.values(CRM_OWNER_NAMES) : [];
    const owners = Array.from(new Set(['Round-robin sales team'].concat(team, ['Sales operations'])));
    return owners.map(function (owner) {
      return '<option' + (owner === selected ? ' selected' : '') + '>' + owner + '</option>';
    }).join('');
  }

  function leadActivityTypeOptions(selected) {
    const types = [
      { value: 'call', label: 'Call' },
      { value: 'qualification', label: 'Qualification call' },
      { value: 'meeting', label: 'Meeting' },
      { value: 'site-visit', label: 'Site visit' },
      { value: 'other', label: 'Other activity' }
    ];
    return types.map(function (type) {
      return '<option value="' + type.value + '"' + (type.value === selected ? ' selected' : '') + '>' + type.label + '</option>';
    }).join('');
  }

  function leadActivityTypeLabel(type) {
    return ({ call: 'Call', qualification: 'Qualification call', meeting: 'Meeting', 'site-visit': 'Site visit', other: 'Other activity' })[type] || 'Call';
  }

  function automationTimeLabel(value) {
    const parts = String(value || '16:00').split(':');
    const hour = Number(parts[0]);
    const minute = String(parts[1] || '00').padStart(2, '0');
    return (hour % 12 || 12) + ':' + minute + (hour >= 12 ? 'pm' : 'am');
  }

  function automationPipelineName(config) {
    const pipeline = config ? automationPipelineForConfig(config) : (typeof getActivePipeline === 'function' ? getActivePipeline() : null);
    return pipeline && pipeline.name ? pipeline.name : 'Sales Pipeline';
  }

  function canonicalScratchTriggerTitle(title) {
    const value = String(title || '').trim();
    if (value === 'Deal is created at Qualified' || value === 'Deal enters Qualified in Sales Pipeline') return 'Deal enters Qualified';
    return value;
  }

  function scratchTriggerText(config) {
    if (config.editableTrigger) {
      const canonicalTitle = canonicalScratchTriggerTitle(config.editableTrigger.title);
      if (canonicalTitle !== config.editableTrigger.title) config.editableTrigger.title = canonicalTitle;
      if (canonicalTitle === 'Deal enters Qualified' && (!config.editableTrigger.detail || /^Compatible Deal event$/.test(config.editableTrigger.detail))) {
        config.editableTrigger.detail = automationPipelineName(config) + ' · Qualified';
      }
      return config.editableTrigger;
    }
    if (config.triggerKind === 'new-lead') return { title: 'New Lead is created', detail: 'Form, import or manual entry' };
    if (config.triggerKind === 'deal-stage') return { title: 'Deal moves to ' + config.triggerStage, detail: 'Pipeline: ' + automationPipelineName(config) };
    if (config.triggerKind === 'quote-sent') return { title: 'Quote is sent', detail: 'First send of each Quote revision' };
    if (config.triggerKind === 'quote-accepted') return { title: 'Quote is accepted', detail: 'Trusted customer or authorised acceptance' };
    if (config.triggerKind === 'date') return { title: config.objectType + ' · ' + config.dateField, detail: config.dateMode + ' · ' + config.triggerTime + ' ' + config.timezone };
    return { title: config.objectType + ' is ' + config.eventType.toLowerCase(), detail: 'Custom CRM event trigger' };
  }

  function scratchStepText(step) {
    if (step.type === 'wait') return { kicker: 'WAIT', title: 'Wait ' + step.days + (step.days === 1 ? ' day' : ' days'), detail: 'Calendar days before the next step', icon: '&#xf017;', nodeClass: 'wait' };
    if (step.type === 'condition') return { kicker: 'RULE', title: step.condition.replace(/\?+$/, '') + '?', detail: 'YES and NO are editable branches', icon: '&#xf126;', nodeClass: 'condition' };
    if (step.action === 'Create Note') return { kicker: 'DO THIS', title: 'Create Note · ' + (step.noteTitle || 'Follow-up note'), detail: 'Mention ' + (step.mention || 'Record owner') + ' · ' + followUpDelayLabel(step.followUpDelay || 'none'), icon: '&#xf249;', nodeClass: 'action' };
    if (step.action === 'Schedule Meeting' || step.action === 'Schedule Meeting / Site Visit') return { kicker: 'DO THIS', title: step.action + ' · ' + (step.meetingTitle || 'Customer meeting'), detail: (step.meetingAttendee || 'Record owner') + ' · ' + (step.meetingWhen || 'Next working day') + ' at ' + automationTimeLabel(step.meetingTime || '10:00'), icon: '&#xf133;', nodeClass: 'action' };
    if (isCreateQuoteAction(step.action)) return { kicker: 'DO THIS', title: 'Create Quote · ' + (step.quoteName || '{{Deal title}} · Quote'), detail: 'Empty · In Progress · Not sent · ' + (step.quoteExistingPolicy === 'create-another' ? 'Create another allowed' : 'Skip if one exists'), icon: '&#xf15c;', nodeClass: 'action' };
    if (isDealLabelAction(step.action)) return { kicker: 'DO THIS', title: step.action + ' · ' + (step.dealLabel || 'Select label'), detail: step.action === 'Add Deal label' ? 'No duplicate is created when the Deal already has it' : 'Skipped safely when the Deal does not have it', icon: '&#xf02b;', nodeClass: 'action' };
    if (isQuoteLabelAction(step.action)) return { kicker: 'DO THIS', title: 'Add Quote Label · ' + (step.quoteLabel || 'Select label'), detail: 'Applied to the related Quote without creating a duplicate', icon: '&#xf02b;', nodeClass: 'action' };
    if (isAutomaticFileAction(step.action)) return { kicker: 'DO THIS', title: 'Attach file · ' + automationAttachedFileName(step), detail: 'Deal Files · ' + ({ skip: 'Skip when it already exists', version: 'Add a new version', replace: 'Replace the existing file' }[step.fileDuplicatePolicy] || 'Skip duplicates'), icon: '&#xf15b;', nodeClass: 'action' };
    if (isFileRequestAction(step.action)) return { kicker: 'DO THIS', title: 'Request file · ' + (step.fileRequestName || 'Required document'), detail: (step.fileRequestFrom || 'Primary Deal contact') + ' · Managed by ' + (step.owner || 'Deal owner') + ' · Due in ' + (step.fileRequestDueDays || 3) + ' days', icon: '&#xf56f;', nodeClass: 'action' };
    if (step.action === 'Set Deal Next Action') return { kicker: 'DO THIS', title: 'Set Next Action · ' + (step.nextActionTitle || 'Follow up this Deal'), detail: (step.owner || 'Deal owner') + ' · Due in ' + (step.nextActionDueDays || 1) + ' ' + ((step.nextActionDueUnit || 'working-days') === 'working-days' ? 'working day(s)' : 'calendar day(s)'), icon: '&#xf0ae;', nodeClass: 'action' };
    if (step.action === 'Clear Deal Next Action') return { kicker: 'DO THIS', title: 'Clear Deal Next Action', detail: step.nextActionClearPolicy === 'always' ? 'Clear the current Next Action' : 'Only clear a Next Action created by Automation', icon: '&#xf00c;', nodeClass: 'action' };
    if (isWatcherAction(step.action)) return { kicker: 'DO THIS', title: step.action + ' · ' + (step.watcher || 'Select person'), detail: step.action === 'Add Deal watcher' ? 'Follow Deal updates without changing Owner' : 'Stop following Deal updates', icon: step.action === 'Add Deal watcher' ? '&#xf06e;' : '&#xf070;', nodeClass: 'action' };
    if (isInterestAction(step.action)) return { kicker: 'DO THIS', title: step.action + ' · ' + (step.interest || 'Select Interest'), detail: step.action === 'Add Interest' ? 'No duplicate is created' : 'Skipped safely when absent', icon: step.action === 'Add Interest' ? '&#xf005;' : '&#xf056;', nodeClass: 'action' };
    if (isExpectedCloseAction(step.action)) return { kicker: 'DO THIS', title: 'Set Expected Close Date', detail: step.expectedCloseMode === 'fixed' && step.expectedCloseDate ? step.expectedCloseDate : 'In ' + (step.expectedCloseDays || 30) + ' days', icon: '&#xf073;', nodeClass: 'action' };
    if (isMoveDealStageAction(step.action)) {
      const config = activeConfig();
      const pipeline = config ? automationPipelineForConfig(config) : null;
      const stages = automationPipelineStages(pipeline);
      const currentTarget = stages.find(function (stage, index) {
        return automationStageStableId(stage, pipeline, index) === step.moveTargetStageId;
      });
      if (currentTarget) step.moveTargetStage = currentTarget.name;
      return { kicker: 'DO THIS', title: 'Move Deal to ' + (step.moveTargetStage || 'selected Stage'), detail: 'Explicit Stage target · Pipeline reordering does not change it', icon: '&#xf061;', nodeClass: 'action' };
    }
    return { kicker: 'DO THIS', title: step.taskTitle || step.action, detail: step.detail || ('Assign to ' + step.owner), icon: '&#xf0ae;', nodeClass: 'action' };
  }

  function scratchStepImpact(step, config) {
    if (isCreateQuoteAction(step.action)) {
      const stageName = config ? workflowStageName(config) : '';
      const isQualified = stageName === 'Qualified';
      return {
        beforeTitle: 'Deal Quotes · No In Progress Quote', beforeCopy: 'No editable Quote is linked to this Deal',
        afterTitle: 'Quote created · In Progress', afterCopy: (step.quoteName || '{{Deal title}} · Quote') + ' · Assigned to ' + (step.quoteOwner || step.owner || 'Deal owner') + (isQualified ? ' · Deal moves to In Progress through the protected lifecycle' : '')
      };
    }
    if (step.action === 'Add Deal label') return {
      beforeTitle: 'Deal labels · Warm', beforeCopy: 'The selected label is not on the Deal',
      afterTitle: 'Deal labels · Warm, ' + (step.dealLabel || 'Selected label'), afterCopy: 'Automation adds one label without creating a duplicate'
    };
    if (step.action === 'Remove Deal label') return {
      beforeTitle: 'Deal labels · Warm, ' + (step.dealLabel || 'Selected label'), beforeCopy: 'The selected label is currently on the Deal',
      afterTitle: 'Deal labels · Warm', afterCopy: 'Automation removes only the selected label'
    };
    if (isQuoteLabelAction(step.action)) return {
      beforeTitle: 'Quote labels · Current labels', beforeCopy: 'The selected Quote label is not present',
      afterTitle: 'Quote label added · ' + (step.quoteLabel || 'Selected label'), afterCopy: 'Automation adds the label to the related Quote without creating a duplicate'
    };
    if (isAutomaticFileAction(step.action)) return {
      beforeTitle: 'Deal Files · 3 files', beforeCopy: automationAttachedFileName(step) + ' is not attached',
      afterTitle: 'Deal Files · 4 files', afterCopy: '+ ' + automationAttachedFileName(step)
    };
    if (isFileRequestAction(step.action)) return {
      beforeTitle: 'No open file request', beforeCopy: (step.fileRequestName || 'Required document') + ' has not been received',
      afterTitle: 'Required file activity created', afterCopy: (step.fileRequestName || 'Required document') + ' · ' + (step.owner || 'Deal owner') + ' · Due in ' + (step.fileRequestDueDays || 3) + ' days'
    };
    if (step.action === 'Set Deal Next Action') return {
      beforeTitle: 'Deal Next Action · Not set', beforeCopy: 'The Deal has no clear next task',
      afterTitle: 'Deal Next Action · ' + (step.nextActionTitle || 'Follow up this Deal'), afterCopy: (step.owner || 'Deal owner') + ' · Due in ' + (step.nextActionDueDays || 1) + ' day(s)'
    };
    if (step.action === 'Clear Deal Next Action') return {
      beforeTitle: 'Deal Next Action · Open', beforeCopy: 'One current task is visible in Deal Focus',
      afterTitle: 'Deal Next Action · Clear', afterCopy: 'No next task remains after the safe clear policy matches'
    };
    if (isWatcherAction(step.action)) return {
      beforeTitle: 'Deal watchers · ' + (step.action === 'Add Deal watcher' ? '2 people' : '3 people'), beforeCopy: (step.watcher || 'Selected person') + (step.action === 'Add Deal watcher' ? ' is not following' : ' is following'),
      afterTitle: 'Deal watchers · ' + (step.action === 'Add Deal watcher' ? '3 people' : '2 people'), afterCopy: step.action + ' · ' + (step.watcher || 'Selected person')
    };
    if (isInterestAction(step.action)) return {
      beforeTitle: 'Interests · ' + (step.action === 'Add Interest' ? 'Lighting' : 'Lighting, ' + (step.interest || 'Selected Interest')), beforeCopy: 'Current Deal interests',
      afterTitle: 'Interests · ' + (step.action === 'Add Interest' ? 'Lighting, ' + (step.interest || 'Selected Interest') : 'Lighting'), afterCopy: step.action + ' · ' + (step.interest || 'Selected Interest')
    };
    if (isExpectedCloseAction(step.action)) return {
      beforeTitle: 'Expected Close · Not set', beforeCopy: 'Forecast timing is incomplete',
      afterTitle: 'Expected Close · ' + (step.expectedCloseMode === 'fixed' && step.expectedCloseDate ? step.expectedCloseDate : 'In ' + (step.expectedCloseDays || 30) + ' days'), afterCopy: 'Approved Deal field updated'
    };
    if (isMoveDealStageAction(step.action)) {
      const assessment = automationMoveStageAssessment(step, config);
      return {
        beforeTitle: 'Deal stage · ' + workflowStageName(config), beforeCopy: 'Current Pipeline position',
        afterTitle: 'Deal stage · ' + (step.moveTargetStage || 'Selected Stage'),
        afterCopy: assessment.skipped.length ? 'Explicit move · skips ' + assessment.skipped.map(function (stage) { return stage.name; }).join(', ') : 'Explicit move to the saved Stage target'
      };
    }
    return null;
  }

  function proposalStepCard(node, icon, type, title, detail, tone) {
    return '<button class="aut-proposal-step ' + (tone || '') + (activeNode === node ? ' selected' : '') + '" type="button" data-aut-node="' + node + '">' +
      '<span class="aut-proposal-step-icon"><i class="fai">' + icon + '</i></span>' +
      '<span class="aut-proposal-step-copy"><small>' + escapeAutomationHtml(type) + '</small><strong>' + escapeAutomationHtml(title) + '</strong><span>' + escapeAutomationHtml(detail) + '</span></span>' +
      '<i class="fai aut-proposal-step-open">&#xf054;</i></button>';
  }

  function proposalMoveCard(node, destination) {
    return '<button class="aut-proposal-move' + (activeNode === node ? ' selected' : '') + '" type="button" data-aut-node="' + node + '">' +
      '<i class="fai">&#xf061;</i><span><small>EXPLICIT CRM ACTION</small><strong>Move Deal to ' + escapeAutomationHtml(destination) + '</strong><em>Uses an existing Pipeline stage</em></span></button>';
  }

  function renderProposalCanvas(config) {
    const pipeline = automationPipelineForConfig(config);
    config.stageMap = proposalStageMapForPipeline(pipeline, config.stageMap);
    const role = config.responsibilities;
    const siteVisitOrigin = proposalStageIsTemplateCreated(pipeline, config.stageMap.siteVisit) ? 'Template-created Pipeline stage' : 'Existing Pipeline stage reused';
    const sowOrigin = proposalStageIsTemplateCreated(pipeline, config.stageMap.sow) ? 'Template-created Pipeline stage' : 'Existing Pipeline stage reused';
    const technicalOrigin = proposalStageIsTemplateCreated(pipeline, config.stageMap.technicalReview) ? 'Template-created Pipeline stage' : 'Existing Pipeline stage reused';
    automationFlow.dataset.mode = 'proposal';
    automationFlow.classList.add('aut-proposal-flow');
    workflowTitle.textContent = config.title;
    workflowMeta.textContent = (config.editingVersion ? 'Active · Unpublished changes' : (config.enabled ? 'Active' : 'Inactive')) + ' · ' + automationPipelineName(config);
    plainSummary.textContent = 'This workflow uses Site Visit, Scope of Work and Technical Review between ' + config.stageMap.qualify + ' and ' + config.stageMap.quoting + ' in ' + automationPipelineName(config) + '. Each stage shows the real owner, task and approval status.';
    publishButton.textContent = config.editingVersion ? 'Publish changes' : (config.enabled ? 'Published' : 'Activate automation');
    publishButton.disabled = !config.setupComplete || (config.enabled && !config.editingVersion);
    selectedPlayButton.hidden = false;
    document.getElementById('autTestWorkflow').hidden = false;
    document.getElementById('autTestWorkflow').disabled = !config.setupComplete;
    selectedPlayButton.disabled = false;
    updateSelectedPreviewButton(config);
    automationFlow.innerHTML =
      '<div class="aut-proposal-scope"><span><i class="fai">&#xf024;</i> Runs when a Deal enters <strong>' + escapeAutomationHtml(config.stageMap.qualify) + '</strong></span><em>' + escapeAutomationHtml(automationPipelineName(config)) + ' · 3 workflow stages</em></div>' +
      '<div class="aut-proposal-edit-hint"><i class="fai">&#xf044;</i><span><strong>Edit this Automation here</strong><small>Click a task, review or approval card to change its owner, reviewer or due date on the right.</small></span></div>' +
      '<section class="aut-proposal-phase qualify"><header><span>1</span><div><strong>' + escapeAutomationHtml(config.stageMap.qualify) + '</strong><small>Existing Pipeline stage · workflow starts here</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-client-qualification', '&#xf007;', 'HUMAN TASK', 'Client qualification', role.clientQualification + ' · Due in 1 day', 'human') +
        proposalStepCard('proposal-site-decision', '&#xf24e;', 'DECISION', 'Site visit required?', 'If required → Complete site visit · If not → Continue', 'decision') +
        '<div class="aut-proposal-rule split"><span class="approved">Required → ' + escapeAutomationHtml(config.stageMap.siteVisit) + '</span><span>Not required → ' + escapeAutomationHtml(config.stageMap.sow) + '</span></div>' +
      '</div></section>' +
      '<section class="aut-proposal-phase template-stage"><header><span>2</span><div><strong>' + escapeAutomationHtml(config.stageMap.siteVisit) + '</strong><small>' + siteVisitOrigin + ' · conditional</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-site-visit', '&#xf133;', 'HUMAN TASK', 'Complete site visit', role.siteVisit + ' · Capture site information', 'human') +
        '<div class="aut-proposal-rule"><span>Complete → ' + escapeAutomationHtml(config.stageMap.sow) + '</span></div>' +
      '</div></section>' +
      '<section class="aut-proposal-phase template-stage"><header><span>3</span><div><strong>' + escapeAutomationHtml(config.stageMap.sow) + '</strong><small>' + sowOrigin + ' · Sales owns the scope</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-develop-sow', '&#xf15c;', 'HUMAN TASK', 'Develop SOW', role.developSow + ' · Due in 2 days', 'human') +
        '<div class="aut-proposal-rule"><span>Complete → ' + escapeAutomationHtml(config.stageMap.technicalReview) + '</span></div>' +
      '</div></section>' +
      '<section class="aut-proposal-phase template-stage"><header><span>4</span><div><strong>' + escapeAutomationHtml(config.stageMap.technicalReview) + '</strong><small>' + technicalOrigin + ' · Engineering approval</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-technical-review', '&#xf24e;', 'REVIEW', 'Technical review', role.technicalReview + ' · SLA ' + config.technicalReviewDueDays + ' days', 'approval') +
        '<div class="aut-proposal-rule split"><span class="approved">Approved → ' + escapeAutomationHtml(config.stageMap.quoting) + '</span><span class="rejected">Changes → ' + escapeAutomationHtml(config.stageMap.sow) + '</span></div>' +
        proposalMoveCard('proposal-move-quoting', config.stageMap.quoting) +
      '</div></section>' +
      '<section class="aut-proposal-phase quoting"><header><span>5</span><div><strong>' + escapeAutomationHtml(config.stageMap.quoting) + '</strong><small>Existing Pipeline stage · commercial proposal</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-develop-proposal', '&#xf571;', 'HUMAN TASK', 'Develop Proposal', role.developProposal + ' · Due in 3 days', 'human') +
        proposalStepCard('proposal-internal-approval', '&#xf24e;', 'APPROVAL', 'Internal approval', role.internalApproval + ' · SLA ' + config.internalApprovalDueDays + ' days', 'approval') +
        '<div class="aut-proposal-rule reject"><i class="fai">&#xf060;</i><span>Changes requested → Repeat Develop Proposal</span></div>' +
        proposalMoveCard('proposal-move-sent', config.stageMap.sent) +
      '</div></section>' +
      '<section class="aut-proposal-phase sent"><header><span>6</span><div><strong>' + escapeAutomationHtml(config.stageMap.sent) + '</strong><small>Existing Pipeline stage · client follow-up</small></div></header><div class="aut-proposal-phase-body">' +
        proposalStepCard('proposal-submit', '&#xf1d8;', 'HUMAN TASK', 'Submit Proposal to Client', role.submitProposal + ' · Customer-facing', 'human') +
        proposalStepCard('proposal-wait-client', '&#xf017;', 'WAIT', 'Wait for client response', 'Up to 7 days', 'wait') +
        proposalStepCard('proposal-client-approval', '&#xf24e;', 'APPROVAL', 'Client approved?', role.clientApproval + ' records the decision', 'approval') +
        '<div class="aut-proposal-rule split"><span class="approved">Approved → Continue</span><span class="rejected">Changes requested → Return to ' + escapeAutomationHtml(config.stageMap.quoting) + '</span></div>' +
        proposalStepCard('proposal-request-invoice', '&#xf571;', 'HUMAN TASK', 'Request Deposit Invoice', role.requestInvoice + ' · 30% deposit', 'action') +
        '<span class="aut-end">END</span>' +
      '</div></section>';
    updateWorkflowList();
    syncAutomationDraftUi();
  }

  function renderProposalInspector(nodeName) {
    const config = activeConfig();
    const role = config.responsibilities;
    activeNode = nodeName;
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      node.classList.toggle('selected', node.dataset.autNode === nodeName);
    });
    inspectorFoot.hidden = false;
    const assignment = function (key, label, title, helper) {
      inspectorStep.textContent = label;
      inspectorTitle.textContent = title;
      inspectorBody.innerHTML = '<div class="aut-field"><label for="autProposalPerson">Assigned person or team</label><select id="autProposalPerson">' + proposalPeopleOptions(role[key]) + '</select><span class="aut-help">Search-style choices reuse the CRM owner and team model.</span></div>' +
        '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>' + escapeAutomationHtml(helper) + '</span></div>';
    };
    if (nodeName === 'trigger') {
      inspectorStep.textContent = 'Template scope';
      inspectorTitle.textContent = 'Pipeline template stages';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>' + escapeAutomationHtml(automationPipelineName(config)) + '</strong><div style="margin-top:4px;">Starts when a Deal enters ' + escapeAutomationHtml(config.stageMap.qualify) + '</div></div>' +
        '<div class="aut-field"><label>Stage path</label>' + automationPipelineStripMarkup(automationPipelineForConfig(config), config.stageMap.qualify) + '</div>' +
        '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>The workflow uses Site Visit, Scope of Work and Technical Review. Existing Pipeline stages are reused; only missing stages are added. Select any task card in the workflow to edit its responsibility.</span></div>';
      return;
    }
    if (nodeName === 'proposal-client-qualification') return assignment('clientQualification', 'Qualified · Human task', 'Client qualification', 'The assignee confirms that the customer and opportunity are worth progressing.');
    if (nodeName === 'proposal-site-visit') return assignment('siteVisit', config.stageMap.siteVisit + ' · Human task', 'Complete site visit', 'The assignee records the site information before Scope of Work begins.');
    if (nodeName === 'proposal-develop-sow') return assignment('developSow', config.stageMap.sow + ' · Human task', 'Develop SOW', 'The assignee prepares the Statement of Work before technical review.');
    if (nodeName === 'proposal-develop-proposal') return assignment('developProposal', 'Pre-Quote · Human task', 'Develop Proposal', 'The assignee creates the proposal after the SOW is technically approved.');
    if (nodeName === 'proposal-submit') return assignment('submitProposal', 'Sent · Human task', 'Submit Proposal to Client', 'The assignee sends or reviews the approved proposal with the client.');
    if (nodeName === 'proposal-request-invoice') return assignment('requestInvoice', 'Sent · Finance handoff', 'Request Deposit Invoice', 'Finance receives a task to prepare the 30% deposit invoice.');
    if (nodeName === 'proposal-technical-review' || nodeName === 'proposal-internal-approval') {
      const technical = nodeName === 'proposal-technical-review';
      inspectorStep.textContent = (technical ? config.stageMap.technicalReview + ' · Review' : 'Pre-Quote · Internal approval');
      inspectorTitle.textContent = technical ? 'Review technical requirements' : 'Approve the commercial proposal';
      inspectorBody.innerHTML = '<div class="aut-field"><label for="autProposalPerson">' + (technical ? 'Reviewer' : 'Approver') + '</label><select id="autProposalPerson">' + proposalPeopleOptions(technical ? role.technicalReview : role.internalApproval) + '</select></div>' +
        '<div class="aut-field"><label for="autProposalDueDays">Due within</label><select id="autProposalDueDays"><option value="1">1 working day</option><option value="2" selected>2 working days</option><option value="3">3 working days</option><option value="5">5 working days</option></select></div>' +
        '<div class="aut-rule"><strong>If approved</strong><div class="aut-help" style="margin-top:5px;">' + (technical ? 'Move Deal to ' + escapeAutomationHtml(config.stageMap.quoting) + ' and continue to Develop Proposal.' : 'Move Deal to ' + escapeAutomationHtml(config.stageMap.sent) + ' and continue to Submit Proposal.') + '</div></div>' +
        '<div class="aut-rule"><strong>If changes requested</strong><div class="aut-help" style="margin-top:5px;">' + (technical ? 'Move the Deal back to ' + escapeAutomationHtml(config.stageMap.sow) + ', create a new SOW revision and keep it in Deal activity.' : 'Repeat Develop Proposal and keep the revision in Deal activity.') + '</div></div>';
      const due = technical ? config.technicalReviewDueDays : config.internalApprovalDueDays;
      const dueSelect = inspectorBody.querySelector('#autProposalDueDays');
      if (dueSelect) dueSelect.value = String(due);
      return;
    }
    if (nodeName === 'proposal-client-approval') return assignment('clientApproval', 'Sent · Approval', 'Record the client decision', 'The selected person records approval or requests another proposal revision.');
    if (nodeName === 'proposal-site-decision') {
      inspectorStep.textContent = 'Qualified · Decision';
      inspectorTitle.textContent = 'Site visit required?';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML = '<div class="aut-rule"><strong>If required</strong><div class="aut-help" style="margin-top:5px;">Move the Deal to ' + escapeAutomationHtml(config.stageMap.siteVisit) + ' and assign Complete site visit to ' + escapeAutomationHtml(role.siteVisit) + '.</div></div><div class="aut-rule"><strong>If not required</strong><div class="aut-help" style="margin-top:5px;">Skip ' + escapeAutomationHtml(config.stageMap.siteVisit) + ' and move directly to ' + escapeAutomationHtml(config.stageMap.sow) + '.</div></div>';
      return;
    }
    if (nodeName === 'proposal-wait-client') {
      inspectorStep.textContent = 'Sent · Wait';
      inspectorTitle.textContent = 'Wait for client response';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>Wait up to 7 days</strong><div style="margin-top:4px;">The Sales owner can continue as soon as the client replies.</div></div>';
      return;
    }
    if (nodeName === 'proposal-move-quoting' || nodeName === 'proposal-move-sent') {
      const destination = nodeName === 'proposal-move-quoting' ? config.stageMap.quoting : config.stageMap.sent;
      const source = nodeName === 'proposal-move-quoting' ? config.stageMap.technicalReview : config.stageMap.quoting;
      inspectorStep.textContent = 'Explicit CRM action';
      inspectorTitle.textContent = 'Move Deal to ' + destination;
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>' + escapeAutomationHtml(source) + ' → ' + escapeAutomationHtml(destination) + '</strong><div style="margin-top:4px;">Pipeline: ' + escapeAutomationHtml(automationPipelineName(config)) + '</div></div><div class="aut-info-note"><i class="fai">&#xf05a;</i><span>This action advances the Deal to the next Pipeline stage.</span></div>';
      return;
    }
  }

  function saveProposalStep() {
    const config = activeConfig();
    const person = document.getElementById('autProposalPerson');
    const keyByNode = {
      'proposal-client-qualification': 'clientQualification', 'proposal-site-visit': 'siteVisit',
      'proposal-develop-sow': 'developSow',
      'proposal-develop-proposal': 'developProposal', 'proposal-submit': 'submitProposal',
      'proposal-request-invoice': 'requestInvoice', 'proposal-technical-review': 'technicalReview',
      'proposal-internal-approval': 'internalApproval', 'proposal-client-approval': 'clientApproval'
    };
    if (person && keyByNode[activeNode]) config.responsibilities[keyByNode[activeNode]] = person.value;
    const due = document.getElementById('autProposalDueDays');
    if (due && activeNode === 'proposal-technical-review') config.technicalReviewDueDays = Number(due.value) || 2;
    if (due && activeNode === 'proposal-internal-approval') config.internalApprovalDueDays = Number(due.value) || 2;
    persistAutomationState();
    renderProposalCanvas(config);
    renderProposalInspector(activeNode);
    showAutomationToast('Responsibility saved.');
  }

  function beginEditableDraftVersion(config) {
    if (!config || config.protected || config.editingVersion || !automationHasPublishedVersion(config)) return;
    if (!config.lastPublishedAt) config.lastPublishedAt = 'Previously published';
    config.publishedSnapshot = automationVersionSnapshot(config);
    config.editingVersion = true;
  }

  function normalizeScratchSequence(sequence) {
    if (!Array.isArray(sequence)) return [];
    const conditionIndex = sequence.findIndex(function (step) { return step && step.type === 'condition'; });
    if (conditionIndex < 0) return sequence;
    const condition = sequence[conditionIndex];
    const trailingYesSteps = sequence.splice(conditionIndex + 1);
    if (!Array.isArray(condition.yesSteps)) condition.yesSteps = [];
    if (trailingYesSteps.length) condition.yesSteps = condition.yesSteps.concat(trailingYesSteps);
    if (!Array.isArray(condition.noSteps)) condition.noSteps = [];
    normalizeScratchSequence(condition.yesSteps);
    normalizeScratchSequence(condition.noSteps);
    return sequence;
  }

  function normalizeScratchTree(config) {
    if (!config) return;
    if (!Array.isArray(config.steps)) config.steps = [];
    normalizeScratchSequence(config.steps);
    const seenStepIds = new Set();
    function ensureStepIds(sequence) {
      (Array.isArray(sequence) ? sequence : []).forEach(function (step) {
        if (!step) return;
        if (!step.uid || seenStepIds.has(step.uid)) step.uid = 'aut-step-' + (++scratchStepUidCounter);
        seenStepIds.add(step.uid);
        // Controlled auto-layout deliberately resets older free-canvas positions.
        step.canvas = { x: 0, y: 0 };
        if (step.type === 'condition') {
          ensureStepIds(step.yesSteps);
          ensureStepIds(step.noSteps);
        }
      });
    }
    ensureStepIds(config.steps);
  }

  function scratchSequenceReference(config, containerPath) {
    normalizeScratchTree(config);
    const tokens = String(containerPath || 'r').split('.');
    if (tokens[0] !== 'r') return null;
    let sequence = config.steps;
    for (let tokenIndex = 1; tokenIndex < tokens.length; tokenIndex += 2) {
      const conditionIndex = Number(tokens[tokenIndex]);
      const branchToken = tokens[tokenIndex + 1];
      const condition = sequence && sequence[conditionIndex];
      if (!condition || condition.type !== 'condition' || (branchToken !== 'y' && branchToken !== 'n')) return null;
      sequence = branchToken === 'n' ? condition.noSteps : condition.yesSteps;
    }
    return sequence;
  }

  function scratchFindStepPath(config, targetStep) {
    normalizeScratchTree(config);
    let found = '';
    function inspect(sequence, containerPath) {
      if (found || !Array.isArray(sequence)) return;
      sequence.some(function (step, index) {
        const stepPath = containerPath + '.' + index;
        if (step === targetStep) {
          found = stepPath;
          return true;
        }
        if (step && step.type === 'condition') {
          inspect(step.yesSteps, stepPath + '.y');
          inspect(step.noSteps, stepPath + '.n');
        }
        return !!found;
      });
    }
    inspect(config.steps, 'r');
    return found;
  }

  function scratchFindStepByUid(config, uid) {
    let found = null;
    function inspect(sequence) {
      (Array.isArray(sequence) ? sequence : []).some(function (step) {
        if (step && step.uid === uid) {
          found = step;
          return true;
        }
        if (step && step.type === 'condition') {
          inspect(step.yesSteps);
          inspect(step.noSteps);
        }
        return !!found;
      });
    }
    normalizeScratchTree(config);
    inspect(config.steps);
    return found;
  }

  function scratchNodeNameFromElement(config, node) {
    if (!node || node.dataset.autNode === 'scratch-trigger') return node ? node.dataset.autNode : '';
    const wrap = node.closest('[data-aut-step-id]');
    const uid = wrap && wrap.dataset.autStepId;
    return uid ? 'scratch-uid:' + uid : node.dataset.autNode;
  }

  function scratchNodeIsActive(nodeName, uid, pathName) {
    if (nodeName === pathName) return true;
    const uidMatch = /^scratch-uid:(.+)$/.exec(nodeName || '');
    return !!(uidMatch && uidMatch[1] === uid);
  }

  function scratchHasAction(sequence) {
    return (Array.isArray(sequence) ? sequence : []).some(function (step) {
      return step.type === 'action' || (step.type === 'condition' && (scratchHasAction(step.yesSteps) || scratchHasAction(step.noSteps)));
    });
  }

  function renderScratchCanvas(config) {
    const trigger = scratchTriggerText(config);
    normalizeScratchTree(config);
    const steps = config.steps;
    const hasAction = scratchHasAction(steps);
    let visibleStepNumber = 1;

    function scratchNodeMarkup(step, nodeName, stepNumber, kickerPrefix, extraClass) {
      const text = scratchStepText(step);
      const selected = scratchNodeIsActive(activeNode, step.uid, nodeName);
      return '<div class="aut-editable-node-wrap' + (selected ? ' active' : '') + '" data-aut-step-wrap="' + nodeName + '" data-aut-step-id="' + escapeAutomationHtml(step.uid) + '" data-aut-step-type="' + escapeAutomationHtml(step.type) + '" data-aut-connect-node="' + escapeAutomationHtml(step.uid) + '" title="Drag to reorder. Drop on a highlighted insertion frame.">' +
        '<button class="aut-node ' + (extraClass || '') + text.nodeClass + (selected ? ' selected' : '') + '" type="button" data-aut-node="' + nodeName + '">' +
          '<span class="aut-node-top"><span class="aut-node-grip" aria-hidden="true"><i class="fai">&#xf58e;</i></span><span class="aut-node-icon"><i class="fai">' + text.icon + '</i></span><span><span class="aut-node-kicker">' + (kickerPrefix || (stepNumber + '. ')) + text.kicker + '</span><span class="aut-node-name">' + escapeAutomationHtml(text.title) + '</span></span></span>' +
          '<span class="aut-node-detail">' + escapeAutomationHtml(text.detail) + '</span>' +
        '</button>' +
        '<div class="aut-node-tools" aria-label="Step actions">' +
          '<button type="button" data-aut-node-action="up" data-aut-target="' + nodeName + '" title="Move earlier"><i class="fai">&#xf062;</i></button>' +
          '<button type="button" data-aut-node-action="down" data-aut-target="' + nodeName + '" title="Move later"><i class="fai">&#xf063;</i></button>' +
          '<button type="button" data-aut-node-action="duplicate" data-aut-target="' + nodeName + '" title="Duplicate step"><i class="fai">&#xf0c5;</i></button>' +
          '<button type="button" data-aut-node-action="delete" data-aut-target="' + nodeName + '" title="Delete step"><i class="fai">&#xf2ed;</i></button>' +
        '</div>' +
      '</div>';
    }

    function connectorMarkup(containerPath, insertIndex, label, small) {
      const addClass = small ? 'aut-add small' : 'aut-add';
      const lineClass = small ? 'aut-scratch-branch-line' : 'aut-line';
      return '<span class="' + lineClass + '"></span><button class="' + addClass + '" type="button" data-aut-add="scratch" data-aut-container="' + containerPath + '" data-aut-insert="' + insertIndex + '" aria-label="' + escapeAutomationHtml(label) + '"><i class="fai">&#xf067;</i></button><span class="' + lineClass + '"></span>';
    }

    function branchMarkup(condition, conditionPath, tone, label) {
      const branchToken = tone === 'no' ? 'n' : 'y';
      const branchPath = conditionPath + '.' + branchToken;
      const branchSteps = tone === 'no' ? condition.noSteps : condition.yesSteps;
      return '<div class="aut-scratch-branch-path ' + tone + '"><span class="aut-scratch-branch-label">' + label + '</span><span class="aut-scratch-branch-caption">Continue this branch</span>' +
        sequenceMarkup(branchSteps, branchPath, true) +
      '</div>';
    }

    function sequenceMarkup(sequence, containerPath, branchMode) {
      const list = Array.isArray(sequence) ? sequence : [];
      let html = '';
      let ownsBranches = false;
      list.forEach(function (step, index) {
        const stepPath = containerPath + '.' + index;
        visibleStepNumber += 1;
        html += connectorMarkup(containerPath, index, 'Add step before ' + scratchStepText(step).title, branchMode);
        html += scratchNodeMarkup(step, 'scratch-path:' + stepPath, visibleStepNumber, branchMode ? labelForBranchStep(containerPath, index) : '', branchMode ? 'aut-scratch-branch-node ' : '');
        if (step.type === 'condition') {
          ownsBranches = true;
          html += '<div class="aut-scratch-branch-editor" aria-label="Editable condition branches">' +
            branchMarkup(step, stepPath, 'yes', 'YES') + branchMarkup(step, stepPath, 'no', 'NO') +
          '</div>';
        }
      });
      if (!ownsBranches) {
        const lineClass = branchMode ? 'aut-scratch-branch-line' : 'aut-line';
        const addClass = branchMode ? 'aut-add small' : 'aut-add';
        html += '<span class="' + lineClass + '"></span><button class="' + addClass + '" type="button" data-aut-add="scratch" data-aut-container="' + containerPath + '" data-aut-insert="' + list.length + '" aria-label="Add next step to this branch"><i class="fai">&#xf067;</i></button>';
        if (!list.length && !branchMode) html += '<div class="aut-scratch-empty"><strong>What should happen next?</strong><span>Drag or click an Action, Rule or Wait block.</span></div>';
        else html += '<span class="' + lineClass + ' end-line"></span><span class="aut-end" data-aut-connect-end="' + containerPath + '">END</span>';
      }
      return html;
    }

    function labelForBranchStep(containerPath, index) {
      const branch = containerPath.split('.').pop() === 'n' ? 'NO' : 'YES';
      return branch + ' ' + (index + 1) + ' · ';
    }

    let markup =
      '<div class="aut-editable-node-wrap aut-trigger-node-wrap' + (activeNode === 'scratch-trigger' ? ' active' : '') + '" data-aut-step-wrap="scratch-trigger" data-aut-step-type="trigger" data-aut-connect-node="trigger">' +
      '<button class="aut-node trigger' + (activeNode === 'scratch-trigger' ? ' selected' : '') + '" type="button" data-aut-node="scratch-trigger">' +
        '<span class="aut-node-top"><span class="aut-node-icon"><i class="fai">&#xf0a6;</i></span><span><span class="aut-node-kicker">1. STARTS WHEN</span><span class="aut-node-name">' + escapeAutomationHtml(trigger.title) + '</span></span></span>' +
        '<span class="aut-node-detail">' + escapeAutomationHtml(trigger.detail) + '</span>' +
      '</button></div>';

    markup += sequenceMarkup(steps, 'r', false);
    automationFlow.dataset.mode = 'scratch';
    automationFlow.innerHTML = markup;
    scheduleScratchConnectorDraw(config);
    workflowTitle.textContent = config.title;
    workflowMeta.textContent = (config.editingVersion ? 'Active · Unpublished changes' : (config.enabled ? 'Active' : 'Inactive')) + ' · ' + (config.templateKey ? 'Editable template copy' : 'Custom') + ' · Scope: ' + automationCompanyScopeLabel(config);
    plainSummary.textContent = 'Starts when ' + trigger.title.toLowerCase() + ' for ' + automationCompanyScopeLabel(config) + (steps.length ? ', then runs ' + steps.length + ' editable step' + (steps.length === 1 ? '' : 's') + '. Select any step to change its settings, duplicate it, move it or delete it.' : '. Add the next step using the + button.');
    publishButton.textContent = config.editingVersion ? 'Publish changes' : (config.enabled ? 'Published' : 'Activate automation');
    publishButton.disabled = !hasAction || (config.enabled && !config.editingVersion);
    if (draftBanner) {
      draftBanner.hidden = !config.templateKey || (config.enabled && !config.editingVersion);
      const draftTitle = draftBanner.querySelector('strong');
      const draftCopy = draftBanner.querySelector('small');
      if (draftTitle) draftTitle.textContent = config.editingVersion ? 'Unpublished changes' : 'Template copied';
      if (draftCopy) draftCopy.textContent = config.editingVersion
        ? 'The Active Automation keeps running. Save, run the Before / After test, then publish this Draft when ready.'
        : 'Every step is editable. Use + to insert, or select a step to duplicate, move or delete it.';
    }
    selectedPlayButton.hidden = false;
    document.getElementById('autTestWorkflow').hidden = false;
    document.getElementById('autTestWorkflow').disabled = !hasAction;
    selectedPlayButton.disabled = false;
    updateSelectedPreviewButton(config);
    updateWorkflowList();
    syncAutomationDraftUi();
  }

  function scratchConnectElementById(uid) {
    return Array.from(automationFlow.querySelectorAll('[data-aut-connect-node]')).find(function (element) {
      return element.dataset.autConnectNode === uid;
    }) || null;
  }

  function scratchConnectEndByPath(containerPath) {
    return Array.from(automationFlow.querySelectorAll('[data-aut-connect-end]')).find(function (element) {
      return element.dataset.autConnectEnd === containerPath;
    }) || null;
  }

  function drawScratchConnectors(config) {
    const canvas = automationFlow.closest('.aut-canvas');
    if (!canvas || !config || automationFlow.dataset.mode !== 'scratch') return;
    const oldSvg = canvas.querySelector('.aut-controlled-connectors');
    if (oldSvg) oldSvg.remove();
    canvas.classList.add('has-controlled-connectors');
    const width = Math.max(canvas.scrollWidth, canvas.clientWidth);
    const height = Math.max(canvas.scrollHeight, canvas.clientHeight);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'aut-controlled-connectors');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    svg.setAttribute('aria-hidden', 'true');
    canvas.appendChild(svg);
    const canvasRect = canvas.getBoundingClientRect();

    function anchor(element, side) {
      if (!element) return null;
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - canvasRect.left + canvas.scrollLeft + rect.width / 2,
        y: (side === 'top' ? rect.top : rect.bottom) - canvasRect.top + canvas.scrollTop
      };
    }

    function addConnection(fromElement, toElement, tone) {
      const start = anchor(fromElement, 'bottom');
      const end = anchor(toElement, 'top');
      if (!start || !end) return;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const direction = end.y >= start.y ? 1 : -1;
      const bend = Math.max(24, Math.min(74, Math.abs(end.y - start.y) / 2));
      const firstY = start.y + bend * direction;
      const lastY = end.y - bend * direction;
      path.setAttribute('d', 'M ' + start.x + ' ' + start.y + ' V ' + firstY + ' H ' + end.x + ' V ' + lastY + ' L ' + end.x + ' ' + end.y);
      path.setAttribute('class', 'aut-controlled-connector ' + (tone || 'main'));
      svg.appendChild(path);
    }

    function connectSequence(sequence, containerPath, incomingElement, incomingTone) {
      const list = Array.isArray(sequence) ? sequence : [];
      if (!list.length) {
        const emptyEnd = scratchConnectEndByPath(containerPath);
        if (emptyEnd) addConnection(incomingElement, emptyEnd, incomingTone);
        return;
      }
      const firstElement = scratchConnectElementById(list[0].uid);
      addConnection(incomingElement, firstElement, incomingTone);
      list.forEach(function (step, index) {
        const currentElement = scratchConnectElementById(step.uid);
        if (!currentElement) return;
        if (step.type === 'condition') {
          connectSequence(step.yesSteps, containerPath + '.' + index + '.y', currentElement, 'yes');
          connectSequence(step.noSteps, containerPath + '.' + index + '.n', currentElement, 'no');
          return;
        }
        const nextStep = list[index + 1];
        if (nextStep) addConnection(currentElement, scratchConnectElementById(nextStep.uid), 'main');
        else addConnection(currentElement, scratchConnectEndByPath(containerPath), 'main');
      });
    }

    const triggerElement = scratchConnectElementById('trigger');
    connectSequence(config.steps, 'r', triggerElement, 'main');
  }

  function scheduleScratchConnectorDraw(config) {
    window.requestAnimationFrame(function () {
      drawScratchConnectors(config || activeConfig());
    });
  }

  function scratchStepReference(config, nodeName) {
    normalizeScratchTree(config);
    const uidMatch = /^scratch-uid:(.+)$/.exec(nodeName || '');
    if (uidMatch) {
      const uidStep = scratchFindStepByUid(config, uidMatch[1]);
      const uidPath = uidStep ? scratchFindStepPath(config, uidStep) : '';
      if (uidPath) return scratchStepReference(config, 'scratch-path:' + uidPath);
      return { step: null, list: null, branch: 'main', conditionIndex: -1, index: -1, containerPath: 'r', path: '' };
    }
    const pathMatch = /^scratch-path:(.+)$/.exec(nodeName || '');
    if (pathMatch) {
      const tokens = pathMatch[1].split('.');
      const index = Number(tokens.pop());
      const containerPath = tokens.join('.');
      const list = scratchSequenceReference(config, containerPath);
      return {
        step: list && list[index], list: list, branch: containerPath.endsWith('.n') ? 'no' : (containerPath.endsWith('.y') ? 'yes' : 'main'),
        conditionIndex: -1, index: index, containerPath: containerPath, path: pathMatch[1]
      };
    }
    const noMatch = /^scratch-no-(\d+)-(\d+)$/.exec(nodeName);
    if (noMatch) {
      const conditionIndex = Number(noMatch[1]);
      const noIndex = Number(noMatch[2]);
      const condition = config.steps[conditionIndex];
      const list = condition && Array.isArray(condition.noSteps) ? condition.noSteps : null;
      return { step: list ? list[noIndex] : null, list: list, branch: 'no', conditionIndex: conditionIndex, index: noIndex, containerPath: 'r.' + conditionIndex + '.n', path: 'r.' + conditionIndex + '.n.' + noIndex };
    }
    const index = Number(nodeName.replace('scratch-', ''));
    return { step: config.steps[index], list: config.steps, branch: 'main', conditionIndex: -1, index: index, containerPath: 'r', path: 'r.' + index };
  }

  function scratchDropReference(dropButton) {
    const config = activeConfig();
    const containerPath = dropButton.dataset.autContainer || 'r';
    const branch = containerPath.endsWith('.n') ? 'no' : (containerPath.endsWith('.y') ? 'yes' : 'main');
    return {
      branch: branch,
      conditionIndex: dropButton.dataset.autCondition === undefined ? -1 : Number(dropButton.dataset.autCondition),
      insertIndex: Number(dropButton.dataset.autInsert || 0),
      containerPath: containerPath,
      list: scratchSequenceReference(config, containerPath)
    };
  }

  function canDropScratchNode(nodeName, dropButton) {
    const config = activeConfig();
    if (!hasEditableStepModel(config) || !nodeName || !dropButton) return false;
    const source = scratchStepReference(config, nodeName);
    const target = scratchDropReference(dropButton);
    if (!source.step) return false;
    // Never allow a condition to be dropped inside one of its own descendant branches.
    if (source.step.type === 'condition' && target.containerPath.indexOf(source.path + '.') === 0) return false;
    return true;
  }

  function scratchDropButtonFor(containerPath, insertIndex) {
    return Array.from(automationView.querySelectorAll('.aut-add[data-aut-add^="scratch"]')).find(function (button) {
      return (button.dataset.autContainer || 'r') === containerPath && Number(button.dataset.autInsert || 0) === Number(insertIndex || 0);
    }) || null;
  }

  function scratchConnectionDropButton(sourceName, branchToken) {
    if (sourceName === 'scratch-trigger') return scratchDropButtonFor('r', 0);
    const config = activeConfig();
    const source = scratchStepReference(config, sourceName);
    if (!source || !source.step) return null;
    if (source.step.type === 'condition') {
      if (branchToken !== 'y' && branchToken !== 'n') return null;
      return scratchDropButtonFor(source.path + '.' + branchToken, 0);
    }
    return scratchDropButtonFor(source.containerPath, source.index + 1);
  }

  function scratchConnectionTargetAtPoint(x, y, sourceName) {
    const element = document.elementFromPoint(x, y);
    const wrap = element && element.closest('[data-aut-step-wrap]');
    if (!wrap || wrap.dataset.autStepWrap === sourceName || wrap.dataset.autStepWrap === 'scratch-trigger') return null;
    return wrap;
  }

  function scratchConnectionAnchor(port) {
    if (!port) return null;
    const rect = port.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  }

  function scratchConnectionPath(start, end, side) {
    const horizontal = side === 'left' || side === 'right';
    if (horizontal) {
      const direction = side === 'left' ? -1 : 1;
      const distance = Math.max(52, Math.abs(end.x - start.x) * .52);
      return 'M ' + start.x + ' ' + start.y + ' C ' + (start.x + distance * direction) + ' ' + start.y + ', ' + (end.x - distance * direction) + ' ' + end.y + ', ' + end.x + ' ' + end.y;
    }
    const direction = side === 'top' ? -1 : 1;
    const distance = Math.max(52, Math.abs(end.y - start.y) * .52);
    return 'M ' + start.x + ' ' + start.y + ' C ' + start.x + ' ' + (start.y + distance * direction) + ', ' + end.x + ' ' + (end.y - distance * direction) + ', ' + end.x + ' ' + end.y;
  }

  function ensureScratchConnectionLayer() {
    if (scratchConnectionLayer) return scratchConnectionLayer;
    scratchConnectionLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    scratchConnectionLayer.setAttribute('class', 'aut-connection-drag-layer');
    scratchConnectionLayer.setAttribute('width', window.innerWidth);
    scratchConnectionLayer.setAttribute('height', window.innerHeight);
    scratchConnectionLayer.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
    scratchConnectionLayer.innerHTML = '<path class="aut-connection-drag-path"></path><circle class="aut-connection-drag-end" r="5"></circle>';
    document.body.appendChild(scratchConnectionLayer);
    return scratchConnectionLayer;
  }

  function updateScratchConnectionVisual(x, y) {
    if (!scratchConnectionStart || !scratchConnectionStart.port) return;
    const start = scratchConnectionAnchor(scratchConnectionStart.port);
    if (!start) return;
    const layer = ensureScratchConnectionLayer();
    layer.setAttribute('width', window.innerWidth);
    layer.setAttribute('height', window.innerHeight);
    layer.setAttribute('viewBox', '0 0 ' + window.innerWidth + ' ' + window.innerHeight);
    layer.querySelector('path').setAttribute('d', scratchConnectionPath(start, { x: x, y: y }, scratchConnectionSide));
    const end = layer.querySelector('circle');
    end.setAttribute('cx', x);
    end.setAttribute('cy', y);
    if (!scratchConnectionGhost) {
      scratchConnectionGhost = document.createElement('div');
      scratchConnectionGhost.className = 'aut-connection-drag-ghost';
      scratchConnectionGhost.innerHTML = '<span class="aut-connection-ghost-icon"><i class="fai">&#xf061;</i></span><span><strong>Connect next step</strong><small>Release on a card or blank canvas</small></span>';
      document.body.appendChild(scratchConnectionGhost);
    }
    scratchConnectionGhost.style.left = Math.min(window.innerWidth - 232, x + 18) + 'px';
    scratchConnectionGhost.style.top = Math.min(window.innerHeight - 72, y + 16) + 'px';
  }

  function updateScratchConnectionTarget(x, y) {
    const target = scratchConnectionTargetAtPoint(x, y, scratchConnectionSource);
    automationView.querySelectorAll('.aut-connect-target').forEach(function (wrap) {
      if (wrap !== target) wrap.classList.remove('aut-connect-target');
    });
    if (target) target.classList.add('aut-connect-target');
    return target;
  }

  function clearScratchConnectionVisual() {
    if (scratchConnectionLayer) scratchConnectionLayer.remove();
    if (scratchConnectionGhost) scratchConnectionGhost.remove();
    scratchConnectionLayer = null;
    scratchConnectionGhost = null;
    automationView.querySelectorAll('.is-connecting,.aut-connect-target,.aut-connection-port.is-active').forEach(function (element) {
      element.classList.remove('is-connecting', 'aut-connect-target', 'is-active');
    });
  }

  function closeScratchConnectionMenu() {
    document.querySelectorAll('.aut-connect-create-menu').forEach(function (menu) { menu.remove(); });
    scratchConnectionMenuState = null;
  }

  function scratchConnectionSourceStep(sourceName) {
    if (sourceName === 'scratch-trigger') return { type: 'trigger' };
    const reference = scratchStepReference(activeConfig(), sourceName);
    return reference && reference.step;
  }

  function scratchConnectExisting(sourceName, targetName, branchToken) {
    const dropButton = scratchConnectionDropButton(sourceName, branchToken);
    if (!dropButton) {
      showAutomationToast('Choose which controlled output should connect first.');
      return;
    }
    if (!canDropScratchNode(targetName, dropButton)) {
      showAutomationToast('That connection would create an invalid loop. Rule outputs remain controlled.');
      return;
    }
    moveScratchNodeToDrop(targetName, dropButton);
  }

  function addScratchConnectedBlock(blockId, sourceName, branchToken) {
    const dropButton = scratchConnectionDropButton(sourceName, branchToken);
    if (!dropButton) {
      showAutomationToast('Choose a controlled output before adding the next step.');
      return;
    }
    addWorkflowBlock(blockId, dropButton);
  }

  function scratchConnectionMenuMarkup(state) {
    const sourceStep = scratchConnectionSourceStep(state.sourceName);
    if (sourceStep && sourceStep.type === 'condition' && !state.branch) {
      return '<div class="aut-connect-menu-head"><span><strong>Choose Rule output</strong><small>Yes and No stay attached to this Rule.</small></span><button type="button" data-aut-connect-close aria-label="Close"><i class="fai">&#xf00d;</i></button></div>' +
        '<div class="aut-connect-branch-grid"><button type="button" data-aut-connect-branch="y"><strong>YES</strong><small>Rule is met</small></button><button type="button" data-aut-connect-branch="n"><strong>NO</strong><small>Rule is not met</small></button></div>';
    }
    const targetText = state.targetName ? 'Connect this output to the selected card.' : 'Choose what to create at this point.';
    return '<div class="aut-connect-menu-head"><span><strong>' + (state.targetName ? 'Connect card' : 'Create next step') + '</strong><small>' + targetText + '</small></span><button type="button" data-aut-connect-close aria-label="Close"><i class="fai">&#xf00d;</i></button></div>' +
      (state.targetName
        ? '<button class="aut-connect-existing-choice" type="button" data-aut-connect-existing><i class="fai">&#xf0c1;</i><span><strong>Connect here</strong><small>Repositions this card in the controlled flow</small></span></button>'
        : '<div class="aut-connect-block-grid">' + [
            ['action-create-activity', '&#xf0ae;', 'Action', 'Do something in CRM'],
            ['logic-condition', '&#xf126;', 'Rule', 'Create Yes and No'],
            ['action-request-approval', '&#xf24e;', 'Approval', 'Approve or request changes'],
            ['logic-wait', '&#xf017;', 'Wait', 'Pause before continuing'],
            ['logic-end', '&#xf28d;', 'End', 'Stop this branch safely']
          ].map(function (choice) {
            return '<button type="button" data-aut-connect-block="' + choice[0] + '"><i class="fai">' + choice[1] + '</i><span><strong>' + choice[2] + '</strong><small>' + choice[3] + '</small></span></button>';
          }).join('') + '</div>');
  }

  function renderScratchConnectionMenu() {
    const state = scratchConnectionMenuState;
    if (!state) return;
    let menu = document.querySelector('.aut-connect-create-menu');
    if (!menu) {
      menu = document.createElement('div');
      menu.className = 'aut-connect-create-menu';
      automationView.appendChild(menu);
    }
    menu.innerHTML = scratchConnectionMenuMarkup(state);
    menu.style.left = Math.max(12, Math.min(window.innerWidth - 294, state.x + 12)) + 'px';
    menu.style.top = Math.max(12, Math.min(window.innerHeight - 360, state.y + 12)) + 'px';
  }

  function openScratchConnectionMenu(sourceName, targetName, x, y) {
    closeScratchConnectionMenu();
    scratchConnectionMenuState = { sourceName: sourceName, targetName: targetName || '', branch: '', x: x, y: y };
    renderScratchConnectionMenu();
  }

  function updateLibraryDragGhost(sourceBlock, x, y) {
    if (!sourceBlock) return;
    if (!libraryDragGhost) {
      libraryDragGhost = sourceBlock.cloneNode(true);
      libraryDragGhost.classList.remove('is-dragging');
      libraryDragGhost.classList.add('aut-library-drag-ghost');
      libraryDragGhost.removeAttribute('data-aut-block-id');
      libraryDragGhost.removeAttribute('tabindex');
      libraryDragGhost.setAttribute('aria-hidden', 'true');
      document.body.appendChild(libraryDragGhost);
    }
    libraryDragGhost.style.left = (x + 16) + 'px';
    libraryDragGhost.style.top = (y + 14) + 'px';
  }

  function removeLibraryDragGhost() {
    if (!libraryDragGhost) return;
    libraryDragGhost.remove();
    libraryDragGhost = null;
  }

  function updateScratchDragGhost(sourceWrap, x, y) {
    if (!sourceWrap) return;
    if (!scratchDragGhost) {
      const sourceNode = sourceWrap.querySelector('.aut-node') || sourceWrap;
      scratchDragGhost = sourceNode.cloneNode(true);
      scratchDragGhost.classList.remove('selected');
      scratchDragGhost.classList.add('aut-scratch-drag-ghost');
      scratchDragGhost.removeAttribute('data-aut-node');
      scratchDragGhost.removeAttribute('type');
      scratchDragGhost.setAttribute('aria-hidden', 'true');
      document.body.appendChild(scratchDragGhost);
    }
    scratchDragGhost.style.left = (x + 16) + 'px';
    scratchDragGhost.style.top = (y + 14) + 'px';
  }

  function removeScratchDragGhost() {
    if (!scratchDragGhost) return;
    scratchDragGhost.remove();
    scratchDragGhost = null;
  }

  function autoScrollScratchCanvas(canvas, x, y) {
    if (!canvas) return false;
    const rect = canvas.getBoundingClientRect();
    const edge = 72;
    const maxSpeed = 22;
    let deltaX = 0;
    let deltaY = 0;
    if (x < rect.left + edge) deltaX = -maxSpeed * Math.max(0, 1 - (x - rect.left) / edge);
    else if (x > rect.right - edge) deltaX = maxSpeed * Math.max(0, 1 - (rect.right - x) / edge);
    if (y < rect.top + edge) deltaY = -maxSpeed * Math.max(0, 1 - (y - rect.top) / edge);
    else if (y > rect.bottom - edge) deltaY = maxSpeed * Math.max(0, 1 - (rect.bottom - y) / edge);
    if (!deltaX && !deltaY) return false;
    const previousLeft = canvas.scrollLeft;
    const previousTop = canvas.scrollTop;
    canvas.scrollBy(deltaX, deltaY);
    return previousLeft !== canvas.scrollLeft || previousTop !== canvas.scrollTop;
  }

  function stopDragAutoScroll() {
    if (dragAutoScrollFrame) window.cancelAnimationFrame(dragAutoScrollFrame);
    dragAutoScrollFrame = null;
    dragAutoScrollPoint = null;
  }

  function continueDragAutoScroll() {
    dragAutoScrollFrame = null;
    if (!dragAutoScrollPoint || (!libraryPointerBlock && !scratchPointerNode)) return;
    const canvas = automationView.querySelector('.aut-canvas');
    const didScroll = autoScrollScratchCanvas(canvas, dragAutoScrollPoint.x, dragAutoScrollPoint.y);
    if (didScroll) {
      if (libraryPointerBlock) updateLibraryDropHighlight(libraryPointerBlock, dragAutoScrollPoint.x, dragAutoScrollPoint.y);
      if (scratchPointerNode) updateScratchDropHighlight(scratchDropButtonAtPoint(dragAutoScrollPoint.x, dragAutoScrollPoint.y), scratchPointerNode);
    }
    dragAutoScrollFrame = window.requestAnimationFrame(continueDragAutoScroll);
  }

  function updateDragAutoScroll(x, y) {
    dragAutoScrollPoint = { x: x, y: y };
    if (!dragAutoScrollFrame) dragAutoScrollFrame = window.requestAnimationFrame(continueDragAutoScroll);
  }

  function setNativeDragImage(event, sourceElement) {
    if (!event.dataTransfer || !sourceElement || !event.dataTransfer.setDragImage) return;
    const source = sourceElement.querySelector('.aut-node') || sourceElement;
    const ghost = source.cloneNode(true);
    ghost.classList.remove('selected', 'is-dragging');
    ghost.classList.add('aut-native-drag-image');
    ghost.removeAttribute('data-aut-node');
    ghost.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ghost);
    try { event.dataTransfer.setDragImage(ghost, 22, 22); } catch (error) { /* Keep the browser drag image as fallback. */ }
    window.setTimeout(function () { ghost.remove(); }, 0);
  }

  function clearScratchDragState() {
    stopDragAutoScroll();
    removeLibraryDragGhost();
    removeScratchDragGhost();
    automationView.querySelectorAll('.aut-editable-node-wrap.is-dragging').forEach(function (node) { node.classList.remove('is-dragging'); });
    automationView.querySelectorAll('.aut-add.aut-drop-target,.aut-add.aut-drop-invalid').forEach(function (button) {
      button.classList.remove('aut-drop-target', 'aut-drop-invalid');
    });
    automationView.querySelectorAll('.aut-canvas.is-node-dragging').forEach(function (canvas) { canvas.classList.remove('is-node-dragging'); });
    automationView.querySelectorAll('.aut-canvas.is-library-dragging').forEach(function (canvas) { canvas.classList.remove('is-library-dragging'); });
    automationView.querySelectorAll('.aut-canvas.is-library-trigger-dragging').forEach(function (canvas) { canvas.classList.remove('is-library-trigger-dragging'); });
    automationView.querySelectorAll('.aut-library-block.is-dragging').forEach(function (block) { block.classList.remove('is-dragging'); });
    automationView.querySelectorAll('.aut-library-trigger-target').forEach(function (node) { node.classList.remove('aut-library-trigger-target'); });
    scratchDraggedNode = null;
    libraryDraggedBlock = null;
  }

  function scratchDropButtonAtPoint(x, y) {
    const element = document.elementFromPoint(x, y);
    const directButton = element ? element.closest('.aut-add[data-aut-add^="scratch"]') : null;
    if (directButton) return directButton;

    // The visible insertion frame is deliberately larger than the compact +
    // control. Match that same footprint so the user can release anywhere in
    // the frame, rather than having to hit the tiny button in its centre.
    let nearestButton = null;
    let nearestDistance = Infinity;
    automationView.querySelectorAll('.aut-add[data-aut-add^="scratch"]').forEach(function (button) {
      const rect = button.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const centreX = rect.left + rect.width / 2;
      const centreY = rect.top + rect.height / 2;
      const hitHalfWidth = Math.max(150, rect.width / 2);
      const hitHalfHeight = Math.max(28, rect.height / 2);
      if (Math.abs(x - centreX) > hitHalfWidth || Math.abs(y - centreY) > hitHalfHeight) return;
      const distance = Math.abs(y - centreY) + Math.abs(x - centreX) * 0.08;
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestButton = button;
      }
    });
    return nearestButton;
  }

  function libraryDropTargetAtPoint(blockId, x, y) {
    const block = workflowBlock(blockId);
    const element = document.elementFromPoint(x, y);
    if (!block || !element) return { block: block, dropButton: null, triggerNode: null };
    return {
      block: block,
      dropButton: block.type === 'trigger' ? null : scratchDropButtonAtPoint(x, y),
      triggerNode: block.type === 'trigger' ? element.closest('[data-aut-node="scratch-trigger"]') : null
    };
  }

  function updateLibraryDropHighlight(blockId, x, y) {
    const target = libraryDropTargetAtPoint(blockId, x, y);
    automationView.querySelectorAll('.aut-add.aut-drop-target').forEach(function (button) {
      if (button !== target.dropButton) button.classList.remove('aut-drop-target');
    });
    automationView.querySelectorAll('.aut-library-trigger-target').forEach(function (node) {
      if (node !== target.triggerNode) node.classList.remove('aut-library-trigger-target');
    });
    if (target.dropButton) target.dropButton.classList.add('aut-drop-target');
    if (target.triggerNode) target.triggerNode.classList.add('aut-library-trigger-target');
    return target;
  }

  function updateScratchDropHighlight(dropButton, nodeName) {
    automationView.querySelectorAll('.aut-add.aut-drop-target,.aut-add.aut-drop-invalid').forEach(function (button) {
      if (button !== dropButton) button.classList.remove('aut-drop-target', 'aut-drop-invalid');
    });
    if (!dropButton) return;
    if (canDropScratchNode(nodeName, dropButton)) {
      dropButton.classList.remove('aut-drop-invalid');
      dropButton.classList.add('aut-drop-target');
    } else {
      dropButton.classList.remove('aut-drop-target');
      dropButton.classList.add('aut-drop-invalid');
    }
  }

  function moveScratchNodeToDrop(nodeName, dropButton) {
    const config = activeConfig();
    if (!hasEditableStepModel(config) || !dropButton) return;
    const source = scratchStepReference(config, nodeName);
    const target = scratchDropReference(dropButton);
    if (!source.step) return;
    if (!canDropScratchNode(nodeName, dropButton)) {
      showAutomationToast('Move this Rule outside its own Yes or No branches.');
      return;
    }

    beginEditableDraftVersion(config);
    const movedStep = source.step;
    const sourceList = source.list;
    const targetList = target.list;
    if (!sourceList || !targetList) return;
    let insertIndex = target.insertIndex;

    sourceList.splice(source.index, 1);
    if (sourceList === targetList && source.index < insertIndex) insertIndex -= 1;
    insertIndex = Math.max(0, Math.min(insertIndex, targetList.length));
    movedStep.canvas = { x: 0, y: 0 };
    targetList.splice(insertIndex, 0, movedStep);
    normalizeScratchTree(config);
    const movedPath = scratchFindStepPath(config, movedStep);
    activeNode = movedPath ? 'scratch-path:' + movedPath : 'scratch-trigger';

    persistAutomationState();
    updateCanvas();
    renderInspector(activeNode);
    showAutomationToast('Step moved to the ' + (target.branch === 'no' ? 'No branch.' : (target.branch === 'yes' ? 'Yes branch.' : 'main path.')));
  }

  function scratchSummaryStepMarkup(step) {
    const text = scratchStepText(step);
    return '<li><span class="aut-flow-summary-dot"></span><div><strong>' + escapeAutomationHtml(text.title) + '</strong><span>' + escapeAutomationHtml(text.detail) + '</span></div></li>';
  }

  function scratchSummaryBranchMarkup(label, tone, steps) {
    const branchSteps = Array.isArray(steps) ? steps : [];
    return '<div class="aut-flow-summary-branch ' + tone + '"><strong>' + label + '</strong><div>' +
      (branchSteps.length
        ? scratchSummarySequenceMarkup(branchSteps, false)
        : '<span class="aut-flow-summary-end">End workflow</span>') +
    '</div></div>';
  }

  function scratchSummarySequenceMarkup(steps, expandBranches) {
    const sequence = Array.isArray(steps) ? steps : [];
    return '<ol>' + sequence.map(function (step) {
      if (step.type !== 'condition') return scratchSummaryStepMarkup(step);
      const checkMarkup = '<li class="aut-flow-summary-nested-check"><span class="aut-flow-summary-dot"></span><div><strong>Check: ' + escapeAutomationHtml(step.condition.replace(/\?+$/, '')) + '?</strong><span>' + (expandBranches === false ? 'Continue to this check' : 'Follow the matching branch') + '</span></div></li>';
      if (expandBranches === false) return checkMarkup;
      return checkMarkup + '<li class="aut-flow-summary-nested-branches"><div class="aut-flow-summary-branches">' +
        scratchSummaryBranchMarkup('IF YES', 'yes', step.yesSteps) + scratchSummaryBranchMarkup('IF NO', 'no', step.noSteps) +
      '</div></li>';
    }).join('') + '</ol>';
  }

  function scratchFlowSummaryMarkup(config) {
    const trigger = scratchTriggerText(config);
    normalizeScratchTree(config);
    const steps = config.steps;
    return '<section class="aut-flow-summary" aria-label="Flow summary">' +
      '<header><span class="aut-flow-summary-icon"><i class="fai">&#xf0e8;</i></span><div><strong>Flow summary</strong><span>What this automation will do</span></div></header>' +
      '<div class="aut-flow-summary-trigger"><small>STARTS WHEN</small><strong>' + escapeAutomationHtml(trigger.title) + '</strong><span>' + escapeAutomationHtml(trigger.detail) + '</span></div>' +
      (steps.length ? '<div class="aut-flow-summary-tree">' + scratchSummarySequenceMarkup(steps, true) + '</div>' : '<div class="aut-flow-summary-empty">No actions added yet.</div>') +
    '</section>';
  }

  function setScratchInspectorContent(config, content) {
    // The persistent Flow summary already sits above this inspector. Keep the
    // selected step fields at the top so a click always exposes editable data.
    inspectorBody.innerHTML = content;
    inspectorBody.scrollTop = 0;
    if (automationInspector) automationInspector.scrollTop = 0;
  }

  function completionEventsForConfig(config) {
    if (!config) return [['deal-leaves-stage', 'Deal leaves this Stage']];
    const stageName = workflowStageName(config);
    const definition = automationStageDefinition(stageName, config.triggerPipelineId) || {};
    if (definition.custom && !definition.quoteConnected) {
      return [['deal-leaves-stage', 'Deal leaves ' + stageName]];
    }
    const segment = definition.lifecycleSegment || stageName;
    const bySegment = {
      Qualified: [['first-related-quote', 'First related Quote is created']],
      'In Progress': [
        ['quote-submitted-review', 'Quote is submitted for internal review'],
        ['quote-sent', 'Quote is sent · when Quote Review is off']
      ],
      'In Review': [['quote-review-passed', 'Quote Review is passed']],
      'Passed Review': [['quote-sent', 'Quote is sent to the customer']],
      Sent: [
        ['quote-accepted', 'A related Quote is accepted'],
        ['deal-lost', 'Deal becomes Lost because no viable Quote remains']
      ],
      Won: [['deal-leaves-stage', 'Deal leaves Won after a confirmed reversal']],
      Lost: [['deal-leaves-stage', 'Deal leaves Lost after a confirmed reopen']]
    };
    return bySegment[segment] || [['deal-leaves-stage', 'Deal leaves this Stage']];
  }

  function defaultCompletionEvent(config) {
    const events = completionEventsForConfig(config);
    return events.length ? events[0][0] : 'deal-leaves-stage';
  }

  function completionEventOptions(selected, config) {
    const events = completionEventsForConfig(config);
    if (selected && !events.some(function (event) { return event[0] === selected; })) {
      events.unshift([selected, 'Previously selected checkpoint · review required']);
    }
    return events.map(function (event) {
      return '<option value="' + event[0] + '"' + (selected === event[0] ? ' selected' : '') + '>' + escapeAutomationHtml(event[1]) + '</option>';
    }).join('');
  }

  function completionSettingsMarkup(mode, blockedEvent, prefix, config) {
    const required = mode === 'required';
    const idPrefix = prefix || 'autAction';
    return '<div class="aut-field"><label for="' + idPrefix + 'Completion">Completion</label>' +
      '<select id="' + idPrefix + 'Completion"><option value="optional"' + (!required ? ' selected' : '') + '>Optional</option><option value="required"' + (required ? ' selected' : '') + '>Required to continue</option></select>' +
      '<span class="aut-help">Optional work can be skipped. Required work must be completed before the selected event can continue.</span></div>' +
      '<div class="aut-field" data-aut-completion-target' + (!required ? ' hidden' : '') + '><label for="' + idPrefix + 'BlockedEvent">Must be completed before</label>' +
      '<select id="' + idPrefix + 'BlockedEvent">' + completionEventOptions(blockedEvent || defaultCompletionEvent(config), config) + '</select>' +
      '<span class="aut-help">Only shown for Required actions. The selected event waits until this Action is completed.</span></div>';
  }

  function renderScratchInspector(nodeName) {
    const config = activeConfig();
    showAutomationStepSettingsPane();
    activeNode = nodeName;
    if (automationInspector) automationInspector.hidden = false;
    const selectedUidMatch = /^scratch-uid:(.+)$/.exec(nodeName || '');
    const selectedUid = selectedUidMatch ? selectedUidMatch[1] : '';
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      const wrap = node.closest('[data-aut-step-id]');
      const wrapUid = wrap ? wrap.dataset.autStepId : '';
      const selected = node.dataset.autNode === nodeName || (!!selectedUid && wrapUid === selectedUid);
      node.classList.toggle('selected', selected);
      if (wrap) wrap.classList.toggle('active', selected);
    });
    if (nodeName === 'scratch-trigger') {
      const trigger = scratchTriggerText(config);
      const fixedStage = workflowStageName(config);
      inspectorStep.textContent = fixedStage + ' · Start event';
      inspectorTitle.textContent = 'Edit when this Automation starts';
      inspectorFoot.hidden = false;
      const stageDefinition = automationStageDefinition(fixedStage, config.triggerPipelineId);
      const compatibleTriggers = stageDefinition
        ? stageDefinition.triggerChoices.map(function (choice) { return choice[1]; })
        : [trigger.title];
      if (compatibleTriggers.indexOf(trigger.title) < 0) compatibleTriggers.unshift(trigger.title);
      const templateTriggerLocked = !!config.templateKey;
      setScratchInspectorContent(config, '<div class="aut-stage-lock-summary"><i class="fai">&#xf023;</i><span><small>SALES PIPELINE STAGE</small><strong>' + escapeAutomationHtml(fixedStage) + '</strong><em>Stage is fixed for this Automation</em></span></div><div class="aut-stage-lock-summary company"><i class="fai">&#xf1ad;</i><span><small>OWNING COMPANY SCOPE</small><strong>' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong><em>Fixed enrolment metadata · choose it before entering the Builder</em></span></div>' + automationCompanyScopePillsMarkup(config, 'inspector') + '<div class="aut-rule"><strong>Current event</strong><div class="aut-help" style="margin-top:5px;">' + escapeAutomationHtml(trigger.title) + ' · ' + escapeAutomationHtml(trigger.detail || automationPipelineName(config)) + '</div></div><div class="aut-field"><label for="autEditableTrigger">Start when</label><select id="autEditableTrigger"' + (templateTriggerLocked ? ' disabled' : '') + '>' + compatibleTriggers.map(function (item) { return '<option' + (item === trigger.title ? ' selected' : '') + '>' + escapeAutomationHtml(item) + '</option>'; }).join('') + '</select><span class="aut-help">' + (templateTriggerLocked ? 'This template uses one precise start event. Use Create from scratch when a different event is required.' : 'Only events that can happen at ' + escapeAutomationHtml(fixedStage) + ' are available. Save changes to update the event.') + '</span></div>');
      return;
    }
    const reference = scratchStepReference(config, nodeName);
    const index = reference.index;
    const step = reference.step;
    if (!step) {
      inspectorStep.textContent = 'Selected step';
      inspectorTitle.textContent = 'Step settings unavailable';
      inspectorFoot.hidden = true;
      setScratchInspectorContent(config, '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>This step could not be loaded. Select the card again to refresh its settings.</span></div>');
      return;
    }
    const removeAttribute = 'data-aut-remove-path="' + escapeAutomationHtml(reference.path) + '"';
    inspectorStep.textContent = reference.branch === 'main' ? 'Step ' + (index + 2) + ' · Custom automation' : reference.branch.toUpperCase() + ' branch · Step ' + (index + 1);
    inspectorFoot.hidden = false;
    if (step.type === 'wait') {
      inspectorTitle.textContent = 'Wait before continuing';
      setScratchInspectorContent(config, '<div class="aut-field"><label for="autScratchWaitDays">Number of calendar days</label><input id="autScratchWaitDays" type="number" min="1" max="90" value="' + step.days + '"></div><div class="aut-help">The automation pauses this record, then continues to the next step.</div><button class="aut-btn" type="button" ' + removeAttribute + '>Remove step</button>');
    } else if (step.type === 'condition') {
      inspectorTitle.textContent = 'Set a Rule';
      const isConditionGroup = step.conditionKind === 'group' || step.condition === 'All criteria match (AND)' || step.condition === 'Any criterion matches (OR)';
      const conditionChoices = automationConditionChoices(config, isConditionGroup);
      if (conditionChoices.indexOf(step.condition) < 0) conditionChoices.unshift(step.condition);
      setScratchInspectorContent(config, '<div class="aut-field"><label for="autScratchCondition">' + (isConditionGroup ? 'Match rules' : 'Rule') + '</label><select id="autScratchCondition">' + conditionChoices.map(function (item) { return '<option' + (step.condition === item ? ' selected' : '') + '>' + escapeAutomationHtml(item) + '</option>'; }).join('') + '</select></div><div class="aut-rule"><strong>Yes / No result</strong><div class="aut-help" style="margin-top:5px;">YES and NO can both contain steps. An empty branch ends safely.</div></div><button class="aut-btn" type="button" ' + removeAttribute + '>Remove step</button>');
    } else {
      inspectorTitle.textContent = 'Take an action';
      const earlierSteps = (reference.list || []).slice(0, Math.max(0, reference.index)).map(function (candidate, candidateIndex) {
        return { value: 'Step ' + (candidateIndex + 2) + ' · ' + scratchStepText(candidate).title, label: scratchStepText(candidate).title };
      });
      applyScratchActionDefaults(step, config);
      const actionChoices = workflowBlockCatalog.filter(function (block) {
        return block.tab === 'action' && !block.disabled && isWorkflowBlockCompatible(block, config);
      }).map(function (block) { return block.label; });
      if (actionChoices.indexOf(step.action) < 0) actionChoices.unshift(step.action);
      if (earlierSteps.length || step.action === 'Return to earlier step') actionChoices.push('Return to earlier step');
      const isLegacyHumanTask = step.action === 'Create human task' || !!step.taskTitle;
      const isCreateNote = step.action === 'Create Note';
      const isScheduleMeeting = step.action === 'Schedule Meeting' || step.action === 'Schedule Meeting / Site Visit';
      const isCreateQuote = isCreateQuoteAction(step.action);
      const isLabelAction = isDealLabelAction(step.action);
      const isQuoteLabel = isQuoteLabelAction(step.action);
      const isAttachFile = isAutomaticFileAction(step.action);
      const isRequestFile = isFileRequestAction(step.action);
      const isNextAction = isNextActionAction(step.action);
      const isWatcher = isWatcherAction(step.action);
      const isInterest = isInterestAction(step.action);
      const isExpectedClose = isExpectedCloseAction(step.action);
      const isMoveStage = isMoveDealStageAction(step.action);
      const noteSettings = '<div class="aut-field"><label for="autScratchNoteTitle">Note title</label><input id="autScratchNoteTitle" value="' + escapeAutomationHtml(step.noteTitle || 'Follow-up note') + '"></div>' +
        '<div class="aut-field"><label for="autScratchNoteBody">Note template</label><textarea id="autScratchNoteBody" rows="4">' + escapeAutomationHtml(step.noteBody || 'Add the information the owner needs to follow up.') + '</textarea><span class="aut-help">Automation creates this Note on the matching CRM record.</span></div>' +
        '<div class="aut-field"><label for="autScratchMention">Mention one person</label><select id="autScratchMention">' + mentionOptions(step.mention || step.owner || 'Deal owner') + '</select><span class="aut-help">The Note is the work item. Mention identifies the one person responsible for handling it.</span></div>' +
        '<div class="aut-field"><label for="autScratchFollowUpDelay">Follow-up</label><select id="autScratchFollowUpDelay">' + followUpDelayOptions(step.followUpDelay || '1-working-day') + '</select></div>' +
        '<div class="aut-field"><label for="autScratchFollowUpTime">Follow-up time</label><input id="autScratchFollowUpTime" type="time" value="' + escapeAutomationHtml(step.followUpTime || '17:00') + '"></div>';
      const meetingSettings = '<div class="aut-field"><label for="autScratchMeetingTitle">Meeting title</label><input id="autScratchMeetingTitle" value="' + escapeAutomationHtml(step.meetingTitle || 'Customer meeting') + '"></div>' +
        '<div class="aut-field"><label for="autScratchMeetingAttendee">Attendee</label><select id="autScratchMeetingAttendee">' + mentionOptions(step.meetingAttendee || step.owner || 'Deal owner') + '</select></div>' +
        '<div class="aut-field"><label for="autScratchMeetingWhen">When</label><select id="autScratchMeetingWhen"><option' + ((step.meetingWhen || 'Next working day') === 'Next working day' ? ' selected' : '') + '>Next working day</option><option' + (step.meetingWhen === 'In 3 working days' ? ' selected' : '') + '>In 3 working days</option><option' + (step.meetingWhen === 'In 7 working days' ? ' selected' : '') + '>In 7 working days</option></select></div>' +
        '<div class="aut-field"><label for="autScratchMeetingTime">Time</label><input id="autScratchMeetingTime" type="time" value="' + escapeAutomationHtml(step.meetingTime || '10:00') + '"></div>' +
        '<div class="aut-field"><label for="autScratchMeetingDuration">Duration</label><select id="autScratchMeetingDuration"><option value="30"' + (String(step.meetingDuration || 60) === '30' ? ' selected' : '') + '>30 minutes</option><option value="60"' + (String(step.meetingDuration || 60) === '60' ? ' selected' : '') + '>1 hour</option><option value="90"' + (String(step.meetingDuration || 60) === '90' ? ' selected' : '') + '>1 hour 30 minutes</option></select></div>';
      const quoteSettings = '<div class="aut-stage-lock-summary"><i class="fai">&#xf15c;</i><span><small>QUOTE RESULT</small><strong>New Quote · In Progress</strong><em>Empty and fully editable · nothing is sent</em></span></div>' +
        '<div class="aut-rule aut-data-action-rule"><strong>Starts empty</strong><div class="aut-help" style="margin-top:5px;">The Quote uses the Deal customer and organisation pricing defaults. A Proposal template is added later from the Quote Proposal screen.</div></div>' +
        '<div class="aut-field"><label for="autScratchQuoteName">Quote name</label><input id="autScratchQuoteName" value="' + escapeAutomationHtml(step.quoteName || '{{Deal title}} · Quote') + '"><span class="aut-help">Use {{Deal title}} to carry the Deal name into the new Quote.</span></div>' +
        '<div class="aut-field"><label for="autScratchQuoteOwner">Assigned to</label><select id="autScratchQuoteOwner">' + quoteOwnerOptions(step.quoteOwner || step.owner || 'Deal owner') + '</select></div>' +
        '<div class="aut-field"><label for="autScratchQuoteExistingPolicy">If an In Progress Quote already exists</label><select id="autScratchQuoteExistingPolicy"><option value="skip-existing"' + (step.quoteExistingPolicy === 'skip-existing' ? ' selected' : '') + '>Do nothing · Recommended</option><option value="create-another"' + (step.quoteExistingPolicy === 'create-another' ? ' selected' : '') + '>Create another Quote</option></select><span class="aut-help">The default prevents duplicate Quotes when this Automation runs again.</span></div>' +
        '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>' + (workflowStageName(config) === 'Qualified' ? 'If this is the first related Quote, the protected lifecycle moves the Deal from <strong>Qualified</strong> to <strong>In Progress</strong>.' : 'The Quote starts at <strong>In Progress</strong>. Existing protected Deal and Quote lifecycle rules continue to apply.') + '</span></div>';
      const labelSettings = '<div class="aut-rule aut-data-action-rule"><strong>Deal Label result</strong><div class="aut-help" style="margin-top:5px;">Labels are flexible CRM tags. Hot, Warm, Cold, VIP and custom Labels use the same field.</div></div>' +
        '<div class="aut-field"><label for="autScratchDealLabel">Deal label</label><select id="autScratchDealLabel">' + dealLabelOptions(step.dealLabel) + '</select><span class="aut-help">Choose an existing CRM Label. Add never creates a duplicate; Remove skips safely when the Label is absent.</span></div>';
      const quoteLabelSettings = '<div class="aut-rule aut-data-action-rule"><strong>Quote Label result</strong><div class="aut-help" style="margin-top:5px;">Choose an existing Quote Label for the related Quote. This does not change the Deal Labels field.</div></div>' +
        '<div class="aut-field"><label for="autScratchQuoteLabel">Quote label</label><select id="autScratchQuoteLabel">' + quoteLabelOptions(step.quoteLabel) + '</select><span class="aut-help">If the related Quote already has this Label, the Action skips safely.</span></div>';
      const fileSelectionSetting = step.fileSource === 'upload'
        ? '<div class="aut-field"><label for="autScratchFileUpload">File for this Automation</label><input id="autScratchFileUpload" type="file"><span class="aut-help">' + (step.fileUploadedName ? 'Current file: ' + escapeAutomationHtml(step.fileUploadedName) : 'Upload one reusable file. The Simulator uses a safe snapshot and does not attach it to live CRM data.') + '</span></div>'
        : '<div class="aut-field"><label for="autScratchFileSelection">File to attach</label><select id="autScratchFileSelection">' + fileAttachmentOptions(step.fileSource, step.fileSelection) + '</select></div>';
      const fileSettings = '<div class="aut-stage-lock-summary file-action"><i class="fai">&#xf15b;</i><span><small>DESTINATION</small><strong>Deal Files</strong><em>Automation records the attachment in Deal History</em></span></div>' +
        '<div class="aut-field"><label for="autScratchFileSource">File source</label><select id="autScratchFileSource"><option value="upload"' + (step.fileSource === 'upload' ? ' selected' : '') + '>Upload file for this Automation</option><option value="template"' + (step.fileSource === 'template' ? ' selected' : '') + '>Reusable file template</option><option value="related"' + (step.fileSource === 'related' ? ' selected' : '') + '>Copy from related CRM record</option><option value="generated"' + (step.fileSource === 'generated' ? ' selected' : '') + '>WeQuote-generated document</option></select></div>' +
        fileSelectionSetting +
        '<div class="aut-field"><label for="autScratchFileDuplicate">If the file already exists</label><select id="autScratchFileDuplicate"><option value="skip"' + (step.fileDuplicatePolicy === 'skip' ? ' selected' : '') + '>Do nothing · Recommended</option><option value="version"' + (step.fileDuplicatePolicy === 'version' ? ' selected' : '') + '>Add a new version</option><option value="replace"' + (step.fileDuplicatePolicy === 'replace' ? ' selected' : '') + '>Replace the existing file</option></select><span class="aut-help">The default prevents duplicate attachments when an Automation re-enrols.</span></div>';
      const requestSettings = '<div class="aut-stage-lock-summary file-request"><i class="fai">&#xf56f;</i><span><small>CRM ACTIVITY</small><strong>Required file request</strong><em>Visible in Deal Focus, Files and History until the requested file is received</em></span></div>' +
        '<div class="aut-field"><label for="autScratchFileRequestName">File required</label><input id="autScratchFileRequestName" value="' + escapeAutomationHtml(step.fileRequestName || 'Site plans or drawings') + '"></div>' +
        '<div class="aut-field"><label for="autScratchFileRequestFrom">Request from</label><select id="autScratchFileRequestFrom"><option' + (step.fileRequestFrom === 'Primary Deal contact' ? ' selected' : '') + '>Primary Deal contact</option><option' + (step.fileRequestFrom === 'Customer organisation' ? ' selected' : '') + '>Customer organisation</option><option' + (step.fileRequestFrom === 'Deal owner' ? ' selected' : '') + '>Deal owner</option><option' + (step.fileRequestFrom === 'Project manager' ? ' selected' : '') + '>Project manager</option></select></div>' +
        '<div class="aut-field"><label for="autScratchFileRequestTypes">Accepted files</label><select id="autScratchFileRequestTypes"><option' + (step.fileRequestTypes === 'PDF, Word, Excel or image' ? ' selected' : '') + '>PDF, Word, Excel or image</option><option' + (step.fileRequestTypes === 'PDF only' ? ' selected' : '') + '>PDF only</option><option' + (step.fileRequestTypes === 'Drawing or CAD file' ? ' selected' : '') + '>Drawing or CAD file</option><option' + (step.fileRequestTypes === 'Any supported file' ? ' selected' : '') + '>Any supported file</option></select></div>' +
        '<div class="aut-field"><label for="autScratchFileRequestOwner">Managed by</label><select id="autScratchFileRequestOwner">' + ownerOptions(step.owner || 'Deal owner') + '</select></div>' +
        '<div class="aut-field"><label for="autScratchFileRequestDueDays">Due in</label><select id="autScratchFileRequestDueDays"><option value="1"' + (Number(step.fileRequestDueDays) === 1 ? ' selected' : '') + '>1 day</option><option value="3"' + (Number(step.fileRequestDueDays) === 3 ? ' selected' : '') + '>3 days</option><option value="7"' + (Number(step.fileRequestDueDays) === 7 ? ' selected' : '') + '>7 days</option><option value="14"' + (Number(step.fileRequestDueDays) === 14 ? ' selected' : '') + '>14 days</option></select><span class="aut-help">Uploading a matching file resolves the request and records the result in History.</span></div>';
      const nextActionSettings = step.action === 'Clear Deal Next Action'
        ? '<div class="aut-stage-lock-summary"><i class="fai">&#xf00c;</i><span><small>DEAL FOCUS</small><strong>Clear Deal Next Action</strong><em>Change is recorded in Deal History</em></span></div><div class="aut-field"><label for="autScratchNextActionClearPolicy">Clear policy</label><select id="autScratchNextActionClearPolicy"><option value="only-if-automation"' + (step.nextActionClearPolicy === 'only-if-automation' ? ' selected' : '') + '>Only if created by Automation · Recommended</option><option value="always"' + (step.nextActionClearPolicy === 'always' ? ' selected' : '') + '>Clear any current Next Action</option></select><span class="aut-help">The recommended policy avoids removing a task added manually by a salesperson.</span></div>'
        : '<div class="aut-stage-lock-summary"><i class="fai">&#xf0ae;</i><span><small>DEAL FOCUS</small><strong>Set Deal Next Action</strong><em>One clear next task, assignee and due date</em></span></div>' +
          '<div class="aut-field"><label for="autScratchNextActionType">Action type</label><select id="autScratchNextActionType"><option value="customer-followup"' + (step.nextActionType === 'customer-followup' ? ' selected' : '') + '>Customer follow-up</option><option value="meeting"' + (step.nextActionType === 'meeting' ? ' selected' : '') + '>Meeting</option><option value="site-visit"' + (step.nextActionType === 'site-visit' ? ' selected' : '') + '>Site visit</option><option value="proposal"' + (step.nextActionType === 'proposal' ? ' selected' : '') + '>Prepare proposal</option><option value="other"' + (step.nextActionType === 'other' ? ' selected' : '') + '>Other</option></select></div>' +
          '<div class="aut-field"><label for="autScratchNextActionTitle">Next Action</label><input id="autScratchNextActionTitle" value="' + escapeAutomationHtml(step.nextActionTitle || 'Follow up this Deal') + '"></div>' +
          '<div class="aut-field"><label for="autScratchNextActionOwner">Assigned to</label><select id="autScratchNextActionOwner">' + ownerOptions(step.owner || 'Deal owner') + '</select></div>' +
          '<div class="aut-field"><label for="autScratchNextActionDueDays">Due in</label><div class="aut-inline-fields"><input id="autScratchNextActionDueDays" type="number" min="0" max="365" value="' + Number(step.nextActionDueDays || 1) + '"><select id="autScratchNextActionDueUnit"><option value="working-days"' + (step.nextActionDueUnit === 'working-days' ? ' selected' : '') + '>working days</option><option value="calendar-days"' + (step.nextActionDueUnit === 'calendar-days' ? ' selected' : '') + '>calendar days</option></select></div></div>' +
          '<div class="aut-field"><label for="autScratchNextActionPolicy">If a Next Action already exists</label><select id="autScratchNextActionPolicy"><option value="replace-if-overdue"' + (step.nextActionPolicy === 'replace-if-overdue' ? ' selected' : '') + '>Replace only when overdue · Recommended</option><option value="skip"' + (step.nextActionPolicy === 'skip' ? ' selected' : '') + '>Keep existing and do nothing</option><option value="replace"' + (step.nextActionPolicy === 'replace' ? ' selected' : '') + '>Replace current Next Action</option></select></div>';
      const watcherSettings = '<div class="aut-stage-lock-summary"><i class="fai">&#xf06e;</i><span><small>DEAL PEOPLE</small><strong>' + escapeAutomationHtml(step.action) + '</strong><em>Owner remains unchanged</em></span></div><div class="aut-field"><label for="autScratchWatcher">Person</label><select id="autScratchWatcher">' + specificDealOwnerOptions(step.watcher || 'Lee Roche') + '</select><span class="aut-help">Add skips an existing watcher; Remove skips safely when the person is not following.</span></div>';
      const interestSettings = '<div class="aut-stage-lock-summary"><i class="fai">&#xf005;</i><span><small>DEAL DATA</small><strong>' + escapeAutomationHtml(step.action) + '</strong><em>Interests remain multi-select</em></span></div><div class="aut-field"><label for="autScratchInterest">Interest</label><select id="autScratchInterest">' + dealInterestOptions(step.interest) + '</select><span class="aut-help">Interests describe what the customer needs; flexible Deal Labels remain separate.</span></div>';
      const expectedCloseSettings = '<div class="aut-stage-lock-summary"><i class="fai">&#xf073;</i><span><small>APPROVED DEAL FIELD</small><strong>Expected Close Date</strong><em>Forecast timing only · it never changes Stage</em></span></div>' +
        '<div class="aut-field"><label for="autScratchExpectedCloseMode">Date rule</label><select id="autScratchExpectedCloseMode"><option value="relative"' + (step.expectedCloseMode === 'relative' ? ' selected' : '') + '>Set relative to run date</option><option value="fixed"' + (step.expectedCloseMode === 'fixed' ? ' selected' : '') + '>Use a fixed date</option></select></div>' +
        '<div class="aut-field"><label for="autScratchExpectedCloseDays">Relative days</label><input id="autScratchExpectedCloseDays" type="number" min="1" max="365" value="' + Number(step.expectedCloseDays || 30) + '"></div>' +
        '<div class="aut-field"><label for="autScratchExpectedCloseDate">Fixed date</label><input id="autScratchExpectedCloseDate" type="date" value="' + escapeAutomationHtml(step.expectedCloseDate || '') + '"><span class="aut-help">Only the field matching the selected Date rule is used.</span></div>';
      const moveAssessment = isMoveStage ? automationMoveStageAssessment(step, config) : { skipped: [], blocked: [] };
      const moveStageSettings = '<div class="aut-stage-lock-summary"><i class="fai">&#xf061;</i><span><small>EXPLICIT PIPELINE TARGET</small><strong>Move from ' + escapeAutomationHtml(workflowStageName(config)) + '</strong><em>The saved Stage ID does not change when the Pipeline is reordered</em></span></div>' +
        '<div class="aut-field"><label for="autScratchMoveTarget">Move Deal to</label><select id="autScratchMoveTarget">' + moveStageTargetOptions(step, config) + '</select><span class="aut-help">Quote Lifecycle milestones are not available as manual targets. Their trusted Quote events still control protected movement.</span></div>' +
        (moveAssessment.blocked.length
          ? '<div class="aut-info-note danger"><i class="fai">&#xf071;</i><span><strong>Move blocked</strong><br>This target skips required work in ' + escapeAutomationHtml(moveAssessment.blocked.map(function (stage) { return stage.name; }).join(', ')) + '. Change the target or make that work optional.</span></div>'
          : (moveAssessment.skipped.length
            ? '<div class="aut-info-note warning"><i class="fai">&#xf071;</i><span><strong>Review skipped Stages</strong><br>This explicit move skips ' + escapeAutomationHtml(moveAssessment.skipped.map(function (stage) { return stage.name; }).join(', ')) + '. Their optional Automations will not run.</span></div>'
            : (moveAssessment.backwards ? '<div class="aut-info-note warning"><i class="fai">&#xf071;</i><span>This moves the Deal backwards. The change will be recorded in Deal Activity and Change history.</span></div>' : '')));
      let actionSettings = '';
      if (step.action === 'Return to earlier step') actionSettings = '<div class="aut-field"><label for="autScratchTarget">Return to</label><select id="autScratchTarget">' + earlierSteps.map(function (item) { return '<option value="' + escapeAutomationHtml(item.value) + '"' + (step.target === item.value ? ' selected' : '') + '>' + escapeAutomationHtml(item.label) + '</option>'; }).join('') + '</select><span class="aut-help">Creates a controlled revision loop. The record returns to this earlier step; users do not need to draw a free-form line.</span></div>';
      else if (isCreateNote) actionSettings = noteSettings;
      else if (isScheduleMeeting) actionSettings = meetingSettings;
      else if (isCreateQuote) actionSettings = quoteSettings;
      else if (isLabelAction) actionSettings = labelSettings;
      else if (isQuoteLabel) actionSettings = quoteLabelSettings;
      else if (isAttachFile) actionSettings = fileSettings;
      else if (isRequestFile) actionSettings = requestSettings;
      else if (isNextAction) actionSettings = nextActionSettings;
      else if (isWatcher) actionSettings = watcherSettings;
      else if (isInterest) actionSettings = interestSettings;
      else if (isExpectedClose) actionSettings = expectedCloseSettings;
      else if (isMoveStage) actionSettings = moveStageSettings;
      else if (isLegacyHumanTask) actionSettings = '<div class="aut-field"><label for="autScratchTaskTitle">Task name</label><input id="autScratchTaskTitle" value="' + escapeAutomationHtml(step.taskTitle || 'Follow-up task') + '"><span class="aut-help">Legacy action. Change Action type to Create Note or Schedule Meeting.</span></div>';
      if (!(isCreateNote || isScheduleMeeting || isCreateQuote || isLabelAction || isQuoteLabel || isAttachFile || isRequestFile || isNextAction || isWatcher || isInterest || isExpectedClose || isMoveStage || step.action === 'Return to earlier step')) {
        actionSettings += '<div class="aut-field"><label for="autScratchOwner">' + (step.action === 'Assign specific Deal Owner' ? 'Deal Owner' : 'Assigned to') + '</label><select id="autScratchOwner">' + (step.action === 'Assign specific Deal Owner' ? specificDealOwnerOptions(step.owner) : ownerOptions(step.owner)) + '</select>' + (step.action === 'Assign specific Deal Owner' ? '<span class="aut-help">One named person only. Team and Round-robin assignment are not available in Phase 1.</span>' : '') + '</div>';
      }
      const supportsCompletionCheckpoint = isCreateNote || isScheduleMeeting || isRequestFile || isLegacyHumanTask;
      const completionSettings = supportsCompletionCheckpoint
        ? completionSettingsMarkup(step.completionMode, step.blockedEvent, 'autScratch', config)
        : '';
      setScratchInspectorContent(config, '<div class="aut-field"><label for="autScratchAction">Action type</label><select id="autScratchAction">' + actionChoices.map(function (item) { return '<option' + (step.action === item ? ' selected' : '') + '>' + escapeAutomationHtml(item) + '</option>'; }).join('') + '</select></div>' + actionSettings + completionSettings + '<button class="aut-btn" type="button" ' + removeAttribute + '>Remove step</button>');
    }
  }

  function rightFlowSummaryMarkup(config) {
    if (isLeadConversion(config)) {
      return '<header><span class="aut-inspector-summary-icon"><i class="fai">&#xf0e8;</i></span><div><strong>System rule summary</strong><span>Always-on Lead conversion</span></div></header>' +
        '<div class="aut-inspector-summary-row"><small>USER DOES</small><strong>Confirm Convert to Deal</strong><span>Choose the Pipeline, starting stage and first Deal Next Action in the conversion form.</span></div>' +
        '<div class="aut-inspector-summary-row"><small>WEQUOTE DOES</small><strong>Create the Deal and copy Lead data</strong><span>Company, contact, owner, notes, source and value are carried across. The Lead becomes Converted.</span></div>';
    }
    if (isProposalApproval(config)) {
      const map = config.stageMap || {};
      return '<header><span class="aut-inspector-summary-icon"><i class="fai">&#xf0e8;</i></span><div><strong>Flow summary</strong><span>What this automation will do</span></div></header>' +
        '<div class="aut-inspector-summary-row"><small>WHEN</small><strong>Deal enters ' + escapeAutomationHtml(map.qualify || 'Qualified') + '</strong></div>' +
        '<div class="aut-inspector-summary-row"><small>THEN</small><strong>' + escapeAutomationHtml((map.siteVisit || 'Site Visit') + ' → ' + (map.sow || 'Scope of Work') + ' → ' + (map.technicalReview || 'Technical Review')) + '</strong></div>' +
        '<div class="aut-inspector-summary-branches"><span><b>APPROVED</b>Create Quote → ' + escapeAutomationHtml(map.quoting || 'In Progress') + '</span><span><b>CHANGES</b>Return to Scope of Work</span></div>';
    }

    const steps = selectedWorkflowRunSteps(config);
    const trigger = steps[0] || { title: 'CRM event matched', detail: '' };
    const system = steps[1] || { title: 'Continue workflow', detail: '' };
    const condition = steps[2] || { title: 'Check CRM data', detail: '' };
    const action = steps[3] || { title: 'Run action', detail: '' };
    const systemDetail = isNewLeadWorkflow(config)
      ? (config.assignmentOwner === 'Round-robin sales team'
        ? 'Round-robin chooses the next salesperson and sets that person as Lead owner.'
        : config.assignmentOwner + ' becomes the Lead owner.')
      : system.detail;
    const noResult = isNewLeadWorkflow(config)
      ? 'End · no duplicate activity'
      : (isInactiveLeadWorkflow(config)
        ? 'End · existing activity is preserved'
        : (isQuoteWorkflow(config)
          ? 'End · existing Next Action is preserved'
          : (isWonHandoff(config) ? 'End · existing Next Action is preserved' : 'End workflow safely')));
    const yesResult = isNewLeadWorkflow(config)
      ? 'WeQuote Automation creates a ' + leadActivityTypeLabel(config.activityType) + ' activity'
      : action.title;
    const yesDetail = isNewLeadWorkflow(config)
      ? (config.assignmentOwner === 'Round-robin sales team'
        ? 'Assigned to the Lead owner selected by Round-robin · Due today at ' + automationTimeLabel(config.actionTime)
        : 'Assigned to ' + config.assignmentOwner + ' · Due today at ' + automationTimeLabel(config.actionTime))
      : '';
    return '<header><span class="aut-inspector-summary-icon"><i class="fai">&#xf0e8;</i></span><div><strong>Flow summary</strong><span>What this automation will do</span></div></header>' +
      '<div class="aut-inspector-summary-row"><small>WHEN</small><strong>' + escapeAutomationHtml(trigger.title) + '</strong><span>' + escapeAutomationHtml(trigger.detail) + '</span></div>' +
      '<div class="aut-inspector-summary-row"><small>THEN</small><strong>' + escapeAutomationHtml(system.title) + '</strong><span>' + escapeAutomationHtml(systemDetail) + '</span></div>' +
      '<div class="aut-inspector-summary-row check"><small>CHECK</small><strong>' + escapeAutomationHtml(condition.title.replace(/^Check:\s*/i, '')) + '</strong></div>' +
      '<div class="aut-inspector-summary-branches"><span><b>IF YES</b><strong>' + escapeAutomationHtml(yesResult) + '</strong>' + (yesDetail ? '<small>' + escapeAutomationHtml(yesDetail) + '</small>' : '') + '</span><span><b>IF NO</b><strong>' + escapeAutomationHtml(noResult) + '</strong>' + (isNewLeadWorkflow(config) ? '<small>No activity is created</small>' : '') + '</span></div>';
  }

  function updateRightFlowSummary(config) {
    if (!rightFlowSummary) return;
    if (!config) {
      rightFlowSummary.hidden = true;
      return;
    }
    if (hasEditableStepModel(config)) {
      const trigger = scratchTriggerText(config);
      let stepCount = 0;
      let conditionCount = 0;
      let actionCount = 0;
      let waitCount = 0;
      const countSteps = function (steps) {
        (Array.isArray(steps) ? steps : []).forEach(function (step) {
          stepCount += 1;
          if (step.type === 'condition') {
            conditionCount += 1;
            countSteps(step.yesSteps);
            countSteps(step.noSteps);
          } else if (step.type === 'action') actionCount += 1;
          else if (step.type === 'wait') waitCount += 1;
        });
      };
      countSteps(config.steps);
      const stageDefinition = automationStageDefinition(workflowStageName(config), config.triggerPipelineId) || {};
      const libraryTitle = stageDefinition.custom
        ? (stageDefinition.quoteConnected ? stageDefinition.lifecycleSegment + ' lifecycle segment' : 'Fully Custom · shared Stage library')
        : 'Protected Quote Lifecycle Stage';
      const libraryCopy = stageDefinition.custom
        ? (stageDefinition.quoteConnected ? 'Custom Stages in this segment share available blocks but keep independent settings.' : 'Every Stage name gets these same block choices; this Automation is saved only to the selected Stage.')
        : 'Only events compatible with this protected Stage are available.';
      rightFlowSummary.hidden = false;
      rightFlowSummary.innerHTML = '<header><span class="aut-inspector-summary-icon"><i class="fai">&#xf0e8;</i></span><div><strong>Flow summary</strong><span>What this Automation will do</span></div></header>' +
        '<div class="aut-inspector-summary-row"><small>WHEN</small><strong>' + escapeAutomationHtml(trigger.title) + '</strong><span>' + escapeAutomationHtml(trigger.detail) + '</span></div>' +
        '<div class="aut-inspector-summary-row"><small>BLOCK LIBRARY</small><strong>' + escapeAutomationHtml(libraryTitle) + '</strong><span>' + escapeAutomationHtml(libraryCopy) + '</span></div>' +
        '<div class="aut-inspector-summary-row"><small>FLOW</small><strong>' + stepCount + ' editable steps</strong><span>' + actionCount + ' actions · ' + conditionCount + ' rules · ' + waitCount + ' waits</span></div>' +
        (conditionCount ? '<div class="aut-inspector-summary-branches"><span><b>IF YES</b><strong>Follow the matching Yes path</strong></span><span><b>IF NO</b><strong>Follow the matching No path or end safely</strong></span></div>' : '');
      if (flowSummaryPanel) requestAnimationFrame(function () { flowSummaryPanel.scrollTop = 0; });
      return;
    }
    rightFlowSummary.hidden = false;
    rightFlowSummary.innerHTML = rightFlowSummaryMarkup(config);
    if (flowSummaryPanel) requestAnimationFrame(function () { flowSummaryPanel.scrollTop = 0; });
  }

  function renderInspector(nodeName) {
    const config = activeConfig();
    if (!config) return;
    showAutomationStepSettingsPane();
    if (isLeadConversion(config)) {
      renderLeadConversionInspector(nodeName);
      return;
    }
    if (hasEditableStepModel(config)) {
      renderScratchInspector(nodeName);
      return;
    }
    if (isProposalApproval(config)) {
      renderProposalInspector(nodeName);
      return;
    }
    activeNode = nodeName;
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      node.classList.toggle('selected', node.dataset.autNode === nodeName);
    });
    inspectorFoot.hidden = false;
    if (config.protected) inspectorFoot.hidden = true;

    if (nodeName === 'trigger') {
      inspectorStep.textContent = 'Step 1 of 4';
      inspectorTitle.textContent = '1. Choose when it starts';
      if (isNewLeadWorkflow(config)) {
        const leadTrigger = newLeadTriggerText(config);
        inspectorBody.innerHTML =
          '<div class="aut-field"><label>Start when</label><div class="aut-readonly-value">Any new Lead is created</div><span class="aut-help">Phase 1 supports one Lead-created event. It runs for a Lead created with + Create Lead and for any future connected form or import that emits the same event.</span></div>' +
          '<div class="aut-test-result"><strong>' + escapeAutomationHtml(leadTrigger.title) + '</strong><div style="margin-top:4px;">' + escapeAutomationHtml(leadTrigger.detail) + '</div></div>' +
          '<div class="aut-help">It applies only to Leads created after this automation is turned on.</div>';
      } else if (isInactiveLeadWorkflow(config)) {
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Eligibility scan: open Lead has no Next Activity</strong><div style="margin-top:4px;">Only active Leads in the inbox</div></div>' +
          '<div class="aut-help">The prototype evaluates eligible Leads when the automation is turned on or its demo event is run. It is not a background daily scheduler. Archived, discarded and converted Leads are excluded.</div>';
      } else if (isLeadConversion(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Start when a Lead is converted to a Deal</strong><div style="margin-top:4px;">From the Leads inbox or Lead record</div></div>' +
          '<div class="aut-field"><label for="autTriggerStage">New Deal enters</label><select id="autTriggerStage"' + (config.protected ? ' disabled' : '') + '>' + stageOptions(config.targetStage) + '</select><span class="aut-help">The converted Lead becomes a Deal in this pipeline stage.</span></div>' +
          '<div class="aut-rule"><strong>Lead conversion</strong><div class="aut-help" style="margin-top:5px;">Runs once after a user confirms Convert to Deal.</div></div>';
      } else if (isQuoteWorkflow(config)) {
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Start when a Quote is sent</strong><div style="margin-top:4px;">Only the first send of each Quote revision</div></div>' +
          '<div class="aut-help">Editing a sent Quote without sending it again will not restart this automation.</div>';
      } else if (isWonHandoff(config)) {
        const pipeline = automationPipelineForConfig(config);
        const pipelineName = pipeline && pipeline.name ? pipeline.name : 'Sales Pipeline';
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Run when a Deal moves between stages</strong><div style="margin-top:4px;">Scope this workflow to one CRM pipeline.</div></div>' +
          '<div class="aut-field"><label for="autTriggerPipeline">Pipeline</label><select id="autTriggerPipeline">' + automationPipelineOptions(config.triggerPipelineId) + '</select></div>' +
          '<div class="aut-field"><label>Pipeline stages</label>' + automationPipelineStripMarkup(pipeline, config.triggerToStage) + '</div>' +
          '<div class="aut-field"><label for="autTriggerFromStage">From stage</label><select id="autTriggerFromStage">' + automationStageOptionsForPipeline(pipeline, config.triggerFromStage, true) + '</select></div>' +
          '<div class="aut-field"><label for="autTriggerToStage">To stage</label><select id="autTriggerToStage" disabled>' + automationStageOptionsForPipeline(pipeline, config.triggerToStage, false) + '</select><span class="aut-help">This Won Deal template always targets the pipeline stage marked as Won.</span></div>' +
          '<div class="aut-rule"><strong>Run once per Deal</strong><div class="aut-help" style="margin-top:5px;">The first move into Won starts the handoff. Moving the same Deal away and back will not create another handoff.</div></div>' +
          '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>Stages are loaded from <strong>' + escapeAutomationHtml(pipelineName) + '</strong>. Deal cards stay on the CRM Kanban board.</span></div>';
      } else if (isQuoteInvoice(config)) {
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Start when a Quote is accepted</strong><div style="margin-top:4px;">The accepted Quote must belong to a Deal</div></div>' +
          '<div class="aut-rule"><strong><i class="fai">&#xf023;</i> Trusted acceptance event</strong><div class="aut-help" style="margin-top:5px;">A manual status edit cannot create an Invoice.</div></div>';
      } else {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autTriggerEvent">Start when</label><select id="autTriggerEvent"><option>A Deal enters a stage</option><option>A Deal is created</option><option>A Deal reaches its expected close date</option></select></div>' +
          '<div class="aut-field"><label for="autTriggerStage">Which stage?</label><select id="autTriggerStage">' + stageOptions(config.triggerStage) + '</select><span class="aut-help">These are the same stages used in ' + escapeAutomationHtml(automationPipelineName()) + '.</span></div>' +
          '<div class="aut-rule"><strong>Optional repeat rule</strong><label class="aut-radio"><input id="autReenrol" type="checkbox"> Run again if the Deal leaves this stage and comes back later</label></div>';
      }
      return;
    }

    if (nodeName === 'wait') {
      inspectorStep.textContent = 'Step 2 of 4';
      if (isNewLeadWorkflow(config)) {
        inspectorTitle.textContent = '2. Choose who owns the Lead';
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autAssignmentOwner">Assign new Leads to</label><select id="autAssignmentOwner">' + assignmentOptions(config.assignmentOwner) + '</select></div>' +
          '<div class="aut-help">Round-robin distributes new Leads evenly across the sales team.</div>';
        return;
      }
      if (isLeadConversion(config)) {
        inspectorTitle.textContent = '2. What WeQuote copies';
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Create the Deal automatically</strong><div style="margin-top:4px;">Pipeline stage: ' + escapeAutomationHtml(config.targetStage) + '</div></div>' +
          '<div class="aut-rule"><strong>Copied from the Lead</strong><div class="aut-help" style="margin-top:6px;line-height:1.7;">Company and contact<br>Owner and source<br>Notes, labels and interests<br>Estimated value and next-step context</div></div>' +
          '<div class="aut-help">This is a protected system step so important conversion data cannot be accidentally removed.</div>';
        return;
      }
      if (isWonHandoff(config)) {
        inspectorTitle.textContent = '2. Won outcome context';
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>The Deal is already in ' + escapeAutomationHtml(config.triggerToStage) + '</strong><div style="margin-top:4px;">Reaching Won is the trigger; this automation does not move or win the Deal.</div></div>' +
          '<div class="aut-rule"><strong><i class="fai">&#xf023;</i> Outcome protected by WeQuote</strong><div class="aut-help" style="margin-top:5px;">Quote acceptance and Deal outcome rules happen before this handoff automation starts.</div></div>';
        return;
      }
      if (isQuoteInvoice(config)) {
        inspectorTitle.textContent = '2. Prepare Deal billing';
        inspectorFoot.hidden = true;
        inspectorBody.innerHTML =
          '<div class="aut-test-result"><strong>Use the accepted Quote linked to this Deal</strong><div style="margin-top:4px;">The accepted value becomes the billing baseline</div></div>' +
          '<div class="aut-rule"><strong><i class="fai">&#xf023;</i> Protected billing preparation</strong><div class="aut-help" style="margin-top:5px;">WeQuote keeps Quote value, Change Order deltas and Invoice allocation rules intact.</div></div>';
        return;
      }
      inspectorTitle.textContent = (isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? '2. Choose when the activity is due' : '2. Choose how long to wait';
      inspectorBody.innerHTML =
        '<div class="aut-field"><label for="autWaitDays">Due after</label><input id="autWaitDays" type="number" min="0" max="90" value="' + config.waitDays + '"></div>' +
        '<div class="aut-field"><label for="autWaitType">Day type</label><select id="autWaitType"><option>Calendar days</option><option>Business days</option></select><span class="aut-help">' + ((isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? 'The activity is created immediately with this future due date. The prototype does not pause and re-check later.' : 'The next step runs after this delay.') + '</span></div>';
      return;
    }

    if (nodeName === 'condition') {
      inspectorStep.textContent = 'Step 3 of 4';
      inspectorTitle.textContent = '3. Choose what to check';
      if (isNewLeadWorkflow(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition" disabled><option selected>No open first-contact activity exists</option></select></div>' +
          '<div class="aut-rule"><strong>Why check this?</strong><div class="aut-help" style="margin-top:5px;">Checks Lead Activities before creating anything, so the Lead never receives a duplicate first-contact activity.</div></div>';
        return;
      }
      if (isInactiveLeadWorkflow(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition"><option selected>' + escapeAutomationHtml(config.condition) + '</option></select></div>' +
          '<div class="aut-rule"><strong>Why check this?</strong><div class="aut-help" style="margin-top:5px;">Skip the Lead if it already has any open activity or an inactive-reminder activity created by this automation.</div></div>';
        return;
      }
      if (isLeadConversion(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition" disabled><option selected>Deal was created successfully</option></select></div>' +
          '<div class="aut-rule"><strong>Why check this?</strong><div class="aut-help" style="margin-top:5px;">The follow-up task is created only after the new Deal exists. Failed conversions stop safely for review.</div></div>';
        return;
      }
      if (isQuoteWorkflow(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition"><option selected>No open Deal next action exists</option></select></div>' +
          '<div class="aut-rule"><strong>Why check this?</strong><div class="aut-help" style="margin-top:5px;">The CRM has one Deal Next Action. The automation skips the follow-up instead of overwriting an existing open action.</div></div>';
        return;
      }
      if (isWonHandoff(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition" disabled><option selected>No open Deal next action exists</option></select></div>' +
          '<div class="aut-rule"><strong>Why check this?</strong><div class="aut-help" style="margin-top:5px;">The current CRM has one Deal Next Action. This workflow never overwrites an existing open action.</div></div>';
        return;
      }
      if (isQuoteInvoice(config)) {
        inspectorBody.innerHTML =
          '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition"><option selected>Deposit amount is available to invoice</option></select></div>' +
          '<div class="aut-rule"><strong>Actual safeguards in this prototype</strong><div class="aut-help" style="margin-top:5px;">The accepted Quote has remaining value, belongs to a Deal and this automation has not already created a Draft Invoice for it.</div></div>';
        return;
      }
      inspectorBody.innerHTML =
        '<div class="aut-field"><label for="autCondition">Check</label><select id="autCondition"><option' + (config.condition === 'No new sales activity' ? ' selected' : '') + '>No new sales activity</option><option' + (config.condition === 'No onboarding task exists' ? ' selected' : '') + '>No onboarding task exists</option><option>Expected close date is overdue</option><option>Quote expires within 7 days</option></select></div>' +
        '<div class="aut-rule"><strong>Sales activity includes</strong><div class="aut-help" style="margin-top:5px;">Meeting, note follow-up and Quote expiry activity already used by CRM filters.</div></div>';
      return;
    }

    inspectorStep.textContent = 'Step 4 of 4 · Yes branch';
    inspectorTitle.textContent = '4. Choose what happens next';
    if (isNewLeadWorkflow(config)) {
      inspectorTitle.textContent = '4. Create a Lead activity';
      inspectorBody.innerHTML =
        '<div class="aut-test-result"><strong>Created by WeQuote Automation</strong><div style="margin-top:4px;">The system creates this scheduled activity on the Lead record. The assignee is responsible for completing it; they do not create it manually.</div></div>' +
        '<div class="aut-field"><label for="autRecordType">Record type</label><select id="autRecordType" disabled><option selected>Lead activity</option></select></div>' +
        '<div class="aut-field"><label for="autActivityType">Activity type</label><select id="autActivityType">' + leadActivityTypeOptions(config.activityType) + '</select></div>' +
        '<div class="aut-field"><label for="autActivityTitle">Title</label><input id="autActivityTitle" value="' + escapeAutomationHtml(config.activityTitle) + '" maxlength="80"></div>' +
        '<div class="aut-field"><label for="autActionOwner">Assigned to</label><select id="autActionOwner" disabled><option selected>Lead owner</option></select></div>' +
        '<div class="aut-field"><label for="autActionDue">Due</label><select id="autActionDue" disabled><option selected>Today</option></select></div>' +
        '<div class="aut-field"><label for="autActionTime">Time</label><input id="autActionTime" type="time" value="' + escapeAutomationHtml(config.actionTime) + '"></div>' +
        '<div class="aut-field"><label for="autActivityStatus">Status</label><select id="autActivityStatus" disabled><option selected>Scheduled</option></select></div>' +
        '<div class="aut-help"><strong>Result:</strong> it appears in the Lead Activity timeline and under Next Activity. This does not create a Workhub task or calendar event.</div>';
      return;
    }
    if (isQuoteInvoice(config)) {
      inspectorFoot.hidden = false;
      inspectorBody.innerHTML =
        '<div class="aut-test-result"><strong>Create a Draft Invoice</strong><div style="margin-top:4px;">Billing stage: ' + escapeAutomationHtml(config.billingStage) + '</div></div>' +
        '<div class="aut-rule"><strong>Safety rule</strong><div class="aut-help" style="margin-top:5px;">Draft only. Nothing is emailed, posted to accounting or marked as paid until Finance reviews it.</div></div>' +
        '<div class="aut-field"><label for="autDepositPercent">Deposit percentage</label><input id="autDepositPercent" type="number" min="1" max="100" value="' + escapeAutomationHtml(config.depositPercent) + '"></div>' +
        '<div class="aut-field"><label for="autInvoiceMode">Invoice mode</label><select id="autInvoiceMode" disabled><option selected>Draft only</option></select></div>';
      return;
    }
    if (config.protected) {
      inspectorBody.innerHTML =
        '<div class="aut-test-result"><strong>' + escapeAutomationHtml(config.actionName) + '</strong><div style="margin-top:4px;">Assigned to ' + escapeAutomationHtml(config.actionOwner) + ' · Due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '</div></div>' +
        '<div class="aut-rule"><strong><i class="fai">&#xf023;</i> Protected by WeQuote</strong><div class="aut-help" style="margin-top:5px;">This action is part of the reliable Lead conversion handoff and cannot be changed here.</div></div>';
      return;
    }
    inspectorFoot.hidden = true;
    if (isInactiveLeadWorkflow(config)) {
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>Create a scheduled Call activity immediately</strong><div style="margin-top:4px;">Assigned to Lead owner · Due ' + config.waitDays + ' days from the eligibility scan at 10:00 am</div></div><div class="aut-help"><strong>Appears in Lead Activities and Next Activity.</strong> It does not create a Workhub task or wait in the background.</div>';
      return;
    }
    if (isQuoteWorkflow(config)) {
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>Create the Deal follow-up immediately</strong><div style="margin-top:4px;">Assigned to Deal owner · Due ' + config.waitDays + ' days after Quote send at 10:00 am</div></div><div class="aut-help">Uses the Deal Next Action already shown in the CRM Deal record and never overwrites an open one.</div>';
      return;
    }
    if (isWonHandoff(config)) {
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>Create a Deal handoff Next Action</strong><div style="margin-top:4px;">Assigned to Deal owner · Due today</div></div><div class="aut-help">Created only when the Won Deal has no existing open Next Action.</div>';
      return;
    }
    inspectorFoot.hidden = false;
    inspectorBody.innerHTML =
      '<div class="aut-field"><label for="autActionName">Action</label><input id="autActionName" value="' + escapeAutomationHtml(config.actionName || 'Create activity / task') + '"></div>' +
      '<div class="aut-field"><label for="autActionOwner">Assigned to</label><select id="autActionOwner">' + ownerOptions(config.actionOwner || 'Deal owner') + '</select></div>' +
      '<div class="aut-field"><label for="autActionDue">Due</label><select id="autActionDue"><option' + (config.actionDue === 'Today' ? ' selected' : '') + '>Today</option><option' + (config.actionDue === 'Tomorrow' ? ' selected' : '') + '>Tomorrow</option><option' + (config.actionDue === 'Before the first Quote can be created' ? ' selected' : '') + '>Before the first Quote can be created</option></select></div>' +
      completionSettingsMarkup(config.completionMode, config.blockedEvent, 'autAction', config);
  }

  function renderLeadConversionInspector(nodeName) {
    const config = activeConfig();
    if (nodeName === 'trigger') nodeName = 'conversion-trigger';
    activeNode = nodeName;
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      node.classList.toggle('selected', node.dataset.autNode === nodeName);
    });
    inspectorFoot.hidden = true;
    if (nodeName === 'conversion-input') {
      inspectorStep.textContent = 'Required user input';
      inspectorTitle.textContent = 'Complete the conversion form';
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>Choose before confirming</strong><div style="margin-top:6px;line-height:1.7;">Pipeline<br>Starting stage (Qualified by default)<br>First Deal Next Action<br>Due date and time</div></div><div class="aut-help">These choices belong to the Convert to Deal form. They are not generated by this system rule.</div>';
      return;
    }
    if (nodeName === 'conversion-result') {
      inspectorStep.textContent = 'Protected system result';
      inspectorTitle.textContent = 'Create and link the Deal';
      inspectorBody.innerHTML = '<div class="aut-test-result"><strong>WeQuote creates the Deal in the selected stage</strong><div style="margin-top:4px;">The Lead becomes Converted and remains linked for history.</div></div><div class="aut-rule"><strong>Copied from the Lead</strong><div class="aut-help" style="margin-top:6px;line-height:1.7;">Company and contact<br>Owner and source<br>Notes, labels and interests<br>Estimated value</div></div>';
      return;
    }
    inspectorStep.textContent = 'Protected user action';
    inspectorTitle.textContent = 'Convert Lead to Deal';
    inspectorBody.innerHTML = '<div class="aut-test-result"><strong>User confirms Convert to Deal</strong><div style="margin-top:4px;">Available from the Leads inbox and Lead record.</div></div><div class="aut-rule"><strong><i class="fai">&#xf023;</i> Always on</strong><div class="aut-help" style="margin-top:5px;">This is a core CRM handoff, not a configurable automation template.</div></div>';
  }

  function renderLeadConversionCanvas(config) {
    if (!['conversion-trigger', 'conversion-input', 'conversion-result'].includes(activeNode)) activeNode = 'conversion-trigger';
    automationFlow.dataset.mode = 'conversion';
    automationFlow.classList.remove('aut-proposal-flow');
    workflowTitle.textContent = config.title;
    workflowMeta.textContent = 'Always on · Protected system rule';
    plainSummary.textContent = 'A user chooses the Pipeline, starting stage and first Deal Next Action in the conversion form. WeQuote then creates the Deal, copies the Lead data and marks the Lead as Converted.';
    publishButton.textContent = 'System rule · Always on';
    publishButton.disabled = true;
    selectedPlayButton.hidden = true;
    document.getElementById('autTestWorkflow').hidden = true;
    automationFlow.innerHTML =
      '<button class="aut-node trigger' + (activeNode === 'conversion-trigger' ? ' selected' : '') + '" type="button" data-aut-node="conversion-trigger"><span class="aut-node-top"><span class="aut-node-icon"><i class="fai">&#xf0a6;</i></span><span><span class="aut-node-kicker">1. USER ACTION</span><span class="aut-node-name">Confirm Convert to Deal</span></span></span><span class="aut-node-detail">From the Leads inbox or Lead record</span></button>' +
      '<span class="aut-line"></span><span class="aut-add protected" aria-hidden="true"><i class="fai">&#xf023;</i></span><span class="aut-line"></span>' +
      '<button class="aut-node wait protected' + (activeNode === 'conversion-input' ? ' selected' : '') + '" type="button" data-aut-node="conversion-input"><span class="aut-node-top"><span class="aut-node-icon"><i class="fai">&#xf14a;</i></span><span><span class="aut-node-kicker">2. REQUIRED INPUT</span><span class="aut-node-name">Choose Pipeline, stage and first Next Action</span></span></span><span class="aut-node-detail">Completed by the user before conversion</span></button>' +
      '<span class="aut-line"></span><span class="aut-add protected" aria-hidden="true"><i class="fai">&#xf023;</i></span><span class="aut-line"></span>' +
      '<button class="aut-node action' + (activeNode === 'conversion-result' ? ' selected' : '') + '" type="button" data-aut-node="conversion-result"><span class="aut-node-top"><span class="aut-node-icon"><i class="fai">&#xf1ad;</i></span><span><span class="aut-node-kicker">3. SYSTEM RESULT</span><span class="aut-node-name">Create Deal and copy Lead data</span></span></span><span class="aut-node-detail">Deal enters the selected stage · Lead becomes Converted</span></button>' +
      '<span class="aut-line"></span><span class="aut-end">END</span>';
    updateWorkflowList();
    syncAutomationDraftUi();
  }

  function updateCanvas() {
    const config = activeConfig();
    if (!config) {
      showAutomationZeroState();
      return;
    }
    if (!hasEditableStepModel(config)) {
      const canvas = automationFlow.closest('.aut-canvas');
      const connectorLayer = canvas && canvas.querySelector('.aut-controlled-connectors');
      if (connectorLayer) connectorLayer.remove();
      if (canvas) canvas.classList.remove('has-controlled-connectors');
    }
    showActiveAutomation();
    const renameWorkflowButton = document.getElementById('autRenameWorkflow');
    if (renameWorkflowButton) renameWorkflowButton.hidden = !!config.protected;
    if (draftBanner) draftBanner.hidden = !(hasEditableStepModel(config) && config.templateKey && (!config.enabled || config.editingVersion));
    updateRightFlowSummary(config);
    if (isLeadConversion(config)) {
      renderLeadConversionCanvas(config);
      return;
    }
    automationFlow.classList.remove('aut-proposal-flow');
    if (hasEditableStepModel(config)) {
      renderScratchCanvas(config);
      return;
    }
    if (isProposalApproval(config)) {
      renderProposalCanvas(config);
      return;
    }
    selectedPlayButton.hidden = false;
    document.getElementById('autTestWorkflow').hidden = false;
    if (automationFlow.dataset.mode !== 'template') {
      automationFlow.innerHTML = templateFlowMarkup;
      automationFlow.dataset.mode = 'template';
    }
    document.getElementById('autTestWorkflow').disabled = false;
    selectedPlayButton.disabled = false;
    updateSelectedPreviewButton(config);
    const leadFlow = isLeadWorkflow(config);
    const conversionFlow = isLeadConversion(config);
    const newLeadFlow = isNewLeadWorkflow(config);
    const inactiveLeadFlow = isInactiveLeadWorkflow(config);
    const quoteFlow = isQuoteWorkflow(config);
    const wonHandoff = isWonHandoff(config);
    const quoteInvoice = isQuoteInvoice(config);
    workflowTitle.textContent = config.title;
    workflowMeta.textContent = (config.editingVersion ? 'Active · Unpublished changes' : (config.enabled ? 'Active' : 'Inactive')) + ' · Uses ' + config.objectType + ' data';
    publishButton.textContent = config.protected ? 'System rule is on' : (config.editingVersion ? 'Publish changes' : (config.enabled ? 'Published' : 'Activate automation'));
    publishButton.disabled = !!config.protected || (config.enabled && !config.editingVersion);
    if (conversionFlow) {
      plainSummary.textContent = 'When a Lead is converted, create a Deal in ' + config.targetStage + ', copy its customer details and require the first Deal next action during conversion.';
    } else if (newLeadFlow) {
      if (config.assignmentOwner === 'Round-robin sales team') {
        plainSummary.textContent = 'When ' + newLeadTriggerText(config).title.toLowerCase() + ', Round-robin chooses the next salesperson and makes that person the Lead owner. Queue: ' + roundRobinSequenceLabel() + '. The next matching Lead would go to ' + roundRobinPreviewOwner() + '. If no open first-contact activity exists, create a ' + leadActivityTypeLabel(config.activityType) + ' activity for the same owner, due today at ' + automationTimeLabel(config.actionTime) + '.';
      } else {
        plainSummary.textContent = 'When ' + newLeadTriggerText(config).title.toLowerCase() + ', make ' + config.assignmentOwner + ' the Lead owner. If no open first-contact activity exists, create a ' + leadActivityTypeLabel(config.activityType) + ' activity for that owner, due today at ' + automationTimeLabel(config.actionTime) + '.';
      }
    } else if (inactiveLeadFlow) {
      plainSummary.textContent = 'When the eligibility scan finds an open Lead with no Next Activity, create a Call activity immediately and schedule it for ' + config.waitDays + ' days later at 10:00 am. Skip the Lead if an open activity or reminder already exists.';
    } else if (quoteFlow) {
      plainSummary.textContent = 'When a Quote is sent, create the Deal follow-up immediately with a due date ' + config.waitDays + ' days later at 10:00 am. Skip it when the Deal already has an open Next Action.';
    } else if (wonHandoff) {
      plainSummary.textContent = 'When a Deal moves from ' + config.triggerFromStage + ' to ' + config.triggerToStage + ' in ' + automationPipelineName(config) + ', create a handoff Next Action only if no open Next Action exists.';
    } else if (quoteInvoice) {
      plainSummary.textContent = 'When a Quote is accepted, use its accepted value as the billing baseline and create a ' + config.depositPercent + '% Draft Invoice, capped at the remaining invoiceable amount. Skip it if this automation already created one.';
    } else {
      plainSummary.textContent = 'When a Deal enters ' + config.triggerStage + ', wait ' + config.waitDays + (config.waitDays === 1 ? ' day' : ' days') + '. If "' + config.condition + '" is true, ' + config.actionName.toLowerCase() + ' for ' + config.actionOwner + '.';
    }
    const nodes = automationView.querySelectorAll('[data-aut-node]');
    nodes.forEach(function (node) {
      const name = node.dataset.autNode;
      const title = node.querySelector('.aut-node-name');
      const detail = node.querySelector('.aut-node-detail');
      const kicker = node.querySelector('.aut-node-kicker');
      const icon = node.querySelector('.aut-node-icon i');
      if (name === 'trigger') {
        const leadTrigger = newLeadFlow ? newLeadTriggerText(config) : null;
        kicker.textContent = '1. STARTS WHEN';
        icon.innerHTML = wonHandoff ? '&#xf024;' : '&#xf0a6;';
        title.textContent = conversionFlow ? 'Lead is converted to Deal' : (newLeadFlow ? leadTrigger.title : (inactiveLeadFlow ? 'Open Lead has no next activity' : (quoteFlow ? 'Quote is sent' : (wonHandoff ? 'Quote is accepted and Deal becomes Won' : (quoteInvoice ? 'Quote is accepted' : 'Deal enters ' + config.triggerStage)))));
        detail.textContent = conversionFlow ? 'From the Leads inbox or Lead record' : (newLeadFlow ? leadTrigger.detail : (inactiveLeadFlow ? 'Active Leads in the inbox only' : (quoteFlow ? 'Customer receives a Quote revision' : (wonHandoff ? automationPipelineName(config) + ' · ' + config.triggerFromStage + ' → ' + config.triggerToStage : (quoteInvoice ? 'Trusted acceptance event' : 'Pipeline: ' + automationPipelineName())))));
      } else if (name === 'wait') {
        kicker.textContent = newLeadFlow ? '2. ASSIGN OWNER' : ((wonHandoff || quoteInvoice) ? '2. SYSTEM CONTEXT' : ((inactiveLeadFlow || quoteFlow) ? '2. SET DUE DATE' : '2. THEN WAIT'));
        icon.innerHTML = newLeadFlow ? '&#xf007;' : ((wonHandoff || quoteInvoice) ? '&#xf023;' : '&#xf017;');
        title.textContent = newLeadFlow ? 'Assign Lead owner' : (wonHandoff ? 'Won stage reached' : (quoteInvoice ? 'Prepare Deal billing' : ((inactiveLeadFlow || quoteFlow) ? 'Schedule follow-up due date' : (config.waitDays === 0 ? 'Run immediately' : 'Wait ' + config.waitDays + (config.waitDays === 1 ? ' day' : ' days')))));
        detail.textContent = newLeadFlow ? config.assignmentOwner : (wonHandoff ? 'The Deal is already in ' + config.triggerToStage + '; this workflow does not move it' : (quoteInvoice ? 'Use accepted Quote as the billing baseline' : (inactiveLeadFlow ? config.waitDays + ' days from eligibility scan · 10:00 am' : (quoteFlow ? config.waitDays + ' days after Quote send · 10:00 am' : 'Calendar days after entering ' + config.triggerStage))));
        node.classList.toggle('protected', conversionFlow || wonHandoff || quoteInvoice);
      } else if (name === 'condition') {
        kicker.textContent = '3. RULE';
        icon.innerHTML = '&#xf126;';
        title.textContent = config.condition + '?';
        detail.textContent = newLeadFlow ? 'Checks all open Lead Activities to prevent duplicates' : (inactiveLeadFlow ? 'Skip if an open activity or automation reminder exists' : (quoteFlow ? 'Never overwrite an existing Deal Next Action' : (wonHandoff ? 'Uses the existing Deal Next Action field' : (quoteInvoice ? 'Available accepted amount · no duplicate automation draft' : (config.condition === 'No new sales activity' ? 'Meeting, note or follow-up since stage change' : 'Check the current Deal before continuing')))));
      } else if (name === 'action') {
        kicker.textContent = '4. DO THIS';
        icon.innerHTML = '&#xf0ae;';
        title.textContent = newLeadFlow ? 'Automation creates Lead activity' : config.actionName;
        detail.textContent = newLeadFlow
          ? 'Created by WeQuote · Assigned to ' + (config.assignmentOwner === 'Round-robin sales team' ? 'Lead owner selected by Round-robin' : config.assignmentOwner) + ' · ' + leadActivityTypeLabel(config.activityType) + ' · Due today at ' + automationTimeLabel(config.actionTime)
          : (quoteInvoice ? config.depositPercent + '% of accepted value · Capped at remaining invoiceable amount · Draft only' : 'Assign to ' + config.actionOwner + ' · Due ' + config.actionDue.toLowerCase());
      }
    });
    const branchLabels = automationView.querySelectorAll('.aut-branch-label');
    if (branchLabels.length >= 2) {
      branchLabels[0].textContent = newLeadFlow ? 'Yes · None found' : (inactiveLeadFlow ? 'Yes · No reminder' : (quoteFlow ? 'Yes · Next Action empty' : (wonHandoff ? 'Yes · No Next Action' : (quoteInvoice ? 'Yes · Amount available' : 'Yes · Continue'))));
      branchLabels[1].textContent = newLeadFlow ? 'No · Already exists' : (inactiveLeadFlow ? 'No · Activity exists' : (quoteFlow ? 'No · Next Action exists' : (wonHandoff ? 'No · Next Action exists' : (quoteInvoice ? 'No · Stop safely' : 'No · Stop safely'))));
    }
    updateWorkflowList();
    syncAutomationDraftUi();
  }

  function updateWorkflowList() {
    const keys = userWorkflowKeys();
    yourAutomations.innerHTML = keys.map(function (key) {
      const config = workflows[key];
      const needsSetup = workflowNeedsSetup(config);
      let activity = 'Runs on future CRM events';
      if (config.enabled) activity = config.runCount ? config.runCount + ' run' + (config.runCount === 1 ? '' : 's') : 'Not run yet';
      else if (isNewLeadWorkflow(config)) activity = 'Runs on future Leads';
      else if (isInactiveLeadWorkflow(config)) activity = getWorkflowMatches(config).length + ' currently eligible';
      else if (isQuoteWorkflow(config)) activity = 'Runs on future sent Quotes';
      else if (isWonHandoff(config)) activity = 'Runs on future ' + (config.triggerToStage || 'Won') + ' Deals';
      else if (isQuoteInvoice(config)) activity = 'Runs on future acceptances';
      else if (isProposalApproval(config)) activity = config.setupComplete ? 'Starts in ' + config.stageMap.qualify : 'Setup required';
      else if (hasEditableStepModel(config)) activity = config.templateKey ? 'Editable inactive template' : 'Inactive custom Automation';
      if (config.editingVersion) activity = 'Live version keeps running';
      return '<button class="aut-workflow' + (key === activeWorkflowKey ? ' active' : '') + '" type="button" data-aut-workflow="' + escapeAutomationHtml(key) + '">' +
        '<span class="aut-workflow-line"><span class="aut-workflow-name">' + escapeAutomationHtml(config.title) + '</span><span class="aut-object-badge ' + objectBadgeClass(config.objectType) + '">' + escapeAutomationHtml(config.objectType.toUpperCase()) + '</span></span><span class="aut-workflow-scope"><i class="fai">&#xf1ad;</i>' + escapeAutomationHtml(automationCompanyScopeLabel(config, true)) + '</span>' +
        '<span class="aut-workflow-meta"><span class="aut-status' + (config.enabled ? ' on' : '') + '">' + (config.editingVersion ? 'Active · Unpublished changes' : (config.enabled ? 'Active' : (needsSetup ? 'Needs setup' : 'Inactive'))) + '</span><span>' + escapeAutomationHtml(activity) + '</span></span></button>';
    }).join('');
    yourEmpty.hidden = keys.length > 0;
    document.querySelector('.aut-count').textContent = keys.length;
    const systemButton = automationView.querySelector('[data-aut-workflow="lead-conversion"]');
    if (systemButton) systemButton.classList.toggle('active', activeWorkflowKey === 'lead-conversion');
  }

  function renderCompanyScopeConflict(config, conflicts) {
    const canResolve = config.companyScopeMode === 'selected' && conflicts.some(function (key) { return workflows[key].companyScopeMode === 'all'; });
    inspectorStep.textContent = 'Activation check · Company scope';
    inspectorTitle.textContent = 'Overlapping Automation blocked';
    inspectorFoot.hidden = true;
    inspectorBody.innerHTML = '<div class="aut-company-conflict"><i class="fai">&#xf071;</i><div><strong>This outcome would run twice</strong><span>' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + ' overlaps with ' + conflicts.length + ' Active Automation' + (conflicts.length === 1 ? '' : 's') + ' using the same Stage and trigger.</span></div></div>' +
      '<div class="aut-rule"><strong>Conflicting scope</strong><ul>' + conflicts.map(function (key) { return '<li><b>' + escapeAutomationHtml(workflows[key].title) + '</b> · ' + escapeAutomationHtml(automationCompanyScopeLabel(workflows[key])) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="aut-info-note"><i class="fai">&#xf023;</i><span>Keep one outcome per record. The protected Quote lifecycle continues regardless of either Automation.</span></div>' +
      (canResolve ? '<button class="aut-btn primary" type="button" data-aut-resolve-company-overlap>Exclude ' + escapeAutomationHtml(automationCompanyScopeLabel(config, true)) + ' from the global Automation</button>' : '<div class="aut-help">Turn off or narrow one of the overlapping Automations before trying again.</div>') +
      '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
  }

  function resolveCompanyScopeConflict() {
    const config = activeConfig();
    if (!config || config.companyScopeMode !== 'selected') return;
    const conflicts = automationCompanyScopeConflicts(config);
    conflicts.forEach(function (key) {
      const candidate = workflows[key];
      if (candidate.companyScopeMode !== 'all') return;
      candidate.companyScopeMode = 'all-except';
      candidate.companyScopeIds = Array.from(new Set((candidate.companyScopeIds || []).concat(config.companyScopeIds)));
    });
    persistAutomationState();
    updateWorkflowList();
    renderScratchInspector('scratch-trigger');
    showAutomationToast('Global Automation updated to exclude the selected Company scope. Review, then Turn on again.');
  }

  function saveSelectedStep() {
    const config = activeConfig();
    if (!config) return;
    if (hasEditableStepModel(config) && activeNode === 'scratch-trigger' && config.templateKey) {
      showAutomationToast('This template uses a fixed start event. Its Rules and Actions remain editable.');
      return;
    }
    if (!config.protected) beginEditableDraftVersion(config);
    if (isProposalApproval(config)) {
      saveProposalStep();
      recordPendingDraftChange('Updated proposal setup');
      return;
    }
    if (hasEditableStepModel(config)) {
      beginEditableDraftVersion(config);
      if (activeNode === 'scratch-trigger') {
        const selectedTrigger = document.getElementById('autEditableTrigger');
        if (selectedTrigger) {
          const selectedTitle = canonicalScratchTriggerTitle(selectedTrigger.value);
          config.editableTrigger = {
            title: selectedTitle,
            detail: automationPipelineName(config) + ' · ' + workflowStageName(config)
          };
          config.triggerEvent = selectedTitle;
        }
        persistAutomationState();
        updateCanvas();
        renderInspector('scratch-trigger');
        recordPendingDraftChange('Updated Start when to “' + config.editableTrigger.title + '”');
        showAutomationToast('Trigger updated for this Automation.');
        return;
      }
      const reference = scratchStepReference(config, activeNode);
      const step = reference.step;
      if (!step) return;
      if (step.type === 'wait') step.days = Math.max(1, Number(document.getElementById('autScratchWaitDays').value) || 1);
      if (step.type === 'condition') step.condition = document.getElementById('autScratchCondition').value;
      if (step.type === 'action') {
        step.action = document.getElementById('autScratchAction').value;
        const taskTitle = document.getElementById('autScratchTaskTitle');
        if (taskTitle) step.taskTitle = taskTitle.value.trim() || 'Follow-up task';
        const noteTitle = document.getElementById('autScratchNoteTitle');
        const noteBody = document.getElementById('autScratchNoteBody');
        const mention = document.getElementById('autScratchMention');
        const followUpDelay = document.getElementById('autScratchFollowUpDelay');
        const followUpTime = document.getElementById('autScratchFollowUpTime');
        if (noteTitle) step.noteTitle = noteTitle.value.trim() || 'Follow-up note';
        if (noteBody) step.noteBody = noteBody.value.trim() || 'Follow up on this CRM record.';
        if (mention) step.mention = mention.value;
        if (followUpDelay) step.followUpDelay = followUpDelay.value;
        if (followUpTime) step.followUpTime = followUpTime.value || '17:00';
        const meetingTitle = document.getElementById('autScratchMeetingTitle');
        const meetingAttendee = document.getElementById('autScratchMeetingAttendee');
        const meetingWhen = document.getElementById('autScratchMeetingWhen');
        const meetingTime = document.getElementById('autScratchMeetingTime');
        const meetingDuration = document.getElementById('autScratchMeetingDuration');
        if (meetingTitle) step.meetingTitle = meetingTitle.value.trim() || 'Customer meeting';
        if (meetingAttendee) step.meetingAttendee = meetingAttendee.value;
        if (meetingWhen) step.meetingWhen = meetingWhen.value;
        if (meetingTime) step.meetingTime = meetingTime.value || '10:00';
        if (meetingDuration) step.meetingDuration = Number(meetingDuration.value) || 60;
        const quoteName = document.getElementById('autScratchQuoteName');
        const quoteOwner = document.getElementById('autScratchQuoteOwner');
        const quoteExistingPolicy = document.getElementById('autScratchQuoteExistingPolicy');
        if (quoteName) step.quoteName = quoteName.value.trim() || '{{Deal title}} · Quote';
        if (quoteOwner) {
          step.quoteOwner = quoteOwner.value;
          step.owner = quoteOwner.value;
        }
        if (quoteExistingPolicy) step.quoteExistingPolicy = quoteExistingPolicy.value;
        const dealLabel = document.getElementById('autScratchDealLabel');
        if (dealLabel) step.dealLabel = dealLabel.value;
        const quoteLabel = document.getElementById('autScratchQuoteLabel');
        if (quoteLabel) step.quoteLabel = quoteLabel.value;
        const fileSource = document.getElementById('autScratchFileSource');
        const fileSelection = document.getElementById('autScratchFileSelection');
        const fileDuplicate = document.getElementById('autScratchFileDuplicate');
        if (fileSource) step.fileSource = fileSource.value;
        if (fileSelection) step.fileSelection = fileSelection.value;
        if (fileDuplicate) step.fileDuplicatePolicy = fileDuplicate.value;
        const fileRequestName = document.getElementById('autScratchFileRequestName');
        const fileRequestFrom = document.getElementById('autScratchFileRequestFrom');
        const fileRequestTypes = document.getElementById('autScratchFileRequestTypes');
        const fileRequestOwner = document.getElementById('autScratchFileRequestOwner');
        const fileRequestDueDays = document.getElementById('autScratchFileRequestDueDays');
        if (fileRequestName) step.fileRequestName = fileRequestName.value.trim() || 'Required document';
        if (fileRequestFrom) step.fileRequestFrom = fileRequestFrom.value;
        if (fileRequestTypes) step.fileRequestTypes = fileRequestTypes.value;
        if (fileRequestOwner) step.owner = fileRequestOwner.value;
        if (fileRequestDueDays) step.fileRequestDueDays = Math.max(1, Number(fileRequestDueDays.value) || 3);
        const nextActionType = document.getElementById('autScratchNextActionType');
        const nextActionTitle = document.getElementById('autScratchNextActionTitle');
        const nextActionOwner = document.getElementById('autScratchNextActionOwner');
        const nextActionDueDays = document.getElementById('autScratchNextActionDueDays');
        const nextActionDueUnit = document.getElementById('autScratchNextActionDueUnit');
        const nextActionPolicy = document.getElementById('autScratchNextActionPolicy');
        const nextActionClearPolicy = document.getElementById('autScratchNextActionClearPolicy');
        if (nextActionType) step.nextActionType = nextActionType.value;
        if (nextActionTitle) step.nextActionTitle = nextActionTitle.value.trim() || 'Follow up this Deal';
        if (nextActionOwner) step.owner = nextActionOwner.value;
        if (nextActionDueDays) step.nextActionDueDays = Math.max(0, Number(nextActionDueDays.value) || 0);
        if (nextActionDueUnit) step.nextActionDueUnit = nextActionDueUnit.value;
        if (nextActionPolicy) step.nextActionPolicy = nextActionPolicy.value;
        if (nextActionClearPolicy) step.nextActionClearPolicy = nextActionClearPolicy.value;
        const watcher = document.getElementById('autScratchWatcher');
        const interest = document.getElementById('autScratchInterest');
        if (watcher) step.watcher = watcher.value;
        if (interest) step.interest = interest.value;
        const expectedCloseMode = document.getElementById('autScratchExpectedCloseMode');
        const expectedCloseDays = document.getElementById('autScratchExpectedCloseDays');
        const expectedCloseDate = document.getElementById('autScratchExpectedCloseDate');
        if (expectedCloseMode) step.expectedCloseMode = expectedCloseMode.value;
        if (expectedCloseDays) step.expectedCloseDays = Math.max(1, Number(expectedCloseDays.value) || 30);
        if (expectedCloseDate) step.expectedCloseDate = expectedCloseDate.value;
        const moveTarget = document.getElementById('autScratchMoveTarget');
        if (moveTarget) {
          step.moveTargetStageId = moveTarget.value;
          step.moveTargetStage = moveTarget.options[moveTarget.selectedIndex] ? moveTarget.options[moveTarget.selectedIndex].text : '';
        }
        const owner = document.getElementById('autScratchOwner');
        const target = document.getElementById('autScratchTarget');
        if (owner) step.owner = owner.value;
        if (target) {
          step.target = target.value;
          step.detail = 'Return to ' + target.options[target.selectedIndex].text;
        } else {
          delete step.target;
          if (step.action !== 'Return to earlier step') delete step.detail;
        }
        const completion = document.getElementById('autScratchCompletion');
        const blockedEvent = document.getElementById('autScratchBlockedEvent');
        step.completionMode = completion && completion.value === 'required' ? 'required' : 'optional';
        step.blockedEvent = step.completionMode === 'required' && blockedEvent ? blockedEvent.value : '';
        if (config.templateKey === 'pre-quote-readiness') {
          config.actionType = step.action;
          config.actionName = step.noteTitle || step.taskTitle || step.action;
          config.noteBody = step.noteBody || config.noteBody;
          config.mention = step.mention || config.mention;
          config.followUpDelay = step.followUpDelay || config.followUpDelay;
          config.followUpTime = step.followUpTime || config.followUpTime;
          config.actionOwner = step.owner || 'Deal owner';
          config.completionMode = step.completionMode;
          config.blockedEvent = step.blockedEvent;
        }
      }
      if (step.type === 'condition' && config.templateKey === 'pre-quote-readiness') config.condition = step.condition;
      updateCanvas();
      renderInspector(activeNode);
      persistAutomationState();
      recordPendingDraftChange('Updated step: ' + (step.action || step.condition || ('Wait ' + (step.days || 1) + ' day')));
      showAutomationToast('Custom step saved.');
      return;
    }
    if (config.protected) {
      showAutomationToast('This WeQuote system rule is protected.');
      return;
    }
    if (activeNode === 'trigger') {
      if (isNewLeadWorkflow(config)) {
        config.leadTriggerSource = 'any';
      } else if (isLeadConversion(config)) {
        config.targetStage = document.getElementById('autTriggerStage').value;
      } else if (isWonHandoff(config)) {
        config.triggerPipelineId = document.getElementById('autTriggerPipeline').value;
        config.triggerFromStage = document.getElementById('autTriggerFromStage').value;
        const selectedPipeline = automationPipelineForConfig(config);
        const wonStage = automationPipelineStages(selectedPipeline).find(function (stage) { return stage.outcome === 'won'; }) || automationPipelineStages(selectedPipeline).find(function (stage) { return stage.name === 'Won'; });
        config.triggerToStage = wonStage ? wonStage.name : 'Won';
        config.triggerRunMode = 'first';
      } else if (!isLeadWorkflow(config)) {
        config.triggerStage = document.getElementById('autTriggerStage').value;
      }
    } else if (activeNode === 'wait') {
      if (isNewLeadWorkflow(config)) {
        config.assignmentOwner = document.getElementById('autAssignmentOwner').value;
      } else if (!isLeadConversion(config) && !isWonHandoff(config)) {
        config.waitDays = Math.max(0, Number(document.getElementById('autWaitDays').value) || 0);
      }
    } else if (activeNode === 'condition') {
      config.condition = document.getElementById('autCondition').value;
    } else if (activeNode === 'action') {
      if (isNewLeadWorkflow(config)) {
        config.activityType = document.getElementById('autActivityType').value;
        config.activityTitle = document.getElementById('autActivityTitle').value.trim() || 'First contact';
        config.actionTime = document.getElementById('autActionTime').value || '16:00';
        normalizeNewLeadWorkflow(config);
      } else if (isQuoteInvoice(config)) {
        config.depositPercent = Math.max(1, Math.min(100, Number(document.getElementById('autDepositPercent').value) || 30));
        config.billingStage = 'Deposit · ' + config.depositPercent + '%';
      } else {
        config.actionName = document.getElementById('autActionName').value;
        config.actionOwner = document.getElementById('autActionOwner').value;
        config.actionDue = document.getElementById('autActionDue').value;
        const completion = document.getElementById('autActionCompletion');
        const blockedEvent = document.getElementById('autActionBlockedEvent');
        config.completionMode = completion && completion.value === 'required' ? 'required' : 'optional';
        config.blockedEvent = config.completionMode === 'required' && blockedEvent ? blockedEvent.value : '';
      }
    }
    normalizeSupportedWorkflow(config);
    updateCanvas();
    persistAutomationState();
    recordPendingDraftChange('Updated ' + (activeNode === 'trigger' ? 'Start when' : activeNode) + ' settings');
    if (config.enabled && !journeyOverlay.hidden) resetJourney();
    showAutomationToast('Step saved.');
  }

  function getDealsInStage(stageName) {
    if (typeof CRM_DEALS !== 'undefined' && Array.isArray(CRM_DEALS) && typeof CRM_STAGE_DEFS !== 'undefined') {
      const stageIndex = CRM_STAGE_DEFS.findIndex(function (stage) { return stage.name === stageName; });
      if (stageIndex < 0) return [];
      return CRM_DEALS.filter(function (deal) { return !deal.archived && deal.s === stageIndex; }).map(function (deal) {
        return {
          title: deal.t || 'Untitled Deal',
          customer: deal.c || deal.contact || 'Unknown customer',
          owner: typeof CRM_OWNER_NAMES !== 'undefined' ? (CRM_OWNER_NAMES[deal.o] || deal.o || 'Unassigned') : (deal.o || 'Unassigned'),
          owningCompanyId: deal.owningCompanyId || 'main-company'
        };
      });
    }
    const stages = Array.from(document.querySelectorAll('#pipeline .stage'));
    const stage = stages.find(function (item) {
      const name = item.querySelector('.stage-name');
      return name && name.textContent.trim() === stageName;
    });
    if (!stage) return [];
    return Array.from(stage.querySelectorAll('.deal-card')).map(function (card) {
      const title = card.querySelector('.deal-title');
      const customer = card.querySelector('.deal-org');
      return {
        title: title ? title.textContent.trim() : 'Untitled Deal',
        customer: customer ? customer.textContent.trim() : 'Unknown customer'
      };
    });
  }

  function getDealsInConfiguredPipelineStage(config) {
    const pipeline = automationPipelineForConfig(config);
    const stages = automationPipelineStages(pipeline);
    const stageIndex = stages.findIndex(function (stage) { return stage.name === config.triggerToStage || stage.outcome === config.triggerToOutcome; });
    if (!pipeline || !Array.isArray(pipeline.deals) || stageIndex < 0) return getDealsInStage(config.triggerToStage || 'Won');
    return pipeline.deals.filter(function (deal) { return !deal.archived && deal.s === stageIndex; }).map(function (deal) {
      return {
        title: deal.t || 'Untitled Deal',
        customer: deal.c || deal.contact || 'Unknown customer',
        owner: typeof CRM_OWNER_NAMES !== 'undefined' ? (CRM_OWNER_NAMES[deal.o] || deal.o || 'Unassigned') : (deal.o || 'Unassigned'),
        owningCompanyId: deal.owningCompanyId || 'main-company'
      };
    });
  }

  function getConvertedLeads() {
    if (typeof CRM_LEADS === 'undefined' || !Array.isArray(CRM_LEADS)) return [];
    return CRM_LEADS.filter(function (lead) { return lead.status === 'converted'; }).map(function (lead) {
      return {
        title: lead.title || 'Untitled Lead',
        customer: lead.org || lead.contact || 'No company',
        owner: lead.owner || 'Unassigned',
        owningCompanyId: lead.owningCompanyId || 'main-company'
      };
    });
  }

  function getOpenLeads(inactiveOnly) {
    if (typeof CRM_LEADS === 'undefined' || !Array.isArray(CRM_LEADS)) return [];
    return CRM_LEADS.filter(function (lead) {
      return lead.status === 'open' && (!inactiveOnly || !lead.next);
    }).map(function (lead) {
      return {
        title: lead.title || 'Untitled Lead',
        customer: lead.org || lead.contact || 'No company',
        owner: lead.owner || 'Unassigned',
        owningCompanyId: lead.owningCompanyId || 'main-company'
      };
    });
  }

  function getSentQuoteSamples() {
    if (typeof DEAL_QUOTES !== 'undefined' && DEAL_QUOTES && typeof CRM_DEALS !== 'undefined') {
      return Object.keys(DEAL_QUOTES).flatMap(function (dealTitle) {
        const deal = CRM_DEALS.find(function (item) { return item.t === dealTitle; });
        return (DEAL_QUOTES[dealTitle] || []).filter(function (quote) { return quote.status === 'sent'; }).map(function (quote) {
          return {
            title: 'Quote #' + quote.no,
            customer: deal ? (deal.c || deal.contact || dealTitle) : dealTitle,
            owner: deal && typeof CRM_OWNER_NAMES !== 'undefined' ? (CRM_OWNER_NAMES[deal.o] || deal.o || 'Deal owner') : 'Deal owner',
            owningCompanyId: (quote && quote.owningCompanyId) || (deal && deal.owningCompanyId) || 'main-company'
          };
        });
      });
    }
    const sentDeals = getDealsInStage('Sent');
    if (sentDeals.length) return sentDeals.map(function (deal, index) {
      return { title: 'Quote Q-' + String(2401 + index), customer: deal.customer, owner: 'Deal owner' };
    });
    return [
      { title: 'Quote Q-2401', customer: 'Burning Tree', owner: 'Deal owner' },
      { title: 'Quote Q-2402', customer: 'Roche Chica Drive', owner: 'Deal owner' }
    ];
  }

  function getAcceptedQuoteSamples() {
    if (typeof DEAL_QUOTES === 'undefined' || !DEAL_QUOTES || typeof CRM_DEALS === 'undefined') return getDealsInStage('Won');
    return Object.keys(DEAL_QUOTES).flatMap(function (dealTitle) {
      const accepted = (DEAL_QUOTES[dealTitle] || []).filter(function (quote) {
        return quote.status === 'accepted' || quote.status === 'complete' ||
          (Array.isArray(quote.revisions) && quote.revisions.some(function (revision) { return revision.status === 'accepted'; }));
      });
      if (!accepted.length) return [];
      const deal = CRM_DEALS.find(function (item) { return item.t === dealTitle; });
      return [{
        title: dealTitle,
        customer: deal ? (deal.c || deal.contact || dealTitle) : dealTitle,
        owner: deal && typeof CRM_OWNER_NAMES !== 'undefined' ? (CRM_OWNER_NAMES[deal.o] || deal.o || 'Deal owner') : 'Deal owner',
        owningCompanyId: (deal && deal.owningCompanyId) || 'main-company'
      }];
    });
  }

  function getInvoiceSamples() {
    if (typeof DEAL_BILLING === 'undefined' || !DEAL_BILLING) return [];
    return Object.keys(DEAL_BILLING).flatMap(function (dealTitle) {
      const deal = typeof CRM_DEALS !== 'undefined' ? CRM_DEALS.find(function (item) { return item.t === dealTitle; }) : null;
      return (DEAL_BILLING[dealTitle] || []).map(function (invoice) {
        return { title: invoice.no || 'Draft Invoice', customer: deal ? (deal.c || dealTitle) : dealTitle, owner: 'Finance team', owningCompanyId: (deal && deal.owningCompanyId) || 'main-company' };
      });
    });
  }

  function getWorkflowMatches(config) {
    const scoped = function (samples) { return (samples || []).filter(function (sample) { return automationRecordMatchesCompanyScope(config, sample); }); };
    if (hasEditableStepModel(config)) {
      if (config.objectType === 'Lead') return scoped(getOpenLeads(false));
      if (config.objectType === 'Quote') return scoped(getSentQuoteSamples());
      if (config.objectType === 'Deal') return scoped(getDealsInStage(config.triggerStage || 'Qualified'));
      if (config.objectType === 'Project') return scoped(getAcceptedQuoteSamples());
      if (config.objectType === 'Invoice') return scoped(getInvoiceSamples());
      return [];
    }
    if (isLeadConversion(config)) return scoped(getConvertedLeads());
    if (isNewLeadWorkflow(config)) return scoped(getOpenLeads(false));
    if (isInactiveLeadWorkflow(config)) return scoped(getOpenLeads(true));
    if (isQuoteWorkflow(config)) return scoped(getSentQuoteSamples());
    if (isWonHandoff(config)) return scoped(getDealsInConfiguredPipelineStage(config));
    if (isQuoteInvoice(config)) return scoped(getAcceptedQuoteSamples());
    if (isProposalApproval(config)) {
      const pipeline = automationPipelineForConfig(config);
      const stageIndex = automationPipelineStages(pipeline).findIndex(function (stage) { return stage.name === config.stageMap.qualify; });
      return scoped(pipeline && Array.isArray(pipeline.deals) && stageIndex >= 0 ? pipeline.deals.filter(function (deal) {
        return !deal.archived && deal.s === stageIndex;
      }).map(function (deal) {
        return { title: deal.t || 'Untitled Deal', customer: deal.c || deal.contact || 'Unknown customer', owner: automationOwnerName('Deal owner', deal), owningCompanyId: deal.owningCompanyId || 'main-company' };
      }) : getDealsInStage(config.stageMap.qualify));
    }
    return scoped(getDealsInStage(config.triggerStage));
  }

  function escapeAutomationHtml(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
    });
  }

  function selectedWorkflowRunSteps(config) {
    let triggerTitle = 'Automation trigger matched';
    let triggerDetail = 'A CRM record has entered this automation.';
    let systemTitle = config.waitDays ? 'Wait ' + config.waitDays + (config.waitDays === 1 ? ' day' : ' days') : 'Run the next step now';
    let systemDetail = config.waitDays ? 'The preview jumps forward without waiting in real time.' : 'No delay is configured.';
    let conditionTitle = 'Check: ' + config.condition;
    let conditionDetail = 'For this playback, the condition is true and follows the Yes branch.';
    let actionTitle = config.actionName;
    let actionDetail = 'Assign to ' + config.actionOwner + (config.actionDue ? ' · Due ' + config.actionDue.toLowerCase() : '');

    if (config.kind === 'stage-template') {
      triggerTitle = config.triggerEvent;
      triggerDetail = automationPipelineName(config) + ' · ' + config.triggerStage;
      systemTitle = config.waitDays
        ? 'Wait ' + config.waitDays + (config.waitDays === 1 ? ' day' : ' days')
        : 'Run immediately';
      systemDetail = config.waitDays
        ? 'The preview jumps forward without waiting in real time.'
        : 'No delay is configured.';
      conditionTitle = 'Check: ' + config.condition;
      conditionDetail = 'The matching record continues only when this condition is true.';
      actionTitle = config.actionName;
      actionDetail = (config.templateKey === 'pre-quote-readiness' || String(config.title || '').toLowerCase().includes('pre-quote readiness'))
        ? 'Created by Automation · Assigned to ' + config.actionOwner + (config.completionMode === 'required' ? ' · Must be completed before the first Quote' : ' · Optional follow-up')
        : config.actionOwner + (config.actionDue ? ' · Due ' + config.actionDue.toLowerCase() : '');
    } else if (isNewLeadWorkflow(config)) {
      const leadTrigger = newLeadTriggerText(config);
      const previewOwner = config.assignmentOwner === 'Round-robin sales team' ? roundRobinPreviewOwner() : config.assignmentOwner;
      triggerTitle = leadTrigger.title;
      triggerDetail = leadTrigger.detail + ' starts this automation.';
      systemTitle = 'Assign Lead owner';
      systemDetail = config.assignmentOwner === 'Round-robin sales team'
        ? 'Round-robin selects ' + previewOwner + ' as the next Lead owner in this preview.'
        : previewOwner + ' becomes the Lead owner before any Lead activity is created.';
      conditionTitle = 'Check: no open first-contact activity exists';
      conditionDetail = 'No matching Lead activity is found, so the Lead continues down the Yes branch.';
      actionTitle = 'WeQuote Automation creates Lead activity';
      actionDetail = 'Created by WeQuote Automation · Assigned to ' + previewOwner + ' · ' + leadActivityTypeLabel(config.activityType) + ' · Due today at ' + automationTimeLabel(config.actionTime);
    } else if (isInactiveLeadWorkflow(config)) {
      triggerTitle = 'Eligibility scan finds an open Lead with no Next Activity';
      triggerDetail = 'Archived, discarded and converted Leads are excluded.';
      systemTitle = 'Set reminder due date';
      systemDetail = config.waitDays + ' days from the eligibility scan · 10:00 am. The activity is created immediately.';
      conditionTitle = 'Check: no existing inactive Lead reminder';
      conditionDetail = 'No open activity or reminder exists, so nothing will be duplicated.';
      actionDetail = 'Scheduled Call activity · Lead owner · Due ' + config.waitDays + ' days from the scan at 10:00 am';
    } else if (isLeadConversion(config)) {
      triggerTitle = 'Lead is converted to Deal';
      triggerDetail = 'A user confirms Convert to Deal from the Lead record.';
      systemTitle = 'Create Deal in ' + config.targetStage;
      systemDetail = 'Company, contact, owner, notes and source are copied safely.';
      conditionTitle = 'Check: Deal was created successfully';
      conditionDetail = 'The new Deal exists, so the handoff continues.';
    } else if (isQuoteWorkflow(config)) {
      triggerTitle = 'Quote is sent';
      triggerDetail = 'The customer receives a Quote revision.';
      systemTitle = 'Set follow-up due date';
      systemDetail = config.waitDays + ' days after Quote send · 10:00 am. The Next Action is created immediately.';
      conditionTitle = 'Check: no open Deal next action exists';
      conditionDetail = 'The Deal Next Action field is empty, so nothing will be overwritten.';
      actionDetail = 'Deal owner · Due ' + config.waitDays + ' days after Quote send at 10:00 am';
    } else if (isWonHandoff(config)) {
      triggerTitle = 'Quote is accepted and Deal becomes Won';
      triggerDetail = automationPipelineName(config) + ' · ' + config.triggerFromStage + ' → ' + config.triggerToStage;
      systemTitle = 'Won stage reached';
      systemDetail = 'The Deal is already in ' + config.triggerToStage + '. This workflow does not move the Deal.';
      conditionTitle = 'Check: no open Deal Next Action exists';
      conditionDetail = 'The current Deal Next Action field is empty, so nothing will be overwritten.';
    } else if (isQuoteInvoice(config)) {
      triggerTitle = 'Quote is accepted';
      triggerDetail = 'The accepted Quote belongs to a Deal.';
      systemTitle = 'Prepare Deal billing';
      systemDetail = 'The accepted Quote becomes the protected billing baseline.';
      conditionTitle = 'Check: deposit amount is available to invoice';
      conditionDetail = 'The accepted Quote has remaining value and this automation has not already created a Draft Invoice.';
      actionTitle = 'Create draft invoice';
      actionDetail = config.depositPercent + '% of accepted value · Capped at remaining invoiceable amount · Draft only';
    }

    return [
      { node: 'trigger', title: triggerTitle, detail: triggerDetail, icon: '&#xf0a6;' },
      { node: 'wait', title: systemTitle, detail: systemDetail, icon: config.waitDays ? '&#xf017;' : '&#xf013;' },
      { node: 'condition', title: conditionTitle, detail: conditionDetail, icon: '&#xf126;' },
      { node: 'action', title: actionTitle, detail: actionDetail, icon: isQuoteInvoice(config) ? '&#xf571;' : '&#xf0ae;' }
    ];
  }

  function clearSelectedRunHighlight() {
    document.querySelectorAll('#viewAutomation .run-active').forEach(function (element) {
      element.classList.remove('run-active');
    });
  }

  function renderSelectedRunStep(stepIndex) {
    const config = activeConfig();
    const steps = selectedWorkflowRunSteps(config);
    const step = steps[stepIndex];
    const matches = getWorkflowMatches(config);
    const sample = matches[0];
    clearSelectedRunHighlight();
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      node.classList.remove('selected', 'demo-focus');
      if (node.dataset.autNode === step.node) node.classList.add('run-active');
    });
    if (stepIndex >= 2) {
      const yesBranch = automationView.querySelector('.aut-branch-label.yes');
      if (yesBranch) yesBranch.classList.add('run-active');
    }

    activeNode = 'selected-run';
    inspectorStep.textContent = 'Selected automation demo · Step ' + (stepIndex + 1) + ' of ' + steps.length;
    inspectorTitle.textContent = step.title;
    inspectorFoot.hidden = true;
    const recordLine = sample
      ? '<div class="aut-rule"><strong>Example record</strong><div class="aut-help" style="margin-top:5px;">' + escapeAutomationHtml(sample.title) + ' · ' + escapeAutomationHtml(sample.customer) + '</div></div>'
      : '<div class="aut-rule"><strong>Example record</strong><div class="aut-help" style="margin-top:5px;">Demo sample · no current CRM match is required</div></div>';
    const finalResult = stepIndex === steps.length - 1
      ? '<div class="aut-test-result"><strong>' + matches.length + ' ' + (isQuoteInvoice(config) ? 'Draft Invoice' + (matches.length === 1 ? '' : 's') + ' would be created' : 'record' + (matches.length === 1 ? '' : 's') + ' would run this action') + '</strong><div style="margin-top:4px;">' + escapeAutomationHtml(step.detail) + '</div></div>'
      : '<div class="aut-test-result"><strong>' + escapeAutomationHtml(step.title) + '</strong><div style="margin-top:4px;">' + escapeAutomationHtml(step.detail) + '</div></div>';
    inspectorBody.innerHTML =
      '<div class="aut-demo-visual"><div class="aut-demo-icon"><i class="fai">' + step.icon + '</i></div>' +
      finalResult + recordLine +
      (stepIndex === 2 ? '<div class="aut-help"><strong>Demo path:</strong> the Yes branch is used. Click Test automation when you want to compare both Yes and No outcomes.</div>' : '') +
      '<div class="aut-help"><strong>Preview only:</strong> no Lead, Deal, Quote, task, Project or Invoice is changed.</div></div>';
    workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Playing step ' + (stepIndex + 1) + ' of ' + steps.length;
  }

  function stopSelectedRun(restoreInspector) {
    selectedRunTimers.forEach(function (timer) { window.clearTimeout(timer); });
    selectedRunTimers = [];
    selectedRunActive = false;
    clearSelectedRunHighlight();
    updateSelectedPreviewButton(activeConfig());
    if (restoreInspector) {
      updateCanvas();
      renderInspector('trigger');
    }
  }

  function finishSelectedRun() {
    selectedRunTimers = [];
    selectedRunActive = false;
    selectedPlayButton.innerHTML = '<i class="fai">&#xf01e;</i> Replay selected';
    workflowMeta.textContent = (activeConfig().enabled ? 'Active' : 'Inactive') + ' · Demo completed just now';
    showAutomationToast(activeConfig().title + ' demo complete. No CRM data was changed.');
  }

  function playSelectedWorkflow() {
    if (selectedRunActive) {
      stopSelectedRun(true);
      return;
    }
    if (journeyRunning) pauseJourney();
    stopSelectedRun(false);
    selectedRunActive = true;
    selectedPlayButton.innerHTML = '<i class="fai">&#xf04d;</i> Stop demo';
    renderSelectedRunStep(0);
    [1, 2, 3].forEach(function (stepIndex) {
      selectedRunTimers.push(window.setTimeout(function () {
        renderSelectedRunStep(stepIndex);
      }, stepIndex * 1250));
    });
    selectedRunTimers.push(window.setTimeout(finishSelectedRun, 4 * 1250));
  }

  function simulationTimeLabel(config) {
    if (isLeadConversion(config)) return 'conversion result';
    if (config.waitDays === 0) return 'now';
    return config.waitDays + (config.waitDays === 1 ? ' day later' : ' days later');
  }

  function renderProposalBeforeAfter() {
    const config = activeConfig();
    const matches = getWorkflowMatches(config);
    const sample = matches[0] || { title: 'Wong Residence', customer: 'Demo customer' };
    activeNode = 'test';
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('selected'); });
    inspectorStep.textContent = 'Safe test · Before & After';
    inspectorTitle.textContent = 'What changes on the Deal?';
    inspectorFoot.hidden = true;
    inspectorBody.innerHTML =
      '<div class="aut-before-after"><section><small>BEFORE TEMPLATE</small><strong>' + escapeAutomationHtml(sample.title) + '</strong><span>Pipeline path · ' + escapeAutomationHtml(config.stageMap.qualify) + ' → ' + escapeAutomationHtml(config.stageMap.quoting) + '</span><span>No separate SOW or Engineering review stage</span>' + automationCompanyScopeBeforeAfterMarkup(config) + '</section>' +
      '<i class="fai">&#xf061;</i><section class="after"><small>AFTER TEMPLATE</small><strong>' + escapeAutomationHtml(sample.title) + '</strong><span>' + escapeAutomationHtml(config.stageMap.qualify) + ' → ' + escapeAutomationHtml(config.stageMap.siteVisit) + '</span><span>' + escapeAutomationHtml(config.stageMap.sow) + ' → ' + escapeAutomationHtml(config.stageMap.technicalReview) + ' → ' + escapeAutomationHtml(config.stageMap.quoting) + '</span>' + automationCompanyScopeBeforeAfterMarkup(config) + '</section></div>' +
      '<div class="aut-rule"><strong>What the safe test proves</strong><div class="aut-help" style="margin-top:5px;">A Deal only advances when the current task or approval is completed. A rejected Technical Review returns it to ' + escapeAutomationHtml(config.stageMap.sow) + '.</div></div>' +
      '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>Preview only. The workflow uses the selected Pipeline and reuses any matching stages already there. This test does not move a Deal or create a task.</span></div>' +
      '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
    workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Previewed safely just now';
    showAutomationToast('Before & After preview ready. No CRM data changed.');
  }

  function builderVersionComparisonMarkup(config) {
    const changes = Array.isArray(config.lastSavedChanges) && config.lastSavedChanges.length
      ? config.lastSavedChanges
      : ['Trigger, rules and actions are ready for a safe test'];
    const beforeTitle = config.enabled ? 'Published version stays live' : 'Automation is Inactive';
    const beforeCopy = config.enabled ? 'Matching records continue using the current published version.' : 'No matching records enrol while the Automation is Inactive.';
    return '<div class="aut-builder-version-compare"><section><small>BEFORE · CURRENT</small><strong>' + escapeAutomationHtml(beforeTitle) + '</strong><span>' + escapeAutomationHtml(beforeCopy) + '</span></section><i class="fai">&#xf061;</i><section class="after"><small>AFTER · DRAFT</small><strong>' + escapeAutomationHtml(changes[0]) + '</strong><span>' + escapeAutomationHtml(changes.slice(1).join(' · ') || 'The saved Draft is being simulated; no CRM data will change.') + '</span></section></div>';
  }

  function testWorkflow() {
    stopSelectedRun(false);
    const config = activeConfig();
    if (!config) return;
    prepareAutomationTestDraft();
    if (isProposalApproval(config)) {
      renderProposalBeforeAfter();
      return;
    }
    if (hasEditableStepModel(config)) {
      const matches = getWorkflowMatches(config);
      const trigger = scratchTriggerText(config);
      normalizeScratchTree(config);
      function testSequenceMarkup(steps, branchLabel) {
        return (Array.isArray(steps) ? steps : []).map(function (step) {
          const text = scratchStepText(step);
          const prefix = branchLabel ? branchLabel + ' · ' : '';
          const item = '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">' + text.icon + '</i></span><div class="aut-sim-copy"><strong>' + escapeAutomationHtml(prefix + text.title) + '</strong><span>' + escapeAutomationHtml(text.detail) + '</span></div></div>';
          if (step.type !== 'condition') return item;
          const yesPath = step.yesSteps.length ? testSequenceMarkup(step.yesSteps, 'YES') : '<div class="aut-help"><strong>YES:</strong> End workflow</div>';
          const noPath = step.noSteps.length ? testSequenceMarkup(step.noSteps, 'NO') : '<div class="aut-help"><strong>NO:</strong> End workflow</div>';
          return item + yesPath + noPath;
        }).join('');
      }
      activeNode = 'test';
      document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('selected'); });
      inspectorStep.textContent = 'Safe test · Custom automation';
      inspectorTitle.textContent = 'Preview the full custom flow';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML =
        builderVersionComparisonMarkup(config) +
        '<div class="aut-test-result"><strong>' + matches.length + ' ' + escapeAutomationHtml(config.objectType) + (matches.length === 1 ? '' : 's') + ' match the trigger</strong><div style="margin-top:4px;">' + escapeAutomationHtml(trigger.title) + '</div></div>' +
        '<div class="aut-test-scope"><i class="fai">&#xf1ad;</i><span><small>OWNING COMPANY SCOPE</small><strong>' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong></span></div>' + automationCompanyScopePillsMarkup(config, 'test') +
        '<div class="aut-sim-timeline">' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>Trigger</strong><span>' + escapeAutomationHtml(trigger.detail) + '</span></div></div>' +
          testSequenceMarkup(config.steps, '') +
        '</div><div class="aut-help"><strong>Preview only:</strong> no CRM records are changed.</div><div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
      workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Test Draft snapshot ready';
      showAutomationToast('Test Draft snapshot ready. Complete the Simulator Timeline to pass the test.');
      return;
    }
    const leadFlow = isLeadWorkflow(config);
    const conversionFlow = isLeadConversion(config);
    const matches = getWorkflowMatches(config);
    const objectName = config.objectType;
    activeNode = 'test';
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('selected'); });
    inspectorStep.textContent = 'Safe test · Step 1 of 2';
    inspectorTitle.textContent = conversionFlow ? 'Which conversions are found?' : 'Which records enter?';
    inspectorFoot.hidden = true;
    const names = matches.slice(0, 4).map(function (deal) {
      return '<li><strong>' + escapeAutomationHtml(deal.title) + '</strong> · ' + escapeAutomationHtml(deal.customer) + '</li>';
    }).join('');
    inspectorBody.innerHTML =
      '<div class="aut-test-result"><strong>' + matches.length + ' ' + objectName + (matches.length === 1 ? '' : 's') + ' ' + (matches.length === 1 ? 'matches' : 'match') + ' the trigger</strong><div style="margin-top:4px;">' + (conversionFlow ? 'Event: Converted to Deal' : (isNewLeadWorkflow(config) ? 'Event: New Lead created' : (isInactiveLeadWorkflow(config) ? 'Rule: No next activity' : (isQuoteWorkflow(config) ? 'Event: Quote sent' : (isWonHandoff(config) ? 'Stage: ' + escapeAutomationHtml(automationPipelineName(config)) + ' · ' + escapeAutomationHtml(config.triggerFromStage) + ' → ' + escapeAutomationHtml(config.triggerToStage) : (isQuoteInvoice(config) ? 'Event: Quote accepted' : 'Stage: ' + escapeAutomationHtml(config.triggerStage))))))) + '</div></div>' +
      '<div class="aut-test-scope"><i class="fai">&#xf1ad;</i><span><small>OWNING COMPANY SCOPE</small><strong>' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong></span></div>' + automationCompanyScopePillsMarkup(config, 'test') +
      (matches.length ? '<div class="aut-rule"><strong>Matching ' + objectName + 's</strong><ul style="margin:7px 0 0;padding-left:17px;line-height:1.6;">' + names + '</ul></div>' : '<div class="aut-help">No current ' + objectName + 's would enter this automation.</div>') +
      (matches.length ?
        '<div class="aut-sim-card">' +
          '<h3>What should we preview?</h3>' +
          (conversionFlow
            ? '<div class="aut-sim-jump"><i class="fai">&#xf1ad;</i><span><strong>Preview the conversion result</strong><small>No Lead or Deal record will be changed.</small></span></div>'
            : (isNewLeadWorkflow(config)
              ? '<div class="aut-sim-jump"><i class="fai">&#xf007;</i><span><strong>Preview the immediate response</strong><small>See the owner assignment and new Lead activity.</small></span></div>'
              : '<div class="aut-sim-jump"><i class="fai">' + (isQuoteInvoice(config) ? '&#xf571;' : '&#xf2f1;') + '</i><span><strong>' + (isWonHandoff(config) ? 'Preview the Pipeline handoff' : (isQuoteInvoice(config) ? 'Preview Quote → Draft Invoice' : ((isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? 'Preview the scheduled follow-up' : 'Jump to ' + simulationTimeLabel(config)))) + '</strong><small>' + (isWonHandoff(config) ? 'Check the selected Won stage and existing Deal Next Action.' : (isQuoteInvoice(config) ? 'See the Deal billing check and Draft Invoice result.' : ((isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? 'The action is created now with a future due date; this prototype does not wait in the background.' : 'Skip the real wait and preview the result instantly.'))) + '</small></span></div>')) +
          '<h3>Choose a test outcome</h3>' +
          '<button class="aut-btn primary" type="button" data-aut-simulate="true">' + (conversionFlow ? 'Deal created → Keep Next Action' : (isNewLeadWorkflow(config) ? 'None found → Create Lead activity' : (isInactiveLeadWorkflow(config) ? 'No reminder → Create Lead activity' : (isQuoteWorkflow(config) ? 'Next Action empty → Create follow-up' : (isWonHandoff(config) ? 'No Next Action → Create handoff' : (isQuoteInvoice(config) ? 'Amount available → Create Draft Invoice' : 'Nothing happened → Create action')))))) + '</button>' +
          '<button class="aut-btn" type="button" data-aut-simulate="false">' + (conversionFlow ? 'Deal failed → Stop safely' : (isNewLeadWorkflow(config) ? 'Activity exists → No action' : (isInactiveLeadWorkflow(config) ? 'Activity exists → No action' : (isQuoteWorkflow(config) ? 'Next Action exists → No action' : (isWonHandoff(config) ? 'Next Action exists → No action' : (isQuoteInvoice(config) ? 'No available amount → Stop safely' : 'Activity added → No action')))))) + '</button>' +
        '</div>' : '') +
      '<div class="aut-help"><strong>Preview only:</strong> no time passes, and no CRM activities, Next Actions or records are created.</div>' +
      '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
    workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Test Draft snapshot ready';
    showAutomationToast('Trigger checked without changing CRM data.');
  }

  function simulateWorkflow(conditionIsTrue) {
    const config = activeConfig();
    const leadFlow = isLeadConversion(config);
    const matches = getWorkflowMatches(config);
    if (leadFlow) {
      const actionCount = conditionIsTrue ? matches.length : 0;
      const leadPreview = matches.slice(0, 4).map(function (lead) {
        return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(lead.title) + '</strong><span>' + escapeAutomationHtml(lead.customer) + ' · ' + (conditionIsTrue ? 'New Deal and first follow-up task previewed' : 'Conversion flagged for review; no task created') + '</span></div>';
      }).join('');
      activeNode = 'simulation';
      inspectorStep.textContent = 'Safe test · Step 2 of 2';
      inspectorTitle.textContent = conditionIsTrue ? 'Preview: successful conversion' : 'Preview: conversion needs attention';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML =
        '<div class="aut-sim-timeline">' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>Lead converted</strong><span>' + matches.length + ' converted Lead' + (matches.length === 1 ? '' : 's') + ' found.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf1ad;</i></span><div class="aut-sim-copy"><strong>Create Deal in ' + escapeAutomationHtml(config.targetStage) + '</strong><span>Copy company, contact, owner, notes, source and value.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf126;</i></span><div class="aut-sim-copy"><strong>Check conversion</strong><span>' + escapeAutomationHtml(config.condition) + ': <b>' + (conditionIsTrue ? 'Yes' : 'No') + '</b>.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf0ae;</i></span><div class="aut-sim-copy"><strong>Result</strong><span>' + (conditionIsTrue ? 'Create the first follow-up task on the new Deal.' : 'Stop safely and leave the conversion for review.') + '</span></div></div>' +
        '</div>' +
        '<div class="aut-sim-outcome' + (conditionIsTrue ? '' : ' stop') + '"><strong>' + actionCount + ' follow-up task' + (actionCount === 1 ? '' : 's') + ' would be created</strong><span>' + (conditionIsTrue ? 'The converted Lead remains linked to its new Deal.' : 'No follow-up task is created until the Deal exists.') + '</span></div>' +
        '<div class="aut-sim-deals">' + leadPreview + '</div>' +
        '<div class="aut-help"><strong>Simulation only:</strong> no Lead, Deal or task record was changed.</div>' +
        '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-test-again>Try the other outcome</button><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
      workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Conversion previewed just now';
      showAutomationToast('Lead conversion previewed. No CRM data was changed.');
      return;
    }
    if (isQuoteInvoice(config)) {
      const invoiceCount = conditionIsTrue ? matches.length : 0;
      const invoiceRows = matches.slice(0, 4).map(function (project, index) {
        return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(project.title) + '</strong><span>' + escapeAutomationHtml(project.customer) + ' · ' + (conditionIsTrue ? 'Draft Invoice D-' + String(217 + index).padStart(4, '0') + ' would be created' : 'Billing review required; no Invoice created') + '</span></div>';
      }).join('');
      activeNode = 'simulation';
      inspectorStep.textContent = 'Safe test · Step 2 of 2';
      inspectorTitle.textContent = conditionIsTrue ? 'Preview: Draft Invoices created' : 'Preview: Billing needs review';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML =
        '<div class="aut-sim-timeline">' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>Quote accepted</strong><span>' + matches.length + ' accepted Quote' + (matches.length === 1 ? '' : 's') + ' start the billing workflow.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf023;</i></span><div class="aut-sim-copy"><strong>Billing baseline prepared</strong><span>WeQuote uses the accepted Quote value without changing the Deal stage.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf126;</i></span><div class="aut-sim-copy"><strong>Check available deposit amount</strong><span>Remaining accepted value and no duplicate automation draft: <b>' + (conditionIsTrue ? 'Yes' : 'No') + '</b>.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf571;</i></span><div class="aut-sim-copy"><strong>Result</strong><span>' + (conditionIsTrue ? 'Create a ' + config.depositPercent + '% Draft Invoice for Finance review.' : 'Stop safely without creating an Invoice.') + '</span></div></div>' +
        '</div>' +
        '<div class="aut-sim-outcome' + (conditionIsTrue ? '' : ' stop') + '"><strong>' + invoiceCount + ' Draft Invoice' + (invoiceCount === 1 ? '' : 's') + ' would be created</strong><span>' + (conditionIsTrue ? 'Status: Draft · Not emailed · Not posted to accounting · Not marked as paid.' : 'No Invoice is created until the billing stage is complete.') + '</span></div>' +
        '<div class="aut-sim-deals">' + invoiceRows + '</div>' +
        '<div class="aut-help"><strong>Simulation only:</strong> no Quote, Deal or Invoice record was changed.</div>' +
        '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-test-again>Try the other outcome</button><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
      workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Invoice flow previewed just now';
      showAutomationToast('Draft Invoice flow previewed. No CRM data was changed.');
      return;
    }
    if (isQuoteWorkflow(config) || isWonHandoff(config)) {
      const quoteFlow = isQuoteWorkflow(config);
      const actionCount = conditionIsTrue ? matches.length : 0;
      const future = new Date();
      future.setDate(future.getDate() + config.waitDays);
      const futureLabel = future.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const previewRows = matches.slice(0, 4).map(function (record) {
        return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(record.title) + '</strong><span>' + escapeAutomationHtml(record.customer) + ' · ' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' would be created' : 'Automation would end with no action') + '</span></div>';
      }).join('');
      activeNode = 'simulation';
      inspectorStep.textContent = 'Safe test · Step 2 of 2';
      inspectorTitle.textContent = quoteFlow ? 'Preview: scheduled Quote follow-up' : 'Preview: Won Deal handoff';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML =
        '<div class="aut-sim-timeline">' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>' + (quoteFlow ? 'Quote sent' : 'Deal stage changed') + '</strong><span>' + matches.length + ' ' + config.objectType + (matches.length === 1 ? '' : 's') + ' enter the automation.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">' + (quoteFlow ? '&#xf017;' : '&#xf024;') + '</i></span><div class="aut-sim-copy"><strong>' + (quoteFlow ? 'Set follow-up due date' : 'Won stage reached') + '</strong><span>' + (quoteFlow ? 'Created now and due ' + futureLabel + ' at 10:00 am.' : escapeAutomationHtml(automationPipelineName(config)) + ' · ' + escapeAutomationHtml(config.triggerFromStage) + ' → ' + escapeAutomationHtml(config.triggerToStage) + '. The Deal is already Won.') + '</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf126;</i></span><div class="aut-sim-copy"><strong>Check condition</strong><span>' + escapeAutomationHtml(config.condition) + ': <b>' + (conditionIsTrue ? 'Yes' : 'No') + '</b>.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf0ae;</i></span><div class="aut-sim-copy"><strong>Result</strong><span>' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' for each matching ' + config.objectType + '.' : 'End safely without creating a duplicate task.') + '</span></div></div>' +
        '</div>' +
        '<div class="aut-sim-outcome' + (conditionIsTrue ? '' : ' stop') + '"><strong>' + actionCount + ' task' + (actionCount === 1 ? '' : 's') + ' would be created</strong><span>' + (conditionIsTrue ? 'Assigned to ' + escapeAutomationHtml(config.actionOwner) + ' · Due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.' : 'No CRM record or task would be changed.') + '</span></div>' +
        '<div class="aut-sim-deals">' + previewRows + '</div>' +
        '<div class="aut-help"><strong>Simulation only:</strong> no Quote, Deal, Project or task record was changed.</div>' +
        '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-test-again>Try the other outcome</button><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
      workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Previewed just now';
      showAutomationToast('Automation previewed. No CRM data was changed.');
      return;
    }
    if (isLeadWorkflow(config)) {
      const actionCount = conditionIsTrue ? matches.length : 0;
      const newLeadFlow = isNewLeadWorkflow(config);
      const future = new Date();
      future.setDate(future.getDate() + config.waitDays);
      const futureLabel = future.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const leadPreview = matches.slice(0, 4).map(function (lead) {
        return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(lead.title) + '</strong><span>' + escapeAutomationHtml(lead.customer) + ' · ' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' would be created' : 'Automation would end with no action') + '</span></div>';
      }).join('');
      activeNode = 'simulation';
      inspectorStep.textContent = 'Safe test · Step 2 of 2';
      inspectorTitle.textContent = newLeadFlow ? 'Preview: new Lead response' : 'Preview: scheduled inactive Lead reminder';
      inspectorFoot.hidden = true;
      inspectorBody.innerHTML =
        '<div class="aut-sim-timeline">' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>' + (newLeadFlow ? 'New Lead created' : 'Inactive Lead found') + '</strong><span>' + matches.length + ' Lead' + (matches.length === 1 ? '' : 's') + ' enter the workflow.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">' + (newLeadFlow ? '&#xf007;' : '&#xf017;') + '</i></span><div class="aut-sim-copy"><strong>' + (newLeadFlow ? 'Assign Lead owner' : 'Set reminder due date') + '</strong><span>' + (newLeadFlow ? escapeAutomationHtml(config.assignmentOwner) : 'Created now and due ' + futureLabel + ' at 10:00 am.') + '</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf126;</i></span><div class="aut-sim-copy"><strong>Check condition</strong><span>' + escapeAutomationHtml(config.condition) + ': <b>' + (conditionIsTrue ? 'Yes' : 'No') + '</b>.</span></div></div>' +
          '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf0ae;</i></span><div class="aut-sim-copy"><strong>Result</strong><span>' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' for each matching Lead.' : 'End without creating a duplicate task.') + '</span></div></div>' +
        '</div>' +
        '<div class="aut-sim-outcome' + (conditionIsTrue ? '' : ' stop') + '"><strong>' + actionCount + ' task' + (actionCount === 1 ? '' : 's') + ' would be created</strong><span>' + (conditionIsTrue ? 'Assigned to ' + escapeAutomationHtml(config.actionOwner) + ' · Due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.' : 'Existing activity or tasks prevent another reminder.') + '</span></div>' +
        '<div class="aut-sim-deals">' + leadPreview + '</div>' +
        '<div class="aut-help"><strong>Simulation only:</strong> no Lead or task record was changed.</div>' +
        '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-test-again>Try the other outcome</button><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
      workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Lead workflow previewed just now';
      showAutomationToast('Lead workflow previewed. No CRM data was changed.');
      return;
    }
    const future = new Date();
    future.setDate(future.getDate() + config.waitDays);
    const futureLabel = future.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const actionCount = conditionIsTrue ? matches.length : 0;
    const dealPreview = matches.slice(0, 4).map(function (deal) {
      return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(deal.title) + '</strong><span>' + escapeAutomationHtml(deal.customer) + ' · ' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' would be created' : 'Automation would end with no action') + '</span></div>';
    }).join('');

    activeNode = 'simulation';
    inspectorStep.textContent = 'Safe test · Step 2 of 2';
    inspectorTitle.textContent = 'Preview: ' + simulationTimeLabel(config);
    inspectorFoot.hidden = true;
    inspectorBody.innerHTML =
      '<div class="aut-sim-timeline">' +
        '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf00c;</i></span><div class="aut-sim-copy"><strong>Today · Trigger</strong><span>' + matches.length + ' Deal' + (matches.length === 1 ? '' : 's') + ' enter ' + escapeAutomationHtml(config.triggerStage) + '.</span></div></div>' +
        '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf017;</i></span><div class="aut-sim-copy"><strong>Wait ' + config.waitDays + (config.waitDays === 1 ? ' day' : ' days') + '</strong><span>The preview jumps over this wait instantly.</span></div></div>' +
        '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf126;</i></span><div class="aut-sim-copy"><strong>' + futureLabel + ' · Check condition</strong><span>' + escapeAutomationHtml(config.condition) + ': <b>' + (conditionIsTrue ? 'Yes' : 'No') + '</b>.</span></div></div>' +
        '<div class="aut-sim-step"><span class="aut-sim-dot"><i class="fai">&#xf0ae;</i></span><div class="aut-sim-copy"><strong>Result</strong><span>' + (conditionIsTrue ? escapeAutomationHtml(config.actionName) + ' for each matching Deal.' : 'End the automation without creating anything.') + '</span></div></div>' +
      '</div>' +
      '<div class="aut-sim-outcome' + (conditionIsTrue ? '' : ' stop') + '"><strong>' + actionCount + ' task' + (actionCount === 1 ? '' : 's') + ' would be created</strong><span>' + (conditionIsTrue ? 'Assigned to ' + escapeAutomationHtml(config.actionOwner) + ' · Due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.' : 'The “Activity found” branch ends safely with no action.') + '</span></div>' +
      '<div class="aut-sim-deals">' + dealPreview + '</div>' +
      '<div class="aut-help"><strong>Simulation only:</strong> the date, condition result and tasks above are a preview. CRM data was not changed.</div>' +
      '<div class="aut-sim-actions"><button class="aut-btn" type="button" data-aut-test-again>Try the other outcome</button><button class="aut-btn" type="button" data-aut-back>Back to editing</button></div>';
    workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Simulated to ' + futureLabel;
    showAutomationToast('Time jump simulated. No CRM data was changed.');
  }

  function demoDateLabel(config) {
    const future = new Date();
    future.setDate(future.getDate() + config.waitDays);
    return future.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function demoDealRows(matches, config) {
    return matches.slice(0, 3).map(function (deal) {
      return '<div class="aut-sim-deal"><strong>' + escapeAutomationHtml(deal.title) + '</strong><span>' + escapeAutomationHtml(deal.customer) + ' · ' + escapeAutomationHtml(config.actionName) + '</span></div>';
    }).join('');
  }

  function guidedLeadConversionContent(step, config, matches) {
    const countLabel = matches.length + ' converted Lead' + (matches.length === 1 ? '' : 's');
    if (step === 0) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf2f6;</i></span>' +
        '<h3>' + countLabel + ' start the handoff</h3>' +
        '<p>The workflow starts only after a user confirms <strong>Convert to Deal</strong> from the Leads inbox or Lead record.</p>' +
        '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Trigger</small><strong>Lead converted</strong></div><div class="aut-demo-fact"><small>Matches now</small><strong>' + matches.length + '</strong></div></div>' +
        '<div class="aut-demo-note">The original Lead is kept and linked to the new Deal for history.</div>' +
      '</div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf1ad;</i></span>' +
        '<h3>Create the Deal in ' + escapeAutomationHtml(config.targetStage) + '</h3>' +
        '<p>WeQuote creates the Deal and copies the company, contact, owner, source, notes, labels, interests and estimated value.</p>' +
        '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Pipeline stage</small><strong>' + escapeAutomationHtml(config.targetStage) + '</strong></div><div class="aut-demo-fact"><small>Data entry</small><strong>Copied automatically</strong></div></div>' +
        '<div class="aut-demo-note">This protected system step prevents important conversion data from being lost.</div>' +
      '</div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf126;</i></span>' +
        '<h3>Check the new Deal exists</h3>' +
        '<p>The demo follows the green branch after confirming the Deal was created successfully.</p>' +
        '<div class="aut-demo-branch"><div class="active"><strong>Yes · Deal created</strong><span>Continue to the first follow-up task.</span></div><div><strong>No · Needs attention</strong><span>Stop safely for review; do not create a task.</span></div></div>' +
        '<div class="aut-demo-note">This check prevents tasks being attached to a missing Deal.</div>' +
      '</div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf0ae;</i></span>' +
        '<h3>' + matches.length + ' first follow-up task' + (matches.length === 1 ? '' : 's') + ' would be created</h3>' +
        '<p>Each new Deal receives <strong>' + escapeAutomationHtml(config.actionName) + '</strong>, assigned to ' + escapeAutomationHtml(config.actionOwner) + ' and due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.</p>' +
        '<div class="aut-sim-deals">' + demoDealRows(matches, config) + '</div>' +
        '<div class="aut-demo-note"><strong>Preview only:</strong> no Deal or task has been created by this demo.</div>' +
      '</div>';
    }
    return '<div class="aut-demo-visual">' +
      '<span class="aut-demo-icon"><i class="fai">&#xf058;</i></span>' +
      '<h3>The Lead-to-Deal handoff is ready</h3>' +
      '<p>Convert the Lead, create and link the Deal, verify it exists, then prepare the first follow-up task.</p>' +
      '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Current status</small><strong>' + (config.enabled ? 'Active' : 'Inactive') + '</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div>' +
      '<div class="aut-demo-note">Click <strong>Finish demo</strong>. The automation stays ' + (config.enabled ? 'Active' : 'Inactive until you choose Turn on') + '.</div>' +
    '</div>';
  }

  function guidedLeadNurtureContent(step, config, matches) {
    const newLeadFlow = isNewLeadWorkflow(config);
    const countLabel = matches.length + ' Lead' + (matches.length === 1 ? '' : 's');
    if (step === 0) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf0a6;</i></span><h3>' + countLabel + ' enter the workflow</h3><p>' + (newLeadFlow ? 'The automation starts whenever a new Lead arrives from a form, import or manual entry.' : 'The automation finds open Leads that do not have a next activity.') + '</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>CRM record</small><strong>Lead</strong></div><div class="aut-demo-fact"><small>Matches now</small><strong>' + matches.length + '</strong></div></div><div class="aut-demo-note">Converted, discarded and archived Leads are excluded.</div></div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">' + (newLeadFlow ? '&#xf007;' : '&#xf017;') + '</i></span><h3>' + (newLeadFlow ? 'Assign the Lead owner' : 'Set the reminder due date') + '</h3><p>' + (newLeadFlow ? 'WeQuote assigns each Lead to <strong>' + escapeAutomationHtml(config.assignmentOwner) + '</strong>.' : 'The reminder activity is created immediately and scheduled for <strong>' + config.waitDays + ' days later at 10:00 am</strong>.') + '</p><div class="aut-demo-note">' + (newLeadFlow ? 'Round-robin keeps new Lead distribution fair.' : 'This Phase 1 prototype does not pause in the background or re-check the Lead later.') + '</div></div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf126;</i></span><h3>Check: ' + escapeAutomationHtml(config.condition) + '</h3><p>The demo follows the green branch so you can preview the action.</p><div class="aut-demo-branch"><div class="active"><strong>Yes · Continue</strong><span>' + (newLeadFlow ? 'Automation creates the first-contact activity for the assigned Lead owner.' : 'Automation creates the inactive Lead reminder activity.') + '</span></div><div><strong>No · End</strong><span>' + (newLeadFlow ? 'Keep the assigned Lead owner, but do not create a duplicate activity.' : 'A reminder already exists, so no duplicate is created.') + '</span></div></div><div class="aut-demo-note">The check prevents duplicate Lead activities. The No branch does not undo any earlier owner assignment.</div></div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf0ae;</i></span><h3>' + matches.length + ' Lead activit' + (matches.length === 1 ? 'y' : 'ies') + ' would be created</h3><p>Each matching Lead receives <strong>' + escapeAutomationHtml(config.actionName) + '</strong>, assigned to ' + escapeAutomationHtml(config.actionOwner) + '.</p><div class="aut-sim-deals">' + demoDealRows(matches, config) + '</div><div class="aut-demo-note"><strong>Preview only:</strong> no Lead activity has been changed.</div></div>';
    }
    return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf058;</i></span><h3>' + escapeAutomationHtml(config.title) + ' is ready</h3><p>The Lead trigger, safety check and follow-up action are connected.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Current status</small><strong>' + (config.enabled ? 'Active' : 'Inactive') + '</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div><div class="aut-demo-note">Click <strong>Finish demo</strong>. The automation stays ' + (config.enabled ? 'Active' : 'Inactive until you choose Turn on') + '.</div></div>';
  }

  function guidedQuoteInvoiceContent(step, config, matches) {
    if (step === 0) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf058;</i></span><h3>' + matches.length + ' accepted Quote' + (matches.length === 1 ? '' : 's') + ' enter the workflow</h3><p>The automation starts only from a trusted customer or authorised internal acceptance event.</p><div class="aut-demo-note">Changing a status field manually cannot create an Invoice.</div></div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf023;</i></span><h3>Prepare Deal billing</h3><p>WeQuote uses the accepted Quote value as the billing baseline. This automation does not move the Deal to Won.</p><div class="aut-demo-note">This uses the Billing panel already available on the Deal.</div></div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf126;</i></span><h3>Check available deposit amount</h3><p>The accepted Quote must have remaining value, belong to a Deal and have no duplicate Draft Invoice from this automation.</p><div class="aut-demo-branch"><div class="active"><strong>Yes · Amount available</strong><span>Create a Draft Invoice.</span></div><div><strong>No · Stop safely</strong><span>Do not create a duplicate or zero-value Invoice.</span></div></div></div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf571;</i></span><h3>' + matches.length + ' Draft Invoice' + (matches.length === 1 ? '' : 's') + ' would be created</h3><p>The Invoice remains in <strong>Draft</strong>. It is not emailed, posted to accounting or marked as paid.</p><div class="aut-demo-note"><strong>Preview only:</strong> no Invoice has been created.</div></div>';
    }
    return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf058;</i></span><h3>Quote-to-Invoice automation is ready</h3><p>Accepted Quote → available amount check → ' + config.depositPercent + '% Draft Invoice for Finance review.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Invoice mode</small><strong>Draft only</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div><div class="aut-demo-note">Click <strong>Finish demo</strong> to return to the builder.</div></div>';
  }

  function guidedQuoteFollowUpContent(step, config, matches) {
    if (step === 0) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf1d8;</i></span><h3>' + matches.length + ' sent Quote' + (matches.length === 1 ? '' : 's') + ' enter the workflow</h3><p>The automation starts when a Quote revision is sent to the customer—not when it is only saved as a Draft.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Trigger</small><strong>Quote is sent</strong></div><div class="aut-demo-fact"><small>Matches now</small><strong>' + matches.length + '</strong></div></div><div class="aut-demo-note">Each Quote revision starts this flow only on its first send.</div></div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf017;</i></span><h3>Set the follow-up due date</h3><p>The Deal Next Action is created immediately and due <strong>' + config.waitDays + ' days after Quote send at 10:00 am</strong>.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Due setting</small><strong>' + config.waitDays + ' calendar days</strong></div><div class="aut-demo-fact"><small>Creation</small><strong>Immediate</strong></div></div><div class="aut-demo-note">This Phase 1 prototype does not pause and re-check the Quote later.</div></div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf126;</i></span><h3>Check: no open Deal Next Action exists</h3><p>The walkthrough uses the green branch only when the CRM Next Action field is empty.</p><div class="aut-demo-branch"><div class="active"><strong>Yes · Empty</strong><span>Create the scheduled follow-up.</span></div><div><strong>No · Action exists</strong><span>End safely without overwriting it.</span></div></div><div class="aut-demo-note">This condition preserves the salesperson’s existing follow-up.</div></div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf0ae;</i></span><h3>' + matches.length + ' Deal Next Action' + (matches.length === 1 ? '' : 's') + ' would be set</h3><p>The setting creates <strong>' + escapeAutomationHtml(config.actionName) + '</strong>, assigned to ' + escapeAutomationHtml(config.actionOwner) + ' and due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.</p><div class="aut-sim-deals">' + demoDealRows(matches, config) + '</div><div class="aut-demo-note"><strong>Preview only:</strong> no Deal Next Action has been changed.</div></div>';
    }
    return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf058;</i></span><h3>Sent Quote follow-up is ready</h3><p>Quote sent → check the Deal Next Action → create a follow-up now, due ' + config.waitDays + ' days later.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Current status</small><strong>' + (config.enabled ? 'Active' : 'Inactive') + '</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div><div class="aut-demo-note">No background wait is implied by this Phase 1 prototype.</div></div>';
  }

  function guidedWonHandoffContent(step, config, matches) {
    if (step === 0) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf024;</i></span><h3>A Deal reaches ' + escapeAutomationHtml(config.triggerToStage) + '</h3><p>This handoff watches stage changes in <strong>' + escapeAutomationHtml(automationPipelineName(config)) + '</strong>.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>From</small><strong>' + escapeAutomationHtml(config.triggerFromStage) + '</strong></div><div class="aut-demo-fact"><small>To</small><strong>' + escapeAutomationHtml(config.triggerToStage) + '</strong></div></div><div class="aut-demo-note">The current CRM still requires an accepted Quote before a Deal can enter its Won outcome.</div></div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf023;</i></span><h3>The Deal is already in Won</h3><p>Reaching <strong>' + escapeAutomationHtml(config.triggerToStage) + '</strong> starts this handoff; the automation does not move or win the Deal.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Pipeline</small><strong>' + escapeAutomationHtml(automationPipelineName(config)) + '</strong></div><div class="aut-demo-fact"><small>Run rule</small><strong>First time only</strong></div></div><div class="aut-demo-note">Quote acceptance and Deal outcome rules happen before this automation.</div></div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf126;</i></span><h3>Check: no open Deal Next Action exists</h3><p>The walkthrough follows the green branch only when the current Next Action field is empty.</p><div class="aut-demo-branch"><div class="active"><strong>Yes · Empty</strong><span>Create the Deal handoff Next Action.</span></div><div><strong>No · Action exists</strong><span>End safely without overwriting it.</span></div></div><div class="aut-demo-note">The check matches the single Next Action field in the current CRM.</div></div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf0ae;</i></span><h3>' + matches.length + ' Deal handoff Next Action' + (matches.length === 1 ? '' : 's') + ' would be created</h3><p>The action is assigned to <strong>' + escapeAutomationHtml(config.actionOwner) + '</strong> and due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.</p><div class="aut-sim-deals">' + demoDealRows(matches, config) + '</div><div class="aut-demo-note"><strong>Preview only:</strong> no Deal Next Action has been changed.</div></div>';
    }
    return '<div class="aut-demo-visual"><span class="aut-demo-icon"><i class="fai">&#xf058;</i></span><h3>Won Deal handoff is ready</h3><p>' + escapeAutomationHtml(automationPipelineName(config)) + ' stage change → ' + escapeAutomationHtml(config.triggerToStage) + ' → check existing Next Action → Deal handoff Next Action.</p><div class="aut-demo-facts"><div class="aut-demo-fact"><small>Current status</small><strong>' + (config.enabled ? 'Active' : 'Inactive') + '</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div><div class="aut-demo-note">Pipeline stages stay managed in CRM; this automation only reacts to the selected outcome.</div></div>';
  }

  function guidedDemoContent(step, config, matches) {
    if (isQuoteInvoice(config)) return guidedQuoteInvoiceContent(step, config, matches);
    if (isLeadConversion(config)) return guidedLeadConversionContent(step, config, matches);
    if (isLeadWorkflow(config)) return guidedLeadNurtureContent(step, config, matches);
    if (isQuoteWorkflow(config)) return guidedQuoteFollowUpContent(step, config, matches);
    if (isWonHandoff(config)) return guidedWonHandoffContent(step, config, matches);
    const countLabel = matches.length + ' Deal' + (matches.length === 1 ? '' : 's');
    const waitLabel = config.waitDays + (config.waitDays === 1 ? ' day' : ' days');
    if (step === 0) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf0a6;</i></span>' +
        '<h3>' + countLabel + ' enter the automation</h3>' +
        '<p>WeQuote watches ' + escapeAutomationHtml(automationPipelineName(config)) + '. When a Deal enters <strong>' + escapeAutomationHtml(config.triggerStage) + '</strong>, this automation starts automatically.</p>' +
        '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Trigger stage</small><strong>' + escapeAutomationHtml(config.triggerStage) + '</strong></div><div class="aut-demo-fact"><small>Matches right now</small><strong>' + countLabel + '</strong></div></div>' +
        '<div class="aut-demo-note"><strong>Demo data:</strong> these matches come from the Deals already shown in this CRM prototype.</div>' +
      '</div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf017;</i></span>' +
        '<h3>Wait ' + waitLabel + '</h3>' +
        '<p>In real use, the Deal pauses here. For this demo, we skip the wait instantly and jump to <strong>' + demoDateLabel(config) + '</strong>.</p>' +
        '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Starts</small><strong>Today</strong></div><div class="aut-demo-fact"><small>Continues</small><strong>' + demoDateLabel(config) + '</strong></div></div>' +
        '<div class="aut-demo-note">No real time passes during a simulation.</div>' +
      '</div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf126;</i></span>' +
        '<h3>Check: ' + escapeAutomationHtml(config.condition) + '</h3>' +
        '<p>The demo assumes there is no new sales activity during the wait, so it follows the green <strong>Yes</strong> branch.</p>' +
        '<div class="aut-demo-branch"><div class="active"><strong>Yes · No activity</strong><span>Continue to create the follow-up task.</span></div><div><strong>No · Activity found</strong><span>End safely without creating anything.</span></div></div>' +
        '<div class="aut-demo-note">You can test the other branch later from <strong>Test automation</strong>.</div>' +
      '</div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual">' +
        '<span class="aut-demo-icon"><i class="fai">&#xf0ae;</i></span>' +
        '<h3>' + matches.length + ' follow-up task' + (matches.length === 1 ? '' : 's') + ' would be created</h3>' +
        '<p>Each matching Deal gets <strong>' + escapeAutomationHtml(config.actionName) + '</strong>, assigned to ' + escapeAutomationHtml(config.actionOwner) + ' and due ' + escapeAutomationHtml(config.actionDue.toLowerCase()) + '.</p>' +
        '<div class="aut-sim-deals">' + demoDealRows(matches, config) + '</div>' +
        '<div class="aut-demo-note"><strong>Preview only:</strong> the demo has not created these tasks.</div>' +
      '</div>';
    }
    return '<div class="aut-demo-visual">' +
      '<span class="aut-demo-icon"><i class="fai">&#xf058;</i></span>' +
      '<h3>The full flow is ready</h3>' +
      '<p><strong>' + escapeAutomationHtml(config.title) + '</strong> will watch ' + escapeAutomationHtml(config.triggerStage) + ', wait ' + waitLabel + ', check for activity and create follow-up tasks only when needed.</p>' +
      '<div class="aut-demo-facts"><div class="aut-demo-fact"><small>Current status</small><strong>' + (config.enabled ? 'Active' : 'Inactive') + '</strong></div><div class="aut-demo-fact"><small>Demo changes made</small><strong>None</strong></div></div>' +
      '<div class="aut-demo-note">Click <strong>Finish demo</strong>. The automation stays ' + (config.enabled ? 'Active' : 'Inactive until you choose Turn on') + '.</div>' +
    '</div>';
  }

  function bossDemoPath(activeIndex) {
    const labels = ['Lead', 'Deal', 'Quote', 'Follow-up', 'Won', 'Project', 'Invoice'];
    return '<div class="aut-e2e-path">' + labels.map(function (label, index) {
      return '<span class="' + (index === Math.min(activeIndex, labels.length - 1) ? 'current' : '') + '">' + label + '</span>' + (index < labels.length - 1 ? '<i class="fai">&#xf054;</i>' : '');
    }).join('') + '</div>';
  }

  function bossDemoContent(step) {
    const path = bossDemoPath(step);
    if (step === 0) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type"><i class="fai">&#xf0e7;</i> User automation</span>' +
        '<h3>1. A real Lead enters WeQuote</h3>' +
        '<p>The story starts with one record already used in the CRM prototype: <strong>ABR Residential Lead</strong>.</p>' +
        '<div class="aut-e2e-record"><div><small>Lead · L-1008</small><strong>ABR Residential Lead</strong><span>Tony Baker · ABR Developments</span></div><div><small>Starting data</small><strong>£20,000 estimated value</strong><span>Owner: Jeff Mitchel · Source: Referral</span></div></div>' +
        '<div class="aut-demo-note">New Lead first contact assigns the owner and creates a scheduled Call activity on the Lead record without changing the Lead status.</div></div>';
    }
    if (step === 1) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type system"><i class="fai">&#xf023;</i> Protected system rule</span>' +
        '<h3>2. The salesperson converts the Lead</h3>' +
        '<p>Jeff clicks <strong>Convert to Deal</strong>. WeQuote creates one linked Deal and retains the original Lead for history.</p>' +
        '<div class="aut-e2e-record"><div><small>Lead · L-1008</small><strong>Status: Converted</strong><span>Linked to Deal D-0348</span></div><div><small>Deal · D-0348</small><strong>ABR Residential AV Upgrade</strong><span>Qualified · £20,000 · Owner: Jeff Mitchel</span></div></div>' +
        '<div class="aut-demo-note">Company, contact, owner, source, interests, notes and estimated value are copied into the Deal.</div></div>';
    }
    if (step === 2) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type system"><i class="fai">&#xf023;</i> User action + system rule</span>' +
        '<h3>3. A Quote is created and sent</h3>' +
        '<p>The Quote belongs to the same Deal. Sending it moves the Deal forward automatically; nobody needs to drag the pipeline card.</p>' +
        '<div class="aut-e2e-record"><div><small>Quote · Q-2410 · Rev 1</small><strong>Status: Sent</strong><span>£20,000 · Customer: ABR Developments</span></div><div><small>Deal · D-0348</small><strong>Stage: Proposal sent</strong><span>Triggered by the first sent Quote</span></div></div>' +
        '<div class="aut-demo-note">Quote Q-2410 keeps the Deal ID, customer and owner, so the next automation uses the same record chain.</div></div>';
    }
    if (step === 3) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type"><i class="fai">&#xf0e7;</i> User automation</span>' +
        '<h3>4. A future-due follow-up is created</h3>' +
        '<p>When the Quote is sent, WeQuote checks that the Deal has no open Next Action, then creates one immediately with a due date three days later.</p>' +
        '<div class="aut-e2e-record"><div><small>Quote · Q-2410</small><strong>Status: Sent</strong><span>The first send starts the automation</span></div><div><small>Deal Next Action · T-7781</small><strong>Check Quote feedback</strong><span>Assigned to Jeff Mitchel · Due in 3 days</span></div></div>' +
        '<div class="aut-demo-note">If the Deal already has an open Next Action, WeQuote preserves it and creates nothing.</div></div>';
    }
    if (step === 4) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type system"><i class="fai">&#xf023;</i> Protected system rule</span>' +
        '<h3>5. The customer accepts the Quote</h3>' +
        '<p>The accepted Quote becomes the winner. WeQuote freezes its value and updates the linked Deal to Won.</p>' +
        '<div class="aut-e2e-record"><div><small>Quote · Q-2410 · Rev 1</small><strong>Status: Accepted</strong><span>Winning Quote · Accepted value £20,000</span></div><div><small>Deal · D-0348</small><strong>Stage: Won</strong><span>Won value £20,000 · Sibling options resolved</span></div></div>' +
        '<div class="aut-demo-note">Users cannot customise the winning Quote, sibling option or Won-value rules inside the automation builder.</div></div>';
    }
    if (step === 5) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type system"><i class="fai">&#xf023;</i> Protected handoff</span>' +
        '<h3>6. The Won Deal becomes a Project</h3>' +
        '<p>The Project is linked back to the same Deal and accepted Quote, giving Delivery and Finance a reliable billing baseline.</p>' +
        '<div class="aut-e2e-record"><div><small>Project · P-1048</small><strong>ABR Residential AV Upgrade</strong><span>Customer: ABR Developments · Owner: Project team</span></div><div><small>Commercial baseline</small><strong>Quote Q-2410 · £20,000</strong><span>Future Change Orders contribute as deltas</span></div></div>' +
        '<div class="aut-demo-note">Invoices belong to Project P-1048—not directly to the Lead, Deal or Quote.</div></div>';
    }
    if (step === 6) {
      return '<div class="aut-demo-visual">' + path +
        '<span class="aut-e2e-type"><i class="fai">&#xf0e7;</i> User automation</span>' +
        '<h3>7. Deal billing creates a Draft Invoice</h3>' +
        '<p>The accepted Quote becomes the billing baseline. WeQuote checks the remaining invoiceable amount and whether this automation already created a Draft Invoice.</p>' +
        '<div class="aut-e2e-record"><div><small>Billing stage</small><strong>Deposit · 30%</strong><span>30% of £20,000 = £6,000</span></div><div><small>Invoice · D-0217</small><strong>Status: Draft · £6,000</strong><span>Linked to Project P-1048 · Finance review required</span></div></div>' +
        '<div class="aut-demo-note">The Invoice is not emailed, posted to accounting or marked as paid automatically.</div></div>';
    }
    return '<div class="aut-demo-visual">' + bossDemoPath(6) +
      '<span class="aut-demo-icon"><i class="fai">&#xf058;</i></span>' +
      '<h3>One connected customer journey</h3>' +
      '<p>The demo did not jump between unrelated records. Every object carries the previous record link forward.</p>' +
      '<div class="aut-e2e-record"><div><small>Sales chain</small><strong>L-1008 → D-0348 → Q-2410</strong><span>Lead → Deal → accepted Quote</span></div><div><small>Delivery & billing</small><strong>P-1048 → D-0217</strong><span>Project → Draft Invoice</span></div></div>' +
      '<div class="aut-demo-note"><strong>Preview only:</strong> no Lead, Deal, Quote, Project, task or Invoice was changed.</div></div>';
  }

  function selectedWalkthroughPath(step, config) {
    const secondStage = isNewLeadWorkflow(config)
      ? 'Assign owner'
      : (isLeadConversion(config)
        ? 'Create Deal'
        : (isWonHandoff(config)
          ? 'Deal Won'
          : (isQuoteInvoice(config)
            ? 'Prepare billing'
            : (config.waitDays ? 'Wait ' + config.waitDays + 'd' : 'System step'))));
    const actionStage = isQuoteInvoice(config) ? 'Draft Invoice' : 'Action';
    const labels = ['Trigger', secondStage, 'Check', actionStage, 'Summary'];
    return '<div class="aut-stage-walkthrough" aria-label="Automation stages">' + labels.map(function (label, index) {
      return '<span class="' + (index === step ? 'current' : (index < step ? 'done' : '')) + '">' + (index + 1) + '. ' + escapeAutomationHtml(label) + '</span>';
    }).join('') + '</div>';
  }

  function renderGuidedDemo() {
    const config = activeConfig();
    const matches = getWorkflowMatches(config);
    const nodeOrder = ['trigger', 'wait', 'condition', 'action', null];
    if (bossDemoMode) {
      const bossTitles = ['Lead enters CRM', 'Lead becomes Deal', 'Quote is sent', 'Three-day follow-up', 'Quote accepted and Deal Won', 'Project handoff', 'Draft Invoice created', 'Connected journey summary'];
      demoStepLabel.textContent = 'End-to-end Boss Demo · Step ' + (demoStepIndex + 1) + ' of ' + demoStepCount;
      demoTitle.textContent = bossTitles[demoStepIndex];
      demoProgress.style.gridTemplateColumns = 'repeat(' + demoStepCount + ',1fr)';
      demoProgress.innerHTML = Array.from({ length: demoStepCount }, function (_, step) {
        return '<span class="' + (step <= demoStepIndex ? 'done' : '') + '"></span>';
      }).join('');
      demoBody.innerHTML = bossDemoContent(demoStepIndex);
      demoBack.disabled = demoStepIndex === 0;
      demoBack.textContent = 'Back';
      demoNext.textContent = demoStepIndex === demoStepCount - 1 ? 'Finish demo' : 'Next';
      document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('demo-focus'); });
      return;
    }
    demoStepLabel.textContent = config.title + ' · Stage ' + (demoStepIndex + 1) + ' of ' + demoStepCount;
    demoTitle.textContent = (isLeadConversion(config)
      ? ['Lead conversion starts', 'Deal is created', 'Conversion is checked', 'Follow-up is prepared', 'Review and finish']
      : (isQuoteInvoice(config)
        ? ['Quote is accepted', 'Deal billing is prepared', 'Billing stage is checked', 'Draft Invoice is prepared', 'Review and finish']
      : (isNewLeadWorkflow(config)
        ? ['New Lead arrives', 'Owner is assigned', 'Lead activities are checked', 'Call activity is prepared', 'Review and finish']
        : (isInactiveLeadWorkflow(config)
          ? ['Inactive Lead is found', 'Time moves forward', 'Activity is checked', 'Reminder is prepared', 'Review and finish']
          : (isQuoteWorkflow(config)
            ? ['Quote is sent', 'Three-day wait', 'Acceptance is checked', 'Follow-up is prepared', 'Review and finish']
            : (isWonHandoff(config)
              ? ['Quote is accepted', 'Won outcome is confirmed', 'Duplicate action is checked', 'Deal handoff is prepared', 'Review and finish']
              : ['Automation starts', 'Time moves forward', 'Rule chooses a branch', 'Action is prepared', 'Review and finish']))))))[demoStepIndex];
    demoProgress.style.gridTemplateColumns = 'repeat(' + demoStepCount + ',1fr)';
    demoProgress.innerHTML = Array.from({ length: demoStepCount }, function (_, step) {
      return '<span class="' + (step <= demoStepIndex ? 'done' : '') + '"></span>';
    }).join('');
    demoBody.innerHTML = selectedWalkthroughPath(demoStepIndex, config) + guidedDemoContent(demoStepIndex, config, matches);
    demoBack.disabled = demoStepIndex === 0;
    demoBack.textContent = 'Previous stage';
    demoNext.textContent = demoStepIndex === demoStepCount - 1 ? 'Finish walkthrough' : 'Next stage';
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) {
      node.classList.toggle('demo-focus', node.dataset.autNode === nodeOrder[demoStepIndex]);
    });
  }

  function openGuidedDemo() {
    stopSelectedRun(false);
    demoStepIndex = 0;
    demoStepCount = 8;
    bossDemoMode = true;
    demoOverlay.hidden = false;
    renderGuidedDemo();
    demoNext.focus();
  }

  function openSelectedWalkthrough() {
    stopSelectedRun(false);
    if (isProposalApproval(activeConfig())) {
      renderProposalBeforeAfter();
      return;
    }
    if (journeyRunning) pauseJourney();
    demoStepIndex = 0;
    demoStepCount = 5;
    bossDemoMode = false;
    demoOverlay.hidden = false;
    renderGuidedDemo();
    demoNext.focus();
  }

  function closeGuidedDemo(completed) {
    const wasBossDemo = bossDemoMode;
    demoOverlay.hidden = true;
    bossDemoMode = false;
    demoStepCount = 5;
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('demo-focus'); });
    (wasBossDemo ? document.getElementById('autRunDemo') : selectedPlayButton).focus();
    if (completed) showAutomationToast(wasBossDemo ? 'End-to-end demo complete. No CRM data was changed.' : activeConfig().title + ' walkthrough complete. No CRM data was changed.');
  }

  function closeStepMenu() {
    if (!stepMenu) return;
    stepMenu.hidden = true;
    automationView.querySelectorAll('.aut-add.menu-open').forEach(function (button) { button.classList.remove('menu-open'); });
  }

  function openStepMenu(addButton) {
    if (!stepMenu || !addButton) return;
    closeStepMenu();
    const canvas = addButton.closest('.aut-canvas');
    const buttonRect = addButton.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const menuWidth = 220;
    const desiredLeft = canvas.scrollLeft + buttonRect.right - canvasRect.left + 10;
    stepMenu.style.left = Math.max(10, Math.min(desiredLeft, canvas.scrollWidth - menuWidth - 10)) + 'px';
    stepMenu.style.top = Math.max(10, canvas.scrollTop + buttonRect.top - canvasRect.top - 8) + 'px';
    stepMenu.dataset.position = addButton.dataset.autAdd || '';
    stepMenu.dataset.insert = addButton.dataset.autInsert || '';
    stepMenu.dataset.branch = addButton.dataset.autBranch || 'main';
    stepMenu.dataset.condition = addButton.dataset.autCondition || '';
    stepMenu.dataset.container = addButton.dataset.autContainer || 'r';
    const nestedConditionChoice = stepMenu.querySelector('[data-aut-step-choice="condition"]');
    if (nestedConditionChoice) nestedConditionChoice.hidden = false;
    stepMenu.hidden = false;
    addButton.classList.add('menu-open');
    const firstChoice = stepMenu.querySelector('button');
    if (firstChoice) firstChoice.focus();
  }

  function showActionPalette(position) {
    activeNode = 'palette';
    document.querySelectorAll('#viewAutomation [data-aut-node]').forEach(function (node) { node.classList.remove('selected'); });
    inspectorStep.textContent = 'Add step · ' + position.replaceAll('-', ' ');
    inspectorTitle.textContent = hasEditableStepModel(activeConfig()) ? 'What should happen next?' : 'Choose an action';
    inspectorFoot.hidden = true;
    const canReturn = scratchInsertIndex > 0;
    const config = activeConfig();
    const availableActions = workflowBlockCatalog.filter(function (block) {
      return block.tab === 'action' && !block.disabled && isWorkflowBlockCompatible(block, config);
    });
    const actionMarkup = availableActions.map(function (block) {
      return '<button type="button" data-aut-palette="' + escapeAutomationHtml(block.label) + '"><strong><i class="fai">' + block.icon + '</i> ' + escapeAutomationHtml(block.label) + '<em class="aut-capability ' + escapeAutomationHtml(block.capability) + '">' + escapeAutomationHtml(block.capabilityLabel) + '</em></strong><span>' + escapeAutomationHtml(block.detail) + (block.proof ? ' · ' + escapeAutomationHtml(block.proof) : '') + '</span></button>';
    }).join('');
    inspectorBody.innerHTML =
      '<div class="aut-field"><label for="autActionSearch">Choose a CRM action</label><input id="autActionSearch" type="search" placeholder="Search actions"></div>' +
      '<div class="aut-palette">' +
        actionMarkup +
        (canReturn ? '<button type="button" data-aut-palette="Return to earlier step"><strong><i class="fai">&#xf2ea;</i> Return to earlier step <em class="aut-capability engine">ENGINE</em></strong><span>Create a controlled revision loop without drawing a loose connector</span></button>' : '') +
      '</div>';
  }

  function addScratchStep(type, branch, conditionIndex, actionName, containerPath) {
    const config = activeConfig();
    if (!hasEditableStepModel(config)) return;
    normalizeScratchTree(config);
    beginEditableDraftVersion(config);
    const step = type === 'wait'
      ? { type: 'wait', days: 1 }
      : (type === 'condition'
        ? { type: 'condition', conditionKind: actionName === 'AND / OR group' ? 'group' : 'single', condition: actionName === 'AND / OR group' ? 'All criteria match (AND)' : (config.objectType === 'Quote' ? 'Quote is not accepted' : 'No new activity'), yesSteps: [], noSteps: [] }
        : (actionName === 'Create Note'
          ? { type: 'action', action: 'Create Note', noteTitle: 'Follow-up note', noteBody: 'Add the information the owner needs to follow up.', mention: config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner', followUpDelay: '1-working-day', followUpTime: '17:00', owner: config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner', completionMode: 'optional' }
          : (actionName === 'Schedule Meeting' || actionName === 'Schedule Meeting / Site Visit'
            ? { type: 'action', action: actionName, meetingTitle: 'Customer meeting', meetingAttendee: config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner', meetingWhen: 'Next working day', meetingTime: '10:00', meetingDuration: 60, owner: config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner', completionMode: 'optional' }
            : { type: 'action', action: actionName || 'Create Note', owner: config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner' })));
    applyScratchActionDefaults(step, config);
    const targetContainer = containerPath || scratchInsertContainer || 'r';
    const targetList = scratchSequenceReference(config, targetContainer);
    if (!targetList) return;
    if (step.type === 'action' && step.action === 'Return to earlier step') {
      const targetIndex = Math.max(0, scratchInsertIndex - 1);
      const targetStep = targetList[targetIndex];
      step.target = targetStep ? 'Step ' + (targetIndex + 2) + ' · ' + scratchStepText(targetStep).title : 'Previous step';
      step.detail = 'Return to ' + (targetStep ? scratchStepText(targetStep).title : 'previous step');
    }
    const insertIndex = Math.max(0, Math.min(scratchInsertIndex, targetList.length));
    targetList.splice(insertIndex, 0, step);
    normalizeScratchTree(config);
    const addedPath = scratchFindStepPath(config, step);
    activeNode = addedPath ? 'scratch-path:' + addedPath : 'scratch-trigger';
    persistAutomationState();
    updateCanvas();
    renderInspector(activeNode);
    recordPendingDraftChange((type === 'wait' ? 'Added Wait' : (type === 'condition' ? 'Added Rule' : 'Added action: ' + (actionName || 'Create Note'))));
    showAutomationToast((type === 'wait' ? 'Wait' : (type === 'condition' ? 'Rule' : 'Action')) + ' step added.');
  }

  function editDraftNode(action, nodeName) {
    const config = activeConfig();
    if (!hasEditableStepModel(config)) return;
    beginEditableDraftVersion(config);
    const reference = scratchStepReference(config, nodeName);
    if (!reference.step) return;
    const list = reference.list;
    let index = reference.index;
    let selectedStep = reference.step;
    if (action === 'duplicate') {
      selectedStep = JSON.parse(JSON.stringify(reference.step));
      list.splice(index + 1, 0, selectedStep);
      index += 1;
      showAutomationToast('Step duplicated.');
    } else if (action === 'delete') {
      list.splice(index, 1);
      activeNode = 'scratch-trigger';
      showAutomationToast('Step deleted from this Automation.');
    } else {
      const destination = action === 'up' ? index - 1 : index + 1;
      if (destination < 0 || destination >= list.length) {
        showAutomationToast(action === 'up' ? 'This is already the first step on the branch.' : 'This is already the last step on the branch.');
        return;
      }
      const moved = list.splice(index, 1)[0];
      list.splice(destination, 0, moved);
      selectedStep = moved;
      index = destination;
      showAutomationToast('Step moved.');
    }
    normalizeScratchTree(config);
    persistAutomationState();
    updateCanvas();
    if (action !== 'delete') {
      const selectedPath = scratchFindStepPath(config, selectedStep);
      activeNode = selectedPath ? 'scratch-path:' + selectedPath : 'scratch-trigger';
      renderInspector(activeNode);
    } else renderInspector('scratch-trigger');
    recordPendingDraftChange((action === 'duplicate' ? 'Duplicated' : (action === 'delete' ? 'Deleted' : 'Moved')) + ' workflow step');
  }

  function automationCreatorStageDefinitions() {
    const pipeline = automationPipelines().find(function (item) { return item.id === selectedTemplatePipelineId; }) || automationPipelines()[0];
    const definitions = automationPipelineStages(pipeline).map(function (stage) { return automationStageDefinition(stage.name, pipeline && pipeline.id); }).filter(Boolean);
    return definitions.length ? definitions : AUTOMATION_STAGE_DEFINITIONS;
  }

  function renderTemplateStageNav() {
    const host = document.getElementById('autTemplateStageNav');
    if (!host) return;
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const scratchOnly = creatorStartMode === 'scratch' || !quoteConnected;
    host.classList.toggle('is-locked', automationStageLocked);
    host.innerHTML = '<div class="aut-template-stage-nav-copy"><span><small>' + escapeAutomationHtml(quoteConnected ? 'PIPELINE WITH QUOTE LIFECYCLE' : 'FULLY CUSTOM PIPELINE') + '</small><strong>' + escapeAutomationHtml(pipeline && pipeline.name ? pipeline.name : 'Pipeline') + (selectedAutomationStage ? ' · ' + escapeAutomationHtml(selectedAutomationStage) : ' · Choose a Stage') + '</strong></span>' +
      (automationStageLocked
        ? '<em><i class="fai">&#xf023;</i> Selected from the Pipeline Map</em>'
        : '<em>' + (scratchOnly ? 'Pick a Stage to choose its Starts when event' : 'Pick a Stage to see its compatible templates') + '</em>') + '</div>' +
      '<div class="aut-template-stage-nav-rail">' + automationCreatorStageDefinitions().map(function (stage) {
        const selected = stage.name === selectedAutomationStage;
        const disabled = automationStageLocked && !selected;
        return '<button type="button" data-aut-template-stage="' + escapeAutomationHtml(stage.name) + '" class="' + (selected ? 'selected' : '') + '"' + (disabled ? ' disabled aria-disabled="true"' : '') + '><small>' + escapeAutomationHtml(stage.label) + '</small><strong>' + escapeAutomationHtml(stage.name) + '</strong></button>';
      }).join('') + '<button type="button" class="aut-template-stage-nav-advanced' + (selectedCompanyScopeMode !== 'all' ? ' selected' : '') + '" data-aut-company-scope aria-label="Configure Advanced Owning Company scope" title="' + escapeAutomationHtml(automationCompanyScopeLabel({ companyScopeMode: selectedCompanyScopeMode, companyScopeIds: selectedCompanyScopeIds })) + '"><small>ADVANCED · OPTIONAL</small><strong>Company scope</strong><em>' + (selectedCompanyScopeMode === 'all' ? 'Configure →' : 'Set ✓') + '</em></button></div>' +
      '<div class="aut-company-scope-inline"><i class="fai">&#xf1ad;</i><span><small>ENROLMENT SCOPE</small><strong>' + escapeAutomationHtml(automationCompanyScopeLabel({ companyScopeMode: selectedCompanyScopeMode, companyScopeIds: selectedCompanyScopeIds })) + '</strong></span><em>Each run still uses the record\'s Owning Company</em></div>';
  }

  function renderCompanyScopeScreen() {
    if (!companyScopeBody) return;
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const pipelineName = pipeline && pipeline.name ? pipeline.name : 'Pipeline';
    const selected = selectedCompanyScopeIds.slice();
    const stageStatus = selectedAutomationStage
      ? '<div class="aut-company-scope-stage is-ready"><i class="fai">&#xf00c;</i><span><small>' + escapeAutomationHtml(pipelineName.toUpperCase()) + ' STAGE</small><strong>' + escapeAutomationHtml(selectedAutomationStage) + '</strong><em>Company scope will be applied inside this Stage.</em></span></div>'
      : '<div class="aut-company-scope-stage"><i class="fai">&#xf061;</i><span><small>NEXT REQUIRED STEP</small><strong>Choose a Stage after applying this scope</strong><em>Advanced scope never creates a separate Pipeline and cannot replace the required Stage.</em></span></div>';
    companyScopeBody.innerHTML =
      '<div class="aut-company-scope-head"><span class="aut-company-scope-icon"><i class="fai">&#xf1ad;</i></span><div><small>ADVANCED · OPTIONAL COMPANY SCOPE</small><h3>Which Companies can enter this Automation?</h3><p>Scope controls enrolment inside ' + escapeAutomationHtml(pipelineName) + '. It is not another Pipeline, Stage, Rule or branch.</p></div></div>' +
      stageStatus +
      '<div class="aut-company-scope-options">' +
        '<label class="aut-company-scope-option' + (selectedCompanyScopeMode === 'all' ? ' selected' : '') + '"><input type="radio" name="autCompanyScopeMode" value="all"' + (selectedCompanyScopeMode === 'all' ? ' checked' : '') + '><span><strong>All Companies <em>RECOMMENDED</em></strong><small>One Organisation-level Automation follows each Lead, Deal or Quote\'s Owning Company.</small></span></label>' +
        '<label class="aut-company-scope-option' + (selectedCompanyScopeMode === 'selected' ? ' selected' : '') + '"><input type="radio" name="autCompanyScopeMode" value="selected"' + (selectedCompanyScopeMode === 'selected' ? ' checked' : '') + '><span><strong>Selected Companies only <em>ADVANCED</em></strong><small>Use when one or more Secondary Companies genuinely need a different outcome or timing.</small></span></label>' +
      '</div>' +
      '<div class="aut-company-scope-list' + (selectedCompanyScopeMode === 'all' ? ' disabled' : '') + '">' + AUTOMATION_OWNING_COMPANIES.map(function (company) {
        const checked = selected.indexOf(company.id) >= 0;
        return '<label class="aut-company-scope-company' + (checked ? ' selected' : '') + '"><input type="checkbox" name="autCompanyScopeCompany" value="' + escapeAutomationHtml(company.id) + '"' + (checked ? ' checked' : '') + (selectedCompanyScopeMode === 'all' ? ' disabled' : '') + '><i class="fai">&#xf1ad;</i><span><strong>' + escapeAutomationHtml(company.shortName || company.name) + '</strong><small>' + escapeAutomationHtml(company.name) + '</small></span><b><i class="fai">&#xf00c;</i></b></label>';
      }).join('') + '</div>' +
      '<div class="aut-company-scope-policy"><i class="fai">&#xf023;</i><span><strong>Safe overlap policy</strong><small>WeQuote blocks Turn on when another Active Automation would create the same outcome for an overlapping Company. Exclude that Company from the global Automation first.</small></span></div>' +
      '<div class="aut-company-scope-future"><span>Future</span><strong>Cross-stage / Pipeline-wide Automation</strong><small>Not part of the default Phase 1 path.</small></div>' +
      '<div class="aut-company-scope-actions"><span id="autCompanyScopeValidation">' + escapeAutomationHtml(automationCompanyScopeLabel({ companyScopeMode: selectedCompanyScopeMode, companyScopeIds: selectedCompanyScopeIds })) + '</span><div><button class="aut-btn" type="button" data-aut-creator-back="templates">Cancel</button><button class="aut-btn primary" type="button" id="autApplyCompanyScope">Apply scope</button></div></div>';
  }

  function creatorStageContextMarkup() {
    if (!selectedAutomationStage) return '';
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const definition = automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId);
    const contextLabel = definition && definition.quoteConnected
      ? (definition.custom ? definition.lifecycleSegment + ' LIFECYCLE SEGMENT' : 'PROTECTED QUOTE LIFECYCLE')
      : 'FULLY CUSTOM · SHARED LIBRARY';
    return '<div class="aut-creator-stage-context"><span><i class="fai">&#xf023;</i><small>' + escapeAutomationHtml((pipeline && pipeline.name ? pipeline.name : 'PIPELINE') + ' · ' + contextLabel) + '</small><strong>' + escapeAutomationHtml(selectedAutomationStage) + '</strong></span>' +
      (automationStageLocked ? '<em>Selected from this Stage card · locked</em>' : '<button type="button" data-aut-change-stage><i class="fai">&#xf303;</i> Browse stages</button>') + '</div>';
  }

  function syncCreatorStageContext() {
    [creatorHome, creatorTriggers].forEach(function (screen) {
      if (!screen) return;
      const existing = screen.querySelector('.aut-creator-stage-context');
      if (existing) existing.remove();
      if (selectedAutomationStage) screen.insertAdjacentHTML('afterbegin', creatorStageContextMarkup());
    });
  }

  function filterCreatorTemplatesForStage() {
    if (!creatorTemplates) return;
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const scratchOnly = creatorStartMode === 'scratch' || !quoteConnected;
    creatorTemplates.classList.toggle('scratch-only', scratchOnly);
    const scratchNotice = document.getElementById('autScratchOnlyNotice');
    const scratchTitle = document.getElementById('autScratchOnlyTitle');
    const scratchCopy = document.getElementById('autScratchOnlyCopy');
    if (scratchNotice) scratchNotice.hidden = !scratchOnly;
    if (scratchTitle) scratchTitle.textContent = selectedAutomationStage ? 'Build in ' + selectedAutomationStage : 'Choose the Stage first';
    if (scratchCopy) scratchCopy.textContent = quoteConnected
      ? 'You chose Start from scratch. Select the Stage where this Automation belongs, then choose a compatible Starts when event.'
      : 'This Fully Custom Pipeline has no Quote lifecycle templates. Select a Stage, then build with its Starts when, Rules and Actions.';
    const creatorBack = creatorTemplates.querySelector('[data-aut-creator-back="home"]');
    if (creatorBack) creatorBack.hidden = scratchOnly && !quoteConnected;
    const creatorHelp = creatorTemplates.querySelector('.aut-creator-toolbar .aut-help');
    if (creatorHelp) creatorHelp.textContent = scratchOnly
      ? 'Choose a Stage to continue from scratch'
      : 'Only templates supported by this Quote lifecycle are shown';
    renderTemplateStageNav();
    creatorTemplates.querySelectorAll('[data-aut-template]').forEach(function (card) {
      const cardStage = automationStageForTemplateKey(card.dataset.autTemplate, selectedAutomationStage);
      const matches = !!selectedAutomationStage && cardStage === selectedAutomationStage;
      card.hidden = false;
      card.disabled = !matches;
      card.setAttribute('aria-disabled', String(!matches));
      card.classList.toggle('is-stage-match', matches);
      card.classList.toggle('is-stage-muted', !!selectedAutomationStage && !matches);
      card.classList.toggle('is-awaiting-stage', !selectedAutomationStage);
    });
    creatorTemplates.querySelectorAll('.aut-template-section-label').forEach(function (label) {
      const title = label.querySelector('.aut-template-stage-title b');
      const selectedDefinition = automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId);
      const customSection = label.hasAttribute('data-aut-custom-template-section');
      const matches = customSection
        ? !!(selectedDefinition && selectedDefinition.custom)
        : !!title && title.textContent.trim() === selectedAutomationStage;
      if (customSection && title && selectedDefinition && selectedDefinition.custom) title.textContent = selectedAutomationStage;
      const copy = label.querySelector('small');
      if (customSection && copy && selectedDefinition && selectedDefinition.custom) {
        copy.textContent = selectedDefinition.quoteConnected
          ? 'Uses the shared ' + selectedDefinition.lifecycleSegment + ' segment library; this Stage keeps its own Automation settings.'
          : 'Uses the same generic library as every Fully Custom Stage; this Stage keeps its own Automation settings.';
      }
      label.hidden = false;
      label.classList.toggle('is-stage-match', matches);
      label.classList.toggle('is-stage-muted', !!selectedAutomationStage && !matches);
    });
    creatorTemplates.querySelectorAll('.aut-template-stage-note').forEach(function (note) {
      note.hidden = false;
      note.classList.toggle('is-stage-muted', !!selectedAutomationStage && selectedAutomationStage !== 'Lost');
    });
    const reviewVault = creatorTemplates.querySelector('.aut-template-review-vault');
    if (reviewVault) {
      reviewVault.hidden = false;
      const heading = reviewVault.querySelector('summary strong');
      if (heading) heading.textContent = 'Advanced · cross-stage templates under review';
    }
    const map = creatorTemplates.querySelector('.aut-template-pipeline-map');
    if (map) {
      map.hidden = scratchOnly || !quoteConnected;
      const mapTitle = map.querySelector('strong');
      if (mapTitle && quoteConnected) mapTitle.innerHTML = '<i class="fai">&#xf279;</i> Quotation work mapped to ' + escapeAutomationHtml(pipeline && pipeline.name ? pipeline.name : 'Pipeline');
      map.querySelectorAll('span').forEach(function (item) {
        const title = item.querySelector('b');
        item.classList.toggle('selected', !!title && title.textContent.trim() === selectedAutomationStage);
      });
    }
  }

  function scrollCreatorTemplatesToStage(stageName, smooth) {
    if (!creatorTemplates || !stageName) return;
    const definition = automationStageDefinition(stageName, selectedTemplatePipelineId);
    const target = Array.from(creatorTemplates.querySelectorAll('.aut-template-section-label')).find(function (label) {
      const title = label.querySelector('.aut-template-stage-title b');
      return (title && title.textContent.trim() === stageName) || (definition && definition.custom && label.hasAttribute('data-aut-custom-template-section'));
    });
    if (!target) return;
    requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'start', behavior: smooth === false ? 'auto' : 'smooth' });
    });
  }

  function renderCreatorTriggerChoices() {
    if (!creatorTriggers || !selectedAutomationStage) return;
    const stage = automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId);
    const lists = creatorTriggers.querySelectorAll('.aut-trigger-list');
    const sections = creatorTriggers.querySelectorAll('.aut-trigger-section');
    if (!stage || !lists.length) return;
    lists[0].innerHTML = stage.triggerChoices.map(function (choice) {
      return '<button class="aut-trigger-card" type="button" data-aut-trigger-choice="' + escapeAutomationHtml(choice[0]) + '"><i class="fai">' + choice[3] + '</i><span><strong>' + escapeAutomationHtml(choice[1]) + '</strong><span>' + escapeAutomationHtml(choice[2]) + '</span></span></button>';
    }).join('');
    const firstHeading = sections[0] && sections[0].querySelector('h3');
    if (firstHeading) firstHeading.textContent = selectedAutomationStage + ' compatible events';
    if (sections[1]) {
      const advancedHeading = sections[1].querySelector('h3');
      if (advancedHeading) advancedHeading.textContent = 'Advanced · Pipeline-wide / cross-stage';
      lists[1].innerHTML = '<div class="aut-trigger-advanced-note"><i class="fai">&#xf023;</i><span><strong>Stage-first safety</strong><small>Cross-stage and Pipeline-wide enrolment stays separate. The events above always remain bound to ' + escapeAutomationHtml(selectedAutomationStage) + '.</small></span></div>';
    }
  }

  function openStageAutomationCreator(stageName, locked, screen, pipelineId) {
    selectedTemplatePipelineId = pipelineId || selectedTemplatePipelineId || 'sales-pipeline';
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    const stage = automationStageDefinition(stageName, selectedTemplatePipelineId);
    if (!stage) return;
    selectedAutomationStage = stage.name;
    automationStageLocked = Boolean(locked);
    scratchTriggerChoice = null;
    selectedCompanyScopeMode = 'all';
    selectedCompanyScopeIds = [];
    creatorStartMode = quoteConnected ? 'templates' : 'scratch';
    templateOverlay.hidden = false;
    syncCreatorStageContext();
    filterCreatorTemplatesForStage();
    renderCreatorTriggerChoices();
    setCreatorScreen(quoteConnected ? 'home' : 'triggers');
  }

  function setCreatorScreen(screen) {
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    if (screen === 'home' && !quoteConnected) {
      creatorStartMode = 'scratch';
      screen = selectedAutomationStage ? 'triggers' : 'templates';
    }
    syncCreatorStageContext();
    creatorHome.hidden = screen !== 'home';
    creatorTemplates.hidden = screen !== 'templates';
    creatorTemplatePreview.hidden = screen !== 'template-preview';
    creatorCompanyScope.hidden = screen !== 'company-scope';
    creatorTriggers.hidden = screen !== 'triggers';
    creatorConfigure.hidden = screen !== 'configure';
    creatorProposalSetup.hidden = screen !== 'proposal-setup';
    if (screen === 'home') {
      creatorTitle.textContent = selectedAutomationStage ? 'Create automation in ' + selectedAutomationStage : 'How would you like to start?';
      creatorCopy.textContent = selectedAutomationStage
        ? 'Stage selected. Choose a Quote lifecycle template or build this Automation from scratch.'
        : 'Choose a ready-made Quote lifecycle template or start from scratch. We will ask which Stage it belongs to next.';
    } else if (screen === 'templates') {
      filterCreatorTemplatesForStage();
      const scratchOnly = creatorStartMode === 'scratch' || !quoteConnected;
      creatorTitle.textContent = scratchOnly ? 'Choose a Stage' : 'Choose a template';
      creatorCopy.textContent = scratchOnly
        ? 'Select where this Automation belongs. The next screen will show compatible Starts when events.'
        : (selectedAutomationStage
          ? 'Showing ' + ((pipeline && pipeline.name) || 'this Pipeline') + ' at ' + selectedAutomationStage + '. Compatible templates are ready to choose.'
          : 'Choose a Stage below. WeQuote will jump to its relevant Quote lifecycle templates.');
    } else if (screen === 'template-preview') {
      creatorTitle.textContent = 'Preview template';
      creatorCopy.textContent = 'Review every step and setting before creating the draft.';
    } else if (screen === 'company-scope') {
      renderCompanyScopeScreen();
      creatorTitle.textContent = 'Advanced Company scope';
      creatorCopy.textContent = selectedAutomationStage
        ? 'Stage: ' + selectedAutomationStage + '. Now choose which Companies can enter this Automation.'
        : 'Set this optional scope now, then choose the required Pipeline Stage.';
    } else if (screen === 'triggers') {
      renderCreatorTriggerChoices();
      const triggerBack = creatorTriggers.querySelector('[data-aut-creator-back]');
      if (triggerBack) {
        const backToStages = creatorStartMode === 'scratch' && !automationStageLocked;
        const standaloneLockedStage = !quoteConnected && automationStageLocked;
        triggerBack.hidden = standaloneLockedStage;
        triggerBack.dataset.autCreatorBack = backToStages ? 'templates' : 'home';
        triggerBack.innerHTML = '<i class="fai">&#xf060;</i> ' + (backToStages ? 'Back to stages' : 'Back');
      }
      creatorTitle.textContent = 'What should start this ' + selectedAutomationStage + ' Automation?';
      creatorCopy.textContent = 'Only events that can reasonably happen at the selected Stage are available.';
    } else if (screen === 'proposal-setup') {
      creatorTitle.textContent = 'Set up Client Proposal & Approval';
      creatorCopy.textContent = 'Use the protected Quotation lifecycle. Choose who completes, reviews and approves each workflow step.';
    } else {
      creatorTitle.textContent = 'Configure the trigger';
      creatorCopy.textContent = 'Set the minimum information WeQuote needs before adding it to the canvas.';
    }
    const screens = { home: creatorHome, templates: creatorTemplates, 'template-preview': creatorTemplatePreview, 'company-scope': creatorCompanyScope, triggers: creatorTriggers, configure: creatorConfigure, 'proposal-setup': creatorProposalSetup };
    const first = screens[screen].querySelector('button,select,input');
    if (first) first.focus();
  }

  function templatePreviewBranches(config) {
    if (isNewLeadWorkflow(config)) return ['Yes · None found', 'No · Already exists'];
    if (isInactiveLeadWorkflow(config)) return ['Yes · No reminder', 'No · Activity exists'];
    if (isQuoteWorkflow(config)) return ['Yes · Next Action empty', 'No · Next Action exists'];
    if (isWonHandoff(config)) return ['Yes · No Next Action', 'No · Next Action exists'];
    if (isQuoteInvoice(config)) return ['Yes · Amount available', 'No · Stop safely'];
    return ['Yes · Continue', 'No · Stop safely'];
  }

  function templateUsesPipeline(config) {
    return isProposalApproval(config) || isWonHandoff(config);
  }

  function templatePipelinePickerMarkup(config) {
    if (!templateUsesPipeline(config)) return '';
    const pipeline = automationPipelineForConfig(config);
    return '<div class="aut-preview-setting pipeline-choice"><small>Apply to which Pipeline?</small>' +
      '<select id="autTemplatePipeline">' + automationPipelineOptions(pipeline && pipeline.id) + '</select>' +
      '<span>The template will use this Pipeline\'s existing stages.</span>' +
    '</div>';
  }

  function proposalPreviewTaskList(stage) {
    const tasks = {
      'Qualified': ['Client qualification', 'Site visit required?'],
      'Site Visit': ['Schedule visit', 'Complete site visit'],
      'Scope of Work': ['Develop SOW', 'Sales owner'],
      'Technical Review': ['Engineering review', 'Approve or request changes'],
      'In Progress': ['Develop Proposal', 'Internal approval'],
      'Sent': ['Submit Proposal', 'Client approval'],
      'Won': ['Outcome won'],
      'Lost': ['Outcome lost']
    };
    return tasks[stage.name] || [];
  }

  function proposalPreviewStageMarkup(stage, index, mode, sampleDeal) {
    const isNew = mode === 'after' && stage.templateKey === 'client-proposal-approval';
    const tasks = mode === 'after' ? proposalPreviewTaskList(stage) : [];
    const outcomeClass = stage.outcome || (/^Won$/i.test(stage.name) ? 'won' : (/^Lost$/i.test(stage.name) ? 'lost' : ''));
    return '<article class="aut-pt-stage ' + (isNew ? 'is-new ' : '') + outcomeClass + '">' +
      '<header><span>' + (index + 1) + ' · ' + escapeAutomationHtml(stage.name) + '</span><i class="fai" style="color:' + escapeAutomationHtml(stage.color || '#576A92') + '">' + (stage.icon || '&#xf0ae;') + '</i>' + (isNew ? '<b>NEW</b>' : '') + '</header>' +
      '<div class="aut-pt-stage-body">' +
        (sampleDeal ? '<div class="aut-pt-deal"><i class="fai">&#xf15c;</i><strong>ABR Residential AV Upgrade</strong></div>' : '') +
        (tasks.length ? '<ul>' + tasks.map(function (task) { return '<li><i class="fai">&#xf058;</i>' + escapeAutomationHtml(task) + '</li>'; }).join('') + '</ul>' : (!sampleDeal ? '<span class="aut-pt-empty"><i class="fai">&#xf15c;</i>No Deals</span>' : '')) +
      '</div></article>';
  }

  function proposalPreviewStageRow(stages, mode) {
    return '<div class="aut-pt-stage-row">' + stages.map(function (stage, index) {
      const sampleDeal = mode === 'before' && /^Qualif/i.test(stage.name);
      return proposalPreviewStageMarkup(stage, index, mode, sampleDeal) + (index < stages.length - 1 ? '<i class="fai aut-pt-arrow">&#xf061;</i>' : '');
    }).join('') + '</div>';
  }

  function previewProposalTemplate(config) {
    const pipeline = automationPipelineForConfig(config);
    config.stageMap = proposalStageMapForPipeline(pipeline, config.stageMap);
    const beforeStages = automationPipelineStages(pipeline);
    const afterStages = proposalPipelineWithTemplateStages(pipeline);
    const missingStages = proposalTemplateStageNames().filter(function (name) {
      return !beforeStages.some(function (stage) { return stage.name === name; });
    });
    templatePreviewBody.innerHTML =
      '<div class="aut-pipeline-template-preview">' +
        '<div class="aut-pt-toolbar"><button class="aut-creator-back" type="button" data-aut-creator-back="templates"><i class="fai">&#xf060;</i> Back to templates</button><label><span>Apply to Pipeline</span><select id="autTemplatePipeline">' + automationPipelineOptions(pipeline && pipeline.id) + '</select></label></div>' +
        '<section class="aut-pt-section before"><h3>Before · ' + escapeAutomationHtml(pipeline ? pipeline.name : 'Pipeline') + '</h3>' + proposalPreviewStageRow(beforeStages, 'before') + '</section>' +
        '<section class="aut-pt-section additions"><h3>Template will add ' + missingStages.length + ' stage' + (missingStages.length === 1 ? '' : 's') + '</h3><div class="aut-pt-additions">' + PROPOSAL_TEMPLATE_STAGE_DEFS.map(function (stage) {
          const alreadyExists = !missingStages.includes(stage.name);
          const copy = stage.name === 'Site Visit' ? 'Conditional · only when required' : (stage.name === 'Scope of Work' ? 'Develop and approve SOW' : 'Engineering approval');
          return '<article class="aut-pt-add-card' + (alreadyExists ? ' exists' : '') + '"><i class="fai">' + stage.icon + '</i><div><strong>' + escapeAutomationHtml(stage.name) + '</strong><span>' + copy + '</span></div><b>' + (alreadyExists ? 'EXISTS' : 'NEW') + '</b></article>';
        }).join('') + '</div><p><i class="fai">&#xf061;</i> Insert after <strong>' + escapeAutomationHtml(config.stageMap.qualify) + '</strong>, before <strong>' + escapeAutomationHtml(config.stageMap.quoting) + '</strong></p><div class="aut-pt-info"><i class="fai">&#xf05a;</i> Existing Deals stay in their current stage.</div></section>' +
        '<section class="aut-pt-section after"><h3>After · Pipeline + workflow</h3>' + proposalPreviewStageRow(afterStages, 'after') + '</section>' +
        '<footer class="aut-pt-footer"><span>' + beforeStages.length + ' existing stages · <b>' + missingStages.length + ' new stages</b></span><div><button class="aut-btn" type="button" data-aut-creator-back="templates">Back</button><button class="aut-btn primary" type="button" id="autUseTemplate">Create Inactive Automation</button></div></footer>' +
      '</div>';
    setCreatorScreen('template-preview');
    creatorTitle.textContent = config.title;
    creatorCopy.textContent = 'Adds Site Visit, Scope of Work and Technical Review between ' + config.stageMap.qualify + ' and ' + config.stageMap.quoting + '.';
  }

  function previewTemplate(templateKey) {
    const template = templateDefinitions[templateKey];
    if (!template) return;
    const templateStage = automationStageForTemplateKey(templateKey, selectedAutomationStage);
    if (selectedAutomationStage && templateStage !== selectedAutomationStage) {
      showAutomationToast('Choose a ' + selectedAutomationStage + '-compatible template.');
      setCreatorScreen('templates');
      return;
    }
    if (selectedTemplateKey !== templateKey && !(selectedAutomationStage && selectedTemplatePipelineId)) {
      selectedTemplatePipelineId = template.triggerPipelineId || ((typeof getActivePipeline === 'function' && getActivePipeline()) ? getActivePipeline().id : 'sales-pipeline');
    }
    selectedTemplateKey = templateKey;
    const config = JSON.parse(JSON.stringify(template));
    if (selectedAutomationStage) {
      config.triggerPipelineId = selectedTemplatePipelineId || config.triggerPipelineId;
      config.triggerStage = selectedAutomationStage;
      if (config.customStageTemplate) config.triggerEvent = 'Deal enters ' + selectedAutomationStage;
    }
    config.companyScopeMode = selectedCompanyScopeMode;
    config.companyScopeIds = selectedCompanyScopeIds.slice();
    if (templateUsesPipeline(config)) config.triggerPipelineId = selectedTemplatePipelineId;
    normalizeSupportedWorkflow(config);
    if (isProposalApproval(config)) {
      previewProposalTemplate(config);
      return;
    }
    const steps = selectedWorkflowRunSteps(config);
    if (config.actionType === 'Create Note' && steps[3]) {
      steps[3].title = 'Create Note · ' + config.actionName;
      steps[3].detail = 'Mention ' + (config.mention || config.actionOwner || 'Record owner') + ' · ' + followUpDelayLabel(config.followUpDelay || 'today');
    }
    const nodeClasses = ['trigger', 'wait', 'condition', 'action'];
    const kickers = ['1. STARTS WHEN', (isNewLeadWorkflow(config) ? '2. ASSIGN OWNER' : ((isWonHandoff(config) || isQuoteInvoice(config)) ? '2. SYSTEM CONTEXT' : ((isInactiveLeadWorkflow(config) || isQuoteWorkflow(config)) ? '2. SET DUE DATE' : '2. THEN WAIT'))), '3. RULE', '4. DO THIS'];
    const branches = templatePreviewBranches(config);
    let flow = '';
    steps.forEach(function (step, index) {
      if (index > 0) flow += '<span class="aut-line"></span>';
      flow += '<div class="aut-node ' + nodeClasses[index] + ((index === 1 && (isWonHandoff(config) || isQuoteInvoice(config))) ? ' protected' : '') + '"><span class="aut-node-top"><span class="aut-node-icon"><i class="fai">' + step.icon + '</i></span><span><span class="aut-node-kicker">' + kickers[index] + '</span><span class="aut-node-name">' + escapeAutomationHtml(step.title) + '</span></span></span><span class="aut-node-detail">' + escapeAutomationHtml(step.detail) + '</span></div>';
      if (index === 2) flow += '<div class="aut-preview-branch-row"><span>' + escapeAutomationHtml(branches[0]) + '</span><span>' + escapeAutomationHtml(branches[1]) + '</span></div>';
    });
    flow += '<span class="aut-line"></span><span class="aut-end">END</span>';
    const protectedCopy = (isWonHandoff(config) || isQuoteInvoice(config))
      ? '<div class="aut-template-note"><i class="fai">&#xf023;</i><span>' + (isWonHandoff(config) ? 'Choose a CRM Pipeline. Its current stages are loaded into the trigger, while the Won outcome remains protected by WeQuote.' : 'This template listens to the protected Quote acceptance rule, then uses the existing Deal Billing fields shown in this CRM.') + '</span></div>'
      : '<div class="aut-template-note"><i class="fai">&#xf06e;</i><span>Nothing has been created yet. This preview uses the template defaults only.</span></div>';
    templatePreviewBody.innerHTML =
      '<div class="aut-creator-toolbar"><button class="aut-creator-back" type="button" data-aut-creator-back="templates"><i class="fai">&#xf060;</i> Back to templates</button><span class="aut-help">Review before creating a draft</span></div>' +
      '<div class="aut-template-preview-layout"><div class="aut-template-preview-flow">' + flow + '</div>' +
      '<aside class="aut-template-preview-side"><div><span class="aut-object-badge ' + objectBadgeClass(config.objectType) + '">' + escapeAutomationHtml(config.objectType.toUpperCase()) + '</span><h3 style="margin-top:8px;">' + escapeAutomationHtml(config.title) + '</h3></div>' +
        templatePipelinePickerMarkup(config) +
        '<div class="aut-preview-setting company-scope"><small>Owning Company scope</small><strong><i class="fai">&#xf1ad;</i> ' + escapeAutomationHtml(automationCompanyScopeLabel(config)) + '</strong><span>Every run uses the matching record\'s Owning Company.</span>' + automationCompanyScopePillsMarkup(config, 'compact') + '</div>' +
        '<div class="aut-preview-setting"><small>Starts when</small><strong>' + escapeAutomationHtml(steps[0].title) + '</strong><span>' + escapeAutomationHtml(steps[0].detail) + '</span></div>' +
        '<div class="aut-preview-setting"><small>Second step</small><strong>' + escapeAutomationHtml(steps[1].title) + '</strong><span>' + escapeAutomationHtml(steps[1].detail) + '</span></div>' +
        '<div class="aut-preview-setting"><small>Rule</small><strong>' + escapeAutomationHtml(steps[2].title) + '</strong><span>' + escapeAutomationHtml(branches[0]) + ' / ' + escapeAutomationHtml(branches[1]) + '</span></div>' +
        '<div class="aut-preview-setting"><small>Action</small><strong>' + escapeAutomationHtml(steps[3].title) + '</strong><span>' + escapeAutomationHtml(steps[3].detail) + '</span></div>' + protectedCopy +
        '<div class="aut-preview-actions"><button class="aut-btn" type="button" data-aut-creator-back="templates">Cancel</button><button class="aut-btn primary" type="button" id="autUseTemplate">Add to Your automations</button></div>' +
      '</aside></div>';
    setCreatorScreen('template-preview');
  }

  function triggerConfigurationMarkup(choice) {
    const stage = automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId);
    const info = stage && stage.triggerChoices.find(function (item) { return item[0] === choice; });
    if (!info) return '<div class="aut-info-note"><i class="fai">&#xf05a;</i><span>This event is not compatible with the selected Stage.</span></div>';
    const scopeConfig = { companyScopeMode: selectedCompanyScopeMode, companyScopeIds: selectedCompanyScopeIds };
    const fields = '<div class="aut-stage-lock-summary"><i class="fai">&#xf023;</i><span><small>PIPELINE STAGE</small><strong>' + escapeAutomationHtml(selectedAutomationStage) + '</strong><em>The trigger cannot move this Automation to another Stage</em></span></div><div class="aut-stage-lock-summary company"><i class="fai">&#xf1ad;</i><span><small>OWNING COMPANY SCOPE</small><strong>' + escapeAutomationHtml(automationCompanyScopeLabel(scopeConfig)) + '</strong><em>Advanced enrolment metadata · not a branch Rule</em></span></div>' + automationCompanyScopePillsMarkup(scopeConfig, 'inspector') + '<div class="aut-rule"><strong>Ready to add</strong><div class="aut-help" style="margin-top:5px;">' + escapeAutomationHtml(info[2]) + ' You can add conditions, waits and actions after this event.</div></div>';
    return '<div class="aut-config-card"><div class="aut-config-title"><i class="fai">' + info[3] + '</i><div><strong>' + escapeAutomationHtml(info[1]) + '</strong><span>' + escapeAutomationHtml(info[2]) + '</span></div></div><div class="aut-config-grid">' + fields + '</div><div class="aut-config-actions"><button class="aut-btn" type="button" data-aut-creator-back="triggers">Back</button><button class="aut-btn primary" type="button" id="autApplyScratchTrigger">Add trigger</button></div></div>';
  }

  function configureScratchTrigger(choice) {
    scratchTriggerChoice = choice;
    triggerConfigureBody.innerHTML = triggerConfigurationMarkup(choice);
    setCreatorScreen('configure');
  }

  function proposalStageField(id, label, pipeline, selected, helper) {
    return '<div class="aut-proposal-map-row"><div><small>Template work</small><strong>' + escapeAutomationHtml(label) + '</strong><span>' + escapeAutomationHtml(helper) + '</span></div><i class="fai">&#xf061;</i><label><small>Existing stage</small><select id="' + id + '">' + automationStageOptionsForPipeline(pipeline, selected, false) + '</select></label></div>';
  }

  function renderProposalSetup(config) {
    const pipeline = automationPipelineForConfig(config);
    config.stageMap = proposalStageMapForPipeline(pipeline, config.stageMap);
    const role = config.responsibilities;
    const stageCountAdded = PROPOSAL_TEMPLATE_STAGE_DEFS.filter(function (stage) { return proposalStageIsTemplateCreated(pipeline, stage.name); }).length;
    proposalSetupBody.innerHTML =
      '<div class="aut-proposal-setup-head"><div><span class="aut-status">Needs setup</span><strong>Pipeline template applied</strong><small>The stages are ready. Assign the people who will complete and approve the work.</small></div><button class="aut-btn" type="button" id="autCloseProposalSetup">Finish later</button></div>' +
      '<div class="aut-proposal-setup-grid"><section><header><span>1</span><div><strong>Confirm Pipeline stages</strong><small>' + (stageCountAdded ? stageCountAdded + ' missing stage' + (stageCountAdded === 1 ? ' was' : 's were') + ' added; existing matching stages are reused.' : 'All three workflow stages already existed and are reused.') + '</small></div></header>' +
        '<div class="aut-field"><label for="autProposalPipeline">Pipeline</label><select id="autProposalPipeline" disabled>' + automationPipelineOptions(config.triggerPipelineId) + '</select></div>' +
        automationPipelineStripMarkup(pipeline, [config.stageMap.siteVisit, config.stageMap.sow, config.stageMap.technicalReview]) +
        '<div class="aut-proposal-created-stages">' + PROPOSAL_TEMPLATE_STAGE_DEFS.map(function (stage) {
          const created = proposalStageIsTemplateCreated(pipeline, stage.name);
          return '<div><i class="fai">' + stage.icon + '</i><span><strong>' + escapeAutomationHtml(stage.name) + '</strong><small>' + (created ? 'Created by this template' : 'Existing Pipeline stage reused') + '</small></span><b>' + (created ? 'NEW' : 'EXISTS') + '</b></div>';
        }).join('') + '</div><div class="aut-info-note"><i class="fai">&#xf05a;</i><span>Existing Deals stayed in their original stage. New Deals will follow the workflow path after it is turned on.</span></div></section>' +
        '<section><header><span>2</span><div><strong>Assign people & responsibilities</strong><small>Choose a person, team or dynamic Deal owner.</small></div></header>' +
          '<div class="aut-proposal-people-list">' +
            '<label><span><i class="fai">&#xf007;</i><b>Client qualification</b><small>Assignee · completes work</small></span><select id="autProposalRoleQualification">' + proposalPeopleOptions(role.clientQualification) + '</select></label>' +
            '<label><span><i class="fai">&#xf133;</i><b>Complete site visit</b><small>Assignee · conditional field work</small></span><select id="autProposalRoleSiteVisit">' + proposalPeopleOptions(role.siteVisit) + '</select></label>' +
            '<label><span><i class="fai">&#xf15c;</i><b>Develop SOW</b><small>Assignee · prepares scope</small></span><select id="autProposalRoleSow">' + proposalPeopleOptions(role.developSow) + '</select></label>' +
            '<label class="featured"><span><i class="fai">&#xf24e;</i><b>Technical review</b><small>Reviewer · checks technical details</small></span><select id="autProposalRoleTechnical">' + proposalPeopleOptions(role.technicalReview) + '</select></label>' +
            '<label><span><i class="fai">&#xf24e;</i><b>Internal approval</b><small>Approver · makes the decision</small></span><select id="autProposalRoleInternal">' + proposalPeopleOptions(role.internalApproval) + '</select></label>' +
            '<label><span><i class="fai">&#xf571;</i><b>Deposit Invoice request</b><small>Assignee · Finance handoff</small></span><select id="autProposalRoleFinance">' + proposalPeopleOptions(role.requestInvoice) + '</select></label>' +
          '</div>' +
          '<div class="aut-proposal-role-legend"><span><i class="fai">&#xf007;</i> Assignee completes work</span><span><i class="fai">&#xf24e;</i> Reviewer checks details</span><span><i class="fai">&#xf06e;</i> Follower receives updates</span></div>' +
        '</section></div>' +
      '<div class="aut-proposal-setup-actions"><span><i class="fai">&#xf058;</i> Changes saved automatically</span><button class="aut-btn primary" type="button" id="autSaveProposalSetup">Save setup</button></div>';
    setCreatorScreen('proposal-setup');
  }

  function saveProposalSetup() {
    const config = activeConfig();
    if (!isProposalApproval(config)) return;
    const pipelineId = document.getElementById('autProposalPipeline').value;
    const pipeline = automationPipelines().find(function (item) { return item.id === pipelineId; });
    const map = proposalStageMapForPipeline(pipeline, config.stageMap);
    config.triggerPipelineId = pipelineId;
    config.stageMap = map;
    config.responsibilities.clientQualification = document.getElementById('autProposalRoleQualification').value;
    config.responsibilities.siteVisit = document.getElementById('autProposalRoleSiteVisit').value;
    config.responsibilities.developSow = document.getElementById('autProposalRoleSow').value;
    config.responsibilities.technicalReview = document.getElementById('autProposalRoleTechnical').value;
    config.responsibilities.internalApproval = document.getElementById('autProposalRoleInternal').value;
    config.responsibilities.requestInvoice = document.getElementById('autProposalRoleFinance').value;
    config.setupComplete = true;
    persistAutomationState();
    templateOverlay.hidden = true;
    showAutomationZeroState();
    showAutomationToast('Setup saved. Open the Inactive Automation when you are ready to review or turn it on.');
  }

  function openTemplatePicker(screen) {
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
    let targetScreen = screen === 'triggers' && selectedAutomationStage ? 'triggers' : (screen === 'home' ? 'home' : 'templates');
    if (!quoteConnected) {
      creatorStartMode = 'scratch';
      targetScreen = selectedAutomationStage ? 'triggers' : 'templates';
    }
    templateOverlay.hidden = false;
    syncCreatorStageContext();
    filterCreatorTemplatesForStage();
    if (selectedAutomationStage) renderCreatorTriggerChoices();
    setCreatorScreen(targetScreen);
    if (selectedAutomationStage && targetScreen === 'templates') scrollCreatorTemplatesToStage(selectedAutomationStage, false);
  }

  function closeTemplatePicker() {
    templateOverlay.hidden = true;
    const returnTarget = topbarActions && !topbarActions.hidden
      ? document.getElementById('autPipelineCreateAutomation')
      : document.querySelector('[data-aut-pipeline-open="sales-pipeline"]');
    if (returnTarget) returnTarget.focus();
  }

  function createScratchWorkflow() {
    if (!scratchTriggerChoice || !selectedAutomationStage) return;
    const stage = automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId);
    const triggerChoice = stage && stage.triggerChoices.find(function (item) { return item[0] === scratchTriggerChoice; });
    if (!triggerChoice) return;
    draftCounter += 1;
    const config = {
      kind: 'scratch',
      title: 'Untitled automation ' + draftCounter,
      enabled: false,
      triggerKind: scratchTriggerChoice,
      objectType: triggerChoice[4],
      triggerPipelineId: selectedTemplatePipelineId || 'sales-pipeline',
      triggerStage: selectedAutomationStage,
      triggerStageId: stage.stageId,
      triggerEvent: triggerChoice[1],
      stageLocked: true,
      companyScopeMode: selectedCompanyScopeMode,
      companyScopeIds: selectedCompanyScopeIds.slice(),
      editableTrigger: { title: triggerChoice[1], detail: ((automationPipelineById(selectedTemplatePipelineId) || {}).name || 'Pipeline') + ' · ' + selectedAutomationStage },
      eventType: 'Added',
      dateField: 'Expected close date',
      dateMode: 'On the date',
      triggerTime: '09:00',
      timezone: 'Europe/London',
      automationGroupKey: selectedAutomationGroupKey || activeAutomationGroupKey || 'standard',
      steps: []
    };
    const key = 'scratch-' + draftCounter;
    workflows[key] = config;
    const button = document.createElement('button');
    button.className = 'aut-workflow';
    button.type = 'button';
    button.dataset.autWorkflow = key;
    button.innerHTML = '<span class="aut-workflow-line"><span class="aut-workflow-name"></span><span class="aut-object-badge ' + objectBadgeClass(config.objectType) + '">' + escapeAutomationHtml(config.objectType.toUpperCase()) + '</span></span><span class="aut-workflow-meta"><span class="aut-status">Inactive</span><span>Building</span></span>';
    const sections = document.querySelectorAll('.aut-list .aut-list-section');
    const protectedSection = sections[sections.length - 1];
    document.querySelector('.aut-list').insertBefore(button, protectedSection);
    document.querySelector('.aut-count').textContent = Object.keys(workflows).length;
    activeWorkflowKey = key;
    activeNode = 'scratch-trigger';
    templateOverlay.hidden = true;
    persistAutomationState();
    persistAutomationGroupState();
    applyAutomationGroupToMap(config.automationGroupKey);
    updateCanvas();
    renderInspector('scratch-trigger');
    showAutomationToast('Trigger added. Use + to build the next step.');
  }

  function createWorkflowFromTemplate(templateKey) {
    const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
    if (!automationPipelineUsesQuoteLifecycle(pipeline)) {
      creatorStartMode = 'scratch';
      setCreatorScreen(selectedAutomationStage ? 'triggers' : 'templates');
      showAutomationToast('Templates are only available for Pipelines connected to the Quote lifecycle.');
      return;
    }
    const template = templateDefinitions[templateKey];
    const templateStage = automationStageForTemplateKey(templateKey, selectedAutomationStage);
    if (!template || !selectedAutomationStage || templateStage !== selectedAutomationStage) {
      showAutomationToast('Select a Stage-compatible template before creating the Automation.');
      return;
    }
    draftCounter += 1;
    const key = templateKey + '-draft-' + draftCounter;
    const existingCopies = userWorkflowKeys().filter(function (workflowKey) {
      return workflows[workflowKey].templateKey === templateKey;
    }).length;
    const templateCopy = JSON.parse(JSON.stringify(template));
    if (selectedAutomationStage && selectedTemplatePipelineId) templateCopy.triggerPipelineId = selectedTemplatePipelineId;
    if (templateUsesPipeline(templateCopy) && selectedTemplatePipelineId) {
      templateCopy.triggerPipelineId = selectedTemplatePipelineId;
      const selectedPipeline = automationPipelines().find(function (pipeline) { return pipeline.id === selectedTemplatePipelineId; });
      if (isProposalApproval(templateCopy)) {
        const result = applyProposalTemplateStages(selectedPipeline);
        templateCopy.stageMap = proposalStageMapForPipeline(selectedPipeline);
        templateCopy.pipelineTemplateApplied = true;
        templateCopy.setupComplete = true;
        templateCopy.pipelineStagesAdded = result.added;
        templateCopy.pipelineStagesAddedNames = result.addedNames;
      }
    }
    workflows[key] = Object.assign(templateCopy, {
      title: template.title + (existingCopies ? ' ' + (existingCopies + 1) : ''),
      enabled: false,
      protected: false,
      templateKey: templateKey,
      triggerStage: selectedAutomationStage,
      triggerStageId: (automationStageDefinition(selectedAutomationStage, selectedTemplatePipelineId) || {}).stageId || '',
      stageLocked: true,
      companyScopeMode: selectedCompanyScopeMode,
      companyScopeIds: selectedCompanyScopeIds.slice(),
      automationGroupKey: selectedAutomationGroupKey || activeAutomationGroupKey || 'standard'
    });
    if (templateCopy.customStageTemplate) workflows[key].triggerEvent = 'Deal enters ' + selectedAutomationStage;
    const editableModel = templateEditableStepModel(workflows[key]);
    if (editableModel) {
      workflows[key].editableDraft = true;
      workflows[key].editableTrigger = editableModel.trigger;
      workflows[key].steps = editableModel.steps;
    }
    normalizeSupportedWorkflow(workflows[key]);
    repairUnsupportedReviewActions(workflows[key]);
    repairNoteBasedTemplateActions(workflows[key]);
    repairCreateQuoteActions(workflows[key]);
    repairWorkflowStageAlignment(workflows[key]);
    activeWorkflowKey = key;
    activeNode = hasEditableStepModel(workflows[key]) ? 'scratch-trigger' : (isProposalApproval(workflows[key]) ? 'proposal-technical-review' : 'trigger');
    persistAutomationState();
    persistAutomationGroupState();
    updateWorkflowList();
    templateOverlay.hidden = true;
    applyAutomationGroupToMap(workflows[key].automationGroupKey);
    showActiveAutomation();
    updateCanvas();
    renderInspector(activeNode);
    resetJourney();
    showAutomationToast((workflows[key].pipelineStagesAdded ? workflows[key].pipelineStagesAdded + ' Pipeline stages added. ' : '') + template.title + ' copied as an Inactive editable Automation.');
  }

  automationView.addEventListener('pointerdown', function (event) {
    const libraryBlock = event.target.closest('[data-aut-block-id]');
    if (libraryBlock && hasEditableStepModel(activeConfig()) && (event.button === undefined || event.button === 0)) {
      closeStepMenu();
      libraryPointerBlock = libraryBlock.dataset.autBlockId;
      libraryPointerMoved = false;
      libraryPointerStart = { x: event.clientX, y: event.clientY };
      if (libraryBlock.setPointerCapture && event.pointerId !== undefined) {
        try { libraryBlock.setPointerCapture(event.pointerId); } catch (error) { /* Pointer capture is an enhancement only. */ }
      }
      return;
    }
    const node = event.target.closest('.aut-node');
    const wrap = node && node.closest('[data-aut-step-wrap]');
    if (!wrap || !hasEditableStepModel(activeConfig()) || (event.button !== undefined && event.button !== 0)) return;
    if (wrap.classList.contains('aut-trigger-node-wrap')) return;
    if (event.target.closest('.aut-node-tools')) return;
    const reference = scratchStepReference(activeConfig(), wrap.dataset.autStepWrap);
    if (!reference || !reference.step) return;
    const canvas = wrap.closest('.aut-canvas');
    scratchPointerNode = wrap.dataset.autStepWrap;
    scratchPointerMoved = false;
    scratchPointerStart = {
      x: event.clientX,
      y: event.clientY,
      scrollLeft: canvas ? canvas.scrollLeft : 0,
      scrollTop: canvas ? canvas.scrollTop : 0
    };
    if (wrap.setPointerCapture && event.pointerId !== undefined) {
      try { wrap.setPointerCapture(event.pointerId); } catch (error) { /* Pointer capture is an enhancement only. */ }
    }
  });

  automationView.addEventListener('pointermove', function (event) {
    if (libraryPointerBlock && libraryPointerStart) {
      const distance = Math.abs(event.clientX - libraryPointerStart.x) + Math.abs(event.clientY - libraryPointerStart.y);
      if (!libraryPointerMoved && distance < 6) return;
      libraryPointerMoved = true;
      libraryDraggedBlock = libraryPointerBlock;
      const draggedBlock = automationView.querySelector('[data-aut-block-id="' + libraryPointerBlock + '"]');
      const block = workflowBlock(libraryPointerBlock);
      if (draggedBlock) {
        draggedBlock.classList.add('is-dragging');
        updateLibraryDragGhost(draggedBlock, event.clientX, event.clientY);
      }
      const canvas = automationView.querySelector('.aut-canvas');
      if (canvas) {
        canvas.classList.add('is-library-dragging');
        canvas.classList.toggle('is-library-trigger-dragging', !!block && block.type === 'trigger');
      }
      updateLibraryDropHighlight(libraryPointerBlock, event.clientX, event.clientY);
      updateDragAutoScroll(event.clientX, event.clientY);
      event.preventDefault();
      return;
    }
    if (!scratchPointerNode || !scratchPointerStart) return;
    const distance = Math.abs(event.clientX - scratchPointerStart.x) + Math.abs(event.clientY - scratchPointerStart.y);
    // Keep a normal card press separate from dragging. Trackpads can report a
    // few pixels of movement during a click, which previously swallowed the
    // selection and made existing Condition / Action cards look uneditable.
    if (!scratchPointerMoved && distance < 10) return;
    scratchPointerMoved = true;
    const wrap = automationView.querySelector('[data-aut-step-wrap="' + scratchPointerNode + '"]');
    if (wrap) {
      wrap.classList.add('is-dragging');
      updateScratchDragGhost(wrap, event.clientX, event.clientY);
      const canvas = wrap.closest('.aut-canvas');
      if (canvas) canvas.classList.add('is-node-dragging');
    }
    updateScratchDropHighlight(scratchDropButtonAtPoint(event.clientX, event.clientY), scratchPointerNode);
    updateDragAutoScroll(event.clientX, event.clientY);
    event.preventDefault();
  });

  automationView.addEventListener('pointerup', function (event) {
    if (libraryPointerBlock) {
      const blockId = libraryPointerBlock;
      const moved = libraryPointerMoved;
      const target = moved ? libraryDropTargetAtPoint(blockId, event.clientX, event.clientY) : null;
      libraryPointerBlock = null;
      libraryPointerMoved = false;
      libraryPointerStart = null;
      clearScratchDragState();
      if (!moved) return;
      suppressLibraryClick = true;
      window.setTimeout(function () { suppressLibraryClick = false; }, 60);
      if (target && ((target.block.type === 'trigger' && target.triggerNode) || (target.block.type !== 'trigger' && target.dropButton))) {
        addWorkflowBlock(blockId, target.dropButton);
      } else {
        showAutomationToast(target && target.block && target.block.type === 'trigger'
          ? 'Drop the start event onto the current trigger.'
          : 'Drop this block on a highlighted insertion point.');
      }
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    if (!scratchPointerNode) return;
    const nodeName = scratchPointerNode;
    const moved = scratchPointerMoved;
    const dropButton = moved ? scratchDropButtonAtPoint(event.clientX, event.clientY) : null;
    const canvas = automationView.querySelector('.aut-canvas');
    const canvasRect = canvas && canvas.getBoundingClientRect();
    const insideCanvas = !!canvasRect && event.clientX >= canvasRect.left && event.clientX <= canvasRect.right && event.clientY >= canvasRect.top && event.clientY <= canvasRect.bottom;
    scratchPointerNode = null;
    scratchPointerMoved = false;
    scratchPointerStart = null;
    clearScratchDragState();
    if (!moved) {
      // Pointer capture used by the drag interaction can prevent the browser
      // from delivering a reliable click to the nested card. Select the step
      // explicitly on pointer-up so every existing card can always reopen its
      // Inspector after it has been created.
      stopSelectedRun(false);
      renderInspector(nodeName);
      return;
    }
    suppressScratchClick = true;
    window.setTimeout(function () { suppressScratchClick = false; }, 100);
    if (dropButton && canDropScratchNode(nodeName, dropButton)) moveScratchNodeToDrop(nodeName, dropButton);
    else if (dropButton) showAutomationToast('Drop this step on a valid insertion frame. Rules keep their controlled Yes and No outputs.');
    else if (insideCanvas) showAutomationToast('Drop this card on a highlighted insertion frame. The workflow will reconnect automatically.');
    else showAutomationToast('Card released outside the canvas, so it was not moved.');
    event.preventDefault();
    event.stopPropagation();
  });

  automationView.addEventListener('pointercancel', function () {
    libraryPointerBlock = null;
    libraryPointerMoved = false;
    libraryPointerStart = null;
    scratchPointerNode = null;
    scratchPointerMoved = false;
    scratchPointerStart = null;
    scratchConnectionSource = null;
    scratchConnectionMoved = false;
    scratchConnectionStart = null;
    clearScratchConnectionVisual();
    clearScratchDragState();
  });

  automationView.addEventListener('dragstart', function (event) {
    const libraryBlock = event.target.closest('[data-aut-block-id]');
    if (libraryBlock && hasEditableStepModel(activeConfig())) {
      closeStepMenu();
      libraryDraggedBlock = libraryBlock.dataset.autBlockId;
      libraryBlock.classList.add('is-dragging');
      const canvas = automationView.querySelector('.aut-canvas');
      const block = workflowBlock(libraryDraggedBlock);
      if (canvas) {
        canvas.classList.add('is-library-dragging');
        canvas.classList.toggle('is-library-trigger-dragging', !!block && block.type === 'trigger');
      }
      if (event.dataTransfer) {
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', 'workflow-block:' + libraryDraggedBlock);
      }
      setNativeDragImage(event, libraryBlock);
      return;
    }
    const wrap = event.target.closest('[data-aut-step-wrap][draggable="true"]');
    if (!wrap || !hasEditableStepModel(activeConfig())) return;
    closeStepMenu();
    scratchDraggedNode = wrap.dataset.autStepWrap;
    wrap.classList.add('is-dragging');
    const canvas = wrap.closest('.aut-canvas');
    if (canvas) canvas.classList.add('is-node-dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', scratchDraggedNode);
    }
    setNativeDragImage(event, wrap);
  });

  automationView.addEventListener('dragover', function (event) {
    if (libraryDraggedBlock) {
      const block = workflowBlock(libraryDraggedBlock);
      const dropButton = event.target.closest('.aut-add[data-aut-add^="scratch"]');
      const triggerNode = event.target.closest('[data-aut-node="scratch-trigger"]');
      const validTarget = block && ((block.type === 'trigger' && triggerNode) || (block.type !== 'trigger' && dropButton));
      if (!validTarget) return;
      event.preventDefault();
      if (dropButton) dropButton.classList.add('aut-drop-target');
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      return;
    }
    if (!scratchDraggedNode) return;
    const dropButton = event.target.closest('.aut-add[data-aut-add^="scratch"]');
    if (!dropButton) return;
    updateScratchDropHighlight(dropButton, scratchDraggedNode);
    if (!canDropScratchNode(scratchDraggedNode, dropButton)) {
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'none';
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  });

  automationView.addEventListener('dragleave', function (event) {
    const dropButton = event.target.closest('.aut-add[data-aut-add^="scratch"]');
    if (dropButton && (!event.relatedTarget || !dropButton.contains(event.relatedTarget))) {
      dropButton.classList.remove('aut-drop-target', 'aut-drop-invalid');
    }
  });

  automationView.addEventListener('drop', function (event) {
    if (libraryDraggedBlock) {
      const blockId = libraryDraggedBlock;
      const block = workflowBlock(blockId);
      const dropButton = event.target.closest('.aut-add[data-aut-add^="scratch"]');
      const triggerNode = event.target.closest('[data-aut-node="scratch-trigger"]');
      if (block && ((block.type === 'trigger' && triggerNode) || (block.type !== 'trigger' && dropButton))) {
        event.preventDefault();
        clearScratchDragState();
        addWorkflowBlock(blockId, dropButton);
      } else {
        clearScratchDragState();
        showAutomationToast(block && block.type === 'trigger' ? 'Drop a start event onto the current trigger.' : 'Drop this block on a highlighted insertion point.');
      }
      return;
    }
    if (!scratchDraggedNode) return;
    const dropButton = event.target.closest('.aut-add[data-aut-add^="scratch"]');
    if (!dropButton) {
      clearScratchDragState();
      return;
    }
    event.preventDefault();
    const nodeName = scratchDraggedNode;
    const valid = canDropScratchNode(nodeName, dropButton);
    clearScratchDragState();
    if (valid) moveScratchNodeToDrop(nodeName, dropButton);
    else showAutomationToast('Drop this step on a valid insertion point. Rules stay on the main path.');
  });

  automationView.addEventListener('dragend', clearScratchDragState);

  automationView.addEventListener('click', function (event) {
    if (event.target.closest('[data-aut-resolve-company-overlap]')) {
      resolveCompanyScopeConflict();
      return;
    }
    const pipelineOpen = event.target.closest('[data-aut-pipeline-open]');
    if (pipelineOpen) {
      const pipelineId = pipelineOpen.dataset.autPipelineOpen;
      const pipeline = automationPipelines().find(function (item) { return item.id === pipelineId; });
      openAutomationPipelineWorkspace(pipeline);
      return;
    }
    const groupFilter = event.target.closest('[data-aut-group-filter]');
    if (groupFilter) {
      activeGroupFilter = groupFilter.dataset.autGroupFilter;
      renderAutomationGroupRows();
      return;
    }
    const groupToggle = event.target.closest('[data-aut-group-toggle]');
    if (groupToggle) {
      const key = groupToggle.dataset.autGroupToggle;
      if (automationGroupDefinitions[key].status !== 'active' && automationGroupStateCounts(automationGroupDefinitions[key]).draft > 0) {
        showAutomationToast('Complete the remaining setup item before this Inactive Automation can be turned on.');
        return;
      }
      openAutomationGroupPreview(automationGroupDefinitions[key].status === 'active' ? null : key, automationGroupDefinitions[key].status === 'active' ? 'deactivate' : 'activate');
      return;
    }
    const groupPreview = event.target.closest('[data-aut-group-preview]');
    if (groupPreview) {
      const key = groupPreview.dataset.autGroupPreview;
      openAutomationGroupInspect(key);
      return;
    }
    const groupOpen = event.target.closest('[data-aut-group-open]');
    if (groupOpen) {
      showAutomationPipelineDetail(groupOpen.dataset.autGroupOpen);
      showAutomationToast('Pipeline Map opened. Select an Automation to preview it, or use its status control to review an On / Off comparison.');
      return;
    }
    const groupView = event.target.closest('[data-aut-group-view]');
    if (groupView) {
      setAutomationGroupView(groupView.dataset.autGroupView);
      return;
    }
    const listWorkflowPreview = event.target.closest('[data-aut-list-workflow-preview]');
    if (listWorkflowPreview) {
      if (openDynamicAutomationPreview) openDynamicAutomationPreview(listWorkflowPreview.dataset.autListWorkflowPreview);
      return;
    }
    const listConcept = event.target.closest('[data-aut-list-concept]');
    if (listConcept) {
      const mapConcept = document.querySelector('#autSemanticMap [data-aut-map-concept="' + listConcept.dataset.autListConcept + '"]');
      if (mapConcept) mapConcept.click();
      return;
    }
    if (event.target.closest('#autCreateAutomationGroup')) {
      const pipeline = automationGroupPipeline();
      if (pipeline && pipeline.id !== 'sales-pipeline') {
        selectedAutomationGroupKey = ensurePipelineAutomationGroup(pipeline);
        openSelectedPipelineAutomationCreator();
        return;
      }
      selectedAutomationGroupKey = activeAutomationGroupKey || selectedAutomationGroupKey || 'standard';
      selectedAutomationStage = null;
      selectedAutomationStageContext = null;
      automationStageLocked = false;
      selectedTemplatePipelineId = 'sales-pipeline';
      creatorStartMode = 'templates';
      openTemplatePicker('home');
      return;
    }
    const conceptCard = event.target.closest('[data-aut-concept]');
    if (conceptCard) {
      renderConceptAutomation(conceptCard.dataset.autConcept);
      return;
    }
    if (event.target.closest('#autConceptEditButton')) {
      createConceptWorkflowDraft();
      return;
    }
    const stageFilter = event.target.closest('[data-aut-stage-filter]');
    if (stageFilter) {
      const stageConcept = stageFilter.dataset.autStageFilter === 'sent' ? 'sent-follow-up' : (stageFilter.dataset.autStageFilter === 'qualified' ? 'first-action' : null);
      if (stageConcept) renderConceptAutomation(stageConcept);
      conceptPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      if (!stageConcept) showAutomationToast('This stage can contain several independent Automations. Use Create automation to add one.');
      return;
    }
    if (event.target.closest('#autCreatePipeline')) {
      showAutomationToast('Pipeline creation belongs to CRM Pipeline settings. This Phase 1 preview keeps the Quotation lifecycle protected.');
      return;
    }
    if (event.target.closest('#autPipelineCreateAutomation')) {
      openSelectedPipelineAutomationCreator();
      return;
    }
    const connectionClose = event.target.closest('[data-aut-connect-close]');
    if (connectionClose) {
      closeScratchConnectionMenu();
      return;
    }
    const connectionBranch = event.target.closest('[data-aut-connect-branch]');
    if (connectionBranch && scratchConnectionMenuState) {
      scratchConnectionMenuState.branch = connectionBranch.dataset.autConnectBranch;
      renderScratchConnectionMenu();
      return;
    }
    const connectionExisting = event.target.closest('[data-aut-connect-existing]');
    if (connectionExisting && scratchConnectionMenuState) {
      const state = Object.assign({}, scratchConnectionMenuState);
      closeScratchConnectionMenu();
      scratchConnectExisting(state.sourceName, state.targetName, state.branch);
      return;
    }
    const connectionBlock = event.target.closest('[data-aut-connect-block]');
    if (connectionBlock && scratchConnectionMenuState) {
      const state = Object.assign({}, scratchConnectionMenuState);
      closeScratchConnectionMenu();
      addScratchConnectedBlock(connectionBlock.dataset.autConnectBlock, state.sourceName, state.branch);
      return;
    }
    if (!event.target.closest('.aut-connect-create-menu') && !event.target.closest('[data-aut-connection-port]')) closeScratchConnectionMenu();
    if (event.target.closest('[data-aut-connection-port]')) return;
    if (suppressScratchClick && event.target.closest('[data-aut-step-wrap]')) {
      suppressScratchClick = false;
      return;
    }
    if (!event.target.closest('#autStepMenu') && !event.target.closest('[data-aut-add]')) closeStepMenu();
    const libraryTab = event.target.closest('[data-aut-library-tab]');
    if (libraryTab) {
      activeLibraryTab = libraryTab.dataset.autLibraryTab;
      renderBlockLibrary();
      return;
    }
    const libraryGroup = event.target.closest('[data-aut-library-group]');
    if (libraryGroup) {
      libraryGroup.closest('.aut-library-group').classList.toggle('collapsed');
      return;
    }
    const libraryBlock = event.target.closest('[data-aut-block-id]');
    if (libraryBlock) {
      if (suppressLibraryClick) {
        suppressLibraryClick = false;
        return;
      }
      addWorkflowBlock(libraryBlock.dataset.autBlockId, null);
      return;
    }
    const recommendedTemplate = event.target.closest('[data-aut-list-template]');
    if (recommendedTemplate) {
      templateOverlay.hidden = false;
      previewTemplate(recommendedTemplate.dataset.autListTemplate);
      return;
    }
    if (event.target.closest('#autOpenProposalSetup') || event.target.closest('#autEditProposalSetup')) {
      templateOverlay.hidden = false;
      renderProposalSetup(activeConfig());
      return;
    }

    if (event.target.closest('#autRenameWorkflow')) {
      const config = activeConfig();
      if (!config || config.protected) return;
      const nextTitle = window.prompt('Automation name', config.title);
      if (nextTitle && nextTitle.trim()) {
        beginEditableDraftVersion(config);
        config.title = nextTitle.trim();
        persistAutomationState();
        updateCanvas();
        recordPendingDraftChange('Renamed Automation to “' + config.title + '”');
        updateAutomationPageContext('builder');
        showAutomationToast('Automation renamed.');
      }
      return;
    }

    const nodeAction = event.target.closest('[data-aut-node-action]');
    if (nodeAction) {
      editDraftNode(nodeAction.dataset.autNodeAction, nodeAction.dataset.autTarget);
      return;
    }

    const node = event.target.closest('[data-aut-node]');
    if (node) {
      stopSelectedRun(false);
      renderInspector(hasEditableStepModel(activeConfig()) ? scratchNodeNameFromElement(activeConfig(), node) : node.dataset.autNode);
      return;
    }

    const add = event.target.closest('[data-aut-add]');
    if (add) {
      stopSelectedRun(false);
      if (hasEditableStepModel(activeConfig())) {
        scratchInsertIndex = Number(add.dataset.autInsert || activeConfig().steps.length);
        scratchInsertBranch = add.dataset.autBranch || 'main';
        scratchConditionIndex = add.dataset.autCondition === undefined ? -1 : Number(add.dataset.autCondition);
        scratchInsertContainer = add.dataset.autContainer || 'r';
      }
      openStepMenu(add);
      return;
    }

    const stepChoice = event.target.closest('[data-aut-step-choice]');
    if (stepChoice) {
      const type = stepChoice.dataset.autStepChoice;
      const insertAt = Number(stepMenu.dataset.insert || (activeConfig() && activeConfig().steps ? activeConfig().steps.length : 0));
      closeStepMenu();
      if (hasEditableStepModel(activeConfig())) {
        scratchInsertIndex = insertAt;
        scratchInsertBranch = stepMenu.dataset.branch || scratchInsertBranch;
        scratchConditionIndex = stepMenu.dataset.condition === '' ? scratchConditionIndex : Number(stepMenu.dataset.condition);
        scratchInsertContainer = stepMenu.dataset.container || scratchInsertContainer || 'r';
        if (type === 'end') showAutomationToast('This branch already ends safely after its final step.');
        else if (type === 'action') showActionPalette(stepMenu.dataset.position || 'branch');
        else addScratchStep(type, scratchInsertBranch, scratchConditionIndex, '', scratchInsertContainer);
      } else if (type === 'end') {
        showAutomationToast('This template already has a safe End on each branch.');
      } else {
        renderInspector(type);
        showAutomationToast('This safe template already includes that step. Edit its settings on the right.');
      }
      return;
    }

    const palette = event.target.closest('[data-aut-palette]');
    if (palette) {
      stopSelectedRun(false);
      if (hasEditableStepModel(activeConfig())) addScratchStep('action', scratchInsertBranch, scratchConditionIndex, palette.dataset.autPalette, scratchInsertContainer);
      else renderInspector(palette.dataset.autPalette);
    }

    const workflow = event.target.closest('[data-aut-workflow]');
    if (workflow && workflows[workflow.dataset.autWorkflow]) {
      stopSelectedRun(false);
      activeWorkflowKey = workflow.dataset.autWorkflow;
      activeNode = hasEditableStepModel(activeConfig()) ? 'scratch-trigger' : (isProposalApproval(activeConfig()) ? 'proposal-technical-review' : 'trigger');
      showActiveAutomation();
      updateCanvas();
      renderInspector(activeNode);
      resetJourney();
    }

    const simulate = event.target.closest('[data-aut-simulate]');
    if (simulate) simulateWorkflow(simulate.dataset.autSimulate === 'true');

    if (event.target.closest('[data-aut-test-again]')) testWorkflow();

    if (event.target.closest('[data-aut-back]')) renderInspector(hasEditableStepModel(activeConfig()) ? 'scratch-trigger' : (isProposalApproval(activeConfig()) ? 'proposal-technical-review' : 'trigger'));

    const removeScratch = event.target.closest('[data-aut-remove-scratch]');
    if (removeScratch && hasEditableStepModel(activeConfig())) {
      beginEditableDraftVersion(activeConfig());
      activeConfig().steps.splice(Number(removeScratch.dataset.autRemoveScratch), 1);
      persistAutomationState();
      activeNode = 'scratch-trigger';
      updateCanvas();
      renderInspector('scratch-trigger');
      recordPendingDraftChange('Removed workflow step');
      showAutomationToast('Custom step removed.');
    }

    const removeNo = event.target.closest('[data-aut-remove-no]');
    if (removeNo && hasEditableStepModel(activeConfig())) {
      beginEditableDraftVersion(activeConfig());
      const parts = removeNo.dataset.autRemoveNo.split(':').map(Number);
      const condition = activeConfig().steps[parts[0]];
      if (condition && Array.isArray(condition.noSteps)) condition.noSteps.splice(parts[1], 1);
      persistAutomationState();
      activeNode = 'scratch-' + parts[0];
      updateCanvas();
      renderInspector(activeNode);
      recordPendingDraftChange('Removed NO branch step');
      showAutomationToast('NO branch step removed.');
    }

    const removePath = event.target.closest('[data-aut-remove-path]');
    if (removePath && hasEditableStepModel(activeConfig())) {
      const config = activeConfig();
      beginEditableDraftVersion(config);
      const reference = scratchStepReference(config, 'scratch-path:' + removePath.dataset.autRemovePath);
      if (reference.list && reference.step) reference.list.splice(reference.index, 1);
      persistAutomationState();
      activeNode = 'scratch-trigger';
      updateCanvas();
      renderInspector(activeNode);
      recordPendingDraftChange('Removed workflow branch step');
      showAutomationToast('Step removed from this branch.');
    }
  });

  automationView.addEventListener('input', function (event) {
    if (event.target.closest('#autInspector') && !event.target.disabled) setAutomationSaveStatus(false);
  });

  automationView.addEventListener('change', function (event) {
    if (event.target.id === 'autActionCompletion' || event.target.id === 'autScratchCompletion') {
      const target = inspectorBody.querySelector('[data-aut-completion-target]');
      if (target) target.hidden = event.target.value !== 'required';
      setAutomationSaveStatus(false);
      return;
    }
    if (event.target.id === 'autScratchFileSource' && hasEditableStepModel(activeConfig())) {
      const config = activeConfig();
      const reference = scratchStepReference(config, activeNode);
      const step = reference.step;
      if (!step || !isAutomaticFileAction(step.action)) return;
      beginEditableDraftVersion(config);
      step.fileSource = event.target.value;
      step.fileSelection = (fileAttachmentChoices(step.fileSource)[0] || {}).id || '';
      persistAutomationState();
      updateCanvas();
      renderInspector(activeNode);
      recordPendingDraftChange('Changed attached file source');
      return;
    }
    if (event.target.id === 'autScratchFileUpload' && event.target.files && event.target.files[0] && hasEditableStepModel(activeConfig())) {
      const config = activeConfig();
      const reference = scratchStepReference(config, activeNode);
      const step = reference.step;
      if (!step || !isAutomaticFileAction(step.action)) return;
      beginEditableDraftVersion(config);
      step.fileSource = 'upload';
      step.fileUploadedName = event.target.files[0].name;
      persistAutomationState();
      updateCanvas();
      renderInspector(activeNode);
      recordPendingDraftChange('Uploaded Automation file: ' + step.fileUploadedName);
      showAutomationToast('File added to this Automation draft.');
      return;
    }
    if (event.target.id === 'autScratchAction' && hasEditableStepModel(activeConfig())) {
      const config = activeConfig();
      const reference = scratchStepReference(config, activeNode);
      const step = reference.step;
      if (!step || step.type !== 'action') return;
      beginEditableDraftVersion(config);
      step.action = event.target.value;
      applyScratchActionDefaults(step, config);
      if (step.action === 'Return to earlier step') {
        const targetIndex = Math.max(0, reference.index - 1);
        const targetStep = reference.list && reference.list[targetIndex];
        step.target = targetStep ? 'Step ' + (targetIndex + 2) + ' · ' + scratchStepText(targetStep).title : 'Previous step';
        step.detail = 'Return to ' + (targetStep ? scratchStepText(targetStep).title : 'previous step');
      } else {
        delete step.target;
        delete step.detail;
        if (!step.owner) step.owner = config.objectType === 'Lead' ? 'Lead owner' : 'Deal owner';
        if (step.action === 'Create Note') {
          step.noteTitle = step.noteTitle || step.taskTitle || 'Follow-up note';
          step.noteBody = step.noteBody || 'Add the information the owner needs to follow up.';
          step.mention = step.mention || step.owner;
          step.followUpDelay = step.followUpDelay || '1-working-day';
          step.followUpTime = step.followUpTime || '17:00';
          delete step.taskTitle;
        }
        if (step.action === 'Schedule Meeting' || step.action === 'Schedule Meeting / Site Visit') {
          step.meetingTitle = step.meetingTitle || 'Customer meeting';
          step.meetingAttendee = step.meetingAttendee || step.owner;
          step.meetingWhen = step.meetingWhen || 'Next working day';
          step.meetingTime = step.meetingTime || '10:00';
          step.meetingDuration = step.meetingDuration || 60;
        }
      }
      persistAutomationState();
      updateCanvas();
      renderInspector(activeNode);
      recordPendingDraftChange('Changed action type to “' + step.action + '”');
      return;
    }
    if (event.target.id !== 'autTriggerPipeline' || !isWonHandoff(activeConfig())) return;
    const pipeline = automationPipelines().find(function (item) { return item.id === event.target.value; }) || automationPipelines()[0];
    const stages = automationPipelineStages(pipeline);
    const wonStage = stages.find(function (stage) { return stage.outcome === 'won'; }) || stages.find(function (stage) { return stage.name === 'Won'; }) || stages[stages.length - 1];
    const fromSelect = document.getElementById('autTriggerFromStage');
    const toSelect = document.getElementById('autTriggerToStage');
    if (fromSelect) fromSelect.innerHTML = automationStageOptionsForPipeline(pipeline, 'Any stage', true);
    if (toSelect) toSelect.innerHTML = automationStageOptionsForPipeline(pipeline, wonStage ? wonStage.name : 'Won', false);
    const strip = inspectorBody.querySelector('.aut-pipeline-strip');
    if (strip) strip.outerHTML = automationPipelineStripMarkup(pipeline, wonStage ? wonStage.name : 'Won');
    const noteName = inspectorBody.querySelector('.aut-info-note strong');
    if (noteName) noteName.textContent = pipeline.name;
    setAutomationSaveStatus(false);
  });

  function prepareAutomationTestDraft() {
    const config = activeConfig();
    if (!config || config.protected) return false;
    if (automationHasUnsavedChanges()) saveAutomationDraft();
    config.testDraftSnapshot = automationVersionSnapshot(config);
    config.testInProgress = true;
    persistAutomationState();
    syncAutomationDraftUi();
    return true;
  }

  function markAutomationTestPassed() {
    const config = activeConfig();
    if (!config || !config.testInProgress) return;
    config.testInProgress = false;
    config.needsTesting = false;
    config.lastTestedAt = 'Just now';
    persistAutomationState();
    syncAutomationDraftUi();
    workflowMeta.textContent = (config.enabled ? 'Active' : 'Inactive') + ' · Test passed · Just now';
    showAutomationToast('Test passed · Just now. No live CRM data was changed.');
  }

  function runAutomationTestSimulator() {
    if (!prepareAutomationTestDraft()) return;
    openPipelineJourneyPreview();
    showAutomationToast('Safe Test Draft snapshot saved. Use Play or Step to complete the Timeline.');
  }

  document.getElementById('autSaveStep').addEventListener('click', saveSelectedStep);
  if (saveDraftButton) saveDraftButton.addEventListener('click', saveAutomationDraft);
  if (cancelDraftButton) cancelDraftButton.addEventListener('click', cancelAutomationDraft);
  if (exitEditorButton) exitEditorButton.addEventListener('click', exitAutomationEditor);
  if (editorUndoButton) editorUndoButton.addEventListener('click', undoEditorChanges);
  if (editorRedoButton) editorRedoButton.addEventListener('click', redoEditorChanges);
  if (topbarContext) topbarContext.addEventListener('click', function (event) {
    if (!event.target.closest('[data-aut-topbar-back]')) return;
    showAutomationGroupList();
  });
  if (topbarActions) topbarActions.addEventListener('click', function (event) {
    const groupView = event.target.closest('[data-aut-group-view]');
    if (groupView) {
      setAutomationGroupView(groupView.dataset.autGroupView);
      return;
    }
    if (event.target.closest('#autPipelineCreateAutomation')) {
      openSelectedPipelineAutomationCreator();
    }
  });
  const pipelineZeroCreateButton = document.getElementById('autPipelineZeroCreate');
  if (pipelineZeroCreateButton) pipelineZeroCreateButton.addEventListener('click', openSelectedPipelineAutomationCreator);
  const groupEmptyCreateButton = document.getElementById('autGroupEmptyCreate');
  if (groupEmptyCreateButton) groupEmptyCreateButton.addEventListener('click', openSelectedPipelineAutomationCreator);
  if (openHistoryButton) openHistoryButton.addEventListener('click', openAutomationHistory);
  if (historyCloseButton) historyCloseButton.addEventListener('click', closeAutomationHistory);
  if (historyOverlay) historyOverlay.addEventListener('click', function (event) {
    if (event.target === event.currentTarget) closeAutomationHistory();
  });
  if (publishCloseButton) publishCloseButton.addEventListener('click', closePublishAutomationDialog);
  if (publishCancelButton) publishCancelButton.addEventListener('click', closePublishAutomationDialog);
  if (publishConfirmButton) publishConfirmButton.addEventListener('click', confirmAutomationPublish);
  if (publishOverlay) publishOverlay.addEventListener('click', function (event) {
    if (event.target === event.currentTarget) closePublishAutomationDialog();
  });
  if (exitCloseButton) exitCloseButton.addEventListener('click', closeExitAutomationDialog);
  if (exitContinueButton) exitContinueButton.addEventListener('click', closeExitAutomationDialog);
  if (exitDiscardButton) exitDiscardButton.addEventListener('click', discardAutomationChangesAndExit);
  if (exitSaveButton) exitSaveButton.addEventListener('click', saveAutomationDraftAndExit);
  if (exitOverlay) exitOverlay.addEventListener('click', function (event) {
    if (event.target === event.currentTarget) closeExitAutomationDialog();
  });
  backToListButton.addEventListener('click', exitAutomationEditor);
  if (closeInspectorButton) closeInspectorButton.addEventListener('click', showAutomationBlockLibraryPane);
  document.getElementById('autCancelStep').addEventListener('click', function () { renderInspector(activeNode === 'test' || activeNode === 'palette' ? (hasEditableStepModel(activeConfig()) ? 'scratch-trigger' : 'trigger') : activeNode); });
  selectedPlayButton.addEventListener('click', openPipelineJourneyPreview);
  document.getElementById('autTestWorkflow').addEventListener('click', runAutomationTestSimulator);
  document.getElementById('autNewWorkflow').addEventListener('click', function () {
    showAutomationPipelineHub();
    showAutomationToast('Choose the Pipeline where you want to create or manage Automation.');
  });
  document.getElementById('autPipelineBack').addEventListener('click', function () {
    showAutomationGroupList();
  });
  document.getElementById('autGroupBackToPipelines').addEventListener('click', showAutomationPipelineHub);
  document.getElementById('autGroupSearch').addEventListener('input', renderAutomationGroupRows);
  document.getElementById('autGroupPreviewClose').addEventListener('click', closeAutomationGroupPreview);
  document.getElementById('autGroupPreviewCancel').addEventListener('click', closeAutomationGroupPreview);
  document.getElementById('autGroupPreviewConfirm').addEventListener('click', applyAutomationGroupPreview);
  document.getElementById('autGroupPreviewTest').addEventListener('click', function () {
    showAutomationToast('Sample Deal passed the preview. Protected transitions are unchanged and the new Group is ready for activation.');
  });
  document.getElementById('autGroupPreviewOverlay').addEventListener('click', function (event) { if (event.target === event.currentTarget) closeAutomationGroupPreview(); });
  document.getElementById('autGroupInspectClose').addEventListener('click', closeAutomationGroupInspect);
  document.getElementById('autGroupInspectCancel').addEventListener('click', closeAutomationGroupInspect);
  document.getElementById('autGroupInspectToggle').addEventListener('click', previewInspectedAutomationStatusChange);
  document.getElementById('autGroupInspectZoomOut').addEventListener('click', function () { stepAutomationGroupInspectZoom(-1); });
  document.getElementById('autGroupInspectZoomIn').addEventListener('click', function () { stepAutomationGroupInspectZoom(1); });
  document.querySelectorAll('[data-aut-inspect-preset]').forEach(function (button) {
    button.addEventListener('click', function () { setAutomationGroupInspectZoom(Number(button.dataset.autInspectPreset)); });
  });
  document.getElementById('autGroupInspectMap').addEventListener('wheel', function (event) {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    setAutomationGroupInspectZoom(automationGroupInspectZoom - event.deltaY * 0.08);
  }, { passive: false });
  document.getElementById('autGroupInspectEdit').addEventListener('click', function () {
    const key = inspectedAutomationGroupKey;
    closeAutomationGroupInspect();
    showAutomationPipelineDetail(key);
    setAutomationGroupEditMode(true);
    showAutomationToast(automationGroupDefinitions[key].status === 'active' ? 'Unpublished changes. The Active Automation continues running until these changes are reviewed and turned on.' : 'Editing enabled. Changes remain unpublished until saved and turned on.');
  });
  document.getElementById('autGroupInspectActivate').addEventListener('click', previewInspectedAutomationStatusChange);
  document.getElementById('autGroupInspectOverlay').addEventListener('click', function (event) { if (event.target === event.currentTarget) closeAutomationGroupInspect(); });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    if (publishOverlay && !publishOverlay.hidden) closePublishAutomationDialog();
    else if (exitOverlay && !exitOverlay.hidden) closeExitAutomationDialog();
    else if (historyOverlay && !historyOverlay.hidden) closeAutomationHistory();
    else if (!document.getElementById('autGroupInspectOverlay').hidden) closeAutomationGroupInspect();
    else if (!document.getElementById('autGroupPreviewOverlay').hidden) closeAutomationGroupPreview();
  });
  document.getElementById('autEmptyNewWorkflow').addEventListener('click', function () {
    openSelectedPipelineAutomationCreator();
  });
  document.getElementById('autBuilderBrowse').addEventListener('click', function () {
    const config = activeConfig();
    if (config && !config.protected) {
      selectedAutomationStage = workflowStageName(config);
      automationStageLocked = true;
      normalizeAutomationCompanyScope(config);
      selectedCompanyScopeMode = config.companyScopeMode;
      selectedCompanyScopeIds = config.companyScopeIds.slice();
      openTemplatePicker('templates');
    } else {
      selectedAutomationStage = null;
      automationStageLocked = false;
      selectedCompanyScopeMode = 'all';
      selectedCompanyScopeIds = [];
      openSelectedPipelineAutomationCreator();
    }
  });
  document.getElementById('autTemplateClose').addEventListener('click', closeTemplatePicker);
  templateOverlay.addEventListener('click', function (event) {
    if (event.target.closest('[data-aut-company-scope]')) {
      setCreatorScreen('company-scope');
      return;
    }
    if (event.target.closest('#autApplyCompanyScope')) {
      const modeField = companyScopeBody.querySelector('input[name="autCompanyScopeMode"]:checked');
      const mode = modeField ? modeField.value : 'all';
      const ids = Array.from(companyScopeBody.querySelectorAll('input[name="autCompanyScopeCompany"]:checked')).map(function (input) { return input.value; });
      const validation = document.getElementById('autCompanyScopeValidation');
      if (mode === 'selected' && !ids.length) {
        if (validation) validation.textContent = 'Choose at least one Company.';
        showAutomationToast('Choose at least one Secondary Company.');
        return;
      }
      selectedCompanyScopeMode = mode;
      selectedCompanyScopeIds = mode === 'selected' ? ids : [];
      setCreatorScreen('templates');
      if (selectedAutomationStage) scrollCreatorTemplatesToStage(selectedAutomationStage, false);
      showAutomationToast('Owning Company scope set to ' + automationCompanyScopeLabel({ companyScopeMode: selectedCompanyScopeMode, companyScopeIds: selectedCompanyScopeIds }) + '.' + (selectedAutomationStage ? '' : ' Now choose the Pipeline Stage.'));
      return;
    }
    const stageChoice = event.target.closest('[data-aut-template-stage]');
    if (stageChoice) {
      selectedAutomationStage = stageChoice.dataset.autTemplateStage;
      automationStageLocked = false;
      scratchTriggerChoice = null;
      filterCreatorTemplatesForStage();
      renderCreatorTriggerChoices();
      const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
      const scratchOnly = creatorStartMode === 'scratch' || !automationPipelineUsesQuoteLifecycle(pipeline);
      if (scratchOnly) setCreatorScreen('triggers');
      else {
        setCreatorScreen('templates');
        scrollCreatorTemplatesToStage(selectedAutomationStage, true);
      }
      return;
    }
    if (event.target.closest('[data-aut-change-stage]')) {
      selectedAutomationStage = null;
      automationStageLocked = false;
      scratchTriggerChoice = null;
      setCreatorScreen('templates');
      return;
    }
    if (event.target.closest('#autCloseProposalSetup')) {
      templateOverlay.hidden = true;
      showAutomationZeroState();
      showAutomationToast('Inactive Automation saved. Finish setup from Your automations when you are ready.');
      return;
    }
    if (event.target.closest('#autSaveProposalSetup')) {
      saveProposalSetup();
      return;
    }
    if (event.target.closest('[data-aut-template-cancel]')) {
      closeTemplatePicker();
      return;
    }
    const creatorChoice = event.target.closest('[data-aut-creator]');
    if (creatorChoice) {
      const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
      const quoteConnected = automationPipelineUsesQuoteLifecycle(pipeline);
      const choice = creatorChoice.dataset.autCreator;
      creatorStartMode = choice === 'templates' && quoteConnected ? 'templates' : 'scratch';
      if (selectedAutomationStage) setCreatorScreen(creatorStartMode === 'templates' ? 'templates' : 'triggers');
      else setCreatorScreen('templates');
      return;
    }
    const creatorBack = event.target.closest('[data-aut-creator-back]');
    if (creatorBack) {
      setCreatorScreen(creatorBack.dataset.autCreatorBack);
      if (creatorBack.dataset.autCreatorBack === 'templates' && selectedAutomationStage) {
        scrollCreatorTemplatesToStage(selectedAutomationStage, false);
      }
      return;
    }
    const triggerChoice = event.target.closest('[data-aut-trigger-choice]');
    if (triggerChoice) {
      configureScratchTrigger(triggerChoice.dataset.autTriggerChoice);
      return;
    }
    if (event.target.closest('#autApplyScratchTrigger')) {
      createScratchWorkflow();
      return;
    }
    if (event.target.closest('#autUseTemplate')) {
      createWorkflowFromTemplate(selectedTemplateKey);
      return;
    }
    const template = event.target.closest('[data-aut-template]');
    if (template) {
      const pipeline = automationPipelineById(selectedTemplatePipelineId) || automationPipelines()[0];
      if (!automationPipelineUsesQuoteLifecycle(pipeline)) {
        creatorStartMode = 'scratch';
        setCreatorScreen(selectedAutomationStage ? 'triggers' : 'templates');
        showAutomationToast('This Pipeline has no Quote lifecycle templates. Start from scratch instead.');
        return;
      }
      if (template.dataset.autTemplate === 'client-proposal-approval') {
        templateOverlay.hidden = true;
        selectedConceptAutomation = 'first-action';
        showAutomationPipelineDetail();
        showAutomationToast('Review the Qualified pre-Quote flow, then create its editable Automation.');
        return;
      }
      previewTemplate(template.dataset.autTemplate);
      return;
    }
    if (event.target === templateOverlay) closeTemplatePicker();
  });
  templateOverlay.addEventListener('change', function (event) {
    if (event.target.name === 'autCompanyScopeMode') {
      const selectedMode = event.target.value;
      companyScopeBody.querySelectorAll('.aut-company-scope-option').forEach(function (option) { option.classList.toggle('selected', option.contains(event.target)); });
      const list = companyScopeBody.querySelector('.aut-company-scope-list');
      if (list) list.classList.toggle('disabled', selectedMode === 'all');
      companyScopeBody.querySelectorAll('input[name="autCompanyScopeCompany"]').forEach(function (input) { input.disabled = selectedMode === 'all'; });
      return;
    }
    if (event.target.name === 'autCompanyScopeCompany') {
      const option = event.target.closest('.aut-company-scope-company');
      if (option) option.classList.toggle('selected', event.target.checked);
      return;
    }
    if (event.target.id === 'autTemplatePipeline') {
      selectedTemplatePipelineId = event.target.value;
      previewTemplate(selectedTemplateKey);
      const picker = document.getElementById('autTemplatePipeline');
      if (picker) picker.focus();
      return;
    }
    if (event.target.id === 'autProposalPipeline' && isProposalApproval(activeConfig())) {
      const pipeline = automationPipelines().find(function (item) { return item.id === event.target.value; }) || automationPipelines()[0];
      activeConfig().triggerPipelineId = pipeline.id;
      activeConfig().stageMap = proposalStageMapForPipeline(pipeline);
      renderProposalSetup(activeConfig());
      return;
    }
    if (event.target.id !== 'autScratchPipeline') return;
    const stageSelect = document.getElementById('autScratchStage');
    if (stageSelect) stageSelect.innerHTML = ['Qualified', 'In Progress', 'In Review', 'Passed Review', 'Sent', 'Won', 'Lost'].map(function (stage) { return '<option>' + escapeAutomationHtml(stage) + '</option>'; }).join('');
  });
  document.getElementById('autRunDemo').addEventListener('click', openGuidedDemo);
  if (journeyViewTimeline) journeyViewTimeline.addEventListener('click', function () { setJourneyView('timeline'); });
  if (journeyViewImpact) journeyViewImpact.addEventListener('click', function () { setJourneyView('impact'); });
  journeyToggle.addEventListener('click', playJourney);
  journeyStepForward.addEventListener('click', stepJourney);
  journeySpeed.addEventListener('change', function () {
    if (journeyRunning) scheduleJourneyTimer();
  });
  journeySkipWait.addEventListener('click', skipJourneyWait);
  document.getElementById('autJourneyReset').addEventListener('click', resetJourney);
  journeyClose.addEventListener('click', closePipelineJourneyPreview);
  journeyOverlay.addEventListener('click', function (event) {
    if (event.target.closest('[data-aut-open-timeline]')) {
      setJourneyView('timeline');
      journeyToggle.focus();
      return;
    }
    if (event.target === journeyOverlay) closePipelineJourneyPreview();
  });
  document.getElementById('autDemoClose').addEventListener('click', function () { closeGuidedDemo(false); });
  demoBack.addEventListener('click', function () {
    if (demoStepIndex > 0) {
      demoStepIndex -= 1;
      renderGuidedDemo();
    }
  });
  demoNext.addEventListener('click', function () {
    if (demoStepIndex < demoStepCount - 1) {
      demoStepIndex += 1;
      renderGuidedDemo();
      return;
    }
    closeGuidedDemo(true);
  });
  demoOverlay.addEventListener('click', function (event) {
    if (event.target === demoOverlay) closeGuidedDemo(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !journeyOverlay.hidden) closePipelineJourneyPreview();
    if (event.key === 'Escape' && !demoOverlay.hidden) closeGuidedDemo(false);
    if (event.key === 'Escape' && !templateOverlay.hidden) closeTemplatePicker();
    if (event.key === 'Escape' && !stepMenu.hidden) closeStepMenu();
  });
  window.addEventListener('resize', function () {
    setAutomationLibraryWidth(currentAutomationLibraryWidth(), false);
    if (hasEditableStepModel(activeConfig())) scheduleScratchConnectorDraw(activeConfig());
    if (!document.getElementById('autGroupPreviewOverlay').hidden) {
      syncAutomationSwitchMinimap('before');
      syncAutomationSwitchMinimap('after');
    }
  });
  if (blockSearch) {
    blockSearch.addEventListener('input', renderBlockLibrary);
    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || blockLibrary.hidden || /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) return;
      event.preventDefault();
      blockSearch.focus();
    });
  }
  publishButton.addEventListener('click', function () {
    const config = activeConfig();
    if (!config) return;
    if (config.protected) return;
    if (automationHasUnsavedChanges()) {
      showAutomationToast('Save the Draft before testing or publishing these changes.');
      if (saveDraftButton) saveDraftButton.focus();
      return;
    }
    const moveStageBlocker = workflowMoveStageBlocker(config);
    if (moveStageBlocker) {
      showAutomationToast(moveStageBlocker + ' Review the Move Deal step before testing or publishing.');
      return;
    }
    if (workflowNeedsSetup(config)) {
      showAutomationToast('Needs setup. Add at least one Stage-compatible action or finish the required setup before turning this on.');
      return;
    }
    if (isProposalApproval(config) && !config.setupComplete) {
      templateOverlay.hidden = false;
      renderProposalSetup(config);
      showAutomationToast('Complete stage and people setup before turning this on.');
      return;
    }
    const conflicts = automationCompanyScopeConflicts(config);
    if (conflicts.length) {
      renderCompanyScopeConflict(config, conflicts);
      showAutomationToast('Publish blocked: this Owning Company scope overlaps an Active Automation with the same outcome.');
      return;
    }
    if (automationHasDraftChanges(config)) {
      openPublishAutomationDialog();
      return;
    }
    config.enabled = !config.enabled;
    if (config.enabled) config.lastPublishedAt = 'Just now';
    persistAutomationState();
    syncWorkflowWithPipelineMap(config);
    updateCanvas();
    resetJourney();
    if (config.enabled && isInactiveLeadWorkflow(config)) runInactiveLeadScan();
    showAutomationToast(config.enabled
      ? 'Automation turned on and shown in ' + workflowStageName(config) + ' on the Sales Pipeline map.'
      : 'Automation turned off. New CRM events will skip it.');
  });

initializeAutomationLibraryResizer();
initializeAutomationBuilderViewport();
  renderTemplateStageNav();
  restoreAutomationGroupState();
  userWorkflowKeys().forEach(function (workflowKey) {
    repairWorkflowStageAlignment(workflows[workflowKey]);
    if (!workflows[workflowKey].automationGroupKey || !automationGroupDefinitions[workflows[workflowKey].automationGroupKey]) {
      workflows[workflowKey].automationGroupKey = 'standard';
    }
  });
  Object.keys(automationGroupDefinitions).forEach(function (key) {
    const definition = automationGroupDefinitions[key];
    definition.key = key;
    if (definition.custom && !document.querySelector('[data-aut-group-row="' + key + '"]')) {
      appendBlankAutomationGroupRow(key, definition);
    }
    if (definition.custom) {
      const workflowKeys = workflowsForAutomationGroup(key);
      definition.empty = workflowKeys.length === 0;
      definition.automations = workflowKeys.length;
    } else {
      const workflowKeys = workflowsForAutomationGroup(key);
      definition.automations = (definition.baseAutomations || 10) + workflowKeys.length;
      definition.rules = (definition.baseRules || definition.rules || 0) + workflowKeys.reduce(function (total, workflowKey) {
        return total + 2 + (Number(workflows[workflowKey].waitDays) > 0 ? 1 : 0);
      }, 0);
    }
  });
  persistAutomationState();
  persistAutomationGroupState();

  const crmAutomationStatus = document.getElementById('crmAutomationStatus');
  if (crmAutomationStatus) crmAutomationStatus.addEventListener('click', window.openCurrentPipelineAutomations);

  if (window.location.hash === '#automation') window.showView('automation');
  syncCrmAutomationStatus();
  updateWorkflowList();
  renderConceptAutomation('first-action');
  setupSemanticAutomationMap();
  showAutomationPipelineHub();
  window.setTimeout(scanGenericScheduledAutomationEvents, 1000);
  window.setInterval(scanGenericScheduledAutomationEvents, 60000);
})();
