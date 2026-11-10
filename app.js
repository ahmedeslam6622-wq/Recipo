(() => {
'use strict';

/* ==========================================================
   Helpers
   ========================================================== */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const p = d => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
const ICON = {
    heart: p('<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
    trash: p('<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'),
    edit: p('<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
    search: p('<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'),
    plus: p('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    minus: p('<line x1="5" y1="12" x2="19" y2="12"/>'),
    home: p('<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
    cart: p('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
    shuffle: p('<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>'),
    sliders: p('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>'),
    x: p('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'),
    clock: p('<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
    users: p('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'),
    copy: p('<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
    download: p('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
    upload: p('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
};
const hydrateIcons = (root = document) => $$('[data-icon]', root).forEach(el => { el.outerHTML = ICON[el.dataset.icon] || ''; });

const CATEGORIES = [
    { name: 'Breakfast', emoji: '🥞', hue: 38 },
    { name: 'Lunch', emoji: '🥗', hue: 140 },
    { name: 'Dinner', emoji: '🍝', hue: 250 },
    { name: 'Dessert', emoji: '🍰', hue: 330 },
    { name: 'Snack', emoji: '🍪', hue: 18 },
    { name: 'Drinks', emoji: '🥤', hue: 190 },
    { name: 'Other', emoji: '🍽️', hue: 275 },
];
const EMOJIS = ['🍝', '🥗', '🍕', '🍔', '🌮', '🍣', '🥘', '🍜', '🥞', '🍰', '🍪', '🥤', '🍲', '🥪', '🍳', '🥑', '🍗', '🍽️'];
const catOf = name => CATEGORIES.find(c => c.name === name) || CATEGORIES[CATEGORIES.length - 1];

/* ==========================================================
   State + storage
   ========================================================== */
const KEY = { recipes: 'all_recipes', shop: 'recipo_shopping', theme: 'recipo_theme' };

function read(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
    catch { return fallback; }
}
function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch { toast('Could not save, browser storage is full or blocked'); }
}

// Accepts the old format ("Name: ingredients" strings) and the new object format.
function normalize(r) {
    if (typeof r === 'string') {
        const i = r.indexOf(':');
        return normalize({ name: i > 0 ? r.slice(0, i).trim() : 'Untitled recipe', ingredients: i > 0 ? r.slice(i + 1).trim() : r });
    }
    const category = CATEGORIES.some(c => c.name === r.category) ? r.category : 'Other';
    return {
        id: r.id || uid(),
        name: String(r.name || 'Untitled recipe').slice(0, 80),
        category,
        emoji: r.emoji || catOf(category).emoji,
        time: Math.max(0, Number(r.time) || 0),
        servings: Math.max(0, Number(r.servings) || 0),
        ingredients: String(r.ingredients || ''),
        steps: String(r.steps || ''),
        notes: String(r.notes || ''),
        favorite: !!r.favorite,
        created: Number(r.created) || Date.now(),
    };
}

let recipes = (read(KEY.recipes, []) || []).map(normalize);
let shopping = (read(KEY.shop, []) || []).filter(i => i && i.text);
const view = { nav: 'all', cat: 'All', sort: 'new', q: '' };

const saveRecipes = () => write(KEY.recipes, recipes);
const saveShop = () => write(KEY.shop, shopping);
const getRecipe = id => recipes.find(r => r.id === id);

/* ==========================================================
   Text parsing + scaling
   ========================================================== */
function lines(text, splitCommas = false) {
    const t = String(text || '').trim();
    if (!t) return [];
    const parts = splitCommas && !t.includes('\n') ? t.split(/[,;]/) : t.split(/\r?\n/);
    return parts.map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean);
}
const ingredientLines = r => lines(r.ingredients, true);

const UNI = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3, '⅛': .125 };
const FRACS = [[0, ''], [.125, '⅛'], [.25, '¼'], [1 / 3, '⅓'], [.5, '½'], [2 / 3, '⅔'], [.75, '¾'], [1, '']];

function fmtQty(n) {
    let whole = Math.floor(n + 1e-9);
    const frac = n - whole;
    let best = FRACS[0];
    for (const f of FRACS) if (Math.abs(f[0] - frac) < Math.abs(best[0] - frac)) best = f;
    if (Math.abs(best[0] - frac) > 0.04) return String(Math.round(n * 100) / 100);
    if (best[0] === 1) whole += 1;
    return (whole || best[1] ? `${whole || ''}${best[1]}` : '0');
}

function scaleLine(line, factor) {
    if (!factor || Math.abs(factor - 1) < 1e-9) return line;
    let m, qty, rest;
    if ((m = line.match(/^(\d+)\s+(\d+)\/(\d+)(.*)$/))) { qty = +m[1] + m[2] / m[3]; rest = m[4]; }
    else if ((m = line.match(/^(\d+)\/(\d+)(.*)$/))) { qty = m[1] / m[2]; rest = m[3]; }
    else if ((m = line.match(/^([½¼¾⅓⅔⅛])(.*)$/))) { qty = UNI[m[1]]; rest = m[2]; }
    else if ((m = line.match(/^(\d+(?:[.,]\d+)?)(.*)$/))) { qty = parseFloat(m[1].replace(',', '.')); rest = m[2]; }
    else return line;
    if (/^\s*[-–]\s*\d/.test(rest)) return line; // ranges like "2-3" are left alone
    return fmtQty(qty * factor) + rest;
}

/* ==========================================================
   Search + highlighting
   ========================================================== */
const terms = () => view.q.toLowerCase().split(/\s+/).filter(Boolean);

function haystack(r) {
    return [r.name, r.category, r.ingredients, r.steps, r.notes].join('\n').toLowerCase();
}
function hl(text, ts) {
    if (!ts.length) return esc(text);
    const re = new RegExp('(' + ts.map(reEsc).join('|') + ')', 'gi');
    return String(text).split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
}

function visibleRecipes() {
    const ts = terms();
    let list = recipes.filter(r => {
        if (view.nav === 'fav' && !r.favorite) return false;
        if (view.cat !== 'All' && r.category !== view.cat) return false;
        if (ts.length) { const h = haystack(r); return ts.every(t => h.includes(t)); }
        return true;
    });
    const sorters = {
        new: (a, b) => b.created - a.created,
        old: (a, b) => a.created - b.created,
        az: (a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
        quick: (a, b) => (a.time || 1e9) - (b.time || 1e9),
        fav: (a, b) => (b.favorite - a.favorite) || (b.created - a.created),
    };
    return list.sort(sorters[view.sort]);
}

/* ==========================================================
   Rendering: cards (keyed so typing in search doesn't replay animations)
   ========================================================== */
const container = $('#recipe-container');
const cardEls = new Map();

function cardHTML(r, ts) {
    const ing = ingredientLines(r);
    const preview = ing.slice(0, 4).map(l => hl(l, ts)).join(' · ') + (ing.length > 4 ? ` · +${ing.length - 4} more` : '');
    let note = '';
    if (ts.length) {
        const nameHit = ts.some(t => (r.name + ' ' + r.category).toLowerCase().includes(t));
        const ingHit = ts.some(t => r.ingredients.toLowerCase().includes(t));
        if (!nameHit && ingHit) note = '<span class="match-note">Found in ingredients</span>';
        else if (!nameHit && !ingHit) note = '<span class="match-note">Found in instructions or notes</span>';
    }
    return `
        <div class="card-top">
            <div class="emoji">${esc(r.emoji)}</div>
            <div class="card-actions">
                <button class="icon-btn fav-btn ${r.favorite ? 'on' : ''}" data-act="fav" aria-pressed="${r.favorite}" aria-label="${r.favorite ? 'Remove from favorites' : 'Add to favorites'}">${ICON.heart}</button>
                <button class="icon-btn del-btn" data-act="del" aria-label="Delete ${esc(r.name)}">${ICON.trash}</button>
            </div>
        </div>
        <h3>${hl(r.name, ts)}</h3>
        <div class="meta">
            <span class="tag">${hl(r.category, ts)}</span>
            ${r.time ? `<span>${ICON.clock}${r.time} min</span>` : ''}
            ${r.servings ? `<span>${ICON.users}${r.servings}</span>` : ''}
        </div>
        ${preview ? `<p class="preview">${preview}</p>` : ''}
        ${note}`;
}

function render() {
    const ts = terms();
    const list = visibleRecipes();
    const ids = new Set(list.map(r => r.id));

    for (const [id, el] of cardEls) if (!ids.has(id)) { el.remove(); cardEls.delete(id); }

    let fresh = 0;
    list.forEach(r => {
        let el = cardEls.get(r.id);
        const html = cardHTML(r, ts);
        if (!el) {
            el = document.createElement('article');
            el.className = 'card enter';
            el.tabIndex = 0;
            el.dataset.id = r.id;
            el.style.setProperty('--i', Math.min(fresh++, 12));
            cardEls.set(r.id, el);
            el.addEventListener('animationend', e => { if (e.animationName === 'cardIn') el.classList.remove('enter'); });
        }
        el.style.setProperty('--hue', catOf(r.category).hue);
        if (el._html !== html) { el.innerHTML = html; el._html = html; }
        container.appendChild(el); // keeps DOM order in sync with sorting
    });

    renderChips();
    renderStats(list.length);
    renderEmpty(list.length);
    renderBadge();
}

function renderChips() {
    const counts = {};
    recipes.forEach(r => { if (view.nav !== 'fav' || r.favorite) counts[r.category] = (counts[r.category] || 0) + 1; });
    if (view.cat !== 'All' && !counts[view.cat]) view.cat = 'All';
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const chips = $('#chips');
    const items = [['All', total], ...CATEGORIES.filter(c => counts[c.name]).map(c => [c.name, counts[c.name]])];
    const sig = items.map(i => i.join(':')).join('|') + view.cat;
    if (chips._sig === sig) return;
    chips._sig = sig;
    chips.innerHTML = items.map(([n, c]) =>
        `<button class="chip ${n === view.cat ? 'active' : ''}" data-cat="${esc(n)}" role="tab" aria-selected="${n === view.cat}">${esc(n)}<small>${c}</small></button>`).join('');
    chips.hidden = recipes.length === 0;
}

function renderStats(shown) {
    const favs = recipes.filter(r => r.favorite).length;
    const filtered = view.q || view.cat !== 'All' || view.nav === 'fav';
    $('#stats').textContent = !recipes.length ? 'Your cookbook is empty'
        : filtered ? `Showing ${shown} of ${recipes.length}`
        : `${recipes.length} recipe${recipes.length === 1 ? '' : 's'} · ${favs} favorite${favs === 1 ? '' : 's'}`;
}

function renderEmpty(count) {
    const box = $('#empty');
    if (count) { box.hidden = true; return; }
    box.hidden = false;
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    if (!recipes.length) {
        box.innerHTML = `<span class="big">📖</span><h2>Start your cookbook</h2>
            <p>Add your first recipe, or load a few samples to try out search and scaling.</p>
            <div class="btn-row"><button class="btn primary" data-empty="add">Add recipe</button><button class="btn" data-empty="sample">Load samples</button></div>`;
    } else if (view.nav === 'fav' && !view.q && view.cat === 'All') {
        box.innerHTML = `<span class="big">💝</span><h2>No favorites yet</h2><p>Tap the heart on any recipe to keep it here.</p>
            <div class="btn-row"><button class="btn" data-empty="all">Browse all recipes</button></div>`;
    } else {
        box.innerHTML = `<span class="big">🔍</span><h2>No matches</h2>
            <p>${view.q ? `Nothing found for “${esc(view.q)}”. Try a different word or an ingredient.` : 'No recipes in this category.'}</p>
            <div class="btn-row"><button class="btn" data-empty="clear">Clear filters</button></div>`;
    }
}

function renderBadge() {
    const n = shopping.filter(i => !i.done).length;
    const b = $('#shop-badge');
    const was = b.textContent;
    b.hidden = n === 0;
    b.textContent = n;
    if (was !== String(n) && n) { b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; }
}

/* ==========================================================
   Modals, toasts, confirm
   ========================================================== */
const stack = [];
function openModal(id) {
    const el = typeof id === 'string' ? $('#' + id) : id;
    if (!el || stack.includes(el)) return;
    clearTimeout(el._t);
    el.hidden = false;
    void el.offsetWidth;
    requestAnimationFrame(() => el.classList.add('open'));
    stack.push(el);
    document.body.classList.add('lock');
}
let confirmResolve = null;
function closeModal(id) {
    const el = typeof id === 'string' ? $('#' + id) : id;
    if (!el || el.hidden) return;
    if (el.id === 'confirm-modal' && confirmResolve) { const r = confirmResolve; confirmResolve = null; r(false); }
    el.classList.remove('open');
    const i = stack.indexOf(el); if (i > -1) stack.splice(i, 1);
    if (!stack.length) document.body.classList.remove('lock');
    clearTimeout(el._t);
    el._t = setTimeout(() => { if (!el.classList.contains('open')) el.hidden = true; }, 320);
}
$$('.overlay').forEach(ov => ov.addEventListener('mousedown', e => { if (e.target === ov) closeModal(ov); }));
document.addEventListener('click', e => { const c = e.target.closest('[data-close]'); if (c) closeModal(c.closest('.overlay')); });

function toast(msg, action) {
    const box = $('#toasts');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span>${esc(msg)}</span>`;
    const remove = () => { t.classList.add('out'); setTimeout(() => t.remove(), 300); };
    if (action) {
        const b = document.createElement('button');
        b.textContent = action.label;
        b.onclick = () => { action.fn(); remove(); };
        t.appendChild(b);
    }
    box.appendChild(t);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(remove, action ? 6000 : 2600);
}

function confirmDialog({ title, text, ok = 'Delete' }) {
    return new Promise(resolve => {
        $('#confirm-title').textContent = title;
        $('#confirm-text').textContent = text;
        $('#confirm-ok').textContent = ok;
        confirmResolve = resolve;
        openModal('confirm-modal');
    });
}
$('#confirm-ok').onclick = () => { const r = confirmResolve; confirmResolve = null; closeModal('confirm-modal'); r && r(true); };
$('#confirm-cancel').onclick = () => closeModal('confirm-modal');

/* ==========================================================
   Add / edit
   ========================================================== */
const form = $('#recipe-form');
let editingId = null, pickedEmoji = null, emojiTouched = false;

$('#recipe-category').innerHTML = CATEGORIES.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
$('#emoji-picker').innerHTML = EMOJIS.map(e => `<button type="button" class="emoji-opt" data-emoji="${e}" aria-label="Icon ${e}">${e}</button>`).join('');

function setEmoji(e) {
    pickedEmoji = e;
    $$('.emoji-opt').forEach(b => b.classList.toggle('on', b.dataset.emoji === e));
}
$('#emoji-picker').addEventListener('click', e => {
    const b = e.target.closest('.emoji-opt'); if (!b) return;
    emojiTouched = true; setEmoji(b.dataset.emoji);
});
$('#recipe-category').addEventListener('change', e => { if (!emojiTouched) setEmoji(catOf(e.target.value).emoji); });

function openForm(id) {
    const r = id ? getRecipe(id) : null;
    editingId = r ? r.id : null;
    emojiTouched = !!r;
    $('#form-title').textContent = r ? 'Edit recipe' : 'Add recipe';
    $('#form-sub').textContent = r ? 'Update anything and save.' : 'Fill in what you know, you can edit it later.';
    $('#save-recipe').textContent = r ? 'Save changes' : 'Save recipe';
    $('#recipe-name').value = r ? r.name : '';
    $('#recipe-category').value = r ? r.category : (view.cat !== 'All' ? view.cat : 'Dinner');
    $('#recipe-time').value = r && r.time ? r.time : '';
    $('#recipe-servings').value = r && r.servings ? r.servings : '';
    $('#recipe-ingredients').value = r ? r.ingredients : '';
    $('#recipe-steps').value = r ? r.steps : '';
    $('#recipe-notes').value = r ? r.notes : '';
    setEmoji(r ? r.emoji : catOf($('#recipe-category').value).emoji);
    $$('.field.invalid', form).forEach(f => f.classList.remove('invalid'));
    $('#form-error').hidden = true;
    openModal('add-recipe-popup');
    setTimeout(() => $('#recipe-name').focus({ preventScroll: true }), 350);
}

form.addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#recipe-name').value.trim();
    const ingredients = $('#recipe-ingredients').value.trim();
    $$('.field.invalid', form).forEach(f => f.classList.remove('invalid'));
    const bad = [];
    if (!name) bad.push($('#recipe-name'));
    if (!ingredients) bad.push($('#recipe-ingredients'));
    if (bad.length) {
        bad.forEach(el => { const f = el.closest('.field'); f.classList.remove('invalid'); void f.offsetWidth; f.classList.add('invalid'); });
        const err = $('#form-error');
        err.textContent = `Add ${bad.length === 2 ? 'a name and ingredients' : name ? 'some ingredients' : 'a name'} to save this recipe.`;
        err.hidden = false;
        bad[0].focus();
        return;
    }
    const data = {
        name,
        category: $('#recipe-category').value,
        emoji: pickedEmoji,
        time: $('#recipe-time').value,
        servings: $('#recipe-servings').value,
        ingredients,
        steps: $('#recipe-steps').value.trim(),
        notes: $('#recipe-notes').value.trim(),
    };
    if (editingId) {
        const old = getRecipe(editingId);
        Object.assign(old, normalize({ ...old, ...data }));
        toast('Changes saved');
        if (detail.id === editingId) renderDetail();
    } else {
        recipes.push(normalize(data));
        toast(`Saved “${name}”`);
        view.nav = 'all'; syncNav();
    }
    saveRecipes();
    closeModal('add-recipe-popup');
    r
