export interface SonarQubeProject {
  key: string;
  name: string;
  qualifier: string;
  visibility: string;
  lastAnalysisDate?: string;
}

export interface SonarQubeIssue {
  key: string;
  rule: string;
  severity: string;
  component: string;
  project: string;
  line?: number;
  message: string;
  author?: string;
  status: string;
  type: string;
  creationDate: string;
  updateDate: string;
}

export interface SonarQubeMeasure {
  metric: string;
  value?: string;
  component: string;
  bestValue?: boolean;
}

export interface SonarQubeMetrics {
  component: string;
  measures: SonarQubeMeasure[];
}

export interface SonarQubeQualityGate {
  name: string;
  status: string;
  conditions?: QualityGateCondition[];
}

export interface QualityGateCondition {
  status: string;
  metricKey: string;
  comparator: string;
  errorThreshold?: string;
  actualValue?: string;
}

export type ProjectsResponse = {
  paging: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  components: SonarQubeProject[];
};

export type IssuesResponse = {
  total: number;
  p: number;
  ps: number;
  paging: {
    pageIndex: number;
    pageSize: number;
    total: number;
  };
  issues: SonarQubeIssue[];
};

export type MetricsResponse = SonarQubeMetrics;

