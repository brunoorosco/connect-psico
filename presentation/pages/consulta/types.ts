export type SummaryResult = {
  overview: string;
  highlights: {
    positives: string[];
    negatives: string[];
  };
  next_steps: string[];
  alerts: string[];
};
