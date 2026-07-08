// Lógica de Navegación, Progreso y Cuestionarios del Tutorial
document.addEventListener('DOMContentLoaded', () => {
    // Referencias DOM
    const sidebar = document.querySelector('.sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercent = document.getElementById('progress-percent');

    // Navegación móvil
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('open');
        });

        // Cerrar sidebar al hacer clic fuera en móviles
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuToggle) {
                sidebar.classList.remove('open');
            }
        });
    }

    // Progreso de lectura cargado de localStorage
    let readSections = JSON.parse(localStorage.getItem('spring_tutorial_progress')) || {};

    // Actualizar barra de progreso y completado
    function updateProgress() {
        const totalSections = contentSections.length;
        if (totalSections === 0) return;

        let completedCount = 0;
        contentSections.forEach(section => {
            const sectionId = section.id;
            const navItem = document.querySelector(`.nav-item[data-section="${sectionId}"]`);

            if (readSections[sectionId]) {
                completedCount++;
                if (navItem) navItem.classList.add('completed');
            } else {
                if (navItem) navItem.classList.remove('completed');
            }
        });

        const percent = Math.round((completedCount / totalSections) * 100);
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
        if (progressPercent) progressPercent.innerText = `${percent}%`;

        localStorage.setItem('spring_tutorial_progress', JSON.stringify(readSections));
    }

    // Cambiar de sección activa
    function showSection(sectionId) {
        if (!sectionId) return;

        // Desactivar secciones anteriores
        contentSections.forEach(section => {
            section.classList.remove('active');
        });

        // Activar la nueva sección
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Marcar como leída automáticamente al entrar
            readSections[sectionId] = true;
            updateProgress();
        }

        // Activar link de navegación
        navLinks.forEach(link => {
            const parent = link.parentElement;
            if (parent && parent.getAttribute('data-section') === sectionId) {
                parent.classList.add('active');
            } else if (parent) {
                parent.classList.remove('active');
            }
        });

        // Cerrar menú móvil al navegar
        if (sidebar && sidebar.classList.contains('open')) {
            sidebar.classList.remove('open');
        }

        // Actualizar URL hash
        window.location.hash = sectionId;
    }

    // Event listeners para links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.parentElement.getAttribute('data-section');
            showSection(sectionId);
        });
    });

    // Rutas dinámicas basadas en hash al cargar la página
    const currentHash = window.location.hash.substring(1);
    if (currentHash && document.getElementById(currentHash)) {
        showSection(currentHash);
    } else {
        // Cargar primera sección por defecto
        if (contentSections.length > 0) {
            showSection(contentSections[0].id);
        }
    }

    // Configurar botones de navegación de página Siguiente / Anterior
    document.querySelectorAll('.btn-prev-page').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentSection = btn.closest('.content-section');
            if (currentSection && currentSection.previousElementSibling && currentSection.previousElementSibling.classList.contains('content-section')) {
                showSection(currentSection.previousElementSibling.id);
            }
        });
    });

    document.querySelectorAll('.btn-next-page').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentSection = btn.closest('.content-section');
            if (currentSection && currentSection.nextElementSibling && currentSection.nextElementSibling.classList.contains('content-section')) {
                showSection(currentSection.nextElementSibling.id);
            }
        });
    });

    // Copiar código al portapapeles
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.code-block-wrapper');
            if (!wrapper) return;
            const codeEl = wrapper.querySelector('pre code');
            if (!codeEl) return;

            // Usar api clipboard
            navigator.clipboard.writeText(codeEl.innerText).then(() => {
                const originalText = btn.innerText;
                btn.innerText = '¡Copiado!';
                btn.style.borderColor = '#10b981';
                btn.style.color = '#10b981';
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.borderColor = '';
                    btn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Error al copiar: ', err);
            });
        });
    });

});
