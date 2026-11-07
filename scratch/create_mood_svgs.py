import os

moods = {
    'ishq.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg-ishq" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#4a1525"/>
      <stop offset="60%" stop-color="#22060e"/>
      <stop offset="100%" stop-color="#0e0206"/>
    </radialGradient>
    <linearGradient id="gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f9d77e"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#bg-ishq)" stroke="url(#gold-ring)" stroke-width="4"/>
  <circle cx="250" cy="250" r="228" fill="none" stroke="rgba(249, 215, 126, 0.25)" stroke-width="1" stroke-dasharray="4 6"/>
  <!-- Crescent & Star -->
  <path d="M230 140 A 65 65 0 0 0 290 205 A 50 50 0 0 1 230 140 Z" fill="url(#gold-ring)" filter="url(#glow)"/>
  <!-- Velvet Rose Motif -->
  <g transform="translate(250, 260) scale(1.1)" filter="url(#glow)">
    <path d="M0 -50 C-30 -40 -60 0 -40 40 C-20 70 20 70 40 40 C60 0 30 -40 0 -50 Z" fill="#e11d48" opacity="0.8"/>
    <path d="M0 -40 C-20 -30 -40 5 -25 35 C-10 60 10 60 25 35 C40 5 20 -30 0 -40 Z" fill="#f43f5e" opacity="0.9"/>
    <path d="M0 -25 C-12 -20 -25 0 -15 20 C-5 35 5 35 15 20 C25 0 12 -20 0 -25 Z" fill="#fda4af"/>
  </g>
  <!-- Floating Petals -->
  <path d="M160 210 Q145 230 165 240 Q180 230 160 210 Z" fill="#fb7185" opacity="0.75"/>
  <path d="M330 220 Q350 240 335 255 Q320 240 330 220 Z" fill="#fb7185" opacity="0.8"/>
  <path d="M220 340 Q240 365 260 345 Q240 330 220 340 Z" fill="#f43f5e" opacity="0.7"/>
  <!-- Poetic Ring Inscription -->
  <text x="250" y="410" text-anchor="middle" fill="#f9d77e" font-family="sans-serif" font-size="14" letter-spacing="6" opacity="0.9">ISHQ · पहला इश्क़</text>
</svg>''',

    'judaai.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg-judaai" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#111e38"/>
      <stop offset="60%" stop-color="#080f1e"/>
      <stop offset="100%" stop-color="#03060c"/>
    </radialGradient>
    <linearGradient id="silver-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bfdbfe"/>
      <stop offset="50%" stop-color="#60a5fa"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="glow-blue" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#bg-judaai)" stroke="url(#silver-ring)" stroke-width="4"/>
  <circle cx="250" cy="250" r="228" fill="none" stroke="rgba(191, 219, 254, 0.2)" stroke-width="1" stroke-dasharray="4 6"/>
  <!-- Raindrops & Mist -->
  <g stroke="#93c5fd" stroke-width="2" opacity="0.5" stroke-linecap="round">
    <line x1="150" y1="120" x2="140" y2="160"/>
    <line x1="210" y1="100" x2="200" y2="145"/>
    <line x1="320" y1="130" x2="310" y2="170"/>
    <line x1="380" y1="160" x2="370" y2="200"/>
    <line x1="180" y1="200" x2="170" y2="245"/>
    <line x1="340" y1="220" x2="330" y2="265"/>
  </g>
  <!-- Solitary branch & Teardrop -->
  <path d="M120 280 C180 270 240 260 280 230 C300 215 330 200 360 205" stroke="#93c5fd" stroke-width="3" fill="none" opacity="0.7"/>
  <g transform="translate(250, 275)" filter="url(#glow-blue)">
    <path d="M0 -40 C-25 -10 -25 25 0 45 C25 25 25 -10 0 -40 Z" fill="#60a5fa" opacity="0.8"/>
    <path d="M0 -25 C-15 -5 -15 15 0 30 C15 15 15 -5 0 -25 Z" fill="#bfdbfe"/>
  </g>
  <text x="250" y="410" text-anchor="middle" fill="#93c5fd" font-family="sans-serif" font-size="14" letter-spacing="6" opacity="0.9">JUDAAI · तन्हा जुदाई</text>
</svg>''',

    'chai.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg-chai" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#381c0e"/>
      <stop offset="60%" stop-color="#1d0d06"/>
      <stop offset="100%" stop-color="#0c0402"/>
    </radialGradient>
    <linearGradient id="amber-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <filter id="steam-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#bg-chai)" stroke="url(#amber-ring)" stroke-width="4"/>
  <circle cx="250" cy="250" r="228" fill="none" stroke="rgba(253, 230, 138, 0.25)" stroke-width="1" stroke-dasharray="4 6"/>
  <!-- Ambient Steam Swirls -->
  <g stroke="#fbbf24" stroke-width="3" fill="none" filter="url(#steam-glow)" opacity="0.75" stroke-linecap="round">
    <path d="M225 180 C215 150 240 130 225 100"/>
    <path d="M250 170 C265 140 240 120 255 90"/>
    <path d="M275 180 C265 150 285 130 270 100"/>
  </g>
  <!-- Kulhad Clay Cup -->
  <g transform="translate(250, 260)">
    <ellipse cx="0" cy="20" rx="65" ry="16" fill="#78350f"/>
    <path d="M-60 20 L-42 95 Q0 105 42 95 L60 20 Z" fill="#92400e" stroke="#b45309" stroke-width="2"/>
    <!-- Chai Liquid -->
    <ellipse cx="0" cy="20" rx="55" ry="12" fill="#d97706"/>
    <ellipse cx="0" cy="20" rx="45" ry="8" fill="#f59e0b" opacity="0.8"/>
    <!-- Saucer / Tapri base -->
    <ellipse cx="0" cy="102" rx="75" ry="12" fill="#451a03" opacity="0.6"/>
  </g>
  <text x="250" y="410" text-anchor="middle" fill="#fde68a" font-family="sans-serif" font-size="14" letter-spacing="6" opacity="0.9">CHAI · रात की चाय</text>
</svg>''',

    'umeed.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg-umeed" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#132c21"/>
      <stop offset="60%" stop-color="#081710"/>
      <stop offset="100%" stop-color="#020805"/>
    </radialGradient>
    <linearGradient id="emerald-gold-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a7f3d0"/>
      <stop offset="50%" stop-color="#10b981"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </linearGradient>
    <filter id="dawn-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#bg-umeed)" stroke="url(#emerald-gold-ring)" stroke-width="4"/>
  <circle cx="250" cy="250" r="228" fill="none" stroke="rgba(167, 243, 208, 0.25)" stroke-width="1" stroke-dasharray="4 6"/>
  <!-- Dawn Sunbeams & Horizon -->
  <g stroke="#fbbf24" stroke-width="2" opacity="0.6">
    <line x1="250" y1="230" x2="150" y2="130"/>
    <line x1="250" y1="230" x2="250" y2="90"/>
    <line x1="250" y1="230" x2="350" y2="130"/>
    <line x1="250" y1="230" x2="120" y2="200"/>
    <line x1="250" y1="230" x2="380" y2="200"/>
  </g>
  <!-- Rising Sun of Hope -->
  <circle cx="250" cy="240" r="48" fill="#f59e0b" filter="url(#dawn-glow)"/>
  <circle cx="250" cy="240" r="32" fill="#fef08a"/>
  <!-- Mountain Silhouette of Faith -->
  <path d="M110 320 L190 260 L240 290 L310 240 L390 320 Z" fill="#064e3b" opacity="0.9"/>
  <text x="250" y="410" text-anchor="middle" fill="#a7f3d0" font-family="sans-serif" font-size="14" letter-spacing="6" opacity="0.9">UMEED · रौशन उम्मीद</text>
</svg>''',

    'safar.svg': '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="bg-safar" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="#231e1a"/>
      <stop offset="60%" stop-color="#14100d"/>
      <stop offset="100%" stop-color="#080605"/>
    </radialGradient>
    <linearGradient id="highway-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#ea580c"/>
    </linearGradient>
    <filter id="headlight-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="9" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="250" cy="250" r="240" fill="url(#bg-safar)" stroke="url(#highway-ring)" stroke-width="4"/>
  <circle cx="250" cy="250" r="228" fill="none" stroke="rgba(253, 224, 71, 0.25)" stroke-width="1" stroke-dasharray="4 6"/>
  <!-- Highway Perspective (NH 48) -->
  <polygon points="250,180 200,340 300,340" fill="#1c1917" opacity="0.95"/>
  <!-- Yellow Dashed Road Markings -->
  <line x1="250" y1="200" x2="250" y2="220" stroke="#facc15" stroke-width="3"/>
  <line x1="250" y1="240" x2="250" y2="270" stroke="#facc15" stroke-width="4"/>
  <line x1="250" y1="290" x2="250" y2="330" stroke="#facc15" stroke-width="5"/>
  <!-- Headlight beam sweeps -->
  <path d="M240 250 L140 330 L220 330 Z" fill="#fef08a" opacity="0.2" filter="url(#headlight-glow)"/>
  <path d="M260 250 L360 330 L280 330 Z" fill="#fef08a" opacity="0.2" filter="url(#headlight-glow)"/>
  <!-- Milestone Badge -->
  <rect x="225" y="160" width="50" height="35" rx="10" fill="#f59e0b" stroke="#fff" stroke-width="2"/>
  <text x="250" y="182" text-anchor="middle" fill="#1c1917" font-family="sans-serif" font-size="12" font-weight="bold">NH 48</text>
  <text x="250" y="410" text-anchor="middle" fill="#fde047" font-family="sans-serif" font-size="14" letter-spacing="6" opacity="0.9">SAFAR · लखनऊ-दिल्ली</text>
</svg>'''
}

os.makedirs('images/moods', exist_ok=True)
for name, svg_content in moods.items():
    path = os.path.join('images', 'moods', name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(svg_content.strip())
    print('Created:', path)

