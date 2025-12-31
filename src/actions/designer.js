import api from "../api/api";   // your Axios instance
import { message } from "antd";

// 1) Create Designer
export const createDesigner = (title) => async (dispatch) => {
  try {
    const res = await api.post(`designers`, { title });
    return res.data;  // return created designer
  } catch (error) {
    message.error("Failed to create designer");
    throw error;
  }
};

// 2) Request Presigned S3 Upload URL
export const requestPresignedUrl = (designerId, fileName, contentType) => async (dispatch) => {
  try {
    const res = await api.post(`designers/${designerId}/upload-url`, {
      fileName,
      contentType,
    });
    return res.data; // { url, key }
  } catch (error) {
    message.error("Failed to get upload URL");
    throw error;
  }
};

// 3) Update Designer Metadata (S3 Key, Page Count...)
export const updateDesignerMetadata = (designerId, payload) => async (dispatch) => {
  try {
    const res = await api.put(`designers/${designerId}`, payload);
    return res.data;
  } catch (error) {
    message.error("Failed to update document");
    throw error;
  }
};

// 4) Get Designer by ID
export const getDesigner = (designerId) => async (dispatch) => {
  try {
    const res = await api.get(`/designers/${designerId}`);
    return res.data;
  } catch (error) {
    message.error("Failed to get designer");
    throw error;
  }
};

// 6) Send emails to selected users for designer
// export const sendDesignerEmails = (designerId, users) => async (dispatch) => {
//   try {
//     const res = await api.post(`designers/${designerId}/send-emails`, { users });
//     return res.data;
//   } catch (error) {
//     message.error("Failed to send emails");
//     throw error;
//   }
// };

// 7) Submit completed document
export const submitCompletedDocument = (designerId, data) => async (dispatch) => {
  try {
    const res = await api.post(`/documents/${designerId}/submit`, data);
    return res.data;
  } catch (error) {
    message.error("Failed to submit document");
    throw error;
  }
};

// 8) Get document for completion (by token)
export const getDocumentByToken = (doctoken) => async (dispatch) => {
  try {
    const res = await api.get(`/documents/complete/${doctoken}`);
    const { token, response} = res.data;
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    return response;
  } catch (error) {
    message.error("Failed to load document");
    throw error;
  }
};

// 9) Get All Designers
export const getAllDesigners = () => async (dispatch) => {
  try {
    const res = await api.get(`/designers/all`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch designers", error);
    message.error("Failed to load designers");
    return [];
  }
};

export const getAllCompletedDesigners = () => async (dispatch) => {
  try {
    const res = await api.get(`/designers/all/completed`);
    return res.data;
  } catch (error) {
    console.error("Failed to fetch designers", error);
    message.error("Failed to load designers");
    return [];
  }
};

// 10) Get View URL directly
export const getViewUrl = (designerId) => async (dispatch) => {
  try {
    const res = await api.get(`/designers/${designerId}/view-url`);
    return res.data; // { url }
  } catch (error) {
    console.error("Failed to get view URL", error);
    throw error;
  }
};

// 11) Delete Designer
export const deleteDesigner = (id) => async (dispatch) => {
    try {
        await api.delete(`/designers/${id}`);
        message.success("Document deleted successfully");
        return true;
    } catch (error) {
        console.error("Failed to delete", error);
        message.error("Failed to delete document");
        return false;
    }
};

// 12) Publish Designer
export const publishDesigner = (id) => async (dispatch) => {
    try {
        await api.put(`/designers/${id}/publish`);
        message.success("Document published successfully");
        return true;
    } catch (error) {
        console.error("Failed to publish", error);
        message.error("Failed to publish document");
        return false;
    }
};

// 13) Get completion values
export const getDesignerValues = (id) => async (dispatch) => {
    try {
        const res = await api.get(`/designers/${id}/all-values`);
        return res.data;
    } catch (error) {
        console.error("Failed to get values", error);
        return {};
    }
};

// 14) Bulk Publish Template
export const bulkPublishDesigner = (id, users) => async (dispatch) => {
    try {
        const res = await api.post(`/designers/${id}/bulk-publish`, { users });
        message.success(`Successfully sent to ${res.data.clonedCount} users`);
        return true;
    } catch (error) {
        console.error("Failed to bulk publish", error);
        message.error("Failed to distribute template to users");
        return false;
    }
};