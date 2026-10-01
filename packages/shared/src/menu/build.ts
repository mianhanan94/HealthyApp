import { round } from '../health/rounding';
import type {
  Allergen,
  BuildSelection,
  MenuItem,
  ModifierGroup,
  ModifierOption,
  Nutrition,
} from './types';

/**
 * A customised meal ("build") = base recipe + the user's modifier selection. These functions
 * run on the phone for instant feedback and on the server at checkout, so both agree.
 */

function chosenIds(selection: BuildSelection, groupId: string): string[] {
  const value = selection[groupId];
  return Array.isArray(value) ? value : [];
}

function chosenCount(selection: BuildSelection, group: ModifierGroup): number {
  if (group.type !== 'stepper') return 0;
  const value = selection[group.id];
  return typeof value === 'number' ? value : group.defaultCount;
}

function defaultOptionIds(group: ModifierGroup): string[] {
  switch (group.type) {
    case 'single': {
      const preferred = group.options.find((o) => o.isDefault && o.available);
      const fallback = group.options.find((o) => o.available);
      const pick = preferred ?? fallback;
      return pick ? [pick.id] : [];
    }
    case 'multi':
      return group.options.filter((o) => o.isDefault && o.available).map((o) => o.id);
    default:
      return [];
  }
}

export function defaultSelection(item: MenuItem): BuildSelection {
  const selection: BuildSelection = {};
  for (const group of item.modifierGroups) {
    selection[group.id] = group.type === 'stepper' ? group.defaultCount : defaultOptionIds(group);
  }
  return selection;
}

export type BuildIssueCode =
  | 'item_unavailable'
  | 'required'
  | 'too_many'
  | 'unknown_option'
  | 'option_unavailable'
  | 'out_of_range';

export interface BuildIssue {
  code: BuildIssueCode;
  groupId?: string;
  optionId?: string;
}

export function validateBuild(item: MenuItem, selection: BuildSelection): BuildIssue[] {
  const issues: BuildIssue[] = [];
  if (!item.available) issues.push({ code: 'item_unavailable' });

  for (const group of item.modifierGroups) {
    if (group.type === 'stepper') {
      const count = chosenCount(selection, group);
      if (!Number.isInteger(count) || count < group.min || count > group.max) {
        issues.push({ code: 'out_of_range', groupId: group.id });
      } else if (count > group.defaultCount && !group.option.available) {
        issues.push({ code: 'option_unavailable', groupId: group.id, optionId: group.option.id });
      }
      continue;
    }

    const ids = chosenIds(selection, group.id);
    for (const id of ids) {
      const option = group.options.find((o) => o.id === id);
      if (!option) issues.push({ code: 'unknown_option', groupId: group.id, optionId: id });
      // Removing an ingredient is always possible, even if it's out of stock.
      else if (!option.available && group.type !== 'remove') {
        issues.push({ code: 'option_unavailable', groupId: group.id, optionId: id });
      }
    }
    if (group.type === 'single') {
      if (ids.length === 0) issues.push({ code: 'required', groupId: group.id });
      if (ids.length > 1) issues.push({ code: 'too_many', groupId: group.id });
    }
    if (group.type === 'multi' && ids.length > group.max) {
      issues.push({ code: 'too_many', groupId: group.id });
    }
  }
  return issues;
}

function selectedOptions(
  item: MenuItem,
  selection: BuildSelection,
): { option: ModifierOption; units: number; priceUnits: number; adds: boolean }[] {
  const result: { option: ModifierOption; units: number; priceUnits: number; adds: boolean }[] = [];
  for (const group of item.modifierGroups) {
    if (group.type === 'stepper') {
      const extra = chosenCount(selection, group) - group.defaultCount;
      // Fewer units than the default lowers nutrition but not the price.
      result.push({
        option: group.option,
        units: extra,
        priceUnits: Math.max(0, extra),
        adds: chosenCount(selection, group) > 0,
      });
      continue;
    }
    for (const id of chosenIds(selection, group.id)) {
      const option = group.options.find((o) => o.id === id);
      if (option) result.push({ option, units: 1, priceUnits: 1, adds: group.type !== 'remove' });
    }
  }
  return result;
}

function roundNutrition(n: Nutrition): Nutrition {
  return {
    kcal: Math.max(0, round(n.kcal)),
    proteinG: Math.max(0, round(n.proteinG, 1)),
    carbsG: Math.max(0, round(n.carbsG, 1)),
    fatG: Math.max(0, round(n.fatG, 1)),
    sugarG: Math.max(0, round(n.sugarG, 1)),
  };
}

export function buildNutrition(item: MenuItem, selection: BuildSelection): Nutrition {
  const total = { ...item.base };
  for (const { option, units } of selectedOptions(item, selection)) {
    total.kcal += option.delta.kcal * units;
    total.proteinG += option.delta.proteinG * units;
    total.carbsG += option.delta.carbsG * units;
    total.fatG += option.delta.fatG * units;
    total.sugarG += option.delta.sugarG * units;
  }
  return roundNutrition(total);
}

/** Unit price in rupees. */
export function buildPrice(item: MenuItem, selection: BuildSelection): number {
  const extras = selectedOptions(item, selection).reduce(
    (sum, { option, priceUnits }) => sum + option.priceDelta * priceUnits,
    0,
  );
  return Math.max(0, item.basePrice + extras);
}

/**
 * Allergens in the build. Removing an ingredient never removes its allergen: the kitchen can't
 * guarantee it, so we stay conservative.
 */
export function buildAllergens(item: MenuItem, selection: BuildSelection): Allergen[] {
  const set = new Set<Allergen>(item.allergens);
  for (const { option, adds } of selectedOptions(item, selection)) {
    if (adds) option.allergens?.forEach((a) => set.add(a));
  }
  return [...set].sort();
}

export type BuildChange =
  | { kind: 'choose'; groupId: string; name: string }
  | { kind: 'add'; groupId: string; name: string }
  | { kind: 'remove'; groupId: string; name: string }
  | { kind: 'count'; groupId: string; name: string; count: number; unit: string };

/** What differs from the default build, for cart lines and order labels. */
export function buildChanges(item: MenuItem, selection: BuildSelection): BuildChange[] {
  const changes: BuildChange[] = [];
  for (const group of item.modifierGroups) {
    if (group.type === 'stepper') {
      const count = chosenCount(selection, group);
      if (count !== group.defaultCount) {
        changes.push({
          kind: 'count',
          groupId: group.id,
          name: group.option.name,
          count,
          unit: group.unit,
        });
      }
      continue;
    }
    const chosen = chosenIds(selection, group.id);
    const defaults = defaultOptionIds(group);
    const nameOf = (id: string) => group.options.find((o) => o.id === id)?.name ?? id;
    if (group.type === 'single') {
      if (chosen[0] && chosen[0] !== defaults[0]) {
        changes.push({ kind: 'choose', groupId: group.id, name: nameOf(chosen[0]) });
      }
    } else if (group.type === 'multi') {
      chosen
        .filter((id) => !defaults.includes(id))
        .forEach((id) => changes.push({ kind: 'add', groupId: group.id, name: nameOf(id) }));
      defaults
        .filter((id) => !chosen.includes(id))
        .forEach((id) => changes.push({ kind: 'remove', groupId: group.id, name: nameOf(id) }));
    } else {
      chosen.forEach((id) => changes.push({ kind: 'remove', groupId: group.id, name: nameOf(id) }));
    }
  }
  return changes;
}

/** Stable key: two builds with the same key are the same meal and merge in the cart. */
export function selectionKey(selection: BuildSelection): string {
  return Object.keys(selection)
    .sort()
    .map((groupId) => {
      const value = selection[groupId];
      return `${groupId}=${Array.isArray(value) ? [...value].sort().join(',') : String(value)}`;
    })
    .join('|');
}
