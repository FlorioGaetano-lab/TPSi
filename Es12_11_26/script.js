let tassiDiCambio = {};

// Funzione per caricare il file XML con XMLHttpRequest e il servizio AllOrigins /raw
function caricaXML() {
    const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
    
    // L'endpoint /raw di AllOrigins gestisce la codifica URI e restituisce direttamente l'XML
    const urlProxy = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(urlBCE);
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Estrazione dei nodi contenenti valuta e tasso
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nodi valuta non trovati nel documento XML.");
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
            } catch (errore) {
                console.error("Errore nell'analisi del file XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore formato XML</option>';
            }
        } else {
            console.error("Richiesta fallita. Codice di stato HTTP:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore ' + xhr.status + '</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete durante la trasmissione della richiesta.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di rete</option>';
    };
    
    xhr.send();
}

// Funzione per eseguire la conversione in base alla quantità inserita
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

// Inizializzazione della richiesta al caricamento dello script
caricaXML();
