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
        "gray-600": "#707377",
        "gray-700": "#414244",
        "gray-800": "#242526",
        "gray-900": "#17181a",
      },
    },
    screens: {
      "sm": "640px",
      "md": "768px",
    },
  },
}
