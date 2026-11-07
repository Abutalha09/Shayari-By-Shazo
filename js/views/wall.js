/**
 * Chai Tapri Wall View
 * Rustic wooden/cork board wall with paper notes pinned at slight angles.
 * Pushing, zooming, and filtering across all 59 handwritten verses.
 * Author: شازیہ (Shazo)
 */

window.WallView = (function() {
  let allShayaris = [];
  let currentFilter = 'all';

  // DOM Elements
  const boardEl = document.getElementById('tapri-wall-board');
  const filterButtons = document.querySelectorAll('.wall-filter-btn');

  const pinStyles = ['brass', '', 'blue', 'green', 'washi'];

  function init(shayaris) {
    allShayaris = shayaris;
    if (!boardEl) return;

    bindEvents();
    renderWall();
  }

  function bindEvents() {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderWall();
      });
    });
  }

  function renderWall() {
    if (!boardEl) return;
    boardEl.innerHTML = '';

    const filtered = currentFilter === 'all' 
      ? allShayaris 
      : allShayaris.filter(s => s.mood === currentFilter);

    filtered.forEach((item, index) => {
      // Deterministic angle between -3.5deg and +3.5deg
      const angle = (((index * 37) % 70) - 35) / 10;
      const pinType = pinStyles[index % pinStyles.length];

      const noteEl = document.createElement('div');
      noteEl.className = 'pinned-note';
      noteEl.style.transform = `rotate(${angle}deg)`;

      // Pin or washi tape header
      let pinHtml = '';
      if (pinType === 'washi') {
        pinHtml = '<div class="washi-tape"></div>';
      } else {
        pinHtml = `<div class="push-pin ${pinType}"></div>`;
      }

      noteEl.innerHTML = `
        ${pinHtml}
        <div class="note-thumb">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
        </div>
        <div class="note-meta">
          <span class="note-mood-tag">${item.mood}</span>
          <h4 class="note-title">${item.title}</h4>
        </div>
      `;

      // Zoom on click and open reader
      noteEl.addEventListener('click', () => {
        noteEl.style.transform = 'scale(1.1) rotate(0deg)';
        noteEl.style.zIndex = '50';
        setTimeout(() => {
          if (window.ModalReader) {
            window.ModalReader.open(item);
          }
          // Restore angle
          noteEl.style.transform = `rotate(${angle}deg)`;
          noteEl.style.zIndex = '';
        }, 220);
      });

      boardEl.appendChild(noteEl);
    });
  }

  return {
    init
  };
})();

