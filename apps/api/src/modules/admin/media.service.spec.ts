import { BadRequestException } from '@nestjs/common';
import type { AdminContext } from '../../common/auth/admin.guard.js';
import type { SupabaseService } from '../../supabase/supabase.service.js';
import { detectImageType, MediaService } from './media.service.js';

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
const WEBP = Buffer.concat([
  Buffer.from('RIFF'),
  Buffer.from([0, 0, 0, 0]),
  Buffer.from('WEBPVP8 '),
]);
const ADMIN: AdminContext = { id: 'admin', accessToken: 'token' };

describe('detectImageType', () => {
  it('recognizes the accepted formats', () => {
    expect(detectImageType(PNG)?.contentType).toBe('image/png');
    expect(detectImageType(JPEG)?.contentType).toBe('image/jpeg');
    expect(detectImageType(WEBP)?.contentType).toBe('image/webp');
  });

  it.each([
    ['SVG', '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'],
    ['HTML', '<html><script>alert(1)</script></html>'],
    ['WAV, which is also RIFF', 'RIFF\0\0\0\0WAVEfmt '],
    ['an empty file', ''],
  ])('rejects %s', (_, content) => {
    expect(detectImageType(Buffer.from(content))).toBeNull();
  });
});

describe('MediaService', () => {
  function setup() {
    const storage = {
      upload: vi.fn(() => Promise.resolve({ error: null })),
      getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://cdn/${path}` } })),
    };
    const clientForUser = vi.fn(() => ({ storage: { from: () => storage } }));
    const service = new MediaService({ clientForUser } as unknown as SupabaseService);
    return { service, storage, clientForUser };
  }

  it('refuses a missing or disguised file without uploading', async () => {
    const { service, storage } = setup();
    await expect(service.uploadImage(ADMIN, undefined)).rejects.toThrow(BadRequestException);
    await expect(service.uploadImage(ADMIN, Buffer.from('<svg/>'))).rejects.toThrow(
      BadRequestException,
    );
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('uploads as the admin, under a random name, with the detected type', async () => {
    const { service, storage, clientForUser } = setup();
    const { url } = await service.uploadImage(ADMIN, PNG);

    expect(clientForUser).toHaveBeenCalledWith('token');
    expect(url).toMatch(/^https:\/\/cdn\/\d{4}\/[0-9a-f-]{36}\.png$/);
    expect(storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/\.png$/),
      PNG,
      expect.objectContaining({ contentType: 'image/png', upsert: false }),
    );
  });
});
