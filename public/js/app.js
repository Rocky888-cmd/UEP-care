// js/app.js
import { auth, db, storage } from './firebaseConfig.js';
import { ref as dbRef, push, set, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { initModal, initFormSubmission } from './modal.js';

const openSubmitBtns = [document.getElementById('open-submit'), document.getElementById('start-submit')];
const modal = document.getElementById('submitModal');
const closeBtn = document.getElementById('close-modal');
const cancelBtn = document.getElementById('cancel');
const form = document.getElementById('concernForm');
const attachmentsInput = document.getElementById('attachments');

// 🔹 Modal control functions
function openModal(e) {
  if (e) e.preventDefault();
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = ''; // restore scroll

  // remove #submit hash from URL
  if (window.location.hash === '#submit') {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

// 🔹 Modal triggers
openSubmitBtns.forEach(b => { if (b) b.addEventListener('click', openModal); });
closeBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// 🔹 Handle URL hash (#submit)
window.addEventListener('load', () => {
  if (window.location.hash === '#submit') openModal();
});
window.addEventListener('hashchange', () => {
  if (window.location.hash === '#submit') openModal();
  else closeModal();
});

// 🔹 Helper for ticket code generation
async function generateTicketCode() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const dateKey = mm + dd + yy;

  // read today's counter
  const counterRef = dbRef(db, `counters/${dateKey}`);
  const snapshot = await get(counterRef);
  let count = 1;
  if (snapshot.exists()) {
    count = snapshot.val() + 1;
  }
  await set(counterRef, count);
  const serial = String(count).padStart(2, '0');
  return serial + dateKey; // e.g., 01102425
}

// 🔹 Upload images to Firebase Storage
async function uploadImages(files, ticket) {
  const urls = [];
  const max = 4;
  const list = Array.from(files).slice(0, max);
  for (let i = 0; i < list.length; i++) {
    const file = list[i];
    const path = `reports/${ticket}/${Date.now()}_${file.name}`;
    const sRef = storageRef(storage, path);
    const blob = await file.arrayBuffer();
    const buffer = new Uint8Array(blob);
    await uploadBytes(sRef, buffer);
    const dl = await getDownloadURL(sRef);
    urls.push(dl);
  }
  return urls;
}

// 🔹 Form submission handler
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const category = document.getElementById('category').value;
  const message = document.getElementById('message').value.trim();
  const files = attachmentsInput.files;

  if (!category || !message) {
    alert('Please select a category and write a message.');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting...';

  try {
    const ticket = await generateTicketCode();

    let images = [];
    if (files && files.length > 0) {
      images = await uploadImages(files, ticket);
    }

    const reportsRef = dbRef(db, 'reports');
    const newReportRef = push(reportsRef);
    const now = new Date().toISOString();
    const reportData = {
      ticket,
      category,
      message,
      images: images,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
      assignedTo: null
    };
    await set(newReportRef, reportData);

    // 🔹 Show QR Code
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=${encodeURIComponent(ticket)}`;
    document.getElementById('ticketCode').textContent = ticket;
    const qrImg = document.getElementById('qrImage');
    qrImg.src = qrUrl;
    document.getElementById('downloadQR').href = qrUrl;
    document.getElementById('downloadQR').download = `${ticket}_qr.png`;

    form.classList.add('hidden');
    document.getElementById('afterSubmit').classList.remove('hidden');

  } catch (err) {
    console.error(err);
    alert('Error submitting report: ' + err.message);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit';
  }
});

// 🔹 Copy ticket code
document.getElementById('copyCode').addEventListener('click', async () => {
  const code = document.getElementById('ticketCode').textContent;
  if (!code) return;
  await navigator.clipboard.writeText(code);
  alert('Ticket code copied to clipboard');
});
