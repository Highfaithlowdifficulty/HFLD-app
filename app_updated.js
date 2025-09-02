// Basic app behaviors for High Faith Low Difficulty LLC PWA
const BRAND_NAME = 'High Faith Low Difficulty LLC';
const BUSINESS_EMAIL = 'Highfaithlowdifficulty@yahoo.com';
const BUSINESS_PHONE = '+1-708-341-7659';

// Year
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// PWA install prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.hidden = false;
});
installBtn && installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  installBtn.hidden = true;
  deferredPrompt = null;
});

// Register SW
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}

/* ============================
   QUOTE FORM (NETLIFY INTEGRATION + AUTORESPONSE)
   ============================ */
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = quoteForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";
    }

    const formData = new FormData(quoteForm);

    fetch("/", {
      method: "POST",
      body: formData,
    })
    .then(() => {
      // Success confirmation for user
      quoteForm.innerHTML = `
        <div class="success-message" style="text-align:center; padding:20px; background:#f6fff6; border:2px solid #28a745; border-radius:8px;">
          <h3 style="color:#28a745;">✅ Request Received!</h3>
          <p>Thanks for choosing <strong>${BRAND_NAME}</strong>.<br/> 
          We’ll call or email you within 24 hours to confirm your moving quote.</p>
        </div>
      `;
    })
    .catch((err) => {
      alert("❌ Something went wrong. Please try again or call us directly at " + BUSINESS_PHONE);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Request Quote";
      }
      console.error(err);
    });
  });
}

/* ============================
   LEADS LIST (localStorage fallback)
   ============================ */
const leadsList = document.getElementById('leadsList');
if (leadsList) {
  const leads = JSON.parse(localStorage.getItem('leads') || '[]');
  if (!leads.length) {
    leadsList.innerHTML = '<p>No leads yet. Quote requests you submit on this device will show here.</p>';
  } else {
    leadsList.innerHTML = leads.map((l) => `
      <div class="lead">
        <strong>${l.name}</strong> — ${l.phone}<br/>
        ${l.email || ''}<br/>
        <em>${l.date || ''} • ${l.bedrooms || ''}BR</em><br/>
        From: ${l.from} → To: ${l.to}<br/>
        Notes: ${l.notes || ''}<br/>
        <small>${new Date(l.createdAt).toLocaleString()}</small>
      </div>
    `).join('');
  }
}

/* ============================
   QR PAGE
   ============================ */
function buildVCard({name, phone, email, org}) {
  return `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\nORG:${org || BRAND_NAME}\nTEL;TYPE=CELL:${phone}\nEMAIL:${email}\nEND:VCARD`;
}

const qrType = document.getElementById('qrType');
const inputs = document.getElementById('inputs');
const qrcanvas = document.getElementById('qrcanvas');
const makeQr = document.getElementById('makeQr');

function renderInputs() {
  if (!qrType || !inputs) return;
  const t = qrType.value;
  let html = '';
  if (t === 'url') {
    html = '<input id="qrVal" type="url" placeholder="https://yourmovingco.com/booking" required />';
  } else if (t === 'tel') {
    html = '<input id="qrVal" type="tel" placeholder="+15555550123" required />';
  } else if (t === 'sms') {
    html = '<input id="qrVal" type="tel" placeholder="+15555550123" required />';
  } else if (t === 'mailto') {
    html = '<input id="qrVal" type="email" placeholder="Highfaithlowdifficulty@yahoo.com" required />';
  } else if (t === 'vcard') {
    html = '<input id="vName" placeholder="Your Name" required />\
            <input id="vPhone" placeholder="+15555550123" required />\
            <input id="vEmail" placeholder="you@company.com" />\
            <input id="vOrg" placeholder="Company (optional)" />';
  }
  inputs.innerHTML = html;
}
qrType && (qrType.onchange = renderInputs);
renderInputs();

function downloadCanvasPng(canvas, linkEl, fileName) {
  linkEl.href = canvas.toDataURL('image/png');
  linkEl.download = fileName;
}

if (makeQr) {
  makeQr.addEventListener('click', () => {
    const type = qrType.value;
    let value = '';
    if (type === 'url') value = document.getElementById('qrVal').value;
    if (type === 'tel') value = 'tel:' + document.getElementById('qrVal').value.replace(/\s/g,'');
    if (type === 'sms') value = 'sms:' + document.getElementById('qrVal').value.replace(/\s/g,'');
    if (type === 'mailto') value = 'mailto:' + document.getElementById('qrVal').value;
    if (type === 'vcard') {
      value = buildVCard({
        name: document.getElementById('vName').value,
        phone: document.getElementById('vPhone').value,
        email: document.getElementById('vEmail').value,
        org: document.getElementById('vOrg').value
      });
    }
    if (!value) return alert('Please fill in the field(s)');

    const parent = qrcanvas.parentNode;
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'qrcanvas';
    newCanvas.width = 1024; newCanvas.height = 1024;
    parent.replaceChild(newCanvas, qrcanvas);
    new QRCode(newCanvas, { text: value, width: 1024, height: 1024, correctLevel: QRCode.CorrectLevel.M });

    document.getElementById('qrResult').style.display = 'block';
    const download = document.getElementById('downloadPng');
    downloadCanvasPng(newCanvas, download, 'qr.png');
  });
}

// Simple nav brand update
const brand = document.getElementById('brand');
brand && (brand.textContent = BRAND_NAME);
