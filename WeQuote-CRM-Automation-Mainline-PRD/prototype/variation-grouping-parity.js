(() => {
  if (window.__variationGroupingParityV3) return;
  window.__variationGroupingParityV3 = true;

  let dragState = null;
  let hydrateFrame = 0;

  const nodeSelector = '.qt-node.qt-nested';

  function directBody(node) {
    return node.querySelector(':scope > .qt-body') || node.querySelector('.qt-body');
  }

  function isVariation(node) {
    const body = directBody(node);
    const text = (body?.textContent || '').replace(/\s+/g, ' ').trim();
    return /^Variation(?:\s|#)/i.test(text);
  }

  function clearDropIndicators(container) {
    (container || document).querySelectorAll('.qt-var-drop-before, .qt-var-drop-after')
      .forEach((node) => node.classList.remove('qt-var-drop-before', 'qt-var-drop-after'));
  }

  function finishDrag() {
    if (dragState?.node) dragState.node.classList.remove('qt-var-dragging');
    clearDropIndicators(dragState?.container);
    dragState = null;
  }

  function selectedState(node, control) {
    const selected = control.matches('input[type="checkbox"]')
      ? control.checked
      : control.classList.contains('checked') || control.getAttribute('aria-checked') === 'true';
    node.classList.toggle('qt-var-selected', Boolean(selected));
  }

  function createHandle(node, body, checkbox) {
    if (body.querySelector('.qt-var-drag-handle')) return;

    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'qt-var-drag-handle';
    handle.draggable = true;
    handle.setAttribute('aria-label', 'Reorder variation');
    handle.title = 'Drag to reorder variation';
    handle.innerHTML = '<span class="qt-var-grip-dots" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>';

    const anchor = checkbox.closest('label, .qt-checkbox, .checkbox, .select-control') || checkbox;
    anchor.insertAdjacentElement('afterend', handle);

    handle.addEventListener('click', (event) => event.stopPropagation());
    handle.addEventListener('dragstart', (event) => {
      dragState = { node, container: node.parentElement };
      node.classList.add('qt-var-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', 'variation-reorder');
    });
    handle.addEventListener('dragend', finishDrag);
  }

  function bindDropTarget(node) {
    if (node.dataset.qtVarDropBound === 'true') return;
    node.dataset.qtVarDropBound = 'true';

    node.addEventListener('dragover', (event) => {
      if (!dragState || dragState.node === node || dragState.container !== node.parentElement) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      clearDropIndicators(dragState.container);
      const rect = node.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      node.classList.add(before ? 'qt-var-drop-before' : 'qt-var-drop-after');
    });

    node.addEventListener('dragleave', (event) => {
      if (!node.contains(event.relatedTarget)) {
        node.classList.remove('qt-var-drop-before', 'qt-var-drop-after');
      }
    });

    node.addEventListener('drop', (event) => {
      if (!dragState || dragState.node === node || dragState.container !== node.parentElement) return;
      event.preventDefault();
      const before = node.classList.contains('qt-var-drop-before');
      node.parentElement.insertBefore(dragState.node, before ? node : node.nextSibling);
      node.dispatchEvent(new CustomEvent('variationreorder', {
        bubbles: true,
        detail: { variation: dragState.node, target: node, position: before ? 'before' : 'after' }
      }));
      finishDrag();
    });
  }

  function hydrateNode(node) {
    if (!isVariation(node)) return;
    const body = directBody(node);
    const checkbox = body?.querySelector('input[type="checkbox"], button.qt-var-check, [role="checkbox"]');

    if (!body || !checkbox) {
      node.classList.remove('qt-var-selectable', 'qt-var-selected');
      body?.querySelector('.qt-var-drag-handle')?.remove();
      return;
    }

    node.classList.add('qt-var-selectable');
    selectedState(node, checkbox);

    if (checkbox.dataset.qtVarParityBound !== 'true') {
      checkbox.dataset.qtVarParityBound = 'true';
      checkbox.addEventListener('change', () => selectedState(node, checkbox));
      checkbox.addEventListener('click', () => window.setTimeout(() => selectedState(node, checkbox), 0));
    }

    createHandle(node, body, checkbox);
    bindDropTarget(node);
  }

  function hydrate(root = document) {
    if (root.matches?.(nodeSelector)) hydrateNode(root);
    root.querySelectorAll?.(nodeSelector).forEach(hydrateNode);
  }

  function scheduleHydrate() {
    cancelAnimationFrame(hydrateFrame);
    hydrateFrame = requestAnimationFrame(() => hydrate(document));
  }

  hydrate();
  new MutationObserver(scheduleHydrate).observe(document.body, { childList: true, subtree: true });
})();
