import pypdf

reader = pypdf.PdfReader(r'C:\Users\pc\.gemini\antigravity\brain\bc597c41-fcde-4c6a-bb4c-fe8902bf0d37\.user_uploaded\media_1793076336454_71342276.pdf')
text = ""
for i, page in enumerate(reader.pages):
    text += f"\n--- PAGE {i+1} ---\n" + page.extract_text()

with open('scripts/extracted_pdf_sheet.txt', 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Extracted {len(reader.pages)} pages to scripts/extracted_pdf_sheet.txt ({len(text)} chars)")
