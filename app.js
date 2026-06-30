// ===================== FIREBASE CONFIG =====================
const firebaseConfig = {
  apiKey: "AIzaSyCugMuz-eltjtds8rZJB6ewhCma45xtGNg",
  authDomain: "city-production-tracker.firebaseapp.com",
  databaseURL: "https://city-production-tracker-default-rtdb.firebaseio.com",
  projectId: "city-production-tracker",
  storageBucket: "city-production-tracker.firebasestorage.app",
  messagingSenderId: "1061528602890",
  appId: "1:1061528602890:web:4f3b194b4228f24114d2f3",
  measurementId: "G-BXFT5QF9Z2"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ===================== CREDENTIALS =====================
const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "sobuj7097";
const USER_PASSWORD = "city2026"; // 1-17 সকল ইউজারের জন্য একই পাসওয়ার্ড
const TOTAL_USERS = 17;

// ===================== LINE / FLAVOR STRUCTURE =====================
// প্রতি লাইনে ৫টা ফাঁকা ফ্লেভার স্লট থাকবে — পরে এডমিন নাম বসাবে
const LINES = [
  { id: "jelly1", name: "জেলি লাইন ১" },
  { id: "jelly2", name: "জেলি লাইন ২" },
  { id: "pop", name: "পপ লাইন" },
  { id: "mold", name: "মোল্ড লাইন" },
  { id: "gum", name: "গাম লাইন" }
];
const FLAVORS_PER_LINE = 5;

const FIELD_DEFS = [
  { key: "packetWeight", label: "প্যাকেটের ওয়েট", unit: "g" },
  { key: "packetLength", label: "প্যাকেটের লেন্থ", unit: "cm" },
  { key: "packetWidth", label: "প্যাকেটের উইথ", unit: "cm" },
  { key: "packageWeightWithTandi", label: "ট্যান্ডিসহ প্যাকেজের ওজন", unit: "g" },
  { key: "emptyPacketWeight", label: "খালি প্যাকেটের ওজন", unit: "g" },
  { key: "batchKg", label: "এক ব্যাচ কত কেজি", unit: "kg" },
  { key: "piecesPerBatch", label: "এক ব্যাচ সমান কত পিস ক্যান্ডি", unit: "pcs" },
  { key: "batchTimeMinutes", label: "এক ব্যাচ ক্যান্ডি কত সময়ে শেষ হয়", unit: "min" }
];

// ===================== STATE =====================
let currentUser = null; // { role: 'admin'|'user', id: '...' }
let currentLineId = null;
let currentFlavorIndex = null;
let flavorCache = {}; // lineId -> { idx: data }

// ===================== LOGIN UI =====================
function setRole(role){
  const userTab = document.getElementById('userTabBtn');
  const adminTab = document.getElementById('adminTabBtn');
  const userField = document.getElementById('userIdField');
  const adminField = document.getElementById('adminIdField');
  if(role === 'admin'){
    adminTab.classList.add('active');
    userTab.classList.remove('active');
    adminField.classList.remove('hidden');
    userField.classList.add('hidden');
  } else {
    userTab.classList.add('active');
    adminTab.classList.remove('active');
    userField.classList.remove('hidden');
    adminField.classList.add('hidden');
  }
  document.getElementById('loginError').textContent = '';
}

function populateUserIds(){
  const sel = document.getElementById('userIdSelect');
  for(let i=1;i<=TOTAL_USERS;i++){
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = i;
    sel.appendChild(opt);
  }
}
populateUserIds();

function handleLogin(){
  const isAdmin = !document.getElementById('adminIdField').classList.contains('hidden');
  const password = document.getElementById('passwordInput').value;
  const errEl = document.getElementById('loginError');
  errEl.textContent = '';

  if(isAdmin){
    const adminId = document.getElementById('adminIdInput').value.trim();
    if(adminId === ADMIN_ID && password === ADMIN_PASSWORD){
      currentUser = { role:'admin', id: 'Admin' };
      enterApp();
    } else {
      errEl.textContent = 'আইডি অথবা পাসওয়ার্ড ভুল হয়েছে';
    }
  } else {
    const userId = document.getElementById('userIdSelect').value;
    if(!userId){
      errEl.textContent = 'ইউজার আইডি বাছাই করো';
      return;
    }
    if(password === USER_PASSWORD){
      currentUser = { role:'user', id: userId };
      enterApp();
    } else {
      errEl.textContent = 'পাসওয়ার্ড ভুল হয়েছে';
    }
  }
}

function handleLogout(){
  currentUser = null;
  currentLineId = null;
  currentFlavorIndex = null;
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('passwordInput').value = '';
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('show');
}

function enterApp(){
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  const chipText = currentUser.role === 'admin' ? 'Admin' : (currentUser.id + ' | User');
  document.getElementById('userChipText').textContent = chipText;
  buildSidebar();
}

// ===================== SIDEBAR =====================
function toggleSidebar(){
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('show');
}

function buildSidebar(){
  const list = document.getElementById('lineList');
  list.innerHTML = '';
  LINES.forEach(line => {
    const lineItem = document.createElement('div');
    lineItem.className = 'line-item';
    lineItem.id = 'line-' + line.id;
    lineItem.innerHTML = `<span>📦</span><span>${line.name}</span><span class="chevron">▶</span>`;
    lineItem.onclick = () => toggleLine(line.id);
    list.appendChild(lineItem);

    const sub = document.createElement('div');
    sub.className = 'flavor-sub hidden';
    sub.id = 'flavors-' + line.id;
    for(let i=0;i<FLAVORS_PER_LINE;i++){
      const fItem = document.createElement('div');
      fItem.className = 'flavor-item';
      fItem.id = `flavor-${line.id}-${i}`;
      fItem.textContent = `Flavor ${i+1}`;
      fItem.onclick = (e) => { e.stopPropagation(); selectFlavor(line.id, i); };
      sub.appendChild(fItem);
    }
    list.appendChild(sub);

    // load flavor names from firebase to update sidebar labels
    loadFlavorNamesForLine(line.id);
  });
}

function toggleLine(lineId){
  const lineItem = document.getElementById('line-' + lineId);
  const sub = document.getElementById('flavors-' + lineId);
  const isOpen = lineItem.classList.contains('open');

  // close all
  LINES.forEach(l => {
    document.getElementById('line-' + l.id).classList.remove('open');
    document.getElementById('flavors-' + l.id).classList.add('hidden');
  });

  if(!isOpen){
    lineItem.classList.add('open');
    sub.classList.remove('hidden');
  }
}

function loadFlavorNamesForLine(lineId){
  db.ref('lines/' + lineId + '/flavors').once('value').then(snap => {
    const data = snap.val() || {};
    flavorCache[lineId] = data;
    for(let i=0;i<FLAVORS_PER_LINE;i++){
      const f = data[i];
      const el = document.getElementById(`flavor-${lineId}-${i}`);
      if(el && f && f.name){
        el.textContent = f.name;
      }
    }
  });
}

function selectFlavor(lineId, index){
  currentLineId = lineId;
  currentFlavorIndex = index;

  // highlight active
  document.querySelectorAll('.flavor-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`flavor-${lineId}-${index}`).classList.add('active');

  document.getElementById('welcomePage').classList.add('hidden');
  document.getElementById('flavorPage').classList.remove('hidden');

  // close sidebar on mobile after selection
  if(window.innerWidth < 900){
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }

  renderFlavorPage();
}

// ===================== FLAVOR DETAIL PAGE =====================
function renderFlavorPage(){
  const isAdmin = currentUser.role === 'admin';
  const badge = document.getElementById('roleBadge');
  badge.innerHTML = isAdmin
    ? '<span class="admin-badge">✏️ Admin Edit Mode</span>'
    : '<span class="view-badge">👁 View Only</span>';

  const nameInput = document.getElementById('flavorNameInput');
  nameInput.disabled = !isAdmin;
  nameInput.placeholder = `Flavor ${currentFlavorIndex + 1}`;

  const grid = document.getElementById('detailGrid');
  grid.innerHTML = '';
  FIELD_DEFS.forEach(field => {
    const card = document.createElement('div');
    card.className = 'detail-card';
    card.innerHTML = `
      <label>${field.label} <span class="unit">(${field.unit})</span></label>
      <input type="number" step="any" id="field-${field.key}" ${isAdmin ? '' : 'disabled'} placeholder="0">
    `;
    grid.appendChild(card);
  });

  document.getElementById('saveStatus').textContent = '';
  document.getElementById('saveBtn').classList.toggle('hidden', !isAdmin);

  // load existing data
  const path = `lines/${currentLineId}/flavors/${currentFlavorIndex}`;
  db.ref(path).once('value').then(snap => {
    const data = snap.val() || {};
    nameInput.value = data.name || '';
    FIELD_DEFS.forEach(field => {
      const el = document.getElementById('field-' + field.key);
      if(el) el.value = data[field.key] !== undefined ? data[field.key] : '';
    });
  });
}

function saveFlavor(){
  if(currentUser.role !== 'admin') return;
  const path = `lines/${currentLineId}/flavors/${currentFlavorIndex}`;
  const nameVal = document.getElementById('flavorNameInput').value.trim() || `Flavor ${currentFlavorIndex + 1}`;
  const payload = { name: nameVal };
  FIELD_DEFS.forEach(field => {
    const el = document.getElementById('field-' + field.key);
    payload[field.key] = el.value === '' ? null : Number(el.value);
  });

  const statusEl = document.getElementById('saveStatus');
  statusEl.textContent = 'সেভ হচ্ছে...';
  statusEl.classList.remove('ok');

  db.ref(path).set(payload).then(() => {
    statusEl.textContent = '✓ সেভ হয়েছে';
    statusEl.classList.add('ok');
    // update sidebar label live
    const el = document.getElementById(`flavor-${currentLineId}-${currentFlavorIndex}`);
    if(el) el.textContent = nameVal;
    if(!flavorCache[currentLineId]) flavorCache[currentLineId] = {};
    flavorCache[currentLineId][currentFlavorIndex] = payload;
  }).catch(err => {
    statusEl.textContent = 'এরর: ' + err.message;
  });
}
