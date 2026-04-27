const COLS = 5;
const ROWS = 5;
const SHIFT_SECONDS = 90;
const BEST_SCORE_KEY = "ojisan-poipoi-best-score-v3";

const casts = [
  { name: "みじゅ", trait: "太客処理のプロ", detail: "太客短縮 / 売上UP", color: "#2fb8ff", asset: "assets/casts/miju.png" },
  { name: "ちゃき", trait: "接客スピード枠", detail: "少し早く帰せる", color: "#ff4fae", asset: "assets/casts/chaki.png" },
  { name: "なの", trait: "低速だが個性枠", detail: "処理ターンやや長め", color: "#9be65e", asset: "assets/casts/nano.png" },
  { name: "いずも", trait: "空気回復役", detail: "退店時に空気を少し回復", color: "#aa58ff", asset: "assets/casts/izumo.png" },
  { name: "ゆめ", trait: "VIP対応のエース", detail: "VIP処理短縮 / 売上UP", color: "#ffd21e", asset: "assets/casts/yume.png" },
];

const guestTypes = [
  {
    id: "futoi",
    label: "太客",
    color: "#e1b453",
    base: 4,
    points: 95,
    weight: 16,
    note: "太客きた！",
  },
  {
    id: "usui",
    label: "薄客",
    color: "#9aa4ad",
    base: 3,
    points: 22,
    weight: 22,
    note: "ふつう！",
  },
  {
    id: "gachikoi",
    label: "ガチ恋",
    color: "#ea6f91",
    base: 5,
    points: 76,
    weight: 0,
    note: "ハート多め！",
  },
  {
    id: "uwaki",
    label: "浮気性",
    color: "#4bc2c5",
    base: 3,
    points: 36,
    weight: 18,
    note: "どこでもOK！",
  },
  {
    id: "claimer",
    label: "クレーマー",
    color: "#d95757",
    base: 4,
    points: 64,
    weight: 10,
    note: "早めに処理！",
  },
  {
    id: "vip",
    label: "VIP",
    color: "#b88ee6",
    base: 5,
    points: 135,
    weight: 4,
    note: "指名あり！",
  },
  {
    id: "doutan",
    label: "同担拒否",
    color: "#f08a5d",
    base: 4,
    points: 72,
    weight: 0,
    note: "被り注意！",
  },
];

const state = {
  board: [],
  current: null,
  next: null,
  selectedCol: 2,
  score: 0,
  ambient: 70,
  time: SHIFT_SECONDS,
  complaints: 0,
  streaks: [0, 0, 0, 0, 0],
  regulars: [],
  running: false,
  started: false,
  tickMs: 1250,
  dropStarted: 0,
  dropWindow: 3600,
  tutorialTimer: null,
  lastStep: 0,
  lastSecond: 0,
  bestScore: loadBestScore(),
  lastResult: null,
  placements: 0,
  matches: 0,
  bottles: 0,
  champagnes: 0,
  autoDrops: 0,
  maxColumnStreak: 0,
};

const startScreen = document.querySelector("#startScreen");
const gamePanel = document.querySelector("#gamePanel");
const boardEl = document.querySelector("#board");
const castsEl = document.querySelector("#casts");
const ambientValue = document.querySelector("#ambientValue");
const ambientFill = document.querySelector("#ambientFill");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const timeValue = document.querySelector("#timeValue");
const complaintValue = document.querySelector("#complaintValue");
const complaintWarning = document.querySelector("#complaintWarning");
const currentGuest = document.querySelector("#currentGuest");
const nextGuest = document.querySelector("#nextGuest");
const dropFill = document.querySelector("#dropFill");
const messageEl = document.querySelector("#message");
const comboList = document.querySelector("#comboList");
const regularsEl = document.querySelector("#regulars");
const overlay = document.querySelector("#gameOver");
const tutorial = document.querySelector("#tutorial");
const floatLayer = document.querySelector("#floatLayer");
const resultTitle = document.querySelector("#resultTitle");
const resultReason = document.querySelector("#resultReason");
const shareButton = document.querySelector("#shareButton");
let audioContext = null;

function weightedGuest() {
  const pool = activeGuestTypes();
  const total = pool.reduce((sum, guest) => sum + guest.weight, 0);
  let pick = Math.random() * total;
  for (const guest of pool) {
    pick -= guest.weight;
    if (pick <= 0) return makeGuest(guest);
  }
  return makeGuest(pool[0]);
}

function activeGuestTypes() {
  const elapsed = SHIFT_SECONDS - state.time;
  return guestTypes.filter((guest) => {
    if (guest.weight <= 0) return false;
    if (guest.id === "vip") return elapsed >= 30;
    if (guest.id === "claimer") return elapsed >= 12;
    return true;
  });
}

function makeGuest(type) {
  const preferred = preferredColumnForGuest(type.id);
  const favorite = preferred ?? Math.floor(Math.random() * COLS);
  const vipTarget = type.id === "vip" ? favorite : null;
  return {
    ...type,
    favorite,
    vipTarget,
    serial: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  };
}

function starterGuest() {
  const type = guestTypes.find((guest) => guest.id === "usui");
  const guest = makeGuest(type);
  guest.favorite = 2;
  return guest;
}

function resetGame() {
  initAudio();
  state.started = true;
  state.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  state.time = SHIFT_SECONDS;
  state.current = starterGuest();
  state.next = weightedGuest();
  state.selectedCol = bestColumnForGuest(state.current);
  state.score = 0;
  state.ambient = 70;
  state.complaints = 0;
  state.streaks = [0, 0, 0, 0, 0];
  state.regulars = [];
  state.running = true;
  state.lastResult = null;
  state.placements = 0;
  state.matches = 0;
  state.bottles = 0;
  state.champagnes = 0;
  state.autoDrops = 0;
  state.maxColumnStreak = 0;
  state.tickMs = 1700;
  state.lastStep = performance.now();
  state.lastSecond = performance.now();
  setDropWindow(performance.now());
  overlay.classList.add("hidden");
  floatLayer.innerHTML = "";
  showTutorial();
  comboList.innerHTML = "";
  messageEl.textContent = "推し席へポイ！";
  render();
}

function startGame() {
  initAudio();
  startScreen.hidden = true;
  gamePanel.hidden = false;
  resetGame();
}

function serviceTurns(guest, col) {
  let turns = guest.base + 1;
  const preferred = isPreferred(guest, col);

  if (preferred) turns -= 1;
  if (!preferred) turns += guest.id === "vip" ? 3 : 1;
  if (casts[col].name === "みじゅ" && guest.id === "futoi") turns -= 0.5;
  if (casts[col].name === "ちゃき") turns -= 0.5;
  if (casts[col].name === "ゆめ" && guest.id === "vip") turns -= 0.5;
  if (casts[col].name === "なの") turns += 0.5;
  if (state.ambient >= 82) turns -= 1;
  if (state.ambient <= 32) turns += 1;

  return Math.max(2, Math.ceil(turns));
}

function tileForGuest(guest, col) {
  return {
    guest,
    turns: serviceTurns(guest, col),
    col,
    age: 0,
    matched: isPreferred(guest, col),
    vipMiss: guest.vipTarget !== null && col !== guest.vipTarget,
  };
}

function placeCurrent(col = state.selectedCol, options = {}) {
  if (!state.running) return;
  initAudio();

  const row = lowestOpenRow(col);
  if (row === -1) {
    changeAmbient(-10);
    endGame("おじさんが入りきらない！空いている列を作ろう。", "列が満席");
    return;
  }

  const tile = tileForGuest(state.current, col);
  state.board[row][col] = tile;
  const feedback = applyPlacementPressure(tile);
  state.placements += 1;
  if (options.auto) state.autoDrops += 1;
  const comboTriggered = advanceCallGauge(tile);
  if (!comboTriggered) {
    showFloat(feedback.text, feedback.tone);
    playSound(feedback.sound);
  }
  state.current = state.next;
  state.next = weightedGuest();
  state.selectedCol = nearestOpenColumn(col);
  setDropWindow();
  render();
}

function lowestOpenRow(col) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (!state.board[row][col]) return row;
  }
  return -1;
}

function applyPlacementPressure(tile) {
  const guest = tile.guest;
  const col = tile.col;
  let feedback;
  if (guest.id === "vip" && guest.vipTarget !== null && col !== guest.vipTarget) {
    changeAmbient(-9);
    say("指名外だよ！");
    feedback = { text: "指名外 -9", tone: "bad", sound: "bad" };
  } else if (col === guest.favorite || guest.id === "uwaki") {
    changeAmbient(2);
    const bonus = guest.id === "uwaki" ? 6 : 12;
    state.score += bonus;
    state.matches += 1;
    feedback = { text: `${guest.id === "uwaki" ? "どこでもOK" : "推し一致"} +${formatMoney(bonus)}`, tone: "good", sound: "match" };
  } else {
    changeAmbient(-2);
    feedback = { text: "推し違い -2", tone: "warn", sound: "place" };
  }

  say(guest.note);
  return feedback;
}

function stepService() {
  if (!state.running) return;

  const speed = state.ambient >= 88 ? 2 : 1;
  const cleared = [];

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = state.board[row][col];
      if (!tile) continue;
      tile.age += 1;
      tile.turns -= speed;

      if (tile.guest.id === "claimer" && tile.age > 0 && tile.age % 3 === 0) {
        state.complaints += 1;
        changeAmbient(-10);
        say("クレーム発生！");
        showFloat("クレーム -10", "bad");
        playSound("bad");
      }

      if (tile.turns <= 0) {
        cleared.push({ tile, row, col });
      }
    }
  }

  for (const clear of cleared) clearTile(clear);
  collapseBoard();

  if (state.complaints >= 3) {
    endGame("クレーマーを放置しすぎた！出禁が3回で営業終了。", "出禁3回");
  }

  render();
}

function clearTile({ tile, row, col }) {
  state.board[row][col] = null;
  const guest = tile.guest;
  const preferred = isPreferred(guest, col);
  let points = guest.points + Math.round(state.ambient * 0.8);

  if (preferred) points = Math.round(points * 1.25);
  if (guest.id === "futoi" && casts[col].name === "みじゅ") points += 50;
  if (guest.id === "vip" && casts[col].name === "ゆめ") points += 75;

  state.score += points;
  showColumnFloat(col, `+${formatMoney(points)}`, preferred ? "good" : "neutral");

  if (casts[col].name === "いずも") changeAmbient(2);
  if (guest.id === "futoi") changeAmbient(5);
  if (guest.id === "claimer") changeAmbient(4);

  maybeRegularize(guest, points);
}

function handleCombo(col) {
  let triggered = false;
  if (state.streaks[col] === 3) {
    triggered = true;
    state.bottles += 1;
    changeAmbient(12);
    speedColumn(col);
    addCombo(`${casts[col].name}列`, "ボトル入り");
    say("ボトル入り！");
    showFloat("ボトル入り！", "good");
    playSound("combo");
  }

  if (state.streaks[col] > 0 && state.streaks[col] % 5 === 0) {
    triggered = true;
    state.champagnes += 1;
    changeAmbient(22);
    cheerOneEachColumn();
    addCombo(`${casts[col].name}列`, "シャンパンコール");
    say("シャンパン！");
    showFloat("シャンパン！", "good");
    playSound("combo");
  }
  return triggered;
}

function advanceCallGauge(tile) {
  const col = tile.col;
  if (!tile.matched) {
    state.streaks[col] = Math.max(0, state.streaks[col] - 1);
    return false;
  }

  state.streaks[col] += 1;
  state.maxColumnStreak = Math.max(state.maxColumnStreak, state.streaks[col]);
  return handleCombo(col);
}

function speedColumn(col) {
  for (let row = 0; row < ROWS; row += 1) {
    const tile = state.board[row][col];
    if (tile) tile.turns = Math.max(1, tile.turns - 1);
  }
}

function cheerOneEachColumn() {
  for (let col = 0; col < COLS; col += 1) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (state.board[row][col]) {
        state.board[row][col].turns = Math.max(1, state.board[row][col].turns - 1);
        state.score += 20;
        break;
      }
    }
  }
}

function maybeRegularize(guest, points) {
  if (state.regulars.length >= 7) return;
  const chance = Math.min(0.28, points / 800);
  if (Math.random() < chance && !state.regulars.some((item) => item.label === guest.label)) {
    state.regulars.push({ label: guest.label, favorite: casts[guest.favorite].name });
    say(`${guest.label}が常連に！`);
  }
}

function collapseBoard() {
  for (let col = 0; col < COLS; col += 1) {
    const stack = [];
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (state.board[row][col]) stack.push(state.board[row][col]);
    }
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      state.board[row][col] = stack[ROWS - 1 - row] || null;
      if (state.board[row][col]) state.board[row][col].col = col;
    }
  }
}

function changeAmbient(amount) {
  state.ambient = Math.max(0, Math.min(100, state.ambient + amount));
  state.tickMs = Math.max(820, 1900 - state.ambient * 8);
}

function setDropWindow(now = performance.now()) {
  state.dropStarted = now;
  state.dropWindow = Math.max(1200, 3900 - state.ambient * 20);
}

function addCombo(title, value) {
  const item = document.createElement("li");
  item.innerHTML = `<span>${title}</span><strong>${value}</strong>`;
  comboList.prepend(item);
  while (comboList.children.length > 5) comboList.lastElementChild.remove();
}

function say(text) {
  messageEl.textContent = text;
}

function showFloat(text, tone = "neutral") {
  if (!floatLayer) return;
  const pop = document.createElement("div");
  pop.className = `float-pop ${tone}`;
  pop.textContent = text;
  floatLayer.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

function showColumnFloat(col, text, tone = "neutral") {
  if (!floatLayer) return;
  const pop = document.createElement("div");
  pop.className = `float-pop column-pop ${tone}`;
  pop.textContent = text;
  pop.style.left = `${((col + 0.5) / COLS) * 100}%`;
  pop.style.top = "56%";
  floatLayer.appendChild(pop);
  pop.addEventListener("animationend", () => pop.remove());
}

function isPreferred(guest, col) {
  return targetColumns(guest).includes(col);
}

function placementRead(guest, col) {
  if (guest.vipTarget !== null && col !== guest.vipTarget) return { icon: "×", label: "指名外", tone: "bad" };
  if (isPreferred(guest, col)) return { icon: "◎", label: "推し一致", tone: "good" };
  return { icon: "・", label: "通常接客", tone: "neutral" };
}

function targetColumns(guest) {
  if (!guest) return [];
  if (guest.id === "uwaki") return Array.from({ length: COLS }, (_, index) => index);
  if (guest.vipTarget !== null) return [guest.vipTarget];
  return [preferredColumnForGuest(guest.id) ?? guest.favorite];
}

function preferredColumnForGuest(id) {
  const columns = {
    futoi: 0,
    gachikoi: 1,
    claimer: 1,
    usui: 2,
    doutan: 3,
    vip: 4,
  };
  return columns[id] ?? null;
}

function bestColumnForGuest(guest, fallback = state.selectedCol) {
  const heights = columnHeights();
  const openColumns = heights
    .map((height, col) => ({ col, height }))
    .filter((item) => item.height < ROWS)
    .sort((a, b) => a.height - b.height || Math.abs(a.col - fallback) - Math.abs(b.col - fallback));
  if (!openColumns.length) return fallback;

  const targets = targetColumns(guest);
  const openTarget = openColumns.find((item) => targets.includes(item.col));
  if (openTarget) return openTarget.col;
  return openColumns[0].col;
}

function nearestOpenColumn(fallback = state.selectedCol) {
  const heights = columnHeights();
  if (heights[fallback] < ROWS) return fallback;
  const openColumns = heights
    .map((height, col) => ({ col, height }))
    .filter((item) => item.height < ROWS)
    .sort((a, b) => Math.abs(a.col - fallback) - Math.abs(b.col - fallback) || a.height - b.height);
  return openColumns[0]?.col ?? fallback;
}

function callReachForCol(col) {
  const streak = state.streaks[col];
  if (streak > 0 && streak % 5 === 4) return "champagne";
  if (streak === 2) return "bottle";
  return "";
}

function render() {
  renderBoard();
  renderCasts();
  renderGuest(currentGuest, state.current);
  renderGuest(nextGuest, state.next);

  ambientValue.textContent = Math.round(state.ambient);
  ambientFill.style.width = `${state.ambient}%`;
  document.body.classList.toggle("air-high", state.ambient >= 80);
  document.body.classList.toggle("air-low", state.ambient <= 30);
  scoreValue.textContent = formatMoney(state.score);
  bestValue.textContent = `ベスト ${formatMoney(state.bestScore)}`;
  timeValue.textContent = formatTime(state.time);
  complaintValue.textContent = `${state.complaints}/3`;
  complaintWarning.textContent = `あと${Math.max(0, 3 - state.complaints)}でGAME OVER`;
  regularsEl.innerHTML = state.regulars.length
    ? state.regulars.map((item) => `<span><b>${item.label}</b><small>推し: ${item.favorite}</small></span>`).join("")
    : "<span><b>タカシン</b><small>推し: みじゅ</small></span><span><b>りょうた</b><small>推し: ちゃき</small></span><span><b>ケンジ</b><small>推し: なの</small></span><span><b>バイセン</b><small>指名: ゆめ</small></span>";
}

function renderBoard() {
  boardEl.innerHTML = "";
  const landingRow = lowestOpenRow(state.selectedCol);
  const heights = columnHeights();
  const preferredCols = targetColumns(state.current);
  const selectedRead = placementRead(state.current, state.selectedCol);

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `${col + 1}列 ${row + 1}段`);
      if (col === state.selectedCol) cell.classList.add("target");
      if (preferredCols.includes(col)) cell.classList.add("preferred-column");
      const reach = callReachForCol(col);
      if (reach) cell.classList.add(`${reach}-reach`);
      if (row === landingRow && col === state.selectedCol && reach) cell.dataset.reach = reach === "champagne" ? "シャンパン!" : "ボトル!";
      if (row === landingRow && col === state.selectedCol && selectedRead.tone === "good") cell.dataset.read = selectedRead.icon;
      if (row === landingRow && col === state.selectedCol) cell.classList.add("ghost");
      if (heights[col] >= ROWS - 1) cell.classList.add("column-warning");
      if (heights[col] >= ROWS) cell.classList.add("column-full");
      cell.addEventListener("click", () => {
        if (suppressNextClick) return;
        state.selectedCol = col;
        placeCurrent(col);
      });

      const tile = state.board[row][col];
      if (tile) cell.appendChild(tileElement(tile));
      boardEl.appendChild(cell);
    }
  }
}

function columnHeights() {
  return Array.from({ length: COLS }, (_, col) => (
    state.board.reduce((count, row) => count + (row[col] ? 1 : 0), 0)
  ));
}

function tileElement(tile) {
  const wrapper = document.createElement("div");
  const classes = ["tile"];
  classes.push(`guest-${tile.guest.id}`);
  if (tile.matched) classes.push("matched");
  if (tile.vipMiss || tile.guest.id === "claimer") classes.push("danger");
  wrapper.className = classes.join(" ");
  wrapper.style.setProperty("--chip", tile.guest.color);
  wrapper.style.setProperty("--favorite", casts[tile.guest.favorite].color);
  const claimerCue = tile.guest.id === "claimer"
    ? `<span class="claim-cue">出禁まで${complaintCountdown(tile)}</span>`
    : "";
  wrapper.innerHTML = `
    ${guestFace(tile.guest)}
    <span class="turns">${Math.max(0, tile.turns)}</span>
    ${claimerCue}
  `;
  return wrapper;
}

function complaintCountdown(tile) {
  return 3 - (tile.age % 3);
}

function renderCasts() {
  castsEl.innerHTML = "";
  const preferredCols = targetColumns(state.current);
  casts.forEach((cast, col) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cast${col === state.selectedCol ? " active" : ""}${preferredCols.includes(col) ? " preferred" : ""}`;
    const reach = callReachForCol(col);
    if (reach) button.classList.add(`${reach}-reach`);
    button.style.setProperty("--cast", cast.color);
    const call = nextCallInfo(col);
    button.innerHTML = `
      <img class="cast-face" src="${cast.asset}" alt="" aria-hidden="true">
      <strong>${cast.name}</strong>
      <span>${cast.trait}</span>
      <span>${cast.detail}</span>
      <span class="call-state">${call.label}</span>
      <span class="call-dots">${call.dots}</span>
    `;
    button.addEventListener("click", () => {
      state.selectedCol = col;
      render();
    });
    castsEl.appendChild(button);
  });
}

function renderGuest(el, guest) {
  el.className = `guest-chip guest-${guest.id}${el === nextGuest ? " small" : ""}`;
  el.style.setProperty("--chip", guest.color);
  el.style.setProperty("--favorite", casts[guest.favorite].color);
  const read = el === currentGuest ? placementRead(guest, state.selectedCol) : null;
  const target = guest.vipTarget !== null
    ? `<span class="guest-target" style="--target:${casts[guest.vipTarget].color}">指名:${casts[guest.vipTarget].name}</span>`
    : "";
  const targetLine = el === currentGuest ? `<span class="target-line">${targetLineForGuest(guest)}</span>` : "";
  const readout = read ? `<span class="placement ${read.tone}">${read.label}</span>` : "";
  const turns = serviceTurns(guest, state.selectedCol);
  el.innerHTML = `
    ${guestFace(guest)}
    ${read ? `<span class="relation-badge ${read.tone}">${read.icon}</span>` : ""}
    <span class="guest-name">${guest.label}</span>
    ${targetLine}
    <span class="guest-meta"><span class="cast-dot"></span>推し:${casts[guest.favorite].name}${target}</span>
    <span class="guest-meta guest-turns">満足ターン ${turns}</span>
    ${readout}
  `;
}

function targetLineForGuest(guest) {
  if (guest.id === "uwaki") return "推し→だれでも";
  if (guest.vipTarget !== null) return `指名→${casts[guest.vipTarget].name}`;
  return `推し→${casts[guest.favorite].name}`;
}

function guestFace(guest) {
  return `
    <img class="oji-face face-${guest.id}" src="assets/ojisan/${guest.id}.png" alt="" aria-hidden="true">
  `;
}

function showTutorial() {
  if (!tutorial) return;
  tutorial.classList.remove("hide");
  if (state.tutorialTimer) clearTimeout(state.tutorialTimer);
  state.tutorialTimer = setTimeout(() => {
    tutorial.classList.add("hide");
  }, 3000);
}

function nextCallInfo(col) {
  const streak = state.streaks[col];
  let label = `ボトルあと${Math.max(0, 3 - Math.min(streak, 3))}`;
  if (streak === 2) label = "次ボトル!";
  if (streak >= 3) label = `シャンパンあと${5 - (streak % 5 || 5)}`;
  if (streak > 0 && streak % 5 === 4) label = "次シャンパン!";
  if (streak > 0 && streak % 5 === 0) label = "次コール待ち";
  const filled = streak % 5 || (streak > 0 ? 5 : 0);
  const dots = Array.from({ length: 5 }, (_, index) => (
    `<i class="${index < filled ? "filled" : ""}"></i>`
  )).join("");
  return { label, dots };
}

function gameLoop(now) {
  if (state.running) {
    const dropProgress = Math.min(1, (now - state.dropStarted) / state.dropWindow);
    dropFill.style.width = `${Math.max(0, 100 - dropProgress * 100)}%`;

    if (dropProgress >= 1) {
      say("自動でポイ！");
      placeCurrent(state.selectedCol, { auto: true });
    }

    if (now - state.lastSecond >= 1000) {
      state.time -= 1;
      state.lastSecond = now;
      changeAmbient(-0.15);
      if (state.time <= 0) {
        endGame("閉店時間！今日の売上を確認しよう。", "閉店時間");
      }
    }

    if (now - state.lastStep >= state.tickMs) {
      state.lastStep = now;
      stepService();
    }
  }

  requestAnimationFrame(gameLoop);
}

function endGame(copy, reason = "営業終了") {
  state.running = false;
  const bestBefore = state.bestScore;
  updateBestScore();
  const title = deriveResultTitle(reason, state.score > bestBefore);
  state.lastResult = {
    score: state.score,
    ambient: Math.round(state.ambient),
    regulars: state.regulars.length,
    reason,
    title,
  };
  resultTitle.textContent = title;
  resultReason.textContent = `敗因: ${reason}`;
  document.querySelector("#resultCopy").textContent = copy;
  document.querySelector("#finalScore").textContent = formatMoney(state.score);
  document.querySelector("#finalAmbient").textContent = Math.round(state.ambient);
  document.querySelector("#finalRegulars").textContent = state.regulars.length;
  overlay.classList.remove("hidden");
  playSound("gameover");
  render();
}

function loadBestScore() {
  try {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  } catch {
    return 0;
  }
}

function updateBestScore() {
  if (state.score <= state.bestScore) return;
  state.bestScore = state.score;
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(state.bestScore));
  } catch {
    // localStorage may be unavailable in strict browser modes.
  }
}

function deriveResultTitle(reason, isBest) {
  if (state.champagnes >= 2) return "シャンパン職人";
  if (state.bottles >= 3) return "ボトル回しの名人";
  if (state.complaints === 0 && state.ambient >= 80) return "空気よすぎ店長";
  if (state.matches >= 18) return "推し席マスター";
  if (state.autoDrops >= 5) return "ながら営業";
  if (reason === "出禁3回") return "出禁対応係";
  if (reason === "列が満席") return "満卓パニック";
  if (isBest) return "本日の伝説営業";
  return "本日の営業終了";
}

function formatMoney(value) {
  return `¥${(value * 1000).toLocaleString("ja-JP")}`;
}

function formatTime(value) {
  const minutes = Math.floor(Math.max(0, value) / 60);
  const seconds = Math.max(0, value) % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function moveSelection(delta) {
  if (!state.running) return;
  state.selectedCol = (state.selectedCol + delta + COLS) % COLS;
  render();
}

function initAudio() {
  if (audioContext) {
    if (audioContext.state === "suspended") audioContext.resume();
    return;
  }
  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) return;
  audioContext = new Context();
}

function playSound(type) {
  if (!audioContext) return;
  const patterns = {
    place: [330],
    match: [523, 659],
    bad: [180, 140],
    combo: [523, 659, 784],
    gameover: [220, 165, 110],
  };
  const notes = patterns[type] || patterns.place;
  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type === "bad" || type === "gameover" ? "sawtooth" : "triangle";
    oscillator.frequency.value = frequency;
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    const start = audioContext.currentTime + index * 0.06;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(type === "combo" ? 0.12 : 0.08, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);
    oscillator.start(start);
    oscillator.stop(start + 0.14);
  });
}

function shareResult() {
  const result = state.lastResult || {
    score: state.score,
    ambient: Math.round(state.ambient),
    regulars: state.regulars.length,
    reason: "営業中",
  };
  const text = `おじさんポイポイ！ ${result.title || "本日の営業終了"} / 売上${formatMoney(result.score)} / 空気${result.ambient}% / 常連${result.regulars}人 #おじさんポイポイ`;
  const url = "https://judo-zz.github.io/concafe-ojisan-puzzle/";
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
  window.open(shareUrl, "_blank", "noopener,noreferrer");
}

let touchStartX = 0;
let touchStartY = 0;
let suppressNextClick = false;

function handleTouchStart(event) {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchEnd(event) {
  if (!state.running) return;
  const touch = event.changedTouches[0];
  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 34) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    moveSelection(dx > 0 ? 1 : -1);
    playSound("place");
    suppressNextClick = true;
  } else if (dy > 0) {
    placeCurrent();
    suppressNextClick = true;
  }
  if (suppressNextClick) {
    window.setTimeout(() => {
      suppressNextClick = false;
    }, 350);
  }
}

document.querySelector("#leftButton").addEventListener("click", () => moveSelection(-1));
document.querySelector("#rightButton").addEventListener("click", () => moveSelection(1));
document.querySelector("#dropButton").addEventListener("click", () => placeCurrent());
document.querySelector("#startButton").addEventListener("click", startGame);
document.querySelector("#restartButton").addEventListener("click", resetGame);
document.querySelector("#againButton").addEventListener("click", resetGame);
shareButton.addEventListener("click", shareResult);
document.addEventListener("pointerdown", initAudio, { once: true });
gamePanel.addEventListener("touchstart", handleTouchStart, { passive: true });
gamePanel.addEventListener("touchend", handleTouchEnd, { passive: true });

window.addEventListener("keydown", (event) => {
  if (!state.started && (event.key === "Enter" || event.key === " ")) {
    event.preventDefault();
    startGame();
    return;
  }
  if (!state.started) return;
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    moveSelection(-1);
  }
  if (event.key === "ArrowRight") {
    event.preventDefault();
    moveSelection(1);
  }
  if (event.key === " " || event.key === "ArrowDown" || event.key === "Enter") {
    event.preventDefault();
    placeCurrent();
  }
  if (event.key.toLowerCase() === "r") resetGame();
});

requestAnimationFrame(gameLoop);
