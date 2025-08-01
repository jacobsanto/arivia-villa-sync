
import { useState, useCallback } from "react";
import { useUser } from "@/contexts/UserContext";
import { 
  useMessageLoader, 
  useRealtimeMessages, 
  useMessageSender
} from "./chat";
import { useMessageReactions } from "./chat/useMessageReactions";
import { toast } from "sonner";

export function useChat(chatType: 'general' | 'direct', recipientId?: string) {
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  // Use the extracted hook for message loading
  const { messages, setMessages, loading, isOffline, loadError } = useMessageLoader(chatType, recipientId);
  
  // Handle load errors
  if (loadError && !error) {
    setError(loadError.message);
    toast.error("Failed to load messages", {
      description: loadError.message
    });
  }
  
  // Set up realtime message subscriptions - always call hook to avoid conditional hook calls
  useRealtimeMessages({ chatType, recipientId: recipientId || '', messages, setMessages });
  
  // Simple typing status - avoid complex hook dependencies
  const [typingStatus, setTypingStatus] = useState<string[]>([]);
  
  const handleTyping = useCallback(() => {
    // Simple typing implementation without complex state management
    console.log('User is typing...');
  }, []);

  const clearTyping = useCallback(() => {
    setTypingStatus([]);
  }, []);
  
  // Use the extracted hook for sending messages with enhanced functionality
  const { 
    messageInput, 
    setMessageInput, 
    sendMessage, 
    sendError,
    // New functionality
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    showEmojiPicker,
    toggleEmojiPicker,
    handleEmojiSelect
  } = useMessageSender({ 
    chatType, 
    recipientId, 
    messages, 
    setMessages,
    isOffline 
  });
  
  // Handle send errors
  if (sendError && sendError.message !== error) {
    setError(sendError.message);
  }
  
  // Use the extracted hook for message reactions
  const { addReaction, reactionMessageId, setReactionMessageId, showEmojiPicker: showReactionEmojiPicker, setShowEmojiPicker: setReactionEmojiPicker, reactionError } = useMessageReactions({ 
    chatType, 
    messages, 
    setMessages, 
    isOffline 
  });
  
  // Handle reaction errors
  if (reactionError && reactionError.message !== error) {
    setError(reactionError.message);
  }
  
  // Clear error after 5 seconds
  if (error) {
    setTimeout(() => {
      setError(null);
    }, 5000);
  }

  return {
    messages,
    loading,
    isOffline,
    error,
    messageInput,
    setMessageInput,
    sendMessage,
    addReaction,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker: showReactionEmojiPicker,
    setShowEmojiPicker: setReactionEmojiPicker,
    typingStatus,
    handleTyping,
    clearTyping,
    // New functionality
    attachments,
    fileInputRef,
    imageInputRef,
    handleFileClick,
    handleImageClick,
    handleFileSelect,
    handleImageSelect,
    removeAttachment,
    showMessageEmojiPicker: showEmojiPicker,
    toggleMessageEmojiPicker: toggleEmojiPicker,
    handleEmojiSelect
  };
}
