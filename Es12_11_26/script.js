let tassiDiCambio = {};

function caricaXML() {
    
    const fileLocale = 'eurofxref-daily.xml';
    
    const xhr = new XMLHttpRequest();

    xhr.open("GET", fileLocale, true);
    

    xhr.onload = function() {

        if (xhr.status === 200) {
            try {
                // Conversione del testo XML in un documento leggibile dal browser
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                // Selezione di tutti i nodi <Cube> che possiedono l'attributo currency
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nessun nodo valuta trovato all'interno del file XML.");
                }
                

                menuTendina.innerHTML = ''; 
                
                nodiValute.forEach(nodo => {
                    const nomeValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));
                    
                    // Salvataggio nel nostro dizionario
                    tassiDiCambio[nomeValuta] = tasso;
                    
                    // Creazione del tag <option> per il menu a tendina
                    const opzione = document.createElement("option");
                    opzione.value = nomeValuta;
                    opzione.textContent = nomeValuta;
                    menuTendina.appendChild(opzione);
                });

            } catch (errore) {
                console.error("Errore nell'analisi del file XML:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore dati XML</option>';
            }
        } else {
            console.error("File XML non trovato o errore server. Codice HTTP:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore ' + xhr.status + '</option>';
        }
    };


    xhr.onerror = function() {
        console.error("Errore di rete durante la richiesta del file.");
        document.getElementById("valuta").innerHTML = '<option value="">Errore di rete</option>';
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

caricaXML();
