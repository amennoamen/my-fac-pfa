const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware pour vérifier l'authentification enseignant bch ttfs5
const isTeacher = async (req, res, next) => {

    next();
};

router.use(isTeacher);

// Route pour obtenir les infos de l'enseignant connecté
router.get('/profile', async (req, res) => {
    try {
        const [teacher] = await db.query(`
            SELECT p.*, e.grade, d.nomDep as departement 
            FROM personne p
            JOIN enseignant e ON p.CIN = e.CIN
            JOIN departement d ON e.idDep = d.idDep
            WHERE p.CIN = ?
        `, [req.session.teacher.CIN]);

        if (teacher.length === 0) {
            return res.status(404).json({ error: 'Enseignant non trouvé' });
        }

        res.json(teacher[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});


module.exports = router;