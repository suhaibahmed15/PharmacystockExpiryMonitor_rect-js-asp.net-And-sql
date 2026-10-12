using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces
{
    public interface IIntelligenceRepository
    {
        Task<List<PredictionResult>> GetAllAsync();

        Task<PredictionResult?> GetByIdAsync(int id);

        Task<PredictionResult> AddAsync(
            PredictionResult prediction);

        Task<Medicine?> GetMedicineAsync(
            int medicineId);

        Task<Batch?> GetBatchAsync(
            int batchId);

        Task<List<StockTransaction>> GetStockTransactionsAsync(
            int medicineId);
    }
}