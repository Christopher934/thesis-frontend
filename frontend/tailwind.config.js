/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                lamaSky: "#C3ebfa",
                lamaSkyLight: "#edf9fd",
                lamaPurple: "#CFCEFF",
                lamaPurpleLight: "#F1F0FF",
                lamaYellow: "#FAE27C",
                lamaYellowLight: "#FEFCE8",
            }
        },
    },
    plugins: [],
};