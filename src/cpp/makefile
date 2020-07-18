
TESTS := bin/test_f16

all: $(TESTS)

clean:
	rm -rf bin/*

bin/test_f16: test/test_f16.cpp nrv/f16.h
	@mkdir -p bin
	g++ -O6 -I. test/test_f16.cpp -o bin/test_f16

