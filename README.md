# AI Writing Assistant

## 📑 Table of Contents
1. [Introduction](#introduction)
2. [Abstract](#-abstract)
3. [Features Overview](#-features-overview)
4. [Prerequisites](#prerequisites)
5. [Local Development](#local-development)
6. [Project Structure](#-project-structure)
7. [Dependencies Overview](#-dependencies-overview)
8. [Testing](#-testing)
9. [Sample of Views](#-sample-of-views)

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


## 🛠️ Prerequisites 

To run this project locally, ensure the following are installed:

1.	IDE of your choice (e.g., Webstorm or Visual Studio Code)
2.  // TODO
3.	
4.  
5.  

## 💻 Local Development

This project uses ... as its framework. To build and run the app locally,
follow these steps:

1. Clone the repository:
    ```bash
    git clone ...
    cd ...
   ```

2. Fetch dependencies:
    ```bash
     npm i
     ```

## Development & Configuration

This project is based on a modern React + TypeScript + Vite setup. For development and production, we recommend an extended ESLint configuration with type-aware rules (see below).

```js
export default tseslint.config({
  extends: [
    ...tseslint.configs.recommendedTypeChecked,
    // Optionally: ...tseslint.configs.strictTypeChecked,
    // Optionally: ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```

3. Run the app:
     ```bash
     npm start
     ```

## 🏗️ Project Structure
//TODO

## 🛠️ Dependencies Overview
- **React** with **TypeScript**
- **Vite** for fast development and HMR
- **Tailwind CSS** for styling
- **Clerk** for authentication
- **docx** and **file-saver** for Word export
- **ESLint** for code quality


## 🧪 Testing

Due to time constraints during the project development phase, comprehensive tests have not been implemented in this web application. We used exploratory testing to ensure the usability.

## 📸 Sample of Views
//TODO