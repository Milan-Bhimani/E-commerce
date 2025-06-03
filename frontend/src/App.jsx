import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminAddProduct from './pages/admin/AddProduct';
import AdminEditProduct from './pages/admin/EditProduct';
import ManageUsers from './pages/admin/ManageUsers';
import ManageOrders from './pages/admin/ManageOrders';
import Profile from './pages/Profile';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import AdminRoute from './components/AdminRoute';
import ShopkeeperRoute from './components/auth/ShopkeeperRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/profile" element={<Profile />} />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <AdminRoute>
                      <AdminProducts />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/products/add" 
                  element={
                    <AdminRoute>
                      <AdminAddProduct />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/products/edit/:id" 
                  element={
                    <AdminRoute>
                      <AdminEditProduct />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <AdminRoute>
                      <ManageUsers />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <AdminRoute>
                      <ManageOrders />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/shopkeeper/dashboard" 
                  element={
                    <ShopkeeperRoute>
                      <ShopkeeperDashboard />
                    </ShopkeeperRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <Toaster position="top-center" />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;