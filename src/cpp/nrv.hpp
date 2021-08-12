#ifndef NRV_HPP
#define NRV_HPP


#include <cmath>
#include <cstddef>
#include <istream>
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

/// The type used to represent an output vector.
typedef std::vector<Uint8> Label;

/// A node represents a collection of weights that are attempting to move towards some collection of input vectors.
class Node
{
public:
    /// The number of times this node has one.
    Size winnings;

    /// The collection of weights that represents the vector approximation of the input space.
    Data weights;

    /// The label for this node.
    Label label;

    /// The largest distance required for 100 percent confidence in being correct as the closest.
    Distance threshold;

    /// Quick access to weights.
    /// \{
    inline nrv::Size size() const { return weights.size(); }
    inline Uint8& operator[](const nrv::Index i) { return weights[i]; }
    inline const Uint8& operator[](const nrv::Index i) const { return weights[i]; }
    /// \}

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

    /// Computes the confidence that this node is based on its threshold and how close it is.
    /// 
    /// \param[in] distance The measurement of how close the node is.
    /// \return Returns the confidence it is within the threshold where 1.0 => 100% confident.
    inline Real confidence(const Distance distance) const
    {
        return (distance <= threshold) ?
            1.0 :
            (1.0 - ((Real)(distance - threshold - 1) / (Real)(threshold + 1)));
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
        weights[weight] += (Uint8)(std::round((5.0/(Real)(winnings+5)) * factor * (Real)(data - weights[weight])));
    }

    /// Moves the node towards the data input vector.
    /// 
    /// \param[in] factor A multiplier to apply towards the overall attraction.
    /// \param[in] data The input vector to move the node towards.
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
    /// The max number of winnings until there will be no more movement by the neuron.
    static const Size DEFAULT_MAX_WINNINGS = 5000;

    /// All of the node structures tied in a loop where it must be an even number.
    std::vector<Node> nodes;

    /// The cached factors computed based off of the number of nodes used for distance from winner.
    std::vector<Real> factors;

    /// Quick access to nodes.
    /// \{
    inline nrv::Size size() const { return nodes.size(); }
    inline Node& operator[](const nrv::Index i) { return nodes[i]; }
    inline const Node& operator[](const nrv::Index i) const { return nodes[i]; }
    /// \}

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
    /// \param[in] N The number of nodes to allocate.
    /// \param[in] W The number of weights each node gets.
    inline void generate(const Size N, const Size W)
    {
        nodes.resize(N);
        for(Index i = 0; i < N; ++i)
        {
            nodes[i].winnings = 0;
            nodes[i].threshold = 0;
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
    /// \param[in] useWinnings Use \c true to select a different winner if it already has won too much and \c false to always select the closest.
    inline void winner(const Data& data, Index& node, Distance& distance, const bool useWinnings = true) const
    {
        node = 0;
        distance = nodes[0].distance(data);
        for(Index i = 1; i < nodes.size(); ++i)
        {
            Distance temp(nodes[i].distance(data));
            if(temp < distance &&
                // If \c useWinnings is \c true, then the winnings will be limited to the max winnings.
                // If the max winnings have already been reached, then default to picking the closest.
                (!useWinnings || nodes[i].winnings < DEFAULT_MAX_WINNINGS || nodes[node].winnings >= DEFAULT_MAX_WINNINGS))
            {
                node = i;
                distance = temp;
            }
        }
    }

    /// Find the winning clan and node.
    /// 
    /// \param[in] clans The array of clans to pick through.
    /// \param[in] data The input vector used to find the closest node.
    /// \param[out] clan Updated with the index of the clan that contains the node.
    /// \param[out] node Updated with the index of the closest node.
    /// \param[out] distance Updated with the distance that the winning node is from the data.
    /// \param[in] useWinnings Use \c true to select a different winner if it already has won too much and \c false to always select the closest.
    inline static void best(const std::vector<Clan>& clans, const Data& data, Index& clan, Index& node, Distance& distance, const bool useWinnings = true)
    {
        clan = 0;
        clans[0].winner(data, node, distance);
        for(Index c = 1; c < clans.size(); ++c)
        {
            Index nodeTemp;
            Distance distanceTemp;
            clans[c].winner(data, nodeTemp, distanceTemp, useWinnings);
            if(distanceTemp < distance &&
                // If \c useWinnings is \c true, then the winnings will be limited to the max winnings.
                // If the max winnings have already been reached, then default to picking the closest.
                (!useWinnings || clans[c][nodeTemp].winnings < DEFAULT_MAX_WINNINGS || clans[clan][node].winnings >= DEFAULT_MAX_WINNINGS))
            {
                distance = distanceTemp;
                node = nodeTemp;
                clan = c;
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
};


/// Train a simple vector of clans using the basic attraction logic.
/// 
/// \param[in,out] clans The vector of clans to train. 
/// \param[in] data The input vector to train the clans on.
/// \param[in] factor The learning factor applied to the attraction.
inline static void train(std::vector<Clan>& clans, const Data& data, const Real factor = 1.0)
{
    nrv::Index clan;
    nrv::Index node;
    nrv::Distance distance;
    nrv::Clan::best(clans, data, clan, node, distance);
    clans[clan].attract(node, factor, data);
}


/// Train a new network based on the network provided in order to inherit the traits.
/// 
/// \param[in,out] clans The vector of clans to train. 
/// \param[in] elders The vector of clans to inherit from. 
/// \param[in] data The input vector to train the clans on.
/// \param[in] factor The learning factor applied to the attraction.
inline static void inherit(std::vector<Clan>& clans, const std::vector<Clan>& elders, const Data& data, const Real factor = 1.0)
{
    nrv::Index clan;
    nrv::Index node;
    nrv::Distance distance;
    nrv::Clan::best(elders, data, clan, node, distance);
    const Data& weights = elders[clan][node].weights;
    nrv::Clan::best(clans, weights, clan, node, distance);
    clans[clan].attract(node, factor, weights);
}


/// Assigns the label to the node closest to the data.
/// 
/// \param[in,out] clans The vector of clans to attempt to assign. 
/// \param[in] data The input vector to find the closest node.
/// \param[in] label The label to assign to the node.
/// 
/// \return Returns false if the node selected already has a label, and true otherwise.
inline static bool label(std::vector<Clan>& clans, const Data& data, const Label& label)
{
    nrv::Index clan;
    nrv::Index node;
    nrv::Distance distance;
    nrv::Clan::best(clans, data, clan, node, distance, false);
    // First check to see if we already have a label.
    if(clans[clan][node].label.size())
    {
        // If the labels are conflicting then we cannot label this data.
        if(clans[clan][node].label != label)
        {
            return false;
        }

        // Always pick the largest valid labeled distance as the threshold for 100% confidence.
        if(clans[clan][node].threshold < distance)
        {
            clans[clan][node].threshold = distance;
        }
    }
    else
    {
        clans[clan][node].label = label;
        clans[clan][node].threshold = distance;
    }
    return true;
}


/// A scope to place all of the control byte constants.
namespace CBYTE
{
    static const Uint8 ALL_NODES = 0;
};


/// An integer that can be encoded through its length to reserve bytes.
/// The current encoding uses the first two bits to determine how many bytes to read.
/// This does limit it to a little over 1GB worth of weights or data size.
class CompressableSize
{
public:
    /// Stores the compressed version of the integer.
    Uint8 content[4];

    /// Basic operator to encode the size into the content.
    CompressableSize& operator<<(const Size size)
    {
        if(size < 64)
        {
            content[0] = (nrv::Uint8)(size);
        }
        else if(size < 16384)
        {
            content[0] = ((nrv::Uint8)(size & 0x3FU) | (nrv::Uint8)0x40U);
            content[1] = (nrv::Uint8)(size >> 6);
        }
        else if(size < 4194304)
        {
            content[0] = ((nrv::Uint8)(size & 0x3FU) | (nrv::Uint8)0x80U);
            content[1] = (nrv::Uint8)(size >> 6);
            content[2] = (nrv::Uint8)(size >> 14);
        }
        else if(size < 1073741824)
        {
            content[0] = ((nrv::Uint8)(size & 0x3FU) | (nrv::Uint8)0xC0U);
            content[1] = (nrv::Uint8)(size >> 6);
            content[2] = (nrv::Uint8)(size >> 14);
            content[3] = (nrv::Uint8)(size >> 22);
        }
        return *this;
    }

    /// Basic operator to read the encoded content into the size.
    CompressableSize& operator>>(Size& size)
    {
        size = 0;
        switch(content[0] & 0xC0U)
        {
            case 0xC0U:
                size |= ((Size)content[3]) << 22;
            case 0x80U:
                size |= ((Size)content[2]) << 14;
            case 0x40U:
                size |= ((Size)content[1]) << 6;
            case 0x00U:
                size |= (Size)(content[0] & 0x3FU);
                break;
        }
        return *this;
    }
};


/// Compress a set of nodes for a "nrv" file.
class Program
{
public:
    /// The control byte for this program.
    Uint8 cbyte;

    /// The number of nodes that have been added.
    Uint64 count;

    /// The size of the labels.
    Uint64 labelSize;

    /// All of the weights for the nodes.
    Data weights;

    /// Adds a node to represent the program.
    /// 
    /// \param[in] node The node to be compressed within the program.
    Program& operator<<(const Node& node)
    {
        ++count;
        labelSize = node.label.size();
        weights.reserve(node.size() + node.label.size() + weights.size());
        weights.insert(weights.end(), node.weights.begin(), node.weights.end());
        weights.insert(weights.end(), node.label.begin(), node.label.end());
        return *this;
    }
};


}


std::ostream& operator<<(std::ostream &out, const nrv::Node& node)
{
    out << "{"<< node.winnings << ", ["  << (int)node[0];
    for(nrv::Index i = 1; i < node.size(); ++i)
    {
        out << ", " << (int)node[i];
    }
    out << "]}";
    return out;
}


std::ostream& operator<<(std::ostream &out, const nrv::Clan& clan)
{
    out << "[" << clan[0];
    for(nrv::Index i = 1; i < clan.size(); ++i)
    {
        out << ", " << clan[i];
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


std::ostream& operator<<(std::ostream &out, const nrv::CompressableSize& size)
{
    switch(size.content[0] & 0xC0U)
    {
        case 0xC0U:
            out << size.content[0];
            out << size.content[1];
            out << size.content[2];
            out << size.content[3];
            break;
        case 0x80U:
            out << size.content[0];
            out << size.content[1];
            out << size.content[2];
            break;
        case 0x40U:
            out << size.content[0];
            out << size.content[1];
            break;
        case 0x00U:
            out << size.content[0];
            break;
    }
    return out;
}


std::ostream& operator<<(std::ostream &out, const nrv::Program& program)
{
    nrv::Uint64 count = program.count - 1;
    nrv::Uint64 labelSize = program.labelSize - 1;
    if(program.cbyte == nrv::CBYTE::ALL_NODES)
    {
        nrv::CompressableSize temp;
        temp << count;
        out << temp;
        temp << labelSize;
        out << temp;
    }
    for(nrv::Index i = 0; i < program.weights.size(); ++i)
    {
        out << program.weights[i];
    }
    return out;
}


#endif