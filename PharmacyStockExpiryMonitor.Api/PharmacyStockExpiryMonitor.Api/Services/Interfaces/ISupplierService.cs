using PharmacyStockExpiryMonitor.Api.DTOs.Supplier;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface ISupplierService
    {
        Task<(List<SupplierDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            bool? isActive,
            string? sortBy,
            string? sortDirection);

        Task<SupplierDto?> GetByIdAsync(int id);

        Task<SupplierDto> CreateAsync(
            CreateSupplierDto dto);

        Task<SupplierDto?> UpdateAsync(
            int id,
            UpdateSupplierDto dto);

        Task<bool> DeleteAsync(int id);
    }
}