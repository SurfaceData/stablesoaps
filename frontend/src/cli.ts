import sample from "@stdlib/random-sample";
import axios from "axios";
import { Command } from "commander";
import chalk from "chalk";
import ProgressBar from "progress";
import { writeFileSync, readFileSync } from "fs";
import Sqids from "sqids";

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const program = new Command();

// Configure the CLI
program
  .name("soap-tools")
  .description("CLI tools for Stable Soap Operations")
  .version("1.0.0");

// Define types for command options
interface JSONLoadOptions {
  path: string;
}

interface IPLabelScenePrompt {
  id: number;
  scene_id: number;
  prompt: string;
  theme: string;
}

interface LabelScenePrompt {
  id: number;
  sceneId: number;
  prompt: string;
  theme: string;
}

program
  .command("load-label-scene-prompts")
  .description("Loads Label Scene Prompts into the database")
  .requiredOption("-p, --path <path>", "Style JSON file path")
  .action(async (options: JSONLoadOptions) => {
    const prompts: IPLabelScenePrompt[] = JSON.parse(
      readFileSync(options.path, "utf-8")
    );
    const result = await db.labelScenePrompt.createMany({
      data: prompts.map(
        ({ prompt, theme, id, scene_id }) =>
          ({
            id,
            sceneId: scene_id,
            prompt,
            theme,
          } as LabelScenePrompt)
      ),
    });
    console.log(result);
  });

interface LabelStyle {
  id: number;
  name: string;
  text: string;
}

program
  .command("load-label-styles")
  .description("Loads Label Styles into the database")
  .requiredOption("-p, --path <path>", "Style JSON file path")
  .action(async (options: JSONLoadOptions) => {
    const styles: LabelStyle[] = JSON.parse(
      readFileSync(options.path, "utf-8")
    );
    const result = await db.labelStyle.createMany({
      data: styles,
    });
    console.log(result);
  });

interface CreateBatchLabelsOptions {
  batch: number;
}

interface BatchSoapLabel {
  prompt: string;
  magicCode: string;
  imagePath: string;
  batchId: number;
  labelSceneId: number;
  labelStyleId: number;
}

program
  .command("create-batch-labels")
  .description("Creates Batch Labels")
  .requiredOption("-b, --batch <batch id>", "Batch ID", parseInt)
  .action(async (options: CreateBatchLabelsOptions) => {
    const sqids = new Sqids();
    const batch = await db.batch.findUnique({
      where: { id: options.batch },
    });
    if (!batch) {
      throw new Error("No batch found");
    }

    const labelStyles = await db.labelStyle.findMany();
    const labelScenePrompt = await db.labelScenePrompt.findMany();
    const sampledScenePrompt = sample(labelScenePrompt, { size: 1 })[0];
    const sampledStyles = sample(labelStyles, { size: batch.numBars });

    const labels: BatchSoapLabel[] = [];
    await db.batchSoapLabel.deleteMany({
      where: { batchId: batch.id },
    });
    const bar = new ProgressBar(":bar :percent :etas", {
      total: batch.numBars,
      width: 40,
    });

    for (var i = 0; i < batch.numBars; ++i) {
      const style = sampledStyles[i];
      const prompt = `${sampledScenePrompt.prompt}  ${style.text}`;
      const magicCode = sqids.encode([
        batch.id,
        sampledScenePrompt.sceneId,
        sampledScenePrompt.id,
        style.id,
        i,
      ]);

      const imageResult = await axios.post(
        `${process.env.IMAGE_GEN_URL}/txt2img`,
        {
          prompt: prompt,
          num_inference_steps: 5,
        },
        { responseType: "arraybuffer" }
      );
      const imagePath = `public/img/${magicCode}.png`;
      writeFileSync(imagePath, imageResult.data);

      const label: BatchSoapLabel = {
        magicCode,
        imagePath,
        prompt,
        batchId: batch.id,
        labelSceneId: sampledScenePrompt.id,
        labelStyleId: style.id,
      };
      labels.push(label);
      bar.tick();
    }
    const results = await db.batchSoapLabel.createMany({
      data: labels,
    });
    console.log(results);
  });

program.parse();
