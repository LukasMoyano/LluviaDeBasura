document.addEventListener('DOMContentLoaded', () => {
    console.log("UI Inicializada: Tema Cyberpunk Andino");
    
    // --- Lógica del Botón Iniciar Juego ---
    const btnPlay = document.getElementById('btn-calibrate');
    if (btnPlay) {
        btnPlay.addEventListener('click', () => {
            document.getElementById('game-ui-overlay').style.display = 'none';
            if (window.startGameEngine) {
                window.startGameEngine();
            }
        });
    }

    // --- Lógica del Menú Hamburguesa (Mobile) ---
    const menuIcon = document.getElementById('mobile-menu');
    const navbar = document.getElementById('navbar');
    
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navbar.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navbar.classList.remove('active');
            });
        });
    }

    // --- Lógica del Formulario y Validación de Correo ---
    const form = document.getElementById('b2b-form');
    const emailInput = document.getElementById('contact-email');
    const emailError = document.getElementById('email-error');
    const btnWhatsapp = document.getElementById('btn-whatsapp');

    // Lista de dominios genéricos NO permitidos
    const invalidDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'aol.com', 'icloud.com'];

    function validateEmail() {
        const email = emailInput.value.trim().toLowerCase();
        if (!email) return true; // Se maneja con el atributo required de HTML5

        const domain = email.split('@')[1];
        if (domain && invalidDomains.includes(domain)) {
            emailError.style.display = 'block';
            emailInput.style.borderColor = '#ff4444';
            return false;
        } else {
            emailError.style.display = 'none';
            emailInput.style.borderColor = 'var(--organic-green)';
            return true;
        }
    }

    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', () => {
            emailError.style.display = 'none';
            emailInput.style.borderColor = 'var(--organic-green)';
        });
    }

    if (form) {
        form.addEventListener('submit', (e) => {
            if (!validateEmail()) {
                e.preventDefault(); // Evita el envío si el correo no es corporativo
                alert("Atención: Solo aceptamos correos corporativos/institucionales para propuestas B2B.");
            }
            // Si es válido, Netlify Forms tomará el control automáticamente porque usamos data-netlify="true"
        });
    }

    // --- Lógica del Botón WhatsApp ---
    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            if (!validateEmail()) {
                alert("Por favor, ingrese un correo corporativo válido primero.");
                return;
            }

            const name = document.getElementById('contact-name')?.value || '';
            const company = document.getElementById('contact-company')?.value || '';
            const email = document.getElementById('contact-email')?.value || '';
            const solution = document.getElementById('contact-solution')?.value || '';

            if (!name || !company || !email) {
                alert("Por favor, complete los campos Nombre, Empresa y Correo antes de escribirnos por WhatsApp.");
                return;
            }

            // Construir mensaje B2B
            const text = `Hola Lukas. Estoy interesado en las soluciones tecnológicas B2B de -IR- Productions.
Mi nombre es *${name}* de la empresa/institución *${company}*.
Me interesa la solución: *${solution}*.
Mi correo de contacto es: ${email}
Me gustaría recibir más información.`;

            const encodedText = encodeURIComponent(text);
            const phoneNumber = "573197919742"; // Número de Lukas
            const waUrl = `https://wa.me/${phoneNumber}?text=${encodedText}`;
            
            window.open(waUrl, '_blank');
        });
    }
});
