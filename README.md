![Alt](https://repobeats.axiom.co/api/embed/3526f70d37e904c00e7b3aad1024b5e58cdd6132.svg "Repobeats analytics image")

<!-- aligned left -->

# AI Writing Asisstant

[![Run Tests](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml)
[![Code Quality](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml)
[![Security](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml)
[![Docker Hub](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml) 

<!-- aligned right -->
<h1>
  AI Writing Assistant
  <div align="right">
    <a href="https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml">
      <img src="https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml/badge.svg" alt="Tests" />
    </a>
    <br/>
    <a href="https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml">
      <img src="https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml/badge.svg" alt="Code Quality" />
    </a>
    <br/>
    <a href="https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml">
      <img src="https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml/badge.svg" alt="Security" />
    </a>
    <br/>
    <a href="https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml">
      <img src="https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml/badge.svg" alt="Docker Hub" />
    </a>
    <br/>
    <a href="https://vitest.dev/">
      <img src="https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg" alt="Vitest" />
    </a>
    <br/>
    <a href="https://www.cypress.io/">
      <img src="https://img.shields.io/badge/tested%20with-cypress-04C38E.svg" alt="Cypress" />
    </a>
  </div>
</h1>

<!-- aligned center -->
# AI Writing Assistant
<div align="center">

[![Run Tests](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml)
[![Code Quality](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml)
[![Security](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml)
[![Docker Hub](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-6E9F18.svg)](https://vitest.dev/)
[![cypress](https://img.shields.io/badge/tested%20with-cypress-04C38E.svg)](https://www.cypress.io/)
</div>

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
on Study Project I & II at HWR Berlin, spanning the summmer term 2025 through the winter term 2026.

## 📖 Abstract

The goal of this project is to develop a web-based application that supports users in the structured writing of academic texts. The application allows users to create, customize, and save chapter structures and provides AI-powered assistance during the writing process. All interactions with the AI are automatically documented to ensure transparency and traceability. The application combines modern web technologies with a user-friendly interface to enable efficient, structured, and methodologically sound work.

## 📱 Features Overview

### Version 1.0 - Core Functionality
Our initial release focused on essential writing assistance capabilities:

**📝 Chapter Structure** - Create, customize, and save hierarchical chapters and sections for organized academic writing.
**🤖 AI Writing Assistance** - Get intelligent, context-aware suggestions and help throughout your writing process.
**📋 AI Protocol with Filtering** - Automatic documentation of all AI interactions with advanced filtering for complete transparency and traceability.
**📄 Word Export** - Export your complete document as a Word file.
**✨ User-Friendly Interface** - Intuitive navigation and modern design for nice writing experience.

### Version 2.0 - Enhanced Functionalities
Building on our foundation, V2 introduces community system and other enhanced functionalities:

#### 👥 Community & Collaboration
  - Share and discover writing contributions with other users.
  - Advanced search functionality to find relevant content.
  - Upvote and favorite contributed documents.
  - Comment and discuss on community contributions.
  - Edit and improve your own contributions.
  - Filter and sort comments for better navigation.

#### Advanced Export Options
**📑 Multi-Format Export with Appendix:** Export to Word, PDF and LaTeX with automatic AI protocol appendix.
**🐳 Dockerized Conversion Pipeline:** LaTeX is used as a base format for Word and PDF conversion utilising containerized Pandoc.

#### Security & Quality
**🔒 Data Encryption:** MongoDB encryption with Client-Side Field Level Encryption (CSFLE).
**✍️ Spell Check:** Automatic correction of spelling mistakes during writing.
**📦 Version History:**Track and restore previous versions of your document with undo and redo functionality.

### ✅Testing
- **Frontend:** 
   - End-to-End tests with Cypress,
   - Integration tests with Vitest.
- **Backend:** 
   - Unit and Integration tests with Vitest.
- **Test Quality:**
   - Mutation testing with Strykers. 

#### User Experience
**⚙️ Settings Page:**Customize your writing environment and preferences.
**🎓 Interactive Tutorial:** Guided onboarding for new users.
**❓ FAQ Section:** Quick answers to common questions.
**🌞 Light Mode:** Modern frontend design with comfortable light theme.

## 💻 Local Development

To build and run the app locally, follow these steps:

```bash
# 1. Clone the repository:
gh repo clone laura194/ai_writing_assistant
   
# 2. Fetch dependencies:
npm install

# 3. Run the app:
npm start

```

## 🏗️ Project Structure

```bash
├── .github/workflows
│   ├── code-quality.yml
│   ├── docker-hub.yml
│   ├── security.yml
│   └── tests.yml
├── .idea
├── backend
│   ├── node_modules
│   └── src
│       ├── controllers
│       ├── models
│       ├── routes
│       ├──  services
│       └── utils
├── cypress
│   ├──  e2e
│   ├── fixtures
│   └── support
├── docker-files
│   ├── Complete Project
│   └── mongoDB
├── node_modules
├── public
│    ├── dictionaries
├── src
│   ├── App
│   ├── AppRoutes
│   ├── assets
│   ├── components
│   ├── constants
│   ├── hoc
│   ├── models
│   ├── pages
│   ├── providers
│   ├── types
│   └── utils
├── test
│   ├── utils
├── .gitignore
├── cypress.config.ts
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── README.md
├── stryker.conf.js
├── tailwind.config.cjs
├── tailwind.config.test.cjs
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── vitest.config.ts
```

## 🛠️ Dependencies Overview

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and HMR
- **Tailwind CSS** for styling
- **Clerk** for authentication

### Backend
- **NodeJS** - JS Runtime Engine
- **Express** - Web Framework
- **MongoDB** - Database

### Document Export
**(Dockerized) Pandoc:** 
   - Document conversion engine.
   - Uses LaTeX as the base format.
   - Converts to PDF and Word (DOCX) formats.

### Development
- **ESLint** for code quality and linting.
- **Prettier** for code formatting.

### DevOps
- **GitHub Actions** - CI/CD pipeline for automated testing.
- **Docker** - Containerization for MongoDB and Pandoc services.

## 🧪 Testing

This project uses:
- **Vitest** for unit and integration testing with coverage reporting,
- **Cypress** for End-to-end testing,
- **Stryker** for Mutation testing.

Run tests with:

```bash
# Run all tests with coverage
npx vitest run --coverage

# Run tests in watch mode
npx vitest

# Run mutation testing (optional)
npx stryker run
```

Tests are automatically run on all pull requests to the main branch via GitHub Actions.
