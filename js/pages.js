/**
 * StudySphere - Page Renderers & Action Handlers
 * Handles rendering HTML views dynamically, form submissions, and UI state updates.
 */

window.pages = (() => {
    // Page states for filters and search queries
    const state = {
        notes: { filter: 'All', search: '' },
        groups: { filter: 'All', search: '' },
        assignments: { statusFilter: 'All', priorityFilter: 'All', search: '' },
        resources: { category: 'All', search: '' },
        forum: { category: 'All', search: '', activeThreadId: null }
    };

    // Helper: format date nicely
    function formatDate(dateStr) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString(undefined, options);
    }

    // Helper: calculate time remaining for deadlines
    function getDueStatus(dueDateStr) {
        const now = new Date();
        const due = new Date(dueDateStr);
        const diffMs = due - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffMs < 0) return { text: 'Overdue', class: 'overdue' };
        if (diffHours <= 24) return { text: 'Due Soon', class: 'upcoming' };
        return { text: formatDate(dueDateStr), class: '' };
    }

    // Global Search Delegator
    function handleGlobalSearch(hash, query) {
        if (state[hash] !== undefined) {
            state[hash].search = query;
            
            // Trigger specific rendering based on hash
            if (hash === 'notes') renderNotes();
            if (hash === 'groups') renderGroups();
            if (hash === 'assignments') renderAssignments();
            if (hash === 'resources') renderResources();
            if (hash === 'forum') renderForum();
        }
    }

    // ==========================================================================
    // DASHBOARD PAGE
    // ==========================================================================
    function renderDashboard() {
        const container = document.getElementById('page-container');
        const profile = window.db.getProfile();
        const notes = window.db.getNotes();
        const groups = window.db.getGroups();
        const assignments = window.db.getAssignments();
        const forum = window.db.getForum();

        // Calculate counts for stats
        const noteUploads = notes.filter(n => n.author === 'profile-default').length;
        const groupsJoined = groups.filter(g => g.members.includes('profile-default')).length;
        const pendingAssignments = assignments.filter(a => a.status !== 'Completed').length;
        const forumPosts = forum.filter(f => f.author === 'profile-default').length;

        // Welcome greeting based on time of day
        const hours = new Date().getHours();
        let greeting = 'Good Evening';
        if (hours < 12) greeting = 'Good Morning';
        else if (hours < 18) greeting = 'Good Afternoon';

        // Render HTML
        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Welcome, ${profile.name}!</h1>
                    <p>${greeting}. Here is your academic snapshot for today.</p>
                </div>
                <div class="page-actions">
                    <a href="#assignments" class="btn btn-primary"><i data-lucide="plus"></i> Add Assignment</a>
                </div>
            </div>

            <!-- Stats Widgets -->
            <div class="stats-grid">
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i data-lucide="book-open"></i></div>
                    <div class="stat-info">
                        <span class="stat-value">${noteUploads}</span>
                        <span class="stat-label">Notes Uploaded</span>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon" style="color: var(--secondary); background-color: var(--secondary-glow);"><i data-lucide="users"></i></div>
                    <div class="stat-info">
                        <span class="stat-value">${groupsJoined}</span>
                        <span class="stat-label">Study Groups</span>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon" style="color: var(--warning); background-color: rgba(var(--warning-rgb), 0.1);"><i data-lucide="clock"></i></div>
                    <div class="stat-info">
                        <span class="stat-value">${pendingAssignments}</span>
                        <span class="stat-label">Pending Assignments</span>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon" style="color: var(--accent); background-color: rgba(var(--accent-rgb), 0.1);"><i data-lucide="message-square"></i></div>
                    <div class="stat-info">
                        <span class="stat-value">${forumPosts}</span>
                        <span class="stat-label">Forum Posts</span>
                    </div>
                </div>
            </div>

            <!-- Dashboard Content Layout -->
            <div class="dashboard-layout">
                <!-- Left Column -->
                <div class="dashboard-left">
                    <!-- Upcoming Assignments Widget -->
                    <div class="glass-card">
                        <div class="section-card-header">
                            <h2><i data-lucide="calendar"></i> Upcoming Assignments</h2>
                            <a href="#assignments" class="btn-link-btn" style="font-size:0.85rem">View All</a>
                        </div>
                        <div class="dashboard-list">
                            ${assignments.filter(a => a.status !== 'Completed')
                                .sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate))
                                .slice(0, 3)
                                .map(a => {
                                    const dueStatus = getDueStatus(a.dueDate);
                                    const priorityClass = a.priority === 'High' ? 'badge-accent' : (a.priority === 'Medium' ? 'badge-warning' : 'badge-primary');
                                    return `
                                        <div class="dashboard-item">
                                            <div class="dashboard-item-info">
                                                <span class="dashboard-item-title">${a.title}</span>
                                                <span class="dashboard-item-meta">
                                                    <span>${a.course}</span> • 
                                                    <span class="${dueStatus.class}">Due: ${dueStatus.text}</span>
                                                </span>
                                            </div>
                                            <div style="display:flex; align-items:center; gap:12px;">
                                                <span class="badge ${priorityClass}">${a.priority}</span>
                                                <button class="btn btn-icon btn-sm" onclick="pages.quickCompleteAssignment('${a.id}')" title="Mark as Completed">
                                                    <i data-lucide="check"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `;
                                }).join('') || '<div class="text-muted" style="text-align:center; padding:12px 0;">🎉 No pending assignments!</div>'}
                        </div>
                    </div>

                    <!-- Recent Notes Widget -->
                    <div class="glass-card">
                        <div class="section-card-header">
                            <h2><i data-lucide="file-text"></i> Recent Notes</h2>
                            <a href="#notes" class="btn-link-btn" style="font-size:0.85rem">Browse Notes</a>
                        </div>
                        <div class="dashboard-list">
                            ${notes.slice(0, 3).map(n => `
                                <div class="dashboard-item">
                                    <div class="dashboard-item-info">
                                        <span class="dashboard-item-title">${n.title}</span>
                                        <span class="dashboard-item-meta">
                                            <span>by ${n.authorName}</span> • 
                                            <span>${n.subject}</span>
                                        </span>
                                    </div>
                                    <span class="badge badge-secondary" style="font-size: 0.75rem;"><i data-lucide="download" style="width:12px;height:12px;"></i> ${n.downloads}</span>
                                </div>
                            `).join('') || '<div class="text-muted">No notes available.</div>'}
                        </div>
                    </div>
                </div>

                <!-- Right Column -->
                <div class="dashboard-right">
                    <!-- Active Groups Widget -->
                    <div class="glass-card">
                        <div class="section-card-header">
                            <h2><i data-lucide="users"></i> Active Study Groups</h2>
                            <a href="#groups" class="btn-link-btn" style="font-size:0.85rem">View All</a>
                        </div>
                        <div class="dashboard-list">
                            ${groups.slice(0, 3).map(g => {
                                const isMember = g.members.includes('profile-default');
                                return `
                                    <div class="dashboard-item">
                                        <div class="dashboard-item-info">
                                            <span class="dashboard-item-title">${g.name}</span>
                                            <span class="dashboard-item-meta">
                                                <span>${g.schedule}</span>
                                            </span>
                                        </div>
                                        <button class="btn ${isMember ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="pages.quickToggleGroup('${g.id}')">
                                            ${isMember ? 'Leave' : 'Join'}
                                        </button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Latest Discussions Widget -->
                    <div class="glass-card">
                        <div class="section-card-header">
                            <h2><i data-lucide="message-square"></i> Latest Discussions</h2>
                            <a href="#forum" class="btn-link-btn" style="font-size:0.85rem">Visit Forum</a>
                        </div>
                        <div class="dashboard-list">
                            ${forum.slice(0, 3).map(f => `
                                <div class="dashboard-item" style="cursor:pointer;" onclick="pages.viewForumThread('${f.id}')">
                                    <div class="dashboard-item-info">
                                        <span class="dashboard-item-title">${f.title}</span>
                                        <span class="dashboard-item-meta">
                                            <span>${f.replies.length} replies</span> • 
                                            <span>${f.category}</span>
                                        </span>
                                    </div>
                                    <span class="badge badge-primary"><i data-lucide="thumbs-up" style="width:12px;height:12px;"></i> ${f.upvotes}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function quickCompleteAssignment(id) {
        window.db.updateAssignment(id, { status: 'Completed' });
        showToast('Assignment Completed', 'Status updated successfully', 'success');
        renderDashboard();
    }

    function quickToggleGroup(id) {
        try {
            const group = window.db.toggleJoinGroup(id);
            const isMember = group.members.includes('profile-default');
            showToast(
                isMember ? 'Joined Group' : 'Left Group',
                isMember ? `You joined ${group.name}` : `You left ${group.name}`,
                'success'
            );
            renderDashboard();
        } catch (err) {
            showToast('Error', err.message, 'error');
        }
    }

    // ==========================================================================
    // NOTES PAGE
    // ==========================================================================
    function renderNotes() {
        const container = document.getElementById('page-container');
        const notes = window.db.getNotes();
        const profile = window.db.getProfile();

        // Subjects list dynamically compiled
        const subjects = ['All', ...new Set(notes.map(n => n.subject))];

        // Apply filters & search
        let filteredNotes = notes;
        if (state.notes.filter !== 'All') {
            filteredNotes = filteredNotes.filter(n => n.subject === state.notes.filter);
        }
        if (state.notes.search) {
            const q = state.notes.search.toLowerCase();
            filteredNotes = filteredNotes.filter(n => 
                n.title.toLowerCase().includes(q) || 
                n.description.toLowerCase().includes(q) || 
                n.tags.some(t => t.toLowerCase().includes(q))
            );
        }

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Note Sharing</h1>
                    <p>Upload, download, and study notes shared by your peers.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="openModal('upload-note-modal')"><i data-lucide="upload"></i> Upload Note</button>
                </div>
            </div>

            <div class="controls-row">
                <div class="filters-group">
                    ${subjects.map(sub => `
                        <button class="filter-btn ${state.notes.filter === sub ? 'active' : ''}" onclick="pages.setNotesFilter('${sub}')">
                            ${sub}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="notes-grid">
                ${filteredNotes.map(n => {
                    const isOwner = n.author === 'profile-default';
                    const isBookmarked = n.bookmarkedBy.includes('profile-default');
                    return `
                        <div class="glass-card note-card interactive">
                            <div>
                                <div class="note-card-header">
                                    <span class="badge badge-primary">${n.subject}</span>
                                    <button class="btn-icon ${isBookmarked ? 'active' : ''}" onclick="pages.bookmarkNote('${n.id}')" title="Bookmark Note">
                                        <i data-lucide="bookmark"></i>
                                    </button>
                                </div>
                                <h3 style="cursor:pointer;" onclick="pages.viewNoteDetail('${n.id}')">${n.title}</h3>
                                <p class="note-description">${n.description}</p>
                                <div class="note-tags">
                                    ${n.tags.map(t => `<span class="note-tag">#${t}</span>`).join('')}
                                </div>
                            </div>
                            <div class="note-footer">
                                <div class="note-author">
                                    <img class="note-author-avatar" src="${isOwner ? profile.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face'}" alt="${n.authorName}">
                                    <span>${n.authorName}</span>
                                </div>
                                <div class="note-actions">
                                    <button class="btn btn-secondary btn-sm" onclick="pages.downloadNote('${n.id}')" title="Download Note">
                                        <i data-lucide="download" style="width:14px;height:14px;"></i> ${n.downloads}
                                    </button>
                                    ${isOwner ? `
                                        <button class="btn btn-danger btn-icon btn-sm" onclick="pages.deleteNote('${n.id}')" title="Delete Note">
                                            <i data-lucide="trash-2" style="width:14px;height:14px;"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') || '<div class="glass-card" style="grid-column: span 3; text-align:center; padding: 40px; color: var(--text-secondary);">No notes found matching your filters.</div>'}
            </div>

            <!-- Upload Note Modal -->
            <div id="upload-note-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Upload New Note</h3>
                        <button class="modal-close-btn" onclick="closeModal('upload-note-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitNoteForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Note Title</label>
                                <input type="text" class="form-control" name="title" required placeholder="e.g. Intro to Quantum Physics">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Subject/Category</label>
                                    <input type="text" class="form-control" name="subject" required placeholder="e.g. Physics">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Tags (comma separated)</label>
                                    <input type="text" class="form-control" name="tags" placeholder="e.g. physics, quantum, notes">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Brief Description</label>
                                <textarea class="form-control" name="description" required placeholder="Describe what these notes cover..." rows="2"></textarea>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Note Contents (Markdown / Text)</label>
                                <textarea class="form-control" name="fileContent" required placeholder="Type or paste note contents here..." rows="6"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('upload-note-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Upload</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- View Note Modal -->
            <div id="view-note-modal" class="modal-overlay">
                <div class="modal-container" style="max-width: 700px;">
                    <div class="modal-header">
                        <h3 id="view-note-title">Note Detail</h3>
                        <button class="modal-close-btn" onclick="closeModal('view-note-modal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                            <span class="badge badge-primary" id="view-note-subject"></span>
                            <span id="view-note-author" style="font-size:0.85rem; color:var(--text-secondary);"></span>
                        </div>
                        <div id="view-note-body" style="background-color:var(--bg-primary); border:1px solid var(--border-color); padding:20px; border-radius:var(--radius-md); overflow-y:auto; max-height:350px; font-family: monospace; white-space: pre-wrap;"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" id="view-note-download-btn"><i data-lucide="download"></i> Download</button>
                        <button class="btn btn-primary" onclick="closeModal('view-note-modal')">Close</button>
                    </div>
                </div>
            </div>
        `;
    }

    function setNotesFilter(subject) {
        state.notes.filter = subject;
        renderNotes();
        if (window.lucide) lucide.createIcons();
    }

    function submitNoteForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const tags = fd.get('tags').split(',').map(t => t.trim()).filter(Boolean);
        
        window.db.addNote({
            title: fd.get('title'),
            subject: fd.get('subject'),
            description: fd.get('description'),
            fileContent: fd.get('fileContent'),
            tags: tags
        });

        closeModal('upload-note-modal');
        showToast('Note Uploaded', 'Your note has been successfully shared!', 'success');
        renderNotes();
        if (window.lucide) lucide.createIcons();
    }

    function deleteNote(id) {
        if (confirm('Are you sure you want to delete this note?')) {
            window.db.deleteNote(id);
            showToast('Note Deleted', 'The note has been removed.', 'success');
            renderNotes();
            if (window.lucide) lucide.createIcons();
        }
    }

    function bookmarkNote(id) {
        window.db.toggleBookmarkNote(id);
        renderNotes();
        if (window.lucide) lucide.createIcons();
    }

    function downloadNote(id) {
        const note = window.db.incrementDownloads(id);
        if (note) {
            // Trigger actual browser download
            const blob = new Blob([note.fileContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${note.title.toLowerCase().replace(/ /g, '_')}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Downloading', `Downloading file for ${note.title}...`, 'success');
            renderNotes();
            if (window.lucide) lucide.createIcons();
        }
    }

    function viewNoteDetail(id) {
        const note = window.db.getNotes().find(n => n.id === id);
        if (note) {
            document.getElementById('view-note-title').innerText = note.title;
            document.getElementById('view-note-subject').innerText = note.subject;
            document.getElementById('view-note-author').innerText = `Uploaded by ${note.authorName} on ${formatDate(note.date)}`;
            document.getElementById('view-note-body').innerText = note.fileContent;
            
            const dlBtn = document.getElementById('view-note-download-btn');
            dlBtn.onclick = () => {
                downloadNote(note.id);
                closeModal('view-note-modal');
            };
            
            openModal('view-note-modal');
        }
    }

    // ==========================================================================
    // STUDY GROUPS PAGE
    // ==========================================================================
    function renderGroups() {
        const container = document.getElementById('page-container');
        const groups = window.db.getGroups();
        const profile = window.db.getProfile();

        // Apply search & filtering
        let filteredGroups = groups;
        if (state.groups.filter === 'Joined') {
            filteredGroups = filteredGroups.filter(g => g.members.includes('profile-default'));
        } else if (state.groups.filter === 'Created') {
            filteredGroups = filteredGroups.filter(g => g.createdBy === 'profile-default');
        }

        if (state.groups.search) {
            const q = state.groups.search.toLowerCase();
            filteredGroups = filteredGroups.filter(g => 
                g.name.toLowerCase().includes(q) || 
                g.description.toLowerCase().includes(q) ||
                g.subject.toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Study Groups</h1>
                    <p>Join active study groups or create a new one to collaborate.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="openModal('create-group-modal')"><i data-lucide="plus"></i> Create Group</button>
                </div>
            </div>

            <div class="controls-row">
                <div class="filters-group">
                    <button class="filter-btn ${state.groups.filter === 'All' ? 'active' : ''}" onclick="pages.setGroupsFilter('All')">All Groups</button>
                    <button class="filter-btn ${state.groups.filter === 'Joined' ? 'active' : ''}" onclick="pages.setGroupsFilter('Joined')">Joined</button>
                    <button class="filter-btn ${state.groups.filter === 'Created' ? 'active' : ''}" onclick="pages.setGroupsFilter('Created')">Created By Me</button>
                </div>
            </div>

            <div class="groups-grid">
                ${filteredGroups.map(g => {
                    const isMember = g.members.includes('profile-default');
                    const isCreator = g.createdBy === 'profile-default';
                    return `
                        <div class="glass-card group-card interactive">
                            <div>
                                <div class="group-card-header">
                                    <span class="badge badge-secondary">${g.subject}</span>
                                    <span class="badge badge-primary">${g.privacy}</span>
                                </div>
                                <h3>${g.name}</h3>
                                <p class="group-description">${g.description}</p>
                                <div class="group-details-list">
                                    <div class="group-detail-item"><i data-lucide="calendar"></i> <span>${g.schedule}</span></div>
                                    ${isMember ? `<div class="group-detail-item"><i data-lucide="video"></i> <a href="${g.meetingLink}" target="_blank" style="word-break:break-all;">Join Call</a></div>` : ''}
                                    <div class="group-detail-item"><i data-lucide="user"></i> <span>Created by ${g.createdByName}</span></div>
                                </div>
                            </div>
                            <div>
                                <div class="group-members">
                                    <div class="member-avatars">
                                        <!-- Simulate a few avatars -->
                                        <img class="member-avatar" src="${profile.avatar}" alt="Member">
                                        ${g.members.length > 1 ? '<img class="member-avatar" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face">' : ''}
                                        ${g.members.length > 2 ? '<img class="member-avatar" src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50&h=50&fit=crop&crop=face">' : ''}
                                    </div>
                                    <span class="member-count-text">${g.members.length} / ${g.maxMembers} members</span>
                                </div>
                                <div style="display:flex; gap:8px;">
                                    <button class="btn ${isMember ? 'btn-secondary' : 'btn-primary'} btn-sm" style="flex:1;" onclick="pages.toggleJoinGroup('${g.id}')">
                                        ${isMember ? 'Leave Group' : 'Join Group'}
                                    </button>
                                    ${isCreator ? `
                                        <button class="btn btn-danger btn-icon btn-sm" onclick="pages.deleteGroup('${g.id}')">
                                            <i data-lucide="trash-2"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') || '<div class="glass-card" style="grid-column: span 3; text-align:center; padding: 40px; color: var(--text-secondary);">No groups found. Create one to get started!</div>'}
            </div>

            <!-- Create Group Modal -->
            <div id="create-group-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Create Study Group</h3>
                        <button class="modal-close-btn" onclick="closeModal('create-group-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitGroupForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Group Name</label>
                                <input type="text" class="form-control" name="name" required placeholder="e.g. Calculus II Exam Study">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Subject</label>
                                <input type="text" class="form-control" name="subject" required placeholder="e.g. Mathematics">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Privacy</label>
                                    <select class="form-control" name="privacy">
                                        <option value="Public">Public</option>
                                        <option value="Private">Private</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Max Members</label>
                                    <input type="number" class="form-control" name="maxMembers" required min="2" max="50" value="10">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Schedule Description</label>
                                <input type="text" class="form-control" name="schedule" required placeholder="e.g. Tuesdays at 5:00 PM">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Meeting URL (Google Meet / Zoom)</label>
                                <input type="url" class="form-control" name="meetingLink" required placeholder="https://meet.google.com/...">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Description</label>
                                <textarea class="form-control" name="description" required placeholder="Outline the topics of study, preparation guidelines..." rows="3"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('create-group-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    function setGroupsFilter(filterVal) {
        state.groups.filter = filterVal;
        renderGroups();
        if (window.lucide) lucide.createIcons();
    }

    function toggleJoinGroup(id) {
        try {
            const group = window.db.toggleJoinGroup(id);
            const isMember = group.members.includes('profile-default');
            showToast(
                isMember ? 'Success' : 'Success',
                isMember ? `You joined ${group.name}` : `You left ${group.name}`,
                'success'
            );
            renderGroups();
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            showToast('Capacity Met', err.message, 'error');
        }
    }

    function submitGroupForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        
        window.db.createGroup({
            name: fd.get('name'),
            subject: fd.get('subject'),
            privacy: fd.get('privacy'),
            maxMembers: parseInt(fd.get('maxMembers')),
            schedule: fd.get('schedule'),
            meetingLink: fd.get('meetingLink'),
            description: fd.get('description')
        });

        closeModal('create-group-modal');
        showToast('Group Created', 'New study group launched successfully!', 'success');
        renderGroups();
        if (window.lucide) lucide.createIcons();
    }

    function deleteGroup(id) {
        if (confirm('Are you sure you want to disband this study group?')) {
            window.db.deleteGroup(id);
            showToast('Disbanded', 'The study group has been deleted.', 'success');
            renderGroups();
            if (window.lucide) lucide.createIcons();
        }
    }

    // ==========================================================================
    // ASSIGNMENTS TRACKER PAGE
    // ==========================================================================
    function renderAssignments() {
        const container = document.getElementById('page-container');
        const assignments = window.db.getAssignments();

        // Count totals
        const total = assignments.length;
        const completed = assignments.filter(a => a.status === 'Completed').length;
        const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Apply filters & search
        let filtered = assignments;
        if (state.assignments.statusFilter !== 'All') {
            filtered = filtered.filter(a => a.status === state.assignments.statusFilter);
        }
        if (state.assignments.priorityFilter !== 'All') {
            filtered = filtered.filter(a => a.priority === state.assignments.priorityFilter);
        }
        if (state.assignments.search) {
            const q = state.assignments.search.toLowerCase();
            filtered = filtered.filter(a => 
                a.title.toLowerCase().includes(q) || 
                a.course.toLowerCase().includes(q)
            );
        }

        // Sort assignments by date
        filtered.sort((a,b) => new Date(a.dueDate) - new Date(b.dueDate));

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Assignments Tracker</h1>
                    <p>Keep track of your coursework deadlines and complete tasks.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="openModal('add-assign-modal')"><i data-lucide="plus"></i> Add Assignment</button>
                </div>
            </div>

            <!-- Progress Meter -->
            <div class="glass-card" style="margin-bottom:32px; padding:20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-weight:600; font-size:0.95rem;">Overall Completion</span>
                    <span style="font-weight:700; color:var(--primary);">${percent}% (${completed}/${total} tasks)</span>
                </div>
                <div style="width:100%; height:10px; background-color:var(--bg-primary); border-radius:10px; overflow:hidden; border:1px solid var(--border-color)">
                    <div style="width:${percent}%; height:100%; background:linear-gradient(to right, var(--primary), var(--secondary)); border-radius:10px; transition: width 0.4s ease;"></div>
                </div>
            </div>

            <div class="controls-row">
                <div style="display:flex; gap:16px; flex-wrap:wrap; width:100%;">
                    <div class="form-group" style="margin-bottom:0; flex:1; min-width:200px;">
                        <select class="form-control" onchange="pages.setAssignStatusFilter(this.value)">
                            <option value="All" ${state.assignments.statusFilter === 'All' ? 'selected' : ''}>Status: All</option>
                            <option value="Not Started" ${state.assignments.statusFilter === 'Not Started' ? 'selected' : ''}>Not Started</option>
                            <option value="In Progress" ${state.assignments.statusFilter === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${state.assignments.statusFilter === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                    </div>
                    <div class="form-group" style="margin-bottom:0; flex:1; min-width:200px;">
                        <select class="form-control" onchange="pages.setAssignPriorityFilter(this.value)">
                            <option value="All" ${state.assignments.priorityFilter === 'All' ? 'selected' : ''}>Priority: All</option>
                            <option value="High" ${state.assignments.priorityFilter === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${state.assignments.priorityFilter === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${state.assignments.priorityFilter === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- List Table -->
            <div class="glass-card" style="padding:0; overflow-x:auto;">
                <div class="assignments-list">
                    <div class="assignment-row" style="border-bottom:1px solid var(--border-color); font-weight:700; color:var(--text-secondary); background:rgba(255,255,255,0.01);">
                        <div>Assignment Title</div>
                        <div>Course</div>
                        <div>Due Date</div>
                        <div>Priority</div>
                        <div>Status</div>
                        <div>Actions</div>
                    </div>
                    ${filtered.map(a => {
                        const due = getDueStatus(a.dueDate);
                        const priorityClass = a.priority === 'High' ? 'badge-accent' : (a.priority === 'Medium' ? 'badge-warning' : 'badge-primary');
                        return `
                            <div class="assignment-row" style="border-bottom: 1px solid var(--border-color)">
                                <div class="assignment-title-col">
                                    <h3 style="${a.status === 'Completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${a.title}</h3>
                                </div>
                                <div class="assignment-course">${a.course}</div>
                                <div class="assignment-date ${due.class}"><i data-lucide="clock" style="width:14px;height:14px"></i> ${due.text}</div>
                                <div><span class="badge ${priorityClass}">${a.priority}</span></div>
                                <div class="assignment-status-col">
                                    <select class="assignment-status-select" onchange="pages.updateAssignmentStatus('${a.id}', this.value)">
                                        <option value="Not Started" ${a.status === 'Not Started' ? 'selected' : ''}>Not Started</option>
                                        <option value="In Progress" ${a.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                                        <option value="Completed" ${a.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                    </select>
                                </div>
                                <div class="assignment-actions-col">
                                    <button class="btn btn-danger btn-icon btn-sm" onclick="pages.deleteAssignment('${a.id}')" title="Delete">
                                        <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('') || '<div style="padding:40px; text-align:center; color:var(--text-secondary)">No assignments matching conditions.</div>'}
                </div>
            </div>

            <!-- Add Assignment Modal -->
            <div id="add-assign-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Add Assignment</h3>
                        <button class="modal-close-btn" onclick="closeModal('add-assign-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitAssignmentForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Assignment Name</label>
                                <input type="text" class="form-control" name="title" required placeholder="e.g. Lab 4 System Calls">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Course Code / Name</label>
                                <input type="text" class="form-control" name="course" required placeholder="e.g. CS-302 Operating Systems">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Due Date & Time</label>
                                    <input type="datetime-local" class="form-control" name="dueDate" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Priority</label>
                                    <select class="form-control" name="priority">
                                        <option value="High">High</option>
                                        <option value="Medium" selected>Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('add-assign-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Assignment</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    function setAssignStatusFilter(val) {
        state.assignments.statusFilter = val;
        renderAssignments();
        if (window.lucide) lucide.createIcons();
    }

    function setAssignPriorityFilter(val) {
        state.assignments.priorityFilter = val;
        renderAssignments();
        if (window.lucide) lucide.createIcons();
    }

    function updateAssignmentStatus(id, newStatus) {
        window.db.updateAssignment(id, { status: newStatus });
        showToast('Status Updated', `Task status changed to ${newStatus}`, 'success');
        
        // Check alerts badge
        window.checkUpcomingAssignments();
        
        renderAssignments();
        if (window.lucide) lucide.createIcons();
    }

    function submitAssignmentForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        
        window.db.addAssignment({
            title: fd.get('title'),
            course: fd.get('course'),
            dueDate: fd.get('dueDate'),
            priority: fd.get('priority')
        });

        closeModal('add-assign-modal');
        showToast('Added', 'Assignment tracked successfully!', 'success');
        
        // Recalculate alerts
        window.checkUpcomingAssignments();

        renderAssignments();
        if (window.lucide) lucide.createIcons();
    }

    function deleteAssignment(id) {
        if (confirm('Delete this task?')) {
            window.db.deleteAssignment(id);
            showToast('Deleted', 'Assignment tracker item removed.', 'success');
            window.checkUpcomingAssignments();
            renderAssignments();
            if (window.lucide) lucide.createIcons();
        }
    }

    // ==========================================================================
    // RESOURCE LIBRARY PAGE
    // ==========================================================================
    function renderResources() {
        const container = document.getElementById('page-container');
        const resources = window.db.getResources();

        // Categorization definitions
        const categories = ['All', 'Tutorials', 'Tools', 'Video Lectures', 'Cheatsheets'];
        
        // Count count per categories
        const counts = { All: resources.length };
        categories.slice(1).forEach(c => {
            counts[c] = resources.filter(r => r.category === c).length;
        });

        // Filtering
        let filtered = resources;
        if (state.resources.category !== 'All') {
            filtered = filtered.filter(r => r.category === state.resources.category);
        }
        if (state.resources.search) {
            const q = state.resources.search.toLowerCase();
            filtered = filtered.filter(r => 
                r.title.toLowerCase().includes(q) || 
                r.description.toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Resource Library</h1>
                    <p>Explore links, cheatsheets, and platforms recommended by peers.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="openModal('add-resource-modal')"><i data-lucide="plus"></i> Add Resource</button>
                </div>
            </div>

            <div class="resources-layout">
                <!-- Sidebar tabs -->
                <div class="resources-sidebar">
                    ${categories.map(c => `
                        <button class="resource-category-btn ${state.resources.category === c ? 'active' : ''}" onclick="pages.setResourcesCategory('${c}')">
                            <span>${c}</span>
                            <span class="resource-category-count">${counts[c] || 0}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Main Section -->
                <div>
                    <div class="resources-grid">
                        ${filtered.map(r => {
                            const isBookmarked = r.bookmarkedBy.includes('profile-default');
                            const isOwner = r.addedBy === 'profile-default';
                            return `
                                <div class="glass-card resource-card interactive">
                                    <div>
                                        <div class="resource-card-header">
                                            <span class="badge badge-primary">${r.category}</span>
                                            <button class="btn-icon ${isBookmarked ? 'active' : ''}" onclick="pages.bookmarkResource('${r.id}')">
                                                <i data-lucide="bookmark"></i>
                                            </button>
                                        </div>
                                        <h3>${r.title}</h3>
                                        <p class="resource-desc">${r.description}</p>
                                    </div>
                                    <div class="resource-footer">
                                        <a href="${r.url}" target="_blank" class="resource-link-btn">
                                            Visit Link <i data-lucide="external-link" style="width:14px;height:14px"></i>
                                        </a>
                                        ${isOwner ? `
                                            <button class="btn btn-danger btn-icon btn-sm" onclick="pages.deleteResource('${r.id}')">
                                                <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                                            </button>
                                        ` : `
                                            <span style="font-size:0.75rem; color:var(--text-secondary);">by ${r.addedByName}</span>
                                        `}
                                    </div>
                                </div>
                            `;
                        }).join('') || '<div class="glass-card" style="text-align:center; padding: 40px; color: var(--text-secondary)">No resources posted here yet. Add the first one!</div>'}
                    </div>
                </div>
            </div>

            <!-- Add Resource Modal -->
            <div id="add-resource-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Add Study Resource</h3>
                        <button class="modal-close-btn" onclick="closeModal('add-resource-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitResourceForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Resource Title</label>
                                <input type="text" class="form-control" name="title" required placeholder="e.g. MDN Web Docs">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Category</label>
                                    <select class="form-control" name="category">
                                        <option value="Tutorials">Tutorials</option>
                                        <option value="Tools">Tools</option>
                                        <option value="Video Lectures">Video Lectures</option>
                                        <option value="Cheatsheets">Cheatsheets</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Resource URL</label>
                                    <input type="url" class="form-control" name="url" required placeholder="https://...">
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Short Description</label>
                                <textarea class="form-control" name="description" required placeholder="Provide a quick explanation of what this link offers..." rows="3"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('add-resource-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add Resource</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    function setResourcesCategory(cat) {
        state.resources.category = cat;
        renderResources();
        if (window.lucide) lucide.createIcons();
    }

    function bookmarkResource(id) {
        window.db.toggleBookmarkResource(id);
        renderResources();
        if (window.lucide) lucide.createIcons();
    }

    function submitResourceForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        
        window.db.addResource({
            title: fd.get('title'),
            category: fd.get('category'),
            url: fd.get('url'),
            description: fd.get('description')
        });

        closeModal('add-resource-modal');
        showToast('Resource Added', 'Resource library catalog updated!', 'success');
        renderResources();
        if (window.lucide) lucide.createIcons();
    }

    function deleteResource(id) {
        if (confirm('Delete this catalog link?')) {
            window.db.deleteResource(id);
            showToast('Deleted', 'Resource links directory updated.', 'success');
            renderResources();
            if (window.lucide) lucide.createIcons();
        }
    }

    // ==========================================================================
    // DISCUSSION FORUM PAGE
    // ==========================================================================
    function renderForum() {
        const container = document.getElementById('page-container');
        const forum = window.db.getForum();
        const profile = window.db.getProfile();

        // If thread active, render detail view instead
        if (state.forum.activeThreadId) {
            renderForumThread(state.forum.activeThreadId);
            return;
        }

        const categories = ['All', 'General', 'Computer Science', 'Mathematics', 'Physics', 'Coding', 'Exam Prep'];

        // Filter
        let filtered = forum;
        if (state.forum.category !== 'All') {
            filtered = filtered.filter(f => f.category === state.forum.category);
        }
        if (state.forum.search) {
            const q = state.forum.search.toLowerCase();
            filtered = filtered.filter(f => 
                f.title.toLowerCase().includes(q) || 
                f.content.toLowerCase().includes(q)
            );
        }

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Discussion Forum</h1>
                    <p>Post questions, share answers, and collaborate on subjects.</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="openModal('post-question-modal')"><i data-lucide="plus"></i> Ask Question</button>
                </div>
            </div>

            <div class="forum-layout">
                <!-- Sidebar categories -->
                <div class="forum-sidebar">
                    ${categories.map(c => `
                        <button class="resource-category-btn ${state.forum.category === c ? 'active' : ''}" onclick="pages.setForumCategory('${c}')">
                            <span>${c}</span>
                        </button>
                    `).join('')}
                </div>

                <!-- Main Area -->
                <div class="forum-posts-list">
                    ${filtered.map(f => {
                        const isOwner = f.author === 'profile-default';
                        return `
                            <div class="glass-card forum-post-card interactive">
                                <div class="forum-post-vote-box">
                                    <button class="vote-btn" onclick="pages.upvotePost('${f.id}')" title="Upvote"><i data-lucide="chevron-up"></i></button>
                                    <div class="vote-count">${f.upvotes}</div>
                                </div>
                                <div class="forum-post-content-box">
                                    <h3 class="forum-post-title" onclick="pages.viewForumThread('${f.id}')">${f.title}</h3>
                                    <p class="forum-post-excerpt">${f.content}</p>
                                    <div class="forum-post-meta">
                                        <div class="forum-post-author">
                                            <img class="forum-post-author-avatar" src="${isOwner ? profile.avatar : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=50&h=50&fit=crop&crop=face'}" alt="Avatar">
                                            <span>Posted by ${f.authorName} • ${formatDate(f.date)}</span>
                                        </div>
                                        <div class="forum-post-actions">
                                            <span class="badge badge-primary">${f.category}</span>
                                            <button class="forum-post-action-btn" onclick="pages.viewForumThread('${f.id}')">
                                                <i data-lucide="message-square" style="width:14px;height:14px"></i> ${f.replies.length} replies
                                            </button>
                                            ${isOwner ? `
                                                <button class="btn-icon btn-sm" onclick="pages.deleteForumPost('${f.id}')" style="border:none;background:none;color:var(--accent)">
                                                    <i data-lucide="trash-2" style="width:14px;height:14px"></i>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('') || '<div class="glass-card" style="text-align:center; padding: 40px; color: var(--text-secondary)">No questions found. Be the first to start a thread!</div>'}
                </div>
            </div>

            <!-- Post Question Modal -->
            <div id="post-question-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Ask a Question</h3>
                        <button class="modal-close-btn" onclick="closeModal('post-question-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitQuestionForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Question Title</label>
                                <input type="text" class="form-control" name="title" required placeholder="e.g. How to solve Dijkstra's shortest path?">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Category</label>
                                <select class="form-control" name="category">
                                    <option value="General">General</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Coding">Coding</option>
                                    <option value="Exam Prep">Exam Prep</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Content details</label>
                                <textarea class="form-control" name="content" required placeholder="Describe your question, provide code blocks, math statements..." rows="5"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('post-question-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Publish Question</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    function setForumCategory(cat) {
        state.forum.category = cat;
        renderForum();
        if (window.lucide) lucide.createIcons();
    }

    function upvotePost(id) {
        window.db.upvotePost(id);
        renderForum();
        if (window.lucide) lucide.createIcons();
    }

    function deleteForumPost(id) {
        if (confirm('Delete this forum thread?')) {
            window.db.deleteForumPost(id);
            showToast('Thread Deleted', 'Thread removed from the forums.', 'success');
            renderForum();
            if (window.lucide) lucide.createIcons();
        }
    }

    function submitQuestionForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        
        window.db.addForumPost({
            title: fd.get('title'),
            category: fd.get('category'),
            content: fd.get('content')
        });

        closeModal('post-question-modal');
        showToast('Published', 'Question published to the forums!', 'success');
        renderForum();
        if (window.lucide) lucide.createIcons();
    }

    // Thread View
    function viewForumThread(postId) {
        // Change state to show details and render
        state.forum.activeThreadId = postId;
        
        // Force redirect to forum hash if we are on dashboard click
        if (window.location.hash !== '#forum') {
            window.location.hash = '#forum';
        } else {
            renderForum();
        }
    }

    function closeThreadView() {
        state.forum.activeThreadId = null;
        renderForum();
        if (window.lucide) lucide.createIcons();
    }

    function renderForumThread(postId) {
        const container = document.getElementById('page-container');
        const post = window.db.getForum().find(p => p.id === postId);
        const profile = window.db.getProfile();

        if (!post) {
            closeThreadView();
            return;
        }

        const isOwner = post.author === 'profile-default';

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <button class="btn btn-secondary btn-sm" onclick="pages.closeThreadView()"><i data-lucide="arrow-left"></i> Back to Forum</button>
                </div>
            </div>

            <div class="glass-card thread-view">
                <!-- Original Post -->
                <div class="thread-original-post">
                    <div class="thread-post-header">
                        <img class="thread-author-avatar" src="${isOwner ? profile.avatar : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face'}" alt="Avatar">
                        <div>
                            <div class="thread-author-name">${post.authorName}</div>
                            <div class="thread-post-date">${formatDate(post.date)} • <span class="badge badge-primary">${post.category}</span></div>
                        </div>
                    </div>
                    <h2 class="thread-post-title">${post.title}</h2>
                    <p class="thread-post-content">${post.content}</p>
                    <div style="display:flex; align-items:center; gap:16px;">
                        <button class="btn btn-secondary btn-sm" onclick="pages.upvotePostInThread('${post.id}')"><i data-lucide="thumbs-up"></i> ${post.upvotes} Upvotes</button>
                    </div>
                </div>

                <!-- Replies List -->
                <div class="thread-replies-section">
                    <h3>Replies (${post.replies.length})</h3>
                    <div class="thread-replies-list">
                        ${post.replies.map(r => {
                            const isReplyOwner = r.author === 'profile-default';
                            return `
                                <div class="thread-reply-card">
                                    <div class="thread-reply-header">
                                        <div class="thread-reply-author">
                                            <img class="thread-reply-avatar" src="${isReplyOwner ? profile.avatar : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face'}" alt="Avatar">
                                            <span>${r.authorName}</span>
                                        </div>
                                        <div class="thread-reply-date">${formatDate(r.date)}</div>
                                    </div>
                                    <div class="thread-reply-content">${r.content}</div>
                                </div>
                            `;
                        }).join('') || '<div class="text-muted" style="padding:12px 0;">No comments posted yet. Add the first reply below!</div>'}
                    </div>

                    <!-- Add Reply -->
                    <form class="thread-reply-form" onsubmit="pages.submitReplyForm(event, '${post.id}')">
                        <div class="form-group" style="margin-bottom:0">
                            <textarea class="form-control" name="replyContent" required placeholder="Write a response..." rows="4"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="align-self: flex-start;">Post Reply</button>
                    </form>
                </div>
            </div>
        `;
    }

    function upvotePostInThread(id) {
        window.db.upvotePost(id);
        renderForum();
        if (window.lucide) lucide.createIcons();
    }

    function submitReplyForm(e, postId) {
        e.preventDefault();
        const content = new FormData(e.target).get('replyContent');
        window.db.addReply(postId, content);
        showToast('Reply Posted', 'Your reply is added to the discussion.', 'success');
        renderForum();
        if (window.lucide) lucide.createIcons();
    }


    // ==========================================================================
    // STUDENT PROFILE PAGE
    // ==========================================================================
    let profileActiveTab = 'notes'; // 'notes' or 'resources'

    function renderProfile() {
        const container = document.getElementById('page-container');
        const profile = window.db.getProfile();
        
        // Find bookmarks
        const bookmarkedNotes = window.db.getNotes().filter(n => n.bookmarkedBy.includes('profile-default'));
        const bookmarkedResources = window.db.getResources().filter(r => r.bookmarkedBy.includes('profile-default'));

        container.innerHTML = `
            <div class="page-header">
                <div class="page-title-area">
                    <h1>Student Profile</h1>
                    <p>Customize your identity, showcase skills, and view bookmarked items.</p>
                </div>
            </div>
<!-- Profile Stats Row -->
<div class="profile-stats-row">
    <div class="glass-card profile-stat-card">
        <i data-lucide="file-text"></i>
        <div class="profile-stat-value">${window.db.getNotes().filter(n => n.author === 'profile-default').length}</div>
        <div class="profile-stat-label">Notes Uploaded</div>
    </div>
    <div class="glass-card profile-stat-card">
        <i data-lucide="users"></i>
        <div class="profile-stat-value">${window.db.getGroups().filter(g => g.members.includes('profile-default')).length}</div>
        <div class="profile-stat-label">Study Groups</div>
    </div>
    <div class="glass-card profile-stat-card">
        <i data-lucide="check-square"></i>
        <div class="profile-stat-value">${window.db.getAssignments().filter(a => a.status === 'Completed').length}</div>
        <div class="profile-stat-label">Assignments Done</div>
    </div>
    <div class="glass-card profile-stat-card">
        <i data-lucide="message-square"></i>
        <div class="profile-stat-value">${window.db.getForum().filter(f => f.author === 'profile-default').length}</div>
        <div class="profile-stat-label">Forum Posts</div>
    </div>
</div>
            <div class="profile-grid">
                <!-- Left Sidebar Details -->
                <div class="glass-card profile-sidebar">
                    <div class="profile-avatar-container">
                        <img class="profile-avatar" id="profile-img" src="${profile.avatar}" alt="${profile.name}">
                        <div class="avatar-edit-overlay" onclick="pages.openAvatarSelector()" title="Change Avatar">
                            <i data-lucide="camera" style="width:16px;height:16px"></i>
                        </div>
                    </div>
                    <h2 class="profile-name">${profile.name}</h2>
                    <span class="badge badge-primary profile-role-badge">${profile.role}</span>
                    <p class="profile-institution"><i data-lucide="map-pin"></i> ${profile.institution}</p>
                    <p style="font-size:0.85rem; color:var(--text-secondary)">${profile.email}</p>
                    <button class="btn btn-secondary btn-sm" style="width:100%; margin-top:8px;" onclick="openModal('edit-profile-modal')"><i data-lucide="edit-3"></i> Edit Profile</button>
                </div>

                <!-- Right Contents -->
                <div class="profile-details">
                    <div class="glass-card">
                        <h3 class="profile-section-title"><i data-lucide="user"></i> About Me</h3>
                        <p style="font-size:0.95rem; color:var(--text-secondary); line-height:1.6; margin-bottom:20px;">
                            ${profile.bio || 'Add a bio to introduce yourself to your study peers.'}
                        </p>

                        <h3 class="profile-section-title"><i data-lucide="award"></i> Skills & Interests</h3>
                        <div class="skills-list" style="margin-bottom:16px;">
                            ${profile.skills.map(s => `
                                <span class="skill-tag">
                                    ${s} 
                                    <span style="color:var(--accent); margin-left:6px; cursor:pointer;" onclick="pages.removeSkill('${s}')">&times;</span>
                                </span>
                            `).join('') || '<p class="text-muted" style="font-size:0.85rem">No skills added yet.</p>'}
                        </div>
                        <form onsubmit="pages.addSkill(event)" style="display:flex; gap:8px; max-width:320px;">
                            <input type="text" class="form-control" name="skillName" required placeholder="Add skill..." style="padding:6px 12px; font-size:0.85rem">
                            <button type="submit" class="btn btn-primary btn-sm"><i data-lucide="plus"></i></button>
                        </form>
                    </div>

                    <!-- Bookmarks section -->
                    <div class="glass-card">
                        <div class="profile-tabs">
                            <button class="profile-tab-btn ${profileActiveTab === 'notes' ? 'active' : ''}" onclick="pages.setProfileTab('notes')">
                                Bookmarked Notes (${bookmarkedNotes.length})
                            </button>
                            <button class="profile-tab-btn ${profileActiveTab === 'resources' ? 'active' : ''}" onclick="pages.setProfileTab('resources')">
                                Bookmarked Resources (${bookmarkedResources.length})
                            </button>
                        </div>

                        <div>
                            ${profileActiveTab === 'notes' ? `
                                <div class="dashboard-list">
                                    ${bookmarkedNotes.map(n => `
                                        <div class="dashboard-item" style="cursor:pointer;" onclick="window.location.hash='#notes'; setTimeout(()=>pages.viewNoteDetail('${n.id}'), 250)">
                                            <div class="dashboard-item-info">
                                                <span class="dashboard-item-title">${n.title}</span>
                                                <span class="dashboard-item-meta">
                                                    <span>${n.subject}</span> • 
                                                    <span>Uploaded by ${n.authorName}</span>
                                                </span>
                                            </div>
                                            <button class="btn btn-icon btn-sm" onclick="event.stopPropagation(); pages.unbookmarkNote('${n.id}')" title="Remove Bookmark">
                                                <i data-lucide="bookmark" class="active" style="color:var(--accent)"></i>
                                            </button>
                                        </div>
                                    `).join('') || '<p class="text-muted" style="text-align:center; padding:20px;">No bookmarked notes.</p>'}
                                </div>
                            ` : `
                                <div class="dashboard-list">
                                    ${bookmarkedResources.map(r => `
                                        <div class="dashboard-item">
                                            <div class="dashboard-item-info">
                                                <a href="${r.url}" target="_blank" class="dashboard-item-title" style="color:inherit">${r.title} <i data-lucide="external-link" style="width:12px;height:12px"></i></a>
                                                <span class="dashboard-item-meta">
                                                    <span>${r.category}</span>
                                                </span>
                                            </div>
                                            <button class="btn btn-icon btn-sm" onclick="pages.unbookmarkResource('${r.id}')" title="Remove Bookmark">
                                                <i data-lucide="bookmark" class="active" style="color:var(--accent)"></i>
                                            </button>
                                        </div>
                                    `).join('') || '<p class="text-muted" style="text-align:center; padding:20px;">No bookmarked resources.</p>'}
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Edit Profile Modal -->
            <div id="edit-profile-modal" class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>Edit Profile Details</h3>
                        <button class="modal-close-btn" onclick="closeModal('edit-profile-modal')">&times;</button>
                    </div>
                    <form onsubmit="pages.submitProfileForm(event)">
                        <div class="modal-body">
                            <div class="form-group">
                                <label class="form-label">Full Name</label>
                                <input type="text" class="form-control" name="name" required value="${profile.name}">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-control" name="email" required value="${profile.email}">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Institution</label>
                                    <input type="text" class="form-control" name="institution" required value="${profile.institution}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Academic Role</label>
                                    <select class="form-control" name="role">
                                        <option value="High School" ${profile.role === 'High School' ? 'selected' : ''}>High School</option>
                                        <option value="Undergraduate" ${profile.role === 'Undergraduate' ? 'selected' : ''}>Undergraduate</option>
                                        <option value="Graduate" ${profile.role === 'Graduate' ? 'selected' : ''}>Graduate</option>
                                        <option value="PhD Candidate" ${profile.role === 'PhD Candidate' ? 'selected' : ''}>PhD Candidate</option>
                                        <option value="Educator" ${profile.role === 'Educator' ? 'selected' : ''}>Educator</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Bio Description</label>
                                <textarea class="form-control" name="bio" placeholder="Tell other members about yourself..." rows="4">${profile.bio}</textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" onclick="closeModal('edit-profile-modal')">Cancel</button>
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Avatar Selection Modal -->
            <div id="avatar-select-modal" class="modal-overlay">
                <div class="modal-container" style="max-width: 450px;">
                    <div class="modal-header">
                        <h3>Select Profile Photo</h3>
                        <button class="modal-close-btn" onclick="closeModal('avatar-select-modal')">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; margin-bottom:20px;">
                            ${[
                                'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face',
                                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face'
                            ].map((url, i) => `
                                <img src="${url}" onclick="pages.selectAvatarDirect('${url}')" style="width:100%; border-radius:50%; cursor:pointer; border:2px solid ${profile.avatar === url ? 'var(--primary)' : 'transparent'}; hover:border-color:var(--primary); transition:all 0.2s;" alt="Avatar Option ${i+1}">
                            `).join('')}
                        </div>
                        <div class="form-group">
                            <label class="form-label">Or Custom Image URL</label>
                            <input type="url" id="custom-avatar-url" class="form-control" placeholder="https://images.unsplash.com/...">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="closeModal('avatar-select-modal')">Cancel</button>
                        <button class="btn btn-primary" onclick="pages.saveCustomAvatarUrl()">Save URL</button>
                    </div>
                </div>
            </div>
        `;
    }

    function setProfileTab(tab) {
        profileActiveTab = tab;
        renderProfile();
        if (window.lucide) lucide.createIcons();
    }

    function unbookmarkNote(id) {
        window.db.toggleBookmarkNote(id);
        showToast('Removed Bookmark', 'Note removed from library shortcuts.', 'info');
        renderProfile();
        if (window.lucide) lucide.createIcons();
    }

    function unbookmarkResource(id) {
        window.db.toggleBookmarkResource(id);
        showToast('Removed Bookmark', 'Resource link shortcut removed.', 'info');
        renderProfile();
        if (window.lucide) lucide.createIcons();
    }

    function addSkill(e) {
        e.preventDefault();
        const skill = new FormData(e.target).get('skillName').trim();
        if (skill) {
            const profile = window.db.getProfile();
            if (!profile.skills.includes(skill)) {
                profile.skills.push(skill);
                window.db.saveProfile(profile);
                showToast('Skill Added', `${skill} added to profile`, 'success');
            }
            renderProfile();
            if (window.lucide) lucide.createIcons();
        }
    }

    function removeSkill(skillName) {
        const profile = window.db.getProfile();
        profile.skills = profile.skills.filter(s => s !== skillName);
        window.db.saveProfile(profile);
        showToast('Skill Removed', `${skillName} removed from profile`, 'info');
        renderProfile();
        if (window.lucide) lucide.createIcons();
    }

    function openAvatarSelector() {
        openModal('avatar-select-modal');
    }

    function selectAvatarDirect(url) {
        const profile = window.db.getProfile();
        profile.avatar = url;
        window.db.saveProfile(profile);
        closeModal('avatar-select-modal');
        showToast('Avatar Saved', 'Your profile picture has been updated.', 'success');
        renderProfile();
        window.renderMiniProfile();
        if (window.lucide) lucide.createIcons();
    }

    function saveCustomAvatarUrl() {
        const url = document.getElementById('custom-avatar-url').value.trim();
        if (url) {
            selectAvatarDirect(url);
        } else {
            showToast('Invalid URL', 'Please enter a valid photo web address.', 'error');
        }
    }

    function submitProfileForm(e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        const profile = window.db.getProfile();

        profile.name = fd.get('name');
        profile.email = fd.get('email');
        profile.institution = fd.get('institution');
        profile.role = fd.get('role');
        profile.bio = fd.get('bio');

        window.db.saveProfile(profile);
        closeModal('edit-profile-modal');
        showToast('Success', 'Profile details updated.', 'success');
        
        // Refresh view & mini-profile
        renderProfile();
        window.renderMiniProfile();
        if (window.lucide) lucide.createIcons();
    }

    return {
        handleGlobalSearch,
        renderDashboard,
        quickCompleteAssignment,
        quickToggleGroup,
        renderNotes,
        setNotesFilter,
        submitNoteForm,
        deleteNote,
        bookmarkNote,
        downloadNote,
        viewNoteDetail,
        renderGroups,
        setGroupsFilter,
        toggleJoinGroup,
        submitGroupForm,
        deleteGroup,
        renderAssignments,
        setAssignStatusFilter,
        setAssignPriorityFilter,
        updateAssignmentStatus,
        submitAssignmentForm,
        deleteAssignment,
        renderResources,
        setResourcesCategory,
        bookmarkResource,
        submitResourceForm,
        deleteResource,
        renderForum,
        setForumCategory,
        upvotePost,
        deleteForumPost,
        submitQuestionForm,
        viewForumThread,
        closeThreadView,
        upvotePostInThread,
        submitReplyForm,
        renderProfile,
        setProfileTab,
        unbookmarkNote,
        unbookmarkResource,
        addSkill,
        removeSkill,
        openAvatarSelector,
        selectAvatarDirect,
        saveCustomAvatarUrl,
        submitProfileForm
    };
})();
