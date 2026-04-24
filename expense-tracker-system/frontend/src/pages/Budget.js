import { useCallback, useEffect, useMemo, useState } from "react";
import "./Budget.css";
import Navbar from "../components/Navbar";
import {
  createBudget,
  deleteBudget,
  fetchBudgetPageData,
  getApiErrorMessage,
  updateBudget,
} from "../services/api";
import {
  buildCategoryMap,
  CATEGORY_COLORS,
  formatCurrency,
  getBadgeLabel,
} from "../utils/expenseUtils";
import { getCurrentUserId } from "../utils/auth";

function getCurrentMonthValue() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

const INITIAL_FORM = {
  categoryId: "",
  monthlyLimit: "",
  month: getCurrentMonthValue(),
};

function formatMonthLabel(value) {
  const [year, month] = String(value || "").split("-");
  if (!year || !month) {
    return "";
  }

  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(new Date(Number(year), Number(month) - 1, 1));
}

function getProgressWidth(spent, monthlyLimit) {
  if (!monthlyLimit || Number(monthlyLimit) <= 0) {
    return 0;
  }

  return Math.min((Number(spent || 0) / Number(monthlyLimit)) * 100, 100);
}

function Budget({ currentPath, onNavigate, authSession, onLogout }) {
  const userId = getCurrentUserId();
  const currentMonthValue = getCurrentMonthValue();
  const [month, setMonth] = useState(getCurrentMonthValue());
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadBudgetPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchBudgetPageData(userId, month);
      setBudgets(data.budgets || []);
      setCategories(data.categories || []);
      setError("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Could not load budgets."));
    } finally {
      setIsLoading(false);
    }
  }, [month, userId]);

  useEffect(() => {
    loadBudgetPage();
  }, [loadBudgetPage]);

  const categoryMap = useMemo(() => buildCategoryMap(categories), [categories]);

  const detailedBudgets = useMemo(
    () =>
      budgets.map((budget) => {
        const spent = Number(budget.spent || 0);
        const monthlyLimit = Number(budget.monthlyLimit || 0);
        const remaining = monthlyLimit - spent;

        return {
          ...budget,
          categoryName:
            budget.category ||
            budget.categoryName ||
            categoryMap[budget.categoryId] ||
            "Uncategorized",
          spent,
          monthlyLimit,
          remaining,
          isOverBudget: Boolean(budget.exceeded) || remaining < 0,
          progressWidth: getProgressWidth(spent, monthlyLimit),
        };
      }),
    [budgets, categoryMap]
  );

  const orderedBudgets = useMemo(
    () =>
      [...detailedBudgets].sort((leftBudget, rightBudget) =>
        String(leftBudget.categoryName).localeCompare(String(rightBudget.categoryName))
      ),
    [detailedBudgets]
  );

  const totalMonthlyBudget = useMemo(
    () =>
      orderedBudgets.reduce(
        (sum, budget) => sum + Number(budget.monthlyLimit || 0),
        0
      ),
    [orderedBudgets]
  );

  const availableCategories = useMemo(() => {
    const usedCategoryIds = new Set(orderedBudgets.map((budget) => String(budget.categoryId)));

    if (modalMode === "edit" && editingBudget?.categoryId) {
      usedCategoryIds.delete(String(editingBudget.categoryId));
    }

    return categories.filter((category) => !usedCategoryIds.has(String(category.id)));
  }, [categories, orderedBudgets, modalMode, editingBudget]);

  function openAddModal() {
    setModalMode("add");
    setEditingBudget(null);
    setFormData({
      categoryId: "",
      monthlyLimit: "",
      month: month >= currentMonthValue ? month : currentMonthValue,
    });
    setSubmitError("");
    setIsModalOpen(true);
  }

  function openEditModal(budget) {
    setModalMode("edit");
    setEditingBudget(budget);
    setFormData({
      categoryId: String(budget.categoryId || ""),
      monthlyLimit: String(budget.monthlyLimit || ""),
      month: budget.month || month,
    });
    setSubmitError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setModalMode("add");
    setEditingBudget(null);
    setFormData(INITIAL_FORM);
    setSubmitError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (modalMode === "add" && !formData.categoryId) {
      setSubmitError("Please choose a category.");
      return;
    }

    if (!formData.month) {
      setSubmitError("Please choose a month.");
      return;
    }

    if (modalMode === "add" && formData.month < currentMonthValue) {
      setSubmitError("Please choose the current month or a future month.");
      return;
    }

    if (formData.monthlyLimit === "" || Number(formData.monthlyLimit) <= 0) {
      setSubmitError("Enter a valid monthly limit.");
      return;
    }

    if (modalMode === "add") {
      const duplicateBudget = budgets.some(
        (budget) =>
          String(budget.categoryId) === String(formData.categoryId) &&
          String(budget.month) === String(formData.month)
      );

      if (duplicateBudget) {
        setSubmitError("Budget already exists for this category and month.");
        return;
      }
    }

    if (modalMode === "edit" && editingBudget) {
      const duplicateBudget = budgets.some(
        (budget) =>
          budget.id !== editingBudget.id &&
          String(budget.categoryId) ===
            String(formData.categoryId || editingBudget.categoryId) &&
          String(budget.month) === String(formData.month)
      );

      if (duplicateBudget) {
        setSubmitError("Another budget already exists for this category and month.");
        return;
      }
    }

    setIsSubmitting(true);
    setSubmitError("");

    const payload = {
      userId,
      categoryId: Number(formData.categoryId || editingBudget?.categoryId),
      monthlyLimit: Number(formData.monthlyLimit),
      month: formData.month,
    };

    try {
      if (modalMode === "edit" && editingBudget) {
        await updateBudget(editingBudget.id, payload);
      } else {
        await createBudget(payload);
      }

      await loadBudgetPage();
      closeModal();
    } catch (requestError) {
      setSubmitError(getApiErrorMessage(requestError, "Could not save budget."));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(budget) {
    if (!window.confirm(`Delete ${budget.categoryName}?`)) {
      return;
    }

    try {
      await deleteBudget(budget.id);
      await loadBudgetPage();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Delete failed."));
    }
  }

  return (
    <div className="app-shell">
      <Navbar
        currentPath={currentPath}
        onNavigate={onNavigate}
        authSession={authSession}
        onLogout={onLogout}
      />

      <main className="dashboard budget-page">
        {error ? <div className="status-banner">{error}</div> : null}

        <section className="budget-header">
          <div>
            <h2 className="budget-title">Budget Management</h2>
            <p className="budget-subtitle">{formatMonthLabel(month)}</p>
          </div>

          <div className="budget-header__actions">
            <label className="field budget-month-field">
              <span>Month</span>
              <input
                type="month"
                value={month}
                min={currentMonthValue}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>

            <button
              className="primary-button"
              type="button"
              onClick={openAddModal}
            >
              + Set Budget
            </button>
          </div>
        </section>

        <section className="panel budget-overview">
          <p className="budget-overview__label">Total Monthly Budget</p>
          <h3 className="budget-overview__amount">{formatCurrency(totalMonthlyBudget)}</h3>
          <p className="budget-overview__meta">
            Across {orderedBudgets.length} {orderedBudgets.length === 1 ? "category" : "categories"}
          </p>
        </section>

        <section className="budget-stack">
          {isLoading ? (
            <div className="loading-state loading-state--large">Loading budgets...</div>
          ) : orderedBudgets.length ? (
            orderedBudgets.map((budget, index) => (
              <article
                className="panel budget-row"
                key={budget.id || `${budget.categoryName}-${index}`}
              >
                <div className="budget-row__top">
                  <div className="budget-row__heading">
                    <div
                      className="budget-row__badge"
                      style={{
                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                      }}
                    >
                      {getBadgeLabel(budget.categoryName)}
                    </div>

                    <div className="budget-row__copy">
                      <h3>{budget.categoryName}</h3>
                      <p>{formatMonthLabel(budget.month || month)}</p>
                    </div>
                  </div>

                  <div className="budget-row__side">
                    <p
                      className={`budget-row__metrics ${
                        budget.isOverBudget ? "budget-row__metrics--danger" : ""
                      }`}
                    >
                      {formatCurrency(budget.spent)} / {formatCurrency(budget.monthlyLimit)}
                    </p>

                    <div className="budget-row__actions">
                      <button
                        className="link-button"
                        type="button"
                        onClick={() => openEditModal(budget)}
                      >
                        Edit
                      </button>
                      <button
                        className="link-button link-button--danger"
                        type="button"
                        onClick={() => handleDelete(budget)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <div className="budget-progress" aria-hidden="true">
                  <span
                    className={`budget-progress__bar ${
                      budget.isOverBudget ? "budget-progress__bar--danger" : ""
                    }`}
                    style={{ width: `${budget.progressWidth}%` }}
                  />
                </div>

                <p
                  className={`budget-row__meta ${
                    budget.isOverBudget ? "budget-row__meta--danger" : ""
                  }`}
                >
                  {budget.isOverBudget
                    ? `${formatCurrency(Math.abs(budget.remaining))} over budget`
                    : `${formatCurrency(budget.remaining)} remaining`}
                </p>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No budgets set for {formatMonthLabel(month)}</h3>
              <p>Add your first category budget to start tracking monthly limits.</p>
            </div>
          )}
        </section>

        <section className="panel budget-tips">
          <h3 className="budget-tips__title">Budget Tips</h3>
          <ul className="budget-tips__list">
            <li>Set realistic budgets based on your spending patterns.</li>
            <li>Monitor categories that frequently exceed their limits.</li>
            <li>Review and adjust budgets monthly for better control.</li>
            <li>Use the Reports page to track spending trends over time.</li>
          </ul>
        </section>
      </main>

      {isModalOpen ? (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <div
            className="modal-card budget-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="budget-modal-title"
          >
            <div className="budget-modal__header">
              <div>
                <p className="panel-kicker">{modalMode === "edit" ? "Update" : "Create"}</p>
                <h2 id="budget-modal-title">
                  {modalMode === "edit" ? "Edit Budget" : "Set Budget"}
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
                  <span>Month</span>
                  <input
                    type="month"
                    value={formData.month}
                    min={currentMonthValue}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        month: event.target.value,
                      }))
                    }
                    required
                    disabled={modalMode === "edit"}
                  />
                </label>

                <label className="field">
                  <span>Category</span>
                  {modalMode === "edit" ? (
                    <input
                      type="text"
                      value={editingBudget?.categoryName || editingBudget?.category || ""}
                      disabled
                    />
                  ) : (
                    <select
                      value={formData.categoryId}
                      onChange={(event) =>
                        setFormData((currentValue) => ({
                          ...currentValue,
                          categoryId: event.target.value,
                        }))
                      }
                      required
                      disabled={!availableCategories.length}
                    >
                      <option value="">
                        {availableCategories.length
                          ? "Select a category"
                          : "No categories left to budget"}
                      </option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={String(category.id)}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </label>

                <label className="field field--full">
                  <span>Monthly Limit</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.monthlyLimit}
                    onChange={(event) =>
                      setFormData((currentValue) => ({
                        ...currentValue,
                        monthlyLimit: event.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    required
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
                  disabled={
                    isSubmitting || (modalMode === "add" && !availableCategories.length)
                  }
                >
                  {isSubmitting
                    ? modalMode === "edit"
                      ? "Updating..."
                      : "Saving..."
                    : modalMode === "edit"
                      ? "Update Budget"
                      : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Budget;
