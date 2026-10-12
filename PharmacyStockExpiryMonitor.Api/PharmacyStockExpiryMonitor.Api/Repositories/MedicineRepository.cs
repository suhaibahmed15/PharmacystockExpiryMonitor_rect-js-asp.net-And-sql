using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories;

public class MedicineRepository : IMedicineRepository
{
    private readonly ApplicationDbContext _context;

    public MedicineRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Medicine>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        int? categoryId,
        bool? isActive,
        string? sortBy,
        string? sortDirection)
    {
        var query = _context.Medicines
            .Include(x => x.Category)
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // SEARCH
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.MedicineCode.Contains(search) ||
                (x.GenericName != null &&
                 x.GenericName.Contains(search)));
        }

        // FILTER BY CATEGORY
        if (categoryId.HasValue)
        {
            query = query.Where(x =>
                x.CategoryId == categoryId.Value);
        }

        // FILTER BY ACTIVE STATUS
        if (isActive.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == isActive.Value);
        }

        // SORTING
        var descending =
            string.Equals(
                sortDirection,
                "desc",
                StringComparison.OrdinalIgnoreCase);

        sortBy = sortBy?.Trim().ToLower();

        if (descending)
        {
            query = sortBy switch
            {
                "medicinecode" =>
                    query.OrderByDescending(x => x.MedicineCode),

                "genericname" =>
                    query.OrderByDescending(x => x.GenericName),

                "reorderlevel" =>
                    query.OrderByDescending(x => x.ReorderLevel),

                "currentstock" =>
                    query.OrderByDescending(
                        x => x.Batches
                            .Where(b => !b.IsDeleted)
                            .Sum(b => b.RemainingQuantity)),

                _ =>
                    query.OrderByDescending(x => x.Name)
            };
        }
        else
        {
            query = sortBy switch
            {
                "medicinecode" =>
                    query.OrderBy(x => x.MedicineCode),

                "genericname" =>
                    query.OrderBy(x => x.GenericName),

                "reorderlevel" =>
                    query.OrderBy(x => x.ReorderLevel),

                "currentstock" =>
                    query.OrderBy(
                        x => x.Batches
                            .Where(b => !b.IsDeleted)
                            .Sum(b => b.RemainingQuantity)),

                _ =>
                    query.OrderBy(x => x.Name)
            };
        }

        // SERVER-SIDE PAGINATION
        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountAsync(
        string? search,
        int? categoryId,
        bool? isActive)
    {
        var query = _context.Medicines
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // SEARCH
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                x.MedicineCode.Contains(search) ||
                (x.GenericName != null &&
                 x.GenericName.Contains(search)));
        }

        // FILTER BY CATEGORY
        if (categoryId.HasValue)
        {
            query = query.Where(x =>
                x.CategoryId == categoryId.Value);
        }

        // FILTER BY ACTIVE STATUS
        if (isActive.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == isActive.Value);
        }

        return await query.CountAsync();
    }

    public async Task<Medicine?> GetByIdAsync(int id)
    {
        return await _context.Medicines
            .Include(x => x.Category)
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                !x.IsDeleted);
    }

    public async Task<Medicine?> GetByCodeAsync(
        string medicineCode)
    {
        return await _context.Medicines
            .FirstOrDefaultAsync(x =>
                x.MedicineCode == medicineCode &&
                !x.IsDeleted);
    }

    public async Task<Medicine?> GetByCodeAsync(
        string medicineCode,
        int excludeId)
    {
        return await _context.Medicines
            .FirstOrDefaultAsync(x =>
                x.MedicineCode == medicineCode &&
                x.Id != excludeId &&
                !x.IsDeleted);
    }

    public async Task<Medicine> AddAsync(
        Medicine medicine)
    {
        await _context.Medicines.AddAsync(medicine);
        await _context.SaveChangesAsync();

        return medicine;
    }

    public async Task UpdateAsync(
        Medicine medicine)
    {
        _context.Medicines.Update(medicine);

        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Medicine medicine)
    {
        medicine.IsDeleted = true;
        medicine.IsActive = false;
        medicine.UpdatedAt = DateTime.UtcNow;

        _context.Medicines.Update(medicine);

        await _context.SaveChangesAsync();
    }
}