using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Repositories.Interfaces
{
    public interface IAlertRepository
    {
        Task<List<Alert>> GetAllAsync();

        Task<List<Alert>> GetActiveAsync();

        Task<List<Alert>> GetUnreadAsync();

        Task<Alert?> GetByIdAsync(int id);

        Task<List<Alert>> GetByMedicineIdAsync(
            int medicineId);

        Task<Alert> AddAsync(Alert alert);

        Task UpdateAsync(Alert alert);
    }
}