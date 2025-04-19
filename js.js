const title = document.getElementById("glitchTitle");
const original = "Matter";
const chars = "!@#$%^&*()_+-=[]{}|;:,.<>?/\\ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";

let matter = 0;
let totalMatter = 0;
let maxMatter = 0;
let maxProduction = 0;
let hasDistilledOnce = false;
let distillPoints = 0;
let realityResets = 0;
let realityBoost = 1;

let ticksPerSecond = 10;
let timeUpgradeActive = false;
let realityUpgradesOwned = {
    timeAccelerator: false
  };
let lastActivityTime = Date.now();
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
  unlockGen5: false,
  boostGen1: false,
  boostGen2: false,
  boostGen3: false,
  boostGen4: false,
  unlockHardPrestige: false,
  cheaperGens: false,
  starterPack: false,
  costReduction: 1,
  startWithGen1: 0
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
    title: "Дальше - только звёзды",
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
    title: "Реальность - это иллюзия",
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
    title: "Новый день - новые материи",
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
    id: "afkMaster",
    title: "Мастер покоя",
    description: "Ничего не делать 5 минут подряд",
    condition: () => Date.now() - lastActivityTime >= 5 * 60 * 1000,
    type: "secret"
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
  },
  {
    id: "scienceWrongWay",
    title: "Наука пошла не туда",
    description: "Иметь больше генераторов 3 уровня, чем первого",
    condition: () => generators[2].amount > generators[0].amount,
    type: "secret"
  },  
  {
    id: "fullCollection",
    title: "Коллекционер",
    description: "Получи все остальные достижения",
    condition: () => Object.values(achievements).filter(Boolean).length === allAchievements.length - 1
  }  
];

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

setInterval(() => {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  const base = distillUpgrades.boostGen1 ? 1.2 : 1;
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
}, ticksPerSecond * 10);

function getMatterRate() {
  const gen1 = generators[0];
  const boost = calculateTotalBoost();
  return gen1.amount * gen1.baseProduction * boost * realityBoost * calculateAchievementBoost();
}

function saveGame() {
  const saveData = {
    matter,
    totalMatter,
    achievements,
    lastActivityTime,
    statTabOpened,
    achHoverCount,
    uselessClicks,
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

function loadGame() {
  const save = localStorage.getItem("matterSave");
  if (save) {
    const data = JSON.parse(save);

    matter = data.matter || 0;
    totalMatter = data.totalMatter || 0;
    achievements = data.achievements || {};
    lastActivityTime = data.lastActivityTime || Date.now();
    statTabOpened = data.statTabOpened || 0;
    achHoverCount = data.achHoverCount || 0;
    uselessClicks = data.uselessClicks || 0;
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

    if (realityResets > 0) {
        document.getElementById("openRealityShopBtn")?.classList.remove("hidden");
    }      

    if (Array.isArray(data.generators)) {
      generators.forEach((g, i) => {
        if (data.generators[i]) {
          g.amount = data.generators[i].amount || 0;
          g.cost = data.generators[i].cost || Math.pow(10, i + 1);
          g.unlocked = data.generators[i].unlocked || false;
        }
      });
    }

    if (distillUpgrades.unlockGen5) {
        const existingCount = generators.length;
        const maxToAdd = 3;
        for (let i = existingCount; i < existingCount + maxToAdd; i++) {
          generators.push({
            name: `Генератор ${i + 1}`,
            amount: 0,
            cost: Math.pow(10, i + 1),
            unlocked: false
          });
        }
      }
      

    distillUpgrades = data.distillUpgrades || {
      unlockGen5: false,
      startWithGen1: 0,
      boostGen1: false,
      boostGen2: false,
      boostGen3: false,
      boostGen4: false,
      costReduction: 1,
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
    const threshold = 1e5; 
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

function autoSaveLoop() {
  setInterval(saveGame, 10000);
}

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
            <div class="distill-controls">
            <button onclick="performRealityReset()">Слить реальность</button>
            <button class="info-btn" onclick="openRealityInfo()">ℹ️</button>
            </div>
            <p><strong>Количество слияний:</strong> ${realityResets}</p>
            <p><strong>Текущий буст производства:</strong> ${realityBoost.toFixed(2)}x</p>
          `;
        }
      
        return html;
      },      
      achievements: () => {
        const unlockedCount = Object.values(achievements).filter(Boolean).length;
        const totalCount = allAchievements.length;
        const percent = Math.floor((unlockedCount / totalCount) * 100);
      
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
      
        return `
          <h3>🏆 Достижения</h3>
          <p class="ach-progress-text">${unlockedCount} / ${totalCount} получено (${percent}%)</p>
          <div class="ach-progress-bar">
            <div class="ach-progress-fill" style="width: ${percent}%"></div>
          </div>
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
      <p style="margin-top: 10px;">Последнее сохранение: <span id="lastSavedTime">-</span></p>
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
  lastActivityTime = Date.now();

  if (e.target.classList.contains("ach-popup")) {
    clickedAchievementPopup = true;
  }

  if (!e.target.closest(".modal, .ach-box, button, .tabBtn, section")) {
    uselessClicks++;
  }  

  if (id === "saveNowBtn") {
    saveGame();
    alert("Игра сохранена!");
  }

  if (id === "resetBtn") {
    if (confirm("Ты уверен, что хочешь сбросить весь прогресс?")) {
        matter = 0;
        totalMatter = 0;
        maxMatter = 0;
        maxProduction = 0;
        distillPoints = 0;
        hasDistilledOnce = false;
        matter = 0;
        distillPoints = 0;
        distillUpgrades = {
          boostGen1: false,
          unlockHardPrestige: false
        };
        generators.forEach((g, i) => {
        g.amount = 0;
        g.cost = Math.pow(10, i + 1);
        g.unlocked = i === 0;
        });

        saveGame();
        renderGenerators();
        updateUI();

        achievements = {};
        statTabOpened = 0;
        achHoverCount = 0;
        uselessClicks = 0;
        clickedAchievementPopup = false;
        typedAntimatter = false;
        manualResetUsed = true;
        saveGame();
//      localStorage.removeItem("matterSave");
//      location.reload();
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
      gen.cost = Math.floor(gen.cost * 1.5 * distillUpgrades.costReduction);
      bought++;

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
    gen.cost = Math.floor(gen.cost * 1.5 * distillUpgrades.costReduction);
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
    const baseBoost = Math.pow(1.02, generators[i].amount);

    let mult = 1;
    if (i === 1 && distillUpgrades.boostGen2) mult = 1.2;
    if (i === 2 && distillUpgrades.boostGen3) mult = 1.2;
    if (i === 3 && distillUpgrades.boostGen4) mult = 1.2;

    totalBoost *= baseBoost * mult;
  }
  return totalBoost;
}

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
  
  showDistillEffect();
  updateUI();
  renderGenerators();
}

function showDistillEffect() {
  const el = document.getElementById("distillEffect");
  el.classList.remove("hidden");
  setTimeout(() => {
    el.classList.add("hidden");
  }, 1800);
}

function buyUpgrade(id) {
    if (id === 'unlockGen5' && distillPoints >= 12 && !distillUpgrades.unlockGen5) {
        distillPoints -= 12;
        distillUpgrades.unlockGen5 = true;
    }
    
  if (id === 'boostGen1' && distillPoints >= 2 && !distillUpgrades.boostGen1) {
    distillPoints -= 2;
    distillUpgrades.boostGen1 = true;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }

  if (id === 'boostGen2' && distillPoints >= 3 && !distillUpgrades.boostGen2) {
    distillPoints -= 3;
    distillUpgrades.boostGen2 = true;
  }
  if (id === 'boostGen3' && distillPoints >= 5 && !distillUpgrades.boostGen3) {
    distillPoints -= 5;
    distillUpgrades.boostGen3 = true;
  }
  if (id === 'boostGen4' && distillPoints >= 8 && !distillUpgrades.boostGen4) {
    distillPoints -= 8;
    distillUpgrades.boostGen4 = true;
  }
  
  if (id === 'unlockHardPrestige' && distillPoints >= 10 && !distillUpgrades.unlockHardPrestige) {
    distillPoints -= 10;
    distillUpgrades.unlockHardPrestige = true;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }

  if (id === 'cheaperGens' && distillPoints >= 15 && !distillUpgrades.cheaperGens) {
    distillPoints -= 15;
    distillUpgrades.cheaperGens = true;
    distillUpgrades.costReduction = 0.9;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }

  if (id === 'starterPack' && distillPoints >= 6 && !distillUpgrades.cheaperGens) {
    distillPoints -= 6;
    distillUpgrades.starterPack = true;
    distillUpgrades.startWithGen1 = 10;
    document.getElementById("openShopBtn")?.classList.add("shop-reveal");
  }
  
  updateUI();
  updateShopUI();
  tabContent.innerHTML = tabs.prestige?.();
}

document.getElementById("openRealityShopBtn").addEventListener("click", openRealityShop);

function openRealityShop() {
  document.getElementById("realityShopModal").classList.remove("hidden");
  updateRealityShopUI();
}

function closeRealityShop() {
  document.getElementById("realityShopModal").classList.add("hidden");
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

const realityShopUpgrades = [
    {
        id: "timeAccelerator",
        title: "Ускорение времени",
        description: "Увеличивает количество тиков с 10 до 13 в секунду, ускоряя всю игру.",
        cost: 1
    }
  ];

  function buyRealityUpgrade(id) {
  const upgrade = realityShopUpgrades.find(u => u.id === id);
  if (!upgrade || realityUpgradesOwned[id]) return;

  if (realityResets >= upgrade.cost) {
    realityResets -= upgrade.cost;
    realityUpgradesOwned[id] = true;

    if (id === "timeAccelerator") {
      ticksPerSecond += 3;
    }

    updateRealityShopUI();
    updateUI();
    createConfettiEffect();
  }
}

function updateRealityShopUI() {
  const list = document.getElementById("realityShopList");
  if (!list) return;

  list.innerHTML = "";

  realityShopUpgrades.forEach(upg => {
    const isBought = realityUpgradesOwned[upg.id];
    const canBuy = !isBought && realityResets >= upg.cost;
  
    const li = document.createElement("li");
    li.className = `shop-item ${isBought ? 'bought' : canBuy ? 'can-buy' : 'locked'}`;
    li.innerHTML = `
      <div class="shop-price"><strong>${upg.cost} 🌀</strong></div>
      <div class="shop-info">
        <div class="shop-title">${upg.title}</div>
        <div class="shop-desc">${upg.description}</div>
      </div>
    `;
  
    if (canBuy) {
      li.onclick = () => buyRealityUpgrade(upg.id);
    }
  
    list.appendChild(li);
  });
  
  const counter = document.getElementById("realityShopResets");
  if (counter) counter.textContent = realityResets;
}

function updateShopUI() {
  document.getElementById("shopPoints").textContent = distillPoints;
  const list = document.getElementById("shopList");

  const upgrades = [
    {
        id: "unlockGen5",
        title: "Новые горизонты",
        description: "Разблокирует Генератор 5 и выше",
        cost: 12
    },      
    {
      id: "boostGen1",
      title: "Усиление Генератора 1 в 1.2x",
      description: "Навсегда увеличивает производство Генератора 1.",
      cost: 2
    },
    {
      id: "boostGen2",
      title: "Буст Генератора 2 в 1.2x",
      description: "Увеличивает силу второго генератора навсегда.",
      cost: 3
    },
    {
      id: "boostGen3",
      title: "Буст Генератора 3 в 1.2x",
      description: "Увеличивает силу третьего генератора навсегда.",
      cost: 5
    },
    {
      id: "boostGen4",
      title: "Буст Генератора 4 в 1.2x",
      description: "Увеличивает силу четвёртого генератора навсегда.",
      cost: 8
    },
    {
      id: "cheaperGens",
      title: "Сжатие цен",
      description: "Все генераторы стоят на 10% меньше.",
      cost: 15
    },
    {
      id: "starterPack",
      title: "Двойной старт",
      description: "После дестиляции ты начинаешь с 10 генераторов первого уровня.",
      cost: 6
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
  if (!confirm("Ты точно хочешь слить реальность? Это сбросит весь прогресс!")) return;

  const vortex = document.getElementById("realityCollapseAnimation");
  vortex.classList.remove("hidden");
  const btn = document.getElementById("openRealityShopBtn");
  btn?.classList.remove("hidden");
  btn?.classList.add("shop-reveal");
  

  setTimeout(() => {
    const currentMult = Math.max(1, Math.floor(Math.pow(totalMatter / 1e6, 0.25)));
    realityResets++;
    realityBoost *= currentMult;

    matter = 0;
    distillPoints = 0;
    distillUpgrades = {
      boostGen1: false,
      unlockHardPrestige: true
    };

    generators.forEach((g, i) => {
      g.amount = 0;
      g.cost = Math.pow(10, i + 1);
      g.unlocked = i === 0;
    });

    if (distillUpgrades.startWithGen1) {
        generators[0].amount = distillUpgrades.startWithGen1;
    }
  
    updateUI();
    renderGenerators();
    saveGame();
    setTimeout(() => {
      vortex.classList.add("hidden");
      alert("Ты слил реальность. Всё... начинается заново. Но с бустом ✨");
    }, 2000);
  }, 500);
}


function openRealityInfo() {
  document.getElementById("realityInfoModal").classList.remove("hidden");
}

function closeRealityInfo() {
  document.getElementById("realityInfoModal").classList.add("hidden");
}

const glitchPhrases = [
  "Привет из Японии!",
  "Симуляция дала сбой...",
  "20°C и полная пустота",
  "Материя нестабильна",
  "Вы достигли ∞",
  "Измерения антиматерии...",
  "Реальность разрушается...",
  "Ничто не вечно",
  "Вращение галактик нарушено",
  "404: Вселенная не найдена",
  "Сбой в матрице",
  "Симуляция завершена",
  "Параллельные миры",
  "Время и пространство",
  "Сквозь пространство и время",
  "Сброс реальности",
  "Проблемы с загрузкой",
  "Ошибка: Неизвестная ошибка",
  "Параллельные измерения",
  "Проблемы с загрузкой",
  "Сбой в матрице"
];

function glitchTextCycle() {
  const target = glitchPhrases[Math.floor(Math.random() * glitchPhrases.length)];
  const maxLength = Math.max(original.length, target.length);
  let current = Array.from(original.padEnd(maxLength));
  let final = Array.from(target.padEnd(maxLength));
  let index = 0;

  const scrambleInterval = setInterval(() => {
    if (index >= maxLength) {
      clearInterval(scrambleInterval);
      setTimeout(() => unscramble(original, maxLength), 2000);
      return;
    }

    let display = [...current];
    display[index] = chars[Math.floor(Math.random() * chars.length)];
    title.textContent = display.join("");

    setTimeout(() => {
      current[index] = final[index];
      title.textContent = current.join("");
      index++;
    }, 50);
  }, 100);
}

function unscramble(target, length) {
  const maxLength = length; 
  let current = Array.from(title.textContent.padEnd(maxLength));
  let final = Array.from(target.padEnd(maxLength)); 
  let index = 0;

  const unscrambleInterval = setInterval(() => {
    if (index >= maxLength) {
      clearInterval(unscrambleInterval);
      setTimeout(glitchTextCycle, 6000);
      return;
    }

    let display = [...current];
    display[index] = chars[Math.floor(Math.random() * chars.length)];
    title.textContent = display.join("");

    setTimeout(() => {
      current[index] = final[index];
      title.textContent = current.join("");
      index++;
    }, 50);
  }, 100);
}

setTimeout(glitchTextCycle, 4000);
loadGame();
renderGenerators();
updateUI();
autoSaveLoop();
updateRealityShopUI();