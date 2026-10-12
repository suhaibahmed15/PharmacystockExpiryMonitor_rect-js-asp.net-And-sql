using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Data;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Repositories
{
    public class AlertRepository : IAlertRepository
    {
        private readonly ApplicationDbContext _context;

        public AlertRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Alert>> GetAllAsync()
        {
            return await _context.Alerts
                .Include(a => a.Medicine)
                .Include(a => a.Batch)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetActiveAsync()
        {
            return await _context.Alerts
                .Include(a => a.Medicine)
                .Include(a => a.Batch)
                .Where(a => !a.IsResolved)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<Alert>> GetUnreadAsync()
        {
            return await _context.Alerts
                .Include(a => a.Medicine)
                .Include(a => a.Batch)
                .Where(a =>
                    !a.IsRead &&
                    !a.IsResolved)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Alert?> GetByIdAsync(int id)
        {
            return await _context.Alerts
                .Include(a => a.Medicine)
                .Include(a => a.Batch)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<List<Alert>> GetByMedicineIdAsync(
            int medicineId)
        {
            return await _context.Alerts
                .Include(a => a.Medicine)
                .Include(a => a.Batch)
                .Where(a => a.MedicineId == medicineId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();
        }

        public async Task<Alert> AddAsync(Alert alert)
        {
            await _context.Alerts.AddAsync(alert);
            await _context.SaveChangesAsync();

            return alert;
        }

        public async Task UpdateAsync(Alert alert)
        {
            _context.Alerts.Update(alert);
            await _context.SaveChangesAsync();
        }
    }
}