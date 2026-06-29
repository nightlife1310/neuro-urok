/* ============================================================
   НЕЙРО · иллюстрации для слайдов (SVG, офлайн, неон)
   ILLO[name] -> строка SVG. viewBox 0 0 320 180.
   ============================================================ */
window.ILLO = {

  /* ИИ вокруг тебя — телефон + плавающие иконки */
  phoneAI: `<svg viewBox="0 0 320 180" class="illo-svg">
    <defs><radialGradient id="ph-g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#2a1f63"/><stop offset="1" stop-color="#150d3e"/></radialGradient></defs>
    <rect x="34" y="26" width="92" height="132" rx="18" fill="#0a0726" stroke="#5eead4" stroke-width="2"/>
    <rect x="42" y="40" width="76" height="104" rx="11" fill="url(#ph-g)"/>
    <rect x="50" y="50" width="28" height="28" rx="8" fill="#5eead4" opacity=".85"/>
    <rect x="82" y="50" width="28" height="28" rx="8" fill="#a78bfa" opacity=".85"/>
    <rect x="50" y="82" width="28" height="28" rx="8" fill="#f472b6" opacity=".85"/>
    <rect x="82" y="82" width="28" height="28" rx="8" fill="#fbbf24" opacity=".85"/>
    <rect x="50" y="118" width="60" height="14" rx="7" fill="#ffffff" opacity=".18"/>
    <g stroke="#5eead4" stroke-width="1.4" stroke-dasharray="3 4" opacity=".6">
      <line x1="126" y1="56" x2="196" y2="44"/><line x1="126" y1="92" x2="200" y2="92"/><line x1="126" y1="128" x2="196" y2="140"/></g>
    <g font-family="Manrope,sans-serif" font-size="13" font-weight="700">
      <g transform="translate(196,30)"><rect width="96" height="30" rx="15" fill="#5eead4"/><text x="48" y="20" text-anchor="middle" fill="#06231f">💬 чат-бот</text></g>
      <g transform="translate(206,78)"><rect width="94" height="30" rx="15" fill="#a78bfa"/><text x="47" y="20" text-anchor="middle" fill="#1a1040">🎬 лента</text></g>
      <g transform="translate(174,126)" font-size="12"><rect width="126" height="30" rx="15" fill="#f472b6"/><text x="63" y="20" text-anchor="middle" fill="#3a0021">🙂 распознавание</text></g>
    </g>
  </svg>`,

  /* Человек или ИИ — две реплики + лупа */
  detective: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g transform="translate(20,28)"><rect width="150" height="50" rx="14" fill="#fbf7ff"/><path d="M22 50 l0 16 l16 -16 z" fill="#fbf7ff"/>
      <text x="16" y="24" font-family="Manrope" font-size="12" font-weight="600" fill="#1a1430">«В заключение, важно</text>
      <text x="16" y="40" font-family="Manrope" font-size="12" font-weight="600" fill="#1a1430">отметить, что...»</text>
      <g transform="translate(120,-14)"><circle r="16" fill="#a78bfa"/><text y="5" text-anchor="middle" font-size="16">🤖</text></g></g>
    <g transform="translate(150,98)"><rect width="150" height="50" rx="14" fill="#fbf7ff"/><path d="M128 50 l0 16 l-16 -16 z" fill="#fbf7ff"/>
      <text x="16" y="24" font-family="Manrope" font-size="12" font-weight="600" fill="#1a1430">«ну я хз, короче</text>
      <text x="16" y="40" font-family="Manrope" font-size="12" font-weight="600" fill="#1a1430">было прикольно))»</text>
      <g transform="translate(16,-14)"><circle r="16" fill="#5eead4"/><text y="5" text-anchor="middle" font-size="16">🧑</text></g></g>
    <g transform="translate(132,60)"><circle r="22" fill="none" stroke="#fbbf24" stroke-width="4"/><line x1="16" y1="16" x2="34" y2="34" stroke="#fbbf24" stroke-width="5" stroke-linecap="round"/></g>
  </svg>`,

  /* Токены — фраза распадается на кусочки */
  tokens: `<svg viewBox="0 0 320 180" class="illo-svg">
    <text x="160" y="40" text-anchor="middle" font-family="Manrope" font-size="20" font-weight="700" fill="#f2f1ff">Привет, как дела?</text>
    <g font-family="JetBrains Mono,monospace" font-size="15" fill="#5eead4">
      <g transform="translate(40,78)"><rect width="46" height="34" rx="9" fill="rgba(94,234,212,.14)" stroke="#5eead4"/><text x="23" y="22" text-anchor="middle">При</text></g>
      <g transform="translate(92,78)"><rect width="46" height="34" rx="9" fill="rgba(94,234,212,.14)" stroke="#5eead4"/><text x="23" y="22" text-anchor="middle">вет</text></g>
      <g transform="translate(144,78)"><rect width="26" height="34" rx="9" fill="rgba(167,139,250,.16)" stroke="#a78bfa"/><text x="13" y="22" text-anchor="middle" fill="#a78bfa">,</text></g>
      <g transform="translate(176,78)"><rect width="52" height="34" rx="9" fill="rgba(94,234,212,.14)" stroke="#5eead4"/><text x="26" y="22" text-anchor="middle">как</text></g>
      <g transform="translate(234,78)"><rect width="58" height="34" rx="9" fill="rgba(94,234,212,.14)" stroke="#5eead4"/><text x="29" y="22" text-anchor="middle">дела</text></g>
    </g>
    <g stroke="#a78bfa" stroke-width="1.4" opacity=".55"><line x1="63" y1="50" x2="63" y2="78"/><line x1="115" y1="50" x2="115" y2="78"/><line x1="202" y1="50" x2="202" y2="78"/><line x1="263" y1="50" x2="263" y2="78"/></g>
    <text x="160" y="140" text-anchor="middle" font-family="Manrope" font-size="13" fill="#bcbbe6">ИИ видит текст кусочками — токенами</text>
  </svg>`,

  /* Предсказание слова — вероятности */
  predict: `<svg viewBox="0 0 320 180" class="illo-svg">
    <text x="20" y="34" font-family="Manrope" font-size="17" font-weight="600" fill="#f2f1ff">Я люблю горячий…</text>
    <g font-family="Manrope" font-size="13" font-weight="600">
      <g transform="translate(20,52)"><rect width="280" height="24" rx="7" fill="rgba(255,255,255,.06)"/><rect width="168" height="24" rx="7" fill="#5eead4"/><text x="10" y="16" fill="#06231f">чай</text><text x="262" y="16" fill="#5eead4" font-family="JetBrains Mono">52%</text></g>
      <g transform="translate(20,82)"><rect width="280" height="24" rx="7" fill="rgba(255,255,255,.06)"/><rect width="106" height="24" rx="7" fill="#a78bfa"/><text x="10" y="16" fill="#1a1040">кофе</text><text x="262" y="16" fill="#a78bfa" font-family="JetBrains Mono">33%</text></g>
      <g transform="translate(20,112)"><rect width="280" height="24" rx="7" fill="rgba(255,255,255,.06)"/><rect width="45" height="24" rx="7" fill="#f472b6"/><text x="10" y="16" fill="#3a0021">шоколад</text><text x="262" y="16" fill="#f472b6" font-family="JetBrains Mono">14%</text></g>
      <g transform="translate(20,142)"><rect width="280" height="24" rx="7" fill="rgba(255,255,255,.06)"/><rect width="8" height="24" rx="4" fill="#fb7185"/><text x="14" y="16" fill="#fb7185">асфальт</text><text x="264" y="16" fill="#fb7185" font-family="JetBrains Mono">1%</text></g>
    </g>
  </svg>`,

  /* Рост сети — из маленькой в большую */
  growNet: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g stroke="#5eead4" stroke-width="1.2" opacity=".5"><line x1="60" y1="70" x2="60" y2="110"/><line x1="60" y1="90" x2="90" y2="90"/></g>
    <g fill="#5eead4"><circle cx="60" cy="70" r="5"/><circle cx="60" cy="110" r="5"/><circle cx="90" cy="90" r="6"/></g>
    <text x="62" y="150" text-anchor="middle" font-family="Manrope" font-size="12" fill="#bcbbe6">мало данных</text>
    <path d="M118 90 l30 0 m-10 -8 l12 8 l-12 8" stroke="#fbbf24" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <g stroke="#a78bfa" stroke-width="1" opacity=".45">
      <line x1="200" y1="40" x2="245" y2="70"/><line x1="245" y1="70" x2="290" y2="50"/><line x1="245" y1="70" x2="250" y2="120"/>
      <line x1="200" y1="40" x2="205" y2="100"/><line x1="205" y1="100" x2="250" y2="120"/><line x1="250" y1="120" x2="295" y2="110"/>
      <line x1="205" y1="100" x2="245" y2="70"/><line x1="290" y1="50" x2="295" y2="110"/></g>
    <g><circle cx="200" cy="40" r="6" fill="#5eead4"/><circle cx="245" cy="70" r="7" fill="#a78bfa"/><circle cx="290" cy="50" r="6" fill="#f472b6"/>
      <circle cx="205" cy="100" r="6" fill="#5eead4"/><circle cx="250" cy="120" r="7" fill="#fbbf24"/><circle cx="295" cy="110" r="6" fill="#a78bfa"/></g>
    <text x="248" y="160" text-anchor="middle" font-family="Manrope" font-size="12" fill="#bcbbe6">много данных = умнее</text>
  </svg>`,

  /* Кормёжка данными */
  dataFeed: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g font-size="22">
      <g transform="translate(24,40)"><rect width="44" height="36" rx="10" fill="#fbf7ff"/><text x="22" y="27" text-anchor="middle">🐱</text></g>
      <g transform="translate(24,86)"><rect width="44" height="36" rx="10" fill="#fbf7ff"/><text x="22" y="27" text-anchor="middle">📖</text></g>
      <g transform="translate(24,132)"><rect width="44" height="36" rx="10" fill="#fbf7ff"/><text x="22" y="27" text-anchor="middle">🎵</text></g></g>
    <g stroke="#5eead4" stroke-width="1.6" stroke-dasharray="4 4" opacity=".6"><line x1="72" y1="58" x2="150" y2="86"/><line x1="72" y1="104" x2="150" y2="92"/><line x1="72" y1="150" x2="150" y2="98"/></g>
    <circle cx="210" cy="90" r="54" fill="none" stroke="#a78bfa" stroke-width="2" opacity=".4"/>
    <text x="210" y="104" text-anchor="middle" font-size="52">🧠</text>
    <text x="210" y="168" text-anchor="middle" font-family="Manrope" font-size="12" fill="#bcbbe6">учится на примерах</text>
  </svg>`,

  /* Словарь — карточки терминов */
  dictionary: `<svg viewBox="0 0 320 180" class="illo-svg" font-family="Unbounded,sans-serif">
    <g transform="rotate(-6 90 90)"><rect x="40" y="46" width="120" height="88" rx="14" fill="#5eead4"/><text x="100" y="86" text-anchor="middle" font-size="20" font-weight="800" fill="#06231f">LLM</text><text x="100" y="110" text-anchor="middle" font-size="11" font-family="Manrope" font-weight="600" fill="#0a3b34">угадывает слово</text></g>
    <g transform="rotate(5 230 96)"><rect x="170" y="52" width="120" height="88" rx="14" fill="#a78bfa"/><text x="230" y="92" text-anchor="middle" font-size="18" font-weight="800" fill="#1a1040">Локально</text><text x="230" y="116" text-anchor="middle" font-size="11" font-family="Manrope" font-weight="600" fill="#241055">без интернета</text></g>
  </svg>`,

  /* Трофей / бейдж */
  trophy: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g transform="translate(160,90)">
      <circle r="58" fill="none" stroke="#fbbf24" stroke-width="2" opacity=".5"/>
      <path d="M-34 -34 h68 v18 a34 34 0 0 1 -68 0 z" fill="#fbbf24"/>
      <path d="M-34 -30 a-18 18 0 0 1 -18 18 a18 18 0 0 0 18 14 z" fill="none" stroke="#fbbf24" stroke-width="4"/>
      <path d="M34 -30 a18 18 0 0 0 18 18 a18 18 0 0 1 -18 14 z" fill="none" stroke="#fbbf24" stroke-width="4"/>
      <rect x="-8" y="2" width="16" height="20" fill="#f59e0b"/><rect x="-22" y="22" width="44" height="10" rx="4" fill="#fbbf24"/>
      <text y="-4" text-anchor="middle" font-size="22">🔬</text></g>
    <g fill="#fbbf24" font-size="14"><text x="64" y="46">✦</text><text x="246" y="58">✦</text><text x="80" y="150">✦</text><text x="236" y="140">✦</text></g>
  </svg>`,

  /* Что такое ИИ — мозг-сеть со вспышкой */
  brainSpark: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g transform="translate(160,90)">
      <g stroke="#a78bfa" stroke-width="1.1" opacity=".5">
        <line x1="-50" y1="-30" x2="-10" y2="-44"/><line x1="-10" y1="-44" x2="34" y2="-26"/><line x1="34" y1="-26" x2="56" y2="10"/>
        <line x1="56" y1="10" x2="22" y2="40"/><line x1="22" y1="40" x2="-30" y2="36"/><line x1="-30" y1="36" x2="-50" y2="-30"/>
        <line x1="-10" y1="-44" x2="-30" y2="36"/><line x1="34" y1="-26" x2="-30" y2="36"/><line x1="-50" y1="-30" x2="56" y2="10"/><line x1="0" y1="-4" x2="34" y2="-26"/><line x1="0" y1="-4" x2="22" y2="40"/></g>
      <g><circle cx="-50" cy="-30" r="6" fill="#5eead4"/><circle cx="-10" cy="-44" r="6" fill="#a78bfa"/><circle cx="34" cy="-26" r="6" fill="#f472b6"/>
        <circle cx="56" cy="10" r="6" fill="#5eead4"/><circle cx="22" cy="40" r="6" fill="#fbbf24"/><circle cx="-30" cy="36" r="6" fill="#a78bfa"/>
        <circle cx="0" cy="-4" r="9" fill="#fff7ad"/></g>
    </g>
    <text x="160" y="166" text-anchor="middle" font-family="Manrope" font-size="13" fill="#bcbbe6">программа, которая учится угадывать</text>
  </svg>`,

  /* ИИ — не живой робот из кино */
  notRobot: `<svg viewBox="0 0 320 180" class="illo-svg" font-family="Manrope">
    <g transform="translate(70,52)"><rect width="76" height="64" rx="16" fill="rgba(251,113,133,.12)" stroke="#fb7185" stroke-width="2"/>
      <circle cx="26" cy="26" r="7" fill="#fb7185"/><circle cx="50" cy="26" r="7" fill="#fb7185"/><path d="M22 46 q16 -10 32 0" stroke="#fb7185" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="6" y1="6" x2="70" y2="58" stroke="#fb7185" stroke-width="4" stroke-linecap="round"/></g>
    <text x="108" y="138" text-anchor="middle" font-size="12" font-weight="600" fill="#fb7185">не живой / не думает</text>
    <g transform="translate(186,52)"><rect width="76" height="64" rx="16" fill="#fbf7ff"/>
      <circle cx="26" cy="28" r="8" fill="#1a1430"/><circle cx="50" cy="28" r="8" fill="#1a1430"/><circle cx="28" cy="25" r="2.4" fill="#fff"/><circle cx="52" cy="25" r="2.4" fill="#fff"/>
      <path d="M24 46 q14 10 28 0" stroke="#1a1430" stroke-width="3" fill="none" stroke-linecap="round"/>
      <line x1="38" y1="0" x2="38" y2="-12" stroke="#5eead4" stroke-width="3"/><circle cx="38" cy="-14" r="4" fill="#fbbf24"/></g>
    <text x="224" y="138" text-anchor="middle" font-size="12" font-weight="600" fill="#5eead4">просто умный инструмент</text>
  </svg>`,

  /* Облако против ноута — твой ИИ */
  cloudLaptop: `<svg viewBox="0 0 320 180" class="illo-svg">
    <g transform="translate(36,46)"><path d="M20 40 a22 22 0 0 1 4 -43 a26 26 0 0 1 48 6 a18 18 0 0 1 -2 37 z" fill="rgba(167,139,250,.25)" stroke="#a78bfa" stroke-width="2"/><text x="40" y="30" text-anchor="middle" font-size="22">☁️</text></g>
    <text x="92" y="150" text-anchor="middle" font-family="Manrope" font-size="12" fill="#bcbbe6">облако (чужой сервер)</text>
    <text x="160" y="96" text-anchor="middle" font-size="20" fill="#fbbf24">⚡</text>
    <g transform="translate(196,52)"><rect x="0" y="0" width="88" height="56" rx="6" fill="#0a0726" stroke="#5eead4" stroke-width="2"/><rect x="8" y="8" width="72" height="40" rx="3" fill="rgba(94,234,212,.15)"/><text x="44" y="36" text-anchor="middle" font-size="20">🤖</text><rect x="-8" y="58" width="104" height="8" rx="3" fill="#5eead4"/></g>
    <text x="240" y="150" text-anchor="middle" font-family="Manrope" font-size="12" fill="#5eead4">твой ноут (только твой)</text>
  </svg>`
};
