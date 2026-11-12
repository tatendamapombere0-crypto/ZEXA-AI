#!/usr/bin/env python3
"""
scripts/build_full_exam_expansion.py
Full-scale ZIMSEC past exam question deduplication, standardization and 500-question expansion engine.
Ensures:
1. 0 duplicates across all 97 papers
2. Paper 1 MCQ: 4 distinct options (A, B, C, D), correct letter, in-depth explanation
3. Paper 2 & 3 Theory: empty options, null correctAnswer, paragraph model answer with mark schemes
4. Up to 500 authentic past exam questions per paper across all subjects
"""

import os
import json
import re
import copy

MANIFEST_PATH = 'src/data/exam_manifest.json'
PUBLIC_MANIFEST_PATH = 'public/assets/exam_manifest.json'
ASSETS_DIR = 'public/assets'

def norm_str(s):
    if not s:
        return ""
    s = re.sub(r'^(Q\d+[:.]?\s*|\d+[\.)]\s*)', '', s.strip(), flags=re.IGNORECASE)
    s = re.sub(r'\s+', ' ', s).strip().lower()
    s = re.sub(r'[^\w\s]', '', s)
    return s

def clean_q_text(text, q_num):
    if not text:
        return f"Question {q_num}"
    cleaned = re.sub(r'^(Question\s+\d+[:.]?\s*|Q\d+[:.]?\s*|\d+[\.)]\s*)+', '', text.strip(), flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    if not cleaned:
        return f"Question {q_num}"
    cleaned = cleaned[0].upper() + cleaned[1:]
    return cleaned

# Load manifest
manifest = json.load(open(MANIFEST_PATH))
print(f"Loaded manifest with {len(manifest)} papers.")
