using PharmacyStockExpiryMonitor.Api.DTOs.StockTransaction;
using PharmacyStockExpiryMonitor.Api.Entities;
using PharmacyStockExpiryMonitor.Api.Enums;
using PharmacyStockExpiryMonitor.Api.Repositories.Interfaces;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Services
{
    public class StockTransactionService :
        IStockTransactionService
    {
        private readonly IStockTransactionRepository _repository;
        private readonly IBatchRepository _batchRepository;

        public StockTransactionService(
            IStockTransactionRepository repository,
            IBatchRepository batchRepository)
        {
            _repository = repository;
            _batchRepository = batchRepository;
        }

        public async Task<List<StockTransactionDto>> GetAllAsync()
        {
            var transactions =
                await _repository.GetAllAsync();

            return transactions.Select(transaction =>
                new StockTransactionDto
                {
                    Id = transaction.Id,
                    MedicineId = transaction.MedicineId,
                    BatchId = transaction.BatchId,
                    TransactionType =
                        transaction.TransactionType,
                    Quantity = transaction.Quantity,
                    PreviousQuantity =
                        transaction.PreviousQuantity,
                    NewQuantity =
                        transaction.NewQuantity,
                    Reason = transaction.Reason,
                    IsAdminOverride =
                        transaction.IsAdminOverride,
                    CreatedAt = transaction.CreatedAt
                }).ToList();
        }

        public async Task<StockTransactionDto?> GetByIdAsync(
            int id)
        {
            var transaction =
                await _repository.GetByIdAsync(id);

            if (transaction == null)
                return null;

            return new StockTransactionDto
            {
                Id = transaction.Id,
                MedicineId = transaction.MedicineId,
                BatchId = transaction.BatchId,
                TransactionType =
                    transaction.TransactionType,
                Quantity = transaction.Quantity,
                PreviousQuantity =
                    transaction.PreviousQuantity,
                NewQuantity =
                    transaction.NewQuantity,
                Reason = transaction.Reason,
                IsAdminOverride =
                    transaction.IsAdminOverride,
                CreatedAt = transaction.CreatedAt
            };
        }

        public async Task<StockTransactionDto> CreateAsync(
            CreateStockTransactionDto dto)
        {
            if (dto.Quantity <= 0)
                throw new Exception(
                    "Quantity must be greater than zero.");

            var batch =
                await _batchRepository.GetByIdAsync(
                    dto.BatchId);

            if (batch == null)
                throw new Exception("Batch not found.");

            if (dto.TransactionType ==
                StockTransactionType.Adjustment &&
                !dto.IsAdminOverride)
            {
                throw new Exception(
                    "Adjustment requires admin override.");
            }

            var previousQuantity =
                batch.RemainingQuantity;

            var newQuantity = previousQuantity;

            if (dto.TransactionType ==
                StockTransactionType.StockIn)
            {
                newQuantity =
                    previousQuantity + dto.Quantity;
            }
            else if (dto.TransactionType ==
                     StockTransactionType.StockOut)
            {
                newQuantity =
                    previousQuantity - dto.Quantity;

                if (newQuantity < 0)
                    throw new Exception(
                        "Insufficient stock.");
            }
            else if (dto.TransactionType ==
                     StockTransactionType.Adjustment)
            {
                newQuantity = dto.Quantity;
            }

            batch.RemainingQuantity = newQuantity;

            await _batchRepository.UpdateAsync(batch);

            var transaction = new StockTransaction
            {
                MedicineId = batch.MedicineId,
                BatchId = batch.Id,
                TransactionType = dto.TransactionType,
                Quantity = dto.Quantity,
                PreviousQuantity = previousQuantity,
                NewQuantity = newQuantity,
                Reason = dto.Reason,
                IsAdminOverride = dto.IsAdminOverride,
                CreatedAt = DateTime.UtcNow
            };

            var createdTransaction =
                await _repository.AddAsync(transaction);

            return new StockTransactionDto
            {
                Id = createdTransaction.Id,
                MedicineId =
                    createdTransaction.MedicineId,
                BatchId =
                    createdTransaction.BatchId,
                TransactionType =
                    createdTransaction.TransactionType,
                Quantity =
                    createdTransaction.Quantity,
                PreviousQuantity =
                    createdTransaction.PreviousQuantity,
                NewQuantity =
                    createdTransaction.NewQuantity,
                Reason =
                    createdTransaction.Reason,
                IsAdminOverride =
                    createdTransaction.IsAdminOverride,
                CreatedAt =
                    createdTransaction.CreatedAt
            };
        }
    }
}