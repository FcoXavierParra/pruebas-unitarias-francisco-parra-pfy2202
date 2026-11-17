import React, { Suspense } from "react";
import { Link, NavLink, Outlet } from "react-router";
import PanelPruebas from "../components/PanelPruebas";
import AvisoAlmacenamiento from "../components/AvisoAlmacenamiento";

// Estructura común: cabecera con menú, contenido de la ruta actual (<Outlet />) y panel de pruebas
function Layout() {
  const claseEnlace = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm ${isActive ? "bg-white/20 font-semibold" : "hover:bg-white/10"}`;

  return (
    <div className="min-h-screen bg-gray-100 pb-10 text-gray-800">
      <header className="bg-marca text-white shadow">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="leading-tight">
            <h1 className="text-xl font-bold sm:text-2xl">✈️ Viajes Rumbo Sur</h1>
            <p className="text-sm opacity-90">Elige un destino y revisa vuelos y hoteles</p>
          </Link>
          <nav aria-label="Navegación principal" className="flex gap-1">
            <NavLink to="/" end className={claseEnlace}>
              Destinos
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <AvisoAlmacenamiento />
        {/* Las páginas se cargan bajo demanda (React.lazy): mientras llegan se muestra este aviso */}
        <Suspense fallback={<p className="py-10 text-center text-gray-500">Cargando...</p>}>
          <Outlet />
        </Suspense>
      </main>

      <PanelPruebas />
    </div>
  );
}

export default Layout;
