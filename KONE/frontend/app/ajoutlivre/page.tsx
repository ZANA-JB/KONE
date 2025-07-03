'use client';
import React, { useState, useEffect } from 'react';
import { Plus, Loader2, AlertCircle, CheckCircle, Book, User, Hash, Tag } from 'lucide-react';

const AjoutLivrePage = () => {
  const [formData, setFormData] = useState({
    titre: '',
    isbn: '',
    auteur: '',
    genre: '',
    disponible: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');

  // Récupération du token depuis localStorage
  useEffect(() => {
    try {
      // Essayer différentes clés possibles pour le token
      const storedToken = localStorage.getItem('userToken') || 
                         localStorage.getItem('token') || 
                         localStorage.getItem('authToken') || 
                         localStorage.getItem('jwt') ||
                         localStorage.getItem('accessToken');
      if (storedToken) {
        setToken(storedToken);
      } else {
        setMessage({ 
          type: 'error', 
          text: '⚠️ Aucun token d\'authentification trouvé. Veuillez vous connecter.' 
        });
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du token:', error);
      setMessage({ 
        type: 'error', 
        text: '❌ Erreur lors de la récupération du token d\'authentification.' 
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      isbn: '',
      auteur: '',
      genre: '',
      disponible: true,
    });
    // Ne pas effacer le message ici pour garder la confirmation visible
  };

  const validateForm = () => {
    if (!formData.titre.trim()) {
      setMessage({ type: 'error', text: '❌ Le titre est obligatoire.' });
      return false;
    }
    if (!formData.isbn.trim()) {
      setMessage({ type: 'error', text: '❌ L\'ISBN est obligatoire.' });
      return false;
    }
    if (!formData.auteur.trim()) {
      setMessage({ type: 'error', text: '❌ L\'auteur est obligatoire.' });
      return false;
    }
    if (!formData.genre.trim()) {
      setMessage({ type: 'error', text: '❌ Le genre est obligatoire.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Vérification du token avant l'envoi
    if (!token) {
      setMessage({ 
        type: 'error', 
        text: '❌ Token d\'authentification manquant. Veuillez vous reconnecter.' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Préparer les données à envoyer
      const dataToSend = {
        titre: formData.titre.trim(),
        isbn: formData.isbn.trim(),
        auteur: formData.auteur.trim(),
        genre: formData.genre.trim(),
        disponible: formData.disponible
      };
      setMessage({ type: '', text: '' });
      // Requête API - utilisation du header Authorization standard
      const response = await fetch('http://localhost:4100/api/livres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      });
      if (response.ok) {
        const result = await response.json();
        setMessage({ type: 'success', text: '✅ Livre ajouté avec succès !' });
        resetForm();
        // Laisser le message affiché pendant 3 secondes puis le retirer
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Erreur inconnue du serveur' };
        }
        // Gestion détaillée des erreurs
        if (response.status === 401) {
          setMessage({ type: 'error', text: '❌ Token invalide ou expiré. Veuillez vous reconnecter.' });
          localStorage.removeItem('userToken');
          setToken('');
        } else if (response.status === 403) {
          setMessage({ type: 'error', text: '❌ Accès interdit. Permissions insuffisantes.' });
        } else if (response.status === 400) {
          setMessage({ type: 'error', text: `❌ Données invalides: ${errorData.message || 'Vérifiez les informations saisies'}` });
        } else if (response.status === 409) {
          setMessage({ type: 'error', text: '❌ Ce livre existe déjà (ISBN en double).' });
        } else {
          setMessage({ type: 'error', text: errorData.message || `❌ Erreur serveur (${response.status})` });
        }
        // Log technique en console
        console.error('❌ Erreur serveur:', errorData);
      }
    } catch (error) {
      console.error('❌ Erreur réseau:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error && error.message.includes('fetch')
          ? '❌ Erreur de connexion. Vérifiez que le serveur est accessible sur http://localhost:4100'
          : '❌ Une erreur inattendue est survenue.'
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header avec design moderne */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full mb-6 shadow-xl">
            <Book className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Ajouter un Nouveau Livre
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Complétez les informations ci-dessous pour enrichir votre bibliothèque
          </p>
        </div>

        {/* Card principale */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden backdrop-blur-sm">
          
          {/* Messages de succès/erreur */}
          {message.type === 'success' && (
            <div className="mx-8 mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-emerald-800">Parfait !</p>
                  <p className="text-sm text-emerald-700">Livre ajouté avec succès !</p>
                </div>
              </div>
            </div>
          )}
          
          {message.type === 'error' && message.text && (
            <div className="mx-8 mt-8 p-5 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">Attention</p>
                  <p className="text-sm text-red-700">{message.text}</p>
                </div>
              </div>
            </div>
          )}

          {/* Formulaire - GARDE INTACT */}
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Champ Titre */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Book className="w-5 h-5 text-indigo-600" />
                </div>
                Titre du livre
                <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                required
                className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-lg placeholder-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
                placeholder="Entrez le titre du livre"
              />
            </div>

            {/* Champ ISBN */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Hash className="w-5 h-5 text-indigo-600" />
                </div>
                ISBN
                <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                required
                className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-lg placeholder-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
                placeholder="Ex: 978-2-1234-5678-9"
              />
            </div>

            {/* Champ Auteur */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                Auteur
                <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="text"
                name="auteur"
                value={formData.auteur}
                onChange={handleChange}
                required
                className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-lg placeholder-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
                placeholder="Nom de l'auteur"
              />
            </div>

            {/* Champ Genre */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 text-sm font-bold text-gray-800 mb-2">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Tag className="w-5 h-5 text-indigo-600" />
                </div>
                Genre
                <span className="text-red-500 text-lg">*</span>
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                required
                className="w-full h-14 px-5 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-lg placeholder-gray-400 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 outline-none shadow-sm hover:shadow-md"
                placeholder="Ex: Roman, Science-fiction, Histoire..."
              />
            </div>

            {/* Checkbox Disponibilité */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border-2 border-indigo-100">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  name="disponible"
                  checked={formData.disponible}
                  onChange={handleChange}
                  className="w-6 h-6 text-indigo-600 border-2 border-gray-300 rounded-lg focus:ring-indigo-500 focus:ring-2 transition-colors"
                />
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-lg font-medium text-gray-700">
                    Livre disponible à l'emprunt
                  </span>
                </div>
              </label>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={loading || !token}
                className="flex-1 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:-translate-y-1 active:translate-y-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Ajout en cours...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-6 h-6" />
                    <span>Ajouter le livre</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="h-14 px-8 bg-white border-2 border-gray-300 text-gray-700 text-lg font-semibold rounded-2xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0"
              >
                Réinitialiser
              </button>
            </div>

            {/* Indicateur de statut */}
            <div className="flex items-center justify-center pt-6">
              <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-semibold ${
                token 
                  ? 'bg-green-100 text-green-800 border-2 border-green-200' 
                  : 'bg-red-100 text-red-800 border-2 border-red-200'
              }`}>
                <div className={`w-3 h-3 rounded-full ${token ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                {token ? ' Authentifié et prêt' : '⚠️ Authentification requise'}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AjoutLivrePage;