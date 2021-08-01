#include <iostream>
#include <stdio.h>

#include <test/stopwatch.h>
#include <nrv/bsom.h>

#include <chrono>
#include <cmath>

#define NUM_SAMPLES 800
#define ROUND_DIV(x, y) uint64_t(std::round(double(x)/y))
#define AVGOP(ns) ROUND_DIV(ns.count(), NUM_SAMPLES)

#define IS_WITHIN_ERROR(error) (-0.001f < error && error < 0.001f)

int main()
{
    int result = 0;

    std::cout << "------------------------------------------------------------" << std::endl;
    std::cout << "testing bsom" << std::endl;

    {
        #define NITERS 10000
        #define NDATAS 5
        #define NITEMS 2
        unsigned char contents[NDATAS*NITEMS] = {
            '0', '1',
            '3', '2',
            '2', '3',
            '1', '0',
            '2', '2'
        };
        nrv_data_t datas[NDATAS] = {
            { NITEMS, contents + 0*NITEMS },
            { NITEMS, contents + 1*NITEMS },
            { NITEMS, contents + 2*NITEMS },
            { NITEMS, contents + 3*NITEMS },
            { NITEMS, contents + 4*NITEMS }
        };

        #define NCLANS 2
        unsigned char weights[NCLANS*NITEMS*8] = {
            '\0', '\1',
            '\1', '\2',
            '\2', '\3',
            '\3', '\4',
            '\4', '\4',
            '\4', '\3',
            '\2', '\1',
            '\1', '\0',

            '\10', '\11',
            '\11', '\12',
            '\12', '\13',
            '\13', '\14',
            '\14', '\14',
            '\14', '\13',
            '\12', '\11',
            '\11', '\10'
        };
        nrv_clan_t clans[NCLANS] = {
            {{
                { weights + 0*NITEMS },
                { weights + 1*NITEMS },
                { weights + 2*NITEMS },
                { weights + 3*NITEMS },
                { weights + 4*NITEMS },
                { weights + 5*NITEMS },
                { weights + 6*NITEMS },
                { weights + 7*NITEMS }
            }},
            {{
                { weights + (0 + 8)*NITEMS },
                { weights + (1 + 8)*NITEMS },
                { weights + (2 + 8)*NITEMS },
                { weights + (3 + 8)*NITEMS },
                { weights + (4 + 8)*NITEMS },
                { weights + (5 + 8)*NITEMS },
                { weights + (6 + 8)*NITEMS },
                { weights + (7 + 8)*NITEMS }
            }}
        };

        for(int c = 0; c < NCLANS; ++c)
        {
            for(int n = 0; n < 8; ++n)
            {
                std::cout << "node: " << c << ", " << n << std::endl;
                std::cout << "    [" << (int)clans[c].nodes[n].weights[0] << ", " << (int)clans[c].nodes[n].weights[1] << "]" << std::endl;
            }
        }

        for(int i = 0; i < NITERS; ++i)
        {
            for(int x = 0; x < NDATAS; ++x)
            {
                int clan;
                int node;
                nrv_bdist_t min;
                nrv_clans_winner(clans, NCLANS, datas + x, &min, &clan, &node);
                nrv_clan_moveto(clans + clan, datas + x, min, node, 0.01, 1000.0/i);
            }
        }

        for(int x = 0; x < NDATAS; ++x)
        {
            int clan;
            int node;
            nrv_bdist_t min;
            nrv_clans_winner(clans, NCLANS, datas + x, &min, &clan, &node);
            std::cout << "data: " << x << " [" << (int)datas[x].content[0] << ", " << (int)datas[x].content[1] << "] -> " << clan << ", " << node << std::endl;
        }

        for(int c = 0; c < NCLANS; ++c)
        {
            for(int n = 0; n < 8; ++n)
            {
                std::cout << "node: " << c << ", " << n << std::endl;
                std::cout << "    [" << (int)clans[c].nodes[n].weights[0] << ", " << (int)clans[c].nodes[n].weights[1] << "]" << std::endl;
            }
        }
    }

    std::cout << "completed bsom test." << std::endl;
    std::cout << "------------------------------------------------------------" << std::endl;

    return result;
}