# Configure AWS Systems Manager Fleet Manager

Fleet Manager lets you manage EC2 instances from the AWS Console without needing to SSH - you can view files, check processes, run Docker commands, and patch instances.

---

## How it works

```
       AWS Console
           │
   Systems Manager (SSM)
           │
   SSM Agent (on instance)
           │
    Your EC2 Instance
```

The instance runs the **SSM Agent** (pre-installed on Amazon Linux 2023). It communicates with AWS Systems Manager using an **IAM role** you attach to the instance.

---

## Step 1: Ensure SSM Agent is running

On your EC2 instance (SSH in first):

```bash
sudo systemctl status amazon-ssm-agent
```

It should show `active (running)`. If not:

```bash
sudo systemctl start amazon-ssm-agent
sudo systemctl enable amazon-ssm-agent
```

> Amazon Linux 2023 ECS-optimized AMI has it pre-installed and enabled.

---

## Step 2: Attach SSM IAM policy

If you already have an IAM role for your instance, attach the SSM policy:

```bash
aws iam attach-role-policy \
  --role-name yencloud-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

If you don't have a role yet, create one and attach it to the instance (see [deploy-to-ec2.md](./deploy-to-ec2.md), Step 4).

---

## Step 3: Verify the instance appears in SSM

```bash
aws ssm describe-instance-information --region eu-north-1
```

Look for `"PingStatus": "Online"`. If it's missing, restart the SSM agent on the instance:

```bash
# via SSH
ssh -i yencloud-key.pem ec2-user@<ip>
sudo systemctl restart amazon-ssm-agent
```

Then wait ~10 seconds and check again.

---

## Step 4: Using Fleet Manager (AWS Console)

1. Open AWS Console → **Systems Manager** → **Fleet Manager** (left sidebar)
2. You'll see your instance (`<instance-id>`)
3. Click the **instance ID** to manage it

From here you can:

| Feature | What you can do |
|---------|----------------|
| **File System** | Browse directories, upload/download files |
| **Processes** | See running processes (including Docker containers) |
| **Registry** | View OS-level configuration |
| **Windows Events** | (Windows only) |

---

## Step 5: Run Docker commands via Run Command

You can inspect your container without SSH.

### Via Console

1. Systems Manager → **Run Command**
2. Click **Run command**
3. Search for `AWS-RunShellScript`
4. Paste your command: `docker ps`
5. Select your instance and click **Run**

### Via CLI

```bash
# Check running containers
aws ssm send-command \
  --document-name "AWS-RunShellScript" \
  --instance-ids <instance-id> \
  --parameters 'commands=["docker ps"]' \
  --region eu-north-1

# Get the output (use the CommandId from the response)
aws ssm get-command-invocation \
  --command-id <command-id> \
  --instance-id <instance-id> \
  --region eu-north-1 \
  --query 'StandardOutputContent' --output text
```

### Useful Docker commands for Fleet Manager

```bash
# List containers
docker ps -a

# See logs
docker logs yencloud

# Restart container
docker restart yencloud

# Stop container
docker stop yencloud

# Start container
docker start yencloud

# Pull latest image and restart
docker pull <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest
docker stop yencloud && docker rm yencloud
docker run -d --name yencloud -p 5000:5000 \
  -e ALLOWED_HOSTS="localhost,127.0.0.1,<public-ip>" \
  <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest

# Update ALLOWED_HOSTS on a running container
docker run -d --name yencloud --restart unless-stopped -p 5000:5000 \
  -e ALLOWED_HOSTS="localhost,127.0.0.1,<new-ip>" \
  <account-id>.dkr.ecr.eu-north-1.amazonaws.com/yencloud:latest
```

---

## Step 6 (Bonus): Session Manager - SSH without key pairs

Session Manager lets you open a shell in the AWS Console without needing the `.pem` key file.

1. Systems Manager → **Session Manager** → **Start session**
2. Select your instance
3. You get a browser-based terminal - no SSH key needed

To make this work, add this policy to your IAM role too:

```bash
aws iam attach-role-policy \
  --role-name yencloud-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
```

> Already done if you completed Step 2 above. Session Manager should work immediately.

---

## Diagram: All components together

```
┌─────────────────────────────────────────────────────┐
│                  AWS Console                         │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Fleet Manager │  │ Run Command  │  │  Session  │  │
│  │ (files/procs) │  │ (docker ps)  │  │  Manager  │  │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘  │
│         │                  │                │         │
└─────────┼──────────────────┼────────────────┼─────────┘
          │                  │                │
          └──────────────────┼────────────────┘
                             │
                    Systems Manager (SSM)
                             │
                    ┌────────┴────────┐
                    │  SSM Agent      │
                    │  (on EC2)       │
                    │                 │
                    │  ┌───────────┐  │
                    │  │  Docker   │  │
                    │  │ yencloud  │  │
                    │  └───────────┘  │
                    └────────────────┘
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Instance not showing in Fleet Manager | Wait 1-2 min after attaching IAM policy, then restart SSM agent: `sudo systemctl restart amazon-ssm-agent` |
| "AccessDenied" when calling SSM APIs | Check the IAM role has `AmazonSSMManagedInstanceCore` attached |
| Session Manager connection fails | Ensure the instance has outbound internet access (public IP or NAT Gateway) |
| Docker command not found in Run Command | Use the full path or check Docker is installed: `which docker` |
