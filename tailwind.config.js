module.exports = {
  purge: {
    content: ["./src/**/*.vue"],
    options: {
      keyframes: true,
    },
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "dark-theme": "#1f2d40",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
