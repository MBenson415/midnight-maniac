-- Adds double opt-in columns to an existing Midnight_Maniac_Subscribers table.
-- Safe to run once; wrapped in existence checks.

IF COL_LENGTH('dbo.Midnight_Maniac_Subscribers', 'confirmation_token') IS NULL
BEGIN
    ALTER TABLE dbo.Midnight_Maniac_Subscribers
        ADD confirmation_token VARCHAR(64) NULL;
END
GO

IF COL_LENGTH('dbo.Midnight_Maniac_Subscribers', 'confirmation_sent_at') IS NULL
BEGIN
    ALTER TABLE dbo.Midnight_Maniac_Subscribers
        ADD confirmation_sent_at DATETIMEOFFSET(3) NULL;
END
GO

IF COL_LENGTH('dbo.Midnight_Maniac_Subscribers', 'confirmed_at') IS NULL
BEGIN
    ALTER TABLE dbo.Midnight_Maniac_Subscribers
        ADD confirmed_at DATETIMEOFFSET(3) NULL;
END
GO

-- New signups should start unsubscribed until they click the email link.
IF EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE name = 'DF_Midnight_Maniac_Subscribers_is_subscribed'
)
BEGIN
    ALTER TABLE dbo.Midnight_Maniac_Subscribers
        DROP CONSTRAINT DF_Midnight_Maniac_Subscribers_is_subscribed;
END
GO

ALTER TABLE dbo.Midnight_Maniac_Subscribers
    ADD CONSTRAINT DF_Midnight_Maniac_Subscribers_is_subscribed DEFAULT (0) FOR is_subscribed;
GO

-- Unique index on confirmation_token so the confirm endpoint can look up by token.
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = 'UX_Midnight_Maniac_Subscribers_confirmation_token'
      AND object_id = OBJECT_ID('dbo.Midnight_Maniac_Subscribers')
)
BEGIN
    CREATE UNIQUE INDEX UX_Midnight_Maniac_Subscribers_confirmation_token
        ON dbo.Midnight_Maniac_Subscribers(confirmation_token)
        WHERE confirmation_token IS NOT NULL;
END
GO
