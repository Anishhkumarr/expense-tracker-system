package expense_tracker_backend.service;

import expense_tracker_backend.model.Category;
import expense_tracker_backend.repository.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private CategoryService categoryService;

    @Test
    void getAllCategoriesReturnsSortedRepositoryValues() {
        when(categoryRepository.findAllByOrderByNameAsc()).thenReturn(
                List.of(new Category(1L, "Bills"), new Category(2L, "Food"))
        );

        List<Category> result = categoryService.getAllCategories();

        assertEquals(2, result.size());
        assertEquals("Bills", result.get(0).getName());
        verify(categoryRepository).findAllByOrderByNameAsc();
    }

    @Test
    void createCategoryTrimsAndPersistsName() {
        when(categoryRepository.existsByNameIgnoreCase("Travel")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(8L);
            return category;
        });

        Category result = categoryService.createCategory("  Travel  ");

        assertEquals(8L, result.getId());
        assertEquals("Travel", result.getName());
        verify(categoryRepository).existsByNameIgnoreCase("Travel");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createCategoryRejectsBlankNames() {
        IllegalArgumentException error = assertThrows(
                IllegalArgumentException.class,
                () -> categoryService.createCategory("   ")
        );

        assertEquals("Category name is required.", error.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void createCategoryRejectsDuplicates() {
        when(categoryRepository.existsByNameIgnoreCase("Food")).thenReturn(true);

        IllegalStateException error = assertThrows(
                IllegalStateException.class,
                () -> categoryService.createCategory("Food")
        );

        assertEquals("Category already exists.", error.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }
}
