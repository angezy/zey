
CREATE TABLE dbo.BlogPosts_tbl (
    postId INT IDENTITY(1,1) PRIMARY KEY,  -- Auto-incremented primary key
    Title NVARCHAR(255) NOT NULL,         -- Title of the blog post (max 255 characters)
    Description NVARCHAR(500),            -- Short description (optional, max 500 characters)
    Imag NVARCHAR(255),                   -- Image URL or path (optional, max 255 characters)
    Contents NVARCHAR(MAX) NOT NULL,      -- Full blog content (unlimited length)
    CreatedAt DATETIME DEFAULT GETDATE()  -- Creation timestamp with default value
);