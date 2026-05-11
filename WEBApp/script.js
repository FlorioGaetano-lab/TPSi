// ==========================================
// 1. ANIMAZIONI ALLO SCROLL
// ==========================================
const revealElements = document.querySelectorAll('.reveal');
const revealOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealOnScroll.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
revealElements.forEach(el => revealOnScroll.observe(el));

// ==========================================
// 2. CARICAMENTO DATABASE PRODOTTI (da file esterno)
// ==========================================
// Attenzione: ora defaultProdotti è definito in prodotti.js
// che deve essere caricato PRIMA di questo script nelle pagine HTML

let prodotti = JSON.parse(localStorage.getItem('tech_prodotti')) || defaultProdotti;

function salvaProdotti() {
    localStorage.setItem('tech_prodotti', JSON.stringify(prodotti));
}

// ==========================================
// 3. FUNZIONI SICURE PER IL CARRELLO
// ==========================================
function safeGetCart() {
    try {
        const cart = localStorage.getItem('tech_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (e) {
        console.error("Errore lettura carrello:", e);
        return [];
    }
}

function safeSetCart(cart) {
    try {
        localStorage.setItem('tech_cart', JSON.stringify(cart));
        updateBadge();
        return true;
    } catch (e) {
        console.error("Errore salvataggio carrello:", e);
        alert("Impossibile salvare il carrello. Lo spazio di archiviazione potrebbe essere pieno.");
        return false;
    }
}

function updateBadge() {
    const badge = document.getElementById('cart-count');
    if (!badge) return;
    const cart = safeGetCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantita, 0);
    badge.textContent = totalItems;
}

function addToCart(prodotto, quantita) {
    if (!prodotto || quantita <= 0) return false;
    if (quantita > prodotto.stock) {
        alert(`⚠️ Quantità massima disponibile: ${prodotto.stock}`);
        return false;
    }
    let cart = safeGetCart();
    const idx = cart.findIndex(item => item.id === prodotto.id);
    if (idx !== -1) {
        cart[idx].quantita = quantita;
    } else {
        cart.push({
            id: prodotto.id,
            nome: prodotto.nome,
            prezzo: prodotto.prezzo,
            quantita: quantita,
            stock: prodotto.stock
        });
    }
    const ok = safeSetCart(cart);
    if (ok) alert(`✅ ${quantita}x ${prodotto.nome} aggiunto al carrello`);
    return ok;
}

function updateCartQty(id, delta) {
    let cart = safeGetCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    const newQty = cart[idx].quantita + delta;
    if (newQty <= 0) {
        // Chiede conferma prima di rimuovere il prodotto
        const nomeProdotto = cart[idx].nome;
        if (confirm(`Il prodotto "${nomeProdotto}" verrà rimosso dal carrello. Continuare?`)) {
            cart.splice(idx, 1);
            safeSetCart(cart);
            renderCart();
        }
        return;
    } else {
        const prodotto = prodotti.find(p => p.id === id);
        if (prodotto && newQty > prodotto.stock) {
            alert(`⚠️ Quantità massima disponibile: ${prodotto.stock}`);
            return;
        }
        cart[idx].quantita = newQty;
        safeSetCart(cart);
        renderCart();
    }
}

function removeItem(id) {
    let cart = safeGetCart();
    cart = cart.filter(i => i.id !== id);
    safeSetCart(cart);
    renderCart();
}

function completaAcquisto() {
    let cart = safeGetCart();
    if (cart.length === 0) return;
    cart.forEach(item => {
        const pIdx = prodotti.findIndex(p => p.id === item.id);
        if (pIdx !== -1) {
            prodotti[pIdx].stock -= item.quantita;
            if (prodotti[pIdx].stock < 0) prodotti[pIdx].stock = 0;
        }
    });
    salvaProdotti();
    safeSetCart([]);
    alert("🎉 Ordine confermato con successo! Grazie per l'acquisto.");
    renderCart();
    if (document.getElementById('dynamic-product-container')) {
        renderProductDetail();
    }
}

// ==========================================
// 4. RENDERING
// ==========================================
function renderCatalogo() {
    const container = document.getElementById('dynamic-catalog');
    if (!container) return;
    container.innerHTML = '';
    const categorie = [...new Set(prodotti.map(p => p.categoria))];
    const idCategorie = {
        "Periferiche": "cat-periferiche", "Audio": "cat-audio", "Monitor": "cat-monitor",
        "Accessori": "cat-accessori", "Wearable & VR": "cat-wearable", "Smart Home": "cat-smarthome"
    };
	// Genera il nome dell'immagine in base all'ID e al nome del prodotto
function getProductImagePath(prodotto) {
    // Crea slug: tutto minuscolo, spazi e punteggiatura diventano underscore
    let slug = prodotto.nome.toLowerCase()
        .replace(/[^\w\s]/g, '')   // rimuove punteggiatura
        .replace(/\s+/g, '_');     // spazi → underscore
    return `img/${prodotto.id}_${slug}.png`;
}
    categorie.forEach(cat => {
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.id = idCategorie[cat] || '';
        title.textContent = cat;
        title.style.marginTop = "3rem";
        container.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'product-grid';
        prodotti.filter(p => p.categoria === cat).forEach(p => {
            const card = document.createElement('div');
            card.className = 'product-card';
            const esauritoBadge = p.stock === 0 ? `<div style="position:absolute; top:10px; right:10px; background:#ff0055; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;">ESAURITO</div>` : '';
            card.innerHTML = `
                <a href="prodotto.html?id=${p.id}" class="card-link" style="position:relative; display:block;">
                    ${esauritoBadge}
					
                   <img src="img/${String(p.id).padStart(2, '0')}.png" alt="${p.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200/161e2d/ff0055?text=No+Image';">
                    <div class="card-content">
                        <h3>${p.nome}</h3>
                        <p class="highlight-text">${p.marca} | €${p.prezzo.toFixed(2)}</p>
                        <p style="margin-top:0.5rem; font-size:0.9rem;">${p.descrizione}</p>
                        <button class="btn btn-primary" style="margin-top:1rem; width:100%; pointer-events:none;">${p.stock === 0 ? 'Dettagli (Esaurito)' : 'Vedi Dettagli'}</button>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
    });
}

function renderProductDetail() {
    const container = document.getElementById('dynamic-product-container');
    if (!container) return;
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'));
    const prodotto = prodotti.find(p => p.id === id);
    if (!prodotto) {
        container.innerHTML = `<div class="text-center"><h2>Prodotto non trovato</h2><a href="catalogo.html" class="btn btn-primary">Torna al Catalogo</a></div>`;
        return;
    }
    const disponibile = prodotto.stock > 0;
    const stockColor = prodotto.stock > 5 ? 'var(--accent-color)' : (prodotto.stock > 0 ? 'orange' : '#ff0055');
    const stockText = prodotto.stock > 0 ? `Disponibilità: ${prodotto.stock} pezzi` : "Prodotto esaurito";
    let qty = 1;
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem; padding:0.8rem 1.2rem; background:rgba(0,212,255,0.05); border-radius:8px;">
            <div style="font-size:0.85rem;">Home / <a href="catalogo.html" style="color:var(--text-dim);">Catalogo</a> / <span style="color:var(--accent-color);">${prodotto.nome}</span></div>
            <a href="catalogo.html" class="link-more" style="display:flex; align-items:center; gap:5px;">&larr; TORNA AL CATALOGO</a>
        </div>
        <div class="product-detail-grid">
            <img src="img/${String(prodotto.id).padStart(2, '0')}.png" alt="${prodotto.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/600x500/161e2d/ff0055?text=No+Image';">
            <div class="product-detail-info">
                <span class="pill-badge">${prodotto.categoria}</span>
                <h1 class="text-gradient" style="margin:1rem 0;">${prodotto.nome}</h1>
                <p style="font-size:1.2rem; color:var(--text-dim);">${prodotto.marca} ${prodotto.modello}</p>
                <p style="margin:1rem 0;">${prodotto.descrizione}</p>
                <div class="content-box" style="padding:1.5rem;"><h3 style="color:var(--accent-color);">Specifiche</h3><p>${prodotto.caratteristiche}</p></div>
                <div style="margin:1.5rem 0; font-weight:bold; color:${stockColor}; border-left:3px solid ${stockColor}; padding-left:10px;">${stockText}</div>
                ${disponibile ? `
                    <div class="quantity-selector" style="margin:2rem 0;">
                        <button class="qty-btn" id="minus">-</button>
                        <span id="qty-val" style="font-size:1.2rem; font-weight:bold; width:30px; text-align:center;">${qty}</span>
                        <button class="qty-btn" id="plus">+</button>
                    </div>
                    <h3>Subtotale: <span id="subtotal" class="text-gradient">€${(prodotto.prezzo * qty).toFixed(2)}</span></h3>
                    <button class="btn btn-primary" id="add-to-cart-btn" style="width:100%; margin-top:1rem;">🛒 Aggiungi al Carrello</button>
                ` : `<button class="btn btn-primary" disabled style="width:100%; background:#555; cursor:not-allowed;">❌ Non Disponibile</button>`}
            </div>
        </div>
    `;
    if (!disponibile) return;
    const minus = document.getElementById('minus');
    const plus = document.getElementById('plus');
    const qtySpan = document.getElementById('qty-val');
    const subtotalSpan = document.getElementById('subtotal');
    const updateSubtotal = () => {
        qtySpan.textContent = qty;
        subtotalSpan.textContent = `€${(prodotto.prezzo * qty).toFixed(2)}`;
    };
    minus.onclick = () => { if (qty > 1) { qty--; updateSubtotal(); } };
    plus.onclick = () => { if (qty < prodotto.stock) { qty++; updateSubtotal(); } else { alert(`Quantità max: ${prodotto.stock}`); } };
    document.getElementById('add-to-cart-btn').onclick = () => addToCart(prodotto, qty);
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    const summaryDiv = document.getElementById('cart-summary');
    if (!container) return;
    const cart = safeGetCart();
    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center" style="background:var(--card-bg); padding:4rem 2rem; border-radius:var(--border-radius);">
            <div style="font-size:4rem;">🛒</div><h2>Carrello vuoto</h2><p style="color:var(--text-dim);">Esplora il catalogo per aggiungere prodotti.</p>
            <a href="catalogo.html" class="btn btn-primary">Esplora Catalogo</a></div>`;
        if (summaryDiv) summaryDiv.style.display = 'none';
        updateBadge();
        return;
    }
    let html = `<div class="content-box"><table class="cart-table"><thead><tr><th>Prodotto</th><th>Prezzo Un.</th><th style="text-align:center;">Qtà</th><th style="text-align:right;">Totale</th></tr></thead><tbody>`;
    let totale = 0;
    cart.forEach(item => {
        const subtot = item.prezzo * item.quantita;
        totale += subtot;
        html += `<tr>
            <td><strong>${item.nome}</strong><br><span class="remove-link" onclick="removeItem(${item.id})">Rimuovi</span></td>
            <td>€${item.prezzo.toFixed(2)}</td>
            <td style="text-align:center;"><button class="qty-btn" onclick="updateCartQty(${item.id}, -1)">-</button> <span style="margin:0 10px;">${item.quantita}</span> <button class="qty-btn" onclick="updateCartQty(${item.id}, 1)">+</button></td>
            <td style="text-align:right; font-weight:bold;">€${subtot.toFixed(2)}</td>
        </tr>`;
    });
    html += `</tbody></table></div>`;
    container.innerHTML = html;
    if (summaryDiv) {
        summaryDiv.style.display = 'block';
        const totalSpan = document.getElementById('cart-total-value');
        if (totalSpan) totalSpan.textContent = `€${totale.toFixed(2)}`;
        const btn = summaryDiv.querySelector('.btn-primary');
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.onclick = () => completaAcquisto();
        }
    }
    updateBadge();
}

// ==========================================
// 5. ARTICOLI E NEWSLETTER
// ==========================================
const articoli = [
    {
        id: 1,
        titolo: "Scegliere il Monitor Perfetto",
        sottotitolo: "Scopri le differenze tra OLED, IPS e VA per trovare lo schermo ideale per il tuo setup.",
        autore: "Marco Tech",
        data: "10 Maggio 2026",
        immagine: "img/14.png",   // link statico – modificalo qui quando vuoi,
        contenuto: `<p>La scelta del monitor è una delle decisioni più cruciali quando si assembla un nuovo setup...</p>`
    },
    {
        id: 2,
        titolo: "Guida alle Tastiere Meccaniche",
        sottotitolo: "Switch lineari, tattili o clicky? Tutto quello che devi sapere prima dell'acquisto.",
        autore: "Elena Typing",
        data: "28 Aprile 2026",
        immagine: "img/02.png",   // link statico – modificalo qui quando vuoi,
        contenuto: `<p>Abbandonare la tastiera a membrana del portatile per passare a una tastiera meccanica è un punto di non ritorno...</p>`
    },
    {
        id: 3,
        titolo: "Smart Home Starter Kit",
        sottotitolo: "I primi 3 dispositivi essenziali per iniziare ad automatizzare la tua casa facilmente.",
        autore: "Alex Domotica",
        data: "15 Marzo 2026",
        immagine: "img/15.png",   // link statico – modificalo qui quando vuoi,
        contenuto: `<p>L'idea di trasformare la propria casa in una "Smart Home" spesso spaventa...</p>`
    }
];

function renderArticoloDinamico() {
    const contenitore = document.getElementById('dynamic-article');
    if (!contenitore) return;

    const urlParams = new URLSearchParams(window.location.search);
    const idParam = parseInt(urlParams.get('id'));
    
    // Recupera i metadati dall'array 'articoli' (sottotitolo, autore, data, immagine)
    const meta = articoli.find(art => art.id === idParam);
    if (!meta) {
        contenitore.innerHTML = `<p>Articolo non trovato.</p>`;
        return;
    }

    // Contenuto completo da articoliContenuti (definito in articoli.js)
    const fullHtml = articoliContenuti[idParam];
    if (!fullHtml) {
        contenitore.innerHTML = `<p>Contenuto completo non disponibile.</p>`;
        return;
    }

    // Crea un elemento temporaneo per estrarre il testo piano (senza tag HTML)
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = fullHtml;
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Truncate: primi 250 caratteri (modifica a piacere)
    const truncatedText = plainText.substring(0, 250);
    const needsTruncation = plainText.length > 250;

    // Genera la struttura HTML iniziale (con estratto)
    contenitore.innerHTML = `
        <div class="article-header">
            <span class="pill-badge">${meta.data} &bull; Di ${meta.autore}</span>
            <h1 class="text-gradient">${meta.titolo}</h1>
            <p class="article-subtitle">${meta.sottotitolo}</p>
        </div>
        <div class="article-hero-image">
            <img src="${meta.immagine}" alt="${meta.titolo}" style="width:100%; border-radius:12px;">
        </div>
        <div class="article-body content-box" id="article-body">
            <div id="article-short">
                ${needsTruncation ? truncatedText + '…' : plainText}
                ${needsTruncation ? '<span id="read-more-trigger" style="color: var(--accent-color); font-weight: bold; cursor: pointer;"> [leggi tutto]</span>' : ''}
            </div>
            <div id="article-full" style="display: none;">
                ${fullHtml}
            </div>
        </div>
        <div class="text-center mt-3">
            <a href="HomePage.html#guide" class="btn btn-secondary">&larr; Torna alle Guide</a>
        </div>
    `;

    // Gestione del click sui puntini / [leggi tutto]
    const readMoreTrigger = document.getElementById('read-more-trigger');
    if (readMoreTrigger) {
        readMoreTrigger.addEventListener('click', function() {
            document.getElementById('article-short').style.display = 'none';
            document.getElementById('article-full').style.display = 'block';
        });
    }
}


function inizializzaNewsletter() {
    const formNewsletter = document.getElementById('form-newsletter');
    if (!formNewsletter) return;
    formNewsletter.addEventListener('submit', function(e) {
        e.preventDefault();
        const emailInput = formNewsletter.querySelector('input[type="email"]');
        const btnSubmit = formNewsletter.querySelector('button[type="submit"]');
        const originalText = btnSubmit.textContent;
        btnSubmit.textContent = 'Iscrizione in corso...';
        btnSubmit.disabled = true;
        setTimeout(() => {
            alert(`🎉 Iscrizione completata! Benvenuto ${emailInput.value}`);
            emailInput.value = '';
            btnSubmit.textContent = originalText;
            btnSubmit.disabled = false;
        }, 1000);
    });
}

// ==========================================
// 6. DEV TOOLS
// ==========================================
function setupDevTools() {
    const btn = document.createElement('button');
    btn.innerHTML = '⚙️ Reset Carrello & Stock';
    Object.assign(btn.style, { position:'fixed', bottom:'20px', right:'20px', zIndex:9999, padding:'10px 15px', background:'var(--accent-color)', color:'#111', fontWeight:'bold', border:'none', borderRadius:'8px', cursor:'pointer' });
    btn.onclick = () => {
        const pwd = prompt("Password amministratore:");
        if (pwd === "6769" && confirm("Resettare tutto?")) {
            localStorage.removeItem('tech_prodotti');
            localStorage.removeItem('tech_cart');
            location.reload();
        } else if (pwd) alert("Password errata");
    };
    document.body.appendChild(btn);
}

// Filtra i prodotti in base al termine di ricerca (case-insensitive)
function filterProductsByTerm(term) {
    if (!term) return prodotti; // se vuoto, mostra tutti
    const lowerTerm = term.toLowerCase();
    return prodotti.filter(p => {
        const searchable = `${p.nome} ${p.descrizione} ${p.marca} ${p.modello} ${p.caratteristiche} ${p.categoria}`.toLowerCase();
        return searchable.includes(lowerTerm);
    });
}

// Renderizza il catalogo a partire da una lista filtrata di prodotti
function renderFilteredCatalog(filteredProducts) {
    const container = document.getElementById('dynamic-catalog');
    if (!container) return;
    container.innerHTML = '';

    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 3rem;">
                <p style="font-size: 1.2rem;">🔍 Nessun prodotto trovato per "${document.getElementById('search-input')?.value}".</p>
                <p>Prova con un'altra parola chiave.</p>
            </div>`;
        return;
    }

    // Raggruppa per categoria
    const categorie = [...new Set(filteredProducts.map(p => p.categoria))];
    const idCategorie = {
        "Periferiche": "cat-periferiche", "Audio": "cat-audio", "Monitor": "cat-monitor",
        "Accessori": "cat-accessori", "Wearable & VR": "cat-wearable", "Smart Home": "cat-smarthome"
    };

    categorie.forEach(cat => {
        const productsInCat = filteredProducts.filter(p => p.categoria === cat);
        if (productsInCat.length === 0) return;

        const title = document.createElement('h2');
        title.className = 'section-title';
        title.id = idCategorie[cat] || '';
        title.textContent = cat;
        title.style.marginTop = "3rem";
        container.appendChild(title);

        const grid = document.createElement('div');
        grid.className = 'product-grid';

        productsInCat.forEach(p => {
            const esauritoBadge = p.stock === 0 ? `<div style="position:absolute; top:10px; right:10px; background:#ff0055; color:white; padding:4px 8px; border-radius:4px; font-size:0.8rem;">ESAURITO</div>` : '';
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <a href="prodotto.html?id=${p.id}" class="card-link" style="position:relative; display:block;">
                    ${esauritoBadge}
                    <img src="img/${String(p.id).padStart(2, '0')}.png" alt="${p.nome}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200/161e2d/ff0055?text=No+Image';">
                    <div class="card-content">
                        <h3>${p.nome}</h3>
                        <p class="highlight-text">${p.marca} | €${p.prezzo.toFixed(2)}</p>
                        <p style="margin-top:0.5rem; font-size:0.9rem;">${p.descrizione}</p>
                        <button class="btn btn-primary" style="margin-top:1rem; width:100%; pointer-events:none;">${p.stock === 0 ? 'Dettagli (Esaurito)' : 'Vedi Dettagli'}</button>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
        container.appendChild(grid);
    });
}

// Inizializza la ricerca live nella pagina Catalogo
function initCatalogSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return; // non siamo nella pagina Catalogo

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.trim();
        if (term === '') {
            // Ricarica il catalogo completo
            renderCatalogo();
            return;
        }
        const filtered = filterProductsByTerm(term);
        renderFilteredCatalog(filtered);
    });
}








// ==========================================
// 7. INIZIALIZZAZIONE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    renderCatalogo();
    renderProductDetail();
    renderCart();
    renderArticoloDinamico();
    inizializzaNewsletter();
    updateBadge();
    setupDevTools();
	initCatalogSearch(); 
});