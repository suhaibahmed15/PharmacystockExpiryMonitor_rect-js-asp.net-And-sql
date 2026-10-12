using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

public interface IMedicineRepository
{
    Task<List<Medicine>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        int? categoryId,
        bool? isActive,
        string? sortBy,
        string? sortDirection);

    Task<int> GetCountAsync(
        string? search,
        int? categoryId,
        bool? isActive);

    Task<Medicine?> GetByIdAsync(int id);

    Task<Medicine?> GetByCodeAsync(string medicineCode);

    Task<Medicine?> GetByCodeAsync(
        string medicineCode,
        int excludeId);

    Task<Medicine> AddAsync(Medicine medicine);

    Task UpdateAsync(Medicine medicine);

    Task DeleteAsync(Medicine medicine);
}