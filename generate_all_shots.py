#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate detailed shot breakdowns for all 48 Sertons
Based on script content and narrative context
"""

import os
import re

# Serton content summaries and shot configurations
SERTON_CONFIG = {
    1: {
        "setting": "Bucharest, early 1940s, cramped apartment interior",
        "tone": "Profound sadness, loneliness, longing",
        "key_action": "Young child missing his father, being cared for by neighbors, father is a skilled tailor",
        "shots": 6,
        "completed": True  # Already done
    },
    2: {
        "setting": "Bucharest, 1940s, route to Jewish school",
        "tone": "Determination, independence, childhood courage",
        "key_action": "Young boy navigating dangerous streets alone to reach Jewish school",
        "shots": 5
    },
    3: {
        "setting": "Bucharest apartment, forced labor camp",
        "tone": "Illness, fear, medical desperation",
        "key_action": "Father returns sick from labor camp, Jewish doctor in Romanian army uniform treats him",
        "shots": 5
    },
    4: {
        "setting": "Bucharest home, family conversations",
        "tone": "Growing awareness, childhood understanding of danger",
        "key_action": "Child overhearing Yiddish conversations, beginning to understand the persecution",
        "shots": 4
    },
    5: {
        "setting": "Bucharest attic, street view from above",
        "tone": "Terror, helplessness, witnessing horror",
        "key_action": "Child watching from attic window as Jews are loaded onto buses for deportation",
        "shots": 6
    },
    6: {
        "setting": "Bucharest, receiving news from Iași",
        "tone": "Dread, horror, family tragedy",
        "key_action": "News arrives of the Iași pogrom, family members murdered",
        "shots": 5
    },
    7: {
        "setting": "Death trains between Iași and Călărași",
        "tone": "Unbearable grief, suffocation, death",
        "key_action": "Cousin's father dies in sealed cattle car, cousin survives barely",
        "shots": 6
    },
    8: {
        "setting": "Bucharest, memories of grandmother",
        "tone": "Tender memory, loss, family bonds",
        "key_action": "Memories of grandmother Hinda, family relationships before the war",
        "shots": 4
    },
    9: {
        "setting": "Post-war Bucharest and Iași",
        "tone": "Desperate mission, trauma, rescue",
        "key_action": "Mother travels to Iași to bring traumatized aunt and cousins back",
        "shots": 5
    },
    10: {
        "setting": "Bucharest apartment, waiting",
        "tone": "Anxious waiting, longing, fear of loss",
        "key_action": "Father and son waiting desperately for mother's return from Iași",
        "shots": 5
    },
    11: {
        "setting": "Bucharest, Russian liberation 1945",
        "tone": "False hope, hunger, disappointment",
        "key_action": "Russians arrive with chocolate, then food disappears, eating only cornmeal mush",
        "shots": 5
    },
    12: {
        "setting": "Bucharest, 1946, German presence",
        "tone": "Paralyzing fear, childhood trauma",
        "key_action": "Child terrified by German military vehicles and sirens, Bucharest pogrom memory",
        "shots": 6
    },
    13: {
        "setting": "Bucharest, 1947, decision to leave",
        "tone": "Resolve, farewell, uncertain future",
        "key_action": "Families decide to emigrate, sell everything during hyperinflation",
        "shots": 5
    },
    14: {
        "setting": "Romanian-Hungarian border, night crossing",
        "tone": "Tense, secretive, dangerous",
        "key_action": "Smugglers guide families across border, paying vast sums",
        "shots": 6
    },
    15: {
        "setting": "Hungarian peasant home, first night in Hungary",
        "tone": "Exhaustion, strangeness, cultural shock",
        "key_action": "Sleeping on corn husk mattresses, unfamiliar rural life",
        "shots": 3
    },
    16: {
        "setting": "Border crossing, hot water channel",
        "tone": "Fear, physical danger, trust in strangers",
        "key_action": "Peasant carries them across hot industrial water channel into Hungary",
        "shots": 4
    },
    17: {
        "setting": "Hungarian wheat fields at dawn",
        "tone": "Pain, endurance, sacrifice for freedom",
        "key_action": "Running barefoot through stubble fields after wheat harvest",
        "shots": 4
    },
    18: {
        "setting": "Szeged, Hungary, orphanage",
        "tone": "Utter exhaustion, relief, deep sleep",
        "key_action": "Sleeping 12 hours straight, losing sense of time",
        "shots": 3
    },
    19: {
        "setting": "Vienna, Rothschild Hospital courtyard",
        "tone": "Shock, degradation, overcrowding",
        "key_action": "Arriving at overcrowded DP camp, witnessing unsanitary conditions",
        "shots": 6
    },
    20: {
        "setting": "Austrian border, confrontation with guards",
        "tone": "Terror of being sent back, threat of Siberia",
        "key_action": "Border guards threatening to return them to Hungary and Russians",
        "shots": 5
    },
    21: {
        "setting": "Austrian border, salvation",
        "tone": "Hope, intervention, narrow escape",
        "key_action": "Jewish Russian officer intervenes, reveals guards are lying about zones",
        "shots": 4
    },
    22: {
        "setting": "Austrian border, truck departure",
        "tone": "Separation anxiety, gentleman's restraint",
        "key_action": "Father refuses to push onto crowded truck, boy begs him to come",
        "shots": 4
    },
    23: {
        "setting": "Vienna, Rothschild Hospital, first night",
        "tone": "Exhausted gratitude, cramped conditions",
        "key_action": "Three people sleeping in one American folding bed",
        "shots": 3
    },
    24: {
        "setting": "Vienna, hospital gates, waiting",
        "tone": "Heartbreak, desperate vigil, separation",
        "key_action": "Child crying at gate every day, waiting for father who doesn't arrive",
        "shots": 5
    },
    25: {
        "setting": "Vienna, father's arrival",
        "tone": "Joy, relief, reunion",
        "key_action": "After more than a week, father finally arrives at camp",
        "shots": 4
    },
    26: {
        "setting": "Vienna DP camp, cultural life",
        "tone": "Community, music, survival through art",
        "key_action": "Jewish musicians performing, bringing joy to refugees",
        "shots": 3
    },
    27: {
        "setting": "Vienna, medical examination",
        "tone": "Rage, powerlessness, Nazi nurse",
        "key_action": "Encounter with antisemitic Nazi nurse during health screening",
        "shots": 4
    },
    28: {
        "setting": "Vienna, moving to Herzberger school",
        "tone": "Anger, confrontation with German woman",
        "key_action": "German woman complains Jews are taking schools, child confronts her",
        "shots": 3
    },
    29: {
        "setting": "Vienna hospital, mother's procedure",
        "tone": "Worry, distrust of German doctors",
        "key_action": "Mother has abortion, child fears German doctors will harm her",
        "shots": 4
    },
    30: {
        "setting": "Vienna camp, personal hygiene crisis",
        "tone": "Shame, cleanliness, adaptation",
        "key_action": "Getting lice, head shaved completely bald",
        "shots": 3
    },
    31: {
        "setting": "Linz, Austria, former concentration camp",
        "tone": "Cold, grim, haunted by history",
        "key_action": "Seeing electrified fence posts, winter conditions, minimal food",
        "shots": 5
    },
    32: {
        "setting": "Austrian Alps, crossing to Germany",
        "tone": "Precarious journey, makeshift solutions",
        "key_action": "Father sliding down with mismatched shoes to Bad Reichenhall",
        "shots": 4
    },
    33: {
        "setting": "Train through Germany, no windows",
        "tone": "Exposed to elements, war destruction",
        "key_action": "Riding train with no windows through bombed Germany to Kassel",
        "shots": 4
    },
    34: {
        "setting": "Kassel train station, total destruction",
        "tone": "Awe at devastation, apocalyptic landscape",
        "key_action": "Only train station standing in completely flattened city",
        "shots": 4
    },
    35: {
        "setting": "Eschwege DP camp, May 15, 1948",
        "tone": "Jubilation, hope, historic moment",
        "key_action": "Hearing Ben Gurion declare Israeli independence over loudspeakers",
        "shots": 6
    },
    36: {
        "setting": "Eschwege DP camp, daily life",
        "tone": "Waiting, community, work",
        "key_action": "Father working as tailor for UNRRA, camp life with 2000 families",
        "shots": 5
    },
    37: {
        "setting": "Eschwege, preparing to leave",
        "tone": "Anticipation, packing, final goodbyes",
        "key_action": "Getting ready for journey to Israel, organizing belongings",
        "shots": 4
    },
    38: {
        "setting": "Germany, departure preparations",
        "tone": "Mixture of excitement and nervousness",
        "key_action": "Final preparations, gathering documents",
        "shots": 3
    },
    39: {
        "setting": "Journey from Germany",
        "tone": "Long awaited movement toward freedom",
        "key_action": "Traveling through Germany toward Mediterranean",
        "shots": 4
    },
    40: {
        "setting": "European transit",
        "tone": "Endurance, hope growing",
        "key_action": "Continuing journey south",
        "shots": 3
    },
    41: {
        "setting": "Mediterranean port",
        "tone": "Excitement, seeing the sea",
        "key_action": "Arriving at port, first sight of the ship",
        "shots": 4
    },
    42: {
        "setting": "Boarding immigrant ship",
        "tone": "Nervous excitement, stepping toward future",
        "key_action": "Walking up gangplank, leaving Europe forever",
        "shots": 4
    },
    43: {
        "setting": "Mediterranean Sea, aboard ship",
        "tone": "Wonder, seasickness, anticipation",
        "key_action": "Days at sea, watching horizon",
        "shots": 4
    },
    44: {
        "setting": "Approaching Palestine coast",
        "tone": "Electrifying anticipation, land in sight",
        "key_action": "First glimpse of homeland",
        "shots": 4
    },
    45: {
        "setting": "Landing in Israel",
        "tone": "Overwhelming emotion, arrival",
        "key_action": "Stepping onto Israeli soil for first time",
        "shots": 5
    },
    46: {
        "setting": "First days in Israel",
        "tone": "Disorientation, heat, newness",
        "key_action": "Adjusting to new climate, language, culture",
        "shots": 4
    },
    47: {
        "setting": "Settlement process",
        "tone": "Hard work, building new life",
        "key_action": "Finding housing, starting over",
        "shots": 4
    },
    48: {
        "setting": "Reflecting on journey",
        "tone": "Gratitude, survivor's testimony, closure",
        "key_action": "Looking back on survival, honoring lost family",
        "shots": 5
    }
}

def generate_shots_content(serton_num, config):
    """Generate SHOTS.md content based on configuration"""

    if config.get("completed"):
        print(f"Serton {serton_num:02d} already completed, skipping...")
        return None

    content = f"""# Serton {serton_num:02d} - Shot Breakdown

## Scene Overview
**Setting:** {config['setting']}
**Emotional Tone:** {config['tone']}
**Key Action:** {config['key_action']}

---

"""

    # Generate placeholder shots (to be filled with specific prompts)
    for i in range(1, config['shots'] + 1):
        content += f"""## Shot {i}

**Description:** [Specific visual moment]

**Setting:** [Precise location]
**Action:** [Character/object movement]
**Emotion:** [Emotional beat]

### Image Prompt
```
[Setting and composition], [character and action], [lighting], [emotional atmosphere],
2D animated historical illustration, heavily desaturated sepia tones, muted browns and greys,
high-contrast chiaroscuro, long oppressive shadows, serious evocative tone,
1940s [location], moving painting style
```

### Video Prompt
```
[Camera movement], [atmospheric elements], [character/object movement], [light behavior],
[emotional pacing], maintaining melancholic threatening atmosphere
```

---

"""

    content += f"""## Production Notes

- [ ] All shots reviewed for style consistency
- [ ] Historical accuracy verified
- [ ] Emotional progression mapped
- [ ] Transitions between shots planned
- [ ] Color palette consistent across shots
- **Total estimated shot count: {config['shots']}**

**Emotional Arc:** [To be detailed]

---

## References Needed

- [ ] Period photographs
- [ ] Location references
- [ ] Character/costume references
- [ ] Lighting references
"""

    return content

def main():
    base_dir = '.'

    generated = 0
    skipped = 0

    for serton_num, config in SERTON_CONFIG.items():
        folder_path = os.path.join(base_dir, f"Serton_{serton_num:02d}")
        shots_file = os.path.join(folder_path, 'SHOTS.md')

        if os.path.exists(folder_path):
            content = generate_shots_content(serton_num, config)

            if content:
                with open(shots_file, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Generated Serton {serton_num:02d} - {config['shots']} shots")
                generated += 1
            else:
                skipped += 1

    print(f"\n✓ Generated: {generated}")
    print(f"✓ Skipped (completed): {skipped}")
    print(f"Total: {generated + skipped}/48")

if __name__ == '__main__':
    main()
