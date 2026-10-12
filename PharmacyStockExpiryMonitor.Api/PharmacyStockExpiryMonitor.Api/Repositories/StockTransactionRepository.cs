using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories
{
    public class StockTransactionRepository
        : IStockTransactionRepository
    {
        private readonly ApplicationDbContext _context;

        public StockTransactionRepository(
            ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<StockTransaction>> GetAllAsync()
        {
            return await _context.StockTransactions
                .Include(t => t.Medicine)
                .Include(t => t.Batch)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<StockTransaction?> GetByIdAsync(int id)
        {
            return await _context.StockTransactions
                .Include(t => t.Medicine)
                .Include(t => t.Batch)
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<List<StockTransaction>> GetByMedicineIdAsync(
            int medicineId)
        {
            return await _context.StockTransactions
                .Include(t => t.Medicine)
                .Include(t => t.Batch)
                .Where(t => t.MedicineId == medicineId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<StockTransaction>> GetByBatchIdAsync(
            int batchId)
        {
            return await _context.StockTransactions
                .Include(t => t.Medicine)
                .Include(t => t.Batch)
                .Where(t => t.BatchId == batchId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<StockTransaction> AddAsync(
            StockTransaction transaction)
        {
            await _context.StockTransactions
                .AddAsync(transaction);

            await _context.SaveChangesAsync();

            return transaction;
        }
    }
}