# CleaningSchedule

> This project centralizes multiple peoples' cleaning schedule <br/>
> [Live - Cleaning Schedule Website](https://cleaning-schedule.ryan-brock.com/)

Screenshots:
![preview](/screenshots/main.png)
![main mobile](/screenshots/main-mobile.png)
![add meeting](/screenshots/add-meeting.png)
![edit meeting](/screenshots/edit-meeting.png)

---

## 📚 Table of Contents

- [What's My Purpose?](#-whats-my-purpose)
- [How to Use](#-how-to-use)
- [Technologies](#-technologies)
- [Getting Started (Local Setup)](#-getting-started-local-setup)
  - [Run Locally](#run-locally)
  - [Test](#test)
  - [GitHub Hooks](#github-hooks)
  - [Build](#build)
  - [Deploy](#deploy)
- [How to Contribute](#-how-to-contribute)

---

## 🧠 What's My Purpose?

This is a server side single-page angular frontend created to centralize several peoples' cleaning schedule for quick and easy access. It communicates with [Home Page Api](https://github.com/rbrock44/home-page-api) for cleaning schedule data

---

## 🚦 How to Use

- `Add Meeting` - Select the `+` button, on the days header to add a meeting. The following fields are needed:
    - Date
    - Start time
    - End Time
    - Title
    - Person
- `Edit Meeting` - Selecting a meeting will open the edit meeting menu
    - `Delete` button permanently deletes the meeting

Screenshots:
![preview](/screenshots/main.png)
![main mobile](/screenshots/main-mobile.png)
![add meeting](/screenshots/add-meeting.png)
![edit meeting](/screenshots/edit-meeting.png)

---

## 🛠 Technologies

- Framework: `Angular 18`
- Testing: `Karma`
- Deployment: `GitHub Pages`

---

## 🚀 Getting Started (Local Setup)

* Install [node](https://nodejs.org/en) - v18 is needed (v20 also works)
* Clone [repo](https://github.com/rbrock44/cleaning-schedule)

---

### Run Locally

```
npm install
npm start
```

---

### Test

- Unit
    - `ng test` || `npm run test`
- Integration
    - `ng e2e` || `npm run e2e`

---

### Github Hooks

- Build
    - Trigger: On Push to Main
    - Action(s): Builds application then kicks off gh page action to deploy build output

---

### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

---

### Deploy

Run `npm run prod` to build and deploy the project. Make sure to be on `master` and that it is up to date before running the command. It's really meant to be a CI/CD action

---

## 🤝 How to Contribute

Found a typo or a small, obvious fix? Open a PR directly.
Want to change behavior or add something bigger? Open an issue first so we can talk it through before you put in the work.

---
