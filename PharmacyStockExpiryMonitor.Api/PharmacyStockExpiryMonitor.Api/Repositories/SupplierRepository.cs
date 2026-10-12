using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories;

public class SupplierRepository : ISupplierRepository
{
    private readonly ApplicationDbContext _context;

    public SupplierRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Supplier>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        string? sortBy,
        string? sortDirection)
    {
        var query = _context.Suppliers
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                (x.ContactPerson != null &&
                 x.ContactPerson.Contains(search)) ||
                (x.Phone != null &&
                 x.Phone.Contains(search)) ||
                (x.Email != null &&
                 x.Email.Contains(search)) ||
                (x.Address != null &&
                 x.Address.Contains(search)));
        }

        // Filter
        if (isActive.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == isActive.Value);
        }

        // Sorting
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
                "contactperson" =>
                    query.OrderByDescending(x => x.ContactPerson),

                "phone" =>
                    query.OrderByDescending(x => x.Phone),

                "email" =>
                    query.OrderByDescending(x => x.Email),

                "address" =>
                    query.OrderByDescending(x => x.Address),

                "isactive" =>
                    query.OrderByDescending(x => x.IsActive),

                _ =>
                    query.OrderByDescending(x => x.Name)
            };
        }
        else
        {
            query = sortBy switch
            {
                "contactperson" =>
                    query.OrderBy(x => x.ContactPerson),

                "phone" =>
                    query.OrderBy(x => x.Phone),

                "email" =>
                    query.OrderBy(x => x.Email),

                "address" =>
                    query.OrderBy(x => x.Address),

                "isactive" =>
                    query.OrderBy(x => x.IsActive),

                _ =>
                    query.OrderBy(x => x.Name)
            };
        }

        return await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> GetCountAsync(
        string? search,
        bool? isActive)
    {
        var query = _context.Suppliers
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                (x.ContactPerson != null &&
                 x.ContactPerson.Contains(search)) ||
                (x.Phone != null &&
                 x.Phone.Contains(search)) ||
                (x.Email != null &&
                 x.Email.Contains(search)) ||
                (x.Address != null &&
                 x.Address.Contains(search)));
        }

        // Filter
        if (isActive.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == isActive.Value);
        }

        return await query.CountAsync();
    }

    public async Task<Supplier?> GetByIdAsync(int id)
    {
        return await _context.Suppliers
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                !x.IsDeleted);
    }

    public async Task<Supplier?> GetByNameAsync(string name)
    {
        return await _context.Suppliers
            .FirstOrDefaultAsync(x =>
                x.Name == name &&
                !x.IsDeleted);
    }

    public async Task<Supplier> AddAsync(
        Supplier supplier)
    {
        await _context.Suppliers.AddAsync(supplier);
        await _context.SaveChangesAsync();

        return supplier;
    }

    public async Task UpdateAsync(
        Supplier supplier)
    {
        _context.Suppliers.Update(supplier);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Supplier supplier)
    {
        supplier.IsDeleted = true;
        supplier.IsActive = false;
        supplier.UpdatedAt = DateTime.UtcNow;

        _context.Suppliers.Update(supplier);

        await _context.SaveChangesAsync();
    }
}