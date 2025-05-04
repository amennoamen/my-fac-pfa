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

// Fonctions d'authentification
async function checkAuth() {
  try {
      const response = await fetch('/auth/check', { credentials: 'include' });
      const data = await response.json();
      
      if (!data.isAuthenticated) {
          window.location.href = '/login.html';
      } else {
          // Vérifier si l'utilisateur est un étudiant
          if (data.role !== 'student') {
              logout();
              alert('Accès non autorisé. Cette page est réservée aux étudiants.');
              window.location.href = '/login.html';
          }
      }
  } catch (error) {
      console.error('Erreur de vérification d\'authentification:', error);
      window.location.href = '/login.html';
  }
}

async function login(email, password) {
  try {
      const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
          if (data.role === 'student') {
              window.location.href = '/student/dashboard.html';
          } else {
              showToast('Accès non autorisé. Cette page est réservée aux étudiants.', 'error');
          }
      } else {
          showToast(data.error || 'Erreur de connexion', 'error');
      }
  } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur de connexion', 'error');
  }
}

async function logout() {
  try {
      await fetch('/auth/logout', { 
          method: 'POST',
          credentials: 'include'
      });
      window.location.href = '/login.html';
  } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors de la déconnexion', 'error');
  }
}

// Chargement des informations de l'étudiant
async function loadStudentInfo() {
  try {
      const data = await fetchData('/student/profile');
      displayStudentInfo(data);
  } catch (error) {
      console.error('Erreur:', error);
      showToast('Erreur lors du chargement de vos informations', 'error');
  }
}


// Affichage des informations de l'étudiant
function displayStudentInfo(student) {
  document.getElementById('studentName').textContent = student.prénom + ' ' + student.nom;
  document.getElementById('studentEmail').textContent = student.email;
  document.getElementById('studentCIN').textContent = student.CIN;
  document.getElementById('studentNumber').textContent = student.numinscri || 'Non défini';
  document.getElementById('studentYear').textContent = student.annéeEntrée || 'Non défini';
  
}

// Fonctions utilitaires
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
  });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (!toast || !toastMessage) {
      // Créer un toast si inexistant
      const newToast = document.createElement('div');
      newToast.id = 'toast';
      newToast.className = `toast ${type}`;
      
      const newToastMessage = document.createElement('span');
      newToastMessage.id = 'toastMessage';
      newToastMessage.textContent = message;
      
      newToast.appendChild(newToastMessage);
      document.body.appendChild(newToast);
      
      setTimeout(() => {
          newToast.className = newToast.className.replace('show', '');
          setTimeout(() => {
              document.body.removeChild(newToast);
          }, 300);
      }, 3000);
      
      setTimeout(() => {
          newToast.className += ' show';
      }, 10);
  } else {
      // Utiliser le toast existant
      toast.className = `toast show ${type}`;
      toastMessage.textContent = message;
      
      setTimeout(() => {
          toast.classList.remove('show');
      }, 3000);
  }
}

// Gestion des onglets
function openTab(evt, tabName) {
  // Cache tous les contenus des onglets
  const tabContent = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabContent.length; i++) {
      tabContent[i].style.display = 'none';
  }
  
  // Retirer la classe active de tous les onglets
  const tabLinks = document.getElementsByClassName('tab-link');
  for (let i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(' active', '');
  }
  
  // Afficher l'onglet sélectionné et ajouter la classe active
  document.getElementById(tabName).style.display = 'block';
  evt.currentTarget.className += ' active';
  
  // Charger les données en fonction de l'onglet
  if (tabName === 'infoTab') {
      loadStudentInfo();
  } else if (tabName === 'gradesTab') {
      loadStudentGrades();
  } else if (tabName === 'scheduleTab') {
      loadStudentSchedule();
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  
  // Charger les informations par défaut
  loadStudentInfo();
  
  // Configurer les écouteurs d'événements
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      logout();
  });
  
  // Configurer les onglets
  const tabLinks = document.getElementsByClassName('tab-link');
  for (let i = 0; i < tabLinks.length; i++) {
      tabLinks[i].addEventListener('click', function(e) {
          const tabName = this.getAttribute('data-tab');
          openTab(e, tabName);
      });
  }
  
  // Ouvrir l'onglet par défaut
  document.querySelector('.tab-link').click();
});