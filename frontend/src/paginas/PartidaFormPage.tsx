import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { crearPartida } from '../api/partidasApi';
import { obtenerResumenVideojuego } from '../api/videojuegosApi';
import { SelectorVideojuego } from '../components/SelectorVideojuego';
import { AlertMessage } from '../components/ui/AlertMessage';
import { PageContainer } from '../components/ui/PageContainer';
import type { PartidaInput, VideojuegoResumenResponse } from '../types';
import { PartidaForm } from './PartidaForm';

interface ResumenSeleccionado {
  videojuegoId: string;
  resumen: VideojuegoResumenResponse;
}

interface ErrorResumen {
  videojuegoId: string;
  message: string;
}

export function PartidaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videojuegoId, setVideojuegoId] = useState(id ?? '');
  const [selectorListo, setSelectorListo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [resumenSeleccionado, setResumenSeleccionado] =
    useState<ResumenSeleccionado | null>(null);
  const [errorResumen, setErrorResumen] = useState<ErrorResumen | null>(null);

  const videojuegoSeleccionado = id ?? videojuegoId;
  const resumenActual =
    resumenSeleccionado?.videojuegoId === videojuegoSeleccionado
      ? resumenSeleccionado.resumen
      : null;
  const errorResumenActual =
    errorResumen?.videojuegoId === videojuegoSeleccionado
      ? errorResumen.message
      : null;
  const resumenCargando =
    Boolean(videojuegoSeleccionado) && !resumenActual && !errorResumenActual;

  const handleVideojuegoChange = useCallback((nextId: string) => {
    setVideojuegoId(nextId);
  }, []);
  const handleSelectorReadyChange = useCallback((ready: boolean) => {
    setSelectorListo(ready);
  }, []);

  useEffect(() => {
    if (!videojuegoSeleccionado || !selectorListo) {
      return;
    }

    let cancelled = false;
    setResumenSeleccionado(null);
    setErrorResumen(null);

    void obtenerResumenVideojuego(videojuegoSeleccionado)
      .then((resumen) => {
        if (!cancelled) {
          setResumenSeleccionado({ videojuegoId: videojuegoSeleccionado, resumen });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setErrorResumen({
            videojuegoId: videojuegoSeleccionado,
            message:
              error instanceof Error
                ? error.message
                : 'No se pudo cargar el avance actual del videojuego.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectorListo, videojuegoSeleccionado]);

  async function handleSubmit(input: Omit<PartidaInput, 'videojuego'>) {
    if (!videojuegoSeleccionado) {
      setErrorServidor('Selecciona un videojuego.');
      return;
    }

    setGuardando(true);
    setErrorServidor(null);
    try {
      await crearPartida({ ...input, videojuego: videojuegoSeleccionado });
      navigate(`/videojuegos/${encodeURIComponent(videojuegoSeleccionado)}`);
    } catch (error: unknown) {
      setErrorServidor(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar la partida.',
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <PageContainer title="Nueva partida">
      <SelectorVideojuego
        disabled={guardando}
        onChange={handleVideojuegoChange}
        onReadyChange={handleSelectorReadyChange}
        value={id ?? videojuegoId}
        videojuegoIdFijo={id}
      />
      {(id ?? videojuegoId) && selectorListo && (
        <>
          {resumenCargando && (
            <div className="d-flex align-items-center gap-2 mb-3" role="status">
              <span className="spinner-border spinner-border-sm" aria-hidden="true" />
              <span>Cargando avance actual...</span>
            </div>
          )}
          {errorResumenActual && (
            <AlertMessage variant="error">{errorResumenActual}</AlertMessage>
          )}
          <PartidaForm
            avanceActual={resumenActual?.porcentajeAvanceActual ?? null}
            errorServidor={errorServidor}
            guardando={guardando}
            onSubmit={handleSubmit}
            resumenCargando={resumenCargando}
            selectorListo={selectorListo}
            videojuegoId={videojuegoSeleccionado}
          />
        </>
      )}
      {!(id ?? videojuegoId) && selectorListo && (
        <AlertMessage variant="empty">
          Selecciona un videojuego para registrar una partida.
        </AlertMessage>
      )}
    </PageContainer>
  );
}
