#include <fstream>
#include <iostream>
#include <sstream>
#include <map>
#include <set>
#include <stdio.h>


#include <filesystem>


#include <nrv.hpp>


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Development Notes:
// 
// # dirs
// Need to make a better label/data input trainer.
// Most likely directories with arbitrary files.
// Then maybe some kind of info about the input vector size.
// Or, change the trainer to take in an input size... that might be better...
// Then have a label directory and a data directory.
// For each file named in the data directory a corresponding file with the same name appears in the labels.
// 
// 
// # losers
// It might be useful to find the most loser and move it towards the closest winner (labeled node).
// 
// 
// # pruning
// The biggest thing is a method for producing smaller more concise networks.
// A possible way to do this would be to train a single layer.
// Then take the input vectors of the winners to train a second layer.
// The second layer would be smaller and moves towards an approximation of the first layer.
// Then take the labels given to the data and ensure no conflicts (two or more labels assigned to a node).
// 
// 
// # categorizing
// The current structure is optimized towards producing a small neural network that can categorize.
// This is not the only type of neural network and is closer to the left brain functionality only.
// Essentially, the idea of a good categorizing network is one that finds similarities to produce
// the categories.
// That is what the byte SOM and clan layering tends to produce.
// 
// 
// # categorizing & predicting
// Categorizing and predicting are the main two functionalities from a neural network that should be needed.
// Categorizing can be used to build generalizing by virtue of looking for similarities between categories.
// Predicting is context aware and more relates to the right brain functionality.
// It is useful for developing more creative concepts by attempting to guess where things could go next.
// 
// 
//////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
        if((strcmp(argv[i], "--clan") == 0) || (strcmp(argv[i], "-c") == 0))
        {
            if(++i == argc)
            {
                help(std::cerr);
                return -1;
            }
            clans->second.push_back(argv[i]);
        }
        else if((strcmp(argv[i], "--data") == 0) || (strcmp(argv[i], "-d") == 0))
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
        else if((strcmp(argv[i], "--help") == 0) || (strcmp(argv[i], "-h") == 0))
        {
            help(std::cout);
            return 0;
        }
        else if((strcmp(argv[i], "--input-size") == 0) || (strcmp(argv[i], "-I") == 0))
        {
            if(++i == argc)
            {
                help(std::cerr);
                return -1;
            }
            std::vector<std::string> v;
            v.push_back(argv[i]);
            args["--input-size"] = v;
        }
        else if((strcmp(argv[i], "--iterations") == 0) || (strcmp(argv[i], "-i") == 0))
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
        else if((strcmp(argv[i], "--verbose") == 0) || (strcmp(argv[i], "-v") == 0))
        {
            std::vector<std::string> v;
            args["--verbose"] = v;
        }
    }
    return 0;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// MAIN
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
int main(int argc, char* argv[])
{
    bool isVerbose = false;
    std::vector<nrv::Data> datas;
    std::vector<nrv::Label> labels;
    std::vector<nrv::Clan> clans;
    nrv::Size inputSize;
    nrv::Size iterations;

    //--------------------------------------------------------------------------------------------------------
    // Make sure we have some arguments.
    if(!argc)
    {
        help(std::cout);
        return 0;
    }

    //--------------------------------------------------------------------------------------------------------
    // Extract all of the arguments.
    ArgMap args;
    {
        int result(extractArgs(args, argc, argv));
        if(result) return result;
    }

    //--------------------------------------------------------------------------------------------------------
    // Detect if in verbose mode.
    {
        ArgMap::const_iterator arg(args.find("--verbose"));
        isVerbose = arg != args.cend();
    }

    //--------------------------------------------------------------------------------------------------------
    // Get the size of the input vector.
    {
        ArgMap::const_iterator arg(args.find("--input-size"));
        if(arg == args.cend())
        {
            inputSize = 0;
        }
        else
        {
            std::stringstream ss;
            ss << arg->second[0];
            ss >> inputSize;
        }

        if(isVerbose)
        {
            std::cout << "Input Vector Size                " << inputSize << std::endl;
        }
    }

    //--------------------------------------------------------------------------------------------------------
    // Get the number of times to apply the training.
    {
        ArgMap::const_iterator arg(args.find("--iterations"));
        if(arg == args.cend())
        {
            iterations = 0;
        }
        else
        {
            std::stringstream ss;
            ss << arg->second[0];
            ss >> iterations;
        }

        if(isVerbose)
        {
            std::cout << "Number of Training Iterations    " << iterations << std::endl;
        }
    }

    //--------------------------------------------------------------------------------------------------------
    // Build all of the clans.
    {
        ArgMap::const_iterator arg(args.find("--clan"));
        if(arg == args.cend())
        {
            help(std::cerr);
            return -1;
        }

        clans.resize(arg->second.size());
        for(nrv::Index i = 0; i < arg->second.size(); ++i)
        {
            std::stringstream ss;
            ss << arg->second[i];
            nrv::Size clanSize;
            ss >> clanSize;
            clans[i].generate(clanSize, inputSize);
            clans[i].compute();
            clans[i].randomize(i * clanSize);
        }

        if(isVerbose)
        {
            std::cout << "Number of Clans                  " << clans.size() << std::endl;
        }
    }

    //--------------------------------------------------------------------------------------------------------
    // Load in all of the data.
    {
        ArgMap::const_iterator arg(args.find("--data"));
        if(arg == args.cend())
        {
            help(std::cerr);
            return -1;
        }

        for(const auto& filename : std::filesystem::recursive_directory_iterator(arg->second[0]))
        {
            if(!filename.is_directory())
            {
                std::ifstream dataFile;
                dataFile.open(filename.path());
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
            }
        }

        if(isVerbose)
        {
            std::cout << "Number of Training Samples       " << datas.size() << std::endl;
        }
    }

    //--------------------------------------------------------------------------------------------------------
    // Train the neural network.
    {
        if(isVerbose)
        {
            std::cout << "------------------------------------------------------------" << std::endl;
            std::cout << "training..." << std::endl;
        }

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

        if(isVerbose)
        {
            std::cout << "------------------------------------------------------------" << std::endl;
        }
    }

    return 0;
}