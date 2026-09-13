const state = {
  members: MEMBERS,
  current: null,
};

const lookupForm = document.getElementById("lookupForm");
const sidInput = document.getElementById("sidInput");
const nameInput = document.getElementById("nameInput");
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

lookupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  errorMessage.hidden = true;

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
