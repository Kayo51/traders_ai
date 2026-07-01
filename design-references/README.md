# Design References

This folder contains reference assets used to map visuals to GSAP animation scenes on the landing page.

## Folder Structure

### `nano-banana/` — Static UI References
PNG screenshots from Nano Banana showing the layout and visual design of each scene. Used as the source of truth for what each UI state looks like.

### `higgsfield/` — Motion References
MP4 clips from Higgsfield showing the motion style and transitions for each scene. Used to guide GSAP animation timing and easing.

## Scene Mapping

Scene numbers **must match** across both folders. Scene `01` in `nano-banana/` corresponds directly to scene `01` in `higgsfield/`.

| # | Scene |
|---|-------|
| 01 | Hero phone |
| 02 | Incoming call |
| 03 | AI chat |
| 04 | Business settings |
| 05 | Leads cards |
| 06 | Dashboard |
| 07 | Calendar booking |
| 08 | WhatsApp UI |
| 09 | Priority scoring |
| 10 | Final reveal |

## Usage

Drop the real assets into the appropriate folders when ready. The file names are fixed — do not rename them, as GSAP scene references depend on the numbering.
