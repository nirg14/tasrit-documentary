# Quick Start Guide - Midjourney Animation Workflow

## Example: Generating Serton 01, Shot 1

### Step 1: Locate the Shot File
Navigate to: `Serton_01/SHOTS.md`

### Step 2: Read the Shot Description

**Shot 1: The Sad Child**
- Young boy sitting alone by window in dim attic room
- Emotional tone: Deep sadness, loneliness, yearning

### Step 3: Generate the First Frame (Image)

Copy this exact text into Midjourney:

```
/imagine Dark attic interior with exposed wooden beams, small boy silhouetted against dusty circular window, sitting on floor with knees drawn up, head resting against window frame gazing at street below, single harsh beam of daylight cutting through darkness, child's face reflecting profound sadness, 2D animated historical illustration, heavily desaturated sepia tones, muted browns and greys, high-contrast chiaroscuro, long oppressive shadows cast across rough wooden floorboards, serious evocative tone, 1940s Bucharest Romania, moving painting style
```

**Midjourney Parameters (optional):**
- Add `--ar 16:9` for widescreen
- Add `--s 750` for higher stylization
- Add `--v 6` for Midjourney v6

### Step 4: Save the Generated Image

When Midjourney generates the image:
1. Download your preferred variation
2. Save as: `Serton_01/images/shot_01_frame.png`
3. Note which variation you chose (U1, U2, U3, or U4)

### Step 5: Animate the Frame (Video)

Copy the video prompt into Midjourney video tool:

```
Slow gentle zoom toward child's face, dust particles floating slowly in the shaft of light, child's subtle breathing movement, shadows from outside gradually shifting across the floor, distant street sounds faintly echoing, slow contemplative melancholic pacing, child occasionally blinking but remaining motionless, maintaining atmosphere of profound loneliness and longing
```

Upload your generated image and apply this motion description.

### Step 6: Save the Animated Shot

1. Download the generated video
2. Save as: `Serton_01/images/shot_01_video.mp4`
3. Check production_notes.md and mark shot complete

### Step 7: Repeat for Remaining Shots

Serton 01 has 6 shots total. Repeat steps 3-6 for:
- Shot 2: Empty Hands
- Shot 3: Uncle's Intervention
- Shot 4: Neighbor's Kindness
- Shot 5: Father's Craft
- Shot 6: The Beautiful Clothes

---

## Complete Workflow Summary

```
FOR EACH SERTON:
┌──────────────────────────────────────────┐
│ 1. Open Serton_XX/SHOTS.md              │
│ 2. Read scene overview                   │
│ 3. For each shot:                        │
│    ├─ Copy Image Prompt                  │
│    ├─ Generate in Midjourney             │
│    ├─ Save frame to images/              │
│    ├─ Copy Video Prompt                  │
│    ├─ Animate frame                      │
│    └─ Save video to images/              │
│ 4. Check off in production_notes.md      │
└──────────────────────────────────────────┘
```

---

## Tips for Best Results

### Consistency Across Shots
- Use the same Midjourney seed for related shots
- Keep the same stylization settings
- Maintain color palette consistency
- Reference previous shots when generating new ones

### Historical Accuracy
- Research 1940s architecture before generating
- Check period-appropriate clothing and objects
- Verify vehicles, props match timeline
- Consult historical photos for reference

### Emotional Pacing
- Match camera movement speed to emotion
- Slower movements for contemplative moments
- Tense, handheld for fear/danger
- Smooth, deliberate for memory/reflection

### Technical Settings

**Recommended Midjourney Parameters:**
```
--ar 16:9          (widescreen cinema format)
--s 750            (higher stylization)
--v 6              (latest version for best quality)
--style raw        (for more literal interpretation)
```

**Video Settings:**
```
Duration: 3-5 seconds per shot
Movement: Subtle, not dramatic
Pacing: Match to emotional tone
Transitions: Plan for editing between shots
```

---

## Common Issues & Solutions

### Issue: Image too realistic
**Solution:** Emphasize "2D animated illustration" and "moving painting style" in prompt

### Issue: Wrong color palette
**Solution:** Make sure sepia/grey/desaturated keywords are included

### Issue: Too bright/cheerful
**Solution:** Add "oppressive shadows" and "melancholic tone" keywords

### Issue: Modern elements appearing
**Solution:** Specify "1940s" and remove any modern references

### Issue: Character inconsistency
**Solution:** Use same seed value, reference previous generation

---

## File Naming Convention

```
Serton_XX/images/
├── shot_01_frame.png
├── shot_01_video.mp4
├── shot_02_frame.png
├── shot_02_video.mp4
├── shot_03_frame.png
├── shot_03_video.mp4
└── ...
```

---

## Checklist: Serton Complete

- [ ] All shots generated (frame + video)
- [ ] Files saved to images/ folder
- [ ] Style consistency maintained
- [ ] Historical accuracy verified
- [ ] Emotional pacing appropriate
- [ ] Production notes updated
- [ ] Ready for editing/assembly

---

## Next Steps After Generation

1. **Import to editing software** (Premiere, Final Cut, DaVinci)
2. **Sequence shots** in narrative order
3. **Add transitions** (fade, dissolve, cut)
4. **Record/add narration** from script.txt
5. **Add sound effects** (ambient, emotional)
6. **Color grade** for consistency
7. **Export final Serton**

---

## Need Help?

- **Style questions:** See `MIDJOURNEY_STYLE_GUIDE.md`
- **Content questions:** See individual `README.md` files
- **Navigation:** See `PROJECT_INDEX.md`
- **Examples:** Review Serton_01 and Serton_05

---

**You're ready to start! Begin with Serton 01 or Serton 05 - both have complete detailed prompts ready to use immediately.**
