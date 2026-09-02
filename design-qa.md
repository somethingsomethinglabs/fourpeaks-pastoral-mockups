# Design QA: Space service-page revision

## Scope

Reviewed all seven service detail pages after replacing the generic capability and deliverables pattern with service-specific scope, handover and enquiry content.

Pages checked:

- Precision aerial application
- Aerial mapping and surveying
- LiDAR survey and terrain intelligence
- Environmental and carbon project support
- Agricultural intelligence
- Thermal wildlife and animal surveys
- Project verification and reporting

## Visual comparison

- Reference: `design-qa-evidence/source-service-aerial-application-1280x2400.png`
- Implementation: `design-qa-evidence/implementation-service-aerial-application-1280x2400.png`
- Side-by-side review: `design-qa-evidence/comparison-service-aerial-application-2560x2400.png`
- Mobile implementation: `design-qa-evidence/implementation-service-aerial-application-390x1800.png`
- Reference and implementation used the same desktop viewport and initial page state.

The existing Space design system remains intact: Montserrat typography, navy and olive palette, topo texture, restrained borders, inset landscape media and square-edged sections. The intentional change is below the opening statement: the long ruled capability list and repetitive three-column deliverables block are replaced by three grouped service areas and a shorter project handover section.

## Findings and iteration

- P0: none.
- P1: none.
- P2 resolved: removed a reference to the absent `background-mode.js` file from the seven edited pages, eliminating the related 404.
- P2 accepted: the mockup switcher remains fixed to the bottom edge in preview mode. It is a review utility and is not part of the Squarespace page content.
- Desktop layout has no horizontal overflow at 1279 CSS pixels.
- Mobile rendering at 390 pixels preserves readable line lengths, stacks scope groups and evidence rows, and exposes the existing menu control.
- All seven pages contain one H1, three scope groups and four handover rows.
- All local images load, fonts resolve, contact and service links remain present, and no missing local assets remain in the edited pages.

final result: passed
