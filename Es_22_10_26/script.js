// Definiamo l'URL del JSON come costante
const urlJSON = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json';

// Creiamo la funzione asincrona per scaricare ed elaborare i dati
async function elaboraDati() {
    try {
        // 1. SCARICHIAMO I DATI
        const risposta = await fetch(urlJSON);
        const dati = await risposta.json();

        // Prendiamo gli ultimi 10 giorni usando slice
        const ultimiDati = dati.slice(-10);

        // 2. PREPARAZIONE DELLA TABELLA E DELLE COLONNE
        const tabella = document.getElementById('tabella-covid');
        
        // Estraiamo i nomi delle colonne dal primo elemento usando Object.keys()
        const chiavi = Object.keys(ultimiDati[0]);

        // Creiamo la riga delle intestazioni
        let htmlTabella = '<thead><tr>';
        chiavi.forEach(chiave => {
            // Sostituiamo gli underscore con spazi per renderlo ancora più bello da leggere
            let chiavePulita = chiave.replace(/_/g, ' '); 
            htmlTabella += `<th>${chiavePulita}</th>`;
        });
        htmlTabella += '</tr></thead>';

        // 3. INSERIMENTO DEI DATI
        htmlTabella += '<tbody>';
        ultimiDati.forEach(giorno => {
            htmlTabella += '<tr>';
            
            // Per ogni colonna, inseriamo il valore corrispondente
            chiavi.forEach(chiave => {
                htmlTabella += `<td>${giorno[chiave]}</td>`;
            });
            
            htmlTabella += '</tr>';
        });
        htmlTabella += '</tbody>';

        // 4. AGGIORNAMENTO DELLA PAGINA
        tabella.innerHTML = htmlTabella;

    } catch (errore) {
        // Gestione degli errori
        console.error("Errore durante il recupero del file JSON:", errore);
        document.getElementById('tabella-covid').innerHTML = 
            `<tr><td style="color: red;">Impossibile caricare i dati. Riprova più tardi.</td></tr>`;
    }
}

// Chiamiamo la funzione per farla partire
elaboraDati();
