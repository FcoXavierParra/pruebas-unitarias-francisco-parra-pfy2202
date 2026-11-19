import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PantallaFalloMock from "../components/PantallaFalloMock";

// Arranque: si el simulador de backend no se activa, la app muestra cómo recuperarse en vez de quedar en blanco
describe("arranque con fallo del simulador", () => {
  it("muestra un mensaje de recuperación y permite reintentar", async () => {
    const onReintentar = vi.fn();
    render(<PantallaFalloMock error={new Error("Service Worker no disponible")} onReintentar={onReintentar} />);

    expect(screen.getByRole("heading", { name: /No pudimos iniciar la aplicación/ })).toBeInTheDocument();
    expect(screen.getByText(/Service Worker no disponible/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(onReintentar).toHaveBeenCalledTimes(1);
  });
});
