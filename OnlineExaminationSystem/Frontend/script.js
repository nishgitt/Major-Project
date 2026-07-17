const API_BASE = 'http://127.0.0.1:8000';

// Helper to fetch data with error handling
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    
    // Set headers for JSON
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
        options.headers = {
            ...options.headers,
            'Content-Type': 'application/json'
        };
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`API Fetch error on ${endpoint}:`, error);
        throw error;
    }
}

// Check auth status on load
function checkAuth(requiredRole = null) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        if (requiredRole) {
            window.location.href = 'login.html';
        }
        return null;
    }
    
    if (requiredRole && user.role !== requiredRole) {
        window.location.href = user.role === 'admin' ? 'admin_dashboard.html' : 'student_dashboard.html';
    }
    
    // Render user profile indicator in navigation
    const authNavItem = document.getElementById('authNavItem');
    if (authNavItem) {
        authNavItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span style="font-size: 0.95rem; font-weight: 600; color: var(--secondary);">Hi, ${user.full_name || 'Admin'}</span>
                <button class="btn-secondary" onclick="handleLogout()" style="padding: 0.4rem 1rem; font-size: 0.85rem;">Logout</button>
            </div>
        `;
    }
    
    return user;
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// ==================== HOME PAGE LOGIC ====================
async function loadHomePage() {
    checkAuth();
    try {
        // Fetch counts to display stats
        const students = await apiFetch('/students/');
        const exams = await apiFetch('/exams/');
        const questions = await apiFetch('/questions/');
        const submissions = await apiFetch('/submissions/');
        
        document.getElementById('statExamsCount').innerText = `${exams.length}+`;
        document.getElementById('statQuestionsCount').innerText = `${questions.length}+`;
        document.getElementById('statStudentsCount').innerText = `${students.length}+`;
        document.getElementById('statSubmissionsCount').innerText = `${submissions.length}+`;
        
        // Load featured exams (first 3)
        const featuredGrid = document.getElementById('featuredExamsGrid');
        if (featuredGrid) {
            featuredGrid.innerHTML = '';
            const featuredList = exams.slice(0, 3);
            if (featuredList.length === 0) {
                featuredGrid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No exams scheduled at this moment.</p>';
                return;
            }
            
            featuredList.forEach(exam => {
                featuredGrid.innerHTML += `
                    <div class="exam-card">
                        <div class="exam-badge">${exam.subject}</div>
                        <h3>${exam.exam_title}</h3>
                        <div class="exam-meta">
                            <div class="exam-meta-item">⏱️ <span>${exam.duration} Minutes</span></div>
                            <div class="exam-meta-item">💯 <span>${exam.total_marks} Total Marks</span></div>
                            <div class="exam-meta-item">📅 <span>Date: ${exam.exam_date}</span></div>
                        </div>
                        <button class="btn-primary" onclick="attemptExam(${exam.exam_id})">Attempt Exam</button>
                    </div>
                `;
            });
        }
    } catch (err) {
        console.error("Error loading home page stats:", err);
    }
}

// Redirect helper to take exam
function attemptExam(examId) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        alert("Please login as a student to attempt this examination.");
        window.location.href = 'login.html';
    } else {
        window.location.href = `exam.html?id=${examId}`;
    }
}


// ==================== AVAILABLE EXAMS PAGE LOGIC ====================
async function loadAvailableExamsPage() {
    checkAuth();
    try {
        const exams = await apiFetch('/exams/');
        const grid = document.getElementById('examsListGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        if (exams.length === 0) {
            grid.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">No examinations available.</p>';
            return;
        }
        
        exams.forEach(exam => {
            grid.innerHTML += `
                <div class="exam-card">
                    <div class="exam-badge">${exam.subject}</div>
                    <h3>${exam.exam_title}</h3>
                    <div class="exam-meta">
                        <div class="exam-meta-item">⏱️ <span>${exam.duration} Minutes</span></div>
                        <div class="exam-meta-item">💯 <span>${exam.total_marks} Total Marks</span></div>
                        <div class="exam-meta-item">📅 <span>Date: ${exam.exam_date}</span></div>
                    </div>
                    <button class="btn-primary" onclick="attemptExam(${exam.exam_id})">Start Examination</button>
                </div>
            `;
        });
    } catch (err) {
        console.error("Error loading exams:", err);
    }
}


// ==================== LOGIN SUBMIT LOGIC ====================
async function handleLoginSubmit(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnLoginSubmit');
    btnSubmit.innerText = "Signing in...";
    btnSubmit.disabled = true;

    const password = document.getElementById('loginPassword').value;

    try {
        if (currentRole === 'admin') {
            const username = document.getElementById('loginUsername').value;
            if (username === 'admin' && password === 'admin123') {
                localStorage.setItem('currentUser', JSON.stringify({
                    role: 'admin',
                    full_name: 'Administrator'
                }));
                window.location.href = 'admin_dashboard.html';
            } else {
                alert("Invalid Administrator credentials.");
            }
        } else {
            const email = document.getElementById('loginEmail').value;
            const students = await apiFetch('/students/');
            const student = students.find(s => s.email.toLowerCase() === email.toLowerCase() && s.password === password);
            
            if (student) {
                localStorage.setItem('currentUser', JSON.stringify({
                    role: 'student',
                    student_id: student.student_id,
                    full_name: student.full_name,
                    email: student.email,
                    college: student.college
                }));
                window.location.href = 'student_dashboard.html';
            } else {
                alert("Invalid student email or password.");
            }
        }
    } catch (err) {
        alert("Authentication failed: " + err.message);
    } finally {
        btnSubmit.innerText = "Sign In";
        btnSubmit.disabled = false;
    }
}


// ==================== REGISTER SUBMIT LOGIC ====================
async function handleRegisterSubmit(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnRegisterSubmit');
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    btnSubmit.innerText = "Registering...";
    btnSubmit.disabled = true;

    const data = {
        full_name: document.getElementById('regFullName').value,
        email: document.getElementById('regEmail').value,
        phone: document.getElementById('regPhone').value,
        college: document.getElementById('regCollege').value,
        password: password
    };

    try {
        const result = await apiFetch('/students/add/', {
            method: 'POST',
            body: data
        });
        alert("Registration successful! Please login.");
        window.location.href = 'login.html';
    } catch (err) {
        alert("Registration failed: " + err.message);
    } finally {
        btnSubmit.innerText = "Create Account";
        btnSubmit.disabled = false;
    }
}


// ==================== STUDENT DASHBOARD LOGIC ====================
async function initializeStudentDashboard() {
    const student = checkAuth('student');
    if (!student) return;
    
    // Set labels
    document.getElementById('studentNameLabel').innerText = student.full_name;
    document.getElementById('studentCollegeLabel').innerText = student.college;
    
    // Avatar initials
    const initials = student.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    document.getElementById('studentAvatar').innerText = initials;
    
    try {
        // Fetch all exams, results, submissions
        const allExams = await apiFetch('/exams/');
        const allResults = await apiFetch('/results/');
        
        // Filter student results
        const studentResults = allResults.filter(r => r.student_name === student.full_name);
        
        // 1. Calculate Stats
        const completedExamsTitles = studentResults.map(r => r.exam_title);
        const pendingExams = allExams.filter(e => !completedExamsTitles.includes(e.exam_title));
        
        document.getElementById('studentStatPending').innerText = pendingExams.length;
        document.getElementById('studentStatCompleted').innerText = studentResults.length;
        
        let avgScore = 0;
        if (studentResults.length > 0) {
            const sumPerc = studentResults.reduce((acc, curr) => acc + curr.percentage, 0);
            avgScore = Math.round(sumPerc / studentResults.length);
        }
        document.getElementById('studentStatGPA').innerText = `${avgScore}%`;
        
        // 2. Populate Pending Exams Table
        const pendingTbody = document.getElementById('studentPendingExamsTable');
        pendingTbody.innerHTML = '';
        if (pendingExams.length === 0) {
            pendingTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No exams pending. You're all caught up!</td></tr>`;
        } else {
            pendingExams.forEach(exam => {
                pendingTbody.innerHTML += `
                    <tr>
                        <td style="font-weight: 600;">${exam.exam_title}</td>
                        <td>${exam.subject}</td>
                        <td>${exam.duration} Mins</td>
                        <td>${exam.total_marks} Marks</td>
                        <td>${exam.exam_date}</td>
                        <td><button class="btn-primary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="attemptExam(${exam.exam_id})">Start Exam</button></td>
                    </tr>
                `;
            });
        }
        
        // 3. Populate Completed Exams Table
        const completedTbody = document.getElementById('studentCompletedExamsTable');
        completedTbody.innerHTML = '';
        if (studentResults.length === 0) {
            completedTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">You have not attempted any examinations yet.</td></tr>`;
        } else {
            studentResults.forEach(res => {
                const statusClass = res.result_status.toLowerCase() === 'pass' ? 'pass' : 'fail';
                completedTbody.innerHTML += `
                    <tr>
                        <td style="font-weight: 600;">${res.exam_title}</td>
                        <td>${res.total_marks} Marks</td>
                        <td>${res.obtained_marks} Marks</td>
                        <td style="font-weight: 700;">${res.percentage}%</td>
                        <td><span class="badge ${statusClass}">${res.result_status}</span></td>
                        <td><button class="btn-secondary" style="padding: 0.4rem 1rem; font-size: 0.85rem;" onclick="viewPastResult('${res.exam_title}', ${res.obtained_marks}, ${res.total_marks}, ${res.percentage}, '${res.result_status}')">View Result</button></td>
                    </tr>
                `;
            });
        }
        
        // 4. Populate Leaderboard
        const leaderboardTbody = document.getElementById('studentLeaderboardTable');
        leaderboardTbody.innerHTML = '';
        
        // Sort results by percentage desc
        const sortedResults = [...allResults].sort((a, b) => b.percentage - a.percentage);
        
        if (sortedResults.length === 0) {
            leaderboardTbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No records found.</td></tr>`;
        } else {
            sortedResults.forEach((res, index) => {
                const statusClass = res.result_status.toLowerCase() === 'pass' ? 'pass' : 'fail';
                const rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`;
                leaderboardTbody.innerHTML += `
                    <tr>
                        <td style="font-weight: 700;">${rankBadge}</td>
                        <td style="font-weight: 600;">${res.student_name}</td>
                        <td>${res.exam_title}</td>
                        <td style="font-weight: 700; color: var(--secondary);">${res.percentage}%</td>
                        <td><span class="badge ${statusClass}">${res.result_status}</span></td>
                    </tr>
                `;
            });
        }
        
    } catch (err) {
        console.error("Error populating student dashboard:", err);
    }
}

function viewPastResult(title, obtained, total, percentage, status) {
    const student = JSON.parse(localStorage.getItem('currentUser'));
    // Store in localStorage and redirect
    const dummyResult = {
        student_name: student.full_name,
        exam_title: title,
        obtained_marks: obtained,
        total_marks: total,
        percentage: percentage,
        result_status: status,
        reviewModeOnly: true
    };
    localStorage.setItem('lastResult', JSON.stringify(dummyResult));
    window.location.href = 'results.html';
}


// ==================== EXAM SESSION TAKE LOGIC ====================
let examQuestions = [];
let activeQIndex = 0;
let studentAnswers = {}; // Mapping of question_id to selected choice
let timerInterval = null;
let activeExam = null;

async function initializeExamSession() {
    const student = checkAuth('student');
    if (!student) return;
    
    const params = new URLSearchParams(window.location.search);
    const examId = params.get('id');
    
    if (!examId) {
        alert("No exam selected.");
        window.location.href = 'exams.html';
        return;
    }
    
    try {
        // Fetch exam meta details
        const exams = await apiFetch('/exams/');
        activeExam = exams.find(e => e.exam_id == examId);
        
        if (!activeExam) {
            alert("Examination not found.");
            window.location.href = 'exams.html';
            return;
        }
        
        // Render headings
        document.getElementById('examSessionTitle').innerText = `🎓 Exam: ${activeExam.exam_title}`;
        document.getElementById('examDurationLabel').innerText = `Duration: ${activeExam.duration} Mins`;
        
        // Fetch questions
        const allQuestions = await apiFetch('/questions/');
        
        // Filter questions by exam title
        examQuestions = allQuestions.filter(q => q.exam_title === activeExam.exam_title);
        
        if (examQuestions.length === 0) {
            alert("No questions have been configured for this examination. Returning to list.");
            window.location.href = 'exams.html';
            return;
        }
        
        // Shuffling/Randomizing Question Order (Bonus Feature 2)
        shuffleArray(examQuestions);
        
        // Reset answers sheet
        studentAnswers = {};
        
        // Build palette navigators
        buildQuestionPalette();
        
        // Render first question
        showQuestion(0);
        
        // Start countdown timer (Bonus Feature 1 & 3)
        startExamTimer(activeExam.duration * 60);
        
    } catch (err) {
        alert("Failed to load exam: " + err.message);
        window.location.href = 'exams.html';
    }
}

// Shuffling helper (Fisher-Yates)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function buildQuestionPalette() {
    const palette = document.getElementById('paletteGrid');
    palette.innerHTML = '';
    
    examQuestions.forEach((_, index) => {
        palette.innerHTML += `
            <button type="button" class="palette-btn" id="paletteBtn_${index}" onclick="showQuestion(${index})">
                ${index + 1}
            </button>
        `;
    });
}

function showQuestion(index) {
    activeQIndex = index;
    const q = examQuestions[index];
    
    // Manage palette highlight active
    document.querySelectorAll('.palette-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        if (studentAnswers[examQuestions[idx].question_id]) {
            btn.classList.add('answered');
        } else {
            btn.classList.remove('answered');
        }
    });
    
    const activeBtn = document.getElementById(`paletteBtn_${index}`);
    if (activeBtn) activeBtn.classList.add('active');
    
    // Write text
    document.getElementById('currentQuestionTitle').innerText = `Question ${index + 1} of ${examQuestions.length}`;
    document.getElementById('currentQuestionMarks').innerText = `Marks: ${q.marks}`;
    document.getElementById('questionText').innerText = q.question;
    
    document.getElementById('lblOptA').innerText = q.option_a;
    document.getElementById('lblOptB').innerText = q.option_b;
    document.getElementById('lblOptC').innerText = q.option_c;
    document.getElementById('lblOptD').innerText = q.option_d;
    
    // Clear selection styles
    document.querySelectorAll('.option-wrapper').forEach(w => w.classList.remove('selected'));
    document.querySelectorAll('input[name="examOption"]').forEach(i => i.checked = false);
    
    // If already answered, pre-select
    const savedAns = studentAnswers[q.question_id];
    if (savedAns) {
        const radio = document.getElementById(`opt${savedAns}`);
        if (radio) {
            radio.checked = true;
            document.getElementById(`optWrap${savedAns}`).classList.add('selected');
        }
    }
    
    // Toggle nav buttons
    document.getElementById('btnPrevQuestion').style.visibility = index === 0 ? 'hidden' : 'visible';
    
    if (index === examQuestions.length - 1) {
        document.getElementById('btnNextQuestion').style.display = 'none';
        document.getElementById('btnSubmitExam').style.display = 'inline-flex';
    } else {
        document.getElementById('btnNextQuestion').style.display = 'inline-flex';
        document.getElementById('btnSubmitExam').style.display = 'none';
    }
}

function selectAnswer(optionLetter) {
    const q = examQuestions[activeQIndex];
    studentAnswers[q.question_id] = optionLetter;
    
    // UI highlight
    document.querySelectorAll('.option-wrapper').forEach(w => w.classList.remove('selected'));
    document.getElementById(`optWrap${optionLetter}`).classList.add('selected');
    document.getElementById(`opt${optionLetter}`).checked = true;
    
    // Mark palette button
    const pBtn = document.getElementById(`paletteBtn_${activeQIndex}`);
    if (pBtn) pBtn.classList.add('answered');
}

function goToPrevQuestion() {
    if (activeQIndex > 0) {
        showQuestion(activeQIndex - 1);
    }
}

function goToNextQuestion() {
    if (activeQIndex < examQuestions.length - 1) {
        showQuestion(activeQIndex + 1);
    }
}

// Timer Logic (Circular progress ring)
function startExamTimer(secondsRemaining) {
    const display = document.getElementById('timerDisplay');
    const progressRing = document.getElementById('timerProgressRing');
    const timerBox = document.getElementById('timerBox');
    
    const totalSeconds = secondsRemaining;
    const circumference = 2 * Math.PI * 65; // radius = 65, circ = ~408.4
    
    if (progressRing) {
        progressRing.style.strokeDasharray = circumference;
        progressRing.style.strokeDashoffset = 0;
    }
    
    clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        secondsRemaining--;
        
        // Calculate format
        const mins = Math.floor(secondsRemaining / 60);
        const secs = secondsRemaining % 60;
        display.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        
        // Update SVG circle stroke dashoffset
        if (progressRing) {
            const offset = circumference - (secondsRemaining / totalSeconds) * circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        // Warning time pulse
        if (secondsRemaining <= 30) {
            timerBox.classList.add('warning-time');
        }
        
        // Time expired auto-submit (Bonus Feature 3)
        if (secondsRemaining <= 0) {
            clearInterval(timerInterval);
            alert("Time has expired! Your answers are being submitted automatically.");
            submitExamAnswers();
        }
    }, 1000);
}

function confirmSubmitExam() {
    clearInterval(timerInterval);
    submitExamAnswers();
}

// Compute Score & Submit
async function submitExamAnswers() {
    const student = JSON.parse(localStorage.getItem('currentUser'));
    let obtainedMarks = 0;
    let totalExamMarks = 0;
    
    // format string for submission
    // "Q301:def,Q302:list"
    const answersArr = [];
    
    examQuestions.forEach(q => {
        const selected = studentAnswers[q.question_id] || "No Answer";
        totalExamMarks += q.marks;
        
        // Match selection value A, B, C, D to actual text options to verify
        let selectedText = "";
        if (selected === "A") selectedText = q.option_a;
        if (selected === "B") selectedText = q.option_b;
        if (selected === "C") selectedText = q.option_c;
        if (selected === "D") selectedText = q.option_d;
        
        // Check correction
        if (selectedText === q.correct_answer) {
            obtainedMarks += q.marks;
        }
        
        answersArr.push(`Q${q.question_id}:${selectedText || "None"}`);
    });
    
    const submittedAnswersStr = answersArr.join(',');
    
    const percentage = totalExamMarks > 0 ? round((obtainedMarks / totalExamMarks) * 100, 2) : 0;
    const resultStatus = percentage >= 40.0 ? "Pass" : "Fail";
    
    const now = new Date();
    const formattedDate = now.getFullYear() + "-" + 
        (now.getMonth() + 1).toString().padStart(2, '0') + "-" + 
        now.getDate().toString().padStart(2, '0') + " " + 
        now.getHours().toString().padStart(2, '0') + ":" + 
        now.getMinutes().toString().padStart(2, '0') + ":" + 
        now.getSeconds().toString().padStart(2, '0');
        
    const submissionBody = {
        student_name: student.full_name,
        exam_title: activeExam.exam_title,
        submitted_answers: submittedAnswersStr,
        score: obtainedMarks,
        submitted_at: formattedDate
    };
    
    const resultBody = {
        student_name: student.full_name,
        exam_title: activeExam.exam_title,
        total_marks: totalExamMarks,
        obtained_marks: obtainedMarks,
        percentage: percentage,
        result_status: resultStatus
    };
    
    try {
        // Save submission log
        const subResult = await apiFetch('/submissions/add/', {
            method: 'POST',
            body: submissionBody
        });
        
        // Save score result record
        const resResult = await apiFetch('/results/add/', {
            method: 'POST',
            body: resultBody
        });
        
        // Cache result details in local storage for results page review
        const lastResultData = {
            student_name: student.full_name,
            exam_title: activeExam.exam_title,
            obtained_marks: obtainedMarks,
            total_marks: totalExamMarks,
            percentage: percentage,
            result_status: resultStatus,
            examQuestions: examQuestions,
            studentAnswers: studentAnswers,
            reviewModeOnly: false
        };
        
        localStorage.setItem('lastResult', JSON.stringify(lastResultData));
        window.location.href = 'results.html';
        
    } catch (err) {
        alert("Submission failed to save: " + err.message);
        window.location.href = 'student_dashboard.html';
    }
}

// Helpers
function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}


// ==================== RESULTS PAGE LOGIC ====================
async function loadResultsPage() {
    const student = checkAuth('student');
    if (!student) return;
    
    const lastResult = JSON.parse(localStorage.getItem('lastResult'));
    if (!lastResult) {
        alert("No recent result found to review.");
        window.location.href = 'student_dashboard.html';
        return;
    }
    
    // Fill top card
    const badge = document.getElementById('resultStatusBadge');
    badge.className = `result-badge-large ${lastResult.result_status.toLowerCase()}`;
    badge.innerHTML = `${lastResult.percentage}% <span>${lastResult.result_status}</span>`;
    
    document.getElementById('resultExamTitle').innerText = lastResult.exam_title;
    document.getElementById('resultStudentMeta').innerText = `Student: ${lastResult.student_name} (${student.college})`;
    
    document.getElementById('resultObtainedMarks').innerText = lastResult.obtained_marks;
    document.getElementById('resultTotalMarks').innerText = lastResult.total_marks;
    document.getElementById('resultPercentage').innerText = `${lastResult.percentage}%`;
    
    // Draw answers sheet
    const reviewContainer = document.getElementById('reviewQuestionsContainer');
    reviewContainer.innerHTML = '';
    
    let questionsList = lastResult.examQuestions || [];
    let savedAnswers = lastResult.studentAnswers || {};
    
    if (questionsList.length === 0) {
        // If not cached, let's fetch questions and build best effort review
        try {
            const allQ = await apiFetch('/questions/');
            questionsList = allQ.filter(q => q.exam_title === lastResult.exam_title);
        } catch (e) {
            console.error(e);
        }
    }
    
    if (questionsList.length === 0) {
        reviewContainer.innerHTML = '<p style="color: var(--text-muted);">Question review is only available immediately after taking the exam.</p>';
        return;
    }
    
    questionsList.forEach((q, index) => {
        const studentAnsLetter = savedAnswers[q.question_id] || null;
        
        let studentAnsText = "No Answer Selected";
        if (studentAnsLetter === "A") studentAnsText = q.option_a;
        if (studentAnsLetter === "B") studentAnsText = q.option_b;
        if (studentAnsLetter === "C") studentAnsText = q.option_c;
        if (studentAnsLetter === "D") studentAnsText = q.option_d;
        
        const isCorrect = (studentAnsText === q.correct_answer);
        
        let optionsHtml = '';
        
        const optValues = [
            { text: q.option_a, letter: 'A' },
            { text: q.option_b, letter: 'B' },
            { text: q.option_c, letter: 'C' },
            { text: q.option_d, letter: 'D' }
        ];
        
        optValues.forEach(opt => {
            let optClass = '';
            let optSuffix = '';
            
            if (opt.text === q.correct_answer) {
                optClass = 'correct';
                optSuffix = ' (Correct Answer)';
            } else if (opt.text === studentAnsText && !isCorrect) {
                optClass = 'incorrect';
                optSuffix = ' (Your Answer - Wrong)';
            } else if (opt.text === studentAnsText && isCorrect) {
                optClass = 'correct';
                optSuffix = ' (Your Answer - Correct)';
            }
            
            optionsHtml += `
                <div class="review-option ${optClass}">
                    <span>${opt.letter}. ${opt.text}</span>
                    <span>${optSuffix}</span>
                </div>
            `;
        });
        
        reviewContainer.innerHTML += `
            <div class="review-question-card">
                <div class="review-question-header">
                    <span class="review-question-num">Question ${index + 1}</span>
                    <span style="font-size: 0.85rem; padding: 0.2rem 0.6rem; background: rgba(255,255,255,0.05); border-radius: 4px;">
                        Marks: ${q.marks}
                    </span>
                </div>
                <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">${q.question}</p>
                <div class="review-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
    });
}

// Download Result as PDF using jsPDF (Bonus Feature 5)
function downloadResultPDF() {
    const lastResult = JSON.parse(localStorage.getItem('lastResult'));
    if (!lastResult) return;
    
    // We instantiate jsPDF. In standard ESM, window.jspdf is the namespace.
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Theme colors
    doc.setFillColor(13, 18, 31); // Dark background header
    doc.rect(0, 0, 210, 50, 'F');
    
    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("EXAMLY ASSESSMENT REPORT", 20, 22);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Online Examination Management System Certification", 20, 32);
    
    // Document body
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Examination Details", 20, 70);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 75, 190, 75);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Candidate Name:   ${lastResult.student_name}`, 20, 85);
    doc.text(`Exam Title:             ${lastResult.exam_title}`, 20, 95);
    doc.text(`Passing Grade:        40.0%`, 20, 105);
    
    // Score box
    doc.setFillColor(245, 247, 250);
    doc.rect(20, 115, 170, 45, 'F');
    doc.rect(20, 115, 170, 45, 'S');
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PERFORMANCE SUMMARY", 30, 125);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Total Score:      ${lastResult.obtained_marks} / ${lastResult.total_marks} Marks`, 30, 135);
    doc.text(`Percentage:      ${lastResult.percentage}%`, 30, 145);
    
    // Add colored status
    if (lastResult.result_status === "Pass") {
        doc.setTextColor(16, 185, 129); // Green
        doc.setFont("helvetica", "bold");
        doc.text("STATUS: PASS", 120, 135);
    } else {
        doc.setTextColor(239, 68, 68); // Red
        doc.setFont("helvetica", "bold");
        doc.text("STATUS: FAIL", 120, 135);
    }
    
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("This report is electronically generated and is valid without physical signatures.", 20, 180);
    
    // Footer watermark
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 287, 210, 10, 'F');
    
    // Download
    const filename = `${lastResult.student_name.replace(/\s+/g, '_')}_${lastResult.exam_title.replace(/\s+/g, '_')}_Scorecard.pdf`;
    doc.save(filename);
}


// ==================== ADMIN CRUD DASHBOARD LOGIC ====================
let listStudents = [];
let listExams = [];
let listQuestions = [];
let listSubmissions = [];
let listResults = [];

async function initializeAdminDashboard() {
    const admin = checkAuth('admin');
    if (!admin) return;
    
    // Load default tab
    switchAdminTab('students', document.getElementById('btnTabStudents'));
    
    // Fetch and draw
    await reloadAllAdminData();
}

async function reloadAllAdminData() {
    try {
        listStudents = await apiFetch('/students/');
        listExams = await apiFetch('/exams/');
        listQuestions = await apiFetch('/questions/');
        listSubmissions = await apiFetch('/submissions/');
        listResults = await apiFetch('/results/');
        
        renderAdminStudents();
        renderAdminExams();
        renderAdminQuestions();
        renderAdminSubmissions();
        renderAdminResults();
    } catch (e) {
        console.error("Error refreshing admin lists:", e);
    }
}

// 1. Students Render
function renderAdminStudents() {
    const tbody = document.getElementById('adminStudentsTableBody');
    tbody.innerHTML = '';
    
    if (listStudents.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No students registered.</td></tr>`;
        return;
    }
    
    listStudents.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.student_id}</td>
                <td style="font-weight: 600;">${item.full_name}</td>
                <td>${item.email}</td>
                <td>${item.phone}</td>
                <td>${item.college}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditModal('student', ${item.student_id})">✏️</button>
                        <button class="btn-icon delete" onclick="deleteEntity('student', ${item.student_id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 2. Exams Render
function renderAdminExams() {
    const tbody = document.getElementById('adminExamsTableBody');
    tbody.innerHTML = '';
    
    if (listExams.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No exams defined.</td></tr>`;
        return;
    }
    
    listExams.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.exam_id}</td>
                <td style="font-weight: 600;">${item.exam_title}</td>
                <td>${item.subject}</td>
                <td>${item.duration} Mins</td>
                <td>${item.total_marks} Marks</td>
                <td>${item.exam_date}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditModal('exam', ${item.exam_id})">✏️</button>
                        <button class="btn-icon delete" onclick="deleteEntity('exam', ${item.exam_id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 3. Questions Render
function renderAdminQuestions() {
    const tbody = document.getElementById('adminQuestionsTableBody');
    tbody.innerHTML = '';
    
    if (listQuestions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No questions created.</td></tr>`;
        return;
    }
    
    listQuestions.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.question_id}</td>
                <td style="font-weight: 600;">${item.exam_title}</td>
                <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.question}</td>
                <td><span class="badge completed">${item.correct_answer}</span></td>
                <td style="font-weight: 700;">${item.marks}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditModal('question', ${item.question_id})">✏️</button>
                        <button class="btn-icon delete" onclick="deleteEntity('question', ${item.question_id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 4. Submissions Render
function renderAdminSubmissions() {
    const tbody = document.getElementById('adminSubmissionsTableBody');
    tbody.innerHTML = '';
    
    if (listSubmissions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No submissions log yet.</td></tr>`;
        return;
    }
    
    listSubmissions.forEach(item => {
        tbody.innerHTML += `
            <tr>
                <td>${item.submission_id}</td>
                <td style="font-weight: 600;">${item.student_name}</td>
                <td>${item.exam_title}</td>
                <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.submitted_answers}</td>
                <td style="font-weight: 700; color: var(--secondary);">${item.score}</td>
                <td>${item.submitted_at}</td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditModal('submission', ${item.submission_id})">✏️</button>
                        <button class="btn-icon delete" onclick="deleteEntity('submission', ${item.submission_id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// 5. Results Render
function renderAdminResults() {
    const tbody = document.getElementById('adminResultsTableBody');
    tbody.innerHTML = '';
    
    if (listResults.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No exam results compiled.</td></tr>`;
        return;
    }
    
    listResults.forEach(item => {
        const statusClass = item.result_status.toLowerCase() === 'pass' ? 'pass' : 'fail';
        tbody.innerHTML += `
            <tr>
                <td>${item.result_id}</td>
                <td style="font-weight: 600;">${item.student_name}</td>
                <td>${item.exam_title}</td>
                <td>${item.total_marks}</td>
                <td>${item.obtained_marks}</td>
                <td style="font-weight: 700; color: var(--secondary);">${item.percentage}%</td>
                <td><span class="badge ${statusClass}">${item.result_status}</span></td>
                <td>
                    <div class="actions-cell">
                        <button class="btn-icon" onclick="openEditModal('result', ${item.result_id})">✏️</button>
                        <button class="btn-icon delete" onclick="deleteEntity('result', ${item.result_id})">🗑️</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

// CRUD Modal drawing helper
function drawFormFields(type, data = null) {
    const fields = document.getElementById('modalFormFields');
    fields.innerHTML = '';
    
    if (type === 'student') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Student ID (Optional)</label>
                <input type="number" id="field_student_id" placeholder="Autoassigned if empty" value="${data ? data.student_id : ''}" ${data ? 'readonly style="opacity: 0.6;"' : ''}>
            </div>
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="field_full_name" placeholder="e.g. Rahul Sharma" value="${data ? data.full_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="field_email" placeholder="e.g. rahul@gmail.com" value="${data ? data.email : ''}" required>
            </div>
            <div class="form-group">
                <label>Phone Number</label>
                <input type="text" id="field_phone" placeholder="e.g. 9876543210" value="${data ? data.phone : ''}" required>
            </div>
            <div class="form-group">
                <label>College</label>
                <input type="text" id="field_college" placeholder="e.g. ABC College" value="${data ? data.college : ''}" required>
            </div>
            <div class="form-group">
                <label>Password</label>
                <input type="text" id="field_password" placeholder="Enter student password" value="${data ? data.password : ''}" required>
            </div>
        `;
    } else if (type === 'exam') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Exam ID (Optional)</label>
                <input type="number" id="field_exam_id" placeholder="Autoassigned" value="${data ? data.exam_id : ''}" ${data ? 'readonly style="opacity: 0.6;"' : ''}>
            </div>
            <div class="form-group">
                <label>Exam Title</label>
                <input type="text" id="field_exam_title" placeholder="e.g. Python Programming Test" value="${data ? data.exam_title : ''}" required>
            </div>
            <div class="form-group">
                <label>Subject</label>
                <input type="text" id="field_subject" placeholder="e.g. Python" value="${data ? data.subject : ''}" required>
            </div>
            <div class="form-group">
                <label>Duration (Minutes)</label>
                <input type="number" id="field_duration" placeholder="e.g. 60" value="${data ? data.duration : ''}" required>
            </div>
            <div class="form-group">
                <label>Total Marks</label>
                <input type="number" id="field_total_marks" placeholder="e.g. 100" value="${data ? data.total_marks : ''}" required>
            </div>
            <div class="form-group">
                <label>Exam Date</label>
                <input type="date" id="field_exam_date" value="${data ? data.exam_date : ''}" required>
            </div>
        `;
    } else if (type === 'question') {
        // Build dropdown of exam titles
        let examOptions = '';
        listExams.forEach(e => {
            const selected = (data && data.exam_title === e.exam_title) ? 'selected' : '';
            examOptions += `<option value="${e.exam_title}" ${selected}>${e.exam_title}</option>`;
        });
        
        fields.innerHTML = `
            <div class="form-group">
                <label>Question ID (Optional)</label>
                <input type="number" id="field_question_id" placeholder="Autoassigned" value="${data ? data.question_id : ''}" ${data ? 'readonly style="opacity: 0.6;"' : ''}>
            </div>
            <div class="form-group">
                <label>Select Examination</label>
                <select id="field_exam_title" required>
                    <option value="">-- Choose Exam --</option>
                    ${examOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Question Statement</label>
                <textarea id="field_question" placeholder="Which keyword defines a function?" rows="3" required>${data ? data.question : ''}</textarea>
            </div>
            <div class="form-group">
                <label>Option A</label>
                <input type="text" id="field_option_a" placeholder="Option A text" value="${data ? data.option_a : ''}" required>
            </div>
            <div class="form-group">
                <label>Option B</label>
                <input type="text" id="field_option_b" placeholder="Option B text" value="${data ? data.option_b : ''}" required>
            </div>
            <div class="form-group">
                <label>Option C</label>
                <input type="text" id="field_option_c" placeholder="Option C text" value="${data ? data.option_c : ''}" required>
            </div>
            <div class="form-group">
                <label>Option D</label>
                <input type="text" id="field_option_d" placeholder="Option D text" value="${data ? data.option_d : ''}" required>
            </div>
            <div class="form-group">
                <label>Correct Answer (Exact text of the correct choice)</label>
                <input type="text" id="field_correct_answer" placeholder="e.g. def" value="${data ? data.correct_answer : ''}" required>
            </div>
            <div class="form-group">
                <label>Marks Value</label>
                <input type="number" id="field_marks" placeholder="e.g. 5" value="${data ? data.marks : ''}" required>
            </div>
        `;
    } else if (type === 'submission') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Submission ID (Optional)</label>
                <input type="number" id="field_submission_id" placeholder="Autoassigned" value="${data ? data.submission_id : ''}" ${data ? 'readonly style="opacity: 0.6;"' : ''}>
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="field_student_name" placeholder="Rahul Sharma" value="${data ? data.student_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Exam Title</label>
                <input type="text" id="field_exam_title" placeholder="Python Programming Test" value="${data ? data.exam_title : ''}" required>
            </div>
            <div class="form-group">
                <label>Submitted Answers (Serialized)</label>
                <input type="text" id="field_submitted_answers" placeholder="Q301:def,Q302:list" value="${data ? data.submitted_answers : ''}" required>
            </div>
            <div class="form-group">
                <label>Score Obtained</label>
                <input type="number" id="field_score" placeholder="90" value="${data ? data.score : ''}" required>
            </div>
            <div class="form-group">
                <label>Submitted At (DateTime)</label>
                <input type="text" id="field_submitted_at" placeholder="YYYY-MM-DD HH:MM:SS" value="${data ? data.submitted_at : ''}" required>
            </div>
        `;
    } else if (type === 'result') {
        fields.innerHTML = `
            <div class="form-group">
                <label>Result ID (Optional)</label>
                <input type="number" id="field_result_id" placeholder="Autoassigned" value="${data ? data.result_id : ''}" ${data ? 'readonly style="opacity: 0.6;"' : ''}>
            </div>
            <div class="form-group">
                <label>Student Name</label>
                <input type="text" id="field_student_name" placeholder="Rahul Sharma" value="${data ? data.student_name : ''}" required>
            </div>
            <div class="form-group">
                <label>Exam Title</label>
                <input type="text" id="field_exam_title" placeholder="Python Programming Test" value="${data ? data.exam_title : ''}" required>
            </div>
            <div class="form-group">
                <label>Total Marks</label>
                <input type="number" id="field_total_marks" placeholder="100" value="${data ? data.total_marks : ''}" required>
            </div>
            <div class="form-group">
                <label>Obtained Marks</label>
                <input type="number" id="field_obtained_marks" placeholder="90" value="${data ? data.obtained_marks : ''}" required>
            </div>
            <div class="form-group">
                <label>Percentage (%)</label>
                <input type="number" step="0.01" id="field_percentage" placeholder="90.00" value="${data ? data.percentage : ''}">
            </div>
            <div class="form-group">
                <label>Result Status</label>
                <select id="field_result_status">
                    <option value="Pass" ${data && data.result_status === 'Pass' ? 'selected' : ''}>Pass</option>
                    <option value="Fail" ${data && data.result_status === 'Fail' ? 'selected' : ''}>Fail</option>
                </select>
            </div>
        `;
    }
}

function openAddModal(type) {
    document.getElementById('entityType').value = type;
    document.getElementById('editEntityId').value = '';
    document.getElementById('modalTitle').innerText = `Add New ${type.toUpperCase()}`;
    document.getElementById('btnModalSubmit').innerText = 'Create';
    
    drawFormFields(type);
    document.getElementById('crudModal').classList.add('active');
}

function openEditModal(type, id) {
    document.getElementById('entityType').value = type;
    document.getElementById('editEntityId').value = id;
    document.getElementById('modalTitle').innerText = `Edit ${type.toUpperCase()} #${id}`;
    document.getElementById('btnModalSubmit').innerText = 'Save Changes';
    
    // Find item
    let item = null;
    if (type === 'student') item = listStudents.find(x => x.student_id === id);
    if (type === 'exam') item = listExams.find(x => x.exam_id === id);
    if (type === 'question') item = listQuestions.find(x => x.question_id === id);
    if (type === 'submission') item = listSubmissions.find(x => x.submission_id === id);
    if (type === 'result') item = listResults.find(x => x.result_id === id);
    
    if (item) {
        drawFormFields(type, item);
        document.getElementById('crudModal').classList.add('active');
    }
}

function closeCrudModal() {
    document.getElementById('crudModal').classList.remove('active');
}

async function deleteEntity(type, id) {
    if (confirm(`Are you sure you want to delete ${type} #${id}?`)) {
        let endpoint = '';
        if (type === 'student') endpoint = `/students/delete/${id}/`;
        if (type === 'exam') endpoint = `/exams/delete/${id}/`;
        if (type === 'question') endpoint = `/questions/delete/${id}/`;
        if (type === 'submission') endpoint = `/submissions/delete/${id}/`;
        if (type === 'result') endpoint = `/results/delete/${id}/`;
        
        try {
            await apiFetch(endpoint, { method: 'DELETE' });
            alert(`${type.toUpperCase()} deleted successfully.`);
            await reloadAllAdminData();
        } catch (e) {
            alert("Delete failed: " + e.message);
        }
    }
}

async function handleCrudSubmit(e) {
    e.preventDefault();
    const type = document.getElementById('entityType').value;
    const editId = document.getElementById('editEntityId').value;
    const isEdit = (editId !== '');
    
    const bodyData = {};
    
    // Read fields based on type
    if (type === 'student') {
        bodyData.student_id = document.getElementById('field_student_id').value;
        bodyData.full_name = document.getElementById('field_full_name').value;
        bodyData.email = document.getElementById('field_email').value;
        bodyData.phone = document.getElementById('field_phone').value;
        bodyData.college = document.getElementById('field_college').value;
        bodyData.password = document.getElementById('field_password').value;
    } else if (type === 'exam') {
        bodyData.exam_id = document.getElementById('field_exam_id').value;
        bodyData.exam_title = document.getElementById('field_exam_title').value;
        bodyData.subject = document.getElementById('field_subject').value;
        bodyData.duration = document.getElementById('field_duration').value;
        bodyData.total_marks = document.getElementById('field_total_marks').value;
        bodyData.exam_date = document.getElementById('field_exam_date').value;
    } else if (type === 'question') {
        bodyData.question_id = document.getElementById('field_question_id').value;
        bodyData.exam_title = document.getElementById('field_exam_title').value;
        bodyData.question = document.getElementById('field_question').value;
        bodyData.option_a = document.getElementById('field_option_a').value;
        bodyData.option_b = document.getElementById('field_option_b').value;
        bodyData.option_c = document.getElementById('field_option_c').value;
        bodyData.option_d = document.getElementById('field_option_d').value;
        bodyData.correct_answer = document.getElementById('field_correct_answer').value;
        bodyData.marks = document.getElementById('field_marks').value;
    } else if (type === 'submission') {
        bodyData.submission_id = document.getElementById('field_submission_id').value;
        bodyData.student_name = document.getElementById('field_student_name').value;
        bodyData.exam_title = document.getElementById('field_exam_title').value;
        bodyData.submitted_answers = document.getElementById('field_submitted_answers').value;
        bodyData.score = document.getElementById('field_score').value;
        bodyData.submitted_at = document.getElementById('field_submitted_at').value;
    } else if (type === 'result') {
        bodyData.result_id = document.getElementById('field_result_id').value;
        bodyData.student_name = document.getElementById('field_student_name').value;
        bodyData.exam_title = document.getElementById('field_exam_title').value;
        bodyData.total_marks = document.getElementById('field_total_marks').value;
        bodyData.obtained_marks = document.getElementById('field_obtained_marks').value;
        bodyData.percentage = document.getElementById('field_percentage').value;
        bodyData.result_status = document.getElementById('field_result_status').value;
    }
    
    // Choose endpoint
    let endpoint = '';
    let method = 'POST';
    
    if (isEdit) {
        method = 'PUT';
        if (type === 'student') endpoint = `/students/update/${editId}/`;
        if (type === 'exam') endpoint = `/exams/update/${editId}/`;
        if (type === 'question') endpoint = `/questions/update/${editId}/`;
        if (type === 'submission') endpoint = `/submissions/update/${editId}/`;
        if (type === 'result') endpoint = `/results/update/${editId}/`;
    } else {
        method = 'POST';
        if (type === 'student') endpoint = '/students/add/';
        if (type === 'exam') endpoint = '/exams/add/';
        if (type === 'question') endpoint = '/questions/add/';
        if (type === 'submission') endpoint = '/submissions/add/';
        if (type === 'result') endpoint = '/results/add/';
    }
    
    try {
        await apiFetch(endpoint, {
            method: method,
            body: bodyData
        });
        alert(`${type.toUpperCase()} saved successfully.`);
        closeCrudModal();
        await reloadAllAdminData();
    } catch (err) {
        alert("Operation failed: " + err.message);
    }
}


// Auto route page dynamic initializations based on path
window.addEventListener('DOMContentLoaded', () => {
    const pathname = window.location.pathname;
    if (pathname.endsWith('index.html') || pathname === '/' || pathname.endsWith('OnlineExaminationSystem/Frontend/')) {
        loadHomePage();
    }
});
