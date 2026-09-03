export type DocType = "PRD" | "AGENTS" | "ARCHITECTURE" | "TODO" | "SKILL" | "WORKFLOW" | "README";
export interface ProjectFormData {
  name: string;
  summary: string;
  problemStatement: string;
  targetUser: string;
  goals: string[];
  features: string[];
  techStack?: string;
  constraints?: string;
  workflowTools?: string;
}
