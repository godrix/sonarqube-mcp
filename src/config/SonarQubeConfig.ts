function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

export interface SonarQubeConfig {
  url: string;
  token: string;
  readOnly: boolean;
}

export function loadSonarQubeConfig(): SonarQubeConfig {
  const url = process.env.SONARQUBE_URL?.trim() || "https://sonarcloud.io";
  const token = process.env.SONARQUBE_TOKEN?.trim();

  if (!token) {
    throw new Error(
      "SONARQUBE_TOKEN not configured. Set environment variable."
    );
  }

  return {
    url: url.replace(/\/+$/, ""),
    token,
    readOnly: parseBoolean(process.env.SONARQUBE_READ_ONLY, false),
  };
}
