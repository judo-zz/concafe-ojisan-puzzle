const COLS = 5;
const ROWS = 5;
const SHIFT_SECONDS = 90;
const FEVER_DURATION_MS = 12000;
const SERVICE_TICK_MS = 1900;
const TUTORIAL_COL = 2;
const TUTORIAL_STEPS = [
  "1手目: 薄客をなの列へ",
  "2手目: 同じ列へもう1人",
  "3手目: 3つで常連に進化!",
];
const BEST_SCORE_KEY = "ojisan-poipoi-best-score-v3";
const SERVICE_TURN_BONUS = 2;
const DIFFICULTY_ORDER = ["easy", "normal", "hard"];

const difficulties = {
  easy: {
    label: "かんたん",
    dropWindowMultiplier: 1,
    complaintLimit: 5,
    copy: "基本客だけ",
  },
  normal: {
    label: "ふつう",
    dropWindowMultiplier: 0.94,
    complaintLimit: 3,
    copy: "種類+少しテンポUP",
  },
  hard: {
    label: "むずかしい",
    dropWindowMultiplier: 0.88,
    complaintLimit: 2,
    copy: "多種多様+テンポUP",
  },
};

const casts = [
  { name: "みじゅ", trait: "常連/太客が得意", detail: "会社員もOK", color: "#2fb8ff", asset: "assets/casts/miju.png" },
  { name: "ちゃき", trait: "感情客に強い", detail: "クレーム系 x3", color: "#ff4fae", asset: "assets/casts/chaki.png" },
  { name: "なの", trait: "薄客育成係", detail: "迷子もOK", color: "#9be65e", asset: "assets/casts/nano.png" },
  { name: "いずも", trait: "空気回復", detail: "疲れ客もOK", color: "#aa58ff", asset: "assets/casts/izumo.png" },
  { name: "ゆめ", trait: "VIP/神客担当", detail: "兄客もOK", color: "#ffd21e", asset: "assets/casts/yume.png" },
];

const guestTypes = [
  {
    id: "usui",
    label: "薄客",
    tier: 0,
    color: "#9aa4ad",
    base: 10,
    points: 30,
    weight: 34,
    asset: "assets/ojisan/usui.png",
    note: "3つで常連！",
  },
  {
    id: "office",
    label: "会社員",
    tier: 0,
    color: "#7aa8d8",
    base: 12,
    points: 34,
    weight: 10,
    asset: "assets/ojisan/office.png",
    note: "名刺きた！",
    minDifficulty: "normal",
    unlockAt: 0,
  },
  {
    id: "shy",
    label: "照れ客",
    tier: 0,
    color: "#f3a0b8",
    base: 13,
    points: 36,
    weight: 9,
    asset: "assets/ojisan/shy.png",
    note: "照れてる！",
    minDifficulty: "normal",
    unlockAt: 10,
  },
  {
    id: "gachikoi",
    label: "ガチ恋",
    tier: 0,
    color: "#ea6f91",
    base: 14,
    points: 42,
    weight: 7,
    asset: "assets/ojisan/gachikoi.png",
    note: "ハート多め！",
    minDifficulty: "normal",
    unlockAt: 22,
  },
  {
    id: "host",
    label: "兄客",
    tier: 0,
    color: "#c89f67",
    base: 12,
    points: 40,
    weight: 6,
    asset: "assets/ojisan/host.png",
    note: "ノリ軽め！",
    minDifficulty: "hard",
    unlockAt: 0,
  },
  {
    id: "tired",
    label: "疲れ客",
    tier: 0,
    color: "#8f8f9b",
    base: 15,
    points: 44,
    weight: 5,
    asset: "assets/ojisan/tired.png",
    note: "おつかれ！",
    minDifficulty: "hard",
    unlockAt: 14,
  },
  {
    id: "lost",
    label: "迷子",
    tier: 0,
    color: "#7fc6d8",
    base: 11,
    points: 32,
    weight: 5,
    asset: "assets/ojisan/lost.png",
    note: "迷ってる！",
    minDifficulty: "hard",
    unlockAt: 20,
  },
  {
    id: "uwaki",
    label: "浮気性",
    tier: 0,
    color: "#4bc2c5",
    base: 11,
    points: 38,
    weight: 5,
    asset: "assets/ojisan/uwaki.png",
    note: "目移り中！",
    minDifficulty: "hard",
    unlockAt: 30,
  },
  {
    id: "doutan",
    label: "同担拒否",
    tier: 0,
    color: "#f08a5d",
    base: 13,
    points: 46,
    weight: 4,
    asset: "assets/ojisan/doutan.png",
    note: "ムッとしてる！",
    minDifficulty: "hard",
    unlockAt: 38,
  },
  {
    id: "jouren",
    label: "常連",
    tier: 1,
    color: "#4ecba0",
    base: 13,
    points: 105,
    weight: 12,
    asset: "assets/ojisan/dad.png",
    note: "常連きた！",
  },
  {
    id: "futoi",
    label: "太客",
    tier: 2,
    color: "#e1b453",
    base: 16,
    points: 330,
    weight: 7,
    asset: "assets/ojisan/futoi.png",
    note: "太客きた！",
  },
  {
    id: "vip",
    label: "VIP",
    tier: 3,
    color: "#b88ee6",
    base: 20,
    points: 900,
    weight: 6,
    asset: "assets/ojisan/vip.png",
    note: "VIP！",
  },
  {
    id: "kamikaku",
    label: "神客",
    tier: 4,
    color: "#ff4fae",
    base: 26,
    points: 3200,
    weight: 0,
    asset: "assets/ojisan/festival.png",
    note: "神客誕生！",
  },
  {
    id: "claimer",
    label: "クレーマー",
    tier: -1,
    color: "#d95757",
    base: 9,
    points: 0,
    weight: 6,
    asset: "assets/ojisan/claimer.png",
    note: "2つで逆転！",
  },
  {
    id: "kujou",
    label: "苦情仲間",
    tier: 2,
    color: "#ff8c42",
    base: 16,
    points: 420,
    weight: 0,
    asset: "assets/ojisan/capglass.png",
    note: "逆転チャンス！",
  },
];

const castAffinities = [
  { bestIds: ["jouren", "futoi", "office"], multiplier: 2, label: "常連/会社員 x2" },
  { bestIds: ["claimer", "kujou", "gachikoi", "doutan"], multiplier: 3, label: "感情客 x3" },
  { bestIds: ["usui", "shy", "lost"], multiplier: 1.8, label: "薄客/迷子 x1.8" },
  { bestIds: ["tired", "uwaki"], multiplier: 1.6, label: "空気 +8" },
  { bestIds: ["vip", "kamikaku", "host"], multiplier: 2.5, label: "VIP/兄客 x2.5" },
];

const tierLabels = ["薄", "常", "太", "VIP", "神"];

const state = {
  board: [],
  current: null,
  next: null,
  selectedCol: 2,
  score: 0,
  ambient: 70,
  time: SHIFT_SECONDS,
  complaints: 0,
  running: false,
  started: false,
  dropStarted: 0,
  dropWindow: 3600,
  tutorialTimer: null,
  lastStep: 0,
  lastSecond: 0,
  bestScore: 0,
  difficulty: "easy",
  lastResult: null,
  placements: 0,
  merges: 0,
  bestChain: 0,
  divineColumn: null,
  feverUntil: 0,
  feverCount: 0,
  autoDrops: 0,
  tutorialActive: false,
  checkoutTutorialActive: false,
  tutorialStep: 0,
};

state.bestScore = loadBestScore();

const startScreen = document.querySelector("#startScreen");
const gamePanel = document.querySelector("#gamePanel");
const boardEl = document.querySelector("#board");
const castsEl = document.querySelector("#casts");
const evolutionBar = document.querySelector(".evolution-bar");
const ambientValue = document.querySelector("#ambientValue");
const ambientFill = document.querySelector("#ambientFill");
const scoreValue = document.querySelector("#scoreValue");
const bestValue = document.querySelector("#bestValue");
const timeValue = document.querySelector("#timeValue");
const timeFill = document.querySelector("#timeFill");
const complaintValue = document.querySelector("#complaintValue");
const complaintWarning = document.querySelector("#complaintWarning");
const currentGuest = document.querySelector("#currentGuest");
const nextGuest = document.querySelector("#nextGuest");
const dropFill = document.querySelector("#dropFill");
const messageEl = document.querySelector("#message");
const overlay = document.querySelector("#gameOver");
const tutorial = document.querySelector("#tutorial");
const floatLayer = document.querySelector("#floatLayer");
const resultTitle = document.querySelector("#resultTitle");
const resultReason = document.querySelector("#resultReason");
const shareButton = document.querySelector("#shareButton");
const difficultyButtons = Array.from(document.querySelectorAll(".difficulty-button"));
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
    if (!isGuestAvailableForDifficulty(guest)) return false;
    if (guest.unlockAt && elapsed < guest.unlockAt) return false;
    if (guest.id === "jouren") return elapsed >= 6;
    if (guest.id === "futoi") return elapsed >= 22;
    if (guest.id === "vip") return elapsed >= 35;
    if (guest.id === "claimer") return elapsed >= 20;
    return true;
  });
}

function difficultyRank(value = state.difficulty) {
  return Math.max(0, DIFFICULTY_ORDER.indexOf(value));
}

function isGuestAvailableForDifficulty(guest) {
  if (!guest.minDifficulty) return true;
  return difficultyRank() >= difficultyRank(guest.minDifficulty);
}

function difficultyConfig() {
  return difficulties[state.difficulty] || difficulties.easy;
}

function complaintLimit() {
  return difficultyConfig().complaintLimit;
}

function shouldRunTutorial() {
  return state.difficulty === "easy";
}

function makeGuest(type) {
  const favorite = preferredColumnForGuest(type.id) ?? Math.floor(Math.random() * COLS);
  return {
    ...type,
    favorite,
    vipTarget: null,
    serial: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  };
}

function starterGuest() {
  const type = guestTypes.find((guest) => guest.id === "usui");
  const guest = makeGuest(type);
  guest.favorite = 2;
  return guest;
}

function tutorialGuest() {
  return makeGuest(guestTypes.find((guest) => guest.id === "usui"));
}

function resetGame() {
  initAudio();
  document.body.classList.remove("result-open");
  const config = difficultyConfig();
  const tutorialMode = shouldRunTutorial();
  state.started = true;
  state.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  state.time = SHIFT_SECONDS;
  state.current = tutorialMode ? starterGuest() : weightedGuest();
  state.next = tutorialMode ? tutorialGuest() : weightedGuest();
  state.selectedCol = TUTORIAL_COL;
  state.score = 0;
  state.ambient = 70;
  state.complaints = 0;
  state.running = true;
  state.lastResult = null;
  state.placements = 0;
  state.merges = 0;
  state.bestChain = 0;
  state.divineColumn = null;
  state.feverUntil = 0;
  state.feverCount = 0;
  state.autoDrops = 0;
  state.tutorialActive = tutorialMode;
  state.checkoutTutorialActive = false;
  state.tutorialStep = 0;
  state.lastStep = performance.now();
  state.lastSecond = performance.now();
  if (!tutorialMode) state.selectedCol = bestColumnForGuest(state.current);
  setDropWindow(performance.now());
  overlay.classList.add("hidden");
  floatLayer.innerHTML = "";
  if (tutorialMode) {
    showTutorial("3つ並べて育てろ！", `${config.label} / ${config.copy}`);
    messageEl.textContent = TUTORIAL_STEPS[0];
  } else {
    hideTutorial();
    messageEl.textContent = `${config.label}: 3つで育てて高く会計!`;
  }
  render();
}

function startGame() {
  initAudio();
  startScreen.hidden = true;
  gamePanel.hidden = false;
  resetGame();
}

function setDifficulty(value) {
  if (!difficulties[value] || state.running) return;
  state.difficulty = value;
  state.bestScore = loadBestScore();
  difficultyButtons.forEach((button) => {
    const active = button.dataset.difficulty === value;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function serviceTurns(guest, col) {
  let turns = guest.base + SERVICE_TURN_BONUS;
  if (castMultiplier(guest, col) > 1) turns -= 2;
  if (state.ambient <= 32) turns += 2;

  return Math.max(5, Math.ceil(turns));
}

function tileForGuest(guest, col) {
  return {
    guest,
    turns: serviceTurns(guest, col),
    col,
    age: 0,
    matched: castMultiplier(guest, col) > 1,
    vipMiss: false,
  };
}

function placeCurrent(col = state.selectedCol, options = {}) {
  if (!state.running) return;
  initAudio();
  if (state.checkoutTutorialActive) {
    say("まずはなのをタップで会計!");
    showFloat("下の女の子!", "warn");
    render();
    return;
  }
  if (state.tutorialActive && col !== TUTORIAL_COL) {
    state.selectedCol = TUTORIAL_COL;
    say("まずは光るなの列へ!");
    showFloat("ここに置いて!", "warn");
    render();
    return;
  }

  const row = lowestOpenRow(col);
  if (row === -1) {
    const openCol = nearestOpenColumn(col);
    if (columnHeights().every((height) => height >= ROWS)) {
      endGame("おじさんが入りきらない！全列満席で営業終了。", "全列満席");
      return;
    }
    changeAmbient(-8);
    state.selectedCol = openCol;
    setDropWindow();
    say("その列は満席! 空いてる列へ");
    showFloat("満席 -8", "warn");
    render();
    return;
  }

  const tile = tileForGuest(state.current, col);
  state.board[row][col] = tile;
  const feedback = applyPlacementPressure(tile);
  state.placements += 1;
  if (options.auto) state.autoDrops += 1;
  showFloat(feedback.text, feedback.tone);
  playSound(feedback.sound);
  checkMergesAndChain();
  if (!state.running) return;

  if (state.tutorialActive) {
    advanceTutorial();
    return;
  }

  state.current = state.next;
  state.next = weightedGuest();
  state.selectedCol = nearestOpenColumn(col);
  setDropWindow();
  render();
}

function advanceTutorial() {
  state.tutorialStep += 1;
  if (state.tutorialStep < TUTORIAL_STEPS.length) {
    state.current = state.next;
    state.next = tutorialGuest();
    state.selectedCol = TUTORIAL_COL;
    setDropWindow();
    say(TUTORIAL_STEPS[state.tutorialStep]);
    render();
    return;
  }

  state.tutorialActive = false;
  state.checkoutTutorialActive = true;
  state.current = weightedGuest();
  state.next = weightedGuest();
  state.selectedCol = TUTORIAL_COL;
  setDropWindow();
  showFloat("営業本番!", "good");
  say("なのをタップして会計してみよう!");
  showTutorial("キャストをタップで会計！", "なのを押して回収してみよう");
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
  const multiplier = castMultiplier(guest, col);
  const feedback = multiplier > 1
    ? { text: `回収なら x${formatMultiplier(multiplier)}`, tone: "good", sound: "match" }
    : { text: "育成ポイ！", tone: "neutral", sound: "place" };
  if (guest.id === "claimer") changeAmbient(-2);
  else if (multiplier > 1) changeAmbient(1);
  say(guest.note);
  return feedback;
}

function stepService() {
  if (!state.running) return;
  if (state.tutorialActive) return;

  const speed = 1;
  const cleared = [];

  for (let row = ROWS - 1; row >= 0; row -= 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = state.board[row][col];
      if (!tile) continue;
      tile.age += 1;
      tile.turns -= speed;

      if (tile.guest.id === "claimer" && tile.age > 0 && tile.age % 5 === 0) {
        state.complaints += 1;
        changeAmbient(-9);
        say("クレーム発生！");
        showFloat("クレーム -9", "bad");
        playSound("bad");
      }

      if (tile.turns <= 0) {
        cleared.push({ tile, row, col });
      }
    }
  }

  for (const clear of cleared) clearTile(clear);
  collapseBoard();
  if (cleared.length) checkMergesAndChain();
  if (!state.running) return;

  if (state.complaints >= complaintLimit()) {
    endGame("クレーマーを放置しすぎた！クレーム満タンで営業終了。", "クレーム満タン");
  }

  render();
}

function clearTile({ tile, row, col }) {
  state.board[row][col] = null;
  const guest = tile.guest;
  const multiplier = castMultiplier(guest, col);
  const airBonus = 1 + Math.max(0, state.ambient - 50) / 250;
  const feverBonus = isFeverActive() ? 2 : 1;
  let points = Math.round((guest.points + state.ambient * 0.8) * multiplier * airBonus * feverBonus);
  if (col === 3) {
    changeAmbient(8);
    showColumnFloat(col, "空気 +8", "good");
  }
  if (guest.id === "kamikaku") {
    points += col === 4 ? 2200 : 1200;
  }

  state.score += points;
  showColumnFloat(col, `+${formatMoney(points)}`, multiplier > 1 ? "good" : "neutral");

  if (guest.id === "futoi") changeAmbient(4);
  if (guest.id === "kujou") changeAmbient(8);
  if (guest.id === "claimer") changeAmbient(col === 1 ? 6 : -6);
}

function checkMergesAndChain() {
  let depth = 0;
  while (depth < 8) {
    const merged = applyOneMerge();
    if (!merged) break;
    if (!state.running) {
      depth += 1;
      break;
    }
    collapseBoard();
    depth += 1;
  }

  if (depth > 0) {
    state.bestChain = Math.max(state.bestChain, depth);
    state.merges += depth;
    changeAmbient(4 + depth * 2);
    if (depth >= 2) showFloat(`${depth}連鎖！`, "grand");
  }
}

function applyOneMerge() {
  const claimerGroup = findFirstMergeGroup(["claimer"], 2);
  if (claimerGroup) {
    mergeClaimers(claimerGroup);
    return true;
  }

  for (let tier = 3; tier >= 0; tier -= 1) {
    const type = guestTypes.find((guest) => guest.tier === tier && guest.id !== "kujou");
    if (!type) continue;
    const group = findFirstMergeGroup([type.id], 3);
    if (group) {
      mergeGroup(group, type);
      return true;
    }
  }

  return false;
}

function findFirstMergeGroup(ids, minSize = 3) {
  const visited = new Set();
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = state.board[row][col];
      if (!tile || !ids.includes(tile.guest.id)) continue;
      const key = cellKey(row, col);
      if (visited.has(key)) continue;
      const group = connectedGroup(row, col, tile.guest.id);
      group.forEach(([groupRow, groupCol]) => visited.add(cellKey(groupRow, groupCol)));
      if (group.length >= minSize) return group;
    }
  }
  return null;
}

function connectedGroup(startRow, startCol, id) {
  const queue = [[startRow, startCol]];
  const visited = new Set();
  const group = [];

  while (queue.length) {
    const [row, col] = queue.shift();
    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) continue;
    const key = cellKey(row, col);
    if (visited.has(key)) continue;
    visited.add(key);

    const tile = state.board[row][col];
    if (!tile || tile.guest.id !== id) continue;

    group.push([row, col]);
    queue.push([row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]);
  }

  return group;
}

function mergeGroup(group, type) {
  const nextType = guestTypes.find((guest) => guest.tier === type.tier + 1 && guest.id !== "kujou");
  if (!nextType) return;
  const [targetRow, targetCol] = mergeTarget(group);

  group.forEach(([row, col]) => {
    state.board[row][col] = null;
  });
  state.board[targetRow][targetCol] = tileForGuest(makeGuest(nextType), targetCol);

  say(`${nextType.label}に進化！`);
  showColumnFloat(targetCol, `${nextType.label}誕生！`, nextType.id === "kamikaku" ? "grand" : "good");
  if (nextType.tier >= 2) showFloat(`${nextType.label}誕生!`, "grand");
  playSound("combo");

  if (nextType.id === "kamikaku") {
    state.divineColumn = targetCol;
    const multiplier = castMultiplier(nextType, targetCol);
    const bonus = Math.round(nextType.points * multiplier + 2500);
    state.score += bonus;
    startFever(targetCol, bonus);
  }
}

function startFever(col, bonus) {
  state.feverUntil = Math.max(state.feverUntil, performance.now()) + FEVER_DURATION_MS;
  state.feverCount += 1;
  state.time = Math.min(SHIFT_SECONDS, state.time + 8);
  changeAmbient(24);
  document.body.classList.add("divine-burst");
  window.setTimeout(() => document.body.classList.remove("divine-burst"), 1100);
  setDropWindow();
  say(`神客フィーバー! 会計売上2倍!`);
  showFloat(`神客フィーバー +${formatMoney(bonus)}`, "grand");
  showColumnFloat(col, "FEVER!", "grand");
  playSound("combo");
}

function mergeClaimers(group) {
  const [targetRow, targetCol] = mergeTarget(group);
  const type = guestTypes.find((guest) => guest.id === "kujou");
  group.forEach(([row, col]) => {
    state.board[row][col] = null;
  });
  state.board[targetRow][targetCol] = tileForGuest(makeGuest(type), targetCol);
  const bonus = 180;
  state.score += bonus;
  changeAmbient(16);
  say("苦情仲間に逆転！ちゃき列で3倍！");
  showColumnFloat(targetCol, `苦情仲間 +${formatMoney(bonus)}`, "good");
  showFloat("ちゃき列で3倍!", "good");
  playSound("combo");
}

function mergeTarget(group) {
  return group.reduce((best, cell) => {
    if (cell[0] > best[0]) return cell;
    if (cell[0] === best[0] && Math.abs(cell[1] - state.selectedCol) < Math.abs(best[1] - state.selectedCol)) return cell;
    return best;
  }, group[0]);
}

function cellKey(row, col) {
  return `${row}:${col}`;
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
}

function setDropWindow(now = performance.now()) {
  state.dropStarted = now;
  const config = difficultyConfig();
  const feverBonus = isFeverActive(now) ? 900 : 0;
  const baseWindow = (2400 + state.ambient * 16 + feverBonus) * config.dropWindowMultiplier;
  state.dropWindow = Math.max(2100, Math.min(5400, baseWindow));
}

function isFeverActive(now = performance.now()) {
  return state.running && now < state.feverUntil;
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

function placementRead(guest, col) {
  const multiplier = castMultiplier(guest, col);
  if (multiplier > 1) return { icon: "×" + formatMultiplier(multiplier), label: `${casts[col].name}回収 x${formatMultiplier(multiplier)}`, tone: "good" };
  if (col === 3) return { icon: "気", label: "空気回復", tone: "good" };
  return { icon: "育", label: "育成中", tone: "neutral" };
}

function targetColumns(guest) {
  if (!guest) return [];
  const affinityCols = castAffinities
    .map((affinity, col) => (affinity.bestIds.includes(guest.id) ? col : null))
    .filter((col) => col !== null);
  if (state.ambient <= 45 && !affinityCols.includes(3)) affinityCols.push(3);
  if (affinityCols.length) return affinityCols;
  return [preferredColumnForGuest(guest.id) ?? guest.favorite];
}

function preferredColumnForGuest(id) {
  const columns = {
    jouren: 0,
    futoi: 0,
    claimer: 1,
    kujou: 1,
    gachikoi: 1,
    doutan: 1,
    usui: 2,
    shy: 2,
    lost: 2,
    tired: 3,
    uwaki: 3,
    office: 0,
    host: 4,
    kamikaku: 4,
    vip: 4,
  };
  return columns[id] ?? null;
}

function castMultiplier(guest, col) {
  if (!guest || col < 0 || col >= COLS) return 1;
  return castAffinities[col].bestIds.includes(guest.id) ? castAffinities[col].multiplier : 1;
}

function formatMultiplier(multiplier) {
  return Number.isInteger(multiplier) ? String(multiplier) : multiplier.toFixed(1);
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

function render() {
  renderBoard();
  renderCasts();
  renderEvolutionBar();
  renderGuest(currentGuest, state.current);
  renderGuest(nextGuest, state.next);

  ambientValue.textContent = Math.round(state.ambient);
  ambientFill.style.width = `${state.ambient}%`;
  document.body.classList.toggle("air-high", state.ambient >= 80);
  document.body.classList.toggle("air-low", state.ambient <= 30);
  document.body.classList.toggle("fever", isFeverActive());
  const maxComplaints = complaintLimit();
  document.body.classList.toggle("complaint-high", state.complaints >= maxComplaints - 1);
  scoreValue.textContent = formatMoney(state.score);
  bestValue.textContent = `ベスト ${formatMoney(state.bestScore)}`;
  timeValue.textContent = formatTime(state.time);
  timeFill.style.width = `${Math.max(0, (state.time / SHIFT_SECONDS) * 100)}%`;
  complaintValue.textContent = `${state.complaints}/${maxComplaints}`;
  complaintWarning.textContent = `あと${Math.max(0, maxComplaints - state.complaints)}でGAME OVER`;
}

function renderEvolutionBar() {
  if (!evolutionBar) return;
  const materials = guestTypes
    .filter((guest) => guest.tier === 0 && isGuestAvailableForDifficulty(guest))
    .map((guest) => materialShortLabel(guest.id))
    .join("・");
  evolutionBar.innerHTML = `
    <span class="evolution-materials">素材: ${materials}</span>
    <i>→</i>
    <span>常連</span>
    <i>→</i>
    <span>太客</span>
    <i>→</i>
    <span>VIP</span>
    <i>→</i>
    <strong>神客</strong>
  `;
}

function materialShortLabel(id) {
  const labels = {
    usui: "薄",
    office: "会",
    shy: "照",
    gachikoi: "ガ",
    host: "兄",
    tired: "疲",
    lost: "迷",
    uwaki: "浮",
    doutan: "拒",
  };
  return labels[id] || id;
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
      if (isMergeReachCell(row, col)) cell.classList.add("merge-reach");
      if (row === landingRow && col === state.selectedCol && wouldMergeOnDrop(row, col, state.current)) {
        cell.classList.add(state.current.id === "claimer" ? "claimer-reach" : "merge-reach");
        cell.dataset.reach = state.current.id === "claimer" ? "仲間!" : "進化!";
      }
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

function isMergeReachCell(row, col) {
  const tile = state.board[row][col];
  if (!tile || tile.guest.id === "kamikaku" || tile.guest.id === "kujou") return false;
  return connectedGroup(row, col, tile.guest.id).length >= 2;
}

function wouldMergeOnDrop(row, col, guest) {
  if (!guest || row < 0 || guest.id === "kamikaku" || guest.id === "kujou") return false;
  const minSize = guest.id === "claimer" ? 2 : 3;
  const seen = new Set();
  let connected = 1;
  for (const [nextRow, nextCol] of [[row - 1, col], [row + 1, col], [row, col - 1], [row, col + 1]]) {
    if (nextRow < 0 || nextRow >= ROWS || nextCol < 0 || nextCol >= COLS) continue;
    const tile = state.board[nextRow][nextCol];
    if (!tile || tile.guest.id !== guest.id) continue;
    const group = connectedGroup(nextRow, nextCol, guest.id);
    for (const [groupRow, groupCol] of group) {
      const key = cellKey(groupRow, groupCol);
      if (seen.has(key)) continue;
      seen.add(key);
      connected += 1;
    }
  }
  return connected >= minSize;
}

function tileElement(tile) {
  const wrapper = document.createElement("div");
  const classes = ["tile"];
  classes.push(`guest-${tile.guest.id}`);
  classes.push(`tier-${tile.guest.tier}`);
  if (tile.guest.id === "kamikaku") classes.push("divine");
  if (tile.guest.id === "kujou") classes.push("kujou");
  if (tile.matched) classes.push("matched");
  if (tile.vipMiss || tile.guest.id === "claimer") classes.push("danger");
  wrapper.className = classes.join(" ");
  wrapper.style.setProperty("--chip", tile.guest.color);
  wrapper.style.setProperty("--favorite", casts[tile.guest.favorite].color);
  const countdown = complaintCountdown(tile);
  const claimerCue = tile.guest.id === "claimer"
    ? `<span class="claim-cue${countdown <= 1 ? " urgent" : ""}">あと${countdown}</span>`
    : "";
  const kujouCue = tile.guest.id === "kujou"
    ? `<span class="claim-cue kujou-cue">ちゃきx3</span>`
    : "";
  wrapper.innerHTML = `
    ${guestFace(tile.guest)}
    <span class="tier-badge">${tierBadge(tile.guest)}</span>
    <span class="turns">${Math.max(0, tile.turns)}</span>
    ${claimerCue}
    ${kujouCue}
  `;
  return wrapper;
}

function tierBadge(guest) {
  if (guest.id === "claimer") return "怒";
  if (guest.id === "kujou") return "仲";
  return tierLabels[guest.tier] || "";
}

function complaintCountdown(tile) {
  return 5 - (tile.age % 5);
}

function renderCasts() {
  castsEl.innerHTML = "";
  const preferredCols = targetColumns(state.current);
  casts.forEach((cast, col) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cast${col === state.selectedCol ? " active" : ""}${preferredCols.includes(col) ? " preferred" : ""}`;
    button.style.setProperty("--cast", cast.color);
    const height = columnHeights()[col];
    if (height > 0) button.classList.add("can-checkout");
    button.innerHTML = `
      <img class="cast-face" src="${cast.asset}" alt="" aria-hidden="true">
      <strong>${cast.name}</strong>
      <span>${cast.trait}</span>
      <span>${cast.detail}</span>
      <span class="checkout-hint">タップで会計</span>
      <span class="call-dots">${columnDots(height)}</span>
    `;
    button.addEventListener("click", () => {
      if (checkoutColumn(col)) return;
      state.selectedCol = col;
      render();
    });
    castsEl.appendChild(button);
  });
}

function checkoutColumn(col) {
  if (!state.running) return false;
  if (state.checkoutTutorialActive && col !== TUTORIAL_COL) {
    state.selectedCol = TUTORIAL_COL;
    say("まずはなのをタップ!");
    showFloat("なのを押して!", "warn");
    render();
    return true;
  }
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    const tile = state.board[row][col];
    if (!tile) continue;
    if (state.checkoutTutorialActive) tile.turns = 1;
    tile.turns -= col === 3 ? 5 : 4;
    showColumnFloat(col, "会計!", castMultiplier(tile.guest, col) > 1 || col === 3 ? "good" : "neutral");
    playSound("match");
    if (tile.turns <= 0) {
      clearTile({ tile, row, col });
      collapseBoard();
      checkMergesAndChain();
      setDropWindow();
    }
    if (state.checkoutTutorialActive) {
      finishCheckoutTutorial();
      return true;
    }
    render();
    return true;
  }
  return false;
}

function finishCheckoutTutorial() {
  state.checkoutTutorialActive = false;
  state.selectedCol = bestColumnForGuest(state.current);
  setDropWindow();
  showFloat("会計OK!", "good");
  say("本番開始! 3つで育てて高く会計!");
  render();
}

function renderGuest(el, guest) {
  el.className = `guest-chip guest-${guest.id}${el === nextGuest ? " small" : ""}`;
  el.style.setProperty("--chip", guest.color);
  el.style.setProperty("--favorite", casts[guest.favorite].color);
  const read = el === currentGuest ? placementRead(guest, state.selectedCol) : null;
  const targetLine = el === currentGuest ? `<span class="target-line">${targetLineForGuest(guest)}</span>` : "";
  const readout = read ? `<span class="placement ${read.tone}">${read.label}</span>` : "";
  const turns = serviceTurns(guest, state.selectedCol);
  el.innerHTML = `
    ${guestFace(guest)}
    ${read ? `<span class="relation-badge ${read.tone}">${read.icon}</span>` : ""}
    <span class="guest-name">${guest.label}</span>
    ${targetLine}
    <span class="guest-meta"><span class="cast-dot"></span>${read ? read.label : "3つで進化"}</span>
    <span class="guest-meta guest-turns">回収まで ${turns}</span>
    ${readout}
  `;
}

function targetLineForGuest(guest) {
  if (guest.id === "claimer") return "2つで苦情仲間";
  if (guest.id === "kujou") return "ちゃき列で3倍";
  if (guest.id === "kamikaku") return "会計2倍フィーバー";
  const next = nextEvolution(guest);
  return next ? `3つで${next.label}` : "高く回収";
}

function guestFace(guest) {
  return `
    <img class="oji-face face-${guest.id}" src="${guest.asset || `assets/ojisan/${guest.id}.png`}" alt="" aria-hidden="true">
  `;
}

function nextEvolution(guest) {
  if (guest.id === "claimer") return guestTypes.find((type) => type.id === "kujou");
  if (guest.tier < 0 || guest.tier >= 4) return null;
  return guestTypes.find((type) => type.tier === guest.tier + 1 && type.id !== "kujou");
}

function showTutorial(title = "3つ並べて育てろ！", copy = "神客でフィーバー突入") {
  if (!tutorial) return;
  const titleEl = tutorial.querySelector("strong");
  const copyEl = tutorial.querySelector("span");
  if (titleEl) titleEl.textContent = title;
  if (copyEl) copyEl.textContent = copy;
  tutorial.classList.remove("hide");
  if (state.tutorialTimer) clearTimeout(state.tutorialTimer);
  state.tutorialTimer = setTimeout(() => {
    tutorial.classList.add("hide");
  }, 3000);
}

function hideTutorial() {
  if (!tutorial) return;
  if (state.tutorialTimer) clearTimeout(state.tutorialTimer);
  state.tutorialTimer = null;
  tutorial.classList.add("hide");
}

function columnDots(height) {
  return Array.from({ length: ROWS }, (_, index) => (
    `<i class="${index < height ? "filled" : ""}"></i>`
  )).join("");
}

function gameLoop(now) {
  if (state.running) {
    if (state.tutorialActive || state.checkoutTutorialActive) {
      dropFill.style.width = "100%";
      requestAnimationFrame(gameLoop);
      return;
    }

    const dropProgress = Math.min(1, (now - state.dropStarted) / state.dropWindow);
    dropFill.style.width = `${Math.max(0, 100 - dropProgress * 100)}%`;

    if (dropProgress >= 1) {
      say("自動でポイ！");
      placeCurrent(state.selectedCol, { auto: true });
    }

    if (!state.running) {
      requestAnimationFrame(gameLoop);
      return;
    }

    if (now - state.lastSecond >= 1000) {
      state.time -= 1;
      state.lastSecond = now;
      changeAmbient(-0.15);
      if (state.time <= 0) {
        endGame("閉店時間！今日の売上を確認しよう。", "閉店時間");
      }
    }

    if (now - state.lastStep >= SERVICE_TICK_MS) {
      state.lastStep = now;
      stepService();
    }
  }

  requestAnimationFrame(gameLoop);
}

function endGame(copy, reason = "営業終了") {
  state.running = false;
  document.body.classList.add("result-open");
  floatLayer.innerHTML = "";
  const bestBefore = state.bestScore;
  updateBestScore();
  const title = deriveResultTitle(reason, state.score > bestBefore);
  state.lastResult = {
    score: state.score,
    ambient: Math.round(state.ambient),
    chain: state.bestChain,
    merges: state.merges,
    reason,
    title,
  };
  resultTitle.textContent = title;
  resultReason.textContent = `終了理由: ${reason}`;
  document.querySelector("#resultCopy").textContent = copy;
  document.querySelector("#finalScore").textContent = formatMoney(state.score);
  document.querySelector("#finalAmbient").textContent = Math.round(state.ambient);
  document.querySelector("#finalChain").textContent = `${state.bestChain}連鎖`;
  document.querySelector("#finalMerges").textContent = state.merges;
  document.querySelector("#finalHint").textContent = resultHint(reason);
  overlay.classList.remove("hidden");
  playSound("gameover");
  render();
}

function resultHint(reason) {
  if (state.difficulty === "hard" && state.score > 0) return "むずかしい完走はかなり強い。次は神客フィーバー中の会計を狙おう。";
  if (state.feverCount > 0) return "神客フィーバー中の会計は売上2倍。次はフィーバー中に高ランク客を回収しよう。";
  if (state.bestChain >= 3) return "連鎖の形はできてる。VIPを3つ集めたら神客が見える。";
  if (state.merges >= 4) return "育成は順調。高ランク客はゆめ列で回収すると売上が伸びる。";
  if (state.complaints >= complaintLimit()) return "クレーマーは2つで苦情仲間。ちゃき列で会計すると強い。";
  return "まずは薄客3つで常連、常連3つで太客を狙おう。";
}

function loadBestScore() {
  try {
    return Number(localStorage.getItem(bestScoreKey())) || 0;
  } catch {
    return 0;
  }
}

function updateBestScore() {
  if (state.score <= state.bestScore) return;
  state.bestScore = state.score;
  try {
    localStorage.setItem(bestScoreKey(), String(state.bestScore));
  } catch {
    // localStorage may be unavailable in strict browser modes.
  }
}

function bestScoreKey() {
  return `${BEST_SCORE_KEY}-${state.difficulty || "easy"}`;
}

function deriveResultTitle(reason, isBest) {
  if (state.feverCount >= 2) return "神客フィーバー職人";
  if (state.feverCount >= 1) return "神客フィーバー営業";
  if (state.bestChain >= 4) return "連鎖営業マスター";
  if (state.merges >= 10) return "おじさん育成王";
  if (state.complaints === 0 && state.ambient >= 80) return "空気よすぎ店長";
  if (state.autoDrops >= 5) return "ながら営業";
  if (reason === "クレーム満タン") return "クレーム対応係";
  if (reason === "全列満席") return "満卓パニック";
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
    chain: state.bestChain,
    merges: state.merges,
    reason: "営業中",
  };
  const text = `おじさんポイポイ！ ${result.title || "本日の営業終了"} / 売上${formatMoney(result.score)} / ${result.chain || 0}連鎖 / 進化${result.merges || 0}回 #おじさんポイポイ`;
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
difficultyButtons.forEach((button) => {
  button.addEventListener("click", () => setDifficulty(button.dataset.difficulty));
});
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

setDifficulty(state.difficulty);
requestAnimationFrame(gameLoop);
