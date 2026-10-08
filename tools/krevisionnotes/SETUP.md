# Put the website online with Google sign-in

This takes about 15 minutes and is free on Firebase's Spark plan. You need a Google account and a computer with [Node.js](https://nodejs.org) installed (LTS version).

## 1. Create the Firebase project

1. Open <https://console.firebase.google.com> and click **Create a project** (or **Add project**).
2. Type a name, for example `ib-revision-hub`, and click **Continue**.
3. Google Analytics is not needed. Switch it **off**, then click **Create project** → **Continue**.

## 2. Turn on Google sign-in

1. In the left menu, click **Build → Authentication**, then **Get started**.
2. On the **Sign-in method** tab, click **Google**.
3. Switch **Enable** on, choose your email as the **Project support email**, and click **Save**.

## 3. Create the database

1. In the left menu, click **Build → Firestore Database**, then **Create database**.
2. Choose a location close to your students (for Hong Kong: `asia-east2 (Hong Kong)`), then click **Next**.
3. Choose **Start in production mode** and click **Create**.
4. Open the **Rules** tab. Delete everything there, paste in the whole contents of `firestore.rules` from this project, and click **Publish**.

These rules keep each student's progress private. Only friends can see someone's profile summary (level, XP, streak, badges, subject %).

## 4. Connect the website to the project

1. Click the **gear icon → Project settings**, scroll to **Your apps**, and click the **`</>`** (Web) icon.
2. Type a nickname, for example `website`. Tick **Also set up Firebase Hosting**, then click **Register app**.
3. Firebase shows a block of code containing `const firebaseConfig = { ... }`. Copy the part inside the braces.
4. Open `public/js/firebase-config.js` in this project and replace `window.IB_FIREBASE = null;` with your config:

   ```js
   window.IB_FIREBASE = {
     apiKey: "AIza…",
     authDomain: "ib-revision-hub.firebaseapp.com",
     projectId: "ib-revision-hub",
     storageBucket: "ib-revision-hub.appspot.com",
     messagingSenderId: "…",
     appId: "…",
   };
   ```

   These values are not secret. They only identify your project, and the security rules protect the data.
5. Open `.firebaserc` and replace `YOUR-FIREBASE-PROJECT-ID` with your project ID (shown in Project settings).
6. Click through the remaining steps in the browser (you can skip "Install Firebase CLI"; it is covered below).

## 5. Publish the site

Run these commands in a terminal in the project folder:

```bash
npm install -g firebase-tools     # once
firebase login                    # opens the browser - sign in with the same Google account
firebase deploy                   # uploads the site and the database rules
```

When it finishes, the terminal shows your website address: **`https://<your-project-id>.web.app`**. Share that link with your classmates.

To publish changes later, edit the files and run `firebase deploy` again.

## 6. (Optional) Use your own domain

In Firebase, go to **Hosting → Add custom domain** and follow the steps. Then go to **Authentication → Settings → Authorized domains** and add the domain, so Google sign-in works on it.

## Check it works

1. Open your `.web.app` address and click **Sign in** (top right). Pick your Google account.
2. Answer a few questions. The XP chip in the header should go up.
3. Open the site on another device or browser and sign in again. Your progress should be there.
4. Go to **Friends**, copy your invite link and send it to a friend. When they open it signed in, you'll see their request. Accept it and you'll both appear in the weekly league.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Google sign-in isn't set up on this copy" | `firebase-config.js` still says `null`. Do step 4, then deploy again. |
| Sign-in popup closes with an error about the domain | Add the domain under **Authentication → Settings → Authorized domains**. |
| "Missing or insufficient permissions" | The rules weren't published. Do step 3.4 again, or run `firebase deploy --only firestore:rules`. |
| Popup is blocked | Allow pop-ups for the site. The site also falls back to a full-page redirect. |

Free plan limits: about 50,000 reads and 20,000 writes per day. That is plenty for a class or a whole school year group; progress saves are batched every few seconds.
