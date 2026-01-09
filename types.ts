
export interface VarLink {
  id: string;
  name: string;
  url: string;
  variables: string[];
  createdAt: number;
  order: number;
}

export type NewVarLink = Omit<VarLink, 'id' | 'createdAt' | 'order'>;
