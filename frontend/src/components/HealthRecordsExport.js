import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../utils/api';
import { FaFileAlt, FaDownload } from 'react-icons/fa';
import './HealthRecordsExport.css';

function HealthRecordsExport({ patient }) {
  const [records, setRecords] = useState({
    tablets: [],
    vaccinations: [],
    reports: []
  });
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    try {
      const [tabletsRes, vaccinationsRes, reportsRes] = await Promise.all([
        apiClient.get(`/health-records/tablets/${patient._id}`),
        apiClient.get(`/health-records/vaccinations/${patient._id}`),
        apiClient.get(`/reports/patient/${patient._id}`)
      ]);

      setRecords({
        tablets: tabletsRes.data,
        vaccinations: vaccinationsRes.data,
        reports: reportsRes.data
      });
    } catch (error) {
      console.error('Error fetching records');
    } finally {
      setLoading(false);
    }
  }, [patient._id]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Patient Header
    csvContent += `Patient Health Record Export\n`;
    csvContent += `Health ID: ${patient.healthId}\n`;
    csvContent += `Name: ${patient.name}\n`;
    csvContent += `Date: ${new Date().toLocaleDateString()}\n\n`;

    // Medications
    csvContent += `MEDICATIONS\n`;
    csvContent += `Tablet Name,Dosage,Start Date,End Date\n`;
    records.tablets.forEach(t => {
      csvContent += `${t.tabletName},${t.dosage},${new Date(t.startDate).toLocaleDateString()},${new Date(t.endDate).toLocaleDateString()}\n`;
    });

    csvContent += `\nVACCINATIONS\n`;
    csvContent += `Vaccination Name,Status,Date\n`;
    records.vaccinations.forEach(v => {
      csvContent += `${v.vaccinationName},${v.status},${new Date(v.createdAt).toLocaleDateString()}\n`;
    });

    csvContent += `\nREPORTS\n`;
    csvContent += `Title,Type,Date\n`;
    records.reports.forEach(r => {
      csvContent += `${r.title},${r.reportType},${new Date(r.createdAt).toLocaleDateString()}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `health_records_${patient.healthId}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const exportToPDF = () => {
    alert('PDF export feature coming soon');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="health-records-export">
      <h3><FaFileAlt /> Export Health Records</h3>

      <div className="export-summary">
        <div className="summary-item">
          <strong>{records.tablets.length}</strong>
          <p>Medications</p>
        </div>
        <div className="summary-item">
          <strong>{records.vaccinations.length}</strong>
          <p>Vaccinations</p>
        </div>
        <div className="summary-item">
          <strong>{records.reports.length}</strong>
          <p>Medical Reports</p>
        </div>
      </div>

      <div className="export-buttons">
        <button onClick={exportToCSV} className="btn-export">
          <FaDownload /> Export as CSV
        </button>
        <button onClick={exportToPDF} className="btn-export">
          <FaDownload /> Export as PDF
        </button>
      </div>
    </div>
  );
}

export default HealthRecordsExport;
