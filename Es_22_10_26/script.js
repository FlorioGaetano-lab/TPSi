const urlJSON = 'https://raw.githubusercontent.com/pcm-dpc/COVID-19/master/dati-json/dpc-covid19-ita-andamento-nazionale.json';

async function elaboraDati(numeroGiorni) {
    const tabella = document.getElementById('tabella-covid');
    const sottotitolo = document.getElementById('testo-sottotitolo');

    sottotitolo.innerText = `Visualizzazione degli ultimi ${numeroGiorni} giorni registrati`;
    
    tabella.innerHTML = '<tr><td>Caricamento dati in corso... ⏳</td></tr>';

    try {
        const risposta = await fetch(urlJSON);
        const dati = await risposta.json();
        
        const ultimiDati = dati.slice(-numeroGiorni);

        const chiavi = Object.keys(ultimiDati[0]);
        let htmlTabella = '<thead><tr>';
        
        chiavi.forEach(chiave => {
            let chiavePulita = chiave.replace(/_/g, ' '); 
            htmlTabella += `<th>${chiavePulita}</th>`;
        });
        htmlTabella += '</tr></thead><tbody>';

        ultimiDati.forEach(giorno => {
            htmlTabella += '<tr>';
            
            chiavi.forEach(chiave => {
                let valore = giorno[chiave];

                if (chiave === 'data') {
                    const dataOggetto = new Date(valore);
                    valore = dataOggetto.toLocaleDateString('it-IT');
                } else if (typeof valore === 'number') {
                    valore = valore.toLocaleString('it-IT');
                }

                htmlTabella += `<td>${valore}</td>`;
            });
            
            htmlTabella += '</tr>';
        });
        
        htmlTabella += '</tbody>';
        tabella.innerHTML = htmlTabella;

    } catch (errore) {
        console.error("Errore:", errore);
        tabella.innerHTML = `<tr><td style="color: red;">Impossibile caricare i dati.</td></tr>`;
    }
}

elaboraDati(10);

document.getElementById('btn-aggiorna').addEventListener('click', function() {
    const giorniScelti = document.getElementById('input-giorni').value;
    
    elaboraDati(giorniScelti);
});
