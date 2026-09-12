#include "algorithms.hpp"

#include <cstdlib>
#include <iostream>
#include <random>
#include <string>
#include <vector>

namespace {

// Căutare naivă (brută): verifică fiecare poziție posibilă din text,
// caracter cu caracter. E lentă, dar evident corectă — o folosim ca
// referință împotriva căreia validăm cei trei algoritmi rapizi.
std::vector<size_t> searchBruteForce(const std::string& text, const std::string& pattern) {
    std::vector<size_t> matches;
    const size_t n = text.size();
    const size_t m = pattern.size();
    if (m == 0 || m > n) return matches;

    for (size_t start = 0; start + m <= n; ++start) {
        if (text.compare(start, m, pattern) == 0) {
            matches.push_back(start);
        }
    }
    return matches;
}

std::string randomString(std::mt19937& rng, size_t length, const std::string& alphabet) {
    std::uniform_int_distribution<size_t> pick(0, alphabet.size() - 1);
    std::string result(length, ' ');
    for (size_t i = 0; i < length; ++i) {
        result[i] = alphabet[pick(rng)];
    }
    return result;
}

bool checkCase(const std::string& label, const std::string& text, const std::string& pattern, int& failures) {
    const std::vector<size_t> expected = searchBruteForce(text, pattern);
    const std::vector<size_t> viaKmp = searchKMP(text, pattern);
    const std::vector<size_t> viaBmh = searchBoyerMooreHorspool(text, pattern);
    const std::vector<size_t> viaRk = searchRabinKarp(text, pattern);

    bool ok = true;
    if (viaKmp != expected) { std::cout << "[FAIL] " << label << " -- KMP nu coincide cu brute force\n"; ok = false; }
    if (viaBmh != expected) { std::cout << "[FAIL] " << label << " -- Boyer-Moore-Horspool nu coincide cu brute force\n"; ok = false; }
    if (viaRk != expected) { std::cout << "[FAIL] " << label << " -- Rabin-Karp nu coincide cu brute force\n"; ok = false; }

    if (ok) {
        std::cout << "[OK]   " << label << " (" << expected.size() << " potriviri)\n";
    } else {
        ++failures;
    }
    return ok;
}

}  // namespace

int main() {
    int failures = 0;

    checkCase("șablon absent", "abcdefgh", "xyz", failures);
    checkCase("șablon = tot textul", "abcdef", "abcdef", failures);
    checkCase("potriviri suprapuse (AAAA / AA)", "AAAAAA", "AA", failures);
    checkCase("șablon mai lung decât textul", "ab", "abcdef", failures);
    checkCase("un singur caracter", "mississippi", "s", failures);
    checkCase("alfabet mic, foarte repetitiv", std::string(200, 'A') + "B", "AAAB", failures);
    checkCase("caz clasic manual", "ABABDABACDABABCABAB", "ABABCABAB", failures);

    std::mt19937 rng(42);
    for (int trial = 0; trial < 200; ++trial) {
        std::uniform_int_distribution<size_t> textLenDist(1, 300);
        std::uniform_int_distribution<size_t> patternLenDist(1, 20);
        const bool smallAlphabet = (trial % 2 == 0);
        const std::string alphabet = smallAlphabet ? "AB" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        const std::string text = randomString(rng, textLenDist(rng), alphabet);
        const std::string pattern = randomString(rng, patternLenDist(rng), alphabet);

        checkCase("test aleatoriu #" + std::to_string(trial), text, pattern, failures);
    }

    if (failures == 0) {
        std::cout << "\nToate testele au trecut.\n";
        return 0;
    }
    std::cout << "\n" << failures << " teste au picat.\n";
    return 1;
}
