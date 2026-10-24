import { useState, type FormEvent } from 'react';
import { AlertMessage } from '../components/ui/AlertMessage';
import { ESTADOS, GENEROS, PLATAFORMAS } from '../enums';
import type {
  EstadoVideojuego,
  Genero,
  Plataforma,
} from '../enums';
import type { VideojuegoInput } from '../types';

interface VideojuegoFormValues {
  nombre: string;
  plataforma?: Plataforma;
  genero?: Genero;
  estado?: EstadoVideojuego;
}

interface VideojuegoFormProps {
  valoresIniciales?: VideojuegoFormValues;
  guardando: boolean;
  errorServidor: string | null;
  onSubmit: (values: VideojuegoInput) => Promise<void>;
}

function isOneOf<T extends readonly string[]>(
  value: string,
  options: T,
): value is T[number] {
  return options.some((option) => option === value);
}

export function VideojuegoForm({
  valoresIniciales,
  guardando,
  errorServidor,
  onSubmit,
}: VideojuegoFormProps) {
  const [nombre, setNombre] = useState(valoresIniciales?.nombre ?? '');
  const [plataforma, setPlataforma] = useState<Plataforma | ''>(
    valoresIniciales?.plataforma ?? '',
  );
  const [genero, setGenero] = useState<Genero | ''>(
    valoresIniciales?.genero ?? '',
  );
  const [estado, setEstado] = useState<EstadoVideojuego | ''>(
    valoresIniciales?.estado ?? '',
  );
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorValidacion(null);

    const nombreNormalizado = nombre.trim();
    if (!nombreNormalizado) {
      setErrorValidacion('El nombre del videojuego es obligatorio.');
      return;
    }
    if (plataforma && !isOneOf(plataforma, PLATAFORMAS)) {
      setErrorValidacion('Selecciona una plataforma válida.');
      return;
    }
    if (genero && !isOneOf(genero, GENEROS)) {
      setErrorValidacion('Selecciona un género válido.');
      return;
    }
    if (estado && !isOneOf(estado, ESTADOS)) {
      setErrorValidacion('Selecciona un estado válido.');
      return;
    }

    await onSubmit({
      nombre: nombreNormalizado,
      ...(plataforma ? { plataforma } : {}),
      ...(genero ? { genero } : {}),
      ...(estado ? { estado } : {}),
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

      <div className="mb-3">
        <label className="form-label" htmlFor="videojuego-nombre">
          Nombre <span aria-hidden="true">*</span>
        </label>
        <input
          autoComplete="off"
          className="form-control"
          id="videojuego-nombre"
          onChange={(event) => setNombre(event.target.value)}
          required
          type="text"
          value={nombre}
        />
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="videojuego-plataforma">
          Plataforma
        </label>
        <select
          className="form-select"
          id="videojuego-plataforma"
          onChange={(event) => {
            const value = event.target.value;
            if (value === '' || isOneOf(value, PLATAFORMAS)) {
              setPlataforma(value);
            }
          }}
          value={plataforma}
        >
          <option value="">Selecciona una plataforma (opcional)</option>
          {PLATAFORMAS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="videojuego-genero">
          Género
        </label>
        <select
          className="form-select"
          id="videojuego-genero"
          onChange={(event) => {
            const value = event.target.value;
            if (value === '' || isOneOf(value, GENEROS)) {
              setGenero(value);
            }
          }}
          value={genero}
        >
          <option value="">Selecciona un género (opcional)</option>
          {GENEROS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label" htmlFor="videojuego-estado">
          Estado
        </label>
        <select
          className="form-select"
          id="videojuego-estado"
          onChange={(event) => {
            const value = event.target.value;
            if (value === '' || isOneOf(value, ESTADOS)) {
              setEstado(value);
            }
          }}
          value={estado}
        >
          <option value="">Selecciona un estado (opcional)</option>
          {ESTADOS.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>

      <button className="btn btn-primary" disabled={guardando} type="submit">
        {guardando ? 'Guardando...' : 'Guardar videojuego'}
      </button>
    </form>
  );
}
