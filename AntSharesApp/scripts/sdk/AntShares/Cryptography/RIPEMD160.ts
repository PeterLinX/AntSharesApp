namespace AntShares.Cryptography
{
    export class RIPEMD160
    {
        // constants table
        private static zl = [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
            7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
            3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
            1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
            4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
        ];

        private static zr = [
            5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
            6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
            15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
            8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
            12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
        ];

        private static sl = [
            11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
            7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
            11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
            11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
            9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
        ];

        private static sr = [
            8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
            9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
            9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
            15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
            8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
        ];

        private static hl = [0x00000000, 0x5A827999, 0x6ED9EBA1, 0x8F1BBCDC, 0xA953FD4E];
        private static hr = [0x50A28BE6, 0x5C4DD124, 0x6D703EF3, 0x7A6D76E9, 0x00000000];

        private static bytesToWords(bytes)
        {
            let words = [];
            for (let i = 0, b = 0; i < bytes.length; i++ , b += 8)
            {
                words[b >>> 5] |= bytes[i] << (24 - b % 32);
            }
            return words;
        }

        private static wordsToBytes(words)
        {
            let bytes = [];
            for (let b = 0; b < words.length * 32; b += 8)
            {
                bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
            }
            return bytes;
        }

        private static processBlock(H, M, offset)
        {
            // swap endian
            for (let i = 0; i < 16; i++)
            {
                let offset_i = offset + i;
                let M_offset_i = M[offset_i];

                // Swap
                M[offset_i] = (
                    (((M_offset_i << 8) | (M_offset_i >>> 24)) & 0x00ff00ff) |
                    (((M_offset_i << 24) | (M_offset_i >>> 8)) & 0xff00ff00)
                );
            }

            // Working variables
            let al, bl, cl, dl, el;
            let ar, br, cr, dr, er;

            ar = al = H[0];
            br = bl = H[1];
            cr = cl = H[2];
            dr = dl = H[3];
            er = el = H[4];

            // computation
            let t;
            for (let i = 0; i < 80; i += 1)
            {
                t = (al + M[offset + RIPEMD160.zl[i]]) | 0;
                if (i < 16)
                {
                    t += RIPEMD160.f1(bl, cl, dl) + RIPEMD160.hl[0];
                } else if (i < 32)
                {
                    t += RIPEMD160.f2(bl, cl, dl) + RIPEMD160.hl[1];
                } else if (i < 48)
                {
                    t += RIPEMD160.f3(bl, cl, dl) + RIPEMD160.hl[2];
                } else if (i < 64)
                {
                    t += RIPEMD160.f4(bl, cl, dl) + RIPEMD160.hl[3];
                } else // if (i<80)
                {
                    t += RIPEMD160.f5(bl, cl, dl) + RIPEMD160.hl[4];
                }
                t = t | 0;
                t = RIPEMD160.rotl(t, RIPEMD160.sl[i]);
                t = (t + el) | 0;
                al = el;
                el = dl;
                dl = RIPEMD160.rotl(cl, 10);
                cl = bl;
                bl = t;

                t = (ar + M[offset + RIPEMD160.zr[i]]) | 0;
                if (i < 16)
                {
                    t += RIPEMD160.f5(br, cr, dr) + RIPEMD160.hr[0];
                } else if (i < 32)
                {
                    t += RIPEMD160.f4(br, cr, dr) + RIPEMD160.hr[1];
                } else if (i < 48)
                {
                    t += RIPEMD160.f3(br, cr, dr) + RIPEMD160.hr[2];
                } else if (i < 64)
                {
                    t += RIPEMD160.f2(br, cr, dr) + RIPEMD160.hr[3];
                } else // if (i<80)
                {
                    t += RIPEMD160.f1(br, cr, dr) + RIPEMD160.hr[4];
                }

                t = t | 0;
                t = RIPEMD160.rotl(t, RIPEMD160.sr[i]);
                t = (t + er) | 0;
                ar = er;
                er = dr;
                dr = RIPEMD160.rotl(cr, 10);
                cr = br;
                br = t;
            }

            // intermediate hash value
            t = (H[1] + cl + dr) | 0;
            H[1] = (H[2] + dl + er) | 0;
            H[2] = (H[3] + el + ar) | 0;
            H[3] = (H[4] + al + br) | 0;
            H[4] = (H[0] + bl + cr) | 0;
            H[0] = t;
        }

        private static f1(x, y, z) { return ((x) ^ (y) ^ (z)); }
        private static f2(x, y, z) { return (((x) & (y)) | ((~x) & (z))); }
        private static f3(x, y, z) { return (((x) | (~(y))) ^ (z)); }
        private static f4(x, y, z) { return (((x) & (z)) | ((y) & (~(z)))); }
        private static f5(x, y, z) { return ((x) ^ ((y) | (~(z)))); }
        private static rotl(x, n) { return (x << n) | (x >>> (32 - n)); }

        public static computeHash(data: ArrayBuffer | ArrayBufferView): ArrayBuffer
        {
            let H = [0x67452301, 0xEFCDAB89, 0x98BADCFE, 0x10325476, 0xC3D2E1F0];
            let m = RIPEMD160.bytesToWords(Uint8Array.fromArrayBuffer(data));
            let nBitsLeft = data.byteLength * 8;
            let nBitsTotal = data.byteLength * 8;

            // Add padding
            m[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
            m[(((nBitsLeft + 64) >>> 9) << 4) + 14] = (
                (((nBitsTotal << 8) | (nBitsTotal >>> 24)) & 0x00ff00ff) |
                (((nBitsTotal << 24) | (nBitsTotal >>> 8)) & 0xff00ff00)
            );

            for (let i = 0; i < m.length; i += 16)
            {
                RIPEMD160.processBlock(H, m, i);
            }

            // swap endian
            for (let i = 0; i < 5; i++)
            {
                // shortcut
                let H_i = H[i];

                // Swap
                H[i] = (((H_i << 8) | (H_i >>> 24)) & 0x00ff00ff) |
                    (((H_i << 24) | (H_i >>> 8)) & 0xff00ff00);
            }

            let digestbytes = RIPEMD160.wordsToBytes(H);
            return new Uint8Array(digestbytes).buffer;
        }
    }
}
