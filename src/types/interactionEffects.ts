export interface InteractionEffect {
  id?: string;
  organizationId: string;
  controlA: string;
  controlB: string;
  interactionEffect: number;
  description?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InteractionMatrix {
  [controlA: string]: {
    [controlB: string]: number | null;
  };
}

export interface InteractionMatrixResponse {
  organizationId: string;
  organizationName: string;
  controls: string[];
  interactionMatrix: InteractionMatrix;
  totalInteractions: number;
  interactions: InteractionEffect[];
}

export interface ControlInteractionSummary {
  controlName: string;
  totalInteractions: number;
  totalPositiveEffect: number;
  totalNegativeEffect: number;
  netInteractionEffect: number;
  interactions: Array<{
    otherControl: string;
    effect: number;
    description?: string;
  }>;
}

export interface InteractionEffectsAnalysisProps {
  controls: string[];
  organizationId: string;
  userId: string;
  loading?: boolean;
}

export interface CreateInteractionEffectRequest {
  organizationId: string;
  controlA: string;
  controlB: string;
  interactionEffect: number;
  description?: string;
  userId: string;
}

export interface UpdateInteractionEffectRequest {
  interactionEffect: number;
  description?: string;
}