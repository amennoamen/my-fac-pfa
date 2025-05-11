//verifi



// Fonctions utilitaires
async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error(await response.text());
    }
    return await response.json();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast show ${type}`;
    toastMessage.textContent = message;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Charger le profil de l'enseignant
// Fonction pour charger et afficher le profil de l'enseignant
async function loadProfile() {
    try {
        const response = await fetch('/teacher/profile', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        
        // Afficher les données dans la page
        document.getElementById('teacherNom').textContent = data.nom || 'Non disponible';
        document.getElementById('teacherPrenom').textContent = data.prénom || 'Non disponible';
        document.getElementById('teacherEmail').textContent = data.email || 'Non disponible';
        document.getElementById('teacherGrade').textContent = data.grade || 'Non disponible';
        document.getElementById('teacherDepartement').textContent = data.departement || 'Non disponible';

    } catch (error) {
        console.error('Erreur:', error);
        // Vous pouvez ajouter ici un affichage d'erreur simple
        alert('Erreur lors du chargement du profil: ' + error.message);
    }
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chargement des données de l'enseignant...");
    loadProfile();
});

// Charger les matières de l'enseignant



    
 

// Voir les étudiants d'une matière
// Déconnexion
async function logout() {
    try {
        await fetch('/auth/logout', { 
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = '/';
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la déconnexion', 'error');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log("Début de l'initialisation teacher.js");
    
    try {
        // Debug: Vérifiez si la session existe
        console.log("Envoi requête vérification auth...");
        
        const response = await fetch('/teacher/check-auth', {
            method: 'GET',
            credentials: 'include' // Essentiel pour les cookies
        });

        console.log("Réponse reçue:", response.status);

        if (!response.ok) {
            console.log("Non authentifié, redirection...");
            window.location.href = '/teacher/login-teacher';
            return;
        }

        const data = await response.json();
        console.log("Données session:", data);

        // Le reste de votre code d'initialisation...
        
    } catch (error) {
        console.error("Erreur vérification auth:", error);
        window.location.href = '/teacher/login-teacher';
    }
    // Charger les données initiales
    await loadProfile();
    
    // Gestion des onglets
    document.getElementById('profileBtn').addEventListener('click', () => {
        document.getElementById('profileSection').classList.add('active-section');
        document.getElementById('matieresSection').classList.remove('active-section');
        loadProfile();
    });
    
    document.getElementById('matieresBtn').addEventListener('click', () => {
        document.getElementById('matieresSection').classList.add('active-section');
        document.getElementById('profileSection').classList.remove('active-section');
        loadMatieres();
    });
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});