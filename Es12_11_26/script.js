let tassiDiCambio = {};

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

function caricaXML() {
    const urlBCE = 'https://www.ecb.europa.eu/stats/eurofxref/eurofxref-daily.xml';
    
    const urlProxy = 'https://proxy.cors.dev/' + urlBCE;
    
    const xhr = new XMLHttpRequest();
    xhr.open("GET", urlProxy, true);
    
    xhr.onload = function() {
        if (xhr.status === 200 && xhr.responseText) {
            try {

                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");
                
                const nodiValute = xmlDoc.querySelectorAll("Cube[currency]");
                const menuTendina = document.getElementById("valuta");
                
                if (nodiValute.length === 0) {
                    throw new Error("Nessun nodo valuta trovato nel file XML.");
                }
                
                menuTendina.innerHTML = ''; 
 
                nodiValute.forEach(nodo => {
                    const codiceValuta = nodo.getAttribute("currency");
                    const tasso = parseFloat(nodo.getAttribute("rate"));

                    tassiDiCambio[codiceValuta] = tasso;

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

    const nomeCompleto = nomiValute[valutaScelta] 
        ? `${valutaScelta} (${nomiValute[valutaScelta]})` 
        : valutaScelta;

    areaRisultato.innerHTML = `${importo} EUR = <strong>${totale.toFixed(2)} ${nomeCompleto}</strong>`;
}


caricaXML();
