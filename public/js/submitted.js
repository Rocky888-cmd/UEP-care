// js/submitted.js
import { db } from './firebaseConfig.js';
import { ref as dbRef, get, child } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const form = document.getElementById('lookupForm');
const input = document.getElementById('lookupCode');
const result = document.getElementById('result');
const scanBtn = document.getElementById('scanQRBtn');
const uploadInput = document.getElementById('uploadQR');
const qrVideo = document.getElementById('qrVideo');
const scanStatus = document.getElementById('scanStatus');

// ✅ Navbar toggle logic
const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
const navLinkItems = navLinks.querySelectorAll('a');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  navToggle.classList.toggle('active');
});

// Close menu when a link is clicked
navLinkItems.forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    navToggle.classList.remove('active');
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = input.value.trim();
  if (!code) { alert('Enter a ticket code'); return; }
  result.innerHTML = 'Searching...';
  try {
    const snap = await get(dbRef(db, 'reports'));
    if (!snap.exists()) {
      result.innerHTML = '<p>No reports found.</p>';
      return;
    }
    const data = snap.val();
    // find report with matching ticket
    let found = null;
    Object.values(data).forEach(r => {
      if (r.ticket === code || r.ticketHash === code) found = r;
    });
    if (!found) {
      result.innerHTML = `<p>No report found with ticket <strong>${code}</strong>.</p>`;
      return;
    }
    // render report status and timeline
    const attachmentsHtml = found.images && found.images.length
      ? `<div class="report-attachments">${found.images.map(src => `<img src="${src}" alt="attachment" loading="lazy">`).join('')}</div>`
      : '';

    result.innerHTML = `
        <div class="report-card">
          <div class="report-head">
            <h3>Ticket: ${escapeHtml(found.ticket)}</h3>
            <div class="report-meta"><span class="meta-item">${escapeHtml(found.category)}</span> · <span class="meta-item">${escapeHtml(found.status)}</span></div>
          </div>
          <div class="report-body">
            <div class="report-time"><strong>Submitted At:</strong> ${new Date(found.createdAt).toLocaleString()}</div>
            <div class="report-message"><strong>Message:</strong><p>${escapeHtml(found.message)}</p></div>
            ${attachmentsHtml}
          </div>
        </div>
      `;
  } catch (err) {
    console.error(err);
    result.innerHTML = `<p>Error: ${err.message}</p>`;
  }
});

function escapeHtml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }


// 1️⃣ Scan from camera
scanBtn.addEventListener('click', async () => {
  scanStatus.textContent = 'Initializing camera...';
  qrVideo.style.display = 'block';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    qrVideo.srcObject = stream;
    qrVideo.setAttribute('playsinline', true); // iOS
    qrVideo.play();

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const tick = () => {
      if (qrVideo.readyState === qrVideo.HAVE_ENOUGH_DATA) {
        canvas.width = qrVideo.videoWidth;
        canvas.height = qrVideo.videoHeight;
        ctx.drawImage(qrVideo, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          qrVideo.srcObject.getTracks().forEach(track => track.stop());
          qrVideo.style.display = 'none';
          scanStatus.textContent = 'QR code found!';
          input.value = code.data;
          form.dispatchEvent(new Event('submit'));
          return;
        }
      }
      requestAnimationFrame(tick);
    };
    tick();
  } catch (err) {
    console.error(err);
    scanStatus.textContent = 'Camera access denied or not available.';
  }
});

// 2️⃣ Upload QR image
uploadInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      scanStatus.textContent = 'QR code detected!';
      input.value = code.data;
      form.dispatchEvent(new Event('submit'));
    } else {
      scanStatus.textContent = 'No QR code found in image.';
    }
  };
  img.src = URL.createObjectURL(file);
});