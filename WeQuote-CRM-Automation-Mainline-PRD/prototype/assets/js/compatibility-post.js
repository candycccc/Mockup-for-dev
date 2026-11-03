/* ==================== First Change Order connector ==================== */
  (() => {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let frame = 0;

    const directNodes = (rail) => Array.from(rail.children).filter((child) =>
      child.classList && child.classList.contains('qt-node')
    );

    const isCurrent = (node) =>
      /accepted|sent to customer|complete|current/i.test(node.textContent || '');

    function clearConnector(rail) {
      rail.querySelector(':scope > .qt-first-co-connector')?.remove();
      rail.classList.remove('qt-has-first-co');
      delete rail.dataset.qtFirstCoSignature;
    }

    function drawConnector(rail) {
      const nodes = directNodes(rail);
      const revision = nodes.find((node) => !node.classList.contains('qt-nested'));
      const changes = nodes.filter((node) => node.classList.contains('qt-nested'));

      // Revision 1 on its own deliberately has no trainline.
      if (!revision || changes.length === 0) {
        clearConnector(rail);
        return;
      }

      const revisionBody = revision.querySelector(':scope > .qt-body') || revision;
      const changeBodies = changes.map((node) => node.querySelector(':scope > .qt-body') || node);
      const railRect = rail.getBoundingClientRect();
      const revisionRect = revisionBody.getBoundingClientRect();
      const changeRects = changeBodies.map((body) => body.getBoundingClientRect());

      if (!railRect.width || !railRect.height) return;

      const rootX = Math.max(14, revisionRect.left - railRect.left - 28);
      const branchX = Math.max(rootX + 22, changeRects[0].left - railRect.left - 28);
      const revisionY = revisionRect.top - railRect.top + (revisionRect.height / 2);
      const changeYs = changeRects.map((rect) => rect.top - railRect.top + (rect.height / 2));
      const firstY = changeYs[0];
      const lastY = changeYs[changeYs.length - 1];
      const bendStart = Math.min(firstY - 12, Math.max(revisionY + 18, firstY - 42));
      const bendEnd = Math.max(bendStart + 12, firstY - 6);

      const signature = [
        Math.round(railRect.width), Math.round(railRect.height),
        Math.round(rootX), Math.round(branchX), Math.round(revisionY),
        ...changeYs.map(Math.round)
      ].join(':');

      if (rail.dataset.qtFirstCoSignature === signature &&
          rail.querySelector(':scope > .qt-first-co-connector')) return;

      rail.dataset.qtFirstCoSignature = signature;
      rail.classList.add('qt-has-first-co');
      rail.querySelector(':scope > .qt-first-co-connector')?.remove();

      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.classList.add('qt-first-co-connector');
      svg.setAttribute('viewBox', `0 0 ${railRect.width} ${railRect.height}`);
      svg.setAttribute('preserveAspectRatio', 'none');
      svg.setAttribute('aria-hidden', 'true');

      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('qt-first-co-track');
      path.setAttribute('d', [
        `M ${rootX} ${revisionY}`,
        `L ${rootX} ${bendStart}`,
        `C ${rootX} ${bendStart + 18}, ${branchX} ${bendEnd - 18}, ${branchX} ${bendEnd}`,
        `L ${branchX} ${lastY}`
      ].join(' '));
      svg.appendChild(path);

      const addStation = (x, y, current) => {
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.classList.add('qt-first-co-station');
        if (current) circle.classList.add('is-current');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', '5.5');
        svg.appendChild(circle);
      };

      addStation(rootX, revisionY, isCurrent(revision));
      changes.forEach((node, index) => addStation(branchX, changeYs[index], isCurrent(node)));
      rail.prepend(svg);
    }

    function renderAll() {
      document.querySelectorAll('.qt-rail.single-revision').forEach(drawConnector);
    }

    function scheduleRender() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(renderAll);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', scheduleRender, { once: true });
    } else {
      scheduleRender();
    }

    window.addEventListener('resize', scheduleRender);
    new MutationObserver(scheduleRender).observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  })();
;

/* ==================== Quote trainline v2 ==================== */
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let frame = 0;

  function directNodes(rail) {
    return Array.from(rail.children).filter((el) => el.classList && el.classList.contains('qt-node'));
  }

  function bodyOf(node) {
    return node && (node.querySelector(':scope > .qt-body') || node.querySelector('.qt-body') || node);
  }

  function labelOf(node) {
    return (node && node.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function svgEl(name, attrs) {
    const el = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    return el;
  }

  function drawRail(rail) {
    const nodes = directNodes(rail);
    const revision = nodes.find((node) => /\b(?:Revision|Rev)\s*1\b/i.test(labelOf(node))) || nodes[0];
    const changeOrder = nodes.find((node) => /\bCO\s*1\.1\b/i.test(labelOf(node)));
    let svg = rail.querySelector(':scope > .qt-trainline-overlay');

    if (!revision || !changeOrder) {
      if (svg) svg.remove();
      return;
    }

    const railRect = rail.getBoundingClientRect();
    const revRect = bodyOf(revision).getBoundingClientRect();
    const coRect = bodyOf(changeOrder).getBoundingClientRect();
    const width = Math.max(rail.scrollWidth, railRect.width, 1);
    const height = Math.max(rail.scrollHeight, railRect.height, 1);

    /* Keep the track in the clear gutter, then branch gently toward CO 1.1. */
    const revBodyLeft = revRect.left - railRect.left;
    const coBodyLeft = coRect.left - railRect.left;
    const x1 = Math.max(7, Math.min(30, revBodyLeft - 20));
    const x2 = Math.max(x1 + 24, coBodyLeft - 18);
    const y1 = revRect.top - railRect.top + (revRect.height / 2);
    const y2 = coRect.top - railRect.top + (coRect.height / 2);
    const bendStart = Math.max(y1 + 12, y2 - 25);
    const bendRadius = Math.min(22, Math.max(12, (y2 - y1) / 3));

    if (!svg) {
      svg = svgEl('svg', { class: 'qt-trainline-overlay', 'aria-hidden': 'true' });
      rail.prepend(svg);
    }
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.replaceChildren();

    const path = svgEl('path', {
      class: 'track',
      d: `M ${x1} ${y1} L ${x1} ${bendStart} C ${x1} ${bendStart + bendRadius}, ${x2} ${y2 - bendRadius}, ${x2} ${y2}`
    });
    const firstStation = svgEl('circle', {
      class: 'station', cx: x1, cy: y1, r: 6.5, fill: '#2B55FF'
    });
    const nextStation = svgEl('circle', {
      class: 'station', cx: x2, cy: y2, r: 6.5, fill: '#CAD5ED'
    });
    svg.append(path, firstStation, nextStation);
  }

  function renderTrainlines() {
    frame = 0;
    document.querySelectorAll('.qt-rail').forEach(drawRail);
  }

  function scheduleTrainlines() {
    if (!frame) frame = requestAnimationFrame(renderTrainlines);
  }

  window.addEventListener('resize', scheduleTrainlines, { passive: true });
  document.addEventListener('click', () => setTimeout(scheduleTrainlines, 0));
  document.addEventListener('change', () => setTimeout(scheduleTrainlines, 0));

  const observer = new MutationObserver((records) => {
    const relevant = records.some((record) => {
      if (record.target.closest && record.target.closest('.qt-trainline-overlay')) return false;
      return Array.from(record.addedNodes).some((node) =>
        node.nodeType === 1 && !(node.classList && node.classList.contains('qt-trainline-overlay'))
      );
    });
    if (relevant) scheduleTrainlines();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  scheduleTrainlines();
})();
;

/* ==================== Quote trainline v4 ==================== */
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg';
  let observer;
  let frame = 0;

  const nodeBody = node => node.querySelector(':scope > .qt-body') || node.querySelector('.qt-body') || node;

  function makeSvgElement(name, attrs) {
    const element = document.createElementNS(SVG_NS, name);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
    return element;
  }

  function drawRail(rail) {
    rail.querySelectorAll(':scope > .qt-trainline-overlay-v4').forEach(el => el.remove());

    const nodes = [...rail.querySelectorAll(':scope > .qt-node')];
    const revision = nodes.find(node => /\b(?:revision|rev)\s*1\b/i.test(node.textContent || ''));
    const changeOrder = nodes.find(node => /\bCO\s*1\.1\b/i.test(node.textContent || ''));
    if (!revision || !changeOrder) return;

    const railRect = rail.getBoundingClientRect();
    const revisionRect = nodeBody(revision).getBoundingClientRect();
    const changeOrderRect = nodeBody(changeOrder).getBoundingClientRect();
    if (!railRect.width || !railRect.height) return;

    /* Keep the line in the card gutter, never underneath the text or border. */
    const revisionX = Math.max(14, revisionRect.left - railRect.left - 18);
    const changeOrderX = Math.max(revisionX + 24, changeOrderRect.left - railRect.left - 18);
    const revisionY = revisionRect.top - railRect.top + (revisionRect.height / 2);
    const changeOrderY = changeOrderRect.top - railRect.top + (changeOrderRect.height / 2);
    if (changeOrderY <= revisionY) return;

    const gap = changeOrderY - revisionY;
    const curveStart = revisionY + Math.max(14, gap * 0.32);
    const curveEnd = changeOrderY - Math.max(14, gap * 0.32);
    const control = Math.max(12, Math.min(28, gap * 0.22));
    const pathData = [
      `M ${revisionX} ${revisionY}`,
      `V ${curveStart}`,
      `C ${revisionX} ${curveStart + control}, ${changeOrderX} ${curveEnd - control}, ${changeOrderX} ${curveEnd}`,
      `V ${changeOrderY}`
    ].join(' ');

    const svg = makeSvgElement('svg', {
      class: 'qt-trainline-overlay-v4',
      viewBox: `0 0 ${railRect.width} ${railRect.height}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true'
    });
    svg.appendChild(makeSvgElement('path', { class: 'trainline-path', d: pathData }));
    svg.appendChild(makeSvgElement('circle', { class: 'trainline-station', cx: revisionX, cy: revisionY, r: 6 }));
    svg.appendChild(makeSvgElement('circle', { class: 'trainline-station', cx: changeOrderX, cy: changeOrderY, r: 6 }));
    rail.prepend(svg);
  }

  function drawAll() {
    observer?.disconnect();
    document.querySelectorAll('.qt-rail').forEach(drawRail);
    const root = document.querySelector('#qlo-rows');
    if (root && observer) observer.observe(root, { childList: true, subtree: true });
  }

  function scheduleDraw() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(drawAll);
  }

  observer = new MutationObserver(scheduleDraw);
  window.addEventListener('resize', scheduleDraw, { passive: true });
  document.addEventListener('click', () => setTimeout(scheduleDraw, 0));
  document.addEventListener('change', () => setTimeout(scheduleDraw, 0));

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleDraw, { once: true });
  } else {
    scheduleDraw();
  }
})();
;
