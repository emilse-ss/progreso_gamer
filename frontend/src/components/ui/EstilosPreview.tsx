import { useCallback, useState } from 'react';
import { BarraGrupo } from './BarraGrupo';
import { BarraProgreso } from './BarraProgreso';
import { Boton } from './Boton';
import { CardItem } from './CardItem';
import { EncabezadoPanel } from './EncabezadoPanel';
import { EtiquetaSeccion } from './EtiquetaSeccion';
import { Insignia } from './Insignia';
import { ModalConfirmacion } from './ModalConfirmacion';
import { Pestanas } from './Pestanas';
import { Skeleton } from './Skeleton';
import { AlertMessage } from './AlertMessage';
import {
  IconoAdvertencia,
  IconoCalendario,
  IconoChispa,
  IconoError,
  IconoEstrella,
  IconoExito,
  IconoFlecha,
  IconoInformacion,
  IconoLapiz,
  IconoLibro,
  IconoLupa,
  IconoMando,
  IconoMas,
  IconoPapelera,
  IconoRayo,
  IconoReloj,
  IconoTrofeo,
} from './iconos';

const tabs = [
  { valor: 'todos', etiqueta: 'Todos', contador: 8 },
  { valor: 'jugando', etiqueta: 'Jugando', contador: 3 },
  { valor: 'completado', etiqueta: 'Completados', contador: 2 },
];

export function EstilosPreview() {
  const [tab, setTab] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);

  const cancelarModal = useCallback(() => setModalAbierto(false), []);

  return (
    <main className="ui-preview">
      <EncabezadoPanel titulo="Muestra de componentes" />

      <section className="ui-preview__section">
        <EtiquetaSeccion>Botones</EtiquetaSeccion>
        <div className="ui-preview__row">
          <Boton variante="primario">Primario</Boton>
          <Boton variante="neutro">Neutro</Boton>
          <Boton variante="secundario">Secundario</Boton>
          <Boton variante="peligro">Peligro</Boton>
          <Boton disabled>Deshabilitado</Boton>
          <Boton tamaño="grande">Grande</Boton>
          <Boton tamaño="pequeno">Pequeño</Boton>
        </div>
      </section>

      <section className="ui-preview__section">
        <EtiquetaSeccion>Alertas</EtiquetaSeccion>
        <AlertMessage variant="success">Operación completada.</AlertMessage>
        <AlertMessage variant="info">Información de referencia.</AlertMessage>
        <AlertMessage variant="warning">Aviso para revisar.</AlertMessage>
        <AlertMessage variant="error">No se pudo completar la operación.</AlertMessage>
        <AlertMessage variant="empty">Todavía no hay elementos.</AlertMessage>
      </section>

      <section className="ui-preview__section">
        <EtiquetaSeccion>Tarjetas e insignias</EtiquetaSeccion>
        <CardItem
          accion={<Boton aria-label="Ver videojuego" variante="secundario"><IconoInformacion /></Boton>}
          detalles={<>PC <span>Acción</span> Jugando</>}
          icono={<IconoMando />}
          insignia={<Insignia texto="¡NUEVO!" />}
          progreso={72}
          titulo="Aventura de ejemplo"
        />
        <div className="ui-preview__row">
          <Insignia texto="¡NUEVO!" />
          <Insignia texto="100 %" />
          <Insignia texto="3" tipo="contador" />
        </div>
        <BarraProgreso etiqueta="Avance" valor={72} />
      </section>

      <section className="ui-preview__section">
        <EtiquetaSeccion>Pestañas y grupos</EtiquetaSeccion>
        <Pestanas
          etiqueta="Filtros de estado de ejemplo"
          onChange={setTab}
          opciones={tabs}
          valor={tab}
        />
        <BarraGrupo icono={<IconoTrofeo />}>Retos de la semana</BarraGrupo>
        <BarraGrupo icono={<IconoCalendario />} variante="carbon">
          Sesiones recientes
        </BarraGrupo>
      </section>

      <section className="ui-preview__section">
        <EtiquetaSeccion>Carga y modal</EtiquetaSeccion>
        <Skeleton cantidad={3} />
        <Skeleton variante="bloque" />
        <Boton onClick={() => setModalAbierto(true)}>Abrir confirmación</Boton>
        <ModalConfirmacion
          abierto={modalAbierto}
          onCancelar={cancelarModal}
          onConfirmar={cancelarModal}
          titulo="Confirmar acción"
        >
          Esta es una vista previa del diálogo y sus controles accesibles.
        </ModalConfirmacion>
      </section>

      <section className="ui-preview__section">
        <EtiquetaSeccion>Iconos</EtiquetaSeccion>
        <div className="ui-preview__row">
          <IconoMando titulo="Mando" />
          <IconoEstrella titulo="Estrella" />
          <IconoRayo titulo="Rayo" />
          <IconoChispa titulo="Chispa" />
          <IconoTrofeo titulo="Trofeo" />
          <IconoReloj titulo="Reloj" />
          <IconoCalendario titulo="Calendario" />
          <IconoInformacion titulo="Información" />
          <IconoAdvertencia titulo="Advertencia" />
          <IconoExito titulo="Éxito" />
          <IconoError titulo="Error" />
          <IconoLupa titulo="Buscar" />
          <IconoPapelera titulo="Eliminar" />
          <IconoLapiz titulo="Editar" />
          <IconoLibro titulo="Libro" />
          <IconoMas titulo="Agregar" />
          <IconoFlecha titulo="Continuar" />
        </div>
      </section>
    </main>
  );
}
