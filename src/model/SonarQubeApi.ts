export interface SonarQubeWebServiceAction {
  key: string;
  description?: string;
  since?: string;
  deprecatedSince?: string;
  internal?: boolean;
  post?: boolean;
  hasResponseExample?: boolean;
}

export interface SonarQubeWebService {
  path: string;
  description?: string;
  since?: string;
  actions: SonarQubeWebServiceAction[];
}

export interface SonarQubeWebServicesListResponse {
  webServices: SonarQubeWebService[];
}

export interface SonarQubeWebServiceParameter {
  key: string;
  description?: string;
  required?: boolean;
  internal?: boolean;
  defaultValue?: string;
  exampleValue?: string;
  possibleValues?: string[];
  maximumLength?: number;
  maximumValue?: number;
}

export interface SonarQubeWebServiceShowResponse {
  path: string;
  description?: string;
  since?: string;
  action: string;
  post?: boolean;
  params?: SonarQubeWebServiceParameter[];
}

export interface SonarQubeApiCallOptions {
  controller: string;
  action: string;
  method?: "GET" | "POST";
  params?: Record<string, string | number | boolean | undefined>;
}

export interface SonarQubeApiEndpointSummary {
  controller: string;
  action: string;
  description: string;
  method: "GET" | "POST";
  readOnly: boolean;
}
