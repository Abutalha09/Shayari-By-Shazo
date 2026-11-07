/**
 * Shayari Modal Reader Controller
 * Immersive reader modal with handwritten page zoom, voice player,
 * typed Devanagari text, copy action, WhatsApp share, favourites, and navigation.
 * Author: شازیہ (Shazo)
 */

window.ModalReader = (function() {
  'use strict';

  let allShayaris = [];
  let currentIndex = 0;

  // DOM Elements
  const modal = document.getElementById('reader-modal');
  const closeBtn = document.getElementById('reader-close-btn');
  const shareBtn = document.getElementById('reader-share-btn');
  const waBtn = document.getElementById('reader-wa-btn');
  const favBtn = document.getElementById('reader-fav-btn');
  const prevBtn = document.getElementById('reader-prev-btn');
  const nextBtn = document.getElementById('reader-next-btn');
  const counterEl = document.getElementById('reader-counter');

  const titleEl = document.getElementById('reader-title');
  const moodEl = document.getElementById('reader-mood');
  const idEl = document.getElementById('reader-id');
  const imgEl = document.getElementById('reader-image');
  const imgWrapper = document.getElementById('reader-image-wrapper');
  const typedTextEl = document.getElementById('reader-typed-text');
  const copyTextBtn = document.getElementById('reader-copy-text-btn');
  const copyTextLabel = document.getElementById('copy-text-label');

  function init(shayaris) {
    if (Array.isArray(shayaris) && shayaris.length > 0) {
      allShayaris = shayaris;
    } else if (window.SHAYARIS_DATA && window.SHAYARIS_DATA.length > 0) {
      allShayaris = window.SHAYARIS_DATA;
    }
    if (!modal) return;

    bindEvents();
  }

  function bindEvents() {
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) close();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => navigate(-1));
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => navigate(1));
    }

    // Instagram Story Card Share
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        const item = allShayaris[currentIndex];
        if (item && window.ShareCardGenerator) {
          window.ShareCardGenerator.open(item);
        }
      });
    }

    // WhatsApp Share
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const item = allShayaris[currentIndex];
        if (!item) return;
        const msg = `*${item.title}* [${item.mood}]\n\n${item.text || ''}\n\n— *شازیہ (Shazo)*\nhttps://abutalha09.vercel.app#shayari-${item.id}`;
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
      });
    }

    // Favourite / Bookmark Toggle
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        const item = allShayaris[currentIndex];
        if (item && window.DiaryView) {
          window.DiaryView.toggleFavourite(item.id);
          updateFavIcon(item.id);
        }
      });
    }

    // Toggle image zoom
    if (imgWrapper) {
      imgWrapper.addEventListener('click', () => {
        imgWrapper.classList.toggle('zoomed');
      });
    }

    // Copy typed text
    if (copyTextBtn) {
      copyTextBtn.addEventListener('click', copyText);
    }

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;

      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowLeft') {
        navigate(-1);
      } else if (e.key === 'ArrowRight') {
        navigate(1);
      } else if (e.key === 'f' || e.key === 'F') {
        const item = allShayaris[currentIndex];
        if (item && window.DiaryView) {
          window.DiaryView.toggleFavourite(item.id);
          updateFavIcon(item.id);
        }
      } else if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (window.VoicePlayer) window.VoicePlayer.togglePlay();
      }
    });
  }

  function open(shayari) {
    const idx = typeof shayari === 'number' 
      ? allShayaris.findIndex(s => s.id === shayari) 
      : allShayaris.findIndex(s => s.id === shayari.id);

    if (idx === -1) return;
    currentIndex = idx;
    displayShayari(allShayaris[currentIndex]);

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Update URL hash without jumping
    if (history.replaceState) {
      history.replaceState(null, null, `#shayari-${allShayaris[currentIndex].id}`);
    }
  }

  function close() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (imgWrapper) imgWrapper.classList.remove('zoomed');

    // Pause audio when closing modal
    if (window.VoicePlayer) {
      window.VoicePlayer.pause();
    }

    // Clean hash
    if (history.replaceState) {
      history.replaceState(null, null, window.location.pathname);
    }
  }

  function navigate(direction) {
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = allShayaris.length - 1;
    if (newIndex >= allShayaris.length) newIndex = 0;

    currentIndex = newIndex;
    const item = allShayaris[currentIndex];
    displayShayari(item);

    // Auto-play if playing previously
    if (window.VoicePlayer && window.VoicePlayer.isAutoPlayNext()) {
      window.VoicePlayer.playCurrent();
    }

    // Update URL hash
    if (history.replaceState) {
      history.replaceState(null, null, `#shayari-${item.id}`);
    }
  }

  function displayShayari(item) {
    if (!item) return;

    if (titleEl) titleEl.textContent = item.title;
    if (moodEl) moodEl.textContent = item.mood;
    if (idEl) idEl.textContent = `#${String(item.id).padStart(2, '0')}`;
    if (counterEl) counterEl.textContent = `${currentIndex + 1} / ${allShayaris.length}`;

    if (imgEl) {
      imgEl.onerror = function() {
        if (item.fallbackImage && !imgEl.src.endsWith(item.fallbackImage)) {
          imgEl.src = item.fallbackImage;
        }
      };
      imgEl.src = item.image;
      imgEl.alt = `${item.title} - شازیہ handwritten shayari`;
    }
    if (imgWrapper) imgWrapper.classList.remove('zoomed');

    // Typed Text
    if (typedTextEl) {
      if (item.text && item.text.trim()) {
        const formatted = item.text
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean)
          .map(l => `<p class="poetry-line">${l}</p>`)
          .join('');
        typedTextEl.innerHTML = formatted;
      } else {
        typedTextEl.innerHTML = `<p class="poetry-empty-note">ऊपर दिए गए हस्तलिखित पन्ने का आनंद लें।</p>`;
      }
    }

    // Update Favourite Icon
    updateFavIcon(item.id);

    // Load into Voice Player
    if (window.VoicePlayer) {
      window.VoicePlayer.loadShayari(item, () => {
        navigate(1);
      });
    }
  }

  function updateFavIcon(id) {
    if (!favBtn) return;
    const isFav = window.DiaryView ? window.DiaryView.isFavourite(id) : false;
    favBtn.classList.toggle('active', isFav);
    const heart = favBtn.querySelector('.heart-svg');
    if (heart) {
      heart.setAttribute('fill', isFav ? '#f43f5e' : 'none');
      heart.setAttribute('stroke', isFav ? '#f43f5e' : 'currentColor');
    }
  }

  function copyText() {
    const item = allShayaris[currentIndex];
    if (!item) return;

    const shareContent = item.text 
      ? `"${item.title}"\n\n${item.text}\n\n— شازیہ (Shazo)\nhttps://abutalha09.vercel.app`
      : `"${item.title}" — شازیہ (Shazo)\nhttps://abutalha09.vercel.app#shayari-${item.id}`;

    navigator.clipboard.writeText(shareContent).then(() => {
      if (copyTextLabel) {
        copyTextLabel.textContent = 'नक़ल हो गया! ✓';
        setTimeout(() => { copyTextLabel.textContent = 'नक़ल करें (Copy)'; }, 2000);
      }
      if (window.showToast) {
        window.showToast('शेर की तहरीर कॉपी हो गई!', '📋');
      }
    }).catch(() => {
      prompt('Copy text:', shareContent);
    });
  }

  return {
    init,
    open,
    close,
    getCurrentIndex: () => currentIndex
  };
})();
