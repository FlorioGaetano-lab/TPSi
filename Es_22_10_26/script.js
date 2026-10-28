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
            let htmlTabella = '<tr>';
            for (let i = 0; i < chiavi.length; i++) {
                let chiavePulita = chiavi[i].replace(/_/g, ' '); 
                htmlTabella += `<th>${chiavePulita}</th>`;
            }

            htmlTabella += '</tr>';

            for (let i = 0; i < ultimiDati.length; i++) {
                htmlTabella += '<tr>';
                
                let giorno = ultimiDati[i];
                

                for (let j = 0; j < chiavi.length; j++) {
                    let chiave = chiavi[j];
                    let valore = giorno[chiave];
            
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

elaboraDati(10);


document.getElementById('btn-aggiorna').addEventListener('click', function() {
    const giorniScelti = document.getElementById('input-giorni').value;
    elaboraDati(giorniScelti);
});
