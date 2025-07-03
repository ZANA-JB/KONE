'use client';
import React, { useState, useEffect } from 'react';

const NotationPage = () => {
  const [livres, setLivres] = useState([]);
  const [selectedLivre, setSelectedLivre] = useState(null);
  const [notation, setNotation] = useState({
    note: 0,
    utilisateur_nom: ''
  });
  const [notations, setNotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLivres, setLoadingLivres] = useState(true);
  const [message, setMessage] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchLivres();
  }, []);

  // Fonction utilitaire pour s'assurer qu'une valeur est un nombre
  const ensureNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // Fonction utilitaire pour formater la note moyenne
  const formatNoteMoyenne = (noteMoyenne) => {
    const num = ensureNumber(noteMoyenne);
    return num.toFixed(1);
  };

  const fetchLivres = async () => {
    setLoadingLivres(true);
    try {
      const response = await fetch('http://localhost:4100/api/livres');
      const data = await response.json();
      
      if (data.success) {
        // Normaliser les données reçues - toutes les notes à zéro initialement
        const livresNormalises = data.data.map(livre => ({
          ...livre,
          note_moyenne: 0, // Toujours à zéro au début
          nombre_notes: 0  // Aucune note au début
        }));
        setLivres(livresNormalises);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des livres:', error);
      setMessage('Erreur de connexion au serveur');
    } finally {
      setLoadingLivres(false);
    }
  };

  const fetchNotations = async (livreId) => {
    try {
      const response = await fetch(`http://localhost:4100/api/livres/${livreId}/notations`);
      const data = await response.json();
      
      if (data.success) {
        setNotations(data.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des notations:', error);
      setNotations([]);
    }
  };

  const handleLivreSelect = (livre) => {
    setSelectedLivre(livre);
    setNotation({ note: 0, utilisateur_nom: '' });
    setMessage('');
    setHoveredStar(0);
    fetchNotations(livre.id);
  };

  const handleStarClick = (star) => {
    setNotation({ ...notation, note: star });
  };

  const handleStarHover = (star) => {
    setHoveredStar(star);
  };

  const handleSubmit = async () => {
    if (!selectedLivre) {
      setMessage('Veuillez sélectionner un livre');
      return;
    }

    if (notation.note === 0) {
      setMessage('Veuillez donner une note');
      return;
    }

    if (!notation.utilisateur_nom.trim()) {
      setMessage('Veuillez entrer votre nom');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(
        `http://localhost:4100/api/livres/${selectedLivre.id}/notations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            note: notation.note,
            utilisateur_nom: notation.utilisateur_nom.trim()
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage('Notation enregistrée avec succès!');
        setNotation({ note: 0, utilisateur_nom: '' });
        setHoveredStar(0);
        
        // Recharger les notations pour ce livre
        await fetchNotations(selectedLivre.id);
        
        // Recharger tous les livres pour mettre à jour les moyennes
        await fetchLivres();
        
        // Mettre à jour le livre sélectionné avec les nouvelles données
        const updatedLivre = livres.find(l => l.id === selectedLivre.id);
        if (updatedLivre) {
          setSelectedLivre(updatedLivre);
        }
      } else {
        setMessage(data.message || 'Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setMessage('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, interactive = false) => {
    const stars = [];
    const numericRating = ensureNumber(rating);
    
    for (let i = 1; i <= 5; i++) {
      const filled = interactive 
        ? (hoveredStar >= i || (hoveredStar === 0 && notation.note >= i))
        : numericRating >= i;

      stars.push(
        <span
          key={i}
          className={`text-2xl transition-all duration-200 select-none ${
            filled ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400 hover:scale-110' : ''}`}
          onClick={interactive ? () => handleStarClick(i) : undefined}
          onMouseEnter={interactive ? () => handleStarHover(i) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(0) : undefined}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  if (loadingLivres) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Chargement des livres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            📚 Notation des Livres
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Découvrez, notez et partagez vos impressions sur vos livres préférés
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Section sélection des livres */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">📖</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Choisir un livre
              </h2>
            </div>
            
            {livres.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <p className="text-gray-500 text-lg">Aucun livre disponible</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {livres.map((livre) => (
                  <div
                    key={livre.id}
                    className={`group p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
                      selectedLivre?.id === livre.id
                        ? 'border-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleLivreSelect(livre)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                          {livre.titre}
                        </h3>
                        <p className="text-gray-600 mt-1">par {livre.auteur}</p>
                        <div className="inline-flex items-center mt-2 px-3 py-1 bg-gray-100 rounded-full">
                          <span className="text-xs font-medium text-gray-600">{livre.genre}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="flex items-center justify-end mb-1">
                          {renderStars(livre.note_moyenne)}
                        </div>
                        <div className="bg-yellow-100 px-2 py-1 rounded-lg">
                          <p className="text-sm font-semibold text-yellow-800">
                            {livre.nombre_notes > 0 ? formatNoteMoyenne(livre.note_moyenne) : 'Non noté'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {livre.nombre_notes} note{livre.nombre_notes > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section notation */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                <span className="text-white text-xl">⭐</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                Noter le livre
              </h2>
            </div>

            {selectedLivre ? (
              <div>
                {/* Livre sélectionné */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-xl text-gray-800 mb-2">
                    {selectedLivre.titre}
                  </h3>
                  <p className="text-gray-600 mb-3">par {selectedLivre.auteur}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {renderStars(selectedLivre.note_moyenne)}
                      <span className="ml-3 text-sm font-medium text-gray-600">
                        {selectedLivre.nombre_notes > 0 
                          ? `${formatNoteMoyenne(selectedLivre.note_moyenne)} / 5`
                          : 'Pas encore noté'
                        }
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedLivre.nombre_notes} évaluation{selectedLivre.nombre_notes > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                {/* Formulaire de notation */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Votre nom
                    </label>
                    <input
                      type="text"
                      value={notation.utilisateur_nom}
                      onChange={(e) => setNotation({ ...notation, utilisateur_nom: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all duration-200 bg-white text-gray-900 placeholder-gray-400"
                      placeholder="Entrez votre nom complet"
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Votre évaluation
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      {renderStars(notation.note, !loading)}
                    </div>
                    {notation.note > 0 && (
                      <p className="text-sm text-blue-600 font-medium">
                        Excellent choix ! Note: {notation.note}/5 étoiles
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || notation.note === 0 || !notation.utilisateur_nom.trim()}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 shadow-lg disabled:transform-none"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Enregistrement en cours...
                      </span>
                    ) : (
                      '✨ Enregistrer ma notation'
                    )}
                  </button>
                </div>

                {/* Message de retour */}
                {message && (
                  <div className={`mt-6 p-4 rounded-xl border-2 transition-all duration-300 ${
                    message.includes('succès') 
                      ? 'bg-green-50 text-green-800 border-green-200' 
                      : 'bg-red-50 text-red-800 border-red-200'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-lg mr-2">
                        {message.includes('succès') ? '✅' : '❌'}
                      </span>
                      {message}
                    </div>
                  </div>
                )}

                {/* Notations récentes */}
                {notations.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">💬</span>
                      Avis récents ({notations.length})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                      {notations.map((notation) => (
                        <div key={notation.id} className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{notation.utilisateur_nom}</p>
                              <div className="flex items-center mt-2">
                                {renderStars(notation.note)}
                                <span className="ml-2 text-sm font-medium text-blue-600">
                                  {notation.note}/5
                                </span>
                              </div>
                            </div>
                            <div className="bg-white px-3 py-1 rounded-lg border">
                              <p className="text-xs text-gray-500 font-medium">
                                {new Date(notation.date_notation).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">📚</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  Aucun livre sélectionné
                </h3>
                <p className="text-gray-500">
                  Choisissez un livre dans la liste pour commencer votre évaluation
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistiques générales */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
            📊 Statistiques de la bibliothèque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {livres.length}
              </div>
              <p className="text-blue-700 font-medium">📖 Livres disponibles</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {livres.reduce((acc, livre) => acc + livre.nombre_notes, 0)}
              </div>
              <p className="text-yellow-700 font-medium">⭐ Notes données</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <div className="text-4xl font-bold text-green-600 mb-2">
                {livres.length > 0 && livres.some(livre => livre.nombre_notes > 0)
                  ? formatNoteMoyenne(
                      livres.filter(livre => livre.nombre_notes > 0)
                           .reduce((acc, livre) => acc + livre.note_moyenne, 0) / 
                      livres.filter(livre => livre.nombre_notes > 0).length
                    )
                  : '0.0'
                }
              </div>
              <p className="text-green-700 font-medium">🏆 Note moyenne générale</p>
            </div>
          </div>
        </div>

        {/* Top des livres */}
        {livres.some(livre => livre.nombre_notes > 0) && (
          <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-8 text-center">
              🏆 Top des livres les mieux notés
            </h2>
            <div className="space-y-4">
              {livres
                .filter(livre => livre.nombre_notes > 0)
                .sort((a, b) => b.note_moyenne - a.note_moyenne)
                .slice(0, 5)
                .map((livre, index) => (
                  <div key={livre.id} className="flex items-center p-5 bg-gradient-to-r from-gray-50 to-yellow-50 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-6 ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                      index === 2 ? 'bg-gradient-to-r from-yellow-600 to-yellow-800' :
                      'bg-gradient-to-r from-blue-400 to-blue-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-lg text-gray-800">{livre.titre}</h3>
                      <p className="text-gray-600">par {livre.auteur}</p>
                      <span className="inline-block mt-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-gray-600 border">
                        {livre.genre}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-2">
                        {renderStars(livre.note_moyenne)}
                      </div>
                      <div className="bg-yellow-100 px-3 py-1 rounded-lg">
                        <p className="text-sm font-bold text-yellow-800">
                          {formatNoteMoyenne(livre.note_moyenne)}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {livre.nombre_notes} avis
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotationPage;