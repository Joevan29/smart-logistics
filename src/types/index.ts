export interface Driver {
    id: number;
    name: string;
    vehicle_type: 'motor' | 'van' | 'truck';
    status: 'idle' | 'busy' | 'offline';
    current_lat: number;
    current_lng: number;
  }
  
  export interface Shipment {
    id: number;
    tracking_id: string;
    origin_address: string;
    destination_address: string;
    destination_lat: number;
    destination_lng: number;
    status: 'pending' | 'assigned' | 'in_transit' | 'delivered';
    price: number;
    driver_id?: number | null;
  }
  
  export interface AssignmentResponse {
    success: true;
    assignments: {
      driver_id: number;
      shipment_id: number;
    }[];
  }