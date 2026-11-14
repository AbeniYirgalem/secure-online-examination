import { app } from '../server.js';
import User from '../models/User.js';
import Examination from '../models/Examination.js';
import { generateToken } from './jwt.js';

const BASE_URL = 'http://localhost:5000/api/examinations';

async function runExaminationTests() {
  console.log('========================================================');
  console.log('  SOES STEP 7: EXAMINATION MANAGEMENT SECURITY TESTS   ');
  console.log('========================================================\n');

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

  // Ensure server is listening
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
    throw new Error('Server not responding');
  }

  try {
    // Setup Test Users in Database
    // 1. Instructor 1
    let instructor1 = await User.findOne({ email: 'instructor1@university.edu' });
    if (!instructor1) {
      instructor1 = await User.create({
        name: 'Dr. Alan Turing',
        email: 'instructor1@university.edu',
        password: 'Password123!',
        role: 'INSTRUCTOR',
        isActive: true,
      });
    }
    const tokenInst1 = generateToken(instructor1);

    // 2. Instructor 2
    let instructor2 = await User.findOne({ email: 'instructor2@university.edu' });
    if (!instructor2) {
      instructor2 = await User.create({
        name: 'Dr. Ada Lovelace',
        email: 'instructor2@university.edu',
        password: 'Password123!',
        role: 'INSTRUCTOR',
        isActive: true,
      });
    }
    const tokenInst2 = generateToken(instructor2);

    // 3. Student 1
    let student1 = await User.findOne({ email: 'student.exam@university.edu' });
    if (!student1) {
      student1 = await User.create({
        name: 'Sam Student',
        email: 'student.exam@university.edu',
        password: 'Password123!',
        role: 'STUDENT',
        isActive: true,
      });
    }
    const tokenStudent = generateToken(student1);

    const now = new Date();
    const activeStart = new Date(now.getTime() - 10 * 60 * 1000).toISOString(); // 10 mins ago
    const activeEnd = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // in 1 hour

    let createdExamId = null;

    // 1 & 2. Instructor can create an examination; examination is created as DRAFT
    const createRes = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Network Security Midterm',
        description: 'Comprehensive evaluation of protocols and cryptography.',
        duration: 45,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 5,
        questions: [],
      }),
    });
    const createData = await createRes.json();
    createdExamId = createData.data?.examination?._id;

    assert(
      createRes.status === 201 &&
        createData.success &&
        createData.data.examination.status === 'DRAFT' &&
        createData.data.examination.instructor === instructor1._id.toString(),
      '1 & 2. Instructor creates examination and initial status is strictly DRAFT'
    );

    // 3. Instructor can add multiple-choice questions (exactly 4 options, valid correctAnswer, positive marks)
    const validQuestions = [
      {
        questionText: 'Which protocol secures web HTTP traffic?',
        options: ['FTP', 'HTTPS', 'SMTP', 'TELNET'],
        correctAnswer: 'HTTPS',
        marks: 5,
      },
      {
        questionText: 'What key length does AES-256 use?',
        options: ['128 bits', '192 bits', '256 bits', '512 bits'],
        correctAnswer: '256 bits',
        marks: 5,
      },
    ];

    const updateQRes = await fetch(`${BASE_URL}/${createdExamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Network Security Midterm',
        duration: 45,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 5,
        questions: validQuestions,
      }),
    });
    const updateQData = await updateQRes.json();

    assert(
      updateQRes.status === 200 &&
        updateQData.success &&
        updateQData.data.examination.questions.length === 2 &&
        updateQData.data.examination.totalMarks === 10,
      '3. Instructor adds valid MCQs and totalMarks is auto-calculated correctly (10 marks)'
    );

    // 4. Instructor can update their own examination
    const updateOwnRes = await fetch(`${BASE_URL}/${createdExamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Network Security Midterm (Updated Edition)',
        duration: 50,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 5,
        questions: validQuestions,
      }),
    });
    const updateOwnData = await updateOwnRes.json();
    assert(
      updateOwnRes.status === 200 &&
        updateOwnData.data.examination.title === 'Network Security Midterm (Updated Edition)' &&
        updateOwnData.data.examination.duration === 50,
      '4. Instructor successfully updates own examination metadata'
    );

    // 5. Instructor cannot update another instructor's examination
    const updateOtherRes = await fetch(`${BASE_URL}/${createdExamId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst2}`, // Instructor 2 token
      },
      body: JSON.stringify({
        title: 'Malicious Hijack Attempt',
        duration: 50,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 5,
        questions: validQuestions,
      }),
    });
    assert(
      updateOtherRes.status === 403,
      '5. Instructor cannot update another instructor examination (403 Forbidden)'
    );

    // 6. Instructor can publish a valid examination
    const publishRes = await fetch(`${BASE_URL}/${createdExamId}/publish`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenInst1}`,
      },
    });
    const publishData = await publishRes.json();
    assert(
      publishRes.status === 200 &&
        publishData.success &&
        publishData.data.examination.status === 'PUBLISHED',
      '6. Instructor successfully publishes complete examination (status: PUBLISHED)'
    );

    // 7. Invalid examination data is rejected
    // 7a. Options count not 4
    const badOptionsRes = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Invalid Question Exam',
        duration: 30,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 2,
        questions: [
          {
            questionText: 'Missing options question',
            options: ['Opt 1', 'Opt 2'], // Only 2 options
            correctAnswer: 'Opt 1',
            marks: 2,
          },
        ],
      }),
    });
    assert(
      badOptionsRes.status === 400,
      '7a. Rejected question with fewer than 4 options'
    );

    // 7b. Correct answer not in options
    const badCorrectRes = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Mismatched Answer Exam',
        duration: 30,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 2,
        questions: [
          {
            questionText: 'Mismatch question',
            options: ['A', 'B', 'C', 'D'],
            correctAnswer: 'E', // Not in options
            marks: 2,
          },
        ],
      }),
    });
    assert(
      badCorrectRes.status === 400,
      '7b. Rejected question where correctAnswer is not in options'
    );

    // 7c. End time before start time
    const badTimingRes = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenInst1}`,
      },
      body: JSON.stringify({
        title: 'Reverse Timing Exam',
        duration: 30,
        startTime: activeEnd,
        endTime: activeStart, // End is before start
        passingMarks: 0,
        questions: [],
      }),
    });
    assert(
      badTimingRes.status === 400,
      '7c. Rejected examination where endTime <= startTime'
    );

    // 8. Students cannot create examinations
    const studentCreateRes = await fetch(`${BASE_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent}`,
      },
      body: JSON.stringify({
        title: 'Student Attempted Exam',
        duration: 30,
        startTime: activeStart,
        endTime: activeEnd,
        passingMarks: 0,
      }),
    });
    assert(
      studentCreateRes.status === 403,
      '8. Students blocked from creating examinations (403 RBAC)'
    );

    // 9. Students cannot access instructor-only endpoints
    const studentListRes = await fetch(`${BASE_URL}/my`, {
      headers: {
        Authorization: `Bearer ${tokenStudent}`,
      },
    });
    assert(
      studentListRes.status === 403,
      '9. Students blocked from instructor /my endpoint (403 RBAC)'
    );

    // 10. Students cannot see correct answers
    const studentAvailRes = await fetch(`${BASE_URL}/available`, {
      headers: {
        Authorization: `Bearer ${tokenStudent}`,
      },
    });
    const studentAvailData = await studentAvailRes.json();
    const publishedExam = studentAvailData.data.examinations.find(
      (e) => e._id === createdExamId
    );

    const hasCorrectAnswer = publishedExam?.questions?.some(
      (q) => q.correctAnswer !== undefined
    );

    assert(
      studentAvailRes.status === 200 &&
        Boolean(publishedExam) &&
        !hasCorrectAnswer,
      '10. Students receive available exam with correctAnswer fields strictly removed'
    );

    // 11. Unpublished examinations (DRAFT) do not appear in available endpoint
    const draftExam = await Examination.create({
      title: 'Secret Draft Exam',
      instructor: instructor1._id,
      duration: 30,
      startTime: activeStart,
      endTime: activeEnd,
      passingMarks: 0,
      status: 'DRAFT',
      questions: [],
    });

    const checkDraftRes = await fetch(`${BASE_URL}/available`, {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    const checkDraftData = await checkDraftRes.json();
    const draftFound = checkDraftData.data.examinations.some(
      (e) => e._id === draftExam._id.toString()
    );

    assert(
      !draftFound,
      '11. Unpublished DRAFT examinations do not appear in available endpoint'
    );

    // 12. Examinations outside scheduled availability are not accessible
    const futureStart = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // tomorrow
    const futureEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

    const futureExam = await Examination.create({
      title: 'Future Scheduled Exam',
      instructor: instructor1._id,
      duration: 30,
      startTime: futureStart,
      endTime: futureEnd,
      passingMarks: 0,
      status: 'PUBLISHED',
      questions: [
        {
          questionText: 'Future Question?',
          options: ['1', '2', '3', '4'],
          correctAnswer: '1',
          marks: 1,
        },
      ],
    });

    const checkFutureRes = await fetch(`${BASE_URL}/available`, {
      headers: { Authorization: `Bearer ${tokenStudent}` },
    });
    const checkFutureData = await checkFutureRes.json();
    const futureFound = checkFutureData.data.examinations.some(
      (e) => e._id === futureExam._id.toString()
    );

    assert(
      !futureFound,
      '12. Examinations outside scheduled availability window are not accessible'
    );

    // 13. Invalid examination IDs are handled correctly
    const malformedIdRes = await fetch(`${BASE_URL}/invalid-id-123`, {
      headers: { Authorization: `Bearer ${tokenInst1}` },
    });
    assert(
      malformedIdRes.status === 400,
      '13a. Malformed examination ID rejected with 400'
    );

    const nonExistentIdRes = await fetch(
      `${BASE_URL}/507f1f77bcf86cd799439011`,
      {
        headers: { Authorization: `Bearer ${tokenInst1}` },
      }
    );
    assert(
      nonExistentIdRes.status === 404,
      '13b. Non-existent valid ObjectId returns 404 Not Found'
    );

    console.log('\n--------------------------------------------------------');
    console.log(`TOTAL TESTS: 13 | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
    console.log('--------------------------------------------------------');

    if (testsFailed === 0) {
      console.log('>>> ALL 13 EXAMINATION SECURITY TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error('>>> SOME EXAMINATION SECURITY TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runExaminationTests();

