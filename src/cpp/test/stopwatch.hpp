#ifndef __STOPWATCH_HPP__
#define __STOPWATCH_HPP__

#include <chrono>

namespace std
{
    template< typename C = std::chrono::high_resolution_clock, typename T = std::chrono::nanoseconds >
    class stopwatch
    {
    public:
        using clock_type = C;
        using time_type = T;
    private:
        std::chrono::time_point<clock_type> _start;
    public:
        stopwatch() { _start = clock_type::now(); }
        ~stopwatch() = default;

        std::chrono::time_point<clock_type> start() const { return _start; }

        void reset() { _start = clock_type::now(); }
        time_type elapsed() {
            return std::chrono::duration_cast<time_type>(clock_type::now() - _start);
        }
    };
}

#endif