import simpleGit from 'simple-git';

export async function getStagedFiles(): Promise<string[]> {
  const git = simpleGit();
  const status = await git.status();
  return [...status.staged, ...status.created.filter(f => status.staged.includes(f))];
}

export async function getModifiedFiles(): Promise<string[]> {
  const git = simpleGit();
  const status = await git.status();
  return [...status.modified, ...status.created, ...status.staged];
}

export async function getCurrentBranch(): Promise<string> {
  const git = simpleGit();
  const branch = await git.branch();
  return branch.current;
}

export async function getRepoRoot(): Promise<string> {
  const git = simpleGit();
  return git.revparse(['--show-toplevel']);
}
