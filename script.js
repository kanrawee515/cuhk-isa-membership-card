const state = {
  members: MEMBERS,
  current: null,
};

const lookupForm = document.getElementById("lookupForm");
const sidInput = document.getElementById("sidInput");
const nameInput = document.getElementById("nameInput");
const submitBtn = lookupForm.querySelector("button[type=submit]");
const statusMessage = document.getElementById("statusMessage");
const errorMessage = document.getElementById("errorMessage");
const lookupPanel = document.getElementById("lookupPanel");
const cardPanel = document.getElementById("cardPanel");
const card = document.getElementById("card");
const flipBtn = document.getElementById("flipBtn");
const backBtn = document.getElementById("backBtn");

const cardSidEl = document.getElementById("cardSid");
const cardNameEl = document.getElementById("cardName");
const cardJoinDateEl = document.getElementById("cardJoinDate");
const qrWrap = document.getElementById("qrWrap");

// --- Google Sheet loading ---

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

function rowsToMembers(rows) {
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const sidIdx = header.indexOf("sid");
  const nameIdx = header.indexOf("name");
  const joinDateIdx = header.indexOf("joindate");

  if (sidIdx === -1 || nameIdx === -1 || joinDateIdx === -1) {
    throw new Error("Sheet is missing required columns: sid, name, joinDate");
  }

  return rows.slice(1).map((r) => ({
    sid: (r[sidIdx] || "").trim(),
    name: (r[nameIdx] || "").trim(),
    joinDate: (r[joinDateIdx] || "").trim(),
  }));
}

async function loadMembers() {
  if (!SHEET_CSV_URL) {
    return MEMBERS;
  }
  const res = await fetch(SHEET_CSV_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet request failed: ${res.status}`);
  const text = await res.text();
  const members = rowsToMembers(parseCsv(text));
  if (members.length === 0) throw new Error("Sheet returned no members");
  return members;
}

function setStatus(msg) {
  if (msg) {
    statusMessage.textContent = msg;
    statusMessage.hidden = false;
  } else {
    statusMessage.hidden = true;
  }
}

const membersReady = (async () => {
  setStatus("Loading membership list...");
  submitBtn.disabled = true;
  try {
    state.members = await loadMembers();
    setStatus(null);
  } catch (err) {
    console.error(err);
    state.members = MEMBERS;
    setStatus("Could not reach the membership spreadsheet — using local data instead.");
  } finally {
    submitBtn.disabled = false;
  }
})();

function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function findMember(sid, name) {
  const targetSid = sid.trim();
  const targetName = normalize(name);
  return state.members.find(
    (m) => m.sid === targetSid && normalize(m.name) === targetName
  );
}

function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatSidGroups(sid) {
  return sid.replace(/(.{4})/g, "$1 ").trim();
}

function renderQr(text) {
  const qr = qrcode(0, "M");
  qr.addData(text);
  qr.make();
  qrWrap.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 1 });
}

function showCard(member) {
  state.current = member;
  cardSidEl.textContent = formatSidGroups(member.sid);
  cardNameEl.textContent = member.name;
  cardJoinDateEl.textContent = formatDate(member.joinDate);
  renderQr(`ISA-MEMBER|${member.sid}|${member.name}|${member.joinDate}`);

  card.classList.remove("flipped");
  lookupPanel.hidden = true;
  cardPanel.hidden = false;
  errorMessage.hidden = true;
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorMessage.hidden = false;
}

function resetToSearch() {
  cardPanel.hidden = true;
  lookupPanel.hidden = false;
  errorMessage.hidden = true;
  sidInput.value = "";
  nameInput.value = "";
  sidInput.focus();
}

function toggleFlip() {
  card.classList.toggle("flipped");
}

lookupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorMessage.hidden = true;
  await membersReady;

  const member = findMember(sidInput.value, nameInput.value);
  if (member) {
    showCard(member);
  } else {
    showError("No matching member found. Double-check your Student ID and name.");
  }
});

card.addEventListener("click", toggleFlip);
card.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    toggleFlip();
  }
});

flipBtn.addEventListener("click", toggleFlip);
backBtn.addEventListener("click", resetToSearch);
