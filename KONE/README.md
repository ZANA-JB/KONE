
## PROJET DE MISE EN PLACE D'UNE  PLATEFORME DE GESTION DE BIBLIOTHEQUE EN LIGNE 

   Cette plateforme web permet aux étudiants d'une université de gérer leurs interactions avec la bibliothèque en ligne : inscription, consultation, réservation et emprunt de livres. 
   Un espace administrateur permet de gérer les étudiants, les livres et les emprunts.


 ## OBJECTIF 

    l'objectif final de cette application mise en oeuvre est de permettre aux etudiants :

    -De s'inscrire et de se connecter avec des identifiants précis et personnelles
    -De rechercher , reserver , et emprunter des livres en ligne
    -D'appoter des notations et commentaires par livres
    -De recevoir des notifications en cas de retards de retour de livre emprunté

## TECHNOLOGIES UTILISEES
    
    les differentes technologies recommandées pour la realisation de ce  projet sont :

    -Frontend : React.js (ou Next.js)
    -Backend : Node.js (Express) pour la création de l’API RESTful
    -Base de donnée : Mysql comme base de données relationnelle
    -Authentification : JWT
    -Versioning : GitHub
    -Conteneurisation : Docker, Docker Compose , pour l’environnement de développement
    - Architecture **RESTful** respectant les bonnes pratiques (GET, POST, PUT, DELETE)


# FONCTIONNALITES PRINCIPALES IMPLEMENTEES

 Les differentes fonctionalités implementées sont :

   - Inscription / Connexion étudiant
   - Liste des livres disponibles avec filtres (titre, auteur, genre)
   - Réservation et emprunt de livres
   - Notifications email (retards de retour de livres empruntés ) 
   - Voir details de chaques livres disponibles sur la plateforme
   - Commentaires /notes sur les livres disponibles 

# Espace administrateur : 
    - gestion des livres et des utilisateurs(etudiants)
    - Gestion des emprunts de livres / Retours de livres empruntés 
   

## STRUCTURE DU PROJET 

La structure de notre projet se presente comme suite :

/KONE
├── backend/
│   ├── server.js
│   ├── middleware/
│   ├── database.js
│   ├── Dockerfile
├── frontend/
│   ├── app/
│   ├── Dockerfile
│   ├── package.json
├── .env
├── .gitignore
├── dev.session.sql
├── docker-compose.yml
├── README.md
├── schema_base_de_données
!__ captures


## METHODE DE LANCEMENT DU PROJET

# BACKEND

Etape de lancement du backend

 -cd KONE
 -Cd backend 
 -npm install
 -npm start

 # FRONTEND

 Etape de lancement du front

 -cd KONE
 -cd frontend
 -npm install
 -npm start
 
# SCHEMA DE LA BASE DE DONNEE

Une base de donnée api a éte crée contenant plusieurs tables telles que :


## Table des utilisateurs

Table users {
  id_users INT [pk, increment]
  nom VARCHAR(100) [not null]
  prenom VARCHAR(100) [not null]
  email VARCHAR(100) [not null, unique]
  password VARCHAR(255) [not null]
  role TINYINT(1) [not null, default: 0]
}

## Table des livres

Table livres {
  id INT [pk, increment]
  titre VARCHAR(255) [not null]
  isbn VARCHAR(20) [not null, unique]
  auteur VARCHAR(255) [not null]
  disponible BOOLEAN [default: true]
  genre VARCHAR(100) [not null]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, note: 'ON UPDATE CURRENT_TIMESTAMP']
}

## table des commentaires

Table commentaires {
  id INT [pk, increment]
  contenu TEXT
  auteur VARCHAR(100)
  livre_id INT [ref: > livres.id, onDelete: CASCADE]
  date_creation TIMESTAMP [default: `CURRENT_TIMESTAMP`]
}

## Table des notations

Table notations {
  id INT [pk, increment]
  livre_id INT [not null, ref: > livres.id, onDelete: CASCADE]
  note INT [not null, note: "CHECK (note >= 1 AND note <= 5)"]
  utilisateur_nom VARCHAR(255) [not null]
  date_notation TIMESTAMP [default: `CURRENT_TIMESTAMP`]
  created_at TIMESTAMP [default: `CURRENT_TIMESTAMP`]
  updated_at TIMESTAMP [default: `CURRENT_TIMESTAMP`, note: 'ON UPDATE CURRENT_TIMESTAMP']
  Indexes {
    (livre_id)
    (utilisateur_nom)
    UNIQUE (livre_id, utilisateur_nom)
  }
}

## Table des emprunts

Table emprunts {
  id_emprunt INT [pk, increment]
  id_users INT [not null, ref: > users.id_users, onDelete: CASCADE]
  id_livre INT [not null, ref: > livres.id, onDelete: CASCADE]
  date_emprunt DATETIME [not null, default: `CURRENT_TIMESTAMP`]
  date_retour_prevue DATE [not null]
  date_retour_effective DATE
  statut ENUM('en_cours', 'retourne', 'en_retard') [default: 'en_cours']
}

## Table des réservations

Table reservations {
  id INT [pk, increment]
  livre_id INT [not null, ref: > livres.id, onDelete: CASCADE]
  nom VARCHAR(100) [not null]
  email VARCHAR(100) [not null]
  telephone VARCHAR(20) [not null]
  date_reservation DATETIME [not null, default: `CURRENT_TIMESTAMP`]
}

# Structure JSON des tables de la base de donnéé api

 [
  {
    "Tables_in_api": "commentaires"
  },
  {
    "Tables_in_api": "emprunts"
  },
  {
    "Tables_in_api": "livres"
  },
  {
    "Tables_in_api": "notations"
  },
  {
    "Tables_in_api": "reservations"
  },
  {
    "Tables_in_api": "users"
  }
]

# Table	                 Liens étrangers

commentaires              	 livre_id → livres.id
notations	                livre_id → livres.id
emprunts	     id_users → users.id_users / id_livre → livres.id
reservations	             livre_id → livres.id

# sauvegarde du format image.png du schema de la base de donnée

 voir ( schema_base_de_données.png) en racine du fichier KONE


# ACTEURS ( UTILISATEUR FINAL )

Par defaut un utilisateur final enregistré sur cette plateforme en ligne se vera attribuer le role d'un etudiant et donc celui-ci pourra avoir accès uniquement qu'aux informations  du tableau de bord de L'Etudiant.

# INFORMATIONS IMPORTANTES SUR L'ATTRIBUTION DES ROLES DES UTILISATEURS FINAUX

pour faire attribuer le role d'un administrateur à un utilisateur enregistré, nous nous sommes donnés pour règle d'attribution suivante:

si role = 1 alors administrateur
si role = 0 alors etudiant 

# un administrateur a été crée pour visualiser le tableau de bord d'un admin 

NOM: kone
Prenom: zana
Email: kone1@gmail.com
Password: kone1@gmail.com



# DEMONSTRATIONS FONCTIONNELLES

#Le dossier captures/ contient des images illustrant l’utilisation de la plateforme

# Voir dossier ( /captures  ) à la racine du dossier source contenant le frontend et le backend 


#Lien de videos pour demonstration fontionelles 

# Voir la vidéo de démonstration ici :  
  



