/**
 * Audio Player & AI Voice Narration Controller
 * Inspired by busdriver.wtf — Clean, professional floating player dock,
 * expandable queue drawer playlist, keyboard shortcuts, and live night highway clock.
 * Supports both recorded audio files AND AI Text-to-Speech narration.
 * Author: شازیہ (Shazo) • Portfolio: abutalha09.vercel.app
 */

window.VoicePlayer = (function() {
  'use strict';

  const audioEl = document.getElementById('global-voice-audio');
  let allShayaris = [];
  let currentIndex = 0;
  let currentShayari = null;
  let onTrackEndedCallback = null;
  let isPlaying = false;
  let autoPlayNext = true;
  let animFrameId = null;

  // Mode: 'real' (MP3 file) or 'ai' (Text-to-Speech)
  let activeMode = 'ai';
  let speechSynth = window.speechSynthesis || null;
  let currentUtterance = null;
  let hindiVoice = null;
  let speechRate = 0.88; // Poetic reading pace

  // Queue state
  let currentFilter = 'all';
  let searchQuery = '';

  // DOM Elements - Modal Player
  const diaryPlayBtn = document.getElementById('diary-play-btn');
  const voicePlayCircle = document.getElementById('voice-play-circle');
  const voicePlaySymbol = document.getElementById('voice-play-symbol');
  const voicePlayerBar = document.getElementById('voice-player-bar');
  const voiceScrubber = document.getElementById('voice-scrubber');
  const voiceTimeCurr = document.getElementById('voice-time-curr');
  const voiceTimeDur = document.getElementById('voice-time-dur');
  const voiceAutoNextToggle = document.getElementById('voice-autoplay-next');
  const waveBars = document.querySelectorAll('.waveform-container .wave-bar');
  const btnModeAi = document.getElementById('btn-mode-ai');
  const btnModeReal = document.getElementById('btn-mode-real');
  const speedChipSlow = document.getElementById('speed-chip-slow');
  const speedChipNorm = document.getElementById('speed-chip-norm');
  const voiceStatusText = document.getElementById('voice-status-text');

  // DOM Elements - BusDriver Floating Dock
  const floatingDock = document.getElementById('floating-dock');
  const dockPlayBtn = document.getElementById('dock-play-btn');
  const dockPlayIcon = document.getElementById('dock-play-icon');
  const dockPrevBtn = document.getElementById('dock-prev-btn');
  const dockNextBtn = document.getElementById('dock-next-btn');
  const dockAvatarBtn = document.getElementById('dock-avatar-btn');
  const dockDisc = document.getElementById('dock-disc');
  const dockThumb = document.getElementById('dock-thumb');
  const dockTitle = document.getElementById('dock-title');
  const dockMood = document.getElementById('dock-mood');
  const dockModeIndicator = document.getElementById('dock-mode-indicator');
  const dockScrubber = document.getElementById('dock-scrubber');
  const dockProgressFill = document.getElementById('dock-progress-fill');
  const dockTimeCurr = document.getElementById('dock-time-curr');
  const dockTimeDur = document.getElementById('dock-time-dur');
  const dockQueueBtn = document.getElementById('dock-queue-btn');
  const dockExpandBtn = document.getElementById('dock-expand-btn');
  const dockCollapseBtn = document.getElementById('dock-collapse-btn');

  // DOM Elements - Queue Drawer
  const queueDrawer = document.getElementById('queue-drawer');
  const queueCloseBtn = document.getElementById('queue-close-btn');
  const queueTrackList = document.getElementById('queue-track-list');
  const queueSearchInput = document.getElementById('queue-search-input');
  const queueSearchClear = document.getElementById('queue-search-clear');
  const queueShuffleBtn = document.getElementById('queue-shuffle-btn');
  const queueShareBtn = document.getElementById('queue-share-btn');
  const queueBadge = document.getElementById('queue-badge');
  const routePills = document.querySelectorAll('.route-pill');

  // Hero Actions
  const btnHeroPlay = document.getElementById('btn-hero-play');
  const btnHeroRandom = document.getElementById('btn-hero-random');
  const btnHeroAbout = document.getElementById('btn-hero-about');

  function init(shayaris) {
    if (Array.isArray(shayaris) && shayaris.length > 0) {
      allShayaris = shayaris;
    } else if (window.SHAYARIS_DATA && window.SHAYARIS_DATA.length > 0) {
      allShayaris = window.SHAYARIS_DATA;
    }

    initSpeechSynthesis();
    initClock();

    // Load auto-next preference
    const savedAutoNext = localStorage.getItem('shazo_auto_next');
    if (savedAutoNext !== null) {
      autoPlayNext = savedAutoNext === 'true';
    }
    if (voiceAutoNextToggle) {
      voiceAutoNextToggle.checked = autoPlayNext;
      voiceAutoNextToggle.addEventListener('change', (e) => {
        autoPlayNext = e.target.checked;
        localStorage.setItem('shazo_auto_next', autoPlayNext);
      });
    }

    // Restore player mini mode if previously collapsed
    if (localStorage.getItem('shazo_player_mini') === 'true' && floatingDock) {
      floatingDock.classList.add('is-mini');
      const iconMin = floatingDock.querySelector('.icon-minimize');
      const iconMax = floatingDock.querySelector('.icon-maximize');
      if (iconMin) iconMin.style.display = 'none';
      if (iconMax) iconMax.style.display = 'inline-block';
    }

    bindAudioEvents();
    bindDockEvents();
    bindQueueEvents();
    bindHeroEvents();
    bindKeyboardShortcuts();

    renderQueueList();

    // Default load first track or daily track into dock
    if (allShayaris.length > 0 && !currentShayari) {
      loadShayari(allShayaris[0]);
    }
  }

  // ==================== MEANINGFUL TIME GREETING CLOCK ====================
  function initClock() {
    const greetingEl = document.getElementById('clock-greeting');
    const timeEl = document.getElementById('clock-time');
    const liveClock = document.getElementById('live-clock');
    if (!liveClock) return;

    function tick() {
      const now = new Date();
      const rawHours = now.getHours();
      const mins = String(now.getMinutes()).padStart(2, '0');
      const ampm = rawHours >= 12 ? 'PM' : 'AM';
      const displayHours = rawHours % 12 || 12;

      let greeting = 'रात के शेर';
      let icon = '🌙';

      if (rawHours >= 4 && rawHours < 8) {
        greeting = 'सहर के शेर';
        icon = '🌅';
      } else if (rawHours >= 8 && rawHours < 12) {
        greeting = 'सुबह के शेर';
        icon = '☀️';
      } else if (rawHours >= 12 && rawHours < 16) {
        greeting = 'दोपहर के शेर';
        icon = '🌤️';
      } else if (rawHours >= 16 && rawHours < 19) {
        greeting = 'शाम व चाय';
        icon = '☕';
      } else if (rawHours >= 19 && rawHours < 23) {
        greeting = 'रात के शेर';
        icon = '🌙';
      } else {
        greeting = 'आधी रात के ख़याल';
        icon = '🌌';
      }

      if (greetingEl) greetingEl.textContent = `${icon} ${greeting}`;
      if (timeEl) timeEl.textContent = `${displayHours}:${mins} ${ampm}`;
    }

    tick();
    setInterval(tick, 1000);
  }

  // ==================== AUDIO ELEMENT (REAL VOICE) ====================
  function bindAudioEvents() {
    if (!audioEl) return;

    audioEl.addEventListener('play', () => {
      if (activeMode === 'real') {
        isPlaying = true;
        updateUI();
        startWaveformAnimation();
      }
    });

    audioEl.addEventListener('pause', () => {
      if (activeMode === 'real') {
        isPlaying = false;
        updateUI();
        stopWaveformAnimation();
      }
    });

    audioEl.addEventListener('timeupdate', () => {
      if (activeMode !== 'real' || !audioEl.duration) return;
      const percent = (audioEl.currentTime / audioEl.duration) * 100;
      updateProgressUI(percent, audioEl.currentTime, audioEl.duration);
    });

    audioEl.addEventListener('loadedmetadata', () => {
      if (activeMode === 'real') {
        const durStr = formatTime(audioEl.duration);
        if (voiceTimeDur) voiceTimeDur.textContent = durStr;
        if (dockTimeDur) dockTimeDur.textContent = durStr;
      }
    });

    audioEl.addEventListener('ended', () => {
      if (activeMode === 'real') {
        handlePlaybackEnded();
      }
    });
  }

  // ==================== TEXT-TO-SPEECH (AI NATURAL HINDI) ====================
  function initSpeechSynthesis() {
    if (!speechSynth) {
      console.warn('Web Speech API not supported in this browser.');
      return;
    }

    function findBestVoice() {
      const voices = speechSynth.getVoices();
      if (!voices.length) return;

      // Select most expressive Hindi voice
      hindiVoice = voices.find(v => v.lang === 'hi-IN' || v.lang === 'hi_IN') ||
                   voices.find(v => v.lang.startsWith('hi')) ||
                   voices.find(v => v.lang.startsWith('ur')) ||
                   voices.find(v => v.lang.includes('IN')) ||
                   voices[0];
    }

    findBestVoice();
    if (speechSynth.onvoiceschanged !== undefined) {
      speechSynth.onvoiceschanged = findBestVoice;
    }
  }

  let progressTimer = null;
  let estimatedDuration = 12;

  function speakText(text) {
    if (!speechSynth) {
      if (window.showToast) window.showToast('आपके ब्राउज़र में आवाज़ (TTS) सपोर्ट नहीं है।', '⚠️');
      return;
    }

    stopSpeech();

    if (!text || !text.trim()) {
      if (window.showToast) window.showToast('इस शेर की मुद्रित तहरीर उपलब्ध नहीं है।', 'ℹ️');
      return;
    }

    const cleanText = text
      .replace(/[•\-\d+\.]/g, ' ')
      .replace(/[\(\)\[\]\{\}]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    currentUtterance = new SpeechSynthesisUtterance(cleanText);
    if (hindiVoice) currentUtterance.voice = hindiVoice;
    currentUtterance.lang = hindiVoice ? hindiVoice.lang : 'hi-IN';
    currentUtterance.rate = speechRate;
    currentUtterance.pitch = 1.0;

    // Estimate duration for progress animation
    const words = cleanText.split(/\s+/).length;
    estimatedDuration = Math.max(5, (words / 2.2) * (1 / speechRate));
    let elapsed = 0;

    currentUtterance.onstart = () => {
      isPlaying = true;
      updateUI();
      startWaveformAnimation();
      if (window.showToast) window.showToast(`✨ शेर #${String(currentShayari.id).padStart(2,'0')} सुनाया जा रहा है`, '🎙️');

      clearInterval(progressTimer);
      progressTimer = setInterval(() => {
        if (!isPlaying || activeMode !== 'ai') {
          clearInterval(progressTimer);
          return;
        }
        elapsed += 0.2;
        const pct = Math.min(100, (elapsed / estimatedDuration) * 100);
        updateProgressUI(pct, elapsed, estimatedDuration);
      }, 200);
    };

    currentUtterance.onend = () => {
      clearInterval(progressTimer);
      handlePlaybackEnded();
    };

    currentUtterance.onerror = (e) => {
      clearInterval(progressTimer);
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e);
      }
      isPlaying = false;
      updateUI();
      stopWaveformAnimation();
    };

    speechSynth.speak(currentUtterance);
  }

  function stopSpeech() {
    clearInterval(progressTimer);
    if (speechSynth && (speechSynth.speaking || speechSynth.pending)) {
      speechSynth.cancel();
    }
  }

  function handlePlaybackEnded() {
    isPlaying = false;
    updateUI();
    stopWaveformAnimation();
    updateProgressUI(0, 0, 0);

    if (autoPlayNext) {
      setTimeout(() => {
        navigateTrack(1);
      }, 700);
    }
  }

  // ==================== DOCK & CONTROLS BINDING ====================
  function bindDockEvents() {
    // Dock Play/Pause
    if (dockPlayBtn) {
      dockPlayBtn.addEventListener('click', togglePlay);
    }

    // Modal Play/Pause
    if (voicePlayCircle) {
      voicePlayCircle.addEventListener('click', togglePlay);
    }

    // Diary Play/Pause
    if (diaryPlayBtn) {
      diaryPlayBtn.addEventListener('click', togglePlay);
    }

    // Previous / Next in Dock
    if (dockPrevBtn) {
      dockPrevBtn.addEventListener('click', () => navigateTrack(-1));
    }
    if (dockNextBtn) {
      dockNextBtn.addEventListener('click', () => navigateTrack(1));
    }

    // Avatar click -> Open reader modal
    if (dockAvatarBtn) {
      dockAvatarBtn.addEventListener('click', openCurrentInReader);
    }
    if (dockExpandBtn) {
      dockExpandBtn.addEventListener('click', openCurrentInReader);
    }
    if (dockCollapseBtn) {
      dockCollapseBtn.addEventListener('click', toggleMiniMode);
    }

    // Dock Scrubber seeking
    if (dockScrubber) {
      dockScrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (dockProgressFill) dockProgressFill.style.width = `${val}%`;
        if (activeMode === 'real' && audioEl && audioEl.duration) {
          const seek = (val / 100) * audioEl.duration;
          if (dockTimeCurr) dockTimeCurr.textContent = formatTime(seek);
        }
      });

      dockScrubber.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (activeMode === 'real' && audioEl && audioEl.duration) {
          audioEl.currentTime = (val / 100) * audioEl.duration;
        }
      });
    }

    // Modal Scrubber
    if (voiceScrubber) {
      voiceScrubber.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        if (activeMode === 'real' && audioEl && audioEl.duration) {
          const seek = (val / 100) * audioEl.duration;
          if (voiceTimeCurr) voiceTimeCurr.textContent = formatTime(seek);
        }
      });

      voiceScrubber.addEventListener('change', (e) => {
        const val = parseFloat(e.target.value);
        if (activeMode === 'real' && audioEl && audioEl.duration) {
          audioEl.currentTime = (val / 100) * audioEl.duration;
        }
      });
    }

    // Voice mode switches (AI vs Real)
    if (btnModeAi) {
      btnModeAi.addEventListener('click', () => setMode('ai'));
    }
    if (btnModeReal) {
      btnModeReal.addEventListener('click', () => {
        if (currentShayari && currentShayari.audio) {
          setMode('real');
        } else {
          if (window.showToast) {
            window.showToast('इस शेर की असली रिकॉर्डिंग अभी नहीं है। AI आवाज़ उपलब्ध है।', 'ℹ️');
          }
          setMode('ai');
        }
      });
    }

    // Speed chips
    if (speedChipSlow) {
      speedChipSlow.addEventListener('click', () => {
        speechRate = 0.85;
        speedChipSlow.classList.add('active');
        if (speedChipNorm) speedChipNorm.classList.remove('active');
        if (isPlaying && activeMode === 'ai') {
          speakText(currentShayari.text || currentShayari.title);
        }
      });
    }
    if (speedChipNorm) {
      speedChipNorm.addEventListener('click', () => {
        speechRate = 1.0;
        speedChipNorm.classList.add('active');
        if (speedChipSlow) speedChipSlow.classList.remove('active');
        if (isPlaying && activeMode === 'ai') {
          speakText(currentShayari.text || currentShayari.title);
        }
      });
    }
  }

  // ==================== QUEUE DRAWER & ROUTE FILTERS ====================
  function bindQueueEvents() {
    if (dockQueueBtn) {
      dockQueueBtn.addEventListener('click', toggleQueueDrawer);
    }

    if (queueCloseBtn) {
      queueCloseBtn.addEventListener('click', closeQueueDrawer);
    }

    // Close when clicking outside drawer
    document.addEventListener('click', (e) => {
      if (queueDrawer && queueDrawer.classList.contains('open')) {
        if (!queueDrawer.contains(e.target) && !dockQueueBtn.contains(e.target)) {
          closeQueueDrawer();
        }
      }
    });

    // Route mood filter pills
    routePills.forEach(pill => {
      pill.addEventListener('click', () => {
        routePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.dataset.filter;
        renderQueueList();
      });
    });

    // Real-time search
    if (queueSearchInput) {
      queueSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase().trim();
        if (queueSearchClear) {
          queueSearchClear.style.display = searchQuery ? 'inline-flex' : 'none';
        }
        renderQueueList();
      });
    }

    if (queueSearchClear) {
      queueSearchClear.addEventListener('click', () => {
        if (queueSearchInput) {
          queueSearchInput.value = '';
          searchQuery = '';
          queueSearchClear.style.display = 'none';
          renderQueueList();
          queueSearchInput.focus();
        }
      });
    }

    // Shuffle button in drawer
    if (queueShuffleBtn) {
      queueShuffleBtn.addEventListener('click', () => {
        playRandom();
      });
    }

    // Share from drawer
    if (queueShareBtn) {
      queueShareBtn.addEventListener('click', () => {
        if (currentShayari && window.ShareCardGenerator) {
          window.ShareCardGenerator.open(currentShayari);
        }
      });
    }
  }

  function toggleQueueDrawer() {
    if (!queueDrawer) return;
    const isOpen = queueDrawer.classList.contains('open');
    if (isOpen) {
      closeQueueDrawer();
    } else {
      openQueueDrawer();
    }
  }

  function openQueueDrawer() {
    if (!queueDrawer) return;
    queueDrawer.classList.add('open');
    queueDrawer.setAttribute('aria-hidden', 'false');
    if (dockQueueBtn) dockQueueBtn.classList.add('active');
    scrollToActiveQueueTrack();
  }

  function closeQueueDrawer() {
    if (!queueDrawer) return;
    queueDrawer.classList.remove('open');
    queueDrawer.setAttribute('aria-hidden', 'true');
    if (dockQueueBtn) dockQueueBtn.classList.remove('active');
  }

  function renderQueueList() {
    if (!queueTrackList) return;
    queueTrackList.innerHTML = '';

    const favs = window.DiaryView ? window.DiaryView.getFavourites() : [];

    const filtered = allShayaris.filter(item => {
      const matchesMood = currentFilter === 'all'
        ? true
        : (currentFilter === 'favs' ? favs.includes(item.id) : item.mood === currentFilter);

      const matchesSearch = !searchQuery || 
        item.title.toLowerCase().includes(searchQuery) || 
        (item.text && item.text.toLowerCase().includes(searchQuery)) ||
        item.mood.toLowerCase().includes(searchQuery);
      return matchesMood && matchesSearch;
    });

    if (queueBadge) {
      queueBadge.textContent = `${filtered.length} शे'र`;
    }

    if (filtered.length === 0) {
      const emptyLi = document.createElement('li');
      emptyLi.className = 'queue-empty-state';
      emptyLi.textContent = currentFilter === 'favs' 
        ? 'अभी कोई शेर पसंदीदा में नहीं जोड़ा गया। दिल (♥) दबाकर जोड़ें।' 
        : 'कोई शेर नहीं मिला। दूसरा उनवान खोजें।';
      queueTrackList.appendChild(emptyLi);
      return;
    }

    filtered.forEach((item) => {
      const isCurrent = currentShayari && currentShayari.id === item.id;
      const isFav = favs.includes(item.id);
      const li = document.createElement('li');
      li.className = `queue-track-item ${isCurrent ? 'active' : ''} ${isCurrent && isPlaying ? 'playing' : ''}`;
      li.dataset.id = item.id;

      li.innerHTML = `
        <div class="track-left-col">
          <span class="track-num">${String(item.id).padStart(2, '0')}</span>
          <div class="track-eq">
            <span></span><span></span><span></span>
          </div>
          <div class="track-thumb-box">
            <img src="${item.image}" alt="${item.title}" loading="lazy">
          </div>
        </div>
        <div class="track-meta">
          <h4 class="track-title">${item.title}</h4>
          <span class="track-mood">${item.mood}</span>
        </div>
        <div class="track-right-col">
          <button class="track-fav-icon-btn ${isFav ? 'is-fav' : ''}" title="${isFav ? 'पसंदीदा से हटाएं' : 'पसंदीदा में जोड़ें'}" aria-label="Favourite">
            ${isFav ? '♥' : '♡'}
          </button>
          <button class="track-play-btn" title="सुने (Play)">
            ${isCurrent && isPlaying ? '⏸' : '▶'}
          </button>
        </div>
      `;

      // Favourite toggle inside queue track
      const trackFav = li.querySelector('.track-fav-icon-btn');
      if (trackFav) {
        trackFav.addEventListener('click', (e) => {
          e.stopPropagation();
          if (window.DiaryView) {
            window.DiaryView.toggleFavourite(item.id);
            renderQueueList();
          }
        });
      }

      li.addEventListener('click', () => {
        if (currentShayari && currentShayari.id === item.id) {
          togglePlay();
        } else {
          loadShayari(item);
          playCurrent();
        }
      });

      queueTrackList.appendChild(li);
    });
  }

  function scrollToActiveQueueTrack() {
    if (!queueTrackList) return;
    const activeEl = queueTrackList.querySelector('.queue-track-item.active');
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  // ==================== HERO SECTION BINDING ====================
  function bindHeroEvents() {
    if (btnHeroPlay) {
      btnHeroPlay.addEventListener('click', () => {
        if (!currentShayari && allShayaris.length > 0) {
          loadShayari(allShayaris[0]);
        }
        playCurrent();
      });
    }

    if (btnHeroRandom) {
      btnHeroRandom.addEventListener('click', playRandom);
    }

    if (btnHeroAbout) {
      btnHeroAbout.addEventListener('click', () => {
        const aboutModal = document.getElementById('about-modal');
        if (aboutModal) {
          aboutModal.classList.add('active');
          aboutModal.setAttribute('aria-hidden', 'false');
        }
      });
    }
  }

  function toggleMiniMode() {
    if (!floatingDock) return;
    const isMini = floatingDock.classList.toggle('is-mini');
    localStorage.setItem('shazo_player_mini', isMini ? 'true' : 'false');
    const iconMin = floatingDock.querySelector('.icon-minimize');
    const iconMax = floatingDock.querySelector('.icon-maximize');
    if (iconMin) iconMin.style.display = isMini ? 'none' : 'inline-block';
    if (iconMax) iconMax.style.display = isMini ? 'inline-block' : 'none';
    if (window.showToast) {
      window.showToast(isMini ? 'प्लेयर मिनी मोड में है (Mini Player)' : 'प्लेयर बड़ा किया गया', '🎵', 2000);
    }
  }

  // ==================== KEYBOARD SHORTCUTS ====================
  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        navigateTrack(1);
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        navigateTrack(-1);
      } else if (e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        toggleQueueDrawer();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMiniMode();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        playRandom();
      } else if (e.key === 'Escape') {
        closeQueueDrawer();
      }
    });
  }

  // ==================== TRACK LOADING & NAVIGATION ====================
  function loadShayari(shayari, onEnded) {
    if (!shayari) return;
    onTrackEndedCallback = onEnded || null;

    const idx = allShayaris.findIndex(s => s.id === shayari.id);
    if (idx !== -1) currentIndex = idx;

    if (currentShayari && currentShayari.id === shayari.id) {
      updateUI();
      return;
    }

    pause();
    currentShayari = shayari;

    const hasRealAudio = !!shayari.audio;
    if (hasRealAudio) {
      activeMode = 'real';
      if (audioEl) {
        audioEl.src = shayari.audio;
        audioEl.load();
      }
    } else {
      activeMode = 'ai';
      if (audioEl) audioEl.removeAttribute('src');
    }

    updateProgressUI(0, 0, 0);
    updateUI();
    renderQueueList();

    // Sync other modules
    if (window.DiaryView && typeof window.DiaryView.goToShayari === 'function') {
      window.DiaryView.goToShayari(shayari.id);
    }
  }

  function navigateTrack(direction) {
    if (!allShayaris.length) return;
    let nextIdx = currentIndex + direction;
    if (nextIdx < 0) nextIdx = allShayaris.length - 1;
    if (nextIdx >= allShayaris.length) nextIdx = 0;

    const target = allShayaris[nextIdx];
    loadShayari(target);
    playCurrent();
  }

  function playRandom() {
    if (!allShayaris.length) return;
    const rIdx = Math.floor(Math.random() * allShayaris.length);
    const target = allShayaris[rIdx];
    loadShayari(target);
    playCurrent();

    if (window.showToast) {
      window.showToast(`🎲 रैंडम शेर: "${target.title}"`, '✨');
    }
  }

  function togglePlay() {
    if (!currentShayari && allShayaris.length > 0) {
      loadShayari(allShayaris[0]);
    }
    if (!currentShayari) return;

    if (isPlaying) {
      pause();
    } else {
      playCurrent();
    }
  }

  function playCurrent() {
    if (!currentShayari) return;

    if (activeMode === 'real' && currentShayari.audio) {
      if (audioEl) {
        audioEl.play().catch(err => {
          console.warn('Real audio play failed, falling back to AI voice:', err);
          activeMode = 'ai';
          speakText(currentShayari.text || currentShayari.title);
        });
      }
    } else {
      activeMode = 'ai';
      const speechContent = currentShayari.text && currentShayari.text.trim().length > 0 
        ? currentShayari.text 
        : currentShayari.title;
      speakText(speechContent);
    }
  }

  function pause() {
    isPlaying = false;
    if (audioEl && !audioEl.paused) audioEl.pause();
    stopSpeech();
    updateUI();
    stopWaveformAnimation();
  }

  function setMode(mode) {
    if (activeMode === mode) return;
    pause();
    activeMode = mode;
    updateUI();
    if (window.showToast) {
      window.showToast(mode === 'ai' ? '✨ AI पाठ मोड चुना गया' : '🎙️ शारजो की आवाज़ मोड चुना गया', '🎧');
    }
  }

  function openCurrentInReader() {
    if (currentShayari && window.ModalReader) {
      window.ModalReader.open(currentShayari);
    }
  }

  // ==================== UI STATE SYNCHRONIZATION ====================
  function updateUI() {
    const hasRealAudio = !!(currentShayari && currentShayari.audio);
    const titleText = currentShayari ? currentShayari.title : 'शायरी by Shazo';
    const moodText = currentShayari ? currentShayari.mood : 'इश्क़';
    const thumbSrc = currentShayari ? currentShayari.image : 'images/01.webp';

    // 1. Floating Dock
    if (dockTitle) dockTitle.textContent = titleText;
    if (dockMood) dockMood.textContent = moodText;
    if (dockThumb) dockThumb.src = thumbSrc;
    if (dockPlayIcon) dockPlayIcon.textContent = isPlaying ? '⏸' : '▶';

    if (dockDisc) {
      dockDisc.classList.toggle('spinning', isPlaying);
    }

    if (dockModeIndicator) {
      dockModeIndicator.textContent = activeMode === 'real' ? '🎙️ असली आवाज़' : '✨ AI पाठ';
    }

    // 2. Modal Reader UI
    if (voicePlaySymbol) voicePlaySymbol.textContent = isPlaying ? '⏸' : '▶';
    if (voicePlayerBar) voicePlayerBar.classList.toggle('playing', isPlaying);

    if (btnModeAi) btnModeAi.classList.toggle('active', activeMode === 'ai');
    if (btnModeReal) {
      btnModeReal.classList.toggle('active', activeMode === 'real');
      btnModeReal.classList.toggle('disabled', !hasRealAudio);
    }

    if (voiceStatusText) {
      if (isPlaying) {
        voiceStatusText.innerHTML = activeMode === 'ai' 
          ? `<strong>✨ AI पाठ जारी है...</strong> शायरी की पंक्तियाँ सहज आवाज़ में सुनी जा रही हैं।`
          : `<strong>🎙️ शारजो की आवाज़ चल रही है...</strong>`;
      } else {
        voiceStatusText.innerHTML = activeMode === 'ai'
          ? `यदि आप पढ़ना नहीं चाहते, तो <strong>प्ले (▶) बटन</strong> दबाएं — यह शेर आपके लिए अपने आप पढ़ा जाएगा।`
          : `शारजो की असली आवाज़ रिकॉर्डिंग सुनने के लिए <strong>प्ले (▶)</strong> दबाएं।`;
      }
    }

    // 3. Diary Pill
    if (diaryPlayBtn) {
      diaryPlayBtn.classList.toggle('playing', isPlaying);
      const textSpan = diaryPlayBtn.querySelector('.play-text');
      const iconSpan = diaryPlayBtn.querySelector('.play-icon');
      if (textSpan) {
        textSpan.textContent = isPlaying 
          ? (activeMode === 'real' ? 'आवाज़ बज रही है...' : 'AI शेर पढ़ रहा है...') 
          : (hasRealAudio ? 'शारजो की आवाज़ सुनें' : 'शायरी सुनें (AI आवाज़)');
      }
      if (iconSpan) iconSpan.textContent = isPlaying ? '⏸' : '▶';
    }

    // 4. Hero Button
    if (btnHeroPlay) {
      const heroIcon = btnHeroPlay.querySelector('.pill-icon');
      const heroText = btnHeroPlay.querySelector('.pill-text');
      if (heroIcon) heroIcon.textContent = isPlaying ? '⏸' : '▶';
      if (heroText) heroText.textContent = isPlaying ? 'रोकें (Pause)' : 'शेर सुनें (Play)';
    }

    // 5. Update items in Queue
    const activeItems = document.querySelectorAll('.queue-track-item');
    activeItems.forEach(item => {
      const itemId = parseInt(item.dataset.id, 10);
      const isCur = currentShayari && currentShayari.id === itemId;
      item.classList.toggle('active', isCur);
      item.classList.toggle('playing', isCur && isPlaying);
      const btn = item.querySelector('.track-play-btn');
      if (btn) btn.textContent = isCur && isPlaying ? '⏸' : '▶';
    });
  }

  function updateProgressUI(percent, currSec, durSec) {
    // Dock Progress
    if (dockProgressFill) dockProgressFill.style.width = `${percent}%`;
    if (dockScrubber && !dockScrubber.matches(':active')) {
      dockScrubber.value = percent;
    }
    if (dockTimeCurr) dockTimeCurr.textContent = formatTime(currSec);
    if (dockTimeDur) {
      dockTimeDur.textContent = activeMode === 'real' && durSec ? formatTime(durSec) : 'AI पाठ';
    }

    // Modal Progress
    if (voiceScrubber && !voiceScrubber.matches(':active')) {
      voiceScrubber.value = percent;
    }
    if (voiceTimeCurr) voiceTimeCurr.textContent = formatTime(currSec);
    if (voiceTimeDur) {
      voiceTimeDur.textContent = activeMode === 'real' && durSec ? formatTime(durSec) : 'AI पाठ';
    }
  }

  function startWaveformAnimation() {
    stopWaveformAnimation();
    let tick = 0;

    function renderWaves() {
      if (!isPlaying) return;
      tick += 0.16;
      waveBars.forEach((bar, index) => {
        const height = 4 + Math.abs(Math.sin(tick + index * 0.45)) * 18 + Math.cos(tick * 0.85 + index * 0.3) * 5;
        bar.style.height = `${Math.min(26, Math.max(3, height))}px`;
      });
      animFrameId = requestAnimationFrame(renderWaves);
    }
    animFrameId = requestAnimationFrame(renderWaves);
  }

  function stopWaveformAnimation() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    waveBars.forEach(bar => {
      bar.style.height = '4px';
    });
  }

  function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  return {
    init,
    loadShayari,
    togglePlay,
    playCurrent,
    pause,
    playNext: () => navigateTrack(1),
    playPrev: () => navigateTrack(-1),
    playRandom,
    toggleQueueDrawer,
    openQueueDrawer,
    closeQueueDrawer,
    refreshQueue: renderQueueList,
    toggleMiniMode,
    isMini: () => floatingDock && floatingDock.classList.contains('is-mini'),
    isPlaying: () => isPlaying,
    getCurrentShayari: () => currentShayari,
    getCurrentIndex: () => currentIndex,
    setRate: (rate) => { speechRate = rate; }
  };
})();
