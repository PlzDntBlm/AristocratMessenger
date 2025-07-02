/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./views/**/*.ejs",
        "./public/js/**/*.js",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'background': 'var(--color-background-light)',
                'surface': 'var(--color-surface-light)',
                'text-primary': 'var(--color-text-primary-light)',
                'text-secondary': 'var(--color-text-secondary-light)',
                'border-color': 'var(--color-border-light)',
                'accent': 'var(--color-accent)',
                'accent-hover': 'var(--color-accent-hover)',
                'action': 'var(--color-action)',
                'action-hover': 'var(--color-action-hover)',
                'destructive': 'var(--color-destructive)',
                'destructive-hover': 'var(--color-destructive-hover)',
                // Define dark mode colors separately for use with `dark:` prefix
                'dark-background': 'var(--color-background-dark)',
                'dark-surface': 'var(--color-surface-dark)',
                'dark-text-primary': 'var(--color-text-primary-dark)',
                'dark-text-secondary': 'var(--color-text-secondary-dark)',
                'dark-border-color': 'var(--color-border-dark)',
            }
        },
    },
    plugins: [],
}