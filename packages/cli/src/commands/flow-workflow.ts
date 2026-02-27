import { Command } from 'commander';
import pc from 'picocolors';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { header, success, warn, info, metric } from '../utils/display.js';

interface TaskState {
  task: string;
  startedAt: string;
  currentStep: number;
  steps: string[];
  completedSteps: string[];
}

const TASK_FILE = '.vibe/current-task.json';

function loadTask(): TaskState | null {
  if (!existsSync(TASK_FILE)) return null;
  return JSON.parse(readFileSync(TASK_FILE, 'utf-8')) as TaskState;
}

function saveTask(task: TaskState): void {
  if (!existsSync('.vibe')) mkdirSync('.vibe', { recursive: true });
  writeFileSync(TASK_FILE, JSON.stringify(task, null, 2));
}

export const flowCommand = new Command('flow')
  .description('AI Coding workflow — plan, implement, verify, commit')
  .argument('[action]', 'start <task> | step | quality | done | status', 'status')
  .argument('[task]', 'Task description (for start action)')
  .action(async (action: string, task?: string) => {
    header('AI Coding Flow');

    if (action === 'start') {
      if (!task) {
        warn('Usage: vibe flow start "implement user preferences API"');
        return;
      }
      const steps = [
        'Analyze: understand requirements and affected files',
        'Design: plan the implementation approach',
        'Implement: write the code with AI assistance',
        'Test: verify with `vibe guard` and run tests',
        'Review: check boundary conditions with `vibe boundary`',
        'Commit: create clean commit with descriptive message',
      ];

      const state: TaskState = {
        task,
        startedAt: new Date().toISOString(),
        currentStep: 0,
        steps,
        completedSteps: [],
      };
      saveTask(state);

      success(`Flow started: ${task}`);
      console.log();
      console.log(pc.bold('  Workflow Steps:'));
      for (let i = 0; i < steps.length; i++) {
        const prefix = i === 0 ? pc.cyan('→') : pc.dim('  ');
        console.log(`  ${prefix} ${i + 1}. ${steps[i]}`);
      }
      console.log();
      info('Run `vibe flow step` to proceed to next step');
      info('Run `vibe prompt "<subtask>" --file <path>` to generate AI prompts');
      return;
    }

    if (action === 'step') {
      const state = loadTask();
      if (!state) { warn('No active flow. Run `vibe flow start "<task>"`'); return; }

      if (state.currentStep >= state.steps.length) {
        success('All steps completed! Run `vibe flow done` to finish.');
        return;
      }

      const step = state.steps[state.currentStep]!;
      state.completedSteps.push(step);
      state.currentStep++;
      saveTask(state);

      success(`Completed: ${step}`);
      if (state.currentStep < state.steps.length) {
        console.log(`  ${pc.cyan('→')} Next: ${state.steps[state.currentStep]}`);

        if (state.currentStep === 2) info('Use `vibe prompt "<subtask>" --file <path>` for AI assistance');
        if (state.currentStep === 3) info('Run `vibe guard` to check code quality');
        if (state.currentStep === 4) info('Run `vibe boundary <file>` to check edge cases');
      } else {
        info('All steps done! Run `vibe flow done` to finish.');
      }
      return;
    }

    if (action === 'quality') {
      info('Running quality check on current work...');
      info('Use `vibe guard` for detailed quality analysis.');
      return;
    }

    if (action === 'done') {
      const state = loadTask();
      if (!state) { warn('No active flow.'); return; }

      const duration = Math.round((Date.now() - new Date(state.startedAt).getTime()) / 60000);
      success(`Flow completed: ${state.task}`);
      metric('Duration', `${duration} minutes`);
      metric('Steps completed', `${state.completedSteps.length}/${state.steps.length}`);
      console.log();
      info('Suggested commit message:');
      console.log(`  ${pc.green(`feat: ${state.task}`)}`);

      // Cleanup
      if (existsSync(TASK_FILE)) {
        const { unlinkSync } = await import('fs');
        unlinkSync(TASK_FILE);
      }
      return;
    }

    // status (default)
    const state = loadTask();
    if (!state) {
      info('No active flow. Start one with `vibe flow start "<task>"`');
      return;
    }
    console.log(`  Task: ${pc.bold(state.task)}`);
    console.log(`  Started: ${state.startedAt.split('T')[0]}`);
    console.log(`  Progress: ${state.currentStep}/${state.steps.length}`);
    if (state.currentStep < state.steps.length) {
      console.log(`  Current: ${pc.cyan(state.steps[state.currentStep]!)}`);
    }
  });
