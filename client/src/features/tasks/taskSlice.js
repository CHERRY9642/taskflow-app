import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
    tasks: [],
    isLoading: false,
    isError: false,
    isSuccess: false,
    message: '',
};

// Get tasks (optional projectId)
export const getTasks = createAsyncThunk('tasks/getAll', async (projectId, thunkAPI) => {
    try {
        const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

// Update task status
export const updateTaskStatus = createAsyncThunk('tasks/updateStatus', async ({ id, status }, thunkAPI) => {
    try {
        const response = await api.put(`/tasks/${id}`, { status });
        return response.data;
    } catch (error) {
        const message = (error.response && error.response.data && error.response.data.message) || error.message;
        return thunkAPI.rejectWithValue(message);
    }
});

const taskSlice = createSlice({
    name: 'tasks',
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
            .addCase(getTasks.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getTasks.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.tasks = action.payload;
            })
            .addCase(getTasks.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(updateTaskStatus.fulfilled, (state, action) => {
                const index = state.tasks.findIndex(t => t.id === action.payload.id);
                if (index !== -1) {
                    state.tasks[index] = action.payload;
                }
            })
    }
});

export const { reset } = taskSlice.actions;
export default taskSlice.reducer;
