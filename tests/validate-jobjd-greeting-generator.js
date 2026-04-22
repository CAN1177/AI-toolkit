const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const skillDir = path.join(__dirname, '..', 'skills', 'JobJD-Greeting-Generator');
const skillFile = path.join(skillDir, 'SKILL.md');
const readmeFile = path.join(skillDir, 'README.md');

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

assert.ok(fs.existsSync(skillFile), 'Expected SKILL.md for JobJD-Greeting-Generator to exist');
assert.ok(fs.existsSync(readmeFile), 'Expected README.md for JobJD-Greeting-Generator to exist');

const skill = read(skillFile);
const readme = read(readmeFile);

assert.match(skill, /^---\nname: JobJD-Greeting-Generator\n/m, 'SKILL.md should declare the skill name');
assert.match(skill, /jd_url/i, 'SKILL.md should mention jd_url as a primary input');
assert.match(skill, /third-party|readability/i, 'SKILL.md should require a staged fallback extraction strategy');
assert.match(skill, /only ask.*jd_text|再.*jd_text/i, 'SKILL.md should ask for jd_text only after extraction fallback fails');
assert.match(skill, /默认只输出最终话术|只返回 1 条最终可复制版本|one final copy-ready greeting/i, 'SKILL.md should default to one final greeting');
assert.match(skill, /不捏造|do not invent/i, 'SKILL.md should forbid fabricating candidate details');
assert.match(
  skill,
  /问好.*年限.*优势|年限\/方向.*最强优势|years or direction plus strongest match advantage/i,
  'SKILL.md should require a direct opening with greeting, experience or direction, and strongest advantage',
);
assert.match(
  skill,
  /不要.*看到贵司正在招聘|do not open with "I noticed your company is hiring/i,
  'SKILL.md should forbid generic job-post openings',
);
assert.match(
  skill,
  /以下是我的简历，盼回复|简历附上，盼您回复|concise.*resume-forward close/i,
  'SKILL.md should require a concise resume-forward close',
);

assert.match(readme, /^# JobJD-Greeting-Generator$/m, 'README.md should have the skill title');
assert.match(readme, /jd_url/i, 'README.md should explain jd_url-first usage');
assert.match(readme, /follow_up_read/i, 'README.md should document follow_up_read');
assert.match(readme, /follow_up_silent/i, 'README.md should document follow_up_silent');
assert.match(readme, /BOSS直聘|智联招聘|前程无忧/i, 'README.md should mention supported recruiting platforms');
assert.match(
  readme,
  /问好.*年限.*优势|首句.*价值|greeting plus experience or direction plus strongest advantage/i,
  'README.md should describe the direct value-first opening',
);
assert.match(
  readme,
  /以下是我的简历，盼回复|简历附上，盼您回复|resume-forward close/i,
  'README.md should document the concise resume-forward closing',
);

console.log('JobJD-Greeting-Generator skill validation passed');
