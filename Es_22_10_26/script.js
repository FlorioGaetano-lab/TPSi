const urlJSON = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json';

function elaboraDati(numeroGiorni) {
    const tabella = document.getElementById('tabella-covid');
    const sottotitolo = document.getElementById('testo-sottotitolo');
    
    sottotitolo.innerText = `Visualizzazione degli ultimi ${numeroGiorni} giorni registrati`;
    tabella.innerHTML = '<tr><td>Caricamento dati in corso... ⏳</td></tr>';

    const xhr = new XMLHttpRequest();
    xhr.open('GET', urlJSON, true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            const dati = JSON.parse(xhr.responseText);
            const ultimiDati = dati.slice(-numeroGiorni);
            const chiavi = Object.keys(ultimiDati[0]);
            
            let htmlTabella = '<thead><tr>';
            
            // 1. CICLO FOR SINGOLO per le intestazioni della tabella
            for (let i = 0; i < chiavi.length; i++) {
                // chiavi[i] ci dà l'elemento nella posizione 'i'
                let chiavePulita = chiavi[i].replace(/_/g, ' '); 
                htmlTabella += `<th>${chiavePulita}</th>`;
            }
            htmlTabella += '</tr></thead><tbody>';

            // 2. CICLO FOR ESTERNO per scorrere i giorni (le righe)
            for (let i = 0; i < ultimiDati.length; i++) {
                htmlTabella += '<tr>';
                
                // Salviamo il giorno corrente in una variabile per comodità
                let giorno = ultimiDati[i];
                
                // 3. CICLO FOR INTERNO (Annidato) per scorrere le chiavi (le colonne)
                for (let j = 0; j < chiavi.length; j++) {
                    let chiave = chiavi[j];
                    let valore = giorno[chiave]; // Prendiamo il valore corrispondente

                    // Formattazione (esattamente come prima)
                    if (chiave === 'data') {
                        const dataOggetto = new Date(valore);
                        valore = dataOggetto.toLocaleDateString('it-IT');
                    } else if (typeof valore === 'number') {
                        valore = valore.toLocaleString('it-IT');
                    }

                    htmlTabella += `<td>${valore}</td>`;
                }
                
                htmlTabella += '</tr>';
            }
            
            htmlTabella += '</tbody>';
            tabella.innerHTML = htmlTabella;
            
        } else {
            console.error("Errore del server. Status:", xhr.status);
            tabella.innerHTML = `<tr><td style="color: red;">Errore del server.</td></tr>`;
        }
    };

    xhr.onerror = function() {
        console.error("Errore di rete.");
        tabella.innerHTML = `<tr><td style="color: red;">Errore di rete.</td></tr>`;
    };

    xhr.send();
}

// Avvio
elaboraDati(10);

// Ascoltatore per il pulsante
document.getElementById('btn-aggiorna').addEventListener('click', function() {
    const giorniScelti = document.getElementById('input-giorni').value;
    elaboraDati(giorniScelti);
});
