export interface IAiProtocolEntry {
  aiName: string;
  usageForm: string;
  affectedParts: string;
  remarks: string;
  _id?: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AIResult {
  originalText?: string;
  text: string;
  prompt?: string;
  modelVersion?: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}
