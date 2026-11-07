/**
 * Main Application Orchestrator
 * Loads shayaris data, handles view routing, computes daily shayari,
 * triggers random picker, and binds global modals.
 * Author: شازیہ (Shazo) • abutalha09.vercel.app
 */

(async function() {
  'use strict';

  let shayarisData = [];
  let dailyShayari = null;

  // DOM Elements
  const navTabs = document.querySelectorAll('.nav-tab');
  const viewPanels = document.querySelectorAll('.view-panel');
  const dailyBannerTitle = document.getElementById('daily-banner-title');
  const btnReadDaily = document.getElementById('btn-read-daily');
  const btnRandomHeader = document.getElementById('btn-random-header');
  const btnAboutHeader = document.getElementById('btn-about-header');
  const aboutModal = document.getElementById('about-modal');
  const aboutModalClose = document.getElementById('about-modal-close');

  // Global Toast Notification Helper
  window.showToast = function(message, icon = '✨', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast-bubble';
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-text">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  };

  async function loadData() {
    // 1. Primary: load synchronously if already injected via data/shayaris-data.js (works 100% on file:// and Vercel)
    if (window.SHAYARIS_DATA && Array.isArray(window.SHAYARIS_DATA) && window.SHAYARIS_DATA.length > 0) {
      shayarisData = window.SHAYARIS_DATA;
    } else {
      try {
        const response = await fetch('data/shayaris.json');
        if (response.ok) {
          shayarisData = await response.json();
        } else {
          throw new Error(`HTTP error ${response.status}`);
        }
      } catch (e) {
        console.warn('Could not load data/shayaris.json via fetch, checking window fallback.', e);
        if (window.SHAYARIS_DATA && window.SHAYARIS_DATA.length > 0) {
          shayarisData = window.SHAYARIS_DATA;
        }
      }
    }

    // Set Daily Shayari deterministically
    computeDailyShayari();

    // Initialize all modules with shayarisData
    if (window.VoicePlayer) window.VoicePlayer.init(shayarisData);
    if (window.ShareCardGenerator) window.ShareCardGenerator.init();
    if (window.ModalReader) window.ModalReader.init(shayarisData);
    if (window.DiaryView) window.DiaryView.init(shayarisData);
    if (window.MoodsView) window.MoodsView.init(shayarisData);
    if (window.SkyView) window.SkyView.init(shayarisData);
    if (window.WallView) window.WallView.init(shayarisData);

    if (dailyShayari && window.VoicePlayer) {
      window.VoicePlayer.loadShayari(dailyShayari);
    }

    bindAppEvents();
    handleInitialRoute();
  }

  // Feature 5: Aaj Ka Shayari (deterministic based on date)
  function computeDailyShayari() {
    if (!shayarisData.length) return;
    const now = new Date();
    // Unique seed for each date (YYYY-MM-DD)
    const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    const index = Math.abs(seed) % shayarisData.length;
    dailyShayari = shayarisData[index];

    if (dailyBannerTitle) {
      dailyBannerTitle.textContent = `${dailyShayari.title} • [${dailyShayari.mood}]`;
    }
  }

  function bindAppEvents() {
    // 1. View Navigation Tabs
    navTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetView = tab.dataset.view;
        switchView(targetView);
      });
    });

    // 2. Daily Banner Button
    if (btnReadDaily) {
      btnReadDaily.addEventListener('click', () => {
        if (dailyShayari && window.ModalReader) {
          window.ModalReader.open(dailyShayari);
        }
      });
    }

    // 3. Random Shayari Button (Feature 5)
    if (btnRandomHeader) {
      btnRandomHeader.addEventListener('click', () => {
        if (!shayarisData.length) return;
        const randomIdx = Math.floor(Math.random() * shayarisData.length);
        const randomItem = shayarisData[randomIdx];

        // Button feedback animation
        btnRandomHeader.style.transform = 'rotate(180deg) scale(1.1)';
        setTimeout(() => { btnRandomHeader.style.transform = ''; }, 300);

        if (window.ModalReader) {
          window.ModalReader.open(randomItem);
        }
      });
    }

    // 4. About Modal Trigger
    if (btnAboutHeader) {
      btnAboutHeader.addEventListener('click', () => {
        if (aboutModal) {
          aboutModal.classList.add('active');
          aboutModal.setAttribute('aria-hidden', 'false');
        }
      });
    }

    if (aboutModalClose) {
      aboutModalClose.addEventListener('click', () => {
        if (aboutModal) {
          aboutModal.classList.remove('active');
          aboutModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    if (aboutModal) {
      aboutModal.addEventListener('click', (e) => {
        if (e.target === aboutModal) {
          aboutModal.classList.remove('active');
          aboutModal.setAttribute('aria-hidden', 'true');
        }
      });
    }

    // 5. Hash change routing
    window.addEventListener('hashchange', handleHashChange);
  }

  function switchView(viewName) {
    // Update tabs
    navTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.view === viewName);
    });

    // Update panels
    viewPanels.forEach(p => {
      p.classList.toggle('active', p.id === `view-${viewName}`);
    });

    // Update URL hash
    if (history.replaceState) {
      history.replaceState(null, null, `#${viewName}`);
    }

    // Re-trigger layout or canvas refresh if needed
    if (viewName === 'sky' && window.SkyView) {
      window.dispatchEvent(new Event('resize'));
    } else if (viewName === 'moods' && window.MoodsView) {
      window.dispatchEvent(new Event('resize'));
    }
  }

  function handleInitialRoute() {
    const hash = window.location.hash.toLowerCase();

    // Check for queue drawer
    if (hash === '#queue') {
      if (window.VoicePlayer && window.VoicePlayer.openQueueDrawer) {
        window.VoicePlayer.openQueueDrawer();
      }
      return;
    }

    // Check for direct shayari deep link: #shayari-5
    const shayariMatch = hash.match(/#shayari-(\d+)/);
    if (shayariMatch) {
      const id = parseInt(shayariMatch[1], 10);
      const item = shayarisData.find(s => s.id === id);
      if (item && window.ModalReader) {
        window.ModalReader.open(item);
      }
      return;
    }

    // Check for view hash: #diary, #moods, #sky, #wall
    const cleanHash = hash.replace('#', '');
    if (['diary', 'moods', 'sky', 'wall'].includes(cleanHash)) {
      switchView(cleanHash);
    } else {
      switchView('diary');
    }
  }

  function handleHashChange() {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#queue') {
      if (window.VoicePlayer && window.VoicePlayer.openQueueDrawer) {
        window.VoicePlayer.openQueueDrawer();
      }
      return;
    }

    const shayariMatch = hash.match(/#shayari-(\d+)/);
    if (shayariMatch) {
      const id = parseInt(shayariMatch[1], 10);
      const item = shayarisData.find(s => s.id === id);
      if (item && window.ModalReader) {
        window.ModalReader.open(item);
      }
    } else {
      const cleanHash = hash.replace('#', '');
      if (['diary', 'moods', 'sky', 'wall'].includes(cleanHash)) {
        switchView(cleanHash);
      }
    }
  }

  // Start app when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadData);
  } else {
    loadData();
  }

})();

