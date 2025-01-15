CREATE TABLE dbo.listings_tbl (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(255) NOT NULL,
    Email NVARCHAR(255) NOT NULL,
    Phone NVARCHAR(50) NOT NULL,
    PropertyAddress NVARCHAR(255) NOT NULL,
    PropertyType NVARCHAR(100) NOT NULL,
    Bedrooms INT,
    Bathrooms INT,
    SquareFootage INT,
    AskingPrice MONEY,
    Description NVARCHAR(MAX),
    ReasonForSelling NVARCHAR(255),
    SubmitDate DATETIME NOT NULL DEFAULT GETDATE()
);
