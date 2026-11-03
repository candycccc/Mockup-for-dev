/* ==================== Pipeline Deal drop handling ==================== */
  (() => {
    const pipeline = document.getElementById('pipeline');
    if (!pipeline || document.getElementById('stageInsertionMarker')) return;

    const marker = document.createElement('div');
    marker.id = 'stageInsertionMarker';
    marker.className = 'stage-insertion-marker';
    marker.setAttribute('aria-hidden', 'true');
    document.body.appendChild(marker);

    let draggedStage = null;

    const hideMarker = () => {
      marker.classList.remove('is-visible');
    };

    const visibleStages = () => Array.from(pipeline.querySelectorAll(':scope > .stage'))
      .filter(stage => stage !== draggedStage && stage.getClientRects().length);

    const nearestStage = (clientX) => visibleStages().reduce((nearest, stage) => {
      const rect = stage.getBoundingClientRect();
      const distance = Math.abs(clientX - (rect.left + rect.width / 2));
      return !nearest || distance < nearest.distance ? { stage, distance } : nearest;
    }, null)?.stage || null;

    const showMarkerAt = (stage, before) => {
      const rect = stage.getBoundingClientRect();
      const edge = before ? rect.left : rect.right;
      marker.style.left = `${Math.round(edge - 1.5)}px`;
      marker.style.top = `${Math.round(rect.top + 4)}px`;
      marker.style.height = `${Math.max(40, Math.round(rect.height - 8))}px`;
      marker.classList.add('is-visible');
    };

    pipeline.addEventListener('dragstart', event => {
      const stage = event.target.closest?.('.stage');
      if (!stage || event.target.closest?.('.deal-card')) return;

      // Stage reordering only exists in the manage-stages view, where editors
      // are rendered inside each stage. This prevents deal-card drags from
      // showing the stage insertion marker.
      if (!stage.querySelector('.stage-editor')) return;
      draggedStage = stage;
    }, true);

    pipeline.addEventListener('dragover', event => {
      if (!draggedStage) return;

      const stages = visibleStages();
      if (!stages.length) {
        hideMarker();
        return;
      }

      event.preventDefault();
      const hoveredStage = event.target.closest?.('.stage');
      const target = hoveredStage && hoveredStage !== draggedStage
        ? hoveredStage
        : nearestStage(event.clientX);

      if (!target) {
        hideMarker();
        return;
      }

      const rect = target.getBoundingClientRect();
      showMarkerAt(target, event.clientX < rect.left + rect.width / 2);
    }, true);

    const finishDrag = () => {
      hideMarker();
      draggedStage = null;
    };

    pipeline.addEventListener('drop', () => setTimeout(finishDrag, 0), true);
    pipeline.addEventListener('dragend', finishDrag, true);
    document.addEventListener('drop', finishDrag, true);
  })();
;

/* ==================== Pipeline stage drag repair ==================== */
(function () {
  'use strict';

  var pipeline = document.getElementById('pipeline');
  if (!pipeline || pipeline.dataset.dynamicStageDropReady === 'true') return;
  pipeline.dataset.dynamicStageDropReady = 'true';

  var draggedDeal = null;
  var sourceStage = null;
  var currentDropStage = null;
  var marker = document.createElement('div');
  marker.className = 'dynamic-deal-insertion-marker';
  marker.setAttribute('aria-hidden', 'true');

  function directCards(body) {
    return Array.prototype.filter.call(body ? body.children : [], function (child) {
      return child.classList && child.classList.contains('deal-card');
    });
  }

  function ensureStageBody(stage) {
    if (!stage || !stage.classList || !stage.classList.contains('stage')) return null;
    var body = Array.prototype.find.call(stage.children, function (child) {
      return child.classList && child.classList.contains('stage-body');
    });
    if (!body) {
      body = document.createElement('div');
      body.className = 'stage-body dynamic-empty-stage';
      var head = stage.querySelector('.stage-head');
      if (head && head.nextSibling) stage.insertBefore(body, head.nextSibling);
      else stage.appendChild(body);
    }
    body.classList.toggle('dynamic-empty-stage', directCards(body).length === 0);
    return body;
  }

  function hydrateStages() {
    Array.prototype.forEach.call(pipeline.querySelectorAll('.stage'), function (stage) {
      ensureStageBody(stage);
    });
  }

  function stageName(stage) {
    if (!stage) return '';
    var title = stage.querySelector('.stage-title-wrap, .stage-name-row, .stage-title, .stage-head h2, .stage-head h3');
    return (title ? title.textContent : '').replace(/\s+/g, ' ').trim();
  }

  function isTerminalStage(stage) {
    var name = stageName(stage).toLowerCase();
    var headText = ((stage && stage.querySelector('.stage-head')) || stage || document.createElement('div')).textContent || '';
    return /(^|\s)(won|lost)(\s|$)/i.test(name) || /probability\s*(?:0|100)%/i.test(headText);
  }

  function isManageMode() {
    var actions = document.getElementById('pipelineManageActions');
    if (actions) {
      var style = window.getComputedStyle(actions);
      if (style.display !== 'none' && style.visibility !== 'hidden' && actions.offsetParent !== null) return true;
    }
    return pipeline.classList.contains('pipeline-manage-mode') || document.body.classList.contains('pipeline-manage-mode');
  }

  function updateStageSummary(stage) {
    if (!stage) return;
    var body = ensureStageBody(stage);
    body.classList.toggle('dynamic-empty-stage', directCards(body).length === 0);

    // The current stage header already owns Deal, Margin and deal-count totals.
    // Remove the old "£value · N deals" fallback instead of rendering duplicate data.
    var legacySummary = stage.querySelector('.stage-head > .stage-summary');
    if (legacySummary) legacySummary.remove();
    if (typeof window.recalcPipeline === 'function') window.recalcPipeline();
  }

  function clearDropFeedback() {
    Array.prototype.forEach.call(pipeline.querySelectorAll('.stage.dynamic-deal-drop-target'), function (stage) {
      stage.classList.remove('dynamic-deal-drop-target');
    });
    currentDropStage = null;
    Array.prototype.forEach.call(pipeline.querySelectorAll('.dynamic-deal-insertion-marker'), function (dropMarker) {
      if (dropMarker.parentNode) dropMarker.parentNode.removeChild(dropMarker);
    });
  }

  function showInsertion(stage, clientY) {
    var body = ensureStageBody(stage);
    var cards = directCards(body).filter(function (card) { return card !== draggedDeal; });
    var before = cards.find(function (card) {
      var rect = card.getBoundingClientRect();
      return clientY < rect.top + rect.height / 2;
    });
    if (before) body.insertBefore(marker, before);
    else body.appendChild(marker);
  }

  pipeline.addEventListener('dragstart', function (event) {
    if (isManageMode()) return;
    var card = event.target && event.target.closest ? event.target.closest('.deal-card') : null;
    if (!card || !pipeline.contains(card)) return;
    hydrateStages();
    draggedDeal = card;
    sourceStage = card.closest('.stage');
    card.classList.add('dynamic-deal-dragging');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      try { event.dataTransfer.setData('text/plain', card.dataset.dealId || card.textContent.trim().slice(0, 80)); } catch (ignore) {}
    }
  }, true);

  pipeline.addEventListener('dragover', function (event) {
    if (!draggedDeal || isManageMode()) return;
    var stage = event.target && event.target.closest ? event.target.closest('.stage') : null;
    if (!stage || !pipeline.contains(stage) || isTerminalStage(stage)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    if (currentDropStage !== stage) {
      clearDropFeedback();
      currentDropStage = stage;
      stage.classList.add('dynamic-deal-drop-target');
    }
    showInsertion(stage, event.clientY);
  });

  pipeline.addEventListener('dragleave', function (event) {
    if (!currentDropStage) return;
    var next = event.relatedTarget;
    if (next && currentDropStage.contains(next)) return;
    if (event.target === currentDropStage || event.target.classList.contains('stage-body')) clearDropFeedback();
  });

  pipeline.addEventListener('drop', function (event) {
    if (!draggedDeal || isManageMode()) return;
    var stage = event.target && event.target.closest ? event.target.closest('.stage') : null;
    if (!stage || !pipeline.contains(stage) || isTerminalStage(stage)) return;
    event.preventDefault();

    var card = draggedDeal;
    var fromStage = sourceStage;
    var targetBody = ensureStageBody(stage);
    var markerNext = marker.nextSibling;

    // Existing business handlers get this event too. The microtask fallback only
    // moves the card when they have not already done so.
    window.setTimeout(function () {
      // The primary drop handler may replace the dragged card node. Cleanup must
      // still run in that case or the stage outline and insertion line remain.
      if (card && card.isConnected) {
        if (card.closest('.stage') === fromStage || card.closest('.stage') === stage) {
          if (marker.parentNode === targetBody) targetBody.insertBefore(card, markerNext && markerNext.parentNode === targetBody ? markerNext : null);
          else targetBody.appendChild(card);
        }
        card.classList.remove('dynamic-deal-dragging');
      }
      clearDropFeedback();
      updateStageSummary(fromStage);
      updateStageSummary(stage);
      draggedDeal = null;
      sourceStage = null;
    }, 0);
  });

  document.addEventListener('dragend', function () {
    if (draggedDeal) draggedDeal.classList.remove('dynamic-deal-dragging');
    clearDropFeedback();
    if (sourceStage) updateStageSummary(sourceStage);
    draggedDeal = null;
    sourceStage = null;
  }, true);

  var observer = new MutationObserver(function (mutations) {
    var needsHydration = mutations.some(function (mutation) {
      return Array.prototype.some.call(mutation.addedNodes, function (node) {
        return node.nodeType === 1 && ((node.matches && node.matches('.stage')) || (node.querySelector && node.querySelector('.stage')));
      });
    });
    if (needsHydration) window.requestAnimationFrame(hydrateStages);
  });
  observer.observe(pipeline, { childList: true, subtree: true });

  hydrateStages();
}());
;

/* ==================== Variation grouping parity ==================== */
  (() => {
    const variationNodeSelector = '.qt-node.qt-nested';
    let draggedVariation = null;

    const isVariationNode = (node) => {
      if (!node) return false;
      return /Variation\s*#?/i.test(node.textContent || '') ||
        node.matches('[data-type="variation"], [data-item-type="variation"]');
    };

    const getCheckbox = (node) =>
      node.querySelector('input[type="checkbox"], [role="checkbox"]');

    const isChecked = (checkbox) => checkbox &&
      (checkbox.checked || checkbox.getAttribute('aria-checked') === 'true');

    const syncSelectedState = (node) => {
      const checkbox = getCheckbox(node);
      node.classList.toggle('qt-var-selected', Boolean(isChecked(checkbox)));
    };

    const addDragHandle = (node) => {
      if (!isVariationNode(node) || node.querySelector('.qt-var-drag-handle')) return;

      node.classList.add('qt-var-selectable');

      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = 'qt-var-drag-handle';
      handle.title = 'Drag to reorder';
      handle.setAttribute('aria-label', 'Drag variation to reorder');
      handle.innerHTML = '<span class="qt-var-drag-dots" aria-hidden="true"></span>';

      const checkbox = getCheckbox(node);
      if (checkbox) {
        const checkboxControl = checkbox.closest('label, .qt-checkbox, .qt-select-control') || checkbox;
        checkboxControl.insertAdjacentElement('afterend', handle);
      } else {
        (node.querySelector(':scope > .qt-body') || node).prepend(handle);
      }

      syncSelectedState(node);
    };

    const hydrateVariations = (root = document) => {
      if (root.matches && root.matches(variationNodeSelector)) addDragHandle(root);
      if (root.querySelectorAll) {
        root.querySelectorAll(variationNodeSelector).forEach(addDragHandle);
      }
    };

    const clearDropIndicators = () => {
      document.querySelectorAll('.qt-var-drop-before, .qt-var-drop-after').forEach((node) => {
        node.classList.remove('qt-var-drop-before', 'qt-var-drop-after');
      });
    };

    const sameVariationScope = (a, b) => {
      const scopeA = a.closest('.dd-qlist, .qt-rail') || a.parentElement;
      const scopeB = b.closest('.dd-qlist, .qt-rail') || b.parentElement;
      return scopeA === scopeB;
    };

    document.addEventListener('change', (event) => {
      const node = event.target.closest && event.target.closest(variationNodeSelector);
      if (node && isVariationNode(node)) syncSelectedState(node);
    });

    document.addEventListener('click', (event) => {
      const handle = event.target.closest && event.target.closest('.qt-var-drag-handle');
      if (handle) {
        event.preventDefault();
        return;
      }

      const node = event.target.closest && event.target.closest(variationNodeSelector);
      if (node && isVariationNode(node)) {
        window.setTimeout(() => syncSelectedState(node), 0);
      }
    });

    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest && event.target.closest('.qt-var-drag-handle');
      if (!handle) return;
      const node = handle.closest(variationNodeSelector);
      if (node) node.draggable = true;
    });

    document.addEventListener('dragstart', (event) => {
      const node = event.target.closest && event.target.closest(variationNodeSelector);
      if (!node || !node.classList.contains('qt-var-selectable')) return;

      draggedVariation = node;
      node.classList.add('qt-var-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'variation-reorder');
    });

    document.addEventListener('dragover', (event) => {
      if (!draggedVariation) return;
      const target = event.target.closest && event.target.closest(variationNodeSelector);
      if (!target || target === draggedVariation ||
          !target.classList.contains('qt-var-selectable') ||
          !sameVariationScope(draggedVariation, target)) return;

      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      clearDropIndicators();

      const rect = target.getBoundingClientRect();
      target.classList.add(
        event.clientY < rect.top + rect.height / 2
          ? 'qt-var-drop-before'
          : 'qt-var-drop-after'
      );
    });

    document.addEventListener('drop', (event) => {
      if (!draggedVariation) return;
      const target = event.target.closest && event.target.closest(variationNodeSelector);
      if (!target || target === draggedVariation ||
          !sameVariationScope(draggedVariation, target)) return;

      const insertBefore = target.classList.contains('qt-var-drop-before');
      const insertAfter = target.classList.contains('qt-var-drop-after');
      if (!insertBefore && !insertAfter) return;

      event.preventDefault();
      target.parentNode.insertBefore(
        draggedVariation,
        insertBefore ? target : target.nextSibling
      );

      target.parentNode.dispatchEvent(new CustomEvent('variationreorder', {
        bubbles: true,
        detail: { variation: draggedVariation }
      }));
      clearDropIndicators();
    });

    document.addEventListener('dragend', () => {
      if (draggedVariation) {
        draggedVariation.classList.remove('qt-var-dragging');
        draggedVariation.draggable = false;
      }
      draggedVariation = null;
      clearDropIndicators();
    });

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) hydrateVariations(node);
        });
      });
    }).observe(document.documentElement, { childList: true, subtree: true });

    hydrateVariations();
  })();
;
