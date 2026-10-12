using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories
{
    public class PurchaseRepository : IPurchaseRepository
    {
        private readonly ApplicationDbContext _context;

        public PurchaseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Purchase>> GetAllAsync()
        {
            return await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Medicine)
                .Where(p => !p.IsDeleted)
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();
        }

        public async Task<Purchase?> GetByIdAsync(int id)
        {
            return await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Medicine)
                .FirstOrDefaultAsync(p =>
                    p.Id == id &&
                    !p.IsDeleted);
        }

        public async Task<Purchase?> GetByPurchaseNumberAsync(
            string purchaseNumber)
        {
            return await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Medicine)
                .FirstOrDefaultAsync(p =>
                    p.PurchaseNumber == purchaseNumber &&
                    !p.IsDeleted);
        }

        public async Task<List<Purchase>> GetBySupplierIdAsync(
            int supplierId)
        {
            return await _context.Purchases
                .Include(p => p.Supplier)
                .Include(p => p.PurchaseItems)
                    .ThenInclude(pi => pi.Medicine)
                .Where(p =>
                    p.SupplierId == supplierId &&
                    !p.IsDeleted)
                .OrderByDescending(p => p.PurchaseDate)
                .ToListAsync();
        }

        public async Task<Purchase> AddAsync(Purchase purchase)
        {
            await _context.Purchases.AddAsync(purchase);
            await _context.SaveChangesAsync();

            return purchase;
        }

        public async Task UpdateAsync(Purchase purchase)
        {
            _context.Purchases.Update(purchase);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var purchase = await _context.Purchases
                .FirstOrDefaultAsync(p => p.Id == id);

            if (purchase == null)
                return;

            purchase.IsDeleted = true;
            purchase.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}