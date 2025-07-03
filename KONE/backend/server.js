var express = require("express");
var mysql = require("mysql2");
var cors = require('cors');
var bodyParser = require("body-parser");
const database = require('./database');


var verifyToken = require('./middleware/verifyToken');
var addNewUser = require('./middleware/addNewUser');
var userLoginCheck = require('./middleware/userLoginCheck');
var welcome = require('./middleware/welcome');
var Utilisateur = require('./middleware/Data/Utilisateur');

const port = process.env.PORT || 4100;

var app = express();
app.use(express.json());


// IMPORTANT: Définir la connection à la base de données
const db = database;

// Configuration CORS améliorée
app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"]
    
}));

// Middleware pour parser le JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Middleware de debug pour voir toutes les requêtes
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body:', req.body);
    }
    next();
});

// =================================
// ROUTE POUR LA GESTION DES reservations
// =================================


app.post('/api/livres/:id/reservation', (req, res) => {
  const livreId = parseInt(req.params.id);
  const { nom, email, telephone } = req.body;

  console.log('=== Nouvelle demande de réservation ===');
  console.log('Livre ID:', livreId);
  console.log('Données reçues:', { nom, email, telephone });

  if (isNaN(livreId) || livreId <= 0) {
    console.log('⛔ ID livre invalide');
    return res.status(400).json({ success: false, message: 'ID livre invalide' });
  }
  if (!nom || !email || !telephone) {
    console.log('⛔ Informations incomplètes');
    return res.status(400).json({ success: false, message: 'Informations incomplètes' });
  }

  // Vérifier si l'utilisateur a déjà réservé ce livre
  const checkReservationQuery = 'SELECT * FROM reservations WHERE livre_id = ? AND email = ?';
  db.query(checkReservationQuery, [livreId, email], (errCheck, resCheck) => {
    if (errCheck) {
      console.log('⛔ Erreur SQL vérif réservation:', errCheck);
      return res.status(500).json({ success: false, message: 'Erreur serveur (vérif réservation)' });
    }
    if (resCheck.length > 0) {
      console.log('⛔ Déjà réservé pour cet utilisateur');
      return res.status(400).json({ success: false, message: 'Réservation déjà effectuée pour ce livre par cet utilisateur.' });
    }

    // Vérifier disponibilité du livre
    const checkLivreQuery = 'SELECT disponible FROM livres WHERE id = ?';
    db.query(checkLivreQuery, [livreId], (err, results) => {
      if (err) {
        console.log('⛔ Erreur SQL vérif livre:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur (vérif livre)' });
      }
      if (results.length === 0) {
        console.log('⛔ Livre non trouvé');
        return res.status(404).json({ success: false, message: 'Livre non trouvé' });
      }
      if (!results[0].disponible) {
        console.log('⛔ Livre non disponible');
        return res.status(400).json({ success: false, message: 'Livre non disponible' });
      }

      // Insérer la réservation
      const insertReservationQuery = `
        INSERT INTO reservations (livre_id, nom, email, telephone, date_reservation)
        VALUES (?, ?, ?, ?, NOW())
      `;
      db.query(insertReservationQuery, [livreId, nom, email, telephone], (err2, result) => {
        if (err2) {
          console.log('⛔ Erreur SQL insertion réservation:', err2.sqlMessage || err2.message || err2);
          return res.status(500).json({ success: false, message: 'Erreur serveur (insert réservation)', error: err2 });
        }
        console.log('✅ Réservation insérée avec ID:', result.insertId);

        // Mettre livre indisponible
        const updateLivreQuery = 'UPDATE livres SET disponible = 0 WHERE id = ?';
        db.query(updateLivreQuery, [livreId], (err3) => {
          if (err3) {
            console.log('⛔ Erreur SQL mise à jour livre:', err3);
            // Ne bloque pas la réponse finale
          } else {
            console.log('Livre ID', livreId, 'marqué indisponible');
          }
          res.status(200).json({ success: true, message: 'Réservation enregistrée avec succès' });
        });
      });
    });
  });
});


// =================================
// ROUTE POUR LA GESTION DES UTILISATEURS 
// =================================

// Route GET pour récupérer tous les utilisateurs
app.get('/api/utilisateurs', (req, res) => {
    console.log(`${new Date().toISOString()} - GET /api/utilisateurs`);
    
    const query = `
        SELECT 
            id_users, 
            nom, 
            prenom, 
            email
        FROM users
        ORDER BY nom ASC, prenom ASC
    `;
    
    if (!db) {
        console.error('Erreur: Connection à la base de données non définie');
        return res.status(500).json({
            success: false,
            error: 'Erreur de configuration',
            message: 'Connection à la base de données non disponible'
        });
    }
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération des utilisateurs:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de récupérer les utilisateurs',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        const utilisateurs = results.map(user => ({
            id_users: user.id_users,
            nom: user.nom,
            prenom: user.prenom,
            email: user.email
        }));
        
        console.log(`Utilisateurs récupérés: ${utilisateurs.length} utilisateur(s)`);
        
        res.status(200).json({
            success: true,
            message: 'Utilisateurs récupérés avec succès',
            data: utilisateurs,
            count: utilisateurs.length,
            timestamp: new Date().toISOString()
        });
    });
});

//supression utilisateurs 

// Route DELETE pour supprimer un utilisateur par id dans la table "users"
app.delete('/api/utilisateurs/:id', (req, res) => {
    console.log(`${new Date().toISOString()} - DELETE /api/utilisateurs/${req.params.id}`);

    const userId = req.params.id;

    if (!db) {
        console.error('Erreur: Connection à la base de données non définie');
        return res.status(500).json({
            success: false,
            error: 'Erreur de configuration',
            message: 'Connection à la base de données non disponible'
        });
    }

    const query = 'DELETE FROM users WHERE id_users = ?'; // <-- TABLE users

    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Erreur SQL lors de la suppression de l\'utilisateur:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de supprimer l\'utilisateur',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé ou déjà supprimé',
                timestamp: new Date().toISOString()
            });
        }

        console.log(`Utilisateur avec id ${userId} supprimé avec succès.`);

        res.status(200).json({
            success: true,
            message: 'Utilisateur supprimé avec succès',
            deletedId: userId,
            timestamp: new Date().toISOString()
        });
    });
});

// Route PUT pour modifier un utilisateur par id dans la table "users"
app.put('/api/utilisateurs/:id', (req, res) => {
    console.log(`${new Date().toISOString()} - PUT /api/utilisateurs/${req.params.id}`);

    const userId = req.params.id;
    const { nom, prenom, email } = req.body;

    if (!db) {
        console.error('Erreur: Connection à la base de données non définie');
        return res.status(500).json({
            success: false,
            error: 'Erreur de configuration',
            message: 'Connection à la base de données non disponible'
        });
    }

    if (!nom || !prenom || !email) {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs (nom, prenom, email) sont requis.'
        });
    }

    const query = 'UPDATE users SET nom = ?, prenom = ?, email = ? WHERE id_users = ?';
    db.query(query, [nom, prenom, email, userId], (err, result) => {
        if (err) {
            console.error('Erreur SQL lors de la modification de l\'utilisateur:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de modifier l\'utilisateur',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé.'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Utilisateur modifié avec succès.'
        });
    });
});


// =================================
// ROUTES POUR LA GESTION DES EMPRUNTS
// =================================

// Gestion de retour d'un emprunt 

app.put('/api/emprunts/:id/retour', (req, res) => {
  const { id } = req.params;
  const { date_retour_effective } = req.body;

  if (!date_retour_effective) {
    return res.status(400).json({ success: false, message: 'Date de retour manquante' });
  }

  const updateQuery = `
    UPDATE emprunts
    SET date_retour_effective = ?, 
        statut = CASE 
                  WHEN DATEDIFF(?, date_emprunt) > 14 THEN 'en_retard'
                  ELSE 'retourne'
                 END
    WHERE id_emprunt = ?
  `;

  db.query(updateQuery, [date_retour_effective, date_retour_effective, id], (err, result) => {
    if (err) {
      console.error('Erreur SQL retour:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }

    // ✅ Mettre le livre comme DISPONIBLE (0)
    const updateLivreDisponibilite = `
      UPDATE livres
      SET disponible = 0
      WHERE id = (SELECT id_livre FROM emprunts WHERE id_emprunt = ?)
    `;
    db.query(updateLivreDisponibilite, [id], (err2) => {
      if (err2) {
        console.error('Erreur lors de la mise à jour de la disponibilité du livre :', err2);
        return res.status(500).json({ success: false, message: 'Erreur mise à jour disponibilité' });
      }

      res.json({ success: true, message: 'Retour validé et livre rendu disponible' });
    });
  });
});



// Route POST pour créer un nouvel emprunt (protégée par JWT)
app.post('/api/emprunts', verifyToken, (req, res) => {
    const { id_users, id_livre, duree_jours = 14 } = req.body;

    // Validation des paramètres
    if (!id_users || !id_livre) {
        return res.status(400).json({
            success: false,
            error: 'Données manquantes',
            message: 'L\'ID utilisateur et l\'ID livre sont requis'
        });
    }

    if (isNaN(id_users) || isNaN(id_livre) || id_users <= 0 || id_livre <= 0) {
        return res.status(400).json({
            success: false,
            error: 'IDs invalides',
            message: 'Les IDs doivent être des nombres positifs'
        });
    }

    console.log(`${new Date().toISOString()} - POST /api/emprunts`);
    console.log('Données reçues:', { id_users, id_livre, duree_jours });

    // Vérifier si l'utilisateur existe
    const checkUserQuery = 'SELECT id_users, nom, prenom FROM users WHERE id_users = ?';
    
    db.query(checkUserQuery, [id_users], (err, userResults) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification de l\'utilisateur:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de vérifier l\'utilisateur'
            });
        }

        if (userResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Utilisateur non trouvé',
                message: `Aucun utilisateur trouvé avec l'ID ${id_users}`
            });
        }

        // Vérifier si le livre existe et est disponible
        const checkBookQuery = 'SELECT id, titre, auteur, disponible FROM livres WHERE id = ?';
        
        db.query(checkBookQuery, [id_livre], (err, bookResults) => {
            if (err) {
                console.error('Erreur SQL lors de la vérification du livre:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur interne du serveur',
                    message: 'Impossible de vérifier le livre'
                });
            }

            if (bookResults.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'Livre non trouvé',
                    message: `Aucun livre trouvé avec l'ID ${id_livre}`
                });
            }

            if (!bookResults[0].disponible) {
                return res.status(400).json({
                    success: false,
                    error: 'Livre non disponible',
                    message: 'Ce livre n\'est pas disponible pour l\'emprunt'
                });
            }

            // Vérifier si l'utilisateur n'a pas déjà emprunté ce livre
            const checkExistingEmpruntQuery = `
                SELECT id_emprunt FROM emprunts 
                WHERE id_users = ? AND id_livre = ? AND statut = 'en_cours'
            `;
            
            db.query(checkExistingEmpruntQuery, [id_users, id_livre], (err, existingResults) => {
                if (err) {
                    console.error('Erreur SQL lors de la vérification d\'emprunt existant:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Erreur interne du serveur'
                    });
                }

                if (existingResults.length > 0) {
                    return res.status(400).json({
                        success: false,
                        error: 'Emprunt existant',
                        message: 'Cet utilisateur a déjà emprunté ce livre'
                    });
                }

                // Calculer la date de retour prévue
                const dateRetourPrevue = new Date();
                dateRetourPrevue.setDate(dateRetourPrevue.getDate() + parseInt(duree_jours));

                // Créer l'emprunt
                const insertEmpruntQuery = `
                    INSERT INTO emprunts (id_users, id_livre, date_emprunt, date_retour_prevue, statut) 
                    VALUES (?, ?, NOW(), ?, 'en_cours')
                `;

                db.query(insertEmpruntQuery, [id_users, id_livre, dateRetourPrevue.toISOString().split('T')[0]], (err, insertResults) => {
                    if (err) {
                        console.error('Erreur SQL lors de l\'insertion de l\'emprunt:', err);
                        return res.status(500).json({
                            success: false,
                            error: 'Erreur interne du serveur',
                            message: 'Impossible de créer l\'emprunt'
                        });
                    }

                    // Mettre à jour la disponibilité du livre
                    const updateBookQuery = 'UPDATE livres SET disponible = 0 WHERE id = ?';
                    
                    db.query(updateBookQuery, [id_livre], (err) => {
                        if (err) {
                            console.error('Erreur lors de la mise à jour de la disponibilité:', err);
                            // On continue même si la mise à jour échoue
                        }

                        console.log('Emprunt créé avec succès');

                        res.status(201).json({
                            success: true,
                            message: 'Emprunt créé avec succès',
                            data: {
                                id_emprunt: insertResults.insertId,
                                id_users: id_users,
                                utilisateur: `${userResults[0].prenom} ${userResults[0].nom}`,
                                id_livre: id_livre,
                                livre: `${bookResults[0].titre} - ${bookResults[0].auteur}`,
                                date_emprunt: new Date().toISOString(),
                                date_retour_prevue: dateRetourPrevue.toISOString().split('T')[0],
                                statut: 'en_cours'
                            },
                            timestamp: new Date().toISOString()
                        });
                    });
                });
            });
        });
    });
});


// Route GET pour récupérer tous les emprunts
app.get('/api/emprunts', (req, res) => {
    const { statut, id_users } = req.query;
    
    console.log(`${new Date().toISOString()} - GET /api/emprunts`);

    let query = `
        SELECT 
            e.id_emprunt,
            e.id_users,
            e.id_livre,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour_effective,
            e.statut,
            u.nom as utilisateur_nom,
            u.prenom as utilisateur_prenom,
            u.email as utilisateur_email,
            l.titre as livre_titre,
            l.auteur as livre_auteur,
            l.isbn as livre_isbn,
            CASE 
                WHEN e.statut = 'en_cours' AND e.date_retour_prevue < CURDATE() THEN 'en_retard'
                ELSE e.statut
            END as statut_actuel
        FROM emprunts e
        INNER JOIN users u ON e.id_users = u.id_users
        INNER JOIN livres l ON e.id_livre = l.id
    `;

    const queryParams = [];

    // Filtres
    const conditions = [];
    if (statut) {
        if (statut === 'en_retard') {
            conditions.push("e.statut = 'en_cours' AND e.date_retour_prevue < CURDATE()");
        } else {
            conditions.push("e.statut = ?");
            queryParams.push(statut);
        }
    }

    if (id_users) {
        conditions.push("e.id_users = ?");
        queryParams.push(id_users);
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY e.date_emprunt DESC";

    db.query(query, queryParams, (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération des emprunts:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de récupérer les emprunts'
            });
        }

        const emprunts = results.map(emprunt => ({
            id_emprunt: emprunt.id_emprunt,
            utilisateur: {
                id: emprunt.id_users,
                nom: emprunt.utilisateur_nom,
                prenom: emprunt.utilisateur_prenom,
                email: emprunt.utilisateur_email
            },
            livre: {
                id: emprunt.id_livre,
                titre: emprunt.livre_titre,
                auteur: emprunt.livre_auteur,
                isbn: emprunt.livre_isbn
                
            },
            date_emprunt: emprunt.date_emprunt,
            date_retour_prevue: emprunt.date_retour_prevue,
            date_retour_effective: emprunt.date_retour_effective,
            statut: emprunt.statut_actuel,
            jours_restants: emprunt.statut === 'en_cours' ? 
                Math.ceil((new Date(emprunt.date_retour_prevue) - new Date()) / (1000 * 60 * 60 * 24)) : null
        }));

        console.log(`Emprunts récupérés: ${emprunts.length} emprunt(s)`);

        res.status(200).json({
            success: true,
            message: 'Emprunts récupérés avec succès',
            data: emprunts,
            count: emprunts.length,
            timestamp: new Date().toISOString()
        });
    });
});

// Route GET pour récupérer un emprunt spécifique
app.get('/api/emprunts/:id', (req, res) => {
    const empruntId = parseInt(req.params.id);

    if (isNaN(empruntId) || empruntId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID de l\'emprunt doit être un nombre positif'
        });
    }

    console.log(`${new Date().toISOString()} - GET /api/emprunts/${empruntId}`);

    const query = `
        SELECT 
            e.id_emprunt,
            e.id_users,
            e.id_livre,
            e.date_emprunt,
            e.date_retour_prevue,
            e.date_retour_effective,
            e.statut,
            u.nom as utilisateur_nom,
            u.prenom as utilisateur_prenom,
            u.email as utilisateur_email,
            l.titre as livre_titre,
            l.auteur as livre_auteur,
            l.isbn as livre_isbn
        FROM emprunts e
        INNER JOIN users u ON e.id_users = u.id_users
        INNER JOIN livres l ON e.id_livre = l.id
        WHERE e.id_emprunt = ?
    `;

    db.query(query, [empruntId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération de l\'emprunt:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Emprunt non trouvé',
                message: `Aucun emprunt trouvé avec l'ID ${empruntId}`
            });
        }

        const emprunt = results[0];
        
        res.status(200).json({
            success: true,
            message: 'Emprunt récupéré avec succès',
            data: {
                id_emprunt: emprunt.id_emprunt,
                utilisateur: {
                    id: emprunt.id_users,
                    nom: emprunt.utilisateur_nom,
                    prenom: emprunt.utilisateur_prenom,
                    email: emprunt.utilisateur_email
                },
                livre: {
                    id: emprunt.id_livre,
                    titre: emprunt.livre_titre,
                    auteur: emprunt.livre_auteur,
                    isbn: emprunt.livre_isbn,
                    
                },
                date_emprunt: emprunt.date_emprunt,
                date_retour_prevue: emprunt.date_retour_prevue,
                date_retour_effective: emprunt.date_retour_effective,
                statut: emprunt.statut
            }
        });
    });
});

// Route PUT pour retourner un livre (marquer l'emprunt comme terminé)
app.put('/api/emprunts/:id/retour', (req, res) => {
    const empruntId = parseInt(req.params.id);

    if (isNaN(empruntId) || empruntId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID de l\'emprunt doit être un nombre positif'
        });
    }

    console.log(`${new Date().toISOString()} - PUT /api/emprunts/${empruntId}/retour`);

    // Vérifier que l'emprunt existe et est en cours
    const checkEmpruntQuery = `
        SELECT e.id_emprunt, e.id_livre, e.statut, l.titre 
        FROM emprunts e
        INNER JOIN livres l ON e.id_livre = l.id
        WHERE e.id_emprunt = ?
    `;

    db.query(checkEmpruntQuery, [empruntId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification de l\'emprunt:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Emprunt non trouvé',
                message: `Aucun emprunt trouvé avec l'ID ${empruntId}`
            });
        }

        if (results[0].statut !== 'en_cours') {
            return res.status(400).json({
                success: false,
                error: 'Emprunt déjà terminé',
                message: 'Cet emprunt a déjà été retourné'
            });
        }

        // Mettre à jour l'emprunt
        const updateEmpruntQuery = `
            UPDATE emprunts 
            SET date_retour_effective = NOW(), statut = 'retourne'
            WHERE id_emprunt = ?
        `;

        db.query(updateEmpruntQuery, [empruntId], (err) => {
            if (err) {
                console.error('Erreur SQL lors de la mise à jour de l\'emprunt:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur interne du serveur',
                    message: 'Impossible de mettre à jour l\'emprunt'
                });
            }

            // Remettre le livre comme disponible
            const updateBookQuery = 'UPDATE livres SET disponible = 1 WHERE id = ?';
            
            db.query(updateBookQuery, [results[0].id_livre], (err) => {
                if (err) {
                    console.error('Erreur lors de la mise à jour de la disponibilité du livre:', err);
                    // On continue même si la mise à jour échoue
                }

                console.log('Retour de livre effectué avec succès');

                res.status(200).json({
                    success: true,
                    message: 'Retour effectué avec succès',
                    data: {
                        id_emprunt: empruntId,
                        livre_titre: results[0].titre,
                        date_retour_effective: new Date().toISOString(),
                        statut: 'retourne'
                    },
                    timestamp: new Date().toISOString()
                });
            });
        });
    });
});

// Route DELETE pour supprimer un emprunt (admin seulement)
app.delete('/api/emprunts/:id', (req, res) => {
    const empruntId = parseInt(req.params.id);

    if (isNaN(empruntId) || empruntId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID de l\'emprunt doit être un nombre positif'
        });
    }

    console.log(`${new Date().toISOString()} - DELETE /api/emprunts/${empruntId}`);

    // Vérifier que l'emprunt existe
    const checkEmpruntQuery = `
        SELECT e.id_emprunt, e.id_livre, e.statut 
        FROM emprunts e
        WHERE e.id_emprunt = ?
    `;

    db.query(checkEmpruntQuery, [empruntId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification de l\'emprunt:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Emprunt non trouvé',
                message: `Aucun emprunt trouvé avec l'ID ${empruntId}`
            });
        }

        const emprunt = results[0];

        // Supprimer l'emprunt
        const deleteEmpruntQuery = 'DELETE FROM emprunts WHERE id_emprunt = ?';

        db.query(deleteEmpruntQuery, [empruntId], (err) => {
            if (err) {
                console.error('Erreur SQL lors de la suppression de l\'emprunt:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur interne du serveur',
                    message: 'Impossible de supprimer l\'emprunt'
                });
            }

            // Si l'emprunt était en cours, remettre le livre comme disponible
            if (emprunt.statut === 'en_cours') {
                const updateBookQuery = 'UPDATE livres SET disponible = 1 WHERE id = ?';
                
                db.query(updateBookQuery, [emprunt.id_livre], (err) => {
                    if (err) {
                        console.error('Erreur lors de la mise à jour de la disponibilité du livre:', err);
                    }
                });
            }

            console.log('Emprunt supprimé avec succès');

            res.status(200).json({
                success: true,
                message: 'Emprunt supprimé avec succès',
                timestamp: new Date().toISOString()
            });
        });
    });
});


// =================================
// ROUTES POUR LA GESTION DES LIVRES
// =================================

// Route GET pour récupérer tous les livres avec leur note moyenne
app.get('/api/livres', (req, res) => {
    console.log(`${new Date().toISOString()} - GET /api/livres`);
    
    const query = `
        SELECT 
            l.id, 
            l.titre, 
            l.isbn, 
            l.auteur, 
            l.disponible, 
            l.genre,
            ROUND(AVG(n.note), 2) as note_moyenne,
            COUNT(n.id) as nombre_notes
        FROM livres l
        LEFT JOIN notations n ON l.id = n.livre_id
        GROUP BY l.id, l.titre, l.isbn, l.auteur, l.disponible, l.genre
        ORDER BY l.titre ASC
    `;
    
    if (!db) {
        console.error('Erreur: Connection à la base de données non définie');
        return res.status(500).json({
            success: false,
            error: 'Erreur de configuration',
            message: 'Connection à la base de données non disponible'
        });
    }
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération des livres:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de récupérer les livres',
                details: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        
        const livres = results.map(livre => ({
            id: livre.id,
            titre: livre.titre,
            isbn: livre.isbn,
            auteur: livre.auteur,
            disponible: Boolean(livre.disponible),
            genre: livre.genre,
            note_moyenne: livre.note_moyenne || 0,
            nombre_notes: livre.nombre_notes || 0
        }));
        
        console.log(`Livres récupérés: ${livres.length} livre(s)`);
        
        res.status(200).json({
            success: true,
            message: 'Livres récupérés avec succès',
            data: livres,
            count: livres.length,
            timestamp: new Date().toISOString()
        });
    });
});

// Route GET pour récupérer un livre spécifique par ID avec sa note moyenne
app.get('/api/livres/:id', (req, res) => {
    const livreId = parseInt(req.params.id);
    
    if (isNaN(livreId) || livreId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID du livre doit être un nombre positif'
        });
    }
    
    console.log(`${new Date().toISOString()} - GET /api/livres/${livreId}`);
    
    const query = `
        SELECT 
            l.id, 
            l.titre, 
            l.isbn, 
            l.auteur, 
            l.disponible, 
            l.genre,
            ROUND(AVG(n.note), 2) as note_moyenne,
            COUNT(n.id) as nombre_notes
        FROM livres l
        LEFT JOIN notations n ON l.id = n.livre_id
        WHERE l.id = ?
        GROUP BY l.id, l.titre, l.isbn, l.auteur, l.disponible, l.genre
    `;
    
    db.query(query, [livreId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération du livre:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de récupérer le livre'
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Livre non trouvé',
                message: `Aucun livre trouvé avec l'ID ${livreId}`
            });
        }
        
        const livre = {
            id: results[0].id,
            titre: results[0].titre,
            isbn: results[0].isbn,
            auteur: results[0].auteur,
            disponible: Boolean(results[0].disponible),
            genre: results[0].genre,
            note_moyenne: results[0].note_moyenne || 0,
            nombre_notes: results[0].nombre_notes || 0
        };
        
        console.log(`Livre trouvé: ${livre.titre}`);
        
        res.status(200).json({
            success: true,
            message: 'Livre récupéré avec succès',
            data: livre,
            timestamp: new Date().toISOString()
        });
    });
});

// ROUTE POUR AJOUTER UN LIVRE
app.post('/api/livres', verifyToken, (req, res) => {
  try {
    console.log("📥 Requête reçue - POST /api/livres");
    console.log("📥 Données reçues :", req.body);
    console.log("🔐 Token info:", {
      fromHeaders: req.headers.authorization ? 'Présent' : 'Absent',
      userId: req.userId || 'Non défini',
      userEmail: req.userEmail || 'Non défini'
    });

    if (!db) {
      console.error("❌ ERREUR : Base de données non initialisée !");
      return res.status(500).json({
        success: false,
        message: 'Erreur de connexion à la base de données'
      });
    }

    const { titre, isbn, auteur, genre, disponible } = req.body;

    if (!titre || !isbn || !auteur || !genre) {
      console.log("❌ Validation échouée - champs manquants");
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis (titre, isbn, auteur, genre)'
      });
    }

    if (typeof titre !== 'string' || typeof isbn !== 'string' || 
        typeof auteur !== 'string' || typeof genre !== 'string') {
      console.log("❌ Validation échouée - types de données incorrects");
      return res.status(400).json({
        success: false,
        message: 'Les champs titre, isbn, auteur et genre doivent être des chaînes de caractères'
      });
    }

    if (titre.trim().length === 0 || isbn.trim().length === 0 || 
        auteur.trim().length === 0 || genre.trim().length === 0) {
      console.log("❌ Validation échouée - champs vides");
      return res.status(400).json({
        success: false,
        message: 'Les champs ne peuvent pas être vides'
      });
    }

    const isDisponible = disponible !== undefined ? Boolean(disponible) : true;
    console.log("✅ Validation réussie");
    console.log("📝 Données à insérer :", { 
      titre: titre.trim(), 
      isbn: isbn.trim(), 
      auteur: auteur.trim(), 
      genre: genre.trim(), 
      disponible: isDisponible,
      userId: req.userId
    });

    // Vérifier si l'ISBN existe déjà
    const checkQuery = 'SELECT id FROM livres WHERE isbn = ?';
    db.query(checkQuery, [isbn.trim()], (err, rows) => {
      if (err) {
        console.error('❌ Erreur SQL lors de la vérification ISBN:', err);
        return res.status(500).json({ success: false, message: 'Erreur serveur lors de la vérification ISBN' });
      }
      if (rows.length > 0) {
        console.log("❌ ISBN déjà existant:", isbn.trim());
        return res.status(409).json({
          success: false,
          message: 'Un livre avec cet ISBN existe déjà',
          error_code: 'DUPLICATE_ISBN'
        });
      }

      // Insertion du livre
      const query = `
        INSERT INTO livres (titre, isbn, auteur, genre, disponible, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `;
      const values = [
        titre.trim(),
        isbn.trim(),
        auteur.trim(),
        genre.trim(),
        isDisponible ? 1 : 0
      ];
      db.query(query, values, (err2, result) => {
        if (err2) {
          console.error('❌ Erreur SQL lors de l\'insertion du livre:', err2);
          return res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout du livre",
            error_code: 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString()
          });
        }
        console.log('✅ Livre ajouté avec succès, ID:', result.insertId);
        res.status(201).json({
          success: true,
          message: 'Livre ajouté avec succès',
          livreId: result.insertId
        });
      });
    });
  } catch (error) {
    console.error('❌ ERREUR COMPLÈTE :', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'ajout du livre",
      error_code: 'UNKNOWN_ERROR',
      timestamp: new Date().toISOString()
    });
  }
});

// Route PUT pour modifier un livre par id
app.put('/api/livres/:id', verifyToken, (req, res) => {
    const livreId = req.params.id;
    const { titre, auteur, genre, disponible } = req.body;

    if (!titre || !auteur || !genre || typeof disponible === 'undefined') {
        return res.status(400).json({
            success: false,
            message: 'Tous les champs sont requis'
        });
    }

    const query = 'UPDATE livres SET titre = ?, auteur = ?, genre = ?, disponible = ? WHERE id = ?';
    db.query(query, [titre, auteur, genre, disponible ? 1 : 0, livreId], (err, result) => {
        if (err) {
            console.error('Erreur SQL lors de la modification du livre:', err);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la modification du livre'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Livre non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Livre modifié avec succès'
        });
    });
});

// Route pour supprimer un livre par son id
app.delete('/api/livres/:id', verifyToken, (req, res) => {
    const livreId = req.params.id;
    const query = 'DELETE FROM livres WHERE id = ?';
    db.query(query, [livreId], (err, result) => {
        if (err) {
            console.error('Erreur SQL lors de la suppression du livre:', err);
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la suppression du livre'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Livre non trouvé'
            });
        }
        res.json({
            success: true,
            message: 'Livre supprimé avec succès'
        });
    });
});

const nodemailer = require('nodemailer');

// Route GET pour récupérer les emprunts en retard (pour notifications)
app.get('/api/notifications/retards', (req, res) => {
    const query = `
        SELECT 
            e.id_emprunt,
            e.date_emprunt,
            e.date_retour_prevue,
            u.id_users,
            u.nom,
            u.prenom,
            u.email,
            l.titre
        FROM emprunts e
        INNER JOIN users u ON e.id_users = u.id_users
        INNER JOIN livres l ON e.id_livre = l.id
        WHERE e.statut = 'en_cours' AND e.date_retour_prevue < CURDATE()
        ORDER BY e.date_retour_prevue ASC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Erreur SQL notifications retards:', err);
            return res.status(500).json({ success: false, message: 'Erreur serveur' });
        }
        res.json({ success: true, data: results });
    });
});
////////////////////////////////////////////////////////////////////////////
// Route POST pour envoyer un email de notification de retard
app.post('/api/notifications/retards/send', (req, res) => {
    const { email, nom, prenom, titre, date_retour_prevue } = req.body;

    if (!email || !titre || !date_retour_prevue) {
        return res.status(400).json({ success: false, message: 'Données manquantes pour l\'envoi de l\'email.' });
    }

    // Configure ton transporteur SMTP ici (exemple Gmail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'ton.email@gmail.com', // <-- Mets ton email ici
            pass: 'ton_mot_de_passe_app' // <-- Mets ton mot de passe d'application ici
        }
    });

    const mailOptions = {
        from: '"Bibliothèque" <ton.email@gmail.com>',
        to: email,
        subject: 'Retard de retour de livre',
        text: `Bonjour ${prenom || ''} ${nom || ''},\n\nVous avez un retard pour le retour du livre "${titre}" (date prévue: ${date_retour_prevue}). Merci de le rapporter rapidement.\n\nCeci est un rappel automatique.\n\nBibliothèque`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            return res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email.' });
        }
        res.json({ success: true, message: 'Email envoyé avec succès.' });
    });
});



// Middleware de vérification du token (si pas déjà défini)
function verifyToken(req, res, next) {
  try {
    console.log("🔐 Vérification du token...");
    
    // Récupérer le token depuis différentes sources possibles
    let token = null;
    
    // 1. Depuis l'header Authorization (format Bearer)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("🔐 Token trouvé dans Authorization header (Bearer)");
    }
    // 2. Depuis l'header authorization (sans Bearer)
    else if (authHeader) {
      token = authHeader;
      console.log("🔐 Token trouvé dans Authorization header (direct)");
    }
    // 3. Depuis l'header token
    else if (req.headers.token) {
      token = req.headers.token;
      console.log("🔐 Token trouvé dans header 'token'");
    }
    // 4. Depuis l'header x-auth-token
    else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
      console.log("🔐 Token trouvé dans header 'x-auth-token'");
    }
    // 5. Depuis les paramètres de requête
    else if (req.query.token) {
      token = req.query.token;
      console.log("🔐 Token trouvé dans query params");
    }
    // 6. Depuis le body
    else if (req.body && req.body.token) {
      token = req.body.token;
      console.log("🔐 Token trouvé dans body");
    }

    if (!token) {
      console.log("❌ Aucun token fourni");
      return res.status(401).json({
        success: false,
        message: 'Token d\'authentification requis',
        error_code: 'NO_TOKEN_PROVIDED'
      });
    }

    console.log("🔐 Token reçu:", token.substring(0, 20) + '...');

    // Vérifier le token avec JWT
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    console.log("✅ Token valide pour l'utilisateur:", decoded.userId || decoded.id);
    
    // Ajouter les informations de l'utilisateur à la requête
    req.userId = decoded.userId || decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;
    
    next();
  } catch (error) {
    console.error("❌ Erreur de vérification du token:", error.message);
    
    let errorMessage = 'Token invalide';
    let errorCode = 'INVALID_TOKEN';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Token expiré';
      errorCode = 'TOKEN_EXPIRED';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Token malformé';
      errorCode = 'MALFORMED_TOKEN';
    } else if (error.name === 'NotBeforeError') {
      errorMessage = 'Token pas encore valide';
      errorCode = 'TOKEN_NOT_ACTIVE';
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      error_code: errorCode
    });
  }
}

// =================================
// ROUTES POUR LA GESTION DES NOTATIONS
// =================================

// Route POST pour ajouter une notation à un livre
app.post('/api/livres/:id/notations', (req, res) => {
    const bookId = parseInt(req.params.id);
    const { note, utilisateur_nom } = req.body;

    // Validation des paramètres
    if (isNaN(bookId) || bookId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID du livre doit être un nombre positif'
        });
    }

    // Validation de la note
    if (!note || isNaN(note) || note < 1 || note > 5) {
        return res.status(400).json({
            success: false,
            error: 'Note invalide',
            message: 'La note doit être un nombre entre 1 et 5'
        });
    }

    // Validation de l'utilisateur
    if (!utilisateur_nom || utilisateur_nom.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Utilisateur requis',
            message: 'Le nom de l\'utilisateur est requis'
        });
    }

    console.log(`${new Date().toISOString()} - POST /api/livres/${bookId}/notations`);
    console.log('Données reçues:', { note, utilisateur_nom });

    // Vérifier si le livre existe
    const checkBookQuery = 'SELECT id, titre FROM livres WHERE id = ?';
    
    db.query(checkBookQuery, [bookId], (err, bookResults) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification du livre:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de vérifier l\'existence du livre'
            });
        }

        if (bookResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Livre non trouvé',
                message: `Aucun livre trouvé avec l'ID ${bookId}`
            });
        }

        // Vérifier si la table notations existe, sinon la créer
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS notations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                livre_id INT NOT NULL,
                note INT NOT NULL CHECK (note >= 1 AND note <= 5),
                utilisateur_nom VARCHAR(255) NOT NULL,
                date_notation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_book (livre_id, utilisateur_nom)
            )
        `;

        db.query(createTableQuery, (err) => {
            if (err) {
                console.error('Erreur lors de la création de la table notations:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur de configuration de la base de données'
                });
            }

            // Vérifier si l'utilisateur a déjà noté ce livre
            const checkExistingQuery = 'SELECT id FROM notations WHERE livre_id = ? AND utilisateur_nom = ?';
            
            db.query(checkExistingQuery, [bookId, utilisateur_nom.trim()], (err, existingResults) => {
                if (err) {
                    console.error('Erreur SQL lors de la vérification de notation existante:', err);
                    return res.status(500).json({
                        success: false,
                        error: 'Erreur interne du serveur'
                    });
                }

                if (existingResults.length > 0) {
                    // Mettre à jour la notation existante
                    const updateQuery = 'UPDATE notations SET note = ?, date_notation = NOW() WHERE livre_id = ? AND utilisateur_nom = ?';
                    
                    db.query(updateQuery, [note, bookId, utilisateur_nom.trim()], (err, updateResults) => {
                        if (err) {
                            console.error('Erreur SQL lors de la mise à jour de la notation:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Erreur interne du serveur',
                                message: 'Impossible de mettre à jour la notation'
                            });
                        }

                        console.log('Notation mise à jour avec succès');
                        
                        res.status(200).json({
                            success: true,
                            message: 'Notation mise à jour avec succès',
                            data: {
                                livre_id: bookId,
                                note: note,
                                utilisateur_nom: utilisateur_nom.trim(),
                                action: 'updated'
                            },
                            timestamp: new Date().toISOString()
                        });
                    });
                } else {
                    // Insérer une nouvelle notation
                    const insertQuery = `
                        INSERT INTO notations (livre_id, note, utilisateur_nom, date_notation) 
                        VALUES (?, ?, ?, NOW())
                    `;

                    db.query(insertQuery, [bookId, note, utilisateur_nom.trim()], (err, insertResults) => {
                        if (err) {
                            console.error('Erreur SQL lors de l\'insertion de la notation:', err);
                            return res.status(500).json({
                                success: false,
                                error: 'Erreur interne du serveur',
                                message: 'Impossible d\'ajouter la notation'
                            });
                        }

                        console.log('Notation ajoutée avec succès');

                        res.status(201).json({
                            success: true,
                            message: 'Notation ajoutée avec succès',
                            data: {
                                id: insertResults.insertId,
                                livre_id: bookId,
                                note: note,
                                utilisateur_nom: utilisateur_nom.trim(),
                                action: 'created'
                            },
                            timestamp: new Date().toISOString()
                        });
                    });
                }
            });
        });
    });
});

// Route GET pour récupérer toutes les notations d'un livre
app.get('/api/livres/:id/notations', (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId) || bookId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID du livre doit être un nombre positif'
        });
    }

    console.log(`${new Date().toISOString()} - GET /api/livres/${bookId}/notations`);

    const query = `
        SELECT 
            n.id, 
            n.livre_id, 
            n.note, 
            n.utilisateur_nom, 
            n.date_notation,
            l.titre as livre_titre
        FROM notations n
        INNER JOIN livres l ON n.livre_id = l.id
        WHERE n.livre_id = ?
        ORDER BY n.date_notation DESC
    `;

    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Erreur SQL lors de la récupération des notations:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur',
                message: 'Impossible de récupérer les notations'
            });
        }

        if (results.length === 0) {
            const checkBookQuery = 'SELECT id, titre FROM livres WHERE id = ?';
            db.query(checkBookQuery, [bookId], (err, bookResults) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: 'Erreur interne du serveur'
                    });
                }

                if (bookResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Livre non trouvé',
                        message: `Aucun livre trouvé avec l'ID ${bookId}`
                    });
                }

                return res.status(200).json({
                    success: true,
                    message: 'Aucune notation pour ce livre',
                    data: [],
                    count: 0,
                    livre: {
                        id: bookResults[0].id,
                        titre: bookResults[0].titre
                    },
                    timestamp: new Date().toISOString()
                });
            });
        } else {
            const notations = results.map(notation => ({
                id: notation.id,
                livre_id: notation.livre_id,
                note: notation.note,
                utilisateur_nom: notation.utilisateur_nom,
                date_notation: notation.date_notation
            }));

            console.log(`Notations récupérées: ${notations.length} notation(s)`);

            res.status(200).json({
                success: true,
                message: 'Notations récupérées avec succès',
                data: notations,
                count: notations.length,
                livre: {
                    id: bookId,
                    titre: results[0].livre_titre
                },
                timestamp: new Date().toISOString()
            });
        }
    });
});

// =================================
// ROUTES POUR LA GESTION DES COMMENTAIRES
// =================================

// Route POST pour ajouter un commentaire à un livre
app.post('/api/livres/:id/commentaires', (req, res) => {
    const bookId = parseInt(req.params.id);
    const { contenu, auteur } = req.body;

    if (isNaN(bookId) || bookId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide',
            message: 'L\'ID du livre doit être un nombre positif'
        });
    }

    if (!contenu || !auteur) {
        return res.status(400).json({
            success: false,
            error: 'Données manquantes',
            message: 'Le contenu et l\'auteur sont requis'
        });
    }

    if (contenu.trim().length === 0 || auteur.trim().length === 0) {
        return res.status(400).json({
            success: false,
            error: 'Données invalides',
            message: 'Le contenu et l\'auteur ne peuvent pas être vides'
        });
    }

    console.log(`${new Date().toISOString()} - POST /api/livres/${bookId}/commentaires`);

    const checkBookQuery = 'SELECT id, titre FROM livres WHERE id = ?';
    
    db.query(checkBookQuery, [bookId], (err, bookResults) => {
        if (err) {
            console.error('Erreur SQL lors de la vérification du livre:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }

        if (bookResults.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Livre non trouvé',
                message: `Aucun livre trouvé avec l'ID ${bookId}`
            });
        }

        const insertCommentQuery = `
            INSERT INTO commentaires (livre_id, contenu, auteur, date_creation) 
            VALUES (?, ?, ?, NOW())
        `;

        db.query(insertCommentQuery, [bookId, contenu.trim(), auteur.trim()], (err, insertResults) => {
            if (err) {
                console.error('Erreur SQL lors de l\'insertion du commentaire:', err);
                return res.status(500).json({
                    success: false,
                    error: 'Erreur interne du serveur',
                    message: 'Impossible d\'ajouter le commentaire'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Commentaire ajouté avec succès',
                data: {
                    id: insertResults.insertId,
                    livre_id: bookId,
                    contenu: contenu.trim(),
                    auteur: auteur.trim(),
                    date_creation: new Date().toISOString()
                }
            });
        });
    });
});

// Route GET pour récupérer les commentaires d'un livre
app.get('/api/livres/:id/commentaires', (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId) || bookId <= 0) {
        return res.status(400).json({
            success: false,
            error: 'ID invalide'
        });
    }

    const query = `
        SELECT 
            c.id, 
            c.livre_id, 
            c.contenu, 
            c.auteur, 
            c.date_creation,
            l.titre as livre_titre
        FROM commentaires c
        INNER JOIN livres l ON c.livre_id = l.id
        WHERE c.livre_id = ?
        ORDER BY c.date_creation DESC
    `;

    db.query(query, [bookId], (err, results) => {
        if (err) {
            console.error('Erreur SQL:', err);
            return res.status(500).json({
                success: false,
                error: 'Erreur interne du serveur'
            });
        }

        if (results.length === 0) {
            const checkBookQuery = 'SELECT id, titre FROM livres WHERE id = ?';
            db.query(checkBookQuery, [bookId], (err, bookResults) => {
                if (bookResults.length === 0) {
                    return res.status(404).json({
                        success: false,
                        error: 'Livre non trouvé'
                    });
                }

                return res.status(200).json({
                    success: true,
                    data: [],
                    count: 0
                });
            });
        } else {
            res.status(200).json({
                success: true,
                data: results,
                count: results.length
            });
        }
    });
});

// Routes principales
app.get('/', welcome);
app.post('/signup', addNewUser);
app.post('/userlogin', userLoginCheck);

app.get('/test', (req, res) => {
    res.json({ 
        message: 'Serveur fonctionnel', 
        timestamp: new Date().toISOString() 
    });
});

// Sous-Routes avec Token
var apiRoutes = express.Router();
apiRoutes.use(bodyParser.urlencoded({ extended: true }));
apiRoutes.use(bodyParser.json());
apiRoutes.use(verifyToken);
apiRoutes.get('/Utilisateur', Utilisateur);

app.use('/api', apiRoutes);

// Gestion des erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({
        error: true,
        message: `Route ${req.originalUrl} non trouvée`
    });
});

// Gestion des erreurs générales
app.use((err, req, res, next) => {
    console.error('Erreur serveur:', err);
    res.status(500).json({
        error: true,
        message: 'Erreur interne du serveur'
    });
});

app.listen(port, () => {
    console.log(`Démarrage et écoute sur le port ${port}`);
    console.log(`Serveur accessible sur http://localhost:${port}`);
});