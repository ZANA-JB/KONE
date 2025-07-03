'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';

interface Etudiant {
  id_users: number;
  nom: string;
  prenom: string;
  email: string;
}

const ModifEtPage = () => {
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', email: '' });
  const [editMessage, setEditMessage] = useState('');

  useEffect(() => {
    const fetchEtudiants = async () => {
      try {
        const response = await axios.get('http://localhost:4100/api/utilisateurs', {
          headers: { 'Content-Type': 'application/json' }
        });
        setEtudiants(response.data.data || []);
      } catch (err: any) {
        setError('Erreur lors du chargement des étudiants.');
      } finally {
        setLoading(false);
      }
    };
    fetchEtudiants();
  }, []);

  const handleOpenModal = (etudiant: Etudiant) => {
    setSelectedEtudiant(etudiant);
    setEditForm({ nom: etudiant.nom, prenom: etudiant.prenom, email: etudiant.email });
    setShowModal(true);
    setEditMessage('');
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEtudiant) return;
    try {
      await axios.put(`http://localhost:4100/api/utilisateurs/${selectedEtudiant.id_users}`, {
        nom: editForm.nom,
        prenom: editForm.prenom,
        email: editForm.email
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setEditMessage('Modification enregistrée avec succès !');
      setEtudiants((prev) => prev.map(et => et.id_users === selectedEtudiant.id_users ? { ...et, ...editForm } : et));
      setTimeout(() => setShowModal(false), 2000);
    } catch (err) {
      setEditMessage('Erreur lors de la modification.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Gestion des Étudiants
            </h1>
            <p className="text-gray-600 text-lg">
              Modifier les informations des étudiants inscrits
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Chargement des données...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Students Table */}
        {!loading && !error && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 py-6 bg-gradient-to-r from-indigo-600 to-purple-600">
              <h2 className="text-2xl font-bold text-white">
                Liste des Étudiants ({etudiants.length})
              </h2>
            </div>

            {etudiants.length === 0 ? (
              <div className="p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <p className="text-gray-500 text-lg">Aucun étudiant trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Nom Complet
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Adresse Email
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {etudiants.map((etudiant, index) => (
                      <tr key={etudiant.id_users} className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
                                {etudiant.prenom.charAt(0)}{etudiant.nom.charAt(0)}
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-semibold text-gray-900">
                                {etudiant.prenom} {etudiant.nom}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {etudiant.id_users}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 font-medium">
                            {etudiant.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleOpenModal(etudiant)}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-lg shadow-md hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all duration-200"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal de modification */}
        <Dialog open={showModal} onClose={() => setShowModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" aria-hidden="true" />
            <Dialog.Panel className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-auto transform transition-all">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 mb-4">
                  <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <Dialog.Title className="text-2xl font-bold text-gray-900 mb-2">
                  Modifier l'étudiant
                </Dialog.Title>
                <p className="text-gray-600">
                  Modifiez les informations de l'étudiant sélectionné
                </p>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de famille
                  </label>
                  <input
                    type="text"
                    name="nom"
                    value={editForm.nom}
                    onChange={handleEditChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
                    placeholder="Entrez le nom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="prenom"
                    value={editForm.prenom}
                    onChange={handleEditChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
                    placeholder="Entrez le prénom"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:ring focus:ring-indigo-200 transition-all"
                    placeholder="exemple@email.com"
                  />
                </div>

                {editMessage && (
                  <div className={`p-4 rounded-lg text-center font-medium ${
                    editMessage.includes('succès') 
                      ? 'bg-green-50 text-green-800 border border-green-200' 
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}>
                    {editMessage}
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                  >
                    Enregistrer les modifications
                  </button>
                  <button
                    type="button"
                    className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-300 transition-all duration-200"
                    onClick={() => setShowModal(false)}
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </Dialog.Panel>
          </div>
        </Dialog>
      </div>
    </div>
  );
};

export default ModifEtPage;