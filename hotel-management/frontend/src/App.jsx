import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import HotelListPage from './pages/HotelListPage.jsx';
import HotelFormPage from './pages/HotelFormPage.jsx';
import HotelDetailPage from './pages/HotelDetailPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container main">
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route path="/hotels" element={<HotelListPage />} />
          <Route path="/hotels/new" element={<HotelFormPage />} />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route path="/hotels/:id/edit" element={<HotelFormPage />} />

          <Route
            path="*"
            element={
              <div className="empty">
                <h2>Page not found</h2>
                <Link to="/" className="btn btn-primary">
                  Back to home
                </Link>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

