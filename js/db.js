/**
 * StudySphere - Database & Local Storage Manager
 * Handles data persistence, retrieval, and initialization with premium mock data.
 */

const DB_PREFIX = 'studysphere_';

// Initial Mock Data
const MOCK_PROFILE = {
    name: 'Alex Johnson',
    email: 'alex.johnson@university.edu',
    role: 'Undergraduate',
    institution: 'Tech State University',
    bio: 'Computer Science sophomore passionate about web development, UI/UX, and machine learning. Always up for group study and building cool projects!',
    skills: ['JavaScript', 'HTML/CSS', 'Python', 'Algorithms', 'UI Design'],
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop&crop=face'
};

const MOCK_NOTES = [
    {   
        id: 'note-1',
        title: 'Data Structures Cheat Sheet',
        description: 'Comprehensive summary of arrays, linked lists, stacks, queues, trees, and graphs with time complexities.',
        subject: 'Computer Science',
        fileContent: '# Data Structures Cheat Sheet\n\n## Time Complexities\n- Array: Access O(1), Search O(n), Insertion O(n), Deletion O(n)\n- Linked List: Access O(n), Search O(n), Insertion O(1), Deletion O(1)\n- BST (Average): Access O(log n), Search O(log n), Insertion O(log n), Deletion O(log n)\n- Hash Table: Access N/A, Search O(1), Insertion O(1), Deletion O(1)\n\n## Common Operations\nRemember to check for edge cases like empty lists, single element lists, and cycles in linked lists.',
        tags: ['CS', 'CheatSheet', 'Algorithms'],
        author: 'profile-default',
        authorName: 'Alex Johnson',
        date: '2026-05-28',
        downloads: 42,
        bookmarksCount: 15,
        bookmarkedBy: []
    },
    {
        id: 'note-2',
        title: 'Calculus II Integration Techniques',
        description: 'Detailed steps and formulas for Integration by Parts, Trigonometric Substitution, and Partial Fractions.',
        subject: 'Mathematics',
        fileContent: '# Calculus II: Integration Techniques\n\n## 1. Integration by Parts\nFormula: ∫ u dv = uv - ∫ v du\nRule of thumb for choosing u: LIATE\n- L: Logarithmic functions\n- I: Inverse trigonometric functions\n- A: Algebraic functions\n- T: Trigonometric functions\n- E: Exponential functions\n\n## 2. Trig Substitution\n- For √(a² - x²), let x = a sin(θ)\n- For √(a² + x²), let x = a tan(θ)\n- For √(x² - a²), let x = a sec(θ)',
        tags: ['Math', 'Calculus', 'ExamPrep'],
        author: 'user-99',
        authorName: 'Sarah Jenkins',
        date: '2026-05-25',
        downloads: 28,
        bookmarksCount: 8,
        bookmarkedBy: ['profile-default']
    },
    {
        id: 'note-3',
        title: 'UI Design Principles for Web Developers',
        description: 'Notes on typography, visual hierarchy, spacing, contrast, and color theory for creating beautiful web apps.',
        subject: 'UI/UX Design',
        fileContent: '# UI Design Principles\n\n## Hierarchy\n- Use font weight, size, and color to establish what is most important.\n- The user should read the heading, then sub-heading, then body.\n\n## Spacing (The 8pt Grid)\n- Use multiples of 8px for margins, paddings, and layout dimensions.\n- Consistent spacing creates a rhythm and makes the design feel balanced.\n\n## Contrast & Color\n- Ensure WCAG AA compliance (4.5:1 ratio for regular text).\n- Choose one primary brand color, one accent, and neutral dark/light shades.',
        tags: ['Design', 'Frontend', 'CSS'],
        author: 'user-101',
        authorName: 'Marcus Chen',
        date: '2026-05-29',
        downloads: 56,
        bookmarksCount: 22,
        bookmarkedBy: []
    }
];

const MOCK_GROUPS = [
    {
        id: 'group-1',
        name: 'Algorithms & LeetCode Practice',
        description: 'Weekly study sessions resolving LeetCode medium/hard questions. Focused on dynamic programming and graphs.',
        subject: 'Computer Science',
        privacy: 'Public',
        maxMembers: 10,
        members: ['profile-default', 'user-99', 'user-101', 'user-102'],
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        schedule: 'Every Thursday, 6:00 PM',
        createdBy: 'profile-default',
        createdByName: 'Alex Johnson'
    },
    {
        id: 'group-2',
        name: 'Physics II - Electromagnetism Study',
        description: 'For students currently enrolled in Physics II. Preparing for midterm and discussing homework assignments.',
        subject: 'Physics',
        privacy: 'Public',
        maxMembers: 8,
        members: ['user-99', 'user-105', 'user-106'],
        meetingLink: 'https://meet.google.com/xyz-uvwx-yza',
        schedule: 'Mondays and Wednesdays, 4:00 PM',
        createdBy: 'user-99',
        createdByName: 'Sarah Jenkins'
    },
    {
        id: 'group-3',
        name: 'Web Dev Frontend Hackers',
        description: 'Let\'s collaborate on web projects, share design ideas, and discuss frontend frameworks (React, Vue, Vanilla).',
        subject: 'Web Development',
        privacy: 'Public',
        maxMembers: 15,
        members: ['profile-default', 'user-101', 'user-108'],
        meetingLink: 'https://meet.google.com/qwe-rtyu-iop',
        schedule: 'Bi-weekly on Saturdays, 2:00 PM',
        createdBy: 'user-101',
        createdByName: 'Marcus Chen'
    }
];

const MOCK_ASSIGNMENTS = [
    {
        id: 'assign-1',
        title: 'Operating Systems Lab 3',
        course: 'CS-302 Operating Systems',
        dueDate: '2026-06-05T23:59',
        priority: 'High',
        status: 'In Progress',
        createdBy: 'profile-default'
    },
    {
        id: 'assign-2',
        title: 'Database Normalization Essay',
        course: 'CS-340 Databases',
        dueDate: '2026-06-02T12:00',
        priority: 'Medium',
        status: 'Not Started',
        createdBy: 'profile-default'
    },
    {
        id: 'assign-3',
        title: 'Discrete Math Assignment 5',
        course: 'MATH-220 Discrete Math',
        dueDate: '2026-05-31T23:59',
        priority: 'High',
        status: 'Not Started',
        createdBy: 'profile-default'
    },
    {
        id: 'assign-4',
        title: 'Technical Writing Proposal',
        course: 'ENG-201 Technical Writing',
        dueDate: '2026-06-15T09:00',
        priority: 'Low',
        status: 'Completed',
        createdBy: 'profile-default'
    }
];

const MOCK_RESOURCES = [
    {
        id: 'res-1',
        title: 'JavaScript Info',
        category: 'Tutorials',
        url: 'https://javascript.info/',
        description: 'From the basics to advanced topics with simple, but detailed explanations.',
        addedBy: 'profile-default',
        addedByName: 'Alex Johnson',
        date: '2026-05-28',
        bookmarkedBy: ['profile-default']
    },
    {
        id: 'res-2',
        title: 'Visualgo - Visualizing Data Structures',
        category: 'Tools',
        url: 'https://visualgo.net/',
        description: 'Interactive animations for understanding data structures and algorithms visually.',
        addedBy: 'user-101',
        addedByName: 'Marcus Chen',
        date: '2026-05-27',
        bookmarkedBy: []
    },
    {
        id: 'res-3',
        title: 'MIT OpenCourseWare - Linear Algebra',
        category: 'Video Lectures',
        url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
        description: 'Complete lecture series by Professor Gilbert Strang. Highly recommended for Machine Learning concepts.',
        addedBy: 'user-99',
        addedByName: 'Sarah Jenkins',
        date: '2026-05-26',
        bookmarkedBy: ['profile-default']
    },
    {
        id: 'res-4',
        title: 'UI/UX Design Patterns & Inspiration',
        category: 'Cheatsheets',
        url: 'https://refactoringui.com/',
        description: 'Practical tips to improve your designs using developer-friendly UI guidelines.',
        addedBy: 'profile-default',
        addedByName: 'Alex Johnson',
        date: '2026-05-29',
        bookmarkedBy: []
    }
];

const MOCK_FORUM = [
    {
        id: 'post-1',
        title: 'How to intuitively understand dynamic programming?',
        content: 'I\'m struggling to solve DP problems on LeetCode. I understand recursion, but when it comes to memoization or tabulation, I get lost. How did you guys build the intuition for DP? Any recommended tutorials or steps to follow?',
        category: 'Computer Science',
        tags: ['DP', 'Algorithms', 'LeetCode'],
        author: 'user-99',
        authorName: 'Sarah Jenkins',
        date: '2026-05-27',
        upvotes: 18,
        replies: [
            {
                id: 'reply-1',
                content: 'Start with the simplest recursive relationship (like Fibonacci or grid traveler). Draw the recursion tree. Notice the overlapping subproblems. Once you see the tree, storing the results (memoization) is just adding a hashmap/array. Tabulation (bottom-up) is just filling that same structure from bottom to top!',
                author: 'profile-default',
                authorName: 'Alex Johnson',
                date: '2026-05-27'
            },
            {
                id: 'reply-2',
                content: 'I highly recommend the "Dynamic Programming" course by freeCodeCamp on YouTube. It is 5 hours long and takes you step-by-step from recursion to DP. It changed my perspective completely.',
                author: 'user-101',
                authorName: 'Marcus Chen',
                date: '2026-05-28'
            }
        ]
    },
    {
        id: 'post-2',
        title: 'Tips for managing coding projects with academic work?',
        content: 'Between lectures, assignments, and study groups, I find it hard to maintain consistent progress on my side portfolio projects. Does anyone have a system or calendar routine that works without causing burnout?',
        category: 'General',
        tags: ['Productivity', 'TimeManagement', 'Tips'],
        author: 'profile-default',
        authorName: 'Alex Johnson',
        date: '2026-05-29',
        upvotes: 24,
        replies: [
            {
                id: 'reply-3',
                content: 'I block 45 minutes every morning before lectures for personal coding. Since it is the first thing I do, it always gets done. Also, use Git branches to break down tasks into tiny pieces so you can work on them in 15-minute intervals.',
                author: 'user-102',
                authorName: 'Elena Rostova',
                date: '2026-05-29'
            }
        ]
    }
];

// DB Helper Functions
const db = {
    init() {
        if (!localStorage.getItem(DB_PREFIX + 'profile')) {
            localStorage.setItem(DB_PREFIX + 'profile', JSON.stringify(MOCK_PROFILE));
            localStorage.setItem(DB_PREFIX + 'notes', JSON.stringify(MOCK_NOTES));
            localStorage.setItem(DB_PREFIX + 'groups', JSON.stringify(MOCK_GROUPS));
            localStorage.setItem(DB_PREFIX + 'assignments', JSON.stringify(MOCK_ASSIGNMENTS));
            localStorage.setItem(DB_PREFIX + 'resources', JSON.stringify(MOCK_RESOURCES));
            localStorage.setItem(DB_PREFIX + 'forum', JSON.stringify(MOCK_FORUM));
            console.log('StudySphere database initialized with mock data.');
        }
    },

    // PROFILE
    getProfile() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'profile'));
    },
    saveProfile(profile) {
        localStorage.setItem(DB_PREFIX + 'profile', JSON.stringify(profile));
        // Update user author name across resources/notes/groups/forum where author is 'profile-default'
        this.updateProfileNameAcrossDB(profile.name);
        return profile;
    },

    updateProfileNameAcrossDB(newName) {
        // Notes
        const notes = this.getNotes();
        notes.forEach(n => { if (n.author === 'profile-default') n.authorName = newName; });
        this.saveNotesList(notes);

        // Groups
        const groups = this.getGroups();
        groups.forEach(g => { if (g.createdBy === 'profile-default') g.createdByName = newName; });
        this.saveGroupsList(groups);

        // Resources
        const resources = this.getResources();
        resources.forEach(r => { if (r.addedBy === 'profile-default') r.addedByName = newName; });
        this.saveResourcesList(resources);

        // Forum
        const forum = this.getForum();
        forum.forEach(p => {
            if (p.author === 'profile-default') p.authorName = newName;
            p.replies.forEach(r => {
                if (r.author === 'profile-default') r.authorName = newName;
            });
        });
        this.saveForumList(forum);
    },

    // NOTES
    getNotes() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'notes')) || [];
    },
    saveNotesList(notes) {
        localStorage.setItem(DB_PREFIX + 'notes', JSON.stringify(notes));
    },
    addNote(note) {
        const notes = this.getNotes();
        const newNote = {
            id: 'note-' + Date.now(),
            downloads: 0,
            bookmarksCount: 0,
            bookmarkedBy: [],
            author: 'profile-default',
            authorName: this.getProfile().name,
            date: new Date().toISOString().split('T')[0],
            ...note
        };
        notes.unshift(newNote);
        this.saveNotesList(notes);
        return newNote;
    },
    updateNote(id, updatedFields) {
        const notes = this.getNotes();
        const index = notes.findIndex(n => n.id === id);
        if (index !== -1) {
            notes[index] = { ...notes[index], ...updatedFields };
            this.saveNotesList(notes);
            return notes[index];
        }
        return null;
    },
    deleteNote(id) {
        let notes = this.getNotes();
        notes = notes.filter(n => n.id !== id);
        this.saveNotesList(notes);
    },
    toggleBookmarkNote(id) {
        const notes = this.getNotes();
        const note = notes.find(n => n.id === id);
        if (note) {
            const index = note.bookmarkedBy.indexOf('profile-default');
            if (index === -1) {
                note.bookmarkedBy.push('profile-default');
                note.bookmarksCount++;
            } else {
                note.bookmarkedBy.splice(index, 1);
                note.bookmarksCount--;
            }
            this.saveNotesList(notes);
            return note;
        }
        return null;
    },
    incrementDownloads(id) {
        const notes = this.getNotes();
        const note = notes.find(n => n.id === id);
        if (note) {
            note.downloads++;
            this.saveNotesList(notes);
            return note;
        }
        return null;
    },

    // GROUPS
    getGroups() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'groups')) || [];
    },
    saveGroupsList(groups) {
        localStorage.setItem(DB_PREFIX + 'groups', JSON.stringify(groups));
    },
    createGroup(group) {
        const groups = this.getGroups();
        const newGroup = {
            id: 'group-' + Date.now(),
            members: ['profile-default'],
            createdBy: 'profile-default',
            createdByName: this.getProfile().name,
            ...group
        };
        groups.push(newGroup);
        this.saveGroupsList(groups);
        return newGroup;
    },
    updateGroup(id, updatedFields) {
        const groups = this.getGroups();
        const index = groups.findIndex(g => g.id === id);
        if (index !== -1) {
            groups[index] = { ...groups[index], ...updatedFields };
            this.saveGroupsList(groups);
            return groups[index];
        }
        return null;
    },
    deleteGroup(id) {
        let groups = this.getGroups();
        groups = groups.filter(g => g.id !== id);
        this.saveGroupsList(groups);
    },
    toggleJoinGroup(id) {
        const groups = this.getGroups();
        const group = groups.find(g => g.id === id);
        if (group) {
            const index = group.members.indexOf('profile-default');
            if (index === -1) {
                // Check if full
                if (group.members.length < group.maxMembers) {
                    group.members.push('profile-default');
                } else {
                    throw new Error('Study group is full');
                }
            } else {
                // Leave group (can't leave if they created it, or can we? Let's say we can, but we warn, or we just remove them)
                group.members.splice(index, 1);
            }
            this.saveGroupsList(groups);
            return group;
        }
        return null;
    },

    // ASSIGNMENTS
    getAssignments() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'assignments')) || [];
    },
    saveAssignmentsList(assignments) {
        localStorage.setItem(DB_PREFIX + 'assignments', JSON.stringify(assignments));
    },
    addAssignment(assign) {
        const assignments = this.getAssignments();
        const newAssign = {
            id: 'assign-' + Date.now(),
            createdBy: 'profile-default',
            status: 'Not Started',
            ...assign
        };
        assignments.push(newAssign);
        this.saveAssignmentsList(assignments);
        return newAssign;
    },
    updateAssignment(id, updatedFields) {
        const assignments = this.getAssignments();
        const index = assignments.findIndex(a => a.id === id);
        if (index !== -1) {
            assignments[index] = { ...assignments[index], ...updatedFields };
            this.saveAssignmentsList(assignments);
            return assignments[index];
        }
        return null;
    },
    deleteAssignment(id) {
        let assignments = this.getAssignments();
        assignments = assignments.filter(a => a.id !== id);
        this.saveAssignmentsList(assignments);
    },

    // RESOURCES
    getResources() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'resources')) || [];
    },
    saveResourcesList(resources) {
        localStorage.setItem(DB_PREFIX + 'resources', JSON.stringify(resources));
    },
    addResource(res) {
        const resources = this.getResources();
        const newRes = {
            id: 'res-' + Date.now(),
            addedBy: 'profile-default',
            addedByName: this.getProfile().name,
            date: new Date().toISOString().split('T')[0],
            bookmarkedBy: [],
            ...res
        };
        resources.unshift(newRes);
        this.saveResourcesList(resources);
        return newRes;
    },
    updateResource(id, updatedFields) {
        const resources = this.getResources();
        const index = resources.findIndex(r => r.id === id);
        if (index !== -1) {
            resources[index] = { ...resources[index], ...updatedFields };
            this.saveResourcesList(resources);
            return resources[index];
        }
        return null;
    },
    deleteResource(id) {
        let resources = this.getResources();
        resources = resources.filter(r => r.id !== id);
        this.saveResourcesList(resources);
    },
    toggleBookmarkResource(id) {
        const resources = this.getResources();
        const res = resources.find(r => r.id === id);
        if (res) {
            const index = res.bookmarkedBy.indexOf('profile-default');
            if (index === -1) {
                res.bookmarkedBy.push('profile-default');
            } else {
                res.bookmarkedBy.splice(index, 1);
            }
            this.saveResourcesList(resources);
            return res;
        }
        return null;
    },

    // DISCUSSION FORUM
    getForum() {
        return JSON.parse(localStorage.getItem(DB_PREFIX + 'forum')) || [];
    },
    saveForumList(forum) {
        localStorage.setItem(DB_PREFIX + 'forum', JSON.stringify(forum));
    },
    addForumPost(post) {
        const forum = this.getForum();
        const newPost = {
            id: 'post-' + Date.now(),
            author: 'profile-default',
            authorName: this.getProfile().name,
            date: new Date().toISOString().split('T')[0],
            upvotes: 0,
            replies: [],
            ...post
        };
        forum.unshift(newPost);
        this.saveForumList(forum);
        return newPost;
    },
    upvotePost(id) {
        const forum = this.getForum();
        const post = forum.find(p => p.id === id);
        if (post) {
            post.upvotes++;
            this.saveForumList(forum);
            return post;
        }
        return null;
    },
    addReply(postId, replyContent) {
        const forum = this.getForum();
        const post = forum.find(p => p.id === postId);
        if (post) {
            const newReply = {
                id: 'reply-' + Date.now(),
                content: replyContent,
                author: 'profile-default',
                authorName: this.getProfile().name,
                date: new Date().toISOString().split('T')[0]
            };
            post.replies.push(newReply);
            this.saveForumList(forum);
            return post;
        }
        return null;
    },
    deleteForumPost(id) {
        let forum = this.getForum();
        forum = forum.filter(p => p.id !== id);
        this.saveForumList(forum);
    }
};

// Initialize DB on script load
db.init();

// Export to window for global access
window.db = db;
