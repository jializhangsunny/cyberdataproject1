export interface Organization {
  id: string;
  name: string;
  location: string;
  sector: string;
}

// Main OrganizationControls interface
export interface OrganizationControls {
  id: string;
  organization: string | Organization; // Can be just ID string or populated object
  controls: string[]; // Array of control names
  createdAt: string;   // ISO date string
  updatedAt: string;   // ISO date string
}

// For API responses that might include populated organization data
export interface OrganizationControlsPopulated {
  id: string;
  organization: Organization; // Always populated
  controls: string[];
  createdAt: string;
  updatedAt: string;
}

// For creating new organization controls (minimal required fields)
export interface CreateOrganizationControls {
  organization: string; // Organization ID
  controls?: string[];  // Optional, defaults to empty array
}

// For bulk operations
export interface BulkControlsRequest {
  controls: string[];
}

// For single control operations
export interface SingleControlRequest {
  controlName: string;
}

// For updating control names
export interface UpdateControlRequest {
  newControlName: string;
}

// API response types
export interface OrganizationControlsResponse {
  message: string;
  organizationControls: OrganizationControlsPopulated;
}

export interface BulkControlsResponse {
  message: string;
  addedControls: string[];
  organizationControls: OrganizationControlsPopulated;
}