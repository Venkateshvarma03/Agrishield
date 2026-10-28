import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MyCrops from "./pages/MyCrops";
import MarketPricesPage from "./pages/MarketPricesPage";
import WeatherPage from "./pages/WeatherPage";
import StorageBookingPage from "./pages/StorageBookingPage";
import Marketplace from "./pages/Marketplace";
import LogisticsPage from "./pages/LogisticsPage";
import FinanceLoansPage from "./pages/FinanceLoansPage";
import GovtSchemesPage from "./pages/GovtSchemesPage";
import InsurancePage from "./pages/InsurancePage";
import FPOGroupsPage from "./pages/FPOGroupsPage";
import ReportsAnalytics from "./pages/ReportsAnalytics";
import SettingsPage from "./pages/SettingsPage";

function AppLayout() {
  const location = useLocation();
  const hideLayout = location.pathname === "/login" || location.pathname === "/signup";

  if (hideLayout) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/my-crops" element={<ProtectedRoute><MyCrops /></ProtectedRoute>} />
            <Route path="/market-prices" element={<ProtectedRoute><MarketPricesPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/storage" element={<ProtectedRoute><StorageBookingPage /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
            <Route path="/logistics" element={<ProtectedRoute><LogisticsPage /></ProtectedRoute>} />
            <Route path="/finance" element={<ProtectedRoute><FinanceLoansPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<ProtectedRoute><GovtSchemesPage /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
            <Route path="/fpo" element={<ProtectedRoute><FPOGroupsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsAnalytics /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;