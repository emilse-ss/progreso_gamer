import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DetalleVideojuegoPage } from './paginas/DetalleVideojuegoPage';
import { ListaPartidasPage } from './paginas/ListaPartidasPage';
import { ListaVideojuegosPage } from './paginas/ListaVideojuegosPage';
import { NotFoundPage } from './paginas/NotFoundPage';
import { PartidaFormPage } from './paginas/PartidaFormPage';
import { VideojuegoFormPage } from './paginas/VideojuegoFormPage';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/videojuegos" replace />} />
        <Route path="/videojuegos" element={<ListaVideojuegosPage />} />
        <Route path="/videojuegos/nuevo" element={<VideojuegoFormPage />} />
        <Route path="/videojuegos/:id" element={<DetalleVideojuegoPage />} />
        <Route path="/videojuegos/:id/editar" element={<VideojuegoFormPage />} />
        <Route path="/partidas" element={<ListaPartidasPage />} />
        <Route path="/partidas/nueva" element={<PartidaFormPage />} />
        <Route
          path="/videojuegos/:id/partidas/nueva"
          element={<PartidaFormPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
