using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PharmacyStockExpiryMonitor.Api.DTOs.Batch;
using PharmacyStockExpiryMonitor.Api.Services.Interfaces;

namespace PharmacyStockExpiryMonitor.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class BatchController : ControllerBase
    {
        private readonly IBatchService _batchService;

        public BatchController(IBatchService batchService)
        {
            _batchService = batchService;
        }

        // GET: api/Batch
        // Gets all medicine batches.
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var batches = await _batchService.GetAllAsync();

            return Ok(batches);
        }

        // GET: api/Batch/5
        // Gets one batch by its ID.
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var batch = await _batchService.GetByIdAsync(id);

            if (batch == null)
                return NotFound(new { message = "Batch not found." });

            return Ok(batch);
        }

        // GET: api/Batch/medicine/5
        // Gets all batches belonging to a specific medicine.
        [HttpGet("medicine/{medicineId}")]
        public async Task<IActionResult> GetByMedicineId(int medicineId)
        {
            var batches = await _batchService
                .GetByMedicineIdAsync(medicineId);

            return Ok(batches);
        }

        // POST: api/Batch
        // Creates a new medicine batch.
        [HttpPost]
        public async Task<IActionResult> Create(CreateBatchDto dto)
        {
            var batch = await _batchService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = batch.Id },
                batch);
        }

        // PUT: api/Batch/5
        // Updates batch information such as batch number and expiry date.
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateBatchDto dto)
        {
            var batch = await _batchService.UpdateAsync(id, dto);

            if (batch == null)
                return NotFound(new { message = "Batch not found." });

            return Ok(batch);
        }

        // DELETE: api/Batch/5
        // Soft-deletes a batch.
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _batchService.DeleteAsync(id);

            if (!result)
                return NotFound(new { message = "Batch not found." });

            return Ok(new
            {
                message = "Batch deleted successfully."
            });
        }
    }
}