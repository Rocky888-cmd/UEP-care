// js/dashboard.js
import { auth, provider, db } from './firebaseConfig.js';
import { signInWithPopup, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { ref as dbRef, set, get, update, remove } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const adminInfo = document.getElementById('adminInfo');
const signOutBtn = document.getElementById('signOutBtn');
const navDashboard = document.getElementById('navDashboard');
const navReports = document.getElementById('navReports');
const navStats = document.getElementById('navStats');
const navStaff = document.getElementById('navStaff');
const navSettings = document.getElementById('navSettings');


const dashboardView = document.getElementById('dashboardView');
const reportsView = document.getElementById('reportsView');
const statsView = document.getElementById('statsView');
const staffView = document.getElementById('staffView');
const settingsView = document.getElementById('settingsView');


const staffRoleSelect = document.getElementById('staffRole');
const addStaffBtn = document.getElementById('addStaffBtn');
const staffNameInput = document.getElementById('staffName');
const staffEmailInput = document.getElementById('staffEmail');

navDashboard.addEventListener('click', () => showView('dashboard'));
navReports.addEventListener('click', () => showView('reports'));
navStats.addEventListener('click', () => {
  showView('stats');
  loadStatistics();
});

navStaff.addEventListener('click', () => {
  showView('staff');
  loadStaffSection();
});
navSettings.addEventListener('click', () => showView('settings'));
document.getElementById("addRoleBtn").addEventListener("click", () => {
  const roleName = document.getElementById("newRoleInput").value.trim();
  addRole(roleName);
});


signOutBtn.addEventListener('click', async () => {
  await signOut(auth);
  window.location.href = 'adminLogin.html';
});

// function showView(name) {
//   dashboardView.style.display = name === 'dashboard' ? 'block' : 'none';
//   reportsView.style.display = name === 'reports' ? 'block' : 'none';
//   statsView.style.display = name === 'stats' ? 'block' : 'none';
//   staffView.style.display = name === 'staff' ? 'block' : 'none';
//   settingsView.style.display = name === 'staff' ? 'block' : 'none';
// }
function showView(name) {
  dashboardView.style.display = name === 'dashboard' ? 'block' : 'none';
  reportsView.style.display = name === 'reports' ? 'block' : 'none';
  statsView.style.display = name === 'stats' ? 'block' : 'none';
  staffView.style.display = name === 'staff' ? 'block' : 'none';
  settingsView.style.display = name === 'settings' ? 'block' : 'none';
}


// ✅ Any Google user can sign in
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // Redirect to login if not signed in
    window.location.href = 'adminLogin.html';
    return;
  }

  // Show user info
  adminInfo.innerHTML = `<p>Signed in as <strong>${user.displayName}</strong></p><p>${user.email}</p>`;

  // Load dashboard content
  loadKpis();
  loadRecentReports();
  loadReportList();
  loadStaffList();
});

async function loadKpis() {
  const reportsSnap = await get(dbRef(db, 'reports'));
  const all = reportsSnap.exists() ? Object.values(reportsSnap.val()) : [];
  const month = new Date().getMonth();
  const thisMonthReports = all.filter(r => new Date(r.createdAt).getMonth() === month);
  const resolved = all.filter(r => r.status === 'Resolved').length;
  const processing = all.filter(r => r.status === 'Processing').length;
  const unseen = all.filter(r => r.status === 'Submitted').length;

  const kpis = [
    { title: 'This month', value: thisMonthReports.length },
    { title: 'Resolved', value: resolved },
    { title: 'Processing', value: processing },
    { title: 'Unseen', value: unseen }
  ];
  const kpiEl = document.getElementById('kpis');
  kpiEl.innerHTML = '';
  kpis.forEach(k => {
    const div = document.createElement('div');
    div.className = 'kpi';
    div.innerHTML = `<div style="font-size:13px;color:#666">${k.title}</div><div style="font-size:22px;font-weight:800;margin-top:8px">${k.value}</div>`;
    kpiEl.appendChild(div);
  });
}

async function loadRecentReports() {
  const snap = await get(dbRef(db, 'reports'));
  const tbody = document.querySelector('#reportsTable tbody');
  tbody.innerHTML = '';
  if (!snap.exists()) return;
  const data = Object.values(snap.val()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  data.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${r.ticket}</td>
      <td>${new Date(r.createdAt).toLocaleString()}</td>
      <td>${r.category}</td>
      <td>${r.status}</td>
      <td>${r.assignedTo || '-'}</td>
      <td>
        <button class="btn" data-ticket="${r.ticket}" data-action="view">View</button>
        <button class="btn" data-ticket="${r.ticket}" data-action="assign">Assign</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.addEventListener('click', async (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const ticket = e.target.dataset.ticket;
    const action = e.target.dataset.action;
    const snapshot = await get(dbRef(db, 'reports'));
    const all = snapshot.val();
    const key = Object.keys(all).find(k => all[k].ticket === ticket);
    const report = all[key];
    if (action === 'view') {
      alert(`Ticket: ${report.ticket}\nStatus: ${report.status}\nCategory: ${report.category}\nMessage: ${report.message}`);
    } else if (action === 'assign') {
      const staff = prompt('Assign to (enter staff name):');
      if (staff) {
        await update(dbRef(db, `reports/${key}`), { assignedTo: staff, status: 'Processing', updatedAt: new Date().toISOString() });
        alert('Assigned');
        loadRecentReports();
        loadReportList();
        loadKpis();
      }
    }
  });
}
// ✅ Add a new role
async function addRole(roleName) {
  if (!roleName) {
    alert("Please enter a role name!");
    return;
  }

  // lowercase the role for consistency
  const normalized = roleName.toLowerCase();

  try {
    const roleRef = dbRef(db, `settings/roles/${normalized}`);
    await set(roleRef, true); // you can store { createdAt: Date.now() } if needed
    alert(`✅ Role "${normalized}" added successfully!`);
    loadRoles(); // reload dropdown
  } catch (err) {
    console.error("Error adding role:", err);
    alert("Error adding role: " + err.message);
  }
}

async function loadReportList() {
  const snap = await get(dbRef(db, 'reports'));
  const tbody = document.querySelector('#reportListTable tbody');
  tbody.innerHTML = '';
  if (!snap.exists()) return;
  const all = Object.entries(snap.val()).sort((a, b) => new Date(b[1].createdAt) - new Date(a[1].createdAt));
  all.forEach(([key, r], idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${idx + 1}</td>
      <td>${r.ticket}</td>
      <td>${r.category}</td>
      <td>${r.status}</td>
      <td>${r.assignedTo || '-'}</td>
      <td>
        <button class="btn" data-key="${key}" data-op="seen">Mark Seen</button>
        <button class="btn" data-key="${key}" data-op="ack">Acknowledge</button>
        <button class="btn" data-key="${key}" data-op="resolve">Resolve</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  tbody.addEventListener('click', async (e) => {
    if (e.target.tagName !== 'BUTTON') return;
    const key = e.target.dataset.key;
    const op = e.target.dataset.op;
    let status;
    if (op === 'seen') status = 'Seen';
    if (op === 'ack') status = 'Acknowledged';
    if (op === 'resolve') status = 'Resolved';
    if (status) {
      await update(dbRef(db, `reports/${key}`), { status, updatedAt: new Date().toISOString() });
      alert(`Updated to ${status}`);
      loadReportList();
      loadKpis();
    }
  });
}

// async function loadStaffList() {
//   const snap = await get(dbRef(db, 'staff'));
//   const container = document.getElementById('staffList');
//   container.innerHTML = '';
//   if (!snap.exists()) { container.innerHTML = '<p>No staff list found.</p>'; return; }
//   const items = Object.values(snap.val());
//   items.forEach(s => {
//     const el = document.createElement('div');
//     el.style.padding = '10px';
//     el.style.borderBottom = '1px solid #eee';
//     el.innerHTML = `<strong>${s.name}</strong><div style="font-size:13px;color:#555">${s.email} • ${s.role || 'staff'}</div>`;
//     container.appendChild(el);
//   });
// }

// ✅ Load roles dynamically from Firebase Settings
async function loadRoles() {
  const snap = await get(dbRef(db, 'settings/roles'));
  staffRoleSelect.innerHTML = '';
  if (!snap.exists()) {
    staffRoleSelect.innerHTML = '<option value="">No roles defined</option>';
    return;
  }
  const roles = Object.keys(snap.val());
  roles.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r;
    opt.textContent = r.charAt(0).toUpperCase() + r.slice(1);
    staffRoleSelect.appendChild(opt);
  });
}

// ✅ Add staff to Firebase
addStaffBtn.addEventListener('click', async () => {
  const name = staffNameInput.value.trim();
  const email = staffEmailInput.value.trim();
  const role = staffRoleSelect.value;

  if (!name || !email || !role) {
    alert('Please fill all fields and select a role.');
    return;
  }

  const newStaffRef = push(dbRef(db, 'staff'));
  await set(newStaffRef, {
    name,
    email,
    role,
    createdAt: new Date().toISOString()
  });

  alert('✅ Staff added successfully!');
  staffNameInput.value = '';
  staffEmailInput.value = '';
  await loadStaffList();
});

// ✅ Load staff list with Edit & Delete buttons
async function loadStaffList() {
  const snap = await get(dbRef(db, 'staff'));
  const container = document.getElementById('staffList');
  container.innerHTML = '';

  if (!snap.exists()) {
    container.innerHTML = '<p>No staff list found.</p>';
    return;
  }

  const items = Object.entries(snap.val());

  items.forEach(([key, s]) => {
    const el = document.createElement('div');
    el.style.padding = '12px';
    el.style.border = '1px solid #eee';
    el.style.borderRadius = '8px';
    el.style.marginBottom = '10px';
    el.style.background = '#fff';
    el.style.display = 'flex';
    el.style.justifyContent = 'space-between';
    el.style.alignItems = 'center';

    el.innerHTML = `
      <div>
        <strong>${s.name}</strong><br>
        <span style="font-size:13px;color:#555;">${s.email} • ${s.role || 'staff'}</span>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn small edit-btn" data-key="${key}">Edit</button>
        <button class="btn small danger delete-btn" data-key="${key}">Delete</button>
      </div>
    `;

    container.appendChild(el);
  });

  // 🧠 Attach edit/delete logic
  container.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => editStaff(btn.dataset.key));
  });

  container.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteStaff(btn.dataset.key));
  });
}

// ✅ Edit staff details
async function editStaff(key) {
  const staffRef = dbRef(db, `staff/${key}`);
  const snap = await get(staffRef);
  if (!snap.exists()) return alert('Staff not found');

  const data = snap.val();
  const newName = prompt('Edit name:', data.name);
  const newEmail = prompt('Edit email:', data.email);
  const newRole = prompt('Edit role:', data.role);

  if (newName && newEmail && newRole) {
    await update(staffRef, {
      name: newName,
      email: newEmail,
      role: newRole,
      updatedAt: new Date().toISOString()
    });
    alert('✅ Staff updated successfully!');
    loadStaffList();
  }
}

// ✅ Delete staff
async function deleteStaff(key) {
  const confirmed = confirm('Are you sure you want to delete this staff member?');
  if (!confirmed) return;
  await remove(dbRef(db, `staff/${key}`));
  alert('🗑️ Staff removed successfully.');
  loadStaffList();
}

// ✅ Load roles & staff list when viewing staff section
async function loadStaffSection() {
  await loadRoles();
  await loadStaffList();
}

// Update navigation listener
// navStaff.addEventListener('click', () => {
//   showView('staff');
//   loadStaffSection();
// });

let monthlyChart, categoryChart;

// ✅ Load chart data and render graphs
async function loadStatistics() {
  const snap = await get(dbRef(db, 'reports'));
  if (!snap.exists()) {
    console.warn("No reports found.");
    return;
  }

  const reports = Object.values(snap.val());

  // --- Monthly reports count ---
  const monthlyCounts = Array(12).fill(0);
  reports.forEach(r => {
    const d = new Date(r.createdAt);
    if (!isNaN(d)) monthlyCounts[d.getMonth()]++;
  });

  const monthLabels = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // --- Category distribution ---
  const categoryCounts = {};
  reports.forEach(r => {
    const cat = r.category || 'Uncategorized';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  const categoryLabels = Object.keys(categoryCounts);
  const categoryValues = Object.values(categoryCounts);

  // --- Destroy previous charts (if any) ---
  if (monthlyChart) monthlyChart.destroy();
  if (categoryChart) categoryChart.destroy();

  // --- Monthly Reports Line Chart ---
  const ctx1 = document.getElementById('monthlyChart').getContext('2d');
  monthlyChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: monthLabels,
      datasets: [{
        label: 'Reports per Month',
        data: monthlyCounts,
        borderColor: '#0056b3',
        backgroundColor: 'rgba(0,86,179,0.2)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // --- Category Distribution Pie Chart ---
  const ctx2 = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctx2, {
    type: 'pie',
    data: {
      labels: categoryLabels,
      datasets: [{
        label: 'Reports by Category',
        data: categoryValues,
        backgroundColor: [
          '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'
        ],
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}
