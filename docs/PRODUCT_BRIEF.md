# 📡 **Product Brief: QSO Log**

_A super simple, open-source, cross-platform logbook for ham radio operators._

---

## **🎯 Vision**

To provide **ham radio operators** with a **modern, intuitive, and open-source logbook** that works seamlessly across **all devices** (web, mobile, tablet) and eliminates the friction of outdated or complex logging tools.

**Core Philosophy**:

- **Simple by default**: No bloat, no unnecessary features.
- **Open-source first**: Community-driven, transparent, and extensible.
- **Cross-platform**: Works on **any device with a browser**.
- **Offline-first**: Fully functional without internet; syncs when online.

---

## **👥 Target Audience**

| User Type                          | Pain Points                                               | Why They’d Use This                  |
| ---------------------------------- | --------------------------------------------------------- | ------------------------------------ |
| **Beginners**                      | Overwhelmed by complex tools (e.g., Log4OM, HRD).         | Simple UI, no learning curve.        |
| **Casual Operators**               | Don’t need contesting/rig control; want **easy logging**. | Minimalist design, cloud sync.       |
| **Portable Operators (SOTA/POTA)** | Need **mobile/offline support** for field operations.     | PWA, offline-first, mobile-friendly. |
| **Mac/Linux Users**                | Lack **native logging tools** for their OS.               | Cross-platform (web-based).          |
| **Clubs/Groups**                   | Need **shared logs** for contests or awards.              | Optional club sharing (future).      |
| **Older Operators**                | Prefer **simple, reliable tools** over complex software.  | Intuitive, no setup required.        |

---

## **🚀 MVP Scope**

### **Core Features (Must-Have for Launch)**

| Feature                      | Description                                                                            | Priority | Notes                                             |
| ---------------------------- | -------------------------------------------------------------------------------------- | -------- | ------------------------------------------------- |
| **Log Entry**                | Add/edit/delete **QSOs** (callsign, frequency, mode, date, time, RST, notes).          | ⭐⭐⭐   | Support **ADIF standard fields**.                 |
| **Logbook View**             | **Table view** of all logs with **sorting/filtering** (by callsign, band, mode, date). | ⭐⭐⭐   | Paginated for performance.                        |
| **Search**                   | **Full-text search** across all log entries.                                           | ⭐⭐⭐   | Instant results.                                  |
| **ADIF Import/Export**       | **Import/export logs** in **ADIF format** (for compatibility with other tools).        | ⭐⭐⭐   | Use [adif-js](https://github.com/ok2cqr/adif-js). |
| **Cloud Sync**               | **Automatic sync** across devices via **Firebase**.                                    | ⭐⭐⭐   | Offline-first with **Firebase Firestore**.        |
| **Offline Support**          | **Fully functional offline**; syncs when online.                                       | ⭐⭐⭐   | PWA with **local storage fallback**.              |
| **Mobile-Friendly**          | **Responsive design** (works on phone/tablet/desktop).                                 | ⭐⭐⭐   | Touch-friendly UI.                                |
| **User Accounts (Optional)** | **Sign in with Google/GitHub** or **guest mode**.                                      | ⭐⭐     | Firebase Auth.                                    |
| **Basic Stats**              | **Total QSOs, countries worked, bands used**.                                          | ⭐⭐     | Simple dashboard.                                 |

### **Non-Goals (Explicitly Out of Scope for MVP)**

- **Contesting features** (e.g., real-time scoring, cabrillo export).
- **Rig control** (e.g., CAT interface for radios).
- **Awards tracking** (e.g., DXCC, WAS).
- **Advanced analytics** (e.g., heatmaps, band conditions).
- **Social features** (e.g., profiles, messaging).
- **QSL card management** (focus on logging only).

---

## **🛠️ Technical Stack**

| Component           | Technology                                                                | Justification                             |
| ------------------- | ------------------------------------------------------------------------- | ----------------------------------------- |
| **Frontend**        | React + TypeScript                                                        | Modern, type-safe, great for PWAs.        |
| **UI Framework**    | [Mantine UI](https://mantine.dev/) or [Chakra UI](https://chakra-ui.com/) | Accessible, open-source, mobile-friendly. |
| **Backend**         | Firebase (Firestore, Auth, Hosting)                                       | Free tier, real-time sync, easy setup.    |
| **Database**        | Firestore                                                                 | NoSQL, scales well, offline support.      |
| **Offline Storage** | Firebase Local Persistence + PWA                                          | Works offline, syncs when online.         |
| **ADIF Handling**   | [adif-js](https://github.com/ok2cqr/adif-js)                              | Lightweight, open-source ADIF parser.     |
| **PWA**             | Workbox + React                                                           | Offline-first, installable on devices.    |
| **Hosting**         | Firebase Hosting                                                          | Free, fast, global CDN.                   |
| **CI/CD**           | GitHub Actions                                                            | Automated testing/deployment.             |

---

## **📦 Open-Source Dependencies**

| Dependency                                                 | Purpose             | License    |
| ---------------------------------------------------------- | ------------------- | ---------- |
| [adif-js](https://github.com/ok2cqr/adif-js)               | ADIF parsing/export | MIT        |
| [Mantine UI](https://mantine.dev/)                         | UI components       | MIT        |
| [Firebase SDK](https://firebase.google.com/)               | Backend services    | Apache 2.0 |
| [Workbox](https://developers.google.com/web/tools/workbox) | PWA offline support | MIT        |
| [React Router](https://reactrouter.com/)                   | Client-side routing | MIT        |
| [Zustand](https://github.com/pmndrs/zustand)               | State management    | MIT        |

---

## **🎨 Design Principles**

1. **Minimalist UI**: Only show what’s **essential** for logging.
2. **Mobile-First**: Optimize for **small screens** (portable operations).
3. **Accessibility**: Follow **WCAG 2.1** (color contrast, keyboard nav).
4. **Performance**: Fast load times, **<100ms** for core actions.
5. **Offline-First**: Assume **no internet** in the field.

---

## **📅 Roadmap**

### **Phase 1: MVP (1–2 Months)**

- [ ] Core logging (add/edit/delete QSOs).
- [ ] Logbook table view with sorting/filtering.
- [ ] ADIF import/export.
- [ ] Firebase cloud sync + offline support.
- [ ] PWA setup (offline-first).
- [ ] Basic stats dashboard.
- [ ] Mobile-responsive UI.

### **Phase 2: Polish (1 Month)**

- [ ] User feedback integration.
- [ ] Guest mode (no sign-up required).
- [ ] Dark mode.
- [ ] Localization (i18n) for non-English users.
- [ ] Performance optimizations.

### **Phase 3: Extend (Optional)**

- [ ] Club sharing (collaborative logs).
- [ ] Advanced filtering (e.g., by time, band, mode).
- [ ] Maps integration (e.g., plot contacts on a map).
- [ ] Plugins/extensions (e.g., contesting, awards).

---

## **🔍 Competitive Analysis**

| Tool                 | Cross-Platform | Cloud Sync | Mobile-Friendly | Offline    | Open-Source | Simple UI  |
| -------------------- | -------------- | ---------- | --------------- | ---------- | ----------- | ---------- |
| **ACLog**            | ❌ Windows     | ❌ No      | ❌ No           | ✅ Yes     | ❌ No       | ❌ No      |
| **ProLog**           | ❌ Windows     | ❌ No      | ❌ No           | ✅ Yes     | ❌ No       | ❌ No      |
| **Log4OM**           | ❌ Windows     | ❌ No      | ❌ No           | ✅ Yes     | ❌ No       | ❌ No      |
| **CQRLOG**           | ❌ Linux       | ❌ No      | ❌ No           | ✅ Yes     | ✅ Yes      | ❌ No      |
| **HamLog (Android)** | ❌ Android     | ❌ No      | ✅ Yes          | ❌ No      | ❌ No       | ✅ Yes     |
| **QRZ Logbook**      | ✅ Web         | ✅ Yes     | ❌ No           | ❌ No      | ❌ No       | ❌ No      |
| **Spreadsheets**     | ✅ Yes         | ❌ No      | ❌ No           | ✅ Yes     | ✅ Yes      | ✅ Yes     |
| **[Your Tool]**      | ✅ **Yes**     | ✅ **Yes** | ✅ **Yes**      | ✅ **Yes** | ✅ **Yes**  | ✅ **Yes** |

---

## **💡 Name Brainstorm**

Here are some **name ideas** for your logbook. I’ve grouped them by theme:

### **📡 Radio-Themed Names**

- **QSO Log** (Simple and direct)
- **HamLog** (But [HamLog](https://play.google.com/store/apps/details?id=com.hamlog.app) already exists for Android)
- **Signal Log**
- **AirLog**
- **DX Log** (DX = long-distance contacts)
- **73 Log** (73 = ham radio slang for "best regards")
- **QTH Log** (QTH = location in ham radio)

### **⚡ Simple & Modern Names**

- **Logbook** (Generic but clear)
- **SimpleLog**
- **EasyLog**
- **CloudLog**
- **OpenLog**
- **MinimalLog**

### **🌍 Cross-Platform Names**

- **AnyLog** (Works on any device)
- **OmniLog**
- **Universal Log**
- **Everywhere Log**

### **🔥 Playful/Punny Names**

- **Log4All** (Play on Log4OM)
- **LogMeIn** (But this is a [existing brand](https://www.logmein.com/))
- **LogRite** (Log + "right")
- **LogLight** (Lightweight logging)
- **LogNGo** (Log and go)

### **🏆 Top Picks (Available + Memorable)**

1. **QSO Log** – Simple, clear, and ham-specific.
2. **Signal Log** – Modern and radio-themed.
3. **AnyLog** – Emphasizes cross-platform.
4. **OpenLog** – Highlights open-source.
5. **73 Log** – Ham radio culture + simple.

**Recommendation**: **QSO Log** or **Signal Log** (both are **clear, ham-specific, and available** as domain names and GitHub repos).

---

## **📜 License**

- **AGPL-3.0** (see [`LICENSE`](../LICENSE)). Copyleft, and the network clause covers hosted instances: anyone offering a modified version over a network must offer its source.
- Contributions are licensed under AGPL-3.0, see [`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## **🤝 Contribution Guidelines**

- **Open to PRs** for bug fixes, features, and translations.
- **Code of Conduct**: Follow [Contributor Covenant](https://www.contributor-covenant.org/).
- **Issues/PRs**: Use GitHub templates for consistency.

---

## **📢 Marketing & Outreach**

### **Launch Plan**

1. **GitHub Release**: Publish repo with **README, screenshots, demo link**.
2. **Reddit/Discord**: Share in **r/amateurradio, HamQTH, DARC forums**.
3. **Ham Radio Blogs**: Reach out to **Ham Radio Crash Course, KB9VBR, etc.**
4. **Local Clubs**: Partner with **small clubs** for case studies.

### **Messaging**

> _"Tired of outdated, platform-locked, or complex ham radio logbooks?_
> **[Name] is a **super simple, open-source, cross-platform logbook** that works on **any device**, syncs to the cloud, and is **100% free\*\*.
> Try the demo: [link] | GitHub: [link]"

---

## **📊 Success Metrics**

| Metric           | Goal                              |
| ---------------- | --------------------------------- |
| **GitHub Stars** | 100+ in first 3 months            |
| **Active Users** | 500+ monthly users                |
| **Feedback**     | 10+ feature requests/bug reports  |
| **Adoption**     | 5+ clubs using it for shared logs |
| **Retention**    | 70% of users return after 1 month |

---

## **🚀 Getting Started (For Developers)**

1. **Clone the repo**:
   ```bash
   git clone https://github.com/[your-username]/[repo-name].git
   cd [repo-name]
   ```
