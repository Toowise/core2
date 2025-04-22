const haversine = require('haversine-distance');

const STATUS_RADIUS_METERS = 500;

function updateShipmentStatus(shipment, currentLocation) {
    const destinationLocation = {
      lat: shipment.destination_latitude,
      lon: shipment.destination_longitude,
    };
  
    // No pickup location provided
    if (!shipment.pickup_latitude || !shipment.pickup_longitude) {
      const distToDestination = haversine(currentLocation, destinationLocation);
  
      if (shipment.status === 'Pending for Pickup') {
        return 'Out for Delivery';
      } else if (shipment.status === 'Out for Delivery' && distToDestination <= STATUS_RADIUS_METERS) {
        return 'Delivered';
      }
  
      return shipment.status;
    }
  
    // If pickup location exists, follow full process
    const pickupLocation = {
      lat: shipment.pickup_latitude,
      lon: shipment.pickup_longitude,
    };
  
    const distToPickup = haversine(currentLocation, pickupLocation);
    const distToDestination = haversine(currentLocation, destinationLocation);
  
    if (shipment.status === 'Pending for Pickup' && distToPickup <= STATUS_RADIUS_METERS) {
      return 'Package Received';
    } else if (shipment.status === 'Package Received' && distToPickup > STATUS_RADIUS_METERS) {
      return 'Out for Delivery';
    } else if (shipment.status === 'Out for Delivery' && distToDestination <= STATUS_RADIUS_METERS) {
      return 'Delivered';
    }
  
    return shipment.status;
  }

module.exports = { updateShipmentStatus };
