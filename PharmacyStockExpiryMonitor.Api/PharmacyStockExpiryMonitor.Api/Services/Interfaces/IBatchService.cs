using PharmacyStockExpiryMonitor.Api.DTOs.Batch;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IBatchService
    {
        Task<List<BatchDto>> GetAllAsync();

        Task<BatchDto?> GetByIdAsync(int id);

        Task<List<BatchDto>> GetByMedicineIdAsync(int medicineId);

        Task<BatchDto> CreateAsync(CreateBatchDto dto);

        Task<BatchDto?> UpdateAsync(
            int id,
            UpdateBatchDto dto);

        Task<bool> DeleteAsync(int id);
    }
}