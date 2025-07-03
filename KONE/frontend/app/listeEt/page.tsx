'use client';
import React, { useEffect, useState } from 'react';
import { Users, Mail, User, AlertCircle, Loader2 } from 'lucide-react';

const page = () => {
  const [etudiants, setEtudiants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Récupérer la liste des étudiants
  const fetchEtudiants = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:4100/api/utilisateurs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setEtudiants(data.data);
      } else {
        setError('Erreur lors de la récupération des étudiants');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEtudiants();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-300" />
            <p className="text-white text-lg font-medium">Chargement des étudiants...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-red-300/30">
          <div className="flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-red-300" />
            <p className="text-white text-lg font-medium">Erreur : {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header avec animation */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Liste des Étudiants
              </h1>
            </div>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {etudiants.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20 text-center">
              <Users className="h-16 w-16 text-blue-300 mx-auto mb-4 opacity-50" />
              <p className="text-white text-xl font-medium">Aucun étudiant trouvé.</p>
              <p className="text-blue-200 mt-2">La liste des étudiants est vide pour le moment.</p>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* En-tête du tableau */}
              <div className="bg-gradient-to-r from-blue-600/50 to-purple-600/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {etudiants.length} étudiant{etudiants.length > 1 ? 's' : ''} trouvé{etudiants.length > 1 ? 's' : ''}
                  </h2>
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Tableau responsive */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/10">
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-blue-300" />
                          <span className="text-blue-200 font-medium">Nom</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-purple-300" />
                          <span className="text-purple-200 font-medium">Prénom</span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-green-300" />
                          <span className="text-green-200 font-medium">Email</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {etudiants.map((etudiant, index) => (
                      <tr 
                        key={etudiant.id_users}
                        className="border-b border-white/5 hover:bg-white/5 transition-all duration-300 group"
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {etudiant.nom?.charAt(0)?.toUpperCase() || 'N'}
                              </span>
                            </div>
                            <span className="text-white font-medium group-hover:text-blue-300 transition-colors">
                              {etudiant.nom}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-purple-200 font-medium group-hover:text-purple-300 transition-colors">
                            {etudiant.prenom}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-green-200 group-hover:text-green-300 transition-colors">
                              {etudiant.email}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer du tableau */}
              <div className="bg-white/5 px-6 py-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-200">
                    Données mises à jour automatiquement
                  </p>
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default page;