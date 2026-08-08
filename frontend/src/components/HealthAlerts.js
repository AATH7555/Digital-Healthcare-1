
import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import { FaBell } from 'react-icons/fa';
import './HealthAlerts.css';

function HealthAlerts({ patient }) {
    const [futureVaccinations, setFutureVaccinations] = useState([]);
    // Fetch future vaccinations for tomorrow alert
    useEffect(() => {
      const fetchVaccinations = async () => {
        try {
          const response = await apiClient.get(`/health-records/vaccinations/${patient._id}`);
          let future = [];
          if (Array.isArray(response.data)) {
            response.data.forEach(doc => {
              if (doc.futureVaccinations) future = future.concat(doc.futureVaccinations);
            });
          } else if (response.data && response.data.vaccinations) {
            response.data.vaccinations.forEach(vac => {
              if (vac.futureVaccinations) future = future.concat(vac.futureVaccinations);
            });
          }
          setFutureVaccinations(future);
        } catch (err) {
          setFutureVaccinations([]);
        }
      };
      fetchVaccinations();
    }, [patient._id]);
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const response = await apiClient.get(`/alerts/patient/${patient._id}`);
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts');
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await apiClient.get(`/alerts/patient/${patient._id}/unread-count`);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count');
    }
  }, [patient._id]);

  useEffect(() => {
    fetchAlerts();
    fetchUnreadCount();
  }, [fetchAlerts, fetchUnreadCount]);

  const markAsRead = async (alertId) => {
    try {
      await apiClient.put(`/alerts/${alertId}/read`);
      fetchAlerts();
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking alert as read');
    }
  };

  return (
    <div className="health-alerts">
      <h3><FaBell /> Health Alerts ({unreadCount} Unread)</h3>
      {loading ? (
        <p>Loading alerts...</p>
      ) : (
        <>
          {/* Show tomorrow's vaccination alert if any */}
          {futureVaccinations && futureVaccinations.length > 0 && futureVaccinations.map((future, idx) => {
            let dateStr = future.scheduledDate || future.date;
            if (!dateStr) return null;
            const vacDate = new Date(dateStr);
            const now = new Date();
            // Set both to midnight for date-only comparison
            vacDate.setHours(0,0,0,0);
            now.setHours(0,0,0,0);
            const diffDays = Math.round((vacDate - now) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
              return (
                <div key={`tomorrow-vac-${idx}`} className="alert-item unread">
                  <div className="alert-content">
                    <h4>Vaccination Scheduled for Tomorrow</h4>
                    <p>You have a vaccination scheduled on {vacDate.toLocaleDateString()} ({future.name || 'Vaccination'}).</p>
                  </div>
                </div>
              );
            }
            return null;
          })}
          {/* Show backend alerts as usual */}
          {alerts.length === 0 && (!futureVaccinations || !futureVaccinations.some(future => {
            let dateStr = future.scheduledDate || future.date;
            if (!dateStr) return false;
            const vacDate = new Date(dateStr);
            const now = new Date();
            vacDate.setHours(0,0,0,0);
            now.setHours(0,0,0,0);
            return Math.round((vacDate - now) / (1000 * 60 * 60 * 24)) === 1;
          })) ? (
            <p className="no-alerts">No alerts</p>
          ) : null}
          <div className="alerts-list">
            {alerts.map(alert => (
              <div key={alert._id} className={`alert-item ${alert.isRead ? 'read' : 'unread'}`}>
                <div className="alert-content">
                  <h4>{alert.title}</h4>
                  <p>{alert.message}</p>
                  <small>{new Date(alert.createdAt).toLocaleDateString()}</small>
                </div>
                {!alert.isRead && (
                  <button onClick={() => markAsRead(alert._id)} className="btn-read">
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default HealthAlerts;
