document.addEventListener('DOMContentLoaded', () => {
    // Gestione del salvataggio delle note
    const noteEditor = document.querySelector('.note-editor');
    const noteText = noteEditor.querySelector('textarea');
    const urlInput = noteEditor.querySelector('.url-input');
    const categorySelect = noteEditor.querySelector('.category-select');
    const saveButton = noteEditor.querySelector('.save-button');

    // Carica le note salvate dal localStorage
    let savedNotes = JSON.parse(localStorage.getItem('webNotes')) || [];

    // Gestione upload file multimediali
    const imageInput = document.getElementById('imageInput');
    const videoInput = document.getElementById('videoInput');
    const audioInput = document.getElementById('audioInput');
    const fileInput = document.getElementById('fileInput');
    const imagePreview = document.querySelector('#imagePreview .preview-grid');
    const videoPreview = document.querySelector('#videoPreview .preview-grid');
    const audioPreview = document.querySelector('#audioPreview .preview-grid');
    const fileList = document.querySelector('#filePreview .file-list');

    // Array per tenere traccia dei file caricati
    let uploadedImages = [];
    let uploadedVideos = [];
    let uploadedAudios = [];
    let uploadedFiles = [];

    // Funzione per validare URL
    function isValidURL(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Funzione per salvare una nuova nota
    function saveNote() {
        // Validazione URL
        if (urlInput.value && !isValidURL(urlInput.value)) {
            alert('Inserisci un URL valido (deve iniziare con http:// o https://)');
            return;
        }
        
        const note = {
            id: Date.now(),
            text: noteText.value,
            url: urlInput.value,
            category: categorySelect.value,
            timestamp: new Date().toISOString(),
            color: getSelectedColor(),
            images: uploadedImages.map(img => img.name),
            videos: uploadedVideos.map(video => video.name),
            audios: uploadedAudios.map(audio => audio.name),
            files: uploadedFiles.map(file => file.name)
        };

        savedNotes.push(note);
        localStorage.setItem('webNotes', JSON.stringify(savedNotes));

        // Pulisci i campi e le anteprime
        noteText.value = '';
        urlInput.value = '';
        categorySelect.value = '';
        imagePreview.innerHTML = '';
        videoPreview.innerHTML = '';
        audioPreview.innerHTML = '';
        fileList.innerHTML = '';
        
        // Pulisci gli URL creati per evitare memory leak
        createdObjectURLs.forEach(url => URL.revokeObjectURL(url));
        createdObjectURLs = [];
        
        uploadedImages = [];
        uploadedVideos = [];
        uploadedAudios = [];
        uploadedFiles = [];

        alert('Nota salvata con successo!');
    }

    // Gestione del click sul pulsante di salvataggio
    saveButton.addEventListener('click', saveNote);

    // Gestione dei colori delle categorie
    const colorDots = document.querySelectorAll('.color-dot');
    let selectedColor = null;

    colorDots.forEach(dot => {
        dot.addEventListener('click', () => {
            // Rimuovi la selezione precedente
            colorDots.forEach(d => d.style.border = 'none');
            // Aggiungi la selezione al colore cliccato
            dot.style.border = '2px solid white';
            selectedColor = dot.style.backgroundColor;
        });
    });

    function getSelectedColor() {
        return selectedColor;
    }

    // Gestione della ricerca
    const searchInput = document.querySelector('.search-input');
    
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredNotes = savedNotes.filter(note => 
            note.text.toLowerCase().includes(searchTerm) ||
            note.url.toLowerCase().includes(searchTerm)
        );
        displayNotes(filteredNotes);
    });

    // Funzione per visualizzare le note
    function displayNotes(notes) {
        const notesContainer = document.querySelector('.notes-container');
        if (!notesContainer) return;

        notesContainer.innerHTML = '';
        notes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = 'note-card';
            noteElement.style.borderLeft = `5px solid ${note.color}`;
            
            // Sanitizza il contenuto per prevenire XSS
            const sanitizeHTML = (str) => {
                const div = document.createElement('div');
                div.textContent = str;
                return div.innerHTML;
            };
            
            noteElement.innerHTML = `
                <p class="note-text">${sanitizeHTML(note.text)}</p>
                <a href="${sanitizeHTML(note.url)}" target="_blank" class="note-url">${sanitizeHTML(note.url)}</a>
                <span class="note-category">${sanitizeHTML(note.category)}</span>
                <span class="note-date">${new Date(note.timestamp).toLocaleDateString()}</span>
                <button class="delete-note" data-id="${note.id}">Elimina</button>
            `;
            
            notesContainer.appendChild(noteElement);
        });
    }

    // Gestione dell'eliminazione delle note con delegazione eventi
    const handleDeleteNote = (e) => {
        if (e.target.classList.contains('delete-note')) {
            const noteId = parseInt(e.target.dataset.id);
            savedNotes = savedNotes.filter(note => note.id !== noteId);
            localStorage.setItem('webNotes', JSON.stringify(savedNotes));
            displayNotes(savedNotes);
        }
    };
    
    // Usa un singolo event listener con delegazione eventi
    document.addEventListener('click', handleDeleteNote);

    // Funzione di cleanup per rimuovere event listener
    const cleanup = () => {
        document.removeEventListener('click', handleDeleteNote);
        // Pulisci gli URL creati
        createdObjectURLs.forEach(url => URL.revokeObjectURL(url));
    };

    // Carica le note all'avvio
    displayNotes(savedNotes);

    // Color Picker Modal
    const modal = document.getElementById('colorPickerModal');
    const colorPickerBtn = document.querySelector('.color-picker-btn');
    const applyBtn = document.getElementById('applyColor');
    const cancelBtn = document.getElementById('cancelColor');
    const colorPicker = document.getElementById('colorPicker');
    const redInput = document.getElementById('redValue');
    const greenInput = document.getElementById('greenValue');
    const blueInput = document.getElementById('blueValue');
    const hexInput = document.getElementById('hexValue');

    // Apri il modal
    colorPickerBtn.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Chiudi il modal
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Chiudi il modal cliccando fuori
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Aggiorna i valori RGB e HEX quando cambia il colore
    colorPicker.addEventListener('input', updateColorValues);

    // Aggiorna il colore quando cambiano i valori RGB
    [redInput, greenInput, blueInput].forEach(input => {
        input.addEventListener('input', () => {
            const r = parseInt(redInput.value);
            const g = parseInt(greenInput.value);
            const b = parseInt(blueInput.value);
            const hex = rgbToHex(r, g, b);
            colorPicker.value = hex;
            hexInput.value = hex;
        });
    });

    // Aggiorna il colore quando cambia il valore HEX
    hexInput.addEventListener('input', () => {
        const hex = hexInput.value;
        if (hex.match(/^#[0-9A-Fa-f]{6}$/)) {
            colorPicker.value = hex;
            const rgb = hexToRgb(hex);
            redInput.value = rgb.r;
            greenInput.value = rgb.g;
            blueInput.value = rgb.b;
        }
    });

    // Applica il colore selezionato
    applyBtn.addEventListener('click', () => {
        const selectedDot = document.querySelector('.color-dot.selected');
        if (selectedDot) {
            selectedDot.style.backgroundColor = colorPicker.value;
            selectedColor = colorPicker.value;
        }
        modal.style.display = 'none';
    });

    // Funzioni di utilità per la conversione dei colori
    function updateColorValues(e) {
        const hex = e.target.value;
        hexInput.value = hex;
        const rgb = hexToRgb(hex);
        redInput.value = rgb.r;
        greenInput.value = rgb.g;
        blueInput.value = rgb.b;
    }

    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    function hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    // Aggiungi i colori predefiniti
    const presetColors = [
        '#FFE135', '#4A90E2', '#50C878', '#40E0D0', 
        '#FFA500', '#BA55D3', '#FF6B6B', '#FF4500',
        '#00FF00', '#9932CC', '#FF1493', '#4169E1'
    ];

    const presetContainer = document.querySelector('.preset-colors');
    presetColors.forEach(color => {
        const preset = document.createElement('div');
        preset.className = 'preset-color';
        preset.style.backgroundColor = color;
        preset.addEventListener('click', () => {
            colorPicker.value = color;
            updateColorValues({ target: colorPicker });
        });
        presetContainer.appendChild(preset);
    });

    // Gestione caricamento immagini
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = createImagePreview(e.target.result, file.name);
                    imagePreview.appendChild(preview);
                    uploadedImages.push(file);
                };
                reader.readAsDataURL(file);
            }
        });
    });

    // Array per tenere traccia degli URL creati per evitare memory leak
    let createdObjectURLs = [];

    // Gestione caricamento video
    videoInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('video/')) {
                const objectURL = URL.createObjectURL(file);
                createdObjectURLs.push(objectURL);
                const preview = createVideoPreview(objectURL, file.name);
                videoPreview.appendChild(preview);
                uploadedVideos.push(file);
            }
        });
    });

    // Gestione caricamento audio
    audioInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('audio/')) {
                const objectURL = URL.createObjectURL(file);
                createdObjectURLs.push(objectURL);
                const preview = createAudioPreview(objectURL, file.name);
                audioPreview.appendChild(preview);
                uploadedAudios.push(file);
            }
        });
    });

    // Gestione caricamento altri file
    fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const fileItem = createFileItem(file.name);
            fileList.appendChild(fileItem);
            uploadedFiles.push(file);
        });
    });

    // Funzioni di utilità per creare le anteprime
    function createImagePreview(src, name) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <img src="${src}" alt="${name}">
            <button class="remove-btn" title="Rimuovi">×</button>
        `;
        
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            uploadedImages = uploadedImages.filter(img => img.name !== name);
        });
        
        return div;
    }

    function createVideoPreview(src, name) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        div.innerHTML = `
            <video src="${src}" controls></video>
            <button class="remove-btn" title="Rimuovi">×</button>
        `;
        
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            uploadedVideos = uploadedVideos.filter(video => video.name !== name);
            URL.revokeObjectURL(src);
        });
        
        return div;
    }

    function createAudioPreview(src, name) {
        const div = document.createElement('div');
        div.className = 'preview-item audio-preview-item';
        div.innerHTML = `
            <span class="audio-icon">🎵</span>
            <p class="audio-title">${name}</p>
            <audio src="${src}" controls></audio>
            <button class="remove-btn" title="Rimuovi">×</button>
        `;
        
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            uploadedAudios = uploadedAudios.filter(audio => audio.name !== name);
            URL.revokeObjectURL(src);
        });
        
        return div;
    }

    function createFileItem(name) {
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <span class="file-icon">📄</span>
            <span class="file-name">${name}</span>
            <button class="remove-btn" title="Rimuovi">×</button>
        `;
        
        div.querySelector('.remove-btn').addEventListener('click', () => {
            div.remove();
            uploadedFiles = uploadedFiles.filter(file => file.name !== name);
        });
        
        return div;
    }
}); 