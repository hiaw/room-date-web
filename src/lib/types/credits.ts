export interface CreditValidationResult {
  isValid: boolean;
  error?: string;
  requiredCredits?: number;
  availableCredits?: number;
  shortfall?: number;
}

export interface CreditBalance {
  availableCredits: number;
  heldCredits: number;
  totalPurchased: number;
  totalUsed: number;
}

export interface ModalState {
  show: boolean;
  requiredCredits: number;
}
