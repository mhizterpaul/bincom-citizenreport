import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axios";

interface Location {
  type: string;
  coordinates: number[];
}

interface Incident {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: Location;
  status: "pending" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  images: string[];
  userId: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

interface IncidentState {
  incidents: Incident[];
  userIncidents: Incident[];
  currentIncident: Incident | null;
  loading: boolean;
  error: string | null;
}

const initialState: IncidentState = {
  incidents: [],
  userIncidents: [],
  currentIncident: null,
  loading: false,
  error: null,
};

export const fetchIncidents = createAsyncThunk(
  "incidents/fetchIncidents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/incidents");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch incidents"
      );
    }
  }
);

export const fetchUserIncidents = createAsyncThunk(
  "incidents/fetchUserIncidents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/incidents/user");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user incidents"
      );
    }
  }
);

export const createIncident = createAsyncThunk(
  "incidents/createIncident",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const response = await api.post("/incidents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data.success) {
        return rejectWithValue(response.data.message);
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error creating incident:", error);
      return rejectWithValue(
        error.response?.data?.message || "Failed to create incident"
      );
    }
  }
);

export const updateIncident = createAsyncThunk(
  "incidents/updateIncident",
  async (
    { id, formData }: { id: string; formData: FormData },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.put(`/incidents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update incident"
      );
    }
  }
);

export const deleteIncident = createAsyncThunk(
  "incidents/deleteIncident",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/incidents/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete incident"
      );
    }
  }
);

const incidentSlice = createSlice({
  name: "incidents",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Incidents
      .addCase(fetchIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = action.payload;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch User Incidents
      .addCase(fetchUserIncidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserIncidents.fulfilled, (state, action) => {
        state.loading = false;
        state.userIncidents = action.payload;
      })
      .addCase(fetchUserIncidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Incident
      .addCase(createIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents.unshift(action.payload);
        state.userIncidents.unshift(action.payload);
      })
      .addCase(createIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Incident
      .addCase(updateIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIncident.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.incidents.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) {
          state.incidents[index] = action.payload;
        }
        const userIndex = state.userIncidents.findIndex(
          (i) => i._id === action.payload._id
        );
        if (userIndex !== -1) {
          state.userIncidents[userIndex] = action.payload;
        }
      })
      .addCase(updateIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete Incident
      .addCase(deleteIncident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIncident.fulfilled, (state, action) => {
        state.loading = false;
        state.incidents = state.incidents.filter(
          (i) => i._id !== action.payload
        );
        state.userIncidents = state.userIncidents.filter(
          (i) => i._id !== action.payload
        );
      })
      .addCase(deleteIncident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = incidentSlice.actions;
export default incidentSlice.reducer;
