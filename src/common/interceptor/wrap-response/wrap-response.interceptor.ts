import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Response } from 'express';
import { map, Observable, tap } from 'rxjs';

export interface AppResponse<T> {
  data: T;
}

@Injectable()
export class WrapResponseInterceptor<T>
  implements NestInterceptor<T, AppResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<AppResponse<T>> {
    const response = context.switchToHttp().getResponse<Response>();
    const statusCode = response.statusCode;

    return next.handle().pipe(
      map((data) => ({
        data,
        statusCode,
      })),
    );
  }
}
