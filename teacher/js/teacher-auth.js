document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('teacherLoginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Toggle password
    togglePassword?.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('fa-eye');
        this.classList.toggle('fa-eye-slash');
    });

    // Gestion du formulaire
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email')?.value;
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            showError('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch('/auth/login-teacher', { // Route corrigée
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                credentials: 'include' // Important pour les sessions
            });
            console.log('Réponse du serveur:', response);
            const data = await response.json();
            console.log('Données reçues:', data); // Debug

            if (!response.ok) {
                throw new Error(data.error || 'Erreur de connexion');
            }

            if (data.success && data.redirect) {
                window.location.href =data.redirect;
            } else {
                showError('Réponse inattendue du serveur');
            }
                /*localStorage.setItem('teacher', JSON.stringify(data.user));
                window.location.href = data.redirect;*/

        } catch (error) {
            console.error('Erreur:', error);
            showError(error.message || 'Erreur de connexion');
        }
    });
});

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        setTimeout(() => {
            errorElement.style.display = 'none';
        }, 5000);
    }
}