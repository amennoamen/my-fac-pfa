const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Login admin
// Modifiez la route de login comme suit :
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Tentative de connexion avec:', email);

    try {
        // Vérification de l'utilisateur admin
        const [users] = await db.query(`
            SELECT p.* 
            FROM personne p
            JOIN admin a ON p.CIN = a.CIN 
            WHERE p.email = ?`, 
            [email]);

        if (users.length === 0) {
            console.log('Email non trouvé');
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        const user = users[0];
        console.log('Admin trouvé:', user.nom);

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.mdp);
        if (!isMatch) {
            console.log('Mot de passe incorrect');
            return res.status(401).json({ error: 'Identifiants invalides' });
        }

        // Création de la session
        req.session.user = {
            CIN: user.CIN,
            email: user.email,
            nom: user.nom,
            isAdmin: true
        };

        req.session.save((err) => {
            if (err) {
                console.error('Erreur sauvegarde session:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            console.log('Connexion réussie');
            return res.json({ success: true });
        });

    } catch (err) {
        console.error('Erreur serveur:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});
// Logout
router.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ message: 'Déconnexion réussie' });
});

// Vérifier la session
router.get('/check', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

module.exports = router;