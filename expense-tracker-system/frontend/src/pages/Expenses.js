import { useCallback, useEffect, useMemo, useState } from "react";
import "./Expenses.css";
import Navbar from "../components/Navbar";
import {
  createCategory,
  createExpense,
  deleteExpense,
  fetchExpensesPageData,
  getApiErrorMessage,
  updateExpense,
} from "../services/api";
import {
  buildCategoryMap,
  CATEGORY_COLORS,
  decorateExpenses,
  formatCurrency,
  formatFullDate,
  getBadgeLabel,
} from "../utils/expenseUtils";
import { getCurrentUserId } from "../utils/auth";

const INITIAL_FORM = {
  title: "",
  description: "",
  amount: "",
  date: "",
  time: "",
  categoryId: "",
};

const EXPENSE_ART_PALETTES = [
  ["#ff5ba7", "#ff7b72", "#ffd4ec"],
  ["#4fd1c5", "#68dcbf", "#d3f7ef"],
  ["#4f7cff", "#7c83fd", "#e3ebff"],
  ["#ffcd4b", "#ff8f5a", "#fff2c6"],
  ["#7bd88f", "#3bc9db", "#d7faf1"],
];

function getExpenseTimestamp(expense) {
  const datePart = expense.date || "1970-01-01";
  const timePart = expense.time || "00:00:00";
  return new Date(`${datePart}T${timePart}`).getTime();
}

function getSeedValue(value) {
  return Array.from(String(value || "")).reduce(
    (sum, char, index) => sum + char.charCodeAt(0) * (index + 1),
    0
  );
}

function normalizeCategoryName(value) {
  return String(value || "").trim().toLowerCase();
}

function sortCategoriesByName(categories) {
  return [...categories].sort((leftCategory, rightCategory) =>
    String(leftCategory.name || "").localeCompare(String(rightCategory.name || ""))
  );
}

function buildExpenseArt(seedValue, badgeLabel) {
  const palette = EXPENSE_ART_PALETTES[seedValue % EXPENSE_ART_PALETTES.length];
  const offset = 24 + (seedValue % 28);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${palette[0]}"/>
          <stop offset="100%" stop-color="${palette[1]}"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="40" fill="url(#g)"/>
      <circle cx="${offset}" cy="36" r="18" fill="${palette[2]}" fill-opacity="0.65"/>
      <circle cx="124" cy="${offset + 8}" r="26" fill="#ffffff" fill-opacity="0.28"/>
      <path d="M24 114c24-28 49-42 76-42 18 0 30 4 36 10v34H24z" fill="#ffffff" fill-opacity="0.18"/>
      <text x="80" y="94" text-anchor="middle" font-size="46" font-family="Arial, sans-serif" font-weight="700" fill="white">${badgeLabel}</text>
    </svg>
  `;

  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function Expenses({ currentPath, onNavigate, authSession, onLogout }) {
  const userId = getCurrentUserId();
  const [dashboard, setDashboard] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySubmitError, setCategorySubmitError] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const loadExpensesPage = useCallback(async () => {
    try {
      const data = await fetchExpensesPageData(userId);
      setDashboard(data.dashboard || {});
      setExpenses(data.expenses || []);
      setCategories(sortCategoriesByName(data.categories || []));
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load expenses."));
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadExpensesPage();
  }, [loadExpensesPage]);

  async function handleDelete(id) {
    try {
      await deleteExpense(id);
      await loadExpensesPage();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Delete failed."));
    }
  }

  function openAddModal() {
    setModalMode("add");
    setEditingExpenseId(null);
    setFormData(INITIAL_FORM);
    setSubmitError("");
    setIsAddingCategory(false);
    setNewCategoryName("");
    setCategorySubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(expense) {
    const fallbackCategoryName = expense.categoryName || "";
    const matchedCategory = expense.categoryId
      ? categories.find(
          (category) => String(category.id) === String(expense.categoryId)
        )
      : categories.find(
          (category) =>
            normalizeCategoryName(category.name) ===
            normalizeCategoryName(fallbackCategoryName)
        );

    setModalMode("edit");
    setEditingExpenseId(expense.id);
    setFormData({
      title: expense.title || "",
      description: expense.description || "",
      amount: String(expense.amount || ""),
      date: expense.date || "",
      time: expense.time ? String(expense.time).slice(0, 5) : "",
      categoryId: matchedCategory ? String(matchedCategory.id) : "",
    });
    setSubmitError("");
    setIsAddingCategory(false);
    setNewCategoryName("");
    setCategorySubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalMode("add");
    setEditingExpenseId(null);
    setFormData(INITIAL_FORM);
    setSubmitError("");
    setIsAddingCategory(false);
    setNewCategoryName("");
    setCategorySubmitError("");
  }

  async function handleCreateCategory() {
    const trimmedName = newCategoryName.trim();

    if (!trimmedName) {
      setCategorySubmitError("Enter a category name.");
      return;
    }

    const existingCategory = categories.find(
      (category) =>
        normalizeCategoryName(category.name) === normalizeCategoryName(trimmedName)
    );

    if (existingCategory) {
      setFormData((currentValue) => ({
        ...currentValue,
        categoryId: String(existingCategory.id),
      }));
      setIsAddingCategory(false);
      setNewCategoryName("");
      setCategorySubmitError("");
      return;
    }

    setIsCreatingCategory(true);
    setCategorySubmitError("");

    try {
      const createdCategory = await createCategory({ name: trimmedName });

      setCategories((currentCategories) =>
        sortCategoriesByName([...currentCategories, createdCategory])
      );
      setFormData((currentValue) => ({
        ...currentValue,
        categoryId: String(createdCategory.id),
      }));
      setIsAddingCategory(false);
      setNewCategoryName("");
      setSubmitError("");
    } catch (requestError) {
      setCategorySubmitError(
        getApiErrorMessage(requestError, "Could not add category.")
      );
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.categoryId) {
      setSubmitError("Please choose a category.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        amount: Number(formData.amount),
        date: formData.date,
        time: formData.time || null,
        categoryId: Number(formData.categoryId),
        userId,
      };

      if (modalMode === "edit" && editingExpenseId) {
        await updateExpense(editingExpenseId, payload);
      } else {
        await createExpense(payload);
      }

      await loadExpensesPage();
      closeModal();
    } catch (requestError) {
      setSubmitError(
        getApiErrorMessage(
          requestError,
          modalMode === "edit"
            ? "Could not update expense."
            : "Could not add expense."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const detailedExpenses = useMemo(
    () => decorateExpenses(expenses, categoryMap),
    [expenses, categoryMap]
  );

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return [...detailedExpenses]
      .filter((expense) => {
        const matchesSearch =
          !normalizedSearch ||
          expense.title?.toLowerCase().includes(normalizedSearch) ||
          expense.description?.toLowerCase().includes(normalizedSearch) ||
          expense.categoryName?.toLowerCase().includes(normalizedSearch);

        const matchesCategory =
          selectedCategoryId === "all" ||
          String(expense.categoryId) === selectedCategoryId;

        return matchesSearch && matchesCategory;
      })
      .sort((leftExpense, rightExpense) => {
        if (sortBy === "oldest") {
          return getExpenseTimestamp(leftExpense) - getExpenseTimestamp(rightExpense);
        }

        if (sortBy === "highest") {
          return Number(rightExpense.amount || 0) - Number(leftExpense.amount || 0);
        }

        if (sortBy === "lowest") {
          return Number(leftExpense.amount || 0) - Number(rightExpense.amount || 0);
        }

        return getExpenseTimestamp(rightExpense) - getExpenseTimestamp(leftExpense);
      });
  }, [detailedExpenses, searchTerm, selectedCategoryId, sortBy]);

  const summary = useMemo(() => {
    const total = filteredExpenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );
    const count = filteredExpenses.length;

    return {
      total,
      count,
      average: count ? total / count : 0,
    };
  }, [filteredExpenses]);

  return (
    <div className="app-shell">
      <Navbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        authSession={authSession}
        onLogout={onLogout}
      />

      <main className="dashboard expenses-page">
        {error ? <div className="status-banner">{error}</div> : null}

        <section className="expenses-header">
          <div>
            <h2 className="expenses-title">Expenses</h2>
            <p className="expenses-subtitle">
              {summary.count || dashboard.totalCount || 0} transactions
            </p>
          </div>

          <button
            className="primary-button"
            type="button"
            onClick={openAddModal}
          >
            + Add Expense
          </button>
        </section>

        <section className="panel filters-panel">
          <div className="filters-grid">
            <label className="field">
              <span>Search</span>
              <input
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </label>

            <label className="field">
              <span>Category</span>
              <select
                value={selectedCategoryId}
                onChange={(event) => setSelectedCategoryId(event.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Sort By</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </label>
          </div>
        </section>

        <section className="expense-summary-strip">
          <div className="summary-metric">
            <span>Total</span>
            <strong>
              {formatCurrency(
                summary.count ? summary.total : dashboard.totalAmount || 0
              )}
            </strong>
          </div>

          <div className="summary-metric">
            <span>Count</span>
            <strong>{summary.count || dashboard.totalCount || 0}</strong>
          </div>

          <div className="summary-metric">
            <span>Average</span>
            <strong>{formatCurrency(summary.average)}</strong>
          </div>
        </section>

        <section className="expenses-stack">
          {isLoading ? (
            <div className="loading-state loading-state--large">
              Loading expenses...
            </div>
          ) : filteredExpenses.length ? (
            filteredExpenses.map((expense, index) => {
              const badgeLabel = getBadgeLabel(
                expense.categoryName || "Expense"
              ).slice(0, 1);
              const seedValue = getSeedValue(
                `${expense.id || ""}-${expense.categoryName || ""}-${expense.title || ""}-${index}`
              );
              const artImage = buildExpenseArt(seedValue, badgeLabel);

              return (
                <article
                  className={`expense-card ${
                    index === 0 ? "expense-card--featured" : ""
                  }`}
                  key={expense.id || `${expense.title}-${index}`}
                >
                  <div className="expense-card__content">
                    <div
                      className="expense-card__art"
                      aria-hidden="true"
                      style={{
                        backgroundImage: artImage,
                        boxShadow: `0 16px 28px ${
                          CATEGORY_COLORS[seedValue % CATEGORY_COLORS.length]
                        }33`,
                      }}
                    />

                    <div className="expense-card__meta">
                      <h3>{expense.categoryName}</h3>
                      <p className="expense-card__title">
                        {expense.title || "Untitled expense"}
                      </p>
                      <span>{formatFullDate(expense.date)}</span>
                      {expense.description ? (
                        <small>{expense.description}</small>
                      ) : null}
                    </div>
                  </div>

                  <div className="expense-card__side">
                    <strong>{formatCurrency(expense.amount)}</strong>
                    <div className="expense-card__actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => openEditModal(expense)}
                      >
                        Edit
                      </button>
                      <button
                        className="link-button link-button--danger"
                        type="button"
                        onClick={() => handleDelete(expense.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="empty-state">
              <h3>No matching expenses</h3>
              <p>Try clearing the search or selecting a different category.</p>
            </div>
          )}
        </section>
      </main>

      {isModalOpen ? (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="modal-card"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="expense-modal-title"
          >
            <div className="panel-header">
              <div>
                <p className="panel-kicker">
                  {modalMode === "edit" ? "Update" : "Create"}
                </p>
                <h2 id="expense-modal-title">
                  {modalMode === "edit" ? "Edit Expense" : "Add Expense"}
                </h2>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                x
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-grid">
                <label className="field">
                  <span>Title</span>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        title: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        amount: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span>Category</span>
                  <div className="expense-category-field">
                    <select
                      value={formData.categoryId}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          categoryId: event.target.value,
                        }))
                      }
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>

                    <button
                      className="link-button expense-category-link"
                      type="button"
                      onClick={() => {
                        setIsAddingCategory((currentValue) => !currentValue);
                        setCategorySubmitError("");
                        setNewCategoryName("");
                      }}
                    >
                      {isAddingCategory ? "Cancel new category" : "+ Add new category"}
                    </button>

                    {isAddingCategory ? (
                      <div className="expense-category-create">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(event) => setNewCategoryName(event.target.value)}
                          placeholder="New category name"
                          disabled={isCreatingCategory}
                        />
                        <button
                          className="secondary-button expense-category-create-button"
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={isCreatingCategory}
                        >
                          {isCreatingCategory ? "Adding..." : "Save Category"}
                        </button>
                      </div>
                    ) : null}

                    {categorySubmitError ? (
                      <p className="expense-category-error">{categorySubmitError}</p>
                    ) : null}
                  </div>
                </label>

                <label className="field">
                  <span>Date</span>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        date: event.target.value,
                      }))
                    }
                    required
                  />
                </label>

                <label className="field">
                  <span>Time</span>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        time: event.target.value,
                      }))
                    }
                  />
                </label>

                <label className="field field--full">
                  <span>Description</span>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        description: event.target.value,
                      }))
                    }
                  />
                </label>
              </div>

              {submitError ? <p className="form-error">{submitError}</p> : null}

              <div className="modal-actions">
                <button
                  className="secondary-button"
                  type="button"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="primary-button"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? modalMode === "edit"
                      ? "Updating..."
                      : "Saving..."
                    : modalMode === "edit"
                      ? "Update Expense"
                      : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Expenses;
