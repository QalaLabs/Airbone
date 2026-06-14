import zipfile
import xml.etree.ElementTree as ET
import sys
import os

def get_docx_text(path):
    try:
        with zipfile.ZipFile(path) as z:
            doc_xml = z.read("word/document.xml")
            root = ET.fromstring(doc_xml)
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            paragraphs = []
            for para in root.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p"):
                texts = [node.text for node in para.iter("{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t") if node.text]
                if texts:
                    paragraphs.append("".join(texts))
            return "\n".join(paragraphs)
    except Exception as e:
        return f"Error reading {path}: {str(e)}"

def main():
    folder = "C:\\Users\\pc\\Desktop\\Airbone other files"
    files = [
        "Airborne Aviation Academy_ Brand Identity and Strategy Manual.docx",
        "Airborne Aviation Web Ecosystem PRD.docx"
    ]
    for filename in files:
        filepath = os.path.join(folder, filename)
        text = get_docx_text(filepath)
        out_name = filename.replace(".docx", ".txt")
        out_path = os.path.join("c:\\Users\\pc\\Desktop\\Airbone\\scratch", out_name)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Wrote {out_path}")

if __name__ == "__main__":
    main()
