// Definizione delle categorie
const categories = [
    { id: 'shop-baskets', name: 'Shop Baskets', url: '/categories/shop-baskets.html' },
    { id: 'making-mask', name: 'Making Mask', url: '/categories/making-mask.html' },
    { id: 'informatica', name: 'Informatica', url: '/categories/informatica.html' },
    { id: 'gaming', name: 'Gaming', url: '/categories/gaming.html' },
    { id: 'disegno', name: 'Disegno', url: '/categories/disegno.html' },
    { id: 'produzione', name: 'Produzione', url: '/categories/produzione.html' },
    { id: 'mixing', name: 'Mixing', url: '/categories/mixing.html' },
    { id: 'mastering', name: 'Mastering', url: '/categories/mastering.html' },
    { id: 'recording', name: 'Recording', url: '/categories/recording.html' },
    { id: 'samples', name: 'Samples', url: '/categories/samples.html' },
    { id: 'midi', name: 'MIDI', url: '/categories/midi.html' },
    { id: 'sviluppo-programmi', name: 'Sviluppo Programmi', url: '/categories/sviluppo-programmi.html' },
    { id: 'altri-interessi', name: 'Altri Interessi', url: '/categories/altri-interessi.html' },
    { id: 'diy-how-to-make', name: 'DIY/How to Make', url: '/categories/diy-how-to-make.html' },
    { id: 'coltivazione', name: 'Coltivazione', url: '/categories/coltivazione.html' },
    { id: 'bot-telegram', name: 'Bot Telegram', url: '/categories/bot-telegram.html' },
    { id: 'vst-plugins', name: 'VST Plugins', url: '/categories/vst-plugins.html' },
    { id: 'airbnb-project', name: 'Airbnb Project', url: '/categories/airbnb-project.html' }
];

// Crea il menu contestuale principale
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'noteWebHighlighter',
        title: 'Note Web Highlighter',
        contexts: ['selection']
    });

    // Crea i sottomenu per ogni categoria
    categories.forEach(category => {
        chrome.contextMenus.create({
            id: category.id,
            parentId: 'noteWebHighlighter',
            title: category.name,
            contexts: ['selection']
        });
    });
});

// Gestisce il click sul menu contestuale
chrome.contextMenus.onClicked.addListener((info, tab) => {
    const category = categories.find(cat => cat.id === info.menuItemId);
    if (category) {
        const noteData = {
            text: info.selectionText,
            url: tab.url,
            title: tab.title,
            category: category.id,
            timestamp: new Date().toISOString()
        };

        // Invia la nota al tuo sito web
        sendNoteToWebsite(noteData, category.url);
    }
});

// Funzione per inviare la nota al sito web
async function sendNoteToWebsite(noteData, categoryUrl) {
    try {
        const response = await fetch('https://tuosito.com/api/save-note', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(noteData)
        });

        if (response.ok) {
            // Mostra una notifica di successo
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
        // Mostra una notifica di errore
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Errore',
            message: 'Si è verificato un errore nel salvataggio della nota'
        });
    }
} 