CREATE TABLE dbo.kanban_tbl (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    FacebookName NVARCHAR(255) NOT NULL,
    ChatResult NVARCHAR(MAX) NOT NULL,
    ChatDate DATETIME NOT NULL DEFAULT GETDATE(),
    Email NVARCHAR(255) NULL,
    PhoneNumber NVARCHAR(50) NULL
     Role NVARCHAR(50), -- Adjust the size and type as needed
    SpecificRole NVARCHAR(MAX); -- Adjust the size and type as needed
);
