# Push Docker Image to Amazon ECR

This guide walks through pushing a local Docker image to Amazon Elastic Container Registry (ECR).

## Prerequisites

- Docker installed
- AWS CLI installed and configured (`aws configure`)

## Steps

### 1. Set your AWS region

```bash
export AWS_REGION=eu-north-1
```

### 2. Create an ECR repository

```bash
aws ecr create-repository --repository-name yencloud --region $AWS_REGION
```

This creates a repository in your AWS account. The output includes a `repositoryUri` that looks like:

```
<account-id>.dkr.ecr.<region>.amazonaws.com/yencloud
```

### 3. Authenticate Docker to ECR

```bash
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com
```

This generates a temporary authentication token and passes it to Docker so you can push/pull from your private ECR repo.

### 4. Tag your local image for ECR

```bash
docker tag yencloud:latest <account-id>.dkr.ecr.<region>.amazonaws.com/yencloud:latest
```

Docker tags are like aliases. This gives your local `yencloud:latest` image a new tag pointing at the ECR repo.

### 5. Push the image

```bash
docker push <account-id>.dkr.ecr.<region>.amazonaws.com/yencloud:latest
```

### 6. Verify

```bash
aws ecr describe-images --repository-name yencloud --region $AWS_REGION
```

Check the AWS Console too: **ECR > Repositories > yencloud**.

## Summary of commands (all together)

```bash
# Set your account ID and region
ACCOUNT_ID=<your-account-id>  # e.g. 183992492271
AWS_REGION=eu-north-1

# Create repo (one-time setup)
aws ecr create-repository --repository-name yencloud --region $AWS_REGION

# Login
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Tag & push
docker tag yencloud:latest $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yencloud:latest
docker push $ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/yencloud:latest
```

> Replace `<account-id>` and `<region>` with your own values.
