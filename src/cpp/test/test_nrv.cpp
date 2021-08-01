#include <iostream>
#include <set>
#include <stdio.h>

#include <nrv.hpp>

int main()
{
    std::cout << "------------------------------------------------------------" << std::endl;
    
    {
        std::vector<nrv::Clan> clans;
        clans.resize(10);

        std::vector<nrv::Data> datas;
        datas.resize(10);

        for(nrv::Index i = 0; i < datas.size(); ++i)
        {
            datas[i].resize(5);
            for(nrv::Index j = 0; j < datas[i].size(); ++j)
            {
                datas[i][j] = nrv::brandom();
            }
        }

        for(nrv::Index c = 0; c < clans.size(); ++c)
        {
            clans[c].generate(8, datas[0].size());
            clans[c].compute();
            clans[c].randomize(c<<1);
        }

        for(nrv::Index c = 0; c < clans.size(); ++c)
        {
            std::cout << "clans[" << c << "] = " << clans[c] << std::endl;
        }

        std::cout << "training..." << std::endl;
        for(nrv::Index i = 10000; i--;)
        {
            for(nrv::Index d = 0; d < datas.size(); ++d)
            {
                nrv::Index clan;
                nrv::Index node;
                nrv::Distance distance;
                nrv::Clan::best(clans, datas[d], clan, node, distance);
                clans[clan].attract(node, 1.0, datas[d]);
            }
        }

        for(nrv::Index c = 0; c < clans.size(); ++c)
        {
            std::cout << "clans[" << c << "] = " << clans[c] << std::endl;
        }

        std::vector<nrv::Clan> pruned;
        std::set< std::pair<nrv::Index, nrv::Index> > seen;
        for(nrv::Index d = 0; d < datas.size(); ++d)
        {
            nrv::Index clan;
            nrv::Index node;
            nrv::Distance distance;
            nrv::Clan::best(clans, datas[d], clan, node, distance);
            std::cout << "datas[" << d << "] = " << datas[d] << " --> " << clan << ", " << node << " -- " << distance << std::endl;

            std::set< std::pair<nrv::Index, nrv::Index> >::const_iterator iter = seen.find({clan, node});
            if(iter == seen.cend())
            {
                seen.insert({clan, node});
                pruned.push_back(clans[clan]);
            }
        }

        std::cout << "pruned = [";
        for(nrv::Index c = 0; c < clans.size(); ++c)
        {
            for(nrv::Index n = 0; n < clans[c].nodes.size(); ++n)
            {
                for(nrv::Index w = 0; w < clans[c].nodes[n].weights.size(); ++w)
                {
                    std::cout << (int)clans[c].nodes[n].weights[w] << ", ";
                }
            }
        }
        std::cout << "]" << std::endl;
    }

    std::cout << "------------------------------------------------------------" << std::endl;

    return 0;
}