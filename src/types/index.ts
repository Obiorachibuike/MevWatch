
export type Attack = {
  id: string;
  type: 'Sandwich' | 'Time-based';
  victim: string;
  attacker: string;
  profit: number;
  timestamp: number;
  status: 'New' | 'Deduplicated';
};
