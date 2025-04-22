const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

// Login admin
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier si l'utilisateur est un admin
        const [users] = await db.query(`
            SELECT p.* 
            FROM personne p
            JOIN admin a ON p.CIN = a.CIN
            WHERE p.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        const user = users[0];

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.mdp);
        if (!isMatch) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }

        // Créer la session
        req.session.user = {
            CIN: user.CIN,
            email: user.email,
            nom: user.nom,
            prénom: user.prénom,
            isAdmin: true
        };

        res.json({ message: 'Connexion réussie', user: req.session.user });
    } catch (err) {
        console.error(err);
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