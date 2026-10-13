
using PharmacyStockExpiryMonitor.Api.DTOs.Batch;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class BatchService : IBatchService
    {
        private readonly IBatchRepository _repository;
        private readonly IAuditLogService _auditLogService;

        public BatchService(
            IBatchRepository repository,
            IAuditLogService auditLogService)
        {
            _repository = repository;
            _auditLogService = auditLogService;
        }

        public async Task<List<BatchDto>> GetAllAsync()
        {
            var batches = await _repository.GetAllAsync();

            return batches.Select(batch => new BatchDto
            {
                Id = batch.Id,
                MedicineId = batch.MedicineId,
                MedicineName = batch.Medicine?.Name,
                BatchNumber = batch.BatchNumber,
                ManufacturingDate = batch.ManufacturingDate,
                ExpiryDate = batch.ExpiryDate,
                InitialQuantity = batch.InitialQuantity,
                RemainingQuantity = batch.RemainingQuantity,
                UnitCost = batch.UnitCost,
                CreatedAt = batch.CreatedAt,
                CreatedBy = batch.CreatedBy,
                UpdatedAt = batch.UpdatedAt,
                UpdatedBy = batch.UpdatedBy
            }).ToList();
        }

        public async Task<BatchDto?> GetByIdAsync(int id)
        {
            var batch = await _repository.GetByIdAsync(id);

            if (batch == null)
                return null;

            return new BatchDto
            {
                Id = batch.Id,
                MedicineId = batch.MedicineId,
                MedicineName = batch.Medicine?.Name,
                BatchNumber = batch.BatchNumber,
                ManufacturingDate = batch.ManufacturingDate,
                ExpiryDate = batch.ExpiryDate,
                InitialQuantity = batch.InitialQuantity,
                RemainingQuantity = batch.RemainingQuantity,
                UnitCost = batch.UnitCost,
                CreatedAt = batch.CreatedAt,
                CreatedBy = batch.CreatedBy,
                UpdatedAt = batch.UpdatedAt,
                UpdatedBy = batch.UpdatedBy
            };
        }

        public async Task<List<BatchDto>> GetByMedicineIdAsync(
            int medicineId)
        {
            var batches =
                await _repository.GetByMedicineIdAsync(medicineId);

            return batches.Select(batch => new BatchDto
            {
                Id = batch.Id,
                MedicineId = batch.MedicineId,
                MedicineName = batch.Medicine?.Name,
                BatchNumber = batch.BatchNumber,
                ManufacturingDate = batch.ManufacturingDate,
                ExpiryDate = batch.ExpiryDate,
                InitialQuantity = batch.InitialQuantity,
                RemainingQuantity = batch.RemainingQuantity,
                UnitCost = batch.UnitCost,
                CreatedAt = batch.CreatedAt,
                CreatedBy = batch.CreatedBy,
                UpdatedAt = batch.UpdatedAt,
                UpdatedBy = batch.UpdatedBy
            }).ToList();
        }

        public async Task<BatchDto> CreateAsync(
            CreateBatchDto dto)
        {
            if (dto.ExpiryDate <= dto.ManufacturingDate)
                throw new Exception(
                    "Expiry date must be after manufacturing date.");

            if (dto.InitialQuantity <= 0)
                throw new Exception(
                    "Initial quantity must be greater than zero.");

            var existingBatch =
                await _repository.GetByBatchNumberAsync(
                    dto.MedicineId,
                    dto.BatchNumber);

            if (existingBatch != null)
                throw new Exception(
                    "Batch number already exists for this medicine.");

            var batch = new Batch
            {
                MedicineId = dto.MedicineId,
                BatchNumber = dto.BatchNumber,
                ManufacturingDate = dto.ManufacturingDate,
                ExpiryDate = dto.ExpiryDate,
                InitialQuantity = dto.InitialQuantity,
                RemainingQuantity = dto.InitialQuantity,
                UnitCost = dto.UnitCost,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            var createdBatch =
                await _repository.AddAsync(batch);

            await _auditLogService.LogJsonAsync(
                "CREATE",
                "Batch",
                createdBatch.Id.ToString(),
                null,
                new
                {
                    createdBatch.Id,
                    createdBatch.MedicineId,
                    createdBatch.BatchNumber,
                    createdBatch.ManufacturingDate,
                    createdBatch.ExpiryDate,
                    createdBatch.InitialQuantity,
                    createdBatch.RemainingQuantity,
                    createdBatch.UnitCost,
                    createdBatch.IsDeleted
                });

            return new BatchDto
            {
                Id = createdBatch.Id,
                MedicineId = createdBatch.MedicineId,
                BatchNumber = createdBatch.BatchNumber,
                ManufacturingDate = createdBatch.ManufacturingDate,
                ExpiryDate = createdBatch.ExpiryDate,
                InitialQuantity = createdBatch.InitialQuantity,
                RemainingQuantity = createdBatch.RemainingQuantity,
                UnitCost = createdBatch.UnitCost,
                CreatedAt = createdBatch.CreatedAt,
                CreatedBy = createdBatch.CreatedBy,
                UpdatedAt = createdBatch.UpdatedAt,
                UpdatedBy = createdBatch.UpdatedBy
            };
        }

        public async Task<BatchDto?> UpdateAsync(
            int id,
            UpdateBatchDto dto)
        {
            var batch = await _repository.GetByIdAsync(id);

            if (batch == null)
                return null;

            if (dto.ExpiryDate <= dto.ManufacturingDate)
                throw new Exception(
                    "Expiry date must be after manufacturing date.");

            var oldValues = new
            {
                batch.Id,
                batch.MedicineId,
                batch.BatchNumber,
                batch.ManufacturingDate,
                batch.ExpiryDate,
                batch.InitialQuantity,
                batch.RemainingQuantity,
                batch.UnitCost,
                batch.IsDeleted
            };

            batch.BatchNumber = dto.BatchNumber;
            batch.ManufacturingDate = dto.ManufacturingDate;
            batch.ExpiryDate = dto.ExpiryDate;
            batch.UnitCost = dto.UnitCost;
            batch.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(batch);

            await _auditLogService.LogJsonAsync(
                "UPDATE",
                "Batch",
                batch.Id.ToString(),
                oldValues,
                new
                {
                    batch.Id,
                    batch.MedicineId,
                    batch.BatchNumber,
                    batch.ManufacturingDate,
                    batch.ExpiryDate,
                    batch.InitialQuantity,
                    batch.RemainingQuantity,
                    batch.UnitCost,
                    batch.IsDeleted
                });

            return new BatchDto
            {
                Id = batch.Id,
                MedicineId = batch.MedicineId,
                MedicineName = batch.Medicine?.Name,
                BatchNumber = batch.BatchNumber,
                ManufacturingDate = batch.ManufacturingDate,
                ExpiryDate = batch.ExpiryDate,
                InitialQuantity = batch.InitialQuantity,
                RemainingQuantity = batch.RemainingQuantity,
                UnitCost = batch.UnitCost,
                CreatedAt = batch.CreatedAt,
                CreatedBy = batch.CreatedBy,
                UpdatedAt = batch.UpdatedAt,
                UpdatedBy = batch.UpdatedBy
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var batch = await _repository.GetByIdAsync(id);

            if (batch == null)
                return false;

            var oldValues = new
            {
                batch.Id,
                batch.MedicineId,
                batch.BatchNumber,
                batch.ManufacturingDate,
                batch.ExpiryDate,
                batch.InitialQuantity,
                batch.RemainingQuantity,
                batch.UnitCost,
                batch.IsDeleted
            };

            batch.IsDeleted = true;
            batch.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(batch);

            await _auditLogService.LogJsonAsync(
                "DELETE",
                "Batch",
                batch.Id.ToString(),
                oldValues,
                new
                {
                    batch.Id,
                    batch.MedicineId,
                    batch.BatchNumber,
                    batch.ManufacturingDate,
                    batch.ExpiryDate,
                    batch.InitialQuantity,
                    batch.RemainingQuantity,
                    batch.UnitCost,
                    batch.IsDeleted
                });

            return true;
        }
    }
}

