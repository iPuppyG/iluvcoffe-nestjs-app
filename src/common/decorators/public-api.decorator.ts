import { SetMetadata } from '@nestjs/common';

export const Is_PUBLIC_API_KEY = 'isPublic';
export const PublicAPI = () => SetMetadata(Is_PUBLIC_API_KEY, true);
