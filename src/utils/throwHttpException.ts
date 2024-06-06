import { HttpException, HttpStatus } from '@nestjs/common';

export const throwHttpException = (error, status = HttpStatus.BAD_REQUEST) => {
  throw new HttpException(
    {
      message: '请求失败',
      error: error,
    },
    status,
  );
};
