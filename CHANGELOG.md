# Changelog

## [1.8.0](https://github.com/nkim500/career-ops/compare/career-ops-v1.7.0...career-ops-v1.8.0) (2026-05-15)


### Features

* adapt contacto mode by contact type (recruiter/HM/peer/interviewer) ([9fd5a90](https://github.com/nkim500/career-ops/commit/9fd5a90896f20020f48455cd079b64fed491b89f))
* add --min-score flag to batch runner ([#249](https://github.com/nkim500/career-ops/issues/249)) ([cb0c7f7](https://github.com/nkim500/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/nkim500/career-ops/issues/287)) ([e71595f](https://github.com/nkim500/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* add add/list/done verbs to followup mode ([f892b75](https://github.com/nkim500/career-ops/commit/f892b7515d957c38631bb9e176363584af68ee67))
* add Ashby ATS API support to scan mode ([e32eb5c](https://github.com/nkim500/career-ops/commit/e32eb5c1555a29759d2c686aefe7e02e6bcd0ab2))
* add Block G — posting legitimacy assessment ([3a636ac](https://github.com/nkim500/career-ops/commit/3a636ac586659bb798ef46a0a9798478a1e28b0a))
* add Claude Code plugin manifests (path-stable) ([62b767d](https://github.com/nkim500/career-ops/commit/62b767dcc56e4c875ed70bf4fe799c254ecf8eea))
* add debrief mode for interview round synthesis ([b10d122](https://github.com/nkim500/career-ops/commit/b10d122a771108b60baef3be8be0802541925c78))
* add follow-up cadence tracker mode ([4308c37](https://github.com/nkim500/career-ops/commit/4308c375033c6df430308235f4324658a8353b81))
* add follow-ups.md schema validation test (Section 11) ([60fc7fb](https://github.com/nkim500/career-ops/commit/60fc7fbf5d2ce4eab8b9a7becec17226c5415aef))
* add Gemini CLI native integration and evaluator script  ([#349](https://github.com/nkim500/career-ops/issues/349)) ([0853486](https://github.com/nkim500/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add Gemini CLI native integration and evaluator script (closes [#344](https://github.com/nkim500/career-ops/issues/344)) ([0853486](https://github.com/nkim500/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/nkim500/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* add LaTeX/Overleaf CV export mode with pdflatex compilation ([#362](https://github.com/nkim500/career-ops/issues/362)) ([b824953](https://github.com/nkim500/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add LaTeX/Overleaf CV export mode with pdflatex compilation (closes [#47](https://github.com/nkim500/career-ops/issues/47)) ([b824953](https://github.com/nkim500/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add Nix flake devshell with Playwright support ([c579fcd](https://github.com/nkim500/career-ops/commit/c579fcddebf793f00cfad8534fd74085c09017fb))
* add OpenCode slash commands for career-ops ([#67](https://github.com/nkim500/career-ops/issues/67)) ([93caaed](https://github.com/nkim500/career-ops/commit/93caaed49cbc9f3214f9beb66fb2281c3f2370e6))
* add scan.mjs — zero-token portal scanner ([8c19b2b](https://github.com/nkim500/career-ops/commit/8c19b2b59f7087689e004f3d48e912f291911373))
* add writing-samples folder for AI-detection-evading voice calibration ([9ae201d](https://github.com/nkim500/career-ops/commit/9ae201d0682a17e7006ed7902b42db8234212e97))
* auto-save JD text during pipeline processing ([7070671](https://github.com/nkim500/career-ops/commit/707067100abdd07336f590438d549837fef42f07))
* auto-save raw JD text to jds/ during pipeline processing ([fb25bce](https://github.com/nkim500/career-ops/commit/fb25bce1fa45c410b4394a08b24ae7d962d4891d))
* **batch:** Sonnet workers + post-worker score fallback ([213eeef](https://github.com/nkim500/career-ops/commit/213eeefe50c52a2658b81c0e8f02aa3bd7afddb5))
* **batch:** Sonnet workers + post-worker score fallback ([1343bad](https://github.com/nkim500/career-ops/commit/1343badad13e702589400bf3be265124a8404cc9))
* correspondence tracker — interview archive + task tracker ([e7311eb](https://github.com/nkim500/career-ops/commit/e7311ebb13ce9dbdae27b945a7ee729242db6fc0))
* **cv:** add cv.output_format to route between html and latex generation ([b82bb5f](https://github.com/nkim500/career-ops/commit/b82bb5fb7c86ab3074a54eaf0f3186f81d41f417))
* **dashboard:** add 'r' refresh shortcut to pipeline screen ([ee21343](https://github.com/nkim500/career-ops/commit/ee21343c8e1e246bc25e1f23118dd97617f119e8))
* **dashboard:** add 'r' refresh shortcut to pipeline screen ([d247675](https://github.com/nkim500/career-ops/commit/d24767524d7fcc5848148629044258aabc0c2d0e))
* **dashboard:** add Age column and sortAge mode ([955b5da](https://github.com/nkim500/career-ops/commit/955b5da481606ee8e2dab1238f6e57f9591bc952))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/nkim500/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add column headers row to pipeline view ([b800977](https://github.com/nkim500/career-ops/commit/b800977b754a792b567bcd5b5863eb434a08cbc0))
* **dashboard:** add column headers row to pipeline view ([385a20a](https://github.com/nkim500/career-ops/commit/385a20a4157d5cd0c1317f409016976b9ed35865))
* **dashboard:** add DatePosted field to CareerApplication ([725c61e](https://github.com/nkim500/career-ops/commit/725c61e1a2f6d73e9d64da79a50238bb693f63d8))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/nkim500/career-ops/issues/246)) ([4b5093a](https://github.com/nkim500/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/nkim500/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add rejected and discarded pipeline tabs ([7d05967](https://github.com/nkim500/career-ops/commit/7d05967389fb6185f0d6e566a4ba583ee3824e1e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/nkim500/career-ops/issues/262)) ([d149e54](https://github.com/nkim500/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/nkim500/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))
* **dashboard:** enrich DatePosted from scan-history.tsv ([ac8c937](https://github.com/nkim500/career-ops/commit/ac8c937c9e4d2c6fea07198f4c195df8e1e85232))
* **dashboard:** show tracker IDs in pipeline list ([8d289c6](https://github.com/nkim500/career-ops/commit/8d289c64e31f81cf447f75105b500d1feca21058))
* expand portals.example.yml with 8 dev-tools companies + 23 search queries ([#140](https://github.com/nkim500/career-ops/issues/140)) ([b7f555d](https://github.com/nkim500/career-ops/commit/b7f555d7b9a7b23c875fa0d35584df534961dabe))
* extend followup-cadence.mjs for new schema + standalone_tasks ([e3994ca](https://github.com/nkim500/career-ops/commit/e3994caad95ea830e3761f865bd10608426e627e))
* extract datePosted from ATS APIs in scan.mjs ([7851622](https://github.com/nkim500/career-ops/commit/7851622a0c29c5eac0b3050ce8e237d0bfcdef43))
* extract datePosted from ATS APIs in scan.mjs ([b9c2c75](https://github.com/nkim500/career-ops/commit/b9c2c7520699d0c14f696a8195ed8539b6d0fbb3))
* **i18n:** add Japanese README + language modes for Japan market ([20a2c81](https://github.com/nkim500/career-ops/commit/20a2c817486968ca42a534aa86838c797d599c10))
* **latex:** add tectonic engine auto-detect with pdflatex fallback ([4b71b2c](https://github.com/nkim500/career-ops/commit/4b71b2cbf4fd49d3882cdd8767e31727337fab34))
* multi-CLI support via open agent skill standard ([#572](https://github.com/nkim500/career-ops/issues/572)) ([7605a5e](https://github.com/nkim500/career-ops/commit/7605a5ed68d0fd559374afec1cd8798c487e3ead))
* **numbering:** add next-num.mjs as single source of truth for report numbers ([7d80c0a](https://github.com/nkim500/career-ops/commit/7d80c0a3f09abf6cddd8c228fa42a5360c9706a0))
* **portals:** add Canada/Vancouver and automation companies to example template ([590ba6e](https://github.com/nkim500/career-ops/commit/590ba6e1b4b9d2d9d03893b7f5fdae920d4f9a0b))
* posting freshness — extract dates, pipeline sort, dashboard column ([0aa48ae](https://github.com/nkim500/career-ops/commit/0aa48aee8990398cdb5d0bd7354c5c5b0849c224))
* rename Spanish mode files to English and update all references ([8c4c906](https://github.com/nkim500/career-ops/commit/8c4c906fc7c67bf7ce08b6961cb7cc18653c8085))
* **scan:** add location_filter to portals.yml schema ([707e3f2](https://github.com/nkim500/career-ops/commit/707e3f25adb0df642f44b9efec1b471314f54812))
* **scan:** add location_filter to portals.yml schema ([020e361](https://github.com/nkim500/career-ops/commit/020e36120bdab288fd64ea97b47ab77a3b52de9f))
* **scan:** apply location_filter from portals.yml ([f4d6b8f](https://github.com/nkim500/career-ops/commit/f4d6b8f8e8b93579b8374ec733df0a1a32cc2428))
* **scan:** apply location_filter from portals.yml ([92b3e60](https://github.com/nkim500/career-ops/commit/92b3e605dafb28f40d32dd16e5dda8deda8f9701))
* **scan:** fold scan-local.mjs (YC + Workday) into scan.mjs ([cd22e46](https://github.com/nkim500/career-ops/commit/cd22e461166200e29abbff4df9704f6fec0e107a))
* **scan:** port YC + Workday parsers from local fork ([978d0bf](https://github.com/nkim500/career-ops/commit/978d0bf792fc4e67bd825da50edf9933545fa14d))
* store both structured summary and verbatim raw JD in jds/ files ([8c433f9](https://github.com/nkim500/career-ops/commit/8c433f9cc2a45c386422a13d5b964123f8d37419))
* sync-upstream script for pulling santifer updates without a remote ([c57aaca](https://github.com/nkim500/career-ops/commit/c57aaca526ec121bb91be6fbba5866c2aa1532d9))
* sync-upstream script for pulling santifer updates without a remote ([e1f7b4e](https://github.com/nkim500/career-ops/commit/e1f7b4e178cd6d83b09442cc825afefff752a485))
* translate core mode files from Spanish to English ([925dcb4](https://github.com/nkim500/career-ops/commit/925dcb4bf66d084756b0e7e541d89c24b1a3a1d9))


### Bug Fixes

* 10 bug fixes — resource leaks, command injection, Unicode, navigation ([cb01a2c](https://github.com/nkim500/career-ops/commit/cb01a2c2e3b7fc334b1c4594749ea40b0da8fc62))
* add data/ fallback to UpdateApplicationStatus ([#55](https://github.com/nkim500/career-ops/issues/55)) ([3512b8e](https://github.com/nkim500/career-ops/commit/3512b8ef4eb8ca967bc967664f8798af42b58a52))
* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/nkim500/career-ops/issues/248)) ([4da772d](https://github.com/nkim500/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* align portals.example.yml indentation for new companies ([26a6751](https://github.com/nkim500/career-ops/commit/26a675173e64dac09fd1524ff9a7c7061520e057))
* **batch:** correct eval-only step references + evaluate.md report header ([1dfaa7b](https://github.com/nkim500/career-ops/commit/1dfaa7baa75f0fd1a360ba759664c5a6a7174a12))
* **batch:** fail loudly when next-num.mjs returns no number ([d59d7b5](https://github.com/nkim500/career-ops/commit/d59d7b55d6ab2b3f3a07a0c8a8196750c593ba44))
* **ci:** correct first-interaction@v3 input names ([c5196a8](https://github.com/nkim500/career-ops/commit/c5196a8dd8ff05da51c72ea151f67e481f12c329))
* **ci:** gracefully handle missing dependency graph in dependency-review ([#343](https://github.com/nkim500/career-ops/issues/343)) ([7c5fecb](https://github.com/nkim500/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** gracefully handle missing dependency graph in dependency-review workflow ([#352](https://github.com/nkim500/career-ops/issues/352)) ([7c5fecb](https://github.com/nkim500/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
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
* **liveness:** detect closed postings with applications-closed banner variants ([7f8217e](https://github.com/nkim500/career-ops/commit/7f8217e057b327980a797a682c4f01d3318edbbe))
* **merge-tracker:** filter seniority and location stopwords + require overlap ratio in roleFuzzyMatch ([7821113](https://github.com/nkim500/career-ops/commit/7821113261eeb32f99639ff076651ab2e7757209))
* **merge:** remove duplicate PipelineRefreshMsg handler in main.go ([ce35c5b](https://github.com/nkim500/career-ops/commit/ce35c5be376afdff256cd40178bb650c8d55f71b))
* **modes:** correct block count in evaluate.md to match A-G title ([1603c10](https://github.com/nkim500/career-ops/commit/1603c103d5c390d691a55122a88fba1a4571f32f))
* **numbering:** correct isCLI guard and harden test cleanup ([5cf98a0](https://github.com/nkim500/career-ops/commit/5cf98a07a9f96ae829acb4ba0928f3845fbc1e14))
* **numbering:** give auto-pipeline.md the full next-num guard ([03a1352](https://github.com/nkim500/career-ops/commit/03a1352138c3452f8a45076a1fbc9f6be371a35c))
* **numbering:** point interactive + conductor paths at next-num.mjs ([6f4c65d](https://github.com/nkim500/career-ops/commit/6f4c65d35f6f1cfdc99a2bc138fbf58d72123b2c))
* **numbering:** point pipeline mode at next-num.mjs ([4100219](https://github.com/nkim500/career-ops/commit/4100219eac8db16bf80512d0cd3d28cbbd58278c))
* **numbering:** tracker-registration step must reuse the report number ([126e355](https://github.com/nkim500/career-ops/commit/126e35542f0c88905d9498eaa3161632b33ff796))
* **pt:** restore diacritical marks in PT-BR modes ([#358](https://github.com/nkim500/career-ops/issues/358)) ([3a4c596](https://github.com/nkim500/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **pt:** restore diacritical marks in PT-BR modes ([#359](https://github.com/nkim500/career-ops/issues/359)) ([3a4c596](https://github.com/nkim500/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **release:** sync VERSION and package.json via release-please-config ([6a3dc22](https://github.com/nkim500/career-ops/commit/6a3dc224337a1942bf2ebf18b9b275d94fc06e7a))
* **release:** sync VERSION file to 1.7.0 ([8e554cc](https://github.com/nkim500/career-ops/commit/8e554cc4437c3a58e813378abb9b35e2e08a007e))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/nkim500/career-ops/issues/286)) ([ecd013c](https://github.com/nkim500/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/nkim500/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* return empty structure instead of error when no follow-ups exist ([2e87e72](https://github.com/nkim500/career-ops/commit/2e87e72fa587c7894ec7657e423725d26749b65e))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/nkim500/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* **update-system:** cross-check GitHub Releases API when VERSION file is stale ([b0ee6eb](https://github.com/nkim500/career-ops/commit/b0ee6ebfcec7920ea7590ada61f3c39324d22ebc))
* **update-system:** drop fork-renamed mode files from SYSTEM_PATHS ([8b8bc5b](https://github.com/nkim500/career-ops/commit/8b8bc5bac982e330ebd08e147999d739365ee774))
* **update-system:** expand SYSTEM_PATHS to cover all language modes and current scripts ([34fe3fb](https://github.com/nkim500/career-ops/commit/34fe3fbd5782f7f57faf8ef4a245fbee6275a040))
* use candidate name from profile.yml in PDF filename ([7bcbc08](https://github.com/nkim500/career-ops/commit/7bcbc08ca6184362398690234e49df0ac157567f))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/nkim500/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
* use fileURLToPath for cross platform compatible paths in tracker scripts ([#32](https://github.com/nkim500/career-ops/issues/32)) ([#58](https://github.com/nkim500/career-ops/issues/58)) ([ab77510](https://github.com/nkim500/career-ops/commit/ab775102f4586ae4663a593b519927531be27122))
* use hi@santifer.io in English README ([5518d3d](https://github.com/nkim500/career-ops/commit/5518d3dd07716137b97bb4d8c7b5264b94e2b9e9))


### Performance Improvements

* compress hero banner from 5.7MB to 671KB ([dac4259](https://github.com/nkim500/career-ops/commit/dac425913620fe0a66916dda7ba8d8fc4c427d51))


### Reverts

* scan location_filter (moving to user layer) ([4023e3b](https://github.com/nkim500/career-ops/commit/4023e3b89933126f1cb5f9a50c314e22beab205a))

## [1.7.0](https://github.com/santifer/career-ops/compare/career-ops-v1.6.0...career-ops-v1.7.0) (2026-05-06)


### Features

* adapt contacto mode by contact type (recruiter/HM/peer/interviewer) ([9fd5a90](https://github.com/santifer/career-ops/commit/9fd5a90896f20020f48455cd079b64fed491b89f))
* add --min-score flag to batch runner ([#249](https://github.com/santifer/career-ops/issues/249)) ([cb0c7f7](https://github.com/santifer/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/santifer/career-ops/issues/287)) ([e71595f](https://github.com/santifer/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* add Block G — posting legitimacy assessment ([3a636ac](https://github.com/santifer/career-ops/commit/3a636ac586659bb798ef46a0a9798478a1e28b0a))
* add Claude Code plugin manifests (path-stable) ([62b767d](https://github.com/santifer/career-ops/commit/62b767dcc56e4c875ed70bf4fe799c254ecf8eea))
* add follow-up cadence tracker mode ([4308c37](https://github.com/santifer/career-ops/commit/4308c375033c6df430308235f4324658a8353b81))
* add Gemini CLI native integration and evaluator script  ([#349](https://github.com/santifer/career-ops/issues/349)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add Gemini CLI native integration and evaluator script (closes [#344](https://github.com/santifer/career-ops/issues/344)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add GitHub Actions CI + auto-labeler + welcome bot + /run skill ([2ddf22a](https://github.com/santifer/career-ops/commit/2ddf22a6a2731b38bcaed5786c4855c4ab9fe722))
* add LaTeX/Overleaf CV export mode with pdflatex compilation ([#362](https://github.com/santifer/career-ops/issues/362)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add LaTeX/Overleaf CV export mode with pdflatex compilation (closes [#47](https://github.com/santifer/career-ops/issues/47)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add Nix flake devshell with Playwright support ([c579fcd](https://github.com/santifer/career-ops/commit/c579fcddebf793f00cfad8534fd74085c09017fb))
* add OpenCode slash commands for career-ops ([#67](https://github.com/santifer/career-ops/issues/67)) ([93caaed](https://github.com/santifer/career-ops/commit/93caaed49cbc9f3214f9beb66fb2281c3f2370e6))
* add scan.mjs — zero-token portal scanner ([8c19b2b](https://github.com/santifer/career-ops/commit/8c19b2b59f7087689e004f3d48e912f291911373))
* add writing-samples folder for AI-detection-evading voice calibration ([9ae201d](https://github.com/santifer/career-ops/commit/9ae201d0682a17e7006ed7902b42db8234212e97))
* **cv:** add cv.output_format to route between html and latex generation ([b82bb5f](https://github.com/santifer/career-ops/commit/b82bb5fb7c86ab3074a54eaf0f3186f81d41f417))
* **dashboard:** add Catppuccin Latte light theme with auto-detection ([ff686c8](https://github.com/santifer/career-ops/commit/ff686c8af97a7bf93565fe8eeac677f998cc9ece))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/santifer/career-ops/issues/246)) ([4b5093a](https://github.com/santifer/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))
* **dashboard:** add progress analytics screen ([623c837](https://github.com/santifer/career-ops/commit/623c837bf3155fd5b7413554240071d40585dd7e))
* **dashboard:** add rejected and discarded pipeline tabs ([7d05967](https://github.com/santifer/career-ops/commit/7d05967389fb6185f0d6e566a4ba583ee3824e1e))
* **dashboard:** add vim motions to pipeline screen ([#262](https://github.com/santifer/career-ops/issues/262)) ([d149e54](https://github.com/santifer/career-ops/commit/d149e541402db0c88161a71c73899cd1836a1b2d))
* **dashboard:** aligned tables and markdown syntax rendering in viewer ([dbd1d3f](https://github.com/santifer/career-ops/commit/dbd1d3f7177358d0384d6e661d1b0dfc1f60bd4e))
* **dashboard:** show tracker IDs in pipeline list ([8d289c6](https://github.com/santifer/career-ops/commit/8d289c64e31f81cf447f75105b500d1feca21058))
* expand portals.example.yml with 8 dev-tools companies + 23 search queries ([#140](https://github.com/santifer/career-ops/issues/140)) ([b7f555d](https://github.com/santifer/career-ops/commit/b7f555d7b9a7b23c875fa0d35584df534961dabe))
* **i18n:** add Japanese README + language modes for Japan market ([20a2c81](https://github.com/santifer/career-ops/commit/20a2c817486968ca42a534aa86838c797d599c10))
* **latex:** add tectonic engine auto-detect with pdflatex fallback ([4b71b2c](https://github.com/santifer/career-ops/commit/4b71b2cbf4fd49d3882cdd8767e31727337fab34))
* multi-CLI support via open agent skill standard ([#572](https://github.com/santifer/career-ops/issues/572)) ([7605a5e](https://github.com/santifer/career-ops/commit/7605a5ed68d0fd559374afec1cd8798c487e3ead))
* **portals:** add Canada/Vancouver and automation companies to example template ([590ba6e](https://github.com/santifer/career-ops/commit/590ba6e1b4b9d2d9d03893b7f5fdae920d4f9a0b))


### Bug Fixes

* 10 bug fixes — resource leaks, command injection, Unicode, navigation ([cb01a2c](https://github.com/santifer/career-ops/commit/cb01a2c2e3b7fc334b1c4594749ea40b0da8fc62))
* add data/ fallback to UpdateApplicationStatus ([#55](https://github.com/santifer/career-ops/issues/55)) ([3512b8e](https://github.com/santifer/career-ops/commit/3512b8ef4eb8ca967bc967664f8798af42b58a52))
* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/santifer/career-ops/issues/248)) ([4da772d](https://github.com/santifer/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* align portals.example.yml indentation for new companies ([26a6751](https://github.com/santifer/career-ops/commit/26a675173e64dac09fd1524ff9a7c7061520e057))
* **ci:** correct first-interaction@v3 input names ([c5196a8](https://github.com/santifer/career-ops/commit/c5196a8dd8ff05da51c72ea151f67e481f12c329))
* **ci:** gracefully handle missing dependency graph in dependency-review ([#343](https://github.com/santifer/career-ops/issues/343)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** gracefully handle missing dependency graph in dependency-review workflow ([#352](https://github.com/santifer/career-ops/issues/352)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** use pull_request_target for labeler on fork PRs ([#260](https://github.com/santifer/career-ops/issues/260)) ([2ecf572](https://github.com/santifer/career-ops/commit/2ecf57206c2eb6e35e2a843d6b8365f7a04c53d6))
* correct _shared.md → _profile.md reference in CUSTOMIZATION.md (closes [#137](https://github.com/santifer/career-ops/issues/137)) ([a91e264](https://github.com/santifer/career-ops/commit/a91e264b6ea047a76d8c033aa564fe01b8f9c1d9))
* correct dashboard launch path in docs ([#80](https://github.com/santifer/career-ops/issues/80)) ([2b969ee](https://github.com/santifer/career-ops/commit/2b969eea5f6bbc8f29b9e42bedb59312379e9f02))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/santifer/career-ops/issues/298)) ([e5e2a6c](https://github.com/santifer/career-ops/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/santifer/career-ops/issues/261)) ([4b834f6](https://github.com/santifer/career-ops/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* filter expired WebSearch links before they reach the pipeline ([#57](https://github.com/santifer/career-ops/issues/57)) ([ce1c5a3](https://github.com/santifer/career-ops/commit/ce1c5a3c7eea6ebce2c90aebba59d6e26b790d3f))
* improve default PDF readability ([#85](https://github.com/santifer/career-ops/issues/85)) ([10034ec](https://github.com/santifer/career-ops/commit/10034ec3304c1c79ff9c9678c7826ab77c0bcbf7))
* liveness checks ignore nav/footer Apply text, expired signals win ([3a3cb95](https://github.com/santifer/career-ops/commit/3a3cb95bdf09235509df72e30b3077623f571ea1))
* **liveness:** detect closed postings with applications-closed banner variants ([7f8217e](https://github.com/santifer/career-ops/commit/7f8217e057b327980a797a682c4f01d3318edbbe))
* **merge-tracker:** filter seniority and location stopwords + require overlap ratio in roleFuzzyMatch ([7821113](https://github.com/santifer/career-ops/commit/7821113261eeb32f99639ff076651ab2e7757209))
* **pt:** restore diacritical marks in PT-BR modes ([#358](https://github.com/santifer/career-ops/issues/358)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **pt:** restore diacritical marks in PT-BR modes ([#359](https://github.com/santifer/career-ops/issues/359)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **release:** sync VERSION and package.json via release-please-config ([6a3dc22](https://github.com/santifer/career-ops/commit/6a3dc224337a1942bf2ebf18b9b275d94fc06e7a))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/santifer/career-ops/issues/286)) ([ecd013c](https://github.com/santifer/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))
* replace grep -P with POSIX-compatible grep in batch-runner.sh ([637b39e](https://github.com/santifer/career-ops/commit/637b39e383d1174c8287f42e9534e9e3cdfabb19))
* test-all.mjs scans only git-tracked files, avoids false positives ([47c9f98](https://github.com/santifer/career-ops/commit/47c9f984d8ddc70974f15c99b081667b73f1bb9a))
* **update-system:** cross-check GitHub Releases API when VERSION file is stale ([b0ee6eb](https://github.com/santifer/career-ops/commit/b0ee6ebfcec7920ea7590ada61f3c39324d22ebc))
* **update-system:** expand SYSTEM_PATHS to cover all language modes and current scripts ([34fe3fb](https://github.com/santifer/career-ops/commit/34fe3fbd5782f7f57faf8ef4a245fbee6275a040))
* use candidate name from profile.yml in PDF filename ([7bcbc08](https://github.com/santifer/career-ops/commit/7bcbc08ca6184362398690234e49df0ac157567f))
* use execFileSync to prevent shell injection in test-all.mjs ([c99d5a6](https://github.com/santifer/career-ops/commit/c99d5a6526f923b56c3790b79b0349f402fa00e2))
* use fileURLToPath for cross platform compatible paths in tracker scripts ([#32](https://github.com/santifer/career-ops/issues/32)) ([#58](https://github.com/santifer/career-ops/issues/58)) ([ab77510](https://github.com/santifer/career-ops/commit/ab775102f4586ae4663a593b519927531be27122))
* use hi@santifer.io in English README ([5518d3d](https://github.com/santifer/career-ops/commit/5518d3dd07716137b97bb4d8c7b5264b94e2b9e9))


### Performance Improvements

* compress hero banner from 5.7MB to 671KB ([dac4259](https://github.com/santifer/career-ops/commit/dac425913620fe0a66916dda7ba8d8fc4c427d51))

## [1.6.0](https://github.com/santifer/career-ops/compare/v1.5.0...v1.6.0) (2026-04-26)


### Features

* add Gemini CLI native integration and evaluator script  ([#349](https://github.com/santifer/career-ops/issues/349)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add Gemini CLI native integration and evaluator script (closes [#344](https://github.com/santifer/career-ops/issues/344)) ([0853486](https://github.com/santifer/career-ops/commit/0853486d2c01a35adafea2cc6b6d8c429b843588))
* add LaTeX/Overleaf CV export mode with pdflatex compilation ([#362](https://github.com/santifer/career-ops/issues/362)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* add LaTeX/Overleaf CV export mode with pdflatex compilation (closes [#47](https://github.com/santifer/career-ops/issues/47)) ([b824953](https://github.com/santifer/career-ops/commit/b824953d0e3b7f8c6105dfcce7e17257c95ce6cd))
* **cv:** add cv.output_format to route between html and latex generation ([b82bb5f](https://github.com/santifer/career-ops/commit/b82bb5fb7c86ab3074a54eaf0f3186f81d41f417))
* **dashboard:** add rejected and discarded pipeline tabs ([7d05967](https://github.com/santifer/career-ops/commit/7d05967389fb6185f0d6e566a4ba583ee3824e1e))
* **dashboard:** show tracker IDs in pipeline list ([8d289c6](https://github.com/santifer/career-ops/commit/8d289c64e31f81cf447f75105b500d1feca21058))
* **latex:** add tectonic engine auto-detect with pdflatex fallback ([4b71b2c](https://github.com/santifer/career-ops/commit/4b71b2cbf4fd49d3882cdd8767e31727337fab34))
* **portals:** add Canada/Vancouver and automation companies to example template ([590ba6e](https://github.com/santifer/career-ops/commit/590ba6e1b4b9d2d9d03893b7f5fdae920d4f9a0b))


### Bug Fixes

* **ci:** correct first-interaction@v3 input names ([c5196a8](https://github.com/santifer/career-ops/commit/c5196a8dd8ff05da51c72ea151f67e481f12c329))
* **ci:** gracefully handle missing dependency graph in dependency-review ([#343](https://github.com/santifer/career-ops/issues/343)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **ci:** gracefully handle missing dependency graph in dependency-review workflow ([#352](https://github.com/santifer/career-ops/issues/352)) ([7c5fecb](https://github.com/santifer/career-ops/commit/7c5fecb00d60521f77b33724eb345a28257d8832))
* **liveness:** detect closed postings with applications-closed banner variants ([7f8217e](https://github.com/santifer/career-ops/commit/7f8217e057b327980a797a682c4f01d3318edbbe))
* **merge-tracker:** filter seniority and location stopwords + require overlap ratio in roleFuzzyMatch ([7821113](https://github.com/santifer/career-ops/commit/7821113261eeb32f99639ff076651ab2e7757209))
* **pt:** restore diacritical marks in PT-BR modes ([#358](https://github.com/santifer/career-ops/issues/358)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **pt:** restore diacritical marks in PT-BR modes ([#359](https://github.com/santifer/career-ops/issues/359)) ([3a4c596](https://github.com/santifer/career-ops/commit/3a4c596cb0a522f562ba38b35c210facaf38a503))
* **update-system:** cross-check GitHub Releases API when VERSION file is stale ([b0ee6eb](https://github.com/santifer/career-ops/commit/b0ee6ebfcec7920ea7590ada61f3c39324d22ebc))
* **update-system:** expand SYSTEM_PATHS to cover all language modes and current scripts ([34fe3fb](https://github.com/santifer/career-ops/commit/34fe3fbd5782f7f57faf8ef4a245fbee6275a040))

## [1.5.0](https://github.com/santifer/career-ops/compare/v1.4.0...v1.5.0) (2026-04-14)


### Features

* add --min-score flag to batch runner ([#249](https://github.com/santifer/career-ops/issues/249)) ([cb0c7f7](https://github.com/santifer/career-ops/commit/cb0c7f7d7d3b9f3f1c3dc75ccac0a08d2737c01e))
* add {{PHONE}} placeholder to CV template ([#287](https://github.com/santifer/career-ops/issues/287)) ([e71595f](https://github.com/santifer/career-ops/commit/e71595f8ba134971ecf1cc3c3420d9caf21eed43))
* **dashboard:** add manual refresh shortcut ([#246](https://github.com/santifer/career-ops/issues/246)) ([4b5093a](https://github.com/santifer/career-ops/commit/4b5093a8ef1733c449ec0821f722f996625fcb84))


### Bug Fixes

* add stopword filtering and overlap ratio to roleMatch ([#248](https://github.com/santifer/career-ops/issues/248)) ([4da772d](https://github.com/santifer/career-ops/commit/4da772d3a4996bc9ecbe2d384d1e9d2ed75b9819))
* **dashboard:** show dates in pipeline list ([#298](https://github.com/santifer/career-ops/issues/298)) ([e5e2a6c](https://github.com/santifer/career-ops/commit/e5e2a6cffe9a5b9f3cec862df25410d02ecc9aa4))
* ensure data/ and output/ dirs exist before writing in scripts ([#261](https://github.com/santifer/career-ops/issues/261)) ([4b834f6](https://github.com/santifer/career-ops/commit/4b834f6f7f8f1b647a6bf76e43b017dcbe9cd52f))
* remove wellfound, lever and remotefront from portals.example.yml ([#286](https://github.com/santifer/career-ops/issues/286)) ([ecd013c](https://github.com/santifer/career-ops/commit/ecd013cc6f59e3a1a8ef77d34e7abc15e8075ed3))

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
