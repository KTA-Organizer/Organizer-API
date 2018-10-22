export interface Config {
  sessionSecret: string;
  port: number;
  url: string;
  mysql: {
    host?: string,
    port?: number,
    user: string,
    password: string,
    database: string
  };
  gcloud: {
    sqlInstance?: string,
    buckets: {
      frontend: string
    }
  };
  email: {
    from: string,
    smtp: {
      host: string,
      port: number,
      user: string
      password: string
    }
  };
}