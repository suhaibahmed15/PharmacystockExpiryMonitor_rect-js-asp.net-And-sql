using PharmacyStockExpiryMonitor.Api.DTOs.Purchase;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class PurchaseService : IPurchaseService
    {
        private readonly IPurchaseRepository _repository;

        public PurchaseService(IPurchaseRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<PurchaseDto>> GetAllAsync()
        {
            var purchases = await _repository.GetAllAsync();

            return purchases.Select(purchase => new PurchaseDto
            {
                Id = purchase.Id,
                PurchaseNumber = purchase.PurchaseNumber,
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.Supplier?.Name,
                PurchaseDate = purchase.PurchaseDate,
                TotalAmount = purchase.TotalAmount,
                Notes = purchase.Notes,

                PurchaseItems = purchase.PurchaseItems
                    .Select(item => new PurchaseItemDto
                    {
                        MedicineId = item.MedicineId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    })
                    .ToList()

            }).ToList();
        }

        public async Task<PurchaseDto?> GetByIdAsync(int id)
        {
            var purchase = await _repository.GetByIdAsync(id);

            if (purchase == null)
                return null;

            return ToDto(purchase);
        }

        public async Task<PurchaseDto?> GetByPurchaseNumberAsync(
            string purchaseNumber)
        {
            var purchase =
                await _repository.GetByPurchaseNumberAsync(
                    purchaseNumber);

            if (purchase == null)
                return null;

            return ToDto(purchase);
        }

        public async Task<PurchaseDto> CreateAsync(
            CreatePurchaseDto dto)
        {
            if (dto.PurchaseItems == null ||
                dto.PurchaseItems.Count == 0)
            {
                throw new Exception(
                    "Purchase must contain at least one item.");
            }

            foreach (var item in dto.PurchaseItems)
            {
                if (item.Quantity <= 0)
                    throw new Exception(
                        "Quantity must be greater than zero.");

                if (item.UnitPrice < 0)
                    throw new Exception(
                        "Unit price cannot be negative.");
            }

            var existingPurchase =
                await _repository.GetByPurchaseNumberAsync(
                    dto.PurchaseNumber);

            if (existingPurchase != null)
                throw new Exception(
                    "Purchase number already exists.");

            var purchase = new Purchase
            {
                PurchaseNumber = dto.PurchaseNumber,
                SupplierId = dto.SupplierId,
                PurchaseDate = dto.PurchaseDate,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            purchase.PurchaseItems = dto.PurchaseItems
                .Select(item => new PurchaseItem
                {
                    MedicineId = item.MedicineId,
                    Quantity = item.Quantity,
                    UnitPrice = item.UnitPrice,
                    TotalPrice =
                        item.Quantity * item.UnitPrice,
                    CreatedAt = DateTime.UtcNow
                })
                .ToList();

            purchase.TotalAmount =
                purchase.PurchaseItems.Sum(
                    item => item.TotalPrice);

            var createdPurchase =
                await _repository.AddAsync(purchase);

            return ToDto(createdPurchase);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var purchase = await _repository.GetByIdAsync(id);

            if (purchase == null)
                return false;

            purchase.IsDeleted = true;
            purchase.UpdatedAt = DateTime.UtcNow;

            await _repository.UpdateAsync(purchase);

            return true;
        }

        private PurchaseDto ToDto(Purchase purchase)
        {
            return new PurchaseDto
            {
                Id = purchase.Id,
                PurchaseNumber = purchase.PurchaseNumber,
                SupplierId = purchase.SupplierId,
                SupplierName = purchase.Supplier?.Name,
                PurchaseDate = purchase.PurchaseDate,
                TotalAmount = purchase.TotalAmount,
                Notes = purchase.Notes,

                PurchaseItems = purchase.PurchaseItems
                    .Select(item => new PurchaseItemDto
                    {
                        MedicineId = item.MedicineId,
                        Quantity = item.Quantity,
                        UnitPrice = item.UnitPrice
                    })
                    .ToList()
            };
        }
    }
}