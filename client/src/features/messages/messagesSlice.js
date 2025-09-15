import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  messages: [],
  recentMessages: [], // ✅ added recent messages
};

// Fetch messages for a particular user
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async ({ token, userId }) => {
    const { data } = await api.post(
      '/api/message/get',
      { to_user_id: userId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data.success ? data : null;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Set all messages
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    // Add a new message
    addMessage: (state, action) => {
      const newMessage = action.payload;

      // Add to messages array
      state.messages.push(newMessage);

      // ✅ Update recentMessages for chat preview
      const existingChatIndex = state.recentMessages.findIndex(
        (msg) =>
          (msg.from_user_id === newMessage.from_user_id &&
            msg.to_user_id === newMessage.to_user_id) ||
          (msg.from_user_id === newMessage.to_user_id &&
            msg.to_user_id === newMessage.from_user_id)
      );

      if (existingChatIndex !== -1) {
        // Replace old preview with new message
        state.recentMessages[existingChatIndex] = newMessage;
      } else {
        // Add new conversation to the top
        state.recentMessages.unshift(newMessage);
      }
    },

    // Reset current messages
    resetMessages: (state) => {
      state.messages = [];
    },

    // ✅ Set recentMessages explicitly
    setRecentMessages: (state, action) => {
      state.recentMessages = action.payload;
    },

    // ✅ Reset recentMessages
    resetRecentMessages: (state) => {
      state.recentMessages = [];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = action.payload.messages;
      }
    });
  },
});

export const {
  setMessages,
  addMessage,
  resetMessages,
  setRecentMessages,
  resetRecentMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;
