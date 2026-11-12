#!/usr/bin/env python3
"""
scripts/curate_and_expand_exam_banks.py
Full ZIMSEC Exam Bank Deduplication, Quality Standardization & High-Volume Expansion Engine.
"""

import os
import json
import re
import hashlib
import random

MANIFEST_PATH = 'src/data/exam_manifest.json'
PUBLIC_MANIFEST_PATH = 'public/assets/exam_manifest.json'
ASSETS_DIR = 'public/assets'

def normalize_text(text):
    if not text:
        return ""
    cleaned = re.sub(r'^(Q\d+[:.]?\s*|\d+[\.)]\s*)', '', text.strip(), flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip().lower()
    return cleaned

def clean_q_text(text, q_num):
    if not text:
        return f"Question {q_num}"
    cleaned = re.sub(r'^(Question\s+\d+[:.]?\s*|Q\d+[:.]?\s*|\d+[\.)]\s*)+', '', text.strip(), flags=re.IGNORECASE)
    cleaned = cleaned.strip()
    if not cleaned:
        return f"Question {q_num}"
    cleaned = cleaned[0].upper() + cleaned[1:]
    return cleaned

print("Engine base loaded.")
