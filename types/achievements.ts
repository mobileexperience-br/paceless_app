export interface Achievement {
  id: string;
  code: string;
  title: string;
  description: string | null;
  earnedAt: Date | null;
}
