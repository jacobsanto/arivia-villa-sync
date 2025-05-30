import { BookingObject, TaskGenerationResult } from './types.ts';

function getCleaningChecklist(cleaningType: string) {
  switch (cleaningType.toLowerCase()) {
    case 'full':
      return [
        { id: 1, title: "Deep clean bathroom", completed: false },
        { id: 2, title: "Clean behind furniture", completed: false },
        { id: 3, title: "Change all linens", completed: false },
        { id: 4, title: "Vacuum and mop floors", completed: false },
        { id: 5, title: "Dust all surfaces", completed: false },
        { id: 6, title: "Clean windows", completed: false },
        { id: 7, title: "Sanitize kitchen", completed: false }
      ];
    case 'linen & towel change':
      return [
        { id: 1, title: "Change bed linens", completed: false },
        { id: 2, title: "Replace bath towels", completed: false },
        { id: 3, title: "Replace kitchen towels", completed: false },
        { id: 4, title: "Quick bathroom cleanup", completed: false }
      ];
    default: // Standard
      return [
        { id: 1, title: "Clean bathroom", completed: false },
        { id: 2, title: "Make bed with fresh linens", completed: false },
        { id: 3, title: "Vacuum floors", completed: false },
        { id: 4, title: "Clean kitchen area", completed: false },
        { id: 5, title: "Empty trash", completed: false }
      ];
  }
}

export async function generateHousekeepingTasksFromBooking(supabase: any, booking: BookingObject): Promise<TaskGenerationResult> {
  try {
    // Initialize result
    const result: TaskGenerationResult = {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };

    // Normalize dates to Date objects
    const checkIn = typeof booking.check_in_date === 'string' 
      ? new Date(booking.check_in_date) 
      : booking.check_in_date;
    
    const checkOut = typeof booking.check_out_date === 'string' 
      ? new Date(booking.check_out_date) 
      : booking.check_out_date;

    // Calculate stay duration in nights
    const stayDuration = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Use listing_id if available, otherwise use property_id
    const listingId = booking.listing_id || booking.property_id;
    
    // Check for same-day check-in after this booking's check-out
    const { data: sameDayBookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', booking.property_id)
      .eq('check_in_date', checkOut.toISOString().split('T')[0])
      .neq('id', booking.id);
    
    const hasSameDayCheckIn = sameDayBookings && sameDayBookings.length > 0;
    
    // Generate the tasks based on stay duration
    const tasks = [];
    
    // 1. Pre-arrival Standard Cleaning (for all stays)
    const preArrivalDate = new Date(checkIn);
    preArrivalDate.setDate(preArrivalDate.getDate() - 1);
    const preArrivalDateStr = preArrivalDate.toISOString().split('T')[0];
    
    tasks.push({
      booking_id: booking.id,
      listing_id: listingId,
      task_type: "Standard Cleaning",
      due_date: preArrivalDateStr,
      status: "pending",
      description: `Pre-arrival cleaning for ${booking.guest_name}`
    });
    
    // 2. Determine mid-stay cleanings based on duration
    if (stayDuration <= 3) {
      // No mid-stay cleaning needed
    } 
    else if (stayDuration <= 5) {
      // One mid-stay cleaning
      const midpointDate = new Date(checkIn);
      midpointDate.setDate(midpointDate.getDate() + Math.floor(stayDuration / 2));
      const midpointDateStr = midpointDate.toISOString().split('T')[0];
      
      // Add Full Cleaning
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: midpointDateStr,
        status: "pending",
        description: `Mid-stay full cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Change on same day
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: midpointDateStr,
        status: "pending",
        description: `Mid-stay linen & towel change for ${booking.guest_name}`
      });
    } 
    else if (stayDuration <= 7) {
      // Two mid-stay cleanings at 1/3 and 2/3 of stay
      const firstThirdDate = new Date(checkIn);
      firstThirdDate.setDate(firstThirdDate.getDate() + Math.floor(stayDuration / 3));
      const firstThirdDateStr = firstThirdDate.toISOString().split('T')[0];
      
      const secondThirdDate = new Date(checkIn);
      secondThirdDate.setDate(secondThirdDate.getDate() + Math.floor((stayDuration / 3) * 2));
      const secondThirdDateStr = secondThirdDate.toISOString().split('T')[0];
      
      // Add Full Cleanings
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: firstThirdDateStr,
        status: "pending",
        description: `First mid-stay cleaning for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Full Cleaning",
        due_date: secondThirdDateStr,
        status: "pending",
        description: `Second mid-stay cleaning for ${booking.guest_name}`
      });
      
      // Add Linen & Towel Changes on same days
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: firstThirdDateStr,
        status: "pending",
        description: `First linen & towel change for ${booking.guest_name}`
      });
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Linen & Towel Change",
        due_date: secondThirdDateStr,
        status: "pending",
        description: `Second linen & towel change for ${booking.guest_name}`
      });
    } 
    else {
      // Stays longer than 7 nights - custom schedule
      const customCleaningDate = new Date(checkIn);
      customCleaningDate.setDate(customCleaningDate.getDate() + 3);
      const customCleaningDateStr = customCleaningDate.toISOString().split('T')[0];
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Custom Cleaning Schedule",
        due_date: customCleaningDateStr,
        status: "pending",
        description: `Custom cleaning schedule for extended stay (${stayDuration} nights) - ${booking.guest_name}`
      });
      
      // Flag for manual schedule
      result.manual_schedule_required = true;
    }
    
    // 3. Post-checkout cleaning (if no same-day check-in)
    if (!hasSameDayCheckIn) {
      const checkoutDateStr = checkOut.toISOString().split('T')[0];
      
      tasks.push({
        booking_id: booking.id,
        listing_id: listingId,
        task_type: "Standard Cleaning",
        due_date: checkoutDateStr,
        status: "pending",
        description: `Post-checkout cleaning after ${booking.guest_name}`
      });
    } else {
      // Log the skipped task
      result.tasksSkipped.push({
        task_type: "Standard Cleaning",
        due_date: checkOut.toISOString().split('T')[0],
        reason: "Same-day check-in detected"
      });
    }
    
    // Insert tasks into database, avoiding duplicates
    for (const task of tasks) {
      // Check if this task already exists
      const { data: existingTasks } = await supabase
        .from('housekeeping_tasks')
        .select('id')
        .eq('booking_id', task.booking_id)
        .eq('task_type', task.task_type)
        .eq('due_date', task.due_date);
      
      if (existingTasks && existingTasks.length > 0) {
        // Task already exists, skip it
        result.tasksSkipped.push({
          task_type: task.task_type,
          due_date: task.due_date,
          reason: "Duplicate task"
        });
      } else {
        // Insert the new task
        const { data: insertedTask, error } = await supabase
          .from('housekeeping_tasks')
          .insert(task)
          .select('id, task_type, due_date')
          .single();
        
        if (error) {
          console.error(`Error creating task: ${error.message}`, task);
          result.tasksSkipped.push({
            task_type: task.task_type,
            due_date: task.due_date,
            reason: `Database error: ${error.message}`
          });
        } else if (insertedTask) {
          result.tasksCreated.push({
            id: insertedTask.id,
            task_type: insertedTask.task_type,
            due_date: insertedTask.due_date
          });
        }
      }
    }
    
    return result;
    
  } catch (error: any) {
    console.error("Error generating housekeeping tasks:", error);
    
    return {
      tasksCreated: [],
      tasksSkipped: [],
      manual_schedule_required: false
    };
  }
}
