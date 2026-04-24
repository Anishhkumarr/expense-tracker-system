package expense_tracker_backend.controller;

import expense_tracker_backend.dto.CategoryRequestDTO;
import expense_tracker_backend.model.Category;
import expense_tracker_backend.service.CategoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@CrossOrigin
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // ✅ GET ALL (GLOBAL CATEGORIES)
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        List<Category> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    // ✅ CREATE CATEGORY
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequestDTO request) {

        try {
            Category category = categoryService.createCategory(request.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(category);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}