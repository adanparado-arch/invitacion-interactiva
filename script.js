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

    // --- Lógica para captura de alta calidad ---
    // 1. Cargamos la imagen de fondo para obtener sus dimensiones originales
    const img = new Image();
    const style = window.getComputedStyle(invitationCard);
    const bgImageSrc = style.backgroundImage.slice(4, -1).replace(/"/g, "");
    img.src = bgImageSrc;

    img.onload = function() {
        const originalWidth = this.naturalWidth;
        const originalHeight = this.naturalHeight;
        
        // Obtenemos el tamaño actual del contenedor en pantalla
        const currentCardWidth = invitationCard.offsetWidth;
        const currentCardHeight = invitationCard.offsetHeight;

        // Calculamos un tamaño intermedio (50% menos de crecimiento)
        const targetWidth = (currentCardWidth + originalWidth) / 2;
        const targetHeight = (currentCardHeight + originalHeight) / 2;

        // Calculamos el factor de escala necesario para el texto
        const scaleFactor = targetWidth / currentCardWidth;
        // Obtenemos el tamaño de fuente actual del nombre
        const currentFontSize = parseFloat(window.getComputedStyle(guestNameDisplay).fontSize);
        // Calculamos el nuevo tamaño de fuente para la captura de alta calidad
        const newFontSize = currentFontSize * scaleFactor;

        // 2. Guardamos los estilos originales para restaurarlos después
        const originalCardStyles = {
            width: invitationCard.style.width,
            height: invitationCard.style.height,
            maxWidth: invitationCard.style.maxWidth,
            aspectRatio: invitationCard.style.aspectRatio,
        };
        const originalNameStyle = guestNameDisplay.style.fontSize;

        // 3. Redimensionamos temporalmente el contenedor y el texto a las dimensiones objetivo
        invitationCard.style.width = `${targetWidth}px`;
        invitationCard.style.height = `${targetHeight}px`;
        invitationCard.style.maxWidth = 'none';
        invitationCard.style.aspectRatio = 'auto';
        guestNameDisplay.style.fontSize = `${newFontSize}px`;
        
        // Damos un pequeño respiro al navegador para que renderice los cambios de tamaño
        setTimeout(() => {
            // 4. Usamos html2canvas para capturar el div redimensionado
            html2canvas(invitationCard, {
                useCORS: true,
                allowTaint: true,
                // Especificamos las dimensiones para asegurar la calidad
                width: targetWidth,
                height: targetHeight,
                onprogress: function(progress) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    progressBar.style.width = percent + '%';
                }
            }).then(canvas => {
                // 5. Creamos el enlace de descarga
                const link = document.createElement('a');
                const guestName = guestNameInput.value.trim() || 'invitado';
                const fileName = `invitacion_${guestName.replace(/\s+/g, '_')}.png`;
                
                link.download = fileName;
                link.href = canvas.toDataURL('image/png');
                link.click();

                // 6. Restauramos los estilos originales del contenedor y del texto
                Object.assign(invitationCard.style, originalCardStyles);
                guestNameDisplay.style.fontSize = originalNameStyle;
                resetDownloadButton();

            }).catch(err => {
                console.error('Oops, algo salió mal!', err);
                progressText.textContent = 'Hubo un error al generar la imagen.';
                // Aseguramos restaurar los estilos también en caso de error
                Object.assign(invitationCard.style, originalCardStyles);
                guestNameDisplay.style.fontSize = originalNameStyle;
                setTimeout(resetDownloadButton, 2000);
            });
        }, 100); // Pequeña demora para el re-renderizado
    };

    img.onerror = function() {
        console.error("Error al cargar la imagen de fondo para la captura de alta calidad.");
        progressText.textContent = 'Error al cargar imagen de fondo.';
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
