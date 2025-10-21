// Obtenemos referencias a todos los elementos del DOM que necesitamos
const guestNameInput = document.getElementById('guestNameInput');
const guestNameDisplay = document.getElementById('guestNameDisplay');
const downloadBtn = document.getElementById('downloadBtn');
const invitationCard = document.getElementById('invitationCard');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');

// Evento para actualizar el nombre en la invitación mientras se escribe
guestNameInput.addEventListener('input', function() {
    guestNameDisplay.textContent = this.value;
});

// Evento que se dispara al hacer clic en el botón de descarga
downloadBtn.addEventListener('click', function() {
    // Deshabilitamos el botón para evitar que se haga clic varias veces
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = 'Generando...';
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    // Mostramos la barra y el texto de progreso
    progressContainer.classList.remove('hidden');
    progressText.classList.remove('hidden');
    progressBar.style.width = '0%';

    // --- Lógica de Captura Diferenciada para Web y Móvil ---
    const isMobile = window.innerWidth < 768; // Detectamos si la pantalla es de tamaño móvil

    if (isMobile) {
        // --- LÓGICA OPTIMIZADA PARA MÓVILES ---
        // Se genera en JPEG para reducir drásticamente el peso del archivo.
        progressText.textContent = 'Optimizando para móvil...';
        progressBar.style.width = '20%';

        html2canvas(invitationCard, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff', // El formato JPEG necesita un color de fondo, el blanco es neutro.
            scale: 2.0 // Escala optimizada para móviles.
        }).then(canvas => {
            progressBar.style.width = '100%';
            const link = document.createElement('a');
            const guestName = guestNameInput.value.trim() || 'invitado';
            // Cambiamos el nombre del archivo a .jpeg
            const fileName = `invitacion_${guestName.replace(/\s+/g, '_')}.jpeg`;
            
            link.download = fileName;
            // Convertimos el canvas a formato JPEG con un 92% de calidad para un balance perfecto.
            link.href = canvas.toDataURL('image/jpeg', 0.92);
            link.click();
            resetDownloadButton();

        }).catch(err => {
            console.error('Error en la captura móvil!', err);
            progressText.textContent = 'Hubo un error al generar la imagen.';
            setTimeout(resetDownloadButton, 2000);
        });

    } else {
        // --- LÓGICA DE ALTA CALIDAD PARA WEB (la que ya teníamos) ---
        // Redimensiona el DOM para una captura de máxima fidelidad.
        const img = new Image();
        const style = window.getComputedStyle(invitationCard);
        const bgImageSrc = style.backgroundImage.slice(4, -1).replace(/"/g, "");
        img.src = bgImageSrc;

        img.onload = function() {
            const originalWidth = this.naturalWidth;
            const originalHeight = this.naturalHeight;
            const currentCardWidth = invitationCard.offsetWidth;
            const currentCardHeight = invitationCard.offsetHeight;
            const targetWidth = currentCardWidth + (originalWidth - currentCardWidth) * 0.25;
            const targetHeight = currentCardHeight + (originalHeight - currentCardHeight) * 0.25;
            const scaleFactor = targetWidth / currentCardWidth;
            const currentFontSize = parseFloat(window.getComputedStyle(guestNameDisplay).fontSize);
            const newFontSize = currentFontSize * scaleFactor;
            const originalCardStyles = {
                width: invitationCard.style.width,
                height: invitationCard.style.height,
                maxWidth: invitationCard.style.maxWidth,
                aspectRatio: invitationCard.style.aspectRatio,
            };
            const originalNameStyle = guestNameDisplay.style.fontSize;
            invitationCard.style.width = `${targetWidth}px`;
            invitationCard.style.height = `${targetHeight}px`;
            invitationCard.style.maxWidth = 'none';
            invitationCard.style.aspectRatio = 'auto';
            guestNameDisplay.style.fontSize = `${newFontSize}px`;
            
            setTimeout(() => {
                html2canvas(invitationCard, {
                    useCORS: true,
                    allowTaint: true,
                    width: targetWidth,
                    height: targetHeight,
                    onprogress: function(progress) {
                        const percent = Math.round((progress.loaded / progress.total) * 100);
                        progressBar.style.width = percent + '%';
                    }
                }).then(canvas => {
                    const link = document.createElement('a');
                    const guestName = guestNameInput.value.trim() || 'invitado';
                    const fileName = `invitacion_${guestName.replace(/\s+/g, '_')}.png`;
                    link.download = fileName;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    Object.assign(invitationCard.style, originalCardStyles);
                    guestNameDisplay.style.fontSize = originalNameStyle;
                    resetDownloadButton();
                }).catch(err => {
                    console.error('Oops, algo salió mal!', err);
                    progressText.textContent = 'Hubo un error al generar la imagen.';
                    Object.assign(invitationCard.style, originalCardStyles);
                    guestNameDisplay.style.fontSize = originalNameStyle;
                    setTimeout(resetDownloadButton, 2000);
                });
            }, 100);
        };

        img.onerror = function() {
            console.error("Error al cargar la imagen de fondo.");
            progressText.textContent = 'Error al cargar imagen de fondo.';
            setTimeout(resetDownloadButton, 2000);
        };
    }
});

function resetDownloadButton() {
    progressContainer.classList.add('hidden');
    progressText.classList.add('hidden');
    progressText.textContent = 'Generando imagen...'; // Reseteamos el texto
    downloadBtn.disabled = false;
    // Restauramos el contenido del botón, incluyendo el ícono
    downloadBtn.innerHTML = '<i class="gg-software-download"></i> Descargar Invitación';
    downloadBtn.classList.remove('opacity-50', 'cursor-not-allowed');
}
