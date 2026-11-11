// Oggetto per salvare i tassi di cambio (es. { USD: 1.08, GBP: 0.85 })
let tassiDiCambio = {};

// Indirizzo ufficiale del file XML della Banca Centrale Europea
const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';

// Elenco dei proxy CORS pubblici da tentare in sequenza
const listaProxy = [
    'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent(urlBCE),
    'https://corsproxy.io/?' + urlBCE,
    'https://api.allorigins.win/raw?url=' + encodeURIComponent(urlBCE)
];

// Funzione ricorsiva per caricare l'XML tentando i proxy in ordine
function caricaXML(indiceProxy = 0) {
    // Se tutti i proxy falliscono, si mostra il messaggio di errore finale
    if (indiceProxy >= listaProxy.length) {
        console.error("Tutti i proxy disponibili hanno fallito il caricamento.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di connessione</option>';
        return;
    }

    const urlCorrente = listaProxy[indiceProxy];
    console.log(`Tentativo ${indiceProxy + 1} di ${listaProxy.length} tramite:`, urlCorrente);

    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlCorrente, true);

    xhr.onload = function() {
        // Verifichiamo che il server risponda con codice 200 OK e che ci sia del testo
        if (xhr.status === 200 && xhr.responseText) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Selezioniamo i nodi XML della BCE contenenti le valute
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Formato XML non valido o nodi valuta assenti.");
                }
                
                menuTendina.innerHTML = ''; 
                
                nodiValute.forEach(nodo => {
                    const nomeValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));
                    
                    tassiDiCambio[nomeValuta] = tasso;
                    
                    const opzione = document.createElement("option");
                    opzione.value = nomeValuta;
                    opzione.textContent = nomeValuta;
                    menuTendina.appendChild(opzione);
                });

                console.log("Tassi di cambio caricati con successo con il proxy", indiceProxy + 1);

            } catch (errore) {
                console.warn(`Proxy ${indiceProxy + 1} ha restituito un XML non valido. Passo al successivo...`, errore);
                caricaXML(indiceProxy + 1);
            }
        } else {
            console.warn(`Proxy ${indiceProxy + 1} ha risposto con errore HTTP ${xhr.status}. Passo al successivo...`);
            caricaXML(indiceProxy + 1);
        }
    };

    xhr.onerror = function() {
        console.warn(`Errore di rete con il proxy ${indiceProxy + 1}. Passo al successivo...`);
        caricaXML(indiceProxy + 1);
    };
    
    xhr.send();
}

// Funzione per eseguire la conversione numerica dall'importo inserito
function calcolaConversione() {
    const importo = document.getElementById("importo").value;
    const valutaScelta = document.getElementById("valuta").value;
    const areaRisultato = document.getElementById("risultato");

    if (importo === "" || isNaN(importo) || importo <= 0) {
        areaRisultato.innerHTML = "<span style='color:red;'>Per favore, inserisci una quantità valida.</span>";
        return;
    }

    if (valutaScelta === "") {
        areaRisultato.innerHTML = "<span style='color:red;'>Seleziona una valuta.</span>";
        return;
    }

    const tasso = tassiDiCambio[valutaScelta];
    const totale = importo * tasso;

    areaRisultato.innerHTML = `${importo} EUR = <strong>${totale.toFixed(2)} ${valutaScelta}</strong>`;
}

// Avvio della procedura partendo dal primo proxy (indice 0)
caricaXML();
