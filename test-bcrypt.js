const bcrypt = require('bcryptjs');

// Test avec le hash existant
const testHashComparison = async () => {
  const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4H3d8pOGq3dJYl1J1vR6w2XyF1K.';
  const password = 'admin123';

  try {
    const match = await bcrypt.compare(password, hash);
    console.log('Le mot de passe correspond:', match);
    
    // Génération d'un nouveau hash pour vérification
    const newHash = await bcrypt.hash(password, 10);
    console.log('Nouveau hash généré:', newHash);
    console.log('Comparaison avec nouveau hash:', await bcrypt.compare(password, newHash));
  } catch (error) {
    console.error('Erreur de test:', error);
  }
};

testHashComparison();