using PharmacyStockExpiryMonitor.Api.DTOs.Alert;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Enums;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class AlertService : IAlertService
    {
        private readonly IAlertRepository _repository;

        public AlertService(IAlertRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<AlertDto>> GetAllAsync()
        {
            var alerts = await _repository.GetAllAsync();

            return alerts.Select(alert => new AlertDto
            {
                Id = alert.Id,
                MedicineId = alert.MedicineId,
                BatchId = alert.BatchId,
                AlertType = alert.AlertType,
                Message = alert.Message,
                IsRead = alert.IsRead,
                IsResolved = alert.IsResolved,
                ResolvedAt = alert.ResolvedAt,
                CreatedAt = alert.CreatedAt,
                CreatedBy = alert.CreatedBy,
                UpdatedAt = alert.UpdatedAt,
                UpdatedBy = alert.UpdatedBy
            }).ToList();
        }

        public async Task<AlertDto?> GetByIdAsync(int id)
        {
            var alert = await _repository.GetByIdAsync(id);

            if (alert == null)
                return null;

            return new AlertDto
            {
                Id = alert.Id,
                MedicineId = alert.MedicineId,
                BatchId = alert.BatchId,
                AlertType = alert.AlertType,
                Message = alert.Message,
                IsRead = alert.IsRead,
                IsResolved = alert.IsResolved,
                ResolvedAt = alert.ResolvedAt,
                CreatedAt = alert.CreatedAt,
                CreatedBy = alert.CreatedBy,
                UpdatedAt = alert.UpdatedAt,
                UpdatedBy = alert.UpdatedBy
            };
        }

        public async Task<AlertDto> CreateAsync(
            int medicineId,
            int? batchId,
            AlertType alertType,
            string message)
        {
            var alert = new Alert
            {
                MedicineId = medicineId,
                BatchId = batchId,
                AlertType = alertType,
                Message = message,
                IsRead = false,
                IsResolved = false,
                CreatedAt = DateTime.UtcNow
            };

            var createdAlert =
                await _repository.AddAsync(alert);

            return new AlertDto
            {
                Id = createdAlert.Id,
                MedicineId = createdAlert.MedicineId,
                BatchId = createdAlert.BatchId,
                AlertType = createdAlert.AlertType,
                Message = createdAlert.Message,
                IsRead = createdAlert.IsRead,
                IsResolved = createdAlert.IsResolved,
                ResolvedAt = createdAlert.ResolvedAt,
                CreatedAt = createdAlert.CreatedAt,
                CreatedBy = createdAlert.CreatedBy,
                UpdatedAt = createdAlert.UpdatedAt,
                UpdatedBy = createdAlert.UpdatedBy
            };
        }

        public async Task<bool> MarkAsReadAsync(int id)
        {
            var alert = await _repository.GetByIdAsync(id);

            if (alert == null)
                return false;

            alert.IsRead = true;

            await _repository.UpdateAsync(alert);

            return true;
        }

        public async Task<bool> ResolveAsync(int id)
        {
            var alert = await _repository.GetByIdAsync(id);

            if (alert == null)
                return false;

            alert.IsResolved = true;
            alert.ResolvedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(alert);

            return true;
        }
    }
}