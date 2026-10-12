using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Medicine;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MedicineController : ControllerBase
    {
        private readonly IMedicineService _medicineService;

        public MedicineController(IMedicineService medicineService)
        {
            _medicineService = medicineService;
        }

        // GET: api/Medicine
        // Supports:
        // Search
        // Filtering
        // Sorting
        // Server-side pagination
        //
        // Example:
        // /api/Medicine?page=1&pageSize=10
        // /api/Medicine?page=1&pageSize=10&search=para
        // /api/Medicine?page=1&pageSize=10&categoryId=2
        // /api/Medicine?page=1&pageSize=10&isActive=true
        // /api/Medicine?page=1&pageSize=10&sortBy=name&sortDirection=desc

        [HttpGet]
        public async Task<IActionResult> GetAll(
            int page = 1,
            int pageSize = 10,
            string? search = null,
            int? categoryId = null,
            bool? isActive = null,
            string? sortBy = "name",
            string? sortDirection = "asc")
        {
            var result = await _medicineService.GetAllAsync(
                page,
                pageSize,
                search,
                categoryId,
                isActive,
                sortBy,
                sortDirection);

            // Keep the values consistent with the service.
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            return Ok(new
            {
                items = result.Items,
                totalCount = result.TotalCount,
                page = page,
                pageSize = pageSize,
                totalPages = (int)Math.Ceiling(
                    (double)result.TotalCount / pageSize),
                search = search,
                categoryId = categoryId,
                isActive = isActive,
                sortBy = sortBy,
                sortDirection = sortDirection
            });
        }

        // GET: api/Medicine/5
        // Gets one medicine by its ID.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var medicine = await _medicineService.GetByIdAsync(id);

            if (medicine == null)
            {
                return NotFound(new
                {
                    message = "Medicine not found."
                });
            }

            return Ok(medicine);
        }

        // POST: api/Medicine
        // Creates a new medicine.
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateMedicineDto dto)
        {
            try
            {
                var medicine = await _medicineService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = medicine.Id },
                    medicine);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // PUT: api/Medicine/5
        // Updates an existing medicine.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateMedicineDto dto)
        {
            try
            {
                var medicine = await _medicineService
                    .UpdateAsync(id, dto);

                if (medicine == null)
                {
                    return NotFound(new
                    {
                        message = "Medicine not found."
                    });
                }

                return Ok(medicine);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new
                {
                    message = ex.Message
                });
            }
        }

        // DELETE: api/Medicine/5
        // Soft-deletes a medicine.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _medicineService.DeleteAsync(id);

            if (!result)
            {
                return NotFound(new
                {
                    message = "Medicine not found."
                });
            }

            return Ok(new
            {
                message = "Medicine deleted successfully."
            });
        }
    }
}