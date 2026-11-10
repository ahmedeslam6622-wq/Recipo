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
const KEY = { recipes: 'all_recipes', shop: 'recipo_shopping', theme: 'recipo_theme', size: 'recipo_size' };
const lsGet = k => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch { /* storage blocked */ } };
window.addEventListener('error', () => { const b = document.getElementById('error-banner'); if (b) b.hidden = false; });

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

    $('#sort-row').hidden = recipes.length < 2;
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
    $('#stats').textContent = !recipes.length ? ''
        : filtered ? `Showing ${shown} of ${recipes.length}`
        : `${recipes.length} recipe${recipes.length === 1 ? '' : 's'}`;
}

function renderEmpty(count) {
    const box = $('#empty');
    if (count) { box.hidden = true; return; }
    box.hidden = false;
    box.style.animation = 'none'; void box.offsetWidth; box.style.animation = '';
    if (!recipes.length) {
        box.innerHTML = `<span class="big">📖</span><h2>Your cookbook is empty</h2>
            <p>Tap the blue “Add a recipe” button to write down your first one.</p>
            <div class="btn-row"><button class="btn primary" data-empty="add">Add a recipe</button><button class="btn" data-empty="sample">Try some example recipes</button></div>`;
    } else if (view.nav === 'fav' && !view.q && view.cat === 'All') {
        box.innerHTML = `<span class="big">💝</span><h2>No favorites yet</h2><p>Tap the heart on a recipe to keep it here.</p>
            <div class="btn-row"><button class="btn primary" data-empty="all">Show all my recipes</button></div>`;
    } else {
        box.innerHTML = `<span class="big">🔍</span><h2>No matches</h2>
            <p>${view.q ? `We could not find “${esc(view.q)}”. Try a shorter word, or an ingredient.` : 'There are no recipes of this type.'}</p>
            <div class="btn-row"><button class="btn primary" data-empty="clear">Show all my recipes</button></div>`;
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

function confirmDialog({ title, text, ok = 'Yes, delete' }) {
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
    $('#form-title').textContent = r ? 'Edit recipe' : 'Add a recipe';
    $('#form-sub').textContent = r ? 'Change anything, then tap Save.' : 'Type the name and ingredients, then tap Save.';
    $('#save-recipe').textContent = r ? 'Save changes' : 'Save recipe';
    $('#more-details').open = !!(r && (r.time || r.servings || r.notes));
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
        err.textContent = `Please type ${bad.length === 2 ? 'a name and the ingredients' : name ? 'the ingredients' : 'a name'} first.`;
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
        toast(`Saved “${name}”`); window.scrollTo({ top: 0, behavior: 'smooth' });
        view.nav = 'all'; syncNav();
    }
    saveRecipes();
    closeModal('add-recipe-popup');
    render();
});
form.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') form.requestSubmit(); });

/* ==========================================================
   Delete / favorite / duplicate (with undo)
   ========================================================== */
function deleteRecipe(id) {
    const idx = recipes.findIndex(r => r.id === id);
    if (idx < 0) return;
    const removed = recipes[idx];
    const el = cardEls.get(id);
    const finish = () => {
        recipes = recipes.filter(r => r.id !== id);
        saveRecipes();
        if (el) { el.remove(); cardEls.delete(id); }
        if (detail.id === id) closeModal('detail-modal');
        render();
        toast(`Deleted “${removed.name}”`, {
            label: 'Undo',
            fn: () => { recipes.splice(Math.min(idx, recipes.length), 0, removed); saveRecipes(); render(); },
        });
    };
    if (el) { el.classList.remove('enter'); el.classList.add('removing'); setTimeout(finish, 340); }
    else finish();
}

function toggleFav(id) {
    const r = getRecipe(id); if (!r) return;
    r.favorite = !r.favorite;
    saveRecipes();
    render();
    if (detail.id === id) renderDetail();
    toast(r.favorite ? 'Added to favorites' : 'Removed from favorites');
}

function duplicate(id) {
    const r = getRecipe(id); if (!r) return;
    const copy = normalize({ ...r, id: uid(), name: `${r.name} (copy)`.slice(0, 80), favorite: false, created: Date.now() });
    recipes.push(copy);
    saveRecipes(); render();
    toast('Duplicated');
}

/* Card interactions (delegated) */
container.addEventListener('click', e => {
    const card = e.target.closest('.card'); if (!card) return;
    const act = e.target.closest('[data-act]');
    const id = card.dataset.id;
    if (act && act.dataset.act === 'fav') return toggleFav(id);
    if (act && act.dataset.act === 'del') {
        return confirmDialog({ title: 'Delete recipe?', text: `“${getRecipe(id).name}” will be deleted. You can undo it right after.`, ok: 'Yes, delete' })
            .then(ok => ok && deleteRecipe(id));
    }
    openDetail(id);
});
container.addEventListener('keydown', e => {
    const card = e.target.closest('.card');
    if (card && e.target === card && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openDetail(card.dataset.id); }
});
container.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const card = e.target.closest('.card'); if (!card) return;
    const b = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    card.style.setProperty('--my', (e.clientY - b.top) + 'px');
});

/* ==========================================================
   Detail view
   ========================================================== */
const detail = { id: null, servings: 0, have: new Set(), done: new Set() };

function openDetail(id) {
    const r = getRecipe(id); if (!r) return;
    Object.assign(detail, { id, servings: r.servings, have: new Set(), done: new Set() });
    renderDetail();
    openModal('detail-modal');
    $('#detail-modal .sheet').scrollTop = 0;
}

function renderDetail() {
    const r = getRecipe(detail.id);
    if (!r) return closeModal('detail-modal');
    const factor = r.servings ? detail.servings / r.servings : 1;
    const ing = ingredientLines(r);
    const steps = lines(r.steps);
    const hue = catOf(r.category).hue;

    $('#detail-body').innerHTML = `
        <div class="detail-top">
            <button class="btn" data-close>← Back</button>
            <button class="btn fav-btn ${r.favorite ? 'on' : ''}" data-d="fav" aria-pressed="${r.favorite}">${ICON.heart}${r.favorite ? 'Favorited' : 'Favorite'}</button>
        </div>
        <div class="detail-hero" style="--hue:${hue}">
            <div class="emoji">${esc(r.emoji)}</div>
            <div>
                <h2>${esc(r.name)}</h2>
                <div class="meta">
                    <span class="tag" style="--hue:${hue}">${esc(r.category)}</span>
                    ${r.time ? `<span>${ICON.clock}${r.time} min</span>` : ''}
                </div>
            </div>
        </div>

        <div class="section-title">
            <h3>Ingredients</h3>
            ${r.servings ? `<div class="scaler" role="group" aria-label="Servings">
                <button class="icon-btn" data-d="minus" aria-label="Fewer servings">${ICON.minus}</button>
                <span>For ${detail.servings}</span>
                <button class="icon-btn" data-d="plus" aria-label="More servings">${ICON.plus}</button>
            </div>` : ''}
        </div>
        <ul class="list">${ing.map((l, i) => `
            <li><label class="check"><input type="checkbox" data-i="${i}" ${detail.have.has(i) ? 'checked' : ''}><span class="box"></span><span class="txt">${esc(scaleLine(l, factor))}</span></label></li>`).join('')}
        </ul>
        <p class="muted hint">Tap an ingredient you already have. Then tap “Add to shopping list” for the rest.</p>

        ${steps.length ? `<div class="section-title"><h3>How to make it</h3></div>
        <ol class="list steps">${steps.map((s, i) => `<li data-s="${i}" class="${detail.done.has(i) ? 'done' : ''}"><span>${esc(s)}</span></li>`).join('')}</ol>` : ''}

        ${r.notes ? `<div class="section-title"><h3>Notes</h3></div><div class="notes">${esc(r.notes)}</div>` : ''}

        <div class="sheet-actions" style="justify-content:flex-start">
            <button class="btn primary" data-d="shop">${ICON.cart}Add to shopping list</button>
            <button class="btn" data-d="edit">${ICON.edit}Edit recipe</button>
            <button class="btn" data-d="copy">${ICON.copy}Copy to share</button>
            <button class="btn" data-d="dup">Make a copy</button>
            <button class="btn danger" data-d="del">${ICON.trash}Delete recipe</button>
        </div>`;
}

$('#detail-body').addEventListener('click', async e => {
    const r = getRecipe(detail.id); if (!r) return;
    const step = e.target.closest('[data-s]');
    if (step) {
        const i = +step.dataset.s;
        detail.done.has(i) ? detail.done.delete(i) : detail.done.add(i);
        step.classList.toggle('done');
        return;
    }
    const b = e.target.closest('[data-d]'); if (!b) return;
    switch (b.dataset.d) {
        case 'fav': toggleFav(r.id); break;
        case 'minus': detail.servings = Math.max(1, detail.servings - 1); renderDetail(); break;
        case 'plus': detail.servings = Math.min(99, detail.servings + 1); renderDetail(); break;
        case 'shop': {
            const factor = r.servings ? detail.servings / r.servings : 1;
            const items = ingredientLines(r).map((l, i) => [i, scaleLine(l, factor)]).filter(([i]) => !detail.have.has(i)).map(([, l]) => l);
            addToShopping(items, r.name);
            break;
        }
        case 'edit': closeModal('detail-modal'); openForm(r.id); break;
        case 'copy': copyText(recipeAsText(r)); break;
        case 'dup': duplicate(r.id); break;
        case 'del': {
            const ok = await confirmDialog({ title: 'Delete recipe?', text: `“${r.name}” will be deleted. You can undo it right after.` });
            if (ok) deleteRecipe(r.id);
            break;
        }
    }
});
$('#detail-body').addEventListener('change', e => {
    if (e.target.matches('input[data-i]')) {
        const i = +e.target.dataset.i;
        e.target.checked ? detail.have.add(i) : detail.have.delete(i);
    }
});

function recipeAsText(r) {
    const factor = r.servings ? (detail.id === r.id ? detail.servings : r.servings) / r.servings : 1;
    const out = [`${r.emoji} ${r.name}`, [r.category, r.time && `${r.time} min`, r.servings && `serves ${detail.id === r.id ? detail.servings : r.servings}`].filter(Boolean).join(' • '), '', 'Ingredients'];
    ingredientLines(r).forEach(l => out.push('- ' + scaleLine(l, factor)));
    const st = lines(r.steps);
    if (st.length) { out.push('', 'Instructions'); st.forEach((s, i) => out.push(`${i + 1}. ${s}`)); }
    if (r.notes) out.push('', 'Notes', r.notes);
    return out.join('\n');
}

async function copyText(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
    catch {
        const ta = Object.assign(document.createElement('textarea'), { value: text });
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); toast('Copied to clipboard'); } catch { toast('Could not copy'); }
        ta.remove();
    }
}

/* ==========================================================
   Shopping list
   ========================================================== */
function addToShopping(items, from) {
    const existing = new Set(shopping.filter(i => !i.done).map(i => i.text.toLowerCase()));
    let added = 0;
    items.forEach(text => {
        if (existing.has(text.toLowerCase())) return;
        shopping.push({ id: uid(), text, done: false, from: from || '' });
        existing.add(text.toLowerCase());
        added++;
    });
    saveShop(); renderBadge(); renderShopping();
    toast(added ? `Added ${added} item${added === 1 ? '' : 's'} to your shopping list` : 'Those are already on your list', added ? { label: 'View list', fn: openShopping } : null);
}

function renderShopping() {
    const list = $('#shop-list');
    const left = shopping.filter(i => !i.done).length;
    $('#shop-sub').textContent = shopping.length ? `${left} left to buy` : 'Nothing here yet';
    list.innerHTML = shopping.length ? shopping.map(i => `
        <li data-id="${i.id}">
            <label class="check"><input type="checkbox" ${i.done ? 'checked' : ''}><span class="box"></span>
                <span class="txt">${esc(i.text)}${i.from ? `<span class="shop-from">${esc(i.from)}</span>` : ''}</span></label>
            <button class="icon-btn small" data-rm aria-label="Remove ${esc(i.text)}">${ICON.x}</button>
        </li>`).join('') : '<li class="shop-empty">Nothing here yet. Type something above, or open a recipe and tap “Add to shopping list”.</li>';
}
function openShopping() { renderShopping(); openModal('shopping-modal'); }

$('#open-shopping').onclick = openShopping;
$('#shop-form').addEventListener('submit', e => {
    e.preventDefault();
    const inp = $('#shop-input'); const t = inp.value.trim(); if (!t) return;
    shopping.push({ id: uid(), text: t, done: false, from: '' });
    inp.value = ''; saveShop(); renderShopping(); renderBadge();
});
$('#shop-list').addEventListener('change', e => {
    const id = e.target.closest('li')?.dataset.id; const it = shopping.find(i => i.id === id);
    if (it) { it.done = e.target.checked; saveShop(); renderBadge(); $('#shop-sub').textContent = `${shopping.filter(i => !i.done).length} left to buy`; }
});
$('#shop-list').addEventListener('click', e => {
    const rm = e.target.closest('[data-rm]'); if (!rm) return;
    shopping = shopping.filter(i => i.id !== rm.closest('li').dataset.id);
    saveShop(); renderShopping(); renderBadge();
});
$('#shop-clear-done').onclick = () => { shopping = shopping.filter(i => !i.done); saveShop(); renderShopping(); renderBadge(); };
$('#shop-clear-all').onclick = async () => {
    if (!shopping.length) return;
    if (await confirmDialog({ title: 'Clear shopping list?', text: 'Everything on the list will be removed.', ok: 'Yes, clear it' })) {
        shopping = []; saveShop(); renderShopping(); renderBadge();
    }
};
$('#shop-copy').onclick = () => {
    const t = shopping.filter(i => !i.done).map(i => '- ' + i.text).join('\n');
    t ? copyText(t) : toast('Nothing to copy');
};

/* ==========================================================
   Random
   ========================================================== */
let randId = null, rollTimer = null;
function pickRandom() {
    const stage = $('#rand-stage');
    clearInterval(rollTimer);
    if (!recipes.length) {
        stage.innerHTML = '<p class="muted">Add a recipe first, then come back here.</p>';
        $('#rand-open').disabled = true; $('#randomize-recipe').disabled = true; randId = null;
        return;
    }
    $('#randomize-recipe').disabled = false;
    const pool = recipes.length > 1 ? recipes.filter(r => r.id !== randId) : recipes;
    const final = pool[Math.floor(Math.random() * pool.length)];
    const show = r => { stage.innerHTML = `<div class="emoji" style="--hue:${catOf(r.category).hue}">${esc(r.emoji)}</div><h3>${esc(r.name)}</h3>
        <div class="meta"><span class="tag" style="--hue:${catOf(r.category).hue}">${esc(r.category)}</span>${r.time ? `<span>${ICON.clock}${r.time} min</span>` : ''}</div>`; };
    stage.className = 'rand-stage rolling';
    $('#rand-open').disabled = true;
    let n = 0;
    rollTimer = setInterval(() => {
        if (++n > 9) {
            clearInterval(rollTimer);
            randId = final.id; show(final);
            stage.className = 'rand-stage landed';
            $('#rand-open').disabled = false;
        } else show(recipes[Math.floor(Math.random() * recipes.length)]);
    }, 80);
}
$('#randomize').onclick = () => { openModal('randomize-popup'); randId = null; pickRandom(); };
$('#randomize-recipe').onclick = pickRandom;
$('#rand-open').onclick = () => { const id = randId; closeModal('randomize-popup'); setTimeout(() => openDetail(id), 200); };

/* ==========================================================
   Settings: theme, backup, samples, wipe
   ========================================================== */
function applyTheme(t) {
    document.documentElement.dataset.theme = t;
    $$('#theme-seg button').forEach(b => { const on = b.dataset.themeSet === t; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
    const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
    $('meta[name="theme-color"]').content = dark ? '#0b0d17' : '#eaf0ff';
}
$('#theme-seg').addEventListener('click', e => {
    const b = e.target.closest('[data-theme-set]'); if (!b) return;
    lsSet(KEY.theme, b.dataset.themeSet); applyTheme(b.dataset.themeSet);
});
function applySize(sz) {
    document.documentElement.dataset.size = sz;
    $$('#size-seg button').forEach(b => { const on = b.dataset.sizeSet === sz; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
}
$('#size-seg').addEventListener('click', e => {
    const b = e.target.closest('[data-size-set]'); if (!b) return;
    lsSet(KEY.size, b.dataset.sizeSet); applySize(b.dataset.sizeSet);
});
$('#open-settings').onclick = () => openModal('settings-modal');

$('#export-btn').onclick = () => {
    const blob = new Blob([JSON.stringify({ app: 'recipo', version: 2, exported: new Date().toISOString(), recipes, shopping }, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `recipo-backup-${new Date().toISOString().slice(0, 10)}.json` });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast(`Backup saved (${recipes.length} recipe${recipes.length === 1 ? '' : 's'})`);
};
$('#import-btn').onclick = () => $('#import-file').click();
$('#import-file').addEventListener('change', async e => {
    const file = e.target.files[0]; e.target.value = '';
    if (!file) return;
    try {
        const data = JSON.parse(await file.text());
        const incoming = (Array.isArray(data) ? data : data.recipes);
        if (!Array.isArray(incoming)) throw new Error('bad');
        let added = 0;
        incoming.map(normalize).forEach(r => {
            const dupe = recipes.find(x => x.id === r.id || (x.name === r.name && x.ingredients === r.ingredients));
            if (!dupe) { recipes.push(r); added++; }
        });
        if (!Array.isArray(data) && Array.isArray(data.shopping)) {
            data.shopping.forEach(i => i && i.text && !shopping.some(s => s.id === i.id) && shopping.push({ id: i.id || uid(), text: String(i.text), done: !!i.done, from: String(i.from || '') }));
            saveShop();
        }
        saveRecipes(); render();
        toast(added ? `Imported ${added} new recipe${added === 1 ? '' : 's'}` : 'No new recipes found in that file');
        closeModal('settings-modal');
    } catch { toast('That file is not a Recipo backup'); }
});

const SAMPLES = [
    { name: 'Creamy tomato pasta', category: 'Dinner', emoji: '🍝', time: 25, servings: 2, ingredients: '200 g spaghetti\n2 cloves garlic\n400 g canned tomatoes\n1/2 cup cream\n1/2 cup grated parmesan\nSalt and basil', steps: 'Boil the spaghetti in salted water until al dente.\nFry the garlic in olive oil, add the tomatoes and simmer 10 minutes.\nStir in the cream and parmesan.\nToss with the pasta and top with basil.', notes: 'A pinch of sugar balances acidic tomatoes.' },
    { name: 'Fluffy pancakes', category: 'Breakfast', emoji: '🥞', time: 20, servings: 4, ingredients: '1 1/2 cups flour\n2 tbsp sugar\n2 tsp baking powder\n1 cup milk\n1 egg\n3 tbsp melted butter', steps: 'Whisk the dry ingredients.\nMix in milk, egg and butter until just combined.\nCook ladlefuls on a medium pan until bubbles form, then flip.', notes: 'Rest the batter 5 minutes for extra fluff.' },
    { name: 'Greek salad', category: 'Lunch', emoji: '🥗', time: 10, servings: 2, ingredients: '3 tomatoes\n1 cucumber\n1 red onion\n100 g feta\n10 olives\n3 tbsp olive oil\nOregano', steps: 'Chop the vegetables into chunks.\nTop with feta and olives, drizzle with olive oil and oregano.', notes: '' },
    { name: 'Chocolate chip cookies', category: 'Dessert', emoji: '🍪', time: 35, servings: 12, ingredients: '250 g flour\n150 g butter\n100 g brown sugar\n80 g sugar\n1 egg\n1 tsp vanilla\n150 g chocolate chips', steps: 'Cream the butter with both sugars, then beat in the egg and vanilla.\nFold in flour and chocolate.\nScoop onto a tray and bake at 180°C for 11 minutes.', notes: 'Chill the dough for chewier cookies.' },
    { name: 'Iced lemon tea', category: 'Drinks', emoji: '🥤', time: 10, servings: 4, ingredients: '4 tea bags\n1 liter water\n3 tbsp honey\n2 lemons\nIce', steps: 'Steep the tea in hot water for 4 minutes.\nStir in honey, chill, then add lemon juice and ice.', notes: '' },
];
function addSamples() {
    let n = 0;
    SAMPLES.forEach((s, i) => { if (!recipes.some(r => r.name === s.name)) { recipes.push(normalize({ ...s, created: Date.now() + i })); n++; } });
    saveRecipes(); render();
    toast(n ? `Added ${n} sample recipe${n === 1 ? '' : 's'}` : 'Samples are already in your cookbook');
}
$('#sample-btn').onclick = () => { addSamples(); closeModal('settings-modal'); };
$('#wipe-btn').onclick = async () => {
    if (!recipes.length && !shopping.length) return toast('Nothing to delete');
    if (await confirmDialog({ title: 'Delete all recipes?', text: 'Every recipe and your shopping list will be deleted. Save a backup first if you might want them back.', ok: 'Yes, delete all' })) {
        recipes = []; shopping = []; saveRecipes(); saveShop();
        view.cat = 'All'; view.q = ''; $('#search').value = ''; $('#search-clear').hidden = true;
        render(); closeModal('settings-modal'); toast('All recipes deleted');
    }
};

/* ==========================================================
   Search, sort, nav, empty-state buttons
   ========================================================== */
const search = $('#search');
let searchTimer;
search.addEventListener('input', () => {
    $('#search-clear').hidden = !search.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { view.q = search.value.trim(); render(); }, 90);
});
search.addEventListener('keydown', e => { if (e.key === 'Escape') { clearSearch(); search.blur(); } });
$('#search-clear').onclick = () => { clearSearch(); search.focus(); };
function clearSearch() { search.value = ''; view.q = ''; $('#search-clear').hidden = true; render(); }

$('#sort').addEventListener('change', e => { view.sort = e.target.value; write('recipo_sort', view.sort); render(); });
$('#chips').addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (c) { view.cat = c.dataset.cat; render(); } });

function syncNav() { $$('[data-nav]').forEach(b => b.classList.toggle('active', b.dataset.nav === view.nav)); }
$$('[data-nav]').forEach(b => b.addEventListener('click', () => { view.nav = b.dataset.nav; syncNav(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }));
$('#add').onclick = () => openForm();

$('#empty').addEventListener('click', e => {
    const b = e.target.closest('[data-empty]'); if (!b) return;
    ({ add: () => openForm(), sample: addSamples, all: () => { view.nav = 'all'; syncNav(); render(); }, clear: () => { view.cat = 'All'; view.nav = 'all'; syncNav(); clearSearch(); } })[b.dataset.empty]();
});

/* Keyboard shortcuts */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && stack.length) { closeModal(stack[stack.length - 1]); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.target.matches('input, textarea, select') || stack.length) return;
    if (e.key === '/') { e.preventDefault(); search.focus(); }
    else if (e.key.toLowerCase() === 'n') { e.preventDefault(); openForm(); }
    else if (e.key.toLowerCase() === 'r') { e.preventDefault(); $('#randomize').click(); }
});

/* ==========================================================
   Init
   ========================================================== */
hydrateIcons();
view.sort = read('recipo_sort', 'new'); $('#sort').value = view.sort;
applyTheme(lsGet(KEY.theme) || 'auto');
applySize(lsGet(KEY.size) || 'large');
matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => applyTheme(document.documentElement.dataset.theme));
saveRecipes(); // persists migrated old-format recipes in the new structure
render();
})();
