
import { useFieldArray, useFormContext } from "react-hook-form";

// Helper hook to handle dynamic form arrays
export const useFormArray = () => {
  const { control } = useFormContext();

  // Returns an array of fields and methods to manipulate them
  const getFieldArray = (name: string) => {
    // Use react-hook-form's built-in useFieldArray
    const { fields, append, remove } = useFieldArray({
      control,
      name,
    });

    // Return fields and methods
    return {
      fields,
      append,
      remove,
    };
  };

  return {
    getFieldArray,
  };
};
