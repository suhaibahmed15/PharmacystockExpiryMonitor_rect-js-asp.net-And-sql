using PharmacyStockExpiryMonitor.Api.DTOs.Category;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface ICategoryService
    {
        Task<(List<CategoryDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            string? sortBy,
            string? sortDirection);

        Task<CategoryDto?> GetByIdAsync(int id);

        Task<CategoryDto> CreateAsync(
            CreateCategoryDto dto);

        Task<CategoryDto?> UpdateAsync(
            int id,
            UpdateCategoryDto dto);

        Task<bool> DeleteAsync(int id);
    }
}