
 const connectionString = "1742462697092@127.0.0.1:3306/api";


const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'konezana01',  // mot de passe de ma base
    database:'api',   // Nom de ma base de donnée
    port: 4400
   
});

connection.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion à la base de données :', err.message);
    } else {
        console.log('✅ Connecté à la base de données MySQL avec succès !');
    }
});

module.exports = connection;
