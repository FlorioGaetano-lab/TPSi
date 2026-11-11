// Oggetto globale per salvare i tassi di cambio (es. { USD: 1.08, GBP: 0.85 })
let tassiDiCambio = {};

// Dizionario di supporto per associare i codici ISO ai nomi delle valute in italiano
const nomiValute = {
    USD: "Dollaro Statunitense",
    JPY: "Yen Giapponese",
    BGN: "Lev Bulgaro",
    CZK: "Corona Ceca",
    DKK: "Corona Danese",
    GBP: "Sterlina Britannica",
    HUF: "Fiorino Ungherese",
    PLN: "Zloty Polacco",
    RON: "Leu Rumeno",
    SEK: "Corona Svedese",
    CHF: "Franco Svizzero",
    ISK: "Corona Islandese",
    NOK: "Corona Norvegese",
    TRY: "Lira Turca",
    AUD: "Dollaro Australiano",
    BRL: "Real Brasiliano",
    CAD: "Dollaro Canadese",
    CNY: "Yuan Cinese",
    HKD: "Dollaro Hong Kong",
    IDR: "Rupia Indonesiana",
    ILS: "Nuovo Shekel Israeliano",
    INR: "Rupia Indiana",
    KRW: "Won Sudcoreano",
    MXN: "Peso Messicano",
    MYR: "Ringgit Malese",
    NZD: "Dollaro Neozelandese",
    PHP: "Peso Filippino",
    SGD: "Dollaro Singapore",
    THB: "Baht Thailandese",
    ZAR: "Rand Sudafricano"
};

// Funzione per scaricare il file XML live della BCE tramite il proxy cors.dev
function caricaXML() {
    const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
    
    // Concateniamo il prefisso del proxy prima dell'URL ufficiale della BCE
    const urlProxy = 'https://proxy.cors.dev/' + urlBCE;
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy, true);
    
    xhr.onload = function() {
        if (xhr.status === 200 && xhr.responseText) {
            try {
                // Conversione del testo XML ricevuto in un documento DOM
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Estrazione dei nodi <Cube> contenenti attributi "currency" e "rate"
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nessun nodo valuta trovato nel file XML.");
                }
                
                // Reset delle opzioni temporanee nel menu a tendina
                menuTendina.innerHTML = ''; 
                
                // Popolamento dinamico delle opzioni del menu
                nodiValute.forEach(nodo => {
                    const codiceValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));
                    
                    // Salvataggio del tasso di cambio
                    tassiDiCambio[codiceValuta] = tasso;
                    
                    // Formattazione etichetta visibile (es. "USD (Dollaro Statunitense)")
                    const nomeCompleto = nomiValute[codiceValuta] 
                        ? `${codiceValuta} (${nomiValute[codiceValuta]})` 
                        : codiceValuta;
                    
                    const opzione = document.createElement("option");
                    opzione.value = codiceValuta;
                    opzione.textContent = nomeCompleto;
                    menuTendina.appendChild(opzione);
                });

            } catch (errore) {
                console.error("Errore durante l'analisi dell'XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore formato XML</option>';
            }
        } else {
            console.error("Errore di caricamento HTTP. Status:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore ' + xhr.status + '</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete durante la richiesta HTTP.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di rete</option>';
    };
    
    // Invio effettivo della richiesta
    xhr.send();
}

// Funzione per calcolare la conversione dell'importo inserito
function calcolaConversione() {
    const importo = document.getElementById("importo").value;
    const valutaScelta = document.getElementById("valuta").value;
    const areaRisultato = document.getElementById("risultato");

    // Validazione dell'input dell'utente
    if (importo === "" || isNaN(importo) || importo <= 0) {
        areaRisultato.innerHTML = "<span style='color:red;'>Per favore, inserisci una quantità valida.</span>";
        return;
    }

    if (valutaScelta === "") {
        areaRisultato.innerHTML = "<span style='color:red;'>Seleziona una valuta.</span>";
        return;
    }

    // Calcolo della conversione
    const tasso = tassiDiCambio[valutaScelta];
    const totale = importo * tasso;
    
    // Recupero del nome esteso per l'output finale
    const nomeCompleto = nomiValute[valutaScelta] 
        ? `${valutaScelta} (${nomiValute[valutaScelta]})` 
        : valutaScelta;

    // Generazione dell'output in formato HTML
    areaRisultato.innerHTML = `${importo} EUR = <strong>${totale.toFixed(2)} ${nomeCompleto}</strong>`;
}

// Inizializzazione automatica
caricaXML();
