import React from "react";
import Aviso from "./ui/Aviso";
import Boton from "./ui/Boton";

// Se muestra si el simulador de backend (Service Worker de MSW) no se pudo activar al abrir la aplicación,
// por ejemplo por un navegador sin Service Workers, una ventana privada o un archivo mockServiceWorker.js
// que no se publicó. Así la página no queda en blanco y el usuario puede reintentar.
function PantallaFalloMock({ error, onReintentar }) {
  return (
    <main className="mx-auto max-w-xl p-4">
      <h1 className="mb-4 text-2xl font-bold">No pudimos iniciar la aplicación</h1>
      <Aviso>
        El simulador de datos no se pudo activar. Revisa que el navegador permita los Service Workers (no uses
        una ventana privada) y vuelve a intentarlo.
      </Aviso>
      {error?.message && <p className="mb-4 text-sm text-gray-600">Detalle técnico: {error.message}</p>}
      <Boton onClick={onReintentar}>Reintentar</Boton>
    </main>
  );
}

export default PantallaFalloMock;
