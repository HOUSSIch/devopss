import { Suspense, lazy, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { ThemeProvider } from "../app/contexts/ThemeContext";
import { LanguageProvider, useLanguage } from "../app/contexts/LanguageContext";
import { AuthProvider, useAuth } from "../app/contexts/AuthContext";
import { CartProvider } from "../app/contexts/CartContext";
import { AnnouncementProvider } from "../app/contexts/AnnouncementContext";
import { AccessibilityProvider, useAccessibility } from "../app/contexts/AccessibilityContext";
import { useTTS } from "../app/utils/textToSpeech";
import { Toaster } from "sonner";
import { NavigationBar } from "../app/components/NavigationBar";
import { BottomNavigation } from "../app/components/BottomNavigation";
import { Footer } from "../app/components/Footer";
import { FloatingChatButton } from "../app/components/FloatingChatButton";
import { AccessibilityMenu } from "../app/components/AccessibilityMenu";
import { LoadingScreen } from "../app/components/LoadingScreen";
import { ScrollToTop } from "../app/components/ScrollToTop";
import { ImmersiveAtmosphere } from "../app/components/ImmersiveAtmosphere";
import AccessibilityDebugPanel from "../app/components/AccessibilityDebugPanel";
import FocusAnnouncer from "../app/components/FocusAnnouncer";
import { recordAppLoadTime } from "../app/utils/performanceMetrics";
import "@/styles/custom.css";

const AdminLoginPage = lazy(() => import("../app/pages/admin/AdminLoginPage"));
const AdminDashboardLayout = lazy(() => import("../app/pages/admin/AdminDashboardLayout"));
const DashboardOverview = lazy(() => import("../app/pages/admin/DashboardOverview"));
const UsersManagement = lazy(() => import("../app/pages/admin/UsersManagement"));
const SkinAnalysisResults = lazy(() => import("../app/pages/admin/SkinAnalysisResults"));
const ProductsManagement = lazy(() => import("../app/pages/admin/ProductsManagement"));
const ReportsAnalytics = lazy(() => import("../app/pages/admin/ReportsAnalytics"));
const AdminSettings = lazy(() => import("../app/pages/admin/AdminSettings"));
const AdminEducationPage = lazy(() => import("../app/pages/admin/AdminEducationPage"));
const LandingPage = lazy(() => import("../app/pages/LandingPage"));
const CreateAccountPage = lazy(() => import("../app/pages/CreateAccountPage"));
const QuestionnairePage = lazy(() => import("../app/pages/QuestionnairePage"));
const UploadPage = lazy(() => import("../app/pages/UploadPage"));
const ResultsPage = lazy(() => import("../app/pages/ResultsPage"));
const RoutinePage = lazy(() => import("../app/pages/RoutinePage"));
const ProductsPage = lazy(() => import("../app/pages/ProductsPage"));
const CheckoutPage = lazy(() => import("../app/pages/CheckoutPage"));
const ConfirmationPage = lazy(() => import("../app/pages/ConfirmationPage"));
const CartPage = lazy(() => import("../app/pages/CartPage"));
const DashboardPage = lazy(() => import("../app/pages/DashboardPage"));
const ProfilePage = lazy(() => import("../app/pages/ProfilePage"));
const ChatbotPage = lazy(() => import("../app/pages/ChatbotPage"));
const OrdersPage = lazy(() => import("../app/pages/OrdersPage"));
const SignInPage = lazy(() => import("../app/pages/SignInPage"));
const PremiumPage = lazy(() => import("../app/pages/PremiumPage"));
const ActivityPage = lazy(() => import("../app/pages/ActivityPage"));
const OrderDetailsPage = lazy(() => import("../app/pages/OrderDetailsPage"));
const TrackPackagePage = lazy(() => import("../app/pages/TrackPackagePage"));
const RemindersPage = lazy(() => import("../app/pages/RemindersPage"));
const ScannerPage = lazy(() => import("../app/pages/ScannerPage"));
const EducationPage = lazy(() => import("../app/pages/EducationPage"));
const RewardsPage = lazy(() => import("../app/pages/RewardsPage"));
const ProgressTrackerPage = lazy(() => import("../app/pages/ProgressTrackerPage"));

function ScreenReaderRouteAnnouncer() {
  const location = useLocation();
  const { t } = useLanguage();
  const { textToSpeechEnabled } = useAccessibility();
  const { speak } = useTTS();

  useEffect(() => {
    if (textToSpeechEnabled) {
      // speak a short page update announcement
      speak(t("accessibility.pageUpdated"));
    }
  }, [location.pathname, textToSpeechEnabled, speak, t]);

  return (
    <div 
      role="status" 
      aria-live="assertive" 
      aria-atomic="true" 
      className="sr-only"
      aria-label="Page navigation announcements"
    >
      {location.pathname && t("accessibility.pageUpdated")}
    </div>
  );
}

function RouteFocusManager() {
  const location = useLocation();

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const mainElement = document.getElementById("main-content");

      if (mainElement) {
        mainElement.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [location.pathname]);

  return null;
}


/** ✅ Admin only */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            {t("admin.initialisingAdminSession")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

/**
 * ✅ User only
 * NOTE : on NE redirige PAS les admins ici pour que /questionnaire
 * soit accessible juste après l'inscription (avant que les rôles soient assignés)
 */
function UserRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated, isAdmin } = useAuth();
  const { t } = useLanguage();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            {t("admin.initialisingUserSession")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signin" replace />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  return <>{children}</>;
}

/**
 * ✅ Route accessible à tout user authentifié (admin OU user)
 * Utilisée pour /questionnaire uniquement : un nouvel user peut ne pas
 * encore avoir de rôle, ou avoir temporairement le rôle "admin"
 */
function AuthenticatedRoute({ children }: { children: React.ReactNode }) {
  const { isInitialized, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#fbf3fe] dark:bg-[#1a0f2e] flex items-center justify-center">
        <div className="bg-white dark:bg-[#2d1b4e] rounded-3xl px-8 py-6 shadow-lg border border-purple-100 dark:border-purple-800/30">
          <p className="text-gray-700 dark:text-gray-200 font-semibold">
            {t("admin.initialisingSession")}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/signin" replace />;

  return <>{children}</>;
}

/** Layout wrapper for user pages */
function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavigationBar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 pt-20 pb-24 lg:pb-6 deepskyn-atmosphere premium-body deepskyn-future-main"
      >
        {children}
      </main>
      <Footer />
      <FloatingChatButton />
      <BottomNavigation />
      <AccessibilityMenu />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Public */}
      <Route
        path="/"
        element={
          <>
            <NavigationBar />
            <main
              id="main-content"
              tabIndex={-1}
              className="flex-1 pt-20 pb-24 lg:pb-6 deepskyn-atmosphere premium-body deepskyn-future-main"
            >
              <LandingPage />
            </main>
            <Footer />
            <FloatingChatButton />
            <BottomNavigation />
            <AccessibilityMenu />
          </>
        }
      />

      {/* ✅ Public logins */}
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* ✅ /signin */}
      <Route path="/signin" element={<SignInPage />} />

      {/* ✅ Admin protected */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardLayout />
          </AdminRoute>
        }
      >
        <Route path="dashboard" element={<DashboardOverview />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="analysis" element={<SkinAnalysisResults />} />
        <Route path="products" element={<ProductsManagement />} />
        <Route path="reports" element={<ReportsAnalytics />} />
        <Route path="education" element={<AdminEducationPage />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* ✅ Public (create account) */}
      <Route
        path="/create-account"
        element={
          <UserLayout>
            <CreateAccountPage />
          </UserLayout>
        }
      />

      {/* ✅ /questionnaire */}
      <Route
        path="/questionnaire"
        element={
          <AuthenticatedRoute>
            <UserLayout>
              <QuestionnairePage />
            </UserLayout>
          </AuthenticatedRoute>
        }
      />

      {/* ✅ User protected */}
      <Route path="/upload" element={<UserRoute><UserLayout><UploadPage /></UserLayout></UserRoute>} />
      <Route path="/results" element={<UserRoute><UserLayout><ResultsPage /></UserLayout></UserRoute>} />
      <Route path="/routine" element={<UserRoute><UserLayout><RoutinePage /></UserLayout></UserRoute>} />
      <Route path="/reminders" element={<UserRoute><UserLayout><RemindersPage /></UserLayout></UserRoute>} />
      <Route path="/scanner" element={<UserRoute><UserLayout><ScannerPage /></UserLayout></UserRoute>} />
      <Route path="/education" element={<UserRoute><UserLayout><EducationPage /></UserLayout></UserRoute>} />
      <Route path="/rewards" element={<UserRoute><UserLayout><RewardsPage /></UserLayout></UserRoute>} />
      <Route path="/progress" element={<UserRoute><UserLayout><ProgressTrackerPage /></UserLayout></UserRoute>} />
      <Route path="/products" element={<UserRoute><UserLayout><ProductsPage /></UserLayout></UserRoute>} />
      <Route path="/cart" element={<UserRoute><UserLayout><CartPage /></UserLayout></UserRoute>} />
      <Route path="/checkout" element={<UserRoute><UserLayout><CheckoutPage /></UserLayout></UserRoute>} />
      <Route path="/confirmation" element={<UserRoute><UserLayout><ConfirmationPage /></UserLayout></UserRoute>} />
      <Route path="/dashboard" element={<UserRoute><UserLayout><DashboardPage /></UserLayout></UserRoute>} />
      <Route path="/profile" element={<UserRoute><UserLayout><ProfilePage /></UserLayout></UserRoute>} />
      <Route path="/orders" element={<UserRoute><UserLayout><OrdersPage /></UserLayout></UserRoute>} />
      <Route path="/order-details" element={<UserRoute><UserLayout><OrderDetailsPage /></UserLayout></UserRoute>} />
      <Route path="/track-package" element={<UserRoute><UserLayout><TrackPackagePage /></UserLayout></UserRoute>} />
      <Route path="/activity" element={<UserRoute><UserLayout><ActivityPage /></UserLayout></UserRoute>} />
      <Route path="/chatbot" element={<UserRoute><UserLayout><ChatbotPage /></UserLayout></UserRoute>} />
      <Route path="/premium" element={<UserRoute><UserLayout><PremiumPage /></UserLayout></UserRoute>} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  useEffect(() => {
    recordAppLoadTime();
  }, []);

  return (
    <AccessibilityProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <AnnouncementProvider>
                <BrowserRouter>
                  <FocusAnnouncer />
                  <ScrollToTop />
                  <RouteFocusManager />
                  <ScreenReaderRouteAnnouncer />
                  <Toaster position="top-right" richColors />
                  <Suspense fallback={<LoadingScreen />}>
                    <div className="flex flex-col min-h-screen deepskyn-atmosphere premium-body deepskyn-future-app">
                      <ImmersiveAtmosphere />
                      {import.meta.env.DEV && <AccessibilityDebugPanel />}
                      <AppRoutes />
                    </div>
                  </Suspense>
                </BrowserRouter>
              </AnnouncementProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </AccessibilityProvider>
  );
}