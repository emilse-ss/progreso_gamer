import { useEffect, useState } from 'react';
import { listarVideojuegos } from '../api/videojuegosApi';
import { AlertMessage } from './ui/AlertMessage';
import type { Videojuego } from '../types';

interface SelectorVideojuegoProps {
  value: string;
  onChange: (videojuegoId: string) => void;
  onReadyChange: (ready: boolean) => void;
  videojuegoIdFijo?: string;
  disabled?: boolean;
}

export function SelectorVideojuego({
  value,
  onChange,
  onReadyChange,
  videojuegoIdFijo,
  disabled = false,
}: SelectorVideojuegoProps) {
  const [videojuegos, setVideojuegos] = useState<Videojuego[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    onReadyChange(false);

    void listarVideojuegos()
      .then((result) => {
        if (cancelled) return;

        setVideojuegos(result);
        if (videojuegoIdFijo) {
          const exists = result.some((videojuego) => videojuego._id === videojuegoIdFijo);
          if (!exists) {
            onChange('');
            setError('El videojuego indicado no está disponible.');
          } else {
            onReadyChange(true);
          }
        } else {
          onReadyChange(true);
        }
      })
      .catch((caughtError: unknown) => {
        if (!cancelled) {
          onChange('');
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : 'No se pudieron cargar los videojuegos.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      onReadyChange(false);
    };
  }, [onChange, onReadyChange, videojuegoIdFijo]);

  return (
    <div className="ui-form__field ui-form__selector">
      <label htmlFor="partida-videojuego">
        Videojuego <span aria-hidden="true">*</span>
      </label>
      {loading && (
        <div className="d-flex align-items-center gap-2" role="status">
          <span className="spinner-border spinner-border-sm" aria-hidden="true" />
          <span>Cargando videojuegos...</span>
        </div>
      )}
      {!loading && error && <AlertMessage variant="error">{error}</AlertMessage>}
      {!loading && !error && videojuegos.length === 0 && (
        <AlertMessage variant="empty">
          Primero debes registrar un videojuego.
        </AlertMessage>
      )}
      {!loading && !error && videojuegos.length > 0 && (
        <select
          className="form-select ui-form__control"
          disabled={disabled || Boolean(videojuegoIdFijo)}
          id="partida-videojuego"
          onChange={(event) => onChange(event.target.value)}
          required
          value={value}
        >
          <option value="">Selecciona un videojuego</option>
          {videojuegos.map((videojuego) => (
            <option key={videojuego._id} value={videojuego._id}>
              {videojuego.nombre}
            </option>
          ))}
        </select>
      )}
      {videojuegoIdFijo && !loading && !error && (
        <p className="ui-form__help">El videojuego se fijó desde su detalle.</p>
      )}
    </div>
  );
}
