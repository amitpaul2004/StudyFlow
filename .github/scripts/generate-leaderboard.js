// Generates .github/LEADERBOARD.md from the repo's contributor stats.
// Runs on GitHub Actions (Node 20+, global fetch available).
// Env:
//   GITHUB_TOKEN      - token for the GitHub API (provided by Actions)
//   GITHUB_REPOSITORY - "owner/repo" (provided by Actions)

const repo = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;

if (!repo) {
  console.error("GITHUB_REPOSITORY is not set");
  process.exit(1);
}

const API = "https://api.github.com";
const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "studyflow-leaderboard",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

// Walk every page of the contributors endpoint (sorted by commit count desc).
async function fetchContributors() {
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const url = `${API}/repos/${repo}/contributors?per_page=100&page=${page}&anon=0`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
    }
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    out.push(...batch);
    if (batch.length < 100) break;
  }
  // Exclude bots, keep humans, sort by contributions descending.
  return out
    .filter((c) => c.type !== "Bot" && !/\[bot\]$/i.test(c.login || ""))
    .sort((a, b) => b.contributions - a.contributions);
}

function medal(rank) {
  return ["🥇", "🥈", "🥉"][rank] || `#${rank + 1}`;
}

function render(contributors) {
  const total = contributors.reduce((s, c) => s + c.contributions, 0) || 1;
  const stamp = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

  const rows = contributors.map((c, i) => {
    const share = ((c.contributions / total) * 100).toFixed(1);
    const avatar = `<img src="${c.avatar_url}&s=40" width="32" height="32" alt="${c.login}" />`;
    return `| ${medal(i)} | ${avatar} | [@${c.login}](${c.html_url}) | ${c.contributions} | ${share}% |`;
  });

  return `# 🏆 StudyFlow Contributors Leaderboard

> Ranked by number of commits to this repository.
> Auto-generated — last updated **${stamp}**.

| Rank | | Contributor | Commits | Share |
| :--: | :--: | :-- | --: | --: |
${rows.join("\n")}

---

**${contributors.length}** contributors · **${total}** total commits

<sub>Updated automatically every 6 hours by [\`leaderboard.yml\`](workflows/leaderboard.yml). Want to climb the board? See [CONTRIBUTING.md](../CONTRIBUTING.md).</sub>
`;
}

async function main() {
  const contributors = await fetchContributors();
  if (contributors.length === 0) {
    console.error("No contributors returned from the API");
    process.exit(1);
  }
  const md = render(contributors);
  const fs = await import("node:fs/promises");
  await fs.writeFile(".github/LEADERBOARD.md", md);
  console.log(`Wrote .github/LEADERBOARD.md with ${contributors.length} contributors`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
