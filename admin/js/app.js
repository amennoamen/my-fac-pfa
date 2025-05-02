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
// Gestion des Teachers
async function loadTeachers() {
    try {
        const data = await fetchData('/admin/teachers');
        renderTeachersTable(data);
    } catch (error) {
        console.error('Erreur:', error);
        showToast('Erreur lors du chargement des enseignants', 'error');
    }
}
async function saveTeacher(teacherData) {
    try {
        const response = await fetch('http://localhost:3000/admin/teachers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherData),
            credentials: 'include'
        });

        const result = await response.json();
        
        if (response.ok) {
            showToast(result.message || 'Enseignant ajouté avec succès', 'success');
            return true;
        } else {
            throw new Error(result.error || 'Erreur lors de l\'ajout');
        }
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    }
}
async function deleteTeacher(cin) {
    if (!confirm(`Voulez-vous vraiment supprimer l'enseignant ${cin} ?`)) {
        return;
    }

    try {
        const response = await fetch(`/admin/teachers/${cin}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });

        const result = await response.json();
        
        if (response.ok) {
            showToast(result.message, 'success');
            loadTeachers(); // Rafraîchir la liste
        } else {
            throw new Error(result.error || 'Erreur de suppression');
        }
    } catch (error) {
        showToast(error.message, 'error');
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

function renderTeachersTable(teachers) {
    const tbody = document.querySelector('#teachersTable tbody');
    tbody.innerHTML = '';
    
    if (!teachers || teachers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Aucun enseignant trouvé</td></tr>';
        return;
    }
    
    teachers.forEach(teacher => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${teacher.CIN}</td>
            <td>${teacher.nom}</td>
            <td>${teacher.prénom}</td>
            <td>${teacher.email}</td>
            <td>${teacher.grade || ''}</td>
            <td>
                <button class="action-btn btn-edit edit-teacher-btn" data-id="${teacher.CIN}">
                    <i class="fas fa-edit"></i> Modifier
                </button>
                <button class="action-btn btn-delete delete-teacher-btn" data-id="${teacher.CIN}">
                    <i class="fas fa-trash-alt"></i> Supprimer
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    document.querySelectorAll('.edit-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => editTeacher(btn.dataset.id));
    });
    
    document.querySelectorAll('.delete-teacher-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) {
                deleteTeacher(btn.dataset.id);
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

function openTeacherModal(teacher = null) {
    const modal = document.getElementById('teacherModal');
    const title = document.getElementById('teacherModalTitle');
    
    if (teacher) {
        title.textContent = 'Modifier enseignant';
        document.getElementById('teacherId').value = teacher.CIN;
        document.getElementById('teacherCin').value = teacher.CIN;
        document.getElementById('teacherLastName').value = teacher.nom;
        document.getElementById('teacherFirstName').value = teacher.prénom;
        document.getElementById('teacherEmail').value = teacher.email;
        document.getElementById('teacherGrade').value = teacher.grade;
    } else {
        title.textContent = 'Ajouter enseignant';
        document.getElementById('teacherForm').reset();
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

async function handleTeacherSubmit(e) {
    e.preventDefault();
    
    const teacherData = {
        CIN: document.getElementById('teacherCin').value,
        nom: document.getElementById('teacherLastName').value,
        prénom: document.getElementById('teacherFirstName').value,
        email: document.getElementById('teacherEmail').value,
        grade: document.getElementById('teacherGrade').value,
        dateNaissance: document.getElementById('TbirthDate').value,
        adresse: document.getElementById('Taddress').value,
        departmentId: document.getElementById('teacherDepartment').value,
        mdp: document.getElementById('teacherPassword').value || 'defaultPassword',
        

    };
    
    const isEdit = !!document.getElementById('teacherId').value;
    
    if (await saveTeacher(teacherData, isEdit)) {
        closeModal('teacherModal');
    }
}
//////update////////
async function editTeacher(cin) {
    try {
        showToast('Chargement des données enseignant...', 'info');
        
        const response = await fetch(`/admin/teachers/${cin}`);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Échec du chargement');
        }

        // Remplissage dynamique du formulaire
        const fieldsMapping = {
            'editTeacherCin': 'CIN',
            'editTeacherNom': 'nom',
            'editTeacherPrenom': 'prénom', 
            'editTeacherEmail': 'email',
            'editTeacherGrade': 'grade'
        };

        Object.entries(fieldsMapping).forEach(([id, field]) => {
            const element = document.getElementById(id);
            if (element) element.value = data[field] || '';
        });

        document.getElementById('editTeacherModal').style.display = 'block';
        
    } catch (error) {
        console.error('Erreur détaillée:', error);
        showToast(error.message, 'error');
        
        // Si l'enseignant n'existe plus, rafraîchir la liste
        if (error.message.includes('non trouvé')) {
            setTimeout(() => loadTeachers(), 2000);
        }
    }
}





async function updateTeacher() {
    const formData = {
        CIN: document.getElementById('editTeacherCin').value,
        nom: document.getElementById('editTeacherNom').value,
        prénom: document.getElementById('editTeacherPrenom').value,
        email: document.getElementById('editTeacherEmail').value,
        grade: document.getElementById('editTeacherGrade').value
    };

    try {
        const response = await fetch(`/admin/teachers/${formData.CIN}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'credentials': 'include'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.error || 'Échec de la mise à jour');
        }

        showToast('Enseignant mis à jour avec succès!', 'success');
        document.getElementById('editTeacherModal').style.display = 'none';
        loadTeachers(); // Rafraîchir la liste
    } catch (error) {
        console.error('Erreur updateTeacher:', error);
        showToast(error.message || 'Erreur lors de la modification', 'error');
    }
}
// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    
    // Chargement initial
    await loadStudents();
    await loadTeachers();
    
    // Gestion des onglets
    document.getElementById('studentsTab').addEventListener('click', () => {
        document.getElementById('studentsSection').classList.add('active-section');
        document.getElementById('teachersSection').classList.remove('active-section');
        document.getElementById('addStudentBtn').style.display = 'flex';
        document.getElementById('addTeacherBtn').style.display = 'none';
        document.getElementById('pageTitle').textContent = 'Gestion des Étudiants';
    });
    
    document.getElementById('teachersTab').addEventListener('click', () => {
        document.getElementById('teachersSection').classList.add('active-section');
        document.getElementById('studentsSection').classList.remove('active-section');
        document.getElementById('addStudentBtn').style.display = 'none';
        document.getElementById('addTeacherBtn').style.display = 'flex';
        document.getElementById('pageTitle').textContent = 'Gestion des Enseignants';
    });
    
    
    
    // Boutons d'ajout
    document.getElementById('addStudentBtn').addEventListener('click', () => openStudentModal());
    document.getElementById('addTeacherBtn').addEventListener('click', () => openTeacherModal());
    
    // Déconnexion
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Fermeture des modales
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal('studentModal');
            closeModal('teacherModal');
            closeModal('gradeModal');
            closeModal('editModal');
            closeModal('editTeacherModal');
        });
    });
    
    // Fermer en cliquant à l'extérieur
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('studentModal')) {
            closeModal('studentModal');
        }
        if (event.target === document.getElementById('teacherModal')) {
            closeModal('teacherModal');
        }
        if (event.target === document.getElementById('gradeModal')) {
            closeModal('gradeModal');
        }
        if (event.target === document.getElementById('editModal')) {
            closeModal('editModal');
        }
        if (event.target === document.getElementById('editTeacherModal')) {
            closeModal('editTeacherModal');
        }
    });
    
    // Soumission des formulaires
    document.getElementById('studentForm').addEventListener('submit', handleStudentSubmit);
    document.getElementById('teacherForm').addEventListener('submit', handleTeacherSubmit);
    
    // Écouteur pour le formulaire de modification étudiant
    document.getElementById('editStudentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateStudent();
    });

    // Écouteur pour le formulaire de modification enseignant
    document.getElementById('editTeacherForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await updateTeacher();
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