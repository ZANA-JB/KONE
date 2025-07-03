'use client'
import React from 'react';
import { ArrowRight, BookOpen, Search, Calendar, Download, Bookmark, Zap, Shield, Heart } from 'lucide-react';

const MiniAccueil = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Particules flottantes animées */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute top-40 right-16 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute bottom-32 left-20 w-3 h-3 bg-emerald-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 right-32 w-2 h-2 bg-pink-400 rounded-full animate-ping"></div>
        <div className="absolute top-1/3 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
      </div>

      {/* Motifs de constellation */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="constellation" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.5" fill="currentColor" opacity="0.3"/>
              <circle cx="18" cy="8" r="0.3" fill="currentColor" opacity="0.5"/>
              <circle cx="10" cy="15" r="0.4" fill="currentColor" opacity="0.4"/>
              <line x1="2" y1="2" x2="10" y2="15" stroke="currentColor" strokeWidth="0.1" opacity="0.2"/>
              <line x1="10" y1="15" x2="18" y2="8" stroke="currentColor" strokeWidth="0.1" opacity="0.2"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#constellation)" className="text-white" />
        </svg>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <div className="text-center max-w-6xl mx-auto">
          {/* Logo/Icône animée premium */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                <BookOpen className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-spin flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-3 -left-3 w-8 h-8 bg-gradient-to-r from-pink-400 to-red-500 rounded-full animate-bounce flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* Titre principal avec effet holographique */}
          <h1 className="text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            BiblioSmart
          </h1>

          {/* Slogan accrocheur */}
          <div className="mb-8">
            <p className="text-2xl md:text-3xl text-white/90 font-light mb-2">
              Votre bibliothèque réinventée
            </p>
            <p className="text-lg text-purple-200 max-w-3xl mx-auto leading-relaxed">
              Une expérience digitale révolutionnaire pour les étudiants modernes
            </p>
          </div>

          {/* Badges de valeur */}
          <div className="flex justify-center gap-6 mb-12 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold">Accès Instantané</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span className="font-semibold">100% Sécurisé</span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-5 h-5 text-pink-400" />
                <span className="font-semibold">Interface Intuitive</span>
              </div>
            </div>
          </div>

          {/* Fonctionnalités principales avec design premium */}
          <div className="grid md:grid-cols-4 gap-6 mb-12 max-w-5xl mx-auto">
            {/* Recherche */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Recherche Intelligente</h3>
              <p className="text-purple-200 text-sm leading-relaxed">Trouvez instantanément ce que vous cherchez avec notre IA avancée</p>
            </div>

            {/* Réservation */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Réservation Express</h3>
              <p className="text-purple-200 text-sm leading-relaxed">Réservez en un clic et recevez des notifications personnalisées</p>
            </div>

            {/* Emprunt */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Emprunt Numérique</h3>
              <p className="text-purple-200 text-sm leading-relaxed">Empruntez  directement depuis votre appareil préféré</p>
            </div>

            {/* Suivi */}
            <div className="group bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl hover:bg-white/10 transform hover:scale-105 hover:-translate-y-2 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:rotate-12 transition-transform duration-300">
                <Bookmark className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-bold text-white text-xl mb-3">Tableau de Bord</h3>
              <p className="text-purple-200 text-sm leading-relaxed">Recherchez , réservez et empruntez un livre à travers votre tableau de bord intuitif et sécurisé</p>
            </div>
          </div>

          {/* Bouton d'accès principal redesigné */}
          <div className="mb-12">
            <button 
              onClick={() => window.location.href = '/inscription'}
              className="group relative inline-flex items-center gap-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-12 py-6 rounded-full text-xl font-bold shadow-2xl hover:shadow-purple-500/25 transform hover:scale-110 transition-all duration-500 animate-pulse"
            >
              <BookOpen className="w-7 h-7 group-hover:rotate-12 transition-transform duration-300" />
              <span className="relative z-10">Accéder à mon compte</span>
              <ArrowRight className="w-7 h-7 group-hover:translate-x-2 transition-transform duration-300" />
              
              {/* Effet de brillance amélioré */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000"></div>
              
              {/* Bordure animée */}
              <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-spin"></div>
            </button>
          </div>

          {/* Message inspirant */}
          <div className="text-center">
            <p className="text-lg text-purple-300/80 font-light italic">
              "Transformez votre façon d'étudier avec la technologie de demain"
            </p>
          </div>
        </div>
      </div>

      {/* Effets lumineux flottants */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
    </div>
  );
};

export default MiniAccueil;