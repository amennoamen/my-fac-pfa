const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware pour vérifier l'authentification admin
const isAdmin = async (req, res, next) => {
    // Ici vous devriez vérifier si l'utilisateur est authentifié et est un admin
    // Pour simplifier, nous allons considérer que tout accès à /admin est autorisé
    next();
};

router.use(isAdmin);

// Gestion des étudiants
router.get('/students', async (req, res) => {
    try {
        const [students] = await db.query(`
            SELECT p.*, e.numinscri, e.annéeEntrée 
            FROM personne p
            JOIN etudiant e ON p.CIN = e.CIN
        `);
        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/students', async (req, res) => {
    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();
  
      const { CIN, nom, prénom, dateNaissance, email, adresse, mdp, numinscri, annéeEntrée } = req.body;
  
      // Vérification des données requises
      if (!CIN || !nom || !prénom || !email || !mdp || !numinscri || !annéeEntrée) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }
  
      // Requête corrigée pour personne
      await connection.query(
        `INSERT INTO personne 
         (CIN, nom, prénom, dateNaissance, email, adresse, mdp) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [CIN, nom, prénom, dateNaissance || null, email, adresse || '', mdp]
      );
  
      // Requête pour étudiant
      await connection.query(
        `INSERT INTO etudiant 
         (CIN, numinscri, annéeEntrée) 
         VALUES (?, ?, ?)`,
        [CIN, numinscri, annéeEntrée]
      );
  
      await connection.commit();
      res.status(201).json({ 
        success: true,
        message: `Étudiant ${nom} ${prénom} (CIN: ${CIN}) ajouté avec succès`
      });
      //res.status(201).json({ success: true });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error('Erreur SQL:', err.sqlMessage, '\nRequête:', err.sql);
      res.status(400).json({ 
        error: err.message,
        sqlError: err.sqlMessage 
      });
    } finally {
      if (connection) connection.release();
    }
  });

  router.put('/students/:cin', async (req, res) => {
    const { CIN, nom, prénom, email,  numinscri, annéeEntrée } = req.body;
    let connection;

    try {
        // 1. Obtenir une connexion dédiée
        connection = await db.getConnection();
        
        // 2. Démarrer la transaction
        await connection.beginTransaction();

        // 3. Mettre à jour la personne  'UPDATE personne SET nom = ?, prénom = ?, dateNaissance = ?, email = ?, adresse = ?, mdp = ? WHERE CIN = ?',[nom, prénom, dateNaissance, email, adresse, mdp, req.params.cin]
        await connection.query(
            'UPDATE personne SET nom = ?, prénom = ?, email = ?  WHERE CIN = ?',
            [nom, prénom,  email,  req.params.cin]
        );

        // 4. Mettre à jour l'étudiant
        await connection.query(
            'UPDATE etudiant SET numinscri = ?, annéeEntrée = ? WHERE CIN = ?',
            [numinscri, annéeEntrée, req.params.cin]
        );

        // 5. Valider la transaction
        await connection.commit();
        res.json({ message: 'Étudiant mis à jour' });

    } catch (err) {
        // 6. Annuler en cas d'erreur
        if (connection) await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });

    } finally {
        // 7. Toujours libérer la connexion
        if (connection) connection.release();
    }
});
router.get('/students/:cin', async (req, res) => {
    const { cin } = req.params;
    
    try {
      const [rows] = await db.query(`
        SELECT p.*, e.numinscri, e.annéeEntrée 
        FROM personne p
        JOIN etudiant e ON p.CIN = e.CIN
        WHERE p.CIN = ?
      `, [cin]);
  
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Étudiant non trouvé' });
      }
  
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
router.delete('/students/:cin', async (req, res) => {
    const { cin } = req.params;
  let connection;

  try {
    // 1. Obtenir une connexion dédiée
    connection = await db.getConnection();
    
    // 2. Commencer la transaction
    await connection.beginTransaction();

    // 3. D'abord supprimer de la table etudiant (à cause de la contrainte de clé étrangère)
    await connection.query('DELETE FROM etudiant WHERE CIN = ?', [cin]);

    // 4. Ensuite supprimer de la table personne (la suppression en cascade devrait fonctionner)
    await connection.query('DELETE FROM personne WHERE CIN = ?', [cin]);

    // 5. Valider la transaction
    await connection.commit();

    res.json({ 
      success: true,
      message: `Étudiant avec CIN ${cin} supprimé avec succès`
    });
  } catch (err) {
    // 6. Rollback en cas d'erreur
    if (connection) await connection.rollback();
    
    console.error('Erreur suppression:', err);
    res.status(500).json({ 
      success: false,
      error: err.message,
      sqlError: err.sqlMessage 
    });
  } finally {
    // 7. Toujours libérer la connexion
    if (connection) connection.release();
  }
});

// Gestion des notes
router.get('/grades', async (req, res) => {
    try {
        const [grades] = await db.query(`
            SELECT n.*, m.nomMat as matiere_nom, p.nom as etudiant_nom, p.prénom as etudiant_prenom
            FROM note n
            JOIN matiere m ON n.matiere_id = m.idMat
            JOIN etudiant e ON n.CIN = e.CIN
            JOIN personne p ON e.CIN = p.CIN
        `);
        res.json(grades);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/grades', async (req, res) => {
    const { CIN, matiere_id, valeur } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO note (CIN, matiere_id, valeur) VALUES (?, ?, ?)',
            [CIN, matiere_id, valeur]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.put('/grades/:id', async (req, res) => {
    const { CIN, matiere_id, valeur } = req.body;

    try {
        await db.query(
            'UPDATE note SET CIN = ?, matiere_id = ?, valeur = ? WHERE CIN = ? AND matiere_id = ?',
            [CIN, matiere_id, valeur, req.params.id.split('-')[0], req.params.id.split('-')[1]]
        );
        res.json({ message: 'Note mise à jour' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.delete('/grades/:id', async (req, res) => {
    try {
        await db.query(
            'DELETE FROM note WHERE CIN = ? AND matiere_id = ?',
            [req.params.id.split('-')[0], req.params.id.split('-')[1]]
        );
        res.json({ message: 'Note supprimée' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Autres routes nécessaires
router.get('/matieres', async (req, res) => {
    try {
        const [matieres] = await db.query('SELECT * FROM matiere');
        res.json(matieres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;