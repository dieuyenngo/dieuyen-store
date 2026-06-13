import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";
import dotenv from "dotenv";

dotenv.config();

const SSM_PATH = process.env.SSM_PARAMETER_PATH || "/yencloud/production";
const AWS_REGION = process.env.AWS_REGION || "eu-north-1";

let loaded = false;

export async function loadSecrets() {
  if (loaded) return;
  loaded = true;

  try {
    const ssm = new SSMClient({ region: AWS_REGION });
    const cmd = new GetParametersByPathCommand({
      Path: SSM_PATH,
      WithDecryption: true,
      Recursive: false,
    });
    const result = await ssm.send(cmd);

    for (const param of result.Parameters || []) {
      const key = param.Name.split("/").pop();
      if (!process.env[key]) {
        process.env[key] = param.Value;
        console.log(`  Config loaded: ${key}`);
      }
    }
  } catch (err) {
    if (err.name === "CredentialsProviderError") {
      console.log("  SSM skipped (no AWS credentials available)");
    } else {
      console.log(`  SSM skipped (${err.message})`);
    }
  }
}
