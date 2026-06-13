#!/bin/sh
set -e

SSM_PATH="${SSM_PARAMETER_PATH:-/yencloud/production}"

echo "=== Fetching secrets from SSM (${SSM_PATH}) ==="

# Dump parameters to a temp file, then source it
TMPFILE=$(mktemp)
aws ssm get-parameters-by-path \
  --path "${SSM_PATH}" \
  --with-decryption \
  --region "${AWS_REGION:-eu-north-1}" \
  --query "Parameters[*].[Name,Value]" \
  --output text > "$TMPFILE"

while IFS=$'\t' read -r name value; do
  key=$(echo "$name" | sed 's|.*/||')
  export "$key=$value"
  echo "  Exported: $key"
done < "$TMPFILE"

rm -f "$TMPFILE"

echo "=== Starting server ==="
exec node server.js
