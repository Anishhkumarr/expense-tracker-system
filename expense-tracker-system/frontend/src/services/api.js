import axios from "axios";
import { getStoredAuthSession } from "../utils/auth";

const DEFAULT_BACKEND_URL = "http://localhost:8082";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  (IS_DEVELOPMENT ? "" : DEFAULT_BACKEND_URL);

const API_TARGET_LABEL =
  process.env.REACT_APP_API_BASE_URL || DEFAULT_BACKEND_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const session = getStoredAuthSession();

  if (session?.token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${session.token}`,
    };
  }

  return config;
});

function unwrapCollection(data, keys = []) {
  if (Array.isArray(data)) {
    return data;
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const preferredValue = keys
    .map((key) => data[key])
    .find((value) => Array.isArray(value));

  if (preferredValue) {
    return preferredValue;
  }

  const discoveredValue = Object.values(data).find((value) => Array.isArray(value));
  return discoveredValue || [];
}

function unwrapObject(data, keys = []) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return {};
  }

  const preferredValue = keys
    .map((key) => data[key])
    .find((value) => value && typeof value === "object" && !Array.isArray(value));

  return preferredValue || data;
}

function normalizeExpense(expense) {
  if (!expense || typeof expense !== "object") {
    return expense;
  }

  const nestedCategory =
    expense.category && typeof expense.category === "object" ? expense.category : null;

  return {
    ...expense,
    categoryId:
      expense.categoryId ??
      nestedCategory?.id ??
      null,
    categoryName:
      expense.categoryName ||
      (typeof expense.category === "string" ? expense.category : "") ||
      nestedCategory?.name ||
      "",
  };
}

function normalizeExpenses(expenses) {
  return unwrapCollection(expenses, ["data", "expenses", "content"]).map(
    normalizeExpense
  );
}

function extractBackendMessage(data) {
  if (typeof data === "string" && data.trim()) {
    return data.trim();
  }

  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message.trim();
  }

  if (data && typeof data.error === "string" && data.error.trim()) {
    return data.error.trim();
  }

  return "";
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (error?.response) {
    const status = error.response.status;
    const path = error.config?.url || "request";
    const backendMessage = extractBackendMessage(error.response.data);

    if (
      path === "/auth/login" &&
      status === 500 &&
      (!backendMessage ||
        backendMessage.toLowerCase() === "internal server error")
    ) {
      return "Sign in failed. Check that the email and password match your registered account.";
    }

    if (
      path === "/auth/register" &&
      status === 500 &&
      (!backendMessage ||
        backendMessage.toLowerCase() === "internal server error")
    ) {
      return "Registration failed. That email is already registered. Try signing in instead, or use a different email.";
    }

    if (path === "/categories" && status >= 400 && status < 500) {
      return backendMessage || "Could not save category.";
    }

    if (backendMessage) {
      return `Backend error ${status} for ${path}: ${backendMessage}`;
    }

    return `Backend error ${status} for ${path}.`;
  }

  if (error?.request) {
    return `Could not reach backend at ${API_TARGET_LABEL}. Make sure Spring Boot is running.`;
  }

  return fallbackMessage;
}

export async function fetchDashboardData(userId) {
  const [
    dashboardResponse,
    categorySummaryResponse,
    expensesResponse,
    categoriesResponse,
    topExpensesResponse,
  ] = await Promise.all([
    api.get(`/dashboard/${userId}`),
    api.get(`/dashboard/category-summary/${userId}`),
    api.get(`/expenses/user/${userId}`),
    api.get("/categories"),
    api.get(`/dashboard/top-expenses/${userId}`),
  ]);

  return {
    dashboard: unwrapObject(dashboardResponse.data, ["data", "dashboard"]),
    categorySummary: unwrapCollection(categorySummaryResponse.data, [
      "data",
      "categorySummary",
      "summary",
    ]),
    expenses: normalizeExpenses(expensesResponse.data),
    categories: unwrapCollection(categoriesResponse.data, [
      "data",
      "categories",
      "content",
    ]),
    topExpenses: unwrapCollection(topExpensesResponse.data, [
      "data",
      "topExpenses",
      "expenses",
      "content",
    ]),
  };
}

export async function fetchExpensesPageData(userId) {
  const [dashboardResponse, expensesResponse, categoriesResponse] =
    await Promise.all([
      api.get(`/dashboard/${userId}`),
      api.get(`/expenses/user/${userId}`),
      api.get("/categories"),
    ]);

  return {
    dashboard: unwrapObject(dashboardResponse.data, ["data", "dashboard"]),
    expenses: normalizeExpenses(expensesResponse.data),
    categories: unwrapCollection(categoriesResponse.data, [
      "data",
      "categories",
      "content",
    ]),
  };
}

export async function fetchReportsData(userId, month) {
  const [summaryResponse, categoryResponse, trendResponse] = await Promise.all([
    api.get(`/reports/summary/${userId}?month=${month}`),
    api.get(`/reports/category/${userId}?month=${month}`),
    api.get(`/reports/trend/${userId}`),
  ]);

  return {
    summary: unwrapObject(summaryResponse.data, ["data", "summary"]),
    categoryData: unwrapCollection(categoryResponse.data, [
      "data",
      "categoryData",
      "categories",
      "content",
    ]),
    trendData: unwrapCollection(trendResponse.data, [
      "data",
      "trendData",
      "trend",
      "content",
    ]),
  };
}

export async function fetchBudgetPageData(userId, month) {
  const [budgetsResponse, categoriesResponse] = await Promise.all([
    api.get(`/budgets/user/${userId}?month=${month}`),
    api.get("/categories"),
  ]);

  return {
    budgets: unwrapCollection(budgetsResponse.data, ["data", "budgets", "content"]),
    categories: unwrapCollection(categoriesResponse.data, [
      "data",
      "categories",
      "content",
    ]),
  };
}

export async function createBudget(payload) {
  const response = await api.post("/budgets", payload);
  return response.data;
}

export async function updateBudget(id, payload) {
  const response = await api.put(`/budgets/${id}`, payload);
  return response.data;
}

export async function deleteBudget(id) {
  return api.delete(`/budgets/${id}`);
}

export async function createExpense(payload) {
  const response = await api.post("/expenses", payload);
  return normalizeExpense(response.data);
}

export async function createCategory(payload) {
  const response = await api.post("/categories", payload);
  return response.data;
}

export async function deleteExpense(id) {
  return api.delete(`/expenses/${id}`);
}

export async function updateExpense(id, payload) {
  const response = await api.put(`/expenses/${id}`, payload);
  return normalizeExpense(response.data);
}

export async function getExpenseById(id) {
  const response = await api.get(`/expenses/${id}`);
  return normalizeExpense(response.data);
}

export async function searchExpenses(userId, keyword) {
  const response = await api.get(
    `/expenses/user/${userId}/search?keyword=${keyword}`
  );
  return normalizeExpenses(response.data);
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return response.data;
}

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export default api;
