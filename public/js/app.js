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
        }
    } catch (error) {
        console.error('Erreur de vérification d\'authentification:', error);
        window.location.href = '/login.html';
    }
}

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

// Gestion des étudiants
async function loadStudents() {
    try {
        const data = await fetchData('/admin/students');
        renderStudentsTable(data);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement des étudiants', 'error');
    }
}

async function saveStudent(studentData) {
    try {
      const response = await fetch('http://localhost:3000/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
        credentials: 'include'
      });
  
      
    const result = await response.json();
    
    if (response.ok) {
      showToast(result.message || 'Étudiant ajouté avec succès', 'success');
      return true;
    } else {
      throw new Error(result.error || 'Erreur lors de l\'ajout');
    }
  } catch (error) {
    showToast(error.message, 'error');
    return false;
  }
  }

  async function deleteStudent(cin) {
    if (!confirm(`Voulez-vous vraiment supprimer l'étudiant ${cin} ?`)) {
      return;
    }
  
    try {
      const response = await fetch(`/admin/students/${cin}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
  
      const result = await response.json();
      
      if (response.ok) {
        showToast(result.message, 'success');
        loadStudents(); // Rafraîchir la liste
      } else {
        throw new Error(result.error || 'Erreur de suppression');
      }
    } catch (error) {
      showToast(error.message, 'error');
    }
  }
// Gestion des notes
async function loadGrades() {
    try {
        const data = await fetchData('/admin/grades');
        renderGradesTable(data);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement des notes', 'error');
    }
}

async function saveGrade(gradeData, isEdit = false) {
    try {
        const url = `/admin/grades${isEdit ? `/${gradeData.id}` : ''}`;
        const method = isEdit ? 'PUT' : 'POST';
        
        await fetchData(url, method, gradeData);
        showToast(isEdit ? 'Note mise à jour' : 'Note ajoutée');
        loadGrades();
        return true;
    } catch (error) {
        console.error('Erreur:', error);
        showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
        return false;
    }
}

async function deleteGrade(id) {
    try {
        await fetchData(`/admin/grades/${id}`, 'DELETE');
        showToast('Note supprimée');
        loadGrades();
    } catch (error) {
        console.error('Erreur:', error);
        showToast(error.message || 'Erreur lors de la suppression', 'error');
    }
}
/////////// Edit student /////////////////
// Fonction pour gérer la modification d'étudiant
async function editStudent(cin) {
    try {
      showToast('Chargement des données étudiantes...', 'info');
      
      const response = await fetch(`/admin/students/${cin}`);
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Échec du chargement');
      }
      // Debug: vérifier si le modal existe avant de l'utiliser
      console.log('Modal element:', document.getElementById('editModal')); // <-- ICI
      // Remplissage dynamique du formulaire
      const fieldsMapping = {
        'editCin': 'CIN',
        'editNom': 'nom',
        'editPrenom': 'prénom', 
        'editEmail': 'email',
        'editNumInscri': 'numinscri',
        'editAnneeEntree': 'annéeEntrée'
      };
  
      Object.entries(fieldsMapping).forEach(([id, field]) => {
        const element = document.getElementById(id);
        if (element) element.value = data[field] || '';
      });
  
      document.getElementById('editModal').style.display = 'block';
      
    } catch (error) {
      console.error('Erreur détaillée:', error);
      showToast(error.message, 'error');
      
      // Si l'étudiant n'existe plus, rafraîchir la liste
      if (error.message.includes('non trouvé')) {
        setTimeout(() => loadStudents(), 2000);
      }
    }
  }
////////////////////////UPDATE////////////
async function updateStudent() {
    const formData = {
        CIN: document.getElementById('editCin').value,
        nom: document.getElementById('editNom').value,
        prénom: document.getElementById('editPrenom').value,
        email: document.getElementById('editEmail').value,
        numinscri: document.getElementById('editNumInscri').value,
        annéeEntrée: document.getElementById('editAnneeEntree').value
    };
    // 2. DEBUG: Affiche les données AVANT envoi
    console.log('Données envoyées:', formData); // <-- ICI (avant le fetch)

    try {
        const response = await fetch(`/admin/students/${formData.CIN}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'include'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        console.log('Réponse du serveur:', result); // <-- ICI (après response.json())
        
        if (!response.ok) {
            throw new Error(result.error || 'Échec de la mise à jour');
        }

        showToast('Étudiant mis à jour avec succès!', 'success');
        document.getElementById('editModal').style.display = 'none';
        loadStudents(); // Rafraîchir la liste
    } catch (error) {
        console.error('Erreur updateStudent:', error);
        showToast(error.message || 'Erreur lors de la modification', 'error');
    }
}

// Fonctions d'affichage ///////  lena zeda ken 5dmt nzidouha 
function renderStudentsTable(students) {
    const tbody = document.querySelector('#studentsTable tbody');
    tbody.innerHTML = '';
    
    if (!students || students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Aucun étudiant trouvé</td></tr>';
        return;
    }
    
    students.forEach(student => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${student.CIN}</td>
            <td>${student.nom}</td>
            <td>${student.prénom}</td>
            <td>${student.email}</td>
            <td>${student.numinscri || ''}</td>
            <td>
                <button class="action-btn btn-edit edit-btn" data-id="${student.CIN}">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="action-btn btn-delete delete-btn" data-id="${student.CIN}">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => editStudent(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
                deleteStudent(btn.dataset.id);
            }
        });
    });
}

function renderGradesTable(grades) {
    const tbody = document.querySelector('#gradesTable tbody');
    tbody.innerHTML = '';
    
    if (!grades || grades.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Aucune note trouvée</td></tr>';
        return;
    }
    
    grades.forEach(grade => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${grade.CIN} - ${grade.etudiant_nom} ${grade.etudiant_prenom}</td>
            <td>${grade.matiere_nom}</td>
            <td>${grade.valeur}</td>
            <td>
                <button class="action-btn btn-edit edit-grade-btn" data-id="${grade.CIN}-${grade.matiere_id}">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="action-btn btn-delete delete-grade-btn" data-id="${grade.CIN}-${grade.matiere_id}">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.edit-grade-btn').forEach(btn => {
        btn.addEventListener('click', () => editGrade(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-grade-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
                deleteGrade(btn.dataset.id);
            }
        });
    });
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

// Fonctions pour les modales //////////
function openStudentModal(student = null) {
    const modal = document.getElementById('studentModal');
    const title = document.getElementById('studentModalTitle');
    
    if (student) {
        title.textContent = 'Modifier étudiant';
        document.getElementById('studentId').value = student.CIN;
        document.getElementById('cin').value = student.CIN;
        document.getElementById('lastName').value = student.nom;
        document.getElementById('firstName').value = student.prénom;
        document.getElementById('email').value = student.email;
        document.getElementById('registrationNumber').value = student.numinscri;
        document.getElementById('entryYear').value = student.annéeEntrée;
    } else {
        title.textContent = 'Ajouter étudiant';
        document.getElementById('studentForm').reset();
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function openGradeModal(grade = null) {
    const modal = document.getElementById('gradeModal');
    const title = document.getElementById('gradeModalTitle');
    
    if (grade) {
        title.textContent = 'Modifier note';
        document.getElementById('gradeId').value = grade.id;
        document.getElementById('studentCin').value = grade.CIN;
        document.getElementById('subjectId').value = grade.matiere_id;
        document.getElementById('grade').value = grade.valeur;
    } else {
        title.textContent = 'Ajouter note';
        document.getElementById('gradeForm').reset();
    }
    
    modal.style.display = 'block';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Gestion des formulaires
async function handleStudentSubmit(e) {
    e.preventDefault();
    
    const studentData = {
        CIN: document.getElementById('cin').value,
        nom: document.getElementById('lastName').value,
        prénom: document.getElementById('firstName').value,
        email: document.getElementById('email').value,
        dateNaissance: document.getElementById('birthDate').value,
        adresse: document.getElementById('address').value,
        mdp: document.getElementById('password').value || 'defaultPassword',
        numinscri: document.getElementById('registrationNumber').value,
        annéeEntrée: document.getElementById('entryYear').value
    };
    
    const isEdit = !!document.getElementById('studentId').value;
    
    if (await saveStudent(studentData, isEdit)) {
        closeModal('studentModal');
    }
}

async function handleGradeSubmit(e) {
    e.preventDefault();
    
    const gradeData = {
        CIN: document.getElementById('studentCin').value,
        matiere_id: document.getElementById('subjectId').value,
        valeur: parseFloat(document.getElementById('grade').value)
    };
    
    const isEdit = !!document.getElementById('gradeId').value;
    
    if (isEdit) {
        gradeData.id = document.getElementById('gradeId').value;
    }
    
    if (await saveGrade(gradeData, isEdit)) {
        closeModal('gradeModal');
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    
    // Chargement initial
    await loadStudents();
    await loadGrades();
    
    // Gestion des onglets
    document.getElementById('studentsTab').addEventListener('click', () => {
        document.getElementById('studentsSection').classList.add('active-section');
        document.getElementById('gradesSection').classList.remove('active-section');
        document.getElementById('addStudentBtn').style.display = 'flex';
        document.getElementById('addGradeBtn').style.display = 'none';
        document.getElementById('pageTitle').textContent = 'Gestion des Étudiants';
    });
    
    document.getElementById('gradesTab').addEventListener('click', () => {
        document.getElementById('gradesSection').classList.add('active-section');
        document.getElementById('studentsSection').classList.remove('active-section');
        document.getElementById('addStudentBtn').style.display = 'none';
        document.getElementById('addGradeBtn').style.display = 'flex';
        document.getElementById('pageTitle').textContent = 'Gestion des Notes';
    });
    
    // Boutons d'ajout
    document.getElementById('addStudentBtn').addEventListener('click', () => openStudentModal());
    document.getElementById('addGradeBtn').addEventListener('click', () => openGradeModal());
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Fermeture des modales
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('studentModal');
            closeModal('gradeModal');
        });
    });
    
    // Fermer en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('studentModal')) {
            closeModal('studentModal');
        }
        if (event.target === document.getElementById('gradeModal')) {
            closeModal('gradeModal');
        }
    });
    
    // Soumission des formulaires
    document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
    document.getElementById('gradeForm').addEventListener('submit', handleGradeSubmit);
    ///////////////this for update nfs5ouha ken zeyda ////////
    // Écouteur pour le formulaire de modification
    document.getElementById('editStudentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateStudent();
        });

    // Fermeture du modal
    document.querySelector('#editModal .close-btn')?.addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});





});
// Fonctions d'authentification
async function checkAuth() {
    try {
        const response = await fetch('/auth/check');
        const data = await response.json();
        
        if (!data.isAuthenticated) {
            window.location.href = '/login.html';
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
            window.location.href = '/admin';
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
        await fetch('/auth/logout', { method: 'POST' });
        window.location.href = '/';
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors de la déconnexion', 'error');
    }
}

// Modifier l'initialisation pour vérifier l'authentification
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    
    // Le reste de votre code d'initialisation...
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
});