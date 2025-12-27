import axios, { AxiosInstance } from "axios";
import {
  SonarQubeProject,
  ProjectsResponse,
  IssuesResponse,
  MetricsResponse,
  SonarQubeQualityGate,
} from "../model/SonarQube.js";

export class SonarQubeService {
  private api: AxiosInstance;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.SONARQUBE_URL || "https://sonarcloud.io";
    const token = process.env.SONARQUBE_TOKEN;

    if (!token) {
      throw new Error(
        "SONARQUBE_TOKEN not configured. Set environment variable."
      );
    }

    // Convert token to Basic Auth format
    // Token: squ_47af748... → squ_47af748...: (add : at the end)
    // Then encode in base64
    const tokenWithColon = `${token}:`;
    const base64Token = Buffer.from(tokenWithColon).toString('base64');

    this.api = axios.create({
      baseURL: `${this.baseUrl}/api`,
      headers: {
        "Authorization": `Basic ${base64Token}`,
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * List all available projects in SonarQube
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 100)
   * @param query - Optional search query to filter projects by name
   */
  async getProjects(
    page: number = 1,
    pageSize: number = 100,
    query?: string
  ): Promise<ProjectsResponse> {
    try {
      const params: any = {
        qualifiers: "TRK",
        p: page,
        ps: pageSize,
      };

      if (query) {
        params.q = query;
      }

      const response = await this.api.get("/components/search", {
        params,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching projects");
    }
  }

  /**
   * Get details of a specific project
   */
  async getProjectDetails(projectKey: string): Promise<SonarQubeProject> {
    try {
      const response = await this.api.get("/components/show", {
        params: {
          component: projectKey,
        },
      });

      return response.data.component;
    } catch (error) {
      throw this.handleError(error, "Error fetching project details");
    }
  }

  /**
   * Search issues (problems) in a project
   */
  async getIssues(
    projectKey: string,
    options?: {
      severities?: string[];
      types?: string[];
      statuses?: string[];
      issueStatuses?: string[];
      branch?: string;
      createdAfter?: string;
      createdBefore?: string;
      assignees?: string[];
      tags?: string[];
      page?: number;
      pageSize?: number;
    }
  ): Promise<IssuesResponse> {
    try {
      const params: any = {
        projects: projectKey,
        p: options?.page || 1,
        ps: options?.pageSize || 100,
      };

      if (options?.severities && options.severities.length > 0) {
        params.severities = options.severities.join(",");
      }

      if (options?.types && options.types.length > 0) {
        params.types = options.types.join(",");
      }

      if (options?.statuses && options.statuses.length > 0) {
        params.statuses = options.statuses.join(",");
      }

      if (options?.issueStatuses && options.issueStatuses.length > 0) {
        params.issueStatuses = options.issueStatuses.join(",");
      }

      if (options?.branch) {
        params.branch = options.branch;
      }

      if (options?.createdAfter) {
        params.createdAfter = options.createdAfter;
      }

      if (options?.createdBefore) {
        params.createdBefore = options.createdBefore;
      }

      if (options?.assignees && options.assignees.length > 0) {
        params.assignees = options.assignees.join(",");
      }

      if (options?.tags && options.tags.length > 0) {
        params.tags = options.tags.join(",");
      }

      const response = await this.api.get("/issues/search", { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching issues");
    }
  }

  /**
   * Get code quality metrics for a project
   */
  async getMetrics(
    projectKey: string,
    metricKeys: string[]
  ): Promise<MetricsResponse> {
    try {
      const response = await this.api.get("/measures/component", {
        params: {
          component: projectKey,
          metricKeys: metricKeys.join(","),
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching metrics");
    }
  }

  /**
   * Get Quality Gate status for a project
   */
  async getQualityGateStatus(
    projectKey: string
  ): Promise<SonarQubeQualityGate> {
    try {
      const response = await this.api.get("/qualitygates/project_status", {
        params: {
          projectKey: projectKey,
        },
      });

      return response.data.projectStatus;
    } catch (error) {
      throw this.handleError(error, "Error fetching Quality Gate status");
    }
  }

  /**
   * Busca análises (histórico) de um projeto
   */
  async getProjectAnalyses(
    projectKey: string,
    page: number = 1,
    pageSize: number = 100
  ): Promise<any> {
    try {
      const response = await this.api.get("/project_analyses/search", {
        params: {
          project: projectKey,
          p: page,
          ps: pageSize,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching project analyses");
    }
  }

  /**
   * Busca Security Hotspots de um projeto
   */
  async getHotspots(
    projectKey: string,
    options?: {
      branch?: string;
      status?: string;
      resolution?: string;
      inNewCodePeriod?: boolean;
      onlyMine?: boolean;
      files?: string[];
      page?: number;
      pageSize?: number;
    }
  ): Promise<any> {
    try {
      const params: any = {
        project: projectKey,
        p: options?.page || 1,
        ps: options?.pageSize || 100,
      };

      if (options?.branch) {
        params.branch = options.branch;
      }

      if (options?.status) {
        params.status = options.status;
      }

      if (options?.resolution) {
        params.resolution = options.resolution;
      }

      if (options?.inNewCodePeriod) {
        params.inNewCodePeriod = options.inNewCodePeriod;
      }

      if (options?.onlyMine) {
        params.onlyMine = options.onlyMine;
      }

      if (options?.files && options.files.length > 0) {
        params.files = options.files.join(",");
      }

      const response = await this.api.get("/hotspots/search", { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching security hotspots");
    }
  }

  /**
   * Get details of a specific Security Hotspot
   */
  async getHotspotDetails(hotspotKey: string): Promise<any> {
    try {
      const response = await this.api.get("/hotspots/show", {
        params: {
          hotspot: hotspotKey,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching hotspot details");
    }
  }

  /**
   * Busca duplicações de código em um arquivo
   */
  async getDuplications(fileKey: string): Promise<any> {
    try {
      const response = await this.api.get("/duplications/show", {
        params: {
          key: fileKey,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching duplications");
    }
  }

  /**
   * Get source code of a file with line numbers
   */
  async getSourceCode(
    fileKey: string,
    from?: number,
    to?: number
  ): Promise<any> {
    try {
      const params: any = {
        key: fileKey,
      };

      if (from) {
        params.from = from;
      }

      if (to) {
        params.to = to;
      }

      const response = await this.api.get("/sources/show", { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching source code");
    }
  }

  /**
   * Get details of a specific rule
   */
  async getRuleDetails(ruleKey: string): Promise<any> {
    try {
      const response = await this.api.get("/rules/show", {
        params: {
          key: ruleKey,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching rule details");
    }
  }

  /**
   * Lista branches de um projeto
   */
  async getProjectBranches(projectKey: string): Promise<any> {
    try {
      const response = await this.api.get("/project_branches/list", {
        params: {
          project: projectKey,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error, "Error fetching project branches");
    }
  }

  /**
   * Trata erros da API
   */
  private handleError(error: any, message: string): Error {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const errorMessage = error.response?.data?.errors?.[0]?.msg || error.message;

      if (status === 401) {
        return new Error(
          `${message}: Token inválido ou expirado. Verifique SONARQUBE_TOKEN.`
        );
      }

      if (status === 403) {
        return new Error(`${message}: Acesso negado. Verifique as permissões.`);
      }

      if (status === 404) {
        return new Error(`${message}: Recurso não encontrado.`);
      }

      return new Error(`${message}: ${errorMessage}`);
    }

    return new Error(`${message}: ${error.message}`);
  }
}

