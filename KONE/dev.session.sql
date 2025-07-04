-
CREATE DATABASE IF NOT EXISTS api;
use api;


-- Création de la table users (doit être créée avant les tables qui y font référence)
CREATE TABLE IF NOT EXISTS users (
    id_users INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role TINYINT(1) NOT NULL DEFAULT 0

);

--roles
UPDATE users
SET role = 1
WHERE email = 'kone1@example.com';  -- Passe kone  en admin


-- Création de la table livres
CREATE TABLE IF NOT EXISTS livres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) NOT NULL UNIQUE,
    auteur VARCHAR(255) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    genre VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_titre ON livres(titre);
CREATE INDEX idx_auteur ON livres(auteur);
CREATE INDEX idx_genre ON livres(genre);
CREATE INDEX idx_disponible ON livres(disponible);

-- Création de la table commentaires
CREATE TABLE IF NOT EXISTS commentaires (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contenu TEXT,
    auteur VARCHAR(100),
    livre_id INT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- Création de la table notations
CREATE TABLE IF NOT EXISTS notations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livre_id INT NOT NULL,
    note INT NOT NULL CHECK (note >= 1 AND note <= 5),
    utilisateur_nom VARCHAR(255) NOT NULL,
    date_notation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE,
    INDEX idx_livre_id (livre_id),
    INDEX idx_utilisateur_nom (utilisateur_nom),
    UNIQUE KEY unique_user_book (livre_id, utilisateur_nom)
);

-- Création de la table emprunts
CREATE TABLE IF NOT EXISTS emprunts (
    id_emprunt INT AUTO_INCREMENT PRIMARY KEY,
    id_users INT NOT NULL,
    id_livre INT NOT NULL,
    date_emprunt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_retour_prevue DATE NOT NULL,
    date_retour_effective DATE DEFAULT NULL,
    statut ENUM('en_cours', 'retourne', 'en_retard') DEFAULT 'en_cours',
    FOREIGN KEY (id_users) REFERENCES users(id_users) ON DELETE CASCADE,
    FOREIGN KEY (id_livre) REFERENCES livres(id) ON DELETE CASCADE
);

-- Création de la table reservations
CREATE TABLE IF NOT EXISTS reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livre_id INT NOT NULL,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    date_reservation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (livre_id) REFERENCES livres(id) ON DELETE CASCADE
);

-- Insertion de quelques données de test dans livres
INSERT INTO livres (titre, isbn, auteur, disponible, genre) VALUES
('Le Petit Prince', '978-2-07-040847-5', 'Antoine de Saint-Exupéry', 0, 'Fiction'),
('1984', '978-0-452-28423-4', 'George Orwell', 0, 'Dystopie'),
('Harry Potter à l''école des sorciers', '978-2-07-054120-1', 'J.K. Rowling', 0, 'Fantasy'),
('L''Étranger', '978-2-07-036002-1', 'Albert Camus', 0, 'Philosophie'),
('Les Misérables', '978-2-253-09681-4', 'Victor Hugo', 0, 'Classique'),
('Le Seigneur des Anneaux', '978-2-266-11815-4', 'J.R.R. Tolkien', 0, 'Fantasy'),
('Guerre et Paix', '978-2-07-040445-3', 'Léon Tolstoï', 0, 'Classique'),
('Le Meilleur des mondes', '978-2-266-12956-3', 'Aldous Huxley', 0, 'Science-fiction'),
('La République', '978-2-07-037748-7', 'Platon', 0, 'Philosophie'),
('Don Quichotte', '978-2-07-011188-3', 'Miguel de Cervantes', 0, 'Classique'),
('Crime et Châtiment', '978-2-07-040137-7', 'Fiodor Dostoïevski', 0, 'Classique'),
('La Peste', '978-2-07-036042-7', 'Albert Camus', 0, 'Philosophie'),
('Fahrenheit 451', '978-2-07-036822-5', 'Ray Bradbury', 0, 'Science-fiction'),
('Notre-Dame de Paris', '978-2-253-08048-6', 'Victor Hugo', 0, 'Classique'),
('Le Comte de Monte-Cristo', '978-2-253-07011-1', 'Alexandre Dumas', 0, 'Aventure'),
('La Condition humaine', '978-2-07-036493-7', 'André Malraux', 0, 'Philosophie');


