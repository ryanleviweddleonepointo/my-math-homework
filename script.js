// --------- Utilities ----------
const $ = (sel) => document.querySelector(sel);
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Dark / Light toggle
const modeBtn = $('#modeBtn');
const applySavedMode = () => {
  const m = localStorage.getItem('mmh-mode');
  if (m === 'light') document.body.classList.add('light'); else document.body.classList.remove('light');
};
applySavedMode();
modeBtn?.addEventListener('click', () => {
  const light = !document.body.classList.contains('light');
  document.body.classList.toggle('light', light);
  localStorage.setItem('mmh-mode', light ? 'light' : 'dark');
});

// --------- Settings & Homework Launcher ----------
const hwInput = $('#hwUrl');
const saveUrlBtn = $('#saveUrl');
const testInlineBtn = $('#testInline');
const testTabBtn = $('#testTab');
const openInlineBtn = $('#openInline');
const openTabBtn = $('#openTab');
const hwContainer = $('#homeworkContainer');
const inlineBox = $('.inline-output');

function getHwUrl() {
  const u = (hwInput?.value || localStorage.getItem('mmh-hw-url') || '').trim();
  return u ? u + (u.includes('?') ? '&' : '?') + 't=' + Date.now() : '';
}
function setHwUrl(u) {
  if (!u) return;
  localStorage.setItem('mmh-hw-url', u.trim());
  if (hwInput) hwInput.value = u.trim();
}

(function preloadUrl() {
  const saved = localStorage.getItem('mmh-hw-url');
  if (saved && hwInput) hwInput.value = saved;
})();

saveUrlBtn?.addEventListener('click', () => {
  setHwUrl(hwInput.value);
  alert('Saved!');
});

async function loadInline(url) {
  if (!url) { alert('Set a Homework URL in Settings first.'); return; }
  inlineBox.style.display = 'block';
  hwContainer.textContent = 'Loading…';
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    // WARNING: Only load content you trust (your own GitHub/jsDelivr).
    hwContainer.innerHTML = html;
  } catch (e) {
    hwContainer.innerHTML = `<p style="color:#ff8080">Failed to load: ${e.message}</p>`;
    console.error(e);
  }
}
async function loadNewTab(url) {
  if (!url) { alert('Set a Homework URL in Settings first.'); return; }
  const newWin = window.open('about:blank', '_blank');
  if (!newWin) { alert('Enable pop-ups to open the page.'); return; }
  newWin.document.write('<p style="font-family:sans-serif">Loading…</p>');
  try {
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const html = await resp.text();
    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();
  } catch (e) {
    newWin.document.body.innerHTML = `<h1>Failed to load.</h1><pre>${e.message}</pre>`;
    console.error(e);
  }
}

testInlineBtn?.addEventListener('click', () => loadInline(getHwUrl()));
testTabBtn?.addEventListener('click', () => loadNewTab(getHwUrl()));
openInlineBtn?.addEventListener('click', () => loadInline(getHwUrl()));
openTabBtn?.addEventListener('click', () => loadNewTab(getHwUrl()));

// --------- Calculator ----------
const calcBtn = $('#calcBtn');
calcBtn?.addEventListener('click', () => {
  const expr = ($('#calcInput').value || '').replace(/×/g,'*').replace(/÷/g,'/');
  const out = $('#calcOut');
  try {
    // Basic safe eval: allow digits, operators, parentheses, decimal point, spaces
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) throw new Error('Only numbers and + - * / ( ) allowed.');
    const result = Function(`"use strict"; return (${expr})`)();
    out.textContent = String(result);
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
});

// --------- Quadratic Solver ----------
$('#quadBtn')?.addEventListener('click', () => {
  const a = parseFloat($('#qa').value);
  const b = parseFloat($('#qb').value);
  const c = parseFloat($('#qc').value);
  const out = $('#quadOut');
  if (![a,b,c].every((n) => Number.isFinite(n))) {
    out.textContent = 'Enter valid numbers for a, b, c.';
    return;
  }
  if (a === 0) { out.textContent = 'a must be non-zero.'; return; }
  const d = b*b - 4*a*c;
  if (d < 0) {
    const real = (-b / (2*a)).toFixed(5);
    const imag = (Math.sqrt(-d) / (2*a)).toFixed(5);
    out.textContent = `x = ${real} ± ${imag}i`;
  } else {
    const r1 = (-b + Math.sqrt(d)) / (2*a);
    const r2 = (-b - Math.sqrt(d)) / (2*a);
    out.textContent = `x₁ = ${r1},   x₂ = ${r2}`;
  }
});

// --------- Practice: Linear Equation ax + b = c ----------
let current = null;
function newProblem() {
  const a = Math.floor(Math.random()*9)+1;   // 1..10
  const x = Math.floor(Math.random()*21) - 10; // -10..10
  const b = Math.floor(Math.random()*21) - 10;
  const c = a*x + b;
  current = { a, b, c, x };
  $('#question').textContent = `${a}x ${b>=0?'+':'−'} ${Math.abs(b)} = ${c}`;
  $('#answer').value = '';
  $('#result').textContent = '';
}
$('#newBtn')?.addEventListener('click', newProblem);
$('#checkBtn')?.addEventListener('click', () => {
  if (!current) { newProblem(); return; }
  const guess = parseFloat($('#answer').value);
  const res = $('#result');
  if (Number.isNaN(guess)) {
    res.textContent = 'Enter a number.';
    return;
  }
  if (Math.abs(guess - current.x) < 1e-9) {
    res.textContent = '✅ Correct!';
  } else {
    res.textContent = `❌ Not quite. Correct x = ${current.x}`;
  }
});
newProblem(); // first one

// --------- Notes ----------
const notes = $('#notesBox');
const saved = localStorage.getItem('mmh-notes');
if (saved) notes.value = saved;
notes?.addEventListener('input', () => localStorage.setItem('mmh-notes', notes.value));
$('#clearNotes')?.addEventListener('click', () => {
  if (confirm('Clear all notes?')) {
    notes.value = '';
    localStorage.removeItem('mmh-notes');
  }
});
