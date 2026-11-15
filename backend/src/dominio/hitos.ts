// Dominio: orden, unicidad y estado «alcanzado» de los hitos (R-16, R-17).
// El estado «alcanzado» no se guarda: se calcula en cada consulta.

export interface HitoDominio {
  descripcion: string;
  porcentajeObjetivo: number;
}

export interface HitoEvaluado extends HitoDominio {
  alcanzado: boolean;
}

/** Copia de los hitos ordenada de menor a mayor objetivo (R-16). */
export function ordenarHitos<T extends HitoDominio>(hitos: T[]): T[] {
  return [...hitos].sort((a, b) => a.porcentajeObjetivo - b.porcentajeObjetivo);
}

/** Primer objetivo que aparece más de una vez, o null si no hay repetidos (R-16). */
export function objetivoRepetido(hitos: HitoDominio[]): number | null {
  const vistos = new Set<number>();
  for (const { porcentajeObjetivo } of hitos) {
    if (vistos.has(porcentajeObjetivo)) {
      return porcentajeObjetivo;
    }
    vistos.add(porcentajeObjetivo);
  }
  return null;
}

/** Hitos ordenados, cada uno alcanzado si el avance actual llega a su objetivo (R-17). */
export function evaluarHitos(
  hitos: HitoDominio[],
  avanceActual: number,
): HitoEvaluado[] {
  return ordenarHitos(hitos).map((hito) => ({
    descripcion: hito.descripcion,
    porcentajeObjetivo: hito.porcentajeObjetivo,
    alcanzado: avanceActual >= hito.porcentajeObjetivo,
  }));
}
