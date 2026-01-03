# Application Functionality: Docusign Clone

This document provides a comprehensive overview of the application's functionality, detailing the end-to-end workflow for document creation, field placement, and signing.

## 1. Overview
The application is a digital document signature platform that allows users to upload PDF documents, place interactive fields (like signatures, text boxes), and send them to participants for completion and signing.

## 2. Core Modules

### A. Authentication & User Management
*   **User Onboarding**: Users can register for a new account or log in with existing credentials.
*   **Security**: Includes features like password reset/recovery and session management (with automatic logout for security).
*   **Registration**: Standard user registration flow to manage document ownership and participation.

### B. Document Designer (The "Sender" Workflow)
The Document Designer is the heart of the application where users prepare documents for signing.
*   **PDF Upload**: Senders upload the PDF base document.
*   **Participant Management**: Define users who need to interact with the document.
*   **Interactive Field Placement**: Drag-and-drop interface to place fields on the document:
    *   Signature fields
    *   Text inputs
    *   Radio Buttons
    *   Checkboxes
*   **Field Assignment**: Each field is assigned to a specific participant.
*   **Document Publishing**: Once designed, the document is "Published" or sent to participants.

### C. Signer Workflow (The "Recipient" Workflow)
Once a document is sent, recipients receive an email with link to complete the document.
*   **Document Preview**: Recipients can view the document and see where they need to take action.
*   **Guided Completion**: The interface guides the user through their assigned fields.
*   **Electronic Signature**: Users can capture their signature through a signature modal.
*   **Final Submission**: After completing all fields, the recipient submits the document.

### D. Document Management & Consolidation
*   **Dashboard**: Users can view the status of all their documents (Draft, Pending, Completed).
*   **Data Consolidation**: For completed documents, the application consolidated all field values provided by participants.
*   **Viewing Completed Docs**: Access to the final signed version of the document with all fields populated.

## 3. End-to-End Workflow Summary
1.  **Preparation**: User logs in and uploads a PDF.
2.  **Design**: User places signature/text fields and assigns them to participants.
3.  **Dispatch**: User publishes the document (triggering emails/notifications).
4.  **Signing**: Participants open the document, fill in required info, and sign.
5.  **Completion**: All parties are notified, and the final document is stored for viewing/download.

---
## Technical Information
*   **Frontend**: Built with **React** for a dynamic, responsive user interface.
*   **Backend**: Powered by **Spring Boot (Java)** for secure and robust API services.
*   **Database**: **MongoDB** for flexible, document-oriented data storage.
*   **Cloud Infrastructure**: **AWS (Amazon Web Services)** for document storage (S3) and reliable hosting.
