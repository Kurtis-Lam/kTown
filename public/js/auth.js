import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { firebaseConfig } from "./firebase-config.js";

const auth = getAuth(initializeApp(firebaseConfig));
const googleProvider = new GoogleAuthProvider();
let mode = "login";

function setStatus(message, isError = false) {
  const status = document.getElementById("authStatus");
  status.textContent = message;
  status.classList.toggle("error", isError);
}

function authError(error) {
  const messages = {
    "auth/email-already-in-use": "An account already exists for this email. Try signing in.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "The Google sign-in window was closed.",
    "auth/weak-password": "Choose a password with at least 6 characters.",
    "auth/unauthorized-domain": "This website domain is not enabled for Firebase sign-in.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
    "auth/network-request-failed": "Couldn't connect. Check your internet connection and try again.",
  };
  return messages[error.code] || "Sign-in failed. Please try again.";
}

function renderMode() {
  const signup = mode === "signup";
  document.getElementById("authNameField").hidden = !signup;
  document.getElementById("authSubmit").textContent = signup ? "Create account" : "Sign in";
  document.getElementById("authTitle").textContent = signup ? "Create your kTown account" : "Welcome back";
  document.getElementById("authModeLogin").classList.toggle("active", !signup);
  document.getElementById("authModeSignup").classList.toggle("active", signup);
  document.getElementById("authReset").hidden = signup;
  setStatus("");
}

function setup() {
  const openButton = document.getElementById("authOpen");
  const overlay = document.createElement("div");
  overlay.className = "auth-overlay";
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <section class="auth-dialog" role="dialog" aria-modal="true" aria-labelledby="authTitle">
      <button class="auth-close" type="button" aria-label="Close sign-in dialog">&times;</button>
      <img class="auth-logo" src="imgs/logo.png" alt="">
      <h2 id="authTitle">Welcome back</h2>
      <div class="auth-modes" role="tablist" aria-label="Account options">
        <button id="authModeLogin" class="active" type="button" role="tab">Sign in</button>
        <button id="authModeSignup" type="button" role="tab">Create account</button>
      </div>
      <form id="authForm">
        <label class="auth-field" id="authNameField" hidden>Name
          <input id="authName" name="name" type="text" autocomplete="name" maxlength="40">
        </label>
        <label class="auth-field">Email
          <input id="authEmail" name="email" type="email" autocomplete="email" required>
        </label>
        <label class="auth-field">Password
          <input id="authPassword" name="password" type="password" autocomplete="current-password" minlength="6" required>
        </label>
        <button class="btn primary auth-submit" id="authSubmit" type="submit">Sign in</button>
      </form>
      <button class="btn auth-google" id="authGoogle" type="button">Continue with Google</button>
      <button class="auth-reset" id="authReset" type="button">Send password reset email</button>
      <p class="auth-status" id="authStatus" role="status" aria-live="polite"></p>
      <p class="auth-privacy">Your revision activity stays saved in this browser.</p>
    </section>`;
  document.body.appendChild(overlay);

  const close = () => {
    overlay.classList.remove("open");
    openButton.focus();
  };
  openButton.addEventListener("click", () => {
    overlay.classList.add("open");
    setStatus("");
    document.getElementById("authEmail").focus();
  });
  overlay.querySelector(".auth-close").addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("open")) close();
  });

  document.getElementById("authModeLogin").addEventListener("click", () => {
    mode = "login";
    renderMode();
  });
  document.getElementById("authModeSignup").addEventListener("click", () => {
    mode = "signup";
    renderMode();
  });
  document.getElementById("authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;
    const name = document.getElementById("authName").value.trim();
    const submit = document.getElementById("authSubmit");
    submit.disabled = true;
    try {
      if (mode === "signup") {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        if (name) await updateProfile(user, { displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      overlay.classList.remove("open");
      event.target.reset();
    } catch (error) {
      setStatus(authError(error), true);
    } finally {
      submit.disabled = false;
    }
  });
  document.getElementById("authGoogle").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      overlay.classList.remove("open");
    } catch (error) {
      setStatus(authError(error), true);
    }
  });
  document.getElementById("authReset").addEventListener("click", async () => {
    const email = document.getElementById("authEmail").value.trim();
    if (!email) {
      setStatus("Enter your email address first.", true);
      document.getElementById("authEmail").focus();
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus("Password reset email sent. Check your inbox.");
    } catch (error) {
      setStatus(authError(error), true);
    }
  });
  document.getElementById("authSignOut").addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      setStatus(authError(error), true);
    }
  });

  onAuthStateChanged(auth, (user) => {
    openButton.hidden = !!user;
    document.getElementById("authAccount").hidden = !user;
    document.getElementById("authDisplayName").textContent = user ? (user.displayName || user.email) : "";
  });
}

if (document.querySelector("#authOpen")) {
  setup();
} else {
  document.addEventListener("ktown:chrome-ready", setup, { once: true });
}
