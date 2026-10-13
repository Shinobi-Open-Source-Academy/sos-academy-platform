// Commit messages (and PR titles) drive releases via semantic-release, so they must follow
// Conventional Commits: feat -> minor, fix/perf -> patch, "!" or BREAKING CHANGE -> major.
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Bot-generated bodies and pasted stack traces routinely exceed the default 100 columns.
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
};
