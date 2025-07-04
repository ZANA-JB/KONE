'use client';
import React, { useEffect, useState } from 'react';
import { Bell, Clock, Book, Calendar, AlertTriangle, CheckCircle, Eye, Archive, X } from 'lucide-react';

// Simulation d'axios pour la démo
const axios = {
  get: (url) => {
    // Simulation de notifications personnelles pour l'étudiant connecté en cas de retard de retard non trouvé
    if (url.includes('/notifications/mes-notifications')) {
      return Promise.resolve({
        data: {
          data: [
            {
              id: 1,
              type: 'retard',
              titre_livre: 'Le Petit Prince',
              date_emprunt: '2025-05-15T10:00:00Z',
              date_retour_prevue: '2025-06-20T10:00:00Z',
              jours_retard: 13,
              message: 'Votre livre "Le Petit Prince" est en retard de 13 jours. Merci de le retourner rapidement pour éviter des pénalités.',
              date_notification: '2025-07-03T08:00:00Z',
              lu: false,
              archive: false
            },
            {
              id: 2,
              type: 'retard',
              titre_livre: 'Les Misérables',
              date_emprunt: '2025-05-20T10:00:00Z',
              date_retour_prevue: '2025-06-25T10:00:00Z',
              jours_retard: 8,
              message: 'Rappel : Votre livre "Les Misérables" est en retard de 8 jours. Pensez à le retourner à la bibliothèque.',
              date_notification: '2025-07-03T08:00:00Z',
              lu: true,
              archive: false
            },
            {
              id: 3,
              type: 'rappel',
              titre_livre: '1984',
              date_emprunt: '2025-06-01T10:00:00Z',
              date_retour_prevue: '2025-07-05T10:00:00Z',
              jours_retard: 0,
              message: 'Rappel : Votre livre "1984" doit être retourné dans 2 jours (05/07/2025).',
              date_notification: '2025-07-03T08:00:00Z',
              lu: false,
              archive: false
            }
          ]
        }
      });
    }
    
    // Simulation d'un utilisateur sans retard
    if (url.includes('/notifications/utilisateur-sans-retard')) {
      return Promise.resolve({
        data: {
          data: []
        }
      });
    }
    
    return Promise.resolve({ data: { data: [] } });
  },
  put: (url, data) => new Promise((resolve) => {
    setTimeout(() => resolve({ data: { success: true } }), 500);
  })
};

function Notif() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, retard, rappel
  const [updatingNotif, setUpdatingNotif] = useState(null);
  const [hasRetardNotifications, setHasRetardNotifications] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Récupère les notifications personnelles de l'étudiant connecté
    axios.get('http://localhost:4100/api/notifications/mes-notifications')
      .then(res => {
        const notificationsData = res.data.data;
        setNotifications(notificationsData);
        
        // Vérifier s'il y a des notifications de retard
        const hasRetard = notificationsData.some(notif => 
          notif.type === 'retard' && !notif.archive
        );
        setHasRetardNotifications(hasRetard);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const markAsRead = (notificationId) => {
    setUpdatingNotif(notificationId);
    axios.put(`http://localhost:4100/api/notifications/${notificationId}/read`)
      .then(() => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, lu: true } : notif
          )
        );
        showToast('Notification marquée comme lue', 'success');
      })
      .catch(() => showToast('Erreur lors de la mise à jour', 'error'))
      .finally(() => setUpdatingNotif(null));
  };

  const archiveNotification = (notificationId) => {
    setUpdatingNotif(notificationId);
    axios.put(`http://localhost:4100/api/notifications/${notificationId}/archive`)
      .then(() => {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, archive: true } : notif
          )
        );
        
        // Vérifier s'il reste des notifications de retard après archivage
        const remainingRetard = notifications.filter(notif => 
          notif.type === 'retard' && !notif.archive && notif.id !== notificationId
        );
        setHasRetardNotifications(remainingRetard.length > 0);
        
        showToast('Notification archivée', 'success');
      })
      .catch(() => showToast('Erreur lors de l\'archivage', 'error'))
      .finally(() => setUpdatingNotif(null));
  };

  const showToast = (message, type) => {
    const toastDiv = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    toastDiv.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2`;
    toastDiv.innerHTML = `
      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
      </svg>
      ${message}
    `;
    document.body.appendChild(toastDiv);
    setTimeout(() => toastDiv.remove(), 3000);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (notif.archive) return false; // Ne pas afficher les notifications archivées
    
    switch (filter) {
      case 'unread':
        return !notif.lu;
      case 'retard':
        return notif.type === 'retard';
      case 'rappel':
        return notif.type === 'rappel';
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.lu && !n.archive).length;
  const retardCount = notifications.filter(n => n.type === 'retard' && !n.archive).length;
  const rappelCount = notifications.filter(n => n.type === 'rappel' && !n.archive).length;

  const getNotificationIcon = (type, joursRetard) => {
    if (type === 'retard') {
      if (joursRetard > 14) return <AlertTriangle className="w-6 h-6 text-red-500" />;
      if (joursRetard > 7) return <Clock className="w-6 h-6 text-orange-500" />;
      return <Clock className="w-6 h-6 text-yellow-500" />;
    }
    return <Bell className="w-6 h-6 text-blue-500" />;
  };

  const getNotificationBorder = (type, joursRetard) => {
    if (type === 'retard') {
      if (joursRetard > 14) return 'border-l-red-500';
      if (joursRetard > 7) return 'border-l-orange-500';
      return 'border-l-yellow-500';
    }
    return 'border-l-blue-500';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Chargement de vos notifications...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* En-tête */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Bell className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Mes Notifications</h2>
              <p className="text-sm text-gray-500">Messages concernant vos emprunts</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Livres en retard</p>
                <p className="text-2xl font-bold text-red-700">{retardCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Rappels</p>
                <p className="text-2xl font-bold text-blue-700">{rappelCount}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non lues</p>
                <p className="text-2xl font-bold text-gray-700">{unreadCount}</p>
              </div>
              <Eye className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-2 mt-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Toutes ({notifications.filter(n => !n.archive).length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-indigo-100 text-indigo-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Non lues ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('retard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'retard' 
                ? 'bg-red-100 text-red-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Retards ({retardCount})
          </button>
          <button
            onClick={() => setFilter('rappel')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'rappel' 
                ? 'bg-blue-100 text-blue-700' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Rappels ({rappelCount})
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="p-6">
        {/* Message si pas de retard */}
        {!hasRetardNotifications && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Aucune pénalité</h3>
                <p className="text-green-700">
                  Félicitations ! Vous n'avez aucun livre en retard. Continuez à respecter les dates de retour.
                </p>
              </div>
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 && hasRetardNotifications ? (
          <div className="text-center py-8">
            <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification dans cette catégorie</h3>
            <p className="text-gray-500">
              Aucune notification ne correspond au filtre sélectionné.
            </p>
          </div>
        ) : filteredNotifications.length === 0 && !hasRetardNotifications ? (
          <div className="text-center py-8">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification importante</h3>
            <p className="text-gray-500">
              Vous n'avez pas d'autres notifications importantes pour le moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`border-l-4 ${getNotificationBorder(notification.type, notification.jours_retard)} bg-gray-50 rounded-r-lg p-4 ${
                  !notification.lu ? 'bg-blue-50' : ''
                } transition-all duration-200 hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type, notification.jours_retard)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Book className="w-4 h-4" />
                          {notification.titre_livre}
                        </h4>
                        {!notification.lu && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Nouveau
                          </span>
                        )}
                        {notification.type === 'retard' && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {notification.jours_retard} jour{notification.jours_retard > 1 ? 's' : ''} de retard
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Retour prévu : {notification.date_retour_prevue?.slice(0, 10)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(notification.date_notification).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.lu && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        disabled={updatingNotif === notification.id}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Marquer comme lu"
                      >
                        {updatingNotif === notification.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    
                    <button
                      onClick={() => archiveNotification(notification.id)}
                      disabled={updatingNotif === notification.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Archiver"
                    >
                      {updatingNotif === notification.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer d'aide */}
      {hasRetardNotifications && (
        <div className="border-t border-gray-200 p-6 bg-yellow-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-1">Important</h4>
              <p className="text-sm text-yellow-700">
                Pensez à retourner vos livres en retard rapidement pour éviter des pénalités. 
                Vous pouvez les déposer à la bibliothèque ou utiliser la boîte de retour 24h/24.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Notif;