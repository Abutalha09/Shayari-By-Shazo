/**
 * Midnight Sky View (Interactive Constellations)
 * Each shayari is a twinkling star on a dark cosmic sky.
 * Stars of the same mood form linked constellations.
 * Tapping a star opens that shayari in the reader modal.
 * Author: شازیہ (Shazo)
 */

window.SkyView = (function() {
  let allShayaris = [];
  let canvas = null;
  let ctx = null;
  let animId = null;
  let container = null;

  let stars = [];
  let bgDistantStars = [];
  let shootingStars = [];
  let hoveredStar = null;
  let activeConstellationMood = null;

  // Pan / Drag State
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;

  // DOM Elements
  const tooltip = document.getElementById('sky-tooltip');
  const tooltipMood = document.getElementById('tooltip-mood');
  const tooltipTitle = document.getElementById('tooltip-title');
  const legendItems = document.querySelectorAll('.legend-item');

  const moodColors = {
    'Ishq': '#e05368',
    'Judaai': '#4e7ac7',
    'Dard': '#c06c54',
    'Umeed': '#e5a93b',
    'Chai-wali-raatein': '#d97d29'
  };

  function init(shayaris) {
    allShayaris = shayaris;
    container = document.getElementById('sky-canvas-container');
    canvas = document.getElementById('sky-canvas');
    if (!canvas || !container) return;
    ctx = canvas.getContext('2d');

    setupCanvas();
    generateSkyMap();
    bindEvents();
    startAnimation();
  }

  function setupCanvas() {
    function resize() {
      if (!canvas || !container) return;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      // Re-position constellation stars relative to canvas dimensions
      positionStars();
    }
    window.addEventListener('resize', resize);
    resize();
  }

  function generateSkyMap() {
    // Generate 120 distant background twinkling stars
    bgDistantStars = [];
    for (let i = 0; i < 120; i++) {
      bgDistantStars.push({
        xRel: Math.random(),
        yRel: Math.random(),
        size: 0.8 + Math.random() * 1.5,
        twinkleSpeed: 0.02 + Math.random() * 0.04,
        twinklePhase: Math.random() * Math.PI * 2,
        baseAlpha: 0.2 + Math.random() * 0.5
      });
    }

    // Initialize the 59 Shayari Stars
    stars = allShayaris.map((item, index) => {
      return {
        shayari: item,
        mood: item.mood,
        color: moodColors[item.mood] || '#d4af37',
        x: 0,
        y: 0,
        radius: 4.5,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 0.03 + Math.random() * 0.03
      };
    });

    positionStars();
  }

  // Position stars into 5 constellation clusters
  function positionStars() {
    if (!canvas) return;
    const W = Math.max(canvas.width, 800);
    const H = Math.max(canvas.height, 600);

    // Mood constellation centers and layouts
    const moodCenters = {
      'Ishq': { cx: W * 0.25, cy: H * 0.35, shape: 'heart' },
      'Judaai': { cx: W * 0.75, cy: H * 0.30, shape: 'tear' },
      'Umeed': { cx: W * 0.50, cy: H * 0.25, shape: 'crown' },
      'Chai-wali-raatein': { cx: W * 0.30, cy: H * 0.70, shape: 'cup' },
      'Dard': { cx: W * 0.70, cy: H * 0.72, shape: 'zigzag' }
    };

    const moodGroups = {};
    Object.keys(moodColors).forEach(m => { moodGroups[m] = []; });
    stars.forEach(s => {
      if (moodGroups[s.mood]) moodGroups[s.mood].push(s);
    });

    // Lay out stars along poetic patterns
    Object.keys(moodGroups).forEach(mood => {
      const group = moodGroups[mood];
      const center = moodCenters[mood];
      const count = group.length;

      group.forEach((star, i) => {
        const t = (i / Math.max(1, count - 1));
        let offsetX = 0;
        let offsetY = 0;

        if (center.shape === 'heart') {
          // Heart curve
          const angle = t * Math.PI * 2;
          offsetX = 16 * Math.pow(Math.sin(angle), 3) * 6;
          offsetY = -(13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) * 5;
        } else if (center.shape === 'tear') {
          // Streaming curve
          offsetX = (t - 0.5) * 220 + Math.sin(t * Math.PI * 2) * 25;
          offsetY = t * 180 - 90;
        } else if (center.shape === 'crown') {
          // Arc crown with central star
          const angle = Math.PI * 0.2 + t * Math.PI * 0.6;
          offsetX = Math.cos(angle) * 140;
          offsetY = -Math.sin(angle) * 90;
        } else if (center.shape === 'cup') {
          // Chai kettle / cup arc
          const angle = t * Math.PI * 1.6 - Math.PI * 0.3;
          offsetX = Math.cos(angle) * 120 + (i % 2 === 0 ? 10 : -10);
          offsetY = Math.sin(angle) * 80;
        } else {
          // Zigzag constellation
          offsetX = (t - 0.5) * 240;
          offsetY = (i % 2 === 0 ? -50 : 50) + Math.sin(t * Math.PI) * 30;
        }

        // Add subtle natural dispersion
        star.x = center.cx + offsetX + ((i * 17) % 25 - 12);
        star.y = center.cy + offsetY + ((i * 23) % 25 - 12);
      });
    });
  }

  function bindEvents() {
    // Mouse / Touch movement for hover tooltip
    canvas.addEventListener('mousemove', onPointerMove);
    canvas.addEventListener('mouseleave', onPointerLeave);
    canvas.addEventListener('click', onPointerClick);

    // Pan & Dragging
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - panX;
      startY = e.clientY - panY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
    });

    // Touch Support for mobile
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const clientX = touch.clientX - rect.left - panX;
        const clientY = touch.clientY - rect.top - panY;
        const star = findStarAt(clientX, clientY);
        if (star) {
          hoveredStar = star;
          activeConstellationMood = star.mood;
          showTooltip(star, touch.clientX, touch.clientY);
        }
      }
    }, { passive: true });

    // Legend item highlight
    legendItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        activeConstellationMood = item.dataset.mood;
      });
      item.addEventListener('mouseleave', () => {
        if (!hoveredStar) activeConstellationMood = null;
      });
      item.addEventListener('click', () => {
        const mood = item.dataset.mood;
        // Pan to this constellation
        centerOnMood(mood);
      });
    });
  }

  function centerOnMood(mood) {
    const group = stars.filter(s => s.mood === mood);
    if (!group.length) return;
    let avgX = 0, avgY = 0;
    group.forEach(s => { avgX += s.x; avgY += s.y; });
    avgX /= group.length;
    avgY /= group.length;

    panX = (canvas.width / 2) - avgX;
    panY = (canvas.height / 2) - avgY;
    activeConstellationMood = mood;
  }

  function onPointerMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - panX;
    const mouseY = e.clientY - rect.top - panY;

    const star = findStarAt(mouseX, mouseY);
    if (star !== hoveredStar) {
      hoveredStar = star;
      if (hoveredStar) {
        activeConstellationMood = hoveredStar.mood;
        showTooltip(hoveredStar, e.clientX, e.clientY);
        canvas.style.cursor = 'pointer';
      } else {
        activeConstellationMood = null;
        hideTooltip();
        canvas.style.cursor = isDragging ? 'grabbing' : 'grab';
      }
    } else if (hoveredStar) {
      updateTooltipPos(e.clientX, e.clientY);
    }
  }

  function onPointerLeave() {
    hoveredStar = null;
    activeConstellationMood = null;
    hideTooltip();
  }

  function onPointerClick(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left - panX;
    const mouseY = e.clientY - rect.top - panY;

    const star = findStarAt(mouseX, mouseY);
    if (star && window.ModalReader) {
      window.ModalReader.open(star.shayari);
    }
  }

  function findStarAt(x, y) {
    const hitRadius = 18; // forgiving hit zone for touch
    return stars.find(s => {
      const dx = s.x - x;
      const dy = s.y - y;
      return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
    });
  }

  function showTooltip(star, screenX, screenY) {
    if (!tooltip) return;
    const containerRect = container.getBoundingClientRect();
    const x = screenX - containerRect.left;
    const y = screenY - containerRect.top;

    if (tooltipMood) {
      tooltipMood.textContent = star.mood;
      tooltipMood.style.color = star.color;
    }
    if (tooltipTitle) {
      tooltipTitle.textContent = star.shayari.title;
    }

    tooltip.style.left = `${x}px`;
    tooltip.style.top = `${y}px`;
    tooltip.classList.add('visible');
  }

  function updateTooltipPos(screenX, screenY) {
    if (!tooltip) return;
    const containerRect = container.getBoundingClientRect();
    tooltip.style.left = `${screenX - containerRect.left}px`;
    tooltip.style.top = `${screenY - containerRect.top}px`;
  }

  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('visible');
  }

  // ==================== ANIMATION LOOP ====================
  function startAnimation() {
    if (animId) cancelAnimationFrame(animId);

    function loop() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Nebula Background
      drawNebula();

      // 2. Distant Twinkling Stars
      drawDistantStars();

      // 3. Constellation Lines
      ctx.save();
      ctx.translate(panX, panY);
      drawConstellationLines();

      // 4. Main Shayari Stars
      drawShayariStars();
      ctx.restore();

      // 5. Shooting Stars
      drawShootingStars();

      animId = requestAnimationFrame(loop);
    }
    animId = requestAnimationFrame(loop);
  }

  function drawNebula() {
    // Subtle cosmic color wash
    const neb1 = ctx.createRadialGradient(canvas.width * 0.3, canvas.height * 0.4, 10, canvas.width * 0.3, canvas.height * 0.4, canvas.width * 0.5);
    neb1.addColorStop(0, 'rgba(224, 83, 104, 0.04)');
    neb1.addColorStop(1, 'transparent');
    ctx.fillStyle = neb1;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const neb2 = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.6, 10, canvas.width * 0.7, canvas.height * 0.6, canvas.width * 0.5);
    neb2.addColorStop(0, 'rgba(78, 122, 199, 0.04)');
    neb2.addColorStop(1, 'transparent');
    ctx.fillStyle = neb2;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawDistantStars() {
    bgDistantStars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const alpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(s.xRel * canvas.width, s.yRel * canvas.height, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawConstellationLines() {
    const moodGroups = {};
    Object.keys(moodColors).forEach(m => { moodGroups[m] = []; });
    stars.forEach(s => {
      if (moodGroups[s.mood]) moodGroups[s.mood].push(s);
    });

    Object.keys(moodGroups).forEach(mood => {
      const group = moodGroups[mood];
      if (group.length < 2) return;

      const isMoodActive = activeConstellationMood === mood;
      const baseAlpha = isMoodActive ? 0.65 : 0.16;
      const lineWidth = isMoodActive ? 1.8 : 1.0;

      ctx.strokeStyle = moodColors[mood] || '#d4af37';
      ctx.globalAlpha = baseAlpha;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      for (let i = 0; i < group.length - 1; i++) {
        ctx.moveTo(group[i].x, group[i].y);
        ctx.lineTo(group[i + 1].x, group[i + 1].y);
      }
      ctx.stroke();

      // Extra glow when active
      if (isMoodActive) {
        ctx.shadowColor = moodColors[mood];
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    });
    ctx.globalAlpha = 1.0;
  }

  function drawShayariStars() {
    stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const isHovered = hoveredStar === s;
      const isMoodActive = activeConstellationMood === s.mood;

      const twinkleScale = 0.8 + Math.sin(s.twinklePhase) * 0.3;
      const radius = (isHovered ? s.radius * 2.2 : isMoodActive ? s.radius * 1.4 : s.radius) * twinkleScale;

      // Outer Glow Halo
      const haloGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, radius * 3.5);
      haloGrad.addColorStop(0, s.color);
      haloGrad.addColorStop(0.5, s.color);
      haloGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = haloGrad;
      ctx.globalAlpha = isHovered ? 0.9 : isMoodActive ? 0.6 : 0.35;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Bright Core
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 1.0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Four-point Star Ray on hovered / active
      if (isHovered || isMoodActive) {
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        const rayLen = radius * 4;
        ctx.beginPath();
        ctx.moveTo(s.x - rayLen, s.y);
        ctx.lineTo(s.x + rayLen, s.y);
        ctx.moveTo(s.x, s.y - rayLen);
        ctx.lineTo(s.x, s.y + rayLen);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;
  }

  // Periodic Shooting Star
  function drawShootingStars() {
    if (Math.random() < 0.015 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * canvas.width * 0.8,
        y: Math.random() * canvas.height * 0.4,
        len: 80 + Math.random() * 100,
        speed: 14 + Math.random() * 8,
        angle: Math.PI * 0.22,
        life: 1.0
      });
    }

    shootingStars = shootingStars.filter(st => {
      const tailX = st.x - Math.cos(st.angle) * st.len;
      const tailY = st.y - Math.sin(st.angle) * st.len;

      const grad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
      grad.addColorStop(0, `rgba(255, 255, 255, ${st.life})`);
      grad.addColorStop(0.5, `rgba(212, 175, 55, ${st.life * 0.6})`);
      grad.addColorStop(1, 'transparent');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(st.x, st.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      st.x += Math.cos(st.angle) * st.speed;
      st.y += Math.sin(st.angle) * st.speed;
      st.life -= 0.025;

      return st.life > 0 && st.x < canvas.width && st.y < canvas.height;
    });
  }

  return {
    init,
    centerOnMood
  };
})();

