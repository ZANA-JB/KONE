'use client';
import React, { useEffect, useState } from 'react';

const ModifLivres = () => {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({ titre: '', auteur: '', genre: '', disponible: true });

  // Récupérer la liste des livres
  const fetchLivres = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:4100/api/livres', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      const data = await response.json();
      setLivres(data.livres || data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivres();
  }, []);

  // Préparer la modification
  const handleEdit = (livre) => {
    setEditId(livre.id);
    setEditData({
      titre: livre.titre,
      auteur: livre.auteur,
      genre: livre.genre,
      disponible: livre.disponible
    });
  };

  // Gérer la modification
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Soumettre la modification
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:4100/api/livres/${editId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editData)
      });
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      setEditId(null);
      fetchLivres();
      alert('Livre modifié avec succès');
    } catch (err) {
      alert('Erreur lors de la modification : ' + err.message);
    }
  };

  if (loading) return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(255,255,255,0.3)',
          borderTop: '4px solid white',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{
          color: 'white',
          fontSize: '18px',
          fontWeight: '500',
          margin: 0
        }}>
          Chargement des livres...
        </p>
      </div>
    </div>
  );
  
  if (error) return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(220, 53, 69, 0.1)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(220, 53, 69, 0.3)',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '500px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '20px'
        }}>⚠️</div>
        <h3 style={{
          color: '#dc3545',
          marginBottom: '15px',
          fontSize: '24px'
        }}>Une erreur est survenue</h3>
        <p style={{
          color: '#666',
          fontSize: '16px',
          margin: 0
        }}>
          {error}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
      
      <div style={{ 
        maxWidth: '1400px', 
        margin: '0 auto',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        {/* Header avec icône */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '20px',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
          }}>📚</div>
          <h1 style={{ 
            color: 'white',
            fontSize: '42px',
            fontWeight: '700',
            margin: '0',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.5px'
          }}>
            Gestion des Livres
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '18px',
            margin: '10px 0 0 0',
            fontWeight: '400'
          }}>
            Modifiez les informations de vos livres en quelques clics
          </p>
        </div>
        
        {livres.length === 0 ? (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '60px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>📖</div>
            <h3 style={{
              color: '#666',
              fontSize: '24px',
              marginBottom: '10px',
              fontWeight: '600'
            }}>
              Aucun livre trouvé
            </h3>
            <p style={{
              color: '#999',
              fontSize: '16px',
              margin: 0
            }}>
              Commencez par ajouter des livres à votre bibliothèque
            </p>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Stats header */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              padding: '25px 35px',
              color: 'white'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
              }}>
                <div>
                  <h2 style={{
                    margin: '0 0 5px 0',
                    fontSize: '24px',
                    fontWeight: '700'
                  }}>
                    Bibliothèque
                  </h2>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '16px'
                  }}>
                    {livres.length} livre{livres.length > 1 ? 's' : ''} • {livres.filter(l => l.disponible).length} disponible{livres.filter(l => l.disponible).length > 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{
                  display: 'flex',
                  gap: '15px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>✅</span>
                    <span>{livres.filter(l => l.disponible).length} Disponibles</span>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>⏳</span>
                    <span>{livres.filter(l => !l.disponible).length} Empruntés</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '0', overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse',
                backgroundColor: 'transparent'
              }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(90deg, #f8fafc 0%, #f1f5f9 100%)',
                    borderBottom: '2px solid #e2e8f0'
                  }}>
                    <th style={{ 
                      padding: '20px 25px', 
                      textAlign: 'left', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📖 Titre
                    </th>
                    <th style={{ 
                      padding: '20px 25px', 
                      textAlign: 'left', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ✍️ Auteur
                    </th>
                    <th style={{ 
                      padding: '20px 25px', 
                      textAlign: 'left', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🎭 Genre
                    </th>
                    <th style={{ 
                      padding: '20px 25px', 
                      textAlign: 'center', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      📊 Status
                    </th>
                    <th style={{ 
                      padding: '20px 25px', 
                      textAlign: 'center', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ⚙️ Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {livres.map((livre, index) => (
                    <tr key={livre.id || livre.isbn} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'all 0.3s ease',
                      animation: `slideInLeft ${0.3 + index * 0.1}s ease-out`,
                      background: editId === livre.id ? 'linear-gradient(90deg, #fef3c7 0%, #fde68a 100%)' : 'transparent'
                    }}>
                      {editId === livre.id ? (
                        <>
                          <td style={{ padding: '20px 25px' }}>
                            <input 
                              name="titre" 
                              value={editData.titre} 
                              onChange={handleChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                background: 'white',
                                color: '#1e293b',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </td>
                          <td style={{ padding: '20px 25px' }}>
                            <input 
                              name="auteur" 
                              value={editData.auteur} 
                              onChange={handleChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                background: 'white',
                                color: '#1e293b',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </td>
                          <td style={{ padding: '20px 25px' }}>
                            <input 
                              name="genre" 
                              value={editData.genre} 
                              onChange={handleChange}
                              style={{
                                width: '100%',
                                padding: '12px 16px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                fontWeight: '500',
                                transition: 'all 0.3s ease',
                                background: 'white',
                                color: '#1e293b',
                                outline: 'none'
                              }}
                              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                            />
                          </td>
                          <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                            <label style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              gap: '8px'
                            }}>
                              <input 
                                type="checkbox" 
                                name="disponible" 
                                checked={!!editData.disponible} 
                                onChange={handleChange}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  accentColor: '#10b981'
                                }}
                              />
                              <span style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: editData.disponible ? '#10b981' : '#ef4444'
                              }}>
                                {editData.disponible ? 'Disponible' : 'Emprunté'}
                              </span>
                            </label>
                          </td>
                          <td style={{ padding: '20px 25px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button 
                                onClick={handleUpdate}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '10px 20px',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                              >
                                ✅ Sauver
                              </button>
                              <button 
                                onClick={() => setEditId(null)}
                                style={{
                                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '10px 20px',
                                  borderRadius: '10px',
                                  cursor: 'pointer',
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  transition: 'all 0.3s ease',
                                  boxShadow: '0 4px 12px rgba(100, 116, 139, 0.3)'
                                }}
                                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                              >
                                ❌ Annuler
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ 
                            padding: '25px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '16px'
                          }}>
                            {livre.titre}
                          </td>
                          <td style={{ 
                            padding: '25px',
                            color: '#64748b',
                            fontSize: '15px',
                            fontWeight: '500'
                          }}>
                            {livre.auteur}
                          </td>
                          <td style={{ 
                            padding: '25px',
                            color: '#64748b',
                            fontSize: '15px'
                          }}>
                            <span style={{
                              background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#475569'
                            }}>
                              {livre.genre}
                            </span>
                          </td>
                          <td style={{ 
                            padding: '25px',
                            textAlign: 'center'
                          }}>
                            <span style={{
                              background: livre.disponible 
                                ? 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)' 
                                : 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
                              color: livre.disponible ? '#166534' : '#dc2626',
                              padding: '8px 16px',
                              borderRadius: '20px',
                              fontSize: '13px',
                              fontWeight: '700',
                              border: livre.disponible 
                                ? '1px solid #86efac' 
                                : '1px solid #fca5a5'
                            }}>
                              {livre.disponible ? '✅ Disponible' : '⏳ Emprunté'}
                            </span>
                          </td>
                          <td style={{ padding: '25px', textAlign: 'center' }}>
                            <button 
                              onClick={() => handleEdit(livre)}
                              style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                color: 'white',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                              }}
                            >
                              ✏️ Modifier
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModifLivres;