export interface GitLabEvent {
  id: number;
  project_id: number;
  action_name: string;
  target_type: string | null;
  target_id: number | null;
  target_iid?: number | null;
  target_title?: string | null;
  created_at: string;
  author: {
    id: number;
    username: string;
    name: string;
  };
  push_data?: {
    commit_count?: number;
    action?: string;
    ref_type?: string;
    commit_from?: string;
    commit_to?: string;
    ref?: string;
    commit_title?: string;
  };
  target?: {
    id?: number;
    title?: string;
    name?: string;
    web_url?: string;
  };
  note?: {
    body?: string;
  };
  repository?: {
    name?: string;
  };
}

export interface ProjectActivity {
  projectId: number;
  projectName: string;
  projectPath?: string; // path_with_namespace для формирования URL
  events: GitLabEvent[];
  activityTypes: Record<string, number>;
}

export interface SavedConnection {
  id: string;
  url: string;
  token: string;
  label: string;
}
