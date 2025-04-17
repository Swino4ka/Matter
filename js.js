// === Переменные игры ===
let matter = 0;
let totalMatter = 0;
let maxMatter = 0;
let maxProduction = 0;
let distillPoints = 0;
let distillUpgrades = {
  gen1Boost: false,
  unlockHardPrestige: false
};
let gen1 = {
  amount: 0,
  cost: 10,
  production: 1
};

// === Обновление UI ===
function updateUI() {
  document.getElementById("matter").textContent = Math.floor(matter);

  generators.forEach((gen, index) => {
    if (!gen.unlocked) return;
  
    const amountEl = document.getElementById(`gen${index}-amount`);
    const priceEl = document.getElementById(`gen${index}-price`);
  
    if (amountEl) amountEl.textContent = `${gen.amount}x`;
    if (priceEl) {
      priceEl.textContent = `Цена: ${gen.cost}`;
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
  const gain = (gen1.amount * gen1.baseProduction * boost) / ticksPerSecond;
  totalMatter += gain;
  if (matter > maxMatter) {
    maxMatter = matter;
  }
  if (gain * ticksPerSecond > maxProduction) {
    maxProduction = gain * ticksPerSecond;
  }
  matter += gain;
  updateUI();
}, 100);

// === Сохранение игры ===
function saveGame() {
  const saveData = {
    matter,
    gen1,
    lastSaved: Date.now(),
    totalMatter: totalMatter,
    maxMatter: maxMatter,
    maxProduction: maxProduction
  };
  localStorage.setItem("matterSave", JSON.stringify(saveData));
  updateLastSavedTime();
  console.log("Игра сохранена!");
}

function calculateDistillPoints() {
  return Math.floor(Math.pow(matter / 1e6, 0.5));
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
    gen1 = data.gen1 || { amount: 0, cost: 10, production: 1 };
    totalMatter = data.totalMatter || 0;
    maxMatter = data.maxMatter || 0;
    maxProduction = data.maxProduction || 0;
  
    // открытие генераторов при загрузке
    generators.forEach((gen, i) => {
      if (i > 0 && generators[i - 1].amount > 0) {
        gen.unlocked = true;
      }
    });
  
    updateUI();
    setTimeout(updateLastSavedTime, 100);
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
        let upgradesHtml = '';
      
        if (distillPoints > 0 || distillUpgrades.gen1Boost || distillUpgrades.unlockHardPrestige) {
          upgradesHtml = `
            <h4>🛒 Магазин</h4>
            <ul>
              <li>
                Усиление Генератора 1 в 1.2x 
                ${distillUpgrades.gen1Boost ? "✅" : `<button onclick="buyUpgrade('gen1Boost')">Купить (2 ОД)</button>`}
              </li>
              <li>
                Разблокировка Слияний Реальностей 
                ${distillUpgrades.unlockHardPrestige ? "✅" : `<button onclick="buyUpgrade('unlockHardPrestige')">Купить (10 ОД)</button>`}
              </li>
            </ul>
          `;
        }
      
        return `
          <h3>💠 Престиж: Дестилляция</h3>
          <p>Ты можешь получить <strong>${available}</strong> очков дестилляции (ОД).</p>
          <div class="distill-controls">
            <button onclick="performDistill()">Дестиллировать</button>
            <button class="info-btn" onclick="openDistillInfo()">ℹ️</button>
          </div>
          <p><strong>Текущие очки дестилляции (ОД):</strong> ${distillPoints}</p>
          ${upgradesHtml}
        `;
      },
    achievements: `<h3>🏆 Достижения</h3><p>Пока нет достижений.</p>`,
    stats: () => {
        let genList = generators.map((g, i) => `<li>${g.name}: ${g.amount}x</li>`).join('');
        return `
          <h3>📊 Статистика</h3>
          <ul>
            <li><strong>Текущая материя:</strong> ${Math.floor(matter)}</li>
            <li><strong>Всего накоплено материи:</strong> ${Math.floor(totalMatter)}</li>
            <li><strong>Максимум материи:</strong> ${Math.floor(maxMatter)}</li>
            <li><strong>Макс. производство/сек:</strong> ${maxProduction.toFixed(2)}</li>
            <li><strong>Всего генераторов:</strong> ${generators.reduce((a, g) => a + g.amount, 0)}</li>
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
  });
});

document.addEventListener("click", (e) => {
  const id = e.target.id;

  if (id === "saveNowBtn") {
    saveGame();
    alert("Игра сохранена вручную!");
  }

  if (id === "resetBtn") {
    if (confirm("Ты уверен, что хочешь сбросить весь прогресс?")) {
      localStorage.removeItem("matterSave");
      location.reload();
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
      <div class="gen-price" id="gen${index}-price">Цена: ${gen.cost}</div>
      <div class="gen-amount" id="gen${index}-amount">${gen.amount}x</div>
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
  }

  if (id === 'unlockHardPrestige' && distillPoints >= 10 && !distillUpgrades.unlockHardPrestige) {
    distillPoints -= 10;
    distillUpgrades.unlockHardPrestige = true;
  }

  updateUI();
  tabContent.innerHTML = tabs.prestige(); // обновим UI
}

function calculateDistillPoints() {
  return Math.floor(Math.pow(matter / 1e6, 0.5));
}

// === Старт игры ===
loadGame();
renderGenerators();
updateUI();
autoSaveLoop();