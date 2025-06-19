// src/types/task.ts

export type Task = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  createdBy: string;
  isPublic?: boolean;
};
