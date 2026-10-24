import { Link, NavLink, Outlet } from 'react-router-dom';

export function AppLayout() {
  return (
    <>
      <a className="visually-hidden-focusable p-2" href="#main-content">
        Saltar al contenido
      </a>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand" to="/videojuegos">
            Diario de Progreso Gamer
          </Link>
          <div className="navbar-nav">
            <NavLink className="nav-link" to="/videojuegos">
              Videojuegos
            </NavLink>
            <NavLink className="nav-link" to="/partidas">
              Partidas
            </NavLink>
          </div>
        </div>
      </nav>
      <main id="main-content">
        <Outlet />
      </main>
    </>
  );
}
