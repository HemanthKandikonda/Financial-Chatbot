import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Conversation',
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    messages: [messageSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
    totalTokensUsed: {
      type: Number,
      default: 0,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update lastMessageAt when messages are added
chatSchema.pre('save', function (next) {
  if (this.isModified('messages') && this.messages.length > 0) {
    this.lastMessageAt = new Date();
    // Auto-generate title from first user message if still default
    if (this.title === 'New Conversation' && this.messages.length === 1) {
      const firstMsg = this.messages[0].content;
      this.title = firstMsg.length > 60
        ? firstMsg.substring(0, 57) + '...'
        : firstMsg;
    }
  }
  next();
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
