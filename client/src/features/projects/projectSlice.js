import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    projects: [],
    currentProject: null,
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

// Get all projects
export const getProjects = createAsyncThunk('projects/getAll', async (_, thunkAPI) => {
    try {
        const response = await api.get('/projects');
        return response.data; // Array of projects
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Create project
export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
    try {
        const response = await api.post('/projects', projectData);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const projectSlice = createSlice({
    name: 'projects',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProjects.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProjects.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects = action.payload;
            })
            .addCase(getProjects.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.projects.push(action.payload);
            })
    }
});

export const { reset } = projectSlice.actions;
export default projectSlice.reducer;
