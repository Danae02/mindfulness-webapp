import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Open Sans"', 'Figtree', ...defaultTheme.fontFamily.sans], // Open Sans lijkt op de stijl van de site
                heading: ['"Poppins"', ...defaultTheme.fontFamily.sans], // Voor koppen
            },
            colors: {
                primary: '#6c4092', // Hoofdaccentkleur (gebaseerd op de paarse tint op de site)
                secondary: '#008245', // Groene kleur
                lightGray: '#F5F5F5', // Achtergrondkleur
                darkGray: '#333333', // Voor tekst en contrast
                offWhite: '#FEFEFE', // Witte tinten
            },
            spacing: {
                '18': '4.5rem', // Toevoeging voor aangepaste marges/padding
                '30': '7.5rem',
            },
            fontSize: {
                'xs': '0.75rem',
                'sm': '0.875rem',
                'base': '1rem',
                'lg': '1.125rem',
                'xl': '1.25rem',
                '2xl': '1.5rem',
                '3xl': '1.875rem',
                '4xl': '2.25rem',
                '5xl': '3rem', // Voor grotere koppen
            },
            boxShadow: {
                card: '0px 4px 6px rgba(0, 0, 0, 0.1)', // Zachte schaduw voor kaarten
            },
            borderRadius: {
                'lg': '12px',
                'xl': '24px', // Ronde randen voor buttons en kaarten
            },
        },
    },

    plugins: [forms],
};
