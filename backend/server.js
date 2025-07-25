const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { supabase, supabaseAdmin } = require('./config/supabase');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Supabase connection test
async function testSupabaseConnection() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Supabase connection error:', error.message);
      console.log('💡 Make sure you have run the database schema in Supabase SQL Editor');
    } else {
      console.log('✅ Connected to Supabase successfully');
      console.log('🗄️  Database tables are ready');
    }
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message);
    console.log('💡 Please check your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  }
}

// Test connection on startup
testSupabaseConnection();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transcripts', require('./routes/transcriptRoutes'));
app.use('/api/nlp', require('./routes/nlpRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Smart Meeting Assistant API'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Meeting Assistant API',
    version: '1.0.0',
    status: 'running'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API docs available at http://localhost:${PORT}/`);
});
