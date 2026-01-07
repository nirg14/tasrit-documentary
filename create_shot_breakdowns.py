#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Create shot breakdown template files for all Sertons
"""

import os

def create_shot_breakdown_template(serton_num, serton_path):
    """Create a SHOTS.md template file for a Serton"""

    template = f"""# Serton {serton_num:02d} - Shot Breakdown

## Scene Overview
**Setting:** [Location and time]
**Emotional Tone:** [Primary emotion]
**Key Action:** [What happens in this segment]

---

## Shot 1

**Description:** [Brief description of what this shot shows]

**Setting:** [Specific location/environment]
**Action:** [What's happening]
**Emotion:** [Emotional intent]

### Image Prompt
```
[Setting description], [composition and framing], [character(s) and action],
[lighting description], [emotional atmosphere], 2D animated historical illustration,
heavily desaturated sepia tones, muted browns and greys, high-contrast chiaroscuro,
long oppressive shadows, serious evocative tone, 1940s [location], moving painting style
```

### Video Prompt
```
[Camera movement], [atmospheric elements], [character movement],
[light behavior], [emotional pacing], subtle [specific details],
maintaining melancholic threatening atmosphere
```

---

## Shot 2

**Description:** [Brief description of what this shot shows]

**Setting:** [Specific location/environment]
**Action:** [What's happening]
**Emotion:** [Emotional intent]

### Image Prompt
```
[To be filled]
```

### Video Prompt
```
[To be filled]
```

---

## Production Notes

- [ ] All shots reviewed for style consistency
- [ ] Historical accuracy verified
- [ ] Emotional progression mapped
- [ ] Transitions between shots planned
- [ ] Color palette consistent across shots
- [ ] Total estimated shot count: [X]

---

## References Needed

- [ ] Period photographs
- [ ] Architectural references
- [ ] Costume references
- [ ] Lighting references

"""

    shots_file = os.path.join(serton_path, 'SHOTS.md')
    with open(shots_file, 'w', encoding='utf-8') as f:
        f.write(template)

    print(f"Created shot template for Serton {serton_num:02d}")

def main():
    base_dir = '.'

    for i in range(1, 49):
        folder_name = f"Serton_{i:02d}"
        folder_path = os.path.join(base_dir, folder_name)

        if os.path.exists(folder_path):
            create_shot_breakdown_template(i, folder_path)

    print(f"\nCompleted! Created 48 SHOTS.md template files.")

if __name__ == '__main__':
    main()
