using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PharmacyStockExpiryMonitor.Api.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAlertEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Batches_Purchases_PurchaseId",
                table: "Batches");

            migrationBuilder.DropIndex(
                name: "IX_Batches_PurchaseId",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Suppliers");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Purchases");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Purchases");

            migrationBuilder.DropColumn(
                name: "ConfirmedBy",
                table: "PredictionResults");

            migrationBuilder.DropColumn(
                name: "UserConfirmed",
                table: "PredictionResults");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Medicines");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "PurchaseId",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "UpdatedBy",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "IsActive",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "ResolvedBy",
                table: "Alerts");

            migrationBuilder.RenameColumn(
                name: "TransactionDate",
                table: "StockTransactions",
                newName: "CreatedAt");

            migrationBuilder.RenameColumn(
                name: "ReferenceNumber",
                table: "StockTransactions",
                newName: "Reason");

            migrationBuilder.RenameColumn(
                name: "PerformedBy",
                table: "StockTransactions",
                newName: "CreatedBy");

            migrationBuilder.RenameIndex(
                name: "IX_StockTransactions_TransactionDate",
                table: "StockTransactions",
                newName: "IX_StockTransactions_CreatedAt");

            migrationBuilder.RenameColumn(
                name: "UpdatedBy",
                table: "Purchases",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "PredictionDate",
                table: "PredictionResults",
                newName: "PredictedAt");

            migrationBuilder.RenameIndex(
                name: "IX_PredictionResults_PredictionDate",
                table: "PredictionResults",
                newName: "IX_PredictionResults_PredictedAt");

            migrationBuilder.RenameColumn(
                name: "PurchasePrice",
                table: "Batches",
                newName: "UnitCost");

            migrationBuilder.RenameColumn(
                name: "IsDeleted",
                table: "Alerts",
                newName: "IsResolved");

            migrationBuilder.AlterColumn<int>(
                name: "BatchId",
                table: "StockTransactions",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "NewQuantity",
                table: "StockTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PreviousQuantity",
                table: "StockTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PurchaseItems",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<string>(
                name: "PredictionType",
                table: "PredictionResults",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "PredictionScore",
                table: "PredictionResults",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<string>(
                name: "Explanation",
                table: "PredictionResults",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<decimal>(
                name: "EstimatedDaysRemaining",
                table: "PredictionResults",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<decimal>(
                name: "AverageDailyConsumption",
                table: "PredictionResults",
                type: "decimal(18,2)",
                nullable: false,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<int>(
                name: "MedicineId1",
                table: "PredictionResults",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Alerts",
                table: "Batches",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "ApplicationUserId",
                table: "AuditLogs",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MedicineId",
                table: "Alerts",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MedicineId1",
                table: "Alerts",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_PredictionResults_MedicineId1",
                table: "PredictionResults",
                column: "MedicineId1");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_ApplicationUserId",
                table: "AuditLogs",
                column: "ApplicationUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Alerts_MedicineId1",
                table: "Alerts",
                column: "MedicineId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Alerts_Medicines_MedicineId1",
                table: "Alerts",
                column: "MedicineId1",
                principalTable: "Medicines",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AuditLogs_AspNetUsers_ApplicationUserId",
                table: "AuditLogs",
                column: "ApplicationUserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PredictionResults_Medicines_MedicineId1",
                table: "PredictionResults",
                column: "MedicineId1",
                principalTable: "Medicines",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alerts_Medicines_MedicineId1",
                table: "Alerts");

            migrationBuilder.DropForeignKey(
                name: "FK_AuditLogs_AspNetUsers_ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_PredictionResults_Medicines_MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropIndex(
                name: "IX_PredictionResults_MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropIndex(
                name: "IX_AuditLogs_ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropIndex(
                name: "IX_Alerts_MedicineId1",
                table: "Alerts");

            migrationBuilder.DropColumn(
                name: "NewQuantity",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "PreviousQuantity",
                table: "StockTransactions");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PurchaseItems");

            migrationBuilder.DropColumn(
                name: "MedicineId1",
                table: "PredictionResults");

            migrationBuilder.DropColumn(
                name: "Alerts",
                table: "Batches");

            migrationBuilder.DropColumn(
                name: "ApplicationUserId",
                table: "AuditLogs");

            migrationBuilder.DropColumn(
                name: "MedicineId1",
                table: "Alerts");

            migrationBuilder.RenameColumn(
                name: "Reason",
                table: "StockTransactions",
                newName: "ReferenceNumber");

            migrationBuilder.RenameColumn(
                name: "CreatedBy",
                table: "StockTransactions",
                newName: "PerformedBy");

            migrationBuilder.RenameColumn(
                name: "CreatedAt",
                table: "StockTransactions",
                newName: "TransactionDate");

            migrationBuilder.RenameIndex(
                name: "IX_StockTransactions_CreatedAt",
                table: "StockTransactions",
                newName: "IX_StockTransactions_TransactionDate");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Purchases",
                newName: "UpdatedBy");

            migrationBuilder.RenameColumn(
                name: "PredictedAt",
                table: "PredictionResults",
                newName: "PredictionDate");

            migrationBuilder.RenameIndex(
                name: "IX_PredictionResults_PredictedAt",
                table: "PredictionResults",
                newName: "IX_PredictionResults_PredictionDate");

            migrationBuilder.RenameColumn(
                name: "UnitCost",
                table: "Batches",
                newName: "PurchasePrice");

            migrationBuilder.RenameColumn(
                name: "IsResolved",
                table: "Alerts",
                newName: "IsDeleted");

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Suppliers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Suppliers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "BatchId",
                table: "StockTransactions",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "StockTransactions",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Purchases",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Purchases",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<string>(
                name: "PredictionType",
                table: "PredictionResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "PredictionScore",
                table: "PredictionResults",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<string>(
                name: "Explanation",
                table: "PredictionResults",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "EstimatedDaysRemaining",
                table: "PredictionResults",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AlterColumn<double>(
                name: "AverageDailyConsumption",
                table: "PredictionResults",
                type: "float",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddColumn<string>(
                name: "ConfirmedBy",
                table: "PredictionResults",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UserConfirmed",
                table: "PredictionResults",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Medicines",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Medicines",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Categories",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                table: "Batches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Batches",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PurchaseId",
                table: "Batches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UpdatedBy",
                table: "Batches",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "MedicineId",
                table: "Alerts",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<bool>(
                name: "IsActive",
                table: "Alerts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ResolvedBy",
                table: "Alerts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Batches_PurchaseId",
                table: "Batches",
                column: "PurchaseId");

            migrationBuilder.AddForeignKey(
                name: "FK_Batches_Purchases_PurchaseId",
                table: "Batches",
                column: "PurchaseId",
                principalTable: "Purchases",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
