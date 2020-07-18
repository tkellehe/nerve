#include <nrv/f16.h>
#include <iostream>
#include <stdio.h>

#include <chrono>
#include <cmath>

#define NUM_SAMPLES 800
#define ROUND_DIV(x, y) uint64_t(std::round(double(x)/y))
#define AVGOP(ns) ROUND_DIV(ns.count(), NUM_SAMPLES)
namespace std
{
    template< typename C = std::chrono::high_resolution_clock, typename T = std::chrono::nanoseconds >
    class stopwatch
    {
    public:
        using clock_type = C;
        using time_type = T;
    private:
        std::chrono::time_point<clock_type> start_;
    public:
        stopwatch() { start_ = clock_type::now(); }
        ~stopwatch() = default;

        void reset() { start_ = clock_type::now(); }
        time_type elapsed() {
            return std::chrono::duration_cast<time_type>(clock_type::now() - start_);
        }
    };
}

#define IS_WITHIN_ERROR(error) (-0.001f < error && error < 0.001f)

int main()
{
    std::cout << "------------------------------------------------------------" << std::endl;
    std::cout << "testing f16" << std::endl;

    {
        f32_t f = 23.0f;
        f16_t h;
        nrv_f32to16(f, &h);
        f32_t t;
        nrv_f16to32(h, &t);
        f32_t error = f - t;
        if(IS_WITHIN_ERROR(error))
        {
            std::cout << "passed: " << f << " == " << t << std::endl;
        }
        else
        {
            std::cout << "failed: " << f << " != " << t << std::endl;
        }
    }
    {
        f32_t f = 23.5f;
        f16_t h;
        nrv_f32to16(f, &h);
        f32_t t;
        nrv_f16to32(h, &t);
        f32_t error = f - t;
        if(IS_WITHIN_ERROR(error))
        {
            std::cout << "passed: " << f << " == " << t << std::endl;
        }
        else
        {
            std::cout << "failed: " << f << " != " << t << std::endl;
        }
    }
    {
        f32_t f = 23.2969;
        f16_t h; // 0x4DD3
        nrv_f32to16(f, &h);
        f32_t t;
        nrv_f16to32(h, &t);
        f32_t error = f - t;
        if(IS_WITHIN_ERROR(error))
        {
            std::cout << "passed: " << f << " == " << t << std::endl;
        }
        else
        {
            std::cout << "failed: " << f << " != " << t << std::endl;
        }
    }
    {
        f32_t f[NUM_SAMPLES];
        f16_t h[NUM_SAMPLES];
        std::stopwatch<> stopwatch1;
        for(int i = NUM_SAMPLES; i--;)
        {
            nrv_f32to16(f[i], h+i);
        }
        std::chrono::nanoseconds total();
        std::cout << "nrv_f32to16: " << AVGOP(stopwatch1.elapsed()) << "ns" << std::endl;

        std::stopwatch<> stopwatch2;
        for(int i = NUM_SAMPLES; i--;)
        {
            nrv_f16to32(h[i], f+i);
        }
        std::cout << "nrv_f16to32: " << AVGOP(stopwatch2.elapsed()) << "ns" << std::endl;
    }
    {
        f32_t f[NUM_SAMPLES];
        f16_t h[NUM_SAMPLES];
        std::stopwatch<> stopwatch1;
        nrv_f32to16_x(f, h, NUM_SAMPLES);
        std::chrono::nanoseconds total();
        std::cout << "nrv_f32to16_x: " << stopwatch1.elapsed().count() << "ns" << std::endl;

        std::stopwatch<> stopwatch2;
        nrv_f16to32_x(h, f, NUM_SAMPLES);
        std::cout << "nrv_f16to32_x: " << stopwatch2.elapsed().count() << "ns" << std::endl;
    }
    {
        f32_t f[NUM_SAMPLES];
        f16_t h[NUM_SAMPLES];
        std::stopwatch<> stopwatch1;
        nrv_f32to16_x4(f, h, NUM_SAMPLES);
        std::chrono::nanoseconds total();
        std::cout << "nrv_f32to16_x4: " << stopwatch1.elapsed().count() << "ns" << std::endl;

        std::stopwatch<> stopwatch2;
        nrv_f16to32_x4(h, f, NUM_SAMPLES);
        std::cout << "nrv_f16to32_x4: " << stopwatch2.elapsed().count() << "ns" << std::endl;
    }
    {
        f32_t f[NUM_SAMPLES];
        f16_t h[NUM_SAMPLES];
        std::stopwatch<> stopwatch1;
        nrv_f32to16_x8(f, h, NUM_SAMPLES);
        std::chrono::nanoseconds total();
        std::cout << "nrv_f32to16_x8: " << stopwatch1.elapsed().count() << "ns" << std::endl;

        std::stopwatch<> stopwatch2;
        nrv_f16to32_x8(h, f, NUM_SAMPLES);
        std::cout << "nrv_f16to32_x8: " << stopwatch2.elapsed().count() << "ns" << std::endl;
    }

    std::cout << "completed f16 test." << std::endl;
    std::cout << "------------------------------------------------------------" << std::endl;
}