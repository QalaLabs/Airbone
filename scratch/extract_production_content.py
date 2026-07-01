"""Extract visible text content from Google Sites HTML pages."""
import re
import html
import sys

def extract_text_from_google_sites(filepath):
    """Extract visible text content from a Google Sites HTML page."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Unescape HTML entities
    content = html.unescape(content)
    
    # Find the main content area - Google Sites uses specific class patterns
    # Look for text within specific content dividers
    
    # Remove script tags
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.DOTALL)
    # Remove style tags
    content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
    # Remove HTML comments
    content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)
    
    # Extract text from remaining HTML
    # Replace common block elements with newlines
    content = re.sub(r'<br\s*/?>', '\n', content)
    content = re.sub(r'</p>', '\n\n', content)
    content = re.sub(r'</div>', '\n', content)
    content = re.sub(r'</h[1-6]>', '\n\n', content)
    content = re.sub(r'</li>', '\n', content)
    content = re.sub(r'<li[^>]*>', '• ', content)
    
    # Remove remaining HTML tags
    content = re.sub(r'<[^>]+>', '', content)
    
    # Clean up whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    content = re.sub(r'[ \t]+', ' ', content)
    
    # Remove the Google Sites boilerplate
    lines = content.split('\n')
    meaningful_lines = []
    skip_patterns = [
        'window.ppConfig', 'DOCS_timing', '_DumpException', 'WIZ_global_data',
        '_docs_flag_initialData', '_at_config', 'window.globals', 'gapiLoaded',
        'function()', 'var ', 'Object.', '.prototype', 'typeof', 'ppConfig',
        'productName', 'Math.random', 'window.messages', 'buildLabel',
        'editors.sites', 'AIzaSy', '897606708560', 'googleapis.com',
        'gstatic.com', 'google.com/o/oauth2', 'accounts.google.com',
        'sites.google.com', 'drive.google.com', 'domains.google.com',
        'calendar/embed', 'atari-embeds', 'fe2e15e', 'Title: Live Content',
        'Description: Fetched live', 'Source: https://', '---',
    ]
    
    for line in lines:
        line = line.strip()
        if not line:
            meaningful_lines.append('')
            continue
        if len(line) < 3:
            continue
        if any(pat in line for pat in skip_patterns):
            continue
        # Skip lines that are mostly non-text (JS code patterns)
        if line.count('{') > 2 or line.count('}') > 2:
            continue
        if line.count('=') > 3 and len(line) > 50:
            continue
        if re.match(r'^[\d,\[\]{}():;\'"]+$', line):
            continue
        meaningful_lines.append(line)
    
    return '\n'.join(meaningful_lines).strip()


# Process each file
base_path = r'C:\Users\pc\.gemini\antigravity\brain\edc80e1c-1ee7-443b-a7d7-e12d2e35fc60\.system_generated\steps'

pages = {
    'Privacy Policy': f'{base_path}\\3\\content.md',
    'Refund Policy': f'{base_path}\\4\\content.md',
    'Terms & Conditions': f'{base_path}\\5\\content.md',
    'Contact': f'{base_path}\\6\\content.md',
    'About': f'{base_path}\\7\\content.md',
}

for name, filepath in pages.items():
    print(f"\n{'='*80}")
    print(f"PAGE: {name}")
    print(f"{'='*80}")
    try:
        text = extract_text_from_google_sites(filepath)
        # Only print the meaningful content (skip first chunk which is metadata)
        print(text[:5000])
        print(f"\n... [Total length: {len(text)} chars]")
    except Exception as e:
        print(f"Error: {e}")
