-- Midnight Maniac subscribers (SQL Server / T-SQL)
-- Minimal table for GDPR / CAN-SPAM compliant email collection with double opt-in.

IF OBJECT_ID(N'dbo.Midnight_Maniac_Subscribers', N'U') IS NOT NULL
    DROP TABLE dbo.Midnight_Maniac_Subscribers;
GO

CREATE TABLE dbo.Midnight_Maniac_Subscribers (
    id                      BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_Midnight_Maniac_Subscribers PRIMARY KEY,

    email                   NVARCHAR(254) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,

    -- Proof of consent (GDPR Art. 7)
    consent_given_at        DATETIMEOFFSET(3) NOT NULL,
    consent_ip              VARCHAR(45)       NULL,
    consent_source          NVARCHAR(100)     NOT NULL, -- e.g. 'footer_signup'

    -- Double opt-in
    confirmation_token      VARCHAR(64)       NULL,
    confirmation_sent_at    DATETIMEOFFSET(3) NULL,
    confirmed_at            DATETIMEOFFSET(3) NULL,

    -- Subscription state (0 = pending or unsubscribed, 1 = active)
    is_subscribed           BIT NOT NULL
        CONSTRAINT DF_Midnight_Maniac_Subscribers_is_subscribed DEFAULT (0),
    unsubscribed_at         DATETIMEOFFSET(3) NULL,

    -- Per-row token for one-click unsubscribe links (CAN-SPAM Sec. 5)
    unsubscribe_token       VARCHAR(64) NOT NULL,

    created_at              DATETIMEOFFSET(3) NOT NULL
        CONSTRAINT DF_Midnight_Maniac_Subscribers_created_at DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT UQ_Midnight_Maniac_Subscribers_email UNIQUE (email),
    CONSTRAINT UQ_Midnight_Maniac_Subscribers_unsub_token UNIQUE (unsubscribe_token)
);
GO

CREATE UNIQUE INDEX UX_Midnight_Maniac_Subscribers_confirmation_token
    ON dbo.Midnight_Maniac_Subscribers(confirmation_token)
    WHERE confirmation_token IS NOT NULL;
GO
