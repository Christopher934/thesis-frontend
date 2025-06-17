'use client';

// This helper function sets up a default user in localStorage for testing purposes
// It ensures the dropdown options always have a user with a valid role to filter by
export function setupTestUser() {
  // Only run on the client side
  if (typeof window === 'undefined') return;

  // Check if user data already exists
  const existingUser = localStorage.getItem('user');
  if (!existingUser) {
    // Create a default user for testing
    const defaultUser = {
      id: 1,
      username: "PEG001",
      email: "andi@rsud.com",
      namaDepan: "Andi",
      namaBelakang: "Pratama",
      role: "DOKTER",
      status: "ACTIVE"
    };
    
    localStorage.setItem('user', JSON.stringify(defaultUser));
    console.log('Default test user set up in localStorage');
  }
}
