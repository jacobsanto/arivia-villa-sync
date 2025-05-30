
import React from "react";
import { UnifiedProperty } from "@/types/property.types";
import { PropertyCardHeader } from "./PropertyCardHeader";
import { PropertyCardContent } from "./PropertyCardContent";
import { Card } from "@/components/ui/card";

interface PropertyCardProps {
  property: UnifiedProperty;
  onViewDetails: (property: UnifiedProperty) => void;
  onBookingManagement: (property: UnifiedProperty) => void;
  onPricingConfig: (property: UnifiedProperty) => void;
  onGuestManagement: (property: UnifiedProperty) => void;
}

const PropertyCard = ({ 
  property,
  onViewDetails,
  onBookingManagement,
  onPricingConfig,
  onGuestManagement,
}: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full mobile-scroll touch-feedback">
      <PropertyCardHeader 
        property={property}
        onViewDetails={onViewDetails}
        onBookingManagement={onBookingManagement}
        onPricingConfig={onPricingConfig}
        onGuestManagement={onGuestManagement}
      />
      <PropertyCardContent property={property} />
    </Card>
  );
};

export default PropertyCard;
