import { describe, expect, it } from "vitest";
import { calcularProgresoSemanal } from "./progreso";

const ecuador = (fechaHora: string) => new Date(`${fechaHora}-05:00`);
const partida = (fechaHora: string, duracionMinutos = 60) => ({
  fecha: ecuador(fechaHora),
  duracionMinutos
});

const meta = (horasSemanales: number, diasPorSemana: number, hitos: number[] = []) => ({
  horasSemanales,
  diasPorSemana,
  hitos: hitos.map((porcentajeObjetivo) => ({
    descripcion: `Llegar al ${porcentajeObjetivo} %`,
    porcentajeObjetivo
  }))
});

describe("calcularProgresoSemanal", () => {
  it("CA-07.1 sin meta activa: horas, días y rachas, sin porcentaje, meta ni hitos", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-10T20:00:00", 120)],
      meta: null,
      avanceActual: 30,
      ahora: ecuador("2026-11-11T09:00:00")
    });
    expect(progreso).toEqual({
      semana: { inicio: "2026-11-09", fin: "2026-11-15" },
      meta: null,
      horasSemana: 2,
      porcentajeHoras: null,
      diasJugadosSemana: 1,
      rachaActual: 1,
      mejorRacha: 1,
      hitos: [],
      metaCumplida: null
    });
  });

  it("CA-07.2 con meta y sin partidas: todo en 0 y ningún hito alcanzado", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [],
      meta: meta(5, 3, [25]),
      avanceActual: 0,
      ahora: ecuador("2026-11-16T10:00:00")
    });
    expect(progreso).toEqual({
      semana: { inicio: "2026-11-16", fin: "2026-11-22" },
      meta: { horasSemanales: 5, diasPorSemana: 3 },
      horasSemana: 0,
      porcentajeHoras: 0,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0,
      hitos: [
        {
          descripcion: "Llegar al 25 %",
          porcentajeObjetivo: 25,
          alcanzado: false
        }
      ],
      metaCumplida: false
    });
  });

  it("CA-07.3 sin meta y sin partidas: valores en 0 y nulos donde no hay meta", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [],
      meta: null,
      avanceActual: 0,
      ahora: ecuador("2026-11-16T10:00:00")
    });
    expect(progreso).toEqual({
      semana: { inicio: "2026-11-16", fin: "2026-11-22" },
      meta: null,
      horasSemana: 0,
      porcentajeHoras: null,
      diasJugadosSemana: 0,
      rachaActual: 0,
      mejorRacha: 0,
      hitos: [],
      metaCumplida: null
    });
  });

  it("CA-04.7 las partidas anteriores a la creación de la meta cuentan", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-09T20:00:00", 120)],
      meta: meta(5, 3),
      avanceActual: 0,
      ahora: ecuador("2026-11-12T11:00:00")
    });
    expect(progreso.horasSemana).toBe(2);
    expect(progreso.porcentajeHoras).toBe(40);
  });

  it("CA-04.8 una partida de un día futuro ya guardada no cuenta en la semana", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-11T20:00:00", 60), partida("2026-11-17T20:00:00", 120)],
      meta: meta(5, 3),
      avanceActual: 0,
      ahora: ecuador("2026-11-15T10:00:00")
    });
    expect(progreso.horasSemana).toBe(1);
    expect(progreso.diasJugadosSemana).toBe(1);
  });

  it("CA-04.9 una partida de hoy con hora posterior a ahora cuenta en la semana", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-14T20:00:00", 120), partida("2026-11-15T18:00:00", 60)],
      meta: meta(5, 3),
      avanceActual: 0,
      ahora: ecuador("2026-11-15T10:00:00")
    });
    expect(progreso.horasSemana).toBe(3);
    expect(progreso.diasJugadosSemana).toBe(2);
  });

  it("CA-11.5 las partidas antiguas de menos de 5 minutos siguen contando", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-10T20:00:00", 3)],
      meta: meta(5, 3),
      avanceActual: 0,
      ahora: ecuador("2026-11-11T09:00:00")
    });
    expect(progreso.horasSemana).toBe(0.1);
    expect(progreso.diasJugadosSemana).toBe(1);
    expect(progreso.rachaActual).toBe(1);
  });

  it("CA-13.4 meta cumplida por redondeo: 298 min en 4 días → 5.0 h", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [
        partida("2026-11-09T20:00:00", 75),
        partida("2026-11-10T20:00:00", 75),
        partida("2026-11-11T20:00:00", 74),
        partida("2026-11-12T20:00:00", 74)
      ],
      meta: meta(5, 4),
      avanceActual: 0,
      ahora: ecuador("2026-11-12T22:00:00")
    });
    expect(progreso.horasSemana).toBe(5);
    expect(progreso.porcentajeHoras).toBe(100);
    expect(progreso.metaCumplida).toBe(true);
  });

  it("CA-13.5 sin meta no hay indicación de cumplimiento", () => {
    const progreso = calcularProgresoSemanal({
      partidas: [partida("2026-11-10T20:00:00", 600)],
      meta: null,
      avanceActual: 0,
      ahora: ecuador("2026-11-11T09:00:00")
    });
    expect(progreso.metaCumplida).toBeNull();
  });

  it("dataset B de la spec, consultado el domingo 15 a las 10:00", () => {
    const partidas = [
      ...["06", "07", "08", "09", "12", "13", "14"].map((dia) =>
        partida(`2026-11-${dia}T20:00:00`, 60)
      ),
      partida("2026-11-14T23:30:00", 30)
    ];
    const progreso = calcularProgresoSemanal({
      partidas,
      meta: {
        horasSemanales: 5,
        diasPorSemana: 4,
        hitos: [
          { descripcion: "Terminar el juego", porcentajeObjetivo: 100 },
          { descripcion: "Llegar al 25 %", porcentajeObjetivo: 25 },
          { descripcion: "Llegar al 50 %", porcentajeObjetivo: 50 }
        ]
      },
      avanceActual: 55,
      ahora: ecuador("2026-11-15T10:00:00")
    });
    expect(progreso).toEqual({
      semana: { inicio: "2026-11-09", fin: "2026-11-15" },
      meta: { horasSemanales: 5, diasPorSemana: 4 },
      horasSemana: 4.5,
      porcentajeHoras: 90,
      diasJugadosSemana: 4,
      rachaActual: 3,
      mejorRacha: 4,
      hitos: [
        {
          descripcion: "Llegar al 25 %",
          porcentajeObjetivo: 25,
          alcanzado: true
        },
        {
          descripcion: "Llegar al 50 %",
          porcentajeObjetivo: 50,
          alcanzado: true
        },
        {
          descripcion: "Terminar el juego",
          porcentajeObjetivo: 100,
          alcanzado: false
        }
      ],
      metaCumplida: false
    });
  });
});
