import { randomUUID } from 'node:crypto';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { UploadedImage } from '@backendmasters/shared';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import { writeFailure } from '../../common/http/database-error.js';
import { SupabaseService } from '../../supabase/supabase.service.js';

export const IMAGE_BUCKET = 'article-covers';

const YEAR_IN_SECONDS = '31536000';

export interface ImageType {
  extension: string;
  contentType: string;
}

/**
 * Identifies an image from its first bytes. The name and type a client sends are ignored,
 * because they can claim anything. SVG is never accepted: it can carry scripts.
 */
export function detectImageType(file: Buffer): ImageType | null {
  const startsWith = (bytes: number[], offset = 0) =>
    bytes.every((byte, index) => file[offset + index] === byte);

  if (startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: 'png', contentType: 'image/png' };
  }
  if (startsWith([0xff, 0xd8, 0xff])) return { extension: 'jpg', contentType: 'image/jpeg' };
  if (startsWith([0x52, 0x49, 0x46, 0x46]) && startsWith([0x57, 0x45, 0x42, 0x50], 8)) {
    return { extension: 'webp', contentType: 'image/webp' };
  }
  return null;
}

@Injectable()
export class MediaService {
  constructor(private readonly supabase: SupabaseService) {}

  async uploadImage(admin: AdminContext, file: Buffer | undefined): Promise<UploadedImage> {
    if (!file?.length) throw new BadRequestException('Choose an image to upload');
    const type = detectImageType(file);
    if (!type) throw new BadRequestException('Only PNG, JPEG and WebP images are accepted');

    const storage = this.supabase.clientForUser(admin.accessToken).storage.from(IMAGE_BUCKET);
    // A random name, so uploads can be cached forever and can't overwrite one another.
    const path = `${new Date().getUTCFullYear()}/${randomUUID()}.${type.extension}`;
    const { error } = await storage.upload(path, file, {
      contentType: type.contentType,
      cacheControl: YEAR_IN_SECONDS,
      upsert: false,
    });
    if (error) throw writeFailure('Uploading an image', { message: error.message });

    return { url: storage.getPublicUrl(path).data.publicUrl };
  }
}
