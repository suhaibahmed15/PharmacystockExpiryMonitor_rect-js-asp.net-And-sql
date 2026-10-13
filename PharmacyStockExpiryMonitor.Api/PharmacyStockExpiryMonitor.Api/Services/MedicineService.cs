using PharmacyStockExpiryMonitor.Api.DTOs.Medicine;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class MedicineService : IMedicineService
    {
        private readonly IMedicineRepository _repository;
        private readonly IAuditLogService _auditLogService;


    public MedicineService(
        IMedicineRepository repository,
        IAuditLogService auditLogService)
        {
            _repository = repository;
            _auditLogService = auditLogService;
        }

        public async Task<(List<MedicineDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
            int? categoryId,
            bool? isActive,
            string? sortBy,
            string? sortDirection)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var medicines = await _repository.GetAllAsync(
                page,
                pageSize,
                search,
                categoryId,
                isActive,
                sortBy,
                sortDirection);

            var totalCount = await _repository.GetCountAsync(
                search,
                categoryId,
                isActive);

            var items = medicines.Select(medicine => new MedicineDto
            {
                Id = medicine.Id,
                MedicineCode = medicine.MedicineCode,
                Name = medicine.Name,
                GenericName = medicine.GenericName,
                Description = medicine.Description,
                CategoryId = medicine.CategoryId,
                CategoryName = medicine.Category?.Name,
                ReorderLevel = medicine.ReorderLevel,
                CurrentStock = medicine.CurrentStock,
                IsActive = medicine.IsActive,
                CreatedAt = medicine.CreatedAt,
                CreatedBy = medicine.CreatedBy,
                UpdatedAt = medicine.UpdatedAt,
                UpdatedBy = medicine.UpdatedBy
            }).ToList();

            return (items, totalCount);
        }

        public async Task<MedicineDto?> GetByIdAsync(int id)
        {
            var medicine = await _repository.GetByIdAsync(id);

            if (medicine == null)
                return null;

            return new MedicineDto
            {
                Id = medicine.Id,
                MedicineCode = medicine.MedicineCode,
                Name = medicine.Name,
                GenericName = medicine.GenericName,
                Description = medicine.Description,
                CategoryId = medicine.CategoryId,
                CategoryName = medicine.Category?.Name,
                ReorderLevel = medicine.ReorderLevel,
                CurrentStock = medicine.CurrentStock,
                IsActive = medicine.IsActive,
                CreatedAt = medicine.CreatedAt,
                CreatedBy = medicine.CreatedBy,
                UpdatedAt = medicine.UpdatedAt,
                UpdatedBy = medicine.UpdatedBy
            };
        }

        public async Task<MedicineDto> CreateAsync(
            CreateMedicineDto dto)
        {
            var existingMedicine =
                await _repository.GetByCodeAsync(dto.MedicineCode);

            if (existingMedicine != null)
                throw new InvalidOperationException(
                    "Medicine code already exists.");

            var medicine = new Medicine
            {
                MedicineCode = dto.MedicineCode,
                Name = dto.Name,
                GenericName = dto.GenericName,
                Description = dto.Description,
                CategoryId = dto.CategoryId,
                ReorderLevel = dto.ReorderLevel,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var createdMedicine =
                await _repository.AddAsync(medicine);

            await _auditLogService.LogJsonAsync(
                "CREATE",
                "Medicine",
                createdMedicine.Id.ToString(),
                null,
                new
                {
                    createdMedicine.Id,
                    createdMedicine.MedicineCode,
                    createdMedicine.Name,
                    createdMedicine.GenericName,
                    createdMedicine.CategoryId,
                    createdMedicine.ReorderLevel,
                    createdMedicine.IsActive
                });

            return new MedicineDto
            {
                Id = createdMedicine.Id,
                MedicineCode = createdMedicine.MedicineCode,
                Name = createdMedicine.Name,
                GenericName = createdMedicine.GenericName,
                Description = createdMedicine.Description,
                CategoryId = createdMedicine.CategoryId,
                CategoryName = createdMedicine.Category?.Name,
                ReorderLevel = createdMedicine.ReorderLevel,
                CurrentStock = createdMedicine.CurrentStock,
                IsActive = createdMedicine.IsActive,
                CreatedAt = createdMedicine.CreatedAt,
                CreatedBy = createdMedicine.CreatedBy,
                UpdatedAt = createdMedicine.UpdatedAt,
                UpdatedBy = createdMedicine.UpdatedBy
            };
        }

        public async Task<MedicineDto?> UpdateAsync(
            int id,
            UpdateMedicineDto dto)
        {
            var medicine = await _repository.GetByIdAsync(id);

            if (medicine == null)
                return null;

            var existingMedicine =
                await _repository.GetByCodeAsync(
                    dto.MedicineCode,
                    id);

            if (existingMedicine != null)
            {
                throw new InvalidOperationException(
                    "Medicine code already exists.");
            }

            var oldValues = new
            {
                medicine.MedicineCode,
                medicine.Name,
                medicine.GenericName,
                medicine.Description,
                medicine.CategoryId,
                medicine.ReorderLevel,
                medicine.IsActive
            };

            medicine.MedicineCode = dto.MedicineCode;
            medicine.Name = dto.Name;
            medicine.GenericName = dto.GenericName;
            medicine.Description = dto.Description;
            medicine.CategoryId = dto.CategoryId;
            medicine.ReorderLevel = dto.ReorderLevel;
            medicine.IsActive = dto.IsActive;
            medicine.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(medicine);

            await _auditLogService.LogJsonAsync(
                "UPDATE",
                "Medicine",
                medicine.Id.ToString(),
                oldValues,
                new
                {
                    medicine.MedicineCode,
                    medicine.Name,
                    medicine.GenericName,
                    medicine.Description,
                    medicine.CategoryId,
                    medicine.ReorderLevel,
                    medicine.IsActive
                });

            return new MedicineDto
            {
                Id = medicine.Id,
                MedicineCode = medicine.MedicineCode,
                Name = medicine.Name,
                GenericName = medicine.GenericName,
                Description = medicine.Description,
                CategoryId = medicine.CategoryId,
                CategoryName = medicine.Category?.Name,
                ReorderLevel = medicine.ReorderLevel,
                CurrentStock = medicine.CurrentStock,
                IsActive = medicine.IsActive,
                CreatedAt = medicine.CreatedAt,
                CreatedBy = medicine.CreatedBy,
                UpdatedAt = medicine.UpdatedAt,
                UpdatedBy = medicine.UpdatedBy
            };
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var medicine = await _repository.GetByIdAsync(id);

            if (medicine == null)
                return false;

            var oldValues = new
            {
                medicine.MedicineCode,
                medicine.Name,
                medicine.CategoryId,
                medicine.IsActive,
                medicine.IsDeleted
            };

            medicine.IsDeleted = true;
            medicine.IsActive = false;
            medicine.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(medicine);

            await _auditLogService.LogJsonAsync(
                "DELETE",
                "Medicine",
                medicine.Id.ToString(),
                oldValues,
                new
                {
                    medicine.MedicineCode,
                    medicine.Name,
                    medicine.CategoryId,
                    medicine.IsActive,
                    medicine.IsDeleted
                });

            return true;
        }
    }


}
