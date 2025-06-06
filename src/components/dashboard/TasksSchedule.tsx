import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { isSameDay } from "date-fns";
import { Task } from "@/types/taskTypes";
import { MaintenanceTask } from "@/types/maintenanceTypes";
import { useIsMobile } from "@/hooks/use-mobile";
import { CombinedTask } from "./agenda/agendaUtils";

interface TasksScheduleProps {
  housekeepingTasks: Task[];
  maintenanceTasks: MaintenanceTask[];
}

const TasksSchedule: React.FC<TasksScheduleProps> = ({
  housekeepingTasks,
  maintenanceTasks
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const isMobile = useIsMobile();
  
  const combinedTasks: CombinedTask[] = [
    ...housekeepingTasks.map(task => ({
      id: task.id,
      title: task.title,
      type: task.type || "Housekeeping",
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "housekeeping" as const
    })),
    ...maintenanceTasks.map(task => ({
      id: task.id.toString(),
      title: task.title,
      type: "Maintenance",
      dueDate: task.dueDate,
      priority: task.priority,
      property: task.property,
      status: task.status,
      taskType: "maintenance" as const
    }))
  ];

  const tasksForSelectedDate = combinedTasks.filter(task => {
    try {
      const taskDate = new Date(task.dueDate);
      return isSameDay(taskDate, selectedDate);
    } catch (e) {
      console.error("Invalid date format for task:", task.title);
      return false;
    }
  });

  const datesWithTasks = combinedTasks.reduce<Date[]>((dates, task) => {
    try {
      const taskDate = new Date(task.dueDate);
      if (!dates.some(date => isSameDay(date, taskDate))) {
        dates.push(taskDate);
      }
    } catch (e) {
      console.error("Invalid date format for task:", task.title);
    }
    return dates;
  }, []);

  return (
    <Card className="px-0">
      <CardHeader>
        <CardTitle>Schedule</CardTitle>
        <CardDescription>Tasks and events for {format(selectedDate, 'MMMM d, yyyy')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`${isMobile ? 'flex flex-col space-y-6' : 'grid grid-cols-1 md:grid-cols-2 gap-6'}`}>
          <div className="flex justify-center">
            <Calendar 
              mode="single" 
              selected={selectedDate} 
              onSelect={date => date && setSelectedDate(date)} 
              className="rounded-md border" 
              modifiers={{
                hasTasks: datesWithTasks
              }} 
              modifiersStyles={{
                hasTasks: {
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)'
                }
              }} 
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tasks for {format(selectedDate, 'MMM d, yyyy')}</h4>
            <div className="max-h-[360px] overflow-y-auto pr-1">
              {tasksForSelectedDate.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks scheduled for this day.</p>
              ) : (
                <div className="space-y-2">
                  {tasksForSelectedDate.map(task => (
                    <TaskItem key={`${task.taskType}-${task.id}`} task={task} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TaskItemProps {
  task: CombinedTask;
}

const TaskItem = ({
  task
}: TaskItemProps) => {
  const priorityColor = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
    High: "bg-red-100 text-red-800",
    Medium: "bg-amber-100 text-amber-800",
    Low: "bg-blue-100 text-blue-800"
  }[task.priority] || "bg-gray-100 text-gray-800";

  const taskTypeBadge = task.taskType === "housekeeping" ? "bg-purple-100 text-purple-800" : "bg-emerald-100 text-emerald-800";

  const formattedTime = (() => {
    try {
      const date = new Date(task.dueDate);
      return format(date, 'h:mm a');
    } catch (e) {
      return "Time not specified";
    }
  })();

  return (
    <div className="flex items-center justify-between p-2 border rounded-md hover:bg-secondary cursor-pointer">
      <div className="flex flex-col">
        <span className="font-medium text-sm">{task.title}</span>
        <span className="text-xs text-muted-foreground">{formattedTime} - {task.property}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`px-2 py-1 rounded-md text-xs ${priorityColor}`}>
          {task.priority}
        </div>
        <Badge variant="outline" className={taskTypeBadge}>
          {task.taskType === "housekeeping" ? "Housekeeping" : "Maintenance"}
        </Badge>
      </div>
    </div>
  );
};

export default TasksSchedule;
