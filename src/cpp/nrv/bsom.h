#ifndef NRV__BSOM_H
#define NRV__BSOM_H

#include <stdint.h>
#include <math.h>
#include <stddef.h>

typedef struct
{
    int count;
    unsigned char* content;
} nrv_data_t;

typedef struct
{
    unsigned char* weights;
} nrv_node_t;

typedef struct
{
    nrv_node_t nodes[8];
} nrv_clan_t;

typedef uint_least32_t nrv_bdist_t;

//------------------------------------------------------------------------------------------------------------
static uint32_t nrv_sqrt32(uint_least64_t x)
{
    uint32_t r = 0;
    uint32_t b;
    for(b = 0x80000000L; b > 0; b >>= 1)
    {
        uint_least64_t t = (uint_least64_t)(r + b);
        if((t*t) < x)
        {
            r += b;
        }
    }
    return r;
}

//------------------------------------------------------------------------------------------------------------
static nrv_bdist_t nrv_node_bdist(nrv_node_t *node, nrv_data_t *data)
{
    int i;
    nrv_bdist_t bdist = 0;
    for(i = 0; i < data->count; ++i)
    {
        nrv_bdist_t temp = (nrv_bdist_t)((unsigned char)(data->content[i] - node->weights[i]));
        bdist += temp*temp;
    }
    return (nrv_bdist_t)nrv_sqrt32((uint_least64_t)bdist);
}

//------------------------------------------------------------------------------------------------------------
static void nrv_clan_winner(nrv_clan_t *clan, nrv_data_t *data, nrv_bdist_t *min, int *winner)
{
    nrv_bdist_t bdist;

    bdist = nrv_node_bdist(&clan->nodes[0], data);
    *min = bdist;
    *winner = 0;

    bdist = nrv_node_bdist(&clan->nodes[1], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 1;
    }

    bdist = nrv_node_bdist(&clan->nodes[2], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 2;
    }

    bdist = nrv_node_bdist(&clan->nodes[3], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 3;
    }

    bdist = nrv_node_bdist(&clan->nodes[4], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 4;
    }

    bdist = nrv_node_bdist(&clan->nodes[5], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 5;
    }

    bdist = nrv_node_bdist(&clan->nodes[6], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 6;
    }

    bdist = nrv_node_bdist(&clan->nodes[7], data);
    if(bdist < *min)
    {
        *min = bdist;
        *winner = 7;
    }
}

//------------------------------------------------------------------------------------------------------------
// might need to update to where provides all the distances for a particular clan...
// some how it needs to eventually assume based on distance what the answer is...
// if that distance is the same as someone elses then we need to be able to say it is a mixture???
// well maybe not for nerve... since nerve will be for code-golfing ascii stuffs...
// then maybe make the nodes configurable and have the clan discouraging concept.

// I like the clan of clan concept...
// This one uses the same circle concept where each clan will receive a factor of which it can move its closest node.
// but, at the top level (0) the clans between clans has no affect.
// basically a clan of clans acts the same as a clan of nodes.
// why need the sqrt? the comparison is the same.
// Yes, because even with 2^32 sized length input => (2^32)*(255^2) < (2^32)*((2^8)^2) = (2^32)*(2^16) = 2^48 < 2^64

// can also have avg concept. Where it takes all nodes within so close or same closeness and avgs the labels.
static void nrv_clans_winner(
    nrv_clan_t *clans,
    int count,
    nrv_data_t *data,
    nrv_bdist_t *min,
    int *winner,
    int *node_winner)
{
    int i;
    nrv_clan_winner(clans, data, min, node_winner);
    *winner = 0;
    for(i = 1; i < count; ++i)
    {
        nrv_bdist_t bdist;
        int t;
        nrv_clan_winner(clans + i, data, &bdist, &t);
        if(bdist < *min)
        {
            *min = bdist;
            *winner = i;
            *node_winner = t;
        }
    }
}

//------------------------------------------------------------------------------------------------------------
static void nrv_clan_moveto(
    nrv_clan_t *clan,
    nrv_data_t *data,
    nrv_bdist_t bdist,
    int winner,
    double nlimiter,
    double llimiter)
{
    int i;
    int p = (winner-1)&7;
    int pp = (winner-2)&7;
    int ppp = (winner-3)&7;
    int n = (winner+1)&7;
    int nn = (winner+2)&7;
    int nnn = (winner+3)&7;
    int l = (winner+4)&7;
    double f = llimiter * nlimiter;
    double ff = f * nlimiter;
    double fff = ff * nlimiter;
    double ffff = fff * nlimiter;

    for(i = 0; i < data->count; ++i)
    {
        clan->nodes[winner].weights[i] += (unsigned char)(
            round(llimiter * (double)(data->content[i] - clan->nodes[winner].weights[i]))
        );
        clan->nodes[p].weights[i] += (unsigned char)(
            round(f * (double)(data->content[i] - clan->nodes[p].weights[i]))
        );
        clan->nodes[n].weights[i] += (unsigned char)(
            round(f * (double)(data->content[i] - clan->nodes[n].weights[i]))
        );
        clan->nodes[pp].weights[i] += (unsigned char)(
            round(ff * (double)(data->content[i] - clan->nodes[pp].weights[i]))
        );
        clan->nodes[nn].weights[i] += (unsigned char)(
            round(ff * (double)(data->content[i] - clan->nodes[nn].weights[i]))
        );
        clan->nodes[ppp].weights[i] += (unsigned char)(
            round(fff * (double)(data->content[i] - clan->nodes[ppp].weights[i]))
        );
        clan->nodes[nnn].weights[i] += (unsigned char)(
            round(fff * (double)(data->content[i] - clan->nodes[nnn].weights[i]))
        );
        clan->nodes[l].weights[i] += (unsigned char)(
            round(ffff * (double)(data->content[i] - clan->nodes[l].weights[i]))
        );
    }
}

#endif
