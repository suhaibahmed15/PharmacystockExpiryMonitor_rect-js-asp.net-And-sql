    
using PharmacyStockExpiryMonitor.Api.DTOs.Category;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ICategoryRepository _repository;
        private readonly IAuditLogService _auditLogService;

        public CategoryService(
            ICategoryRepository repository,
            IAuditLogService auditLogService)
        {
            _repository = repository;
            _auditLogService = auditLogService;
        }

        public async Task<(List<CategoryDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            string? sortBy,
            string? sortDirection)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var categories = await _repository.GetAllAsync(
                page,
                pageSize,
                search,
                isActive,
                sortBy,
                sortDirection);

            var totalCount = await _repository.GetCountAsync(
                search,
                isActive);

            var items = categories.Select(category => new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            }).ToList();

            return (items, totalCount);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
                return null;

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        public async Task<CategoryDto> CreateAsync(
            CreateCategoryDto dto)
        {
            var categoryName = dto.Name.Trim();

            var existingCategory =
                await _repository.GetByNameAsync(categoryName);

            if (existingCategory != null)
            {
                throw new InvalidOperationException(
                    "Category already exists.");
            }

            var category = new Category
            {
                Name = categoryName,
                Description = dto.Description?.Trim(),
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var createdCategory =
                await _repository.AddAsync(category);

            await _auditLogService.LogJsonAsync(
                "CREATE",
                "Category",
                createdCategory.Id.ToString(),
                null,
                new
                {
                    createdCategory.Id,
                    createdCategory.Name,
                    createdCategory.Description,
                    createdCategory.IsActive
                });

            return new CategoryDto
            {
                Id = createdCategory.Id,
                Name = createdCategory.Name,
                Description = createdCategory.Description,
                IsActive = createdCategory.IsActive
            };
        }

        public async Task<CategoryDto?> UpdateAsync(
            int id,
            UpdateCategoryDto dto)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
                return null;

            var categoryName = dto.Name.Trim();

            var existingCategory =
                await _repository.GetByNameAsync(categoryName);

            if (existingCategory != null &&
                existingCategory.Id != id)
            {
                throw new InvalidOperationException(
                    "Category already exists.");
            }

            var oldValues = new
            {
                category.Id,
                category.Name,
                category.Description,
                category.IsActive
            };

            category.Name = categoryName;
            category.Description = dto.Description?.Trim();
            category.IsActive = dto.IsActive;
            category.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(category);

            await _auditLogService.LogJsonAsync(
                "UPDATE",
                "Category",
                category.Id.ToString(),
                oldValues,
                new
                {
                    category.Id,
                    category.Name,
                    category.Description,
                    category.IsActive
                });

            return new CategoryDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                IsActive = category.IsActive
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var category = await _repository.GetByIdAsync(id);

            if (category == null)
                return false;

            var oldValues = new
            {
                category.Id,
                category.Name,
                category.Description,
                category.IsActive,
                category.IsDeleted
            };

            category.IsDeleted = true;
            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(category);

            await _auditLogService.LogJsonAsync(
                "DELETE",
                "Category",
                category.Id.ToString(),
                oldValues,
                new
                {
                    category.Id,
                    category.Name,
                    category.Description,
                    category.IsActive,
                    category.IsDeleted
                });

            return true;
        }
    }
}

