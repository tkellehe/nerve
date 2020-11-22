#include <array>
#include <cstdint>


//------------------------------------------------------------------------------------------------------------
using uint8 = std::uint8_t;


//------------------------------------------------------------------------------------------------------------
constexpr std::array<uint8, 8> pmmis  = { 29, 101, 131, 181, 241, 173, 107, 233};
constexpr std::array<uint8, 8> ipmmis = { 53, 109,  43, 157,  17,  37,  67,  31};


//------------------------------------------------------------------------------------------------------------
constexpr uint8 diffuse(uint8 v, uint8 n)
{
    uint8 x(n * v);
    x ^= (x >> 4) >> (x >> 6);
    return x * n;
}


//------------------------------------------------------------------------------------------------------------
class pHack
{
public:
    bool  b{false};
    int   p{0};
    int   H{0};
    uint8 a{0};
    uint8 c{0};
    uint8 k{0};

    uint8 P{pmmis[0]};
    int _h{0};
    std::array<uint8, 16> h{0,};

    constexpr pHack(const uint8 bytes[3]) { unpack(bytes); }
    constexpr pHack(const bool b, const int p, const int H, const uint8 c, const uint8 k) :
        b{b}, p{p}, H{H}, a{0}, c{c}, k{k}, P{pmmis[p]}, _h{0}, h{0,} {}

    constexpr void unpack(const uint8 bytes[3])
    {
        b = static_cast<bool>(bytes[0] & 0x80);
        p = static_cast<int>((bytes[0] & 0x70) >> 4);
        H = static_cast<int>(bytes[0] & 0x0F);
        a = 0;
        c = bytes[1];
        k = bytes[2];
        P = pmmis[p];
        _h = 0;
        h = {0,};
    }

    constexpr uint8 operator()()
    {
        uint8 r{diffuse(diffuse(diffuse(c, P) ^ k, P) ^ a++, P)};
        for(int i = 0; i < H; ++i) r = diffuse(r ^ h[i], P);
        if(H)
        {
            h[_h] = r;
            _h = (_h + 1) % static_cast<uint8>(H);
        }
        return r;
    }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


//------------------------------------------------------------------------------------------------------------
#include <iostream>
int main(int argc, char* argv[])
{
    return 0;
}