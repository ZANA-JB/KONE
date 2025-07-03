'use client'
import React, { useState } from 'react';
import axios from 'axios'; // Import ajouté
import { useRouter } from 'next/navigation'; // Import ajouté pour Next.js
import { User, Mail, Lock, Eye, EyeOff, BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const Page = () => {
  const router = useRouter(); // Hook pour la navigation
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  // Validation des champs
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }
    
    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }
    
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements dans les inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les erreurs lors de la saisie
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Soumission du formulaire avec Axios
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      console.log('Données envoyées :', formData);
      
      const response = await axios.post('http://localhost:4100/signup', {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000 // Timeout de 10 secondes
      });
      
      console.log('Réponse du serveur :', response.data);
      
      if (response.data.Error === false) {
        setMessage({
          type: 'success',
          text: 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        });
        
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          email: '',
          password: ''
        });
        
        // Redirection après 2 secondes
        setTimeout(() => {
          router.push('/connexion');
        }, 2000);
      } else {
        setMessage({
          type: 'error',
          text: response.data.Message || 'Erreur lors de l\'inscription'
        });
      }
      
    } catch (error) {
      console.error('Erreur complète :', error);
      
      let errorMessage = 'Erreur lors de l\'inscription. Veuillez réessayer.';
      
      if (error.response) {
        // Erreur de réponse du serveur
        console.error('Erreur de réponse :', error.response.data);
        errorMessage = error.response.data.Message || `Erreur ${error.response.status}`;
      } else if (error.request) {
        // Pas de réponse du serveur
        console.error('Pas de réponse du serveur :', error.request);
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
      } else {
        // Erreur dans la configuration de la requête
        console.error('Erreur de configuration :', error.message);
        errorMessage = 'Erreur de configuration de la requête.';
      }
      
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour gérer la redirection vers la page de connexion
  const handleLoginRedirect = () => {
    router.push('/connexion');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
      {/* Effets d'arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Conteneur principal */}
      <div className="relative z-10 w-full max-w-md">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-xl">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Rejoignez BiblioSmart</h1>
          <p className="text-purple-200">Créez votre compte pour accéder à votre bibliothèque</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-white font-medium mb-2">
                Nom *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    errors.nom ? 'border-red-400' : 'border-white/20'
                  } rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300`}
                  placeholder="Votre nom"
                />
              </div>
              {errors.nom && (
                <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nom}
                </p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-white font-medium mb-2">
                Prénom *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    errors.prenom ? 'border-red-400' : 'border-white/20'
                  } rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300`}
                  placeholder="Votre prénom"
                />
              </div>
              {errors.prenom && (
                <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.prenom}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-white font-medium mb-2">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                    errors.email ? 'border-red-400' : 'border-white/20'
                  } rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300`}
                  placeholder="email@gmail.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-white font-medium mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                    errors.password ? 'border-red-400' : 'border-white/20'
                  } rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300`}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Messages de retour */}
            {message.text && (
              <div className={`p-4 rounded-xl border ${
                message.type === 'success' 
                  ? 'bg-green-500/20 border-green-400 text-green-300' 
                  : 'bg-red-500/20 border-red-400 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <AlertCircle className="w-5 h-5" />
                  )}
                  <p>{message.text}</p>
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Inscription en cours...</span>
                </div>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </div>

          {/* Lien de connexion */}
          <div className="mt-6 text-center">
            <p className="text-purple-200">
              Déjà un compte ?{' '}
              <button 
                onClick={handleLoginRedirect}
                className="font-medium text-blue-300 hover:text-blue-200 underline transition-colors cursor-pointer"
              >
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;