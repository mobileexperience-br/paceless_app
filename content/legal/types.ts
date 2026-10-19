export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  closing?: string[];
}

export interface LegalContent {
  title: string;
  updatedAt: string;
  sections: LegalSection[];
}
