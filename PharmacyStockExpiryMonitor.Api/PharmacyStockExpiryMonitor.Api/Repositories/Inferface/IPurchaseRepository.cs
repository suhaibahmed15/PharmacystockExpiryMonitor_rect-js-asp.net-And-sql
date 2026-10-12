using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces
{
    public interface IPurchaseRepository
    {
        Task<List<Purchase>> GetAllAsync();

        Task<Purchase?> GetByIdAsync(int id);

        Task<Purchase?> GetByPurchaseNumberAsync(string purchaseNumber);

        Task<List<Purchase>> GetBySupplierIdAsync(int supplierId);

        Task<Purchase> AddAsync(Purchase purchase);

        Task UpdateAsync(Purchase purchase);

        Task DeleteAsync(int id);
    }
}