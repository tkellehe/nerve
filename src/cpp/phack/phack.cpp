#include <algorithm>
#include <array>
#include <cstdint>
#include <iomanip>
#include <list>
#include <sstream>
#include <vector>


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
    uint8 res[256] = {0,};

    pHack() = default;
    pHack(const pHack&) = default;
    constexpr pHack(const uint8 bytes[3]) { unpack(bytes); }
    constexpr pHack(const bool b, const int p, const int H, const uint8 c, const uint8 k) :
        b{b}, p{p}, H{H}, a{0}, c{c}, k{k}, P{pmmis[p]}, _h{0}, h{0,}, res{0,} {}

    constexpr uint8& operator[](int i) { return res[i]; }
    constexpr const uint8& operator[](int i) const { return res[i]; }
    constexpr std::size_t size() const { return static_cast<std::size_t>(k + 1); }

    template< typename T >
    constexpr void unpack(const T& bytes)
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

    template< typename T >
    constexpr void pack(T& bytes)
    {
        bytes[0] = (static_cast<uint8>(b) << 7) | (static_cast<uint8>(p) << 4) | (static_cast<uint8>(H));
        bytes[1] = c;
        bytes[2] = k;
    }
    
    constexpr uint8 nxt()
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

    constexpr void run()
    {
        for(int i = 0; i < static_cast<int>(size()); ++i) res[i] = nxt();
    }
};


//------------------------------------------------------------------------------------------------------------
class Program
{
public:
    enum class Type : int
    {
        DEFAULT = 0,
        OUTPUT_INT_ARRAY = DEFAULT,
        OUTPUT_STRING,
        OUTPUT_HEX
    };
public:
    std::vector<pHack> phacks;
    std::list<uint8> output;
    Type type{Type::DEFAULT};
    

    //--------------------------------------------------------------------------------------------------------
    void parse(const std::string& str)
    {
        int offset{0};
        if((str.length() % 3) == 0)
        {
            phacks.resize(str.length() / 3);
            for(int i = 0; i < static_cast<int>(phacks.size()); ++i)
            {
                phacks[i].unpack(str.c_str() + offset);
                phacks[i].run();
                offset += 3;
            }
        }
    }


    //--------------------------------------------------------------------------------------------------------
    template< typename S >
    void run(S& stream)
    {
        if(phacks.size())
        {
            for(int i = 0; i < static_cast<int>(phacks.size()); ++i)
            {
                if(phacks[i].b)
                {
                    for(int j = 0; j < static_cast<int>(phacks[i].size()); ++j)
                    {
                        auto iter{std::find(output.rbegin(), output.rend(), phacks[i][j])};
                        if(iter != output.rend())
                        {
                            output.erase(--(iter.base()));
                        }
                    }
                }
                else
                {
                    for(int j = 0; j < static_cast<int>(phacks[i].size()); ++j)
                    {
                        output.push_back(phacks[i][j]);
                    }
                }
            }
            if(type == Type::OUTPUT_INT_ARRAY)
                display_iter_ints(stream, output);
            else if(type == Type::OUTPUT_STRING)
                display_iter_chars(stream, output);
            else if(type == Type::OUTPUT_HEX)
                display_iter_hex(stream, output);
        }
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename S, typename T >
    constexpr static void display_iter_ints(S& stream, const T& ints)
    {
        stream << "[";
        auto iter = ints.begin();
        if(iter != ints.end()) { stream << static_cast<int>(*iter); ++iter; }
        for(; iter != ints.end(); ++iter) stream << ", " << static_cast<int>(*iter);
        stream << "]";
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename S, typename T >
    constexpr static void display_iter_chars(S& stream, const T& ints)
    {
        for(auto iter = ints.begin(); iter != ints.end(); ++iter) stream << static_cast<char>(*iter);
    }


    //--------------------------------------------------------------------------------------------------------
    template< typename S, typename T >
    constexpr void display_iter_hex(S& stream, const T& ints)
    {
        std::ostringstream os;
        for(auto iter = ints.begin(); iter != ints.end(); ++iter)
            os << "\\x" << std::hex << std::setfill('0') << std::setw(2) << static_cast<int>(*iter);
        stream << os.str();
    }
};


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
#include <iostream>


//------------------------------------------------------------------------------------------------------------
int main(int argc, char* argv[])
{
    Program prgm;
    if(argc == 2)
    {
        // Provide as $'\x00\x00\x00...'
        std::string code(argv[1]);
        prgm.parse(code);
    }
    
    prgm.run(std::cout);
    std::cout << std::endl;

    return 0;
}
