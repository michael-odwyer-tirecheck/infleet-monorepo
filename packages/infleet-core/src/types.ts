// All domain types derived from INFLEET Customer Friendly API OpenAPI 3.1.0 spec (v1.17.0)
// Base URL: https://infleet.tirecheck.com/api/public

export type TireArea =
  | 'rollingStock'
  | 'fleetStock'
  | 'outOfStock'
  | 'service'
  | 'tyreHotel'
  | 'forRetread'
  | 'forScrap'
  | 'damagedStock';

export interface TreadDepths {
  groove1?: number;
  groove2?: number;
  groove3?: number;
  groove4?: number;
  groove5?: number;
}

export interface MountedDevice {
  type: string;
  id:   string;
}

export interface Defect {
  name:     string;
  severity: string;
}

export interface RecommendedPressure {
  axle:     number;
  pressure: number;
}

export interface WheelPosition {
  tireId?:              string;
  position?:            number;
  tireSerialNumber?:    string;
  remainingTreadDepth?: number;
  treadDepths?:         TreadDepths;
  initialTreadDepth?:   number;
  originalTreadDepth?:  number;
  pressure?:            number;
  lastTPMSUpdate?:      string;
  openDefects?:         Defect[];
  origin?:              string;
  DOT?:                 string;
  tireMileage?:         number;
  initialMileage?:      number;
  mountMileage?:        number;
  regrooved?:           boolean;
  retreaded?:           boolean;
  monitored?:           boolean;
  tireProduct?:         string;
  size?:                string;
  tireMake?:            string;
  tirePattern?:         string;
}

export interface Vehicle {
  vehicleId:            string;
  company?:             string;
  fleet?:               string;
  registrationNumber?:  string;
  vin?:                 string;
  fleetNumber?:         string;
  axleConfiguration?:   string;
  schemaName?:          string;
  creationDate?:        string;
  lastSeenDate?:        string;
  vehicleStatus?:       string;
  vehicleMake?:         string;
  vehicleModel?:        string;
  vehicleUsage?:        string;
  vehicleType?:         string;
  vehicleInformation?:  string;
  mileage?:             number;
  hours?:               number;
  lastTPMSReading?:     string;
  mountedDevices?:      MountedDevice[];
  wheelPositions?:      WheelPosition[];
  openVehicleDefects?:  Defect[];
  recommendedPressure?: RecommendedPressure[];
}

export interface Tire {
  tireId?:              string;
  company?:             string;
  fleet?:               string;
  tireSerialNumber?:    string;
  sensorId?:            string;
  creationDate?:        string;
  tireArea?:            TireArea;
  remainingTreadDepth?: number;
  treadDepths?:         TreadDepths;
  initialTreadDepth?:   number;
  pressure?:            number;
  lastTPMSUpdate?:      string;
  openDefects?:         Defect[];
  origin?:              string;
  DOT?:                 string;
  tireMileage?:         number;
  initialMileage?:      number;
  mountMileage?:        number;
  regrooved?:           boolean;
  retreaded?:           boolean;
  monitored?:           boolean;
  tireProduct?:         string;
  size?:                string;
  tireMake?:            string;
  tirePattern?:         string;
  originalTreadDepth?:  number;
}

export interface VehicleHistoryEvent {
  type:                      string;
  date:                      string;
  vehicleId?:                string;
  company?:                  string;
  fleet?:                    string;
  registrationNumber?:       string;
  vin?:                      string;
  fleetNumber?:              string;
  axleConfiguration?:        string;
  schemaName?:               string;
  creationDate?:             string;
  lastSeenDate?:             string;
  vehicleStatus?:            string;
  vehicleMake?:              string;
  vehicleModel?:             string;
  vehicleUsage?:             string;
  vehicleType?:              string;
  vehicleInformation?:       string;
  mileage?:                  number;
  hours?:                    number;
  lastTPMSReading?:          string;
  mountedDevices?:           MountedDevice[];
  dismountedDevices?:        MountedDevice[];
  wheelPositions?:           WheelPosition[];
  dismountedWheelPositions?: WheelPosition[];
  openVehicleDefects?:       Defect[];
  recommendedPressure?:      RecommendedPressure[];
}

// Query param shapes matching the API exactly
export interface VehicleQueryParams {
  company?:      string;
  fleet?:        string;
  reg?:          string;
  vin?:          string;
  fleet_number?: string;
  date?:         string;
}

export interface TireQueryParams {
  company?:          string;
  fleet?:            string;
  tireSerialNumber?: string;
  tireArea?:         TireArea;
  sensorId?:         string;
  tireProduct?:      string;
}

export interface VehicleHistoryQueryParams {
  vehicleid?:   string;
  company?:     string;
  fleet?:       string;
  reg?:         string;
  vin?:         string;
  fleetNumber?: string;
  date?:        string;
}
