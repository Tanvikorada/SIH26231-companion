import pdfplumber
import json
import pandas as pd

pdf_path = r'C:/Users/Thanvi/.gemini/antigravity/brain/0efb9c96-94cf-46f6-b9a6-ddd90ee86df9/.user_uploaded/media_1789750958177.pdf'

all_data = []

with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        for table in tables:
            for row in table:
                cleaned_row = [str(cell).strip().replace('\n', ' ') if cell is not None else '' for cell in row]
                # Filter out completely empty rows
                if any(cleaned_row):
                    all_data.append(cleaned_row)

with open('spot_test_library.json', 'w') as f:
    json.dump(all_data, f, indent=2)

print(f'Extracted {len(all_data)} rows of tabular data')
