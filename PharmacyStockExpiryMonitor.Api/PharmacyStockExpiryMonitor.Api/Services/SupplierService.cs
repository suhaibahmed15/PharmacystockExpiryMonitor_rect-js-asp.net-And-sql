
using PharmacyStockExpiryMonitor.Api.DTOs.Supplier;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _repository;
        private readonly IAuditLogService _auditLogService;

        public SupplierService(
            ISupplierRepository repository,
            IAuditLogService auditLogService)
        {
            _repository = repository;
            _auditLogService = auditLogService;
        }

        public async Task<(List<SupplierDto> Items, int TotalCount)> GetAllAsync(
            int page,
            int pageSize,
            string? search,
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

            var suppliers = await _repository.GetAllAsync(
                page,
                pageSize,
                search,
                isActive,
                sortBy,
                sortDirection);

            var totalCount = await _repository.GetCountAsync(
                search,
                isActive);

            var items = suppliers.Select(supplier => new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                ContactPerson = supplier.ContactPerson,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt,
                CreatedBy = supplier.CreatedBy,
                UpdatedAt = supplier.UpdatedAt,
                UpdatedBy = supplier.UpdatedBy
            }).ToList();

            return (items, totalCount);
        }

        public async Task<SupplierDto?> GetByIdAsync(int id)
        {
            var supplier = await _repository.GetByIdAsync(id);

            if (supplier == null)
                return null;

            return new SupplierDto
            {
                Id = supplier.Id,
                Name = supplier.Name,
                ContactPerson = supplier.ContactPerson,
                Phone = supplier.Phone,
                Email = supplier.Email,
                Address = supplier.Address,
                IsActive = supplier.IsActive,
                CreatedAt = supplier.CreatedAt,
                CreatedBy = supplier.CreatedBy,
                UpdatedAt = supplier.UpdatedAt,
                UpdatedBy = supplier.UpdatedBy
            };
        }

        public async Task<SupplierDto> CreateAsync(
            CreateSupplierDto dto)
        {
            var supplierName = dto.Name.Trim();

            var existingSupplier =
                await _repository.GetByNameAsync(supplierName);

            if (existingSupplier != null)
            {
                throw new InvalidOperationException(
                    "Supplier already exists.");
            }

            var supplier = new Supplier
            {
                Name = supplierName,
                ContactPerson = dto.ContactPerson?.Trim(),
                Phone = dto.Phone?.Trim(),
                Email = dto.Email?.Trim(),
                Address = dto.Address?.Trim(),
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var createdSupplier =
                await _repository.AddAsync(supplier);

            await _auditLogService.LogJsonAsync(
                "CREATE",
                "Supplier",
                createdSupplier.Id.ToString(),
                null,
                new
                {
                    createdSupplier.Id,
                    createdSupplier.Name,
                    createdSupplier.ContactPerson,
                    createdSupplier.Phone,
                    createdSupplier.Email,
                    createdSupplier.Address,
                    createdSupplier.IsActive
                });

            return new SupplierDto
            {
                Id = createdSupplier.Id,
                Name = createdSupplier.Name,
                ContactPerson = createdSupplier.ContactPerson,
                Phone = createdSupplier.Phone,
                Email = createdSupplier.Email,
                Address = createdSupplier.Address,
                IsActive = createdSupplier.IsActive,
                CreatedAt = createdSupplier.CreatedAt,
                CreatedBy = createdSupplier.CreatedBy,
                UpdatedAt = createdSupplier.UpdatedAt,
                UpdatedBy = createdSupplier.UpdatedBy
            };
        }

        public async Task<bool> UpdateAsync(
            int id,
            UpdateSupplierDto dto,
            string UpdatedBy)
        {
            var supplier = await _repository.GetByIdAsync(id);

            if (supplier == null)
                return false;

            supplier.Name = dto.Name.Trim();
            supplier.ContactPerson = dto.ContactPerson?.Trim();
            supplier.Phone = dto.Phone?.Trim();
            supplier.Email = dto.Email?.Trim();
            supplier.Address = dto.Address?.Trim();
            supplier.IsActive = dto.IsActive;
            supplier.UpdatedAt = DateTime.UtcNow;
            supplier.UpdatedBy = UpdatedBy;

            await _repository.UpdateAsync(supplier);

            //await _auditLogService.LogJsonAsync(
            //    "UPDATE",
            //    "Supplier",
            //    supplier.Id.ToString(),
            //    oldValues,
            //    new
            //    {
            //        supplier.Id,
            //        supplier.Name,
            //        supplier.ContactPerson,
            //        supplier.Phone,
            //        supplier.Email,
            //        supplier.Address,
            //        supplier.IsActive
            //    });

            return true;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var supplier = await _repository.GetByIdAsync(id);

            if (supplier == null)
                return false;

            var oldValues = new
            {
                supplier.Id,
                supplier.Name,
                supplier.ContactPerson,
                supplier.Phone,
                supplier.Email,
                supplier.Address,
                supplier.IsActive,
                supplier.IsDeleted
            };

            supplier.IsDeleted = true;
            supplier.IsActive = false;
            supplier.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(supplier);

            await _auditLogService.LogJsonAsync(
                "DELETE",
                "Supplier",
                supplier.Id.ToString(),
                oldValues,
                new
                {
                    supplier.Id,
                    supplier.Name,
                    supplier.ContactPerson,
                    supplier.Phone,
                    supplier.Email,
                    supplier.Address,
                    supplier.IsActive,
                    supplier.IsDeleted
                });

            return true;
        }
    }
}

