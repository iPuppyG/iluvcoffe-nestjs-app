import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata) {
    const val = parseInt(value, 10);
    // if value is not a number throw a bad request
    if (isNaN(val)) {
      throw new BadRequestException(
        `Validation failed: ${value} is not a integer`,
      );
    }
    return val;
  }
}
