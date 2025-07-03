var mysql = require("mysql2");
var bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken'); 
var config = require('../config');
var connection = require("../database");

const userLoginCheck = async (req, res, next) => {
    console.log("=== DÉBUT userLoginCheck ===");
    console.log("req.body:", req.body);
    
    try {
        // Vérification des données d'entrée

        if (!req.body || !req.body.email || !req.body.password) {
            console.log("❌ Données manquantes:", {
                body: req.body,
                email: req.body?.email,
                password: req.body?.password ? "présent" : "absent"
            });
            return res.status(400).json({
                "Error": true, 
                "Message": "Email et mot de passe requis"
            });
        }

        let post = {
            password: req.body.password,
            email: req.body.email
        };

        console.log("✅ Données validées:", {
            email: post.email,
            password: "présent"
        });

        // Requête simple pour la structure de ma table users

        let query = "SELECT * FROM users WHERE email = ?"; 
        
        console.log("Exécution de la requête:", query);
        console.log("Paramètre email:", post.email);

        connection.query(query, [post.email], async (err, rows) => {
            console.log("=== RÉSULTAT DE LA REQUÊTE ===");
            
            if (err) {
                console.error("❌ Erreur MySQL:", err);
                return res.status(500).json({
                    "Error": true, 
                    "Message": "Erreur de base de données: " + err.message
                });
            }

            console.log("Nombre de résultats:", rows ? rows.length : 0);
            console.log("Données brutes:", rows);

            if (!rows || rows.length === 0) {
                console.log("❌ Aucun utilisateur trouvé pour l'email:", post.email);
                return res.status(401).json({
                    "Error": true,
                    "Message": "Email incorrect"
                });
            }

            let user = rows[0];
            console.log("✅ Utilisateur trouvé:", {
                users_id: user.users_id,
                nom: user.nom,
                prenom: user.prenom,
                email: user.email,
                password_present: user.password ? "oui" : "non",
                password_length: user.password ? user.password.length : 0
            });

            if (!user.password) {
                console.log("❌ Pas de mot de passe dans la base");
                return res.status(500).json({
                    "Error": true,
                    "Message": "Mot de passe non défini pour cet utilisateur"
                });
            }

            try {
                console.log(" Comparaison du mot de passe...");
                console.log(" Mot de passe saisi:", post.password);
                console.log(" Hash en base (début):", user.password.substring(0, 10) + "...");
                
                let isMatch = await bcrypt.compare(post.password, user.password);
                console.log("Résultat comparaison:", isMatch);

                if (!isMatch) {
                    console.log("❌ Mot de passe incorrect");
                    return res.status(401).json({
                        "Error": true, 
                        "Message": "Mot de passe incorrect"
                    });
                }

                console.log("✅ Authentification réussie");

                // Générer le token JWT

                let tokenPayload = {
                    id_users: user.id_users,
                    email: user.email,
                    nom: user.nom,
                    prenom: user.prenom,
                    role: user.role    // Ajout du rôle dans le token
                };
                
                console.log("🎫 Génération du token avec payload:", tokenPayload);
                let token = jwt.sign(tokenPayload, config.secret, { expiresIn: '24h' });   
                console.log("🎫 Token généré (début):", token.substring(0, 20) + "...");

                // Préparation de l'objet utilisateur à envoyer au frontend///
                
const userData = {
    users_id: user.id_users,  // ⚠️ C'est ici qu'on ajoute l'ID
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role          // Ajout du rôle pour differencier Admin et Etudiant
};

                // POUR LE DÉBOGAGE, ON SAUTE LA SAUVEGARDE EN BASE ET ON RETOURNE DIRECTEMENT
                // Envoie une seule réponse et stoppe la fonction

return res.json({
    success: true,
    id_users: user.id_users, 
    email: user.email,
    nom: user.nom,
    prenom: user.prenom,
    role: user.role,      //  renvoie le rôle (0 ou 1)
    message: 'Connexion réussie',
    token: token,
});


            } catch (bcryptError) {
                console.error("❌ Erreur bcrypt:", bcryptError);
                return res.status(500).json({
                    "Error": true, 
                    "Message": "Erreur lors de la vérification du mot de passe"
                });
            }
        });

    } catch (error) {
        console.error("❌ Erreur générale:", error);
        return res.status(500).json({
            "Error": true, 
            "Message": "Erreur interne: " + error.message
        });
    }
};

module.exports = userLoginCheck;