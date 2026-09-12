#include "algorithms.hpp"

#include <chrono>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

// Citește tot conținutul unui fișier, sau de la intrarea standard dacă
// sursa este "-". Textul e tratat ca șir de octeți, nu neapărat ca text
// UTF-8 valid caracter-cu-caracter, dar asta nu afectează corectitudinea
// căutării (căutăm subșir de octeți).
std::string readAllText(const std::string& source) {
    if (source == "-") {
        std::ostringstream buffer;
        buffer << std::cin.rdbuf();
        return buffer.str();
    }
    std::ifstream file(source, std::ios::binary);
    if (!file) {
        throw std::runtime_error("Nu pot citi fișierul: " + source);
    }
    std::ostringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

std::string jsonEscape(const std::string& text) {
    std::string escaped;
    escaped.reserve(text.size());
    for (const char character : text) {
        switch (character) {
            case '"': escaped += "\\\""; break;
            case '\\': escaped += "\\\\"; break;
            case '\n': escaped += "\\n"; break;
            default: escaped += character;
        }
    }
    return escaped;
}

struct RunResult {
    std::string algorithmName;
    std::vector<size_t> matchPositions;
    double elapsedMicroseconds;
};

RunResult runAlgorithm(const std::string& algorithmName, const std::string& text, const std::string& pattern) {
    using Clock = std::chrono::high_resolution_clock;

    const auto startTime = Clock::now();
    std::vector<size_t> matchPositions;
    if (algorithmName == "kmp") {
        matchPositions = searchKMP(text, pattern);
    } else if (algorithmName == "bmh") {
        matchPositions = searchBoyerMooreHorspool(text, pattern);
    } else if (algorithmName == "rk") {
        matchPositions = searchRabinKarp(text, pattern);
    } else {
        throw std::runtime_error("Algoritm necunoscut: " + algorithmName + " (acceptați: kmp, bmh, rk, all)");
    }
    const auto endTime = Clock::now();

    const double elapsedMicroseconds = std::chrono::duration<double, std::micro>(endTime - startTime).count();
    return RunResult{algorithmName, std::move(matchPositions), elapsedMicroseconds};
}

void printResultAsJson(const RunResult& result, size_t textLength, size_t patternLength) {
    std::cout << "{"
              << "\"algorithm\":\"" << result.algorithmName << "\","
              << "\"text_length\":" << textLength << ","
              << "\"pattern_length\":" << patternLength << ","
              << "\"match_count\":" << result.matchPositions.size() << ","
              << "\"time_us\":" << result.elapsedMicroseconds << ","
              << "\"matches\":[";
    for (size_t i = 0; i < result.matchPositions.size(); ++i) {
        if (i != 0) std::cout << ",";
        std::cout << result.matchPositions[i];
    }
    std::cout << "]}";
}

}  // namespace

int main(int argc, char** argv) {
    if (argc < 4) {
        std::cerr << "Utilizare: search_engine <kmp|bmh|rk|all> <fișier_text|-> <șablon>\n"
                   << "  fișier_text poate fi \"-\" pentru a citi textul de la intrarea standard\n";
        return 1;
    }

    const std::string algorithmName = argv[1];
    const std::string textSource = argv[2];
    const std::string pattern = argv[3];

    try {
        const std::string text = readAllText(textSource);

        if (algorithmName == "all") {
            std::cout << "[";
            const char* allAlgorithmNames[] = {"kmp", "bmh", "rk"};
            for (size_t i = 0; i < 3; ++i) {
                if (i != 0) std::cout << ",";
                const RunResult result = runAlgorithm(allAlgorithmNames[i], text, pattern);
                printResultAsJson(result, text.size(), pattern.size());
            }
            std::cout << "]\n";
        } else {
            const RunResult result = runAlgorithm(algorithmName, text, pattern);
            printResultAsJson(result, text.size(), pattern.size());
            std::cout << "\n";
        }
    } catch (const std::exception& error) {
        std::cerr << "{\"error\":\"" << jsonEscape(error.what()) << "\"}\n";
        return 1;
    }

    return 0;
}
