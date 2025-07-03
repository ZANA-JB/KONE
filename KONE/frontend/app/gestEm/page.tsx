'use client';
import React, { useEffect, useState } from 'react';
import { Search, BookOpen, Clock, AlertTriangle, CheckCircle, User, Mail, Calendar } from 'lucide-react';

const ListeEmprunts = () => {
  const [emprunts, setEmprunts] = useState([]);
  const [filtreTitre, setFiltreTitre] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchEmprunts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:4100/api/emprunts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setEmprunts(data.data);
      } else {
        alert('Erreur lors de la récupération des emprunts');
      }
    } catch (err) {
      alert('Erreur réseau : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmprunts();
  }, []);

  const isEnRetard = (emprunt) => {
    if (emprunt.date_retour_effective) {
      const retour = new Date(emprunt.date_retour_effective);
      const empruntDate = new Date(emprunt.date_emprunt);
      const diff = (retour - empruntDate) / (1000 * 60 * 60 * 24);
      return diff > 14;
    } else {
      const today = new Date();
      const empruntDate = new Date(emprunt.date_emprunt);
      const diff = (today - empruntDate) / (1000 * 60 * 60 * 24);
      return diff > 14;
    }
  };

  const getStatutColor = (emprunt) => {
    if (emprunt.statut === "Retourné") return "text-green-600 bg-green-50";
    if (isEnRetard(emprunt) || emprunt.statut === "En retard") return "text-red-600 bg-red-50";
    return "text-blue-600 bg-blue-50";
  };

  const getStatutIcon = (emprunt) => {
    if (emprunt.statut === "Retourné") return <CheckCircle size={16} />;
    if (isEnRetard(emprunt) || emprunt.statut === "En retard") return <AlertTriangle size={16} />;
    return <Clock size={16} />;
  };

  const empruntsFiltres = emprunts.filter((emprunt) =>
    emprunt.livre.titre.toLowerCase().includes(filtreTitre.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-blue-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-800">Liste des Emprunts</h1>
          </div>
          
          {/* Barre de recherche */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher par titre du livre..."
              value={filtreTitre}
              onChange={(e) => setFiltreTitre(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-slate-900 placeholder-slate-500"
            />
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Chargement des emprunts...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} />
                        Livre
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Auteur</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        Utilisateur
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Mail size={16} />
                        Email
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} />
                        Date emprunt
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Retour prévu</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Retour effectif</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Statut</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Retard</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">Jours restants</th>
                  </tr>
                </thead>
                <tbody>
                  {empruntsFiltres.map((emprunt) => {
                    const enRetard = isEnRetard(emprunt);
                    return (
                      <tr
                        key={emprunt.id_emprunt}
                        className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                          enRetard ? 'bg-red-50' : ''
                        }`}
                      >
                        <td className="py-4 px-4">
                          <div className="font-medium text-slate-900">{emprunt.livre.titre}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{emprunt.livre.auteur}</td>
                        <td className="py-4 px-4">
                          <div className="text-slate-900">{emprunt.utilisateur.nom} {emprunt.utilisateur.prenom}</div>
                        </td>
                        <td className="py-4 px-4 text-slate-600">{emprunt.utilisateur.email}</td>
                        <td className="py-4 px-4 text-slate-600">
                          {new Date(emprunt.date_emprunt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {new Date(emprunt.date_retour_prevue).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-4 px-4 text-slate-600">
                          {emprunt.date_retour_effective
                            ? new Date(emprunt.date_retour_effective).toLocaleDateString('fr-FR')
                            : <span className="text-orange-600 font-medium">Pas encore</span>
                          }
                        </td>
                        <td className="py-4 px-4">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(emprunt)}`}>
                            {getStatutIcon(emprunt)}
                            {emprunt.statut}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-medium ${enRetard ? 'text-red-600' : 'text-green-600'}`}>
                            {enRetard ? '⚠️ Oui' : 'Non'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {emprunt.jours_restants !== null ? (
                            <span className={`font-medium ${
                              emprunt.jours_restants < 0 ? 'text-red-600' : 
                              emprunt.jours_restants <= 3 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {`${emprunt.jours_restants} jours`}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {empruntsFiltres.length === 0 && !loading && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600">Aucun emprunt trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeEmprunts;