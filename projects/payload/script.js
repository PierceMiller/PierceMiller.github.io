const configs = {
      1: { MTOW: 79015, MLW: 66360, OEW: 43000 },
      2: { MTOW: 78300, MLW: 66000, OEW: 43600 }
    };

    const planeEl   = document.getElementById("plane");
    const fuelEl    = document.getElementById("fuel");
    const extrasEl  = document.getElementById("extras");
    const burnoffEl = document.getElementById("burnoff");
    const resultsEl = document.getElementById("results");

    function update() {
      const cfg   = configs[planeEl.value];
      const fuel  = Number(fuelEl.value);
      const extras = Number(extrasEl.value);
      const burn  = Number(burnoffEl.value);

      const takeoffLimit  = cfg.MTOW - (cfg.OEW + fuel + extras);
      const landingFuel   = Math.max(fuel - burn, 0);
      const landingLimit  = cfg.MLW - (cfg.OEW + landingFuel + extras);
      const limitingPay   = Math.min(takeoffLimit, landingLimit);

      resultsEl.innerHTML = `
        <strong>Aircraft:</strong> B737-800BCF ${planeEl.value}<br>
        <strong>OEW:</strong> ${cfg.OEW.toLocaleString()} kg<br>
        <span class="${takeoffLimit < 0 ? 'text-bad' : ''}">
          <strong>Takeoff Payload Limit:</strong> ${takeoffLimit.toLocaleString()} kg
        </span><br>
        <span class="${landingLimit < 0 ? 'text-bad' : ''}">
          <strong>Landing Payload Limit:</strong> ${landingLimit.toLocaleString()} kg
        </span><br>
        <strong class="${limitingPay < 0 ? 'text-bad' : 'text-good'}">
          Limiting Payload: ${limitingPay.toLocaleString()} kg
        </strong>
      `;
    }

    [planeEl, fuelEl, extrasEl, burnoffEl].forEach(el => el.addEventListener("input", update));

    update();