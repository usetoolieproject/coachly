import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TenantProvider } from "./contexts/TenantContext";
import { RootRouteHandler } from "./components/RootRouteHandler";
import { LoginRouteHandler } from "./components/LoginRouteHandler";
import { ProtectedRoute, PublicRoute, OfflineIndicator } from "./components/shared";
import { OAuthCallback } from "./components/auth/OAuthCallback";

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
  </div>
);

// Lazy load all route components for better performance
const AdminDashboard = lazy(() => import("./features/admin").then(m => ({ default: m.AdminDashboard })));
const AdminProfilePage = lazy(() => import("./features/admin").then(m => ({ default: m.AdminProfilePage })));
const CleanStudentLogin = lazy(() => import("./components/auth").then(m => ({ default: m.CleanStudentLogin })));
const CleanInstructorLogin = lazy(() => import("./components/auth").then(m => ({ default: m.CleanInstructorLogin })));
const CleanStudentSignup = lazy(() => import("./components/auth").then(m => ({ default: m.CleanStudentSignup })));
const CleanAdminLogin = lazy(() => import("./components/auth").then(m => ({ default: m.CleanAdminLogin })));
const SignupComplete = lazy(() => import("./components/auth/instructor/SignupComplete"));
const ForgotPassword = lazy(() => import("./components/auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./components/auth/ResetPassword"));
const InstructorLayout = lazy(() => import("./components/layout").then(m => ({ default: m.InstructorLayout })));
const StudentLayout = lazy(() => import("./components/layout").then(m => ({ default: m.StudentLayout })));
const AdminLayout = lazy(() => import("./components/layout").then(m => ({ default: m.AdminLayout })));
const PremiumGuard = lazy(() => import("./features/instructor/notification").then(m => ({ default: m.PremiumGuard })));
const StudentPremiumGuard = lazy(() => import("./features/student/notification").then(m => ({ default: m.StudentPremiumGuard })));
const InstructorDashboard = lazy(() => import("./features/instructor/instructorDashboard").then(m => ({ default: m.InstructorDashboard })));
const ManageCourses = lazy(() => import("./features/instructor").then(m => ({ default: m.ManageCourses })));
const InstructorStudents = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorStudents })));
const InstructorWebsiteV2 = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorWebsiteV2 })));
const InstructorSettings = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorSettings })));
const InstructorCommunity = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorCommunity })));
const InstructorLiveCalls = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorLiveCalls })));
const InstructorSocialCalendar = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorSocialCalendar })));
const InstructorStudentDetails = lazy(() => import("./features/instructor").then(m => ({ default: m.InstructorStudentDetails })));
const Library = lazy(() => import("./features/instructor/library").then(m => ({ default: m.Library })));
const CleanMeetingsDashboard = lazy(() => import("./features/instructor/meetings/CleanMeetingsDashboard"));
const MeetingRoom = lazy(() => import("./components/meetings/MeetingRoom"));
const CleanStudentDashboard = lazy(() => import("./features/student").then(m => ({ default: m.CleanStudentDashboard })));
const StudentCommunity = lazy(() => import("./features/student").then(m => ({ default: m.StudentCommunity })));
const StudentLiveCalls = lazy(() => import("./features/student").then(m => ({ default: m.StudentLiveCalls })));
const StudentProgress = lazy(() => import("./features/student").then(m => ({ default: m.StudentProgress })));
const StudentMeetings = lazy(() => import("./features/student").then(m => ({ default: m.StudentMeetings })));
const StudentSettingsPage = lazy(() => import("./features/student/settings/index.tsx"));
const Contact = lazy(() => import("./features/landing-page/pages/Contact"));
const Privacy = lazy(() => import("./features/landing-page/pages/Privacy"));
const Terms = lazy(() => import("./features/landing-page/pages/Terms"));
const ScreenRecorderDemo = lazy(() => import('./features/screen-recorder/ScreenRecorderDemo'));

function App() {
  // Host canonicalization is now handled by HostRedirectHandler component
  // This uses a one-time query pattern to prevent redirect loops

  return (
    <ThemeProvider>
      <TenantProvider>
      <AuthProvider>
        {/* Temporarily disabled to prevent refresh loops */}
        {/* <HostRedirectHandler /> */}
        <Router>
        <div className="min-h-screen">
          <OfflineIndicator />
          <Routes>
            {/* Root route with smart logic */}
            <Route path="/" element={<RootRouteHandler />} />
            {/** generic public subdirectory route is defined later to avoid intercepting /signup/* */}
            
            {/* OAuth callback route */}
            <Route path="/auth/callback" element={<OAuthCallback />} />
            
            {/* Smart login route - shows different forms based on domain */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginRouteHandler />
                </PublicRoute>
              }
            />
            
            {/* Signup route */}
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <CleanInstructorLogin />
                </PublicRoute>
              }
            />
            
            {/* Signup completion route */}
            <Route
              path="/signup/complete"
              element={
                <PublicRoute>
                  <SignupComplete />
                </PublicRoute>
              }
            />
            
            {/* Legacy auth routes - kept for backward compatibility */}
            <Route
              path="/login/instructor"
              element={
                <PublicRoute>
                  <CleanInstructorLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/login/student"
              element={
                <PublicRoute>
                  <CleanStudentLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/login/admin"
              element={
                <PublicRoute>
                  <CleanAdminLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/signup/instructor"
              element={
                <PublicRoute>
                  <CleanInstructorLogin />
                </PublicRoute>
              }
            />
            <Route
              path="/signup/student"
              element={
                <PublicRoute>
                  <CleanStudentSignup />
                </PublicRoute>
              }
            />
            
            {/* Password Reset Routes */}
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgotPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />
            
            {/* Coach (Instructor) Protected Routes */}
            <Route
              path="/coach"
              element={
                <ProtectedRoute allowedRoles={['instructor']}>
                  <InstructorLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PremiumGuard><InstructorDashboard /></PremiumGuard>} />
              <Route path="courses" element={<PremiumGuard><ManageCourses /></PremiumGuard>} />
              <Route path="record" element={<PremiumGuard><ScreenRecorderDemo /></PremiumGuard>} />
              <Route path="library" element={<PremiumGuard><Library /></PremiumGuard>} />
              <Route path="community" element={<PremiumGuard><InstructorCommunity /></PremiumGuard>} />
              <Route path="live-calls" element={<PremiumGuard><InstructorLiveCalls /></PremiumGuard>} />
              <Route path="meetings" element={<PremiumGuard><CleanMeetingsDashboard /></PremiumGuard>} />
              <Route path="students" element={<PremiumGuard><InstructorStudents /></PremiumGuard>} />
              <Route path="students/:studentId" element={<PremiumGuard><InstructorStudentDetails /></PremiumGuard>} />
              <Route path="social-calendar" element={<PremiumGuard><InstructorSocialCalendar /></PremiumGuard>} />
              <Route path="websitev2" element={<PremiumGuard><InstructorWebsiteV2 /></PremiumGuard>} />
              <Route path="settings" element={<PremiumGuard allowSettings={true}><InstructorSettings /></PremiumGuard>} />
            </Route>

            {/* Top-level aliases for subdomain-based coach URLs */}
            <Route path="/dashboard" element={<Navigate to="/coach/dashboard" replace />} />
            <Route path="/courses" element={<Navigate to="/coach/courses" replace />} />
            <Route path="/community" element={<Navigate to="/coach/community" replace />} />
            <Route path="/live-calls" element={<Navigate to="/coach/live-calls" replace />} />
            <Route path="/students" element={<Navigate to="/coach/students" replace />} />
            <Route path="/social-calendar" element={<Navigate to="/coach/social-calendar" replace />} />
            <Route path="/settings" element={<Navigate to="/coach/settings" replace />} />
            <Route path="/screen-recorder" element={<ScreenRecorderDemo />} />
            
            {/* Student Protected Routes - UPDATED ROUTING */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              {/* Default redirect to dashboard instead of courses */}
              <Route index element={<Navigate to="dashboard" replace />} />
              {/* Dashboard now shows StudentProgress (former progress page) */}
              <Route path="dashboard" element={<StudentPremiumGuard><StudentProgress /></StudentPremiumGuard>} />
              {/* My Courses now shows CleanStudentDashboard (former dashboard) */}
              <Route path="courses" element={<StudentPremiumGuard><CleanStudentDashboard /></StudentPremiumGuard>} />
              {/* Multi-community routes */}
              <Route path="community" element={<StudentPremiumGuard><StudentCommunity /></StudentPremiumGuard>} />
              <Route path="live-calls" element={<StudentPremiumGuard><StudentLiveCalls /></StudentPremiumGuard>} />
              <Route path="meetings" element={<StudentPremiumGuard><StudentMeetings /></StudentPremiumGuard>} />
              {/* Keep progress route for direct access (though not in sidebar) */}
              <Route path="progress" element={<StudentPremiumGuard><StudentProgress /></StudentPremiumGuard>} />
              <Route path="settings" element={<StudentPremiumGuard allowSettings={true}><StudentSettingsPage /></StudentPremiumGuard>} />
            </Route>
            
            {/* Admin Protected Routes */} 
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<AdminDashboard />} />
              <Route path="instructors" element={<AdminDashboard />} />
              <Route path="students" element={<AdminDashboard />} />
              <Route path="courses" element={<AdminDashboard />} />
              <Route path="payments" element={<AdminDashboard />} />
              <Route path="promo-codes" element={<AdminDashboard />} />
              <Route path="profile" element={<AdminProfilePage />} />
            </Route>
            
            {/* Public Legal/Info Pages */}
            <Route
              path="/contact"
              element={
                <PublicRoute>
                  <Contact />
                </PublicRoute>
              }
            />
            <Route
              path="/privacy"
              element={
                <PublicRoute>
                  <Privacy />
                </PublicRoute>
              }
            />
            <Route
              path="/terms"
              element={
                <PublicRoute>
                  <Terms />
                </PublicRoute>
              }
            />

            {/* Video Meeting Room - Protected Route */}
            <Route
              path="/meeting/:roomId"
              element={
                <ProtectedRoute allowedRoles={['instructor', 'student']}>
                  <MeetingRoom />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
      </TenantProvider>
    </ThemeProvider>
  );
}

export default App;