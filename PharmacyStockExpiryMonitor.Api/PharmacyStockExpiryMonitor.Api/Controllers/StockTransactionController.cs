using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.StockTransaction;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StockTransactionController : ControllerBase
    {
        private readonly IStockTransactionService _stockTransactionService;

        public StockTransactionController(
            IStockTransactionService stockTransactionService)
        {
            _stockTransactionService = stockTransactionService;
        }

        // GET: api/StockTransaction
        // Gets all stock transactions.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var transactions =
                await _stockTransactionService.GetAllAsync();

            return Ok(transactions);
        }

        // GET: api/StockTransaction/5
        // Gets one stock transaction by its ID.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var transaction =
                await _stockTransactionService.GetByIdAsync(id);

            if (transaction == null)
                return NotFound(new
                {
                    message = "Stock transaction not found."
                });

            return Ok(transaction);
        }

        // POST: api/StockTransaction
        // Creates a stock transaction such as StockIn, StockOut or Adjustment.
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateStockTransactionDto dto)
        {
            var transaction =
                await _stockTransactionService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = transaction.Id },
                transaction);
        }
    }
}