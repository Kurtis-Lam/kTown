// ─── Firebase imports ────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import {
    getAuth,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    updateProfile,
    signOut
} from "firebase/auth";
import {
    getFirestore,
    doc,
    setDoc,
    onSnapshot
} from "firebase/firestore";

// ─── OpenRouter API key ───────────────────────────────────────────────
const OPENROUTER_API_KEY = "sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with your actual OpenRouter API key

// ─── Firebase config ──────────────────────────────────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyBHaYNoX65QOetCGcQxsztMozjW14WNGss",
    authDomain: "ktown-45.firebaseapp.com",
    projectId: "ktown-45",
    storageBucket: "ktown-45.firebasestorage.app",
    messagingSenderId: "369588080069",
    appId: "1:369588080069:web:5b03089c06d83bc167cfac",
    measurementId: "G-ML7ESX9P7Y"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ─── STATE ─────────────────────────────────────────────────────────────
let state = {
    subjects: [],
    notes: [],
    sortBy: 'subject',
    selectedSubjectId: null,
    selectedDate: null,
    activeNoteId: null,
    searchQuery: ''
};

let currentUser = null;
let unsubscribeFirestore = null;
let contextTarget = { type: null, id: null };
let pendingNoteSetup = null;
let initialNoteState = { title: '', subjectId: '', date: '', content: '' };
let isLoginMode = true;
let currentZoomLevel = 1.0;

let draggedSubjectIndex = null;

let isSketchingMode = false;
let isDrawing = false;
let showPageNumbers = false;

let pendingRefinedHtml = "";

let summaryChatHistory = [];

// ─── Pagination debounce ─────────────────────────────────────────────
let paginateDebounceTimer = null;
const PAGINATE_DEBOUNCE_MS = 80;

// ─── DOM refs ──────────────────────────────────────────────────────────
const navTree = document.getElementById('navTree');
const treeHeaderTitle = document.getElementById('treeHeaderTitle');
const contentArea = document.getElementById('contentArea');
const breadcrumbs = document.getElementById('breadcrumbs');
const editorModal = document.getElementById('editorModal');
const subjectModal = document.getElementById('subjectModal');
const noteSetupModal = document.getElementById('noteSetupModal');
const unsavedModal = document.getElementById('unsavedModal');
const tableModal = document.getElementById('tableModal');
const confirmModal = document.getElementById('confirmModal');
const alertModal = document.getElementById('alertModal');
const authModal = document.getElementById('authModal');
const setupNoteTitle = document.getElementById('setupNoteTitle');
const setupNoteSubject = document.getElementById('setupNoteSubject');
const setupNoteDate = document.getElementById('setupNoteDate');
const customContextMenu = document.getElementById('customContextMenu');
const ctxEditSubject = document.getElementById('ctxEditSubject');
const ctxDeleteNote = document.getElementById('ctxDeleteNote');
const ctxDeleteSubject = document.getElementById('ctxDeleteSubject');

const editorPagesContainer = document.getElementById('editorPagesContainer');

const noteTitleInput = document.getElementById('noteTitleInput');
const noteDateInput = document.getElementById('noteDateInput');
const noteSubjectSelect = document.getElementById('noteSubjectSelect');
const searchInput = document.getElementById('searchInput');
const subjectContextBtnContainer = document.getElementById('subjectContextBtnContainer');
const imageFileInput = document.getElementById('imageFileInput');

const btnSketch = document.getElementById('btnSketch');
const sketchColorPicker = document.getElementById('sketchColorPicker');
const sketchSizeSelect = document.getElementById('sketchSizeSelect');
const sketchCanvas = document.getElementById('sketchCanvas');
const sketchCtx = sketchCanvas.getContext('2d');

const aiSummaryPanel = document.getElementById('aiSummaryPanel');
const aiChatMessages = document.getElementById('aiChatMessages');
const aiChatForm = document.getElementById('aiChatForm');
const aiChatInput = document.getElementById('aiChatInput');
const btnSendChat = document.getElementById('btnSendChat');
const aiResizer = document.getElementById('aiResizer');

const refineBanner = document.getElementById('refineBanner');
const originalPaneLabel = document.getElementById('originalPaneLabel');
const refinedPaneWrapper = document.getElementById('refinedPaneWrapper');
const refinedPreviewBody = document.getElementById('refinedPreviewBody');
const docsPageViewport = document.getElementById('docsPageViewport');
const btnAcceptRefine = document.getElementById('btnAcceptRefine');
const btnDeclineRefine = document.getElementById('btnDeclineRefine');

const blockFormatSelect = document.getElementById('blockFormatSelect');
const fontSizeSelect = document.getElementById('fontSizeSelect');
const zoomLabel = document.getElementById('zoomLabel');

// ─── AUTH / SYNC ──────────────────────────────────────────────────────
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const userBadge = document.getElementById('userBadge');

    if (user) {
        authModal.classList.remove('open', 'active');
        userBadge.style.display = 'flex';
        const displayName = user.displayName || 'User';
        document.getElementById('userName').innerText = displayName;
        document.getElementById('userAvatar').src = user.photoURL ||
            `https://ui-avatars.com/api/?name=${displayName}&background=8b5cf6&color=fff`;

        const userDocRef = doc(db, "users", user.uid, "apps", "kauranotes");
        if (unsubscribeFirestore) unsubscribeFirestore();

        unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                state.subjects = data.subjects || [];
                state.notes = data.notes || [];
            } else {
                state.subjects = [];
                state.notes = [];
                saveState();
            }
            renderSidebarNav();
            renderMainWorkspace();
        }, (err) => {
            console.error("Firestore sync error:", err);
        });

    } else {
        userBadge.style.display = 'none';
        if (unsubscribeFirestore) unsubscribeFirestore();
        authModal.classList.add('open', 'active');
    }
});

async function saveState() {
    if (!currentUser) return;
    try {
        const userDocRef = doc(db, "users", currentUser.uid, "apps", "kauranotes");
        await setDoc(userDocRef, {
            subjects: state.subjects,
            notes: state.notes,
            updatedAt: Date.now()
        }, { merge: true });
    } catch (err) {
        console.error("Error saving notes to Firebase:", err);
    }
}

// Auth form handlers
document.getElementById('toggleLoginBtn').onclick = () => setAuthMode('login');
document.getElementById('toggleSignupBtn').onclick = () => setAuthMode('signup');

function setAuthMode(mode) {
    isLoginMode = (mode === 'login');
    document.getElementById('toggleLoginBtn').classList.toggle('active', isLoginMode);
    document.getElementById('toggleSignupBtn').classList.toggle('active', !isLoginMode);
    document.getElementById('authSubmitBtn').innerText = isLoginMode ? 'Log In' : 'Create Account';
    document.getElementById('usernameGroup').style.display = isLoginMode ? 'none' : 'block';
}

document.getElementById('authForm').onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPassword').value;
    const username = document.getElementById('authUsername').value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, pass);
        } else {
            const cred = await createUserWithEmailAndPassword(auth, email, pass);
            if (username) await updateProfile(cred.user, { displayName: username });
        }
    } catch (err) {
        showCustomAlert({ title: "Authentication Error", message: err.message });
    }
};

document.getElementById('googleAuthBtn').onclick = async () => {
    try {
        await signInWithPopup(auth, provider);
    } catch (err) {
        showCustomAlert({ title: "Google Sign-In Error", message: err.message });
    }
};

document.getElementById('logoutBtn').onclick = () => signOut(auth);

// ─── RENDERERS ────────────────────────────────────────────────────────
function renderSidebarNav() {
    navTree.innerHTML = '';

    if (state.sortBy === 'subject') {
        treeHeaderTitle.innerText = 'Subjects Navigation';
        if (state.subjects.length === 0) {
            navTree.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted); padding:6px 0;">No subjects added yet</div>';
            return;
        }
        state.subjects.forEach((sub, index) => {
            const item = document.createElement('div');
            item.className =
                `tree-item draggable ${state.selectedSubjectId === sub.id && !state.selectedDate ? 'active' : ''}`;
            item.setAttribute('draggable', 'true');
            item.dataset.index = index;
            item.dataset.subjectId = sub.id;

            item.innerHTML = `
        <div class="subject-tag">
            <i class="fa-solid fa-grip-vertical drag-handle"></i>
            <span class="badge-dot" style="background:${sub.color}"></span>
            <span class="subject-name" title="Double-click to edit">${sub.name}</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
        `;

            let clickTimer = null;
            item.onclick = (e) => {
                if (clickTimer == null) {
                    clickTimer = setTimeout(() => {
                        clickTimer = null;
                        selectSubjectNode(sub.id);
                    }, 250);
                }
            };

            const nameSpan = item.querySelector('.subject-name');
            nameSpan.ondblclick = (e) => {
                e.stopPropagation();
                if (clickTimer) { clearTimeout(clickTimer);
                    clickTimer = null; }
                openEditSubjectModal(sub.id);
            };

            item.ondragstart = (e) => {
                draggedSubjectIndex = index;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            };

            item.ondragend = () => {
                draggedSubjectIndex = null;
                item.classList.remove('dragging');
                document.querySelectorAll('.tree-item').forEach(el => el.classList.remove('drag-over'));
            };

            item.ondragover = (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (draggedSubjectIndex !== null && draggedSubjectIndex !== index) {
                    item.classList.add('drag-over');
                }
            };

            item.ondragleave = () => {
                item.classList.remove('drag-over');
            };

            item.ondrop = (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                if (draggedSubjectIndex !== null && draggedSubjectIndex !== index) {
                    const movedSubject = state.subjects.splice(draggedSubjectIndex, 1)[0];
                    state.subjects.splice(index, 0, movedSubject);
                    saveState();
                    renderSidebarNav();
                    renderMainWorkspace();
                }
            };

            item.oncontextmenu = (e) => handleRightClick(e, 'subject', sub.id);
            navTree.appendChild(item);
        });
    } else {
        treeHeaderTitle.innerText = 'Dates Navigation';
        const dates = [...new Set(state.notes.map(n => n.date))].sort().reverse();
        if (dates.length === 0) {
            navTree.innerHTML = '<div style="font-size:0.85rem; color:var(--text-muted)">No note dates found</div>';
        }
        dates.forEach(d => {
            const item = document.createElement('div');
            item.className = `tree-item ${state.selectedDate === d && !state.selectedSubjectId ? 'active' : ''}`;
            item.innerHTML = `
        <div class="subject-tag">
            <i class="fa-regular fa-calendar"></i>
            <span>${d}</span>
        </div>
        <i class="fa-solid fa-chevron-right" style="font-size:0.75rem;"></i>
        `;
            item.onclick = () => selectDateNode(d);
            navTree.appendChild(item);
        });
    }
}

function openEditSubjectModal(subjectId) {
    const sub = state.subjects.find(s => s.id === subjectId);
    if (!sub) return;
    document.getElementById('subjectModalTitle').innerText = 'Edit Subject';
    document.getElementById('editingSubjectId').value = sub.id;
    document.getElementById('modalSubjectName').value = sub.name;
    document.getElementById('modalSubjectColor').value = sub.color;
    subjectModal.classList.add('open');
}

function selectSubjectNode(subId) {
    state.selectedSubjectId = subId;
    state.selectedDate = null;
    renderSidebarNav();
    renderMainWorkspace();
}

function selectDateNode(dateStr) {
    state.selectedDate = dateStr;
    state.selectedSubjectId = null;
    renderSidebarNav();
    renderMainWorkspace();
}

function renderMainWorkspace() {
    contentArea.innerHTML = '';
    updateBreadcrumbsAndSearch();

    let filteredNotes = state.notes;

    if (state.searchQuery.trim()) {
        filteredNotes = filteredNotes.filter(n => {
            const matchesQuery = n.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                n.content.toLowerCase().includes(state.searchQuery.toLowerCase());
            if (state.selectedSubjectId) return matchesQuery && n.subjectId === state.selectedSubjectId;
            if (state.selectedDate) return matchesQuery && n.date === state.selectedDate;
            return matchesQuery;
        });
        renderNotesGrid(sortNotesByCreationTime(filteredNotes));
        return;
    }

    if (state.sortBy === 'subject') {
        if (!state.selectedSubjectId) {
            renderSubjectGrid();
        } else {
            const subjectNotes = filteredNotes.filter(n => n.subjectId === state.selectedSubjectId);
            renderNotesGrid(sortNotesByCreationTime(subjectNotes));
        }
    } else {
        if (!state.selectedDate) {
            renderDatesGrid();
        } else if (state.selectedDate && !state.selectedSubjectId) {
            renderSubjectsUnderDate(state.selectedDate);
        } else {
            const finalNotes = filteredNotes.filter(n => n.date === state.selectedDate && n.subjectId === state
                .selectedSubjectId);
            renderNotesGrid(sortNotesByCreationTime(finalNotes));
        }
    }
}

function sortNotesByCreationTime(notesList) {
    return [...notesList].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

function renderSubjectGrid() {
    if (state.subjects.length === 0) {
        contentArea.innerHTML =
            '<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>No subjects created yet.<br>Click "+" in the sidebar to add your first subject.</p></div>';
        return;
    }
    const grid = document.createElement('div');
    grid.className = 'notes-grid';
    state.subjects.forEach(sub => {
        const count = state.notes.filter(n => n.subjectId === sub.id).length;
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
        <div class="note-card-header">
        <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge-dot" style="background:${sub.color}; width:16px; height:16px;"></span>
            <span class="note-title">${sub.name}</span>
        </div>
        </div>
        <div class="note-preview">${count} Note(s)</div>
    `;
        card.onclick = () => selectSubjectNode(sub.id);
        card.oncontextmenu = (e) => handleRightClick(e, 'subject', sub.id);
        grid.appendChild(card);
    });
    contentArea.appendChild(grid);
}

function renderDatesGrid() {
    const dates = [...new Set(state.notes.map(n => n.date))].sort().reverse();
    const grid = document.createElement('div');
    grid.className = 'notes-grid';
    if (dates.length === 0) {
        contentArea.innerHTML = '<div class="empty-state"><i class="fa-solid fa-folder-open"></i><p>No notes created yet</p></div>';
        return;
    }
    dates.forEach(d => {
        const count = state.notes.filter(n => n.date === d).length;
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
        <div class="note-card-header">
        <span class="note-title"><i class="fa-regular fa-calendar-days"></i> ${d}</span>
        </div>
        <div class="note-preview">${count} Note(s) created</div>
    `;
        card.onclick = () => selectDateNode(d);
        grid.appendChild(card);
    });
    contentArea.appendChild(grid);
}

function renderSubjectsUnderDate(dateStr) {
    const dateNotes = state.notes.filter(n => n.date === dateStr);
    const subIds = [...new Set(dateNotes.map(n => n.subjectId))];
    const grid = document.createElement('div');
    grid.className = 'notes-grid';

    subIds.forEach(sId => {
        const sub = state.subjects.find(s => s.id === sId) || { name: 'Unknown', color: '#ccc' };
        const count = dateNotes.filter(n => n.subjectId === sId).length;
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
        <div class="note-card-header">
        <div style="display:flex; align-items:center; gap:8px;">
            <span class="badge-dot" style="background:${sub.color}"></span>
            <span class="note-title">${sub.name}</span>
        </div>
        </div>
        <div class="note-preview">${count} note(s)</div>
    `;
        card.onclick = () => {
            state.selectedSubjectId = sId;
            renderSidebarNav();
            renderMainWorkspace();
        };
        card.oncontextmenu = (e) => handleRightClick(e, 'subject', sId);
        grid.appendChild(card);
    });
    contentArea.appendChild(grid);
}

function renderNotesGrid(notes) {
    if (notes.length === 0) {
        contentArea.innerHTML = '<div class="empty-state"><i class="fa-solid fa-note-sticky"></i><p>No notes found here</p></div>';
        return;
    }
    const grid = document.createElement('div');
    grid.className = 'notes-grid';
    notes.forEach(note => {
        const sub = state.subjects.find(s => s.id === note.subjectId);
        const card = document.createElement('div');
        card.className = 'note-card';
        card.innerHTML = `
        <div class="note-card-header">
        <span class="note-title">${note.title || 'Untitled Note'}</span>
        </div>
        <div style="display:flex; gap:8px; align-items:center; font-size:0.75rem; color:var(--text-muted)">
        <span class="badge-dot" style="background:${sub ? sub.color : '#ccc'}"></span>
        <span>${sub ? sub.name : 'Uncategorized'}</span> • <span>${note.date}</span>
        </div>
        <div class="note-preview">${stripHTML(note.content)}</div>
    `;
        card.onclick = () => openExistingNoteEditor(note.id);
        card.oncontextmenu = (e) => handleRightClick(e, 'note', note.id);
        grid.appendChild(card);
    });
    contentArea.appendChild(grid);
}

function updateBreadcrumbsAndSearch() {
    breadcrumbs.innerHTML = ``;
    const rootSpan = document.createElement('span');
    rootSpan.style.cursor = 'pointer';
    rootSpan.innerText = 'All Notes';
    rootSpan.onclick = resetNav;
    breadcrumbs.appendChild(rootSpan);

    subjectContextBtnContainer.innerHTML = '';

    if (state.sortBy === 'subject') {
        if (state.selectedSubjectId) {
            const sub = state.subjects.find(s => s.id === state.selectedSubjectId);
            const subName = sub ? sub.name : 'Subject';
            breadcrumbs.innerHTML += ` / <span class="active">${subName}</span>`;
            searchInput.placeholder = `Search subject ${subName}...`;

            const addNoteBtn = document.createElement('button');
            addNoteBtn.className = 'btn btn-sm';
            addNoteBtn.innerHTML = `<i class="fa-solid fa-plus"></i> Add Note in ${subName}`;
            addNoteBtn.onclick = () => openNoteSetupModal(state.selectedSubjectId);
            subjectContextBtnContainer.appendChild(addNoteBtn);

        } else {
            searchInput.placeholder = "Search subject...";
        }
    } else {
        if (state.selectedDate) {
            breadcrumbs.innerHTML += ` / <span class="active">${state.selectedDate}</span>`;
            searchInput.placeholder = `Search date ${state.selectedDate}...`;
        } else {
            searchInput.placeholder = "Search date...";
        }

        if (state.selectedSubjectId) {
            const sub = state.subjects.find(s => s.id === state.selectedSubjectId);
            const subName = sub ? sub.name : 'Subject';
            breadcrumbs.innerHTML += ` / <span class="active">${subName}</span>`;
            searchInput.placeholder = `Search date ${state.selectedDate} (${subName})...`;
        }
    }

    if (!state.selectedSubjectId && !state.selectedDate) {
        searchInput.placeholder = "Search all notes...";
    }
}

function resetNav() {
    state.selectedSubjectId = null;
    state.selectedDate = null;
    renderSidebarNav();
    renderMainWorkspace();
}

// ─── EDITOR HELPERS ──────────────────────────────────────────────────
function getActivePage() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
        const node = sel.anchorNode;
        if (node) {
            const page = node.nodeType === 3 ? node.parentNode.closest('.a4-page') : node.closest('.a4-page');
            if (page) return page;
        }
    }
    return document.querySelector('.a4-page');
}

function insertImageToEditor(dataUrl) {
    const page = getActivePage();
    if (page) {
        page.focus();
        const imgHtml =
            `<img src="${dataUrl}" style="max-width:100%; height:auto; display:block; margin:10px 0; border-radius:8px;">`;
        document.execCommand('insertHTML', false, imgHtml);
        schedulePaginate(page);
    }
}

// ─── PAGINATION (FIXED) ──────────────────────────────────────────────

// Find the overflow index in a text node using a temporary element
function findTextOverflowIndex(textNode, maxHeight) {
    const text = textNode.textContent;
    if (!text) return text.length;

    // Get computed styles from the page
    const page = textNode.closest('.a4-page');
    if (!page) return text.length;

    const style = window.getComputedStyle(page);
    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `
        position: fixed;
        visibility: hidden;
        width: ${page.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)}px;
        font-family: ${style.fontFamily};
        font-size: ${style.fontSize};
        line-height: ${style.lineHeight};
        padding: 0;
        box-sizing: border-box;
        white-space: pre-wrap;
        word-break: break-word;
    `;
    document.body.appendChild(tempDiv);

    // Binary search for overflow point
    let low = 0,
        high = text.length;
    let result = text.length;

    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        tempDiv.textContent = text.substring(0, mid);
        // Check if the content overflows the max height
        if (tempDiv.scrollHeight > maxHeight) {
            high = mid;
            result = mid;
        } else {
            low = mid + 1;
        }
    }

    // Refine: go back a bit to avoid breaking words
    let finalIndex = result;
    // Try to find a space or punctuation to break at
    for (let i = Math.max(0, result - 20); i < Math.min(text.length, result + 5); i++) {
        if (i > 0 && (text[i] === ' ' || text[i] === '\n' || text[i] === '\t' || text[i] === '.' || text[i] === '?' ||
                text[i] === '!' || text[i] === ',')) {
            finalIndex = i + 1;
            break;
        }
    }

    document.body.removeChild(tempDiv);
    return Math.min(finalIndex, text.length);
}

// Improved paginateFrom: handles single child nodes and text splitting
function paginateFrom(page) {
    if (!page) return;

    // Use a temporary reset of overflow to measure properly
    const origOverflow = page.style.overflow;
    page.style.overflow = 'visible';
    const scrollH = page.scrollHeight;
    page.style.overflow = origOverflow || 'visible';

    // If content fits, nothing to do
    const maxHeight = 1056; // page height
    if (scrollH <= maxHeight) return;

    let nextPage = page.nextElementSibling;
    if (!nextPage || !nextPage.classList.contains('a4-page')) {
        nextPage = addPageToEditor(page);
    }

    let moved = false;
    let safetyCounter = 0;

    while (safetyCounter < 50) {
        // Re-check after each move
        page.style.overflow = 'visible';
        const currentScrollH = page.scrollHeight;
        page.style.overflow = origOverflow || 'visible';

        if (currentScrollH <= maxHeight) break;

        const childNodes = page.childNodes;
        if (childNodes.length === 0) break;

        // Get the last child
        const lastChild = childNodes[childNodes.length - 1];

        if (lastChild.nodeType === Node.TEXT_NODE) {
            // Split text node
            const text = lastChild.textContent;
            if (!text) {
                lastChild.remove();
                continue;
            }

            // Find overflow index
            const overflowIdx = findTextOverflowIndex(lastChild, maxHeight);

            if (overflowIdx <= 0 || overflowIdx >= text.length) {
                // Can't split further — move the whole node
                const cloned = document.createTextNode(text);
                lastChild.textContent = '';
                nextPage.insertBefore(cloned, nextPage.firstChild);
                moved = true;
            } else {
                // Split the text node
                const beforeText = text.substring(0, overflowIdx);
                const afterText = text.substring(overflowIdx);
                lastChild.textContent = beforeText;
                const newTextNode = document.createTextNode(afterText);
                nextPage.insertBefore(newTextNode, nextPage.firstChild);
                moved = true;
            }
        } else if (lastChild.nodeType === Node.ELEMENT_NODE) {
            // Move the entire element
            nextPage.insertBefore(lastChild, nextPage.firstChild);
            moved = true;
        } else {
            // Unknown node type — remove it to avoid infinite loop
            lastChild.remove();
        }

        safetyCounter++;
    }

    // Restore overflow style
    page.style.overflow = origOverflow || 'visible';

    // Recurse into the next page if needed
    if (moved) {
        // Force layout update
        requestAnimationFrame(() => {
            paginateFrom(nextPage);
        });
    }
}

// Debounced pagination scheduler
function schedulePaginate(page) {
    if (paginateDebounceTimer) {
        cancelAnimationFrame(paginateDebounceTimer);
        paginateDebounceTimer = null;
    }
    paginateDebounceTimer = requestAnimationFrame(() => {
        paginateDebounceTimer = null;
        if (page && page.isConnected) {
            paginateFrom(page);
        } else {
            // Fallback: paginate all pages
            document.querySelectorAll('#editorPagesContainer .a4-page').forEach(p => paginateFrom(p));
        }
    });
}

function handlePageInputEvent(e) {
    const page = e.target.closest('.a4-page');
    if (page) {
        schedulePaginate(page);
    }
}

function addPageToEditor(afterPage = null) {
    const p = document.createElement('div');
    p.className = 'a4-page';
    p.contentEditable = 'true';
    p.style.overflow = 'visible';

    if (afterPage && afterPage.nextSibling) {
        editorPagesContainer.insertBefore(p, afterPage.nextSibling);
    } else {
        editorPagesContainer.appendChild(p);
    }

    p.addEventListener('input', handlePageInputEvent);
    p.addEventListener('dragover', (e) => { e.preventDefault();
        e.stopPropagation(); });
    p.addEventListener('drop', handleFileDrop);
    p.addEventListener('paste', handleFilePaste);

    updatePageNumbers();
    // Force a pagination check after adding
    schedulePaginate(p);
    return p;
}

function forcePaginateAll() {
    const pages = document.querySelectorAll('#editorPagesContainer .a4-page');
    pages.forEach(p => {
        p.style.overflow = 'visible';
        schedulePaginate(p);
    });
}

function updatePageNumbers() {
    const pages = document.querySelectorAll('#editorPagesContainer .a4-page');
    pages.forEach((p, idx) => p.setAttribute('data-page-num', `Page ${idx + 1}`));
}

function bindPageListeners() {
    document.querySelectorAll('#editorPagesContainer .a4-page').forEach(p => {
        p.removeEventListener('input', handlePageInputEvent);
        p.addEventListener('input', handlePageInputEvent);
        p.style.overflow = 'visible';

        p.removeEventListener('dragover', handleFileDrop);
        p.addEventListener('dragover', (e) => { e.preventDefault();
            e.stopPropagation(); });

        p.removeEventListener('drop', handleFileDrop);
        p.addEventListener('drop', handleFileDrop);

        p.removeEventListener('paste', handleFilePaste);
        p.addEventListener('paste', handleFilePaste);
    });
}

// ─── ZOOM ────────────────────────────────────────────────────────────
function updateZoomDisplay() {
    editorPagesContainer.style.transform = `scale(${currentZoomLevel})`;
    refinedPreviewBody.style.transform = `scale(${currentZoomLevel})`;
    zoomLabel.innerText = `${Math.round(currentZoomLevel * 100)}%`;
}

// ─── NOTE SETUP / EDITOR OPEN ──────────────────────────────────────
function openNoteSetupModal(defaultSubjectId = null) {
    if (state.subjects.length === 0) {
        showCustomAlert({ title: "No Subjects Found", message: "Please create a subject before creating a new note." });
        document.getElementById('subjectModalTitle').innerText = 'Create New Subject';
        document.getElementById('editingSubjectId').value = '';
        document.getElementById('modalSubjectName').value = '';
        document.getElementById('modalSubjectColor').value = '#8b5cf6';
        subjectModal.classList.add('open');
        return;
    }

    setupNoteTitle.value = '';
    setupNoteSubject.innerHTML = '';
    setupNoteDate.value = new Date().toISOString().split('T')[0];

    state.subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = s.name;
        setupNoteSubject.appendChild(opt);
    });

    if (defaultSubjectId) setupNoteSubject.value = defaultSubjectId;
    else if (state.selectedSubjectId) setupNoteSubject.value = state.selectedSubjectId;

    noteSetupModal.classList.add('open');
    setupNoteTitle.focus();
}

function openNewNoteEditor(title, subjectId, dateStr) {
    populateEditorSubjects();
    state.activeNoteId = null;
    noteTitleInput.value = title;
    noteDateInput.value = dateStr || new Date().toISOString().split('T')[0];
    noteSubjectSelect.value = subjectId;

    editorPagesContainer.innerHTML = '';
    addPageToEditor();

    pendingNoteSetup = { title, subjectId, date: noteDateInput.value, createdAt: Date.now() };
    recordInitialState();
    resetZoomAndPanels();
    rebindSketches();
    editorModal.classList.add('open');

    setTimeout(() => document.querySelector('.a4-page').focus(), 100);
    // Force pagination after content loads
    setTimeout(() => forcePaginateAll(), 200);
}

function openExistingNoteEditor(noteId) {
    populateEditorSubjects();
    const note = state.notes.find(n => n.id === noteId);
    if (!note) return;

    pendingNoteSetup = null;
    state.activeNoteId = noteId;
    noteTitleInput.value = note.title;
    noteDateInput.value = note.date || new Date().toISOString().split('T')[0];
    noteSubjectSelect.value = note.subjectId;

    editorPagesContainer.innerHTML = note.content;
    if (!note.content.includes('a4-page')) {
        editorPagesContainer.innerHTML = '';
        const p = addPageToEditor();
        p.innerHTML = note.content;
    } else {
        // Ensure all pages have overflow visible and listeners
        document.querySelectorAll('#editorPagesContainer .a4-page').forEach(p => {
            p.style.overflow = 'visible';
        });
    }

    bindPageListeners();
    updatePageNumbers();

    recordInitialState();
    resetZoomAndPanels();
    rebindSketches();
    editorModal.classList.add('open');

    setTimeout(() => document.querySelector('.a4-page').focus(), 100);
    // Force pagination after content loads
    setTimeout(() => forcePaginateAll(), 200);
}

function resetZoomAndPanels() {
    currentZoomLevel = 1.0;
    updateZoomDisplay();
    if (isSketchingMode) toggleSketchMode();
    closeAiSummaryPanel();
    closeSplitRefineView();
}

function closeAiSummaryPanel() {
    aiSummaryPanel.classList.remove('open');
    aiSummaryPanel.style.display = 'none';
    aiResizer.style.display = 'none';
}

function recordInitialState() {
    initialNoteState = {
        title: noteTitleInput.value,
        subjectId: noteSubjectSelect.value,
        date: noteDateInput.value,
        content: editorPagesContainer.innerHTML
    };
}

function hasUnsavedChanges() {
    return noteTitleInput.value !== initialNoteState.title ||
        noteSubjectSelect.value !== initialNoteState.subjectId ||
        noteDateInput.value !== initialNoteState.date ||
        editorPagesContainer.innerHTML !== initialNoteState.content;
}

function populateEditorSubjects() {
    noteSubjectSelect.innerHTML = '';
    state.subjects.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.id;
        opt.innerText = s.name;
        noteSubjectSelect.appendChild(opt);
    });
}

function saveNote() {
    if (isSketchingMode) toggleSketchMode();

    const title = noteTitleInput.value.trim() || 'Untitled Note';
    const content = editorPagesContainer.innerHTML;
    const subjectId = noteSubjectSelect.value;
    const date = noteDateInput.value || new Date().toISOString().split('T')[0];

    if (state.activeNoteId) {
        const idx = state.notes.findIndex(n => n.id === state.activeNoteId);
        if (idx !== -1) {
            state.notes[idx] = { ...state.notes[idx], title, content, subjectId, date };
        }
    } else {
        const newNote = {
            id: 'note_' + Date.now(),
            title,
            content,
            subjectId,
            date,
            createdAt: pendingNoteSetup ? pendingNoteSetup.createdAt : Date.now()
        };
        state.notes.unshift(newNote);
    }

    saveState();
    recordInitialState();
    editorModal.classList.remove('open');
    renderSidebarNav();
    renderMainWorkspace();
}

// ─── SKETCH MODE ────────────────────────────────────────────────────
function toggleSketchMode() {
    isSketchingMode = !isSketchingMode;
    if (isSketchingMode) {
        btnSketch.classList.add('active-sketch');
        sketchColorPicker.style.display = 'inline-block';
        sketchSizeSelect.style.display = 'inline-block';
        sketchCanvas.style.display = 'block';
        sketchCanvas.style.pointerEvents = 'auto';

        sketchCanvas.style.width = editorPagesContainer.offsetWidth + 'px';
        sketchCanvas.style.height = editorPagesContainer.offsetHeight + 'px';
        sketchCanvas.width = editorPagesContainer.offsetWidth;
        sketchCanvas.height = editorPagesContainer.offsetHeight;
        sketchCanvas.style.top = editorPagesContainer.offsetTop + 'px';

        sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
    } else {
        btnSketch.classList.remove('active-sketch');
        sketchColorPicker.style.display = 'none';
        sketchSizeSelect.style.display = 'none';

        saveSketchToDoc();

        sketchCanvas.style.display = 'none';
        sketchCanvas.style.pointerEvents = 'none';
    }
}

function createInteractiveSketch(dataUrl, x = 0, y = 0, width = 200, height = 200) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sketch-wrapper';
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.style.left = x + 'px';
    wrapper.style.top = y + 'px';
    wrapper.style.width = width + 'px';
    wrapper.style.height = height + 'px';

    wrapper.innerHTML = `
    <img src="${dataUrl}" alt="Sketch">
    <div class="sketch-handle nw" data-handle="nw"></div>
    <div class="sketch-handle ne" data-handle="ne"></div>
    <div class="sketch-handle sw" data-handle="sw"></div>
    <div class="sketch-handle se" data-handle="se"></div>
    <button class="sketch-delete-btn" title="Delete Sketch">&times;</button>
    `;

    editorPagesContainer.appendChild(wrapper);
    makeSketchInteractive(wrapper);
}

function makeSketchInteractive(wrapper) {
    let isDragging = false;
    let isResizing = false;
    let currentHandle = null;
    let startX, startY, startLeft, startTop, startWidth, startHeight;

    const delBtn = wrapper.querySelector('.sketch-delete-btn');
    if (delBtn) {
        delBtn.onclick = (e) => {
            e.stopPropagation();
            wrapper.remove();
        };
    }

    wrapper.addEventListener('mousedown', (e) => {
        document.querySelectorAll('.sketch-wrapper').forEach(w => w.classList.remove('selected'));
        wrapper.classList.add('selected');

        if (e.target.classList.contains('sketch-handle')) {
            isResizing = true;
            currentHandle = e.target.dataset.handle;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = wrapper.offsetWidth;
            startHeight = wrapper.offsetHeight;
            startLeft = wrapper.offsetLeft;
            startTop = wrapper.offsetTop;
            e.stopPropagation();
            e.preventDefault();
            return;
        }

        if (e.target.classList.contains('sketch-delete-btn')) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = wrapper.offsetLeft;
        startTop = wrapper.offsetTop;
        e.stopPropagation();
        e.preventDefault();
    });

    const onMouseMove = (e) => {
        if (isDragging) {
            const dx = (e.clientX - startX) / currentZoomLevel;
            const dy = (e.clientY - startY) / currentZoomLevel;
            wrapper.style.left = (startLeft + dx) + 'px';
            wrapper.style.top = (startTop + dy) + 'px';
        } else if (isResizing) {
            const dx = (e.clientX - startX) / currentZoomLevel;
            const dy = (e.clientY - startY) / currentZoomLevel;

            if (currentHandle === 'se') {
                wrapper.style.width = Math.max(30, startWidth + dx) + 'px';
                wrapper.style.height = Math.max(30, startHeight + dy) + 'px';
            } else if (currentHandle === 'sw') {
                const newWidth = Math.max(30, startWidth - dx);
                wrapper.style.width = newWidth + 'px';
                wrapper.style.left = (startLeft + (startWidth - newWidth)) + 'px';
                wrapper.style.height = Math.max(30, startHeight + dy) + 'px';
            } else if (currentHandle === 'ne') {
                const newHeight = Math.max(30, startHeight - dy);
                wrapper.style.width = Math.max(30, startWidth + dx) + 'px';
                wrapper.style.height = newHeight + 'px';
                wrapper.style.top = (startTop + (startHeight - newHeight)) + 'px';
            } else if (currentHandle === 'nw') {
                const newWidth = Math.max(30, startWidth - dx);
                const newHeight = Math.max(30, startHeight - dy);
                wrapper.style.width = newWidth + 'px';
                wrapper.style.height = newHeight + 'px';
                wrapper.style.left = (startLeft + (startWidth - newWidth)) + 'px';
                wrapper.style.top = (startTop + (startHeight - newHeight)) + 'px';
            }
        }
    };

    const onMouseUp = () => {
        isDragging = false;
        isResizing = false;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function rebindSketches() {
    editorPagesContainer.querySelectorAll('.sketch-wrapper').forEach(wrapper => {
        makeSketchInteractive(wrapper);
    });
}

function saveSketchToDoc() {
    const imgData = sketchCtx.getImageData(0, 0, sketchCanvas.width, sketchCanvas.height);
    const data = imgData.data;

    let minX = sketchCanvas.width,
        minY = sketchCanvas.height,
        maxX = 0,
        maxY = 0;
    let hasContent = false;

    for (let y = 0; y < sketchCanvas.height; y++) {
        for (let x = 0; x < sketchCanvas.width; x++) {
            const alpha = data[(y * sketchCanvas.width + x) * 4 + 3];
            if (alpha > 0) {
                hasContent = true;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (hasContent) {
        const pad = 12;
        minX = Math.max(0, minX - pad);
        minY = Math.max(0, minY - pad);
        maxX = Math.min(sketchCanvas.width, maxX + pad);
        maxY = Math.min(sketchCanvas.height, maxY + pad);

        const w = maxX - minX;
        const h = maxY - minY;

        const cropCvs = document.createElement('canvas');
        cropCvs.width = w;
        cropCvs.height = h;
        const cCtx = cropCvs.getContext('2d');
        cCtx.putImageData(sketchCtx.getImageData(minX, minY, w, h), 0, 0);

        const dataUrl = cropCvs.toDataURL('image/png');
        createInteractiveSketch(dataUrl, minX, minY, w, h);
    }

    sketchCtx.clearRect(0, 0, sketchCanvas.width, sketchCanvas.height);
}

function getCanvasPos(e) {
    const rect = sketchCanvas.getBoundingClientRect();
    const scaleX = sketchCanvas.width / rect.width;
    const scaleY = sketchCanvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function startDrawing(e) {
    if (!isSketchingMode) return;
    isDrawing = true;
    const pos = getCanvasPos(e);
    sketchCtx.beginPath();
    sketchCtx.moveTo(pos.x, pos.y);
    sketchCtx.strokeStyle = sketchColorPicker.value;
    sketchCtx.lineWidth = parseInt(sketchSizeSelect.value, 10);
    sketchCtx.lineCap = 'round';
    sketchCtx.lineJoin = 'round';
}

function draw(e) {
    if (!isDrawing || !isSketchingMode) return;
    e.preventDefault();
    const pos = getCanvasPos(e);
    sketchCtx.lineTo(pos.x, pos.y);
    sketchCtx.stroke();
}

function stopDrawing() {
    if (isDrawing) {
        sketchCtx.closePath();
        isDrawing = false;
    }
}

// ─── stripHTML ──────────────────────────────────────────────────────
function stripHTML(html) {
    if (!html) return '';
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
}

// ─── OpenRouter API ─────────────────────────────────────────────────
async function callOpenRouterAPI(messages, maxTokens = 4096) {
    if (!OPENROUTER_API_KEY) {
        throw new Error("Missing valid OpenRouter API Key.");
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": window.location.href,
                "X-Title": "AuraNotes Google Docs AI"
            },
            body: JSON.stringify({
                model: "deepseek/deepseek-v4-flash-vision-exp",
                max_tokens: maxTokens,
                messages: messages
            })
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData?.error?.message || `API request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices.length || !data.choices[0].message) {
            throw new Error("Invalid response from AI API.");
        }

        const content = data.choices[0].message.content;
        if (!content || content.trim().length === 0) {
            throw new Error("AI returned an empty response.");
        }

        return content;

    } catch (err) {
        console.error("OpenRouter API error:", err);
        throw new Error(`AI service error: ${err.message}`);
    }
}

// ─── Split content into chunks ─────────────────────────────────────
function splitContentIntoChunks(htmlContent, maxChunkCharLength = 2000) {
    if (!htmlContent || !htmlContent.trim()) return [];

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const childNodes = Array.from(tempDiv.childNodes);
    if (childNodes.length === 0) {
        const text = tempDiv.textContent || htmlContent;
        if (!text.trim()) return [];
        if (text.length <= maxChunkCharLength) return [text];

        const chunks = [];
        let cur = "";
        const lines = text.split(/(?<=\n)/);
        for (const line of lines) {
            if ((cur + line).length > maxChunkCharLength && cur.length > 0) {
                chunks.push(cur.trim());
                cur = line;
            } else {
                cur += line;
            }
        }
        if (cur.trim()) chunks.push(cur.trim());
        return chunks.length > 0 ? chunks : [text];
    }

    const chunks = [];
    let currentChunk = "";

    for (const node of childNodes) {
        let nodeContent = '';
        if (node.nodeType === Node.ELEMENT_NODE) {
            nodeContent = node.outerHTML;
        } else if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                nodeContent = `<p>${text}</p>`;
            }
        }

        if (!nodeContent) continue;

        if ((currentChunk + nodeContent).length > maxChunkCharLength && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = nodeContent;
        } else {
            currentChunk += nodeContent;
        }
    }

    if (currentChunk.trim()) {
        chunks.push(currentChunk);
    }

    return chunks.length > 0 ? chunks : [tempDiv.textContent || htmlContent];
}

// ─── AI REFINE (fixed: clean response) ──────────────────────────────

// Clean AI response to extract only the HTML content
function cleanAIResponse(response) {
    // Remove markdown code fences
    let cleaned = response.replace(/^```html\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();

    // Remove common introductory phrases
    const introPatterns = [
        /^Here\s+is\s+(a\s+)?(clean|structured|well-structured|refined|polished|enhanced|beautiful)\s+(HTML\s+)?(document|version|content|text|note|output).*?[:.]\s*/i,
        /^I(\'ve| have)\s+(created|generated|refined|produced|written|prepared)\s+(a\s+)?(clean|structured|well-structured|refined|polished|enhanced|beautiful)\s+(HTML\s+)?(document|version|content|text|note|output).*?[:.]\s*/i,
        /^Below\s+is\s+(a\s+)?(clean|structured|well-structured|refined|polished|enhanced|beautiful)\s+(HTML\s+)?(document|version|content|text|note|output).*?[:.]\s*/i,
        /^The\s+(refined|enhanced|updated|revised|improved)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^I\s+have\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(the\s+)?(document|content|text|version|note).*?[:.]\s*/i,
        /^Here\s+is\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^This\s+is\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^Please\s+find\s+below\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^Attached\s+is\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^The\s+following\s+is\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^I\s+hope\s+this\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^I\s+think\s+this\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^This\s+should\s+be\s+the\s+(refined|enhanced|updated|revised|improved|restructured|reformatted)\s+(document|content|text|version|note).*?[:.]\s*/i,
        /^Let\s+me\s+know\s+if\s+you\s+need\s+any\s+changes\s*[:.]\s*/i,
        /^Feel\s+free\s+to\s+use\s+this\s+(as\s+a\s+)?(starting\s+)?point\s*[:.]\s*/i,
        /^You\s+can\s+use\s+this\s+as\s+a\s+(starting\s+)?point\s*[:.]\s*/i,
        /^Here\s+you\s+go\s*[:.]\s*/i,
        /^There\s+you\s+go\s*[:.]\s*/i,
        /^Enjoy\s*[:.]\s*/i,
        /^Hope\s+this\s+helps\s*[:.]\s*/i
    ];

    for (const pattern of introPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Remove trailing questions or follow-up prompts
    const trailingPatterns = [
        /\s*(Would\s+you\s+like\s+me\s+to\s+(?:further|continue|expand|elaborate|add|modify|change|adjust|improve|enhance|refine).*?)$/i,
        /\s*(Let\s+me\s+know\s+if\s+you\s+need\s+any\s+(?:further\s+)?(?:changes|adjustments|modifications|improvements).*?)$/i,
        /\s*(Do\s+you\s+want\s+me\s+to\s+(?:further|continue|expand|elaborate|add|modify|change|adjust|improve|enhance|refine).*?)$/i,
        /\s*(Should\s+I\s+(?:further|continue|expand|elaborate|add|modify|change|adjust|improve|enhance|refine).*?)$/i,
        /\s*(Can\s+I\s+(?:further|continue|expand|elaborate|add|modify|change|adjust|improve|enhance|refine).*?)$/i,
        /\s*(Would\s+you\s+like\s+me\s+to\s+explain\s+.*?\?)$/i,
        /\s*(Is\s+there\s+anything\s+else\s+you\s+need\?)$/i,
        /\s*(Let\s+me\s+know\s+if\s+you\s+have\s+any\s+questions\.?)$/i,
        /\s*(Feel\s+free\s+to\s+ask\s+if\s+you\s+have\s+any\s+questions\.?)$/i,
        /\s*(If\s+you\s+need\s+anything\s+else,\s+let\s+me\s+know\.?)$/i
    ];

    for (const pattern of trailingPatterns) {
        cleaned = cleaned.replace(pattern, '');
    }

    // Trim any leftover whitespace
    cleaned = cleaned.trim();

    // If the response starts with a div or other HTML tag, keep it; otherwise, wrap in div
    if (cleaned && !/^\s*</.test(cleaned)) {
        // It might be plain text — wrap it in a paragraph
        cleaned = `<p>${cleaned}</p>`;
    }

    return cleaned;
}

async function refineWithAI() {
    // Get ALL pages with content
    const pages = Array.from(document.querySelectorAll('#editorPagesContainer .a4-page'));

    // Extract content from each page
    let pageContents = pages.map(p => p.innerHTML.trim()).filter(c => c.length > 0);

    if (pageContents.length === 0) {
        const textContent = editorPagesContainer.textContent.trim();
        if (!textContent) {
            showCustomAlert({
                title: "Empty Document",
                message: "Please enter some note content first to refine."
            });
            return;
        }
        pageContents = [textContent];
    }

    const fullContent = pageContents.join('\n\n');

    if (!fullContent.trim()) {
        showCustomAlert({
            title: "Empty Document",
            message: "Please enter some note content first to refine."
        });
        return;
    }

    const btnRefine = document.getElementById('btnRefineAi');
    const originalText = btnRefine.innerHTML;
    btnRefine.disabled = true;

    try {
        const chunks = splitContentIntoChunks(fullContent, 2000);

        if (chunks.length === 0) {
            throw new Error("No content could be extracted from the document.");
        }

        let combinedRefinedHtml = "";

        const systemPrompt =
            `You are an expert document editor. Refine, enhance, and organize the following note content into extremely structured, clean, beautiful HTML suitable for a Google Doc.

Rules:
- Improve clarity, correct spelling/grammar
- Use standard headings (h2, h3) for structure
- Use bold for key terms and highlights
- Use nicely formatted lists where appropriate
- Preserve ALL mathematical formulas and expressions
- RETURN ONLY THE HTML BODY INNER CONTENT WITHOUT ANY MARKDOWN BACKTICKS OR EXPLANATION`;

        for (let i = 0; i < chunks.length; i++) {
            btnRefine.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Refining (${i + 1}/${chunks.length})...`;

            const messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: chunks[i] }
            ];

            let refinedResult = await callOpenRouterAPI(messages, 3072);

            // Clean the response
            refinedResult = cleanAIResponse(refinedResult);

            combinedRefinedHtml += (combinedRefinedHtml ? "<br>" : "") + refinedResult;
        }

        if (!combinedRefinedHtml.trim()) {
            throw new Error("The AI didn't return any refined content. Please try again.");
        }

        // Final cleanup: remove any stray markdown or text artifacts
        combinedRefinedHtml = cleanAIResponse(combinedRefinedHtml);

        pendingRefinedHtml = combinedRefinedHtml;
        showSplitRefineView(combinedRefinedHtml);

    } catch (err) {
        showCustomAlert({
            title: "Refinement Error",
            message: err.message || "Failed to refine the document. Please try again."
        });
        console.error("Refinement error:", err);
    } finally {
        btnRefine.innerHTML = originalText;
        btnRefine.disabled = false;
    }
}

// ─── AI SUMMARY ──────────────────────────────────────────────────────
function appendChatMessage(role, textHtml) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-msg ${role}`;

    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.innerHTML = textHtml;
    msgDiv.appendChild(bubble);

    if (role === 'ai') {
        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-to-doc';
        addBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add to Doc';
        addBtn.onclick = () => {
            const page = getActivePage();
            if (page) {
                page.focus();
                document.execCommand('insertHTML', false, `<p>${textHtml}</p>`);
                schedulePaginate(page);
            }
        };
        msgDiv.appendChild(addBtn);
    }

    aiChatMessages.appendChild(msgDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
}

async function summarizeWithAI() {
    const textContent = editorPagesContainer.innerText.trim();
    if (!textContent) {
        showCustomAlert({ title: "Empty Document", message: "Please enter some note content first before summarizing." });
        return;
    }

    aiSummaryPanel.style.display = 'flex';
    aiSummaryPanel.classList.add('open');
    aiResizer.style.display = 'block';
    aiChatMessages.innerHTML = `
    <div class="ai-loader">
        <i class="fa-solid fa-spinner fa-spin" style="font-size:1.8rem; color:var(--accent);"></i>
        <span>Generating AI summary...</span>
    </div>
    `;

    summaryChatHistory = [
        { role: "system",
            content: "You are a helpful AI document assistant. When asked to summarize, summarize the user's document using structured HTML (bullet points, bold highlights, concise key takeaways). For follow-up questions, answer directly based on the document context." },
        { role: "user",
            content: `Here is my document content:\n\n${textContent.slice(0, 10000)}\n\nPlease summarize this document.` }
    ];

    try {
        const summaryHtml = await callOpenRouterAPI(summaryChatHistory, 2048);
        summaryChatHistory.push({ role: "assistant", content: summaryHtml });

        aiChatMessages.innerHTML = '';
        appendChatMessage('ai', summaryHtml);

        aiChatInput.disabled = false;
        btnSendChat.disabled = false;
        aiChatInput.focus();

    } catch (err) {
        aiChatMessages.innerHTML = `<div style="color:#ef4444; padding:12px;"><strong>Error:</strong> ${err.message}</div>`;
    }
}

aiChatForm.onsubmit = async (e) => {
    e.preventDefault();
    const userText = aiChatInput.value.trim();
    if (!userText) return;

    appendChatMessage('user', userText);
    aiChatInput.value = '';

    summaryChatHistory.push({ role: "user", content: userText });

    const loadingId = 'loading_' + Date.now();
    const loaderDiv = document.createElement('div');
    loaderDiv.id = loadingId;
    loaderDiv.className = 'chat-msg ai';
    loaderDiv.innerHTML = `<div class="chat-bubble"><i class="fa-solid fa-spinner fa-spin"></i> Thinking...</div>`;
    aiChatMessages.appendChild(loaderDiv);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

    try {
        const replyHtml = await callOpenRouterAPI(summaryChatHistory, 2048);
        summaryChatHistory.push({ role: "assistant", content: replyHtml });

        document.getElementById(loadingId)?.remove();
        appendChatMessage('ai', replyHtml);

    } catch (err) {
        document.getElementById(loadingId)?.remove();
        showCustomAlert({ title: "AI Error", message: err.message });
    }
};

// ─── SPLIT REFINE VIEW ──────────────────────────────────────────────
function showSplitRefineView(refinedHtml) {
    refinedPreviewBody.innerHTML = refinedHtml;
    originalPaneLabel.style.display = 'block';
    refinedPaneWrapper.style.display = 'flex';
    refineBanner.style.display = 'flex';
    docsPageViewport.classList.add('split-mode');

    document.querySelectorAll('.a4-page').forEach(p => p.setAttribute('contenteditable', 'false'));
}

function closeSplitRefineView() {
    originalPaneLabel.style.display = 'none';
    refinedPaneWrapper.style.display = 'none';
    refineBanner.style.display = 'none';
    docsPageViewport.classList.remove('split-mode');

    document.querySelectorAll('#editorPagesContainer .a4-page').forEach(p => p.setAttribute('contenteditable',
    'true'));
}

btnAcceptRefine.onclick = () => {
    if (pendingRefinedHtml) {
        editorPagesContainer.innerHTML = '';
        const p = addPageToEditor();
        p.innerHTML = pendingRefinedHtml;
        forcePaginateAll();
        rebindSketches();
        // Update page numbers and force pagination
        updatePageNumbers();
        setTimeout(() => forcePaginateAll(), 100);
    }
    closeSplitRefineView();
};

btnDeclineRefine.onclick = () => {
    closeSplitRefineView();
};

let isResizingPanel = false;
aiResizer.onmousedown = (e) => {
    isResizingPanel = true;
    aiResizer.classList.add('resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
};

document.addEventListener('mousemove', (e) => {
    if (!isResizingPanel) return;
    const newWidth = window.innerWidth - e.clientX;
    if (newWidth >= 280 && newWidth <= 700) {
        aiSummaryPanel.style.width = `${newWidth}px`;
    }
});

document.addEventListener('mouseup', () => {
    if (isResizingPanel) {
        isResizingPanel = false;
        aiResizer.classList.remove('resizing');
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }
});

// ─── CONTEXT MENU & HELPERS ────────────────────────────────────────
function handleRightClick(e, type, id) {
    e.preventDefault();
    e.stopPropagation();
    contextTarget = { type, id };

    if (type === 'note') {
        ctxEditSubject.style.display = 'none';
        ctxDeleteNote.style.display = 'flex';
        ctxDeleteSubject.style.display = 'none';
    } else if (type === 'subject') {
        ctxEditSubject.style.display = 'flex';
        ctxDeleteNote.style.display = 'none';
        ctxDeleteSubject.style.display = 'flex';
    }

    customContextMenu.style.left = `${e.clientX}px`;
    customContextMenu.style.top = `${e.clientY}px`;
    customContextMenu.classList.add('active');
}

async function deleteNote(id) {
    const confirmed = await showCustomConfirm({
        title: "Delete Note",
        message: "Are you sure you want to delete this note?",
        confirmBtnText: "Delete Note"
    });

    if (confirmed) {
        state.notes = state.notes.filter(n => n.id !== id);
        saveState();
        renderSidebarNav();
        renderMainWorkspace();
    }
}

async function deleteSubject(subjectId) {
    const sub = state.subjects.find(s => s.id === subjectId);
    const subName = sub ? sub.name : 'this subject';

    const confirm1 = await showCustomConfirm({
        title: "Delete Subject",
        message: `Delete "${subName}" and ALL notes inside it?`
    });

    if (confirm1) {
        state.subjects = state.subjects.filter(s => s.id !== subjectId);
        state.notes = state.notes.filter(n => n.subjectId !== subjectId);

        if (state.selectedSubjectId === subjectId) state.selectedSubjectId = null;
        saveState();
        renderSidebarNav();
        renderMainWorkspace();
    }
}

function showCustomConfirm({ title = "Confirm Action", message, confirmBtnText = "Confirm" }) {
    return new Promise((resolve) => {
        document.getElementById('confirmModalTitle').innerText = title;
        document.getElementById('confirmModalMessage').innerText = message;
        const btnAction = document.getElementById('btnConfirmAction');
        const btnCancel = document.getElementById('btnConfirmCancel');

        btnAction.innerText = confirmBtnText;

        const handleConfirm = () => { cleanup();
            confirmModal.classList.remove('open');
            resolve(true); };
        const handleCancel = () => { cleanup();
            confirmModal.classList.remove('open');
            resolve(false); };
        const cleanup = () => {
            btnAction.removeEventListener('click', handleConfirm);
            btnCancel.removeEventListener('click', handleCancel);
        };

        btnAction.addEventListener('click', handleConfirm);
        btnCancel.addEventListener('click', handleCancel);
        confirmModal.classList.add('open');
    });
}

function showCustomAlert({ title = "Notice", message }) {
    return new Promise((resolve) => {
        document.getElementById('alertModalTitle').innerText = title;
        document.getElementById('alertModalMessage').innerText = message;
        const btnOk = document.getElementById('btnAlertOk');

        const handleOk = () => {
            btnOk.removeEventListener('click', handleOk);
            alertModal.classList.remove('open');
            resolve(true);
        };

        btnOk.addEventListener('click', handleOk);
        alertModal.classList.add('open');
    });
}

// ─── FILE DROP / PASTE ─────────────────────────────────────────────
function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (evt) => insertImageToEditor(evt.target.result);
                reader.readAsDataURL(file);
            }
        });
    }
}

function handleFilePaste(e) {
    const clipboardItems = (e.clipboardData || e.originalEvent?.clipboardData)?.items;
    if (clipboardItems) {
        for (let item of clipboardItems) {
            if (item.type.indexOf('image') === 0) {
                e.preventDefault();
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (evt) => insertImageToEditor(evt.target.result);
                reader.readAsDataURL(blob);
                break;
            }
        }
    }
}

// ─── EVENT LISTENERS ───────────────────────────────────────────────
function setupEventListeners() {
    document.getElementById('btnZoomIn').onclick = () => {
        if (currentZoomLevel < 1.8) { currentZoomLevel += 0.1;
            updateZoomDisplay(); }
    };
    document.getElementById('btnZoomOut').onclick = () => {
        if (currentZoomLevel > 0.5) { currentZoomLevel -= 0.1;
            updateZoomDisplay(); }
    };

    btnSketch.onclick = toggleSketchMode;
    sketchCanvas.addEventListener('mousedown', startDrawing);
    sketchCanvas.addEventListener('mousemove', draw);
    sketchCanvas.addEventListener('mouseup', stopDrawing);
    sketchCanvas.addEventListener('mouseleave', stopDrawing);
    sketchCanvas.addEventListener('touchstart', startDrawing);
    sketchCanvas.addEventListener('touchmove', draw);
    sketchCanvas.addEventListener('touchend', stopDrawing);

    editorPagesContainer.addEventListener('mousedown', (e) => {
        if (!e.target.closest('.sketch-wrapper')) {
            document.querySelectorAll('.sketch-wrapper').forEach(w => w.classList.remove('selected'));
        }
    });

    imageFileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (evt) => insertImageToEditor(evt.target.result);
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };

    blockFormatSelect.onchange = (e) => {
        const tag = e.target.value;
        document.execCommand('formatBlock', false, tag);
    };

    fontSizeSelect.onchange = (e) => {
        const size = e.target.value;
        document.execCommand('fontSize', false, size);
    };

    document.getElementById('btnSummarizeAi').onclick = summarizeWithAI;
    document.getElementById('btnRefineAi').onclick = refineWithAI;
    document.getElementById('btnCloseAiPanel').onclick = closeAiSummaryPanel;

    document.getElementById('btnTogglePageNum').onclick = () => {
        showPageNumbers = !showPageNumbers;
        const btn = document.getElementById('btnTogglePageNum');
        if (showPageNumbers) {
            editorPagesContainer.classList.add('show-page-numbers');
            btn.classList.add('active-sketch');
        } else {
            editorPagesContainer.classList.remove('show-page-numbers');
            btn.classList.remove('active-sketch');
        }
    };

    document.getElementById('btnSortSubject').onclick = () => {
        state.sortBy = 'subject';
        document.getElementById('btnSortSubject').classList.add('active');
        document.getElementById('btnSortDate').classList.remove('active');
        resetNav();
    };
    document.getElementById('btnSortDate').onclick = () => {
        state.sortBy = 'date';
        document.getElementById('btnSortDate').classList.add('active');
        document.getElementById('btnSortSubject').classList.remove('active');
        resetNav();
    };

    document.getElementById('btnOpenSubjectModal').onclick = () => {
        document.getElementById('subjectModalTitle').innerText = 'Create New Subject';
        document.getElementById('editingSubjectId').value = '';
        document.getElementById('modalSubjectName').value = '';
        document.getElementById('modalSubjectColor').value = '#8b5cf6';
        subjectModal.classList.add('open');
    };
    document.getElementById('btnCloseSubjectModal').onclick = () => subjectModal.classList.remove('open');

    document.getElementById('newSubjectForm').onsubmit = (e) => {
        e.preventDefault();
        const editingId = document.getElementById('editingSubjectId').value;
        const name = document.getElementById('modalSubjectName').value.trim();
        const color = document.getElementById('modalSubjectColor').value;
        if (name) {
            if (editingId) {
                const sub = state.subjects.find(s => s.id === editingId);
                if (sub) {
                    sub.name = name;
                    sub.color = color;
                }
            } else {
                state.subjects.push({ id: 'subj_' + Date.now(), name, color });
            }
            saveState();
            document.getElementById('modalSubjectName').value = '';
            document.getElementById('editingSubjectId').value = '';
            subjectModal.classList.remove('open');
            renderSidebarNav();
            renderMainWorkspace();
        }
    };

    document.getElementById('btnNewNote').onclick = () => openNoteSetupModal();
    document.getElementById('btnCloseSetupModal').onclick = () => noteSetupModal.classList.remove('open');
    document.getElementById('noteSetupForm').onsubmit = (e) => {
        e.preventDefault();
        const title = setupNoteTitle.value.trim() || 'Untitled Note';
        const subjectId = setupNoteSubject.value;
        const dateStr = setupNoteDate.value || new Date().toISOString().split('T')[0];
        noteSetupModal.classList.remove('open');
        openNewNoteEditor(title, subjectId, dateStr);
    };

    document.getElementById('btnSaveNote').onclick = saveNote;
    document.getElementById('btnCloseEditor').onclick = () => {
        if (hasUnsavedChanges()) unsavedModal.classList.add('open');
        else editorModal.classList.remove('open');
    };

    document.getElementById('btnUnsavedSave').onclick = () => { unsavedModal.classList.remove('open');
        saveNote(); };
    document.getElementById('btnUnsavedDontSave').onclick = () => { unsavedModal.classList.remove('open');
        editorModal.classList.remove('open'); };
    document.getElementById('btnUnsavedCancel').onclick = () => unsavedModal.classList.remove('open');

    document.getElementById('btnInsertTable').onclick = () => tableModal.classList.add('open');
    document.getElementById('btnCloseTableModal').onclick = () => tableModal.classList.remove('open');
    document.getElementById('btnCancelTable').onclick = () => tableModal.classList.remove('open');

    document.getElementById('btnConfirmTable').onclick = () => {
        const rows = parseInt(document.getElementById('inputTableRows').value, 10);
        const cols = parseInt(document.getElementById('inputTableCols').value, 10);
        if (isNaN(rows) || isNaN(cols) || rows <= 0 || cols <= 0) return;

        let tableHtml = '<table><tbody>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) tableHtml += '<td>Cell</td>';
            tableHtml += '</tr>';
        }
        tableHtml += '</tbody></table><p><br></p>';

        tableModal.classList.remove('open');
        const page = getActivePage();
        if (page) {
            page.focus();
            document.execCommand('insertHTML', false, tableHtml);
            schedulePaginate(page);
        }
    };

    ctxEditSubject.onclick = () => {
        customContextMenu.classList.remove('active');
        if (contextTarget.type === 'subject' && contextTarget.id) {
            openEditSubjectModal(contextTarget.id);
        }
    };

    ctxDeleteNote.onclick = () => {
        customContextMenu.classList.remove('active');
        if (contextTarget.type === 'note' && contextTarget.id) deleteNote(contextTarget.id);
    };

    ctxDeleteSubject.onclick = () => {
        customContextMenu.classList.remove('active');
        if (contextTarget.type === 'subject' && contextTarget.id) deleteSubject(contextTarget.id);
    };

    document.addEventListener('click', () => customContextMenu.classList.remove('active'));

    document.querySelectorAll('.color-dot').forEach(dot => {
        dot.onclick = () => document.getElementById('modalSubjectColor').value = dot.dataset.color;
    });

    searchInput.oninput = (e) => {
        state.searchQuery = e.target.value;
        renderMainWorkspace();
    };

    document.querySelectorAll('.tool-btn[data-cmd]').forEach(btn => {
        btn.onclick = () => document.execCommand(btn.dataset.cmd, false, null);
    });

    document.getElementById('textColorPicker').onchange = (e) => {
        document.execCommand('foreColor', false, e.target.value);
    };

    document.getElementById('btnExport').onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download",
            `auranotes_backup_${new Date().toISOString().split('T')[0]}.json`);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    document.getElementById('btnImport').onclick = () => document.getElementById('importFileInput').click();
    document.getElementById('importFileInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
                try {
                    const importedData = JSON.parse(evt.target.result);
                    if (importedData.subjects && importedData.notes) {
                        state = importedData;
                        saveState();
                    }
                } catch (err) {
                    showCustomAlert({ title: "Import Error", message: "Invalid backup file." });
                }
            };
            reader.readAsText(file);
        }
    };
}

setupEventListeners();

