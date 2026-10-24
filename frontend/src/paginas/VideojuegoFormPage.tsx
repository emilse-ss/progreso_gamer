import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  actualizarVideojuego,
  crearVideojuego,
  obtenerVideojuego,
} from '../api/videojuegosApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';
import type { Videojuego, VideojuegoInput } from '../types';
import { VideojuegoForm } from './VideojuegoForm';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export function VideojuegoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [valoresIniciales, setValoresIniciales] = useState<Videojuego | null>(
    null,
  );
  const [cargando, setCargando] = useState(Boolean(id));
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!id) {
      setValoresIniciales(null);
      setCargando(false);
      setErrorCarga(null);
      return;
    }

    let cancelled = false;
    setCargando(true);
    setErrorCarga(null);
    setValoresIniciales(null);

    void obtenerVideojuego(id)
      .then((videojuego) => {
        if (!cancelled) {
          setValoresIniciales(videojuego);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorCarga(
            errorMessage(error, 'No se pudo cargar el videojuego.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setCargando(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleSubmit(values: VideojuegoInput): Promise<void> {
    setGuardando(true);
    setErrorServidor(null);
    try {
      const videojuego = id
        ? await actualizarVideojuego(id, values)
        : await crearVideojuego(values);
      navigate(`/videojuegos/${encodeURIComponent(videojuego._id)}`);
    } catch (error: unknown) {
      setErrorServidor(
        errorMessage(error, 'No se pudo guardar el videojuego.'),
      );
    } finally {
      setGuardando(false);
    }
  }

  const title = id ? 'Editar videojuego' : 'Nuevo videojuego';

  return (
    <PageContainer title={title}>
      {cargando && (
        <div className="d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Cargando videojuego...</span>
        </div>
      )}
      {!cargando && errorCarga && (
        <>
          <AlertMessage variant="error">{errorCarga}</AlertMessage>
          <Link className="btn btn-outline-secondary" to="/videojuegos">
            Volver a videojuegos
          </Link>
        </>
      )}
      {!cargando && !errorCarga && (
        <VideojuegoForm
          errorServidor={errorServidor}
          guardando={guardando}
          onSubmit={handleSubmit}
          cancelTo={
            id
              ? `/videojuegos/${encodeURIComponent(id)}`
              : '/videojuegos'
          }
          valoresIniciales={
            valoresIniciales
              ? {
                  nombre: valoresIniciales.nombre,
                  plataforma: valoresIniciales.plataforma,
                  genero: valoresIniciales.genero,
                  estado: valoresIniciales.estado,
                }
              : undefined
          }
        />
      )}
    </PageContainer>
  );
}
