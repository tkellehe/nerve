#include <fstream>
#include <iostream>
#include <sstream>
#include <map>
#include <set>
#include <stdio.h>

#include <filesystem>


#include <nrv.hpp>


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
void help(std::ostream& out)
{
    out << "not right..." << std::endl;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
typedef std::map< std::string, std::vector<std::string> > ArgMap;
int extractArgs(ArgMap& args, int argc, char* argv[])
{
    std::pair<ArgMap::iterator, bool> result =
        args.insert(ArgMap::value_type("--clan", std::vector<std::string>()));
    ArgMap::iterator clans = result.first;
    for(int i = 1; i < argc; ++i)
    {
        if(strcmp(argv[i], "--help") == 0 || strcmp(argv[i], "-h") == 0)
        {
            help(std::cout);
            return 0;
        }
        else if(strcmp(argv[i], "--data") == 0 || strcmp(argv[i], "-d") == 0)
        {
            if(++i == argc)
            {
                help(std::cerr);
                return -1;
            }
            std::vector<std::string> v;
            v.push_back(argv[i]);
            args["--data"] = v;
        }
        else if(strcmp(argv[i], "--iterations") == 0 || strcmp(argv[i], "-i") == 0)
        {
            if(++i == argc)
            {
                help(std::cerr);
                return -1;
            }
            std::vector<std::string> v;
            v.push_back(argv[i]);
            args["--iterations"] = v;
        }
        else if(strcmp(argv[i], "--clan") == 0 || strcmp(argv[i], "-c") == 0)
        {
            if(++i == argc)
            {
                help(std::cerr);
                return -1;
            }
            clans->second.push_back(argv[i]);
        }
    }
    return 0;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// MAIN
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
int main(int argc, char* argv[])
{
    std::vector<nrv::Data> datas;
    std::vector<nrv::Label> labels;
    std::vector<nrv::Clan> clans;
    nrv::Size inputSize;
    nrv::Size iterations;

    //--------------------------------------------------------------------------------------------------------
    // Extract all of the arguments.
    ArgMap args;
    {
        int result(extractArgs(args, argc, argv));
        if(result) return result;
    }

    //--------------------------------------------------------------------------------------------------------
    // Get the number of times to apply the training.

    ArgMap::const_iterator iterationsArg(args.find("--iterations"));
    if(iterationsArg == args.cend())
    {
        iterations = 0;
    }
    else
    {
        std::stringstream ss;
        ss << iterationsArg->second[0];
        ss >> iterations;
    }

    //--------------------------------------------------------------------------------------------------------
    // Load in all of the data.

    ArgMap::const_iterator dataArg(args.find("--data"));
    if(dataArg == args.cend())
    {
        help(std::cerr);
        return -1;
    }

    // Change to grabbing all files in the directory.
    // Grabs nrv_info file to get input size.
    // label# and data# files.
    std::ifstream dataFiles;
    dataFiles.open(dataArg->second[0]);
    if(dataFiles.is_open())
    {
        std::string line;
        if(std::getline(dataFiles, line))
        {
            std::stringstream ss;
            ss << line;
            ss >> inputSize;
        }

        while(std::getline(dataFiles, line))
        {
            std::ifstream dataFile;
            dataFile.open(line);
            if(dataFile.is_open())
            {
                dataFile.seekg(0, std::ios::end);
                nrv::Size length(dataFile.tellg());
                dataFile.seekg(0, std::ios::beg);
                datas.resize(datas.size() + 1);
                nrv::Data& data(datas[datas.size() - 1]);

                if(inputSize < length)
                {
                    std::cerr << "Data file too long for input vector..." << std::endl;
                    return -1;
                }

                data.resize(inputSize);
                dataFile.read((char*)data.data(), length);
                dataFile.close();
            }

            std::getline(dataFiles, line);

            labels.resize(labels.size() + 1);
            nrv::Label& label(labels[labels.size() - 1]);
            label.resize(line.length());
            for(nrv::Index i = 0; i < line.length(); ++i)
            {
                label[i] = (nrv::Uint8)line[i];
            }
            labels.push_back(label);
        }
        dataFiles.close();
    }

    //--------------------------------------------------------------------------------------------------------
    // Build all of the clans.

    ArgMap::const_iterator clanArg(args.find("--clan"));
    if(clanArg == args.cend())
    {
        help(std::cerr);
        return -1;
    }

    clans.resize(clanArg->second.size());
    for(nrv::Index i = 0; i < clanArg->second.size(); ++i)
    {
        std::stringstream ss;
        ss << clanArg->second[i];
        nrv::Size clanSize;
        ss >> clanSize;
        clans[i].generate(clanSize, inputSize);
        clans[i].compute();
        clans[i].randomize(i * clanSize);
    }

    //--------------------------------------------------------------------------------------------------------
    // Train the neural network.

    for(nrv::Index i = iterations; i--;)
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

    for(nrv::Index i = 0; i < clans.size(); ++i)
    {
        std::cout << "clans[" << i << "] = " << clans[i] << std::endl << std::endl;
    }

    return 0;
}