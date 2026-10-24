import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Boton } from './Boton';

interface ModalConfirmacionProps {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  onConfirmar: () => void;
  onCancelar: () => void;
  etiquetaConfirmar?: string;
  confirmando?: boolean;
}

export function ModalConfirmacion({
  abierto,
  titulo,
  children,
  onConfirmar,
  onCancelar,
  etiquetaConfirmar = 'Eliminar',
  confirmando = false,
}: ModalConfirmacionProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;

    const previousFocus = document.activeElement;
    const dialog = dialogRef.current;
    const focusableSelector =
      'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])';

    function focusFirst() {
      const firstFocusable = dialog?.querySelector<HTMLElement>(focusableSelector);
      (firstFocusable ?? dialog)?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        onCancelar();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    focusFirst();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div className="ui-modal-backdrop">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="ui-modal"
        ref={dialogRef}
        role="dialog"
        tabIndex={-1}
      >
        <header className="ui-modal__header">
          <h2 className="ui-modal__title" id={titleId}>
            {titulo}
          </h2>
        </header>
        <div className="ui-modal__body">
          {children}
          <div className="ui-modal__actions">
            <Boton
              disabled={confirmando}
              onClick={onCancelar}
              variante="secundario"
            >
              Cancelar
            </Boton>
            <Boton
              disabled={confirmando}
              onClick={onConfirmar}
              variante="peligro"
            >
              {confirmando ? 'Procesando...' : etiquetaConfirmar}
            </Boton>
          </div>
        </div>
      </div>
    </div>
  );
}
