export const showSection = (sectionId) => {
    document.querySelectorAll('main > section').forEach(section => {
        section.classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
};

export const renderMyCourses = (courses) => {
    const myCoursesGrid = document.getElementById('my-courses-grid');
    myCoursesGrid.innerHTML = '';
    if (courses.length === 0) {
        myCoursesGrid.innerHTML = `<div class="md:col-span-3 text-center text-gray-400 p-8 dark-card">You are not enrolled in any courses yet. Explore the <a href="#" onclick="showSection('catalog')" class="text-[#C45508] hover:underline">Course Catalog</a> to get started!</div>`;
        return;
    }
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.classList.add('dark-card', 'p-6', 'flex', 'flex-col', 'justify-between', 'space-y-4', 'hover:-translate-y-1', 'hover:shadow-lg', 'transition-transform');
        courseCard.innerHTML = `
            <div>
                <div class="flex items-center space-x-2 mb-2">
                    <span class="text-xs font-semibold uppercase text-white px-2 py-1 rounded-full" style="background-color: ${course.color};">In Progress</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">${course.title}</h3>
                <p class="text-gray-400 text-sm mb-4">${course.description}</p>
            </div>
            <div>
                <div class="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                    <div class="bg-[#C45508] h-2.5 rounded-full" style="width: ${course.progress}%;"></div>
                </div>
                <p class="text-right text-gray-500 text-sm">${course.progress}% Complete</p>
                <button onclick="showCourseContent(${course.id})" class="mt-4 w-full px-4 py-2 bg-[#C45508] text-white rounded-lg hover:bg-orange-800 transition-colors">Continue Learning</button>
            </div>
        `;
        myCoursesGrid.appendChild(courseCard);
    });
};

export const renderAvailableCourses = (courses) => {
    const availableCoursesGrid = document.getElementById('available-courses-grid');
    availableCoursesGrid.innerHTML = '';
    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.classList.add('dark-card', 'p-6', 'flex', 'flex-col', 'justify-between', 'space-y-4', 'hover:-translate-y-1', 'hover:shadow-lg', 'transition-transform', 'relative');
        courseCard.innerHTML = `
            <div>
                <span class="text-xs font-semibold uppercase text-white absolute top-4 left-4 px-2 py-1 rounded-full" style="background-color: ${course.color};">New</span>
                <div class="text-center mb-4 mt-8">
                    <i class="fas fa-book-reader text-4xl text-[#C45508]"></i>
                </div>
                <h3 class="text-xl font-bold text-white mb-2">${course.title}</h3>
                <p class="text-gray-400 text-sm mb-4">${course.description}</p>
                <div class="flex items-center text-gray-500 text-sm">
                    <i class="fas fa-file-alt mr-2"></i> ${course.lessons} lessons | <i class="fas fa-clock ml-4 mr-2"></i> ${course.hours} hours
                </div>
            </div>
            <button data-course-id="${course.id}" class="enroll-btn mt-4 w-full px-4 py-2 bg-gray-700 text-gray-400 rounded-lg hover:bg-gray-900 transition-colors">View Details</button>
        `;
        availableCoursesGrid.appendChild(courseCard);
    });
};

export const showCourseContent = (courseId, allCourses, allCoursesContent, enrichedUserCourses) => {
    const course = allCourses.find(c => c.id === courseId);
    const content = allCoursesContent[courseId];
    const userCourse = enrichedUserCourses.find(uc => uc.id === courseId);
    const progress = userCourse ? userCourse.progress : 0;
    
    if (!course || !content) {
        document.getElementById('course-title-content').textContent = course.title;
        document.getElementById('course-description-content').textContent = course.description;
        document.getElementById('course-main-content').innerHTML = `<p class="text-center text-xl text-gray-400 mt-12">Content for this course is not yet available. Check back soon!</p>`;
    } else {
        document.getElementById('course-title-content').textContent = course.title;
        document.getElementById('course-description-content').textContent = `Progress: ${progress}%`;
        document.getElementById('course-main-content').innerHTML = content.mainContent + content.skillsGained;
    }
    showSection('course-content-view');
};