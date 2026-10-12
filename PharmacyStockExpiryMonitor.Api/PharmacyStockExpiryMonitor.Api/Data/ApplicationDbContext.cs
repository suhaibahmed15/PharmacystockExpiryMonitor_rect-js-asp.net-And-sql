using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PharmacyStockExpiryMonitor.Api.Entities;

namespace PharmacyStockExpiryMonitor.Api.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(
            DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Supplier> Suppliers { get; set; }

        public DbSet<Medicine> Medicines { get; set; }

        public DbSet<Purchase> Purchases { get; set; }

        public DbSet<PurchaseItem> PurchaseItems { get; set; }

        public DbSet<Batch> Batches { get; set; }

        public DbSet<StockTransaction> StockTransactions { get; set; }

        public DbSet<Alert> Alerts { get; set; }

        public DbSet<PredictionResult> PredictionResults { get; set; }

        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // =========================
            // Category
            // =========================

            modelBuilder.Entity<Category>()
                .HasIndex(x => x.Name)
                .IsUnique();

            modelBuilder.Entity<Category>()
                .HasIndex(x => new { x.IsActive, x.IsDeleted });

            modelBuilder.Entity<Category>()
                .Property(x => x.Name)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<Category>()
                .Property(x => x.Description)
                .HasMaxLength(500);


            // =========================
            // Supplier
            // =========================

            modelBuilder.Entity<Supplier>()
                .Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            modelBuilder.Entity<Supplier>()
                .Property(x => x.ContactPerson)
                .HasMaxLength(150);

            modelBuilder.Entity<Supplier>()
                .Property(x => x.Phone)
                .HasMaxLength(30);

            modelBuilder.Entity<Supplier>()
                .Property(x => x.Email)
                .HasMaxLength(150);

            modelBuilder.Entity<Supplier>()
                .Property(x => x.Address)
                .HasMaxLength(500);

            modelBuilder.Entity<Supplier>()
                .HasIndex(x => x.Name);

            modelBuilder.Entity<Supplier>()
                .HasIndex(x => new { x.IsActive, x.IsDeleted });


            // =========================
            // Medicine
            // =========================

            modelBuilder.Entity<Medicine>()
                .HasIndex(x => x.MedicineCode)
                .IsUnique();

            modelBuilder.Entity<Medicine>()
                .HasIndex(x => x.Name);

            modelBuilder.Entity<Medicine>()
                .HasIndex(x => new { x.IsActive, x.IsDeleted });

            modelBuilder.Entity<Medicine>()
                .Property(x => x.Name)
                .HasMaxLength(150)
                .IsRequired();

            modelBuilder.Entity<Medicine>()
                .Property(x => x.MedicineCode)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Medicine>()
                .Property(x => x.GenericName)
                .HasMaxLength(150);

            modelBuilder.Entity<Medicine>()
                .Property(x => x.Manufacturer)
                .HasMaxLength(150);

            modelBuilder.Entity<Medicine>()
                .Property(x => x.Description)
                .HasMaxLength(500);

            modelBuilder.Entity<Medicine>()
                .HasOne(x => x.Category)
                .WithMany(x => x.Medicines)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Purchase
            // =========================

            modelBuilder.Entity<Purchase>()
                .HasIndex(x => x.PurchaseNumber)
                .IsUnique();

            modelBuilder.Entity<Purchase>()
                .HasIndex(x => x.PurchaseDate);

            modelBuilder.Entity<Purchase>()
                .Property(x => x.PurchaseNumber)
                .HasMaxLength(50)
                .IsRequired();

            modelBuilder.Entity<Purchase>()
                .Property(x => x.Notes)
                .HasMaxLength(500);

            modelBuilder.Entity<Purchase>()
                .Property(x => x.TotalAmount)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Purchase>()
                .HasOne(x => x.Supplier)
                .WithMany(x => x.Purchases)
                .HasForeignKey(x => x.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Purchase Item
            // =========================

            modelBuilder.Entity<PurchaseItem>()
                .HasOne(x => x.Purchase)
                .WithMany(x => x.PurchaseItems)
                .HasForeignKey(x => x.PurchaseId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PurchaseItem>()
                .HasOne(x => x.Medicine)
                .WithMany(x => x.PurchaseItems)
                .HasForeignKey(x => x.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PurchaseItem>()
                .HasIndex(x => x.PurchaseId);

            modelBuilder.Entity<PurchaseItem>()
                .HasIndex(x => x.MedicineId);

            modelBuilder.Entity<PurchaseItem>()
                .Property(x => x.UnitPrice)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PurchaseItem>()
                .Property(x => x.TotalPrice)
                .HasPrecision(18, 2);


            // =========================
            // Batch
            // =========================

            modelBuilder.Entity<Batch>()
                .HasIndex(x => x.ExpiryDate);

            modelBuilder.Entity<Batch>()
                .HasIndex(x => x.MedicineId);

            modelBuilder.Entity<Batch>()
                .HasIndex(x => new
                {
                    x.MedicineId,
                    x.BatchNumber
                })
                .IsUnique();

            modelBuilder.Entity<Batch>()
                .Property(x => x.BatchNumber)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<Batch>()
                .Property(x => x.UnitCost)
                .HasPrecision(18, 2);

            modelBuilder.Entity<Batch>()
                .HasOne(x => x.Medicine)
                .WithMany(x => x.Batches)
                .HasForeignKey(x => x.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Stock Transactions
            // =========================

            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.CreatedAt);

            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.TransactionType);

            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.MedicineId);

            modelBuilder.Entity<StockTransaction>()
                .HasIndex(x => x.BatchId);

            modelBuilder.Entity<StockTransaction>()
                .Property(x => x.Reason)
                .HasMaxLength(500);

            modelBuilder.Entity<StockTransaction>()
                .Property(x => x.CreatedBy)
                .HasMaxLength(450);

            modelBuilder.Entity<StockTransaction>()
                .HasOne(x => x.Medicine)
                .WithMany(x => x.StockTransactions)
                .HasForeignKey(x => x.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<StockTransaction>()
                .HasOne(x => x.Batch)
                .WithMany(x => x.StockTransactions)
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Alerts
            // =========================

            modelBuilder.Entity<Alert>()
                .HasIndex(x => x.AlertType);

            modelBuilder.Entity<Alert>()
                .HasIndex(x => x.CreatedAt);

            modelBuilder.Entity<Alert>()
                .HasIndex(x => new
                {
                    x.IsResolved,
                    x.IsRead
                });

            modelBuilder.Entity<Alert>()
                .HasIndex(x => x.MedicineId);

            modelBuilder.Entity<Alert>()
                .HasIndex(x => x.BatchId);

            modelBuilder.Entity<Alert>()
                .Property(x => x.Message)
                .HasMaxLength(500)
                .IsRequired();

            modelBuilder.Entity<Alert>()
                .HasOne(x => x.Medicine)
                .WithMany(x => x.Alerts)
                .HasForeignKey(x => x.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Alert>()
                .HasOne(x => x.Batch)
                .WithMany(x => x.Alerts)
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Prediction Results
            // =========================

            modelBuilder.Entity<PredictionResult>()
                .HasIndex(x => x.PredictedAt);

            modelBuilder.Entity<PredictionResult>()
                .HasIndex(x => x.MedicineId);

            modelBuilder.Entity<PredictionResult>()
                .HasIndex(x => x.BatchId);

            modelBuilder.Entity<PredictionResult>()
                .Property(x => x.AverageDailyConsumption)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PredictionResult>()
                .Property(x => x.EstimatedDaysRemaining)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PredictionResult>()
                .Property(x => x.PredictionScore)
                .HasPrecision(18, 2);

            modelBuilder.Entity<PredictionResult>()
                .Property(x => x.PredictionType)
                .HasMaxLength(50);

            modelBuilder.Entity<PredictionResult>()
                .Property(x => x.Explanation)
                .HasMaxLength(1000);

            modelBuilder.Entity<PredictionResult>()
                .HasOne(x => x.Medicine)
                .WithMany(x => x.PredictionResults)
                .HasForeignKey(x => x.MedicineId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PredictionResult>()
                .HasOne(x => x.Batch)
                .WithMany()
                .HasForeignKey(x => x.BatchId)
                .OnDelete(DeleteBehavior.Restrict);


            // =========================
            // Audit Logs
            // =========================

            modelBuilder.Entity<AuditLog>()
                .HasIndex(x => x.CreatedAt);

            modelBuilder.Entity<AuditLog>()
                .HasIndex(x => x.UserId);

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.UserId)
                .HasMaxLength(450);

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.Action)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.EntityName)
                .HasMaxLength(100)
                .IsRequired();

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.EntityId)
                .HasMaxLength(100);

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.OldValues)
                .HasMaxLength(5000);

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.NewValues)
                .HasMaxLength(5000);

            modelBuilder.Entity<AuditLog>()
                .Property(x => x.IpAddress)
                .HasMaxLength(45);

            modelBuilder.Entity<AuditLog>()
                .HasOne(x => x.User)
                .WithMany(x => x.AuditLogs)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}