import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import http from 'http';
import app from './app';

dotenv.config();

async function runApiTests() {
  let mongoServer: MongoMemoryServer | null = null;
  let server: http.Server | null = null;
  let port = 0;

  console.log('🚀 Starting integration tests for Complete Authentication system...');

  try {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB database.');

    server = app.listen(0, () => {
      const address = server?.address();
      port = typeof address === 'string' ? 0 : address?.port || 0;
      console.log(`✅ Test server running on port ${port}`);
      
      executeTests(port)
        .catch((err) => {
          console.error('❌ Test execution failed:', err);
          cleanup(server, mongoServer);
        })
        .then(() => {
          cleanup(server, mongoServer);
        });
    });

  } catch (error: any) {
    console.error('❌ Failed to start test environment:', error.message);
    cleanup(server, mongoServer);
  }
}

async function executeTests(port: number) {
  const baseUrl = `http://localhost:${port}`;
  let validToken = '';

  // --- Test 1: Register New User ---
  console.log('\n--- Test 1: POST /api/users (Register New User) ---');
  const registerRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'CueMaster',
      email: 'cuemaster@pool.com',
      password: 'securePassword123'
    }),
  });

  const registerData = await registerRes.json();
  console.log('Response Status:', registerRes.status);
  console.log('Response Data:', registerData);

  if (registerRes.status === 201 && registerData.email === 'cuemaster@pool.com' && registerData.coins === 1000) {
    console.log('✅ POST /api/users Success: User registered with bcrypt password and initial stats.');
  } else {
    throw new Error(`POST /api/users Failed with status ${registerRes.status}`);
  }

  // --- Test 2: Validation Check (Invalid Email) ---
  console.log('\n--- Test 2: POST /api/users Validation (Invalid Email) ---');
  const badEmailRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'CueMaster2',
      email: 'invalid-email-format',
      password: 'securePassword123'
    }),
  });

  const badEmailData = await badEmailRes.json();
  console.log('Response Status:', badEmailRes.status);
  console.log('Response Data:', badEmailData);

  if (badEmailRes.status === 400 && badEmailData.error.includes('email')) {
    console.log('✅ POST /api/users Success: Properly rejected invalid email format.');
  } else {
    throw new Error(`POST /api/users Validation Failed. Expected status 400 for bad email, got ${badEmailRes.status}`);
  }

  // --- Test 3: Validation Check (Short Password) ---
  console.log('\n--- Test 3: POST /api/users Validation (Short Password) ---');
  const badPasswordRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'CueMaster3',
      email: 'cuemaster3@pool.com',
      password: '123'
    }),
  });

  const badPasswordData = await badPasswordRes.json();
  console.log('Response Status:', badPasswordRes.status);
  console.log('Response Data:', badPasswordData);

  if (badPasswordRes.status === 400 && badPasswordData.error.includes('Password')) {
    console.log('✅ POST /api/users Success: Properly rejected short password.');
  } else {
    throw new Error(`POST /api/users Validation Failed. Expected status 400 for short password, got ${badPasswordRes.status}`);
  }

  // --- Test 4: Validation Check (Duplicate Username) ---
  console.log('\n--- Test 4: POST /api/users Validation (Duplicate Username) ---');
  const duplicateUserRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'CueMaster',
      email: 'different-email@pool.com',
      password: 'securePassword123'
    }),
  });

  const duplicateUserData = await duplicateUserRes.json();
  console.log('Response Status:', duplicateUserRes.status);
  console.log('Response Data:', duplicateUserData);

  if (duplicateUserRes.status === 400 && duplicateUserData.error.includes('Username')) {
    console.log('✅ POST /api/users Success: Properly rejected duplicate username.');
  } else {
    throw new Error(`POST /api/users Validation Failed. Expected status 400 for duplicate username, got ${duplicateUserRes.status}`);
  }

  // --- Test 5: Login User Success (Bcrypt check) ---
  console.log('\n--- Test 5: POST /api/users/login (Login Success) ---');
  const loginRes = await fetch(`${baseUrl}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'cuemaster@pool.com',
      password: 'securePassword123'
    }),
  });

  const loginData = await loginRes.json();
  console.log('Response Status:', loginRes.status);
  console.log('Response Data:', loginData);

  if (loginRes.status === 200 && loginData.token) {
    validToken = loginData.token;
    console.log('✅ POST /api/users/login Success: Authenticated with bcrypt verify.');
  } else {
    throw new Error(`POST /api/users/login Failed with status ${loginRes.status}`);
  }

  // --- Test 6: Login User Failure (Bcrypt check) ---
  console.log('\n--- Test 6: POST /api/users/login (Login Failure - Bad Password) ---');
  const badLoginRes = await fetch(`${baseUrl}/api/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'cuemaster@pool.com',
      password: 'wrongPassword'
    }),
  });

  const badLoginData = await badLoginRes.json();
  console.log('Response Status:', badLoginRes.status);
  console.log('Response Data:', badLoginData);

  if (badLoginRes.status === 401 && badLoginData.error === 'Invalid credentials') {
    console.log('✅ POST /api/users/login Success: Properly rejected incorrect password.');
  } else {
    throw new Error(`POST /api/users/login Expected 401, got ${badLoginRes.status}`);
  }

  // --- Test 7: GET /api/users/me (No Token) ---
  console.log('\n--- Test 7: GET /api/users/me (No Token) ---');
  const meNoTokenRes = await fetch(`${baseUrl}/api/users/me`);
  const meNoTokenData = await meNoTokenRes.json();
  console.log('Response Status:', meNoTokenRes.status);
  console.log('Response Data:', meNoTokenData);

  if (meNoTokenRes.status === 401 && meNoTokenData.message === 'Not authorized, no token') {
    console.log('✅ GET /api/users/me Success: Properly rejected request without token.');
  } else {
    throw new Error(`GET /api/users/me Expected 401, got ${meNoTokenRes.status}`);
  }

  // --- Test 8: GET /api/users/me (Valid Token) ---
  console.log('\n--- Test 8: GET /api/users/me (Valid Token) ---');
  const meValidTokenRes = await fetch(`${baseUrl}/api/users/me`, {
    headers: { 'Authorization': `Bearer ${validToken}` }
  });
  const meValidTokenData = await meValidTokenRes.json();
  console.log('Response Status:', meValidTokenRes.status);
  console.log('Response Data:', meValidTokenData);

  if (meValidTokenRes.status === 200 && meValidTokenData.username === 'CueMaster') {
    console.log('✅ GET /api/users/me Success: Successfully fetched authenticated user profile with stats.');
  } else {
    throw new Error(`GET /api/users/me Expected 200, got ${meValidTokenRes.status}`);
  }
}

function cleanup(server: http.Server | null, mongoServer: MongoMemoryServer | null) {
  console.log('\n🧹 Cleaning up test server and database...');
  if (server) {
    server.close(() => {
      console.log('🛑 Express test server stopped.');
    });
  }
  if (mongoose.connection.readyState !== 0) {
    mongoose.disconnect().then(() => {
      console.log('🔌 Disconnected from mongoose.');
      if (mongoServer) {
        mongoServer.stop().then(() => {
          console.log('🛑 In-memory MongoDB stopped.');
          console.log('\n🎉 All API tests concluded successfully.');
        });
      }
    });
  }
}

runApiTests();
