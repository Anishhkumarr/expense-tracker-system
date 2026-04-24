package expense_tracker_backend.service;

import expense_tracker_backend.model.Category;
import expense_tracker_backend.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    public Category createCategory(String rawName) {
        String normalizedName = rawName == null ? "" : rawName.trim();

        if (normalizedName.isEmpty()) {
            throw new IllegalArgumentException("Category name is required.");
        }

        if (categoryRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new IllegalStateException("Category already exists.");
        }

        Category category = new Category();
        category.setName(normalizedName);
        return categoryRepository.save(category);
    }
}
