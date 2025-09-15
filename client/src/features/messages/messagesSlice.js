import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  messages: [],       // All messages with current chat user
  recentMessages: [], // Preview for recent chats
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
    // Replace messages array
    setMessages: (state, action) => {
      state.messages = action.payload;
    },

    // Add a new message
    addMessage: (state, action) => {
      const newMessage = action.payload;

      // Normalize message type for images
      const normalizedMessage = {
        ...newMessage,
        message_type: newMessage.media_url ? 'image' : 'text',
      };

      // Add to messages array for current chat
      state.messages.push(normalizedMessage);

      // Update recentMessages array
      const existingChatIndex = state.recentMessages.findIndex(
        (msg) =>
          (msg.from_user_id._id === normalizedMessage.from_user_id._id &&
            msg.to_user_id._id === normalizedMessage.to_user_id._id) ||
          (msg.from_user_id._id === normalizedMessage.to_user_id._id &&
            msg.to_user_id._id === normalizedMessage.from_user_id._id)
      );

      if (existingChatIndex !== -1) {
        // Replace old preview with new message
        state.recentMessages[existingChatIndex] = normalizedMessage;
      } else {
        // Add new conversation to top
        state.recentMessages.unshift(normalizedMessage);
      }

      // Sort recentMessages by latest message
      state.recentMessages.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    },

    // Reset messages for current chat
    resetMessages: (state) => {
      state.messages = [];
    },

    // Explicitly set recentMessages
    setRecentMessages: (state, action) => {
      state.recentMessages = action.payload;
    },

    // Reset recentMessages
    resetRecentMessages: (state) => {
      state.recentMessages = [];
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (action.payload) {
        // Normalize all messages when fetched
        state.messages = action.payload.messages.map((msg) => ({
          ...msg,
          message_type: msg.media_url ? 'image' : 'text',
        }));
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
