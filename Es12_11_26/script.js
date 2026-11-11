let tassiDiCambio = {};

function caricaXML() {

    const nomeFile = 'eurofxref-daily.xml';
    
    const xhr = new XMLHttpRequest();
    
    xhr.open("GET", nomeFile, true);
    
    xhr.onload = function() {
        //A volte da codice 0 quindi inserisco or status=0
        if (xhr.status === 200 || xhr.status === 0) {
            try {
     
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
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
                console.error("Si è verificato un errore durante la lettura dell'XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore di lettura file</option>';
            }
        } else {
            console.error("Impossibile trovare il file. Status:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">File non trovato</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di accesso al file locale. Potrebbe essere un blocco di sicurezza del browser.");
        document.getElementById("valuta").innerHTML = '<option value="">Blocco di sicurezza</option>';
    };
    
    xhr.send();
}

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

// Avvia la funzione principale
caricaXML();
