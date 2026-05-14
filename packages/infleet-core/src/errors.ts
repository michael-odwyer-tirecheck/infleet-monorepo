export class InfleetApiError extends Error {
  constructor(
    public readonly status:   number,
    message:                  string,
    public readonly endpoint: string,
  ) {
    super(message);
    this.name = 'InfleetApiError';
  }
}

export class InfleetAuthError extends InfleetApiError {
  constructor(endpoint: string) {
    super(401, 'Unauthorised — check your API key', endpoint);
    this.name = 'InfleetAuthError';
  }
}

export class InfleetNotFoundError extends InfleetApiError {
  constructor(endpoint: string) {
    super(404, 'Resource not found', endpoint);
    this.name = 'InfleetNotFoundError';
  }
}

export class InfleetTimeoutError extends Error {
  constructor(endpoint: string) {
    super(`Request timed out: ${endpoint}`);
    this.name = 'InfleetTimeoutError';
  }
}
