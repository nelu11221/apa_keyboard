#include "algorithms.hpp"

// Construiește funcția de eșec: pentru fiecare poziție i din șablon,
// failFunction[i] = lungimea celui mai lung prefix propriu al șablonului
// (până la poziția i inclusiv) care este în același timp și sufix al lui.
// Asta ne spune, la o nepotrivire, cât de mult putem "reveni" în șablon
// fără să pierdem informația deja verificată în text.
static std::vector<size_t> buildFailureFunction(const std::string& pattern) {
    const size_t m = pattern.size();
    std::vector<size_t> failFunction(m, 0);

    size_t matchedLength = 0;
    for (size_t i = 1; i < m; ++i) {
        while (matchedLength > 0 && pattern[i] != pattern[matchedLength]) {
            matchedLength = failFunction[matchedLength - 1];
        }
        if (pattern[i] == pattern[matchedLength]) {
            ++matchedLength;
        }
        failFunction[i] = matchedLength;
    }
    return failFunction;
}

std::vector<size_t> searchKMP(const std::string& text, const std::string& pattern) {
    std::vector<size_t> matches;
    const size_t n = text.size();
    const size_t m = pattern.size();
    if (m == 0 || m > n) return matches;

    const std::vector<size_t> failFunction = buildFailureFunction(pattern);

    size_t matchedLength = 0;
    for (size_t i = 0; i < n; ++i) {
        while (matchedLength > 0 && text[i] != pattern[matchedLength]) {
            matchedLength = failFunction[matchedLength - 1];
        }
        if (text[i] == pattern[matchedLength]) {
            ++matchedLength;
        }
        if (matchedLength == m) {
            matches.push_back(i - m + 1);
            matchedLength = failFunction[matchedLength - 1];
        }
    }
    return matches;
}
