# Design

The visual design comes from the owner's Lovable prototype. The source files are kept in
[`design/lovable/`](design/lovable/) for reference: `styles.css` (tokens) and `index.tsx`
(all screens). Its tokens are already in `apps/mobile/src/core/ui/theme.ts`.

The Lovable prototype is a web app (React + Tailwind). We rebuild its **look** in React Native;
its code, data model and behaviour are not reused. Where it differs from
[`SCOPE.md`](SCOPE.md) on **what** the app does, SCOPE wins. The product spec's design notes
(red accent, square corners, B&W photos…) are superseded by this design.

## Tokens

| Token          | Hex       | Use                                                   |
| -------------- | --------- | ----------------------------------------------------- |
| `background`   | `#F7F7F1` | Screen background                                     |
| `card`         | `#FFFFFF` | Cards, inputs                                         |
| `text`         | `#142219` | Body text                                             |
| `textMuted`    | `#5D6E64` | Secondary text                                        |
| `primary`      | `#165135` | Main buttons, headings, tab bar, daily progress card  |
| `inkPanel`     | `#083A23` | Dark number panels (plan, target), toasts, track bars |
| `secondary`    | `#EBF3EA` | Chips / pills                                         |
| `accent`       | `#9CC63A` | = `success`: "on track", selected states, active tab  |
| `accentLight`  | `#E4C878` | Eyebrow text on dark panels                           |
| `commerce`     | `#ED990E` | Money actions: add (+), cart button, view-cart bar    |
| `commerceSoft` | `#FFE9C7` | Guidance card background                              |
| `successSoft`  | `#DEF0C1` |                                                       |
| `danger`       | `#C93029` | Errors                                                |
| `border`       | `#DCE4DC` | Borders and rules                                     |

**Type:** Space Grotesk (500/600/700) for headings and big numbers, DM Sans (400–700) for
everything else. Numbers are tabular.

| Style     | Font / size / line height                           |
| --------- | --------------------------------------------------- |
| `display` | Space Grotesk 700 · 36 / 38                         |
| `title`   | Space Grotesk 700 · 30 / 33                         |
| `number`  | Space Grotesk 700 · 44 / 44                         |
| `eyebrow` | DM Sans 700 · 11 / 15 · uppercase · 0.08em tracking |

**Radii:** inputs and buttons 14, cards 24, big panels ~24 (`rounded-3xl`), selection
squares 7, pills fully round. **Shadows:** cards `0 8 24` primary @ 7%, sheets `0 18 45`
primary @ 18%. **Controls:** inputs and primary buttons are 52 high.

## Components

- **Button variants:** `nourish` (primary filled, full width "action" size, trailing arrow),
  `nourishOutline`, `nourishGhost` (text link with icon), `commerce` (orange, used for `+`
  and cart), `ink` (selected category chip). _`components/ui/button.tsx` was not shared yet;
  exact padding/radius for variants to be confirmed._
- **Card** (`soft-card`): white, 1px border, radius 24, soft shadow.
- **Stat**: value (21, bold, primary) over a 10px muted label, cells split by vertical rules.
- **Progress bar**: 8 high, fully rounded, success fill (commerce for sugar / "warm").
- **Choice row**: title + delta line (kcal · protein · Rs) and a 22px rounded check square.
- **Pills**: rounded-full `secondary` background, 12px muted text (`620 kcal`, `42g protein`).
- **Bottom sheet**: dark scrim, sheet rises from the bottom, eyebrow + title + body + button.
- **Toast**: `inkPanel` bar above the tab bar, white bold text.
- **Icons**: Lucide (use `lucide-react-native`).

## App shell

- **Floating tab bar**: `primary` pill (radius 26, 72 high), 12px from the screen edges and
  bottom. Five tabs: Home · Target · **Cart** · Coach · Profile. Cart is a raised 56px orange
  circle with a 5px `background` ring and an item-count badge. Active tab is `success`,
  inactive white at 55%. Labels 9px bold.
- **View-cart bar**: when the cart has items, an orange bar floats above the tab bar:
  "2 items · Rs 1,780 · View cart →".
- **Pushed screens** (menu, meal, plan, sign-in, location): sticky header with back arrow and
  centred bold `primary` title, 1px bottom border.

## Screens

- **Home**: greeting ("Good morning," + name in `primary`), delivery-address link with map
  pin, round bell button · **Daily progress** card (`primary`, radius 24): progress ring
  (104px, success arc on `inkPanel`, % in the centre), protein and sugar bars, "See your full
  target →" · **Curated for you**: eyebrow + "Eat well, feel good." + featured meal card
  (photo with "High protein" pill, name, description, price, kcal/protein pills, "Customize"
  primary + orange `+`) · **Guidance** card (`commerceSoft`, orange icon tile) · **More to
  explore**: horizontal 172px meal tiles.
- **Target**: eyebrow, title, intro · `inkPanel` panel with daily kcal (`number` style),
  protein and added-sugar split · carbs/fat/water stat row · "Set / Update my plan".
- **Menu**: eyebrow "MENU / <CITY>", title, category chips (selected = ink) · meal rows:
  108px rounded photo, category in `success`, name, kcal · protein, price, orange `+`.
- **Meal (customise)**: 290px photo · eyebrow, title, price · description · nutrition badge
  link → sheet · kcal/protein/sugar stats + carbs/fat/kcal-left line · ingredients and
  "Contains / Kitchen also handles" · adjust choices · quantity stepper · pinned "Add to
  cart · Rs …".
- **Cart**: list (80px photo, name, qty × kcal · protein, price, remove) · subtotal ·
  checkout note · "Checkout →". Empty state with bag icon and "Browse the menu".
- **Plan**: form (name, age, sex, height, weight, activity, goal, pace, meals a day) →
  result: `inkPanel` daily kcal, two stat rows, BMI and target weight, safety notes, save.
- **Sign in**: phone field with "+92" prefix block → 6-digit code field.
- **Location**: "Use my current location" outline button · address, house/flat, landmark.
- **Profile**: sections split by rules (account, delivery, nutrition), sign in / out.

## Not taken from the prototype

- **Demo OTP** (code shown on screen, fake email/password accounts): real phone OTP instead.
- Prototype data and flows that conflict with SCOPE (e.g. client-side order totals, one
  fixed city "LAHORE" label, plan form as one long page instead of the onboarding steps).
- **Coach** tab: the design is kept, but Coach is Phase 2. Until then the tab is hidden or
  shows a "coming soon" state — owner to decide.
- Web-only details: `app-frame` max width, hover effects, scrollbars.
