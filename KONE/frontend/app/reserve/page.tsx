'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Types pour TS
interface Livre {
  id: number;
  titre: string;
  auteur: string;
  genre: string;
  note_moyenne?: number;
  nombre_notes?: number;
}
interface User {
  id_users?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
}

const Page = () => {
  const [livres, setLivres] = useState<Livre[]>([]);
  const [messages, setMessages] = useState<{ [key: number]: string }>({});
  const [loadingIds, setLoadingIds] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let storedUser = null;
    try {
      storedUser = userStr ? JSON.parse(userStr) : null;
    } catch {   
      localStorage.removeItem('user');
      localStorage.removeItem('userToken');
    }
    setUser(storedUser);
  }, []);

  const fetchLivres = async () => {
    try {
      const response = await axios.get('http://localhost:4100/api/livres');
      const data = response.data.data || [];
      setLivres(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des livres:', error);
    }
  };

  useEffect(() => {
    fetchLivres();
  }, []);

  const reserverLivre = async (livreId: number, titre: string) => {
    if (!user || !user.nom || !user.email) {
      setMessages((prev) => ({ ...prev, [livreId]: '❌ Vous devez être connecté pour réserver.' }));
      return;
    }
    setLoadingIds((prev) => [...prev, livreId]);
    setMessages((prev) => ({ ...prev, [livreId]: '' }));

    try {
       await axios.post(`http://localhost:4100/api/livres/${livreId}/reservation`, {
        nom: user.nom,
        email: user.email,
        telephone: user.telephone || 'Non renseigné',
      });

      setMessages((prev) => ({
        ...prev,
        [livreId]: `✅ Réservation réussie pour "${titre}"`,
      }));
    } catch (error) {
      console.error(`❌ Erreur pour le livre ID ${livreId}:`, error);
      setMessages((prev) => ({
        ...prev,
        [livreId]: '❌ Réservation deja effectée.',
      }));
    } finally {
      setLoadingIds((prev) => prev.filter((id) => id !== livreId));
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">📚 Livres Disponibles à la Réservation</h1>

      {livres.length === 0 ? (
        <p className="text-center text-gray-600">Aucun livre disponible pour le moment.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {livres.map((livre) => (
            <div
              key={livre.id}
              className="p-5 border rounded-lg shadow hover:shadow-md transition duration-300 bg-white"
            >
              <h2 className="text-xl font-semibold text-blue-800">{livre.titre}</h2>
              <p className="text-gray-700 mt-1">Auteur : {livre.auteur}</p>
              <p className="text-sm text-gray-500">Genre : {livre.genre}</p>
              <p className="text-sm text-gray-500">
                Note moyenne : <strong>{livre.note_moyenne}</strong> ⭐ ({livre.nombre_notes} votes)
              </p>

              <button
                onClick={() => reserverLivre(livre.id, livre.titre)}
                disabled={loadingIds.includes(livre.id)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loadingIds.includes(livre.id) ? 'Réservation...' : 'Réserver ce livre'}
              </button>

              {messages[livre.id] && (
                <div
                  className={`mt-3 p-2 rounded text-sm ${
                    messages[livre.id].startsWith('✅')
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {messages[livre.id]}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
