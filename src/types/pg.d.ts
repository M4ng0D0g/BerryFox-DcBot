declare module 'pg' {
  export class Pool {
    constructor(opts?: any);
    connect(): Promise<any>;
  }
}
