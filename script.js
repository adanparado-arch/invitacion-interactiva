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
    // Deshabilitamos el botón y mostramos el progreso
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = 'Generando...';
    downloadBtn.classList.add('opacity-50', 'cursor-not-allowed');
    
    progressContainer.classList.remove('hidden');
    progressText.classList.remove('hidden');
    progressBar.style.width = '0%';

    // Para obtener la mejor calidad, vamos a redimensionar temporalmente la tarjeta
    // al tamaño original de la imagen de fondo antes de capturarla.
    const img = new Image();
    const style = window.getComputedStyle(invitationCard);
    const imageUrl = style.backgroundImage.slice(5, -2); // Extrae la URL de 'url("...")'

    img.src = imageUrl;

    const restoreOriginalStyles = () => {
        // Restaura los estilos en línea para que la tarjeta vuelva a su tamaño normal en la página
        invitationCard.style.width = '';
        invitationCard.style.height = '';
        invitationCard.style.maxWidth = '';
        invitationCard.style.aspectRatio = '';
        guestNameDisplay.style.fontSize = '';
    };

    img.onload = () => {
        const originalWidth = img.naturalWidth;
        const originalHeight = img.naturalHeight;

        // Calcula el ratio de escalado para el texto, para que crezca proporcionalmente
        const currentCardWidth = invitationCard.offsetWidth;
        const scaleRatio = originalWidth / currentCardWidth;

        // Obtiene el tamaño de fuente actual y lo escala
        const currentFontSize = parseFloat(window.getComputedStyle(guestNameDisplay).fontSize);
        const scaledFontSize = currentFontSize * scaleRatio;

        // Aplica los nuevos tamaños para la captura de alta resolución
        invitationCard.style.width = `${originalWidth}px`;
        invitationCard.style.height = `${originalHeight}px`;
        invitationCard.style.maxWidth = 'none';
        invitationCard.style.aspectRatio = 'auto';
        guestNameDisplay.style.fontSize = `${scaledFontSize}px`;
        
        // Damos un pequeño respiro al navegador para que renderice los nuevos estilos antes de capturar
        setTimeout(() => {
            html2canvas(invitationCard, {
                useCORS: true,
                allowTaint: true,
                width: originalWidth,
                height: originalHeight,
                // No necesitamos 'scale' porque ya hemos redimensionado el elemento a su tamaño real
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
                
                restoreOriginalStyles();
                resetDownloadButton();
    
            }).catch(err => {
                console.error('Oops, algo salió mal!', err);
                progressText.textContent = 'Hubo un error al generar la imagen.';
                restoreOriginalStyles();
                setTimeout(resetDownloadButton, 2000);
            });
        }, 100); // 100ms de retraso son suficientes
    };

    img.onerror = () => {
        console.error('Error: No se pudo cargar la imagen de fondo para determinar su tamaño.');
        progressText.textContent = 'Error al cargar la imagen de fondo.';
        setTimeout(resetDownloadButton, 2000);
    };
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