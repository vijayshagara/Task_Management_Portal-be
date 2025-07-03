export interface ITask {
  id?: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  developerId: string;
}

export interface ITaskUpdate {
  status?: 'pending' | 'in_progress' | 'completed';
}