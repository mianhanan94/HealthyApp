> **Read [`SCOPE.md`](SCOPE.md) first.** This is the original product spec, kept for reference.
> Owner decisions in `SCOPE.md` override it wherever they conflict, nothing about **design**
> (colours, type, sizes, photo style, radii, rules, icons, layout look) is taken from it, and
> only features listed in the `SCOPE.md` MVP are built. "Part 0" was not supplied.

# Nourish — Product & UI Spec for Lovable

Nutrition-first food & drinks delivery for Pakistan (pilot: Lahore).
Paste **Part 0** into Lovable first, then one screen section at a time.

**Core idea:** the user builds a meal around what they want it to contain, sees the effect of every change on calories, protein, sugar and price as they make it, and gets exactly that meal delivered.

---

### 0.6 Nutrition honesty rules (global)

- Every product shows a nutrition badge: **Verified** (accent tag), **Calculated** (outline tag), **Estimated** (neutral tag). Tap → sheet explaining what it means.
- Only show nutrients we can calculate: kcal, protein, carbs, fat, sugar at MVP. Fibre/sodium only where recipe data supports it.
- Never claim "allergy safe". Show "Contains: …" and "Prepared in a kitchen that also handles: …".
- BMI is shown at onboarding and 4-weekly re-checks, with kind wording. No medical claims. No daily weight tracking.

---

## PART 1 — Onboarding & Auth

Flow: **Splash → Welcome → Sign up details → OTP → Body result (BMI) → Goal & pace → Nutrition plan → Location → Home**
Returning users: **Welcome → Log in (phone) → OTP → Home**

A thin progress bar (2px, accent on neutral-300) runs across the top of screens 1.3–1.7 showing step X of 5.

### 1.1 Splash

- Full-bleed `accent` red. Wordmark "Nourish" 44/800 white, bottom-left aligned at 32px padding (flush left, not centred). Line under it: "Food, your way." 14 white.
- 1.2s max, then route: logged in → Home; else → Welcome.

### 1.2 Welcome

**Purpose:** say what's different in 5 seconds, then get out of the way.

- Top 55%: B&W full-bleed photo of a bowl being built (placeholder), 2px ink rule under it.
- Below, a 3-slide horizontal pager (swipe + dots as 8px squares):
  1. "Change anything." — "Less sugar, extra chicken, no cheese. You decide how it's made."
  2. "See what's in it." — "Every change shows calories, protein and sugar before you order."
  3. "Get exactly that." — "Delivered as you built it, labelled on the pack."
- Primary: **Create account**. Secondary: **I already have an account**. Ghost at bottom: "Browse without an account" → Home in guest mode (targets default to 600 kcal / 30g protein / 15g sugar; ordering prompts sign-up at checkout).

### 1.3 Sign up — Your details (step 1 of 5)

**Purpose:** collect everything a fitness coach would ask on day one — in one screen, in under a minute.
Header: kicker "STEP 1 OF 5", H1 "Let's set you up.", body "A few quick questions so we can work out exactly what your body needs."

Fields, grouped with 2px rules and a small uppercase group label:

**ABOUT YOU**

1. **Full name** — 2–40 chars, letters/spaces.
2. **Mobile number** — "+92" prefix block + `3XX XXXXXXX`, auto-spaced, must start with 3, 10 digits. Helper: "We'll send a code to verify it."
3. **Age** — stepper (− value +), 13–90.
4. **Sex** — segmented: Male · Female. Helper: "Men and women burn calories differently, so this keeps your numbers accurate." _(Required — the calorie formula needs it.)_
5. If Female → extra row: "Pregnant or breastfeeding?" Yes · No. (Yes → no weight-loss plan; see 1.5 safety rules.)

**YOUR BODY**

6. **Height** — Feet (4–7) + Inches (0–11) selects side by side. Link "Use cm".
7. **Weight** — number, "kg" suffix inside field, 30–200, one decimal. Link "Use lbs".
8. **Waist** _(optional)_ — inches, with a "How to measure" link (sheet: "Tape around your belly button, relaxed, after breathing out"). Helper: "Optional — gives a better read than BMI alone."

**YOUR DAY**

9. **How active are you?** — 5 stacked rows (square marker, title + one line):
   - Mostly sitting — "Desk job, little walking"
   - Lightly active — "Walk or light exercise 1–3 days a week"
   - Active — "Gym or sport 3–5 days a week"
   - Very active — "Hard training 6–7 days a week"
   - Athlete / labour job — "Physical work or training twice a day"

**Live BMI preview** (slides in under Weight once height + weight are filled):

- 13.5/800: "BMI 25.4 · Overweight" — ink if Healthy, **accent** otherwise. Second line 12 muted: "Healthy for 5′ 9″ is 57–70 kg. Full breakdown after sign-up."

Bottom (pinned): lock-icon privacy line "Only used to plan your food. Never shown to restaurants." · Primary **Send code** · terms line · ghost "Skip for now".

Validation on blur, not on keystroke. Errors replace helper text in accent-700. Tapping the button with errors scrolls to and shakes the first bad field.
States: empty · partial · BMI preview · error · sending ("Sending…" + square spinner) · network error toast.

### 1.4 OTP — Enter the code (step 2 of 5)

Header: kicker "STEP 2 OF 5", H1 "Enter the code.", body "Sent to **+92 300 1234567**." + ghost "Edit" (back to 1.3, data kept).

- **6 square boxes** (52×60, 2px rule, 26/800). Active box = accent border. One hidden input with `autocomplete="one-time-code"` + `inputmode="numeric"` so SMS autofill works; pasting 6 digits fills all.
- Auto-submits on the 6th digit. Primary **Verify** also pinned at bottom.
- "Resend code in 0:45" → at 0 becomes ghost "Resend by SMS" · "Get a call instead".
- Helper: "Code not arriving? Network can be slow — give it a minute."
- Wrong: boxes turn accent + shake, "That code isn't right. 2 tries left." 3 wrong → 5-min lock with exact unlock time.
- Success: boxes fill accent one by one (40ms stagger) → 1.5.
- Native number keyboard only — no custom keypad.

---

### 1.5 Your body result (step 3 of 5)

**Purpose:** the coach moment. Honest, kind, specific — your BMI, what it means, and exactly how far you are from a healthy weight.

Header: kicker "STEP 3 OF 5", H1 "Hamza, here's your result."

**A. BMI score block**

- Big number 64/800 tabular: **25.4**, label "BMI" 11 uppercase above.
- Category tag beside it: **HEALTHY** (ink fill) / **UNDERWEIGHT**, **OVERWEIGHT**, **OBESE** (accent fill).
- **BMI scale bar** — full width, 14px, 0 radius, four segments proportional over 15–35: Underweight (<18.5) · Healthy (18.5–22.9) · Overweight (23–27.4) · Obese (≥27.5). Healthy = ink, others neutral-300, the user's segment = accent. 2px ink marker + "You 25.4" above; ticks 18.5 · 23 · 27.5 below.
- Verdict 22/800:
  - Underweight → accent: "You're a little underweight."
  - Healthy → ink: "You're in the healthy range. Nice."
  - Overweight → accent: "You're a little overweight."
  - Obese → accent: "Your weight is above the healthy range."

**B. Your numbers — 3-cell grid (2px rules)**

| Cell                   | Example        | Meaning                                         |
| ---------------------- | -------------- | ----------------------------------------------- |
| Healthy weight for you | **57 – 70 kg** | BMI 18.5–22.9 at your height                    |
| Your target weight     | **70 kg**      | See target rule below                           |
| To reach it            | **−8 kg** (accent) | "+4 kg" if gaining; "0 kg — stay here" if healthy |

**C. Waist check** (only if waist entered): "Waist-to-height 0.54 — a bit high (aim under 0.5)." Ink if <0.5, accent if ≥0.5. If BMI is Overweight but waist-to-height <0.5 and activity is Active or above: "Your BMI may be high because of muscle. Your waist says you're in good shape." → default goal becomes Build muscle, not Lose.

**D. Coach's note** (1px ink border box), kicker "WHAT THIS MEANS", 2–3 plain sentences:

- Overweight: "Losing 8 kg brings you into your healthy range. Your first milestone is 4 kg — that alone lowers your risk of diabetes and heart disease. At a steady pace that's about 8 weeks."
- Underweight: "Gaining 4 kg brings you into your healthy range. We'll add calories and protein so the weight you gain is mostly muscle, not fat."
- Healthy: "You don't need to lose or gain. Keep protein high and added sugar low and you'll stay here — or build muscle if you want to."

Footnote 11.5 muted: "BMI uses height and weight only and doesn't measure muscle. For South Asians we use the Asian cut-offs, because health risk starts at a lower weight. Not medical advice."

Primary **Set my goal**.

**Rules (`lib/body.ts`, unit-tested):**

- BMI = kg ÷ m², 1 decimal.
- Categories (WHO Asian cut-offs): <18.5 Underweight · 18.5–22.9 Healthy · 23–27.4 Overweight · ≥27.5 Obese.
- Healthy range = 18.5 × m² … 22.9 × m², whole kg.
- **Target weight:** Overweight/Obese → top of healthy range; if that's >20% below current, use current × 0.9 as "Step 1 target" and say so. Underweight → bottom of range + 2 kg. Healthy → current.
- **First milestone** (overweight/obese): 5% of current, rounded to 0.5 kg.
- Waist-to-height = waist cm ÷ height cm; flag ≥ 0.5.
- **Safety overrides** (calm ink box, not red):
  - Age < 18 → no deficit/surplus; goal "Healthy growth"; "Growing bodies need full fuel. We'll focus on balanced meals, not weight."
  - Pregnant/breastfeeding → no loss goal; maintain + "Talk to your doctor about your needs."
  - BMI < 16 or ≥ 40 → show plan plus "We recommend speaking to a doctor before changing your diet."

---

### 1.6 Your goal & pace (step 4 of 5)

**Purpose:** let the user choose how fast — and show what each choice means in weeks and calories.

H1 "How fast do you want to get there?"

**Goal** (pre-selected from 1.5, tag "SUGGESTED"): **Lose weight** · **Stay where I am** · **Gain weight** · **Build muscle** (small surplus, high protein — offered when Healthy, or Overweight with a good waist).

**Pace** (lose/gain only) — three rows, each showing weekly change, daily calorie change and finish date:

| Pace                 | Lose                        | Gain                        |
| -------------------- | --------------------------- | --------------------------- |
| Gentle               | −0.25 kg/wk · −275 kcal/day | +0.25 kg/wk · +250 kcal/day |
| **Steady (default)** | −0.5 kg/wk · −550 kcal/day  | +0.35 kg/wk · +350 kcal/day |
| Faster               | −0.75 kg/wk · −825 kcal/day | +0.5 kg/wk · +500 kcal/day  |

Each row's second line: "Reach 70 kg by **19 Jan 2027** · 16 weeks".

- Deficit **capped at 25% of maintenance** and never below the floor (1,500 kcal men / 1,200 women). If a pace breaks that, the row is disabled: "Too fast for your body — try Steady."
- **Mini timeline chart** under the rows: straight line current → target over the weeks, accent dot at the 5% milestone, months on the x-axis. Ink line, no gradients.
- 12 muted: "1 kg of body fat ≈ 7,700 kcal. A steady pace protects muscle and is easier to stick to."

**Meals a day** segmented: 2 · 3 · 3 + snack (default) · 4.

Primary **Build my plan**.

---

### 1.7 Your nutrition plan (step 5 of 5)

**Purpose:** exact daily and per-meal numbers — the ones every screen in the app uses.

H1 "Your daily plan." · line "Built to take you from 78 kg to 70 kg at 0.5 kg a week."

**A. Daily target — ink panel, white text**

- **1,850 kcal** 44/800, "a day". Under: "Your body burns about 2,390. We've taken 540 off."
- **Macro grid** 2 × 3 cells (value 22/800 + label + % of calories):

| Protein          | Carbs             | Fat             |
| ---------------- | ----------------- | --------------- |
| **110 g** · 24%  | **222 g** · 48%   | **58 g** · 28%  |
| **Fibre**        | **Added sugar**   | **Water**       |
| **30 g** min     | **23 g** max      | **2.7 L**       |

- **Macro split bar** (full width, 10px): protein accent-400 · carbs white · fat neutral-500, proportional by calories, with legend.

**B. Per meal — table (2px outer rules, 1px row rules)**

| Meal            | kcal      | Protein   | Carbs     | Fat      | Fibre    |
| --------------- | --------- | --------- | --------- | -------- | -------- |
| Breakfast (25%) | 460       | 28 g      | 56 g      | 15 g     | 8 g      |
| Lunch (35%)     | 650       | 38 g      | 77 g      | 20 g     | 10 g     |
| Dinner (30%)    | 555       | 33 g      | 67 g      | 17 g     | 9 g      |
| Snack (10%)     | 185       | 11 g      | 22 g      | 6 g      | 3 g      |
| **Day**         | **1,850** | **110 g** | **222 g** | **58 g** | **30 g** |

Rows always add up exactly to the Day row (rounding rule below).

**C. Coach tips** — 3 rows with square bullets, by goal:

- Lose: "Get 30g+ protein every main meal — it keeps you full." · "Fill half the plate with vegetables for fibre." · "Swap sugary drinks for shakes without honey."
- Gain: "Add a snack between meals instead of overeating at dinner." · "Nuts, peanut butter and whole milk add easy calories." · "Pair it with strength training so the weight is muscle."
- Maintain / Build muscle: "Keep protein steady at every meal." · "Watch added sugar in drinks and desserts." · "Check your weight once a month, not every day."

**D. Actions**

- Every number tappable → inline stepper (kcal ±50, grams ±5). Edited values get an "EDITED" tag; carbs rebalance so calories stay consistent.
- Primary **Start ordering**. Secondary **Change goal or pace** (→ 1.6).
- Footnote: "Estimates for a healthy adult — real needs can differ by ±10%. We'll suggest a re-check every 4 weeks."

**Maths (`lib/plan.ts`, unit-tested):**

1. **BMR** (Mifflin–St Jeor): men `10·kg + 6.25·cm − 5·age + 5`; women `… − 161`.
2. **Maintenance (TDEE)** = BMR × activity: 1.2 · 1.375 · 1.55 · 1.725 · 1.9.
3. **Daily kcal** = TDEE − deficit (lose) / + surplus (gain) / + 150 (build muscle) / ±0 (maintain). Apply floor and 25% cap. Round to nearest 50.
4. **Protein** g/day — use **target weight** if overweight, else current: lose 1.6 · maintain 1.2 · gain 1.6 · build muscle 2.0 · age 60+ minimum 1.2 · under 18: 1.0. Round to 5.
5. **Fat** = 28% of kcal ÷ 9 (min 0.6 g/kg, max 35% of kcal). Whole g.
6. **Carbs** = (kcal − protein×4 − fat×9) ÷ 4. Whole g.
7. **Fibre** = 14 g per 1,000 kcal, minimum 25 g women / 30 g men.
8. **Added sugar max** = 5% of kcal ÷ 4 (WHO ideal), round down.
9. **Water** = 35 ml × kg, +0.5 L if Active or above, 1 decimal L.
10. **Meal split:** 2 meals 45/55 · 3 meals 30/40/30 · 3 + snack 25/35/30/10 · 4 meals 25/25/25/25. Round each (kcal to 5, grams to 1); add the rounding remainder to the **largest** meal so rows sum exactly to the day.
11. **Weeks to target** = |target − current| ÷ weekly rate, rounded up. Finish date = today + weeks.

**Worked example (use as the unit test):** Male, 28, 5′ 9″ (175.3 cm), 78 kg, lightly active, Lose · Steady · 3 + snack.
BMI 25.4 → Overweight · healthy 57–70 kg · target 70 kg · −8 kg · milestone 4 kg (8 weeks) · full target 16 weeks.
BMR 1,741 → TDEE 2,393 → −550 → **1,850 kcal**. Protein 1.6 × 70 = **110 g**. Fat 28% → **58 g**. Carbs (1,850 − 440 − 522) ÷ 4 = **222 g**. Fibre 26 → floor **30 g**. Sugar **23 g**. Water **2.7 L**.

**Where these numbers flow:** per-meal kcal/protein/sugar are the defaults for Build to Target (3.2), the plan-fit line on product pages (2.5), the progress bars on Customise (3.1), the Home "Today" strip (2.1) and the Coach (5.1).

### 1.8 Location

H1 "Where should we deliver?"

- Primary **Use my current location** (Lucide `locate`). Asks permission.
- Secondary **Enter address manually** → search field with Google Places (Lahore bias).
- After pin: B&W map, draggable square pin, address card below: area, street, **house/flat no.** (required), **nearest landmark** (optional — important in Pakistan), label chips Home / Work / Other.
- Out of service area: accent box "We're not in your area yet. We're live in Gulberg, DHA, Johar Town and Model Town." + "Notify me when you launch here".
- Primary **Save address**.

### 1.9 Log in (returning)

H1 "Welcome back." Only the phone field + Primary **Send code** → 1.4 → Home. Ghost "New here? Create account".

---

## PART 2 — Home & Discovery

### 2.1 Home

**Purpose:** answer "what should I eat right now?" — for the user, not for a generic visitor.
Top → bottom:

1. **Header row** (16px pad, 2px rule below): left "Deliver to" 11 muted + "Home · Gulberg III ▾" 14/800 (tap → address sheet). Right: Lucide `bell` with red square dot if unread.
2. **Today strip** — ink panel, full width. Kicker "TODAY" + three mini progress bars side by side: kcal `540 / 2,370`, protein `45 / 120g`, sugar `4 / 30g`. Each bar 4px, accent fill. Line under: "One more meal like lunch and you're on track." Tap → Coach. _(Only counts food ordered through the app. First-time: "Your first order starts your day's tally.")_
3. **Hero** — Display "What are you in the mood for?" and a search field below it (48px, Lucide `search`, placeholder "Search dishes, drinks, kitchens").
4. **Two big doors** (2-column grid, 1px rules, each 120px tall):
   - **Fits my plan** — "Meals under 790 kcal with 40g+ protein" → Build to Target (pre-filled).
   - **Build my own** — "Start from a base and choose everything" → Customize-first list.
5. **Quick goals** chips row (horizontal scroll, square outline chips): High protein · Under 500 kcal · No added sugar · Post-workout · Breakfast · Desi but lighter · Drinks & shakes.
6. **"Your usuals"** (if ≥2 past orders): horizontal cards 240px — last build name, merchant, 3 numbers, **Reorder** secondary button. If recipe changed since: tag "RECIPE UPDATED".
7. **"Fits your plan tonight"** — vertical list of product rows (see component 2.6), 4 items, "See all" ghost.
8. **Kitchens near you** — 2-column grid of merchant tiles: B&W photo, name, "25–35 min · Rs 79 delivery", badge "VERIFIED KITCHEN" if our controlled kitchen.
9. **Desi, made lighter** — themed rail (Chicken karahi, less oil · Daal chawal, brown rice · Chapli kebab, air-fried).

Empty/edge: kitchens closed → ink banner "Most kitchens open at 11 AM. Browse and schedule for later." Guest mode → Today strip replaced by "Create an account to get a plan made for you."

### 2.2 Search

- Field auto-focused, recent searches (list with Lucide `clock`, "Clear").
- Results as you type (debounce 250ms), grouped: **Dishes** · **Kitchens** · **Ingredients** ("Dishes with chicken").
- Filter bar under field (sticky): **Sort** (Recommended / Lowest kcal / Highest protein / Price / Delivery time) · **kcal** range · **Protein min** · **Sugar max** · **Diet** (Vegetarian, Eggless, Dairy-free, No nuts in recipe) · **Nutrition badge** (Verified only).
- Filters open as a bottom sheet with range sliders (square thumbs, 2px track).
- No results: "Nothing matches all of that. Try loosening protein to 30g." + one-tap button that does it.

### 2.3 Category / Goal listing

Header: back arrow, H1 "High protein", one line "30g+ protein per serving".

- Filter + sort bar (as 2.2).
- Product row list (2.6). Infinite scroll, skeleton rows while loading (neutral-300 blocks, no shimmer).

### 2.4 Kitchen (merchant) page

- B&W cover 180px, 2px ink rule. Name H1, "Healthy bowls · Gulberg III · 1.8 km". Meta row cells: rating `4.6` · time `25–35 min` · delivery `Rs 79` · min order `Rs 400`.
- Badges: "VERIFIED KITCHEN" / "Nutrition: 90% verified".
- **Separate ratings** row: Taste 4.7 · Freshness 4.6 · Made as ordered 4.9 · Packaging 4.4.
- Sticky category tabs (horizontal, underline = 3px accent): Bowls · Wraps · Shakes · Snacks.
- Product rows grouped by category.
- Closed: ink banner "Opens at 11:00 AM. You can schedule an order."

### 2.5 Product detail

Top → bottom:

1. B&W photo 260px, back + share (square white icon buttons) over it.
2. Tags row: nutrition badge · "Customisable" · diet tags.
3. H1 name, merchant + distance line (tap → kitchen), price 22/800.
4. **Nutrition grid** — 4 cells: kcal · protein (accent) · carbs · fat, then a 5th full-width row: sugar with a bar showing it against the user's per-meal sugar cap.
5. **Plan fit line** — ink square + "Fits your plan: 420 of 790 kcal, 32 of 40g protein." or accent square + "Over your meal plan by 110 kcal — customise to fit."
6. Description 14 body (≤2 lines, "More").
7. **Ingredients** — neutral tags with quantities ("Banana 120g").
8. **Allergens** box (accent-100 fill): "Contains: milk. Prepared in a kitchen that also handles: nuts, gluten."
9. Recipe meta 11.5 muted: "Recipe v1.1 · updated 12 Sep · Verified".
10. Pinned bottom bar: secondary **Add as is — Rs 650** · primary **Customise**.

### 2.6 Component — Product row

- 84px square B&W thumb left; right: name 15/800 (2 lines max), merchant 11.5 muted, then numbers row `420 kcal · 32g protein · Rs 650`.
- Right-edge tag if it fits plan: "FITS" (ink outline). If over: nothing (don't shame).
- Tap row → 2.5. Long-press → quick add sheet.

---

## PART 3 — Build (the core)

### 3.1 Customise — live nutrition panel

**This is the product. Spend the most design effort here.**

**Sticky header (ink panel, white text, 2px accent bottom rule):**

- Back · product name 12 uppercase muted.
- **Live kcal** Number-XL, counts on change, delta chip beside (`+120 kcal` accent-400).
- Macro row: protein · carbs · fat · sugar, each with a 3px progress bar vs. per-meal plan (fills accent-400; overflow segment shows past 100%).
- Price on the right of the macro row, also counts.

**Over-plan banner** (under header, accent fill, only when over): "This build is 110 kcal over your meal plan." + white button **Fix it** (applies the smallest set of swaps that brings it under — e.g. honey→none, whole→low-fat milk) and ghost-white "Keep it". Never blocks ordering.

**Modifier groups** (each = 2px rule top, label 11 uppercase, rules text right: "Required · pick 1" / "Optional · up to 3"):

- **Single-choice** (milk, base, bread): rows with square marker, name 14/600, right side `+40 kcal · +Rs 40` (or "—").
- **Stepper** (whey scoops, chicken grams): − value + (44px square buttons), unit label, progress track under showing min–max, line "Each scoop: +120 kcal, +24g protein, +Rs 100". Merchant sets min/max/step.
- **Multi-choice** (add-ons): checkbox rows, same right-side deltas.
- **Remove** (ingredients in base): rows with "Remove" toggle, showing `−80 kcal`.
- **Sweetness / spice level**: 4-cell segmented, each cell shows its delta under it.

Every option shows its **cost before tapping** (kcal and Rs). This is non-negotiable.

**Smart nudges** (inline, under the relevant group, surface fill, 1 line + one-tap action):

- "Swap honey for dates: same sweetness, 18g less added sugar." [Swap]
- "Add 50g chicken to hit your 40g protein." [Add]
  Show max one nudge at a time.

**Bottom (pinned):**

- Breakdown: "Base Rs 650 · Your changes +Rs 140".
- Ghost **Save this build** → sheet to name it ("My post-workout shake"), saves to Saved builds.
- Primary **Add to cart — Rs 790**.

States: loading (skeleton), option out of stock (row 45% opacity + "Out today"), dependency conflict ("Almond milk isn't available with Malt. Remove Malt?" sheet).

### 3.2 Build to Target

**Purpose:** user states the constraints; we return ready-configured meals that meet them.

- Header: H1 "Build to target", close X.
- Three target cards (1px border each), pre-filled from the plan:
  - **Calories under** — big value + slider 300–1,200, step 50, with quick chips 500 / 600 / 790 (plan) / 900.
  - **Protein at least** — 0–80g, step 5.
  - **Added sugar max** — 0–40g, step 5.
- Optional chips: Meal type (Breakfast / Lunch / Dinner / Snack / Drink) · Budget (Under Rs 800 / 1,200) · Diet.
- Live result count line (accent-700): "14 builds fit" — updates as sliders move.
- Results: cards showing name, kitchen, price, 3 numbers, and a **"What we changed"** line in accent-700: "Sauce swapped to low-cal · +50g chicken". Tap → Customise pre-set with those modifiers.
- Zero results: "Nothing fits all three. Closest: 830 kcal, 42g protein." + "Raise calories to 850" button.
- Ranking: fits all → closest to protein target → verified first → delivery time.

### 3.3 Saved builds

- List of named builds: name 15/800, base product + kitchen, numbers, **Reorder** primary-small.
- Swipe left → Rename / Delete.
- "Recipe updated" tag if the base recipe version changed; tap shows diff sheet: "Milk changed from whole to low-fat: −55 kcal."
- Empty: "Save a build from any customise screen and it lands here."

---

## PART 4 — Cart, Checkout, Orders

### 4.1 Cart

- Header H1 "Your order", kitchen name (single-kitchen cart at MVP; adding from another kitchen → sheet "Start a new cart?").
- Item rows: name, **modifier summary** 11.5 muted ("no sugar · almond milk · 3 scoops"), numbers, qty stepper, price. Tap → back to Customise to edit.
- **Order nutrition panel** (ink): kcal · protein · sugar for the whole order, and "After this order: 1,330 of 2,370 kcal today."
- Suggestions rail: "Add 20g protein for Rs 180 — Boiled eggs ×2".
- Promo code field (collapsed row "Add promo code").
- Bill: Items · Delivery fee (with distance) · Small-order fee if under min · Discount · **Total**.
- Primary **Checkout — Rs 1,579**.
- Empty: "Your cart is empty." + "Find something that fits".

### 4.2 Checkout

Sections separated by 2px rules:

1. **Deliver to** — saved address card, "Change". Rider note field ("Call on arrival, gate 2").
2. **When** — segmented: ASAP (35–45 min) · Schedule → time slot sheet in 30-min slots.
3. **Pay with** — rows with square markers: **Cash on delivery** (default) · **JazzCash** · **Easypaisa** · Debit/credit card (Visa/Mastercard/UnionPay) . Wallet → enter wallet number, OTP in-app.
4. **Cutlery** toggle "Send cutlery" (default off — "Less plastic").
5. Revalidation note 11.5 muted: "We re-check price, stock and opening hours before placing your order."
6. Primary **Place order — Rs 1,579**.
   Errors: price changed → sheet showing old vs new, "Continue at Rs 1,629". Item unavailable → sheet with alternative + its nutrition difference: "Low-fat milk instead? −55 kcal, same price." Never substitute silently.

### 4.3 Order placed

- Full-screen accent red, white: check-square icon, H1 "Order placed.", "The kitchen is confirming now." Auto-advances to 4.4 in 2s.

### 4.4 Track order

- Top: kicker "ORDER #10234", Display ETA range "35–45 min" (narrow to "8:12–8:18 PM" once rider assigned).
- B&W map 220px with rider pin (accent square) and home pin (ink square), when rider assigned.
- Status list (rows, square markers, times right): Placed · Confirmed · Preparing · Rider picked up · On the way · Delivered. Current row bold + accent marker pulsing (opacity only).
- Rider card: photo (square), name, bike plate, **Call** and **WhatsApp** buttons.
- **Your label** preview card: 2px ink border — "CUSTOM BUILD", name, kcal · protein, modifier line, QR block. "This is printed on your pack."
- Help ghost "Something wrong?" → support sheet.

### 4.5 Delivered → Rate

Auto-sheet on delivery:

- H2 "How was it?"
- **Four separate ratings**, 5 squares each (tap to fill accent): Taste · Freshness · **Made as I ordered** · Packaging. Plus Rider (thumbs up/down).
- If "Made as I ordered" ≤ 3 → quick chips: "Sugar added" · "Wrong milk" · "Missing item" · "Portion too small" + photo upload. This routes to merchant quality score, not a review.
- Optional text, primary **Submit**. Ghost "Skip".

### 4.6 Orders history

- Tabs: Active · Past.
- Rows: date, kitchen, items summary, total, status tag. **Reorder** button.
- Order detail: frozen snapshot (recipe version, exact modifiers, nutrition, price as paid), bill, **Get help**, **Reorder** (warns if recipe/price changed since).

---

## PART 5 — Coach (advice from data)

### 5.1 Coach home

**Purpose:** turn order history into useful, kind, actionable food advice.

- Period switch segmented: This week · 14 days · 30 days.
- Headline H1 written from data: "You're hitting protein. Sugar is creeping in." (templates, max 8 words.)
- **Stats grid** 3 cells: avg protein/meal · avg kcal/meal · avg added sugar/meal — each with "vs plan" delta tag.
- **Week chart**: 7 vertical bars (0 radius) of kcal per day vs a 2px accent plan line. Tap a day → that day's orders.
- **Your food pattern ("Meal DNA")** tags: "High protein" · "Chicken-led" · "Evening orders" · "Sugar up this week".
- **Advice cards** (max 3, 1px border each): kicker (PATTERN / GAP / WORKING), title 15.5/800, 2-line body with the actual numbers, **one action button** that does the thing:
  - "Your evening shakes carry most of your sugar." → [Rebuild with dates]
  - "12g short of protein today." → [Show 2 builds that close it]
  - "Keep the Tuesday bowl — it fits every target." → [Reorder]
- Footnote: "Based only on what you ordered through Nourish. Not medical advice."
- Empty (<3 orders): "Order a few meals and we'll start spotting patterns." + progress "1 of 3 orders".

### 5.2 Update my body details (from Coach or Profile)

- Weight field only (plus height if changed) → recalculates range, verdict and plan, shows old vs new plan side by side, **Use new plan**. Suggest a gentle monthly prompt, never daily. No weight history graph.

---

## PART 6 — Profile & Settings

### 6.1 Profile

Rows with Lucide icons and chevrons, 2px rules between groups:

- **Header**: name H2, phone muted, "Edit".
- **My plan** — shows per-meal numbers, → 1.7 editable.
- **My body details** — age, height, weight, goal, activity → 5.2.
- **Saved builds** · **Addresses** · **Payment methods** · **Orders**.
- **Dietary preferences**: Vegetarian, No beef, Eggless, Dairy-free, Avoid nuts (filters apply everywhere; banner in search "Hiding items with nuts").
- **Notifications**: Order updates (locked on) · Coach tips (weekly) · Offers.
- **Language**: English (Roman Urdu — coming soon).
- **Help & support** (WhatsApp chat, FAQ, call).
- **Privacy**: "Download my data" · "Delete my body details" · "Delete account" (confirm dialog, type DELETE).
- Log out (ghost, accent-700).

### 6.2 Addresses

List with label, full address, landmark; default marker; add/edit uses 1.8.

### 6.3 Payment methods

Saved JazzCash/Easypaisa numbers (masked), cards (last 4), set default, remove.

### 6.4 Notifications inbox

Rows: icon, title, 1 line, time. Unread = accent square left. Types: order status, "Your saved build's recipe changed", coach weekly summary, offers (labelled "OFFER").

### 6.5 Help

Order-specific issues (from active/past order), FAQ accordions (0 radius, + / − icons), WhatsApp support button.

---

## PART 7 — System states (build as reusable components)

- **No internet**: ink top banner "You're offline. Showing saved menu." Actions that need network disabled with tooltip.
- **Location off / denied**: full-screen explainer + "Open settings".
- **Kitchen closed mid-cart**: sheet "Kitchen No.4 just closed. Schedule for 11 AM tomorrow?"
- **Rider delayed**: accent strip on tracking "Running 10 min late. Sorry — Rs 50 credit added."
- **Session expired**: phone + OTP sheet over the current screen, returns user to where they were.
- **Loading**: flat neutral-300 skeleton blocks matching layout; no spinners except in buttons.
- **Toasts**: ink bar, white text, optional accent action ("Undo").
- **Confirm dialogs**: surface panel, shadow-lg, title 18/800, body, actions right-aligned: secondary + primary.

---

## PART 8 — Data model (Supabase)

- `users` (id, name, phone, age, sex, pregnant, height_cm, weight_kg, waist_cm, activity, goal, pace, meals_per_day, created_at)
- `body_checks` (user_id, date, weight_kg, bmi, category, target_kg, milestone_kg) — one row per 4-weekly re-check
- `plans` (user_id, tdee, kcal_day, protein_g, carbs_g, fat_g, fibre_g, sugar_max_g, water_l, meal_split jsonb, target_date, edited, updated_at)
- `addresses` (user_id, label, lat, lng, line1, house, landmark, is_default)
- `merchants` (id, name, type[controlled|partner], lat, lng, hours, delivery_radius_km, min_order, ratings jsonb)
- `products` (id, merchant_id, name, category, photo, base_price, current_recipe_version_id, tags[])
- `recipe_versions` (id, product_id, version, ingredients jsonb [{ingredient_id, grams}], nutrition jsonb, status[verified|calculated|estimated], created_at) — **never edited in place**
- `ingredients` (id, name, per_100g nutrition, allergens[], in_stock)
- `modifier_groups` (id, product_id, name, type[single|multi|stepper|remove|level], required, min, max, step)
- `modifier_options` (id, group_id, name, ingredient_id, grams_delta, price_delta, nutrition_delta jsonb, depends_on, excludes)
- `saved_builds` (id, user_id, name, product_id, recipe_version_id, modifiers jsonb)
- `orders` (id, user_id, merchant_id, status, eta_min, eta_max, address snapshot, payment_method, totals, created_at)
- `order_items` (order_id, product_id, recipe_version_id, modifiers jsonb, **nutrition_snapshot jsonb**, **price_snapshot**) — frozen at purchase
- `ratings` (order_id, taste, freshness, made_as_ordered, packaging, rider, issues[], photo, text)

Nutrition of a build = recipe_version.nutrition + Σ option.nutrition_delta. Calculated client-side for instant feedback, **re-calculated server-side at checkout** and stored.

---

## PART 9 — Suggested Lovable prompt order

1. Part 0 (foundation, tokens, components, shell).
2. Part 1 screens 1.1–1.4 (welcome, sign up, OTP) with Supabase phone auth.
3. 1.5–1.8 (body check, goal, plan, location) + the maths as a tested `lib/plan.ts`.
4. 2.1 Home + 2.6 row + 2.5 Product detail with seeded data (5 kitchens, 30 products).
5. 3.1 Customise — ask Lovable specifically for the counting number + delta chip + over-plan banner.
6. 3.2 Build to Target, 3.3 Saved builds.
7. Part 4 (cart → rate).
8. Part 5 Coach, then Part 6 Profile, then Part 7 states.

**Acceptance checks for every screen:** 0 radius everywhere · labels flush left · 2px rules between sections · all numbers tabular · every tappable ≥44px · no green · photos grayscale · all copy from i18n file · works at 360px wide.

---

## Open decisions for you

1. **Sex field** — now required, because the calorie formula needs it. OK?
2. **B&W food photos** — on-brand for Modernist but unusual for food. Test with 5 users before committing.
3. **6-digit vs 4-digit OTP** — spec says 6 (gateway standard); confirm with your SMS provider.
4. **Multi-kitchen cart** — spec'd as single-kitchen for MVP.
