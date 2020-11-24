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
constexpr uint8 mmis[128] = {
   1,   3,   5,   7,   9,  11,  13,  15,
  17,  19,  21,  23,  25,  27,  29,  31,
  33,  35,  37,  39,  41,  43,  45,  47,
  49,  51,  53,  55,  57,  59,  61,  63,
  65,  67,  69,  71,  73,  75,  77,  79,
  81,  83,  85,  87,  89,  91,  93,  95,
  97,  99, 101, 103, 105, 107, 109, 111,
 113, 115, 117, 119, 121, 123, 125, 127,
 129, 131, 133, 135, 137, 139, 141, 143,
 145, 147, 149, 151, 153, 155, 157, 159,
 161, 163, 165, 167, 169, 171, 173, 175,
 177, 179, 181, 183, 185, 187, 189, 191,
 193, 195, 197, 199, 201, 203, 205, 207,
 209, 211, 213, 215, 217, 219, 221, 223,
 225, 227, 229, 231, 233, 235, 237, 239,
 241, 243, 245, 247, 249, 251, 253, 255
};


//------------------------------------------------------------------------------------------------------------
constexpr uint8 diffuse(uint8 v, uint8 n)
{
    uint8 x(n * v);
    x ^= (x >> 4) >> (x >> 6);
    return x * n;
}


// After running some tests, it may be that the mmis produce a very similar sequence given other mmis.
// Therein, may not need H. Also, producing 256 number is not useful with this algorithm.
// Either need to limit to 128 or pick some fixed amount.
// Still need 'a' to make sure everything is produced.
// Would be nice to get down to a single byte...
// should be able to get down to 2bytes by removing H and packing 'a' with k.


//------------------------------------------------------------------------------------------------------------
class pHack
{
public:
    bool  p{false};
    int   H{0};
    bool  a{false};
    int   c{0};
    uint8 k{0};

    int _i{0};
    uint8 res[256] = {0,};

    pHack() = default;
    pHack(const pHack&) = default;
    constexpr pHack(const uint8 bytes[3]) { unpack(bytes); }
    constexpr pHack(const bool p, const int H, const bool a, const int c, const uint8 k) :
        p{p}, H{H}, a{a}, c{c}, k{k}, _i{0}, res{0,} {}

    constexpr uint8& operator[](int i) { return res[i]; }
    constexpr const uint8& operator[](int i) const { return res[i]; }
    constexpr std::size_t size() const { return static_cast<std::size_t>(k + 1); }

    template< typename T >
    constexpr void unpack(const T& bytes)
    {
        p = static_cast<bool>(bytes[0] & 0x80);
        H = static_cast<int>(bytes[0] & 0x7F);
        a = static_cast<bool>(bytes[1] & 0x80);
        c = static_cast<int>(bytes[1] & 0x7F);
        k = bytes[2];
        _i = 0;
    }

    template< typename T >
    constexpr void pack(T& bytes)
    {
        bytes[0] = (static_cast<uint8>(p) << 7) | static_cast<uint8>(H);
        bytes[1] = (static_cast<uint8>(a) << 7) | static_cast<uint8>(c);
        bytes[2] = k;
    }
    
    constexpr uint8 nxt()
    {
        return diffuse(mmis[H], mmis[(c + _i++) & 0x7F]) + static_cast<uint8>(a);
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
    enum class OutputType : int
    {
        DEFAULT = 0,
        OUTPUT_INT_ARRAY = DEFAULT,
        OUTPUT_STRING,
        OUTPUT_HEX
    };
    enum class Type : int
    {
        DEFAULT = 0,
        PHACK = DEFAULT,
        PHACKR,
        SEARCH_A1_ORDERED,
        SEARCH_A1_UNORDERED
    };
public:
    std::vector<pHack> phacks;
    std::list<uint8> output;
    OutputType output_type{OutputType::DEFAULT};
    Type type{Type::DEFAULT};
    int num_layers{0};
    std::vector<uint8> search_bytes;
    uint8 search_k;
    bool is_verbose{false};
    bool search_b{false};
    

    //--------------------------------------------------------------------------------------------------------
    void parse(const std::string& str)
    {
        if(type == Type::PHACK || type == Type::PHACKR)
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
        else if(type == Type::SEARCH_A1_ORDERED || type == Type::SEARCH_A1_UNORDERED)
        {
            search_bytes.assign(str.begin(), str.end());
        }
    }


    //--------------------------------------------------------------------------------------------------------
    template< typename S >
    void exec(S& stream)
    {
        // Execute the program based on the type.
        if(type == Type::PHACK)
        {
            for(int i = 0; i < static_cast<int>(phacks.size()); ++i)
            {
                if(phacks[i].p)
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
        }
        else if(type == Type::SEARCH_A1_ORDERED)
        {
            pHack phack = search_a1_ordered(stream);
            uint8 bytes[3];
            phack.pack(bytes);
            output.push_back(bytes[0]);
            output.push_back(bytes[1]);
            output.push_back(bytes[2]);
        }
        else if(type == Type::SEARCH_A1_UNORDERED)
        {
            pHack phack = search_a1_unordered(stream);
            uint8 bytes[3];
            phack.pack(bytes);
            output.push_back(bytes[0]);
            output.push_back(bytes[1]);
            output.push_back(bytes[2]);
        }
            
        // Stream the output.
        if(output_type == OutputType::OUTPUT_INT_ARRAY)
            display_iter_ints(stream, output);
        else if(output_type == OutputType::OUTPUT_STRING)
            display_iter_chars(stream, output);
        else if(output_type == OutputType::OUTPUT_HEX)
            display_iter_hex(stream, output);
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename L, typename R >
    static int count_closest_order(L& left, R& right)
    {
        int count{0};
        int j{0};
        for(int i = 0; i < static_cast<int>(left.size()); ++i)
        {
            if(left[i] == right[j])
            {
                ++count;
                if(++j > static_cast<int>(right.size()))
                {
                    break;
                }
            }
        }
        return count;
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename L, typename R >
    static int count_intersection(L& left, R& right)
    {
        if(left.size() < right.size()) return count_intersection(right, left);
        int count{0};
        int checks[256] = {0,};
        bool has_checked[256] = {false,};
        for(int i = 0; i < static_cast<int>(right.size()); ++i)
        {
            if(!has_checked[right[i]] || checks[right[i]] > 0)
            {
                has_checked[right[i]] = true;
                for(int j = 0; j < static_cast<int>(left.size()); ++j)
                {
                    checks[right[i]] += left[j] == right[i];
                }
            }
            if(checks[right[i]])
            {
                --checks[right[i]];
                ++count;
            }
        }
        return count;
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename S >
    pHack search_a1_ordered(S& stream)
    {
        if(is_verbose)
        {
            display_iter_ints(stream, search_bytes);
            stream << std::endl;
        }

        int best = 0;
        pHack bphack;
        for(int a = 2; a--;)
        {
            for(int H = 128; H--;)
            {
                for(int c = 128; c--;)
                {
                    pHack phack(search_b, H, static_cast<bool>(a), c, search_k);
                    phack.run();
                    int bz{count_closest_order(phack, search_bytes)};
                    if(best < bz)
                    {
                        best = bz;
                        bphack = phack;
                        if(is_verbose)
                        {
                            stream <<
                                "(" << bz << "){p:" << search_b << ", H:" << H <<
                                ", a:" << a << ", c: " << c << ", k:" << static_cast<int>(search_k)
                            << "}" << std::endl;
                        }
                        if(best == static_cast<int>(search_bytes.size())) return bphack;
                    }
                    // Since this is order, we really only care when more than two collide.
                    else if(is_verbose && best >= 2 && best == bz)
                    {
                        stream <<
                            "(" << bz << "){p:" << search_b << ", H:" << H <<
                            ", a:" << a << ", c: " << c << ", k:" << static_cast<int>(search_k)
                        << "}" << std::endl;
                    }
                }
            }
        }
        return bphack;
    }
    
    
    //--------------------------------------------------------------------------------------------------------
    template< typename S >
    pHack search_a1_unordered(S& stream)
    {
        if(is_verbose)
        {
            display_iter_ints(stream, search_bytes);
        }

        int best = 0;
        pHack bphack;
        for(int a = 2; a--;)
        {
            for(int H = 128; H--;)
            {
                for(int c = 128; c--;)
                {
                    pHack phack(search_b, H, static_cast<bool>(a), c, search_k);
                    phack.run();
                    int bz{count_intersection(search_bytes, phack)};
                    if(best < bz)
                    {
                        best = bz;
                        bphack = phack;
                        if(is_verbose)
                        {
                            stream <<
                                "(" << bz << "){p:" << search_b << ", H:" << H <<
                                ", a:" << a << ", c: " << c << ", k:" << static_cast<int>(search_k)
                            << "}" << std::endl;
                        }
                        if(best == static_cast<int>(search_bytes.size())) return bphack;
                    }
                    else if(is_verbose && best && best == bz)
                    {
                        stream <<
                            "(" << bz << "){p:" << search_b << ", H:" << H <<
                            ", a:" << a << ", c: " << c << ", k:" << static_cast<int>(search_k)
                        << "}" << std::endl;
                    }
                }
            }
        }
        return bphack;
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
    
    int N = argc-1;
    for(int argi = 1; argi < N; ++argi)
    {
        const std::string arg(argv[argi]);
        if(arg == "-a") { prgm.output_type = Program::OutputType::OUTPUT_INT_ARRAY; }
        else if(arg == "-s") { prgm.output_type = Program::OutputType::OUTPUT_STRING; }
        else if(arg == "-x") { prgm.output_type = Program::OutputType::OUTPUT_HEX; }
        else if(arg == "-v") { prgm.is_verbose = true; }
        else if(arg == "-b") { prgm.search_b = true; }
        else if(arg == "-o")
        {
            prgm.type = Program::Type::SEARCH_A1_ORDERED;
            if(++argi < N)
            {
                const std::string k(argv[argi]);
                prgm.search_k = static_cast<uint8>(std::stoi(k));
            }
            else
            {
                prgm.search_k = 1;
            }
        }
        else if(arg == "-u")
        {
            prgm.type = Program::Type::SEARCH_A1_UNORDERED;
            if(++argi < N)
            {
                const std::string k(argv[argi]);
                prgm.search_k = static_cast<uint8>(std::stoi(k));
            }
            else
            {
                prgm.search_k = 1;
            }
        }
    }
    
    // The last part is always the code or data to search.
    if(argc >= 2)
    {
        // bash -> $'\x00\x00\x00...'
        std::string data(argv[argc-1]);
        prgm.parse(data);
    }
    
    // Now can execute the program.
    prgm.exec(std::cout);
    std::cout << std::endl;

    return 0;
}
