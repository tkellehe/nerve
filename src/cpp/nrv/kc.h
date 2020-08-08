#ifndef __NRV__KC_H__
#define __NRV__KC_H__

#include <nrv/f16.h>
#include <math.h>
#include <string.h>

#ifdef __cplusplus
extern "C" {
#endif

// KC2 can only not encode 144 different values of 256.
const uint8_t __nrv_kc2_mapping[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 9, 11, 12, 13, 14, 15, 16, 17, 32, 34, 20, 21, 22, 23, 24, 40, 26, 42, 28, 29, 30, 31, 18, 44, 19, 46, 47, 48, 52, 56, 25, 58, 27, 60, 33, 61, 35, 36, 37, 62, 63, 64, 38, 65, 67, 69, 39, 71, 41, 79, 43, 45, 49, 50, 51, 53, 80, 54, 81, 55, 84, 57, 85, 87, 88, 92, 93, 94, 95, 59, 66, 68, 96, 97, 70, 72, 104, 73, 74, 112, 113, 116, 75, 76, 77, 78, 82, 83, 117, 120, 121, 122, 124, 125, 86, 126, 106, 107, 108, 109, 110, 111, 89, 90, 114, 115, 91, 98, 118, 119, 99, 100, 101, 123, 102, 103, 105, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255};
// KC3 can only not encode 28 different values of 256.
const uint8_t __nrv_kc3_mapping[] = {48, 49, 51, 56, 57, 60, 99, 103, 113, 115, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 0, 1, 50, 2, 52, 53, 54, 55, 3, 4, 58, 59, 5, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 6, 100, 101, 102, 7, 104, 105, 106, 107, 108, 109, 110, 111, 112, 8, 114, 9, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255};
const uint8_t __nrv_kc4_mapping[] = {0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 188, 189, 190, 191, 192, 193, 194, 195, 196, 197, 198, 199, 200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246, 247, 248, 249, 250, 251, 252, 253, 254, 255};

const f32_t NRV_KC_N2K40_ALPHA0 = 31.41592653589793f; // 5 * 2 * PI -> ns[0] * omega -> omega = 2 * PI / L -> L = 1.0
const f32_t NRV_KC_N2K40_ALPHA1 = 62.83185307179586f; // 10 * 2 * PI
typedef struct {
    uint8_t cache[256]; // each byte already looked up during training.
} nrv_kc_t;


void nrv_kc_update(nrv_kc_t* kc, f32_t p0, f32_t p1, f32_t p2, f32_t p3, f32_t p4, f32_t p5, f32_t p6, f32_t p7)
{
    uint8_t check;
    // set all to zero then set the bits based on the p0s
    memset(kc, 0, sizeof(nrv_kc_t));
    check = (uint8_t)(p0 > 0.0f);
    for(int i = 1; i < 256; i += 2)
    {
        kc->cache[i] |= check;
    }
    check = (uint8_t)(p1 > 0.0f) << 1;
    for(int i = 2; i < 256; i += 4)
    {
        kc->cache[i] |= check;
        kc->cache[i+1] |= check;
    }
    check = (uint8_t)(p2 > 0.0f) << 2;
    for(int i = 4; i < 256; i += 8)
    {
        kc->cache[i] |= check;
        kc->cache[i+1] |= check;
        kc->cache[i+2] |= check;
        kc->cache[i+3] |= check;
    }
    check = (uint8_t)(p3 > 0.0f) << 3;
    for(int i = 8; i < 256; i += 16)
    {
        kc->cache[i] |= check;
        kc->cache[i+1] |= check;
        kc->cache[i+2] |= check;
        kc->cache[i+3] |= check;
        kc->cache[i+4] |= check;
        kc->cache[i+5] |= check;
        kc->cache[i+6] |= check;
        kc->cache[i+7] |= check;
    }
    check = (uint8_t)(p4 > 0.0f) << 4;
    for(int i = 16; i < 256; i += 32)
    {
        kc->cache[i] |= check;
        kc->cache[i+1] |= check;
        kc->cache[i+2] |= check;
        kc->cache[i+3] |= check;
        kc->cache[i+4] |= check;
        kc->cache[i+5] |= check;
        kc->cache[i+6] |= check;
        kc->cache[i+7] |= check;
        kc->cache[i+8] |= check;
        kc->cache[i+9] |= check;
        kc->cache[i+10] |= check;
        kc->cache[i+11] |= check;
        kc->cache[i+12] |= check;
        kc->cache[i+13] |= check;
        kc->cache[i+14] |= check;
        kc->cache[i+15] |= check;
    }
    check = (uint8_t)(p5 > 0.0f) << 5;
    for(int i = 32; i < 256; i += 64)
    {
        kc->cache[i] |= check;
        kc->cache[i+1] |= check;
        kc->cache[i+2] |= check;
        kc->cache[i+3] |= check;
        kc->cache[i+4] |= check;
        kc->cache[i+5] |= check;
        kc->cache[i+6] |= check;
        kc->cache[i+7] |= check;
        kc->cache[i+8] |= check;
        kc->cache[i+9] |= check;
        kc->cache[i+10] |= check;
        kc->cache[i+11] |= check;
        kc->cache[i+12] |= check;
        kc->cache[i+13] |= check;
        kc->cache[i+14] |= check;
        kc->cache[i+15] |= check;
        kc->cache[i+16] |= check;
        kc->cache[i+17] |= check;
        kc->cache[i+18] |= check;
        kc->cache[i+19] |= check;
        kc->cache[i+20] |= check;
        kc->cache[i+21] |= check;
        kc->cache[i+22] |= check;
        kc->cache[i+23] |= check;
        kc->cache[i+24] |= check;
        kc->cache[i+25] |= check;
        kc->cache[i+26] |= check;
        kc->cache[i+27] |= check;
        kc->cache[i+28] |= check;
        kc->cache[i+29] |= check;
        kc->cache[i+30] |= check;
        kc->cache[i+31] |= check;
    }
    check = (uint8_t)(p6 > 0.0f) << 6;
    for(int i = 64; i < 256; i += 128)
    {
        for(int j = 0; j < 64; ++j)
        {
            kc->cache[i+j] |= check;
        }
    }
    check = (uint8_t)(p7 > 0.0f) << 7;
    for(int i = 128; i < 256; ++i)
    {
        kc->cache[i] |= check;
    }
}

typedef struct {
    nrv_kc_t kc;
    f32_t a[2];
    f32_t b[2];
} nrv_kc_n2k40_t;

uint8_t nrv_kc_n2k40_at(nrv_kc_n2k40_t* kc, uint8_t b)
{
    return kc->kc.cache[b];
}

#define NRV_KC_I(k) ((3.0f*k-2.0f)/80.0f)
#define NRV_KC_P(kc, x, A, i) (kc->a[i] * cosf(A*x) + kc->b[i] * sinf(A*x))
#define NRV_KC_N2K40_P(kc, x) (NRV_KC_P(kc, x, NRV_KC_N2K40_ALPHA0, 0) + NRV_KC_P(kc, x, NRV_KC_N2K40_ALPHA1, 1))

void nrv_kc_n2k40_update(nrv_kc_n2k40_t* kc)
{
    nrv_kc_update(
        &kc->kc,
        NRV_KC_N2K40_P(kc, 6),
        NRV_KC_N2K40_P(kc, 11),
        NRV_KC_N2K40_P(kc, 16),
        NRV_KC_N2K40_P(kc, 21),
        NRV_KC_N2K40_P(kc, 26),
        NRV_KC_N2K40_P(kc, 31),
        NRV_KC_N2K40_P(kc, 36),
        NRV_KC_N2K40_P(kc, 41)
    );
}

void nrv_kc_n2k40_init_explicit(nrv_kc_n2k40_t* kc, f32_t a0, f32_t a1, f32_t b0, f32_t b1)
{
    kc->a[0] = a0;
    kc->a[1] = a1;
    kc->b[0] = b0;
    kc->b[1] = b1;
    nrv_kc_n2k40_update(kc);
}
#define nrv_kc_n2k40_init(kc) nrv_kc_n2k40_init_explicit(kc, 0.0f, 0.0f, 0.0f, 0.0f)

#ifdef __cplusplus
}
#endif

#endif // __NRV__KC_H__
