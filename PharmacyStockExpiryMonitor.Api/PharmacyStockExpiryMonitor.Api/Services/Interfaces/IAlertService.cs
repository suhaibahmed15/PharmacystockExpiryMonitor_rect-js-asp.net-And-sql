using PharmacyStockExpiryMonitor.Api.DTOs.Alert;
using PharmacyStockExpiryMonitor.Api.Enums;

namespace PharmacyStockExpiryMonitor.Api.Services.Interfaces
{
    public interface IAlertService
    {
        Task<List<AlertDto>> GetAllAsync();

        Task<AlertDto?> GetByIdAsync(int id);

        Task<AlertDto> CreateAsync(
            int medicineId,
            int? batchId,
            AlertType alertType,
            string message);

        Task<bool> MarkAsReadAsync(int id);

        Task<bool> ResolveAsync(int id);
    }
}