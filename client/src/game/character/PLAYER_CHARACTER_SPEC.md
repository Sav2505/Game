# PLAYER CHARACTER MASTER SPECIFICATION

This document is the:

> AUTHORITATIVE SOURCE OF TRUTH FOR THE PLAYER CHARACTER

Future character-related implementation, asset generation, equipment design, animation work, and balancing changes must consult this document before making decisions. All permanent rules below are the baseline for the main player character and should be treated as the canonical reference for the project.

---

## 1. Character Identity

- Character ID: player_main
- Character Type: Human Fantasy Adventurer
- Role: Player Character
- Orientation Master: Facing Right
- Game Orientation: Right / Left
- Style: 2D Stylized Fantasy RPG

This character is an original fantasy adventurer designed for a polished modern 2D RPG. The visual language should feel readable, heroic, approachable, and commercially polished. It should not copy or imitate any copyrighted character, franchise, or existing game IP.

The design goal is to create an original hero with:

- a readable silhouette
- expressive face
- distinct equipment
- stable body proportions
- appealing motion
- a strong fantasy identity
- gear that clearly changes the character visually

The character should be inspired by the general strengths of classic 2D MMORPG character design, but should remain fully original.

---

## 2. Master Art Style

Permanent art direction:

- 2D stylized fantasy RPG
- modern hand-painted/cartoon game art
- not pixel art
- not photorealistic
- not realistic anatomy
- not anime
- not chibi-sized mascot design
- cute but not childish
- polished and professional
- expressive face
- clean readable silhouette
- slightly oversized head
- approachable heroic proportions
- soft but defined shading
- subtle highlights
- refined dark-colored outlines
- colorful but controlled palette
- high-quality commercial game-art appearance

The final character should work well in a side-scrolling fantasy RPG and remain readable at small game resolutions.

---

## 3. Master Canvas and Frame Rules

Every master character asset must use these locked settings:

- Canvas: 512 × 512 px
- Format: PNG
- Background: Transparent
- Color: RGBA
- Master Center X: 256
- Ground / Feet Baseline: Y = 445
- Character Top: approximately Y = 45
- Character Bottom: approximately Y = 445

Character size target:

- Character height: approximately 400 px
- Maximum character width: approximately 220 px

The character should occupy a stable central area with consistent framing across all future assets.

The following must remain consistent across all master assets:

- center position
- feet baseline
- scale
- perspective
- facing direction
- overall body proportions

Do not randomly resize individual equipment assets or create inconsistent framing between body and equipment layers.

---

## 4. Character Anatomy and Proportions

Target proportions:

- Head: approximately 120 px
- Torso: approximately 120 px
- Legs: approximately 130 px
- Shoes: approximately 40 px

These are visual targets, not strict geometric math. The crucial rule is consistency: the character must keep the same recognizable body proportions across all future assets.

Additional rules:

- head slightly larger than realistic human proportions
- athletic but approachable build
- not overly muscular
- silhouette must be readable immediately
- body should feel capable and heroic without being exaggerated

The character should feel like a fantasy adventurer rather than a realistic anatomical study.

---

## 5. Anchor and Positioning Rule

The character uses a fixed world-space anchor:

- Anchor X = 256
- Anchor Y = 445

The bottom of the feet must touch approximately:

- Y = 445

This is mandatory for:

- equipment layering alignment
- animation grounding
- avoiding floating characters
- stable equipment swapping
- consistent AI-generated asset output
- future motion and sprite compatibility

The character's feet must never randomly shift vertically between assets.

---

## 6. Facing Direction Rule

The master artwork must face:

- RIGHT

The game renderer should horizontally flip the character for left-facing movement.

Do not create separate left-facing artwork unless future technical requirements demand it.

The locked rule is:

- RIGHT = original asset
- LEFT = horizontal flip

All equipment layers must follow the same orientation and must be designed as right-facing assets.

---

## 7. Lighting Direction

Permanent lighting direction:

- Primary light: upper-left
- Shadow direction: lower-right

Use:

- soft ambient shading
- subtle form shadows
- restrained highlights
- consistent lighting across all equipment assets

Future equipment should not introduce a radically different lighting direction. The lighting must remain coherent across the full character design system.

---

## 8. Outline Style

Use a refined dark-colored outline.

Do not use pure black as the default outline.

At 512 × 512, target outline thickness is approximately:

- 3–5 px

The outline must:

- define the silhouette
- separate overlapping equipment
- remain readable at game resolution
- avoid looking like a thick sticker border

The outline should be present but not heavy-handed.

---

## 9. Layer Architecture

The player character is fundamentally a layered character. Future artwork must support equipment swapping without re-building the whole body.

Recommended conceptual layer structure:

1. Shadow
2. Cape
3. Back Leg
4. Front Leg
5. Back Shoe
6. Front Shoe
7. Torso
8. Back Arm
9. Front Arm
10. Head
11. Body
12. Top
13. Pants
14. Gloves
15. Face
16. Hair
17. Helmet
18. Weapon
19. Accessory
20. Effect

The exact implementation may vary slightly from the current renderer, but the conceptual layering must remain stable. Equipment must remain replaceable independently.

---

## 10. Equipment Requirements

The character must support equipment such as:

- Helmet
- Top
- Pants
- Shoes
- Gloves
- Cape
- Weapon
- Accessory

Each equipment item should be capable of:

1. visually changing the character
2. being equipped or unequipped independently
3. having its own metadata
4. modifying character stats

The visual representation and gameplay data must remain separate.

Conceptual structure:

```ts
interface EquipmentItem {
  id: string;
  type: string;
  name: string;
  rarity?: string;
  asset: string;
  statBonuses: Record<string, number>;
}
```

Final character stats should be calculated from:

- Base Stats + Equipment Bonuses + Future Modifiers

Do not hard-code equipment statistics into the renderer.

---

## 11. Initial Main Character Design Concept

The current main character concept is:

- Gender: Male
- Age appearance: Young adult
- Body: Athletic but approachable
- Face: Stylized expressive human face
- Eyes: Large and expressive, but not anime
- Hair: Medium/short tousled brown hair
- Skin: Warm natural skin tone
- Expression: Confident neutral expression
- Top: Fitted cream/white shirt with muted blue/teal vest or jacket
- Pants: Dark brown / charcoal fantasy trousers
- Shoes: Sturdy leather ankle boots
- Belt: Simple leather belt
- Weapon: Basic wooden or simple iron sword

This is the starting concept only. The architecture must allow the appearance to evolve without breaking the character system.

---

## 12. Asset Generation Rules for AI Artwork

When generating character art with an AI image tool, the following must be included in every prompt:

- 512 × 512 transparent canvas
- full body
- centered character
- feet aligned to Y = 445
- character height approximately 400 px
- maximum width approximately 220 px
- facing right
- consistent proportions
- consistent perspective
- 2D stylized fantasy RPG style
- modern hand-painted cartoon game art
- non-pixel-art
- clean readable silhouette
- refined dark outline
- soft upper-left lighting
- original character design

AI-generated artwork must not:

- crop the character
- cut off the feet
- cut off the head
- change proportions
- change perspective
- change facing direction
- introduce backgrounds
- add text
- add UI
- add extra characters
- randomly change anatomy
- randomly change lighting

Any AI output that fails to preserve this framing is not valid for use as the main player character asset.

---

## 13. Equipment AI Generation Rules

When generating a new equipment asset, the AI must treat the existing body as locked.

Equipment generation must preserve:

- Canvas = 512 × 512
- Center X = 256
- Feet baseline = Y = 445
- Facing = Right
- Scale = same as master character
- Perspective = same
- Lighting = same
- Style = same
- Outline = same

The equipment must be designed to fit the current body without changing the base figure.

Do not regenerate the entire character when creating a single equipment item unless explicitly requested.

Examples:

- Helmet generation: only the helmet layer should change; the head and body proportions remain unchanged.
- Shirt generation: only the top layer should change; the body, head, legs, and shoes remain unchanged.
- Weapon generation: only the weapon layer should change; the body and motion remain unchanged.

---

## 14. Animation Requirements

The character system must support these animation states:

- idle
- walk
- jump
- attack
- hurt
- death

The architecture must allow future sprite-sheet animation. Future animation frames should use:

- 512 × 512 px per frame

Every frame must preserve:

- same canvas size
- same anchor
- same feet baseline
- same character scale
- same proportions
- same facing direction

Animation must not cause the character to randomly jump between positions because of inconsistent AI-generated framing.

---

## 15. Future Character Extensibility

This specification supports future additions such as:

- inventory
- equipment
- rarity
- equipment upgrades
- character classes
- stats
- buffs
- debuffs
- cosmetics
- accessories
- pets
- visual effects
- weapons
- armor sets
- character customization
- hair styles
- face variations
- skin variations
- server persistence
- multiplayer synchronization

These features may be added later, but the current goal is to establish a stable foundation.

---

## 16. Development Rules

Whenever future work modifies the player character:

1. Read this file first.
2. Preserve the master measurements.
3. Preserve the master anchor.
4. Preserve the art style.
5. Preserve the layer architecture.
6. Preserve the equipment compatibility rules.
7. Do not introduce incompatible asset dimensions.
8. Do not silently change the character's proportions.
9. If a change intentionally modifies the specification, update this document first.
10. Treat this document as the authoritative source of truth.

This specification takes precedence over ad hoc room for interpretation.

---

## 17. Required AI Prompt Template

The following template is for future developers and AI tools to generate master assets, equipment, weapons, accessories, and animation-friendly art that remain compatible with the player character system.

## AI CHARACTER GENERATION TEMPLATE

```text
Create a 2D stylized fantasy RPG player character based on the following authoritative specification.

LOCKED TECHNICAL REQUIREMENTS:
- Canvas: 512x512 PNG, transparent background, RGBA
- Character centered at X = 256
- Feet baseline fixed at Y = 445
- Character height approximately 400 px
- Maximum width approximately 220 px
- Must face RIGHT
- Full body visible, no cropping
- Maintain consistent proportions across body, head, torso, legs, and shoes
- Maintain same scale, perspective, and alignment as the master character
- Use 2D stylized fantasy RPG art direction
- Modern hand-painted/cartoon game art
- Not pixel art
- Not photorealistic
- Not anime
- Not chibi mascot style
- Clean readable silhouette
- Refined dark-colored outline, not pure black
- Soft upper-left lighting, subtle form shading, restrained highlights
- Original character design; no copyrighted characters or copied franchises
- No background, UI, text, or extra characters
- No random anatomy changes

CHARACTER DESCRIPTION:
[CHARACTER_DESCRIPTION]

EQUIPMENT DESCRIPTION:
[EQUIPMENT_DESCRIPTION]

POSE:
[POSE]

EXPRESSION:
[EXPRESSION]

ANIMATION STATE:
[ANIMATION_STATE]

STYLE NOTES:
- polished fantasy adventurer
- approachable yet heroic
- warm natural skin tones
- soft but defined shading
- readable silhouette in-game at small scale
- consistent lighting direction
- consistent body language and proportion rules

OUTPUT REQUIREMENTS:
- Transparent PNG
- 512x512 canvas
- Full body centered with grounded feet
- Stable anchor and proportions
- Right-facing master orientation
- No background or UI
- No text
- No extra characters
- Compatible with layered equipment system
```

This template can be used for:

- master character generation
- clothing
- armor sets
- weapons
- accessories
- helmets
- animation frames
- cosmetic items
- future NPCs that share the same visual pipeline

---

## 18. Summary of the Locked Rules

The character foundation is defined by the following permanent constraints:

- original fantasy adventurer identity
- right-facing master artwork
- 512 × 512 transparent PNG canvas
- stable 256 × 445 grounding anchor
- readable stylized body proportions
- consistent equipment layering
- coherent lighting and outline treatment
- equipment-swapping compatibility
- animation-friendly framing
- future-proof extension without breaking the core identity

This document is the reference baseline for all future player character work.
