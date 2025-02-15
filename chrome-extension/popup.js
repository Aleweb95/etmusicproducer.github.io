document.addEventListener('DOMContentLoaded', async () => {
    // Aggiorna le statistiche
    updateStats();

    // Aggiungi event listener per ogni categoria
    document.querySelectorAll('.category-item').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.dataset.category;
            chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
                if (tab) {
                    chrome.scripting.executeScript({
                        target: {tabId: tab.id},
                        function: () => {
                            return window.getSelection().toString();
                        }
                    }).then(([result]) => {
                        if (result.result) {
                            saveNote({
                                text: result.result,
                                url: tab.url,
                                title: tab.title,
                                category: category,
                                timestamp: new Date().toISOString()
                            });
                        }
                    });
                }
            });
        });
    });
});

async function updateStats() {
    try {
        // Recupera le statistiche dal localStorage
        const stats = await chrome.storage.local.get(['totalNotes', 'todayNotes']);
        
        // Aggiorna i contatori nell'interfaccia
        document.getElementById('totalNotes').textContent = `Note totali: ${stats.totalNotes || 0}`;
        document.getElementById('todayNotes').textContent = `Note oggi: ${stats.todayNotes || 0}`;
    } catch (error) {
        console.error('Errore nel caricamento delle statistiche:', error);
    }
}

async function saveNote(noteData) {
    try {
        const response = await fetch('https://tuosito.com/api/save-note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });

        if (response.ok) {
            // Aggiorna le statistiche
            const stats = await chrome.storage.local.get(['totalNotes', 'todayNotes']);
            await chrome.storage.local.set({
                totalNotes: (stats.totalNotes || 0) + 1,
                todayNotes: (stats.todayNotes || 0) + 1
            });

            // Aggiorna l'interfaccia
            updateStats();

            // Mostra notifica di successo
            chrome.notifications.create({
                type: 'basic',
                iconUrl: 'icon48.png',
                title: 'Nota Salvata!',
                message: `La nota è stata salvata nella categoria ${noteData.category}`
            });
        } else {
            throw new Error('Errore nel salvataggio della nota');
        }
    } catch (error) {
        console.error('Errore:', error);
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Errore',
            message: 'Si è verificato un errore nel salvataggio della nota'
        });
    }
} 