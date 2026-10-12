using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Purchase;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PurchaseController : ControllerBase
    {
        private readonly IPurchaseService _purchaseService;

        public PurchaseController(IPurchaseService purchaseService)
        {
            _purchaseService = purchaseService;
        }

        // GET: api/Purchase
        // Gets all purchase records.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var purchases = await _purchaseService.GetAllAsync();

            return Ok(purchases);
        }

        // GET: api/Purchase/5
        // Gets one purchase by its ID.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var purchase = await _purchaseService.GetByIdAsync(id);

            if (purchase == null)
                return NotFound(new { message = "Purchase not found." });

            return Ok(purchase);
        }

        // POST: api/Purchase
        // Creates a purchase along with its purchase items.
        [HttpPost]
        public async Task<IActionResult> Create(CreatePurchaseDto dto)
        {
            var purchase = await _purchaseService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = purchase.Id },
                purchase);
        }
    }
}