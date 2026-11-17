import React, { lazy } from "react";
import { Routes, Route } from "react-router";
import Layout from "../layouts/Layout";

// Rutas del sitio. Cada página se descarga recién cuando se visita (React.lazy)
const Inicio = lazy(() => import("../pages/Inicio"));
const Destino = lazy(() => import("../pages/Destino"));
const NoEncontrado = lazy(() => import("../pages/NoEncontrado"));

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        {/* El parámetro define qué destino se pide por REST (ficha) y por GraphQL (vuelos y hoteles) */}
        <Route path="destinos/:id" element={<Destino />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
