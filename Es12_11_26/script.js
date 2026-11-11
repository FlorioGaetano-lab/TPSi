// Oggetto globale per memorizzare i tassi di cambio
let tassiDiCambio = {};

// Dizionario di supporto per associare i codici ISO ai nomi estesi delle valute in italiano
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

// Funzione per caricare e leggere il file XML locale
function caricaXML() {
    const fileLocale = 'eurofxref-daily.xml';
    const xhr = new XMLHttpRequest();
    
    xhr.open("GET", fileLocale, true);
    
    xhr.onload = function() {
        if (xhr.status === 200 || xhr.status === 0) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nessun nodo valuta trovato nell'XML.");
                }
                
                menuTendina.innerHTML = ''; 
                
                nodiValute.forEach(nodo => {
                    const codiceValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));
                    
                    // Salviamo il tasso numerico associato al codice (es. tassiDiCambio["USD"] = 1.08)
                    tassiDiCambio[codiceValuta] = tasso;
                    
                    // Componiamo la stringa visibile: se la valuta è presente nel dizionario mostriamo "USD (Dollaro Statunitense)", altrimenti solo "USD"
                    const nomeCompleto = nomiValute[codiceValuta] 
                        ? `${codiceValuta} (${nomiValute[codiceValuta]})` 
                        : codiceValuta;
                    
                    // Creazione del tag <option>
                    const opzione = document.createElement("option");
                    opzione.value = codiceValuta;
                    opzione.textContent = nomeCompleto;
                    menuTendina.appendChild(opzione);
                });

            } catch (errore) {
                console.error("Errore nell'analisi del file XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore dati XML</option>';
            }
        } else {
            console.error("File non trovato o errore di caricamento. Status:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore ' + xhr.status + '</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete o blocco locale.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di caricamento</option>';
    };
    
    xhr.send();
}

// Funzione per calcolare e mostrare la conversione
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

    // Calcolo della conversione
    const tasso = tassiDiCambio[valutaScelta];
    const totale = importo * tasso;
    
    // Recupero del nome esteso per la visualizzazione del risultato
    const nomeCompleto = nomiValute[valutaScelta] 
        ? `${valutaScelta} (${nomiValute[valutaScelta]})` 
        : valutaScelta;

    // Stampa del risultato formattato in HTML
    areaRisultato.innerHTML = `${importo} EUR = <strong>${totale.toFixed(2)} ${nomeCompleto}</strong>`;
}

// Esecuzione immediata della funzione di carica XML
caricaXML();
