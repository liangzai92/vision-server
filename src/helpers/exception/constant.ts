// 10011 用户还没有设置过密码
// 10012
//  232 You do not have permission to access this directory.

export enum ServiceStatus {
  UserNotFound = 1001,
  UserNoPassword = 10011,
  UserNameOrPasswordError = 10012,
  InvalidCredentials = 1002,
  EmailAlreadyExists = 1003,
  UsernameAlreadyExists = 1004,
  PasswordTooWeak = 1005,
  SessionExpired = 1006,
  AccessDenied = 1007,
  ResourceExhausted = 1008,
  RateLimitExceeded = 1009,
  ItemNotFound = 1010,
  OperationFailed = 1011,
  PaymentRequired = 1012,
  PaymentFailed = 1013,
  ValidationError = 1014,
  PermissionDenied = 10144,
  DatabaseError = 1015,
  ExternalServiceError = 1016,
  VersionAlreadyPresent = 1017,
  OwnerNoNeedToShare = 1018,
}

export const ServiceStatusDetail = {
  [ServiceStatus.UserNotFound]: {
    message: '用户未找到',
  },
  [ServiceStatus.UserNoPassword]: {
    message: '用户还没有设置过密码',
  },
  [ServiceStatus.UserNameOrPasswordError]: {
    message: 'Invalid username or password',
  },
  [ServiceStatus.InvalidCredentials]: {
    message: '无效的凭证',
  },
  [ServiceStatus.PermissionDenied]: {
    message: '没有权限',
  },
  [ServiceStatus.EmailAlreadyExists]: {
    message: '邮箱已存在',
  },
  [ServiceStatus.UsernameAlreadyExists]: {
    message: '用户名已存在',
  },
  [ServiceStatus.PasswordTooWeak]: {
    message: '密码强度不够',
  },
  [ServiceStatus.SessionExpired]: {
    message: '会话已过期',
  },
  [ServiceStatus.AccessDenied]: {
    message: '访问被拒绝',
  },
  [ServiceStatus.ResourceExhausted]: {
    message: '资源已耗尽',
  },
  [ServiceStatus.RateLimitExceeded]: {
    message: '超出请求限制',
  },
  [ServiceStatus.ItemNotFound]: {
    message: '项目未找到',
  },
  [ServiceStatus.OperationFailed]: {
    message: '操作失败',
  },
  [ServiceStatus.PaymentRequired]: {
    message: '需要支付',
  },
  [ServiceStatus.PaymentFailed]: {
    message: '支付失败',
  },
  [ServiceStatus.ValidationError]: {
    message: '数据验证失败',
  },
  [ServiceStatus.DatabaseError]: {
    message: '数据库错误',
  },
  [ServiceStatus.ExternalServiceError]: {
    message: '外部服务错误',
  },
  [ServiceStatus.VersionAlreadyPresent]: {
    message: '数据库里已经存在该版本了，请修改后重新提交',
  },
  [ServiceStatus.OwnerNoNeedToShare]: {
    message: '您是项目的主人，无需再分享给自己',
  },
};
