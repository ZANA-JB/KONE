"use client";

import React, { useEffect, useState } from "react";
import { Book, Calendar, User, BookOpen, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface Livre {
  id: number;
  titre: string;
  auteur: string;
  genre: string;
  disponible: boolean;
}

const EmpruntPage = () => {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [selectedLivreId, setSelectedLivreId] = useState("");
  const [dureeJours, setDureeJours] = useState<number>(7);
  const [userId, setUserId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérification session utilisateur
    const userStr = localStorage.getItem("user");
    let storedUser = null;
    try {
      storedUser = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      localStorage.removeItem("user");
      localStorage.removeItem("userToken");
      setMessage("Veuillez vous reconnecter.");
      return;
    }
    if (storedUser && storedUser.id_users) {
      setUserId(storedUser.id_users);
    } else {
      setUserId(null);
    }

    // Charger les livres disponibles
    setLoading(true);
    fetch("http://localhost:4100/api/livres")
      .then(res => res.json())
      .then((data) => {
        const livresDispos = (data.data || []).filter((l: Livre) => l.disponible);
        setLivres(livresDispos);
      })
      .catch(() => {
        setMessage("Erreur lors du chargement des livres");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEmprunt = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (!userId) {
      setMessage("Utilisateur non connecté");
      return;
    }
    if (!selectedLivreId) {
      setMessage("Veuillez sélectionner un livre.");
      return;
    }
    if (!dureeJours || dureeJours < 1) {
      setMessage("Veuillez entrer une durée valide.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("http://localhost:4100/api/emprunts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("userToken")}`,
        },
        body: JSON.stringify({
          id_users: userId,
          id_livre: Number(selectedLivreId),
          duree_jours: Number(dureeJours),
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage(`✅ Emprunt réussi : ${data.message}`);
        setLivres((prev) => prev.filter((l) => l.id !== Number(selectedLivreId)));
        setSelectedLivreId("");
        setDureeJours(7);
      } else {
        setMessage(data.message || "❌ Échec de l'emprunt.");
      }
    } catch (err: any) {
      setMessage("❌ Échec de l'emprunt.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("userToken");
    setUserId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 p-6">
      <div className="max-w-lg mx-auto">
        {/* Header avec titre */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Emprunter un Livre</h2>
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
        </div>

        {/* Message d'état */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border backdrop-blur-lg ${
            message.startsWith("✅") 
              ? "bg-green-500/20 border-green-300/30 text-green-200" 
              : "bg-red-500/20 border-red-300/30 text-red-200"
          }`}>
            <div className="flex items-center space-x-2">
              {message.startsWith("✅") ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Contenu principal */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl border border-white/20">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center space-x-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-300"></div>
                <span className="text-teal-200 text-lg font-medium">Chargement...</span>
              </div>
            </div>
          ) : livres.length === 0 ? (
            <div className="text-center py-12">
              <Book className="h-16 w-16 text-teal-300/50 mx-auto mb-4" />
              <p className="text-teal-200 text-lg font-medium">Aucun livre disponible</p>
              <p className="text-teal-300/70 mt-2">Tous les livres sont actuellement empruntés</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Sélection du livre */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Book className="h-5 w-5 text-emerald-300" />
                  <span>Livre à emprunter :</span>
                </label>
                <div className="relative">
                  <select 
                    value={selectedLivreId} 
                    onChange={e => setSelectedLivreId(e.target.value)}
                    className="w-full p-4 rounded-xl text-white backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                    style={{
                      background: "rgba(15, 23, 42, 0.8)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      color: "white"
                    }}
                  >
                    <option value="" style={{ background: "#0f172a", color: "white" }}>
                      -- Choisir un livre --
                    </option>
                    {livres.map(l => (
                      <option 
                        key={l.id} 
                        value={l.id} 
                        style={{ 
                          background: "#0f172a", 
                          color: "white",
                          padding: "8px"
                        }}
                      >
                        {l.titre} — {l.auteur} ({l.genre})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-r-2 border-b-2 border-white transform rotate-45"></div>
                  </div>
                </div>
              </div>

              {/* Durée d'emprunt */}
              <div>
                <label className="flex items-center space-x-2 text-white font-medium mb-3">
                  <Calendar className="h-5 w-5 text-teal-300" />
                  <span>Durée d'emprunt :</span>
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="14"
                      value={dureeJours}
                      onChange={e => setDureeJours(Number(e.target.value))}
                      className="w-20 p-3 bg-slate-800/80 border border-white/20 rounded-xl text-white text-center backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-300"
                    />
                    <Clock className="absolute -right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-teal-300" />
                  </div>
                  <span className="text-teal-200">jour{dureeJours > 1 ? 's' : ''} d'emprunt</span>
                  <div className="flex-1">
                    <div className="text-xs text-teal-300/70 bg-teal-500/10 px-3 py-1 rounded-lg border border-teal-300/20">
                      Maximum : 14 jours
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton d'emprunt */}
              <button 
                onClick={handleEmprunt} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Emprunt en cours...</span>
                    </>
                  ) : (
                    <>
                      <BookOpen className="h-5 w-5" />
                      <span>Emprunter ce livre</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Info utilisateur */}
        {userId && (
          <div className="mt-6 bg-white/5 backdrop-blur-lg rounded-xl p-4 border border-white/10">
            <div className="flex items-center space-x-2 text-emerald-200">
              <User className="h-4 w-4" />
              <span className="text-sm">Connecté en tant qu'utilisateur ID: {userId}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmpruntPage;