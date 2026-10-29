"""
Script to help download the training dataset (fake_job_postings.csv).

Dataset: Real / Fake Job Posting Prediction (EMSCAD)
Source: Kaggle (shivamb/real-or-fake-fake-jobposting-prediction)
Destination: scamradar_backend/data/fake_job_postings.csv
"""

import sys
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "scamradar_backend" / "data"
DATASET_PATH = DATA_DIR / "fake_job_postings.csv"


def main():
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    if DATASET_PATH.exists():
        size_mb = DATASET_PATH.stat().st_size / (1024 * 1024)
        print(f"[OK] Dataset already present at {DATASET_PATH} ({size_mb:.2f} MB)")
        return

    print("=" * 70)
    print("ScamRadar Dataset Download Helper")
    print("=" * 70)
    print("\nThe EMSCAD dataset is not tracked in git to keep repository size lean.")
    print("You can obtain 'fake_job_postings.csv' in one of two ways:\n")
    print("Option 1: Using the Kaggle CLI (recommended):")
    print("  1. Ensure you have the kaggle package: pip install kaggle")
    print("  2. Place your kaggle.json in ~/.kaggle/")
    print("  3. Run:")
    print("     kaggle datasets download -d shivamb/real-or-fake-fake-jobposting-prediction -p scamradar_backend/data --unzip")
    print("\nOption 2: Direct browser download:")
    print("  1. Visit: https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction")
    print("  2. Download the archive, extract 'fake_job_postings.csv'")
    print(f"  3. Move it to: {DATASET_PATH.resolve()}")
    print("=" * 70)


if __name__ == "__main__":
    main()

