'use client';
import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Search, Plus, Edit, Trash2, Calendar, Bell, Mail, MessageSquare, BookCheck, RotateCcw, User, Library, Star, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Book {
  id: number;
  isbn: string;
  titre: string;
  auteur: string;
  genre: string;
  status?: string;
  emprunts?: number;
  rating?: number;
  commentaires?: number;
  disponible?: boolean;
  note_moyenne?: number;
  nombre_notes?: number;
}

const Page = () => {
  const router = useRouter();
  const [userType, setUserType] = useState('etudiant');
  const [user, setUser] = useState(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [authorFilter, setAuthorFilter] = useState('');
  const [titleFilter, setTitleFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonctions de redirection pour les étudiants
  const handleSearchRedirect = () => {
    router.push('/catalogue');
  };

  const handleReserveRedirect = () => {
    router.push('/reserve');
  };

  const handleBorrowRedirect = () => {
    router.push('/emprunts');
  };


  const handleNotificationsRedirect = () => {
    router.push('/notif');
  };

  const handleBookDetailsRedirect = (bookId: number) => {
    router.push(`/details/bookId/${bookId}`);
  };

  const handleCommentsRedirect = (bookId: number) => {
    router.push(`/comments/bookId/${bookId}`);
  };

  const handleRatingRedirect = (bookId: number) => {
    router.push(`/rating/bookId/${bookId}`);
  };

  // Fonctions de redirection pour les administrateurs
  const handleAddBookRedirect = () => {
    router.push('/ajoutlivre');
  };

  const handleEditBookRedirect = () => {
    router.push('/modifLi');
  };

  const handleDeleteBookRedirect = () => {
    router.push('/suppLi');
  };

  const handleManageBorrowingsRedirect = () => {
    router.push('/gestEm');
  };

  const handleManageReturnsRedirect = () => {
    router.push('/retourLi');
  };

  const handleAddStudentRedirect = () => {
    router.push('/ajoutEt');
  };

  const handleEditStudentRedirect = () => {
    router.push('/modifEt');
  };

  const handleDeleteStudentRedirect = () => {
    router.push('/suppEt');
  };

  const handleStudentListRedirect = () => {
    router.push('/listeEt');
  };

  // Fonction pour récupérer les livres avec axios
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:4100/api/livres');
      
      // Vérifier si response.data est un tableau
      if (Array.isArray(response.data)) {
        setBooks(response.data);
        setFilteredBooks(response.data);
      } else if (response.data && Array.isArray(response.data.livres)) {
        // Si les données sont dans une propriété 'livres'
        setBooks(response.data.livres);
        setFilteredBooks(response.data.livres);
      } else if (response.data && Array.isArray(response.data.data)) {
        // Si les données sont dans une propriété 'data'
        setBooks(response.data.data);
        setFilteredBooks(response.data.data);
      } else {
        console.error('Format de réponse inattendu:', response.data);
        setError('Format de données incorrect reçu du serveur.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des livres:', error);
      setError('Impossible de charger les livres. Vérifiez que le serveur est démarré.');
      
      // Données de fallback en cas d'erreur
      const fallbackBooks = [
        { 
          id: 1, 
          isbn: '978-123456789', 
          titre: 'Les Misérables', 
          auteur: 'Victor Hugo',
          genre: 'Roman classique',
          status: 'Disponible',
          emprunts: 15,
          rating: 4.5,
          commentaires: 12
        },
        { 
          id: 2, 
          isbn: '978-987654321', 
          titre: 'Le Petit Prince', 
          auteur: 'Antoine de Saint-Exupéry',
          genre: 'Conte philosophique',
          status: 'Emprunté',
          emprunts: 8,
          rating: 4.8,
          commentaires: 25
        },
        { 
          id: 3, 
          isbn: '978-456789123', 
          titre: 'Notre-Dame de Paris', 
          auteur: 'Victor Hugo',
          genre: 'Roman historique',
          status: 'Disponible',
          emprunts: 7,
          rating: 4.2,
          commentaires: 8
        }
      ];
      setBooks(fallbackBooks);
      setFilteredBooks(fallbackBooks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Filtrage des livres
  useEffect(() => {
    let filtered = books;
    
    if (authorFilter) {
      filtered = filtered.filter(book => 
        book.auteur?.toLowerCase().includes(authorFilter.toLowerCase())
      );
    }
    
    if (titleFilter) {
      filtered = filtered.filter(book => 
        book.titre?.toLowerCase().includes(titleFilter.toLowerCase())
      );
    }

    if (genreFilter) {
      filtered = filtered.filter(book => 
        book.genre?.toLowerCase().includes(genreFilter.toLowerCase())
      );
    }
    
    setFilteredBooks(filtered);
  }, [books, authorFilter, titleFilter, genreFilter]);

  // Composant bouton d'action amélioré
  const ActionButton = ({ icon: Icon, title, description, onClick, color = "blue", size = "normal" }: { icon: any, title: string, description?: string, onClick: () => void, color?: string, size?: string }) => {
    const colorClasses = {
      blue: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-200",
      green: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-200",
      purple: "from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-200",
      red: "from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-200",
      yellow: "from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-yellow-200",
      orange: "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200",
      indigo: "from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 shadow-indigo-200",
      gray: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-gray-200"
    };

    const sizeClasses = size === "small" ? "p-3" : "p-4";

    return (
      <button
        onClick={onClick}
        className={`bg-gradient-to-r ${colorClasses[color]} text-white ${sizeClasses} rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex flex-col items-center justify-center text-center min-h-[100px] border-0`}
      >
        <Icon className="w-6 h-6 mb-2" />
        <span className="font-semibold text-sm">{title}</span>
        {description && <span className="text-xs opacity-90 mt-1">{description}</span>}
      </button>
    );
  };

  // Fonction pour afficher les étoiles de notation
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-200 text-yellow-400" />);
    }
    
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return stars;
  };

  // Tableau de bord Étudiant amélioré
  const EtudiantDashboard = () => (
    <div className="space-y-6">
      {/* Actions principales */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-7 h-7 text-blue-600 mr-3" />
          Actions Principales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={Search}
            title="Rechercher"
            description="Parcourir le catalogue"
            onClick={handleSearchRedirect}
            color="blue"
          />
          <ActionButton
            icon={Calendar}
            title="Réserver"
            description="Réserver un livre"
            onClick={handleReserveRedirect}
            color="green"
          />
          <ActionButton
            icon={BookCheck}
            title="Emprunter"
            description="Emprunter un livre"
            onClick={handleBorrowRedirect}
            color="purple"
          />
        </div>
      </div>

      {/* Mes activités */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <User className="w-6 h-6 text-green-600 mr-3" />
          Mes Activités
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <ActionButton
            icon={Bell}
            title="Notifications"
            description="Messages importants"
            onClick={handleNotificationsRedirect}
            color="red"
            size="small"
          />
        </div>
      </div>

      {/* Catalogue des livres */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Library className="w-6 h-6 text-purple-600 mr-3" />
          Catalogue des Livres
        </h3>
        
        {/* Filtres de recherche */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <input
            type="text"
            placeholder="Rechercher par auteur..."
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Rechercher par titre..."
            value={titleFilter}
            onChange={(e) => setTitleFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-500"
          />
          <input
            type="text"
            placeholder="Rechercher par genre..."
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors bg-white text-gray-800 placeholder-gray-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-3"></div>
            <p className="text-gray-600">Chargement des livres...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <p className="text-red-600">⚠ {error}</p>
            <button 
              onClick={fetchBooks}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        ) : null}

        {/* Liste des livres */}
        <div className="space-y-4">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div key={book.id} className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800 mb-2">{book.titre}</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-600 flex items-center">
                        <span className="font-medium">✍ Auteur:</span> 
                        <span className="ml-2">{book.auteur}</span>
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <span className="font-medium">📚 Genre:</span> 
                        <span className="ml-2">{book.genre}</span>
                      </p>
                      <p className="text-gray-500 flex items-center">
                        <span className="font-medium">📖 ISBN:</span> 
                        <span className="ml-2">{book.isbn}</span>
                      </p>
                    </div>
                    
                    {/* Notation et statistiques */}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        {renderStars(book.rating || 0)}
                        <span className="text-sm text-gray-600 ml-1">({book.rating || 0})</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        💬 {book.commentaires || 0} commentaires
                      </span>
                    </div>
                    
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-3 ${
                      book.status === 'Disponible' ? 'bg-green-100 text-green-800' :
                      book.status === 'Emprunté' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button 
                      onClick={() => handleBookDetailsRedirect(book.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Détails
                    </button>
                    <button 
                      onClick={() => handleCommentsRedirect(book.id)}
                      className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      💬 Commentaires
                    </button>
                    <button 
                      onClick={() => handleRatingRedirect(book.id)}
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      ⭐ Noter
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun livre trouvé avec ces critères</p>
              {(authorFilter || titleFilter || genreFilter) && (
                <button 
                  onClick={() => {
                    setAuthorFilter('');
                    setTitleFilter('');
                    setGenreFilter('');
                  }}
                  className="mt-2 text-blue-500 hover:text-blue-600 underline"
                >
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Tableau de bord Administration simplifié
  const AdminDashboard = () => (
    <div className="space-y-6">
      {/* Gestion des livres */}
      <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <BookOpen className="w-7 h-7 text-red-600 mr-3" />
          Gestion des Livres
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActionButton
            icon={Plus}
            title="Ajouter Livre"
            description="Nouveau livre"
            onClick={handleAddBookRedirect}
            color="green"
          />
          <ActionButton
            icon={Edit}
            title="Modifier Livre"
            description="Éditer un livre"
            onClick={handleEditBookRedirect}
            color="yellow"
          />
          <ActionButton
            icon={Trash2}
            title="Supprimer Livre"
            description="Retirer du catalogue"
            onClick={handleDeleteBookRedirect}
            color="red"
          />
        </div>
      </div>

      {/* Gestion des emprunts et retours */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border border-blue-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BookCheck className="w-6 h-6 text-blue-600 mr-3" />
          Gestion des Emprunts & Retours
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionButton
            icon={Calendar}
            title="Gérer Emprunts"
            description="Suivi des prêts"
            onClick={handleManageBorrowingsRedirect}
            color="blue"
          />
          <ActionButton
            icon={RotateCcw}
            title="Gérer Retours"
            description="Traiter les retours"
            onClick={handleManageReturnsRedirect}
            color="purple"
          />
        </div>
      </div>

      {/* Gestion des étudiants */}
      <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-2xl border border-green-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Users className="w-6 h-6 text-green-600 mr-3" />
          Gestion des Étudiants
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ActionButton
            icon={Plus}
            title="Ajouter Étudiant"
            description="Nouvel utilisateur"
            onClick={handleAddStudentRedirect}
            color="green"
            size="small"
          />
          <ActionButton
            icon={Edit}
            title="Modifier Étudiant"
            description="Éditer profil"
            onClick={handleEditStudentRedirect}
            color="yellow"
            size="small"
          />
          <ActionButton
            icon={Trash2}
            title="Supprimer Étudiant"
            description="Retirer utilisateur"
            onClick={handleDeleteStudentRedirect}
            color="red"
            size="small"
          />
          <ActionButton
            icon={Users}
            title="Liste Étudiants"
            description="Voir tous"
            onClick={handleStudentListRedirect}
            color="blue"
            size="small"
          />
        </div>
      </div>

      {/* Statistiques des livres */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Library className="w-6 h-6 text-purple-600 mr-3" />
          Statistiques du Catalogue
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-800">{books.length}</div>
            <div className="text-blue-600 text-sm">Total Livres</div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-green-800">
              {books.filter(b => b.status === 'Disponible').length}
            </div>
            <div className="text-green-600 text-sm">Disponibles</div>
          </div>
          <div className="bg-gradient-to-br from-red-100 to-red-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-red-800">
              {books.filter(b => b.status === 'Emprunté').length}
            </div>
            <div className="text-red-600 text-sm">Empruntés</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-yellow-800">
              {books.filter(b => b.status === 'Réservé').length}
            </div>
            <div className="text-yellow-600 text-sm">Réservés</div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    // Récupérer l'utilisateur connecté depuis le localStorage
    const userStr = localStorage.getItem('user');
    let storedUser = null;
    try {
      storedUser = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    }
    setUser(storedUser);
    if (storedUser && storedUser.role === 1) {
      setUserType('admin');
    } else {
      setUserType('etudiant');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Header */}
      <div className="bg-white shadow-xl rounded-2xl p-6 mb-6 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📚 Bibliothèque Smart
          </h1>
          <p className="text-gray-600">Système de gestion intelligente</p>
        </div>
      </div>

      {/* Tableau de bord selon le type d'utilisateur */}
      {userType === 'etudiant' ? <EtudiantDashboard /> : <AdminDashboard />}
    </div>
  );
};

export default Page;