CXX ?= clang++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra -Iinclude
BUILD_DIR = build

ALGO_SOURCES = src/kmp.cpp src/boyer_moore_horspool.cpp src/rabin_karp.cpp

.PHONY: all test clean

all: $(BUILD_DIR)/search_engine

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/search_engine: src/main.cpp $(ALGO_SOURCES) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $^

$(BUILD_DIR)/run_tests: tests/test_algorithms.cpp $(ALGO_SOURCES) | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $@ $^

test: $(BUILD_DIR)/run_tests
	./$(BUILD_DIR)/run_tests

clean:
	rm -rf $(BUILD_DIR)
