import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Login } from "@/pages/Login";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Dashboard } from "@/pages/Dashboard";
import { ReferralList } from "@/pages/referral/ReferralList";
import { ReferralApply } from "@/pages/referral/ReferralApply";
import { ReferralApproval } from "@/pages/referral/ReferralApproval";
import { ConsultationList } from "@/pages/consultation/ConsultationList";
import { ConsultationRoom } from "@/pages/consultation/ConsultationRoom";
import { ExaminationList } from "@/pages/examination/ExaminationList";
import { PrescriptionList } from "@/pages/prescription/PrescriptionList";
import { SettlementList } from "@/pages/settlement/SettlementList";
import { Reports } from "@/pages/reports/Reports";
import { Admin } from "@/pages/admin/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="referral">
            <Route index element={<ReferralList />} />
            <Route path="apply" element={<ReferralApply />} />
            <Route path="approval" element={<ReferralApproval />} />
          </Route>
          <Route path="consultation">
            <Route index element={<ConsultationList />} />
            <Route path="room/:id" element={<ConsultationRoom />} />
          </Route>
          <Route path="examination" element={<ExaminationList />} />
          <Route path="prescription" element={<PrescriptionList />} />
          <Route path="settlement" element={<SettlementList />} />
          <Route path="reports" element={<Reports />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
