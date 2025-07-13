document.addEventListener('DOMContentLoaded', () => {
    // Animazione del testo all'ingresso
    const title = document.querySelector('.title');
    const description = document.querySelector('.description');

    title.style.opacity = '0';
    description.style.opacity = '0';
    
    setTimeout(() => {
        title.style.transition = 'opacity 1s ease-in-out';
        description.style.transition = 'opacity 1s ease-in-out';
        
        title.style.opacity = '1';
        setTimeout(() => {
            description.style.opacity = '1';
        }, 500);
    }, 100);

    // Gestione animazioni dei pulsanti
    const buttons = document.querySelectorAll('.link-button');
    
    // Funzione per controllare se un elemento è nel viewport
    const isInViewport = (element) => {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    };
    
    // Funzione per animare i pulsanti quando sono visibili
    const animateButtons = () => {
        buttons.forEach((button, index) => {
            if (isInViewport(button)) {
                setTimeout(() => {
                    button.classList.add('visible');
                }, 100 * index);
            }
        });
    };
    
    // Funzione per l'effetto parallasse
    const handleScroll = () => {
        // Effetto parallasse sul gradiente
        const gradient = document.querySelector('.rainbow-gradient');
        if (gradient) {
            const scrolled = window.pageYOffset;
            gradient.style.transform = `rotate(-15deg) translateY(${scrolled * 0.5}px)`;
        }
        
        // Controlla le animazioni dei pulsanti
        animateButtons();
    };
    
    // Aggiungi un singolo event listener per lo scroll
    window.addEventListener('scroll', handleScroll);
    
    // Controlla le animazioni al caricamento
    animateButtons();
}); 