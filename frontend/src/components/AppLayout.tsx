import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AlertMessage } from './ui/AlertMessage';
import { IconoChispa } from './ui/iconos';

export function AppLayout() {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const navigationState: unknown = location.state;
  const mensajeExito =
    typeof navigationState === 'object' &&
    navigationState !== null &&
    'mensaje' in navigationState &&
    typeof navigationState.mensaje === 'string'
      ? navigationState.mensaje
      : null;

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  function cerrarMenu() {
    setMenuAbierto(false);
  }

  return (
    <div className="app-shell">
      <a className="visually-hidden-focusable p-2" href="#main-content">
        Saltar al contenido
      </a>
      <nav
        aria-label="Navegación principal"
        className="app-navbar"
        onKeyDown={(event) => {
          if (event.key === 'Escape') cerrarMenu();
        }}
      >
        <div className="app-navbar__inner">
          <Link
            className="app-navbar__brand"
            onClick={cerrarMenu}
            to="/videojuegos"
          >
            Diario de Progreso Gamer
          </Link>
          <button
            aria-controls="main-nav-links"
            aria-expanded={menuAbierto}
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            className="app-navbar__toggle"
            onClick={() => setMenuAbierto((abierto) => !abierto)}
            type="button"
          >
            <span aria-hidden="true" className="app-navbar__toggle-icon">
              <span />
              <span />
              <span />
            </span>
          </button>
          <div
            className={`app-navbar__links${menuAbierto ? ' is-open' : ''}`}
            id="main-nav-links"
          >
            <NavLink
              className={({ isActive }) =>
                `app-navbar__link${isActive && location.pathname !== '/videojuegos/nuevo' ? ' is-active' : ''}`
              }
              onClick={cerrarMenu}
              to="/videojuegos"
            >
              <span>Juegos</span>
              <small>Tu biblioteca</small>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `app-navbar__link${isActive ? ' is-active' : ''}`
              }
              onClick={cerrarMenu}
              to="/videojuegos/nuevo"
            >
              <span>Nuevo juego</span>
              <small>Añadir a la lista</small>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `app-navbar__link${isActive && location.pathname !== '/partidas/nueva' ? ' is-active' : ''}`
              }
              onClick={cerrarMenu}
              to="/partidas"
            >
              <span>Partidas</span>
              <small>Tus sesiones</small>
            </NavLink>
            <NavLink
              className={({ isActive }) =>
                `app-navbar__link${isActive ? ' is-active' : ''}`
              }
              onClick={cerrarMenu}
              to="/partidas/nueva"
            >
              <span>Registrar partida</span>
              <small>Nueva sesión</small>
            </NavLink>
          </div>
        </div>
      </nav>
      <div aria-hidden="true" className="app-decoration">
        <IconoChispa />
        <IconoChispa />
        <IconoChispa />
      </div>
      <main id="main-content">
        <div className="app-main">
          {mensajeExito && (
            <AlertMessage variant="success">{mensajeExito}</AlertMessage>
          )}
          <Outlet />
        </div>
      </main>
      <footer className="app-footer">
        <div className="app-footer__inner">
          <span>Diario de Progreso Gamer</span>
          <IconoChispa aria-hidden="true" />
        </div>
      </footer>
    </div>
  );
}
