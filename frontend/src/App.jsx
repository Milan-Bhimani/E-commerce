import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './components/layout/MainLayout';
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
import ManageShopkeeperRequests from './pages/admin/ManageShopkeeperRequests';
import Profile from './pages/Profile';
import ShopkeeperDashboard from './pages/ShopkeeperDashboard';
import EditProduct from './pages/EditProduct';
import AdminRoute from './components/AdminRoute';
import ShopkeeperRoute from './components/auth/ShopkeeperRoute';
import OrderConfirmation from './pages/OrderConfirmation';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/products', element: <ProductList /> },
      { path: '/product/:id', element: <ProductDetail /> },
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/profile', element: <Profile /> },
      { path: '/admin', element: <AdminRoute><AdminDashboard /></AdminRoute> },
      { path: '/admin/products', element: <AdminRoute><AdminProducts /></AdminRoute> },
      { path: '/admin/products/add', element: <AdminRoute><AdminAddProduct /></AdminRoute> },
      { path: '/admin/products/edit/:id', element: <AdminRoute><AdminEditProduct /></AdminRoute> },
      { path: '/admin/users', element: <AdminRoute><ManageUsers /></AdminRoute> },
      { path: '/admin/orders', element: <AdminRoute><ManageOrders /></AdminRoute> },
      { path: '/admin/shopkeeper-requests', element: <AdminRoute><ManageShopkeeperRequests /></AdminRoute> },
      { path: '/shopkeeper/dashboard', element: <ShopkeeperRoute><ShopkeeperDashboard /></ShopkeeperRoute> },
      { path: '/products/:id/edit', element: <ShopkeeperRoute><EditProduct /></ShopkeeperRoute> },
      { path: '/order-confirmation/:orderId', element: <OrderConfirmation /> },
    ],
  },
];

const router = createBrowserRouter(routes, {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;