// Basic threat actor information
export interface ThreatActor {
  name: string;
  id: string;
}

// Threat actor exploit information
export interface ThreatActorExploit {
  id: string;
  threatActor: ThreatActor;
  attackPattern: string;
  cvssScore: number;
}

// Organization vulnerability information
export interface OrganizationVulnerability {
  id: string;
  affectedSystem: string;
  status: 'Active' | 'Patched' | 'In Progress';
  vulnerabilityLevel: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Very High';
}

// Main overlapping vulnerability structure
export interface OverlappingVulnerability {
  vulnerabilityId: string;
  organizationVulnerability: OrganizationVulnerability;
  threatActorExploits: ThreatActorExploit[];
}