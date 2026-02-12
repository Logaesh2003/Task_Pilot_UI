export interface AiCardItem {
  title: string;
  meta?: string;
}

export interface AiStructuredResponse {
  type: 'plan';
  title: string;
  items: AiCardItem[];
  tip?: string;
}

export interface AiStructuredResponse {
  type: 'plan';
  title: string;
  items: {
    title: string;
    meta?: string;
  }[];
  tip?: string;

  followUps?: string[]; // 👈 NEW
}
