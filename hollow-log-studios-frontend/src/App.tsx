import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';

import HomePage from '@/pages/HomePage';
import GalleryPage from '@/pages/GalleryPage';
import AboutPage from '@/pages/AboutPage';
import CommissionsPage from '@/pages/CommissionsPage';
import NotFound from '@/pages/NotFound';
import AdminRoutes from '@/pages/admin/AdminRoutes';

import ShoppingCart from '@/components/ShoppingCart';
import CheckoutSuccessPage from '@/pages/checkout/CheckoutSuccessPage';
import CheckoutCanceledPage from '@/pages/checkout/CheckoutCanceledPage';
import BookDetailPage from '@/pages/BookDetailPage';
import PebblewickPage from '@/pages/PebblewickPage';
import CryptidsPage from '@/pages/CryptidsPage';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/commissions" element={<CommissionsPage />} />
              <Route path="/pebblewick" element={<PebblewickPage />} />
              <Route path="/cryptids" element={<CryptidsPage />} />
              <Route path="/admin/*" element={<AdminRoutes />} />

              {/* Book detail page */}
              <Route path="/book/:id" element={<BookDetailPage />} />

              {/* Checkout routes */}
              <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
              <Route path="/checkout/canceled" element={<CheckoutCanceledPage />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <ShoppingCart />
            <Toaster />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
