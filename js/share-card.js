/**
 * Instagram Story Share Card Generator (1080x1920)
 * Generates high-resolution social story cards with handwritten shayari,
 * poetic branding, mood color palettes, and شازیہ signature.
 * Author: شازیہ (Shazo)
 */

window.ShareCardGenerator = (function () {
  const canvas = document.getElementById('share-canvas');
  let ctx = null;
  let currentShayari = null;
  let generatedBlob = null;

  // DOM Elements
  const shareModal = document.getElementById('share-modal');
  const shareModalClose = document.getElementById('share-modal-close');
  const btnDownloadStory = document.getElementById('btn-download-story');
  const btnNativeShare = document.getElementById('btn-native-share');
  const btnCopyLink = document.getElementById('btn-copy-link');
  const copyLinkLabel = document.getElementById('copy-link-label');

  const moodColors = {
    'Ishq': { bg1: '#1a0910', bg2: '#0b0c10', accent: '#e05368', glow: 'rgba(224, 83, 104, 0.35)', hindi: 'इश्क़' },
    'Judaai': { bg1: '#0a101d', bg2: '#07080d', accent: '#4e7ac7', glow: 'rgba(78, 122, 199, 0.35)', hindi: 'जुदाई' },
    'Dard': { bg1: '#170c0a', bg2: '#08080a', accent: '#c06c54', glow: 'rgba(192, 108, 84, 0.35)', hindi: 'दर्द' },
    'Umeed': { bg1: '#1a1407', bg2: '#090a0d', accent: '#e5a93b', glow: 'rgba(229, 169, 59, 0.35)', hindi: 'उम्मीद' },
    'Chai-wali-raatein': { bg1: '#1c1007', bg2: '#090a0d', accent: '#d97d29', glow: 'rgba(217, 125, 41, 0.35)', hindi: 'चाय वाली रातें' }
  };

  function init() {
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    if (shareModalClose) {
      shareModalClose.addEventListener('click', close);
    }

    if (shareModal) {
      shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) close();
      });
    }

    if (btnDownloadStory) {
      btnDownloadStory.addEventListener('click', downloadCard);
    }

    if (btnNativeShare) {
      btnNativeShare.addEventListener('click', triggerNativeShare);
    }

    if (btnCopyLink) {
      btnCopyLink.addEventListener('click', copyDirectLink);
    }
  }

  function open(shayari) {
    currentShayari = shayari;
    if (shareModal) {
      shareModal.classList.add('active');
      shareModal.setAttribute('aria-hidden', 'false');
    }
    renderCard(shayari);
  }

  function close() {
    if (shareModal) {
      shareModal.classList.remove('active');
      shareModal.setAttribute('aria-hidden', 'true');
    }
  }

  function renderCard(shayari) {
    if (!ctx) return;

    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    const mood = moodColors[shayari.mood] || moodColors['Ishq'];

    // 1. Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, mood.bg1);
    bgGrad.addColorStop(0.5, '#0d0f15');
    bgGrad.addColorStop(1, '#050608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 2. Ambient Radial Glow
    const glowGrad = ctx.createRadialGradient(W / 2, 450, 50, W / 2, 450, 600);
    glowGrad.addColorStop(0, mood.glow);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, 0, W, H);

    // 3. Ornate Double Gold Border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.35)';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, W - 100, H - 100);

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(62, 62, W - 124, H - 124);

    // Corner Ornaments
    drawCornerOrnaments(ctx, 50, 50, W - 100, H - 100);

    // 4. Header Section
    // Top Emblem
    ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.beginPath();
    ctx.arc(W / 2, 150, 42, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f5e7b2';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ش', W / 2, 148);

    // Title & Mood
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = mood.accent;
    ctx.fillText(`✦ ${mood.hindi} • ${shayari.mood} ✦`, W / 2, 225);

    ctx.font = 'bold 42px "Tiro Devanagari Hindi", serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(shayari.title, W / 2, 275);

    // 5. Center: Handwritten Image
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      const boxX = 110;
      const boxY = 330;
      const boxW = 860;
      const boxH = 1160;

      // Draw paper shadow
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.75)';
      ctx.shadowBlur = 45;
      ctx.shadowOffsetY = 20;
      ctx.fillStyle = '#fbf7ee';
      roundRect(ctx, boxX, boxY, boxW, boxH, 20);
      ctx.fill();
      ctx.restore();

      // Clip image inside rounded frame
      ctx.save();
      roundRect(ctx, boxX, boxY, boxW, boxH, 20);
      ctx.clip();

      // Calculate object-fit contain/cover
      const imgRatio = img.width / img.height;
      const boxRatio = boxW / boxH;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > boxRatio) {
        drawW = boxW;
        drawH = boxW / imgRatio;
        drawX = boxX;
        drawY = boxY + (boxH - drawH) / 2;
      } else {
        drawH = boxH;
        drawW = boxH * imgRatio;
        drawX = boxX + (boxW - drawW) / 2;
        drawY = boxY;
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Subtle vignette over paper
      const paperGlow = ctx.createLinearGradient(boxX, boxY, boxX, boxY + boxH);
      paperGlow.addColorStop(0, 'rgba(0,0,0,0.03)');
      paperGlow.addColorStop(1, 'rgba(0,0,0,0.08)');
      ctx.fillStyle = paperGlow;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.restore();

      // Delicate gold outline on photo frame
      ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
      ctx.lineWidth = 2;
      roundRect(ctx, boxX, boxY, boxW, boxH, 20);
      ctx.stroke();

      // 6. Bottom Branding & Signature
      drawFooterBranding(ctx, W, H, shayari);

      // Create blob for download & native share
      canvas.toBlob((blob) => {
        generatedBlob = blob;
      }, 'image/png');
    };

    img.onerror = function () {
      // Fallback if image fails
      ctx.fillStyle = '#fff';
      ctx.font = '28px sans-serif';
      ctx.fillText('Image loaded for shayari #' + shayari.id, W / 2, 800);
      drawFooterBranding(ctx, W, H, shayari);
    };

    img.src = shayari.image;
  }

  function drawFooterBranding(ctx, W, H, shayari) {
    const footerY = 1550;

    // Poetic quotation
    ctx.fillStyle = 'rgba(212, 175, 55, 0.85)';
    ctx.font = 'italic 28px "Tiro Devanagari Hindi", serif';
    ctx.textAlign = 'center';
    ctx.fillText('"तहरीर एक खामोश आवाज़ और कलम हाथ की जबान है।"', W / 2, footerY);

    // Decorative divider
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, footerY + 35);
    ctx.lineTo(W / 2 + 200, footerY + 35);
    ctx.stroke();

    // Poet Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 44px "Cinzel", serif';
    ctx.fillText('شازیہ', W / 2, footerY + 95);

    // Poet Pseudonym & Subtitle
    ctx.fillStyle = '#d4af37';
    ctx.font = '600 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('SHAZO • क़लम, काग़ज़ और आवाज़', W / 2, footerY + 140);

    // Portfolio URL badge
    ctx.fillStyle = 'rgba(212, 175, 55, 0.15)';
    roundRect(ctx, W / 2 - 210, footerY + 175, 420, 52, 26);
    ctx.fill();
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, W / 2 - 210, footerY + 175, 420, 52, 26);
    ctx.stroke();

    ctx.fillStyle = '#f5e7b2';
    ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('abutalha09.vercel.app', W / 2, footerY + 208);
  }

  function drawCornerOrnaments(ctx, x, y, w, h) {
    const size = 30;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 2;

    // Top-Left
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size, y);
    ctx.moveTo(x + 10, y + size);
    ctx.lineTo(x + size, y + 10);
    ctx.stroke();

    // Top-Right
    ctx.beginPath();
    ctx.moveTo(x + w, y + size);
    ctx.lineTo(x + w - size, y);
    ctx.moveTo(x + w - 10, y + size);
    ctx.lineTo(x + w - size, y + 10);
    ctx.stroke();

    // Bottom-Left
    ctx.beginPath();
    ctx.moveTo(x, y + h - size);
    ctx.lineTo(x + size, y + h);
    ctx.moveTo(x + 10, y + h - size);
    ctx.lineTo(x + size, y + h - 10);
    ctx.stroke();

    // Bottom-Right
    ctx.beginPath();
    ctx.moveTo(x + w, y + h - size);
    ctx.lineTo(x + w - size, y + h);
    ctx.moveTo(x + w - 10, y + h - size);
    ctx.lineTo(x + w - size, y + h - 10);
    ctx.stroke();
  }

  function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function downloadCard() {
    if (!currentShayari) return;
    const link = document.createElement('a');
    link.download = `shayari-by-shazo-${String(currentShayari.id).padStart(2, '0')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  async function triggerNativeShare() {
    if (!currentShayari) return;

    const shareData = {
      title: `${currentShayari.title} | Shayari by Shazo`,
      text: `شازیہ की हाथ से लिखी शायरी: "${currentShayari.title}"`,
      url: `${window.location.origin}${window.location.pathname}#shayari-${currentShayari.id}`
    };

    if (navigator.canShare && generatedBlob) {
      const file = new File([generatedBlob], `shayari-${currentShayari.id}.png`, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ ...shareData, files: [file] });
          return;
        } catch (err) {
          if (err.name !== 'AbortError') console.warn('File share failed, falling back to URL share:', err);
        }
      }
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') downloadCard();
      }
    } else {
      downloadCard();
    }
  }

  function copyDirectLink() {
    if (!currentShayari) return;
    const url = `${window.location.origin}${window.location.pathname}#shayari-${currentShayari.id}`;
    navigator.clipboard.writeText(url).then(() => {
      if (copyLinkLabel) {
        copyLinkLabel.textContent = 'लिंक कॉपी हो गया! ✓';
        setTimeout(() => { copyLinkLabel.textContent = 'लिंक कॉपी करें'; }, 2000);
      }
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  }

  return {
    init,
    open,
    close
  };
})();

