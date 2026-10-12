using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ApplicationDbContext _context;

    public CategoryRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Category>> GetAllAsync(
        int page,
        int pageSize,
        string? search,
        bool? isActive,
        string? sortBy,
        string? sortDirection)
    {
        var query = _context.Categories
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                (x.Description != null &&
                 x.Description.Contains(search)));
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
                "description" =>
                    query.OrderByDescending(x => x.Description),

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
                "description" =>
                    query.OrderBy(x => x.Description),

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
        var query = _context.Categories
            .Where(x => !x.IsDeleted)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(search))
        {
            search = search.Trim();

            query = query.Where(x =>
                x.Name.Contains(search) ||
                (x.Description != null &&
                 x.Description.Contains(search)));
        }

        // Filter
        if (isActive.HasValue)
        {
            query = query.Where(x =>
                x.IsActive == isActive.Value);
        }

        return await query.CountAsync();
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(x =>
                x.Id == id &&
                !x.IsDeleted);
    }

    public async Task<Category?> GetByNameAsync(
        string name)
    {
        return await _context.Categories
            .FirstOrDefaultAsync(x =>
                x.Name == name &&
                !x.IsDeleted);
    }

    public async Task<Category> AddAsync(
        Category category)
    {
        await _context.Categories.AddAsync(category);
        await _context.SaveChangesAsync();

        return category;
    }

    public async Task UpdateAsync(
        Category category)
    {
        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(
        Category category)
    {
        category.IsDeleted = true;
        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;

        _context.Categories.Update(category);

        await _context.SaveChangesAsync();
    }
}