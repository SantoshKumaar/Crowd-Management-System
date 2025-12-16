import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import Layout from "../components/shared/Layout";

// Lazy load components for better performance
const Login = React.lazy(() =>
  import("../components/screens/auth/Login")
);

const Dashboard = React.lazy(() =>
  import("../components/screens/dashboard/Dashboard")
);

const CrowdEntries = React.lazy(() =>
  import("../components/screens/crowdEntries/CrowdEntries")
);

const Router = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/crowd-entries"
              element={
                <Layout>
                  <CrowdEntries />
                </Layout>
              }
            />
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;

