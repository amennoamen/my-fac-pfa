const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware pour vérifier l'authentification enseignant bch ttfs5
const isEtudiant = async (req, res, next) => {

    next();
};

router.use(isEtudiant);

// Route pour obtenir les infos de l'enseignant connecté
router.get('/profile', async (req, res) => {
    try {
        const [etudiants] = await db.query(`
            SELECT p.*,e.numinscri,e.annéeEntrée
            FROM personne p
            JOIN etudiant e ON p.CIN = e.CIN
            WHERE p.CIN = ?
        `, [req.session.etudiant.CIN]);

        if (etudiants.length === 0) {
            return res.status(404).json({ error: 'Enseignant non trouvé' });
        }

        res.json(etudiants[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


module.exports = router;