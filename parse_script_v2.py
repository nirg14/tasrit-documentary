#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Improved script to parse the Tasrit documentary script and organize content by סרטון
"""

import re
import os

def parse_script_improved(script_path):
    """Parse the script and extract content for each סרטון"""

    with open(script_path, 'r', encoding='utf-8') as f:
        full_content = f.read()

    # Find all סרטון markers and their positions
    serton_pattern = r'(סרטון \d+(?:\s*-\s*[^\n]*)?)'

    # Find all matches with their positions
    matches = list(re.finditer(serton_pattern, full_content))

    sertons = {}

    for i, match in enumerate(matches):
        # Extract סרטון number
        serton_title = match.group(1)
        match_num = re.search(r'סרטון (\d+)', serton_title)

        if match_num:
            serton_num = int(match_num.group(1))

            # Get start position (end of current match)
            start_pos = match.end()

            # Get end position (start of next match, or end of file)
            if i + 1 < len(matches):
                end_pos = matches[i + 1].start()
            else:
                end_pos = len(full_content)

            # Extract content between this marker and the next
            content = full_content[start_pos:end_pos].strip()

            # Look backward from the סרטון marker to find contextual information
            # (images, maps, etc. that appear before the סרטון marker)
            context_start = matches[i-1].end() if i > 0 else 0
            context_end = match.start()
            context = full_content[context_start:context_end]

            # Store the data
            if serton_num not in sertons:
                sertons[serton_num] = {
                    'title': serton_title,
                    'content': content,
                    'context': context
                }
            else:
                # If we've seen this number before, append continuation
                sertons[serton_num]['content'] += '\n\n' + content
                sertons[serton_num]['context'] += '\n\n' + context

    return sertons

def extract_metadata(content, context=''):
    """Extract images, maps, and notes from content and context"""
    full_text = context + '\n' + content

    metadata = {
        'images': [],
        'maps': [],
        'locations': []
    }

    # Extract image references
    image_patterns = [
        r'תמונ[הות]\s+(?:של\s+)?([^\n]+?)(?=\n|$)',
        r'תמונות:\s*\(([^)]+)\)',
        r'תמונות\s+([^\n]+)',
        r'תמונה\s+([^\n]+)',
    ]

    for pattern in image_patterns:
        matches = re.findall(pattern, full_text, re.MULTILINE)
        for match in matches:
            if match and match.strip():
                # Split by commas if multiple images listed
                images = [img.strip() for img in match.split(',')]
                metadata['images'].extend(images)

    # Extract map references
    map_patterns = [
        r'מפה\s+([^\n]+)',
        r'להכין\s+(?:בבקשה\s+)?מפה\s+([^\n]+)',
        r'תכין\s+(?:בבקשה\s+)?מפה\s+([^\n]+)',
    ]

    for pattern in map_patterns:
        matches = re.findall(pattern, full_text, re.MULTILINE)
        for match in matches:
            if match and match.strip():
                metadata['maps'].append(match.strip())

    # Extract location references
    location_patterns = [
        r'(יאס|יאשי|בוקרשט|וינה|לינץ|בודפשט)',
    ]

    for pattern in location_patterns:
        matches = re.findall(pattern, full_text)
        metadata['locations'].extend(list(set(matches)))

    # Remove duplicates
    metadata['images'] = list(dict.fromkeys(metadata['images']))
    metadata['maps'] = list(dict.fromkeys(metadata['maps']))
    metadata['locations'] = list(dict.fromkeys(metadata['locations']))

    return metadata

def create_serton_files_improved(sertons, base_dir):
    """Create individual files for each סרטון with improved content"""

    for num in range(1, 49):  # 1 to 48
        folder_name = f"Serton_{num:02d}"
        folder_path = os.path.join(base_dir, folder_name)

        # Create README.md for this סרטון
        readme_path = os.path.join(folder_path, 'README.md')

        if num in sertons:
            serton_data = sertons[num]
            metadata = extract_metadata(serton_data['content'], serton_data.get('context', ''))

            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# {serton_data['title']}\n\n")

                # Content section
                f.write(f"## Content\n\n")
                if serton_data['content'].strip():
                    f.write(serton_data['content'].strip() + "\n\n")
                else:
                    f.write("*Content to be added*\n\n")

                # Context section (what comes before this segment)
                if serton_data.get('context', '').strip():
                    f.write(f"## Context / Setup\n\n")
                    f.write(serton_data['context'].strip() + "\n\n")

                # Images section
                if metadata['images']:
                    f.write(f"## Images Required\n\n")
                    for img in metadata['images']:
                        f.write(f"- [ ] {img}\n")
                    f.write("\n")

                # Maps section
                if metadata['maps']:
                    f.write(f"## Maps Required\n\n")
                    for map_ref in metadata['maps']:
                        f.write(f"- [ ] {map_ref}\n")
                    f.write("\n")

                # Locations mentioned
                if metadata['locations']:
                    f.write(f"## Locations Mentioned\n\n")
                    f.write(", ".join(metadata['locations']) + "\n\n")

                f.write(f"## Production Notes\n\n")
                f.write(f"- Segment number: {num} of 48\n")
                f.write(f"- Status: Not started\n")
        else:
            # Create placeholder for missing segments
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# סרטון {num}\n\n")
                f.write(f"## Content\n\n")
                f.write(f"*No content found for this segment in source document*\n\n")
                f.write(f"## Production Notes\n\n")
                f.write(f"- Segment number: {num} of 48\n")
                f.write(f"- Status: Content missing\n")

        # Update script.txt with actual content
        script_path = os.path.join(folder_path, 'script.txt')
        with open(script_path, 'w', encoding='utf-8') as f:
            if num in sertons:
                f.write(sertons[num]['content'].strip())

if __name__ == '__main__':
    script_path = 'full_script.txt'
    base_dir = '.'

    print("Parsing script (improved version)...")
    sertons = parse_script_improved(script_path)

    print(f"Found content for {len(sertons)} סרטון segments")

    # Show sample of what was found
    if sertons:
        sample_num = list(sertons.keys())[0]
        sample = sertons[sample_num]
        print(f"\nSample (סרטון {sample_num}):")
        print(f"Title: {sample['title']}")
        print(f"Content length: {len(sample['content'])} chars")
        print(f"First 100 chars: {sample['content'][:100]}...")

    print("\nUpdating individual files...")
    create_serton_files_improved(sertons, base_dir)

    print("Done! Project structure updated successfully.")
    print(f"\nSegments with content: {sorted(sertons.keys())}")
