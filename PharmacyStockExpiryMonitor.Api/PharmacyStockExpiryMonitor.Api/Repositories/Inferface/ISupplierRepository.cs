using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

public interface ISupplierRepository
{
    Task<List<Supplier>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        string? sortBy,
        string? sortDirection);

    Task<int> GetCountAsync(
        string? search,
        bool? isActive);

    Task<Supplier?> GetByIdAsync(int id);

    Task<Supplier?> GetByNameAsync(string name);

    Task<Supplier> AddAsync(Supplier supplier);

    Task UpdateAsync(Supplier supplier);

    Task DeleteAsync(Supplier supplier);
}