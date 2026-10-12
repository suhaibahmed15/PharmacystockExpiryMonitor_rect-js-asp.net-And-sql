using PharmacyStockExpiryMonitor.Api.DTOs.Purchase;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IPurchaseService
    {
        Task<List<PurchaseDto>> GetAllAsync();

        Task<PurchaseDto?> GetByIdAsync(int id);

        Task<PurchaseDto?> GetByPurchaseNumberAsync(
            string purchaseNumber);

        Task<PurchaseDto> CreateAsync(
            CreatePurchaseDto dto);

        Task<bool> DeleteAsync(int id);
    }
}