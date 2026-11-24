// Babel solo se usa en las pruebas: Jest lo necesita para entender JSX e import/export.
// El sitio se sigue compilando con Vite.
module.exports = {
  presets: [
    ["@babel/preset-env", { targets: { node: "current" } }],
    ["@babel/preset-react", { runtime: "automatic" }],
  ],
};
