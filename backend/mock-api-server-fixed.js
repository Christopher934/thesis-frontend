const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Current date is June 7, 2025
console.log("Mock server using date: June 7, 2025");

// Authentication endpoints
app.post('/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;

  // Simple authentication, for demonstration - matching real credentials
  if (email === 'admin@example.com' && password === 'admin123') {
    res.json({
      access_token: 'mock-jwt-token-for-admin',
      user: {
        id: 1,
        username: 'adminrsud',
        email: 'admin@example.com',
        namaDepan: 'Admin',
        namaBelakang: 'RSUD',
        role: 'ADMIN'
      }
    });
  } else if (email === 'dokter@example.com' && password === 'dokter123') {
    res.json({
      access_token: 'mock-jwt-token-for-dokter',
      user: {
        id: 2,
        username: 'DOK001',
        email: 'dokter@example.com',
        namaDepan: 'Dokter',
        namaBelakang: 'Spesialis',
        role: 'DOKTER'
      }
    });
  } else if (email === 'perawat@example.com' && password === 'perawat123') {
    res.json({
      access_token: 'mock-jwt-token-for-perawat',
      user: {
        id: 3,
        username: 'PER001',
        email: 'perawat@example.com',
        namaDepan: 'Perawat',
        namaBelakang: 'Senior',
        role: 'PERAWAT'
      }
    });
  } else {
    // Authentication failed
    res.status(401).json({ 
      message: 'Email atau password salah',
      error: 'Unauthorized',
      statusCode: 401
    });
  }
});

// Mock data for shifts - ALL dates should be in June
const shifts = [
  {
    "id": 1,
    "tanggal": "2025-06-08", // June 8, 2025
    "jammulai": "07:00",
    "jamselesai": "15:00",
    "lokasishift": "POLI_UMUM",
    "tipeshift": "PAGI",
    "idpegawai": "adminrsud",
    "userId": 1,
    "nama": "Admin RSUD"
  },
  {
    "id": 2,
    "tanggal": "2025-06-08",
    "jammulai": "15:00",
    "jamselesai": "23:00",
    "lokasishift": "POLI_UMUM",
    "tipeshift": "SIANG",
    "idpegawai": "pegawaione",
    "userId": 2,
    "nama": "Budi Santoso"
  },
  {
    "id": 3,
    "tanggal": "2025-06-08",
    "jammulai": "23:00",
    "jamselesai": "07:00",
    "lokasishift": "POLI_UMUM",
    "tipeshift": "MALAM",
    "idpegawai": "pegawaitwo",
    "userId": 3,
    "nama": "Siti Rahayu"
  },
  {
    "id": 4,
    "tanggal": "2025-06-07",
    "jammulai": "08:00",
    "jamselesai": "16:00",
    "lokasishift": "POLI_ANAK",
    "tipeshift": "PAGI",
    "idpegawai": "pegawaione",
    "userId": 2,
    "nama": "Budi Santoso"
  },
  {
    "id": 5,
    "tanggal": "2025-06-07",
    "jammulai": "16:00",
    "jamselesai": "00:00",
    "lokasishift": "POLI_ANAK",
    "tipeshift": "SIANG",
    "idpegawai": "pegawaitwo",
    "userId": 3,
    "nama": "Siti Rahayu"
  },
  // Today's shifts for various users (current date: June 7, 2025)
  {
    "id": 6,
    "tanggal": "2025-06-07",
    "jammulai": "07:00",
    "jamselesai": "15:00",
    "lokasishift": "IGD",
    "tipeshift": "PAGI",
    "idpegawai": "adminrsud",
    "userId": 1,
    "nama": "Admin RSUD"
  },
  // Shift specifically for Jojo Staf (match case exactly as in localStorage)
  {
    "id": 7,
    "tanggal": "2025-06-07",
    "jammulai": "09:00",
    "jamselesai": "17:00",
    "lokasishift": "POLI_ANAK",
    "tipeshift": "PAGI",
    "idpegawai": "jojostaf",
    "userId": 100,
    "nama": "Jojo Staf"
  },
  // Add more test shifts for this user on different days
  {
    "id": 8,
    "tanggal": "2025-06-08",
    "jammulai": "08:00",
    "jamselesai": "16:00",
    "lokasishift": "POLI_GIGI",
    "tipeshift": "PAGI",
    "idpegawai": "jojostaf",
    "userId": 100,
    "nama": "Jojo Staf"
  }
];

// Mock data for users
const users = [
  {
    "id": 1,
    "username": "adminrsud",
    "email": "admin@example.com",
    "namaDepan": "Admin",
    "namaBelakang": "RSUD",
    "role": "ADMIN",
    "jenisKelamin": "L",
    "status": "ACTIVE"
  },
  {
    "id": 2,
    "username": "pegawaione",
    "email": "pegawai1@example.com",
    "namaDepan": "Budi",
    "namaBelakang": "Santoso",
    "role": "STAF",
    "jenisKelamin": "L",
    "status": "ACTIVE"
  },
  {
    "id": 3,
    "username": "pegawaitwo",
    "email": "pegawai2@example.com",
    "namaDepan": "Siti",
    "namaBelakang": "Rahayu",
    "role": "STAF",
    "jenisKelamin": "P",
    "status": "ACTIVE"
  },
  {
    "id": 6,
    "username": "supervisor1",
    "email": "supervisor@example.com",
    "namaDepan": "Ahmad",
    "namaBelakang": "Supervisor",
    "role": "SUPERVISOR",
    "jenisKelamin": "L",
    "status": "ACTIVE"
  },
  {
    "id": 4,
    "username": "210211060161",
    "email": "youandao1704@gmail.com",
    "namaDepan": "sdasddas",
    "namaBelakang": "dasdasd",
    "role": "STAF",
    "jenisKelamin": "L",
    "status": "ACTIVE"
  },
  {
    "id": 5,
    "username": "123123123123",
    "email": "christopherhans934@gmail.com",
    "namaDepan": "131214d1",
    "namaBelakang": "123d",
    "role": "STAF",
    "jenisKelamin": "P",
    "status": "ACTIVE"
  }
];

// Mock data for events
const events = [
  {
    id: 1,
    judul: 'Rapat Evaluasi Bulanan',
    deskripsi: 'Membahas evaluasi layanan bulan sebelumnya.',
    tanggal: '2025-06-01',
    lokasi: 'Ruang Rapat Utama',
  },
  {
    id: 2,
    judul: 'Pelatihan P3K',
    deskripsi: 'Pelatihan P3K untuk seluruh staf medis dan nonmedis.',
    tanggal: '2025-06-03',
    lokasi: 'Aula RSUD',
  },
];

// Token verification middleware (simplified)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  console.log('Received request with auth header:', authHeader ? 'Present' : 'Missing');
  
  // For testing, allow requests without token as well
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('WARNING: No token provided, but allowing request for testing');
    return next();
  }
  
  const token = authHeader.split(' ')[1];
  console.log('Token received:', token ? 'Valid token' : 'Invalid token');
  
  // In a real app, you would verify the token
  // For this mock server, we'll just let all requests pass
  next();
};

// Routes for shifts
app.get('/shifts', verifyToken, (req, res) => {
  console.log(`GET /shifts - Request received from IP: ${req.ip}`);
  console.log(`Request headers:`, req.headers);
  console.log(`GET /shifts - Returning ${shifts.length} shifts`);
  
  // Set CORS headers explicitly
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Ensure shifts is always an array
  if (!Array.isArray(shifts)) {
    console.error('Shifts data is not an array!');
    return res.json([]);
  }
  
  // Always ensure we have a test shift for jojostaf
  const hasJojoShift = shifts.some(shift => shift.idpegawai === "jojostaf");
  if (!hasJojoShift) {
    console.log("Adding test shift for jojostaf");
    // Ensure today's date is used (June 8, 2025)
    const todayDate = "2025-06-08";
    shifts.push({
      "id": 999,
      "tanggal": todayDate,
      "jammulai": "09:00",
      "jamselesai": "17:00",
      "lokasishift": "POLI_UMUM",
      "tipeshift": "PAGI",
      "idpegawai": "jojostaf",
      "userId": 100,
      "nama": "Jojo Staf"
    });
  }
  
  // Add proper headers
  res.setHeader('Content-Type', 'application/json');
  res.json(shifts);
});

app.get('/shifts/:id', verifyToken, (req, res) => {
  const shift = shifts.find(s => s.id === parseInt(req.params.id));
  if (!shift) {
    return res.status(404).json({ message: 'Shift not found' });
  }
  res.json(shift);
});

app.post('/shifts', verifyToken, (req, res) => {
  // Validate that the user exists
  const userId = parseInt(req.body.userId) || 0;
  const idpegawai = req.body.idpegawai || '';
  
  console.log(`Checking user: userId=${userId}, idpegawai=${idpegawai}`);
  
  // At least one of userId or idpegawai must be provided
  if (!userId && !idpegawai) {
    console.log(`User validation failed: No userId or idpegawai provided`);
    return res.status(400).json({ 
      message: 'Cannot create shift: No user information provided. Please specify a valid user.' 
    });
  }
  
  // Find the user
  const user = users.find(user => {
    const idMatch = userId && user.id === userId;
    const usernameMatch = idpegawai && user.username === idpegawai;
    return idMatch || usernameMatch;
  });
  
  if (!user) {
    console.log(`User validation failed: userId=${userId}, idpegawai=${idpegawai}`);
    return res.status(400).json({ 
      message: 'Cannot create shift: User does not exist. Please use a registered user.' 
    });
  }
  
  console.log(`User validation passed: ${user.namaDepan} ${user.namaBelakang} (${user.username})`);
  
  // Create shift with validated user information
  const newId = Math.max(...shifts.map(s => s.id), 0) + 1;
  const newShift = {
    id: newId,
    ...req.body,
    // Always use the validated user information
    userId: user.id,
    idpegawai: user.username,
    nama: `${user.namaDepan} ${user.namaBelakang}`
  };
  
  shifts.push(newShift);
  res.status(201).json(newShift);
});

app.put('/shifts/:id', verifyToken, (req, res) => {
  const index = shifts.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Shift not found' });
  }
  
  // Validate that the user exists if the user is being changed
  if (req.body.idpegawai || req.body.userId) {
    const userId = parseInt(req.body.userId) || 0;
    const idpegawai = req.body.idpegawai || '';
    
    console.log(`Checking user for update: userId=${userId}, idpegawai=${idpegawai}`);
    
    // Find the user
    const user = users.find(user => {
      const idMatch = userId && user.id === userId;
      const usernameMatch = idpegawai && user.username === idpegawai;
      return idMatch || usernameMatch;
    });
    
    if (!user) {
      console.log(`User validation failed for update: userId=${userId}, idpegawai=${idpegawai}`);
      return res.status(400).json({ 
        message: 'Cannot update shift: User does not exist. Please use a registered user.' 
      });
    }
    
    console.log(`User validation passed for update: ${user.namaDepan} ${user.namaBelakang} (${user.username})`);
    
    // Update req.body with validated user information
    req.body.userId = user.id;
    req.body.idpegawai = user.username;
    req.body.nama = `${user.namaDepan} ${user.namaBelakang}`;
  }
  
  shifts[index] = {
    ...shifts[index],
    ...req.body
  };
  
  res.json(shifts[index]);
});

app.delete('/shifts/:id', verifyToken, (req, res) => {
  const index = shifts.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Shift not found' });
  }
  
  const removed = shifts.splice(index, 1)[0];
  res.json({ message: `Shift with ID ${req.params.id} has been deleted`, data: removed });
});

// Routes for users
app.get('/users', verifyToken, (req, res) => {
  res.json(users);
});

app.get('/users/count-by-role', verifyToken, (req, res) => {
  // Log all unique roles in the database for debugging
  const uniqueRoles = [...new Set(users.map(u => u.role))];
  console.log('Found roles in database:', uniqueRoles);
  
  // Count users by role
  const counts = {
    DOKTER: users.filter(u => u.role === 'DOKTER').length,
    PERAWAT: users.filter(u => u.role === 'PERAWAT').length,
    STAF: users.filter(u => u.role === 'STAF').length,
    SUPERVISOR: users.filter(u => u.role === 'SUPERVISOR').length || 2, // Ensure supervisor is always available
    ADMIN: users.filter(u => u.role === 'ADMIN').length
  };
  
  // Force SUPERVISOR to be included even if count is 0
  if (!('SUPERVISOR' in counts) || counts['SUPERVISOR'] === 0) {
    counts['SUPERVISOR'] = 2; // We know there are 2 supervisors in the database
  }
  
  // Log the counts for debugging
  console.log('User counts by role:', counts);
  
  res.json({ counts });
});

app.get('/users/count-by-gender', verifyToken, (req, res) => {
  const counts = {
    L: users.filter(u => u.jenisKelamin === 'L').length,
    P: users.filter(u => u.jenisKelamin === 'P').length
  };
  res.json({ counts });
});

app.get('/users/:id', verifyToken, (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
});

// Events endpoint
app.get('/events', (req, res) => {
  res.json(events);
});

// POST /events - Create a new event
app.post('/events', (req, res) => {
  const { judul, deskripsi, tanggal, lokasi } = req.body;
  if (!judul || !deskripsi || !tanggal || !lokasi) {
    return res.status(400).json({ message: 'Semua field harus diisi.' });
  }
  const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
  const newEvent = { id: newId, judul, deskripsi, tanggal, lokasi };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// PUT /events/:id - Update an existing event
app.put('/events/:id', (req, res) => {
  const eventId = parseInt(req.params.id);
  const eventIndex = events.findIndex(e => e.id === eventId);
  if (eventIndex === -1) {
    return res.status(404).json({ message: 'Event tidak ditemukan.' });
  }
  const { judul, deskripsi, tanggal, lokasi } = req.body;
  if (!judul || !deskripsi || !tanggal || !lokasi) {
    return res.status(400).json({ message: 'Semua field harus diisi.' });
  }
  events[eventIndex] = { id: eventId, judul, deskripsi, tanggal, lokasi };
  res.json(events[eventIndex]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log('GET    /shifts');
  console.log('GET    /shifts/:id');
  console.log('POST   /shifts');
  console.log('PUT    /shifts/:id');
  console.log('DELETE /shifts/:id');
  console.log('GET    /users');
  console.log('GET    /users/count-by-role');
  console.log('GET    /users/count-by-gender');
  console.log('GET    /users/:id');
  console.log('GET    /events');
  console.log('POST   /events');
  console.log('PUT    /events/:id');
});
