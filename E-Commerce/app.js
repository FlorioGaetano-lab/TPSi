document.addEventListener("DOMContentLoaded", function() {
    applicaConfigurazione();
    aggiornaBadgeCarrello();

    const btnSalva = document.getElementById('btn-salva-config');
    if (btnSalva) btnSalva.addEventListener('click', salvaConfigurazione);

    if (document.getElementById('griglia-prodotti')) mostraCatalogo();
    if (document.getElementById('dettaglio-prodotto')) mostraDettaglioProdotto();
    if (document.getElementById('corpo-carrello')) mostraCarrello();
});

// ======================== CONFIGURAZIONE ========================
function applicaConfigurazione() {
    const nomeNegozio = localStorage.getItem('nomeNegozio');
    const colorePrincipale = localStorage.getItem('colorePrincipale');
    if (nomeNegozio && document.getElementById('store-title'))
        document.getElementById('store-title').textContent = nomeNegozio;
    if (colorePrincipale)
        document.documentElement.style.setProperty('--main-color', colorePrincipale);
}

function salvaConfigurazione() {
    const storeName = document.getElementById('storeName').value;
    const mainColor = document.getElementById('mainColor').value;
    const fileInput = document.getElementById('csvFile');
    const statusMessage = document.getElementById('statusMessage');

    if (!storeName || !fileInput.files[0]) {
        alert("Per favore, inserisci il nome del negozio e seleziona un file CSV.");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const prodotti = navigaCsv(e.target.result);
        localStorage.setItem('nomeNegozio', storeName);
        localStorage.setItem('colorePrincipale', mainColor);
        localStorage.setItem('catalogoProdotti', JSON.stringify(prodotti));
        statusMessage.textContent = "Configurazione salvata! Reindirizzamento al catalogo...";
        statusMessage.className = "status success";
        setTimeout(() => window.location.href = "index.html", 1500);
    };
    reader.readAsText(file);
}

function navigaCsv(testo) {
    const righe = testo.split(/\r?\n/);
    const prodotti = [];
    for (let i = 1; i < righe.length; i++) {
        const riga = righe[i].trim();
        if (riga === '') continue;
        const colonne = riga.split(',');
        if (colonne.length < 5) continue;
        const prezzo = parseFloat(colonne[4].trim());
        if (isNaN(prezzo)) continue;
        prodotti.push({
            id: i,
            marca: colonne[0].trim(),
            modello: colonne[1].trim(),
            descrizione: colonne[2].trim(),
            immagine: colonne[3].trim(),
            prezzo: prezzo
        });
    }
    console.log("Prodotti parsati:", prodotti.length);
    return prodotti;
}

function ottieniProdotti() {
    return JSON.parse(localStorage.getItem('catalogoProdotti') || '[]');
}

// ======================== CARRELLO ROBUSTO ========================
function getCarrello() {
    const raw = localStorage.getItem('carrelloSpesa');
    if (!raw) return [];
    try {
        let carrello = JSON.parse(raw);
        // Conversione automatica dal vecchio formato (solo prodotti)
        if (carrello.length > 0 && !carrello[0].hasOwnProperty('prodotto')) {
            carrello = carrello.map(prod => ({ prodotto: prod, quantita: 1 }));
            localStorage.setItem('carrelloSpesa', JSON.stringify(carrello));
        }
        // Filtra eventuali oggetti corrotti
        return carrello.filter(item => item && item.prodotto && typeof item.quantita === 'number');
    } catch(e) {
        return [];
    }
}

function setCarrello(carrello) {
    localStorage.setItem('carrelloSpesa', JSON.stringify(carrello));
    aggiornaBadgeCarrello();
}

function aggiornaBadgeCarrello() {
    const carrello = getCarrello();
    const totalePezzi = carrello.reduce((sum, item) => sum + item.quantita, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = totalePezzi;
}

function aggiungiAlCarrello(idProdotto, quantita = 1) {
    console.log("aggiungiAlCarrello chiamato", idProdotto, quantita);
    const prodotti = ottieniProdotti();
    const prodotto = prodotti.find(p => p.id === idProdotto);
    if (!prodotto) {
        console.error("Prodotto non trovato", idProdotto);
        alert("Errore: prodotto non trovato.");
        return;
    }
    let carrello = getCarrello();
    const esistente = carrello.find(item => item.prodotto.id === idProdotto);
    if (esistente) {
        esistente.quantita += quantita;
    } else {
        carrello.push({ prodotto: prodotto, quantita: quantita });
    }
    setCarrello(carrello);
    alert(`Aggiunto ${quantita} × ${prodotto.modello} al carrello.`);
}

function rimuoviProdottoCarrello(idProdotto) {
    let carrello = getCarrello();
    carrello = carrello.filter(item => item.prodotto.id !== idProdotto);
    setCarrello(carrello);
    if (document.getElementById('corpo-carrello')) mostraCarrello();
}

function modificaQuantita(idProdotto, delta) {
    let carrello = getCarrello();
    const item = carrello.find(i => i.prodotto.id === idProdotto);
    if (item) {
        item.quantita += delta;
        if (item.quantita <= 0) {
            carrello = carrello.filter(i => i.prodotto.id !== idProdotto);
        }
        setCarrello(carrello);
        if (document.getElementById('corpo-carrello')) mostraCarrello();
    }
}

// ======================== CATALOGO ========================
function mostraCatalogo() {
    const prodotti = ottieniProdotti();
    const griglia = document.getElementById('griglia-prodotti');
    if (!prodotti.length) {
        griglia.innerHTML = `<p style="text-align:center;">Nessun prodotto. Vai su <a href="ini.html">ini.html</a> per caricare un CSV.</p>`;
        return;
    }
    let cards = '';
    prodotti.forEach(p => {
        cards += `
            <div class="product-card">
                <img src="${p.immagine}" class="product-image" onerror="this.src='https://placehold.co/300x200?text=No+Image'">
                <div class="product-info">
                    <p class="product-brand">${p.marca}</p>
                    <h3 class="product-model">${p.modello}</h3>
                    <p class="product-price">€ ${p.prezzo.toFixed(2)}</p>
                    <a href="prodotto.html?id=${p.id}" class="btn">Vedi Dettagli</a>
                </div>
            </div>
        `;
    });
    griglia.innerHTML = cards;
}

// ======================== DETTAGLIO PRODOTTO ========================
function mostraDettaglioProdotto() {
    const urlParams = new URLSearchParams(window.location.search);
    const idProdotto = parseInt(urlParams.get('id'));
    const contenitore = document.getElementById('dettaglio-prodotto');

    if (!idProdotto) {
        contenitore.innerHTML = "<h2>Errore: nessun prodotto selezionato.</h2>";
        return;
    }

    const prodotti = ottieniProdotti();
    const prodotto = prodotti.find(p => p.id === idProdotto);
    if (!prodotto) {
        contenitore.innerHTML = "<h2>Errore: prodotto non trovato.</h2>";
        return;
    }

    contenitore.innerHTML = `
        <div class="dettaglio-layout">
            <div class="dettaglio-immagine">
                <img src="${prodotto.immagine}" onerror="this.src='https://placehold.co/400x400?text=No+Image'">
            </div>
            <div class="dettaglio-testo">
                <p class="product-brand">${prodotto.marca}</p>
                <h2>${prodotto.modello}</h2>
                <p class="product-price">€ ${prodotto.prezzo.toFixed(2)}</p>
                <div class="dettaglio-descrizione"><p>${prodotto.descrizione}</p></div>
                <div class="quantita-selector">
                    <button id="qta-meno" class="btn">-</button>
                    <span id="qta-valore">1</span>
                    <button id="qta-piu" class="btn">+</button>
                    <span>Subtotale: € <span id="subtotale">${prodotto.prezzo.toFixed(2)}</span></span>
                </div>
                <button id="btn-aggiungi-carrello" class="btn">Aggiungi al Carrello 🛒</button>
                <a href="index.html" class="btn" style="background:#95a5a6;">Torna al Catalogo</a>
            </div>
        </div>
    `;

    let qta = 1;
    const spanQta = document.getElementById('qta-valore');
    const spanSub = document.getElementById('subtotale');
    const prezzoUnit = prodotto.prezzo;

    const aggiorna = () => {
        spanQta.textContent = qta;
        spanSub.textContent = (prezzoUnit * qta).toFixed(2);
    };

    document.getElementById('qta-meno').addEventListener('click', () => {
        if (qta > 1) qta--;
        aggiorna();
    });
    document.getElementById('qta-piu').addEventListener('click', () => {
        qta++;
        aggiorna();
    });
    document.getElementById('btn-aggiungi-carrello').addEventListener('click', () => {
        aggiungiAlCarrello(prodotto.id, qta);
    });
}

// ======================== PAGINA CARRELLO ========================
function mostraCarrello() {
    const carrello = getCarrello();
    const corpo = document.getElementById('corpo-carrello');
    const totaleSpan = document.getElementById('totale-prezzo');

    if (!carrello.length) {
        corpo.innerHTML = '<tr><td colspan="5">Carrello vuoto</td></tr>';
        totaleSpan.textContent = '0.00';
        return;
    }

    let html = '';
    let totale = 0;
    carrello.forEach(item => {
        const p = item.prodotto;
        const subtot = p.prezzo * item.quantita;
        totale += subtot;
        html += `
            <tr>
                <td><strong>${p.marca}</strong> ${p.modello}</td>
                <td>€ ${p.prezzo.toFixed(2)}</td>
                <td>
                    <button class="btn" style="width:auto; padding:5px 10px;" onclick="modificaQuantita(${p.id}, -1)">-</button>
                    <span style="margin:0 10px;">${item.quantita}</span>
                    <button class="btn" style="width:auto; padding:5px 10px;" onclick="modificaQuantita(${p.id}, 1)">+</button>
                </td>
                <td>€ ${subtot.toFixed(2)}</td>
                <td><button class="btn btn-danger" onclick="rimuoviProdottoCarrello(${p.id})">Rimuovi</button></td>
            </tr>
        `;
    });
    corpo.innerHTML = html;
    totaleSpan.textContent = totale.toFixed(2);
}

// ======================== PDF ========================
function generaPDF() {
    const carrello = getCarrello();
    if (!carrello.length) {
        alert("Carrello vuoto.");
        return;
    }
    if (!confirm("Confermi l'acquisto? Verrà generato il PDF e il carrello sarà svuotato.")) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const nomeNegozio = localStorage.getItem('nomeNegozio') || 'Il Mio Negozio';

    doc.setFontSize(22);
    doc.text(nomeNegozio + " - Ricevuta d'Acquisto", 20, 20);
    doc.setFontSize(12);
    let y = 40;
    doc.text("Prodotto", 20, y);
    doc.text("Qtà", 100, y);
    doc.text("Prezzo", 150, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    let totale = 0;
    for (const item of carrello) {
        const p = item.prodotto;
        const subtot = p.prezzo * item.quantita;
        doc.text(`${p.marca} ${p.modello}`, 20, y);
        doc.text(item.quantita.toString(), 100, y);
        doc.text(`€ ${subtot.toFixed(2)}`, 150, y);
        totale += subtot;
        y += 10;
        if (y > 270) { doc.addPage(); y = 20; }
    }

    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(16);
    doc.text(`Totale Pagato: € ${totale.toFixed(2)}`, 110, y);
    doc.save("ricevuta_acquisto.pdf");
    setCarrello([]);
    if (document.getElementById('corpo-carrello')) mostraCarrello();
    alert("Grazie per l'acquisto!");
}
