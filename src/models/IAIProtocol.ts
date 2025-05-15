export interface IAiProtocol {
    aiName: string;
    usageForm: string;
    affectedParts: string;
    remarks: string;
    _id?: string;              // optional, falls vom Backend zurückgegeben
    createdAt?: string;        // optional, falls du timestamps nutzt
    updatedAt?: string;
  }

  export interface AIResult {
    prompt?: string;
    text: string;
    modelVersion?: string;
    usageMetadata?: {
      promptTokenCount: number;
      candidatesTokenCount: number;
      totalTokenCount: number;
    };
  }