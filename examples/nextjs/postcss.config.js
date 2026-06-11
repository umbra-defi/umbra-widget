// The example imports the widget's PRE-BUILT css (Tailwind already compiled) and
// uses only plain CSS itself — so no PostCSS plugins are needed. This file also
// stops Next from walking up the tree and picking the widget repo's own
// (ESM, Tailwind) postcss config, which it can't read here.
module.exports = { plugins: {} }
