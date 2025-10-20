import { DEPOSIT, MIN_MEAL_BUDGET, MIN_WINE_BUDGET } from "./constants";
import type { BookingFormValues } from "./validation";

export function calculateTotals(values: BookingFormValues) {
  const mealBudget = Math.max(values.pricing.mealBudgetPerPersonMax, MIN_MEAL_BUDGET);
  const wineBudget = values.pricing.winePairings.include
    ? Math.max(values.pricing.winePairings.budgetPerPersonMax ?? MIN_WINE_BUDGET, MIN_WINE_BUDGET)
    : 0;
  const perPersonTotal = mealBudget + wineBudget;
  const estimatedTotal = perPersonTotal * values.party.partySize;
  const balanceDue = Math.max(estimatedTotal - DEPOSIT, 0);

  return {
    perPersonFood: mealBudget,
    perPersonWine: wineBudget,
    perPersonTotal,
    estimatedTotal,
    depositDue: DEPOSIT,
    balanceDue
  };
}
