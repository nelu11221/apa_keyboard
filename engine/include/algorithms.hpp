#pragma once

#include <cstddef>
#include <string>
#include <vector>

// Cei trei algoritmi de căutare a unui șablon într-un text. Fiecare
// returnează lista pozițiilor (indexate de la 0) din text unde șablonul
// apare integral, în ordine crescătoare. Toți trei rezolvă exact aceeași
// problemă, ca să poată fi comparați corect în etapa de analiză.

// Knuth–Morris–Pratt: precalculează o "funcție de eșec" pe șablon, ca să nu
// reexamineze niciodată un caracter din text mai mult decât o dată.
std::vector<size_t> searchKMP(const std::string& text, const std::string& pattern);

// Boyer–Moore–Horspool: compară șablonul cu textul de la coadă spre cap și
// sare peste porțiuni din text folosind ultimul caracter comparat.
std::vector<size_t> searchBoyerMooreHorspool(const std::string& text, const std::string& pattern);

// Rabin–Karp: calculează un hash "glisant" (rolling hash) al fiecărei
// porțiuni din text și îl compară cu hash-ul șablonului, verificând
// caracter-cu-caracter doar când hash-urile coincid.
std::vector<size_t> searchRabinKarp(const std::string& text, const std::string& pattern);
