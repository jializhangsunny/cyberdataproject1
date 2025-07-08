import { OverlappingVulnerability } from "./vulnerabilities";

export interface NetRiskReductionData {
  id?: string;
  vulnerabilityId: string;
  control: string;
  riskReductionDegree: number;
  newVulnerabilityPossibility: number;
  potentialNewRisks: number;
  nrr?: number; // calculated value
}

export interface VulnerabilityControlMappingProps {
  overlappingVulnerabilities: OverlappingVulnerability[];
  controls: string[];
  userId: string;
  organizationId: string;
  totalRisk: number;
  loading?: boolean;
}

// API request/response types
export interface CreateNetRiskReductionRequest {
  userId: string;
  organizationId: string;
  vulnerabilityId: string;
  control: string;
  riskReductionDegree: number;
  newVulnerabilityPossibility: number;
  potentialNewRisks: number;
}

export interface UpdateNetRiskReductionRequest {
  control?: string;
  riskReductionDegree?: number;
  newVulnerabilityPossibility?: number;
  potentialNewRisks?: number;
}

export interface NetRiskReductionResponse {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  organization: {
    id: string;
    name: string;
    location: string;
    sector: string;
  };
  vulnerabilityId: string;
  control: string;
  riskReductionDegree: number;
  newVulnerabilityPossibility: number;
  potentialNewRisks: number;
  createdAt: string;
  updatedAt: string;
}