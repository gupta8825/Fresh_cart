// Story stage metadata (dependency-free so the homepage section can import
// it without pulling Three.js into the main bundle).
export const STAGES = [
  { id: "customerOrder", label: "Customer places an order", sub: "Your everyday essentials, just a tap away!" },
  { id: "storePreparation", label: "Store prepares the order", sub: "Order Confirmed → Packing Your Order" },
  { id: "packageHandover", label: "Partner collects the bag", sub: "Ready for Delivery" },
  { id: "deliveryJourney", label: "On the way!", sub: "Your order is on its way!" },
  { id: "customerDelivery", label: "Doorstep handover", sub: "FreshCart bag handed over" },
  { id: "happyCelebration", label: "Delivered Successfully!", sub: "Happy Customers, Happy Deliveries!" },
  { id: "nextCustomerOrder", label: "Another happy customer!", sub: "A new order begins" },
  { id: "loopReset", label: "Fresh loop", sub: "The story starts over" },
];
