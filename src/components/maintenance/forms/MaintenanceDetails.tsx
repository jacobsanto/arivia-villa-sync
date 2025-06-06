
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaintenanceFormValues } from "./types";

interface MaintenanceDetailsProps {
  form: UseFormReturn<MaintenanceFormValues>;
}

const MaintenanceDetails = ({ form }: MaintenanceDetailsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location within Property</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Master bathroom, second floor" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the maintenance issue in detail"
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="requiredTools"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Required Tools/Parts</FormLabel>
            <FormControl>
              <Input placeholder="Enter tools or parts needed (comma-separated)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default MaintenanceDetails;
