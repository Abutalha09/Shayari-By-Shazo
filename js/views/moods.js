/**
 * Mood Rooms View
 * Atmospheric rooms with 5 mood themes and canvas particle animations:
 * - Rain & ripples for Judaai
 * - Glowing aura & petals for Ishq
 * - Chai steam & bokeh for Chai-wali-raatein
 * - Drifting embers & mist for Dard
 * - Golden rays & light specks for Umeed
 * Author: شازیہ (Shazo)
 */

window.MoodsView = (function() {
  let allShayaris = [];
  let currentMood = 'Ishq';
  let canvas = null;
  let ctx = null;
  let animId = null;
  let particles = [];

  // DOM Elements
  const roomContainer = document.getElementById('mood-room-container');
  const roomTitle = document.getElementById('room-title');
  const roomDesc = document.getElementById('room-desc');
  const roomCount = document.getElementById('room-count');
  const roomFxLabel = document.getElementById('room-fx-label');
  const gridEl = document.getElementById('mood-shayaris-grid');
  const chipButtons = document.querySelectorAll('.mood-chip');

  const moodConfig = {
    'Ishq': {
      title: 'इश्क़ का कमरा (Room of Love & Devotion)',
      desc: 'जहाँ मोहब्बत, इबादत और अपनों के लिए दिल की धड़कनें लफ्ज़ बन जाती हैं।',
      fx: 'गुलाबी नूर व उड़ती चमक (Soft Rose Glow)',
      accent: '#e05368',
      countLabel: 'शायरियां'
    },
    'Judaai': {
      title: 'जुदाई का कमरा (Room of Longing & Distance)',
      desc: 'दूरी, यादें और तन्हाई के वो लम्हे जो आँखों से बरसते हैं।',
      fx: 'रिमझिम बारिश की बूंदें (Rain Drops & Ripples)',
      accent: '#4e7ac7',
      countLabel: 'शायरियां'
    },
    'Dard': {
      title: 'दर्द का कमरा (Room of Heartache & Struggles)',
      desc: 'टूटे हुए दिल की टीस और ज़िंदगी के इम्तिहानों की खामोश सच्चाई।',
      fx: 'सुलगते हुए अंगारे व धुआं (Floating Embers & Mist)',
      accent: '#c06c54',
      countLabel: 'शायरियां'
    },
    'Umeed': {
      title: 'उम्मीद का कमरा (Room of Faith & Hope)',
      desc: 'अंधेरों को चीरती हुई रोशनी और सजदों में कबूल होती दुआएं।',
      fx: 'सुनहरी सुबह की किरणें (Golden Dawn Rays)',
      accent: '#e5a93b',
      countLabel: 'शायरियां'
    },
    'Chai-wali-raatein': {
      title: 'चाय वाली रातें (Late Night Tapri & Deep Thoughts)',
      desc: 'देर रात की गहरी बातें, दोस्तों की महफ़िल और कुल्हड़ की सौंधी गर्माहट।',
      fx: 'चाय की उड़ती भाप व बोकेह (Rising Chai Steam)',
      accent: '#d97d29',
      countLabel: 'शायरियां'
    }
  };

  function init(shayaris) {
    allShayaris = shayaris;
    canvas = document.getElementById('mood-ambient-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    setupCanvasResize();
    bindEvents();
    selectMood('Ishq');
  }

  function setupCanvasResize() {
    function resize() {
      if (!canvas || !roomContainer) return;
      canvas.width = roomContainer.clientWidth;
      canvas.height = roomContainer.clientHeight;
      resetParticles();
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function bindEvents() {
    chipButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const mood = btn.dataset.mood;
        selectMood(mood);
      });
    });
  }

  function selectMood(mood) {
    currentMood = mood;

    // Update Chips UI
    chipButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mood === mood);
    });

    // Update Room Banner
    const cfg = moodConfig[mood] || moodConfig['Ishq'];
    const filtered = allShayaris.filter(s => s.mood === mood);

    if (roomTitle) roomTitle.textContent = cfg.title;
    if (roomDesc) roomDesc.textContent = cfg.desc;
    if (roomCount) roomCount.textContent = `${filtered.length} ${cfg.countLabel}`;
    if (roomFxLabel) roomFxLabel.textContent = cfg.fx;

    // Render Grid
    renderGrid(filtered);

    // Reset and start animation
    resetParticles();
    startAnimation();
  }

  function renderGrid(items) {
    if (!gridEl) return;
    gridEl.innerHTML = '';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'mood-card';
      card.innerHTML = `
        <div class="mood-card-thumb">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <span class="mood-card-badge">${item.mood}</span>
          ${item.audio ? '<span class="mood-card-voice-indicator" title="आवाज़ उपलब्ध">🎙️</span>' : ''}
        </div>
        <div class="mood-card-info">
          <h4 class="mood-card-title">${item.title}</h4>
          <span class="mood-card-cta">पढ़ें व सुनें →</span>
        </div>
      `;

      card.addEventListener('click', () => {
        if (window.ModalReader) {
          window.ModalReader.open(item);
        }
      });

      gridEl.appendChild(card);
    });
  }

  // ==================== PARTICLE SYSTEMS ====================
  function resetParticles() {
    if (!canvas) return;
    particles = [];
    const count = window.innerWidth < 768 ? 40 : 80;

    for (let i = 0; i < count; i++) {
      if (currentMood === 'Judaai') {
        // Rain particles
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          len: 12 + Math.random() * 20,
          speed: 8 + Math.random() * 8,
          opacity: 0.2 + Math.random() * 0.4
        });
      } else if (currentMood === 'Ishq') {
        // Soft glowing orbs / petals
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 3 + Math.random() * 8,
          dx: (Math.random() - 0.5) * 0.8,
          dy: -0.3 - Math.random() * 0.6,
          pulse: Math.random() * Math.PI,
          pulseSpeed: 0.02 + Math.random() * 0.03
        });
      } else if (currentMood === 'Chai-wali-raatein') {
        // Rising Chai Steam curls
        particles.push({
          x: (canvas.width * 0.2) + Math.random() * (canvas.width * 0.6),
          y: canvas.height + Math.random() * 100,
          radius: 8 + Math.random() * 24,
          dy: -0.6 - Math.random() * 1.2,
          dx: (Math.random() - 0.5) * 0.6,
          opacity: 0.05 + Math.random() * 0.15,
          scale: 1,
          growth: 0.05 + Math.random() * 0.08
        });
      } else if (currentMood === 'Dard') {
        // Floating Embers
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 1.5 + Math.random() * 3.5,
          dx: (Math.random() - 0.5) * 0.5,
          dy: -0.4 - Math.random() * 0.8,
          alpha: 0.3 + Math.random() * 0.6,
          decay: 0.003 + Math.random() * 0.005
        });
      } else if (currentMood === 'Umeed') {
        // Golden Sunrise Rays & Fireflies
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: 2 + Math.random() * 5,
          dx: (Math.random() - 0.5) * 0.6,
          dy: -0.2 - Math.random() * 0.5,
          alpha: 0.2 + Math.random() * 0.7,
          twinkle: Math.random() * Math.PI
        });
      }
    }
  }

  function startAnimation() {
    if (animId) cancelAnimationFrame(animId);

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render based on active mood
      if (currentMood === 'Judaai') {
        drawRain();
      } else if (currentMood === 'Ishq') {
        drawGlowPetals();
      } else if (currentMood === 'Chai-wali-raatein') {
        drawChaiSteam();
      } else if (currentMood === 'Dard') {
        drawEmbers();
      } else if (currentMood === 'Umeed') {
        drawSunRays();
      }

      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
  }

  // 1. Rain (Judaai)
  function drawRain() {
    ctx.strokeStyle = 'rgba(120, 165, 235, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';

    particles.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - 2, p.y + p.len);
      ctx.stroke();

      p.y += p.speed;
      p.x -= 0.8;

      if (p.y > canvas.height) {
        p.y = -20;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  // 2. Soft Glow Orbs (Ishq)
  function drawGlowPetals() {
    particles.forEach(p => {
      p.pulse += p.pulseSpeed;
      const curRadius = p.radius + Math.sin(p.pulse) * 3;
      const alpha = 0.15 + Math.sin(p.pulse) * 0.15;

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, curRadius * 2);
      grad.addColorStop(0, `rgba(224, 83, 104, ${alpha * 1.5})`);
      grad.addColorStop(0.5, `rgba(212, 175, 55, ${alpha * 0.8})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, curRadius * 2, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.y < -30) {
        p.y = canvas.height + 20;
        p.x = Math.random() * canvas.width;
      }
    });
  }

  // 3. Floating Chai Steam (Chai-wali-raatein)
  function drawChaiSteam() {
    particles.forEach(p => {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * p.scale);
      grad.addColorStop(0, `rgba(217, 125, 41, ${p.opacity})`);
      grad.addColorStop(0.6, `rgba(245, 231, 178, ${p.opacity * 0.5})`);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.scale, 0, Math.PI * 2);
      ctx.fill();

      p.y += p.dy;
      p.x += p.dx + Math.sin(p.y * 0.02) * 0.5;
      p.scale += p.growth * 0.02;
      p.opacity -= 0.0006;

      if (p.y < -50 || p.opacity <= 0) {
        p.y = canvas.height + 20;
        p.x = (canvas.width * 0.2) + Math.random() * (canvas.width * 0.6);
        p.scale = 1;
        p.opacity = 0.05 + Math.random() * 0.15;
      }
    });
  }

  // 4. Drifting Embers (Dard)
  function drawEmbers() {
    particles.forEach(p => {
      ctx.fillStyle = `rgba(192, 108, 84, ${p.alpha})`;
      ctx.shadowColor = '#ff6b4a';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.dx + (Math.random() - 0.5) * 0.3;
      p.y += p.dy;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
        p.alpha = 0.3 + Math.random() * 0.6;
      }
    });
    ctx.shadowBlur = 0;
  }

  // 5. Golden Rays & Sparkles (Umeed)
  function drawSunRays() {
    // Top-left golden glow ray
    const rayGrad = ctx.createRadialGradient(canvas.width * 0.1, 0, 50, canvas.width * 0.1, 0, canvas.height);
    rayGrad.addColorStop(0, 'rgba(229, 169, 59, 0.15)');
    rayGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.05)');
    rayGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = rayGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.twinkle += 0.03;
      const alpha = 0.2 + Math.abs(Math.sin(p.twinkle)) * 0.6;

      ctx.fillStyle = `rgba(245, 231, 178, ${alpha})`;
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.y < -20) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
    });
    ctx.shadowBlur = 0;
  }

  return {
    init,
    selectMood
  };
})();

