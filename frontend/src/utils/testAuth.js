// Temporary test utility to simulate admin login for testing frontend logic
export const simulateAdminLogin = () => {
  // Create a mock JWT payload with admin role
  const mockPayload = {
    sub: "admin@test.com",
    roles: ["ADMIN"],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  // Create a mock JWT token (just for frontend testing)
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = btoa(JSON.stringify(mockPayload));
  const signature = "mock-signature";
  const mockToken = `${header}.${payload}.${signature}`;

  // Create user data
  const userData = {
    email: mockPayload.sub,
    roles: mockPayload.roles
  };

  // Store in localStorage
  localStorage.setItem('token', mockToken);
  localStorage.setItem('user', JSON.stringify(userData));

  console.log('Mock admin login simulated:', userData);
  return { token: mockToken, user: userData };
};

export const clearMockAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Mock auth cleared');
};