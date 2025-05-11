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
        const response = await fetch('/etudiant/profile', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données');
        }

        const data = await response.json();
        
        // Afficher les données dans la page
        document.getElementById('etudiantNom').textContent = data.nom || 'Non disponible';
        document.getElementById('etudiantPrenom').textContent = data.prénom || 'Non disponible';
        document.getElementById('etudiantEmail').textContent = data.email || 'Non disponible';
     document.getElementById('etudiantNumInscri').textContent = data.numinscri || 'Non disponible';
    document.getElementById('etudiantAnneeEntree').textContent = data.annéeEntrée || 'Non disponible';
       
    } catch (error) {
        console.error('Erreur:', error);
        // Vous pouvez ajouter ici un affichage d'erreur simple
        alert('Erreur lors du chargement du profil: ' + error.message);
    }
}

// Initialisation de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Chargement des données de l'etudiant...");
    loadProfile();

       document.getElementById('matieresBtn').addEventListener('click', () => {
        document.getElementById('matieresSection').classList.add('active-section');
        document.getElementById('profileSection').classList.remove('active-section');
            document.getElementById('emploiSection').classList.remove('active-section');

        
    });
    document.getElementById('emploiBtn').addEventListener('click', () => {
    document.getElementById('emploiSection').classList.add('active-section');
    document.getElementById('profileSection').classList.remove('active-section');
    document.getElementById('matieresSection').classList.remove('active-section');
    document.getElementById('documentsSection').classList.remove('active-section');

    
    // Ajoutez d'autres sections à masquer si nécessaire
});
document.getElementById('documentsBtn').addEventListener('click', () => {
      document.getElementById('emploiSection').classList.remove('active-section');
    document.getElementById('profileSection').classList.remove('active-section');
    document.getElementById('matieresSection').classList.remove('active-section');
    // Afficher la section documents
    document.getElementById('documentsSection').classList.add('active-section');
});
});

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
    console.log("Début de l'initialisation app.js");
    
    try {
        // Debug: Vérifiez si la session existe
        console.log("Envoi requête vérification auth...");
        
        const response = await fetch('/etudiant/check-auth', {
            method: 'GET',
            credentials: 'include' // Essentiel pour les cookies
        });

        console.log("Réponse reçue:", response.status);

        if (!response.ok) {
            console.log("Non authentifié, redirection...");
            window.location.href = '/etudiant/login-etudiant';
            return;
        }

        const data = await response.json();
        console.log("Données session:", data);

        // Le reste de votre code d'initialisation...
        
    } catch (error) {
        console.error("Erreur vérification auth:", error);
        window.location.href = '/etudiant/login-etudiant';
    }
    // Charger les données initiales
    await loadProfile();
    
    // Gestion des onglets
    document.getElementById('profileBtn').addEventListener('click', () => {
        document.getElementById('profileSection').classList.add('active-section');
        document.getElementById('matieresSection').classList.remove('active-section');
        document.getElementById('emploiSection').classList.remove('active-section');
            document.getElementById('documentsSection').classList.remove('active-section');


        loadProfile();
    });
    
 
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});