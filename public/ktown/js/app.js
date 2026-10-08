        // ── imports ──
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
        import {
            getAuth,
            createUserWithEmailAndPassword,
            signInWithEmailAndPassword,
            signInWithPopup,
            GoogleAuthProvider,
            updateProfile,
            sendPasswordResetEmail,
            onAuthStateChanged,
            signOut
        } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

        // ── config ──
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
        const provider = new GoogleAuthProvider();

        // ── state ──
        let isLoginMode = true;
        let currentUser = null;

        // ── DOM refs ──
        const toastContainer = document.getElementById('toastContainer');

        // ── TOAST SYSTEM ──
        window.showToast = (title, message, type = 'success', duration = 5000) => {
            const toast = document.createElement('div');
            toast.className = 'toast';

            const iconMap = {
                success: 'fa-solid fa-check-circle',
                error: 'fa-solid fa-circle-exclamation',
                info: 'fa-solid fa-circle-info'
            };
            const iconClass = iconMap[type] || iconMap.info;
            const iconColor = type === 'success' ? '' : type === 'error' ? 'error' : 'info';

            toast.innerHTML = `
                <div class="toast-icon ${iconColor}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="toast-body">
                    <h4>${title}</h4>
                    <p>${message}</p>
                </div>
                <button class="toast-close"><i class="fa-solid fa-xmark"></i></button>
            `;

            toastContainer.appendChild(toast);

            // trigger show
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });

            // close button
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                dismissToast(toast);
            });

            // auto dismiss
            const timer = setTimeout(() => {
                dismissToast(toast);
            }, duration);

            // store timer so we can clear it if user closes manually
            toast._timer = timer;

            return toast;
        };

        function dismissToast(toast) {
            if (!toast || !toast.parentNode) return;
            toast.classList.remove('show');
            if (toast._timer) clearTimeout(toast._timer);
            setTimeout(() => {
                if (toast.parentNode) toast.remove();
            }, 400);
        }

        // expose to window for inline use
        window.dismissToast = dismissToast;

        // ── auth mode switching ──
        window.setAuthMode = (mode) => {
            isLoginMode = (mode === 'login');
            const loginBtn = document.getElementById('toggleLoginBtn');
            const signupBtn = document.getElementById('toggleSignupBtn');
            const submitBtn = document.getElementById('authSubmitBtn');
            const usernameGroup = document.getElementById('usernameGroup');

            if (isLoginMode) {
                loginBtn.classList.add('active');
                signupBtn.classList.remove('active');
                submitBtn.innerText = 'Log In';
                usernameGroup.style.display = 'none';
            } else {
                signupBtn.classList.add('active');
                loginBtn.classList.remove('active');
                submitBtn.innerText = 'Create Account';
                usernameGroup.style.display = 'block';
            }
        };

        window.openAuthModal = (defaultMode = 'login') => {
            window.setAuthMode(defaultMode);
            document.getElementById('authModal').classList.add('active');
        };

        window.openSettingsModal = () => {
            if (!currentUser) return;
            document.getElementById('settingsUsername').value = currentUser.displayName || '';
            document.getElementById('settingsAvatarPreview').src = currentUser.photoURL ||
                `https://ui-avatars.com/api/?name=${currentUser.displayName || 'U'}&background=8b5cf6&color=fff`;
            document.getElementById('settingsModal').classList.add('active');
        };

        window.closeModals = () => {
            document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
        };

        // ── auth form ──
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('authEmail').value;
            const pass = document.getElementById('authPassword').value;
            const username = document.getElementById('authUsername').value;

            try {
                if (isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, pass);
                    window.showToast('Welcome back!', 'You have successfully logged in.', 'success');
                } else {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                    await updateProfile(userCredential.user, { displayName: username });
                    window.showToast('Account created!', 'Welcome to kTown, ' + username, 'success');
                }
                window.closeModals();
            } catch (error) {
                window.showToast('Authentication Error', error.message, 'error');
            }
        });

        document.getElementById('googleAuthBtn').addEventListener('click', async () => {
            try {
                await signInWithPopup(auth, provider);
                window.showToast('Welcome!', 'You have signed in with Google.', 'success');
                window.closeModals();
            } catch (error) {
                window.showToast('Google Sign-In Error', error.message, 'error');
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => {
            signOut(auth);
            window.showToast('Logged out', 'You have been signed out.', 'info');
        });

        // ── auth state ──
        onAuthStateChanged(auth, (user) => {
            currentUser = user;
            const guestControls = document.getElementById('guestControls');
            const userMenu = document.getElementById('userMenu');
            const heroWelcome = document.getElementById('heroWelcome');

            if (user) {
                guestControls.style.display = 'none';
                userMenu.style.display = 'flex';
                const displayName = user.displayName || 'User';
                document.getElementById('navUsername').innerText = displayName;
                document.getElementById('navAvatar').src = user.photoURL ||
                    `https://ui-avatars.com/api/?name=${displayName}&background=8b5cf6&color=fff`;
                heroWelcome.innerText = `Welcome back, ${displayName}`;
            } else {
                guestControls.style.display = 'flex';
                userMenu.style.display = 'none';
                heroWelcome.innerText = 'Welcome to kTown';
            }
        });

        // ── Cloudinary upload ──
        let pendingAvatarUrl = null;

        document.getElementById('avatarUpload').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ktown_avatars');

            const preview = document.getElementById('settingsAvatarPreview');
            preview.style.opacity = '0.5';

            try {
                const res = await fetch('https://api.cloudinary.com/v1_1/dl2xijhcd/image/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                pendingAvatarUrl = data.secure_url;
                preview.src = pendingAvatarUrl;
                window.showToast('Upload complete', 'Your new avatar is ready to save.', 'success');
            } catch (error) {
                window.showToast('Upload failed', 'Ensure your Cloudinary preset is set to Unsigned.', 'error');
            } finally {
                preview.style.opacity = '1';
            }
        });

        // ── save settings ──
        document.getElementById('saveSettingsBtn').addEventListener('click', async () => {
            if (!currentUser) return;
            const newUsername = document.getElementById('settingsUsername').value;
            const updates = {};
            if (newUsername) updates.displayName = newUsername;
            if (pendingAvatarUrl) updates.photoURL = pendingAvatarUrl;

            try {
                await updateProfile(currentUser, updates);
                window.showToast('Profile updated', 'Your changes have been saved.', 'success');
                // refresh nav
                const displayName = currentUser.displayName || 'User';
                document.getElementById('navUsername').innerText = displayName;
                document.getElementById('navAvatar').src = currentUser.photoURL ||
                    `https://ui-avatars.com/api/?name=${displayName}&background=8b5cf6&color=fff`;
                pendingAvatarUrl = null;
                window.closeModals();
            } catch (error) {
                window.showToast('Update failed', error.message, 'error');
            }
        });

        // ── reset password with custom toast ──
        document.getElementById('resetPasswordBtn').addEventListener('click', async () => {
            if (!currentUser) return;
            try {
                await sendPasswordResetEmail(auth, currentUser.email);
                window.showToast(
                    'Reset email sent',
                    `A password reset link has been sent to ${currentUser.email}. Check your inbox.`,
                    'success',
                    6000
                );
            } catch (error) {
                window.showToast('Reset failed', error.message, 'error');
            }
        });
    
