let tassiDiCambio = {};

// Funzione per caricare il file XML con XMLHttpRequest e il proxy corsproxy.io
function caricaXML() {
    // URL ufficiale della BCE in HTTPS
    const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
    
    // Inoltriamo la richiesta tramite corsproxy.io
    const urlProxy = 'https://corsproxy.io/?' + encodeURIComponent(urlBCE);
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                // corsproxy.io restituisce direttamente il contenuto XML originale
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Selezione di tutti i nodi valuta <Cube currency="..." rate="...">
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
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
            } catch (errore) {
                console.error("Errore nell'elaborazione del file XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore formato XML</option>';
            }
        } else {
            console.error("Impossibile contattare il server. Status HTTP:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore di connessione</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete durante la richiesta HTTP.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di rete</option>';
    };
    
    xhr.send();
}

// Funzione per effettuare il calcolo della conversione
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

// Avvio della procedura di caricamento dei tassi
caricaXML();
