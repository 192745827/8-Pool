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

  console.log('🚀 Starting integration tests for Register/Login API...');

  try {
    // 1. Setup in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory MongoDB database.');

    // 2. Start Express app on a free port
    server = app.listen(0, () => {
      const address = server?.address();
      port = typeof address === 'string' ? 0 : address?.port || 0;
      console.log(`✅ Test server running on port ${port}`);
      
      // Run the actual API tests once server is listening
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

  // --- Test 1: Register/Login New User ---
  console.log('\n--- Test 1: POST /api/users (Register/Login New User) ---');
  const registerRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'CueMaster' }),
  });

  const registerData = await registerRes.json();
  console.log('Response Status:', registerRes.status);
  console.log('Response Data:', registerData);

  if (registerRes.status === 200 && registerData.username === 'CueMaster') {
    console.log('✅ POST /api/users Success: User registered/logged in.');
  } else {
    throw new Error(`POST /api/users Failed with status ${registerRes.status}`);
  }

  // --- Test 2: Validation Check (Too Short Username) ---
  console.log('\n--- Test 2: POST /api/users Validation (Short Username) ---');
  const badRes = await fetch(`${baseUrl}/api/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'ab' }),
  });

  const badData = await badRes.json();
  console.log('Response Status:', badRes.status);
  console.log('Response Data:', badData);

  if (badRes.status === 400 && badData.error) {
    console.log('✅ POST /api/users Success: Properly rejected short username.');
  } else {
    throw new Error(`POST /api/users Validation Failed. Expected status 400, got ${badRes.status}`);
  }

  // --- Test 3: Get User Stats ---
  console.log('\n--- Test 3: GET /api/users/:username (Get User Stats) ---');
  const getStatsRes = await fetch(`${baseUrl}/api/users/CueMaster`);
  const getStatsData = await getStatsRes.json();
  console.log('Response Status:', getStatsRes.status);
  console.log('Response Data:', getStatsData);

  if (getStatsRes.status === 200 && getStatsData.username === 'CueMaster') {
    console.log('✅ GET /api/users/:username Success: Player statistics fetched.');
  } else {
    throw new Error(`GET /api/users/:username Failed with status ${getStatsRes.status}`);
  }

  // --- Test 4: Get Non-Existent User Stats ---
  console.log('\n--- Test 4: GET /api/users/:username (Non-Existent User) ---');
  const badStatsRes = await fetch(`${baseUrl}/api/users/DoesNotExist`);
  const badStatsData = await badStatsRes.json();
  console.log('Response Status:', badStatsRes.status);
  console.log('Response Data:', badStatsData);

  if (badStatsRes.status === 404) {
    console.log('✅ GET /api/users/:username Success: Properly returned 404.');
  } else {
    throw new Error(`GET /api/users/:username Expected 404, got ${badStatsRes.status}`);
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
