
TESTS := bin/test_f16 bin/test_kc

all: $(TESTS)

clean:
	rm -rf bin/*

bin/test_f16: test/test_f16.cpp nrv/f16.h
	@mkdir -p bin
	g++ -O6 -I. test/test_f16.cpp -o bin/test_f16

bin/test_kc: test/test_kc.cpp nrv/f16.h nrv/kc.h
	@mkdir -p bin
	g++ -O6 -I. test/test_kc.cpp -o bin/test_kc

