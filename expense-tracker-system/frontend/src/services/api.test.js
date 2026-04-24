jest.mock("axios", () => ({
  create: jest.fn(),
}));

jest.mock("../utils/auth", () => ({
  getStoredAuthSession: jest.fn(() => null),
}));

function loadApiModule() {
  jest.resetModules();

  const axios = require("axios");
  const apiClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
      },
    },
  };

  axios.create.mockReturnValue(apiClient);

  return {
    apiClient,
    ...require("./api"),
  };
}

describe("api service", () => {
  test("fetchDashboardData requests the user expenses endpoint", async () => {
    const { apiClient, fetchDashboardData } = loadApiModule();

    apiClient.get
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await fetchDashboardData(1);

    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/1");
    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/category-summary/1");
    expect(apiClient.get).toHaveBeenCalledWith("/expenses/user/1");
    expect(apiClient.get).toHaveBeenCalledWith("/categories");
    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/top-expenses/1");
  });

  test("fetchExpensesPageData unwraps nested collection payloads", async () => {
    const { apiClient, fetchExpensesPageData } = loadApiModule();

    apiClient.get
      .mockResolvedValueOnce({ data: { dashboard: { totalCount: 2 } } })
      .mockResolvedValueOnce({
        data: {
          expenses: [
            { id: 1, category: { id: 9, name: "Food" } },
            { id: 2, category: { id: 11, name: "Travel" } },
          ],
        },
      })
      .mockResolvedValueOnce({ data: { categories: [{ id: 9, name: "Food" }] } });

    const response = await fetchExpensesPageData(7);

    expect(response).toEqual({
      dashboard: { totalCount: 2 },
      expenses: [
        { id: 1, category: { id: 9, name: "Food" }, categoryId: 9, categoryName: "Food" },
        {
          id: 2,
          category: { id: 11, name: "Travel" },
          categoryId: 11,
          categoryName: "Travel",
        },
      ],
      categories: [{ id: 9, name: "Food" }],
    });
  });

  test("fetchExpensesPageData requests the user expenses endpoint", async () => {
    const { apiClient, fetchExpensesPageData } = loadApiModule();

    apiClient.get
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await fetchExpensesPageData(7);

    expect(apiClient.get).toHaveBeenCalledWith("/dashboard/7");
    expect(apiClient.get).toHaveBeenCalledWith("/expenses/user/7");
    expect(apiClient.get).toHaveBeenCalledWith("/categories");
  });

  test("fetchReportsData requests all report endpoints for the selected month", async () => {
    const { apiClient, fetchReportsData } = loadApiModule();

    apiClient.get
      .mockResolvedValueOnce({ data: { summary: { totalSpending: 450 } } })
      .mockResolvedValueOnce({ data: { categoryData: [{ category: "Food", total: 300 }] } })
      .mockResolvedValueOnce({ data: { trendData: [{ month: "Apr", total: 450 }] } });

    const response = await fetchReportsData(4, "2026-04");

    expect(apiClient.get).toHaveBeenCalledWith("/reports/summary/4?month=2026-04");
    expect(apiClient.get).toHaveBeenCalledWith("/reports/category/4?month=2026-04");
    expect(apiClient.get).toHaveBeenCalledWith("/reports/trend/4");
    expect(response).toEqual({
      summary: { totalSpending: 450 },
      categoryData: [{ category: "Food", total: 300 }],
      trendData: [{ month: "Apr", total: 450 }],
    });
  });

  test("getApiErrorMessage formats backend 500 responses clearly", () => {
    const { getApiErrorMessage } = loadApiModule();

    const message = getApiErrorMessage(
      {
        response: {
          status: 500,
          data: { message: "Expense not found with id: 1" },
        },
        config: {
          url: "/expenses/1",
        },
      },
      "Fallback"
    );

    expect(message).toBe(
      "Backend error 500 for /expenses/1: Expense not found with id: 1"
    );
  });

  test("getApiErrorMessage keeps category conflict messages friendly", () => {
    const { getApiErrorMessage } = loadApiModule();

    const message = getApiErrorMessage(
      {
        response: {
          status: 409,
          data: { message: "Category already exists." },
        },
        config: {
          url: "/categories",
        },
      },
      "Fallback"
    );

    expect(message).toBe("Category already exists.");
  });

  test("fetchBudgetPageData requests budgets and categories for the month", async () => {
    const { apiClient, fetchBudgetPageData } = loadApiModule();

    apiClient.get
      .mockResolvedValueOnce({ data: [] })
      .mockResolvedValueOnce({ data: [] });

    await fetchBudgetPageData(1, "2026-04");

    expect(apiClient.get).toHaveBeenCalledWith("/budgets/user/1?month=2026-04");
    expect(apiClient.get).toHaveBeenCalledWith("/categories");
  });

  test("budget mutations target the budget endpoints", async () => {
    const { apiClient, createBudget, updateBudget, deleteBudget } = loadApiModule();

    apiClient.post.mockResolvedValueOnce({ data: { id: 9 } });
    apiClient.put.mockResolvedValueOnce({ data: { id: 9 } });
    apiClient.delete.mockResolvedValueOnce({});

    await createBudget({ userId: 1, categoryId: 4, monthlyLimit: 500, month: "2026-04" });
    await updateBudget(9, { monthlyLimit: 700 });
    await deleteBudget(9);

    expect(apiClient.post).toHaveBeenCalledWith("/budgets", {
      userId: 1,
      categoryId: 4,
      monthlyLimit: 500,
      month: "2026-04",
    });
    expect(apiClient.put).toHaveBeenCalledWith("/budgets/9", {
      monthlyLimit: 700,
    });
    expect(apiClient.delete).toHaveBeenCalledWith("/budgets/9");
  });

  test("createCategory targets the categories endpoint", async () => {
    const { apiClient, createCategory } = loadApiModule();

    apiClient.post.mockResolvedValueOnce({ data: { id: 12, name: "Travel" } });

    const response = await createCategory({ name: "Travel" });

    expect(apiClient.post).toHaveBeenCalledWith("/categories", {
      name: "Travel",
    });
    expect(response).toEqual({ id: 12, name: "Travel" });
  });

  test("auth mutations target the auth endpoints", async () => {
    const { apiClient, loginUser, registerUser } = loadApiModule();

    apiClient.post
      .mockResolvedValueOnce({ data: { token: "abc" } })
      .mockResolvedValueOnce({ data: { id: 4 } });

    await loginUser({ email: "demo@example.com", password: "secret" });
    await registerUser({
      name: "Demo",
      email: "demo@example.com",
      password: "secret",
      phone: "9876543210",
    });

    expect(apiClient.post).toHaveBeenCalledWith("/auth/login", {
      email: "demo@example.com",
      password: "secret",
    });
    expect(apiClient.post).toHaveBeenCalledWith("/auth/register", {
      name: "Demo",
      email: "demo@example.com",
      password: "secret",
      phone: "9876543210",
    });
  });

  test("getApiErrorMessage explains auth login 500 responses more clearly", () => {
    const { getApiErrorMessage } = loadApiModule();

    const message = getApiErrorMessage(
      {
        response: {
          status: 500,
          data: { error: "Internal Server Error" },
        },
        config: {
          url: "/auth/login",
        },
      },
      "Fallback"
    );

    expect(message).toBe(
      "Sign in failed. Check that the email and password match your registered account."
    );
  });

  test("getApiErrorMessage explains auth register 500 responses more clearly", () => {
    const { getApiErrorMessage } = loadApiModule();

    const message = getApiErrorMessage(
      {
        response: {
          status: 500,
          data: { error: "Internal Server Error" },
        },
        config: {
          url: "/auth/register",
        },
      },
      "Fallback"
    );

    expect(message).toBe(
      "Registration failed. That email is already registered. Try signing in instead, or use a different email."
    );
  });
});
