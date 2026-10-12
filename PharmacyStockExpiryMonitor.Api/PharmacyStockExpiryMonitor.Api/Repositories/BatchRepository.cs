using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories;

public class BatchRepository : IBatchRepository
{
    private readonly ApplicationDbContext _context;

    public BatchRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Batch>> GetAllAsync()
    {
        return await _context.Batches
            .Include(x => x.Medicine)
            .Where(x => !x.IsDeleted)
            .OrderBy(x => x.ExpiryDate)
            .ToListAsync();
    }

    public async Task<List<Batch>> GetByMedicineIdAsync(
        int medicineId)
    {
        return await _context.Batches
            .Include(x => x.Medicine)
            .Where(x =>
                x.MedicineId == medicineId &&
                !x.IsDeleted)
            .OrderBy(x => x.ExpiryDate)
            .ToListAsync();
    }

    public async Task<Batch?> GetByIdAsync(int id)
    {
        return await _context.Batches
            .Include(x => x.Medicine)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                !x.IsDeleted);
    }

    public async Task<Batch?> GetByBatchNumberAsync(
        int medicineId,
        string batchNumber)
    {
        return await _context.Batches
            .FirstOrDefaultAsync(x =>
                x.MedicineId == medicineId &&
                x.BatchNumber == batchNumber &&
                !x.IsDeleted);
    }

    public async Task<Batch> AddAsync(Batch batch)
    {
        await _context.Batches.AddAsync(batch);
        await _context.SaveChangesAsync();

        return batch;
    }

    public async Task UpdateAsync(Batch batch)
    {
        _context.Batches.Update(batch);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Batch batch)
    {
        batch.IsDeleted = true;
        batch.UpdatedAt = DateTime.UtcNow;

        _context.Batches.Update(batch);

        await _context.SaveChangesAsync();
    }
}