// Configuración de Jest: pruebas unitarias y de integración con React Testing Library y MSW.
module.exports = {
  // jsdom simula el navegador. La variante "fixed" conserva fetch, Request y Response de Node,
  // que MSW necesita para interceptar las peticiones REST y GraphQL en las pruebas.
  testEnvironment: "jest-fixed-jsdom",
  // Hace que MSW cargue su versión para Node y no la del navegador
  testEnvironmentOptions: { customExportConditions: [""] },
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.js"],
  // Babel transforma el código del proyecto y las dependencias que solo se publican como
  // módulos ES (.mjs), que Jest no puede cargar directamente
  transform: { "^.+\\.(js|jsx|mjs)$": "babel-jest" },
  transformIgnorePatterns: [`/node_modules/(?!(${["rettime", "until-async", "@open-draft/deferred-promise"].join("|")})/)`],
  testMatch: ["<rootDir>/src/test/**/*.test.{js,jsx}"],

  // Cobertura: se mide sobre todo el código de la aplicación
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/test/**", // las pruebas no se miden a sí mismas
    "!src/main.jsx", // arranque en el navegador (Service Worker real e import.meta de Vite)
    "!src/mocks/browser.js", // registra el Service Worker: solo existe en el navegador
  ],
  coverageReporters: ["text", "text-summary", "html"],
  // La pauta exige al menos 50 % en sentencias, funciones y líneas: si no se alcanza, npm test falla
  coverageThreshold: {
    global: { statements: 50, functions: 50, lines: 50 },
  },
};
