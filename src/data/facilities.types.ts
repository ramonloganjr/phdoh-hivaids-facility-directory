export type RegionCode =
  | "CAR" | "R1" | "R2" | "R3" | "R4A" | "R4B" | "R5"
  | "R6" | "R7" | "R8" | "NIR" | "R9" | "R10" | "R11"
  | "R12" | "R13" | "NCR" | "BARMM";

export type ServiceType = "Treatment Hub" | "Primary HIV Care Facility";

export type Contact = { role: string; name: string };

export type Facility = {
  id: string;
  num: number;
  name: string;
  region: RegionCode;
  serviceType: ServiceType;
  inpatient: boolean;
  address: string;
  contacts: Contact[];
  mobiles: string[];
  landlines: string[];
  emails: string[];
  facebook: string[];
  extra: string[];
};
