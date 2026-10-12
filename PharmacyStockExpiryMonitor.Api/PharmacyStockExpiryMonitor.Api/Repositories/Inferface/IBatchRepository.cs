using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

public interface IBatchRepository
{
    Task<List<Batch>> GetAllAsync();

    Task<List<Batch>> GetByMedicineIdAsync(int medicineId);

    Task<Batch?> GetByIdAsync(int id);

    Task<Batch?> GetByBatchNumberAsync(
        int medicineId,
        string batchNumber);

    Task<Batch> AddAsync(Batch batch);

    Task UpdateAsync(Batch batch);

    Task DeleteAsync(Batch batch);
}