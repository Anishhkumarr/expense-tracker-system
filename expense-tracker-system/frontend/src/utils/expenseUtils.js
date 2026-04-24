export const USER_ID = Number(process.env.REACT_APP_USER_ID || 1);

export const CATEGORY_COLORS = [
  "#ff6b6b",
  "#4ecdc4",
  "#ffd85e",
  "#f35cb3",
  "#4f7cff",
  "#73d783",
];

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export function formatShortDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatFullDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function buildCategoryMap(categories) {
  return categories.reduce((map, category) => {
    map[category.id] = category.name;
    return map;
  }, {});
}

export function decorateExpenses(expenses, categoryMap) {
  return expenses.map((expense) => {
    const nestedCategory =
      expense?.category && typeof expense.category === "object"
        ? expense.category
        : null;
    const categoryId = expense.categoryId ?? nestedCategory?.id ?? null;
    const categoryName =
      expense.categoryName ||
      (typeof expense.category === "string" ? expense.category : "") ||
      nestedCategory?.name ||
      categoryMap[categoryId] ||
      "Uncategorized";

    return {
      ...expense,
      categoryId,
      categoryName,
    };
  });
}

export function getBadgeLabel(name) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export function getAveragePerDay(dailySpending) {
  if (!dailySpending.length) {
    return 0;
  }

  const total = dailySpending.reduce((sum, entry) => sum + entry.total, 0);
  return total / dailySpending.length;
}
