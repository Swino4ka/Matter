// === Переменные игры ===
let matter = 0;
let totalMatter = 0;
let maxMatter = 0;
let maxProduction = 0;
let hasDistilledOnce = false;
let distillPoints = 0;
let realityResets = 0;
let realityBoost = 1;

let uselessClicks = 0;
let achHoverCount = 0;
let statTabOpened = 0;
let inputBuffer = "";
let lastDistillTime = 0;
let sessionCount = 1;
let lastSessionTime = Date.now();
let clickedAchievementPopup = false;
let manualResetUsed = false;
let typedAntimatter = false;
let distillUpgrades = {
  gen1Boost: false,
  unlockHardPrestige: false
};
let gen1 = {
  amount: 0,
  cost: 10,
  production: 1
};

const allAchievements = [
  {
    id: "matter100",
    title: "Первые шаги",
    description: "Накопи 100 материи",
    condition: () => matter >= 100
  },
  {
    id: "matter1k",
    title: "Маленький прорыв",
    description: "Накопи 1,000 материи",
    condition: () => matter >= 1_000
  },
  {
    id: "matter1m",
    title: "Путь к миллиону",
    description: "Накопи 1,000,000 материи",
    condition: () => matter >= 1_000_000
  },
  {
    id: "matter1b",
    title: "Дальше — только звёзды",
    description: "Накопи 1,000,000,000 материи",
    condition: () => matter >= 1_000_000_000
  },
  {
    id: "firstDistill",
    title: "Чистота!",
    description: "Соверши первую дестиляцию",
    condition: () => hasDistilledOnce
  },
  {
    id: "fastDistill",
    title: "На горячем пару",
    description: "Сделай дестиляцию в течение 10 минут после предыдущей",
    condition: () => Date.now() - lastDistillTime < 10 * 60 * 1000 && hasDistilledOnce
  },
  {
    id: "firstReality",
    title: "Реальность — это иллюзия",
    description: "Слей свою первую реальность",
    condition: () => realityResets >= 1
  },
  {
    id: "comeBack",
    title: "Ты вернулся!",
    description: "Открой игру повторно после закрытия вкладки",
    condition: () => sessionCount > 1
  },
  {
    id: "comeBackNextDay",
    title: "Новый день — новые материи",
    description: "Зайди в игру спустя сутки",
    condition: () => Date.now() - lastSessionTime > 24 * 60 * 60 * 1000
  },
  {
    id: "clickedPopup",
    title: "Ого, ты успел!",
    description: "Кликни по вылетевшему достижению",
    condition: () => clickedAchievementPopup === true
  },
  {
    id: "resetStat",
    title: "НЕЕЕЕЕЕТ!",
    description: "Сбрось весь прогресс вручную через настройки",
    condition: () => manualResetUsed === true
  },
  {
    id: "typingAntimatter",
    title: "Это было бы странно",
    description: "Введи 'antimatter dimensions' или 'измерения антиматерии'",
    condition: () => typedAntimatter === true
  },
  {
    id: "gainRate10",
    title: "Завод запущен",
    description: "Достигни 10 материи/сек",
    condition: () => getMatterRate() >= 10
  },
  {
    id: "gainRate1000",
    title: "Уже серьёзно",
    description: "Достигни 1,000 материи/сек",
    condition: () => getMatterRate() >= 1000
  },
  {
    id: "statClicker",
    title: "Цифры… везде цифры",
    description: "Открой вкладку статистики 10 раз",
    condition: () => statTabOpened >= 10
  },  
  {
    id: "hover50times",
    title: "Любопытный",
    description: "Наведи на достижения 50 раз",
    condition: () => achHoverCount >= 50
  },  
  {
    id: "clickNothing",
    title: "…и тишина",
    description: "Нажми 10 раз по пустому месту на экране",
    condition: () => uselessClicks >= 10,
    type: "secret"
  },  
  {
    id: "secretImpossible",
    title: "🕳️ Ошибка симуляции",
    description: "Тебе не должно было это выпасть...",
    condition: () => Math.floor(Math.random() * 1_000_000_000) === 0,
    type: "secret"
  }
];

document.addEventListener("click", e => {
  if (e.target.classList.contains("ach-popup")) {
    clickedAchievementPopup = true;
  }
});

document.addEventListener("keydown", (e) => {
  inputBuffer = (inputBuffer || "") + e.key.toLowerCase();
  if (inputBuffer.includes("antimatterdimensions") || inputBuffer.includes("измеренияантиматерии")) {
    typedAntimatter = true;
  }
  if (inputBuffer.length > 50) inputBuffer = inputBuffer.slice(-50);
});

let achievements = {};

function calculateAchievementBoost() {
  const count = Object.values(achievements).filter(Boolean).length;
  return 1 + 0.1 * count;
}

function formatNumber(num) {
  if (num >= 1e15) return num.toExponential(2).replace("+", "");
  if (num >= 1e15) return (num / 1e15).toFixed(2) + "q";
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "t";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "b";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "m";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "k";
  return Math.floor(num).toString();
}

// === Обновление UI ===
function updateUI() {
  document.getElementById("matter").textContent = formatNumber(Math.floor(matter));

  generators.forEach((gen, index) => {
    if (!gen.unlocked) return;
  
    const amountEl = document.getElementById(`gen${index}-amount`);
    const priceEl = document.getElementById(`gen${index}-price`);
  
    if (amountEl) amountEl.textContent = `${gen.amount}x`;
    if (priceEl) {
      priceEl.textContent = `Цена: ${formatNumber(gen.cost)}`;
      priceEl.classList.remove("affordable", "too-expensive");
      if (matter >= gen.cost) {
        priceEl.classList.add("affordable");
      } else {
        priceEl.classList.add("too-expensive");
      }
    }
  });
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  const rate = gen1.amount * gen1.baseProduction * boost;
  const rateEl = document.getElementById("matterRate");
  if (rateEl) {
    rateEl.textContent = `Производство: ${rate.toFixed(2)}/сек`;
  }
  if (tabContent && tabContent.querySelector("h3")?.textContent === "📊 Статистика") {
    tabContent.innerHTML = tabs.stats();
  }  
}

function generateMatter() {
  matter += 1;
  updateUI();
}

function buyGenerator() {
  if (matter >= gen1.cost) {
    matter -= gen1.cost;
    gen1.amount++;
    gen1.cost = Math.floor(gen1.cost * 1.5);
    updateUI();
  }
}

let ticksPerSecond = 10; // 10 тиков в секунду = каждые 100мс

setInterval(() => {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  const base = distillUpgrades.gen1Boost ? 1.2 : 1;
  const gain = (gen1.amount * gen1.baseProduction * boost * base * realityBoost * calculateAchievementBoost()) / ticksPerSecond;
  totalMatter += gain;
  if (matter > maxMatter) {
    maxMatter = matter;
  }
  if (gain * ticksPerSecond > maxProduction) {
    maxProduction = gain * ticksPerSecond;
  }
  matter += gain;
  allAchievements.forEach(a => {
    if (!achievements[a.id] && a.condition()) {
      achievements[a.id] = true;
      showAchievementPopup(a.title);
    }
  });  
  updateUI();
}, 100);

function getMatterRate() {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  return gen1.amount * gen1.baseProduction * boost * realityBoost * calculateAchievementBoost();
}

// === Сохранение игры ===
function saveGame() {
  const saveData = {
    matter,
    totalMatter,
    achievements,
    lastDistillTime,
    sessionCount,
    lastSessionTime,
    clickedAchievementPopup,
    manualResetUsed,
    typedAntimatter,
    maxMatter,
    maxProduction,
    generators,
    distillPoints,
    distillUpgrades,
    hasDistilledOnce,
    realityResets,
    realityBoost,
    lastSaved: Date.now()
  };
  localStorage.setItem("matterSave", JSON.stringify(saveData));
  updateLastSavedTime();
  console.log("Игра сохранена!");
}

function openAchievementModal(id) {
  const ach = allAchievements.find(a => a.id === id);
  if (!ach) return;

  const unlocked = achievements[ach.id];
  const isSecret = ach.type === "secret" && !unlocked;

  document.getElementById("achModalTitle").textContent = isSecret ? "???" : ach.title;
  document.getElementById("achModalDesc").textContent = isSecret ? "???" : ach.description;
  document.getElementById("achievementModal").classList.remove("hidden");
}

function closeAchievementModal() {
  document.getElementById("achievementModal").classList.add("hidden");
}

function showAchievementPopup(text) {
  const el = document.createElement("div");
  el.className = "ach-popup";
  el.textContent = `🏆 Достижение: ${text.length > 40 ? text.slice(0, 40) + '...' : text}`;
  document.getElementById("achievementPopupContainer").appendChild(el);

  spawnAchievementConfetti();

  setTimeout(() => el.remove(), 2500);
}

function spawnAchievementConfetti() {
  const symbols = ['✨', '🌟', '🎉', '💫', '⭐'];
  for (let i = 0; i < 15; i++) {
    const conf = document.createElement("div");
    conf.className = "confetti";
    conf.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    conf.style.position = "fixed";
    conf.style.left = "30px";
    conf.style.top = "40px";
    conf.style.fontSize = `${Math.random() * 10 + 12}px`;
    conf.style.color = `hsl(${Math.random() * 360}, 80%, 70%)`;
    conf.style.zIndex = 999;
    conf.style.pointerEvents = "none";

    const dx = (Math.random() - 0.5) * 200;
    const dy = -Math.random() * 100 - 50;

    conf.animate([
      { transform: "translate(0, 0)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px)`, opacity: 0 }
    ], {
      duration: 1000,
      easing: "ease-out"
    });

    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 1000);
  }
}

function calculateDistillPoints() {
    const threshold = 1e5; // стартовая цена
    const base = matter / threshold;
    return base >= 1 ? Math.floor(Math.pow(base, 0.5)) : 0;
}

function nextDistillCost() {
  const threshold = 1e5;
  const currentPoints = calculateDistillPoints();
  const nextTarget = Math.pow(currentPoints + 1, 2) * threshold;
  return nextTarget;
}

function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
  return Math.floor(num);
}


function updateLastSavedTime() {
  const span = document.getElementById("lastSavedTime");
  if (span) {
    const time = new Date().toLocaleTimeString();
    span.textContent = time;
  }
}

function loadGame() {
  const save = localStorage.getItem("matterSave");
  if (save) {
    const data = JSON.parse(save);

    matter = data.matter || 0;
    totalMatter = data.totalMatter || 0;
    achievements = data.achievements || {};
    lastDistillTime = data.lastDistillTime || 0;
    sessionCount = data.sessionCount || 1;
    lastSessionTime = data.lastSessionTime || Date.now();
    clickedAchievementPopup = data.clickedAchievementPopup || false;
    manualResetUsed = data.manualResetUsed || false;
    typedAntimatter = data.typedAntimatter || false;
    maxMatter = data.maxMatter || 0;
    maxProduction = data.maxProduction || 0;
    distillPoints = data.distillPoints || 0;
    hasDistilledOnce = data.hasDistilledOnce || false;
    realityResets = data.realityResets || 0;
    realityBoost = data.realityBoost || 1;

    // Генераторы
    if (Array.isArray(data.generators)) {
      generators.forEach((g, i) => {
        if (data.generators[i]) {
          g.amount = data.generators[i].amount || 0;
          g.cost = data.generators[i].cost || Math.pow(10, i + 1);
          g.unlocked = data.generators[i].unlocked || false;
        }
      });
    }

    distillUpgrades = data.distillUpgrades || {
      gen1Boost: false,
      unlockHardPrestige: false
    };

    if (hasDistilledOnce) {
      document.getElementById("openShopBtn")?.classList.remove("hidden");
    }

    updateUI();
    renderGenerators();
    setTimeout(updateLastSavedTime, 100);
    console.log("Игра загружена!");
  }
}


function autoSaveLoop() {
  setInterval(saveGame, 60000); // раз в 60 сек
}

// === Кнопки UI ===
document.getElementById("generateMatterBtn").addEventListener("click", generateMatter);

// === Tabs ===
const tabButtons = document.querySelectorAll(".tabBtn");
const tabContent = document.getElementById("tabContent");

const tabs = {
    prestige: () => {
        const available = calculateDistillPoints();
        const next = nextDistillCost();
      
        let html = `
          <h3>💠 Престиж: Дестилляция</h3>
          <p>Ты можешь получить <strong>${available}</strong> очков дестилляции (ОД).</p>
          <p><strong>Текущие очки дестилляции (ОД):</strong> ${distillPoints}</p>
          <p class="distill-next-cost">Следующее ОД через: <strong>${formatNumber(next)}</strong> материи</p>
          <div class="distill-controls">
            <button onclick="performDistill()">Дестиллировать</button>
            <button class="info-btn" onclick="openDistillInfo()">ℹ️</button>
          </div>
        `;
      
        if (distillUpgrades.unlockHardPrestige) {
          const currentMult = Math.max(1, Math.floor(Math.pow(totalMatter / 1e6, 0.25)));
          html += `
            <h4 style="margin-top: 30px;">🌀 Слияние Реальностей</h4>
            <p>Сброс всего прогресса (включая генераторы и дестилляцию)</p>
            <p><strong>Множитель производства после слияния:</strong> ${currentMult}x</p>
            <button onclick="performRealityReset()">Слить реальность</button>
            <button class="info-btn" onclick="openRealityInfo()">ℹ️</button>
            <p><strong>Количество слияний:</strong> ${realityResets}</p>
            <p><strong>Текущий буст производства:</strong> ${realityBoost.toFixed(2)}x</p>
          `;
        }
      
        return html;
      },      
      achievements: () => {
        const grid = allAchievements.map(a => {
          const unlocked = achievements[a.id];
          const isSecret = a.type === "secret" && !unlocked;
      
          const title = isSecret ? "???" : a.title;
          const symbol = unlocked ? "🏆" : (isSecret ? "❓" : "❔");
      
          return `
            <div class="ach-box ${unlocked ? 'ach-unlocked' : `ach-locked ${isSecret ? 'secret' : ''}`}"
                 title="${title}" 
                 onclick="openAchievementModal('${a.id}')">
              ${symbol}
            </div>
          `;
        }).join('');

        setTimeout(() => {
            document.querySelectorAll(".ach-box").forEach(el => {
              el.addEventListener("mouseenter", () => {
                achHoverCount++;
              });
            });
          }, 50);          
      
        return `
          <h3>🏆 Достижения</h3>
          <div class="ach-grid">${grid}</div>
        `;
      },      
    stats: () => {
        let genList = generators.map((g, i) => `<li>${g.name}: ${g.amount}x</li>`).join('');
        return `
          <h3>📊 Статистика</h3>
          <ul>
            <li><strong>Текущая материя:</strong> ${formatNumber(Math.floor(matter))}</li>
            <li><strong>Всего накоплено материи:</strong> ${formatNumber(Math.floor(totalMatter))}</li>
            <li><strong>Максимум материи:</strong> ${formatNumber(Math.floor(maxMatter))}</li>
            <li><strong>Макс. производство/сек:</strong> ${formatNumber(maxProduction.toFixed(2))}</li>
            <li><strong>Всего генераторов:</strong> ${formatNumber(generators.reduce((a, g) => a + g.amount, 0))}</li>
            <li><strong>По уровням:</strong><ul>${genList}</ul></li>
          </ul>
        `;
      },
    settings: `
      <h3>⚙️ Настройки</h3>
      <button id="saveNowBtn">💾 Сохранить сейчас</button>
      <button id="resetBtn">🗑️ Сбросить прогресс</button>
      <button id="exportBtn">📤 Экспорт</button>
      <button id="importBtn">📥 Импорт</button>
      <input type="text" id="importField" placeholder="Вставьте сохранение" style="width:100%; margin-top: 10px;" />
      <p style="margin-top: 10px;">Последнее сохранение: <span id="lastSavedTime">—</span></p>
    `
};

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const tab = btn.dataset.tab;
    tabContent.innerHTML = typeof tabs[tab] === "function" ? tabs[tab]() : tabs[tab];
    if (tab === "stats") statTabOpened++;
  });
});

document.addEventListener("click", (e) => {
  const id = e.target.id;

  if (!e.target.closest(".modal, .ach-box, button, .tabBtn, section")) {
    uselessClicks++;
  }  

  if (id === "saveNowBtn") {
    saveGame();
    alert("Игра сохранена вручную!");
  }

  if (id === "resetBtn") {
    if (confirm("Ты уверен, что хочешь сбросить весь прогресс?")) {
      localStorage.removeItem("matterSave");
      location.reload();
      manualResetUsed = true;
      saveGame();
    }
  }

  if (id === "exportBtn") {
    const saveData = localStorage.getItem("matterSave");
    navigator.clipboard.writeText(saveData).then(() => {
      alert("Сохранение скопировано в буфер обмена!");
    });
  }

  if (id === "importBtn") {
    const importStr = document.getElementById("importField").value;
    try {
      const parsed = JSON.parse(importStr);
      localStorage.setItem("matterSave", JSON.stringify(parsed));
      alert("Сохранение импортировано! Перезагружаем...");
      location.reload();
    } catch {
      alert("Невозможно импортировать. Неверный формат!");
    }
  }
});

const generators = [
  { name: "Генератор 1", amount: 0, baseProduction: 1, cost: 10, unlocked: true },
  { name: "Генератор 2", amount: 0, cost: 100, unlocked: false },
  { name: "Генератор 3", amount: 0, cost: 1000, unlocked: false },
  { name: "Генератор 4", amount: 0, cost: 10000, unlocked: false },
];

function renderGenerators() {
  const container = document.getElementById("generatorsContainer");
  container.innerHTML = "";

  generators.forEach((gen, index) => {
    if (!gen.unlocked) return;

    const section = document.createElement("section");

    section.innerHTML = `
    <h2>${gen.name}</h2>
    <div class="gen-meta">
      <div class="gen-price" id="gen${index}-price">Цена: ${formatNumber(gen.cost)}</div>
      <div class="gen-amount" id="gen${index}-amount">${formatNumber(gen.amount)}x</div>
    </div>
    <div class="generator-buttons">
      <button onclick="buyGenerator(${index}, 1)">Купить 1</button>
      <button onclick="buyGenerator(${index}, 10)">Купить 10</button>
      <button onclick="buyMaxGenerator(${index})">Купить макс</button>
    </div>
    `;

    container.appendChild(section);
  });
}

function buyGenerator(index, amount = 1) {
  const gen = generators[index];
  let bought = 0;

  for (let i = 0; i < amount; i++) {
    if (matter >= gen.cost) {
      matter -= gen.cost;
      gen.amount++;
      gen.cost = Math.floor(gen.cost * 1.5);
      bought++;

      // Открытие следующего генератора
      if (generators[index + 1] && !generators[index + 1].unlocked) {
        generators[index + 1].unlocked = true;
      }
    } else {
      break;
    }
  }

  if (bought > 0) {
    const gain = `+${bought} ${gen.name}`;
    spawnClickEffectCenter(gain);
  }

  updateUI();
  renderGenerators();
}

function buyMaxGenerator(index) {
  const gen = generators[index];
  let bought = 0;

  while (matter >= gen.cost) {
    matter -= gen.cost;
    gen.amount++;
    gen.cost = Math.floor(gen.cost * 1.5);
    bought++;

    if (generators[index + 1] && !generators[index + 1].unlocked) {
      generators[index + 1].unlocked = true;
    }
  }

  if (bought > 0) {
    const msg = `+${bought} ${gen.name}(ов)`;
    spawnClickEffectCenter(msg);
  }

  updateUI();
  renderGenerators();
}


function calculateTotalBoost() {
  let totalBoost = 1;
  for (let i = 1; i < generators.length; i++) {
    totalBoost *= Math.pow(1.02, generators[i].amount);
  }
  return totalBoost;
}

document.getElementById("generateMatterBtn").addEventListener("click", () => {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  matter += gen1.baseProduction * boost;
  updateUI();
});

document.getElementById("generateMatterBtn").addEventListener("click", (e) => {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  const gain = gen1.baseProduction * boost;
  matter += gain;
  updateUI();
  spawnClickEffect(e.clientX, e.clientY, gain);
});

function spawnClickEffect(x, y, amount) {
  const el = document.createElement("div");
  el.className = "click-float";
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.textContent = `+${Math.floor(amount)}`;
  document.getElementById("clickEffects").appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1000);
}

function spawnClickEffectCenter(text) {
  const el = document.createElement("div");
  el.className = "click-float";
  el.style.left = "50%";
  el.style.top = "50%";
  el.style.transform = "translate(-50%, -50%)";
  el.textContent = text;
  document.getElementById("clickEffects").appendChild(el);

  setTimeout(() => {
    el.remove();
  }, 1000);
}

function performDistill() {
  const earned = calculateDistillPoints();
  if (earned < 1) {
    alert("Недостаточно материи для дестилляции.");
    return;
  }

  if (!hasDistilledOnce) {
    hasDistilledOnce = true;
    const btn = document.getElementById("openShopBtn");
    btn.classList.remove("hidden");
    btn.classList.add("shop-reveal");
  }

  distillPoints += earned;
  matter = 0;

  // можно обнулить статистику по желанию
  // totalMatter = 0;

  updateUI();
  renderGenerators();
  alert(`Ты получил ${earned} ОД!`);
}

function buyUpgrade(id) {
  if (id === 'gen1Boost' && distillPoints >= 2 && !distillUpgrades.gen1Boost) {
    distillPoints -= 2;
    distillUpgrades.gen1Boost = true;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }

  if (id === 'unlockHardPrestige' && distillPoints >= 10 && !distillUpgrades.unlockHardPrestige) {
    distillPoints -= 10;
    distillUpgrades.unlockHardPrestige = true;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }

  updateUI();
  updateShopUI();
  tabContent.innerHTML = tabs.prestige?.();
}


function calculateDistillPoints() {
  return Math.floor(Math.pow(matter / 1e6, 0.5));
}

function openDistillInfo() {
  document.getElementById("infoModal").classList.remove("hidden");
}
function closeDistillInfo() {
  document.getElementById("infoModal").classList.add("hidden");
}

document.getElementById("openShopBtn").addEventListener("click", openShop);

function openShop() {
  document.getElementById("shopModal").classList.remove("hidden");
  updateShopUI();
}

function closeShop() {
  document.getElementById("shopModal").classList.add("hidden");
}

function updateShopUI() {
  document.getElementById("shopPoints").textContent = distillPoints;
  const list = document.getElementById("shopList");

  const upgrades = [
    {
      id: "gen1Boost",
      title: "Усиление Генератора 1 в 1.2x",
      description: "Навсегда увеличивает производство Генератора 1.",
      cost: 2
    },
    {
      id: "unlockHardPrestige",
      title: "Слияния Реальностей",
      description: "Открывает жёсткий престиж с постоянным бустом ко всему.",
      cost: 10
    }
  ];  

  list.innerHTML = "";

  upgrades.forEach(upg => {
    const isBought = distillUpgrades[upg.id];
    const canBuy = !isBought && distillPoints >= upg.cost;
  
    const li = document.createElement("li");
    li.className = `shop-item ${isBought ? 'bought' : canBuy ? 'can-buy' : 'locked'}`;
    li.innerHTML = `
      <div class="shop-price"><strong>${upg.cost} ОД</strong></div>
      <div class="shop-info">
        <div class="shop-title">${upg.title}</div>
        <div class="shop-desc">${upg.description}</div>
      </div>
    `;
  
    if (canBuy) {
        li.onclick = () => {
          buyUpgrade(upg.id);
          createConfettiEffect();
        };
      }      
  
    list.appendChild(li);
  });  
}

function createConfettiEffect() {
  const symbols = ['★', '✦', '♦', '✧', '💥'];
  const container = document.getElementById("shopFlashContainer");

  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const size = Math.random() * 8 + 12;
    const startX = window.innerWidth / 2;
    const offsetX = (Math.random() - 0.5) * 200;
    const color = `hsl(${Math.random() * 360}, 80%, 70%)`;

    confetti.style.left = `${startX + offsetX}px`;
    confetti.style.top = `50%`;
    confetti.style.fontSize = `${size}px`;
    confetti.style.color = color;

    container.appendChild(confetti);

    setTimeout(() => {
      confetti.remove();
    }, 1000);
  }
}

function performRealityReset() {
  if (!confirm("Ты точно хочешь слить реальность? Это сбросит всё, кроме достижений и статистики!")) return;

  const currentMult = Math.max(1, Math.floor(Math.pow(totalMatter / 1e6, 0.25)));
  realityResets++;
  realityBoost *= currentMult;

  // Полный сброс
  matter = 0;
  maxMatter = 0;
  distillPoints = 0;
  distillUpgrades = {
    gen1Boost: false,
    unlockHardPrestige: true // сохраняем СР
  };

  // сброс генераторов
  generators.forEach((g, i) => {
    g.amount = 0;
    g.cost = Math.pow(10, i + 1);
    g.unlocked = i === 0;
  });

  updateUI();
  renderGenerators();
  alert("Ты слил реальности. Всё... начинается заново. ✨");
}

function openRealityInfo() {
  document.getElementById("realityInfoModal").classList.remove("hidden");
}

function closeRealityInfo() {
  document.getElementById("realityInfoModal").classList.add("hidden");
}

// === Старт игры ===
loadGame();
renderGenerators();
updateUI();
autoSaveLoop();