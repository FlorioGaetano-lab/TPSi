let tassiDiCambio = {};

function caricaXML() {
    const urlProxy = 'https://api.allorigins.win/get?url=';
    const urlBCE = encodeURIComponent('http://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml');
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy + urlBCE, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const dati = JSON.parse(xhr.responseText);
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(dati.contents, "text/xml");
                
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
                console.error("Si è verificato un errore:", errore);
                document.getElementById("valuta").innerHTML = '<option value="">Errore nei dati</option>';
            }
        } else {
            console.error("Errore del server. Status:", xhr.status);
            document.getElementById("valuta").innerHTML = '<option value="">Errore di connessione</option>';
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete durante la richiesta.");
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
