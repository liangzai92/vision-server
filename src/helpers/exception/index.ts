import { ServiceStatusDetail } from './constant';
export { ServiceStatus } from './constant';

export class ServiceException extends Error {
  constructor(
    private readonly response: string | Record<string, any>,
    private readonly status?: number,
    private readonly options?: any,
  ) {
    super();
    this.initName();
  }

  public initName(): void {
    this.name = this.constructor.name;
  }

  public getResponse(): string | object {
    return this.response;
  }

  public getStatus(): number {
    return this.status;
  }
}

export const throwServiceException = (code, message?, error?) => {
  throw new ServiceException({
    code: code,
    message: message || ServiceStatusDetail[code]?.message || '非法操作',
    error: error,
  });
};
