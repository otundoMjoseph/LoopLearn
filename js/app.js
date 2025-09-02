import { initFirebase, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, doc, setDoc, getDoc, appId } from './firebase-config.js';
import { showSection, renderMyCourses, renderAvailableCourses, showCourseContent } from './ui.js';

const allCourses = [
    { id: 1, title: 'Environmental Sustainability', description: 'Learn about sustainable practices and environmental conservation.', lessons: 12, hours: 8, color: '#C45508' },
    { id: 2, title: 'Global Citizenship Education', description: 'Understanding our role as global citizens in achieving the SDGs.', lessons: 10, hours: 6, color: '#C45508' },
    { id: 3, title: 'Inclusive Education Strategies', description: 'Learn how to create inclusive learning environments for all students.', lessons: 8, hours: 5, color: '#C45508' },
    { id: 4, title: 'Digital Literacy', description: 'Essential digital skills for the 21st century learner.', lessons: 10, hours: 7, color: '#C45508' },
    { id: 5, title: 'Education for Sustainable Development', description: 'Integrating sustainability into educational practices.', lessons: 14, hours: 10, color: '#C45508' }
];

const allCoursesContent = {
    1: {
        mainContent: `<h2 class="text-3xl font-semibold mb-4 text-white">Module 1: Foundations of Sustainability</h2><p class="mb-4 text-gray-300">Explore the core principles of environmental stewardship and the history of the modern sustainability movement. This module will give you the foundational knowledge needed to understand the complexities of ecological challenges.</p>`,
        skillsGained: `<h3 class="text-3xl font-semibold mt-6 mb-3 text-white">Skills Gained:</h3><ul class="list-disc list-inside space-y-2 text-gray-400"><li>Understanding of ecological principles</li><li>Ability to identify sustainable practices</li></ul>`
    },
    2: {
        mainContent: `<h2 class="text-3xl font-semibold mb-4 text-white">Module 1: Foundations of Global Citizenship</h2><p class="mb-4 text-gray-300">This module explores the core concepts of global citizenship, emphasizing the role we all play in a connected world. You'll learn to think critically about global issues and your personal responsibility.</p>`,
        skillsGained: `<h3 class="text-3xl font-semibold mt-6 mb-3 text-white">Skills Gained:</h3><ul class="list-disc list-inside space-y-2 text-gray-400"><li>Global awareness and intercultural competence</li><li>Critical thinking and problem-solving</li></ul>`
    },
    3: {
        mainContent: `<h2 class="text-3xl font-semibold mb-4 text-white">Module 1: Principles of Inclusive Education</h2><p class="mb-4 text-gray-300">Learn the fundamental concepts of inclusive education and why it's a cornerstone of quality learning. This module covers legal frameworks, ethical considerations, and the importance of a welcoming classroom culture.</p>`,
        skillsGained: `<h3 class="text-3xl font-semibold mt-6 mb-3 text-white">Skills Gained:</h3><ul class="list-disc list-inside space-y-2 text-gray-400"><li>Application of inclusive teaching strategies</li><li>Ability to adapt curricula for diverse needs</li></ul>`
    },
    4: {
        mainContent: `<h2 class="text-3xl font-semibold mb-4 text-white">Module 1: The Digital World</h2><p class="mb-4 text-gray-300">Get a firm grasp on the basics of digital technology. This module covers everything from understanding computer hardware to navigating the internet efficiently and effectively.</p>`,
        skillsGained: `<h3 class="text-3xl font-semibold mt-6 mb-3 text-white">Skills Gained:</h3><ul class="list-disc list-inside space-y-2 text-gray-400"><li>Proficiency with common software applications</li><li>Knowledge of cybersecurity principles</li></ul>`
    },
    5: {
        mainContent: `<h2 class="text-3xl font-semibold mb-4 text-white">Module 1: What is ESD?</h2><p class="mb-4 text-gray-300">This foundational module introduces the concept of Education for Sustainable Development and its importance in building a better future. You will learn how to connect your curriculum to the Sustainable Development Goals (SDGs).</p>`,
        skillsGained: `<h3 class="text-3xl font-semibold mt-6 mb-3 text-white">Skills Gained:</h3><ul class="list-disc list-inside space-y-2 text-gray-400"><li>Holistic understanding of sustainability issues</li><li>Curriculum design and development</li></ul>`
    }
};

const upcomingDeadlines = [
    { course_id: 1, task: 'Module 5 Quiz', dueDate: '2025-09-10' },
    { course_id: 2, task: 'Reflection Essay', dueDate: '2025-09-15' },
    { course_id: 3, task: 'Final Project', dueDate: '2025-10-01' },
];

const userStats = {
    learningStreak: 12,
    weeklyQuests: [
        { id: 1, text: 'Complete 3 lessons', completed: true },
        { id: 2, text: 'Read a course summary', completed: false },
        { id: 3, text: 'Review a past quiz', completed: false }
    ]
};

let enrichedUserCourses = [];
let isLoginMode = false;
let auth, db, userId, isAuthReady = false;

document.addEventListener('DOMContentLoaded', async () => {
    const loadingScreen = document.getElementById('loading-screen');
    const appContainer = document.getElementById('app-container');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModalBtn = document.getElementById('close-auth-modal-btn');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const signupNameInput = document.getElementById('signup-name');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const authErrorMessage = document.getElementById('auth-error-message');
    const authEmail = document.getElementById('auth-email');
    const authPassword = document.getElementById('auth-password');
    const logoutBtn = document.getElementById('logout-btn');
    const authBtn = document.getElementById('auth-btn');
    const courseSearchInput = document.getElementById('course-search');

    const firebaseServices = await initFirebase();
    auth = firebaseServices.auth;
    db = firebaseServices.db;

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userId = user.uid;
            await fetchUserData(userId);
            logoutBtn.classList.remove('hidden');
            authBtn.classList.add('hidden');
        } else {
            userId = null;
            logoutBtn.classList.add('hidden');
            authBtn.classList.remove('hidden');
        }
        isAuthReady = true;
        loadingScreen.classList.add('opacity-0');
        setTimeout(() => loadingScreen.classList.add('hidden'), 500);
        appContainer.classList.remove('hidden');
        showSection('catalog');
    });

    const fetchUserData = async (uid) => {
        const userDocRef = doc(db, `artifacts/${appId}/users/${uid}/userData/profile`);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            const userData = docSnap.data();
            if (userData.courses) {
                enrichedUserCourses = userData.courses.map(uc => {
                    const courseDetails = allCourses.find(c => c.id === uc.course_id);
                    return { ...courseDetails, ...uc };
                });
            }
        }
        renderAllData();
    };

    const toggleAuthMode = () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = 'Log In';
            signupNameInput.classList.add('hidden');
            authSubmitBtn.textContent = 'Log In';
            document.getElementById('auth-toggle-text').textContent = "Don't have an account?";
            authToggleBtn.textContent = 'Sign Up';
        } else {
            authTitle.textContent = 'Sign Up';
            signupNameInput.classList.remove('hidden');
            authSubmitBtn.textContent = 'Sign Up';
            document.getElementById('auth-toggle-text').textContent = "Already have an account?";
            authToggleBtn.textContent = 'Log In';
        }
        authErrorMessage.classList.add('hidden');
    };

    const renderAllData = () => {
        if (!isAuthReady) return;

        document.getElementById('stat-courses').textContent = enrichedUserCourses.length;
        document.getElementById('stat-streak').textContent = userStats.learningStreak;

        const completedMilestones = enrichedUserCourses.filter(c => c.progress >= 50).length;
        document.getElementById('stat-milestones').textContent = completedMilestones;

        const completedCourses = enrichedUserCourses.filter(c => c.progress === 100).length;
        document.getElementById('stat-certs').textContent = completedCourses;

        const list = document.getElementById('weekly-quests-list');
        list.innerHTML = userStats.weeklyQuests.map(quest => `
            <li class="flex items-center space-x-2">
                <i class="fas fa-check-circle ${quest.completed ? 'text-green-500' : 'text-gray-600'}"></i>
                <span>${quest.text}</span>
            </li>
        `).join('');

        const deadlinesList = document.getElementById('deadlines-list');
        deadlinesList.innerHTML = upcomingDeadlines.map(deadline => {
            const course = allCourses.find(c => c.id === deadline.course_id);
            if (!course) return '';
            const dueDate = new Date(deadline.dueDate);
            const formattedDate = dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return `
                <div class="dark-card p-4">
                    <h4 class="text-white font-semibold">${deadline.task}</h4>
                    <p class="text-sm text-gray-400">for ${course.title}</p>
                    <p class="text-xs text-gray-500 mt-1">Due: ${formattedDate}</p>
                </div>
            `;
        }).join('');

        renderMyCourses(enrichedUserCourses);
        renderAvailableCourses(allCourses);
    };

    authBtn.addEventListener('click', () => {
        authModal.classList.remove('hidden');
        authModal.classList.add('flex');
    });

    closeAuthModalBtn.addEventListener('click', () => {
        authModal.classList.add('hidden');
        authModal.classList.remove('flex');
    });

    authToggleBtn.addEventListener('click', toggleAuthMode);

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmail.value;
        const password = authPassword.value;
        const name = signupNameInput.value;
        authErrorMessage.classList.add('hidden');

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/userData/profile`);
                await setDoc(userDocRef, {
                    name: name,
                    email: email,
                    courses: [],
                    createdAt: new Date()
                });
            }
            authModal.classList.add('hidden');
            showSection('catalog');
        } catch (error) {
            authErrorMessage.textContent = error.message;
            authErrorMessage.classList.remove('hidden');
            console.error("Auth error:", error);
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("User logged out");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });

    document.getElementById('my-courses-grid').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const courseId = parseInt(e.target.dataset.courseId);
            if (courseId) {
                showCourseContent(courseId, allCourses, allCoursesContent, enrichedUserCourses);
            }
        }
    });

    document.getElementById('available-courses-grid').addEventListener('click', async (e) => {
        if (e.target.classList.contains('enroll-btn')) {
            const courseId = parseInt(e.target.dataset.courseId);
            if (courseId) {
                if (!auth.currentUser || auth.currentUser.isAnonymous) {
                    authModal.classList.remove('hidden');
                    authModal.classList.add('flex');
                    return;
                }
                const userDocRef = doc(db, `artifacts/${appId}/users/${userId}/userData/profile`);
                const courseToEnroll = allCourses.find(c => c.id === courseId);
                if (!courseToEnroll) {
                    console.error("Course not found.");
                    return;
                }
                let docSnap = await getDoc(userDocRef);
                let userData = docSnap.data();

                if (!userData) {
                    userData = { courses: [] };
                }

                if (!userData.courses.find(c => c.course_id === courseId)) {
                    userData.courses.push({ course_id: courseId, progress: 0 });
                    await setDoc(userDocRef, userData, { merge: true });
                    await fetchUserData(userId);
                }

                showCourseContent(courseId, allCourses, allCoursesContent, enrichedUserCourses);
            }
        }
    });

    document.getElementById('back-to-dashboard').addEventListener('click', () => {
        showSection('dashboard');
    });

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    document.getElementById('sidebar-toggle').addEventListener('click', () => {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
        overlay.classList.add('opacity-100');
    });

    document.getElementById('close-sidebar').addEventListener('click', () => {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
        overlay.classList.remove('opacity-100');
    });

    document.getElementById('logo-button').addEventListener('click', () => {
        showSection('catalog');
    });

    document.getElementById('explore-courses-btn').addEventListener('click', () => {
        document.getElementById('looplearn-modal').classList.add('hidden');
        showSection('catalog');
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
        document.getElementById('looplearn-modal').classList.add('hidden');
    });

    const filterCourses = (query) => {
        const filtered = allCourses.filter(course =>
            course.title.toLowerCase().includes(query.toLowerCase()) ||
            course.description.toLowerCase().includes(query.toLowerCase())
        );
        renderAvailableCourses(filtered);
    };

    courseSearchInput.addEventListener('input', (e) => {
        filterCourses(e.target.value);
    });
});