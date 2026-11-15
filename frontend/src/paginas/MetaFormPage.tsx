import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ApiError } from '../api/ApiError';
import { actualizarMeta, crearMeta, obtenerMeta } from '../api/metasApi';
import { obtenerVideojuego } from '../api/videojuegosApi';
import { AlertMessage } from '../components/ui/AlertMessage';
import { Boton } from '../components/ui/Boton';
import { PageContainer } from '../components/ui/PageContainer';
import { Skeleton } from '../components/ui/Skeleton';
import type { Meta } from '../types';
import { MetaForm, type MetaFormValues } from './MetaForm';

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Crear meta: /videojuegos/:id/meta/nueva · Editar meta: /metas/:metaId/editar.
 * Solo se edita la meta activa (R-14); el videojuego de una meta no cambia.
 */
export function MetaFormPage() {
  const { id: videojuegoIdRuta, metaId } = useParams();
  const navigate = useNavigate();
  const editando = Boolean(metaId);

  const [meta, setMeta] = useState<Meta | null>(null);
  const [videojuegoId, setVideojuegoId] = useState<string | null>(
    videojuegoIdRuta ?? null,
  );
  const [nombreVideojuego, setNombreVideojuego] = useState('');
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [reintento, setReintento] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setCargando(true);
    setErrorCarga(null);
    setNoEncontrada(false);

    async function cargar() {
      if (metaId) {
        const metaCargada = await obtenerMeta(metaId);
        const videojuego = await obtenerVideojuego(metaCargada.videojuego);
        return { metaCargada, videojuego };
      }
      if (!videojuegoIdRuta) {
        throw new Error('No se indicó el identificador del videojuego.');
      }
      return {
        metaCargada: null,
        videojuego: await obtenerVideojuego(videojuegoIdRuta),
      };
    }

    void cargar()
      .then(({ metaCargada, videojuego }) => {
        if (!cancelled) {
          setMeta(metaCargada);
          setVideojuegoId(videojuego._id);
          setNombreVideojuego(videojuego.nombre);
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 404) {
          setNoEncontrada(true);
        } else {
          setErrorCarga(errorMessage(error, 'No se pudo cargar la meta.'));
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
  }, [metaId, videojuegoIdRuta, reintento]);

  const rutaDetalle = videojuegoId
    ? `/videojuegos/${encodeURIComponent(videojuegoId)}`
    : '/videojuegos';

  async function handleSubmit(values: MetaFormValues): Promise<void> {
    if (!videojuegoId) return;
    setGuardando(true);
    setErrorServidor(null);
    try {
      if (metaId) {
        await actualizarMeta(metaId, values);
      } else {
        await crearMeta({ videojuego: videojuegoId, ...values });
      }
      navigate(rutaDetalle);
    } catch (error: unknown) {
      setErrorServidor(errorMessage(error, 'No se pudo guardar la meta.'));
    } finally {
      setGuardando(false);
    }
  }

  const titulo = editando ? 'Editar meta' : 'Nueva meta';

  return (
    <PageContainer title={titulo}>
      {cargando && <Skeleton cantidad={3} variante="formulario" />}

      {!cargando && noEncontrada && (
        <AlertMessage variant="error">
          <p>
            {editando
              ? 'No encontramos esta meta.'
              : 'No encontramos este videojuego.'}
          </p>
          <div className="ui-alert__actions">
            <Link className="ui-button ui-button--neutral" to={rutaDetalle}>
              {videojuegoId ? 'Volver al videojuego' : 'Volver a videojuegos'}
            </Link>
          </div>
        </AlertMessage>
      )}

      {!cargando && errorCarga && (
        <AlertMessage variant="error">
          <p>{errorCarga}</p>
          <div className="ui-alert__actions">
            <Boton onClick={() => setReintento((count) => count + 1)}>
              Reintentar
            </Boton>
          </div>
        </AlertMessage>
      )}

      {!cargando && !noEncontrada && !errorCarga && meta && !meta.activa && (
        <AlertMessage variant="error">
          <p>Solo se puede editar la meta activa.</p>
          <div className="ui-alert__actions">
            <Link className="ui-button ui-button--neutral" to={rutaDetalle}>
              Volver al videojuego
            </Link>
          </div>
        </AlertMessage>
      )}

      {!cargando && !noEncontrada && !errorCarga && (!meta || meta.activa) && (
        <MetaForm
          cancelTo={rutaDetalle}
          errorServidor={errorServidor}
          guardando={guardando}
          nombreVideojuego={nombreVideojuego}
          onSubmit={handleSubmit}
          valoresIniciales={
            meta
              ? {
                  horasSemanales: meta.horasSemanales,
                  diasPorSemana: meta.diasPorSemana,
                  hitos: meta.hitos,
                }
              : undefined
          }
        />
      )}
    </PageContainer>
  );
}
