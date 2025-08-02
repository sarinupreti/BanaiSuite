
import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation, useParams, useMatch } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import InventoryPage from './pages/InventoryPage';
import OrdersPage from './pages/OrdersPage';
import FinancialsPage from './pages/FinancialsPage';
import TeamPage from './pages/TeamPage';
import ConsumptionHistoryPage from './pages/ConsumptionHistoryPage';
import ClientInvoicesPage from './pages/ClientInvoicesPage';
import InvoicePage from './pages/InvoicePage';
import SettingsPage from './pages/SettingsPage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';
import ProjectSettingsPage from './pages/ProjectSettingsPage';
import MyTasksPage from './pages/MyTasksPage';
import { authService } from './services/auth';
import { User } from './types';
import { Icons } from './components/Icons';
import { SettingsProvider } from './contexts/SettingsContext';

// Auth Context
interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Auth Provider
const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
        try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
        } catch (e) {
            console.error(e);
        } finally {
            setIsAuthLoading(false);
        }
    };

    fetchUser();

    const { subscription } = authService.onAuthStateChange(setUser);

    return () => {
        subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthLoading } = useAuth();
  
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen"><Icons.Spinner className="h-12 w-12 animate-spin text-primary-500" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const NAV_ITEMS = [
    { href: '/', icon: Icons.Dashboard, label: 'Dashboard' },
    { href: '/tasks', icon: Icons.Tasks, label: 'My Tasks' },
    { href: '/notifications', icon: Icons.Notifications, label: 'Notifications' },
    { href: '/settings', icon: Icons.Settings, label: 'Settings' },
];

const Sidebar: React.FC = () => {
    const location = useLocation();
    return (
        <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-outline shrink-0">
             <div className="flex items-center gap-2 h-16 px-6 border-b border-outline">
                <Icons.Project className="h-8 w-8 text-primary-400" />
                <span className="text-xl font-bold text-on-surface">BanaiSuite</span>
            </div>
            <nav className="flex-grow p-4 space-y-2">
                {NAV_ITEMS.map(item => (
                    <Link key={item.href} to={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.href ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'}`}>
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>
        </aside>
    );
};

const BottomNav: React.FC = () => {
    const location = useLocation();
    const { id } = useParams(); // To construct project-specific paths

    const getProjectNavItems = (projectId: string) => [
        { href: `/project/${projectId}`, icon: Icons.Project, label: 'Overview' },
        { href: `/project/${projectId}/inventory`, icon: Icons.Inventory, label: 'Inventory' },
        { href: `/project/${projectId}/financials`, icon: Icons.Budget, label: 'Financials' },
        { href: `/project/${projectId}/team`, icon: Icons.Team, label: 'Team' },
    ];

    const navItems = id ? getProjectNavItems(id) : NAV_ITEMS.slice(0, 4);

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-outline z-50">
            <div className="flex justify-around items-center h-16">
                 {navItems.map(item => (
                    <Link key={item.href} to={item.href} className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${location.pathname === item.href ? 'text-primary-400' : 'text-on-surface-variant hover:text-on-surface'}`}>
                        <item.icon className="h-6 w-6" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
};

const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    
    return (
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-surface/80 backdrop-blur-sm border-b border-outline md:justify-end">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary-400 md:hidden">
                <Icons.Project />
                <span>BanaiSuite</span>
            </Link>
            {user && (
                <div className="flex items-center gap-4">
                   <span className="text-sm text-on-surface-variant hidden sm:inline">Welcome, {user.name}</span>
                    <button onClick={logout} className="p-2 rounded-full hover:bg-surface-variant">
                        <Icons.Logout className="h-5 w-5 text-red-400"/>
                    </button>
                </div>
            )}
        </header>
    );
};


// App Layout
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const invoiceMatch = useMatch('/project/:id/invoice/:invoiceId');

    const isBareLayout = location.pathname === '/login' || !!invoiceMatch;

    if (isBareLayout) {
        return <>{children}</>;
    }

    return (
         <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col">
                <Header onMenuClick={() => {}}/>
                <main className="flex-grow p-4 sm:p-6 lg:p-8 mb-16 md:mb-0">
                    {children}
                </main>
                <BottomNav />
            </div>
        </div>
    );
};


function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <HashRouter>
          <AppLayout>
              <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
                  <Route path="/project/:id" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
                  <Route path="/project/:id/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                  <Route path="/project/:id/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                  <Route path="/project/:id/consumption" element={<ProtectedRoute><ConsumptionHistoryPage /></ProtectedRoute>} />
                  <Route path="/project/:id/financials" element={<ProtectedRoute><FinancialsPage /></ProtectedRoute>} />
                  <Route path="/project/:id/invoices" element={<ProtectedRoute><ClientInvoicesPage /></ProtectedRoute>} />
                  <Route path="/project/:id/invoice/:invoiceId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
                  <Route path="/project/:id/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
                  <Route path="/project/:id/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
                  <Route path="/project/:id/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
                  <Route path="/project/:id/settings" element={<ProtectedRoute><ProjectSettingsPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" />} />
              </Routes>
          </AppLayout>
        </HashRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
