import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import Expenses from "./Expenses";
import {
  createCategory,
  createExpense,
  fetchExpensesPageData,
  getApiErrorMessage,
  updateExpense,
} from "../services/api";

jest.mock("../components/Navbar", () => () => <div>Navbar</div>);

jest.mock("../services/api", () => ({
  createCategory: jest.fn(),
  createExpense: jest.fn(),
  deleteExpense: jest.fn(),
  fetchExpensesPageData: jest.fn(),
  getApiErrorMessage: jest.fn(() => "Mock API error"),
  updateExpense: jest.fn(),
}));

describe("Expenses category handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    fetchExpensesPageData.mockResolvedValue({
      dashboard: {
        totalAmount: 0,
        totalCount: 0,
      },
      expenses: [],
      categories: [
        { id: 1, name: "Food" },
        { id: 2, name: "Transport" },
      ],
    });

    createExpense.mockResolvedValue({ id: 99 });
    createCategory.mockResolvedValue({ id: 3, name: "Subscriptions" });
    updateExpense.mockResolvedValue({ id: 99 });
    getApiErrorMessage.mockReturnValue("Mock API error");
  });

  test("saves an expense with an existing backend category", async () => {
    render(<Expenses currentPath="/expenses" onNavigate={jest.fn()} />);

    await screen.findByRole("heading", { name: "Expenses" });

    fireEvent.click(screen.getByRole("button", { name: /\+ add expense/i }));
    const dialog = screen.getByRole("dialog");

    fireEvent.change(within(dialog).getByLabelText(/title/i), {
      target: { value: "Flight" },
    });
    fireEvent.change(within(dialog).getByLabelText(/amount/i), {
      target: { value: "2500" },
    });
    fireEvent.change(within(dialog).getByLabelText(/date/i), {
      target: { value: "2026-04-18" },
    });
    fireEvent.change(within(dialog).getByLabelText(/category/i), {
      target: { value: "2" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /save expense/i }));

    await waitFor(() => expect(createExpense).toHaveBeenCalled());

    expect(createExpense).toHaveBeenCalledWith({
      title: "Flight",
      description: "",
      amount: 2500,
      date: "2026-04-18",
      time: null,
      categoryId: 2,
      userId: 1,
    });
  });

  test("creates a new category from the expense modal and uses it for save", async () => {
    render(<Expenses currentPath="/expenses" onNavigate={jest.fn()} />);

    await screen.findByRole("heading", { name: "Expenses" });

    fireEvent.click(screen.getByRole("button", { name: /\+ add expense/i }));
    const dialog = screen.getByRole("dialog");

    fireEvent.click(
      within(dialog).getByRole("button", { name: /\+ add new category/i })
    );
    fireEvent.change(within(dialog).getByPlaceholderText(/new category name/i), {
      target: { value: "Subscriptions" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: /save category/i })
    );

    await waitFor(() =>
      expect(createCategory).toHaveBeenCalledWith({ name: "Subscriptions" })
    );

    fireEvent.change(within(dialog).getByLabelText(/title/i), {
      target: { value: "Netflix" },
    });
    fireEvent.change(within(dialog).getByLabelText(/amount/i), {
      target: { value: "499" },
    });
    fireEvent.change(within(dialog).getByLabelText(/date/i), {
      target: { value: "2026-04-18" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /save expense/i }));

    await waitFor(() => expect(createExpense).toHaveBeenCalled());

    expect(createExpense).toHaveBeenCalledWith({
      title: "Netflix",
      description: "",
      amount: 499,
      date: "2026-04-18",
      time: null,
      categoryId: 3,
      userId: 1,
    });
  });

  test("uses nested backend category data when editing an expense", async () => {
    fetchExpensesPageData.mockResolvedValueOnce({
      dashboard: {
        totalAmount: 800,
        totalCount: 1,
      },
      expenses: [
        {
          id: 10,
          title: "Dinner",
          description: "",
          amount: 800,
          date: "2026-04-18",
          time: "19:30:00",
          category: { id: 1, name: "Food" },
        },
      ],
      categories: [
        { id: 1, name: "Food" },
        { id: 2, name: "Transport" },
      ],
    });

    render(<Expenses currentPath="/expenses" onNavigate={jest.fn()} />);

    await screen.findByRole("heading", { name: "Expenses" });

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    const dialog = screen.getByRole("dialog");

    fireEvent.change(within(dialog).getByLabelText(/category/i), {
      target: { value: "2" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: /update expense/i }));

    await waitFor(() => expect(updateExpense).toHaveBeenCalled());

    expect(updateExpense).toHaveBeenCalledWith(10, {
      title: "Dinner",
      description: "",
      amount: 800,
      date: "2026-04-18",
      time: "19:30",
      categoryId: 2,
      userId: 1,
    });
  });
});
