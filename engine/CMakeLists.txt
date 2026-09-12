cmake_minimum_required(VERSION 3.16)
project(search_engine CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()
set(CMAKE_CXX_FLAGS_RELEASE "-O2")

add_library(algorithms
  src/kmp.cpp
  src/boyer_moore_horspool.cpp
  src/rabin_karp.cpp
)
target_include_directories(algorithms PUBLIC include)

add_executable(search_engine src/main.cpp)
target_link_libraries(search_engine PRIVATE algorithms)

add_executable(run_tests tests/test_algorithms.cpp)
target_link_libraries(run_tests PRIVATE algorithms)

enable_testing()
add_test(NAME algorithm_correctness COMMAND run_tests)
