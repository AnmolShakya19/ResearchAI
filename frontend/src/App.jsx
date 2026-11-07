import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import ResearchResources from "./pages/ResearchResources"
import ProtectedRoute from "./components/ProtectedRoute"
import Profile from "./pages/Profile"
import Home from "./pages/Home"
import AllDocuments from "./pages/AllDocuments"
import AuthCallback from "./pages/AuthCallback"
import VerifyOTP from "./pages/VerifyOTP"
import Uploads from "./pages/Uploads"
import Settings from "./pages/Settings"
import ResearchLibrary from "./pages/ResearchLibrary"


function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="/home" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />

        <Route path="/all-documents" element={
          <ProtectedRoute><AllDocuments /></ProtectedRoute>
        } />

        <Route path="/project/:projectId" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/project/:projectId/research-library" element={
          <ProtectedRoute><ResearchLibrary /></ProtectedRoute>
        } />

        <Route path="/project/:projectId/uploads" element={
          <ProtectedRoute><Uploads /></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

              <Route path="/research-resources" element={
          <ProtectedRoute><ResearchResources /></ProtectedRoute>
        } />
      </Routes>

    </BrowserRouter>

  )

}

export default App