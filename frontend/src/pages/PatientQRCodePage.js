import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaDownload } from 'react-icons/fa';
import QRCode from 'qrcode.react';
import { useLanguage } from '../contexts/LanguageContext';
import apiClient from '../utils/api';
import './PatientDetailPage.css';

function PatientQRCodePage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [tablets, setTablets] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const qrRef = React.useRef();

  useEffect(() => {
    const patientInfo = JSON.parse(localStorage.getItem('patientInfo') || '{}');
    setPatient(patientInfo);

    // Fetch tablets and vaccinations
    const fetchData = async () => {
      try {
        const medsResponse = await apiClient.get(`/health-records/tablets/${patientInfo._id}`);
        if (medsResponse.data) {
          const rawMeds = medsResponse.data;
          const meds = [];
          if (Array.isArray(rawMeds)) {
            rawMeds.forEach(doc => {
              if (doc.tablets && Array.isArray(doc.tablets) && doc.tablets.length > 0) {
                doc.tablets.forEach(t => {
                  meds.push({
                    name: t.name || doc.tabletName || 'Medication',
                    dosage: doc.dosage || 'N/A',
                    frequency: doc.medicationType === 'daily' ? 'Daily' : (doc.medicationType === 'weekly' ? 'Weekly' : 'N/A'),
                    reason: doc.reason || 'N/A'
                  });
                });
              } else if (doc.tabletName) {
                meds.push({
                  name: doc.tabletName,
                  dosage: doc.dosage || 'N/A',
                  frequency: 'Custom',
                  reason: doc.reason || 'N/A'
                });
              }
            });
          }
          setTablets(meds);
        }

        const vacResponse = await apiClient.get(`/health-records/vaccinations/${patientInfo._id}`);
        if (vacResponse.data) {
          const rawVacs = vacResponse.data;
          const vacs = [];
          if (Array.isArray(rawVacs)) {
            rawVacs.forEach(vac => {
              if (vac.completedVaccinations && Array.isArray(vac.completedVaccinations)) {
                vac.completedVaccinations.forEach(v => {
                  vacs.push({
                    name: v.name || vac.vaccinationName || 'Vaccination',
                    status: 'Completed',
                    date: v.date || 'N/A',
                    dose: v.dose || 'N/A'
                  });
                });
              }
              if (vac.futureVaccinations && Array.isArray(vac.futureVaccinations)) {
                vac.futureVaccinations.forEach(v => {
                  vacs.push({
                    name: v.name || vac.vaccinationName || 'Vaccination',
                    status: 'Scheduled',
                    date: v.scheduledDate || 'N/A',
                    dose: v.dose || 'N/A'
                  });
                });
              }
            });
          }
          setVaccinations(vacs);
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };

    if (patientInfo._id) {
      fetchData();
    }
  }, []);

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `${patient?.healthId}-qrcode.png`;
      link.click();
    }
  };

  return (
    <div className="patient-detail-page">
      <button className="top-back-button" onClick={() => navigate('/patient-dashboard')}>
        <FaArrowLeft /> {t('back_to_dashboard')}
      </button>
      <div className="detail-container">
        <h1>📱 {t('your_health_qr_code_page')}</h1>
        <div className="detail-content full-width">
          <div className="qr-code-page">
            <div className="qr-info">
              <p>{t('qr_share_info')}</p>
            </div>

            <div className="qr-display-container" ref={qrRef}>
              {patient && (
                <div className="qr-wrapper">
                  <QRCode
                    value={JSON.stringify({
                      healthId: patient.healthId,
                      name: patient.name,
                      email: patient.email,
                      tablets: tablets.map(t => ({ 
                        name: t.name, 
                        dosage: t.dosage,
                        frequency: t.frequency,
                        reason: t.reason
                      })),
                      vaccinations: vaccinations.map(v => ({ 
                        name: v.name, 
                        status: v.status,
                        date: v.date,
                        dose: v.dose
                      }))
                    })}
                    size={300}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              )}
            </div>

            <div className="qr-info-box">
              <h3>{t('information_shared')}</h3>
              <ul>
                <li>✓ {t('personal_details')}</li>
                <li>✓ {t('current_medications_count')} ({tablets.length})</li>
                <li>✓ {t('vaccination_records_count')} ({vaccinations.length})</li>
              </ul>
            </div>

            <button className="download-btn" onClick={downloadQRCode}>
              <FaDownload /> {t('download_qr_code')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PatientQRCodePage;
