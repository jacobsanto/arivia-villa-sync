
export function prepareBookings(remoteBookings: any[]): any[] {
  return remoteBookings
    .filter((booking: any) => booking && typeof booking === 'object')
    .map((booking: any) => {
      try {
        const bookingId = booking.id || booking._id;
        const propListingId = booking.listingId || (booking.listing && booking.listing._id);
        const guest = booking.guest || {};
        const price = booking.money || {};
        const guests = booking.guests || {};
        
        if (!bookingId || !propListingId) {
          console.warn("[GuestySync] Missing booking id or listing id, skipping", booking);
          return null;
        }

        // Normalize guest email with proper fallbacks
        const guestEmail = guest.email || 
          (booking.raw_data?.guest?.email) || 
          (booking.guestDetails?.email) || null;

        // Extract price details
        const totalPrice = typeof price.totalPrice === 'number' ? price.totalPrice :
                         typeof price.netAmount === 'number' ? price.netAmount : null;

        // Calculate total guests with proper fallbacks
        const totalGuests = 
          (parseInt(guests.adults) || 0) + 
          (parseInt(guests.children) || 0) + 
          (parseInt(guests.infants) || 0);

        // Normalize status
        const normalizedStatus = normalizeBookingStatus(booking.status);
        
        // Enhanced logging for financial data
        if (!totalPrice) {
          console.warn(`[GuestySync] No price found for booking ${bookingId}`, {
            priceData: price,
            rawMoney: booking.money,
            status: normalizedStatus
          });
        }

        return {
          id: bookingId,
          listing_id: propListingId,
          guest_name: guest.fullName || guest.name || 'Unknown Guest',
          guest_email: guestEmail,
          check_in: booking.startDate || booking.checkIn,
          check_out: booking.endDate || booking.checkOut,
          status: normalizedStatus,
          amount_paid: totalPrice,
          currency: price.currency || 'EUR',
          total_guests: totalGuests || 1,
          booking_created: booking.createdAt || null,
          booking_updated: booking.updatedAt || null,
          last_synced: new Date().toISOString(),
          raw_data: booking
        };
      } catch (error) {
        console.error("[GuestySync] Error preparing booking:", error, booking);
        return null;
      }
    })
    .filter(b => b !== null);
}

function normalizeBookingStatus(status: string | null | undefined): string {
  if (!status) return 'unknown';
  
  const normalizedStatus = status.toLowerCase().trim();
  
  // Map of accepted status values
  const statusMap: { [key: string]: string } = {
    'confirmed': 'confirmed',
    'canceled': 'cancelled',
    'cancelled': 'cancelled',
    'tentative': 'tentative',
    'pending': 'pending'
  };
  
  return statusMap[normalizedStatus] || 'unknown';
}
