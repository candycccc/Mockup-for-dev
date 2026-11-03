(() => {
  if (window.__variationGroupingParityV4) return;
  window.__variationGroupingParityV4 = true;

  const nodeSelector = '.qt-node.qt-nested';
  const handleSelector = '.qt-var-drag-handle';
  const gripMarkup = '<span class="qt-var-grip-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>';
  let sourceNode = null;
  let groupTarget = null;
  let independentTarget = null;
  let armedNode = null;

  const isVariation = node => {
    if (!node || !node.matches(nodeSelector)) return false;
    if (node.classList.contains('qt-var-bundled')) return false;
    const body = node.querySelector('.qt-body') || node;
    return /\bvariation\b/i.test(body.textContent || '');
  };

  const variationNodes = root => [...root.querySelectorAll(nodeSelector)].filter(isVariation);

  const findSelectionControl = body => body.querySelector([
    'input[type="checkbox"]',
    'button[role="checkbox"]',
    '[role="checkbox"]',
    '.qt-var-select',
    '.qt-selectbox',
    '.qt-checkbox',
    '.qt-check'
  ].join(','));

  const clearGroupDropState = () => {
    document.querySelectorAll('.qt-var-drop-group')
      .forEach(el => el.classList.remove('qt-var-drop-group'));
    groupTarget = null;
  };

  const clearIndependentDropState = () => {
    document.querySelectorAll('.qt-var-drop-independent')
      .forEach(el => el.classList.remove('qt-var-drop-independent'));
    independentTarget = null;
  };

  const clearReorderDropState = () => {
    document.querySelectorAll('.qt-var-drop-before, .qt-var-drop-after')
      .forEach(el => el.classList.remove('qt-var-drop-before', 'qt-var-drop-after'));
  };

  const sameQuote = (source, target) => {
    const sourceRail = source?.closest('.qt-rail[data-quote-index]');
    const targetRail = target?.closest('.qt-rail[data-quote-index]');
    return !!sourceRail && sourceRail === targetRail;
  };

  const dropZone = (event, node) => {
    const rect = node.getBoundingClientRect();
    const ratio = rect.height ? (event.clientY - rect.top) / rect.height : .5;
    if (ratio < .26) return 'before';
    if (ratio > .74) return 'after';
    return 'group';
  };

  const variationAddress = node => {
    const rail = node?.closest('.qt-rail[data-quote-index]');
    const key = node?.dataset.qtKey || '';
    const match = key.match(/^var-(\d+)$/);
    if (!rail || !match) return null;
    return { qi: Number(rail.dataset.quoteIndex), vi: Number(match[1]) };
  };

  const installHandle = node => {
    if (!isVariation(node)) return;
    const body = node.querySelector('.qt-body') || node;
    let handle = node.querySelector(':scope ' + handleSelector);

    if (!handle) {
      handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'qt-var-drag-handle';
      handle.draggable = true;
      handle.innerHTML = gripMarkup;
      const selection = findSelectionControl(body);
      if (selection) selection.insertAdjacentElement('afterend', handle);
      else body.insertBefore(handle, body.firstChild);
      handle.addEventListener('click', event => event.preventDefault());
    }

    handle.draggable = true;
    handle.title = 'Drag to reorder or group variation';
    handle.setAttribute('aria-label', 'Drag to reorder or group variation');
    node.classList.add('qt-variation-sortable');
  };

  const hydrate = root => {
    if (root.nodeType !== 1 && root.nodeType !== 9) return;
    if (root.matches?.(nodeSelector)) installHandle(root);
    variationNodes(root).forEach(installHandle);
  };

  document.addEventListener('pointerdown', event => {
    const handle = event.target.closest?.(handleSelector);
    armedNode = handle?.closest(nodeSelector) || null;
  }, true);

  document.addEventListener('dragstart', event => {
    const handle = event.target.closest?.(handleSelector);
    const eventNode = event.target.closest?.(nodeSelector);
    const node = handle?.closest(nodeSelector) || (eventNode === armedNode ? eventNode : null);
    if (!isVariation(node)) return;
    sourceNode = node;
    clearGroupDropState();
    clearIndependentDropState();
  }, true);

  document.addEventListener('dragover', event => {
    if (!sourceNode) return;
    const target = event.target.closest?.(nodeSelector);
    if (!isVariation(target) || target === sourceNode || !sameQuote(sourceNode, target)) {
      clearGroupDropState();
      clearIndependentDropState();
      return;
    }

    const sourceGroup = sourceNode.closest('.qt-var-alt-group');
    const targetGroup = target.closest('.qt-var-alt-group');
    const moveToIndependent = sourceGroup && !sourceGroup.classList.contains('qt-var-alt-group-resolved') &&
      targetGroup !== sourceGroup;

    if (moveToIndependent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      clearGroupDropState();
      clearReorderDropState();
      if (independentTarget !== target) {
        clearIndependentDropState();
        independentTarget = target;
        target.classList.add('qt-var-drop-independent');
      }
      return;
    }

    clearIndependentDropState();

    if (dropZone(event, target) !== 'group') {
      clearGroupDropState();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    clearReorderDropState();
    if (groupTarget !== target) {
      clearGroupDropState();
      groupTarget = target;
      target.classList.add('qt-var-drop-group');
    }
  }, true);

  document.addEventListener('drop', event => {
    if (!sourceNode) return;
    const target = event.target.closest?.(nodeSelector);
    if (!isVariation(target) || target === sourceNode || !sameQuote(sourceNode, target)) {
      clearGroupDropState();
      clearIndependentDropState();
      return;
    }

    const sourceAddress = variationAddress(sourceNode);
    const targetAddress = variationAddress(target);
    const sourceGroup = sourceNode.closest('.qt-var-alt-group');
    const targetGroup = target.closest('.qt-var-alt-group');
    const moveToIndependent = sourceGroup && !sourceGroup.classList.contains('qt-var-alt-group-resolved') &&
      targetGroup !== sourceGroup;

    if (moveToIndependent) {
      event.preventDefault();
      event.stopImmediatePropagation();
      clearGroupDropState();
      clearIndependentDropState();
      clearReorderDropState();
      sourceNode = null;
      if (!sourceAddress || !targetAddress || sourceAddress.qi !== targetAddress.qi) return;
      window.setTimeout(() => {
        if (typeof qtMakeVariationIndependentFromDrag !== 'function') return;
        qtMakeVariationIndependentFromDrag(sourceAddress.qi, sourceAddress.vi);
      }, 0);
      return;
    }

    if (dropZone(event, target) !== 'group') {
      clearGroupDropState();
      clearIndependentDropState();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    clearGroupDropState();
    clearIndependentDropState();
    clearReorderDropState();
    sourceNode = null;

    if (!sourceAddress || !targetAddress || sourceAddress.qi !== targetAddress.qi) return;
    window.setTimeout(() => {
      if (typeof qtGroupVariationAlternativesFromDrag !== 'function') return;
      qtGroupVariationAlternativesFromDrag(
        sourceAddress.qi,
        sourceAddress.vi,
        targetAddress.qi,
        targetAddress.vi
      );
    }, 0);
  }, true);

  document.addEventListener('dragend', () => {
    sourceNode = null;
    armedNode = null;
    clearGroupDropState();
    clearIndependentDropState();
    clearReorderDropState();
  }, true);

  hydrate(document);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(hydrate)))
    .observe(document.documentElement, { childList: true, subtree: true });
})();
