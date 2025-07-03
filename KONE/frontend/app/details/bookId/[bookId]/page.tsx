'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Calendar, 
  Tag, 
  Hash,
  CheckCircle,
  XCircle,
  Star,
  Share2,
  Clock,
  AlertCircle
} from 'lucide-react';

const BookDetailsPage = () => {
  const { bookId } = useParams();
  const router = useRouter();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!bookId) return;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Récupération du livre avec ID:', bookId);
        const response = await axios.get(`http://localhost:4100/api/livres/${bookId}`);
        
        console.log('Réponse de l\'API:', response.data);
        
        if (response.data.success && response.data.data) {
          setBook(response.data.data);
        } else {
          setError('Livre non trouvé');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du livre:', err);
        if (err.response?.status === 404) {
          setError('Livre non trouvé');
        } else if (err.response?.status === 400) {
          setError('ID de livre invalide');
        } else {
          setError('Impossible de charger les détails du livre');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des détails du livre...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erreur</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleGoBack}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Livre non trouvé</h2>
          <p className="text-gray-600 mb-6">Le livre demandé n'existe pas ou n'est plus disponible.</p>
          <button
            onClick={handleGoBack}
            className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
          >
            Retour au catalogue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour au catalogue
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Image de couverture */}
            <div className="md:w-1/3 bg-gradient-to-br from-indigo-100 via-blue-50 to-purple-100 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="w-64 h-80 bg-white rounded-lg shadow-lg flex items-center justify-center mb-6 border border-gray-200">
                  <BookOpen className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="flex justify-center gap-3">
                  <button className="bg-white hover:bg-gray-50 text-gray-700 p-3 rounded-lg shadow-md transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Informations du livre */}
            <div className="md:w-2/3 p-8">
              {/* Titre et statut */}
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-gray-800 leading-tight">
                    {book.titre}
                  </h1>
                  <div className="ml-4">
                    {book.disponible ? (
                      <span className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium border border-emerald-200">
                        <CheckCircle className="w-4 h-4" />
                        Disponible
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200">
                        <XCircle className="w-4 h-4" />
                        Indisponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Notation */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gray-300" />
                    ))}
                  </div>
                  <span className="text-gray-500">Non noté</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">0 avis</span>
                </div>
              </div>

              {/* Informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <User className="w-6 h-6 text-indigo-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Auteur</p>
                      <p className="text-gray-800 font-semibold">{book.auteur}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Tag className="w-6 h-6 text-purple-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Genre</p>
                      <p className="text-gray-800 font-semibold">{book.genre}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <Hash className="w-6 h-6 text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">ISBN</p>
                      <p className="text-gray-800 font-semibold font-mono">{book.isbn}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <BookOpen className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium">ID du livre</p>
                      <p className="text-gray-800 font-semibold">#{book.id}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">0</p>
                  <p className="text-sm text-blue-600">Emprunts</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-2xl font-bold text-green-600">0</p>
                  <p className="text-sm text-green-600">Réservations</p>
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="mt-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Informations d'emprunt</h3>
                </div>
                <p className="text-amber-700 text-sm">
                  Durée d'emprunt : 14 jours • Renouvelable une fois • Retour possible 24h/24
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;