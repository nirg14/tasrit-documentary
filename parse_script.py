#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to parse the Tasrit documentary script and organize content by סרטון
"""

import re
import os

def parse_script(script_path):
    """Parse the script and extract content for each סרטון"""

    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by סרטון markers
    # Pattern to match "סרטון X" or "סרטון X - description"
    serton_pattern = r'(סרטון \d+(?:\s*-\s*[^\n]*)?)'

    # Split content by סרטון markers while keeping the markers
    parts = re.split(serton_pattern, content)

    # Dictionary to store content for each סרטון
    sertons = {}

    # Process parts
    current_serton = None
    for i, part in enumerate(parts):
        if re.match(r'סרטון \d+', part):
            # This is a סרטון marker
            match = re.search(r'סרטון (\d+)', part)
            if match:
                serton_num = int(match.group(1))
                current_serton = serton_num
                if serton_num not in sertons:
                    sertons[serton_num] = {
                        'title': part.strip(),
                        'content': '',
                        'images': [],
                        'maps': [],
                        'notes': []
                    }
        elif current_serton is not None and i + 1 < len(parts):
            # This is content following a סרטון marker
            # Get content until next סרטון or end
            next_part_idx = i + 1
            if next_part_idx < len(parts) and not re.match(r'סרטון \d+', parts[next_part_idx]):
                sertons[current_serton]['content'] += part

    return sertons

def extract_metadata(content):
    """Extract images, maps, and notes from content"""
    metadata = {
        'images': [],
        'maps': [],
        'notes': []
    }

    # Extract image references
    image_patterns = [
        r'תמונ[הות]\s+(?:של\s+)?([^\n]+)',
        r'תמונות:\s*\(([^)]+)\)',
        r'תמונות\s+([^\n]+)'
    ]

    for pattern in image_patterns:
        matches = re.findall(pattern, content)
        metadata['images'].extend(matches)

    # Extract map references
    map_patterns = [
        r'מפה\s+([^\n]+)',
        r'להכין\s+(?:בבקשה\s+)?מפה\s+([^\n]+)'
    ]

    for pattern in map_patterns:
        matches = re.findall(pattern, content)
        metadata['maps'].extend(matches)

    return metadata

def create_serton_files(sertons, base_dir):
    """Create individual files for each סרטון"""

    for num in range(1, 49):  # 1 to 48
        folder_name = f"Serton_{num:02d}"
        folder_path = os.path.join(base_dir, folder_name)

        # Create README.md for this סרטון
        readme_path = os.path.join(folder_path, 'README.md')

        if num in sertons:
            serton_data = sertons[num]
            metadata = extract_metadata(serton_data['content'])

            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# {serton_data['title']}\n\n")
                f.write(f"## Content\n\n")
                f.write(serton_data['content'].strip() + "\n\n")

                if metadata['images']:
                    f.write(f"## Images Required\n\n")
                    for img in metadata['images']:
                        f.write(f"- {img.strip()}\n")
                    f.write("\n")

                if metadata['maps']:
                    f.write(f"## Maps Required\n\n")
                    for map_ref in metadata['maps']:
                        f.write(f"- {map_ref.strip()}\n")
                    f.write("\n")

                f.write(f"## Production Notes\n\n")
                f.write(f"- Video segment number: {num}\n")
                f.write(f"- Total segments: 48\n")
        else:
            # Create placeholder for missing segments
            with open(readme_path, 'w', encoding='utf-8') as f:
                f.write(f"# סרטון {num}\n\n")
                f.write(f"## Content\n\n")
                f.write(f"*No content found for this segment*\n\n")

        # Create additional structure files
        with open(os.path.join(folder_path, 'script.txt'), 'w', encoding='utf-8') as f:
            if num in sertons:
                f.write(sertons[num]['content'].strip())
            else:
                f.write('')

        # Create images folder
        os.makedirs(os.path.join(folder_path, 'images'), exist_ok=True)

        # Create placeholder for production notes
        with open(os.path.join(folder_path, 'production_notes.md'), 'w', encoding='utf-8') as f:
            f.write(f"# Production Notes - סרטון {num}\n\n")
            f.write(f"## Timeline\n\n")
            f.write(f"- [ ] Script review\n")
            f.write(f"- [ ] Image collection\n")
            f.write(f"- [ ] Voiceover recording\n")
            f.write(f"- [ ] Animation/editing\n")
            f.write(f"- [ ] Review\n")
            f.write(f"- [ ] Final approval\n\n")

if __name__ == '__main__':
    script_path = 'full_script.txt'
    base_dir = '.'

    print("Parsing script...")
    sertons = parse_script(script_path)

    print(f"Found {len(sertons)} סרטון segments")
    print("Creating individual files...")

    create_serton_files(sertons, base_dir)

    print("Done! Project structure created successfully.")
    print(f"\nSegments found: {sorted(sertons.keys())}")
