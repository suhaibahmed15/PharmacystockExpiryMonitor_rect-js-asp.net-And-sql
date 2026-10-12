using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces
{
    public interface IStockTransactionRepository
    {
        Task<List<StockTransaction>> GetAllAsync();

        Task<StockTransaction?> GetByIdAsync(int id);

        Task<List<StockTransaction>> GetByMedicineIdAsync(
            int medicineId);

        Task<List<StockTransaction>> GetByBatchIdAsync(
            int batchId);

        Task<StockTransaction> AddAsync(StockTransaction transaction);
    }
}