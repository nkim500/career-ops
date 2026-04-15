# Changelog

## [1.6.0](https://github.com/nkim500/career-ops/compare/v1.5.0...v1.6.0) (2026-04-15)


### Features

* **scan:** add location_filter to portals.yml schema ([707e3f2](https://github.com/nkim500/career-ops/commit/707e3f25adb0df642f44b9efec1b471314f54812))


### Reverts

* scan location_filter (moving to user layer) ([4023e3b](https://github.com/nkim500/career-ops/commit/4023e3b89933126f1cb5f9a50c314e22beab205a))

## [1.5.0](https://github.com/nkim500/career-ops/compare/v1.4.0...v1.5.0) (2026-04-14)


### Features

* adapt contacto mode by contact type (recruiter/HM/peer/interviewer) ([9fd5a90](https://github.com/nkim500/career-ops/commit/9fd5a90896f20020f48455cd079b64fed491b89f))
* add --min-score flag to batch runner ([#249](https://github.com/nkim500/career-ops/issues/249)) ([cb0c7f7](https://github.com/nkim500/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/nkim500/career-ops/issues/287)) ([e71595f](https://github.com/nkim500/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* add add/list/done verbs to followup mode ([f892b75](https://github.com/nkim500/career-ops/commit/f892b7515d957c38631bb9e176363584af68ee67))
* add Ashby ATS API support to scan mode ([e32eb5c](https://github.com/nkim500/career-ops/commit/e32eb5c1555a29759d2c686aefe7e02e6bcd0ab2))
* add Block G — posting legitimacy assessment ([3a636ac](https://github.com/nkim500/career-ops/commit/3a636ac586659bb798ef46a0a9798478a1e28b0a))
* add debrief mode for interview round synthesis ([b10d122](https://github.com/nkim500/career-ops/commit/b10d122a771108b60baef3be8be0802541925c78))
* add follow-up cadence tracker mode ([4308c37](https://github.com/nkim500/career-ops/commit/4308c375033c6df430308235f4324658a8353b81))
* add follow-ups.md schema validation test (Section 11) ([60fc7fb](https://github.com/nkim500/career-ops/commit/60fc7fbf5d2ce4eab8b9a7becec17226c5415aef))
* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/nkim500/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* add Nix flake devshell with Playwright support ([c579fcd](https://github.com/nkim500/career-ops/commit/c579fcddebf793f00cfad8534fd74085c09017fb))
* add OpenCode slash commands for career-ops ([#67](https://github.com/nkim500/career-ops/issues/67)) ([93caaed](https://github.com/nkim500/career-ops/commit/93caaed49cbc9f3214f9beb66fb2281c3f2370e6))
* add scan.mjs — zero-token portal scanner ([8c19b2b](https://github.com/nkim500/career-ops/commit/8c19b2b59f7087689e004f3d48e912f291911373))
* auto-save JD text during pipeline processing ([7070671](https://github.com/nkim500/career-ops/commit/707067100abdd07336f590438d549837fef42f07))
* auto-save raw JD text to jds/ during pipeline processing ([fb25bce](https://github.com/nkim500/career-ops/commit/fb25bce1fa45c410b4394a08b24ae7d962d4891d))
* **batch:** Sonnet workers + post-worker score fallback ([213eeef](https://github.com/nkim500/career-ops/commit/213eeefe50c52a2658b81c0e8f02aa3bd7afddb5))
* **batch:** Sonnet workers + post-worker score fallback ([1343bad](https://github.com/nkim500/career-ops/commit/1343badad13e702589400bf3be265124a8404cc9))
* correspondence tracker — interview archive + task tracker ([e7311eb](https://github.com/nkim500/career-ops/commit/e7311ebb13ce9dbdae27b945a7ee729242db6fc0))
* **dashboard:** add 'r' refresh shortcut to pipeline screen ([ee21343](https://github.com/nkim500/career-ops/commit/ee21343c8e1e246bc25e1f23118dd97617f119e8))
* **dashboard:** add 'r' refresh shortcut to pipeline screen ([d247675](https://github.com/nkim500/career-ops/commit/d24767524d7fcc5848148629044258aabc0c2d0e))
* **dashboard:** add Age column and sortAge mode ([955b5da](https://github.com/nkim500/career-ops/commit/955b5da481606ee8e2dab1238f6e57f9591bc952))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/nkim500/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add DatePosted field to CareerApplication ([725c61e](https://github.com/nkim500/career-ops/commit/725c61e1a2f6d73e9d64da79a50238bb693f63d8))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/nkim500/career-ops/issues/246)) ([4b5093a](https://github.com/nkim500/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/nkim500/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/nkim500/career-ops/issues/262)) ([d149e54](https://github.com/nkim500/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/nkim500/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))
* **dashboard:** enrich DatePosted from scan-history.tsv ([ac8c937](https://github.com/nkim500/career-ops/commit/ac8c937c9e4d2c6fea07198f4c195df8e1e85232))
* expand portals.example.yml with 8 dev-tools companies + 23 search queries ([#140](https://github.com/nkim500/career-ops/issues/140)) ([b7f555d](https://github.com/nkim500/career-ops/commit/b7f555d7b9a7b23c875fa0d35584df534961dabe))
* extend followup-cadence.mjs for new schema + standalone_tasks ([e3994ca](https://github.com/nkim500/career-ops/commit/e3994caad95ea830e3761f865bd10608426e627e))
* extract datePosted from ATS APIs in scan.mjs ([7851622](https://github.com/nkim500/career-ops/commit/7851622a0c29c5eac0b3050ce8e237d0bfcdef43))
* extract datePosted from ATS APIs in scan.mjs ([b9c2c75](https://github.com/nkim500/career-ops/commit/b9c2c7520699d0c14f696a8195ed8539b6d0fbb3))
* **i18n:** add Japanese README + language modes for Japan market ([20a2c81](https://github.com/nkim500/career-ops/commit/20a2c817486968ca42a534aa86838c797d599c10))
* posting freshness — extract dates, pipeline sort, dashboard column ([0aa48ae](https://github.com/nkim500/career-ops/commit/0aa48aee8990398cdb5d0bd7354c5c5b0849c224))
* rename Spanish mode files to English and update all references ([8c4c906](https://github.com/nkim500/career-ops/commit/8c4c906fc7c67bf7ce08b6961cb7cc18653c8085))
* store both structured summary and verbatim raw JD in jds/ files ([8c433f9](https://github.com/nkim500/career-ops/commit/8c433f9cc2a45c386422a13d5b964123f8d37419))
* sync-upstream script for pulling santifer updates without a remote ([c57aaca](https://github.com/nkim500/career-ops/commit/c57aaca526ec121bb91be6fbba5866c2aa1532d9))
* sync-upstream script for pulling santifer updates without a remote ([e1f7b4e](https://github.com/nkim500/career-ops/commit/e1f7b4e178cd6d83b09442cc825afefff752a485))
* translate core mode files from Spanish to English ([925dcb4](https://github.com/nkim500/career-ops/commit/925dcb4bf66d084756b0e7e541d89c24b1a3a1d9))


### Bug Fixes

* 10 bug fixes — resource leaks, command injection, Unicode, navigation ([cb01a2c](https://github.com/nkim500/career-ops/commit/cb01a2c2e3b7fc334b1c4594749ea40b0da8fc62))
* add data/ fallback to UpdateApplicationStatus ([#55](https://github.com/nkim500/career-ops/issues/55)) ([3512b8e](https://github.com/nkim500/career-ops/commit/3512b8ef4eb8ca967bc967664f8798af42b58a52))
* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/nkim500/career-ops/issues/248)) ([4da772d](https://github.com/nkim500/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* align portals.example.yml indentation for new companies ([26a6751](https://github.com/nkim500/career-ops/commit/26a675173e64dac09fd1524ff9a7c7061520e057))
* **ci:** update test-all.mjs for English mode filenames and progress.go ([fc3bf2b](https://github.com/nkim500/career-ops/commit/fc3bf2b920860e2714053bebe96ac52b8636711c))
* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/nkim500/career-ops/issues/260)) ([2ecf572](https://github.com/nkim500/career-ops/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/nkim500/career-ops/issues/137)) ([a91e264](https://github.com/nkim500/career-ops/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* correct dashboard launch path in docs ([#80](https://github.com/nkim500/career-ops/issues/80)) ([2b969ee](https://github.com/nkim500/career-ops/commit/2b969eea5f6bbc8f29b9e42bedb59312379e9f02))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/nkim500/career-ops/issues/298)) ([e5e2a6c](https://github.com/nkim500/career-ops/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* **dashboard:** wrap long lines in viewer instead of overflowing ([6ff22b3](https://github.com/nkim500/career-ops/commit/6ff22b315f89b3a16c6ca55cc694b91d3d45d1ed))
* **dashboard:** wrap long lines in viewer instead of overflowing ([8542f8f](https://github.com/nkim500/career-ops/commit/8542f8fe951223fd6a242c8e9ae57fa1ec98d4f0))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/nkim500/career-ops/issues/261)) ([4b834f6](https://github.com/nkim500/career-ops/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* filter expired WebSearch links before they reach the pipeline ([#57](https://github.com/nkim500/career-ops/issues/57)) ([ce1c5a3](https://github.com/nkim500/career-ops/commit/ce1c5a3c7eea6ebce2c90aebba59d6e26b790d3f))
* improve default PDF readability ([#85](https://github.com/nkim500/career-ops/issues/85)) ([10034ec](https://github.com/nkim500/career-ops/commit/10034ec3304c1c79ff9c9678c7826ab77c0bcbf7))
* liveness checks ignore nav/footer Apply text, expired signals win ([3a3cb95](https://github.com/nkim500/career-ops/commit/3a3cb95bdf09235509df72e30b3077623f571ea1))
* **merge:** remove duplicate PipelineRefreshMsg handler in main.go ([ce35c5b](https://github.com/nkim500/career-ops/commit/ce35c5be376afdff256cd40178bb650c8d55f71b))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/nkim500/career-ops/issues/286)) ([ecd013c](https://github.com/nkim500/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/nkim500/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* return empty structure instead of error when no follow-ups exist ([2e87e72](https://github.com/nkim500/career-ops/commit/2e87e72fa587c7894ec7657e423725d26749b65e))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/nkim500/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* use candidate name from profile.yml in PDF filename ([7bcbc08](https://github.com/nkim500/career-ops/commit/7bcbc08ca6184362398690234e49df0ac157567f))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/nkim500/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
* use fileURLToPath for cross platform compatible paths in tracker scripts ([#32](https://github.com/nkim500/career-ops/issues/32)) ([#58](https://github.com/nkim500/career-ops/issues/58)) ([ab77510](https://github.com/nkim500/career-ops/commit/ab775102f4586ae4663a593b519927531be27122))
* use hi@santifer.io in English README ([5518d3d](https://github.com/nkim500/career-ops/commit/5518d3dd07716137b97bb4d8c7b5264b94e2b9e9))


### Performance Improvements

* compress hero banner from 5.7MB to 671KB ([dac4259](https://github.com/nkim500/career-ops/commit/dac425913620fe0a66916dda7ba8d8fc4c427d51))

## [1.4.0](https://github.com/santifer/career-ops/compare/v1.3.0...v1.4.0) (2026-04-13)


### Features

* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/santifer/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/santifer/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/santifer/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/santifer/career-ops/issues/262)) ([d149e54](https://github.com/santifer/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/santifer/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))


### Bug Fixes

* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/santifer/career-ops/issues/260)) ([2ecf572](https://github.com/santifer/career-ops/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/santifer/career-ops/issues/137)) ([a91e264](https://github.com/santifer/career-ops/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/santifer/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/santifer/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/santifer/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
