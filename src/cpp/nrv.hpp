#ifndef NRV_HPP
#define NRV_HPP


#include <cmath>
#include <cstddef>
#include <ostream>
#include <string.h>
#include <vector>


/// The source code for the clan byte self organizing map.
/// 
/// \file
/// \author T. Mitchell Kelleher



namespace nrv
{


/// Hidden structures used for underlying purposes or testing.
/// \{
struct true_{};
struct false_{};

template< typename T, typename U >
struct is_same_{ static const bool value = false; typedef false_ type; };
template< typename T >
struct is_same_<T, T>{ static const bool value = true; typedef true_ type; };

template< typename T, int S >
struct uint64_search_
{
    // Works to prevent recognizing "long long" at compile time if it is not available.
    // For compilers that I tested on.
    template< bool B, bool dummy = false >
    struct long_{};
    template< bool dummy >
    struct long_<false, dummy>{ typedef unsigned long long type; };
    template< bool dummy >
    struct long_<true, dummy>{ typedef T type; };

    typedef typename long_<sizeof(T) == S>::type type;
};
typedef typename uint64_search_<unsigned long, 8>::type uint64_;

/// \}


/// The fixed unsigned 64 bit integer.
typedef uint64_ Uint64;
/// The fixed unsigned 8 bit integer.
typedef unsigned char Uint8;
/// The type used to represent the counts and sizes of contents.
typedef std::size_t Size;
/// The type used to represent the index into contents.
typedef Size Index;
/// The distance between a node and an input vector type.
typedef Uint64 Distance;
/// A multiplier type used for controlling movements.
typedef double Real;


/// A wrapper of the memcpy function from the standard library.
inline static void memcpy(void* dest, const void* src, const Size size)
{
    ::memcpy(dest, src, size);
}

/// Generate a random byte using a basic diffuse algorithm.
inline static Uint8 brandom(const int seed = 0)
{
    static const Uint8 primes[8] = {29, 101, 131, 181, 241, 173, 107, 233};
    static Uint8 last = 139;
    static Index offset = 0;

    Uint8 n(primes[(seed + offset++)&7]);
    Uint8 x(n * last);
    x ^= (x >> 4) >> (x >> 6);
    last = x;
    return x * n;
}

/// The type used to represent an input vector.
typedef std::vector<Uint8> Data;

/// A node represents a collection of weights that are attempting to move towards some collection of input vectors.
class Node
{
public:
    /// The number of times this node has one.
    Size winnings;

    /// The collection of weights that represents the vector approximation of the input space.
    std::vector<Uint8> weights;

    /// Generates random weights for the node.
    /// 
    /// \param[in] seed Applied to the random algorithm.
    inline void randomize(const int seed = 0)
    {
        for(Index i = 0; i < weights.size(); ++i)
        {
            weights[i] = brandom(seed);
        }
    }

    /// Computes the distance from this node to the data where it is euclidean but no square root.
    /// 
    /// \param[in] data The input vector to compute the distance from.
    /// \return Returns The squared euclidean distance from the data provided.
    inline Distance distance(const Data& data) const
    {
        Distance result(0);
        for(Index i = 0; i < data.size(); ++i)
        {
            Distance diff((Distance)(data[i] - weights[i]));
            result += diff * diff;
        }
        return result;
    }

    /// Moves an individual weight towards some data.
    /// 
    /// \param[in] factor A multiplier to apply towards the overall attraction.
    /// \param[in] weight The index of the weight within the node.
    /// \param[in] data The individual byte to move the weight towards.
    inline void attract(const Real factor, const Index weight, const Uint8 data)
    {
        weights[weight] += (Uint8)(std::round((1.0/((winnings+1)*(winnings+1))) * factor * (Real)(data - weights[weight])));
    }

    inline void attract(const Real factor, const Data& data)
    {
        for(Index i = 0; i < data.size(); ++i)
        {
            attract(factor, i, data[i]);
        }
    }
};


/// A clan is a ring of nodes that attempts to move the ring towards a collection of input vectors.
class Clan
{
public:
    /// All of the node structures tied in a loop where it must be an even number.
    std::vector<Node> nodes;

    /// The cached factors computed based off of the number of nodes used for distance from winner.
    std::vector<Real> factors;

    /// Generates random weights for all the nodes.
    /// 
    /// \param[in] seed Applied to the random algorithm.
    inline void randomize(const int seed)
    {
        for(Index i = 0; i < nodes.size(); ++i)
        {
            nodes[i].randomize(seed);
        }
    }

    /// Generates all the nodes and allocates memory for the weights.
    /// 
    /// \param[in] N 
    /// \param[in] W 
    inline void generate(const Size N, const Size W)
    {
        nodes.resize(N);
        for(Index i = 0; i < N; ++i)
        {
            nodes[i].weights.resize(W);
        }
    }

    /// Calculates all of the factors based off of the number of nodes.
    inline void compute()
    {
        Size N(nodes.size());
        factors.resize((N - 2) >> 1);
        factors[0] = (((Real)(N-1)) / N) * 0.75;
        for(Index i = 1; i < factors.size(); ++i)
        {
            factors[i] = (((Real)(N-(i+1))) / (N*i)) * factors[i-1];
        }
    }

    /// Finds the closest node to the input data.
    /// 
    /// \param[in] data The input vector used to find the closest node.
    /// \param[out] node Updated with the index of the closest node.
    /// \param[out] distance Updated with the distance that the winning node is from the data.
    inline void winner(const Data& data, Index& node, Distance& distance) const
    {
        node = 0;
        distance = nodes[0].distance(data);
        for(Index i = 1; i < nodes.size(); ++i)
        {
            Distance temp(nodes[i].distance(data));
            if(temp < distance)
            {
                node = i;
                distance = temp;
            }
        }
    }

    /// Moves the ring of nodes closer to the data by pulling from the winner.
    /// 
    /// \param[in] winner The index of the closest node to the input data within this clan.
    /// \param[in] factor A constant factor to apply to each attraction for each node being pulled to the data.
    /// \param[in] data The data to pull the ring towards.
    inline void attract(const Index winner, const Real factor, const Data& data)
    {
        nodes[winner].winnings++;
        Size N(nodes.size());
        for(Index i = 0; i < data.size(); ++i)
        {
            nodes[winner].attract(factor, i, data[i]);
            for(Index j = 0; j < factors.size(); ++j)
            {
                Index right((winner + (j + 1)) % N);
                Index left((winner - (j + 1)) % N);
                nodes[right].attract(factor * factors[j], i, data[i]);
                nodes[left].attract(factor * factors[j], i, data[i]);
            }
        }
    }

    inline static void best(const std::vector<Clan>& clans, const Data& data, Index& clan, Index& node, Distance& distance)
    {
        clan = 0;
        clans[0].winner(data, node, distance);
        for(Index c = 1; c < clans.size(); ++c)
        {
            Index nodeTemp;
            Distance distanceTemp;
            clans[c].winner(data, nodeTemp, distanceTemp);
            if(distanceTemp < distance)
            {
                distance = distanceTemp;
                node = nodeTemp;
                clan = c;
            }
        }
    }
};


}


std::ostream& operator<<(std::ostream &out, const nrv::Node& node)
{
    out << "{"<< node.winnings << ", ["  << (int)node.weights[0];
    for(nrv::Index i = 1; i < node.weights.size(); ++i)
    {
        out << ", " << (int)node.weights[i];
    }
    out << "]}";
    return out;
}


std::ostream& operator<<(std::ostream &out, const nrv::Clan& clan)
{
    out << "[" << clan.nodes[0];
    for(nrv::Index i = 1; i < clan.nodes.size(); ++i)
    {
        out << ", " << clan.nodes[i];
    }
    out << "]";
    return out;
}


std::ostream& operator<<(std::ostream &out, const nrv::Data& data)
{
    out << "[" << (int)data[0];
    for(nrv::Index i = 1; i < data.size(); ++i)
    {
        out << ", " << (int)data[i];
    }
    out << "]";
    return out;
}


#endif