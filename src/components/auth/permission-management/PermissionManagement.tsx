
import React from 'react';
import { User } from "@/types/auth";
import { useUser } from "@/contexts/UserContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Shield } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import UnauthorizedPermissionView from './UnauthorizedPermissionView';
import PermissionHeader from './PermissionHeader';
import PermissionFilters from './PermissionFilters';
import PermissionCategoryAccordion from './PermissionCategoryAccordion';
import usePermissionManagement from './usePermissionManagement';

interface PermissionManagementProps {
  selectedUser: User | null;
}

const PermissionManagement: React.FC<PermissionManagementProps> = ({ selectedUser }) => {
  const { user: currentUser, updateUserPermissions } = useUser();

  const {
    permissions,
    isSaving,
    activeCategory,
    permissionGroups,
    handlePermissionToggle,
    handleSave,
    handleResetToDefault,
    setActiveCategory
  } = usePermissionManagement({
    selectedUser,
    updateUserPermissions
  });
  
  // Only superadmins can access this component
  if (currentUser?.role !== "superadmin" || !selectedUser) {
    return <UnauthorizedPermissionView />;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Manage User Permissions
        </CardTitle>
        <CardDescription>
          Customize permissions for {selectedUser.name} ({selectedUser.email})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <PermissionHeader 
            selectedUser={selectedUser}
            isSaving={isSaving}
            onSave={handleSave}
            onResetToDefault={handleResetToDefault}
          />
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <PermissionFilters 
              activeCategory={activeCategory}
              permissionGroups={permissionGroups}
              onCategoryChange={setActiveCategory}
            />
            
            <TabsContent value={activeCategory} className="mt-4">
              <Accordion type="multiple" className="w-full">
                {Object.entries(permissionGroups)
                  .filter(([category]) => activeCategory === "all" || category === activeCategory)
                  .map(([category, permKeys]) => (
                    <PermissionCategoryAccordion
                      key={category}
                      category={category}
                      permKeys={permKeys}
                      permissions={permissions}
                      selectedUser={selectedUser}
                      handlePermissionToggle={handlePermissionToggle}
                    />
                  ))}
              </Accordion>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionManagement;
