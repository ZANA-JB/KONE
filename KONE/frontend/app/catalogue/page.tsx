'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  Eye, 
  Calendar, 
  User, 
  Tag, 
  Grid, 
  List, 
  SortAsc, 
  SortDesc,
  RefreshCw,
  Download,
  Share2,
  Bookmark
} from 'lucide-react';


const BookCatalogPage = () => {
  const router = useRouter();
  
  // États pour les livres et filtres
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [sortBy, setSortBy] = useState('titre');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' ou 'list'

  // Récupération des livres depuis l'API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Appel API avec axios
      const response = await axios.get('http://localhost:4100/api/livres');
      
      const data = response.data;
      
      // Vérifier si data est un tableau
      if (Array.isArray(data)) {
        setBooks(data);
        setFilteredBooks(data);
      } else if (data && Array.isArray(data.livres)) {
        // Si les données sont dans une propriété 'livres'
        setBooks(data.livres);
        setFilteredBooks(data.livres);
      } else if (data && Array.isArray(data.data)) {
        // Si les données sont dans une propriété 'data'
        setBooks(data.data);
        setFilteredBooks(data.data);
      } else {
        console.error('Format de réponse inattendu:', data);
        setError('Format de données incorrect reçu du serveur.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des livres:', error);
      setError('Impossible de charger les livres. Vérifiez que le serveur est démarré.');
      
      // Données de démonstration en cas d'erreur
      const demoBooks = [
        {
          id: 1,
          isbn: '978-2-07-036549-7',
          titre: 'Les Misérables',
          auteur: 'Victor Hugo',
          genre: 'Roman classique',
          anneePublication: 1862,
          description: 'Un chef-d\'œuvre de la littérature française qui suit le destin de Jean Valjean.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-01-15'
        },
        {
          id: 2,
          isbn: '978-2-07-037218-1',
          titre: 'Le Petit Prince',
          auteur: 'Antoine de Saint-Exupéry',
          genre: 'Conte philosophique',
          anneePublication: 1943,
          description: 'L\'histoire d\'un petit prince venu d\'une autre planète.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-01-20'
        },
        {
          id: 3,
          isbn: '978-2-07-040928-4',
          titre: 'Notre-Dame de Paris',
          auteur: 'Victor Hugo',
          genre: 'Roman historique',
          anneePublication: 1831,
          description: 'L\'histoire d\'Esmeralda et de Quasimodo dans le Paris médiéval.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-02-01'
        },
        {
          id: 4,
          isbn: '978-2-07-041089-1',
          titre: 'L\'Étranger',
          auteur: 'Albert Camus',
          genre: 'Roman philosophique',
          anneePublication: 1942,
          description: 'L\'histoire de Meursault, un homme indifférent au monde.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-02-05'
        },
        {
          id: 5,
          isbn: '978-2-07-041234-5',
          titre: 'Madame Bovary',
          auteur: 'Gustave Flaubert',
          genre: 'Roman réaliste',
          anneePublication: 1857,
          description: 'Le drame d\'Emma Bovary, femme insatisfaite de sa condition.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-02-10'
        },
        {
          id: 6,
          isbn: '978-2-07-041456-1',
          titre: 'Le Rouge et le Noir',
          auteur: 'Stendhal',
          genre: 'Roman psychologique',
          anneePublication: 1830,
          description: 'L\'ascension sociale de Julien Sorel dans la France du XIXe siècle.',
          couverture: '/api/placeholder/200/300',
          dateAjout: '2024-02-15'
        }
      ];
      
      setBooks(demoBooks);
      setFilteredBooks(demoBooks);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fonction de navigation vers les détails
  const handleViewDetails = (bookId) => {
    router.push(`/details/bookId/${bookId}`);
  };

  // Fonction de filtrage et tri
  useEffect(() => {
    let filtered = [...books];

    // Filtrage par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.auteur?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn?.includes(searchTerm)
      );
    }

    // Filtrage par genre
    if (selectedGenre) {
      filtered = filtered.filter(book => book.genre === selectedGenre);
    }

    // Filtrage par auteur
    if (selectedAuthor) {
      filtered = filtered.filter(book => book.auteur === selectedAuthor);
    }

    // Tri
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'anneePublication') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBooks(filtered);
  }, [books, searchTerm, selectedGenre, selectedAuthor, sortBy, sortOrder]);

  // Obtenir les valeurs uniques pour les filtres
  const getUniqueValues = (field) => {
    return [...new Set(books.map(book => book[field]).filter(Boolean))];
  };

  // Composant carte de livre (vue grille)
  const BookCard = ({ book }) => (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group">
      {/* Image de couverture */}
      <div className="relative h-64 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 flex items-center justify-center border-b border-gray-200">
        <BookOpen className="w-16 h-16 text-indigo-400" />
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
            Disponible
          </span>
        </div>
        {/* Boutons d'action au survol */}
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex gap-2">
            <button 
              onClick={() => handleViewDetails(book.id)}
              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors shadow-md">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Informations du livre */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">{book.titre}</h3>
        <p className="text-gray-600 mb-2 flex items-center">
          <User className="w-4 h-4 mr-2 text-indigo-500" />
          {book.auteur}
        </p>
        <p className="text-gray-500 text-sm mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-2 text-purple-500" />
          {book.genre}
        </p>
        <p className="text-gray-500 text-sm mb-3 flex items-center">
          <Calendar className="w-4 h-4 mr-2 text-blue-500" />
          {book.anneePublication}
        </p>

        {/* Notation (non notés) */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-gray-300" />
            ))}
            <span className="text-sm text-gray-500 ml-1">Non noté</span>
          </div>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">0 emprunts</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{book.description}</p>

        {/* Bouton d'action */}
        <button 
          onClick={() => handleViewDetails(book.id)}
          className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Voir détails
        </button>
      </div>
    </div>
  );

  // Composant ligne de livre (vue liste)
  const BookRow = ({ book }) => (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4">
      <div className="flex items-center gap-4">
        {/* Miniature */}
        <div className="w-16 h-20 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-indigo-400" />
        </div>

        {/* Informations principales */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-800 truncate">{book.titre}</h3>
          <p className="text-gray-600">{book.auteur}</p>
          <p className="text-gray-500 text-sm">{book.genre} • {book.anneePublication}</p>
        </div>

        {/* Notation (non notés) */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gray-300" />
          ))}
          <span className="text-sm text-gray-500 ml-1">Non noté</span>
        </div>

        {/* Statut */}
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
          Disponible
        </span>

        {/* Actions */}
        <button 
          onClick={() => handleViewDetails(book.id)}
          className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
        >
          Voir détails
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      {/* Header */}
      <div className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 mb-6">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            📚 Catalogue des Livres
          </h1>
          <p className="text-gray-600">Explorez notre collection complète de livres</p>
        </div>

        {/* Barre de recherche principale */}
        <div className="relative max-w-2xl mx-auto mb-6">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par titre, auteur, genre ou ISBN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none text-lg bg-white shadow-sm placeholder-gray-500"
          />
        </div>

        {/* Contrôles et filtres */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filtres rapides */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none bg-white text-gray-700 shadow-sm"
            >
              <option value="">Tous les genres</option>
              {getUniqueValues('genre').map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>

            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none bg-white text-gray-700 shadow-sm"
            >
              <option value="">Tous les auteurs</option>
              {getUniqueValues('auteur').map(auteur => (
                <option key={auteur} value={auteur}>{auteur}</option>
              ))}
            </select>
          </div>

          {/* Contrôles d'affichage */}
          <div className="flex items-center gap-3">
            {/* Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:border-indigo-500 focus:outline-none bg-white text-gray-700 shadow-sm"
            >
              <option value="titre">Titre</option>
              <option value="auteur">Auteur</option>
              <option value="anneePublication">Année</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white text-gray-700 shadow-sm"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
            </button>

            {/* Mode d'affichage */}
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-300 shadow-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow text-indigo-600' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow text-indigo-600' : 'hover:bg-gray-200 text-gray-600'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={fetchBooks}
              className="p-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <p className="text-gray-700 font-medium bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
            {loading ? 'Chargement...' : `${filteredBooks.length} livre(s) trouvé(s)`}
          </p>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-200 text-gray-700 shadow-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-3 py-2 rounded-lg text-sm transition-colors border border-gray-200 text-gray-700 shadow-sm">
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des livres...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 mb-4">⚠ {error}</p>
          <button 
            onClick={fetchBooks}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réessayer
          </button>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun livre trouvé</h3>
          <p className="text-gray-500 mb-4">Essayez de modifier vos critères de recherche</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedGenre('');
              setSelectedAuthor('');
            }}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {filteredBooks.map(book => (
            viewMode === 'grid' 
              ? <BookCard key={book.id} book={book} />
              : <BookRow key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookCatalogPage;