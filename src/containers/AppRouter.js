import { Routes, Route } from "react-router-dom";

import Login from './Login';
import ForgotPassword from '../components/ForgotPassword';
import ResetPassword from '../components/ResetPassword';
import RegisterUser from '../components/RegisterUser';
import DocumentCompletion from '../components/DocumentCompletion/DocumentCompletion';
import SubmissionSuccess from '../components/DocumentCompletion/SubmissionSuccess';
import CompletedDocument from '../components/CompletedDocument/CompletedDocument';

import GlobalLayout from "./GlobalLayout";
import DesignerStepper from "../components/Designer/DesignerStepper";
import ViewUser from "../components/UserManagement/ViewUser";
import CompletedDocumentsList from "../components/Documents/CompletedDocumentsList";
import DesignerDocuments from "../components/Documents/DesignerDocuments";
import SessionExpiry from "../components/SessionExpiry";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register-user" element={<RegisterUser />} />
      <Route path="/session-expired" element={<SessionExpiry />} />

      <Route path="/documents/complete/:token" element={<DocumentCompletion />} />
      <Route path="/document-submitted" element={<SubmissionSuccess />} />
      <Route path="/documents/final/:designerId" element={<CompletedDocument />} />

      <Route element={<GlobalLayout />}>
        <Route path="/designers/create" element={<DesignerStepper />} />
        <Route path="/designers/edit/:id" element={<DesignerStepper />} />

        <Route path="/users/add" element={<RegisterUser />} />
        <Route path="/users/view" element={<ViewUser />} />
        <Route path="/users/edit/:id" element={<RegisterUser />} />

        <Route path="/documents/completed" element={<CompletedDocumentsList />} />
        <Route path="/documents/designer" element={<DesignerDocuments />} />

      </Route>
    </Routes>
  );
};

export default AppRouter;
