export interface DestinationType {
  id: string;
  name: string;
  address: string;
  information: string;
  latitude: number;
  longitude: number;
  category: string;
  recomm?: number;
}

export interface CountType {
  count: number;
}
