import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    default: ''
  },
  mediaUrl: {
    type: String,
    default: null
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', 'audio', null],
    default: null
  },
  storyReply: {
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      default: null
    },
    storyMediaUrl: {
      type: String,
      default: null
    }
  },

  seen: {
    type: Boolean,
    default: false,
    index: true
  },
  seenAt: {
    type: Date,
    default: null
  },

  read: {
    type: Boolean,
    default: false,
    index: true
  },

  status: {
    type: String,
    enum: ['sending', 'sent', 'delivered', 'seen'],
    default: 'sent'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, seen: 1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ conversationId: 1, receiver: 1, seen: 1 });

export default mongoose.model('Message', messageSchema);

