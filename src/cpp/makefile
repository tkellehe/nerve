
all: test trainer

test: bin/test_nrv 

trainer: bin/trainer

clean:
	rm -rf bin/*

bin/test_nrv: test/test_nrv.cpp nrv.hpp
	@mkdir -p bin
	g++ -O6 -I. test/test_nrv.cpp -o bin/test_nrv

bin/trainer: app/trainer.cpp nrv.hpp
	@mkdir -p bin
	g++ -std=c++17 -O6 -I. app/trainer.cpp -o bin/trainer