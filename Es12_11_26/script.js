// Oggetto per memorizzare la mappa valuta -> tasso di cambio
let tassiDiCambio = {};

// Funzione principale per scaricare e analizzare l'XML dalla BCE tramite proxy unico
function caricaXML() {
    const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
    
    // Proxy AllOrigins /raw
    const urlProxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(urlBCE);
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy, true);
    
    xhr.onload = function() {
        if (xhr.status === 200 && xhr.responseText) {
            try {
                // Parsing della stringa di testo XML
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Estrazione dei nodi contenenti attributi currency e rate
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nessun nodo valuta trovato nell'XML.");
                }
                
                // Pulisce il messaggio di caricamento nel menu a tendina
                menuTendina.innerHTML = ''; 
                
                // Popola il menu a tendina e salva i tassi nel dizionario
                nodiValute.forEach(nodo => {
                    const nomeValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));
                    
                    tassiDiCambio[nomeValuta] = tasso;
                    
                    const opzione = document.createElement("option");
                    opzione.value = nomeValuta;
                    opzione.textContent = nomeValuta;
                    menuTendina.appendChild(opzione);
                });

            } catch (errore) {
                console.error("Errore durante l'analisi del file XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore formato XML</option>';
            }
        } else {
            console.error("Errore HTTP durante il caricamento:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore ' + xhr.status + '</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete durante la richiesta HTTP.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di rete</option>';
    };
    
    xhr.send();
}

// Funzione per calcolare la conversione dell'importo inserito
function calcolaConversione() {
    const importo = document.getElementById("importo").value;
    const valutaScelta = document.getElementById("valuta").value;
    const areaRisultato = document.getElementById("risultato");

    // Validazione input utente
    if (importo === "" || isNaN(importo) || importo <= 0) {
        areaRisultato.innerHTML = "<span style='color:red;'>Per favore, inserisci una quantità valida.</span>";
        return;
    }

    if (valutaScelta === "") {
        areaRisultato.innerHTML = "<span style='color:red;'>Seleziona una valuta.</span>";
        return;
    }

    // Calcolo e resa in HTML del risultato
    const tasso = tassiDiCambio[valutaScelta];
    const totale = importo * tasso;

    areaRisultato.innerHTML = `${importo} EUR = <strong>${totale.toFixed(2)} ${valutaScelta}</strong>`;
}

// Esecuzione immediata della funzione
caricaXML();
