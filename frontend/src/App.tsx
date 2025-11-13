import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { TenantProvider } from "./contexts/TenantContext";
// import { HostRedirectHandler } from "./components/HostRedirectHandler";
import { RootRouteHandler } from "./components/RootRouteHandler";
import { LoginRouteHandler } from "./components/LoginRouteHandler";
// Import shared components
import { ProtectedRoute, PublicRoute, OfflineIndicator } from "./components/shared";
// Import admin feature
import { AdminDashboard, AdminProfilePage } from "./features/admin";

// Import auth components
import { 
  CleanStudentLogin, 
  CleanInstructorLogin, 
  CleanStudentSignup,
  CleanAdminLogin
} from "./components/auth";
import SignupComplete from "./components/auth/instructor/SignupComplete";

// Import layout components
import { InstructorLayout, StudentLayout, AdminLayout } from "./components/layout";
import { PremiumGuard } from "./features/instructor/notification";
import { StudentPremiumGuard } from "./features/student/notification";

// Import instructor components
import { InstructorDashboard } from "./features/instructor/instructorDashboard";
import { 
  ManageCourses,
  InstructorStudents,
  InstructorWebsiteV2,
  InstructorSettings,
  InstructorCommunity,
  InstructorLiveCalls,
  InstructorSocialCalendar,
  InstructorStudentDetails
} from "./features/instructor";
import CleanMeetingsDashboard from "./features/instructor/meetings/CleanMeetingsDashboard";
import MeetingRoom from "./components/meetings/MeetingRoom";

// Import student components
import { 
  CleanStudentDashboard,
  StudentCommunity,
  StudentLiveCalls,
  StudentProgress,
  StudentMeetings
} from "./features/student";
import StudentSettingsPage from "./features/student/settings/index.tsx";
import Contact from "./features/landing-page/pages/Contact";
import Privacy from "./features/landing-page/pages/Privacy";
import Terms from "./features/landing-page/pages/Terms";
import ScreenRecorderDemo from './features/screen-recorder/ScreenRecorderDemo';

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