CREATE TABLE dbo.contacts_tbl (
    ContactID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing primary key
    FacebookName NVARCHAR(255) NOT NULL,    -- Stores the Facebook name
    ChatResult NVARCHAR(MAX) NOT NULL,      -- Stores the chat result
    Email NVARCHAR(255),                    -- Stores the email (optional)
    PhoneNumber NVARCHAR(50),               -- Stores the phone number (optional)
    Role NVARCHAR(100) NOT NULL,            -- Stores the role (e.g., Disposition Wholesaler, Acquisition Wholesaler, etc.)
    SpecificRole NVARCHAR(255)              -- Stores a specific role (if "Other" is selected)
);
