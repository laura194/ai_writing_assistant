/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}", // Überwache deine React-Komponenten
        "./public/index.html", // Falls in deinem "public"-Ordner Klassen definiert sind
    ],
    theme: {
        extend: {}, // Für Anpassungen (optional)
    },
    plugins: [],
};