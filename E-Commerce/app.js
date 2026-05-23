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
    const descrizioneNegozio = localStorage.getItem('descrizioneNegozio');
    const colorePrincipale = localStorage.getItem('colorePrincipale');

    if (nomeNegozio && document.getElementById('store-title'))
        document.getElementById('store-title').textContent = nomeNegozio;
        
    if (descrizioneNegozio && document.getElementById('store-desc'))
        document.getElementById('store-desc').textContent = descrizioneNegozio;

    if (colorePrincipale)
        document.documentElement.style.setProperty('--main-color', colorePrincipale);
}

function salvaConfigurazione() {
    const storeName = document.getElementById('storeName').value;
    const storeDesc = document.getElementById('storeDesc').value;
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
        const testoCsv = e.target.result;
        const prodotti = navigaCsv(testoCsv);

        localStorage.setItem('nomeNegozio', storeName);
        localStorage.setItem('descrizioneNegozio', storeDesc);
        localStorage.setItem('colorePrincipale', mainColor);
        localStorage.setItem('catalogoProdotti', JSON.stringify(prodotti));

        // Mostra messaggio di successo grafico
        statusMessage.textContent = "Configurazione salvata con successo! Reindirizzamento al catalogo...";
        statusMessage.className = "status success";

        // 🌟 CORREZIONE: Reindirizzamento automatico alla index dopo 1.5 secondi
        setTimeout(function() {
            window.location.href = "index.html";
        }, 1500);
    };

    reader.readAsText(file);
}

function navigaCsv(testo) {
    const righe = testo.split('\n');
    const prodotti = [];
    for (let i = 1; i < righe.length; i++) {
        const riga = righe[i].trim();
        if (riga === '') continue;
        const colonne = riga.split(',');
        prodotti.push({
            id: i,
            marca: colonne[0] ? colonne[0].trim() : '',
            modello: colonne[1] ? colonne[1].trim() : '',
            descrizione: colonne[2] ? colonne[2].trim() : '',
            immagine: colonne[3] ? colonne[3].trim() : '',
            prezzo: colonne[4] ? parseFloat(colonne[4].trim()) : 0
        });
    }
    return prodotti;
}

// ======================== CATALOGO ========================
function mostraCatalogo() {
    const prodottiJson = localStorage.getItem('catalogoProdotti');
    const prodotti = prodottiJson ? JSON.parse(prodottiJson) : [];
    const griglia = document.getElementById('griglia-prodotti');

    if (!prodotti.length) {
        griglia.innerHTML = `<p style="text-align:center; width:100%;">Nessun prodotto trovato. Vai su ini.html per caricare un file CSV.</p>`;
        return;
    }

    griglia.innerHTML = '';
    prodotti.forEach(prodotto => {
        griglia.innerHTML += `
            <div class="product-card">
                <img src="${prodotto.immagine}" alt="${prodotto.modello}" class="product-image">
                <div class="product-info">
                    <p class="product-brand">${prodotto.marca}</p>
                    <h3 class="product-model">${prodotto.modello}</h3>
                    <p class="product-price">€ ${prodotto.prezzo.toFixed(2)}</p>
                    <a href="prodotto.html?id=${prodotto.id}" class="btn">Vedi Dettagli</a>
                </div>
            </div>
        `;
    });
}

// ======================== DETTAGLIO PRODOTTO ========================
let quantitaCorrente = 1;

function mostraDettaglioProdotto() {
    const parametriUrl = new URLSearchParams(window.location.search);
    const idProdotto = parseInt(parametriUrl.get('id'));
    const prodottiJson = localStorage.getItem('catalogoProdotti');
    const prodotti = prodottiJson ? JSON.parse(prodottiJson) : [];
    const prodotto = prodotti.find(p => p.id === idProdotto);
    const contenitore = document.getElementById('dettaglio-prodotto');

    if (!prodotto) {
        contenitore.innerHTML = "<h2>Prodotto non trovato.</h2>";
        return;
    }

    contenitore.innerHTML = `
        <div class="dettaglio-layout">
            <div class="dettaglio-immagine">
                <img src="${prodotto.immagine}" alt="${prodotto.modello}">
            </div>
            <div class="dettaglio-testo">
                <p class="product-brand">${prodotto.marca}</p>
                <h2>${prodotto.modello}</h2>
                <p class="product-price">€ ${prodotto.prezzo.toFixed(2)}</p>
                <div class="dettaglio-descrizione"><p>${prodotto.descrizione}</p></div>
                
                <div class="quantita-selector">
                    <button class="btn" onclick="cambiaQuantita(-1)">-</button>
                    <span id="quantita-valore">1</span>
                    <button class="btn" onclick="cambiaQuantita(1)">+</button>
                </div>

                <button onclick="aggiungiAlCarrello(${prodotto.id})" class="btn" style="margin-bottom: 15px;">Aggiungi al Carrello 🛒</button>
                <a href="index.html" class="btn" style="background-color: #95a5a6;">Torna al Catalogo</a>
            </div>
        </div>
    `;
}

function cambiaQuantita(valore) {
    quantitaCorrente += valore;
    if (quantitaCorrente < 1) quantitaCorrente = 1;
    document.getElementById('quantita-valore').textContent = quantitaCorrente;
}

// ======================== LOGICA CARRELLO ========================
function getCarrello() {
    const c = localStorage.getItem('carrelloSpesa');
    return c ? JSON.parse(c) : [];
}

function salvaCarrello(c) {
    localStorage.setItem('carrelloSpesa', JSON.stringify(c));
}

function aggiungiAlCarrello(idProdotto) {
    const prodottiJson = localStorage.getItem('catalogoProdotti');
    const prodotti = prodottiJson ? JSON.parse(prodottiJson) : [];
    const prodotto = prodotti.find(p => p.id === idProdotto);

    if (!prodotto) return;

    let carrello = getCarrello();
    let itemEsistente = carrello.find(item => item.prodotto.id === idProdotto);

    if (itemEsistente) {
        itemEsistente.quantita += quantitaCorrente;
    } else {
        carrello.push({ prodotto: prodotto, quantita: quantitaCorrente });
    }

    salvaCarrello(carrello);
    aggiornaBadgeCarrello();
    alert(`${quantitaCorrente}x ${prodotto.modello} aggiunti al carrello!`);
    
    quantitaCorrente = 1;
    if(document.getElementById('quantita-valore')) {
        document.getElementById('quantita-valore').textContent = 1;
    }
}

function aggiornaBadgeCarrello() {
    const carrello = getCarrello();
    const totalePezzi = carrello.reduce((acc, item) => acc + item.quantita, 0);
    const badge = document.getElementById('cart-count');
    if (badge) badge.textContent = totalePezzi;
}

function mostraCarrello() {
    const carrello = getCarrello();
    const corpo = document.getElementById('corpo-carrello');
    const totaleSpan = document.getElementById('totale-prezzo');

    corpo.innerHTML = '';
    let totale = 0;

    if (!carrello.length) {
        corpo.innerHTML = '<tr><td colspan="3" style="text-align:center;">Il tuo carrello è vuoto.</td></tr>';
        totaleSpan.textContent = '0.00';
        return;
    }

    carrello.forEach((item, index) => {
        const subtot = item.prodotto.prezzo * item.quantita;
        totale += subtot;
        corpo.innerHTML += `
            <tr>
                <td><strong>${item.prodotto.marca}</strong> - ${item.prodotto.modello} (x${item.quantita})</td>
                <td>€ ${subtot.toFixed(2)}</td>
                <td>
                    <button onclick="rimuoviDaCarrello(${index})" class="btn btn-danger" style="padding: 5px 10px; width: auto; font-size: 14px;">Rimuovi</button>
                </td>
            </tr>
        `;
    });
    totaleSpan.textContent = totale.toFixed(2);
}

function rimuoviDaCarrello(index) {
    let carrello = getCarrello();
    carrello.splice(index, 1);
    salvaCarrello(carrello);
    mostraCarrello();
    aggiornaBadgeCarrello();
}

// ======================== EXPORT GENERAZIONE PDF ========================
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
    doc.text("Qtà", 120, y);
    doc.text("Prezzo", 160, y);
    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    let totale = 0;
    for (const item of carrello) {
        const p = item.prodotto;
        const subtot = p.prezzo * item.quantita;
        doc.text(`${p.marca} ${p.modello}`, 20, y);
        doc.text(`${item.quantita}`, 120, y);
        doc.text(`€ ${subtot.toFixed(2)}`, 160, y);
        totale += subtot;
        y += 10;
    }

    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(16);
    doc.text("Totale Pagato: € " + totale.toFixed(2), 110, y);

    doc.save("ricevuta_acquisto.pdf");
    localStorage.removeItem('carrelloSpesa');
    mostraCarrello();
    aggiornaBadgeCarrello();
    alert("Grazie per l'acquisto! Il PDF è stato generato correttamente.");
}
