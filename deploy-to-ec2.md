# Deploy Docker Image to EC2

This guide walks through deploying a Docker image from Amazon ECR to an EC2 instance.

## Prerequisites

- Docker image pushed to ECR (see [push-ecr.md](./push-ecr.md))
- AWS CLI installed and configured
- SSH key pair (or create one below)

---

## Step 1: Create a key pair (one-time)

```bash
aws ec2 create-key-pair --key-name yencloud-key --region eu-north-1 \
  --query 'KeyMaterial' --output text > yencloud-key.pem
chmod 400 yencloud-key.pem
```

This saves the private key locally so you can SSH into your instance.

---

## Step 2: Create a security group

```bash
aws ec2 create-security-group \
  --group-name yencloud-sg \
  --description "Security group for yencloud" \
  --region eu-north-1

# Save the returned GroupId, e.g. sg-xxxxxxxx
```

Open the ports you need:

```bash
# SSH
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx --protocol tcp --port 22 --cidr 0.0.0.0/0 \
  --region eu-north-1

# Web app (change if your app uses a different port)
aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx --protocol tcp --port 5000 --cidr 0.0.0.0/0 \
  --region eu-north-1
```

> ⚠️ Opening to `0.0.0.0/0` allows access from anywhere. For production, restrict to specific IPs.

---

## Step 3: Launch an EC2 instance

Find the latest Amazon Linux 2023 ECS-optimized AMI (comes with Docker pre-installed):

```bash
aws ec2 describe-images --region eu-north-1 --owners amazon \
  --filters "Name=name,Values=al2023-ami-ecs-hvm-*-kernel-6.1-arm64" \
  --query 'Images[*].[ImageId,Name]' --output text | sort -k2 | tail -1
```

Launch the instance:

```bash
aws ec2 run-instances \
  --image-id ami-xxxxxxxx \
  --instance-type t4g.micro \
  --key-name yencloud-key \
  --security-group-ids sg-xxxxxxxx \
  --subnet-id subnet-xxxxxxxx \
  --associate-public-ip-address \
  --region eu-north-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=yencloud}]'
```

> Use `t4g.micro` for arm64 AMIs (free tier). Use `t3.micro` for x86 AMIs.

---

## Step 4: Attach an IAM role for ECR access

The instance needs permission to pull images from ECR.

Create a role:

```bash
aws iam create-role --role-name yencloud-ec2-role \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{
      "Effect":"Allow",
      "Principal":{"Service":"ec2.amazonaws.com"},
      "Action":"sts:AssumeRole"
    }]
  }'
```

Attach the ECR read-only policy:

```bash
aws iam attach-role-policy \
  --role-name yencloud-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly
```

Create an instance profile and attach it to the instance:

```bash
aws iam create-instance-profile --instance-profile-name yencloud-ec2-profile
aws iam add-role-to-instance-profile \
  --instance-profile-name yencloud-ec2-profile \
  --role-name yencloud-ec2-role
aws ec2 associate-iam-instance-profile \
  --instance-id i-xxxxxxxx \
  --iam-instance-profile Name=yencloud-ec2-profile \
  --region eu-north-1
```

---

## Step 5: SSH into the instance

Get the public IP:

```bash
aws ec2 describe-instances --instance-ids i-xxxxxxxx --region eu-north-1 \
  --query 'Reservations[0].Instances[0].[PublicIpAddress]' --output text
```

SSH in:

```bash
ssh -i yencloud-key.pem ec2-user@<public-ip>  # requires yencloud-key.pem locally
```

---

## Step 6: Pull and run the container

On the instance, run:

```bash
# Authenticate Docker to ECR (IAM role handles credentials)
aws ecr get-login-password --region eu-north-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-north-1.amazonaws.com

# Pull the image
docker pull <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest

# Run it
docker run -d \
  --name yencloud \
  -p 5000:5000 \
  -e ALLOWED_HOSTS="localhost,127.0.0.1,<public-ip>" \
  <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest
```

Check it's running:

```bash
docker ps
curl -s http://localhost:5000
```

---

## Step 7: Visit your site

Open **http://<public-ip>:5000** in a browser. You should see **Hello world**.

---

## Clean up

To avoid ongoing charges, terminate the instance when done:

```bash
aws ec2 terminate-instances --instance-ids i-xxxxxxxx --region eu-north-1
aws ec2 delete-key-pair --key-name yencloud-key --region eu-north-1
aws ec2 delete-security-group --group-id sg-xxxxxxxx --region eu-north-1
```
