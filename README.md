![Alt](https://repobeats.axiom.co/api/embed/3526f70d37e904c00e7b3aad1024b5e58cdd6132.svg "Repobeats analytics image")
[![Run Tests](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/tests.yml)
[![Code Quality](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/code-quality.yml)
[![Security](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/security.yml)
[![Docker Hub](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml/badge.svg)](https://github.com/laura194/ai_writing_assistant/actions/workflows/docker-hub.yml)


# AI Writing Asisstant

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

2. Fetch dependencies:
   ```bash
    npm install
   ```
3. Run the app:
   ```bash
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
├── vitest.config.ts
```

## 🛠️ Dependencies Overview

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and HMR
- **Tailwind CSS** for styling
- **Clerk** for authentication

### Backend
- **NodeJS**
- **Express**
- **MongoDB**

### Document Export
- **Dockerized Pandoc** - Document conversion engine
   - Uses LaTeX as the base format
   - Converts to PDF and Word (DOCX) formats

### Development
- **ESLint** for code quality and linting
- **Prettier** for code formatting

### DevOps
- **GitHub Actions** - CI/CD pipeline for automated testing
- **Docker** - Containerization for MongoDB and Pandoc services

## 🧪 Testing

This project uses:
- **Vitest** for unit and integration testing with coverage reporting
- **Cypress** for End-to-end testing
- **Stryker** for Mutation testing

### Running Tests

Run tests locally:
```bash
# Run all tests with coverage
npx vitest run --coverage

# Run tests in watch mode
npx vitest

# Run mutation testing (optional)
npx stryker run
```

Tests are automatically run on all pull requests to the main branch via GitHub Actions.
