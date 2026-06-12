(function() {
  // ── Styles ────────────────────────────────────────────────────────────────
  var css = `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600&display=swap');
    #sel-moon-phase {
      background: #252a3a !important;
      border: 1px solid rgba(255,255,255,0.07) !important;
      border-radius: 10px !important;
      padding: 16px 18px 14px !important;
      color: #c8cfe0 !important;
      width: 100% !important;
      max-width: 280px !important;
      position: relative !important;
      overflow: hidden !important;
      font-family: Georgia, serif !important;
      box-sizing: border-box !important;
    }
    #lune-glow {
      position: absolute; top: -50px; right: -50px;
      width: 140px; height: 140px;
      pointer-events: none; border-radius: 50%;
    }
    #lune-header {
      font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
      color: rgba(160,170,200,0.4); margin-bottom: 12px;
    }
    #lune-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
      padding: 3px 9px; border-radius: 99px; margin-bottom: 13px;
    }
    #lune-main {
      display: flex; align-items: flex-start; gap: 13px; margin-bottom: 13px;
    }
    #lune-icon {
      flex-shrink: 0; width: 48px; height: 48px;
      display: flex; align-items: center; justify-content: center;
    }
    #lune-step-name {
      font-size: 13px; font-weight: 600; color: #c8cfe0;
      letter-spacing: 0.03em; margin-bottom: 4px;
    }
    #lune-step-desc {
      font-size: 11px; color: rgba(180,185,210,0.5); line-height: 1.55;
    }
    #lune-sep {
      height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 11px;
    }
    #lune-progress-label {
      display: flex; justify-content: space-between;
      font-size: 10px; color: rgba(160,170,200,0.35);
      margin-bottom: 5px; letter-spacing: 0.03em;
    }
    #lune-track {
      background: rgba(255,255,255,0.06); border-radius: 99px;
      height: 4px; overflow: hidden; margin-bottom: 4px; position: relative;
    }
    #lune-fill {
      height: 100%; border-radius: 99px; position: relative; transition: width 0.4s ease;
    }
    #lune-fill::after {
      content: ''; position: absolute; right: 0; top: 0; bottom: 0;
      width: 4px; background: rgba(255,255,255,0.55); border-radius: 99px;
    }
    #lune-markers {
      display: flex; justify-content: space-between;
      padding: 0 1px; margin-bottom: 11px;
    }
    .lune-dot { width: 1px; height: 4px; background: rgba(255,255,255,0.1); }
    #lune-next {
      display: flex; justify-content: space-between;
      align-items: center; margin-bottom: 12px;
    }
    #lune-next-label { font-size: 10px; color: rgba(160,170,200,0.3); letter-spacing: 0.05em; }
    #lune-next-info  { display: flex; align-items: center; gap: 5px; font-size: 11px; color: rgba(190,190,220,0.6); }
    #lune-next-days  { font-size: 10px; color: rgba(160,170,200,0.3); }
    #lune-footer {
      border-top: 1px solid rgba(255,255,255,0.05); padding-top: 9px;
      display: flex; justify-content: space-between; align-items: center;
    }
    #lune-date  { font-size: 9px; color: rgba(160,170,200,0.2); letter-spacing: 0.07em; }
    #lune-link  {
      font-size: 9px; color: rgba(160,170,200,0.35); text-decoration: none;
      letter-spacing: 0.04em; border-bottom: 1px solid rgba(160,170,200,0.15);
      padding-bottom: 1px;
    }
  `;

  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ── HTML ──────────────────────────────────────────────────────────────────
  var container = document.getElementById('sel-moon-phase');
  if (!container) return;

  container.innerHTML = `
    <div id="lune-glow"></div>
    <div id="lune-header">⬡ Face cachée de la Lune</div>
    <div id="lune-badge"></div>
    <div id="lune-main">
      <div id="lune-icon"></div>
      <div style="flex:1">
        <div id="lune-step-name">…</div>
        <div id="lune-step-desc">…</div>
      </div>
    </div>
    <div id="lune-sep"></div>
    <div id="lune-progress-label">
      <span>Progression du cycle</span>
      <span id="lune-pct">0 %</span>
    </div>
    <div id="lune-track"><div id="lune-fill" style="width:0%"></div></div>
    <div id="lune-markers">
      <div class="lune-dot"></div><div class="lune-dot"></div><div class="lune-dot"></div>
      <div class="lune-dot"></div><div class="lune-dot"></div>
    </div>
    <div id="lune-next">
      <span id="lune-next-label">PROCHAINE ÉTAPE →</span>
      <span id="lune-next-info">
        <span id="lune-next-glyph" style="font-size:13px"></span>
        <span id="lune-next-name"></span>
        <span id="lune-next-days"></span>
      </span>
    </div>
    <div id="lune-footer">
      <span id="lune-date"></span>
      <a id="lune-link" href="LIEN_PAGE_EXPLICATIVE">Comprendre les cycles ↗</a>
    </div>
  `;

  // ── Calculs ───────────────────────────────────────────────────────────────
  var YEAR_OFFSET = 46;
  var SYNODIC     = 29.53058867;

  function julianDay(date) {
    var y = date.getFullYear(), mo = date.getMonth()+1, d = date.getDate();
    var a = Math.floor((14-mo)/12);
    var yr = y+4800-a, m = mo+12*a-3;
    return d + Math.floor((153*m+2)/5) + 365*yr
         + Math.floor(yr/4) - Math.floor(yr/100) + Math.floor(yr/400) - 32045 - 0.5;
  }

  function moonPhase(date) {
    var p = ((julianDay(date) - 2451550.1) % SYNODIC) / SYNODIC;
    if (p < 0) p += 1;
    return p;
  }

  function hiddenPhase(p) { return (p + 0.5) % 1; }

  var STEPS = {
    jour: [
      { key:'aube',       minF:0,   maxF:0.2, season:'jour', name:"L'Aube",
        descs:["La première lueur rase l'horizon, les ombres s'étirent à l'infini.","La lumière arrive en oblique, froide et aveuglante après l'obscurité.","Le sol commence à se réchauffer. Les premières heures de clarté."] },
      { key:'jour_plein', minF:0.2, maxF:0.8, season:'jour', name:'Le Jour Plein',
        descs:["Le Soleil est haut. Pas d'ombre. La chaleur est sans merci.","Lumière directe, aveuglante. Aucun abri naturel ne tient.","Le régolite brûle. La surface est un désert de lumière blanche.","Midi lunaire : le ciel noir tranche avec la roche éclatante.","La chaleur atteint son pic. Rester à l'extérieur est dangereux."] },
      { key:'declin',     minF:0.8, maxF:1.0, season:'jour', name:'Le Déclin',
        descs:["La lumière rougit, les ombres s'allongent à nouveau.","Le Soleil s'approche de l'horizon. La nuit n'est plus loin.","Dernières heures de chaleur. Le ciel vire à l'ocre sombre."] },
    ],
    nuit: [
      { key:'nuit_profonde',   minF:0,   maxF:0.2, season:'nuit', name:'La Nuit Profonde',
        descs:["Obscurité absolue. Les étoiles sont la seule source de lumière.","Pas un photon du Soleil. Seul le cosmos lointain éclaire.","Le froid s'installe rapidement. La nuit vient de tomber."] },
      { key:'nuit_stable',     minF:0.2, maxF:0.8, season:'nuit', name:'La Nuit Stable',
        descs:["Un tapis d'étoiles sans limites. Rien d'autre.","Le silence et le froid règnent. La Voie Lactée est nette.","Nuit profonde et stable. Le froid atteint son minimum.","Des milliers d'étoiles, immobiles. Pas le moindre frémissement.","La nuit est à son apogée. Le temps semble suspendu."] },
      { key:'nuit_finissante', minF:0.8, maxF:1.0, season:'nuit', name:'La Nuit Finissante',
        descs:["Une lueur rasante pointe à l'horizon. L'aube approche.","Les étoiles pâlissent à l'est. Le Soleil n'est plus loin.","La nuit touche à sa fin. Quelques heures encore."] },
    ]
  };

  function svgNuit() {
    return '<svg width="44" height="44" viewBox="0 0 46 46" fill="none">'
      +'<circle cx="23" cy="23" r="18" fill="#1a1d2e" stroke="rgba(120,110,190,0.25)" stroke-width="0.75"/>'
      +'<circle cx="23" cy="23" r="13" fill="none" stroke="rgba(120,110,190,0.12)" stroke-width="0.5"/>'
      +'<text x="23" y="28" text-anchor="middle" font-size="17" fill="rgba(160,155,210,0.85)" font-family="Georgia,serif">✦</text>'
      +'<text x="11" y="16" text-anchor="middle" font-size="7" fill="rgba(160,155,210,0.35)" font-family="Georgia,serif">✧</text>'
      +'<text x="36" y="32" text-anchor="middle" font-size="5" fill="rgba(160,155,210,0.25)" font-family="Georgia,serif">✦</text>'
      +'<text x="33" y="13" text-anchor="middle" font-size="6" fill="rgba(160,155,210,0.2)" font-family="Georgia,serif">✧</text>'
      +'</svg>';
  }

  function svgJour() {
    return '<svg width="44" height="44" viewBox="0 0 46 46" fill="none">'
      +'<line x1="23" y1="2" x2="23" y2="8" stroke="rgba(190,130,70,0.3)" stroke-width="1"/>'
      +'<line x1="23" y1="38" x2="23" y2="44" stroke="rgba(190,130,70,0.3)" stroke-width="1"/>'
      +'<line x1="2" y1="23" x2="8" y2="23" stroke="rgba(190,130,70,0.3)" stroke-width="1"/>'
      +'<line x1="38" y1="23" x2="44" y2="23" stroke="rgba(190,130,70,0.3)" stroke-width="1"/>'
      +'<line x1="8.5" y1="8.5" x2="12.7" y2="12.7" stroke="rgba(190,130,70,0.18)" stroke-width="1"/>'
      +'<line x1="33.3" y1="33.3" x2="37.5" y2="37.5" stroke="rgba(190,130,70,0.18)" stroke-width="1"/>'
      +'<line x1="37.5" y1="8.5" x2="33.3" y2="12.7" stroke="rgba(190,130,70,0.18)" stroke-width="1"/>'
      +'<line x1="12.7" y1="33.3" x2="8.5" y2="37.5" stroke="rgba(190,130,70,0.18)" stroke-width="1"/>'
      +'<circle cx="23" cy="23" r="11" fill="#1e1810" stroke="rgba(190,130,70,0.35)" stroke-width="0.75"/>'
      +'<circle cx="23" cy="23" r="7" fill="rgba(190,130,70,0.1)" stroke="rgba(190,130,70,0.22)" stroke-width="0.5"/>'
      +'<circle cx="23" cy="23" r="3" fill="rgba(190,130,70,0.45)"/>'
      +'</svg>';
  }

  function getStepInfo(hp) {
    var isJour = hp < 0.5;
    var season = isJour ? 'jour' : 'nuit';
    var fracInSeason = isJour ? hp / 0.5 : (hp - 0.5) / 0.5;
    var steps = STEPS[season];
    var step = steps[steps.length-1];
    for (var i = 0; i < steps.length; i++) {
      if (fracInSeason >= steps[i].minF && fracInSeason < steps[i].maxF) { step = steps[i]; break; }
    }
    var stepRange    = step.maxF - step.minF;
    var fracInStep   = Math.min((fracInSeason - step.minF) / stepRange, 0.9999);
    var descIdx      = Math.min(Math.floor(fracInStep * step.descs.length), step.descs.length-1);
    var daysRemaining = (1 - fracInStep) * stepRange * (SYNODIC / 2);
    var stepIdx = steps.indexOf(step);
    var nextStep = stepIdx < steps.length-1 ? steps[stepIdx+1] : STEPS[season === 'jour' ? 'nuit' : 'jour'][0];
    return { step: step, descIdx: descIdx, daysRemaining: daysRemaining, nextStep: nextStep, globalPct: Math.round(hp * 100) };
  }

  function render() {
    var now  = new Date();
    var hp   = hiddenPhase(moonPhase(now));
    var info = getStepInfo(hp);
    var step = info.step, season = step.season;

    // lueur
    var glowColors = { nuit: 'rgba(110,95,200,0.13)', jour: 'rgba(190,110,50,0.12)' };
    document.getElementById('lune-glow').style.background =
      'radial-gradient(circle, ' + glowColors[season] + ' 0%, transparent 68%)';

    // badge
    var badge = document.getElementById('lune-badge');
    if (season === 'nuit') {
      badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:3px 9px;border-radius:99px;margin-bottom:13px;background:rgba(100,90,160,0.2);border:1px solid rgba(130,120,200,0.2);color:#a099d0;';
      badge.innerHTML = '<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="none" stroke="#a099d0" stroke-width="1"/><circle cx="5" cy="5" r="1.5" fill="#a099d0"/></svg> La Nuit';
    } else {
      badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;font-size:10px;font-weight:600;letter-spacing:0.08em;padding:3px 9px;border-radius:99px;margin-bottom:13px;background:rgba(160,80,40,0.2);border:1px solid rgba(190,110,60,0.2);color:#c49070;';
      badge.innerHTML = '<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" fill="#c49070"/><line x1="5" y1="0" x2="5" y2="2.5" stroke="#c49070" stroke-width="1"/><line x1="5" y1="7.5" x2="5" y2="10" stroke="#c49070" stroke-width="1"/><line x1="0" y1="5" x2="2.5" y2="5" stroke="#c49070" stroke-width="1"/><line x1="7.5" y1="5" x2="10" y2="5" stroke="#c49070" stroke-width="1"/></svg> Le Grand Jour';
    }

    document.getElementById('lune-icon').innerHTML = season === 'nuit' ? svgNuit() : svgJour();
    document.getElementById('lune-step-name').textContent = step.name;
    document.getElementById('lune-step-desc').textContent = step.descs[info.descIdx];

    var fill = document.getElementById('lune-fill');
    fill.style.width = info.globalPct + '%';
    fill.style.background = season === 'nuit'
      ? 'linear-gradient(90deg,#3a3060,#7a6fd0)'
      : 'linear-gradient(90deg,#5a2e10,#c47830)';
    document.getElementById('lune-pct').textContent = info.globalPct + ' %';

    var glyphMap = { aube:'☀', jour_plein:'☀', declin:'☀', nuit_profonde:'☾', nuit_stable:'✦', nuit_finissante:'☾' };
    var ng = document.getElementById('lune-next-glyph');
    ng.textContent = glyphMap[info.nextStep.key] || '·';
    ng.style.color = season === 'nuit' ? 'rgba(160,155,210,0.65)' : 'rgba(190,130,70,0.65)';
    document.getElementById('lune-next-name').textContent = info.nextStep.name;
    var d = Math.floor(info.daysRemaining), h = Math.round((info.daysRemaining - d) * 24);
    document.getElementById('lune-next-days').textContent = d > 0 ? 'dans ' + d + 'j ' + h + 'h' : 'dans ' + h + 'h';

    var shown = new Date(now);
    shown.setFullYear(shown.getFullYear() - YEAR_OFFSET);
    var jours = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
    var mois  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    document.getElementById('lune-date').textContent =
      jours[shown.getDay()] + ' ' + shown.getDate() + ' ' + mois[shown.getMonth()] + ' ' + shown.getFullYear();
  }

  render();
  setInterval(render, 30 * 60 * 1000);
})();
