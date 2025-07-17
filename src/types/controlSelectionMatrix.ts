// export interface ControlSelectionData {
//   id?: string;
//   controlName: string;
//   includeInSet: boolean;
//   individualNRR: number;
//   totalCost: number;
//   individualInteractionEffect: number;
//   individualROSI: number;
// }

// export interface ControlSelectionMatrix {
//   id?: string;
//   userId: string;
//   user: {
//     id: string;
//   }
//   organizationId: string;
//   controlName: string;
//   includeInSet: boolean;
//   createdAt?: string;
//   updatedAt?: string;
// }

// export interface ControlSelectionMatrixResponse {
//   userId?: string;
//   userName?: string;
//   organizationId?: string;
//   organizationName?: string;
//   totalSelections: number;
//   selections: ControlSelectionMatrix[];
// }

// export interface ControlSelectionSummary {
//   organizationId: string;
//   organizationName: string;
//   totalControls: number;
//   selectedControls: number;
//   rejectedControls: number;
//   totalSelectedCost: number;
//   totalSelectedNRR: number;
//   totalSynergyEffect: number;
//   combinedROSI: number;
//   selections: ControlSelectionMatrix[];
// }

// export interface ControlSelectionMatrixProps {
//   controls: string[];
//   userId: string;
//   organizationId: string;
//   riskData: Array<{
//     control: string;
//     nrr: number;
//   }>;
//   costData: Array<{
//     control: string;
//     purchaseCost: number;
//     operationalCost: number;
//     trainingCost: number;
//     manpowerCost: number;
//   }>;
//   loading?: boolean;
// }

// export interface CreateControlSelectionRequest {
//   userId: string;
//   organizationId: string;
//   controlName: string;
//   includeInSet: boolean;
// }

// export interface UpdateControlSelectionRequest {
//   includeInSet: boolean;
// }

// types/controlSelectionMatrix.ts

export interface ControlSelectionData {
  id?: string;
  controlName: string;
  includeInSet: boolean;
  individualNRR: number;
  totalCost: number;
  individualInteractionEffect: number;
  individualROSI: number;
}

export interface ControlSelectionMatrix {
  id?: string;
  userId: string;
  organizationId: string;
  controlName: string;
  includeInSet: boolean;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string
  };
  onSelectionChange?: () => void;
}

export interface ControlSelectionMatrixResponse {
  userId?: string;
  userName?: string;
  organizationId?: string;
  organizationName?: string;
  totalSelections: number;
  selections: ControlSelectionMatrix[];
  onSelectionChange?: () => void;
}

export interface ControlSelectionSummary {
  organizationId: string;
  organizationName: string;
  totalControls: number;
  selectedControls: number;
  rejectedControls: number;
  totalSelectedCost: number;
  totalSelectedNRR: number;
  totalSynergyEffect: number;
  combinedROSI: number;
  selections: ControlSelectionMatrix[];
  onSelectionChange?: () => void;
}

export interface ControlSelectionMatrixProps {
  controls: string[];
  userId: string;
  organizationId: string;
  riskData: NetRiskReductionData[]; // Use the full NetRiskReductionData type
  costData: Array<{
    control: string;
    purchaseCost: number;
    operationalCost: number;
    trainingCost: number;
    manpowerCost: number;
    totalCost?: number;
  }>;
  loading?: boolean;
  onSelectionChange?: () => void;
}

// Add this import if not already present
import { NetRiskReductionData } from '@/types/netRiskReduction';

export interface CreateControlSelectionRequest {
  userId: string;
  organizationId: string;
  controlName: string;
  includeInSet: boolean;
}

export interface UpdateControlSelectionRequest {
  includeInSet: boolean;
}