import { useEffect, useState, type FormEvent } from 'react';
import { AlertMessage } from '../components/ui/AlertMessage';
import type { PartidaInput } from '../types';

interface PartidaFormProps {
  videojuegoId: string;
  selectorListo: boolean;
  resumenCargando: boolean;
  avanceActual: number | null;
  guardando: boolean;
  errorServidor: string | null;
  onSubmit: (input: Omit<PartidaInput, 'videojuego'>) => Promise<void>;
}

export function PartidaForm({
  videojuegoId,
  selectorListo,
  resumenCargando,
  avanceActual,
  guardando,
  errorServidor,
  onSubmit,
}: PartidaFormProps) {
  const [fecha, setFecha] = useState('');
  const [duracionMinutos, setDuracionMinutos] = useState('');
  const [porcentajeAvance, setPorcentajeAvance] = useState('');
  const [notas, setNotas] = useState('');
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  useEffect(() => {
    setPorcentajeAvance(avanceActual === null ? '' : String(avanceActual));
  }, [videojuegoId, avanceActual]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorValidacion(null);

    if (!videojuegoId) {
      setErrorValidacion('Selecciona un videojuego.');
      return;
    }
    if (!fecha || Number.isNaN(Date.parse(fecha))) {
      setErrorValidacion('Ingresa una fecha válida para la partida.');
      return;
    }

    const duration = Number(duracionMinutos);
    if (!duracionMinutos || !Number.isFinite(duration) || duration <= 0) {
      setErrorValidacion('La duración debe ser un número mayor que cero.');
      return;
    }

    if (avanceActual === null || resumenCargando) {
      return;
    }

    if (porcentajeAvance.trim() === '') {
      setErrorValidacion('Indica el avance total al terminar esta sesión.');
      return;
    }

    const progress = Number(porcentajeAvance);
    if (
      !Number.isFinite(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      setErrorValidacion('El avance total debe ser un número entre 0 y 100.');
      return;
    }

    await onSubmit({
      fecha: new Date(fecha).toISOString(),
      duracionMinutos: duration,
      porcentajeAvance: progress,
      ...(notas.trim() ? { notas: notas.trim() } : {}),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {errorValidacion && (
        <AlertMessage variant="error">{errorValidacion}</AlertMessage>
      )}
      {errorServidor && (
        <AlertMessage variant="error">{errorServidor}</AlertMessage>
      )}
      {avanceActual !== null && (
        <p className="mb-3" aria-live="polite">
          Avance actual: {avanceActual} %
        </p>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="partida-fecha">
          Fecha y hora <span aria-hidden="true">*</span>
        </label>
        <input
          className="form-control"
          id="partida-fecha"
          onChange={(event) => setFecha(event.target.value)}
          required
          type="datetime-local"
          value={fecha}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="partida-duracion">
          Duración en minutos <span aria-hidden="true">*</span>
        </label>
        <input
          className="form-control"
          id="partida-duracion"
          min="0"
          onChange={(event) => setDuracionMinutos(event.target.value)}
          required
          step="any"
          type="number"
          value={duracionMinutos}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="partida-avance">
          Avance total al terminar esta sesión (%) <span aria-hidden="true">*</span>
        </label>
        <input
          className="form-control"
          id="partida-avance"
          max="100"
          min="0"
          onChange={(event) => setPorcentajeAvance(event.target.value)}
          required
          aria-describedby="partida-avance-ayuda"
          step="any"
          type="number"
          value={porcentajeAvance}
        />
        <div className="form-text" id="partida-avance-ayuda">
          Indica el avance acumulado del juego, no lo que avanzaste hoy
        </div>
        {avanceActual !== null &&
          porcentajeAvance.trim() !== '' &&
          Number.isFinite(Number(porcentajeAvance)) &&
          Number(porcentajeAvance) < avanceActual && (
            <div className="mt-2">
              <AlertMessage variant="info">
                El avance indicado es menor al avance actual. Puedes guardar si
                este valor corresponde al avance total al terminar la sesión.
              </AlertMessage>
            </div>
          )}
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="partida-notas">
          Notas
        </label>
        <textarea
          className="form-control"
          id="partida-notas"
          onChange={(event) => setNotas(event.target.value)}
          rows={3}
          value={notas}
        />
      </div>

      <button
        className="btn btn-primary"
        disabled={
          guardando ||
          !selectorListo ||
          resumenCargando ||
          avanceActual === null
        }
        type="submit"
      >
        {guardando ? 'Guardando...' : 'Guardar partida'}
      </button>
    </form>
  );
}
