import { Link, NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="logo">
          STAY<span>LUX</span>
        </Link>

        <nav className="nav-links">
          <NavLink to="/" end>
            Home
          </NavLink>

          <NavLink to="/hotels">
            View Hotels
          </NavLink>

          <NavLink to="/hotels/new" className="btn btn-light">
            + Add Hotel
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
