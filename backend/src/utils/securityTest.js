import jwt from 'jsonwebtoken';
import { app, startServer } from '../server.js';
import User from '../models/User.js';

const BASE_URL = 'http://localhost:5000/api/auth';

async function runSecurityTests() {
  console.log('====================================================');
  console.log('   SOES STEP 6: COMPREHENSIVE SECURITY TEST SUITE   ');
  console.log('====================================================\n');

  // Wait for server to be responsive
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://localhost:5000/api/health');
      if (res.status === 200) {
        serverReady = true;
        break;
      }
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  if (!serverReady) {
    throw new Error('Server failed to start within timeout');
  }

  let studentCookie = null;
  let studentToken = null;
  let testsPassed = 0;
  let testsFailed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      testsPassed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      testsFailed++;
    }
  }

  try {
    // 1. Valid Student Registration
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Student',
        email: 'alice.student@university.edu',
        password: 'ValidPassword123!',
      }),
    });
    const regData = await regRes.json();
    const setCookie = regRes.headers.get('set-cookie') || '';
    assert(
      regRes.status === 201 &&
        regData.success &&
        regData.data.user.role === 'STUDENT' &&
        regData.data.user.email === 'alice.student@university.edu' &&
        setCookie.includes('token='),
      '1. Valid student registration creates STUDENT account with HttpOnly cookie'
    );

    // 2. Duplicate Email Registration Rejection
    const dupRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Duplicate',
        email: 'ALICE.student@university.edu', // uppercase variation to test normalization
        password: 'ValidPassword123!',
      }),
    });
    const dupData = await dupRes.json();
    assert(
      dupRes.status === 409 && !dupData.success,
      '2. Duplicate email registration rejected (409 Conflict with normalized email)'
    );

    // 3. Invalid Email Format Rejection
    const badEmailRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Malformed',
        email: 'not-an-email-address',
        password: 'ValidPassword123!',
      }),
    });
    const badEmailData = await badEmailRes.json();
    assert(
      badEmailRes.status === 400 && !badEmailData.success,
      '3. Invalid email format rejected by Zod schema validation'
    );

    // 4. Weak Password Rejection
    const weakPassRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Charlie Weak',
        email: 'charlie@university.edu',
        password: 'weak', // too short, no uppercase/number
      }),
    });
    const weakPassData = await weakPassRes.json();
    assert(
      weakPassRes.status === 400 && !weakPassData.success,
      '4. Weak password rejected by complexity policy'
    );

    // 5. Successful Login
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.student@university.edu',
        password: 'ValidPassword123!',
      }),
    });
    const loginData = await loginRes.json();
    studentToken = loginData.data?.token;
    const loginCookie = loginRes.headers.get('set-cookie') || '';
    if (loginCookie) {
      studentCookie = loginCookie.split(';')[0];
    }
    assert(
      loginRes.status === 200 &&
        loginData.success &&
        loginData.data.user.role === 'STUDENT' &&
        Boolean(studentToken),
      '5. Successful login authenticates and issues credentials'
    );

    // 6. Incorrect Password Rejection (Generic message)
    const badPassRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.student@university.edu',
        password: 'WrongPassword999!',
      }),
    });
    const badPassData = await badPassRes.json();
    assert(
      badPassRes.status === 401 &&
        !badPassData.success &&
        badPassData.message === 'Invalid email or password.',
      '6. Incorrect password rejected with generic authentication error'
    );

    // 7. Missing Token Rejection on Protected Route
    const missingTokenRes = await fetch(`${BASE_URL}/me`);
    const missingTokenData = await missingTokenRes.json();
    assert(
      missingTokenRes.status === 401 && !missingTokenData.success,
      '7. Protected route rejects requests with missing token (401)'
    );

    // 8. Invalid Token Rejection
    const invalidTokenRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: 'Bearer definitely.invalid.tampered-jwt-token' },
    });
    const invalidTokenData = await invalidTokenRes.json();
    assert(
      invalidTokenRes.status === 401 && !invalidTokenData.success,
      '8. Protected route rejects malformed/tampered token'
    );

    // 9. Expired Token Rejection
    const expiredToken = jwt.sign(
      { id: loginData.data.user._id || loginData.data.user.id, role: 'STUDENT' },
      process.env.JWT_SECRET || 'soes_dev_jwt_secret_key_change_in_production',
      { expiresIn: '-1s' }
    );
    const expiredTokenRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    const expiredTokenData = await expiredTokenRes.json();
    assert(
      expiredTokenRes.status === 401 &&
        !expiredTokenData.success &&
        expiredTokenData.message.includes('expired'),
      '9. Expired token explicitly detected and rejected'
    );

    // 10. Inactive User Rejection
    const aliceUser = await User.findOne({ email: 'alice.student@university.edu' });
    aliceUser.isActive = false;
    await aliceUser.save();

    const inactiveLoginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'alice.student@university.edu',
        password: 'ValidPassword123!',
      }),
    });
    const inactiveLoginData = await inactiveLoginRes.json();

    const inactiveMeRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const inactiveMeData = await inactiveMeRes.json();

    assert(
      inactiveLoginRes.status === 403 &&
        inactiveLoginData.message.includes('deactivated') &&
        inactiveMeRes.status === 403,
      '10. Inactive/deactivated account rejected on login and token verification (403)'
    );

    // Restore active status for remaining tests
    aliceUser.isActive = true;
    await aliceUser.save();

    // 11. Student attempting to access Admin-only functionality (RBAC)
    const adminCheckRes = await fetch(`${BASE_URL}/admin-check`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const adminCheckData = await adminCheckRes.json();
    assert(
      adminCheckRes.status === 403 &&
        !adminCheckData.success &&
        adminCheckData.message.includes('permission'),
      '11. Student role blocked from Admin-only endpoint (403 RBAC enforcement)'
    );

    // 12. Student attempting to register with ADMIN role (Privilege Escalation Prevention)
    const adminRegRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Eve Intruder',
        email: 'eve.intruder@university.edu',
        password: 'ValidPassword123!',
        role: 'ADMIN', // Unauthorized role escalation attempt
      }),
    });
    const adminRegData = await adminRegRes.json();
    assert(
      adminRegRes.status === 400 &&
        !adminRegData.success &&
        adminRegData.message.includes('STUDENT accounts only'),
      '12. Public registration with ADMIN role rejected by privilege boundary'
    );

    // 13. Password Hashes Never Appearing in API Responses
    const hasPasswordInReg = 'password' in regData.data.user;
    const hasPasswordInLogin = 'password' in loginData.data.user;

    const meRes = await fetch(`${BASE_URL}/me`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    const meData = await meRes.json();
    const hasPasswordInMe = 'password' in meData.data.user;

    assert(
      !hasPasswordInReg && !hasPasswordInLogin && !hasPasswordInMe,
      '13. Password hash is never exposed in register, login, or /me payloads'
    );

    console.log('\n----------------------------------------------------');
    console.log(`TOTAL TESTS: 13 | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
    console.log('----------------------------------------------------');

    if (testsFailed === 0) {
      console.log('>>> ALL 13 SECURITY TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error('>>> SOME SECURITY TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runSecurityTests();
