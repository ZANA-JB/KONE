'use client';
import React, { useEffect, useState } from 'react';

const ListeLivres = () => {
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Récupérer tous les livres
  const fetchLivres = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch('http://localhost:4100/api/livres', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLivres(data.data);
      } else {
        setError('Erreur lors de la récupération des livres');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivres();
  }, []);

  // Supprimer un livre par son id
  const handleDelete = async (id) => {
    if (!id) {
      alert("ID du livre manquant !");
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await fetch(`http://localhost:4100/api/livres/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setLivres(prev => prev.filter(livre => livre.id !== id));
        setConfirmDelete(null);
        // Toast de succès
        showToast('Livre supprimé avec succès', 'success');
      } else {
        showToast('Erreur lors de la suppression : ' + (data.message || ''), 'error');
      }
    } catch (err) {
      showToast('Erreur réseau ou serveur : ' + err.message, 'error');
    }
  };

  const showToast = (message, type) => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 12px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      animation: slideInRight 0.3s ease-out;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'};
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
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
          Chargement de la bibliothèque...
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
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
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
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))',
            animation: 'pulse 2s ease-in-out infinite'
          }}>📚</div>
          <h1 style={{ 
            color: 'white',
            fontSize: '42px',
            fontWeight: '700',
            margin: '0',
            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
            letterSpacing: '-0.5px'
          }}>
            Bibliothèque Numérique
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '18px',
            margin: '10px 0 0 0',
            fontWeight: '400'
          }}>
            Découvrez et gérez votre collection de livres
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
              Votre bibliothèque est vide. Commencez par ajouter quelques livres !
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
                    Collection Complète
                  </h2>
                  <p style={{
                    margin: 0,
                    opacity: 0.9,
                    fontSize: '16px'
                  }}>
                    {livres.length} livre{livres.length > 1 ? 's' : ''} dans votre bibliothèque
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
                    <span>📚</span>
                    <span>{livres.length} Total</span>
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.2)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    display: 'flex',  
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>📅</span>
                    <span>Récemment ajoutés</span>
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
                      textAlign: 'center', 
                      fontWeight: '700',
                      color: '#334155',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      🗑️ Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {livres.map((livre, index) => (
                    <tr key={livre.id} style={{ 
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'all 0.3s ease',
                      animation: `slideInLeft ${0.3 + index * 0.1}s ease-out`,
                      background: 'transparent'
                    }}>
                      <td style={{ 
                        padding: '25px',
                        color: '#1e293b',
                        fontWeight: '600',
                        fontSize: '16px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px'
                          }}>
                            📖
                          </div>
                          <span>{livre.titre}</span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '25px',
                        color: '#64748b',
                        fontSize: '15px',
                        fontWeight: '500'
                      }}>
                        {livre.auteur}
                      </td>
                      <td style={{ padding: '25px', textAlign: 'center' }}>
                        <button 
                          onClick={() => setConfirmDelete(livre)}
                          style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 24px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px'
            }}>🚨</div>
            <h3 style={{
              color: '#1e293b',
              fontSize: '24px',
              marginBottom: '15px',
              fontWeight: '700'
            }}>
              Confirmer la suppression
            </h3>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              marginBottom: '25px',
              lineHeight: '1.6'
            }}>
              Êtes-vous sûr de vouloir supprimer le livre <strong>"{confirmDelete.titre}"</strong> ?
              Cette action est irréversible.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                ❌ Annuler
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListeLivres;