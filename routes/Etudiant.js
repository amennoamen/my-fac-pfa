const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Middleware pour vérifier l'authentification admin
const isEtudiant = async (req, res, next) => {
    // Ici vous devriez vérifier si l'utilisateur est authentifié et est un etudiant
    // Pour simplifier, nous allons considérer que tout accès à /etudiant est autorisé
    next();
};

router.use(isEtudiant);