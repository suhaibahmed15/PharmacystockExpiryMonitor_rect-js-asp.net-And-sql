using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.DTOs.Dashboard;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly ApplicationDbContext _context;

        public DashboardRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<int> GetTotalMedicinesAsync()
        {
            return await _context.Medicines
                .CountAsync(m => !m.IsDeleted);
        }

        public async Task<int> GetTotalCategoriesAsync()
        {
            return await _context.Categories
                .CountAsync(c => !c.IsDeleted);
        }

        public async Task<int> GetTotalSuppliersAsync()
        {
            return await _context.Suppliers
                .CountAsync(s => !s.IsDeleted);
        }

        public async Task<int> GetTotalBatchesAsync()
        {
            return await _context.Batches
                .CountAsync(b => !b.IsDeleted);
        }

        public async Task<int> GetLowStockCountAsync()
        {
            return await _context.Medicines
                .Where(m => !m.IsDeleted)
                .CountAsync(m =>
                    m.Batches.Sum(
                        b => b.RemainingQuantity)
                    <= m.ReorderLevel);
        }

        public async Task<int> GetNearExpiryCountAsync()
        {
            var today = DateTime.UtcNow.Date;
            var expiryDate = today.AddDays(30);

            return await _context.Batches
                .CountAsync(b =>
                    !b.IsDeleted &&
                    b.RemainingQuantity > 0 &&
                    b.ExpiryDate >= today &&
                    b.ExpiryDate <= expiryDate);
        }

        public async Task<int> GetExpiredCountAsync()
        {
            var today = DateTime.UtcNow.Date;

            return await _context.Batches
                .CountAsync(b =>
                    !b.IsDeleted &&
                    b.ExpiryDate < today &&
                    b.RemainingQuantity > 0);
        }

        public async Task<int> GetUnreadAlertsCountAsync()
        {
            return await _context.Alerts
                .CountAsync(a =>
                    !a.IsRead &&
                    !a.IsResolved);
        }

        public async Task<decimal> GetTotalPurchaseAmountAsync()
        {
            return await _context.Purchases
                .Where(p => !p.IsDeleted)
                .SumAsync(p => (decimal?)p.TotalAmount) ?? 0;
        }

        public async Task<DashboardSummaryDto> GetSummaryAsync()
        {
            return new DashboardSummaryDto
            {
                TotalMedicines =
                    await GetTotalMedicinesAsync(),

                TotalCategories =
                    await GetTotalCategoriesAsync(),

                TotalSuppliers =
                    await GetTotalSuppliersAsync(),

                TotalBatches =
                    await GetTotalBatchesAsync(),

                LowStockCount =
                    await GetLowStockCountAsync(),

                NearExpiryCount =
                    await GetNearExpiryCountAsync(),

                ExpiredCount =
                    await GetExpiredCountAsync(),

                UnreadAlertsCount =
                    await GetUnreadAlertsCountAsync(),

                TotalPurchaseAmount =
                    await GetTotalPurchaseAmountAsync()
            };
        }
    }
}