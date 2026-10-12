using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories
{
    public class IntelligenceRepository
        : IIntelligenceRepository
    {
        private readonly ApplicationDbContext _context;

        public IntelligenceRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<PredictionResult>> GetAllAsync()
        {
            return await _context.PredictionResults
                .Include(x => x.Medicine)
                .Include(x => x.Batch)
                .OrderByDescending(x => x.PredictedAt)
                .ToListAsync();
        }

        public async Task<PredictionResult?> GetByIdAsync(
            int id)
        {
            return await _context.PredictionResults
                .Include(x => x.Medicine)
                .Include(x => x.Batch)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<PredictionResult> AddAsync(
            PredictionResult prediction)
        {
            await _context.PredictionResults.AddAsync(
                prediction);

            await _context.SaveChangesAsync();

            return prediction;
        }

        public async Task<Medicine?> GetMedicineAsync(
            int medicineId)
        {
            return await _context.Medicines
                .Include(x => x.Batches)
                .FirstOrDefaultAsync(
                    x => x.Id == medicineId &&
                         !x.IsDeleted);
        }

        public async Task<Batch?> GetBatchAsync(
            int batchId)
        {
            return await _context.Batches
                .FirstOrDefaultAsync(
                    x => x.Id == batchId);
        }

        public async Task<List<StockTransaction>>
            GetStockTransactionsAsync(
                int medicineId)
        {
            return await _context.StockTransactions
                .Where(x => x.MedicineId == medicineId)
                .OrderBy(x => x.CreatedAt)
                .ToListAsync();
        }
    }
}