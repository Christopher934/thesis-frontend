# JWT Payload Structure - RSUD Anugerah Hospital Management System

## 🔐 **JWT Token Generation & Structure**

### **1. JWT Payload yang Dibuat oleh Backend**

Berdasarkan implementasi di `auth.service.ts`, berikut adalah struktur payload JWT:

```typescript
// Payload yang ditandatangani dalam JWT
const payload = { 
  sub: user.id,    // Subject: ID pengguna dari database
  role: user.role  // Role pengguna (ADMIN, SUPERVISOR, DOKTER, PERAWAT, STAF)
};

// JWT dibuat dengan konfigurasi:
// - Secret: 'MY_STRONGER_SECRET_KEY_FOR_RSUD_ANUGERAH_APP' 
// - Expiration: 7 hari ('7d')
const token = this.jwtService.sign(payload);
```

### **2. Response Login dari Backend**

Ketika login berhasil, backend mengembalikan struktur data ini:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin@rsud.id", 
    "namaDepan": "Administrator",
    "namaBelakang": "RSUD",
    "email": "admin@rsud.id",
    "role": "ADMIN"
  }
}
```

### **3. Decoded JWT Payload Structure**

Ketika JWT token di-decode, payload berisi:

```json
{
  "sub": 1,           // User ID (subject)
  "role": "ADMIN",    // User role
  "iat": 1736116123,  // Issued at (timestamp)
  "exp": 1736721323   // Expiration (timestamp)
}
```

## 🛡️ **JWT Authentication Flow**

### **4. Token Validation di Guards**

Di `jwt-auth.guard.ts`, token diverifikasi dan user info ditambahkan ke request:

```typescript
// Setelah token diverifikasi, object ini ditambahkan ke request
request.user = {
  userId: decoded.sub,  // ID pengguna (consistency)
  id: decoded.sub,      // ID pengguna (backward compatibility) 
  role: decoded.role    // Role pengguna
};
```

### **5. Penggunaan di Controllers**

Di controller, data user diakses melalui `@Request() req`:

```typescript
// Contoh penggunaan di controller
@Post('some-endpoint')
async someMethod(@Request() req: any) {
  const userId = req.user?.userId || req.user?.id;  // Mengambil user ID
  const userRole = req.user?.role;                  // Mengambil user role
  
  // Logic berdasarkan user data...
}
```

## 📋 **Complete JWT Examples**

### **6. Contoh Token untuk Admin**

```typescript
// Payload sebelum encoding:
{
  "sub": 1,
  "role": "ADMIN",
  "iat": 1736116123,
  "exp": 1736721323
}

// Encoded JWT Token:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsInJvbGUiOiJBRE1JTiIsImlhdCI6MTczNjExNjEyMywiZXhwIjoxNzM2NzIxMzIzfQ.signature_here"
```

### **7. Contoh Token untuk Perawat**

```typescript
// Payload sebelum encoding:
{
  "sub": 5,
  "role": "PERAWAT", 
  "iat": 1736116123,
  "exp": 1736721323
}

// Encoded JWT Token:
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjUsInJvbGUiOiJQRVJBV0FUIiwiaWF0IjoxNzM2MTE2MTIzLCJleHAiOjE3MzY3MjEzMjN9.signature_here"
```

## 🔧 **Frontend Integration**

### **8. Penyimpanan Token di Frontend**

```typescript
// localStorage
localStorage.setItem('token', response.access_token);
localStorage.setItem('role', response.user.role);

// Cookies (untuk SSR)
Cookies.set('token', response.access_token, { 
  expires: 1, 
  path: '/', 
  sameSite: 'strict' 
});
```

### **9. Pengiriman Token dalam HTTP Requests**

```typescript
// Headers untuk authenticated requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};

// Contoh fetch dengan authentication
const response = await fetch(`${apiUrl}/some-endpoint`, {
  method: 'GET',
  headers: headers
});
```

## 📊 **Role-Based Access Control**

### **10. Available Roles**

```typescript
enum Role {
  ADMIN = 'ADMIN',          // Administrator sistem
  SUPERVISOR = 'SUPERVISOR', // Supervisor/Manager
  DOKTER = 'DOKTER',        // Dokter
  PERAWAT = 'PERAWAT',      // Perawat
  STAF = 'STAF'             // Staff umum
}
```

### **11. Role-Based Endpoint Access**

```typescript
// Contoh penggunaan role di controller dengan decorator
@Post('admin-only-endpoint')
@Roles('ADMIN')
async adminOnlyMethod(@Request() req: any) {
  // Hanya user dengan role ADMIN yang bisa akses
}

@Post('healthcare-staff-endpoint') 
@Roles('ADMIN', 'SUPERVISOR', 'DOKTER', 'PERAWAT')
async healthcareStaffMethod(@Request() req: any) {
  // User dengan role healthcare bisa akses
}
```

## 🔍 **Token Validation Process**

### **12. Complete Authentication Flow**

```typescript
// 1. Login Request
POST /auth/login
{
  "email": "admin@rsud.id",
  "password": "password123"
}

// 2. Token Generation (Backend)
const payload = { sub: user.id, role: user.role };
const token = jwtService.sign(payload);

// 3. Response to Frontend
{
  "access_token": "eyJhbGci...",
  "user": { ... }
}

// 4. Frontend stores token
localStorage.setItem('token', access_token);

// 5. Subsequent requests include token
Authorization: Bearer eyJhbGci...

// 6. Backend validates token (JwtAuthGuard)
const decoded = jwtService.verify(token);
request.user = { userId: decoded.sub, role: decoded.role };

// 7. Controller receives authenticated request
@UseGuards(JwtAuthGuard)
async someMethod(@Request() req) {
  const userId = req.user.userId; // Available!
  const role = req.user.role;     // Available!
}
```

---

## 📝 **Summary**

- **JWT Payload**: `{ sub: userId, role: userRole }`
- **Token Expiry**: 7 days
- **Secret Key**: `MY_STRONGER_SECRET_KEY_FOR_RSUD_ANUGERAH_APP`
- **Header Format**: `Authorization: Bearer <token>`
- **Decoded Access**: `req.user.userId`, `req.user.role`
- **Roles**: ADMIN, SUPERVISOR, DOKTER, PERAWAT, STAF

*Dokumentasi ini berdasarkan implementasi aktual di RSUD Anugerah Hospital Management System*
