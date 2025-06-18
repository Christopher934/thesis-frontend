const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Simple test endpoint
app.get('/test', (req, res) => {
  console.log('GET /test - Request received');
  res.json({ message: 'Test endpoint working!' });
});

// Shifts endpoint with no authentication
app.get('/shifts', (req, res) => {
  console.log('GET /shifts - Request received');
  console.log('Headers:', req.headers);
  
  // Send a simple mock response
  const mockShifts = [
    {
      id: 1,
      tanggal: '2025-06-08',
      jammulai: '09:00',
      jamselesai: '17:00',
      lokasi: 'POLI_UMUM',
      tipe: 'PAGI',
      idpegawai: 'jojostaf',
      nama: 'Jojo Staff'
    }
  ];
  
  res.json(mockShifts);
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Simple mock server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('GET    /test');
  console.log('GET    /shifts');
});
