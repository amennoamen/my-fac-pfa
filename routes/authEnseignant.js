const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../models/db');

router.post('/login-teacher', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const [users] = await db.query(`
            SELECT p.*, e.grade, e.idDep 
            FROM personne p
            JOIN enseignant e ON p.CIN = e.CIN 
            WHERE p.email = ? AND p.mdp = ?`,  // Comparaison directe
            [email, password]);
            console.log('Résultat requête DB:', users);

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false,
                error: 'Identifiants invalides' 
            });
        }

        const user = users[0];
  
        // Session spécifique aux enseignants
        req.session.teacher = {
            CIN: user.CIN,
            email: user.email,
            nom: user.nom,
            prenom: user.prénom,
            grade: user.grade,
            departement: user.departement
        };

        res.json({ 
            success: true,
            redirect: '/teacher', // Ajout de l'URL de redirection
             user: { nom: user.nom, email: user.email }
        });

    } catch (err) {
        console.error('Erreur:', err);
        res.status(500).json({ 
            success: false,
            error: 'Erreur serveur' 
        });
    }
});

module.exports = router;