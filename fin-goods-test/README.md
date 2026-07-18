# Building

| Command | Description
|---|---|
|`npm run build` | Build the project in debug mode. |
|`npm run release` | Build the project in release mode. |
|`npm run watch` | Watch the source and behaviors, auto-rebuilds. |
|`npm run clean` | Deletes built JavaScript files. |
|`npm start` | Alias for `npm run watch`. |
|`npm run sync` | Sync files to the robot (uses `rsync`, **OSX only**)</br> **Tip**: Use `jibo run --nosync` or `jibo debug --nosync` after to launch skills |
|`npm run addsshkey` | Install your public SSH key on the robot (OS X Only). |



# Finished Goods Skill
This skill is designed to test the robot's functionality on the manufacturing floor and during development. It is pre-installed on each robot.

# Testing

1. git clone
2. npm install -g gulp
2. cd fin-goods-test
3. ./bin/add-ssh-key.sh (only run once when first setting up a new robot)
4. gulp
5. ./bin/start.sh
6. NOTE: The skill will take a moment to launch.
7. NOTE: After the skill loads, it will proceed through various tests for the robot designed to test correct functionality and operation, and help troubleshoot potential problems the different systems of Jibo might have.

NOTE: TBD how the skill will actually be initiated once ready during the manufacturing process, and also how it will be initiated when at a service/repair center without exposing the internals
# Packaging it up for buildroot


1. get the finished goods test on your computer (run the following commands)
  1. `git clone git@github.jibo.com:skills/fin-goods-test.git`
  1. `mv fin-goods-test jibo-finGoods-skill`
  1. `cd jibo-finGoods-skill`
  1. `npm i; npm run build; rm -rf node_modules; npm i --production`
1. package up for repository
  1. `cd` to directory where jibo-finGoods-skill directory lives
  1. type: `tar -czf jibo-finGoods-skill-<version>.tar.gz jibo-finGoods-skill`
  1. type: `scp jibo-finGoods-skill-<version>.tar.gz [USER_NAME]@repository.jibo.com:/data001/www/skills/`
  1. ssh onto repository.jibo.com and cd to /data001/www/skills (must have ldap permissions)
  1. type: `tar xf jibo-finGoods-skill-<version>.tar.gz -C .`
  1. remove .git
  1. type: `tar -czf jibo-finGoods-skill-<version>.tar.gz jibo-finGoods-skill` (make sure tar size is reasonable, ~10-~20MB)
  1. type: `shasum -a 256 jibo-finGoods-skill-<version>.tar.gz` (the output will be put into package .hash file)
  1. type: `chmod o+x jibo-finGoods-skill-<version>.tar.gz`
1. update buildroot
  1. cd into package/jibo-finGoods-skill/
  1. Make branch off of latest build. The branch name should be feature/name/branch
    1. Example: feature/russellk/finGoodsUpdate
  1. git checkout [branch name]
1. update package in your buildroot branch
  1. update the .hash file to use the new shasum you did in 2e and update the tar name
  (https://git.jibo.com/projects/PLAT/repos/buildroot.jibo/browse/package/jibo-finGoods-skill/jibo-finGoods-skill.hash)
  1. update the .mk file to specify the new version (used in the tar name)
  (https://git.jibo.com/projects/PLAT/repos/buildroot.jibo/browse/package/jibo-finGoods-skill/jibo-finGoods-skill.mk)
5. test buildroot with your branch
  1. cd to root directory
  1. make jibo-finGoods-skill-dirclean
  1. make jibo-fingoods-skill (make sure downloads and builds correctly)
  1. make
  1. flash robot and make sure skill runs correctly
6. notify Blair of your branch via JIRA ticket for latest build
  1. push branch to stash once tested
  1. put following information in JIRA ticket for latest build
    1. list changes
    1. branchname
    1. commit number
    1. notes

