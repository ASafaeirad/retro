export interface Session {
  _id: string;
  sprintNumber: number;
  phase: string;
  participantCount: number;
  createdBy: string;
  isActive: boolean;
}
