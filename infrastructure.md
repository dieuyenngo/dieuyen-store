# Infrastructure Guide

## S3 Bucket

### Name
`yencloud-assets-<account-id>` - region `eu-north-1`

### Folder Structure

```
yencloud-assets-<account-id>/
├── products/
│   ├── images/         # Original product images (uploaded via /api/uploads)
│   └── thumbs/         # Thumbnails (reserved for future use)
└── orders/
    └── invoices/       # Order invoices (reserved for future use)
```

### Upload URL Format

```
https://yencloud-assets-<account-id>.s3.eu-north-1.amazonaws.com/products/images/<uuid>.<ext>
```

### Security

- **Public access blocked** - no direct public listing
- **Server-side encryption** - AES-256 enabled
- **Access restricted to IAM role** - only `yencloud-ec2-role` can write via `s3:PutObject`
- Files are served via the application, not directly from S3

### Uploading via the App

```bash
# Admin dashboard > Products > Add/Edit > upload image
# Or via API:
curl -X POST http://localhost:5000/api/uploads \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -F "image=@/path/to/photo.jpg"
```

Returns: `{ "url": "https://..." }`

---

## SSM Parameter Store

### Path Convention (per tenant)

```
/yencloud/{environment}/{KEY_NAME}
```

| Segment | Example | Description |
|---------|---------|-------------|
| Tenant | `yencloud` | Project name / tenant identifier |
| Environment | `production`, `staging`, `dev` | Deployment stage |
| Key | `ADMIN_API_KEY` | The parameter name |

### Stored Parameters

| Path | Type | Description |
|------|------|-------------|
| `/yencloud/production/ADMIN_API_KEY` | `SecureString` | Admin dashboard bearer token |
| `/yencloud/production/S3_BUCKET_NAME` | `String` | S3 bucket for uploads |
| `/yencloud/production/AWS_REGION` | `String` | AWS region |

### Managing Parameters

```bash
# Create/update a secret
aws ssm put-parameter \
  --name "/yencloud/production/MY_SECRET" \
  --value "secret-value" \
  --type SecureString \
  --region eu-north-1 \
  --overwrite

# Create/update a plain config
aws ssm put-parameter \
  --name "/yencloud/production/MY_CONFIG" \
  --value "config-value" \
  --type String \
  --region eu-north-1 \
  --overwrite

# Read a parameter
aws ssm get-parameter \
  --name "/yencloud/production/ADMIN_API_KEY" \
  --with-decryption \
  --region eu-north-1 \
  --query "Parameter.Value" \
  --output text

# List all parameters for this tenant
aws ssm get-parameters-by-path \
  --path "/yencloud/production" \
  --recursive \
  --region eu-north-1
```

### How the App Loads Secrets

At startup, `backend/config.js`:

1. Reads `SSM_PARAMETER_PATH` env var (defaults to `/yencloud/production`)
2. Calls `ssm:GetParametersByPath` to fetch all parameters under that path
3. For each parameter not already set as an env var, exports it to `process.env`
4. Falls back silently if AWS credentials are unavailable (local dev)

This means:
- **In production** (EC2 + IAM role): secrets automatically loaded from SSM
- **In local dev** (no AWS creds): uses `.env` file or docker-compose env vars

### IAM Permissions

The instance role (`yencloud-ec2-role`) has these SSM permissions:

```json
{
  "Effect": "Allow",
  "Action": ["ssm:GetParameter", "ssm:GetParametersByPath"],
  "Resource": "arn:aws:ssm:eu-north-1:<account-id>:parameter/yencloud/*"
}
```

---

## Adding a New Tenant

To add a new project/tenant:

1. **Create SSM parameters** under `/new-tenant/production/`
2. **Create an S3 bucket** `new-tenant-assets-<account-id>`
3. **Add IAM policies** for the new bucket and SSM path
4. **Set `SSM_PARAMETER_PATH=/new-tenant/production`** in the container env
