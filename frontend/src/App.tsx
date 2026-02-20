import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MenuPage }        from './pages/MenuPage';
import { LoginPage }       from './pages/LoginPage';
import { RegisterPage }    from './pages/RegisterPage';
import { CheckoutPage }    from './pages/CheckoutPage';
import { PaymentPage }     from './pages/PaymentPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { ProtectedRoute }  from './components/ProtectedRoute';

const App: React.FC = () => (
  <Routes>
    <Route path="/"             element={<MenuPage />} />
    <Route path="/login"        element={<LoginPage />} />
    <Route path="/register"     element={<RegisterPage />} />
    <Route path="/checkout"     element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
    <Route path="/payment"      element={<ProtectedRoute><PaymentPage /></ProtectedRoute>} />
    <Route path="/confirmation" element={<ProtectedRoute><ConfirmationPage /></ProtectedRoute>} />
    <Route path="*"             element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;