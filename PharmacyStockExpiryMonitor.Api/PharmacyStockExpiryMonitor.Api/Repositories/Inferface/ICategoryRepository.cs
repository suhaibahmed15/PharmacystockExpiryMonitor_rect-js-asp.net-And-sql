using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        string? sortBy,
        string? sortDirection);

    Task<int> GetCountAsync(
        string? search,
        bool? isActive);

    Task<Category?> GetByIdAsync(int id);

    Task<Category?> GetByNameAsync(string name);

    Task<Category> AddAsync(Category category);

    Task UpdateAsync(Category category);

    Task DeleteAsync(Category category);
}