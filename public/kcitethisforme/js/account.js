import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const slot = document.getElementById("ktAccountSlot");
const config = {
  apiKey: "AIzaSyBHaYNoX65QOetCGcQxsztMozjW14WNGss",
  authDomain: "ktown-45.firebaseapp.com",
  projectId: "ktown-45",
  storageBucket: "ktown-45.firebasestorage.app",
  messagingSenderId: "369588080069",
  appId: "1:369588080069:web:5b03089c06d83bc167cfac",
  measurementId: "G-ML7ESX9P7Y"
};
const app = initializeApp(config);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();
let currentUser = null;
let accountSyncReady = false;
let saveChain = Promise.resolve();

function localHistory() {
  try {
    const value = JSON.parse(localStorage.getItem("cite_history") || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function mergeHistory(local, remote) {
  const byUrl = new Map();
  [...remote, ...local].forEach((item) => {
    if (item && item.url) byUrl.set(item.url, item);
  });
  return Array.from(byUrl.values()).slice(0, 5);
}

function historyRef(user) {
  return doc(db, "users", user.uid, "apps", "kcitethisforme");
}

function queueHistorySave(history) {
  if (!currentUser || !accountSyncReady) return;
  const user = currentUser;
  const snapshot = Array.isArray(history) ? history.slice(0, 5) : [];
  saveChain = saveChain
    .catch(() => {})
    .then(() => setDoc(historyRef(user), { history: snapshot, updatedAt: Date.now() }, { merge: true }))
    .catch((error) => console.error("Could not sync kCiteThisForMe history:", error));
}

function renderAccount(user) {
  if (!slot) return;
  slot.replaceChildren();
  if (!user) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "kt-account-btn";
    button.innerHTML = '<i class="fa-brands fa-google" aria-hidden="true"></i><span class="kt-account-label">Sign in</span>';
    button.title = "Sign in with Google to sync your citation history";
    button.addEventListener("click", async () => {
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        if (/popup|blocked/i.test(`${error.code || ""} ${error.message || ""}`)) {
          await signInWithRedirect(auth, provider);
          return;
        }
        console.error("kCiteThisForMe Google sign-in failed:", error);
        window.alert(`Google sign-in failed: ${error.message || "Please try again."}`);
      }
    });
    slot.appendChild(button);
    return;
  }

  const profile = document.createElement("span");
  profile.className = "kt-account-btn";
  profile.title = user.email || user.displayName || "Signed in";
  const avatar = user.photoURL ? document.createElement("img") : document.createElement("span");
  if (user.photoURL) {
    avatar.src = user.photoURL;
    avatar.alt = "";
    avatar.referrerPolicy = "no-referrer";
  } else {
    avatar.className = "kt-account-avatar";
    avatar.textContent = (user.displayName || user.email || "S").trim().charAt(0).toUpperCase();
  }
  const name = document.createElement("span");
  name.className = "kt-account-label";
  name.textContent = (user.displayName || user.email || "Account").split(" ")[0];
  profile.append(avatar, name);
  slot.appendChild(profile);

  const logout = document.createElement("button");
  logout.type = "button";
  logout.className = "kt-account-btn";
  logout.title = "Sign out of kTown";
  logout.setAttribute("aria-label", "Sign out of kTown");
  logout.innerHTML = '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>';
  logout.addEventListener("click", () => signOut(auth).catch((error) => window.alert(error.message)));
  slot.appendChild(logout);
}

window.addEventListener("ktown:cite-history-changed", (event) => {
  queueHistorySave(event.detail && event.detail.history ? event.detail.history : localHistory());
});

setPersistence(auth, browserLocalPersistence)
  .then(() => getRedirectResult(auth))
  .catch((error) => console.error("kCiteThisForMe auth initialization:", error));

onAuthStateChanged(auth, async (user) => {
  currentUser = user;
  accountSyncReady = false;
  renderAccount(user);
  if (!user) return;

  try {
    const ref = historyRef(user);
    const snap = await getDoc(ref);
    const remote = snap.exists() && Array.isArray(snap.data().history) ? snap.data().history : [];
    const merged = mergeHistory(localHistory(), remote);
    localStorage.setItem("cite_history", JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("ktown:cite-history-loaded", { detail: { history: merged } }));
    accountSyncReady = true;
    await setDoc(ref, { history: merged, updatedAt: Date.now() }, { merge: true });
  } catch (error) {
    accountSyncReady = true;
    console.error("Could not load kCiteThisForMe cloud history:", error);
  }
});
