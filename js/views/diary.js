/**
 * Digital Diary View (PageFlip Book)
 * Realistic page-flip book displaying handwritten shayari on paper pages,
 * with mobile touch swipe, desktop click/drag, handwritten/typed text toggle,
 * favourites bookmarking, WhatsApp sharing, and last-read page memory.
 * Author: شازیہ (Shazo)
 */

window.DiaryView = (function() {
  'use strict';

  let pageFlipInstance = null;
  let allShayaris = [];
  let currentPageIndex = 0;
  let audioCtx = null;
  let activeDisplayMode = 'handwritten'; // 'handwritten' or 'typed'

  // DOM Elements
  const flipbookEl = document.getElementById('flipbook');
  const pageIndicatorEl = document.getElementById('diary-page-indicator');
  const prevBtn = document.getElementById('diary-prev-btn');
  const nextBtn = document.getElementById('diary-next-btn');
  const fullscreenBtn = document.getElementById('diary-fullscreen-btn');
  const bookViewport = document.getElementById('book-viewport');

  // Mode Switch Elements
  const btnModeHandwritten = document.getElementById('btn-diary-handwritten');
  const btnModeTyped = document.getElementById('btn-diary-typed');

  // Bottom Meta & Action Elements
  const verseMoodEl = document.getElementById('diary-verse-mood');
  const verseTitleEl = document.getElementById('diary-verse-title');
  const diaryPlayBtn = document.getElementById('diary-play-btn');
  const diaryWaShareBtn = document.getElementById('diary-wa-share-btn');
  const diaryShareBtn = document.getElementById('diary-share-btn');
  const diaryBookmarkBtn = document.getElementById('diary-bookmark-btn');
  const diaryFavLabel = document.getElementById('diary-fav-label');
  const diaryViewTextBtn = document.getElementById('diary-view-text-btn');

  function init(shayaris) {
    if (Array.isArray(shayaris) && shayaris.length > 0) {
      allShayaris = shayaris;
    } else if (window.SHAYARIS_DATA && window.SHAYARIS_DATA.length > 0) {
      allShayaris = window.SHAYARIS_DATA;
    }
    if (!flipbookEl || !allShayaris.length) return;

    // Check last read page from localStorage
    const savedLastPage = parseInt(localStorage.getItem('shazo_last_page'), 10);
    if (!isNaN(savedLastPage) && savedLastPage >= 0 && savedLastPage < allShayaris.length) {
      currentPageIndex = savedLastPage;
    }

    renderPages();
    initPageFlip();
    bindEvents();
    bindTouchGestures();
    updateActivePageMeta(currentPageIndex);
    updateFavBadgeCount();

    // Notify user of restored progress if resuming past page 1
    if (currentPageIndex > 0) {
      setTimeout(() => {
        if (window.showToast) {
          window.showToast(`सफ़ा ${currentPageIndex + 1} से दोबारा शुरू किया गया 📖`, '✨', 3500);
        }
      }, 500);
    }
  }

  function renderPages() {
    flipbookEl.innerHTML = '';

    allShayaris.forEach((item, index) => {
      const pageEl = document.createElement('div');
      pageEl.className = 'book-page';
      pageEl.dataset.density = 'soft';
      pageEl.dataset.id = item.id;

      // Format typed lines for text mode
      const stanzasHtml = (item.text || 'ऊपर दिए गए हस्तलिखित पन्ने का आनंद लें।')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
        .map(line => `<p class="typed-card-line">${line}</p>`)
        .join('');

      pageEl.innerHTML = `
        <div class="page-paper-shadow"></div>
        <div class="page-skeleton"></div>

        <!-- Handwritten Photo Mode -->
        <div class="page-image-frame" title="बड़ा देखने के लिए क्लिक करें">
          <img src="${item.image}" alt="${item.title} - شازیہ" loading="${index < 4 ? 'eager' : 'lazy'}" onload="this.closest('.book-page').querySelector('.page-skeleton')?.classList.add('loaded')">
        </div>

        <!-- Typed Devanagari Poetry Mode -->
        <div class="page-typed-card">
          <div class="typed-card-inner">
            <span class="typed-card-mood">${item.mood}</span>
            <h3 class="typed-card-title">${item.title}</h3>
            <div class="typed-card-ornament">✦ ✦ ✦</div>
            <div class="typed-card-stanzas">
              ${stanzasHtml}
            </div>
            <div class="typed-card-byline">— شازیہ (Shazo)</div>
          </div>
        </div>

        <div class="page-footer-info">
          <span class="page-mood">${item.mood}</span>
          <span class="page-number-label">सफ़ा ${index + 1}</span>
        </div>
      `;

      // Tap page to open full reader
      const imgFrame = pageEl.querySelector('.page-image-frame');
      if (imgFrame) {
        imgFrame.addEventListener('click', () => {
          if (window.ModalReader) window.ModalReader.open(item);
        });
      }
      const typedCard = pageEl.querySelector('.page-typed-card');
      if (typedCard) {
        typedCard.addEventListener('click', () => {
          if (window.ModalReader) window.ModalReader.open(item);
        });
      }

      flipbookEl.appendChild(pageEl);
    });
  }

  function initPageFlip() {
    if (pageFlipInstance) {
      try { pageFlipInstance.destroy(); } catch (e) {}
    }

    if (typeof St === 'undefined' || !St.PageFlip) {
      console.warn('StPageFlip library not loaded.');
      return;
    }

    const isMobile = window.innerWidth <= 768;
    const pageW = isMobile ? Math.min(window.innerWidth - 32, 340) : 420;
    const pageH = isMobile ? Math.min(Math.round(pageW * 1.38), window.innerHeight - 240) : 580;

    pageFlipInstance = new St.PageFlip(flipbookEl, {
      width: pageW,
      height: pageH,
      size: 'stretch',
      minWidth: isMobile ? 240 : 280,
      maxWidth: isMobile ? 380 : 500,
      minHeight: isMobile ? 330 : 400,
      maxHeight: isMobile ? 540 : 700,
      maxShadowOpacity: 0.65,
      showCover: false,
      mobileScrollSupport: false, // Prevents vertical drag interference with horizontal page flip
      usePortrait: isMobile,      // Single page view on mobile, 2-page spread on desktop
      startPage: currentPageIndex,
      drawShadow: true,
      flippingTime: 650,
      useMouseEvents: true,
      swipeDistance: 25
    });

    pageFlipInstance.loadFromHTML(document.querySelectorAll('.book-page'));

    // Flip sound & page update event
    pageFlipInstance.on('flip', (e) => {
      currentPageIndex = e.data;
      localStorage.setItem('shazo_last_page', currentPageIndex);
      updateActivePageMeta(currentPageIndex);
      playPaperSound();
    });
  }

  function bindEvents() {
    // 1. Prev / Next Navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (pageFlipInstance) pageFlipInstance.flipPrev();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (pageFlipInstance) pageFlipInstance.flipNext();
      });
    }

    // 2. Fullscreen
    if (fullscreenBtn && bookViewport) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          bookViewport.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen().catch(err => console.log(err));
        }
      });
    }

    // 3. Mode Toggle: Handwritten vs Typed Hindi Text
    if (btnModeHandwritten) {
      btnModeHandwritten.addEventListener('click', () => setDisplayMode('handwritten'));
    }
    if (btnModeTyped) {
      btnModeTyped.addEventListener('click', () => setDisplayMode('typed'));
    }

    // 4. WhatsApp Direct Share
    if (diaryWaShareBtn) {
      diaryWaShareBtn.addEventListener('click', () => {
        const item = allShayaris[currentPageIndex];
        if (!item) return;
        const poetryLines = item.text || item.title;
        const msg = `*${item.title}* [${item.mood}]\n\n${poetryLines}\n\n— *شازیہ (Shazo)*\nhttps://abutalha09.vercel.app#shayari-${item.id}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }

    // 5. Instagram Story Card
    if (diaryShareBtn) {
      diaryShareBtn.addEventListener('click', () => {
        const item = allShayaris[currentPageIndex];
        if (item && window.ShareCardGenerator) {
          window.ShareCardGenerator.open(item);
        }
      });
    }

    // 6. Favourite / Bookmark Toggle
    if (diaryBookmarkBtn) {
      diaryBookmarkBtn.addEventListener('click', () => {
        const item = allShayaris[currentPageIndex];
        if (item) toggleFavourite(item.id);
      });
    }

    // 7. View Full Modal
    if (diaryViewTextBtn) {
      diaryViewTextBtn.addEventListener('click', () => {
        const item = allShayaris[currentPageIndex];
        if (item && window.ModalReader) {
          window.ModalReader.open(item);
        }
      });
    }

    // 8. Keyboard Navigation for Diary View: ArrowLeft / ArrowRight / T (Toggle Text)
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const diaryPanel = document.getElementById('view-diary');
      const isDiaryActive = diaryPanel && diaryPanel.classList.contains('active');
      const modalOpen = document.getElementById('reader-modal')?.classList.contains('active');
      if (!isDiaryActive || modalOpen) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (pageFlipInstance) pageFlipInstance.flipPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (pageFlipInstance) pageFlipInstance.flipNext();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setDisplayMode(activeDisplayMode === 'handwritten' ? 'typed' : 'handwritten');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        const item = allShayaris[currentPageIndex];
        if (item) toggleFavourite(item.id);
      }
    });

    // 9. Re-init on window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initPageFlip();
      }, 300);
    });
  }

  // Mobile Touch Swipe Gesture Listener (Ensures 100% reliable swipe on iOS & Android)
  function bindTouchGestures() {
    if (!bookViewport) return;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    bookViewport.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    bookViewport.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStartX;
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const elapsed = Date.now() - touchStartTime;

        // Horizontal swipe (> 35px threshold and mainly horizontal)
        if (elapsed < 650 && Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3) {
          if (deltaX < 0) {
            // Swipe left -> Next page
            if (pageFlipInstance) pageFlipInstance.flipNext();
          } else {
            // Swipe right -> Prev page
            if (pageFlipInstance) pageFlipInstance.flipPrev();
          }
        }
      }
    }, { passive: true });
  }

  function setDisplayMode(mode) {
    activeDisplayMode = mode;
    if (btnModeHandwritten) btnModeHandwritten.classList.toggle('active', mode === 'handwritten');
    if (btnModeTyped) btnModeTyped.classList.toggle('active', mode === 'typed');

    if (flipbookEl) {
      if (mode === 'typed') {
        flipbookEl.classList.add('show-typed-mode');
      } else {
        flipbookEl.classList.remove('show-typed-mode');
      }
    }

    if (window.showToast) {
      window.showToast(mode === 'typed' ? 'मुद्रित देवनागरी टेक्स्ट मोड' : 'हस्तलिखित पन्ना मोड', '✍️', 1800);
    }
  }

  function updateActivePageMeta(index) {
    if (!allShayaris[index]) return;
    const item = allShayaris[index];

    if (pageIndicatorEl) {
      pageIndicatorEl.textContent = `सफ़ा ${index + 1} / ${allShayaris.length}`;
    }

    if (verseMoodEl) {
      verseMoodEl.textContent = item.mood;
    }

    if (verseTitleEl) {
      verseTitleEl.textContent = item.title;
    }

    // Update Favourite Button State
    updateBookmarkUI(item.id);

    // Update global voice player context
    if (window.VoicePlayer) {
      window.VoicePlayer.loadShayari(item, () => {
        // Auto-next page in diary
        if (pageFlipInstance) pageFlipInstance.flipNext();
      });
    }
  }

  // ==================== FAVOURITES / BOOKMARKS ====================
  function getFavourites() {
    try {
      const data = localStorage.getItem('shazo_favs');
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  function isFavourite(id) {
    const favs = getFavourites();
    return favs.includes(id);
  }

  function toggleFavourite(id) {
    let favs = getFavourites();
    const idx = favs.indexOf(id);
    const item = allShayaris.find(s => s.id === id);
    let nowFav = false;

    if (idx !== -1) {
      favs.splice(idx, 1);
      nowFav = false;
      if (window.showToast) window.showToast('पसंदीदा से हटाया गया', '🤍', 2000);
    } else {
      favs.push(id);
      nowFav = true;
      if (window.showToast) window.showToast(`"${item?.title || 'शेर'}" पसंदीदा में जोड़ा गया! ♥`, '💖', 2500);
    }

    localStorage.setItem('shazo_favs', JSON.stringify(favs));
    updateBookmarkUI(id);
    updateFavBadgeCount();

    // Trigger queue drawer re-render if open
    if (window.VoicePlayer && window.VoicePlayer.refreshQueue) {
      window.VoicePlayer.refreshQueue();
    }
  }

  function updateBookmarkUI(id) {
    const fav = isFavourite(id);
    if (diaryBookmarkBtn) {
      diaryBookmarkBtn.classList.toggle('active', fav);
      const heartSvg = diaryBookmarkBtn.querySelector('.heart-svg');
      if (heartSvg) {
        heartSvg.setAttribute('fill', fav ? '#f43f5e' : 'none');
        heartSvg.setAttribute('stroke', fav ? '#f43f5e' : 'currentColor');
      }
      if (diaryFavLabel) {
        diaryFavLabel.textContent = fav ? 'पसंदीदा ♥' : 'पसंद';
      }
    }

    const readerFavBtn = document.getElementById('reader-fav-btn');
    if (readerFavBtn) {
      readerFavBtn.classList.toggle('active', fav);
      const readerHeart = readerFavBtn.querySelector('.heart-svg');
      if (readerHeart) {
        readerHeart.setAttribute('fill', fav ? '#f43f5e' : 'none');
        readerHeart.setAttribute('stroke', fav ? '#f43f5e' : 'currentColor');
      }
    }
  }

  function updateFavBadgeCount() {
    const favs = getFavourites();
    const badge = document.getElementById('favs-badge-count');
    if (badge) {
      badge.textContent = favs.length;
    }
  }

  function goToShayari(shayariId) {
    const idx = allShayaris.findIndex(s => s.id === shayariId);
    if (idx !== -1 && pageFlipInstance) {
      currentPageIndex = idx;
      pageFlipInstance.flip(idx);
      updateActivePageMeta(idx);
    }
  }

  // Realistic Web Audio API paper flip rustle sound
  function playPaperSound() {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      const bufferSize = audioCtx.sampleRate * 0.14; // 140ms
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Soft filtered rustle envelope
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.28));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(280, audioCtx.currentTime + 0.14);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      noise.start();
    } catch (e) {
      // AudioContext not supported or restricted, silently continue
    }
  }

  return {
    init,
    goToShayari,
    setDisplayMode,
    isFavourite,
    toggleFavourite,
    getFavourites,
    updateBookmarkUI,
    getCurrentIndex: () => currentPageIndex
  };
})();
