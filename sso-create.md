# Set Up AWS IAM Identity Center (SSO) CLI Profile

This guide creates an AWS CLI profile named `yentest` that uses browser-based SSO login - so you don't need long-lived access keys.

---

## Overview

```
Terminal: aws sso login --profile yentest
         └──> Browser opens → you log in
                  └──> CLI gets temporary credentials (valid for 1 hour)
                           └──> aws ssm, ec2, ecr commands work
```

---

## Step 1: Enable IAM Identity Center

**In the AWS Console:**

1. Go to **IAM Identity Center**
   - Direct link: `https://eu-north-1.console.aws.amazon.com/singlesignon/`
   - Or search "IAM Identity Center" in the Console
2. Click **Enable**
3. It will create an AWS Organization for you (this is automatic for standalone accounts)
4. Wait ~1-2 minutes
5. On the dashboard, **copy the AWS access portal URL**
   - It looks like `https://d-XXXXXXXXXX.awsapps.com/start`
   - You'll need this later

---

## Step 2: Create a user

**In the Console (IAM Identity Center > Users > Add user):**

| Field | Value |
|-------|-------|
| Username | `yentest-user` |
| Email address | Your email |
| First name | `yentest` |
| Last name | `user` |

Then:
1. Click **Next**
2. Choose **Send an email to the user** (or set a password manually)
3. Click **Next** → **Create user**

---

## Step 3: Create a permission set

**In the Console (IAM Identity Center > Permission sets > Create permission set):**

1. Select **Predefined permission set**
2. Choose **AdministratorAccess**
3. Click **Next**
4. Set **Session duration** to `1 hour`
5. Click **Next** → **Create**

---

## Step 4: Assign the user to your account

**In the Console (IAM Identity Center > AWS accounts):**

1. Check the box next to your account (`<account-id>`)  # replace with your AWS account ID
2. Click **Assign users or groups**
3. Select **yentest-user** → **Next**
4. Select **AdministratorAccess** permission set → **Next**
5. Click **Submit**

---

## Step 5: Configure the CLI profile

Run this in your terminal:

```bash
aws configure sso --profile yentest
```

It will ask interactively:

| Prompt | Your answer |
|--------|-------------|
| SSO session name | `yentest` |
| SSO start URL | `https://d-XXXXXXXXXX.awsapps.com/start` (from Step 1) |
| SSO region | `eu-north-1` |
| SSO registration scopes | (press Enter, defaults to `sso:account:access`) |

**A browser will pop up.** Log in with `yentest-user` and the password you set.

After the browser says "Success!", go back to the terminal and continue:

| Prompt | Your answer |
|--------|-------------|
| Account | `<account-id>` |
| Permission set | `AdministratorAccess` |
| Default region | `eu-north-1` |
| Default output format | `json` (press Enter) |

---

## Step 6: Test the profile

```bash
aws sts get-caller-identity --profile yentest
```

Expected output:

```json
{
    "UserId": "...",
    "Account": "<account-id>",
    "Arn": "arn:aws:iam::<account-id>:user/yentest-user"
}
```

---

## Day-to-day usage

Your session lasts 1 hour (from Step 3). When it expires:

```bash
aws sso login --profile yentest
```

This opens the browser again - no need to re-run `aws configure sso`.

---

## Using SSM with the SSO profile

All commands work the same, just add `--profile yentest`:

```bash
# Describe instances
aws ec2 describe-instances --profile yentest --region eu-north-1

# SSM Run Command
aws ssm send-command \
  --profile yentest --region eu-north-1 \
  --document-name "AWS-RunShellScript" \
  --instance-ids <instance-id> \
  --parameters 'commands=["docker ps"]'

# Later: connect to a database via SSM
aws ssm start-session \
  --profile yentest --region eu-north-1 \
  --target <instance-id>
```

---

## What the config file looks like

After setup, `~/.aws/config` will have something like:

```ini
[profile yentest]
sso_session = yentest
sso_account_id = <account-id>
sso_role_name = AdministratorAccess
region = eu-north-1
output = json

[sso-session yentest]
sso_region = eu-north-1
sso_start_url = https://d-XXXXXXXXXX.awsapps.com/start
sso_registration_scopes = sso:account:access
```

And `~/.aws/sso/cache/` will hold the temporary credentials.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `An error occurred (AccessDeniedException)` | Make sure you assigned the user to the account in Step 4 |
| Browser doesn't pop up | Run `aws sso login --profile yentest` manually |
| `The SSO session associated with this profile has expired` | Run `aws sso login --profile yentest` to refresh |
| Can't find IAM Identity Center in Console | Make sure you're in `eu-north-1` region |
