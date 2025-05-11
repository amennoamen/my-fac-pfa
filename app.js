require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const etudiantRoutes = require('./routes/etudiant');
const authETRoutes = require('./routes/authEtudiant');

const fs = require('fs');
//proff//
const teacherRoutes = require('./routes/teacher');
const authTeacherRoutes = require('./routes/authEnseignant');

const app = express();
// Ajoutez ce bloc IMMÉDIATEMENT après les "const app = express();"
app.use((req, res, next) => {
  if (req.path.includes('.well-known') || 
      req.path.includes('chrome-devtools')) {
    console.log(`Requête technique ignorée: ${req.path}`);
    return res.status(204).end(); // Ne pas renvoyer d'erreur
  }
  next();
});
// Configuration de sécurité
app.use(helmet({
  contentSecurityPolicy: false // Désactivé temporairement pour le debug
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// Configuration de la session
app.use(session({
  secret: process.env.SESSION_SECRET || 'votre_secret_ici_plus_complexe',
    resave: true, // Changé à true
    saveUninitialized: true, // Changé à true
  cookie: { 
    secure: false, // Mettre à true en production avec HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  }
}));
///zeyd 
app.use((req, res, next) => {
  console.log('\n=== NOUVELLE REQUÊTE ===');
  console.log('URL:', req.url);
  console.log('Session:', req.session.user);
  console.log('Cookies:', req.headers.cookie);
  next();
});
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques publics
app.use(express.static(path.join(__dirname, 'public')));
// Juste après express.static()
app.use('/teacher/assets', express.static(path.join(__dirname, 'teacher', 'assets')));
app.use('/teacher/css', express.static(path.join(__dirname, 'teacher', 'css')));
app.use('/teacher/js', express.static(path.join(__dirname, 'teacher', 'js')));
app.use('/teacher', express.static(path.join(__dirname, 'teacher')));
app.use('/views', express.static(path.join(__dirname, 'views')));
// Assurez-vous d'avoir cette ligne dans app.js
app.use('/etudiant/assets', express.static(path.join(__dirname, 'etudiant', 'assets')));
app.use('/etudiant/css', express.static(path.join(__dirname, 'etudiant', 'css')));
app.use('/etudiant/js', express.static(path.join(__dirname, 'etudiant', 'js')));
app.use('/etudiant', express.static(path.join(__dirname, 'etudiant')));
app.use('/views', express.static(path.join(__dirname, 'views')));

// Routes API
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

app.use('/teacher', teacherRoutes);
app.use('/auth',authTeacherRoutes);
app.post('/teacher/login-teacher', authTeacherRoutes);
///////etudiant
app.use('/etudiant', etudiantRoutes);
app.use('/auth',authETRoutes);
app.post('/etudiant/login-etudiant', authETRoutes);

// Route de login admin 
app.get('/admin/login', (req, res) => {
  const loginPath = path.join(__dirname, 'admin', 'login.html');
  console.log('Envoi du fichier login:', loginPath);
  
  // Vérification que le fichier existe
  const fs = require('fs');
  if (fs.existsSync(loginPath)) {
    return res.sendFile(loginPath);
  } else {
    console.error('Fichier login.html introuvable dans le dossier admin');
    return res.status(404).send('Page de login introuvable');
  }
});

//route de login etudiant
app.get('/teacher/login-teacher', (req, res) => {
   const loginPath = path.join(__dirname, 'teacher', 'views', 'teacher-login.html');
  console.log('Chemin vérifié:', loginPath); // Pour débogage
  
  if (fs.existsSync(loginPath)) {
    return res.sendFile(loginPath);
  } else {
    console.error('Fichier teacher-login.html introuvable dans views/');
    return res.status(404).send('Page de login enseignant introuvable');
  }
});

// Middleware pour empêcher l'accès direct aux fichiers HTML
app.use('/admin', (req, res, next) => {
  if (req.path.endsWith('.html') && !req.path.endsWith('login.html')) {
    return res.redirect('/admin/login');
  }
  next();
})
//empecher l'acces direct aux fichiers html
app.get('/etudiant/login-etudiant', (req, res) => {
   const loginPath = path.join(__dirname, 'etudiant', 'views', 'loginEtudiant.html');
  console.log('Chemin vérifié:', loginPath); // Pour débogage
  
  if (fs.existsSync(loginPath)) {
    return res.sendFile(loginPath);
  } else {
    console.error('Fichier loginEtudiant.html introuvable dans views/');
    return res.status(404).send('Page de login etudiant introuvable');
  }
});

// Ajoutez cette protection pour les routes teacher
app.use('/etudiant', (req, res, next) => {
  if (req.path.endsWith('.html') && !req.path.endsWith('loginEtudiant.html')) {
    return res.redirect('/etudiant/login-etudiant');
  }
  next();
});

// Servir les fichiers statiques admin (sauf HTML)
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
  index: false, // Désactive l'index automatique
  extensions: ['html'] // Désactive l'extension automatique
}));
// Servir les fichiers statiques etudiant (sauf HTML)
app.use('/etudiant', express.static(path.join(__dirname, 'etudiant'), {
  index: false, // Désactive l'index automatique
  extensions: ['html'] // Désactive l'extension automatique
}));

// Modifiez la protection des routes admin comme suit :
app.use('/admin/*', (req, res, next) => {
  console.log('Protection admin - Path:', req.path);
  
  // Liste des routes autorisées sans authentification
  const allowedRoutes = ['/admin/login', '/admin/login.html', '/admin/api'];
  
  if (!req.session.user && !allowedRoutes.some(route => req.path.startsWith(route))) {
    console.log('Redirection vers login - Non authentifié');
    return res.redirect('/admin/login');
  }
  
  next();
});


// Protection des routes teacher (version corrigée)
app.use('/etudiant/*', (req, res, next) => {
  const allowedRoutes = [
    '/etudiant/login-etudiant', // Conservé comme vous le souhaitez
    '/etudiant/api',
    '/etudiant/auth',
    '/etudiant/js',
    '/etudiant/css',
    '/etudiant/assets'
  ];
  
  // Autoriser les fichiers statiques
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$/)) {
    return next();
  }
  
  if (!req.session.etudiant && !allowedRoutes.some(route => req.path.startsWith(route))) {
    console.log('Redirection vers login - Session manquante');
    return res.redirect('/etudiant/login-etudiant'); // Redirection cohérente
  }
  
  next();
});

app.get('/admin', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  res.sendFile(path.join(__dirname, 'admin', 'adminPage.html'));
});


app.get('/etudiant', (req, res) => {
  if (!req.session.etudiant) {
    return res.redirect('/etudiant/login-etudiant');
  }
   const etudiantPath = path.join(__dirname, 'etudiant','views', 'Etudiant.html');
       // Debug: Vérification du chemin
    console.log('Chemin vérifié:', etudiantPath);
    console.log('Fichier existe:', fs.existsSync(etudiantPath));

    if (!fs.existsSync(etudiantPath)) {
        console.error('ERREUR: Fichier non trouvé à', etudiantPath);
        return res.status(404).send('Page enseignant non trouvée');
    }
  res.sendFile(etudiantPath);
});
app.get('/etudiant/check-auth', (req, res) => {
    console.log('Vérification session etudiant:', req.session.etudiant);
    
    if (!req.session?.etudiant) {
        console.log('Aucune session teacher trouvée');
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    // Renvoyez les infos de session pour le debug
    res.json({
        isAuthenticated: true,
        session: req.session.etudiant
    });
});
// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
////prof/////:

// Ajoutez cette protection pour les routes teacher
app.use('/teacher', (req, res, next) => {
  if (req.path.endsWith('.html') && !req.path.endsWith('teacher-login.html')) {
    return res.redirect('/teacher/login-teacher');
  }
  next();
});

// Configuration des fichiers statiques pour teacher
app.use('/teacher', express.static(path.join(__dirname, 'teacher'), {
  index: false,
  extensions: ['html']
}));

// Protection des routes teacher
// Protection des routes teacher (version corrigée)
app.use('/teacher/*', (req, res, next) => {
  const allowedRoutes = [
    '/teacher/login-teacher', // Conservé comme vous le souhaitez
    '/teacher/api',
    '/teacher/auth',
    '/teacher/js',
    '/teacher/css',
    '/teacher/assets'
  ];
  
  // Autoriser les fichiers statiques
  if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|ico|woff|woff2|ttf|svg)$/)) {
    return next();
  }
  
  if (!req.session.teacher && !allowedRoutes.some(route => req.path.startsWith(route))) {
    console.log('Redirection vers login - Session manquante');
    return res.redirect('/teacher/login-teacher'); // Redirection cohérente
  }
  
  next();
});
// Route pour l'espace enseignant
app.get('/teacher', (req, res) => {
  if (!req.session.teacher) {
    return res.redirect('/teacher/login-teacher');
  }
   const teacherPath = path.join(__dirname, 'teacher','views', 'teacher.html');
       // Debug: Vérification du chemin
    console.log('Chemin vérifié:', teacherPath);
    console.log('Fichier existe:', fs.existsSync(teacherPath));

    if (!fs.existsSync(teacherPath)) {
        console.error('ERREUR: Fichier non trouvé à', teacherPath);
        return res.status(404).send('Page enseignant non trouvée');
    }
  res.sendFile(teacherPath);
});
app.get('/teacher/check-auth', (req, res) => {
    console.log('Vérification session teacher:', req.session.teacher);
    
    if (!req.session?.teacher) {
        console.log('Aucune session teacher trouvée');
        return res.status(401).json({ error: 'Non authentifié' });
    }
    
    // Renvoyez les infos de session pour le debug
    res.json({
        isAuthenticated: true,
        session: req.session.teacher
    });
});
// Gestion des erreurs 404
app.use((req, res, next) => {
  // Ne pas logger les requêtes techniques
  if (!req.path.includes('.well-known') && !req.path.includes('chrome-devtools')) {
    console.log('404 - Page non trouvée:', req.path);
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
  } else {
    res.status(204).end(); // Réponse silencieuse pour les requêtes techniques
  }
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur:', err.stack);
  const errorFile = req.path.startsWith('/admin') 
    ? path.join(__dirname, 'admin', '500.html')
    : path.join(__dirname, 'public', '500.html');
  res.status(500).sendFile(errorFile);
});

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Accès admin: http://localhost:${PORT}/admin`);
  console.log(`Login admin: http://localhost:${PORT}/admin/login`);
  console.log(`Accès enseignant: http://localhost:${PORT}/teacher`);
  console.log(`Login enseignant: http://localhost:${PORT}/teacher/login-teacher`);

});