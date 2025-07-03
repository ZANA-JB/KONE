'use client';
import React, { useState, useEffect } from 'react';
// Note: axios would be imported in a real environment
// import axios from 'axios';
import { CheckCircle, User, Mail, Lock, UserPlus } from 'lucide-react';

const AjoutEtudiantPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [token, setToken] = useState('');
  const [lastAddedStudent, setLastAddedStudent] = useState({ nom: '', prenom: '', email: '' });

  useEffect(() => {
    // Récupérer le token depuis le localStorage
    const storedToken = localStorage.getItem('userToken') || localStorage.getItem('token') || '';
    setToken(storedToken);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', password: '' });
    setMessage({ type: '', text: '' });
  };

  const validateForm = () => {
    if (!formData.nom.trim() || !formData.prenom.trim() || !formData.email.trim() || !formData.password.trim()) {
      setMessage({ type: 'error', text: 'Tous les champs sont obligatoires.' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setMessage({ type: 'error', text: 'Email invalide.' });
      return false;
    }
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 6 caractères.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      // Simulation d'un appel API - remplacer par axios dans l'environnement réel
      const response = await fetch('http://localhost:4100/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          password: formData.password,
          is_admin: 0
        })
      });
      const responseData = await response.json();
      if (responseData.Error === false || responseData.success) {
        // Sauvegarder les infos de l'étudiant ajouté
        setLastAddedStudent({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email
        });
        setMessage({ type: 'success', text: 'Étudiant ajouté avec succès !' });
        
        // Message de confirmation toast (code dupliqué supprimé)
        const confirmationToast = document.createElement('div');
        confirmationToast.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center gap-3 max-w-md';
        confirmationToast.innerHTML = `
          <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div>
            <div class="font-semibold">✅ Étudiant ajouté avec succès !</div>
            <div class="text-sm opacity-90">${formData.prenom} ${formData.nom} a été enregistré</div>
          </div>
        `;
        document.body.appendChild(confirmationToast);
        setTimeout(() => confirmationToast.remove(), 5000);
        
        resetForm();
        setTimeout(() => setMessage({ type: '', text: '' }), 8000);
      } else {
        setMessage({ type: 'error', text: responseData.Message || responseData.message || 'Erreur lors de l\'ajout.' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Erreur réseau ou serveur.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-8 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-white" />
              <h1 className="text-2xl font-bold text-white">Ajouter un Étudiant</h1>
            </div>
            <p className="text-indigo-100 mt-2">Créer un nouveau compte étudiant</p>
          </div>

          {/* Messages */}
          <div className="px-8 pt-6">
            {message.type === 'success' && (
              <div className="mb-6 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="bg-emerald-500 rounded-full p-2 flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-emerald-800 mb-2">
                      🎉 Étudiant ajouté avec succès !
                    </h3>
                    <p className="text-emerald-700 text-sm leading-relaxed">
                      Le compte étudiant <strong>{lastAddedStudent.nom} {lastAddedStudent.prenom}</strong> a été créé avec succès dans le système.
                      <br />
                      📧 Un email de confirmation sera envoyé à <strong>{lastAddedStudent.email}</strong>
                    </p>
                    <div className="mt-3 p-3 bg-emerald-100 rounded-lg border border-emerald-200">
                      <p className="text-xs text-emerald-600 font-medium">
                        ✅ Compte étudiant actif • 🔐 Mot de passe configuré • 📚 Prêt pour les cours
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {message.type === 'error' && message.text && (
              <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-red-50 text-red-800 border-l-4 border-red-400">
                <span className="font-semibold">Erreur:</span> {message.text}
              </div>
            )}
          </div>

          {/* Form */}
          <div className="px-8 pb-8 space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Nom de famille *
              </label>
              <input 
                type="text" 
                name="nom" 
                value={formData.nom} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200 placeholder-gray-500" 
                placeholder="Entrez le nom de famille" 
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Prénom *
              </label>
              <input 
                type="text" 
                name="prenom" 
                value={formData.prenom} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200 placeholder-gray-500" 
                placeholder="Entrez le prénom" 
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                Adresse email *
              </label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200 placeholder-gray-500" 
                placeholder="exemple@email.com" 
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Mot de passe *
              </label>
              <input 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200 placeholder-gray-500" 
                placeholder="Minimum 6 caractères" 
              />
              <p className="text-xs text-gray-500 mt-1">Le mot de passe doit contenir au moins 6 caractères</p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <button 
                type="button" 
                onClick={handleSubmit}
                disabled={loading} 
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Ajouter l'étudiant
                  </>
                )}
              </button>
              <button 
                type="button" 
                onClick={resetForm} 
                disabled={loading} 
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Note informative */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Les champs marqués d'un * sont obligatoires
          </p>
        </div>
      </div>
    </div>
  );
};

export default AjoutEtudiantPage;