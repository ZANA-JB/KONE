'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ArrowLeft, 
  BookOpen, 
  User, 
  Tag, 
  Hash,
  MessageSquare,
  Send,
  Calendar,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const BookCommentsPage = () => {
  const { bookId } = useParams();
  const router = useRouter();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleReset = () => {
    setComment('');
    setAuthor('');
    setError(null);
    setSubmitSuccess(false);
    setSuccessMessage('');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    console.log('Début de la soumission du commentaire');
    console.log('Commentaire:', comment);
    console.log('Auteur:', author);
    console.log('Book ID:', bookId);
    
    // Validation
    if (!comment.trim()) {
      alert('Veuillez saisir un commentaire');
      return;
    }
    
    if (!author.trim()) {
      alert('Veuillez saisir votre nom');
      return;
    }

    // Validation de longueur minimale
    if (comment.trim().length < 10) {
      alert('Le commentaire doit contenir au moins 10 caractères');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const commentData = {
        contenu: comment.trim(),
        auteur: author.trim()
      };
      
      console.log('=== DÉBUT DE L\'ENVOI ===');
      console.log('Données envoyées:', commentData);
      console.log('URL:', `http://localhost:4100/api/livres/${bookId}/commentaires`);
      
      // Test de connectivité d'abord
      console.log('Test de connectivité...');
      
      const response = await axios({
        method: 'POST',
        url: `http://localhost:4100/api/livres/${bookId}/commentaires`,
        data: commentData,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });
      
      console.log('=== RÉPONSE REÇUE ===');
      console.log('Status:', response.status);
      console.log('Data:', response.data);
      console.log('Headers:', response.headers);
      
      if (response.data && response.data.success) {
        setSubmitSuccess(true);
        setSuccessMessage(response.data.message || 'Commentaire ajouté avec succès');
        
        // Afficher les détails du commentaire créé
        if (response.data.data) {
          console.log('Commentaire créé avec ID:', response.data.data.id);
        }
        
        // Réinitialiser le formulaire après 3 secondes
        setTimeout(() => {
          setComment('');
          setAuthor('');
          setSubmitSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } else {
        throw new Error(response.data?.message || 'Réponse inattendue du serveur');
      }
      
    } catch (err) {
      console.error('=== ERREUR COMPLÈTE ===');
      console.error('Erreur:', err);
      console.error('Message:', err.message);
      console.error('Response status:', err.response?.status);
      console.error('Response data:', err.response?.data);
      console.error('Response headers:', err.response?.headers);
      console.error('Request config:', err.config);
      
      let errorMessage = 'Erreur lors de l\'envoi du commentaire';
      
      if (err.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré sur localhost:4100';
      } else if (err.code === 'ENOTFOUND') {
        errorMessage = 'Serveur introuvable. Vérifiez l\'URL du serveur';
      } else if (err.response?.status === 401) {
        errorMessage = 'Erreur d\'autorisation (401). Vérifiez la configuration CORS ou l\'authentification du serveur';
      } else if (err.response?.status === 400) {
        errorMessage = `Données invalides (400): ${err.response?.data?.message || 'Format de données incorrect'}`;
      } else if (err.response?.status === 404) {
        errorMessage = 'Livre non trouvé (404). L\'ID du livre n\'existe pas dans la base de données';
      } else if (err.response?.status === 500) {
        errorMessage = `Erreur serveur (500): ${err.response?.data?.message || 'Erreur interne du serveur'}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // Alert avec informations détaillées
      alert(`❌ Erreur d'envoi\n\n${errorMessage}\n\n📋 Détails techniques:\n• Status: ${err.response?.status || 'N/A'}\n• Code: ${err.code || 'N/A'}\n• URL: ${err.config?.url || 'N/A'}`);
    } finally {
      setSubmitting(false);
      console.log('=== FIN DE LA SOUMISSION ===');
    }
  };

  // Fonction pour tester la connexion au serveur
  const testServerConnection = async () => {
    try {
      console.log('Test de connexion au serveur...');
      const response = await axios.get(`http://localhost:4100/api/livres/${bookId}`);
      console.log('✅ Serveur accessible:', response.status);
      alert('✅ Connexion au serveur OK');
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      alert(`❌ Erreur de connexion au serveur: ${err.message}`);
    }
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
            Retour
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
            Retour
          </button>
        </div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Succès !</h2>
          <p className="text-gray-600 mb-4">{successMessage}</p>
          <p className="text-sm text-green-600 mb-6">✅ Le commentaire a été enregistré dans la base de données</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setSuccessMessage('');
              }}
              className="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Ajouter un autre commentaire
            </button>
            <button
              onClick={handleGoBack}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Retour aux livres
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Vérifier si le bouton doit être désactivé
  const isButtonDisabled = submitting || !comment.trim() || !author.trim() || comment.trim().length < 10;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec bouton retour */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={handleGoBack}
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          {/* Bouton de test de connexion pour debug */}
          <button
            onClick={testServerConnection}
            className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded transition-colors"
          >
            🔧 Test connexion
          </button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* En-tête avec informations du livre */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-20 bg-white/20 rounded-lg flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold mb-2">Commenter ce livre</h1>
                <h2 className="text-xl font-semibold text-white/90">{book.titre}</h2>
                <p className="text-white/80">par {book.auteur}</p>
              </div>
              <div className="text-right">
                <MessageSquare className="w-12 h-12 text-white/60" />
              </div>
            </div>
          </div>

          {/* Informations résumées du livre */}
          <div className="p-6 bg-gray-50 border-b">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Tag className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-500">Genre</p>
                  <p className="font-semibold text-gray-800">{book.genre}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-500">ISBN</p>
                  <p className="font-semibold text-gray-800 font-mono">{book.isbn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">ID</p>
                  <p className="font-semibold text-gray-800">#{book.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div>
                  <p className="text-red-800 font-medium">Erreur lors de l'envoi</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire de commentaire */}
          <div className="p-6">
            <form onSubmit={handleSubmitComment} className="space-y-6">
              {/* Nom de l'auteur */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Votre nom *
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Entrez votre nom"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-black placeholder-gray-400"
                  disabled={submitting}
                  required
                />
              </div>

              {/* Zone de commentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Votre commentaire *
                </label>
                <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Partagez votre avis sur ce livre, ce que vous avez aimé ou moins aimé..."
                    rows={6}
                    className="w-full px-4 py-3 border-0 rounded-lg resize-none focus:ring-0 focus:outline-none bg-white text-black placeholder-gray-400"
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <p className="text-gray-500">
                    Minimum 10 caractères • Soyez respectueux et constructif
                  </p>
                  <p className={`${comment.length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                    {comment.length}/10
                  </p>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-800">Publication publique</p>
                    <p className="text-sm text-blue-600">Votre commentaire sera visible par tous les utilisateurs</p>
                  </div>
                </div>
              </div>

              {/* Debug info */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-sm">
                <p className="font-medium text-gray-700 mb-2">📊 État du formulaire :</p>
                <div className="space-y-1 text-gray-600">
                  <p>• Nom: {author.trim() ? '✅ Rempli' : '❌ Vide'}</p>
                  <p>• Commentaire: {comment.trim().length >= 10 ? '✅ Valide' : `❌ Trop court (${comment.length}/10)`}</p>
                  <p>• Bouton: {isButtonDisabled ? '🔒 Désactivé' : '✅ Activé'}</p>
                  <p>• En cours d'envoi: {submitting ? '⏳ Oui' : '✅ Non'}</p>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-3 px-6 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Réinitialiser
                </button>
                <button
                  type="submit"
                  className={`flex-1 py-3 px-6 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 ${
                    isButtonDisabled 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                  }`}
                  disabled={isButtonDisabled}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer à la base de données
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCommentsPage;