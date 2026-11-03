(() => {
  'use strict';

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const RAIL_SELECTOR = '.qt-rail.single-revision';
  let frame = 0;

  const directNodes = (rail) => Array.from(rail.children)
    .filter((child) => child.matches && child.matches('.qt-node'));

  const directTargets = (rail) => Array.from(rail.children)
    .filter((child) => child.matches &&
      child.matches('.qt-node.qt-nested, .qt-var-alt-group'));

  const bodyFor = (node) => {
    try {
      return node.querySelector(':scope > .qt-body') || node.querySelector('.qt-body') || node;
    } catch (_error) {
      return node.querySelector('.qt-body') || node;
    }
  };

  const targetRectFor = (target) => {
    if (!target.classList.contains('qt-var-alt-group')) {
      return bodyFor(target).getBoundingClientRect();
    }
    const groupRect = target.getBoundingClientRect();
    const headerRect = (target.querySelector('.qt-var-alt-group-head, .qt-var-resolution-head') || target).getBoundingClientRect();
    return {
      left: groupRect.left,
      top: headerRect.top,
      height: headerRect.height
    };
  };

  const isCurrent = (node) => {
    const selectedStatuses = Array.from(node.querySelectorAll('select')).map((select) => select.value);
    if (selectedStatuses.length) {
      return selectedStatuses.some((status) => ['sent', 'accepted', 'complete'].includes(status));
    }
    return /\b(accepted|sent to customer|complete|current)\b/i.test(node.textContent || '');
  };

  function createSvg() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.classList.add('qt-first-co-trainline', 'is-new');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('preserveAspectRatio', 'none');

    const path = document.createElementNS(SVG_NS, 'path');
    path.classList.add('qt-trainline-track');
    svg.appendChild(path);
    return svg;
  }

  function station(x, y, current) {
    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.classList.add('qt-trainline-station');
    if (current) circle.classList.add('is-current');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '6');
    return circle;
  }

  function renderRail(rail) {
    const nodes = directNodes(rail);
    const base = nodes.find((node) => !node.classList.contains('qt-nested'));
    const targets = directTargets(rail);
    let svg = rail.querySelector(':scope > .qt-first-co-trainline');

    if (!base || targets.length === 0) {
      if (svg) svg.remove();
      rail.classList.remove('qt-first-co-bridge-active');
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const width = Math.max(rail.scrollWidth, rail.clientWidth, 1);
    const height = Math.max(rail.scrollHeight, rail.clientHeight, 1);
    const baseRect = bodyFor(base).getBoundingClientRect();
    const targetRects = targets.map(targetRectFor);

    // Keep every segment in the reserved left gutter, clear of the opaque
    // Revision / CO / Variation card backgrounds.
    const startX = Math.max(12, Math.round(baseRect.left - railRect.left - 14));
    const branchX = Math.max(startX + 18, Math.round(targetRects[0].left - railRect.left - 14));
    const startY = Math.round(baseRect.top - railRect.top + baseRect.height / 2);
    const targetYs = targetRects.map((rect) => Math.round(rect.top - railRect.top + rect.height / 2));
    const firstY = targetYs[0];
    const lastY = targetYs[targetYs.length - 1];

    if (!Number.isFinite(startY) || !Number.isFinite(firstY) || firstY <= startY) return;

    if (!svg) {
      svg = createSvg();
      rail.prepend(svg);
      window.setTimeout(() => svg.classList.remove('is-new'), 520);
    }

    rail.classList.add('qt-first-co-bridge-active');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

    const gap = firstY - startY;
    const curveStartY = Math.round(startY + Math.max(18, gap * 0.38));
    const curveEndY = Math.min(firstY, curveStartY + 28);
    const path = svg.querySelector('.qt-trainline-track');
    path.setAttribute('d', [
      `M ${startX} ${startY}`,
      `L ${startX} ${curveStartY}`,
      `C ${startX} ${curveEndY} ${branchX} ${curveStartY} ${branchX} ${curveEndY}`,
      `L ${branchX} ${lastY}`
    ].join(' '));
    path.setAttribute('pathLength', '1');

    svg.querySelectorAll('.qt-trainline-station').forEach((dot) => dot.remove());
    svg.appendChild(station(startX, startY, isCurrent(base)));
    targets.forEach((target, index) => {
      svg.appendChild(station(branchX, targetYs[index], isCurrent(target)));
    });
  }

  function renderAll() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      document.querySelectorAll(RAIL_SELECTOR).forEach(renderRail);
    });
  }

  const observer = new MutationObserver((records) => {
    const relevant = records.some((record) => {
      const target = record.target.nodeType === 1 ? record.target : record.target.parentElement;
      return !(target?.closest && target.closest('.qt-first-co-trainline'));
    });
    if (relevant) renderAll();
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  });

  window.addEventListener('resize', renderAll, { passive: true });
  document.addEventListener('DOMContentLoaded', renderAll, { once: true });
  renderAll();
})();
