/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./views/**/*.ejs",
        "./public/js/**/*.js",
    ],
    darkMode: 'class',
    theme: {
        // We will define our custom fonts and other theme variables directly in our CSS file.
        // The extend block is no longer needed for this.
        extend: {},
    },
    plugins: [],
}