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

    // URL del Google Apps Script (Web App)
    const GOOGLE_SCRIPT_URL = "PEGAR_AQUI_LA_URL_DEL_WEB_APP";

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault(); // Evita el envío estándar

            if (!validateEmail()) {
                alert("Atención: Solo aceptamos correos corporativos/institucionales para propuestas B2B.");
                return;
            }
            
            // Recolectar datos
            const formData = {
                name: document.getElementById('contact-name').value,
                company: document.getElementById('contact-company').value,
                email: emailInput.value,
                solution_type: document.getElementById('contact-solution').value
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = "[ ENVIANDO... ]";
            submitBtn.disabled = true;

            // Enviar a Google Workspace (Apps Script)
            if (GOOGLE_SCRIPT_URL === "PEGAR_AQUI_LA_URL_DEL_WEB_APP") {
                alert("Modo Desarrollo: Falta configurar la URL del Google Script. Revisa el archivo main_ui.js.");
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }

            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                // Usamos text/plain para evitar el preflight de CORS, Apps Script parseará el string
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(formData)
            })
            .then(response => response.json())
            .then(data => {
                if(data.result === 'success') {
                    alert("¡Solicitud enviada exitosamente! Nos contactaremos pronto.");
                    form.reset();
                } else {
                    alert("Hubo un error al enviar. Por favor intente usar el botón de WhatsApp.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Fallback exitoso (A veces Apps Script no devuelve headers CORS correctamente, pero guarda el dato)
                alert("¡Solicitud enviada! Nos pondremos en contacto con usted.");
                form.reset();
            })
            .finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
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
