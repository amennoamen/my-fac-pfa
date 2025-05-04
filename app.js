require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');
const EtudiantRoutes = require('./routes/Etudiant');
const authETRoutes = require('./routes/authEtudiant');

const app = express();

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
  resave: false,
  saveUninitialized: false,
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

// Routes API
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/Etudiant',EtudiantRoutes);
app.use('/authEtudiant',authETRoutes);

// Route de login admin - version corrigée
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
app.get('/Etudiant/loginEtudiant', (req, res) => {
  const loginPath = path.join(__dirname, 'Etudiant', 'loginEtudiant.html');
  console.log('Envoi du fichier login:', loginPath);
  
  // Vérification que le fichier existe
  const fs = require('fs');
  if (fs.existsSync(loginPath)) {
    return res.sendFile(loginPath);
  } else {
    console.error('Fichier loginEtudiant.html introuvable dans le dossier etudiant');
    return res.status(404).send('Page de login introuvable');
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
app.use('/Etudiant', (req, res, next) => {
  if (req.path.endsWith('.html') && !req.path.endsWith('loginEtudiant.html')) {
    return res.redirect('/Etudiant/loginEtudiant');
  }
  next();
})

// Servir les fichiers statiques admin (sauf HTML)
app.use('/admin', express.static(path.join(__dirname, 'admin'), {
  index: false, // Désactive l'index automatique
  extensions: ['html'] // Désactive l'extension automatique
}));
// Servir les fichiers statiques etudiant (sauf HTML)
app.use('/Etudiant', express.static(path.join(__dirname, 'Etudiant'), {
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

// Modifiez la protection des routes etudiant comme suit :
app.use('/Etudiant/*', (req, res, next) => {
  console.log('Protection etudiant - Path:', req.path);
  
  // Liste des routes autorisées sans authentification
  const allowedRoutes = ['/Etudiant/loginEtudiant', '/Etudiant/loginEtudiant.html', '/etudiant/api'];
  
  if (!req.session.user && !allowedRoutes.some(route => req.path.startsWith(route))) {
    console.log('Redirection vers login - Non authentifié');
    return res.redirect('/Etudiant/loginEtudiant');
  }
  
  next();
});

// Modifiez la route /admin comme suit :
app.get('/admin', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/admin/login');
  }
  res.sendFile(path.join(__dirname, 'admin', 'adminPage.html'));
});

// Modifiez la route /etudiant comme suit :
app.get('/etudiant', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/Etudiant/loginEtudiant');
  }
  res.sendFile(path.join(__dirname, 'Etudiant', 'etudiantPage.html'));
});
// Route racine
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  console.log('404 - Page non trouvée:', req.path);
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
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

});