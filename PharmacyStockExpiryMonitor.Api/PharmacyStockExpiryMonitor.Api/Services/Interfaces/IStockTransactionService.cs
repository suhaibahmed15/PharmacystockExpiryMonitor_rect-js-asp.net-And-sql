using PharmacyStockExpiryMonitor.Api.DTOs.StockTransaction;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IStockTransactionService
    {
        Task<List<StockTransactionDto>> GetAllAsync();

        Task<StockTransactionDto?> GetByIdAsync(int id);

        Task<StockTransactionDto> CreateAsync(
            CreateStockTransactionDto dto);
    }
}