
import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Clock, AlertTriangle, Calendar, User, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export const MVPTaskManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("housekeeping");

  const { data: housekeepingTasks } = useQuery({
    queryKey: ['housekeeping-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('housekeeping_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      return data || [];
    }
  });

  const { data: maintenanceTasks } = useQuery({
    queryKey: ['maintenance-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('maintenance_tasks')
        .select('*')
        .order('due_date', { ascending: true });
      return data || [];
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return CheckCircle;
      case 'in_progress': return Clock;
      case 'pending': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task, type }: { task: any; type: 'housekeeping' | 'maintenance' }) => {
    const StatusIcon = getStatusIcon(task.status);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-lg bg-muted">
                <StatusIcon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">
                  {type === 'housekeeping' ? task.task_type : task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {format(new Date(task.due_date), 'MMM dd, yyyy')}
              </div>
              {task.assigned_to && (
                <div className="flex items-center">
                  <User className="h-3 w-3 mr-1" />
                  Assigned
                </div>
              )}
              {task.listing_id && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  Property
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {task.status === 'pending' && (
                <Button size="sm" variant="outline">
                  Start Task
                </Button>
              )}
              {task.status === 'in_progress' && (
                <Button size="sm">
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>Task Management - Arivia Villas</title>
      </Helmet>
      
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
            <p className="text-muted-foreground">Manage housekeeping and maintenance tasks</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="housekeeping">Housekeeping Tasks</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="housekeeping" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Housekeeping Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {housekeepingTasks?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No housekeeping tasks found</p>
                    </div>
                  ) : (
                    housekeepingTasks?.map((task) => (
                      <TaskCard key={task.id} task={task} type="housekeeping" />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {maintenanceTasks?.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No maintenance tasks found</p>
                    </div>
                  ) : (
                    maintenanceTasks?.map((task) => (
                      <TaskCard key={task.id} task={task} type="maintenance" />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
