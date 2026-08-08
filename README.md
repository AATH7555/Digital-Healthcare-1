# Digital Healthcare System

A comprehensive web-based healthcare management platform with patient and doctor portals, featuring secure health records management, QR code integration, and AI-powered health assistance.

## Project Structure

```
project/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── controllers/
│   ├── middleware/
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── utils/
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    └── README.md
```

## Features

### Patient Features
- **User Registration**: Create account with name, email, password
- **Unique Health ID**: Auto-generated unique identifier for each patient
- **Medication Tracking**: View, track medications with dosage and schedule
- **Vaccination Records**: Track completed and upcoming vaccinations
- **QR Code Generation**: Generate QR code with health information
- **Health AI Assistant**: Chat-based health Q&A powered by AI
- **Help & Information**: Comprehensive guides and tips

### Doctor Features
- **Patient Search**: Find patients by Health ID
- **Medication Management**: Add/update patient medications
- **Vaccination Management**: Record vaccinations and schedule future ones
- **QR Scanner**: Scan and view patient health information
- **Secure Access**: Fixed credentials for doctor login

## Technology Stack

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Socket.io for real-time chat
- QRCode.React for QR generation
- React Icons

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- Socket.io for WebSocket communication
- QRCode library

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following:
   ```
   MONGODB_URI=mongodb://localhost:27017/digital-healthcare
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   mongod
   ```

4. **Run Backend Server**
   ```bash
   npm run dev
   ```
   
   Server will start on `http://localhost:5000`

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```
   
   App will open at `http://localhost:3000`

## Default Credentials

### Doctor Login
- **Email**: doctor@gmail.com
- **Password**: health123

### Patient
- Create new account on registration page

## API Endpoints

### Authentication
- `POST /api/auth/register-patient` - Register patient
- `POST /api/auth/login-patient` - Patient login
- `POST /api/auth/login-doctor` - Doctor login

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:healthId` - Get patient by Health ID
- `GET /api/patients/dashboard/info` - Get patient dashboard

### Doctors
- `POST /api/doctors/tablet` - Add tablet info
- `PUT /api/doctors/tablet/:tabletId` - Update tablet
- `POST /api/doctors/vaccination` - Add vaccination
- `PUT /api/doctors/vaccination/:vaccinationId` - Update vaccination
- `POST /api/doctors/qr-generate/:patientId` - Generate QR code
- `POST /api/doctors/qr-scan` - Scan QR code

## Database Models

### Patient
```javascript
{
  healthId: String (unique),
  name: String,
  email: String (unique),
  password: String,
  createdAt: Date
}
```

### Tablet
```javascript
{
  patientId: ObjectId,
  tabletName: String,
  dosage: String,
  schedule: Array,
  startDate: Date,
  endDate: Date,
  weeklyReport: Array
}
```

### Vaccination
```javascript
{
  patientId: ObjectId,
  vaccinationName: String,
  status: String,
  vaccinationDetails: Array,
  futureVaccinations: Array,
  weeklyReport: Array
}
```

### QRCode
```javascript
{
  patientId: ObjectId,
  healthId: String,
  patientName: String,
  email: String,
  tablets: Array,
  vaccinations: Array,
  qrCode: String
}
```

## Usage Guide

### Patient Workflow
1. Sign up with name, email, and password
2. Receive unique Health ID automatically
3. Access dashboard with 4 main modules:
   - **Medications**: Track prescribed drugs
   - **Vaccinations**: Manage vaccination records
   - **QR Code**: Generate and share health info
   - **Health AI**: Ask health questions

### Doctor Workflow
1. Login with fixed credentials
2. Search for patient by Health ID
3. Select one of three actions:
   - Add/update medication details
   - Record vaccination information
   - Scan patient QR code

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- CORS protection
- Secure QR code data encoding
- Encrypted WebSocket communication
- Fixed doctor credentials

## File Structure Details

### Backend Routes
- `routes/auth.js` - Authentication endpoints
- `routes/patients.js` - Patient data endpoints
- `routes/doctors.js` - Doctor management endpoints
- `routes/healthRecords.js` - Health records endpoints

### Frontend Components
- `LoginPage.js` - Login/Registration page
- `PatientDashboard.js` - Patient main dashboard
- `DoctorDashboard.js` - Doctor main dashboard
- `TabletModule.js` - Medication tracking
- `VaccinationModule.js` - Vaccination tracking
- `AIChat.js` - Health AI assistant
- `QRScanner.js` - QR code scanner
- `HelpModal.js` - Help and information
- `AddTabletForm.js` - Add medication form
- `AddVaccinationForm.js` - Add vaccination form

## Styling

The application uses:
- CSS Grid and Flexbox for layouts
- Gradient backgrounds (#667eea to #764ba2)
- Smooth animations and transitions
- Responsive design for mobile, tablet, and desktop
- Custom CSS variables for consistent theming

## Future Enhancements

- Email notifications for upcoming appointments
- SMS alerts for medication reminders
- Integration with pharmacy systems
- Telemedicine consultation feature
- Advanced analytics and health insights
- Multi-language support
- Mobile app version
- Integration with wearable devices

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in .env file

### Port Already in Use
- Change PORT in .env file
- Or kill process on the port

### CORS Error
- Ensure backend is running on correct port
- Check proxy setting in frontend package.json

### QR Code Not Generating
- Ensure patient data is complete
- Check browser console for errors

## License

MIT License

## Support

For technical support, contact: support@digitalhealthcare.com

## Contributing

Contributions are welcome! Please follow the existing code style and create pull requests.
