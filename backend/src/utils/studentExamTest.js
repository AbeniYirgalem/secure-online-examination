import { app } from '../server.js';
import User from '../models/User.js';
import Examination from '../models/Examination.js';
import ExaminationAttempt from '../models/ExaminationAttempt.js';
import { generateToken } from './jwt.js';

const BASE_URL = 'http://localhost:5000/api/examinations';

async function runStudentExamTests() {
  console.log('========================================================');
  console.log('   SOES STEP 8: STUDENT EXAMINATION SECURITY TESTS      ');
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

  // Ensure server is responding
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
    // ----------------------------------------------------
    // Seed Users: 1 Instructor, 2 Students
    // ----------------------------------------------------
    let instructor = await User.findOne({ email: 'prof.studentexam@university.edu' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Prof. Turing Security',
        email: 'prof.studentexam@university.edu',
        password: 'Password123!',
        role: 'INSTRUCTOR',
        isActive: true,
      });
    }

    let student1 = await User.findOne({ email: 'alice.student@university.edu' });
    if (!student1) {
      student1 = await User.create({
        name: 'Alice Student',
        email: 'alice.student@university.edu',
        password: 'Password123!',
        role: 'STUDENT',
        isActive: true,
      });
    }
    const tokenStudent1 = generateToken(student1);

    let student2 = await User.findOne({ email: 'bob.student@university.edu' });
    if (!student2) {
      student2 = await User.create({
        name: 'Bob Student',
        email: 'bob.student@university.edu',
        password: 'Password123!',
        role: 'STUDENT',
        isActive: true,
      });
    }
    const tokenStudent2 = generateToken(student2);

    const now = new Date();

    // ----------------------------------------------------
    // Seed Test Examinations
    // ----------------------------------------------------

    // 1. Eligible Published Examination (Active window: started 5 min ago, ends in 2 hours)
    const activeExam = await Examination.create({
      title: 'Operating Systems & Security Midterm',
      description: 'Comprehensive test on memory protection, syscalls, and access control.',
      instructor: instructor._id,
      duration: 30, // 30 minutes
      startTime: new Date(now.getTime() - 5 * 60 * 1000), // 5 min ago
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000), // in 2 hours
      passingMarks: 5,
      status: 'PUBLISHED',
      questions: [
        {
          questionText: 'Which CPU ring level has full kernel privileges?',
          options: ['Ring 0', 'Ring 1', 'Ring 2', 'Ring 3'],
          correctAnswer: 'Ring 0',
          marks: 5,
        },
        {
          questionText: 'What security mechanism randomizes address space layouts?',
          options: ['DEP', 'ASLR', 'W^X', 'Canary'],
          correctAnswer: 'ASLR',
          marks: 5,
        },
      ],
    });

    // 2. Draft Examination (Never published)
    const draftExam = await Examination.create({
      title: 'Unpublished Database Security Exam',
      description: 'Internal draft questions.',
      instructor: instructor._id,
      duration: 45,
      startTime: new Date(now.getTime() - 5 * 60 * 1000),
      endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      passingMarks: 5,
      status: 'DRAFT',
      questions: [
        {
          questionText: 'SQL injection attack prevention method?',
          options: ['Parameterized Queries', 'Plain Text Concat', 'eval()', 'No sanitization'],
          correctAnswer: 'Parameterized Queries',
          marks: 5,
        },
      ],
    });

    // 3. Future Examination (Published, but starts tomorrow)
    const futureExam = await Examination.create({
      title: 'Advanced Cryptography Final',
      description: 'Starts tomorrow.',
      instructor: instructor._id,
      duration: 60,
      startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000), // +24 hours
      endTime: new Date(now.getTime() + 26 * 60 * 60 * 1000),
      passingMarks: 10,
      status: 'PUBLISHED',
      questions: [
        {
          questionText: 'What curve is used in Ed25519?',
          options: ['Curve25519', 'secp256k1', 'P-256', 'RSA-2048'],
          correctAnswer: 'Curve25519',
          marks: 10,
        },
      ],
    });

    // 4. Past Examination (Published, but scheduled window closed 10 min ago)
    const pastExam = await Examination.create({
      title: 'Expired Network Forensics Quiz',
      description: 'Window closed.',
      instructor: instructor._id,
      duration: 15,
      startTime: new Date(now.getTime() - 60 * 60 * 1000), // 1 hr ago
      endTime: new Date(now.getTime() - 10 * 60 * 1000), // 10 min ago
      passingMarks: 5,
      status: 'PUBLISHED',
      questions: [
        {
          questionText: 'Default Wireshark capture file format?',
          options: ['pcapng', 'txt', 'exe', 'iso'],
          correctAnswer: 'pcapng',
          marks: 5,
        },
      ],
    });

    // ----------------------------------------------------
    // Test 1: Student can view available examinations
    // ----------------------------------------------------
    const availRes = await fetch(`${BASE_URL}/available`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const availData = await availRes.json();
    const availableExams = availData.data?.examinations || [];
    const foundActive = availableExams.some((e) => e._id === activeExam._id.toString());

    assert(
      availRes.status === 200 && availData.success && foundActive,
      '1. Student can view available examinations in current active window'
    );

    // ----------------------------------------------------
    // Test 2: Student cannot view unpublished examinations
    // ----------------------------------------------------
    const foundDraft = availableExams.some((e) => e._id === draftExam._id.toString());
    assert(
      !foundDraft,
      '2. Student cannot view unpublished (DRAFT) examinations'
    );

    // ----------------------------------------------------
    // Test 3: Student can start an eligible examination
    // ----------------------------------------------------
    const startRes = await fetch(`${BASE_URL}/${activeExam._id}/start`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const startData = await startRes.json();

    assert(
      startRes.status === 200 &&
        startData.success &&
        startData.data.attempt.status === 'IN_PROGRESS' &&
        startData.data.remainingSeconds > 0 &&
        startData.data.examination.questions.length === 2,
      '3. Student can start eligible examination and receives sanitized questions & remaining time'
    );

    // ----------------------------------------------------
    // Test 4: Student cannot start examination before scheduled time
    // ----------------------------------------------------
    const futureStartRes = await fetch(`${BASE_URL}/${futureExam._id}/start`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    assert(
      futureStartRes.status === 400,
      '4. Student cannot start an examination before scheduled start time (400 Bad Request)'
    );

    // ----------------------------------------------------
    // Test 5: Student cannot start examination after scheduled deadline
    // ----------------------------------------------------
    const pastStartRes = await fetch(`${BASE_URL}/${pastExam._id}/start`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    assert(
      pastStartRes.status === 400,
      '5. Student cannot start an examination after scheduled deadline (400 Bad Request)'
    );

    // ----------------------------------------------------
    // Test 6: Student cannot start same examination twice (duplicate attempt prevented)
    // ----------------------------------------------------
    const resumeRes = await fetch(`${BASE_URL}/${activeExam._id}/start`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const resumeData = await resumeRes.json();
    const attemptsCount = await ExaminationAttempt.countDocuments({
      student: student1._id,
      examination: activeExam._id,
    });

    assert(
      resumeRes.status === 200 &&
        attemptsCount === 1 &&
        resumeData.data.attempt._id === startData.data.attempt._id,
      '6. Duplicate attempt prevented: re-calling start safely resumes the existing attempt'
    );

    // ----------------------------------------------------
    // Test 7: Student can select and save answers
    // ----------------------------------------------------
    const q1 = activeExam.questions[0];
    const q2 = activeExam.questions[1];

    const saveRes = await fetch(`${BASE_URL}/${activeExam._id}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        answers: [{ questionId: q1._id.toString(), selectedAnswer: 'Ring 0' }],
      }),
    });
    const saveData = await saveRes.json();

    assert(
      saveRes.status === 200 && saveData.success && saveData.data.savedCount === 1,
      '7. Student can select and save in-progress answers persistently'
    );

    // ----------------------------------------------------
    // Test 8: Student can navigate between questions and update answers
    // ----------------------------------------------------
    const updateProgressRes = await fetch(`${BASE_URL}/${activeExam._id}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        answers: [
          { questionId: q1._id.toString(), selectedAnswer: 'Ring 0' },
          { questionId: q2._id.toString(), selectedAnswer: 'ASLR' },
        ],
      }),
    });
    const updateProgressData = await updateProgressRes.json();

    assert(
      updateProgressRes.status === 200 &&
        updateProgressData.success &&
        updateProgressData.data.savedCount === 2,
      '8. Student can navigate and persist answers for multiple questions'
    );

    // ----------------------------------------------------
    // Test 9: Answers remain available after refreshing (resuming attempt)
    // ----------------------------------------------------
    const fetchAttemptRes = await fetch(`${BASE_URL}/${activeExam._id}/attempt`, {
      headers: { Authorization: `Bearer ${tokenStudent1}` },
    });
    const fetchAttemptData = await fetchAttemptRes.json();
    const loadedAnswers = fetchAttemptData.data?.attempt?.answers || [];

    const hasBoth =
      loadedAnswers.length === 2 &&
      loadedAnswers.some((a) => a.questionId === q1._id.toString() && a.selectedAnswer === 'Ring 0') &&
      loadedAnswers.some((a) => a.questionId === q2._id.toString() && a.selectedAnswer === 'ASLR');

    assert(
      fetchAttemptRes.status === 200 && hasBoth,
      '9. Answers remain intact when fetching attempt (refresh recovery)'
    );

    // ----------------------------------------------------
    // Test 10: Student cannot access another student\'s attempt
    // ----------------------------------------------------
    // Bob has not started activeExam. Attempting to get attempt returns 404
    const bobAttemptRes = await fetch(`${BASE_URL}/${activeExam._id}/attempt`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    assert(
      bobAttemptRes.status === 404,
      '10. Student cannot access another student\'s attempt (attempt ownership isolation enforced)'
    );

    // ----------------------------------------------------
    // Test 11: Correct answers are never returned by student APIs
    // ----------------------------------------------------
    const qInAvail = availableExams.find((e) => e._id === activeExam._id.toString())?.questions || [];
    const qInStart = startData.data?.examination?.questions || [];
    const qInAttempt = fetchAttemptData.data?.examination?.questions || [];

    const leakInAvail = qInAvail.some((q) => q.correctAnswer !== undefined);
    const leakInStart = qInStart.some((q) => q.correctAnswer !== undefined);
    const leakInAttempt = qInAttempt.some((q) => q.correctAnswer !== undefined);

    assert(
      !leakInAvail && !leakInStart && !leakInAttempt,
      '11. Correct answers are strictly masked and never returned in student endpoints'
    );

    // ----------------------------------------------------
    // Test 12: Student can submit an examination & server calculates score
    // ----------------------------------------------------
    const submitRes = await fetch(`${BASE_URL}/${activeExam._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        answers: [
          { questionId: q1._id.toString(), selectedAnswer: 'Ring 0' }, // Correct: 5 marks
          { questionId: q2._id.toString(), selectedAnswer: 'ASLR' },   // Correct: 5 marks
        ],
      }),
    });
    const submitData = await submitRes.json();
    const finalAttempt = submitData.data?.attempt;

    assert(
      submitRes.status === 200 &&
        submitData.success &&
        finalAttempt.status === 'SUBMITTED' &&
        finalAttempt.score === 10 &&
        finalAttempt.totalMarks === 10 &&
        finalAttempt.passed === true,
      '12. Student can submit examination and server grades score authoritatively (10/10 PASS)'
    );

    // ----------------------------------------------------
    // Test 13: Duplicate submissions are rejected safely
    // ----------------------------------------------------
    const duplicateSubmitRes = await fetch(`${BASE_URL}/${activeExam._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({ answers: [] }),
    });
    assert(
      duplicateSubmitRes.status === 400,
      '13. Duplicate submission rejected with 400 (already submitted)'
    );

    // ----------------------------------------------------
    // Test 14: Submission after deadline is rejected
    // ----------------------------------------------------
    // Create an exam and an attempt for Bob whose deadline has passed
    const deadlineExam = await Examination.create({
      title: 'Time-critical Security Assessment',
      instructor: instructor._id,
      duration: 1, // 1 minute
      startTime: new Date(now.getTime() - 20 * 60 * 1000), // 20 min ago
      endTime: new Date(now.getTime() + 60 * 60 * 1000),
      passingMarks: 5,
      status: 'PUBLISHED',
      questions: [
        {
          questionText: 'Test deadline question?',
          options: ['A', 'B', 'C', 'D'],
          correctAnswer: 'A',
          marks: 5,
        },
      ],
    });

    // Create an expired attempt for Bob directly in database (deadline 15 minutes ago)
    const expiredAttempt = await ExaminationAttempt.create({
      student: student2._id,
      examination: deadlineExam._id,
      startedAt: new Date(now.getTime() - 20 * 60 * 1000),
      deadline: new Date(now.getTime() - 15 * 60 * 1000), // 15 min ago
      status: 'IN_PROGRESS',
      answers: [],
    });

    const expiredSubmitRes = await fetch(`${BASE_URL}/${deadlineExam._id}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent2}`,
      },
      body: JSON.stringify({
        answers: [{ questionId: deadlineExam.questions[0]._id.toString(), selectedAnswer: 'A' }],
      }),
    });
    const updatedBobAttempt = await ExaminationAttempt.findById(expiredAttempt._id);

    assert(
      expiredSubmitRes.status === 400 && updatedBobAttempt.status === 'EXPIRED',
      '14. Late submission after deadline rejected with 400 and marked EXPIRED'
    );

    // ----------------------------------------------------
    // Test 15: Timer expiration triggers automatic submission / marks EXPIRED
    // ----------------------------------------------------
    // Check that checking attempt on an expired deadline marks it EXPIRED
    const checkExpiredAttemptRes = await fetch(`${BASE_URL}/${deadlineExam._id}/attempt`, {
      headers: { Authorization: `Bearer ${tokenStudent2}` },
    });
    const checkExpiredData = await checkExpiredAttemptRes.json();

    assert(
      checkExpiredAttemptRes.status === 200 &&
        checkExpiredData.data.attempt.status === 'EXPIRED' &&
        checkExpiredData.data.remainingSeconds === 0,
      '15. Attempt status transitions to EXPIRED with 0 remaining seconds when deadline elapses'
    );

    // ----------------------------------------------------
    // Test 16: Student cannot modify a submitted attempt
    // ----------------------------------------------------
    const modifySubmittedRes = await fetch(`${BASE_URL}/${activeExam._id}/progress`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudent1}`,
      },
      body: JSON.stringify({
        answers: [{ questionId: q1._id.toString(), selectedAnswer: 'Ring 3' }],
      }),
    });
    assert(
      modifySubmittedRes.status === 400,
      '16. Modifying answers on a submitted attempt is rejected (400 Bad Request)'
    );

    console.log('\n--------------------------------------------------------');
    console.log(`TOTAL TESTS: 16 | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
    console.log('--------------------------------------------------------');

    if (testsFailed === 0) {
      console.log('>>> ALL 16 STUDENT EXAMINATION SECURITY TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error('>>> SOME STUDENT EXAMINATION SECURITY TESTS FAILED.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('Test execution error:', error);
    process.exit(1);
  }
}

runStudentExamTests();
