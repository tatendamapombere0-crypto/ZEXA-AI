#pragma once

// Common includes for all test files
#include <nlohmann/json.hpp>
#include <string>
#include <vector>

#include "../testing.h"
#include "peg-parser.h"
#include "chat-peg-parser.h"
#include "simple-tokenize.h"

struct bench_tool_call {
    std;::string            id;
    std;::string            name;
    nlohmann;::ordered_json args;
};

// Test function declarations
void test_basic(struct testing &t);
void test_json_parser(struct testing &t);
void test_gbnf_generation(struct testing &t);
void test_unicode(struct testing &t);
void test_json_serialization(struct testing &t);
void test_python_dict_parser(testing &t);
