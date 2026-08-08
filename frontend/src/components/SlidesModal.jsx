import React, { useEffect, useState } from 'react';
import './SlidesModal.css';

const defaultSlides = [
  { title: 'Digital Healthcare System', body: 'AI-Powered Patient & Doctor Platform\nUnified Health Records · Real-time AI Chat · QR Code Sharing' },
  { title: 'Problem & Solution', body: 'Problems: Fragmented records, manual workflows\nSolution: Unified web platform + AI assistant' },
  { title: 'System Overview', body: 'React Frontend ↔ Express Backend ↔ MongoDB\n15+ APIs · Responsive · 24/7 AI' },
  { title: 'Patient Features', body: 'Registration, Dashboard, Medication reminders, QR export, AI assistant' },
  { title: 'Doctor Features', body: 'Secure login, Search by Health ID, Manage meds/vax, QR scan' },
  { title: 'Technology Stack', body: 'React, Express, Node.js, MongoDB, Socket.io, JWT' },
  { title: 'Database Models', body: 'Patient, Medication, Vaccination, QRCode, Doctor' },
  { title: 'QR Code Innovation', body: 'Encodes critical health data for offline emergency access' },
  { title: 'AI Health Assistant', body: 'Context-aware guidance using age, history, allergies' },
  { title: 'Real-time Communication', body: 'Socket.io for instant chat and typing indicators' },
  { title: 'Security', body: 'JWT auth, bcrypt password hashing, role-based access' },
  { title: 'API Summary', body: 'Auth, Patient, Doctor, AI, QR and Vaccination endpoints' },
  { title: 'Key Achievements', body: 'Production-ready backend & frontend · Real-time AI chat' },
  { title: 'Results & Impact', body: 'Faster care, reduced paperwork, improved adherence' },
  { title: 'Patient Dashboard - Menu', body: '💊 Manage Medications\n🩹 Manage Vaccines\n💉 Vaccination View\n👤 Profile Management\n📱 QR Code Sharing\n🤖 AI Health Assistant\n📅 Appointments\n🔔 Health Alerts\n📄 Export Records' },
  { title: 'Patient Dashboard - Responsive', body: 'Fully Responsive Design\n✓ Desktop (1920px+) - Multi-column layout\n✓ Tablet (1024px) - Optimized panels\n✓ Mobile (768px) - Single column\n✓ Small Mobile (480px) - Touch-friendly' },
  { title: 'Medication Management', body: 'Features:\n• View all medications with schedules\n• Display drug names, dosages, timings\n• Medication reminders & tracking\n• Add/Edit/Delete medications\n• Responsive grid: 3 cols → 1 col' },
  { title: 'Vaccination Tracker', body: 'Features:\n• Complete vaccination history\n• Status tracking (Completed/Upcoming)\n• Vaccination dates & providers\n• Doctor-managed updates\n• Responsive cards layout\n• Color-coded status badges' },
  { title: 'Health QR Codes', body: 'Features:\n• Generate unique patient QR code\n• Encodes: Health ID, meds, vaccines\n• Shareable with doctors/hospitals\n• Instant health info access\n• Offline-ready emergency data' },
  { title: 'AI Health Assistant', body: 'Features:\n• 24/7 real-time AI chat support\n• Context-aware health guidance\n• Uses patient age & medical history\n• Socket.io for instant messaging\n• Accessible from dashboard' },
  { title: 'Appointments System', body: 'Features:\n• Book appointments with doctors\n• View booked appointment details\n• Cancel/reschedule options\n• Real-time status updates\n• Integration with Doctor Portal' },
  { title: 'Profile Management', body: 'Features:\n• View patient information\n• Update personal details\n• Manage contact information\n• View health ID & account status\n• Secure profile access' },
  { title: 'Doctor Dashboard - Features', body: '🔍 Patient Search (by Health ID)\n📋 Manage Medications & Vaccines\n📱 QR Code Scanning\n👥 View All Connected Patients\n🩺 Patient Profile Access\n📅 Appointment Management' },
  { title: 'Doctor Dashboard - Responsive', body: 'Fully Responsive Design\n✓ Desktop (1920px+) - Side panel + content\n✓ Tablet (1024px) - Stacked layout\n✓ Mobile (768px) - Single column\n✓ Small Mobile (480px) - Optimized cards\n✓ Touch-friendly patient selection' },
  { title: 'QR Scanner Integration', body: 'Features:\n• Scan patient QR codes\n• Extract patient data instantly\n• View complete health history\n• Real-time data retrieval\n• Works on all devices' }
]; 

export default function SlidesModal({ open, onClose, slides }) {
  // Slides modal disabled - showing full dashboard instead
  return null;
}
