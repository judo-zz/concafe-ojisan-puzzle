const COLS = 5;
const ROWS = 9;
const SHIFT_SECONDS = 150;

const casts = [
  { name: "営業", trait: "太客処理のプロ", detail: "太客短縮 / 売上UP", color: "#2fb8ff" },
  { name: "ガチ恋", trait: "高速処理の受け皿", detail: "ガチ恋一致で即帰宅に近い", color: "#ff4fae" },
  { name: "新人", trait: "低速だが個性枠", detail: "処理ターンやや長め", color: "#9be65e" },
  { name: "元ドル", trait: "空気回復役", detail: "退店時に空気を少し回復", color: "#aa58ff" },
  { name: "ベテラン", trait: "VIP対応のエース", detail: "VIP処理短縮 / 売上UP", color: "#ffd21e" },
];

const guestTypes = [
  {
    id: "futoi",
    label: "太客",
    color: "#e1b453",
    base: 4,
    points: 95,
    weight: 16,
    note: "財布の厚みだけが、たまに空気を救う。",
  },
  {
    id: "usui",
    label: "薄客",
    color: "#9aa4ad",
    base: 3,
    points: 22,
    weight: 22,
    note: "軽い会釈と短い滞在。店はそういう日もある。",
  },
  {
    id: "gachikoi",
    label: "ガチ恋",
    color: "#ea6f91",
    base: 5,
    points: 76,
    weight: 14,
    note: "愛は処理速度を上げる。だいたい同じだけ事故も増やす。",
  },
  {
    id: "uwaki",
    label: "浮気性",
    color: "#4bc2c5",
    base: 3,
    points: 36,
    weight: 18,
    note: "誰にでも優しい客は、誰の記憶にも少し薄い。",
  },
  {
    id: "claimer",
    label: "クレーマー",
    color: "#d95757",
    base: 4,
    points: 64,
    weight: 11,
    note: "置く場所より、置いた後の時間が問題になる。",
  },
  {
    id: "vip",
    label: "VIP",
    color: "#b88ee6",
    base: 5,
    points: 135,
    weight: 9,
    note: "指名は強い。縛りも強い。",
  },
  {
    id: "doutan",
    label: "同担拒否",
    color: "#f08a5d",
    base: 4,
    points: 72,
    weight: 10,
    note: "隣を見るな。見るから悪い。",
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
  running: true,
  tickMs: 1250,
  dropStarted: 0,
  dropWindow: 3600,
  tutorialTimer: null,
  lastStep: 0,
  lastSecond: 0,
};

const boardEl = document.querySelector("#board");
const castsEl = document.querySelector("#casts");
const ambientValue = document.querySelector("#ambientValue");
const ambientFill = document.querySelector("#ambientFill");
const scoreValue = document.querySelector("#scoreValue");
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

function weightedGuest() {
  const total = guestTypes.reduce((sum, guest) => sum + guest.weight, 0);
  let pick = Math.random() * total;
  for (const guest of guestTypes) {
    pick -= guest.weight;
    if (pick <= 0) return makeGuest(guest);
  }
  return makeGuest(guestTypes[0]);
}

function makeGuest(type) {
  const favorite = Math.floor(Math.random() * COLS);
  const vipTarget = type.id === "vip" ? Math.floor(Math.random() * COLS) : null;
  return {
    ...type,
    favorite,
    vipTarget,
    serial: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
  };
}

function resetGame() {
  state.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  state.current = weightedGuest();
  state.next = weightedGuest();
  state.selectedCol = 2;
  state.score = 0;
  state.ambient = 70;
  state.time = SHIFT_SECONDS;
  state.complaints = 0;
  state.streaks = [0, 0, 0, 0, 0];
  state.regulars = [];
  state.running = true;
  state.tickMs = 1700;
  seedOpeningFloor();
  state.lastStep = performance.now();
  state.lastSecond = performance.now();
  setDropWindow(performance.now());
  overlay.classList.add("hidden");
  showTutorial();
  comboList.innerHTML = "";
  addCombo("シャンパンコール", "全列から1人ずつ消去 / 空気大UP");
  addCombo("ボトル入り（ガチ恋）", "空気UP / 処理少し進行");
  addCombo("推し一致（太客）", "空気 +5 / 売上 +48,000");
  messageEl.textContent = "今日もシフトが始まる。彼女たちは笑顔を作り、私はおじさんを配置する。";
  render();
}

function seedOpeningFloor() {
  const openingGuests = ["futoi", "usui", "gachikoi", "uwaki", "vip", "doutan"];
  for (let col = 0; col < COLS; col += 1) {
    const stackHeight = col === 2 ? 1 : 2 + (col % 2);
    for (let depth = 0; depth < stackHeight; depth += 1) {
      const typeId = openingGuests[(col * 2 + depth) % openingGuests.length];
      const type = guestTypes.find((guest) => guest.id === typeId);
      const guest = makeGuest(type);
      guest.favorite = (col + depth + 1) % COLS;
      if (guest.id === "vip") guest.vipTarget = col;
      const row = ROWS - 1 - depth;
      state.board[row][col] = tileForGuest(guest, col);
    }
  }
}

function serviceTurns(guest, col) {
  let turns = guest.base + 2;
  const preferred = isPreferred(guest, col);

  if (preferred) turns -= guest.id === "gachikoi" ? 2 : 1;
  if (!preferred) turns += guest.id === "vip" ? 2 : 1;
  if (guest.vipTarget !== null && col !== guest.vipTarget) turns += 2;
  if (casts[col].name === "営業" && guest.id === "futoi") turns -= 0.5;
  if (casts[col].name === "ベテラン" && guest.id === "vip") turns -= 0.5;
  if (casts[col].name === "新人") turns += 1;
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
    jealousy: false,
  };
}

function placeCurrent(col = state.selectedCol) {
  if (!state.running) return;

  const row = lowestOpenRow(col);
  if (row === -1) {
    changeAmbient(-10);
    endGame("盤面上限到達。感情は積み上がり、やがて店の天井に触れた。");
    return;
  }

  const tile = tileForGuest(state.current, col);
  state.board[row][col] = tile;
  applyPlacementPressure(tile);
  state.current = state.next;
  state.next = weightedGuest();
  state.selectedCol = col;
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
  if (guest.id === "vip" && guest.vipTarget !== null && col !== guest.vipTarget) {
    changeAmbient(-9);
    say("VIPを指名外に置いた。空気には、そういう音がある。");
  } else if (col === guest.favorite || guest.id === "uwaki") {
    changeAmbient(2);
  } else {
    changeAmbient(-2);
  }

  if (hasFavoriteNeighbor(tile)) {
    tile.jealousy = true;
    const penalty = guest.id === "gachikoi" || guest.id === "doutan" ? -11 : -5;
    changeAmbient(penalty);
    tile.turns += guest.id === "doutan" ? 2 : 1;
    say("推し被り。笑顔はある。空気はない。");
  } else {
    say(guest.note);
  }
}

function hasFavoriteNeighbor(tile) {
  const { col, guest } = tile;
  for (const dx of [-1, 1]) {
    const nx = col + dx;
    if (nx < 0 || nx >= COLS) continue;
    for (let row = 0; row < ROWS; row += 1) {
      const neighbor = state.board[row][nx];
      if (neighbor && neighbor.guest.favorite === guest.favorite) return true;
    }
  }
  return false;
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
        say("クレーマーが沈黙を破った。店の評価は、見えないところで落ちる。");
      }

      if (tile.turns <= 0) {
        cleared.push({ tile, row, col });
      }
    }
  }

  for (const clear of cleared) clearTile(clear);
  collapseBoard();

  if (state.complaints >= 3) {
    endGame("出禁が三度出た。今日は営業というより、後始末だった。");
  }

  render();
}

function clearTile({ tile, row, col }) {
  state.board[row][col] = null;
  const guest = tile.guest;
  const preferred = isPreferred(guest, col);
  let points = guest.points + Math.round(state.ambient * 0.8);

  if (preferred) points = Math.round(points * 1.25);
  if (guest.id === "futoi" && casts[col].name === "営業") points += 50;
  if (guest.id === "vip" && casts[col].name === "ベテラン") points += 75;

  state.score += points;
  state.streaks[col] += 1;

  if (casts[col].name === "元ドル") changeAmbient(2);
  if (guest.id === "futoi") changeAmbient(5);
  if (guest.id === "claimer") changeAmbient(4);
  if (guest.id === "gachikoi" && preferred) changeAmbient(4);

  maybeRegularize(guest, points);
  handleCombo(col);
}

function handleCombo(col) {
  if (state.streaks[col] === 3) {
    changeAmbient(12);
    speedColumn(col);
    addCombo(`${casts[col].name}列`, "ボトル入り");
    say("ボトルが入った。場の全員が、少しだけ同じ方向を向く。");
  }

  if (state.streaks[col] > 0 && state.streaks[col] % 5 === 0) {
    changeAmbient(22);
    clearOneEachColumn();
    addCombo(`${casts[col].name}列`, "シャンパンコール");
    say("シャンパンコール。意味より先に、音が店を支配する。");
  }
}

function speedColumn(col) {
  for (let row = 0; row < ROWS; row += 1) {
    const tile = state.board[row][col];
    if (tile) tile.turns = Math.max(1, tile.turns - 1);
  }
}

function clearOneEachColumn() {
  for (let col = 0; col < COLS; col += 1) {
    for (let row = ROWS - 1; row >= 0; row -= 1) {
      if (state.board[row][col]) {
        state.board[row][col] = null;
        state.score += 40;
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
    say(`${guest.label}が常連化した。関係は、たいてい処理後に始まる。`);
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

function isPreferred(guest, col) {
  return col === guest.favorite || guest.id === "uwaki";
}

function placementRead(guest, col) {
  if (guest.vipTarget !== null && col !== guest.vipTarget) return { icon: "×", label: "指名外", tone: "bad" };
  if (hasFavoriteInNeighborColumn(guest.favorite, col)) return { icon: "⚠", label: "推し被り", tone: "warn" };
  if (isPreferred(guest, col)) return { icon: "◎", label: "推し一致", tone: "good" };
  return { icon: "・", label: "通常接客", tone: "neutral" };
}

function hasFavoriteInNeighborColumn(favorite, col) {
  for (const dx of [-1, 1]) {
    const nx = col + dx;
    if (nx < 0 || nx >= COLS) continue;
    for (let row = 0; row < ROWS; row += 1) {
      const neighbor = state.board[row][nx];
      if (neighbor && neighbor.guest.favorite === favorite) return true;
    }
  }
  return false;
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
  timeValue.textContent = formatTime(state.time);
  complaintValue.textContent = `${state.complaints}/3`;
  complaintWarning.textContent = `あと${Math.max(0, 3 - state.complaints)}でGAME OVER`;
  regularsEl.innerHTML = state.regulars.length
    ? state.regulars.map((item) => `<span><b>${item.label}</b><small>推し: ${item.favorite}</small></span>`).join("")
    : "<span><b>タカシン</b><small>推し: 営業</small></span><span><b>りょうた</b><small>推し: ガチ恋</small></span><span><b>ケンジ</b><small>推し: 新人</small></span><span><b>バイセン</b><small>指名: ベテラン</small></span>";
}

function renderBoard() {
  boardEl.innerHTML = "";
  const landingRow = lowestOpenRow(state.selectedCol);

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.setAttribute("aria-label", `${col + 1}列 ${row + 1}段`);
      if (col === state.selectedCol) cell.classList.add("target");
      if (row === landingRow && col === state.selectedCol) cell.classList.add("ghost");
      cell.addEventListener("click", () => {
        state.selectedCol = col;
        placeCurrent(col);
      });

      const tile = state.board[row][col];
      if (tile) cell.appendChild(tileElement(tile));
      boardEl.appendChild(cell);
    }
  }
}

function tileElement(tile) {
  const wrapper = document.createElement("div");
  const classes = ["tile"];
  classes.push(`guest-${tile.guest.id}`);
  if (tile.matched) classes.push("matched");
  if (tile.vipMiss || tile.jealousy || tile.guest.id === "claimer") classes.push("danger");
  wrapper.className = classes.join(" ");
  wrapper.style.setProperty("--chip", tile.guest.color);
  wrapper.style.setProperty("--favorite", casts[tile.guest.favorite].color);
  wrapper.innerHTML = `
    <span class="badge">${tile.guest.label.slice(0, 2)}</span>
    <span class="oshi-dot" title="推し: ${casts[tile.guest.favorite].name}"></span>
    <span class="mark"></span>
    <span class="turns">${Math.max(0, tile.turns)}</span>
  `;
  return wrapper;
}

function renderCasts() {
  castsEl.innerHTML = "";
  casts.forEach((cast, col) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `cast${col === state.selectedCol ? " active" : ""}`;
    button.style.setProperty("--cast", cast.color);
    const call = nextCallInfo(col);
    button.innerHTML = `
      <span class="portrait"></span>
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
  const readout = read ? `<span class="placement ${read.tone}">${read.label}</span>` : "";
  const turns = serviceTurns(guest, state.selectedCol);
  el.innerHTML = `
    ${read ? `<span class="relation-badge ${read.tone}">${read.icon}</span>` : ""}
    <span class="guest-name">${guest.label}</span>
    <span class="guest-meta"><span class="cast-dot"></span>推し:${casts[guest.favorite].name}${target}</span>
    <span class="guest-meta">満足ターン ${turns}</span>
    ${readout}
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
  let label = `ボトルあと${Math.max(0, 3 - streak)}`;
  if (streak >= 3) label = `シャンパンあと${5 - (streak % 5 || 5)}`;
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
      say("迷っている間にも客は落ちる。営業中だからだ。");
      placeCurrent();
    }

    if (now - state.lastSecond >= 1000) {
      state.time -= 1;
      state.lastSecond = now;
      changeAmbient(-0.15);
      if (state.time <= 0) {
        endGame("閉店時間。満足も未練も、レジ締めの前では同じ数字になる。");
      }
    }

    if (now - state.lastStep >= state.tickMs) {
      state.lastStep = now;
      stepService();
    }
  }

  requestAnimationFrame(gameLoop);
}

function endGame(copy) {
  state.running = false;
  document.querySelector("#resultCopy").textContent = copy;
  document.querySelector("#finalScore").textContent = formatMoney(state.score);
  document.querySelector("#finalAmbient").textContent = Math.round(state.ambient);
  document.querySelector("#finalRegulars").textContent = state.regulars.length;
  overlay.classList.remove("hidden");
  render();
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

document.querySelector("#leftButton").addEventListener("click", () => moveSelection(-1));
document.querySelector("#rightButton").addEventListener("click", () => moveSelection(1));
document.querySelector("#dropButton").addEventListener("click", () => placeCurrent());
document.querySelector("#restartButton").addEventListener("click", resetGame);
document.querySelector("#againButton").addEventListener("click", resetGame);

window.addEventListener("keydown", (event) => {
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

resetGame();
requestAnimationFrame(gameLoop);
