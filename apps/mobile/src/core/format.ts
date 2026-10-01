export function formatMoney(rupees: number): string {
  return `Rs ${rupees.toLocaleString('en-PK')}`;
}
