
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceFormValues } from "./schema";
import { FormFieldWrapper } from "./FormFieldWrapper";

interface PriorityFieldProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

export const PriorityField: React.FC<PriorityFieldProps> = ({ form }) => {
  return (
    <FormFieldWrapper
      form={form}
      name="defaultTaskPriority"
      label="Default Task Priority"
      description="Default priority level for new maintenance tasks"
    >
      <Select defaultValue="normal" onValueChange={form.setValue.bind(null, "defaultTaskPriority")}>
        <SelectTrigger>
          <SelectValue placeholder="Select priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Low</SelectItem>
          <SelectItem value="normal">Normal</SelectItem>
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="urgent">Urgent</SelectItem>
        </SelectContent>
      </Select>
    </FormFieldWrapper>
  );
};
