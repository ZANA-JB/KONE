'use client';
import React, { useEffect, useState } from 'react';
// Note: axios doit être installé dans votre projet
import axios from 'axios';
import { BookOpen, User, Calendar, CheckCircle, Clock, RotateCcw } from 'lucide-react';

function RetourLi() {
  const [emprunts, setEmprunts] = useState([]);
  const [retourDates, setRetourDates] = useState({});

  useEffect(() => {
    // Simulation de données pour la démonstration (remplacez par votre appel axios)
    const mockData = {
      data: {
        data: [
          {
            id_emprunt: 1,
            livre: { titre: "Le Petit Prince" },
            utilisateur: { nom: "Dupont", prenom: "Jean" },
            date_emprunt: "2025-06-15",
            date_retour_prevue: "2025-06-29",
            date_retour_effective: null,
            statut: "en_cours"
          },
          {
            id_emprunt: 2,
            livre: { titre: "1984" },
            utilisateur: { nom: "Martin", prenom: "Marie" },
            date_emprunt: "2025-06-01",
            date_retour_prevue: "2025-06-15",
            date_retour_effective: "2025-06-20",
            statut: "retourne"
          }
        ]
      }
    };
    
    setEmprunts(mockData.data.data);
    const initialDates = {};
    mockData.data.data.forEach(emp => {
      if (emp.statut === 'en_cours') {
        initialDates[emp.id_emprunt] = new Date().toISOString().slice(0, 10);
      }
    });
    setRetourDates(initialDates);
    
    // Utilisez ceci dans votre projet:
    
    axios.get('http://localhost:4100/api/emprunts')
      .then(res => {
        setEmprunts(res.data.data);
        const initialDates = {};
        res.data.data.forEach(emp => {
          if (emp.statut === 'en_cours') {
            initialDates[emp.id_emprunt] = new Date().toISOString().slice(0, 10);
          }
        });
        setRetourDates(initialDates);
      })
      .catch(err => console.error(err));
    
  }, []);

  function handleDateChange(id_emprunt, date) {
    setRetourDates(prev => ({ ...prev, [id_emprunt]: date }));
  }

  function validerRetour(id_emprunt) {
    const date_retour_effective = retourDates[id_emprunt] || new Date().toISOString().slice(0, 10);

    // Simulation pour la démonstration
    setEmprunts(emprunts =>
      emprunts.map(emp =>
        emp.id_emprunt === id_emprunt
          ? { ...emp, statut: 'retourne', date_retour_effective }
          : emp
      )
    );
    
    // Utilisez ceci dans votre projet:
    
    axios.put(`http://localhost:4100/api/emprunts/${id_emprunt}/retour`, { date_retour_effective })
      .then(res => {
        setEmprunts(emprunts =>
          emprunts.map(emp =>
            emp.id_emprunt === id_emprunt
              ? { ...emp, statut: 'retourne', date_retour_effective }
              : emp
          )
        );
      })
      .catch(err => alert("Erreur lors du retour : " + (err.response?.data?.message || err.message)));
    
  }

  const getStatutColor = (statut) => {
    if (statut === 'retourne') return 'text-green-600 bg-green-50';
    if (statut === 'en_cours') return 'text-blue-600 bg-blue-50';
    return 'text-orange-600 bg-orange-50';
  };

  const getStatutIcon = (statut) => {
    if (statut === 'retourne') return <CheckCircle size={16} />;
    if (statut === 'en_cours') return <Clock size={16} />;
    return <RotateCcw size={16} />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3">
            <RotateCcw className="text-green-600" size={32} />
            <h1 className="text-3xl font-bold text-slate-800">Gestion des Retours</h1>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
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
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      Utilisateur
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} />
                      Date d'emprunt
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Date de retour prévue</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Date de retour effective</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Statut</th>
                  <th className="text-left py-4 px-4 font-semibold text-slate-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {emprunts.map(emp => (
                  <tr key={emp.id_emprunt} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">{emp.livre?.titre || '-'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-900">{emp.utilisateur?.nom || '-'} {emp.utilisateur?.prenom || ''}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{emp.date_emprunt?.slice(0, 10) || '-'}</td>
                    <td className="py-4 px-4 text-slate-600">{emp.date_retour_prevue?.slice(0, 10) || '-'}</td>
                    <td className="py-4 px-4">
                      {emp.statut === 'en_cours' ? (
                        <input
                          type="date"
                          value={retourDates[emp.id_emprunt] || ''}
                          onChange={e => handleDateChange(emp.id_emprunt, e.target.value)}
                          className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-slate-900"
                        />
                      ) : (
                        <span className="text-slate-600">{emp.date_retour_effective?.slice(0, 10) || '-'}</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatutColor(emp.statut)}`}>
                        {getStatutIcon(emp.statut)}
                        {emp.statut}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {emp.statut === 'en_cours' && (
                        <button 
                          onClick={() => validerRetour(emp.id_emprunt)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors font-medium"
                        >
                          <CheckCircle size={16} />
                          Valider retour
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {emprunts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600">Aucun emprunt à gérer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RetourLi;