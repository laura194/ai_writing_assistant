# AI Writing Assistant

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Abstract](#-abstract)
3. [Features Overview](#-features-overview)
4. [Local Development](#local-development)
5. [Project Structure](#-project-structure)
6. [Dependencies Overview](#-dependencies-overview)
7. [Testing](#-testing)

## 🌟 Introduction

Members: Laura, Lisa, Gero, and Aylin

This repository contains a student project created for the ongoing course
on Study Project I & II at HWR Berlin, spanning the summmer term 2025 through
the winter term 2026.

## 📖 Abstract

The goal of this project is to develop a web-based application that supports users in the structured writing of academic texts. The application allows users to create, customize, and save chapter structures and provides AI-powered assistance during the writing process. All interactions with the AI are automatically documented to ensure transparency and traceability. The application combines modern web technologies with a user-friendly interface to enable efficient, structured, and methodologically sound work.

## 📱 Features Overview

- **Chapter Structure:** Create, customize, and save chapters and sections,
- **AI Assistance:** AI-powered suggestions and help during writing,
- **Protocol with filter:** Automatic documentation of all AI interactions for transparency,
- **Word Export:** Export the entire document as a Word file,
- **User-Friendly Interface:** Intuitive operation and modern design.

## 💻 Local Development

To build and run the app locally, follow these steps:

1. Clone the repository:

   ```bash
   gh repo clone laura194/ai_writing_assistant
   ```

2. Download Docker (Desktop App) and set up MongoDB

3. Open the repository in your choice of IDE (e.g. VS Code or WebStorm)

4. Fetch dependencies:
   ```bash
    npm install
   ```
5. Run the app:
   ```bash
   npm start
   ```

## 🏗️ Project Structure

```bash
├── .github
├── .idea
├── backend
│   ├── node_modules
│   └── src
│       ├── controllers
│       ├── models
│       ├── routes
│       └── services
├── docker-files
│   └── mongoDB
├── node_modules
├── public
├── server
│    └── node_modules
├── src
│   ├── assets
│   │     └── images
│   │          └── full-document-page
│   │          └── landing-page
│   ├── components
│   │   └── ai
│   │   └── full-document-page
│   │   └── landing-page
│   ├── constants
│   ├── hoc
│   ├── models
│   ├── pages
│   ├── tests
│   ├── types
│   └── utils
│   ├── App.css
│   ├── App.tsx
│   ├── AppRoutes.tsx
│   ├── index.css
│   ├── main.tsx
│ .gitignore
│ eslint.config.js
│ index.html
│ package-lock.json
│ package.json
│ README.md
│ tsconfig.app.json
│ tsconfig.json
│ tsconfig.node.json
│ vite.config.ts
```

## 🛠️ Dependencies Overview

- **React** with **TypeScript**
- **NodeJS**
- **Vite** for fast development and HMR
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **docx** and **file-saver** for Word export
- **ESLint** for code quality

## 🧪 Testing

Due to time constraints during the project development phase, comprehensive tests have not been implemented in this web application. We used exploratory testing to ensure the usability.
