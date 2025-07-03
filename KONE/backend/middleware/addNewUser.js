var mysql = require("mysql2");
let bcrypt = require("bcryptjs");
var connection = require("../database");

const addNewUser = async (req, res, next) => {
    try {
        console.log("Route /signup atteinte avec : ", req.body);
        
        // Validation des données d'entrée

        if (!req.body.nom || !req.body.prenom || !req.body.email || !req.body.password) {
            return res.status(400).json({
                "Error": true, 
                "Message": "Tous les champs sont requis (nom, prenom, email, password)"
            });
        }

        let saltRounds = 10;
        let hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

        let post = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            password: hashedPassword
        };

        console.log("Données à insérer :", post);

        // Vérifier si l'email existe déjà

        let checkQuery = "SELECT email FROM users WHERE email = ?";
        
        connection.query(checkQuery, [post.email], function(err, rows) {
            if (err) {
                console.error("Erreur lors de la vérification de l'email :", err);
                return res.status(500).json({
                    "Error": true, 
                    "Message": "Erreur lors de la vérification de l'email"
                });
            }

            if (rows.length > 0) {
                return res.status(409).json({
                    "Error": true, 
                    "Message": "Cet email est déjà enregistré"
                });
            }

            // Insérer le nouvel utilisateur
            
            let insertQuery = "INSERT INTO users SET ?";
            
            connection.query(insertQuery, post, function(err, result) {
                if (err) {
                    console.error("Erreur lors de l'insertion :", err);
                    return res.status(500).json({
                        "Error": true, 
                        "Message": "Erreur lors de l'insertion en base de données",
                        "Details": err.message
                    });
                }

                console.log("Utilisateur créé avec succès, ID :", result.insertId);
                res.status(201).json({
                    "Error": false, 
                    "Message": "Utilisateur créé avec succès",
                    "userId": result.insertId
                });
            });
        });

    } catch (error) {
        console.error('Erreur dans addNewUser :', error);
        res.status(500).json({
            "Error": true, 
            "Message": "Erreur interne du serveur",
            "Details": error.message
        });
    }
}

module.exports = addNewUser;