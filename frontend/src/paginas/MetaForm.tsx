import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertMessage } from '../components/ui/AlertMessage';
import { Boton } from '../components/ui/Boton';
import type { Hito } from '../types';

export const MAX_HITOS = 5;

export interface MetaFormValues {
  horasSemanales: number;
  diasPorSemana: number;
  hitos: Hito[];
}

interface MetaFormProps {
  nombreVideojuego: string;
  valoresIniciales?: MetaFormValues;
  guardando: boolean;
  errorServidor: string | null;
  onSubmit: (values: MetaFormValues) => Promise<void>;
  cancelTo: string;
}

interface FilaHito {
  clave: number;
  descripcion: string;
  objetivo: string;
}

// El formulario solo usa restricciones HTML; las reglas de negocio (objetivos repetidos,
// límites) las valida la API y aquí se muestra su mensaje (NO-DEBE-7).
export function MetaForm({
  nombreVideojuego,
  valoresIniciales,
  guardando,
  errorServidor,
  onSubmit,
  cancelTo,
}: MetaFormProps) {
  const [horas, setHoras] = useState(
    valoresIniciales ? String(valoresIniciales.horasSemanales) : '',
  );
  const [dias, setDias] = useState(
    valoresIniciales ? String(valoresIniciales.diasPorSemana) : '',
  );
  const [hitos, setHitos] = useState<FilaHito[]>(
    (valoresIniciales?.hitos ?? []).map((hito, indice) => ({
      clave: indice,
      descripcion: hito.descripcion,
      objetivo: String(hito.porcentajeObjetivo),
    })),
  );
  const [siguienteClave, setSiguienteClave] = useState(
    valoresIniciales?.hitos.length ?? 0,
  );
  const [enfocarClave, setEnfocarClave] = useState<number | null>(null);

  // Al agregar un hito, el foco pasa a su descripción (DEBE-10).
  useEffect(() => {
    if (enfocarClave !== null) {
      document.getElementById(`hito-descripcion-${enfocarClave}`)?.focus();
      setEnfocarClave(null);
    }
  }, [enfocarClave]);

  function agregarHito() {
    if (hitos.length >= MAX_HITOS) return;
    setHitos((actuales) => [
      ...actuales,
      { clave: siguienteClave, descripcion: '', objetivo: '' },
    ]);
    setEnfocarClave(siguienteClave);
    setSiguienteClave((clave) => clave + 1);
  }

  function actualizarHito(clave: number, cambios: Partial<FilaHito>) {
    setHitos((actuales) =>
      actuales.map((hito) =>
        hito.clave === clave ? { ...hito, ...cambios } : hito,
      ),
    );
  }

  function quitarHito(clave: number) {
    setHitos((actuales) => actuales.filter((hito) => hito.clave !== clave));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit({
      horasSemanales: Number(horas),
      diasPorSemana: Number(dias),
      hitos: hitos.map((hito) => ({
        descripcion: hito.descripcion,
        porcentajeObjetivo: Number(hito.objetivo),
      })),
    });
  }

  return (
    <form className="ui-form" onSubmit={handleSubmit}>
      <p className="ui-form__reference">Videojuego: {nombreVideojuego}</p>

      <div className="ui-form__grid ui-form__grid--partida">
        <div className="ui-form__field">
          <label className="form-label" htmlFor="meta-horas">
            Horas por semana <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby="meta-horas-ayuda"
            className="form-control"
            id="meta-horas"
            max={100}
            min={1}
            onChange={(event) => setHoras(event.target.value)}
            required
            step={1}
            type="number"
            value={horas}
          />
          <p className="ui-form__help" id="meta-horas-ayuda">
            Un número entero entre 1 y 100.
          </p>
        </div>
        <div className="ui-form__field">
          <label className="form-label" htmlFor="meta-dias">
            Días por semana <span aria-hidden="true">*</span>
          </label>
          <input
            aria-describedby="meta-dias-ayuda"
            className="form-control"
            id="meta-dias"
            max={7}
            min={1}
            onChange={(event) => setDias(event.target.value)}
            required
            step={1}
            type="number"
            value={dias}
          />
          <p className="ui-form__help" id="meta-dias-ayuda">
            Cuántos días quieres jugar, de 1 a 7.
          </p>
        </div>
      </div>

      <fieldset className="meta-form__hitos">
        <legend className="meta-form__leyenda">Hitos de avance</legend>
        {hitos.length === 0 && (
          <p className="ui-form__help">
            Sin hitos. Agrega hasta {MAX_HITOS}, por ejemplo «Llegar al 50 %».
          </p>
        )}
        {hitos.map((hito, indice) => {
          const numero = indice + 1;
          return (
            <div className="meta-form__hito" key={hito.clave}>
              <div className="ui-form__field">
                <label
                  className="form-label"
                  htmlFor={`hito-descripcion-${hito.clave}`}
                >
                  Descripción del hito {numero}
                </label>
                <input
                  className="form-control"
                  id={`hito-descripcion-${hito.clave}`}
                  maxLength={100}
                  onChange={(event) =>
                    actualizarHito(hito.clave, {
                      descripcion: event.target.value,
                    })
                  }
                  required
                  type="text"
                  value={hito.descripcion}
                />
              </div>
              <div className="ui-form__field">
                <label
                  className="form-label"
                  htmlFor={`hito-objetivo-${hito.clave}`}
                >
                  Objetivo del hito {numero} (%)
                </label>
                <input
                  className="form-control"
                  id={`hito-objetivo-${hito.clave}`}
                  max={100}
                  min={1}
                  onChange={(event) =>
                    actualizarHito(hito.clave, { objetivo: event.target.value })
                  }
                  required
                  step={1}
                  type="number"
                  value={hito.objetivo}
                />
              </div>
              <Boton
                aria-label={`Quitar hito ${numero}`}
                className="meta-form__quitar"
                onClick={() => quitarHito(hito.clave)}
                tamaño="pequeno"
                variante="neutro"
              >
                Quitar
              </Boton>
            </div>
          );
        })}
        <div>
          <Boton
            aria-describedby="meta-hitos-ayuda"
            disabled={hitos.length >= MAX_HITOS}
            onClick={agregarHito}
            variante="secundario"
          >
            Agregar hito
          </Boton>
          <p className="ui-form__help" id="meta-hitos-ayuda">
            Máximo {MAX_HITOS} hitos ({hitos.length} de {MAX_HITOS}).
          </p>
        </div>
      </fieldset>

      {errorServidor && (
        <AlertMessage variant="error">{errorServidor}</AlertMessage>
      )}

      <div className="ui-form__actions">
        <Link className="ui-button ui-button--neutral" to={cancelTo}>
          Cancelar
        </Link>
        <Boton disabled={guardando} type="submit">
          {guardando ? 'Guardando…' : 'Guardar meta'}
        </Boton>
      </div>
    </form>
  );
}
