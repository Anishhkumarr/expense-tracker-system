import { render, screen } from "@testing-library/react";
import App from "./App";
import { AUTH_STORAGE_KEY } from "./utils/auth";

jest.mock("react-chartjs-2", () => ({
  Bar: () => <div>bar chart</div>,
  Pie: () => <div>pie chart</div>,
}));

jest.mock("./services/api", () => ({
  fetchDashboardData: jest.fn(() =>
    Promise.resolve({
      dashboard: {
        totalAmount: 260.98,
        totalCount: 4,
      },
      categorySummary: [{ category: "Food & Dining", total: 45.99 }],
      expenses: [],
      categories: [],
      topExpenses: [],
    })
  ),
  fetchBudgetPageData: jest.fn(() =>
    Promise.resolve({
      budgets: [],
      categories: [],
    })
  ),
  fetchReportsData: jest.fn(() =>
    Promise.resolve({
      summary: {},
      categoryData: [],
      trendData: [],
    })
  ),
  getApiErrorMessage: jest.fn(() => "Mock API error"),
}));

beforeEach(() => {
  window.localStorage.clear();
  window.history.pushState({}, "", "/");
});

test("renders auth home first when there is no active session", async () => {
  render(<App />);
  expect(await screen.findByText(/best way to save your money/i)).toBeInTheDocument();
});

test("renders budget page from the budget route after login session exists", async () => {
  window.history.pushState({}, "", "/budget");
  window.localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ userId: 7, token: "demo-token" })
  );

  render(<App />);

  expect(await screen.findByText(/budget management/i)).toBeInTheDocument();
});
