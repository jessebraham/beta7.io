module.exports = {
  content: ["templates/**/*.html"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        "gray-300": "#dbdcdc",
        "gray-400": "#8c8e8f",
        "gray-800": "#242526",
        "gray-900": "#17181a",
      },
    },
    screens: {
      "sm": "768px",
      "md": "960px",
    },
  },
}
