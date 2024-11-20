/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/partials/__fullform.handlebars',  // Adjust according to your project structure
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
