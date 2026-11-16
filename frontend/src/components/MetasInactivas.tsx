import type { Meta } from '../types';
import { formatearFechaCorta } from '../utils/formatoFecha';
import { Boton } from './ui/Boton';
import { CardItem } from './ui/CardItem';
import { IconoCalendario } from './ui/iconos';
import { Insignia } from './ui/Insignia';

interface MetasInactivasProps {
  /** Solo las metas inactivas del videojuego. */
  metas: Meta[];
  /** false si hay una meta activa o el juego está completado o abandonado (R-13, R-19). */
  puedeReactivar: boolean;
  reactivandoId: string | null;
  alReactivar: (id: string) => void;
}

const hitosTexto = (n: number) => (n === 1 ? '1 hito' : `${n} hitos`);
const diasTexto = (n: number) => (n === 1 ? '1 día' : `${n} días`);

/** Historial de metas: se pueden reactivar, nunca borrar (R-15). */
export function MetasInactivas({
  metas,
  puedeReactivar,
  reactivandoId,
  alReactivar,
}: MetasInactivasProps) {
  if (metas.length === 0) return null;

  return (
    <div className="metas-inactivas">
      <h3 className="progress-week__subtitulo" id="metas-anteriores">
        Metas anteriores
      </h3>
      <ul aria-labelledby="metas-anteriores" className="metas-inactivas__lista">
        {metas.map((meta) => {
          const resumen = `${meta.horasSemanales} h · ${diasTexto(meta.diasPorSemana)} por semana`;
          return (
            <li key={meta._id}>
              <CardItem
                accion={
                  puedeReactivar ? (
                    <Boton
                      aria-label={`Reactivar la meta de ${resumen}`}
                      disabled={reactivandoId !== null}
                      onClick={() => alReactivar(meta._id)}
                      tamaño="pequeno"
                      variante="secundario"
                    >
                      {reactivandoId === meta._id
                        ? 'Reactivando…'
                        : 'Reactivar'}
                    </Boton>
                  ) : undefined
                }
                className="detail-item"
                detalles={
                  <>
                    <span>{hitosTexto(meta.hitos.length)}</span>
                    <span>
                      <IconoCalendario aria-hidden="true" />
                      desactivada el {formatearFechaCorta(meta.updatedAt)}
                    </span>
                  </>
                }
                icono={<IconoCalendario />}
                insignia={<Insignia texto="Inactiva" />}
                titulo={resumen}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
