import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from './models/User';
import { generateToken } from './utils/generateToken';

// Load environment variables
dotenv.config();

async function runTests() {
  let mongoServer: MongoMemoryServer | null = null;
  let uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/8-pool';

  console.log('Attempting database connection...');

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`✅ Connected to MongoDB successfully at: ${uri}`);
  } catch (error: any) {
    console.log(`⚠️ Local MongoDB connection failed or timed out: ${error.message}`);
    console.log('Starting MongoMemoryServer for a self-contained in-memory database test...');

    try {
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
      await mongoose.connect(uri);
      console.log('✅ Connected to in-memory MongoDB server successfully.');
    } catch (memError: any) {
      console.error('❌ Failed to start and connect to MongoMemoryServer:', memError.message);
      process.exit(1);
    }
  }

  try {
    // 1. Clean up old test data (if using local database)
    await User.deleteMany({ username: /^test_/ });
    console.log('🧹 Cleaned up old test users.');

    // 2. Test User Creation
    console.log('\n--- Test 1: Creating a Valid User ---');
    const validUser = await User.create({
      username: 'test_player',
      email: 'test_player@pool.com',
      password: 'password123'
    });
    console.log('✅ Created user:', {
      id: validUser._id,
      username: validUser.username,
      email: validUser.email,
      coins: validUser.coins,
      xp: validUser.xp,
      wins: validUser.wins,
      losses: validUser.losses,
      rank: validUser.rank,
      createdAt: validUser.createdAt,
    });

    // 3. Test Username Length Validation (Min length: 3)
    console.log('\n--- Test 2: Validating Short Username ---');
    try {
      await User.create({
        username: 'te',
        email: 'te@pool.com',
        password: 'password123'
      });
      console.log('❌ Failed: Should not have allowed creation of username shorter than 3 characters.');
    } catch (err: any) {
      console.log('✅ Success: Properly rejected short username. Error message:', err.message);
    }

    // 4. Test Integer Validation for wins
    console.log('\n--- Test 3: Validating Non-Integer wins ---');
    try {
      await User.create({
        username: 'test_decimal',
        email: 'test_decimal@pool.com',
        password: 'password123',
        wins: 2.5
      });
      console.log('❌ Failed: Should not have allowed decimal for wins.');
    } catch (err: any) {
      console.log('✅ Success: Properly rejected decimal value. Error message:', err.message);
    }

    // 5. Test Negative Value Validation
    console.log('\n--- Test 4: Validating Negative losses ---');
    try {
      await User.create({
        username: 'test_negative',
        email: 'test_negative@pool.com',
        password: 'password123',
        losses: -1
      });
      console.log('❌ Failed: Should not have allowed negative value for losses.');
    } catch (err: any) {
      console.log('✅ Success: Properly rejected negative value. Error message:', err.message);
    }

    // 6. Test Token Generation
    console.log('\n--- Test 5: Generating Auth Token ---');
    const token = generateToken(validUser._id.toString(), validUser.username);
    console.log('✅ Generated JWT Token successfully:');
    console.log(`🔑 Token: ${token}`);

  } catch (error: any) {
    console.error('❌ Unexpected error during testing:', error.message);
  } finally {
    // Disconnect
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
      console.log('🛑 In-memory database server stopped.');
    }
    console.log('\n🔌 Disconnected from MongoDB. Tests finished.');
  }
}

runTests();
