using PharmacyStockExpiryMonitor.Api.DTOs.Medicine;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IMedicineService
    {
        Task<(List<MedicineDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            int? categoryId,
            bool? isActive,
            string? sortBy,
            string? sortDirection);

        Task<MedicineDto?> GetByIdAsync(int id);

        Task<MedicineDto> CreateAsync(CreateMedicineDto dto);

        Task<MedicineDto?> UpdateAsync(
            int id,
            UpdateMedicineDto dto);

        Task<bool> DeleteAsync(int id);
    }
}