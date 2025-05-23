import { supabase } from "@/integrations/supabase/client";
import { toastService } from "@/services/toast/toast.service";
import { User } from "@/types/auth";
import { checkOfflineLoginStatus } from "@/services/auth/offlineService";

export const updateAvatar = async (
  userId: string,
  avatarUrl: string,
  users: User[],
  setUsers: (users: User[]) => void,
  setUser: (user: User | null) => void,
  currentUser: User | null
) => {
  try {
    console.log("Updating avatar for user:", userId);
    console.log("Avatar URL:", avatarUrl);
    
    if (navigator.onLine) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          avatar: avatarUrl,
          updated_at: new Date().toISOString() // Force update
        })
        .eq('id', userId);
        
      if (error) {
        console.error("Error updating profile with avatar URL:", error);
        throw error;
      }
      
      console.log("Profile updated successfully in Supabase");
      
      // Update local state immediately for better UX
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      // Update users list if present
      if (users.length > 0) {
        const updatedUsers = users.map(u => 
          u.id === userId ? { ...u, avatar: avatarUrl } : u
        );
        setUsers(updatedUsers);
      }
      
      return true;
    } else {
      // Offline mode updates
      if (currentUser?.id === userId) {
        const updatedUser = { ...currentUser, avatar: avatarUrl };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, avatar: avatarUrl } : u
      );
      setUsers(updatedUsers);
      
      return true;
    }
  } catch (error) {
    console.error("Error updating avatar:", error);
    toastService.error("Failed to update avatar", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

export const removeUser = async (
  currentUser: User | null,
  users: User[],
  setUsers: (users: User[]) => void,
  userIdToDelete: string
) => {
  try {
    // Only allow superadmins to delete users
    if (currentUser?.role !== "superadmin") {
      toastService.error("Permission denied", {
        description: "Only Super Admins can delete users"
      });
      return false;
    }
    
    // Don't allow deleting self
    if (currentUser?.id === userIdToDelete) {
      toastService.error("Cannot delete your own account", {
        description: "You cannot delete your own account"
      });
      return false;
    }
    
    // Try to delete user in Supabase if online
    if (navigator.onLine) {
      console.log("Attempting to delete user:", userIdToDelete);
      
      // Call the edge function to delete the user safely with admin privileges
      try {
        console.log("Calling delete-user edge function with userId:", userIdToDelete);
        const { data, error } = await supabase.functions.invoke("delete-user", {
          body: { userId: userIdToDelete }
        });
        
        if (error) {
          console.error("Error from delete-user function:", error);
          throw new Error(error.message || "Failed to delete user through edge function");
        }
        
        console.log("Delete user function response:", data);
        
        // Note: We no longer update the local state here as it will be handled by the 
        // realtime subscription in useUserData.ts
        
        return true;
      } catch (functionError) {
        console.error("Error calling delete-user function:", functionError);
        throw functionError;
      }
    } else {
      console.log("Device is offline, updating local state only");
      toastService.warning("Offline delete", {
        description: "User will be removed locally but will sync when back online"
      });
      
      // Update local state for offline mode
      const updatedUsers = users.filter(u => u.id !== userIdToDelete);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      return true;
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    toastService.error("Failed to delete user", {
      description: error instanceof Error ? error.message : "An unknown error occurred"
    });
    return false;
  }
};

export const getOfflineLoginStatus = (user: User | null, lastAuthTime: number, isOffline: boolean) => {
  return checkOfflineLoginStatus(user, lastAuthTime, isOffline);
};
