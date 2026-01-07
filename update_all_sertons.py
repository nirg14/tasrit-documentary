#!/usr/bin/env python3
"""
Update all Serton SHOTS.html files with AI Workshop integration
"""

import os
import re
from pathlib import Path
from bs4 import BeautifulSoup

def extract_serton_info_from_readme(readme_path):
    """Extract serton information from README.md"""
    if not os.path.exists(readme_path):
        return None

    with open(readme_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract title from first heading
    title_match = re.search(r'^#\s+(?:Serton\s+\d+:\s+)?(.+)$', content, re.MULTILINE)
    title = title_match.group(1).strip() if title_match else "Unknown"

    # Try to find setting, emotional tone, etc.
    setting = "Not specified"
    emotional_tone = "Not specified"
    scene_overview = "Scene description not available"

    # Look for common patterns in README
    setting_match = re.search(r'Setting[:\s]+(.+?)(?:\n|$)', content, re.IGNORECASE)
    if setting_match:
        setting = setting_match.group(1).strip()

    return {
        'title': title,
        'setting': setting,
        'emotionalTone': emotional_tone,
        'sceneOverview': scene_overview
    }

def count_shots_in_html(soup):
    """Count number of shots in the HTML"""
    shots = soup.find_all('article', class_='shot')
    return len(shots)

def extract_shot_info(shot_article):
    """Extract shot information from article element"""
    shot_num_elem = shot_article.find('span', class_='shot-badge')
    shot_num_text = shot_num_elem.get_text() if shot_num_elem else "Shot 1 of 1"
    shot_num = re.search(r'Shot\s+(\d+)', shot_num_text)
    shot_num = int(shot_num.group(1)) if shot_num else 1

    title_elem = shot_article.find('h2')
    title = title_elem.get_text().strip() if title_elem else "Untitled"
    # Remove "Shot X: " prefix
    title = re.sub(r'^Shot\s+\d+:\s+', '', title)

    # Extract details from shot-details section
    details_section = shot_article.find('div', class_='shot-details')
    description = ""
    setting = ""
    action = ""
    emotion = ""

    if details_section:
        detail_items = details_section.find_all('div', class_='detail-item')
        for item in detail_items:
            text = item.get_text()
            if 'Description:' in text:
                description = text.split('Description:', 1)[1].strip()
            elif 'Setting:' in text:
                setting = text.split('Setting:', 1)[1].strip()
            elif 'Action:' in text:
                action = text.split('Action:', 1)[1].strip()
            elif 'Emotion:' in text:
                emotion = text.split('Emotion:', 1)[1].strip()

    return {
        'number': shot_num,
        'title': title,
        'description': description,
        'setting': setting,
        'action': action,
        'emotion': emotion
    }

def update_shots_html(html_path, serton_num):
    """Update a single SHOTS.html file with AI workshop integration"""

    print(f"\n{'='*60}")
    print(f"Processing Serton {serton_num}...")
    print(f"{'='*60}")

    # Read the HTML file
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # 1. Add chat-workshop.css if not present
    head = soup.find('head')
    if head and not soup.find('link', href='../css/chat-workshop.css'):
        print("✓ Adding chat-workshop.css link")
        shot_detail_css = soup.find('link', href='../shot-detail.css')
        if shot_detail_css:
            new_link = soup.new_tag('link', rel='stylesheet', href='../css/chat-workshop.css')
            shot_detail_css.insert_after(new_link)
            shot_detail_css.insert_after(soup.new_string('\n    '))

    # 2. Add or update serton context JSON
    if head and not soup.find('script', id='serton-context'):
        print("✓ Adding serton context JSON")

        # Try to get info from README
        readme_path = os.path.join(os.path.dirname(html_path), 'README.md')
        serton_info = extract_serton_info_from_readme(readme_path)

        if not serton_info:
            # Fallback: extract from page
            h1 = soup.find('h1')
            title_text = h1.get_text() if h1 else f"Serton {serton_num}"
            title = title_text.replace(f'Serton {serton_num}:', '').strip()
            serton_info = {
                'title': title,
                'setting': 'Not specified',
                'emotionalTone': 'Not specified',
                'sceneOverview': 'Scene description not available'
            }

        # Count shots
        total_shots = count_shots_in_html(soup)

        # Extract emotional arc if present
        emotional_arc_section = soup.find('section', class_='emotional-arc')
        emotional_arc = "Not available"
        if emotional_arc_section:
            arc_p = emotional_arc_section.find('p')
            if arc_p:
                emotional_arc = arc_p.get_text().strip()

        context_json = f'''
    <!-- Embedded Serton Context for AI -->
    <script type="application/json" id="serton-context">
    {{
        "sertonNumber": {serton_num},
        "sertonTitle": "{serton_info['title']}",
        "setting": "{serton_info['setting']}",
        "emotionalTone": "{serton_info['emotionalTone']}",
        "sceneOverview": "{serton_info['sceneOverview']}",
        "emotionalArc": "{emotional_arc[:200]}...",
        "totalShots": {total_shots}
    }}
    </script>'''

        # Insert before </head>
        context_tag = BeautifulSoup(context_json, 'html.parser')
        head.append(soup.new_string('\n'))
        head.append(context_tag)

    # 3. Update shot articles with data attributes
    shots = soup.find_all('article', class_='shot')
    print(f"✓ Found {len(shots)} shots to update")

    for shot_article in shots:
        shot_info = extract_shot_info(shot_article)

        # Add data attributes if not present
        if not shot_article.get('data-shot-number'):
            shot_article['data-shot-number'] = str(shot_info['number'])
            shot_article['data-shot-title'] = shot_info['title']
            shot_article['data-shot-description'] = shot_info['description']
            shot_article['data-shot-setting'] = shot_info['setting']
            shot_article['data-shot-action'] = shot_info['action']
            shot_article['data-shot-emotion'] = shot_info['emotion']

        # 4. Update prompt boxes
        prompt_boxes = shot_article.find_all('div', class_='prompt-box')

        for prompt_box in prompt_boxes:
            # Determine prompt type
            if 'image-prompt' in prompt_box.get('class', []):
                prompt_type = 'image'
            elif 'video-prompt' in prompt_box.get('class', []):
                prompt_type = 'video'
            else:
                continue

            shot_id = f"shot-{serton_num}-{shot_info['number']}-{prompt_type}"

            # Add data attributes if not present
            if not prompt_box.get('data-shot-id'):
                prompt_box['data-prompt-type'] = prompt_type
                prompt_box['data-shot-id'] = shot_id

            # Find or wrap prompt text in <p class="prompt-text">
            prompt_p = prompt_box.find('p')
            if prompt_p and 'prompt-text' not in prompt_p.get('class', []):
                prompt_p['class'] = prompt_p.get('class', []) + ['prompt-text']

            # Add AI workshop button if not present
            if not prompt_box.find('button', class_='ai-workshop-btn'):
                button = soup.new_tag('button', **{
                    'class': 'ai-workshop-btn',
                    'data-target': shot_id
                })
                button.string = '⚡ Workshop with AI'
                prompt_box.append(soup.new_string('\n                    '))
                prompt_box.append(button)

    # 5. Add scripts before </body> if not present
    body = soup.find('body')
    if body and not soup.find('script', src='../js/init-workshop.js'):
        print("✓ Adding workshop scripts")

        scripts_html = '''
    <!-- AI Workshop Scripts -->
    <script src="../js/context-loader.js"></script>
    <script src="../js/api-client.js"></script>
    <script src="../js/chat-ui.js"></script>
    <script src="../js/chat-manager.js"></script>
    <script src="../js/init-workshop.js"></script>'''

        # Find footer or end of body
        footer = soup.find('footer')
        scripts_tag = BeautifulSoup(scripts_html, 'html.parser')

        if footer:
            footer.insert_after(soup.new_string('\n'))
            footer.insert_after(scripts_tag)
        else:
            body.append(soup.new_string('\n'))
            body.append(scripts_tag)

    # Write the updated HTML
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(str(soup.prettify()))

    print(f"✓ Successfully updated Serton {serton_num}")
    return True

def main():
    """Main function to update all Serton files"""
    base_dir = Path(__file__).parent

    print("\n" + "="*60)
    print("AI WORKSHOP INTEGRATION - BATCH UPDATE")
    print("="*60)

    # Find all SHOTS.html files
    shots_files = sorted(base_dir.glob('Serton_*/SHOTS.html'))

    print(f"\nFound {len(shots_files)} SHOTS.html files")

    updated = 0
    skipped = 0

    for shots_file in shots_files:
        serton_num_match = re.search(r'Serton_(\d+)', str(shots_file))
        if not serton_num_match:
            continue

        serton_num = int(serton_num_match.group(1))

        # Skip Serton 23 (already done)
        if serton_num == 23:
            print(f"\n⊘ Skipping Serton 23 (already updated)")
            skipped += 1
            continue

        try:
            update_shots_html(shots_file, serton_num)
            updated += 1
        except Exception as e:
            print(f"✗ Error updating Serton {serton_num}: {e}")

    print("\n" + "="*60)
    print(f"SUMMARY: {updated} updated, {skipped} skipped")
    print("="*60)
    print("\nAll Sertons have been updated with AI Workshop feature!")
    print("Don't forget to commit and push the changes.\n")

if __name__ == '__main__':
    main()
