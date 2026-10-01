# Scope

What HealthyApp does, what is in the MVP, and what is deliberately left out.
How it is built is in [`ARCHITECTURE.md`](../ARCHITECTURE.md).

## Precedence

1. **Owner decisions** (below) are final.
2. [`product-spec.md`](product-spec.md) fills in functional detail only where it does not
   conflict with an owner decision. Where they conflict, the owner decision wins.
3. **No design is taken from the spec** (colours, fonts, sizes, photo style, radii, rules,
   icons, layout look). The design is the owner's Lovable prototype: see
   [`DESIGN.md`](DESIGN.md).
4. Spec features not listed in the MVP below are not built until the owner asks for them.

## Owner decisions

| Topic             | Decision                                                                               |
| ----------------- | -------------------------------------------------------------------------------------- |
| Product           | Personal health data for each user, and ordering healthy meals, shakes and drinks only |
| Platforms         | iOS and Android from one Expo codebase; MVVM                                           |
| Market            | Pakistan. Launch in **Lahore and Faisalabad**                                          |
| Stores            | All stores are **ours** (no partner kitchens). A city can have many stores             |
| Delivery area     | Each store has a location and a delivery radius (e.g. 10 km)                           |
| Products          | Each store shows only the products we enable for it                                    |
| Store choice      | Automatic: the **nearest open store** in range. The user does not pick a store         |
| Delivery          | **Our own riders**                                                                     |
| Login             | Phone number + OTP                                                                     |
| Health data       | Entered by the user. No Apple Health / Google Health Connect for now                   |
| Offline           | User can view their own data; ordering requires internet                               |
| Language          | English (default) and Roman Urdu                                                       |
| Admin             | Web admin panel                                                                        |
| Address search    | Like Foodpanda/Grab: search with autocomplete, current location, map pin               |
| Weekly meal plans | Wanted (2 meals/day, chosen a week ahead) but moved to **Phase 2**                     |
| Backend           | Supabase, chosen to keep running cost low for the first 2–3 years                      |
| Design            | Owner's Lovable prototype ([`DESIGN.md`](DESIGN.md)); nothing from the spec            |

## MVP

**Customer app**

- Onboarding: details (name, phone, age, sex, pregnancy question, height, weight, optional
  waist, activity) → OTP → body result (BMI) → goal and pace → nutrition plan → address
  (spec 1.3–1.9)
- Health maths per spec 1.5–1.7, with the safety rules (in `packages/shared`, unit-tested)
- Guest browsing; sign-up required at checkout
- Home: today's tally from orders, search, goal chips, "fits my plan" list
- Product detail: nutrition, ingredients, allergens ("Contains…" / shared-kitchen line),
  plan-fit line, nutrition badge (Verified / Calculated / Estimated)
- Customise with live totals; every option shows its kcal and price before tapping;
  over-plan banner that never blocks ordering
- Cart (single store), checkout (ASAP or scheduled, **cash on delivery**), server-side
  re-validation, price/availability-changed sheets, never substitute silently
- Order tracking by status, rider name with Call/WhatsApp; push notifications
- Order history with frozen snapshots and reorder
- Simple rating after delivery
- Profile: plan, body details update (monthly prompt, never daily), addresses, dietary
  preferences, language, help (WhatsApp), log out, **delete account** (required by Apple)
- System states: offline, location denied, store closed, session expired

**Rider app**

- Assigned orders, customer address and landmark, open in Google Maps, call customer
- Status updates (picked up → delivered), mark cash collected

**Admin panel**

- Cities, stores (location, radius, opening hours), meals with recipes and nutrition,
  modifiers, per-store availability and price
- Live orders board, assign rider, order status
- Users, riders, store managers (store managers see only their store)
- Basic sales report

## Phase 2

- Weekly meal plans / subscriptions (2 meals a day, chosen a week ahead)
- JazzCash, Easypaisa and card payments; saved payment methods
- Live rider location on a map; auto-assign the nearest rider
- Coach (spec Part 5): patterns, advice cards, week chart. Its tab is hidden in the MVP (four tabs)
- Build to Target (spec 3.2)
- Smart nudges and "Fix it" auto-swap on Customise
- Saved builds and "recipe updated" diffs (recipe versions are stored from the MVP onwards)
- Promo codes, small-order fee, upsell suggestions
- Detailed ratings (four categories, issue chips, photos)
- Notifications inbox
- Download my data

## Not planned

- Partner / third-party kitchens, kitchen browsing pages, kitchen ratings, "Verified
  kitchen" badges, merchant quality scores: all stores are ours
- Wallet / credits (e.g. the "Rs 50 credit" for late riders)
- OTP by voice call
- Printed QR labels on packs (revisit when kitchens are set up)

## Corrections to the spec

- **Pilot:** Lahore and Faisalabad, not Lahore only.
- **Service area:** defined by each store's radius, not a list of area names. The
  "not in your area" message lists areas derived from active stores.
- **Roman Urdu** ships in the MVP (spec says "coming soon").
- **Offline:** shows the user's own data; ordering is disabled.
- **Data model:** `merchants` becomes `cities` + `stores` + `store_products` (per-store
  availability and price); `type [controlled|partner]` is dropped. Add rider and role
  tables, and later `subscriptions` / `subscription_meals`.
- **Gain pace:** the spec table (+250 / +350 / +500 kcal) is not derived from its own
  7,700 kcal/kg rule. We use the table values as written.
- **Per-meal kcal example:** the spec's 460 / 650 breakfast/lunch doesn't follow its own
  rounding rule; the rule gives 465 / 645. We follow the rule (rows still sum to the day).
- **Example numbers** on Home/Product screens (2,370 kcal, 790 kcal) are placeholders; real
  values come from the user's plan.
- **Privacy copy** "Never shown to restaurants" needs rewording: there are no third-party
  restaurants.

## Spec open decisions, resolved

1. Sex is required (the calorie formula needs it).
2. Photo style follows the Lovable design (colour photos).
3. OTP is 6 digits.
4. Cart holds one store's items (matches automatic store selection).
