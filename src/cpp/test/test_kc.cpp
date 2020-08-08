#include <test/stopwatch.h>
#include <nrv/kc.h>
#include <iostream>
#include <stdio.h>

#include <chrono>
#include <cmath>

#define NUM_SAMPLES 800
#define ROUND_DIV(x, y) uint64_t(std::round(double(x)/y))
#define AVGOP(ns) ROUND_DIV(ns.count(), NUM_SAMPLES)

int main()
{
    int result = 0;

    std::cout << "------------------------------------------------------------" << std::endl;
    std::cout << "testing kc" << std::endl;

    {
        nrv_kc_n2k40_t kc;
        nrv_kc_n2k40_init(&kc);
        bool failed = false;
        for(int i = 0; i < 256; ++i)
        {
            if(kc.kc.cache[i] != 0)
            {
                std::cout << "failed: [" << i << "] " << (int)kc.kc.cache[i] << " != 0" << std::endl;
                failed = true;
            }
        }
        if(kc.a[0] != 0.0f)
        {
            std::cout << "failed: kc.a[0] " << kc.a[0] << " != 0.0f" << std::endl;
            failed = true;
        }
        if(kc.a[1] != 0.0f)
        {
            std::cout << "failed: kc.a[1] " << kc.a[1] << " != 0.0f" << std::endl;
            failed = true;
        }
        if(kc.b[0] != 0.0f)
        {
            std::cout << "failed: kc.b[0] " << kc.b[0] << " != 0.0f" << std::endl;
            failed = true;
        }
        if(kc.b[1] != 0.0f)
        {
            std::cout << "failed: kc.b[1] " << kc.b[1] << " != 0.0f" << std::endl;
            failed = true;
        }
        if(failed)
        {
            --result;
        }
        else
        {
            std::cout << "passed: kc init all zeros" << std::endl;
        }
    }

    {
        nrv_kc_n2k40_t kc;
        nrv_kc_n2k40_init_explicit(&kc, 1.0f, 1.0f, 1.0f, 1.0f);
        bool failed = false;
        for(int i = 0; i < 256; ++i)
        {
            if(kc.kc.cache[i] != i)
            {
                std::cout << "failed: [" << i << "] " << (int)kc.kc.cache[i] << " != " << i << std::endl;
                failed = true;
            }
        }
        if(kc.a[0] != 1.0f)
        {
            std::cout << "failed: kc.a[0] " << kc.a[0] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(kc.a[1] != 1.0f)
        {
            std::cout << "failed: kc.a[1] " << kc.a[1] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(kc.b[0] != 1.0f)
        {
            std::cout << "failed: kc.b[0] " << kc.b[0] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(kc.b[1] != 1.0f)
        {
            std::cout << "failed: kc.b[1] " << kc.b[1] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(failed)
        {
            --result;
        }
        else
        {
            std::cout << "passed: kc init all ones" << std::endl;
        }
    }

    {
        uint8_t check[] = {
            0, 0, 0, 0, 4, 4, 4, 4, 8, 8, 8, 8, 12, 12, 12, 12, 16, 16, 16, 16, 20, 20, 20, 20, 24, 24, 24,
            24, 28, 28, 28, 28, 32, 32, 32, 32, 36, 36, 36, 36, 40, 40, 40, 40, 44, 44, 44, 44, 48, 48, 48,
            48, 52, 52, 52, 52, 56, 56, 56, 56, 60, 60, 60, 60, 0, 0, 0, 0, 4, 4, 4, 4, 8, 8, 8, 8, 12, 12,
            12, 12, 16, 16, 16, 16, 20, 20, 20, 20, 24, 24, 24, 24, 28, 28, 28, 28, 32, 32, 32, 32, 36, 36,
            36, 36, 40, 40, 40, 40, 44, 44, 44, 44, 48, 48, 48, 48, 52, 52, 52, 52, 56, 56, 56, 56, 60, 60,
            60, 60, 128, 128, 128, 128, 132, 132, 132, 132, 136, 136, 136, 136, 140, 140, 140, 140, 144, 144,
            144, 144, 148, 148, 148, 148, 152, 152, 152, 152, 156, 156, 156, 156, 160, 160, 160, 160, 164,
            164, 164, 164, 168, 168, 168, 168, 172, 172, 172, 172, 176, 176, 176, 176, 180, 180, 180, 180,
            184, 184, 184, 184, 188, 188, 188, 188, 128, 128, 128, 128, 132, 132, 132, 132, 136, 136, 136,
            136, 140, 140, 140, 140, 144, 144, 144, 144, 148, 148, 148, 148, 152, 152, 152, 152, 156, 156,
            156, 156, 160, 160, 160, 160, 164, 164, 164, 164, 168, 168, 168, 168, 172, 172, 172, 172, 176,
            176, 176, 176, 180, 180, 180, 180, 184, 184, 184, 184, 188, 188, 188, 188
        };

        nrv_kc_n2k40_t kc;
        nrv_kc_n2k40_init_explicit(&kc, 1.0f, -1.0f, 1.0f, -1.0f);
        bool failed = false;
        for(int i = 0; i < 256; ++i)
        {
            if(kc.kc.cache[i] != check[i])
            {
                std::cout << "failed: [" << i << "] " << (int)kc.kc.cache[i] << " != " << check[i] << std::endl;
                failed = true;
            }
        }
        if(kc.a[0] != 1.0f)
        {
            std::cout << "failed: kc.a[0] " << kc.a[0] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(kc.a[1] != -1.0f)
        {
            std::cout << "failed: kc.a[1] " << kc.a[1] << " != -1.0f" << std::endl;
            failed = true;
        }
        if(kc.b[0] != 1.0f)
        {
            std::cout << "failed: kc.b[0] " << kc.b[0] << " != 1.0f" << std::endl;
            failed = true;
        }
        if(kc.b[1] != -1.0f)
        {
            std::cout << "failed: kc.b[1] " << kc.b[1] << " != -1.0f" << std::endl;
            failed = true;
        }
        if(failed)
        {
            --result;
        }
        else
        {
            std::cout << "passed: kc init 1.0, -1.0, 1.0, -1.0" << std::endl;
        }
    }

    std::cout << "completed kc test." << std::endl;
    std::cout << "------------------------------------------------------------" << std::endl;

    return result;
}