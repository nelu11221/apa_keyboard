#include "algorithms.hpp"

#include <cstdint>

std::vector<size_t> searchRabinKarp(const std::string& text, const std::string& pattern) {
    std::vector<size_t> matches;
    const size_t n = text.size();
    const size_t m = pattern.size();
    if (m == 0 || m > n) return matches;

    constexpr uint64_t base = 256;
    constexpr uint64_t modulus = 1000000007ULL;

    // "power" = base ridicat la puterea (lungimea șablonului - 1), mod modulus.
    // Ne trebuie ca să putem scoate contribuția primului caracter din fereastră
    // atunci când fereastra avansează cu o poziție.
    uint64_t power = 1;
    for (size_t i = 0; i + 1 < m; ++i) {
        power = (power * base) % modulus;
    }

    uint64_t patternHash = 0;
    uint64_t windowHash = 0;
    for (size_t i = 0; i < m; ++i) {
        patternHash = (patternHash * base + static_cast<unsigned char>(pattern[i])) % modulus;
        windowHash = (windowHash * base + static_cast<unsigned char>(text[i])) % modulus;
    }

    size_t windowStart = 0;
    while (true) {
        // Hash-urile identice nu garantează un match real (pot exista
        // coliziuni), așa că verificăm întotdeauna caracter-cu-caracter
        // înainte să acceptăm o potrivire.
        if (windowHash == patternHash &&
            text.compare(windowStart, m, pattern) == 0) {
            matches.push_back(windowStart);
        }
        if (windowStart + m >= n) break;

        const uint64_t leavingChar = static_cast<unsigned char>(text[windowStart]);
        const uint64_t enteringChar = static_cast<unsigned char>(text[windowStart + m]);

        windowHash = (windowHash + modulus - (leavingChar * power) % modulus) % modulus;
        windowHash = (windowHash * base + enteringChar) % modulus;

        ++windowStart;
    }
    return matches;
}
