# Shipping to the App Store

This is a real Expo/React Native app (TypeScript). It's already been verified to type-check (`npx tsc --noEmit`) and bundle (`npx expo export --platform ios`) cleanly in this environment. What's left needs your Apple Developer account and an Expo account — both tied to your identity, so I can't do these steps for you. Follow them in order.

## 0. One-time setup

1. **Pick your bundle identifier.** Open `app.json` and replace `com.yourcompany.procrastinationpatternmatcher` in both `ios.bundleIdentifier` and `android.package` with your own reverse-DNS id, e.g. `com.aliza.procrastinationpatternmatcher`. It must be globally unique — this is the permanent identity of the app on the App Store, so decide it now.
2. **Create a free Expo account** at [expo.dev](https://expo.dev) if you don't have one — this is separate from your Apple account and is what runs the cloud build.
3. Install the build CLI on your own machine (no Mac required for this step):
   ```
   npm install -g eas-cli
   ```

## 1. Log in and link the project

From the `mobile/` directory:

```
eas login
eas init
```

`eas init` links this folder to an Expo project and writes a `projectId` into `app.json` automatically — commit that change.

## 2. Build for iOS (cloud build, no Mac needed)

```
eas build --platform ios --profile production
```

The first run will interactively ask to log in with your **Apple ID** and will offer to generate the distribution certificate and provisioning profile for you automatically (recommended — let EAS manage credentials). It also registers the bundle identifier as an App ID on your Apple Developer account if it doesn't exist yet.

This runs on Expo's servers and takes roughly 10–20 minutes. When it finishes you'll have a signed `.ipa` build.

## 3. Create the App Store Connect listing

In [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**:
- Platform: iOS
- Name: *Procrastination Pattern Matcher* (or your own choice — must be unique across the whole App Store)
- Bundle ID: the one you set in step 0 (it should already appear in the dropdown if `eas build` registered it)
- SKU: any internal string, e.g. `ppm-ios-1`

Fill in the required listing fields:
- **Privacy Policy URL** — a ready-made one is live at **https://claude.ai/artifact/KaU7EAZKARRyT3LXvMZZQQ**. It's currently private to your Claude account; use the page's share menu to make it public (or copy its content to a page on your own domain/GitHub Pages) before submitting, since Apple's reviewers and the public listing both need to reach it. It's accurate for this app (everything is stored on-device only) — check the contact email at the bottom is the one you want listed publicly, and edit if not.
- **App Privacy** questionnaire: answer "Data Not Collected" across the board — the app makes no network calls and has no analytics.
- **Screenshots** — required for at least one device size (6.7" iPhone). Easiest path: run the build on the iOS Simulator (`eas build --profile development` + `eas build:run`, or open the TestFlight build on a real device) and capture screens of the Insights and Log tabs.
- **Support URL** — any page where you can be reached (can be as simple as a GitHub repo issues page).
- Category, age rating questionnaire, and pricing (Free).

## 4. Submit the build

```
eas submit --platform ios --latest
```

This uploads the `.ipa` from step 2 straight to App Store Connect. It'll ask for your Apple ID, an app-specific password (generate one at [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security), and your App Store Connect app's numeric ID (find it in App Store Connect → your app → App Information → General Information).

Once uploaded, the build appears under **TestFlight** first — Apple needs a few minutes to process it. From there you can:
- Add yourself as an internal tester and try it on a real device before going further, or
- Go to the **App Store** tab for this app, attach the processed build, fill in the remaining listing fields, and hit **Submit for Review**.

Apple's review typically takes 1–3 days. They may reject on metadata issues (missing privacy answers, unclear screenshots) — those are quick to fix and resubmit; they don't require a new build.

## Notes on what's already handled

- **Signing & provisioning**: fully automated by `eas build` if you let it manage credentials (recommended for a first app).
- **Permissions**: the app requests none (no camera, location, contacts, etc.), which simplifies review — there's nothing in `Info.plist` to justify.
- **Encryption declaration**: already set (`ITSAppUsesNonExemptEncryption: false` in `app.json`) so you won't get an export-compliance prompt on every submission.
- **App icon / splash**: generated and wired up already (`assets/icon.png`, `assets/splash-icon.png`).
