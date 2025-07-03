'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, BookOpen, CheckCircle, AlertCircle, Loader2, Home } from 'lucide-react';

// Interface pour les types d'erreurs
interface FormErrors {
  email?: string;
  password?: string;
}

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Validation des champs
  const validateForm = () => {
    const newErrors: FormErrors = {};
    
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer les erreurs lors de la saisie
    if (errors[name as keyof FormErrors]) {
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
      // Requête Axios pour vérifier les informations de connexion
      const response = await axios.post('http://localhost:4100/userlogin', {
        email: formData.email,
        password: formData.password
      });
      
      console.log("Utilisateur connecté :", response.data.user);

      // Vérification de la réponse
      if (response.data.success) {
        // DEBUG : log avant stockage
        console.log('Stockage dans localStorage :', response.data.token, response.data);
        localStorage.setItem('userToken', response.data.token);
        // Stocker l'utilisateur avec la bonne clé id_users pour compatibilité
        localStorage.setItem('user', JSON.stringify({
          id_users: response.data.id_users, // Correction : stocke bien id_users
          email: response.data.email,
          nom: response.data.nom,
          prenom: response.data.prenom,
          role: response.data.role // Correction : stocke le rôle (0 ou 1)
        }));
        setIsAuthenticated(true);
        setMessage({
          type: 'success',
          text: `Connexion réussie ! Bienvenue ${response.data.nom}`
        });
        // Redirection automatique vers /accueil, le dashboard affiché dépendra du rôle
        router.push('/accueil');
      } else {
        setMessage({
          type: 'error',
          text: response.data.message + ' Email ou mot de passe incorrect'
        });
      }
      
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error instanceof Error) {
        if (error.message.includes('Network Error')) {
          setMessage({
            type: 'error',
            text: 'Impossible de se connecter au serveur. Vérifiez que le serveur fonctionne sur le port 4100.'
          });
        } else {
          setMessage({
            type: 'error',
            text: 'Erreur de connexion. Veuillez réessayer plus tard.'
          });
        }
      } else if (axios.isAxiosError(error) && error.response) {
        // Le serveur a répondu avec un code d'erreur
        setMessage({
          type: 'error',
          text: error.response.data.message || 'Erreur de connexion'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur de connexion. Veuillez réessayer plus tard.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rediriger vers l'accueil
  const handleGoToHome = () => {
    router.push('/accueil');
  };

  // Fonction pour rediriger vers l'inscription
  const handleRegisterRedirect = () => {
    router.push('/inscription');
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
          <h1 className="text-3xl font-bold text-white mb-2">Connexion BiblioSmart</h1>
          <p className="text-purple-200">Connectez-vous à votre compte bibliothèque</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
          {!isAuthenticated ? (
            <div className="space-y-6">
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

              {/* Bouton de connexion */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>

              {/* Lien d'inscription */}
              <div className="mt-6 text-center">
                <p className="text-purple-200">
                  Pas encore de compte ?{' '}
                  <button 
                    onClick={handleRegisterRedirect}
                    className="font-medium text-blue-300 hover:text-blue-200 underline transition-colors cursor-pointer"
                  >
                    S'inscrire
                  </button>
                </p>
              </div>

              {/* Note pour les tests */}
              <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400 rounded-xl">
                <p className="text-blue-300 text-sm">
                  <strong>Test :</strong> admin@gmail.com / admin123
                </p>
              </div>
            </div>
          ) : (
            /* Interface après connexion réussie */
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Connexion réussie !</h2>
                <p className="text-purple-200">Vous êtes maintenant connecté à BiblioSmart</p>
              </div>

              {message.text && (
                <div className="p-4 rounded-xl border bg-green-500/20 border-green-400 text-green-300">
                  <p>{message.text}</p>
                </div>
              )}

              {/* Bouton vers l'accueil */}
              <button
                onClick={handleGoToHome}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Aller à l'accueil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;