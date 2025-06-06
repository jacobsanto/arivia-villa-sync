
import { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useMessageStorage } from "./useMessageStorage";
import { useTypingIndicator } from "@/hooks/chat/useTypingIndicator"; // Updated import path
import { useMessageReactions } from "./useMessageReactions";
import { Message, MessageReaction } from "./useChatTypes";

// Use "export type" for re-exporting types
export type { Message, MessageReaction };

export const useChatMessages = (activeChat: string) => {
  const { toast } = useToast();
  const { user } = useUser();
  const [message, setMessage] = useState("");
  
  // Use our custom hooks
  const { messages, setMessages } = useMessageStorage(activeChat);
  const { typingStatus, handleTyping, clearTyping } = useTypingIndicator(activeChat);
  
  // Fix the error by passing chatType along with messages and setMessages
  const { 
    reactionMessageId, 
    setReactionMessageId, 
    showEmojiPicker, 
    setShowEmojiPicker, 
    addReaction: addReactionToMessage 
  } = useMessageReactions({
    chatType: 'general', // Add the required chatType property
    messages, 
    setMessages
  });

  const handleChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    handleTyping();
  };
  
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage: Message = {
        id: `temp-${Date.now()}`, // Using string ID
        sender: user?.name || "Admin",
        avatar: user?.avatar || "/placeholder.svg",
        content: message.trim(),
        timestamp: new Date().toISOString(),
        isCurrentUser: true,
        reactions: {} // Initialize empty reactions object
      };
      
      setMessages([...messages, newMessage]);
      setMessage("");
      clearTyping();
      
      toast({
        title: "Message sent",
        description: `Your message was sent to ${activeChat}`,
      });
    }
  };
  
  const addReaction = (messageId: string, emoji: string) => {
    const username = user?.name || "Admin";
    addReactionToMessage(messageId, emoji, username);
  };

  return {
    messages,
    message,
    setMessage,
    typingStatus,
    handleChangeMessage,
    handleSendMessage,
    reactionMessageId,
    setReactionMessageId,
    showEmojiPicker,
    setShowEmojiPicker,
    addReaction
  };
};
