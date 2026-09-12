#include "algorithms.hpp"

#include <array>

std::vector<size_t> searchBoyerMooreHorspool(const std::string& text, const std::string& pattern) {
    std::vector<size_t> matches;
    const size_t n = text.size();
    const size_t m = pattern.size();
    if (m == 0 || m > n) return matches;

    // Pentru fiecare caracter posibil (0-255), reținem cu cât putem
    // deplasa fereastra de căutare atunci când acel caracter e ultimul
    // din fereastra curentă a textului. Implicit, deplasarea e egală cu
    // lungimea șablonului (caracterul nu apare deloc în el, în afară de
    // ultima poziție).
    std::array<size_t, 256> shiftTable;
    shiftTable.fill(m);
    for (size_t i = 0; i + 1 < m; ++i) {
        shiftTable[static_cast<unsigned char>(pattern[i])] = m - 1 - i;
    }

    size_t windowStart = 0;
    while (windowStart + m <= n) {
        // Comparăm de la ultimul caracter al ferestrei spre primul.
        size_t offset = m;
        while (offset > 0 && pattern[offset - 1] == text[windowStart + offset - 1]) {
            --offset;
        }
        if (offset == 0) {
            matches.push_back(windowStart);
        }
        const unsigned char lastCharInWindow = static_cast<unsigned char>(text[windowStart + m - 1]);
        windowStart += shiftTable[lastCharInWindow];
    }
    return matches;
}
