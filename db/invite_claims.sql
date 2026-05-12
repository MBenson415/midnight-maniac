-- Midnight Maniac invite-reward claims (SQL Server / T-SQL)
-- One-per-email gated download for the "invite friends to the FB page" campaign.

IF OBJECT_ID(N'dbo.Midnight_Maniac_Invite_Claims', N'U') IS NOT NULL
    DROP TABLE dbo.Midnight_Maniac_Invite_Claims;
GO

CREATE TABLE dbo.Midnight_Maniac_Invite_Claims (
    id                  BIGINT IDENTITY(1,1) NOT NULL
        CONSTRAINT PK_Midnight_Maniac_Invite_Claims PRIMARY KEY,

    email               NVARCHAR(254) COLLATE SQL_Latin1_General_CP1_CI_AS NOT NULL,

    claim_token         VARCHAR(64) NOT NULL,

    attested_at         DATETIMEOFFSET(3) NOT NULL,
    attested_ip         VARCHAR(45) NULL,

    expires_at          DATETIMEOFFSET(3) NOT NULL,
    claimed_at          DATETIMEOFFSET(3) NULL,

    created_at          DATETIMEOFFSET(3) NOT NULL
        CONSTRAINT DF_Midnight_Maniac_Invite_Claims_created_at DEFAULT (SYSDATETIMEOFFSET()),

    CONSTRAINT UQ_Midnight_Maniac_Invite_Claims_email UNIQUE (email),
    CONSTRAINT UQ_Midnight_Maniac_Invite_Claims_token UNIQUE (claim_token)
);
GO
