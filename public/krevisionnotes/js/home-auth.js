import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const slot = document.getElementById("acctSlot");
if (slot && window.IB_FIREBASE) {
  const app = initializeApp(window.IB_FIREBASE);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();

  function accountButton(label, title, handler, icon) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-btn acct-btn";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.innerHTML = icon;
    const text = document.createElement("span");
    text.className = "acct-label";
    text.textContent = label;
    button.appendChild(text);
    button.addEventListener("click", handler);
    return button;
  }

  async function startGoogleSignIn() {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (/popup|blocked/i.test(`${error.code || ""} ${error.message || ""}`)) {
        await signInWithRedirect(auth, provider);
        return;
      }
      console.error("kRevisionNotes Google sign-in failed:", error);
      slot.title = error.message || "Google sign-in failed";
    }
  }

  getRedirectResult(auth).catch((error) => {
    console.error("kRevisionNotes Google redirect sign-in failed:", error);
    slot.title = error.message || "Google sign-in failed";
  });

  onAuthStateChanged(auth, (user) => {
    slot.replaceChildren();
    if (!user) {
      slot.appendChild(accountButton(
        "Sign in",
        "Sign in with Google to sync your progress",
        startGoogleSignIn,
        '<i class="fa-brands fa-google" aria-hidden="true"></i>'
      ));
      return;
    }

    const identity = document.createElement("span");
    identity.className = "acct-identity";
    identity.textContent = user.displayName || user.email || "Signed in";
    identity.title = user.email || user.displayName || "Signed in";
    const avatar = user.photoURL ? document.createElement("img") : document.createElement("span");
    if (user.photoURL) {
      avatar.src = user.photoURL;
      avatar.alt = "";
      avatar.referrerPolicy = "no-referrer";
    } else {
      avatar.className = "av";
      avatar.textContent = (user.displayName || user.email || "S").trim().charAt(0).toUpperCase();
    }
    const profile = document.createElement("span");
    profile.className = "acct-profile";
    profile.append(avatar, identity);
    slot.appendChild(profile);
    slot.appendChild(accountButton(
      "Sign out",
      "Sign out of kTown",
      () => signOut(auth).catch((error) => { console.error(error); slot.title = error.message; }),
      '<i class="fa-solid fa-right-from-bracket" aria-hidden="true"></i>'
    ));
  });
}
