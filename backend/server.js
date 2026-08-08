
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Get allowed origins from env variable
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',').map(origin => origin.trim());

const io = socketIO(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// expose io through socket helper for controllers
try {
  require('./socket').setIo(io);
} catch (err) {
  console.warn('Could not set io on socket helper', err.message);
}

// Security: Add helmet for HTTP security headers
app.use(helmet());

// Security: Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again later',
  skipSuccessfulRequests: true
});

// Apply general rate limiting to API routes
app.use('/api/', limiter);

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
}));
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Add response headers for better compatibility
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Simple links dashboard to access all services in one place
app.get('/links', (req, res) => {
  res.send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Service Links - Digital Healthcare</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;margin:30px}h1{color:#2b6cb0}ul{line-height:1.8}</style>
      </head>
      <body>
        <h1>Digital Healthcare - Quick Links</h1>
        <p>Open these in your browser to access frontend and backend endpoints:</p>
        <ul>
          <li><a href="http://localhost:3000" target="_blank">Frontend App (http://localhost:3000)</a></li>
          <li><a href="http://localhost:5000/health" target="_blank">Backend Health (http://localhost:5000/health)</a></li>
          <li><a href="http://localhost:5000/api/health" target="_blank">API Health (http://localhost:5000/api/health)</a></li>
          <li><a href="http://localhost:5000/api" target="_blank">API Base (http://localhost:5000/api)</a></li>
          <li><a href="http://localhost:5000/api/patients" target="_blank">Patients (http://localhost:5000/api/patients)</a></li>
          <li><a href="http://localhost:5000/api/doctors" target="_blank">Doctors (http://localhost:5000/api/doctors)</a></li>
        </ul>
        <h3>Doctor UI</h3>
        <p>Example pages (replace <code>:patientId</code> with a real id):</p>
        <ul>
          <li><a href="http://localhost:3000/doctor/vaccination-view/697737ce003254726580361f" target="_blank">Doctor Vaccination View (example)</a></li>
          <li><a href="http://localhost:3000/doctor/manage-vaccinations/697737ce003254726580361f" target="_blank">Manage Vaccinations (example)</a></li>
        </ul>
        <hr />
        <p style="font-size:.9em;color:#666">Note: Some pages require you to be logged in (token in localStorage). Use developer console to inspect network calls.</p>
      </body>
    </html>
  `);
});

// MongoDB Connection
const mongooseConnectOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

// Try to connect with retry logic (no top-level await)
function connectDB() {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/digital-healthcare', mongooseConnectOptions)
    .then(() => {
      console.log('✅ MongoDB connected successfully');
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err.message);
      console.log('⚠️ Attempting to reconnect in 5 seconds...');
      setTimeout(connectDB, 5000);
    });
}

// Start connection in background without blocking server startup
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/health-records', require('./routes/healthRecords'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/ai', require('./routes/ai'));

// Serve QR scanner static page
app.get('/qr-scanner', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qr-scanner.html'));
});

// Advanced health knowledge base for Socket.IO
const aiController = require('./controllers/aiController');

// Socket.IO for Real-time AI Chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('health-question', (data) => {
    try {
      // Use advanced AI controller logic
      const response = generateAdvancedAIResponse(data.question, data.patientContext);
      socket.emit('ai-response', { 
        response,
        success: true,
        timestamp: new Date()
      });
    } catch (error) {
      socket.emit('ai-response', { 
        response: 'I encountered an error processing your question. Please try again.',
        success: false,
        error: error.message
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Advanced AI Response Generator (same as in aiController)
function generateAdvancedAIResponse(question, patientContext = {}) {
  const healthKnowledgeBase = {
    symptoms: {
      fever: {
        description: 'Elevated body temperature above normal range',
        causes: ['Infection', 'Inflammation', 'Autoimmune disease', 'Heatstroke'],
        severity: 'moderate',
        remedies: [
          'Stay hydrated - drink plenty of water',
          'Rest in a cool environment',
          'Take over-the-counter antipyretics (acetaminophen/ibuprofen)',
          'Apply cool compress to forehead'
        ],
        whenToSeeDoctor: 'If fever exceeds 103°F, persists beyond 3 days, or accompanied by severe symptoms'
      },
      cough: {
        description: 'Respiratory irritation causing involuntary expulsion of air',
        causes: ['Common cold', 'Flu', 'Bronchitis', 'Allergies', 'Pneumonia'],
        severity: 'variable',
        remedies: [
          'Stay hydrated with warm fluids',
          'Use honey to soothe throat (1 tbsp)',
          'Inhale steam from hot shower',
          'Get adequate rest'
        ],
        whenToSeeDoctor: 'If cough persists for more than 3 weeks or produces blood'
      },
      headache: {
        description: 'Pain or pressure sensation in head or neck',
        causes: ['Dehydration', 'Stress', 'Poor posture', 'Caffeine withdrawal', 'Migraines'],
        severity: 'variable',
        remedies: [
          'Drink water and stay hydrated',
          'Rest in a quiet, dark room',
          'Take over-the-counter pain relievers',
          'Apply cold/warm compress'
        ],
        whenToSeeDoctor: 'If severe, persistent, or accompanied by vision changes'
      }
    }
  };

  const lowerQuestion = question.toLowerCase();
  let response = {
    answer: '',
    suggestions: [],
    severity: 'low'
  };

  // Check symptom knowledge base
  for (let symptom in healthKnowledgeBase.symptoms) {
    if (lowerQuestion.includes(symptom)) {
      const symptomInfo = healthKnowledgeBase.symptoms[symptom];
      response.answer = `I understand you're experiencing ${symptom}. ${symptomInfo.description}. Common causes include: ${symptomInfo.causes.slice(0, 2).join(', ')}. ${symptomInfo.whenToSeeDoctor}`;
      response.suggestions = symptomInfo.remedies;
      response.severity = symptomInfo.severity;
      return response.answer;
    }
  }

  // Default response
  response.answer = 'Thank you for your health question. For accurate diagnosis and personalized treatment, please consult with your healthcare provider. If it\'s an emergency, call emergency services immediately.';
  return response.answer;
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, io };
