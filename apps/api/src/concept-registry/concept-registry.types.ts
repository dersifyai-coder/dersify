export interface ConceptRegistryEntry {
  canonicalId: string;
  displayName: string;
  topic: string;
  aliases: string[];
  prerequisites: string[];
  related: string[];
  status: string;
  sessionCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResolveResult {
  canonicalId: string;
  isNew: boolean;
  merged: boolean;
}
