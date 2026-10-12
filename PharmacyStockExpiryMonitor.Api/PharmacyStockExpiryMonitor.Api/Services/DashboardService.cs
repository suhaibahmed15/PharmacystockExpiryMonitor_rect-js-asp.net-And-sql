using PharmacyStockExpiryMonitor.Api.DTOs.Dashboard;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IDashboardRepository _repository;

        public DashboardService(IDashboardRepository repository)
        {
            _repository = repository;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            var summary = await _repository.GetSummaryAsync();

            return new DashboardSummaryDto
            {
                TotalMedicines = summary.TotalMedicines,
                TotalCategories = summary.TotalCategories,
                TotalSuppliers = summary.TotalSuppliers,
                TotalBatches = summary.TotalBatches,
                LowStockCount = summary.LowStockCount,
                NearExpiryCount = summary.NearExpiryCount,
                ExpiredCount = summary.ExpiredCount,
                UnreadAlertsCount = summary.UnreadAlertsCount,
                TotalPurchaseAmount = summary.TotalPurchaseAmount
            };
        }
    }
}