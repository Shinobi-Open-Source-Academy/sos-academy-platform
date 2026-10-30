export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedPayload {
  color: number;
  title: string;
  description?: string;
  fields?: EmbedField[];
  footerText?: string;
}
