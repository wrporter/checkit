// eslint-disable-next-line import/no-extraneous-dependencies
const plugin = require('tailwindcss/plugin');

module.exports = {
    content: ['./app/**/*.{ts,tsx,jsx,js}'],
    theme: {
        extend: {},
    },
    plugins: [
        plugin(function ({ addVariant }) {
            addVariant('data-selected', '&[data-selected]');
        }),
    ],
};
