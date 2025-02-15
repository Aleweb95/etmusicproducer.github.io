// Funzione per evidenziare il testo selezionato
function highlightSelection(color) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.className = 'note-web-highlight';
    span.style.backgroundColor = color;
    span.style.opacity = '0.3';
    
    try {
        range.surroundContents(span);
    } catch (e) {
        console.error('Errore nell\'evidenziazione:', e);
    }
}

// Ascolta i messaggi dal background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightText') {
        highlightSelection(request.color);
        sendResponse({success: true});
    }
});

function showToast(message, isError = false) {
    // Rimuovi eventuali toast esistenti
    const existingToast = document.querySelector('.note-web-toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Crea un nuovo toast
    const toast = document.createElement('div');
    toast.className = 'note-web-toast';
    toast.textContent = message;
    
    // Stili del toast
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        backgroundColor: isError ? '#ff4444' : '#4CAF50',
        color: 'white',
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
        zIndex: '10000',
        transition: 'opacity 0.3s ease-in-out'
    });

    // Aggiungi il toast al documento
    document.body.appendChild(toast);

    // Rimuovi il toast dopo 3 secondi
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
} 
} 